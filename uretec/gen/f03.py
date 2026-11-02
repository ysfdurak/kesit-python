from lib import C, write

T = []

# ---------------- Dekoratörler ----------------
T.append(dict(
    id='b-231', topic='Dekoratörler', diff=2, t='predict',
    title='Üst üste dekoratör sırası',
    q='<p>Raporlama modülünde iki biçimlendirme dekoratörü üst üste uygulanmış. Bu kod ne yazdırır?</p>',
    code=C(r'''
        def koseli(f):
            def w():
                return "[" + f() + "]"
            return w

        def yildiz(f):
            def w():
                return "*" + f() + "*"
            return w

        @koseli
        @yildiz
        def ad():
            return "Ali"

        print(ad())
    '''),
    o=['*[Ali]*', '[*Ali*]', '[Ali]', '*Ali*'],
    a=1,
    hints=['<code>@koseli @yildiz def ad</code> ifadesi <code>ad = koseli(yildiz(ad))</code> demektir.', 'Fonksiyona en yakın dekoratör ilk sarar.'],
    why='Dekoratörler aşağıdan yukarıya uygulanır: önce <code>yildiz</code> asıl fonksiyonu sarar, sonra <code>koseli</code> bu sarılmış fonksiyonu sarar. Çağrıda en dıştaki (koseli) çalışır, içteki sonucu köşeli paranteze alır: <code>[*Ali*]</code>. Pratikte bu sıra önemlidir: örneğin önce yetki kontrolü sonra önbellek mi, yoksa tersi mi, sonucu değiştirir.',
    tags=['decorator', 'sıra'], min=2))

T.append(dict(
    id='b-232', topic='Dekoratörler', diff=1, t='order',
    title='Çağrıları kaydeden dekoratör',
    q='<p>Her çağrıda fonksiyon adını yazdıran bir dekoratör tanımlayıp KDV fonksiyonuna uygulayan programı sırala. Çıktı <code>çağrı: kdv</code> ve ardından <code>120.0</code> olmalı.</p>',
    lines=['def logla(fn):',
           '    def sarici(*args, **kwargs):',
           '        print("çağrı:", fn.__name__)',
           '        return fn(*args, **kwargs)',
           '    return sarici',
           '@logla',
           'def kdv(x):',
           '    return round(x * 1.2, 2)',
           'print(kdv(100))'],
    expect='çağrı: kdv\n120.0\n',
    hint='Sarıcı önce kaydı basar, sonra asıl fonksiyonun sonucunu döndürür; return\'den sonraki satır hiç çalışmaz.',
    hints=['Sarıcı önce kaydı basar, sonra asıl fonksiyonun sonucunu döndürür; return\'den sonraki satır hiç çalışmaz.'],
    why='Dekoratör bir fonksiyon alıp yerine sarıcıyı (wrapper) döndürür; <code>@logla</code> satırı hemen altındaki <code>def</code>\'e uygulanır. Sarıcının <code>*args, **kwargs</code> alması her imzalı fonksiyonla çalışmasını sağlar. Gerçek projede <code>print</code> yerine <code>logging</code> ve adı korumak için <code>functools.wraps</code> kullanılır.',
    tags=['decorator', 'wrapper'], min=3))

