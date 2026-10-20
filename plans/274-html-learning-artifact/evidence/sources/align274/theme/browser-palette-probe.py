"""Bounded evidence probe: reuse package browser lifecycle and add computed styles."""
import importlib.util
from pathlib import Path
import sys

repo = Path(sys.argv.pop(1))
spec = importlib.util.spec_from_file_location("artifact_browser", repo / "plugins/html-guide-kit/skills/site/scripts/check_renderings.py")
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
qa.GEOMETRY = qa.GEOMETRY.replace("  return {viewport:", r"""
  const style = selector => getComputedStyle(document.querySelector(selector));
  const firstRadio = document.querySelector('input[type=radio]');
  firstRadio.checked = true;
  const palette = {
    paper: style('body').backgroundColor, body: style('body').color,
    link: style('a').color, heading: style('h1').color,
    headingFont: style('h1').fontFamily, wash: style('.scope').backgroundColor,
    accent: style('.scope').borderLeftColor,
    selectedBoundary: style('.option').borderColor,
    textareaBoundary: style('textarea').borderColor,
    activityBackground: style('.activity').backgroundColor,
    activityBoundary: style('.activity').borderColor,
    buttonBackground: style('button').backgroundColor, buttonText: style('button').color,
  };
  return {palette,viewport:""")
if __name__ == "__main__":
    sys.exit(qa.main())
