---
type: adr
scope: marketplace
summary: 在保留 .claude-plugin 为 Claude Code SSOT 的前提下并行新增 Codex 原生包装（.agents catalog + .codex-plugin manifest + agents/openai.yaml）；双 manifest 由 validate-dual-host.mjs 强制一致；baseline 版本采用「供应链输入 exact / 滚动宿主 CLI minimum」二分
owner: marketplace-maintainers
created: 2026-07-16
updated: 2026-07-16
state: active
version: v1.0
domain: plugin-dev
tags:
  - codex
  - dual-host
  - plugin-manifest
  - capability-narrowing
  - baseline-pinning
  - v7.0.0
related:
  - ./[ADR]_Diagram_Kit_Addition.md
  - ./[ADR]_LearnKit_Explanation_Skills_Addition.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../spec/[SPEC]_Plugin_Json_Schema.md
  - ../spec/[SPEC]_Marketplace_Json_Schema.md
---

# [ADR] Codex Dual-Native Plugin Support

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-07-16 |
| Author | marketplace-maintainers |
| Scope | marketplace |
| Reversibility | reversible（新增文件可整体删除；`.claude-plugin/**` 未改动） |

## §1 Context

marketplace 目前只声明 Claude Code 的 plugin 契约（`.claude-plugin/marketplace.json` + 各插件 `.claude-plugin/plugin.json`）。实测 Codex 0.144.3 的 `DISCOVERABLE_PLUGIN_MANIFEST_PATHS` **同时**包含 `.codex-plugin/plugin.json` 与 `.claude-plugin/plugin.json`，因此在隔离 `CODEX_HOME` 下，两个插件当前**已经能**从 legacy 路径安装，四个技能也能被 `codex debug prompt-input` 列出。

所以本次改造**不是**修复安装失败，而是三件事：

1. **发布契约**：把 Codex 支持从「碰巧兼容 legacy 路径」变成显式声明，不依赖上游继续保留 legacy 兼容。
2. **UI 元数据**：Codex 的 catalog / plugin card / skill picker 需要 legacy schema 无法表达的字段（`interface.displayName` / `category` / `defaultPrompt` / `policy.authentication`）。
3. **触发正确性**：四份既有 description 在 Codex 侧存在**真实缺陷**（见 §5），不只是 warning。

约束：两个宿主共享同一份 `SKILL.md` 正文、`templates/**`、`references/**`，任何一侧的表达都不能破坏另一侧。

## §2 Decision

**并行双 manifest，legacy 保持 SSOT。**

- 新增 `.agents/plugins/marketplace.json`（Codex 原生 catalog）。它**不保存版本**——版本只由 manifest 持有，避免 bump 时出现第三处需要同步的版本源。
- 每插件新增 `.codex-plugin/plugin.json`，与 legacy manifest 共存。
- 每技能新增 `agents/openai.yaml`（Codex skill UI metadata）。
- `plugins/learn-kit/.mcp.json` 的 `command` 由上游 `notebooklm-mcp` 改为本仓 `learn-kit-nlm-bridge`。

**一致性由代码强制，不靠约定**：`scripts/validate-dual-host.mjs` 断言 `name` / `version` / `author` / `repository` / `license` / `skills` 在双 manifest 精确一致；native `keywords` 是 legacy 的非空子集；native `description` **有意**更短且宿主中性，故**不**要求逐字一致。

### §2.1 Baseline 版本语义：二分而非一刀切

| 工具 | 语义 | 理由 |
|---|---|---|
| Codex / uv / bridge / connector | **exact** | 供应链输入。uv 解析 hashed lock；bridge / connector 版本进入 Gate fingerprint。非预期版本必须 fail closed。 |
| Claude Code CLI | **minimum（`>=`）** | 外部滚动发布的宿主二进制，**不进** wheel / lock / fingerprint，本仓无法 pin。 |

