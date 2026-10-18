import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";

test("internal PR merge candidates run the full existing checks with no privileged fork trigger", () => {
  const ci = parse(fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"));
  const a6 = parse(fs.readFileSync(new URL("../.github/workflows/a6.yml", import.meta.url), "utf8"));
  assert.deepEqual(ci.on.pull_request.branches, ["develop", "main", "codex/**"]);
  assert.ok(ci.on.push.branches.includes("codex/**"));
  assert.equal(ci.on.pull_request_target, undefined); assert.equal(a6.on.pull_request_target, undefined);
  assert.equal(ci.jobs.validate.name, "Validate Structure");
  assert.equal(ci.jobs.validate.steps[0].with.ref, undefined); // default is the actual PR merge candidate
  assert.equal(ci.jobs.validate.steps[0].with["fetch-depth"], 0);
  assert.match(ci.jobs["codex-compat"].if, /github.event_name != 'push'/);
  assert.match(a6.jobs.a6.if, /startsWith\(github.event.pull_request.base.ref, 'codex\/'\)/);
  assert.equal(a6.jobs.a6.name, "A6 / Check");
  assert.equal(a6.jobs.a6.steps[0].with.ref, "${{ github.event.pull_request.base.sha }}");
  assert.equal(a6.jobs.a6.steps[0].with["persist-credentials"], false);
  assert.deepEqual(a6.permissions, { contents: "read", "pull-requests": "read" });
  const evaluation = a6.jobs.a6.steps.find(step => step.name === "Evaluate A6");
  assert.equal(evaluation.run, 'node "${RUNNER_TEMP}/check-a6.mjs"');
});
