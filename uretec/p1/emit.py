"""Proje dersi üreticileri için ortak yardımcılar. Beklenen değerler gerçek veriyle CPython'da hesaplanır."""
import contextlib, html, io, json, os, sys
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, KOK + '/tools/pylib'); os.environ['PP_VERI'] = KOK + '/data'

def kodu(s):
    return '<pre class="py">' + html.escape(s.strip('\n'), quote=False) + '</pre>'

def calistir(code):
    ns = {'__name__': '__main__'}; b = io.StringIO()
    with contextlib.redirect_stdout(b):
        exec(compile(code, '<uretec>', 'exec'), ns)
    return ns, b.getvalue()

def tahmin(q, code, yanlislar, why, a=1, **ek):
    _, out = calistir(code)
    out = out.strip('\n')
    o = list(yanlislar); o.insert(a % (len(o) + 1), out)
    assert len(set(o)) == len(o), o
    return dict(t='predict', stage='Kodu oku', q=q, code=code, o=o, a=a % len(o), why=why, **ek)

def mc(q, dogru, yanlislar, why, a=0):
    o = list(yanlislar); o.insert(a, dogru)
    return dict(t='mc', stage='Isınma', q=q, o=o, a=a, why=why)

def yaz(yol, baslik, ders, lv, sabit=None):
    """Dersi JS olarak yazar. lv ilk 4000 baytta düz metin olmalı: tools/build.py paketi buna göre seçer."""
    ders = dict(ders); kimlik = ders.pop('id'); ders.pop('lv', None)
    gov = json.dumps(ders, ensure_ascii=False, indent=1)
    s = "/* Kesit Python: " + baslik + ". uretec/p1 üretir, elle düzenleme. */\n(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(Object.assign({ id: '" + kimlik + "', lv: '" + lv + "' }, " + gov + "));\n})(window);\n"
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    open(yol, 'w', encoding='utf-8').write(s)
    print('yazıldı', yol, len(s))
