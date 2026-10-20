本次已交付约定的本地网页：[Library Renewal · 续借判断学习制品](site/index.html)。直接用本机浏览器打开 `site/index.html`，保留整个 `site/` 目录即可读取正文、来源与本地资源。未创建、保存或部署 Sites。

内容版本为 `synthetic-1.0`，视觉为已指定的 `neutral`。读者、任务、三个目标与三题判准逐项复用原 `artifact.json`。这是插件自编的合成教学规则，不是真实图书馆政策，也不提交真实续借申请。重要条件保持：尚未逾期且没有预约才规则允许；成功从原到期日加七个日历日，失败日期不变；提交不等于成功，成功文字与更新日期须同时出现，缺少确认仍保持未知。

独立内容源在 [content.md](site/content.md)，完整依据在 [renewal-rules.md](site/sources/renewal-rules.md)。可再生输入位于 `input/`，其中仅配置增加 `theme: neutral`，其余配置语义、正文和来源保持。`site/artifact.json` 保存内容版本/目标/术语/判准，`site/artifact-manifest.json` 保存九项payload的路径、字节及SHA-256；完整输出包括manifest共十个文件，并携带生成资产许可。

本 Agent 已实际运行生成器和两个 Python 检查器，均返回0：静态检查96/96通过；真实 Chrome155 的1366×900与390×844两视口有界几何检查通过，浏览器退出与自有临时目录清理通过。已实际查看本轮两张初始截图。来源与技能目录运行前后哈希一致，原件未修改。独立语义核对及日期计算见 `semantic-review.json`，截图观察见 `visual-review.json`；实际命令、时钟、stdout/stderr见 `execution.json` 及 `01-*`、`02-*`、`03-*` 原日志。

再生时使用HTML Guide Kit候选0.1.39、源提交 `b5b8300ae58e967e1d0013e66dc4f1208ac860ef` 中的同一生成器。源技能完整哈希在 `skill-before.json`，输入原件前后哈希在 `source-before.json` / `source-after.json`。从当前目录在PowerShell执行下列命令，将输出路径改为一个尚不存在的新目录；不要指向已有网页、原材料或安装目录：

```powershell
node "C:/Users/Admin/.codex/worktrees/html-prompt-alignment/develop/plugins/html-guide-kit/skills/site/scripts/render-site.mjs" --input "$PWD/input" --output "$PWD/site-regenerated-new"
```

本轮已实际从交付的 `input/` 再生到 `recovery-check/site-regenerated/`，十文件逐字节与已检查的 `site/` 一致，原命令和比较结果见 `recovery-check/result.json`。如网页文件损坏，保留损坏文件及旧记录，按上式写全新目录，比较清单；存在差异则实际重跑两个检查器，修复后另存记录，不手改清单来掩盖差异。输入、版本和源技能不变时，本轮相同字节的检查只覆盖相同范围。

完整场景可用上层 `replay.mjs` 重放，第二个参数必须是 `local-delivery/` 下不存在的新目录。脚本会核冻结源HEAD，复制原材料、在工作副本选neutral、生成并运行两Python，保存新日志和前后哈希。`finalize.mjs` 是本轮固定路径的补充取证脚本，保留用于审阅，不应覆盖本轮结果重跑。

此交付仅完成已确认本地场景。当前Agent未手动执行选择作答、改答、重试、重置、复制、导出、键盘或触摸操作；现有主题有界检查以准确路径/hash列于 `related-evidence.json`，不冒称本Agent新跑的交互全流程。未执行真实Matt访谈、未答路径、原生窗口、桌面/第二客户端、Sites或完整工程安装矩阵。原生窗口持续显示仍DEFERRED，理解效果NOT_MEASURED，保护批准与Owner最终接受另记。
