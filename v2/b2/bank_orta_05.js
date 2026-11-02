/* PythonPatika — pratik bankası (orta): Dataclass ve Tip, Hata Tasarımı ve Logging, collections/itertools (b-251…b-260) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-251',
    lv: 'orta',
    topic: 'Dataclass ve Tip',
    diff: 1,
    kind: 'bug',
    title: 'Varsayılanlı alandan sonra zorunlu alan',
    q: '<p>Hatayı bul ve düzelt. Bir geliştirici <code>Randevu</code> dataclass\'ına yeni bir zorunlu alan (<code>doktor</code>) ekledi; şimdi modül yüklenirken <code>TypeError: non-default argument \'doktor\' follows default argument</code> hatası alınıyor. Alanların anlamını değiştirmeden düzelt: <code>hasta</code> ve <code>doktor</code> zorunlu, <code>sure_dk</code> varsayılan 15.</p>',
    start: 'from dataclasses import dataclass\n\n@dataclass\nclass Randevu:\n    hasta: str\n    sure_dk: int = 15\n    doktor: str\n',
    sol: 'from dataclasses import dataclass\n\n@dataclass\nclass Randevu:\n    hasta: str\n    doktor: str\n    sure_dk: int = 15\n',
    tests: 'r = Randevu("Ali Kaya", "Dr. Ece Demir")\nassert r.doktor == "Dr. Ece Demir" and r.sure_dk == 15, "hasta ve doktor konumsal verilmeli, süre varsayılan 15"\nassert Randevu("A", "B", 30).sure_dk == 30, "süre üçüncü konumsal argüman olmalı"\n',
    hints: ['Üretilen <code>__init__</code>, alanları tanım sırasıyla parametre yapar.', 'Fonksiyonlarda olduğu gibi, varsayılanı olmayan parametreler varsayılanlılardan önce gelmeli.'],
    why: 'Dataclass alan sırasını <code>__init__(self, hasta, sure_dk=15, doktor)</code> imzasına çevirmeye çalışır; Python\'da varsayılanlı parametreden sonra varsayılansız parametre olamaz. Çözüm alanları yeniden sıralamak. Sırayı korumak zorundaysan (ör. geriye dönük uyumluluk) Python 3.10+ <code>@dataclass(kw_only=True)</code> ya da alan bazında <code>field(kw_only=True)</code> kullanılabilir; o zaman o alanlar yalnızca adla verilir.',
    tags: ['dataclass', 'alan sırası', 'kw_only'],
    min: 2
  },

  {
    id: 'b-252',
    lv: 'orta',
    topic: 'Dataclass ve Tip',
    diff: 2,
    kind: 'tamamla',
    title: 'Öncelikli destek talepleri kuyruğu',
    q: '<p>Destek talepleri önce önceliğe (<code>"kritik"</code> &gt; <code>"yuksek"</code> &gt; <code>"normal"</code>), eşitse açılış saatine göre (erken olan önce) sıralanmalı. <code>Talep</code> dataclass\'ı <code>order=True</code> ile sıralanıyor; karşılaştırma yalnızca gizli <code>sira</code> alanıyla yapılsın. <code>__post_init__</code>\'teki boşluğu tamamla.</p>',
    start: 'from dataclasses import dataclass, field\n\nONCELIK = {"kritik": 0, "yuksek": 1, "normal": 2}\n\n@dataclass(order=True)\nclass Talep:\n    sira: tuple = field(init=False, repr=False)\n    no: int = field(compare=False)\n    oncelik: str = field(compare=False)\n    saat: str = field(compare=False)\n\n    def __post_init__(self):\n        self.sira = ___\n',
    sol: 'from dataclasses import dataclass, field\n\nONCELIK = {"kritik": 0, "yuksek": 1, "normal": 2}\n\n@dataclass(order=True)\nclass Talep:\n    sira: tuple = field(init=False, repr=False)\n    no: int = field(compare=False)\n    oncelik: str = field(compare=False)\n    saat: str = field(compare=False)\n\n    def __post_init__(self):\n        self.sira = (ONCELIK[self.oncelik], self.saat)\n',
    tests: 't = [Talep(1, "normal", "09:00"), Talep(2, "kritik", "10:30"), Talep(3, "yuksek", "08:15"), Talep(4, "kritik", "09:45")]\nr = [x.no for x in sorted(t)]\nassert r == [4, 2, 3, 1], f"sıra: önce kritik (erken saat önce), sonra yuksek, sonra normal: [4, 2, 3, 1] bekleniyordu, gelen {r}"\nassert "sira" not in repr(t[0]), "sira alanı repr\'de görünmemeli"\n',
    hints: ['<code>sira</code> bir demet olmalı: önce önceliğin sayısal karşılığı, sonra saat.', '<code>(ONCELIK[self.oncelik], self.saat)</code>'],
    why: '<code>order=True</code> alanları tanım sırasıyla demet gibi karşılaştırır; diğer alanlar <code>compare=False</code> olduğundan yalnızca <code>sira</code> belirleyicidir. Sözlükle öncelik metnini sayıya çevirmek "kritik &lt; normal" gibi alfabetik sıralama tuzağını önler; "HH:MM" metinleri de sabit uzunlukta olduğundan doğru sıralanır. Alternatif: dataclass\'ı sade bırakıp <code>sorted(t, key=lambda x: (ONCELIK[x.oncelik], x.saat))</code> demek; sıralama tek yerde gerekiyorsa daha basittir. <code>heapq</code> ile öncelik kuyruğu kurarken ise <code>order=True</code> yaklaşımı çok işe yarar.',
    tags: ['dataclass', 'order', '__post_init__', 'sıralama'],
    min: 5
  },

  {
    id: 'b-253',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'try / except / else / finally sırası',
    q: '<p>Bir hesaplama fonksiyonu tüm blokları kullanıyor. Bu kod ne yazdırır?</p>',
    code: 'def isle(x):\n    try:\n        sonuc = 100 / x\n    except ZeroDivisionError:\n        print("sıfır")\n        return -1\n    else:\n        print("başarılı")\n        return sonuc\n    finally:\n        print("kapat")\n\nprint(isle(0))\nprint(isle(4))\n',
    o: ['sıfır\n-1\nkapat\nbaşarılı\n25.0\nkapat', 'sıfır\nkapat\n-1\nbaşarılı\nkapat\n25.0', 'sıfır\n-1\nbaşarılı\n25.0', 'sıfır\nkapat\n-1\nbaşarılı\n25.0\nkapat'],
    a: 1,
    hints: ['<code>finally</code>, <code>return</code> olsa bile fonksiyondan çıkmadan ÖNCE çalışır.', 'Dönen değeri yazdıran <code>print</code> fonksiyonun dışında; fonksiyon tamamen bittikten sonra çalışır.'],
    why: '<code>return -1</code> değeri hazırlanır ama fonksiyondan çıkmadan önce <code>finally</code> çalışır ("kapat"); ardından dıştaki <code>print</code> -1\'i basar. Hata olmadığında <code>else</code> çalışır ("başarılı"), yine <code>finally</code> ("kapat") ve sonra 25.0. <code>else</code> bloğu, yalnızca hata olmadığında çalışacak kodu <code>try</code> dışına alarak yanlışlıkla başka hataları yakalamayı önler; <code>finally</code> dosya/bağlantı kapatma gibi temizlik içindir.',
    tags: ['try', 'finally', 'else', 'akış'],
    min: 3
  },

  {
    id: 'b-254',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 2,
    t: 'order',
    kind: 'order',
    title: 'Ödeme hataları hiyerarşisi',
    q: '<p>Anadolu Bank ödeme modülü için bir ata hata sınıfı ve ondan türeyen <code>YetersizBakiye</code> sınıfını tanımlayıp, ata sınıf üzerinden yakalayan programı sırala. Ata sınıf ortak <code>kod</code> özniteliğini taşır, alt sınıf kendi mesajını kurar.</p>',
    lines: ['class OdemeHatasi(Exception):', '    kod = "ODEME"', 'class YetersizBakiye(OdemeHatasi):', '    def __init__(self, eksik):', '        super().__init__(f"{eksik} TL eksik")', 'try:', '    raise YetersizBakiye(30)', 'except OdemeHatasi as e:', '    print(type(e).__name__, e.kod, e)'],
    tests: 'assert "kod" in vars(OdemeHatasi), "kod özniteliği ata sınıfta (OdemeHatasi) tanımlanmalı"\nassert "__init__" in vars(YetersizBakiye), "mesajı kuran __init__ alt sınıfta olmalı"\n',
    expect: 'YetersizBakiye ODEME 30 TL eksik\n',
    hint: 'Alt sınıf ata sınıfı kullandığı için önce ata tanımlanır; except, ata sınıfı yakalayarak tüm alt türleri kapsar.',
    hints: ['Alt sınıf ata sınıfı kullandığı için önce ata tanımlanır; except, ata sınıfı yakalayarak tüm alt türleri kapsar.'],
    why: 'Kendi hata hiyerarşini kurmak, çağıranın "tüm ödeme hatalarını" tek <code>except OdemeHatasi</code> ile, özel bir durumu ise <code>except YetersizBakiye</code> ile yakalamasını sağlar. <code>super().__init__(mesaj)</code> çağrısı <code>str(e)</code>\'nin anlamlı olmasını sağlar. Kural: kütüphanenin dışarı attığı hatalar ortak bir atadan türemeli, böylece kullanıcılar <code>except Exception</code> gibi aşırı geniş yakalamalara mecbur kalmaz.',
    tags: ['exception', 'hiyerarşi', 'super'],
    min: 4
  },

  {
    id: 'b-255',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 2,
    kind: 'rehberli',
    title: 'Tekrarlanmayan logger kurulumu',
    q: '<p>Bir servis modülü her yeniden yüklendiğinde logger\'a yeni handler ekliyor ve her mesaj log\'da iki-üç kez görünüyor. <code>logger_kur(ad, akis, seviye=logging.INFO)</code> fonksiyonunu yaz: <code>logging.getLogger(ad)</code> ile logger al, <b>var olan handler\'ları temizle</b>, <code>akis</code>\'a (bir dosya benzeri nesne) yazan bir <code>StreamHandler</code> ekle, biçimi <code>"%(levelname)s | %(name)s | %(message)s"</code> yap, seviyeyi ayarla, <code>propagate = False</code> yap ve logger\'ı döndür.</p>',
    guide: ['<code>logger = logging.getLogger(ad)</code>: aynı ad her zaman aynı logger nesnesini verir.', '<code>logger.handlers.clear()</code> ile önceki handler\'ları kaldır.', '<code>h = logging.StreamHandler(akis)</code>; <code>h.setFormatter(logging.Formatter(...))</code>; <code>logger.addHandler(h)</code>.', '<code>logger.setLevel(seviye)</code> ve <code>logger.propagate = False</code>; sonra logger\'ı döndür.'],
    example: 'import logging, io\nakis = io.StringIO()\nlog = logging.getLogger("ornek")\nh = logging.StreamHandler(akis)\nh.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))\nlog.addHandler(h)\nlog.setLevel(logging.DEBUG)\nlog.propagate = False\nlog.debug("hazır")\nprint(akis.getvalue())   # DEBUG: hazır\n',
    start: 'import logging\n\ndef logger_kur(ad, akis, seviye=logging.INFO):\n    logger = logging.getLogger(ad)\n    # TODO 1: eski handler\'ları temizle\n    # TODO 2: akis\'a yazan StreamHandler ve Formatter ekle\n    # TODO 3: seviye ve propagate ayarla\n    return logger\n',
    sol: 'import logging\n\ndef logger_kur(ad, akis, seviye=logging.INFO):\n    logger = logging.getLogger(ad)\n    logger.handlers.clear()\n    h = logging.StreamHandler(akis)\n    h.setFormatter(logging.Formatter("%(levelname)s | %(name)s | %(message)s"))\n    logger.addHandler(h)\n    logger.setLevel(seviye)\n    logger.propagate = False\n    return logger\n',
    tests: 'import io\nakis = io.StringIO()\nlogger_kur("odeme", akis)\nlog = logger_kur("odeme", akis)\nlog.info("ödeme alındı: 150 TL")\nlog.debug("ayrıntı")\nsatirlar = akis.getvalue().splitlines()\nassert satirlar == ["INFO | odeme | ödeme alındı: 150 TL"], f"tek satır bekleniyordu (iki kez kurulsa bile handler çoğalmamalı, DEBUG INFO seviyesinde görünmemeli), gelen: {satirlar}"\nassert len(log.handlers) == 1, "logger\'da tam 1 handler olmalı"\nassert log.propagate is False, "propagate False olmalı ki kök logger aynı mesajı tekrar basmasın"\nakis2 = io.StringIO()\nlogger_kur("rapor", akis2, logging.DEBUG).debug("ayrıntı")\nassert akis2.getvalue() == "DEBUG | rapor | ayrıntı\\n", "seviye parametresi uygulanmalı"\n',
    hints: ['Sorun, <code>getLogger</code>\'ın her çağrıda AYNI nesneyi döndürmesi ve <code>addHandler</code>\'ın üst üste eklemesi.', '<code>logger.handlers.clear()</code> önce gelmeli.', 'Formatter\'ı handler\'a ver: <code>h.setFormatter(logging.Formatter("%(levelname)s | %(name)s | %(message)s"))</code>.'],
    why: '<code>logging.getLogger(ad)</code> süreç boyunca tekil (singleton) bir nesne döndürür; kurulum fonksiyonu tekrar çağrılırsa handler\'lar birikir ve her mesaj çoğalır. Temizlemek ve <code>propagate=False</code> ile kök logger\'a iletimi kesmek bunu önler. Büyük projelerde tercih edilen yol, yapılandırmayı uygulama girişinde bir kez <code>logging.config.dictConfig</code> ile yapmak ve modüllerde yalnızca <code>log = logging.getLogger(__name__)</code> demektir.',
    tags: ['logging', 'handler', 'formatter'],
    min: 8
  },

  {
    id: 'b-256',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 2,
    kind: 'yaz',
    title: 'Kök nedeni koruyan ayar okuyucu',
    q: '<p>Servis, ayarlarını JSON metninden okuyor. <code>AyarHatasi(Exception)</code> sınıfını ve <code>ayar_oku(metin)</code> fonksiyonunu yaz:</p><ul><li>JSON bozuksa <code>AyarHatasi("geçersiz ayar dosyası")</code> fırlat ve asıl hatayı <b>zincirle</b> (<code>raise ... from e</code>).</li><li><code>"veritabani"</code> anahtarı yoksa <code>AyarHatasi("eksik anahtar: veritabani")</code> fırlat.</li><li>Her şey yolundaysa sözlüğü döndür; <code>"zaman_asimi"</code> yoksa 30 olarak ekle.</li></ul>',
    start: 'import json\n\n# buraya yaz\n',
    sol: 'import json\n\n\nclass AyarHatasi(Exception):\n    pass\n\n\ndef ayar_oku(metin):\n    try:\n        ayar = json.loads(metin)\n    except json.JSONDecodeError as e:\n        raise AyarHatasi("geçersiz ayar dosyası") from e\n    if "veritabani" not in ayar:\n        raise AyarHatasi("eksik anahtar: veritabani")\n    ayar.setdefault("zaman_asimi", 30)\n    return ayar\n',
    tests: 'import json as _j\nassert ayar_oku(\'{"veritabani": "pg://db"}\') == {"veritabani": "pg://db", "zaman_asimi": 30}, "varsayılan zaman_asimi 30 eklenmeli"\nassert ayar_oku(\'{"veritabani": "x", "zaman_asimi": 5}\')["zaman_asimi"] == 5, "var olan değer ezilmemeli"\ntry:\n    ayar_oku(\'{"veritabani": \')\n    assert False, "bozuk JSON AyarHatasi fırlatmalı"\nexcept AyarHatasi as e:\n    assert str(e) == "geçersiz ayar dosyası", "mesaj \'geçersiz ayar dosyası\' olmalı"\n    assert isinstance(e.__cause__, _j.JSONDecodeError), "asıl JSONDecodeError __cause__ olarak korunmalı (raise ... from e)"\ntry:\n    ayar_oku(\'{"port": 5432}\')\n    assert False, "eksik anahtar AyarHatasi fırlatmalı"\nexcept AyarHatasi as e:\n    assert "veritabani" in str(e), "mesajda eksik anahtar adı geçmeli"\n',
    hints: ['Düşük seviyeli hatayı (JSONDecodeError) yakalayıp alan diline uygun hataya çevir.', '<code>except json.JSONDecodeError as e: raise AyarHatasi("...") from e</code>', 'Varsayılan için <code>ayar.setdefault("zaman_asimi", 30)</code>.'],
    why: 'Hata çevirme (exception translation), çağıranı iç ayrıntılardan (JSON kütüphanesi) yalıtır: yalnızca <code>AyarHatasi</code> yakalaması yeterlidir. <code>from e</code> asıl hatayı <code>__cause__</code>\'da saklar ve traceback\'te "The above exception was the direct cause..." olarak gösterir; kök neden kaybolmaz. <code>from None</code> ise zinciri bilerek gizler, yalnızca iç hata kullanıcıyı yanıltacaksa kullanılmalıdır.',
    tags: ['raise from', 'özel hata', 'json'],
    min: 6
  },

  {
    id: 'b-257',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 3,
    kind: 'yaz',
    title: 'Tüm hataları birlikte raporla (ExceptionGroup)',
    q: '<p>Toplu müşteri yüklemesinde ilk hatada durmak yerine <b>tüm</b> hatalı kayıtlar bir kerede raporlanmalı. <code>hepsini_dogrula(kayitlar)</code> fonksiyonunu yaz: her kayıt <code>{"no": int, "eposta": str, "yas": int}</code>. Kural: <code>eposta</code> içinde <code>@</code> olmalı, <code>yas</code> 18 ile 120 arasında (dahil) olmalı. Her hatalı kural için mesajı <code>"no=7: geçersiz eposta"</code> ya da <code>"no=7: geçersiz yaş"</code> olan bir <code>ValueError</code> üret. Hata varsa hepsini <code>ExceptionGroup("doğrulama başarısız", hatalar)</code> ile fırlat; yoksa kayıt sayısını döndür.</p>',
    start: 'def hepsini_dogrula(kayitlar):\n    # buraya yaz\n    pass\n',
    sol: 'def hepsini_dogrula(kayitlar):\n    hatalar = []\n    for k in kayitlar:\n        if "@" not in k["eposta"]:\n            hatalar.append(ValueError(f"no={k[\'no\']}: geçersiz eposta"))\n        if not 18 <= k["yas"] <= 120:\n            hatalar.append(ValueError(f"no={k[\'no\']}: geçersiz yaş"))\n    if hatalar:\n        raise ExceptionGroup("doğrulama başarısız", hatalar)\n    return len(kayitlar)\n',
    tests: 'iyi = [{"no": 1, "eposta": "a@x.com", "yas": 30}]\nassert hepsini_dogrula(iyi) == 1, "hatasız kayıtta kayıt sayısı dönmeli"\nkotu = [{"no": 7, "eposta": "ece.x.com", "yas": 15}, {"no": 8, "eposta": "b@x.com", "yas": 40}, {"no": 9, "eposta": "c@x.com", "yas": 130}]\ntry:\n    hepsini_dogrula(kotu)\n    assert False, "hatalı kayıtlarda ExceptionGroup fırlatılmalı"\nexcept ExceptionGroup as eg:\n    mesajlar = [str(e) for e in eg.exceptions]\n    assert mesajlar == ["no=7: geçersiz eposta", "no=7: geçersiz yaş", "no=9: geçersiz yaş"], f"tüm hatalar sırasıyla toplanmalı, gelen: {mesajlar}"\n    assert all(isinstance(e, ValueError) for e in eg.exceptions), "her alt hata ValueError olmalı"\nassert hepsini_dogrula([]) == 0, "boş liste 0"\n',
    hints: ['Hataları fırlatmak yerine bir listede biriktir.', 'Bir kayıtta iki kural da bozuk olabilir; iki ayrı <code>if</code> kullan (elif değil).', 'Döngü sonunda liste doluysa <code>raise ExceptionGroup("doğrulama başarısız", hatalar)</code>.'],
    why: 'Toplu işlemlerde "ilk hatada dur" (fail-fast) kullanıcıyı düzelt-yükle-tekrar döngüsüne sokar; hataları biriktirip tek seferde raporlamak çok daha verimlidir. Python 3.11+ <code>ExceptionGroup</code> birden fazla hatayı yapısal olarak taşır ve <code>except* ValueError</code> ile türe göre ayrıştırılabilir. Alternatif: hataları <code>(no, mesaj)</code> listesi olarak döndürmek; hata durumunu dönüş değerinde taşımak, çağıranın kontrol etmeyi unutması riskini getirir.',
    tags: ['ExceptionGroup', 'doğrulama', 'toplu işlem'],
    min: 8
  },

  {
    id: 'b-258',
    lv: 'orta',
    topic: 'Hata Tasarımı ve Logging',
    diff: 1,
    kind: 'bug',
    title: 'Hiç ulaşılamayan except blokları',
    q: '<p>Hatayı bul ve düzelt. <code>tutar_coz(deger)</code> sayıya çevrilemeyen metin için <code>"geçersiz sayı"</code>, metin olmayan bir değer (ör. <code>None</code>) için <code>"metin değil"</code> döndürmeli. Şu an her durumda <code>"bilinmeyen hata"</code> dönüyor.</p>',
    start: 'def tutar_coz(deger):\n    try:\n        return float(deger)\n    except Exception:\n        return "bilinmeyen hata"\n    except ValueError:\n        return "geçersiz sayı"\n    except TypeError:\n        return "metin değil"\n',
    sol: 'def tutar_coz(deger):\n    try:\n        return float(deger)\n    except ValueError:\n        return "geçersiz sayı"\n    except TypeError:\n        return "metin değil"\n    except Exception:\n        return "bilinmeyen hata"\n',
    tests: 'assert tutar_coz("12.5") == 12.5, "geçerli metin sayıya çevrilmeli"\nassert tutar_coz("on iki") == "geçersiz sayı", "ValueError ayrı yakalanmalı: except blokları yukarıdan aşağı denenir, ilk eşleşen kazanır"\nassert tutar_coz(None) == "metin değil", "float(None) TypeError verir"\n',
    hints: ['Python <code>except</code> bloklarını yukarıdan aşağı dener ve ilk uyanı çalıştırır.', '<code>ValueError</code> ve <code>TypeError</code> zaten <code>Exception</code>\'ın alt sınıfları.'],
    why: '<code>except Exception</code> neredeyse tüm hataları kapsadığından en üstte durursa altındaki özel bloklar hiç çalışmaz. Kural: en özel hata en üstte, en genel en altta. Hatta çoğu durumda genel <code>except Exception</code> hiç yazılmamalı ya da yazılıyorsa hatayı log\'layıp yeniden fırlatmalı (<code>raise</code>); sessizce "bilinmeyen hata" döndürmek gerçek hataları gizler.',
    tags: ['except sırası', 'ValueError', 'TypeError'],
    min: 2
  },

  {
    id: 'b-259',
    lv: 'orta',
    topic: 'collections/itertools',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'Counter ile stok aritmetiği',
    q: '<p>Dünkü ve bugünkü satış adetleri <code>Counter</code> ile tutuluyor. Bu kod ne yazdırır?</p>',
    code: 'from collections import Counter\n\ndun = Counter(kalem=5, defter=2)\nbugun = Counter(kalem=3, silgi=4)\nprint(dun + bugun)\nprint(dun - bugun)\n',
    o: ['Counter({\'kalem\': 8, \'silgi\': 4, \'defter\': 2})\nCounter({\'kalem\': 2, \'defter\': 2, \'silgi\': -4})', 'Counter({\'kalem\': 8, \'silgi\': 4, \'defter\': 2})\nCounter({\'kalem\': 2, \'defter\': 2})', 'Counter({\'kalem\': 8, \'defter\': 2, \'silgi\': 4})\nCounter({\'kalem\': 2})', 'Counter({\'kalem\': 15, \'silgi\': 4, \'defter\': 2})\nCounter({\'kalem\': 2, \'defter\': 2})'],
    a: 1,
    hints: ['<code>+</code> ortak anahtarları toplar; <code>Counter</code>\'ın repr\'i sayıları büyükten küçüğe gösterir.', '<code>-</code> işlemi sonucu sıfır ya da negatif olan anahtarları atar.'],
    why: '<code>Counter</code> toplaması anahtar bazında toplar; repr <code>most_common()</code> sırasıyla (büyükten küçüğe) yazdırır. Çıkarma ise yalnızca <b>pozitif</b> sonuçları tutar: silgi 0 - 4 = -4 olduğu için atılır. Negatifleri korumak istersen <code>dun.subtract(bugun)</code> metodunu kullanırsın; o yerinde çalışır ve negatif değerleri bırakır.',
    tags: ['Counter', 'çoklu küme'],
    min: 3
  },

  {
    id: 'b-260',
    lv: 'orta',
    topic: 'collections/itertools',
    diff: 1,
    t: 'order',
    kind: 'order',
    title: 'Hesap hareketlerinden bakiye serisi',
    q: '<p>Başlangıç bakiyesi 1000 TL olan hesabın hareketlerinden gün sonu bakiyelerini ve en büyük düşüşü hesaplayan programı sırala.</p>',
    lines: ['from itertools import accumulate, pairwise', 'bakiyeler = list(accumulate([-250, -100, 500], initial=1000))', 'degisimler = [b - a for a, b in pairwise(bakiyeler)]', 'en_buyuk_dusus = min(degisimler)', 'print(bakiyeler)', 'print(degisimler, en_buyuk_dusus)'],
    expect: '[1000, 750, 650, 1150]\n[-250, -100, 500] -250\n',
    hint: 'Her satır bir öncekinin sonucunu kullanıyor: önce birikimli bakiye, sonra ardışık farklar, sonra en küçük fark.',
    hints: ['Her satır bir öncekinin sonucunu kullanıyor: önce birikimli bakiye, sonra ardışık farklar, sonra en küçük fark.'],
    why: '<code>accumulate</code> birikimli toplamı üretir; <code>initial=1000</code> başlangıç bakiyesini serinin başına koyar. <code>pairwise</code> (3.10+) ardışık ikilileri verir, böylece günlük değişim kolayca bulunur. Bu ikili, finans ve stok takibinde "koşan toplam" (running total) ve "ardışık fark" hesaplarının standart araçlarıdır; pandas\'ta karşılıkları <code>cumsum()</code> ve <code>diff()</code>\'dir.',
    tags: ['accumulate', 'pairwise', 'itertools'],
    min: 3
  }
);
})(window);
