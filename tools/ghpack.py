#!/usr/bin/env python3
"""GitHub Pages paketi: gh/kesit-python/ klasörünü üretir (main dalı bu klasörün içeriğidir).
Önce derler; sync.js (claude.ai eşitlemesi) pakete girmez, yazı tipleri yerelden yüklenir, açılışta yükleme çubuğu gösterilir."""
import json, os, re, shutil, subprocess, sys, glob
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O = KOK + '/gh/kesit-python'
os.chdir(KOK)
subprocess.run(['python3', 'tools/build.py'], check=True, stdout=subprocess.DEVNULL)
shutil.rmtree(O, ignore_errors=True); os.makedirs(O)
html = open('index.html', encoding='utf-8').read()
tags = re.findall(r'<script charset="utf-8" src="([^"]+)"></script>', html)
tags = [t for t in tags if t != 'sync.js']
for t in tags: shutil.copy(t, O + '/' + t)
shutil.copy('pyworker.js', O + '/pyworker.js')
tot = sum(os.path.getsize(t) for t in tags); seen = 0
def tag(m):
    global seen
    t = m.group(1)
    if t == 'sync.js': return ''
    seen += os.path.getsize(t)
    return f'<script charset="utf-8" src="{t}"></script>\n<script>__b({round(100 * seen / tot)})</script>'
html = re.sub(r'<script charset="utf-8" src="([^"]+)"></script>', tag, html)
first = re.search(r'<script charset="utf-8" src="', html).start()
html = html[:first] + '<script>function __b(p){var e=document.getElementById("bootBar");if(e)e.style.width=p+"%"}</script>\n<script charset="utf-8" src="config.js"></script>\n' + html[first:]
html = re.sub(r'<link rel="preconnect" href="https://fonts\.g[^>]*>\n?', '', html)
html = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="vendor/fonts.css">', html)
html = html.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
meta = '''<meta name="theme-color" content="#3B6FD6">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Kesit Python">
<meta property="og:title" content="Kesit Python: sıfırdan işe hazır Python">
<meta property="og:description" content="Kurulum yok, hesap yok. Python'ı tarayıcında çalıştırarak öğren: dersler, otomatik testli alıştırmalar, öğrenme yolları, mülakat ve Python Arena.">
<meta property="og:image" content="https://ysfdurak.github.io/kesit-python/og.png">
<meta property="og:url" content="https://ysfdurak.github.io/kesit-python/">
<meta name="twitter:card" content="summary_large_image">
'''
assert '<title>Kesit Python</title>' in html
html = html.replace('<title>Kesit Python</title>', '<title>Kesit Python</title>\n' + meta, 1)
html = html.replace('</body>', '''<script>if('serviceWorker' in navigator && /^https:|^http:\\/\\/localhost/.test(location.href) && !/claude|claudeusercontent/.test(location.host)) navigator.serviceWorker.register('sw.js').catch(()=>{});</script>\n</body>''', 1)
assert 'vendor/fonts.css' in html and 'serviceWorker' in html and 'fonts.googleapis' not in html
open(O + '/index.html', 'w', encoding='utf-8').write(html)
shutil.copytree('data', O + '/data')
for f in ['config.js', 'LICENSE', 'LICENSE-ICERIK.md']: shutil.copy('kaynak/gh/' + f, O + '/' + f)
shutil.copytree('kaynak/gh/static', O, dirs_exist_ok=True)
# Service worker: içerik özetiyle sürümlenir, ilk ziyarette çekirdek dosyaları önbelleğe alır, eski sürümü siler
import hashlib
_pre = ['./', 'index.html', 'config.js', 'pyworker.js', 'vendor/fonts.css', 'data/manifest.json'] + tags
_h = hashlib.sha256()
for f in sorted(set(x for x in _pre if x != './')):
    _h.update(open(O + '/' + f, 'rb').read())
_sw = open(O + '/sw.js', encoding='utf-8').read().replace('__SURUM__', _h.hexdigest()[:12]).replace('__ONBELLEK__', json.dumps(_pre, ensure_ascii=False))
open(O + '/sw.js', 'w', encoding='utf-8').write(_sw)
if os.path.isdir('kaynak/gh/ekran'): shutil.copytree('kaynak/gh/ekran', O + '/ekran')
open(O + '/.nojekyll', 'w').close()
r = subprocess.run(['node', 'tools/readme.js'], check=True, capture_output=True, text=True, cwd=KOK)
open(O + '/README.md', 'w', encoding='utf-8').write(r.stdout)
tt = sum(os.path.getsize(os.path.join(a, f)) for a, _, b in os.walk(O) for f in b)
print('paket', O, 'dosya', sum(len(b) for _, _, b in os.walk(O)), f'{tt/1e6:.1f} MB')
