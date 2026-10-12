---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.5
---

# [SPEC] Plugin manifest

plugins/diagram-kit/plugin.json、plugins/understanding-kit/plugin.json、plugins/explain-kit/plugin.json 与 plugins/communication-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；前三包已随 main / v8.1.1 发布，Communication 0.1.0 为 PR3 未发布候选。已发布历史版本记录保持。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write；understanding-kit 使用 $understanding-kit:pop-quiz，capabilities 仅 Read。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。显式调用的 pop-quiz 在 agents/openai.yaml 设置 allow_implicit_invocation: false。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。

## Communication candidate

Communication 的根 identity 为 communication-kit，唯一技能 communicate，展示“沟通助手”，候选根 version 为0.1.0。capabilities 精确为 Read/Write；manifest 的 defaultPrompt 与技能 agents/openai.yaml 只调用 $communication-kit:communicate，short_description 为25–64字符，allow_implicit_invocation 为布尔 false。pop-quiz 与 communicate 是两个显式入口；当前全量普通发现为三个技能，原生清单为五个，Communication 独装普通发现为零、原生清单为一个。

communicate 使用包内 aics-policy.md、task-patterns.md、source-provenance.md 与 aics-snapshot.json。冻结记录 schemaVersion 1，状态 Lab Proposal / Informative，记录实际捕获日期、来源章节/日期、源字节 SHA-256 与 Git 状态（包括 modified/untracked，不能由 HEAD 推断 clean），以及三份 Markdown 摘要的实际 SHA-256 和提炼/改编/排除映射。源路径仅追溯，消费者运行不访问研究目录。包内摘要改字节未更新哈希、资源缺失、包外路径或链接组件均须失败；哈希完整性不替代语义对照。

新增插件与注册、严格集合、图标、必需资源及安装预期原子落地。运行边界见 [Communication SPEC](./[SPEC]_Communication_Communicate.md)，基础验收见 [RUNBOOK](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)；实际行为与必要客户端尚未验收，现实效果测试本轮延期。

## Packaged icons

本仓要求 extensions.com.openai.interface.logo 和 composerIcon，当前均指向 ./assets/icon.png；SVG 源保存为 assets/icon.svg。Dark 字段可选，声明时接受相同检查。项目分发格式固定为 PNG；这是本仓约定，[官方](https://developers.openai.com/plugins/deploy/submission) 也支持其他图像格式。图标路径须 ./ 开头、使用正斜线，不能含遍历、绝对路径、协议、符号链接或 junction 等重解析链接。每包自己拥有全部引用文件。

PNG 须为方形、48–4096 像素、最大 5 MiB，本次导出固定 1024×1024。先检查大小与头部尺寸，再用 pngjs 完整解码并检查 CRC。通用资源函数 validatePluginIcons 不检查插件名称；市场注册白名单继续由原验证器管理，未来获准插件进入相同资源检查。隔离安装比较源与安装包的全部图标字段及内容 SHA-256；自动通过不代表客户端实际显示或视觉验收。品牌规则见 [STANDARD](../rule/[STANDARD]_Brand_Identity.md)。

当前候选集合为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1 / Communication 0.1.0；marketplace 保持未发布8.1.2，main / 最新 Release 保持8.1.1及前三插件。PR4 核对实际版本转换与发布范围，此处不执行 bump。

| Version | Date | Summary |
|---|---|---|
| v2.5 | 2026-10-12 | 显式 Communication 单入口、精确能力、冻结摘要和原子资源契约 |
