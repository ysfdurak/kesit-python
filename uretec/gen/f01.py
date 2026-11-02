from lib import C, write

T = []

# ---------------- Comprehension ----------------
T.append(dict(
    id='b-211', topic='Comprehension', diff=1, t='predict',
    title='Aynı anahtar iki kez gelirse',
    q='<p>Anadolu Market\'te bir stajyer, şehir başına sipariş tutarını dict comprehension ile çıkarmaya çalışıyor. Bu kod ne yazdırır?</p>',
    code=C(r'''
        siparisler = [("Ankara", 120), ("İzmir", 80), ("Ankara", 45)]
        son = {sehir: tutar for sehir, tutar in siparisler}
        print(son)
    '''),
    o=["{'Ankara': 165, 'İzmir': 80}", "{'Ankara': 120, 'İzmir': 80}", "{'Ankara': 45, 'İzmir': 80}", "{'Ankara': [120, 45], 'İzmir': 80}"],
    a=2,
    hints=['Sözlükte bir anahtar yalnızca bir kez bulunabilir.', 'Aynı anahtara ikinci atama ne yapar: toplar mı, ezer mi?'],
    why='Dict comprehension her elemanda <code>son[sehir] = tutar</code> ataması yapar gibi çalışır; aynı anahtar tekrar gelince eski değer <b>ezilir</b>, toplanmaz. Bu yüzden Ankara için son görülen 45 kalır ve anahtar ilk eklendiği sırada (Ankara önce) durur. Toplamak istiyorsan comprehension yerine döngü + <code>dict.get(k, 0) + v</code> ya da <code>collections.Counter</code>/<code>defaultdict</code> kullan.',
    tags=['dict comprehension', 'anahtar ezme'], min=2))

T.append(dict(
    id='b-212', topic='Comprehension', diff=2, kind='rehberli',
    title='Depo bazında kritik stok listesi',
    q='<p>Anadolu Market\'in depoları <code>{"Gebze": {"kalem": 40, "defter": 3}, ...}</code> biçiminde tutuluyor. <code>kritik_stok(depolar, esik)</code> fonksiyonunu yaz: her depo için adedi <code>esik</code>\'ten <b>küçük</b> ürün adlarını <b>alfabetik</b> liste olarak döndürsün. Kritik ürünü olmayan depolar sonuçta <b>hiç yer almasın</b>. Tek bir dict comprehension yeterli.</p>',
    guide=['Dış yapı bir dict comprehension: <code>{depo: ... for depo, stok in depolar.items() ...}</code>.',
           'Değer kısmında iç comprehension ile <code>adet &lt; esik</code> olan ürün adlarını seç.',
           'İç sonucu <code>sorted(...)</code> ile alfabetik yap.',
           'Dış comprehension\'a bir <code>if</code> ekle: depoda en az bir kritik ürün var mı? (<code>any</code>)'],
    example=C(r'''
        # Benzer teknik: her sınıf için 50 altı alan öğrenciler, kimse yoksa sınıf yok
        notlar = {"9A": {"Ece": 45, "Can": 80}, "9B": {"Ali": 90}}
        zayif = {s: sorted(o for o, n in d.items() if n < 50)
                 for s, d in notlar.items() if any(n < 50 for n in d.values())}
        print(zayif)   # {'9A': ['Ece']}
    '''),
    start=C(r'''
        def kritik_stok(depolar, esik):
            # TODO 1: depolar.items() üzerinde dict comprehension kur
            # TODO 2: değer: adet < esik olan ürün adları, sorted ile
            # TODO 3: kritik ürünü olmayan depoyu if ile dışarıda bırak
            return {}
    '''),
    sol=C(r'''
        def kritik_stok(depolar, esik):
            return {
                depo: sorted(urun for urun, adet in stok.items() if adet < esik)
                for depo, stok in depolar.items()
                if any(adet < esik for adet in stok.values())
            }
    '''),
    tests=C(r'''
        d = {"Gebze": {"kalem": 40, "defter": 3, "silgi": 1}, "Kemalpaşa": {"çanta": 25}, "Hadımköy": {"zımba": 4}}
        r = kritik_stok(d, 5)
        assert r == {"Gebze": ["defter", "silgi"], "Hadımköy": ["zımba"]}, f"eşik 5 için Gebze [defter, silgi] ve Hadımköy [zımba] bekleniyordu, gelen: {r}"
        assert "Kemalpaşa" not in r, "kritik ürünü olmayan depo sonuçta yer almamalı (dış comprehension'da if)"
        assert kritik_stok(d, 1) == {}, "eşik 1 iken hiçbir ürün 1'den küçük değil: boş sözlük"
        assert kritik_stok({}, 10) == {}, "boş depo sözlüğü boş sonuç vermeli"
    '''),
    hints=['İki seviye var: dışta depolar, içte ürünler. Her seviye ayrı bir comprehension.',
           'Değer: <code>sorted(u for u, a in stok.items() if a &lt; esik)</code>.',
           'Sona <code>if any(a &lt; esik for a in stok.values())</code> ekle.'],
    why='Dış dict comprehension depoları dolaşır; iç üreteç ifadesi yalnızca kritik ürünleri seçer, <code>sorted</code> hem sıralar hem listeye çevirir. Dıştaki <code>if any(...)</code> boş listeli depoları baştan eler. Alternatif: önce tüm depolar için listeyi hesaplayıp sonra <code>{k: v for k, v in ara.items() if v}</code> ile boşları atmak; bu, kritik koşulu iki kez yazmamanı sağlar ve koşul pahalıysa daha verimlidir.',
    tags=['dict comprehension', 'iç içe', 'any'], min=7))

