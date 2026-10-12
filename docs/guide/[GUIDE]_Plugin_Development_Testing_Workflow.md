---
type: guide
scope: marketplace
summary: "Portable plugin development and isolated testing workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.5
---

# [GUIDE] Plugin development and testing

在独立 worktree 修改各插件根 manifest、skills 和资源。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 与 npm run smoke:codex。测试覆盖合法/非法 YAML、四插件候选索引及独立版本、版本原子更新与失败回滚、A6 防绕过、无资产发布状态机和 Python 校验器真实执行。新增插件、注册、严格校验、冻结资源、图标与安装预期同 PR 原子接入；main / 最新 Release v8.1.1 的三插件范围另记。

隔离安装使用独立 HOME、CODEX_HOME、cache、consumer cwd 和仓库镜像，验证 consumer 不发现 mp-*，repo 正确发现全部20个技能。全量候选安装原生元数据应解析五公开技能；普通 prompt 含 arch-diagram、glossary、concept 共三个，pop-quiz 与 communicate 显式加载另查 app-server 元数据与实际调用。Communication 独装普通发现0、原生1。用已安装的 arch-diagram 实际生成图与证据表，实际执行 Python 并记录返回码，确认 mcp list 为空。在两个目标客户端另行完成市场、安装、图标、入口与实际调用；无原生 UI 控制能力时明确记录限制，不能以 CLI 发现代替。

Communication 候选的九组合为 Diagram、Understanding、Explain、Diagram＋Explain、原三插件、Communication、Communication＋Explain、Communication＋Understanding、全四插件；每组独立 cache，核对技能、原生元数据、三份参考摘要、冻结记录与图标的源/缓存字节。安装矩阵和真实 Python 执行结果按候选 SHA/tree 与包内容绑定。

pop-quiz 的静态结构和 CLI 发现只证明可安装和加载；使用已安装技能进行职责差异、可信答案、2+1 分支、无答不推进、题量边界与只读行为回放，再独立检查 Codex Side Chat 和 ChatGPT 桌面端快照分支。按 [Understanding Kit 验收记录](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md) 分层登记实际结果。工程开发代理可执行仓库测试；pop-quiz 在学习会话只读取已有证据，不运行项目代码或测试。

Explain Kit 单独安装及与 Diagram Kit、全部现有插件组合的隔离场景分别验收。代理检查解释路由、格式适应、未知术语及主任务保留，并执行安装缓存的 Python 图表校验；详见 [Explain Kit 验收](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。不能执行的客户端项记录约束，不交给 owner 例行手工完成。

Communication 按[固定验收契约](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)执行 S01–S12、C01–C18、必要双客户端基本可用性及后续 R01–R05。先核对冻结来源与提炼映射、实际脏状态及三份摘要哈希，再执行合成案例的保真、等待、授权、保存/回读/真实失败边界。两端分别记录候选来源/版本、安装、显式 communicate、图标、三类写作、关键等待、聊天交付与文件边界；缺项保持 PR3 draft。失败批次保留，修复产生新身份、新批次复验。

实际行为、UI 交互和安装验证分别记结果，当前候选尚未完成行为与双客户端验收。现实场景效果、九例个人试用、三稿对照、读者反馈、采用度和效率评价本轮延期；基础通过不代表现实收益。Learning 先8.2.0，Communication 随后独立 minor；PR4 重查 From/To 与完整基线，PR3 市场保持未发布8.1.2，新包0.1.0。

## Brand design and assets

新增插件、仓库标识或图标修改时调用 [mp-design-icon](../../.agents/skills/mp-design-icon/SKILL.md)，读取 [品牌规范](../rule/[STANDARD]_Brand_Identity.md)。新候选在选择前只写候选目录；已有批准直接重用。更新 exports.json 后运行 npm run icons:export、npm run icons:preview，检查实际尺寸，两个 manifest 图标字段使用包内 ./assets/icon.png。导出命令也支持单文件 --input SVG --output PNG --size pixels。

常规 npm test / validate / smoke:codex 包含图标有效性与源/安装副本一致性；额外的模型演练验证选择停点和已有批准复用。保持开发资源只在仓库作用域发现。实际品牌验收见 [RUNBOOK](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。

## HTML Guide Kit staged acceptance

[新增 ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md) 区分治理、原子接入与最终工程验收。PR1 保持原三个插件/四公开技能；npm run check 和 npm run smoke 分别作为既有 check:baseline-tools 和 smoke:codex 的兼容入口。独立版本工具支持尚未接入的 html-guide-kit scope，但缺失 manifest 继续 fail closed。

PR2 保留原安装组合，增加 HTML Guide 单独、与 Explain 和全部插件组合，检查图标/参考/版本/调用策略/缓存来源与资源字节，真实连续模型会话通过六组阻断行为后才可合并。PR3 扩展全部边界并完成两个目标客户端的新插件交互和实际 merge 复验。判准见 [验收 SPEC](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)，实际执行与未覆盖项见 [RUNBOOK](../runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。

模型实际读取本次安装缓存技能；中性随机 consumer 路径，隔离答案/评审控制，并明确排除 reviewer-only 的镜像内容。完整 canonical 身份、评审镜像身份与缓存运行哈希分别记录，不要求镜像 tree 与完整仓库相同。真实失败、回放、未覆盖与修正后的调用分开保存。2026-10-12 Owner 调整：本次不执行现实场景的理解效果测试，effect_status 保持未测量；效果另行测试，不阻断工程接入，也不能将模型行为或点击完成解释为理解改善。

| Version | Date | Summary |
|---|---|---|
| v2.5 | 2026-10-12 | 保留 HTML 分段验收并接入 Communication 九组合、冻结资源、两个显式入口及基础验收范围 |
