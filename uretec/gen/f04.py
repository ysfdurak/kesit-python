from lib import C, write

T = []

T.append(dict(
    id='b-241', topic='OOP', diff=3, kind='yaz',
    title='Sipariş durum makinesi',
    q='<p>Anadolu Market siparişleri belirli bir akışla ilerler: <code>yeni → hazirlaniyor → kargoda → teslim</code>. Ayrıca <code>yeni</code> ya da <code>hazirlaniyor</code> durumundaki sipariş <code>iptal</code> edilebilir. <code>Siparis</code> sınıfını yaz:</p><ul><li><code>Siparis(no)</code> durumu <code>"yeni"</code> başlar; <code>gecmis</code> listesi <code>["yeni"]</code> olur.</li><li><code>gecis(yeni_durum)</code>: izinli değilse <code>ValueError</code> fırlatır (mesajda iki durum da geçsin), izinliyse durumu günceller ve geçmişe ekler.</li><li><code>bitti_mi</code> bir <b>property</b> olsun: durum <code>teslim</code> ya da <code>iptal</code> ise <code>True</code>.</li></ul>',
    start=C(r'''
        class Siparis:
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        class Siparis:
            GECISLER = {
                "yeni": {"hazirlaniyor", "iptal"},
                "hazirlaniyor": {"kargoda", "iptal"},
                "kargoda": {"teslim"},
                "teslim": set(),
                "iptal": set(),
            }

            def __init__(self, no):
                self.no = no
                self.durum = "yeni"
                self.gecmis = ["yeni"]

            def gecis(self, yeni_durum):
                if yeni_durum not in self.GECISLER.get(self.durum, set()):
                    raise ValueError(f"{self.durum} -> {yeni_durum} geçişi yapılamaz")
                self.durum = yeni_durum
                self.gecmis.append(yeni_durum)

            @property
            def bitti_mi(self):
                return self.durum in ("teslim", "iptal")
    '''),
    tests=C(r'''
        s = Siparis(501)
        assert s.durum == "yeni" and s.gecmis == ["yeni"], "başlangıç durumu yeni"
        s.gecis("hazirlaniyor"); s.gecis("kargoda")
        assert s.bitti_mi is False, "kargodaki sipariş bitmemiştir (bitti_mi property, parantezsiz)"
        try:
            s.gecis("iptal")
            assert False, "kargodaki sipariş iptal edilememeli: ValueError bekleniyordu"
        except ValueError as e:
            assert "kargoda" in str(e) and "iptal" in str(e), "hata mesajı mevcut ve istenen durumu içermeli"
        assert s.durum == "kargoda", "reddedilen geçiş durumu değiştirmemeli"
        s.gecis("teslim")
        assert s.bitti_mi and s.gecmis == ["yeni", "hazirlaniyor", "kargoda", "teslim"], "teslim sonrası geçmiş tam olmalı"
        t = Siparis(502); t.gecis("iptal")
        assert t.bitti_mi, "iptal edilen sipariş bitmiştir"
        try:
            Siparis(503).gecis("teslim")
            assert False, "yeni siparişten doğrudan teslime geçilmemeli"
        except ValueError:
            pass
    '''),
    hints=['İzinli geçişleri bir sözlükte tut: durum → gidebileceği durumlar kümesi.',
           '<code>gecis</code> içinde önce kontrol et, hata yoksa güncelle; böylece reddedilen geçiş durumu bozmaz.',
           '<code>@property def bitti_mi(self): return self.durum in ("teslim", "iptal")</code>'],
    why='Geçiş kurallarını veri (sözlük) olarak tutmak, <code>if/elif</code> yığınına göre hem okunur hem genişletilebilir: yeni bir durum eklemek tek satırdır. Önce doğrulayıp sonra değiştirmek nesneyi tutarlı bırakır. <code>property</code> hesaplanan bir değeri öznitelik gibi sunar. Daha büyük sistemlerde durumlar <code>enum.Enum</code> ile tanımlanır, böylece yazım hataları (<code>"kargodaa"</code>) çalışma anında değil tanımda yakalanır.',
    tags=['class', 'state machine', 'property', 'ValueError'], min=10))

