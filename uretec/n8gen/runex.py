import sys, io, contextlib, importlib
sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
mod = importlib.import_module(sys.argv[1])
ns = {"__name__": "__main__"}
for i, c in enumerate(mod.E):
    print(f'===== örnek {i}')
    try:
        exec(compile(c, f'<o{i}>', 'exec'), ns)
    except Exception:
        import traceback; traceback.print_exc()