T.append(dict(
    id='b-213', topic='Comprehension', diff=2, kind='yaz',
    title='Dağınık fiyat metinlerini ayıkla',
    q='<p>Tedarikçiden gelen fiyat listesi karışık: <code>[" 1.250,50 TL", "yok", "99,90", "", "2.000 TL"]</code>. <code>fiyatlari_ayikla(metinler)</code> fonksiyonunu yaz: her metni Türk biçiminden (binlik ayırıcı nokta, ondalık virgül, isteğe bağlı <code>TL</code>) <code>float</code>\'a çevirsin; çevrilemeyenleri <b>atlasın</b>. Sonuç bir liste olsun. İpucu: comprehension içinde mors operatörü (walrus, <code>:=</code>) ile çeviriyi bir kez yapabilirsin.</p>',
    start=C(r'''
        def fiyatlari_ayikla(metinler):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def cevir(metin):
            temiz = metin.replace("TL", "").strip().replace(".", "").replace(",", ".")
            try:
                return float(temiz)
            except ValueError:
                return None


        def fiyatlari_ayikla(metinler):
            return [f for m in metinler if (f := cevir(m)) is not None]
    '''),
    tests=C(r'''
        r = fiyatlari_ayikla([" 1.250,50 TL", "yok", "99,90", "", "2.000 TL"])
        assert r == [1250.5, 99.9, 2000.0], f"[1250.5, 99.9, 2000.0] bekleniyordu, gelen: {r}"
        assert fiyatlari_ayikla(["0,00"]) == [0.0], "0,00 geçerli bir fiyattır; 0.0 'yanlış-değer' diye atılmamalı (is not None ile kontrol et)"
        assert fiyatlari_ayikla([]) == [], "boş liste boş sonuç"
    '''),
    hints=['Önce tek bir metni çeviren küçük bir yardımcı fonksiyon yaz; hata olursa <code>None</code> döndürsün.',
           'Sıra önemli: önce <code>.</code> (binlik) sil, sonra <code>,</code> → <code>.</code>.',
           '<code>[f for m in metinler if (f := cevir(m)) is not None]</code>'],
    why='Dönüştürme mantığını <code>try/except</code> içeren bir yardımcıya almak comprehension\'ı okunur tutar; walrus ile çeviri bir kez yapılıp hem filtrede hem sonuçta kullanılır. <code>if f</code> yerine <code>is not None</code> şart, yoksa 0.0 fiyat atılır. Alternatif: <code>[cevir(m) for m in metinler]</code> sonra <code>None</code>\'ları süzmek; iki geçiş ama walrus bilmeyen ekipler için daha tanıdık.',
    tags=['list comprehension', 'walrus', 'veri temizleme'], min=6))

