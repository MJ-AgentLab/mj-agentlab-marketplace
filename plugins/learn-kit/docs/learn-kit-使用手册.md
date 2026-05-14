---
title: learn-kit 使用手册
purpose: 新手 5 分钟上手 learn-kit 5 个 skills 的操作指引
version: v1.0.0 / marketplace v4.0.0
updated: 2026-05-14
audience: 第一次用 learn-kit 的项目维护者 / 学习者
related: learn-kit-01-positioning.md / learn-kit-05-governance-boundary.md / docs/[ADR]_NotebookLM_Kit_Retirement.md
---

# learn-kit 使用手册

把项目里枯燥的规则清单（STANDARD / SPEC / ADR / RFC）变成可学习材料的工具集。5 个 skills 覆盖「发现 → 撰写 → 渲染 → 多媒体」全链路。

> **v4.0.0 关键变更**：marketplace 从 2 plugins（learn-kit + notebooklm-kit）收敛为 **1 plugin（learn-kit）**。原 notebooklm-kit 整个退役；其核心多媒体场景被 `/learn-kit:nlm-studio` 吸收并加入 **View-Purpose Preservation** 原则。退役场景（quiz / flashcards / cross-notebook query / source 管理）永久放弃，详见 §8 与 [docs/[ADR]_NotebookLM_Kit_Retirement.md](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/docs/%5BADR%5D_NotebookLM_Kit_Retirement.md)。

## 1. 30 秒认知

| Skill | 一句话 | 触发关键词 |
|-------|--------|-----------|
| `/learn-kit:init` | 在项目根 scaffold `learning/` 子系统骨架（一次性） | "初始化学习子系统" |
| `/learn-kit:scan` | 枚举项目所有可学候选文档 + 标注已解读 / 未解读 | "项目里有什么可学的" |
| `/learn-kit:locate <query>` | 反查具体概念 / 口诀 / 部分文档名到对应文档 | "学 X / 解释 X / X 在哪" |
| `/learn-kit:generate-tier` | AI 生成三档（零基础 / 结构 / 挑战）学习文档 + 可选 HTML | "为 X 生成学习文档 / 三档学习材料" |
| `/learn-kit:nlm-studio` ⭐ v1.0.0 | 把三档 markdown 推 NotebookLM 出至多 13 个多媒体 artifact | "为 X 出 NLM 多媒体 / 想要个音频版" |

## 2. 安装（3 步）

```bash
# 1. 添加 marketplace
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace

# 2. 安装插件
/plugin install learn-kit@mj-agentlab-marketplace

# 3. 验证
/plugin list | grep learn-kit  # 应看到 v1.0.0
```

### 2.1 nlm-studio 前置依赖（仅当要用多媒体流时）

`/learn-kit:nlm-studio` 需要 NotebookLM 账号 + 本地 CLI 配置。前 4 个 skills（init / scan / locate / generate-tier）**零外部依赖**，跳过本节即可。

```bash
# 一次性：安装 notebooklm-mcp CLI（learn-kit 的 .mcp.json 自动调用它）
uv tool install notebooklm-mcp-cli --with socksio --force

# 一次性：Google OAuth 登录（token 自动 refresh，但寿命 15-30 min，长跑会用尽——见 §7）
nlm login
```

如果之前你装过 `mj-nlm@my-marketplace`（来自 ranzuozhou/my-marketplace 的 legacy plugin），**建议卸载**避免 MCP server 重复加载：

```bash
/plugin uninstall mj-nlm@my-marketplace
```

## 3. 5 分钟上手

**场景**：你想把项目里的某个 STANDARD 文档变成可学习材料 + 多媒体。

```text
Step 1 (一次性)         /learn-kit:init
                       → 在 <project-root>/learning/ 下创建骨架

Step 2 (开放式发现)      "项目里有什么可学的？"
                       → 触发 /learn-kit:scan
                       → 看到候选 docs 表格，按引用频率排序

Step 3 (锁定主题)        "为 HITL 主题生成三档学习文档"
                       → 触发 /learn-kit:generate-tier
                       → 多选 source 来源 → 多选三档 → 确认 topic
                       → 生成 [LEARNING]_HITL_{foundation,structural,challenge}.md

Step 4 (可选 HTML)       (skill 自动问) "是否生成 HTML 学习页？"
                       → 选「是」 → 自动渲染 3 个 .html (同目录同 basename)

Step 5 (可选 NLM 多媒体) (skill 自动问 step 9) "是否进一步推到 NotebookLM 出多媒体？"
                       → 选「是」 → 自动调 /learn-kit:nlm-studio <topic>
                       → 经过 Quota confirm gate → 跑 7-15 min → 至多 13 个在线 artifact
                       → 终端打印 notebook URL + artifact 表

Step 6 (后续追问)        "DLSRS 在哪个文档？"
                       → 触发 /learn-kit:locate
                       → 返回带置信度的候选清单
```

