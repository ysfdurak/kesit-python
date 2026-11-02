html = f'''
<h2>Derste olmayan altı kalıp, Python'ca</h2>
<p>Strateji, fabrika, gözlemci, adaptör ve komutu gördün. Kurumsal Python kodunda en az onlar kadar sık karşına çıkan altı kalıp daha var. Hepsinin ortak noktası, "değişecek olanı değişmeyenden ayırmak"tır. Python'da çoğu, sınıf hiyerarşisi yerine birkaç fonksiyonla ya da küçük bir sözlükle kurulur.</p>
<div class="tbl-wrap"><table>
<tr><th>Kalıp</th><th>Çözdüğü sorun</th><th>Python'daki kısa yolu</th><th>Nerede görürsün?</th></tr>
<tr><td>Durum (State)</td><td>Nesnenin davranışı durumuna göre değişir, if/elif patlar</td><td>Geçiş tablosu sözlüğü ya da Enum</td><td>Sipariş, kredi başvurusu akışı</td></tr>
<tr><td>Sorumluluk zinciri (Chain of responsibility)</td><td>İstek birkaç adımdan sırayla geçmeli</td><td>Fonksiyon listesi, ara katman (middleware)</td><td>Web çatıları, doğrulama hattı</td></tr>
<tr><td>Şablon metot (Template method)</td><td>Algoritmanın iskeleti sabit, adımları değişir</td><td>Taban sınıfta somut metot + soyut adımlar</td><td>Rapor üretimi, ETL işleri</td></tr>
<tr><td>Kurucu (Builder)</td><td>Çok parçalı nesneyi adım adım kurmak</td><td><code>self</code> döndüren akıcı (fluent) metotlar</td><td>SQL sorgu kurucular, HTTP istemcileri</td></tr>
<tr><td>Depo (Repository) + bağımlılık enjeksiyonu</td><td>İş kuralı veritabanına yapışık, test edilemez</td><td>Depoyu kurucuya parametre olarak ver</td><td>Servis katmanı, birim testler</td></tr>
<tr><td>Süsleyici (Decorator) nesne</td><td>Nesneye çalışma anında yetenek eklemek</td><td>Aynı arayüzü uygulayan sarmalayıcı sınıf</td><td>Loglama, önbellek, yeniden deneme</td></tr>
</table></div>

<h2>Durum makinesi: geçişleri veri olarak yaz</h2>
<p>Anadolu Market siparişi <i>yeni → ödendi → kargoda → teslim</i> akışında ilerler; iptal yalnızca kargoya verilmeden önce mümkündür. Bu kuralları if/elif ile her metoda dağıtırsan yeni bir durum eklemek tüm metotları değiştirmeyi gerektirir. Geçiş tablosu kuralları tek yere toplar, tablo aynı zamanda belge görevi görür.</p>
{pre("""
GECISLER = {
    "yeni":   {"ode": "odendi", "iptal": "iptal"},
    "odendi": {"kargola": "kargoda", "iptal": "iptal"},
    "kargoda": {"teslim": "teslim"},
}

class Siparis:
    def __init__(self, no):
        self.no, self.durum, self.gecmis = no, "yeni", ["yeni"]

    def olay(self, ad):
        hedef = GECISLER.get(self.durum, {}).get(ad)
        if hedef is None:
            raise ValueError(f"{self.durum!r} durumunda {ad!r} yapılamaz")
        self.durum = hedef
        self.gecmis.append(hedef)

s = Siparis(1042)
for ad in ["ode", "kargola", "iptal"]:
    try:
        s.olay(ad)
    except ValueError as h:
        print("Reddedildi:", h)
print(s.durum, s.gecmis)
""")}

<h2>Sorumluluk zinciri: ara katmanlar</h2>
<p>Bir API isteği önce kimlik doğrulamadan, sonra hız sınırından, sonra loglamadan geçip asıl işleyiciye ulaşır. Her katman ya isteği reddeder ya da <b>bir sonrakine</b> devreder. Flask, Django ve FastAPI'deki middleware'ler bu kalıptır. Python'da her katman <code>(istek, sonraki)</code> alan bir fonksiyon olabilir.</p>
{pre("""
def kimlik(istek, sonraki):
    if not istek.get("token"):
        return {"durum": 401}
    return sonraki(istek)

def log(istek, sonraki):
    yanit = sonraki(istek)
    print(f"{istek['yol']} -> {yanit['durum']}")
    return yanit

def isleyici(istek):
    return {"durum": 200, "veri": "bakiye: 1500"}

def zincir(katmanlar, son):
    for katman in reversed(katmanlar):
        son = (lambda k, s: lambda istek: k(istek, s))(katman, son)
    return son

uygulama = zincir([log, kimlik], isleyici)
uygulama({"yol": "/hesap", "token": "abc"})
uygulama({"yol": "/hesap"})
""")}

<h2>Şablon metot ve kurucu</h2>
<p><b>Şablon metot</b>ta taban sınıf algoritmanın sırasını sabitler (<code>uret()</code>: veriyi getir, süz, biçimle), alt sınıflar yalnızca değişen adımları doldurur. Strateji kalıbıyla farkı: strateji davranışı dışarıdan <b>verilen</b> bir nesneyle değiştirir (bileşim), şablon metot ise <b>kalıtımla</b> değiştirir. <b>Kurucu</b> (builder) ise çok seçenekli bir nesneyi zincirleme çağrılarla kurar; her metot <code>self</code> döndürür, en sonda <code>sql()</code>, <code>build()</code> gibi bir metot sonucu üretir. SQLAlchemy'nin <code>select(...).where(...).order_by(...)</code> yazımı buna örnektir.</p>
{pre("""
from abc import ABC, abstractmethod

class Rapor(ABC):
    def uret(self):                         # şablon: sıra sabit
        satirlar = [s for s in self.veri() if self.dahil_mi(s)]
        return self.bicimle(satirlar)

    @abstractmethod
    def veri(self): ...

    def dahil_mi(self, satir):              # isteğe bağlı kanca (hook)
        return True

    @abstractmethod
    def bicimle(self, satirlar): ...

class BuyukSiparisCSV(Rapor):
    def veri(self):
        return [("İzmir", 1200), ("Bursa", 300), ("Ankara", 5400)]
    def dahil_mi(self, s):
        return s[1] >= 1000
    def bicimle(self, satirlar):
        return "\\n".join(f"{a};{t}" for a, t in satirlar)

print(BuyukSiparisCSV().uret())
""")}

<h2>Depo kalıbı ve bağımlılık enjeksiyonu</h2>
<p>İş kuralı içinde <code>sqlite3.connect("prod.db")</code> yazarsan o kuralı veritabanı olmadan test edemezsin. Çözüm: veri erişimini bir <b>depo</b> (repository) arayüzünün arkasına koy ve servisi kurarken depoyu <b>parametre olarak ver</b> (dependency injection). Üretimde SQL deposu, testte bellek içi sözlük deposu verilir; servis kodu değişmez. Python'da bunun için çatıya gerek yoktur: kurucu parametresi yeter. Arayüzü <code>Protocol</code> ile tanımlamak (ileri OOP dersi) tip denetleyicisine de sözleşmeyi bildirir.</p>
{pre("""
from typing import Protocol

class HesapDeposu(Protocol):
    def bakiye(self, no: str) -> int: ...
    def guncelle(self, no: str, yeni: int) -> None: ...

class BellekDepo:
    def __init__(self, veri): self.veri = dict(veri)
    def bakiye(self, no): return self.veri[no]
    def guncelle(self, no, yeni): self.veri[no] = yeni

class HavaleServisi:
    def __init__(self, depo: HesapDeposu):
        self.depo = depo                     # enjekte edilen bağımlılık
    def havale(self, kimden, kime, tutar):
        if self.depo.bakiye(kimden) < tutar:
            raise ValueError("Yetersiz bakiye")
        self.depo.guncelle(kimden, self.depo.bakiye(kimden) - tutar)
        self.depo.guncelle(kime, self.depo.bakiye(kime) + tutar)

depo = BellekDepo({"TR1": 1000, "TR2": 0})
HavaleServisi(depo).havale("TR1", "TR2", 250)
print(depo.veri)
""")}
<div class="warn"><b>Kalıp için kalıp yazma</b>Üç satırlık bir if bloğunu durum makinesine, tek kullanımlık bir nesneyi kurucuya çevirmek kodu zorlaştırır. Kalıbı, aynı değişikliği ikinci ya da üçüncü kez yaparken hissettiğin acıya cevap olarak getir.</div>
<div class="note"><b>Gerçek işte</b>Mülakatlarda "hangi tasarım kalıplarını biliyorsun?" sorusunun iyi cevabı bir liste değil, bir hikâyedir: "Sipariş durumları her sprintte değişiyordu, geçiş tablosuna taşıdık; artık yeni durum bir satırlık değişiklik ve tablo ürün ekibiyle paylaştığımız belge oldu." Kalıbın adını, çözdüğü sorunu ve bedelini birlikte anlat.</div>
'''

