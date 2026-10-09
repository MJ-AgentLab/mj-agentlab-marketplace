---
name: Release PR
about: 版本发布 (develop → main) 的 Pull Request
---

## Release vX.Y.Z — <版本主题>

### Highlights
<!-- 核心变更列表 -->

### 审核要点
- [ ] CHANGELOG.md 完整性（`[Unreleased]` 已转为正式版本节）
- [ ] VERSION 与 README badge 一致；市场索引注册已批准的 diagram-kit / understanding-kit，不携带版本
- [ ] 各 plugins/*/plugin.json 根 version 与各自插件 CHANGELOG 一致
- [ ] 两个目标客户端的实际验收绑定待发布提交，未执行项不作为通过
- [ ] 最新 required checks、独立批准与正式发布授权均已满足（VERSION 合入 main 会触发发布）
- [ ] 无残留调试代码
- [ ] 无未关闭的阻塞性 Issue

### Details
See [CHANGELOG.md](CHANGELOG.md) for full release notes.
