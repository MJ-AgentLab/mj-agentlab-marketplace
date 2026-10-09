# Diagram Kit

公开技能只有 arch-diagram，支持 ChatGPT 桌面端和 Codex 本地。根 plugin.json 是 portable manifest，OpenAI 展示信息在 extensions.com.openai；无需 MCP。

通过 $diagram-kit:arch-diagram 请求 context、container、component、code、sequence、state-machine 或 deployment 图。源码证据按 L0–L3 获得，每个元素关联文件行号；未知事实询问用户，不推测填充。资源从安装后的 SKILL.md locator 解析，Python 校验器保留独立执行。

[技能说明](skills/arch-diagram/SKILL.md)、[CHANGELOG](CHANGELOG.md)、[升级说明](../../docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。
