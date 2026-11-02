#!/usr/bin/env python3
# Temel kod görevlerinde öğretilmemiş yapı ölçümü: bir yapı, derste (veya önceki derslerde) gövde kod örneğinde geçtiyse öğretilmiş sayılır
import json,ast,sys,collections,re,html
import os,subprocess
KOK=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_D=r"""
const fs=require('fs'),vm=require('vm');global.window=global;const R=process.argv[1];
for(const f of ['levels.js','c_temel.js','c_orta.js','c_ileri.js','n_temel.js','n_orta.js','n_ileri.js','x_1.js','x_2.js'])if(fs.existsSync(R+f))vm.runInThisContext(fs.readFileSync(R+f,'utf8'));
const m={};PY_LESSONS.forEach(l=>m[l.id]=l);(PY_EXT||[]).forEach(x=>{if(m[x.id]&&x.ex)m[x.id].ex=(m[x.id].ex||[]).concat(x.ex)});
process.stdout.write(JSON.stringify({LVFIX:PY_LV_FIX,OPT:PY_OPTIONAL,ORDER:PY_ORDER,L:PY_LESSONS}));
"""
D=json.loads(subprocess.run(['node','-e',_D,KOK+'/'],capture_output=True,text=True,check=True).stdout);L={l['id']:l for l in D['L']}
FIX=D.get('FIX',{})
order=D['ORDER']; lv=lambda i:(D.get('LVFIX',{}).get(i) or L[i]['lv'])
NEW=[i for i in order if lv(i)=='temel' and not i in D.get('OPT',[])]
ORD={k:i for i,k in enumerate(NEW)}
def cons(src):
    s=set()
    try:t=ast.parse(src)
    except SyntaxError: return set()
    for n in ast.walk(t):
        if isinstance(n,(ast.FunctionDef,ast.Return)):
            s.add('def')
            if getattr(n,'decorator_list',None): s.add('decor')
        if isinstance(n,ast.AsyncFunctionDef): s.add('async')
        if isinstance(n,(ast.If,ast.IfExp)):
            if isinstance(n,ast.If) and isinstance(n.test,ast.Compare) and getattr(n.test.left,'id','')=='__name__': s.add('main')
            else: s.add('if')
        if isinstance(n,ast.For):s.add('for')
        if isinstance(n,ast.While):s.add('while')
        if isinstance(n,ast.List):s.add('list')
        if isinstance(n,ast.Dict):s.add('dict')
        if isinstance(n,(ast.ListComp,ast.DictComp,ast.SetComp,ast.GeneratorExp)):s.add('comp')
        if isinstance(n,ast.ClassDef):s.add('class')
        if isinstance(n,(ast.Import,ast.ImportFrom)):s.add('import')
        if isinstance(n,ast.Try):s.add('try')
        if isinstance(n,ast.With):s.add('with')
        if isinstance(n,ast.Lambda):s.add('lambda')
        if isinstance(n,(ast.Yield,ast.YieldFrom)):s.add('yield')
        if isinstance(n,ast.Match):s.add('match')
        if isinstance(n,ast.Set):s.add('set')
    return s
FLOOR={'comp':'listeler','lambda':'sozlukler','class':'__yok__','try':'girdi-donusum','with':'dosya-islemleri','yield':'__yok__','decor':'__yok__','async':'__yok__','if':'kosullar','for':'donguler','while':'donguler','set':'demet-kume','dict':'sozlukler','list':'donguler'}
seen=set();taught={}
for lid in NEW:
    body=L[lid]['body']
    for m in re.finditer(r'<pre class="(?:py|code)"[^>]*>(.*?)</pre>',body,re.S):
        c=html.unescape(re.sub(r'<[^>]+>','',m.group(1)))
        seen|=cons(c)
    taught[lid]={k for k in seen if k not in FLOOR or (FLOOR[k] in ORD and ORD[FLOOR[k]]<=ORD[lid])}
tot=bad=erk=0;agg=collections.Counter();rows=[];det=[]
for lid in NEW:
    l=L[lid];v=[];n=0
    for e in l['ex']:
        if e['t']!='code':continue
        n+=1;tot+=1
        if e.get('erken'): erk+=1;continue
        miss=sorted(k for k in cons(e.get('sol','')) if k not in taught[lid] and k not in('main',))
        if miss: v.append(miss);det.append((lid,e.get('id'),e.get('stage'),miss,re.sub(r'<[^>]+>','',e['q'])[:60]))
    if v:
        bad+=len(v);agg.update(m for x in v for m in x);rows.append((lid,n,len(v)))
print('Temel (zorunlu) ders',len(NEW),'kod görevi',tot,'ihlal',bad,'etiketli erken',erk,agg.most_common())
print(rows)
sys.exitcode=1 if bad else 0
if '-v' in sys.argv:
    for d in det:print(d)

sys.exit(1 if bad else 0)