T.append(dict(
    id='b-242', topic='OOP', diff=1, kind='bug',
    title='Kendi metodunu bulamayan sınıf',
    q='<p>Hatayı bul ve düzelt. <code>Fatura.kdvli_toplam()</code> çağrıldığında <code>NameError: name \'ara_toplam\' is not defined</code> hatası alınıyor. Fatura ara toplamı kalemlerin <code>adet * fiyat</code> toplamıdır; KDV\'li toplam bunun <code>1 + kdv</code> katı (2 basamağa yuvarlanmış).</p>',
    start=C(r'''
        class Fatura:
            def __init__(self, kalemler, kdv=0.20):
                self.kalemler = kalemler
                self.kdv = kdv

            def ara_toplam(self):
                return sum(adet * fiyat for adet, fiyat in self.kalemler)

            def kdvli_toplam(self):
                return round(ara_toplam() * (1 + kdv), 2)
    '''),
    sol=C(r'''
        class Fatura:
            def __init__(self, kalemler, kdv=0.20):
                self.kalemler = kalemler
                self.kdv = kdv

            def ara_toplam(self):
                return sum(adet * fiyat for adet, fiyat in self.kalemler)

            def kdvli_toplam(self):
                return round(self.ara_toplam() * (1 + self.kdv), 2)
    '''),
    tests=C(r'''
        f = Fatura([(2, 50.0), (1, 99.9)])
        assert f.ara_toplam() == 199.9, "ara toplam 2*50 + 99.9 = 199.9"
        assert f.kdvli_toplam() == 239.88, "KDV'li toplam 199.9 * 1.2 = 239.88; metot ve öznitelikler self. ile çağrılmalı"
        assert Fatura([(1, 100)], kdv=0.10).kdvli_toplam() == 110.0, "farklı KDV oranı kullanılabilmeli (self.kdv)"
    '''),
    hints=['Metot içinde aynı nesnenin başka bir metoduna ya da özniteliğine nasıl ulaşılır?', 'İki yerde <code>self.</code> eksik.'],
    why='Python\'da metotlar ve öznitelikler örtük değildir (Java/C#\'taki <code>this</code> gibi otomatik değil); nesneye ait her şeye <code>self.</code> ile erişilir. <code>ara_toplam()</code> yazınca Python modül düzeyinde bir fonksiyon arar ve bulamaz. Bu açıklık kuralı, yerel değişken ile nesne durumunu kod okurken ayırt etmeyi kolaylaştırır.',
    tags=['self', 'metot', 'NameError'], min=2))

# ---------------- Kalıtım ve MRO ----------------
T.append(dict(
    id='b-243', topic='Kalıtım ve MRO', diff=3, t='predict',
    title='Elmas kalıtımda super() zinciri',
    q='<p>Çoklu kalıtımda <code>super()</code> "üst sınıf" değil, MRO\'daki <b>bir sonraki</b> sınıf demektir. Bu kod ne yazdırır?</p>',
    code=C(r'''
        class A:
            def selam(self):
                return "A"

        class B(A):
            def selam(self):
                return "B" + super().selam()

        class C(A):
            def selam(self):
                return "C" + super().selam()

        class D(B, C):
            def selam(self):
                return "D" + super().selam()

        print(D().selam())
        print([k.__name__ for k in D.__mro__])
    '''),
    o=["DBA\n['D', 'B', 'A', 'C', 'object']",
       "DBCA\n['D', 'B', 'C', 'A', 'object']",
       "DBACA\n['D', 'B', 'A', 'C', 'A', 'object']",
       "DCBA\n['D', 'C', 'B', 'A', 'object']"],
    a=1,
    hints=['MRO (Method Resolution Order) C3 doğrusallaştırmasıyla hesaplanır; ortak ata (A) tüm alt sınıflarından sonra gelir.', '<code>B</code> içindeki <code>super()</code>, D nesnesi için MRO\'da B\'den sonraki sınıfa gider.'],
    why='D\'nin MRO\'su D, B, C, A, object\'tir: her sınıf, kendi alt sınıflarından sonra ve tanımdaki sıraya uygun yer alır, ortak ata A bir kez ve en sonda gelir. B\'deki <code>super()</code> "B\'nin ebeveyni A" demek değildir; o anki nesnenin (D) MRO\'sunda B\'den sonraki sınıf olan C\'yi çağırır. Bu yüzden her sınıf tam bir kez çalışır: DBCA. İşbirlikçi çoklu kalıtım (cooperative multiple inheritance) bu kurala dayanır.',
    tags=['MRO', 'super', 'çoklu kalıtım'], min=3))

