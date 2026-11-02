#!/usr/bin/env python3
"""Tüm görünümleri ve dersleri headless Chromium'da açar; JS hatalarını ve boş sayfaları raporlar."""
import threading, http.server, socketserver, functools, json, sys
from playwright.sync_api import sync_playwright
import os as _os
ROOT = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
H = functools.partial(Q, directory=ROOT)
import socket as _s
_k = _s.socket(); _k.bind(('127.0.0.1', 0)); PORT = _k.getsockname()[1]; _k.close()
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{PORT}/index.html'
bad = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.goto(base); pg.wait_for_timeout(600)
    ids = pg.evaluate('window.PY_ORDER')
    lessons = pg.evaluate('(window.PY_LESSONS||[]).map(l=>l.id)')
    missing = [i for i in ids if i not in lessons]; extra = [i for i in lessons if i not in ids]
    print('dersler:', len(lessons), 'eksik:', missing, 'sırada olmayan:', extra)
    dup = [i for i in set(lessons) if lessons.count(i) > 1]
    if dup: print('TEKRAR EDEN ID:', dup)
    for lid in lessons:
        for sub in ['', '/alistirma', '/sss']:
            pg.goto(base + '#/lesson/' + lid + sub); pg.wait_for_timeout(60)
            n = len(errs); txt = pg.inner_text('#main')
            if len(txt) < 200 and sub == '': bad.append((lid, 'kısa içerik'))
            if errs: bad.append((lid + sub, errs[0])); errs.clear()
    for r in ['#/lessons', '#/lessons/temel', '#/paths', '#/practice', '#/exams', '#/review', '#/play', '#/ref', '#/ref/kopya', '#/ref/sozluk', '#/profile', '#/menu', '#/projects', '#/projects/analist', '#/ai', '#/arena', '#/arena-c', '#/interview', '#/interview/kart', '#/interview-sim', '#/mistakes', '#/data', '#/dataset/ilgaz_bank', '#/hakkinda'] + ['#/path/' + x for x in pg.evaluate('window.PY_PATHS.map(p=>p.id)')]:
        pg.goto(base + r); pg.wait_for_timeout(150)
        if errs: bad.append((r, errs[0])); errs.clear()
    bank = pg.evaluate('(window.PY_BANK||[]).map(t=>t.id)')
    for t in bank[::7]:
        pg.goto(base + '#/task/' + t); pg.wait_for_timeout(100)
        if errs: bad.append((t, errs[0])); errs.clear()
    for x in pg.evaluate('(window.PY_EXAMS||[]).map(e=>e.id)'):
        pg.goto(base + "#/exam/" + x); pg.wait_for_timeout(300)
        if not pg.query_selector("[data-act=\"x-start\"]"): bad.append((x, "başlat düğmesi yok: " + pg.inner_text("#main")[:200])); continue
        print("sınav", x, flush=True); pg.click("[data-act=\"x-start\"]", timeout=8000); pg.wait_for_timeout(200)
        if errs: bad.append((x, errs[0])); errs.clear()
    # patika ders id'leri
    for pid, miss in pg.evaluate('window.PY_PATHS.map(p=>[p.id, p.lessons.filter(id=>!window.PY_LESSONS.some(l=>l.id===id))])'):
        if miss: bad.append(('path ' + pid, 'olmayan ders: ' + ','.join(miss)))
    for a in pg.evaluate('(window.PY_ARENA||[]).map(a=>a.id)')[::9]:
        pg.goto(base + '#/arena-p/' + a); pg.wait_for_timeout(60)
        if errs: bad.append((a, errs[0])); errs.clear()
    # motor sayfa açılışında yüklenmemeli
    if pg.evaluate('window.PY_ENGINE.state()') != 'bos': bad.append(('motor', 'kod çalıştırılmadan yüklendi'))
    print('pratik:', len(bank), 'sınav:', len(pg.evaluate('(window.PY_EXAMS||[]).map(e=>e.qs.length)')))
    b.close()
srv.shutdown()
for x in bad: print('SORUN', x)
print('UI testi:', 'TEMİZ' if not bad else f'{len(bad)} sorun')
