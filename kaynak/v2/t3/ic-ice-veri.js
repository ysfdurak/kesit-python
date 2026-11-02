/* Kesit Python v2 — ic-ice-veri */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ic-ice-veri',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 35,
  title: 'İç içe veri yapıları',
  sum: 'Liste içinde sözlük, sözlük içinde liste ve JSON benzeri derin yapılarda gezinir; güvenli erişim, güncelleme, gruplama, düzleştirme, tablo gibi yazdırma ve sığ/derin kopya tuzağını Anadolu Market verisiyle öğrenirsin.',
  goals: ['Kayıt listesi (liste içinde sözlük) ve sözlük içinde liste yapılarını kurup gezebilirim.', 'Derin bir yapıda bir değere giden yolu adım adım yazar, .get zinciriyle güvenli okurum.', 'İç içe yapıyı yerinde güncelleyebilir, kayıtları bir alana göre gruplayabilirim.', 'İç içe siparişleri düz bir satır listesine çevirip tablo gibi hizalı yazdırabilirim.', 'Sığ kopya ile derin kopya arasındaki farkı açıklar, doğru olanı seçerim.'],
  body: `
<h2>Gerçek veri düz değildir</h2>
<p>Şimdiye kadar tek bir liste ya da tek bir sözlükle çalıştın. Gerçek işte veri neredeyse hiç böyle gelmez. Anadolu Market'in sipariş sisteminden gelen bir kayıt düşün: siparişin bir müşterisi var, müşterinin bir adresi var, siparişin içinde birden fazla ürün kalemi var, her kalemin adedi ve fiyatı var. Bu bilgi doğal olarak <b>iç içe</b> (nested) bir yapıdır: sözlüğün içinde sözlük, onun içinde liste, listenin içinde yine sözlük.</p>
<p>Web servislerinden (API) gelen JSON yanıtları, yapılandırma dosyaları, e-ticaret sepetleri, banka hesap hareketleri; hepsi bu biçimdedir. Bu derste iç içe yapıları okumayı, güvenle erişmeyi, değiştirmeyi ve analiz için düzleştirmeyi öğreneceksin. Listeler ve Sözlükler derslerinde gördüğün her şey burada birleşiyor.</p>

<h2>Kayıt listesi: liste içinde sözlük</h2>
<p>En yaygın yapı budur: her eleman bir kayıt (satır), her kayıt bir sözlük (sütun adı → değer). Bir Excel tablosunun Python karşılığı diye düşünebilirsin.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "musteri": "Ayşe", "sehir": "İzmir", "tutar": 1499.9},
    {"no": "AM-102", "musteri": "Mehmet", "sehir": "Ankara", "tutar": 250.0},
    {"no": "AM-103", "musteri": "Zeynep", "sehir": "İzmir", "tutar": 89.5},
]
print(len(siparisler), "sipariş")
print(siparisler[0]["musteri"])          # ilk kaydın müşterisi
for s in siparisler:
    if s["sehir"] == "İzmir":
        print(s["no"], s["tutar"])
toplam = 0
for s in siparisler:
    toplam += s["tutar"]
print("Toplam:", round(toplam, 2))</pre>
<p>Okuma kuralı basit: önce köşeli parantezle <b>hangi kayıt</b> (indeks), sonra <b>hangi alan</b> (anahtar). <code>siparisler[0]["musteri"]</code> "0. kaydın musteri alanı" demektir. Döngüde ise <code>s</code> zaten tek bir sözlüktür; doğrudan <code>s["tutar"]</code> yazarsın.</p>

<h2>Sözlük içinde liste</h2>
<p>Ters yön de çok kullanılır: bir anahtarın altında birden fazla değer tutmak. Bir müşterinin sipariş numaraları, bir şehrin şube listesi, bir ürünün etiketleri.</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "siparisler": ["AM-101", "AM-117"],
    "etiketler": ["sadık", "kampanya"],
}
musteri["siparisler"].append("AM-130")     # iç listeye ekle
print(musteri["siparisler"])
print(len(musteri["siparisler"]), "sipariş")
print("sadık" in musteri["etiketler"])
print(musteri["siparisler"][-1])           # son sipariş</pre>
<p><code>musteri["siparisler"]</code> bir liste döndürür; ona <code>.append</code>, <code>len</code>, <code>in</code>, dilim gibi tüm liste işlemlerini uygulayabilirsin. İç listeyi değiştirdiğinde sözlüğün içindeki liste değişir, çünkü ikisi aynı nesnedir.</p>

<h2>Derin yapılarda gezinme: yolu adım adım yaz</h2>
<p>Gerçek bir sipariş kaydı daha derindir. Aşağıdaki yapı, bir API'den gelen JSON yanıtının tipik görünümüdür.</p>
<pre class="py">siparis = {
    "no": "AM-205",
    "musteri": {
        "ad": "Ayşe Yılmaz",
        "adres": {"sehir": "İzmir", "ilce": "Konak"},
    },
    "kalemler": [
        {"urun": "Kahve makinesi", "adet": 1, "fiyat": 1499.9},
        {"urun": "Filtre kağıdı", "adet": 3, "fiyat": 45.0},
    ],
}
print(siparis["musteri"]["adres"]["sehir"])
print(siparis["kalemler"][1]["urun"])
print(type(siparis["kalemler"]), type(siparis["kalemler"][0]))
toplam = 0
for k in siparis["kalemler"]:
    toplam += k["adet"] * k["fiyat"]
print("Sipariş toplamı:", round(toplam, 2))</pre>
<p>Derin bir değere ulaşmak için yolu soldan sağa okursun: <code>siparis</code> → <code>["musteri"]</code> (sözlük) → <code>["adres"]</code> (sözlük) → <code>["sehir"]</code> (metin). Her adımda elindeki şeyin türünü bil: sözlükse anahtar, listeyse indeks kullanırsın. Kaybolduğunda bir ara adımı <code>print(type(...))</code> ile yazdır; bu, deneyimli geliştiricilerin de en çok kullandığı yöntemdir.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Elindeki şey</th><th>Sonraki adım</th></tr>
<tr><td><code>siparis</code></td><td>sözlük</td><td>anahtar: <code>["kalemler"]</code></td></tr>
<tr><td><code>siparis["kalemler"]</code></td><td>liste</td><td>indeks: <code>[1]</code> ya da <code>for</code></td></tr>
<tr><td><code>siparis["kalemler"][1]</code></td><td>sözlük</td><td>anahtar: <code>["urun"]</code></td></tr>
<tr><td><code>siparis["kalemler"][1]["urun"]</code></td><td>metin</td><td>metin işlemleri</td></tr>
</table></div>

<h2>Güvenli erişim: .get zinciri</h2>
<p>Gerçek veride alanlar eksik olabilir: bazı müşterilerin adresi girilmemiştir, bazı siparişlerde indirim alanı yoktur. Köşeli parantez eksik anahtarda <code>KeyError</code> verir ve tüm rapor durur. Sözlükler dersinde <code>get</code> ile varsayılan değeri gördün; iç içe yapıda bunu <b>zincirlersin</b>.</p>
<pre class="py">musteriler = [
    {"ad": "Ayşe", "adres": {"sehir": "İzmir"}},
    {"ad": "Mehmet"},                       # adres yok
    {"ad": "Zeynep", "adres": {}},          # adres var, şehir yok
]
for m in musteriler:
    sehir = m.get("adres", {}).get("sehir", "Bilinmiyor")
    print(m["ad"], "→", sehir)</pre>
<p>Püf noktası ara adımdaki varsayılan: <code>m.get("adres", {})</code>. Adres yoksa boş sözlük döner ve ikinci <code>.get</code> onun üzerinde güvenle çalışır. Varsayılanı yazmazsan <code>None</code> döner ve <code>None.get(...)</code> <code>AttributeError</code> verir. Listede eksik olabilecek bir indeks için de benzer bir kontrol yaparsın: <code>kalemler[0] if kalemler else None</code>.</p>
<div class="warn"><b>get zinciri her şeyi çözmez</b>Zincirin ara adımı bazen anahtar eksikliği değil <b>None</b> değeri olarak gelir: <code>{"adres": None}</code>. Bu durumda <code>.get("adres", {})</code> yine None döndürür, çünkü anahtar vardır. Kirli veride <code>(m.get("adres") or {}).get("sehir")</code> yazmak daha dayanıklıdır: <code>or</code>, None'ı da boş sözlükle değiştirir.</div>
<p>Çok derin yollar için küçük bir yardımcı fonksiyon yazmak işini kolaylaştırır. Yolu bir liste olarak verirsin; fonksiyon her adımda bir sonraki katmana iner, bir adım bulunamazsa varsayılanı döndürür.</p>
<pre class="py">def derin_al(veri, yol, varsayilan=None):
    for adim in yol:
        try:
            veri = veri[adim]
        except (KeyError, IndexError, TypeError):
            return varsayilan
    return veri

siparis = {"musteri": {"adres": {"sehir": "İzmir"}}, "kalemler": [{"urun": "Çay"}]}
print(derin_al(siparis, ["musteri", "adres", "sehir"]))
print(derin_al(siparis, ["kalemler", 0, "urun"]))
print(derin_al(siparis, ["kalemler", 5, "urun"], "yok"))
print(derin_al(siparis, ["musteri", "telefon"], "yok"))</pre>
<p>Buradaki <code>try/except</code> yapısını Hatalar dersinde ayrıntılı göreceksin; şimdilik "bu adım patlarsa varsayılanı döndür" diye oku.</p>

<h2>İç içe yapıyı güncellemek</h2>
<p>Okuduğun yolun aynısıyla yazabilirsin. Son adıma atama yaparsan değer değişir; iç listeye <code>append</code> yaparsan eleman eklenir.</p>
<pre class="py">siparis = {
    "no": "AM-205",
    "durum": "hazırlanıyor",
    "musteri": {"ad": "Ayşe", "adres": {"sehir": "İzmir"}},
    "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 120.0}],
}
siparis["durum"] = "kargoda"
siparis["musteri"]["adres"]["ilce"] = "Bornova"          # yeni alan
siparis["kalemler"][0]["adet"] += 1                       # adet 3 oldu
siparis["kalemler"].append({"urun": "Bardak", "adet": 6, "fiyat": 25.0})
siparis.setdefault("notlar", []).append("Kapıya bırak")   # liste yoksa oluştur
print(siparis["musteri"]["adres"])
print(len(siparis["kalemler"]), siparis["kalemler"][0]["adet"])
print(siparis["notlar"])</pre>
<p><code>setdefault(anahtar, [])</code> çok kullanışlıdır: anahtar yoksa boş liste koyup onu döndürür, varsa mevcut listeyi döndürür. Böylece "liste var mı yok mu" kontrolünü tek satırda geçersin.</p>

<h2>Gruplama: şehre göre sipariş listesi</h2>
<p>Sözlükler dersinde sayım kalıbını gördün: her şehirde kaç sipariş var. Gruplama bir adım ötesidir: her şehrin <b>siparişlerinin kendisini</b> bir listede toplarsın. Sonuç sözlük içinde liste yapısıdır.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "sehir": "İzmir", "tutar": 1499.9},
    {"no": "AM-102", "sehir": "Ankara", "tutar": 250.0},
    {"no": "AM-103", "sehir": "İzmir", "tutar": 89.5},
    {"no": "AM-104", "sehir": "Bursa", "tutar": 3200.0},
]
gruplar = {}
for s in siparisler:
    gruplar.setdefault(s["sehir"], []).append(s["no"])
print(gruplar)
for sehir, nolar in gruplar.items():
    print(sehir, len(nolar), nolar)</pre>
<p>Aynı işi <code>if s["sehir"] not in gruplar: gruplar[s["sehir"]] = []</code> diye iki satırla da yazabilirsin; <code>setdefault</code> bunun kısaltmasıdır. Orta seviyede <code>collections.defaultdict(list)</code> ile daha da kısalacak. Sık yapılan hata, <code>gruplar[sehir] = [no]</code> yazıp her seferinde listeyi sıfırlamaktır.</p>

<h2>Düzleştirme: iç içe veriyi tabloya çevirmek</h2>
<p>Analiz ve raporlama için çoğu zaman <b>düz</b> (flat) bir tablo istersin: her satır bir kalem, her sütun bir alan. Bu, pandas'a ya da Excel'e aktarmanın da ön adımıdır. İç içe döngüyle dış kaydın bilgisini her iç satıra taşırsın.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "sehir": "İzmir",
     "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 120.0},
                  {"urun": "Bardak", "adet": 6, "fiyat": 25.0}]},
    {"no": "AM-102", "sehir": "Ankara",
     "kalemler": [{"urun": "Kahve", "adet": 1, "fiyat": 350.0}]},
]
satirlar = []
for s in siparisler:
    for k in s["kalemler"]:
        satirlar.append({
            "no": s["no"], "sehir": s["sehir"], "urun": k["urun"],
            "tutar": k["adet"] * k["fiyat"],
        })
print(len(satirlar), "satır")
for r in satirlar:
    print(r)</pre>

<h2>Tablo gibi yazdırmak</h2>
<p>Düz satırları ekranda okunur göstermek için f-string hizalaması kullan: <code>:&lt;12</code> sola, <code>:&gt;10</code> sağa yaslar, <code>:.2f</code> iki ondalık verir. Metinler sola, sayılar sağa hizalanır; muhasebe raporlarının da kuralı budur.</p>
<pre class="py">satirlar = [
    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},
    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},
    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},
]
print(f"{'Sipariş':&lt;8} {'Ürün':&lt;10} {'Tutar':&gt;8}")
print("-" * 28)
for r in satirlar:
    print(f"{r['no']:&lt;8} {r['urun']:&lt;10} {r['tutar']:&gt;8.2f}")
print("-" * 28)
print(f"{'TOPLAM':&lt;19} {sum(r['tutar'] for r in satirlar):&gt;8.2f}")</pre>
<div class="tip"><b>Tırnak karışıklığı</b>f-string içinde sözlük anahtarı yazarken dıştaki tırnakla aynı tırnağı kullanma: <code>f"{r['no']}"</code> doğru, eski sürümlerde <code>f"{r["no"]}"</code> SyntaxError verir. Python 3.12 bunu kabul etse de karışık tırnak alışkanlığı her sürümde çalışır. Biçimlendirmenin tüm ayrıntısını String biçimleme dersinde göreceksin.</div>
<p>Bir yapının içini hızlıca görmek için iki araç daha var: <code>pprint.pprint(veri)</code> iç içe yapıyı girintili yazdırır, <code>json.dumps(veri, indent=2, ensure_ascii=False)</code> JSON görünümü verir. Hata ayıklarken ikisi de hayat kurtarır.</p>

<h2>Sığ kopya, derin kopya tuzağı</h2>
<p>Listeler dersinde atamanın kopya olmadığını gördün. İç içe yapıda bir adım daha var: <code>.copy()</code> yalnızca <b>en dış katmanı</b> kopyalar. Bu sığ kopyadır (shallow copy); içteki listeler ve sözlükler hâlâ paylaşılır.</p>
<pre class="py">import copy

katalog = {"Çay": {"fiyat": 120.0, "etiket": ["içecek"]}}
sig = katalog.copy()
derin = copy.deepcopy(katalog)

sig["Çay"]["fiyat"] = 99.0           # iç sözlük paylaşılıyor!
derin["Çay"]["etiket"].append("kampanya")

print(katalog["Çay"]["fiyat"])        # orijinal de değişti: 99.0
print(katalog["Çay"]["etiket"])       # orijinal etkilenmedi
print(sig["Çay"] is katalog["Çay"], derin["Çay"] is katalog["Çay"])</pre>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Dış katman</th><th>İç katmanlar</th><th>Ne zaman</th></tr>
<tr><td><code>b = a</code></td><td>Paylaşılır</td><td>Paylaşılır</td><td>Kopya istemiyorsan, aynı nesneye ikinci ad</td></tr>
<tr><td><code>a.copy()</code>, <code>list(a)</code>, <code>a[:]</code></td><td>Yeni</td><td>Paylaşılır</td><td>Yapı düzse (sayı, metin elemanlar)</td></tr>
<tr><td><code>copy.deepcopy(a)</code></td><td>Yeni</td><td>Yeni</td><td>İç içe yapıyı bağımsız değiştireceksen</td></tr>
</table></div>
<p>Aynı tuzak <code>[[0] * 3] * 3</code> ile tablo kurarken de karşına çıkar: üç satır aynı iç listedir, birini değiştirince hepsi değişir. Doğrusu her satırı ayrı oluşturmaktır: <code>[[0] * 3 for _ in range(3)]</code>.</p>
<div class="note"><b>Gerçek işte</b>Bir veri analisti ya da backend geliştiricisi gününün önemli kısmını iç içe JSON'la geçirir: ödeme sağlayıcısının webhook mesajı, kargo firmasının takip yanıtı, CRM'den gelen müşteri kaydı. Tipik iş akışı hep aynıdır: yanıtı al, <code>.get</code> zinciriyle eksik alanlara dayanıklı oku, ihtiyacın olan alanları düz satırlara çevir, sonra raporla ya da veritabanına yaz. Kampanya fiyatı hesaplarken orijinal kataloğu sığ kopyayla bozmak ise canlı sistemde yaşanan klasik hatalardandır; fiyat ekranı birden yanlış göstermeye başlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Ne kadar iç içe olmalı?</h3>
<p>İç içelik veriyi doğal gösterir ama her katman okumayı zorlaştırır. Üç-dört katmandan derin yapılar genellikle tasarım kokusudur. Veritabanı mantığında veriyi <b>normalize</b> edersin: müşterileri ayrı bir sözlükte (<code>{"M-101": {...}}</code>), siparişleri ayrı bir listede tutar, siparişte yalnızca <code>"musteri_no"</code> saklarsın. Gerektiğinde sözlükten anında bulursun. Bu, SQL'deki JOIN'in Python karşılığıdır ve aynı müşteri bilgisinin yüz siparişte kopyalanmasını önler.</p>
<pre class="py">musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}
siparisler = [{"no": "AM-1", "musteri_no": "M-1", "tutar": 300}, {"no": "AM-2", "musteri_no": "M-2", "tutar": 120}]
for s in siparisler:
    m = musteriler.get(s["musteri_no"], {})
    print(s["no"], m.get("ad", "?"), m.get("sehir", "?"), s["tutar"])</pre>
<h3>Sözlükten sınıfa</h3>
<p><code>s["musteri"]["adres"]["sehir"]</code> yazarken anahtarı yanlış yazarsan hata ancak çalışırken ortaya çıkar. Orta seviyede <code>dataclass</code> ile kayıtları sınıfa çevirip <code>s.musteri.adres.sehir</code> yazacak, editörün otomatik tamamlamasından ve tip denetiminden yararlanacaksın. Dış dünyadan gelen JSON'u sınıflara çevirmek için de pydantic gibi kütüphaneler kullanılır.</p>
<h3>Bilinmeyen derinlik</h3>
<p>Bazen yapının kaç katman olduğunu bilmezsin: klasör ağacı, kategori ağacı, organizasyon şeması. Bunları gezmek için ya bir yığın (stack) ile döngü kurarsın ya da fonksiyonun kendini çağırdığı özyinelemeyi (recursion) kullanırsın. Özyineleme dersinde iç içe listenin toplamını ve klasör ağacını tam bu tekniklerle gezeceksin.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>siparisler[1]["kalemler"][0]["urun"]</code> ifadesi neyi verir?',
      o: ['İlk siparişin ikinci kaleminin ürün adını', 'İkinci siparişin ilk kaleminin ürün adını', 'İkinci siparişin tüm kalemlerini', 'Hata verir, iki tür köşeli parantez karışamaz'],
      a: 1,
      why: 'Yol soldan sağa okunur: [1] ikinci sipariş (indeks 0\'dan başlar), ["kalemler"] o siparişin kalem listesi, [0] ilk kalem, ["urun"] o kalemin ürün adı. Liste indeksi ve sözlük anahtarı aynı ifadede serbestçe karışabilir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>m.get("adres", {}).get("sehir", "?")</code> ifadesinde ilk get\'e neden <code>{}</code> varsayılanı verilir?',
      o: ['Boş sözlük daha az bellek kullandığı için', 'Adres yoksa ikinci .get boş sözlükte güvenle çalışsın diye', 'Python get\'te varsayılanı zorunlu tuttuğu için', 'Şehir alanını otomatik olarak oluşturmak için'],
      a: 1,
      why: 'Adres anahtarı yoksa varsayılansız get None döndürür ve None.get(...) AttributeError verir. {} döndüğünde ikinci get onun üzerinde çalışır ve "?" verir. Varsayılan zorunlu değildir ve hiçbir alan oluşturmaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'siparis = {\n    "no": "AM-7",\n    "kalemler": [\n        {"urun": "Çay", "adet": 2},\n        {"urun": "Şeker", "adet": 1},\n    ],\n}\nsiparis["kalemler"][1]["adet"] += 4\nprint(len(siparis["kalemler"]), siparis["kalemler"][1]["adet"])\n',
      o: ['2 5', '2 1', '3 5', '2 4'],
      a: 0,
      why: 'Kalem listesinde iki eleman var; [1] ikinci kalemdir (Şeker) ve adedi 1 + 4 = 5 olur. Yerinde güncelleme listenin uzunluğunu değiştirmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sığ kopyaya dikkat: bu kod ne yazdırır?',
      code: 'stok = {"Çay": [10, 20], "Kahve": [5]}\nyedek = stok.copy()\nyedek["Çay"].append(30)\nyedek["Kahve"] = [0]\nprint(stok)\n',
      o: ['{\'Çay\': [10, 20], \'Kahve\': [5]}', '{\'Çay\': [10, 20, 30], \'Kahve\': [5]}', '{\'Çay\': [10, 20, 30], \'Kahve\': [0]}', '{\'Çay\': [10, 20], \'Kahve\': [0]}'],
      a: 1,
      why: 'copy() sığ kopyadır: "Çay" listesi iki sözlükte aynı nesnedir, append orijinale de yansır. "Kahve" ise yedekte yeni bir listeyle değiştirildi; bu yalnız yedek sözlüğün anahtarını etkiler, orijinal [5] kalır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu gruplama kodu ne yazdırır?',
      code: 'siparisler = [("AM-1", "İzmir"), ("AM-2", "Bursa"), ("AM-3", "İzmir")]\ngruplar = {}\nfor no, sehir in siparisler:\n    gruplar.setdefault(sehir, []).append(no)\nprint(gruplar)\n',
      o: ['{\'İzmir\': [\'AM-3\'], \'Bursa\': [\'AM-2\']}', '{\'İzmir\': 2, \'Bursa\': 1}', '{\'İzmir\': [\'AM-1\', \'AM-3\'], \'Bursa\': [\'AM-2\']}', '{\'Bursa\': [\'AM-2\'], \'İzmir\': [\'AM-1\', \'AM-3\']}'],
      a: 2,
      why: 'setdefault anahtar yoksa boş liste koyar, varsa mevcut listeyi döndürür; append ile numaralar birikir. Sözlük ekleme sırasını korur: İzmir önce geldiği için önce yazılır. Sayım değil, listenin kendisi tutulur.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Siparişleri düzleştirip her kalemi <code>(no, urun, tutar)</code> demeti olarak <code>satirlar</code> listesine ekleyen programın satırlarını sırala.</p>',
      lines: ['siparisler = [{"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 50}]}]', 'satirlar = []', 'for s in siparisler:', '    for k in s["kalemler"]:', '        tutar = k["adet"] * k["fiyat"]', '        satirlar.append((s["no"], k["urun"], tutar))', 'print(satirlar)'],
      expect: '[(\'AM-1\', \'Çay\', 100)]\n',
      hint: 'Dış döngü siparişleri, iç döngü o siparişin kalemlerini gezer; liste döngüden önce oluşturulur.',
      why: 'Boş liste en başta kurulur; dış döngüdeki s, iç döngüde de görünür olduğundan sipariş numarası her kalem satırına taşınır.' },
    { id: 'ic-ice-veri-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>musteri_sehri(musteri)</code> fonksiyonunu yaz. Müşteri sözlüğünde <code>"adres"</code> alanı, onun içinde <code>"sehir"</code> alanı olabilir ya da olmayabilir. Şehir bulunursa onu, bulunmazsa <code>"Bilinmiyor"</code> döndür. Hiçbir durumda hata vermemeli.</p>',
      guide: ['Önce müşteriden "adres" alanını get ile al; yoksa boş sözlük gelsin.', 'Gelen sözlükten "sehir" alanını yine get ile al; varsayılan "Bilinmiyor" olsun.', 'İki adımı tek satırda zincirleyebilirsin.', 'Sonucu return et.'],
      example: 'urun = {"ad": "Çay", "detay": {"marka": "Rize"}}\nmarka = urun.get("detay", {}).get("marka", "markasız")\nmense = urun.get("detay", {}).get("mense", "bilinmiyor")\nprint(marka, mense)\n',
      start: 'def musteri_sehri(musteri):\n    # TODO: adres alanını güvenle al (yoksa boş sözlük)\n    # TODO: adresten sehir alanını güvenle al (yoksa "Bilinmiyor")\n    pass\n',
      sol: 'def musteri_sehri(musteri):\n    adres = musteri.get("adres", {})\n    return adres.get("sehir", "Bilinmiyor")\n',
      tests: 'assert musteri_sehri({"ad": "Ayşe", "adres": {"sehir": "İzmir"}}) == "İzmir", "adres ve şehir varsa şehri döndürmeli"\nassert musteri_sehri({"ad": "Mehmet"}) == "Bilinmiyor", "adres alanı hiç yoksa \'Bilinmiyor\' dönmeli, KeyError değil"\nassert musteri_sehri({"ad": "Zeynep", "adres": {"ilce": "Konak"}}) == "Bilinmiyor", "adres var ama şehir yoksa yine \'Bilinmiyor\'"\n',
      hints: ['Sözlüklerde get(anahtar, varsayilan) eksik anahtarda hata vermez.', 'İlk get\'in varsayılanı {} olmalı ki ikinci get çalışabilsin.', 'return musteri.get("adres", {}).get("sehir", ...)'],
      why: 'Ara katmanda boş sözlük varsayılanı, zincirin sonraki halkasının her zaman bir sözlük üzerinde çalışmasını garanti eder.' },
    { id: 'ic-ice-veri-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>sehre_gore_grupla(siparisler)</code> fonksiyonunu yaz. Her sipariş <code>{"no": ..., "sehir": ..., "tutar": ...}</code> sözlüğüdür. Fonksiyon, her şehir için o şehirdeki sipariş <b>numaralarının listesini</b> tutan bir sözlük döndürsün. Numaralar geliş sırasını korusun. Örnek: <code>{"İzmir": ["AM-1", "AM-3"], "Ankara": ["AM-2"]}</code>.</p>',
      guide: ['Boş bir sonuç sözlüğü oluştur.', 'Siparişleri tek tek gez.', 'Şehir sözlükte yoksa ona boş bir liste aç (setdefault ya da if ile).', 'O şehrin listesine siparişin numarasını ekle.', 'Sözlüğü döndür.'],
      example: 'calisanlar = [("Ali", "Satış"), ("Ece", "İK"), ("Can", "Satış")]\nbolumler = {}\nfor ad, bolum in calisanlar:\n    bolumler.setdefault(bolum, []).append(ad)\nprint(bolumler)\n',
      start: 'def sehre_gore_grupla(siparisler):\n    gruplar = {}\n    for s in siparisler:\n        # TODO: şehir için liste yoksa oluştur ve numarayı ekle\n        pass\n    return gruplar\n',
      sol: 'def sehre_gore_grupla(siparisler):\n    gruplar = {}\n    for s in siparisler:\n        gruplar.setdefault(s["sehir"], []).append(s["no"])\n    return gruplar\n',
      tests: 'veri = [\n    {"no": "AM-1", "sehir": "İzmir", "tutar": 100},\n    {"no": "AM-2", "sehir": "Ankara", "tutar": 50},\n    {"no": "AM-3", "sehir": "İzmir", "tutar": 75},\n]\nsonuc = sehre_gore_grupla(veri)\nassert sonuc == {"İzmir": ["AM-1", "AM-3"], "Ankara": ["AM-2"]}, f"beklenen İzmir: [AM-1, AM-3], Ankara: [AM-2]; gelen {sonuc}"\nassert sehre_gore_grupla([]) == {}, "boş sipariş listesi için boş sözlük dönmeli"\nassert list(sonuc) == ["İzmir", "Ankara"], "şehirler ilk görülme sırasıyla gelmeli"\n',
      hints: ['Bu bir gruplama kalıbı: sözlük içinde liste biriktirirsin.', 'gruplar.setdefault(anahtar, []) listeyi döndürür; üzerine append yapabilirsin.', 'gruplar.setdefault(s["sehir"], []).append(s["no"])'],
      why: 'setdefault, "liste yoksa oluştur" ile "listeyi getir" adımlarını birleştirir; append ile o şehrin listesi büyür. gruplar[sehir] = [no] yazmak her seferinde listeyi sıfırlardı.' },
    { id: 'ic-ice-veri-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>kalemleri_duzlestir(siparisler)</code> fonksiyonunu yaz. Her siparişte <code>"no"</code> ve bir <code>"kalemler"</code> listesi var; her kalem <code>{"urun", "adet", "fiyat"}</code> taşır. Fonksiyon her kalem için bir <code>(siparis_no, urun, tutar)</code> demeti üretip hepsini tek bir listede döndürsün. Tutar = adet × fiyat.</p>',
      guide: ['Boş bir satirlar listesi aç.', 'Dış döngüyle siparişleri gez.', 'İç döngüyle o siparişin "kalemler" listesini gez.', 'Her kalemde tutarı hesapla ve (no, urun, tutar) demetini listeye ekle.', 'Listeyi döndür.'],
      example: 'subeler = [{"sehir": "İzmir", "calisanlar": ["Ali", "Ece"]}, {"sehir": "Bursa", "calisanlar": ["Can"]}]\nduz = []\nfor sb in subeler:\n    for ad in sb["calisanlar"]:\n        duz.append((sb["sehir"], ad))\nprint(duz)\n',
      start: 'def kalemleri_duzlestir(siparisler):\n    satirlar = []\n    for s in siparisler:\n        # TODO: s["kalemler"] içinde gez, her kalem için demet ekle\n        pass\n    return satirlar\n',
      sol: 'def kalemleri_duzlestir(siparisler):\n    satirlar = []\n    for s in siparisler:\n        for k in s["kalemler"]:\n            satirlar.append((s["no"], k["urun"], k["adet"] * k["fiyat"]))\n    return satirlar\n',
      tests: 'veri = [\n    {"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 50}, {"urun": "Bardak", "adet": 6, "fiyat": 10}]},\n    {"no": "AM-2", "kalemler": [{"urun": "Kahve", "adet": 1, "fiyat": 300}]},\n    {"no": "AM-3", "kalemler": []},\n]\nsonuc = kalemleri_duzlestir(veri)\nassert len(sonuc) == 3, f"üç kalem satırı bekleniyordu (kalemsiz sipariş satır üretmez), gelen {len(sonuc)}"\nassert sonuc[0] == ("AM-1", "Çay", 100), "ilk satır (\'AM-1\', \'Çay\', 100) olmalı: tutar adet × fiyat"\nassert sonuc[2] == ("AM-2", "Kahve", 300), "sipariş numarası her kalem satırına taşınmalı"\n',
      hints: ['İç içe döngü kur: dışta siparişler, içte kalemler.', 'İç döngüde dış döngünün s değişkenine hâlâ erişebilirsin.', 'satirlar.append((s["no"], k["urun"], k["adet"] * k["fiyat"]))'],
      why: 'Düzleştirmede dış kaydın alanları (sipariş no) iç döngüde her satıra kopyalanır; kalemsiz sipariş hiç satır üretmez.' },
    { id: 'ic-ice-veri-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>siparis_toplami(siparis)</code> fonksiyonunu yaz: siparişin <code>"kalemler"</code> listesindeki her kalem için <code>adet * fiyat</code> değerlerini toplayıp 2 ondalığa yuvarlanmış toplamı döndürsün. Siparişte <code>"kalemler"</code> alanı hiç yoksa 0 döndürsün.</p>',
      start: 'def siparis_toplami(siparis):\n    pass\n',
      sol: 'def siparis_toplami(siparis):\n    toplam = 0\n    for k in siparis.get("kalemler", []):\n        toplam += k["adet"] * k["fiyat"]\n    return round(toplam, 2)\n',
      tests: 'assert siparis_toplami({"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 49.95}, {"urun": "Kahve", "adet": 1, "fiyat": 350}]}) == 449.9, "2×49.95 + 1×350 = 449.9 olmalı"\nassert siparis_toplami({"no": "AM-2", "kalemler": []}) == 0, "boş kalem listesi 0 vermeli"\nassert siparis_toplami({"no": "AM-3"}) == 0, "kalemler alanı yoksa 0 dönmeli; get ile boş liste varsayılanı kullan"\n',
      hints: ['siparis.get("kalemler", []) eksik alanda boş liste verir.', 'Biriktirici: toplam += k["adet"] * k["fiyat"]'],
      why: 'get ile boş liste varsayılanı, eksik alanı "kalemsiz sipariş" gibi ele alır; döngü hiç çalışmaz ve 0 döner.' },
    { id: 'ic-ice-veri-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>derin_al(veri, yol, varsayilan=None)</code> fonksiyonunu yaz. <code>yol</code>, anahtar ve indekslerden oluşan bir listedir (ör. <code>["musteri", "adres", "sehir"]</code> ya da <code>["kalemler", 0, "urun"]</code>). Fonksiyon yolu adım adım izlesin; herhangi bir adım bulunamazsa (eksik anahtar, aralık dışı indeks, sözlük/liste olmayan bir değerin içine inme) <code>varsayilan</code> döndürsün.</p>',
      start: 'def derin_al(veri, yol, varsayilan=None):\n    pass\n',
      sol: 'def derin_al(veri, yol, varsayilan=None):\n    for adim in yol:\n        try:\n            veri = veri[adim]\n        except (KeyError, IndexError, TypeError):\n            return varsayilan\n    return veri\n',
      tests: 's = {"musteri": {"adres": {"sehir": "İzmir"}}, "kalemler": [{"urun": "Çay"}, {"urun": "Kahve"}]}\nassert derin_al(s, ["musteri", "adres", "sehir"]) == "İzmir", "sözlük yolu izlenmeli"\nassert derin_al(s, ["kalemler", 1, "urun"]) == "Kahve", "liste indeksi de yol adımı olabilir"\nassert derin_al(s, ["kalemler", 9, "urun"], "yok") == "yok", "aralık dışı indeks varsayılanı döndürmeli"\nassert derin_al(s, ["musteri", "telefon"]) is None, "eksik anahtar varsayılan None döndürmeli"\nassert derin_al(s, ["musteri", "adres", "sehir", "posta"], "yok") == "yok", "metnin içine anahtarla inilemez; varsayılan dönmeli"\nassert derin_al(s, []) is s, "boş yol verinin kendisini döndürmeli"\n',
      hints: ['Her adımda veri = veri[adim] ile bir katman aşağı in.', 'Eksik anahtar KeyError, aralık dışı indeks IndexError, metne anahtarla erişim TypeError verir; üçünü birden yakala.'],
      why: 'Tek bir döngü hem sözlük anahtarını hem liste indeksini aynı köşeli parantezle işler; olası üç hatayı yakalamak fonksiyonu kirli veriye dayanıklı yapar.' },
    { id: 'ic-ice-veri-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Market stok sözlüğü ürün koduna göre iç içe tutuluyor: <code>{"U-1": {"ad": "Çay", "stok": 10}, ...}</code>. <code>stok_dus(stok, siparis)</code> fonksiyonunu yaz: siparişin <code>"kalemler"</code> listesindeki her <code>{"kod", "adet"}</code> için ilgili ürünün stoğunu <b>yerinde</b> düşsün. Stokta olmayan bir kod gelirse o kalemi atlasın. Fonksiyon, stoğu 5\'in altına düşen ürünlerin <b>adlarını</b> (kalem sırasıyla) liste olarak döndürsün.</p>',
      start: 'def stok_dus(stok, siparis):\n    pass\n',
      sol: 'def stok_dus(stok, siparis):\n    azalan = []\n    for k in siparis["kalemler"]:\n        urun = stok.get(k["kod"])\n        if urun is None:\n            continue\n        urun["stok"] -= k["adet"]\n        if urun["stok"] < 5:\n            azalan.append(urun["ad"])\n    return azalan\n',
      tests: 'stok = {"U-1": {"ad": "Çay", "stok": 10}, "U-2": {"ad": "Kahve", "stok": 4}, "U-3": {"ad": "Şeker", "stok": 20}}\nsonuc = stok_dus(stok, {"no": "AM-9", "kalemler": [{"kod": "U-1", "adet": 7}, {"kod": "U-9", "adet": 1}, {"kod": "U-3", "adet": 2}]})\nassert stok["U-1"]["stok"] == 3, "Çay stoğu 10-7=3 olmalı; iç sözlüğü yerinde güncelle"\nassert stok["U-3"]["stok"] == 18, "Şeker stoğu 20-2=18 olmalı"\nassert stok["U-2"]["stok"] == 4, "siparişte olmayan ürün değişmemeli"\nassert sonuc == ["Çay"], f"yalnız Çay 5\'in altına düştü; gelen {sonuc}"\nassert stok_dus(stok, {"kalemler": []}) == [], "boş siparişte boş liste dönmeli"\n',
      hints: ['stok.get(kod) ürün yoksa None döndürür; None ise continue ile atla.', 'urun = stok[kod] iç sözlüğün kendisidir; urun["stok"] -= adet orijinali değiştirir.'],
      why: 'Sözlükten aldığın iç sözlük kopya değil aynı nesnedir; onun üzerindeki değişiklik dış yapıya yansır. Bu sefer istenen davranış tam olarak bu.' },
    { id: 'ic-ice-veri-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>tablo_yazdir(satirlar)</code> fonksiyonunu yaz. <code>satirlar</code>, <code>{"no", "urun", "tutar"}</code> sözlüklerinin listesidir. Fonksiyon şu biçimde yazdırsın: başlık satırı, 28 tireli çizgi, her satır, yine çizgi ve toplam. Sipariş sütunu 8, ürün sütunu 10 karakter sola yaslı; tutar 8 karakter sağa yaslı ve 2 ondalık; sütunlar arasında birer boşluk. Toplam satırında <code>TOPLAM</code> 19 karakter sola yaslı, ardından boşluk ve 8 karakter sağa yaslı toplam.</p><pre class="out">Sipariş  Ürün          Tutar\n----------------------------\nAM-101   Çay          240.00\nAM-101   Bardak       150.00\nAM-102   Kahve        350.00\n----------------------------\nTOPLAM                740.00</pre><p>Program sonunda fonksiyonu verilen örnek veriyle çağır.</p>',
      start: 'def tablo_yazdir(satirlar):\n    pass\n\nveri = [\n    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},\n    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},\n    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},\n]\ntablo_yazdir(veri)\n',
      sol: 'def tablo_yazdir(satirlar):\n    print(f"{\'Sipariş\':<8} {\'Ürün\':<10} {\'Tutar\':>8}")\n    print("-" * 28)\n    toplam = 0\n    for r in satirlar:\n        print(f"{r[\'no\']:<8} {r[\'urun\']:<10} {r[\'tutar\']:>8.2f}")\n        toplam += r["tutar"]\n    print("-" * 28)\n    print(f"{\'TOPLAM\':<19} {toplam:>8.2f}")\n\nveri = [\n    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},\n    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},\n    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},\n]\ntablo_yazdir(veri)\n',
      expect: 'Sipariş  Ürün          Tutar\n----------------------------\nAM-101   Çay          240.00\nAM-101   Bardak       150.00\nAM-102   Kahve        350.00\n----------------------------\nTOPLAM                740.00\n',
      hints: ['f"{deger:&lt;8}" sola, f"{deger:>8.2f}" sağa yaslar ve 2 ondalık verir.', 'f-string içinde anahtar yazarken tek tırnak kullan: f"{r[\'no\']:&lt;8}"'],
      why: 'Genişlik ve hizalama belirteçleri, sütunları değer uzunluğundan bağımsız hizalar; metin sola, sayı sağa yaslanır.' },
    { id: 'ic-ice-veri-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>kampanyali_katalog(katalog, oran)</code> kataloğun bir kopyasında tüm fiyatları verilen oranda indirip kopyayı döndürmeli; <b>orijinal katalog asla değişmemeli</b>. Fonksiyon kopya alıyor gibi görünüyor ama canlı fiyatlar da düşüyor.</p>',
      start: 'def kampanyali_katalog(katalog, oran):\n    yeni = katalog.copy()\n    for kod, urun in yeni.items():\n        urun["fiyat"] = round(urun["fiyat"] * (1 - oran), 2)\n    return yeni\n',
      sol: 'import copy\n\ndef kampanyali_katalog(katalog, oran):\n    yeni = copy.deepcopy(katalog)\n    for kod, urun in yeni.items():\n        urun["fiyat"] = round(urun["fiyat"] * (1 - oran), 2)\n    return yeni\n',
      tests: 'katalog = {"U-1": {"ad": "Çay", "fiyat": 100.0}, "U-2": {"ad": "Kahve", "fiyat": 300.0}}\nkampanya = kampanyali_katalog(katalog, 0.2)\nassert kampanya["U-1"]["fiyat"] == 80.0, "kampanyalı Çay 80.0 olmalı"\nassert kampanya["U-2"]["fiyat"] == 240.0, "kampanyalı Kahve 240.0 olmalı"\nassert katalog["U-1"]["fiyat"] == 100.0, "orijinal Çay fiyatı 100.0 kalmalı: copy() iç sözlükleri paylaşır, deepcopy gerekir"\nassert kampanya["U-1"] is not katalog["U-1"], "iç sözlükler de bağımsız olmalı"\n',
      hints: ['copy() yalnızca dış sözlüğü kopyalar; ürün sözlükleri iki katalogda ortaktır.', 'import copy ve copy.deepcopy(katalog) kullan.'],
      why: 'Sığ kopyada iç sözlükler paylaşılır; urun["fiyat"] ataması orijinal ürün sözlüğünü değiştirir. deepcopy her katmanı yeniden oluşturur.' },
    { id: 'ic-ice-veri-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>musteri_siparisleri(siparisler)</code> her müşteri için sipariş tutarlarının listesini döndürmeli: <code>{"Ayşe": [100, 40], "Mehmet": [75]}</code>. Ama her müşteride yalnızca <b>son</b> tutar kalıyor.</p>',
      start: 'def musteri_siparisleri(siparisler):\n    sonuc = {}\n    for s in siparisler:\n        sonuc[s["musteri"]] = [s["tutar"]]\n    return sonuc\n',
      sol: 'def musteri_siparisleri(siparisler):\n    sonuc = {}\n    for s in siparisler:\n        sonuc.setdefault(s["musteri"], []).append(s["tutar"])\n    return sonuc\n',
      tests: 'veri = [{"musteri": "Ayşe", "tutar": 100}, {"musteri": "Mehmet", "tutar": 75}, {"musteri": "Ayşe", "tutar": 40}]\nsonuc = musteri_siparisleri(veri)\nassert sonuc["Ayşe"] == [100, 40], f"Ayşe\'nin iki siparişi birikmeli; gelen {sonuc[\'Ayşe\']}"\nassert sonuc["Mehmet"] == [75], "Mehmet\'in tek siparişi olmalı"\n',
      hints: ['sonuc[anahtar] = [deger] her seferinde yeni liste kurup eskisini siler.', 'Liste varsa ona ekle, yoksa oluştur: setdefault(..., []).append(...)'],
      why: 'Atama listeyi her turda sıfırlar; gruplamada mevcut listeye append yapmak gerekir.' },
    { id: 'ic-ice-veri-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><code>sehir_ciro_raporu(musteriler)</code> fonksiyonunu yaz. Her müşteri şu biçimdedir ama alanlar eksik ya da None olabilir:</p><pre class="out">{"ad": "Ayşe", "adres": {"sehir": "İzmir"},\n "siparisler": [{"durum": "teslim", "kalemler": [{"adet": 2, "fiyat": 50.0}]}]}</pre><p>Kurallar: şehir yoksa (adres eksik, adres None ya da şehir eksik) <code>"Bilinmiyor"</code> kullan; <code>"durum"</code> değeri <code>"iptal"</code> olan siparişleri sayma; siparişler ya da kalemler eksikse boş say. Sonuç, şehir → toplam ciro (2 ondalık) sözlüğü olsun ve <b>ciroya göre büyükten küçüğe</b> sıralı olsun. Cirosu 0 olan şehirler de rapora girsin.</p>',
      start: 'def sehir_ciro_raporu(musteriler):\n    pass\n',
      sol: 'def sehir_ciro_raporu(musteriler):\n    ciro = {}\n    for m in musteriler:\n        sehir = (m.get("adres") or {}).get("sehir") or "Bilinmiyor"\n        toplam = 0\n        for s in m.get("siparisler") or []:\n            if s.get("durum") == "iptal":\n                continue\n            for k in s.get("kalemler") or []:\n                toplam += k["adet"] * k["fiyat"]\n        ciro[sehir] = ciro.get(sehir, 0) + toplam\n    sirali = sorted(ciro.items(), key=lambda x: x[1], reverse=True)\n    return {s: round(t, 2) for s, t in sirali}\n',
      tests: 'veri = [\n    {"ad": "Ayşe", "adres": {"sehir": "İzmir"}, "siparisler": [\n        {"durum": "teslim", "kalemler": [{"adet": 2, "fiyat": 50.0}]},\n        {"durum": "iptal", "kalemler": [{"adet": 1, "fiyat": 999.0}]}]},\n    {"ad": "Mehmet", "adres": {"sehir": "Ankara"}, "siparisler": [\n        {"kalemler": [{"adet": 1, "fiyat": 300.0}, {"adet": 3, "fiyat": 10.1}]}]},\n    {"ad": "Zeynep", "adres": None, "siparisler": [{"durum": "teslim", "kalemler": [{"adet": 1, "fiyat": 40.0}]}]},\n    {"ad": "Can", "adres": {"sehir": "İzmir"}},\n    {"ad": "Ece", "adres": {"ilce": "Nilüfer"}, "siparisler": None},\n    {"ad": "Deniz", "adres": {"sehir": "Bursa"}, "siparisler": [{"durum": "iptal", "kalemler": [{"adet": 5, "fiyat": 10.0}]}]},\n]\nr = sehir_ciro_raporu(veri)\nassert r.get("İzmir") == 100.0, f"İzmir 100.0 olmalı (iptal sayılmaz, siparişsiz müşteri 0 ekler); gelen {r.get(\'İzmir\')}"\nassert r.get("Ankara") == 330.3, f"Ankara 300 + 3×10.1 = 330.3 olmalı; gelen {r.get(\'Ankara\')}"\nassert r.get("Bilinmiyor") == 40.0, "adres None ya da şehir eksikse \'Bilinmiyor\' altında toplanmalı"\nassert r.get("Bursa") == 0, "yalnız iptal siparişi olan şehir 0 ile rapora girmeli"\nassert list(r) == ["Ankara", "İzmir", "Bilinmiyor", "Bursa"], f"ciroya göre azalan sıralı olmalı; gelen {list(r)}"\nassert sehir_ciro_raporu([]) == {}, "boş girdi boş sözlük vermeli"\n',
      hints: ['None olabilen ara katman için (m.get("adres") or {}) kalıbı; siparişler için (m.get("siparisler") or []).', 'Önce şehir → toplam sözlüğünü kur, sonra sorted(ciro.items(), key=lambda x: x[1], reverse=True) ile sırala ve yeni sözlüğe aktar.', 'Sözlükler ekleme sırasını korur; sıralı demetlerden kurulan sözlük de sıralı kalır.'],
      why: 'or kalıbı hem eksik anahtarı hem None değeri aynı yoldan karşılar; iptal filtresi iç döngüden önce continue ile uygulanır; sıralama için sözlük, değere göre sıralanmış demetlerden yeniden kurulur.' },
    { id: 'ic-ice-veri-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market verisi normalize tutuluyor: <code>musteriler</code> (müşteri no → bilgi), <code>urunler</code> (ürün kodu → bilgi) ve <code>siparisler</code> (yalnız kodları taşıyan liste). İki fonksiyon yaz:</p><ul><li><code>zenginlestir(siparisler, musteriler, urunler)</code>: her sipariş kalemi için <code>{"no", "musteri", "sehir", "urun", "kategori", "tutar"}</code> sözlüğü üreten düz bir liste döndürsün. Tutar = adet × ürün fiyatı. Bilinmeyen müşteri için müşteri ve şehir <code>"?"</code> olsun; bilinmeyen ürün kodlu kalemleri atla.</li><li><code>kategori_ozeti(satirlar)</code>: zenginleştirilmiş satırlardan kategori → toplam tutar (2 ondalık) sözlüğü döndürsün.</li></ul>',
      start: 'musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}\nurunler = {\n    "U-1": {"ad": "Çay", "kategori": "İçecek", "fiyat": 120.0},\n    "U-2": {"ad": "Bardak", "kategori": "Mutfak", "fiyat": 25.0},\n    "U-3": {"ad": "Kahve", "kategori": "İçecek", "fiyat": 350.0},\n}\nsiparisler = [\n    {"no": "AM-1", "musteri_no": "M-1", "kalemler": [{"kod": "U-1", "adet": 2}, {"kod": "U-2", "adet": 6}]},\n    {"no": "AM-2", "musteri_no": "M-2", "kalemler": [{"kod": "U-3", "adet": 1}, {"kod": "U-404", "adet": 1}]},\n    {"no": "AM-3", "musteri_no": "M-9", "kalemler": [{"kod": "U-1", "adet": 1}]},\n]\n\ndef zenginlestir(siparisler, musteriler, urunler):\n    # TODO\n    pass\n\ndef kategori_ozeti(satirlar):\n    # TODO\n    pass\n',
      sol: 'musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}\nurunler = {\n    "U-1": {"ad": "Çay", "kategori": "İçecek", "fiyat": 120.0},\n    "U-2": {"ad": "Bardak", "kategori": "Mutfak", "fiyat": 25.0},\n    "U-3": {"ad": "Kahve", "kategori": "İçecek", "fiyat": 350.0},\n}\nsiparisler = [\n    {"no": "AM-1", "musteri_no": "M-1", "kalemler": [{"kod": "U-1", "adet": 2}, {"kod": "U-2", "adet": 6}]},\n    {"no": "AM-2", "musteri_no": "M-2", "kalemler": [{"kod": "U-3", "adet": 1}, {"kod": "U-404", "adet": 1}]},\n    {"no": "AM-3", "musteri_no": "M-9", "kalemler": [{"kod": "U-1", "adet": 1}]},\n]\n\ndef zenginlestir(siparisler, musteriler, urunler):\n    satirlar = []\n    for s in siparisler:\n        m = musteriler.get(s["musteri_no"], {})\n        for k in s["kalemler"]:\n            u = urunler.get(k["kod"])\n            if u is None:\n                continue\n            satirlar.append({\n                "no": s["no"],\n                "musteri": m.get("ad", "?"),\n                "sehir": m.get("sehir", "?"),\n                "urun": u["ad"],\n                "kategori": u["kategori"],\n                "tutar": k["adet"] * u["fiyat"],\n            })\n    return satirlar\n\ndef kategori_ozeti(satirlar):\n    ozet = {}\n    for r in satirlar:\n        ozet[r["kategori"]] = ozet.get(r["kategori"], 0) + r["tutar"]\n    return {k: round(v, 2) for k, v in ozet.items()}\n',
      tests: 'satirlar = zenginlestir(siparisler, musteriler, urunler)\nassert isinstance(satirlar, list) and len(satirlar) == 4, f"4 satır bekleniyordu (U-404 atlanır); gelen {satirlar if satirlar is None else len(satirlar)}"\nassert satirlar[0] == {"no": "AM-1", "musteri": "Ayşe", "sehir": "İzmir", "urun": "Çay", "kategori": "İçecek", "tutar": 240.0}, f"ilk satır hatalı: {satirlar[0]}"\nassert satirlar[3]["musteri"] == "?" and satirlar[3]["sehir"] == "?", "bilinmeyen müşteri (M-9) için \'?\' kullanılmalı"\nassert all(r["urun"] != "U-404" for r in satirlar), "bilinmeyen ürün kodu atlanmalı"\nozet = kategori_ozeti(satirlar)\nassert ozet == {"İçecek": 710.0, "Mutfak": 150.0}, f"İçecek 240+350+120=710, Mutfak 150 olmalı; gelen {ozet}"\nassert kategori_ozeti([]) == {}, "boş satır listesi boş özet vermeli"\n',
      hints: ['Normalize veride kodla sözlükten bulursun: musteriler.get(s["musteri_no"], {}).', 'Ürün None ise continue; değilse tüm alanları tek sözlükte topla.', 'Özet için sayım kalıbının toplama versiyonu: ozet[k] = ozet.get(k, 0) + tutar.'],
      why: 'Bu, SQL\'deki JOIN + GROUP BY\'ın Python karşılığıdır: kodları sözlükten çözüp düz satırlar üretir, sonra bir alana göre toplarsın.' }
  ],
  faq: [
    { q: 'Ne zaman liste içinde sözlük, ne zaman sözlük içinde sözlük kullanmalıyım?',
      a: 'Kayıtları sırayla gezeceksen ve sıra önemliyse liste içinde sözlük (kayıt listesi) kullan. Kayıtlara bir kimlikle (müşteri no, ürün kodu) hızlıca erişeceksen sözlük içinde sözlük kullan: <code>urunler["U-1"]</code> listede arama yapmadan anında bulur.' },
    { q: 'get zinciri mi, try/except mi?',
      a: 'Bir iki katmanlı ve eksikliğin normal olduğu durumlarda get zinciri okunur ve kısadır. Çok derin yollarda ya da liste indeksleri de işin içindeyse derin_al gibi try/except kullanan küçük bir yardımcı fonksiyon daha temizdir.' },
    { q: 'deepcopy her zaman kullanılsa daha güvenli olmaz mı?',
      a: 'Güvenlidir ama yavaştır ve bellek harcar; büyük yapılarda her şeyi kopyalar. Yapın düzse (elemanlar sayı ya da metin) copy() yeter. İç katmanları değiştireceksen deepcopy kullan.' },
    { q: 'İç içe yapıyı ekranda düzgün görmenin en hızlı yolu ne?',
      a: '<code>from pprint import pprint</code> ile <code>pprint(veri)</code> ya da <code>print(json.dumps(veri, indent=2, ensure_ascii=False))</code>. İkincisi Türkçe karakterleri de bozmadan gösterir.' }
  ],
  mistakes: [
    { why: 'Adres yoksa ilk get None döndürür ve None.get AttributeError verir; ara adıma boş sözlük varsayılanı ver.',
      bad: 'sehir = m.get("adres").get("sehir")',
      good: 'sehir = m.get("adres", {}).get("sehir", "Bilinmiyor")' },
    { why: 'Atama listeyi her turda sıfırlar; gruplamada mevcut listeye ekleme yapılır.',
      bad: 'for s in siparisler:\n    gruplar[s["sehir"]] = [s["no"]]',
      good: 'for s in siparisler:\n    gruplar.setdefault(s["sehir"], []).append(s["no"])' },
    { why: 'copy() sığdır; iç sözlükler paylaşılır ve orijinal fiyat da değişir.',
      bad: 'yedek = katalog.copy()\nyedek["U-1"]["fiyat"] = 0',
      good: 'import copy\nyedek = copy.deepcopy(katalog)\nyedek["U-1"]["fiyat"] = 0' },
    { why: 'Listeyi çarpmak aynı iç listeyi üç kez koyar; bir hücreyi değiştirmek tüm satırları değiştirir.',
      bad: 'tablo = [[0] * 3] * 3\ntablo[0][0] = 1',
      good: 'tablo = [[0] * 3 for _ in range(3)]\ntablo[0][0] = 1' },
    { why: 'kalemler bir listedir; önce indeksle bir kalem seçmeden anahtar kullanılamaz (TypeError).',
      bad: 'print(siparis["kalemler"]["urun"])',
      good: 'print(siparis["kalemler"][0]["urun"])' }
  ] }
);
})(window);
