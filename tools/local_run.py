#!/usr/bin/env python3
"""'Kendi bilgisayarında' (t: 'local') görevlerini gerçek bir bilgisayarda çalıştırır ve beklenen çıktıyla karşılaştırır.
Görevin dosyasını (ve adımlardaki <pre> dosyalarını) geçici klasöre yazar, gerekli paketleri kurar, sunucu gerekiyorsa
arka planda başlatır, komut satırını çalıştırır. Linux/macOS'ta bash, Windows'ta cmd.exe kullanılır (görevler bu iki kabukla yazılmıştır).
Kullanım: python local_run.py gorevler.json cikti.json [--kur]   (gorevler.json: verify.py dökümünden t:'local' öğeleri)
Ortam: VERI=<data klasörü> (CSV'ler), MYSQL_URL=<sqlalchemy adresi> (sql-analitik görevi için; yoksa atlanır)"""
import json, os, re, sys, html, shutil, socket, subprocess, tempfile, time

WIN = os.name == 'nt'
PY = sys.executable
BIN = os.path.dirname(PY) if not WIN else os.path.join(os.path.dirname(PY), 'Scripts')
ENV = dict(os.environ, PYTHONIOENCODING='utf-8', PATH=os.pathsep.join([os.path.dirname(PY), BIN, os.environ.get('PATH', '')]))
VERI = os.environ.get('VERI') or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

PAKET = {
    'fastapi': ['fastapi', 'uvicorn'], 'flask': ['flask'], 'django-giris': ['django'], 'django-ileri': ['django'],
    'ofis-otomasyon': ['aiosmtpd'], 'proje-oto-stok': ['aiosmtpd'], 'mcp-protokolu': ['mcp==2.3.0', 'httpx'],
    'otomasyon-isletim': ['pytest', 'setuptools'], 'proje-iade-ajani': ['pydantic'], 'proje-mutabakat': ['pandas', 'openpyxl'],
    'proje-oto-fatura': ['pypdf', 'openpyxl', 'reportlab'], 'proje-oto-mutabakat': ['openpyxl'], 'proje-oto-onay': ['python-docx'],
    'sql-analitik': ['sqlalchemy', 'pandas', 'pymysql'], 'derin-ogrenme-giris': ['torch'],
}
ATLA = {  # dış servis, hesap ya da grafik arayüz gerektirenler
    'orkestrasyon#19': 'Airflow kurulumu', 'orkestrasyon#20': 'cron / Görev Zamanlayıcı', 'docker-deploy#20': 'Docker',
    'bulut-temelleri#20': 'Azurite (npx)', 'bulut-temelleri#21': 'Google Cloud hesabı', 'veri-modelleme#20': 'MongoDB',
    'redis-kuyruk#20': 'Redis', 'spark-dagitik#20': 'Java + Spark', 'gui-tkinter#18': 'grafik pencere',
    'web-scraping#18': 'Chrome sürücüsü', 'ajan-uretimde#15': 'Anthropic API anahtarı', 'jupyter-colab#8': 'Jupyter arayüzü',
    'vscode#7': 'VS Code', 'kurulum-macos-linux#7': 'macOS/Linux', 'kurulum-windows#8': 'elle (PowerShell)',
}

def sh(cmd, cwd, timeout=300, env=None):
    t0 = time.time()
    try:
        p = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, timeout=timeout, env=env or ENV)
        out = (p.stdout + b'\n' + p.stderr).decode('utf-8', 'replace') if True else ''
        return p.returncode, p.stdout.decode('utf-8', 'replace'), p.stderr.decode('utf-8', 'replace'), round(time.time() - t0, 1)
    except subprocess.TimeoutExpired:
        return -9, '', 'zaman aşımı', timeout

def bekle_port(port, sn=40):
    for _ in range(sn * 4):
        try:
            with socket.create_connection(('127.0.0.1', port), 0.25): return True
        except OSError: time.sleep(0.25)
    return False

def arka(cmd, cwd, env=None):
    kw = dict(creationflags=subprocess.CREATE_NEW_PROCESS_GROUP) if WIN else dict(start_new_session=True)
    return subprocess.Popen(cmd, shell=True, cwd=cwd, env=env or ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, **kw)