打开 HTML：Windows 下 `start <绝对路径>` 即可在浏览器预览。打开 NLM artifact：浏览器访问终端打印的 `notebook URL`。

## 4. 各 Skill 详解

### 4.1 `/learn-kit:init`

**何时用**：每个项目运行**一次**。

**做什么**：在 `<project-root>/learning/` 下创建：

```text
learning/
├── INDEX.md          # 子系统总入口
├── _meta/
│   └── METHODOLOGY.md # 8 阶段方法论（手工流的认知框架）
└── _archive/.gitkeep
```

**注意**：`disable-model-invocation: true` —— 必须用户主动 `/learn-kit:init` 触发，模型不会自动调用。

### 4.2 `/learn-kit:scan`

**何时用**：进入新项目第一周；想知道「这里有什么可学」时。

**触发示例**：
- "项目里有什么可学的？"
- "推荐一个学习路径"
- "show me the docs catalog"
- "本项目有哪些 STANDARD"

**输出**：
- Top uninterpreted canonical docs 表（按引用频率排）—— 优先去解读这些
- Interpreted canonical docs 表 —— 已有 `[LEARNING]_*.md` 配套的
- Recommended next actions

**变量提示**（可选，写在 prompt 里）：
- `tag:` 限定单类（如 "list ADRs"）
- `path:` 限定子目录（如 "in docs/rule/"）
- `unread_only:` 只看未解读
- `limit:` 控制条数

### 4.3 `/learn-kit:locate <query>`

**何时用**：你脑里有个具体概念名 / 口诀 / 部分标题，想知道在哪个文档。

**触发示例**：
- "学 DLSRS"
- "解释一下 ISFSV"
- "讲讲 §3.3 of HITL prompt"
- "where is RelativePath documented"
- "5 维 HITL 规则在哪"

**返回**：
- Interpreted [LEARNING] docs（首选层，conf 0.70-0.95）
- Source canonical docs（次选层）
- Project recognition profile（标 confidence < 0.7 时给警告）

**容易混淆**：
- 「学 X」→ locate ✓
- 「项目里有什么可学」→ scan，不是 locate
- 「X 是怎么实现的」→ 代码问题，不是 locate
- 「改 X」→ 编辑请求，不是 locate

### 4.4 `/learn-kit:generate-tier`

**何时用**：有 user_question + 源材料，想 AI 一键产出学习文档。

**触发示例**：
- "为 HITL 主题生成零基础版学习文档"
- "基于 [STANDARD]_X 出三版学习材料"
- "generate foundation+challenge tier docs for service-architecture"
- "生成学习 HTML"

**10 步交互流程**（v1.0.0 起在原 8 步基础上加 step 9 NLM 询问 + 原 step 9 改名 step 10）：

```text
Step 0  Intake             从 prompt 抽 topic + user_question
Step 1  Pre-flight         检查 learning/INDEX.md (没有则提示先 /init)
Step 2  Source acquisition AskUserQuestion 多选 4 种来源:
                            ☐ 项目内文件路径 (paste @file 或 路径)
                            ☐ 复用 scan/locate 发现
                            ☐ 用户粘贴长文本
                            ☐ 整目录扫描
Step 3  Tier selection     AskUserQuestion 多选 3 档 (默认全选):
                            ☐ foundation 零基础版 (Recommended)
                            ☐ structural 结构版
                            ☐ challenge  挑战版
Step 4  Topic confirmation 单选 / 输入 topic-slug + 冲突策略
Step 5  Per-tier generate  按 tier 分别 AI 生成 markdown
Step 6  INDEX update       自动追加到 learning/INDEX.md §Tier Documents
Step 7  HTML offer         AskUserQuestion 单选「是否生成 HTML?」
Step 8  HTML render        spawn Explore subagent 做 concept→code grounding
                          → 渲染单文件 HTML (SVG 图 + Tab + 暗亮主题 + 复制为 prompt)
Step 9  NLM offer ⭐ v1.0.0 AskUserQuestion 单选「是否推到 NotebookLM 出多媒体?」
                          → 默认 Skip；选 Yes 则调 /learn-kit:nlm-studio <topic>
                          → 选 Skip 不会自动触发；可日后手动跑
Step 10 Summary            列所有路径 + 推荐阅读顺序
```

