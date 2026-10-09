---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.3
---

# [SPEC] Plugin manifest

plugins/diagram-kit/plugin.json、plugins/understanding-kit/plugin.json 与 plugins/explain-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；understanding-kit 初始合并版本为 0.1.0、后续修正候选为 0.1.1，diagram-kit 为 0.3.0，explain-kit 为 0.1.0。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write；understanding-kit 使用 $understanding-kit:pop-quiz，capabilities 仅 Read。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。显式调用的 pop-quiz 在 agents/openai.yaml 设置 allow_implicit_invocation: false。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。