def durdur(p):
    if not p: return ''
    try:
        if WIN: subprocess.run(f'taskkill /F /T /PID {p.pid}', shell=True, capture_output=True)
        else:
            import signal; os.killpg(p.pid, signal.SIGTERM)
    except Exception: pass
    try: return p.communicate(timeout=10)[0].decode('utf-8', 'replace')[-1500:]
    except Exception: return ''

def py_cmd(c):
    """Görevdeki 'python ...' komutlarını bu ortamın yorumlayıcısına yönlendirir (kabuk sözdizimi korunur)."""
    q = f'"{PY}"'
    return re.sub(r'(^|&&\s*|\|\|\s*|;\s*)python(\s)', lambda m: m.group(1) + q + m.group(2), c.strip(), flags=re.M)

def adim_dosyalari(t):
    """Adımlardaki '<code>ad</code> ... <pre>' kalıbından dosya çıkarır."""
    d = {}
    for s in t.get('steps') or []:
        for m in re.finditer(r'<code>([\w./-]+\.(?:py|toml|txt|cfg))</code>[^<]*?(?:olarak kaydet)?[^<]*?:?\s*<pre[^>]*>(.*?)</pre>', s, re.S):
            d[m.group(1)] = html.unescape(m.group(2))
    return d

def karsilastir(beklenen, cikti):
    if not beklenen: return None
    satir = [l.strip() for l in beklenen.strip().split('\n') if l.strip()]
    o = re.sub(r'[ \t]+', ' ', cikti.replace('\r\n', '\n'))
    eksik = []
    for l in satir:
        if re.search(r'\.\.\.|XX|a1b2c3d|kimlik sende|/home/sen|C:\\\.\.\.', l): continue  # yer tutucu satır
        if re.sub(r'\s+', ' ', l) not in o: eksik.append(l)
    return eksik

