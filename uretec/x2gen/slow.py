"""Ağır yük altında: verify fonksiyonlarını sırayla ve uzun zaman aşımıyla çalıştır. python3 slow.py dosya.js [id ...]"""
import sys, json, subprocess, importlib.util
spec = importlib.util.spec_from_file_location('v', '/home/claude/py/tools/verify.py'); v = importlib.util.module_from_spec(spec)
sys.argv_saved = sys.argv; spec.loader.exec_module(v)
_py = v.py
v.py = lambda code, tests='', stdin=None, raw=None, timeout=60: _py(code, tests, stdin, raw, timeout=600)
data = json.loads(subprocess.run(['node', '-e', v.DUMP, sys.argv[1]], capture_output=True, text=True).stdout)
want = set(sys.argv[2:])
for l in data['lessons']:
    for e in l['ex']:
        if want and e.get('id') not in want: continue
        f = {'code': v.check_code, 'predict': v.check_predict, 'order': v.check_order}.get(e['t'])
        if not f: continue
        ok, msg = f(e)
        print('PASS' if ok else 'FAIL', e.get('id') or e['t'], '' if ok else msg[-1500:], flush=True)
