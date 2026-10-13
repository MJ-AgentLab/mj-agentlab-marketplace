---
name: mp-flow-repo-scan
description: "Use for marketplace repo scan / 事实核查 before implementation: inspect worktrees, plugin facts, versions, documentation and CI without changing files."
---

# mp-flow-repo-scan

只读核查当前 worktree、未提交改动、远端和目标分支；扫描 .agents/plugins/marketplace.json、各 plugins/*/plugin.json、公开 arch-diagram / pop-quiz / learning-record-check / glossary / concept / communicate 和 .agents/skills 下的 20 个开发技能。本正式发行候选源精确四包六技能/三显式；develop PR3保留HTML五包七技能/四显式，已公开main/v8.2.0为三包五技能/两显式，各自核对包内共用脚本归属。对照 VERSION、当前文档、历史归档和 CI；旧v8.1.1含Understanding，不以它安装Learning。候选安装使用固定待测branch/SHA，记录事实、漂移和受影响文件，不用发现成功推断实际调用或原生窗口通过。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

涉及视觉资源时核查品牌 STANDARD、assets/brand 与各包图标，核对来源、批准和 manifest 引用。

涉及 Communication 时读[新增 ADR](../../../docs/adr/[ADR]_Communication_Kit_Addition.md)与[冻结来源记录](../../../plugins/communication-kit/skills/communicate/references/source-provenance.md)，核对本源三显式入口（develop四项另记）、Read/Write、自身提示、三份摘要哈希和来源实际 Git 状态。源路径只用于追溯；消费端运行依赖限于包内资源。版本准备另核对 Learning 先8.2.0、Communication 随后独立 minor 的依赖和实际 From/To，不从候选版本猜发布状态。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证develop五包集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate、pop-quiz 和 learning-record-check 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。

Communication 的旧九组合与develop Learning/HTML 基线并集经 Understanding → Learning 替换后为十三组合；全五插件普通3/原生7/显式4。冻结包内容与摘要哈希保持，工程、行为和实际客户端证据分层记录，Refs #222。

本正式发行候选工作树按Owner Q3精确限定D/L/E/Comm四包六技能、三显式、普通三、开发二十、九组安装；HTML留develop另发。以本源市场索引、严格常量和实际manifest为准，不将develop十三组结果代填本源canonical或R04。本正式PR5已从实际PR4 merge c1fa458派生并核对main ebc4bdc3基础；当前head发布门禁和上线后R04仍分别待实际完成。Refs #222。