**输出文件**：

```text
learning/<topic>/
├── [LEARNING]_<topic>_foundation.md      # 零基础（少术语 + 多类比）
├── [LEARNING]_<topic>_foundation.html    # 配对 HTML (可选)
├── [LEARNING]_<topic>_structural.md      # 结构（概念地图 + 边界）
├── [LEARNING]_<topic>_structural.html
├── [LEARNING]_<topic>_challenge.md       # 挑战（反例 + 迁移题 + 诊断）
└── [LEARNING]_<topic>_challenge.html
```

**关键约定**：
- HTML 与 markdown **同目录、同 basename**，仅扩展名不同
- HTML 全离线（无 CDN），双击或 `start <file>` 直接看
- 每个概念挂真实仓库代码引用 (file:line+snippet)，不空泛
- HTML 仅供人类浏览器查看；**`/learn-kit:nlm-studio` 不上传 HTML 到 NLM**（dogfood 发现 NLM 拒收 HTML，详见 §4.5）

### 4.5 `/learn-kit:nlm-studio` ⭐ v1.0.0 新能力

**何时用**：已经 generate-tier 完成 → `learning/<topic>/` 至少有 3 个 `.md`（不需要 HTML）→ 想出多媒体在线浏览。

**触发示例**：
- "为 <topic> 出 NLM 多媒体" / "make NLM artifacts for <topic>"
- "/learn-kit:nlm-studio <topic>"
- "学完 <topic> 想要个音频版"
- "把 <topic> 喂给 NotebookLM" / "feed <topic> to NotebookLM"
- "publish <topic> learning to NotebookLM"

**前置依赖**：见 §2.1（`uv tool install notebooklm-mcp-cli` + `nlm login`）。

**输入约束**：仅上传 3 个 `.md`（HTML 不上传——v1.0.0 dogfood 发现 NLM 在 file-mode 和 text-mode 下都拒收 HTML 源；HTML 仅供浏览器查看）。

**输出**：**至多 13 个在线 artifact**（不下载二进制）：

| Artifact | Foundation | Structural | Challenge | 备注 |
|----------|-----------|-----------|-----------|------|
| audio | ✓ | ✓ | ✓ | deep_dive 双主持人对谈，15-20 min |
| video | ✓ | ✓ | ✓ | 8-12 min，4-6 scene + visual cue |
| slide_deck | ✓ | ✓ | ✓ | 15-25 张 |
| infographic | ✓ | ✓ | ✓ | 单 poster，5-8 panel |
| mind_map | — 1 shared / topic（view-agnostic）— | | | 不三档循环：dogfood 发现 NLM mind_map 媒介对 view 差异化无视 |

合计：4 view-cycled × 3 + 1 shared mind_map = **13 个 artifact**。

**5 步 workflow**（每 Step 都 refresh auth）：

```text
Step 1  Pre-flight       refresh_auth + server_info (本地)
                        → notebook_list (真 auth gate，dogfood finding #1)
                        → 检 3 必需 .md (HTML 不检)
Step 2  Re-run guard     notebook_list 查 learn-kit:<topic> 是否已存
                        → 存在则 AskUserQuestion 4 选 1:
                          regenerate / replace sources / new-timestamped / abort
Step 3  Notebook setup   notebook_create (按需)
                        → 3 个 source_add 并发上传 .md
                        → 强制 notebook_get 核验真实 source 列表
                          (dogfood finding #4: source_add 错误响应不可靠)
Step 3.5 Quota gate ⚠️  AskUserQuestion: "13 artifact ≈ 65% NLM Studio 日上限
                        (~20/天)；本 skill 看不见账户当日已用量"
                        → confirm / reduce subset / abort
Step 4  Artifact gen    3 parallel batches:
                        - Round 1 (foundation): 5 calls (含 mind_map)
                        - Round 2 (structural): 4 calls (跳过 mind_map)
                        - Round 3 (challenge):  4 calls (跳过 mind_map)
                        每 batch 间 refresh_auth；
                        mid-run auth 失败 retry-once 后 abort；
                        studio_status 幂等查跳过 existing
Step 5  Terminal recap   markdown 表格 + notebook URL；零本地落盘
```

