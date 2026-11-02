import sys, re, html, json, subprocess, importlib.util, os
ORDER = ['id','t','stage','kind','diff','lv','mod','min','title','sum','goals','q','code','lines','o','a','raises','guide','example','start','sol','tests','expect','hint','hints','why','body','ex','faq','mistakes','bad','good']
def jstr(s):
    s = s.replace('\r','').replace('\\','\\\\').replace("'","\\'").replace('\n','\\n')
    return "'" + s + "'"
def keyorder(d):
    return sorted(d, key=lambda k: ORDER.index(k) if k in ORDER else 99)
def emit(v, ind=2):
    p = ' '*ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int,float)): return repr(v)
    if isinstance(v, str): return jstr(v)
    if isinstance(v, list):
        if all(isinstance(x,str) for x in v) and sum(len(x) for x in v) < 400:
            return '[' + ', '.join(jstr(x) for x in v) + ']'
        return '[\n' + ',\n'.join(p+'  '+emit(x, ind+2) for x in v) + '\n'+p+']'
    if isinstance(v, dict):
        parts = []
        for k in keyorder(v):
            parts.append(f"{k}: " + emit(v[k], ind+2))
        return '{ ' + (',\n'+p+'  ').join(parts) + ' }'
    raise TypeError(v)
PRE = re.compile(r'(<pre class="(py|code|out)">)(.*?)(</pre>)', re.S)
def fixbody(b):
    return PRE.sub(lambda m: m.group(1)+html.escape(html.unescape(m.group(3).strip('\n')), quote=False)+m.group(4), b)
def main(path, out):
    spec = importlib.util.spec_from_file_location('les', path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    L = m.LESSON
    raw = L['body']
    # run py examples
    for i, mm in enumerate(PRE.finditer(raw)):
        if mm.group(2) != 'py': continue
        code = html.unescape(mm.group(3))
        r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=60, cwd='/tmp')
        if r.returncode: print(f'BODY PY #{i} HATA:\n{code[:300]}\n{r.stderr[-800:]}')
        elif not r.stdout.strip(): print(f'BODY PY #{i} çıktı yok')
    body = fixbody(raw)
    assert '`' not in body and '${' not in body, 'body backtick/${'
    body = body.replace('\\','\\\\')
    text = re.sub(r'<[^>]+>', ' ', body)
    print('kelime:', len(text.split()), 'pre.py:', len(re.findall(r'<pre class="py">', body)), 'ex:', len(L['ex']))
    from collections import Counter
    print('aşama:', dict(Counter(e.get('stage') for e in L['ex'])), 'tür:', dict(Counter(e['t'] for e in L['ex'])))
    lines = ["/* PythonPatika v2 — " + L['id'] + " */", "(function (W) {", "'use strict';", "const L = W.PY_LESSONS = W.PY_LESSONS || [];", "L.push(", "{ "]
    parts = []
    for k in keyorder(L):
        if k == 'body': parts.append('body: `\n' + body.strip('\n') + '\n`')
        else: parts.append(f'{k}: ' + emit(L[k], 2))
    lines[-1] = '{ ' + ',\n  '.join(parts) + ' }'
    lines += [");", "})(window);", ""]
    open(out,'w').write('\n'.join(lines))

TAG = re.compile(r'<(?!/?(p|b|i|code|ul|ol|li|pre|br|div|table|tr|td|th|span|section|h2|h3|small)\b)')
def lint(L):
    def chk(where, s):
        if isinstance(s, str) and TAG.search(s): print('HTML LINT', where, s[max(0,TAG.search(s).start()-30):TAG.search(s).start()+30])
    for e in L['ex']:
        chk(e.get('id','?')+' q', e.get('q')); chk(e.get('id','?')+' why', e.get('why'))
        for g in e.get('guide', []): chk(e.get('id')+' guide', g)
        if e['t'] == 'mc':
            for o in e['o']: chk('mc o', o)
    for f in L['faq']: chk('faq', f['a']); chk('faq q', f['q'])
_main = main
def main(path, out):
    spec = importlib.util.spec_from_file_location('les2', path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    lint(m.LESSON); _main(path, out)
if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