T.append(dict(
    id='b-233', topic='Dekoratörler', diff=2, kind='rehberli',
    title='Rol kontrolü yapan dekoratör',
    q='<p>Ilgaz Bank\'ın iç panelinde bazı işlemler yalnızca belirli rollere açık. <code>yetki_gerekli(rol)</code> <b>parametreli</b> dekoratörünü yaz. Sarılan fonksiyonların ilk argümanı her zaman kullanıcı sözlüğüdür: <code>{"ad": "Ece", "roller": ["gise", "onay"]}</code>. Rol kullanıcıda yoksa <code>PermissionError</code> fırlat (mesajda rol adı geçsin), varsa fonksiyonu çağırıp sonucunu döndür. <code>functools.wraps</code> ile fonksiyon adını koru.</p>',
    guide=['En dış fonksiyon <code>yetki_gerekli(rol)</code> parametreyi alır ve bir dekoratör döndürür.',
           'Ortadaki <code>dekorator(fn)</code> sarıcıyı döndürür; sarıcının üstüne <code>@functools.wraps(fn)</code> koy.',
           'Sarıcı <code>(kullanici, *args, **kwargs)</code> alsın; <code>rol not in kullanici["roller"]</code> ise <code>PermissionError</code>.',
           'Aksi halde <code>return fn(kullanici, *args, **kwargs)</code>.'],
    example=C(r'''
        import functools
        # Parametreli dekoratör iskeleti: ön ek ekleyen dekoratör
        def onek(metin):
            def dekorator(fn):
                @functools.wraps(fn)
                def sarici(*args, **kwargs):
                    return metin + str(fn(*args, **kwargs))
                return sarici
            return dekorator

        @onek("TL ")
        def fiyat():
            return 99
        print(fiyat(), fiyat.__name__)   # TL 99 fiyat
    '''),
    start=C(r'''
        import functools

        def yetki_gerekli(rol):
            # TODO 1: fn alan bir dekorator fonksiyonu tanımla
            # TODO 2: içinde @functools.wraps(fn) ile sarıcı yaz
            # TODO 3: rol yoksa PermissionError, varsa fn sonucunu döndür
            def dekorator(fn):
                return fn
            return dekorator
    '''),
    sol=C(r'''
        import functools

        def yetki_gerekli(rol):
            def dekorator(fn):
                @functools.wraps(fn)
                def sarici(kullanici, *args, **kwargs):
                    if rol not in kullanici.get("roller", []):
                        raise PermissionError(f"{kullanici.get('ad')} için '{rol}' yetkisi yok")
                    return fn(kullanici, *args, **kwargs)
                return sarici
            return dekorator
    '''),
    tests=C(r'''
        @yetki_gerekli("onay")
        def kredi_onayla(kullanici, basvuru_no):
            """Kredi başvurusunu onaylar."""
            return f"{basvuru_no} onaylandı"

        ece = {"ad": "Ece", "roller": ["gise", "onay"]}
        can = {"ad": "Can", "roller": ["gise"]}
        assert kredi_onayla(ece, "K-17") == "K-17 onaylandı", "yetkili kullanıcıda fonksiyon sonucu dönmeli"
        try:
            kredi_onayla(can, "K-18")
            assert False, "rolü olmayan kullanıcıda PermissionError fırlatılmalı"
        except PermissionError as e:
            assert "onay" in str(e), "hata mesajında eksik rolün adı geçmeli ki log okunabilsin"
        assert kredi_onayla.__name__ == "kredi_onayla", "functools.wraps ile fonksiyon adı korunmalı"
        assert kredi_onayla.__doc__ == "Kredi başvurusunu onaylar.", "wraps docstring'i de korur"
    '''),
    hints=['Üç katman: parametre → dekoratör → sarıcı. Her katman bir alttakini döndürür.',
           'Sarıcının imzası: <code>def sarici(kullanici, *args, **kwargs)</code>.',
           '<code>if rol not in kullanici["roller"]: raise PermissionError(f"... {rol} ...")</code>'],
    why='Parametreli dekoratör, dekoratör döndüren bir fabrikadır: <code>@yetki_gerekli("onay")</code> önce çağrılır, dönen dekoratör fonksiyona uygulanır. Yetki kontrolünü dekoratöre almak her işlevde aynı <code>if</code>\'i tekrar yazmayı önler ve kontrolün unutulmasını zorlaştırır (Flask/Django\'daki <code>@login_required</code> aynı fikirdir). Alternatif: kontrolü ayrı bir <code>kontrol_et(kullanici, rol)</code> fonksiyonunda tutup her işlevin başında açıkça çağırmak; daha görünür ama tekrar eder.',
    tags=['decorator', 'parametreli', 'yetki'], min=8))

