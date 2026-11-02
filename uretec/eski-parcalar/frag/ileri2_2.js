(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'tasarim-kaliplari', lv: 'ileri', mod: 'Mimari', min: 38,
    title: 'Tasarım kalıpları Python\'da',
    sum: 'Strateji, fabrika, gözlemci, tekil, adaptör ve komut kalıplarını Python\'a özgü biçimde uygula; fonksiyonların birinci sınıf olduğu yerde kalıbın gereksizleştiğini gör.',
    goals: ['Strateji kalıbını sınıf hiyerarşisi yerine fonksiyon sözlüğüyle kurabilirim', 'Fabrika ve kayıt (registry) ile nesne üretimini çağıran koddan ayırabilirim', 'Gözlemci ve komut kalıplarıyla olay ve geri alma mekanizması tasarlayabilirim', 'Tekil (singleton) yerine neden modül düzeyi nesne kullanıldığını açıklayabilirim', 'Adaptör ile uyumsuz arayüzleri değişiklik yapmadan bağlayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Tasarım kalıpları (design patterns), tekrar eden tasarım sorunlarına verilmiş isimli çözümlerdir. Kod incelemesinde "burada strateji kalıbı daha uygun" cümlesi, dakikalarca anlatımın yerini tutar. Ama kalıpların çoğu Java/C++ dünyasında, fonksiyonların nesne olmadığı bir ortamda doğdu. Python\'da fonksiyonlar birinci sınıf (first-class) değerdir, sınıflar çalışma zamanında oluşturulabilir, modüller zaten tekil nesnedir. Bu yüzden bu derste her kalıbı iki kez göreceksin: klasik biçimi ve Python\'da sade biçimi. Hedef, kalıbı ezberlemek değil; <b>ne zaman gerektiğini ve ne zaman gerekmediğini</b> ayırt etmektir.</p>

<h2>Strateji: değiştirilebilir davranış</h2>
<p>Anadolu Market\'te kargo ücreti şehre, ağırlığa ve kampanyaya göre farklı kurallarla hesaplanıyor. Klasik çözüm bir <code>KargoStratejisi</code> soyut sınıfı ve alt sınıflarıdır. Python\'da aynı iş, aynı imzaya sahip fonksiyonlar ve bir sözlükle çözülür.</p>
<pre class="py">from typing import Callable

Strateji = Callable[[float, str], float]   # (agirlik_kg, sehir) -&gt; ücret

def sabit(agirlik, sehir):
    return 49.90

def agirlik_bazli(agirlik, sehir):
    return 20 + 8 * agirlik

def bolgesel(agirlik, sehir):
    uzak = {'Hakkari', 'Kars', 'Van'}
    return agirlik_bazli(agirlik, sehir) * (1.5 if sehir in uzak else 1.0)

STRATEJILER: dict[str, Strateji] = {
    'sabit': sabit, 'agirlik': agirlik_bazli, 'bolgesel': bolgesel,
}

def kargo_ucreti(agirlik, sehir, strateji: str = 'agirlik'):
    hesapla = STRATEJILER[strateji]
    return round(hesapla(agirlik, sehir), 2)

for s in STRATEJILER:
    print(f'{s:&lt;9}', kargo_ucreti(3.5, 'Van', s))
</pre>
<div class="tip"><b>Kalıp gerekmeyen durum</b>Strateji, "davranışı parametre olarak geçir" demektir. Python\'da bu zaten <code>sorted(key=...)</code>, <code>map</code>, dekoratör ile her gün yaptığın şeydir. Stratejinin durumu (state) ve birden fazla metodu varsa o zaman sınıf (ya da Protocol) düşün.</div>

<h2>Fabrika ve kayıt (registry)</h2>
<p>Fabrika (factory), "hangi sınıfın üretileceğini" çağıran koddan gizler. Ilgaz Bank\'ta rapor türüne göre farklı dışa aktarıcı üretmek gibi. Python\'da en temiz biçim: bir sözlükte sınıfları tut, <code>__init_subclass__</code> ya da dekoratörle otomatik kaydet. Sınıflar zaten çağrılabilir olduğu için ayrı bir "Creator" hiyerarşisine gerek kalmaz.</p>
<pre class="py">import json, csv, io

KAYIT: dict[str, type] = {}

def disa_aktarici(format_adi):
    def kaydet(cls):
        KAYIT[format_adi] = cls
        return cls
    return kaydet

@disa_aktarici('json')
class JsonAktar:
    def yaz(self, satirlar):
        return json.dumps(satirlar, ensure_ascii=False)

@disa_aktarici('csv')
class CsvAktar:
    def yaz(self, satirlar):
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=list(satirlar[0]))
        w.writeheader(); w.writerows(satirlar)
        return buf.getvalue().strip()

def aktarici_uret(format_adi: str):
    try:
        return KAYIT[format_adi]()
    except KeyError:
        raise ValueError(f'desteklenmeyen format: {format_adi!r}; seçenekler: {sorted(KAYIT)}')

veri = [{'hesap': 'TR01', 'bakiye': 1500.0}, {'hesap': 'TR02', 'bakiye': -20.5}]
for f in ('json', 'csv'):
    print(aktarici_uret(f).yaz(veri))
try:
    aktarici_uret('xml')
except ValueError as e:
    print(e)
</pre>

<h2>Gözlemci: olaylara abone olmak</h2>
<p>Gözlemci (observer), bir olay olduğunda ilgilenen herkese haber verir; yayıncı aboneleri tanımaz. Sipariş onaylanınca stok düşsün, e-posta gitsin, muhasebe kaydı açılsın. Python\'da abone bir fonksiyon, abone listesi de bir listedir.</p>
<pre class="py">from collections import defaultdict

class OlayYayini:
    def __init__(self):
        self._aboneler = defaultdict(list)

    def abone_ol(self, olay, fn):
        self._aboneler[olay].append(fn)
        return fn                      # dekoratör olarak da kullanılabilir

    def yayinla(self, olay, **veri):
        for fn in self._aboneler[olay]:
            fn(**veri)

bus = OlayYayini()
stok = {'kahve': 10}

@bus.abone_ol('siparis_onay')
def stok_dus(urun, adet, **_):
    stok[urun] -= adet
    print(f'stok güncellendi: {urun}={stok[urun]}')

@bus.abone_ol('siparis_onay')
def eposta(musteri, **_):
    print(f'e-posta: {musteri} siparişiniz onaylandı')

bus.yayinla('siparis_onay', urun='kahve', adet=3, musteri='ayse@x.com')
bus.yayinla('iade', urun='kahve')     # abone yok, sessizce geçer
</pre>
<div class="warn"><b>Abone hataları</b>Bir abonenin fırlattığı istisna diğer abonelere ulaşmayı engeller. Üretim kodunda her aboneyi <code>try/except</code> ile sarıp loglamak, ya da hataları toplayıp sonunda raporlamak gerekir. Ayrıca abonelerin çağrı sırasına güvenme; sıraya bağımlılık varsa gözlemci yanlış kalıptır.</div>

<h2>Tekil (singleton) ve neden modül daha iyi</h2>
<p>Tekil, bir sınıftan yalnızca tek örnek olmasını garanti eder: yapılandırma, bağlantı havuzu, logger. Klasik gerçekleştirme <code>__new__</code> üzerinden yapılır. Ancak Python\'da her modül yalnızca bir kez yüklenir ve zaten tekildir: <code>config.py</code> içinde <code>AYARLAR = {...}</code> yazmak, aynı garantiyi sıfır kodla verir ve test ederken yerine sahte nesne koymak (monkeypatch) çok daha kolaydır.</p>
<pre class="py">class Ayarlar:
    _ornek = None
    def __new__(cls):
        if cls._ornek is None:
            cls._ornek = super().__new__(cls)
            cls._ornek.degerler = {'para_birimi': 'TRY'}
        return cls._ornek

a, b = Ayarlar(), Ayarlar()
print(a is b, a.degerler)

# Pythonic eşdeğer: modül düzeyinde tek nesne
import types
config = types.SimpleNamespace(para_birimi='TRY', kdv=0.20)
print(config.para_birimi, config.kdv)
</pre>
<div class="tbl-wrap"><table><tr><th>Kalıp</th><th>Çözdüğü sorun</th><th>Klasik biçim</th><th>Python\'da sade biçim</th></tr><tr><td>Strateji</td><td>Değiştirilebilir algoritma</td><td>Soyut sınıf + alt sınıflar</td><td>Fonksiyon sözlüğü, key=</td></tr><tr><td>Fabrika</td><td>Üretimi gizlemek</td><td>Creator hiyerarşisi</td><td>Kayıt sözlüğü + sınıf çağrısı</td></tr><tr><td>Gözlemci</td><td>Gevşek bağlı bildirim</td><td>Subject/Observer arayüzü</td><td>Fonksiyon listesi</td></tr><tr><td>Tekil</td><td>Tek örnek</td><td>__new__ ile kontrol</td><td>Modül düzeyi nesne</td></tr><tr><td>Adaptör</td><td>Uyumsuz arayüz</td><td>Sarmalayıcı sınıf</td><td>Sarmalayıcı sınıf ya da fonksiyon</td></tr><tr><td>Komut</td><td>İşlemi nesne yapmak, geri alma</td><td>execute/undo arayüzü</td><td>dataclass + Protocol</td></tr></table></div>

<h2>Adaptör: uyumsuz arayüzleri bağlamak</h2>
<p>Eski bir ödeme kütüphanesi <code>charge(amount_cents)</code> bekliyor, yeni kodun ise <code>tahsil_et(tutar_tl)</code> çağırıyor. Hiçbirini değiştirmeden ikisini bir adaptörle bağlarsın. Adaptör ince olmalı: dönüştür, yönlendir, bitir.</p>
<pre class="py">class EskiOdemeKutuphanesi:          # değiştiremediğin dış kod
    def charge(self, amount_cents: int) -&gt; dict:
        return {'ok': amount_cents &gt; 0, 'cents': amount_cents}

class OdemeAdaptoru:
    def __init__(self, eski):
        self._eski = eski
    def tahsil_et(self, tutar_tl: float) -&gt; bool:
        return self._eski.charge(round(tutar_tl * 100))['ok']

def siparisi_tamamla(saglayici, tutar):
    return 'tamam' if saglayici.tahsil_et(tutar) else 'reddedildi'

print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 149.90))
print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 0))
</pre>

