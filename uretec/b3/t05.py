RUN = r'''
def _calistir(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()
'''

T = [
dict(id='b-351', topic='polars/duckdb', diff=2, kind='rehberli', needs=['duckdb', 'pandas'],
  title='DuckDB pencere fonksiyonu: kümülatif harcama',
  q='<p>Müşteri sadakat ekibi her siparişte müşterinin o ana kadarki toplam harcamasını görmek istiyor. <code>kumulatif_harcama(df)</code> fonksiyonunu yaz: pandas DataFrame\'i (<code>musteri</code>, <code>tarih</code> YYYY-MM-DD metin, <code>tutar</code>) DuckDB\'ye <code>siparis</code> adıyla kaydet ve SQL pencere fonksiyonuyla <code>(musteri, tarih, tutar, kumulatif)</code> satırlarını müşteri ve tarihe göre sıralı liste olarak döndür.</p>',
  guide=['<code>con = duckdb.connect()</code> ile bellek içi bağlantı aç.', '<code>con.register("siparis", df)</code> DataFrame\'i tablo gibi sorgulanabilir yapar.', 'Pencere: <code>SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih)</code>.', 'Dış sorguda <code>ORDER BY musteri, tarih</code> ver ve <code>fetchall()</code> ile döndür.'],
  example=r'''
import duckdb
import pandas as pd
df = pd.DataFrame({"depo": ["A", "A", "B"], "gun": [1, 2, 1], "stok": [5, 3, 7]})
con = duckdb.connect()
con.register("t", df)
print(con.execute("SELECT depo, gun, AVG(stok) OVER (PARTITION BY depo) AS ort FROM t ORDER BY depo, gun").fetchall())
''',
  start=r'''
import duckdb
import pandas as pd

def kumulatif_harcama(df):
    con = duckdb.connect()
    # TODO 1: df'yi "siparis" adıyla kaydet
    # TODO 2: SUM(...) OVER (PARTITION BY ... ORDER BY ...) AS kumulatif sorgusunu yaz
    # TODO 3: musteri, tarih sırasıyla fetchall() sonucunu döndür
    return []
''',
  sol=r'''
import duckdb
import pandas as pd

def kumulatif_harcama(df):
    con = duckdb.connect()
    con.register("siparis", df)
    sql = """
        SELECT musteri, tarih, tutar,
               SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih) AS kumulatif
        FROM siparis
        ORDER BY musteri, tarih
    """
    return con.execute(sql).fetchall()
''',
  tests=r'''
df = pd.DataFrame({
    "musteri": ["Ayşe", "Can", "Ayşe", "Ayşe", "Can"],
    "tarih": ["2026-01-05", "2026-01-02", "2026-01-01", "2026-02-10", "2026-03-01"],
    "tutar": [200, 50, 100, 300, 70],
})
r = [(m, t, int(tu), int(k)) for m, t, tu, k in kumulatif_harcama(df)]
assert r == [
    ("Ayşe", "2026-01-01", 100, 100),
    ("Ayşe", "2026-01-05", 200, 300),
    ("Ayşe", "2026-02-10", 300, 600),
    ("Can", "2026-01-02", 50, 50),
    ("Can", "2026-03-01", 70, 120),
], f"Müşteri içinde tarih sırasıyla birikimli toplam bekleniyor; gelen {r}"
''',
  hints=['Pencere fonksiyonu satırları birleştirmez; her satır kalır ve yanına hesaplanan değer eklenir.', 'PARTITION BY grubu, ORDER BY ise biriktirme sırasını belirler.', '<code>SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih) AS kumulatif</code>'],
  why='GROUP BY satırları tek satıra indirir; pencere fonksiyonu ise her satırı korur ve bölüm (partition) içinde sıralı birikim yapar. DuckDB sütunsal ve vektörel çalıştığı için pandas DataFrame’i kopyalamadan doğrudan sorgular; büyük veride O(n log n) (sıralama). Not: ORDER BY’lı pencerede varsayılan çerçeve RANGE’dir; aynı tarihte iki sipariş varsa ikisi de aynı birikimi alır, satır satır istiyorsan ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW yaz. Pandas karşılığı: df.sort_values(...).groupby("musteri")["tutar"].cumsum().',
  tags=['duckdb', 'pencere fonksiyonu', 'kümülatif toplam'], min=7),

dict(id='b-352', topic='polars/duckdb', diff=3, kind='yaz', needs=['duckdb', 'pandas'],
  title='Her şehrin en değerli müşterisi (QUALIFY)',
  q='<p><code>sehir_lideri(musteri, siparis)</code> fonksiyonunu DuckDB SQL ile yaz. <code>musteri</code>: (<code>musteri_id</code>, <code>ad</code>, <code>sehir</code>), <code>siparis</code>: (<code>musteri_id</code>, <code>tutar</code>). İki tabloyu birleştir, müşteri başına toplam harcamayı bul ve her şehirde en çok harcayan müşteriyi seç (eşitlikte adı alfabetik önce gelen). <code>{sehir: (ad, toplam)}</code> sözlüğü döndür. Hiç siparişi olmayan müşteri dikkate alınmaz.</p>',
  start=r'''
import duckdb
import pandas as pd

def sehir_lideri(musteri, siparis):
    pass
''',
  sol=r'''
import duckdb
import pandas as pd

def sehir_lideri(musteri, siparis):
    con = duckdb.connect()
    con.register("musteri", musteri)
    con.register("siparis", siparis)
    sql = """
        SELECT m.sehir, m.ad, SUM(s.tutar) AS toplam
        FROM musteri m
        JOIN siparis s ON s.musteri_id = m.musteri_id
        GROUP BY m.sehir, m.musteri_id, m.ad
        QUALIFY ROW_NUMBER() OVER (PARTITION BY m.sehir ORDER BY toplam DESC, m.ad) = 1
    """
    return {sehir: (ad, int(toplam)) for sehir, ad, toplam in con.execute(sql).fetchall()}
''',
  tests=r'''
musteri = pd.DataFrame({
    "musteri_id": [1, 2, 3, 4, 5, 6],
    "ad": ["Ayşe", "Burak", "Cem", "Deniz", "Ece", "Fatma"],
    "sehir": ["Ankara", "Ankara", "İzmir", "İzmir", "Bursa", "Bursa"],
})
siparis = pd.DataFrame({
    "musteri_id": [1, 1, 2, 3, 4, 4, 5],
    "tutar": [100, 250, 300, 400, 150, 250, 90],
})
r = sehir_lideri(musteri, siparis)
r = {k: (v[0], int(v[1])) for k, v in r.items()}
assert r["Ankara"] == ("Ayşe", 350), f"Ankara: Ayşe 350 > Burak 300; gelen {r.get('Ankara')}. Önce müşteri bazında topla"
assert r["İzmir"] == ("Cem", 400), f"İzmir: Cem 400 ve Deniz 400 eşit → alfabetik Cem; gelen {r.get('İzmir')}"
assert r["Bursa"] == ("Ece", 90), "Bursa: siparişi olmayan Fatma dikkate alınmaz → Ece"
assert len(r) == 3, "Her şehir bir kez"
''',
  hints=['Önce JOIN + GROUP BY ile müşteri başına toplam çıkar.', '"Grup içinde ilk 1" için <code>ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY toplam DESC, ad)</code>.', 'DuckDB\'de <code>QUALIFY</code> pencere fonksiyonu sonucunu alt sorgu olmadan filtreler.'],
  why='Sıralama O(n log n), birleştirme hash join ile ~O(n+m). QUALIFY, pencere fonksiyonu sonucunu WHERE gibi filtreler; standart SQL’de aynı iş alt sorgu/CTE ile yapılır: WITH t AS (... ROW_NUMBER() ... AS rn) SELECT ... WHERE rn = 1. GROUP BY’a musteri_id eklemek aynı adlı iki farklı müşterinin birleşmesini önler. ORDER BY’a ad eklemek eşitliği deterministik çözer. INNER JOIN siparişsiz müşteriyi doğal olarak dışlar; dahil etmek isteseydin LEFT JOIN + COALESCE gerekirdi.',
  tags=['duckdb', 'QUALIFY', 'ROW_NUMBER', 'JOIN'], min=12),

dict(id='b-353', topic='async', diff=2, kind='predict',
  title='gather: bitiş sırası mı, sonuç sırası mı?',
  q='<p>Üç servisten farklı sürelerde yanıt alan bu kod ne yazdırır?</p>',
  code=r'''
import asyncio

async def getir(ad, sure):
    await asyncio.sleep(sure)
    print("bitti:", ad)
    return ad

async def main():
    sonuc = await asyncio.gather(getir("A", 0.03), getir("B", 0.01), getir("C", 0.02))
    print(sonuc)

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
''',
  o=["bitti: B\nbitti: C\nbitti: A\n['A', 'B', 'C']", "bitti: A\nbitti: B\nbitti: C\n['A', 'B', 'C']", "bitti: B\nbitti: C\nbitti: A\n['B', 'C', 'A']", "bitti: A\nbitti: B\nbitti: C\n['B', 'C', 'A']"], a=0,
  hints=['Üç coroutine aynı anda bekler; kısa bekleyen önce uyanır.', 'gather sonuç listesini argüman sırasına göre dizer.'],
  why='gather görevleri eşzamanlı başlatır; print’ler bitiş sırasıyla (B 10 ms, C 20 ms, A 30 ms) çıkar, toplam süre ~30 ms’dir (sıralı olsaydı 60 ms). Ama dönen liste her zaman argüman sırasındadır, böylece sonucu girdiyle eşlemek kolaydır. Bitiş sırasıyla işlemek istersen asyncio.as_completed kullanılır.',
  tags=['gather', 'eşzamanlılık', 'sıra'], min=3),

dict(id='b-354', topic='async', diff=2, kind='order',
  title='wait_for ile zaman aşımı',
  q='<p>Yavaş bir servisi en fazla 10 ms bekleyip, süre dolarsa "zaman aşımı" yazan programın satırlarını sırala.</p>',
  lines=[
    'import asyncio',
    'async def main():',
    '    try:',
    '        sonuc = await asyncio.wait_for(asyncio.sleep(1, result="veri"), timeout=0.01)',
    '    except TimeoutError:',
    '        sonuc = "zaman aşımı"',
    '    print(sonuc)',
    'asyncio.new_event_loop().run_until_complete(main())',
  ],
  expect='zaman aşımı\n',
  hints=['try bloğunda beklenen çağrı, except bloğunda yedek değer olur.', 'print her iki yoldan sonra çalışmalı; try ile aynı girinti düzeyinde.'],
  why='asyncio.wait_for süre dolunca içteki görevi iptal eder ve TimeoutError fırlatır (Python 3.11+ asyncio.TimeoutError yerleşik TimeoutError ile aynıdır). asyncio.sleep(sure, result=...) bir sonucu gecikmeyle döndüren sahte servis yerine geçer. 3.11+’da async with asyncio.timeout(0.01): bloğu da aynı işi yapar ve birden çok await’i kapsayabilir.',
  tags=['wait_for', 'TimeoutError', 'asyncio'], min=4),

dict(id='b-355', topic='async', diff=2, kind='rehberli',
  title='Üstel geri çekilmeli yeniden deneme',
  q='<p>Ödeme sağlayıcısı ara sıra <code>ConnectionError</code> veriyor. <code>tekrar_dene(islem, deneme=3, bekleme=0.001)</code> coroutine\'ini yaz: <code>islem</code> argümansız bir <b>coroutine fonksiyonudur</b>; <code>await islem()</code> başarılı olursa sonucu döndür. <code>ConnectionError</code> gelirse <code>bekleme * 2 ** i</code> saniye bekle (i: 0\'dan başlayan deneme indeksi) ve yeniden dene. Son deneme de başarısızsa hatayı <b>yeniden fırlat</b>. Diğer hata türleri hiç yeniden denenmeden yükselmeli.</p>',
  guide=['<code>for i in range(deneme):</code> döngüsü kur.', 'Döngüde <code>try: return await islem()</code>.', '<code>except ConnectionError:</code> içinde son denemeyse <code>raise</code>, değilse <code>await asyncio.sleep(bekleme * 2 ** i)</code>.', 'Yalnız ConnectionError yakala; başka hatalar kendiliğinden yükselir.'],
  example=r'''
import asyncio

async def bir_kez_bekle():
    for i in range(3):
        sure = 0.001 * 2 ** i
        print(f"{i}. bekleme: {sure} s")
        await asyncio.sleep(sure)

asyncio.new_event_loop().run_until_complete(bir_kez_bekle())
''',
  start=r'''
import asyncio

async def tekrar_dene(islem, deneme=3, bekleme=0.001):
    # TODO 1: deneme sayısı kadar dön
    # TODO 2: await islem() başarılıysa sonucu döndür
    # TODO 3: ConnectionError: son denemeyse raise, değilse üstel bekle
    return await islem()
''',
  sol=r'''
import asyncio

async def tekrar_dene(islem, deneme=3, bekleme=0.001):
    for i in range(deneme):
        try:
            return await islem()
        except ConnectionError:
            if i == deneme - 1:
                raise
            await asyncio.sleep(bekleme * 2 ** i)
''',
  tests=RUN + r'''
class _Servis:
    def __init__(self, hata_sayisi, hata=ConnectionError):
        self.kalan = hata_sayisi
        self.cagri = 0
        self.hata = hata
    async def __call__(self):
        self.cagri += 1
        if self.kalan > 0:
            self.kalan -= 1
            raise self.hata("bağlantı koptu")
        return "onay"
s = _Servis(2)
assert _calistir(tekrar_dene(s)) == "onay", "2 hatadan sonra 3. denemede onay dönmeli"
assert s.cagri == 3, f"Toplam 3 çağrı bekleniyor; {s.cagri} oldu"
s2 = _Servis(5)
try:
    _calistir(tekrar_dene(s2, deneme=3))
    assert False, "3 denemenin hepsi başarısızsa ConnectionError yeniden fırlatılmalı"
except ConnectionError:
    pass
assert s2.cagri == 3, "Deneme sayısını aşma"
s3 = _Servis(1, hata=ValueError)
try:
    _calistir(tekrar_dene(s3))
    assert False, "ValueError yeniden denenmemeli, hemen yükselmeli"
except ValueError:
    pass
assert s3.cagri == 1, "Yalnız ConnectionError yeniden denenir"
''',
  hints=['Başarılı denemede <code>return</code> döngüden de çıkar.', 'Son denemeyi <code>i == deneme - 1</code> ile anla; orada çıplak <code>raise</code> yakalanan hatayı aynen yeniden fırlatır.', 'Bekleme: <code>await asyncio.sleep(bekleme * 2 ** i)</code> — time.sleep olay döngüsünü kilitler.'],
  why='Üstel geri çekilme (exponential backoff) geçici hatalarda karşı sistemi boğmadan yeniden dener: 1, 2, 4… birim bekler. Yalnız geçici (ConnectionError, zaman aşımı) hatalar yeniden denenmeli; doğrulama hataları (ValueError) her denemede aynı sonucu verir. En kötü toplam bekleme bekleme·(2^(n−1) − 1). Üretimde rastgele sapma (jitter) eklenir ki binlerce istemci aynı anda yeniden denemesin; hazır kütüphane alternatifleri: tenacity, backoff.',
  tags=['retry', 'backoff', 'asyncio.sleep'], min=8),

dict(id='b-356', topic='async', diff=2, kind='bug',
  title='Coroutine içinde time.sleep',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>stoklari_getir(depolar)</code> her depo için <code>stok_sorgula</code> çağrısını <code>gather</code> ile eşzamanlı yapıyor ve her sorgu ~50 ms sürüyor. 5 depo için ~50 ms beklenirken 250 ms sürüyor: sorgular sırayla çalışıyor.</p>',
  start=r'''
import asyncio
import time

async def stok_sorgula(depo):
    time.sleep(0.05)              # ağ gecikmesi taklidi
    return depo, len(depo) * 10

async def stoklari_getir(depolar):
    sonuclar = await asyncio.gather(*(stok_sorgula(d) for d in depolar))
    return dict(sonuclar)
''',
  sol=r'''
import asyncio
import time

async def stok_sorgula(depo):
    await asyncio.sleep(0.05)     # ağ gecikmesi taklidi
    return depo, len(depo) * 10

async def stoklari_getir(depolar):
    sonuclar = await asyncio.gather(*(stok_sorgula(d) for d in depolar))
    return dict(sonuclar)
''',
  tests=RUN + r'''
_gercek_sleep = time.sleep
def _yasak(s):
    raise AssertionError("Coroutine içinde time.sleep çağrıldı: olay döngüsünü kilitler, await asyncio.sleep kullan")
time.sleep = _yasak
try:
    t0 = time.perf_counter()
    r = _calistir(stoklari_getir(["Ankara", "İzmir", "Bursa", "Konya", "Adana"]))
    sure = time.perf_counter() - t0
finally:
    time.sleep = _gercek_sleep
assert r == {"Ankara": 60, "İzmir": 50, "Bursa": 50, "Konya": 50, "Adana": 50}, "Sonuç sözlüğü yanlış"
assert sure < 1.0, f"5 sorgu eşzamanlı ~0.05 s sürmeli; {sure:.2f} s sürdü. time.sleep olay döngüsünü kilitler"
''',
  hints=['Olay döngüsü tek iş parçacığında çalışır; engelleyen (blocking) bir çağrı herkesi bekletir.', '<code>time.sleep</code> kontrolü döngüye geri vermez.', '<code>await asyncio.sleep(0.05)</code>'],
  why='asyncio işbirlikçi (cooperative) çoklu görevdir: görev ancak await noktasında kontrolü bırakır. time.sleep, senkron bir veritabanı sürücüsü ya da requests çağrısı tüm döngüyü durdurur, gather’ı sıralı hâle getirir (süre n·t). Düzeltme sonrası süre max(t) olur. Değiştiremeyeceğin senkron bir kütüphane varsa await asyncio.to_thread(fonk, ...) ile ayrı iş parçacığına itilir; CPU yoğun iş için ProcessPoolExecutor + loop.run_in_executor.',
  tags=['blocking', 'asyncio.sleep', 'gather'], min=4),

dict(id='b-357', topic='async', diff=2, kind='yaz',
  title='Kısmi başarısızlıkta toplu sorgu',
  q='<p>Gün sonu raporu için birçok hesabın bakiyesi eşzamanlı çekiliyor; bazı hesaplar hata verebilir ama rapor yine de üretilmeli. <code>toplu_bakiye(hesaplar, sorgula)</code> coroutine\'ini yaz: <code>sorgula(hesap)</code> bir coroutine fonksiyonudur. Hepsini <code>asyncio.gather(..., return_exceptions=True)</code> ile çalıştır ve <code>(basarili, hatali)</code> döndür: <code>basarili</code> = <code>{hesap: bakiye}</code>, <code>hatali</code> = <code>[(hesap, hata_sınıfının_adı), ...]</code> (girdi sırasıyla).</p>',
  start=r'''
import asyncio

async def toplu_bakiye(hesaplar, sorgula):
    pass
''',
  sol=r'''
import asyncio

async def toplu_bakiye(hesaplar, sorgula):
    sonuclar = await asyncio.gather(*(sorgula(h) for h in hesaplar), return_exceptions=True)
    basarili, hatali = {}, []
    for h, s in zip(hesaplar, sonuclar):
        if isinstance(s, Exception):
            hatali.append((h, type(s).__name__))
        else:
            basarili[h] = s
    return basarili, hatali
''',
  tests=RUN + r'''
async def _sorgula(h):
    await asyncio.sleep(0.001)
    if h == "TR3":
        raise TimeoutError("yanıt yok")
    if h == "TR5":
        raise KeyError(h)
    return int(h[2:]) * 100
b, e = _calistir(toplu_bakiye(["TR1", "TR3", "TR2", "TR5"], _sorgula))
assert b == {"TR1": 100, "TR2": 200}, f"Başarılılar {{'TR1': 100, 'TR2': 200}} olmalı; gelen {b}"
assert e == [("TR3", "TimeoutError"), ("TR5", "KeyError")], f"Hatalar girdi sırasıyla (hesap, sınıf adı); gelen {e}"
assert _calistir(toplu_bakiye([], _sorgula)) == ({}, []), "Boş girdi → ({}, [])"
''',
  hints=['<code>return_exceptions=True</code> hataları fırlatmak yerine sonuç listesine istisna nesnesi olarak koyar.', 'Sonuçları <code>zip(hesaplar, sonuclar)</code> ile hesaplarla eşle; gather sırayı korur.', '<code>isinstance(s, Exception)</code> ve <code>type(s).__name__</code>'],
  why='Varsayılan gather ilk hatayı yukarı fırlatır, diğer sonuçları kaybettirir; return_exceptions=True ile her görevin sonucu ya da hatası yerinde döner, kısmi başarı raporlanabilir. Toplam süre en yavaş sorgu kadar; işleme O(n). Python 3.11+ asyncio.TaskGroup ise "biri düşerse hepsini iptal et" anlamına gelir ve hataları ExceptionGroup olarak toplar; hangisini seçeceğin iş kuralına bağlı. Not: CancelledError BaseException olduğundan isinstance(..., Exception) onu ayrı tutar.',
  tags=['gather', 'return_exceptions', 'hata yönetimi'], min=6),

dict(id='b-358', topic='async', diff=3, kind='yaz',
  title='İlk başarılı yanıtı al, gerisini iptal et',
  q='<p>Döviz kuru üç ayrı sağlayıcıdan sorgulanabiliyor; en hızlı <b>başarılı</b> yanıt kullanılmalı (hedged request). <code>ilk_basarili(kaynaklar)</code> coroutine\'ini yaz: <code>kaynaklar</code> argümansız coroutine fonksiyonlarının listesi. Hepsini görev (task) olarak başlat, ilk başarılı sonucu döndür ve kalan görevleri <b>iptal et</b>. Hata veren görevi atla; hepsi başarısız olursa <code>RuntimeError("hiçbir kaynak yanıt vermedi")</code> fırlat.</p>',
  start=r'''
import asyncio

async def ilk_basarili(kaynaklar):
    pass
''',
  sol=r'''
import asyncio

async def ilk_basarili(kaynaklar):
    bekleyen = {asyncio.ensure_future(k()) for k in kaynaklar}
    try:
        while bekleyen:
            biten, bekleyen = await asyncio.wait(bekleyen, return_when=asyncio.FIRST_COMPLETED)
            for g in biten:
                if g.exception() is None:
                    return g.result()
        raise RuntimeError("hiçbir kaynak yanıt vermedi")
    finally:
        for g in bekleyen:
            g.cancel()
''',
  tests=RUN + r'''
iptal = []
def _kaynak(ad, sure, hata=False):
    async def k():
        try:
            await asyncio.sleep(sure)
        except asyncio.CancelledError:
            iptal.append(ad)
            raise
        if hata:
            raise ConnectionError(ad)
        return ad
    return k
r = _calistir(ilk_basarili([_kaynak("yavaş", 0.2), _kaynak("hatalı", 0.01, True), _kaynak("hızlı", 0.03)]))
assert r == "hızlı", f"Hatalı kaynak atlanıp ilk başarılı ('hızlı') dönmeli; gelen {r!r}"
assert iptal == ["yavaş"], f"Kalan görev iptal edilmeli; iptal edilenler {iptal}"
try:
    _calistir(ilk_basarili([_kaynak("a", 0.01, True), _kaynak("b", 0.02, True)]))
    assert False, "Hepsi başarısızsa RuntimeError bekleniyordu"
except RuntimeError:
    pass
''',
  hints=['<code>asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)</code> biten ve bekleyen kümelerini döndürür; döngüyle tekrar çağır.', 'Biten görevde <code>g.exception() is None</code> ise başarılıdır.', 'Kalan görevleri <code>finally</code> bloğunda <code>cancel()</code> et; böylece hem return hem raise yolunda temizlenir.'],
  why='asyncio.wait + FIRST_COMPLETED, görevleri bittikçe tek tek değerlendirmeyi sağlar; gather hepsini beklerdi. Kalan görevlerin iptali kaynak sızıntısını (açık bağlantı, boşa harcanan kota) önler; finally bunu her çıkış yolunda garanti eder. Gecikme = en hızlı başarılı yanıt süresi. Alternatif: asyncio.as_completed ile döngü (ama iptal için görev referanslarını ayrıca tutman gerekir). Hedged request gecikme kuyruğunu (p99) düşürür ama karşı sisteme ek yük bindirir; genelde ikinci istek kısa bir gecikmeden sonra gönderilir.',
  tags=['asyncio.wait', 'FIRST_COMPLETED', 'cancel', 'hedged request'], min=12),

dict(id='b-359', topic='Eşzamanlılık', diff=2, kind='predict',
  title='Future ve geri çağrı (callback)',
  q='<p><code>concurrent.futures.Future</code> nesnesine geri çağrı ekleyen bu kod ne yazdırır?</p>',
  code=r'''
from concurrent.futures import Future

f = Future()
f.add_done_callback(lambda x: print("geri çağrı:", x.result()))
print("hazır mı:", f.done())
f.set_result(42)
print("hazır mı:", f.done())
''',
  o=['hazır mı: False\ngeri çağrı: 42\nhazır mı: True', 'geri çağrı: 42\nhazır mı: False\nhazır mı: True', 'hazır mı: False\nhazır mı: True\ngeri çağrı: 42', 'hazır mı: False\nhazır mı: True'], a=0,
  hints=['Geri çağrı eklendiği anda değil, Future tamamlandığında çalışır.', 'set_result çağrısı geri çağrıları hemen (aynı iş parçacığında) tetikler.'],
  why='Future henüz sonuçlanmamış bir işin temsilidir. add_done_callback fonksiyonu kaydeder; set_result sonucu yazar ve kayıtlı geri çağrıları o anda, set_result’ı çağıran iş parçacığında çalıştırır. Future zaten bitmişse add_done_callback geri çağrıyı hemen çalıştırır. Havuzlarda (ThreadPoolExecutor.submit) set_result’ı işçi thread çağırır, bu yüzden geri çağrı işçi thread’de koşar: paylaşılan veriye dokunuyorsa kilit gerekir.',
  tags=['Future', 'callback', 'concurrent.futures'], min=3),

dict(id='b-360', topic='Eşzamanlılık', diff=3, kind='rehberli',
  title='Havalede kilitlenmeyi (deadlock) önle',
  q='<p>Anadolu Bank\'ta iki iş parçacığı aynı anda A→B ve B→A havalesi yaparsa, her biri bir hesabın kilidini alıp diğerini beklerse sistem kilitlenir (deadlock). <code>havale(kaynak, hedef, tutar)</code> fonksiyonunu yaz: iki hesabın kilidini <b>her zaman hesap numarası küçük olandan başlayarak</b> alsın, bakiye yetersizse <code>ValueError</code> fırlatsın, değilse parayı aktarsın. <code>Hesap</code> sınıfı verilmiştir.</p>',
  guide=['İki hesabı <code>no</code> değerine göre sırala: <code>ilk, ikinci = sorted([kaynak, hedef], key=lambda h: h.no)</code>.', 'İç içe iki <code>with</code> bloğuyla önce <code>ilk.kilit</code>, sonra <code>ikinci.kilit</code> al.', 'Kilitlerin içinde bakiye kontrolü yap; yetersizse <code>ValueError</code>.', 'Kaynaktan düş, hedefe ekle.'],
  example=r'''
import threading
# Tutarlı kilit sırası: kaynak adlarına göre alfabetik
kilitler = {"rapor": threading.Lock(), "arsiv": threading.Lock()}
def iki_kaynakla_calis(a, b):
    for ad in sorted([a, b]):
        print("kilit alınıyor:", ad)
iki_kaynakla_calis("rapor", "arsiv")
iki_kaynakla_calis("arsiv", "rapor")   # aynı sıra!
''',
  start=r'''
import threading

class Hesap:
    def __init__(self, no, bakiye):
        self.no = no
        self.bakiye = bakiye
        self.kilit = threading.Lock()

def havale(kaynak, hedef, tutar):
    # TODO 1: hesapları no'ya göre sırala
    # TODO 2: kilitleri bu sırayla al (iç içe with)
    # TODO 3: bakiye yetersizse ValueError
    # TODO 4: aktarımı yap
    with kaynak.kilit:
        with hedef.kilit:
            kaynak.bakiye -= tutar
            hedef.bakiye += tutar
''',
  sol=r'''
import threading

class Hesap:
    def __init__(self, no, bakiye):
        self.no = no
        self.bakiye = bakiye
        self.kilit = threading.Lock()

def havale(kaynak, hedef, tutar):
    ilk, ikinci = sorted([kaynak, hedef], key=lambda h: h.no)
    with ilk.kilit:
        with ikinci.kilit:
            if kaynak.bakiye < tutar:
                raise ValueError("Yetersiz bakiye")
            kaynak.bakiye -= tutar
            hedef.bakiye += tutar
''',
  tests=r'''
kayit = []
class _IzKilit:
    def __init__(self, ad):
        self.ad = ad
        self._k = threading.Lock()
    def __enter__(self):
        kayit.append(self.ad)
        self._k.acquire()
    def __exit__(self, *a):
        self._k.release()
        return False
a, b = Hesap(1, 500), Hesap(2, 100)
a.kilit, b.kilit = _IzKilit(1), _IzKilit(2)
havale(a, b, 200)
havale(b, a, 50)
assert kayit == [1, 2, 1, 2], f"Kilitler her iki yönde de küçük numaradan başlamalı: [1, 2, 1, 2]; gelen {kayit}"
assert (a.bakiye, b.bakiye) == (350, 250), f"Bakiyeler (350, 250) olmalı; gelen {(a.bakiye, b.bakiye)}"
try:
    havale(b, a, 1000)
    assert False, "Yetersiz bakiyede ValueError bekleniyordu"
except ValueError:
    pass
assert (a.bakiye, b.bakiye) == (350, 250), "Başarısız havale bakiyeleri değiştirmemeli"
assert not a.kilit._k.locked() and not b.kilit._k.locked(), "Hata sonrasında kilitler serbest kalmalı (with kullan)"
''',
  hints=['Kilitlenme, iki iş parçacığının kilitleri ters sırada almasıyla oluşur; global bir sıra koy.', '<code>sorted([kaynak, hedef], key=lambda h: h.no)</code>', 'Bakiye kontrolü kilitlerin içinde olmalı; dışarıda yaparsan kontrol ile güncelleme arasında başka thread araya girebilir.'],
  why='Coffman koşullarından "döngüsel bekleme" tüm kilitler için tek bir küresel sıra belirlenerek kırılır: herkes önce küçük numarayı aldığı için iki thread’in birbirini beklediği bir döngü oluşamaz. with blokları istisna olsa bile kilitleri bırakır. Kontrol (bakiye ≥ tutar) ve işlem (düş/ekle) aynı kritik bölgede olmalı, yoksa "kontrol et-sonra-yap" yarış durumu oluşur. Alternatifler: tek global kilit (basit ama ölçeklenmez), acquire(timeout=...) ile geri çekilip yeniden deneme, ya da veritabanında SELECT ... FOR UPDATE ile aynı sıralama kuralı.',
  tags=['deadlock', 'Lock', 'kilit sırası'], min=9),
]
