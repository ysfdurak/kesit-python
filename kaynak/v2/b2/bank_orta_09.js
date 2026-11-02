/* Kesit Python — pratik bankası (orta): Veri Yapıları, Algoritmalar (b-291…b-300) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-291',
    lv: 'orta',
    topic: 'Veri Yapıları',
    diff: 2,
    kind: 'bug',
    title: 'Şablonu bozan sipariş kopyası',
    q: '<p>Hatayı bul ve düzelt. Kurumsal müşterilere tekrarlanan siparişler bir şablondan üretiliyor. <code>siparis_uret(sablon, musteri)</code> şablonu kopyalayıp müşteri adını ve bir kalem eklemeli; ama her yeni sipariş <b>şablonun kalem listesini de</b> değiştiriyor ve sonraki siparişler şişiyor.</p>',
    start: 'def siparis_uret(sablon, musteri):\n    yeni = sablon.copy()\n    yeni["musteri"] = musteri\n    yeni["kalemler"].append({"ad": "kargo", "tutar": 30})\n    return yeni\n',
    sol: 'import copy\n\ndef siparis_uret(sablon, musteri):\n    yeni = copy.deepcopy(sablon)\n    yeni["musteri"] = musteri\n    yeni["kalemler"].append({"ad": "kargo", "tutar": 30})\n    return yeni\n',
    tests: 'sablon = {"musteri": None, "kalemler": [{"ad": "A4 kağıt", "tutar": 500}]}\na = siparis_uret(sablon, "Anadolu Lojistik")\nb = siparis_uret(sablon, "Yıldız Üretim")\nassert len(sablon["kalemler"]) == 1, "şablonun kalemleri değişmemeli: dict.copy() sığ kopyadır, iç liste paylaşılır"\nassert len(b["kalemler"]) == 2, f"her sipariş 2 kalem içermeli, b\'de {len(b[\'kalemler\'])} var"\nassert a["musteri"] == "Anadolu Lojistik" and sablon["musteri"] is None, "müşteri yalnızca kopyada değişmeli"\n',
    hints: ['<code>dict.copy()</code> yalnızca en dış sözlüğü kopyalar; içteki liste aynı nesnedir.', '<code>copy</code> modülünde iç içe yapıları da kopyalayan bir fonksiyon var.'],
    why: 'Sığ kopya (shallow copy) yeni bir dış kap oluşturur ama içerdeki değişebilir nesneler (liste, sözlük) paylaşılmaya devam eder; <code>yeni["kalemler"].append</code> şablonun listesine ekler. <code>copy.deepcopy</code> tüm ağacı özyinelemeli kopyalar. Alternatif ve daha hızlı yol yalnızca değişecek kısmı kopyalamaktır: <code>yeni = {**sablon, "musteri": musteri, "kalemler": [*sablon["kalemler"], kargo]}</code>.',
    tags: ['copy', 'deepcopy', 'sığ kopya'],
    min: 3
  },

  {
    id: 'b-292',
    lv: 'orta',
    topic: 'Veri Yapıları',
    diff: 2,
    kind: 'rehberli',
    title: 'heapq ile öncelikli kargo kuyruğu',
    q: '<p>Kargo merkezinde paketler önceliğe göre çıkar (küçük sayı = daha acil); aynı öncelikteki paketler <b>geliş sırasıyla</b> çıkmalı. <code>KargoKuyrugu</code> sınıfını <code>heapq</code> ile yaz: <code>ekle(paket, oncelik)</code>, <code>al()</code> (en acil paketi çıkarıp döndürür, kuyruk boşsa <code>IndexError</code>), <code>len()</code> desteği.</p>',
    guide: ['Yığını (heap) bir listede tut ve artan bir sayaç (<code>itertools.count()</code>) oluştur.', '<code>heapq.heappush(self.yigin, (oncelik, next(self.sayac), paket))</code>: sayaç eşit önceliklerde geliş sırasını korur.', '<code>al</code>: <code>heapq.heappop(self.yigin)[2]</code> döndür (boş listede zaten IndexError verir).', '<code>__len__</code> yığının uzunluğunu döndürsün.'],
    example: 'import heapq\ngorevler = []\nheapq.heappush(gorevler, (2, "rapor"))\nheapq.heappush(gorevler, (1, "acil düzeltme"))\nheapq.heappush(gorevler, (3, "toplantı"))\nprint([heapq.heappop(gorevler)[1] for _ in range(3)])\n',
    start: 'import heapq\nfrom itertools import count\n\nclass KargoKuyrugu:\n    def __init__(self):\n        self.yigin = []\n        # TODO 1: geliş sırası için sayaç\n\n    def ekle(self, paket, oncelik):\n        # TODO 2: (oncelik, sira, paket) demetini heappush ile ekle\n        self.yigin.append(paket)\n\n    def al(self):\n        # TODO 3: en acil paketi heappop ile çıkar\n        return self.yigin.pop()\n\n    def __len__(self):\n        return len(self.yigin)\n',
    sol: 'import heapq\nfrom itertools import count\n\nclass KargoKuyrugu:\n    def __init__(self):\n        self.yigin = []\n        self.sayac = count()\n\n    def ekle(self, paket, oncelik):\n        heapq.heappush(self.yigin, (oncelik, next(self.sayac), paket))\n\n    def al(self):\n        return heapq.heappop(self.yigin)[2]\n\n    def __len__(self):\n        return len(self.yigin)\n',
    tests: 'k = KargoKuyrugu()\nk.ekle({"no": "P1"}, 2)\nk.ekle({"no": "P2"}, 1)\nk.ekle({"no": "P3"}, 2)\nk.ekle({"no": "P4"}, 1)\nassert len(k) == 4, "len 4 olmalı"\nsira = [k.al()["no"] for _ in range(4)]\nassert sira == ["P2", "P4", "P1", "P3"], f"önce öncelik 1\'ler geliş sırasıyla (P2, P4), sonra 2\'ler (P1, P3); gelen {sira}"\ntry:\n    k.al()\n    assert False, "boş kuyrukta IndexError bekleniyordu"\nexcept IndexError:\n    pass\n',
    hints: ['Paketler sözlük; iki paketi karşılaştırmak <code>TypeError</code> verir. Eşitliği sözlüğe gelmeden bozacak bir alan gerekir.', 'Demetin ikinci elemanı artan bir sayaç olsun: <code>next(self.sayac)</code>.', '<code>return heapq.heappop(self.yigin)[2]</code>'],
    why: '<code>heapq</code> listeyi ikili yığın olarak yönetir: ekleme ve en küçüğü çıkarma O(log n). Demetler sırayla karşılaştırıldığı için eşit öncelikte ikinci eleman devreye girer; artan sayaç hem geliş sırasını (kararlılık) korur hem de karşılaştırılamayan paketlere (sözlük) hiç sıra gelmemesini sağlar. Çok iş parçacıklı kullanımda aynı mantığı kilitle sunan <code>queue.PriorityQueue</code> tercih edilir.',
    tags: ['heapq', 'öncelik kuyruğu', 'kararlılık'],
    min: 8
  },

  {
    id: 'b-293',
    lv: 'orta',
    topic: 'Veri Yapıları',
    diff: 2,
    kind: 'yaz',
    title: 'Formül parantez denetimi',
    q: '<p>Raporlama aracında kullanıcılar <code>(ciro - [iade]) / {adet}</code> gibi formüller yazıyor. <code>hata_konumu(formul)</code> fonksiyonunu yaz: parantezler <code>()</code>, <code>[]</code>, <code>{}</code> dengeli ve doğru iç içe ise <code>-1</code>; değilse <b>ilk hatanın indeksini</b> döndürsün. Hata iki türlüdür: beklenmeyen ya da yanlış türde kapanış (o kapanışın indeksi) veya hiç kapanmamış açılış (<b>kapanmamış en eski açılışın</b> indeksi). Bir yığın (stack) kullan.</p>',
    start: 'def hata_konumu(formul):\n    # buraya yaz\n    pass\n',
    sol: 'def hata_konumu(formul):\n    ciftler = {")": "(", "]": "[", "}": "{"}\n    yigin = []\n    for i, ch in enumerate(formul):\n        if ch in "([{":\n            yigin.append((ch, i))\n        elif ch in ciftler:\n            if not yigin or yigin[-1][0] != ciftler[ch]:\n                return i\n            yigin.pop()\n    return yigin[0][1] if yigin else -1\n',
    tests: 'assert hata_konumu("(ciro - [iade]) / {adet}") == -1, "dengeli formül -1"\nassert hata_konumu("(ciro - [iade)]") == 13, "13. indeksteki ) beklenen ] değil: yanlış iç içe geçiş"\nassert hata_konumu("ciro)") == 4, "açılışı olmayan kapanış"\nassert hata_konumu("((a) + [b") == 0, "kapanmamış açılışlar varsa en eskisinin indeksi (0)"\nassert hata_konumu("") == -1, "boş formül dengeli"\n',
    hints: ['Açılışları (karakter, indeks) olarak yığına it; kapanışta yığının tepesiyle eşleştir.', 'Kapanış için eşleşen açılışı bir sözlükte tut: <code>{")": "(", ...}</code>.', 'Döngü bitince yığın boş değilse <code>yigin[0][1]</code> en eski kapanmamış açılıştır.'],
    why: 'Yığın "son açılan ilk kapanır" (LIFO) kuralını doğrudan modeller; her karakter bir kez işlendiği için O(n). İndeksi yığında taşımak, kullanıcıya hatanın tam yerini gösterebilmeyi sağlar ki bu, yalnızca True/False döndürmekten çok daha kullanışlıdır. Python\'da liste <code>append</code>/<code>pop</code> sondan O(1) olduğu için yığın olarak idealdir; baştan eklemek/çıkarmak gerekiyorsa <code>deque</code> kullanılır.',
    tags: ['stack', 'parantez', 'doğrulama'],
    min: 7
  },

  {
    id: 'b-294',
    lv: 'orta',
    topic: 'Veri Yapıları',
    diff: 3,
    kind: 'yaz',
    title: 'Depolar arası en az aktarmalı rota',
    q: '<p>Anadolu Market depoları arasında çift yönlü sevkiyat hatları var: <code>[("Gebze", "Bursa"), ("Bursa", "İzmir"), ...]</code>. <code>en_kisa_rota(hatlar, bas, hedef)</code> fonksiyonunu yaz: en az aktarmalı rotayı depo adları listesi olarak döndürsün (<code>bas</code> ve <code>hedef</code> dahil). Rota yoksa <code>None</code>; <code>bas == hedef</code> ise <code>[bas]</code>. Komşuluk listesi (sözlük) kur ve <code>deque</code> ile genişlik öncelikli arama (BFS) yap. Aynı uzunlukta birden çok rota varsa hatların <b>listede veriliş sırasına</b> göre ilk bulunan dönsün.</p>',
    start: 'from collections import deque, defaultdict\n\ndef en_kisa_rota(hatlar, bas, hedef):\n    # buraya yaz\n    pass\n',
    sol: 'from collections import deque, defaultdict\n\ndef en_kisa_rota(hatlar, bas, hedef):\n    komsu = defaultdict(list)\n    for a, b in hatlar:\n        komsu[a].append(b)\n        komsu[b].append(a)\n    onceki = {bas: None}\n    kuyruk = deque([bas])\n    while kuyruk:\n        d = kuyruk.popleft()\n        if d == hedef:\n            rota = []\n            while d is not None:\n                rota.append(d)\n                d = onceki[d]\n            return rota[::-1]\n        for k in komsu[d]:\n            if k not in onceki:\n                onceki[k] = d\n                kuyruk.append(k)\n    return None\n',
    tests: 'h = [("Gebze", "Bursa"), ("Bursa", "İzmir"), ("Gebze", "Ankara"), ("Ankara", "Konya"), ("Konya", "İzmir"), ("Adana", "Mersin")]\nassert en_kisa_rota(h, "Gebze", "İzmir") == ["Gebze", "Bursa", "İzmir"], "Gebze→İzmir en az aktarma: Bursa üzerinden"\nassert en_kisa_rota(h, "İzmir", "Ankara") == ["İzmir", "Konya", "Ankara"], "en kısa rota 2 hatlıktır (Konya üzerinden)"\nassert en_kisa_rota(h, "Gebze", "Mersin") is None, "bağlantısız depoya rota yok: None"\nassert en_kisa_rota(h, "Bursa", "Bursa") == ["Bursa"], "başlangıç = hedef"\n',
    hints: ['Her depo için komşular listesi: hatlar çift yönlü, iki yöne de ekle.', 'BFS kuyruğundan çıkan her depo için ziyaret edilmemiş komşuları kuyruğa ekle ve <code>onceki[komsu] = depo</code> kaydet.', 'Hedefe varınca <code>onceki</code> zincirini geriye izleyip ters çevir.'],
    why: 'Ağırlıksız grafta BFS, düğümleri başlangıca uzaklık sırasıyla ziyaret ettiği için hedefe ilk ulaştığı yol en az kenarlıdır. <code>onceki</code> sözlüğü hem "ziyaret edildi" kümesi hem de yolu geri kurmak için ebeveyn kaydıdır. <code>deque.popleft</code> O(1) olduğundan liste <code>pop(0)</code>\'dan (O(n)) üstündür. Hatlar mesafe/maliyet taşısaydı Dijkstra (heapq ile) gerekirdi; büyük projelerde <code>networkx.shortest_path</code> hazır kullanılır.',
    tags: ['BFS', 'graf', 'deque', 'defaultdict'],
    min: 12
  },

  {
    id: 'b-295',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'bisect ile vergi dilimi',
    q: '<p>Gelir vergisi dilimi <code>bisect</code> ile bulunuyor (sınırdaki gelir bir üst dilime mi girer?). Bu kod ne yazdırır?</p>',
    code: 'import bisect\n\nsinirlar = [110000, 230000, 870000]\noranlar = [15, 20, 27, 35]\nfor gelir in [50000, 110000, 500000, 900000]:\n    print(oranlar[bisect.bisect_right(sinirlar, gelir)], end=" ")\n',
    o: ['15 15 27 35', '15 20 27 35', '15 20 20 35', '20 20 27 35'],
    a: 1,
    hints: ['<code>bisect_right</code>, eşit değer varsa onun <b>sağındaki</b> konumu döndürür.', '110000 listede var: sağına eklenirse indeks kaç olur?'],
    why: '<code>bisect_right(sinirlar, x)</code>, x\'in sıralı listede kaç sınırdan büyük ya da eşit olduğunu verir: 50000 → 0, 110000 → 1 (eşit olduğu için sağına), 500000 → 2, 900000 → 3. Bu indeks oran listesine doğrudan karşılık gelir. <code>bisect_left</code> kullanılsaydı tam sınırdaki 110000 alt dilimde (15) kalırdı; hangi fonksiyonun seçileceği iş kuralına ("sınır dahil mi?") bağlıdır. Arama O(log n) olduğundan uzun if/elif zincirlerinin yerini alır.',
    tags: ['bisect', 'ikili arama', 'dilim'],
    min: 3
  },

  {
    id: 'b-296',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 2,
    t: 'order',
    kind: 'order',
    title: 'İkili arama: ekleme konumu',
    q: '<p>Sıralı bir listede hedefin <b>ekleneceği ilk konumu</b> (lower bound) bulan ikili arama fonksiyonunu sırala. Testler 30 için 2, 5 için 0, 99 için 4 bekliyor.</p>',
    lines: ['def ikili_ara(liste, hedef):', '    alt, ust = 0, len(liste)', '    while alt < ust:', '        orta = (alt + ust) // 2', '        if liste[orta] < hedef:', '            alt = orta + 1', '        else:', '            ust = orta', '    return alt'],
    tests: 'L = [10, 20, 30, 40]\nassert (ikili_ara(L, 30), ikili_ara(L, 5), ikili_ara(L, 99)) == (2, 0, 4), "30 → 2, 5 → 0 (başa), 99 → 4 (sona) olmalı"\nimport bisect\nassert all(ikili_ara(L, x) == bisect.bisect_left(L, x) for x in range(0, 50)), "sonuç bisect_left ile aynı olmalı"\n',
    hint: 'Orta eleman hedeften küçükse arama sağ yarıda sürer (alt ilerler); değilse üst sınır ortaya çekilir. return döngüden sonra gelir.',
    hints: ['Orta eleman hedeften küçükse arama sağ yarıda sürer (alt ilerler); değilse üst sınır ortaya çekilir. return döngüden sonra gelir.'],
    why: 'Yarı açık aralık <code>[alt, ust)</code> ile yazılan bu sürüm her adımda arama alanını yarıya indirir (O(log n)) ve döngü <code>alt == ust</code> olunca biter; sonuç "hedeften küçük olmayan ilk eleman"ın indeksidir, yani <code>bisect.bisect_left</code>. <code>alt = orta + 1</code> ve <code>ust = orta</code> asimetrisi sonsuz döngüyü önler. Pratikte kendin yazmak yerine <code>bisect</code> modülünü kullan; ama mülakatlarda ve özel karşılaştırmalı aramalarda bu kalıp sık çıkar.',
    tags: ['ikili arama', 'lower bound'],
    min: 4
  },

  {
    id: 'b-297',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 2,
    kind: 'rehberli',
    title: 'En iyi k günlük satış penceresi',
    q: '<p>Kampanya analizi: günlük satış listesinde <b>ardışık k gün</b> içinde toplamı en yüksek olan pencereyi bul. <code>en_iyi_pencere(satislar, k)</code> fonksiyonunu kayan pencere (sliding window) tekniğiyle O(n) yaz: <code>(baslangic_indeksi, toplam)</code> döndürsün; eşitlikte en erken pencere. <code>k</code> liste uzunluğundan büyükse <code>None</code>.</p>',
    guide: ['İlk pencerenin toplamını <code>sum(satislar[:k])</code> ile hesapla; en iyi olarak kaydet.', '<code>i</code>\'yi <code>k</code>\'dan sona kadar dolaş: pencereye <code>satislar[i]</code> girer, <code>satislar[i - k]</code> çıkar.', 'Yeni toplam en iyiden <b>büyükse</b> (eşit değil) en iyiyi ve başlangıcı (<code>i - k + 1</code>) güncelle.', 'Başta <code>k &gt; len(satislar)</code> kontrolünü unutma.'],
    example: '# Kayan pencere: her adımda toplamı yeniden hesaplamak yerine güncelle\nsicaklik = [12, 15, 11, 18, 20]\npencere = sum(sicaklik[:3])\nortalamalar = [pencere / 3]\nfor i in range(3, len(sicaklik)):\n    pencere += sicaklik[i] - sicaklik[i - 3]\n    ortalamalar.append(round(pencere / 3, 2))\nprint(ortalamalar)\n',
    start: 'def en_iyi_pencere(satislar, k):\n    # TODO 1: k uzunluktan büyükse None\n    # TODO 2: ilk pencere toplamı\n    # TODO 3: pencereyi kaydırıp en iyiyi güncelle\n    return (0, sum(satislar[:k]))\n',
    sol: 'def en_iyi_pencere(satislar, k):\n    if k > len(satislar) or k <= 0:\n        return None\n    toplam = sum(satislar[:k])\n    en_iyi, bas = toplam, 0\n    for i in range(k, len(satislar)):\n        toplam += satislar[i] - satislar[i - k]\n        if toplam > en_iyi:\n            en_iyi, bas = toplam, i - k + 1\n    return (bas, en_iyi)\n',
    tests: 's = [120, 80, 200, 150, 90, 300, 40]\nassert en_iyi_pencere(s, 3) == (3, 540), f"150+90+300 = 540 (indeks 3) en iyi; gelen {en_iyi_pencere(s, 3)}"\nassert en_iyi_pencere(s, 1) == (5, 300), "k=1 en büyük tek gün"\nassert en_iyi_pencere([5, 5, 5], 2) == (0, 10), "eşitlikte en erken pencere"\nassert en_iyi_pencere([1, 2], 3) is None, "k uzunluktan büyükse None"\nimport random\nrandom.seed(0)\nv = [random.randint(0, 100) for _ in range(200)]\nkaba = max(range(len(v) - 9), key=lambda j: (sum(v[j:j + 10]), -j))\nassert en_iyi_pencere(v, 10) == (kaba, sum(v[kaba:kaba + 10])), "rastgele veride kaba kuvvet sonucuyla aynı olmalı"\n',
    hints: ['Her pencere için <code>sum</code> çağırmak O(n·k) olur; toplamı güncelle.', 'Güncelleme: <code>toplam += satislar[i] - satislar[i - k]</code>.', 'Eşitlikte erken pencere kalsın diye <code>&gt;</code> kullan, <code>&gt;=</code> değil.'],
    why: 'Kayan pencere, ardışık alt dizilerde ortak kısmı yeniden hesaplamaz: bir eleman girer, bir eleman çıkar; toplam maliyet O(n). Kaba kuvvet O(n·k)\'dır ve büyük veride fark çok belirgindir. Testteki kaba kuvvet karşılaştırması, hızlı algoritmayı yavaş ama açıkça doğru bir sürümle doğrulamanın (property/oracle testi) iyi bir örneğidir. pandas\'ta aynı iş <code>s.rolling(k).sum().idxmax()</code> ile yapılır.',
    tags: ['sliding window', 'O(n)', 'algoritma'],
    min: 8
  },

  {
    id: 'b-298',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 2,
    kind: 'yaz',
    title: 'Toplantı odası rezervasyonlarını birleştir',
    q: '<p>Toplantı odası takviminde dolu aralıklar dakika cinsinden <code>(baslangic, bitis)</code> demetleri olarak geliyor, sırasız ve çakışık olabilir. <code>birlestir(araliklar)</code> fonksiyonunu yaz: çakışan <b>ya da uç uca değen</b> aralıkları birleştirip başlangıca göre sıralı liste döndürsün. <code>[(540, 600), (570, 660), (780, 840), (660, 690)]</code> → <code>[(540, 690), (780, 840)]</code>.</p>',
    start: 'def birlestir(araliklar):\n    # buraya yaz\n    pass\n',
    sol: 'def birlestir(araliklar):\n    sonuc = []\n    for bas, bit in sorted(araliklar):\n        if sonuc and bas <= sonuc[-1][1]:\n            sonuc[-1] = (sonuc[-1][0], max(sonuc[-1][1], bit))\n        else:\n            sonuc.append((bas, bit))\n    return sonuc\n',
    tests: 'assert birlestir([(540, 600), (570, 660), (780, 840), (660, 690)]) == [(540, 690), (780, 840)], "çakışan ve uç uca değen aralıklar birleşmeli"\nassert birlestir([(600, 700), (610, 620)]) == [(600, 700)], "içteki aralık dıştakini kısaltmamalı (max kullan)"\nassert birlestir([(900, 960), (480, 500)]) == [(480, 500), (900, 960)], "sırasız girdi sıralanmalı"\nassert birlestir([]) == [], "boş takvim"\n',
    hints: ['Önce başlangıca göre sırala; sonra her aralık yalnızca son birleşmiş aralıkla karşılaştırılır.', 'Yeni başlangıç son bitişten küçük ya da eşitse birleştir: bitiş <code>max</code> ile güncellenir.'],
    why: 'Sıralamadan sonra çakışma yalnızca komşu aralıklar arasında olabilir; bu yüzden tek geçiş yeterlidir ve toplam maliyet sıralamanın O(n log n)\'idir. <code>max</code> unutulursa içte kalan kısa bir aralık birleşmiş aralığı yanlışlıkla kısaltır. Aynı kalıp vardiya çakışmaları, IP aralıkları ve "toplam dolu süre" hesaplarında kullanılır; boş saatleri bulmak için birleşmiş aralıkların arasındaki boşluklara bakmak yeterlidir.',
    tags: ['aralık birleştirme', 'sıralama', 'algoritma'],
    min: 6
  },

  {
    id: 'b-299',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 3,
    kind: 'yaz',
    title: 'En az koliyle sipariş tamamlama',
    q: '<p>Depo, ürünü yalnızca sabit boyutlu kolilerle gönderebiliyor (ör. 6\'lı, 9\'lu, 20\'li). <code>min_koli(adet, boyutlar)</code> fonksiyonunu dinamik programlama ile yaz: tam olarak <code>adet</code> ürünü göndermek için gereken <b>en az</b> koli sayısını döndürsün; mümkün değilse <code>-1</code>. Açgözlü (önce en büyük koli) yaklaşım her zaman doğru sonuç vermez!</p>',
    start: 'def min_koli(adet, boyutlar):\n    # buraya yaz\n    pass\n',
    sol: 'def min_koli(adet, boyutlar):\n    SONSUZ = float("inf")\n    en_az = [0] + [SONSUZ] * adet\n    for a in range(1, adet + 1):\n        for b in boyutlar:\n            if b <= a and en_az[a - b] + 1 < en_az[a]:\n                en_az[a] = en_az[a - b] + 1\n    return en_az[adet] if en_az[adet] != SONSUZ else -1\n',
    tests: 'assert min_koli(18, [6, 9, 20]) == 2, "18 = 9 + 9 (2 koli)"\nassert min_koli(26, [6, 9, 20]) == 2, "26 = 20 + 6"\nassert min_koli(43, [6, 9, 20]) == -1, "43 bu kolilerle oluşturulamaz"\nassert min_koli(12, [1, 6, 10]) == 2, "açgözlü 10+1+1 = 3 koli verir; doğru cevap 6+6 = 2"\nassert min_koli(0, [6, 9]) == 0, "0 adet için 0 koli"\nassert min_koli(1000, [6, 9, 20]) == 50, "büyük adette de hızlı çalışmalı (50 x 20)"\n',
    hints: ['<code>en_az[a]</code> = tam a ürün için en az koli; <code>en_az[0] = 0</code>.', 'Her a için her koli boyutunu dene: <code>en_az[a - b] + 1</code>.', 'Ulaşılamayan değerleri sonsuz ile başlat, sonda -1\'e çevir.'],
    why: 'Problem "bozuk para üstü" (coin change) problemidir: en iyi çözüm, daha küçük alt problemlerin en iyi çözümlerinden kurulur. Tablo yaklaşımı O(adet × boyut sayısı) zamanda çalışır ve her alt problemi bir kez çözer. Açgözlü yöntem yalnızca bazı "kanonik" boyut kümelerinde doğrudur (TL madeni paraları gibi); 1-6-10 örneği bunun neden genel olmadığını gösterir. Alternatif: <code>functools.cache</code> ile özyinelemeli (top-down) çözüm; çok büyük adetlerde özyineleme derinliğine dikkat.',
    tags: ['dinamik programlama', 'coin change', 'algoritma'],
    min: 10
  },

  {
    id: 'b-300',
    lv: 'orta',
    topic: 'Algoritmalar',
    diff: 1,
    kind: 'bug',
    title: 'Yanlış hesaplanan maaş medyanı',
    q: '<p>Hatayı bul ve düzelt. İK raporundaki <code>medyan(degerler)</code> fonksiyonu sırasız listede yanlış değer veriyor; çift sayıda elemanda da ortadaki iki değerin ortalamasını almıyor. Girdi listesini <b>değiştirmeden</b> düzelt.</p>',
    start: 'def medyan(degerler):\n    n = len(degerler)\n    return degerler[n // 2]\n',
    sol: 'def medyan(degerler):\n    s = sorted(degerler)\n    n = len(s)\n    orta = n // 2\n    if n % 2:\n        return s[orta]\n    return (s[orta - 1] + s[orta]) / 2\n',
    tests: 'maaslar = [42000, 38000, 90000, 51000, 45000]\nassert medyan(maaslar) == 45000, "tek sayıda eleman: sıralı listenin ortası 45000"\nassert maaslar[0] == 42000, "girdi listesi değişmemeli (sorted kullan, sort değil)"\nassert medyan([30000, 50000, 40000, 60000]) == 45000.0, "çift sayıda: ortadaki iki değerin ortalaması (40000+50000)/2"\nimport statistics\nassert medyan([3, 1, 2]) == statistics.median([3, 1, 2]), "statistics.median ile aynı sonuç"\n',
    hints: ['Medyan, <b>sıralı</b> listenin ortasıdır.', 'Çift uzunlukta ortada iki eleman vardır: <code>n // 2 - 1</code> ve <code>n // 2</code>.'],
    why: 'Medyan sıralama gerektirir; sırasız listenin ortadaki elemanı anlamsızdır. Çift uzunlukta iki orta değerin ortalaması alınır. Maaş gibi çarpık dağılımlarda medyan ortalamadan daha temsilidir (birkaç yüksek maaş ortalamayı şişirir). Gerçek kodda standart kütüphanedeki <code>statistics.median</code> kullan; kendi yazdığın sürüm, burada olduğu gibi kenar durumları test ederek doğrulanmalıdır.',
    tags: ['medyan', 'sorted', 'kenar durum'],
    min: 3
  }
);
})(window);
