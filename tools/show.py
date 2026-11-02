#!/usr/bin/env python3
"""Bir dersin mevcut içeriğini özetler: python3 show.py <ders-id> [--body]
Alıştırmaların türü, aşaması, sorusu ve fonksiyon adları; FAQ/mistakes başlıkları; body başlıkları (h2/h3)."""
import json, subprocess, sys, re, glob, os
import os as _os
ROOT = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), 'kaynak')
files = [f'{ROOT}/c_temel.js', f'{ROOT}/c_orta.js', f'{ROOT}/c_ileri.js'] + sorted(glob.glob(f'{ROOT}/v2/*/*.js'))
DUMP = "const fs=require('fs');const window={console};for(const f of process.argv.slice(1)){try{new Function('window',fs.readFileSync(f,'utf8'))(window)}catch(e){}}const L=window.PY_LESSONS||[];(window.PY_EXT||[]).forEach(x=>{const l=L.find(y=>y.id===x.id);if(l){l.ex=(l.ex||[]).concat(x.ex||[]);if(x.html)l.body+=x.html}});process.stdout.write(JSON.stringify(L))"
L = json.loads(subprocess.run(['node', '-e', DUMP] + [f for f in files if os.path.exists(f)], capture_output=True, text=True).stdout)
lid = sys.argv[1]
l = next((x for x in L if x['id'] == lid), None)
if not l: print('ders yok:', lid); sys.exit(1)
strip = lambda h: re.sub(r'<[^>]+>', '', h or '')
print(f"# {l['id']} — {l['title']} [{l['lv']} / {l.get('mod')}]  ~{len(strip(l['body']).split())} kelime")
print('Başlıklar:', ' | '.join(strip(x) for x in re.findall(r'<h[23]>(.*?)</h[23]>', l['body'])))
for i, e in enumerate(l.get('ex') or []):
    fn = re.findall(r'def (\w+)', e.get('sol') or '')
    print(f"  {i+1:2}. [{e.get('t')}/{e.get('stage','-')}] {strip(e.get('q'))[:140]}" + (f"  fn={fn}" if fn else ''))
print('SSS:', [f['q'] for f in l.get('faq') or []])
print('Sık hata:', [m['why'][:60] for m in l.get('mistakes') or []])
if '--body' in sys.argv: print(strip(l['body']))