**质量原则一：View-Purpose Preservation**

4 个 view-cycled 类型的同一 type 三档应风格上**可盲测分类**：

- foundation audio：日常类比开场 + 5 条 TL;DR 收尾
- structural audio：系统化概念地图为主轴 + 自检清单收尾
- challenge audio：每段以挑战性提问收尾（probing question，不是总结）

video / slide_deck / infographic 同理。SKILL.md 内置 failsafe 校验 view-prefix 模板的 5 段结构（§1 Pedagogical purpose / §2 Audience / §3 Style / §4 Anti-patterns / §5 Success criteria）完整性，缺则 abort。

mind_map 是 NLM 媒介本身的限制例外（dogfood finding #5），不强求 view 差异化，故收敛为 1 shared / topic。

**质量原则二：LANGUAGE & TERMINOLOGY**

每个 artifact 的 focus_prompt 含一段统一的语言策略指令：

- **主体内容用简体中文**：标题 / 旁白 / 解说 / slide 正文 / mind_map 节点 / infographic panel
- **行业标准技术术语保留英文原词**：`frontmatter` / `schema` / `ADR` / `SKILL.md` / `track` / `canonical` / `deprecated` / `YAML` / `MCP server` / `loader` / `governance` / `hygiene` / `lint` 等
- **代码 / 路径 / 标识符 verbatim**：`/learn-kit:nlm-studio` / `notebook_id` / `mcp__plugin_learn-kit_notebooklm-mcp__*`

策略由 `templates/language-directive.md` 单一文件源管理；改它一处即影响全部 13 artifact。

**关键约束**：

- 在线浏览（绝不下载二进制）
- **零本地落盘**（无 `_artifacts/` 文件夹，不动 INDEX.md，notebook + artifact URL 仅打到终端 —— 需要保存请自行 bookmark）
- 13 artifact ≈ 一日 65% Studio quota（一天最多跑 1 个 topic）

## 5. 三档怎么选

| 场景 | 推荐 |
|------|------|
| 第一次接触陌生主题 | foundation 零基础版（少术语 + 多类比 + 完整故事） |
| 已有印象想建结构 | structural 结构版（概念地图 + 关系表 + 适用边界） |
| 想检验自己是否真懂 | challenge 挑战版（反例 + 失败案例诊断 + 迁移题） |
| 学习新主题完整覆盖 | **全选三档**（推荐顺序：foundation → structural → challenge） |
| 想要随时听 / 看 / 看图 | 三档全选 → generate-tier step 9 同意调 nlm-studio 出多媒体 |

## 6. 真实使用案例

### 案例 A：完全新人 onboard 一个项目

```text
1. /learn-kit:init                                # 第一天
2. "项目里有什么可学的"                            # 第一周
   → scan 返回 top 5 uninterpreted STANDARD
3. "为 STANDARD_HITL 主题生成三档学习文档"          # 锁定第一个主题
   → 多选: source = 项目文件路径 + 整目录扫描
   → tiers = 三档全选
   → HTML = 是
   → step 9 NLM = 是  ⭐ 一键链到多媒体
   → 13 artifact 在 notebooklm.google.com 等着
4. 通勤时听 audio_foundation；办公时看 slide_structural；周末刷 challenge 反例
5. "学 DLSRS"                                     # 后续追问
   → locate 反查到 challenge 版的 §10 迁移题
```

### 案例 B：团队成员想为某个 spec 出培训材料

```text
1. /learn-kit:init  (如果没初始化)
2. "为 service-architecture 主题，基于 docs/rule/[STANDARD]_SvcArch.md
    + docs/[ADR]_Service_Decomposition.md 出三档学习材料 + HTML"
   → skill 直接走 step 2-8（已知 source paths + tiers + html_hint = 是）
3. step 9 NLM 提示 → 选「Skip」（不出多媒体），把 markdown + HTML 发团队
4. 一周后团队反馈想要个音频版 → 单独跑 /learn-kit:nlm-studio service-architecture
```

### 案例 C：自我检测某主题理解程度

