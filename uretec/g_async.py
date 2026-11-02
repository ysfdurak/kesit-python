from genlib import *

RUN = '\nloop = asyncio.new_event_loop()\nloop.run_until_complete(main())\nloop.close()'
CAL = 'import asyncio\ndef calistir(coro):\n    loop = asyncio.new_event_loop()\n    try:\n        return loop.run_until_complete(coro)\n    finally:\n        loop.close()\n'

html = (
'<h2>Derinleş: yapılandırılmış eşzamanlılık, iptal, kuyruk ve dayanıklılık</h2>'
'<p>gather, create_task, Semaphore ve wait_for ile birden çok işi aynı anda yürütebiliyorsun. Üretimdeki bir async servis ise daha fazlasını ister: görevlerin hata durumunda birlikte iptal edilmesi, ilk gelen cevabı alıp diğerlerini durdurmak, iptal edilen işin arkasını temizlemesi, sabit sayıda işçiyle kuyruk işlemek, paylaşılan durumu korumak ve geçici hatalarda yeniden denemek. Bu bölüm bu kalıpları tamamlıyor.</p>'
'<h3>Kendi bilgisayarında: kurulum ve sık hatalar</h3>'
'<p>asyncio standart kütüphanededir, kurulum gerekmez. Gerçek HTTP istekleri için async destekli bir istemci kurarsın; <code>requests</code> senkrondur ve olay döngüsünü bloklar.</p>'
+ pcode('''python -m pip install httpx          # ya da: aiohttp

import asyncio, httpx

async def main():
    async with httpx.AsyncClient(timeout=5) as istemci:
        cevaplar = await asyncio.gather(
            *(istemci.get(f"https://api.ornek.com/musteri/{i}") for i in range(10)))
    print([c.status_code for c in cevaplar])

asyncio.run(main())        # betikte standart giriş noktası''') +
'<div class="tbl-wrap"><table><tr><th>Hata / uyarı</th><th>Neden</th><th>Çözüm</th></tr>'
'<tr><td><code>RuntimeWarning: coroutine \'...\' was never awaited</code></td><td>async fonksiyon await edilmeden çağrıldı</td><td>Başına <code>await</code> ekle ya da <code>create_task</code> ile zamanla</td></tr>'
'<tr><td><code>RuntimeError: asyncio.run() cannot be called from a running event loop</code></td><td>Jupyter gibi döngüsü zaten çalışan ortamda <code>asyncio.run</code></td><td>Jupyter\'de doğrudan <code>await main()</code> yaz</td></tr>'
'<tr><td><code>Task was destroyed but it is pending!</code></td><td>Program, görev bitmeden ya da iptal edilmeden kapandı</td><td>Görevleri <code>TaskGroup</code> içinde tut ya da kapanışta iptal edip bekle</td></tr>'
'<tr><td><code>TypeError: object NoneType can\'t be used in \'await\' expression</code></td><td>Senkron fonksiyon await edildi</td><td>Yalnızca coroutine, Task ve Future await edilir</td></tr>'
'<tr><td>Servis "donuyor"</td><td>Döngüde <code>time.sleep</code> ya da senkron ağ/veritabanı çağrısı</td><td>Async kütüphane ya da <code>asyncio.to_thread</code></td></tr>'
'</table></div>'
'<h3>TaskGroup: birlikte başla, birlikte bit</h3>'
'<p><code>async with asyncio.TaskGroup() as tg:</code> bloğunda <code>tg.create_task(...)</code> ile açılan tüm görevler blok bitmeden beklenir. Bir görev hata verirse grup <b>diğerlerini iptal eder</b> ve hataları <code>ExceptionGroup</code> içinde fırlatır; <code>except*</code> ile türüne göre yakalanır. gather\'dan farkı, "biri patladı ama diğerleri arka planda çalışmaya devam ediyor" durumunun olmamasıdır.</p>'
+ py('''import asyncio

async def sorgu(sistem: str, sure: float, hata: bool = False) -> str:
    await asyncio.sleep(sure)
    if hata:
        raise ConnectionError(f"{sistem} cevap vermedi")
    return f"{sistem}: tamam"

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(sorgu("kimlik", 0.02))
        t2 = tg.create_task(sorgu("skor", 0.01))
    print(t1.result(), "|", t2.result())

    try:
        async with asyncio.TaskGroup() as tg:
            yavas = tg.create_task(sorgu("kara_liste", 0.5))
            tg.create_task(sorgu("skor", 0.01, hata=True))
    except* ConnectionError as eg:
        print("hata:", eg.exceptions[0])
    print("yavaş görev iptal edildi mi?", yavas.cancelled())
''' + RUN) +
'<h3>İlk biteni almak: as_completed ve wait</h3>'
'<p><code>asyncio.as_completed(gorevler)</code> sonuçları <b>bitiş sırasına</b> göre verir; uzun süren bir listede ilk gelenleri ekrana basmak için idealdir. <code>asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)</code> ise (bitenler, bekleyenler) kümelerini döndürür; aynı veriyi üç yedek sunucudan isteyip en hızlısını almak ve diğerlerini iptal etmek tipik kullanımdır.</p>'
+ py('''import asyncio

async def kur(kaynak: str, sure: float) -> str:
    await asyncio.sleep(sure)
    return kaynak

async def main():
    for gelecek in asyncio.as_completed([kur("A", 0.05), kur("B", 0.01), kur("C", 0.03)]):
        print("geldi:", await gelecek)

    gorevler = [asyncio.create_task(kur(k, s)) for k, s in [("ana", 0.2), ("yedek", 0.02)]]
    biten, bekleyen = await asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)
    print("en hızlı:", biten.pop().result(), "| bekleyen:", len(bekleyen))
    for g in bekleyen:
        g.cancel()
    await asyncio.gather(*bekleyen, return_exceptions=True)   # iptalin bitmesini bekle
''' + RUN) +
'<h3>İptal (cancellation) ve temizlik</h3>'
'<p><code>task.cancel()</code> görevin beklediği noktaya <code>CancelledError</code> fırlatır. Görev <code>try/finally</code> ile bağlantıyı kapatmak, geçici dosyayı silmek gibi temizliği yapabilir. <code>CancelledError</code>\'ı yakalayıp yutma: <code>except Exception</code> onu yakalamaz (BaseException alt sınıfıdır) ama çıplak <code>except:</code> yakalar ve iptal sessizce bozulur. Yakalarsan temizlikten sonra <code>raise</code> ile yeniden fırlat.</p>'
'<h3>Kuyruk ve sabit işçi havuzu</h3>'
'<p>10.000 işi tek seferde gather\'a vermek 10.000 görev nesnesi demektir. <code>asyncio.Queue</code> ile N işçi kurup işleri kuyruktan çektirmek bellek ve eşzamanlılığı birlikte sınırlar. Her iş bittiğinde <code>task_done()</code>, üretici tarafında <code>await kuyruk.join()</code> "tüm işler işlendi" anını verir; sonra sonsuz döngüdeki işçiler iptal edilir.</p>'
+ py('''import asyncio

async def isci(ad: str, kuyruk: asyncio.Queue, sonuc: list):
    while True:
        siparis = await kuyruk.get()
        try:
            await asyncio.sleep(0.01)               # kargo API çağrısı
            sonuc.append((siparis, ad))
        finally:
            kuyruk.task_done()

async def main():
    kuyruk = asyncio.Queue()
    for no in range(1, 9):
        kuyruk.put_nowait(no)
    sonuc = []
    iscilar = [asyncio.create_task(isci(f"i{k}", kuyruk, sonuc)) for k in range(3)]
    await kuyruk.join()                             # hepsi işlendi
    for t in iscilar:
        t.cancel()
    await asyncio.gather(*iscilar, return_exceptions=True)
    print(len(sonuc), "sipariş,", len({ad for _, ad in sonuc}), "işçi kullandı")
''' + RUN) +
'<h3>Tek iş parçacığında da yarış olur: asyncio.Lock</h3>'
'<p>asyncio tek iş parçacığında çalışır, ama her <code>await</code> bir geçiş noktasıdır. Bakiyeyi okuyup <code>await</code> edip sonra yazarsan, araya giren başka bir görev aynı eski değeri okur ve bir güncelleme kaybolur. Okuma-bekleme-yazma bloğunu <code>async with kilit:</code> içine al. Bir görevin diğerine "hazırım" demesi için <code>asyncio.Event</code> kullanılır.</p>'
'<div class="tbl-wrap"><table><tr><th>Araç</th><th>Soru</th></tr>'
'<tr><td><code>TaskGroup</code></td><td>Hepsi birlikte başarılı olsun, biri düşerse hepsi dursun</td></tr>'
'<tr><td><code>gather(return_exceptions=True)</code></td><td>Hepsini dene, hataları sonuç listesinde topla</td></tr>'
'<tr><td><code>as_completed</code></td><td>Biten oldukça işle</td></tr>'
'<tr><td><code>wait(FIRST_COMPLETED)</code></td><td>İlk biteni al, kalanlara karar ver</td></tr>'
'<tr><td><code>Queue</code> + işçiler</td><td>Çok iş, sabit eşzamanlılık</td></tr>'
'<tr><td><code>Lock</code> / <code>Event</code></td><td>Paylaşılan durum / görevler arası sinyal</td></tr>'
'</table></div>'
'<h3>Yeniden deneme ve üstel geri çekilme</h3>'
'<p>Ağ hataları çoğu zaman geçicidir. Doğru tepki, hemen tekrar saldırmak değil, giderek artan aralıklarla (0.1, 0.2, 0.4 s; üstel geri çekilme, exponential backoff) birkaç kez denemek ve sonunda hatayı yukarı iletmektir. Yalnızca geçici hatalarda (bağlantı, zaman aşımı) yeniden dene; "yetkisiz" ya da "geçersiz istek" gibi kalıcı hataları tekrarlamak işe yaramaz.</p>'
+ py('''import asyncio

deneme_sayisi = 0

async def kararsiz_servis() -> str:
    global deneme_sayisi
    deneme_sayisi += 1
    await asyncio.sleep(0)
    if deneme_sayisi < 3:
        raise ConnectionError("geçici hata")
    return "skor: 712"

async def tekrar_dene(fabrika, deneme=4, bekleme=0.01):
    for i in range(deneme):
        try:
            return await fabrika()
        except ConnectionError as e:
            if i == deneme - 1:
                raise
            sure = bekleme * 2 ** i
            print(f"{i + 1}. deneme başarısız ({e}), {sure:.2f} s bekleniyor")
            await asyncio.sleep(sure)

async def main():
    print(await tekrar_dene(kararsiz_servis))
''' + RUN) +
'<div class="warn"><b>Fabrika ver, coroutine değil</b>Yeniden deneme fonksiyonuna <code>kararsiz_servis()</code> (coroutine nesnesi) verirsen ikinci denemede <code>cannot reuse already awaited coroutine</code> hatası alırsın: bir coroutine yalnızca bir kez await edilebilir. Fonksiyonun kendisini (<code>kararsiz_servis</code>) ya da <code>lambda: servis(id)</code> ver.</div>'
'<div class="note"><b>Gerçek işte</b>Bankacılık ve e-ticaret entegrasyonlarında async kodun büyük kısmı bu bölümdeki kalıplardan oluşur: dış sistem başına bir Semaphore (karşı tarafın hız sınırı), her çağrıya zaman aşımı, geçici hatalara üstel geri çekilmeli yeniden deneme, toplu işlerde kuyruk + işçi ve kapanışta görevlerin düzgün iptali. Bu parçalar eksik olduğunda servis ya karşı sistemi boğar ya da bir yavaş cevap yüzünden tamamen kilitlenir.</div>'
)

