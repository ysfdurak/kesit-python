"""n1: ders kaynaklarını (Python sözlüğü LESSON) Kesit Python JS dosyasına çevirir.
Kullanım: python3 n1gen.py kaynak.py"""
import html, re, runpy, sys

ORDER = ['t', 'stage', 'id', 'diff', 'kind', 'needs', 'q', 'code', 'o', 'a', 'raises', 'lines', 'guide', 'example',
         'start', 'sol', 'tests', 'expect', 'hints', 'hint', 'why']
OUT = '/home/claude/py/v2/n1/'


def jstr(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n') + "'"


def js(v, ind='      '):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return jstr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 160:
            return '[' + ', '.join(jstr(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '  ' + js(x, ind + '  ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        keys = [k for k in ORDER if k in v] + [k for k in v if k not in ORDER]
        return '{\n' + ',\n'.join(f'{ind}  {k}: {js(v[k], ind + "  ")}' for k in keys) + '\n' + ind + '}'
    raise TypeError(type(v))


def esc_pre(h):
    def f(m):
        return m.group(1) + html.escape(m.group(2).strip('\n'), quote=False) + '</pre>'
    return re.sub(r'(<pre class="(?:py|code|out)">)(.*?)</pre>', f, h, flags=re.S)


def main():
    L = runpy.run_path(sys.argv[1])['LESSON']
    body = esc_pre(L['body'].strip())
    assert '`' not in body and '${' not in body, 'body içinde backtick/${ var'
    body = body.replace('\\', '\\\\')
    out = [f"/* Kesit Python — v2/n1: {L['title']} */", '(function (W) {', "'use strict';",
           'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push(', '  {']
    for k in ['id', 'lv', 'mod', 'min', 'needs', 'title', 'sum', 'goals']:
        out.append(f'    {k}: {js(L[k], "    ")},')
    out.append('    body: `' + body + '`,')
    out.append('    ex: [\n' + ',\n'.join('      ' + js(e, '      ') for e in L['ex']) + '\n    ],')
    out.append('    faq: [\n' + ',\n'.join('      ' + js(f, '      ') for f in L['faq']) + '\n    ],')
    out.append('    mistakes: [\n' + ',\n'.join('      ' + js(f, '      ') for f in L['mistakes']) + '\n    ]')
    out += ['  }', ');', '})(window);', '']
    path = OUT + L['id'] + '.js'
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    from collections import Counter
    st = Counter(e.get('stage') for e in L['ex'])
    print(path, '| ex:', len(L['ex']), dict(st), '| body kelime:', words, '| pre.py:', body.count('<pre class="py">'))


if __name__ == '__main__':
    main()
