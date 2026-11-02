from lib import C, write

T = []

T.append(dict(
    id='b-291', topic='Veri Yapıları', diff=2, kind='bug',
    title='Şablonu bozan sipariş kopyası',
    q='<p>Hatayı bul ve düzelt. Kurumsal müşterilere tekrarlanan siparişler bir şablondan üretiliyor. <code>siparis_uret(sablon, musteri)</code> şablonu kopyalayıp müşteri adını ve bir kalem eklemeli; ama her yeni sipariş <b>şablonun kalem listesini de</b> değiştiriyor ve sonraki siparişler şişiyor.</p>',
    start=C(r'''
        def siparis_uret(sablon, musteri):
            yeni = sablon.copy()
            yeni["musteri"] = musteri
            yeni["kalemler"].append({"ad": "kargo", "tutar": 30})
            return yeni
    '''),
    sol=C(r'''
        import copy

        def siparis_uret(sablon, musteri):
            yeni = copy.deepcopy(sablon)
            yeni["musteri"] = musteri
            yeni["kalemler"].append({"ad": "kargo", "tutar": 30})
            return yeni
    '''),
    tests=C(r'''
        sablon = {"musteri": None, "kalemler": [{"ad": "A4 kağıt", "tutar": 500}]}
        a = siparis_uret(sablon, "Anadolu Lojistik")
        b = siparis_uret(sablon, "Yıldız Üretim")
        assert len(sablon["kalemler"]) == 1, "şablonun kalemleri değişmemeli: dict.copy() sığ kopyadır, iç liste paylaşılır"
        assert len(b["kalemler"]) == 2, f"her sipariş 2 kalem içermeli, b'de {len(b['kalemler'])} var"
        assert a["musteri"] == "Anadolu Lojistik" and sablon["musteri"] is None, "müşteri yalnızca kopyada değişmeli"
    '''),
    hints=['<code>dict.copy()</code> yalnızca en dış sözlüğü kopyalar; içteki liste aynı nesnedir.', '<code>copy</code> modülünde iç içe yapıları da kopyalayan bir fonksiyon var.'],
    why='Sığ kopya (shallow copy) yeni bir dış kap oluşturur ama içerdeki değişebilir nesneler (liste, sözlük) paylaşılmaya devam eder; <code>yeni["kalemler"].append</code> şablonun listesine ekler. <code>copy.deepcopy</code> tüm ağacı özyinelemeli kopyalar. Alternatif ve daha hızlı yol yalnızca değişecek kısmı kopyalamaktır: <code>yeni = {**sablon, "musteri": musteri, "kalemler": [*sablon["kalemler"], kargo]}</code>.',
    tags=['copy', 'deepcopy', 'sığ kopya'], min=3))