ex = [
 {'t': 'mc', 'stage': 'Isınma',
  'q': '<code>TaskGroup</code> içinde üç görev var; biri <code>ValueError</code> fırlatıyor. Ne olur?',
  'o': ['Diğer iki görev çalışmaya devam eder, hata yalnızca loglanır', 'Diğerleri iptal edilir, blok sonunda <code>ExceptionGroup</code> fırlatılır', 'Olay döngüsü durur ve program anında kapanır', 'Hata veren görev otomatik olarak bir kez daha denenir'], 'a': 1,
  'why': 'TaskGroup yapılandırılmış eşzamanlılık sağlar: bir görev başarısız olunca kardeşleri iptal edilir ve tüm hatalar ExceptionGroup içinde toplanıp blok çıkışında fırlatılır; except* ValueError ile yakalanır.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'as_completed sonuçları hangi sırayla verir?',
  'code': 'import asyncio\n\nasync def kur(ad, sure):\n    await asyncio.sleep(sure)\n    return ad\n\nasync def main():\n    sira = []\n    for g in asyncio.as_completed([kur("A", 0.06), kur("B", 0.01), kur("C", 0.03)]):\n        sira.append(await g)\n    print(sira)\n' + RUN + '\n',
  'o': ["['A', 'B', 'C']", "['B', 'C', 'A']", "['C', 'B', 'A']", "['A', 'C', 'B']"], 'a': 1,
  'why': 'as_completed girdi sırasını değil bitiş sırasını izler: B (0.01), C (0.03), A (0.06). Girdi sırası gerekiyorsa gather kullanılır.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Tek iş parçacığında iki görev aynı sayacı artırıyor. Ne yazdırır?',
  'code': 'import asyncio\n\nsayac = 0\n\nasync def artir():\n    global sayac\n    for _ in range(3):\n        eski = sayac\n        await asyncio.sleep(0)\n        sayac = eski + 1\n\nasync def main():\n    await asyncio.gather(artir(), artir())\n    print(sayac)\n' + RUN + '\n',
  'o': ['6', '3', '0', 'RuntimeError hatası verir'], 'a': 1,
  'why': 'Her await geçiş noktasıdır: iki görev de aynı eski değeri okuyup bekler, sonra ikisi de eski + 1 yazar. Her turda bir artış kaybolur ve sonuç 6 yerine 3 olur. Oku-bekle-yaz bloğu asyncio.Lock ile korunmalıdır.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Görev iptal ediliyor. Ne yazdırır?',
  'code': 'import asyncio\n\nasync def is_():\n    try:\n        await asyncio.sleep(1)\n    finally:\n        print("temizlik")\n\nasync def main():\n    t = asyncio.create_task(is_())\n    await asyncio.sleep(0)\n    t.cancel()\n    try:\n        await t\n    except asyncio.CancelledError:\n        print("iptal edildi")\n    print(t.cancelled())\n' + RUN + '\n',
  'o': ['iptal edildi\nTrue', 'temizlik\niptal edildi\nTrue', 'temizlik\nFalse', 'iptal edildi\ntemizlik\nTrue'], 'a': 1,
  'why': 'cancel, görevin beklediği sleep noktasına CancelledError fırlatır; finally bloğu çalışır ("temizlik"). Ardından await t aynı hatayı main\'e iletir ("iptal edildi") ve görev iptal edilmiş durumdadır.'},
 {'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Kuyruğa üç sipariş koyup tek işçiyle işleyen, tüm işler bitince işçiyi iptal eden programın satırlarını sırala (async fonksiyon gövdeleri girintili).</p>',
  'lines': ['import asyncio', 'async def isci(k, sonuc):', '    while True:', '        sonuc.append(await k.get() * 10)', '        k.task_done()', 'async def main():', '    k, sonuc = asyncio.Queue(), []', '    for n in (1, 2, 3): k.put_nowait(n)', '    t = asyncio.create_task(isci(k, sonuc))', '    await k.join(); t.cancel(); print(sonuc)', 'asyncio.new_event_loop().run_until_complete(main())'],
  'expect': '[10, 20, 30]\n',
  'hint': 'İşçi fonksiyonu önce tanımlanır; main kuyruğu doldurur, işçiyi başlatır, join ile bekler.',
  'why': 'join, her get için task_done çağrılana kadar bekler. İşçi sonsuz döngüde olduğundan iş bitince cancel ile durdurulur.'},
 {'t': 'code', 'id': 'async-x1', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>tekrar_dene(fabrika, deneme=3, bekleme=0.1)</code> coroutine\'ini yaz. <code>fabrika</code> argümansız bir fonksiyondur ve her çağrıda yeni bir coroutine döndürür. <code>await fabrika()</code> başarılıysa sonucu döndür. <code>ConnectionError</code> olursa <code>asyncio.sleep(bekleme * 2 ** i)</code> bekleyip tekrar dene (i = 0, 1, ...). Son deneme de başarısızsa hatayı yeniden fırlat. Diğer hatalar hiç yeniden denenmesin.</p>',
  'guide': ['range(deneme) ile deneme numarası i üzerinde döngü kur.', 'try içinde return await fabrika().', 'except ConnectionError: son denemeyse raise, değilse bekleme * 2 ** i kadar asyncio.sleep.', 'Diğer hata türlerini yakalama; kendiliğinden yukarı çıksınlar.'],
  'example': 'import asyncio\n\nasync def bekle_ve_say(n):\n    for i in range(n):\n        sure = 0.001 * 2 ** i\n        print(i, sure)\n        await asyncio.sleep(sure)\n\nasyncio.new_event_loop().run_until_complete(bekle_ve_say(3))\n',
  'start': 'import asyncio\n\nasync def tekrar_dene(fabrika, deneme=3, bekleme=0.1):\n    for i in range(deneme):\n        # TODO: try: return await fabrika()\n        # TODO: except ConnectionError: son denemeyse raise, değilse bekle\n        pass\n',
  'sol': 'import asyncio\n\nasync def tekrar_dene(fabrika, deneme=3, bekleme=0.1):\n    for i in range(deneme):\n        try:\n            return await fabrika()\n        except ConnectionError:\n            if i == deneme - 1:\n                raise\n            await asyncio.sleep(bekleme * 2 ** i)\n',
  'tests': CAL + 'gercek_sleep = asyncio.sleep\nbeklemeler = []\nasync def sahte_sleep(s):\n    beklemeler.append(round(s, 6))\n    await gercek_sleep(0)\nasyncio.sleep = sahte_sleep\ntry:\n    sayac = {"n": 0}\n    async def kararsiz():\n        sayac["n"] += 1\n        if sayac["n"] < 3:\n            raise ConnectionError("geçici")\n        return "tamam"\n    assert calistir(tekrar_dene(kararsiz, deneme=3, bekleme=0.1)) == "tamam", "Üçüncü denemede başarılı olmalı"\n    assert sayac["n"] == 3, f"3 deneme yapılmalı; yapılan {sayac[\'n\']}"\n    assert beklemeler == [0.1, 0.2], f"Beklemeler 0.1 ve 0.2 olmalı (üstel); gelen {beklemeler}"\n    beklemeler.clear()\n    async def hep_bozuk():\n        raise ConnectionError("kalıcı")\n    try:\n        calistir(tekrar_dene(hep_bozuk, deneme=2, bekleme=0.1))\n        assert False, "Son denemeden sonra ConnectionError fırlatılmalı"\n    except ConnectionError:\n        pass\n    assert beklemeler == [0.1], "2 denemede yalnızca bir bekleme olmalı (son denemeden sonra beklenmez)"\n    sayac2 = {"n": 0}\n    async def yetkisiz():\n        sayac2["n"] += 1\n        raise PermissionError("yetki yok")\n    try:\n        calistir(tekrar_dene(yetkisiz))\n        assert False, "PermissionError yukarı çıkmalı"\n    except PermissionError:\n        pass\n    assert sayac2["n"] == 1, "Kalıcı hatalar yeniden denenmemeli"\nfinally:\n    asyncio.sleep = gercek_sleep\n',
  'hints': ['Her denemede fabrika() yeniden çağrılmalı; aynı coroutine iki kez await edilemez.', 'Son deneme kontrolü: if i == deneme - 1: raise', 'Bekleme süresi: bekleme * 2 ** i'],
  'why': 'Üstel geri çekilme geçici arızalarda karşı sistemi boğmadan toparlanma şansı verir. Yalnızca geçici hata türünü yakalamak, kalıcı hataların hemen görünmesini sağlar.'},
 {'t': 'code', 'id': 'async-x2', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>en_hizli(kaynaklar)</code> coroutine\'i <code>{ad: gecikme}</code> sözlüğündeki her kaynak için <code>asyncio.sleep(gecikme)</code> bekleyip adını döndüren bir görev başlatsın; <code>asyncio.wait(..., return_when=asyncio.FIRST_COMPLETED)</code> ile ilk biteni alsın, kalan görevleri iptal edip iptallerin bitmesini beklesin ve <code>(en_hızlı_ad, iptal_edilen_sayısı)</code> döndürsün.</p>',
  'guide': ['Her kaynak için asyncio.create_task ile görev oluştur.', 'biten, bekleyen = await asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)', 'bekleyen kümesindeki her görevi cancel et.', 'await asyncio.gather(*bekleyen, return_exceptions=True) ile iptalleri bekle; iptal edilenleri say.'],
  'example': 'import asyncio\n\nasync def main():\n    g = [asyncio.create_task(asyncio.sleep(s, result=s)) for s in (0.05, 0.01)]\n    biten, bekleyen = await asyncio.wait(g, return_when=asyncio.FIRST_COMPLETED)\n    print([t.result() for t in biten], len(bekleyen))\n    for t in bekleyen:\n        t.cancel()\n\nasyncio.new_event_loop().run_until_complete(main())\n',
  'start': 'import asyncio\n\nasync def getir(ad, gecikme):\n    await asyncio.sleep(gecikme)\n    return ad\n\nasync def en_hizli(kaynaklar):\n    gorevler = [asyncio.create_task(getir(a, g)) for a, g in kaynaklar.items()]\n    # TODO: asyncio.wait ile ilk biteni al\n    # TODO: bekleyenleri iptal et ve bekle\n    sonuclar = await asyncio.gather(*gorevler)\n    return sonuclar[0], 0\n',
  'sol': 'import asyncio\n\nasync def getir(ad, gecikme):\n    await asyncio.sleep(gecikme)\n    return ad\n\nasync def en_hizli(kaynaklar):\n    gorevler = [asyncio.create_task(getir(a, g)) for a, g in kaynaklar.items()]\n    biten, bekleyen = await asyncio.wait(gorevler, return_when=asyncio.FIRST_COMPLETED)\n    for t in bekleyen:\n        t.cancel()\n    await asyncio.gather(*bekleyen, return_exceptions=True)\n    iptal = sum(t.cancelled() for t in bekleyen)\n    return next(iter(biten)).result(), iptal\n',
  'tests': CAL + 'import time\nt0 = time.perf_counter()\nr = calistir(en_hizli({"ana": 1.5, "yedek1": 0.02, "yedek2": 1.2}))\nsure = time.perf_counter() - t0\nassert r == ("yedek1", 2), f"En hızlı yedek1, 2 görev iptal; gelen {r}"\nassert sure < 0.8, f"Yavaş kaynaklar beklenmemeli; süre {sure:.2f} s"\nassert calistir(en_hizli({"tek": 0.01})) == ("tek", 0), "Tek kaynakta iptal yok"\n',
  'hints': ['asyncio.wait kümeler döndürür: (biten, bekleyen).', 'İptal sayısı: sum(t.cancelled() for t in bekleyen) — gather ile bekledikten sonra.', 'Sonuç: next(iter(biten)).result()'],
  'why': 'wait(FIRST_COMPLETED) "yedekli istek" (hedged request) kalıbının temelidir: en hızlı cevabı alır, gereksiz işleri iptal ederek kaynak harcamasını keser.'},
 {'t': 'code', 'id': 'async-x3', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>kuyrukla_isle(siparisler, isci_sayisi)</code> coroutine\'i bir <code>asyncio.Queue</code> kursun, siparişleri kuyruğa koysun ve <code>isci_sayisi</code> işçi başlatsın. Her işçi kuyruktan sipariş alıp <code>asyncio.sleep(0.1)</code> beklesin ve <code>siparis * 10</code> değerini sonuç listesine eklesin. <code>join</code> ile tüm işler bitince işçileri iptal etsin ve sonuçları <b>sıralı</b> liste olarak döndürsün.</p>',
  'guide': ['Kuyruğu oluştur ve put_nowait ile doldur.', 'İşçi: while True içinde await get, sleep, ekle, finally içinde task_done.', 'isci_sayisi kadar create_task ile işçi başlat.', 'await kuyruk.join(); işçileri cancel et; gather(..., return_exceptions=True) ile bekle; sorted döndür.'],
  'example': 'import asyncio\n\nasync def main():\n    k = asyncio.Queue()\n    for x in "abc":\n        k.put_nowait(x)\n    while not k.empty():\n        print(await k.get())\n        k.task_done()\n    await k.join()\n    print("bitti")\n\nasyncio.new_event_loop().run_until_complete(main())\n',
  'start': 'import asyncio\n\nasync def isci(kuyruk, sonuc):\n    while True:\n        siparis = await kuyruk.get()\n        # TODO: bekle, sonuca ekle, task_done (finally içinde)\n\nasync def kuyrukla_isle(siparisler, isci_sayisi):\n    kuyruk = asyncio.Queue()\n    sonuc = []\n    # TODO: kuyruğu doldur, işçileri başlat, join, iptal\n    return sorted(sonuc)\n',
  'sol': 'import asyncio\n\nasync def isci(kuyruk, sonuc):\n    while True:\n        siparis = await kuyruk.get()\n        try:\n            await asyncio.sleep(0.1)\n            sonuc.append(siparis * 10)\n        finally:\n            kuyruk.task_done()\n\nasync def kuyrukla_isle(siparisler, isci_sayisi):\n    kuyruk = asyncio.Queue()\n    sonuc = []\n    for s in siparisler:\n        kuyruk.put_nowait(s)\n    iscilar = [asyncio.create_task(isci(kuyruk, sonuc)) for _ in range(isci_sayisi)]\n    await kuyruk.join()\n    for t in iscilar:\n        t.cancel()\n    await asyncio.gather(*iscilar, return_exceptions=True)\n    return sorted(sonuc)\n',
  'tests': CAL + 'import time\nt0 = time.perf_counter()\nr = calistir(kuyrukla_isle(list(range(1, 9)), 4))\nsure = time.perf_counter() - t0\nassert r == [x * 10 for x in range(1, 9)], f"Tüm siparişler işlenmeli; gelen {r}"\nassert sure < 0.6, f"4 işçiyle 8 iş yaklaşık 2 tur (0.2 s) sürmeli, sırayla 0.8 s sürerdi; süre {sure:.2f} s"\nassert calistir(kuyrukla_isle([], 3)) == [], "Boş liste boş sonuç"\n',
  'hints': ['task_done her get için bir kez çağrılmalı; yoksa join hiç bitmez.', 'İşçiler sonsuz döngüde; join sonrası cancel şart.', 'iscilar = [asyncio.create_task(isci(kuyruk, sonuc)) for _ in range(isci_sayisi)]'],
  'why': 'Kuyruk + sabit işçi, eşzamanlılığı ve belleği birlikte sınırlar. join "tüm işler işlendi" anını, cancel ise işçilerin düzgün kapanmasını sağlar.'},
 {'t': 'code', 'id': 'async-x4', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><code>basvuru_kontrol(musteriler)</code> coroutine\'i <code>asyncio.TaskGroup</code> kullanarak her müşteri için <code>skor_al(ad)</code> coroutine\'ini aynı anda çalıştırsın ve <code>{ad: skor}</code> döndürsün. <code>skor_al</code> verilmiş: 0.02 s bekler, boş ad için <code>ValueError</code> fırlatır. Hata durumunda TaskGroup\'un <code>ExceptionGroup</code>\'u yukarı çıkmalı (yakalama).</p>',
  'start': 'import asyncio\n\nasync def skor_al(ad):\n    await asyncio.sleep(0.02)\n    if not ad:\n        raise ValueError("boş müşteri adı")\n    return 600 + len(ad) * 10\n\nasync def basvuru_kontrol(musteriler):\n    pass\n',
  'sol': 'import asyncio\n\nasync def skor_al(ad):\n    await asyncio.sleep(0.02)\n    if not ad:\n        raise ValueError("boş müşteri adı")\n    return 600 + len(ad) * 10\n\nasync def basvuru_kontrol(musteriler):\n    async with asyncio.TaskGroup() as tg:\n        gorevler = {ad: tg.create_task(skor_al(ad)) for ad in musteriler}\n    return {ad: g.result() for ad, g in gorevler.items()}\n',
  'tests': CAL + 'TEPE = {"anlik": 0, "max": 0}\n_asil = skor_al\nasync def skor_al(ad):\n    TEPE["anlik"] += 1\n    TEPE["max"] = max(TEPE["max"], TEPE["anlik"])\n    try:\n        return await _asil(ad)\n    finally:\n        TEPE["anlik"] -= 1\nr = calistir(basvuru_kontrol(["Ayşe", "Mehmet", "Ali", "Can"]))\nassert r == {"Ayşe": 640, "Mehmet": 660, "Ali": 630, "Can": 630}, f"Skor sözlüğü yanlış: {r}"\nassert TEPE["max"] == 4, f"Dört sorgu aynı anda çalışmalı; aynı andaki en yüksek sayı {TEPE[\'max\']}"\ntry:\n    calistir(basvuru_kontrol(["Ayşe", ""]))\n    assert False, "Boş ad ExceptionGroup fırlatmalı"\nexcept ExceptionGroup as eg:\n    assert isinstance(eg.exceptions[0], ValueError), "İçteki hata ValueError olmalı"\nassert "TaskGroup" in __source__, "asyncio.TaskGroup kullan"\n',
  'hints': ['async with asyncio.TaskGroup() as tg: bloğu, içindeki görevler bitmeden çıkmaz.', 'Görevleri bir sözlükte tut; blok bittikten sonra g.result() ile sonuçları topla.'],
  'why': 'TaskGroup ile görevlerin ömrü bloğa bağlanır: blok bittiğinde hepsi tamamlanmış ya da iptal edilmiştir. Sonuçları blok sonrası result() ile okumak güvenlidir.'},
 {'t': 'code', 'id': 'async-x5', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>Hesap</code> sınıfının <code>yatir</code> coroutine\'i bakiyeyi okuyup bir denetim çağrısını (<code>await asyncio.sleep(0)</code>) bekledikten sonra yazıyor. 100 eşzamanlı 10 TL yatırma sonunda bakiye 1000 olmalı ama çok daha az çıkıyor. <code>asyncio.Lock</code> ile düzelt (denetim beklemesini silme).</p>',
  'start': 'import asyncio\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n\n    async def yatir(self, miktar):\n        eski = self.bakiye\n        await asyncio.sleep(0)          # denetim servisi\n        self.bakiye = eski + miktar\n\nasync def toplu_yatir(hesap, adet, miktar):\n    await asyncio.gather(*(hesap.yatir(miktar) for _ in range(adet)))\n    return hesap.bakiye\n',
  'sol': 'import asyncio\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n        self.kilit = asyncio.Lock()\n\n    async def yatir(self, miktar):\n        async with self.kilit:\n            eski = self.bakiye\n            await asyncio.sleep(0)          # denetim servisi\n            self.bakiye = eski + miktar\n\nasync def toplu_yatir(hesap, adet, miktar):\n    await asyncio.gather(*(hesap.yatir(miktar) for _ in range(adet)))\n    return hesap.bakiye\n',
  'tests': CAL + 'async def senaryo():\n    return await toplu_yatir(Hesap(), 100, 10)\nr = calistir(senaryo())\nassert r == 1000, f"Bakiye 1000 olmalı; gelen {r}. Oku-bekle-yaz bloğunu async with kilit içine al"\nassert "asyncio.sleep(0)" in __source__, "Denetim beklemesi kalmalı"\n',
  'hints': ['Her await bir geçiş noktasıdır; başka görev araya girip aynı eski bakiyeyi okur.', 'self.kilit = asyncio.Lock() ve yatir gövdesini async with self.kilit: içine al.'],
  'why': 'asyncio tek iş parçacığında çalışsa da await noktalarında görevler sıra değiştirir. Okuma ile yazma arasında await varsa bu kritik bölge kilitle korunmalıdır.'},
 {'t': 'code', 'id': 'async-x6', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>toplu_kur(kodlar)</code> her döviz kodu için <code>kur_al</code> çağırıp <code>{kod: kur}</code> döndürmeli; kur alınamayan kodların değeri <code>None</code> olmalı. Şu an tek bir hatalı kod (<code>"XXX"</code>) yüzünden fonksiyonun tamamı çöküyor.</p>',
  'start': 'import asyncio\n\nKURLAR = {"USD": 32.5, "EUR": 35.1, "GBP": 41.0}\n\nasync def kur_al(kod):\n    await asyncio.sleep(0.01)\n    if kod not in KURLAR:\n        raise KeyError(kod)\n    return KURLAR[kod]\n\nasync def toplu_kur(kodlar):\n    sonuclar = await asyncio.gather(*(kur_al(k) for k in kodlar))\n    return dict(zip(kodlar, sonuclar))\n',
  'sol': 'import asyncio\n\nKURLAR = {"USD": 32.5, "EUR": 35.1, "GBP": 41.0}\n\nasync def kur_al(kod):\n    await asyncio.sleep(0.01)\n    if kod not in KURLAR:\n        raise KeyError(kod)\n    return KURLAR[kod]\n\nasync def toplu_kur(kodlar):\n    sonuclar = await asyncio.gather(*(kur_al(k) for k in kodlar), return_exceptions=True)\n    return {k: (None if isinstance(s, Exception) else s) for k, s in zip(kodlar, sonuclar)}\n',
  'tests': CAL + 'r = calistir(toplu_kur(["USD", "XXX", "EUR"]))\nassert r == {"USD": 32.5, "XXX": None, "EUR": 35.1}, f"Beklenen USD 32.5, XXX None, EUR 35.1; gelen {r}"\nassert calistir(toplu_kur(["GBP"])) == {"GBP": 41.0}\n',
  'hints': ['gather varsayılan olarak ilk hatayı yukarı fırlatır.', 'return_exceptions=True ile hata sonuç listesine nesne olarak girer; isinstance(s, Exception) ile None\'a çevir.'],
  'why': 'Toplu sorgularda bir hatanın hepsini düşürmemesi için return_exceptions=True kullanılır; sonra her sonucun hata olup olmadığı tek tek kontrol edilir.'},
 {'t': 'code', 'id': 'async-x7', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Anadolu Bank\'ın kredi skoru servisi aynı anda en çok <code>limit</code> isteğe izin veriyor ve bazı istekler çok yavaş. <code>skor_topla(gecikmeler, limit, zaman_asimi)</code> yaz: <code>gecikmeler</code> <code>{musteri_id: saniye}</code> sözlüğü; her müşteri için verilen <code>sorgula(mid, gecikme)</code> coroutine\'ini <b>Semaphore(limit)</b> altında ve <b>istek başına</b> <code>zaman_asimi</code> ile çalıştır. Sonuç: <code>{"skor": {mid: skor}, "zaman_asimi": [mid, ...]}</code> (liste artan sıralı). Bir isteğin zaman aşımı diğerlerini etkilememeli; eşzamanlı istek sayısı hiçbir an <code>limit</code>\'i aşmamalı (test, <code>sorgula</code>\'nın tuttuğu <code>TEPE</code> değerine bakar).</p>',
  'start': 'import asyncio\n\nTEPE = {"anlik": 0, "max": 0}\n\nasync def sorgula(mid, gecikme):\n    TEPE["anlik"] += 1\n    TEPE["max"] = max(TEPE["max"], TEPE["anlik"])\n    try:\n        await asyncio.sleep(gecikme)\n        return 500 + mid\n    finally:\n        TEPE["anlik"] -= 1\n\nasync def skor_topla(gecikmeler, limit, zaman_asimi):\n    pass\n',
  'sol': 'import asyncio\n\nTEPE = {"anlik": 0, "max": 0}\n\nasync def sorgula(mid, gecikme):\n    TEPE["anlik"] += 1\n    TEPE["max"] = max(TEPE["max"], TEPE["anlik"])\n    try:\n        await asyncio.sleep(gecikme)\n        return 500 + mid\n    finally:\n        TEPE["anlik"] -= 1\n\nasync def skor_topla(gecikmeler, limit, zaman_asimi):\n    sem = asyncio.Semaphore(limit)\n\n    async def bir(mid, g):\n        async with sem:\n            return await asyncio.wait_for(sorgula(mid, g), timeout=zaman_asimi)\n\n    mids = list(gecikmeler)\n    sonuc = await asyncio.gather(*(bir(m, gecikmeler[m]) for m in mids), return_exceptions=True)\n    skor, gec = {}, []\n    for m, s in zip(mids, sonuc):\n        if isinstance(s, TimeoutError):\n            gec.append(m)\n        elif isinstance(s, BaseException):\n            raise s\n        else:\n            skor[m] = s\n    return {"skor": skor, "zaman_asimi": sorted(gec)}\n',
  'tests': CAL + 'import time\ng = {1: 0.02, 2: 3.0, 3: 0.02, 4: 0.02, 5: 3.0, 6: 0.02}\nTEPE.update(anlik=0, max=0)\nt0 = time.perf_counter()\nr = calistir(skor_topla(g, 2, 0.1))\nsure = time.perf_counter() - t0\nassert r["skor"] == {1: 501, 3: 503, 4: 504, 6: 506}, f"Hızlı müşterilerin skorları; gelen {r[\'skor\']}"\nassert r["zaman_asimi"] == [2, 5], f"Zaman aşımına uğrayanlar [2, 5]; gelen {r[\'zaman_asimi\']}"\nassert TEPE["max"] <= 2, f"Aynı anda en çok 2 istek olmalı; tepe {TEPE[\'max\']}"\nassert sure < 1.5, f"Yavaş istekler zaman aşımıyla kesilmeli; süre {sure:.2f} s"\nassert TEPE["anlik"] == 0, "İptal edilen istekler de sayacı geri almalı"\nassert calistir(skor_topla({}, 3, 0.1)) == {"skor": {}, "zaman_asimi": []}, "Boş girdi"\n',
  'hints': ['Her istek için iç coroutine: async with sem: return await asyncio.wait_for(sorgula(...), timeout=zaman_asimi).', 'gather(..., return_exceptions=True) zaman aşımlarını TimeoutError nesnesi olarak listeye koyar.', 'Python 3.11+ ile asyncio.TimeoutError, TimeoutError ile aynı sınıftır.'],
  'why': 'Semaphore karşı sistemin hız sınırına uyar, wait_for tek bir yavaş isteğin tüm işi kilitlemesini önler, return_exceptions hatayı istek düzeyinde yalıtır. Üçü birlikte dayanıklı bir entegrasyonun temel parçalarıdır.'},
]