<h2>Komut: işlemi nesne yapmak</h2>
<p>Komut (command) kalıbında her işlem; çalıştırılabilen ve geri alınabilen bir nesnedir. Geri al/yinele, işlem kuyruğu, denetim kaydı (audit log) için kullanılır. Ilgaz Bank\'ta hesap hareketlerini komut olarak modellemek, hatalı bir toplu işlemi tersine çevirmeyi mümkün kılar.</p>
<pre class="py">from dataclasses import dataclass, field

@dataclass
class YatirKomutu:
    hesaplar: dict
    hesap: str
    tutar: float
    def uygula(self):
        self.hesaplar[self.hesap] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hesap] -= self.tutar

@dataclass
class TransferKomutu:
    hesaplar: dict
    kaynak: str
    hedef: str
    tutar: float
    def uygula(self):
        if self.hesaplar[self.kaynak] &lt; self.tutar:
            raise ValueError('yetersiz bakiye')
        self.hesaplar[self.kaynak] -= self.tutar
        self.hesaplar[self.hedef] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hedef] -= self.tutar
        self.hesaplar[self.kaynak] += self.tutar

@dataclass
class Islemci:
    gecmis: list = field(default_factory=list)
    def calistir(self, komut):
        komut.uygula()
        self.gecmis.append(komut)
    def geri_al(self):
        if self.gecmis:
            self.gecmis.pop().geri_al()

