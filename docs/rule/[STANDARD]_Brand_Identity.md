---
type: standard
scope: marketplace
summary: "MJ brand geometry, plugin icon sources and selection contract"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.0
---

# [STANDARD] MJ brand identity

## Scope and authority

团队原标与本次 D 批准稿原样保存在 [来源资源](../../assets/brand/provenance.json)。仓库主标采用 owner 选定的 A 斜向模块连接，保留 MJ 识别度；三个插件按已批准的 D 稿重绘。候选与最终设计分开保存。开发入口为 [mp-design-icon](../../.agents/skills/mp-design-icon/SKILL.md)，不进入插件公开技能目录。

## Visual rules

[参数](../../assets/brand/tokens.json) 集中维护 1024 方形画布、白色圆角底、颜色、轮廓、留白与渐变方向；[模板](../../assets/brand/templates/icon.svg) 和 [提示词](../../assets/brand/design-prompts.md) 供未来设计复用。深蓝 #223D66 为主体，蓝 #126CB0 与青 #37C3D2 为连接和强调；渐变统一左上至右下。圆角底半径 144，安全内边距 96，主要连接线宽 48，厚轮廓参考 72。MJ 主标的连接线为 32，模块边长 72；与字形融合时保留足够空间，不能机械套用插件外框。

使用厚实几何形和少量连接点，避免细网、光晕和装饰堆积。Diagram 为三节点连接图，Explain 为气泡与灯泡，Understanding 为问号与选项卡；未来插件根据真实功能提炼新的符号。主标模块表达可扩展的插件生态，不代表固定插件数量。白色圆角底外保留透明角区，同一资源用于深浅背景；本次不增加 Dark 变体。

## Sources, selection and export

正式资源以独立可编辑 SVG 为源，不嵌入批准稿位图，不依赖系统字体。每包保存自己的 assets/icon.svg 与 assets/icon.png；集中清单 [exports.json](../../assets/brand/exports.json) 驱动导出。需要改共享参数时更新 tokens 并同步 SVG 的品牌主题，再导出；仓库检查负责发现主题漂移。

新设计先显示 2–3 个候选与实际 32/48/64 像素的深浅背景预览，owner 选择后记录依据再接入。已有明确批准直接复用；方向选择不等于批准所有后续候选。推荐不构成批准。

使用 npm run icons:export 和 npm run icons:preview。导出器锁定 @resvg/resvg-js 2.6.2，PNG 检查锁定 pngjs 7.0.0。正式 PNG 为 1024×1024；32 像素预览用于审阅，不是分发资源。资源接口、48–4096 像素与 5 MiB 限制见 [manifest SPEC](../spec/[SPEC]_Plugin_Json_Schema.md) 和 [OpenAI 官方要求](https://developers.openai.com/plugins/deploy/submission)。

## Acceptance

自动验证证明字段、资源、安全路径、解码与安装一致性；小尺寸辨识及视觉统一由审阅确认。真实客户端显示独立记录，不能用 CLI 元数据代替。实际结果见 [品牌验收](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。
