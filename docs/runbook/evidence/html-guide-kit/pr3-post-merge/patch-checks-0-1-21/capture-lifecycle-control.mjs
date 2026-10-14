// NEW DRAFT_ONLY capture control. Old v1/frozen38/real statuses remain unchanged.
import {spawn} from 'node:child_process';import {performance} from 'node:perf_hooks';
export async function callObserved(vector,argv,{cwd,env=process.env,input='',timeoutMs=240000,clean=s=>s,onChunk=null}={}){
 return await new Promise(resolve=>{
  const launchedUtc=new Date().toISOString(),launchedMonotonicMs=performance.now(),elapsedMs=()=>performance.now()-launchedMonotonicMs;
  const child=spawn(vector[0],[...vector.slice(1),...argv],{cwd,env,shell:false,windowsHide:true,stdio:['pipe','pipe','pipe']});
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  let stdout='',stderr='',timedOut=false,lateExitInvalid=false,error=null,exit=null,close=null,deadlineCallback=null;
  const timerRegisteredMonotonicMs=performance.now(),deadlineMonotonicMs=timerRegisteredMonotonicMs+timeoutMs;
  const timer=setTimeout(()=>{
   timedOut=true;const firedMonotonicMs=performance.now();
   deadlineCallback={firedUtc:new Date().toISOString(),firedMonotonicMs,firedElapsedMs:elapsedMs(),exitAlreadyObserved:!!exit,killAttempted:false,killReturned:null,killError:null};
   // Never attempt termination against an already observed exited child.
   if(!exit){deadlineCallback.killAttempted=true;try{deadlineCallback.killReturned=child.kill();}catch(e){deadlineCallback.killError=String(e.message);}}
  },timeoutMs);
  child.stdout.on('data',d=>{const s=clean(d.toString());stdout+=s;onChunk?.('stdout',s);});
  child.stderr.on('data',d=>{const s=clean(d.toString());stderr+=s;onChunk?.('stderr',s);});
  child.on('error',e=>{error=String(e.message);});
  child.on('exit',(code,signal)=>{
   const observedMonotonicMs=performance.now();
   exit={code,signal,utc:new Date().toISOString(),elapsedMs:elapsedMs(),observedMonotonicMs,inDeadline:observedMonotonicMs<deadlineMonotonicMs};
   // This independent monotonic check survives delayed/out-of-order timer callbacks.
   if(!exit.inDeadline){lateExitInvalid=true;timedOut=true;}
   clearTimeout(timer);
  });
  child.on('close',(code,signal)=>{
   close={code,signal,utc:new Date().toISOString(),elapsedMs:elapsedMs(),observedMonotonicMs:performance.now()};clearTimeout(timer);
   if(exit&&(exit.code!==code||exit.signal!==signal))error='Observed exit and close code/signal differ';
   resolve({status:exit?.code??null,stdout:clean(stdout),stderr:clean(stderr),timedOut,lateExitInvalid,error,lifecycle:{launchedUtc,launchedMonotonicMs,timeoutMs,timerRegisteredMonotonicMs,deadlineMonotonicMs,actualExit:exit,actualClose:close,exitObserved:!!exit,closeObserved:true,deadlineCallback,stdioCollectedThroughClose:true,sdkCompletedNotUsedAsExit:true,noExitMeansStatusNull:true,drainWaitHasIndependentDeadline:false}});
  });
  child.stdin.on('error',()=>{});child.stdin.end(input);
 });
}
