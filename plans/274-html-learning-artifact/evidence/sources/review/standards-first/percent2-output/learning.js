/* Original, optional browser-local practice. No network, stored account or persisted grade. */
(() => {
  "use strict";
  let config;
  try { config = JSON.parse(document.getElementById("artifact-state").textContent); }
  catch { return; }
  if (!Array.isArray(config.activities)) return;
  document.documentElement.classList.add("js");
  const byID = id => document.getElementById(id);
  const exportField = byID("export-text"), exportStatus = byID("export-status"), summary = byID("practice-status");
  const copy = document.querySelector("[data-copy]"), download = document.querySelector("[data-download]"), copyReturn = document.querySelector("[data-copy-return]");
  let revision = 0, downloadURL = null;
  const paragraph = (target, value) => { const p = document.createElement("p"); p.textContent = value; target.append(p); };
  const invalidate = () => {
    revision++;
    if (exportField.value) { exportField.value = ""; exportStatus.textContent = "回答或核对记录已改变，请重新生成记录。"; }
    copy.disabled = true;
    copyReturn.hidden = true;
    download.hidden = true; download.removeAttribute("href");
    if (downloadURL) { URL.revokeObjectURL(downloadURL); downloadURL = null; }
  };
  const questions = config.activities.map(activity => {
    const form = document.querySelector(`form[data-activity="${activity.id}"]`);
    return { activity, form, radios: Array.from(form.querySelectorAll('input[type="radio"]')), feedback: form.querySelector("[data-feedback]"), attempts: 0, result: null };
  });
  const selected = question => question.radios.findIndex(radio => radio.checked);
  const updateSummary = () => { if (summary) summary.textContent = `当前已核对 ${questions.filter(question => question.result !== null).length} / ${questions.length} 题；修改后需重新核对。`; };
  questions.forEach(question => {
    const { form, radios, feedback, activity } = question;
    radios.forEach(radio => { radio.setAttribute("aria-describedby", feedback.id); radio.addEventListener("change", () => {
      question.result = null; feedback.replaceChildren(); delete feedback.dataset.result;
      paragraph(feedback, "回答已修改，请重新核对。"); invalidate(); updateSummary();
    }); });
    form.addEventListener("submit", event => {
      event.preventDefault(); feedback.replaceChildren();
      const index = selected(question);
      if (index < 0) { delete feedback.dataset.result; paragraph(feedback, "请先选择一个判断。未选择不算回答。"); radios[0].focus(); return; }
      question.attempts++;
      question.result = { index, matched: index === activity.correctIndex };
      invalidate();
      feedback.dataset.result = question.result.matched ? "match" : "review";
      paragraph(feedback, `你的选择：${activity.options[index].label}`);
      paragraph(feedback, question.result.matched ? "与本题参考判断匹配。" : "这一判断需要复核，可以修改后重试。");
      paragraph(feedback, activity.options[index].feedback);
      paragraph(feedback, `参考判断：${activity.reference}`);
      const source = document.createElement("a"); source.href = `#source-${activity.sourceId}`; source.textContent = "查看依据"; feedback.append(source);
      paragraph(feedback, `本题核对 ${question.attempts} 次；记录只对应本题。`);
      updateSummary();
    });
  });
  document.querySelector("[data-reset]")?.addEventListener("click", () => {
    questions.forEach(question => { question.form.reset(); question.radios.forEach(radio => { radio.checked = false; }); question.result = null; question.attempts = 0; question.feedback.replaceChildren(); delete question.feedback.dataset.result; });
    byID("reflection").value = ""; invalidate(); updateSummary();
    exportStatus.textContent = "本次练习已重置。记录只在当前页面会话中。";
  });
  byID("reflection").addEventListener("input", invalidate);
  document.querySelector("[data-export]").addEventListener("click", () => {
    invalidate();
    const lines = [`# ${config.title} — 本次学习记录`, "", `- 材料版本：${config.version}`, `- 记录时间：${new Date().toISOString()}`, `- Audience：${config.audience}`, `- Task：${config.task}`, "- 范围：当前会话的回答与核对；理解效果 NOT_MEASURED。", ""];
    questions.forEach(question => {
      const { activity, result } = question, index = selected(question);
      lines.push(`## ${activity.id} · ${activity.title}`, "", `- 题目：${activity.prompt}`, `- 当前选择：${index < 0 ? "未选择" : activity.options[index].label}`, `- 核对次数：${question.attempts}`, `- 本次判断：${result ? result.matched ? "与参考匹配" : "需要复核" : "当前选择尚未核对"}`);
      if (result) lines.push(`- 对应反馈：${activity.options[result.index].feedback}`);
      lines.push(`- 参考判断：${activity.reference}`, `- 来源：#source-${activity.sourceId}`, "");
    });
    lines.push("## 应用与意见", "", byID("reflection").value.trim() || "尚未填写。", "", "记录未上传、未持久化；保存导出后由你自行保留。", "");
    exportField.value = lines.join("\n"); copy.disabled = false;
    if (typeof Blob !== "undefined" && typeof URL.createObjectURL === "function") { downloadURL = URL.createObjectURL(new Blob([exportField.value], { type: "text/markdown;charset=utf-8" })); download.href = downloadURL; download.hidden = false; }
    exportStatus.textContent = "已生成记录，可复制、下载或在文本区手动复制。";
  });
  copy.addEventListener("click", async () => {
    if (!exportField.value) { exportStatus.textContent = "请先生成记录。"; return; }
    const started = revision, value = exportField.value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(value);
      if (started === revision) { copyReturn.hidden = true; exportStatus.textContent = "已复制本次记录。"; }
    } catch {
      if (started !== revision) return;
      copyReturn.hidden = false;
      exportStatus.textContent = "自动复制未成功。已选中导出文字，请手动复制；完成或取消后可按 Escape，或用返回复制按钮离开。";
      exportField.focus(); exportField.select();
    }
  });
  const leaveManualCopy = () => {
    if (copyReturn.hidden) return;
    copyReturn.hidden = true;
    exportStatus.textContent = "已返回复制按钮；手动复制是否完成未作确认。";
    copy.focus();
  };
  copyReturn.addEventListener("click", leaveManualCopy);
  exportField.addEventListener("keydown", event => { if (event.key === "Escape" && !copyReturn.hidden) { event.preventDefault(); leaveManualCopy(); } });
  window.addEventListener("pagehide", () => { if (downloadURL) URL.revokeObjectURL(downloadURL); });
  updateSummary();
})();