T.append(dict(
    id='b-214', topic='Comprehension', diff=1, kind='bug',
    title='İndirim uygulanırken kaybolan ürünler',
    q='<p>Hatayı bul ve düzelt. <code>indirimli(fiyatlar)</code> 100 TL\'den pahalı ürünlere %10 indirim uygulayıp (<code>round(x * 0.9, 2)</code>) <b>tüm</b> fiyatları aynı sırada döndürmeli. Şu an ucuz ürünler listeden kayboluyor.</p>',
    start=C(r'''
        def indirimli(fiyatlar):
            return [round(x * 0.9, 2) for x in fiyatlar if x > 100]
    '''),
    sol=C(r'''
        def indirimli(fiyatlar):
            return [round(x * 0.9, 2) if x > 100 else x for x in fiyatlar]
    '''),
    tests=C(r'''
        r = indirimli([50, 200, 100, 150.5])
        assert len(r) == 4, "liste uzunluğu değişmemeli: sondaki if FİLTRELER, baştaki if-else DÖNÜŞTÜRÜR"
        assert r == [50, 180.0, 100, 135.45], f"[50, 180.0, 100, 135.45] bekleniyordu, gelen: {r}"
    '''),
    hints=['Comprehension\'da <code>for</code>\'dan sonra gelen <code>if</code> elemanı tamamen atar.',
           'Her eleman için iki seçenekten birini istiyorsan koşullu ifade (<code>a if koşul else b</code>) <code>for</code>\'dan <b>önce</b> yazılır.'],
    why='<code>[ifade for x in l if koşul]</code> filtredir; koşulu sağlamayan eleman sonuca girmez. Her eleman korunup yalnızca değeri değişecekse koşullu ifade baştaki ifadenin içine yazılır: <code>[A if k else B for x in l]</code>. Alternatif olarak dönüşümü <code>def fiyat_ayarla(x)</code> gibi bir fonksiyona alıp <code>[fiyat_ayarla(x) for x in fiyatlar]</code> yazmak, kurallar çoğaldığında daha okunurdur.',
    tags=['list comprehension', 'koşullu ifade', 'filtre'], min=3))

T.append(dict(
    id='b-215', topic='Comprehension', diff=2, kind='tamamla',
    title='Personel × ay prim tablosu',
    q='<p>İK, her personel için her ayın primini 0 ile başlatan iç içe bir tablo istiyor: <code>{"Ece": {"Oca": 0, "Şub": 0}, ...}</code>. <code>prim_tablosu(personel, aylar)</code> fonksiyonundaki boşluğu tamamla. Dikkat: her personelin iç sözlüğü <b>bağımsız</b> olmalı; birinin primi değişince diğerleri etkilenmemeli.</p>',
    start=C(r'''
        def prim_tablosu(personel, aylar):
            return {p: ___ for p in personel}
    '''),
    sol=C(r'''
        def prim_tablosu(personel, aylar):
            return {p: {ay: 0 for ay in aylar} for p in personel}
    '''),
    tests=C(r'''
        t = prim_tablosu(["Ece", "Can"], ["Oca", "Şub"])
        assert t == {"Ece": {"Oca": 0, "Şub": 0}, "Can": {"Oca": 0, "Şub": 0}}, f"tablo yapısı yanlış: {t}"
        t["Ece"]["Oca"] = 500
        assert t["Can"]["Oca"] == 0, "Can'ın primi değişmemeli: her personel için YENİ iç sözlük üretilmeli (aynı nesneyi paylaşma)"
        assert prim_tablosu([], ["Oca"]) == {}, "personel yoksa boş sözlük"
    '''),
    hints=['Boşluğa bir ifade gelecek ve bu ifade her personel için yeniden değerlendirilmeli.',
           'İç sözlüğü de bir dict comprehension ile üret: <code>{ay: 0 for ay in aylar}</code>.'],
    why='Comprehension\'daki değer ifadesi her turda <b>yeniden</b> çalışır, bu yüzden iç dict comprehension her personel için yeni bir sözlük üretir. Önce <code>bos = {ay: 0 ...}</code> yazıp <code>{p: bos for p in personel}</code> demek tüm personele <b>aynı</b> sözlüğü bağlar (listedeki <code>[[0]*3]*3</code> tuzağının sözlük hâli). Alternatif: <code>dict.fromkeys(aylar, 0)</code> çağrısını değer ifadesine yazmak da her turda yeni sözlük üretir ve aynı derecede doğrudur.',
    tags=['dict comprehension', 'iç içe', 'paylaşılan nesne'], min=4))

