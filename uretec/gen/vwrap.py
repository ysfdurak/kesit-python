import sys, os
os.environ.setdefault("OMP_NUM_THREADS", "1"); os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
sys.path.insert(0, "/home/claude/py/tools")
import verify, concurrent.futures as cf
d = list(verify.py.__defaults__); d[-1] = 900; verify.py.__defaults__ = tuple(d)
verify.ThreadPoolExecutor = lambda max_workers=8: cf.ThreadPoolExecutor(max_workers=3)
sys.argv = ["verify.py"] + sys.argv[1:]
verify.main()