EX = []
EX.append(dict(t='mc', stage='Isınma',
    q='Şablon metot (template method) ile strateji kalıbı arasındaki temel fark hangisidir?',
    o=['Şablon metot kalıtımla, strateji bileşimle (verilen nesneyle) değiştirir', 'Strateji yalnızca sınıflarla, şablon metot ise yalnızca fonksiyonlarla yazılabilir', 'İkisi aynı kalıbın farklı kitaplarda geçen farklı adlarıdır', 'Şablon metot çalışma anında, strateji ise derleme anında seçilir'],
    a=0, why='Şablon metotta algoritma iskeleti taban sınıftadır ve alt sınıflar adımları ezer (kalıtım). Stratejide nesne, davranışı bir parametre/öznitelik olarak alır (bileşim) ve çalışma anında değiştirebilir.'))
EX.append(dict(t='mc', stage='Isınma',
    q='<code>HavaleServisi</code> sınıfına depoyu kurucu parametresi olarak vermenin (bağımlılık enjeksiyonu) en önemli kazancı nedir?',
    o=['Kod daha hızlı çalışır, çünkü bağlantı yeniden kullanılır', 'Testte gerçek veritabanı yerine bellek içi depo verilebilir', 'Python sınıfın tipini daha iyi denetler ve hataları yakalar', 'Depo nesnesi otomatik olarak tekil (singleton) olur'],
    a=1, why='Servis hangi depoyu kullanacağını bilmez, ona verileni kullanır. Böylece birim testte sahte/bellek içi depo, üretimde SQL deposu verilir; iş kuralı hiç değişmez.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='def tutar_kontrol(s, sonraki):\n    if s["tutar"] <= 0:\n        return "red: tutar"\n    return sonraki(s)\n\ndef stok_kontrol(s, sonraki):\n    if s["adet"] > 5:\n        return "red: stok"\n    return sonraki(s)\n\ndef onayla(s):\n    return "onay"\n\ndef calistir(s):\n    return tutar_kontrol(s, lambda x: stok_kontrol(x, onayla))\n\nprint(calistir({"tutar": 100, "adet": 9}), calistir({"tutar": 0, "adet": 9}), calistir({"tutar": 5, "adet": 1}))\n',
    o=['red: stok red: tutar onay', 'red: stok red: stok onay', 'red: tutar red: tutar onay', 'onay red: tutar onay'], a=0,
    why='Zincirde ilk reddeden katman cevabı belirler. İkinci siparişte tutar kontrolü önce geldiği için stok kontrolüne hiç ulaşılmaz.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='GECIS = {"taslak": {"gonder": "incelemede"}, "incelemede": {"onayla": "onayli", "reddet": "taslak"}}\n\ndurum = "taslak"\nfor olay in ["gonder", "reddet", "onayla", "gonder", "onayla"]:\n    durum = GECIS.get(durum, {}).get(olay, durum)\nprint(durum)\n',
    o=['onayli', 'taslak', 'incelemede', 'KeyError'], a=0,
    why='taslak →gonder→ incelemede →reddet→ taslak; "onayla" taslakta tanımsız, durum aynı kalır; →gonder→ incelemede →onayla→ onayli.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='class Filtre:\n    def __init__(self):\n        self.parcalar = []\n    def sehir(self, s):\n        self.parcalar.append(f"sehir={s}")\n        return self\n    def min_tutar(self, t):\n        self.parcalar.append(f"tutar>={t}")\n    def metin(self):\n        return " & ".join(self.parcalar)\n\nf = Filtre().sehir("İzmir").min_tutar(500)\nprint(type(f).__name__)\n',
    o=['NoneType', 'Filtre', 'str', 'AttributeError'], a=0,
    why='Akıcı (fluent) kurucuda her metot self döndürmelidir. min_tutar return yazmadığı için None döner ve zincirin sonucu None olur. Bir sonraki .metin() çağrısı AttributeError verirdi.'))