h = {'TR01': 100.0, 'TR02': 0.0}
p = Islemci()
p.calistir(YatirKomutu(h, 'TR01', 50))
p.calistir(TransferKomutu(h, 'TR01', 'TR02', 120))
print(h)
p.geri_al(); print('transfer geri alındı:', h)
p.geri_al(); print('yatırma geri alındı:', h)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kalıp seçiminde kurumsal refleksler</h3>
<p>Kod incelemelerinde en sık görülen kalıp hatası "fazla mimari"dir: üç satırlık bir koşul için strateji hiyerarşisi, iki format için fabrika sınıfı. Kuralı şöyle koy: kalıbı, aynı sorunu <b>ikinci kez</b> çözerken tanıt, birincide değil. Birinci sınıf fonksiyonlar, <code>functools.partial</code>, dataclass ve Protocol, klasik kalıpların büyük kısmını iki üç satıra indirir.</p>
<p>Buna karşılık bazı kalıplar Python\'da bile sınıf ister: komut (durum + geri alma), gözlemci (abone yönetimi, hata izolasyonu), adaptör (dış sistem sınırı). Bunların ortak noktası, kodun bir sınırda durmasıdır: dış kütüphane, ağ, veritabanı, kullanıcı etkileşimi. Sınırlarda açık arayüz (Protocol) tanımla; içeride sade fonksiyonlarla kal.</p>
<p>Testte kalıpların karşılığı: strateji sözlüğünü testte sahte fonksiyonla değiştir; gözlemcide aboneleri listeye toplayıp yayın sonrası kontrol et; komutlarda <code>uygula</code> + <code>geri_al</code> sonrası durumun başlangıca döndüğünü doğrula (round-trip testi). Tekil yerine modül düzeyi nesne kullanmanın en büyük getirisi de burada: <code>monkeypatch.setattr(config, 'kdv', 0)</code> ile tek satırda izole test.</p>
</section>`,
    ex: [
      { t: 'code', id: 'tasarim-kaliplari-1',
        q: '<p>Anadolu Market indirim stratejileri. Üç fonksiyon yaz: <code>yok(tutar)</code> tutarı döndürür; <code>yuzde10(tutar)</code> %10 indirir; <code>esik(tutar)</code> 500 ve üzerinde 50 TL düşer, altında aynen döndürür. Bunları <code>INDIRIMLER</code> sözlüğünde <code>\'yok\'</code>, <code>\'yuzde10\'</code>, <code>\'esik\'</code> anahtarlarıyla tut. <code>odenecek(tutar, strateji=\'yok\')</code> fonksiyonu sözlükten stratejiyi bulup sonucu 2 ondalığa yuvarlasın; bilinmeyen strateji için <code>ValueError</code> fırlatsın.</p>',
        start: 'def yok(tutar):\n    pass\n\n# yuzde10, esik, INDIRIMLER, odenecek\n',
        sol: 'def yok(tutar):\n    return tutar\n\ndef yuzde10(tutar):\n    return tutar * 0.9\n\ndef esik(tutar):\n    return tutar - 50 if tutar >= 500 else tutar\n\nINDIRIMLER = {\'yok\': yok, \'yuzde10\': yuzde10, \'esik\': esik}\n\ndef odenecek(tutar, strateji=\'yok\'):\n    if strateji not in INDIRIMLER:\n        raise ValueError(f\'bilinmeyen strateji: {strateji}\')\n    return round(INDIRIMLER[strateji](tutar), 2)\n',
        tests: 'assert odenecek(200) == 200, "Varsayılan strateji tutarı değiştirmemeli"\nassert abs(odenecek(199.9, \'yuzde10\') - 179.91) < 1e-6, "yuzde10 %10 indirmeli"\nassert odenecek(500, \'esik\') == 450 and odenecek(499, \'esik\') == 499, "esik 500 ve üzerinde 50 düşmeli"\nassert set(INDIRIMLER) == {\'yok\', \'yuzde10\', \'esik\'}, "INDIRIMLER anahtarları"\ntry:\n    odenecek(10, \'bilinmez\')\n    assert False, "Bilinmeyen strateji ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['Sözlük değerleri fonksiyonun kendisi olmalı: yok, yok() değil.', 'odenecek içinde INDIRIMLER[strateji](tutar) çağrısı yap.'],
        why: 'Fonksiyonlar birinci sınıf olduğu için strateji kalıbı sözlük + çağrı ile biter; yeni strateji eklemek tek satırdır.' },
      { t: 'mc', q: 'Python\'da klasik tekil (singleton) sınıfı yerine modül düzeyi nesne önerilmesinin temel nedeni nedir?',
        o: ['Modüller daha hızlı yüklenir', 'Modül zaten tek kez yüklenir; testte değiştirmesi kolaydır', 'Sınıflar Python\'da tekil olamaz', 'Modül nesneleri değişmezdir'],
        a: 1, why: 'import sistemi bir modülü tek kez yükler ve sys.modules\'da tutar; bu zaten tekil garantisidir. Ayrıca modül öznitelikleri monkeypatch ile kolayca değiştirilir. Diğer seçenekler yanlış iddialardır.' },
      { t: 'code', id: 'tasarim-kaliplari-3',
        q: '<p>Kayıt tabanlı fabrika. <code>KAYIT</code> adlı boş sözlük ve <code>rapor(ad)</code> adlı sınıf dekoratörü yaz: dekoratör sınıfı <code>KAYIT[ad]</code> olarak kaydedip sınıfı aynen döndürsün. Sonra <code>@rapor(\'ozet\')</code> ile <code>OzetRapor</code> (metot <code>uret(self, satirlar)</code> -> <code>f\'{len(satirlar)} satır\'</code>) ve <code>@rapor(\'toplam\')</code> ile <code>ToplamRapor</code> (<code>uret</code> -> satırlardaki <code>\'tutar\'</code> toplamı, float) tanımla. <code>rapor_uret(ad)</code> ilgili sınıfın yeni örneğini döndürsün; yoksa <code>KeyError</code>.</p>',
        start: 'KAYIT = {}\n\ndef rapor(ad):\n    pass\n\n# OzetRapor, ToplamRapor, rapor_uret\n',
        sol: 'KAYIT = {}\n\ndef rapor(ad):\n    def kaydet(cls):\n        KAYIT[ad] = cls\n        return cls\n    return kaydet\n\n@rapor(\'ozet\')\nclass OzetRapor:\n    def uret(self, satirlar):\n        return f\'{len(satirlar)} satır\'\n\n@rapor(\'toplam\')\nclass ToplamRapor:\n    def uret(self, satirlar):\n        return float(sum(s[\'tutar\'] for s in satirlar))\n\ndef rapor_uret(ad):\n    return KAYIT[ad]()\n',
        tests: 'veri = [{\'tutar\': 10.5}, {\'tutar\': 4.5}]\nassert set(KAYIT) == {\'ozet\', \'toplam\'}, "Dekoratör iki sınıfı kaydetmeli"\nassert KAYIT[\'ozet\'] is OzetRapor, "Dekoratör sınıfı aynen döndürmeli"\nassert rapor_uret(\'ozet\').uret(veri) == \'2 satır\', "OzetRapor satır sayısı"\nassert abs(rapor_uret(\'toplam\').uret(veri) - 15.0) < 1e-6, "ToplamRapor toplam"\nassert rapor_uret(\'ozet\') is not rapor_uret(\'ozet\'), "Her çağrı yeni örnek üretmeli"\ntry:\n    rapor_uret(\'yok\')\n    assert False, "Kayıtsız ad KeyError vermeli"\nexcept KeyError:\n    pass\n',
        hints: ['Parametreli dekoratör iki katmanlı: rapor(ad) -> kaydet(cls) -> cls.', 'rapor_uret içinde KAYIT[ad]() ile örnek üret.'],
        why: 'Sınıflar çağrılabilir olduğundan fabrika bir sözlük aramasına iner; dekoratör kaydı tanım yerinde tutar, merkezi if/elif zincirine gerek kalmaz.' },
      { t: 'code', id: 'tasarim-kaliplari-4',
        q: '<p><code>OlayYayini</code> sınıfı yaz: <code>abone_ol(olay, fn)</code> fonksiyonu kaydeder ve fn\'i döndürür; <code>yayinla(olay, **veri)</code> o olayın tüm abonelerini sırayla <code>fn(**veri)</code> ile çağırır. Bir abone istisna fırlatırsa diğerleri yine çağrılmalı; yayinla, fırlatılan istisnaların listesini döndürsün (hata yoksa boş liste).</p>',
        start: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n    # abone_ol, yayinla\n',
        sol: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n\n    def abone_ol(self, olay, fn):\n        self._aboneler[olay].append(fn)\n        return fn\n\n    def yayinla(self, olay, **veri):\n        hatalar = []\n        for fn in self._aboneler[olay]:\n            try:\n                fn(**veri)\n            except Exception as e:\n                hatalar.append(e)\n        return hatalar\n',
        tests: 'bus = OlayYayini()\nlog = []\nbus.abone_ol(\'siparis\', lambda **v: log.append((\'a\', v[\'no\'])))\ndef bozuk(**v):\n    raise RuntimeError(\'patladı\')\nbus.abone_ol(\'siparis\', bozuk)\nf = bus.abone_ol(\'siparis\', lambda **v: log.append((\'c\', v[\'no\'])))\nassert callable(f), "abone_ol fonksiyonu geri döndürmeli"\nhatalar = bus.yayinla(\'siparis\', no=7)\nassert log == [(\'a\', 7), (\'c\', 7)], "Hatalı abone diğerlerini engellememeli"\nassert len(hatalar) == 1 and isinstance(hatalar[0], RuntimeError), "Hatalar listede dönmeli"\nassert bus.yayinla(\'yok\') == [], "Abonesi olmayan olay boş liste döndürmeli"\n',
        hints: ['Her aboneyi try/except Exception ile sar; istisnayı listeye ekle.', 'defaultdict(list) sayesinde olmayan olay için boş liste döner.'],
        why: 'Gözlemci kalıbında hata izolasyonu kritiktir: bir abonenin çökmesi diğer iş kurallarını atlatmamalı. Hataları döndürmek çağırana karar hakkı verir.' },
      { t: 'mc', q: 'Komut (command) kalıbının en belirgin faydası hangisi?',
        o: ['Daha az bellek kullanımı', 'Nesne üretimini gizlemek', 'İşlemleri geri alınabilir ve kuyruklanabilir nesneler yapmak', 'Arayüz uyumsuzluğunu gidermek'],
        a: 2, why: 'Komut, her işlemi uygula/geri_al metotlu bir nesne yapar; böylece geçmiş tutma, geri alma, kuyruk ve denetim kaydı kolaylaşır. Üretimi gizlemek fabrika, uyumsuzluk adaptör konusudur.' },
      { t: 'code', id: 'tasarim-kaliplari-6',
        q: '<p>Ilgaz Bank için komut kalıbı. <code>CekKomutu(hesaplar, hesap, tutar)</code> dataclass\'ı: <code>uygula()</code> bakiye yetersizse <code>ValueError</code> fırlatıp hiçbir şey değiştirmesin, yeterliyse düşsün; <code>geri_al()</code> tutarı geri eklesin. <code>Islemci</code> sınıfı: <code>calistir(komut)</code> uygula\'yı çağırıp başarılıysa geçmişe eklesin (hata fırlarsa geçmişe eklemeden hatayı yeniden fırlatsın), <code>geri_al()</code> son komutu geri alsın ve döndürsün (geçmiş boşsa None), <code>gecmis</code> listesi dışarıdan okunabilsin.</p>',
        start: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n    # uygula, geri_al\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n    # calistir, geri_al\n',
        sol: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n\n    def uygula(self):\n        if self.hesaplar[self.hesap] < self.tutar:\n            raise ValueError(\'yetersiz bakiye\')\n        self.hesaplar[self.hesap] -= self.tutar\n\n    def geri_al(self):\n        self.hesaplar[self.hesap] += self.tutar\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n\n    def calistir(self, komut):\n        komut.uygula()\n        self.gecmis.append(komut)\n\n    def geri_al(self):\n        if not self.gecmis:\n            return None\n        k = self.gecmis.pop()\n        k.geri_al()\n        return k\n',
        tests: 'h = {\'TR01\': 100.0}\np = Islemci()\np.calistir(CekKomutu(h, \'TR01\', 30))\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Çekim bakiyeyi düşürmeli ve geçmişe girmeli"\ntry:\n    p.calistir(CekKomutu(h, \'TR01\', 500))\n    assert False, "Yetersiz bakiye ValueError vermeli"\nexcept ValueError:\n    pass\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Başarısız komut bakiye ve geçmişi değiştirmemeli"\nk = p.geri_al()\nassert isinstance(k, CekKomutu) and h[\'TR01\'] == 100, "geri_al son komutu tersine çevirmeli"\nassert p.geri_al() is None, "Boş geçmişte None dönmeli"\n',
        hints: ['uygula içinde önce kontrol, sonra değişiklik: hata durumunda durum bozulmasın.', 'calistir\'da uygula başarılı olduktan sonra append yap.'],
        why: 'Komut nesnesi hem işlemi hem tersini taşır; Islemci yalnızca sıralamayı bilir. Başarısız komutun geçmişe girmemesi geri alma zincirini tutarlı tutar.' },
      { t: 'code', id: 'tasarim-kaliplari-7',
        q: '<p>Adaptör. Verilen <code>EskiSmsServisi.send(self, to: str, body: str) -> int</code> (gönderilen karakter sayısını döndürür) sınıfını değiştirmeden, <code>SmsAdaptoru(eski)</code> sınıfı yaz: <code>gonder(self, telefon: str, mesaj: str) -> bool</code>. Telefon numarasındaki boşluk ve tireleri temizleyip <code>+90</code> ile başlamıyorsa başına eklesin, eski servisi çağırsın ve dönen sayı 0\'dan büyükse True döndürsün. Ayrıca adaptör son gönderilen numarayı <code>son_numara</code> özniteliğinde tutsun.</p>',
        start: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n    # gonder\n',
        sol: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n\n    def gonder(self, telefon: str, mesaj: str) -> bool:\n        tel = telefon.replace(\' \', \'\').replace(\'-\', \'\')\n        if not tel.startswith(\'+90\'):\n            tel = \'+90\' + tel.lstrip(\'0\')\n        self.son_numara = tel\n        return self._eski.send(tel, mesaj) > 0\n',
        tests: 'a = SmsAdaptoru(EskiSmsServisi())\nassert a.gonder(\'0532 111-22-33\', \'Kodunuz 4821\') is True, "Geçerli gönderim True dönmeli"\nassert a.son_numara == \'+905321112233\', "Numara temizlenip +90 ile başlamalı"\nassert a.gonder(\'+90 532 000 00 00\', \'x\') is True and a.son_numara == \'+905320000000\', "+90 ile başlayan numara tekrar eklenmemeli"\nassert a.gonder(\'5321112233\', \'\') is False, "Boş mesaj 0 karakter -> False"\n',
        hints: ['Boşluk ve tireyi replace ile kaldır.', 'Başta 0 varsa kırp: tel.lstrip(\'0\'), sonra +90 ekle.'],
        why: 'Adaptör yalnızca biçim dönüştürür ve yönlendirir; eski servis ve yeni kod birbirinden habersiz kalır, ikisi de değişmez.' }
    ],
    faq: [
      { q: 'Kalıpları ezberlemeli miyim?', a: 'İsimlerini ve çözdükleri sorunu bil; ekip içinde ortak dil sağlar. Gerçekleştirme biçimi dile göre değişir; Python\'da çoğu kalıp fonksiyon ve sözlükle sadeleşir.' },
      { q: 'Strateji için sınıf mı fonksiyon mu?', a: 'Tek metot ve durum yoksa fonksiyon. Stratejinin yapılandırması, birden fazla metodu ya da tutması gereken durumu varsa sınıf (ve parametre tipi olarak Protocol).' },
      { q: 'Gözlemci yerine ne zaman kuyruk kullanmalıyım?', a: 'Aboneler ağır iş yapıyorsa, süreç dışına çıkıyorsa ya da yeniden deneme gerekiyorsa mesaj kuyruğu (Celery, RabbitMQ, Kafka) uygundur. Süreç içi, hafif ve senkron bildirimlerde liste tabanlı gözlemci yeter.' }
    ],
    mistakes: [
      { bad: 'if tur == \'json\': return JsonAktar()\nelif tur == \'csv\': return CsvAktar()\nelif ...', good: 'KAYIT = {\'json\': JsonAktar, \'csv\': CsvAktar}\nreturn KAYIT[tur]()', why: 'Uzun if/elif zinciri her yeni tür için değiştirilmek zorunda; sözlük kaydı açık-kapalı ilkesine uyar.' },
      { bad: 'class Strateji(ABC): ...\nclass Sabit(Strateji): ...\nclass Agirlik(Strateji): ...\n# her biri tek metot', good: 'STRATEJILER = {\'sabit\': sabit, \'agirlik\': agirlik_bazli}', why: 'Durumsuz tek metotlu sınıflar fonksiyonla aynı işi yapar; hiyerarşi gereksiz yük ekler.' },
      { bad: 'for fn in aboneler:\n    fn(**veri)  # ilk hata zinciri keser', good: 'for fn in aboneler:\n    try:\n        fn(**veri)\n    except Exception as e:\n        hatalar.append(e)', why: 'Gözlemcide bir abonenin hatası diğer iş kurallarının atlanmasına yol açmamalı.' }
    ]
  }
);
})(window);
