import threading, http.server, socketserver, functools, socket, sys
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory='/home/claude/py/dist'); H.log_message = lambda *a: None
k = socket.socket(); k.bind(('127.0.0.1', 0)); PORT = k.getsockname()[1]; k.close()
srv = socketserver.TCPServer(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{PORT}/index.html'
out = '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/shots/'
import os; os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, vp in [('m', {'width': 390, 'height': 844}), ('d', {'width': 1280, 'height': 860})]:
        pg = b.new_page(viewport=vp); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        for r in sys.argv[1:]:
            pg.goto(base + '#/' + r); pg.wait_for_timeout(400)
            pg.screenshot(path=out + name + '_' + r.replace('/', '_') + '.png')
        print(name, 'hatalar', errs)