EX.append(dict(t='order', stage='Kodu oku',
    q='<p>Nesne süsleyici (decorator) kalıbıyla bir bildirim servisine maskeleme ve loglama ekleyen programın satırlarını sırala.</p>',
    lines=['class Sms:', '    def gonder(self, m): return f"SMS[{m}]"', 'class Maskeli:', '    def __init__(self, ic): self.ic = ic', '    def gonder(self, m): return self.ic.gonder(m.replace("1234", "****"))', 'servis = Maskeli(Sms())', 'print(servis.gonder("Şifre 1234"))'],
    expect='SMS[Şifre ****]\n', hint='Önce sarılacak sınıf, sonra sarmalayıcı, sonra ikisini birleştiren nesne.',
    why='Maskeli aynı gonder arayüzünü sunar ve işi içteki nesneye devreder; istemci farkı görmez. Sarmalayıcılar üst üste dizilebilir.'))
EX.append(dict(t='code', stage='Rehberli', id='tasarim-kaliplari-x1', diff=2,
    q='<p>Anadolu Bank kredi başvurusu için durum makinesi kur. <code>Basvuru</code> sınıfı <code>durum</code> ("alindi" ile başlar) ve <code>gecmis</code> (durum listesi, "alindi" ile başlar) tutsun. <code>olay(ad)</code> metodu modül düzeyindeki <code>GECISLER</code> sözlüğüne göre geçiş yapsın; geçersiz olayda <code>ValueError</code> fırlatsın ve durumu değiştirmesin. <code>bitti</code> özelliği (property) durum <code>"onay"</code> ya da <code>"red"</code> ise True dönsün. Geçişler: alindi --incele--> inceleme; inceleme --onayla--> onay; inceleme --reddet--> red; inceleme --belge_iste--> belge_bekleniyor; belge_bekleniyor --belge_geldi--> inceleme.</p>',
    guide=['GECISLER sözlüğünü durum → {olay: hedef} biçiminde doldur.', '__init__ içinde durum ve gecmis alanlarını kur.', 'olay(ad): GECISLER.get(self.durum, {}).get(ad) ile hedefi bul; None ise ValueError.', 'Hedefi durum yap ve gecmis\'e ekle.', '@property bitti: self.durum in ("onay", "red").'],
    example='ISIK = {"kirmizi": {"zaman": "yesil"}, "yesil": {"zaman": "sari"}, "sari": {"zaman": "kirmizi"}}\nd = "kirmizi"\nfor _ in range(4):\n    d = ISIK[d]["zaman"]\n    print(d)\n',
    start='GECISLER = {\n    "alindi": {"incele": "inceleme"},\n    # TODO: diğer geçişler\n}\n\nclass Basvuru:\n    def __init__(self):\n        self.durum = "alindi"\n        self.gecmis = ["alindi"]\n\n    def olay(self, ad):\n        # TODO: geçiş tablosuna göre ilerle, geçersizse ValueError\n        pass\n\n    # TODO: bitti özelliği\n',
    sol='GECISLER = {\n    "alindi": {"incele": "inceleme"},\n    "inceleme": {"onayla": "onay", "reddet": "red", "belge_iste": "belge_bekleniyor"},\n    "belge_bekleniyor": {"belge_geldi": "inceleme"},\n}\n\nclass Basvuru:\n    def __init__(self):\n        self.durum = "alindi"\n        self.gecmis = ["alindi"]\n\n    def olay(self, ad):\n        hedef = GECISLER.get(self.durum, {}).get(ad)\n        if hedef is None:\n            raise ValueError(f"{self.durum} durumunda {ad} geçersiz")\n        self.durum = hedef\n        self.gecmis.append(hedef)\n\n    @property\n    def bitti(self):\n        return self.durum in ("onay", "red")\n',
    tests='b = Basvuru()\nfor o in ["incele", "belge_iste", "belge_geldi", "onayla"]:\n    b.olay(o)\nassert b.gecmis == ["alindi", "inceleme", "belge_bekleniyor", "inceleme", "onay"], "Geçmiş tüm durumları sırayla içermeli"\nassert b.bitti is True, "onay son durumdur"\ntry:\n    b.olay("reddet")\n    raise AssertionError("Onaylanmış başvuru reddedilememeli")\nexcept ValueError:\n    pass\nassert b.durum == "onay", "Geçersiz olay durumu değiştirmemeli"\nb2 = Basvuru()\ntry:\n    b2.olay("onayla")\n    raise AssertionError("İncelenmeden onay verilemez")\nexcept ValueError:\n    pass\nassert not b2.bitti\n',
    hints=['Tablo iç içe sözlük: GECISLER[durum][olay] = hedef.', '.get(..., {}) zinciri bilinmeyen durumda KeyError yerine None verir.', 'hedef = GECISLER.get(self.durum, {}).get(ad); if hedef is None: raise ValueError(...)'],
    why='Geçiş tablosu kuralları tek yerde toplar; yeni bir durum eklemek tabloya bir satır eklemektir ve tablo iş birimiyle konuşulabilecek bir belgedir.'))