T.append(dict(
    id='b-234', topic='Dekoratörler', diff=2, kind='yaz',
    title='Temizlenebilir önbellek dekoratörü',
    q='<p>Kur servisine yapılan çağrılar pahalı; aynı argümanlarla tekrar çağrılınca sonuç önbellekten gelsin. <code>onbellek(fn)</code> dekoratörünü yaz: konumsal argümanların demetini anahtar yapan bir sözlükte sonuçları tutsun. Ayrıca sarılmış fonksiyona <code>temizle()</code> adlı bir öznitelik-fonksiyon ekle; çağrılınca önbellek boşalsın.</p>',
    start=C(r'''
        def onbellek(fn):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        import functools

        def onbellek(fn):
            depo = {}

            @functools.wraps(fn)
            def sarici(*args):
                if args not in depo:
                    depo[args] = fn(*args)
                return depo[args]

            sarici.temizle = depo.clear
            return sarici
    '''),
    tests=C(r'''
        cagri = []

        @onbellek
        def kur_getir(doviz, tarih):
            cagri.append((doviz, tarih))
            return {"USD": 32.5, "EUR": 35.0}[doviz]

        assert kur_getir("USD", "2026-03-01") == 32.5, "ilk çağrı gerçek değeri döndürmeli"
        assert kur_getir("USD", "2026-03-01") == 32.5, "ikinci çağrı da aynı değeri döndürmeli"
        assert len(cagri) == 1, f"aynı argümanlarla ikinci çağrı önbellekten gelmeli; asıl fonksiyon 1 kez çalışmalıydı, {len(cagri)} kez çalıştı"
        kur_getir("EUR", "2026-03-01")
        assert len(cagri) == 2, "farklı argüman yeni hesaplama gerektirir"
        kur_getir.temizle()
        kur_getir("USD", "2026-03-01")
        assert len(cagri) == 3, "temizle() sonrası önbellek boş olmalı, fonksiyon yeniden çalışmalı"
        assert kur_getir.__name__ == "kur_getir", "functools.wraps kullan"
    '''),
    hints=['Önbellek sözlüğü dekoratörün içinde, sarıcının dışında tanımlanmalı (her fonksiyona bir tane).',
           '<code>args</code> zaten bir demettir; sözlük anahtarı olabilir.',
           'Fonksiyonlar nesnedir: <code>sarici.temizle = depo.clear</code>.'],
    why='Sözlük kapanış içinde yaşar ve her dekore edilen fonksiyon için ayrıdır. <code>args</code> demeti hashlenebilir olduğu sürece anahtar olur; liste gibi değişebilir argümanlar <code>TypeError</code> verir. Gerçek projede hazır <code>functools.lru_cache</code>/<code>functools.cache</code> kullan: <code>cache_clear()</code> ve <code>cache_info()</code> zaten gelir. Kendi yazdığın önbellek ise süre aşımı (TTL) gibi özel kurallar eklemek istediğinde gerekir.',
    tags=['decorator', 'memoization', 'cache'], min=7))

T.append(dict(
    id='b-235', topic='Dekoratörler', diff=1, kind='bug',
    title='Adını kaybeden fonksiyonlar',
    q='<p>Hatayı bul ve düzelt. Ekip, raporlama fonksiyonlarını <code>@sure_olc</code> ile sardıktan sonra log\'larda tüm fonksiyonların adı <code>sarici</code> görünmeye başladı ve otomatik dokümantasyon boş çıktı. Dekoratör, sarılan fonksiyonun adını ve docstring\'ini korumalı.</p>',
    start=C(r'''
        import time

        def sure_olc(fn):
            def sarici(*args, **kwargs):
                bas = time.perf_counter()
                sonuc = fn(*args, **kwargs)
                sarici.son_sure = time.perf_counter() - bas
                return sonuc
            return sarici
    '''),
    sol=C(r'''
        import time
        import functools

        def sure_olc(fn):
            @functools.wraps(fn)
            def sarici(*args, **kwargs):
                bas = time.perf_counter()
                sonuc = fn(*args, **kwargs)
                sarici.son_sure = time.perf_counter() - bas
                return sonuc
            return sarici
    '''),
    tests=C(r'''
        @sure_olc
        def aylik_rapor(ay):
            """Aylık satış raporunu üretir."""
            return f"{ay} raporu"

        assert aylik_rapor("Mart") == "Mart raporu", "fonksiyon sonucu değişmemeli"
        assert aylik_rapor.__name__ == "aylik_rapor", f"fonksiyon adı 'aylik_rapor' olmalı, şu an {aylik_rapor.__name__!r}: functools.wraps eksik"
        assert aylik_rapor.__doc__ == "Aylık satış raporunu üretir.", "docstring korunmalı"
        assert aylik_rapor.son_sure >= 0, "süre ölçümü çalışmaya devam etmeli"
    '''),
    hints=['Sarıcı yeni bir fonksiyondur; adı ve docstring\'i kendisine aittir.', '<code>functools</code> modülünde bu iş için hazır bir dekoratör var.'],
    why='<code>@functools.wraps(fn)</code> sarıcıya asıl fonksiyonun <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__qualname__</code> bilgilerini kopyalar ve <code>__wrapped__</code> ile asıl fonksiyona erişim sağlar. Log\'lar, hata ayıklayıcılar, test araçları ve dokümantasyon üreticileri bu bilgilere dayanır. Elle <code>sarici.__name__ = fn.__name__</code> yazmak da çalışır ama eksik kalır; her dekoratörde wraps alışkanlık olmalı.',
    tags=['decorator', 'functools.wraps'], min=3))

