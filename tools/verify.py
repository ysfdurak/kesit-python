#!/usr/bin/env python3
"""Kesit Python içerik doğrulayıcı.
Tüm alıştırmaları gerçek CPython ile denetler:
  code    : sol + tests çalışır, expect varsa çıktı birebir eşleşir; start testleri GEÇMEMELİ (görev boş olmasın)
  predict : code çalıştırılır; çıktı o[a] ile birebir aynı olmalı (raises: true ise hata adı o[a] olmalı)
  order   : lines sırasıyla birleştirilip çalıştırılır; tests/expect varsa denetlenir
  mc      : a indeksi geçerli; doğru şık belirgin biçimde en uzun şık olmasın (uyarı)
Ders uzantıları (window.PY_EXT = [{id, ex:[...]}]) ilgili derse eklenerek denetlenir.
Kullanım: python3 verify.py dosya1.js [dosya2.js ...]   (-q: yalnız özet ve hatalar)
"""
import json, subprocess, sys, textwrap, os
from concurrent.futures import ThreadPoolExecutor

DUMP = r'''
const fs = require('fs');
const window = { console };
globalThis.window = window;
for (const f of process.argv.slice(1)) { new Function('window', fs.readFileSync(f, 'utf8'))(window); }
const L = window.PY_LESSONS || [];
const ext = window.PY_EXT || [];
const lmap = {}; L.forEach(l => lmap[l.id] = l);
const orphans = [];
ext.forEach(x => { const l = lmap[x.id]; if (l) { l.ex = (l.ex || []).concat(x.ex || []); l._ext = (l._ext || 0) + (x.ex || []).length; } else orphans.push({ id: x.id + ' (uzantı)', ex: x.ex || [], _orphan: true }); });
const out = { lessons: L.concat(orphans), bank: window.PY_BANK || [], exams: window.PY_EXAMS || [], arena: window.PY_ARENA || [], interview: window.PY_INTERVIEW || [], mistakes: window.PY_MISTAKES || [] };
process.stdout.write(JSON.stringify(out));
'''

RUNNER = r'''
import sys, io, builtins, json, os
sys.path.insert(0, "__KOK__/tools/pylib"); os.environ["PP_VERI"] = "__KOK__/data"
cfg = json.loads(sys.stdin.read())
_inputs = list(cfg.get("stdin") or [])
_raw = cfg.get("raw")
if _raw is not None:
    sys.stdin = io.StringIO(_raw)
def _input(prompt=""):
    if _raw is not None:
        s = sys.stdin.readline()
        if not s: raise EOFError("girdi bitti")
        return s.rstrip("\n")
    sys.stdout.write(str(prompt))
    if not _inputs:
        raise EOFError("input() için girdi kalmadı")
    v = _inputs.pop(0); sys.stdout.write(str(v) + "\n"); return str(v)
builtins.input = _input
try:
    import matplotlib; matplotlib.use("Agg")
except Exception:
    pass
buf = io.StringIO(); sys.stdout = buf
ns = {"__name__": "__main__", "__source__": cfg["code"]}
err = None; etype = None
try:
    exec(compile(cfg["code"], "<cozum>", "exec"), ns)
    if cfg.get("tests"):
        exec(compile(cfg["tests"], "<test>", "exec"), ns)
except BaseException as e:
    import traceback
    err = traceback.format_exc(); etype = type(e).__name__
sys.stdout = sys.__stdout__
print(json.dumps({"out": buf.getvalue(), "err": err, "etype": etype}))
'''
KOK = __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
RUNNER = RUNNER.replace('__KOK__', KOK)


def py(code, tests='', stdin=None, raw=None, timeout=60):
    timeout = timeout * int(os.environ.get("VT","1"))
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        p = subprocess.run([sys.executable, '-I', '-c', RUNNER], input=json.dumps({'code': code, 'tests': tests, 'stdin': stdin, 'raw': raw}), capture_output=True, text=True, timeout=timeout, cwd=td)
    if p.returncode != 0: return {'out': '', 'err': 'runner: ' + p.stderr[-800:], 'etype': 'Runner'}
    return json.loads(p.stdout.strip().splitlines()[-1])

def norm(s): return '\n'.join(l.rstrip() for l in str(s).replace('\r\n', '\n').split('\n')).strip()

def check_code(e):
    if not e.get('sol'): return False, 'sol yok'
    if not e.get('tests') and e.get('expect') is None: return False, 'tests/expect yok'
    r = py(e['sol'], e.get('tests') or '', e.get('stdin'))
    if r['err']: return False, r['err'][-900:]
    if e.get('expect') is not None and norm(r['out']) != norm(e['expect']):
        return False, f"çıktı farklı:\n--- beklenen ---\n{norm(e['expect'])}\n--- gelen ---\n{norm(r['out'])}"
    st = e.get('start')
    if st and st.strip():
        r2 = py(st, e.get('tests') or '', e.get('stdin'))
        passed = not r2['err'] and (e.get('expect') is None or norm(r2['out']) == norm(e['expect']))
        if passed: return False, 'start kodu testleri zaten geçiyor (görev öğrenciye iş bırakmıyor)'
    return True, ''

