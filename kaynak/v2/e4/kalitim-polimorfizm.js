/* Kesit Python — v2 e4 uzantı: kalitim-polimorfizm */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'kalitim-polimorfizm',
  min: 35,
  html: `<h2>Derinleş: ezmenin incelikleri ve hiyerarşi tasarımı</h2>
<p>Kalıtımın sözdizimini artık biliyorsun. Gerçek kodda asıl sorular şunlardır: Üst sınıftaki bir metot alt sınıfın metodunu nasıl çağırır? Bir davranışı tamamen mi değiştirmeli, yoksa genişletmeli miyim? <code>dict</code> ya da <code>list</code>'ten türetmek neden beklenmedik sonuçlar verir? Bu bölüm bu soruları yanıtlıyor. Çoklu kalıtım ve MRO'nun ayrıntısını "Çoklu kalıtım" dersinde, <code>__init_subclass__</code> ile otomatik kayıt sistemlerini "Metaprogramlama" dersinde göreceksin.</p>

<h3>1. Dinamik bağlama: self her zaman en alttaki sınıftır</h3>
<p>Üst sınıftaki bir metot <code>self.baska_metot()</code> çağırdığında Python bu adı <b>nesnenin gerçek sınıfından</b> başlayarak arar. Yani üst sınıf, henüz yazılmamış alt sınıfların metotlarını çağırabilir. Buna dinamik bağlama (dynamic dispatch, late binding) denir ve <b>şablon metot</b> (template method) kalıbının temelidir: üst sınıf algoritmanın iskeletini sabitler, alt sınıflar yalnızca "kanca" (hook) metotları doldurur.</p>
<pre class="py">class Rapor:
    def olustur(self, satirlar):            # iskelet: sıra sabit
        parcalar = [self.baslik()]
        parcalar += [self.satir(s) for s in satirlar]
        parcalar.append(self.altbilgi(len(satirlar)))
        return "\\n".join(parcalar)

    def baslik(self):
        return "RAPOR"
    def satir(self, s):
        return str(s)
    def altbilgi(self, n):
        return f"{n} kayıt"

class SubeRaporu(Rapor):                    # yalnız farkı yaz
    def baslik(self):
        return "== Şube Cirosu =="
    def satir(self, s):
        return f"{s[0]:&lt;8}{s[1]:&gt;8,} TL"

print(SubeRaporu().olustur([("Ankara", 125000), ("İzmir", 98500)]))</pre>
<div class="tip"><b>Ne zaman şablon metot?</b>Birden çok sınıfın adımları aynı sırada yürüyüp yalnız bazı adımların içeriği değişiyorsa (rapor üretme, dosya içe aktarma, ödeme akışı). Sırayı üst sınıf korur; böylece hiçbir alt sınıf "doğrulamayı atlayıp kaydetme" gibi bir hata yapamaz.</div>

<h3>2. Ezmenin dört biçimi</h3>
<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>Kod</th><th>Ne zaman</th></tr>
<tr><td>Tamamen değiştir</td><td><code>def cek(self, t): ...</code> (super yok)</td><td>Davranış kökten farklı</td></tr>
<tr><td>Öne kural ekle</td><td>kontrol + <code>super().cek(t)</code></td><td>Ek kısıt (vade, limit)</td></tr>
<tr><td>Sonucu genişlet</td><td><code>return super().ozet() + " (VIP)"</code></td><td>Üst sonucu süsle/zenginleştir</td></tr>
<tr><td>Sınıf niteliğini ez</td><td><code>masraf = 0.0</code> alt sınıf gövdesinde</td><td>Yalnız bir sabit farklı</td></tr>
</table></div>
<p>Son satır çok güçlüdür ve çoğu zaman metot ezmekten daha temizdir: üst sınıfın metodu <code>self.ORAN</code> okursa alt sınıf yalnız sabiti değiştirerek davranışı uyarlar.</p>
<pre class="py">class Hesap:
    FAIZ = 0.30
    ETIKET = "Standart"

    def __init__(self, no, bakiye):
        self.no, self.bakiye = no, bakiye

    def yillik_faiz(self):
        return round(self.bakiye * self.FAIZ, 2)   # self.FAIZ: alt sınıfınki bulunur

    def ozet(self):
        return f"{self.no} [{self.ETIKET}] faiz={self.yillik_faiz()}"

class Vip(Hesap):
    FAIZ = 0.40
    ETIKET = "VIP"

    def ozet(self):                                 # sonucu genişlet
        return super().ozet() + " + ücretsiz EFT"

for h in [Hesap("TR01", 10000), Vip("TR02", 10000)]:
    print(h.ozet())
print(Hesap.FAIZ, Vip.FAIZ)</pre>
<div class="warn"><b>Hesap.FAIZ değil self.FAIZ</b>Üst sınıfın metodunda sabiti <code>Hesap.FAIZ</code> diye okursan alt sınıfın ezdiği değer hiç kullanılmaz. Ezilebilir olmasını istediğin her sabiti <code>self.</code> (ya da <code>type(self).</code>) üzerinden oku.</div>

<h3>3. Yerleşik türlerden türetmek: dict ve list tuzağı</h3>
<p><code>class Ayarlar(dict)</code> yazmak cazip gelir, ama yerleşik türler C ile yazılmıştır ve kendi iç metotları senin ezdiğin metodu <b>çağırmaz</b>. Örneğin <code>__setitem__</code>'ı ezsen bile kurucu (<code>dict(...)</code>), <code>update</code> ve <code>setdefault</code> onu atlar. Çözüm <code>collections.UserDict</code> / <code>UserList</code>'tir: saf Python ile yazıldıkları için tüm yollar senin metodundan geçer.</p>
<pre class="py">from collections import UserDict

class AnahtarBuyuk(dict):
    def __setitem__(self, k, v):
        super().__setitem__(k.upper(), v)

d = AnahtarBuyuk(ankara=1)        # kurucu __setitem__'ı ÇAĞIRMAZ
d["izmir"] = 2                    # bu çağırır
d.update(bursa=3)                 # bu da çağırmaz
print(d)

class AnahtarBuyuk2(UserDict):
    def __setitem__(self, k, v):
        super().__setitem__(k.upper(), v)

u = AnahtarBuyuk2(ankara=1)
u["izmir"] = 2
u.update(bursa=3)
print(u, isinstance(u, dict))
print(u.data)                     # gerçek sözlük .data içinde</pre>
<p><code>UserDict</code> bir <code>dict</code> alt sınıfı değildir (<code>isinstance(u, dict)</code> False); <code>json.dumps</code> gibi gerçek sözlük isteyen yerlere <code>u.data</code> ya da <code>dict(u)</code> verirsin. Çoğu durumda en iyisi ise türetmek değil, sözlüğü nitelik olarak tutmaktır (kompozisyon).</p>

<h3>4. NotImplementedError mı, ABC mi?</h3>
<p>Eski kodlarda soyut metot şöyle yazılır: <code>def ode(self): raise NotImplementedError</code>. Fark, hatanın <b>ne zaman</b> ortaya çıktığıdır: <code>NotImplementedError</code> ancak metot çağrıldığında patlar (belki üretimde, gece 3'te); <code>ABC</code> + <code>@abstractmethod</code> ise eksik alt sınıfı daha <b>nesne oluşturulurken</b> <code>TypeError</code> ile durdurur. Soyut property de yazabilirsin: <code>@property</code> ve <code>@abstractmethod</code> birlikte, <code>@property</code> en üstte.</p>
<pre class="py">from abc import ABC, abstractmethod

class Eski:
    def ode(self, tutar):
        raise NotImplementedError("alt sınıf yazmalı")

class EskiHavale(Eski):
    pass

h = EskiHavale()                  # sorun yok gibi...
try:
    h.ode(100)                    # ...ta ki çağrılana kadar
except NotImplementedError as e:
    print("Geç fark edildi:", e)

class Odeme(ABC):
    @property
    @abstractmethod
    def komisyon(self): ...

    def net(self, tutar):
        return round(tutar - tutar * self.komisyon, 2)

class Kart(Odeme):
    komisyon = 0.02               # sınıf niteliği de soyut property'yi karşılar

class Eksik(Odeme):
    pass

print(Kart().net(1000))
try:
    Eksik()
except TypeError as e:
    print("Erken fark edildi:", type(e).__name__)</pre>

<h3>5. Liskov: alt sınıf sözü bozmasın</h3>
<p>Liskov yerine koyma ilkesi (LSP) pratikte şu kontrol listesidir. Alt sınıfta bir metodu ezerken: aynı parametreleri kabul et (daha azını değil), aynı türde değer döndür, üst sınıfın fırlatmadığı yeni hata türleri fırlatma, üst sınıfın garanti ettiği değişmezleri (bakiye tutarlılığı gibi) koru. Klasik ihlal "Kare bir Dikdörtgendir" örneğidir: dikdörtgende genişliği değiştirmek yüksekliği etkilemez, karede etkiler; dikdörtgen bekleyen kod kareyle bozulur. Tersine bakarsan: alt sınıfta bir metodu <code>raise NotImplementedError("bu türde desteklenmez")</code> ile "kapatıyorsan" o sınıf aslında o üst sınıfın türü değildir.</p>

<div class="note"><b>Gerçek işte</b>Django'nun sınıf tabanlı görünümleri (class-based views), unittest'in <code>TestCase</code>'i ve scikit-learn'ün tahminleyicileri (<code>fit</code>/<code>predict</code>) şablon metot ve sınıf niteliği ezme üzerine kuruludur: sen yalnız <code>template_name = "..."</code> ya da <code>setUp</code> yazarsın, iskeleti çerçeve çalıştırır. Bir kütüphanenin sınıfından türetmeden önce belgesinde "hangi metotları ezmen bekleniyor" kısmını oku; dokümante edilmemiş iç metotları ezmek sürüm yükseltmede kırılır.</div>
`,
  ex: [
    { t: 'mc', stage: 'Isınma', q: 'Soyut metodu <code>raise NotImplementedError</code> ile yazmak yerine <code>ABC</code> + <code>@abstractmethod</code> kullanmanın temel faydası nedir?', o: ['Kod belirgin biçimde daha hızlı çalışır', 'Eksik alt sınıf, örneklenirken yakalanır', 'Alt sınıflar super() çağırmak zorunda kalmaz', 'Soyut metotlar otomatik olarak statik olur'], a: 1, why: 'NotImplementedError ancak metot çağrıldığında ortaya çıkar. ABC ise soyut metodu tanımlamayan sınıfın örneklenmesini engeller; hata çok daha erken fark edilir.' },
    { t: 'mc', stage: 'Isınma', q: '<code>Hesap.cek(tutar)</code> yetersiz bakiyede <code>ValueError</code> fırlatıyor. Hangi alt sınıf tasarımı Liskov ilkesini <b>bozar</b>?', o: ['Kredili.cek, limit aşılırsa ValueError fırlatır', 'Vadeli.cek, vade dolmadıysa ValueError fırlatır', 'Kilitli.cek(tutar, sifre): zorunlu ek parametre ister', 'Vip.cek, işlemi ayrıca loglar ve super().cek çağırır'], a: 2, why: 'Hesap bekleyen kod cek(tutar) diye çağırır; zorunlu yeni parametre isteyen alt sınıf bu çağrıyı TypeError ile kırar. Aynı hata türünü farklı kurala göre fırlatmak ya da ek iş yapmak sözleşmeyi bozmaz.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Üst sınıf metodu <code>self.tur()</code> çağırıyor. Çıktı ne olur?', code: 'class Hesap:\n    def tur(self):\n        return "genel"\n    def rapor(self):\n        return "Hesap: " + self.tur()\n\nclass Vadeli(Hesap):\n    def tur(self):\n        return "vadeli"\n\nprint(Vadeli().rapor())\nprint(Hesap().rapor())\n', o: ['Hesap: genel\nHesap: genel', 'Hesap: vadeli\nHesap: genel', 'Hesap: vadeli\nHesap: vadeli', 'AttributeError hatası verir'], a: 1, why: 'rapor üst sınıfta tanımlı olsa da self bir Vadeli nesnesidir; self.tur() araması Vadeli\'den başlar (dinamik bağlama). Hesap nesnesinde ise kendi tur metodu çalışır.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Sınıf niteliği alt sınıfta eziliyor. Çıktı ne olur?', code: 'class Kargo:\n    UCRET = 50\n    def fiyat(self, desi):\n        return self.UCRET + desi * 10\n    def fiyat_sabit(self, desi):\n        return Kargo.UCRET + desi * 10\n\nclass Hizli(Kargo):\n    UCRET = 90\n\nh = Hizli()\nprint(h.fiyat(2), h.fiyat_sabit(2))\n', o: ['70 70', '110 110', '110 70', '70 110'], a: 2, why: 'self.UCRET aramaya Hizli\'den başlar ve 90 bulur: 90 + 20 = 110. Kargo.UCRET ise sınıf adını sabit yazdığı için her zaman 50 okur: 70. Ezilebilir sabitleri self üzerinden oku.' },
    { t: 'predict', stage: 'Kodu oku', q: '<code>dict</code>\'ten türetilmiş sınıfta <code>__setitem__</code> ezildi. Çıktı ne olur?', code: 'class Kucuk(dict):\n    def __setitem__(self, k, v):\n        super().__setitem__(k.lower(), v)\n\nd = Kucuk(ANKARA=1)\nd["IZMIR"] = 2\nprint(d)\n', o: ['{\'ankara\': 1, \'izmir\': 2}', '{\'ANKARA\': 1, \'izmir\': 2}', '{\'ANKARA\': 1, \'IZMIR\': 2}', '{\'ankara\': 1, \'IZMIR\': 2}'], a: 1, why: 'dict\'in C ile yazılmış kurucusu ezilen __setitem__\'ı çağırmaz; ANKARA olduğu gibi kalır. d["IZMIR"] = 2 ise senin metodundan geçer. Tutarlı davranış için collections.UserDict kullan.' },
    { t: 'order', stage: 'Kodu oku', q: '<p>Şablon metot kalıbı: üst sınıf iskeleti, alt sınıf yalnız bir adımı tanımlıyor. Satırları sırala.</p>', lines: ['class Aktarim:', '    def calistir(self, satirlar):', '        return [self.donustur(s) for s in satirlar if s.strip()]', 'class CsvAktarim(Aktarim):', '    def donustur(self, s):', '        return s.strip().split(";")', 'print(CsvAktarim().calistir(["a;1", "  ", "b;2"]))'], expect: '[[\'a\', \'1\'], [\'b\', \'2\']]\n', hint: 'Üst sınıf önce gelir; alt sınıf parantez içinde üst sınıfı belirtir; print en sonda.', why: 'Aktarim.calistir boş satırları atlayıp her satırı self.donustur ile çevirir; donustur alt sınıfta tanımlı olduğu için CsvAktarim nesnesinde çalışır.' },
    { t: 'code', stage: 'Rehberli', id: 'kalitim-polimorfizm-x1', diff: 2, q: '<p>Şablon metot. <code>Bildirim</code> üst sınıfı hazır: <code>gonder(mesaj)</code>, <code>"[KANAL] bicimlenmis_mesaj"</code> döndürür ve <code>self.KANAL</code> ile <code>self.bicimle(mesaj)</code> kullanır. İki alt sınıf yaz:</p><ul><li><code>Sms</code>: <code>KANAL = "SMS"</code>; <code>bicimle</code> mesajın ilk 20 karakterini döndürsün, mesaj 20 karakterden uzunsa ilk 17 karakter + <code>"..."</code>.</li><li><code>Eposta</code>: <code>KANAL = "E-POSTA"</code>; <code>bicimle</code> <code>"Sayın müşterimiz, " + mesaj</code> döndürsün.</li></ul><p><code>gonder</code>\'i alt sınıflarda yeniden yazma.</p>', guide: ['Her alt sınıfın gövdesinde KANAL sınıf niteliğini tanımla.', 'Yalnız bicimle metodunu ez.', 'Sms\'te uzunluğu len(mesaj) > 20 ile kontrol et.', 'Kısaltırken mesaj[:17] + "..." kullan.'], example: 'class Selam:\n    DIL = "?"\n    def soyle(self, ad):\n        return f"({self.DIL}) {self.kalip(ad)}"\n    def kalip(self, ad):\n        return ad\n\nclass Ingilizce(Selam):\n    DIL = "EN"\n    def kalip(self, ad):\n        return "Hello " + ad\n\nprint(Ingilizce().soyle("Ece"))\n', start: 'class Bildirim:\n    KANAL = "?"\n\n    def gonder(self, mesaj):\n        return f"[{self.KANAL}] {self.bicimle(mesaj)}"\n\n    def bicimle(self, mesaj):\n        return mesaj\n\n\nclass Sms(Bildirim):\n    # TODO: KANAL ve bicimle\n    pass\n\n\nclass Eposta(Bildirim):\n    # TODO: KANAL ve bicimle\n    pass\n', sol: 'class Bildirim:\n    KANAL = "?"\n\n    def gonder(self, mesaj):\n        return f"[{self.KANAL}] {self.bicimle(mesaj)}"\n\n    def bicimle(self, mesaj):\n        return mesaj\n\n\nclass Sms(Bildirim):\n    KANAL = "SMS"\n\n    def bicimle(self, mesaj):\n        if len(mesaj) > 20:\n            return mesaj[:17] + "..."\n        return mesaj\n\n\nclass Eposta(Bildirim):\n    KANAL = "E-POSTA"\n\n    def bicimle(self, mesaj):\n        return "Sayın müşterimiz, " + mesaj\n', tests: 'assert Sms().gonder("Kodunuz 4821") == "[SMS] Kodunuz 4821", "kısa SMS olduğu gibi gitmeli"\nassert Sms().gonder("Siparişiniz kargoya verildi") == "[SMS] Siparişiniz kargo...", "20 karakterden uzun SMS 17 karakter + ... olmalı"\nassert len(Sms().bicimle("x" * 20)) == 20, "tam 20 karakterlik mesaj kısaltılmamalı"\nassert Eposta().gonder("faturanız hazır.") == "[E-POSTA] Sayın müşterimiz, faturanız hazır.", "e-posta öneki eklenmeli"\nassert "gonder" not in vars(Sms) and "gonder" not in vars(Eposta), "gonder üst sınıfta kalmalı; alt sınıfta yeniden yazma"\nassert Bildirim().gonder("x") == "[?] x", "üst sınıf değişmemeli"\n', hints: ['Üst sınıf iskeleti çalıştırır; sen yalnız kanca (bicimle) ve sabiti (KANAL) ver.', 'class Sms(Bildirim): içinde KANAL = "SMS" ve def bicimle(self, mesaj) tanımla.', 'Sms.bicimle: return mesaj[:17] + "..." if len(mesaj) > 20 else mesaj'], why: 'gonder self.KANAL ve self.bicimle\'yi dinamik olarak çözer; alt sınıflar yalnız farkı tanımlar.' },
    { t: 'code', stage: 'Rehberli', id: 'kalitim-polimorfizm-x2', diff: 2, q: '<p>Sonucu genişletme. <code>Urun(ad, fiyat)</code> hazır: <code>son_fiyat()</code> fiyatı, <code>etiket()</code> ise <code>"Ad - 100.00 TL"</code> döndürür. <code>IndirimliUrun(ad, fiyat, oran)</code> alt sınıfını yaz:</p><ul><li>Kurucu <code>super().__init__</code> kullansın, <code>oran</code> (ör. 0.2) eklesin.</li><li><code>son_fiyat()</code>: <code>round(fiyat * (1 - oran), 2)</code>.</li><li><code>etiket()</code>: üst sınıfın etiketine <code>" (%20 indirim)"</code> biçiminde ek koysun (yüzde tam sayı).</li></ul>', guide: ['Kurucuda önce super().__init__(ad, fiyat), sonra self.oran.', 'son_fiyat\'ı ez.', 'etiket içinde super().etiket() çağır ve sonuna ekle.', 'Yüzdeyi round(self.oran * 100) ile tam sayıya çevir.'], example: 'class Hesap:\n    def ozet(self):\n        return "Hesap"\n\nclass Vip(Hesap):\n    def ozet(self):\n        return super().ozet() + " (VIP)"\n\nprint(Vip().ozet())\n', start: 'class Urun:\n    def __init__(self, ad, fiyat):\n        self.ad, self.fiyat = ad, fiyat\n\n    def son_fiyat(self):\n        return self.fiyat\n\n    def etiket(self):\n        return f"{self.ad} - {self.son_fiyat():.2f} TL"\n\n\nclass IndirimliUrun(Urun):\n    def __init__(self, ad, fiyat, oran):\n        # TODO: super ve oran\n        pass\n\n    # TODO: son_fiyat ve etiket\n', sol: 'class Urun:\n    def __init__(self, ad, fiyat):\n        self.ad, self.fiyat = ad, fiyat\n\n    def son_fiyat(self):\n        return self.fiyat\n\n    def etiket(self):\n        return f"{self.ad} - {self.son_fiyat():.2f} TL"\n\n\nclass IndirimliUrun(Urun):\n    def __init__(self, ad, fiyat, oran):\n        super().__init__(ad, fiyat)\n        self.oran = oran\n\n    def son_fiyat(self):\n        return round(self.fiyat * (1 - self.oran), 2)\n\n    def etiket(self):\n        return super().etiket() + f" (%{round(self.oran * 100)} indirim)"\n', tests: 'u = IndirimliUrun("Kulaklık", 1000, 0.2)\nassert u.son_fiyat() == 800.0, "1000 * 0.8 = 800.0 olmalı"\nassert u.etiket() == "Kulaklık - 800.00 TL (%20 indirim)", "etiket üst sınıf etiketi + indirim notu olmalı (fiyat indirimli görünmeli)"\nassert IndirimliUrun("Kablo", 89.9, 0.15).etiket() == "Kablo - 76.42 TL (%15 indirim)", "89.9 * 0.85 = 76.415 -> 76.42"\nassert isinstance(u, Urun), "IndirimliUrun, Urun\'dan türemeli"\nassert "etiket" in vars(IndirimliUrun) and "super()" in __source__, "etiket ezilmeli ve super() kullanılmalı"\nassert Urun("Fare", 300).etiket() == "Fare - 300.00 TL", "üst sınıf değişmemeli"\n', hints: ['Üst sınıfın etiketi self.son_fiyat() çağırıyor; ezdiğin son_fiyat orada da kullanılır.', 'super().etiket() + f" (%{round(self.oran * 100)} indirim)"', 'Kurucu: super().__init__(ad, fiyat); self.oran = oran'], why: 'super().etiket() üst sınıfın biçimini yeniden kullanır; içindeki self.son_fiyat() dinamik bağlama sayesinde indirimli fiyatı verir.' },
    { t: 'code', stage: 'Rehberli', id: 'kalitim-polimorfizm-x3', diff: 2, q: '<p>Anadolu Market şehir adlarını anahtar olarak tutan bir sözlük istiyor; anahtarlar her yoldan (kurucu, <code>[]=</code>, <code>update</code>, okuma) <b>boşlukları kırpılmış ve küçük harfli</b> olsun. <code>collections.UserDict</code>\'ten türeyen <code>SehirSozlugu</code> yaz: <code>__setitem__</code> ve <code>__getitem__</code> metotlarını ez; anahtarı <code>anahtar.strip().lower()</code> ile normalleştir.</p>', guide: ['from collections import UserDict', 'Normalleştirmeyi ayrı bir yardımcı metotta yaz (ör. _norm).', '__setitem__ içinde super().__setitem__(self._norm(k), v).', '__getitem__ içinde super().__getitem__(self._norm(k)).'], example: 'from collections import UserList\n\nclass PozitifListe(UserList):\n    def append(self, x):\n        if x <= 0:\n            raise ValueError("pozitif olmalı")\n        super().append(x)\n\np = PozitifListe([1, 2])\np.append(5)\nprint(p)\n', start: 'from collections import UserDict\n\n\nclass SehirSozlugu(dict):   # TODO: doğru temel sınıf\n    def __setitem__(self, k, v):\n        # TODO: normalleştir\n        super().__setitem__(k, v)\n', sol: 'from collections import UserDict\n\n\nclass SehirSozlugu(UserDict):\n    def _norm(self, k):\n        return k.strip().lower()\n\n    def __setitem__(self, k, v):\n        super().__setitem__(self._norm(k), v)\n\n    def __getitem__(self, k):\n        return super().__getitem__(self._norm(k))\n', tests: 's = SehirSozlugu({" Ankara ": 120})\nassert dict(s) == {"ankara": 120}, "kurucu da anahtarı normalleştirmeli (UserDict kullan)"\ns["IZMIR "] = 80\ns.update({"BURSA ": 40})\nassert dict(s) == {"ankara": 120, "izmir": 80, "bursa": 40}, "[]= ve update de normalleştirmeli"\nassert s["  ANKARA"] == 120, "okurken de anahtar normalleşmeli"\nassert "Bursa" in s or "bursa" in s, "bursa bulunmalı"\ntry:\n    s["Konya"]\n    assert False, "olmayan şehir KeyError vermeli"\nexcept KeyError:\n    pass\n', hints: ['dict\'ten türetince kurucu ve update senin __setitem__\'ını atlar.', 'class SehirSozlugu(UserDict) ve iki metot: __setitem__, __getitem__.', 'def __getitem__(self, k): return super().__getitem__(k.strip().lower())'], why: 'UserDict saf Python olduğu için kurucu ve update de __setitem__ üzerinden geçer; normalleştirme tek yerde yapılır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kalitim-polimorfizm-x4', diff: 2, q: '<p>Lojistik ücretlendirme. <code>abc</code> ile soyut <code>Gonderi(desi)</code> sınıfı yaz; soyut <code>ucret()</code> metodu olsun. Alt sınıflar:</p><ul><li><code>Standart</code>: <code>30 + 5 * desi</code></li><li><code>Hizli(Standart)</code>: standart ücretin 1.5 katı, <code>round(..., 2)</code> (standart hesabı <code>super()</code> ile al)</li><li><code>Iade</code>: her zaman 0</li></ul><p>Ayrıca <code>toplam_ucret(gonderiler)</code> fonksiyonu tür kontrolü yapmadan toplamı döndürsün. <code>Gonderi(3)</code> doğrudan oluşturulamamalı.</p>', sol: 'from abc import ABC, abstractmethod\n\n\nclass Gonderi(ABC):\n    def __init__(self, desi):\n        self.desi = desi\n\n    @abstractmethod\n    def ucret(self):\n        ...\n\n\nclass Standart(Gonderi):\n    def ucret(self):\n        return 30 + 5 * self.desi\n\n\nclass Hizli(Standart):\n    def ucret(self):\n        return round(super().ucret() * 1.5, 2)\n\n\nclass Iade(Gonderi):\n    def ucret(self):\n        return 0\n\n\ndef toplam_ucret(gonderiler):\n    return sum(g.ucret() for g in gonderiler)\n', tests: 'assert Standart(4).ucret() == 50, "30 + 5*4 = 50"\nassert Hizli(4).ucret() == 75.0, "50 * 1.5 = 75.0"\nassert Iade(10).ucret() == 0, "iade ücretsiz"\nassert isinstance(Hizli(1), Standart), "Hizli, Standart\'tan türemeli"\nassert toplam_ucret([Standart(2), Hizli(2), Iade(5)]) == 40 + 60.0, "toplam 100 olmalı"\nassert toplam_ucret([]) == 0, "boş liste 0"\ntry:\n    Gonderi(3)\n    assert False, "Gonderi soyut olmalı (ABC + abstractmethod)"\nexcept TypeError:\n    pass\nassert "isinstance" not in __kod__, "toplam_ucret polimorfik olmalı; tür kontrolü yapma"\n', hints: ['from abc import ABC, abstractmethod; class Gonderi(ABC) içinde @abstractmethod def ucret(self).', 'Hizli.ucret: return round(super().ucret() * 1.5, 2)', 'toplam_ucret: sum(g.ucret() for g in gonderiler)'], why: 'Her sınıf kendi ücret kuralını taşır; toplam_ucret yeni gönderi türleri eklense de değişmez (açık-kapalı ilkesi).' },
    { t: 'code', stage: 'Kendin yaz', id: 'kalitim-polimorfizm-x5', diff: 2, q: '<p>İK izin sistemi. <code>Calisan(ad)</code> sınıfında sınıf niteliği <code>IZIN_GUNU = 14</code> olsun; <code>kalan_izin(kullanilan)</code> metodu <code>IZIN_GUNU - kullanilan</code> döndürsün ama 0\'ın altına inmesin. <code>__repr__</code>, <code>"Calisan(\'Ayşe\')"</code> biçiminde <b>gerçek sınıf adını</b> kullansın. Alt sınıflar <b>yalnız sınıf niteliğini</b> ezsin: <code>Yonetici</code> 20 gün, <code>Stajyer</code> 0 gün. Alt sınıflarda metot yazma.</p>', sol: 'class Calisan:\n    IZIN_GUNU = 14\n\n    def __init__(self, ad):\n        self.ad = ad\n\n    def kalan_izin(self, kullanilan):\n        return max(0, self.IZIN_GUNU - kullanilan)\n\n    def __repr__(self):\n        return f"{type(self).__name__}({self.ad!r})"\n\n\nclass Yonetici(Calisan):\n    IZIN_GUNU = 20\n\n\nclass Stajyer(Calisan):\n    IZIN_GUNU = 0\n', tests: 'assert Calisan("Ayşe").kalan_izin(5) == 9, "14 - 5 = 9"\nassert Yonetici("Mert").kalan_izin(5) == 15, "yönetici 20 gün: 20 - 5 = 15"\nassert Stajyer("Can").kalan_izin(0) == 0, "stajyerin izni yok"\nassert Calisan("Ayşe").kalan_izin(30) == 0, "kalan izin eksiye inmemeli"\nassert repr(Yonetici("Mert")) == "Yonetici(\'Mert\')", "repr gerçek sınıf adını göstermeli"\nassert repr(Calisan("Ayşe")) == "Calisan(\'Ayşe\')", "Calisan repr biçimi"\nassert set(vars(Yonetici)) & {"kalan_izin", "__repr__", "__init__"} == set(), "alt sınıflarda metot yazma; yalnız IZIN_GUNU"\n', hints: ['Üst sınıf metodu self.IZIN_GUNU okumalı (Calisan.IZIN_GUNU değil).', 'max(0, ...) eksiye inmeyi engeller; type(self).__name__ gerçek sınıf adını verir.', 'Alt sınıf gövdesi tek satır: IZIN_GUNU = 20'], why: 'Yalnız bir sabit farklıysa metot ezmek yerine sınıf niteliğini ezmek en sade çözümdür; self üzerinden okununca doğru değer bulunur.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kalitim-polimorfizm-x6', diff: 1, q: '<p>Hatayı bul ve düzelt. <code>Kredili</code> hesapta para çekince <code>AttributeError: \'Kredili\' object has no attribute \'islemler\'</code> alınıyor.</p>', start: 'class Hesap:\n    def __init__(self, no, bakiye=0):\n        self.no = no\n        self.bakiye = bakiye\n        self.islemler = []\n\n    def cek(self, tutar):\n        self.bakiye -= tutar\n        self.islemler.append(-tutar)\n\n\nclass Kredili(Hesap):\n    def __init__(self, no, bakiye=0, limit=1000):\n        self.limit = limit\n\n    def cek(self, tutar):\n        if tutar > self.bakiye + self.limit:\n            raise ValueError("limit aşıldı")\n        super().cek(tutar)\n', sol: 'class Hesap:\n    def __init__(self, no, bakiye=0):\n        self.no = no\n        self.bakiye = bakiye\n        self.islemler = []\n\n    def cek(self, tutar):\n        self.bakiye -= tutar\n        self.islemler.append(-tutar)\n\n\nclass Kredili(Hesap):\n    def __init__(self, no, bakiye=0, limit=1000):\n        super().__init__(no, bakiye)\n        self.limit = limit\n\n    def cek(self, tutar):\n        if tutar > self.bakiye + self.limit:\n            raise ValueError("limit aşıldı")\n        super().cek(tutar)\n', tests: 'k = Kredili("TR09", 200, limit=500)\nk.cek(600)\nassert k.bakiye == -400 and k.islemler == [-600], "çekme sonrası bakiye -400, işlem kaydı [-600] olmalı"\nassert k.no == "TR09", "no üst sınıf kurucusunda atanmalı"\ntry:\n    k.cek(200)\n    assert False, "limit aşımı ValueError vermeli"\nexcept ValueError:\n    pass\n', hints: ['Alt sınıf __init__ yazınca üst sınıfınki otomatik çağrılmaz.', 'no, bakiye ve islemler üst sınıfın kurucusunda atanıyor.', 'Kredili.__init__ ilk satırı: super().__init__(no, bakiye)'], why: 'super().__init__ çağrılmadığı için no, bakiye ve islemler hiç oluşmuyordu.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kalitim-polimorfizm-x7', diff: 2, q: '<p>Hatayı bul ve düzelt. <code>vadeli_toplam(hesaplar)</code> tüm vadeli hesapların bakiye toplamını vermeli. Yeni eklenen <code>DovizVadeli</code> (Vadeli\'nin alt sınıfı) toplama hiç girmiyor.</p>', start: 'class Hesap:\n    def __init__(self, bakiye):\n        self.bakiye = bakiye\n\nclass Vadeli(Hesap):\n    pass\n\nclass DovizVadeli(Vadeli):\n    pass\n\n\ndef vadeli_toplam(hesaplar):\n    return sum(h.bakiye for h in hesaplar if type(h) == Vadeli)\n', sol: 'class Hesap:\n    def __init__(self, bakiye):\n        self.bakiye = bakiye\n\nclass Vadeli(Hesap):\n    pass\n\nclass DovizVadeli(Vadeli):\n    pass\n\n\ndef vadeli_toplam(hesaplar):\n    return sum(h.bakiye for h in hesaplar if isinstance(h, Vadeli))\n', tests: 'hs = [Hesap(100), Vadeli(1000), DovizVadeli(500), Vadeli(250)]\nassert vadeli_toplam(hs) == 1750, "Vadeli ve alt sınıfları (DovizVadeli) toplanmalı: 1000 + 500 + 250"\nassert vadeli_toplam([Hesap(5)]) == 0, "vadeli olmayan sayılmamalı"\n', hints: ['type(h) == Vadeli alt sınıfları dışlar.', 'Alt sınıfları da kapsayan kontrol hangisi?', 'isinstance(h, Vadeli)'], why: 'type karşılaştırması tam eşleşme ister; isinstance kalıtım hiyerarşisini dikkate alır. Bir DovizVadeli de bir Vadelidir.' },
    { t: 'code', stage: 'Meydan okuma', id: 'kalitim-polimorfizm-x8', diff: 3, q: '<p>Fatura hiyerarşisi (şablon metot + sınıf niteliği ezme). <code>Fatura(kalemler)</code>: <code>kalemler</code> <code>(ad, tutar)</code> demetleri listesi; herhangi bir tutar negatifse kurucu <code>ValueError</code> versin. Sınıf niteliği <code>KDV = 0.20</code>. Metotlar:</p><ul><li><code>ara_toplam()</code>: tutarların toplamı</li><li><code>indirim()</code>: 0</li><li><code>kdv()</code>: <code>round((ara_toplam - indirim) * KDV, 2)</code></li><li><code>toplam()</code>: <code>round(ara_toplam - indirim + kdv, 2)</code></li></ul><p>Alt sınıflar: <code>KurumsalFatura</code> (ara toplam 10000 ve üzerindeyse %10 indirim, yalnız <code>indirim</code>\'i ezer), <code>IhracatFatura</code> (yalnız <code>KDV = 0</code>). Son olarak <code>ture_gore(faturalar)</code> sınıf adı → toplamların toplamı sözlüğü döndürsün (değerler <code>round(..., 2)</code>).</p>', sol: 'class Fatura:\n    KDV = 0.20\n\n    def __init__(self, kalemler):\n        if any(t < 0 for _, t in kalemler):\n            raise ValueError("negatif tutar")\n        self.kalemler = list(kalemler)\n\n    def ara_toplam(self):\n        return sum(t for _, t in self.kalemler)\n\n    def indirim(self):\n        return 0\n\n    def kdv(self):\n        return round((self.ara_toplam() - self.indirim()) * self.KDV, 2)\n\n    def toplam(self):\n        return round(self.ara_toplam() - self.indirim() + self.kdv(), 2)\n\n\nclass KurumsalFatura(Fatura):\n    def indirim(self):\n        a = self.ara_toplam()\n        return a * 0.10 if a >= 10000 else 0\n\n\nclass IhracatFatura(Fatura):\n    KDV = 0\n\n\ndef ture_gore(faturalar):\n    sonuc = {}\n    for f in faturalar:\n        ad = type(f).__name__\n        sonuc[ad] = round(sonuc.get(ad, 0) + f.toplam(), 2)\n    return sonuc\n', tests: 'f = Fatura([("a", 1000), ("b", 500)])\nassert f.kdv() == 300.0 and f.toplam() == 1800.0, "1500 + %20 KDV = 1800"\nk = KurumsalFatura([("sunucu", 12000)])\nassert k.indirim() == 1200.0, "10000 üstünde %10 indirim"\nassert k.kdv() == 2160.0 and k.toplam() == 12960.0, "(12000-1200)*1.2 = 12960"\nassert KurumsalFatura([("x", 9999)]).toplam() == round(9999 * 1.2, 2), "10000 altında indirim yok"\ni = IhracatFatura([("tekstil", 5000)])\nassert i.kdv() == 0 and i.toplam() == 5000, "ihracatta KDV yok"\nassert Fatura([]).toplam() == 0, "boş fatura 0"\ntry:\n    Fatura([("a", 10), ("iade", -5)])\n    assert False, "negatif tutar ValueError vermeli"\nexcept ValueError:\n    pass\nassert set(vars(KurumsalFatura)) - {"__module__", "__doc__", "__qualname__", "__firstlineno__", "__static_attributes__"} == {"indirim"}, "KurumsalFatura yalnız indirim metodunu ezmeli"\nassert "toplam" not in vars(IhracatFatura) and IhracatFatura.KDV == 0, "IhracatFatura yalnız KDV sabitini ezmeli"\nassert ture_gore([f, k, i, Fatura([("c", 100)])]) == {"Fatura": 1920.0, "KurumsalFatura": 12960.0, "IhracatFatura": 5000}, "tür adına göre toplamlar"\n', hints: ['Üst sınıfın kdv ve toplam metotları self.indirim() ve self.KDV kullanmalı; böylece alt sınıflar yalnız farkı verir.', 'Kurucuda any(t &lt; 0 for _, t in kalemler) kontrolü; ture_gore\'de type(f).__name__.', 'KurumsalFatura.indirim: a = self.ara_toplam(); return a * 0.10 if a >= 10000 else 0'], why: 'Algoritma (ara toplam → indirim → KDV → toplam) tek yerde; varyasyonlar kanca metot ve sınıf sabitiyle gelir. Yeni fatura türü eklemek mevcut kodu değiştirmez.' }
  ],
  faq: [
    { q: 'dict ya da list\'ten hiç türetmemeli miyim?', a: 'Yalnız ek metot ekleyip hiçbir yerleşik metodu ezmiyorsan türetmek sorunsuzdur. Mevcut davranışı (ekleme, okuma) değiştireceksen <code>collections.UserDict</code>/<code>UserList</code> kullan ya da sözlüğü nitelik olarak tut.' },
    { q: 'Alt sınıfta üst sınıftaki bir metodu "kaldırabilir" miyim?', a: 'Teknik olarak <code>raise NotImplementedError</code> yazabilirsin ama bu Liskov ilkesini bozar: üst sınıfı bekleyen kod kırılır. Böyle bir ihtiyaç hiyerarşinin yanlış kurulduğunu gösterir; ortak kısmı daha küçük bir üst sınıfa ya da kompozisyona taşı.' }
  ],
  mistakes: [
    { bad: 'class Hesap:\n    FAIZ = 0.3\n    def faiz(self):\n        return self.bakiye * Hesap.FAIZ', good: 'class Hesap:\n    FAIZ = 0.3\n    def faiz(self):\n        return self.bakiye * self.FAIZ', why: 'Sınıf adını sabit yazarsan alt sınıfların ezdiği FAIZ değeri hiç kullanılmaz.' },
    { bad: 'class Ayar(dict):\n    def __setitem__(self, k, v):\n        super().__setitem__(k.lower(), v)', good: 'from collections import UserDict\nclass Ayar(UserDict):\n    def __setitem__(self, k, v):\n        super().__setitem__(k.lower(), v)', why: 'dict\'in kurucusu ve update metodu ezilen __setitem__\'ı çağırmaz; UserDict tüm yolları senin metodundan geçirir.' }
  ]
});
})(window);