T.append(dict(
    id='b-292', topic='Veri Yapıları', diff=2, kind='rehberli',
    title='heapq ile öncelikli kargo kuyruğu',
    q='<p>Kargo merkezinde paketler önceliğe göre çıkar (küçük sayı = daha acil); aynı öncelikteki paketler <b>geliş sırasıyla</b> çıkmalı. <code>KargoKuyrugu</code> sınıfını <code>heapq</code> ile yaz: <code>ekle(paket, oncelik)</code>, <code>al()</code> (en acil paketi çıkarıp döndürür, kuyruk boşsa <code>IndexError</code>), <code>len()</code> desteği.</p>',
    guide=['Yığını (heap) bir listede tut ve artan bir sayaç (<code>itertools.count()</code>) oluştur.',
           '<code>heapq.heappush(self.yigin, (oncelik, next(self.sayac), paket))</code>: sayaç eşit önceliklerde geliş sırasını korur.',
           '<code>al</code>: <code>heapq.heappop(self.yigin)[2]</code> döndür (boş listede zaten IndexError verir).',
           '<code>__len__</code> yığının uzunluğunu döndürsün.'],
    example=C(r'''
        import heapq
        gorevler = []
        heapq.heappush(gorevler, (2, "rapor"))
        heapq.heappush(gorevler, (1, "acil düzeltme"))
        heapq.heappush(gorevler, (3, "toplantı"))
        print([heapq.heappop(gorevler)[1] for _ in range(3)])
    '''),
    start=C(r'''
        import heapq
        from itertools import count

        class KargoKuyrugu:
            def __init__(self):
                self.yigin = []
                # TODO 1: geliş sırası için sayaç

            def ekle(self, paket, oncelik):
                # TODO 2: (oncelik, sira, paket) demetini heappush ile ekle
                self.yigin.append(paket)

            def al(self):
                # TODO 3: en acil paketi heappop ile çıkar
                return self.yigin.pop()

            def __len__(self):
                return len(self.yigin)
    '''),
    sol=C(r'''
        import heapq
        from itertools import count

        class KargoKuyrugu:
            def __init__(self):
                self.yigin = []
                self.sayac = count()

            def ekle(self, paket, oncelik):
                heapq.heappush(self.yigin, (oncelik, next(self.sayac), paket))

            def al(self):
                return heapq.heappop(self.yigin)[2]

            def __len__(self):
                return len(self.yigin)
    '''),
    tests=C(r'''
        k = KargoKuyrugu()
        k.ekle({"no": "P1"}, 2)
        k.ekle({"no": "P2"}, 1)
        k.ekle({"no": "P3"}, 2)
        k.ekle({"no": "P4"}, 1)
        assert len(k) == 4, "len 4 olmalı"
        sira = [k.al()["no"] for _ in range(4)]
        assert sira == ["P2", "P4", "P1", "P3"], f"önce öncelik 1'ler geliş sırasıyla (P2, P4), sonra 2'ler (P1, P3); gelen {sira}"
        try:
            k.al()
            assert False, "boş kuyrukta IndexError bekleniyordu"
        except IndexError:
            pass
    '''),
    hints=['Paketler sözlük; iki paketi karşılaştırmak <code>TypeError</code> verir. Eşitliği sözlüğe gelmeden bozacak bir alan gerekir.',
           'Demetin ikinci elemanı artan bir sayaç olsun: <code>next(self.sayac)</code>.',
           '<code>return heapq.heappop(self.yigin)[2]</code>'],
    why='<code>heapq</code> listeyi ikili yığın olarak yönetir: ekleme ve en küçüğü çıkarma O(log n). Demetler sırayla karşılaştırıldığı için eşit öncelikte ikinci eleman devreye girer; artan sayaç hem geliş sırasını (kararlılık) korur hem de karşılaştırılamayan paketlere (sözlük) hiç sıra gelmemesini sağlar. Çok iş parçacıklı kullanımda aynı mantığı kilitle sunan <code>queue.PriorityQueue</code> tercih edilir.',
    tags=['heapq', 'öncelik kuyruğu', 'kararlılık'], min=8))

T.append(dict(
    id='b-293', topic='Veri Yapıları', diff=2, kind='yaz',
    title='Formül parantez denetimi',
    q='<p>Raporlama aracında kullanıcılar <code>(ciro - [iade]) / {adet}</code> gibi formüller yazıyor. <code>hata_konumu(formul)</code> fonksiyonunu yaz: parantezler <code>()</code>, <code>[]</code>, <code>{}</code> dengeli ve doğru iç içe ise <code>-1</code>; değilse <b>ilk hatanın indeksini</b> döndürsün. Hata iki türlüdür: beklenmeyen ya da yanlış türde kapanış (o kapanışın indeksi) veya hiç kapanmamış açılış (<b>kapanmamış en eski açılışın</b> indeksi). Bir yığın (stack) kullan.</p>',
    start=C(r'''
        def hata_konumu(formul):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def hata_konumu(formul):
            ciftler = {")": "(", "]": "[", "}": "{"}
            yigin = []
            for i, ch in enumerate(formul):
                if ch in "([{":
                    yigin.append((ch, i))
                elif ch in ciftler:
                    if not yigin or yigin[-1][0] != ciftler[ch]:
                        return i
                    yigin.pop()
            return yigin[0][1] if yigin else -1
    '''),
    tests=C(r'''
        assert hata_konumu("(ciro - [iade]) / {adet}") == -1, "dengeli formül -1"
        assert hata_konumu("(ciro - [iade)]") == 13, "13. indeksteki ) beklenen ] değil: yanlış iç içe geçiş"
        assert hata_konumu("ciro)") == 4, "açılışı olmayan kapanış"
        assert hata_konumu("((a) + [b") == 0, "kapanmamış açılışlar varsa en eskisinin indeksi (0)"
        assert hata_konumu("") == -1, "boş formül dengeli"
    '''),
    hints=['Açılışları (karakter, indeks) olarak yığına it; kapanışta yığının tepesiyle eşleştir.',
           'Kapanış için eşleşen açılışı bir sözlükte tut: <code>{")": "(", ...}</code>.',
           'Döngü bitince yığın boş değilse <code>yigin[0][1]</code> en eski kapanmamış açılıştır.'],
    why='Yığın "son açılan ilk kapanır" (LIFO) kuralını doğrudan modeller; her karakter bir kez işlendiği için O(n). İndeksi yığında taşımak, kullanıcıya hatanın tam yerini gösterebilmeyi sağlar ki bu, yalnızca True/False döndürmekten çok daha kullanışlıdır. Python\'da liste <code>append</code>/<code>pop</code> sondan O(1) olduğu için yığın olarak idealdir; baştan eklemek/çıkarmak gerekiyorsa <code>deque</code> kullanılır.',
    tags=['stack', 'parantez', 'doğrulama'], min=7))