EX.append(dict(t='code', stage='Rehberli', id='tasarim-kaliplari-x2', diff=2,
    q='<p>Ara katman zinciri kur. <code>zincir(katmanlar, isleyici)</code> fonksiyonu tek parametreli bir fonksiyon döndürsün. Her katman <code>katman(istek, sonraki)</code> imzasına sahip; <code>sonraki(istek)</code> çağırarak isteği bir sonraki katmana ya da en sonda <code>isleyici(istek)</code>\'e iletir. Katmanlar listedeki sırayla çalışmalı (ilk eleman en dışta).</p>',
    guide=['En içten başla: son = isleyici.', 'Katmanları ters sırada gez (reversed).', 'Her adımda son\'u, katmanı ve önceki son\'u yakalayan yeni bir fonksiyonla değiştir.', 'Döngüdeki geç bağlama (late binding) tuzağına dikkat: değerleri parametre ile yakala.', 'son\'u döndür.'],
    example='def ekle_bir(f):\n    return lambda x: f(x) + 1\n\ndef kat(x):\n    return x * 2\n\nf = kat\nfor _ in range(3):\n    f = ekle_bir(f)\nprint(f(5))\n',
    start='def zincir(katmanlar, isleyici):\n    son = isleyici\n    # TODO: katmanları ters sırada sar\n    return son\n',
    sol='def zincir(katmanlar, isleyici):\n    son = isleyici\n    for katman in reversed(katmanlar):\n        def sar(istek, k=katman, s=son):\n            return k(istek, s)\n        son = sar\n    return son\n',
    tests='iz = []\ndef a(istek, sonraki):\n    iz.append("a>")\n    y = sonraki(istek)\n    iz.append("<a")\n    return y\ndef b(istek, sonraki):\n    iz.append("b>")\n    if istek.get("engel"):\n        return "403"\n    return sonraki(istek) + "!"\ndef isle(istek):\n    iz.append("isle")\n    return "200"\nuyg = zincir([a, b], isle)\nassert uyg({}) == "200!", "b katmanı yanıtı değiştirebilmeli"\nassert iz == ["a>", "b>", "isle", "<a"], f"Sıra a → b → işleyici olmalı; gelen {iz}"\niz.clear()\nassert uyg({"engel": True}) == "403", "Katman isteği durdurabilmeli"\nassert iz == ["a>", "b>", "<a"], "Durdurulan istek işleyiciye ulaşmamalı"\nassert zincir([], isle)({}) == "200", "Katman yoksa doğrudan işleyici"\n',
    hints=['Dıştaki katman en son sarılmalı: listeyi tersten gez.', 'Kapanışta döngü değişkenini kullanırsan hepsi son değeri görür; varsayılan parametre (k=katman, s=son) ile o anki değeri dondur.', 'def sar(istek, k=katman, s=son): return k(istek, s)'],
    why='Bu, Django ve Starlette/FastAPI middleware\'lerinin çekirdek fikridir: her katman sonrakini bilmeden sarar, sıra listeyle belirlenir.'))