def gorev(t, kok):
    key = f"{t['id']}#{t['i']}"
    if key in ATLA: return {'durum': 'atlandi', 'neden': ATLA[key]}
    td = tempfile.mkdtemp(prefix='kl_', dir=kok); log = []
    srv = None; srv_out = ''
    try:
        for pk in PAKET.get(t['id'], []):
            if pk == 'torch' and not os.environ.get('TORCH'): return {'durum': 'atlandi', 'neden': 'torch (TORCH=1 ile)'}
        pk = PAKET.get(t['id'])
        if pk and '--kur' in sys.argv:
            r = sh(f'"{PY}" -m pip install -q ' + ' '.join(f'"{x}"' for x in pk), td, 900); log.append(['pip', r[0], r[2][-400:]])
        files = adim_dosyalari(t)
        if t.get('file') and t.get('fname'): files[t['fname']] = t['file']
        cmd = t.get('cmd') or ''
        env = dict(ENV)
        if t['id'] == 'terminal-temelleri': pass
        if t['id'] == 'proje-etl': shutil.copy(os.path.join(VERI, 'anadolu_market', 'web_events.csv'), td)
        if t['id'] == 'proje-mutabakat': shutil.copy(os.path.join(VERI, 'lezzet_kurye', 'lk_orders.csv'), td)
        if t['id'] in ('django-giris', 'django-ileri'):
            r = sh(f'"{PY}" -m django startproject site_proje .', td); log.append(['startproject', r[0], r[2][-300:]])
            dj = adim_dosyalari({'steps': []})
            if t['id'] == 'django-ileri':
                urls = "from django.contrib import admin\nfrom django.http import HttpResponse\nfrom django.urls import path\n\ndef merhaba(request):\n    return HttpResponse(\"Merhaba Django\")\n\nurlpatterns = [\n    path(\"admin/\", admin.site.urls),\n    path(\"\", merhaba),\n]\n"
                open(os.path.join(td, 'site_proje', 'urls.py'), 'w', encoding='utf-8').write(urls)
                r = sh(f'"{PY}" manage.py startapp katalog', td); log.append(['startapp', r[0], r[2][-300:]])
                st = os.path.join(td, 'site_proje', 'settings.py'); s = open(st, encoding='utf-8').read()
                open(st, 'w', encoding='utf-8').write(s.replace('INSTALLED_APPS = [', 'INSTALLED_APPS = [\n    "katalog",', 1))
        for ad, icerik in files.items():
            p = os.path.join(td, ad); os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'w', encoding='utf-8', newline='') as f: f.write(icerik)
        # sunucular
        if t['id'] == 'flask': srv = arka(f'"{PY}" -m flask --app app run', td); bekle_port(5000)
        if t['id'] == 'fastapi': srv = arka(f'"{PY}" -m uvicorn main:app', td); bekle_port(8000)
        if t['id'] == 'django-giris':
            r = sh(f'"{PY}" manage.py migrate', td); log.append(['migrate', r[0], r[2][-300:]])
            srv = arka(f'"{PY}" manage.py runserver --noreload', td); bekle_port(8000)
        if t['id'] in ('ofis-otomasyon', 'proje-oto-stok'): srv = arka(f'"{PY}" -m aiosmtpd -n -l 127.0.0.1:8025', td); bekle_port(8025)
        if t['id'] == 'proje-oto-api': env['KESIT_API_ANAHTARI'] = 'dogru-anahtar'; srv = arka(f'"{PY}" api_rapor.py sunucu', td, env); time.sleep(3)
        if t['id'] == 'mcp-protokolu' and t['i'] == 12:
            srv = arka(f'"{PY}" http_sunucu.py', td); bekle_port(8765)
            cmd = 'curl -i -X POST http://127.0.0.1:8765/mcp -H "Origin: http://kotu.test" -H "content-type: application/json" -d "{}"'
        if t['id'] == 'otomasyon-isletim':
            r = sh(f'"{PY}" -m pip install -q -e .', td, 600); log.append(['pip -e', r[0], r[2][-300:]])
        if t['id'] == 'sql-analitik':
            if not os.environ.get('MYSQL_URL'): return {'durum': 'atlandi', 'neden': 'MYSQL_URL yok'}
            env['VERITABANI_URL'] = os.environ['MYSQL_URL']
        if not cmd.strip(): return {'durum': 'atlandi', 'neden': 'komut yok'}
        cmd = ' && '.join(l for l in cmd.splitlines() if l.strip())   # çok satırlı komut: cmd.exe yalnız ilk satırı çalıştırır
        if t['id'] == 'proje-etl': cmd = cmd + ' && ' + cmd   # görev: komutu iki kez çalıştır
        if t['id'] == 'git-proje-yapisi':   # görev bu iki dosyayı editörle oluşturmayı söylüyor
            open(os.path.join(td, 'app.py'), 'w', encoding='utf-8', newline='\n').write("print('merhaba')\n")
            open(os.path.join(td, '.gitignore'), 'w', encoding='utf-8', newline='\n').write('.venv/\n')
        cmd = py_cmd(cmd)
        if WIN: cmd = cmd.replace('curl ', 'curl.exe ')
        rc, out, err, sure = sh(cmd, td, 900, env)
        srv_out = durdur(srv); srv = None
        eksik = karsilastir(t.get('expect'), out + '\n' + err)
        ek = {}
        if t['id'] == 'git-proje-yapisi':
            for ad in ('app.py', '.gitignore'):
                p = os.path.join(td, ad)
                if os.path.exists(p): ek[ad] = open(p, 'rb').read()[:80].hex() + ' | ' + open(p, 'rb').read()[:80].decode('utf-8', 'replace')
        rc_ok = rc == 0 or (t['id'] == 'proje-oto-mutabakat' and rc == 1)   # fark bulunca 1 ile çıkar (görevde yazıyor)
        return {'durum': 'tamam' if rc_ok and not eksik else 'fark', 'rc': rc, 'sure': sure, 'eksik': eksik,
                'cikti': out[-2500:], 'hata': err[-2500:], 'sunucu': srv_out[-1200:], 'log': log, 'ek': ek, 'komut': cmd}
    except Exception as e:
        return {'durum': 'hata', 'neden': repr(e)[:500], 'log': log}
    finally:
        durdur(srv)

def main():
    T = json.load(open(sys.argv[1], encoding='utf-8')); out = {}
    kok = tempfile.mkdtemp(prefix='local_')
    secim = os.environ.get('ONLY')
    for t in T:
        k = f"{t['id']}#{t['i']}"
        if secim and not re.search(secim, k): continue
        r = gorev(t, kok); out[k] = r
        print(k, r['durum'], r.get('neden') or (('eksik: ' + ' / '.join(r['eksik'])[:200]) if r.get('eksik') else ''), flush=True)
    json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if __name__ == '__main__': main()