T.append(dict(
    id='b-236', topic='Dekoratörler', diff=2, kind='tamamla',
    title='Komut kayıt defteri',
    q='<p>Bir chatbot, komutları <code>@komut("bakiye")</code> ile kaydedilen fonksiyonlara yönlendiriyor. <code>komut(ad)</code> dekoratörü fonksiyonu <code>KOMUTLAR</code> sözlüğüne kaydetmeli ve fonksiyonu <b>değiştirmeden</b> geri vermeli (doğrudan çağrılabilmeye devam etmeli). Boşluğu tamamla.</p>',
    start=C(r'''
        KOMUTLAR = {}

        def komut(ad):
            def kaydet(fn):
                KOMUTLAR[ad] = fn
                return ___
            return kaydet

        def calistir(metin):
            ad, *argumanlar = metin.split()
            if ad not in KOMUTLAR:
                return "bilinmeyen komut"
            return KOMUTLAR[ad](*argumanlar)
    '''),
    sol=C(r'''
        KOMUTLAR = {}

        def komut(ad):
            def kaydet(fn):
                KOMUTLAR[ad] = fn
                return fn
            return kaydet

        def calistir(metin):
            ad, *argumanlar = metin.split()
            if ad not in KOMUTLAR:
                return "bilinmeyen komut"
            return KOMUTLAR[ad](*argumanlar)
    '''),
    tests=C(r'''
        @komut("bakiye")
        def bakiye(hesap):
            return f"{hesap}: 1500 TL"

        @komut("selam")
        def selam():
            return "Merhaba!"

        assert calistir("bakiye TR12") == "TR12: 1500 TL", "kayıtlı komut argümanla çağrılmalı"
        assert calistir("selam") == "Merhaba!", "argümansız komut çalışmalı"
        assert calistir("uç") == "bilinmeyen komut", "kayıtsız komut"
        assert bakiye("TR1") == "TR1: 1500 TL", "dekoratör fonksiyonu geri vermeli; aksi halde bakiye adı None olur"
    '''),
    hints=['<code>@kaydet</code> uygulandıktan sonra <code>bakiye</code> adı, <code>kaydet</code>\'in döndürdüğü şeye bağlanır.', 'Sarmaya gerek yok; asıl fonksiyonun kendisini döndür.'],
    why='Her dekoratörün sarıcı üretmesi gerekmez; kayıt (registry) dekoratörleri fonksiyonu bir yere kaydeder ve olduğu gibi döndürür. Döndürmezse <code>bakiye</code> adı <code>None</code> olur. Bu kalıp Flask\'ın <code>@app.route</code>, pytest\'in eklentileri ve CLI araçlarındaki komut tanımlarında kullanılır. Alternatif: kaydı açıkça <code>KOMUTLAR["bakiye"] = bakiye</code> diye yazmak; dekoratör, kaydı tanımın hemen yanında tutarak unutulmasını önler.',
    tags=['decorator', 'registry', 'dispatch'], min=4))

