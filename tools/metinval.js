/* Python ayarları ------------------------------------------------------- */
const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
require(process.env.METINVAL_CORE||'./metinval_core.js')({
  root:path.resolve(__dirname,'..'), wait:3000, dump:process.env.DUMP,
  RAW:['PY_LESSONS[].ex[].hints[]','PY_LESSONS[].ex[].why','PY_LESSONS[].ex[].guide[]','PY_LESSONS[].ex[].q','PY_LESSONS[].ex[].steps[]',"PY_LESSONS[].ex[].o[]@e.t!=='predict'",'PY_LESSONS[].faq[].q','PY_LESSONS[].faq[].a',
       'PY_BANK[].hints[]','PY_BANK[].why','PY_BANK[].guide[]','PY_BANK[].q',"PY_BANK[].o[]@e.t!=='predict'",
       'PY_ARENA[].statement','PY_ARENA[].input','PY_ARENA[].output','PY_ARENA[].editorial','PY_ARENA[].hints[]',
       'PY_EXAMS[].qs[].q','PY_EXAMS[].qs[].why','PY_EXAMS[].qs[].hints[]',"PY_EXAMS[].qs[].o[]@e.t!=='predict'"],
  ESC:['PY_LESSONS[].goals[]','PY_LESSONS[].mistakes[].why','PY_MISTAKES[].why','PY_MISTAKES[].rule'],
  async dom(p,scan){
    const go=async h=>{ await p.evaluate(x=>{location.hash=x},h); await sleep(70); };
    const ids=await p.evaluate(()=>PY_LESSONS.map(l=>l.id));
    for(const id of ids){ await go('#/lesson/'+id+'/sss'); await p.evaluate(()=>document.querySelectorAll('.faq details').forEach(d=>d.open=true)); await scan('.faq,.mist','sss '+id); }
    await go('#/mistakes'); await scan('#main','sik-hatalar');
    const hintRe=/<code>|&lt;/;
    const bank=await p.evaluate(s=>{const R=new RegExp(s);return PY_BANK.filter(t=>t.t!=='order'&&t.t!=='predict'&&(t.hints||[]).length).map(t=>({id:t.id,h:t.hints.length,m:t.hints.some(x=>R.test(x))}))},hintRe.source);
    const arena=await p.evaluate(s=>{const R=new RegExp(s);return PY_ARENA.filter(t=>(t.hints||[]).some(x=>R.test(x))).map(t=>({id:t.id,h:t.hints.length}))},hintRe.source);
    for(const t of bank.filter(x=>x.m).slice(0,60)){ await go('#/task/'+t.id); for(let i=0;i<t.h;i++){ const b=await p.$('[data-act="ex-hint"]:not([disabled])'); if(b) await b.click(); } await scan('.hints','pratik ipucu '+t.id); }
    for(const t of arena.slice(0,40)){ await go('#/arena-p/'+t.id); await sleep(60); for(let i=0;i<t.h;i++){ const b=await p.$('[data-act="ar-hint"]'); if(b) await b.click(); } await scan('.hints','arena ipucu '+t.id); }
    const ls=await p.evaluate(s=>{const R=new RegExp(s);const o=[];PY_LESSONS.forEach(l=>{const n=(l.ex||[]).filter(e=>(e.hints||[]).some(x=>R.test(x))).length;if(n)o.push(l.id)});return o},hintRe.source);
    for(const id of ls){ await go('#/lesson/'+id+'/alistirma'); await p.evaluate(()=>document.querySelectorAll('.exblock details,details.exblock').forEach(d=>d.open=true)); await sleep(100); const bs=await p.$$('[data-act="ex-hint"]'); for(const b of bs.slice(0,6)){ try{ await b.click({timeout:300}); }catch(e){} } await scan('.hints','ders ipucu '+id); }
  }
});
