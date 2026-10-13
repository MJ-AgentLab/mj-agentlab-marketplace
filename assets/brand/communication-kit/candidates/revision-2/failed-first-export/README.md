# 保留的首次导出失败

2026-10-12，Refs #222。首次实际看 comparison.png 发现 D 的第二行文字没有显示。该行使用零高度水平 path 的 objectBoundingBox gradient，当前 SVG 渲染未显示此 stroke。保留本次原始 SVG、PNG 与比较图；当前候选改为共享 cyan 实色文字 stroke 后重新导出并看图。这里不是可选择候选或通过批次。