T.append(dict(
    id='b-244', topic='Kalıtım ve MRO', diff=2, t='order',
    title='Soyut bildirim sınıfı',
    q='<p>Soyut bir <code>Bildirim</code> sınıfı ve onu gerçekleyen <code>Sms</code> sınıfını tanımlayıp kullanan programı sırala. Çıktı <code>SMS: Kargonuz yolda</code> olmalı.</p>',
    lines=['from abc import ABC, abstractmethod',
           'class Bildirim(ABC):',
           '    @abstractmethod',
           '    def gonder(self, mesaj): ...',
           'class Sms(Bildirim):',
           '    def gonder(self, mesaj):',
           '        return f"SMS: {mesaj}"',
           'print(Sms().gonder("Kargonuz yolda"))'],
    expect='SMS: Kargonuz yolda\n',
    hint='@abstractmethod soyut sınıftaki gövdesiz (...) metodun hemen üstünde olmalı; alt sınıf gerçek gövdeyi verir.',
    hints=['@abstractmethod soyut sınıftaki gövdesiz (...) metodun hemen üstünde olmalı; alt sınıf gerçek gövdeyi verir.'],
    why='<code>ABC</code>\'den türeyen ve <code>@abstractmethod</code> içeren sınıf doğrudan örneklenemez (<code>Bildirim()</code> → <code>TypeError</code>). Alt sınıf tüm soyut metotları gerçeklediğinde örneklenebilir. Böylece "her bildirim kanalı <code>gonder</code> sunmalı" sözleşmesi çalışma anında, nesne oluşturulurken denetlenir. Daha gevşek alternatif <code>typing.Protocol</code>\'dür: kalıtım istemez, yalnızca tip denetleyicide (mypy) kontrol edilir.',
    tags=['ABC', 'abstractmethod', 'kalıtım'], min=3))

