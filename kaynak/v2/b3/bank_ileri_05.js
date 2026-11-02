/* Kesit Python — pratik bankası: ileri görevler (b-351 … b-360) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-351',
    lv: 'ileri',
    topic: 'polars/duckdb',
    diff: 2,
    kind: 'rehberli',
    needs: ['duckdb', 'pandas'],
    title: 'DuckDB pencere fonksiyonu: kümülatif harcama',
    q: '<p>Müşteri sadakat ekibi her siparişte müşterinin o ana kadarki toplam harcamasını görmek istiyor. <code>kumulatif_harcama(df)</code> fonksiyonunu yaz: pandas DataFrame\'i (<code>musteri</code>, <code>tarih</code> YYYY-MM-DD metin, <code>tutar</code>) DuckDB\'ye <code>siparis</code> adıyla kaydet ve SQL pencere fonksiyonuyla <code>(musteri, tarih, tutar, kumulatif)</code> satırlarını müşteri ve tarihe göre sıralı liste olarak döndür.</p>',
    guide: ['<code>con = duckdb.connect()</code> ile bellek içi bağlantı aç.', '<code>con.register("siparis", df)</code> DataFrame\'i tablo gibi sorgulanabilir yapar.', 'Pencere: <code>SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih)</code>.', 'Dış sorguda <code>ORDER BY musteri, tarih</code> ver ve <code>fetchall()</code> ile döndür.'],
    example: 'import duckdb\nimport pandas as pd\ndf = pd.DataFrame({"depo": ["A", "A", "B"], "gun": [1, 2, 1], "stok": [5, 3, 7]})\ncon = duckdb.connect()\ncon.register("t", df)\nprint(con.execute("SELECT depo, gun, AVG(stok) OVER (PARTITION BY depo) AS ort FROM t ORDER BY depo, gun").fetchall())\n',
    start: 'import duckdb\nimport pandas as pd\n\ndef kumulatif_harcama(df):\n    con = duckdb.connect()\n    # TODO 1: df\'yi "siparis" adıyla kaydet\n    # TODO 2: SUM(...) OVER (PARTITION BY ... ORDER BY ...) AS kumulatif sorgusunu yaz\n    # TODO 3: musteri, tarih sırasıyla fetchall() sonucunu döndür\n    return []\n',
    sol: 'import duckdb\nimport pandas as pd\n\ndef kumulatif_harcama(df):\n    con = duckdb.connect()\n    con.register("siparis", df)\n    sql = """\n        SELECT musteri, tarih, tutar,\n               SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih) AS kumulatif\n        FROM siparis\n        ORDER BY musteri, tarih\n    """\n    return con.execute(sql).fetchall()\n',
    tests: 'df = pd.DataFrame({\n    "musteri": ["Ayşe", "Can", "Ayşe", "Ayşe", "Can"],\n    "tarih": ["2026-01-05", "2026-01-02", "2026-01-01", "2026-02-10", "2026-03-01"],\n    "tutar": [200, 50, 100, 300, 70],\n})\nr = [(m, t, int(tu), int(k)) for m, t, tu, k in kumulatif_harcama(df)]\nassert r == [\n    ("Ayşe", "2026-01-01", 100, 100),\n    ("Ayşe", "2026-01-05", 200, 300),\n    ("Ayşe", "2026-02-10", 300, 600),\n    ("Can", "2026-01-02", 50, 50),\n    ("Can", "2026-03-01", 70, 120),\n], f"Müşteri içinde tarih sırasıyla birikimli toplam bekleniyor; gelen {r}"\n',
    hints: ['Pencere fonksiyonu satırları birleştirmez; her satır kalır ve yanına hesaplanan değer eklenir.', 'PARTITION BY grubu, ORDER BY ise biriktirme sırasını belirler.', '<code>SUM(tutar) OVER (PARTITION BY musteri ORDER BY tarih) AS kumulatif</code>'],
    why: 'GROUP BY satırları tek satıra indirir; pencere fonksiyonu ise her satırı korur ve bölüm (partition) içinde sıralı birikim yapar. DuckDB sütunsal ve vektörel çalıştığı için pandas DataFrame’i kopyalamadan doğrudan sorgular; büyük veride O(n log n) (sıralama). Not: ORDER BY’lı pencerede varsayılan çerçeve RANGE’dir; aynı tarihte iki sipariş varsa ikisi de aynı birikimi alır, satır satır istiyorsan ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW yaz. Pandas karşılığı: df.sort_values(...).groupby("musteri")["tutar"].cumsum().',
    tags: ['duckdb', 'pencere fonksiyonu', 'kümülatif toplam'],
    min: 7
  },

  {
    id: 'b-352',
    lv: 'ileri',
    topic: 'polars/duckdb',
    diff: 3,
    kind: 'yaz',
    needs: ['duckdb', 'pandas'],
    title: 'Her şehrin en değerli müşterisi (QUALIFY)',
    q: '<p><code>sehir_lideri(musteri, siparis)</code> fonksiyonunu DuckDB SQL ile yaz. <code>musteri</code>: (<code>musteri_id</code>, <code>ad</code>, <code>sehir</code>), <code>siparis</code>: (<code>musteri_id</code>, <code>tutar</code>). İki tabloyu birleştir, müşteri başına toplam harcamayı bul ve her şehirde en çok harcayan müşteriyi seç (eşitlikte adı alfabetik önce gelen). <code>{sehir: (ad, toplam)}</code> sözlüğü döndür. Hiç siparişi olmayan müşteri dikkate alınmaz.</p>',
    start: 'import duckdb\nimport pandas as pd\n\ndef sehir_lideri(musteri, siparis):\n    pass\n',
    sol: 'import duckdb\nimport pandas as pd\n\ndef sehir_lideri(musteri, siparis):\n    con = duckdb.connect()\n    con.register("musteri", musteri)\n    con.register("siparis", siparis)\n    sql = """\n        SELECT m.sehir, m.ad, SUM(s.tutar) AS toplam\n        FROM musteri m\n        JOIN siparis s ON s.musteri_id = m.musteri_id\n        GROUP BY m.sehir, m.musteri_id, m.ad\n        QUALIFY ROW_NUMBER() OVER (PARTITION BY m.sehir ORDER BY toplam DESC, m.ad) = 1\n    """\n    return {sehir: (ad, int(toplam)) for sehir, ad, toplam in con.execute(sql).fetchall()}\n',
    tests: 'musteri = pd.DataFrame({\n    "musteri_id": [1, 2, 3, 4, 5, 6],\n    "ad": ["Ayşe", "Burak", "Cem", "Deniz", "Ece", "Fatma"],\n    "sehir": ["Ankara", "Ankara", "İzmir", "İzmir", "Bursa", "Bursa"],\n})\nsiparis = pd.DataFrame({\n    "musteri_id": [1, 1, 2, 3, 4, 4, 5],\n    "tutar": [100, 250, 300, 400, 150, 250, 90],\n})\nr = sehir_lideri(musteri, siparis)\nr = {k: (v[0], int(v[1])) for k, v in r.items()}\nassert r["Ankara"] == ("Ayşe", 350), f"Ankara: Ayşe 350 > Burak 300; gelen {r.get(\'Ankara\')}. Önce müşteri bazında topla"\nassert r["İzmir"] == ("Cem", 400), f"İzmir: Cem 400 ve Deniz 400 eşit → alfabetik Cem; gelen {r.get(\'İzmir\')}"\nassert r["Bursa"] == ("Ece", 90), "Bursa: siparişi olmayan Fatma dikkate alınmaz → Ece"\nassert len(r) == 3, "Her şehir bir kez"\n',
    hints: ['Önce JOIN + GROUP BY ile müşteri başına toplam çıkar.', '"Grup içinde ilk 1" için <code>ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY toplam DESC, ad)</code>.', 'DuckDB\'de <code>QUALIFY</code> pencere fonksiyonu sonucunu alt sorgu olmadan filtreler.'],
    why: 'Sıralama O(n log n), birleştirme hash join ile ~O(n+m). QUALIFY, pencere fonksiyonu sonucunu WHERE gibi filtreler; standart SQL’de aynı iş alt sorgu/CTE ile yapılır: WITH t AS (... ROW_NUMBER() ... AS rn) SELECT ... WHERE rn = 1. GROUP BY’a musteri_id eklemek aynı adlı iki farklı müşterinin birleşmesini önler. ORDER BY’a ad eklemek eşitliği deterministik çözer. INNER JOIN siparişsiz müşteriyi doğal olarak dışlar; dahil etmek isteseydin LEFT JOIN + COALESCE gerekirdi.',
    tags: ['duckdb', 'QUALIFY', 'ROW_NUMBER', 'JOIN'],
    min: 12
  },

  {
    id: 'b-353',
    lv: 'ileri',
    topic: 'async',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    title: 'gather: bitiş sırası mı, sonuç sırası mı?',
    q: '<p>Üç servisten farklı sürelerde yanıt alan bu kod ne yazdırır?</p>',
    code: 'import asyncio\n\nasync def getir(ad, sure):\n    await asyncio.sleep(sure)\n    print("bitti:", ad)\n    return ad\n\nasync def main():\n    sonuc = await asyncio.gather(getir("A", 0.03), getir("B", 0.01), getir("C", 0.02))\n    print(sonuc)\n\nloop = asyncio.new_event_loop()\nloop.run_until_complete(main())\nloop.close()\n',
    o: ['bitti: A\nbitti: B\nbitti: C\n[\'A\', \'B\', \'C\']', 'bitti: B\nbitti: C\nbitti: A\n[\'B\', \'C\', \'A\']', 'bitti: A\nbitti: B\nbitti: C\n[\'B\', \'C\', \'A\']', 'bitti: B\nbitti: C\nbitti: A\n[\'A\', \'B\', \'C\']'],
    a: 3,
    hints: ['Üç coroutine aynı anda bekler; kısa bekleyen önce uyanır.', 'gather sonuç listesini argüman sırasına göre dizer.'],
    why: 'gather görevleri eşzamanlı başlatır; print’ler bitiş sırasıyla (B 10 ms, C 20 ms, A 30 ms) çıkar, toplam süre ~30 ms’dir (sıralı olsaydı 60 ms). Ama dönen liste her zaman argüman sırasındadır, böylece sonucu girdiyle eşlemek kolaydır. Bitiş sırasıyla işlemek istersen asyncio.as_completed kullanılır.',
    tags: ['gather', 'eşzamanlılık', 'sıra'],
    min: 3
  },

  {
    id: 'b-354',
    lv: 'ileri',
    topic: 'async',
    diff: 2,
    kind: 'order',
    t: 'order',
    title: 'wait_for ile zaman aşımı',
    q: '<p>Yavaş bir servisi en fazla 10 ms bekleyip, süre dolarsa "zaman aşımı" yazan programın satırlarını sırala.</p>',
    lines: ['import asyncio', 'async def main():', '    try:', '        sonuc = await asyncio.wait_for(asyncio.sleep(1, result="veri"), timeout=0.01)', '    except TimeoutError:', '        sonuc = "zaman aşımı"', '    print(sonuc)', 'asyncio.new_event_loop().run_until_complete(main())'],
    expect: 'zaman aşımı\n',
    hints: ['try bloğunda beklenen çağrı, except bloğunda yedek değer olur.', 'print her iki yoldan sonra çalışmalı; try ile aynı girinti düzeyinde.'],
    why: 'asyncio.wait_for süre dolunca içteki görevi iptal eder ve TimeoutError fırlatır (Python 3.11+ asyncio.TimeoutError yerleşik TimeoutError ile aynıdır). asyncio.sleep(sure, result=...) bir sonucu gecikmeyle döndüren sahte servis yerine geçer. 3.11+’da async with asyncio.timeout(0.01): bloğu da aynı işi yapar ve birden çok await’i kapsayabilir.',
    tags: ['wait_for', 'TimeoutError', 'asyncio'],
    min: 4
  },

  {
    id: 'b-355',
    lv: 'ileri',
    topic: 'async',
    diff: 2,
    kind: 'rehberli',
    title: 'Üstel geri çekilmeli yeniden deneme',
    q: '<p>Ödeme sağlayıcısı ara sıra <code>ConnectionError</code> veriyor. <code>tekrar_dene(islem, deneme=3, bekleme=0.001)</code> coroutine\'ini yaz: <code>islem</code> argümansız bir <b>coroutine fonksiyonudur</b>; <code>await islem()</code> başarılı olursa sonucu döndür. <code>ConnectionError</code> gelirse <code>bekleme * 2 ** i</code> saniye bekle (i: 0\'dan başlayan deneme indeksi) ve yeniden dene. Son deneme de başarısızsa hatayı <b>yeniden fırlat</b>. Diğer hata türleri hiç yeniden denenmeden yükselmeli.</p>',
    guide: ['<code>for i in range(deneme):</code> döngüsü kur.', 'Döngüde <code>try: return await islem()</code>.', '<code>except ConnectionError:</code> içinde son denemeyse <code>raise</code>, değilse <code>await asyncio.sleep(bekleme * 2 ** i)</code>.', 'Yalnız ConnectionError yakala; başka hatalar kendiliğinden yükselir.'],
    example: 'import asyncio\n\nasync def bir_kez_bekle():\n    for i in range(3):\n        sure = 0.001 * 2 ** i\n        print(f"{i}. bekleme: {sure} s")\n        await asyncio.sleep(sure)\n\nasyncio.new_event_loop().run_until_complete(bir_kez_bekle())\n',
    start: 'import asyncio\n\nasync def tekrar_dene(islem, deneme=3, bekleme=0.001):\n    # TODO 1: deneme sayısı kadar dön\n    # TODO 2: await islem() başarılıysa sonucu döndür\n    # TODO 3: ConnectionError: son denemeyse raise, değilse üstel bekle\n    return await islem()\n',
    sol: 'import asyncio\n\nasync def tekrar_dene(islem, deneme=3, bekleme=0.001):\n    for i in range(deneme):\n        try:\n            return await islem()\n        except ConnectionError:\n            if i == deneme - 1:\n                raise\n            await asyncio.sleep(bekleme * 2 ** i)\n',
    tests: 'def _calistir(coro):\n    loop = asyncio.new_event_loop()\n    try:\n        return loop.run_until_complete(coro)\n    finally:\n        loop.close()\n\nclass _Servis:\n    def __init__(self, hata_sayisi, hata=ConnectionError):\n        self.kalan = hata_sayisi\n        self.cagri = 0\n        self.hata = hata\n    async def __call__(self):\n        self.cagri += 1\n        if self.kalan > 0:\n            self.kalan -= 1\n            raise self.hata("bağlantı koptu")\n        return "onay"\ns = _Servis(2)\nassert _calistir(tekrar_dene(s)) == "onay", "2 hatadan sonra 3. denemede onay dönmeli"\nassert s.cagri == 3, f"Toplam 3 çağrı bekleniyor; {s.cagri} oldu"\ns2 = _Servis(5)\ntry:\n    _calistir(tekrar_dene(s2, deneme=3))\n    assert False, "3 denemenin hepsi başarısızsa ConnectionError yeniden fırlatılmalı"\nexcept ConnectionError:\n    pass\nassert s2.cagri == 3, "Deneme sayısını aşma"\ns3 = _Servis(1, hata=ValueError)\ntry:\n    _calistir(tekrar_dene(s3))\n    assert False, "ValueError yeniden denenmemeli, hemen yükselmeli"\nexcept ValueError:\n    pass\nassert s3.cagri == 1, "Yalnız ConnectionError yeniden denenir"\n',
    hints: ['Başarılı denemede <code>return</code> döngüden de çıkar.', 'Son denemeyi <code>i == deneme - 1</code> ile anla; orada çıplak <code>raise</code> yakalanan hatayı aynen yeniden fırlatır.', 'Bekleme: <code>await asyncio.sleep(bekleme * 2 ** i)</code> — time.sleep olay döngüsünü kilitler.'],
    why: 'Üstel geri çekilme (exponential backoff) geçici hatalarda karşı sistemi boğmadan yeniden dener: 1, 2, 4… birim bekler. Yalnız geçici (ConnectionError, zaman aşımı) hatalar yeniden denenmeli; doğrulama hataları (ValueError) her denemede aynı sonucu verir. En kötü toplam bekleme bekleme·(2^(n−1) − 1). Üretimde rastgele sapma (jitter) eklenir ki binlerce istemci aynı anda yeniden denemesin; hazır kütüphane alternatifleri: tenacity, backoff.',
    tags: ['retry', 'backoff', 'asyncio.sleep'],
    min: 8
  },

  {
    id: 'b-356',
    lv: 'ileri',
    topic: 'async',
    diff: 2,
    kind: 'bug',
    title: 'Coroutine içinde time.sleep',
    q: '<p>Kodda bir hata var, bul ve düzelt. <code>stoklari_getir(depolar)</code> her depo için <code>stok_sorgula</code> çağrısını <code>gather</code> ile eşzamanlı yapıyor ve her sorgu ~50 ms sürüyor. 5 depo için ~50 ms beklenirken 250 ms sürüyor: sorgular sırayla çalışıyor.</p>',
    start: 'import asyncio\nimport time\n\nasync def stok_sorgula(depo):\n    time.sleep(0.05)              # ağ gecikmesi taklidi\n    return depo, len(depo) * 10\n\nasync def stoklari_getir(depolar):\n    sonuclar = await asyncio.gather(*(stok_sorgula(d) for d in depolar))\n    return dict(sonuclar)\n',
    sol: 'import asyncio\nimport time\n\nasync def stok_sorgula(depo):\n    await asyncio.sleep(0.05)     # ağ gecikmesi taklidi\n    return depo, len(depo) * 10\n\nasync def stoklari_getir(depolar):\n    sonuclar = await asyncio.gather(*(stok_sorgula(d) for d in depolar))\n    return dict(sonuclar)\n',
    tests: 'def _calistir(coro):\n    loop = asyncio.new_event_loop()\n    try:\n        return loop.run_until_complete(coro)\n    finally:\n        loop.close()\n\n_gercek_sleep = time.sleep\ndef _yasak(s):\n    raise AssertionError("Coroutine içinde time.sleep çağrıldı: olay döngüsünü kilitler, await asyncio.sleep kullan")\ntime.sleep = _yasak\ntry:\n    t0 = time.perf_counter()\n    r = _calistir(stoklari_getir(["Ankara", "İzmir", "Bursa", "Konya", "Adana"]))\n    sure = time.perf_counter() - t0\nfinally:\n    time.sleep = _gercek_sleep\nassert r == {"Ankara": 60, "İzmir": 50, "Bursa": 50, "Konya": 50, "Adana": 50}, "Sonuç sözlüğü yanlış"\nassert sure < (1.0 * (4 if __import__("sys").platform == "emscripten" else 1)), f"5 sorgu eşzamanlı ~0.05 s sürmeli; {sure:.2f} s sürdü. time.sleep olay döngüsünü kilitler"\n',
    hints: ['Olay döngüsü tek iş parçacığında çalışır; engelleyen (blocking) bir çağrı herkesi bekletir.', '<code>time.sleep</code> kontrolü döngüye geri vermez.', '<code>await asyncio.sleep(0.05)</code>'],
    why: 'asyncio işbirlikçi (cooperative) çoklu görevdir: görev ancak await noktasında kontrolü bırakır. time.sleep, senkron bir veritabanı sürücüsü ya da requests çağrısı tüm döngüyü durdurur, gather’ı sıralı hâle getirir (süre n·t). Düzeltme sonrası süre max(t) olur. Değiştiremeyeceğin senkron bir kütüphane varsa await asyncio.to_thread(fonk, ...) ile ayrı iş parçacığına itilir; CPU yoğun iş için ProcessPoolExecutor + loop.run_in_executor.',
    tags: ['blocking', 'asyncio.sleep', 'gather'],
    min: 4
  },

  {
    id: 'b-357',
    lv: 'ileri',
    topic: 'async',
    diff: 2,
    kind: 'yaz',
    title: 'Kısmi başarısızlıkta toplu sorgu',
    q: '<p>Gün sonu raporu için birçok hesabın bakiyesi eşzamanlı çekiliyor; bazı hesaplar hata verebilir ama rapor yine de üretilmeli. <code>toplu_bakiye(hesaplar, sorgula)</code> coroutine\'ini yaz: <code>sorgula(hesap)</code> bir coroutine fonksiyonudur. Hepsini <code>asyncio.gather(..., return_exceptions=True)</code> ile çalıştır ve <code>(basarili, hatali)</code> döndür: <code>basarili</code> = <code>{hesap: bakiye}</code>, <code>hatali</code> = <code>[(hesap, hata_sınıfının_adı), ...]</code> (girdi sırasıyla).</p>',
    start: 'import asyncio\n\nasync def toplu_bakiye(hesaplar, sorgula):\n    pass\n',
    sol: 'import asyncio\n\nasync def toplu_bakiye(hesaplar, sorgula):\n    sonuclar = await asyncio.gather(*(sorgula(h) for h in hesaplar), return_exceptions=True)\n    basarili, hatali = {}, []\n    for h, s in zip(hesaplar, sonuclar):\n        if isinstance(s, Exception):\n            hatali.append((h, type(s).__name__))\n        else:\n            basarili[h] = s\n    return basarili, hatali\n',
    tests: 'def _calistir(coro):\n    loop = asyncio.new_event_loop()\n    try:\n        return loop.run_until_complete(coro)\n    finally:\n        loop.close()\n\nasync def _sorgula(h):\n    await asyncio.sleep(0.001)\n    if h == "TR3":\n        raise TimeoutError("yanıt yok")\n    if h == "TR5":\n        raise KeyError(h)\n    return int(h[2:]) * 100\nb, e = _calistir(toplu_bakiye(["TR1", "TR3", "TR2", "TR5"], _sorgula))\nassert b == {"TR1": 100, "TR2": 200}, f"Başarılılar {{\'TR1\': 100, \'TR2\': 200}} olmalı; gelen {b}"\nassert e == [("TR3", "TimeoutError"), ("TR5", "KeyError")], f"Hatalar girdi sırasıyla (hesap, sınıf adı); gelen {e}"\nassert _calistir(toplu_bakiye([], _sorgula)) == ({}, []), "Boş girdi → ({}, [])"\n',
    hints: ['<code>return_exceptions=True</code> hataları fırlatmak yerine sonuç listesine istisna nesnesi olarak koyar.', 'Sonuçları <code>zip(hesaplar, sonuclar)</code> ile hesaplarla eşle; gather sırayı korur.', '<code>isinstance(s, Exception)</code> ve <code>type(s).__name__</code>'],
    why: 'Varsayılan gather ilk hatayı yukarı fırlatır, diğer sonuçları kaybettirir; return_exceptions=True ile her görevin sonucu ya da hatası yerinde döner, kısmi başarı raporlanabilir. Toplam süre en yavaş sorgu kadar; işleme O(n). Python 3.11+ asyncio.TaskGroup ise "biri düşerse hepsini iptal et" anlamına gelir ve hataları ExceptionGroup olarak toplar; hangisini seçeceğin iş kuralına bağlı. Not: CancelledError BaseException olduğundan isinstance(..., Exception) onu ayrı tutar.',
    tags: ['gather', 'return_exceptions', 'hata yönetimi'],
    min: 6
  },

  {
    id: 'b-358',
    lv: 'ileri',
    topic: 'async',
    diff: 3,
    kind: 'yaz',
    title: 'İlk başarılı yanıtı al, gerisini iptal et',
    q: '<p>Döviz kuru üç ayrı sağlayıcıdan sorgulanabiliyor; en hızlı <b>başarılı</b> yanıt kullanılmalı (hedged request). <code>ilk_basarili(kaynaklar)</code> coroutine\'ini yaz: <code>kaynaklar</code> argümansız coroutine fonksiyonlarının listesi. Hepsini görev (task) olarak başlat, ilk başarılı sonucu döndür ve kalan görevleri <b>iptal et</b>. Hata veren görevi atla; hepsi başarısız olursa <code>RuntimeError("hiçbir kaynak yanıt vermedi")</code> fırlat.</p>',
    start: 'import asyncio\n\nasync def ilk_basarili(kaynaklar):\n    pass\n',
    sol: 'import asyncio\n\nasync def ilk_basarili(kaynaklar):\n    bekleyen = {asyncio.ensure_future(k()) for k in kaynaklar}\n    try:\n        while bekleyen:\n            biten, bekleyen = await asyncio.wait(bekleyen, return_when=asyncio.FIRST_COMPLETED)\n            for g in biten:\n                if g.exception() is None:\n                    return g.result()\n        raise RuntimeError("hiçbir kaynak yanıt vermedi")\n    finally:\n        for g in bekleyen:\n            g.cancel()\n',
    tests: 'def _calistir(coro):\n    loop = asyncio.new_event_loop()\n    try:\n        return loop.run_until_complete(coro)\n    finally:\n        loop.close()\n\niptal = []\ndef _kaynak(ad, sure, hata=False):\n    async def k():\n        try:\n            await asyncio.sleep(sure)\n        except asyncio.CancelledError:\n            iptal.append(ad)\n            raise\n        if hata:\n            raise ConnectionError(ad)\n        return ad\n    return k\nr = _calistir(ilk_basarili([_kaynak("yavaş", 0.2), _kaynak("hatalı", 0.01, True), _kaynak("hızlı", 0.03)]))\nassert r == "hızlı", f"Hatalı kaynak atlanıp ilk başarılı (\'hızlı\') dönmeli; gelen {r!r}"\nassert iptal == ["yavaş"], f"Kalan görev iptal edilmeli; iptal edilenler {iptal}"\ntry:\n    _calistir(ilk_basarili([_kaynak("a", 0.01, True), _kaynak("b", 0.02, True)]))\n    assert False, "Hepsi başarısızsa RuntimeError bekleniyordu"\nexcept RuntimeError:\n    pass\n',
    hints: ['<code>asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)</code> biten ve bekleyen kümelerini döndürür; döngüyle tekrar çağır.', 'Biten görevde <code>g.exception() is None</code> ise başarılıdır.', 'Kalan görevleri <code>finally</code> bloğunda <code>cancel()</code> et; böylece hem return hem raise yolunda temizlenir.'],
    why: 'asyncio.wait + FIRST_COMPLETED, görevleri bittikçe tek tek değerlendirmeyi sağlar; gather hepsini beklerdi. Kalan görevlerin iptali kaynak sızıntısını (açık bağlantı, boşa harcanan kota) önler; finally bunu her çıkış yolunda garanti eder. Gecikme = en hızlı başarılı yanıt süresi. Alternatif: asyncio.as_completed ile döngü (ama iptal için görev referanslarını ayrıca tutman gerekir). Hedged request gecikme kuyruğunu (p99) düşürür ama karşı sisteme ek yük bindirir; genelde ikinci istek kısa bir gecikmeden sonra gönderilir.',
    tags: ['asyncio.wait', 'FIRST_COMPLETED', 'cancel', 'hedged request'],
    min: 12
  },

  {
    id: 'b-359',
    lv: 'ileri',
    topic: 'Eşzamanlılık',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    title: 'Future ve geri çağrı (callback)',
    q: '<p><code>concurrent.futures.Future</code> nesnesine geri çağrı ekleyen bu kod ne yazdırır?</p>',
    code: 'from concurrent.futures import Future\n\nf = Future()\nf.add_done_callback(lambda x: print("geri çağrı:", x.result()))\nprint("hazır mı:", f.done())\nf.set_result(42)\nprint("hazır mı:", f.done())\n',
    o: ['hazır mı: False\nhazır mı: True', 'hazır mı: False\ngeri çağrı: 42\nhazır mı: True', 'geri çağrı: 42\nhazır mı: False\nhazır mı: True', 'hazır mı: False\nhazır mı: True\ngeri çağrı: 42'],
    a: 1,
    hints: ['Geri çağrı eklendiği anda değil, Future tamamlandığında çalışır.', 'set_result çağrısı geri çağrıları hemen (aynı iş parçacığında) tetikler.'],
    why: 'Future henüz sonuçlanmamış bir işin temsilidir. add_done_callback fonksiyonu kaydeder; set_result sonucu yazar ve kayıtlı geri çağrıları o anda, set_result’ı çağıran iş parçacığında çalıştırır. Future zaten bitmişse add_done_callback geri çağrıyı hemen çalıştırır. Havuzlarda (ThreadPoolExecutor.submit) set_result’ı işçi thread çağırır, bu yüzden geri çağrı işçi thread’de koşar: paylaşılan veriye dokunuyorsa kilit gerekir.',
    tags: ['Future', 'callback', 'concurrent.futures'],
    min: 3
  },

  {
    id: 'b-360',
    lv: 'ileri',
    topic: 'Eşzamanlılık',
    diff: 3,
    kind: 'rehberli',
    title: 'Havalede kilitlenmeyi (deadlock) önle',
    q: '<p>Ilgaz Bank\'ta iki iş parçacığı aynı anda A→B ve B→A havalesi yaparsa, her biri bir hesabın kilidini alıp diğerini beklerse sistem kilitlenir (deadlock). <code>havale(kaynak, hedef, tutar)</code> fonksiyonunu yaz: iki hesabın kilidini <b>her zaman hesap numarası küçük olandan başlayarak</b> alsın, bakiye yetersizse <code>ValueError</code> fırlatsın, değilse parayı aktarsın. <code>Hesap</code> sınıfı verilmiştir.</p>',
    guide: ['İki hesabı <code>no</code> değerine göre sırala: <code>ilk, ikinci = sorted([kaynak, hedef], key=lambda h: h.no)</code>.', 'İç içe iki <code>with</code> bloğuyla önce <code>ilk.kilit</code>, sonra <code>ikinci.kilit</code> al.', 'Kilitlerin içinde bakiye kontrolü yap; yetersizse <code>ValueError</code>.', 'Kaynaktan düş, hedefe ekle.'],
    example: 'import threading\n# Tutarlı kilit sırası: kaynak adlarına göre alfabetik\nkilitler = {"rapor": threading.Lock(), "arsiv": threading.Lock()}\ndef iki_kaynakla_calis(a, b):\n    for ad in sorted([a, b]):\n        print("kilit alınıyor:", ad)\niki_kaynakla_calis("rapor", "arsiv")\niki_kaynakla_calis("arsiv", "rapor")   # aynı sıra!\n',
    start: 'import threading\n\nclass Hesap:\n    def __init__(self, no, bakiye):\n        self.no = no\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\ndef havale(kaynak, hedef, tutar):\n    # TODO 1: hesapları no\'ya göre sırala\n    # TODO 2: kilitleri bu sırayla al (iç içe with)\n    # TODO 3: bakiye yetersizse ValueError\n    # TODO 4: aktarımı yap\n    with kaynak.kilit:\n        with hedef.kilit:\n            kaynak.bakiye -= tutar\n            hedef.bakiye += tutar\n',
    sol: 'import threading\n\nclass Hesap:\n    def __init__(self, no, bakiye):\n        self.no = no\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\ndef havale(kaynak, hedef, tutar):\n    ilk, ikinci = sorted([kaynak, hedef], key=lambda h: h.no)\n    with ilk.kilit:\n        with ikinci.kilit:\n            if kaynak.bakiye < tutar:\n                raise ValueError("Yetersiz bakiye")\n            kaynak.bakiye -= tutar\n            hedef.bakiye += tutar\n',
    tests: 'kayit = []\nclass _IzKilit:\n    def __init__(self, ad):\n        self.ad = ad\n        self._k = threading.Lock()\n    def __enter__(self):\n        kayit.append(self.ad)\n        self._k.acquire()\n    def __exit__(self, *a):\n        self._k.release()\n        return False\na, b = Hesap(1, 500), Hesap(2, 100)\na.kilit, b.kilit = _IzKilit(1), _IzKilit(2)\nhavale(a, b, 200)\nhavale(b, a, 50)\nassert kayit == [1, 2, 1, 2], f"Kilitler her iki yönde de küçük numaradan başlamalı: [1, 2, 1, 2]; gelen {kayit}"\nassert (a.bakiye, b.bakiye) == (350, 250), f"Bakiyeler (350, 250) olmalı; gelen {(a.bakiye, b.bakiye)}"\ntry:\n    havale(b, a, 1000)\n    assert False, "Yetersiz bakiyede ValueError bekleniyordu"\nexcept ValueError:\n    pass\nassert (a.bakiye, b.bakiye) == (350, 250), "Başarısız havale bakiyeleri değiştirmemeli"\nassert not a.kilit._k.locked() and not b.kilit._k.locked(), "Hata sonrasında kilitler serbest kalmalı (with kullan)"\n',
    hints: ['Kilitlenme, iki iş parçacığının kilitleri ters sırada almasıyla oluşur; global bir sıra koy.', '<code>sorted([kaynak, hedef], key=lambda h: h.no)</code>', 'Bakiye kontrolü kilitlerin içinde olmalı; dışarıda yaparsan kontrol ile güncelleme arasında başka thread araya girebilir.'],
    why: 'Coffman koşullarından "döngüsel bekleme" tüm kilitler için tek bir küresel sıra belirlenerek kırılır: herkes önce küçük numarayı aldığı için iki thread’in birbirini beklediği bir döngü oluşamaz. with blokları istisna olsa bile kilitleri bırakır. Kontrol (bakiye ≥ tutar) ve işlem (düş/ekle) aynı kritik bölgede olmalı, yoksa "kontrol et-sonra-yap" yarış durumu oluşur. Alternatifler: tek global kilit (basit ama ölçeklenmez), acquire(timeout=...) ile geri çekilip yeniden deneme, ya da veritabanında SELECT ... FOR UPDATE ile aynı sıralama kuralı.',
    tags: ['deadlock', 'Lock', 'kilit sırası'],
    min: 9
  }
);
})(window);
