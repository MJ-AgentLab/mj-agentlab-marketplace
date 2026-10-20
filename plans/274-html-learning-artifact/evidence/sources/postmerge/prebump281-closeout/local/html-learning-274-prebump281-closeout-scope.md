# Task274 / PR281 有界收尾范围复核

只读结论：可以做最多一个当前状态文档修正PR；没有“每次merge后必须再造证据PR”的合同要求。当前REPORT/发布操作仍称预升PR未合入，值得纠正；本次文档PR自身的实际合入/范围复核只回Issue274与不可变外部回执，无实质新差异即停止。

- 最后回读：两个工作区均为 actual62945150，tree6659fadd与已测source6ef同树；主develop另有Owner原计划未跟踪文件，必须保留。公开仍v8.3.2/f906，develop8.3.3仅预升。文档PR应向develop，不能为记录把833带到main。
- committed979全部hash核对通过，旧1d8的740记录前缀保持；external302全部bytes/hash通过。CI manifest列221 payload，整ci子树含manifest为222；另root79与metadata1。external总manifest SHA256：e1cf0908a6298be406c4a4e80b3ba041518291261e352263867cd2fa475d0569。
- C01：补281实际交付，仍PARTIAL；C22：预升保护PR已merge、833未发布；C23：6ef CI与629新验/保护audit分批，历史A4 NOT_MET不追认；C25：公开832f906/main记录e3dc/develop预升629三身份和Owner边界；P05：保979/740/外部CI与实际新验各批及原Chrome UNKNOWN；P07：补281→develop和一次有界文档PR，之后仅Issue+外部回执。
- 最小编辑：唯一REPORT/PLAN/INDEX、8.3.2账本/发布操作、必要根A6/docs INDEX/Unreleased；冻结候选CI引用闭包和actual629必要原件。不改INTENT、产品合同、runtime、workflow、版本或已发表历史。
- actual629新13/完整测试及实际281保护audit在本审查交付时仍待parent真实终态；不能先写PASS。历史1d8 Chrome启动FAIL/NOT_RUN根因UNKNOWN、新诊断仅证明捕获机制，不称已修真实根因。
- 当前正常保护批准、CI、线程/latestbase仍逐PR满足，Agent不bypass。Owner接受NOT_PROVIDED、效果NOT_MEASURED、延期/双端未覆盖独立，Issue274保持这些未决。清理仅自有已合入clean工作树，并保留external handoff和Owner文件。

详细逐项修正、路径/行号和终止条件见同名JSON。无仓库写入、无测试或GitHub操作。