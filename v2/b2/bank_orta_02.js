/* PythonPatika — pratik bankası (orta): Fonksiyonel, Kapanışlar (b-221…b-230) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-221',
    lv: 'orta',
    topic: 'Fonksiyonel',
    diff: 1,
    t: 'predict',
    kind: 'predict',
    title: 'max ile en çok stoklu ürün',
    q: '<p>Depo sorumlusu en çok stoklu ürünü ve en düşük stok adedini görmek istiyor. Bu kod ne yazdırır?</p>',
    code: 'stok = {"kalem": 40, "defter": 3, "silgi": 40}\nprint(max(stok, key=stok.get), min(stok.values()))\n',
    o: ['silgi 3', 'kalem 3', '40 3', 'kalem defter'],
    a: 1,
    hints: ['Bir sözlük üzerinde dolaşınca anahtarlar gelir; <code>key</code> her anahtarın neye göre karşılaştırılacağını söyler.', 'Eşitlik durumunda <code>max</code> hangisini seçer: ilk gördüğünü mü, sonuncuyu mu?'],
    why: '<code>max(stok, key=stok.get)</code> anahtarları dolaşır ama her birini <code>stok.get(anahtar)</code> değerine göre karşılaştırır; sonuç yine bir <b>anahtardır</b>. 40 ile eşitlik olduğunda <code>max</code> ilk karşılaştığı en büyüğü (kalem) döndürür. <code>min(stok.values())</code> yalnızca değerlere bakar: 3. Fonksiyonu (<code>stok.get</code>) çağırmadan değer olarak vermek fonksiyonel programlamanın temelidir.',
    tags: ['max', 'key', 'birinci sınıf fonksiyon'],
    min: 2
  },

  {
    id: 'b-222',
    lv: 'orta',
    topic: 'Fonksiyonel',
    diff: 2,
    kind: 'rehberli',
    title: 'Temizlik adımlarını birleştir (compose)',
    q: '<p>CRM\'e girilen müşteri adları dağınık: <code>"  ayşe   yılmaz "</code>. Ekip, temizlik adımlarını ayrı küçük fonksiyonlar olarak yazdı. <code>birlestir(*fonksiyonlar)</code> fonksiyonunu yaz: verilen fonksiyonları <b>soldan sağa</b> sırayla uygulayan <b>tek bir fonksiyon</b> döndürsün. <code>functools.reduce</code> kullan. Hiç fonksiyon verilmezse değeri olduğu gibi döndüren fonksiyon dönmeli.</p>',
    guide: ['<code>birlestir</code> bir iç fonksiyon tanımlayıp onu döndürmeli: <code>def uygula(deger): ...</code>.', 'İç fonksiyonda <code>reduce</code> ile değeri fonksiyonlardan sırayla geçir.', 'Biriktirici (acc) o ana kadarki değer, ikinci argüman sıradaki fonksiyon: <code>lambda acc, f: f(acc)</code>.', 'Başlangıç değeri olarak <code>deger</code>\'i ver; böylece fonksiyon listesi boşsa değer aynen döner.'],
    example: 'from functools import reduce\n# reduce ile bir sayıyı işlem listesinden geçirme\nislemler = [lambda x: x + 1, lambda x: x * 10]\nprint(reduce(lambda acc, f: f(acc), islemler, 4))   # (4 + 1) * 10 = 50\n',
    start: 'from functools import reduce\n\ndef birlestir(*fonksiyonlar):\n    # TODO 1: tek argüman alan bir iç fonksiyon tanımla\n    # TODO 2: içinde reduce ile değeri fonksiyonlardan sırayla geçir\n    # TODO 3: iç fonksiyonu döndür\n    return None\n',
    sol: 'from functools import reduce\n\ndef birlestir(*fonksiyonlar):\n    def uygula(deger):\n        return reduce(lambda acc, f: f(acc), fonksiyonlar, deger)\n    return uygula\n',
    tests: 'def bosluklari_sadelestir(s):\n    return " ".join(s.split())\ntemizle = birlestir(str.strip, bosluklari_sadelestir, str.title)\nassert callable(temizle), "birlestir bir FONKSİYON döndürmeli"\nassert temizle("  ayşe   yılmaz ") == "Ayşe Yılmaz", f"\'Ayşe Yılmaz\' bekleniyordu, gelen: {temizle(\'  ayşe   yılmaz \')!r}"\nsira = birlestir(lambda x: x + 1, lambda x: x * 2)\nassert sira(3) == 8, "soldan sağa uygulanmalı: (3 + 1) * 2 = 8 (sağdan sola olsaydı 7 olurdu)"\nassert birlestir()(42) == 42, "fonksiyon verilmezse değer aynen dönmeli (reduce başlangıç değeri)"\n',
    hints: ['Fonksiyon döndüren fonksiyon: içeride <code>def</code>, sonda <code>return</code> iç fonksiyonun adı (parantezsiz).', '<code>reduce(fonksiyon, dizi, baslangic)</code>; burada dizi = <code>fonksiyonlar</code>, başlangıç = <code>deger</code>.', '<code>return reduce(lambda acc, f: f(acc), fonksiyonlar, deger)</code>'],
    why: 'Fonksiyon bileşimi (composition) küçük, test edilebilir adımları tek bir işleme dönüştürür; <code>reduce</code> değeri her fonksiyondan sırayla geçirir. Başlangıç değeri verildiği için boş liste güvenlidir. Alternatif: iç fonksiyonda basit bir <code>for f in fonksiyonlar: deger = f(deger)</code> döngüsü; çoğu ekip bunu daha okunur bulur ve iki çözüm de eşdeğerdir.',
    tags: ['reduce', 'compose', 'yüksek mertebe fonksiyon'],
    min: 7
  },

  {
    id: 'b-223',
    lv: 'orta',
    topic: 'Fonksiyonel',
    diff: 3,
    kind: 'yaz',
    title: 'Rapor sütunlarına göre dinamik sıralama',
    q: '<p>Raporlama ekranında kullanıcı sıralama alanlarını seçiyor: <code>["sehir", "-tutar"]</code> → önce şehir artan, sonra tutar <b>azalan</b>; başında <code>-</code> olan alan azalan demek. <code>sirala(kayitlar, alanlar)</code> fonksiyonunu yaz; yeni liste döndürsün. Alanlar metin de olabilir sayı da (metni eksiyle çeviremezsin!). İpucu: Python\'un sıralaması <b>kararlıdır</b> (stable).</p>',
    start: 'def sirala(kayitlar, alanlar):\n    # buraya yaz\n    pass\n',
    sol: 'def sirala(kayitlar, alanlar):\n    sonuc = list(kayitlar)\n    for alan in reversed(alanlar):\n        azalan = alan.startswith("-")\n        ad = alan.lstrip("-")\n        sonuc.sort(key=lambda k: k[ad], reverse=azalan)\n    return sonuc\n',
    tests: 'k = [{"sehir": "İzmir", "ad": "Can", "tutar": 50}, {"sehir": "Ankara", "ad": "Ece", "tutar": 10},\n     {"sehir": "Ankara", "ad": "Ali", "tutar": 90}, {"sehir": "İzmir", "ad": "Ada", "tutar": 70}]\nr = sirala(k, ["sehir", "-tutar"])\nassert [x["ad"] for x in r] == ["Ali", "Ece", "Ada", "Can"], f"şehir artan, tutar azalan: Ali, Ece, Ada, Can bekleniyordu, gelen {[x[\'ad\'] for x in r]}"\nr2 = sirala(k, ["-sehir", "ad"])\nassert [x["ad"] for x in r2] == ["Ada", "Can", "Ali", "Ece"], "metin alanı da azalan sıralanabilmeli (-sehir), sonra ad artan"\nassert k[0]["ad"] == "Can", "orijinal liste değişmemeli; kopyası üzerinde çalış"\nassert sirala(k, []) == k, "alan verilmezse sıra aynen kalmalı"\n',
    hints: ['Tek bir key demetinde metni negatifleyemezsin; bunun yerine birden fazla sıralama yap.', 'Kararlı sıralamada <b>en önemsiz</b> alandan başlayıp en önemliye doğru sıralarsan önceki sıra eşitlerde korunur: <code>reversed(alanlar)</code>.', 'Her alan için <code>sonuc.sort(key=lambda k: k[ad], reverse=alan.startswith("-"))</code>.'],
    why: 'Python\'un Timsort algoritması kararlıdır: eşit anahtarlı elemanların göreli sırası korunur. Bu yüzden ikincil alandan birincil alana doğru ardışık sıralamak, çok anahtarlı karışık yönlü sıralama verir ve metin alanlarında da çalışır. Alternatif: <code>functools.cmp_to_key</code> ile alanları tek tek karşılaştıran bir karşılaştırma fonksiyonu yazmak; tek geçişlidir ama daha uzun ve hata yapmaya açıktır.',
    tags: ['sort', 'kararlı sıralama', 'key'],
    min: 9
  },

  {
    id: 'b-224',
    lv: 'orta',
    topic: 'Fonksiyonel',
    diff: 1,
    kind: 'bug',
    title: 'None dönen sıralama fonksiyonu',
    q: '<p>Hatayı bul ve düzelt. <code>ucuzdan_pahaliya(urunler)</code> ürünleri fiyata göre artan sırayla <b>yeni bir liste</b> olarak döndürmeli ve gelen listeyi <b>değiştirmemeli</b>. Şu an <code>None</code> dönüyor.</p>',
    start: 'def ucuzdan_pahaliya(urunler):\n    return urunler.sort(key=lambda u: u["fiyat"])\n',
    sol: 'def ucuzdan_pahaliya(urunler):\n    return sorted(urunler, key=lambda u: u["fiyat"])\n',
    tests: 'u = [{"ad": "Çanta", "fiyat": 400}, {"ad": "Kalem", "fiyat": 15}]\nr = ucuzdan_pahaliya(u)\nassert r is not None, "list.sort() yerinde sıralar ve None döndürür; sorted() yeni liste döndürür"\nassert [x["ad"] for x in r] == ["Kalem", "Çanta"], "fiyata göre artan: Kalem, Çanta"\nassert u[0]["ad"] == "Çanta", "gelen liste değişmemeli (yan etki yok)"\n',
    hints: ['<code>list.sort()</code> ne döndürür?', 'Yeni liste döndüren yerleşik fonksiyon: <code>sorted(iterable, key=...)</code>.'],
    why: '<code>list.sort()</code> listeyi yerinde (in-place) değiştirir ve <code>None</code> döndürür; bu, "yan etkili işlem değer döndürmez" Python ilkesidir. <code>sorted()</code> ise girdiye dokunmadan yeni liste üretir; fonksiyonel tarzda çağırana ait veriyi değiştirmemek beklenir. Girdiyi bilerek değiştirmek istiyorsan <code>urunler.sort(...)</code> satırını ayrı yazıp ardından <code>return urunler</code> diyebilirsin, ama bu çağıranı şaşırtabilir.',
    tags: ['sorted', 'sort', 'yan etki'],
    min: 2
  },

  {
    id: 'b-225',
    lv: 'orta',
    topic: 'Fonksiyonel',
    diff: 2,
    kind: 'tamamla',
    title: 'Depo stoklarını reduce ile birleştir',
    q: '<p>Her depo stoğunu <code>{"kalem": 10, "defter": 5}</code> gibi bir sözlükte tutuyor. <code>toplam_stok(depolar)</code>, <code>reduce</code> ile tüm depoları tek sözlükte toplamalı. <code>birlestir</code> fonksiyonundaki boşluğu tamamla: sonuç sözlüğü iki sözlükte geçen <b>tüm</b> anahtarları içermeli.</p>',
    start: 'from functools import reduce\n\ndef birlestir(acc, depo):\n    return {k: acc.get(k, 0) + depo.get(k, 0) for k in ___}\n\ndef toplam_stok(depolar):\n    return reduce(birlestir, depolar, {})\n',
    sol: 'from functools import reduce\n\ndef birlestir(acc, depo):\n    return {k: acc.get(k, 0) + depo.get(k, 0) for k in acc.keys() | depo.keys()}\n\ndef toplam_stok(depolar):\n    return reduce(birlestir, depolar, {})\n',
    tests: 'r = toplam_stok([{"kalem": 10, "defter": 5}, {"kalem": 3, "silgi": 7}, {"defter": 1}])\nassert r == {"kalem": 13, "defter": 6, "silgi": 7}, f"kalem 13, defter 6, silgi 7 bekleniyordu, gelen: {r}"\nassert toplam_stok([]) == {}, "depo yoksa reduce başlangıç değeri {} dönmeli"\n',
    hints: ['İki sözlüğün anahtarlarının <b>birleşimi</b> gerekiyor.', '<code>dict.keys()</code> küme gibi davranır: <code>a.keys() | b.keys()</code>.'],
    why: '<code>keys()</code> görünümleri küme işlemlerini destekler; <code>|</code> iki sözlükteki tüm anahtarları verir, <code>get(k, 0)</code> eksik anahtarı 0 sayar. <code>reduce</code> bu ikili birleştirmeyi tüm depolara yayar. Alternatif ve genelde daha pratik yol: <code>sum((Counter(d) for d in depolar), Counter())</code> ya da bir <code>Counter</code> üzerinde <code>update</code> döngüsü.',
    tags: ['reduce', 'dict keys', 'birleşim'],
    min: 4
  },

  {
    id: 'b-226',
    lv: 'orta',
    topic: 'Kapanışlar',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'Döngüde üretilen lambda\'lar',
    q: '<p>Bir geliştirici 1x, 2x, 3x çarpan fonksiyonlarını döngüde üretiyor. Bu kod ne yazdırır?</p>',
    code: 'fonks = [lambda x: x * i for i in range(1, 4)]\nprint([f(10) for f in fonks])\n',
    o: ['[10, 20, 30]', '[30, 30, 30]', '[0, 10, 20]', 'NameError'],
    a: 1,
    hints: ['Lambda, <code>i</code>\'nin değerini mi saklar yoksa <code>i</code> değişkeninin kendisine mi bakar?', 'Fonksiyonlar çağrıldığında döngü çoktan bitmiştir.'],
    why: 'Kapanış (closure) değişkenin <b>değerini değil</b>, değişkenin kendisini yakalar (geç bağlama, late binding). Lambda\'lar çağrıldığında comprehension bitmiş ve <code>i</code> son değeri 3\'te kalmıştır; hepsi 10 * 3 = 30 verir. Değeri o anda dondurmak için varsayılan argüman kullanılır: <code>lambda x, i=i: x * i</code> ya da <code>functools.partial</code>.',
    tags: ['closure', 'late binding', 'lambda'],
    min: 2
  },

  {
    id: 'b-227',
    lv: 'orta',
    topic: 'Kapanışlar',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'nonlocal unutulursa',
    q: '<p>Bir sayaç fabrikası yazılmış ama <code>nonlocal</code> unutulmuş. Bu kod ne yapar?</p>',
    code: 'def sayac():\n    n = 0\n    def artir():\n        n += 1\n        return n\n    return artir\n\ns = sayac()\nprint(s())\n',
    o: ['1 yazdırır', '0 yazdırır', 'UnboundLocalError hatası verir', 'NameError hatası verir'],
    a: 2,
    raises: true,
    hints: ['İç fonksiyonda bir ada atama yapmak (<code>n += 1</code>) o adı nereye ait yapar?', 'Okumaya çalışırken yerel <code>n</code> henüz değer almamış.'],
    why: 'Bir fonksiyon içinde bir ada atama yapıldığında Python o adı <b>yerel</b> kabul eder. <code>n += 1</code> önce yerel <code>n</code>\'yi okumaya çalışır, ama yerel <code>n</code> henüz atanmamıştır: <code>UnboundLocalError</code> (NameError\'ın alt sınıfı, ama mesajı ve türü farklı). Çözüm: iç fonksiyonun başına <code>nonlocal n</code> yazmak. Yalnızca okuma yapılsaydı (<code>return n + 1</code>) hata olmazdı.',
    tags: ['closure', 'nonlocal', 'kapsam'],
    min: 2
  },

  {
    id: 'b-228',
    lv: 'orta',
    topic: 'Kapanışlar',
    diff: 2,
    kind: 'rehberli',
    title: 'API hız sınırlayıcı',
    q: '<p>Anadolu Bank\'ın dış API\'si "son <code>pencere</code> saniyede en fazla <code>limit</code> istek" kuralı uyguluyor. <code>hiz_siniri(limit, pencere)</code> fonksiyonunu yaz: bir <code>izin(zaman)</code> fonksiyonu döndürsün. <code>izin</code> çağrı anını (saniye, artan sayılar) alır; son <code>pencere</code> saniyede (yani <code>zaman - pencere</code>\'den <b>büyük</b> anlarda) kabul edilmiş istek sayısı <code>limit</code>\'ten azsa isteği kaydedip <code>True</code>, değilse <code>False</code> döndürür. Reddedilen istek kaydedilmez. Her sınırlayıcı kendi durumunu tutmalı.</p>',
    guide: ['Dış fonksiyonda kabul edilen isteklerin zamanlarını tutacak bir <code>deque</code> oluştur.', 'İç <code>izin(zaman)</code> fonksiyonunda önce pencere dışında kalan eski zamanları baştan at (<code>popleft</code>).', 'Kalan sayı <code>limit</code>\'ten küçükse zamanı ekle ve <code>True</code> döndür; değilse <code>False</code>.', 'Dış fonksiyon iç fonksiyonu döndürsün. Deque\'yi yalnızca değiştirdiğin (yeniden atamadığın) için <code>nonlocal</code> gerekmez.'],
    example: 'from collections import deque\n# Kapanışın içinde değişebilir bir kap tutmak\ndef kayit_tutucu(kapasite):\n    son = deque()\n    def ekle(x):\n        son.append(x)\n        if len(son) > kapasite:\n            son.popleft()\n        return list(son)\n    return ekle\n\nk = kayit_tutucu(2)\nk("a"); k("b")\nprint(k("c"))   # [\'b\', \'c\']\n',
    start: 'from collections import deque\n\ndef hiz_siniri(limit, pencere):\n    # TODO 1: kabul edilen zamanlar için deque\n    def izin(zaman):\n        # TODO 2: pencere dışındaki eski kayıtları at\n        # TODO 3: yer varsa kaydet ve True, yoksa False\n        return True\n    return izin\n',
    sol: 'from collections import deque\n\ndef hiz_siniri(limit, pencere):\n    kabul = deque()\n    def izin(zaman):\n        while kabul and kabul[0] <= zaman - pencere:\n            kabul.popleft()\n        if len(kabul) < limit:\n            kabul.append(zaman)\n            return True\n        return False\n    return izin\n',
    tests: 'izin = hiz_siniri(2, 10)\nr = [izin(t) for t in [0, 1, 2, 9, 10, 11, 12]]\nassert r[:3] == [True, True, False], "ilk iki istek kabul, üçüncüsü (t=2) reddedilmeli: 10 sn\'de en fazla 2"\nassert r[3] is False, "t=9: 0 ve 1 hâlâ pencerede, ret"\nassert r[4] is True, "t=10: t=0 artık pencere dışında (10 - 10 = 0\'dan büyük olmalı), kabul"\nassert r[5] is True and r[6] is False, f"t=11 kabul (t=1 düştü), t=12 ret beklenir, gelen: {r}"\ndiger = hiz_siniri(1, 5)\nassert diger(0) is True and diger(1) is False, "ikinci sınırlayıcı kendi durumunu tutmalı (bağımsız kapanış)"\nassert izin(100) is True, "uzun süre sonra tekrar izin verilmeli"\n',
    hints: ['Durum (kabul edilen zamanlar) dış fonksiyonun yerel değişkeninde yaşar; iç fonksiyon onu kapanışla görür.', 'Pencere kontrolü: <code>while kabul and kabul[0] &lt;= zaman - pencere: kabul.popleft()</code>.', 'Sonra <code>if len(kabul) &lt; limit: kabul.append(zaman); return True</code>, aksi halde <code>return False</code>.'],
    why: 'Kapanış, durumu sınıfa gerek kalmadan fonksiyonla birlikte taşır; her <code>hiz_siniri</code> çağrısı kendi <code>deque</code>\'sini oluşturur. Kayan pencere (sliding window) algoritması eski kayıtları baştan atar; <code>deque.popleft</code> O(1) olduğu için verimlidir. Alternatif: <code>__call__</code> metotlu bir <code>HizSiniri</code> sınıfı; durum büyüdükçe ve test etmek gerektiğinde sınıf daha okunur olur.',
    tags: ['closure', 'deque', 'rate limit'],
    min: 8
  },

  {
    id: 'b-229',
    lv: 'orta',
    topic: 'Kapanışlar',
    diff: 2,
    kind: 'yaz',
    title: 'Kurları donduran çevirici',
    q: '<p>Fatura kesilirken o anki döviz kurları <b>sabitlenmeli</b>; sonradan kur tablosu güncellense bile kesilen faturanın çeviricisi eski kurları kullanmalı. <code>cevirici(kurlar)</code> fonksiyonunu yaz: <code>kurlar</code> TL karşılıklarını tutar (<code>{"USD": 32.5, "EUR": 35.0, "TL": 1}</code>). Döndürdüğü <code>cevir(tutar, kaynak, hedef)</code> fonksiyonu tutarı çevirip <code>round(..., 2)</code> ile döndürsün.</p>',
    start: 'def cevirici(kurlar):\n    # buraya yaz\n    pass\n',
    sol: 'def cevirici(kurlar):\n    sabit = dict(kurlar)\n    def cevir(tutar, kaynak, hedef):\n        return round(tutar * sabit[kaynak] / sabit[hedef], 2)\n    return cevir\n',
    tests: 'kurlar = {"USD": 32.5, "EUR": 35.0, "TL": 1}\nc = cevirici(kurlar)\nassert c(100, "USD", "TL") == 3250.0, "100 USD = 3250 TL"\nassert c(70, "EUR", "USD") == 75.38, "70 EUR = 70*35/32.5 = 75.38 USD"\nkurlar["USD"] = 40.0\nassert c(100, "USD", "TL") == 3250.0, "kur tablosu sonradan değişse de çevirici ESKİ kurları kullanmalı: kapanışa sözlüğün KOPYASINI ver"\nassert cevirici(kurlar)(1, "USD", "TL") == 40.0, "yeni çevirici yeni kurla çalışmalı"\n',
    hints: ['Kapanış nesneye <b>referansla</b> bakar; dışarıdaki sözlük değişirse içerisi de değişmiş görür.', 'Dış fonksiyonda <code>sabit = dict(kurlar)</code> ile kopya al, iç fonksiyon kopyayı kullansın.'],
    why: 'Kapanış, dış değişkenin gösterdiği nesneyi paylaşır; değişebilir bir sözlük dışarıdan güncellenirse kapanış da yeni değeri görür. Kopya alarak "anlık görüntü" (snapshot) dondurulur: muhasebede kesilen belgenin değişmemesi tam olarak budur. İç içe yapılar varsa <code>copy.deepcopy</code> gerekir; daha da güvenlisi değiştirilemez <code>types.MappingProxyType</code> ya da demet kullanmaktır.',
    tags: ['closure', 'kopya', 'snapshot'],
    min: 5
  },

  {
    id: 'b-230',
    lv: 'orta',
    topic: 'Kapanışlar',
    diff: 2,
    kind: 'bug',
    title: 'Hepsi aynı oranı uygulayan kampanyalar',
    q: '<p>Hatayı bul ve düzelt. <code>kampanya_fonksiyonlari(kampanyalar)</code>, <code>{"YAZ10": 0.10, "KIS25": 0.25}</code> gibi bir sözlükten her kod için indirim uygulayan bir fonksiyon üretmeli. Şu an tüm kodlar <b>son</b> kampanyanın oranını uyguluyor.</p>',
    start: 'def kampanya_fonksiyonlari(kampanyalar):\n    fonks = {}\n    for kod, oran in kampanyalar.items():\n        fonks[kod] = lambda fiyat: round(fiyat * (1 - oran), 2)\n    return fonks\n',
    sol: 'def kampanya_fonksiyonlari(kampanyalar):\n    fonks = {}\n    for kod, oran in kampanyalar.items():\n        fonks[kod] = lambda fiyat, oran=oran: round(fiyat * (1 - oran), 2)\n    return fonks\n',
    tests: 'f = kampanya_fonksiyonlari({"YAZ10": 0.10, "KIS25": 0.25})\nassert f["KIS25"](200) == 150.0, "KIS25: 200 * 0.75 = 150"\nassert f["YAZ10"](200) == 180.0, "YAZ10: 200 * 0.90 = 180; her lambda kendi oranını o anda yakalamalı (geç bağlama hatası)"\n',
    hints: ['Lambda <code>oran</code> değişkenine çağrıldığı anda bakar; o anda döngü bitmiş olur.', 'Değeri tanım anında dondurmak için varsayılan argüman kullan: <code>lambda fiyat, oran=oran: ...</code>.'],
    why: 'Varsayılan argümanlar fonksiyon <b>tanımlanırken</b> değerlendirilir, bu yüzden <code>oran=oran</code> her turdaki değeri ayrı ayrı saklar. Daha temiz alternatif bir fabrika fonksiyonudur: <code>def indirim_yap(oran): return lambda f: round(f * (1 - oran), 2)</code>; her çağrı yeni bir kapsam açtığı için geç bağlama sorunu olmaz ve imzada fazladan parametre görünmez.',
    tags: ['closure', 'late binding', 'varsayılan argüman'],
    min: 4
  }
);
})(window);