计划原文对 Claude 也写 exact `2.1.210`；实施时本机实际为 `2.1.211`，若照字面实现，`npm run check:baseline-tools` 会在第一天就红。此处**有意偏离计划**，按 [[feedback_standard_overrides_plan]] 的既定做法：调整方案并以本 ADR 记录，不静默违反。

判据是**该版本是否进入可重复构建的输入**，不是「是否重要」。Claude CLI 每次自动更新都让 CI 变红，却不改变任何产物字节——这是噪声，不是信号。

### §2.2 能力收窄：正负两半必须用不同方式判定

`three-views` 的 NotebookLM 预授权由 **8** 个 MCP tool 收窄为 **6**：删除 `refresh_auth`（会校验默认 profile、可能触发 headless auth）与 `server_info`（远端探测）。

`source_delete` **本来就不在** develop 的预授权里，因此本次**不涉及**删除它；它的意义在 **bridge 层**——bridge 的 public tool surface 只暴露这 6 个，`source_delete`（不需要的破坏性能力）与 `server_info` 都不进入该 surface（计划 §2.3.1）。validator 仍把三者一并列入 denylist，作为**回归防护**而非既成事实的记述。

实现上把契约拆成两半，**因为两者的可知方式不同**：

- **正向**（「three-views 必须声明恰好这 6 个 + scoped helper」）按**名字**判定。一个 skill *应当*声明什么，**无法**从它*恰好*声明了什么推出——否则删掉声明就等于删掉「要求该声明」的规则。初版正是犯了这个错：把正向规则挂在 `declaresMcp` 之后，于是删光 MCP IDs、或整个省略 `allowed-tools`（**最宽**授权，技能继承整个会话工具集），都能验证通过。
- **反向**（「任何东西都不得授予 refresh_auth / 非 scoped shell / 未知 MCP tool」）按**内容**判定，对原始 scalar 做子串判定。这样 rename-proof、覆盖尚不存在的 skill，且不会被扰动 tokenization 绕过。

收窄**只约束声明了 MCP 工具的 skill**。`arch-diagram` 保留裸 `Bash`（用于运行 bundled Python validator），把规则全局化会与规格冲突。

## §3 Consequences

**Positive**

- Codex 支持不再依赖上游保留 legacy 兼容路径。
- description 的两处真实缺陷被修掉（§5）。
- 能力面收窄：`refresh_auth` / `server_info` 不再预授权（`source_delete` 本就不在，见 §2.2）。
- 宿主不再能直接启动第三方 connector——`.mcp.json` 只指向本仓 bridge。
- 一致性由测试 + CI 强制，不是文档承诺。（具体数字随增量变化，故此处不写死；以 `npm test` 为准。）

**Negative**

- 每插件多一份 manifest，bump 时目标集合变大（`bump-version.ps1` 必须同步更新 native manifest 的 `version`）。
- 双份 UI 文案存在漂移风险，由 validator 兜住。
- `agents/openai.yaml` 四份都省略 `dependencies.tools`：该 schema 无 optional 语义，无法表达「只有 NLM opt-in 才需要」，故 server 改由 native manifest 的 `mcpServers` 聚合。代价是 Codex UI 不显示该依赖。

**Risks**

- Codex plugin schema 仍在演进，字段可能变动；缓解：所有 Codex 限定值域集中在 validator 常量里。
- `Bash(*)` 这类通配授权比裸 `Bash` **更宽**却不含字面 token `Bash`，denylist 看不见它。已改为 allowlist；这是一类反复出现的陷阱，未来新增权限检查须默认 allowlist。
- Gate A/B 是**行为性**同意协议，**不是**宿主或模型不可绕过的安全边界。Codex 不把 `allowed-tools` 当权限边界；Claude 的 6-tool 预授权也不能证明「真人刚刚确认」。README / ADR / skill 均不得声称 bridge 能验证真人同意。

## §4 Alternatives Considered

