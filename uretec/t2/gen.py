import re, sys, json, subprocess, html
OUT = '/home/claude/py/v2/t2/'

def esc_inner(m):
    inner = m.group(2).replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    return m.group(1) + inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;') + m.group(3)

def fix_html(h):
    h = re.sub(r'(<pre class="(?:py|code|out)">)(.*?)(</pre>)', esc_inner, h, flags=re.S)
    h = re.sub(r'(<code>)(.*?)(</code>)', esc_inner, h, flags=re.S)
    return h

def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029') + "'"

HTML_KEYS = {'q', 'why', 'a_html', 'hint'}
def val(v, key=None, ind='    '):
    if isinstance(v, str):
        if key in ('q', 'why', 'hint') or key == 'faq_a':
            v = fix_html(v)
        return js_str(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return json.dumps(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v):
            k2 = 'hints' if key in ('hints', 'guide') else None
            return '[' + ', '.join(js_str(fix_html(x)) if key in ('hints','guide','goals') else js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '  ' + val(x, key, ind + '  ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            kk = 'faq_a' if (k == 'a' and isinstance(x, str)) else k
            parts.append(f'{k}: ' + val(x, kk, ind + '  '))
        return '{ ' + ',\n' .join(parts).replace('\n', '\n' + ind + '  ') + ' }'
    raise TypeError(type(v))

def emit(L):
    body = fix_html(L['body'])
    assert '`' not in body and '${' not in body, 'body backtick/${'
    body_js = body.replace('\\', '\\\\')
    out = ['/* PythonPatika v2/t2 — ' + L['title'] + ' */', '(function (W) {', "'use strict';",
           'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push({']
    for k in ['id', 'lv', 'mod', 'min', 'title', 'sum', 'goals']:
        out.append(f'  {k}: ' + val(L[k], k) + ',')
    out.append('  body: `' + body_js + '`,')
    out.append('  ex: [')
    out.append(',\n'.join('    ' + val(e, None, '    ') for e in L['ex']))
    out.append('  ],')
    out.append('  faq: [\n' + ',\n'.join('    ' + val(f, None, '    ') for f in L['faq']) + '\n  ],')
    out.append('  mistakes: [\n' + ',\n'.join('    ' + val(f, None, '    ') for f in L['mistakes']) + '\n  ]')
    out.append('});')
    out.append('})(window);')
    path = OUT + L['id'] + '.js'
    open(path, 'w').write('\n'.join(out) + '\n')
    # checks
    text = re.sub(r'<[^>]+>', ' ', body)
    words = len(text.split())
    stages = {}
    for e in L['ex']:
        assert 'stage' in e, e
        stages[e['stage']] = stages.get(e['stage'], 0) + 1
        if e['stage'] == 'Rehberli':
            assert e.get('guide') and e.get('example') and 'TODO' in e.get('start', ''), e.get('id')
        if e['stage'] == 'Hata avı': assert e.get('kind') == 'bug', e.get('id')
    print(path, 'kelime=', words, 'pre.py=', body.count('<pre class="py">'), 'tablo=', body.count('<table>'),
          'deep=', 'class="deep"' in body, 'gercek=', 'Gerçek işte' in body, 'ex=', len(L['ex']), stages,
          'faq=', len(L['faq']), 'mist=', len(L['mistakes']), 'goals=', len(L['goals']))
    r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print(r.stdout[-6000:], r.stderr[-2000:])

def run_pre(path):
    import tempfile, os
    src = open(path).read()
    for i, m in enumerate(re.finditer(r'<pre class="py">(.*?)</pre>', src, flags=re.S)):
        code = m.group(1).replace('\\\\', '\\').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
        d = tempfile.mkdtemp()
        r = subprocess.run(['python3', '-c', code], capture_output=True, text=True, cwd=d, timeout=30)
        print(f'--- pre #{i} rc={r.returncode}')
        print(r.stdout[:1500]); 
        if r.stderr: print('STDERR:', r.stderr[-800:])
