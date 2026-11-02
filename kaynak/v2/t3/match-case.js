/* Kesit Python v2 — match-case */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'match-case',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 35,
  title: 'match-case: yapısal desen eşleme',
  sum: 'Python 3.10 ile gelen match-case ile değer, birleşik, dizi, sözlük ve sınıf desenlerini; guard ve yakalamayı öğrenir, komut ayrıştırıcı ve banka işlem yönlendirici yazarsın.',
  goals: ['match-case ile değer desenleri, | birleşik desenler ve _ jokeriyle çoklu dallanma yazabilirim.', 'Yakalama (capture) desenini ve "her şeyi yakalayan ad" tuzağını açıklayabilirim.', 'Dizi desenleriyle ([komut, *arg]) metin komutlarını ayrıştırabilirim.', 'Sözlük ve sınıf desenleriyle JSON benzeri mesajları ve dataclass nesnelerini yönlendirebilirim.', 'Bir problemde match mi if/elif mi kullanacağıma gerekçeyle karar verebilirim.'],
  body: `
<h2>Neden yeni bir dallanma aracı?</h2>
<p>Koşullar dersinde <code>match</code>'i kısaca gördün: bir değeri birkaç sabitle karşılaştırmanın düzenli yolu. Ama <code>match</code> aslında bundan çok daha güçlüdür. Adı <b>yapısal desen eşleme</b> (structural pattern matching): yalnızca "değer şuna eşit mi" diye sormaz, "veri <b>şu şekilde</b> mi" diye sorar ve şekle uyuyorsa parçalarını tek hamlede değişkenlere ayırır.</p>
<p>Ilgaz Bank'ın işlem kuyruğunu düşün. Kuyruğa gelen her mesaj bir sözlüktür ama türü farklıdır: havalede alıcı IBAN'ı ve tutar vardır, fatura ödemesinde kurum kodu, kart işleminde kart numarası ve taksit sayısı. if/elif ile yazarsan her dalda önce türü kontrol eder, sonra anahtarların var olup olmadığına bakar, sonra değerleri tek tek çekersin. <code>match</code> bunların üçünü tek satırda yapar.</p>

<h2>Temel söz dizimi ve değer desenleri</h2>
<pre class="py">def kargo_durumu(kod):
    match kod:
        case "H":
            return "Hazırlanıyor"
        case "K":
            return "Kargoda"
        case "T":
            return "Teslim edildi"
        case _:
            return "Bilinmeyen kod"

for k in ["H", "T", "X"]:
    print(k, "→", kargo_durumu(k))</pre>
<p><code>match</code>'ten sonraki ifadeye <b>konu</b> (subject) denir. Her <code>case</code> bir <b>desen</b> (pattern) taşır; desenler yukarıdan aşağıya denenir ve <b>ilk eşleşen</b> çalışır, sonrakilere bakılmaz. C ya da Java'daki <code>switch</code>'ten farklı olarak "düşme" (fall-through) yoktur, <code>break</code> yazmazsın. <code>_</code> joker (wildcard) desendir: her şeyle eşleşir, bu yüzden en sona konur ve <code>else</code> görevini görür. Hiçbir desen eşleşmezse ve <code>_</code> yoksa <code>match</code> sessizce hiçbir şey yapmaz.</p>
<p>Değer desenleri (literal patterns) sayı, metin, <code>True</code>, <code>False</code> ve <code>None</code> olabilir. Sayılarda <code>==</code> ile, <code>True/False/None</code>'da <code>is</code> ile karşılaştırılır.</p>

<h2>Birleşik desen: |</h2>
<p>Birkaç değer aynı sonuca gidiyorsa onları <code>|</code> ("veya") ile birleştirirsin.</p>
<pre class="py">def gun_tipi(gun):
    match gun.lower():
        case "cumartesi" | "pazar":
            return "Hafta sonu: şube kapalı"
        case "pazartesi" | "salı" | "çarşamba" | "perşembe" | "cuma":
            return "İş günü"
        case _:
            return "Geçersiz gün"

print(gun_tipi("Pazar"))
print(gun_tipi("salı"))
print(gun_tipi("bayram"))</pre>

<h2>Yakalama deseni ve en önemli tuzak</h2>
<p>Desende tırnaksız, noktasız bir <b>ad</b> yazarsan Python onu karşılaştırılacak bir değer olarak değil, <b>yakalanacak bir değişken</b> olarak görür. Yakalama deseni (capture pattern) her şeyle eşleşir ve konuyu o ada bağlar.</p>
<pre class="py">ONAY = "onay"

def durum_eski(durum):
    match durum:
        case "iptal":
            return "İptal"
        case ONAY:                 # DİKKAT: bu bir karşılaştırma DEĞİL
            return "Onaylandı (" + ONAY + ")"

print(durum_eski("onay"))
print(durum_eski("beklemede"))     # yanlışlıkla "Onaylandı" der!</pre>
<p><code>case ONAY:</code> satırı "durum ONAY'a eşit mi" diye sormaz; "ne gelirse gelsin, adı ONAY olsun" der. İkinci çağrıda <code>"beklemede"</code> bu dala girer ve ONAY artık <code>"beklemede"</code>dir. Arkasından başka bir <code>case</code> yazsaydın Python bunu fark edip SyntaxError verirdi; en sonda olduğu için sessizce yanlış çalışır.</p>
<div class="warn"><b>Sabitle karşılaştırmak için nokta gerekir</b>Bir sabitle karşılaştırmak istiyorsan ya değeri doğrudan yaz (<code>case "onay":</code>) ya da <b>noktalı ad</b> kullan: <code>case Durum.ONAY:</code>. Noktalı adlar (sınıf özelliği, enum üyesi, modül sabiti) değer deseni sayılır. Düz ad her zaman yakalamadır.</div>

<h2>Guard: desene ek koşul</h2>
<p>Bazen şekil yetmez, değere bir koşul da koymak istersin. <code>case desen if koşul:</code> yazımına <b>guard</b> (koruma) denir. Desen eşleşir, değişkenler bağlanır, sonra koşul denetlenir; koşul yanlışsa sıradaki <code>case</code>'e geçilir.</p>
<pre class="py">def tutar_sinifi(tutar):
    match tutar:
        case 0:
            return "Boş işlem"
        case t if t &lt; 0:
            return "İade"
        case t if t &gt;= 50_000:
            return "Yüksek tutar: onay gerekir"
        case _:
            return "Normal"

for t in [0, -120, 75_000, 900]:
    print(t, tutar_sinifi(t))</pre>
<p>Guard'lı dallarda sıra önemlidir: daha özel koşulu üste yaz. Genel bir desen (<code>case t:</code>) üstte kalırsa altındaki özel dallar hiç çalışmaz.</p>

<h2>Dizi desenleri: komut ayrıştırıcı</h2>
<p>Konu bir liste ya da demetse eleman sayısına ve elemanlara göre eşleştirebilirsin. <code>[x, y]</code> tam iki elemanlı dizilerle eşleşir ve elemanları <code>x</code> ile <code>y</code>'ye bağlar. <code>*rest</code> "geri kalanların hepsi" demektir (demet açmadaki yıldızlı ad gibi).</p>
<pre class="py">def komut(satir):
    match satir.split():
        case []:
            return "Boş komut"
        case ["yardım"] | ["help"]:
            return "Komutlar: ekle, sil, listele"
        case ["listele"]:
            return "Sepet listeleniyor"
        case ["ekle", urun]:
            return f"{urun} sepete eklendi (1 adet)"
        case ["ekle", urun, adet] if adet.isdigit():
            return f"{urun} sepete eklendi ({adet} adet)"
        case ["sil", *urunler] if urunler:
            return f"Silindi: {', '.join(urunler)}"
        case [bilinmeyen, *_]:
            return f"Bilinmeyen komut: {bilinmeyen}"

for s in ["", "help", "ekle çay", "ekle çay 3", "ekle çay üç", "sil çay kahve", "uç"]:
    print(repr(s), "→", komut(s))</pre>
<p>Bu örnekte birçok kavram birlikte çalışıyor: <code>[]</code> boş listeyle, <code>["yardım"] | ["help"]</code> iki tek elemanlı listeden biriyle eşleşir; <code>urun</code> ve <code>adet</code> yakalanır; guard (<code>adet.isdigit()</code>) "üç" gibi geçersiz adedi dışarıda bırakır ve son dala düşürür. <code>*_</code> geri kalanı yakalamadan yok sayar.</p>
<div class="note"><b>Metin dizi deseniyle eşleşmez</b>Metin teknik olarak bir dizi olsa da <code>match "abc": case [a, b, c]:</code> eşleşmez; Python bu karışıklığı önlemek için str, bytes ve bytearray'i dizi desenlerinden hariç tutar. Metni parçalara ayırmak istiyorsan önce <code>split()</code> ile listeye çevir.</div>

<h2>Sözlük desenleri: banka işlem yönlendirme</h2>
<p>JSON benzeri mesajlar için en kullanışlı desen budur. <code>{"tip": "havale", "tutar": t}</code> deseni, konu bir sözlükse, <code>"tip"</code> anahtarı <code>"havale"</code> ise ve <code>"tutar"</code> anahtarı varsa eşleşir; tutarı <code>t</code>'ye bağlar. Desende yazmadığın <b>fazladan anahtarlar yok sayılır</b>; bu, sürekli alan eklenen gerçek mesajlarla çalışırken çok işe yarar.</p>
<pre class="py">def yonlendir(islem):
    match islem:
        case {"tip": "havale", "tutar": t, "alici": alici} if t &gt; 50_000:
            return f"Uyum ekibine: {alici} için {t} TL havale"
        case {"tip": "havale" | "eft", "tutar": t, "alici": alici}:
            return f"Transfer: {alici} ← {t} TL"
        case {"tip": "fatura", "kurum": kurum, "tutar": t}:
            return f"Fatura ödemesi: {kurum} {t} TL"
        case {"tip": "kart", "taksit": int(n)} if n &gt; 1:
            return f"Taksitli kart işlemi ({n} taksit)"
        case {"tip": "kart"}:
            return "Tek çekim kart işlemi"
        case {"tip": tip}:
            return f"Desteklenmeyen işlem türü: {tip}"
        case _:
            return "Geçersiz mesaj"

islemler = [
    {"tip": "havale", "tutar": 75_000, "alici": "TR12", "kanal": "mobil"},
    {"tip": "eft", "tutar": 1_200, "alici": "TR34"},
    {"tip": "fatura", "kurum": "Su", "tutar": 310},
    {"tip": "kart", "taksit": 6},
    {"tip": "kart", "taksit": 1},
    {"tip": "kripto"},
    ["havale", 100],
]
for i in islemler:
    print(yonlendir(i))</pre>
<p>Desenler iç içe girebilir: <code>"havale" | "eft"</code> bir sözlük deseninin içinde birleşik desendir, <code>int(n)</code> ise "değer int olsun ve n'ye bağlansın" diyen bir sınıf desenidir. Liste olarak gelen son mesaj hiçbir sözlük deseniyle eşleşmez ve joker dala düşer. Geri kalan anahtarları toplamak istersen <code>**diger</code> yazabilirsin: <code>case {"tip": "havale", **diger}:</code>.</p>
<div class="tip"><b>as ile alt deseni adlandır</b><code>case {"tip": ("havale" | "eft") as tur, "tutar": t}:</code> yazarsan hangi alternatifin eşleştiğini <code>tur</code> değişkeninde bulursun. <code>as</code>, bir desenin tamamını bir ada bağlar.</div>

<h2>Sınıf desenleri: dataclass ile</h2>
<p>Konu bir nesneyse türüne ve özelliklerine göre eşleştirebilirsin. <code>int()</code>, <code>str()</code>, <code>float()</code> gibi yerleşik türler zaten sınıf desenidir. Kendi sınıfların için en kolay yol <code>dataclass</code>'tır (orta seviyede ayrıntılı göreceksin; burada yalnızca kısa bir kayıt tanımlamak için kullanıyoruz). dataclass, alanlarını sırayla desene açar; böylece konumsal yazabilirsin.</p>
<pre class="py">from dataclasses import dataclass

@dataclass
class Havale:
    alici: str
    tutar: float

@dataclass
class Fatura:
    kurum: str
    tutar: float

def ozet(islem):
    match islem:
        case Havale(alici, tutar) if tutar &gt; 10_000:
            return f"Büyük havale → {alici}"
        case Havale(alici=a):
            return f"Havale → {a}"
        case Fatura(kurum="Elektrik" | "Doğalgaz", tutar=t):
            return f"Enerji faturası: {t}"
        case Fatura():
            return "Diğer fatura"
        case int() | float() as tutar:
            return f"Ham tutar: {tutar}"
        case _:
            return "Tanınmadı"

for i in [Havale("TR12", 25_000), Havale("TR34", 50), Fatura("Elektrik", 640.5), Fatura("Su", 90), 42, "x"]:
    print(ozet(i))</pre>
<p><code>Havale(alici, tutar)</code> konumsal, <code>Havale(alici=a)</code> anahtar sözcüklü yazımdır. <code>Fatura()</code> boş parantezle "türü Fatura olsun, alanları önemli değil" demektir. Parantezsiz <code>case Fatura:</code> yazmak ise yine yakalama tuzağıdır.</p>

<h2>match mi if/elif mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Bir değeri birkaç sabitle karşılaştırmak</td><td>İkisi de olur</td><td>3-4 dalda if/elif yeterince açık; daha fazlasında match okunur</td></tr>
<tr><td>Aralık ve eşik (tutar &gt;= 500)</td><td>if/elif</td><td>match'te her dal guard ister, kazanç yok</td></tr>
<tr><td>Birden fazla değişkene bağlı karmaşık mantık</td><td>if/elif</td><td>match tek bir konu üzerine kuruludur</td></tr>
<tr><td>Listenin uzunluğuna ve elemanlarına göre dallanma</td><td>match</td><td>Uzunluk kontrolü ve açma tek desende</td></tr>
<tr><td>JSON/sözlük mesajın türüne göre yönlendirme</td><td>match</td><td>Anahtar varlığı, değer ve çekme bir arada</td></tr>
<tr><td>Nesnenin türüne ve alanlarına göre işlem</td><td>match</td><td>isinstance + özellik okuma tek satırda</td></tr>
<tr><td>Python 3.9 ve öncesini desteklemesi gereken kod</td><td>if/elif</td><td>match 3.10'da geldi; eski sürümde SyntaxError</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bir bankanın ya da e-ticaret sitesinin arka planında olay güdümlü (event-driven) sistemler çalışır: mesaj kuyruğundan "sipariş_oluştu", "ödeme_alındı", "iade_talebi" gibi türü farklı JSON olaylar gelir ve her biri farklı bir işleyiciye yönlendirilir. Webhook alıcıları, sohbet botlarının komut ayrıştırıcıları, CLI araçları ve basit yorumlayıcılar da aynı işi yapar. Bu kodu match ile yazmak, kod incelemesinde "hangi mesaj nereye gidiyor" sorusunu tek bakışta yanıtlatır; yeni bir olay türü eklemek tek bir case eklemektir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Desen türlerinin özeti</h3>
<div class="tbl-wrap"><table>
<tr><th>Desen</th><th>Örnek</th><th>Eşleşir</th></tr>
<tr><td>Değer</td><td><code>case 404:</code></td><td>Konu 404'e eşitse</td></tr>
<tr><td>Noktalı değer</td><td><code>case Durum.ONAY:</code></td><td>Sabite eşitse</td></tr>
<tr><td>Yakalama</td><td><code>case x:</code></td><td>Her zaman; x'e bağlar</td></tr>
<tr><td>Joker</td><td><code>case _:</code></td><td>Her zaman; bağlamaz</td></tr>
<tr><td>Birleşik</td><td><code>case 301 | 302:</code></td><td>Alternatiflerden biri</td></tr>
<tr><td>Dizi</td><td><code>case [x, *rest]:</code></td><td>En az bir elemanlı liste/demet</td></tr>
<tr><td>Sözlük</td><td><code>case {"tip": t}:</code></td><td>"tip" anahtarı olan sözlük</td></tr>
<tr><td>Sınıf</td><td><code>case Havale(tutar=t):</code></td><td>Havale örneği</td></tr>
<tr><td>as</td><td><code>case [_, _] as cift:</code></td><td>Desen + tümünü bağlama</td></tr>
</table></div>
<h3>Enum ile güvenli sabitler</h3>
<p>Durum kodlarını metin olarak dağıtmak yerine <code>enum.Enum</code> tanımlarsan hem yazım hatası riskini azaltır hem de noktalı adla güvenle eşleştirirsin.</p>
<pre class="py">from enum import Enum

class Durum(Enum):
    BEKLIYOR = "bekliyor"
    ONAY = "onay"
    RED = "red"

def mesaj(d):
    match d:
        case Durum.ONAY:
            return "Kredi onaylandı"
        case Durum.RED:
            return "Başvuru reddedildi"
        case Durum.BEKLIYOR:
            return "İnceleniyor"

print(mesaj(Durum("onay")), "|", mesaj(Durum.BEKLIYOR))</pre>
<h3>Performans ve sınırlar</h3>
<p>match bir "atlama tablosu" değildir; desenler sırayla denenir, yani if/elif zincirinden hızlı değildir. Avantajı hız değil okunabilirlik ve doğruluktur. Yüzlerce sabit değere göre dallanıyorsan sözlükle eşleme (<code>{"H": "Hazırlanıyor", ...}.get(kod)</code>) hem daha hızlı hem daha kısadır. Ayrıca derleyici, eksik dalları (exhaustiveness) denetlemez; tüm durumları kapsadığından emin olmak için sonda <code>case _:</code> ile açıkça hata fırlatmak iyi bir alışkanlıktır.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>LIMIT = 100</code> tanımlıyken <code>match x:</code> içinde <code>case LIMIT:</code> yazılırsa ne olur?',
      o: ['Yalnızca x == 100 olduğunda eşleşir', 'Her değerle eşleşir, değeri LIMIT adına bağlar', 'LIMIT tanımlı olduğu için NameError verir', 'x ile LIMIT aynı türdeyse eşleşir'],
      a: 1,
      why: 'Desende düz bir ad yakalama desenidir; karşılaştırma yapmaz, her şeyle eşleşir. Sabitle karşılaştırmak için değeri doğrudan yazmak ya da noktalı ad (Ayar.LIMIT) kullanmak gerekir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Konu <code>["sil", "çay", "kahve"]</code> listesiyken aşağıdaki desenlerden hangisi eşleşir?',
      o: ['case ["sil", urun]:', 'case ["sil"]:', 'case ["sil", *urunler]:', 'case {"sil": urunler}:'],
      a: 2,
      why: '["sil", urun] tam iki, ["sil"] tam bir elemanlı listeyle eşleşir. *urunler kalan tüm elemanları (["çay", "kahve"]) toplar. Sözlük deseni listeyle eşleşmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Guard sırasına dikkat: bu kod ne yazdırır?',
      code: 'def sinif(t):\n    match t:\n        case x if x > 100:\n            return "büyük"\n        case x if x > 1000:\n            return "çok büyük"\n        case _:\n            return "küçük"\n\nprint(sinif(5000), sinif(50))\n',
      o: ['çok büyük küçük', 'büyük küçük', 'büyük büyük', 'çok büyük büyük'],
      a: 1,
      why: 'Desenler sırayla denenir; 5000 için ilk guard (x > 100) zaten doğrudur, "çok büyük" dalına hiç gelinmez. Özel koşul üste yazılmalıydı.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sözlük deseninde fazladan anahtarlar: bu kod ne yazdırır?',
      code: 'islem = {"tip": "eft", "tutar": 250, "kanal": "mobil", "aciklama": "kira"}\nmatch islem:\n    case {"tip": "havale", "tutar": t}:\n        print("havale", t)\n    case {"tip": "eft", "tutar": t}:\n        print("eft", t)\n    case _:\n        print("diğer")\n',
      o: ['diğer', 'eft 250', 'havale 250', 'Hiçbir şey yazdırmaz'],
      a: 1,
      why: 'Sözlük deseni yalnızca yazılan anahtarlara bakar; kanal ve aciklama gibi fazladan anahtarlar eşleşmeyi bozmaz. tip "eft" olduğu için ikinci dal çalışır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Dizi desenleri: bu kod ne yazdırır?',
      code: 'def ayir(parcalar):\n    match parcalar:\n        case [ilk]:\n            return f"tek:{ilk}"\n        case [ilk, *orta, son]:\n            return f"{ilk}|{len(orta)}|{son}"\n        case _:\n            return "boş"\n\nprint(ayir(["a", "b", "c", "d"]), ayir([]), ayir(["x", "y"]))\n',
      o: ['a|2|d boş x|0|y', 'a|3|d boş x|1|y', 'a|2|d boş tek:x', 'a|2|d tek: x|0|y'],
      a: 0,
      why: '[ilk, *orta, son] en az iki elemanla eşleşir; dört elemanda orta ["b", "c"] olur, iki elemanda orta boş liste olur. Boş liste ne [ilk] ne de en az iki elemanlı desenle eşleşir, joker dala düşer.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Ilgaz Bank işlemini sözlük desenleriyle yönlendiren fonksiyonun satırlarını sırala. Büyük havale kontrolü genel havaleden önce gelmeli.</p>',
      lines: ['def yonlendir(islem):', '    match islem:', '        case {"tip": "havale", "tutar": t} if t > 50000:', '            return "uyum"', '        case {"tip": "havale"}:', '            return "transfer"', '        case _:', '            return "diğer"', 'print(yonlendir({"tip": "havale", "tutar": 90000}), yonlendir({"tip": "havale", "tutar": 10}), yonlendir({}))'],
      expect: 'uyum transfer diğer\n',
      hint: 'Her case satırının hemen altında kendi return satırı gelir; özel (guard\'lı) dal genel daldan önce, joker en sonda.',
      why: 'Desenler sırayla denendiği için guard\'lı özel dal üstte olmalı; joker her şeyle eşleştiğinden en sona yazılır.' },
    { id: 'match-case-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>kargo_mesaji(kod)</code> fonksiyonunu match-case ile yaz. Kod büyük/küçük harf duyarsız olsun. Kurallar: <code>"H"</code> → <code>"Hazırlanıyor"</code>; <code>"K"</code> ya da <code>"D"</code> (dağıtımda) → <code>"Yolda"</code>; <code>"T"</code> → <code>"Teslim edildi"</code>; <code>"I"</code> ya da <code>"R"</code> → <code>"İade sürecinde"</code>; diğer her şey → <code>"Bilinmeyen kod"</code>.</p>',
      guide: ['Konuyu büyük harfe çevirerek match\'e ver: match kod.upper():', 'Tek değerli dallar için case "H": yaz.', 'Aynı sonuca giden kodları | ile birleştir: case "K" | "D":', 'En sona case _: ile varsayılan dalı ekle.'],
      example: 'def oncelik(seviye):\n    match seviye.lower():\n        case "acil" | "kritik":\n            return 1\n        case "normal":\n            return 2\n        case _:\n            return 3\n\nprint(oncelik("KRİTİK"), oncelik("normal"), oncelik("x"))\n',
      start: 'def kargo_mesaji(kod):\n    match kod.upper():\n        case "H":\n            return "Hazırlanıyor"\n        # TODO: K ya da D → "Yolda"\n        # TODO: T → "Teslim edildi"\n        # TODO: I ya da R → "İade sürecinde"\n        # TODO: diğer her şey → "Bilinmeyen kod"\n',
      sol: 'def kargo_mesaji(kod):\n    match kod.upper():\n        case "H":\n            return "Hazırlanıyor"\n        case "K" | "D":\n            return "Yolda"\n        case "T":\n            return "Teslim edildi"\n        case "I" | "R":\n            return "İade sürecinde"\n        case _:\n            return "Bilinmeyen kod"\n',
      tests: 'assert kargo_mesaji("h") == "Hazırlanıyor", "küçük h de Hazırlanıyor olmalı (upper ile)"\nassert kargo_mesaji("K") == "Yolda" and kargo_mesaji("d") == "Yolda", "K ve D birleşik desenle Yolda vermeli"\nassert kargo_mesaji("T") == "Teslim edildi", "T Teslim edildi olmalı"\nassert kargo_mesaji("R") == "İade sürecinde" and kargo_mesaji("i") == "İade sürecinde", "I ve R İade sürecinde olmalı"\nassert kargo_mesaji("Z") == "Bilinmeyen kod", "tanımsız kod için joker dal \'Bilinmeyen kod\' döndürmeli"\nassert kargo_mesaji("") == "Bilinmeyen kod", "boş metin de bilinmeyen kod"\n',
      hints: ['Birden fazla değer için birleşik desen kullan.', 'case "K" | "D": ve case "I" | "R":', 'Son dal: case _: return "Bilinmeyen kod"'],
      why: 'Birleşik desen aynı sonuca giden değerleri tek dalda toplar; joker, eşleşmeyen her şeyi yakalayarak fonksiyonun hep bir değer döndürmesini sağlar.' },
    { id: 'match-case-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Market sepet komutlarını ayrıştıran <code>sepet_komutu(satir)</code> fonksiyonunu dizi desenleriyle yaz. Satırı <code>split()</code> ile parçala. Kurallar:</p><ul><li><code>"listele"</code> → <code>"LISTE"</code></li><li><code>"ekle URUN"</code> → <code>("EKLE", URUN, 1)</code></li><li><code>"ekle URUN ADET"</code> (ADET rakamlardan oluşuyorsa) → <code>("EKLE", URUN, ADET)</code>, ADET int olarak</li><li><code>"sil URUN1 URUN2 ..."</code> (en az bir ürün) → <code>("SIL", [URUN1, URUN2, ...])</code></li><li>diğer her şey (boş satır dahil) → <code>"HATA"</code></li></ul>',
      guide: ['match satir.split(): ile başla.', 'Tek elemanlı ["listele"] desenini yaz.', 'İki elemanlı ["ekle", urun] ve üç elemanlı ["ekle", urun, adet] desenlerini ayrı yaz; üçlüye if adet.isdigit() guard\'ı ekle.', '["sil", *urunler] desenine if urunler guard\'ı ekle ki "sil" tek başına hata versin.', 'En sona case _: "HATA"'],
      example: 'def git(satir):\n    match satir.split():\n        case ["git", yon]:\n            return f"{yon} yönüne gidiliyor"\n        case ["al", *esyalar] if esyalar:\n            return f"Alındı: {esyalar}"\n        case _:\n            return "Anlaşılmadı"\n\nprint(git("git kuzey"), git("al anahtar fener"), git("al"))\n',
      start: 'def sepet_komutu(satir):\n    match satir.split():\n        case ["listele"]:\n            return "LISTE"\n        # TODO: ["ekle", urun]\n        # TODO: ["ekle", urun, adet] ve adet rakam ise\n        # TODO: ["sil", *urunler] ve en az bir ürün varsa\n        case _:\n            return "HATA"\n',
      sol: 'def sepet_komutu(satir):\n    match satir.split():\n        case ["listele"]:\n            return "LISTE"\n        case ["ekle", urun]:\n            return ("EKLE", urun, 1)\n        case ["ekle", urun, adet] if adet.isdigit():\n            return ("EKLE", urun, int(adet))\n        case ["sil", *urunler] if urunler:\n            return ("SIL", urunler)\n        case _:\n            return "HATA"\n',
      tests: 'assert sepet_komutu("listele") == "LISTE", "listele komutu LISTE döndürmeli"\nassert sepet_komutu("ekle çay") == ("EKLE", "çay", 1), "adet verilmezse 1 olmalı"\nassert sepet_komutu("ekle çay 3") == ("EKLE", "çay", 3), "adet int olarak dönmeli: (\'EKLE\', \'çay\', 3)"\nassert sepet_komutu("ekle çay üç") == "HATA", "rakam olmayan adet guard\'a takılıp HATA vermeli"\nassert sepet_komutu("sil çay kahve") == ("SIL", ["çay", "kahve"]), "sil kalan tüm ürünleri liste olarak döndürmeli"\nassert sepet_komutu("sil") == "HATA", "ürünsüz sil HATA olmalı (if urunler guard\'ı)"\nassert sepet_komutu("") == "HATA" and sepet_komutu("ekle a 1 2") == "HATA", "boş satır ve fazla parça HATA vermeli"\n',
      hints: ['Dizi desenleri eleman sayısına bakar: ["ekle", urun] tam iki parça ister.', 'Guard: case ["ekle", urun, adet] if adet.isdigit():', 'case ["sil", *urunler] if urunler: return ("SIL", urunler)'],
      why: 'Her desen hem parça sayısını hem ilk kelimeyi aynı anda denetler; guard\'lar geçersiz girdiyi joker dala düşürür. if/elif ile aynı işi len() ve indekslerle çok daha uzun yazardın.' },
    { id: 'match-case-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Ilgaz Bank işlem kuyruğu için <code>islem_kanali(islem)</code> fonksiyonunu sözlük desenleriyle yaz. Dönüş değerleri:</p><ul><li><code>"tip"</code> <code>"havale"</code> ya da <code>"eft"</code> ve <code>"tutar"</code> 50000\'den büyükse → <code>"UYUM"</code></li><li><code>"tip"</code> <code>"havale"</code> ya da <code>"eft"</code> (tutar var) → <code>"TRANSFER"</code></li><li><code>"tip": "fatura"</code> ve <code>"kurum"</code> anahtarı varsa → <code>"FATURA:" + kurum</code></li><li><code>"tip"</code> anahtarı olan diğer sözlükler → <code>"DESTEKLENMIYOR"</code></li><li>geri kalan her şey (sözlük değil ya da tip yok) → <code>"GECERSIZ"</code></li></ul>',
      guide: ['En özel dalı en üste yaz: havale/eft + guard ile tutar kontrolü.', 'Birleşik deseni sözlük içinde kullan: {"tip": "havale" | "eft", "tutar": t}', 'Fatura için kurumu yakala: {"tip": "fatura", "kurum": kurum}', 'Tip anahtarı olan her sözlük için {"tip": _} ve en sonda case _:'],
      example: 'def olay(m):\n    match m:\n        case {"olay": "giris" | "cikis", "kullanici": k}:\n            return f"oturum:{k}"\n        case {"olay": _}:\n            return "bilinmeyen olay"\n        case _:\n            return "geçersiz"\n\nprint(olay({"olay": "giris", "kullanici": "ece", "ip": "1.2.3.4"}), olay({"olay": "x"}), olay([1]))\n',
      start: 'def islem_kanali(islem):\n    match islem:\n        # TODO: havale/eft ve tutar > 50000 → "UYUM"\n        # TODO: havale/eft (tutar var) → "TRANSFER"\n        # TODO: fatura + kurum → "FATURA:" + kurum\n        # TODO: tip anahtarı olan diğerleri → "DESTEKLENMIYOR"\n        case _:\n            return "GECERSIZ"\n',
      sol: 'def islem_kanali(islem):\n    match islem:\n        case {"tip": "havale" | "eft", "tutar": t} if t > 50000:\n            return "UYUM"\n        case {"tip": "havale" | "eft", "tutar": _}:\n            return "TRANSFER"\n        case {"tip": "fatura", "kurum": kurum}:\n            return "FATURA:" + kurum\n        case {"tip": _}:\n            return "DESTEKLENMIYOR"\n        case _:\n            return "GECERSIZ"\n',
      tests: 'assert islem_kanali({"tip": "havale", "tutar": 75000, "alici": "TR1"}) == "UYUM", "50000 üstü havale UYUM olmalı"\nassert islem_kanali({"tip": "eft", "tutar": 50000}) == "TRANSFER", "tam 50000 büyük değil; TRANSFER olmalı"\nassert islem_kanali({"tip": "havale", "tutar": 10, "kanal": "mobil"}) == "TRANSFER", "fazladan anahtarlar eşleşmeyi bozmamalı"\nassert islem_kanali({"tip": "fatura", "kurum": "Su", "tutar": 90}) == "FATURA:Su", "fatura kurumu yakalanmalı"\nassert islem_kanali({"tip": "fatura"}) == "DESTEKLENMIYOR", "kurumsuz fatura özel dala girmemeli"\nassert islem_kanali({"tip": "havale"}) == "DESTEKLENMIYOR", "tutarsız havale transfer sayılmamalı"\nassert islem_kanali({"tutar": 5}) == "GECERSIZ" and islem_kanali(["havale", 5]) == "GECERSIZ", "tip yoksa ya da sözlük değilse GECERSIZ"\n',
      hints: ['Sözlük deseni yalnız yazdığın anahtarlara bakar; anahtar eksikse eşleşmez.', 'Guard\'lı UYUM dalı TRANSFER dalının üstünde olmalı.', 'Tutarın varlığını şart koşmak için {"tutar": _} yaz.'],
      why: 'Sözlük desenleri anahtar varlığını, değeri ve çekmeyi birlikte yapar; özelden genele sıralama ve son joker dal, her mesajın tam bir kanala gitmesini garanti eder.' },
    { id: 'match-case-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>http_durum(kod)</code> fonksiyonunu match-case ile yaz: 200 ya da 201 → <code>"Başarılı"</code>; 301 ya da 302 → <code>"Yönlendirme"</code>; 404 → <code>"Bulunamadı"</code>; 400–499 arası diğer kodlar → <code>"İstemci hatası"</code>; 500–599 → <code>"Sunucu hatası"</code>; diğer her şey → <code>"Bilinmiyor"</code>.</p>',
      start: 'def http_durum(kod):\n    pass\n',
      sol: 'def http_durum(kod):\n    match kod:\n        case 200 | 201:\n            return "Başarılı"\n        case 301 | 302:\n            return "Yönlendirme"\n        case 404:\n            return "Bulunamadı"\n        case k if 400 <= k <= 499:\n            return "İstemci hatası"\n        case k if 500 <= k <= 599:\n            return "Sunucu hatası"\n        case _:\n            return "Bilinmiyor"\n',
      tests: 'assert http_durum(200) == "Başarılı" and http_durum(201) == "Başarılı", "200 ve 201 Başarılı"\nassert http_durum(302) == "Yönlendirme", "302 Yönlendirme"\nassert http_durum(404) == "Bulunamadı", "404 kendi özel dalına girmeli; aralık dalından önce yaz"\nassert http_durum(403) == "İstemci hatası", "403 istemci hatası"\nassert http_durum(503) == "Sunucu hatası", "503 sunucu hatası"\nassert http_durum(100) == "Bilinmiyor" and http_durum(600) == "Bilinmiyor", "aralık dışı kodlar Bilinmiyor"\nassert "match" in __source__, "çözümü match-case ile yaz"\n',
      hints: ['Aralıklar için yakalama + guard: case k if 400 <= k <= 499:', '404 özel dalı, 4xx aralık dalının üstünde olmalı.'],
      why: 'Sabit değerler birleşik desenle, aralıklar guard ile ifade edilir; özel değer (404) genel aralıktan önce gelmelidir.' },
    { erken: true, id: 'match-case-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Lojistik ekibi depo raflarının taban alanını hesaplıyor. Başlangıç kodunda üç dataclass var: <code>Daire(r)</code>, <code>Dikdortgen(en, boy)</code>, <code>Kare(kenar)</code>. <code>alan(sekil)</code> fonksiyonunu <b>sınıf desenleriyle</b> yaz ve alanı 2 ondalığa yuvarla (daire için <code>math.pi</code>). Bilinmeyen bir nesne gelirse <code>ValueError</code> fırlat. Ayrıca kenarı 0 ya da negatif olan bir <code>Kare</code> için de <code>ValueError</code> fırlat.</p>',
      start: 'import math\nfrom dataclasses import dataclass\n\n@dataclass\nclass Daire:\n    r: float\n\n@dataclass\nclass Dikdortgen:\n    en: float\n    boy: float\n\n@dataclass\nclass Kare:\n    kenar: float\n\ndef alan(sekil):\n    pass\n',
      sol: 'import math\nfrom dataclasses import dataclass\n\n@dataclass\nclass Daire:\n    r: float\n\n@dataclass\nclass Dikdortgen:\n    en: float\n    boy: float\n\n@dataclass\nclass Kare:\n    kenar: float\n\ndef alan(sekil):\n    match sekil:\n        case Daire(r):\n            return round(math.pi * r * r, 2)\n        case Dikdortgen(en, boy):\n            return round(en * boy, 2)\n        case Kare(k) if k > 0:\n            return round(k * k, 2)\n        case Kare():\n            raise ValueError("Kare kenarı pozitif olmalı")\n        case _:\n            raise ValueError("Bilinmeyen şekil")\n',
      tests: 'assert alan(Daire(1)) == 3.14, "yarıçapı 1 olan dairenin alanı 3.14"\nassert alan(Dikdortgen(2.5, 4)) == 10.0, "2.5 × 4 = 10.0"\nassert alan(Kare(3)) == 9, "kenarı 3 olan kare 9"\nfor kotu in [Kare(0), Kare(-2), "kare", 5]:\n    try:\n        alan(kotu)\n        assert False, f"{kotu!r} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['dataclass alanları konumsal desene açılır: case Daire(r):', 'Geçersiz kare için önce guard\'lı case Kare(k) if k > 0:, ardından case Kare(): raise ValueError(...)'],
      why: 'Sınıf deseni hem türü denetler (isinstance) hem alanları açar. Guard ile geçerli kareyi ayırıp, kalan Kare örneklerini ayrı dalda reddedersin.' },
    { id: 'match-case-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Bir harita uygulaması için <code>konum_tanimla(nokta)</code> fonksiyonunu yaz. <code>nokta</code> bir demet ya da listedir. Kurallar (sırayla): <code>(0, 0)</code> → <code>"Merkez"</code>; x 0 ise → <code>"Y ekseni: y=..."</code>; y 0 ise → <code>"X ekseni: x=..."</code>; x ile y eşitse → <code>"Köşegen"</code>; iki elemanlı diğerleri → <code>"Düzlem"</code>; üç elemanlı her şey → <code>"3B nokta"</code>; diğer her şey → <code>"Geçersiz"</code>.</p>',
      start: 'def konum_tanimla(nokta):\n    pass\n',
      sol: 'def konum_tanimla(nokta):\n    match nokta:\n        case (0, 0):\n            return "Merkez"\n        case (0, y):\n            return f"Y ekseni: y={y}"\n        case (x, 0):\n            return f"X ekseni: x={x}"\n        case (x, y) if x == y:\n            return "Köşegen"\n        case (_, _):\n            return "Düzlem"\n        case (_, _, _):\n            return "3B nokta"\n        case _:\n            return "Geçersiz"\n',
      tests: 'assert konum_tanimla((0, 0)) == "Merkez", "(0, 0) Merkez"\nassert konum_tanimla((0, 5)) == "Y ekseni: y=5", "x 0 ise Y ekseni: y=5"\nassert konum_tanimla([3, 0]) == "X ekseni: x=3", "liste de dizi deseniyle eşleşir"\nassert konum_tanimla((4, 4)) == "Köşegen", "x == y Köşegen"\nassert konum_tanimla((2, 7)) == "Düzlem", "diğer ikililer Düzlem"\nassert konum_tanimla((1, 2, 3)) == "3B nokta", "üç eleman 3B nokta"\nassert konum_tanimla("ab") == "Geçersiz", "metin dizi deseniyle eşleşmez: Geçersiz"\nassert konum_tanimla((1,)) == "Geçersiz", "tek eleman Geçersiz"\n',
      hints: ['Dizi desenlerinde hem değer hem yakalama karışabilir: case (0, y):', 'Eşitlik için guard: case (x, y) if x == y:'],
      why: 'Dizi desenleri eleman sayısını ve belirli konumlardaki değerleri aynı anda denetler; metinlerin dizi deseninden hariç tutulması "ab" gibi girdileri güvenle eler.' },
    { id: 'match-case-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Market sitesinin olay günlüğünü özetleyen <code>olay_ozeti(olaylar)</code> fonksiyonunu yaz. Olaylar sözlüktür:</p><ul><li><code>{"tip": "giris", "kullanici": k}</code> → giriş sayısını 1 artır</li><li><code>{"tip": "satin_alma", "tutar": t}</code> → ciroya t ekle</li><li><code>{"tip": "hata", "kod": c}</code> → c\'yi hata kodları listesine ekle</li><li>diğer her şey yok sayılır</li></ul><p>Fonksiyon <code>{"giris": sayı, "ciro": toplam, "hatalar": [kodlar]}</code> döndürsün (ciro 2 ondalık).</p>',
      start: 'def olay_ozeti(olaylar):\n    pass\n',
      sol: 'def olay_ozeti(olaylar):\n    ozet = {"giris": 0, "ciro": 0, "hatalar": []}\n    for o in olaylar:\n        match o:\n            case {"tip": "giris", "kullanici": _}:\n                ozet["giris"] += 1\n            case {"tip": "satin_alma", "tutar": t}:\n                ozet["ciro"] += t\n            case {"tip": "hata", "kod": c}:\n                ozet["hatalar"].append(c)\n    ozet["ciro"] = round(ozet["ciro"], 2)\n    return ozet\n',
      tests: 'olaylar = [\n    {"tip": "giris", "kullanici": "ayse"},\n    {"tip": "satin_alma", "tutar": 149.9, "urun": "Çay"},\n    {"tip": "hata", "kod": 500},\n    {"tip": "giris", "kullanici": "can"},\n    {"tip": "satin_alma", "tutar": 50.15},\n    {"tip": "cikis", "kullanici": "ayse"},\n    {"tip": "giris"},\n    "bozuk kayıt",\n    {"tip": "hata", "kod": 404},\n]\nr = olay_ozeti(olaylar)\nassert r["giris"] == 2, f"kullanıcısı olan 2 giriş var; gelen {r[\'giris\']}"\nassert r["ciro"] == 200.05, f"ciro 149.9 + 50.15 = 200.05 olmalı; gelen {r[\'ciro\']}"\nassert r["hatalar"] == [500, 404], "hata kodları sırayla toplanmalı"\nassert olay_ozeti([]) == {"giris": 0, "ciro": 0, "hatalar": []}, "boş günlükte sıfır özet"\n',
      hints: ['Döngünün içinde her olayı match ile yönlendir.', 'Eşleşmeyen olaylar için case _ yazmana gerek yok; match hiçbir şey yapmaz.'],
      why: 'match, döngü içinde her olayın türüne göre doğru biriktiriciye yönlendirme yapar; bozuk ya da bilinmeyen kayıtlar hiçbir desenle eşleşmediği için sessizce atlanır.' },
    { erken: true, id: 'match-case-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>basvuru_mesaji(durum)</code> kredi başvurusu durumuna göre mesaj döndürmeli: <code>"onay"</code> → <code>"Onaylandı"</code>, <code>"red"</code> → <code>"Reddedildi"</code>, diğer her şey → <code>"Bilinmeyen durum"</code>. Kod sabitleri kullanıyor ama tanımsız durumlar da "Onaylandı" çıkıyor.</p>',
      start: 'ONAY = "onay"\nRED = "red"\n\ndef basvuru_mesaji(durum):\n    match durum:\n        case "red":\n            return "Reddedildi"\n        case ONAY:\n            return "Onaylandı"\n',
      sol: 'class Durum:\n    ONAY = "onay"\n    RED = "red"\n\ndef basvuru_mesaji(durum):\n    match durum:\n        case Durum.RED:\n            return "Reddedildi"\n        case Durum.ONAY:\n            return "Onaylandı"\n        case _:\n            return "Bilinmeyen durum"\n',
      tests: 'assert basvuru_mesaji("onay") == "Onaylandı", "onay Onaylandı olmalı"\nassert basvuru_mesaji("red") == "Reddedildi", "red Reddedildi olmalı"\nassert basvuru_mesaji("beklemede") == "Bilinmeyen durum", "case ONAY: yakalama desenidir ve her şeyle eşleşir; noktalı ad ya da metin değeri kullan"\nassert basvuru_mesaji("") == "Bilinmeyen durum", "boş durum da bilinmeyen olmalı"\n',
      hints: ['Desende düz ad (ONAY) karşılaştırma değil yakalamadır.', 'case "onay": yaz ya da sabitleri bir sınıfa koyup case Durum.ONAY: kullan; sona case _: ekle.'],
      why: 'Düz ad her şeyi yakalar ve "beklemede" de o dala düşer. Noktalı ad (Durum.ONAY) değer deseni sayılır ve gerçekten karşılaştırma yapar; joker dal da bilinmeyenleri doğru yönlendirir.' },
    { id: 'match-case-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>komut_cevir(satir)</code> şu çevirileri yapmalı: <code>"çık"</code> → <code>"QUIT"</code>, <code>"git YER"</code> → <code>"GO YER"</code>, <code>"git YER hızlı"</code> → <code>"RUN YER"</code>, diğerleri → <code>"?"</code>. Ama <code>"git ofis hızlı"</code> hiçbir zaman RUN olmuyor ve <code>"çık"</code> da yanlış çevriliyor.</p>',
      start: 'def komut_cevir(satir):\n    match satir.split():\n        case [komut, *_] if komut == "git":\n            return "GO " + satir.split()[1]\n        case ["git", yer, "hızlı"]:\n            return "RUN " + yer\n        case "çık":\n            return "QUIT"\n        case _:\n            return "?"\n',
      sol: 'def komut_cevir(satir):\n    match satir.split():\n        case ["çık"]:\n            return "QUIT"\n        case ["git", yer, "hızlı"]:\n            return "RUN " + yer\n        case ["git", yer]:\n            return "GO " + yer\n        case _:\n            return "?"\n',
      tests: 'assert komut_cevir("çık") == "QUIT", "konu bir liste: [\'çık\'] deseni gerekir, \'çık\' metni listeyle eşleşmez"\nassert komut_cevir("git ofis") == "GO ofis", "git ofis → GO ofis"\nassert komut_cevir("git ofis hızlı") == "RUN ofis", "özel desen genel desenden önce gelmeli"\nassert komut_cevir("git") == "?", "yersiz git ? olmalı (IndexError değil)"\nassert komut_cevir("git a b c") == "?", "fazla parça ? olmalı"\n',
      hints: ['İki sorun var: desen sırası ve konunun türü. split() liste döndürür.', 'case ["çık"]:, sonra ["git", yer, "hızlı"], sonra ["git", yer] sırası doğru.'],
      why: 'Genel desen üstte kaldığı için özel dal ölü koddu; ayrıca konu bir liste olduğundan "çık" metin deseni hiç eşleşmezdi. Kesin uzunluklu dizi desenleri hem sırayı hem "git" tek başına geldiğindeki IndexError\'ı çözer.' },
    { id: 'match-case-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Ilgaz Bank için küçük bir komut satırı simülatörü yaz: <code>banka_cli(komutlar, hesaplar)</code>. <code>hesaplar</code> hesap no → bakiye sözlüğüdür ve <b>yerinde</b> güncellenir; aktif hesap başta <code>"H-1"</code>dir. Fonksiyon her komut için bir çıktı satırı üreten listeyi döndürsün. Komutlar:</p><ul><li><code>bakiye</code> → <code>"H-1: 150.00"</code> (aktif hesap, 2 ondalık)</li><li><code>yatir TUTAR</code> → bakiyeye ekle, <code>"OK"</code></li><li><code>cek TUTAR</code> → bakiye yetmiyorsa <code>"Yetersiz bakiye"</code>, yoksa düş ve <code>"OK"</code></li><li><code>transfer TUTAR HESAP</code> → hedef hesap yoksa <code>"Hesap yok"</code>, bakiye yetmiyorsa <code>"Yetersiz bakiye"</code>, yoksa aktarıp <code>"OK"</code></li><li><code>hesap HESAP</code> → hesap varsa aktif yap ve <code>"Aktif: HESAP"</code>, yoksa <code>"Hesap yok"</code></li><li>TUTAR pozitif bir sayı olmalı (ondalıklı olabilir: <code>"12.5"</code>); değilse <code>"Geçersiz tutar"</code>. Tanınmayan komut ya da yanlış parça sayısı → <code>"Bilinmeyen komut"</code>.</li></ul>',
      start: 'def banka_cli(komutlar, hesaplar):\n    pass\n',
      sol: 'def tutar_coz(metin):\n    try:\n        t = float(metin)\n    except ValueError:\n        return None\n    return t if t > 0 else None\n\ndef banka_cli(komutlar, hesaplar):\n    aktif = "H-1"\n    cikti = []\n    for satir in komutlar:\n        match satir.split():\n            case ["bakiye"]:\n                cikti.append(f"{aktif}: {hesaplar[aktif]:.2f}")\n            case ["yatir" | "cek", metin] if tutar_coz(metin) is None:\n                cikti.append("Geçersiz tutar")\n            case ["transfer", metin, _] if tutar_coz(metin) is None:\n                cikti.append("Geçersiz tutar")\n            case ["yatir", metin]:\n                hesaplar[aktif] += tutar_coz(metin)\n                cikti.append("OK")\n            case ["cek", metin]:\n                t = tutar_coz(metin)\n                if t > hesaplar[aktif]:\n                    cikti.append("Yetersiz bakiye")\n                else:\n                    hesaplar[aktif] -= t\n                    cikti.append("OK")\n            case ["transfer", metin, hedef]:\n                t = tutar_coz(metin)\n                if hedef not in hesaplar:\n                    cikti.append("Hesap yok")\n                elif t > hesaplar[aktif]:\n                    cikti.append("Yetersiz bakiye")\n                else:\n                    hesaplar[aktif] -= t\n                    hesaplar[hedef] += t\n                    cikti.append("OK")\n            case ["hesap", no] if no in hesaplar:\n                aktif = no\n                cikti.append(f"Aktif: {no}")\n            case ["hesap", _]:\n                cikti.append("Hesap yok")\n            case _:\n                cikti.append("Bilinmeyen komut")\n    return cikti\n',
      tests: 'h = {"H-1": 100.0, "H-2": 20.0}\nkomutlar = ["bakiye", "yatir 50", "cek 500", "cek 30.5", "transfer 19.5 H-2", "transfer 10 H-9",\n            "transfer 1000 H-2", "yatir -5", "cek abc", "hesap H-2", "bakiye", "hesap H-7", "uç", "yatir", "transfer 5"]\nr = banka_cli(komutlar, h)\nbeklenen = ["H-1: 100.00", "OK", "Yetersiz bakiye", "OK", "OK", "Hesap yok",\n            "Yetersiz bakiye", "Geçersiz tutar", "Geçersiz tutar", "Aktif: H-2", "H-2: 39.50", "Hesap yok", "Bilinmeyen komut", "Bilinmeyen komut", "Bilinmeyen komut"]\nassert isinstance(r, list) and len(r) == len(beklenen), f"her komut için bir çıktı satırı olmalı ({len(beklenen)} satır)"\nfor i, (gelen, bek) in enumerate(zip(r, beklenen)):\n    assert gelen == bek, f"{komutlar[i]!r} komutu için {bek!r} bekleniyordu, gelen {gelen!r}"\nassert abs(h["H-1"] - 100.0) < 1e-9, "H-1 bakiyesi 100 + 50 - 30.5 - 19.5 = 100.0 olmalı"\nassert abs(h["H-2"] - 39.5) < 1e-9, "H-2 bakiyesi 20 + 19.5 = 39.5 olmalı"\n',
      hints: ['Tutar doğrulamayı ayrı bir yardımcı fonksiyona koy: float() dene, ValueError ya da sıfır/negatif ise None döndür.', 'Doğru parça sayısında ama geçersiz tutarlı komutları, normal dallardan önce guard\'lı bir dalla yakala; parça sayısı yanlışsa "Bilinmeyen komut".', 'hesap komutu için guard: case ["hesap", no] if no in hesaplar: ve ardından case ["hesap", _]:'],
      why: 'Komutun şekli (parça sayısı, ilk kelime) desenle, anlamsal geçerlilik (tutar sayı mı, hesap var mı) guard ve iç if\'lerle denetlenir. Doğrulamayı ayrı fonksiyona çekmek match dallarını kısa tutar. Tek dal yerine ayrı dallar tercih etmek de geçerlidir; önemli olan sıralama ve tüm kenar durumların karşılanmasıdır.' },
    { id: 'match-case-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market sipariş olaylarından durum tablosu çıkaran iki fonksiyon yaz:</p><ul><li><code>durum_tablosu(olaylar)</code>: olaylar sırayla işlenir ve sipariş no → <code>{"tutar": ..., "durum": ...}</code> sözlüğü döner. Olaylar:<br><code>{"olay": "olustu", "no": n, "tutar": t}</code> → kaydı <code>"yeni"</code> durumla oluştur;<br><code>{"olay": "odeme", "no": n}</code> → durum <code>"odendi"</code>;<br><code>{"olay": "kargo", "no": n, "firma": _}</code> → durum <code>"kargoda"</code>;<br><code>{"olay": "iade", "no": n, "tutar": t}</code> → tutardan t düş; tutar 0 ya da altına inerse durum <code>"iade"</code>.<br>Tabloda olmayan bir siparişe gelen olay ve tanınmayan olaylar yok sayılır.</li><li><code>durum_sayilari(tablo)</code>: durum → kaç sipariş sözlüğü döndürsün.</li></ul>',
      start: 'def durum_tablosu(olaylar):\n    # TODO\n    pass\n\ndef durum_sayilari(tablo):\n    # TODO\n    pass\n',
      sol: 'def durum_tablosu(olaylar):\n    tablo = {}\n    for o in olaylar:\n        match o:\n            case {"olay": "olustu", "no": n, "tutar": t}:\n                tablo[n] = {"tutar": t, "durum": "yeni"}\n            case {"olay": "odeme", "no": n} if n in tablo:\n                tablo[n]["durum"] = "odendi"\n            case {"olay": "kargo", "no": n, "firma": _} if n in tablo:\n                tablo[n]["durum"] = "kargoda"\n            case {"olay": "iade", "no": n, "tutar": t} if n in tablo:\n                tablo[n]["tutar"] -= t\n                if tablo[n]["tutar"] <= 0:\n                    tablo[n]["durum"] = "iade"\n    return tablo\n\ndef durum_sayilari(tablo):\n    sayilar = {}\n    for kayit in tablo.values():\n        sayilar[kayit["durum"]] = sayilar.get(kayit["durum"], 0) + 1\n    return sayilar\n',
      tests: 'olaylar = [\n    {"olay": "olustu", "no": "AM-1", "tutar": 300},\n    {"olay": "olustu", "no": "AM-2", "tutar": 120},\n    {"olay": "olustu", "no": "AM-3", "tutar": 80},\n    {"olay": "odeme", "no": "AM-1"},\n    {"olay": "kargo", "no": "AM-1", "firma": "Yurtiçi"},\n    {"olay": "odeme", "no": "AM-2"},\n    {"olay": "iade", "no": "AM-2", "tutar": 50},\n    {"olay": "iade", "no": "AM-3", "tutar": 80},\n    {"olay": "odeme", "no": "AM-99"},\n    {"olay": "kargo", "no": "AM-2"},\n    {"olay": "puan", "no": "AM-1"},\n]\nt = durum_tablosu(olaylar)\nassert t is not None and set(t) == {"AM-1", "AM-2", "AM-3"}, "tabloda yalnız oluşturulan üç sipariş olmalı; AM-99 eklenmemeli"\nassert t["AM-1"] == {"tutar": 300, "durum": "kargoda"}, f"AM-1 kargoda olmalı: {t[\'AM-1\']}"\nassert t["AM-2"] == {"tutar": 70, "durum": "odendi"}, f"AM-2 kısmi iade: tutar 70, durum odendi (firmasız kargo olayı yok sayılır); gelen {t[\'AM-2\']}"\nassert t["AM-3"] == {"tutar": 0, "durum": "iade"}, "AM-3 tamamen iade edildi"\nassert durum_sayilari(t) == {"kargoda": 1, "odendi": 1, "iade": 1}, f"durum sayıları hatalı: {durum_sayilari(t)}"\nassert durum_sayilari({}) == {}, "boş tablo boş sayım vermeli"\n',
      hints: ['Her olayı sözlük deseniyle yakala; tabloda olmayan siparişler için if n in tablo guard\'ı ekle.', 'İade dalında önce tutarı düş, sonra <= 0 ise durumu değiştir.', 'durum_sayilari için sözlükler dersindeki sayım kalıbını kullan.'],
      why: 'Olay güdümlü sistemlerin özü budur: her olay türü bir case, durum bir sözlükte tutulur. Guard\'lar bilinmeyen siparişlere gelen olayları güvenle eler; eksik alanlı olaylar hiçbir desene uymadığı için kendiliğinden yok sayılır.' }
  ],
  faq: [
    { q: 'match-case Python\'un her sürümünde çalışır mı?',
      a: 'Hayır, Python 3.10 ve sonrasında çalışır. Daha eski bir sürümde match satırı SyntaxError verir. Kodun eski sunucularda da çalışması gerekiyorsa if/elif kullan.' },
    { q: 'match ile switch aynı şey mi?',
      a: 'Kısmen. Değer desenleriyle switch gibi kullanılabilir ama fall-through yoktur ve break gerekmez. Asıl gücü dizi, sözlük ve sınıf desenleriyle veriyi şekline göre eşleyip parçalarına ayırmasıdır; switch bunu yapamaz.' },
    { q: 'match içinde yakalanan değişkenler match bittikten sonra da kullanılabilir mi?',
      a: 'Evet. Yakalama, normal bir atama gibi davranır; değişken match\'ten sonra da yaşar. Ama eşleşmeyen bir dalın değişkenine güvenme; o dal çalışmadıysa değişken tanımsız olabilir.' },
    { q: 'Sözlük deseninde bir anahtarın OLMAMASINI nasıl şart koşarım?',
      a: 'Sözlük deseni yalnız var olan anahtarları denetler. Yokluğu şart koşmak için guard kullan: <code>case {"tip": "havale"} as m if "iptal" not in m:</code>.' }
  ],
  mistakes: [
    { why: 'Düz ad yakalama desenidir ve her şeyle eşleşir; sabit için değeri yaz ya da noktalı ad (Durum.ONAY) kullan.',
      bad: 'ONAY = "onay"\nmatch durum:\n    case ONAY:\n        print("Onaylandı")',
      good: 'match durum:\n    case "onay":\n        print("Onaylandı")' },
    { why: 'Desenler sırayla denenir; genel koşul üstteyse özel dal hiç çalışmaz.',
      bad: 'match t:\n    case x if x > 100:\n        ...\n    case x if x > 1000:\n        ...',
      good: 'match t:\n    case x if x > 1000:\n        ...\n    case x if x > 100:\n        ...' },
    { why: 'Metin dizi deseniyle eşleşmez; önce split() ile listeye çevir.',
      bad: 'match satir:\n    case ["ekle", urun]:\n        ...',
      good: 'match satir.split():\n    case ["ekle", urun]:\n        ...' },
    { why: 'Parantezsiz sınıf adı yakalama desenidir; tür kontrolü için Havale() yaz.',
      bad: 'match islem:\n    case Havale:\n        ...',
      good: 'match islem:\n    case Havale():\n        ...' },
    { why: 'Hiçbir desen eşleşmezse match sessizce geçer; varsayılan davranış için case _ ekle.',
      bad: 'match kod:\n    case 200:\n        return "OK"\n# eşleşmeyen kodlar None döner',
      good: 'match kod:\n    case 200:\n        return "OK"\n    case _:\n        return "Bilinmiyor"' }
  ] }
);
})(window);
