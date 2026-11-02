from html import escape


def pre(c):
    return '<pre class="py">' + escape(c, quote=False) + '</pre>'


def c(s):
    return '<code>' + escape(s, quote=False) + '</code>'


Q = [
dict(roles=['genel'], lv='temel', topic='Değişebilirlik', kind='kavram',
     q='Python\'da değişebilir (mutable) ve değişmez (immutable) tipler arasındaki fark nedir? Hangi tipler hangi gruba girer?',
     a='<p><b>Kısa cevap:</b> Değişebilir bir nesnenin içeriği oluşturulduktan sonra yerinde değiştirilebilir; değişmez bir nesnede "değişiklik" aslında yeni bir nesne üretir.</p>'
       '<ul><li><b>Değişmez:</b> ' + c('int') + ', ' + c('float') + ', ' + c('bool') + ', ' + c('str') + ', ' + c('tuple') + ', ' + c('frozenset') + ', ' + c('bytes') + '.</li>'
       '<li><b>Değişebilir:</b> ' + c('list') + ', ' + c('dict') + ', ' + c('set') + ', ' + c('bytearray') + ' ve çoğu kullanıcı sınıfı.</li></ul>'
       '<p><b>Neden önemli?</b> Değişebilir bir nesneyi iki değişken paylaşıyorsa birinden yapılan değişiklik ötekinde de görünür. Fonksiyona liste verdiğinde fonksiyon onu bozabilir. Ayrıca sözlük anahtarı ya da küme elemanı olabilmek için nesnenin hash değeri ömür boyu sabit kalmalı; bu yüzden anahtarlar pratikte değişmez tiplerden seçilir.</p>'
       + pre('sepet = ["elma"]\nkopya = sepet\nkopya.append("armut")\nprint(sepet)  # [\'elma\', \'armut\']')
       + '<p><b>İnce nokta:</b> Bir ' + c('tuple') + ' değişmezdir ama içinde liste varsa o liste değişebilir: ' + c('t = ([1], 2); t[0].append(3)') + ' çalışır. Değişmezlik "kabın" kendisi içindir, içindekiler için değil.</p>',
     follow=['İçinde liste olan bir tuple hash\'lenebilir mi?', 'Bir string\'e += yapınca bellekte ne olur?'],
     flags=['"tuple tamamen değişmezdir, içi de değişmez" demek', 'Değişebilirliği yalnızca "değer değişebiliyor mu" diye açıklayıp paylaşılan referans etkisini atlamak'],
     tip='Tanımdan sonra hemen iki değişkenin aynı listeyi paylaştığı küçük bir örnek ver; mülakatçı anladığını görmek ister.'),

dict(roles=['genel'], lv='temel', topic='is ve ==', kind='kod-okuma',
     q='Aşağıdaki kodun çıktısı nedir? ' + '<code>is</code> ile <code>==</code> arasındaki farkı açıkla.',
     code='a = [1, 2, 3]\nb = [1, 2, 3]\nc = a\nprint(a == b, a is b)\nprint(a is c)\nx = None\nprint(x is None)\n',
     out='True False\nTrue\nTrue',
     a='<p><b>' + c('==') + '</b> değer eşitliğini sorar ve ' + c('__eq__') + ' metodunu çağırır. <b>' + c('is') + '</b> ise kimlik eşitliğini sorar: iki isim bellekte <i>aynı nesneyi</i> mi gösteriyor? Bu, ' + c('id(a) == id(b)') + ' ile aynı anlama gelir.</p>'
       '<p>Kodda ' + c('a') + ' ve ' + c('b') + ' içerikleri aynı olan iki ayrı listedir: ' + c('a == b') + ' True, ' + c('a is b') + ' False. ' + c('c = a') + ' yeni liste üretmez, aynı nesneye ikinci bir isim verir; bu yüzden ' + c('a is c') + ' True.</p>'
       '<p><b>Ne zaman ' + c('is') + '?</b> Yalnızca tekil (singleton) nesnelerle: ' + c('None') + ', ' + c('True') + '/' + c('False') + ', özel bir işaretçi (sentinel) nesne. PEP 8 de ' + c('x is None') + ' yazmayı önerir, çünkü bir sınıf ' + c('__eq__') + ' metodunu ezerek ' + c('== None') + ' karşılaştırmasını yanıltabilir.</p>'
       '<p><b>Sık hata:</b> Sayı ya da string karşılaştırmasında ' + c('is') + ' kullanmak. Küçük tamsayı önbelleği yüzünden bazen "çalışıyor gibi" görünür ama bu bir uygulama ayrıntısıdır; Python 3.8+ bu kullanım için ' + c('SyntaxWarning') + ' bile verir.</p>',
     follow=['Kendi sınıfında __eq__ tanımlarsan "x == None" neden riskli olur?', 'Sentinel nesne ne işe yarar, örnek verir misin?'],
     flags=['"is daha hızlı olduğu için hep is kullanırım" demek', 'Sayıları is ile karşılaştırmayı normal görmek'],
     tip='"Değer mi, kimlik mi?" ayrımını tek cümleyle söyle; sonra None örneğiyle pratik kuralı ver.'),

dict(roles=['genel'], lv='orta', topic='Tamsayı önbelleği', kind='kod-okuma',
     q='Bu kod CPython\'da ne yazdırır? Sonuç neden iki satırda farklı?',
     code='a = int("100")\nb = int("100")\nprint(a == b, a is b)\nx = int("1000")\ny = int("1000")\nprint(x == y, x is y)\n',
     out='True True\nTrue False',
     a='<p>İki satırda da değerler eşit, dolayısıyla ' + c('==') + ' iki kez True. Fark ' + c('is') + ' sonucunda.</p>'
       '<p>CPython başlangıçta <b>-5 ile 256 arasındaki tamsayıları</b> önceden oluşturup önbellekte tutar. Bu aralıkta bir int üretildiğinde yeni nesne yaratılmaz, hazır nesne verilir. Bu yüzden ' + c('int("100")') + ' iki kez çağrılsa da aynı nesne döner ve ' + c('a is b') + ' True olur. 1000 bu aralığın dışında; çalışma anında iki ayrı nesne oluşur, ' + c('x is y') + ' False olur.</p>'
       '<p>Değerleri ' + c('int("...")') + ' ile çalışma anında ürettik; bunun nedeni şu: aynı derleme biriminde yazılan sabitler (' + c('x = 1000; y = 1000') + ') derleyici tarafından birleştirilebilir ve sonuç True çıkabilir. Yani davranış hem sürüme hem de kodun nasıl derlendiğine bağlıdır.</p>'
       '<p><b>Çıkarım:</b> Bu tamamen bir <i>uygulama ayrıntısıdır</i> (PyPy veya başka bir sürüm farklı davranabilir). Sayıların eşitliğini her zaman ' + c('==') + ' ile sına. Benzer bir optimizasyon kısa ve tanımlayıcıya benzeyen string\'ler için de vardır (interning).</p>',
     follow=['String interning nedir, sys.intern ne zaman işe yarar?', 'Bu davranışı neden koduna güvence olarak alamazsın?'],
     flags=['"Python 1000\'i saklamaz" gibi belirsiz açıklama', 'Önbelleğin dil garantisi olduğunu sanmak'],
     tip='Aralığı (-5…256) bilmek artı puan, ama asıl puanı "bu bir uygulama ayrıntısı, == kullan" sonucunu söyleyerek alırsın.'),

dict(roles=['genel'], lv='temel', topic='Sığ ve derin kopya', kind='kod-okuma',
     q='Anadolu Market\'te bir sipariş şablonunu kopyalayıp değiştiriyoruz. Çıktı ne olur, neden?',
     code='import copy\nsablon = {"musteri": "Ayşe", "urunler": ["çay"]}\nsig = copy.copy(sablon)\nderin = copy.deepcopy(sablon)\nsig["musteri"] = "Mehmet"\nsig["urunler"].append("simit")\nprint(sablon)\nprint(derin["urunler"])\n',
     out="{'musteri': 'Ayşe', 'urunler': ['çay', 'simit']}\n['çay']",
     a='<p><b>Sığ kopya</b> (' + c('copy.copy') + ', ' + c('dict.copy()') + ', ' + c('list[:]') + ') yalnızca dış kabı kopyalar; içteki nesneler <i>paylaşılır</i>. <b>Derin kopya</b> (' + c('copy.deepcopy') + ') iç içe tüm nesneleri özyinelemeli olarak yeniden oluşturur.</p>'
       '<p>Kodda ' + c('sig["musteri"] = "Mehmet"') + ' sığ kopyadaki anahtarı yeni bir string\'e bağlar; orijinal sözlük etkilenmez, bu yüzden "Ayşe" kalır. Ama ' + c('sig["urunler"]') + ' orijinaldeki <i>aynı liste</i> nesnesidir; ' + c('append') + ' o ortak listeyi değiştirir ve "simit" orijinalde de görünür. Derin kopyanın listesi bağımsız olduğu için yalnızca "çay" içerir.</p>'
       '<p><b>Ne zaman hangisi?</b> İç içe yapı yoksa veya içteki nesneler değişmezse sığ kopya yeterli ve hızlıdır. İç içe değişebilir yapılar varsa derin kopya gerekir; ancak büyük nesnelerde pahalıdır. ' + c('deepcopy') + ' döngüsel referansları ' + c('memo') + ' sözlüğüyle güvenle yönetir; sınıflar ' + c('__deepcopy__') + ' ile davranışı özelleştirebilir.</p>',
     follow=['deepcopy döngüsel referanslı bir yapıda neden sonsuz döngüye girmez?', 'Atama (=) ile sığ kopya arasındaki fark ne?'],
     flags=['Atamayı (=) kopya sanmak', '"Sığ kopyada hiçbir şey paylaşılmaz" demek'],
     tip='Cevabı "dış kap kopyalanır, içerik paylaşılır" cümlesiyle özetle; mülakatçılar bu net ayrımı arar.'),

dict(roles=['genel'], lv='temel', topic='Değişebilir varsayılan argüman', kind='kod-okuma',
     q='Bu fonksiyon her çağrıda boş bir sepetle başlamıyor. Çıktıyı açıkla ve düzelt.',
     code='def sepete_ekle(urun, sepet=[]):\n    sepet.append(urun)\n    return sepet\n\nprint(sepete_ekle("süt"))\nprint(sepete_ekle("ekmek"))\nprint(sepete_ekle("yumurta", []))\n',
     out="['süt']\n['süt', 'ekmek']\n['yumurta']",
     a='<p>Varsayılan argüman değerleri fonksiyon <b>tanımlandığı anda bir kez</b> hesaplanır ve fonksiyon nesnesinde (' + c('sepete_ekle.__defaults__') + ') saklanır. Her çağrıda yeni liste üretilmez; argüman verilmeyen tüm çağrılar aynı listeyi paylaşır.</p>'
       '<p>İlk çağrı ortak listeye "süt" ekler. İkinci çağrı aynı listeye "ekmek" ekler, bu yüzden iki eleman görünür. Üçüncü çağrıda yeni bir liste açıkça verildiği için sonuç bağımsızdır.</p>'
       '<p><b>Standart çözüm:</b> sentinel olarak ' + c('None') + ' kullanmak.</p>'
       + pre('def sepete_ekle(urun, sepet=None):\n    if sepet is None:\n        sepet = []\n    sepet.append(urun)\n    return sepet')
       + '<p>Aynı tuzak ' + c('dict') + ', ' + c('set') + ' ve ' + c('datetime.now()') + ' gibi varsayılanlarda da vardır (zaman damgası tanım anında donar). Dataclass\'larda ise ' + c('field(default_factory=list)') + ' kullanılır. Bu davranış bazen bilinçli olarak basit bir önbellek kurmak için kullanılır ama okunabilirliği düşürür.</p>',
     follow=['Varsayılan değer olarak datetime.now() verirsen ne olur?', 'Bu davranışı bilerek kullanmak hangi durumda mantıklı olabilir?'],
     flags=['"Her çağrıda varsayılan yeniden oluşturulur" demek', 'Çözüm olarak sepet=[] yerine sepet=list() önermek (aynı sorun)'],
     tip='Önce nedeni (tanım anında bir kez değerlendirilir), sonra None kalıbını göster; iki adımlı cevap güçlü durur.'),

dict(roles=['genel', 'backend'], lv='orta', topic='GIL', kind='kavram',
     q='GIL (Global Interpreter Lock) nedir, neden vardır ve çoklu iş parçacıklı (multithreaded) Python programlarını nasıl etkiler?',
     a='<p><b>Tanım:</b> GIL, CPython yorumlayıcısında aynı anda yalnızca <i>bir</i> iş parçacığının Python bayt kodu çalıştırmasına izin veren bir kilittir.</p>'
       '<p><b>Neden var?</b> CPython bellek yönetimini referans sayımıyla yapar. Her nesnenin sayacının iş parçacıkları arasında güvenle artıp azalması gerekir. Her nesneye ayrı kilit koymak yerine tek bir genel kilit kullanmak, yorumlayıcıyı ve C eklentilerini basit ve tek iş parçacığında hızlı tutar.</p>'
       '<p><b>Etkisi:</b></p><ul><li><b>CPU-yoğun iş</b> (hesaplama, sıkıştırma, saf Python döngüleri): thread eklemek hızlandırmaz, hatta bağlam geçişi yüzünden yavaşlatabilir. Çözüm: ' + c('multiprocessing') + ' / ' + c('ProcessPoolExecutor') + ', GIL\'i bırakan C kütüphaneleri (NumPy) ya da Cython.</li>'
       '<li><b>G/Ç-yoğun iş</b> (ağ, disk, veritabanı): thread\'ler G/Ç beklerken GIL\'i bırakır, bu yüzden thread veya ' + c('asyncio') + ' gerçek fayda sağlar.</li></ul>'
       '<p><b>Önemli:</b> GIL kodunu yarış koşullarından korumaz. ' + c('sayac += 1') + ' birden fazla bayt kodudur ve araya başka thread girebilir; paylaşılan veriye yine ' + c('threading.Lock') + ' gerekir. Python 3.13 ile deneysel "free-threaded" (GIL\'siz) derleme geldi (PEP 703), ama varsayılan sürüm hâlâ GIL\'li.</p>',
     follow=['GIL varken neden hâlâ Lock kullanmamız gerekiyor?', 'NumPy hesapları neden thread\'lerle hızlanabiliyor?', 'PEP 703 free-threading neyi değiştiriyor?'],
     flags=['"Python\'da thread\'ler hiç işe yaramaz" demek', '"GIL sayesinde yarış koşulu olmaz" demek', 'GIL\'i Python dilinin özelliği sanmak (CPython\'a özgüdür)'],
     tip='CPU-yoğun / G/Ç-yoğun ayrımını mutlaka yap; mülakatçı asıl bunu duymak ister.'),

dict(roles=['genel', 'backend'], lv='ileri', topic='Eşzamanlılık seçimi', kind='kavram',
     q='Pedal İzmir için 2 milyon yolculuk kaydında yoğun istatistik hesabı ve aynı anda 500 harici API çağrısı yapan bir iş var. Hangi kısmı thread, hangisini process, hangisini asyncio ile çözersin?',
     a='<p>İşi iki farklı yük tipine ayırırım, çünkü GIL yüzünden doğru araç yük tipine göre değişir.</p>'
       '<p><b>1. İstatistik hesabı (CPU-yoğun):</b> Saf Python döngüsüyse thread fayda vermez. Önce vektörleştirmeyi denerim (pandas/NumPy; çoğu işlem C\'de ve GIL dışında çalışır). Yine yetmezse veriyi parçalara bölüp ' + c('ProcessPoolExecutor') + ' ile çekirdek sayısı kadar sürece dağıtırım. Dikkat: süreçler arası veri ' + c('pickle') + ' ile kopyalanır; büyük DataFrame\'i her sürece göndermek yerine dosya yolu ya da parça indeksleri gönderirim.</p>'
       '<p><b>2. 500 API çağrısı (G/Ç-yoğun):</b> ' + c('asyncio') + ' + ' + c('httpx.AsyncClient') + ' / ' + c('aiohttp') + ' ile tek thread\'de yüzlerce bağlantı yönetilir. ' + c('asyncio.Semaphore') + ' ile eşzamanlılığı (ör. 50) sınırlar, zaman aşımı ve yeniden deneme eklerim. Kütüphane senkron ise ' + c('ThreadPoolExecutor(max_workers=32)') + ' de iyi çalışır.</p>'
       '<p><b>Birleştirme:</b> Async döngü içinde CPU işi gerekirse ' + c('loop.run_in_executor(process_pool, ...)') + ' ile döngüyü bloklamadan sürece gönderirim. Ölçerek karar veririm: ' + c('cProfile') + ' ile darboğazın gerçekten nerede olduğuna bakmadan paralelleştirmem.</p>',
     follow=['ProcessPool\'a büyük nesne göndermenin maliyeti nedir?', 'Semaphore olmadan 500 isteği aynı anda atarsan ne olur?'],
     flags=['Her şeye "thread aç" demek', 'Ölçüm yapmadan paralelleştirmeyi önermek', 'Karşı API\'nin hız sınırını hiç düşünmemek'],
     tip='Önce yükü sınıflandır (CPU mu G/Ç mü), sonra araç seç; bu yapı kıdemli bir düşünce biçimi gösterir.'),

dict(roles=['genel'], lv='temel', topic='Üreteçler', kind='kavram',
     q='Üreteç (generator) nedir? Liste döndüren bir fonksiyon yerine neden üreteç kullanırsın?',
     a='<p><b>Tanım:</b> Üreteç, gövdesinde ' + c('yield') + ' bulunan bir fonksiyonun döndürdüğü, değerleri <i>tembel</i> (lazy) biçimde, istendikçe tek tek üreten bir yineleyicidir. Fonksiyon her ' + c('yield') + '\'de durur, durumunu (yerel değişkenler, kaldığı satır) korur ve bir sonraki ' + c('next()') + ' çağrısında kaldığı yerden devam eder.</p>'
       + pre('def satirlar(yol):\n    with open(yol, encoding="utf-8") as f:\n        for satir in f:\n            yield satir.rstrip("\\n")')
       + '<p><b>Avantajları:</b></p><ul><li><b>Bellek:</b> 10 GB\'lık log dosyasını bile sabit bellekle işlersin; liste hepsini RAM\'e yükler.</li>'
       '<li><b>Erken çıkış:</b> İlk eşleşmeyi bulunca durursan geri kalan hiç hesaplanmaz.</li>'
       '<li><b>Boru hattı:</b> ' + c('oku → filtrele → dönüştür') + ' adımları birbirine bağlanır, her eleman hattan tek tek geçer.</li>'
       '<li><b>Sonsuz diziler:</b> ' + c('itertools.count()') + ' gibi bitmeyen akışlar ifade edilebilir.</li></ul>'
       '<p><b>Dezavantajı:</b> Yalnızca bir kez gezilebilir, ' + c('len()') + ' ve indeksleme yoktur. Veriyi birden çok kez kullanacaksan listeye çevirmek gerekir. Kısa yazım için üreteç ifadesi: ' + c('sum(x * x for x in veri)') + '.</p>',
     follow=['Bir üreteç ikinci kez gezilirse ne olur?', 'Üreteç ifadesi ile liste kavrayışının bellek farkını nasıl ölçersin?'],
     flags=['Üreteci "daha hızlı liste" olarak tanımlamak', 'yield ile return farkını açıklayamamak'],
     tip='Büyük dosya ya da veritabanı imleci örneği ver; pratik bir senaryo cevabını somutlaştırır.'),

dict(roles=['genel'], lv='orta', topic='Üreteç tükenmesi', kind='kod-okuma',
     q='Lezzet Kurye\'de teslimat sürelerini bir üreteçle hesaplıyoruz. Çıktı nedir ve ikinci satır neden şaşırtıcı?',
     code='sureler = [12, 25, 8, 40]\nhizli = (s for s in sureler if s < 30)\nprint(sum(hizli))\nprint(sum(hizli))\nprint(list(hizli))\n',
     out='45\n0\n[]',
     a='<p>' + c('hizli') + ' bir üreteç ifadesidir; değerleri tek seferlik üretir. İlk ' + c('sum') + ' çağrısı onu sonuna kadar tüketir: 12 + 25 + 8 = 45 (40 filtreye takılır).</p>'
       '<p>Tükenmiş bir üreteç hata vermez, yalnızca ' + c('StopIteration') + ' ile hemen biter. Bu yüzden ikinci ' + c('sum') + ' boş bir diziyi toplar ve <b>sessizce 0</b> döner; ' + c('list') + ' de boş liste verir. Gerçek projelerde bu tür bir hata raporda "sıfır ciro" gibi yanıltıcı ama sessiz sonuçlara yol açar.</p>'
       '<p><b>Çözümler:</b></p><ul><li>Veri birden fazla kez kullanılacaksa listeye çevir: ' + c('hizli = [s for s in sureler if s < 30]') + '.</li>'
       '<li>Her kullanımda yeni üreteç oluşturan bir fonksiyon yaz.</li>'
       '<li>Gerçekten iki kez gezmek gerekiyorsa ' + c('itertools.tee') + ' kullan (ama tüm tamponu tutabileceği için bellek kazancı kaybolabilir).</li></ul>'
       '<p>Aynı tuzak ' + c('map') + ', ' + c('filter') + ', ' + c('zip') + ' ve dosya nesneleri için de geçerlidir; hepsi tek seferlik yineleyicidir.</p>',
     follow=['Bir nesnenin yineleyici mi yoksa yinelenebilir mi olduğunu nasıl anlarsın?', 'itertools.tee ne zaman bellek avantajını yok eder?'],
     flags=['İkinci sum için "hata verir" demek', 'Liste ile üretecin bu farkını bilmemek'],
     tip='"Sessizce 0 döner" vurgusunu yap; mülakatçılar sessiz hataların farkında olanı sever.'),

dict(roles=['genel'], lv='ileri', topic='yield from ve send', kind='kod-okuma',
     q='Aşağıdaki üreteç kodunun çıktısı nedir? ' + '<code>send</code> ve <code>yield from</code> ne işe yarar?',
     code='def ortalama():\n    toplam, adet = 0, 0\n    ort = None\n    while True:\n        deger = yield ort\n        if deger is None:\n            return round(ort, 1)\n        toplam += deger\n        adet += 1\n        ort = toplam / adet\n\ndef sarmalayici():\n    sonuc = yield from ortalama()\n    print("bitti:", sonuc)\n\ng = sarmalayici()\nnext(g)\nprint(g.send(10))\nprint(g.send(20))\nprint(g.send(33))\ntry:\n    g.send(None)\nexcept StopIteration:\n    pass\n',
     out='10.0\n15.0\n21.0\nbitti: 21.0',
     a='<p>' + c('send(x)') + ' üreteci devam ettirir ve ' + c('yield') + ' ifadesinin değeri olarak ' + c('x') + '\'i içeri gönderir. Böylece üreteç yalnızca veri üreten değil, veri alan bir <i>eşyordam</i> (coroutine) olur. İlk ' + c('next(g)') + ' çağrısı üreteci ilk ' + c('yield') + '\'e kadar götürür ("priming"); bu yapılmadan ' + c('send') + ' ile değer gönderilemez.</p>'
       '<p>' + c('yield from alt') + ' iki şey yapar: alt üretecin ürettiği değerleri ve ' + c('send') + ' ile gelenleri iki yönde şeffafça aktarır, ayrıca alt üreteç ' + c('return') + ' ile bittiğinde o değeri ifadenin sonucu olarak verir.</p>'
       '<p>Akış: 10 gönderilir → ortalama 10.0; 20 → 15.0; 33 → 63/3 = 21.0. ' + c('None') + ' gönderildiğinde alt üreteç ' + c('return 21.0') + ' yapar; bu değer ' + c('sonuc') + '\'a düşer, "bitti: 21.0" yazılır. Sarmalayıcı da sona erdiği için dışarıya ' + c('StopIteration') + ' fırlar ve yakalanır.</p>'
       '<p>Tarihsel not: ' + c('asyncio') + ' ilk sürümleri tam olarak bu mekanizmanın üzerine kuruldu; ' + c('async/await') + ' bu fikrin özel sözdizimidir.</p>',
     follow=['Priming adımını otomatikleştiren bir dekoratör nasıl yazılır?', 'g.throw() ve g.close() ne yapar?'],
     flags=['send(None) ile next() farkını bilmemek', 'yield from\'u yalnızca "for döngüsünün kısaltması" sanmak'],
     tip='Kodu satır satır izle ve ara değerleri yüksek sesle söyle; mülakatçı izleme becerisini değerlendiriyor.'),

dict(roles=['genel'], lv='orta', topic='Dekoratörler', kind='kavram',
     q='Dekoratör nedir? Gerçek bir projede hangi amaçlarla kullanırsın?',
     a='<p><b>Tanım:</b> Dekoratör, bir fonksiyonu (ya da sınıfı) argüman olarak alıp genellikle onu saran yeni bir fonksiyon döndüren çağrılabilir nesnedir. ' + c('@zamanla') + ' yazımı, ' + c('f = zamanla(f)') + ' atamasının kısaltmasıdır. Python\'da fonksiyonlar birinci sınıf nesne olduğu ve closure desteklendiği için bu mümkündür.</p>'
       + pre('import functools, time\n\ndef zamanla(f):\n    @functools.wraps(f)\n    def sarici(*args, **kwargs):\n        bas = time.perf_counter()\n        try:\n            return f(*args, **kwargs)\n        finally:\n            print(f.__name__, time.perf_counter() - bas)\n    return sarici')
       + '<p><b>Gerçek kullanımlar:</b> loglama ve süre ölçümü; yetki kontrolü (Flask\'ta ' + c('@login_required') + '); önbellek (' + c('@functools.lru_cache') + '); yeniden deneme (retry) ve hız sınırlama; rota kaydı (' + c('@app.get("/siparis")') + '); transaction yönetimi; ' + c('@property') + ', ' + c('@classmethod') + ', ' + c('@dataclass') + ' gibi dil düzeyindeki yardımcılar.</p>'
       '<p><b>Dikkat:</b> ' + c('functools.wraps') + ' kullanmazsan sarılan fonksiyonun adı, docstring\'i ve imzası kaybolur. Bu hem hata ayıklamayı hem de FastAPI gibi imzaya bakan çatıları bozar. Dekoratörler kesişen ilgileri (cross-cutting concerns) iş mantığından ayırmanın temiz bir yoludur, ama çok katmanlı dekoratör zinciri akışı gizleyebilir.</p>',
     follow=['Birden fazla dekoratör üst üste yazılırsa hangi sırayla uygulanır?', 'Sınıf tabanlı bir dekoratör nasıl yazılır?'],
     flags=['Dekoratörün çağrı anında değil tanım anında uygulandığını bilmemek', 'functools.wraps\'tan hiç söz etmemek'],
     tip='Tanım + kısa bir kod + iki gerçek kullanım örneği; üçü birlikte tam bir cevaptır.'),

dict(roles=['genel'], lv='orta', topic='functools.wraps', kind='kod-okuma',
     q='Aşağıdaki iki dekoratör arasındaki fark çıktıda nasıl görünür?',
     code='import functools\n\ndef yalin(f):\n    def sarici(*a, **k):\n        return f(*a, **k)\n    return sarici\n\ndef duzgun(f):\n    @functools.wraps(f)\n    def sarici(*a, **k):\n        return f(*a, **k)\n    return sarici\n\n@yalin\ndef fatura_kes():\n    """Fatura üretir."""\n\n@duzgun\ndef iade_et():\n    """İade kaydı açar."""\n\nprint(fatura_kes.__name__, fatura_kes.__doc__)\nprint(iade_et.__name__, iade_et.__doc__)\nprint(iade_et.__wrapped__.__name__)\n',
     out='sarici None\niade_et İade kaydı açar.\niade_et',
     a='<p>Dekoratör, orijinal fonksiyonun yerine <i>yeni</i> bir fonksiyon (' + c('sarici') + ') koyar. ' + c('yalin') + ' bu yeni fonksiyonun meta verisini düzeltmediği için ' + c('fatura_kes.__name__') + ' artık ' + c('"sarici"') + ' ve docstring ' + c('None') + ' olur.</p>'
       '<p>' + c('functools.wraps(f)') + ' (içeride ' + c('update_wrapper') + ') şu alanları sarıcıya kopyalar: ' + c('__name__') + ', ' + c('__qualname__') + ', ' + c('__doc__') + ', ' + c('__module__') + ', ' + c('__dict__') + '; ayrıca orijinal fonksiyonu ' + c('__wrapped__') + ' özelliğine koyar. Bu yüzden ikinci satır doğru adı ve docstring\'i gösterir, üçüncü satır da orijinale ulaşabildiğimizi kanıtlar.</p>'
       '<p><b>Pratik etkisi:</b> Loglarda ve hata izlerinde doğru fonksiyon adı görünür; ' + c('help()') + ' ve Sphinx doğru belge üretir; ' + c('inspect.signature') + ' ' + c('__wrapped__') + ' zincirini izleyerek gerçek imzayı bulur. FastAPI ve pytest fixture\'ları imzaya baktığı için wraps olmadan parametreler kaybolabilir. Testte dekoratörü atlayıp orijinali çağırmak için de ' + c('__wrapped__') + ' kullanılır.</p>',
     follow=['inspect.signature, __wrapped__ olmadan neyi gösterirdi?', 'wraps sarıcının imzasını gerçekten değiştirir mi?'],
     flags=['wraps\'ı yalnızca "isim güzel görünsün diye" açıklamak', '__wrapped__ özelliğini hiç bilmemek'],
     tip='Kısa cevap: "wraps meta veriyi taşır ve __wrapped__ ekler." Ardından FastAPI/pytest gibi gerçek bir etki söyle.'),

dict(roles=['genel'], lv='ileri', topic='Parametreli dekoratör', kind='kod-okuma',
     q='Anadolu Bank\'ın dış servis çağrıları için yazılmış bu yeniden deneme dekoratörünün çıktısı nedir?',
     code='import functools\n\ndef tekrar_dene(kez):\n    def dekorator(f):\n        @functools.wraps(f)\n        def sarici(*args, **kwargs):\n            for deneme in range(1, kez + 1):\n                try:\n                    return f(*args, **kwargs)\n                except ConnectionError as e:\n                    print(f"deneme {deneme}: {e}")\n            raise RuntimeError("servis yanıt vermedi")\n        return sarici\n    return dekorator\n\ncagri = {"n": 0}\n\n@tekrar_dene(kez=3)\ndef kur_getir():\n    cagri["n"] += 1\n    if cagri["n"] < 3:\n        raise ConnectionError("zaman aşımı")\n    return 32.75\n\nprint(kur_getir())\nprint(cagri["n"])\n',
     out='deneme 1: zaman aşımı\ndeneme 2: zaman aşımı\n32.75\n3',
     a='<p>Parametreli bir dekoratör <b>üç katmanlıdır</b>: ' + c('tekrar_dene(kez=3)') + ' önce çağrılır ve asıl dekoratörü döndürür; bu dekoratör ' + c('kur_getir') + '\'i alıp ' + c('sarici') + '\'yı döndürür. Yani ' + c('@tekrar_dene(kez=3)') + ' şuna denktir: ' + c('kur_getir = tekrar_dene(kez=3)(kur_getir)') + '. ' + c('kez') + ' değeri closure ile sarıcıda yaşamaya devam eder.</p>'
       '<p>Akış: 1. ve 2. çağrıda ' + c('ConnectionError') + ' fırlar, yakalanıp loglanır. 3. çağrıda 32.75 döner ve ' + c('return') + ' döngüden hemen çıkar. Sayaç 3\'tür.</p>'
       '<p><b>Üretimde eksikler:</b> Denemeler arasında üstel bekleme ve rastgele sapma (exponential backoff + jitter) yoksa servis toparlanmaya çalışırken onu yükle boğarsın. Son hatayı ' + c('raise RuntimeError(...) from e') + ' ile zincirlemek kök nedeni korur. Yalnızca geçici hatalar (zaman aşımı, 503) yeniden denenmeli; 400 gibi kalıcı hatalar denenmemeli. Para transferi gibi yan etkili çağrılar ancak idempotent ise yeniden denenebilir. Hazır çözüm olarak ' + c('tenacity') + ' kütüphanesi kullanılabilir.</p>',
     follow=['Dekoratörü hem @tekrar_dene hem @tekrar_dene(kez=5) biçiminde çalışacak şekilde nasıl yazarsın?', 'Para transferi çağrısını yeniden denemek neden tehlikeli olabilir?'],
     flags=['Katman sayısını açıklayamamak', 'Yan etkili çağrıları körü körüne yeniden denemeyi önermek'],
     tip='Çıktıyı verdikten sonra "üretimde backoff ve idempotency eklerdim" demek seni kıdemli gösterir.'),

dict(roles=['genel'], lv='temel', topic='Bağlam yöneticileri', kind='kavram',
     q='Bağlam yöneticisi (context manager) nedir? ' + '<code>with</code> ifadesi arka planda ne yapar?',
     a='<p><b>Tanım:</b> Bağlam yöneticisi, bir kaynağın <i>edinilmesini ve bırakılmasını</i> garanti eden nesnedir. ' + c('with') + ' bloğuna girerken ' + c('__enter__') + ', çıkarken (hata olsa bile) ' + c('__exit__') + ' çağrılır.</p>'
       '<p><b>Arka planda kabaca:</b></p>'
       + pre('yonetici = open("rapor.csv")\ndosya = yonetici.__enter__()\ntry:\n    ...  # with bloğu\nfinally:\n    yonetici.__exit__(tip, deger, iz)  # hata yoksa üçü de None')
       + '<p><b>Kullanım alanları:</b> dosyalar, veritabanı bağlantıları ve transaction\'lar (' + c('with conn:') + ' commit/rollback yapar), kilitler (' + c('with lock:') + '), geçici dizinler, zaman ölçümü, ' + c('unittest.mock.patch') + '.</p>'
       '<p><b>Yazmanın iki yolu:</b> ' + c('__enter__/__exit__') + ' tanımlayan bir sınıf ya da ' + c('contextlib.contextmanager') + ' ile ' + c('yield') + ' kullanan bir üreteç. Ayrıca ' + c('contextlib.suppress') + ', ' + c('ExitStack') + ' (dinamik sayıda kaynak) ve async versiyonu ' + c('async with') + ' / ' + c('__aenter__') + ' vardır. Asıl değeri, ' + c('try/finally') + ' tekrarını ortadan kaldırıp kaynak sızıntısını önlemesidir.</p>',
     follow=['contextmanager ile yazılmış bir yöneticide yield\'den sonra hata olursa ne olur?', 'ExitStack hangi problemi çözer?'],
     flags=['with\'i yalnızca dosyalar için bilmek', '__exit__\'in hata durumunda da çalıştığını söylememek'],
     tip='with bloğunun try/finally karşılığını kısaca yazabilirsen soru çoğu zaman orada kapanır.'),

dict(roles=['genel'], lv='ileri', topic='__exit__ ve istisna bastırma', kind='kod-okuma',
     q='Bu bağlam yöneticisi bir hatayı yutuyor, diğerini yutmuyor. Çıktı nedir?',
     code='class HataGormezden:\n    def __init__(self, *tipler):\n        self.tipler = tipler\n    def __enter__(self):\n        print("giriş")\n        return self\n    def __exit__(self, tip, deger, iz):\n        print("çıkış:", tip.__name__ if tip else None)\n        return tip is not None and issubclass(tip, self.tipler)\n\nwith HataGormezden(KeyError):\n    {}["stok"]\nprint("devam 1")\ntry:\n    with HataGormezden(KeyError):\n        int("on iki")\nexcept ValueError:\n    print("ValueError dışarı çıktı")\n',
     out='giriş\nçıkış: KeyError\ndevam 1\ngiriş\nçıkış: ValueError\nValueError dışarı çıktı',
     a='<p>' + c('__exit__(tip, deger, iz)') + ' üç argüman alır: blokta hata yoksa üçü de ' + c('None') + '\'dır. Metodun <b>dönüş değeri</b> kritiktir: doğru (truthy) bir değer dönerse istisna <i>bastırılır</i> ve program ' + c('with') + ' bloğundan sonraki satırdan devam eder; yanlış değer (veya ' + c('None') + ') dönerse istisna yayılmaya devam eder.</p>'
       '<p>İlk blokta ' + c('KeyError') + ' oluşur; ' + c('__exit__') + ' True döndürür, hata yutulur ve "devam 1" basılır. İkinci blokta ' + c('ValueError') + ' oluşur; ' + c('issubclass(ValueError, (KeyError,))') + ' False olduğundan hata dışarı çıkar ve dıştaki ' + c('try') + ' onu yakalar. Her iki durumda da ' + c('__exit__') + ' çalışır; bu, temizlik garantisinin kaynağıdır.</p>'
       '<p>Standart kütüphanedeki ' + c('contextlib.suppress(KeyError)') + ' tam olarak bunu yapar. <b>Tehlike:</b> Yanlışlıkla her zaman ' + c('True') + ' döndüren bir ' + c('__exit__') + ' tüm hataları sessizce yutar ve hata ayıklamayı kabusa çevirir. Bu yüzden genel kural: istisnayı bastırmak istemiyorsan hiçbir şey döndürme.</p>',
     follow=['contextmanager tabanlı yöneticide bir istisnayı nasıl bastırırsın?', '__exit__ içinde yeni bir istisna fırlarsa ne olur?'],
     flags=['__exit__\'in dönüş değerinin önemini bilmemek', 'Hata olunca __exit__\'in çalışmadığını sanmak'],
     tip='"True dönerse yutulur" kuralını ilk cümlede söyle, sonra iki bloğu bu kurala göre izle.'),

dict(roles=['genel'], lv='temel', topic='*args ve **kwargs', kind='kod-okuma',
     q='Aşağıdaki çağrıların çıktısı nedir? ' + '<code>*args</code> ve <code>**kwargs</code> ne işe yarar?',
     code='def kargo(gonderen, *paketler, hizli=False, **ekstra):\n    print(gonderen, paketler, hizli, ekstra)\n\nkargo("Anadolu Market")\nkargo("Anadolu Market", 2.5, 1.0, hizli=True, sigorta="evet")\nagirliklar = [3, 4]\nsecenek = {"hizli": True, "not": "kırılacak"}\nkargo("Lezzet Kurye", *agirliklar, **secenek)\n',
     out="Anadolu Market () False {}\nAnadolu Market (2.5, 1.0) True {'sigorta': 'evet'}\nLezzet Kurye (3, 4) True {'not': 'kırılacak'}",
     a='<p>Tanımda ' + c('*paketler') + ' fazladan gelen <b>konumsal</b> argümanları bir <b>tuple</b>\'da, ' + c('**ekstra') + ' tanımlanmamış <b>isimli</b> argümanları bir <b>dict</b>\'te toplar. İsimler gelenekseldir; önemli olan yıldızlardır.</p>'
       '<p>' + c('*paketler') + '\'den sonra gelen ' + c('hizli') + ' artık <i>yalnızca anahtar sözcükle</i> (keyword-only) verilebilir; konumsal bir değer ona asla düşmez. İlk çağrıda hiçbir ek argüman yok: boş tuple, ' + c('False') + ', boş dict. İkinci çağrıda 2.5 ve 1.0 tuple\'a, ' + c('hizli=True') + ' parametresine, ' + c('sigorta') + ' ise ' + c('ekstra') + '\'ya gider.</p>'
       '<p>Çağrı tarafında yıldızlar ters işi yapar: ' + c('*agirliklar') + ' listeyi konumsal argümanlara, ' + c('**secenek') + ' sözlüğü isimli argümanlara açar. Sözlükteki ' + c('"hizli"') + ' anahtarı aynı adlı parametreye eşleşir, ' + c('"not"') + ' ise ' + c('ekstra') + '\'ya düşer.</p>'
       '<p><b>Kullanım:</b> dekoratörlerde argümanları aynen iletmek, esnek API\'ler ve üst sınıfa parametre aktarmak. Aşırı kullanımı ise imzayı belirsizleştirir ve IDE desteğini azaltır.</p>',
     follow=['Aynı parametre hem konumsal hem anahtar sözcükle verilirse ne olur?', 'Tanımdaki parametre sırası kuralı nedir?'],
     flags=['args\'ın liste olduğunu söylemek (tuple\'dır)', 'Çağrı tarafındaki * ve ** açmayı bilmemek'],
     tip='Tanımdaki yıldız "toplar", çağrıdaki yıldız "açar" diye özetle; akılda kalıcı ve doğru.'),

dict(roles=['genel'], lv='orta', topic='Parametre türleri: / ve *', kind='kavram',
     q='Fonksiyon imzasında ' + '<code>/</code> ve tek başına <code>*</code> ne anlama gelir? Neden kullanılır?',
     a='<p>Python 3.8\'den itibaren (PEP 570) parametreleri üç gruba ayırabilirsin:</p>'
       + pre('def havale(iban, tutar, /, aciklama="", *, acil=False):\n    ...')
       + '<ul><li><b>' + c('/') + ' öncesi — yalnızca konumsal:</b> ' + c('iban') + ' ve ' + c('tutar') + ' isimle verilemez; ' + c('havale(iban="TR...")') + ' TypeError verir.</li>'
       '<li><b>Arası — normal:</b> ' + c('aciklama') + ' hem konumsal hem isimle verilebilir.</li>'
       '<li><b>' + c('*') + ' sonrası — yalnızca anahtar sözcük:</b> ' + c('acil') + ' mutlaka ' + c('acil=True') + ' biçiminde yazılmalı.</li></ul>'
       '<p><b>Neden?</b> Yalnızca anahtar sözcük parametreleri, ' + c('havale(iban, 500, "", True)') + ' gibi anlamı okunmayan "boolean tuzağı" çağrılarını engeller ve okunabilirliği artırır. Yalnızca konumsal parametreler ise parametre adını API sözleşmesinden çıkarır: kütüphane yazarı sonradan adı değiştirse bile kullanıcı kodu bozulmaz. Ayrıca ' + c('**kwargs') + ' ile isim çakışmasını önler. Gömülü fonksiyonlar uzun süredir böyledir; örneğin ' + c('len(obj=[])') + ' çalışmaz.</p>',
     follow=['Hangi standart kütüphane fonksiyonları yalnızca konumsal parametre kullanır?', 'Bu kısıtlar dataclass alanlarında nasıl ifade edilir (kw_only)?'],
     flags=['Tek başına *\'ı *args ile karıştırmak', '/ işaretini hiç duymamış olmak'],
     tip='Bir bankacılık API örneğiyle "boolean tuzağı"nı anlat; tasarım bilinci gösterir.'),

dict(roles=['genel'], lv='orta', topic='LEGB ve UnboundLocalError', kind='kod-okuma',
     q='Bu kod neden hata veriyor? Hangi hata?',
     code='stok = 10\n\ndef sat(adet):\n    if adet > stok:\n        return "yetersiz"\n    stok = stok - adet\n    return stok\n\nprint(sat(3))\n',
     out="UnboundLocalError: cannot access local variable 'stok' where it is not associated with a value",
     a='<p>Python isimleri <b>LEGB</b> sırasıyla arar: <b>L</b>ocal (fonksiyon içi), <b>E</b>nclosing (dış fonksiyon), <b>G</b>lobal (modül), <b>B</b>uilt-in (' + c('len') + ', ' + c('print') + '…).</p>'
       '<p>Kritik nokta: Bir ismin yerel olup olmadığına <i>çalışma anında değil, derleme anında</i> karar verilir. Fonksiyon gövdesinin <b>herhangi bir yerinde</b> ' + c('stok = ...') + ' ataması olduğu için ' + c('stok') + ' tüm fonksiyon boyunca yerel kabul edilir. Bu yüzden ilk satırdaki ' + c('adet > stok') + ' karşılaştırması, henüz değer atanmamış yerel ' + c('stok') + '\'u okumaya çalışır ve ' + c('UnboundLocalError') + ' fırlar (' + c('NameError') + '\'un alt sınıfı).</p>'
       '<p><b>Çözümler:</b></p><ul><li>En iyisi: global durumu değiştirmek yerine değeri parametre al, yenisini döndür: ' + c('def sat(stok, adet): ...') + '.</li>'
       '<li>Gerçekten modül değişkeni değişecekse ' + c('global stok') + ' bildir (test edilebilirliği düşürür).</li>'
       '<li>Durumu bir sınıfta tut: ' + c('self.stok -= adet') + '.</li></ul>'
       '<p>Not: Yalnızca okumak serbesttir; ' + c('global') + ' sadece yeniden atama için gerekir. Bir listeye ' + c('append') + ' yapmak atama olmadığı için hata vermez.</p>',
     follow=['Aynı fonksiyon içinde yalnızca print(stok) olsaydı çalışır mıydı?', 'nonlocal ile global farkı nedir?'],
     flags=['"Python yukarıdan aşağı okur, önce global stok\'u kullanır" demek', 'Çözüm olarak her yerde global önermek'],
     tip='"Yerel olup olmadığına derleme anında karar verilir" cümlesi bu sorunun anahtarıdır.'),

dict(roles=['genel'], lv='orta', topic='nonlocal ve closure', kind='kod-okuma',
     q='Pusula İK için başvuru numarası üreten bu sayaçların çıktısı nedir?',
     code='def sayac_olustur(onek):\n    n = 0\n    def sonraki():\n        nonlocal n\n        n += 1\n        return f"{onek}-{n:03d}"\n    return sonraki\n\nik = sayac_olustur("IK")\nmuh = sayac_olustur("MUH")\nprint(ik(), ik(), muh())\nprint(ik.__closure__[0].cell_contents)\n',
     out='IK-001 IK-002 MUH-001\n2',
     a='<p>' + c('sonraki') + ' bir <b>closure</b>\'dır: dış fonksiyon bittikten sonra bile onun yerel değişkenlerine (' + c('onek') + ', ' + c('n') + ') erişir. Bu değişkenler "hücre" (cell) nesnelerinde yaşar ve ' + c('__closure__') + ' üzerinden görülebilir.</p>'
       '<p>' + c('nonlocal n') + ' bildirimi olmasaydı ' + c('n += 1') + ' bir atama olduğu için ' + c('n') + ' yerel sayılır ve ' + c('UnboundLocalError') + ' alınırdı. ' + c('nonlocal') + ', ismin en yakın dış fonksiyon kapsamındaki değişkeni gösterdiğini söyler (' + c('global') + ' ise modül düzeyini).</p>'
       '<p>Her ' + c('sayac_olustur') + ' çağrısı <b>ayrı</b> bir kapsam ve ayrı hücreler oluşturur; bu yüzden ' + c('ik') + ' ve ' + c('muh') + ' birbirinden bağımsız sayar: IK-001, IK-002, MUH-001. Son satır ' + c('ik') + '\'nin ilk hücresinin içeriğini, yani ' + c('n') + '\'nin şu anki değerini (2) gösterir. Hücrelerin sırası serbest değişken adlarının alfabetik sırasıdır: ' + c('("n", "onek")') + '.</p>'
       '<p>Closure\'lar küçük durum tutmak için sınıfa hafif bir alternatiftir. Durum büyüyorsa ya da birden çok metot gerekiyorsa sınıf daha okunaklıdır.</p>',
     follow=['Aynı sayacı bir sınıfla veya itertools.count ile nasıl yazardın?', 'Closure ile sınıf arasında ne zaman hangisini seçersin?'],
     flags=['İki sayacın ortak n kullandığını düşünmek', 'nonlocal ile global\'i karıştırmak'],
     tip='Her dış çağrının yeni bir kapsam yarattığını açıkça söyle; sorunun püf noktası bu.'),

dict(roles=['genel'], lv='ileri', topic='Geç bağlama (late binding)', kind='kod-okuma',
     q='Kanat Havayolları için kapı numaralarına göre anons fonksiyonları üretiyoruz. Çıktı beklendiği gibi değil; neden?',
     code='anonslar = []\nfor kapi in [3, 7, 12]:\n    anonslar.append(lambda: f"Kapı {kapi}")\nprint([f() for f in anonslar])\n\nduzeltilmis = [lambda k=kapi: f"Kapı {k}" for kapi in [3, 7, 12]]\nprint([f() for f in duzeltilmis])\n',
     out="['Kapı 12', 'Kapı 12', 'Kapı 12']\n['Kapı 3', 'Kapı 7', 'Kapı 12']",
     a='<p>Closure\'lar değişkenin <b>değerini değil, değişkenin kendisini</b> yakalar. Değer, fonksiyon <i>çağrıldığı anda</i> aranır (geç bağlama). Üç lambda da aynı ' + c('kapi') + ' değişkenine bakar; çağırdığımızda döngü bitmiş ve ' + c('kapi') + ' son değeri olan 12\'de kalmıştır. Sonuç: üç kez "Kapı 12".</p>'
       '<p><b>Çözümler:</b></p><ul><li><b>Varsayılan argüman hilesi:</b> ' + c('lambda k=kapi: ...') + '. Varsayılanlar tanım anında değerlendirildiği için o anki değer donar. İkinci satır bu yüzden doğru çalışır.</li>'
       '<li><b>' + c('functools.partial') + ':</b> ' + c('partial(anons, kapi)') + '. Niyeti daha açık gösterir ve imzaya fazladan parametre eklemez.</li>'
       '<li><b>Fabrika fonksiyonu:</b> ' + c('def yap(k): return lambda: f"Kapı {k}"') + '. Her çağrı yeni bir kapsam yaratır.</li></ul>'
       '<p>Bu sorun yalnızca lambda\'ya özgü değildir; döngüde tanımlanan her iç fonksiyon, GUI buton callback\'leri ve asyncio görevleri de aynı tuzağa düşer. Varsayılan argüman hilesinin yan etkisi: çağıran kişi yanlışlıkla ' + c('f(99)') + ' diyerek değeri ezebilir.</p>',
     follow=['partial ile çözüm neden varsayılan argümandan daha temizdir?', 'Kavrayış (comprehension) kendi kapsamına sahipken neden yine aynı sorun oluşuyor?'],
     flags=['"lambda hatalı çalışıyor" demek', 'Sorunun döngü değişkeninin kopyalanmamasından kaynaklandığını açıklayamamak'],
     tip='"Değeri değil değişkeni yakalar" cümlesiyle başla; ardından iki farklı çözüm sun.'),
]
