import sys, re, json, html, subprocess, importlib, os, tempfile
S = os.path.dirname(os.path.abspath(__file__))
OUT = '/home/claude/py/v2/o5'
ORDER = ['id','lv','mod','min','title','sum','goals','body','ex','faq','mistakes',
         't','stage','kind','diff','q','code','o','a','raises','lines','guide','example','start','sol','tests','expect','stdin','hint','hints','why','bad','good']

def jstr(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029') + "'"

def emit(v, ind=1):
    p = '  ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return jstr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(jstr(x) for x in v) + ']'
        return '[\n' + ',\n'.join(p + '  ' + emit(x, ind + 1) for x in v) + '\n' + p + ']'
    if isinstance(v, dict):
        keys = sorted(v, key=lambda k: ORDER.index(k) if k in ORDER else 99)
        parts = []
        for k in keys:
            if k == 'body':
                b = v[k]
                assert '`' not in b and '${' not in b, 'body içinde backtick ya da ${'
                parts.append('body: `' + b.replace('\\', '\\\\') + '`')
            else:
                parts.append(f'{k}: {emit(v[k], ind + 1)}')
        return '{ ' + (',\n' + p + '  ').join(parts) + ' }'
    raise TypeError(type(v))

def py(code):
    return '<pre class="py">' + html.escape(code.strip('\n'), quote=False) + '</pre>'
def pc(code):
    return '<pre class="code">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def build(modname):
    m = importlib.import_module(modname)
    L = m.LESSON
    for i, e in enumerate(L['ex']):
        if e['t'] == 'code' and 'id' not in e: e['id'] = f"{L['id']}-{i+1}"
    js = f"/* Kesit Python — {L['title']} (v2/o5) */\n(function (W) {{\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n{emit(L, 0)}\n);\n}})(window);\n"
    f = f"{OUT}/{L['id']}.js"
    open(f, 'w').write(js)
    return f, L

def check_body(f):
    dump = "const fs=require('fs');const window={};new Function('window',fs.readFileSync(process.argv[1],'utf8'))(window);process.stdout.write(JSON.stringify(window.PY_LESSONS))"
    L = json.loads(subprocess.run(['node', '-e', dump, f], capture_output=True, text=True, check=True).stdout)[0]
    b = L['body']
    txt = re.sub(r'<pre class="(py|code)">.*?</pre>', ' ', b, flags=re.S)
    words = len(re.sub(r'<[^>]+>', ' ', b).split()); prose = len(re.sub(r'<[^>]+>', ' ', txt).split())
    blocks = re.findall(r'<pre class="py">(.*?)</pre>', b, re.S)
    print(f"{L['id']}: kelime={words} (kodsuz {prose}) pre.py={len(blocks)} ex={len(L['ex'])} faq={len(L['faq'])} mistakes={len(L['mistakes'])} goals={len(L['goals'])}")
    from collections import Counter
    print('  aşamalar:', dict(Counter(e.get('stage') for e in L['ex'])), dict(Counter(e['t'] for e in L['ex'])))
    for need in ['tbl-wrap', 'class="tip"', 'class="warn"', 'class="note"', 'Uzmanlaş', 'Gerçek işte']:
        if need not in b: print('  EKSİK:', need)
    for e in L['ex']:
        if not e.get('stage'): print('  stage yok', e.get('id'))
        if e.get('stage') == 'Rehberli' and not (e.get('guide') and e.get('example') and 'TODO' in e.get('start', '')): print('  rehberli eksik', e.get('id'))
    for i, c in enumerate(blocks):
        code = html.unescape(c)
        d = tempfile.mkdtemp(dir=S + '/run')
        r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, cwd=d, timeout=60)
        if r.returncode or not r.stdout.strip():
            print(f'  BODY ÖRNEK {i+1} HATA:\n', code[:300], '\n', r.stderr[-800:], 'çıktı:', r.stdout[:200])
        elif '-v' in sys.argv: print(f'--- blok {i+1}\n' + r.stdout)
    return L

if __name__ == '__main__':
    sys.path.insert(0, S)
    for mod in [a for a in sys.argv[1:] if not a.startswith('-')]:
        f, _ = build(mod)
        check_body(f)
        r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', '-q', f], capture_output=True, text=True, cwd=S + '/run')
        print(r.stdout[-6000:], r.stderr[-2000:])
