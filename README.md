# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-6.3.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml)

> 浏览本仓库 `develop` 分支时看到的 Version badge 是**预计下一个 release 号**（per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)）；当前实际已发布版本以顶部 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 或 `main` 分支 badge 为准。

通用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 插件市场——教学方法论 + NotebookLM 多媒体集成 + 架构图生成，分布在 **2 个 plugin**（learn-kit + diagram-kit）。不绑定特定项目，可服务任意 Claude Code 使用者；在 [mj-system](https://github.com/MJ-AgentLab/mj-system) 与 mj-agent 两个项目上长期实战验证。

> **v4.0.0 重大变更**：marketplace 从 "2 plugin（notebooklm-kit + learn-kit）" 收敛为 "1 plugin（learn-kit）"。原 `notebooklm-kit` 整个退场（7 个 skill 退役），其核心 build + studio 多媒体场景被 `learn-kit` 新增的 `nlm-studio` skill 吸收，并加入 **View-Purpose Preservation** 原则使生成的 artifact 严格匹配源 view（foundation/structural/challenge）的教学目的。详见 [docs/adr/[ADR]_NotebookLM_Kit_Retirement.md](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md) + [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)。

## 插件目录

| Plugin | 描述 | Skills | Version | 适用项目 |
|--------|------|--------|---------|---------|
| [**learn-kit**](plugins/learn-kit/README.md) | 教学方法论 kit：给定主题 + 源材料（项目文件 / 外部 URL / 粘贴文本），生成 1-3 阶段学习 markdown（foundation/structural/challenge；v3.1.0 起 Step 1.3 视角 multi-select default 全选 / min 1），按需扩展 HTML（dual-mode grounding，per generated tier）与 NotebookLM 多媒体（v3.1.0 起 Step 4 5-cell granular multi-select；max 10 artifact）；v3.2.0 起另含 glossary / concept 两个轻量 in-chat 解释 skill | **3** | **3.2.0** | 任意 |
| [**diagram-kit**](plugins/diagram-kit/README.md) | 架构 / UML 绘图 kit：把代码库 / 系统的源事实转成证据绑定的 Mermaid 架构图，7 类（context / container / component / code〔C4 结构〕+ sequence / state-machine〔行为〕+ deployment〔物理〕），任意域；事实先行（L0–L3 阶梯，每节点/边可追 `file:行号`）；bundle 9 份领域无关 references + 泛化 stdlib Mermaid validator | **1** | **0.1.0** | 任意 |

> **v6.3.0 Additive（NEW plugin）**：新建 `diagram-kit 0.1.0`——marketplace 史上首次 plugin 计数 **1 → 2**。单 skill `arch-diagram`（`/diagram-kit:arch-diagram`）把代码库事实转成证据绑定 Mermaid 图（7 类）；与 learn-kit 功能正交（一个出架构图、一个出学习材料），8→3→1 收敛方向经 domain-orthogonality reconcile。详见 [`[ADR]_Diagram_Kit_Addition`](docs/adr/[ADR]_Diagram_Kit_Addition.md)。
>
> **v6.2.0 Additive**：learn-kit `3.1.0 → 3.2.0` 加 `glossary`（术语速记卡）+ `concept`（概念深讲）两个纯 prompt in-chat 解释 skill（无 tool / 无 file / 无 MCP）；填补 `three-views` 明确 disclaim 的 pure-explanation / Q&A niche；learn-kit picker 1→3（论证见 ADR）。详见 [`[ADR]_LearnKit_Explanation_Skills_Addition`](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)。
>
> **v6.1.0 Additive**：learn-kit `3.0.0 → 3.1.0` 加 Step 1.3 视角 multi-select（default 3 全选 / min 1）+ Step 4 重设计为 5-cell granular NLM 类型 multi-select（HTML / audio / video / slide_deck / mind_map 独立勾选）；Step 5B re-run guard 加 source-corpus equivalence；默认产物等同 v3.0.0。详见 [`[ADR]_LearnKit_ThreeViews_HITL_Expansion`](docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)。
>
> **v6.0.0 BREAKING**（baseline）：learn-kit 5 skill → 1 `three-views` 收敛；4 个公开 slash command 永久消失 + 1 个重命名；NLM artifact 范围 13 → max 10（infographic 永久退场）。详见 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) + [Migration §6](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md#§6--v50x--v600)。

learn-kit 1 个 skill 用法：

| Skill | 命令 | 用途 |
|-------|------|------|
| **three-views** | `/learn-kit:three-views <topic>` | **v3.0.0 起主 skill；v3.1.0 加 HITL 扩展**。5-step workflow: Intake（主题 + 输入源 multiSelect + **视角 multiSelect default 3 全选** + 输出目录 + 冲突）→ Source acquisition（source_manifest）→ N-view 生成（1-3 份 md）→ Multi-select opt-in（**5-cell**: HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map）→ 执行选中项（HTML dual-mode grounding + NLM with 全 dogfood防护 + source_corpus_key 等价性）|
| **glossary** | `/learn-kit:glossary <术语>` | **v3.2.0 新增**。一段 150–250 字、六槽结构（类比→归类→痛点→定义→对比→例子）的术语速记卡；纯 in-chat 输出、不落盘。30 秒听懂一个术语。|
| **concept** | `/learn-kit:concept <概念>` | **v3.2.0 新增**。六节 500–800 字（起源痛点 / 核心直觉 / 机制与定义 / 2 跨域正例 + 1 反例 / 邻居概念 / 失效边界）的概念深讲；目标"能用"而非"听过"。纯 in-chat 输出。|

diagram-kit 1 个 skill 用法：

| Skill | 命令 | 用途 |
|-------|------|------|
| **arch-diagram** | `/diagram-kit:arch-diagram <target>` | **v0.1.0 主 skill**。把代码库 / 系统的源事实画成证据绑定的 Mermaid 架构图。5-step: Scope（target + 领域自动探测）→ Acquire facts L0–L3（声明扫描 → 结构推断 → 命名归类 → HITL 补缺）→ Pick diagrams（按全局适用性矩阵选 7 类子集）→ Draft（套 §5 边语义 + §6 命名出 Mermaid，`text` 围栏不自动渲染）→ Validate（bundled stdlib linter，无 Python 时优雅降级）。铁律：每节点/边可追 `file:行号`，禁臆造。7 类：context / container / component / code（C4 结构 L1–L4）+ sequence / state-machine（行为）+ deployment（物理）。|

## 安装

> 前提：已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)。