# ---------------- Üreteçler ----------------
T.append(dict(
    id='b-216', topic='Üreteçler', diff=2, t='predict',
    title='Üreteç ne zaman çalışır?',
    q='<p>Bir üreteç fonksiyonunun gövdesi tam olarak ne zaman çalışır? Bu kod ne yazdırır?</p>',
    code=C(r'''
        def adimlar():
            print("başla")
            yield 1
            print("orta")
            yield 2
            print("bitti")

        g = adimlar()
        print("hazır")
        for x in g:
            print(x)
    '''),
    o=['başla\nhazır\n1\norta\n2\nbitti', 'hazır\nbaşla\n1\norta\n2\nbitti', 'hazır\nbaşla\norta\nbitti\n1\n2', 'hazır\n1\n2'],
    a=1,
    hints=['<code>adimlar()</code> çağrısı gövdeyi çalıştırmaz; yalnızca bir üreteç nesnesi oluşturur.', 'Her <code>next</code> bir sonraki <code>yield</code>\'e kadar çalışır.'],
    why='Üreteç fonksiyonu çağrıldığında gövdeden tek satır çalışmaz; "hazır" önce basılır. <code>for</code> ilk <code>next</code>\'i istediğinde "başla" basılıp 1 verilir, ikinci turda "orta" ve 2, üçüncü <code>next</code>\'te "bitti" basılır ve <code>StopIteration</code> döngüyü bitirir. Bu tembel (lazy) çalışma, büyük dosyaları satır satır işlerken belleği korur.',
    tags=['yield', 'tembel değerlendirme'], min=2))

T.append(dict(
    id='b-217', topic='Üreteçler', diff=2, t='order',
    title='Hatalı satırları atlayan ayrıştırıcı',
    q='<p>Anadolu Bank işlem satırlarını (<code>"hesap;tutar"</code>) ayrıştırıp sayısal olmayan tutarları atlayan bir üreteç ve onu kullanan toplamı sırala. Program <code>350</code> yazdırmalı.</p>',
    lines=['def ayristir(kaynak):',
           '    for s in kaynak:',
           '        hesap, tutar = s.split(";")',
           '        if tutar.isdigit():',
           '            yield hesap, int(tutar)',
           'gecerli = ayristir(["TR1;100", "TR2;abc", "TR3;250"])',
           'print(sum(t for _, t in gecerli))'],
    expect='350\n',
    hint='Üreteç önce tanımlanmalı; yield, koşulun içinde olmalı ki yalnızca geçerli satırlar üretilsin.',
    hints=['Üreteç önce tanımlanmalı; yield, koşulun içinde olmalı ki yalnızca geçerli satırlar üretilsin.'],
    why='Üreteç her satırı ayırır, yalnızca tutarı rakamlardan oluşanları <code>yield</code> eder. <code>ayristir(...)</code> çağrısı hiçbir şey hesaplamaz; <code>sum</code> değerleri çektikçe satırlar işlenir. Bu "boru hattı" (pipeline) kalıbı ETL işlerinde çok yaygındır: okuma, ayrıştırma, filtreleme ayrı üreteçlerde tutulur ve birbirine bağlanır.',
    tags=['yield', 'pipeline'], min=3))

