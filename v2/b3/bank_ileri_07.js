/* PythonPatika — pratik bankası: ileri görevler (b-371 … b-380) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-371',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 3,
    kind: 'rehberli',
    title: 'Doğrulayan tanımlayıcı (descriptor)',
    q: '<p>Ürün kataloğunda fiyat ve stok alanlarının pozitif olması gerekiyor; her sınıfa ayrı ayrı <code>property</code> yazmak yerine yeniden kullanılabilir bir <b>tanımlayıcı</b> (descriptor) yaz. <code>Pozitif</code> sınıfı: <code>__set_name__</code> ile alan adını öğrensin, <code>__set__</code> sıfır ya da negatif değerde <code>ValueError</code> fırlatsın, değeri örneğin <code>__dict__</code>\'inde <code>"_" + ad</code> anahtarıyla saklasın; <code>__get__</code> sınıf üzerinden erişimde (<code>obj is None</code>) tanımlayıcının kendisini, örnekten erişimde değeri döndürsün. <code>Urun</code> sınıfı verilmiştir.</p>',
    guide: ['<code>__set_name__(self, sahip, ad)</code> içinde <code>self.ozel = "_" + ad</code> sakla; Python bunu sınıf oluşurken otomatik çağırır.', '<code>__get__(self, obj, tip=None)</code>: <code>obj is None</code> ise <code>self</code>, değilse <code>obj.__dict__[self.ozel]</code>.', '<code>__set__(self, obj, deger)</code>: <code>deger &lt;= 0</code> ise <code>ValueError</code>; değilse <code>obj.__dict__[self.ozel] = deger</code>.', 'Hata mesajında alan adını göster (ör. "fiyat pozitif olmalı").'],
    example: 'class Buyuk:\n    def __set_name__(self, sahip, ad):\n        self.ad = ad\n    def __get__(self, obj, tip=None):\n        if obj is None:\n            return self\n        return obj.__dict__.get(self.ad, "").upper()\n    def __set__(self, obj, deger):\n        obj.__dict__[self.ad] = deger\n\nclass Sehir:\n    ad = Buyuk()\n\ns = Sehir()\ns.ad = "ankara"\nprint(s.ad, type(Sehir.ad).__name__)\n',
    start: 'class Pozitif:\n    def __set_name__(self, sahip, ad):\n        # TODO 1: saklama anahtarını belirle ("_" + ad)\n        pass\n\n    def __get__(self, obj, tip=None):\n        # TODO 2: sınıftan erişimde self, örnekten erişimde değeri döndür\n        pass\n\n    def __set__(self, obj, deger):\n        # TODO 3: <= 0 ise ValueError, değilse sakla\n        pass\n\n\nclass Urun:\n    fiyat = Pozitif()\n    stok = Pozitif()\n\n    def __init__(self, ad, fiyat, stok):\n        self.ad = ad\n        self.fiyat = fiyat\n        self.stok = stok\n',
    sol: 'class Pozitif:\n    def __set_name__(self, sahip, ad):\n        self.ad = ad\n        self.ozel = "_" + ad\n\n    def __get__(self, obj, tip=None):\n        if obj is None:\n            return self\n        return obj.__dict__[self.ozel]\n\n    def __set__(self, obj, deger):\n        if deger <= 0:\n            raise ValueError(f"{self.ad} pozitif olmalı")\n        obj.__dict__[self.ozel] = deger\n\n\nclass Urun:\n    fiyat = Pozitif()\n    stok = Pozitif()\n\n    def __init__(self, ad, fiyat, stok):\n        self.ad = ad\n        self.fiyat = fiyat\n        self.stok = stok\n',
    tests: 'u = Urun("Kalem", 12.5, 100)\nassert u.fiyat == 12.5 and u.stok == 100, "Değerler okunabilmeli"\nu.stok = 40\nassert u.stok == 40, "Güncelleme çalışmalı"\nassert u.__dict__.get("_stok") == 40, "Değer örneğin __dict__\'inde \'_stok\' anahtarıyla saklanmalı"\nfor alan, kotu in (("fiyat", 0), ("stok", -3)):\n    try:\n        setattr(u, alan, kotu)\n        assert False, f"{alan}={kotu} için ValueError bekleniyordu"\n    except ValueError as e:\n        assert alan in str(e), f"Hata mesajı alan adını (\'{alan}\') içermeli"\ntry:\n    Urun("Silgi", -1, 5)\n    assert False, "__init__ içindeki atama da doğrulanmalı"\nexcept ValueError:\n    pass\nassert isinstance(Urun.fiyat, Pozitif), "Sınıf üzerinden erişim tanımlayıcının kendisini döndürmeli"\nv = Urun("Defter", 30, 7)\nassert u.stok == 40 and v.stok == 7, "Her örnek kendi değerini tutmalı (değeri tanımlayıcıda saklama!)"\n',
    hints: ['Tanımlayıcı sınıf düzeyinde tek nesnedir; değeri <b>self</b>\'te saklarsan tüm örnekler aynı değeri paylaşır.', '<code>obj.__dict__</code> örneğe özgü depodur; anahtarı alan adından farklı (<code>"_fiyat"</code>) seç.', '__get__ başında: <code>if obj is None: return self</code>.'],
    why: 'Veri tanımlayıcısı (__set__ tanımlı) örnek __dict__’inden önce gelir; bu yüzden u.fiyat = x her seferinde __set__’ten geçer ve doğrulama tek yerde toplanır (property’nin genelleştirilmiş hâli). __set_name__ (3.6+) alan adını tekrar yazmadan öğrenmeyi sağlar. Değeri tanımlayıcı nesnesinde saklamak en sık hatadır: tüm örnekler paylaşır. Erişim O(1). Alternatifler: property (tek alan için), pydantic/attrs doğrulayıcıları, dataclass + __post_init__.',
    tags: ['descriptor', '__set_name__', 'doğrulama'],
    min: 10
  },

  {
    id: 'b-372',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 2,
    kind: 'yaz',
    title: 'Para değer nesnesi (value object)',
    q: '<p>Kayan nokta yuvarlama hataları ve TL ile USD\'nin yanlışlıkla toplanması muhasebede sorun çıkarıyor. <code>Para</code> sınıfını yaz: <code>Para(tutar, doviz="TRY")</code> tutarı <code>Decimal(str(tutar))</code> olarak 2 ondalığa (<code>ROUND_HALF_UP</code>) yuvarlayıp saklasın. Desteklenecekler: <code>+</code> (farklı dövizde <code>ValueError</code>), <code>==</code> ve <code>hash</code> (tutar + döviz), <code>&lt;</code> ile karşılaştırma (<code>functools.total_ordering</code> ile diğerleri), <code>repr</code> → <code>Para(\'10.50\', \'TRY\')</code>. Nesne değişmez olsun: tutar ve döviz salt okunur <code>property</code>.</p>',
    start: 'from decimal import Decimal, ROUND_HALF_UP\nfrom functools import total_ordering\n\nclass Para:\n    pass\n',
    sol: 'from decimal import Decimal, ROUND_HALF_UP\nfrom functools import total_ordering\n\n@total_ordering\nclass Para:\n    def __init__(self, tutar, doviz="TRY"):\n        self._tutar = Decimal(str(tutar)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\n        self._doviz = doviz\n\n    @property\n    def tutar(self):\n        return self._tutar\n\n    @property\n    def doviz(self):\n        return self._doviz\n\n    def _ayni_doviz(self, other):\n        if not isinstance(other, Para):\n            return NotImplemented\n        if self.doviz != other.doviz:\n            raise ValueError(f"Farklı döviz: {self.doviz} ve {other.doviz}")\n        return True\n\n    def __add__(self, other):\n        r = self._ayni_doviz(other)\n        if r is NotImplemented:\n            return r\n        return Para(self.tutar + other.tutar, self.doviz)\n\n    def __eq__(self, other):\n        if not isinstance(other, Para):\n            return NotImplemented\n        return (self.tutar, self.doviz) == (other.tutar, other.doviz)\n\n    def __hash__(self):\n        return hash((self.tutar, self.doviz))\n\n    def __lt__(self, other):\n        r = self._ayni_doviz(other)\n        if r is NotImplemented:\n            return r\n        return self.tutar < other.tutar\n\n    def __repr__(self):\n        return f"Para(\'{self.tutar}\', \'{self.doviz}\')"\n',
    tests: 'a = Para(0.1) + Para(0.2)\nassert a == Para("0.30"), "0.1 + 0.2 tam 0.30 olmalı (Decimal(str(...)))"\nassert repr(Para(10.5)) == "Para(\'10.50\', \'TRY\')", f"repr biçimi yanlış: {Para(10.5)!r}"\nassert Para(2.675).tutar == Decimal("2.68"), "ROUND_HALF_UP: 2.675 → 2.68"\ntry:\n    Para(5) + Para(5, "USD")\n    assert False, "Farklı dövizler toplanamaz"\nexcept ValueError:\n    pass\nassert Para(5) < Para(7) and Para(7) >= Para(5), "Karşılaştırma ve total_ordering"\nassert len({Para(1), Para("1.00"), Para(1, "USD")}) == 2, "Eşit nesnelerin hash\'i eşit olmalı"\nassert Para(3) != 3, "Para ile int eşit sayılmamalı"\ntry:\n    Para(1).tutar = 5\n    assert False, "tutar salt okunur olmalı"\nexcept AttributeError:\n    pass\n',
    hints: ['<code>Decimal(str(0.1))</code> → <code>Decimal("0.1")</code>; <code>Decimal(0.1)</code> ise ikili kayan nokta hatasını taşır.', '<code>quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)</code> 2 ondalığa yuvarlar.', '__eq__ tanımlayınca __hash__ None olur; ikisini birlikte tanımla. Para olmayan nesnede <code>NotImplemented</code> döndür.'],
    why: 'Değer nesnesi kimliğiyle değil değeriyle eşittir ve değişmezdir; bu sayede sözlük anahtarı/küme elemanı olabilir (hash tutarlı). Decimal ondalık tabanda tam hesaplar; muhasebede float kullanmak kuruş kayıplarına yol açar. Döviz kontrolü tür sistemi yerine çalışma zamanında yanlış toplamayı engeller. total_ordering yalnız __eq__ ve __lt__’den diğer karşılaştırmaları üretir (küçük bir çağrı maliyetiyle). Alternatif: @dataclass(frozen=True, order=True) daha kısa ama döviz kontrolünü ve yuvarlamayı __post_init__’te yazman gerekir; hazır kütüphane: py-moneyed.',
    tags: ['Decimal', 'total_ordering', '__hash__', 'value object'],
    min: 12
  },

  {
    id: 'b-373',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 2,
    kind: 'bug',
    title: 'Bütün müşterilerin sepeti aynı',
    q: '<p>Kodda bir hata var, bul ve düzelt. Ayşe sepetine çay ekleyince Can\'ın sepetinde de çay görünüyor.</p>',
    start: 'class Sepet:\n    urunler = []\n\n    def __init__(self, musteri):\n        self.musteri = musteri\n\n    def ekle(self, urun):\n        self.urunler.append(urun)\n        return self\n',
    sol: 'class Sepet:\n    def __init__(self, musteri):\n        self.musteri = musteri\n        self.urunler = []\n\n    def ekle(self, urun):\n        self.urunler.append(urun)\n        return self\n',
    tests: 'a = Sepet("Ayşe").ekle("çay")\nc = Sepet("Can").ekle("kahve")\nassert a.urunler == ["çay"], f"Ayşe\'nin sepeti [\'çay\'] olmalı; gelen {a.urunler}. Sınıf niteliği tüm örneklerce paylaşılır"\nassert c.urunler == ["kahve"], f"Can\'ın sepeti [\'kahve\'] olmalı; gelen {c.urunler}"\nassert "urunler" in vars(a), "urunler örnek niteliği olmalı (__init__ içinde self.urunler = [])"\n',
    hints: ['Sınıf gövdesindeki atama sınıfa aittir; tüm örnekler aynı listeyi görür.', 'self.urunler.append önce örnekte arar, bulamazsa sınıftaki listeye ekler.', 'Listeyi <code>__init__</code> içinde <code>self.urunler = []</code> ile oluştur.'],
    why: 'Nitelik araması önce örnek __dict__’ine, sonra sınıfa bakar. append atama değil yerinde değişiklik (mutation) olduğu için sınıftaki tek liste değişir ve herkes etkilenir. Sabitler ve paylaşılması istenen sayaçlar sınıf niteliği olabilir; değiştirilebilir (list, dict, set) durum her zaman __init__ içinde oluşturulmalı. Aynı tuzak def f(x=[]) varsayılan argümanında da vardır. dataclass bunu field(default_factory=list) ile zorunlu kılar.',
    tags: ['sınıf niteliği', 'mutable', '__init__'],
    min: 3
  },

  {
    id: 'b-374',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 3,
    kind: 'yaz',
    title: 'Kendi mini dataclass dekoratörün',
    q: '<p><code>dataclasses</code> modülünü kullanmadan bir sınıf dekoratörü yaz: <code>kayit(cls)</code>, sınıfın tip açıklamalarından (<code>cls.__annotations__</code>, tanım sırasıyla) alan listesini alıp sınıfa üç metot eklesin ve sınıfı döndürsün: <code>__init__</code> (alanları sırayla konumsal ya da adla alır; sınıfta varsayılan değeri olan alan verilmezse o değeri kullanır, verilmeyen zorunlu alanda <code>TypeError</code>), <code>__repr__</code> → <code>Musteri(ad=\'Ayşe\', puan=0)</code>, <code>__eq__</code> (aynı sınıf ve aynı alan değerleri).</p>',
    start: 'def kayit(cls):\n    pass\n',
    sol: 'def kayit(cls):\n    alanlar = list(cls.__dict__.get("__annotations__", {}))\n    yok = object()\n    varsayilan = {a: cls.__dict__.get(a, yok) for a in alanlar}\n\n    def __init__(self, *args, **kwargs):\n        if len(args) > len(alanlar):\n            raise TypeError("Fazla argüman")\n        degerler = dict(zip(alanlar, args))\n        for k, v in kwargs.items():\n            if k not in alanlar:\n                raise TypeError(f"Bilinmeyen alan: {k}")\n            if k in degerler:\n                raise TypeError(f"{k} iki kez verildi")\n            degerler[k] = v\n        for a in alanlar:\n            if a not in degerler:\n                if varsayilan[a] is yok:\n                    raise TypeError(f"Eksik alan: {a}")\n                degerler[a] = varsayilan[a]\n            setattr(self, a, degerler[a])\n\n    def __repr__(self):\n        ic = ", ".join(f"{a}={getattr(self, a)!r}" for a in alanlar)\n        return f"{type(self).__name__}({ic})"\n\n    def __eq__(self, other):\n        if type(other) is not type(self):\n            return NotImplemented\n        return all(getattr(self, a) == getattr(other, a) for a in alanlar)\n\n    cls.__init__ = __init__\n    cls.__repr__ = __repr__\n    cls.__eq__ = __eq__\n    return cls\n',
    tests: '@kayit\nclass Musteri:\n    ad: str\n    sehir: str = "Ankara"\n    puan: int = 0\n\nm = Musteri("Ayşe", puan=5)\nassert (m.ad, m.sehir, m.puan) == ("Ayşe", "Ankara", 5), "Konumsal + adlı argüman ve varsayılan değer"\nassert repr(m) == "Musteri(ad=\'Ayşe\', sehir=\'Ankara\', puan=5)", f"repr yanlış: {m!r}"\nassert Musteri("Can") == Musteri(ad="Can"), "Aynı değerli nesneler eşit olmalı"\nassert Musteri("Can") != Musteri("Can", "İzmir"), "Farklı alan değeri → eşit değil"\ntry:\n    Musteri()\n    assert False, "Zorunlu alan (ad) eksikse TypeError"\nexcept TypeError:\n    pass\ntry:\n    Musteri("A", yas=3)\n    assert False, "Bilinmeyen alan adı TypeError"\nexcept TypeError:\n    pass\nassert "dataclass" not in __source__, "dataclasses kullanma; metotları kendin üret"\n',
    hints: ['Alan sırası: <code>list(cls.__dict__.get("__annotations__", {}))</code>; sözlükler ekleme sırasını korur.', 'Varsayılan değer sınıf niteliği olarak durur: <code>cls.__dict__.get(ad, YOK)</code>; "yok" için özel bir nöbetçi nesne kullan (None geçerli bir varsayılan olabilir).', 'İç fonksiyonları tanımlayıp <code>cls.__init__ = __init__</code> gibi sınıfa ata, sonra <code>return cls</code>.'],
    why: 'Sınıf dekoratörü sınıf oluştuktan sonra onu alıp değiştirir; metaprogramlamanın metaclass’a göre en okunur yoludur. Fonksiyonlar kapanış (closure) ile alan listesini hatırlar. Nöbetçi object() None’u geçerli varsayılan olarak ayırt eder. Gerçek dataclasses kaynak kod üretip exec eder (daha hızlı __init__) ve kalıtım, frozen, order, slots gibi seçenekleri destekler; üretimde onu ya da attrs/pydantic’i kullan. Her işlem alan sayısıyla doğrusal: O(k).',
    tags: ['sınıf dekoratörü', '__annotations__', 'metaprogramlama', 'closure'],
    min: 15
  },

  {
    id: 'b-375',
    lv: 'ileri',
    topic: 'İleri OOP ve Metaprogramlama',
    diff: 2,
    kind: 'rehberli',
    title: 'Hata olursa geri al: işlem bağlam yöneticisi',
    q: '<p>Hesap bakiyelerini tutan bir sözlük üzerinde toplu güncelleme yapılıyor; ortada bir hata çıkarsa <b>hiçbir</b> değişiklik kalmamalı. <code>Islem(hesaplar)</code> bağlam yöneticisi sınıfını yaz: <code>__enter__</code> sözlüğün bir kopyasını (anlık görüntü) alıp sözlüğün kendisini döndürsün; <code>__exit__</code> istisna varsa sözlüğü anlık görüntüye geri döndürsün (aynı nesneyi yerinde: <code>clear</code> + <code>update</code>) ve istisnayı <b>bastırmasın</b> (<code>False</code> döndürsün).</p>',
    guide: ['<code>__init__</code>: sözlüğü <code>self.hesaplar</code> olarak sakla.', '<code>__enter__</code>: <code>self.yedek = dict(self.hesaplar)</code>, sonra <code>return self.hesaplar</code>.', '<code>__exit__(self, tip, deger, iz)</code>: <code>tip is not None</code> ise <code>clear()</code> + <code>update(self.yedek)</code>.', '<code>return False</code> ile istisnanın yukarı çıkmasına izin ver.'],
    example: 'class Gecici:\n    def __init__(self, ayar, anahtar, deger):\n        self.ayar, self.anahtar, self.deger = ayar, anahtar, deger\n    def __enter__(self):\n        self.eski = self.ayar.get(self.anahtar)\n        self.ayar[self.anahtar] = self.deger\n        return self.ayar\n    def __exit__(self, tip, deger, iz):\n        self.ayar[self.anahtar] = self.eski   # her durumda geri yükle\n        return False\n\nayar = {"mod": "canli"}\nwith Gecici(ayar, "mod", "test"):\n    print("içeride:", ayar)\nprint("dışarıda:", ayar)\n',
    start: 'class Islem:\n    def __init__(self, hesaplar):\n        self.hesaplar = hesaplar\n\n    def __enter__(self):\n        # TODO 1: anlık görüntü al, sözlüğü döndür\n        return self.hesaplar\n\n    def __exit__(self, tip, deger, iz):\n        # TODO 2: hata varsa sözlüğü yerinde geri yükle\n        # TODO 3: istisnayı bastırma\n        return True\n',
    sol: 'class Islem:\n    def __init__(self, hesaplar):\n        self.hesaplar = hesaplar\n\n    def __enter__(self):\n        self.yedek = dict(self.hesaplar)\n        return self.hesaplar\n\n    def __exit__(self, tip, deger, iz):\n        if tip is not None:\n            self.hesaplar.clear()\n            self.hesaplar.update(self.yedek)\n        return False\n',
    tests: 'h = {"TR1": 500, "TR2": 100}\nref = h\nwith Islem(h) as d:\n    d["TR1"] -= 200\n    d["TR2"] += 200\nassert h == {"TR1": 300, "TR2": 300}, "Hata yoksa değişiklikler kalmalı"\ntry:\n    with Islem(h) as d:\n        d["TR1"] -= 1000\n        d["TR3"] = 1000\n        raise ValueError("limit aşıldı")\n    assert False, "İstisna bastırılmamalı (__exit__ False döndürmeli)"\nexcept ValueError:\n    pass\nassert h == {"TR1": 300, "TR2": 300}, f"Hata sonrası tüm değişiklikler geri alınmalı (TR3 de silinmeli); gelen {h}"\nassert h is ref, "Aynı sözlük nesnesi yerinde geri yüklenmeli (yeni sözlük atama)"\n',
    hints: ['Sığ kopya: <code>dict(self.hesaplar)</code> değerler sayı olduğu için yeterli.', 'Yeni anahtarları da silmek için önce <code>clear()</code>, sonra <code>update(yedek)</code>.', '<code>__exit__</code> doğru (True) döndürürse istisna yutulur; burada <code>False</code> döndür.'],
    why: 'Bağlam yöneticisi "kaynak al - kullan - her durumda temizle" kalıbını garanti eder; __exit__ istisna bilgisini (tip, değer, iz) alır ve True döndürürse istisnayı bastırır — hataları gizlememek için genelde False döndürülür. Yerinde geri yükleme, sözlüğe başka yerlerden tutulan referansların da tutarlı kalmasını sağlar. Anlık görüntü O(n) bellek/zaman; büyük durumlarda yalnız değişen anahtarları kaydeden bir günlük (undo log) daha verimlidir. Veritabanlarında aynı fikir transaction/ROLLBACK; fonksiyon tabanlı alternatif contextlib.contextmanager.',
    tags: ['context manager', '__exit__', 'rollback'],
    min: 7
  },

  {
    id: 'b-376',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    title: '__new__ ile tekil (singleton) tuzağı',
    q: '<p>Uygulama ayarlarını tekil nesneyle tutan bu kod ne yazdırır?</p>',
    code: 'class Ayar:\n    _ornek = None\n\n    def __new__(cls, *args, **kwargs):\n        if cls._ornek is None:\n            cls._ornek = super().__new__(cls)\n        return cls._ornek\n\n    def __init__(self, ortam):\n        self.ortam = ortam\n\na = Ayar("test")\nb = Ayar("canli")\nprint(a is b, a.ortam)\n',
    o: ['True canli', 'True test', 'False test', 'False canli'],
    a: 0,
    hints: ['__new__ aynı nesneyi döndürse de Python her çağrıda __init__\'i yeniden çalıştırır.', 'İkinci çağrı aynı nesnenin ortam alanının üzerine yazar.'],
    why: 'Ayar(...) çağrısı önce __new__’i, dönen nesne o sınıfın örneğiyse __init__’i çalıştırır. __new__ hep aynı nesneyi verdiği için a is b True’dur ama __init__ ikinci kez çalışıp ortam’ı "canli" yapar — gizli bir durum değişikliği. Python’da tekil için en sade yol modül düzeyinde tek bir nesne oluşturmaktır (modüller zaten bir kez yüklenir); ya da functools.cache ile sarılmış bir fabrika fonksiyonu. Tekiller test edilebilirliği düşürür; bağımlılık enjeksiyonu çoğu zaman daha iyidir.',
    tags: ['singleton', '__new__', '__init__'],
    min: 3
  },

  {
    id: 'b-377',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 1,
    kind: 'order',
    t: 'order',
    title: 'Değiştirilebilir strateji sözlüğü',
    q: '<p>Müşteri segmentine göre fiyatlama stratejisi seçen, strateji tablosunu varsayılan argümanla enjekte eden programın satırlarını sırala.</p>',
    lines: ['STRATEJI = {"standart": lambda t: t, "premium": lambda t: t * 0.9}', 'def fiyatla(tutar, segment, strateji=STRATEJI):', '    hesapla = strateji.get(segment, strateji["standart"])', '    return round(hesapla(tutar), 2)', 'print(fiyatla(200, "premium"), fiyatla(200, "bilinmeyen"))'],
    expect: '180.0 200\n',
    hints: ['Varsayılan argüman değeri fonksiyon TANIMLANDIĞI anda hesaplanır; tablo önce var olmalı.', 'Stratejiyi seç, sonra uygula.'],
    why: 'Strateji kalıbında algoritmalar birbirinin yerine geçebilen nesnelerdir; Python’da fonksiyonlar birinci sınıf olduğundan bir sözlük yeterlidir, if/elif zinciri gerekmez ve yeni segment eklemek tek satırdır (açık/kapalı ilkesi). strateji parametresi testte farklı bir tablo vermeyi sağlar (bağımlılık enjeksiyonu). Bilinmeyen segment için güvenli varsayılan seçilir. Karmaşıklık O(1) seçim.',
    tags: ['strateji', 'dict dispatch', 'dependency injection'],
    min: 2
  },

  {
    id: 'b-378',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 2,
    kind: 'rehberli',
    title: 'Eski kargo API\'si için adaptör',
    q: '<p>Anadolu Market yeni kodu <code>fiyat_al(desi) -&gt; float (TL)</code> arayüzünü bekliyor. Eski kargo firmasının istemcisi ise <code>EskiKargo().hesapla({"agirlik_kg": ..., "tip": "STD"})</code> çağrısıyla <code>{"durum": "OK", "ucret_kurus": 4590}</code> döndürüyor. <code>KargoAdaptoru(eski)</code> sınıfını yaz: <code>fiyat_al(desi)</code> desiyi kg\'a çevirsin (<b>1 desi = 1/3 kg</b>, 2 ondalık), eski istemciyi çağırsın, <code>durum</code> "OK" değilse <code>RuntimeError</code> fırlatsın, kuruşu TL\'ye çevirip float döndürsün.</p>',
    guide: ['<code>__init__</code>\'te eski istemciyi <code>self.eski</code> olarak sakla (kalıtım değil, bileşim).', 'kg = <code>round(desi / 3, 2)</code>; istek sözlüğünü <code>{"agirlik_kg": kg, "tip": "STD"}</code> olarak kur.', 'Yanıtta <code>durum != "OK"</code> ise <code>RuntimeError</code>.', '<code>ucret_kurus / 100</code> değerini döndür.'],
    example: 'class EskiTermometre:\n    def oku_f(self):\n        return 98.6   # Fahrenheit\n\nclass SantigratAdaptoru:\n    def __init__(self, eski):\n        self.eski = eski\n    def sicaklik(self):\n        return round((self.eski.oku_f() - 32) * 5 / 9, 1)\n\nprint(SantigratAdaptoru(EskiTermometre()).sicaklik())\n',
    start: 'class EskiKargo:\n    def hesapla(self, istek):\n        kg = istek["agirlik_kg"]\n        if kg <= 0:\n            return {"durum": "HATA", "ucret_kurus": 0}\n        return {"durum": "OK", "ucret_kurus": int(2990 + kg * 800)}\n\n\nclass KargoAdaptoru:\n    def __init__(self, eski):\n        self.eski = eski\n\n    def fiyat_al(self, desi):\n        # TODO 1: desiyi kg\'a çevir (1/3, 2 ondalık)\n        # TODO 2: eski istemciyi doğru biçimdeki istekle çağır\n        # TODO 3: durum OK değilse RuntimeError\n        # TODO 4: kuruşu TL\'ye çevirip döndür\n        return 0.0\n',
    sol: 'class EskiKargo:\n    def hesapla(self, istek):\n        kg = istek["agirlik_kg"]\n        if kg <= 0:\n            return {"durum": "HATA", "ucret_kurus": 0}\n        return {"durum": "OK", "ucret_kurus": int(2990 + kg * 800)}\n\n\nclass KargoAdaptoru:\n    def __init__(self, eski):\n        self.eski = eski\n\n    def fiyat_al(self, desi):\n        kg = round(desi / 3, 2)\n        yanit = self.eski.hesapla({"agirlik_kg": kg, "tip": "STD"})\n        if yanit["durum"] != "OK":\n            raise RuntimeError(f"Kargo hatası: {yanit[\'durum\']}")\n        return yanit["ucret_kurus"] / 100\n',
    tests: 'k = KargoAdaptoru(EskiKargo())\nassert k.fiyat_al(6) == 45.9, f"6 desi = 2 kg → 2990 + 1600 = 4590 kuruş = 45.9 TL; gelen {k.fiyat_al(6)}"\nassert k.fiyat_al(3) == 37.9, "3 desi = 1 kg → 37.9 TL"\nassert isinstance(k.fiyat_al(1), float), "float TL döndür"\ntry:\n    k.fiyat_al(0)\n    assert False, "Eski API HATA döndürürse RuntimeError"\nexcept RuntimeError:\n    pass\nclass _Sahte:\n    def __init__(self):\n        self.istekler = []\n    def hesapla(self, istek):\n        self.istekler.append(istek)\n        return {"durum": "OK", "ucret_kurus": 100}\ns = _Sahte()\nKargoAdaptoru(s).fiyat_al(5)\nassert s.istekler == [{"agirlik_kg": 1.67, "tip": "STD"}], f"İstek biçimi yanlış: {s.istekler}"\n',
    hints: ['Adaptör eski nesneyi sarar (bileşim); yeni arayüzü kendisi sunar.', '<code>yanit = self.eski.hesapla({"agirlik_kg": kg, "tip": "STD"})</code>', 'Kuruş → TL: <code>yanit["ucret_kurus"] / 100</code>'],
    why: 'Adaptör (yapısal kalıp) uyumsuz bir arayüzü, istemci kodunu değiştirmeden beklenen arayüze çevirir; birim dönüşümleri (desi→kg, kuruş→TL) ve hata modeli (durum kodu → istisna) tek yerde toplanır. Bileşim sayesinde testte eski istemci yerine sahte nesne verilebilir (yukarıdaki _Sahte). Eski sistem değiştiğinde yalnız adaptör güncellenir. Maliyet O(1). Python’da resmî arayüz için typing.Protocol ile fiyat_al imzası tanımlanabilir.',
    tags: ['adaptör', 'bileşim', 'arayüz'],
    min: 6
  },

  {
    id: 'b-379',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 2,
    kind: 'tamamla',
    title: 'Geri alınabilir komutlar (Command)',
    q: '<p>Depo yönetim ekranında stok işlemleri geri alınabilmeli. Her komut <code>uygula()</code> ve <code>geri_al()</code> metotlarına sahip; <code>KomutYoneticisi</code> çalışan komutları bir yığında (stack) tutar ve <code>geri_al()</code> en son komutu geri alır. <code>___</code> boşluklarını doldur.</p>',
    start: 'class StokEkle:\n    def __init__(self, stok, urun, adet):\n        self.stok, self.urun, self.adet = stok, urun, adet\n\n    def uygula(self):\n        self.stok[self.urun] = self.stok.get(self.urun, 0) + self.adet\n\n    def geri_al(self):\n        self.stok[self.urun] -= self.adet\n\n\nclass KomutYoneticisi:\n    def __init__(self):\n        self.gecmis = []\n\n    def calistir(self, komut):\n        komut.uygula()\n        self.gecmis.___(komut)\n\n    def geri_al(self):\n        if not self.gecmis:\n            return False\n        self.gecmis.___().geri_al()\n        return True\n',
    sol: 'class StokEkle:\n    def __init__(self, stok, urun, adet):\n        self.stok, self.urun, self.adet = stok, urun, adet\n\n    def uygula(self):\n        self.stok[self.urun] = self.stok.get(self.urun, 0) + self.adet\n\n    def geri_al(self):\n        self.stok[self.urun] -= self.adet\n\n\nclass KomutYoneticisi:\n    def __init__(self):\n        self.gecmis = []\n\n    def calistir(self, komut):\n        komut.uygula()\n        self.gecmis.append(komut)\n\n    def geri_al(self):\n        if not self.gecmis:\n            return False\n        self.gecmis.pop().geri_al()\n        return True\n',
    tests: 'stok = {"çay": 10}\ny = KomutYoneticisi()\ny.calistir(StokEkle(stok, "çay", 5))\ny.calistir(StokEkle(stok, "kahve", 3))\nassert stok == {"çay": 15, "kahve": 3}, "Komutlar uygulanmalı"\nassert y.geri_al() is True and stok == {"çay": 15, "kahve": 0}, "İlk geri alma EN SON komutu (kahve) geri almalı"\nassert y.geri_al() is True and stok["çay"] == 10, "Sonra çay işlemi geri alınmalı"\nassert y.geri_al() is False, "Geçmiş boşken False"\n',
    hints: ['Yığın: son giren ilk çıkar (LIFO).', 'Listeye sondan eklemek <code>append</code>, sondan çıkarmak <code>pop()</code>.', '<code>self.gecmis.append(komut)</code> ve <code>self.gecmis.pop().geri_al()</code>'],
    why: 'Komut kalıbı bir işlemi nesneye çevirir: kuyruğa alınabilir, günlüğe yazılabilir, geri alınabilir. Geri alma LIFO olmalı, çünkü sonraki komutlar öncekilerin sonucuna dayanabilir. list.append/pop sonda O(1). İleri alma (redo) için ikinci bir yığın eklenir ve yeni bir komut çalışınca o yığın temizlenir. Bellek sınırı gerekiyorsa collections.deque(maxlen=N) kullanılır.',
    tags: ['command', 'undo', 'stack'],
    min: 3
  },

  {
    id: 'b-380',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 2,
    kind: 'yaz',
    title: 'Sipariş durum makinesi (State)',
    q: '<p>Sipariş yaşam döngüsü: <code>yeni</code> → (<code>ode</code>) → <code>odendi</code> → (<code>kargola</code>) → <code>kargoda</code> → (<code>teslim</code>) → <code>teslim_edildi</code>. Ayrıca <code>yeni</code> ve <code>odendi</code> durumlarından <code>iptal</code> olayıyla <code>iptal</code> durumuna geçilebilir. <code>Siparis</code> sınıfını yaz: <code>durum</code> niteliği <code>"yeni"</code> başlar; <code>ilerle(olay)</code> geçerli geçişte durumu güncelleyip yeni durumu döndürür, geçersizde <code>ValueError</code> fırlatır ve durumu değiştirmez; <code>gecmis</code> listesi tüm durumları sırayla tutar (ilk eleman "yeni"). Geçişleri bir sözlük tablosunda tut.</p>',
    start: 'class Siparis:\n    pass\n',
    sol: 'class Siparis:\n    GECISLER = {\n        ("yeni", "ode"): "odendi",\n        ("yeni", "iptal"): "iptal",\n        ("odendi", "kargola"): "kargoda",\n        ("odendi", "iptal"): "iptal",\n        ("kargoda", "teslim"): "teslim_edildi",\n    }\n\n    def __init__(self):\n        self.durum = "yeni"\n        self.gecmis = ["yeni"]\n\n    def ilerle(self, olay):\n        anahtar = (self.durum, olay)\n        if anahtar not in self.GECISLER:\n            raise ValueError(f"\'{self.durum}\' durumunda \'{olay}\' yapılamaz")\n        self.durum = self.GECISLER[anahtar]\n        self.gecmis.append(self.durum)\n        return self.durum\n',
    tests: 's = Siparis()\nassert s.durum == "yeni"\nassert s.ilerle("ode") == "odendi"\nassert s.ilerle("kargola") == "kargoda"\ntry:\n    s.ilerle("iptal")\n    assert False, "Kargodaki sipariş iptal edilemez"\nexcept ValueError:\n    pass\nassert s.durum == "kargoda", "Geçersiz olay durumu değiştirmemeli"\ns.ilerle("teslim")\nassert s.gecmis == ["yeni", "odendi", "kargoda", "teslim_edildi"], f"Geçmiş yanlış: {s.gecmis}"\nt = Siparis()\nassert t.ilerle("iptal") == "iptal"\ntry:\n    t.ilerle("ode")\n    assert False, "İptal edilmiş sipariş ödenemez"\nexcept ValueError:\n    pass\nassert Siparis().gecmis == ["yeni"], "Her siparişin geçmişi ayrı olmalı"\n',
    hints: ['Anahtarı <code>(mevcut_durum, olay)</code>, değeri yeni durum olan bir sözlük kur.', 'Anahtar tabloda yoksa önce hata fırlat, sonra durumu değiştir (sıra önemli).', 'gecmis listesini <code>__init__</code> içinde oluştur, sınıf düzeyinde değil.'],
    why: 'Geçiş tablosu iş kurallarını veriye çevirir: yeni bir durum eklemek if/elif labirentini değiştirmek yerine tabloya satır eklemektir, geçerli geçişler de tek bakışta görülür. Arama O(1). Klasik State kalıbında her durum ayrı bir sınıftır ve davranış (ör. iptal ücreti) duruma göre değişir; davranış farkı yoksa tablo daha sadedir. Geçmiş, denetim izi (audit log) sağlar. Hazır alternatif: transitions kütüphanesi; veritabanında durum sütunu + CHECK kısıtı.',
    tags: ['state machine', 'durum', 'geçiş tablosu'],
    min: 8
  }
);
})(window);
