# #290 后续发行范围、授权与核心资格审阅

**可条件化准备 Marketplace8.3.4 / HTML0.1.39 的唯一发行PR→protected main；没有新增 Owner 实质决定。** 必须先取得本轮 exact actual290 的 fresh 本机与 canonical13/实际Python/清理守卫终态，并独立核验。当前结论只允许同范围推进，不表示四门槛已在本轮全部通过，也不替代新发行PR的真实保护批准。

稳定机器入口为 [summary.json](./summary.json)：`canPrepareReleasePR=true`、`requiredOwnerDecisions=[]`、`formalReleaseReady=false`，并逐列列出核心资格、继承、延期、当前保护及必要待办。只读 [资源继承证据](./resource-inheritance-proof.json) 的11项检查全真，复现脚本为 [review-scope.py](./review-scope.py)。本审查没有执行新模型、桌面、浏览器、Sites、CI、安装或测试，没有改变仓库或worktree HEAD，也没有写旧 post289 冻结根。

## 授权如何承接

B1附带计划本身不能单独产生操作授权，其中“Owner已确认”的历史自述仍不补证真实决定。本次依据是 U1 真实直接请求“**实施该计划，遵循最新的 plan 机制**”明确采用完整§1–13；该任务的 B1§10 P5 包含“**按项目规则上线；Owner实际体检；修复并复验受影响部分**”。唯一主PLAN的 accepted-baseline-and-authorization 记录操作范围为“**按P4/P5验收和正式发布控制推进**”。U1原则4又允许五边界未实质变化时复用授权。来源正文、完整字节/hash和固定Git恢复点均列入summary/proof，未只凭标题或摘要推定。

U2真实选择“按方案1选择性统一……保留本地生成器和工程检查……沿用#274推进”，将本次 .39 增量纳入原同一目标。按需Matt/设计共识、可选主题、本地交付及材料保护已经决定；原生持续窗口仍明确延期。上轮真实请求只要求 actualdevelop 复验及市场预升，其当轮“仅预升/没有正式发布”描述是实际执行窗口；它既不能单独授权发行，也不是永久撤销原P5的Owner禁令。新续办可以在原五边界和正式发布控制内承接 .39 发行，不机械重新索取一次相同产品选择。

五边界保持：目标仍是同#274的 .39 制作能力；对象仍同Marketplace与现有五包/两HTML入口；环境仍隔离本机/GitHub既有仓库与发行流程；权限不新增、不绕过main保护；风险仍以draft-first、空资产、精确身份、已知良好版本及新受保护修复控制。**不新增Site、受众、公开研究正文或模型/桌面范围。** 原核心ACCEPTED_LIMITED只覆盖0.1.37原交付，不因续办变成.38、Site v2、.39或全计划接受。

现本机已确认 actual290 为 `7c23f347c0725bdfa57ee1e0f5e9075a8d90babf` / tree `5743c7974880ff5fa87c9294313ec9adc6abac40`，market8.3.4、HTML0.1.39；这不是从上轮720540候选猜出的实际merge。plugins/.agents/scripts/workflows/tests 相对 actualf3 无变化。本轮 fresh 检查由独立执行器进行，本报告不预报其结果。

## 核心证据和可继承范围

| 门槛 | 已有依据 | 本轮仍须完成 |
|---|---|---|
| A1 安装/本地独立 | .39已完成准确canonical安装、资源/缓存字节及实际Python，当前运行资源保持 | exact7c23新全测/strict/CLI及独立canonical13/178、实际缓存Python、15根与host/primary/原件/完整inventory守卫；候选/实际main/真实tag各自绑定，不借旧计数 |
| A2 内容/设计 | 独立Agent已实际核LIB1–LIB4、条件/例外/日期/判准及.39本地制作；按需Matt/共识有真实入口前向阅读证据 | 核完整来源和受限结论；没有新关键未决就不制造Matt访谈。没有真实新访谈或泛化模型结果，不宣称完整AICS认证 |
| A3 约定交付 | .39已有明确local合成实际交付，96/96、neutral双视口及10文件精确再生；下述未变资源可有限沿用旧真实操作 | 在发行账本分列旧12项、新local/neutral及继承闭包；不把旧操作改称.39新跑，不追认旧Sites门槛，不要求为形式再次建站 |
| A4 工程/发行边界 | 历史许可/负例、局部浏览器及工程证据可恢复；其他包/guide不扩大 | 当前候选来源/许可/隐私闭包、新head CI和真实main批准/线程/latestbase；实际main及draft-first发布控制；公开后真实tag新验和恢复核对 |