### 1. 注册 Marketplace

```
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
```

### 2. 安装插件

Claude Code 插件支持三种安装级别：

| 级别 | 命令 flag | 配置文件 | 共享 | 适用场景 |
|------|-----------|----------|------|----------|
| 用户级 | （默认） | `~/.claude/settings.json` | 否 | 个人常用插件，跨项目生效 |
| 项目级 | `--scope project` | `.claude/settings.json` | 是（提交到 git） | 团队共享，新成员自动获取 |
| 本地级 | `--scope local` | `.claude/settings.local.json` | 否（gitignore） | 仅本项目、仅本人，不影响团队 |

#### 用户级安装（默认，所有项目可用）

```
/plugin install learn-kit@mj-agentlab-marketplace
/plugin install diagram-kit@mj-agentlab-marketplace
```

#### 项目级安装（提交到 git，团队共享）

```
/plugin install learn-kit@mj-agentlab-marketplace --scope project
```

### 3. 前置依赖（仅 NLM 多媒体需要）

如要在 `/learn-kit:three-views` Step 4 勾选任一 NLM cell（audio / video / slide_deck / mind_map）出 NotebookLM 多媒体，需在终端先做一次配置：

```bash
# 安装 notebooklm-mcp CLI（一次性）
uv tool install notebooklm-mcp-cli --with socksio --force

# Google OAuth 登录（一次性；token 自动 refresh）
nlm login
```

如只用 markdown + HTML，无需任何外部依赖。

### 4. 使用示例

```
/learn-kit:three-views                       # 弹出 Step 1.3 视角 multiSelect (default 3 全选)
                                             # → Step 4 5-cell multiSelect (default 全不选)
/learn-kit:three-views documentation-framework  # 带 topic arg；同上 flow

# 自然语言触发同样进入 three-views skill：
"我想学习 React useEffect 内部原理"
"为 [STANDARD]_HITL 出三档学习材料"
"把 git rebase 内部原理推到 NotebookLM 出 audio"
```

完整使用文档：[learn-kit/README.md](plugins/learn-kit/README.md)。v6.0.0 起 `/learn-kit:scaffold-learning` / `:locate` / `:scan` / `:generate-tier` / `:nlm-studio` 5 个老 slash 命令永久退役，全部由 `/learn-kit:three-views` 承担；迁移见 [Migration §6](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md#§6--v50x--v600)。

## 更新

```
/plugin update learn-kit@mj-agentlab-marketplace
```

## v3.x → v4.0.0 迁移指引

如果你在 v3.x 使用过 `notebooklm-kit`：

- **`/notebooklm-kit:build` + `/notebooklm-kit:studio` + `/notebooklm-kit:learn-make`** 的核心场景（上传文档 + 出多媒体 artifact）→ 用 `/learn-kit:three-views <topic>` 替代，Step 4 勾选所需 NLM cell（audio / video / slide_deck / mind_map）；新版会严格保持 foundation/structural/challenge 三档的教学目的差异
- **`/notebooklm-kit:auth`** → 直接在终端跑 `! nlm login`（three-views 的 Step 5B pre-flight 自动检查 auth）
- **`/notebooklm-kit:learn-test`（quiz / flashcards）** → 永久退役，无替代。如需评估学习效果，用外部工具
- **`/notebooklm-kit:manage`（notebook 增删改 / 分享）** → 永久退役。直接用 notebooklm.google.com web UI
- **`/notebooklm-kit:query`（跨 notebook 查询）** → 永久退役。同上

完整迁移指引：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)。

## 历史版本

- v2.x — MJ System 团队专属工具集
- v3.0.0（2026-05-11）— 通用化重构：删 5 个 MJ-system 专属插件 + mj-nlm 改名为 notebooklm-kit + 新增 learn-kit
- v3.1.0 — learn-kit 加 locate + scan 两个发现 skill
- v3.2.0 — learn-kit 加 generate-tier AI 三档生成 + HTML 渲染
- v3.2.1 — plugin.json schema 修复
- **v4.0.0**（2026-05-14）— notebooklm-kit 整个退役；nlm-studio 吸收到 learn-kit；marketplace 收敛为 1 plugin

## 文档

- 完整文档索引：[docs/INDEX.md](docs/INDEX.md)
- 贡献指引与发布流程：[CONTRIBUTING.md](CONTRIBUTING.md)（repo root，v4.6.3+ per Framework v1.6 §1.1）
- 变更日志：[CHANGELOG.md](CHANGELOG.md)
- 迁移指引：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)
- ADR：[v4.0.0 notebooklm-kit 退场决策](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md)

## 贡献

欢迎贡献！本项目采用 **bare repo + worktree** 开发模型，详见 [CONTRIBUTING.md](CONTRIBUTING.md)（v4.6.3 起回 repo root per Framework v1.6 §1.1）。

## 许可证

MIT
