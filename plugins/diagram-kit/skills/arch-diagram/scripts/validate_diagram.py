#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_diagram.py — 通用架构图 Mermaid linter（domain-acquisition §6 命名 + 7 类图）.

扫描 .md 文件内的 ```text / ```mermaid 代码块，按通用架构图规则码做机检：
  硬 FAIL : MM-01 graph 关键字 · CLS-03 游离节点 · LEG-01 缺图例 ·
            TXT-01 缺双标签 · STATE-01 多 owner ·
            NAME-01 缺图名/slug · NAME-02 slug 非法
  WARN    : CLS-01 无语义轴分组 · CLS-02 疑部分枚举 · TXT-03 模糊计数 ·
            STATE-02 缺 owner 声明 · SEQ-02 疑同步异步混淆 · NAME-03 标题残留旧码

命名规范唯一事实源 = domain-acquisition.md §6（通用 slug 基 = struct-l1..l4 / dyn / phys）。
本 linter 验证「生成的图」(generated diagrams)，不是 bundle 里的占位骨架模板（带 <用例>/<簇>
等占位符的 references/*.md 不应直接喂入——它们经 skill 实例化为真 slug 后才落盘机检）。

注：本文件自 PG 绘图手册版 (postgreSQL/validate_diagram.py) 泛化而来，去 PG 专属的
role↔shape 映射 (ROLE-03)，并把 SLUG regex 放宽到通用基线。两版自此双源分叉、各自演进；
领域 handbook 可在本通用基线上再特化扩展 SLUG_VALID（如加领域轴名 / 非标准扩展轴）。

用法:
  python validate_diagram.py <file_or_dir> [more...]
  python validate_diagram.py .              # 当前目录所有 *.md
退出码: 0 = 无 FAIL（可含 WARN）; 1 = 有 FAIL; 2 = 用法错误.

纯标准库，Python 3.7+。启发式 lint，WARN 需人工确认。
"""
import os
import re
import sys

# ---- 代码块抽取 ----------------------------------------------------------
FENCE = re.compile(r'^\s*([`~]{3,})([A-Za-z0-9_-]*)\s*$')

def extract_blocks(text):
    """返回 [(start_line, lang, [lines...]), ...]，仅取 text/mermaid 围栏块。"""
    blocks, lines = [], text.splitlines()
    i, n = 0, len(lines)
    while i < n:
        m = FENCE.match(lines[i])
        if not m:
            i += 1
            continue
        fence, lang = m.group(1)[0], m.group(2).lower()
        start, body = i + 1, []
        i += 1
        while i < n and not (FENCE.match(lines[i]) and lines[i].strip()[0] == fence):
            body.append(lines[i])
            i += 1
        i += 1
        if lang in ('text', 'mermaid', ''):
            blocks.append((start, lang, body))
    return blocks

def diagram_type(body):
    for ln in body:
        s = ln.strip()
        if not s or s.startswith('%%'):
            continue
        if s.startswith('graph'):
            return 'graph'
        if s.startswith('flowchart'):
            return 'flowchart'
        if s.startswith('sequenceDiagram'):
            return 'sequence'
        if s.startswith('stateDiagram'):
            return 'state'
        if s.startswith('classDiagram'):
            return 'class'
        return 'other'
    return 'empty'

# ---- flowchart 解析 ------------------------------------------------------
# 节点形状（按开括号长度优先，避免 '[' 抢在 '[(' 前）
SHAPES = [('[(', ')]', 'cylinder'), ('((', '))', 'circle'),
          ('{{', '}}', 'hexagon'), ('[/', '/]', 'parallelogram'),
          ('[[', ']]', 'subroutine'), ('[', ']', 'rect')]
NODE_RE = {op: re.compile(r'(?<![\w])([A-Za-z_]\w*)\s*'
                          + re.escape(op) + r'(.+?)' + re.escape(cl))
           for op, cl, _ in SHAPES}
EDGE_OPS = ('==>', '-.->', '-->', '-.-', '---', '--)', '-)', '-x', '.->')
EDGE_HINT = re.compile(r'==>|-\.->|-->|--\)|(?<![\w-])-\)|-x|-\.[A-Za-z]+\.->')
# sequence 消息：id op id : —— op 按长度降序，避免 -->> 被 ->> 抢
SEQ_MSG = re.compile(r'^\s*([A-Za-z_]\w*)\s*(-->>|--\)|->>|-\)|-x)\s*([A-Za-z_]\w*)\s*:')

def parse_flowchart(body):
    """-> (nodes: {id:(shape,label)}, edge_ids:set, subgraphs:[(title_raw,has_quote)], leg_ids:set)"""
    nodes, edge_ids, subgraphs, leg_ids = {}, set(), [], set()
    in_leg = 0  # LEG subgraph 嵌套深度
    leg_depth_stack = []
    depth = 0
    for ln in body:
        s = ln.strip()
        if s.startswith('%%'):
            continue
        sg = re.match(r'subgraph\s+(\w+)?\s*(?:\["?(.*?)"?\]|"(.*?)")?\s*$', s)
        if s.startswith('subgraph'):
            depth += 1
            sid = (sg.group(1) if sg else '') or ''
            title = (sg.group(2) or sg.group(3) or '') if sg else ''
            has_title = bool(title.strip())
            subgraphs.append((sid, title, has_title))
            if sid.upper() == 'LEG' or title.strip() in ('图例', 'Legend', 'legend'):
                leg_depth_stack.append(depth)
            continue
        if s == 'end':
            if leg_depth_stack and depth == leg_depth_stack[-1]:
                leg_depth_stack.pop()
            depth = max(0, depth - 1)
            continue
        in_leg = bool(leg_depth_stack)
        # 抽节点（每种形状）
        found_here = {}
        for op, cl, shape in SHAPES:
            for m in NODE_RE[op].finditer(ln):
                nid, label = m.group(1), m.group(2)
                if nid in found_here:  # 已被更长括号匹配
                    continue
                found_here[nid] = True
                if nid not in nodes:    # 首次声明为准
                    nodes[nid] = (shape, label.strip().strip('"'))
                if in_leg:
                    leg_ids.add(nid)
        # 抽边引用的 id
        if EDGE_HINT.search(ln):
            for nid in re.findall(r'(?<![\w])([A-Za-z_]\w*)(?![\w])', ln):
                edge_ids.add(nid)
    return nodes, edge_ids, subgraphs, leg_ids

# ---- 规则 ----------------------------------------------------------------
DECL_WORD = re.compile(r'^(按|分层|按层|角色|指标系|信任域|周期|阶段|层|domain|by |group|role|layer|tier)', re.I)

def has_dual_label(label):
    # 双标签：含 ' / ' 或 中文括号（id） 或 (id)
    return (' / ' in label) or ('（' in label and '）' in label) \
           or bool(re.search(r'[一-鿿].*\([A-Za-z_]\w*\)', label))

# ---- NAME 命名规范 (domain-acquisition §6) --------------------------------
NAME_RE = re.compile(r'^\s*%%\s*Name\s*[:：]\s*(\S.*)$', re.M)
SLUG_RE = re.compile(r'^\s*%%\s*Slug\s*[:：]\s*(\S+)', re.M)
TEMPLATE_RE = re.compile(r'^\s*%%\s*(?:Template|Skeleton|骨架)\b', re.M | re.I)
# 通用 slug 基线 (domain-acquisition §6 唯一事实源):
#   结构缩放轴 struct-l1..l4 带层级 · 行为正交轴 dyn · 物理正交轴 phys（后两者无层级）
# 领域 handbook 可在本基线上再特化扩展（加领域轴名 / 非标准扩展轴如 runtime，须显式标「非 C4」）.
SLUG_VALID = re.compile(r'^(?:struct-l[1234]|dyn|phys)(?:-[a-z0-9]+)*$')
# 非结构轴 (dyn/phys) 不应带 lN 层级段. 注: \b 词边界已护住 level1/l2tier 这类合法名，
# 仅对「裸 lN token」(如用例名直接叫 l1) 误判 —— 用例/owner/env 名避免裸 l1-l4 token.
SLUG_LEVEL_BAD = re.compile(r'^(?:dyn|phys)-.*\bl[1234]\b')
# NAME-03 文件级：markdown 标题里残留的旧字母图码（迁移 WARN）
OLD_CODE_HEADING = re.compile(r'^#{1,6}\s+.*?\b(A[12]|B[0-4]|C[0-3](?:[qs])?|D[1-5])\b')

def check_block(idx, start, dtype, body, findings):
    def add(level, code, msg):
        findings.append((level, code, idx, start, msg))

    if dtype == 'graph':
        add('FAIL', 'MM-01', "用 'graph' 关键字，应改用 'flowchart'")
        dtype = 'flowchart'

    raw = '\n'.join(body)

    # NAME-01 / NAME-02 命名规范（骨架/模板块加 '%% Template' 免检；domain-acquisition §6）
    # 类型无关 —— 在 dtype 分支前跑，故 classDiagram (code 图) 亦受命名门约束.
    if not TEMPLATE_RE.search(raw):
        nm, sm = NAME_RE.search(raw), SLUG_RE.search(raw)
        if not (nm and sm):
            miss = ' '.join(([] if nm else ['%% Name:']) + ([] if sm else ['%% Slug:']))
            add('FAIL', 'NAME-01', f"图块缺 {miss}（domain-acquisition §6；模板块加 '%% Template' 免检）")
        if sm:
            slug = sm.group(1)
            if not SLUG_VALID.match(slug):
                add('FAIL', 'NAME-02', f"slug '{slug}' 前缀非法（应 struct-l1..l4 | dyn | phys）")
            elif SLUG_LEVEL_BAD.match(slug):
                add('FAIL', 'NAME-02', f"slug '{slug}' 非结构轴却带层级段（仅 struct- 允许 lN）")

    if dtype == 'flowchart':
        nodes, edge_ids, subgraphs, leg_ids = parse_flowchart(body)
        # CLS-03 游离节点（声明但未出现在任何边；排除 legend 内示例节点）
        for nid, (shape, label) in nodes.items():
            if nid in leg_ids:
                continue
            if nid not in edge_ids:
                add('FAIL', 'CLS-03', f"游离节点 '{nid}'（声明但无连线）: {label[:40]}")
        # LEG-01 用团队约定线型 (==> / -.->) 必附图例
        uses_team_line = ('==>' in raw) or ('-.->' in raw) or re.search(r'-\.[A-Za-z]+\.->', raw)
        has_legend = bool(leg_ids) or ('%% Legend' in raw) or ('图例' in raw)
        if uses_team_line and not has_legend:
            add('FAIL', 'LEG-01', "使用 ==> / -.-> 但缺 legend（subgraph LEG 或 %% Legend）")
        # TXT-01 双标签 / TXT-03 计数 / CLS-02 部分枚举
        for nid, (shape, label) in nodes.items():
            if nid in leg_ids or len(label) <= 2:
                continue
            if not has_dual_label(label):
                add('FAIL', 'TXT-01', f"节点 '{nid}' 缺双标签（业务别名 / 规范 id）: {label[:40]}")
            # 模糊计数：~数字 或 数字+（但排除版本号如 "16+pg_cron" —— + 后跟字母/数字）
            if re.search(r'~\s*\d|\d\s*\+(?![A-Za-z\d])', label):
                add('WARN', 'TXT-03', f"节点 '{nid}' 疑模糊计数（~ / +）: {label[:40]}")
            if ('…' in label or '...' in label) and re.search(r'[A-Za-z_]\w*_', label):
                add('WARN', 'CLS-02', f"节点 '{nid}' 疑部分枚举（省略号+前缀名）: {label[:40]}")
        # CLS-01 subgraph 须声明语义轴（排除 LEG）
        for sid, title, has_title in subgraphs:
            if sid.upper() == 'LEG' or title.strip() in ('图例', 'Legend'):
                continue
            if not has_title:
                add('WARN', 'CLS-01', f"subgraph '{sid}' 无标题（疑无语义轴声明）")

    elif dtype == 'state':
        owners = re.findall(r'%%\s*(?:State Machine\s+)?Owner\s*[:：]', raw)
        if len(owners) > 1:
            add('FAIL', 'STATE-01', f"一张状态机声明了 {len(owners)} 个 owner（应唯一）")
        elif len(owners) == 0:
            add('WARN', 'STATE-02', "缺 '%% Owner:' 声明（state-machine-diagram.md Pre-check 强制）")

    elif dtype == 'sequence':
        mentions_async = re.search(r'异步|async|dblink|fire-and-forget', raw, re.I)
        has_async_arrow = ('-)' in raw) or ('--)' in raw)
        if mentions_async and not has_async_arrow:
            add('WARN', 'SEQ-02', "提到异步/dblink 但无异步箭头 (-) / --))，疑同步异步混淆")
        # 解析消息 (src, op, dst)
        msgs = []
        for ln in body:
            m = SEQ_MSG.match(ln)
            if m:
                msgs.append((m.group(1), m.group(2), m.group(3)))
        # SEQ-03 ≤20 消息
        if len(msgs) > 20:
            add('WARN', 'SEQ-03', f"sequence 消息 {len(msgs)} 条 > 20，应拆用例")
        # SEQ-04 无悬空：每条 sync A->>B 需反向返回 B-->>A 或 B-xA；异步 -) 免检
        returns = {(s, d) for s, op, d in msgs if op in ('-->>', '-x')}
        for s, op, d in msgs:
            if op == '->>' and (d, s) not in returns:
                add('WARN', 'SEQ-04', f"sync '{s}->>{d}' 无配对返回（补 '{d}-->>{s}' 或改 '-)'）")

    # dtype == 'class' (code 图)：仅过类型无关的 NAME-01/02 命名门（上方已跑）.
    # classDiagram 结构 lint（关系符号配对 / 类数上限 / 接口实现方向）列 0.x → 1.0.0 演进项；
    # 退回 references/code-diagram.md 自检清单人工把关.

# ---- 驱动 ----------------------------------------------------------------
def iter_md(paths):
    for p in paths:
        if os.path.isdir(p):
            for root, _, files in os.walk(p):
                for f in files:
                    if f.endswith('.md'):
                        yield os.path.join(root, f)
        elif p.endswith('.md'):
            yield p

def main(argv):
    if not argv:
        print(__doc__)
        return 2
    total_fail = total_warn = total_blocks = 0
    for path in iter_md(argv):
        try:
            with open(path, encoding='utf-8') as fh:
                text = fh.read()
        except OSError as e:
            print(f"!! 无法读取 {path}: {e}")
            continue
        blocks = extract_blocks(text)
        file_findings = []
        for idx, (start, lang, body) in enumerate(blocks, 1):
            dtype = diagram_type(body)
            if dtype in ('empty', 'other'):
                continue
            total_blocks += 1
            check_block(idx, start, dtype, body, file_findings)
        # NAME-03 文件级：标题残留旧字母图码（迁移 WARN）
        for lineno, line in enumerate(text.splitlines(), 1):
            mc = OLD_CODE_HEADING.match(line)
            if mc:
                file_findings.append(('WARN', 'NAME-03', 0, lineno,
                    f"标题残留旧图码 '{mc.group(1)}'（domain-acquisition §6 已弃，改用规范图名/slug）"))
        if not file_findings:
            continue
        print(f"\n=== {path} ===")
        for level, code, idx, line, msg in sorted(file_findings, key=lambda x: (x[3], x[1])):
            mark = 'FAIL' if level == 'FAIL' else 'warn'
            print(f"  [{mark}] {code} (块#{idx} @行{line}): {msg}")
            if level == 'FAIL':
                total_fail += 1
            else:
                total_warn += 1
    print(f"\n--- 共扫描 {total_blocks} 张图 · FAIL {total_fail} · WARN {total_warn} ---")
    return 1 if total_fail else 0

if __name__ == '__main__':
    # CLI 输出含 CJK（图名 / 规则消息 / 扫描汇总）。强制 UTF-8，避免非 UTF-8
    # 平台 locale（如 Windows 管道 stdout = cp1252 / cp936）触发 UnicodeEncodeError。
    for _stream in (sys.stdout, sys.stderr):
        try:
            _stream.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    sys.exit(main(sys.argv[1:]))