EX.append(dict(t='code', stage='Rehberli', id='tasarim-kaliplari-x3', diff=2,
    q='<p>Depo kalıbı ve bağımlılık enjeksiyonu. <code>BellekMusteriDeposu</code> sınıfı <code>ekle(musteri: dict)</code> (musteri["id"] anahtarıyla saklar; aynı id varsa <code>ValueError</code>), <code>getir(id)</code> (yoksa None) ve <code>sehirde(sehir)</code> (id\'ye göre sıralı liste) metotlarını sunsun. <code>MusteriServisi(depo)</code> kurucuda depoyu alsın ve <code>kaydol(id, ad, sehir)</code> metodu adı baştaki/sondaki boşluklardan arındırıp baş harfleri büyütsün (<code>title()</code>), boş adda <code>ValueError</code> versin, depoya eklesin ve müşteri sözlüğünü döndürsün.</p>',
    guide=['Depo: __init__ içinde self._veri = {} sözlüğü.', 'ekle/getir/sehirde metotlarını sözlük üzerinde yaz.', 'Servis: __init__(self, depo) ile depoyu sakla; içeride depo OLUŞTURMA.', 'kaydol: adı temizle, doğrula, sözlüğü kur, self.depo.ekle(...) çağır, sözlüğü döndür.'],
    example='class SahteSaat:\n    def __init__(self, saat): self.saat = saat\n    def simdi(self): return self.saat\n\nclass Selamlayici:\n    def __init__(self, saat): self.saat = saat\n    def selam(self):\n        return "Günaydın" if self.saat.simdi() < 12 else "İyi günler"\n\nprint(Selamlayici(SahteSaat(9)).selam(), Selamlayici(SahteSaat(15)).selam())\n',
    start='class BellekMusteriDeposu:\n    def __init__(self):\n        self._veri = {}\n    # TODO: ekle, getir, sehirde\n\nclass MusteriServisi:\n    def __init__(self, depo):\n        # TODO: depoyu sakla\n        pass\n    # TODO: kaydol(id, ad, sehir)\n',
    sol='class BellekMusteriDeposu:\n    def __init__(self):\n        self._veri = {}\n\n    def ekle(self, musteri):\n        if musteri["id"] in self._veri:\n            raise ValueError("Bu id zaten var")\n        self._veri[musteri["id"]] = musteri\n\n    def getir(self, id):\n        return self._veri.get(id)\n\n    def sehirde(self, sehir):\n        return [self._veri[k] for k in sorted(self._veri) if self._veri[k]["sehir"] == sehir]\n\nclass MusteriServisi:\n    def __init__(self, depo):\n        self.depo = depo\n\n    def kaydol(self, id, ad, sehir):\n        ad = ad.strip().title()\n        if not ad:\n            raise ValueError("Ad boş olamaz")\n        m = {"id": id, "ad": ad, "sehir": sehir}\n        self.depo.ekle(m)\n        return m\n',
    tests='depo = BellekMusteriDeposu()\nsrv = MusteriServisi(depo)\nassert srv.kaydol(2, "  ayşe yılmaz ", "İzmir") == {"id": 2, "ad": "Ayşe Yılmaz", "sehir": "İzmir"}, "Ad temizlenip title() uygulanmalı"\nsrv.kaydol(1, "mehmet", "İzmir")\nsrv.kaydol(3, "can", "Bursa")\nassert [m["id"] for m in depo.sehirde("İzmir")] == [1, 2], "sehirde id sırasına göre dönmeli"\nassert depo.getir(99) is None\nfor hatali in [(1, "x", "Bursa"), (4, "   ", "Bursa")]:\n    try:\n        srv.kaydol(*hatali)\n        raise AssertionError(f"{hatali} ValueError vermeli")\n    except ValueError:\n        pass\nclass Kayitci:\n    def __init__(self): self.eklenen = []\n    def ekle(self, m): self.eklenen.append(m["id"])\nk = Kayitci()\nMusteriServisi(k).kaydol(7, "deniz", "Ankara")\nassert k.eklenen == [7], "Servis kendisine verilen depoyu kullanmalı (enjeksiyon)"\n',
    hints=['Servisin içinde BellekMusteriDeposu() yazma; kurucuya gelen depoyu sakla.', 'sorted(self._veri) anahtarları (id) sıralar.', 'ad = ad.strip().title(); if not ad: raise ValueError(...)'],
    why='Testteki Kayitci sınıfı, servisin depoyu dışarıdan aldığını kanıtlar: aynı servis üretimde SQL deposuyla, testte sahte depoyla çalışır.'))
