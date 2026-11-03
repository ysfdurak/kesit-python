#!/usr/bin/env python3
"""proje-etl dersini üretir: python3 uretec/p1/proje_etl.py. Sayılar gerçek web_events verisinden hesaplanır."""
import collections, logging, sqlite3, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emit import KOK, kodu, calistir, tahmin, mc, yaz
import etl_parcalar as P

ZINCIR = P.KAYNAK + '\n' + P.DOGRULA + '\n' + P.ISLE + '\n' + P.YUKLE + '\n' + P.FILIGRAN + '\n' + P.CALISTIR + '\n' + P.KALITE + '\n' + P.KANIT
ns, _ = calistir(ZINCIR)
partiler = ns['ham_partiler']()
GELEN = sum(v.count('\n') - 1 for v in partiler.values())
sayac = collections.Counter(); TEMIZ = 0; ilk_gun = '2024-10-01'
for p, m in partiler.items():
    t, r = ns['parti_isle'](p, m); TEMIZ += len(t); sayac.update(x['neden'] for x in r)
RED = sum(sayac.values())
ILK_T, ILK_R = ns['parti_isle'](ilk_gun, partiler[ilk_gun])
_log = logging.getLogger('uretec'); _log.addHandler(logging.NullHandler()); _log.propagate = False
con = sqlite3.connect(':memory:')
R1 = ns['calistir'](con, partiler, _log)
SATIR = con.execute('SELECT COUNT(*) FROM olay').fetchone()[0]
GEC = con.execute('SELECT COUNT(*) FROM olay WHERE gun < parti').fetchone()[0]
K = {s['ad']: s['deger'] for s in ns['kalite_testleri'](con)}
TUR = dict(con.execute('SELECT tur, COUNT(*) FROM olay GROUP BY tur').fetchall())
R2 = ns['calistir'](con, partiler, _log)
TEKRAR = R1['tekrar']
assert GELEN == SATIR + TEKRAR + RED and R2['eklenen'] == 0 and all(K[k] == 0 for k in K if k != 'huni_sirasi')
KANIT = ns['kanit']()
assert KANIT['ayni_sonuc'] and KANIT['kalite'] and KANIT['satir_ilk'] == SATIR == KANIT['satir_ikinci']
# zaman filigranı ne kadar kaybettirir (gün gün gelince)
_h = sqlite3.connect(':memory:')
_h.execute('CREATE TABLE o (k, t, z)')
import veri as _veri
_h.executemany('INSERT INTO o VALUES (?, ?, ?)', [(r['user_id'], r['event_type'], r['event_time']) for r in _veri.kayitlar('anadolu_market', 'web_events')])
HAM_HUNI = _h.execute("SELECT COUNT(*) FROM (SELECT k, MIN(CASE WHEN t = 'visit' THEN z END) AS a, MIN(CASE WHEN t = 'product_view' THEN z END) AS b FROM o GROUP BY k) WHERE b < a").fetchone()[0]
_b5 = sqlite3.connect(':memory:')
_ilk5 = dict(list(partiler.items())[:5])
SATIR5 = ns['calistir'](_b5, _ilk5, _log)['eklenen']
KAYIP_KOD = ZINCIR + r'''
def artimli_calistir(con, partiler):
    sema_kur(con)
    son = con.execute("SELECT MAX(zaman) FROM olay").fetchone()[0] or ""
    for parti in sorted(partiler):
        temiz, red = parti_isle(parti, partiler[parti])
        yeni = [s for s in temiz if s["zaman"] > son]
        with con:
            yukle(con, yeni, red)
_c = sqlite3.connect(":memory:"); _b = {}
_p = ham_partiler()
for _k in sorted(_p):
    _b[_k] = _p[_k]
    artimli_calistir(_c, _b)
KAYIP = _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0]
'''
ns2, _ = calistir(KAYIP_KOD)
ZAMAN_SATIR = ns2['KAYIP']; KAYIP = SATIR - ZAMAN_SATIR
assert KAYIP > 0
print(dict(GELEN=GELEN, TEMIZ=TEMIZ, RED=RED, sayac=dict(sayac), SATIR=SATIR, TEKRAR=TEKRAR, GEC=GEC, K=K, R2=R2, KAYIP=KAYIP, ZAMAN_SATIR=ZAMAN_SATIR, TUR=TUR, ILK=(len(ILK_T), len(ILK_R)), KANIT=KANIT))

NULL_LOG = 'import logging\n_L = logging.getLogger("etl.test")\n_L.handlers[:] = [logging.NullHandler()]\n_L.propagate = False\n'
STUB_DOGRULA = 'ADIMLAR = {"visit": 1, "product_view": 2, "add_to_cart": 3, "checkout": 4, "purchase": 5}\nCIHAZLAR = {"mobile", "desktop"}\n\ndef satir_dogrula(ham):\n    # (temiz_sozluk, None) ya da (None, neden) döndür\n    pass\n'
BASLA1 = P.KAYNAK + '\n# Senin kodun\n' + STUB_DOGRULA
BASLA2 = P.KAYNAK + '\n' + P.DOGRULA + '\n# Senin kodun\ndef parti_isle(parti, metin):\n    # (temiz, red) döndür\n    pass\n'
BASLA3 = P.KAYNAK + '\n' + P.DOGRULA + '\n' + P.ISLE + '\n# Senin kodun\nimport sqlite3\n\ndef sema_kur(con):\n    pass\n\ndef yukle(con, temiz, red):\n    # {"eklenen": ..., "tekrar": ..., "red": ...} döndür\n    pass\n'
HAZIR4 = P.KAYNAK + '\n' + P.DOGRULA + '\n' + P.ISLE + '\n' + P.YUKLE
BASLA4 = HAZIR4 + '''
def filigran_kur(con):
    con.execute("CREATE TABLE IF NOT EXISTS filigran (tablo TEXT PRIMARY KEY, son_parti TEXT NOT NULL)")

def filigran_oku(con):
    r = con.execute("SELECT son_parti FROM filigran WHERE tablo = 'olay'").fetchone()
    return r[0] if r else None

# Senin kodun
def filigran_yaz(con, parti):
    pass

def bekleyen_partiler(con, tumu, geri_bakis=2):
    pass
'''
HAZIR5 = HAZIR4 + '\n' + P.FILIGRAN
GUNLUK_KUR = P.CALISTIR[:P.CALISTIR.index('def calistir')]
BASLA5 = HAZIR5 + '\n' + GUNLUK_KUR + '# Senin kodun\ndef calistir(con, partiler, log, geri_bakis=2):\n    pass\n'
HAZIR6 = HAZIR5 + '\n' + P.CALISTIR
BASLA6 = HAZIR6 + '\n# Senin kodun\ndef kalite_testleri(con):\n    # {"ad", "tur", "deger", "gecti"} sözlüklerinden oluşan liste döndür\n    return []\n\ndef kalite_gecti(sonuc):\n    pass\n'
BUG1 = HAZIR5 + r'''
# Bu sürüm hatalı: gün gün çalışınca satır kaybediyor
def artimli_calistir(con, partiler):
    sema_kur(con); filigran_kur(con)
    son = con.execute("SELECT MAX(zaman) FROM olay").fetchone()[0] or ""
    for parti in sorted(partiler):
        temiz, red = parti_isle(parti, partiler[parti])
        yeni = [s for s in temiz if s["zaman"] > son]
        with con:
            yukle(con, yeni, red)
'''
BUG1_SOL = HAZIR5 + r'''
def artimli_calistir(con, partiler):
    sema_kur(con); filigran_kur(con)
    for parti in bekleyen_partiler(con, partiler):
        temiz, red = parti_isle(parti, partiler[parti])
        with con:
            yukle(con, temiz, red)
            filigran_yaz(con, parti)
'''
BUG2 = HAZIR5 + r'''
# Bu sürüm hatalı: yarıda kesilince yarım iş bırakıyor
def parti_yukle(con, parti, metin):
    filigran_yaz(con, parti)
    con.commit()
    temiz, red = parti_isle(parti, metin)
    s = yukle(con, temiz, red)
    con.commit()
    return s
'''
BUG2_SOL = HAZIR5 + r'''
def parti_yukle(con, parti, metin):
    temiz, red = parti_isle(parti, metin)
    with con:
        s = yukle(con, temiz, red)
        filigran_yaz(con, parti)
    return s
'''
HAZIR9 = HAZIR6 + '\n' + P.KALITE
KANIT_STUB = '''
# Senin kodun
import hashlib

def parmak_izi(con):
    # olay tablosunun doğal anahtarlarını sıralı gezip sha256 özeti döndür
    pass

def kanit():
    # {"satir_ilk", "satir_ikinci", "ikinci_eklenen", "ikinci_islenen", "ayni_sonuc", "kalite", "red"} döndür
    pass
'''
KANIT_SOL = P.KANIT