T.append(dict(
    id='b-218', topic='Üreteçler', diff=2, kind='rehberli',
    title='Herhangi bir kaynaktan partiler',
    q='<p>Kampanya e-postaları 500\'lük partiler halinde gönderilecek; müşteri listesi bir veritabanı imlecinden (cursor) <b>üreteç</b> olarak geliyor, yani dilimleme (<code>[i:i+n]</code>) ve <code>len</code> kullanılamaz. <code>partiler(kaynak, n)</code> üreteç fonksiyonunu yaz: herhangi bir yinelenebilirden (iterable) <code>n</code>\'lik listeler <code>yield</code> etsin; son parti eksik olabilir, boş parti üretme.</p>',
    guide=['<code>it = iter(kaynak)</code> ile tek bir yineleyici (iterator) al; hep onu kullan.',
           'Sonsuz bir <code>while True</code> döngüsü kur.',
           'Her turda <code>list(islice(it, n))</code> ile en fazla n eleman çek.',
           'Çekilen liste boşsa <code>return</code> ile bitir, değilse <code>yield</code> et.'],
    example=C(r'''
        from itertools import islice
        # islice bir yineleyiciden en fazla n eleman alır ve kaldığı yeri hatırlar
        it = iter(range(7))
        print(list(islice(it, 3)))   # [0, 1, 2]
        print(list(islice(it, 3)))   # [3, 4, 5]
        print(list(islice(it, 3)))   # [6]
        print(list(islice(it, 3)))   # []
    '''),
    start=C(r'''
        from itertools import islice

        def partiler(kaynak, n):
            # TODO 1: kaynaktan bir yineleyici al
            # TODO 2: döngüde islice ile en fazla n eleman çek
            # TODO 3: boşsa bitir, değilse yield et
            yield []
    '''),
    sol=C(r'''
        from itertools import islice

        def partiler(kaynak, n):
            it = iter(kaynak)
            while True:
                parti = list(islice(it, n))
                if not parti:
                    return
                yield parti
    '''),
    tests=C(r'''
        musteriler = (f"m{i}@ornek.com" for i in range(5))
        r = list(partiler(musteriler, 2))
        assert r == [["m0@ornek.com", "m1@ornek.com"], ["m2@ornek.com", "m3@ornek.com"], ["m4@ornek.com"]], f"üreteçten 2'li partiler yanlış: {r}"
        assert list(partiler([], 3)) == [], "boş kaynakta hiç parti üretilmemeli (boş liste yield etme)"
        assert list(partiler(range(6), 3)) == [[0, 1, 2], [3, 4, 5]], "tam bölünürse sonda boş parti olmamalı"
        import types
        assert isinstance(partiler([1], 1), types.GeneratorType), "fonksiyon bir üreteç olmalı (yield kullan)"
    '''),
    hints=['Dilimleme yerine <code>itertools.islice</code> kullanmalısın; ama her seferinde AYNI yineleyiciden çekmelisin.',
           '<code>iter(kaynak)</code> döngüden ÖNCE bir kez çağrılmalı; yoksa her turda baştan başlarsın (liste verilirse).',
           '<code>parti = list(islice(it, n))</code>; <code>if not parti: return</code>; <code>yield parti</code>.'],
    why='<code>iter()</code> ile alınan tek yineleyici kaldığı yeri hatırlar; <code>islice</code> her çağrıda sıradaki n elemanı tüketir. Bu sayede kaynak liste, dosya ya da sonsuz üreteç olsa da çalışır ve bellekte en fazla bir parti tutulur. Python 3.12\'de aynı iş için hazır <code>itertools.batched(kaynak, n)</code> vardır (demet üretir); eski sürümlerle uyumlu kod gerektiğinde bu kalıbı bilmek gerekir.',
    tags=['islice', 'batching', 'iterator'], min=7))

