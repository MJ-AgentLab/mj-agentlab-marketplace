---
type: adr
scope: marketplace
summary: "Adopt D plugin icons and MJ module logo with a local design skill"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.0
---

# [ADR] Brand identity and icon workflow

| Field | Value |
| --- | --- |
| Status | accepted |
| Date | 2026-10-10 |
| Author | marketplace-maintainers / owner decision |
| Scope | marketplace |
| Reversibility | reversible |

## Context

已发布三个插件没有包内展示图标。Owner 批准 D 品牌融合稿及独立设计入口，随后提供团队 MJ 原标并选择仓库主标的 MJ＋模块节点方向；本次候选 A 斜向连接也由 owner 明确选定。未来插件需要同一品牌语言和真实功能差异。

## Decision

采用 [品牌 STANDARD](../rule/[STANDARD]_Brand_Identity.md) 和仓库开发技能 mp-design-icon。团队原标、D 稿、参数、模板、提示词、候选与来源集中保存，正式插件资源仍各自包内携带。新设计先预览再选择；已有批准直接复用。仓库主标用于 README，不更换组织头像或添加未经确认的市场索引字段。

导出使用锁定的 resvg；通用 PNG 资源校验不依赖插件名称，并接入原有验证和隔离安装链。维护三个公开插件、四个公开技能，仓库开发技能从 19 项增至 20 项。

## Alternatives

E 使用功能图标＋MJ 角标，归属更明确但小尺寸难辨；F 使用 MJ 主标＋功能副标，品牌突出但插件更相似。Owner 已选择 D。仓库主标 B 枢纽布局与 C 阶梯布局保存为候选历史，最终采用 A。

## Consequences and implementation

增加矢量源、PNG、主题参数与实际尺寸预览的维护成本，换取统一风格、包内可移植资源和可重复导出。自动检查不证明视觉质量，模型演练不替代独立 GitHub 批准。实现入口见 [开发指南](../guide/[GUIDE]_Plugin_Development_Testing_Workflow.md)。

插件补丁准备为 diagram-kit 0.3.1、understanding-kit 0.1.2、explain-kit 0.1.1；marketplace 保持未发布 8.1.1。旧版本与历史证据保持原样，不创建标签或 Release。

## Acceptance and decision log

2026-10-10：Owner 批准执行计划，提供原标，选择 A 斜向连接。测试与实际限制记入 [RUNBOOK](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。正式发布仍需原有授权、客户端证据、required checks 和独立审查。