def check_predict(e):
    o = e.get('o') or []; a = e.get('a')
    if not isinstance(a, int) or not (0 <= a < len(o)): return False, 'a indeksi geçersiz'
    if not e.get('code'): return False, 'code yok'
    if len(set(norm(x) for x in o)) != len(o): return False, 'aynı şık iki kez var'
    r = py(e['code'])
    if e.get('raises'):
        if not r['err']: return False, 'hata bekleniyordu ama kod çalıştı'
        if r['etype'] not in o[a]: return False, f"hata türü {r['etype']}, doğru şık: {o[a]}"
        return True, ''
    if r['err']: return False, r['err'][-600:]
    if norm(r['out']) != norm(o[a]): return False, f"çıktı doğru şıkla aynı değil:\n--- şık ---\n{o[a]}\n--- gerçek ---\n{norm(r['out'])}"
    for i, x in enumerate(o):
        if i != a and norm(x) == norm(r['out']): return False, f'yanlış şık {i} de gerçek çıktıya eşit'
    return True, ''

def check_order(e):
    lines = e.get('lines') or []
    if len(lines) < 3: return False, 'en az 3 satır olmalı'
    if len(set(lines)) != len(lines): return False, 'aynı satır iki kez var (sıralama belirsizleşir)'
    code = '\n'.join(lines) + '\n'
    if not e.get('tests') and e.get('expect') is None: return False, 'tests/expect yok'
    r = py(code, e.get('tests') or '', e.get('stdin'))
    if r['err']: return False, r['err'][-700:]
    if e.get('expect') is not None and norm(r['out']) != norm(e['expect']):
        return False, f"çıktı farklı:\n--- beklenen ---\n{norm(e['expect'])}\n--- gelen ---\n{norm(r['out'])}"
    return True, ''


def check_arena(e):
    for k in ('id', 'title', 'track', 'diff', 'statement', 'sol'):
        if not e.get(k): return False, k + ' alanı yok'
    if e.get('mode', 'stdin') == 'func':
        if not e.get('tests'): return False, 'func modunda tests yok'
        r = py(e['sol'], e['tests'])
        if r['err']: return False, r['err'][-700:]
        if e.get('start'):
            r2 = py(e['start'], e['tests'])
            if not r2['err']: return False, 'start kodu testleri geçiyor'
        return True, ''
    cases = [('örnek', c) for c in e.get('samples') or []] + [('gizli', c) for c in e.get('hidden') or []]
    if len(e.get('samples') or []) < 1 or len(e.get('hidden') or []) < 4: return False, 'en az 1 örnek ve 4 gizli test olmalı'
    for i, (tur, c) in enumerate(cases):
        inp = c.get('in')
        if c.get('gen'):
            g = py(c['gen'])
            if g['err']: return False, f'{tur} test {i} üreteci hata verdi: ' + g['err'][-300:]
            inp = g['out']
        if inp is None: return False, f'{tur} test {i}: girdi yok'
        r = py(e['sol'], '', None, inp, timeout=30)
        if r['err']: return False, f'{tur} test {i}: ' + r['err'][-500:]
        if c.get('out') is not None and norm(r['out']) != norm(c['out']):
            return False, f"{tur} test {i} çıktı farklı:\n beklenen: {norm(c['out'])[:200]!r}\n gelen   : {norm(r['out'])[:200]!r}"
        if not norm(r['out']): return False, f'{tur} test {i}: çözüm hiç çıktı üretmedi'
    return True, ''

def check_interview(e):
    for k in ('id', 'roles', 'lv', 'q', 'a'):
        if not e.get(k): return False, k + ' alanı yok'
    if e.get('code'):
        r = py(e['code'])
        if e.get('out') is not None:
            got = norm(r['out']) if not r['err'] else (r['etype'] or 'Hata')
            if norm(e['out']) != got and not (r['err'] and r['etype'] and r['etype'] in e['out']):
                return False, f"kod çıktısı farklı:\n beklenen: {norm(e['out'])!r}\n gelen   : {got!r}"
        elif r['err']: return False, 'kod hata verdi: ' + r['err'][-300:]
    return True, ''

def check_mistake(e):
    for k in ('id', 'title', 'bad', 'good', 'why'):
        if not e.get(k): return False, k + ' alanı yok'
    r = py(e['bad'])
    if e.get('bad_err'):
        if not r['err'] or r['etype'] != e['bad_err']: return False, f"hatalı kod {e['bad_err']} vermeliydi; gelen: {r['etype']}"
    elif r['err']: return False, 'hatalı kod beklenmedik hata verdi: ' + r['err'][-300:]
    elif e.get('bad_out') is not None and norm(r['out']) != norm(e['bad_out']): return False, f"bad_out farklı: {norm(r['out'])!r}"
    g = py(e['good'])
    if g['err']: return False, 'doğru kod hata verdi: ' + g['err'][-300:]
    if e.get('good_out') is not None and norm(g['out']) != norm(e['good_out']): return False, f"good_out farklı: {norm(g['out'])!r}"
    return True, ''

