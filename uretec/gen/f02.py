from lib import C, write

T = []

# ---------------- Fonksiyonel ----------------
T.append(dict(
    id='b-221', topic='Fonksiyonel', diff=1, t='predict',
    title='max ile en çok stoklu ürün',
    q='<p>Depo sorumlusu en çok stoklu ürünü ve en düşük stok adedini görmek istiyor. Bu kod ne yazdırır?</p>',
    code=C(r'''
        stok = {"kalem": 40, "defter": 3, "silgi": 40}
        print(max(stok, key=stok.get), min(stok.values()))
    '''),
    o=['silgi 3', 'kalem 3', '40 3', 'kalem defter'],
    a=1,
    hints=['Bir sözlük üzerinde dolaşınca anahtarlar gelir; <code>key</code> her anahtarın neye göre karşılaştırılacağını söyler.', 'Eşitlik durumunda <code>max</code> hangisini seçer: ilk gördüğünü mü, sonuncuyu mu?'],
    why='<code>max(stok, key=stok.get)</code> anahtarları dolaşır ama her birini <code>stok.get(anahtar)</code> değerine göre karşılaştırır; sonuç yine bir <b>anahtardır</b>. 40 ile eşitlik olduğunda <code>max</code> ilk karşılaştığı en büyüğü (kalem) döndürür. <code>min(stok.values())</code> yalnızca değerlere bakar: 3. Fonksiyonu (<code>stok.get</code>) çağırmadan değer olarak vermek fonksiyonel programlamanın temelidir.',
    tags=['max', 'key', 'birinci sınıf fonksiyon'], min=2))

T.append(dict(
    id='b-222', topic='Fonksiyonel', diff=2, kind='rehberli',
    title='Temizlik adımlarını birleştir (compose)',
    q='<p>CRM\'e girilen müşteri adları dağınık: <code>"  ayşe   yılmaz "</code>. Ekip, temizlik adımlarını ayrı küçük fonksiyonlar olarak yazdı. <code>birlestir(*fonksiyonlar)</code> fonksiyonunu yaz: verilen fonksiyonları <b>soldan sağa</b> sırayla uygulayan <b>tek bir fonksiyon</b> döndürsün. <code>functools.reduce</code> kullan. Hiç fonksiyon verilmezse değeri olduğu gibi döndüren fonksiyon dönmeli.</p>',
    guide=['<code>birlestir</code> bir iç fonksiyon tanımlayıp onu döndürmeli: <code>def uygula(deger): ...</code>.',
           'İç fonksiyonda <code>reduce</code> ile değeri fonksiyonlardan sırayla geçir.',
           'Biriktirici (acc) o ana kadarki değer, ikinci argüman sıradaki fonksiyon: <code>lambda acc, f: f(acc)</code>.',
           'Başlangıç değeri olarak <code>deger</code>\'i ver; böylece fonksiyon listesi boşsa değer aynen döner.'],
    example=C(r'''
        from functools import reduce
        # reduce ile bir sayıyı işlem listesinden geçirme
        islemler = [lambda x: x + 1, lambda x: x * 10]
        print(reduce(lambda acc, f: f(acc), islemler, 4))   # (4 + 1) * 10 = 50
    '''),
    start=C(r'''
        from functools import reduce

        def birlestir(*fonksiyonlar):
            # TODO 1: tek argüman alan bir iç fonksiyon tanımla
            # TODO 2: içinde reduce ile değeri fonksiyonlardan sırayla geçir
            # TODO 3: iç fonksiyonu döndür
            return None
    '''),
    sol=C(r'''
        from functools import reduce

        def birlestir(*fonksiyonlar):
            def uygula(deger):
                return reduce(lambda acc, f: f(acc), fonksiyonlar, deger)
            return uygula
    '''),
    tests=C(r'''
        def bosluklari_sadelestir(s):
            return " ".join(s.split())
        temizle = birlestir(str.strip, bosluklari_sadelestir, str.title)
        assert callable(temizle), "birlestir bir FONKSİYON döndürmeli"
        assert temizle("  ayşe   yılmaz ") == "Ayşe Yılmaz", f"'Ayşe Yılmaz' bekleniyordu, gelen: {temizle('  ayşe   yılmaz ')!r}"
        sira = birlestir(lambda x: x + 1, lambda x: x * 2)
        assert sira(3) == 8, "soldan sağa uygulanmalı: (3 + 1) * 2 = 8 (sağdan sola olsaydı 7 olurdu)"
        assert birlestir()(42) == 42, "fonksiyon verilmezse değer aynen dönmeli (reduce başlangıç değeri)"
    '''),
    hints=['Fonksiyon döndüren fonksiyon: içeride <code>def</code>, sonda <code>return</code> iç fonksiyonun adı (parantezsiz).',
           '<code>reduce(fonksiyon, dizi, baslangic)</code>; burada dizi = <code>fonksiyonlar</code>, başlangıç = <code>deger</code>.',
           '<code>return reduce(lambda acc, f: f(acc), fonksiyonlar, deger)</code>'],
    why='Fonksiyon bileşimi (composition) küçük, test edilebilir adımları tek bir işleme dönüştürür; <code>reduce</code> değeri her fonksiyondan sırayla geçirir. Başlangıç değeri verildiği için boş liste güvenlidir. Alternatif: iç fonksiyonda basit bir <code>for f in fonksiyonlar: deger = f(deger)</code> döngüsü; çoğu ekip bunu daha okunur bulur ve iki çözüm de eşdeğerdir.',
    tags=['reduce', 'compose', 'yüksek mertebe fonksiyon'], min=7))

