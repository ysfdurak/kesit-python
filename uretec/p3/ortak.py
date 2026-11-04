"""p3 üreticileri için ortak yardımcılar: ders yazımı ve her görevin üretim anında sınanması.
Her kod görevi için: çözüm geçmeli, başlangıç kodu geçmemeli, listedeki her yanlış çözüm geçmemeli."""
import html, json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SONUC = os.environ.get('P3_YANLIS', '')
def pre(s): return '<pre class="py">' + html.escape(s.strip('\n'), quote=False) + '</pre>'
def kod(s): return '<pre class="code">' + html.escape(s.strip('\n'), quote=False) + '</pre>'
def C(id, stage, q, start, sol, tests, hints, why, diff=2, yanlis=(), **k):
    d = dict(t='code', id=id, stage=stage, diff=diff, q='<p>' + q + '</p>', start=start, sol=sol, tests=tests, hints=hints, why=why, _yanlis=list(yanlis))
    d.update(k); return d
def M(id, q, o, a, why):
    u = [len(x) for x in o]
    assert u[a] < max(u) or len(set(u)) == 1, f'{id}: doğru şık en uzun: {o[a]}'
    return dict(t='mc', id=id, stage='Isınma', q=q, o=o, a=a, why=why)
def T(id, q, code, o, a, why): return dict(t='predict', id=id, stage='Kodu oku', q=q, code=code, o=o, a=a, why=why)
def Y(id, q, steps, **k): return dict(t='local', id=id, stage='Kendi bilgisayarında', q='<p>' + q + '</p>', steps=steps, **k)
_R = r'''
import json, sys, io, contextlib
sys.path.insert(0, %r)
import os
os.environ['PP_VERI'] = %r
cfg = json.load(sys.stdin)
ns = {"__name__": "__main__", "__source__": cfg["code"], "__kod__": cfg["code"]}
exec(compile(cfg["code"], "<kod>", "exec"), ns)
exec(compile(cfg["tests"], "<test>", "exec"), ns)
print("\n@@GECTI")
'''
def _kos(code, tests):
    try:
        p = subprocess.run([sys.executable, '-I', '-c', _R % (KOK + '/tools/pylib', KOK + '/data')], input=json.dumps(dict(code=code, tests=tests)), capture_output=True, text=True, timeout=40, cwd='/tmp')
    except subprocess.TimeoutExpired:
        return False, 'zaman aşımı'
    return '@@GECTI' in p.stdout, (p.stderr.strip().splitlines() or [''])[-1][:300]
def _sina(e):
    y = []
    ok, m = _kos(e['sol'], e['tests'])
    if not ok: y.append(f"{e['id']} ÇÖZÜM KALDI: {m}")
    ok, m = _kos(e['start'], e['tests'])
    if ok: y.append(f"{e['id']} başlangıç geçti")
    for i, (kod_, ad) in enumerate(e['_yanlis']):
        try:
            compile(kod_, 'y', 'exec')
        except SyntaxError as h:
            y.append(f"{e['id']} YANLIŞ ÇÖZÜM SÖZDİZİMİ BOZUK #{i}: {ad}: {h}")
        ok, m = _kos(kod_, e['tests'])
        if ok: y.append(f"{e['id']} YANLIŞ KABUL #{i}: {ad}")
    return y
def sina(ders_ex):
    kodlar = [e for e in ders_ex if e.get('t') == 'code']
    with ThreadPoolExecutor(6) as h:
        y = [x for r in h.map(_sina, kodlar) for x in r]
    for s in y: print('  !', s)
    return len(y), sum(len(e['_yanlis']) for e in kodlar), len(kodlar)
def yaz(dosya, baslik, ders):
    ex = ders['ex']
    h, yn, n = sina(ex)
    print(f"{ders['id']}: {n} kod görevi, {yn} yanlış çözüm, {h} sorun")
    yanlislar = {e['id']: e['_yanlis'] for e in ex if e.get('t') == 'code'}
    if SONUC:
        os.makedirs(SONUC, exist_ok=True)
        json.dump(dict(ders=ders['id'], y=yanlislar), open(f"{SONUC}/{ders['id']}.json", 'w'), ensure_ascii=False)
    for e in ex: e.pop('_yanlis', None)
    ders = dict(ders); kimlik = ders.pop('id'); lv = ders.pop('lv')
    gov = json.dumps(ders, ensure_ascii=False, indent=1)
    s = f"/* Kesit Python: {baslik}. uretec/p3 üretir, elle düzenleme. */\n(function (W) {{\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(Object.assign({{ id: '{kimlik}', lv: '{lv}' }}, {gov}));\n}})(window);\n"
    os.makedirs(f'{KOK}/kaynak/v2/p3', exist_ok=True)
    open(f'{KOK}/kaynak/v2/p3/{dosya}.js', 'w', encoding='utf-8').write(s)
    return h
