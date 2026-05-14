# ADR · NotebookLM Kit Retirement (marketplace v4.0.0)

**Status**: Accepted
**Date**: 2026-05-14
**Deciders**: ranzuozhou
**Marketplace version impacted**: 3.2.1 → 4.0.0
**Plugin version impacted**: learn-kit 0.3.1 → 1.0.0; notebooklm-kit 2.4.1 → deleted

---

## Context

mj-agentlab-marketplace v3.x 包含两个 plugin：

- **learn-kit** v0.3.1 — 教学方法论 + AI 三档（foundation / structural / challenge）reading-tier 学习文档生成 + 交互式 HTML 渲染。v0.3.0 明示 "Independent plugin — no external service dependencies"。4 个 skill（init / locate / scan / generate-tier）。
- **notebooklm-kit** v2.4.1 — NotebookLM 全生命周期 7 个 skill（auth / build / studio / learn-make / learn-test / manage / query）+ 10 份 nlm-shared/ 参考文档。`.mcp.json` 注册 `notebooklm-mcp` MCP server。

### 触发本 ADR 的观察

用户在 mj-agent 项目使用 `/learn-kit:generate-tier` 产出 `learning/<topic>/` 三档学习文档后，希望把这些素材推到 NotebookLM 生成多媒体 artifact（audio/video/slide/mind_map/infographic）以适配通勤 / 评审 / poster 等学习场景，但**不希望下载二进制**（在线 NLM 看即可）。

调研发现：

1. notebooklm-kit 的 7 个 skill 中，**仅 build + studio + learn-make 三者**覆盖此「上传文档 → 出多媒体」场景；其余 4 个（auth / learn-test / manage / query）覆盖的 quiz / flashcards / cross-notebook query / notebook 管理场景**几乎未在本 marketplace 的两个 dogfood 项目（mj-system / mj-agent）实际使用**
2. notebooklm-kit 是从 `ranzuozhou/my-marketplace` 在 v3.0.0 迁入并重命名而来；它继承了一个更广覆盖面的 NLM-side 工具集设计，但与 learn-kit 的核心使用场景（学习材料 → 多媒体）之间**只有 30% 左右的重叠**
3. learn-kit v0.3.0 在 changelog 中**主动声明**与 notebooklm-kit 解绑（删 NLM_RECORD_TEMPLATE.md / 移除 METHODOLOGY §10.1 NLM 集成段 / 清理所有 `/notebooklm-kit:*` 互引），明示 marketplace 内两个 plugin 并存但**互不调用**。但这反而使生成多媒体 artifact 这种 learn-kit 后续学习闭环的明显使用场景**无法被 learn-kit 主动覆盖** —— 用户需要自己跑 `/notebooklm-kit:build` + `/notebooklm-kit:studio`，且需要熟悉两套 skill 的约定（命名、scope、record/download 模式）

### 用户实际诉求

> "考虑剔除 notebooklm-kit；为 learn-kit 新增技能，将三档学习文档传入 NotebookLM 出多媒体 artifact，在线看不下载。"

---

## Decision

### Tier-1（必做）

1. **新增** `plugins/learn-kit/skills/nlm-studio/` —— `/learn-kit:nlm-studio <topic>` skill（v1.0.0 dogfood 后定稿）：
   - 输入：`learning/<topic>/` 下 3 个 `[LEARNING]_<topic>_<view>.md`（**markdown only**；HTML 经 dogfood 验证 NLM 在 file / text 双模式下都拒收，不上传）
   - 处理：上传到名为 `learn-kit:<topic>` 的 NotebookLM notebook；运行 3 parallel batches of 5/4/4 = 13 artifact（4 view-cycled 类型 × 3 view + 1 shared view-agnostic mind_map）
   - 输出：终端 markdown 表格列 13 个 NLM artifact URL + notebook URL；**零本地落盘**
   - 触发 5-step workflow（每 Step 起始 refresh_auth + Step 1.4 用 notebook_list 作真 auth gate）：pre-flight → re-run guard (notebook_list 查同名 + 4 选 1 prompt) → notebook setup (3 parallel source_add + **强制 notebook_get 核验**) → **Step 3.5 Quota confirm gate**（明示 ~65% 日上限 + 「本 skill 看不见账户已用量」+ confirm/reduce/abort 三选） → artifact generation (3 parallel batches with mid-run auth retry-once + studio_status 幂等查) → terminal recap
