const fs=require('fs');const window={};globalThis.window=window;
const files=process.argv.slice(2);for(const f of files){new Function('window',fs.readFileSync(f,'utf8'))(window);}
for(const q of window.PY_INTERVIEW) if(q.roles.some(r=>['web','otomasyon','muhendis','backend'].includes(r))) console.log(q.id,q.roles.join(','),q.lv,q.kind,'|',q.topic,'|',q.q.slice(0,90));
