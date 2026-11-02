import sys, json, subprocess, time
sys.path.insert(0, '/home/claude/py/tools')
import verify as V
V.py.__defaults__ = ('', None, None, 400)
files = sys.argv[1:]
p = subprocess.run(['node', '-e', V.DUMP] + files, capture_output=True, text=True)
data = json.loads(p.stdout)
items = V.collect(data)
ok = bad = 0
for it in items:
    t0 = time.time()
    name, good, msg = V.run_item(it)
    print(name, 'OK' if good else 'FAIL', round(time.time() - t0, 1), '' if good else msg, flush=True)
    ok += good; bad += (not good)
print('PASS', ok, 'FAIL', bad)
