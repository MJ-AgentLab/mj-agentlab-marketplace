---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-19
state: active
version: v2.9
layer: canonical
---

# [SPEC] Plugin manifest

## Current HTML site extension

本次 HTML Guide Kit 0.1.37 候选将包级能力改为 Read/Write，公开 guide 与 site 两个显式入口，manifest 示例分别覆盖二者并保留原始128 Unicode scalar预算。guide 的四份运行资源与只读聊天合同保持；site 的精确资源、行为和四项最小门槛见[扩展SPEC](./[SPEC]_HTML_Learning_Artifact.md)。以下原HTML唯一入口/Read和版本集合保留历史时点范围，新site以扩展SPEC及实际manifest为准。当前开发集合五包八公开/五显式/三自然，20仓库技能不变；正式发布结果另据[任务#274](../../plans/274-html-learning-artifact/INDEX.md)证据。

plugins/diagram-kit/plugin.json、plugins/learning-evidence-kit/plugin.json、plugins/explain-kit/plugin.json 、plugins/html-guide-kit/plugin.json 与 plugins/communication-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；Diagram0.3.1/Explain0.1.1/Learning Evidence0.1.0已随main/v8.2.0公开；HTML0.1.0与Communication0.1.0为未发布开发候选。已发布历史版本记录保持。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write。learning-evidence-kit 的 capabilities 为 Read/Write，defaultPrompt 完整覆盖 $learning-evidence-kit:pop-quiz 与 $learning-evidence-kit:learning-record-check；两个 agents/openai.yaml 都设置 allow_implicit_invocation: false，不能路由其他技能。包权限允许明确移交后的共用持久化与授权共享，Pop Quiz 诊断阶段仍只读。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

defaultPrompt 必须为 1–3 条有效字符串，各原始字符串最多 128 个 Unicode scalar values，保留完整的本包技能路由并覆盖全部公开技能。计数不是 UTF-16 code units、UTF-8 字节或视觉字形数。Codex 0.147.0 的[固定源码](https://github.com/openai/codex/blob/be6e8eac029b183056b7e4402879f15d2c85f61b/codex-rs/core-plugins/src/manifest.rs#L539-L557)先折叠空白再按 Rust chars 计数，并忽略超长示例；本仓保守校验原值，不依赖客户端归一化或静默丢弃。原值超预算时失败，不能因此丢失某个公开入口。此预算只约束 manifest 的 listing defaultPrompt，不外推到 agents/openai.yaml 的 default_prompt。

共用 Python 3.12 标准库入口和模块位于包内 scripts/，由实际 SKILL.md locator 定位插件根。严格检查资源归属、普通文件及安装副本执行；仓库 scripts/learning-evidence/ 过渡位置在 PR4 删除，不作为安装依赖。Communication PR3 开发五个插件、七公开技能和四个显式策略；独立公开候选三个插件、五技能和两个学习策略保持精确校验，未完成切换不能通过兼容白名单。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。

## Communication candidate

Communication 的根 identity 为 communication-kit，唯一技能 communicate，展示“沟通助手”，候选根 version 为0.1.0。capabilities 精确为 Read/Write；manifest 的 defaultPrompt 与技能 agents/openai.yaml 只调用 $communication-kit:communicate，short_description 为25–64字符，allow_implicit_invocation 为布尔 false。pop-quiz、learning-record-check、guide 与 communicate 是四个显式入口；当前全量普通发现为三个技能，原生清单为七个，Communication 独装普通发现为零、原生清单为一个。

communicate 使用包内 aics-policy.md、task-patterns.md、source-provenance.md 与 aics-snapshot.json。冻结记录 schemaVersion 1，状态 Lab Proposal / Informative，记录实际捕获日期、来源章节/日期、源字节 SHA-256 与 Git 状态（包括 modified/untracked，不能由 HEAD 推断 clean），以及三份 Markdown 摘要的实际 SHA-256 和提炼/改编/排除映射。源路径仅追溯，消费者运行不访问研究目录。包内摘要改字节未更新哈希、资源缺失、包外路径或链接组件均须失败；哈希完整性不替代语义对照。

新增插件与注册、严格集合、图标、必需资源及安装预期原子落地。运行边界见 [Communication SPEC](./[SPEC]_Communication_Communicate.md)，基础验收见 [RUNBOOK](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)；实际行为与必要客户端验收按记录逐项登记，现实效果测试本轮延期。

## Packaged icons

本仓要求 extensions.com.openai.interface.logo 和 composerIcon，当前均指向 ./assets/icon.png；SVG 源保存为 assets/icon.svg。Dark 字段可选，声明时接受相同检查。项目分发格式固定为 PNG；这是本仓约定，[官方](https://developers.openai.com/plugins/deploy/submission) 也支持其他图像格式。图标路径须 ./ 开头、使用正斜线，不能含遍历、绝对路径、协议、符号链接或 junction 等重解析链接。每包自己拥有全部引用文件。

PNG 须为方形、48–4096 像素、最大 5 MiB，本次导出固定 1024×1024。先检查大小与头部尺寸，再用 pngjs 完整解码并检查 CRC。通用资源函数 validatePluginIcons 不检查插件名称；市场注册白名单继续由原验证器管理，未来获准插件进入相同资源检查。隔离安装比较源与安装包的全部图标字段及内容 SHA-256；自动通过不代表客户端实际显示或视觉验收。品牌规则见 [STANDARD](../rule/[STANDARD]_Brand_Identity.md)。

当前候选集合为 Diagram 0.3.1 / Learning Evidence 0.1.0 / Explain 0.1.1 / HTML Guide 0.1.0 / Communication 0.1.0；marketplace 保持未发布8.1.2，main / 最新 Release 保持8.1.1及前三插件。PR4 核对实际版本转换与发布范围，此处不执行 bump。

| Version | Date | Summary |
|---|---|---|
| v2.5 | 2026-10-12 | 显式 Communication 单入口、精确能力、冻结摘要和原子资源契约 |

## HTML Guide Kit development contract

新增 plugins/html-guide-kit/plugin.json 0.1.0，唯一 guide，Read；defaultPrompt 仅指向 $html-guide-kit:guide，每项最多128字符，避免 CLI0.147.0忽略示例入口。原生配置明确 allow_implicit_invocation: false，short_description 为 25–64 字符且 default_prompt 只有一次自身调用。技能目录精确包含 SKILL.md、agents/openai.yaml 与 references/guide-framework.md、references/interaction-design.md；不存在多余运行文件，也不得通过移除 Markdown 指针让缺失资源通过。

SKILL_RESOURCES 定义必需包内资源；安装比较严格验证源/缓存 manifest 身份、版本、能力，逐字节比较 manifest、SVG/PNG 和全部必需技能资源，拒绝符号/junction 借用。源、镜像和缓存逐文件 SHA-256 独立记录，reviewer-only 文件从行为镜像排除。guide 为 Read 显式入口；Learning 两入口及 Communication 的 communicate 属于 Read/Write 插件，其诊断和写入条件分别遵从各自契约，普通提示自然发现仍仅 arch-diagram/glossary/concept。产品合同见 [HTML Guide ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md)。


| Version | Date | Summary |
|---|---|---|
| v2.6 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |

| Version | Date | Summary |
|---|---|---|
| v2.7 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |
| v2.8 | 2026-10-13 | 同步已公开Learning8.2.0基线，保留Communication开发五包与正式四包范围及历史限制 |
