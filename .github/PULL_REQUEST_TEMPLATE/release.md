---
name: Release PR
about: 版本发布 (develop → main) 的 Pull Request
---

## Release vX.Y.Z — <版本主题>

### Highlights
<!-- 核心变更列表 -->

### 审核要点
- [ ] CHANGELOG.md 完整性（`[Unreleased]` 已转为正式版本节）
- [ ] VERSION 与 README badge 一致；索引精确注册 diagram-kit / learning-evidence-kit / explain-kit，不携带版本；五公开技能/两显式学习策略一致
- [ ] 各 plugins/*/plugin.json 根 version 与各自插件 CHANGELOG 一致
- [ ] 两客户端实际入口证据绑定待发布提交；所有启用提问入口严格待答，原生持续显示单独验证；不合格/不可达入口按 Owner 已接受边界延期，不算通过
- [ ] 最新 required checks、独立批准与正式发布授权均已满足（VERSION 合入 main 会触发发布）
- [ ] 核心交付、原计划完成和 Owner 最终接受分开；Epic #209 及延期项保留，release PR 仅 Refs，不自动 Closes Epic
- [ ] 无残留调试代码
- [ ] 无未关闭的阻塞性 Issue

### Details
See [CHANGELOG.md](CHANGELOG.md) for full release notes.