EX.append(dict(t='code', stage='Kendin yaz', id='tasarim-kaliplari-x4', diff=2,
    q='<p>Şablon metot. <code>Rapor</code> taban sınıfına somut <code>uret(self)</code> metodunu yaz: <code>self.veri()</code>\'den gelen (ad, tutar) satırlarından <code>self.dahil_mi(satir)</code> True olanları alıp <code>self.bicimle(satirlar)</code> sonucunu döndürsün. <code>dahil_mi</code> varsayılan olarak True dönsün; <code>veri</code> ve <code>bicimle</code> soyut olsun (<code>abc</code>). Ardından iki alt sınıf yaz: <code>CSVRapor</code> satırları <code>"ad;tutar"</code> biçiminde satır satır (\\n ile) birleştirsin; <code>ToplamRapor</code> yalnızca tutarı 1000 ve üzeri satırları alıp <code>"TOPLAM=..."</code> döndürsün. İki alt sınıf da veriyi kurucudan (<code>__init__(self, satirlar)</code>) alsın.</p>',
    start='from abc import ABC, abstractmethod\n\nclass Rapor(ABC):\n    pass\n',
    sol='from abc import ABC, abstractmethod\n\nclass Rapor(ABC):\n    def uret(self):\n        return self.bicimle([s for s in self.veri() if self.dahil_mi(s)])\n\n    def dahil_mi(self, satir):\n        return True\n\n    @abstractmethod\n    def veri(self): ...\n\n    @abstractmethod\n    def bicimle(self, satirlar): ...\n\nclass _Verili(Rapor):\n    def __init__(self, satirlar):\n        self._satirlar = satirlar\n    def veri(self):\n        return self._satirlar\n\nclass CSVRapor(_Verili):\n    def bicimle(self, satirlar):\n        return "\\n".join(f"{a};{t}" for a, t in satirlar)\n\nclass ToplamRapor(_Verili):\n    def dahil_mi(self, satir):\n        return satir[1] >= 1000\n    def bicimle(self, satirlar):\n        return f"TOPLAM={sum(t for _, t in satirlar)}"\n',
    tests='v = [("İzmir", 1200), ("Bursa", 300), ("Ankara", 5400)]\nassert CSVRapor(v).uret() == "İzmir;1200\\nBursa;300\\nAnkara;5400", "CSV tüm satırları içermeli"\nassert ToplamRapor(v).uret() == "TOPLAM=6600", "Yalnız 1000 ve üzeri tutarlar toplanmalı"\ntry:\n    Rapor()\n    raise AssertionError("Soyut Rapor doğrudan örneklenememeli")\nexcept TypeError:\n    pass\nassert "uret" not in CSVRapor.__dict__ and "uret" not in ToplamRapor.__dict__, "uret yalnız taban sınıfta olmalı (şablon)"\n',
    hints=['uret tek satır olabilir: bicimle(süzülmüş liste).', 'Kurucuyu iki alt sınıfta tekrar yazmamak için ortak bir ara sınıf kullanabilirsin.'],
    why='Algoritmanın sırası tek yerde kalır; yeni bir rapor türü yalnızca değişen adımları yazar.'))
EX.append(dict(t='code', stage='Kendin yaz', id='tasarim-kaliplari-x5', diff=2,
    q='<p>Kurucu (builder). <code>Sorgu</code> sınıfı zincirlenebilir metotlarla parametreli SQL üretsin: <code>Sorgu("siparis")</code>, <code>.sec(*sutunlar)</code> (verilmezse <code>*</code>), <code>.nerede(kosul, deger)</code> (birden çok kez çağrılabilir, AND ile birleşir; kosul <code>"sehir = ?"</code> gibi), <code>.sirala(sutun, azalan=False)</code>, <code>.limit(n)</code>. <code>.insa()</code> <code>(sql, parametreler)</code> demeti döndürsün. Örnek: <code>Sorgu("siparis").sec("id", "tutar").nerede("sehir = ?", "İzmir").nerede("tutar &gt; ?", 500).sirala("tutar", azalan=True).limit(10).insa()</code> → <code>("SELECT id, tutar FROM siparis WHERE sehir = ? AND tutar &gt; ? ORDER BY tutar DESC LIMIT 10", ["İzmir", 500])</code>.</p>',
    start='class Sorgu:\n    pass\n',
    sol='class Sorgu:\n    def __init__(self, tablo):\n        self.tablo = tablo\n        self._sutunlar = []\n        self._kosullar = []\n        self._params = []\n        self._sira = None\n        self._limit = None\n\n    def sec(self, *sutunlar):\n        self._sutunlar = list(sutunlar)\n        return self\n\n    def nerede(self, kosul, deger):\n        self._kosullar.append(kosul)\n        self._params.append(deger)\n        return self\n\n    def sirala(self, sutun, azalan=False):\n        self._sira = f"{sutun} DESC" if azalan else sutun\n        return self\n\n    def limit(self, n):\n        self._limit = n\n        return self\n\n    def insa(self):\n        sql = f"SELECT {\', \'.join(self._sutunlar) or \'*\'} FROM {self.tablo}"\n        if self._kosullar:\n            sql += " WHERE " + " AND ".join(self._kosullar)\n        if self._sira:\n            sql += f" ORDER BY {self._sira}"\n        if self._limit is not None:\n            sql += f" LIMIT {self._limit}"\n        return sql, list(self._params)\n',
    tests='s = Sorgu("siparis").sec("id", "tutar").nerede("sehir = ?", "İzmir").nerede("tutar > ?", 500).sirala("tutar", azalan=True).limit(10).insa()\nassert s == ("SELECT id, tutar FROM siparis WHERE sehir = ? AND tutar > ? ORDER BY tutar DESC LIMIT 10", ["İzmir", 500]), f"Tam sorgu yanlış: {s}"\nassert Sorgu("musteri").insa() == ("SELECT * FROM musteri", []), "Seçim yoksa * kullanılmalı"\nassert Sorgu("urun").sirala("ad").insa()[0] == "SELECT * FROM urun ORDER BY ad", "Artan sıralama DESC içermemeli"\nimport sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis(id, sehir, tutar)")\ncon.executemany("INSERT INTO siparis VALUES (?,?,?)", [(1, "İzmir", 900), (2, "İzmir", 300), (3, "Bursa", 800)])\nsql, p = Sorgu("siparis").sec("id").nerede("sehir = ?", "İzmir").nerede("tutar > ?", 500).insa()\nassert con.execute(sql, p).fetchall() == [(1,)], "Üretilen sorgu sqlite\'ta çalışmalı"\n',
    hints=['Her metot durumu güncelleyip return self yapmalı.', 'Değerleri SQL metnine gömme; ? yer tutucuları ve ayrı parametre listesi kullan (SQL enjeksiyonu).'],
    why='Kurucu, isteğe bağlı birçok parçayı okunur bir zincirle bir araya getirir; parametreleri ayrı tutmak SQL enjeksiyonuna karşı da korur.'))
