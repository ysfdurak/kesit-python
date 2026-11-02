const fs=require('fs');const window={};const [ ,,id,...files]=process.argv;
for(const f of files)new Function('window',fs.readFileSync(f,'utf8'))(window);
const all=[];(window.PY_LESSONS||[]).forEach(l=>(l.ex||[]).forEach(e=>all.push(e)));(window.PY_EXT||[]).forEach(l=>(l.ex||[]).forEach(e=>all.push(e)));(window.PY_BANK||[]).forEach(e=>all.push(e));
const e=all.find(e=>e.id===id);console.log('needs',e.needs);console.log(e.sol);console.log('--- tests');console.log(e.tests);
