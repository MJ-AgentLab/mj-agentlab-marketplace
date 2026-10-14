---
type: guide
scope: marketplace
summary: "Portable plugin development and isolated testing workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-15
state: active
version: v2.27
---

# [GUIDE] Plugin development and testing

在独立 worktree 修改各插件根 manifest、skills 和资源。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 与 npm run smoke:codex。测试覆盖合法/非法 YAML、五插件候选索引及独立版本、版本原子更新与失败回滚、A6 防绕过、无资产发布状态机和 Python 校验器真实执行。新增插件、注册、严格校验、冻结资源、图标与安装预期同 PR 原子接入；main / 最新 Release v8.1.1 的三插件范围另记。

隔离安装使用独立 HOME、CODEX_HOME、cache、consumer cwd 和仓库镜像，验证 consumer 不发现 mp-*，repo 正确发现全部20个技能。全量候选安装原生元数据应解析七公开技能；普通 prompt 含 arch-diagram、glossary、concept 共三个，pop-quiz、learning-record-check、guide 与 communicate 显式加载另查 app-server 元数据与实际调用。Communication 独装普通发现0、原生1。用已安装的 arch-diagram 实际生成图与证据表，实际执行 Python 并记录返回码，确认 mcp list 为空。在两个目标客户端另行完成市场、安装、图标、入口与实际调用；无原生 UI 控制能力时明确记录限制，不能以 CLI 发现代替。

同步 Learning 替代后的十三组合为 Diagram、Learning Evidence、Explain、Diagram＋Explain、Diagram＋Learning Evidence＋Explain、Communication、Communication＋Explain、Communication＋Learning Evidence、Diagram＋Learning Evidence＋Explain＋Communication、HTML、HTML＋Explain、Diagram＋Learning Evidence＋Explain＋HTML、全五插件；每组独立 cache，核对技能、原生元数据、三份参考摘要、冻结记录与图标的源/缓存字节。安装矩阵和真实 Python 执行结果按候选 SHA/tree 与包内容绑定。

当前HTML为0.1.28后续修正候选，源12四包证据不继承新五包合成通过；新canonical须十三安装/六缓存Python及冻结行为矩阵，各阶段以准确候选SHA/版本及实际安装、模型和客户端账本为准。

HTML28验收保持CLI0.147/OpenAI/gpt-5.6-sol，下一轮显式选择支持的high推理；原defaultlow和旧失败保留。准备时分记actualDefault与selectedIdentity，核原proof和fresh model/list的模型、原默认及chosen支持。实际SDK身份、完整工具正文、连续UUID及判准仍须独立核验，不据配置或无模型guard宣布通过。

静态结构和发现只证明安装/加载。使用已安装技能执行独立合成角色验收：Pop Quiz 的职责、来源、2+1、预算、无答待答与只读；明确移交保存后保留实际状态；Learning Record Check 两阶段结论及缺材料手动恢复。所有保存测试显式隔离证据库，GitHub 写入用受控替身；完整基线、身份归属、重试/冲突/恢复、导入导出、分段共享及增量进度都以实际运行输出验证。共用脚本必须在安装缓存、无关 cwd 执行，证明仓库脚本区已删除且不是依赖。

实际客户端安装、调用和原生窗口分层核验。所有启用入口严格待答；默认、空返回、超时或关闭不算答复，未提交前窗口持续显示单独验证。文字重述/逻辑 pending 不算窗口通过；不可达或不合格入口延期。按 [新验收账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)登记方法、输入、版本、输出和限制；Agent 合成不冒充真人、窗口或 GitHub 非作者批准。PR5 明确可启用入口，Epic 保留延期，Owner 最终接受单独记录。

Explain Kit 单独安装及与 Diagram Kit、全部现有插件组合的隔离场景分别验收。代理检查解释路由、格式适应、未知术语及主任务保留，并执行安装缓存的 Python 图表校验；详见 [Explain Kit 验收](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。不能执行的客户端项记录约束，不交给 owner 例行手工完成。

Communication 按[固定验收契约](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)执行 S01–S12、C01–C18、必要双客户端基本可用性及后续 R01–R05。先核对冻结来源与提炼映射、实际脏状态及三份摘要哈希，再执行合成案例的保真、等待、授权、保存/回读/真实失败边界。两端分别记录候选来源/版本、安装、显式 communicate、图标、三类写作、关键等待、聊天交付与文件边界；缺项保持 PR3 draft。失败批次保留，修复产生新身份、新批次复验。

实际行为、UI 交互和安装验证分别记结果；当前 Communication 已有 CLI 行为与限定工具角色结果，双客户端验收仍缺项，具体见验收记录。现实场景效果、九例个人试用、三稿对照、读者反馈、采用度和效率评价本轮延期；基础通过不代表现实收益。Learning 先8.2.0，Communication 随后独立 minor；PR4 重查 From/To 与完整基线，PR3 市场保持未发布8.1.2，新包0.1.0。

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

PR2 已原子加入 HTML Guide Kit 0.1.0 与 Owner 选定的第二轮 A。保留原四组安装并新增 HTML 单独、HTML+Explain、全四插件，共七组；原生公开技能依次1/2/3/4/1/3/5，自然启用依次1/2/3/3/0/2/3。source/cache 必需资源按 SKILL_RESOURCES 比对 raw bytes、metadata 和路径归属；新guide恰有SKILL/native config/两参考，不允许missing或extra。连续行为测评与完整canonical安装分开，真实模型必须读取本次缓存，评审镜像剔除控制/答案。

| Version | Date | Summary |
|---|---|---|
| v2.6 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |

| Version | Date | Summary |
|---|---|---|
| v2.7 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |
| v2.8 | 2026-10-13 | 同步已公开Learning8.2.0基线，保留Communication开发五包与正式四包范围及历史限制 |