T.append(dict(
    id='b-294', topic='Veri Yapıları', diff=3, kind='yaz',
    title='Depolar arası en az aktarmalı rota',
    q='<p>Anadolu Market depoları arasında çift yönlü sevkiyat hatları var: <code>[("Gebze", "Bursa"), ("Bursa", "İzmir"), ...]</code>. <code>en_kisa_rota(hatlar, bas, hedef)</code> fonksiyonunu yaz: en az aktarmalı rotayı depo adları listesi olarak döndürsün (<code>bas</code> ve <code>hedef</code> dahil). Rota yoksa <code>None</code>; <code>bas == hedef</code> ise <code>[bas]</code>. Komşuluk listesi (sözlük) kur ve <code>deque</code> ile genişlik öncelikli arama (BFS) yap. Aynı uzunlukta birden çok rota varsa hatların <b>listede veriliş sırasına</b> göre ilk bulunan dönsün.</p>',
    start=C(r'''
        from collections import deque, defaultdict

        def en_kisa_rota(hatlar, bas, hedef):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        from collections import deque, defaultdict

        def en_kisa_rota(hatlar, bas, hedef):
            komsu = defaultdict(list)
            for a, b in hatlar:
                komsu[a].append(b)
                komsu[b].append(a)
            onceki = {bas: None}
            kuyruk = deque([bas])
            while kuyruk:
                d = kuyruk.popleft()
                if d == hedef:
                    rota = []
                    while d is not None:
                        rota.append(d)
                        d = onceki[d]
                    return rota[::-1]
                for k in komsu[d]:
                    if k not in onceki:
                        onceki[k] = d
                        kuyruk.append(k)
            return None
    '''),
    tests=C(r'''
        h = [("Gebze", "Bursa"), ("Bursa", "İzmir"), ("Gebze", "Ankara"), ("Ankara", "Konya"), ("Konya", "İzmir"), ("Adana", "Mersin")]
        assert en_kisa_rota(h, "Gebze", "İzmir") == ["Gebze", "Bursa", "İzmir"], "Gebze→İzmir en az aktarma: Bursa üzerinden"
        assert en_kisa_rota(h, "İzmir", "Ankara") == ["İzmir", "Konya", "Ankara"], "en kısa rota 2 hatlıktır (Konya üzerinden)"
        assert en_kisa_rota(h, "Gebze", "Mersin") is None, "bağlantısız depoya rota yok: None"
        assert en_kisa_rota(h, "Bursa", "Bursa") == ["Bursa"], "başlangıç = hedef"
    '''),
    hints=['Her depo için komşular listesi: hatlar çift yönlü, iki yöne de ekle.',
           'BFS kuyruğundan çıkan her depo için ziyaret edilmemiş komşuları kuyruğa ekle ve <code>onceki[komsu] = depo</code> kaydet.',
           'Hedefe varınca <code>onceki</code> zincirini geriye izleyip ters çevir.'],
    why='Ağırlıksız grafta BFS, düğümleri başlangıca uzaklık sırasıyla ziyaret ettiği için hedefe ilk ulaştığı yol en az kenarlıdır. <code>onceki</code> sözlüğü hem "ziyaret edildi" kümesi hem de yolu geri kurmak için ebeveyn kaydıdır. <code>deque.popleft</code> O(1) olduğundan liste <code>pop(0)</code>\'dan (O(n)) üstündür. Hatlar mesafe/maliyet taşısaydı Dijkstra (heapq ile) gerekirdi; büyük projelerde <code>networkx.shortest_path</code> hazır kullanılır.',
    tags=['BFS', 'graf', 'deque', 'defaultdict'], min=12))

