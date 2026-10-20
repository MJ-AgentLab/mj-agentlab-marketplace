# Artifact Checks 制品检查

脚本使用 Python 3.10+ 标准库，不自动下载浏览器或安装依赖。脚本路径从本次实际安装的 `SKILL.md` locator 所在目录解析；输入是明确的生成目录，报告与截图写入新的独立任务路径，不写插件缓存。命令的脚本、输入和输出路径分别作为独立参数传递。

```text
python <site>/scripts/check_artifact.py --input <generated-dir> --output <new-static-report.json>
python <site>/scripts/check_renderings.py --input <generated-dir> --screenshots <new-screenshot-dir> --output <new-browser-report.json>
```

`python` 不可用时依次探测 `python3`、`python`、Windows `py -3`；须实际运行，不能因解释器缺失宣称通过。JSON 报告状态和退出码：`PASS`/0、`FAIL`/1、`NOT_RUN`/2。已有证据路径拒绝覆盖。修改制品后保留原报告，另开路径重跑受影响检查。

## Static Checks 静态检查

`check_artifact.py` 读取 `artifact.json`、`artifact-manifest.json` 与实际输出，检查：

- 配置 schemaVersion 1、版本一致、必需文件、读者/任务/目标、来源定位、术语映射和 choice 活动基本配置。
- manifest `artifactPath: artifact.json`、`sourceSha256`、每项 `{path,sha256,bytes}` 与实际字节及完整文件集合相符；不允许额外未登记文件、路径逃逸或符号链接。
- HTML 文档基本结构、语言/编码/viewport、唯一 ID、静态正文、本地链接和 HTML 锚点、无预选作答；本地脚本/样式/字体/媒体引用不依赖外部运行资源。
- CSS 显式 `url()`/`@import`、JavaScript 显式模块引用及术语 `forbidden` 已知禁用映射。对源材料原件只核字节/路径，不能因原件里有研究引用就把它解释为运行依赖。

术语 `forbidden` 是本次材料已明确的错误名称列表，不展示给学习者。英文按词界、忽略大小写匹配；中文按完整字符串匹配。词汇出现检查不能证明同名概念用法、翻译、含义、事实、条件、例外或练习判准正确。manifest 自洽也不证明输入原件真实；须独立对照实际读取的来源。检查器不是完整 HTML/CSS/JavaScript 合规或安全分析器，不追踪任意动态代码加载。

## Browser Checks 浏览器检查

先使制品通过静态检查，再运行浏览器检查。可用 `--browser <chrome-or-edge-executable>` 或 `HTML_SITE_BROWSER` 指定已安装的 Chromium 浏览器；显式路径无效不会偷偷改用另一浏览器。默认在 PATH 与系统常用安装位置寻找 Chrome/Edge/Chromium。浏览器不可用、启动失败、超时、页面加载失败或探针不完整时明确 `NOT_RUN`，非零退出；不得改写为通过。

默认实际检查 `1366x900` 与 `390x844`，可重复指定 `--viewport WIDTHxHEIGHT`。浏览器在临时副本中运行；通过本机 DevTools 设备尺寸覆盖并回读实际 `innerWidth/innerHeight`，校验截图 PNG 尺寸。单给窗口尺寸不保证 Windows 浏览器达到小屏实际视口。每个视口生成截图、SHA-256 和有限几何结果：

- 文档横向溢出超过 2 CSS px。
- `overflow:hidden/clip` 容器内横向或纵向内容超过容器 3 CSS px 的裁切线索。
- 至少五个极窄行片段的正文异常换行线索；中文正常换行不作异常。

这些启发式可能需要结合截图判读，不构成完整视觉、响应式或可访问性审查。截图是初始视口，页面下方内容通过几何探针有限检查，不能声称所有状态都已截图。报告发现问题先修复并另存重跑；确属有意裁切等情况保留 FAIL 与具体判断依据，不通过放宽阈值把原结果变成 PASS。

浏览器检查不执行复制、核对判断、改答、重试、重置、导出、键盘/焦点或触摸操作；这些由代表性实际主流程另行核验。截图须由 Agent 或 Owner 实际查看。检查不验证远端 Sites 的身份、版本、受众、部署状态或来源语义，不证明完整 WCAG 合规及理解改善；理解效果保持 `NOT_MEASURED`。
