---
type: standard
scope: marketplace
summary: "Canonical and working layers, reusable task documents, history and A6"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-19
state: active
version: v3.0
layer: canonical
supersedes:
  - ../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v2.0.md
---

# [STANDARD] Documentation framework

## Scope, layers and formats

按[任务文档与交付 ADR](../adr/[ADR]_Task_Documentation_Layers_And_Delivery.md)治理 docs/plans 普通文档。分层、用途和生命周期分别表达：

| 维度 | 含义 | 判定 |
|---|---|---|
| `layer: canonical` | 按领域长期维护的唯一正本 | 草稿 SPEC 仍为 canonical，接受另由真实决定表明 |
| `layer: working` | 任务计划、接受基线、真实决定、实施事实 | REPORT 完成后仍为 working，对应决定和事实保持权威性 |
| `type` | 用途 | adr、guide、runbook、spec、standard、postmortem、plan、report |
| `state` | 生命周期 | draft、active、deprecated、archived，不代替进度、批准或验证结果 |

新纳入治理的普通文档必需 `type/scope/summary/owner/created/updated/state/version/layer` 九字段，使用合法 YAML。layer 只允许 canonical 或 working。目录约束用途，不能由目录、更新时间或文件名推定接受与否。

正式正本保留于 docs/rule、adr、guide、runbook、spec、postmortem，使用 `[TAG]_<Topic>.md`；PLAN/REPORT 是过程用途。docs/INDEX.md 为保留名导航，亦带九字段。跨任务公共台账、长期问题记录可在所属领域保留 working，必填非空 `purpose` 说明用途/维护范围并由 owner 负责；正式复盘按长期用途维护于 postmortem。不能把整个 docs 树自动判为 canonical。

根 README、CHANGELOG、CONTRIBUTING、GLOSSARY、AGENTS，SKILL.md、manifest、原始证据及冻结来源遵循各自格式，不追加普通九字段。SKILL.md 必须是严格 YAML。模板在 docs/_templates，创建时替换占位并明确分层。

## Task collection and thin entry

跨会话维护、多 PR 协作、正式交接或独立验收需要时建立 `plans/<既有主任务编号>-<稳定主题>/`；无编号使用稳定主题，不为目录额外建 Issue。主 Issue/Epic 是进度正本，无 Issue 时链接真实任务或 PR 跟踪入口。小型单次修改继续 Issue/PR。

任务目录先建一个 INDEX 和恰好一份主 PLAN；出现实际结果后建立最多一份主 REPORT：

- 任务普通文档必填 `task`，精确等于目录 basename；`tracking` 是真实已知的本仓库 Issue/PR HTTPS URL，或稳定任务入口 `codex://threads/<UUID>` / `https://chatgpt.com/c/<UUID>`，同目录一致。尚无 Issue/PR 可直接使用实际任务入口，不为建目录强建 Issue，不编造身份；定位暂不可得时记录限制并补实际来源。
- INDEX 使用 `type: guide`、working；`plan` 为本目录主 PLAN 相对链接，REPORT 存在后填写 `report`，未产生则省略；`canonical` 数组至少链接一项适用 docs 正本。
- PLAN/REPORT 分别使用 `type: plan/report`、working 与 `[PLAN]_<Topic>.md` / `[REPORT]_<Topic>.md` 命名，由 INDEX 绑定。新会话、子 PR、失败恢复及批次切换均复用。
- 使用具名来源清单时，INDEX 的 `sources` 指向 `./source-bindings.json`，正文提供入口。原件、快照及运行闭包各按实际用途检查。
- evidence/ 只保存必要脱敏证据和恢复信息，保留原格式；凭据、环境文件、受限备份进入各自受限存储。

INDEX 只导航，允许极短进展快照：阶段、关键缺口、下一操作/责任人、日期与主 Issue 具体来源；过期或冲突时以 Issue 为准。目标/范围/验收链接正本或接受来源，不复制完整需求、技术规范和进度表。任务完成本身不触发搬迁或删除，后续恢复复用原目录。

## Main documents and acceptance history

PLAN 保存范围/非目标、原意/接受来源、完整接受基线、顺序/依赖、验证安排、风险/恢复、真实决定和待同步 canonical。REPORT 保存实施事实、逐项验证、独立合成验收、失败恢复、缺口/延期、交付及 Owner 接受依据。

准入评估、过程评估、任务决定、接受基线优先作为主文档有界章节；独立维护/评审/访问隔离需要时才拆分并从入口链接。长期技术决定由 ADR 维护。确认、失败、恢复、重跑和批次追加条目，复用两份主文档。