T.append(dict(
    id='b-219', topic='Üreteçler', diff=2, kind='yaz',
    title='Kategori ağacını yol olarak dolaş',
    q='<p>Anadolu Market\'in kategori ağacı iç içe sözlüklerle tutuluyor: <code>{"ad": "Elektronik", "alt": [{"ad": "Telefon", "alt": []}, ...]}</code>. <code>yollar(dugum, onek="")</code> <b>özyinelemeli üreteç</b> fonksiyonunu yaz: her düğüm için kökten itibaren tam yolu <code>"Elektronik &gt; Telefon"</code> biçiminde (ayırıcı <code>" &gt; "</code>) önce ebeveyn, sonra çocuklar sırasıyla <code>yield</code> etsin. Alt düğümler için <code>yield from</code> kullan.</p>',
    start=C(r'''
        def yollar(dugum, onek=""):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def yollar(dugum, onek=""):
            yol = f"{onek} > {dugum['ad']}" if onek else dugum["ad"]
            yield yol
            for cocuk in dugum["alt"]:
                yield from yollar(cocuk, yol)
    '''),
    tests=C(r'''
        agac = {"ad": "Elektronik", "alt": [
            {"ad": "Telefon", "alt": [{"ad": "Kılıf", "alt": []}]},
            {"ad": "Bilgisayar", "alt": []},
        ]}
        r = list(yollar(agac))
        assert r == ["Elektronik", "Elektronik > Telefon", "Elektronik > Telefon > Kılıf", "Elektronik > Bilgisayar"], f"yollar ön-sıra (önce ebeveyn) olmalı, gelen: {r}"
        assert list(yollar({"ad": "Kırtasiye", "alt": []})) == ["Kırtasiye"], "tek düğüm yalnızca kendi adını vermeli"
        import types
        assert isinstance(yollar(agac), types.GeneratorType), "üreteç fonksiyonu olmalı"
    '''),
    hints=['Önce bu düğümün yolunu hesapla: önek boşsa yalnızca ad, değilse <code>onek + " &gt; " + ad</code>.',
           'Kendi yolunu <code>yield</code> et, sonra her çocuk için <code>yield from yollar(cocuk, yol)</code>.'],
    why='<code>yield from</code> alt üretecin tüm değerlerini çağırana aktarır; özyinelemeli yapılar (kategori ağacı, klasör yapısı, organizasyon şeması) bu sayede liste biriktirmeden dolaşılır. Alternatif: <code>sonuc</code> listesi parametresiyle özyineleme ya da açık bir yığın (stack) ile döngü; yığın çözümü çok derin ağaçlarda özyineleme sınırına takılmaz.',
    tags=['yield from', 'özyineleme', 'ağaç'], min=6))

T.append(dict(
    id='b-220', topic='Üreteçler', diff=3, kind='yaz',
    title='Tıklama akışını oturumlara böl',
    q='<p>Web analitiğinde bir kullanıcının ardışık tıklamaları, aradaki boşluk <code>zaman_asimi</code> dakikadan <b>büyükse</b> yeni oturum (session) sayılır. <code>oturumlar(zamanlar, zaman_asimi)</code> üreteç fonksiyonunu yaz: sıralı dakika değerlerinden (int) oluşan bir yinelenebiliri <b>tek geçişte</b> okuyup her oturumu liste olarak <code>yield</code> etsin. Girdi bir üreteç de olabilir.</p>',
    start=C(r'''
        def oturumlar(zamanlar, zaman_asimi):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        def oturumlar(zamanlar, zaman_asimi):
            mevcut = []
            for z in zamanlar:
                if mevcut and z - mevcut[-1] > zaman_asimi:
                    yield mevcut
                    mevcut = []
                mevcut.append(z)
            if mevcut:
                yield mevcut
    '''),
    tests=C(r'''
        r = list(oturumlar(iter([0, 5, 12, 60, 61, 120]), 30))
        assert r == [[0, 5, 12], [60, 61], [120]], f"30 dk zaman aşımıyla 3 oturum bekleniyordu, gelen: {r}"
        assert list(oturumlar([10, 40], 30)) == [[10, 40]], "boşluk tam 30 ise (büyük değil) aynı oturum"
        assert list(oturumlar([], 30)) == [], "tıklama yoksa oturum da yok"
        import types
        assert isinstance(oturumlar([1], 5), types.GeneratorType), "üreteç olmalı"
    '''),
    hints=['Açık oturumu bir listede biriktir; her yeni zamanı listenin SON elemanıyla karşılaştır.',
           'Boşluk eşikten büyükse eldeki listeyi yield et ve yeni liste başlat.',
           'Döngü bitince elde kalan oturumu unutma.'],
    why='Tek geçişli algoritma, girdiyi baştan sona bir kez okur ve yalnızca açık oturumu bellekte tutar; milyonlarca olaylık akışlarda bile çalışır. En sık hata, döngü sonrası kalan son oturumu <code>yield</code> etmeyi unutmaktır. Alternatif: <code>itertools.pairwise</code> ile kırılma noktalarını bulup dilimlemek; ama bu liste gerektirir ve akış (stream) verisinde kullanılamaz.',
    tags=['yield', 'tek geçiş', 'oturum'], min=8))

write('/home/claude/py/v2/b2/bank_orta_01.js', T, 'Comprehension, Üreteçler (b-211…b-220)')
