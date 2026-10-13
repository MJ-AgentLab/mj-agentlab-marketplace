---
name: Release PR
about: 版本发布 (develop → main) 的 Pull Request
---

## Release vX.Y.Z — <版本主题>

### Highlights
<!-- 核心变更列表 -->

### 审核要点
- [ ] CHANGELOG.md 完整性（`[Unreleased]` 已转为正式版本节）
- [ ] VERSION 与 README badge 一致；市场索引与磁盘、严格白名单、安装预期包含完整批准集合（本候选 diagram-kit / learning-evidence-kit / explain-kit / html-guide-kit / communication-kit），不携带版本
- [ ] 各 plugins/*/plugin.json 根 version 与各自插件 CHANGELOG 一致
- [ ] 两客户端实际入口证据绑定待发布提交；所有启用提问入口严格待答，原生持续显示单独验证；不合格/不可达入口按 Owner 已接受边界延期，不算通过
- [ ] 最新 required checks、独立批准与正式发布授权均已满足（VERSION 合入 main 会触发发布）
- [ ] 记录实际 From/To、main 基础、候选 SHA/tree 和包内容；Communication 发布时核对 Learning 先8.2.0、后续独立 minor 的依赖，明确处理基线及范围变化
- [ ] Communication 发布使用 Refs #222；R01–R05 与上线后 canonical 安装复查分别记录；Release published、发布身份正确及复查完成后才关闭 Epic
- [ ] Communication 发布的基础功能与必要双客户端证据完整；本轮现实场景效果测试延期，未以基础通过宣称收益
- [ ] 无残留调试代码
- [ ] 无未关闭的阻塞性 Issue

### Details
See [CHANGELOG.md](CHANGELOG.md) for full release notes.

Learning 8.2.0 独立公开范围保持 Diagram/Learning Evidence/Explain 三插件五技能；开发全集与正式发行范围分别核对。Communication PR4 才明确实际 From/To 和后续新增发行范围，不因本模板的开发集合扩展而视为发布授权。