2. **核心质量原则 View-Purpose Preservation**：通过 3 view-prefix（pedagogical purpose / audience / style / anti-patterns / success criteria 5 段必备）+ 5 artifact-suffix（媒介格式约束）+ 1 interaction-overrides YAML（5 个 view × artifact 高耦合 cell 联合调优）三段式 focus_prompt 拼装，让 foundation/structural/challenge 的同类 artifact 在风格、节奏、收尾方式上**显著差异化**。SKILL.md 内置 failsafe：view-prefix 5 段任一缺失即 abort，避免 view-purpose 被退化为 tag
3. **迁** `plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`（原文复制；MCP server name `notebooklm-mcp` 不变；工具前缀自然从 `mcp__plugin_notebooklm-kit_notebooklm-mcp__*` 变为 `mcp__plugin_learn-kit_notebooklm-mcp__*`）
4. **删除** `plugins/notebooklm-kit/` 整个目录（22 个文件，含 7 个 skill + 10 份 nlm-shared/ + CLAUDE / README / CHANGELOG / plugin.json）
5. **改** `/learn-kit:generate-tier` SKILL.md：从 8-step workflow 扩展到 10-step。在 HTML 渲染（step 8）之后插入新 step 9（optional NLM multimedia generation；AskUserQuestion 默认 skip，必须显式 yes 才触发 `/learn-kit:nlm-studio`）；原 step 9 (Summary) 改名 step 10

### Tier-2（配套）

6. **bump version**：learn-kit `0.3.1 → 1.0.0`（major：新增 MCP 依赖 + 首个 stable）；marketplace `3.2.1 → 4.0.0`（major：删插件，跟随 v3.0.0 删 5 plugin 先例）
7. **删除独立性宣言**：learn-kit plugin.json description / CLAUDE.md / README.md 中 "Independent plugin — no external service dependencies" 文字删除；改为 "nlm-studio 需 notebooklm-mcp + nlm login；其余 4 skill 仍零外部依赖" 的分级说明
8. **marketplace.json learn-kit metadata.keywords** 扩展 8 个新词：`nlm-studio` / `notebooklm` / `audio` / `video` / `multimedia` / `slide-deck` / `mind-map` / `infographic`（让 marketplace 搜索能发现）
9. **更新引用**：`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` 4 处 `notebooklm-kit` 引用清理（line 357/427/699/704）；`docs/INDEX.md` plugin references 段更新；`docs/MIGRATION_GUIDE.md` 追加 §v3.2.x → v4.0.0 段
10. **永久放弃** 退役场景：quiz / flashcards / data_table / report / cross-notebook query / source 增删 / notebook 分享 / Deep Research 等 7 个 notebooklm-kit 独有 skill 的能力。本 ADR 之后**不再有计划重新提供**这些功能（如有需求请用外部工具或自建 in-tree skill）

---

## Consequences

### 正面

- **surface area 收敛**：2 plugin / 11 skill → 1 plugin / 5 skill。新人理解成本下降
- **学习侧 mental model 统一**：「topic → 学习材料 → 多媒体」端到端归 learn-kit 一个 plugin 拥有，符合用户实际心智
- **View-Purpose Preservation 是新的质量增益**：v3.x 的 `/notebooklm-kit:studio` 用 `view=foundation/structural/challenge` 仅作 tag，artifact 之间差异化弱；nlm-studio 通过模板组合 + failsafe + dogfood QA Test 1.7 盲测把 view 差异化作为质量标准
- **零落盘 + 强幂等**：复用 NLM 端的 studio_status 做 CTRL+C resume，比 v3.x 的 record mode markdown 简单（无 metadata 文件维护）
- **MCP 依赖收敛到唯一消费方**：v3.x 中 .mcp.json 在 notebooklm-kit 但 learn-kit 隐式可依赖；v4.0.0 起 learn-kit 是 .mcp.json 的拥有者也是唯一消费者

### 负面 / 代价