# ---------------- Algoritmalar ----------------
T.append(dict(
    id='b-295', topic='Algoritmalar', diff=2, t='predict',
    title='bisect ile vergi dilimi',
    q='<p>Gelir vergisi dilimi <code>bisect</code> ile bulunuyor (sınırdaki gelir bir üst dilime mi girer?). Bu kod ne yazdırır?</p>',
    code=C(r'''
        import bisect

        sinirlar = [110000, 230000, 870000]
        oranlar = [15, 20, 27, 35]
        for gelir in [50000, 110000, 500000, 900000]:
            print(oranlar[bisect.bisect_right(sinirlar, gelir)], end=" ")
    '''),
    o=['15 15 27 35', '15 20 27 35', '15 20 20 35', '20 20 27 35'],
    a=1,
    hints=['<code>bisect_right</code>, eşit değer varsa onun <b>sağındaki</b> konumu döndürür.', '110000 listede var: sağına eklenirse indeks kaç olur?'],
    why='<code>bisect_right(sinirlar, x)</code>, x\'in sıralı listede kaç sınırdan büyük ya da eşit olduğunu verir: 50000 → 0, 110000 → 1 (eşit olduğu için sağına), 500000 → 2, 900000 → 3. Bu indeks oran listesine doğrudan karşılık gelir. <code>bisect_left</code> kullanılsaydı tam sınırdaki 110000 alt dilimde (15) kalırdı; hangi fonksiyonun seçileceği iş kuralına ("sınır dahil mi?") bağlıdır. Arama O(log n) olduğundan uzun if/elif zincirlerinin yerini alır.',
    tags=['bisect', 'ikili arama', 'dilim'], min=3))

T.append(dict(
    id='b-296', topic='Algoritmalar', diff=2, t='order',
    title='İkili arama: ekleme konumu',
    q='<p>Sıralı bir listede hedefin <b>ekleneceği ilk konumu</b> (lower bound) bulan ikili arama fonksiyonunu sırala. Testler 30 için 2, 5 için 0, 99 için 4 bekliyor.</p>',
    lines=['def ikili_ara(liste, hedef):',
           '    alt, ust = 0, len(liste)',
           '    while alt < ust:',
           '        orta = (alt + ust) // 2',
           '        if liste[orta] < hedef:',
           '            alt = orta + 1',
           '        else:',
           '            ust = orta',
           '    return alt'],
    tests=C(r'''
        L = [10, 20, 30, 40]
        assert (ikili_ara(L, 30), ikili_ara(L, 5), ikili_ara(L, 99)) == (2, 0, 4), "30 → 2, 5 → 0 (başa), 99 → 4 (sona) olmalı"
        import bisect
        assert all(ikili_ara(L, x) == bisect.bisect_left(L, x) for x in range(0, 50)), "sonuç bisect_left ile aynı olmalı"
    '''),
    hint='Orta eleman hedeften küçükse arama sağ yarıda sürer (alt ilerler); değilse üst sınır ortaya çekilir. return döngüden sonra gelir.',
    hints=['Orta eleman hedeften küçükse arama sağ yarıda sürer (alt ilerler); değilse üst sınır ortaya çekilir. return döngüden sonra gelir.'],
    why='Yarı açık aralık <code>[alt, ust)</code> ile yazılan bu sürüm her adımda arama alanını yarıya indirir (O(log n)) ve döngü <code>alt == ust</code> olunca biter; sonuç "hedeften küçük olmayan ilk eleman"ın indeksidir, yani <code>bisect.bisect_left</code>. <code>alt = orta + 1</code> ve <code>ust = orta</code> asimetrisi sonsuz döngüyü önler. Pratikte kendin yazmak yerine <code>bisect</code> modülünü kullan; ama mülakatlarda ve özel karşılaştırmalı aramalarda bu kalıp sık çıkar.',
    tags=['ikili arama', 'lower bound'], min=4))

