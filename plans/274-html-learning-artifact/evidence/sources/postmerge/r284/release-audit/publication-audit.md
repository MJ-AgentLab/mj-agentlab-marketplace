# PR284 / v8.3.3 独立发布观察

该记录仅核验真实合入与公开状态；不替代保护批准、入口验收或 Owner 接受。机器结论见 `publication-summary-v1.json`，20 项身份/状态观察均有原件支持。

- PR284 实际于 2026-10-20T09:50:50Z 合入 main：fdede3cf5578dee8a41aef4310a9387d695c56bd。Parents 为 e3dc40f7… 与 cfbeb1bb…；tree f71963c1… 与已测 release candidate 相同。
- v8.3.3 tag 为直接 commit ref，指向同一 fdede；Release418243144 target_commitish 同 SHA。实际 published_at09:53:51Z，draft=false、prerelease=false、assets=[]，latest 回读为同一 Release。
- 正文 2507 UTF-8 bytes，SHA256 11fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c。与 actual main CHANGELOG8.3.3 节仅执行 CRLF→LF 与 trim 后逐字相同，未归一内容。
- 自动 Release run39403662285 / attempt1 / job118564259389 success；09:53:57Z 更新为终态。原日志证实先创建空 draft、一次等待其列表可见，再校验 canonical 安装并 publish。未执行第二次发布、合并或重跑。
- Release immutable=false。仓库 API 未提供 immutable_releases 字段，配置仍 UNKNOWN；workflow 的 absent→false fallback 诊断不能证明仓库配置。

PR284 的治理结果继续保留：真实 suite4617090917 匹配 e3dc→fdede，为 actor ranzuozhou 的 bypass；pull_request 规则失败，明确缺最新推送者之外批准；其余四项规则通过。PR reviews=[] / REVIEW_REQUIRED，批准 NOT_MET。自动发布成功不使该缺口变为通过，也不构成后续豁免。

此前 tag/release-by-tag 404 是更早观察，已保留；不能据此推断当时不存在 draft。实际 draft 创建仅由后续原始 workflow 日志证明。

公开交付仍为 HTML0.1.38，选择性统一0.1.39尚未发布。Owner 原核心 ACCEPTED_LIMITED 不覆盖新0.1.38、Site v2或完整计划；原生窗口、第二客户端与效果未测维持原边界。

真实 tag 新安装另批正在进行。默认 Windows TEMP 的首批在 canonical checkout 阶段遇到历史证据长路径，0场景/0安装/0Python；原始失败冻结于 `../tag-smoke`。后继 `../tag-smoke-short-temp-r1` 只调整进程 TEMP/TMP，源码及验收判据不变。新批终态将另存独立审计，不改写本次发布观察快照。

下一步推荐：先完成真实 tag 独立十三安装、实际 Python 与精确清理；通过后由责任 Agent 将真实发布/缺口/限定新验写入同一 #274 记录，再按保护流程推进同步与0.1.39主 PR。
