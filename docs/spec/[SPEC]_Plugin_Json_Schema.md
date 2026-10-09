---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [SPEC] Plugin manifest

plugins/diagram-kit/plugin.json 声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。defaultPrompt 使用 $diagram-kit:arch-diagram。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。