T.append(dict(
    id='b-297', topic='Algoritmalar', diff=2, kind='rehberli',
    title='En iyi k günlük satış penceresi',
    q='<p>Kampanya analizi: günlük satış listesinde <b>ardışık k gün</b> içinde toplamı en yüksek olan pencereyi bul. <code>en_iyi_pencere(satislar, k)</code> fonksiyonunu kayan pencere (sliding window) tekniğiyle O(n) yaz: <code>(baslangic_indeksi, toplam)</code> döndürsün; eşitlikte en erken pencere. <code>k</code> liste uzunluğundan büyükse <code>None</code>.</p>',
    guide=['İlk pencerenin toplamını <code>sum(satislar[:k])</code> ile hesapla; en iyi olarak kaydet.',
           '<code>i</code>\'yi <code>k</code>\'dan sona kadar dolaş: pencereye <code>satislar[i]</code> girer, <code>satislar[i - k]</code> çıkar.',
           'Yeni toplam en iyiden <b>büyükse</b> (eşit değil) en iyiyi ve başlangıcı (<code>i - k + 1</code>) güncelle.',
           'Başta <code>k &gt; len(satislar)</code> kontrolünü unutma.'],
    example=C(r'''
        # Kayan pencere: her adımda toplamı yeniden hesaplamak yerine güncelle
        sicaklik = [12, 15, 11, 18, 20]
        pencere = sum(sicaklik[:3])
        ortalamalar = [pencere / 3]
        for i in range(3, len(sicaklik)):
            pencere += sicaklik[i] - sicaklik[i - 3]
            ortalamalar.append(round(pencere / 3, 2))
        print(ortalamalar)
    '''),
    start=C(r'''
        def en_iyi_pencere(satislar, k):
            # TODO 1: k uzunluktan büyükse None
            # TODO 2: ilk pencere toplamı
            # TODO 3: pencereyi kaydırıp en iyiyi güncelle
            return (0, sum(satislar[:k]))
    '''),
    sol=C(r'''
        def en_iyi_pencere(satislar, k):
            if k > len(satislar) or k <= 0:
                return None
            toplam = sum(satislar[:k])
            en_iyi, bas = toplam, 0
            for i in range(k, len(satislar)):
                toplam += satislar[i] - satislar[i - k]
                if toplam > en_iyi:
                    en_iyi, bas = toplam, i - k + 1
            return (bas, en_iyi)
    '''),
    tests=C(r'''
        s = [120, 80, 200, 150, 90, 300, 40]
        assert en_iyi_pencere(s, 3) == (3, 540), f"150+90+300 = 540 (indeks 3) en iyi; gelen {en_iyi_pencere(s, 3)}"
        assert en_iyi_pencere(s, 1) == (5, 300), "k=1 en büyük tek gün"
        assert en_iyi_pencere([5, 5, 5], 2) == (0, 10), "eşitlikte en erken pencere"
        assert en_iyi_pencere([1, 2], 3) is None, "k uzunluktan büyükse None"
        import random
        random.seed(0)
        v = [random.randint(0, 100) for _ in range(200)]
        kaba = max(range(len(v) - 9), key=lambda j: (sum(v[j:j + 10]), -j))
        assert en_iyi_pencere(v, 10) == (kaba, sum(v[kaba:kaba + 10])), "rastgele veride kaba kuvvet sonucuyla aynı olmalı"
    '''),
    hints=['Her pencere için <code>sum</code> çağırmak O(n·k) olur; toplamı güncelle.',
           'Güncelleme: <code>toplam += satislar[i] - satislar[i - k]</code>.',
           'Eşitlikte erken pencere kalsın diye <code>&gt;</code> kullan, <code>&gt;=</code> değil.'],
    why='Kayan pencere, ardışık alt dizilerde ortak kısmı yeniden hesaplamaz: bir eleman girer, bir eleman çıkar; toplam maliyet O(n). Kaba kuvvet O(n·k)\'dır ve büyük veride fark çok belirgindir. Testteki kaba kuvvet karşılaştırması, hızlı algoritmayı yavaş ama açıkça doğru bir sürümle doğrulamanın (property/oracle testi) iyi bir örneğidir. pandas\'ta aynı iş <code>s.rolling(k).sum().idxmax()</code> ile yapılır.',
    tags=['sliding window', 'O(n)', 'algoritma'], min=8))

