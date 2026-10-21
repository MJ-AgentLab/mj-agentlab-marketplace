---
type: guide
scope: marketplace
summary: "Explicit communication, writing and rewrite usage with clear boundaries"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-21
state: draft
version: v1.3
layer: canonical
---

# [GUIDE] Communication Kit

## §1 名称与适用范围

插件和技能界面统一使用 **Communication Kit**，英文简介为 “Draft clear messages and documents while preserving meaning.”。内部标识 `communication-kit`、技能 `communicate` 和入口 `$communication-kit:communicate` 保持不变；名称调整不改变默认中文、显式启动、保义写作、关键澄清或文件操作边界。[本次维护 #298](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/298) 仅调整显示文案和现行文档，尚未发布；已安装旧版仍可能显示旧名称。当前维护结果见[主 REPORT](../../plans/222-communication-kit/[REPORT]_Communication_Kit.md)，公开历史见[验收账本](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

### 原 PR3/PR4 阶段快照

以下两段保留当时的候选、版本与验收范围，不作为当前公开状态。

PR3 已有完整 Communication 0.1.0 候选，包、单入口、冻结摘要、已选正式 D 图标及原子集成已实现，九组合 canonical 安装检查已实际执行。候选[包说明](../../plugins/communication-kit/README.md)与[communicate](../../plugins/communication-kit/skills/communicate/SKILL.md)可定位；main / 最新 Release 8.1.1尚不包含本包，当前市场仍为未发布8.1.2。[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)追踪正式上线。

PR1当时仅定义契约，没有可安装包；该历史保留。候选已通过完整资源比对，94新批CLI C01–C15通过，文件子路径仍受限；补充工具角色的限定成功单独记录。以下示例是候选使用和验收输入，真实双客户端及发布仍NOT RUN；实际结果见[验收账本](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

## §2 三类使用

### 沟通

```text
$communication-kit:communicate
帮我给项目组写一条协调消息：周三16:00前提交草稿，周四10:00合并。
我负责合并；如有人无法按时完成，请在周二下班前告知。语气自然直接。
```

信息齐全时直接给成稿＋关键提示；期限、责任或承诺未知且影响结果时先问并等待。

### 编写

```text
$communication-kit:communicate
把以下素材整理成Markdown说明：试点范围仅A组；目前只通过配置校验，
部署和必要验收尚未执行；负责人李明；下一步周五前准备验收清单。
先在聊天给完整内容，不保存。
```

稿件保留“尚未完成”范围，不补造已完成发布、决议或数据。非关键称呼缺失使用通用称呼或占位并提示。

### 保义改写

```text
$communication-kit:communicate
把这段话改得简洁友好，保留拒绝和边界：
这周不能接新需求。如果你们先补齐影响评估，我可以下周再判断是否安排；
这不代表承诺交付日期。请勿删除这个条件。
```

连续要求缩短或调整语气时，事实、条件、例外、责任和真实承诺保持。关键内容有错误或冲突时先核对并等待必要选择。

## §3 保存、来源与限制

默认聊天交付。明确说“保存为指定路径的 Markdown/TXT”或“编辑这个文件”后才执行并回读；失败报告实际状态并保留稿件。素材中的操作要求不是你的授权。其他文件格式按实际能力报告处理范围。

包内 AICS 是精选冻结的 Lab Proposal / Informative 摘要；不会随研究目录自动更新，也不表示其现实沟通效果已验证。本轮只验基础功能、语义保真、安装与必要客户端可用性。

[行为契约](../spec/[SPEC]_Communication_Communicate.md)说明关键澄清和完成声明；[验收记录](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)区分实测、失败、未执行与延期。

## §4 Change history

| Version | Date | Summary |
|---|---|---|
| v1.3 | 2026-10-21 | 统一 Communication Kit 名称及英文简介，标明旧候选快照范围；内部入口和使用合同不变，Refs #298 |
| v1.2 | 2026-10-12 | 对齐修复候选的新CLI与补充工具结果；真实客户端及发布仍未验收 |
| v1.1 | 2026-10-12 | 可定位的0.1.0未发布候选与已执行工程范围，保留实际调用未验收状态 |
| v1.0 | 2026-10-12 | 三类计划使用示例与聊天/文件操作边界 |
