#!/usr/bin/env python3
"""kaynak/ex_anahtar.js üretir: kimliği olmayan alıştırmaların ilerleme anahtarı eski sürümde sıra numarasıydı.
tools/ex_taban.json eski sürümün dökümüdür (ders → [sıra, tür, soru özeti, kod özeti]). Eşleşen alıştırma eski anahtarını korur."""
import hashlib, json, os, re, subprocess
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMP = r"""
const fs=require('fs'),vm=require('vm');global.window=global;const R=process.argv[1];
for(const f of ['levels.js','c_temel.js','c_orta.js','c_ileri.js','n_temel.js','n_orta.js','n_ileri.js','x_1.js','x_2.js'])if(fs.existsSync(R+f))vm.runInThisContext(fs.readFileSync(R+f,'utf8'));
const m={};PY_LESSONS.forEach(l=>m[l.id]=l);(PY_EXT||[]).forEach(x=>{if(m[x.id]&&x.ex)m[x.id].ex=(m[x.id].ex||[]).concat(x.ex)});
process.stdout.write(JSON.stringify(PY_LESSONS.map(l=>({id:l.id,ex:(l.ex||[]).filter(e=>!e.id).map(e=>({t:e.t,q:e.q||'',c:e.code||e.sol||''}))}))));
"""
def fnv(s):
    h = 2166136261
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 16777619) & 0xffffffff
    return h
sha = lambda s: hashlib.sha1(s.encode()).hexdigest()[:12]
taban = json.load(open(KOK + '/tools/ex_taban.json', encoding='utf-8'))
L = json.loads(subprocess.run(['node', '-e', DUMP, KOK + '/'], capture_output=True, text=True, check=True).stdout)
out = {}; hit = miss = 0
for l in L:
    base = taban.get(l['id'], []); used = set(); seen = {}; m = {}
    for e in l['ex']:
        sig = str(fnv(e['t'] + '|' + e['q'] + '|' + e['c'])); seen[sig] = seen.get(sig, 0) + 1
        if seen[sig] > 1: sig += '.' + str(seen[sig])
        q, c = sha(e['q']), sha(e['c'])
        f = next((b for b in base if b[0] not in used and b[1] == e['t'] and b[2] == q), None) or next((b for b in base if b[0] not in used and b[1] == e['t'] and c == b[3] and e['c']), None)
        if f: used.add(f[0]); m[sig] = f[0]; hit += 1
        else: miss += 1
    if m: out[l['id']] = m
with open(KOK + '/kaynak/ex_anahtar.js', 'w', encoding='utf-8') as f:
    f.write('/* Kimliksiz alıştırmaların eski ilerleme anahtarları: tools/exkey.py üretir */\nwindow.PY_EXKEY = ' + json.dumps(out, separators=(',', ':')) + ';\n')
print('eski anahtarı korunan', hit, 'yeni', miss)