T.append(dict(
    id='b-223', topic='Fonksiyonel', diff=3, kind='yaz',
    title='Rapor sütunlarına göre dinamik sıralama',
    q='<p>Raporlama ekranında kullanıcı sıralama alanlarını seçiyor: <code>["sehir", "-tutar"]</code> → önce şehir artan, sonra tutar <b>azalan</b>; başında <code>-</code> olan alan azalan demek. <code>sirala(kayitlar, alanlar)</code> fonksiyonunu yaz; yeni liste döndürsün. Alanlar metin de olabilir sayı da (metni eksiyle çeviremezsin!). İpucu: Python\'un sıralaması <b>kararlıdır</b> (stable).</p>',
    start=C(r'''
        def sirala(kayitlar, alanlar):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def sirala(kayitlar, alanlar):
            sonuc = list(kayitlar)
            for alan in reversed(alanlar):
                azalan = alan.startswith("-")
                ad = alan.lstrip("-")
                sonuc.sort(key=lambda k: k[ad], reverse=azalan)
            return sonuc
    '''),
    tests=C(r'''
        k = [{"sehir": "İzmir", "ad": "Can", "tutar": 50}, {"sehir": "Ankara", "ad": "Ece", "tutar": 10},
             {"sehir": "Ankara", "ad": "Ali", "tutar": 90}, {"sehir": "İzmir", "ad": "Ada", "tutar": 70}]
        r = sirala(k, ["sehir", "-tutar"])
        assert [x["ad"] for x in r] == ["Ali", "Ece", "Ada", "Can"], f"şehir artan, tutar azalan: Ali, Ece, Ada, Can bekleniyordu, gelen {[x['ad'] for x in r]}"
        r2 = sirala(k, ["-sehir", "ad"])
        assert [x["ad"] for x in r2] == ["Ada", "Can", "Ali", "Ece"], "metin alanı da azalan sıralanabilmeli (-sehir), sonra ad artan"
        assert k[0]["ad"] == "Can", "orijinal liste değişmemeli; kopyası üzerinde çalış"
        assert sirala(k, []) == k, "alan verilmezse sıra aynen kalmalı"
    '''),
    hints=['Tek bir key demetinde metni negatifleyemezsin; bunun yerine birden fazla sıralama yap.',
           'Kararlı sıralamada <b>en önemsiz</b> alandan başlayıp en önemliye doğru sıralarsan önceki sıra eşitlerde korunur: <code>reversed(alanlar)</code>.',
           'Her alan için <code>sonuc.sort(key=lambda k: k[ad], reverse=alan.startswith("-"))</code>.'],
    why='Python\'un Timsort algoritması kararlıdır: eşit anahtarlı elemanların göreli sırası korunur. Bu yüzden ikincil alandan birincil alana doğru ardışık sıralamak, çok anahtarlı karışık yönlü sıralama verir ve metin alanlarında da çalışır. Alternatif: <code>functools.cmp_to_key</code> ile alanları tek tek karşılaştıran bir karşılaştırma fonksiyonu yazmak; tek geçişlidir ama daha uzun ve hata yapmaya açıktır.',
    tags=['sort', 'kararlı sıralama', 'key'], min=9))