T.append(dict(
    id='b-245', topic='Kalıtım ve MRO', diff=2, kind='rehberli',
    title='Mixin ile JSON yeteneği',
    q='<p>Farklı modellerin (ürün, müşteri) hepsine "sözlüğe ve JSON\'a dönüşebilme" yeteneği eklenecek ama ortak bir ata sınıfları yok. İki mixin yaz: <code>SozlukMixin.sozluk()</code> nesnenin özniteliklerinden alt çizgiyle (<code>_</code>) <b>başlamayanları</b> sözlük olarak döndürsün. <code>JsonMixin(SozlukMixin).json()</code> bu sözlüğü <code>json.dumps(..., ensure_ascii=False, sort_keys=True)</code> ile metne çevirsin. Sonra <code>Urun(JsonMixin)</code> sınıfını <code>ad</code>, <code>fiyat</code> ve gizli <code>_maliyet</code> alanlarıyla tanımla.</p>',
    guide=['<code>vars(self)</code> nesnenin öznitelik sözlüğünü verir.',
           '<code>sozluk</code>: dict comprehension ile <code>_</code> ile başlayan anahtarları ele.',
           '<code>JsonMixin</code>, <code>SozlukMixin</code>\'den türesin ve <code>self.sozluk()</code>\'ü kullansın.',
           '<code>Urun.__init__(self, ad, fiyat, maliyet)</code> içinde <code>self._maliyet = maliyet</code>.'],
    example=C(r'''
        # Mixin: tek başına anlamı olmayan, başka sınıflara yetenek ekleyen küçük sınıf
        class TekrarMixin:
            def tekrarla(self, n):
                return [str(self)] * n

        class Etiket(TekrarMixin):
            def __init__(self, metin):
                self.metin = metin
            def __str__(self):
                return self.metin

        print(Etiket("İNDİRİM").tekrarla(2))
    '''),
    start=C(r'''
        import json

        class SozlukMixin:
            def sozluk(self):
                # TODO 1: _ ile başlamayan öznitelikleri döndür
                return {}

        class JsonMixin(SozlukMixin):
            def json(self):
                # TODO 2: sozluk() sonucunu JSON metnine çevir
                return ""

        class Urun(JsonMixin):
            # TODO 3: ad, fiyat, _maliyet alanları
            pass
    '''),
    sol=C(r'''
        import json

        class SozlukMixin:
            def sozluk(self):
                return {k: v for k, v in vars(self).items() if not k.startswith("_")}

        class JsonMixin(SozlukMixin):
            def json(self):
                return json.dumps(self.sozluk(), ensure_ascii=False, sort_keys=True)

        class Urun(JsonMixin):
            def __init__(self, ad, fiyat, maliyet):
                self.ad = ad
                self.fiyat = fiyat
                self._maliyet = maliyet
    '''),
    tests=C(r'''
        u = Urun("Çanta", 400, 180)
        assert u.sozluk() == {"ad": "Çanta", "fiyat": 400}, "gizli _maliyet sözlükte olmamalı"
        assert u.json() == '{"ad": "Çanta", "fiyat": 400}', f"JSON metni beklenenden farklı: {u.json()!r} (ensure_ascii=False, sort_keys=True)"
        class Musteri(JsonMixin):
            def __init__(self, ad):
                self.ad = ad
                self._sifre = "gizli"
        assert Musteri("Ece").json() == '{"ad": "Ece"}', "mixin başka sınıflara da aynı yeteneği vermeli"
        assert [k.__name__ for k in Urun.__mro__] == ["Urun", "JsonMixin", "SozlukMixin", "object"], "MRO: Urun, JsonMixin, SozlukMixin, object"
    '''),
    hints=['Mixin\'ler <code>__init__</code> tanımlamaz; yalnızca metot ekler.',
           '<code>{k: v for k, v in vars(self).items() if not k.startswith("_")}</code>',
           '<code>return json.dumps(self.sozluk(), ensure_ascii=False, sort_keys=True)</code>'],
    why='Mixin, kalıtımı "tür ilişkisi" için değil "yetenek eklemek" için kullanır; ortak atası olmayan sınıflara aynı davranışı tek yerden verir. <code>_</code> önekli alanları dışarıda bırakmak, gizli/iç alanların yanlışlıkla API çıktısına sızmasını önler. Alternatif: kalıtım yerine bir yardımcı fonksiyon (<code>nesne_json(obj)</code>) ya da dataclass + <code>dataclasses.asdict</code>; mixin, metodun nesne üzerinden çağrılmasını istediğinde daha doğal durur.',
    tags=['mixin', 'vars', 'json', 'MRO'], min=7))

