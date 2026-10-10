---
type: runbook
scope: marketplace
summary: "Brand icon source, local acceptance evidence and client limitations"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.0
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

本地 CLI 安装与资源检查不证明 ChatGPT 或 Codex 桌面列表和输入框已显示图标。当前原生应用控制不可用，两个桌面客户端的实际显示暂未验证。按 PR 技能规则创建 draft，补齐两个客户端的实际显示验收后可转为正式审阅；远端 CI 与独立 GitHub 审查以关联 PR 的实际记录为准。本记录中的 PASS 仅表示本地检查结果，未执行合并或正式发布。

## References

- [品牌规范](../rule/[STANDARD]_Brand_Identity.md)
- [品牌决定](../adr/[ADR]_Brand_Identity_And_Icon_Workflow.md)
- [设计入口](../../.agents/skills/mp-design-icon/SKILL.md)