def mc_warn(name, e):
    o = e.get('o') or []; a = e.get('a')
    if not isinstance(a, int) or not (0 <= a < len(o)): return 'mc a indeksi geçersiz'
    L = sorted(len(x) for x in o)
    if len(o) > 1 and len(o[a]) == L[-1] and L[-1] > L[-2] + 12: print(f"UYARI {name}: doğru şık en uzun şık")
    return None

def collect(data):
    items = []; ids = {}
    for l in data['lessons']:
        for i, e in enumerate(l.get('ex') or []):
            name = f"{l['id']}#{e.get('id') or i}"
            if e.get('id'):
                if e['id'] in ids: items.append((name, 'bad', 'tekrarlanan alıştırma id: ' + e['id']))
                ids[e['id']] = 1
            t = e.get('t')
            if t == 'code': items.append((name, 'code', e))
            elif t == 'predict': items.append((name, 'predict', e))
            elif t == 'order': items.append((name, 'order', e))
            elif t == 'mc':
                m = mc_warn(name, e)
                if m: items.append((name, 'bad', m))
            else: items.append((name, 'bad', 'bilinmeyen tür: ' + str(t)))
    seen = set()
    for t in data['bank']:
        if t.get('id') in seen: items.append(('bank#' + str(t.get('id')), 'bad', 'tekrarlanan pratik id'))
        seen.add(t.get('id'))
        items.append((f"bank#{t.get('id')}", t.get('t') if t.get('t') in ('predict', 'order') else 'code', t))
    for ex in data['exams']:
        for i, q in enumerate(ex.get('qs') or []):
            if q.get('t') in ('code', 'predict', 'order'): items.append((f"exam {ex.get('id')}#{i}", q['t'], q))
            elif q.get('t') == 'mc':
                m = mc_warn(f"exam {ex.get('id')}#{i}", q)
                if m: items.append((f"exam {ex.get('id')}#{i}", 'bad', m))
    seen2 = set()
    for a in data.get('arena', []):
        if a.get('id') in seen2: items.append(('arena#' + str(a.get('id')), 'bad', 'tekrarlanan arena id'))
        seen2.add(a.get('id')); items.append((f"arena#{a.get('id')}", 'arena', a))
    seen3 = set()
    for q in data.get('interview', []):
        if q.get('id') in seen3: items.append(('mulakat#' + str(q.get('id')), 'bad', 'tekrarlanan id'))
        seen3.add(q.get('id')); items.append((f"mulakat#{q.get('id')}", 'interview', q))
    seen4 = set()
    for m in data.get('mistakes', []):
        if m.get('id') in seen4: items.append(('hata#' + str(m.get('id')), 'bad', 'tekrarlanan id'))
        seen4.add(m.get('id')); items.append((f"hata#{m.get('id')}", 'mistake', m))
    return items

def run_item(it):
    name, kind, e = it
    try:
        if kind == 'bad': return name, False, e
        return (name,) + {'code': check_code, 'predict': check_predict, 'order': check_order, 'arena': check_arena, 'interview': check_interview, 'mistake': check_mistake}[kind](e)
    except subprocess.TimeoutExpired: return name, False, 'zaman aşımı (60 sn)'

def main():
    files = [f for f in sys.argv[1:] if not f.startswith('-')]
    if not files: print(__doc__); sys.exit(1)
    for f in files:
        r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
        if r.returncode: print('SÖZDİZİMİ HATASI', f, r.stderr[:1500]); sys.exit(2)
    p = subprocess.run(['node', '-e', DUMP] + files, capture_output=True, text=True)
    if p.returncode: print('YÜKLEME HATASI', p.stderr[:2000]); sys.exit(2)
    data = json.loads(p.stdout)
    items = collect(data)
    with ThreadPoolExecutor(max_workers=int(os.environ.get("VW","8"))) as tp: res = list(tp.map(run_item, items))
    ok = bad = 0
    for name, good, msg in res:
        if good: ok += 1
        else: bad += 1; print(f"FAIL {name}\n{textwrap.indent(str(msg), '    ')}")
    types = {}
    for l in data['lessons']:
        for e in l.get('ex') or []: types[e.get('t')] = types.get(e.get('t'), 0) + 1
    real = [l for l in data['lessons'] if not l.get('_orphan')]
    print(f"dersler={len(real)} uzantı-yetim={len(data['lessons']) - len(real)} pratik={len(data['bank'])} sınav={len(data['exams'])} arena={len(data.get('arena', []))} mülakat={len(data.get('interview', []))} hatalar={len(data.get('mistakes', []))} ders-alıştırma-türleri={types}")
    print(f"denetlenen: PASS={ok} FAIL={bad}")
    sys.exit(1 if bad else 0)

if __name__ == '__main__': main()