T.append(dict(
    id='b-246', topic='Kalıtım ve MRO', diff=2, kind='yaz',
    title='Şablon metotlu rapor sınıfları',
    q='<p>Raporların hepsi aynı iskeleti izliyor: başlık, satırlar, alt bilgi. <code>Rapor</code> ata sınıfını yaz: <code>olustur()</code> metodu <code>baslik()</code>, <code>satirlar()</code> (liste döndürür) ve <code>alt_bilgi()</code> çıktılarını <code>"\\n"</code> ile birleştirip döndürsün. <code>baslik()</code> varsayılan olarak sınıf adını büyük harfle (<code>type(self).__name__.upper()</code>), <code>alt_bilgi()</code> <code>"-- N satır --"</code> döndürsün; <code>satirlar()</code> ata sınıfta <code>NotImplementedError</code> fırlatsın. Ardından <code>SatisRaporu(veri)</code> alt sınıfını yaz: <code>veri</code> <code>{"Ankara": 350, ...}</code>; satırlar <code>"Ankara: 350"</code> biçiminde, tutara göre azalan.</p>',
    start=C(r'''
        class Rapor:
            # buraya yaz
            pass


        class SatisRaporu(Rapor):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        class Rapor:
            def baslik(self):
                return type(self).__name__.upper()

            def satirlar(self):
                raise NotImplementedError("alt sınıf satirlar() tanımlamalı")

            def alt_bilgi(self):
                return f"-- {len(self.satirlar())} satır --"

            def olustur(self):
                return "\n".join([self.baslik(), *self.satirlar(), self.alt_bilgi()])


        class SatisRaporu(Rapor):
            def __init__(self, veri):
                self.veri = veri

            def satirlar(self):
                sirali = sorted(self.veri.items(), key=lambda kv: kv[1], reverse=True)
                return [f"{sehir}: {tutar}" for sehir, tutar in sirali]
    '''),
    tests=C(r'''
        r = SatisRaporu({"İzmir": 120, "Ankara": 350})
        beklenen = "SATISRAPORU\nAnkara: 350\nİzmir: 120\n-- 2 satır --"
        assert r.olustur() == beklenen, f"rapor metni farklı:\n{r.olustur()}"
        try:
            Rapor().olustur()
            assert False, "ata sınıfta satirlar() NotImplementedError fırlatmalı"
        except NotImplementedError:
            pass
        class StokRaporu(Rapor):
            def baslik(self):
                return "Stok"
            def satirlar(self):
                return ["kalem: 40"]
        assert StokRaporu().olustur() == "Stok\nkalem: 40\n-- 1 satır --", "alt sınıf başlığı ezebilmeli, olustur() akışı aynı kalmalı"
    '''),
    hints=['Akışı (<code>olustur</code>) ata sınıf belirler, değişen adımları alt sınıflar ezer: şablon metot (template method) kalıbı.',
           '<code>"\\n".join([self.baslik(), *self.satirlar(), self.alt_bilgi()])</code>',
           'Alt sınıfta <code>sorted(self.veri.items(), key=lambda kv: kv[1], reverse=True)</code>.'],
    why='Şablon metot kalıbında algoritmanın iskeleti ata sınıfta bir kez yazılır; alt sınıflar yalnızca farklı olan adımı (<code>satirlar</code>) sağlar, istedikleri varsayılanı (<code>baslik</code>) ezer. <code>NotImplementedError</code> eksik gerçeklemeyi çağrı anında belli eder; daha erken yakalamak istersen <code>abc.abstractmethod</code> ile nesne oluşturulurken hata alınır. Alternatif: kalıtım yerine bileşim, yani <code>olustur(baslik, satirlar_fonk)</code> gibi fonksiyon parametreleri.',
    tags=['kalıtım', 'template method', 'NotImplementedError'], min=8))