接受基线绑定当时完整内容、版本或可恢复快照，保留来源、实际时间、适用范围及后继关系。Owner 明确批准在范围内生效，Agent 继续已授权工作，同一项交付完成前同步受影响 canonical；未同步项列为缺口。仅 PLAN 较新不足以改变合同。

原始输入、真实接受、实施事实、验证结果分别追溯。验证绑定实际内容、SHA/tree/资源版本，记录方法、环境、输入/动作/输出和未覆盖项；哈希不单独替代可恢复原件。失败、拒绝、超时、中断和重跑分别保留，勘误追加，不覆盖 FAIL。Git 历史来源、封存评审 plan.json、运行闭包保持各自语义，不因名称相似重绑定。

## Source bindings and incremental adoption

可选 source-bindings.json 使用 `schemaVersion: 1`、当前 task 和 sources；每项有唯一 id、kind、path、sha256、purpose、scope。git 项另有完整 commit，绑定固定 commit:path，可带 snapshot；snapshot 项 path 在本任务 evidence/sources/，另用 original 留原定位。快照必须普通文件且保持原字节，禁止链接/越界。有原 Git 对象及快照时均核对；缺本地对象时用同哈希受控快照恢复。具名来源逐项检查内容与用途。

旧文档由[兼容清单](../_meta/document-layer-compatibility.json)逐项列明，绑定原 sourceCommit、path/sha256/gitBlob，仅兼容原内容及确定性 CRLF checkout 表示。新增/实质修订文档须接入九字段；审定用途、维护 owner 及 layer 后，显式 layer 走当前严格校验，不再使用原项兼容；清单保留其历史来源登记，无须逐次删除条目或修改固定摘要。缺 layer 不推定 canonical，也不构成第三 layer。

混合 RUNBOOK 先用入口定位章节，按有界范围迁移，不强制整份分类或批量重排。兼容通过不代表改造全部完成。原 plan/communication-kit-implementation-plan.md 与 provenance、冻结 HTML 来源和历史链保持原字节/绑定。

## Historical preservation

替换/退役前先保存历史正文、版本和来源，归档放 docs/archive 扁平目录；只修复移动造成的链接，已删除资源指向精确历史 Git 提交。保留旧 CHANGELOG 披露和发布资产。归档含 archived、replaced-by 与 banner，后继用 supersedes 建立关系；无后继说明原因。历史 ADR 可留原路径并说明范围。

[来源账本](../archive/history-sources.json)保存 sourceCommit、原始 Git blob 字节 SHA-256，新记录同时保存 sourceBlob。展示归档不冒充原始 blob，原件从固定提交恢复。旧 [v2.0](../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v2.0.md) 和 [v1.9](../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.9.md) 保留历史范围。

## §2.7 A6 synchronization

根 AGENTS.md 是摘要、执行原则及按需读取规范入口。PR 触及 scripts/check-a6.mjs 的 isA6Trigger 所定义路径时，同 PR 更新相关摘要/指针；运行版本/技能清单以权威文件为准。触发覆盖 STANDARD、VERSION、市场索引、manifest、公开技能/UI、.agents/skills 和发布关键脚本，过渡旧路径继续检测退役/删除。

## §4.3.1 A6 / Check

根 AGENTS.md 的 A/M 算同步，D/T 不算；三点 diff、NUL 路径解析与 shell:false 保持。检查器来自目标 base，PR 不自选。无实质同步时，title 的 [skip a6] 与当前 head SHA 非作者 OWNER/MEMBER/COLLABORATOR 最新 APPROVED review 同时成立，body 精确等于 A6 N/A confirmed。旧批准、撤销、作者自签或仅 token 不能开门；失败 fail closed。required-check 名称保留 A6 / Check 与 Validate Structure，workflow YAML 仍来自 PR merge ref，独立审查是该层约束。

内部子 PR 同样保留实际内容检查与 A6 同步，其合并授权按[执行规范](./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)区分受保护目标；不设保护不表示跳过 Harness。

## Links, index and acceptance

使用标准 Markdown 相对链接并验证目标；历史引用指向归档或固定 Git 来源。新增/归档/替代同步 docs/INDEX；任务材料由任务 INDEX 导航，不把每批证据平铺公共索引。校验覆盖 docs/plans 元数据、归属、主文档关系、兼容清单和链接；隔离镜像/资源定位检查完整依赖。文件校验不代替资源闭包、具名来源、实际阅读/交接验收。失败、缺证、未检查、延期分别记录。
