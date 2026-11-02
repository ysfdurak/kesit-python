import html as _H, textwrap as _T
def py(code):
    return '<pre class="py">' + _H.escape(_T.dedent(code).strip('\n'), quote=False) + '</pre>\n'
def pc(code):
    return '<pre class="code">' + _H.escape(_T.dedent(code).strip('\n'), quote=False) + '</pre>\n'
def d(s):
    """kod metni: dedent + sonda tek \n"""
    return _T.dedent(s).strip('\n') + '\n'