```text
1. "为 X 主题只生成挑战版"
   → tiers = challenge (单选)
   → HTML = 否（直接看 markdown）
   → step 9 NLM = 否（自检不需要多媒体）
2. 做 §9 边界判断题 + §10 迁移应用题
3. 看 §13 盲区定位表，对应回去补 foundation / structural
```

### 案例 D：已生成的 learning/<topic>/ 出多媒体（v1.0.0 新能力）

```text
1. 项目里已有 learning/documentation-framework/ (3 md + 可选 3 html，
   之前用 /learn-kit:generate-tier 生成的)
2. "为 documentation-framework 出 NLM 多媒体"
   → 触发 /learn-kit:nlm-studio documentation-framework  (独立调用)
   → Step 1 pre-flight 检 3 .md ✓
   → Step 2 re-run: 若已存 learn-kit:documentation-framework notebook
                    → 4 选 1（regenerate / replace sources / new / abort）
                    → 没存就直接进 Step 3
   → Step 3 创建 notebook + 3 并发 source_add + notebook_get 核验
   → Step 3.5 Quota gate：确认 13 artifact ≈ 65% 日上限
   → Step 4 跑 3 parallel batches (5+4+4) 共 13 个 artifact，7-15 min
   → Step 5 终端打印 notebook URL + 13 行 artifact 表
3. 打开 notebook URL，在 NLM web UI 浏览/分享/下载
```

## 7. 常见踩坑 + 排错