T.append(dict(
    id='b-247', topic='Kalıtım ve MRO', diff=3, kind='yaz',
    title='İşbirlikçi çoklu kalıtım',
    q='<p>Kurumun hem çalışan hem yüksek lisans öğrencisi olan personeli var. Dört sınıf yaz: <code>Kisi(ad)</code>, <code>Calisan(Kisi)</code> ek olarak <code>maas</code>, <code>Ogrenci(Kisi)</code> ek olarak <code>okul</code>, <code>CalisanOgrenci(Calisan, Ogrenci)</code>. Tüm <code>__init__</code>\'ler <b>anahtar kelimeli</b> argüman alsın ve <code>super().__init__(**kwargs)</code> ile zinciri sürdürsün; böylece <code>CalisanOgrenci(ad="Ece", maas=20000, okul="ODTÜ")</code> çalışsın ve <code>Kisi.__init__</code> <b>tam bir kez</b> çağrılsın. Sayım için <code>Kisi</code>\'de sınıf özniteliği <code>init_sayisi = 0</code> tut ve her <code>Kisi.__init__</code>\'te artır.</p>',
    start=C(r'''
        class Kisi:
            init_sayisi = 0
            # buraya yaz


        class Calisan(Kisi):
            pass


        class Ogrenci(Kisi):
            pass


        class CalisanOgrenci(Calisan, Ogrenci):
            pass
    '''),
    sol=C(r'''
        class Kisi:
            init_sayisi = 0

            def __init__(self, *, ad, **kwargs):
                super().__init__(**kwargs)
                Kisi.init_sayisi += 1
                self.ad = ad


        class Calisan(Kisi):
            def __init__(self, *, maas, **kwargs):
                super().__init__(**kwargs)
                self.maas = maas


        class Ogrenci(Kisi):
            def __init__(self, *, okul, **kwargs):
                super().__init__(**kwargs)
                self.okul = okul


        class CalisanOgrenci(Calisan, Ogrenci):
            pass
    '''),
    tests=C(r'''
        Kisi.init_sayisi = 0
        e = CalisanOgrenci(ad="Ece", maas=20000, okul="ODTÜ")
        assert (e.ad, e.maas, e.okul) == ("Ece", 20000, "ODTÜ"), "üç alan da atanmalı: her __init__ kendi alanını alıp kalanını super()'e iletmeli"
        assert Kisi.init_sayisi == 1, f"Kisi.__init__ tam 1 kez çalışmalı, {Kisi.init_sayisi} kez çalıştı (Kisi.__init__(self, ...) yerine super() kullan)"
        c = Calisan(ad="Can", maas=30000)
        assert c.maas == 30000 and c.ad == "Can", "Calisan tek başına da çalışmalı"
        assert [k.__name__ for k in CalisanOgrenci.__mro__] == ["CalisanOgrenci", "Calisan", "Ogrenci", "Kisi", "object"], "MRO beklenen sırada değil"
    '''),
    hints=['Her sınıf yalnızca kendi parametresini adıyla alır, geri kalanı <code>**kwargs</code> ile sonraki sınıfa iletir.',
           '<code>Calisan</code>\'daki <code>super()</code> bir <code>CalisanOgrenci</code> nesnesi için <code>Ogrenci</code>\'ye gider, <code>Kisi</code>\'ye değil.',
           '<code>def __init__(self, *, maas, **kwargs): super().__init__(**kwargs); self.maas = maas</code>'],
    why='MRO <code>CalisanOgrenci → Calisan → Ogrenci → Kisi → object</code> olduğundan her sınıf <code>super()</code> çağırırsa zincir her <code>__init__</code>\'i tam bir kez çalıştırır. Ata sınıfı doğrudan adıyla çağırmak (<code>Kisi.__init__(self, ad)</code>) elmas yapıda Kisi\'yi iki kez çalıştırır ya da Ogrenci\'yi hiç çalıştırmaz. <code>**kwargs</code> ile "kendi argümanını al, gerisini ilet" kuralı işbirlikçi kalıtımın standardıdır. Alternatif: çoklu kalıtım yerine bileşim (CalisanOgrenci içinde <code>calisan</code> ve <code>ogrenci</code> alanları) çoğu zaman daha basittir.',
    tags=['super', 'MRO', 'kwargs', 'çoklu kalıtım'], min=10))

# ---------------- Dataclass ve Tip ----------------
T.append(dict(
    id='b-248', topic='Dataclass ve Tip', diff=2, t='predict',
    title='Karşılaştırmaya katılmayan alan',
    q='<p>Ürün kodları aynıysa ürünler aynı sayılsın diye <code>ad</code> alanı karşılaştırmadan çıkarılmış. Bu kod ne yazdırır?</p>',
    code=C(r'''
        from dataclasses import dataclass, field

        @dataclass
        class Urun:
            kod: str
            ad: str = field(compare=False)
            fiyat: float = 0

        print(Urun("K1", "Kalem", 10) == Urun("K1", "KALEM", 10))
        print(Urun("K1", "Kalem", 10) == Urun("K1", "Kalem", 12))
        print(Urun("K2", "Silgi"))
    '''),
    o=["True\nTrue\nUrun(kod='K2', ad='Silgi', fiyat=0)",
       "False\nFalse\nUrun(kod='K2', ad='Silgi', fiyat=0)",
       "True\nFalse\nUrun(kod='K2', fiyat=0)",
       "True\nFalse\nUrun(kod='K2', ad='Silgi', fiyat=0)"],
    a=3,
    hints=['<code>compare=False</code> yalnızca <code>__eq__</code>\'i etkiler; <code>repr</code> için ayrı bir parametre (<code>repr=False</code>) vardır.', 'fiyat karşılaştırmaya katılıyor mu?'],
    why='<code>field(compare=False)</code> alanı üretilen <code>__eq__</code> (ve order varsa sıralama) metotlarından çıkarır; ad farklı olsa da kod ve fiyat aynıysa nesneler eşittir. Fiyat hâlâ karşılaştırmada olduğu için 10 ile 12 eşit değildir. <code>repr</code> etkilenmez; alanı repr\'den de çıkarmak için <code>repr=False</code> gerekir.',
    tags=['dataclass', 'field', 'compare'], min=3))

