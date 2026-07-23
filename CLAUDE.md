# MJ AgentLab Marketplace

通用 Claude Code 插件市场 — 教学方法论 + NotebookLM 多媒体集成的整合工具集，对外通用，已在 mj-system / mj-agent 两项目实战。

## Project Structure

- `plugins/` — **2 个通用插件**（v6.3.0 起；v4.0.0–v6.2.x 曾收敛为单 learn-kit）：
  - `learn-kit` v4.0.1（**v6.2.0 additive：3 skill 化** —— 在 v3.0.0–v3.1.0 单 skill `three-views` 之外加 `glossary`（六槽术语速记卡 ~150-250字）+ `concept`（六节概念深讲 ~500-800字，2 跨域正例 + 1 反例 + 失效边界）两个纯 prompt in-chat 解释 skill（单 SKILL.md，无 tool / 无 file / 无 MCP；frontmatter `name`+`description` only），填补 `three-views` 明确 disclaim 的 pure-explanation / Q&A niche；三 skill description 加 `Do not use for: …（use X）` routing clause；learn-kit picker 1→3 在 [docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md) 显式 reconcile。**v6.1.0 additive HITL expansion**：在 v3.0.0 单一 `three-views` skill 内加 Step 1.3 视角 multi-select（default 3 全选 / min 1）+ Step 4 升级 5-cell granular multi-select（HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map 独立勾选）+ Step 5B re-run guard `source_corpus_key` 等价性 + 3-level hint granularity；默认产物等同 v3.0.0；详见 [docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md](docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)）。**v6.0.0 BREAKING baseline**：5 skill 收敛为单 skill `three-views`——删 scaffold-learning/locate/scan/nlm-studio + 重命名 generate-tier → three-views；NLM artifact 范围 13 → max 10（删 infographic，mind_map 转 opt-in）；新增 URL 输入 + source_manifest 结构化追踪 + HTML dual-mode grounding；保留 nlm-studio 全套 dogfood防护；详见 [docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md](docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) + [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §6。历史 v2.x 5-skill 设计：scaffold-learning（一次性 bootstrap）+ locate/scan（discovery，算法保留为 plugin-internal [GUIDE]_LearnKit_Discovery_Recipes manual recipes）+ generate-tier（AI 三档）+ nlm-studio（NLM 多媒体）；v2.0.0 BREAKING init → scaffold-learning rename；v2.0.1 nlm-studio Chinese narration dual-lock）
  - `diagram-kit` v0.2.0（**v6.3.0 NEW plugin**——marketplace 史上首次 plugin 计数 1 → 2）：单 skill `arch-diagram`（`/diagram-kit:arch-diagram`）把代码库 / 系统的源事实转成证据绑定的 Mermaid 架构图，7 类（context / container / component / code〔C4 结构 L1–L4〕+ sequence / state-machine〔行为〕+ deployment〔物理〕），任意域；5-step 事实先行（L0–L3 阶梯，铁律每节点/边可追 `file:行号`）；bundle 9 份领域无关 references（progressive disclosure）+ 泛化 stdlib Mermaid validator（`validate_diagram.py`，去 PG 专属 ROLE-03 + SLUG regex 通用化 `struct-l[1234]|dyn|phys`，与 PG 版双源分叉）；无 MCP / 无 network；generated 图用 `text` 围栏不自动渲染。与 learn-kit 功能正交（一个出架构图、一个出学习材料），8→3→1 收敛方向经 domain-orthogonality reconcile，详见 [docs/adr/[ADR]_Diagram_Kit_Addition.md](docs/adr/[ADR]_Diagram_Kit_Addition.md)
- `scripts/` — 基础设施脚本（bump-version, install-hooks, validate-commits, clone-bare；**dual-host 起**新增 Node 工具链：`validate-dual-host.mjs` / `run-cli.mjs` / `check-tool-versions.mjs`）
- `.claude-plugin/marketplace.json` — 市场元数据（版本 + 插件注册表）；**Claude Code SSOT，权威源**
- `.agents/plugins/marketplace.json` — **Codex 原生 catalog（dual-host wrapper 起新增）**：镜像 legacy catalog 的插件集合 / 顺序 / 名称 / local source，但**不保存版本**（版本只由 manifest 持有）；`learn-kit` 固定 `ON_USE`（认证只服务用户显式 opt-in 的 NLM 分支，不得在安装或纯 Markdown/HTML 使用时暗示必须登录），`diagram-kit` 为 `ON_INSTALL`
- `tests/` — **Node stdlib 测试（dual-host 起新增）**，`npm test` 入口
- `VERSION` — 市场整体版本号（权威源）
- `docs/` — 项目文档（见 [INDEX.md](docs/INDEX.md)），含 rule / guide / runbook / adr / spec 5 子目录 + 迁移指引 [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)

## Key Conventions

- **Bare repo worktree model**: 每个分支对应独立 worktree 目录，不使用 `git checkout`
- **Dual-layer versioning**: marketplace 整体版本（`VERSION`）和各插件版本（`plugin.json`）独立管理
- **Develop post-release pre-bump (v4.6.1 起)**: 每次 release + sync-main-to-develop 完成后，在 `develop` 上额外 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit；保证 `develop VERSION > main VERSION` 恒成立。Pure patch 风格无 `-dev` 后缀；只 bump 顶层 VERSION，不连带 plugin.json。详见 [docs/adr/[ADR]_Develop_PreBump_Adoption.md](docs/adr/[ADR]_Develop_PreBump_Adoption.md) + [docs/runbook/[RUNBOOK]_Release_Operations.md](docs/runbook/[RUNBOOK]_Release_Operations.md) §3.7。
- **Develop README badge 语义**：`develop` 分支的 Version badge = 预计下一个 release 号（因 post-release pre-bump 机制）；实际已发布版本以 GitHub Releases / `main` 分支 badge 为准。
- **Commit format**: `<type>(<scope>): <summary>` — types: feat, fix, perf, refactor, test, docs, infra
- **Branch types**: feature/, bugfix/, documentation/, maintain/, hotfix/

## Plugin Structure

每个插件遵循官方 Claude Code plugin spec：

```
<plugin>/
├── .claude-plugin/plugin.json   # 插件元数据（必须位于此子目录）
├── .mcp.json                    # MCP 服务器定义（可选）
├── CLAUDE.md                    # 插件概述（可选）
├── README.md                    # 用户指南
├── CHANGELOG.md                 # 变更日志
├── LICENSE                      # 许可证文件
└── skills/                      # 技能目录（自动发现）
    └── <skill-name>/
        ├── SKILL.md
        ├── templates/           # 可选
        ├── references/          # 可选
        └── scripts/             # 可选
```

**v3.0.0 起遵守的官方约束**：

- `plugin.json` 必须位于 `.claude-plugin/` 子目录（不在 plugin 根目录）
- 优先用 SKILL（不用 COMMAND，commands 是 legacy）
- 模板 / references / scripts 放在 skill 目录内部
- 不使用 `components` 字段（auto-discovery 标准）

### Dual-host（Claude Code + Codex）包装

每插件在 legacy `.claude-plugin/` 之外**并存**一份 Codex 原生包装；两者必须持续一致，由 `npm run validate:dual-host` 强制：

```
<plugin>/
├── .claude-plugin/plugin.json   # Claude Code SSOT（权威源）
├── .codex-plugin/plugin.json    # Codex 原生 manifest
├── .mcp.json                    # 仅 learn-kit；命令指向本仓 bridge
└── skills/<skill>/
    ├── SKILL.md                 # 双宿主共享
    └── agents/openai.yaml       # Codex skill UI metadata
```

- **双 manifest 一致性**：`name` / `version` / `author` / `repository` / `license` / `skills` 必须精确一致；native `keywords` 是 legacy 的非空子集；native `description` **有意**更短且宿主中性，不要求逐字一致。
- **Codex 限定值域**：`.codex-plugin` 的 `interface.defaultPrompt` 最多 3 条 × 128 字符 string array；`openai.yaml` 的 `interface.default_prompt` 是 **scalar**。两层都必须使用 **qualified 名** `$learn-kit:three-views` / `$diagram-kit:arch-diagram` —— Codex 把 plugin skill 注册为 `plugin:skill` 且 `$` 注入按完整名精确匹配，裸 `$three-views` **永不解析**。
- **description 双门**：Claude Code 在 **1536** 字符处截断注入的 description；Codex 自带 skill validator 拒绝 `<` / `>` 且上限 **1024**。本仓按更严的交集撰写（当前四份 664–882 字符，无角括号）。dual-host 前四份为 1197–1461 字符——全部低于 Claude 1536 但**全部超过 Codex 1024**，故收紧的动因是 Codex 侧截断（触发正确性），不是 Claude 侧；`glossary` 曾达 1544 触发 Claude 截断，那是 **v6.3.1 已修复的历史**（见下方版本记录），非 dual-host 的动因。
- **能力收窄**（仅约束声明了 MCP 工具的 skill，即 `three-views`）：只预授权 6 个 NotebookLM 业务工具（由 8 收窄，删 `refresh_auth`〔会校验默认 profile / 可能触发 headless auth〕与 `server_info`〔远端探测〕）；`source_delete`（不需要的破坏性能力）本就不在预授权内，其排除意义在 **bridge public surface** 而非本次删除。三者同列 validator denylist 作回归防护。不得预授权通用 `Bash`（含 `Bash(*)` 等通配授权——它比裸 `Bash` **更宽**却不含字面 token，故检查必须是 allowlist）或 installer，只允许 scoped hash-helper 权限。`arch-diagram` 不声明 MCP 工具，其裸 `Bash`（用于跑 bundled Python validator）**不受此约束**。
- **`agents/openai.yaml` 一律省略 `dependencies.tools`**：该 schema 无 optional 语义，而 NotebookLM 是 opt-in；MCP server 改由 native manifest 的 `mcpServers` 聚合。
- **baseline 版本语义**：Codex / uv / bridge / connector 精确 pin（供应链输入）；**Claude Code CLI 为最小版本 `>=`**（外部滚动发布的宿主二进制，不进 wheel/lock，精确 pin 会因上游自动更新而无谓红 CI）。

### NLM bridge 锁 / 契约快照 / 运行时包（`plugins/learn-kit/nlm-bridge/`，NLM 可选分支专用）

learn-kit 的 NLM 分支经本仓 `learn-kit-nlm-bridge` 4.0.0 连接固定版本上游 `notebooklm-mcp-cli==0.8.7`。两份 lock 与四份 `_data` 契约由**唯一生成入口** [`scripts/generate-nlm-contract.mjs`](scripts/generate-nlm-contract.mjs)（4 mode：`runtime-lock` / `build-lock` / `snapshots` / `all`）产出，禁止手改（手改会使 hash 集不再对应任何 resolver 真实产物，`--require-hashes` 的保证随之落空）：

- `requirements/notebooklm-mcp-cli-0.8.7-py312.lock.txt` — connector 完整 runtime closure（77 包 / 850 hash），**不含 bridge wheel 自身**
- `constraints/build-hatchling-1.27.0-py312.txt` — 构建期 hatchling closure（5 包），与 runtime closure 严格分离，绝不装进 runtime env
- `src/learn_kit_nlm_bridge/_data/` 四份契约（随 wheel 发布，运行时经 `importlib.resources` 读取校验）：
  - `public-tools-v1.json` — **唯一手写**的最小权限策略（6 工具收窄 schema）。generator 只 canonicalize / validate / hash，**绝不从上游自动扩大**；扩权只能是一次被 review 的人工 diff。实测narrowing 的必要性：上游 `studio_create.source_ids` 可缺省且 `_resolve_source_ids` 对 falsy 值（`None` **与空数组**）一律回退为 notebook 全部 source
  - `upstream-tools-v0.8.7.json` — 上游在固定 env 下 `tools/list` 的真实产出（实测：14 组全禁 + 6 工具单独 re-enable → 恰好 6 工具、单页无 cursor、零凭据零网络）
  - `upstream-auth-guard-v0.8.7.json` — auth 恢复路径 4 个符号的源码指纹（`replaced` / `sentinel` / `depended_on`），漂移即在联网前 fail closed
  - `environment-lock.json` — 规范化 runtime closure + markers + 两份 lock 与三份契约的 SHA-256 + 可重放 argv。**刻意不记录 exact Python patch**（patch 在 `3.12.*` 内自由浮动且 Windows/Ubuntu matrix 必然不同，写死会让 checked-in 文件在别的机器上 `--check` 必挂；exact 值只在运行时由 receipt / Gate fingerprint 绑定）
- `tools/generate_contract_snapshots.py` — 在临时 venv（locked closure + `--require-hashes`）内跑的指纹器：驱动**真实 stdio MCP 握手**取 `tools/list`（而非 introspect registry —— 运行时比对的对象就是 MCP 响应），并抽取 auth 符号源码 SHA（canonical LF）
- `npm run generate:nlm-contract`（= `all`）重新生成；`npm run check:nlm-contract-generated` 在 CI 做 byte-compare（漂移即 exit 1）。`all` 顺序固定 **locks → snapshots**：snapshots 要从 runtime lock 装环境并记录两份 lock 的 hash，必须看到刚写入的内容

[`.gitattributes`](plugins/learn-kit/nlm-bridge/.gitattributes)（本子树限定）把两份 lock 与四份 `_data` 钉为 **`eol=lf`**：仓库无根 `.gitattributes` 且本机 / GitHub Actions `windows-latest` 均 `core.autocrlf=true`，否则 Windows checkout 会把它们重写成 CRLF —— 既让 `--check`（uv 恒输出 LF）必挂，更会使同一份契约在 Windows 与 Ubuntu 上产生**两个不同 SHA**，五-SHA 绑定跨 baseline matrix 无法成立。作用域刻意限于本子树：根级 `* text=auto eol=lf` 会 renormalize 全仓。

**cutoff = `2026-07-16T00:00:00Z`**（固定过去时刻，冻结传递闭包）。计划原文写 `2026-07-15T00:00:00Z`，该值**不可用** —— PyPI 于 `2026-07-15T01:31:19.945Z` 发布 0.8.7，比 cutoff 晚 91 分钟，会把本仓 pin 的这一版本本身过滤掉导致解析失败。

`pyproject.toml` **不声明任何 `[project.scripts]`**：上游已占用 `nlm` / `notebooklm-mcp` 两个 console script 名，若本包再声明同名 entry point，同一 venv 内两个 distribution 争抢、由安装顺序决定胜者。公开的 `learn-kit-nlm-bridge` 与受限 `nlm` 只能由 installer 创建为直指 module 的受控 shim，不参与 wheel entry-point 解析。

**用户手动 installer [`plugins/learn-kit/scripts/install-nlm-bridge.mjs`](plugins/learn-kit/scripts/install-nlm-bridge.mjs)（Node stdlib-only，随 plugin 发布故不得 import repo devDeps / `run-cli.mjs`；**不在**任何 skill 权限面，agent 只能打印命令、用户在终端手工跑）**。`install` 子命令：只接受计划内固定 wheel/checksum URL → HTTPS-only 有限 redirect（≤5、不降级、final host 限 `github.com` / `objects.githubusercontent.com` / `release-assets.githubusercontent.com`）+ size/timeout 上限 → 严格解析 checksum（唯一一行 `<64hex>  <wheel>\n`，拒 BOM/CRLF）→ 校验 wheel bytes → 合成 ephemeral full lock（**checked-in runtime lock + 本地 verified wheel 的 direct-file `@ file:// --hash`**，实测 uv 接受，`--require-hashes --no-build` 全离线过）→ 从空构建的 scrubbed uv env（清 `UV_*`/`PIP_*`/`PYTHON*`/proxy/index、注入私有 `UV_CACHE_DIR` + PyPI 默认 index）里 `uv venv --python 3.12 --no-python-downloads` + `uv pip install --require-hashes --no-build` → 安装后校验 Python patch / closure / `_data` vs `RECORD` → 原子写 `install-receipt.json`（逐字段产出 `contract.py` 消费的 schema：五-SHA + installer/uv/wheel/lock SHA + 两 shim `{path,sha256,target}`）→ **只在全通过后**创建两 shim（Win `.cmd` 相对 `%~dp0..` CRLF / POSIX extensionless `/bin/sh` 绝对路径 LF mode 0755）；任一步失败 fail-closed 回滚 staged venv/shim。装前 collision 检测（extensionless + PATHEXT + `.ps1`，managed bin 及**前序 PATH** 的 foreign launcher 一律拒），**无 `--force`**，已有 shim 仅 byte 全等才幂等保留；`uninstall` 先按 receipt 校验 ownership/containment 再删，绝不删不匹配路径。纯路径逻辑按 target-platform（`path.win32`/`path.posix`）构造以便双平台 byte 可测；deps 注入（fake `httpRequest`/`runUv`/temp-root `env`）**无 env / 隐藏 flag test mode**，只有真人 CLI 触发真实用户目录 mutation。测试 `tests/install-nlm-bridge.test.mjs`（含 `REQUIRE_PYTHON` gate 的真实离线端到端：构建 wheel → 服务 → 装 → 校验 receipt/shim/`--contract-json` → uninstall）。

**运行时 Python 包 `src/learn_kit_nlm_bridge/`（6 module，消费上面的契约；随 wheel 发布，`_data` 经 `importlib.resources` 读取）**：

- `contract.py` — **纯 stdlib** 本地契约（`--contract-json` preflight 从此产出，Gate A 前唯一 bridge 探针）：canonical JSON / SHA 与 generator 逐字节一致；五-SHA 链交叉校验（`environment-lock.json` 为锚 → 三份 `_data` 契约 + 两份 lock + install receipt）；`importlib.metadata` 校验 installed closure；按 `sys.executable` 上溯定位并校验 `install-receipt.json`。不 import 上游 / FastMCP
- `bridge.py` — host 端 MCP host（stdio，状态机 `NEW → INITIALIZE_RESPONDED → READY → CLOSED`）：initialize / ping / **单页** tools/list 纯本地回答 + 自有 safe instructions（丢弃上游"跑 `nlm login`"指令）；**首次合法 tools/call 才 lazy-spawn** guarded child；fixed-subset schema adapter（**非通用 JSON-Schema 引擎**，遇未列白名单关键字即 fail closed）+ per-tool inject allowlist；child env 从零构建（仅 OS/home/temp/locale + snapshot 的 pinned `NOTEBOOKLM_*`）；child `tools/list` 比对 `tools_sha256`、反向 request、cursor loop 一律 fail closed；上游认证失败规范化为**无凭据** `AUTH_REQUIRED` 后终止 child；stderr 有界 ring + 脱敏
- `upstream_runner.py` — guarded child（`sys.executable -I -X utf8 -m …upstream_runner`）：联网前校验 distribution==`0.8.7` + 4 符号 canonical-LF 源码 SHA → **仅在精确匹配后**把 `BaseClient._try_reload_or_headless_auth` 换成"只磁盘 reload、绝不 headless"、把 `auth_browser` / `cdp` 的 `run_headless_auth` 换成 fail-closed sentinel → `runpy` 起 `notebooklm_tools.mcp.server`；`--audit` 模式（仅 CI/人工 conformance）import 上游前装 record-only 审计钩子
- `login.py` — 受限 login shim target：仅接受 `login`（**唯一** import 上游、**唯一**许可开浏览器的 user-run 路径）或 `--contract-json`（receipt/interpreter/shim 子集，stdlib-only）；`login switch` / profile / account / `--version` / 多余参数一律在 import 上游前拒绝
- `__main__.py` — dispatch：无参→server / `--contract-json` / `--verify-upstream-contract` / `--verify-auth-required`（后两者仅 CI/人工隔离验收，永不授予 skill）
- **Gate A/B 非可信授权边界**：bridge 无用户签名 unlock token，不能证明真人同意、也不能阻止直接 tool call；只降低意外提前启动与能力扩张风险，发现漂移即 fail closed
- 测试：`tests/learn-kit-nlm-bridge.test.mjs`（Node 端到端 stdio，`REQUIRE_PYTHON=1` gate，venv 形如生产私有环境=hashed closure + editable bridge）+ 不随 wheel 发布的 `nlm-bridge/tests/test_internals.py`（Python white-box：auth guard patch / 6 adapter 正反 fixture / ChildClient drift·loop·reverse-request / AUTH 识别器）

**外层 conformance 探针 [`scripts/probe-learn-kit-nlm-bridge.mjs`](scripts/probe-learn-kit-nlm-bridge.mjs)（`npm run smoke:nlm-contract`，`--config .mcp.json --server notebooklm-mcp --mode bootstrap|upstream-contract|auth-required|all`）**：每 mode 都在 OS-temp 隔离 home（重定向 HOME/USERPROFILE/XDG_CONFIG_HOME/APPDATA/LOCALAPPDATA/TEMP/TMP，`finally` containment-check 后杀进程树 + 清 temp）里驱动 bridge，OS 层监控进程树（`isThreatChild`=browser image/cmdline 或 nlm/notebooklm login launcher image；uv venv python launcher 与 guarded runner **不**算威胁）+ 外部连接 + 凭据 sentinel 泄漏。`bootstrap` 做 initialize/ping/tools-list 断言自有 safe instructions + 精确 6 工具 + 零威胁 child/网络（无凭据 + synthetic sentinel 两态）；`upstream-contract` / `auth-required` 跑 bridge 的 `--verify-*` 并判 exit + report（`tools_verified` / 双 `AUTH_REQUIRED` / audit egress family——loopback asyncio self-pipe 的 `socket.connect`/`bind`/`__new__` 属良性，`ssl.`/`http.client.`/`urllib.`/`socket.getaddrinfo`/`subprocess.`/`webbrowser` 才算 egress/spawn）。exit：config/server/JSON/harness→2，contract/runtime→1。纯判定 `judgeVerifyResult` 与 fake-bridge（`tests/helpers/fake-nlm-bridge.mjs`）+ 真 venv 三 mode 覆盖于 `tests/probe-learn-kit-nlm-bridge.test.mjs`

## Documentation Framework (v4.2.0 起；当前 v1.8 / marketplace v7.0.1)

marketplace 文档体系遵循以下三层 STANDARD（位于 `docs/rule/`）:

- **[Documentation Framework](docs/rule/[STANDARD]_Documentation_Framework.md)** v1.8 — 6 tag prefixes（STANDARD/ADR/GUIDE/RUNBOOK/SPEC/POSTMORTEM）+ 8-field frontmatter + 3-state machine + path stability + INDEX sync；v1.5 起取消 §1 豁免机制保留 5 类 community/external-spec hard exclusion；v1.6 新增 §1.1 root-level named files 正向 codification（5 files 各自固定责任 + Source of exclusion 列）+ §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate；**v1.7 A6 gate 真正阻断**——实现迁至独立 [`.github/workflows/a6.yml`](.github/workflows/a6.yml) + Node stdlib-only [`scripts/check-a6.mjs`](scripts/check-a6.mjs)（单测钉死），修复 v1.6 实现「`[skip a6]` 仅凭 PR title 即放行、从不校验 sign-off」等 4 处缺陷，§2.7 trigger 3 → 4 类（加 Codex dual-native surfaces）；**v1.8** §2.7 Category 4 A6 trigger set 补 `run-release.mjs` + `release-verify-install.mjs`（release 编排器 + install 校验器与 `resolve-release-state.mjs` 同级；触发面 3 → 5 release 脚本，category 结构不变——发现于 v7.0.0 release 收尾）
- **[Commit Message Convention](docs/rule/[STANDARD]_Commit_Message_Convention.md)** v1.2 — `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist（v1.2 起加 `diagram-kit` plugin scope）+ branch-type matrix + §11 Common Mistakes
- **[GitHub Markdown](docs/rule/[STANDARD]_GitHub_Markdown.md)** — ATX headings + GFM tables + native alerts + frontmatter syntax

文档目录子结构（v4.6.3 起 v1.6 §1.1 root-level named files 编码完整）:

```
docs/
├── INDEX.md            # 唯一豁免 frontmatter (Framework v1.5 §1 INDEX special clause)
├── rule/        — STANDARDs (Framework / Commit / GitHub Markdown / HITL Prompt 4 active)
├── guide/       — GUIDEs (Migration_From_v3_to_v4 / Marketplace_Project_Overview / Plugin_Development_Testing_Workflow / Version_Management / Marketplace_Agent_Execution_Checklist 5 active；Contributing 自 v4.6.3 回 repo root)
├── runbook/     — RUNBOOKs (Release_Operations / Doc_Archive_Procedure / Codex_Dual_Native_Manual_Acceptance 3 active)
├── adr/         — ADRs (v4.5.0 加 Exemption Reversal v1.1；v4.6.1 加 Develop_PreBump_Adoption；v4.6.3 加 Root_Level_Named_Files_Codification)
├── spec/        — SPECs (2 seeds in v4.2.0)
├── postmortem/  — POSTMORTEM (v4.6.2 add Bulk_Cleanup_Trap_Analysis P3)
├── archive/     — flat layout (Framework v1.4 §2.3.5；`[DEPRECATED]_[TAG]_*_vX.Y.md` 命名)
└── _templates/  — 6 templates (TEMPLATE_{STANDARD,ADR,GUIDE,RUNBOOK,SPEC,POSTMORTEM}.md)
```

**v4.6.3 起 Root-Level Named Files**（per Framework v1.6 §1.1）：仓库根目录 5 个 named special files 各承担固定独立责任，免 `[TAG]_` prefix 约束：

- [`README.md`](README.md) — GitHub 公开入口（badges + TL;DR + 插件目录 + quick-start + 链路）
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — 贡献入口（branch / commit / version / PR / hooks；v4.6.3 起回 root 触发 GitHub New Issue/PR auto-prompt）
- [`CHANGELOG.md`](CHANGELOG.md) — Keep-a-Changelog 发布日志
- [`GLOSSARY.md`](GLOSSARY.md) — marketplace 术语词典（v4.6.3 新建；按字母顺序术语 → 1 句定义）
- `CLAUDE.md`（本文件）— AI agent + 维护者上下文摘要

`CLAUDE.md` 内容受 [§2.7 Sync Allowlist](docs/rule/[STANDARD]_Documentation_Framework.md#§27-claudemd-sync-allowlist-v16-new) 约束：触及 global standards（`docs/rule/[STANDARD]_*.md`）/ runtime info（`VERSION` + `marketplace.json` + plugin.json major/minor）/ directory entries（`.claude/skills/mp-*/` + plugin skill dirs + `docs/` 子目录结构变更）/ **Codex dual-native surfaces**（`.agents/plugins/marketplace.json` + `plugins/*/.codex-plugin/plugin.json` + `plugins/*/skills/*/agents/openai.yaml` + learn-kit `.mcp.json` + `nlm-bridge/**` + installer + 5 个 release/contract 脚本（`generate-nlm-contract` / `probe-learn-kit-nlm-bridge` / `resolve-release-state` / `run-release` / `release-verify-install`）；v1.7 新增 Category 4，v1.8 补后两个 release 脚本）的 PR 必须同步本文件。

A6 gate 由 [`.github/workflows/a6.yml`](.github/workflows/a6.yml) 阻断。绕过需**同时**满足：PR title 含 `[skip a6]` 字面量 **且** 非作者的 OWNER/MEMBER/COLLABORATOR reviewer 对**当前 head SHA** 提交 `APPROVED` review、body 精确等于 `A6 N/A confirmed`。v1.7 前 sign-off 从未被校验（仅 title 即放行）；force-push 后旧 approval 不顺延，须重新 approve。

> [!NOTE]
> **Branch ruleset required checks（2026-07-16 修复）**：`protect-develop` → `Validate Structure` + `A6 / Check`；`protect-main` → `Validate Structure`。此前二者分别要求 `build` / `release` 两个不由任何 workflow 产出的 context，导致所有 CI gate 都不阻断 merge。**改 workflow job 的 `name:` 就是改 check context —— 必须同步 ruleset，否则 gate 静默降级为红叉提示**（GitHub 对引用不存在的 context 不报错）。详见 Framework §4.3.1 IMPORTANT。

Templates 与 mp-doc-author skill 协作起草新文档；mp-doc-validate skill 审计合规（v4.6.3 起含 Step 3.5 CLAUDE.md sync Warning 检测）。详见 [docs/INDEX.md](docs/INDEX.md)。

## v4.0.0 Restructure Note

2026-05-14 marketplace 从 v3.2.1 → v4.0.0 重构：

- **删除** `notebooklm-kit` 整个插件（含 7 个 skill: auth / build / studio / learn-make / learn-test / manage / query 以及 nlm-shared/ 10 份共享参考）—— quiz / flashcards / cross-notebook query / source 管理等场景永久放弃
- **迁** `plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`（server name `notebooklm-mcp` 不变；工具前缀自然变为 `mcp__plugin_learn-kit_notebooklm-mcp__*`）
- **新增** `plugins/learn-kit/skills/nlm-studio/` — `/learn-kit:nlm-studio <topic>` skill：把 `learning/<topic>/` 的 3 markdown 上传 NotebookLM 出 13 个多媒体 artifact（4 view-cycled 类型 audio + video + slide_deck + infographic × foundation/structural/challenge = 12 + 1 shared view-agnostic mind_map）。HTML 不上传（dogfood 验证 NLM 拒收）。9 个 prompt 模板组合实现 View-Purpose Preservation 原则（view-prefix 5 段必备 / artifact-suffix 格式约束 / interaction-overrides YAML 处理 4 个 view × artifact 高耦合 cell；mind_map 因 NLM 媒介限制 view-agnostic 不在 cartesian 中）
- **改** `/learn-kit:generate-tier` 工作流 8-step → 10-step：HTML 渲染（step 8）后加 optional step 9 询问是否调 nlm-studio（默认 skip，opt-in）；原 step 9 (Summary) 改名 step 10
- **bump** learn-kit `0.3.1 → 1.0.0`（major：新增 MCP 依赖 + 首个 stable 版本）；marketplace `3.2.1 → 4.0.0`（major：删插件 + 跟随 v3.0.0 删 5 个插件先例）
- 决策记录：[docs/adr/[ADR]_NotebookLM_Kit_Retirement.md](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md)
- 用户迁移：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §v3.2.x → v4.0.0

**Plugin Secrets Management**：v4.0.0 无 secrets 配置需求。learn-kit 的 nlm-studio 通过 `notebooklm-mcp` MCP server 直接调用，认证使用 NotebookLM OAuth（用户在终端 `nlm login` 一次完成）；其余 4 个 skill 纯静态模板 / 本地文件操作，无凭据。

## 历史版本记录（保留供参考）

- **v3.0.0**（2026-05-11）：从 "MJ System 团队专属" 改为 "通用工具集"；删 5 个 MJ-system 专属插件；mj-nlm → notebooklm-kit 重命名；新增 learn-kit
- **v3.1.0**（2026-05-11）：learn-kit v0.1.0 → v0.2.0；新增 locate + scan 两个 discovery skill
- **v3.2.0**（2026-05-13）：learn-kit v0.2.0 → v0.3.0；新增 generate-tier AI 三档生成 + 交互式 HTML；learn-kit 主动与 notebooklm-kit 解绑
- **v3.2.1**（2026-05-14）：plugin.json `repository` schema 修正
- **v4.0.0**（2026-05-14）：notebooklm-kit 退场 + nlm-studio 吸收到 learn-kit；marketplace 收敛到 1 个 plugin
- **v4.1.0**（2026-05-15）：项目本地 18 件 mp-* skill 入库（mp-flow-* × 9 + mp-git-* × 6 + mp-doc-* × 3）；11 阶段速查表稳定
- **v4.2.0**（2026-05-15）：Documentation Framework v1.0 入库；3 STANDARDs（Framework / Commit / GitHub Markdown）+ INDEX + 6 templates 落地
- **v4.3.x – v4.4.11**（2026-05-15）：framework refinement / docs reorg / hook + CI consolidation / archive 机制 v4.4.0 引入 + v4.4.x flat layout
- **v4.5.0**（2026-05-18）：Framework v1.4 → v1.5 取消 §1 豁免机制；HITL v1.3 → v1.4 §0 universal skeleton 内化；learn-kit v1.1.0 → v1.2.0 教学文档 6 → 2 [GUIDE] 合并；marketplace 独立性原则确立；8-layer commit-validation stack 完工
- **v4.6.x**（2026-05-18）：v4.6.1 develop post-release pre-bump 机制 (per [ADR]_Develop_PreBump_Adoption)；v4.6.2 POSTMORTEM Bulk_Cleanup_Trap_Analysis P3 + bump-version script regex fix；v4.6.3 Framework v1.5 → v1.6 root-level named files codification + §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate + Reversal ADR v1.0 → v1.1 amendment + CONTRIBUTING.md restore to root + GLOSSARY.md create + [GUIDE]_Contributing archive ceremony
- **v5.0.0**（2026-05-18）：**BREAKING** — learn-kit `1.2.1 → 2.0.0` scaffold skill `init` → `scaffold-learning` 物理重命名（消除与 Claude Code 内置 `/init` 的 slash-picker 冲突；详见 [`[ADR]_LearnKit_Init_Skill_Rename`](docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md) + Migration §5）；同 release 吸收 v4.6.3 [Unreleased] 的 Framework v1.6 工作（Stream 2，由 BREAKING 触发的 major bump 吞掉原计划 v4.6.3 patch）
- **v5.0.1**（2026-05-18）：post-release develop pre-bump (post-v5.0.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 2.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v5.0.1 release**（2026-05-19）：`mp-git-sync` side-loop sync skill 落地（mp-git-* family 6 → 7；3 mode：dev-sync / hotfix-backmerge / self-update；10 条 H-code HITL 网格 + H8 bare-worktree config 漂移自动修复 PowerShell 脚本）；post-v5.0.0 housekeeping CLAUDE.md A6 gate sync 一并入版本节。无 plugin 版本变化（learn-kit `2.0.0` dual-layer 独立）
- **v5.0.2**（2026-05-19）：post-release develop pre-bump (post-v5.0.1)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 2.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v6.0.0**（2026-05-28）：**BREAKING** — learn-kit `2.0.1 → 3.0.0` 5 skill 收敛为单一 `three-views` skill（删 scaffold-learning / locate / scan / nlm-studio + 重命名 generate-tier → three-views；NLM artifact 默认 max 10（9 view-cycled + 1 optional mind_map），infographic 永久退场；新增 URL 输入 + source_manifest 结构化追踪 + HTML dual-mode grounding；保 nlm-studio 全 dogfood防护）；marketplace `5.0.2 → 6.0.0` 跟随 plugin major + 5 个 user-facing slash command 消失/重命名 = consumer-facing API breaking；详见 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) + Migration §6；新增 plugin-internal [`[GUIDE]_LearnKit_Discovery_Recipes`](plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md) 保留 v2.x locate/scan 算法为 manual recipes
- **v6.0.0 release**（2026-05-29）：marketplace 6.0.0 release.yml 自动 tag v6.0.0 + GitHub Release published；release/v6.0.0 branch 加 1 marker commit（CHANGELOG 加 inherited 2.0.1 fix subsection + Notes 加 dual-version-chain 说明：learn-kit `2.0.0 → 2.0.1 → 3.0.0` 双链合并 + marketplace `5.0.1 → 6.0.0` 跳过 5.0.2 pre-bump-only 中间态）。无 plugin 版本变化（learn-kit `3.0.0` dual-layer 独立）
- **v6.0.1**（2026-05-29）：post-release develop pre-bump (post-v6.0.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v6.1.0**（2026-05-29）：learn-kit `3.0.0 → 3.1.0`（minor，additive HITL gate 扩展）：Step 1 新增 tier multi-select（Step 1.3，default 3 全选，min 1）；Step 4 重设计为 5-cell granular multi-select（HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map，默认全不选；per-type NLM 控制前移）；Step 3/5A/5B 循环泛化为 `generated_tiers` 子集；Step 5B re-run guard 加 `source_corpus_key` 等价性检查（partial-rerun 防 source-corpus contamination）；Quota gate adaptive `N = len(generated_tiers) × len(view-cycled types) + (1 if mind_map)`；"Pick single view" → "Pick single tier" 重命名 + 退化条件隐藏；`templates/artifact-mind_map.md` 改 "across all three tiers" → "selected source corpus"；frontmatter `generator @3.0.0 → @3.1.0`；3-level hint granularity（explicit-type / generic-NLM / no-hint）。默认产物等同 v3.0.0；交互流程多 1 个 tier confirmation gate。marketplace VERSION + metadata.version 跟随 plugin minor 升 `6.0.1 → 6.1.0`（消耗 pre-bump slot 并跟进 plugin minor，historical pattern v3.1.0/v3.2.0/v4.5.0）。详见 [`[ADR]_LearnKit_ThreeViews_HITL_Expansion`](docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)
- **v6.1.0 release**（2026-05-29）：marketplace 6.1.0 release.yml 自动 tag v6.1.0 + GitHub Release published；release/v6.1.0 branch 加 1 marker commit（root CHANGELOG `[Unreleased]` → `[6.1.0] - 2026-05-29` transform，包含 v3.1.0 Added/Changed/Notes 完整 release notes 由 release.yml 抽取上 GitHub Release）。无 plugin 版本变化（learn-kit `3.1.0` dual-layer 独立）
- **v6.1.1**（2026-05-29）：post-release develop pre-bump (post-v6.1.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.1.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 / Check（v5.0.2 / v6.0.1 pre-bump 同款 2-commit-in-1-PR pattern）
- **v6.2.0**（2026-06-02）：learn-kit `3.1.0 → 3.2.0`（minor，additive）：加 `glossary`（`/learn-kit:glossary`；六槽 150–250字 术语速记卡）+ `concept`（`/learn-kit:concept`；六节 500–800字 概念深讲，2 跨域正例 + 1 反例 + 失效边界）两个纯 prompt in-chat 解释 skill（单 SKILL.md，无 tool / 无 templates / 无 MCP / 无 file I/O；frontmatter `name`+`description` only，与 tool-light mp-* 同款约定）。填补 `three-views` 明确 disclaim 的 "pure explanation / Q&A" niche；三 skill description 加仓库签名式 `Do not use for: …（use X）` routing clause。learn-kit slash picker 1→3——显式 reconcile v6.0.0 consolidation 的 "1 候选" 收益（删的是低价值 pipeline helper，加的是高价值正交工具）。marketplace VERSION + metadata.version 跟随 plugin minor 升 `6.1.1 → 6.2.0`（消耗 pre-bump slot + 跟进 plugin minor，historical pattern v3.1.0/v3.2.0/v6.1.0）。`three-views` 不动；默认行为不变。源自一个独立两-skill bundle 近-verbatim 集成（仅改集成层：slash 命名空间 + routing clause + frontmatter 规范化）。详见 [`[ADR]_LearnKit_Explanation_Skills_Addition`](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)
- **v6.2.1**（2026-06-02）：post-release develop pre-bump (post-v6.2.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.2.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 / Check（v5.0.2 / v6.0.1 / v6.1.1 pre-bump 同款 2-commit-in-1-PR pattern）
- **v6.3.0**（2026-06-05）：**NEW plugin `diagram-kit 0.1.0`**——marketplace 史上首次 plugin 计数 **1 → 2**（逆转 8→3→1 收敛方向，经 domain-orthogonality reconcile：arch-diagram 与 learn-kit 教学域正交、无法内化进 pedagogy kit，开新 plugin 是正确切分；判据是域归属非 plugin 计数，详见 [`[ADR]_Diagram_Kit_Addition`](docs/adr/[ADR]_Diagram_Kit_Addition.md) §2.2）。单 skill `arch-diagram`（`/diagram-kit:arch-diagram`）：5-step 事实先行（L0–L3 阶梯，铁律每节点/边可追 `file:行号`）把代码库事实转成证据绑定 Mermaid 图，7 类（context/container/component/code〔C4 结构〕+ sequence/state-machine〔行为〕+ deployment〔物理〕），任意域；bundle 9 份领域无关 references + 泛化 stdlib validator（去 PG ROLE-03 + SLUG regex 通用化 `struct-l[1234]|dyn|phys`，与 PG 版双源分叉）；generated 图 `text` 围栏；无 MCP / network。marketplace `6.2.1 → 6.3.0`（minor，additive plugin per [SPEC]_Marketplace_Json_Schema §4.2，消耗 post-v6.2.0 pre-bump slot 落实为真 minor）；commit STANDARD `v1.1 → v1.2`（scope 白名单加 diagram-kit，4 code 站点 + RUNBOOK drift 同步）；learn-kit `3.2.0` 不动（dual-layer 独立）
- **v6.3.1**（2026-06-07）：post-release develop pre-bump (post-v6.3.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `diagram-kit 0.1.0` / `learn-kit 3.2.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 / Check（v6.1.1 / v6.2.1 pre-bump 同款 2-commit-in-1-PR pattern）
- **v6.3.1 release**（2026-06-15）：marketplace 6.3.1 release.yml 自动 tag v6.3.1 + GitHub Release published；release/v6.3.1 branch 加 1 marker commit（root CHANGELOG `[Unreleased]` → `[6.3.1] - 2026-06-15` transform + 补 PR #161 settings 条目 + 本 release 历史条目）。**内容**：learn-kit `3.2.0 → 3.2.1`（`glossary` / `three-views` / `mp-doc-validate` 三个 skill `description` 超 Claude Code **1536 字符** system-prompt 注入截断的修复——`glossary` 1544 字符实际已被截断、丢失尾部 `(use /learn-kit:three-views)` routing clause；零语义变化，trigger phrases + `Do not use for` 逐字保留）+ CI 新增 `Validate SKILL.md description length` gate（>1536 fail / ≥1490 warn，纯 python3 stdlib 计数，覆盖 `plugins/*/skills/*` + `.claude/skills/*`）+ PR #161 `.claude/settings.json` MCP allow-rule 修复。消耗 post-v6.3.0 pre-bump slot（VERSION 6.3.1 已就位，本 release 不再 bump）；learn-kit `3.2.1` dual-layer 独立。无新 ADR（精简不改设计；门禁为普通 ci step）。详见 [`[ADR]_LearnKit_Explanation_Skills_Addition`](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)（routing clause 设计源）
- **v6.3.2**（2026-06-15）：post-release develop pre-bump (post-v6.3.1)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.2.1` / `diagram-kit 0.1.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 / Check（v6.1.1 / v6.2.1 / v6.3.1 pre-bump 同款 2-commit-in-1-PR pattern）
- **v7.0.0**（2026-07-20，develop RC）：**Codex 双原生 + NLM 桥接 + host-neutral runtime + Gate A/B**，两 PR 落 develop（marketplace `6.3.2 → 7.0.0` / learn-kit `3.2.1 → 4.0.0` NLM-only BREAKING / diagram-kit `0.1.0 → 0.2.0`）。**PR1**（native wrapper + 基础设施，不 bump）：`.agents/plugins/marketplace.json`（native catalog，无 version）+ 每插件 `.codex-plugin/plugin.json` + 每技能 `agents/openai.yaml`；`learn-kit-nlm-bridge` Python 包（本地 MCP host：initialize/tools/list 只回 checked-in 契约，首次 tool call 才 lazy-start 固定 connector 0.8.7，源码指纹禁 headless auth）+ 用户手工 installer（hashed wheel + receipt + two shim）；一批 Node validator/probe（`validate-dual-host` / `validate-claude-plugins` / `check-a6` / `smoke-codex-plugin` / `probe-learn-kit-nlm-bridge` / `generate-nlm-contract` / `resolve-release-state` / `check-prebump` / `check-tool-versions` / `run-cli` + `hash-upload-corpus.mjs`）；CI 加 `a6.yml`（`A6 / Check`）+ `codex-canary.yml`（weekly，永不 required）+ `codex-compat` matrix；`bump-version.ps1` 事务化。**PR2**（host-neutral + 安全 + RC）：四 SKILL + 模板去 `${CLAUDE_PLUGIN_ROOT}` 宿主耦合、改 locator 解析 + 双宿主调用（Claude `/plugin:skill`、Codex `$plugin:skill`）；`.mcp.json` command `notebooklm-mcp → learn-kit-nlm-bridge`；three-views Step 5B 重写为 local→Gate A→discovery→Gate B→mutation（trust boundary + 逐 mutation contract+manifest 复验 + corpus-hash re-run guard + 6-tool，删 `refresh_auth` / mind_map focus·language / `artifact-mind_map.md`）；`html-renderer.md` 加固（fixed safe-subset renderer + strict CSP + escaped JSON data island）；`validate:dual-host` warn→error。marketplace major = consumer-facing breaking（5 技能调用面新增第二宿主）；learn-kit major = NLM 分支需 Node 22+ / uv 0.11.21+ / 用户自备 Python 3.12 + Gate A/B 行为同意 + personal-only + 6-tool，**本地 markdown / HTML / glossary / concept / diagram 流程完全不变**；diagram-kit minor（向后兼容）。详见 CHANGELOG `[Unreleased]` + [`[ADR]_Codex_Dual_Native_Plugin_Support`](docs/adr/[ADR]_Codex_Dual_Native_Plugin_Support.md)
- **v7.0.1**（2026-07-23）：post-release develop pre-bump (post-v7.0.0)。**v7.0.0 于 2026-07-22 正式发布**——merge `release/v7.0.0 → main`（PR #170）触发加固后的 `release.yml`（draft-first / evaluator-gated / fail-closed），发布 tag `v7.0.0` + GitHub Release，恰 2 资产（`learn_kit_nlm_bridge-4.0.0-py3-none-any.whl` + `.sha256`）REST digest / 字节 / install-verify 全过；首次 push-triggered run 在 create-draft 后因 GitHub releases-list 最终一致性 lag 未即时可见而 fail-closed 于空 draft（**非误发布**），`workflow_dispatch(release_sha)` 重跑 resume-draft 自愈（follow-up：`run-release.mjs` post-create 应加 poll/backoff）。sync main→develop 回同步经 PR #171（CHANGELOG `[Unreleased] → [7.0.0]`）先行完成。本 pre-bump 只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 4.0.0` / `diagram-kit 0.2.0` 不动；native catalog（无 version）不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 / Check（v6.1.1 / v6.2.1 / v6.3.1 / v6.3.2 pre-bump 同款 2-commit-in-1-PR pattern）。
- **learn-kit `4.0.0 → 4.0.1`**（2026-07-23，develop，bugfix，随 v7.0.1 window）：修复 `three-views` NLM preflight —— `skills/three-views/scripts/hash-upload-corpus.mjs` 的 `--nlm-preflight` 在 4.0.0 是**永远 fail-closed 的 stub**（无 `ok:true` 路径；shim 已装也返回 `CONTRACT_VERIFICATION_UNAVAILABLE`），令 Step 5B.2 恒撤销 NLM、Gate A / discovery / mutation 端到端**不可达**（v7.0.0 的 NLM 特性实为死代码，装桥接器亦不解锁）。现改为运行 receipt-owned `learn-kit-nlm-bridge --contract-json`（桥接器自带的本地、无网络 verifier，`contract.py build_bridge_contract()`），surface 校验过的 **12-key fingerprint**（Gate A/B consent record 所绑），并对任何 spawn / 非零 exit / 不可解析 / 缺键或畸形键（5 SHA 走 `isHex64`）/ identity-invariant（`instructions_policy` / `base_url` / `transport`）漂移一律 **fail closed**；成功仅 whitelist-project 那 12 键（bridge 其他输出不泄漏进 consent）。跨平台：Windows `.cmd` 经 verbatim-quoted `cmd.exe /d /s /c ""<shim>" --contract-json"` + shim-path metachar guard（**实测** 非-verbatim `/s /c <shim> <arg>` 会剥掉 Node 给带空格路径加的引号而失败；Windows 账户名可含空格 / `%` / `&` / `^`），POSIX shim 直接 spawn（无 shell）。**marketplace VERSION 不变**（仍 7.0.1，plugin patch 随 pending 7.0.1 release，先例 v6.3.1 携 learn-kit 3.2.1）；bump plugin.json ×2 + marketplace.json `plugins[learn-kit].version` + README 行；A6 由 plugin.json / marketplace.json trigger + 本文件同步满足。本地 Markdown / HTML / `glossary` / `concept` 不受影响；解锁计划 §6 Real NotebookLM smoke。

## AI Engineering

marketplace AI agent 工作流规范（v4.1.0 起含 18 件项目本地 mp-* skill）：

- **STANDARD（完整规范）**：[docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) (v1.4)
- **GUIDE（运行时勾选清单）**：[docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md](docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)

### 11 阶段速查表

| # | Stage | Brief | Preferred Skill |
|---|-------|-------|----------------|
| 0 | Intake | 任务准入 + risk/scope/文档需求 | `/mp-flow-intake` |
| 1 | Repo Scan | 事实核查 8 维 | `/mp-flow-repo-scan` |
| 2 | Plan | 执行计划（落用户本地 `~/.claude/plans/`） | `/mp-flow-plan` |
| 3 | Design Decision (ADR) | 架构 / 命名 / 拆分决策 | `/mp-flow-design-adr` |
| 4 | Plugin / Skill Authoring | 新建 / 改造 plugin / skill | `/mp-flow-author`（内调 `/plugin-dev:create-plugin` + `/skill-creator:skill-creator`） |
| 5 | Plugin Compliance | 合规审 + 版本一致性 | `/mp-flow-compliance`（内调 `/plugin-dev:skill-reviewer` + `/plugin-dev:plugin-validator` agents） |
| 6 | Local Dogfood | 真实场景验证 | `/mp-flow-dogfood` |
| 7 | AI Self-review | 双段 + 11-item checklist | `/mp-flow-self-review` |
| 8 | Commit / Push / PR | gh + git + 6 PR template | `/mp-git-commit` → `/mp-git-push` → `/mp-git-pr` |
| 9 | Review → Merge → Release | CI / merge / release.yml | `/mp-git-merge-gate` |
| 10 | Post-merge Cleanup | worktree + branch + tag | `/mp-flow-post-merge` + `/mp-git-cleanup` |

### Project-Local Skills (`.claude/skills/`)

v4.1.0 起 19 件 `mp-*` 工作流 skill 随 repo commit 演进，划分 3 family：

| Family | 数量 | Skills |
|--------|------|--------|
| `mp-flow-*` | 9 | intake / repo-scan / plan / design-adr / author / compliance / dogfood / self-review / post-merge |
| `mp-git-*` | 7 | branch / commit / push / pr / merge-gate / cleanup / sync |
| `mp-doc-*` | 3 | author / validate / bump-version |

详见 STANDARD §5.1-§5.3。Skill 来源优先级：**项目本地 mp-* > learn-kit > plugin-dev > superpowers**。

### HITL 触发摘要

| 类别 | 例子 |
|------|------|
| plugin 高风险 | 删除 / 重命名 / 主版本 bump |
| marketplace schema | marketplace.json metadata / plugins 数组结构 |
| CI/CD | ci.yml / release.yml 修改 |
| 发布 | merge 到 main / VERSION bump major |
| 安全 | secret / 凭据 / token 处理 |
| Review 改变需求 | review 改 plugin 行为 / SKILL description / allowed-tools |
| 测试失败原因不明 | 关键测试失败但 root cause 不清 |

完整 HITL 规则详见 STANDARD §3.1；勾选清单详见 GUIDE §2 各 stage Verification 段。

### 关系

与 mj-system 同名 STANDARD 是「同款骨架，不同细节」；两者独立维护，不强同步。

## Documentation

完整文档索引：[docs/INDEX.md](docs/INDEX.md)
