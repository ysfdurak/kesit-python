import sys, json, subprocess, importlib.util, os
def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '\\r').replace('\n', '\\n').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    assert '\ufffd' not in s
    return "'" + s + "'"
def jl(lst): return '[' + ', '.join(js(x) for x in lst) + ']'
def run(code):
    p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=60, cwd='/tmp')
    return p.stdout, p.stderr
def norm(s): return '\n'.join(l.rstrip() for l in s.replace('\r\n','\n').split('\n')).strip()
src, dst = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location('b', src); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
parts = []; bad = 0
for q in m.QS:
    if q.get('code'):
        out, err = run(q['code'])
        if err: print('STDERR', q['id'], err[-600:])
        if q.get('out') is None or norm(q['out']) != norm(out):
            bad += 1; print('=== OUT', q['id'], 'beklenen:\n' + str(q.get('out')) + '\n--- gelen:\n' + out)
    elif q['kind'] == 'kod-okuma': print('KOD YOK', q['id'])
    f = ["{ id: %s," % js(q['id']), "  roles: %s," % jl(q['roles']), "  lv: %s," % js(q['lv']), "  topic: %s," % js(q['topic']), "  kind: %s," % js(q['kind']), "  q: %s," % js(q['q']), "  a: %s," % js(q['a'])]
    if q.get('code'): f += ["  code: %s," % js(q['code']), "  out: %s," % js(norm(q['out'] or ''))]
    f += ["  follow: %s," % jl(q['follow']), "  flags: %s," % jl(q['flags']), "  tip: %s }" % js(q['tip'])]
    parts.append('\n'.join(f))
open(dst, 'w').write("(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(\n" + ',\n'.join(parts) + "\n); })(window);\n")
print('yazıldı', dst, len(m.QS), 'soru; çıktı uyuşmazlığı:', bad)