# ---------------- OOP ----------------
T.append(dict(
    id='b-237', topic='OOP', diff=2, t='predict',
    title='Sınıf özniteliği mi, örnek özniteliği mi?',
    q='<p>Ürün sınıfında KDV oranı sınıf özniteliği olarak tanımlanmış. Bu kod ne yazdırır?</p>',
    code=C(r'''
        class Urun:
            kdv = 0.20
            def __init__(self, fiyat):
                self.fiyat = fiyat

        a = Urun(100)
        b = Urun(50)
        a.kdv = 0.10
        Urun.kdv = 0.01
        print(a.kdv, b.kdv)
    '''),
    o=['0.1 0.2', '0.01 0.01', '0.1 0.01', '0.1 0.1'],
    a=2,
    hints=['<code>a.kdv = 0.10</code> sınıfı mı değiştirir, yoksa yalnızca <code>a</code>\'ya yeni bir öznitelik mi ekler?', 'Öznitelik araması önce örnekte, sonra sınıfta yapılır.'],
    why='<code>a.kdv = 0.10</code> sınıfı değiştirmez; <code>a</code> nesnesine kendi <code>kdv</code> özniteliğini ekler ve sınıftakini gölgeler. <code>Urun.kdv = 0.01</code> sınıf özniteliğini değiştirir; kendi özniteliği olmayan <code>b</code> bunu görür. Arama sırası: örneğin <code>__dict__</code>\'i, sonra sınıf. Ortak sabitleri sınıfta tutmak normaldir, ama örnek üzerinden atama yapmak bu kafa karışıklığını doğurur.',
    tags=['class attribute', 'gölgeleme'], min=2))

T.append(dict(
    id='b-238', topic='OOP', diff=2, kind='rehberli',
    title='Sepeti Python\'a tanıt',
    q='<p><code>Sepet</code> sınıfı ürünleri <code>{"urun_adi": adet}</code> sözlüğünde tutuyor. Sınıfa şu özel metotları ekle ki Python\'un yerleşik araçlarıyla doğal kullanılsın: <code>len(sepet)</code> toplam <b>adet</b>i, <code>"kalem" in sepet</code> ürünün olup olmadığını, <code>for ad in sepet</code> ürün adlarını alfabetik sırada verir, <code>bool(sepet)</code> boşsa <code>False</code> olur.</p>',
    guide=['<code>__len__</code>: <code>self.kalemler</code> değerlerinin toplamını döndür.',
           '<code>__contains__(self, ad)</code>: ad sözlükte mi? <code>True/False</code>.',
           '<code>__iter__</code>: <code>iter(sorted(self.kalemler))</code> döndür.',
           '<code>bool()</code> için ayrı metot gerekmez: <code>__bool__</code> yoksa Python <code>__len__</code>\'e bakar.'],
    example=C(r'''
        class Raf:
            def __init__(self, kitaplar):
                self.kitaplar = list(kitaplar)
            def __len__(self):
                return len(self.kitaplar)
            def __contains__(self, ad):
                return ad in self.kitaplar
            def __iter__(self):
                return iter(self.kitaplar)

        r = Raf(["Nutuk", "Suç ve Ceza"])
        print(len(r), "Nutuk" in r, list(r))
    '''),
    start=C(r'''
        class Sepet:
            def __init__(self):
                self.kalemler = {}

            def ekle(self, ad, adet=1):
                self.kalemler[ad] = self.kalemler.get(ad, 0) + adet

            # TODO 1: __len__ toplam adet
            # TODO 2: __contains__ ürün var mı
            # TODO 3: __iter__ alfabetik ürün adları
    '''),
    sol=C(r'''
        class Sepet:
            def __init__(self):
                self.kalemler = {}

            def ekle(self, ad, adet=1):
                self.kalemler[ad] = self.kalemler.get(ad, 0) + adet

            def __len__(self):
                return sum(self.kalemler.values())

            def __contains__(self, ad):
                return ad in self.kalemler

            def __iter__(self):
                return iter(sorted(self.kalemler))
    '''),
    tests=C(r'''
        s = Sepet()
        assert not s, "boş sepet bool bağlamında False olmalı (__len__ 0 döndürünce)"
        s.ekle("kalem", 3)
        s.ekle("defter")
        s.ekle("kalem", 2)
        assert len(s) == 6, f"len(sepet) toplam adet olmalı: 5 kalem + 1 defter = 6, gelen {len(s) if hasattr(s, '__len__') else 'yok'}"
        assert "kalem" in s and "silgi" not in s, "__contains__ doğru çalışmalı"
        assert list(s) == ["defter", "kalem"], "for döngüsü ürün adlarını alfabetik vermeli"
        assert s, "dolu sepet True olmalı"
    '''),
    hints=['Bu metotları (dunder) Python çağırır; sen yalnızca tanımlarsın.',
           '<code>__iter__</code> bir yineleyici (iterator) döndürmeli; <code>iter(...)</code> bunu üretir.',
           '<code>def __len__(self): return sum(self.kalemler.values())</code>'],
    why='Özel metotlar sınıfını Python\'un veri modeline (data model) bağlar: <code>len</code>, <code>in</code>, <code>for</code>, <code>bool</code> artık doğal çalışır ve ekibin ayrı metot adları (<code>urun_sayisi()</code>, <code>var_mi()</code>) ezberlemesi gerekmez. <code>__contains__</code> olmasa bile <code>in</code>, <code>__iter__</code> üzerinden çalışırdı ama sözlük aramasından yavaş olurdu. Alternatif: <code>collections.abc.Collection</code>\'dan türeyip bu üç metodu zorunlu kılmak.',
    tags=['dunder', '__len__', '__iter__', '__contains__'], min=7))