### A3精确资源继承

旧真实执行是 `consumer/run02/consumer-report.json`：package0.1.37、Chrome155.0.8059.80、2026-10-19T10:13:54.947Z–10:13:58.316Z，12项PASS。旧12项全记录仍属于这次旧执行，不能整体称为新.39运行。新的 .39 local 实际执行见 `align274/local/run-independent-r1/final-result.json`，neutral真实两视口另见 `align274/theme/verification-summary.json` 及 local 的 layout/screenshots/visual-review。

这两组制品位于固定 actual7c23 下：

- old：`plans/274-html-learning-artifact/evidence/sources/consumer/run02/consumer-cwd/artifact/`
- new：`plans/274-html-learning-artifact/evidence/sources/align274/local/run-independent-r1/site/`
- current JS：`plugins/html-guide-kit/skills/site/assets/warm-paper/learning.js`

两份artifact.json唯一实际差异为新增 `theme:"neutral"`；三项activities和全部sources metadata相等。`index.html`、`learning.js`、`content.md`、`sources/renewal-rules.md` 的old/new原字节全相等；JS还与current安装资源字节相等。具体每文件的old/new/current路径、长度、SHA256和Git blob均完整列在 `resource-inheritance-proof.json`，JS统一SHA256为 `1fcc8c6064dd99f00b91103cf76e33d7a4e6dcf50793b4542bd8462f6c91f568`。

可按这条闭包有限沿用旧第5–12项的未选非回答、反馈/改答失效/复核、版本与来源导出/真实下载、原生剪贴板成功回读、复制拒绝/缺API注入后的手动退路/回焦、重置和无JS静态读取。它们仍是旧实现/同制品结构的真实观察，**不是本次新剪贴板或UI操作**。旧安装资源读取及静态89项也不改称本轮；新安装按新fresh证据，新静态为真实96项。neutral样式差异另有.39双视口/实际computed styles和截图限定核验，不由JS字节相同推出样式自动通过。

上述完整材料与结果已随固定Git保存，source-bindings逐项绑定；可用 exact7c23 恢复各原路径与字节，避免依赖可编辑Issue正文。完整私有B2/API正文未复制，仅沿用既有捕获元数据/hash/私有恢复指针。旧Sites v1/v2的地址/版本/受众仍按各自旧证据读，不新建、不保存、不部署代表Site。

## 仍独立的限制与发布控制

D01原生持续窗口、空返回/超时/关闭继续DEFERRED、非PASS；桌面原生派发、第二真实客户端、全面视觉/可访问性、扩展和效果限制保留，理解效果NOT_MEASURED。Owner最终接受和完整计划完成仍未提供。历史FAIL/UNKNOWN、cache初次absence=false及受控补清理、各次真实bypass/reviews=[]/批准NOT_MET均保留，不由本次准备追认。

新protected main发行PR必须取得真实当前head非作者且非latest-pusher批准、适用CI、已解决线程及最新base。既往develop实际bypass不是未来豁免，Agent不能自行代造批准或绕过。VERSION从main变化会触发发行，因此把这些条件放在普通main合并之前。

main合入后先读actualSHA/tree/VERSION/CHANGELOG，再用现有空draft→可见性等待→canonical安装→紧邻发布身份核对→publish→published/tag/body/assets复查状态机；未知结果先回读，不重复创建。保v8.3.3/.38已知良好对象与公开历史，不覆盖资产。生产问题停止新增升级，通过新受保护修复/恢复PR处理；不创建未请求的周期监控。

下一步推荐：待 exact7c23 两批实际新验及独立守卫终态通过后，更新同一任务与新8.3.4发行账本，保留上述继承/延期/历史，创建单一正常releasePR→protected main。**不再bump版本，不更新Site，不改写Owner接受。** 当前缺项是可自治验证及新PR保护门禁，没有需要Owner重新选择的产品范围。
