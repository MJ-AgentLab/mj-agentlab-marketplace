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

plugins/diagram-kit/plugin.json、plugins/understanding-kit/plugin.json、plugins/explain-kit/plugin.json 与 plugins/html-guide-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；understanding-kit 0.1.2、diagram-kit 0.3.1、explain-kit 0.1.1 已随市场 v8.1.1 发布，html-guide-kit 0.1.0 为 develop 开发候选。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write；understanding-kit 使用 $understanding-kit:pop-quiz，capabilities 仅 Read。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。显式调用的 pop-quiz 在 agents/openai.yaml 设置 allow_implicit_invocation: false。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。

## Packaged icons

本仓要求 extensions.com.openai.interface.logo 和 composerIcon，当前均指向 ./assets/icon.png；SVG 源保存为 assets/icon.svg。Dark 字段可选，声明时接受相同检查。项目分发格式固定为 PNG；这是本仓约定，[官方](https://developers.openai.com/plugins/deploy/submission) 也支持其他图像格式。图标路径须 ./ 开头、使用正斜线，不能含遍历、绝对路径、协议、符号链接或 junction 等重解析链接。每包自己拥有全部引用文件。

PNG 须为方形、48–4096 像素、最大 5 MiB，本次导出固定 1024×1024。先检查大小与头部尺寸，再用 pngjs 完整解码并检查 CRC。通用资源函数 validatePluginIcons 不检查插件名称；市场注册白名单继续由原验证器管理，未来获准插件进入相同资源检查。隔离安装比较源与安装包的全部图标字段及内容 SHA-256；自动通过不代表客户端实际显示或视觉验收。品牌规则见 [STANDARD](../rule/[STANDARD]_Brand_Identity.md)。

Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1 在本任务中保持不变；此前版本记录属于对应历史开发或发布身份。

## HTML Guide Kit development contract

新增 plugins/html-guide-kit/plugin.json 0.1.0，唯一 guide，Read；defaultPrompt 仅指向 $html-guide-kit:guide。原生配置明确 allow_implicit_invocation: false，short_description 为 25–64 字符且 default_prompt 只有一次自身调用。技能目录精确包含 SKILL.md、agents/openai.yaml 与 references/guide-framework.md、references/interaction-design.md；不存在多余运行文件，也不得通过移除 Markdown 指针让缺失资源通过。

SKILL_RESOURCES 定义必需包内资源；安装比较严格验证源/缓存 manifest 身份、版本、能力，逐字节比较 manifest、SVG/PNG 和全部必需技能资源，拒绝符号/junction 借用。源、镜像和缓存逐文件 SHA-256 独立记录，reviewer-only 文件从行为镜像排除。两只读显式技能为 pop-quiz 和 guide，普通提示自然发现仍仅 arch-diagram/glossary/concept。产品合同见 [HTML Guide ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md)。
