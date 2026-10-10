---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-10
state: active
version: v2.4
---

# [SPEC] Plugin manifest

plugins/diagram-kit/plugin.json、plugins/understanding-kit/plugin.json 与 plugins/explain-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；本次未发布品牌候选为 understanding-kit 0.1.2、diagram-kit 0.3.1、explain-kit 0.1.1；已发布 v8.1.0 的版本记录保持。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write；understanding-kit 使用 $understanding-kit:pop-quiz，capabilities 仅 Read。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。显式调用的 pop-quiz 在 agents/openai.yaml 设置 allow_implicit_invocation: false。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。

## Packaged icons

本仓要求 extensions.com.openai.interface.logo 和 composerIcon，当前均指向 ./assets/icon.png；SVG 源保存为 assets/icon.svg。Dark 字段可选，声明时接受相同检查。项目分发格式固定为 PNG；这是本仓约定，[官方](https://developers.openai.com/plugins/deploy/submission) 也支持其他图像格式。图标路径须 ./ 开头、使用正斜线，不能含遍历、绝对路径、协议、符号链接或 junction 等重解析链接。每包自己拥有全部引用文件。

PNG 须为方形、48–4096 像素、最大 5 MiB，本次导出固定 1024×1024。先检查大小与头部尺寸，再用 pngjs 完整解码并检查 CRC。通用资源函数 validatePluginIcons 不检查插件名称；市场注册白名单继续由原验证器管理，未来获准插件进入相同资源检查。隔离安装比较源与安装包的全部图标字段及内容 SHA-256；自动通过不代表客户端实际显示或视觉验收。品牌规则见 [STANDARD](../rule/[STANDARD]_Brand_Identity.md)。

本次未发布补丁候选为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1；此前正文中的版本为历史开发或发布身份。
