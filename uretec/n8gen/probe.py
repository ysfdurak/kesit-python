import sys, importlib
sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
mod = importlib.import_module(sys.argv[1])
ns = {"__name__": "__main__"}
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    for c in mod.E: exec(c, ns)
exec(open(sys.argv[2]).read(), ns)