T.append(dict(
    id='b-239', topic='OOP', diff=2, kind='rehberli',
    title='Alternatif kurucu ve doğrulayıcı',
    q='<p>İK sistemi personeli <code>"Ece Kaya;IK;42000"</code> biçimli satırlardan okuyor. <code>Calisan</code> sınıfına iki şey ekle: (1) <code>@classmethod</code> <code>satirdan(cls, satir)</code>: satırı ayrıştırıp yeni nesne döndürsün (maaş int). (2) <code>@staticmethod</code> <code>gecerli_mi(satir)</code>: satır tam 3 parçalıysa ve maaş kısmı rakamlardan oluşuyorsa <code>True</code> döndürsün.</p>',
    guide=['<code>@classmethod</code> ilk parametre olarak sınıfı (<code>cls</code>) alır; yeni nesneyi <code>cls(...)</code> ile oluştur.',
           'Satırı <code>split(";")</code> ile üç parçaya ayır, maaşı <code>int</code>\'e çevir.',
           '<code>@staticmethod</code> ne <code>self</code> ne <code>cls</code> alır; sıradan bir fonksiyon gibi yaz.',
           'Doğrulayıcıda parça sayısını ve <code>isdigit()</code>\'i kontrol et.'],
    example=C(r'''
        class Tarih:
            def __init__(self, gun, ay, yil):
                self.gun, self.ay, self.yil = gun, ay, yil
            @classmethod
            def metinden(cls, metin):
                g, a, y = map(int, metin.split("."))
                return cls(g, a, y)
            @staticmethod
            def artik_mi(yil):
                return yil % 4 == 0 and (yil % 100 != 0 or yil % 400 == 0)

        t = Tarih.metinden("29.10.2026")
        print(t.yil, Tarih.artik_mi(2024))
    '''),
    start=C(r'''
        class Calisan:
            def __init__(self, ad, birim, maas):
                self.ad = ad
                self.birim = birim
                self.maas = maas

            # TODO 1: @classmethod satirdan(cls, satir)
            # TODO 2: @staticmethod gecerli_mi(satir)
    '''),
    sol=C(r'''
        class Calisan:
            def __init__(self, ad, birim, maas):
                self.ad = ad
                self.birim = birim
                self.maas = maas

            @classmethod
            def satirdan(cls, satir):
                ad, birim, maas = satir.split(";")
                return cls(ad.strip(), birim.strip(), int(maas))

            @staticmethod
            def gecerli_mi(satir):
                parcalar = satir.split(";")
                return len(parcalar) == 3 and parcalar[2].strip().isdigit()
    '''),
    tests=C(r'''
        c = Calisan.satirdan("Ece Kaya;IK;42000")
        assert isinstance(c, Calisan), "satirdan bir Calisan nesnesi döndürmeli"
        assert (c.ad, c.birim, c.maas) == ("Ece Kaya", "IK", 42000), "alanlar doğru ayrışmalı, maaş int olmalı"
        class Stajyer(Calisan):
            pass
        assert type(Stajyer.satirdan("Can;IT;15000")) is Stajyer, "cls kullanırsan alt sınıftan çağrınca alt sınıf nesnesi döner (Calisan(...) yazma)"
        assert Calisan.gecerli_mi("Ali;Satış;30000") is True, "geçerli satır True"
        assert Calisan.gecerli_mi("Ali;Satış") is False, "eksik alan False"
        assert Calisan.gecerli_mi("Ali;Satış;otuz bin") is False, "maaş sayı değilse False"
    '''),
    hints=['Dekoratörleri metodun hemen üstüne yaz: <code>@classmethod</code>, <code>@staticmethod</code>.',
           'classmethod içinde <code>Calisan(...)</code> değil <code>cls(...)</code> yaz ki alt sınıflarda da çalışsın.',
           '<code>return len(p) == 3 and p[2].strip().isdigit()</code>'],
    why='<code>classmethod</code> alternatif kurucular (alternative constructor) için standart yoldur: <code>dict.fromkeys</code>, <code>datetime.fromisoformat</code> böyledir. <code>cls</code> kullanmak kalıtımı korur. <code>staticmethod</code> sınıfla ilgili ama nesne durumuna ihtiyaç duymayan yardımcıları sınıfın ad alanında toplar; modül düzeyinde bir fonksiyon da aynı işi görür, seçim okunabilirlik meselesidir.',
    tags=['classmethod', 'staticmethod', 'alternatif kurucu'], min=7))