| 症状 | 原因 | 处理 |
|------|------|------|
| skill 不触发 | 关键词不在 description trigger 列表 | 改用更直接的触发词："为 X 生成三档学习文档" / "为 X 出 NLM 多媒体" |
| 生成内容空洞 | source 太少或不相关 | step 2 多加几个 source 来源；用户粘贴更多文本 |
| HTML 概念未挂代码 | 仓库里确实没有对应代码 | HTML 会自动列入「文档 vs 实现」段，无需手动修 |
| HTML 体积过大 (> 200KB) | source 太多 / tier 内容太长 | 减少 source；或只生成单档 |
| init 报「learning 已存在」 | 之前跑过 | 选 Skip / Merge / Abort 之一 |
| nlm-studio 跑 7-15 min 中途报「Authentication expired」 | NLM token 寿命 15-30 min，长跑用尽 | 终端 `! nlm login` 再调；skill 已含 mid-run retry-once 兜底；仍失败重跑会走 re-run guard 的 "regenerate" 路径自动跳过已成 artifact |
| 想上传 HTML 但 nlm-studio 提示「仅 .md」 | v1.0.0 起 HTML 不上传到 NLM（dogfood 发现 NLM 在 file-mode 和 text-mode 都拒收 HTML） | 设计如此，非 bug。HTML 仅供浏览器查看；NLM artifact 由 `.md` 内容驱动，质量不受影响 |
| nlm-studio 跑到一半「quota exceeded」 | 当日已用过 NLM Studio quota（empirical 上限 ~20/天）；本 skill 看不见账户当日已用量 | 用 Step 3.5 quota gate 的「Reduce subset」选项缩小批量；或换日重跑（regenerate 路径会自动跳过 already-generated） |
| 同一 topic 跑两次 NLM 端看到重复 source | source_add 错误响应不可靠（dogfood finding #4：server 可能 async 成功但 client 收到 error） | 罕见。skill 已加 notebook_get 强制核验；如真重复，用 NLM web UI 手动删；或 Step 2 选 "replace sources" |
| 同 topic 三档 mind_map 看起来差不多 | NLM 媒介对 mind_map 的 view 差异化指令无视（dogfood finding #5） | 设计决定：v1.0.0 起 mind_map 收敛为 1 shared / topic，不再三档循环。view 差异化在 audio/video/slide/infographic 中显著 |
| `nlm login` 报错或浏览器登录失败 | OAuth flow 故障 / proxy 干扰 / token 已损 | 重跑 `nlm login`；或检查 `~/.nlm/` 目录权限；问题持续看 [notebooklm-mcp-cli upstream](https://pypi.org/project/notebooklm-mcp-cli/) |
| 工具列表同时出现 `mcp__plugin_mj-nlm_*` 和 `mcp__plugin_learn-kit_*` | 同时装了 legacy `mj-nlm@my-marketplace` 和新 `learn-kit@mj-agentlab-marketplace` —— 两套 MCP server 重复加载 | 见 §2.1 末尾：`/plugin uninstall mj-nlm@my-marketplace` |

## 8. 与姊妹工具的边界

| 想做 | 用什么 |
|------|-------|
| 在项目里产出 markdown 学习文档 + 可选 HTML | `/learn-kit:generate-tier` |
| 把已有三档转 NotebookLM 多媒体（audio / video / slide / infographic / mind_map）| `/learn-kit:nlm-studio` ⭐ v1.0.0 新（吸收 v3.x notebooklm-kit 的核心场景） |
| 手工按 8 阶段方法论自己写 framework 文档 | 读 `learning/_meta/METHODOLOGY.md`，手写 `[LEARNING]_<topic>_Common.md` |
| 出考试题 / 闪卡 / quiz | v4.0.0 **永久放弃**（v3.x notebooklm-kit:learn-test 已退役）—— 用外部评估工具或 NotebookLM web UI 手动跑 |
| 跨 notebook 查询 / Deep Research | v4.0.0 **永久放弃**（v3.x notebooklm-kit:query 已退役）—— 直接用 notebooklm.google.com web UI |
| Notebook 增删改 / 分享 | v4.0.0 **不再提供**（v3.x notebooklm-kit:manage 已退役）—— 用 notebooklm.google.com web UI |

> 与 v0.3.0 时代「notebooklm-kit 作为独立 sibling plugin」的关系完全改变。v4.0.0 起 marketplace **仅含 learn-kit 一个 plugin**，NLM 集成（仅多媒体场景）已吸收到 `/learn-kit:nlm-studio`；其余 6 个 v3.x notebooklm-kit skill 永久退役。完整决策记录见 [docs/[ADR]_NotebookLM_Kit_Retirement.md](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/docs/%5BADR%5D_NotebookLM_Kit_Retirement.md)。

## 9. 进阶提示

- **多选混搭 source**：step 2 可同时勾「项目内文件路径 + 用户粘贴」，用 paste 补充上下文
- **tier 跳跃**：可以先只生成 foundation 看效果，再追加 structural / challenge（重跑 skill 时选「Append `.v2`」或 Overwrite）
- **跨项目 dogfood**：learn-kit 通用，可在 mj-system / mj-agent / 任何外部项目装，但记得在 CLAUDE.md 声明 `[STANDARD]_/[SPEC]_/...` tag prefix 提高 scan/locate 识别 confidence
- **HTML 阅读体验优化**：30 分钟深读为目标设计；浮动 ToC + 复制为 Prompt 按钮可加速延伸学习
- **NLM 多媒体节奏建议**：13 artifact 占当日 NLM Studio quota 65%——一天最多深做 1 个 topic；多 topic 分日跑更稳。Step 4 的 mid-run auth retry-once 只兜底单次过期，长跑前先 `nlm login` 一遍刷新 token 更稳
- **NLM artifact 持久化**：skill **不**本地落盘 URL；想长期追溯请自己在浏览器加 bookmark 或在外部笔记里记 notebook URL + artifact ID
- **View-Purpose 盲测**：跑完 13 artifact 后挑同一 type 的三档（如 audio_foundation / audio_structural / audio_challenge），让一个没看过 view 标签的旁人听后猜哪是哪——3/3 正确是健康；如果分不清，回去看 generate-tier 三档 markdown 是否本身差异化不足

## 10. 关联文档

- 项目内方法论原文：`learning/_meta/METHODOLOGY.md`（8 阶段方法的认知框架，generate-tier 的理论基础）
- 学术解读系列：本目录 `learn-kit-01..05*.md`（项目定位 / 8 阶段 / RFC worked example / 治理边界）
  - 01 / 04 / 05 已同步到 v1.0.0 / marketplace v4.0.0（2026-05-14 同批更新）
  - 02 / 03 是方法论核心 + RFC 范例，跨版本稳定，无需更新
- 上游仓库 README：https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/plugins/learn-kit/README.md
- 上游 CHANGELOG：https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/plugins/learn-kit/CHANGELOG.md
- v4.0.0 release：https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v4.0.0
- v4.0.0 决策 ADR：https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/docs/%5BADR%5D_NotebookLM_Kit_Retirement.md
- v3.x → v4.0.0 迁移指引：https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/docs/MIGRATION_GUIDE.md
