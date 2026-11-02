from part1 import pre, c

Q = [
dict(roles=['genel'], lv='temel', topic='__repr__ ve __str__', kind='kavram',
     q='' + '<code>__repr__</code> ile <code>__str__</code> arasındaki fark nedir? Bir sınıfta yalnızca birini yazacaksan hangisini seçersin?',
     a='<p><b>' + c('__str__') + '</b> son kullanıcıya yönelik, okunaklı gösterimdir; ' + c('print(x)') + ', ' + c('str(x)') + ' ve f-string\'teki ' + c('{x}') + ' bunu kullanır. <b>' + c('__repr__') + '</b> geliştiriciye yöneliktir: açık, belirsizlik içermeyen ve mümkünse nesneyi yeniden oluşturabilecek bir ifade olmalıdır. REPL, hata ayıklayıcı, loglar ve <i>kapların içindeki elemanlar</i> (' + c('print([x])') + ') ' + c('__repr__') + ' kullanır.</p>'
       + pre('class Hesap:\n    def __init__(self, iban, bakiye):\n        self.iban, self.bakiye = iban, bakiye\n    def __repr__(self):\n        return f"Hesap(iban={self.iban!r}, bakiye={self.bakiye!r})"\n    def __str__(self):\n        return f"{self.iban[-4:]} sonlu hesap: {self.bakiye:,.2f} TL"')
       + '<p><b>Yalnızca birini yazacaksam ' + c('__repr__') + '.</b> Çünkü ' + c('__str__') + ' tanımlı değilse Python ' + c('__repr__') + '\'a geri düşer; tersi geçerli değildir. Varsayılan ' + c('__repr__') + ' ise ' + c('<Hesap object at 0x...>') + ' gibi işe yaramaz bir çıktı verir.</p>'
       '<p>Pratik ipuçları: f-string\'te ' + c('{x!r}') + ' repr\'i zorlar. ' + c('@dataclass') + ' otomatik ve kullanışlı bir ' + c('__repr__') + ' üretir. Hassas verileri (parola, tam kart numarası) ' + c('__repr__') + '\'a koyma; loglara sızar.</p>',
     follow=['Bir listeyi print ettiğinde elemanların hangi gösterimi kullanılır?', 'repr içinde neden !r ile alanları yazmak iyi bir alışkanlıktır?'],
     flags=['İkisinin aynı şey olduğunu söylemek', 'Geri düşme (fallback) yönünü ters bilmek'],
     tip='"Yalnızca birini yazacaksan __repr__" cevabını gerekçesiyle ver; mülakatçılar bu ayrıntıyı sever.'),

dict(roles=['genel'], lv='ileri', topic='__eq__ ve __hash__', kind='kod-okuma',
     q='Ürün sınıfına ' + '<code>__eq__</code> ekledik ve kümede kullanmaya çalıştık. Ne olur?',
     code='class Urun:\n    def __init__(self, kod):\n        self.kod = kod\n    def __eq__(self, diger):\n        return isinstance(diger, Urun) and self.kod == diger.kod\n\nprint(Urun("A1") == Urun("A1"))\nprint(Urun.__hash__)\nsepet = {Urun("A1")}\n',
     out="True\nNone\nTypeError: unhashable type: 'Urun'",
     a='<p>İlk iki satır çalışır: eşitlik True, ' + c('Urun.__hash__') + ' ise ' + c('None') + '. Son satır ' + c('TypeError: unhashable type: \'Urun\'') + ' verir.</p>'
       '<p><b>Neden?</b> Python\'da temel sözleşme şudur: ' + c('a == b') + ' ise ' + c('hash(a) == hash(b)') + ' olmalıdır. Varsayılan ' + c('__hash__') + ' nesnenin kimliğine (' + c('id') + ') dayanır. Sen ' + c('__eq__') + '\'yu değere göre tanımlayınca eski kimlik tabanlı hash bu sözleşmeyi bozacağı için Python, sınıfta ' + c('__eq__') + ' tanımlanıp ' + c('__hash__') + ' tanımlanmadığında ' + c('__hash__ = None') + ' yapar ve nesneyi hash\'lenemez kılar.</p>'
       '<p><b>Çözüm:</b> Eşitlikte kullandığın alanlardan hash üret ve bu alanları değişmez tut:</p>'
       + pre('def __hash__(self):\n    return hash(self.kod)')
       + '<p>Ya da ' + c('@dataclass(frozen=True)') + ' kullan; ' + c('__eq__') + ' ve ' + c('__hash__') + ' birlikte, tutarlı üretilir. <b>Uyarı:</b> Nesne kümedeyken ' + c('kod') + ' değiştirilirse eleman "kaybolur": yanlış kovada aranır ve ' + c('in') + ' False döner.</p>',
     follow=['Hash\'i hesaplanan bir nesneyi kümeye koyduktan sonra değiştirirsen ne olur?', 'dataclass(eq=True, frozen=False) iken __hash__ nasıl ayarlanır?'],
     flags=['"Hash yalnızca performans içindir" deyip sözleşmeyi bilmemek', 'Hash\'e değişebilir alanları dahil etmeyi önermek'],
     tip='"Eşit olanların hash\'i eşit olmalı" kuralını cümlenin başına koy, sonra Python\'un neden None yaptığını açıkla.'),

dict(roles=['genel'], lv='orta', topic='Operatör aşırı yükleme', kind='kod-okuma',
     q='Para sınıfında ' + '<code>sum()</code> çalışsın diye ne gerekir? Bu kodun çıktısı nedir?',
     code='class Para:\n    def __init__(self, kurus):\n        self.kurus = kurus\n    def __add__(self, diger):\n        if isinstance(diger, Para):\n            return Para(self.kurus + diger.kurus)\n        return NotImplemented\n    def __radd__(self, diger):\n        if diger == 0:\n            return self\n        return self.__add__(diger)\n    def __repr__(self):\n        return f"{self.kurus // 100},{self.kurus % 100:02d} TL"\n\nfaturalar = [Para(1250), Para(999), Para(51)]\nprint(sum(faturalar))\nprint(Para(100) + Para(5))\n',
     out='23,00 TL\n1,05 TL',
     a='<p>' + c('sum(liste)') + ' başlangıç değeri olarak <b>0</b> kullanır: ' + c('0 + Para(1250)') + ' hesaplanmaya çalışılır. Önce ' + c('int.__add__(0, Para)') + ' denenir; int bu tipi tanımadığı için ' + c('NotImplemented') + ' döner. Python sonra sağ işlenenin <b>yansıtılmış</b> metodunu, yani ' + c('Para.__radd__(0)') + '\'ı çağırır. Bizim ' + c('__radd__') + ' sıfırı görünce nesnenin kendisini döndürür, sonraki toplamalar normal ' + c('__add__') + ' ile ilerler: 1250 + 999 + 51 = 2300 kuruş = "23,00 TL".</p>'
       '<p><b>' + c('NotImplemented') + ' neden önemli?</b> ' + c('TypeError') + ' fırlatmak yerine onu döndürmek, Python\'a "öbür tarafa sor" demektir. Hiçbir taraf işlemi desteklemezse Python düzgün bir ' + c('TypeError') + ' üretir. ' + c('NotImplemented') + ' ile ' + c('NotImplementedError') + ' istisnasını karıştırma.</p>'
       '<p><b>Tasarım notu:</b> Parayı ' + c('float') + ' yerine tamsayı kuruş (ya da ' + c('Decimal') + ') olarak tutmak yuvarlama hatalarını önler. Alternatif olarak ' + c('sum(faturalar, Para(0))') + ' ile başlangıç değeri vermek de ' + c('__radd__') + ' ihtiyacını ortadan kaldırır.</p>',
     follow=['__iadd__ tanımlamazsan += nasıl çalışır?', 'Farklı para birimleri toplanırsa nasıl davranmalı?'],
     flags=['NotImplemented yerine TypeError fırlatmak', 'Parayı float ile tutmayı sorun görmemek'],
     tip='Çıktıyı söyledikten sonra sum\'ın 0 ile başladığını ve __radd__ zincirini açıkla; puan oradadır.'),

dict(roles=['genel'], lv='ileri', topic='MRO ve çoklu kalıtım', kind='kod-okuma',
     q='Elmas (diamond) kalıtımında ' + '<code>super()</code> zinciri nasıl ilerler? Çıktı nedir?',
     code='class Bildirim:\n    def gonder(self):\n        print("Bildirim")\n\nclass Eposta(Bildirim):\n    def gonder(self):\n        print("Eposta")\n        super().gonder()\n\nclass Sms(Bildirim):\n    def gonder(self):\n        print("Sms")\n        super().gonder()\n\nclass Coklu(Eposta, Sms):\n    def gonder(self):\n        print("Coklu")\n        super().gonder()\n\nCoklu().gonder()\nprint([k.__name__ for k in Coklu.__mro__])\n',
     out="Coklu\nEposta\nSms\nBildirim\n['Coklu', 'Eposta', 'Sms', 'Bildirim', 'object']",
     a='<p>Python, metot arama sırasını (MRO, Method Resolution Order) <b>C3 doğrusallaştırma</b> algoritmasıyla hesaplar. Kurallar: alt sınıf üst sınıflarından önce gelir, sınıf tanımındaki taban sırası (' + c('Eposta, Sms') + ') korunur ve her sınıf listede yalnızca bir kez yer alır. Sonuç: Coklu → Eposta → Sms → Bildirim → object.</p>'
       '<p>Kilit nokta: ' + c('super()') + ' "üst sınıfım" demek <b>değildir</b>; "MRO\'da benden sonraki sınıf" demektir. Bu yüzden ' + c('Eposta') + ' içindeki ' + c('super().gonder()') + ', ' + c('Bildirim') + '\'i değil ' + c('Sms') + '\'i çağırır. Böylece ortak taban ' + c('Bildirim') + ' yalnızca <b>bir kez</b> çalışır. Bu, iş birliğine dayalı (cooperative) çoklu kalıtımın temelidir.</p>'
       '<p><b>Dikkat:</b> Zincirdeki sınıflardan biri ' + c('super()') + ' yerine ' + c('Bildirim.gonder(self)') + ' yazarsa zincir kırılır, bazı sınıflar atlanır ya da iki kez çalışır. Uyumlu imza için ' + c('**kwargs') + ' iletmek yaygın bir kalıptır. Tutarlı bir MRO kurulamıyorsa Python sınıf tanımında ' + c('TypeError') + ' verir. Pratikte mixin\'ler dışında derin çoklu kalıtımdan kaçınıp bileşimi (composition) tercih etmek çoğu zaman daha okunaklıdır.</p>',
     follow=['Tutarsız MRO\'ya örnek verebilir misin?', 'Mixin sınıfları tasarlarken nelere dikkat edersin?'],
     flags=['super()\'nin doğrudan ebeveyni çağırdığını söylemek', 'Bildirim\'in iki kez basılacağını düşünmek'],
     tip='Önce __mro__ listesini yaz, sonra çıktıyı ondan türet; mülakatçıya sistematik düşündüğünü gösterir.'),

dict(roles=['genel'], lv='orta', topic='super()', kind='kavram',
     q='' + '<code>super().__init__()</code> çağırmayı unutursan ne olur? <code>super()</code> neden doğrudan üst sınıf adını yazmaktan daha iyidir?',
     a='<p><b>Unutursan:</b> Python üst sınıfın ' + c('__init__') + '\'ini otomatik çağırmaz. Alt sınıf kendi ' + c('__init__') + '\'ini tanımladıysa üst sınıfın kurduğu özellikler hiç oluşmaz ve ilk erişimde ' + c('AttributeError') + ' alınır. Örneğin bir ' + c('Calisan(Kisi)') + ' sınıfında ' + c('self.ad') + ' tanımsız kalır. Django modellerinde veya ' + c('Exception') + ' alt sınıflarında bu, garip hatalara yol açar.</p>'
       + pre('class Calisan(Kisi):\n    def __init__(self, ad, departman):\n        super().__init__(ad)\n        self.departman = departman')
       + '<p><b>' + c('super()') + ' neden daha iyi?</b></p><ul><li>Sınıf adını sabit kodlamazsın; taban sınıf değişince tek yer düzelir.</li>'
       '<li>Çoklu kalıtımda MRO\'ya uyar: bir sonraki sınıfı çağırır, böylece ortak taban bir kez çalışır. ' + c('Kisi.__init__(self, ad)') + ' yazmak zinciri kırar.</li>'
       '<li>Mixin\'lerin araya girmesine izin verir.</li></ul>'
       '<p>Python 3\'te argümansız ' + c('super()') + ' derleyicinin eklediği ' + c('__class__') + ' hücresi sayesinde çalışır. Bu yüzden sınıf dışında tanımlanıp sonradan eklenen fonksiyonlarda argümansız kullanılamaz. ' + c('super()') + ' yalnızca ' + c('__init__') + ' için değil, her metot için geçerlidir.</p>',
     follow=['super() sınıf metodunda (classmethod) nasıl çalışır?', '__init__ dışındaki metotlarda super ne zaman gerekir?'],
     flags=['"Python üst sınıfın __init__\'ini otomatik çağırır" demek', 'super\'i yalnızca tekli kalıtım bağlamında açıklamak'],
     tip='Somut bir AttributeError senaryosu ve MRO\'dan kısa bir söz; ikisi birlikte cevabı tamamlar.'),

dict(roles=['genel'], lv='ileri', topic='Metaclass', kind='kavram',
     q='Metaclass nedir? Gerçek hayatta ne zaman kullanırsın, ne zaman daha basit bir alternatif seçersin?',
     a='<p><b>Tanım:</b> Python\'da sınıflar da nesnedir; sınıfları üreten "sınıfın sınıfı"na metaclass denir. Varsayılan metaclass ' + c('type') + '\'tır: ' + c('type(int)') + ' → ' + c('type') + '. ' + c('class X: ...') + ' yazdığında Python kabaca ' + c('X = type("X", (taban,), namespace)') + ' çağırır. Kendi metaclass\'ın ' + c('type') + '\'tan türer ve ' + c('__new__') + ' / ' + c('__init__') + ' ile sınıf <i>oluşturulurken</i> araya girer.</p>'
       '<p><b>Gerçek kullanımlar:</b> Django ORM\'nin ' + c('ModelBase') + '\'i alan tanımlarını toplayıp tablo meta verisine çevirir; ' + c('abc.ABCMeta') + ' soyut metotları zorunlu kılar; ' + c('enum.EnumMeta') + ' üyeleri yönetir; SQLAlchemy\'nin declarative tabanı da benzer işi yapar. Ortak nokta: sınıf tanımını bir DSL gibi yorumlayan çatı kodları.</p>'
       '<p><b>Daha basit alternatifler (çoğu zaman yeterli):</b></p><ul><li>' + c('__init_subclass__') + ' (3.6+): alt sınıfları kaydetmek veya doğrulamak.</li>'
       '<li>Sınıf dekoratörü: tanımdan sonra sınıfı değiştirmek (' + c('@dataclass') + ' böyle çalışır).</li>'
       '<li>' + c('__set_name__') + ' ile tanımlayıcılar (descriptor): alan düzeyinde davranış.</li></ul>'
       '<p>Tim Peters\'ın özlü sözü: "Metaclass\'a gerçekten ihtiyacın olup olmadığını merak ediyorsan, ihtiyacın yoktur." Metaclass çakışmaları ve okunabilirlik maliyeti nedeniyle uygulama kodunda nadiren gerekir.</p>',
     follow=['__init_subclass__ ile bir eklenti kayıt sistemi nasıl yazılır?', 'İki farklı metaclass\'a sahip sınıflardan türetince ne olur?'],
     flags=['Metaclass\'ı kalıtımla karıştırmak', 'Her sorun için metaclass önermek'],
     tip='Tanım, bir çatı örneği (Django/ABC) ve "önce __init_subclass__ veya dekoratörü düşünürüm" üçlüsü güçlü bir cevaptır.'),

dict(roles=['genel'], lv='ileri', topic='__init_subclass__ ile kayıt', kind='kod-okuma',
     q='Anadolu Market\'in ödeme sağlayıcıları için kurulan bu kayıt (registry) düzeneğinin çıktısı nedir?',
     code='class OdemeSaglayici:\n    kayit = {}\n    def __init_subclass__(cls, kod, **kw):\n        super().__init_subclass__(**kw)\n        if kod in OdemeSaglayici.kayit:\n            raise ValueError(f"{kod} zaten kayıtlı")\n        OdemeSaglayici.kayit[kod] = cls\n\nclass Kart(OdemeSaglayici, kod="kart"):\n    pass\n\nclass Havale(OdemeSaglayici, kod="havale"):\n    pass\n\nprint(sorted(OdemeSaglayici.kayit))\nprint(OdemeSaglayici.kayit["havale"].__name__)\ntry:\n    class Kart2(OdemeSaglayici, kod="kart"):\n        pass\nexcept ValueError as e:\n    print("hata:", e)\n',
     out="['havale', 'kart']\nHavale\nhata: kart zaten kayıtlı",
     a='<p>' + c('__init_subclass__') + ', bir sınıftan <b>alt sınıf tanımlandığı anda</b> taban sınıfta çağrılan örtük bir ' + c('classmethod') + '\'dur. Sınıf başlığındaki ek anahtar sözcük argümanları (' + c('kod="kart"') + ') bu metoda iletilir.</p>'
       '<p>' + c('Kart') + ' ve ' + c('Havale') + ' tanımlanırken kendilerini sözlüğe kaydeder. ' + c('sorted') + ' anahtarları alfabetik sıralar. ' + c('Kart2') + ' aynı kodla tanımlanmaya çalışılınca sınıf oluşturma sırasında ' + c('ValueError') + ' fırlar; hatayı içe aktarma (import) anında, yani erken yakalamış oluruz.</p>'
       '<p><b>Neden kullanışlı?</b> Eklenti mimarisinde yeni bir ödeme yöntemi eklemek için merkezi bir ' + c('if/elif') + ' zincirini düzenlemen gerekmez; sınıfı yazmak yeterlidir. Kullanım: ' + c('OdemeSaglayici.kayit[yontem]()') + '. Bu, metaclass\'ın en yaygın kullanım amacını çok daha basit biçimde karşılar.</p>'
       '<p><b>Dikkat:</b> ' + c('super().__init_subclass__(**kw)') + ' çağrısı, çoklu kalıtımda diğer tabanların da kendi kancalarını çalıştırabilmesi için önemlidir. Kayıt yalnızca modül import edildiğinde gerçekleşir; eklenti modüllerini yüklemeyi unutursan kayıt boş kalır.</p>',
     follow=['Kayıt sözlüğünü OdemeSaglayici.kayit yerine cls.kayit ile güncellemek neden tehlikeli olabilir?', 'Bunu bir sınıf dekoratörüyle nasıl yapardın?'],
     flags=['__init_subclass__\'in örnek oluşturulurken çalıştığını sanmak', 'Hatanın Kart2() çağrılınca oluşacağını söylemek'],
     tip='"Sınıf tanımlandığı anda çalışır" vurgusunu yap; örnek oluşturma ile sınıf oluşturmayı ayırmak kritik.'),

dict(roles=['genel'], lv='orta', topic='Bellek yönetimi', kind='kavram',
     q='Python\'da bellek yönetimi nasıl çalışır? Referans sayımı ve çöp toplayıcının (garbage collector) rolleri nelerdir?',
     a='<p>CPython iki mekanizmayı birlikte kullanır:</p>'
       '<p><b>1. Referans sayımı (birincil):</b> Her nesne, kendisine kaç referans olduğunu sayar. Bir isme atama, listeye ekleme veya fonksiyona argüman olarak verme sayacı artırır; ' + c('del') + ', yeniden atama veya kapsam dışına çıkma azaltır. Sayaç 0 olduğu <i>anda</i> nesne serbest bırakılır. Bu deterministiktir; dosyalar çoğu zaman hemen kapanır. Gözlemlemek için: ' + c('sys.getrefcount(x)') + '.</p>'
       '<p><b>2. Döngüsel çöp toplayıcı (' + c('gc') + ' modülü):</b> ' + c('a.b = b; b.a = a') + ' gibi döngülerde sayaç hiçbir zaman 0 olmaz. Kuşak tabanlı (generational) GC, kapsayıcı nesneleri periyodik tarayarak dışarıdan erişilemeyen döngüleri bulur ve temizler. Yeni nesneler genç kuşaktadır ve daha sık taranır, çünkü çoğu nesne kısa ömürlüdür.</p>'
       '<p><b>Ek ayrıntılar:</b> Küçük nesneler için ' + c('pymalloc') + ' havuz ayırıcı kullanılır; bu yüzden serbest bırakılan bellek hemen işletim sistemine dönmeyebilir. ' + c('weakref') + ' sayacı artırmadan referans tutar ve önbelleklerde döngüleri önler.</p>'
       '<p><b>Pratikte bellek sızıntısı</b> genellikle büyüyen global önbellekler, kapanmayan kaynaklar veya sonsuza dek tutulan referanslardan kaynaklanır. Teşhis için ' + c('tracemalloc') + ' ile anlık görüntüleri karşılaştırırım.</p>',
     follow=['weakref ne zaman kullanılır?', 'Uzun süre çalışan bir serviste bellek sızıntısını nasıl ararsın?'],
     flags=['"Python\'da yalnızca GC var, referans sayımı yok" demek', '"Python\'da bellek sızıntısı olmaz" demek'],
     tip='İki mekanizmayı ayrı ayrı adlandır ve döngüsel referans örneğiyle GC\'nin neden gerektiğini göster.'),

dict(roles=['genel'], lv='ileri', topic='__slots__', kind='kavram',
     q='' + '<code>__slots__</code> nedir, ne kazandırır ve hangi durumlarda sorun çıkarır?',
     a='<p>Normalde her örnek, özniteliklerini kendine ait bir ' + c('__dict__') + ' sözlüğünde tutar. Sınıfta ' + c('__slots__ = ("enlem", "boylam", "zaman")') + ' tanımlarsan Python bu sözlüğü oluşturmaz; öznitelikler için sabit yuvalar (descriptor\'lar) ayırır.</p>'
       '<p><b>Kazanç:</b></p><ul><li><b>Bellek:</b> Milyonlarca küçük nesnede (ör. Pedal İzmir\'in GPS noktaları) örnek başına onlarca bayt tasarruf sağlanır; toplamda yüzlerce MB\'a varabilir.</li>'
       '<li><b>Hız:</b> Öznitelik erişimi biraz daha hızlıdır.</li>'
       '<li><b>Güvenlik:</b> Yanlış yazılmış bir öznitelik (' + c('nokta.enlm = 1') + ') ' + c('AttributeError') + ' verir; sessizce yeni alan oluşmaz.</li></ul>'
       '<p><b>Sorunlar:</b></p><ul><li>Dinamik öznitelik eklenemez; bazı kütüphaneler (bazı serileştiriciler, eski ' + c('functools.cached_property') + ' kullanımı) ' + c('__dict__') + ' bekler.</li>'
       '<li>Zayıf referans için ' + c('"__weakref__"') + ' açıkça eklenmelidir.</li>'
       '<li>Kalıtımda her alt sınıf kendi ' + c('__slots__') + '\'unu tanımlamazsa ' + c('__dict__') + ' geri gelir ve kazanç kaybolur. Çoklu kalıtımda boş olmayan slot\'lu iki taban çakışır.</li></ul>'
       '<p>Modern yol: ' + c('@dataclass(slots=True)') + ' (3.10+). Önce ' + c('tracemalloc') + ' ile ölçerim; nesne sayısı az ise bu optimizasyon gereksizdir.</p>',
     follow=['dataclass(slots=True) arka planda ne yapar?', 'Milyonlarca kayıt için __slots__ yerine hangi veri yapılarını düşünürsün?'],
     flags=['__slots__\'u erişim kontrolü veya "private" mekanizması sanmak', 'Kalıtımdaki tuzağı bilmemek'],
     tip='Kazancı somut bir ölçekle (milyonlarca nesne) bağla; "ne zaman gerekmez" kısmını da söyle.'),

dict(roles=['genel'], lv='temel', topic='Hashable', kind='kavram',
     q='"Hashable" ne demek? Neden liste sözlük anahtarı olamaz ama tuple olabilir?',
     a='<p><b>Hashable</b> bir nesne, ömrü boyunca değişmeyen bir hash değerine sahiptir (' + c('__hash__') + ') ve diğer nesnelerle eşitlik bakımından karşılaştırılabilir (' + c('__eq__') + '). Sözlük anahtarları ve küme elemanları hashable olmak zorundadır.</p>'
       '<p><b>Neden?</b> ' + c('dict') + ' ve ' + c('set') + ' birer hash tablosudur. Anahtarın hash\'i, onun hangi "kovada" saklanacağını belirler; bu sayede arama ortalama O(1) olur. Anahtar sonradan değişip hash\'i değişseydi, sözlük onu yanlış kovada arar ve bulamazdı.</p>'
       '<p><b>Liste</b> değişebilir olduğu için Python ' + c('list.__hash__') + '\'u ' + c('None') + ' yapar; ' + c('{[1, 2]: "x"}') + ' ' + c('TypeError: unhashable type: \'list\'') + ' verir. <b>Tuple</b> değişmezdir ve elemanları hashable olduğu sürece hashable\'dır. Dikkat: ' + c('(1, [2])') + ' bir tuple olsa da içinde liste olduğu için hash\'lenemez.</p>'
       '<p><b>Pratik:</b> Bileşik anahtar gerekiyorsa tuple kullan: ' + c('fiyat[("İzmir", "2026-11")]') + '. Küme içinde küme gerekiyorsa ' + c('frozenset') + '. Kendi sınıfların varsayılan olarak hashable\'dır (kimliğe göre), ama ' + c('__eq__') + ' tanımlarsan ' + c('__hash__') + '\'u da tanımlaman gerekir.</p>',
     follow=['Kullanıcı tanımlı bir sınıf varsayılan olarak neden hashable?', 'frozenset ne zaman işine yarar?'],
     flags=['"Tuple her zaman hashable\'dır" demek', 'Hash tablosu mantığını açıklayamamak'],
     tip='Hash tablosunun kova mantığını bir cümleyle anlatmak cevabı ezberden anlayışa taşır.'),

dict(roles=['genel'], lv='temel', topic='dict sıralı mı?', kind='kavram',
     q='Python\'da sözlükler sıralı mıdır? ' + '<code>OrderedDict</code> hâlâ gerekli mi?',
     a='<p><b>Evet, Python 3.7\'den itibaren</b> ' + c('dict') + ' ekleme sırasını korumayı dil düzeyinde garanti eder (3.6\'da CPython\'un uygulama ayrıntısıydı). Gezinme, ' + c('keys()') + ', ' + c('values()') + ', ' + c('items()') + ' ve JSON\'a yazma anahtarları eklendiği sırayla verir. Bu, yeni ve daha kompakt sözlük yapısının bir yan ürünüdür: anahtarlar yoğun bir dizide sırayla tutulur, hash tablosu yalnızca bu diziye indeks taşır.</p>'
       '<p><b>Ayrıntılar:</b> Var olan bir anahtarın değerini güncellemek sırasını <i>değiştirmez</i>. Silip yeniden eklersen sona gider. "Sıralı" kelimesi <i>ekleme sırası</i> anlamındadır; anahtarlara göre sıralı (sorted) değildir.</p>'
       '<p><b>' + c('OrderedDict') + ' ne zaman hâlâ gerekli?</b></p><ul><li>Eşitlik sırayı dikkate alır: iki ' + c('OrderedDict') + ' ancak sıraları aynıysa eşittir; iki ' + c('dict') + ' ise sıradan bağımsız eşittir.</li>'
       '<li>' + c('move_to_end(k)') + ' ve ' + c('popitem(last=False)') + ' ile LRU önbelleği gibi yapıları kolayca kurarsın.</li>'
       '<li>Okuyucuya "burada sıra önemli" niyetini açıkça iletir.</li></ul>'
       '<p>' + c('set') + ' ise sırasızdır; sırayı koruyarak tekrarları atmak için ' + c('list(dict.fromkeys(liste))') + ' kalıbı kullanılır.</p>',
     follow=['Sırayı koruyarak bir listeden tekrarları nasıl atarsın?', 'OrderedDict ile basit bir LRU önbellek nasıl yazılır?'],
     flags=['"Sözlükler sırasızdır" demek (eski bilgi)', 'Ekleme sırası ile anahtara göre sıralamayı karıştırmak'],
     tip='Sürüm numarasını (3.7 garanti) söylemek ve OrderedDict\'in hâlâ farklı olduğu iki noktayı bilmek seni ayırır.'),

dict(roles=['genel'], lv='temel', topic='list ve tuple', kind='kavram',
     q='List ile tuple arasındaki farklar nelerdir? Hangisini ne zaman seçersin?',
     a='<p><b>Teknik farklar:</b></p><ul><li><b>Değişebilirlik:</b> list değişebilir (' + c('append') + ', ' + c('sort') + ', eleman ataması); tuple değişmezdir.</li>'
       '<li><b>Hashable:</b> Elemanları hashable olan tuple sözlük anahtarı ve küme elemanı olabilir; list olamaz.</li>'
       '<li><b>Bellek ve hız:</b> Tuple biraz daha az bellek kullanır, sabit tuple\'lar derleme anında oluşturulabilir. List büyüyebilmek için fazladan kapasite ayırır.</li>'
       '<li><b>Metotlar:</b> Tuple\'da yalnızca ' + c('count') + ' ve ' + c('index') + ' vardır.</li></ul>'
       '<p><b>Anlamsal fark (asıl önemli olan):</b> Tuple genellikle <i>farklı türden alanların sabit yapılı bir kaydı</i> için kullanılır, örneğin ' + c('("TK1923", "IST", "ADB")') + ': uçuş kodu, kalkış, varış. Konum anlam taşır. List ise <i>aynı türden, sayısı değişebilen elemanların</i> koleksiyonudur: günün tüm uçuşları gibi.</p>'
       '<p><b>Seçim:</b> Değişmeyecek kayıtlar, fonksiyondan çoklu dönüş, sözlük anahtarları için tuple; büyüyüp küçülecek koleksiyonlar için list. Alan adları önemliyse ' + c('typing.NamedTuple') + ' veya ' + c('dataclass') + ' okunabilirliği ciddi biçimde artırır.</p>',
     follow=['NamedTuple ile dataclass arasında nasıl seçim yaparsın?', 't = (1,) ve t = (1) farkı nedir?'],
     flags=['Tek farkı "parantez ve köşeli parantez" olarak görmek', 'Performans farkını abartmak'],
     tip='Teknik farklardan sonra "kayıt ve koleksiyon" anlamsal ayrımını söyle; çoğu aday bunu atlar.'),

dict(roles=['genel'], lv='temel', topic='Kavrayışlar (comprehension)', kind='kavram',
     q='Liste, sözlük ve küme kavrayışları (comprehension) nedir? Ne zaman normal döngü daha iyidir?',
     a='<p>Kavrayış, bir yinelenebilirden yeni bir koleksiyonu tek ifadeyle kurmanın yoludur:</p>'
       + pre('fiyatlar = {"çay": 45, "kahve": 120, "su": 10}\npahali = [u for u, f in fiyatlar.items() if f > 40]      # liste\nkdvli  = {u: round(f * 1.2, 2) for u, f in fiyatlar.items()}  # sözlük\nharfler = {u[0] for u in fiyatlar}                          # küme\ntoplam = sum(f for f in fiyatlar.values())                   # üreteç ifadesi')
       + '<p><b>Avantajları:</b> Kısa ve okunaklı; niyeti ("filtrele ve dönüştür") açıkça gösterir; ' + c('append') + ' metot aramasını atladığı için eşdeğer döngüden genellikle biraz hızlıdır. Python 3\'te döngü değişkeni dışarı sızmaz.</p>'
       '<p><b>Normal döngü ne zaman daha iyi?</b></p><ul><li>İç içe iki seviyeden fazla döngü ya da birden çok koşul varsa okunabilirlik çöker.</li>'
       '<li>Yan etki amaçlıysan (' + c('print') + ', veritabanına yazma) kavrayış kullanma; ' + c('[print(x) for x in v]') + ' gereksiz bir liste üretir.</li>'
       '<li>Hata yakalama (' + c('try/except') + ') veya ara değişkenler gerekiyorsa.</li></ul>'
       '<p>Yalnızca toplayacak, sayacak veya bir kez gezeceksen köşeli parantezsiz <b>üreteç ifadesi</b> kullan; ara listeyi bellekte oluşturmaz. Ara hesaplar için 3.8+ walrus operatörü (' + c(':=') + ') kavrayış içinde de kullanılabilir.</p>',
     follow=['İç içe kavrayışta döngülerin sırası nasıl okunur?', 'Kavrayışın kendi kapsamı olması hangi hatayı önler?'],
     flags=['Yan etki için kavrayış kullanmayı normal görmek', 'Liste kavrayışı ile üreteç ifadesinin bellek farkını bilmemek'],
     tip='Dört çeşidi (liste, sözlük, küme, üreteç) tek bir örnekte göstermek kısa ve etkili olur.'),

dict(roles=['genel'], lv='temel', topic='lambda', kind='kavram',
     q='Lambda ifadesi nedir, sınırları nelerdir? Ne zaman ' + '<code>def</code> tercih edilmelidir?',
     a='<p><b>Lambda</b>, tek bir <i>ifadeden</i> oluşan isimsiz bir fonksiyon tanımlar: ' + c('lambda x: x * 1.2') + '. İfadenin sonucu otomatik olarak döndürülür.</p>'
       '<p><b>Sınırları:</b></p><ul><li>Yalnızca tek ifade: ' + c('if') + ' bloğu, ' + c('for') + ', ' + c('try') + ', atama ifadesi (' + c('=') + ') yazılamaz. Koşullu ifade (' + c('a if k else b') + ') ise kullanılabilir.</li>'
       '<li>Docstring ve tip notasyonu eklenemez.</li>'
       '<li>Hata izlerinde adı ' + c('<lambda>') + ' görünür; hata ayıklamayı zorlaştırır.</li></ul>'
       '<p><b>İyi kullanım:</b> Kısa, tek seferlik ve bir argüman olarak verilen fonksiyonlar:</p>'
       + pre('siparisler.sort(key=lambda s: (s["sehir"], -s["tutar"]))')
       + '<p><b>' + c('def') + ' tercih et:</b> Lambda\'yı bir isme atıyorsan (' + c('kdv = lambda x: x * 1.2') + '; PEP 8 bunu açıkça önermez), mantık birden fazla adım içeriyorsa veya yeniden kullanılacaksa.</p>'
       '<p><b>Alternatifler:</b> ' + c('operator.itemgetter("tutar")') + ', ' + c('attrgetter') + ' ve ' + c('methodcaller') + ' hem daha hızlı hem daha okunaklıdır. Ayrıca ' + c('map(lambda...)') + ' yerine genellikle kavrayış daha "Pythonic"tir.</p>',
     follow=['itemgetter neden lambda\'dan daha hızlı olabilir?', 'Lambda\'nın döngüde geç bağlama sorunu nedir?'],
     flags=['Lambda\'nın def\'ten "daha hızlı" olduğunu iddia etmek', 'Lambda\'ya isim atamayı iyi uygulama sanmak'],
     tip='Sıralama anahtarı örneği ver; lambda\'nın en doğal kullanım yeri orasıdır.'),

dict(roles=['genel'], lv='orta', topic='Closure', kind='kavram',
     q='Closure nedir? Hangi koşullarda oluşur ve pratikte nerede kullanılır?',
     a='<p><b>Closure</b>, tanımlandığı kapsamdaki değişkenleri "hatırlayan" iç fonksiyondur. Dış fonksiyon dönüp yerel kapsamı sona erse bile iç fonksiyon bu değişkenlere erişmeye devam eder.</p>'
       '<p><b>Üç koşul:</b> (1) iç içe bir fonksiyon var, (2) iç fonksiyon dış kapsamdaki bir değişkeni kullanıyor (serbest değişken), (3) dış fonksiyon iç fonksiyonu döndürüyor veya başka bir yere aktarıyor.</p>'
       + pre('def kdv_hesaplayici(oran):\n    def hesapla(tutar):\n        return round(tutar * (1 + oran), 2)\n    return hesapla\n\ngida = kdv_hesaplayici(0.01)\ngenel = kdv_hesaplayici(0.20)\nprint(gida(100), genel(100))  # 101.0 120.0')
       + '<p>Yakalanan değişkenler ' + c('hesapla.__closure__') + ' içindeki hücrelerde saklanır. Yeniden atama yapmak için ' + c('nonlocal') + ' gerekir.</p>'
       '<p><b>Pratik kullanımlar:</b> dekoratörler (sarıcı, orijinal fonksiyonu closure ile tutar), fabrika fonksiyonları, callback\'ler, durumu gizleyen küçük sayaçlar, ' + c('functools.partial') + '\'ın yaptığına benzer argüman sabitleme.</p>'
       '<p><b>Tuzak:</b> Closure değeri değil değişkeni yakalar; döngüde oluşturulan closure\'lar son değeri görür (geç bağlama). Durum karmaşıklaşırsa bir sınıf daha okunaklı olur.</p>',
     follow=['Closure ile partial arasında ne fark var?', 'Döngüde closure oluştururken hangi hatayı yaparsın?'],
     flags=['Her iç fonksiyonu closure saymak (serbest değişken yoksa değildir)', 'Closure\'ın değeri kopyaladığını düşünmek'],
     tip='Üç koşulu sırayla say ve dekoratörlerle bağlantısını kur; bu, kavramı gerçekten anladığını gösterir.'),

dict(roles=['genel'], lv='orta', topic='match-case (3.10)', kind='kod-okuma',
     q='Lezzet Kurye\'nin olay işleyicisinde yapısal desen eşleme kullanılıyor. Çıktı nedir?',
     code='def isle(olay):\n    match olay:\n        case {"tip": "siparis", "tutar": t} if t >= 500:\n            return f"büyük sipariş: {t}"\n        case {"tip": "siparis", "tutar": t}:\n            return f"sipariş: {t}"\n        case {"tip": "iptal", "neden": str(neden)}:\n            return f"iptal ({neden})"\n        case [enlem, boylam]:\n            return f"konum {enlem},{boylam}"\n        case _:\n            return "bilinmeyen"\n\nprint(isle({"tip": "siparis", "tutar": 750, "kanal": "mobil"}))\nprint(isle({"tip": "siparis", "tutar": 120}))\nprint(isle({"tip": "iptal", "neden": 3}))\nprint(isle((38.4, 27.1)))\nprint(isle("38.4,27.1"))\n',
     out='büyük sipariş: 750\nsipariş: 120\nbilinmeyen\nkonum 38.4,27.1\nbilinmeyen',
     a='<p><b>' + c('match') + '</b> (PEP 634, Python 3.10) bir <i>switch</i> değil, <b>yapısal desen eşleme</b>dir: değerin şeklini kontrol eder ve parçalarını değişkenlere bağlar. Durumlar yukarıdan aşağı denenir, ilk eşleşen kazanır.</p>'
       '<ul><li>1. olay: Eşleme desenleri (mapping pattern) <i>fazla anahtarlara izin verir</i>; ' + c('"kanal"') + ' sorun olmaz. ' + c('t = 750') + ' bağlanır ve ' + c('if') + ' koruyucusu (guard) sağlandığı için ilk dal çalışır.</li>'
       '<li>2. olay: Guard başarısız olur, ikinci dal eşleşir.</li>'
       '<li>3. olay: ' + c('str(neden)') + ' bir sınıf desenidir; 3 bir ' + c('str') + ' olmadığı için eşleşmez ve ' + c('_') + ' dalına düşer.</li>'
       '<li>4. olay: Dizi deseni (sequence pattern) tuple ve list ile eşleşir.</li>'
       '<li>5. olay: <b>' + c('str') + ' dizi deseniyle eşleşmez</b> (bilinçli tasarım kararı), bu yüzden "bilinmeyen".</li></ul>'
       '<p><b>Tuzak:</b> ' + c('case DURUM:') + ' gibi düz bir isim, sabitle karşılaştırmaz; her şeyi yakalayan yeni bir değişken bağlar. Sabitler için noktalı isim (' + c('Durum.AKTIF') + ') veya literal kullan.</p>',
     follow=['case durum: ile case Durum.AKTIF: arasındaki fark nedir?', 'Dataclass\'larla sınıf deseni nasıl kullanılır (__match_args__)?'],
     flags=['match\'i yalnızca if/elif zincirinin kısaltması olarak görmek', 'Sözlük deseninin fazla anahtarı reddettiğini sanmak'],
     tip='Her olayı tek cümleyle hangi desene neden takıldığını söyleyerek izle; özellikle string ve dizi desenini vurgula.'),

dict(roles=['genel'], lv='orta', topic='Python 3.11 yenilikleri', kind='kavram',
     q='Python 3.11 ile gelen önemli yenilikler nelerdir? Hangileri günlük işini doğrudan etkiler?',
     a='<p><b>1. Performans (Faster CPython projesi):</b> Uyarlanabilir uzmanlaşan yorumlayıcı (PEP 659) sayesinde birçok iş yükünde 3.10\'a göre ortalama %10–60 hızlanma geldi. Kodu değiştirmeden kazanılan en büyük getiri budur.</p>'
       '<p><b>2. Daha iyi hata mesajları:</b> Hata izleri artık hatalı ifadenin tam konumunu ' + c('^^^^') + ' işaretleriyle gösteriyor (PEP 657). ' + c('siparis["musteri"]["adres"]["il"]') + ' gibi zincirlerde hangi parçanın ' + c('None') + ' olduğunu anında görürsün.</p>'
       '<p><b>3. ' + c('ExceptionGroup') + ' ve ' + c('except*') + ' (PEP 654):</b> Eşzamanlı görevlerde birden fazla hatayı aynı anda fırlatıp türlerine göre ayrı ayrı ele alabilirsin. ' + c('asyncio.TaskGroup') + ' bunu kullanır ve ' + c('gather') + '\'a göre daha güvenli bir yapılandırılmış eşzamanlılık sunar.</p>'
       '<p><b>4. ' + c('tomllib') + ':</b> Standart kütüphanede TOML okuma; ' + c('pyproject.toml') + ' okumak için ek paket gerekmez.</p>'
       '<p><b>5. Tipleme:</b> ' + c('Self') + ' tipi (PEP 673), ' + c('LiteralString') + ', ' + c('TypedDict') + ' için ' + c('Required/NotRequired') + ', varyadik generic\'ler (' + c('TypeVarTuple') + ').</p>'
       '<p><b>6. ' + c('add_note()') + ':</b> İstisnalara ek bağlam notu eklenebilir.</p>'
       '<p>Günlük işte en çok hız, hata mesajları ve ' + c('TaskGroup') + ' fark yaratır.</p>',
     follow=['asyncio.TaskGroup ile gather arasındaki fark nedir?', 'except* bloğu normal except\'ten nasıl farklı çalışır?'],
     flags=['Yalnızca "daha hızlı oldu" deyip geçmek', 'Sürümleri ve özellikleri karıştırmak (ör. match-case\'i 3.11\'e koymak)'],
     tip='Tüm listeyi ezberden saymak yerine 3–4 maddeyi "işime şöyle yaradı" diye bağla.'),

dict(roles=['genel'], lv='ileri', topic='Python 3.12 yenilikleri', kind='kavram',
     q='Python 3.12\'nin öne çıkan dil ve tipleme yenilikleri nelerdir?',
     a='<p><b>1. Yeni generic sözdizimi (PEP 695):</b> ' + c('TypeVar') + ' tanımlamadan doğrudan yazabilirsin:</p>'
       + pre('def ilk[T](ogeler: list[T]) -> T:\n    return ogeler[0]\n\nclass Kuyruk[T]:\n    def ekle(self, x: T) -> None: ...\n\ntype Kimlik = int | str   # tip takma adı (type statement)')
       + '<p><b>2. f-string sınırları kalktı (PEP 701):</b> f-string içinde aynı tırnağı tekrar kullanabilir, ters eğik çizgi ve yorum yazabilir, çok satırlı ifadeler kurabilirsin: ' + c('f"{sozluk["anahtar"]}"') + ' artık geçerli.</p>'
       '<p><b>3. ' + c('@override') + ' dekoratörü (PEP 698):</b> Üst sınıftaki bir metodu ezdiğini tip denetleyicisine bildirir; üst metodun adı değişirse hata yakalanır.</p>'
       '<p><b>4. Yorumlayıcı başına GIL (PEP 684):</b> Alt yorumlayıcılar kendi GIL\'lerine sahip olabilir; gerçek paralelliğe giden yolda bir adım (C API düzeyinde).</p>'
       '<p><b>5. Diğer:</b> ' + c('**kwargs') + ' için ' + c('Unpack[TypedDict]') + ' (PEP 692), ' + c('itertools.batched') + ', daha iyi hata önerileri ("Did you mean..."), ' + c('distutils') + '\'in kaldırılması (setuptools\'a geçiş gerekir), düşük maliyetli izleme API\'si ' + c('sys.monitoring') + '.</p>'
       '<p>Not: 3.13 ise deneysel GIL\'siz derleme ve JIT getirdi; sürümleri karıştırmamak önemlidir.</p>',
     follow=['itertools.batched ile toplu (batch) veritabanı yazımı nasıl yapılır?', 'distutils kaldırılınca eski bir projede ne bozulur?'],
     flags=['f-string değişikliğini veya generic sözdizimini bilmemek', 'GIL\'in 3.12\'de tamamen kaldırıldığını söylemek'],
     tip='Bir sözdizimi örneği (def ilk[T]) yazmak, okuduğunu değil kullandığını gösterir.'),

dict(roles=['genel'], lv='orta', topic='typing temelleri', kind='kavram',
     q='Python\'da tip notasyonları (type hints) neden kullanılır? ' + '<code>Optional</code>, <code>Union</code>, <code>TypedDict</code> ve <code>Literal</code> ne işe yarar?',
     a='<p>Tip notasyonları <b>çalışma anında zorlanmaz</b>; yorumlayıcı onları büyük ölçüde görmezden gelir. Değeri araçlardan gelir: mypy/pyright gibi statik denetleyiciler hataları çalıştırmadan yakalar, IDE otomatik tamamlama yapar, kod kendini belgeler. Pydantic ve FastAPI gibi kütüphaneler ise notasyonları çalışma anında doğrulama için okur.</p>'
       + pre('from typing import Literal, TypedDict\n\nclass Siparis(TypedDict):\n    id: int\n    durum: Literal["hazir", "yolda", "teslim"]\n    kurye: str | None\n\ndef bul(id: int) -> Siparis | None: ...')
       + '<ul><li>' + c('Optional[X]') + ' = ' + c('X | None') + ' (3.10+ yazımı). "Opsiyonel argüman" demek değildir; değerin None olabileceğini söyler.</li>'
       '<li>' + c('Union[A, B]') + ' = ' + c('A | B') + '.</li>'
       '<li>' + c('TypedDict') + ': belirli anahtarları ve tipleri olan sözlükler (JSON yanıtları için ideal).</li>'
       '<li>' + c('Literal') + ': değerin yalnızca belirli sabitlerden biri olabileceğini belirtir.</li></ul>'
       '<p>Diğer önemliler: ' + c('Callable') + ', ' + c('Iterable') + ' (girdi için ' + c('list') + '\'ten daha esnek), ' + c('Protocol') + ', ' + c('TypeVar') + '/generic\'ler. Kural: girdide geniş (' + c('Iterable') + '), çıktıda dar (' + c('list') + ') tip kullan.</p>',
     follow=['Fonksiyon parametresinde neden list yerine Iterable veya Sequence tercih edilir?', 'Any ile object arasındaki fark nedir?'],
     flags=['Tip notasyonlarının çalışma anında hata verdiğini sanmak', 'Optional\'ı "varsayılan değeri olan parametre" sanmak'],
     tip='"Zorlanmaz ama araçlar kullanır" ayrımını ilk cümlede söyle; ardından bir TypedDict örneği ver.'),

dict(roles=['genel'], lv='ileri', topic='Protocol ve ABC', kind='kavram',
     q='' + '<code>typing.Protocol</code> ile <code>abc.ABC</code> arasındaki fark nedir? Hangisini ne zaman seçersin?',
     a='<p><b>ABC (nominal tipleme):</b> Bir sınıf, ABC\'den <i>açıkça türeyerek</i> sözleşmeye katılır. ' + c('@abstractmethod') + ' ile işaretlenen metotlar uygulanmadan örnek oluşturulamaz; hata çalışma anında, nesne oluşturulurken alınır. Ortak varsayılan davranış (template method) da taban sınıfa konabilir.</p>'
       '<p><b>Protocol (yapısal tipleme, PEP 544):</b> "Ördek tiplemesinin" statik karşılığıdır. Bir sınıf, gerekli metotlara sahipse protokole <i>uyar</i>; kalıtım gerekmez. Denetimi statik araçlar (mypy) yapar.</p>'
       + pre('from typing import Protocol\n\nclass Bildirici(Protocol):\n    def gonder(self, alici: str, mesaj: str) -> bool: ...\n\ndef uyar(b: Bildirici) -> None:\n    b.gonder("05xx", "Kargonuz yolda")\n# SmsServisi Bildirici\'den türemese de gonder metodu varsa kabul edilir')
       + '<p><b>Seçim:</b></p><ul><li><b>Protocol:</b> Üçüncü taraf sınıfları (değiştiremeyeceğin kodu) kabul etmek, testte basit sahte nesneler (fake) kullanmak, katmanlar arası gevşek bağlılık istiyorsan.</li>'
       '<li><b>ABC:</b> Ortak uygulama kodu paylaşacaksan, alt sınıf hiyerarşisini sen kontrol ediyorsan ve çalışma anında zorunlu kılma istiyorsan.</li></ul>'
       '<p>' + c('@runtime_checkable') + ' ile Protocol\'e ' + c('isinstance') + ' desteği eklenebilir, ama yalnızca metot <i>varlığını</i> denetler, imzayı denetlemez.</p>',
     follow=['runtime_checkable bir protokolde isinstance neyi denetlemez?', 'Bağımlılık enjeksiyonunda Protocol nasıl kullanılır?'],
     flags=['İkisini birbirinin aynısı saymak', 'Protocol\'ün çalışma anında zorlandığını söylemek'],
     tip='"Nominal ve yapısal" kelimelerini kullan, sonra her biri için bir senaryo ver.'),
]
