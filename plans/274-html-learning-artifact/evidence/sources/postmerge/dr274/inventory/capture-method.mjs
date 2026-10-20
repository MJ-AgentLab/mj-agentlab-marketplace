import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const repository="C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop";
const directory="C:/Users/Admin/AppData/Local/Temp/html-learning-274-deferrals-contract";
const ownerRoot="C:/Users/Admin/.codex/worktrees/html-learning-artifact/owner-core-acceptance282";
const expectedHead="908d29537a19ceca166e8f3c7cddef4d419781a4";
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
const git=(...args)=>execFileSync("git",args,{cwd:repository,encoding:"utf8"}).trim();
if(git("rev-parse","HEAD")!==expectedHead)throw Error("HEAD changed");
fs.mkdirSync(directory,{recursive:true});
fs.mkdirSync(path.join(directory,"inputs"),{recursive:true});
fs.copyFileSync(new URL(import.meta.url),path.join(directory,"capture-method.mjs"),fs.constants.COPYFILE_EXCL);
const paths=[
 "AGENTS.md",
 "plans/274-html-learning-artifact/INDEX.md",
 "plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md",
 "plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md",
 "plans/274-html-learning-artifact/evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md",
 "plans/274-html-learning-artifact/evidence/sources/owner-request.txt",
 "docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md",
 "docs/spec/[SPEC]_HTML_Learning_Artifact.md",
 "docs/guide/[GUIDE]_HTML_Learning_Artifact.md",
 "plugins/html-guide-kit/skills/site/SKILL.md",
];
const local=paths.map((source,index)=>{
 const bytes=fs.readFileSync(path.join(repository,source));
 const target="inputs/local-"+String(index).padStart(2,"0")+(source.endsWith(".md")?".md":".json");
 // Non-Markdown owner request is represented as a JSON string so its original bytes remain recoverable.
 if(source.endsWith(".md"))fs.writeFileSync(path.join(directory,target),bytes,{flag:"wx"});
 else fs.writeFileSync(path.join(directory,target),JSON.stringify({source,base64:bytes.toString("base64")},null,2)+"\n",{flag:"wx"});
 return {source,snapshot:target,bytes:bytes.length,sha256:sha(bytes),snapshotSha256:sha(fs.readFileSync(path.join(directory,target)))};
});
const manifestBytes=fs.readFileSync(path.join(ownerRoot,"final-manifest.json"));
if(sha(manifestBytes)!=="578d7c6f7e021a3bf7edfa57273a0e751e733d500f23a5fd524088277143cdce")throw Error("Owner manifest identity mismatch");
const ownerManifest=JSON.parse(manifestBytes);
const ownerValidation=ownerManifest.files.map(item=>{
 const bytes=fs.readFileSync(path.join(ownerRoot,item.file));
 if(bytes.length!==item.bytes||sha(bytes)!==item.sha256)throw Error("Owner source changed: "+item.file);
 return {...item,verified:true};
});
for(const file of ["final-manifest.json","owner-decision.json","receipt.json","issue-after.json"])
 fs.copyFileSync(path.join(ownerRoot,file),path.join(directory,"inputs/owner-"+file),fs.constants.COPYFILE_EXCL);
const issueRaw=execFileSync("gh",["issue","view","274","--repo","MJ-AgentLab/mj-agentlab-marketplace","--json","number,title,state,body,url,updatedAt"],{encoding:"utf8",maxBuffer:16*1024*1024});
fs.writeFileSync(path.join(directory,"inputs/current-issue.json"),issueRaw,{flag:"wx"});
const issue=JSON.parse(issueRaw);
const plan=fs.readFileSync(path.join(repository,paths[2]),"utf8");
const report=fs.readFileSync(path.join(repository,paths[3]),"utf8");
const rows=plan.split(/\r?\n/).filter(line=>/^\| (C\d\d|P\d\d) \/ /.test(line)).map(line=>{
 const cells=line.split("|").slice(1,-1).map(x=>x.trim());
 return {id:cells[0].split(" ")[0],source:cells[0],baseline:cells[1],relationship:cells[2],dependency:cells[3],criterion:cells[4],repoResult:cells[5],reportRow:report.split(/\r?\n/).find(x=>x.startsWith("| "+cells[0].split(" ")[0]+" |"))};
});
if(rows.length!==32||new Set(rows.map(x=>x.id)).size!==32)throw Error("Expected exact 32 acceptance rows");
fs.writeFileSync(path.join(directory,"inputs/acceptance32.json"),JSON.stringify(rows,null,2)+"\n",{flag:"wx"});
const result={
 capturedAt:new Date().toISOString(),role:"independent read-only contract/deferral inventory; no execution, Owner decision or GitHub approval",
 repository,head:expectedHead,tree:git("rev-parse","HEAD^{tree}"),
 issue:{state:issue.state,url:issue.url,updatedAt:issue.updatedAt,bodySha256:sha(Buffer.from(issue.body)),rawSha256:sha(Buffer.from(issueRaw))},
 owner:{path:ownerRoot,manifestSha256:sha(manifestBytes),validatedFiles:ownerValidation.length,allHashes:true,files:ownerValidation},
 local,acceptanceRows:rows.length,repoHeadUnchanged:git("rev-parse","HEAD")===expectedHead,
 method:{file:"capture-method.mjs",sha256:sha(fs.readFileSync(path.join(directory,"capture-method.mjs")))},
};
fs.writeFileSync(path.join(directory,"input-manifest.json"),JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({directory,...result.issue,ownerValidated:ownerValidation.length,rows:rows.length,head:expectedHead,tree:result.tree}));