T.append(dict(
    id='b-224', topic='Fonksiyonel', diff=1, kind='bug',
    title='None dönen sıralama fonksiyonu',
    q='<p>Hatayı bul ve düzelt. <code>ucuzdan_pahaliya(urunler)</code> ürünleri fiyata göre artan sırayla <b>yeni bir liste</b> olarak döndürmeli ve gelen listeyi <b>değiştirmemeli</b>. Şu an <code>None</code> dönüyor.</p>',
    start=C(r'''
        def ucuzdan_pahaliya(urunler):
            return urunler.sort(key=lambda u: u["fiyat"])
    '''),
    sol=C(r'''
        def ucuzdan_pahaliya(urunler):
            return sorted(urunler, key=lambda u: u["fiyat"])
    '''),
    tests=C(r'''
        u = [{"ad": "Çanta", "fiyat": 400}, {"ad": "Kalem", "fiyat": 15}]
        r = ucuzdan_pahaliya(u)
        assert r is not None, "list.sort() yerinde sıralar ve None döndürür; sorted() yeni liste döndürür"
        assert [x["ad"] for x in r] == ["Kalem", "Çanta"], "fiyata göre artan: Kalem, Çanta"
        assert u[0]["ad"] == "Çanta", "gelen liste değişmemeli (yan etki yok)"
    '''),
    hints=['<code>list.sort()</code> ne döndürür?', 'Yeni liste döndüren yerleşik fonksiyon: <code>sorted(iterable, key=...)</code>.'],
    why='<code>list.sort()</code> listeyi yerinde (in-place) değiştirir ve <code>None</code> döndürür; bu, "yan etkili işlem değer döndürmez" Python ilkesidir. <code>sorted()</code> ise girdiye dokunmadan yeni liste üretir; fonksiyonel tarzda çağırana ait veriyi değiştirmemek beklenir. Girdiyi bilerek değiştirmek istiyorsan <code>urunler.sort(...)</code> satırını ayrı yazıp ardından <code>return urunler</code> diyebilirsin, ama bu çağıranı şaşırtabilir.',
    tags=['sorted', 'sort', 'yan etki'], min=2))

T.append(dict(
    id='b-225', topic='Fonksiyonel', diff=2, kind='tamamla',
    title='Depo stoklarını reduce ile birleştir',
    q='<p>Her depo stoğunu <code>{"kalem": 10, "defter": 5}</code> gibi bir sözlükte tutuyor. <code>toplam_stok(depolar)</code>, <code>reduce</code> ile tüm depoları tek sözlükte toplamalı. <code>birlestir</code> fonksiyonundaki boşluğu tamamla: sonuç sözlüğü iki sözlükte geçen <b>tüm</b> anahtarları içermeli.</p>',
    start=C(r'''
        from functools import reduce

        def birlestir(acc, depo):
            return {k: acc.get(k, 0) + depo.get(k, 0) for k in ___}

        def toplam_stok(depolar):
            return reduce(birlestir, depolar, {})
    '''),
    sol=C(r'''
        from functools import reduce

        def birlestir(acc, depo):
            return {k: acc.get(k, 0) + depo.get(k, 0) for k in acc.keys() | depo.keys()}

        def toplam_stok(depolar):
            return reduce(birlestir, depolar, {})
    '''),
    tests=C(r'''
        r = toplam_stok([{"kalem": 10, "defter": 5}, {"kalem": 3, "silgi": 7}, {"defter": 1}])
        assert r == {"kalem": 13, "defter": 6, "silgi": 7}, f"kalem 13, defter 6, silgi 7 bekleniyordu, gelen: {r}"
        assert toplam_stok([]) == {}, "depo yoksa reduce başlangıç değeri {} dönmeli"
    '''),
    hints=['İki sözlüğün anahtarlarının <b>birleşimi</b> gerekiyor.', '<code>dict.keys()</code> küme gibi davranır: <code>a.keys() | b.keys()</code>.'],
    why='<code>keys()</code> görünümleri küme işlemlerini destekler; <code>|</code> iki sözlükteki tüm anahtarları verir, <code>get(k, 0)</code> eksik anahtarı 0 sayar. <code>reduce</code> bu ikili birleştirmeyi tüm depolara yayar. Alternatif ve genelde daha pratik yol: <code>sum((Counter(d) for d in depolar), Counter())</code> ya da bir <code>Counter</code> üzerinde <code>update</code> döngüsü.',
    tags=['reduce', 'dict keys', 'birleşim'], min=4))