faq = [
 {'q': 'gather mı TaskGroup mu kullanmalıyım?', 'a': 'Biri başarısız olunca hepsinin durması gerekiyorsa (bir başvurunun üç kontrolü) TaskGroup. Bağımsız işleri deneyip hataları tek tek raporlamak istiyorsan (1000 müşterinin skoru) gather(..., return_exceptions=True). TaskGroup Python 3.11 ile geldi; daha eski sürümde gather kullanılır.'},
 {'q': 'CancelledError\'ı yakalamam gerekir mi?', 'a': 'Genellikle hayır; temizlik için try/finally yeterlidir. Yakalaman gerekiyorsa (ör. iptal anında log yazmak) iş bitince mutlaka raise ile yeniden fırlat. Yutulan iptal, TaskGroup ve wait_for gibi araçların doğru çalışmasını bozar.'},
]
mistakes = [
 {'bad': 'coro = servis(id)\nawait tekrar_dene(coro)', 'good': 'await tekrar_dene(lambda: servis(id))', 'why': 'Bir coroutine yalnızca bir kez await edilebilir; yeniden denemeye her seferinde yeni coroutine üreten bir fabrika ver.'},
 {'bad': 'try:\n    await asyncio.sleep(10)\nexcept:\n    pass', 'good': 'try:\n    await asyncio.sleep(10)\nfinally:\n    temizle()', 'why': 'Çıplak except CancelledError\'ı da yutar ve görev iptal edilemez hale gelir; temizlik için finally kullan.'},
]

emit({'id': 'async', 'min': 30, 'html': html, 'ex': ex, 'faq': faq, 'mistakes': mistakes}, [])