T.append(dict(
    id='b-298', topic='Algoritmalar', diff=2, kind='yaz',
    title='Toplantı odası rezervasyonlarını birleştir',
    q='<p>Toplantı odası takviminde dolu aralıklar dakika cinsinden <code>(baslangic, bitis)</code> demetleri olarak geliyor, sırasız ve çakışık olabilir. <code>birlestir(araliklar)</code> fonksiyonunu yaz: çakışan <b>ya da uç uca değen</b> aralıkları birleştirip başlangıca göre sıralı liste döndürsün. <code>[(540, 600), (570, 660), (780, 840), (660, 690)]</code> → <code>[(540, 690), (780, 840)]</code>.</p>',
    start=C(r'''
        def birlestir(araliklar):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def birlestir(araliklar):
            sonuc = []
            for bas, bit in sorted(araliklar):
                if sonuc and bas <= sonuc[-1][1]:
                    sonuc[-1] = (sonuc[-1][0], max(sonuc[-1][1], bit))
                else:
                    sonuc.append((bas, bit))
            return sonuc
    '''),
    tests=C(r'''
        assert birlestir([(540, 600), (570, 660), (780, 840), (660, 690)]) == [(540, 690), (780, 840)], "çakışan ve uç uca değen aralıklar birleşmeli"
        assert birlestir([(600, 700), (610, 620)]) == [(600, 700)], "içteki aralık dıştakini kısaltmamalı (max kullan)"
        assert birlestir([(900, 960), (480, 500)]) == [(480, 500), (900, 960)], "sırasız girdi sıralanmalı"
        assert birlestir([]) == [], "boş takvim"
    '''),
    hints=['Önce başlangıca göre sırala; sonra her aralık yalnızca son birleşmiş aralıkla karşılaştırılır.',
           'Yeni başlangıç son bitişten küçük ya da eşitse birleştir: bitiş <code>max</code> ile güncellenir.'],
    why='Sıralamadan sonra çakışma yalnızca komşu aralıklar arasında olabilir; bu yüzden tek geçiş yeterlidir ve toplam maliyet sıralamanın O(n log n)\'idir. <code>max</code> unutulursa içte kalan kısa bir aralık birleşmiş aralığı yanlışlıkla kısaltır. Aynı kalıp vardiya çakışmaları, IP aralıkları ve "toplam dolu süre" hesaplarında kullanılır; boş saatleri bulmak için birleşmiş aralıkların arasındaki boşluklara bakmak yeterlidir.',
    tags=['aralık birleştirme', 'sıralama', 'algoritma'], min=6))

