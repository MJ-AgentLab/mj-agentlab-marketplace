# GUIDE body 骨架

```markdown
# <GUIDE Title>

## Goal

<本 GUIDE 完成后，读者能做到什么；用动词开头>

## Audience

<目标读者画像：技术背景 / 当前状态 / 目标场景>

## Prerequisites

- <前置条件 1，如：本地装了 Python 3.11>
- <前置条件 2，如：有 mj-agent 仓的 read 权限>

## Step-by-step

### Step 1: <第一步>

<具体命令 / 代码示例 / 截图（如适用）>

```bash
$ <command>
```

预期输出：

```
<expected output>
```

### Step 2: <第二步>

...

（按需扩展）

## Verification

<完成后怎么确认成功——具体可观察的现象 / 命令输出 / 测试通过>

## Troubleshooting

| 现象 | 可能原因 | 解决 |
|---|---|---|
| <错误现象 1> | <原因> | <解法> |

## Related

- 相关 GUIDE：<wikilink>
- 相关 ADR：<wikilink>
- 相关 SPEC：<wikilink>
- 外部参考：<URL>
```

## 段落填写要点

- **Goal vs Audience**：Goal 描述"完成什么"；Audience 描述"谁能做"。两者结合让 reviewer 一眼判断 GUIDE 是否对自己有用。
- **Prerequisites**：列**所有**前置条件，包括隐性的（譬如"必须能访问公司 VPN"）。oncall 在凌晨执行时不能让他/她去猜。
- **Step-by-step**：每步含命令/代码 + 预期输出。**不要**只写"运行 X"——具体到 flag。
- **Verification**：必含可观察的现象。"应该能看到 OK"是不够的；写"输出含 'Server started on port 8080'"。
- **Troubleshooting**：至少列 3 个最常见错误。如果没有可预见错误，说明 GUIDE 还没经过实际使用反馈，可以标 TODO。

## 反例

- ❌ 没有 Audience 段，导致非目标读者也按 GUIDE 操作然后受挫
- ❌ Step 写"配置一下 settings"（太抽象——配置什么字段、值是什么？）
- ❌ Verification 段空（reviewer / 读者不知道是否成功）
- ❌ 把 ADR 内容混入 GUIDE（"我们决定用 X 因为 Y..."——这是 ADR 的范围）