# ---------------- Kapanışlar ----------------
T.append(dict(
    id='b-226', topic='Kapanışlar', diff=2, t='predict',
    title='Döngüde üretilen lambda\'lar',
    q='<p>Bir geliştirici 1x, 2x, 3x çarpan fonksiyonlarını döngüde üretiyor. Bu kod ne yazdırır?</p>',
    code=C(r'''
        fonks = [lambda x: x * i for i in range(1, 4)]
        print([f(10) for f in fonks])
    '''),
    o=['[10, 20, 30]', '[30, 30, 30]', '[0, 10, 20]', 'NameError'],
    a=1,
    hints=['Lambda, <code>i</code>\'nin değerini mi saklar yoksa <code>i</code> değişkeninin kendisine mi bakar?', 'Fonksiyonlar çağrıldığında döngü çoktan bitmiştir.'],
    why='Kapanış (closure) değişkenin <b>değerini değil</b>, değişkenin kendisini yakalar (geç bağlama, late binding). Lambda\'lar çağrıldığında comprehension bitmiş ve <code>i</code> son değeri 3\'te kalmıştır; hepsi 10 * 3 = 30 verir. Değeri o anda dondurmak için varsayılan argüman kullanılır: <code>lambda x, i=i: x * i</code> ya da <code>functools.partial</code>.',
    tags=['closure', 'late binding', 'lambda'], min=2))

T.append(dict(
    id='b-227', topic='Kapanışlar', diff=2, t='predict', raises=True,
    title='nonlocal unutulursa',
    q='<p>Bir sayaç fabrikası yazılmış ama <code>nonlocal</code> unutulmuş. Bu kod ne yapar?</p>',
    code=C(r'''
        def sayac():
            n = 0
            def artir():
                n += 1
                return n
            return artir

        s = sayac()
        print(s())
    '''),
    o=['1 yazdırır', '0 yazdırır', 'UnboundLocalError hatası verir', 'NameError hatası verir'],
    a=2,
    hints=['İç fonksiyonda bir ada atama yapmak (<code>n += 1</code>) o adı nereye ait yapar?', 'Okumaya çalışırken yerel <code>n</code> henüz değer almamış.'],
    why='Bir fonksiyon içinde bir ada atama yapıldığında Python o adı <b>yerel</b> kabul eder. <code>n += 1</code> önce yerel <code>n</code>\'yi okumaya çalışır, ama yerel <code>n</code> henüz atanmamıştır: <code>UnboundLocalError</code> (NameError\'ın alt sınıfı, ama mesajı ve türü farklı). Çözüm: iç fonksiyonun başına <code>nonlocal n</code> yazmak. Yalnızca okuma yapılsaydı (<code>return n + 1</code>) hata olmazdı.',
    tags=['closure', 'nonlocal', 'kapsam'], min=2))

