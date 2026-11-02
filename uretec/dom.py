import threading, http.server, socketserver, functools, socket
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory='/home/claude/py/dist'); H.log_message = lambda *a: None
k = socket.socket(); k.bind(('127.0.0.1', 0)); PORT = k.getsockname()[1]; k.close()
srv = socketserver.TCPServer(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.on('pageerror', lambda e: print('PAGEERR', e)); pg.on('console', lambda m: print('CONSOLE', m.type, m.text[:200]))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html#/home'); pg.wait_for_timeout(500)
    print(pg.evaluate("[...document.querySelectorAll('#main .wrap > *')].slice(0,4).map(e=>e.tagName+'.'+e.className+' '+getComputedStyle(e).display)"))
    print(pg.evaluate("window.PY_CORE.VIEWS.home.html.toString().slice(0,120)")); print(pg.evaluate("!!document.querySelector('.quick')")) #.stringify(document.querySelector('.quick').getBoundingClientRect())+document.querySelector('.quick').outerHTML.slice(0,300)"))
