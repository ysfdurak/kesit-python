import sys, os, importlib, io, contextlib
sys.path.insert(0, '/home/claude/py/tools/pylib'); os.environ['PP_VERI'] = '/home/claude/py/data'
mod = importlib.import_module(sys.argv[1])
ids = sys.argv[2:]
for e in mod.ex:
    if e.get('id') in ids:
        for k in ('start', 'sol'):
            buf = io.StringIO(); ns = {'__name__': '__main__', '__source__': e[k]}
            try:
                with contextlib.redirect_stdout(buf): exec(e[k], ns)
            except Exception as x: buf.write('HATA ' + repr(x))
            print(e['id'], k, '>>', buf.getvalue())
