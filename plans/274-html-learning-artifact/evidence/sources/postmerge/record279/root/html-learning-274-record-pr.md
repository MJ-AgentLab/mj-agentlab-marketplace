## 文档变更内容与原因

v8.3.2 已真实公开，默认 main 的 README 仍指向 v8.3.1，并将 HTML site 描述为尚未发行。本 PR 将公开安装指引改为真实 v8.3.2，展示已公开的 HTML Guide Kit 0.1.37/site，并保存实际 PR278/main/tag/Release、最终双系统 CI 与发布后新 tag 验证原件。

只改文档与冻结证据。VERSION 保持 8.3.2，五包运行资源、插件版本、guide 四份原字节、技能、工具、测试与工作流均不变；正式 8.3.2 CHANGELOG 及旧节原文保持。新增 136 份来源，372 份绑定摘要一致，原 236 份身份和字节保持。

## 原意与工程覆盖

Refs #274。复用[任务 INDEX](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/codex/record-html-learning-8-3-2/plans/274-html-learning-artifact/INDEX.md)、唯一 PLAN/REPORT 和 INT-2026-003；本 PR 是 P5 授权内的发布后公开导航及记录维护，目标 main。开发主 PR275、内部子 PR276/277和发布 PR278已结束；不另建 Issue、PLAN 或 REPORT。

实际发布：PR278于14:28:06Z合入 main f906b100，v8.3.2于14:30:16Z公开，direct tag/Release target同 SHA，tree6e4bc9cc与 f68c22b/CI merge-ref4269d663一致。19项发布观察、正文与原 CHANGELOG 对应关系及内部发布 workflow 成功均有原件。Release immutable=false，仓库 immutable 配置 UNKNOWN。

**实际公开与保护批准分开。** PR278 reviews=[]；匹配真实 main 更新的 suite4601606831 为 Owner bypass，pull_request fail（缺最新推送者外批准），required checks pass。批准仍 NOT_MET，不追认历史或未来豁免。此记录 PR 仍须真实当前 head 非作者批准、适用检查、最新 base 和已解决线程，Agent 不 bypass。

本 PR 实际合入后，才正常同步包含其 merge 的完整 main ancestry 回 develop 并复验；实际同步复验后才 DryRun/Apply 仅市场8.3.3预升，不改插件、不建同号发行。原生持续窗口/第二客户端等延期仍非 PASS，理解效果 NOT_MEASURED，Owner 体检/最终接受未提供，#274继续开放。

## 实际验证

- 本机全测642/642，零失败/跳过；随后仅修状态措辞及当前接受覆盖表，再严格结构校验 PASS、CLI0.147.0精确基线 PASS、范围/来源7项 PASS；最终冻结372绑定后再次 strict PASS、Git空白检查和提交规范 PASS。
- 独立真实 tag 新验14:31:11.601–14:41:25.926Z：13/13场景、178命令全exit0、6Diagram+18LEK实际Python、4site生成/4静态各89/89，site20/guide4资源一致，15精确自有根 absence、canonical无注册残留。未沿用CI/65d旧计数，未运行新model/desktop/browser验收。
- PR278最终原CI独立计数：Linux641/642（唯一Windows大小写skip）、Windows642/642零skip；各13安装/178命令和实际Python留证。额外QA最初跨平台物理字节断言失败保留，24旧文本逐Git/hash证实仅可逆LF/CRLF；不声称取回远端实体字节。
- `/root/contract_scan` 与标准轴子代理独立只读复核：状态漂移P2已修，无剩余阻断。AI审查不构成GitHub批准；本PR最终head的服务端检查仍以实时结果为准。

## 自检结果

- [x] 命名、九字段、canonical/working归属、INDEX/PLAN/REPORT及来源闭包符合当前规范；INTENT与完整接受基线复用，无新实质决定。
- [x] 当前原意覆盖、真实决定、执行与结果分记，原失败、历史快照、延期及Owner接受边界保持。
- [x] 独立来源核对和实际安装证据有界；未冒充新客户端、效果、GitHub批准或未完成维护合入。
- [x] main记录角色、已有主子PR拓扑、依赖顺序与受保护门禁明确。
- [x] Markdown/内部链接、docs INDEX、根 AGENTS及Unreleased已同步，正式已发历史不变。
- [x] 普通docs提交已校验，无凭据、产品缓存或临时PR正文进入变更。

## AI判断、风险与恢复

变更修复默认公开指引与真实发行不一致，并使交付证据可追溯；未修改产品运行。新PR CI、真实批准与线程只据服务端终态判断。文档问题通过后续正常PR修复；已公开tag/Release不覆盖或重打，私有代表Site身份和受众保持。后续sync/prebump不提前执行或记完成。