T.append(dict(
    id='b-249', topic='Dataclass ve Tip', diff=2, kind='rehberli',
    title='Kendi toplamını hesaplayan fatura',
    q='<p><code>Fatura</code> dataclass\'ını yaz: alanlar <code>no: str</code>, <code>kalemler: list[tuple[str, int, float]]</code> (ad, adet, birim fiyat), <code>kdv_orani: float = 0.20</code>. Ayrıca <code>toplam: float</code> alanı olsun ama kurucuda <b>verilmesin</b> (<code>init=False</code>); <code>__post_init__</code> içinde KDV dahil toplam <code>round(..., 2)</code> olarak hesaplansın. Herhangi bir kalemin adedi 1\'den küçükse <code>__post_init__</code> <code>ValueError</code> fırlatsın.</p>',
    guide=['<code>@dataclass</code> ile alanları tip ipuçlarıyla tanımla.',
           '<code>toplam: float = field(init=False)</code> ile hesaplanan alanı ekle.',
           '<code>def __post_init__(self):</code> içinde önce adetleri doğrula.',
           'Ara toplamı <code>sum(adet * fiyat ...)</code> ile bul, KDV ekleyip <code>self.toplam</code>\'a ata.'],
    example=C(r'''
        from dataclasses import dataclass, field

        @dataclass
        class Dikdortgen:
            en: float
            boy: float
            alan: float = field(init=False)

            def __post_init__(self):
                if self.en <= 0 or self.boy <= 0:
                    raise ValueError("kenarlar pozitif olmalı")
                self.alan = self.en * self.boy

        print(Dikdortgen(3, 4))
    '''),
    start=C(r'''
        from dataclasses import dataclass, field

        @dataclass
        class Fatura:
            no: str
            # TODO 1: kalemler ve kdv_orani alanları
            # TODO 2: toplam alanı (init=False)

            def __post_init__(self):
                # TODO 3: adetleri doğrula, toplamı hesapla
                pass
    '''),
    sol=C(r'''
        from dataclasses import dataclass, field

        @dataclass
        class Fatura:
            no: str
            kalemler: list[tuple[str, int, float]]
            kdv_orani: float = 0.20
            toplam: float = field(init=False)

            def __post_init__(self):
                for ad, adet, _ in self.kalemler:
                    if adet < 1:
                        raise ValueError(f"{ad} için adet en az 1 olmalı")
                ara = sum(adet * fiyat for _, adet, fiyat in self.kalemler)
                self.toplam = round(ara * (1 + self.kdv_orani), 2)
    '''),
    tests=C(r'''
        f = Fatura("F-001", [("kalem", 10, 7.5), ("defter", 2, 40.0)])
        assert f.toplam == 186.0, f"(75 + 80) * 1.2 = 186.0 bekleniyordu, gelen {getattr(f, 'toplam', None)}"
        assert Fatura("F-002", [("çanta", 1, 100.0)], kdv_orani=0.10).toplam == 110.0, "kdv_orani parametresi kullanılmalı"
        try:
            Fatura("F-003", [("kalem", 0, 5.0)])
            assert False, "adet 0 olan kalemde ValueError fırlatılmalı"
        except ValueError:
            pass
        try:
            Fatura("F-004", [], 0.2, 999)
            assert False, "toplam kurucuda verilememeli (init=False)"
        except TypeError:
            pass
    '''),
    hints=['<code>__post_init__</code>, dataclass\'ın ürettiği <code>__init__</code> alanları atadıktan hemen sonra çağrılır.',
           '<code>toplam: float = field(init=False)</code> alanı imzadan çıkarır.',
           '<code>self.toplam = round(sum(a * f for _, a, f in self.kalemler) * (1 + self.kdv_orani), 2)</code>'],
    why='<code>__post_init__</code>, dataclass\'a kendi <code>__init__</code>\'ini yazmadan doğrulama ve türetilmiş alan hesaplama imkânı verir. <code>init=False</code> alanı kurucudan çıkarır ama <code>repr</code> ve <code>eq</code>\'de tutar. Dikkat: toplam bir kez hesaplanır; kalemler sonradan değişirse güncellenmez. Her zaman güncel olması gerekiyorsa alan yerine <code>@property</code> kullanmak daha doğrudur.',
    tags=['dataclass', '__post_init__', 'field', 'doğrulama'], min=8))

