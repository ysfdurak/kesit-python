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
  async dom(p,scan,bad){
    /* Terim parantezi: yanlış sözcüğe yapışan İngilizce karşılık (Y1). Otomatik biçimler onay listesinde olmalı; çok anlamlı üç terim yalnız elle yazıldığı derslerde ve doğru biçimde geçer. */
    const onay=JSON.parse(require('fs').readFileSync(path.join(__dirname,'gloss_onayli.json'),'utf8'));
    const log=await p.evaluate(()=>window.PY_GLOSS_LOG||[]);
    for(const g of log) if(!(onay[g.en]||[]).includes(g.s.toLocaleLowerCase('tr').replace(/i̇/g,'i')) && !(onay[g.en]||[]).includes(g.s.toLowerCase())) bad('gloss onaysız '+g.id,g.s+' ('+g.en+')',g.c);
    const hand=await p.evaluate(()=>{const out=[];const re=/([\p{L}'’-]+)\s*"?\s*\((prompt|retrieval|closure)\)/giu;PY_LESSONS.forEach(l=>{const d=document.createElement('div');d.innerHTML=l.body;d.querySelectorAll('pre,code,a.lk').forEach(x=>x.remove());const t=d.textContent;let m;while((m=re.exec(t)))out.push({id:l.id,w:m[1],en:m[2],c:t.slice(Math.max(0,m.index-40),m.index+m[0].length+20)});});return out;});
    const BICIM={prompt:/^(istem|istemi|isteme|istemin|istemde|istemine|istemdeki|istemler)$/i,retrieval:/^getirme$/i,closure:/^(kapanış|kapanışların)$/i};
    const YASAK=/(izin isteme|hesap kapanış|muhasebe kapanış|sonu kapanış|açılış\/kapanış)/i;
    const DERS={prompt:['prompt-muhendisligi','kurulum-araclar','sanal-ortam-pip','kurulum-windows','proje-oyunlar','embedding-vektor-arama','rag-uygulamasi','yerel-modeller-hf','llm-api','llm-degerlendirme','girdi-donusum','yapay-zeka-ile-kod'],retrieval:['embedding-vektor-arama','llm-api','llm-degerlendirme','llm-ajanlar','rag-uygulamasi','proje-ai'],closure:['kapanis-kapsam','kapsam-moduller','bellek-ic-yapi']};
    for(const h of hand){ const en=h.en.toLowerCase(); if(!BICIM[en].test(h.w)||YASAK.test(h.c)||!DERS[en].includes(h.id)) bad('gloss yanlış sözcük '+h.id,h.w+' ('+h.en+')',h.c); }
    console.log('terim parantezi: otomatik',log.length,'elle (prompt/retrieval/closure)',hand.length);
    if(process.env.GLOSS_ONLY) return;
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
