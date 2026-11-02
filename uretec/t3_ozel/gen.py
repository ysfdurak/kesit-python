import re, sys, html, importlib.util
from collections import Counter
ORDER = ['id','lv','mod','min','title','sum','goals','body','ex','faq','mistakes',
         't','stage','kind','diff','q','code','lines','o','a','raises','guide','example','start','sol','tests','expect','hint','hints','why','bad','good']
def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"
def esc_pre(body):
    return re.sub(r'(<pre class="py">)(.*?)(</pre>)', lambda m: m.group(1) + html.escape(html.unescape(m.group(2)), quote=False) + m.group(3), body, flags=re.S)
def val(v, ind):
    p = '  ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return js(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v):
            return '[' + ', '.join(js(x) for x in v) + ']'
        return '[\n' + ',\n'.join(p + '  ' + val(x, ind + 1) for x in v) + '\n' + p + ']'
    if isinstance(v, dict):
        keys = sorted(v, key=lambda k: ORDER.index(k) if k in ORDER else 99)
        parts = []
        for k in keys:
            if k == 'body':
                b = esc_pre(v[k])
                assert '`' not in b and '${' not in b, 'body backtick/${'
                parts.append('body: `' + b.replace('\\', '\\\\') + '`')
            else:
                parts.append(k + ': ' + val(v[k], ind + 1))
        return '{ ' + (',\n' + p + '  ').join(parts) + ' }'
    raise TypeError(type(v))
src, out = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location('ders_mod', src); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
L = m.LESSON
words = len(re.sub(r'<[^>]+>', ' ', L['body']).split())
print('body kelime:', words, 'ex:', len(L['ex']), 'pre.py:', L['body'].count('<pre class="py">'))
print(Counter(e['stage'] for e in L['ex']))
with open(out, 'w') as f:
    f.write('/* Kesit Python v2 — ' + L['id'] + ' */\n(function (W) {\n\'use strict\';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n' + val(L, 0) + '\n);\n})(window);\n')