1. **只留 Codex 原生、删 legacy** — 否决：Claude Code 是既有主要消费者，legacy 是其 SSOT。
2. **用脚本从 legacy 生成 native manifest** — 否决：native 的 `description` / `category` / `defaultPrompt` 是**有意不同**的宿主特定文案，不是 legacy 的机械变换；生成器只会把差异伪装成 bug。改为并行 + validator 强制一致。
3. **Claude 也 exact pin** — 否决，见 §2.1。
4. **把 NotebookLM 改成 learn-kit 的强制依赖**（省掉 bridge/optional 分支的复杂度） — 否决：Markdown / HTML / glossary / concept / diagram 都不需要它；强制依赖会让不用 NLM 的用户被迫装 Node/uv/Python。

## §5 Implementation Notes

四份 description 按计划 Appendix A 替换，**逐字节**核对。这不是润色——但**缺陷在 Codex 侧，不在 Claude 侧**。实测 `origin/develop` baseline：

| skill | 字符数 | > 1536（Claude 截断） | > 1024（Codex 截断） | 角括号 |
|---|---:|---|---|---:|
| three-views | 1290 | 否 | **是** | 14 |
| glossary | 1451 | 否 | **是** | 0 |
| concept | 1461 | 否 | **是** | 0 |
| arch-diagram | 1197 | 否 | **是** | 4 |

- **四份全部 > 1024**，因此在 Codex 给模型的初始技能列表中被截断——这是**触发正确性**缺陷，不只是清 warning（计划 §1 fact 4 即此结论）。
- **两份**（three-views / arch-diagram）含 `<topic>` / `<X>` 等角括号，Codex 自带的 `skill-creator/scripts/quick_validate.py` **拒绝**解析后 description 含 `<` / `>`。glossary 与 concept 不含。
- **Claude 1536 门当前未被触碰**：四份都在 1536 以下。`glossary` 曾达 1544 并确实丢过尾部 routing clause，但那是 **v6.3.1（2026-06-15）已修复的历史**（learn-kit `3.2.0 → 3.2.1`，见根 CLAUDE.md 该版本条目），**不是**本次要修的现状。起草本 ADR 时曾把该历史误述为现状，此处更正。

现四份为 664–882 字符、无角括号，同时满足 Claude 1536 与 Codex 1024 两门（本仓按更严的交集撰写）。

## §6 Acceptance Criteria

- [x] `node scripts/validate-dual-host.mjs --root . --host-neutral warn` → 0 error（PR1 期 7 条 host-coupling warning 为预期状态）
- [x] `npm test` 全绿，每条规则均有 negative case
- [x] 四份 description 与 Appendix A 逐字节一致，且同时通过两门
- [x] `claude plugin validate --strict .` → exit 0 无 warning（新增 native 文件不影响 Claude 侧）
- [x] `three-views` 预授权恰好 6 个 MCP tool（由 8 收窄），无 `refresh_auth` / `server_info` / `source_delete`、无裸/通配 `Bash`、无 installer
- [ ] 三模式隔离 Codex smoke（dual / native-only / legacy-only）—— 待 `smoke-codex-plugin.mjs`
- [ ] `--host-neutral error` → 0 error —— PR2 目标，当前 7 warning 即其输入

## §7 References

- Codex 0.144.3 loader / plugin_namespace 源码（`DISCOVERABLE_PLUGIN_MANIFEST_PATHS`、`plugin:skill` 注册形态）
- https://learn.chatgpt.com/docs/build-plugins ・ https://learn.chatgpt.com/docs/build-skills ・ https://agentskills.io/specification
- `scripts/validate-dual-host.mjs`（本 ADR 全部结构性约束的可执行形式）
- [[STANDARD]_AI_Engineering_Execution_HITL_Prompt] §3.1（本改造触及 marketplace schema / SKILL.md frontmatter，属必停项，已按 HITL 确认）

## §8 Decision Log

- **2026-07-16 v1.0**：初版。并行双 manifest + validator 强制一致；baseline 二分（供应链 exact / 滚动宿主 minimum，偏离计划原文并在此记录）；能力收窄正负两半分别按名字 / 按内容判定。