T.append(dict(
    id='b-228', topic='Kapanışlar', diff=2, kind='rehberli',
    title='API hız sınırlayıcı',
    q='<p>Ilgaz Bank\'ın dış API\'si "son <code>pencere</code> saniyede en fazla <code>limit</code> istek" kuralı uyguluyor. <code>hiz_siniri(limit, pencere)</code> fonksiyonunu yaz: bir <code>izin(zaman)</code> fonksiyonu döndürsün. <code>izin</code> çağrı anını (saniye, artan sayılar) alır; son <code>pencere</code> saniyede (yani <code>zaman - pencere</code>\'den <b>büyük</b> anlarda) kabul edilmiş istek sayısı <code>limit</code>\'ten azsa isteği kaydedip <code>True</code>, değilse <code>False</code> döndürür. Reddedilen istek kaydedilmez. Her sınırlayıcı kendi durumunu tutmalı.</p>',
    guide=['Dış fonksiyonda kabul edilen isteklerin zamanlarını tutacak bir <code>deque</code> oluştur.',
           'İç <code>izin(zaman)</code> fonksiyonunda önce pencere dışında kalan eski zamanları baştan at (<code>popleft</code>).',
           'Kalan sayı <code>limit</code>\'ten küçükse zamanı ekle ve <code>True</code> döndür; değilse <code>False</code>.',
           'Dış fonksiyon iç fonksiyonu döndürsün. Deque\'yi yalnızca değiştirdiğin (yeniden atamadığın) için <code>nonlocal</code> gerekmez.'],
    example=C(r'''
        from collections import deque
        # Kapanışın içinde değişebilir bir kap tutmak
        def kayit_tutucu(kapasite):
            son = deque()
            def ekle(x):
                son.append(x)
                if len(son) > kapasite:
                    son.popleft()
                return list(son)
            return ekle

        k = kayit_tutucu(2)
        k("a"); k("b")
        print(k("c"))   # ['b', 'c']
    '''),
    start=C(r'''
        from collections import deque

        def hiz_siniri(limit, pencere):
            # TODO 1: kabul edilen zamanlar için deque
            def izin(zaman):
                # TODO 2: pencere dışındaki eski kayıtları at
                # TODO 3: yer varsa kaydet ve True, yoksa False
                return True
            return izin
    '''),
    sol=C(r'''
        from collections import deque

        def hiz_siniri(limit, pencere):
            kabul = deque()
            def izin(zaman):
                while kabul and kabul[0] <= zaman - pencere:
                    kabul.popleft()
                if len(kabul) < limit:
                    kabul.append(zaman)
                    return True
                return False
            return izin
    '''),
    tests=C(r'''
        izin = hiz_siniri(2, 10)
        r = [izin(t) for t in [0, 1, 2, 9, 10, 11, 12]]
        assert r[:3] == [True, True, False], "ilk iki istek kabul, üçüncüsü (t=2) reddedilmeli: 10 sn'de en fazla 2"
        assert r[3] is False, "t=9: 0 ve 1 hâlâ pencerede, ret"
        assert r[4] is True, "t=10: t=0 artık pencere dışında (10 - 10 = 0'dan büyük olmalı), kabul"
        assert r[5] is True and r[6] is False, f"t=11 kabul (t=1 düştü), t=12 ret beklenir, gelen: {r}"
        diger = hiz_siniri(1, 5)
        assert diger(0) is True and diger(1) is False, "ikinci sınırlayıcı kendi durumunu tutmalı (bağımsız kapanış)"
        assert izin(100) is True, "uzun süre sonra tekrar izin verilmeli"
    '''),
    hints=['Durum (kabul edilen zamanlar) dış fonksiyonun yerel değişkeninde yaşar; iç fonksiyon onu kapanışla görür.',
           'Pencere kontrolü: <code>while kabul and kabul[0] &lt;= zaman - pencere: kabul.popleft()</code>.',
           'Sonra <code>if len(kabul) &lt; limit: kabul.append(zaman); return True</code>, aksi halde <code>return False</code>.'],
    why='Kapanış, durumu sınıfa gerek kalmadan fonksiyonla birlikte taşır; her <code>hiz_siniri</code> çağrısı kendi <code>deque</code>\'sini oluşturur. Kayan pencere (sliding window) algoritması eski kayıtları baştan atar; <code>deque.popleft</code> O(1) olduğu için verimlidir. Alternatif: <code>__call__</code> metotlu bir <code>HizSiniri</code> sınıfı; durum büyüdükçe ve test etmek gerektiğinde sınıf daha okunur olur.',
    tags=['closure', 'deque', 'rate limit'], min=8))

