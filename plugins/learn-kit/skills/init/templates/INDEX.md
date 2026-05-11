# Learning Subsystem · INDEX

> **角色**：本项目 `learning/` 子系统根级入口
> **治理**：本子系统不在项目主索引（`docs/INDEX.md` / `README.md`）治理范围内；自管 sub-framework，由 [`./_meta/METHODOLOGY.md`](./_meta/METHODOLOGY.md) §9 元规则统辖
> **保留**：OB1-OB6（基础 markdown 语法 / 链接 / heading / list 一致性等）+ 方法论 5 件套（框架 / 类别 / 比喻 / 图 / 口诀）手工遵守

---

## 总览

学习子系统的存在动机：**思考可以交给 AI，但理解必须用户完成**。当项目 canonical 文档（STANDARD / SPEC / RUNBOOK / RFC 等）因密度过高难以人脑吸收时，本子系统沉淀对应的**人类可学习材料**——通过抽象框架 + 比喻系统 + 决策图 + 口诀，把规则清单转化为可记忆的 mental model。

**与项目其他文档的边界**：

| 域 | 治理 | 读者 | 形态 |
|----|------|------|------|
| canonical docs（你的主 docs/）| 项目主治理框架（强 schema / link / state 校验） | AI Agent + 团队检索 | 强契约 / 高密度 / 可验证 |
| working plans / drafts | 工作计划 schema（轻） | 任务执行期临时 | 一次性产物 |
| **learning/（本子系统）** | **本子系统 sub-framework** | **人类学习者** | **5 件套 pedagogical 解读** |

每个根级 doc folder 单一治理职责，物理隔离 = 治理隔离。

---

## 方法论（_meta/）

| 文档 | 用途 | 版本 |
|------|------|------|
| [METHODOLOGY.md](./_meta/METHODOLOGY.md) | 8 阶段方法（§1-§8）+ 子系统元规则（§9 命名/路径/frontmatter/INDEX/链接/归档 + §10 可选集成 + §11 worked example pointer + §12 版本演化） | v0.1 |
| [NLM_RECORD_TEMPLATE.md](./_meta/NLM_RECORD_TEMPLATE.md) | NotebookLM 制品元信息 markdown 模板（与 notebooklm-kit 插件配套，可选） | v0.1 |

---

## 按 Topic 索引

> 当前为空。每次新建解读文档时按 §维护规则 同步本段。

<!-- 示例（删除前请取消注释）：
### <topic-name>

源材料：<your source reference, e.g., RFC 2119、OWASP Top 10、项目 STANDARD §X>

| 文档 | 解读对象 | 版本 |
|------|---------|------|
| [./topic/[LEARNING]_X_Interpretation.md](./topic/[LEARNING]_X_Interpretation.md) | <短描述> | v1.0 |
-->

---

## 归档（_archive/）

> 当前为空。归档策略见 [METHODOLOGY.md §9.7](./_meta/METHODOLOGY.md#97-删除--归档策略推荐-c-软归档)：源演化后旧解读移此目录，frontmatter 加 `state: archived` + `replaced-by` 链接。

---

## NotebookLM Notebooks（可选）

> 仅在使用 notebooklm-kit 插件时填充本段。元信息 markdown 落盘到 `<topic>/_nlm/<artifact>.md`，模板见 [NLM_RECORD_TEMPLATE.md](./_meta/NLM_RECORD_TEMPLATE.md)。

<!-- 示例：
### <topic-name>（4 件套：看 / 听 / 讲 / 测）

Notebook: `<project>-<scope>-<topic>-<YYYYMMDD>` （id `<uuid>`, N sources）

| Record | Artifact | View | Modality | 关联 [LEARNING] |
|--------|---------|------|----------|----------------|
| [./topic/_nlm/mind_map_default.md](./topic/_nlm/mind_map_default.md) | mind_map | default | 看（视觉框架）| [./topic/[LEARNING]_X.md](./topic/[LEARNING]_X.md) |
-->

### 生成入口

如果你安装了 `notebooklm-kit` 插件：

- `/notebooklm-kit:learn-make <topic>` — 生成学习资料 wrapper（编排 build + studio 上游 7 类制品）
- `/notebooklm-kit:learn-test <notebook_id>` — 生成考察资料 wrapper（quiz + flashcards）
- `/notebooklm-kit:studio` — 单步生成单类制品（advanced）

如果你不使用 NotebookLM 集成，可忽略本段。

---

## 维护规则

新建 / 重命名 / 归档 learning 文档时**必须同步本 INDEX**，按以下区段定位：

1. **方法论更新**：在 §方法论 表更新版本号
2. **新 topic**：在 §按 Topic 索引 加新二级标题；topic 选取规则见 [METHODOLOGY.md §9.3](./_meta/METHODOLOGY.md#93-路径约定按-topic-分组)
3. **新解读文档（已有 topic）**：在对应 topic 表加行
4. **归档**：源文件移 `_archive/<topic>/`，本 INDEX 在归档段加引用
5. **NLM Notebook 元信息**：在 §NotebookLM Notebooks 列出

---

## 版本历史

- **v0.1**（YYYY-MM-DD）：通过 `/learn-kit:init` 初始化生成。
