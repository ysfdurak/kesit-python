import threading, http.server, socketserver, functools, socket, time
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory='/home/claude/py/dist')
H.log_message = lambda *a: None
k = socket.socket(); k.bind(('127.0.0.1', 0)); PORT = k.getsockname()[1]; k.close()
srv = socketserver.TCPServer(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{PORT}/index.html'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.on('console', lambda m: print('console', m.text[:200]))
    pg.goto(base + '#/exam/patika-web'); pg.wait_for_timeout(800)
    for i in range(3):
        t = time.time()
        r = pg.evaluate("""(i)=>{const x=window.PY_EXAMS.find(x=>x.id=='patika-web');const q=x.qs[i];const t=performance.now();const h=window.PY_CORE.codebox(q.code||'',{run:false});return [performance.now()-t, h.length]}""", i)
        print(i, r)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
    for ex in ['patika-backend', 'patika-ml', 'patika-web']:
        pg.goto(base + '#/exam/' + ex); pg.wait_for_timeout(500)
        t = time.time()
        try:
            pg.click('[data-act="x-start"]', timeout=8000); print(ex, 'ok', round(time.time()-t, 2))
        except Exception as e: print(ex, 'FAIL', str(e)[:100])
