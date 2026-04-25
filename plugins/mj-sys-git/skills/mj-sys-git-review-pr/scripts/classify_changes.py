"""
PR 变更文件分类器 — 参考框架

将 git diff --stat 输出的文件路径分类为 Code / SQL / Config / Docs / Other。
此脚本展示分类规则，供 review-pr skill 和人工参考。

使用方式:
    category = classify_file("src/CollectionNodes/NewService/domain/model.py")
    # => "Code"

    triggers = determine_triggers(["src/CollectionNodes/NewService/domain/model.py", "main.py"])
    # => ["D1", "D2", "D3"]

注意: classify_file 使用 PurePosixPath.match() 而非 fnmatch，
因为 fnmatch 不支持 ** 递归 glob 语义。输入路径应为 POSIX 格式（/）。
"""

from pathlib import PurePosixPath


# ============================================================
# 分类规则（pattern → category）
# 优先级：按列表顺序匹配，首个匹配生效
# ============================================================

CLASSIFICATION_RULES: dict[str, list[str]] = {
    "Code": [
        "src/**/*.py",
        "components/**/*.py",
        "main.py",
        "scripts/**/*.py",
        "test/**/*.py",
    ],
    "SQL": [
        "sql/**/*.sql",
        "sql/**/*.sh",
        "sql/**/*.ps1",
    ],
    "Config": [
        "*.yaml",
        "*.yml",
        "*.toml",
        ".env*",
        "docker-compose*",
        "docker/**",
        "Dockerfile*",
    ],
    "Docs": [
        "docs/**/*.md",
        "*.md",
    ],
}

# D5/D6 编号预留给未来的检查项（如测试覆盖、API 规范），
# 当前跳过以保持编号稳定性。

# ============================================================
# 触发矩阵：哪些变更触发哪些动态检查
# ============================================================

TRIGGER_MATRIX: dict[str, dict] = {
    "D1": {
        "description": "DDD 结构合规",
        "condition": "src/ 下有新服务目录",
        "detect": lambda files: _has_new_service_dir(files),
    },
    "D2": {
        "description": "ops 域完整性",
        "condition": "src/ 下有新服务目录",
        "detect": lambda files: _has_new_service_dir(files),
    },
    "D3": {
        "description": "服务注册与中间件",
        "condition": "main.py 有变更",
        "detect": lambda files: any(f == "main.py" for f in files),
    },
    "D4": {
        "description": "数据库变更合规",
        "condition": "sql/ 有变更",
        "detect": lambda files: any(f.startswith("sql/") for f in files),
    },
    "D7": {
        "description": "配置管理",
        "condition": "configuration/ 或 .env 有变更",
        "detect": lambda files: any(
            "configuration/" in f or f.startswith(".env") for f in files
        ),
    },
}


def classify_file(path: str) -> str:
    """将文件路径分类为 Code/SQL/Config/Docs/Other。

    使用 PurePosixPath.match() 支持 ** 递归 glob 匹配。
    输入路径应为 POSIX 格式（正斜杠）。
    """
    p = PurePosixPath(path)
    for category, patterns in CLASSIFICATION_RULES.items():
        for pattern in patterns:
            if p.match(pattern):
                return category
    return "Other"


def classify_all(files: list[str]) -> dict[str, list[str]]:
    """将文件列表按分类归组。"""
    result: dict[str, list[str]] = {
        "Code": [],
        "SQL": [],
        "Config": [],
        "Docs": [],
        "Other": [],
    }
    for f in files:
        category = classify_file(f)
        result[category].append(f)
    return result


def determine_triggers(changed_files: list[str]) -> list[str]:
    """根据变更文件确定要触发的动态检查项。"""
    triggered = []
    for check_id, config in TRIGGER_MATRIX.items():
        if config["detect"](changed_files):
            triggered.append(check_id)
    return triggered


def _has_new_service_dir(files: list[str]) -> bool:
    """检测 src/ 下是否有新服务目录的文件变更。

    局限性: 此函数仅通过路径深度启发式判断，无法区分"修改已有服务"和
    "新增服务"。在 SKILL.md Stage 3 中，skill agent 应结合
    `git diff --diff-filter=A` 或对比 base branch 的目录结构来判断
    是否为真正的新服务目录。
    """
    for f in files:
        if f.startswith("src/") and f.count("/") >= 3:
            return True
    return False