ERK = NULL_LOG

ex = [
 mc('Aynı parti dosyası yanlışlıkla ikinci kez geldi. Yüklemenin idempotent olması bu durumda ne demektir?',
    'İkinci çalıştırma sonucu değiştirmez', ['İkinci dosya hata verip iş tamamen durur', 'Tablo silinir ve her şey baştan yüklenir', 'Dosya yalnızca bir kez okunabilir hâle gelir'],
    'İdempotent işlem kaç kez çalışırsa çalışsın aynı sonucu bırakır. Yeniden çalıştırma hata değil, olağan işletimdir: ağ kesilir, iş yarıda kalır, kaynak dosyayı yeniden gönderir.', a=2),
 mc('Filigranı (watermark) neden olay zamanına değil parti tarihine bağlıyoruz?',
    'Geç gelen satır olay zamanı filtresine takılıp kaybolur', ['Parti tarihi metin olduğu için karşılaştırması çok daha hızlı çalışır', 'Olay zamanı SQLite içinde metin olarak saklanamaz ve sıralanamaz', 'İkisi aynı sonucu verir, seçim yalnızca zevk ve alışkanlık meselesidir'],
    'Kaynak bir olayı iki gün gecikmeyle gönderebilir. Olay zamanı son görülenden eski olduğu için "yalnız yeniyi al" filtresi onu sessizce kaybeder. Parti tarihi ise verinin bize ulaştığı anı anlatır.', a=1),
 mc('Bir satırda kullanıcı numarası boş geldi. Doğru davranış hangisi?',
    'Nedeniyle ayır, işe devam et, sayıyı raporla', ['Tüm partiyi iptal et ve sabah birinin bakmasını bekle', 'Satırı sessizce atla, kimse fark etmesin', 'Kullanıcı numarasına 0 yazıp olay tablosuna ekle'],
    'Tek bozuk satır bütün işi durdurmamalı, ama izsiz de kaybolmamalı. Reddedilen tablosu hem denetim izidir hem de kaynak ekibine geri bildirimdir. Uydurma değer yazmak ise raporu sessizce bozar.', a=0),
 tahmin('Aynı anahtarla iki kez yükleme. Bu kod ne yazdırır?', '''import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE a (no INTEGER, tur TEXT)")
con.execute("CREATE TABLE b (no INTEGER, tur TEXT, UNIQUE (no, tur))")
satirlar = [(1, "visit"), (2, "visit"), (1, "visit")]
for _ in range(2):
    con.executemany("INSERT INTO a VALUES (?, ?)", satirlar)
    con.executemany("INSERT INTO b VALUES (?, ?) ON CONFLICT DO NOTHING", satirlar)
print(con.execute("SELECT COUNT(*) FROM a").fetchone()[0], con.execute("SELECT COUNT(*) FROM b").fetchone()[0])
''', ['3 2', '6 6', '2 2'], 'a tablosunda kısıt yok: iki turda 6 satır birikir. b tablosunda UNIQUE kısıtı ve ON CONFLICT DO NOTHING var: yinelenenler sessizce atlanır, 2 satır kalır.', needs=['sqlite3'], a=1),
 tahmin('Olay zamanına bakan filigran. Bu kod ne yazdırır?', '''olaylar = [("10-01", "10-01 09:00"), ("10-01", "10-01 18:00"), ("10-02", "10-02 08:00"), ("10-03", "10-01 12:00"), ("10-03", "10-03 07:00")]
tablo, son = [], ""
for parti in ["10-01", "10-02", "10-03"]:
    gelen = [z for p, z in olaylar if p == parti]
    yeni = [z for z in gelen if z > son]
    tablo += yeni
    son = max(tablo)
print(len(olaylar), len(tablo))
''', ['5 5', '4 5', '5 3'], 'Üçüncü partide gelen "10-01 12:00" olayı geç gelmiştir. Filigran o anda "10-02 08:00" olduğu için filtreye takılır ve kaybolur. Hata mesajı yoktur; yalnız rapor eksik kalır.', a=2),
 tahmin('Sayım mutabakatı. Bu kod ne yazdırır?', '''gunluk = [("10-01", 40, 37, 2, 1), ("10-02", 55, 50, 3, 2), ("10-03", 30, 28, 0, 1)]
for parti, gelen, eklenen, tekrar, red in gunluk:
    fark = gelen - (eklenen + tekrar + red)
    if fark:
        print(parti, fark)
print(sum(g[2] for g in gunluk))
''', ['10-03 -1\n115', '115', '10-02 1\n115'], 'Her partide gelen satır ya eklenir, ya tekrar sayılır, ya reddedilir. 10-03 için 30 ≠ 28 + 0 + 1; bir satır hiçbir yerde görünmüyor. Mutabakat bu kaybı yakalar.', a=0),
 dict(t='order', plain=True, stage='Kodu oku', q='<p>Bir partiyi güvenle işleyen adımları sırala.</p>',
      lines=['Ham CSV metnini satır satır oku', 'Her satırı doğrula, reddedilenleri nedeniyle ayır', 'Geçerli satırları dönüştür (tür, zaman, gün, huni adımı)', 'İşlemi aç: satırları doğal anahtarla yükle, reddedilenleri yaz', 'Çalışma günlüğüne sayıları ve filigranı aynı işleme yaz', 'İşlemi onayla (commit), sonra günlüğe bilgi satırı bas'],
      why='Filigran, verinin kendisiyle aynı işlemde ilerlemeli. Önce filigranı yazıp sonra çökersen o parti "yüklendi" görünür ama tabloda yoktur.'),
 dict(t='code', id='proje-etl-1', stage='Rehberli', diff=2,
      q='<p><b>Adım 1: doğrula ve temizle.</b> <code>ham_partiler()</code> hazır. <code>satir_dogrula(ham)</code> yaz; <code>ham</code> metin değerli bir sözlüktür. Kurallar bu sırayla denetlenir, ilk ihlal neden olarak döner:</p><ul><li><code>user_id</code> boşluksuz hâli pozitif tam sayı değilse <code>"kullanici_gecersiz"</code></li><li><code>event_type</code> boşluğu kırpılıp küçük harfe çevrilince <code>ADIMLAR</code> içinde değilse <code>"tur_gecersiz"</code></li><li><code>event_time</code> <code>%Y-%m-%d %H:%M:%S</code> ya da <code>%d.%m.%Y %H:%M:%S</code> biçiminde gerçek bir tarih değilse <code>"zaman_gecersiz"</code></li><li><code>device</code> kırpılıp küçük harfe çevrilince <code>CIHAZLAR</code> içinde değilse <code>"cihaz_gecersiz"</code></li></ul><p>Geçerliyse <code>({"kaynak_id": int, "kullanici": int, "tur": str, "zaman": "YYYY-AA-GG SS:DD:SS", "cihaz": str}, None)</code>, değilse <code>(None, neden)</code> döndür.</p>',
      guide=['Değeri önce kırp: (ham.get("user_id") or "").strip(). isdigit() boş metinde False verir.', 'İki biçimi döngüyle dene; ValueError yakalanınca sıradakine geç.', 'Hiçbiri tutmadıysa zaman None kalır: nedeni döndür.', 'Zamanı tek biçime strftime ile yaz; sonraki adımlar metin karşılaştırması yapacak.'],
      example='from datetime import datetime\nfor m in ["2024-10-21 03:11:25", "21.10.2024 03:11:25", "2024-13-21 03:11:25"]:\n    for b in ("%Y-%m-%d %H:%M:%S", "%d.%m.%Y %H:%M:%S"):\n        try:\n            print(datetime.strptime(m, b).strftime("%Y-%m-%d %H:%M:%S"))\n            break\n        except ValueError:\n            pass\n    else:\n        print("geçersiz", m)\n',
      start=BASLA1, sol=P.KAYNAK + '\n' + P.DOGRULA,
      tests=f'''_iyi = {{"event_id": "7", "user_id": " 12 ", "event_type": " VISIT ", "event_time": "21.10.2024 03:11:25", "device": "Mobile "}}
_s = satir_dogrula(_iyi)
assert isinstance(_s, tuple) and len(_s) == 2, "(temiz, neden) demeti döndürmelisin"
assert _s == ({{"kaynak_id": 7, "kullanici": 12, "tur": "visit", "zaman": "2024-10-21 03:11:25", "cihaz": "mobile"}}, None), "Temiz satır yanlış: " + repr(_s)
_t = dict(_iyi, event_time="2024-10-21 03:11:25")
assert satir_dogrula(dict(_t, user_id=""))[1] == "kullanici_gecersiz", "Boş kullanıcı reddedilmeli"
assert satir_dogrula(dict(_t, user_id="-3"))[1] == "kullanici_gecersiz", "Negatif kullanıcı reddedilmeli"
assert satir_dogrula(dict(_t, user_id="0"))[1] == "kullanici_gecersiz", "0 pozitif değil"
assert satir_dogrula(dict(_t, event_type="sayfa"))[1] == "tur_gecersiz"
assert satir_dogrula(dict(_t, event_time="2024-13-21 03:11:25"))[1] == "zaman_gecersiz", "13. ay gerçek bir tarih değil"
assert satir_dogrula(dict(_t, event_time="31.02.2024 03:11:25"))[1] == "zaman_gecersiz", "31 Şubat gerçek bir tarih değil"
assert satir_dogrula(dict(_t, device="buzdolabi"))[1] == "cihaz_gecersiz"
assert satir_dogrula(dict(_t, user_id="", event_type="x"))[1] == "kullanici_gecersiz", "Kurallar sırayla denetlenmeli"
from collections import Counter
_c = Counter()
for _p, _m in ham_partiler().items():
    for _r in csv.DictReader(io.StringIO(_m)):
        _c[satir_dogrula(_r)[1]] += 1
assert _c == {dict(collections.Counter({None: TEMIZ}, **sayac))!r}, "Gerçek veride sayılar farklı: " + repr(dict(_c))
''',
      hints=['Kural sırası testte denetlenir; önce kullanıcı, sonra tür, zaman ve cihaz.', 'isdigit() negatif sayıda False verir; 0 için ayrıca int(kul) &lt;= 0 denetle.'],
      why=f'Gerçek veride {GELEN} satırın {TEMIZ} tanesi geçer, {RED} tanesi reddedilir. Biçim farkları (büyük harf, başka tarih biçimi) düzeltilir; anlamı olmayan satır uydurulmaz, ayrılır.'),
 dict(t='code', id='proje-etl-2', stage='Rehberli', diff=2,
      q='<p><b>Adım 2: partiyi işle ve dönüştür.</b> <code>parti_isle(parti, metin)</code> yaz. <code>metin</code> başlık satırlı CSV metnidir. <code>(temiz, red)</code> döndür:</p><ul><li>Satırları <code>csv.DictReader</code> ile oku, 1\'den başlayarak numaralandır.</li><li>Geçerli satırın gününü <code>zaman[:10]</code> ile bul. Gün partiden büyükse (gelecekten gelen olay) neden <code>"gelecek_tarih"</code> olur ve reddedilir.</li><li>Geçerli satıra <code>gun</code>, <code>adim</code> (<code>ADIMLAR[tur]</code>) ve <code>parti</code> ekle.</li><li>Reddedilen her satır: <code>{"parti", "satir", "neden", "ham"}</code>; <code>ham</code>, <code>SUTUNLAR</code> sırasıyla değerlerin virgülle birleşmiş hâlidir.</li></ul>',
      guide=['enumerate(csv.DictReader(io.StringIO(metin)), 1)', 'satir, neden = satir_dogrula(ham)', 'Metin karşılaştırması ISO tarihlerde doğru çalışır: satir["zaman"][:10] > parti', 'satir.update(gun=..., adim=..., parti=...)'],
      start=BASLA2, sol=P.KAYNAK + '\n' + P.DOGRULA + '\n' + P.ISLE,
      tests=f'''_m = "event_id,user_id,event_type,event_time,device\\n1,5,visit,2024-10-02 10:00:00,mobile\\n2,,visit,2024-10-02 10:00:00,mobile\\n3,6, CHECKOUT ,01.10.2024 09:00:00,desktop\\n4,7,visit,2024-10-03 00:00:01,mobile\\n"
_t, _r = parti_isle("2024-10-02", _m)
assert len(_t) == 2 and len(_r) == 2, f"2 temiz, 2 red beklenir: {{len(_t)}}, {{len(_r)}}"
assert _t[0] == {{"kaynak_id": 1, "kullanici": 5, "tur": "visit", "zaman": "2024-10-02 10:00:00", "cihaz": "mobile", "gun": "2024-10-02", "adim": 1, "parti": "2024-10-02"}}, repr(_t[0])
assert _t[1]["gun"] == "2024-10-01" and _t[1]["adim"] == 4 and _t[1]["parti"] == "2024-10-02", "Geç gelen satırın günü olay günü, partisi geldiği gün olmalı"
assert _r[0] == {{"parti": "2024-10-02", "satir": 2, "neden": "kullanici_gecersiz", "ham": "2,,visit,2024-10-02 10:00:00,mobile"}}, repr(_r[0])
assert _r[1]["neden"] == "gelecek_tarih" and _r[1]["satir"] == 4, "Parti gününden ileri tarihli olay reddedilmeli"
_top_t = _top_r = 0
for _p, _x in ham_partiler().items():
    _a, _b = parti_isle(_p, _x)
    _top_t += len(_a); _top_r += len(_b)
assert (_top_t, _top_r) == ({TEMIZ}, {RED}), f"Gerçek veride {TEMIZ} temiz, {RED} red beklenir: {{_top_t}}, {{_top_r}}"
_i = parti_isle("{ilk_gun}", ham_partiler()["{ilk_gun}"])
assert (len(_i[0]), len(_i[1])) == ({len(ILK_T)}, {len(ILK_R)}), "İlk parti sayıları farklı"
''',
      hints=['satir_dogrula geçerli bir sözlük döndürse bile gelecek tarih kontrolü onu reddedebilir.', 'ham değerleri None olabilir: ham[k] or "".'],
      why='Olayın günü ile partinin günü iki ayrı bilgidir. İkisini de saklamak geç gelen veriyi görünür kılar: <code>gun &lt; parti</code> olan satırlar geç gelmiştir.'),
 dict(t='code', id='proje-etl-3', stage='Kendin yaz', diff=3, needs=['sqlite3'],
      q='<p><b>Adım 3: idempotent yükle.</b> İki fonksiyon yaz.</p><p><code>sema_kur(con)</code>: yoksa iki tablo oluştursun. <code>olay(kaynak_id, kullanici, tur, zaman, cihaz, gun, adim, parti)</code> tablosunda doğal anahtar <code>(kullanici, tur, zaman, cihaz)</code> üzerinde <code>UNIQUE</code> kısıtı olsun. <code>reddedilen(parti, satir, neden, ham)</code> tablosunda birincil anahtar <code>(parti, satir)</code> olsun.</p><p><code>yukle(con, temiz, red)</code>: satırları yinelenende hata vermeyecek biçimde yazsın ve <code>{"eklenen": n, "tekrar": n, "red": n}</code> döndürsün. <code>tekrar</code>, gelip de eklenmeyen temiz satır sayısıdır. Commit yapma; işlemi çağıran yönetir.</p><p>Neden <code>event_id</code> anahtar olamaz? Çünkü veride aynı olay iki kez gönderilmiş, ama <code>event_id</code> değerleri farklı.</p>',
      start=BASLA3, sol=HAZIR4,
      tests=f'''import sqlite3
_c = sqlite3.connect(":memory:")
sema_kur(_c); sema_kur(_c)
_t, _r = parti_isle("{ilk_gun}", ham_partiler()["{ilk_gun}"])
_a = yukle(_c, _t, _r)
assert _a == {{"eklenen": {len(ILK_T)}, "tekrar": 0, "red": {len(ILK_R)}}}, "İlk yükleme: " + repr(_a)
_b = yukle(_c, _t, _r)
assert _b == {{"eklenen": 0, "tekrar": {len(ILK_T)}, "red": {len(ILK_R)}}}, "İkinci yüklemede hiç satır eklenmemeli: " + repr(_b)
assert _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0] == {len(ILK_T)}, "Tablo iki kez yüklemede büyümemeli"
assert _c.execute("SELECT COUNT(*) FROM reddedilen").fetchone()[0] == {len(ILK_R)}, "Reddedilenler de çiftlenmemeli"
_k = dict(_t[0]); _k["kaynak_id"] = 999999
try:
    _c.execute("INSERT INTO olay (kaynak_id, kullanici, tur, zaman, cihaz, gun, adim, parti) VALUES (:kaynak_id, :kullanici, :tur, :zaman, :cihaz, :gun, :adim, :parti)", _k)
    assert False, "Doğal anahtar UNIQUE değil: aynı olay farklı kaynak_id ile girebildi"
except sqlite3.IntegrityError:
    pass
_c2 = sqlite3.connect(":memory:"); sema_kur(_c2)
_top = {{"eklenen": 0, "tekrar": 0, "red": 0}}
for _p, _m in sorted(ham_partiler().items()):
    _x, _y = parti_isle(_p, _m)
    for _k2, _v in yukle(_c2, _x, _y).items():
        _top[_k2] += _v
assert _top == {{"eklenen": {SATIR}, "tekrar": {TEKRAR}, "red": {RED}}}, "Gerçek toplamlar farklı: " + repr(_top)
''',
      hints=['INSERT ... ON CONFLICT (kullanici, tur, zaman, cihaz) DO NOTHING', 'Eklenen sayısı için önce ve sonra con.total_changes farkını al; executemany rowcount\'una güvenme.', 'reddedilen için de ON CONFLICT (parti, satir) DO NOTHING.'],
      why=f'Veride {TEKRAR} olay iki kez gönderilmiş. Kısıt veritabanında olduğu için hangi kod yolundan gelirse gelsin çift satır giremez. Python tarafında "gördüklerim" kümesi tutmak bir sonraki çalıştırmada işe yaramazdı.'),
 dict(t='code', id='proje-etl-4', stage='Kendin yaz', diff=2, needs=['sqlite3'],
      q='<p><b>Adım 4: artımlı yükleme için filigran.</b> <code>filigran_kur</code> ve <code>filigran_oku</code> hazır. İki fonksiyon yaz.</p><p><code>filigran_yaz(con, parti)</code>: <code>olay</code> kaydındaki <code>son_parti</code> değerini günceller, ama asla geri götürmez (eski parti yeniden işlense de filigran düşmez).</p><p><code>bekleyen_partiler(con, tumu, geri_bakis=2)</code>: filigran yoksa tüm partileri, varsa yalnız <code>filigran - geri_bakis gün</code> tarihinden sonraki partileri sıralı liste olarak döndürür. Örnek: filigran <code>2024-10-05</code>, <code>geri_bakis=2</code> ise <code>2024-10-04</code> ve sonrası işlenir. Geri bakış, kaynağın son günleri yeniden göndermesine karşı güvenlik payıdır; idempotent yükleme sayesinde zararsızdır.</p>',
      start=BASLA4, sol=HAZIR5,
      tests='''import sqlite3
_c = sqlite3.connect(":memory:"); filigran_kur(_c)
_g = ["2024-10-03", "2024-10-01", "2024-10-02", "2024-10-04", "2024-10-05", "2024-10-06"]
assert bekleyen_partiler(_c, _g) == sorted(_g), "Filigran yokken hepsi, sıralı gelmeli"
filigran_yaz(_c, "2024-10-05")
assert filigran_oku(_c) == "2024-10-05", "Filigran yazılmadı"
assert bekleyen_partiler(_c, _g) == ["2024-10-04", "2024-10-05", "2024-10-06"], repr(bekleyen_partiler(_c, _g))
assert bekleyen_partiler(_c, _g, geri_bakis=0) == ["2024-10-06"], "geri_bakis=0 yalnız yenileri verir"
assert bekleyen_partiler(_c, _g, geri_bakis=4) == ["2024-10-02", "2024-10-03", "2024-10-04", "2024-10-05", "2024-10-06"]
filigran_yaz(_c, "2024-10-02")
assert filigran_oku(_c) == "2024-10-05", "Eski parti filigranı geri götürmemeli"
filigran_yaz(_c, "2024-10-06")
assert filigran_oku(_c) == "2024-10-06", "Yeni parti filigranı ilerletmeli"
assert _c.execute("SELECT COUNT(*) FROM filigran").fetchone()[0] == 1, "Tek satır kalmalı"
_c.execute("DELETE FROM filigran"); filigran_yaz(_c, "2024-11-01")
assert bekleyen_partiler(_c, ["2024-10-30", "2024-10-31", "2024-11-01", "2024-11-02"]) == ["2024-10-31", "2024-11-01", "2024-11-02"], "Ay geçişinde tarih hesabı yap, metin kesme"
''',
      hints=['ON CONFLICT (tablo) DO UPDATE SET son_parti = MAX(son_parti, excluded.son_parti)', 'date.fromisoformat(son) - timedelta(days=geri_bakis) ile alt sınırı bul, isoformat() ile metne çevir.'],
      why='Filigran "buraya kadar işledim" kaydıdır. Tek başına tam değildir: kaynak son günleri yeniden gönderebilir. Bu yüzden biraz geriye bakılır ve geri dönüşün zararsız olması idempotent yüklemeye dayanır.'),
 dict(t='code', id='proje-etl-5', stage='Kendin yaz', diff=3, needs=['sqlite3'],
      q='<p><b>Adım 5: işi yöneten fonksiyon ve günlük.</b> <code>calistir(con, partiler, log, geri_bakis=2)</code> yaz. <code>partiler</code>: <code>{parti: metin}</code>.</p><ol><li>Tabloları kur (<code>sema_kur</code>, <code>filigran_kur</code>, <code>gunluk_kur</code>). Çalışma numarası: <code>calisma_gunlugu</code> içindeki en büyük <code>calisma</code> + 1.</li><li><code>bekleyen_partiler</code> sırasıyla her parti için tek işlem aç (<code>with con:</code>): işle, yükle, <code>calisma_gunlugu</code>\'na <code>(calisma, parti, gelen, eklenen, tekrar, red)</code> yaz, filigranı yaz.</li><li>Başarılı parti sonrası <code>log.info</code>; reddedilen varsa ayrıca <code>log.warning</code>.</li><li>Bir partide hata çıkarsa o işlem geri alınsın, <code>log.error</code> yazılsın ve iş dursun; önceki partiler kalsın.</li></ol><p>Dönüş: <code>{"calisma", "islenen", "eklenen", "tekrar", "red", "durum": "tamam"|"hata", "hatali_parti": None|parti}</code>.</p>',
      start=BASLA5, sol=HAZIR6,
      tests=NULL_LOG + f'''import sqlite3
class _Liste(logging.Handler):
    def __init__(self):
        super().__init__(); self.k = []
    def emit(self, r):
        self.k.append(r.levelname)
_h = _Liste(); _L.addHandler(_h); _L.setLevel(logging.INFO)
_P = ham_partiler()
_c = sqlite3.connect(":memory:")
_r1 = calistir(_c, _P, _L)
assert _r1 == {{"calisma": 1, "islenen": 60, "eklenen": {SATIR}, "tekrar": {TEKRAR}, "red": {RED}, "durum": "tamam", "hatali_parti": None}}, "İlk çalıştırma: " + repr(_r1)
assert _c.execute("SELECT COUNT(*) FROM calisma_gunlugu").fetchone()[0] == 60, "Her parti için bir günlük satırı"
assert _c.execute("SELECT SUM(gelen) FROM calisma_gunlugu").fetchone()[0] == {GELEN}, "Gelen toplamı {GELEN} olmalı"
assert _h.k.count("INFO") == 60, "Her başarılı partide bir log.info"
assert _h.k.count("WARNING") >= 1, "Reddedilen varsa log.warning yaz"
_r2 = calistir(_c, _P, _L)
assert _r2["calisma"] == 2 and _r2["eklenen"] == 0 and _r2["islenen"] == 2, "İkinci çalıştırma yalnız geri bakış partilerini işler, satır eklemez: " + repr(_r2)
assert _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0] == {SATIR}, "İkinci çalıştırma satır çiftlememeli"
# hata enjeksiyonu: 2024-10-03 partisinde yükleme sonrası hata
_d = sqlite3.connect(":memory:")
_gercek_yaz = filigran_yaz
def filigran_yaz(con, parti):
    if parti == "2024-10-03":
        raise RuntimeError("disk doldu")
    _gercek_yaz(con, parti)
_h.k.clear()
_r3 = calistir(_d, _P, _L)
assert _r3["durum"] == "hata" and _r3["hatali_parti"] == "2024-10-03" and _r3["islenen"] == 2, "Hata raporlanmalı: " + repr(_r3)
assert "ERROR" in _h.k, "Hata log.error ile yazılmalı"
assert _d.execute("SELECT COUNT(*) FROM olay WHERE parti = '2024-10-03'").fetchone()[0] == 0, "Hatalı partinin satırları geri alınmalı"
assert _d.execute("SELECT COUNT(*) FROM calisma_gunlugu").fetchone()[0] == 2, "Hatalı partinin günlük satırı kalmamalı"
assert filigran_oku(_d) == "2024-10-02", "Filigran son başarılı partide kalmalı"
filigran_yaz = _gercek_yaz
_r4 = calistir(_d, _P, _L)
assert _r4["durum"] == "tamam" and _d.execute("SELECT COUNT(*) FROM olay").fetchone()[0] == {SATIR}, "Yeniden çalışınca kaldığı yerden tamamlamalı"
''',
      hints=['try: ile with con: bloğunu sar; istisna bloğu terk edince sqlite3 geri alır.', 'Log yazmayı işlem bittikten sonra yap: geri alınan parti için "başarılı" yazmamalısın.', 'gelen = len(temiz) + len(red).'],
      why='Parti başına tek işlem, sistemi iki temiz durumdan birinde bırakır: parti tamamen yüklü ve filigran ilerledi ya da hiç dokunulmadı. Yeniden çalıştırma her zaman güvenlidir.'),
 dict(t='code', id='proje-etl-6', stage='Kendin yaz', diff=3, needs=['sqlite3'],
      q='<p><b>Adım 6: kalite testleri.</b> <code>kalite_testleri(con)</code> şu sözlüklerin listesini döndürsün: <code>{"ad", "tur", "deger", "gecti"}</code>. <code>deger</code> ihlal sayısıdır, <code>gecti</code> değer 0 ise <code>True</code>.</p><div class="tbl-wrap"><table><tr><th>ad</th><th>tur</th><th>deger</th></tr><tr><td><code>satir_mutabakati</code></td><td>hata</td><td><code>gelen != eklenen + tekrar + red</code> olan günlük satırı sayısı</td></tr><tr><td><code>tablo_mutabakati</code></td><td>hata</td><td><code>olay</code> satır sayısı ile günlükteki <code>eklenen</code> toplamının mutlak farkı</td></tr><tr><td><code>anahtar_tekil</code></td><td>hata</td><td>doğal anahtarı birden çok satırda geçen grup sayısı</td></tr><tr><td><code>tur_gecerli</code></td><td>hata</td><td>tanınmayan <code>tur</code> değerli satır sayısı</td></tr><tr><td><code>gun_tutarli</code></td><td>hata</td><td><code>gun</code>, <code>zaman</code>\'ın ilk 10 karakterinden farklı ya da <code>parti</code>\'den büyük satır sayısı</td></tr><tr><td><code>kesintisiz_gun</code></td><td>hata</td><td>en küçük ve en büyük <code>gun</code> arasında hiç satırı olmayan gün sayısı</td></tr><tr><td><code>huni_sirasi</code></td><td>uyari</td><td>ilk <code>product_view</code> zamanı ilk <code>visit</code> zamanından önce olan kullanıcı sayısı</td></tr></table></div><p><code>kalite_gecti(sonuc)</code>: yalnız <code>hata</code> türündekilerin hepsi geçtiyse <code>True</code>.</p>',
      start=BASLA6, sol=HAZIR9,
      tests=NULL_LOG + f'''import sqlite3
_P = ham_partiler()
def _yeni():
    c = sqlite3.connect(":memory:"); calistir(c, _P, _L); return c
def _d(c):
    return {{s["ad"]: s for s in kalite_testleri(c)}}
_c = _yeni(); _s = _d(_c)
_adlar = {{"satir_mutabakati", "tablo_mutabakati", "anahtar_tekil", "tur_gecerli", "gun_tutarli", "kesintisiz_gun", "huni_sirasi"}}
assert set(_s) == _adlar, "Test adları eksik ya da yanlış: " + repr(sorted(_s))
for _a in _adlar - {{"huni_sirasi"}}:
    assert _s[_a]["deger"] == 0 and _s[_a]["gecti"] is True and _s[_a]["tur"] == "hata", _a + " temiz veride geçmeli: " + repr(_s[_a])
assert _s["huni_sirasi"]["tur"] == "uyari" and _s["huni_sirasi"]["deger"] == {K['huni_sirasi']} and _s["huni_sirasi"]["gecti"] is False, "Huni uyarısı {K['huni_sirasi']} kullanıcı olmalı: " + repr(_s["huni_sirasi"])
assert kalite_gecti(kalite_testleri(_c)) is True, "Uyarı kaliteyi düşürmemeli"
_c = _yeni(); _c.execute("UPDATE calisma_gunlugu SET gelen = gelen + 1 WHERE parti = '2024-10-05'"); _s = _d(_c)
assert _s["satir_mutabakati"]["deger"] == 1 and not kalite_gecti(list(_s.values())), "Sayım farkı yakalanmalı"
_c = _yeni(); _c.execute("DELETE FROM olay WHERE rowid IN (SELECT rowid FROM olay LIMIT 3)"); _s = _d(_c)
assert _s["tablo_mutabakati"]["deger"] == 3, "Kaybolan satırlar yakalanmalı"
_c = _yeni(); _c.execute("UPDATE olay SET tur = 'x' WHERE rowid = 1"); _s = _d(_c)
assert _s["tur_gecerli"]["deger"] == 1, "Tanınmayan tür yakalanmalı"
_c = _yeni(); _c.execute("UPDATE olay SET gun = '2099-01-01' WHERE rowid = 1"); _s = _d(_c)
assert _s["gun_tutarli"]["deger"] == 1, "Tutarsız gün yakalanmalı"
_c = _yeni(); _c.execute("DELETE FROM olay WHERE gun = '2024-10-10'"); _s = _d(_c)
assert _s["kesintisiz_gun"]["deger"] == 1, "Boş gün yakalanmalı"
_c = sqlite3.connect(":memory:")
_c.executescript("CREATE TABLE olay (kaynak_id, kullanici, tur, zaman, cihaz, gun, adim, parti); CREATE TABLE calisma_gunlugu (calisma, parti, gelen, eklenen, tekrar, red); CREATE TABLE reddedilen (parti, satir, neden, ham);")
_c.executemany("INSERT INTO olay VALUES (?,?,?,?,?,?,?,?)", [(1, 5, "visit", "2024-10-01 10:00:00", "mobile", "2024-10-01", 1, "2024-10-01")] * 2)
_c.execute("INSERT INTO calisma_gunlugu VALUES (1, '2024-10-01', 2, 2, 0, 0)")
assert _d(_c)["anahtar_tekil"]["deger"] == 1, "Çift satır yakalanmalı"
''',
      hints=['Her testi tek değer döndüren bir sorgu olarak yaz: tek = lambda q: con.execute(q).fetchone()[0].', 'Çift grup: SELECT COUNT(*) FROM (SELECT 1 FROM olay GROUP BY kullanici, tur, zaman, cihaz HAVING COUNT(*) > 1)', 'Eksik gün: (son gün - ilk gün).days + 1 - farklı gün sayısı.', 'İlk zamanlar: MIN(CASE WHEN tur = \'visit\' THEN zaman END).'],
      why=f'Kalite testi temiz veride geçtiğini değil, bozulmayı yakaladığını göstermelidir; test bu yüzden veriyi bilerek bozar. Huni sırası hata değil uyarıdır: ham tabloda {HAM_HUNI} kullanıcıda ürün görüntüleme ilk ziyaretten önce görünür, burada {K["huni_sirasi"]}, çünkü reddedilen satırlar bazı kullanıcıların sırasını değiştirir. Saat kayması bir açıklamadır, kesin neden değil. Kayıt silinmez, sayılır ve raporlanır.'),
 dict(t='code', id='proje-etl-7', stage='Hata avı', kind='bug', diff=2, needs=['sqlite3'],
      q=f'<p><b>Hatayı bul ve düzelt.</b> <code>artimli_calistir(con, partiler)</code> tek seferde çalıştırılınca doğru, gün gün çalıştırılınca eksik satır bırakıyor: {SATIR} yerine {ZAMAN_SATIR}. Hata mesajı yok. Filigranı olay zamanından değil parti tarihinden okuyacak biçimde düzelt: <code>bekleyen_partiler</code> ile partileri seç, satırları filtrelemeden yükle, filigranı aynı işlemde ilerlet.</p>',
      start=BUG1, sol=BUG1_SOL,
      tests=f'''import sqlite3
_P = ham_partiler()
_c = sqlite3.connect(":memory:"); _b = {{}}
for _k in sorted(_P):
    _b[_k] = _P[_k]
    artimli_calistir(_c, _b)
_n = _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0]
assert _n == {SATIR}, f"Gün gün yüklemede {SATIR} satır beklenir, gelen: {{_n}}"
assert _c.execute("SELECT COUNT(*) FROM olay WHERE gun < parti").fetchone()[0] == {GEC}, "{GEC} geç gelen satır tabloda olmalı"
assert filigran_oku(_c) == "2024-11-29", "Filigran son partide olmalı"
artimli_calistir(_c, _P)
assert _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0] == {SATIR}, "Yeniden çalıştırma satır eklememeli"
''',
      hints=['MAX(zaman) son görülen olay zamanıdır; iki gün gecikmeli olay ondan eski kalır.', 'Filtre satırını kaldır: çift satırı zaten UNIQUE kısıtı engeller.'],
      why=f'{KAYIP} geç gelen olay sessizce kayboluyordu. Tek seferde yükleme testi bunu yakalamaz, çünkü filigran o anda hâlâ boştur. Gün gün çalıştırma testi bu yüzden gerekli.'),
 dict(t='code', id='proje-etl-8', stage='Hata avı', kind='bug', diff=2, needs=['sqlite3'],
      q='<p><b>Hatayı bul ve düzelt.</b> <code>parti_yukle(con, parti, metin)</code> yükleme sırasında çökerse parti eksik kalıyor ama filigran ilerlemiş görünüyor; ertesi gün o parti atlanıyor. Düzelt: yükleme ve filigran tek işlemde olsun, hata çıkarsa ikisi de geri alınsın, istisna yukarı gitsin. Dönüş değeri aynı kalsın.</p>',
      start=BUG2, sol=BUG2_SOL,
      tests=f'''import sqlite3
_P = ham_partiler()
_c = sqlite3.connect(":memory:"); sema_kur(_c); filigran_kur(_c)
_s = parti_yukle(_c, "2024-10-01", _P["2024-10-01"])
assert _s["eklenen"] == {len(ILK_T)} and filigran_oku(_c) == "2024-10-01", "Normal akış bozulmamalı: " + repr(_s)
_gercek = yukle
def yukle(con, temiz, red):
    _gercek(con, temiz, red)
    raise RuntimeError("bağlantı koptu")
_once = _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0]
try:
    parti_yukle(_c, "2024-10-02", _P["2024-10-02"])
    assert False, "İstisna yukarı gitmeli"
except RuntimeError:
    pass
assert filigran_oku(_c) == "2024-10-01", "Çöken parti filigranı ilerletmemeli"
assert _c.execute("SELECT COUNT(*) FROM olay").fetchone()[0] == _once, "Yarım yükleme geri alınmalı"
yukle = _gercek
parti_yukle(_c, "2024-10-02", _P["2024-10-02"])
assert filigran_oku(_c) == "2024-10-02", "Yeniden denemede başarmalı"
''',
      hints=['Filigranı yüklemeden sonra yaz.', 'with con: bloğu başarıda commit, istisnada rollback yapar; elle commit çağrılarını kaldır.'],
      why='Filigran bir vaattir: "buraya kadar tabloda var". Veriyle aynı işlemde yazılmazsa vaat tutulmaz ve kayıp hiçbir hata üretmez.'),
 dict(t='code', id='proje-etl-9', stage='Mini proje', diff=3, needs=['sqlite3'],
      q='<p><b>Son adım: kanıtla.</b> Tüm parçalar hazır. İki fonksiyon yaz.</p><p><code>parmak_izi(con)</code>: <code>olay</code> tablosundaki doğal anahtarları sıralı gezip <code>hashlib.sha256</code> ile tek bir özet metni döndürür.</p><p><code>kanit()</code>: üç şeyi gerçekten çalıştırır ve sözlük döndürür:</p><ol><li>Boş veritabanında <code>calistir</code>, satır sayısı <code>satir_ilk</code>.</li><li>Aynı veritabanında yine <code>calistir</code>: <code>satir_ikinci</code>, <code>ikinci_eklenen</code>, <code>ikinci_islenen</code>.</li><li>Başka boş veritabanında partiler gün gün eklenerek her gün <code>calistir</code>. İki veritabanının parmak izi aynı mı: <code>ayni_sonuc</code>.</li></ol><p>Ayrıca <code>kalite</code> (iki veritabanında da <code>kalite_gecti</code>) ve <code>red</code> (reddedilen satır sayısı).</p>',
      start=HAZIR9 + KANIT_STUB, sol=HAZIR9 + '\n' + KANIT_SOL,
      tests=f'''_s = kanit()
assert isinstance(_s, dict), "kanit() sözlük döndürmeli"
assert _s["satir_ilk"] == {SATIR}, "İlk yüklemede {SATIR} satır beklenir: " + repr(_s)
assert _s["satir_ikinci"] == {SATIR}, "İkinci çalıştırma satır sayısını değiştirmemeli: " + repr(_s)
assert _s["ikinci_eklenen"] == 0 and _s["ikinci_islenen"] == 2, "İkinci çalıştırmada 2 parti işlenir, 0 satır eklenir: " + repr(_s)
assert _s["ayni_sonuc"] is True, "Tek seferde ve gün gün yükleme aynı tabloyu vermeli"
assert _s["kalite"] is True, "Kalite testleri geçmeli"
assert _s["red"] == {RED}, "{RED} reddedilen satır beklenir"
import sqlite3
_a = sqlite3.connect(":memory:"); sema_kur(_a)
_b = sqlite3.connect(":memory:"); sema_kur(_b)
_q = "INSERT INTO olay VALUES (1, ?, 'visit', '2024-10-01 10:00:00', 'mobile', '2024-10-01', 1, '2024-10-01')"
_a.execute(_q, (1,)); _a.execute(_q, (2,)); _b.execute(_q, (2,)); _b.execute(_q, (1,))
assert parmak_izi(_a) == parmak_izi(_b), "Parmak izi satır sırasına bağlı olmamalı"
_b.execute(_q, (3,))
assert parmak_izi(_a) != parmak_izi(_b), "Farklı içerik farklı parmak izi vermeli"
assert isinstance(parmak_izi(_a), str)
_tum = ham_partiler
ham_partiler = lambda: dict(list(_tum().items())[:5])
_k = kanit()
ham_partiler = _tum
assert _k["satir_ilk"] == {SATIR5} and _k["satir_ikinci"] == {SATIR5}, "Sonuç sabit yazılmamalı: ilk 5 partide {SATIR5} satır beklenir, gelen: " + repr(_k)
''',
      hints=['ORDER BY 1, 2, 3, 4 ile sırala; her satırı repr(r).encode() ile özete ekle.', 'Log gürültüsünü kapat: log.handlers[:] = [logging.NullHandler()], log.propagate = False.', 'Gün gün çalıştırmada biriken sözlüğe her turda bir parti ekle.'],
      why='"Çift satır yok" cümlesi artık bir iddia değil, çalışan bir testtir. İki kez çalıştırma, gün gün çalıştırma ve kalite testleri aynı sonucu veriyor; mülakatta anlatacağın kısım budur.'),
]
ETL_YEREL = P.KAYNAK.replace('import veri\n', 'import sys\n').replace('veri.kayitlar("anadolu_market", "web_events")', 'csv.DictReader(open(sys.argv[1], encoding="utf-8"))').replace('n = r["event_id"]', 'n = int(r["event_id"])') + '\n' + P.DOGRULA + '\n' + P.ISLE + '\n' + P.YUKLE + '\n' + P.FILIGRAN + '\n' + P.CALISTIR + '\n' + P.KALITE + r'''
if __name__ == "__main__":
    logging.basicConfig(filename="etl.log", level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    con = sqlite3.connect("etl.sqlite3")
    rapor = calistir(con, ham_partiler(), logging.getLogger("etl"))
    print(rapor)
    print("satır:", con.execute("SELECT COUNT(*) FROM olay").fetchone()[0], "kalite:", kalite_gecti(kalite_testleri(con)))
    con.close()
'''
import subprocess, tempfile, shutil
with tempfile.TemporaryDirectory() as td:
    open(td + '/etl.py', 'w', encoding='utf-8').write(ETL_YEREL)
    y = [subprocess.run([sys.executable, 'etl.py', KOK + '/data/anadolu_market/web_events.csv'], cwd=td, capture_output=True, text=True, check=True).stdout for _ in range(2)]
    gunluk_ornek = open(td + '/etl.log', encoding='utf-8').read().splitlines()
    assert gunluk_ornek
