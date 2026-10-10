---
type: runbook
scope: marketplace
summary: "Brand icon source, merged-tree acceptance and client limitations"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.1
---

# [RUNBOOK] Brand identity acceptance

## Identity and approved design

日期：2026-10-10（Asia/Taipei）。基准 develop 77f4395；独立分支 codex/marketplace-brand-icons。市场保持 8.1.1（未发布），插件候选版本为 diagram-kit 0.3.1 / understanding-kit 0.1.2 / explain-kit 0.1.1。

Owner 选择 D 插件风格及仓库 A 斜向连接主标；原标与批准稿的来源和 SHA-256 见 [来源账本](../../assets/brand/provenance.json)。主标候选 [A/B/C 对比](../../assets/brand/previews/marketplace-candidates.png) 与 [D 图标对比](../../assets/brand/previews/plugin-family.png) 包含真实 32、48、64 像素及深浅背景。最终主标为 [SVG](../../assets/brand/marketplace/logo.svg) / [PNG](../../assets/brand/marketplace/logo.png)。

## Verification evidence

| 检查 | 实际结果 | 证据及限制 |
| --- | --- | --- |
| SVG / PNG 导出 | PASS | 7 个源（含候选历史）导出 28 个正式/尺寸 PNG；正式图标 1024×1024，原始参考哈希未改变 |
| npm run validate | PASS | 三插件、四公开技能、20 开发技能；含完整 PNG 解码与品牌主题/来源校验 |
| npm run check:baseline-tools | PASS | codex-cli 0.147.0 精确匹配 |
| npm run smoke:codex | PASS | 四种现有隔离安装，逐包核对 logo/composerIcon 引用和内容；消费者 0 个开发技能、仓库 20 个 |
| 实际安装 Python 校验 | PASS | 包含 Diagram 的三个安装场景均实际扫描 1 图、FAIL 0 |
| 新图标技能选择停点 | PASS | 新名称 workflow-kit 生成 3 候选、40 文件；正式 assets 未创建，manifest/README/导出清单/来源账本哈希保持 |
| 已批准图标复用 | PASS | 直接复用 Diagram D 稿，无重复选择或新候选，重新导出与原 PNG 哈希一致；5 个相关契约测试通过 |

安装明细见 [JSON](evidence/brand-install-results.json)，独立模型演练见 [JSON](evidence/brand-skill-forward-tests.json)。复用演练的首次全仓校验因隔离夹具缺少 workflow 和 session 指针失败；修正夹具后复验 PASS，失败与修正分别保留，不改写为首次通过。两次初始 shell 调用加载了宿主 profile，后续均关闭；实际主动读写限制在隔离目录。

插件版本工具三个转换均执行 dry-run 和实际应用；市场 VERSION / badge 保持 8.1.1。最终 npm test：240 项全部通过，0 失败、0 跳过；包含真实 Python 执行测试。图标和导出专用测试 10 项通过。

## Local self-review

基准固定为 develop 77f4395。diff 与批准范围一致：新增集中品牌资源、20 号开发技能、通用图标校验及安装比较，没有新增公开技能、MCP、市场索引 logo 字段或 CI workflow。历史 archive 和已发布 CHANGELOG 正文保持；A6 触发项伴随根 AGENTS.md 实质同步。Owner 在本地验收后授权提交、推送和创建 PR；合并与正式发布仍需各自授权。

## Visual review

查看实际尺寸预览：三个插件的节点图、气泡灯泡和问号卡片可区分，厚实轮廓及蓝青色系统一致。主标 A 的 MJ 清晰，斜向三个模块延续原标连接走向；owner 已选择 A。此项为设计审阅判断，自动检查不证明视觉风格。

## Client and delivery limits

本地 CLI 安装与资源检查不证明 ChatGPT 或 Codex 桌面列表和输入框已显示图标。当前原生应用控制不可用，两个桌面客户端的实际显示暂未验证。PR #203 最初按技能规则以 draft 创建，现已实际合并；合并不构成未执行的客户端验收或独立批准证据。本记录分别保存本地、远端 CI 和合并后安装结果，未执行正式发布。

## Post-merge verification

[PR #203](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/203) 于 2026-10-10 02:20:45 UTC 合入 develop。已测 head 为 75dbb96028c751152d01f55ea79229b4adc15ed1，实际 merge 为 261b5ead04c441d028fca4730cbd8a82b3b8ff88；两者 Git tree 都为 22abb753345d774e56f0bd7b571ef4590e72a41a。合并后四种安装从该 merge SHA 的临时 detached checkout 执行，不使用未提交文件。

| 检查 | 实际结果 | 证据及限制 |
| --- | --- | --- |
| PR 远端 CI | PASS | [结构与 Ubuntu/Windows baseline](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016448392)、[A6](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016448393)；[push CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016403841) 亦通过 |
| 合并提交 canonical 安装 | PASS | 四种隔离安装均成功，logo/composerIcon 引用、PNG 内容与源一致，消费者开发技能 0、仓库 20；[实际安装明细](evidence/brand-post-merge-install.json) |
| 合并后实际 Python 校验 | PASS | 三个含 Diagram 的安装场景均实际扫描 1 图、FAIL 0、WARN 0 |
| 分支与版本 | 已核实 | 本地 develop 已 fast-forward 到 merge 并保持干净；远端 main 65a05a8f8e1fc908cacd7d1bbb27f2510e93adf4 是 develop 的祖先，无需再次同步 main |
| GitHub 独立批准 | 未见记录 | PR reviews API 返回空数组，不能把成功 CI 或实际合并写成独立批准 |
| 桌面列表与输入框显示 | 未验证 | 原生应用控制不可用；CLI 安装结果不替代客户端显示验收 |

市场保持未发布 8.1.1，develop 插件版本为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1。main 保持 8.1.0，最新公开 Release 为 v8.1.0（Release ID 407832742，published，非 prerelease），标签绑定 d8a12d612ee0907a919e302c76bca9f906353669。本次未创建标签或 Release，未执行下一补丁预升；下一次 pre-bump 只在正式发布后按既有流程进行。

Owner 已确认 #203 合并并要求继续后续工作；本轮仅完成合并后核验、开发工作区同步、已合并特性分支清理及文档收尾。正式发布仍需要客户端验收、独立批准、required checks 和单独的发布授权，现有缺项保持未完成状态。

## References

- [品牌规范](../rule/[STANDARD]_Brand_Identity.md)
- [品牌决定](../adr/[ADR]_Brand_Identity_And_Icon_Workflow.md)
- [设计入口](../../.agents/skills/mp-design-icon/SKILL.md)
