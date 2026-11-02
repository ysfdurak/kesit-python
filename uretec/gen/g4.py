import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from jsgen import D, write

LID = 'proje-ileri'

HTML = r'''
<h2>Derinleş: projeyi "çalışıyor"dan "teslim edilebilir"e taşımak</h2>
<p>Analitik fonksiyonların hazır: RFM, kohort, en çok satan, sayfalı API, CLI ve testler. İşe alım yapan biri ya da ekip liderin bu projeye baktığında ise başka sorular soracak: "Ayarları nereden okuyor? Bozuk bir kayıt gelirse ne oluyor? API bir kez hata verirse tüm gece işi mi çöküyor? Aynı komutu iki kez çalıştırırsam rapor iki kat mı oluyor? Ne olduğunu loglardan anlayabilir miyim?" Bu bölüm bu beş soruyu cevaplayan katmanları ekliyor. Paketleme ayrıntıları "Paketleme ve dağıtım", CI kurulumu "Kalite ve CI" derslerinde; burada projeye nasıl bağlandıklarını görüyorsun.</p>

<h3>1. Proje iskeleti</h3>
<pre class="code">anadolu-analitik/
├── pyproject.toml          # bağımlılıklar, [project.scripts] analitik = "analitik.cli:main"
├── README.md               # ne yapar, nasıl kurulur, örnek komut, örnek çıktı
├── analitik.toml           # varsayılan ayarlar (gizli bilgi YOK)
├── .env.example            # gereken ortam değişkenlerinin listesi
├── src/analitik/
│   ├── __init__.py  __main__.py  cli.py
│   ├── ayar.py             # Ayar dataclass + yükleyici
│   ├── veri.py  dogrula.py # okuma ve doğrulama
│   ├── rfm.py  kohort.py  urun.py
│   ├── api.py              # yeniden deneme + sayfalama
│   └── rapor.py            # Markdown/CSV çıktı
├── tests/                  # pytest; her modüle bir test dosyası
└── .github/workflows/ci.yml</pre>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Katman</th><th>Araç</th></tr>
<tr><td>Ayarlar nereden geliyor?</td><td>Yapılandırma</td><td><code>tomllib</code> + ortam değişkenleri + <code>dataclass</code></td></tr>
<tr><td>Bozuk kayıt gelirse?</td><td>Doğrulama</td><td>Kayıt bazlı kontrol, hatalı satırları ayrı raporla (pydantic de olur)</td></tr>
<tr><td>API geçici hata verirse?</td><td>Dayanıklılık</td><td>Üstel geri çekilmeli yeniden deneme (exponential backoff)</td></tr>
<tr><td>İki kez çalışırsa?</td><td>İdempotent çıktı</td><td><code>"w"</code> kipi, geçici dosya + <code>os.replace</code></td></tr>
<tr><td>Ne oldu, nerede?</td><td>Gözlemlenebilirlik</td><td><code>logging</code>, özet metrikler</td></tr>
</table></div>

<h3>2. Yapılandırma: varsayılan → dosya → ortam</h3>
<p>Öncelik sırası geleneği şöyledir: koddaki varsayılanlar en zayıf, ayar dosyası onları ezer, ortam değişkenleri (environment variables) ve CLI argümanları en güçlüdür. Böylece aynı paket geliştirici bilgisayarında, CI'da ve sunucuda farklı ayarla, kod değişmeden çalışır. Parola ve token yalnız ortam değişkeninden gelir, dosyaya yazılmaz.</p>
<pre class="py">import tomllib
from dataclasses import dataclass, fields

@dataclass(frozen=True)
class Ayar:
    bugun: str = "2024-05-01"
    q: int = 4
    cikti: str = "rapor.md"
    sayfa_boyutu: int = 100

def ayar_yukle(toml_metin, ortam):
    degerler = {}
    tablo = tomllib.loads(toml_metin).get("analitik", {})
    gecerli = {f.name: f.type for f in fields(Ayar)}
    for k, v in tablo.items():
        if k not in gecerli:
            raise ValueError(f"bilinmeyen ayar: {k}")
        degerler[k] = v
    for k, tur in gecerli.items():             # ANALITIK_Q=5 gibi
        anahtar = "ANALITIK_" + k.upper()
        if anahtar in ortam:
            degerler[k] = int(ortam[anahtar]) if tur is int else ortam[anahtar]
    return Ayar(**degerler)

dosya = '[analitik]\nq = 5\ncikti = "aylik.md"\n'
print(ayar_yukle(dosya, {}))
print(ayar_yukle(dosya, {"ANALITIK_Q": "3", "PATH": "/usr/bin"}))</pre>
<p><code>from __future__ import annotations</code> kullanan modüllerde <code>f.type</code> metin olarak gelir (<code>"int"</code>); o durumda <code>typing.get_type_hints(Ayar)</code> ile gerçek türleri al.</p>

<h3>3. Loglama ve dayanıklılık</h3>
<p>Kütüphane modülleri yalnız <code>logger = logging.getLogger(__name__)</code> der; yapılandırmayı (seviye, biçim, hedef) tek bir yerde, <code>main</code> içinde yaparsın. Ağ çağrılarında geçici hatalar (zaman aşımı, 503) normaldir: birkaç kez, giderek uzayan aralıklarla yeniden dene. Kalıcı hatalarda (400, 404, doğrulama) yeniden deneme anlamsızdır; hemen hata ver.</p>
<pre class="py">import logging, sys, random

def log_kur(seviye="INFO"):
    log = logging.getLogger("analitik")
    log.handlers.clear()
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(levelname)-7s %(name)s: %(message)s"))
    log.addHandler(h)
    log.setLevel(seviye)
    log.propagate = False
    return log

log = log_kur()

def yeniden_dene(fonk, deneme=4, taban=0.5, tavan=8.0, uyu=lambda s: None):
    for i in range(deneme):
        try:
            return fonk()
        except ConnectionError as e:
            if i == deneme - 1:
                log.error("vazgeçildi: %s", e)
                raise
            bekle = min(tavan, taban * 2 ** i) * random.uniform(0.8, 1.2)   # jitter
            log.warning("deneme %d başarısız (%s), %.2f sn sonra", i + 1, e, bekle)
            uyu(bekle)

random.seed(1)
cagri = {"n": 0}
def kararsiz_api():
    cagri["n"] += 1
    if cagri["n"] &lt; 3:
        raise ConnectionError("503 Service Unavailable")
    return {"veri": [1, 2, 3], "son": True}

print(yeniden_dene(kararsiz_api))
log.debug("bu satır görünmez: seviye INFO")</pre>
<div class="tip"><b>Neden jitter?</b>Yüz istemci aynı anda hata alıp hepsi tam 1, 2, 4 saniye sonra yeniden denerse sunucuya dalgalar halinde yüklenir (thundering herd). Bekleme süresine küçük bir rastgelelik eklemek istekleri zamana yayar. Gerçek projede <code>tenacity</code> kütüphanesi (<code>pip install tenacity</code>) bunu dekoratörle verir.</div>

<h3>4. İdempotent rapor ve uçtan uca akış</h3>
<p>İdempotent (idempotent) iş, kaç kez çalıştırılırsa çalıştırılsın aynı sonucu bırakır. Gece işi yarıda kesilip yeniden başlatıldığında raporun iki kopya satır içermemesi, yarım yazılmış dosyanın da okunmaması gerekir. Çözüm: önce geçici dosyaya yaz, sonra <code>os.replace</code> ile tek hamlede yerine koy; bu işlem aynı disk üzerinde atomiktir.</p>
<pre class="py">import os, tempfile

def markdown_tablo(satirlar, sutunlar):
    bas = "| " + " | ".join(sutunlar) + " |"
    ayr = "|" + "|".join("---:" if isinstance(satirlar[0][s], (int, float)) else "---" for s in sutunlar) + "|"
    govde = ["| " + " | ".join(f"{r[s]:,.0f}" if isinstance(r[s], float) else str(r[s]) for s in sutunlar) + " |" for r in satirlar]
    return "\n".join([bas, ayr, *govde])

def atomik_yaz(yol, metin):
    klasor = os.path.dirname(os.path.abspath(yol))
    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(metin)
    os.replace(gecici, yol)

satirlar = [{"urun": "Kulaklık", "adet": 3, "ciro": 2550.0}, {"urun": "Çanta", "adet": 2, "ciro": 800.0}]
rapor = "# Aylık satış raporu\n\n" + markdown_tablo(satirlar, ["urun", "adet", "ciro"]) + "\n"
for _ in range(2):                         # iki kez çalıştır: sonuç değişmez
    atomik_yaz("rapor.md", rapor)
print(open("rapor.md", encoding="utf-8").read())</pre>
<p>Uçtan uca <code>main</code> artık şu sırayı izler: ayarları yükle → log kur → veriyi çek (yeniden denemeli) → doğrula, hatalıları say ve logla → hesapla → raporu atomik yaz → özet satırı logla ("812 kayıt, 3 geçersiz, 4 segment, rapor.md") → çıkış kodu döndür (geçersiz oranı eşiği aşarsa 1).</p>
<div class="warn"><b>Sessiz veri kaybı</b>Bozuk kayıtları <code>try/except: continue</code> ile atlamak en tehlikeli kalıptır: rapor "doğru görünür" ama eksiktir. Atladığın her kaydı sebebiyle say, logla ve oran eşiği aşarsa işi başarısız say.</div>
<div class="note"><b>Gerçek işte</b>Portföy projeni değerlendiren kişi önce README'ye bakar: tek komutla kurulum (<code>pip install -e ".[dev]"</code>), örnek komut ve örnek çıktı, mimari çizim ya da modül tablosu, "bilinen sınırlar" bölümü. Ardından testlerin ve CI rozetinin yeşil olup olmadığına, commit geçmişinin anlamlı olup olmadığına ("fix", "update" değil "rfm: eşit frequency için rank(first) eklendi") bakar. Bu bölümdeki katmanlar, projeyi bir ödevden bir iş örneğine dönüştüren farktır.</div>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Ayar <code>q</code> koddaki varsayılanda 4, <code>analitik.toml</code>\'da 5 ve ortam değişkeni <code>ANALITIK_Q=3</code> olarak tanımlı. Yaygın öncelik geleneğine göre hangi değer kullanılır?',
    o=['4, çünkü koddaki değer her zaman esastır', '3, çünkü ortam değişkeni dosyayı ezer', '5, çünkü dosya ortamdan daha kalıcıdır', 'Çakışma olduğu için program hata vermelidir'], a=1,
    why='Gelenek: varsayılan < dosya < ortam değişkeni < CLI argümanı. Böylece aynı kod ve aynı dosya, sunucuda yalnız ortam değişkeniyle farklı davranabilir. Çakışma hata değil, tasarlanmış bir katmanlamadır.'))
ex.append(dict(t='mc', stage='Isınma', q='Gece çalışan rapor işinin "idempotent" olması ne demektir?',
    o=['İş girdi boyutundan bağımsız, her zaman aynı sürede biter', 'İş yalnız bir kez çalıştırılabilir, ikinci çağrı reddedilir', 'Kaç kez çalışırsa çalışsın aynı sonucu bırakır', 'İş hiçbir koşulda hata vermez, hataları kendisi yutar'], a=2,
    why='İdempotent iş yeniden çalıştırıldığında kopya satır üretmez, yarım dosya bırakmaz. Bu sayede yarıda kesilen işi gönül rahatlığıyla yeniden başlatabilirsin. "a" kipiyle dosyaya eklemek tipik idempotentlik ihlalidir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Üstel geri çekilme (exponential backoff) süreleri ne olur?',
    code=D('''
        taban, tavan = 0.5, 4.0
        print([min(taban * 2 ** i, tavan) for i in range(5)])
    '''),
    o=['[0.5, 1.0, 2.0, 4.0, 8.0]', '[0.5, 1.0, 2.0, 3.0, 4.0]', '[0.5, 1.0, 2.0, 4.0, 4.0]', '[1.0, 2.0, 4.0, 4.0, 4.0]'], a=2,
    why='Bekleme her denemede ikiye katlanır: 0.5, 1.0, 2.0, 4.0, 8.0. Tavan 4.0 olduğu için son değer 4.0\'a sınırlanır. Tavan, çok uzun beklemeleri önler; i 0\'dan başladığı için ilk bekleme tabanın kendisidir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Loglayıcı seviyesi WARNING iken ne yazdırılır?',
    code=D('''
        import logging, sys
        log = logging.getLogger("analitik.test")
        log.handlers.clear()
        h = logging.StreamHandler(sys.stdout)
        h.setFormatter(logging.Formatter("%(levelname)s:%(message)s"))
        log.addHandler(h)
        log.propagate = False
        log.setLevel(logging.WARNING)
        log.debug("veri okundu")
        log.info("812 kayıt")
        log.warning("3 geçersiz kayıt")
        log.error("rapor yazılamadı")
    '''),
    o=['WARNING:3 geçersiz kayıt\nERROR:rapor yazılamadı', 'INFO:812 kayıt\nWARNING:3 geçersiz kayıt\nERROR:rapor yazılamadı', 'ERROR:rapor yazılamadı', 'DEBUG:veri okundu\nINFO:812 kayıt\nWARNING:3 geçersiz kayıt\nERROR:rapor yazılamadı'], a=0,
    why='Seviye WARNING ise yalnız WARNING ve üstü (ERROR, CRITICAL) işlenir; DEBUG ve INFO filtrelenir. propagate = False, mesajın kök loglayıcıya da gidip iki kez yazılmasını engeller.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Dondurulmuş (frozen) dataclass\'a atama yapılınca ne olur?',
    raises=True,
    code=D('''
        from dataclasses import dataclass, replace

        @dataclass(frozen=True)
        class Ayar:
            q: int = 4
            cikti: str = "rapor.md"

        a = Ayar()
        b = replace(a, q=5)
        print(a.q, b.q)
        a.q = 6
    '''),
    o=['4 5 yazar, sonra hata vermeden a.q 6 olur', 'TypeError hatası verir', 'FrozenInstanceError hatası verir', 'AttributeError: replace bulunamadı'], a=2,
    why='replace yeni bir nesne üretir (4 5 yazılır); ama frozen nesneye doğrudan atama dataclasses.FrozenInstanceError fırlatır (AttributeError\'ın alt sınıfı). Ayarları dondurmak, çalışma sırasında yanlışlıkla değiştirilmelerini engeller.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Uçtan uca mini akışın satırlarını sırala: kayıtları doğrula, geçerli tutarları topla, özeti yazdır.</p>',
    lines=['kayitlar = [{"tutar": 120}, {"tutar": -5}, {"tutar": 850}, {}]',
           'gecerli = [k for k in kayitlar if k.get("tutar", 0) > 0]',
           'gecersiz = len(kayitlar) - len(gecerli)',
           'ciro = sum(k["tutar"] for k in gecerli)',
           'oran = gecersiz / len(kayitlar)',
           'print(f"ciro={ciro} geçersiz={gecersiz} oran={oran:.0%}")',
           'print("DURUM:", "HATA" if oran > 0.25 else "TAMAM")'],
    expect='ciro=970 geçersiz=2 oran=50%\nDURUM: HATA\n',
    hint='Önce veri, sonra doğrulama; sayım ve ciro doğrulanmış listeye bağlı; oran geçersiz sayısına bağlı; durum en sonda.',
    why='Akış her zaman veri → doğrulama → hesap → özet sırasındadır. Geçersiz oranı eşiği aşınca işi başarısız saymak, sessiz veri kaybını görünür kılar.'))

def code(stage, n, diff, q, start, sol, tests, hints, why, guide=None, example=None, kind=None):
    e = dict(t='code', stage=stage)
    if kind: e['kind'] = kind
    e.update(id=f'{LID}-x{n}', diff=diff, q=q)
    if guide: e['guide'] = guide
    if example: e['example'] = example
    e.update(start=start, sol=sol, tests=tests, hints=hints, why=why)
    return e

ex.append(code('Rehberli', 1, 2,
    '<p>Yapılandırma katmanı. <code>Ayar</code> dataclass\'ı (frozen) şu alanlara sahip: <code>bugun: str = "2024-05-01"</code>, <code>q: int = 4</code>, <code>cikti: str = "rapor.md"</code>. <code>ayar_yukle(toml_metin: str, ortam: dict) -&gt; Ayar</code> yaz:</p><ul><li>Önce varsayılanlar, sonra TOML\'daki <code>[analitik]</code> tablosu (tablo yoksa atla), en son <code>ANALITIK_BUGUN</code>, <code>ANALITIK_Q</code>, <code>ANALITIK_CIKTI</code> ortam değişkenleri uygulanır. Ortamdan gelen <code>q</code> metindir; <code>int</code>\'e çevir.</li><li>TOML tablosunda bilinmeyen anahtar varsa <code>ValueError</code>.</li><li>Sonuçta <code>q</code> 2 ile 10 arasında (dahil) değilse <code>ValueError</code>.</li></ul>',
    D('''
        import tomllib
        from dataclasses import dataclass, fields

        @dataclass(frozen=True)
        class Ayar:
            bugun: str = "2024-05-01"
            q: int = 4
            cikti: str = "rapor.md"

        def ayar_yukle(toml_metin, ortam):
            degerler = {}
            tablo = tomllib.loads(toml_metin).get("analitik", {})
            alanlar = {f.name for f in fields(Ayar)}
            # TODO: tablo anahtarlarını kontrol et ve degerler'e koy
            # TODO: ANALITIK_<AD> ortam değişkenlerini uygula (q -> int)
            # TODO: q aralık kontrolü
            return Ayar()
    '''),
    D('''
        import tomllib
        from dataclasses import dataclass, fields

        @dataclass(frozen=True)
        class Ayar:
            bugun: str = "2024-05-01"
            q: int = 4
            cikti: str = "rapor.md"

        def ayar_yukle(toml_metin, ortam):
            degerler = {}
            tablo = tomllib.loads(toml_metin).get("analitik", {})
            alanlar = {f.name for f in fields(Ayar)}
            for k, v in tablo.items():
                if k not in alanlar:
                    raise ValueError(f"bilinmeyen ayar: {k}")
                degerler[k] = v
            for ad in alanlar:
                anahtar = "ANALITIK_" + ad.upper()
                if anahtar in ortam:
                    degerler[ad] = int(ortam[anahtar]) if ad == "q" else ortam[anahtar]
            ayar = Ayar(**degerler)
            if not 2 <= ayar.q <= 10:
                raise ValueError(f"q 2-10 arasında olmalı: {ayar.q}")
            return ayar
    '''),
    D('''
        assert ayar_yukle("", {}) == Ayar(), "boş dosya ve boş ortamda varsayılanlar"
        d = '[analitik]\\nq = 5\\ncikti = "aylik.md"\\n'
        assert ayar_yukle(d, {}) == Ayar(q=5, cikti="aylik.md"), "dosya varsayılanı ezer"
        a = ayar_yukle(d, {"ANALITIK_Q": "3", "ANALITIK_BUGUN": "2024-06-01", "HOME": "/root"})
        assert a == Ayar(bugun="2024-06-01", q=3, cikti="aylik.md"), f"ortam dosyayı ezer ve q int'e çevrilir: {a}"
        assert ayar_yukle('[baska]\\nq = 99\\n', {}) == Ayar(), "[analitik] dışındaki tablolar yok sayılır"
        for metin, ortam in [('[analitik]\\nkuyruk = 1\\n', {}), ("", {"ANALITIK_Q": "1"}), ('[analitik]\\nq = 11\\n', {})]:
            try:
                ayar_yukle(metin, ortam)
                assert False, f"{metin!r} / {ortam} için ValueError bekleniyordu"
            except ValueError:
                pass
    '''),
    ['Üç katman sırayla aynı sözlüğü günceller; sonra Ayar(**degerler).', 'Ortam anahtarı: "ANALITIK_" + ad.upper().', 'Aralık kontrolünü nesneyi kurduktan sonra yap; böylece hangi katmandan gelirse gelsin denetlenir.'],
    'Katmanlı yapılandırma 12-factor uygulama ilkesinin özüdür. Bilinmeyen anahtarda hata vermek, "qq = 5" gibi yazım hatalarının sessizce yok sayılmasını önler.',
    guide=['TOML tablosundaki her anahtar Ayar alanı mı kontrol et; değilse ValueError.', 'Geçerli değerleri degerler sözlüğüne koy.', 'Her alan için ANALITIK_<AD> ortamda varsa değeri al; q ise int\'e çevir.', 'Ayar(**degerler) ile nesneyi kur.', 'q aralığını denetle ve nesneyi döndür.'],
    example=D('''
        varsayilan = {"renk": "mavi", "boyut": 10}
        dosya = {"boyut": 12}
        ortam = {"UYG_RENK": "yeşil"}
        sonuc = dict(varsayilan)
        sonuc.update(dosya)
        for k in sonuc:
            if "UYG_" + k.upper() in ortam:
                sonuc[k] = ortam["UYG_" + k.upper()]
        print(sonuc)
    ''')))

ex.append(code('Rehberli', 2, 2,
    '<p>Kayıt doğrulama. <code>kayit_dogrula(kayitlar: list[dict]) -&gt; tuple[list[dict], list[tuple[int, str]]]</code> yaz. Her kayıt için sırayla şu kuralları uygula; ilk ihlalde kaydı hatalılar listesine <code>(indeks, sebep)</code> olarak ekle:</p><ol><li><code>musteri</code>, <code>tarih</code>, <code>tutar</code> anahtarlarından biri yoksa → <code>"eksik alan: &lt;ad&gt;"</code> (ilk eksik alan, bu sırayla)</li><li><code>musteri</code> boş ya da yalnız boşluksa → <code>"boş müşteri"</code></li><li><code>tarih</code> <code>date.fromisoformat</code> ile çözülemiyorsa → <code>"geçersiz tarih"</code></li><li><code>tutar</code> int/float değilse (bool da kabul edilmez) ya da 0 veya negatifse → <code>"geçersiz tutar"</code></li></ol><p>Geçerli kayıtları sırayla, <code>musteri</code> değeri <code>strip()</code> edilmiş <b>yeni</b> sözlükler olarak döndür (girdiyi değiştirme).</p>',
    D('''
        from datetime import date

        ZORUNLU = ("musteri", "tarih", "tutar")

        def kayit_dogrula(kayitlar):
            gecerli, hatalar = [], []
            for i, k in enumerate(kayitlar):
                # TODO: eksik alan
                # TODO: boş müşteri
                # TODO: tarih (try/except ValueError)
                # TODO: tutar türü ve işareti
                gecerli.append(k)
            return gecerli, hatalar
    '''),
    D('''
        from datetime import date

        ZORUNLU = ("musteri", "tarih", "tutar")

        def _sebep(k):
            for alan in ZORUNLU:
                if alan not in k:
                    return f"eksik alan: {alan}"
            if not str(k["musteri"]).strip():
                return "boş müşteri"
            try:
                date.fromisoformat(k["tarih"])
            except (ValueError, TypeError):
                return "geçersiz tarih"
            t = k["tutar"]
            if isinstance(t, bool) or not isinstance(t, (int, float)) or t <= 0:
                return "geçersiz tutar"
            return None

        def kayit_dogrula(kayitlar):
            gecerli, hatalar = [], []
            for i, k in enumerate(kayitlar):
                sebep = _sebep(k)
                if sebep:
                    hatalar.append((i, sebep))
                else:
                    gecerli.append({**k, "musteri": k["musteri"].strip()})
            return gecerli, hatalar
    '''),
    D('''
        K = [
            {"musteri": " Ayşe ", "tarih": "2024-01-05", "tutar": 120.0},
            {"musteri": "Ali", "tarih": "2024-02-30", "tutar": 50},
            {"musteri": "Can", "tutar": 10},
            {"musteri": "  ", "tarih": "2024-01-01", "tutar": 10},
            {"musteri": "Ece", "tarih": "2024-03-01", "tutar": "90"},
            {"musteri": "Elif", "tarih": "2024-03-02", "tutar": True},
            {"musteri": "Su", "tarih": "2024-03-03", "tutar": 0},
            {"musteri": "Mert", "tarih": "2024-04-01", "tutar": 75},
        ]
        g, h = kayit_dogrula(K)
        assert [x["musteri"] for x in g] == ["Ayşe", "Mert"], f"geçerli kayıtlar: {g}"
        assert h == [(1, "geçersiz tarih"), (2, "eksik alan: tarih"), (3, "boş müşteri"), (4, "geçersiz tutar"), (5, "geçersiz tutar"), (6, "geçersiz tutar")], f"hatalar: {h}"
        assert K[0]["musteri"] == " Ayşe ", "girdi sözlüğü değişmemeli (yeni sözlük üret)"
        assert kayit_dogrula([]) == ([], []), "boş girdi"
    '''),
    ['Kuralları bir yardımcı fonksiyona koy: sebep metnini ya da None döndürsün.', 'bool, int\'in alt sınıfıdır: isinstance(True, int) True verir; önce bool\'u ele.', 'Yeni sözlük: {**k, "musteri": k["musteri"].strip()}'],
    'Doğrulamayı ayrı ve saf (yan etkisiz) bir fonksiyon yapmak test edilebilirliği artırır. Hatalı kayıtları sebebiyle döndürmek, raporda "3 kayıt geçersiz tarih yüzünden atlandı" diyebilmeni sağlar.',
    guide=['Her kayıt için ilk ihlali bulan bir yardımcı fonksiyon yaz (None = geçerli).', 'Eksik alanları ZORUNLU sırasıyla kontrol et.', 'Tarih için try/except içinde date.fromisoformat çağır.', 'Tutar için önce bool, sonra (int, float) ve > 0 kontrolü.', 'Geçerli kayıtların strip edilmiş kopyasını ekle.'],
    example=D('''
        from datetime import date

        def tarih_mi(metin):
            try:
                date.fromisoformat(metin)
                return True
            except ValueError:
                return False

        print(tarih_mi("2024-02-29"), tarih_mi("2023-02-29"), isinstance(True, int))
    ''')))

ex.append(code('Rehberli', 3, 2,
    '<p>Yeniden deneme. <code>yeniden_dene(fonk, deneme=3, taban=0.5, uyu=None)</code> yaz: <code>fonk()</code>\'u çağırıp sonucunu döndürür. <code>ConnectionError</code> ya da <code>TimeoutError</code> gelirse <code>taban * 2**i</code> saniye (i = 0, 1, ...) bekleyip yeniden dener; bekleme için <code>uyu(saniye)</code> çağrılır (<code>uyu</code> None ise <code>time.sleep</code>). Deneme hakkı bitince <b>son hatayı</b> yeniden fırlatır (son denemeden sonra bekleme yapılmaz). Diğer hata türleri (ör. <code>ValueError</code>) hiç yeniden denenmeden hemen yayılır.</p>',
    D('''
        import time

        GECICI = (ConnectionError, TimeoutError)

        def yeniden_dene(fonk, deneme=3, taban=0.5, uyu=None):
            uyu = uyu or time.sleep
            for i in range(deneme):
                # TODO: fonk() çağır, geçici hatada bekle ve tekrar dene
                # TODO: son denemede hatayı yeniden fırlat
                pass
    '''),
    D('''
        import time

        GECICI = (ConnectionError, TimeoutError)

        def yeniden_dene(fonk, deneme=3, taban=0.5, uyu=None):
            uyu = uyu or time.sleep
            for i in range(deneme):
                try:
                    return fonk()
                except GECICI:
                    if i == deneme - 1:
                        raise
                    uyu(taban * 2 ** i)
    '''),
    D('''
        beklemeler = []
        def sahte_uyu(s):
            beklemeler.append(s)

        sayac = {"n": 0}
        def iki_kez_dusen():
            sayac["n"] += 1
            if sayac["n"] <= 2:
                raise ConnectionError("503")
            return "tamam"
        assert yeniden_dene(iki_kez_dusen, deneme=3, uyu=sahte_uyu) == "tamam", "üçüncü denemede başarılı olmalı"
        assert beklemeler == [0.5, 1.0], f"bekleme süreleri 0.5 ve 1.0 olmalı, gelen {beklemeler}"

        beklemeler.clear()
        def hep_zaman_asimi():
            raise TimeoutError("zaman aşımı")
        try:
            yeniden_dene(hep_zaman_asimi, deneme=4, taban=1, uyu=sahte_uyu)
            assert False, "deneme hakkı bitince hata yayılmalı"
        except TimeoutError:
            pass
        assert beklemeler == [1, 2, 4], f"4 denemede 3 bekleme olmalı (son denemeden sonra bekleme yok): {beklemeler}"

        beklemeler.clear()
        sayac2 = {"n": 0}
        def kalici():
            sayac2["n"] += 1
            raise ValueError("400 Bad Request")
        try:
            yeniden_dene(kalici, uyu=sahte_uyu)
            assert False, "ValueError yayılmalı"
        except ValueError:
            pass
        assert sayac2["n"] == 1 and beklemeler == [], "kalıcı hata yeniden denenmemeli"
    '''),
    ['try içinde return fonk(); except yalnız GECICI demetini yakalasın.', 'Son denemede (i == deneme - 1) çıplak raise ile aynı hatayı yeniden fırlat.', 'Aksi halde uyu(taban * 2 ** i).'],
    'Bekleme fonksiyonunu parametre olarak almak (bağımlılık enjeksiyonu), testin gerçekten saniyelerce beklemeden süreleri doğrulamasını sağlar. Yalnız geçici hataları yeniden denemek, kalıcı hatada boşa zaman harcamayı önler.',
    guide=['for i in range(deneme) döngüsü içinde fonk()\'u try bloğunda çağır.', 'Başarılıysa sonucu hemen döndür.', 'GECICI hatalardan birinde, son deneme değilse uyu(taban * 2 ** i) çağır.', 'Son denemedeyse raise ile hatayı yay.', 'Diğer hatalar except\'e girmediği için kendiliğinden yayılır.'],
    example=D('''
        def ilk_basarili(kaynaklar):
            for ad, fonk in kaynaklar:
                try:
                    return ad, fonk()
                except KeyError:
                    print(ad, "başarısız")
            raise LookupError("hiçbiri çalışmadı")

        print(ilk_basarili([("önbellek", lambda: {}["x"]), ("veritabanı", lambda: 42)]))
    ''')))

ex.append(code('Kendin yaz', 4, 2,
    '<p>Rapor tablosu. <code>markdown_tablo(satirlar: list[dict], sutunlar: list[str]) -&gt; str</code>: Markdown tablo metni üret. Başlık satırı <code>| a | b |</code>; ayırıcı satırda sayısal sütunlar (ilk satırdaki değer <code>int</code> ya da <code>float</code>, <code>bool</code> hariç) <code>---:</code>, diğerleri <code>---</code>; ayırıcı satırda boşluk yok: <code>|---|---:|</code>. Değerler: <code>float</code> → binlik ayraçlı 2 ondalık (<code>f"{x:,.2f}"</code>), diğerleri <code>str</code>. Satırlar <code>\\n</code> ile birleşir, sonda satır sonu yok. <code>satirlar</code> boşsa yalnız başlık ve ayırıcı (hepsi <code>---</code>).</p>',
    D('''
        def markdown_tablo(satirlar, sutunlar):
            pass
    '''),
    D('''
        def _sayisal(v):
            return isinstance(v, (int, float)) and not isinstance(v, bool)

        def _bicim(v):
            return f"{v:,.2f}" if isinstance(v, float) else str(v)

        def markdown_tablo(satirlar, sutunlar):
            bas = "| " + " | ".join(sutunlar) + " |"
            ilk = satirlar[0] if satirlar else {}
            ayr = "|" + "|".join("---:" if _sayisal(ilk.get(s)) else "---" for s in sutunlar) + "|"
            govde = ["| " + " | ".join(_bicim(r[s]) for s in sutunlar) + " |" for r in satirlar]
            return "\\n".join([bas, ayr, *govde])
    '''),
    D('''
        s = [{"urun": "Kulaklık", "adet": 3, "ciro": 2550.0, "aktif": True},
             {"urun": "Çanta", "adet": 2, "ciro": 1234567.891, "aktif": False}]
        beklenen = "\\n".join([
            "| urun | adet | ciro | aktif |",
            "|---|---:|---:|---|",
            "| Kulaklık | 3 | 2,550.00 | True |",
            "| Çanta | 2 | 1,234,567.89 | False |",
        ])
        r = markdown_tablo(s, ["urun", "adet", "ciro", "aktif"])
        assert r == beklenen, "tablo biçimi farklı:\\n" + r
        assert markdown_tablo([], ["a", "b"]) == "| a | b |\\n|---|---|", "boş tabloda başlık ve ayırıcı"
        assert markdown_tablo(s, ["adet"]).endswith("| 2 |"), "yalnız istenen sütunlar, sonda satır sonu yok"
    '''),
    ['Üç parça kur: başlık, ayırıcı, gövde satırları; sonra "\\n".join.', 'bool, int\'in alt sınıfıdır; sayısal kontrolünde önce onu dışla.', 'Binlik ayraç ve 2 ondalık: f"{x:,.2f}".'],
    'Markdown tablolar GitHub, GitLab ve çoğu wiki\'de doğrudan görüntülenir; otomatik raporu PR yorumuna ya da Slack\'e göndermenin en sade yoludur. Sayısal sütunu sağa hizalamak (---:) okunabilirliği ciddi artırır.'))

ex.append(code('Kendin yaz', 5, 2,
    '<p>Kayıp (churn) riski. <code>churn_listesi(siparisler: list[tuple[str, str]], bugun: str, gun: int = 90) -&gt; list[tuple[str, int]]</code>: <code>siparisler</code> <code>(musteri, "YYYY-MM-DD")</code> demetleridir. Her müşterinin <b>son</b> siparişinden <code>bugun</code>\'e kadar geçen gün sayısını hesapla; bu sayı <code>gun</code>\'den <b>büyük veya eşit</b> olanları <code>(musteri, gecen_gun)</code> olarak, geçen güne göre azalan, eşitlikte müşteri adına göre artan sırada döndür.</p>',
    D('''
        def churn_listesi(siparisler, bugun, gun=90):
            pass
    '''),
    D('''
        from datetime import date

        def churn_listesi(siparisler, bugun, gun=90):
            b = date.fromisoformat(bugun)
            son = {}
            for m, t in siparisler:
                d = date.fromisoformat(t)
                if m not in son or d > son[m]:
                    son[m] = d
            riskli = [(m, (b - d).days) for m, d in son.items() if (b - d).days >= gun]
            return sorted(riskli, key=lambda x: (-x[1], x[0]))
    '''),
    D('''
        s = [("Ayşe", "2024-01-05"), ("Ayşe", "2024-04-20"), ("Mehmet", "2024-01-12"),
             ("Zeynep", "2024-02-01"), ("Ali", "2024-02-01"), ("Elif", "2024-04-25")]
        r = churn_listesi(s, "2024-05-01")
        assert r == [("Mehmet", 110), ("Ali", 90), ("Zeynep", 90)], f"beklenen liste farklı: {r}"
        assert churn_listesi(s, "2024-05-01", gun=200) == [], "eşiği kimse aşmıyor"
        assert churn_listesi([("Can", "2023-12-31"), ("Can", "2023-01-01")], "2024-01-01", gun=1) == [("Can", 1)], "son sipariş en yeni tarihtir, girdi sırası değil"
    '''),
    ['Önce her müşterinin en yeni sipariş tarihini sözlükte topla.', 'Gün farkı: (date_b - date_a).days.', 'Çok anahtarlı sıralama: key=lambda x: (-x[1], x[0]).'],
    'Bu, RFM\'in Recency bileşeninin iş kuralına dönüşmüş hâlidir: pazarlama ekibi "90 gündür alışveriş yapmayanlara geri kazanım kampanyası" der. Tarihleri metin değil date olarak karşılaştırmak ay/yıl geçişlerinde doğru sonuç verir.'))

ex.append(code('Hata avı', 6, 1,
    '<p><b>Hatayı bul ve düzelt.</b> <code>rapor_yaz(yol, satirlar)</code> satırları her biri ayrı satırda olacak şekilde dosyaya yazmalı ve <b>idempotent</b> olmalı: aynı çağrı iki kez yapılınca dosya içeriği değişmemeli. Mevcut kod her çalıştırmada satırları sona ekliyor ve satırları birbirine yapıştırıyor.</p>',
    D('''
        def rapor_yaz(yol, satirlar):
            with open(yol, "a", encoding="utf-8") as f:
                f.write("".join(satirlar))
    '''),
    D('''
        def rapor_yaz(yol, satirlar):
            with open(yol, "w", encoding="utf-8") as f:
                f.write("\\n".join(satirlar) + "\\n")
    '''),
    D('''
        import os
        yol = "test_rapor_idem.md"
        if os.path.exists(yol):
            os.remove(yol)
        satirlar = ["# Rapor", "ciro: 970", "geçersiz: 2"]
        rapor_yaz(yol, satirlar)
        rapor_yaz(yol, satirlar)
        icerik = open(yol, encoding="utf-8").read()
        assert icerik == "# Rapor\\nciro: 970\\ngeçersiz: 2\\n", f"iki çalıştırmadan sonra içerik tek kopya olmalı, gelen: {icerik!r}"
        rapor_yaz(yol, ["yeni"])
        assert open(yol, encoding="utf-8").read() == "yeni\\n", "yeni rapor eskisinin yerini almalı"
        os.remove(yol)
    '''),
    ['"a" (append) kipi her çalıştırmada sona ekler.', '"w" kipi dosyayı sıfırdan yazar.', 'Satır sonları için "\\n".join(...) + "\\n".'],
    'Rapor dosyası her çalıştırmada baştan üretilmeli. Daha da sağlamı geçici dosyaya yazıp os.replace ile yer değiştirmektir: iş yarıda kesilirse eski rapor bozulmadan kalır.'))

ex.append(code('Hata avı', 7, 2,
    '<p><b>Hatayı bul ve düzelt.</b> <code>hepsini_cek(api)</code> sayfalı API\'den tüm kayıtları toplamalı. <code>api(sayfa)</code> <code>{"veri": [...], "son": bool}</code> döndürür; sayfalar 0\'dan başlar. Mevcut kod son sayfanın verisini kaybediyor ve tek sayfalık yanıtta hiç veri döndürmüyor.</p>',
    D('''
        def hepsini_cek(api):
            hepsi = []
            sayfa = 0
            yanit = api(sayfa)
            while not yanit["son"]:
                hepsi.extend(yanit["veri"])
                sayfa += 1
                yanit = api(sayfa)
            return hepsi
    '''),
    D('''
        def hepsini_cek(api):
            hepsi = []
            sayfa = 0
            while True:
                yanit = api(sayfa)
                hepsi.extend(yanit["veri"])
                if yanit["son"]:
                    return hepsi
                sayfa += 1
    '''),
    D('''
        def sahte_api_kur(kayitlar, boyut):
            cagrilar = []
            def api(sayfa):
                cagrilar.append(sayfa)
                bas = sayfa * boyut
                return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut >= len(kayitlar)}
            return api, cagrilar
        api, c = sahte_api_kur(list(range(10)), 4)
        assert hepsini_cek(api) == list(range(10)), "10 kaydın hepsi gelmeli (son sayfa dahil)"
        assert c == [0, 1, 2], f"3 sayfa, her biri bir kez çağrılmalı: {c}"
        api, c = sahte_api_kur([1, 2], 5)
        assert hepsini_cek(api) == [1, 2], "tek sayfalık yanıt"
        api, c = sahte_api_kur([], 5)
        assert hepsini_cek(api) == [], "boş API"
    '''),
    ['Döngü koşulu "son değilse" olduğu için son sayfa gövdeye hiç girmiyor.', 'Veriyi önce ekle, sonra "son mu?" diye bak.', 'while True + içeride return/break kalıbı bu tür "en az bir kez çalış" döngüleri için en nettir.'],
    'Klasik "bir eksik" (off-by-one) hatası: son sayfa da veri taşır. Python\'da do-while olmadığı için while True ile önce iş, sonra çıkış kontrolü yapılır.'))

ex.append(code('Meydan okuma', 8, 3,
    '<p>Saf Python ile uçtan uca mini RFM akışı. <code>rfm_akisi(csv_metin: str, bugun: str, q: int = 4) -&gt; dict</code>:</p><ul><li>CSV başlığı <code>musteri,tarih,tutar</code>. <code>csv.DictReader</code> ile oku. Geçersiz satırlar (boş müşteri, ISO olmayan tarih, sayıya çevrilemeyen ya da 0 veya negatif tutar) sayılıp atlanır.</li><li>Her müşteri için recency (bugün − son sipariş, gün), frequency (sipariş sayısı), monetary (toplam tutar).</li><li>Skor: n müşteri için bir ölçütte sıra numarası <code>r</code> (1..n) verilir ve skor <code>(r - 1) * q // n + 1</code> olur. F ve M için sıralama anahtarı <code>(değer, musteri)</code> artan; R için <code>(-recency, musteri)</code> artan (en eski müşteri 1. sırada, en düşük R skoru).</li><li>Döndür: <code>{"gecersiz": int, "musteriler": {musteri: (R, F, M)}}</code>, müşteri anahtarları alfabetik sıralı.</li></ul>',
    D('''
        import csv, io
        from datetime import date

        def rfm_akisi(csv_metin, bugun, q=4):
            pass
    '''),
    D('''
        import csv, io
        from datetime import date

        def _skorla(musteriler, anahtar, q):
            n = len(musteriler)
            sirali = sorted(musteriler, key=anahtar)
            return {m: (r - 1) * q // n + 1 for r, m in enumerate(sirali, 1)}

        def rfm_akisi(csv_metin, bugun, q=4):
            b = date.fromisoformat(bugun)
            gecersiz = 0
            son, sayi, toplam = {}, {}, {}
            for satir in csv.DictReader(io.StringIO(csv_metin)):
                m = (satir.get("musteri") or "").strip()
                try:
                    d = date.fromisoformat((satir.get("tarih") or "").strip())
                    t = float(satir.get("tutar") or "")
                except ValueError:
                    gecersiz += 1
                    continue
                if not m or t <= 0:
                    gecersiz += 1
                    continue
                son[m] = max(son.get(m, d), d)
                sayi[m] = sayi.get(m, 0) + 1
                toplam[m] = toplam.get(m, 0) + t
            ms = list(son)
            rec = {m: (b - son[m]).days for m in ms}
            R = _skorla(ms, lambda m: (-rec[m], m), q)
            F = _skorla(ms, lambda m: (sayi[m], m), q)
            M = _skorla(ms, lambda m: (toplam[m], m), q)
            return {"gecersiz": gecersiz, "musteriler": {m: (R[m], F[m], M[m]) for m in sorted(ms)}}
    '''),
    D('''
        CSV = """musteri,tarih,tutar
        Ayşe,2024-01-05,120
        Mehmet,2024-01-12,850
        Ayşe,2024-02-03,60
        Zeynep,2024-02-10,850
        Ayşe,2024-03-15,850
        Mehmet,2024-03-20,120
        Ali,2024-03-22,400
        ,2024-03-23,100
        Zeynep,2024-04-01,60
        Ali,2024-04-18,120
        Elif,2024-04-25,400
        Can,2024-13-01,50
        Deniz,2024-04-02,abc
        Ece,2024-04-03,-5
        """
        import textwrap
        r = rfm_akisi(textwrap.dedent(CSV), "2024-05-01")
        assert r["gecersiz"] == 4, f"4 geçersiz satır (boş müşteri, ay 13, abc, negatif), gelen {r['gecersiz']}"
        m = r["musteriler"]
        assert list(m) == ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"], "müşteriler alfabetik"
        assert m["Mehmet"][0] == 1 and m["Elif"][0] == 4, f"R: eskiler (Ayşe 47, Mehmet 42 gün) 1, en yeni Elif 4; gelen {m}"
        assert m["Ayşe"] == (1, 4, 4), f"Ayşe: 47 gün (en eski -> R=1), 3 sipariş (F=4), 1030 TL (M=4); gelen {m['Ayşe']}"
        assert m["Elif"][1] == 1, "Elif tek sipariş, eşitlikte ada göre ilk sırada: F=1"
        assert r == rfm_akisi(textwrap.dedent(CSV), "2024-05-01"), "aynı girdiyle aynı sonuç (deterministik)"
        assert rfm_akisi("musteri,tarih,tutar\\n", "2024-05-01") == {"gecersiz": 0, "musteriler": {}}, "boş CSV"
    '''),
    ['Okuma ve doğrulama aşamasında try/except ValueError hem tarih hem float dönüşümünü kapsasın.', 'Üç sözlük (son tarih, sayı, toplam) tek geçişte doldurulur.', 'Skorlama yardımcı fonksiyonu: sorted(..., key=anahtar) ve enumerate(..., 1) ile sıra numarası, sonra (r - 1) * q // n + 1.'],
    'Bu, pandas\'taki rank(method="first") + qcut kalıbının saf Python karşılığıdır: ad ile eşitlik bozmak sonucu deterministik yapar. Doğrulama → toplama → skorlama aşamalarını ayırmak, her birini ayrı test etmeni sağlar.'))

faq = [
    dict(q='Portföyde bu projeyi nasıl sunmalıyım?', a='GitHub deposunda net bir README (amaç, kurulum, tek komutluk örnek, örnek çıktı ekran görüntüsü ya da Markdown rapor), yeşil CI rozeti, anlamlı commit geçmişi ve "bilinen sınırlar / sonraki adımlar" bölümü. Mülakatta "neden rank(first) kullandım", "API hata verirse ne oluyor" gibi tasarım kararlarını iki cümleyle anlatabilmek, kodun kendisi kadar önemlidir.'),
    dict(q='pydantic mi, elle doğrulama mı?', a='Alan sayısı az ve kurallar basitse elle yazılmış saf fonksiyon yeterli ve bağımlılık eklemez. Kayıt yapısı büyüdükçe, iç içe nesneler ve tür dönüşümleri arttıkça pydantic (ayrı derste gördün) hem daha kısa hem daha okunur olur; hata mesajlarını da alan bazında verir.'),
    dict(q='Gece işini nasıl zamanlarım?', a='En basit hâli sunucuda cron: <code>0 2 * * * /opt/analitik/.venv/bin/analitik rfm >> /var/log/analitik.log 2>&1</code>. Bağımlı birden çok adım, yeniden deneme ve izleme gerekirse Airflow/Prefect gibi orkestrasyon araçları ("Orkestrasyon" dersi). Her iki durumda da çıkış kodu ve idempotentlik kritik: zamanlayıcı başarısızlığı çıkış koduyla anlar ve işi güvenle yeniden çalıştırır.')
]
mistakes = [
    dict(bad='for k in kayitlar:\n    try:\n        isle(k)\n    except Exception:\n        continue', good='hatalar = []\nfor i, k in enumerate(kayitlar):\n    try:\n        isle(k)\n    except (ValueError, KeyError) as e:\n        hatalar.append((i, str(e)))\nlog.warning("%d kayıt atlandı", len(hatalar))', why='Her hatayı sessizce yutmak sessiz veri kaybıdır: rapor doğru görünür ama eksiktir. Beklenen hata türlerini yakala, say, logla ve eşik aşılırsa işi başarısız say.'),
    dict(bad='API_TOKEN = "sk-canli-12345"  # ayar.py içinde', good='import os\nAPI_TOKEN = os.environ["ANALITIK_API_TOKEN"]  # .env.example\'da yalnız adı', why='Koda gömülen gizli bilgi git geçmişine girer ve silinse bile geçmişte kalır. Ortam değişkeninden oku; depoya yalnız değişkenin adını içeren .env.example koy.'),
    dict(bad='import logging\nlogging.basicConfig(level="DEBUG")  # rfm.py modülünün başında', good='# rfm.py\nlog = logging.getLogger(__name__)\n# cli.py -> main()\nlogging.basicConfig(level=ayar.log_seviye)', why='Kütüphane modülü loglamayı yapılandırırsa, onu içe aktaran her uygulamanın log ayarını ezer. Modüller yalnız logger alır; yapılandırma giriş noktasında bir kez yapılır.')
]

write('/home/claude/py/v2/e8/proje-ileri.js', LID, 45, HTML, ex, faq, mistakes, 'teslim edilebilir proje katmanları')