EX.append(dict(t='code', stage='Hata avı', id='tasarim-kaliplari-x6', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. Kampanya stratejileri bir döngüyle kaydediliyor ama hepsi %20 indirim uyguluyor. <code>KAMPANYA["y5"](100)</code> 95.0, <code>"y10"</code> 90.0, <code>"y20"</code> 80.0 vermeli.</p>',
    start='KAMPANYA = {}\nfor oran in (5, 10, 20):\n    KAMPANYA[f"y{oran}"] = lambda tutar: round(tutar * (1 - oran / 100), 2)\n',
    sol='KAMPANYA = {}\nfor oran in (5, 10, 20):\n    KAMPANYA[f"y{oran}"] = lambda tutar, oran=oran: round(tutar * (1 - oran / 100), 2)\n',
    tests='assert KAMPANYA["y5"](100) == 95.0, "y5 %5 indirim uygulamalı"\nassert KAMPANYA["y10"](100) == 90.0, "y10 %10 indirim uygulamalı"\nassert KAMPANYA["y20"](250) == 200.0, "y20 %20 indirim uygulamalı"\n',
    hints=['Lambda, oran değişkenine çağrıldığı anda bakar; o anda döngü bitmiş ve oran 20\'dir (geç bağlama).', 'Değeri tanım anında dondurmak için varsayılan parametre kullan: lambda tutar, oran=oran: ...'],
    why='Kapanışlar değişkeni değil değişkenin kendisini yakalar; döngü bitince hepsi son değeri görür. Varsayılan parametre değeri tanım anında hesaplanır. functools.partial da bir çözümdür.'))
EX.append(dict(t='code', stage='Hata avı', id='tasarim-kaliplari-x7', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>Yayinci.yayinla</code>, bir abone yayın sırasında kendini listeden çıkardığında (tek seferlik abone) <b>sonraki aboneyi atlıyor</b>. Tüm aboneler o yayını almalı; tek seferlik abone sonraki yayında çağrılmamalı.</p>',
    start='class Yayinci:\n    def __init__(self):\n        self.aboneler = []\n\n    def abone(self, fn):\n        self.aboneler.append(fn)\n\n    def cik(self, fn):\n        self.aboneler.remove(fn)\n\n    def yayinla(self, olay):\n        for fn in self.aboneler:\n            fn(olay)\n',
    sol='class Yayinci:\n    def __init__(self):\n        self.aboneler = []\n\n    def abone(self, fn):\n        self.aboneler.append(fn)\n\n    def cik(self, fn):\n        self.aboneler.remove(fn)\n\n    def yayinla(self, olay):\n        for fn in list(self.aboneler):\n            fn(olay)\n',
    tests='y = Yayinci()\nalinan = []\ndef tek_sefer(o):\n    alinan.append(("tek", o))\n    y.cik(tek_sefer)\ndef fatura(o):\n    alinan.append(("fatura", o))\ny.abone(tek_sefer)\ny.abone(fatura)\ny.yayinla("siparis-1")\nassert alinan == [("tek", "siparis-1"), ("fatura", "siparis-1")], f"Fatura abonesi atlanmamalı: {alinan}"\ny.yayinla("siparis-2")\nassert alinan[-1] == ("fatura", "siparis-2") and len(alinan) == 3, "Tek seferlik abone ikinci yayında çağrılmamalı"\n',
    hints=['Üzerinde döndüğün listeden eleman silmek, döngünün bir sonraki elemanı atlamasına yol açar.', 'Döngüyü listenin bir kopyası üzerinde yap: for fn in list(self.aboneler).'],
    why='Liste yineleyicisi indeksle ilerler; 0. eleman silinince 1. eleman 0\'a kayar ve atlanır. Anlık görüntü (kopya) üzerinde gezinmek gözlemci kalıbında standart çözümdür.'))