T.append(dict(
    id='b-250', topic='Dataclass ve Tip', diff=2, kind='yaz',
    title='Değişmez kayıtlarla toplu zam',
    q='<p>Bordro sisteminde kayıtlar değiştirilemez (frozen) tutuluyor; zam yeni kayıt üretir. <code>Calisan</code> adlı <b>frozen</b> bir dataclass yaz (<code>ad: str</code>, <code>birim: str</code>, <code>maas: int</code>). Sonra <code>zam_uygula(calisanlar, birim, oran)</code> fonksiyonunu yaz: yalnızca verilen birimdekilerin maaşını <code>round(maas * (1 + oran))</code> yapan <b>yeni</b> bir liste döndürsün; diğerleri aynen kalsın. <code>dataclasses.replace</code> kullan.</p>',
    start=C(r'''
        from dataclasses import dataclass, replace

        # buraya yaz
    '''),
    sol=C(r'''
        from dataclasses import dataclass, replace

        @dataclass(frozen=True)
        class Calisan:
            ad: str
            birim: str
            maas: int


        def zam_uygula(calisanlar, birim, oran):
            return [replace(c, maas=round(c.maas * (1 + oran))) if c.birim == birim else c for c in calisanlar]
    '''),
    tests=C(r'''
        liste = [Calisan("Ece", "IT", 50000), Calisan("Can", "Satış", 40000), Calisan("Ada", "IT", 45000)]
        yeni = zam_uygula(liste, "IT", 0.15)
        assert [c.maas for c in yeni] == [57500, 40000, 51750], f"IT'ye %15 zam: [57500, 40000, 51750] bekleniyordu, gelen {[c.maas for c in yeni]}"
        assert liste[0].maas == 50000, "orijinal kayıt değişmemeli"
        try:
            liste[0].maas = 1
            assert False, "Calisan frozen olmalı: alan ataması FrozenInstanceError vermeli"
        except AttributeError:
            pass
        assert yeni[1] is liste[1], "zam almayan kayıt aynı nesne olarak kalabilir"
    '''),
    hints=['<code>@dataclass(frozen=True)</code> alanlara atamayı yasaklar.',
           '<code>replace(nesne, alan=yeni_deger)</code> diğer alanları kopyalayıp yeni nesne üretir.'],
    why='Değişmez kayıtlar, aynı nesneyi paylaşan kodların birbirini sürpriz biçimde bozmasını önler; bordro, muhasebe gibi denetim izi gereken alanlarda tercih edilir. <code>replace</code> yeni nesneyi oluştururken <code>__init__</code> ve varsa <code>__post_init__</code> doğrulamalarını yeniden çalıştırır. Alternatif: <code>Calisan(c.ad, c.birim, yeni_maas)</code> ile elle kurmak; alan sayısı arttıkça hataya açıktır.',
    tags=['dataclass', 'frozen', 'replace'], min=6))

write('/home/claude/py/v2/b2/bank_orta_04.js', T, 'OOP, Kalıtım ve MRO, Dataclass ve Tip (b-241…b-250)')
