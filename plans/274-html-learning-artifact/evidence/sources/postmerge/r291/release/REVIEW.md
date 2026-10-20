# PR291 / v8.3.4 实际发布独立审计

30/30回读判据通过。PR291于15:13:30Z实际合入main5898a8192740b39f41263129a5f99efeba96a6cc，tree3a68976af95bb5948de17a6fccaabf892becaaca，与已审候选完全同树；parents f18+f344。精确suite4622448549实际result=bypass，pull_request因缺latest-pusher外批准而FAIL、其他4规则PASS，reviews=[]，批准仍NOT_MET。本Agent未合并，后续不可复用bypass。

v8.3.4于15:16:38Z真实公开；tag/Release目标均5898，draft=false/prerelease=false/assets=[]/latest=true/immutable=false。正文1677B/SHA25693f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38，在仅CRLF→LF/trim范围与actualmain CHANGELOG对应节一致。市场8.3.4，HTML0.1.39；其余四包0.3.1/0.1.0/0.1.1/0.1.0准确。初次tag/Release404与run进行中保留，隔84秒后再读取，属于阶段变化，不重跑。

Release run39446432726 exact5898、push/attempt1成功；单job118709472250、完整plain日志和ZIP已收，13个ZIP entry逐hash/CRC通过。原日志按序显示create-draft→empty draft→canonical Git tree installation verified→published→最终published JSON。该自动canonical不代替本轮独立actualmain或新真实tag十三安装；日志不提供后者新批次逐十三/Python/精确根计数。

旧v8.3.3/fdede tag与Release目标、2507B正文原SHA25611fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c、空资产及immutable=false保持。仓库API没有immutable_releases字段，配置仍UNKNOWN；工作流默认false后的“not enabled”文字不构成配置已核实false。

实际来源许可元数据hash8a6b1057保持：研究无分发许可来源只作原始本地合成，Apache参考只作独立通用实现，私有完整提示词分发权未建立、只保metadata/hash/恢复指针。整树与已审候选相同，不复制B2全文、不重授材料许可。D01窗口延期、效果未测、完整计划OPEN、原.37核心有限接受与全部历史FAIL/UNKNOWN/批准缺口保持；没有新模型、桌面、窗口、Sites或网页更新。

下一步推荐：在父代理库存守卫要求的顺序内完成actualmain新验，再以v8.3.4/5898/tree3a68976a完成独立真实tag十三安装、实际Python及15精确根清理。两批终态证据通过后再准备同Issue的有界公开安装导航与真实交付记录维护；不提前称这些尚待运行项通过，不要求Owner常规构建审查。
