import threading, http.server, socketserver, functools, socket, time
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory='/home/claude/py/dist'); H.log_message = lambda *a: None
k = socket.socket(); k.bind(('127.0.0.1', 0)); PORT = k.getsockname()[1]; k.close()
srv = socketserver.TCPServer(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{PORT}/index.html'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('dialog', lambda d: d.accept())
    # birçok görünüm gez, sonra tıklama başına kaç kez render olduğunu ölç
    for r in ['#/lessons', '#/arena', '#/interview', '#/exams', '#/exam/patika-ml', '#/practice', '#/lesson/listeler/alistirma']:
        pg.goto(base + r); pg.wait_for_timeout(200)
    opt = pg.query_selector('.opt'); t = time.time(); opt.click(); pg.wait_for_timeout(300)
    print('mc tık', round(time.time() - t, 2), 'geri bildirim:', bool(pg.query_selector('.opt.right, .opt.wrong')))
    pg.goto(base + '#/exam/patika-ml'); pg.wait_for_timeout(300); pg.click('[data-act="x-start"]'); pg.wait_for_timeout(200)
    pg.click('.xq .opt'); pg.click('[data-act="x-go"][data-i="1"]'); pg.wait_for_timeout(100)
    print('soru 2 görünüyor:', 'Soru 2/' in pg.inner_text('#main'))
    pg.click('[data-act="x-submit"]'); pg.wait_for_timeout(1500)
    print('sonuç:', pg.inner_text('#main')[:80].replace('\n', ' '))
    print('hatalar:', errs)
