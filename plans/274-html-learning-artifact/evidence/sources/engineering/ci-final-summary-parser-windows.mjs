// Fixed original Windows QA extraction script, actually executed for Issue 274 evidence.
// This is a preserved evidence tool, not a plugin runtime dependency.
// Reproduce with node <script> <raw-job-log> <new-output-json>.
import fs from "node:fs";
import crypto from "node:crypto";
const [input,output]=process.argv.slice(2);
if(!input||!output)throw new Error("Expected explicit input log and new output JSON");
if(fs.existsSync(output))throw new Error("Do not overwrite original evidence; choose a new output");
const bytes=fs.readFileSync(input),raw=bytes.toString("utf8");
const lines=raw.split(/\r?\n/).map(line=>line.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z ?/,""));
const records=[];let block=[];
for(const line of lines){
 if(!block.length&&line==="{")block=[line];
 else if(block.length){
  block.push(line);
  if(line==="}"){try{records.push(JSON.parse(block.join("\n")));}catch{}block=[];}
 }
}
const smoke=records.find(record=>Array.isArray(record.scenarios));
const strict=records.find(record=>Array.isArray(record.publicSkills)&&Object.hasOwn(record,"repositorySkills")&&!record.scenarios);
if(!smoke||!strict)throw new Error("Complete strict and smoke JSON not found");
const statistic=name=>{
 const values=lines.map(line=>line.match(new RegExp(`^# ${name} (\\d+)$`))).filter(Boolean);
 if(values.length!==1)throw new Error(`Expected one unambiguous unit statistic: ${name}`);
 return Number(values[0][1]);
};
const commands=smoke.scenarios.flatMap(scenario=>scenario.commands);
const calls=pattern=>commands.filter(command=>command.args?.some(argument=>pattern.test(argument.replaceAll(String.fromCharCode(92),"/"))));
const summary={
 schemaVersion:1,extractedAt:new Date().toISOString(),
 sourceLogSha256:crypto.createHash("sha256").update(bytes).digest("hex"),
 method:"Remove only GitHub line timestamps, parse complete zero-indent JSON objects and exact TAP summary lines; normalize only command path separators for counting, then count actual per-scenario command records without double-counting aggregate aliases",
 unit:{tests:statistic("tests"),pass:statistic("pass"),fail:statistic("fail"),skipped:statistic("skipped"),skipLines:lines.filter(line=>/^ok \d+ - .+# SKIP/.test(line))},
 strict:{ok:strict.ok,errors:strict.errors,repositorySkills:strict.repositorySkills,publicSkills:strict.publicSkills.length},
 actualBrowserTestPassed:lines.some(line=>/^ok \d+ - actual browser measures mobile\/desktop viewport sizes/.test(line)),
 baselineVersion:smoke.version,
 smoke:{ok:smoke.ok,scenarios:smoke.scenarios.length,passedScenarios:smoke.scenarios.filter(scenario=>scenario.ok===true).length,commandFailures:commands.filter(command=>command.status!==0),diagramPythonCalls:calls(/\/validate_diagram\.py$/).length,learningEvidencePythonCalls:calls(/\/scripts\/lek\.py$/).length,siteRendererCalls:calls(/\/site\/scripts\/render-site\.mjs$/).length,siteStaticPythonCalls:calls(/\/site\/scripts\/check_artifact\.py$/).length},
 limits:["Derived extraction does not replace the preserved raw job log.","Installed site renderer/static checks are separate from the actual browser unit testcase.","Other platform jobs, actual PR merge, protected approval and Owner acceptance are not inferred."]
};
if(summary.unit.fail!==0||strict.ok!==true||smoke.ok!==true||summary.smoke.commandFailures.length)throw new Error("Job evidence contains failed checks");
fs.writeFileSync(output,JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