EX.append(dict(t='code', stage='Meydan okuma', id='tasarim-kaliplari-x8', diff=3,
    q='<p>Şartname (specification) kalıbı: birleştirilebilir iş kuralları. <code>Kural(fn, ad)</code> sınıfı yaz; <code>kural(nesne)</code> çağrısı <code>fn(nesne)</code>\'nin bool sonucunu döndürsün. Operatörler: <code>k1 &amp; k2</code> (ikisi de), <code>k1 | k2</code> (en az biri), <code>~k</code> (değili) yeni bir <code>Kural</code> döndürsün. Adlar da birleşsin: <code>"(a VE b)"</code>, <code>"(a VEYA b)"</code>, <code>"DEĞİL a"</code>; <code>repr(kural)</code> <code>Kural(ad)</code> olsun. Ayrıca <code>filtrele(kural, nesneler)</code> fonksiyonu kurala uyanları liste olarak döndürsün. Kısa devre: <code>&amp;</code> ilk kural False ise ikinciyi çağırmamalı.</p>',
    start='class Kural:\n    pass\n\ndef filtrele(kural, nesneler):\n    pass\n',
    sol='class Kural:\n    def __init__(self, fn, ad):\n        self.fn, self.ad = fn, ad\n\n    def __call__(self, nesne):\n        return bool(self.fn(nesne))\n\n    def __and__(self, o):\n        return Kural(lambda x: self(x) and o(x), f"({self.ad} VE {o.ad})")\n\n    def __or__(self, o):\n        return Kural(lambda x: self(x) or o(x), f"({self.ad} VEYA {o.ad})")\n\n    def __invert__(self):\n        return Kural(lambda x: not self(x), f"DEĞİL {self.ad}")\n\n    def __repr__(self):\n        return f"Kural({self.ad})"\n\ndef filtrele(kural, nesneler):\n    return [n for n in nesneler if kural(n)]\n',
    tests='buyuk = Kural(lambda s: s["tutar"] >= 1000, "büyük")\nizmir = Kural(lambda s: s["sehir"] == "İzmir", "izmir")\nvip = Kural(lambda s: s.get("vip"), "vip")\nsip = [{"no": 1, "tutar": 1500, "sehir": "İzmir"}, {"no": 2, "tutar": 200, "sehir": "İzmir", "vip": True}, {"no": 3, "tutar": 3000, "sehir": "Bursa"}, {"no": 4, "tutar": 50, "sehir": "Ankara"}]\nk = (buyuk & izmir) | vip\nassert [s["no"] for s in filtrele(k, sip)] == [1, 2], "(büyük VE izmir) VEYA vip → 1 ve 2"\nassert [s["no"] for s in filtrele(~izmir & ~vip, sip)] == [3, 4]\nassert repr(k) == "Kural(((büyük VE izmir) VEYA vip))", f"Ad birleşimi yanlış: {k!r}"\nassert repr(~vip) == "Kural(DEĞİL vip)"\nassert vip({"vip": 1}) is True and vip({}) is False, "Çağrı bool döndürmeli"\ncagrildi = []\nizci = Kural(lambda s: cagrildi.append(1) or True, "izci")\nKural(lambda s: False, "hayir")(sip[0]); (Kural(lambda s: False, "hayir") & izci)(sip[0])\nassert cagrildi == [], "& kısa devre yapmalı: ilk kural False ise ikinci çağrılmamalı"\n',
    hints=['__and__, __or__, __invert__ yeni bir Kural döndürür; fonksiyonu lambda ile iki kuralı birleştirerek kur.', 'Python\'un and/or operatörleri kısa devre yapar: lambda x: self(x) and o(x).'],
    why='Şartname kalıbı iş kurallarını küçük, test edilebilir parçalara böler ve operatörlerle okunur biçimde birleştirir; kampanya ve kredi uygunluk kurallarında sık kullanılır.'))

EXT = dict(id='tasarim-kaliplari', min=30, html=html, ex=EX,
    faq=[dict(q='Bağımlılık enjeksiyonu için bir çatı (framework) gerekir mi?', a='Python\'da çoğu zaman gerekmez: bağımlılığı kurucu ya da fonksiyon parametresi olarak vermek yeter. FastAPI\'nin Depends sistemi ya da dependency-injector gibi kütüphaneler büyük uygulamalarda yaşam döngüsünü yönetmeye yardım eder, ama fikir aynıdır.'),
         dict(q='Durum makinesi için kütüphane kullanmalı mıyım?', a='Birkaç durum ve geçiş için sözlük tablosu yeter. Geçişlere koşul (guard), giriş/çıkış eylemleri ve diyagram üretimi gerekiyorsa transitions gibi bir kütüphane düşünülebilir; önce tablonun yetmediğini gör.')],
    mistakes=[dict(bad='class Filtre:\n    def sehir(self, s):\n        self.s = s      # return yok', good='class Filtre:\n    def sehir(self, s):\n        self.s = s\n        return self', why='Akıcı kurucuda return self unutulursa metot None döner ve zincirin bir sonraki halkası AttributeError verir.'),
              dict(bad='class SiparisServisi:\n    def __init__(self):\n        self.db = sqlite3.connect("prod.db")', good='class SiparisServisi:\n    def __init__(self, depo):\n        self.depo = depo', why='Bağımlılığı içeride oluşturmak servisi gerçek veritabanına kilitler; test için üretim veritabanı gerekir. Bağımlılığı dışarıdan al.')])