T.append(dict(
    id='b-229', topic='Kapanışlar', diff=2, kind='yaz',
    title='Kurları donduran çevirici',
    q='<p>Fatura kesilirken o anki döviz kurları <b>sabitlenmeli</b>; sonradan kur tablosu güncellense bile kesilen faturanın çeviricisi eski kurları kullanmalı. <code>cevirici(kurlar)</code> fonksiyonunu yaz: <code>kurlar</code> TL karşılıklarını tutar (<code>{"USD": 32.5, "EUR": 35.0, "TL": 1}</code>). Döndürdüğü <code>cevir(tutar, kaynak, hedef)</code> fonksiyonu tutarı çevirip <code>round(..., 2)</code> ile döndürsün.</p>',
    start=C(r'''
        def cevirici(kurlar):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def cevirici(kurlar):
            sabit = dict(kurlar)
            def cevir(tutar, kaynak, hedef):
                return round(tutar * sabit[kaynak] / sabit[hedef], 2)
            return cevir
    '''),
    tests=C(r'''
        kurlar = {"USD": 32.5, "EUR": 35.0, "TL": 1}
        c = cevirici(kurlar)
        assert c(100, "USD", "TL") == 3250.0, "100 USD = 3250 TL"
        assert c(70, "EUR", "USD") == 75.38, "70 EUR = 70*35/32.5 = 75.38 USD"
        kurlar["USD"] = 40.0
        assert c(100, "USD", "TL") == 3250.0, "kur tablosu sonradan değişse de çevirici ESKİ kurları kullanmalı: kapanışa sözlüğün KOPYASINI ver"
        assert cevirici(kurlar)(1, "USD", "TL") == 40.0, "yeni çevirici yeni kurla çalışmalı"
    '''),
    hints=['Kapanış nesneye <b>referansla</b> bakar; dışarıdaki sözlük değişirse içerisi de değişmiş görür.',
           'Dış fonksiyonda <code>sabit = dict(kurlar)</code> ile kopya al, iç fonksiyon kopyayı kullansın.'],
    why='Kapanış, dış değişkenin gösterdiği nesneyi paylaşır; değişebilir bir sözlük dışarıdan güncellenirse kapanış da yeni değeri görür. Kopya alarak "anlık görüntü" (snapshot) dondurulur: muhasebede kesilen belgenin değişmemesi tam olarak budur. İç içe yapılar varsa <code>copy.deepcopy</code> gerekir; daha da güvenlisi değiştirilemez <code>types.MappingProxyType</code> ya da demet kullanmaktır.',
    tags=['closure', 'kopya', 'snapshot'], min=5))

T.append(dict(
    id='b-230', topic='Kapanışlar', diff=2, kind='bug',
    title='Hepsi aynı oranı uygulayan kampanyalar',
    q='<p>Hatayı bul ve düzelt. <code>kampanya_fonksiyonlari(kampanyalar)</code>, <code>{"YAZ10": 0.10, "KIS25": 0.25}</code> gibi bir sözlükten her kod için indirim uygulayan bir fonksiyon üretmeli. Şu an tüm kodlar <b>son</b> kampanyanın oranını uyguluyor.</p>',
    start=C(r'''
        def kampanya_fonksiyonlari(kampanyalar):
            fonks = {}
            for kod, oran in kampanyalar.items():
                fonks[kod] = lambda fiyat: round(fiyat * (1 - oran), 2)
            return fonks
    '''),
    sol=C(r'''
        def kampanya_fonksiyonlari(kampanyalar):
            fonks = {}
            for kod, oran in kampanyalar.items():
                fonks[kod] = lambda fiyat, oran=oran: round(fiyat * (1 - oran), 2)
            return fonks
    '''),
    tests=C(r'''
        f = kampanya_fonksiyonlari({"YAZ10": 0.10, "KIS25": 0.25})
        assert f["KIS25"](200) == 150.0, "KIS25: 200 * 0.75 = 150"
        assert f["YAZ10"](200) == 180.0, "YAZ10: 200 * 0.90 = 180; her lambda kendi oranını o anda yakalamalı (geç bağlama hatası)"
    '''),
    hints=['Lambda <code>oran</code> değişkenine çağrıldığı anda bakar; o anda döngü bitmiş olur.',
           'Değeri tanım anında dondurmak için varsayılan argüman kullan: <code>lambda fiyat, oran=oran: ...</code>.'],
    why='Varsayılan argümanlar fonksiyon <b>tanımlanırken</b> değerlendirilir, bu yüzden <code>oran=oran</code> her turdaki değeri ayrı ayrı saklar. Daha temiz alternatif bir fabrika fonksiyonudur: <code>def indirim_yap(oran): return lambda f: round(f * (1 - oran), 2)</code>; her çağrı yeni bir kapsam açtığı için geç bağlama sorunu olmaz ve imzada fazladan parametre görünmez.',
    tags=['closure', 'late binding', 'varsayılan argüman'], min=4))

write('/home/claude/py/v2/b2/bank_orta_02.js', T, 'Fonksiyonel, Kapanışlar (b-221…b-230)')