T.append(dict(
    id='b-240', topic='OOP', diff=2, kind='yaz',
    title='Müşteri kayıtlarını tekilleştir',
    q='<p>İki farklı kanaldan (web ve mağaza) gelen müşteri listelerinde aynı kişi farklı yazımla geçebiliyor. <code>Musteri(no, ad)</code> sınıfını yaz: iki müşteri <b>yalnızca <code>no</code></b> aynıysa eşit sayılsın ve kümede (<code>set</code>) tekilleşebilsin. <code>repr</code> <code>Musteri(1001, \'Ayşe Yılmaz\')</code> biçiminde olsun. <code>Musteri</code> olmayan bir nesneyle karşılaştırıldığında <code>NotImplemented</code> döndür.</p>',
    start=C(r'''
        class Musteri:
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        class Musteri:
            def __init__(self, no, ad):
                self.no = no
                self.ad = ad

            def __eq__(self, other):
                if not isinstance(other, Musteri):
                    return NotImplemented
                return self.no == other.no

            def __hash__(self):
                return hash(self.no)

            def __repr__(self):
                return f"Musteri({self.no}, {self.ad!r})"
    '''),
    tests=C(r'''
        web = [Musteri(1001, "Ayşe Yılmaz"), Musteri(1002, "Can Demir")]
        magaza = [Musteri(1001, "AYŞE YILMAZ"), Musteri(1003, "Ece Kaya")]
        tekil = set(web) | set(magaza)
        assert len(tekil) == 3, f"1001 iki kanalda da var; tekil müşteri sayısı 3 olmalı, gelen {len(tekil)}. __eq__ ve __hash__ birlikte tanımlanmalı"
        assert Musteri(5, "A") == Musteri(5, "B"), "aynı no eşit"
        assert Musteri(5, "A") != Musteri(6, "A"), "farklı no eşit değil"
        assert (Musteri(5, "A") == 5) is False, "başka türle karşılaştırma False olmalı (NotImplemented döndür)"
        assert repr(Musteri(1001, "Ayşe Yılmaz")) == "Musteri(1001, 'Ayşe Yılmaz')", "repr biçimi yanlış"
    '''),
    hints=['Yalnızca <code>__eq__</code> tanımlarsan Python <code>__hash__</code>\'i <code>None</code> yapar ve nesne kümeye girmez.',
           '<code>__hash__</code> eşitlikte kullanılan alanların hash\'ini döndürmeli: <code>hash(self.no)</code>.',
           'repr için <code>{self.ad!r}</code> tırnaklı gösterim verir.'],
    why='Eşit iki nesnenin hash\'i de eşit olmalıdır; bu yüzden <code>__hash__</code> yalnızca <code>__eq__</code>\'de kullanılan alana (no) dayanır. <code>NotImplemented</code> döndürmek Python\'a "karşı tarafa sor" der; sonunda eşitlik <code>False</code> olur, hata çıkmaz. Alternatif: <code>@dataclass(frozen=True)</code> ve <code>ad</code> alanına <code>field(compare=False)</code> vererek aynı davranışı kısa yoldan elde etmek.',
    tags=['__eq__', '__hash__', 'set', '__repr__'], min=6))

write('/home/claude/py/v2/b2/bank_orta_03.js', T, 'Dekoratörler, OOP (b-231…b-240)')
