/* PythonPatika — pratik bankası: ileri görevler (b-361 … b-370) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-361',
    lv: 'ileri',
    topic: 'Eşzamanlılık',
    diff: 2,
    kind: 'bug',
    title: 'Hata sonrası bırakılmayan kilit',
    q: '<p>Kodda bir hata var, bul ve düzelt. <code>kaydet(kayit)</code> paylaşılan <code>islenen</code> listesine kilit altında ekleme yapıyor. Negatif tutarlı bir kayıt <code>ValueError</code> fırlattıktan sonra servis tamamen donuyor: sonraki tüm çağrılar kilidi sonsuza dek bekliyor.</p>',
    start: 'import threading\n\nkilit = threading.Lock()\nislenen = []\n\ndef kaydet(kayit):\n    kilit.acquire()\n    if kayit.get("tutar", 0) < 0:\n        raise ValueError("negatif tutar")\n    islenen.append(kayit)\n    kilit.release()\n',
    sol: 'import threading\n\nkilit = threading.Lock()\nislenen = []\n\ndef kaydet(kayit):\n    with kilit:\n        if kayit.get("tutar", 0) < 0:\n            raise ValueError("negatif tutar")\n        islenen.append(kayit)\n',
    tests: 'kaydet({"no": 1, "tutar": 50})\ntry:\n    kaydet({"no": 2, "tutar": -5})\n    assert False, "Negatif tutar ValueError fırlatmalı"\nexcept ValueError:\n    pass\nassert not kilit.locked(), "Hata sonrasında kilit serbest kalmalı: acquire/release yerine with kilit: kullan"\nkaydet({"no": 3, "tutar": 10})\nassert [k["no"] for k in islenen] == [1, 3], "Geçerli kayıtlar (1 ve 3) eklenmeli"\n',
    hints: ['İstisna fırladığında <code>kilit.release()</code> satırına hiç ulaşılmaz.', 'Kilidi her çıkış yolunda bırakmak için <code>try/finally</code> ya da bağlam yöneticisi gerekir.', '<code>with kilit:</code> bloğu istisnada da kilidi bırakır.'],
    why: 'Elle acquire/release çiftinde araya giren her return ya da istisna kilidi sızdırır ve sistem kilitlenir. with kilit: bağlam yöneticisi __exit__’te her durumda release çağırır (try/finally’nin kısa yolu). Kritik bölgeyi olabildiğince kısa tut: doğrulama gibi paylaşılan veriye dokunmayan işleri kilidin dışına almak bekleme süresini azaltır. Aynı thread’in kilidi yeniden alması gerekiyorsa threading.RLock kullanılır.',
    tags: ['Lock', 'with', 'kaynak sızıntısı'],
    min: 3
  },

  {
    id: 'b-362',
    lv: 'ileri',
    topic: 'Eşzamanlılık',
    diff: 2,
    kind: 'tamamla',
    title: 'Future sonuçlarını hatalarla birlikte topla',
    q: '<p>Rapor servisi birçok işi havuza gönderiyor ve <code>{Future: iş_adı}</code> sözlüğü tutuyor. <code>sonuclari_topla(isler)</code> işler bittikçe (<code>as_completed</code>) sonuçları toplasın: başarılılar <code>{ad: sonuç}</code>, hata verenler <code>{ad: hata_mesajı}</code>. <code>___</code> boşluklarını doldur.</p>',
    start: 'from concurrent.futures import Future, as_completed\n\ndef sonuclari_topla(isler):\n    basarili, hatali = {}, {}\n    for f in as_completed(isler):\n        ad = isler[f]\n        try:\n            basarili[ad] = f.___()\n        except ___ as e:\n            hatali[ad] = str(e)\n    return basarili, hatali\n',
    sol: 'from concurrent.futures import Future, as_completed\n\ndef sonuclari_topla(isler):\n    basarili, hatali = {}, {}\n    for f in as_completed(isler):\n        ad = isler[f]\n        try:\n            basarili[ad] = f.result()\n        except Exception as e:\n            hatali[ad] = str(e)\n    return basarili, hatali\n',
    tests: 'f1, f2, f3 = Future(), Future(), Future()\nf1.set_result(120)\nf2.set_exception(ValueError("eksik sütun"))\nf3.set_result(80)\nb, h = sonuclari_topla({f1: "satis", f2: "stok", f3: "iade"})\nassert b == {"satis": 120, "iade": 80}, f"Başarılı işler {{\'satis\': 120, \'iade\': 80}}; gelen {b}"\nassert h == {"stok": "eksik sütun"}, f"Hata mesajı yakalanmalı; gelen {h}"\n',
    hints: ['İşçide fırlayan istisna Future içinde saklanır ve sonucu istediğinde yeniden fırlatılır.', 'Sonucu almak için <code>f.result()</code>.', 'Genel iş hataları için <code>except Exception as e</code>.'],
    why: 'Havuzdaki bir iş hata verirse istisna kaybolmaz; Future içinde saklanır ve result() çağrısında yeniden fırlatılır. result() hiç çağrılmazsa hata sessizce yutulur — klasik bir üretim hatası. as_completed işleri bitiş sırasıyla verir, böylece yavaş bir iş hızlıların işlenmesini bekletmez; Executor.map ise girdi sırasını korur ama ilk hatada döngüyü keser. Alternatif: concurrent.futures.wait(isler, return_when=FIRST_EXCEPTION) ile ilk hatada durmak.',
    tags: ['Future', 'as_completed', 'hata yönetimi'],
    min: 3
  },

  {
    id: 'b-363',
    lv: 'ileri',
    topic: 'Eşzamanlılık',
    diff: 3,
    kind: 'yaz',
    title: 'İş parçacığı güvenli jeton kovası (rate limiter)',
    q: '<p>Ödeme API\'si saniyede en fazla belirli sayıda isteğe izin veriyor; birden çok işçi thread aynı sınırlayıcıyı paylaşacak. <code>TokenKovasi(kapasite, hiz, saat=time.monotonic)</code> sınıfını yaz: kova <code>kapasite</code> jetonla dolu başlar, saniyede <code>hiz</code> jeton dolar (kapasiteyi aşmaz). <code>izin_ver(maliyet=1)</code>: yeterli jeton varsa düşer ve <code>True</code>, yoksa <code>False</code> döndürür. Durum güncellemesini bir <code>threading.Lock</code> (<code>self.kilit</code>) altında yap. <code>saat</code> parametresi testte sahte saat vermek içindir.</p>',
    start: 'import threading\nimport time\n\nclass TokenKovasi:\n    pass\n',
    sol: 'import threading\nimport time\n\nclass TokenKovasi:\n    def __init__(self, kapasite, hiz, saat=time.monotonic):\n        self.kapasite = kapasite\n        self.hiz = hiz\n        self.saat = saat\n        self.jeton = float(kapasite)\n        self.son = saat()\n        self.kilit = threading.Lock()\n\n    def izin_ver(self, maliyet=1):\n        with self.kilit:\n            simdi = self.saat()\n            self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.hiz)\n            self.son = simdi\n            if self.jeton >= maliyet:\n                self.jeton -= maliyet\n                return True\n            return False\n',
    tests: 'zaman = [0.0]\nk = TokenKovasi(3, 2, saat=lambda: zaman[0])\nassert [k.izin_ver() for _ in range(4)] == [True, True, True, False], "Dolu kova 3 isteğe izin verir, 4.\'yü reddeder"\nzaman[0] = 0.5\nassert k.izin_ver() is True, "0.5 sn\'de 2 jeton/sn × 0.5 = 1 jeton dolar"\nassert k.izin_ver() is False, "Dolan tek jeton harcandı"\nzaman[0] = 100.0\nassert [k.izin_ver() for _ in range(4)] == [True, True, True, False], "Uzun bekleme kapasiteyi (3) aşmamalı"\nassert k.izin_ver(maliyet=0) is True\nzaman[0] = 101.0\nassert k.izin_ver(maliyet=3) is False and k.izin_ver(maliyet=2) is True, "Maliyet jetondan büyükse reddet, jeton düşme"\nassert hasattr(k, "kilit") and hasattr(k.kilit, "acquire"), "self.kilit bir Lock olmalı"\n',
    hints: ['Her çağrıda geçen süreye göre jeton ekle: <code>(simdi - son) * hiz</code>, sonra <code>min(kapasite, ...)</code>.', 'Son güncelleme zamanını sakla ve her çağrıda yenile.', 'Oku-hesapla-yaz adımlarının tümü <code>with self.kilit:</code> içinde olmalı.'],
    why: 'Jeton kovası kısa patlamalara (kapasite kadar) izin verirken uzun vadede ortalama hızı sınırlar; tembel dolum sayesinde arka planda zamanlayıcı gerekmez, her çağrı O(1). Saat time.monotonic olmalı: sistem saati geri alınırsa time.time negatif süre verir. Kilit olmadan iki thread aynı jetonu aynı anda harcayabilir. Alternatifler: sabit pencere sayacı (basit ama pencere sınırında 2× patlama), sızdıran kova (leaky bucket, sabit çıkış hızı), dağıtık sistemlerde Redis tabanlı sınırlayıcı.',
    tags: ['rate limiting', 'token bucket', 'Lock', 'monotonic'],
    min: 12
  },

  {
    id: 'b-364',
    lv: 'ileri',
    topic: 'Performans',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    title: 'Küçük önbellekte kim düşer?',
    q: '<p>Kapasitesi 2 olan LRU önbellekle döviz kurlarını sorgulayan bu kod ne yazdırır?</p>',
    code: 'from functools import lru_cache\n\n@lru_cache(maxsize=2)\ndef kur(doviz):\n    return len(doviz)\n\nfor d in ["USD", "EUR", "USD", "GBP", "EUR"]:\n    kur(d)\nprint(kur.cache_info())\n',
    o: ['CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)', 'CacheInfo(hits=2, misses=3, maxsize=2, currsize=2)', 'CacheInfo(hits=2, misses=3, maxsize=2, currsize=3)', 'CacheInfo(hits=1, misses=4, maxsize=2, currsize=3)'],
    a: 0,
    hints: ['LRU: en uzun süredir kullanılmayan (least recently used) eleman dolu önbellekten çıkarılır.', 'USD ikinci kez sorulunca "en yeni" olur; GBP gelince EUR düşer.'],
    why: 'Adım adım: USD ıska [USD]; EUR ıska [USD, EUR]; USD isabet → sıra [EUR, USD]; GBP ıska, en eski EUR düşer [USD, GBP]; EUR ıska, USD düşer [GBP, EUR]. Sonuç 1 isabet, 4 ıska; boyut kapasiteyi (2) aşamaz. Her işlem O(1)’dir (sözlük + çift bağlı liste). cache_info isabet oranını ölçmek için kullanılır; oran düşükse maxsize büyütülür ya da önbellek gereksizdir. Sınırsız önbellek için functools.cache, süreli önbellek için cachetools.TTLCache.',
    tags: ['lru_cache', 'önbellek', 'cache_info'],
    min: 3
  },

  {
    id: 'b-365',
    lv: 'ileri',
    topic: 'Performans',
    diff: 1,
    kind: 'order',
    t: 'order',
    title: 'Counter ile en çok satanlar',
    q: '<p>Ürünleri tek geçişte sayıp en çok satan 2 ürünü yazdıran programın satırlarını sırala.</p>',
    lines: ['from collections import Counter', 'sayac = Counter()', 'for urun in ["çay", "kahve", "çay", "süt", "çay", "kahve"]:', '    sayac[urun] += 1', 'en_cok = sayac.most_common(2)', 'print(en_cok)'],
    expect: '[(\'çay\', 3), (\'kahve\', 2)]\n',
    hints: ['Sayaç döngüden önce oluşturulmalı.', 'most_common ancak sayım bittikten sonra anlamlıdır.'],
    why: 'Counter sözlük tabanlıdır: her artış O(1), toplam O(n). most_common(k) içerde heapq.nlargest kullanır: O(n log k), tüm listeyi sıralamaktan (O(n log n)) ucuzdur. Kısa yol: Counter(urunler).most_common(2). Her ürün için liste.count(urun) çağırmak ise O(n²) olur — büyük veride klasik darboğaz.',
    tags: ['Counter', 'most_common', 'O(n)'],
    min: 2
  },

  {
    id: 'b-366',
    lv: 'ileri',
    topic: 'Performans',
    diff: 2,
    kind: 'rehberli',
    title: 'İç içe arama yerine sözlük indeksi',
    q: '<p>Her sipariş için müşteri listesini baştan sona tarayan rapor 20 bin siparişte dakikalar sürüyor. <code>siparis_zenginlestir(siparisler, musteriler)</code> fonksiyonunu yaz: <code>siparisler</code> <code>{"no", "musteri_id"}</code>, <code>musteriler</code> <code>{"id", "ad"}</code> sözlüklerinin listesi. Her sipariş için <code>(no, ad)</code> demeti döndür; müşterisi bulunamayan siparişte ad <code>None</code> olsun. Önce müşteri id → ad sözlüğü kur, sonra tek geçişte eşleştir.</p>',
    guide: ['Müşterilerden bir kez <code>{m["id"]: m["ad"] for m in musteriler}</code> indeksi kur: O(m).', 'Siparişlerde dolaş; her biri için indeksten <code>.get(id)</code> ile adı al: O(1).', 'Bulunamayan id için <code>.get</code> zaten <code>None</code> döndürür.', 'Sonuç listesini sipariş sırasıyla döndür.'],
    example: 'urunler = [{"kod": "A1", "fiyat": 10}, {"kod": "B2", "fiyat": 25}]\nfiyat_indeks = {u["kod"]: u["fiyat"] for u in urunler}   # bir kez kur\nsepet = ["B2", "A1", "C3"]\nprint([(k, fiyat_indeks.get(k)) for k in sepet])          # her arama O(1)\n',
    start: 'def siparis_zenginlestir(siparisler, musteriler):\n    # TODO 1: müşterilerden bir kez id → ad sözlüğü kur (iç içe döngü YOK)\n    indeks = {}\n    sonuc = []\n    for s in siparisler:\n        # TODO 2: indeksten .get ile adı al (bulunamazsa None)\n        ad = None\n        sonuc.append((s["no"], ad))\n    return sonuc\n',
    sol: 'def siparis_zenginlestir(siparisler, musteriler):\n    indeks = {m["id"]: m["ad"] for m in musteriler}\n    return [(s["no"], indeks.get(s["musteri_id"])) for s in siparisler]\n',
    tests: 'import time\nm = [{"id": 1, "ad": "Ayşe"}, {"id": 2, "ad": "Can"}]\ns = [{"no": 10, "musteri_id": 2}, {"no": 11, "musteri_id": 9}, {"no": 12, "musteri_id": 1}]\nassert siparis_zenginlestir(s, m) == [(10, "Can"), (11, None), (12, "Ayşe")], "Eşleşmeyen müşteri None olmalı, sıra korunmalı"\nN = 20000\nmb = [{"id": i, "ad": f"M{i}"} for i in range(N)]\nsb = [{"no": i, "musteri_id": (i * 7) % N} for i in range(N)]\nt0 = time.perf_counter()\nr = siparis_zenginlestir(sb, mb)\nsure = time.perf_counter() - t0\nassert r[3] == (3, "M21"), "Büyük veride eşleşme yanlış"\nassert sure < (1.0 * (4 if __import__("sys").platform == "emscripten" else 1)), f"20 bin × 20 bin için sözlük indeksiyle < 1 sn beklenir; {sure:.2f} sn sürdü (iç içe döngü O(n·m))"\n',
    hints: ['Darboğaz, her sipariş için tüm müşterileri taramak: 20.000 × 20.000 = 400 milyon karşılaştırma.', 'Sözlük anahtarla aramayı ortalama O(1) yapar.', '<code>indeks = {m["id"]: m["ad"] for m in musteriler}</code>, sonra <code>indeks.get(s["musteri_id"])</code>.'],
    why: 'İç içe döngüyle eşleştirme O(n·m)’dir; hash indeksiyle O(n + m)’ye iner — veritabanlarının hash join’i tam olarak budur. Bellek bedeli O(m). id tekrar ediyorsa sözlük son kaydı tutar; çoklu eşleşme gerekiyorsa defaultdict(list) kullanılır. Alternatifler: pandas merge, SQL JOIN; her iki liste id’ye göre sıralıysa iki işaretçili birleştirme (merge join) O(n + m) ve ek bellek gerektirmez.',
    tags: ['hash join', 'dict', 'karmaşıklık'],
    min: 6
  },

  {
    id: 'b-367',
    lv: 'ileri',
    topic: 'Performans',
    diff: 2,
    kind: 'bug',
    title: 'Kuyrukta list.pop(0) darboğazı',
    q: '<p>Kodda bir performans hatası var, bul ve düzelt. <code>sirayla_isle(isler)</code> işleri geliş sırasıyla (FIFO) işleyip her işin sonucunu listeye ekliyor; mantık doğru ama 60 bin işte saniyeler sürüyor. Sorun kuyruk veri yapısında.</p>',
    start: 'def sirayla_isle(isler):\n    kuyruk = list(isler)\n    sonuc = []\n    while kuyruk:\n        is_ = kuyruk.pop(0)\n        sonuc.append(is_ * 2)\n    return sonuc\n',
    sol: 'from collections import deque\n\ndef sirayla_isle(isler):\n    kuyruk = deque(isler)\n    sonuc = []\n    while kuyruk:\n        is_ = kuyruk.popleft()\n        sonuc.append(is_ * 2)\n    return sonuc\n',
    tests: 'import time\nassert sirayla_isle([3, 1, 2]) == [6, 2, 4], "FIFO sırası korunmalı"\nassert sirayla_isle([]) == [], "Boş kuyruk"\nt0 = time.perf_counter()\nr = sirayla_isle(range(60000))\nsure = time.perf_counter() - t0\nassert r[-1] == 119998, "Son iş yanlış işlendi"\nassert "pop(0)" not in __source__, "list.pop(0) her çağrıda tüm elemanları kaydırır (O(n)); deque.popleft() kullan"\nassert sure < (1.0 * (4 if __import__("sys").platform == "emscripten" else 1)), f"60 bin iş < 1 sn sürmeli; {sure:.2f} sn sürdü"\n',
    hints: ['Liste dizi tabanlıdır: baştan eleman silmek kalan tüm elemanları bir sola kaydırır.', '<code>collections.deque</code> iki uçtan da O(1) ekleme/çıkarma yapar.', '<code>kuyruk = deque(isler)</code> ve <code>kuyruk.popleft()</code>'],
    why: 'list.pop(0) O(n) olduğu için n işlik döngü O(n²) olur; deque.popleft() O(1) ile toplam O(n). Bu, BFS ve iş kuyruklarında en sık görülen gizli darboğazdır. Burada sıra değişmediği için doğrudan [x * 2 for x in isler] de yeterliydi; kuyruk gerçekten gerekiyorsa (işlerken yeni iş ekleniyorsa) deque doğru yapıdır. Thread’ler arası kuyruk için queue.Queue, asenkron için asyncio.Queue kullanılır.',
    tags: ['deque', 'pop(0)', 'O(n²)'],
    min: 4
  },

  {
    id: 'b-368',
    lv: 'ileri',
    topic: 'Performans',
    diff: 2,
    kind: 'yaz',
    title: 'Sonsuz akışı parçalara böl (tembel)',
    q: '<p>Banka işlem akışı bellek sığmayacak kadar büyük; satırları 1000\'lik paketler hâlinde veritabanına yazmak istiyoruz. <code>parcala(akis, boyut)</code> <b>üreteç</b> fonksiyonunu yaz: herhangi bir yinelenebiliri (liste, dosya, sonsuz üreteç) alıp <code>boyut</code> elemanlı <b>listeler</b> üretsin; son paket eksik olabilir. Tüm girdiyi belleğe alma (<code>list(akis)</code> yok); <code>boyut &lt; 1</code> ise <code>ValueError</code>.</p>',
    start: 'from itertools import islice\n\ndef parcala(akis, boyut):\n    pass\n',
    sol: 'from itertools import islice\n\ndef parcala(akis, boyut):\n    if boyut < 1:\n        raise ValueError("boyut en az 1 olmalı")\n    it = iter(akis)\n    while paket := list(islice(it, boyut)):\n        yield paket\n',
    tests: 'import itertools, inspect\nassert inspect.isgeneratorfunction(parcala), "parcala bir üreteç olmalı (yield)"\nassert list(parcala(range(7), 3)) == [[0, 1, 2], [3, 4, 5], [6]], "Son paket eksik olabilir"\nassert list(parcala([], 3)) == [], "Boş girdi → hiç paket yok"\nilk3 = list(islice(parcala(itertools.count(), 1000), 3))\nassert [p[0] for p in ilk3] == [0, 1000, 2000], "Sonsuz akışta tembel çalışmalı (list(akis) sonsuza dek sürer)"\ntry:\n    next(parcala([1], 0))\n    assert False, "boyut 0 için ValueError"\nexcept ValueError:\n    pass\n',
    hints: ['<code>iter(akis)</code> ile tek bir yineleyici al; her paket aynı yineleyiciden devam etmeli.', '<code>list(islice(it, boyut))</code> sonraki en fazla boyut elemanı alır; boşsa akış bitmiştir.', 'Mors operatörüyle: <code>while paket := list(islice(it, boyut)): yield paket</code>'],
    why: 'Üreteç, girdiyi istendikçe çektiği için bellek O(boyut)’ta kalır; toplam zaman O(n). Aynı yineleyiciden islice ile çekmek, dilimlemenin (akis[i:i+boyut]) yalnız listelerde çalışması kısıtını kaldırır. Python 3.12’de itertools.batched(akis, boyut) aynı işi demetlerle yapar; pandas’ta read_csv(chunksize=...) ve SQLAlchemy’de yield_per aynı fikrin karşılığıdır.',
    tags: ['üreteç', 'islice', 'bellek', 'walrus'],
    min: 6
  },

  {
    id: 'b-369',
    lv: 'ileri',
    topic: 'Performans',
    diff: 3,
    kind: 'yaz',
    title: 'Kayan pencerede en yüksek fiyat (O(n))',
    q: '<p>Borsa ekranı her an için son <code>k</code> işlemin en yüksek fiyatını gösteriyor. <code>kayan_maks(fiyatlar, k)</code> fonksiyonunu yaz: her tam pencere için maksimumu içeren liste döndürsün (uzunluk <code>n - k + 1</code>). Naif <code>max(pencere)</code> çözümü O(n·k) olduğu için 60 bin fiyat ve k=10000\'de çok yavaş; <code>collections.deque</code> ile <b>monoton kuyruk</b> kurarak O(n) çöz.</p>',
    start: 'from collections import deque\n\ndef kayan_maks(fiyatlar, k):\n    pass\n',
    sol: 'from collections import deque\n\ndef kayan_maks(fiyatlar, k):\n    dq = deque()          # indeksler; fiyatları azalan sırada\n    sonuc = []\n    for i, f in enumerate(fiyatlar):\n        while dq and fiyatlar[dq[-1]] <= f:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            sonuc.append(fiyatlar[dq[0]])\n    return sonuc\n',
    tests: 'import random, time\nassert kayan_maks([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7], "Klasik örnek"\nassert kayan_maks([4, 2], 1) == [4, 2], "k=1 diziyi aynen verir"\nassert kayan_maks([2, 2, 2], 2) == [2, 2], "Eşit değerler"\nrandom.seed(7)\nv = [random.randint(1, 100) for _ in range(300)]\nassert kayan_maks(v, 17) == [max(v[i:i + 17]) for i in range(len(v) - 16)], "Rastgele veride naif sonuçla aynı olmalı"\nbuyuk = [random.random() for _ in range(60000)]\nt0 = time.perf_counter()\nkayan_maks(buyuk, 10000)\nsure = time.perf_counter() - t0\nassert sure < (2.0 * (4 if __import__("sys").platform == "emscripten" else 1)), f"O(n) çözüm 2 sn altında bitmeli (naif max O(n·k) ≈ 5×10⁸ işlem); {sure:.2f} sn sürdü"\n',
    hints: ['Kuyrukta indeks tut; kuyruğun başı her zaman pencerenin en büyüğü olsun.', 'Yeni fiyat geldiğinde kuyruğun sonundaki daha küçük (ya da eşit) fiyatları at: onlar artık hiç maksimum olamaz.', 'Baştaki indeks pencereden çıktıysa (<code>dq[0] &lt;= i - k</code>) popleft.'],
    why: 'Her indeks kuyruğa bir kez girer ve en fazla bir kez çıkar; bu yüzden toplam iş O(n) (amortize), bellek O(k). Naif yöntem her pencerede max alır: O(n·k) — örnekte 10⁹ işlem. Alternatifler: heap ile O(n log n) (eski elemanları tembel silerek), pandas’ta Series.rolling(k).max() (C hızında), numpy’de sliding_window_view(a, k).max(axis=1) (O(n·k) ama vektörel).',
    tags: ['monoton kuyruk', 'deque', 'kayan pencere', 'amortize'],
    min: 14
  },

  {
    id: 'b-370',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    title: 'Elmas kalıtımda super() zinciri',
    q: '<p>Loglama ve denetim katmanlarını karışım (mixin) olarak birleştiren bu kod ne yazdırır?</p>',
    code: 'class Taban:\n    def kaydet(self):\n        return ["Taban"]\n\nclass Log(Taban):\n    def kaydet(self):\n        return ["Log"] + super().kaydet()\n\nclass Denetim(Taban):\n    def kaydet(self):\n        return ["Denetim"] + super().kaydet()\n\nclass Servis(Log, Denetim):\n    def kaydet(self):\n        return ["Servis"] + super().kaydet()\n\nprint(Servis().kaydet())\n',
    o: ['[\'Servis\', \'Log\', \'Taban\', \'Denetim\', \'Taban\']', '[\'Servis\', \'Denetim\', \'Log\', \'Taban\']', '[\'Servis\', \'Log\', \'Denetim\', \'Taban\']', '[\'Servis\', \'Log\', \'Taban\']'],
    a: 2,
    hints: ['super() "ebeveyn" değil, MRO\'daki bir sonraki sınıf demektir.', 'Servis.__mro__ = Servis, Log, Denetim, Taban, object (C3 doğrusallaştırma).'],
    why: 'Python çoklu kalıtımda C3 algoritmasıyla tek bir yöntem çözümleme sırası (MRO) kurar: Servis → Log → Denetim → Taban → object. Log içindeki super() Taban’a değil, MRO’da Log’dan sonra gelen Denetim’e gider; böylece Taban yalnız bir kez çağrılır (elmas problemi çözülür). Bu işbirlikçi kalıtım, her sınıfın super() çağırmasına dayanır; biri doğrudan Taban.kaydet(self) derse zincir kopar. MRO’yu Servis.__mro__ ya da Servis.mro() ile görebilirsin.',
    tags: ['MRO', 'super', 'mixin', 'çoklu kalıtım'],
    min: 4
  }
);
})(window);
