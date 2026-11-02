"""verify.py ile aynı denetim, ama sıralı ve uzun zaman aşımıyla (yük altındaki makine için)."""
import sys, json, subprocess, importlib.util
spec = importlib.util.spec_from_file_location('v', '/home/claude/py/tools/verify.py'); v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
_orig = subprocess.run
def run(*a, **k):
    if 'timeout' in k: k['timeout'] = 400
    return _orig(*a, **k)
v.subprocess.run = run
f = sys.argv[1]
p = _orig(['node', '-e', v.DUMP, f], capture_output=True, text=True)
items = v.collect(json.loads(p.stdout))
ok = bad = 0
for it in items:
    name, good, msg = v.run_item(it)
    if good: ok += 1
    else: bad += 1; print('FAIL', name, '\n   ', str(msg)[-800:])
print(f'PASS={ok} FAIL={bad}')
