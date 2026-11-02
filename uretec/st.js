const fs=require('fs');const window={};globalThis.window=window;
for(const f of process.argv.slice(2)) new Function('window',fs.readFileSync(f,'utf8'))(window);
const Q=window.PY_INTERVIEW; const mine=Q.filter(q=>+q.id.slice(2)>=346&&+q.id.slice(2)<=390);
const ids=Q.map(q=>q.id); console.log('toplam',Q.length,'benim',mine.length,'yinelenen id',ids.filter((x,i)=>ids.indexOf(x)!==i));
const old=new Set(Q.filter(q=>+q.id.slice(2)<346).map(q=>q.topic)); console.log('çakışan topic',mine.filter(q=>old.has(q.topic)).map(q=>q.topic));
const c=k=>{const o={};mine.forEach(q=>{[].concat(q[k]).forEach(v=>o[v]=(o[v]||0)+1)});return o};
console.log(c('lv'),c('kind'),c('roles'));
const prim={};mine.forEach(q=>prim[q.roles[0]]=(prim[q.roles[0]]||0)+1);console.log('birincil',prim);
const wc=mine.map(q=>[q.id,q.a.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length]);console.log(wc.map(x=>x.join(':')).join(' '));
