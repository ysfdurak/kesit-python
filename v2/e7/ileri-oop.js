/* PythonPatika — v2 e7 uzantı (Derinleş): ileri-oop */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
  id: 'ileri-oop',
  min: 30,
  html: `
<h2>Nesnenin yüzü: __repr__, __str__ ve __format__</h2>
<p>Bir nesneyi ekrana üç farklı yol taşır. <code>__repr__</code> geliştirici içindir: hata ayıklayıcıda, logda, liste içinde görünür; mümkünse nesneyi yeniden üretecek ifadeyi (<code>Para(1250, 'TRY')</code>) döndürmelidir. <code>__str__</code> son kullanıcı içindir ve <code>print</code>/<code>str()</code> çağırır; tanımlı değilse <code>__repr__</code> kullanılır. <code>__format__</code> ise f-string'deki biçim belirtecini (<code>f"{x:tl}"</code>) yorumlamanı sağlar.</p>
<pre class="py">class Para:
    def __init__(self, kurus, birim="TRY"):
        self.kurus, self.birim = kurus, birim

    def __repr__(self):
        return f"Para({self.kurus!r}, {self.birim!r})"

    def __str__(self):
        return f"{self.kurus / 100:.2f} {self.birim}"

    def __format__(self, spec):
        if spec == "tl":           # Türkçe biçim: 1.234,50 TL
            metin = f"{self.kurus / 100:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
            return f"{metin} TL"
        return format(str(self), spec)

p = Para(123450)
print(p)                 # __str__
print([p])               # liste içinde __repr__
print(f"{p!r} | {p:tl} | {p:&gt;14}|")
</pre>

<h2>Aritmetik: yansıyan operatörler ve NotImplemented</h2>
<p><code>a + b</code> önce <code>a.__add__(b)</code>'yi dener. Bu <code>NotImplemented</code> döndürürse Python <b>yansıyan</b> (reflected) metodu, <code>b.__radd__(a)</code>'yı dener. <code>sum()</code> toplamaya <code>0</code> ile başladığı için <code>0 + Para(...)</code> hesaplanır; sınıfın <code>sum</code> ile çalışması için <code>__radd__</code> şarttır. Yerinde işlemler (<code>+=</code>) için <code>__iadd__</code> tanımlamazsan Python <code>__add__</code> ile yeni nesne üretir; değişmez değer nesnelerinde (value object) istenen de budur.</p>
<div class="tbl-wrap"><table>
<tr><th>Amaç</th><th>Dunder</th><th>Not</th></tr>
<tr><td><code>a + b</code>, <code>b + a</code></td><td><code>__add__</code>, <code>__radd__</code></td><td>Tanımadığın türde <code>NotImplemented</code> döndür, hata fırlatma</td></tr>
<tr><td><code>a += b</code></td><td><code>__iadd__</code></td><td>Yoksa <code>__add__</code> kullanılır</td></tr>
<tr><td><code>-a</code>, <code>abs(a)</code></td><td><code>__neg__</code>, <code>__abs__</code></td><td>İade, ters kayıt</td></tr>
<tr><td><code>if a:</code></td><td><code>__bool__</code></td><td>Yoksa <code>__len__</code>, o da yoksa hep True</td></tr>
<tr><td>Sıralama</td><td><code>__eq__</code> + <code>__lt__</code> + <code>@total_ordering</code></td><td>Diğer dördünü dekoratör üretir</td></tr>
<tr><td><code>with a:</code></td><td><code>__enter__</code>, <code>__exit__</code></td><td><code>__exit__</code> True dönerse hata yutulur</td></tr>
<tr><td><code>a.x</code> bulunamadı</td><td><code>__getattr__</code></td><td>Yalnızca normal arama başarısızsa çağrılır</td></tr>
<tr><td>Alt sınıf tanımlandı</td><td><code>__init_subclass__</code></td><td>Metaclass'sız eklenti kaydı</td></tr>
</table></div>
<pre class="py">from functools import total_ordering

@total_ordering
class Tutar:
    def __init__(self, kurus):
        self.kurus = kurus
    def __repr__(self):
        return f"Tutar({self.kurus})"
    def __add__(self, other):
        if isinstance(other, Tutar):
            return Tutar(self.kurus + other.kurus)
        return NotImplemented
    def __radd__(self, other):
        if other == 0:                  # sum() başlangıç değeri
            return self
        return self.__add__(other)
    def __eq__(self, other):
        return isinstance(other, Tutar) and self.kurus == other.kurus
    def __lt__(self, other):
        if not isinstance(other, Tutar):
            return NotImplemented
        return self.kurus &lt; other.kurus
    __hash__ = None                     # değişebilir: hash'lenmesin

islemler = [Tutar(500), Tutar(1200), Tutar(300)]
print(sum(islemler), max(islemler), sorted(islemler))
print(Tutar(5) &gt;= Tutar(3), Tutar(5) != Tutar(5))
</pre>

<h2>Temsil ve sarmalama: __getattr__</h2>
<p><code>__getattr__</code> yalnızca nitelik normal yollarla (örnek sözlüğü, sınıf, üst sınıflar) <b>bulunamadığında</b> çağrılır. Bu yüzden bir nesneyi sarıp bilmediğin her isteği içteki nesneye devretmek (delegation, proxy) için idealdir. <code>__getattribute__</code> ise <b>her</b> erişimde çağrılır; yanlış yazılırsa sonsuz özyinelemeye girer, nadiren gerekir. <code>__setattr__</code> yazarken atamayı <code>super().__setattr__(ad, deger)</code> ile yap; <code>self.ad = deger</code> yine <code>__setattr__</code>'ı çağırır.</p>
<pre class="py">class Loglu:
    def __init__(self, hedef):
        self._hedef = hedef
        self.cagrilar = []
    def __getattr__(self, ad):                 # yalnız bulunamayınca
        nitelik = getattr(self._hedef, ad)
        if callable(nitelik):
            def sarmal(*a, **k):
                self.cagrilar.append(ad)
                return nitelik(*a, **k)
            return sarmal
        return nitelik

stok = Loglu({"elma": 10})
stok.get("elma"); stok.setdefault("armut", 0)
print(stok.cagrilar, len(stok._hedef))
</pre>

<h2>Alt sınıfları otomatik kaydet: __init_subclass__</h2>
<p>Tasarım kalıpları dersinde kayıt (registry) fabrikasını dekoratörle kurdun. Taban sınıfa <code>__init_subclass__</code> yazarsan her alt sınıf <b>tanımlandığı anda</b> taban sınıfa haber verir; dekoratörü unutmak mümkün olmaz. Sınıf satırındaki anahtar sözcükler (<code>class X(Taban, kod="pdf")</code>) bu metoda iletilir.</p>
<pre class="py">class Disa:
    turler = {}
    def __init_subclass__(cls, kod, **kw):
        super().__init_subclass__(**kw)
        Disa.turler[kod] = cls

class CSV(Disa, kod="csv"):
    def yaz(self, satirlar): return "\\n".join(",".join(map(str, s)) for s in satirlar)

class JSONL(Disa, kod="jsonl"):
    def yaz(self, satirlar): return "\\n".join(str(list(s)) for s in satirlar)

print(sorted(Disa.turler))
print(Disa.turler["csv"]().yaz([(1, "İzmir"), (2, "Bursa")]))
</pre>

<h2>Bir kez hesapla: functools.cached_property</h2>
<p><code>@cached_property</code> ilk erişimde metodu çalıştırır ve sonucu örnek sözlüğüne yazar; sonraki erişimler sözlükten gelir. Pahalı ve <b>değişmeyen</b> türetilmiş değerler (rapor özeti, ayrıştırılmış yapılandırma) için idealdir. Nesnenin durumu değişebiliyorsa önbellek bayatlar: ya <code>@property</code> kullan ya da değişiklikte <code>del self.ozellik</code> ile önbelleği sil. <code>__slots__</code> kullanan sınıfta <code>__dict__</code> olmadığı için çalışmaz.</p>
<h3>Dunder disiplini: kısa kontrol listesi</h3>
<ul>
<li><b>__eq__ yazdıysan __hash__'ı düşün.</b> Değer nesnesi değişmezse <code>hash((alanlar))</code>, değişebiliyorsa <code>__hash__ = None</code> (sözlük anahtarı olmasın).</li>
<li><b>Tanımadığın türe NotImplemented.</b> Karşılaştırma ve aritmetikte hata fırlatma; Python karşı tarafa sorsun.</li>
<li><b>Sözleşmeyi bütün kur.</b> <code>__lt__</code> yazdıysan <code>total_ordering</code> ekle; <code>__len__</code> yazdıysan <code>__bool__</code> davranışının uzunluktan türeyeceğini unutma.</li>
<li><b>Sürpriz yapma.</b> <code>+</code> operatörü yan etki üretmemeli, girdiyi değiştirmemeli; okuyan kişi aritmetik bekler.</li>
<li><b>Önce dataclass'a bak.</b> <code>@dataclass(frozen=True, order=True)</code> eşitlik, hash, sıralama ve repr'i tek satırda üretir; elle dunder yalnızca özel kural gerektiğinde.</li>
</ul>
<div class="warn"><b>Dunder metodu sınıfta ara</b>Python örtük çağrılarda (<code>len(x)</code>, <code>x + y</code>, <code>with x</code>) dunder metodu <b>sınıfta</b> arar, örnekte değil. <code>nesne.__len__ = lambda: 5</code> yazmak <code>len(nesne)</code>'yi değiştirmez.</div>
<div class="note"><b>Gerçek işte</b>Finans ve e-ticaret kodunda en değerli dunder'lar sıkıcı olanlardır: anlamlı bir <code>__repr__</code> (loglarda <code>&lt;Siparis object at 0x7f...&gt;</code> yerine <code>Siparis(no=1042, tutar=Para(...))</code>), doğru <code>__eq__</code>/<code>__hash__</code> ve para birimi karışınca hata veren aritmetik. Kod incelemesinde (code review) "bu nesne logda nasıl görünecek?" sorusunu sor.</div>
`,
  ex: [
    { t: 'mc', stage: 'Isınma', q: 'Bir sınıfta yalnız <code>__str__</code> tanımlı, <code>__repr__</code> yok. <code>print([nesne])</code> ne gösterir?', o: [
        '__str__ çıktısını, çünkü print her nesnede yalnızca str kullanır',
        'Varsayılan &lt;Sinif object at 0x...&gt; metnini (repr)',
        'Boş bir liste gösterir, çünkü eleman yazdırılamaz',
        'TypeError verir, çünkü __repr__ tanımlamak zorunludur'
      ], a: 1, why: 'print listeye str() uygular, ama listenin str\'si elemanların repr\'ini kullanır. __repr__ tanımlı değilse object\'in varsayılan repr\'i görünür. Bu yüzden önce __repr__ yazılır.' },
    { t: 'mc', stage: 'Isınma', q: '<code>__getattr__</code> ne zaman çağrılır?', o: [
        'Her nitelik erişiminde, normal aramadan önce',
        'Yalnızca normal arama niteliği bulamadığında',
        'Yalnızca nitelik atanırken (obj.x = 1)',
        'Yalnızca getattr() fonksiyonu açıkça çağrılınca'
      ], a: 1, why: 'Her erişimde çağrılan __getattribute__\'tur. __getattr__ son çaredir: örnek, sınıf ve üst sınıflarda bulunamayan adlar için çağrılır; bu yüzden temsil (delegation) için güvenlidir.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'class Urun:\n    def __init__(self, ad):\n        self.ad = ad\n    def __repr__(self):\n        return f"Urun({self.ad!r})"\n    def __str__(self):\n        return self.ad.upper()\n\nu = Urun("çay")\nprint(u)\nprint([u])\nprint(f"{u!r}")\n', o: [
        'ÇAY\n[Urun(\'çay\')]\nUrun(\'çay\')',
        'ÇAY\n[ÇAY]\nÇAY',
        'Urun(\'çay\')\n[Urun(\'çay\')]\nUrun(\'çay\')',
        'ÇAY\n[\'ÇAY\']\nUrun(\'çay\')'
      ], a: 0, why: 'print(u) __str__ kullanır; liste elemanları repr ile gösterilir; f-string\'de !r dönüşümü repr\'i zorlar.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', raises: true, code: 'class Tutar:\n    def __init__(self, k):\n        self.k = k\n    def __add__(self, o):\n        return Tutar(self.k + o.k)\n\ntoplam = sum([Tutar(5), Tutar(7)])\nprint(toplam.k)\n', o: ['12', 'TypeError', 'AttributeError', '0'], a: 1, why: 'sum 0\'dan başlar ve 0 + Tutar(5) hesaplar. int.__add__ Tutar\'ı tanımaz (NotImplemented), Tutar\'da __radd__ yoktur; sonuç TypeError: unsupported operand type(s).' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'from functools import cached_property\n\nclass Rapor:\n    hesap = 0\n    def __init__(self, tutarlar):\n        self.tutarlar = tutarlar\n    @cached_property\n    def toplam(self):\n        Rapor.hesap += 1\n        return sum(self.tutarlar)\n\nr = Rapor([10, 20])\nr.toplam; r.toplam\nr.tutarlar.append(5)\nprint(r.toplam, Rapor.hesap)\n', o: ['30 1', '35 2', '35 1', '30 2'], a: 0, why: 'cached_property ilk erişimde hesaplar ve sonucu örneğe yazar; sonraki erişimler (liste değişse bile) önbellekten gelir. Bu yüzden toplam bayat kalır: 30, ve hesap yalnız 1 kez yapılmıştır.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'class Kanal:\n    kayit = []\n    def __init_subclass__(cls, **kw):\n        super().__init_subclass__(**kw)\n        Kanal.kayit.append(cls.__name__)\n\nclass Sms(Kanal): pass\nclass Eposta(Kanal): pass\nclass TopluSms(Sms): pass\nprint(Kanal.kayit)\n', o: ['[\'Sms\', \'Eposta\', \'TopluSms\']', '[\'Sms\', \'Eposta\']', '[\'Kanal\', \'Sms\', \'Eposta\', \'TopluSms\']', '[]'], a: 0, why: '__init_subclass__ tabanın kendisi için değil, her alt sınıf (torunlar dahil) tanımlandığında çağrılır. TopluSms, Sms üzerinden Kanal\'ın metodunu miras alır.' },
    { t: 'order', stage: 'Kodu oku', q: '<p><code>total_ordering</code> ile sıralanabilen bir <code>Oncelik</code> sınıfı kurup destek taleplerini sıralayan programın satırlarını sırala.</p>', lines: [
        'from functools import total_ordering',
        '@total_ordering',
        'class Oncelik:',
        '    def __init__(self, seviye): self.seviye = seviye',
        '    def __eq__(self, o): return self.seviye == o.seviye',
        '    def __lt__(self, o): return self.seviye < o.seviye',
        'talepler = [Oncelik(3), Oncelik(1), Oncelik(2)]',
        'print([t.seviye for t in sorted(talepler)], Oncelik(3) >= Oncelik(2))'
      ], expect: '[1, 2, 3] True\n', hint: 'Dekoratör sınıf satırının hemen üstüne gelir; metotlar sınıfın içinde, kullanım sınıftan sonra.', why: 'total_ordering, __eq__ ve __lt__ üzerinden __le__, __gt__, __ge__ metotlarını üretir; >= böylece çalışır.' },
    { t: 'code', stage: 'Rehberli', id: 'ileri-oop-x1', diff: 2, q: '<p><code>Para</code> sınıfına iki metot ekle: <code>__repr__</code> <code>Para(123450, \'TRY\')</code> biçiminde döndürsün; <code>__format__(self, spec)</code> spec <code>"tl"</code> ise Türkçe biçim (<code>"1.234,50 TL"</code>: binlik ayırıcı nokta, ondalık virgül, 2 basamak) döndürsün; başka bir spec gelirse <code>format(str(self), spec)</code> sonucunu döndürsün. <code>__str__</code> hazır.</p>', guide: [
        '__repr__: f-string içinde !r kullanarak alanları yaz.',
        '__format__: önce spec == "tl" durumunu ele al.',
        'Sayıyı f"{x:,.2f}" ile İngilizce biçimle (1,234.50), sonra virgül ve noktayı geçici bir karakter üzerinden yer değiştir.',
        'Diğer spec\'ler için format(str(self), spec) döndür.'
      ], example: 'class Yuzde:\n    def __init__(self, oran):\n        self.oran = oran\n    def __format__(self, spec):\n        if spec == "tr":\n            return "%" + f"{self.oran * 100:.1f}".replace(".", ",")\n        return format(self.oran, spec)\n\nprint(f"{Yuzde(0.185):tr} | {Yuzde(0.185):.3f}")\n', start: 'class Para:\n    def __init__(self, kurus, birim="TRY"):\n        self.kurus, self.birim = kurus, birim\n\n    def __str__(self):\n        return f"{self.kurus / 100:.2f} {self.birim}"\n\n    # TODO: __repr__\n    # TODO: __format__(self, spec)\n', sol: 'class Para:\n    def __init__(self, kurus, birim="TRY"):\n        self.kurus, self.birim = kurus, birim\n\n    def __str__(self):\n        return f"{self.kurus / 100:.2f} {self.birim}"\n\n    def __repr__(self):\n        return f"Para({self.kurus!r}, {self.birim!r})"\n\n    def __format__(self, spec):\n        if spec == "tl":\n            m = f"{self.kurus / 100:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")\n            return f"{m} TL"\n        return format(str(self), spec)\n', tests: 'p = Para(123450)\nassert repr(p) == "Para(123450, \'TRY\')", "repr nesneyi yeniden üreten ifade olmalı"\nassert f"{p:tl}" == "1.234,50 TL", "tl biçimi: binlikte nokta, ondalıkta virgül"\nassert f"{Para(123456789):tl}" == "1.234.567,89 TL", "Milyonlarda da binlik ayırıcı olmalı"\nassert f"{Para(5):tl}" == "0,05 TL", "Kuruşlar 2 basamak"\nassert f"{p:>12}" == " 1234.50 TRY", "Diğer belirteçler str üzerine uygulanmalı"\nassert str([p]) == "[Para(123450, \'TRY\')]", "Liste içinde repr görünmeli"\n', hints: [
        'f-string\'de alan sonuna !r eklemek repr\'ini yazar: {self.birim!r} → \'TRY\'.',
        'İki karakteri yer değiştirmek için üçüncü geçici bir karakter kullan: "," → "_", "." → ",", "_" → ".".',
        'return format(str(self), spec) diğer durumları çözer.'
      ], why: '__format__ biçim mantığını nesneye taşır; raporlarda her yerde aynı yardımcı fonksiyonu çağırmak yerine f"{tutar:tl}" yazarsın.' },
    { t: 'code', stage: 'Rehberli', id: 'ileri-oop-x2', diff: 2, q: '<p><code>Tutar</code> sınıfı <code>sum()</code> ile çalışmıyor. <code>__add__</code> metodunu tanımadığı türlerde <code>NotImplemented</code> dönecek şekilde düzenle ve <code>__radd__</code> ekle: <code>0 + Tutar</code> tutarın kendisini versin, <code>Tutar + Tutar</code> ise toplasın. Sonunda <code>sum([Tutar(5), Tutar(7)])</code> <code>Tutar(12)</code> olmalı; <code>Tutar(5) + "x"</code> TypeError vermeli.</p>', guide: [
        '__add__ içinde isinstance(other, Tutar) değilse return NotImplemented.',
        '__radd__(self, other) yaz: other == 0 ise self döndür.',
        'Aksi hâlde self.__add__(other) sonucunu döndür.',
        'Eşitlik için __eq__ hazır; dokunma.'
      ], example: 'class Puan:\n    def __init__(self, d): self.d = d\n    def __add__(self, o):\n        return Puan(self.d + o.d) if isinstance(o, Puan) else NotImplemented\n    def __radd__(self, o):\n        return self if o == 0 else self.__add__(o)\n\nprint(sum([Puan(2), Puan(3)]).d)\n', start: 'class Tutar:\n    def __init__(self, kurus):\n        self.kurus = kurus\n    def __eq__(self, o):\n        return isinstance(o, Tutar) and o.kurus == self.kurus\n    def __repr__(self):\n        return f"Tutar({self.kurus})"\n    def __add__(self, other):\n        # TODO: Tutar değilse NotImplemented dön\n        return Tutar(self.kurus + other.kurus)\n    # TODO: __radd__\n', sol: 'class Tutar:\n    def __init__(self, kurus):\n        self.kurus = kurus\n    def __eq__(self, o):\n        return isinstance(o, Tutar) and o.kurus == self.kurus\n    def __repr__(self):\n        return f"Tutar({self.kurus})"\n    def __add__(self, other):\n        if not isinstance(other, Tutar):\n            return NotImplemented\n        return Tutar(self.kurus + other.kurus)\n    def __radd__(self, other):\n        if other == 0:\n            return self\n        return self.__add__(other)\n', tests: 'assert sum([Tutar(5), Tutar(7)]) == Tutar(12), "sum 0 ile başlar: __radd__ 0\'ı tanımalı"\nassert sum([]) == 0, "Boş listede sum 0 döner"\nassert Tutar(1) + Tutar(2) == Tutar(3)\ntry:\n    Tutar(5) + "x"\n    raise AssertionError("Tutar + str TypeError vermeli")\nexcept TypeError:\n    pass\ntry:\n    Tutar(5) + 3\n    raise AssertionError("Tutar + int TypeError vermeli (NotImplemented)")\nexcept TypeError:\n    pass\n', hints: [
        'sum(liste) aslında 0 + liste[0] + liste[1] ... hesaplar.',
        'NotImplemented döndürmek Python\'a "karşı tarafı dene" der; iki taraf da reddederse TypeError oluşur.',
        'def __radd__(self, other): return self if other == 0 else self.__add__(other)'
      ], why: 'Hata fırlatmak yerine NotImplemented döndürmek, karşı tarafın yansıyan metoduna şans tanır; __radd__ ise sum ve 0 başlangıçlı birikimler için gerekir.' },
    { t: 'code', stage: 'Rehberli', id: 'ileri-oop-x3', diff: 2, q: '<p>Anadolu Bank bildirim kanalları için eklenti kaydı kur. <code>Kanal</code> taban sınıfına <code>__init_subclass__(cls, kod, **kw)</code> yaz: her alt sınıfı <code>Kanal.kayit[kod]</code> olarak kaydetsin; aynı kod ikinci kez kullanılırsa <code>ValueError</code> fırlatsın. Ayrıca sınıf metodu <code>Kanal.olustur(kod)</code> kayıttaki sınıftan bir örnek döndürsün (yoksa <code>KeyError</code>). <code>Sms</code> (kod "sms") ve <code>Eposta</code> (kod "eposta") alt sınıflarını tanımla; her biri <code>gonder(mesaj)</code> ile <code>"SMS: mesaj"</code> / <code>"EPOSTA: mesaj"</code> döndürsün.</p>', guide: [
        'Kanal içinde kayit = {} sınıf özniteliği tanımla.',
        '__init_subclass__(cls, kod, **kw) içinde önce super().__init_subclass__(**kw) çağır.',
        'kod kayıtta varsa ValueError; yoksa Kanal.kayit[kod] = cls.',
        '@classmethod olustur(cls, kod): return cls.kayit[kod]()',
        'Alt sınıfları class Sms(Kanal, kod="sms") biçiminde tanımla.'
      ], example: 'class Eklenti:\n    hepsi = {}\n    def __init_subclass__(cls, ad, **kw):\n        super().__init_subclass__(**kw)\n        Eklenti.hepsi[ad] = cls\n\nclass Pdf(Eklenti, ad="pdf"): pass\nprint(Eklenti.hepsi)\n', start: 'class Kanal:\n    kayit = {}\n    # TODO: __init_subclass__(cls, kod, **kw)\n    # TODO: @classmethod olustur(cls, kod)\n\n# TODO: Sms ve Eposta alt sınıfları\n', sol: 'class Kanal:\n    kayit = {}\n\n    def __init_subclass__(cls, kod, **kw):\n        super().__init_subclass__(**kw)\n        if kod in Kanal.kayit:\n            raise ValueError(f"{kod} zaten kayıtlı")\n        Kanal.kayit[kod] = cls\n\n    @classmethod\n    def olustur(cls, kod):\n        return cls.kayit[kod]()\n\nclass Sms(Kanal, kod="sms"):\n    def gonder(self, mesaj):\n        return f"SMS: {mesaj}"\n\nclass Eposta(Kanal, kod="eposta"):\n    def gonder(self, mesaj):\n        return f"EPOSTA: {mesaj}"\n', tests: 'assert set(Kanal.kayit) >= {"sms", "eposta"}, "Alt sınıflar tanımlanınca kendiliğinden kaydolmalı"\nassert Kanal.olustur("sms").gonder("Şifreniz 1234") == "SMS: Şifreniz 1234"\nassert isinstance(Kanal.olustur("eposta"), Eposta)\ntry:\n    class Sahte(Kanal, kod="sms"):\n        pass\n    raise AssertionError("Aynı kod ikinci kez kaydedilememeli")\nexcept ValueError:\n    pass\ntry:\n    Kanal.olustur("faks")\n    raise AssertionError("Bilinmeyen kod KeyError vermeli")\nexcept KeyError:\n    pass\n', hints: [
        'Sınıf satırındaki anahtar sözcükler (kod="sms") __init_subclass__\'a parametre olarak gelir.',
        '__init_subclass__ örtük olarak sınıf metodudur; ilk parametresi yeni alt sınıftır (cls).',
        'olustur için @classmethod ve return cls.kayit[kod]() yeterli.'
      ], why: '__init_subclass__ ile kayıt, alt sınıf tanımının kendisine bağlanır; yeni kanal eklemek tek bir sınıf yazmaktan ibarettir ve unutulacak bir dekoratör yoktur.' },
    { t: 'code', stage: 'Kendin yaz', id: 'ileri-oop-x4', diff: 2, q: '<p><code>SayacliVekil(hedef)</code> sınıfını yaz: bilmediği her nitelik isteğini <code>__getattr__</code> ile <code>hedef</code> nesnesine devretsin. Devredilen nitelik çağrılabilirse (metotsa) her çağrıyı <code>self.sayac</code> sözlüğünde (metot adı → çağrı sayısı) saysın. Çağrılabilir olmayan nitelikler (ör. bir sayı) olduğu gibi dönsün.</p>', start: 'class SayacliVekil:\n    pass\n', sol: 'class SayacliVekil:\n    def __init__(self, hedef):\n        self._hedef = hedef\n        self.sayac = {}\n\n    def __getattr__(self, ad):\n        nitelik = getattr(self._hedef, ad)\n        if not callable(nitelik):\n            return nitelik\n        def sarmal(*a, **k):\n            self.sayac[ad] = self.sayac.get(ad, 0) + 1\n            return nitelik(*a, **k)\n        return sarmal\n', tests: 'class Hesap:\n    def __init__(self):\n        self.bakiye = 100\n    def yatir(self, x):\n        self.bakiye += x\n        return self.bakiye\n    def cek(self, x):\n        self.bakiye -= x\n        return self.bakiye\n\nh = Hesap()\nv = SayacliVekil(h)\nassert v.yatir(50) == 150, "Metot çağrısı hedefe devredilmeli"\nv.yatir(10); v.cek(20)\nassert v.sayac == {"yatir": 2, "cek": 1}, "Çağrılar metot adına göre sayılmalı"\nassert v.bakiye == 140, "Çağrılabilir olmayan nitelik olduğu gibi dönmeli"\ntry:\n    v.olmayan\n    raise AssertionError("Hedefte olmayan nitelik AttributeError vermeli")\nexcept AttributeError:\n    pass\n', hints: [
        '__init__ içinde atadığın self._hedef ve self.sayac normal yolla bulunur, __getattr__\'a düşmez.',
        'callable(nitelik) ise içte bir sarmal fonksiyon döndür; sayacı orada artır.'
      ], why: 'Vekil (proxy) kalıbı loglama, ölçüm, önbellek ve erişim denetimi eklemek için hedef sınıfa dokunmadan kullanılır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'ileri-oop-x5', diff: 2, q: '<p>Anadolu Bank için <code>Islem(hesaplar)</code> bağlam yöneticisi sınıfını yaz. <code>with Islem(hesaplar):</code> bloğuna girerken hesaplar sözlüğünün bir kopyasını saklasın; blokta istisna oluşursa sözlüğü <b>yerinde</b> eski hâline döndürsün ve istisnayı yutmasın (yeniden yükselsin). Hata yoksa değişiklikler kalsın. <code>__enter__</code> hesaplar sözlüğünü döndürsün.</p>', start: 'class Islem:\n    pass\n', sol: 'class Islem:\n    def __init__(self, hesaplar):\n        self.hesaplar = hesaplar\n\n    def __enter__(self):\n        self._yedek = dict(self.hesaplar)\n        return self.hesaplar\n\n    def __exit__(self, tur, deger, iz):\n        if tur is not None:\n            self.hesaplar.clear()\n            self.hesaplar.update(self._yedek)\n        return False\n', tests: 'h = {"TR1": 100, "TR2": 50}\nwith Islem(h) as hs:\n    hs["TR1"] -= 30\n    hs["TR2"] += 30\nassert h == {"TR1": 70, "TR2": 80}, "Hata yoksa değişiklikler kalmalı"\ntry:\n    with Islem(h) as hs:\n        hs["TR1"] -= 500\n        hs["TR3"] = 1\n        raise ValueError("yetersiz bakiye")\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("İstisna yutulmamalı")\nassert h == {"TR1": 70, "TR2": 80}, "Hata olunca sözlük eski hâline dönmeli (yeni anahtar da silinmeli)"\n', hints: [
        '__exit__(self, tur, deger, iz): tur None değilse hata oluşmuştur.',
        'Yerinde geri yükleme: clear() sonra update(yedek). Yeni sözlük atamak dışarıdaki referansı değiştirmez.',
        '__exit__ False döndürürse istisna yayılmaya devam eder.'
      ], why: 'Bağlam yöneticisi "ya hep ya hiç" davranışını tek bir with satırına taşır; veritabanı işlemlerindeki (transaction) commit/rollback mantığının küçük bir modelidir.' },
    { t: 'code', stage: 'Hata avı', id: 'ileri-oop-x6', kind: 'bug', diff: 2, q: '<p>Hatayı bul ve düzelt. <code>IzliKayit</code> sınıfı, nesneye atanan her alanın adını <code>degisenler</code> listesine yazmalı. Ama nesne daha oluşturulurken hata veriyor (atama kendi kendini çağırıyor). <code>degisenler</code> listesinin kendisi listeye yazılmamalı.</p>', start: 'class IzliKayit:\n    def __init__(self, **alanlar):\n        self.degisenler = []\n        for ad, deger in alanlar.items():\n            setattr(self, ad, deger)\n\n    def __setattr__(self, ad, deger):\n        if ad != "degisenler":\n            self.degisenler.append(ad)\n        self.ad = deger\n', sol: 'class IzliKayit:\n    def __init__(self, **alanlar):\n        super().__setattr__("degisenler", [])\n        for ad, deger in alanlar.items():\n            setattr(self, ad, deger)\n\n    def __setattr__(self, ad, deger):\n        if ad != "degisenler":\n            self.degisenler.append(ad)\n        super().__setattr__(ad, deger)\n', tests: 'k = IzliKayit(ad="Ayşe", sehir="İzmir")\nassert k.ad == "Ayşe" and k.sehir == "İzmir", "Alanlar gerçekten atanmalı"\nk.sehir = "Bursa"\nassert k.degisenler == ["ad", "sehir", "sehir"], "Her atama sırasıyla kaydedilmeli"\nassert k.sehir == "Bursa"\nassert "degisenler" not in k.degisenler\n', hints: [
        '__setattr__ içinde self.x = ... yazmak yine __setattr__\'ı çağırır.',
        'Gerçek atamayı super().__setattr__(ad, deger) ile yap. Ayrıca self.ad = deger yanlış ada (\'ad\') yazıyor.'
      ], why: '__setattr__ her atamada çağrılır; içinden self üzerinden atama yapmak sonsuz özyinelemedir. object.__setattr__ (super) atamayı doğrudan örnek sözlüğüne yazar.' },
    { t: 'code', stage: 'Hata avı', id: 'ileri-oop-x7', kind: 'bug', diff: 2, q: '<p>Hatayı bul ve düzelt. <code>Sepet.toplam</code> ürün eklendikten sonra eski değeri göstermeye devam ediyor. Toplam her zaman güncel olmalı; <code>ekle</code> eklenen satır sayısını döndürmeye devam etmeli.</p>', start: 'from functools import cached_property\n\nclass Sepet:\n    def __init__(self):\n        self.kalemler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        self.kalemler.append((ad, fiyat, adet))\n        return len(self.kalemler)\n\n    @cached_property\n    def toplam(self):\n        return sum(f * a for _, f, a in self.kalemler)\n', sol: 'class Sepet:\n    def __init__(self):\n        self.kalemler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        self.kalemler.append((ad, fiyat, adet))\n        return len(self.kalemler)\n\n    @property\n    def toplam(self):\n        return sum(f * a for _, f, a in self.kalemler)\n', tests: 's = Sepet()\nassert s.toplam == 0\nassert s.ekle("çay", 120, 2) == 1\nassert s.toplam == 240, "Ekleme sonrası toplam güncellenmeli"\ns.ekle("şeker", 60)\nassert s.toplam == 300, "İkinci eklemeden sonra da güncel olmalı"\n', hints: [
        'cached_property ilk sonucu örneğe yazar ve bir daha hesaplamaz.',
        'Değişebilir duruma bağlı değerler için @property kullan (ya da ekle içinde önbelleği sil).'
      ], why: 'cached_property yalnızca nesnenin ömrü boyunca değişmeyen değerler içindir. Sepet gibi değişen durumda bayat veri, yanlış fatura demektir.' },
    { t: 'code', stage: 'Meydan okuma', id: 'ileri-oop-x8', diff: 3, q: '<p>Değişmez <code>Para(kurus: int, birim: str)</code> değer nesnesini yaz. Gereksinimler: <code>+</code> ve <code>-</code> aynı birimde yeni Para döndürür, farklı birimde <code>ValueError</code>; Para dışı türde <code>NotImplemented</code> (TypeError\'a yol açar). <code>sum()</code> çalışır. <code>p * n</code> ve <code>n * p</code> (n int) kuruşu çarpar. <code>-p</code> işaret çevirir. <code>==</code> ve <code>hash</code> (kurus, birim) üzerinden; <code>&lt;</code> ve diğer sıralamalar aynı birimde çalışır (<code>total_ordering</code>), farklı birimde ValueError. <code>bool(p)</code> kuruş sıfır değilse True. <code>repr</code> <code>Para(150, \'TRY\')</code>.</p>', start: 'from functools import total_ordering\n\nclass Para:\n    pass\n', sol: 'from functools import total_ordering\n\n@total_ordering\nclass Para:\n    __slots__ = ("kurus", "birim")\n\n    def __init__(self, kurus, birim="TRY"):\n        object.__setattr__(self, "kurus", kurus)\n        object.__setattr__(self, "birim", birim)\n\n    def __setattr__(self, ad, deger):\n        raise AttributeError("Para değişmezdir")\n\n    def __repr__(self):\n        return f"Para({self.kurus!r}, {self.birim!r})"\n\n    def _ayni(self, o):\n        if o.birim != self.birim:\n            raise ValueError("Birimler farklı")\n\n    def __add__(self, o):\n        if not isinstance(o, Para):\n            return NotImplemented\n        self._ayni(o)\n        return Para(self.kurus + o.kurus, self.birim)\n\n    def __radd__(self, o):\n        if o == 0:\n            return self\n        return self.__add__(o)\n\n    def __sub__(self, o):\n        if not isinstance(o, Para):\n            return NotImplemented\n        self._ayni(o)\n        return Para(self.kurus - o.kurus, self.birim)\n\n    def __mul__(self, n):\n        if isinstance(n, bool) or not isinstance(n, int):\n            return NotImplemented\n        return Para(self.kurus * n, self.birim)\n\n    __rmul__ = __mul__\n\n    def __neg__(self):\n        return Para(-self.kurus, self.birim)\n\n    def __eq__(self, o):\n        if not isinstance(o, Para):\n            return NotImplemented\n        return (self.kurus, self.birim) == (o.kurus, o.birim)\n\n    def __hash__(self):\n        return hash((self.kurus, self.birim))\n\n    def __lt__(self, o):\n        if not isinstance(o, Para):\n            return NotImplemented\n        self._ayni(o)\n        return self.kurus < o.kurus\n\n    def __bool__(self):\n        return self.kurus != 0\n', tests: 'a, b = Para(150), Para(50)\nassert repr(a) == "Para(150, \'TRY\')", "repr biçimi"\nassert a + b == Para(200) and a - b == Para(100), "Toplama/çıkarma aynı birimde"\nassert sum([a, b, b]) == Para(250), "sum çalışmalı (__radd__)"\nassert a * 3 == Para(450) and 2 * b == Para(100), "Çarpma iki yönde de çalışmalı"\nassert -a == Para(-150)\nassert b < a and a >= b and not (a <= b), "Sıralama total_ordering ile tamamlanmalı"\nassert len({Para(1), Para(1), Para(1, "USD")}) == 2, "hash (kurus, birim) üzerinden"\nassert not Para(0) and Para(1), "bool kuruş sıfırsa False"\nfor islem in (lambda: a + Para(1, "USD"), lambda: a < Para(1, "EUR")):\n    try:\n        islem()\n        raise AssertionError("Farklı birim ValueError vermeli")\n    except ValueError:\n        pass\nfor islem in (lambda: a + 5, lambda: a * 1.5):\n    try:\n        islem()\n        raise AssertionError("Desteklenmeyen tür TypeError vermeli")\n    except TypeError:\n        pass\nassert Para(5) != 5, "Para ile int eşit değildir"\n', hints: [
        'Her ikili operatörde önce isinstance kontrolü, tanımadığın türe NotImplemented.',
        'Birim kontrolü için ortak bir yardımcı metot yaz; total_ordering için __eq__ ve __lt__ yeter.',
        'n * p için __rmul__ = __mul__; sum için __radd__ 0\'ı tanımalı.'
      ], why: 'Para gibi değer nesneleri finans kodunun temelidir: birim karışmasını tür seviyesinde engeller, float yuvarlama hatasından kaçınmak için kuruşla çalışır, hash\'lenebilir olduğu için sözlük anahtarı olabilir.' }
  ],
  faq: [
    { q: '__repr__ mi __str__ mi önce yazılmalı?', a: 'Önce __repr__. str tanımlı değilse repr kullanılır, ama tersi geçerli değildir. İyi bir repr loglarda ve hata ayıklamada zaman kazandırır; __str__\'i yalnız son kullanıcıya farklı bir metin göstereceksen yaz.' },
    { q: '__init_subclass__ varken metaclass\'a ne zaman ihtiyaç olur?', a: 'Alt sınıf kaydı, doğrulama ve varsayılan atama gibi işlerin çoğu __init_subclass__ ya da sınıf dekoratörüyle çözülür. Metaclass, sınıf gövdesinin nasıl oluşturulduğunu (ör. ad alanını özelleştirme) değiştirmen gerektiğinde gerekir; metaprogramlama dersinde ayrıntısı var.' }
  ],
  mistakes: [
    { bad: 'def __add__(self, other):\n    if not isinstance(other, Tutar):\n        raise TypeError("desteklenmiyor")', good: 'def __add__(self, other):\n    if not isinstance(other, Tutar):\n        return NotImplemented', why: 'TypeError fırlatmak karşı tarafın __radd__ metoduna şans tanımaz. NotImplemented döndürürsen Python yansıyan metodu dener, ikisi de reddederse TypeError zaten oluşur.' },
    { bad: 'def __setattr__(self, ad, deger):\n    self.__dict__[ad] = deger\n    self.son_degisen = ad   # yine __setattr__', good: 'def __setattr__(self, ad, deger):\n    super().__setattr__(ad, deger)\n    super().__setattr__("son_degisen", ad)', why: '__setattr__ içinden self.x = ... yazmak özyinelemeye girer. Gerçek atama her zaman super().__setattr__ (ya da object.__setattr__) ile yapılmalı.' }
  ]
}
);
})(window);