YEREL_CIKTI = '\n'.join(y).strip()
print(YEREL_CIKTI)
ex.append(dict(t='local', id='proje-etl-yerel', stage='Kendi bilgisayarında',
   q='<p>Aynı boru hattını diskteki bir veritabanıyla bilgisayarında çalıştır. Burada veritabanı kapanınca silinmez; idempotent olduğunu gerçek bir dosyada görürsün.</p>',
   steps=['Veri setleri sayfasından Anadolu Market\'in <code>web_events.csv</code> dosyasını indir.', 'Aşağıdaki kodu aynı klasöre <code>etl.py</code> olarak kaydet. Yalnız standart kütüphane kullanır.', 'Komutu iki kez çalıştır. İkincisinde <code>eklenen</code> 0, satır sayısı aynı olmalı.', '<code>etl.log</code> dosyasını aç; her partinin kaydını gör. Sonra istersen bu betiği cron ya da Görev Zamanlayıcı ile her gece çalıştır.'],
   file=ETL_YEREL, fname='etl.py', cmd='python etl.py web_events.csv', expect=YEREL_CIKTI))

tr = lambda n: f'{n:,}'.replace(',', '.')
GOVDE = f'''
<h2>Proje: Anadolu Market web olayları için ETL</h2>
<p>Anadolu Market\'in analiz ekibi huni raporunu her sabah elle düzeltiyor: bazı günlerde aynı olay iki kez sayılıyor, sistem yeniden çalışınca rakamlar şişiyor, ertesi gün gelen eski olaylar rapora girmiyor. Senden her gece çalışacak bir veri işi istiyorlar: ham dosyayı alsın, bozuk satırı ayırsın, temiz satırı SQLite\'a yüklesin, aynı iş iki kez çalışsa da hiçbir şey çiftlenmesin ve sabah neyin olduğu görülebilsin.</p>
<p>Bu ders yeni kavramdan çok, Veri Mühendisi yolunda öğrendiklerini tek bir çalışan işe bağlar. <b>veri-boru-hatti</b> dersindeki parçaları gerçek veriyle ve kanıtıyla kuracaksın. Her adımda önceki adımın kodu hazır gelir; sonda sonucu testle kanıtlarsın.</p>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Soru</th><th>Çıktı</th></tr>
<tr><td>1. Doğrula</td><td>Bu satır işe yarar mı?</td><td><code>satir_dogrula</code></td></tr>
<tr><td>2. Dönüştür</td><td>Satırı tek biçime nasıl getiririm?</td><td><code>parti_isle</code></td></tr>
<tr><td>3. Yükle</td><td>İkinci yükleme ne yapar?</td><td><code>sema_kur</code>, <code>yukle</code></td></tr>
<tr><td>4. Artımlı</td><td>Neyi yeniden işlemem gerekir?</td><td><code>filigran_yaz</code>, <code>bekleyen_partiler</code></td></tr>
<tr><td>5. Yönet</td><td>Hata çıkarsa ne kalır?</td><td><code>calistir</code>, günlük</td></tr>
<tr><td>6. Sına</td><td>Sonuca nasıl güvenirim?</td><td><code>kalite_testleri</code></td></tr>
<tr><td>7. Kanıtla</td><td>İki kez çalışınca ne olur?</td><td><code>kanit</code></td></tr></table></div>
<h2>Ham veri: gerçek tablo, belgelenmiş bozulma</h2>
<p>Kaynak, <code>anadolu_market</code> setindeki <code>web_events</code> tablosu: {tr(GELEN)} olay, 60 gün. Bu tabloda iki gerçek kusur zaten var: {TEKRAR} olay iki kez gönderilmiş (farklı <code>event_id</code>, aynı kullanıcı, tür, zaman ve cihaz) ve bazı kullanıcıların istemci saati kaymış. Reddedilecek satır ise yok; bu yüzden <code>ham_partiler()</code> satırları günlük CSV dosyalarına bölerken numarası belli kurallara göre bozulmalar ekler. Bozulmaların kuralı kodda açıktır, rastgele değildir; yani sonuçlar her çalıştırmada aynıdır. Bu ekleme derse aittir, veri setinin kendisinde yoktur.</p>
<div class="tbl-wrap"><table><tr><th>Bozulma</th><th>Ne olur</th></tr>
<tr><td>Büyük harf ve boşluk, başka tarih biçimi</td><td>Düzeltilir, yüklenir</td></tr>
<tr><td>Boş kullanıcı, tanınmayan olay, 13. ay, tanınmayan cihaz</td><td>Nedeniyle reddedilir</td></tr>
<tr><td>Geç gelen olay</td><td>İki gün sonraki partide gelir, yüklenir</td></tr></table></div>
{kodu(P.KAYNAK + '''
partiler = ham_partiler()
print(len(partiler), "parti,", sum(m.count("\\n") - 1 for m in partiler.values()), "satır")
print(partiler["2024-10-01"][:170])
''')}
<h2>Doğrulama: düzeltilebilir olanla olmayanı ayır</h2>
<p>Doğrulamanın amacı satır atmak değil, karar vermektir. <code> VISIT </code> ile <code>visit</code> aynı şeydir: düzelt. Boş kullanıcı numarası düzeltilemez: uydurma, ayır. Reddedilen satırı nedeniyle bir tabloya yazmak, kaynak ekibine "şu satırlarınız şu sebeple gelmedi" diyebilmeni sağlar.</p>
<div class="warn"><b>Önce temizle, sonra tekrar ara</b>Tekrar denetimini temizlikten önce yaparsan <code>VISIT</code> ile <code>visit</code> farklı görünür ve çift satır kaçar. Bu yüzden doğal anahtar, dönüştürülmüş değerler üzerindedir.</div>
<h2>Doğal anahtar ve idempotent yükleme</h2>
<p>Akla ilk gelen anahtar <code>event_id</code>\'dir, ama burada yanlıştır: yinelenen olayların numaraları farklıdır. Anahtar, bir olayı olay yapan alanlardır: kullanıcı, tür, zaman, cihaz. Kısıtı veritabanına koyarsın, çünkü bu kuralın her kod yolundan geçerli olmasını istersin.</p>
{kodu("""import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE o (id INTEGER, kul INTEGER, tur TEXT, zaman TEXT, UNIQUE (kul, tur, zaman))")
satirlar = [(1, 5, "visit", "10:00"), (2, 5, "visit", "10:00"), (3, 6, "visit", "10:05")]
for tur_no in (1, 2):
    once = con.total_changes
    con.executemany("INSERT INTO o VALUES (?, ?, ?, ?) ON CONFLICT (kul, tur, zaman) DO NOTHING", satirlar)
    print("tur", tur_no, "eklenen:", con.total_changes - once, "toplam:", con.execute("SELECT COUNT(*) FROM o").fetchone()[0])""")}
<p>Olaylar değişmez, bu yüzden <code>DO NOTHING</code> yeter. Sipariş durumu gibi değişen veride <code>DO UPDATE</code> kullanırsın; <b>veri-boru-hatti</b> dersi onu gösterdi.</p>
<h2>Artımlı yükleme: filigran neye bakmalı?</h2>
<p>Her gece tüm tarihçeyi yeniden işlemek israftır; yalnız yeniyi işlemek istersin. "Buraya kadar işledim" kaydına filigran (watermark) denir. Asıl soru filigranın neye baktığıdır. Olay zamanına bakarsan geç gelen olayı kaybedersin; bu veride bu şekilde {KAYIP} olay kayboluyor ve hiçbir hata çıkmıyor. Parti tarihine bakarsan olay ne kadar eski olursa olsun, geldiği partiyle işlenir.</p>
{kodu("""from datetime import date, timedelta
filigran = "2024-10-05"; geri_bakis = 2
alt = (date.fromisoformat(filigran) - timedelta(days=geri_bakis)).isoformat()
gelenler = ["2024-10-03", "2024-10-04", "2024-10-05", "2024-10-06"]
print("işlenecek:", [p for p in gelenler if p > alt])""")}
<p>Geri bakış neden var? Kaynak bazen son günlerin dosyasını düzeltip yeniden gönderir. Son iki günü her gece yeniden okumak bunu yakalar. Bu da ancak yükleme idempotent olduğu için güvenlidir: artımlılık ve idempotentlik birbirini tamamlar.</p>
<h2>Parti başına tek işlem ve günlük</h2>
<p>Her parti tek bir veritabanı işlemidir (transaction): satırlar, reddedilenler, günlük kaydı ve filigran ya birlikte yazılır ya hiç yazılmaz. Python\'da <code>with con:</code> bloğu bunu sağlar. Günlüğün iki yüzü vardır: <code>logging</code> ile akan satırlar sabah ne olduğunu anlatır, <code>calisma_gunlugu</code> tablosu ise sayıları sorgulanabilir tutar.</p>
{kodu("""import logging, sqlite3
log = logging.getLogger("ornek"); log.setLevel(logging.INFO)
log.handlers[:] = [logging.StreamHandler(__import__("sys").stdout)]; log.propagate = False
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (x INTEGER)")
try:
    with con:
        con.execute("INSERT INTO t VALUES (1)")
        raise RuntimeError("disk doldu")
except RuntimeError as e:
    log.error("parti geri alındı: %s", e)
print("satır:", con.execute("SELECT COUNT(*) FROM t").fetchone()[0])""")}
<h2>Kalite testleri: hata ve uyarı ayrımı</h2>
<p>Bazı ihlaller işi geçersiz kılar: sayılar tutmuyorsa ya da çift satır varsa raporu yayımlama. Bazıları ise gerçek dünyanın kusurudur: saati kaymış istemci gerçek bir kayıttır, silmezsin, sayar ve raporlarsın. En önemli test satır mutabakatıdır: <code>gelen = eklenen + tekrar + red</code>. Bir satır bu dengeye girmiyorsa bir yerde kaybolmuştur.</p>
<h2>Bitince göreceğin sonuç</h2>
<p>Aşağıdaki sayılar bu dersin kodu gerçek veride çalıştırılarak hesaplandı; son adımda kendi kodun da aynısını üretecek.</p>
<div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Değer</th></tr>
<tr><td>Gelen satır</td><td>{tr(GELEN)}</td></tr>
<tr><td>Eklenen</td><td>{tr(SATIR)}</td></tr>
<tr><td>Tekrar (veride gerçekten çift gönderilmiş)</td><td>{TEKRAR}</td></tr>
<tr><td>Reddedilen</td><td>{RED} (kullanıcı {sayac['kullanici_gecersiz']}, tür {sayac['tur_gecersiz']}, zaman {sayac['zaman_gecersiz']}, cihaz {sayac['cihaz_gecersiz']})</td></tr>
<tr><td>Geç gelen ve yine de yüklenen</td><td>{GEC}</td></tr>
<tr><td>İkinci çalıştırma</td><td>{R2['islenen']} parti işlendi, {R2['eklenen']} satır eklendi</td></tr>
<tr><td>Huni uyarısı</td><td>{K['huni_sirasi']} kullanıcı (ham tabloda {HAM_HUNI}; reddedilen satırlar sayıyı değiştirir, silinmez, raporlanır)</td></tr></table></div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span><h3>Bu işi gerçek bir ortama taşırken</h3><p>Aynı tasarım PostgreSQL\'de de geçerlidir; <code>ON CONFLICT</code> söz dizimi aynıdır, toplu yüklemede <code>COPY</code> ile geçici tablo kullanılır. Airflow gibi bir orkestratörde parti tarihi görevin veri aralığına karşılık gelir ve geriye dönük çalıştırma (backfill) bu sayede güvenlidir. dbt testleri ve Great Expectations, burada elle yazdığın kalite testlerinin bildirimsel hâlidir. Reddedilen oranına eşik koymak da yaygındır: satırların önemli bir kısmı reddedilmişse yüklemeyi durdurup haber vermek, eksik veriyi sessizce yayımlamaktan iyidir. Bu eşiği iş birimiyle birlikte seç. Geri bakış penceresinden eski bir parti düzeltilirse bu iş onu kendiliğinden görmez; o tarih için filigranı geri alıp geriye dönük çalıştırman gerekir.</p></section>
'''
ders = dict(id='proje-etl', mod='İleri bitirme', min=120, needs=['sqlite3'],
  title='Bitirme projesi: Anadolu Market web olayları ETL',
  sum='Kirli ham partileri doğrular, reddedilenleri ayırır, dönüştürür, SQLite\'a idempotent ve artımlı yükler, günlük tutar, kalite testi yazar ve aynı işi iki kez çalıştırınca satır çiftlenmediğini kanıtlarsın. Gerçek web_events verisiyle, tarayıcıda.',
  goals=['Ham satırı doğrulayıp düzeltilebilir olanı düzeltir, olmayanı nedeniyle ayırabilirim.', 'Doğal anahtar seçip veritabanı kısıtıyla idempotent yükleme kurabilirim.', 'Filigranı doğru alana bağlayıp geç gelen veriyi kaybetmeden artımlı yükleyebilirim.', 'Parti başına tek işlem, günlük ve hata sonrası kaldığı yerden devam kurabilirim.', 'Bozulmayı gerçekten yakalayan kalite testleri yazıp sonucu kanıtlayabilirim.'],
  body=GOVDE, ex=ex,
  faq=[dict(q='Neden pandas kullanmadık?', a='Satır satır doğrulama ve nedenle ayırma bu ölçekte en okunur hâlidir; dersin konusu da budur. Büyük hacimde dönüştürme pandas ya da Polars ile vektörel yapılır, ama anahtar, işlem, filigran ve kalite testi kararları aynı kalır.'),
       dict(q='Bozulmaları ders mi ekledi, veri kirli değil mi?', a=f'İkisi de. {TEKRAR} çift gönderim ve saat kayması tabloda gerçekten var. Reddedilecek satır tabloda olmadığı için bunları <code>ham_partiler()</code> açık kurallarla ekliyor; kod önünde, istediğin gibi değiştirip sonucu görebilirsin.'),
       dict(q='SQLite üretimde yeter mi?', a='Tek makineli küçük işler için yeter; birden çok yazıcı ve büyük hacim için PostgreSQL ya da bir veri ambarı gerekir. Burada SQLite, tarayıcıda gerçek SQL ve gerçek işlem çalıştırabildiğimiz için seçildi.'),
       dict(q='Portföyüme nasıl koyarım?', a='Kendi bilgisayarında adımındaki <code>etl.py</code> ile başla, testleri pytest\'e taşı, README\'ye bu dersteki sonuç tablosunu kendi çalıştırmandan yaz. Sonra başka bir veri setine uyarla; Bitirme projeleri sayfasındaki Ilgaz Bank önerisi iyi bir ikinci adımdır.')],
  mistakes=[dict(bad='INSERT OR REPLACE INTO olay VALUES (...)', good='INSERT INTO olay VALUES (...) ON CONFLICT (kullanici, tur, zaman, cihaz) DO NOTHING', why='REPLACE satırı silip yeniden yazar: satır kimliği değişir, tetikleyiciler çalışır, boş bıraktığın sütunlar kaybolur. Olay değişmiyorsa hiç dokunma.'),
            dict(bad='son = con.execute("SELECT MAX(zaman) FROM olay").fetchone()[0]\nyeni = [s for s in temiz if s["zaman"] > son]', good='for parti in bekleyen_partiler(con, partiler):\n    temiz, red = parti_isle(parti, partiler[parti])', why='Olay zamanına bakan filigran geç gelen satırı hatasız kaybeder.'),
            dict(bad='filigran_yaz(con, parti)\ncon.commit()\nyukle(con, temiz, red)', good='with con:\n    yukle(con, temiz, red)\n    filigran_yaz(con, parti)', why='Filigran veriden önce kalıcı olursa çökme sonrası parti "yüklendi" görünür.')])
yaz(KOK + '/kaynak/v2/p1/proje-etl.js', 'Bitirme: proje-etl (Veri Mühendisi)', ders, 'ileri')