- **quiz / flashcards / cross-notebook query / source 管理 / Deep Research 等能力丢失**。无可替代方案。如有用户需要，给他们的迁移路径仅是「用 NotebookLM web UI 手动操作 / 用外部工具」
- **MCP 工具前缀变化**对开发者非透明：以前调 `mcp__plugin_notebooklm-kit_*` 现在要调 `mcp__plugin_learn-kit_*`。脚本 / external integrations 如硬编码了前缀需要更新。本 marketplace 内部 (SKILL.md allowed-tools) 已全部更新
- **首个 stable 版本 1.0.0 引入 external dependency**：v0.3.0 的 "Independent" 卖点丧失。新用户必须知道 nlm-studio 有 nlm login 依赖；其余 4 skill 仍独立
- **legacy mj-nlm@my-marketplace 用户**若手动注册了 legacy plugin，升级 v4.0.0 后会出现 MCP server 双 load 冲突。MIGRATION_GUIDE 必须明示卸载步骤
- **历史 NotebookLM 数据不自动迁移命名**：用户在 v3.x 用 `/notebooklm-kit:learn-make` 创的 notebook 名字格式不是 `learn-kit:<topic>`；nlm-studio 不能直接复用，需要 web UI 重命名或重建

---

## Alternatives Considered

### A. Orchestrator pattern（保留 notebooklm-kit；新 learn-kit skill 调 `/notebooklm-kit:build` + `/notebooklm-kit:studio`）

**优**：零代码重复；保留 notebooklm-kit 全部 7 skill 给需要 quiz / cross-notebook 的用户
**劣**：把 learn-kit v0.3.0 主动声明的 "Independent" 立场又破坏一次；plugin 间软依赖；用户安装 learn-kit 必须连 notebooklm-kit 一并装；version 升级耦合
**否决**：long-term clarity 价值高于代码 DRY；用户场景集中在 30% 重叠区，保留全 7 skill 是 over-provisioning

### B. Recipe emitter（保留 notebooklm-kit；新 learn-kit skill 仅打印一份 markdown 操作清单让用户手动跑 `/notebooklm-kit:*`）

**优**：零运行时耦合
**劣**：UX friction 极大；用户每次要复制粘贴 ~15 条命令；自动化价值缺失
**否决**：与 skill 「可执行」的本质相违

### C. Self-contained without removing notebooklm-kit（learn-kit 直接调 MCP；notebooklm-kit 继续保留）

**优**：兼顾两组用户（要 quiz/flashcards 的留 notebooklm-kit；只要多媒体的用 nlm-studio）
**劣**：marketplace 表面 surface 增加而非减少；两套 NLM-touching skill 并存会让用户难以选择；MCP server `notebooklm-mcp` 被两个 plugin 同时注册可能冲突
**否决**：未带来比删除更多的价值；marketplace 长期演进方向是收敛

### D. v3.x LTS 分支保留 notebooklm-kit + 主线走 v4.0.0

**优**：给需要 quiz / cross-notebook 的老用户安全网
**劣**：维护双分支成本高（每次 bug fix 要 cherry-pick）；本 marketplace 不是商业项目，维护资源有限；目前没有「老用户依赖 quiz / cross-notebook 强烈」的证据
**否决**：运维成本超出价值

---

## Compliance & verification

实施完成后必须通过：

- **静态校验** (Stage 5)：`/plugin-dev:plugin-validator` + `/plugin-dev:skill-reviewer` 对 learn-kit v1.0.0 全 5 skill；Grep 确认 `notebooklm-kit` 引用在 docs/ 内剩余 0 个（除本 ADR + MIGRATION_GUIDE 的历史段）；marketplace.json 8 个新 keyword 验证
- **端到端 dogfood** (Stage 6)：在 mj-agent develop worktree 跑 `/learn-kit:nlm-studio documentation-framework` 完整 5 测试（Test 1 完整 6-source / 1.5 source visibility QA / 1.6 HTML 必要性 QA / 1.7 view-purpose 盲测 / 2 MD-only degrade / 3 re-run replace / 4 auth failure / 5 CTRL+C resume）
- **CI 通过** (Stage 9)：marketplace ci.yml + release.yml 全过

---

## References

- Plan v3：`C:\Users\Admin\.claude\plans\learn-kit-init-i-ll-streamed-meadow.md`
- 既有 ADR：[ADR: learn-kit Discovery & Locate Skills](<./[ADR]_LearnKit_Discovery_Skills.md>)
- 迁移指引：[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) §2 v3.2.x → v4.0.0
- v3.0.0 删 5 plugin 先例：[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) §1 v2.x → v3.0.0
