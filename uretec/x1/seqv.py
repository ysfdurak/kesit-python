# Yük altında: verify.py mantığını 2 işçi ve 240 sn zaman aşımıyla çalıştırır
import sys, json, subprocess
sys.path.insert(0, '/home/claude/py/tools')
import verify as V
_py = V.py
V.py = lambda code, tests='', stdin=None, raw=None, timeout=240: _py(code, tests, stdin, raw, timeout)
from concurrent.futures import ThreadPoolExecutor
files = sys.argv[1:]
data = json.loads(subprocess.run(['node', '-e', V.DUMP] + files, capture_output=True, text=True).stdout)
items = V.collect(data)
with ThreadPoolExecutor(2) as tp: res = list(tp.map(V.run_item, items))
bad = [(n, m) for n, g, m in res if not g]
for n, m in bad: print('FAIL', n, '\n   ', str(m)[-700:])
print(sys.executable.split('/')[-3], 'PASS=%d FAIL=%d' % (len(res) - len(bad), len(bad)))
