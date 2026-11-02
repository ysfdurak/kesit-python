/* PythonPatika — pratik bankası (orta): Dekoratörler, OOP (b-231…b-240) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-231',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'Üst üste dekoratör sırası',
    q: '<p>Raporlama modülünde iki biçimlendirme dekoratörü üst üste uygulanmış. Bu kod ne yazdırır?</p>',
    code: 'def koseli(f):\n    def w():\n        return "[" + f() + "]"\n    return w\n\ndef yildiz(f):\n    def w():\n        return "*" + f() + "*"\n    return w\n\n@koseli\n@yildiz\ndef ad():\n    return "Ali"\n\nprint(ad())\n',
    o: ['*[Ali]*', '[*Ali*]', '[Ali]', '*Ali*'],
    a: 1,
    hints: ['<code>@koseli @yildiz def ad</code> ifadesi <code>ad = koseli(yildiz(ad))</code> demektir.', 'Fonksiyona en yakın dekoratör ilk sarar.'],
    why: 'Dekoratörler aşağıdan yukarıya uygulanır: önce <code>yildiz</code> asıl fonksiyonu sarar, sonra <code>koseli</code> bu sarılmış fonksiyonu sarar. Çağrıda en dıştaki (koseli) çalışır, içteki sonucu köşeli paranteze alır: <code>[*Ali*]</code>. Pratikte bu sıra önemlidir: örneğin önce yetki kontrolü sonra önbellek mi, yoksa tersi mi, sonucu değiştirir.',
    tags: ['decorator', 'sıra'],
    min: 2
  },

  {
    id: 'b-232',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 1,
    t: 'order',
    kind: 'order',
    title: 'Çağrıları kaydeden dekoratör',
    q: '<p>Her çağrıda fonksiyon adını yazdıran bir dekoratör tanımlayıp KDV fonksiyonuna uygulayan programı sırala. Çıktı <code>çağrı: kdv</code> ve ardından <code>120.0</code> olmalı.</p>',
    lines: ['def logla(fn):', '    def sarici(*args, **kwargs):', '        print("çağrı:", fn.__name__)', '        return fn(*args, **kwargs)', '    return sarici', '@logla', 'def kdv(x):', '    return round(x * 1.2, 2)', 'print(kdv(100))'],
    expect: 'çağrı: kdv\n120.0\n',
    hint: 'Sarıcı önce kaydı basar, sonra asıl fonksiyonun sonucunu döndürür; return\'den sonraki satır hiç çalışmaz.',
    hints: ['Sarıcı önce kaydı basar, sonra asıl fonksiyonun sonucunu döndürür; return\'den sonraki satır hiç çalışmaz.'],
    why: 'Dekoratör bir fonksiyon alıp yerine sarıcıyı (wrapper) döndürür; <code>@logla</code> satırı hemen altındaki <code>def</code>\'e uygulanır. Sarıcının <code>*args, **kwargs</code> alması her imzalı fonksiyonla çalışmasını sağlar. Gerçek projede <code>print</code> yerine <code>logging</code> ve adı korumak için <code>functools.wraps</code> kullanılır.',
    tags: ['decorator', 'wrapper'],
    min: 3
  },

  {
    id: 'b-233',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 2,
    kind: 'rehberli',
    title: 'Rol kontrolü yapan dekoratör',
    q: '<p>Anadolu Bank\'ın iç panelinde bazı işlemler yalnızca belirli rollere açık. <code>yetki_gerekli(rol)</code> <b>parametreli</b> dekoratörünü yaz. Sarılan fonksiyonların ilk argümanı her zaman kullanıcı sözlüğüdür: <code>{"ad": "Ece", "roller": ["gise", "onay"]}</code>. Rol kullanıcıda yoksa <code>PermissionError</code> fırlat (mesajda rol adı geçsin), varsa fonksiyonu çağırıp sonucunu döndür. <code>functools.wraps</code> ile fonksiyon adını koru.</p>',
    guide: ['En dış fonksiyon <code>yetki_gerekli(rol)</code> parametreyi alır ve bir dekoratör döndürür.', 'Ortadaki <code>dekorator(fn)</code> sarıcıyı döndürür; sarıcının üstüne <code>@functools.wraps(fn)</code> koy.', 'Sarıcı <code>(kullanici, *args, **kwargs)</code> alsın; <code>rol not in kullanici["roller"]</code> ise <code>PermissionError</code>.', 'Aksi halde <code>return fn(kullanici, *args, **kwargs)</code>.'],
    example: 'import functools\n# Parametreli dekoratör iskeleti: ön ek ekleyen dekoratör\ndef onek(metin):\n    def dekorator(fn):\n        @functools.wraps(fn)\n        def sarici(*args, **kwargs):\n            return metin + str(fn(*args, **kwargs))\n        return sarici\n    return dekorator\n\n@onek("TL ")\ndef fiyat():\n    return 99\nprint(fiyat(), fiyat.__name__)   # TL 99 fiyat\n',
    start: 'import functools\n\ndef yetki_gerekli(rol):\n    # TODO 1: fn alan bir dekorator fonksiyonu tanımla\n    # TODO 2: içinde @functools.wraps(fn) ile sarıcı yaz\n    # TODO 3: rol yoksa PermissionError, varsa fn sonucunu döndür\n    def dekorator(fn):\n        return fn\n    return dekorator\n',
    sol: 'import functools\n\ndef yetki_gerekli(rol):\n    def dekorator(fn):\n        @functools.wraps(fn)\n        def sarici(kullanici, *args, **kwargs):\n            if rol not in kullanici.get("roller", []):\n                raise PermissionError(f"{kullanici.get(\'ad\')} için \'{rol}\' yetkisi yok")\n            return fn(kullanici, *args, **kwargs)\n        return sarici\n    return dekorator\n',
    tests: '@yetki_gerekli("onay")\ndef kredi_onayla(kullanici, basvuru_no):\n    """Kredi başvurusunu onaylar."""\n    return f"{basvuru_no} onaylandı"\n\nece = {"ad": "Ece", "roller": ["gise", "onay"]}\ncan = {"ad": "Can", "roller": ["gise"]}\nassert kredi_onayla(ece, "K-17") == "K-17 onaylandı", "yetkili kullanıcıda fonksiyon sonucu dönmeli"\ntry:\n    kredi_onayla(can, "K-18")\n    assert False, "rolü olmayan kullanıcıda PermissionError fırlatılmalı"\nexcept PermissionError as e:\n    assert "onay" in str(e), "hata mesajında eksik rolün adı geçmeli ki log okunabilsin"\nassert kredi_onayla.__name__ == "kredi_onayla", "functools.wraps ile fonksiyon adı korunmalı"\nassert kredi_onayla.__doc__ == "Kredi başvurusunu onaylar.", "wraps docstring\'i de korur"\n',
    hints: ['Üç katman: parametre → dekoratör → sarıcı. Her katman bir alttakini döndürür.', 'Sarıcının imzası: <code>def sarici(kullanici, *args, **kwargs)</code>.', '<code>if rol not in kullanici["roller"]: raise PermissionError(f"... {rol} ...")</code>'],
    why: 'Parametreli dekoratör, dekoratör döndüren bir fabrikadır: <code>@yetki_gerekli("onay")</code> önce çağrılır, dönen dekoratör fonksiyona uygulanır. Yetki kontrolünü dekoratöre almak her işlevde aynı <code>if</code>\'i tekrar yazmayı önler ve kontrolün unutulmasını zorlaştırır (Flask/Django\'daki <code>@login_required</code> aynı fikirdir). Alternatif: kontrolü ayrı bir <code>kontrol_et(kullanici, rol)</code> fonksiyonunda tutup her işlevin başında açıkça çağırmak; daha görünür ama tekrar eder.',
    tags: ['decorator', 'parametreli', 'yetki'],
    min: 8
  },

  {
    id: 'b-234',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 2,
    kind: 'yaz',
    title: 'Temizlenebilir önbellek dekoratörü',
    q: '<p>Kur servisine yapılan çağrılar pahalı; aynı argümanlarla tekrar çağrılınca sonuç önbellekten gelsin. <code>onbellek(fn)</code> dekoratörünü yaz: konumsal argümanların demetini anahtar yapan bir sözlükte sonuçları tutsun. Ayrıca sarılmış fonksiyona <code>temizle()</code> adlı bir öznitelik-fonksiyon ekle; çağrılınca önbellek boşalsın.</p>',
    start: 'def onbellek(fn):\n    # buraya yaz\n    pass\n',
    sol: 'import functools\n\ndef onbellek(fn):\n    depo = {}\n\n    @functools.wraps(fn)\n    def sarici(*args):\n        if args not in depo:\n            depo[args] = fn(*args)\n        return depo[args]\n\n    sarici.temizle = depo.clear\n    return sarici\n',
    tests: 'cagri = []\n\n@onbellek\ndef kur_getir(doviz, tarih):\n    cagri.append((doviz, tarih))\n    return {"USD": 32.5, "EUR": 35.0}[doviz]\n\nassert kur_getir("USD", "2026-03-01") == 32.5, "ilk çağrı gerçek değeri döndürmeli"\nassert kur_getir("USD", "2026-03-01") == 32.5, "ikinci çağrı da aynı değeri döndürmeli"\nassert len(cagri) == 1, f"aynı argümanlarla ikinci çağrı önbellekten gelmeli; asıl fonksiyon 1 kez çalışmalıydı, {len(cagri)} kez çalıştı"\nkur_getir("EUR", "2026-03-01")\nassert len(cagri) == 2, "farklı argüman yeni hesaplama gerektirir"\nkur_getir.temizle()\nkur_getir("USD", "2026-03-01")\nassert len(cagri) == 3, "temizle() sonrası önbellek boş olmalı, fonksiyon yeniden çalışmalı"\nassert kur_getir.__name__ == "kur_getir", "functools.wraps kullan"\n',
    hints: ['Önbellek sözlüğü dekoratörün içinde, sarıcının dışında tanımlanmalı (her fonksiyona bir tane).', '<code>args</code> zaten bir demettir; sözlük anahtarı olabilir.', 'Fonksiyonlar nesnedir: <code>sarici.temizle = depo.clear</code>.'],
    why: 'Sözlük kapanış içinde yaşar ve her dekore edilen fonksiyon için ayrıdır. <code>args</code> demeti hashlenebilir olduğu sürece anahtar olur; liste gibi değişebilir argümanlar <code>TypeError</code> verir. Gerçek projede hazır <code>functools.lru_cache</code>/<code>functools.cache</code> kullan: <code>cache_clear()</code> ve <code>cache_info()</code> zaten gelir. Kendi yazdığın önbellek ise süre aşımı (TTL) gibi özel kurallar eklemek istediğinde gerekir.',
    tags: ['decorator', 'memoization', 'cache'],
    min: 7
  },

  {
    id: 'b-235',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 1,
    kind: 'bug',
    title: 'Adını kaybeden fonksiyonlar',
    q: '<p>Hatayı bul ve düzelt. Ekip, raporlama fonksiyonlarını <code>@sure_olc</code> ile sardıktan sonra log\'larda tüm fonksiyonların adı <code>sarici</code> görünmeye başladı ve otomatik dokümantasyon boş çıktı. Dekoratör, sarılan fonksiyonun adını ve docstring\'ini korumalı.</p>',
    start: 'import time\n\ndef sure_olc(fn):\n    def sarici(*args, **kwargs):\n        bas = time.perf_counter()\n        sonuc = fn(*args, **kwargs)\n        sarici.son_sure = time.perf_counter() - bas\n        return sonuc\n    return sarici\n',
    sol: 'import time\nimport functools\n\ndef sure_olc(fn):\n    @functools.wraps(fn)\n    def sarici(*args, **kwargs):\n        bas = time.perf_counter()\n        sonuc = fn(*args, **kwargs)\n        sarici.son_sure = time.perf_counter() - bas\n        return sonuc\n    return sarici\n',
    tests: '@sure_olc\ndef aylik_rapor(ay):\n    """Aylık satış raporunu üretir."""\n    return f"{ay} raporu"\n\nassert aylik_rapor("Mart") == "Mart raporu", "fonksiyon sonucu değişmemeli"\nassert aylik_rapor.__name__ == "aylik_rapor", f"fonksiyon adı \'aylik_rapor\' olmalı, şu an {aylik_rapor.__name__!r}: functools.wraps eksik"\nassert aylik_rapor.__doc__ == "Aylık satış raporunu üretir.", "docstring korunmalı"\nassert aylik_rapor.son_sure >= 0, "süre ölçümü çalışmaya devam etmeli"\n',
    hints: ['Sarıcı yeni bir fonksiyondur; adı ve docstring\'i kendisine aittir.', '<code>functools</code> modülünde bu iş için hazır bir dekoratör var.'],
    why: '<code>@functools.wraps(fn)</code> sarıcıya asıl fonksiyonun <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__qualname__</code> bilgilerini kopyalar ve <code>__wrapped__</code> ile asıl fonksiyona erişim sağlar. Log\'lar, hata ayıklayıcılar, test araçları ve dokümantasyon üreticileri bu bilgilere dayanır. Elle <code>sarici.__name__ = fn.__name__</code> yazmak da çalışır ama eksik kalır; her dekoratörde wraps alışkanlık olmalı.',
    tags: ['decorator', 'functools.wraps'],
    min: 3
  },

  {
    id: 'b-236',
    lv: 'orta',
    topic: 'Dekoratörler',
    diff: 2,
    kind: 'tamamla',
    title: 'Komut kayıt defteri',
    q: '<p>Bir chatbot, komutları <code>@komut("bakiye")</code> ile kaydedilen fonksiyonlara yönlendiriyor. <code>komut(ad)</code> dekoratörü fonksiyonu <code>KOMUTLAR</code> sözlüğüne kaydetmeli ve fonksiyonu <b>değiştirmeden</b> geri vermeli (doğrudan çağrılabilmeye devam etmeli). Boşluğu tamamla.</p>',
    start: 'KOMUTLAR = {}\n\ndef komut(ad):\n    def kaydet(fn):\n        KOMUTLAR[ad] = fn\n        return ___\n    return kaydet\n\ndef calistir(metin):\n    ad, *argumanlar = metin.split()\n    if ad not in KOMUTLAR:\n        return "bilinmeyen komut"\n    return KOMUTLAR[ad](*argumanlar)\n',
    sol: 'KOMUTLAR = {}\n\ndef komut(ad):\n    def kaydet(fn):\n        KOMUTLAR[ad] = fn\n        return fn\n    return kaydet\n\ndef calistir(metin):\n    ad, *argumanlar = metin.split()\n    if ad not in KOMUTLAR:\n        return "bilinmeyen komut"\n    return KOMUTLAR[ad](*argumanlar)\n',
    tests: '@komut("bakiye")\ndef bakiye(hesap):\n    return f"{hesap}: 1500 TL"\n\n@komut("selam")\ndef selam():\n    return "Merhaba!"\n\nassert calistir("bakiye TR12") == "TR12: 1500 TL", "kayıtlı komut argümanla çağrılmalı"\nassert calistir("selam") == "Merhaba!", "argümansız komut çalışmalı"\nassert calistir("uç") == "bilinmeyen komut", "kayıtsız komut"\nassert bakiye("TR1") == "TR1: 1500 TL", "dekoratör fonksiyonu geri vermeli; aksi halde bakiye adı None olur"\n',
    hints: ['<code>@kaydet</code> uygulandıktan sonra <code>bakiye</code> adı, <code>kaydet</code>\'in döndürdüğü şeye bağlanır.', 'Sarmaya gerek yok; asıl fonksiyonun kendisini döndür.'],
    why: 'Her dekoratörün sarıcı üretmesi gerekmez; kayıt (registry) dekoratörleri fonksiyonu bir yere kaydeder ve olduğu gibi döndürür. Döndürmezse <code>bakiye</code> adı <code>None</code> olur. Bu kalıp Flask\'ın <code>@app.route</code>, pytest\'in eklentileri ve CLI araçlarındaki komut tanımlarında kullanılır. Alternatif: kaydı açıkça <code>KOMUTLAR["bakiye"] = bakiye</code> diye yazmak; dekoratör, kaydı tanımın hemen yanında tutarak unutulmasını önler.',
    tags: ['decorator', 'registry', 'dispatch'],
    min: 4
  },

  {
    id: 'b-237',
    lv: 'orta',
    topic: 'OOP',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'Sınıf özniteliği mi, örnek özniteliği mi?',
    q: '<p>Ürün sınıfında KDV oranı sınıf özniteliği olarak tanımlanmış. Bu kod ne yazdırır?</p>',
    code: 'class Urun:\n    kdv = 0.20\n    def __init__(self, fiyat):\n        self.fiyat = fiyat\n\na = Urun(100)\nb = Urun(50)\na.kdv = 0.10\nUrun.kdv = 0.01\nprint(a.kdv, b.kdv)\n',
    o: ['0.1 0.2', '0.01 0.01', '0.1 0.01', '0.1 0.1'],
    a: 2,
    hints: ['<code>a.kdv = 0.10</code> sınıfı mı değiştirir, yoksa yalnızca <code>a</code>\'ya yeni bir öznitelik mi ekler?', 'Öznitelik araması önce örnekte, sonra sınıfta yapılır.'],
    why: '<code>a.kdv = 0.10</code> sınıfı değiştirmez; <code>a</code> nesnesine kendi <code>kdv</code> özniteliğini ekler ve sınıftakini gölgeler. <code>Urun.kdv = 0.01</code> sınıf özniteliğini değiştirir; kendi özniteliği olmayan <code>b</code> bunu görür. Arama sırası: örneğin <code>__dict__</code>\'i, sonra sınıf. Ortak sabitleri sınıfta tutmak normaldir, ama örnek üzerinden atama yapmak bu kafa karışıklığını doğurur.',
    tags: ['class attribute', 'gölgeleme'],
    min: 2
  },

  {
    id: 'b-238',
    lv: 'orta',
    topic: 'OOP',
    diff: 2,
    kind: 'rehberli',
    title: 'Sepeti Python\'a tanıt',
    q: '<p><code>Sepet</code> sınıfı ürünleri <code>{"urun_adi": adet}</code> sözlüğünde tutuyor. Sınıfa şu özel metotları ekle ki Python\'un yerleşik araçlarıyla doğal kullanılsın: <code>len(sepet)</code> toplam <b>adet</b>i, <code>"kalem" in sepet</code> ürünün olup olmadığını, <code>for ad in sepet</code> ürün adlarını alfabetik sırada verir, <code>bool(sepet)</code> boşsa <code>False</code> olur.</p>',
    guide: ['<code>__len__</code>: <code>self.kalemler</code> değerlerinin toplamını döndür.', '<code>__contains__(self, ad)</code>: ad sözlükte mi? <code>True/False</code>.', '<code>__iter__</code>: <code>iter(sorted(self.kalemler))</code> döndür.', '<code>bool()</code> için ayrı metot gerekmez: <code>__bool__</code> yoksa Python <code>__len__</code>\'e bakar.'],
    example: 'class Raf:\n    def __init__(self, kitaplar):\n        self.kitaplar = list(kitaplar)\n    def __len__(self):\n        return len(self.kitaplar)\n    def __contains__(self, ad):\n        return ad in self.kitaplar\n    def __iter__(self):\n        return iter(self.kitaplar)\n\nr = Raf(["Nutuk", "Suç ve Ceza"])\nprint(len(r), "Nutuk" in r, list(r))\n',
    start: 'class Sepet:\n    def __init__(self):\n        self.kalemler = {}\n\n    def ekle(self, ad, adet=1):\n        self.kalemler[ad] = self.kalemler.get(ad, 0) + adet\n\n    # TODO 1: __len__ toplam adet\n    # TODO 2: __contains__ ürün var mı\n    # TODO 3: __iter__ alfabetik ürün adları\n',
    sol: 'class Sepet:\n    def __init__(self):\n        self.kalemler = {}\n\n    def ekle(self, ad, adet=1):\n        self.kalemler[ad] = self.kalemler.get(ad, 0) + adet\n\n    def __len__(self):\n        return sum(self.kalemler.values())\n\n    def __contains__(self, ad):\n        return ad in self.kalemler\n\n    def __iter__(self):\n        return iter(sorted(self.kalemler))\n',
    tests: 's = Sepet()\nassert not s, "boş sepet bool bağlamında False olmalı (__len__ 0 döndürünce)"\ns.ekle("kalem", 3)\ns.ekle("defter")\ns.ekle("kalem", 2)\nassert len(s) == 6, f"len(sepet) toplam adet olmalı: 5 kalem + 1 defter = 6, gelen {len(s) if hasattr(s, \'__len__\') else \'yok\'}"\nassert "kalem" in s and "silgi" not in s, "__contains__ doğru çalışmalı"\nassert list(s) == ["defter", "kalem"], "for döngüsü ürün adlarını alfabetik vermeli"\nassert s, "dolu sepet True olmalı"\n',
    hints: ['Bu metotları (dunder) Python çağırır; sen yalnızca tanımlarsın.', '<code>__iter__</code> bir yineleyici (iterator) döndürmeli; <code>iter(...)</code> bunu üretir.', '<code>def __len__(self): return sum(self.kalemler.values())</code>'],
    why: 'Özel metotlar sınıfını Python\'un veri modeline (data model) bağlar: <code>len</code>, <code>in</code>, <code>for</code>, <code>bool</code> artık doğal çalışır ve ekibin ayrı metot adları (<code>urun_sayisi()</code>, <code>var_mi()</code>) ezberlemesi gerekmez. <code>__contains__</code> olmasa bile <code>in</code>, <code>__iter__</code> üzerinden çalışırdı ama sözlük aramasından yavaş olurdu. Alternatif: <code>collections.abc.Collection</code>\'dan türeyip bu üç metodu zorunlu kılmak.',
    tags: ['dunder', '__len__', '__iter__', '__contains__'],
    min: 7
  },

  {
    id: 'b-239',
    lv: 'orta',
    topic: 'OOP',
    diff: 2,
    kind: 'rehberli',
    title: 'Alternatif kurucu ve doğrulayıcı',
    q: '<p>İK sistemi personeli <code>"Ece Kaya;IK;42000"</code> biçimli satırlardan okuyor. <code>Calisan</code> sınıfına iki şey ekle: (1) <code>@classmethod</code> <code>satirdan(cls, satir)</code>: satırı ayrıştırıp yeni nesne döndürsün (maaş int). (2) <code>@staticmethod</code> <code>gecerli_mi(satir)</code>: satır tam 3 parçalıysa ve maaş kısmı rakamlardan oluşuyorsa <code>True</code> döndürsün.</p>',
    guide: ['<code>@classmethod</code> ilk parametre olarak sınıfı (<code>cls</code>) alır; yeni nesneyi <code>cls(...)</code> ile oluştur.', 'Satırı <code>split(";")</code> ile üç parçaya ayır, maaşı <code>int</code>\'e çevir.', '<code>@staticmethod</code> ne <code>self</code> ne <code>cls</code> alır; sıradan bir fonksiyon gibi yaz.', 'Doğrulayıcıda parça sayısını ve <code>isdigit()</code>\'i kontrol et.'],
    example: 'class Tarih:\n    def __init__(self, gun, ay, yil):\n        self.gun, self.ay, self.yil = gun, ay, yil\n    @classmethod\n    def metinden(cls, metin):\n        g, a, y = map(int, metin.split("."))\n        return cls(g, a, y)\n    @staticmethod\n    def artik_mi(yil):\n        return yil % 4 == 0 and (yil % 100 != 0 or yil % 400 == 0)\n\nt = Tarih.metinden("29.10.2026")\nprint(t.yil, Tarih.artik_mi(2024))\n',
    start: 'class Calisan:\n    def __init__(self, ad, birim, maas):\n        self.ad = ad\n        self.birim = birim\n        self.maas = maas\n\n    # TODO 1: @classmethod satirdan(cls, satir)\n    # TODO 2: @staticmethod gecerli_mi(satir)\n',
    sol: 'class Calisan:\n    def __init__(self, ad, birim, maas):\n        self.ad = ad\n        self.birim = birim\n        self.maas = maas\n\n    @classmethod\n    def satirdan(cls, satir):\n        ad, birim, maas = satir.split(";")\n        return cls(ad.strip(), birim.strip(), int(maas))\n\n    @staticmethod\n    def gecerli_mi(satir):\n        parcalar = satir.split(";")\n        return len(parcalar) == 3 and parcalar[2].strip().isdigit()\n',
    tests: 'c = Calisan.satirdan("Ece Kaya;IK;42000")\nassert isinstance(c, Calisan), "satirdan bir Calisan nesnesi döndürmeli"\nassert (c.ad, c.birim, c.maas) == ("Ece Kaya", "IK", 42000), "alanlar doğru ayrışmalı, maaş int olmalı"\nclass Stajyer(Calisan):\n    pass\nassert type(Stajyer.satirdan("Can;IT;15000")) is Stajyer, "cls kullanırsan alt sınıftan çağrınca alt sınıf nesnesi döner (Calisan(...) yazma)"\nassert Calisan.gecerli_mi("Ali;Satış;30000") is True, "geçerli satır True"\nassert Calisan.gecerli_mi("Ali;Satış") is False, "eksik alan False"\nassert Calisan.gecerli_mi("Ali;Satış;otuz bin") is False, "maaş sayı değilse False"\n',
    hints: ['Dekoratörleri metodun hemen üstüne yaz: <code>@classmethod</code>, <code>@staticmethod</code>.', 'classmethod içinde <code>Calisan(...)</code> değil <code>cls(...)</code> yaz ki alt sınıflarda da çalışsın.', '<code>return len(p) == 3 and p[2].strip().isdigit()</code>'],
    why: '<code>classmethod</code> alternatif kurucular (alternative constructor) için standart yoldur: <code>dict.fromkeys</code>, <code>datetime.fromisoformat</code> böyledir. <code>cls</code> kullanmak kalıtımı korur. <code>staticmethod</code> sınıfla ilgili ama nesne durumuna ihtiyaç duymayan yardımcıları sınıfın ad alanında toplar; modül düzeyinde bir fonksiyon da aynı işi görür, seçim okunabilirlik meselesidir.',
    tags: ['classmethod', 'staticmethod', 'alternatif kurucu'],
    min: 7
  },

  {
    id: 'b-240',
    lv: 'orta',
    topic: 'OOP',
    diff: 2,
    kind: 'yaz',
    title: 'Müşteri kayıtlarını tekilleştir',
    q: '<p>İki farklı kanaldan (web ve mağaza) gelen müşteri listelerinde aynı kişi farklı yazımla geçebiliyor. <code>Musteri(no, ad)</code> sınıfını yaz: iki müşteri <b>yalnızca <code>no</code></b> aynıysa eşit sayılsın ve kümede (<code>set</code>) tekilleşebilsin. <code>repr</code> <code>Musteri(1001, \'Ayşe Yılmaz\')</code> biçiminde olsun. <code>Musteri</code> olmayan bir nesneyle karşılaştırıldığında <code>NotImplemented</code> döndür.</p>',
    start: 'class Musteri:\n    # buraya yaz\n    pass\n',
    sol: 'class Musteri:\n    def __init__(self, no, ad):\n        self.no = no\n        self.ad = ad\n\n    def __eq__(self, other):\n        if not isinstance(other, Musteri):\n            return NotImplemented\n        return self.no == other.no\n\n    def __hash__(self):\n        return hash(self.no)\n\n    def __repr__(self):\n        return f"Musteri({self.no}, {self.ad!r})"\n',
    tests: 'web = [Musteri(1001, "Ayşe Yılmaz"), Musteri(1002, "Can Demir")]\nmagaza = [Musteri(1001, "AYŞE YILMAZ"), Musteri(1003, "Ece Kaya")]\ntekil = set(web) | set(magaza)\nassert len(tekil) == 3, f"1001 iki kanalda da var; tekil müşteri sayısı 3 olmalı, gelen {len(tekil)}. __eq__ ve __hash__ birlikte tanımlanmalı"\nassert Musteri(5, "A") == Musteri(5, "B"), "aynı no eşit"\nassert Musteri(5, "A") != Musteri(6, "A"), "farklı no eşit değil"\nassert (Musteri(5, "A") == 5) is False, "başka türle karşılaştırma False olmalı (NotImplemented döndür)"\nassert repr(Musteri(1001, "Ayşe Yılmaz")) == "Musteri(1001, \'Ayşe Yılmaz\')", "repr biçimi yanlış"\n',
    hints: ['Yalnızca <code>__eq__</code> tanımlarsan Python <code>__hash__</code>\'i <code>None</code> yapar ve nesne kümeye girmez.', '<code>__hash__</code> eşitlikte kullanılan alanların hash\'ini döndürmeli: <code>hash(self.no)</code>.', 'repr için <code>{self.ad!r}</code> tırnaklı gösterim verir.'],
    why: 'Eşit iki nesnenin hash\'i de eşit olmalıdır; bu yüzden <code>__hash__</code> yalnızca <code>__eq__</code>\'de kullanılan alana (no) dayanır. <code>NotImplemented</code> döndürmek Python\'a "karşı tarafa sor" der; sonunda eşitlik <code>False</code> olur, hata çıkmaz. Alternatif: <code>@dataclass(frozen=True)</code> ve <code>ad</code> alanına <code>field(compare=False)</code> vererek aynı davranışı kısa yoldan elde etmek.',
    tags: ['__eq__', '__hash__', 'set', '__repr__'],
    min: 6
  }
);
})(window);
