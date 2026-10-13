---
type: spec
scope: marketplace
summary: "Maintained portable manifest and OpenAI presentation contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.7
---

# [SPEC] Plugin manifest

plugins/diagram-kit/plugin.json、plugins/learning-evidence-kit/plugin.json 与 plugins/explain-kit/plugin.json 各声明 https://agent-plugins.org/schemas/1.0.0/plugin.schema.json。根字段为 name、version、description、author、repository、license、keywords、extensions。根 version 是对应插件的权威版本；当前未发布候选为 learning-evidence-kit 0.1.0、diagram-kit 0.3.1、explain-kit 0.1.1，PR5 已准备 marketplace 8.2.0。技能由根 skills/ 自动发现，无 skills 字段、兼容包装或空 MCP 文件。公开 v8.1.1 的旧 Understanding Kit 身份保留在历史发布记录。

extensions.com.openai.interface 提供 displayName、shortDescription、longDescription、developerName、category、capabilities、defaultPrompt。diagram-kit 的 defaultPrompt 使用 $diagram-kit:arch-diagram，capabilities 为 Read/Write。learning-evidence-kit 的 capabilities 为 Read/Write，defaultPrompt 完整覆盖 $learning-evidence-kit:pop-quiz 与 $learning-evidence-kit:learning-record-check；两个 agents/openai.yaml 都设置 allow_implicit_invocation: false，不能路由其他技能。包权限允许明确移交后的共用持久化与授权共享，Pop Quiz 诊断阶段仍只读。SKILL.md 的 name/description 使用严格 YAML；本仓描述预算 1024 字符。验证实现见 scripts/validate-portable.mjs；[官方格式](https://developers.openai.com/plugins/build/plugins)。

defaultPrompt 必须为 1–3 条有效字符串，各原始字符串最多 128 个 Unicode scalar values，保留完整的本包技能路由并覆盖全部公开技能。计数不是 UTF-16 code units、UTF-8 字节或视觉字形数。Codex 0.147.0 的[固定源码](https://github.com/openai/codex/blob/be6e8eac029b183056b7e4402879f15d2c85f61b/codex-rs/core-plugins/src/manifest.rs#L539-L557)先折叠空白再按 Rust chars 计数，并忽略超长示例；本仓保守校验原值，不依赖客户端归一化或静默丢弃。原值超预算时失败，不能因此丢失某个公开入口。此预算只约束 manifest 的 listing defaultPrompt，不外推到 agents/openai.yaml 的 default_prompt。

共用 Python 3.12 标准库入口和模块位于包内 scripts/，由实际 SKILL.md locator 定位插件根。严格检查资源归属、普通文件及安装副本执行；仓库 scripts/learning-evidence/ 过渡位置在 PR4 删除，不作为安装依赖。三个插件、五公开技能和两个显式策略保持精确校验，未完成切换不能通过兼容白名单。

plugins/explain-kit/plugin.json 使用相同 portable 格式，独立初始版本 0.1.0，capabilities 为 Read。defaultPrompt 覆盖 $explain-kit:glossary 与 $explain-kit:concept，且不得路由到其他插件；各技能的 agents/openai.yaml 准确调用自身入口，short_description 为 25–64 字符，allow_implicit_invocation 为 true。

## Packaged icons

本仓要求 extensions.com.openai.interface.logo 和 composerIcon，当前均指向 ./assets/icon.png；SVG 源保存为 assets/icon.svg。Dark 字段可选，声明时接受相同检查。项目分发格式固定为 PNG；这是本仓约定，[官方](https://developers.openai.com/plugins/deploy/submission) 也支持其他图像格式。图标路径须 ./ 开头、使用正斜线，不能含遍历、绝对路径、协议、符号链接或 junction 等重解析链接。每包自己拥有全部引用文件。

PNG 须为方形、48–4096 像素、最大 5 MiB，本次导出固定 1024×1024。先检查大小与头部尺寸，再用 pngjs 完整解码并检查 CRC。通用资源函数 validatePluginIcons 不检查插件名称；市场注册白名单继续由原验证器管理，未来获准插件进入相同资源检查。隔离安装比较源与安装包的全部图标字段及内容 SHA-256；自动通过不代表客户端实际显示或视觉验收。品牌规则见 [STANDARD](../rule/[STANDARD]_Brand_Identity.md)。

Learning Evidence Kit 复用已批准 Understanding 图标的内容，assets/brand 的导出/预览归属切换到新包；图标复用和静态校验不证明客户端显示或原生窗口通过。入口启用按 [验收账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)记录。
