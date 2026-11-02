/* PythonPatika v2 — dongu-kaliplari */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'dongu-kaliplari',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 40,
  title: 'Döngü kalıpları ve temel algoritmalar',
  sum: 'Sayaç, biriktirici, en büyük/en küçük, doğrusal arama ve bayrak, komşu karşılaştırma, frekans, iç içe döngü, erken çıkış ve while ile hedefe kadar tekrar kalıplarını tanır; her yeni problemi bu kalıplarla çözmeyi öğrenirsin.',
  goals: ['Bir problemi sayaç, biriktirici, arama, en iyi değer gibi bilinen bir döngü kalıbına eşleyebilirim.', 'max/min kullanmadan en büyük ve en küçük değeri ve konumunu doğru başlangıç değeriyle bulabilirim.', 'Bayrak değişkeni ya da for-else ile doğrusal arama yazar, break ile erken çıkarım.', 'Komşu elemanları karşılaştırarak artış/azalış ve seri (streak) hesaplayabilirim.', 'while ile "hedefe ulaşana kadar" döngüsü kurar, döngüde liste değiştirme tuzağından kaçınırım.'],
  body: `
<h2>Döngü yazmak, kalıp tanımaktır</h2>
<p>Döngüler dersinde <code>for</code>, <code>while</code>, <code>range</code>, <code>enumerate</code>, <code>zip</code>, <code>break</code> ve <code>continue</code>'yu öğrendin. Bu ders bir adım geri çekilip şu soruyu soruyor: deneyimli bir geliştirici yeni bir problemi gördüğünde döngüyü nasıl bu kadar hızlı yazıyor? Cevap: yazdığı döngülerin büyük çoğunluğu bir avuç <b>kalıbın</b> (pattern) tekrarıdır. "Kaç tane?" sorusu sayaçtır, "toplam ne?" biriktiricidir, "en pahalısı hangisi?" en iyi değer kalıbıdır, "var mı?" aramadır.</p>
<p>Her kalıbın üç parçası vardır: döngüden <b>önce</b> başlangıç değeri, döngünün <b>içinde</b> güncelleme kuralı, döngüden <b>sonra</b> sonucu kullanma. Hataların çoğu bu üçünden birinde yapılır; özellikle başlangıç değerinde.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Kalıp</th><th>Başlangıç</th><th>Güncelleme</th></tr>
<tr><td>Kaç tane?</td><td>Sayaç</td><td><code>sayac = 0</code></td><td><code>sayac += 1</code> (koşullu)</td></tr>
<tr><td>Toplam/çarpım ne?</td><td>Biriktirici</td><td><code>0</code> ya da <code>1</code>, <code>""</code>, <code>[]</code></td><td><code>toplam += x</code></td></tr>
<tr><td>En büyüğü hangisi?</td><td>En iyi değer</td><td>İlk eleman</td><td>Daha iyisi gelince değiştir</td></tr>
<tr><td>Var mı, nerede?</td><td>Doğrusal arama</td><td><code>bulundu = False</code></td><td>Bulunca bayrak + <code>break</code></td></tr>
<tr><td>Hepsi mi uyuyor?</td><td>Doğrulama</td><td><code>hepsi = True</code></td><td>Uymayan gelince False + <code>break</code></td></tr>
<tr><td>Önceki güne göre?</td><td>Komşu karşılaştırma</td><td>İlk eleman ya da indeks 1</td><td><code>x</code> ile <code>onceki</code></td></tr>
<tr><td>Her değerden kaç tane?</td><td>Frekans</td><td><code>{}</code></td><td><code>d[x] = d.get(x, 0) + 1</code></td></tr>
<tr><td>Hedefe kaç adımda?</td><td>Koşula kadar tekrar</td><td>Durum + adım sayacı</td><td><code>while</code> koşulu</td></tr>
</table></div>

<h2>Sayaç ve biriktirici: tek geçişte birden fazla sonuç</h2>
<p>Bu ikisini zaten biliyorsun. Burada kazanman gereken alışkanlık: aynı veriyi birkaç kez gezmek yerine <b>tek geçişte</b> birden fazla sayaç ve biriktirici tutmak.</p>
<pre class="py">islemler = [1200, -350, 4800, -90, -1500, 600, 0, 75]   # Anadolu Bank hesap hareketleri

giris_toplam = 0
cikis_toplam = 0
cikis_sayisi = 0
buyuk_islem = 0                      # |tutar| &gt;= 1000
for t in islemler:
    if t &gt; 0:
        giris_toplam += t
    elif t &lt; 0:
        cikis_toplam += -t
        cikis_sayisi += 1
    if abs(t) &gt;= 1000:
        buyuk_islem += 1

print("Giriş:", giris_toplam, "Çıkış:", cikis_toplam)
print("Çıkış adedi:", cikis_sayisi, "Büyük işlem:", buyuk_islem)
print("Net:", giris_toplam - cikis_toplam)</pre>
<p>Biriktiricinin başlangıç değeri işleme göre değişir: toplamada 0, çarpmada 1 (0 ile başlarsan sonuç hep 0 olur), metin birleştirmede <code>""</code>, liste toplamada <code>[]</code>.</p>

<h2>En büyük ve en küçük: max kullanmadan</h2>
<p>Gerçek kodda <code>max</code> ve <code>min</code> kullanırsın; ama kalıbı bilmek iki sebeple önemli. Birincisi, çoğu zaman yalnız değeri değil <b>kaydın kendisini</b> ya da konumunu istersin. İkincisi, "en iyi" tanımı karmaşıklaşabilir: en yüksek tutarlı ama iptal edilmemiş sipariş, eşitlikte en eski olan gibi.</p>
<pre class="py">bakiyeler = [-250.0, -1200.5, -40.0, -980.0]      # hepsi negatif!

# YANLIŞ başlangıç: 0 hiçbir negatif değerden küçük değil
en_buyuk_yanlis = 0
for b in bakiyeler:
    if b &gt; en_buyuk_yanlis:
        en_buyuk_yanlis = b
print("Yanlış sonuç:", en_buyuk_yanlis)

# DOĞRU: ilk elemanla başla, konumu da tut
en_kucuk = bakiyeler[0]
en_kucuk_i = 0
for i, b in enumerate(bakiyeler):
    if b &lt; en_kucuk:
        en_kucuk = b
        en_kucuk_i = i
print("En düşük bakiye:", en_kucuk, "konum:", en_kucuk_i)</pre>
<div class="warn"><b>Başlangıç değeri tuzağı</b>En büyüğü bulurken 0 ile başlamak, tüm değerler negatifse yanlış sonuç verir; en küçüğü bulurken 0 ile başlamak, tüm değerler pozitifse yanlış sonuç verir. Güvenli seçenekler: listenin ilk elemanı ya da <code>float("-inf")</code> / <code>float("inf")</code>. Boş liste ihtimali varsa önce onu kontrol et: <code>if not bakiyeler: return None</code>.</div>
<p>Eşitlik durumunda hangi kaydın seçileceği karşılaştırma operatörüne bağlıdır: <code>&lt;</code> ilk görüleni, <code>&lt;=</code> son görüleni tutar. Bu küçük fark, raporlarda "neden bu müşteri çıktı" sorusunun cevabıdır.</p>

<h2>Doğrusal arama ve bayrak değişkeni</h2>
<p>"Bu listede şu koşulu sağlayan var mı, varsa ilki hangisi?" Elemanları baştan sona tek tek kontrol etmeye <b>doğrusal arama</b> (linear search) denir. Sonucu tutmak için bir <b>bayrak</b> (flag) değişkeni kullanırsın; aradığını bulunca da <code>break</code> ile çıkarsın, çünkü geri kalanı kontrol etmek boşa iştir.</p>
<pre class="py">siparisler = [("AM-1", 120), ("AM-2", 4500), ("AM-3", 80), ("AM-4", 9000)]
esik = 4000

bulundu = False
for no, tutar in siparisler:
    if tutar &gt; esik:
        bulundu = True
        ilk_buyuk = no
        break
if bulundu:
    print("İlk büyük sipariş:", ilk_buyuk)
else:
    print("Büyük sipariş yok")

# Aynı iş for-else ile: else, döngü break OLMADAN biterse çalışır
for no, tutar in siparisler:
    if tutar &gt; 10000:
        print("Çok büyük sipariş:", no)
        break
else:
    print("10000 üstü sipariş yok")</pre>
<p>Bayrağın tersi <b>doğrulama</b> kalıbıdır: "hepsi uyuyor mu?" sorusunda <code>hepsi = True</code> ile başlar, uymayan ilk elemanda False yapıp çıkarsın. Bu iki kalıbın hazır karşılıkları <code>any()</code> ve <code>all()</code>'dur; ama hangi elemanın uyduğunu ya da uymadığını öğrenmen gerekiyorsa döngü yazarsın.</p>
<div class="tip"><b>Fonksiyon içinde daha kısa</b>Arama bir fonksiyonun içindeyse bayrağa gerek kalmaz: bulduğun anda <code>return</code> et, döngü bitince "bulunamadı" değerini (<code>None</code> ya da <code>-1</code>) döndür. Erken dönüş (early return), bayrak ve break'in en okunur hâlidir.</div>

<h2>Komşu elemanları karşılaştırmak</h2>
<p>Zaman serilerinde (günlük satış, aylık bakiye, saatlik sıcaklık) asıl soru çoğu zaman bir değerin <b>bir öncekine göre</b> ne olduğudur: arttı mı, azaldı mı, kaç gün üst üste arttı? Bunun için her adımda iki elemana birden bakarsın.</p>
<pre class="py">satislar = [120, 135, 135, 150, 90, 110, 130, 160]   # günlük satış adedi

# Yöntem 1: indeksle, 1'den başla
artis = 0
for i in range(1, len(satislar)):
    if satislar[i] &gt; satislar[i - 1]:
        artis += 1
print("Artış günü:", artis)

# Yöntem 2: zip ile (önceki, şimdiki) çiftleri
for onceki, simdi in zip(satislar, satislar[1:]):
    if simdi &lt; onceki:
        print(f"Düşüş: {onceki} → {simdi} ({simdi - onceki})")

# Seri (streak): en uzun üst üste artış
seri = en_uzun = 0
for onceki, simdi in zip(satislar, satislar[1:]):
    if simdi &gt; onceki:
        seri += 1
        en_uzun = max(en_uzun, seri)
    else:
        seri = 0
print("En uzun artış serisi:", en_uzun, "gün")</pre>
<p><code>zip(satislar, satislar[1:])</code> güzel bir hiledir: listeyi bir kaydırılmış kopyasıyla eşler ve <code>n</code> elemandan <code>n-1</code> komşu çifti verir. Döngünün ilk elemandan değil ikinciden başladığına dikkat et; ilk günün "önceki günü" yoktur. İndeks yönteminde <code>range(len(satislar))</code> yazıp <code>satislar[i - 1]</code> kullanırsan ilk turda <code>satislar[-1]</code>, yani <b>son</b> eleman okunur ve hata vermeden yanlış sonuç alırsın.</p>

<h2>Frekans ve gruplama</h2>
<p>Sözlükler dersinde sayım kalıbını, İç içe veri yapıları dersinde gruplamayı gördün. Kalıp olarak hatırla: frekans, anahtar başına bir <b>sayaç</b>; gruplama, anahtar başına bir <b>liste biriktiricisi</b>. İkisi birleşince "en sık" sorusu iki adımlı olur: önce say, sonra en iyi değer kalıbıyla en büyüğü bul.</p>
<pre class="py">satilan = ["çay", "kahve", "çay", "şeker", "kahve", "çay", "su"]
frekans = {}
for urun in satilan:
    frekans[urun] = frekans.get(urun, 0) + 1

en_cok, en_cok_adet = None, 0
for urun, adet in frekans.items():
    if adet &gt; en_cok_adet:
        en_cok, en_cok_adet = urun, adet
print(frekans)
print("En çok satan:", en_cok, en_cok_adet)</pre>

<h2>İç içe döngü: tablolar ve çiftler</h2>
<p>Dış döngünün her turunda iç döngü baştan sona çalışır. İki tipik kullanım: satır-sütun tablosu üretmek ve bir listedeki tüm <b>çiftleri</b> denemek. Çiftlerde aynı çifti iki kez (a-b ve b-a) ve elemanı kendisiyle eşlememek için iç döngü <code>i + 1</code>'den başlar.</p>
<pre class="py">for i in range(1, 4):
    satir = ""
    for j in range(1, 6):
        satir += f"{i * j:4}"
    print(satir)

fiyatlar = [150, 350, 200, 50]
butce = 400
for i in range(len(fiyatlar)):
    for j in range(i + 1, len(fiyatlar)):
        if fiyatlar[i] + fiyatlar[j] == butce:
            print("Bütçeye tam uyan ikili:", fiyatlar[i], fiyatlar[j])</pre>
<p>İç içe döngüde iş sayısı çarpılır: 1000 elemanlı listede tüm çiftler yaklaşık yarım milyon karşılaştırmadır. Bu, Uzmanlaş bölümündeki karmaşıklık konusunun girişidir.</p>

<h2>while: koşula kadar tekrar</h2>
<p>Kaç tur süreceğini <b>önceden bilmediğin</b> durumlarda <code>while</code> kullanırsın. Anadolu Bank'ın klasik müşteri sorusu: "Hesabımda 10.000 TL var, aylık %3 faiz alırsam 15.000 TL'ye kaç ayda ulaşırım?"</p>
<pre class="py">bakiye = 10_000
aylik_faiz = 0.03
hedef = 15_000

ay = 0
while bakiye &lt; hedef:
    bakiye *= 1 + aylik_faiz
    ay += 1
print(f"{ay} ayda hedefe ulaşılır, bakiye: {bakiye:.2f} TL")

# Güvenlik sınırı: faiz 0 olursa döngü sonsuza gider
bakiye, ay = 10_000, 0
while bakiye &lt; hedef and ay &lt; 600:
    bakiye *= 1 + 0.0
    ay += 1
if bakiye &lt; hedef:
    print("Hedefe ulaşılamadı, döngü", ay, "ayda durduruldu")</pre>
<p>while döngüsünün üç sorusunu her zaman cevapla: koşul ne, döngü içinde koşulu hedefe yaklaştıran satır hangisi, ve hedefe asla ulaşılamazsa ne olur? Son soru için bir üst sınır (en fazla 600 ay gibi) koymak, üretim kodunda hayat kurtarır.</p>

<h2>Döngüde liste değiştirme tuzağı</h2>
<p>Gezdiğin listeden eleman silmek, Python'daki en sinsi hatalardan biridir: hata vermez, sessizce eleman atlar. Sebep: for döngüsü içeride bir indeks sayacı tutar; sen bir elemanı silince sonrakiler bir sola kayar ve sayaç bir sonrakini atlar.</p>
<pre class="py">siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
for s in siparisler:
    if s == "iptal":
        siparisler.remove(s)
print("Yanlış:", siparisler)        # bir iptal kaldı!

siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
temiz = []
for s in siparisler:
    if s != "iptal":
        temiz.append(s)
print("Doğru (yeni liste):", temiz)

siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
for s in siparisler[:]:             # kopya üzerinde gez, orijinalden sil
    if s == "iptal":
        siparisler.remove(s)
print("Doğru (kopya üzerinde):", siparisler)</pre>
<p>En temiz yol, istediğin elemanlarla <b>yeni bir liste</b> kurmaktır (Orta seviyede bunu tek satırlık comprehension ile yapacaksın). Orijinal listeyi mutlaka yerinde değiştirmen gerekiyorsa kopyası üzerinde gez ya da listeyi sondan başa doğru gez. Aynı kural sözlükler için daha da serttir: gezerken sözlüğe anahtar ekleyip silmek <code>RuntimeError</code> verir.</p>

<div class="note"><b>Gerçek işte</b>Raporlama betiklerinin büyük kısmı bu kalıpların birleşimidir: gün sonu raporunda tek geçişte ciro, iade sayısı ve en büyük sipariş hesaplanır; dolandırıcılık izleme kuralı "aynı karttan 10 dakika içinde art arda 3 işlem" gibi komşu karşılaştırmasıdır; stok uyarısı doğrulama kalıbıdır; kredi simülatörü while döngüsüdür. Kod incelemesinde kıdemli bir geliştirici "burada en büyüğü 0 ile başlatmışsın, iade tutarları negatif" dediğinde konuştuğu şey bu dersin kendisidir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Döngü değişmezi (loop invariant)</h3>
<p>Doğru döngü yazmanın en güçlü düşünme aracı, her turun sonunda doğru kalan cümledir. En büyük bulma kalıbında değişmez şudur: "<code>en_buyuk</code>, şimdiye kadar görülen elemanların en büyüğüdür." Başlangıçta doğru olmalı (ilk elemanla başlatmanın sebebi), her tur korumalı ve döngü bitince sonucu vermeli. Hata ayıklarken "bu cümle hangi turda bozuldu?" diye sormak, rastgele print eklemekten çok daha hızlıdır.</p>
<h3>Karmaşıklık: kaç adım?</h3>
<div class="tbl-wrap"><table>
<tr><th>Kalıp</th><th>Adım sayısı</th><th>1 milyon eleman</th></tr>
<tr><td>Tek geçiş (sayaç, toplam, en büyük, arama)</td><td>n</td><td>Göz açıp kapayıncaya kadar</td></tr>
<tr><td>Erken çıkışlı arama</td><td>En iyi 1, en kötü n</td><td>Bulunacak yere bağlı</td></tr>
<tr><td>Tüm çiftler (iç içe döngü)</td><td>n × n / 2</td><td>Yarım trilyon: kullanılamaz</td></tr>
<tr><td>Sözlük/küme ile eşleme</td><td>n</td><td>Hızlı</td></tr>
</table></div>
<p>"Toplamı bütçeye eşit iki ürün" problemini iç içe döngü yerine tek geçişte çözebilirsin: gördüğün fiyatları bir kümede tut, her yeni fiyatta <code>butce - fiyat</code> kümede var mı diye bak. Bu, mülakatların en klasik sorusudur (two sum) ve kalıp birleştirmenin gücünü gösterir.</p>
<pre class="py">def butce_ikilisi(fiyatlar, butce):
    gorulen = set()
    for f in fiyatlar:
        if butce - f in gorulen:
            return (butce - f, f)
        gorulen.add(f)
    return None

print(butce_ikilisi([150, 350, 200, 50], 400))
print(butce_ikilisi([10, 20], 100))</pre>
<h3>Kalıptan yerleşik fonksiyona</h3>
<p>Kalıbı tanıdıktan sonra kısaltmasını kullanmak profesyonel koddur: sayaç → <code>sum(1 for x in v if ...)</code>, biriktirici → <code>sum</code>, en iyi → <code>max(v, key=...)</code>, arama → <code>next((x for x in v if ...), None)</code>, doğrulama → <code>all</code>, frekans → <code>collections.Counter</code>, komşu çiftleri → <code>itertools.pairwise</code>. Bunların çoğunu Orta seviyede göreceksin. Ama kısaltma çalışmadığında ya da kural karmaşıklaştığında açık döngüye dönebilmek, kalıbı bilmekle mümkün.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Günlük kâr/zarar listesinde en yüksek değeri <code>max</code> kullanmadan bulacaksın. Değerlerin hepsi negatif olabilir. <code>en_buyuk</code> neyle başlatılmalı?',
      o: ['0 ile, çünkü nötr değerdir', 'Listenin ilk elemanıyla', 'Listenin uzunluğuyla', '1 ile, çarpım gibi'],
      a: 1,
      why: '0 ile başlarsan tüm değerler negatifken hiçbir değer 0\'dan büyük olmaz ve sonuç yanlışlıkla 0 çıkar. İlk eleman (ya da float("-inf")) her durumda doğru başlangıçtır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir listede günlük satışların bir önceki güne göre kaç kez arttığını sayacaksın. Hangi döngü başlığı doğru ve güvenlidir?',
      o: ['for i in range(len(s)): ... s[i] > s[i - 1]', 'for i in range(1, len(s)): ... s[i] > s[i - 1]', 'for i in range(len(s)): ... s[i + 1] > s[i]', 'for x in s: ... x > x - 1'],
      a: 1,
      why: 'İlk günün öncesi yoktur, bu yüzden indeks 1\'den başlanır. 0\'dan başlamak s[-1] ile son günü okur (hatasız ama yanlış); s[i + 1] son turda IndexError verir; x > x - 1 her zaman doğrudur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'for-else ve break: bu kod ne yazdırır?',
      code: 'stoklar = {"çay": 12, "kahve": 0, "şeker": 3}\nfor urun, adet in stoklar.items():\n    if adet == 0:\n        print("Tükendi:", urun)\n        break\nelse:\n    print("Hepsi stokta")\nprint("bitti")\n',
      o: ['Tükendi: kahve\nbitti', 'Tükendi: kahve\nHepsi stokta\nbitti', 'Hepsi stokta\nbitti', 'Tükendi: kahve'],
      a: 0,
      why: 'kahve\'de break çalışır; döngü break ile bittiği için else bloğu atlanır. Döngüden sonraki "bitti" her durumda yazılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Komşu karşılaştırma: bu kod ne yazdırır?',
      code: 's = [5, 7, 7, 3, 8, 9]\nartis = azalis = 0\nfor onceki, simdi in zip(s, s[1:]):\n    if simdi > onceki:\n        artis += 1\n    elif simdi < onceki:\n        azalis += 1\nprint(artis, azalis)\n',
      o: ['3 1', '4 1', '3 2', '3 1 1'],
      a: 0,
      why: 'Çiftler: (5,7) artış, (7,7) eşit, (7,3) azalış, (3,8) artış, (8,9) artış. 6 elemandan 5 çift çıkar; eşit çift hiçbir sayaca girmez: 3 artış, 1 azalış.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Döngüde silme tuzağı: bu kod ne yazdırır?',
      code: 'tutarlar = [10, -5, -8, 20, -1]\nfor t in tutarlar:\n    if t < 0:\n        tutarlar.remove(t)\nprint(tutarlar)\n',
      o: ['[10, 20]', '[10, -8, 20]', '[10, -8, 20, -1]', 'RuntimeError hatası verir'],
      a: 1,
      why: '-5 silinince -8 onun yerine kayar ve döngü bir sonraki konuma (20) geçer; -8 hiç kontrol edilmez. -1 ise ayrıca kontrol edilip silinir. Listeler bu durumda hata vermez, sessizce eleman atlar.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Aylık %2 faizle 1000 TL\'nin 1200 TL\'ye kaç ayda ulaştığını bulan programın satırlarını sırala.</p>',
      lines: ['bakiye = 1000', 'ay = 0', 'while bakiye < 1200:', '    bakiye = bakiye * 1.02', '    ay += 1', 'print(ay, "ay")'],
      expect: '10 ay\n',
      hint: 'Başlangıç değerleri döngüden önce; koşulu hedefe yaklaştıran satır ve sayaç döngünün içinde; sonuç döngüden sonra.',
      why: 'while kalıbı: durumu başlat, koşul sağlandıkça durumu güncelle ve adım say, döngü bitince sonucu kullan. 1000 × 1.02¹⁰ ≈ 1218.99 ile ilk kez 1200\'ü geçer.' },
    { id: 'dongu-kaliplari-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>en_dusuk_bakiye(hesaplar)</code> fonksiyonunu <b>min kullanmadan</b> yaz. <code>hesaplar</code>, <code>(hesap_no, bakiye)</code> demetlerinden oluşan bir listedir. En düşük bakiyeli hesabın demetini döndür; eşitlikte <b>ilk görüleni</b> seç. Liste boşsa <code>None</code> döndür.</p>',
      guide: ['Liste boşsa hemen None döndür.', 'En iyi adayı listenin ilk elemanıyla başlat (0 ile değil!).', 'Kalan elemanları gez; bakiyesi adayınkinden kesinlikle küçükse adayı değiştir.', 'Döngü bitince adayı döndür.'],
      example: 'urunler = [("çay", 120), ("kahve", 350), ("şeker", 45)]\nen_pahali = urunler[0]\nfor u in urunler[1:]:\n    if u[1] > en_pahali[1]:\n        en_pahali = u\nprint(en_pahali)\n',
      start: 'def en_dusuk_bakiye(hesaplar):\n    # TODO: boş liste kontrolü\n    aday = None  # TODO: ilk elemanla başlat\n    for hesap in hesaplar:\n        # TODO: daha düşük bakiye gelirse adayı değiştir\n        pass\n    return aday\n',
      sol: 'def en_dusuk_bakiye(hesaplar):\n    if not hesaplar:\n        return None\n    aday = hesaplar[0]\n    for hesap in hesaplar:\n        if hesap[1] < aday[1]:\n            aday = hesap\n    return aday\n',
      tests: 'assert en_dusuk_bakiye([("H-1", 500), ("H-2", -120), ("H-3", 40)]) == ("H-2", -120), "en düşük bakiye H-2 (-120)"\nassert en_dusuk_bakiye([("H-1", 300), ("H-2", 100), ("H-3", 100)]) == ("H-2", 100), "eşitlikte ilk görülen (H-2) seçilmeli: < kullan, <= değil"\nassert en_dusuk_bakiye([("H-1", 50), ("H-2", 80)]) == ("H-1", 50), "hepsi pozitifken de doğru çalışmalı (0 ile başlatma tuzağı)"\nassert en_dusuk_bakiye([]) is None, "boş liste None döndürmeli"\nassert "min(" not in __source__, "min kullanmadan kalıbı kendin yaz"\n',
      hints: ['En iyi değer kalıbı: aday = ilk eleman, sonra karşılaştır.', 'Bakiye demetin 1. indeksinde: hesap[1] < aday[1]', 'if hesap[1] < aday[1]: aday = hesap'],
      why: 'İlk elemanla başlamak değişmezi baştan doğru kurar; kesin küçüktür (<) eşitlikte ilk görüleni korur.' },
    { id: 'dongu-kaliplari-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>degisim_raporu(satislar)</code> fonksiyonunu yaz. Günlük satış listesindeki her ardışık gün çifti için değişimi incelesin ve <code>{"artis": a, "azalis": b, "sabit": c, "en_buyuk_dusus": d}</code> döndürsün. <code>en_buyuk_dusus</code>, bir günden ertesine en büyük düşüş miktarıdır (pozitif sayı); hiç düşüş yoksa 0.</p>',
      guide: ['Dört sonucu döngüden önce 0 ile başlat.', 'zip(satislar, satislar[1:]) ile (onceki, simdi) çiftlerini gez.', 'if/elif/else ile artis, azalis ya da sabit sayacını artır.', 'Azalışta düşüş miktarını (onceki - simdi) hesapla; en_buyuk_dusus\'ten büyükse güncelle.', 'Sözlüğü döndür.'],
      example: 'sicaklik = [18, 21, 21, 17]\nfor dun, bugun in zip(sicaklik, sicaklik[1:]):\n    print(dun, "→", bugun, "fark:", bugun - dun)\n',
      start: 'def degisim_raporu(satislar):\n    artis = azalis = sabit = 0\n    en_buyuk_dusus = 0\n    # TODO: komşu çiftleri gez ve sayaçları güncelle\n    return {"artis": artis, "azalis": azalis, "sabit": sabit, "en_buyuk_dusus": en_buyuk_dusus}\n',
      sol: 'def degisim_raporu(satislar):\n    artis = azalis = sabit = 0\n    en_buyuk_dusus = 0\n    for onceki, simdi in zip(satislar, satislar[1:]):\n        if simdi > onceki:\n            artis += 1\n        elif simdi < onceki:\n            azalis += 1\n            if onceki - simdi > en_buyuk_dusus:\n                en_buyuk_dusus = onceki - simdi\n        else:\n            sabit += 1\n    return {"artis": artis, "azalis": azalis, "sabit": sabit, "en_buyuk_dusus": en_buyuk_dusus}\n',
      tests: 'r = degisim_raporu([120, 135, 135, 150, 90, 110, 100])\nassert r == {"artis": 3, "azalis": 2, "sabit": 1, "en_buyuk_dusus": 60}, f"beklenen 3 artış, 2 azalış, 1 sabit, en büyük düşüş 60 (150→90); gelen {r}"\nassert degisim_raporu([5]) == {"artis": 0, "azalis": 0, "sabit": 0, "en_buyuk_dusus": 0}, "tek günde karşılaştırılacak çift yok"\nassert degisim_raporu([])["artis"] == 0, "boş listede hata olmamalı"\nassert degisim_raporu([1, 2, 3])["en_buyuk_dusus"] == 0, "düşüş yoksa 0"\n',
      hints: ['n günden n-1 çift çıkar; zip(s, s[1:]) bunları verir.', 'Düşüş miktarı onceki - simdi (pozitif).', 'elif simdi < onceki: azalis += 1 ve ardından en büyük düşüş kontrolü'],
      why: 'Komşu karşılaştırma kalıbı ile en iyi değer kalıbı tek döngüde birleşir; zip kaydırması ilk günün öncesini okuma hatasını yapısal olarak önler.' },
    { id: 'dongu-kaliplari-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>ilk_supheli(islemler, limit)</code> fonksiyonunu yaz. <code>islemler</code> tutar listesidir. Mutlak değeri <code>limit</code>\'i aşan <b>ilk</b> işlemin indeksini döndür; böyle bir işlem yoksa <code>-1</code> döndür. Bulduğun anda döngüden çık.</p>',
      guide: ['enumerate ile hem indeksi hem tutarı gez.', 'abs(tutar) > limit ise indeksi hemen return et (erken çıkış).', 'Döngü bitip return olmadıysa "bulunamadı" demektir: -1 döndür.'],
      example: 'def ilk_bos_raf(raflar):\n    for i, adet in enumerate(raflar):\n        if adet == 0:\n            return i\n    return -1\n\nprint(ilk_bos_raf([4, 2, 0, 0]), ilk_bos_raf([1, 1]))\n',
      start: 'def ilk_supheli(islemler, limit):\n    for i, tutar in enumerate(islemler):\n        # TODO: limit aşılırsa indeksi döndür\n        pass\n    # TODO: bulunamadı\n',
      sol: 'def ilk_supheli(islemler, limit):\n    for i, tutar in enumerate(islemler):\n        if abs(tutar) > limit:\n            return i\n    return -1\n',
      tests: 'assert ilk_supheli([100, -250, 9000, 12000], 5000) == 2, "ilk aşan işlem indeks 2 (9000)"\nassert ilk_supheli([100, -7000, 9000], 5000) == 1, "negatif tutarlarda mutlak değer kullanılmalı (-7000)"\nassert ilk_supheli([100, 200], 5000) == -1, "hiç yoksa -1"\nassert ilk_supheli([], 10) == -1, "boş listede -1"\nassert ilk_supheli([5000], 5000) == -1, "limit\'e eşit olan aşmış sayılmaz"\n',
      hints: ['Doğrusal arama + erken dönüş.', 'abs(tutar) > limit', 'Döngüden sonra return -1'],
      why: 'Fonksiyon içinde return hem bayrağın hem break\'in yerini tutar; döngü sonuna gelinmesi "bulunamadı" anlamına gelir.' },
    { id: 'dongu-kaliplari-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Bank birikim simülatörü: <code>kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0)</code> fonksiyonunu while ile yaz. Her ay önce faiz eklenir (<code>bakiye *= 1 + aylik_faiz</code>), sonra <code>aylik_ek</code> yatırılır. Bakiyenin <code>hedef</code>\'e ulaştığı (<code>&gt;=</code>) ay sayısını döndür. Başta zaten hedefteyse 0 döndür. Hedefe 1200 ayda (100 yıl) ulaşılamıyorsa <code>None</code> döndür.</p>',
      start: 'def kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0):\n    pass\n',
      sol: 'def kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0):\n    ay = 0\n    while bakiye < hedef:\n        if ay >= 1200:\n            return None\n        bakiye *= 1 + aylik_faiz\n        bakiye += aylik_ek\n        ay += 1\n    return ay\n',
      tests: 'assert kac_ay(10000, 0.03, 15000) == 14, "10000 TL %3 ile 14. ayda 15000\'i geçer"\nassert kac_ay(1000, 0.0, 2000, 250) == 4, "faizsiz, ayda 250 ek ile 4 ay"\nassert kac_ay(5000, 0.05, 5000) == 0, "zaten hedefteyse 0 ay"\nassert kac_ay(1000, 0.0, 2000) is None, "faiz ve ek yoksa hedefe ulaşılamaz: None (sonsuz döngü olmamalı)"\nassert kac_ay(1000, 0.01, 1100, 0) == 10, "1000 × 1.01^10 ≈ 1104.6"\n',
      hints: ['while bakiye < hedef: ve döngü içinde ay sayacı.', 'Sonsuz döngüyü önlemek için ay 1200\'e ulaşınca None döndür.'],
      why: 'Kaç tur süreceği bilinmeyen tekrar while ister; üst sınır, hedefe hiç ulaşılamayan girdilerde programın donmasını engeller.' },
    { id: 'dongu-kaliplari-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>en_cok_satan(satislar)</code> fonksiyonunu yaz. <code>satislar</code>, satılan ürün adlarının listesidir. Önce frekansları say, sonra en çok satan ürünü <code>(urun, adet)</code> olarak döndür. Eşitlikte <b>alfabetik olarak önce gelen</b> ürünü seç. Liste boşsa <code>None</code> döndür. <code>max</code> ve <code>Counter</code> kullanma.</p>',
      start: 'def en_cok_satan(satislar):\n    pass\n',
      sol: 'def en_cok_satan(satislar):\n    frekans = {}\n    for u in satislar:\n        frekans[u] = frekans.get(u, 0) + 1\n    en_iyi = None\n    for urun, adet in frekans.items():\n        if en_iyi is None or adet > en_iyi[1] or (adet == en_iyi[1] and urun < en_iyi[0]):\n            en_iyi = (urun, adet)\n    return en_iyi\n',
      tests: 'assert en_cok_satan(["çay", "kahve", "çay", "su", "kahve", "çay"]) == ("çay", 3), "çay 3 kez satıldı"\nassert en_cok_satan(["su", "kahve", "su", "kahve"]) == ("kahve", 2), "eşitlikte alfabetik önce gelen (kahve) seçilmeli"\nassert en_cok_satan(["limon"]) == ("limon", 1), "tek ürün"\nassert en_cok_satan([]) is None, "boş liste None"\nassert "max(" not in __source__ and "Counter" not in __source__, "max ve Counter kullanmadan yaz"\n',
      hints: ['İki kalıp art arda: önce frekans sözlüğü, sonra en iyi değer.', 'Eşitlik kuralı: adet > en_iyi[1] ya da (adet eşit ve urun < en_iyi[0]).'],
      why: 'Frekans kalıbı veriyi özetler, en iyi değer kalıbı özetten seçim yapar; eşitlik kuralını karşılaştırmaya eklemek sonucu deterministik kılar.' },
    { id: 'dongu-kaliplari-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>carpim_tablosu(satir, sutun)</code> fonksiyonunu iç içe döngüyle yaz: 1\'den <code>satir</code>\'a kadar her i için 1\'den <code>sutun</code>\'a kadar i×j değerlerini her biri 4 karakter sağa yaslı olacak şekilde (<code>f"{x:4}"</code>) tek satırda yazdırsın. Program sonunda <code>carpim_tablosu(3, 5)</code> çağır.</p><pre class="out">   1   2   3   4   5\n   2   4   6   8  10\n   3   6   9  12  15</pre>',
      start: 'def carpim_tablosu(satir, sutun):\n    pass\n\ncarpim_tablosu(3, 5)\n',
      sol: 'def carpim_tablosu(satir, sutun):\n    for i in range(1, satir + 1):\n        metin = ""\n        for j in range(1, sutun + 1):\n            metin += f"{i * j:4}"\n        print(metin)\n\ncarpim_tablosu(3, 5)\n',
      expect: '   1   2   3   4   5\n   2   4   6   8  10\n   3   6   9  12  15\n',
      hints: ['Dış döngü satırlar, iç döngü sütunlar; range bitişi dahil etmez: range(1, satir + 1).', 'Her satır için boş metin başlat, iç döngüde ekle, iç döngü bitince yazdır.'],
      why: 'İç döngü her dış turda baştan çalışır; satır metnini iç döngüde biriktirip dış döngüde yazdırmak tabloyu satır satır üretir.' },
    { id: 'dongu-kaliplari-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kampanya ekibi "iki ürün al, bütçeyi tam kullan" önerisi istiyor. <code>butce_ikilileri(urunler, butce)</code> fonksiyonunu yaz: <code>urunler</code>, <code>(ad, fiyat)</code> listesidir. Fiyatları toplamı tam <code>butce</code>\'ye eşit olan tüm farklı ürün ikililerini <code>(ad1, ad2)</code> demetleri olarak döndür. ad1 listede ad2\'den önce gelen ürün olsun; ikililer bulunma sırasıyla listelensin. Bir ürün kendisiyle eşleşmesin.</p>',
      start: 'def butce_ikilileri(urunler, butce):\n    pass\n',
      sol: 'def butce_ikilileri(urunler, butce):\n    sonuc = []\n    for i in range(len(urunler)):\n        for j in range(i + 1, len(urunler)):\n            if urunler[i][1] + urunler[j][1] == butce:\n                sonuc.append((urunler[i][0], urunler[j][0]))\n    return sonuc\n',
      tests: 'u = [("çay", 150), ("kahve", 250), ("kupa", 200), ("şeker", 50), ("termos", 350), ("bardak", 200)]\nassert butce_ikilileri(u, 400) == [("çay", "kahve"), ("kupa", "bardak"), ("şeker", "termos")], f"çay+kahve, kupa+bardak, şeker+termos bekleniyordu (bulunma sırasıyla); gelen {butce_ikilileri(u, 400)}"\nassert butce_ikilileri(u, 100) == [], "50 + 50 için iki farklı ürün yok: ürün kendisiyle eşleşmemeli"\nassert butce_ikilileri([], 10) == [], "boş liste"\n',
      hints: ['Tüm çiftler için iç döngü i + 1\'den başlar.', 'urunler[i][1] + urunler[j][1] == butce'],
      why: 'İç döngünün i + 1\'den başlaması her çifti bir kez ve elemanı kendisiyle eşlemeden üretir.' },
    { id: 'dongu-kaliplari-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>en_kotu_gun(gunluk_kar)</code> en düşük kâr değerini ve onun gün numarasını (1\'den başlayarak) <code>(gun, deger)</code> olarak döndürmeli. Zarar eden günleri olan şubede doğru çalışıyor ama tüm günleri kârlı bir şubede saçma sonuç veriyor.</p>',
      start: 'def en_kotu_gun(gunluk_kar):\n    en_kotu = 0\n    gun = 0\n    for i, k in enumerate(gunluk_kar, start=1):\n        if k < en_kotu:\n            en_kotu = k\n            gun = i\n    return (gun, en_kotu)\n',
      sol: 'def en_kotu_gun(gunluk_kar):\n    en_kotu = gunluk_kar[0]\n    gun = 1\n    for i, k in enumerate(gunluk_kar, start=1):\n        if k < en_kotu:\n            en_kotu = k\n            gun = i\n    return (gun, en_kotu)\n',
      tests: 'assert en_kotu_gun([300, -50, 120, -400, 80]) == (4, -400), "zararlı şubede 4. gün -400"\nassert en_kotu_gun([300, 150, 220]) == (2, 150), "tüm günler kârlıyken en kötü gün 2. gün (150) olmalı: 0 ile başlatma tuzağı"\nassert en_kotu_gun([75]) == (1, 75), "tek günlük veride o gün döner"\n',
      hints: ['Başlangıç değeri 0 olunca pozitif değerlerin hiçbiri ondan küçük olmaz.', 'Adayı ilk elemanla ve gün 1 ile başlat.'],
      why: 'En iyi değer kalıbında başlangıç, verinin içinden gelmelidir; 0 gibi dışarıdan bir değer, değişmezi ("aday, görülenlerin en küçüğüdür") baştan bozar.' },
    { id: 'dongu-kaliplari-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>iptalleri_temizle(siparisler)</code> durumu <code>"iptal"</code> olan sözlükleri listeden <b>yerinde</b> (aynı liste nesnesinde) çıkarmalı ve çıkarılan sipariş sayısını döndürmeli. Art arda iki iptal geldiğinde biri listede kalıyor.</p>',
      start: 'def iptalleri_temizle(siparisler):\n    sayi = 0\n    for s in siparisler:\n        if s["durum"] == "iptal":\n            siparisler.remove(s)\n            sayi += 1\n    return sayi\n',
      sol: 'def iptalleri_temizle(siparisler):\n    sayi = 0\n    for s in siparisler[:]:\n        if s["durum"] == "iptal":\n            siparisler.remove(s)\n            sayi += 1\n    return sayi\n',
      tests: 'liste = [{"no": 1, "durum": "iptal"}, {"no": 2, "durum": "iptal"}, {"no": 3, "durum": "aktif"}, {"no": 4, "durum": "iptal"}]\nayni = liste\nn = iptalleri_temizle(liste)\nassert [s["no"] for s in liste] == [3], f"yalnız 3 numaralı sipariş kalmalı; kalanlar {[s[\'no\'] for s in liste]}"\nassert n == 3, f"3 iptal çıkarılmalı; gelen {n}"\nassert liste is ayni, "liste yerinde değiştirilmeli (aynı nesne)"\n',
      hints: ['Gezdiğin listeden silince elemanlar sola kayar ve döngü bir elemanı atlar.', 'Kopya üzerinde gez (siparisler[:]), orijinalden sil.'],
      why: 'Kopya üzerinde gezmek döngünün iç sayacını silmelerden bağımsız kılar; silmeler orijinal liste nesnesine uygulandığından çağıranın listesi de güncellenir.' },
    { id: 'dongu-kaliplari-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><code>en_uzun_artis(degerler)</code> fonksiyonunu yaz: listedeki <b>kesin artan</b> (her eleman bir öncekinden büyük) en uzun ardışık bölümü bulsun ve <code>(baslangic_indeksi, uzunluk)</code> döndürsün. Uzunluk eleman sayısıdır (tek eleman da 1 uzunluğunda bir seridir). Eşit uzunlukta birden fazla seri varsa <b>ilkini</b> döndür. Boş liste için <code>(-1, 0)</code> döndür. Tek geçişte çöz.</p>',
      start: 'def en_uzun_artis(degerler):\n    pass\n',
      sol: 'def en_uzun_artis(degerler):\n    if not degerler:\n        return (-1, 0)\n    en_bas, en_uzun = 0, 1\n    bas, uzun = 0, 1\n    for i in range(1, len(degerler)):\n        if degerler[i] > degerler[i - 1]:\n            uzun += 1\n        else:\n            bas, uzun = i, 1\n        if uzun > en_uzun:\n            en_bas, en_uzun = bas, uzun\n    return (en_bas, en_uzun)\n',
      tests: 'assert en_uzun_artis([5, 1, 2, 3, 2, 4, 6, 8, 1]) == (4, 4), "2,4,6,8 serisi indeks 4\'ten başlar, uzunluk 4"\nassert en_uzun_artis([1, 2, 2, 3]) == (0, 2), "eşit değer seriyi kırar; ilk eşit uzunluktaki seri (0, 2) seçilir"\nassert en_uzun_artis([9, 7, 5]) == (0, 1), "hiç artış yoksa ilk eleman tek başına seridir"\nassert en_uzun_artis([1, 2, 3, 4]) == (0, 4), "liste sonuna kadar süren seri de sayılmalı"\nassert en_uzun_artis([7]) == (0, 1), "tek eleman"\nassert en_uzun_artis([]) == (-1, 0), "boş liste (-1, 0)"\nassert en_uzun_artis([3, 1, 2, 0, 5]) == (1, 2), "eşitlikte ilk seri"\n',
      hints: ['İki durum tut: şu anki seri (başlangıç, uzunluk) ve en iyi seri.', 'Artış yoksa yeni seri bu indekste başlar: bas, uzun = i, 1.', 'En iyiyi döngünün içinde, her adımda güncelle; böylece sona kadar süren seri de yakalanır. Eşitlikte güncelleme yapma (> kullan).'],
      why: 'Komşu karşılaştırma (seri) ile en iyi değer kalıbı birleşir. En iyiyi her turda kontrol etmek, liste sonunda biten seriyi kaçırma hatasını önler; kesin büyüktür eşitlikte ilk seriyi korur.' },
    { id: 'dongu-kaliplari-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market şube müdürü için aylık satış raporu: <code>aylik_rapor(gunluk, hedef)</code> fonksiyonunu yaz. <code>gunluk</code>, günlük ciro listesidir (gün 1\'den başlar). Tek geçişte şu anahtarlarla bir sözlük döndür:</p><ul><li><code>"toplam"</code>: toplam ciro</li><li><code>"ortalama"</code>: 2 ondalığa yuvarlanmış ortalama (boş listede 0)</li><li><code>"en_iyi_gun"</code>: en yüksek cirolu günün numarası (eşitlikte ilki; boşsa None)</li><li><code>"artis_gunu"</code>: bir önceki güne göre ciro artan gün sayısı</li><li><code>"hedef_gunu"</code>: kümülatif cironun ilk kez <code>hedef</code>\'e ulaştığı (<code>&gt;=</code>) gün numarası; ulaşılmadıysa None</li></ul><p><code>sum</code>, <code>max</code>, <code>min</code> kullanma.</p>',
      start: 'def aylik_rapor(gunluk, hedef):\n    # TODO: tek döngüde tüm kalıpları birleştir\n    pass\n',
      sol: 'def aylik_rapor(gunluk, hedef):\n    toplam = 0\n    en_iyi_gun = None\n    en_iyi = None\n    artis = 0\n    hedef_gunu = None\n    onceki = None\n    for gun, ciro in enumerate(gunluk, start=1):\n        toplam += ciro\n        if en_iyi is None or ciro > en_iyi:\n            en_iyi, en_iyi_gun = ciro, gun\n        if onceki is not None and ciro > onceki:\n            artis += 1\n        if hedef_gunu is None and toplam >= hedef:\n            hedef_gunu = gun\n        onceki = ciro\n    ortalama = round(toplam / len(gunluk), 2) if gunluk else 0\n    return {"toplam": toplam, "ortalama": ortalama, "en_iyi_gun": en_iyi_gun,\n            "artis_gunu": artis, "hedef_gunu": hedef_gunu}\n',
      tests: 'r = aylik_rapor([1200, 900, 1500, 1500, 800, 2100], 4000)\nassert r is not None, "fonksiyon sözlük döndürmeli"\nassert r["toplam"] == 8000, "toplam 8000"\nassert r["ortalama"] == 1333.33, "ortalama 8000/6 = 1333.33"\nassert r["en_iyi_gun"] == 6, "en yüksek ciro 6. gün (2100)"\nassert r["artis_gunu"] == 2, "artış: 900→1500 ve 800→2100; eşit gün artış sayılmaz"\nassert r["hedef_gunu"] == 4, "kümülatif: 1200, 2100, 3600, 5100 → 4. gün hedefe ulaşır"\nr2 = aylik_rapor([500, 500], 5000)\nassert r2["en_iyi_gun"] == 1 and r2["hedef_gunu"] is None, "eşitlikte ilk gün; hedefe ulaşılmazsa None"\nassert aylik_rapor([], 100) == {"toplam": 0, "ortalama": 0, "en_iyi_gun": None, "artis_gunu": 0, "hedef_gunu": None}, "boş ay için sıfır rapor"\nfor yasak in ("sum(", "max(", "min("):\n    assert yasak not in __source__, f"{yasak} kullanmadan kalıpları kendin yaz"\n',
      hints: ['Tek döngüde beş kalıp: biriktirici (toplam), en iyi değer, komşu karşılaştırma (onceki değişkeni), ilk kez olan olay (hedef_gunu None ise kontrol et).', 'onceki değişkenini None ile başlat ve her turun sonunda güncelle.', 'Ortalamayı döngüden sonra hesapla; boş liste için sıfıra bölmeyi önle.'],
      why: 'Gerçek raporlar tek bir kalıptan değil, aynı geçişte birlikte çalışan birkaç kalıptan oluşur. Her kalıbın kendi başlangıç değeri ve güncelleme kuralı olduğunu bilmek, bunları karıştırmadan tek döngüde birleştirmeni sağlar.' }
  ],
  faq: [
    { q: 'max ve min varken neden elle en büyük bulmayı öğreniyorum?',
      a: 'Çünkü çoğu zaman değerin kendisini değil, ona ait kaydı, konumu ya da özel bir eşitlik kuralını istersin. Ayrıca karmaşık kurallarda (iptal edilmemiş en büyük sipariş gibi) kalıbı bilmek gerekir. max(liste, key=...) bunun kısaltmasıdır; Orta seviyede göreceksin.' },
    { q: 'Bayrak değişkeni mi, for-else mi, return mü?',
      a: 'Fonksiyon içindeysen erken return en okunur olanıdır. Fonksiyon dışında, sonucu sonra kullanacaksan bayrak; yalnız "bulunamadı" durumunda bir şey yapacaksan for-else kısa ve açıktır.' },
    { q: 'İç içe döngü her zaman kötü mü?',
      a: 'Hayır. Küçük verilerde ya da gerçekten tüm kombinasyonlara bakman gerekiyorsa doğru araçtır. Sorun büyük veride başlar: 10 bin elemanlı listede tüm çiftler 50 milyon işlem eder. O zaman sözlük ya da kümeyle tek geçişe indirmenin yolunu ara.' },
    { q: 'while True ile döngü kurmak kötü bir alışkanlık mı?',
      a: 'Bilinçli kullanıldığında değil: menü döngüleri, kuyruk dinleyicileri ve "en az bir kez çalış" gerektiren işler için yaygındır. Şart olan, döngünün içinde mutlaka bir break ya da return olması ve çıkış koşulunun açık olmasıdır.' }
  ],
  mistakes: [
    { why: 'Tüm değerler negatifse 0 yanlış sonuç verir; aday her zaman verinin içinden başlamalı.',
      bad: 'en_buyuk = 0\nfor x in degerler:\n    if x > en_buyuk:\n        en_buyuk = x',
      good: 'en_buyuk = degerler[0]\nfor x in degerler:\n    if x > en_buyuk:\n        en_buyuk = x' },
    { why: 'i = 0 iken s[-1] son elemanı okur; hata vermez ama sonucu bozar.',
      bad: 'for i in range(len(s)):\n    if s[i] > s[i - 1]:\n        artis += 1',
      good: 'for i in range(1, len(s)):\n    if s[i] > s[i - 1]:\n        artis += 1' },
    { why: 'Gezilen listeden silmek elemanları kaydırır ve bazılarını atlatır.',
      bad: 'for s in siparisler:\n    if s == "iptal":\n        siparisler.remove(s)',
      good: 'siparisler = [s for s in siparisler if s != "iptal"]\n# ya da: for s in siparisler[:]: ...' },
    { why: 'Çarpım biriktiricisi 1 ile başlar; 0 ile başlarsan sonuç hep 0 olur.',
      bad: 'carpim = 0\nfor x in oranlar:\n    carpim *= x',
      good: 'carpim = 1\nfor x in oranlar:\n    carpim *= x' },
    { why: 'Faiz 0 ya da negatifse koşul hiç bozulmaz; üst sınır sonsuz döngüyü önler.',
      bad: 'while bakiye < hedef:\n    bakiye *= 1 + faiz',
      good: 'ay = 0\nwhile bakiye < hedef and ay < 1200:\n    bakiye *= 1 + faiz\n    ay += 1' }
  ] }
);
})(window);
