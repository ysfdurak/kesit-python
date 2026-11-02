/* Kesit Python — pratik bankası (orta): OOP, Kalıtım ve MRO, Dataclass ve Tip (b-241…b-250) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-241',
    lv: 'orta',
    topic: 'OOP',
    diff: 3,
    kind: 'yaz',
    title: 'Sipariş durum makinesi',
    q: '<p>Anadolu Market siparişleri belirli bir akışla ilerler: <code>yeni → hazirlaniyor → kargoda → teslim</code>. Ayrıca <code>yeni</code> ya da <code>hazirlaniyor</code> durumundaki sipariş <code>iptal</code> edilebilir. <code>Siparis</code> sınıfını yaz:</p><ul><li><code>Siparis(no)</code> durumu <code>"yeni"</code> başlar; <code>gecmis</code> listesi <code>["yeni"]</code> olur.</li><li><code>gecis(yeni_durum)</code>: izinli değilse <code>ValueError</code> fırlatır (mesajda iki durum da geçsin), izinliyse durumu günceller ve geçmişe ekler.</li><li><code>bitti_mi</code> bir <b>property</b> olsun: durum <code>teslim</code> ya da <code>iptal</code> ise <code>True</code>.</li></ul>',
    start: 'class Siparis:\n    # buraya yaz\n    pass\n',
    sol: 'class Siparis:\n    GECISLER = {\n        "yeni": {"hazirlaniyor", "iptal"},\n        "hazirlaniyor": {"kargoda", "iptal"},\n        "kargoda": {"teslim"},\n        "teslim": set(),\n        "iptal": set(),\n    }\n\n    def __init__(self, no):\n        self.no = no\n        self.durum = "yeni"\n        self.gecmis = ["yeni"]\n\n    def gecis(self, yeni_durum):\n        if yeni_durum not in self.GECISLER.get(self.durum, set()):\n            raise ValueError(f"{self.durum} -> {yeni_durum} geçişi yapılamaz")\n        self.durum = yeni_durum\n        self.gecmis.append(yeni_durum)\n\n    @property\n    def bitti_mi(self):\n        return self.durum in ("teslim", "iptal")\n',
    tests: 's = Siparis(501)\nassert s.durum == "yeni" and s.gecmis == ["yeni"], "başlangıç durumu yeni"\ns.gecis("hazirlaniyor"); s.gecis("kargoda")\nassert s.bitti_mi is False, "kargodaki sipariş bitmemiştir (bitti_mi property, parantezsiz)"\ntry:\n    s.gecis("iptal")\n    assert False, "kargodaki sipariş iptal edilememeli: ValueError bekleniyordu"\nexcept ValueError as e:\n    assert "kargoda" in str(e) and "iptal" in str(e), "hata mesajı mevcut ve istenen durumu içermeli"\nassert s.durum == "kargoda", "reddedilen geçiş durumu değiştirmemeli"\ns.gecis("teslim")\nassert s.bitti_mi and s.gecmis == ["yeni", "hazirlaniyor", "kargoda", "teslim"], "teslim sonrası geçmiş tam olmalı"\nt = Siparis(502); t.gecis("iptal")\nassert t.bitti_mi, "iptal edilen sipariş bitmiştir"\ntry:\n    Siparis(503).gecis("teslim")\n    assert False, "yeni siparişten doğrudan teslime geçilmemeli"\nexcept ValueError:\n    pass\n',
    hints: ['İzinli geçişleri bir sözlükte tut: durum → gidebileceği durumlar kümesi.', '<code>gecis</code> içinde önce kontrol et, hata yoksa güncelle; böylece reddedilen geçiş durumu bozmaz.', '<code>@property def bitti_mi(self): return self.durum in ("teslim", "iptal")</code>'],
    why: 'Geçiş kurallarını veri (sözlük) olarak tutmak, <code>if/elif</code> yığınına göre hem okunur hem genişletilebilir: yeni bir durum eklemek tek satırdır. Önce doğrulayıp sonra değiştirmek nesneyi tutarlı bırakır. <code>property</code> hesaplanan bir değeri öznitelik gibi sunar. Daha büyük sistemlerde durumlar <code>enum.Enum</code> ile tanımlanır, böylece yazım hataları (<code>"kargodaa"</code>) çalışma anında değil tanımda yakalanır.',
    tags: ['class', 'state machine', 'property', 'ValueError'],
    min: 10
  },

  {
    id: 'b-242',
    lv: 'orta',
    topic: 'OOP',
    diff: 1,
    kind: 'bug',
    title: 'Kendi metodunu bulamayan sınıf',
    q: '<p>Hatayı bul ve düzelt. <code>Fatura.kdvli_toplam()</code> çağrıldığında <code>NameError: name \'ara_toplam\' is not defined</code> hatası alınıyor. Fatura ara toplamı kalemlerin <code>adet * fiyat</code> toplamıdır; KDV\'li toplam bunun <code>1 + kdv</code> katı (2 basamağa yuvarlanmış).</p>',
    start: 'class Fatura:\n    def __init__(self, kalemler, kdv=0.20):\n        self.kalemler = kalemler\n        self.kdv = kdv\n\n    def ara_toplam(self):\n        return sum(adet * fiyat for adet, fiyat in self.kalemler)\n\n    def kdvli_toplam(self):\n        return round(ara_toplam() * (1 + kdv), 2)\n',
    sol: 'class Fatura:\n    def __init__(self, kalemler, kdv=0.20):\n        self.kalemler = kalemler\n        self.kdv = kdv\n\n    def ara_toplam(self):\n        return sum(adet * fiyat for adet, fiyat in self.kalemler)\n\n    def kdvli_toplam(self):\n        return round(self.ara_toplam() * (1 + self.kdv), 2)\n',
    tests: 'f = Fatura([(2, 50.0), (1, 99.9)])\nassert f.ara_toplam() == 199.9, "ara toplam 2*50 + 99.9 = 199.9"\nassert f.kdvli_toplam() == 239.88, "KDV\'li toplam 199.9 * 1.2 = 239.88; metot ve öznitelikler self. ile çağrılmalı"\nassert Fatura([(1, 100)], kdv=0.10).kdvli_toplam() == 110.0, "farklı KDV oranı kullanılabilmeli (self.kdv)"\n',
    hints: ['Metot içinde aynı nesnenin başka bir metoduna ya da özniteliğine nasıl ulaşılır?', 'İki yerde <code>self.</code> eksik.'],
    why: 'Python\'da metotlar ve öznitelikler örtük değildir (Java/C#\'taki <code>this</code> gibi otomatik değil); nesneye ait her şeye <code>self.</code> ile erişilir. <code>ara_toplam()</code> yazınca Python modül düzeyinde bir fonksiyon arar ve bulamaz. Bu açıklık kuralı, yerel değişken ile nesne durumunu kod okurken ayırt etmeyi kolaylaştırır.',
    tags: ['self', 'metot', 'NameError'],
    min: 2
  },

  {
    id: 'b-243',
    lv: 'orta',
    topic: 'Kalıtım ve MRO',
    diff: 3,
    t: 'predict',
    kind: 'predict',
    title: 'Elmas kalıtımda super() zinciri',
    q: '<p>Çoklu kalıtımda <code>super()</code> "üst sınıf" değil, MRO\'daki <b>bir sonraki</b> sınıf demektir. Bu kod ne yazdırır?</p>',
    code: 'class A:\n    def selam(self):\n        return "A"\n\nclass B(A):\n    def selam(self):\n        return "B" + super().selam()\n\nclass C(A):\n    def selam(self):\n        return "C" + super().selam()\n\nclass D(B, C):\n    def selam(self):\n        return "D" + super().selam()\n\nprint(D().selam())\nprint([k.__name__ for k in D.__mro__])\n',
    o: ['DBA\n[\'D\', \'B\', \'A\', \'C\', \'object\']', 'DBCA\n[\'D\', \'B\', \'C\', \'A\', \'object\']', 'DBACA\n[\'D\', \'B\', \'A\', \'C\', \'A\', \'object\']', 'DCBA\n[\'D\', \'C\', \'B\', \'A\', \'object\']'],
    a: 1,
    hints: ['MRO (Method Resolution Order) C3 doğrusallaştırmasıyla hesaplanır; ortak ata (A) tüm alt sınıflarından sonra gelir.', '<code>B</code> içindeki <code>super()</code>, D nesnesi için MRO\'da B\'den sonraki sınıfa gider.'],
    why: 'D\'nin MRO\'su D, B, C, A, object\'tir: her sınıf, kendi alt sınıflarından sonra ve tanımdaki sıraya uygun yer alır, ortak ata A bir kez ve en sonda gelir. B\'deki <code>super()</code> "B\'nin ebeveyni A" demek değildir; o anki nesnenin (D) MRO\'sunda B\'den sonraki sınıf olan C\'yi çağırır. Bu yüzden her sınıf tam bir kez çalışır: DBCA. İşbirlikçi çoklu kalıtım (cooperative multiple inheritance) bu kurala dayanır.',
    tags: ['MRO', 'super', 'çoklu kalıtım'],
    min: 3
  },

  {
    id: 'b-244',
    lv: 'orta',
    topic: 'Kalıtım ve MRO',
    diff: 2,
    t: 'order',
    kind: 'order',
    title: 'Soyut bildirim sınıfı',
    q: '<p>Soyut bir <code>Bildirim</code> sınıfı ve onu gerçekleyen <code>Sms</code> sınıfını tanımlayıp kullanan programı sırala. Çıktı <code>SMS: Kargonuz yolda</code> olmalı.</p>',
    lines: ['from abc import ABC, abstractmethod', 'class Bildirim(ABC):', '    @abstractmethod', '    def gonder(self, mesaj): ...', 'class Sms(Bildirim):', '    def gonder(self, mesaj):', '        return f"SMS: {mesaj}"', 'print(Sms().gonder("Kargonuz yolda"))'],
    expect: 'SMS: Kargonuz yolda\n',
    hint: '@abstractmethod soyut sınıftaki gövdesiz (...) metodun hemen üstünde olmalı; alt sınıf gerçek gövdeyi verir.',
    hints: ['@abstractmethod soyut sınıftaki gövdesiz (...) metodun hemen üstünde olmalı; alt sınıf gerçek gövdeyi verir.'],
    why: '<code>ABC</code>\'den türeyen ve <code>@abstractmethod</code> içeren sınıf doğrudan örneklenemez (<code>Bildirim()</code> → <code>TypeError</code>). Alt sınıf tüm soyut metotları gerçeklediğinde örneklenebilir. Böylece "her bildirim kanalı <code>gonder</code> sunmalı" sözleşmesi çalışma anında, nesne oluşturulurken denetlenir. Daha gevşek alternatif <code>typing.Protocol</code>\'dür: kalıtım istemez, yalnızca tip denetleyicide (mypy) kontrol edilir.',
    tags: ['ABC', 'abstractmethod', 'kalıtım'],
    min: 3
  },

  {
    id: 'b-245',
    lv: 'orta',
    topic: 'Kalıtım ve MRO',
    diff: 2,
    kind: 'rehberli',
    title: 'Mixin ile JSON yeteneği',
    q: '<p>Farklı modellerin (ürün, müşteri) hepsine "sözlüğe ve JSON\'a dönüşebilme" yeteneği eklenecek ama ortak bir ata sınıfları yok. İki mixin yaz: <code>SozlukMixin.sozluk()</code> nesnenin özniteliklerinden alt çizgiyle (<code>_</code>) <b>başlamayanları</b> sözlük olarak döndürsün. <code>JsonMixin(SozlukMixin).json()</code> bu sözlüğü <code>json.dumps(..., ensure_ascii=False, sort_keys=True)</code> ile metne çevirsin. Sonra <code>Urun(JsonMixin)</code> sınıfını <code>ad</code>, <code>fiyat</code> ve gizli <code>_maliyet</code> alanlarıyla tanımla.</p>',
    guide: ['<code>vars(self)</code> nesnenin öznitelik sözlüğünü verir.', '<code>sozluk</code>: dict comprehension ile <code>_</code> ile başlayan anahtarları ele.', '<code>JsonMixin</code>, <code>SozlukMixin</code>\'den türesin ve <code>self.sozluk()</code>\'ü kullansın.', '<code>Urun.__init__(self, ad, fiyat, maliyet)</code> içinde <code>self._maliyet = maliyet</code>.'],
    example: '# Mixin: tek başına anlamı olmayan, başka sınıflara yetenek ekleyen küçük sınıf\nclass TekrarMixin:\n    def tekrarla(self, n):\n        return [str(self)] * n\n\nclass Etiket(TekrarMixin):\n    def __init__(self, metin):\n        self.metin = metin\n    def __str__(self):\n        return self.metin\n\nprint(Etiket("İNDİRİM").tekrarla(2))\n',
    start: 'import json\n\nclass SozlukMixin:\n    def sozluk(self):\n        # TODO 1: _ ile başlamayan öznitelikleri döndür\n        return {}\n\nclass JsonMixin(SozlukMixin):\n    def json(self):\n        # TODO 2: sozluk() sonucunu JSON metnine çevir\n        return ""\n\nclass Urun(JsonMixin):\n    # TODO 3: ad, fiyat, _maliyet alanları\n    pass\n',
    sol: 'import json\n\nclass SozlukMixin:\n    def sozluk(self):\n        return {k: v for k, v in vars(self).items() if not k.startswith("_")}\n\nclass JsonMixin(SozlukMixin):\n    def json(self):\n        return json.dumps(self.sozluk(), ensure_ascii=False, sort_keys=True)\n\nclass Urun(JsonMixin):\n    def __init__(self, ad, fiyat, maliyet):\n        self.ad = ad\n        self.fiyat = fiyat\n        self._maliyet = maliyet\n',
    tests: 'u = Urun("Çanta", 400, 180)\nassert u.sozluk() == {"ad": "Çanta", "fiyat": 400}, "gizli _maliyet sözlükte olmamalı"\nassert u.json() == \'{"ad": "Çanta", "fiyat": 400}\', f"JSON metni beklenenden farklı: {u.json()!r} (ensure_ascii=False, sort_keys=True)"\nclass Musteri(JsonMixin):\n    def __init__(self, ad):\n        self.ad = ad\n        self._sifre = "gizli"\nassert Musteri("Ece").json() == \'{"ad": "Ece"}\', "mixin başka sınıflara da aynı yeteneği vermeli"\nassert [k.__name__ for k in Urun.__mro__] == ["Urun", "JsonMixin", "SozlukMixin", "object"], "MRO: Urun, JsonMixin, SozlukMixin, object"\n',
    hints: ['Mixin\'ler <code>__init__</code> tanımlamaz; yalnızca metot ekler.', '<code>{k: v for k, v in vars(self).items() if not k.startswith("_")}</code>', '<code>return json.dumps(self.sozluk(), ensure_ascii=False, sort_keys=True)</code>'],
    why: 'Mixin, kalıtımı "tür ilişkisi" için değil "yetenek eklemek" için kullanır; ortak atası olmayan sınıflara aynı davranışı tek yerden verir. <code>_</code> önekli alanları dışarıda bırakmak, gizli/iç alanların yanlışlıkla API çıktısına sızmasını önler. Alternatif: kalıtım yerine bir yardımcı fonksiyon (<code>nesne_json(obj)</code>) ya da dataclass + <code>dataclasses.asdict</code>; mixin, metodun nesne üzerinden çağrılmasını istediğinde daha doğal durur.',
    tags: ['mixin', 'vars', 'json', 'MRO'],
    min: 7
  },

  {
    id: 'b-246',
    lv: 'orta',
    topic: 'Kalıtım ve MRO',
    diff: 2,
    kind: 'yaz',
    title: 'Şablon metotlu rapor sınıfları',
    q: '<p>Raporların hepsi aynı iskeleti izliyor: başlık, satırlar, alt bilgi. <code>Rapor</code> ata sınıfını yaz: <code>olustur()</code> metodu <code>baslik()</code>, <code>satirlar()</code> (liste döndürür) ve <code>alt_bilgi()</code> çıktılarını <code>"\\n"</code> ile birleştirip döndürsün. <code>baslik()</code> varsayılan olarak sınıf adını büyük harfle (<code>type(self).__name__.upper()</code>), <code>alt_bilgi()</code> <code>"-- N satır --"</code> döndürsün; <code>satirlar()</code> ata sınıfta <code>NotImplementedError</code> fırlatsın. Ardından <code>SatisRaporu(veri)</code> alt sınıfını yaz: <code>veri</code> <code>{"Ankara": 350, ...}</code>; satırlar <code>"Ankara: 350"</code> biçiminde, tutara göre azalan.</p>',
    start: 'class Rapor:\n    # buraya yaz\n    pass\n\n\nclass SatisRaporu(Rapor):\n    # buraya yaz\n    pass\n',
    sol: 'class Rapor:\n    def baslik(self):\n        return type(self).__name__.upper()\n\n    def satirlar(self):\n        raise NotImplementedError("alt sınıf satirlar() tanımlamalı")\n\n    def alt_bilgi(self):\n        return f"-- {len(self.satirlar())} satır --"\n\n    def olustur(self):\n        return "\\n".join([self.baslik(), *self.satirlar(), self.alt_bilgi()])\n\n\nclass SatisRaporu(Rapor):\n    def __init__(self, veri):\n        self.veri = veri\n\n    def satirlar(self):\n        sirali = sorted(self.veri.items(), key=lambda kv: kv[1], reverse=True)\n        return [f"{sehir}: {tutar}" for sehir, tutar in sirali]\n',
    tests: 'r = SatisRaporu({"İzmir": 120, "Ankara": 350})\nbeklenen = "SATISRAPORU\\nAnkara: 350\\nİzmir: 120\\n-- 2 satır --"\nassert r.olustur() == beklenen, f"rapor metni farklı:\\n{r.olustur()}"\ntry:\n    Rapor().olustur()\n    assert False, "ata sınıfta satirlar() NotImplementedError fırlatmalı"\nexcept NotImplementedError:\n    pass\nclass StokRaporu(Rapor):\n    def baslik(self):\n        return "Stok"\n    def satirlar(self):\n        return ["kalem: 40"]\nassert StokRaporu().olustur() == "Stok\\nkalem: 40\\n-- 1 satır --", "alt sınıf başlığı ezebilmeli, olustur() akışı aynı kalmalı"\n',
    hints: ['Akışı (<code>olustur</code>) ata sınıf belirler, değişen adımları alt sınıflar ezer: şablon metot (template method) kalıbı.', '<code>"\\n".join([self.baslik(), *self.satirlar(), self.alt_bilgi()])</code>', 'Alt sınıfta <code>sorted(self.veri.items(), key=lambda kv: kv[1], reverse=True)</code>.'],
    why: 'Şablon metot kalıbında algoritmanın iskeleti ata sınıfta bir kez yazılır; alt sınıflar yalnızca farklı olan adımı (<code>satirlar</code>) sağlar, istedikleri varsayılanı (<code>baslik</code>) ezer. <code>NotImplementedError</code> eksik gerçeklemeyi çağrı anında belli eder; daha erken yakalamak istersen <code>abc.abstractmethod</code> ile nesne oluşturulurken hata alınır. Alternatif: kalıtım yerine bileşim, yani <code>olustur(baslik, satirlar_fonk)</code> gibi fonksiyon parametreleri.',
    tags: ['kalıtım', 'template method', 'NotImplementedError'],
    min: 8
  },

  {
    id: 'b-247',
    lv: 'orta',
    topic: 'Kalıtım ve MRO',
    diff: 3,
    kind: 'yaz',
    title: 'İşbirlikçi çoklu kalıtım',
    q: '<p>Kurumun hem çalışan hem yüksek lisans öğrencisi olan personeli var. Dört sınıf yaz: <code>Kisi(ad)</code>, <code>Calisan(Kisi)</code> ek olarak <code>maas</code>, <code>Ogrenci(Kisi)</code> ek olarak <code>okul</code>, <code>CalisanOgrenci(Calisan, Ogrenci)</code>. Tüm <code>__init__</code>\'ler <b>anahtar kelimeli</b> argüman alsın ve <code>super().__init__(**kwargs)</code> ile zinciri sürdürsün; böylece <code>CalisanOgrenci(ad="Ece", maas=20000, okul="ODTÜ")</code> çalışsın ve <code>Kisi.__init__</code> <b>tam bir kez</b> çağrılsın. Sayım için <code>Kisi</code>\'de sınıf özniteliği <code>init_sayisi = 0</code> tut ve her <code>Kisi.__init__</code>\'te artır.</p>',
    start: 'class Kisi:\n    init_sayisi = 0\n    # buraya yaz\n\n\nclass Calisan(Kisi):\n    pass\n\n\nclass Ogrenci(Kisi):\n    pass\n\n\nclass CalisanOgrenci(Calisan, Ogrenci):\n    pass\n',
    sol: 'class Kisi:\n    init_sayisi = 0\n\n    def __init__(self, *, ad, **kwargs):\n        super().__init__(**kwargs)\n        Kisi.init_sayisi += 1\n        self.ad = ad\n\n\nclass Calisan(Kisi):\n    def __init__(self, *, maas, **kwargs):\n        super().__init__(**kwargs)\n        self.maas = maas\n\n\nclass Ogrenci(Kisi):\n    def __init__(self, *, okul, **kwargs):\n        super().__init__(**kwargs)\n        self.okul = okul\n\n\nclass CalisanOgrenci(Calisan, Ogrenci):\n    pass\n',
    tests: 'Kisi.init_sayisi = 0\ne = CalisanOgrenci(ad="Ece", maas=20000, okul="ODTÜ")\nassert (e.ad, e.maas, e.okul) == ("Ece", 20000, "ODTÜ"), "üç alan da atanmalı: her __init__ kendi alanını alıp kalanını super()\'e iletmeli"\nassert Kisi.init_sayisi == 1, f"Kisi.__init__ tam 1 kez çalışmalı, {Kisi.init_sayisi} kez çalıştı (Kisi.__init__(self, ...) yerine super() kullan)"\nc = Calisan(ad="Can", maas=30000)\nassert c.maas == 30000 and c.ad == "Can", "Calisan tek başına da çalışmalı"\nassert [k.__name__ for k in CalisanOgrenci.__mro__] == ["CalisanOgrenci", "Calisan", "Ogrenci", "Kisi", "object"], "MRO beklenen sırada değil"\n',
    hints: ['Her sınıf yalnızca kendi parametresini adıyla alır, geri kalanı <code>**kwargs</code> ile sonraki sınıfa iletir.', '<code>Calisan</code>\'daki <code>super()</code> bir <code>CalisanOgrenci</code> nesnesi için <code>Ogrenci</code>\'ye gider, <code>Kisi</code>\'ye değil.', '<code>def __init__(self, *, maas, **kwargs): super().__init__(**kwargs); self.maas = maas</code>'],
    why: 'MRO <code>CalisanOgrenci → Calisan → Ogrenci → Kisi → object</code> olduğundan her sınıf <code>super()</code> çağırırsa zincir her <code>__init__</code>\'i tam bir kez çalıştırır. Ata sınıfı doğrudan adıyla çağırmak (<code>Kisi.__init__(self, ad)</code>) elmas yapıda Kisi\'yi iki kez çalıştırır ya da Ogrenci\'yi hiç çalıştırmaz. <code>**kwargs</code> ile "kendi argümanını al, gerisini ilet" kuralı işbirlikçi kalıtımın standardıdır. Alternatif: çoklu kalıtım yerine bileşim (CalisanOgrenci içinde <code>calisan</code> ve <code>ogrenci</code> alanları) çoğu zaman daha basittir.',
    tags: ['super', 'MRO', 'kwargs', 'çoklu kalıtım'],
    min: 10
  },

  {
    id: 'b-248',
    lv: 'orta',
    topic: 'Dataclass ve Tip',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'Karşılaştırmaya katılmayan alan',
    q: '<p>Ürün kodları aynıysa ürünler aynı sayılsın diye <code>ad</code> alanı karşılaştırmadan çıkarılmış. Bu kod ne yazdırır?</p>',
    code: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Urun:\n    kod: str\n    ad: str = field(compare=False)\n    fiyat: float = 0\n\nprint(Urun("K1", "Kalem", 10) == Urun("K1", "KALEM", 10))\nprint(Urun("K1", "Kalem", 10) == Urun("K1", "Kalem", 12))\nprint(Urun("K2", "Silgi"))\n',
    o: ['True\nTrue\nUrun(kod=\'K2\', ad=\'Silgi\', fiyat=0)', 'False\nFalse\nUrun(kod=\'K2\', ad=\'Silgi\', fiyat=0)', 'True\nFalse\nUrun(kod=\'K2\', fiyat=0)', 'True\nFalse\nUrun(kod=\'K2\', ad=\'Silgi\', fiyat=0)'],
    a: 3,
    hints: ['<code>compare=False</code> yalnızca <code>__eq__</code>\'i etkiler; <code>repr</code> için ayrı bir parametre (<code>repr=False</code>) vardır.', 'fiyat karşılaştırmaya katılıyor mu?'],
    why: '<code>field(compare=False)</code> alanı üretilen <code>__eq__</code> (ve order varsa sıralama) metotlarından çıkarır; ad farklı olsa da kod ve fiyat aynıysa nesneler eşittir. Fiyat hâlâ karşılaştırmada olduğu için 10 ile 12 eşit değildir. <code>repr</code> etkilenmez; alanı repr\'den de çıkarmak için <code>repr=False</code> gerekir.',
    tags: ['dataclass', 'field', 'compare'],
    min: 3
  },

  {
    id: 'b-249',
    lv: 'orta',
    topic: 'Dataclass ve Tip',
    diff: 2,
    kind: 'rehberli',
    title: 'Kendi toplamını hesaplayan fatura',
    q: '<p><code>Fatura</code> dataclass\'ını yaz: alanlar <code>no: str</code>, <code>kalemler: list[tuple[str, int, float]]</code> (ad, adet, birim fiyat), <code>kdv_orani: float = 0.20</code>. Ayrıca <code>toplam: float</code> alanı olsun ama kurucuda <b>verilmesin</b> (<code>init=False</code>); <code>__post_init__</code> içinde KDV dahil toplam <code>round(..., 2)</code> olarak hesaplansın. Herhangi bir kalemin adedi 1\'den küçükse <code>__post_init__</code> <code>ValueError</code> fırlatsın.</p>',
    guide: ['<code>@dataclass</code> ile alanları tip ipuçlarıyla tanımla.', '<code>toplam: float = field(init=False)</code> ile hesaplanan alanı ekle.', '<code>def __post_init__(self):</code> içinde önce adetleri doğrula.', 'Ara toplamı <code>sum(adet * fiyat ...)</code> ile bul, KDV ekleyip <code>self.toplam</code>\'a ata.'],
    example: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Dikdortgen:\n    en: float\n    boy: float\n    alan: float = field(init=False)\n\n    def __post_init__(self):\n        if self.en <= 0 or self.boy <= 0:\n            raise ValueError("kenarlar pozitif olmalı")\n        self.alan = self.en * self.boy\n\nprint(Dikdortgen(3, 4))\n',
    start: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Fatura:\n    no: str\n    # TODO 1: kalemler ve kdv_orani alanları\n    # TODO 2: toplam alanı (init=False)\n\n    def __post_init__(self):\n        # TODO 3: adetleri doğrula, toplamı hesapla\n        pass\n',
    sol: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Fatura:\n    no: str\n    kalemler: list[tuple[str, int, float]]\n    kdv_orani: float = 0.20\n    toplam: float = field(init=False)\n\n    def __post_init__(self):\n        for ad, adet, _ in self.kalemler:\n            if adet < 1:\n                raise ValueError(f"{ad} için adet en az 1 olmalı")\n        ara = sum(adet * fiyat for _, adet, fiyat in self.kalemler)\n        self.toplam = round(ara * (1 + self.kdv_orani), 2)\n',
    tests: 'f = Fatura("F-001", [("kalem", 10, 7.5), ("defter", 2, 40.0)])\nassert f.toplam == 186.0, f"(75 + 80) * 1.2 = 186.0 bekleniyordu, gelen {getattr(f, \'toplam\', None)}"\nassert Fatura("F-002", [("çanta", 1, 100.0)], kdv_orani=0.10).toplam == 110.0, "kdv_orani parametresi kullanılmalı"\ntry:\n    Fatura("F-003", [("kalem", 0, 5.0)])\n    assert False, "adet 0 olan kalemde ValueError fırlatılmalı"\nexcept ValueError:\n    pass\ntry:\n    Fatura("F-004", [], 0.2, 999)\n    assert False, "toplam kurucuda verilememeli (init=False)"\nexcept TypeError:\n    pass\n',
    hints: ['<code>__post_init__</code>, dataclass\'ın ürettiği <code>__init__</code> alanları atadıktan hemen sonra çağrılır.', '<code>toplam: float = field(init=False)</code> alanı imzadan çıkarır.', '<code>self.toplam = round(sum(a * f for _, a, f in self.kalemler) * (1 + self.kdv_orani), 2)</code>'],
    why: '<code>__post_init__</code>, dataclass\'a kendi <code>__init__</code>\'ini yazmadan doğrulama ve türetilmiş alan hesaplama imkânı verir. <code>init=False</code> alanı kurucudan çıkarır ama <code>repr</code> ve <code>eq</code>\'de tutar. Dikkat: toplam bir kez hesaplanır; kalemler sonradan değişirse güncellenmez. Her zaman güncel olması gerekiyorsa alan yerine <code>@property</code> kullanmak daha doğrudur.',
    tags: ['dataclass', '__post_init__', 'field', 'doğrulama'],
    min: 8
  },

  {
    id: 'b-250',
    lv: 'orta',
    topic: 'Dataclass ve Tip',
    diff: 2,
    kind: 'yaz',
    title: 'Değişmez kayıtlarla toplu zam',
    q: '<p>Bordro sisteminde kayıtlar değiştirilemez (frozen) tutuluyor; zam yeni kayıt üretir. <code>Calisan</code> adlı <b>frozen</b> bir dataclass yaz (<code>ad: str</code>, <code>birim: str</code>, <code>maas: int</code>). Sonra <code>zam_uygula(calisanlar, birim, oran)</code> fonksiyonunu yaz: yalnızca verilen birimdekilerin maaşını <code>round(maas * (1 + oran))</code> yapan <b>yeni</b> bir liste döndürsün; diğerleri aynen kalsın. <code>dataclasses.replace</code> kullan.</p>',
    start: 'from dataclasses import dataclass, replace\n\n# buraya yaz\n',
    sol: 'from dataclasses import dataclass, replace\n\n@dataclass(frozen=True)\nclass Calisan:\n    ad: str\n    birim: str\n    maas: int\n\n\ndef zam_uygula(calisanlar, birim, oran):\n    return [replace(c, maas=round(c.maas * (1 + oran))) if c.birim == birim else c for c in calisanlar]\n',
    tests: 'liste = [Calisan("Ece", "IT", 50000), Calisan("Can", "Satış", 40000), Calisan("Ada", "IT", 45000)]\nyeni = zam_uygula(liste, "IT", 0.15)\nassert [c.maas for c in yeni] == [57500, 40000, 51750], f"IT\'ye %15 zam: [57500, 40000, 51750] bekleniyordu, gelen {[c.maas for c in yeni]}"\nassert liste[0].maas == 50000, "orijinal kayıt değişmemeli"\ntry:\n    liste[0].maas = 1\n    assert False, "Calisan frozen olmalı: alan ataması FrozenInstanceError vermeli"\nexcept AttributeError:\n    pass\nassert yeni[1] is liste[1], "zam almayan kayıt aynı nesne olarak kalabilir"\n',
    hints: ['<code>@dataclass(frozen=True)</code> alanlara atamayı yasaklar.', '<code>replace(nesne, alan=yeni_deger)</code> diğer alanları kopyalayıp yeni nesne üretir.'],
    why: 'Değişmez kayıtlar, aynı nesneyi paylaşan kodların birbirini sürpriz biçimde bozmasını önler; bordro, muhasebe gibi denetim izi gereken alanlarda tercih edilir. <code>replace</code> yeni nesneyi oluştururken <code>__init__</code> ve varsa <code>__post_init__</code> doğrulamalarını yeniden çalıştırır. Alternatif: <code>Calisan(c.ad, c.birim, yeni_maas)</code> ile elle kurmak; alan sayısı arttıkça hataya açıktır.',
    tags: ['dataclass', 'frozen', 'replace'],
    min: 6
  }
);
})(window);
