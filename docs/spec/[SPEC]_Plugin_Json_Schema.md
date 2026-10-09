---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [SPEC] Plugin manifest

diagram-kit 和 explain-kit 各自的根 plugin.json 声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。diagram-kit 只公开 arch-diagram；explain-kit 只公开 glossary 和 concept。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。defaultPrompt 只调用所属插件的公开技能并覆盖每个入口：$diagram-kit:arch-diagram，或 $explain-kit:glossary / $explain-kit:concept。各技能的 agents/openai.yaml 提供显示名、简述、正确的默认调用和自然发现策略。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。
