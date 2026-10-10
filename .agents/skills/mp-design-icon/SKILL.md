---
name: mp-design-icon
description: "Use for MJ marketplace logo design, new-plugin icons or existing icon changes / 仓库标识与插件图标设计; inherit the approved brand and show candidates before connecting a new design."
---

# mp-design-icon

读取目标插件根 manifest、公开 SKILL.md 与实际用途；仓库主标读取项目说明。从当前 SKILL.md 定位仓库根目录，读取 [品牌规范](../../../docs/rule/[STANDARD]_Brand_Identity.md)、[参数](../../../assets/brand/tokens.json)、[提示词](../../../assets/brand/design-prompts.md) 及适用的 [原标和批准稿来源](../../../assets/brand/provenance.json)。开发资源留在仓库，插件只携带自己的图标。

1. 提炼真实功能的单一符号，并说明与 MJ 品牌的关系。按 D 风格使用厚实几何形、白色圆角底和少量节点；仓库主标保留 MJ 并表达模块组合。已有明确选择先核对目标和批准稿，直接复用，不重复请求选择。
2. 新设计先制作 2–3 个可编辑 SVG 候选，在隔离的候选目录导出 1024 PNG 与实际 32、48、64 像素深浅背景预览。比较功能辨识、留白和小尺寸清晰度，向 owner 提供带影响说明的推荐。
3. **未选择的新设计停在候选阶段**：保留预览并等待 owner 选择；正式图标、README 和 manifest 保持原状态。推荐不构成批准。选择后记录目标、候选和会话依据；已有批准直接进入导出接入。
4. 代理执行最终导出与接入：插件资源放包内 assets/icon.svg、assets/icon.png，logo 与 composerIcon 指向 ./assets/icon.png；仓库主标放 assets/brand/marketplace 并接入 README。使用仓库的 export-icons.mjs；单文件调用支持 --input、--output、--size，批量清单为 exports.json。运行 npm run icons:export、npm run icons:preview、npm run validate 和受影响测试，验收记录到品牌 RUNBOOK。

自动检查证明资源有效及安装一致。逐张检查实际小尺寸预览，视觉统一和功能辨识由审阅确认。新功能形状不沿用其他插件的符号。需要栅格概念时使用可用的图像生成工具；正式 SVG 保持可编辑，栅格参考不能冒充矢量源。提交、推送、PR 和发布按已有授权处理；代理执行工程操作，未决 owner 事项遵循 [执行规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