T.append(dict(
    id='b-299', topic='Algoritmalar', diff=3, kind='yaz',
    title='En az koliyle sipariş tamamlama',
    q='<p>Depo, ürünü yalnızca sabit boyutlu kolilerle gönderebiliyor (ör. 6\'lı, 9\'lu, 20\'li). <code>min_koli(adet, boyutlar)</code> fonksiyonunu dinamik programlama ile yaz: tam olarak <code>adet</code> ürünü göndermek için gereken <b>en az</b> koli sayısını döndürsün; mümkün değilse <code>-1</code>. Açgözlü (önce en büyük koli) yaklaşım her zaman doğru sonuç vermez!</p>',
    start=C(r'''
        def min_koli(adet, boyutlar):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def min_koli(adet, boyutlar):
            SONSUZ = float("inf")
            en_az = [0] + [SONSUZ] * adet
            for a in range(1, adet + 1):
                for b in boyutlar:
                    if b <= a and en_az[a - b] + 1 < en_az[a]:
                        en_az[a] = en_az[a - b] + 1
            return en_az[adet] if en_az[adet] != SONSUZ else -1
    '''),
    tests=C(r'''
        assert min_koli(18, [6, 9, 20]) == 2, "18 = 9 + 9 (2 koli)"
        assert min_koli(26, [6, 9, 20]) == 2, "26 = 20 + 6"
        assert min_koli(43, [6, 9, 20]) == -1, "43 bu kolilerle oluşturulamaz"
        assert min_koli(12, [1, 6, 10]) == 2, "açgözlü 10+1+1 = 3 koli verir; doğru cevap 6+6 = 2"
        assert min_koli(0, [6, 9]) == 0, "0 adet için 0 koli"
        assert min_koli(1000, [6, 9, 20]) == 50, "büyük adette de hızlı çalışmalı (50 x 20)"
    '''),
    hints=['<code>en_az[a]</code> = tam a ürün için en az koli; <code>en_az[0] = 0</code>.',
           'Her a için her koli boyutunu dene: <code>en_az[a - b] + 1</code>.',
           'Ulaşılamayan değerleri sonsuz ile başlat, sonda -1\'e çevir.'],
    why='Problem "bozuk para üstü" (coin change) problemidir: en iyi çözüm, daha küçük alt problemlerin en iyi çözümlerinden kurulur. Tablo yaklaşımı O(adet × boyut sayısı) zamanda çalışır ve her alt problemi bir kez çözer. Açgözlü yöntem yalnızca bazı "kanonik" boyut kümelerinde doğrudur (TL madeni paraları gibi); 1-6-10 örneği bunun neden genel olmadığını gösterir. Alternatif: <code>functools.cache</code> ile özyinelemeli (top-down) çözüm; çok büyük adetlerde özyineleme derinliğine dikkat.',
    tags=['dinamik programlama', 'coin change', 'algoritma'], min=10))

T.append(dict(
    id='b-300', topic='Algoritmalar', diff=1, kind='bug',
    title='Yanlış hesaplanan maaş medyanı',
    q='<p>Hatayı bul ve düzelt. İK raporundaki <code>medyan(degerler)</code> fonksiyonu sırasız listede yanlış değer veriyor; çift sayıda elemanda da ortadaki iki değerin ortalamasını almıyor. Girdi listesini <b>değiştirmeden</b> düzelt.</p>',
    start=C(r'''
        def medyan(degerler):
            n = len(degerler)
            return degerler[n // 2]
    '''),
    sol=C(r'''
        def medyan(degerler):
            s = sorted(degerler)
            n = len(s)
            orta = n // 2
            if n % 2:
                return s[orta]
            return (s[orta - 1] + s[orta]) / 2
    '''),
    tests=C(r'''
        maaslar = [42000, 38000, 90000, 51000, 45000]
        assert medyan(maaslar) == 45000, "tek sayıda eleman: sıralı listenin ortası 45000"
        assert maaslar[0] == 42000, "girdi listesi değişmemeli (sorted kullan, sort değil)"
        assert medyan([30000, 50000, 40000, 60000]) == 45000.0, "çift sayıda: ortadaki iki değerin ortalaması (40000+50000)/2"
        import statistics
        assert medyan([3, 1, 2]) == statistics.median([3, 1, 2]), "statistics.median ile aynı sonuç"
    '''),
    hints=['Medyan, <b>sıralı</b> listenin ortasıdır.', 'Çift uzunlukta ortada iki eleman vardır: <code>n // 2 - 1</code> ve <code>n // 2</code>.'],
    why='Medyan sıralama gerektirir; sırasız listenin ortadaki elemanı anlamsızdır. Çift uzunlukta iki orta değerin ortalaması alınır. Maaş gibi çarpık dağılımlarda medyan ortalamadan daha temsilidir (birkaç yüksek maaş ortalamayı şişirir). Gerçek kodda standart kütüphanedeki <code>statistics.median</code> kullan; kendi yazdığın sürüm, burada olduğu gibi kenar durumları test ederek doğrulanmalıdır.',
    tags=['medyan', 'sorted', 'kenar durum'], min=3))

write('/home/claude/py/v2/b2/bank_orta_09.js', T, 'Veri Yapıları, Algoritmalar (b-291…b-300)')
