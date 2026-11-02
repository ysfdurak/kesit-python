/* Kesit Python — v2/n1: Veri rolleri mülakatı: SQL, pandas, istatistik ve vaka soruları */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'veri-mulakat',
    lv: 'ileri',
    mod: 'Üretime Hazırlık',
    min: 70,
    needs: ['pandas', 'numpy', 'sqlite3'],
    title: 'Veri rolleri mülakatı: SQL, pandas, istatistik ve vaka soruları',
    sum: 'Analist, bilimci ve veri mühendisi mülakatları için 15 SQL kalıbı, pandas canlı kodlama (merge, transform, pivot, zaman penceresi), istatistik soruları (p-değeri, GA, güç, SRM, çoklu test, bootstrap), "metrik düştü" vaka çerçevesi, ML ve veri mühendisliği soruları, take-home teslimi ve Anadolu Market verisinde zamanlı deneme seti.',
    goals: [
      'Mülakattaki SQL sorularını 15 kalıptan birine indirgeyip kenar durumları sorarak çözebilirim',
      'pandas canlı kodlamada merge, groupby + transform, pivot ve zaman penceresini hatasız kullanabilirim',
      'A/B sonucunu SRM, z-testi, güven aralığı ve bootstrap ile değerlendirip karar cümlesi kurabilirim',
      '"Metrik düştü" vaka sorusunu yapılandırılmış bir çerçeveyle ve veriyle cevaplayabilirim',
      'Zamanlı bir deneme setini süre içinde çözüp sonucu iki cümleyle anlatabilirim'
    ],
    body: `<h2>Veri mülakatı neyi ölçer?</h2>
<p><b>Mülakat hazırlığı</b> dersinde algoritma kalıplarını ve canlı kodlamayı gördün. Veri rollerinde (analist, veri bilimci, veri mühendisi, ML mühendisi) mülakat başka bir yere ağırlık verir: gerçek bir tabloda <b>doğru sayıyı</b> hızlı ve savunulabilir biçimde üretmek, istatistiksel sonucu doğru yorumlamak ve belirsiz bir iş sorusunu analize çevirmek. Tipik bir süreç dört turdan oluşur:</p>
<div class="tbl-wrap"><table>
<tr><th>Tur</th><th>Süre</th><th>Ne ölçülür?</th><th>Tipik soru</th></tr>
<tr><td>SQL canlı</td><td>30–45 dk</td><td>JOIN, GROUP BY, pencere, NULL, tanecik düzeyi</td><td>"Her departmanın en yüksek maaşlı çalışanı"</td></tr>
<tr><td>pandas / Python canlı</td><td>30–45 dk</td><td>merge, groupby + transform, pivot, zaman penceresi</td><td>"Her siparişin müşterinin toplam harcamasındaki payı"</td></tr>
<tr><td>İstatistik ve deney</td><td>30 dk</td><td>p-değeri, güven aralığı, güç, SRM, çoklu test</td><td>"B varyantı kazandı mı, yayına alalım mı?"</td></tr>
<tr><td>Ürün / vaka</td><td>45 dk</td><td>Problem çerçeveleme, metrik ağacı, öncelik</td><td>"Sipariş sayısı %10 düştü, nasıl araştırırsın?"</td></tr>
</table></div>
<p>Bu derste her tur için kalıpları Anadolu Market verisinde çalışacak, alıştırmaları <b>zamanlı deneme</b> gibi çözeceksin: her görevin yanında hedef süre var. Süreyi tut; mülakatta doğru cevap kadar ona ulaşma hızın ve konuşma biçimin de puanlanır.</p>

<h2>1. SQL turu: 15 kalıp</h2>
<p>Soruların çoğu birkaç kalıbın varyasyonudur. Kalıbı tanıdığın an çözüm iskeleti hazırdır; ayrıntılar <b>Python'dan SQL ile analiz</b> dersinde.</p>
<div class="tbl-wrap"><table>
<tr><th>#</th><th>Kalıp</th><th>Çekirdek teknik</th></tr>
<tr><td>1</td><td>n'inci en yüksek değer</td><td><code>DENSE_RANK() OVER (ORDER BY x DESC) = n</code></td></tr>
<tr><td>2</td><td>Grup içi en iyi / ilk k</td><td><code>ROW_NUMBER/RANK OVER (PARTITION BY g ...)</code></td></tr>
<tr><td>3</td><td>Tekilleştirme (son kayıt)</td><td><code>ROW_NUMBER ... DESC = 1</code></td></tr>
<tr><td>4</td><td>Hiç ... olmayanlar</td><td><code>NOT EXISTS</code> / <code>LEFT JOIN ... IS NULL</code></td></tr>
<tr><td>5</td><td>Oran ve yüzde</td><td><code>100.0 * SUM(kosul) / COUNT(*)</code></td></tr>
<tr><td>6</td><td>Koşullu toplama ile pivot</td><td><code>SUM(CASE WHEN kanal = 'web' THEN 1 ELSE 0 END)</code></td></tr>
<tr><td>7</td><td>Kümülatif toplam / YTD</td><td><code>SUM() OVER (PARTITION BY yıl ORDER BY ay)</code></td></tr>
<tr><td>8</td><td>Dönem değişimi</td><td><code>LAG()</code>, filtre CTE dışında</td></tr>
<tr><td>9</td><td>Hareketli ortalama</td><td><code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code></td></tr>
<tr><td>10</td><td>Ardışık dönemler (boşluk-ada)</td><td><code>değer − ROW_NUMBER()</code> ile grup</td></tr>
<tr><td>11</td><td>Kohort / tutundurma</td><td>İlk tarih CTE'si + dönem farkı</td></tr>
<tr><td>12</td><td>Kendine birleştirme</td><td>Çalışan–yönetici, ardışık olay</td></tr>
<tr><td>13</td><td>Grup içi pay</td><td><code>x / SUM(x) OVER (PARTITION BY g)</code></td></tr>
<tr><td>14</td><td>Medyan / yüzdelik</td><td><code>PERCENTILE_CONT</code> (PostgreSQL) ya da sıra ile</td></tr>
<tr><td>15</td><td>Yinelenen kayıt bulma</td><td><code>GROUP BY anahtar HAVING COUNT(*) &gt; 1</code></td></tr>
</table></div>
<pre class="py">import veri
con = veri.baglan("anadolu_market", tablolar=["employees", "departments"])

# Kalıp 1 ve 2: ikinci en yüksek maaş ve her departmanın en yükseği
ikinci = """
WITH r AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr FROM employees)
SELECT DISTINCT salary FROM r WHERE dr = 2
"""
print(con.execute(ikinci).fetchall())

lider = """
WITH r AS (
  SELECT dept_id, first_name, salary,
         RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk
  FROM employees WHERE dept_id IS NOT NULL
)
SELECT dept_id, first_name, salary FROM r WHERE rk = 1 ORDER BY dept_id
"""
for satir in con.execute(lider):
    print(satir)</pre>
<div class="tip"><b>SQL turunda konuşma sırası</b>(1) Soruyu kendi cümlenle tekrarla ve tanecik düzeyini söyle: "employees çalışan başına bir satır". (2) Kenar durumları sor: eşitlik olursa? NULL departman? İkinci en yüksek yoksa NULL mı dönmeli? (3) İskeleti CTE adımlarıyla yaz. (4) Küçük bir örnekle sonucu sözlü doğrula. Mülakatçı çoğu zaman yarıda bir koşul değiştirir ("şimdi ilk 3'ü getir"); CTE'li kod bunu bir satırla karşılar.</div>
<pre class="py">import sqlite3
con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE m (id INT); INSERT INTO m VALUES (1), (2), (3);
CREATE TABLE kara (id INT); INSERT INTO kara VALUES (2), (NULL);
""")
print("NOT IN    :", con.execute("SELECT id FROM m WHERE id NOT IN (SELECT id FROM kara)").fetchall())
print("NOT EXISTS:", con.execute("SELECT id FROM m WHERE NOT EXISTS (SELECT 1 FROM kara k WHERE k.id = m.id)").fetchall())
print("tamsayı bölme:", con.execute("SELECT 1 / 2, 100.0 * 1 / 2").fetchone())
print("COUNT(*) / COUNT(id):", con.execute("SELECT COUNT(*), COUNT(id) FROM kara").fetchone())</pre>
<p>En sık tuzak soruları: <code>COUNT(*)</code> ile <code>COUNT(sutun)</code> farkı, LEFT JOIN + WHERE, JOIN sonrası satır çoğalması, <code>NOT IN</code> listesinde NULL olunca hiçbir satırın dönmemesi, <code>WHERE</code> ile <code>HAVING</code> farkı ve tamsayı bölmesi (<code>1 / 2 = 0</code>; <code>100.0 *</code> ile başla).</p>

<h2>2. pandas canlı kodlama</h2>
<p>pandas turunda mülakatçı genellikle iki ya da üç tablo verir ve adım adım soru ekler. Dört kalıp soruların büyük kısmını karşılar:</p>
<pre class="py">import veri
import pandas as pd

o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
i = veri.oku("anadolu_market", "order_items")
c = veri.oku("anadolu_market", "customers")
i["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])

# 1) merge: önce sipariş düzeyine indir, sonra birleştir (çoğalmayı önle)
s = (o[o["status"].isin(["delivered", "shipped"])]
     .merge(i.groupby("order_id", as_index=False)["net"].sum(), on="order_id", validate="one_to_one"))

# 2) groupby + transform: grubun özetini satıra geri yaz
s["musteri_toplam"] = s.groupby("customer_id")["net"].transform("sum")
s["pay"] = s["net"] / s["musteri_toplam"]

# 3) pivot: yıl × ay
p = s.assign(yil=s["order_date"].dt.year, ay=s["order_date"].dt.month)
print(p.pivot_table(index="yil", columns="ay", values="net", aggfunc="sum", fill_value=0).round(0).iloc[:, :4])

# 4) zaman penceresi: son 7 günün cirosu
gunluk = s.set_index("order_date").sort_index()["net"].resample("D").sum()
print(gunluk.rolling("7D").sum().nlargest(1).round(2))

# şehir kırılımı: müşteri bilgisi ayrı tabloda, many_to_one doğrula
print(s.merge(c[["customer_id", "city"]], on="customer_id", how="left", validate="many_to_one")
       .groupby("city", dropna=False)["net"].sum().nlargest(3).round(2))</pre>
<div class="warn"><b>Canlı kodlamada sessiz hatalar</b>Mülakatçılar kasıtlı olarak yinelenen anahtar, boş değer ve tarih metni içeren tablolar verir. Her merge'e <code>validate</code>, her gruplamadan önce <code>dropna=False</code> sorusu, her tarih sütununa <code>parse_dates</code> ekle; sonucu <code>len()</code> ile kontrol et. "Merge'ten sonra satır sayısını kontrol ediyorum" demek puan kazandırır.</div>

<h2>3. İstatistik ve deney soruları</h2>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Güçlü cevabın özü</th><th>Kırmızı bayrak</th></tr>
<tr><td>p-değeri nedir?</td><td>H₀ doğruysa, gözlenen kadar ya da daha uç bir sonucu görme olasılığı</td><td>"H₀'ın doğru olma olasılığı"</td></tr>
<tr><td>%95 güven aralığı?</td><td>Yöntem tekrarlansa aralıkların %95'i gerçek değeri kapsar</td><td>"Gerçek değer %95 olasılıkla bu aralıkta"</td></tr>
<tr><td>İstatistiksel güç?</td><td>Gerçek etki varken onu yakalama olasılığı (1 − β); örneklem, etki büyüklüğü ve α'ya bağlı</td><td>Testi bitirdikten sonra güç hesaplamak</td></tr>
<tr><td>SRM nedir?</td><td>Örnek oranı uyumsuzluğu: 50/50 planlanan trafikte gruplar beklenenden anlamlı farklı; ki-kare ile denetlenir</td><td>SRM'yi kontrol etmeden sonucu yorumlamak</td></tr>
<tr><td>Çoklu test?</td><td>20 metriğe bakınca birinin şans eseri anlamlı çıkması beklenir; Bonferroni / Holm, ya da önceden tek birincil metrik</td><td>"Anlamlı çıkan metriği raporlarız"</td></tr>
<tr><td>Peeking?</td><td>Her gün bakıp anlamlı olunca durdurmak yanlış pozitifi şişirir; süreyi önceden belirle ya da sıralı test kullan</td><td>"Anlamlı olduğu an durdururuz"</td></tr>
</table></div>
<pre class="py">import math
from statistics import NormalDist
import veri

ab = veri.oku("anadolu_market", "ab_test")
g = ab.groupby("variant")["converted"].agg(["sum", "count"])
(xa, na), (xb, nb) = g.loc["A"], g.loc["B"]

# 1) önce SRM: 50/50 planlandı mı tuttu?
beklenen = (na + nb) / 2
ki_kare = ((na - beklenen) ** 2 + (nb - beklenen) ** 2) / beklenen
print("SRM p:", round(math.erfc(math.sqrt(ki_kare / 2)), 3))   # 1 serbestlik derecesi

# 2) iki oran z-testi
pa, pb = xa / na, xb / nb
p = (xa + xb) / (na + nb)
z = (pb - pa) / math.sqrt(p * (1 - p) * (1 / na + 1 / nb))
p_deger = 2 * (1 - NormalDist().cdf(abs(z)))
print("A:", round(pa, 4), "B:", round(pb, 4), "z:", round(z, 2), "p:", round(p_deger, 4))

# 3) farkın %95 güven aralığı
se = math.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
print("fark GA:", round(pb - pa - 1.96 * se, 4), "–", round(pb - pa + 1.96 * se, 4))</pre>
<p>Cevabı karar diliyle bitir: "SRM yok (p ≈ 0,26). B'nin dönüşümü 3,8 puan yüksek, p ≈ 0,012, güven aralığı yaklaşık 0,8–6,7 puan; sıfırı kapsamıyor. Koruyucu metrikler (iade, gelir başına kullanıcı) bozulmadıysa yayına alırım; etki alt sınırda küçük olabilir, yayından sonra izlerim." Ayrıntılı teori <b>istatistik</b> dersinde.</p>

<h2>4. Ürün ve vaka soruları: "metrik düştü" çerçevesi</h2>
<div class="steps-list"><ol>
<li><b>Netleştir:</b> Hangi metrik, hangi tanım, hangi dönem, neye göre %10? Ani mi, kademeli mi?</li>
<li><b>Veri hatasını ele:</b> İzleme kodu değişti mi, pipeline gecikti mi, bir ülke/uygulama sürümü veri göndermiyor mu?</li>
<li><b>Dış etkenler:</b> Mevsimsellik (geçen yılın aynı haftası), tatil, rakip kampanyası, fiyat değişikliği.</li>
<li><b>Ayrıştır:</b> KPI ağacı (ziyaretçi × dönüşüm × AOV) ve segmentler (cihaz, kanal, şehir, yeni/eski müşteri). Düşüş tek bir segmentte mi?</li>
<li><b>Hipotez ve doğrulama:</b> En olası 2–3 neden, her biri için hangi veriyle doğrulanacağı.</li>
<li><b>Öneri:</b> Etki büyüklüğü ve aciliyete göre sıralı eylem; neyi izleyeceğin.</li>
</ol></div>
<p>A/B karar soruları ("hedef metrik arttı ama gelir düştü, ne yaparsın?") için aynı yapı geçerlidir: önce deneyin geçerliliği (SRM, süre, yeni özellik etkisi), sonra metrikler arası ödünleşim, en son karar ve izleme planı.</p>

<h2>5. ML ve veri mühendisliği soruları</h2>
<div class="tbl-wrap"><table>
<tr><th>Rol</th><th>Sık soru</th><th>Kısa cevap iskeleti</th></tr>
<tr><td>Bilimci / ML</td><td>Veri sızıntısı örneği?</td><td>Hedeften sonra oluşan özellik (iade tarihi ile iade tahmini), tüm veride ölçekleme, zaman serisinde rastgele bölme</td></tr>
<tr><td>Bilimci / ML</td><td>%1 pozitifli veride metrik?</td><td>Doğruluk yanıltır; PR-AUC, recall@precision, iş maliyetine göre eşik</td></tr>
<tr><td>Bilimci / ML</td><td>Dengesiz sınıf?</td><td>Önce doğru metrik ve eşik; sonra class_weight, yeniden örnekleme (yalnız eğitimde)</td></tr>
<tr><td>Mühendis</td><td>İdempotentlik?</td><td>Aynı işi iki kez çalıştırmak aynı sonucu verir: bölüm üzerine yazma, MERGE/UPSERT, doğal anahtar</td></tr>
<tr><td>Mühendis</td><td>SCD tip 2?</td><td>Boyut değişince eski satırı kapat (gecerli_bitis), yeni satır aç; tarihe göre doğru sürüme bağlan</td></tr>
<tr><td>Mühendis</td><td>Partition seçimi?</td><td>Sorgu filtresine göre (çoğunlukla tarih); çok küçük dosya ve çarpık bölümden kaçın</td></tr>
</table></div>

<h2>6. Ev ödevi (take-home) teslimi</h2>
<p>Take-home analizde değerlendirici önce README'yi ve tek sayfalık özeti okur, koda sonra bakar. Önerilen yapı:</p>
<pre class="code">analiz/
  README.md          # soru, veri, nasıl çalıştırılır, varsayımlar, sınırlılıklar
  ozet.md            # 1 sayfa: 3–5 bulgu, her birinde sayı + grafik + öneri
  notebooks/01_eda.ipynb
  src/metrikler.py   # tekrar kullanılan fonksiyonlar (test edilebilir)
  tests/test_metrikler.py
  requirements.txt</pre>
<p>Kendi bilgisayarında dene: <code>python -m venv .venv</code>, <code>pip install -r requirements.txt</code>, ardından notebook'u "Restart &amp; Run All" ile baştan çalıştır; hata vermeden bitmesi, teslimin tekrarlanabilir olduğunun kanıtıdır.</p>

<div class="note"><b>Gerçek işte</b>İşe alım komitelerinde aday çoğunlukla teknik doğrulukla değil iletişimle elenir: sessizce 10 dakika kod yazıp yanlış soruyu çözmek, kenar durumu sormamak, sonucu "p &lt; 0,05 o yüzden B iyi" diye tek cümleyle bitirmek. Güçlü adaylar düşünce sürecini sesli anlatır, varsayımını açıkça söyler ve her sayıyı bir karara bağlar. Bu derste her alıştırmayı çözdükten sonra cevabını iki cümleyle sesli anlatmayı dene.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>45 dakikalık deneme planı</h3>
<p>Bu dersin alıştırmalarıyla gerçekçi bir deneme kur: 2 SQL (15 dk), 2 pandas (15 dk), 1 istatistik (8 dk), 1 vaka anlatımı (7 dk, sesli). Süre bitince çözemediklerini "nasıl yaklaşırdım" diye yaz; mülakatta kısmi ama doğru yönlü cevap, sessizlikten her zaman iyidir.</p>
<h3>Lehçe farkları</h3>
<p>Mülakat platformları çoğunlukla PostgreSQL ya da MySQL kullanır. SQLite'ta <code>strftime</code> ile yaptığını PostgreSQL'de <code>date_trunc('month', d)</code> ve <code>EXTRACT</code> ile, medyanı <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)</code> ile yaparsın. Platform başında hangi lehçe olduğunu sor.</p>
<h3>Bootstrap ile sağlam cevap</h3>
<p>Gelir gibi çarpık metriklerde z-testi varsayımı zayıflar; mülakatta "bootstrap ile güven aralığı da bakarım" demek ve bunu 6 satırda yazabilmek güçlü bir sinyaldir (Meydan okuma alıştırması).</p>
</section>`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'A/B testinde p = 0,012 çıktı. Mülakatçı "bu ne demek?" diye soruyor. En doğru cevap hangisi?',
        o: [
          'B\'nin A\'dan gerçekten daha iyi olma olasılığı %98,8\'dir',
          'Fark yoksa bu kadar uç bir fark görme olasılığı %1,2\'dir',
          'Sıfır hipotezinin (H₀) doğru olma olasılığı %1,2\'dir',
          'Deney tekrarlanırsa aynı sonuç %98,8 olasılıkla çıkar'
        ],
        a: 1,
        why: 'p-değeri H₀ doğru varsayılarak hesaplanan bir olasılıktır: gözlenen ya da daha uç sonucun olasılığı. H₀\'ın ya da H₁\'in doğru olma olasılığı değildir; bu ayrım mülakatta en sık elenme nedenlerinden biridir.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: '<code>WHERE customer_id NOT IN (SELECT customer_id FROM kara_liste)</code> sorgusu hiç satır döndürmüyor; kara listede bir satırın customer_id\'si NULL. Neden?',
        o: [
          'NOT IN alt sorguda yalnız tek bir sütun ve en fazla 1000 değer kabul eder',
          'x NOT IN (..., NULL) hiçbir zaman TRUE olmaz; sonuç UNKNOWN',
          'NULL değerler alt sorguda otomatik silinir, sorgu boş liste görür',
          'SQLite NOT IN\'i desteklemez; NOT EXISTS zorunludur'
        ],
        a: 1,
        why: '<code>x &lt;&gt; NULL</code> UNKNOWN döner; NOT IN bunların VE\'si olduğu için hiçbir satır TRUE olmaz. Güvenli kalıp <code>NOT EXISTS</code> ya da alt sorguya <code>WHERE customer_id IS NOT NULL</code> eklemektir.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Veri mühendisi mülakatı: "Günlük yükleme işin dün iki kez çalıştı. Sonuç tablosu ne olmalı?" Hangi tasarım idempotenttir?',
        o: [
          'Her çalıştırmada satırları INSERT ile sona eklemek ve raporda DISTINCT kullanmak',
          'O günün bölümünü (partition) silip yeniden yazmak ya da doğal anahtarla MERGE/UPSERT',
          'İkinci çalıştırmayı bir kilit dosyasıyla tamamen engelleyip hata vermek',
          'Her çalıştırmanın sonucunu ayrı bir tabloya yazıp elle seçmek'
        ],
        a: 1,
        why: 'İdempotent iş, kaç kez çalışırsa çalışsın aynı sonucu üretir. Bölüm üzerine yazma ve anahtarlı UPSERT bunu sağlar. Sona ekleme kopyalar üretir; DISTINCT tam kopyaları gizler ama düzeltilmiş verinin eski sürümünü bırakır.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Maaşlar 100, 90, 90, 80. "İkinci en yüksek maaş" için bu kod ne yazdırır?',
        code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE e (maas INT)")\ncon.executemany("INSERT INTO e VALUES (?)", [(100,), (90,), (90,), (80,)])\nr = "SELECT maas FROM (SELECT maas, ROW_NUMBER() OVER (ORDER BY maas DESC) n FROM e) WHERE n = 3"\nd = "SELECT DISTINCT maas FROM (SELECT maas, DENSE_RANK() OVER (ORDER BY maas DESC) n FROM e) WHERE n = 3"\nprint(con.execute(r).fetchall(), con.execute(d).fetchall())\n',
        o: ['[(90,)] [(80,)]', '[(80,)] [(80,)]', '[(90,)] [(90,)]', '[(80,)] []'],
        a: 0,
        why: 'ROW_NUMBER eşitlikte de numara ilerletir: 100→1, 90→2, 90→3, yani 3. satır 90. DENSE_RANK eşitlere aynı sırayı verir: 100→1, 90→2, 80→3. "n\'inci farklı en yüksek değer" sorusu DENSE_RANK ister.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Müşteri tablosunda 101 numaralı müşteri yanlışlıkla iki kez var. Bu kod ne yazdırır?',
        code: 'import pandas as pd\nsiparis = pd.DataFrame({"mid": [101, 101, 102], "tutar": [100, 50, 70]})\nmusteri = pd.DataFrame({"mid": [101, 101, 102], "sehir": ["Ankara", "Ankara", "İzmir"]})\nm = siparis.merge(musteri, on="mid")\nprint(len(m), m["tutar"].sum())\n',
        o: ['3 220', '5 370', '4 370', '6 440'],
        a: 1,
        why: '101\'in 2 siparişi × 2 müşteri satırı = 4 satır, 102 için 1: toplam 5. Ciro 100+50 iki kez sayılır: 370. <code>validate="many_to_one"</code> bu durumda hemen MergeError verirdi.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ndf = pd.DataFrame({"m": ["a", "a", "b"], "tutar": [30, 10, 50]})\ndf["pay"] = df["tutar"] / df.groupby("m")["tutar"].transform("sum")\nprint(df["pay"].tolist())\n',
        o: ['[0.333, 0.111, 0.556]', '[0.75, 0.25, 1.0]', '[0.75, 0.25]', '[30, 10, 50]'],
        a: 1,
        why: '<code>transform("sum")</code> grup toplamını her satıra geri yazar (a için 40, b için 50); bölünce grup içi pay çıkar: 0.75, 0.25, 1.0. SQL karşılığı <code>tutar / SUM(tutar) OVER (PARTITION BY m)</code>.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Anadolu Market A/B testinde SRM kontrolü yapan programın satırlarını sırala (1 serbestlik dereceli ki-kare).</p>',
        lines: [
          'import math',
          'import veri',
          'n = veri.oku("anadolu_market", "ab_test")["variant"].value_counts()',
          'beklenen = n.sum() / 2',
          'ki_kare = ((n - beklenen) ** 2 / beklenen).sum()',
          'p = math.erfc(math.sqrt(ki_kare / 2))',
          'print(round(float(ki_kare), 2), round(p, 3))'
        ],
        expect: '1.25 0.264\n',
        hint: 'Gözlenen sayılar → beklenen → ki-kare → p-değeri.',
        why: '975 / 1025 ayrımı 50/50 planla uyumlu (p ≈ 0.26 &gt; 0.05): SRM yok, deney sonucu yorumlanabilir. SRM varsa (ör. p &lt; 0.001) önce atama ya da izleme hatası aranır, sonuç yorumlanmaz.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'veri-mulakat-1',
        diff: 1,
        needs: ['sqlite3'],
        q: '<p><b>Hedef süre: 6 dk.</b> Klasik soru: n\'inci en yüksek maaş. <code>n_en_yuksek_maas(con, n)</code> <code>employees</code> tablosunda n\'inci en yüksek <b>farklı</b> maaşı döndürsün; yoksa <code>None</code>. n parametreyle bağlanmalı.</p>',
        guide: [
          'CTE içinde DENSE_RANK() OVER (ORDER BY salary DESC) AS dr hesapla.',
          'Dış sorguda WHERE dr = ? ile süz, DISTINCT salary seç.',
          'fetchone() sonucu None ise None, değilse ilk elemanı döndür.'
        ],
        example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE puan (p INT)")\ncon.executemany("INSERT INTO puan VALUES (?)", [(5,), (9,), (9,), (7,)])\nsql = "WITH r AS (SELECT p, DENSE_RANK() OVER (ORDER BY p DESC) dr FROM puan) SELECT DISTINCT p FROM r WHERE dr = ?"\nprint(con.execute(sql, (2,)).fetchone())\n',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef n_en_yuksek_maas(con, n):\n    sql = """\n    WITH r AS (\n        SELECT salary  -- TODO: DENSE_RANK ... AS dr\n        FROM employees\n    )\n    SELECT DISTINCT salary FROM r\n    -- TODO: dr = ?\n    """\n    satir = con.execute(sql).fetchone()\n    return satir\n\n\nprint(n_en_yuksek_maas(con, 2))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef n_en_yuksek_maas(con, n):\n    sql = """\n    WITH r AS (\n        SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr\n        FROM employees\n    )\n    SELECT DISTINCT salary FROM r\n    WHERE dr = ?\n    """\n    satir = con.execute(sql, (n,)).fetchone()\n    return satir[0] if satir else None\n\n\nprint(n_en_yuksek_maas(con, 2))\n',
        tests: 'assert n_en_yuksek_maas(con, 1) == 145000.0, "En yüksek maaş 145000 (Genel Müdür)"\nassert n_en_yuksek_maas(con, 2) == 97000.0, "İkinci en yüksek farklı maaş 97000"\nassert n_en_yuksek_maas(con, 3) == 96000.0, "Üçüncü 96000"\nassert n_en_yuksek_maas(con, 1000) is None, "Böyle bir sıra yoksa None"\n',
        hints: [
          '"Farklı" maaş dendiği için eşitlerde boşluk bırakmayan sıralama gerekir.',
          '<code>DENSE_RANK() OVER (ORDER BY salary DESC) AS dr</code>',
          '<code>con.execute(sql, (n,)).fetchone()</code> ve None kontrolü.'
        ],
        why: 'Mülakatçının asıl beklediği kenar durumları sormandır: eşit maaşlar (DENSE_RANK), n tablodan büyükse (None), NULL maaş (ORDER BY ... DESC\'te SQLite NULL\'ları sona koyar; PostgreSQL başa koyar, <code>NULLS LAST</code> yaz). Alternatif <code>LIMIT 1 OFFSET n-1</code> DISTINCT ile çalışır ama esnek değildir.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'veri-mulakat-2',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p><b>Hedef süre: 8 dk.</b> Her departmanın en yüksek maaşlı çalışanı (eşitlik olursa hepsi). <code>departman_liderleri(con)</code> <code>(departman_adi, ad, maas)</code> demetlerini departman adına göre artan sırada döndürsün. Departmanı olmayan çalışan (Genel Müdür) hariç.</p>',
        guide: [
          'employees ile departments\'ı dept_id üzerinden JOIN et.',
          'CTE\'de RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk.',
          'Dış sorguda rk = 1, ORDER BY departman adı.'
        ],
        example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE s (bolge TEXT, temsilci TEXT, ciro INT)")\ncon.executemany("INSERT INTO s VALUES (?, ?, ?)", [("Ege", "Ali", 5), ("Ege", "Can", 9), ("Marmara", "Ece", 7)])\nsql = """\nWITH r AS (SELECT bolge, temsilci, ciro, RANK() OVER (PARTITION BY bolge ORDER BY ciro DESC) rk FROM s)\nSELECT bolge, temsilci, ciro FROM r WHERE rk = 1 ORDER BY bolge\n"""\nprint(con.execute(sql).fetchall())\n',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef departman_liderleri(con):\n    sql = """\n    WITH r AS (\n        SELECT d.name AS dep, e.first_name, e.salary\n               -- TODO: RANK ... AS rk\n        FROM employees e\n        JOIN departments d ON d.dept_id = e.dept_id\n    )\n    SELECT dep, first_name, salary FROM r\n    -- TODO: yalnız liderler, departman adına göre sırala\n    """\n    return con.execute(sql).fetchall()\n\n\nfor s in departman_liderleri(con):\n    print(s)\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef departman_liderleri(con):\n    sql = """\n    WITH r AS (\n        SELECT d.name AS dep, e.first_name, e.salary,\n               RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rk\n        FROM employees e\n        JOIN departments d ON d.dept_id = e.dept_id\n    )\n    SELECT dep, first_name, salary FROM r\n    WHERE rk = 1\n    ORDER BY dep\n    """\n    return con.execute(sql).fetchall()\n\n\nfor s in departman_liderleri(con):\n    print(s)\n',
        tests: 'r = departman_liderleri(con)\nassert len(r) == 6, "Çalışanı olan 6 departmanın her biri için bir lider (eşitlik yok)"\nd = {x[0]: (x[1], x[2]) for x in r}\nassert d["Yazılım"] == ("Selin", 87000.0) and d["Satış"] == ("Elif", 96000.0), "Yazılım: Selin 87000, Satış: Elif 96000"\nassert d["Veri Analitiği"] == ("Serkan", 97000.0), "Veri Analitiği: Serkan 97000"\nassert [x[0] for x in r] == sorted(x[0] for x in r), "Departman adına göre sırala"\n',
        hints: [
          '"Eşitlik olursa hepsi" → ROW_NUMBER değil RANK.',
          '<code>RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rk</code>',
          'Dışarıda <code>WHERE rk = 1 ORDER BY dep</code>.'
        ],
        why: 'Grup içi en iyi kalıbı (kalıp 2). Takip sorusu çoğunlukla "ilk 3" ya da "departman ortalamasının üstündekiler" olur: ilki <code>rk &lt;= 3</code>, ikincisi <code>salary &gt; AVG(salary) OVER (PARTITION BY dept_id)</code>.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'veri-mulakat-3',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hedef süre: 8 dk.</b> pandas canlı soru: "Her geçerli (delivered/shipped) siparişin, müşterinin toplam harcaması içindeki payı nedir?" <code>siparis_paylari(o, i)</code> sipariş düzeyinde (<code>order_id, customer_id, net, pay</code>) bir DataFrame döndürsün; <code>net</code> sipariş toplamı (satırlardan), <code>pay</code> = net / müşterinin toplamı. Satır çoğalmasını önle: önce sipariş düzeyine topla.</p>',
        guide: [
          'Kalemleri order_id\'ye göre topla: i.groupby("order_id", as_index=False)["net"].sum().',
          'Geçerli siparişlerle birleştir; validate="one_to_one".',
          'groupby("customer_id")["net"].transform("sum") ile müşteri toplamını satıra yaz.',
          'pay sütununu hesapla, istenen sütunları seç.'
        ],
        example: 'import pandas as pd\nkalem = pd.DataFrame({"sip": [1, 1, 2], "tutar": [10, 5, 20]})\nsiparis = pd.DataFrame({"sip": [1, 2], "kisi": ["a", "a"]})\ns = siparis.merge(kalem.groupby("sip", as_index=False)["tutar"].sum(), on="sip", validate="one_to_one")\ns["pay"] = s["tutar"] / s.groupby("kisi")["tutar"].transform("sum")\nprint(s)\n',
        start: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef siparis_paylari(o, i):\n    toplam = i  # TODO: sipariş düzeyine topla\n    s = o[o["status"].isin(["delivered", "shipped"])].merge(toplam, on="order_id")\n    # TODO: pay\n    return s\n\n\nprint(siparis_paylari(o, i).head())\n',
        sol: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef siparis_paylari(o, i):\n    toplam = i.groupby("order_id", as_index=False)["net"].sum()\n    s = o[o["status"].isin(["delivered", "shipped"])].merge(toplam, on="order_id", validate="one_to_one")\n    s["pay"] = s["net"] / s.groupby("customer_id")["net"].transform("sum")\n    return s[["order_id", "customer_id", "net", "pay"]]\n\n\nprint(siparis_paylari(o, i).head())\n',
        tests: 's = siparis_paylari(o, i)\nassert list(s.columns) == ["order_id", "customer_id", "net", "pay"], "Sütunlar: order_id, customer_id, net, pay"\nassert len(s) == 782 and s["order_id"].is_unique, "782 geçerli sipariş, her biri bir kez (satır çoğalması yok)"\nassert abs(s.groupby("customer_id")["pay"].sum() - 1).max() < 1e-9, "Her müşterinin payları toplamı 1 olmalı"\nassert abs(s["net"].sum() - 1169937.1) < 0.05, "Toplam net ciro 1169937.1"\n',
        hints: [
          'Kalem tablosunu doğrudan birleştirirsen her sipariş ürün sayısı kadar çoğalır.',
          '<code>i.groupby("order_id", as_index=False)["net"].sum()</code>',
          '<code>s["pay"] = s["net"] / s.groupby("customer_id")["net"].transform("sum")</code>'
        ],
        why: 'İki tuzak birlikte sınanıyor: tanecik düzeyi (kalem → sipariş) ve transform. Kontrolü sesli söyle: "her müşterinin payları 1\'e toplanmalı, satır sayısı geçerli sipariş sayısına eşit olmalı."'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'veri-mulakat-4',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hedef süre: 10 dk.</b> İstatistik turu: <code>ab_karar(ab)</code> Anadolu Market A/B testinde iki oran z-testi yapsın ve sözlük döndürsün: <code>pa</code>, <code>pb</code> (4 basamak), <code>z</code> (2), <code>p</code> (4, çift yönlü), <code>ga</code>: farkın (pb − pa) %95 güven aralığı demeti (havuzlanmamış standart hata, 1.96; 4 basamak), <code>karar</code>: p &lt; 0.05 ve GA alt sınırı &gt; 0 ise <code>"B"</code>, değilse <code>"bekle"</code>. scipy kullanma; <code>statistics.NormalDist</code> yeterli.</p>',
        guide: [
          'groupby("variant")["converted"].agg(["sum", "count"]) ile x ve n\'leri al.',
          'Havuzlanmış p ile z = (pb − pa) / sqrt(p(1−p)(1/na + 1/nb)).',
          'p-değeri = 2 × (1 − NormalDist().cdf(|z|)).',
          'GA için havuzlanmamış se = sqrt(pa(1−pa)/na + pb(1−pb)/nb).'
        ],
        example: 'import math\nfrom statistics import NormalDist\nx1, n1, x2, n2 = 40, 400, 60, 400\np1, p2 = x1 / n1, x2 / n2\np = (x1 + x2) / (n1 + n2)\nz = (p2 - p1) / math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))\nprint(round(z, 2), round(2 * (1 - NormalDist().cdf(abs(z))), 4))\n',
        start: 'import math\nfrom statistics import NormalDist\nimport veri\n\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef ab_karar(ab):\n    g = ab.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    pa, pb = xa / na, xb / nb\n    z = 0.0      # TODO: havuzlanmış z\n    p = 1.0      # TODO: çift yönlü p\n    ga = (0, 0)  # TODO: güven aralığı\n    karar = "bekle"  # TODO\n    return {"pa": round(pa, 4), "pb": round(pb, 4), "z": round(z, 2), "p": round(p, 4), "ga": ga, "karar": karar}\n\n\nprint(ab_karar(ab))\n',
        sol: 'import math\nfrom statistics import NormalDist\nimport veri\n\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef ab_karar(ab):\n    g = ab.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    pa, pb = xa / na, xb / nb\n    havuz = (xa + xb) / (na + nb)\n    z = (pb - pa) / math.sqrt(havuz * (1 - havuz) * (1 / na + 1 / nb))\n    p = 2 * (1 - NormalDist().cdf(abs(z)))\n    se = math.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)\n    ga = (round(float(pb - pa - 1.96 * se), 4), round(float(pb - pa + 1.96 * se), 4))\n    karar = "B" if p < 0.05 and ga[0] > 0 else "bekle"\n    return {"pa": round(float(pa), 4), "pb": round(float(pb), 4), "z": round(float(z), 2),\n            "p": round(float(p), 4), "ga": ga, "karar": karar}\n\n\nprint(ab_karar(ab))\n',
        tests: 'r = ab_karar(ab)\nassert r["pa"] == 0.1087 and r["pb"] == 0.1463, "Dönüşüm: A 0.1087, B 0.1463"\nassert r["z"] == 2.52 and r["p"] == 0.0118, "z 2.52, p 0.0118"\nassert r["ga"] == (0.0085, 0.0668), "Farkın %95 GA\'sı (0.0085, 0.0668)"\nassert r["karar"] == "B", "p < 0.05 ve GA sıfırı kapsamıyor: karar B"\n',
        hints: [
          'Test istatistiği için havuzlanmış oran, güven aralığı için ayrı ayrı varyanslar kullanılır.',
          '<code>NormalDist().cdf(abs(z))</code> standart normal kümülatif dağılımdır.',
          '<code>karar = "B" if p &lt; 0.05 and ga[0] &gt; 0 else "bekle"</code>'
        ],
        why: 'Mülakatta yalnız "p &lt; 0.05" demek yetmez; güven aralığı etkinin büyüklüğünü (0.8 ile 6.7 puan) söyler. Sonraki sorular hazır olsun: SRM kontrol ettin mi (order alıştırması)? Gelir de arttı mı (bootstrap, Meydan okuma)? Test süresi önceden belirlendi mi (peeking)?'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'veri-mulakat-5',
        diff: 1,
        needs: ['sqlite3'],
        q: '<p><b>Hedef süre: 4 dk.</b> <code>siparissiz_musteri(con)</code> hiç siparişi olmayan müşteri sayısını döndürsün. NOT IN yerine NULL\'a güvenli bir kalıp kullan.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef siparissiz_musteri(con):\n    pass\n\n\nprint(siparissiz_musteri(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef siparissiz_musteri(con):\n    sql = """\n    SELECT COUNT(*) FROM customers c\n    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)\n    """\n    return con.execute(sql).fetchone()[0]\n\n\nprint(siparissiz_musteri(con))\n',
        tests: 'assert siparissiz_musteri(con) == 14, "150 müşteriden 14\'ü hiç sipariş vermemiş"\nassert "NOT IN" not in __source__.upper(), "NOT IN yerine NOT EXISTS ya da LEFT JOIN ... IS NULL kullan"\n',
        hints: ['<code>NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>', 'Alternatif: <code>LEFT JOIN orders o ... WHERE o.order_id IS NULL</code>.'],
        why: 'Anti-join kalıbı (kalıp 4). NOT EXISTS alt sorguda NULL olsa bile doğru çalışır ve çoğu motorda verimli bir plana dönüşür.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'veri-mulakat-6',
        diff: 3,
        needs: ['sqlite3'],
        q: '<p><b>Hedef süre: 12 dk.</b> "Art arda en az 3 takvim ayı sipariş vermiş müşteri sayısı?" <code>ardisik_ay_musterileri(con, k=3)</code> en az <code>k</code> ardışık ayda (tüm durumlar) siparişi olan <b>farklı</b> müşteri sayısını döndürsün. İpucu: ayı tek bir tamsayıya çevir (yıl × 12 + ay).</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef ardisik_ay_musterileri(con, k=3):\n    pass\n\n\nprint(ardisik_ay_musterileri(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef ardisik_ay_musterileri(con, k=3):\n    sql = """\n    WITH m AS (\n        SELECT DISTINCT customer_id,\n               CAST(strftime(\'%Y\', order_date) AS INTEGER) * 12 + CAST(strftime(\'%m\', order_date) AS INTEGER) AS ay\n        FROM orders\n    ),\n    g AS (\n        SELECT customer_id, ay - ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ay) AS grup\n        FROM m\n    )\n    SELECT COUNT(DISTINCT customer_id) FROM (\n        SELECT customer_id FROM g GROUP BY customer_id, grup HAVING COUNT(*) >= ?\n    )\n    """\n    return con.execute(sql, (k,)).fetchone()[0]\n\n\nprint(ardisik_ay_musterileri(con))\n',
        tests: 'assert ardisik_ay_musterileri(con) == 42, "En az 3 ardışık ayda sipariş veren 42 müşteri"\nassert ardisik_ay_musterileri(con, 1) == 136, "k=1 için sipariş veren tüm müşteriler (136)"\nassert ardisik_ay_musterileri(con, 2) >= 42, "k küçüldükçe sayı azalamaz"\n',
        hints: [
          'Boşluk-ada: müşteri içinde sıralı ay numarasından ROW_NUMBER çıkar; ardışık aylarda fark sabit kalır.',
          'Aynı ay iki sipariş adayı bozmasın: önce DISTINCT (müşteri, ay). Sonra (müşteri, grup) bazında HAVING COUNT(*) &gt;= k.'
        ],
        why: 'Ardışık dönem kalıbı (kalıp 10). Ay metniyle değil tamsayıyla çalışmak Aralık→Ocak geçişini doğru yapar: 2023×12+12 ile 2024×12+1 ardışıktır.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'veri-mulakat-7',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hedef süre: 8 dk.</b> "Hangi 7 günlük dönemde en yüksek net ciroyu yaptık?" <code>en_iyi_7_gun(o, i)</code> geçerli siparişlerin günlük net cirosunu (boş günler 0) çıkarsın, 7 günlük kayan toplamı alsın ve <code>(bitis_tarihi "YYYY-MM-DD", toplam 2 basamak)</code> döndürsün.</p>',
        start: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef en_iyi_7_gun(o, i):\n    pass\n\n\nprint(en_iyi_7_gun(o, i))\n',
        sol: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef en_iyi_7_gun(o, i):\n    s = o[o["status"].isin(["delivered", "shipped"])].merge(i, on="order_id")\n    gunluk = s.set_index("order_date").sort_index()["net"].resample("D").sum()\n    kayan = gunluk.rolling("7D").sum()\n    return kayan.idxmax().strftime("%Y-%m-%d"), round(float(kayan.max()), 2)\n\n\nprint(en_iyi_7_gun(o, i))\n',
        tests: 'assert en_iyi_7_gun(o, i) == ("2024-11-28", 39398.7), "En iyi 7 gün 2024-11-28\'de biten dönem: 39398.7 TL"\n',
        hints: [
          '<code>resample("D").sum()</code> boş günleri 0 ile doldurur; böylece 7 satır = 7 takvim günü.',
          '<code>rolling("7D").sum()</code>, sonra <code>idxmax()</code> ve <code>max()</code>.'
        ],
        why: 'Boş günleri doldurmadan <code>rolling(7)</code> almak "7 satır" demektir ve sipariş olmayan günler varsa pencere 7 günden uzun olur. Zaman tabanlı pencere ("7D") ya da resample bu tuzağı kapatır; mülakatta bunu söylemek fark yaratır.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'veri-mulakat-8',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p><b>Hedef süre: 6 dk.</b> Koşullu toplama ile pivot. <code>segment_kanal(con)</code> her müşteri segmenti için web, mobile ve store sipariş sayılarını (tüm durumlar) <code>{segment: (web, mobile, store)}</code> olarak döndürsün. Tek bir GROUP BY sorgusu ve <code>CASE WHEN</code> ya da boolean toplama kullan.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef segment_kanal(con):\n    pass\n\n\nprint(segment_kanal(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market")\n\n\ndef segment_kanal(con):\n    sql = """\n    SELECT c.segment,\n           SUM(CASE WHEN o.channel = \'web\' THEN 1 ELSE 0 END),\n           SUM(CASE WHEN o.channel = \'mobile\' THEN 1 ELSE 0 END),\n           SUM(CASE WHEN o.channel = \'store\' THEN 1 ELSE 0 END)\n    FROM orders o JOIN customers c ON c.customer_id = o.customer_id\n    GROUP BY c.segment\n    """\n    return {seg: (w, m, s) for seg, w, m, s in con.execute(sql)}\n\n\nprint(segment_kanal(con))\n',
        tests: 'assert segment_kanal(con) == {"Bireysel": (120, 140, 37), "Kurumsal": (101, 116, 40), "Premium": (142, 153, 61)}, "Segment × kanal sayıları farklı"\nassert "CASE" in __source__.upper() or "SUM(O.CHANNEL" in __source__.upper().replace(" ", "") or "= \'WEB\')" in __source__.upper(), "Koşullu toplama kullan"\n',
        hints: ['Her kanal için bir sütun: <code>SUM(CASE WHEN o.channel = \'web\' THEN 1 ELSE 0 END)</code>.', 'Müşteri segmenti customers tablosunda; JOIN gerekli.'],
        why: 'Koşullu toplama SQL\'in taşınabilir pivotudur (kalıp 6); PIVOT sözdizimi her motorda yoktur. Oran istenirse aynı ifadeyi <code>100.0 * ... / COUNT(*)</code> ile böl.'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'veri-mulakat-9',
        diff: 2,
        kind: 'bug',
        needs: ['sqlite3'],
        q: '<p><b>Hatayı bul ve düzelt. Hedef süre: 5 dk.</b> <code>departman_kadro(con)</code> 7 departmanın hepsi için <code>{ad: calisan_sayisi}</code> döndürmeli. Hukuk departmanında hiç çalışan yok ama rapor 1 gösteriyor.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef departman_kadro(con):\n    sql = """\n    SELECT d.name, COUNT(*)\n    FROM departments d\n    LEFT JOIN employees e ON e.dept_id = d.dept_id\n    GROUP BY d.dept_id\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(departman_kadro(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["employees", "departments"])\n\n\ndef departman_kadro(con):\n    sql = """\n    SELECT d.name, COUNT(e.emp_id)\n    FROM departments d\n    LEFT JOIN employees e ON e.dept_id = d.dept_id\n    GROUP BY d.dept_id\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(departman_kadro(con))\n',
        tests: 'd = departman_kadro(con)\nassert len(d) == 7, "7 departmanın hepsi listede olmalı"\nassert d["Hukuk"] == 0, "Hukuk\'ta çalışan yok: 0 olmalı. COUNT(*) LEFT JOIN\'in NULL satırını da sayar"\nassert d["Satış"] == 6 and d["Veri Analitiği"] == 5, "Satış 6, Veri Analitiği 5"\n',
        hints: ['LEFT JOIN eşleşmeyen departman için tüm e sütunları NULL olan bir satır üretir.', 'Sağ tablonun bir sütununu say: <code>COUNT(e.emp_id)</code>.'],
        why: 'Mülakatın en sevilen tuzağı: COUNT(*) satır sayar, COUNT(sütun) NULL olmayanları. LEFT JOIN\'den sonra sağ tablonun anahtarını saymak boş grupları 0 yapar.'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'veri-mulakat-10',
        diff: 2,
        kind: 'bug',
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt. Hedef süre: 5 dk.</b> <code>tekil_kayit(r)</code> form kayıtlarında (<code>raw_signups</code>) tekil kişi sayısını e-postaya göre döndürmeli. Kod 52 satırdan 47 tekil e-posta buluyor; ekip elle saydığında 39 kişi çıkıyor.</p>',
        start: 'import veri\n\nr = veri.oku("anadolu_market", "raw_signups")\n\n\ndef tekil_kayit(r):\n    return int(r["email"].nunique())\n\n\nprint(tekil_kayit(r))\n',
        sol: 'import veri\n\nr = veri.oku("anadolu_market", "raw_signups")\n\n\ndef tekil_kayit(r):\n    return int(r["email"].str.strip().str.lower().nunique())\n\n\nprint(tekil_kayit(r))\n',
        tests: 'assert tekil_kayit(r) == 39, "Harf ve boşluk normalleşince 39 tekil e-posta"\nassert r["email"].str.contains("[A-Z]").any(), "Girdi DataFrame\'ini değiştirme"\n',
        hints: ['"CEREN.YILMAZ@GMAIL.COM" ile "ceren.yilmaz@gmail.com" aynı kişi mi?', 'Saymadan önce <code>.str.strip().str.lower()</code>.'],
        why: 'E-posta adresleri pratikte büyük-küçük harfe duyarsız kullanılır; normalleştirmeden tekilleştirme yapmak kopyaları gizler. Mülakatta bunu kendiliğinden fark etmek "veri kalitesine dikkat ediyor" sinyalidir.'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'veri-mulakat-11',
        diff: 3,
        needs: ['pandas', 'numpy'],
        q: '<p><b>Hedef süre: 10 dk.</b> Takip sorusu: "Dönüşüm arttı; peki kullanıcı başına gelir de arttı mı?" Gelir çarpık (çoğu 0). <code>bootstrap_fark(ab, n=2000, seed=0)</code> B ile A arasındaki ortalama gelir farkını (<code>pb − pa</code>, 2 basamak) ve bootstrap %95 yüzdelik güven aralığını (2 basamak) <code>(fark, alt, ust)</code> olarak döndürsün. Her turda <b>önce B, sonra A</b> örneğini <code>rng.choice(dizi, len(dizi))</code> ile çek; <code>rng = np.random.default_rng(seed)</code>.</p>',
        start: 'import numpy as np\nimport veri\n\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef bootstrap_fark(ab, n=2000, seed=0):\n    pass\n\n\nprint(bootstrap_fark(ab))\n',
        sol: 'import numpy as np\nimport veri\n\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef bootstrap_fark(ab, n=2000, seed=0):\n    a = ab.loc[ab["variant"] == "A", "revenue"].to_numpy()\n    b = ab.loc[ab["variant"] == "B", "revenue"].to_numpy()\n    rng = np.random.default_rng(seed)\n    farklar = [rng.choice(b, len(b)).mean() - rng.choice(a, len(a)).mean() for _ in range(n)]\n    alt, ust = np.percentile(farklar, [2.5, 97.5])\n    return round(float(b.mean() - a.mean()), 2), round(float(alt), 2), round(float(ust), 2)\n\n\nprint(bootstrap_fark(ab))\n',
        tests: 'r = bootstrap_fark(ab)\nassert r[0] == 21.68, "Gözlenen fark 21.68 TL (B − A)"\nassert r[1:] == (8.19, 35.96), "seed=0, 2000 tur: GA (8.19, 35.96). Sıra: önce B, sonra A örneği"\nassert r[1] < r[0] < r[2], "Gözlenen fark aralığın içinde olmalı"\n',
        hints: [
          'Her turda iki grubu ayrı ayrı yerine koyarak yeniden örnekle, ortalamaların farkını kaydet.',
          '<code>np.percentile(farklar, [2.5, 97.5])</code> yüzdelik güven aralığını verir.'
        ],
        why: 'Bootstrap normal dağılım varsayımı istemez; çarpık gelir metriği için güvenilir bir aralık verir. Aralık 0\'ı kapsamıyor: gelir de arttı. Mülakatta "dönüşüm arttı ama sepet küçüldü mü?" sorusunu bu analizle kapatırsın.'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'veri-mulakat-12',
        diff: 3,
        needs: ['pandas'],
        q: '<p><b>Hedef süre: 12 dk.</b> Vaka: "Kasım\'da sipariş arttı ama ciro beklenenden az arttı. Neden?" <code>teshis(o, i, ay, onceki)</code> iki ay için KPI ağacını ayrıştırsın: <code>siparis</code>, <code>aov</code>, <code>ciro</code> değişim oranlarını (ay / onceki − 1, 3 basamak) ve AOV\'deki değişimin en çok hangi kanaldan geldiğini bulsun. Dönüş: <code>{"siparis": .., "aov": .., "ciro": .., "kanal_aov": {kanal: degisim}, "en_cok_dusen": kanal}</code>; geçerli (delivered/shipped) siparişler, ay biçimi <code>"YYYY-MM"</code>.</p>',
        start: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef teshis(o, i, ay, onceki):\n    pass\n\n\nprint(teshis(o, i, "2024-11", "2024-10"))\n',
        sol: 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\ni = veri.oku("anadolu_market", "order_items")\ni["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n\n\ndef teshis(o, i, ay, onceki):\n    s = o[o["status"].isin(["delivered", "shipped"])].merge(\n        i.groupby("order_id", as_index=False)["net"].sum(), on="order_id", validate="one_to_one")\n    s["ay"] = s["order_date"].dt.strftime("%Y-%m")\n\n    def olc(df):\n        return df["order_id"].nunique(), df["net"].sum() / df["order_id"].nunique(), df["net"].sum()\n\n    n1, a1, c1 = olc(s[s["ay"] == ay])\n    n0, a0, c0 = olc(s[s["ay"] == onceki])\n    k = s[s["ay"].isin([ay, onceki])].groupby(["channel", "ay"])["net"].mean().unstack()\n    kanal = ((k[ay] / k[onceki]) - 1).round(3)\n    return {\n        "siparis": round(n1 / n0 - 1, 3),\n        "aov": round(float(a1 / a0 - 1), 3),\n        "ciro": round(float(c1 / c0 - 1), 3),\n        "kanal_aov": {kk: float(v) for kk, v in kanal.items()},\n        "en_cok_dusen": kanal.idxmin(),\n    }\n\n\nprint(teshis(o, i, "2024-11", "2024-10"))\n',
        tests: 'r = teshis(o, i, "2024-11", "2024-10")\nimport math\nassert r["siparis"] == 0.213 and r["ciro"] == 0.212, "Kasım: sipariş +21.3%, ciro +21.2%"\nassert r["aov"] == -0.001, "AOV neredeyse sabit (-0.1%)"\nassert set(r["kanal_aov"]) == {"web", "mobile", "store"}, "Üç kanal için AOV değişimi"\nassert r["en_cok_dusen"] == min(r["kanal_aov"], key=r["kanal_aov"].get), "en_cok_dusen en düşük değişimli kanal olmalı"\nassert math.isclose((1 + r["siparis"]) * (1 + r["aov"]), 1 + r["ciro"], abs_tol=0.002), "Ağaç tutarlı: (1+sipariş)(1+AOV) ≈ 1+ciro"\n',
        hints: [
          'Önce sipariş düzeyine indir (kalemleri topla), sonra ay sütunu ekle.',
          'Kanal AOV\'si: <code>groupby(["channel", "ay"])["net"].mean().unstack()</code>; değişim ay / önceki − 1.',
          '<code>idxmin()</code> en çok düşen kanalı verir.'
        ],
        why: 'Vaka sorusunun sayısal iskeleti: KPI ağacı (sipariş × AOV = ciro), sonra segment kırılımı. Burada sorunun öncülü veriyle çürüyor: ciro sipariş kadar artmış, AOV sabit. İyi bir aday "beklenenden az" iddiasını önce veriyle sınar; ardından kanal bazında AOV hareketinin karma mı fiyat mı olduğunu sorar.'
      },
      {
        t: 'code',
        stage: 'Mini proje',
        id: 'veri-mulakat-13',
        diff: 3,
        needs: ['pandas', 'sqlite3'],
        q: '<p><b>Zamanlı deneme (25 dk).</b> Gerçek bir ön eleme testi gibi dört kısa soruyu tek fonksiyonda cevapla. <code>deneme(con, ab)</code> şu anahtarlarla bir sözlük döndürsün:</p><ol><li><code>iptal_iade_yuzde</code>: tüm siparişlerde cancelled + returned yüzdesi (SQL, 2 basamak)</li><li><code>en_cok_siparis_kategori</code>: geçerli siparişlerde en çok <b>farklı siparişte</b> geçen kategori (SQL)</li><li><code>coklu_kanal_musteri</code>: üç kanalın üçünden de sipariş vermiş müşteri sayısı (SQL)</li><li><code>srm_var</code>: A/B testinde SRM var mı? (ki-kare p &lt; 0.01 ise True)</li><li><code>web_iade_yuksek</code>: web kanalının iade (returned) oranı mobile ve store\'dan yüksek mi? (bool)</li></ol>',
        start: 'import math\nimport veri\n\ncon = veri.baglan("anadolu_market")\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef deneme(con, ab):\n    pass\n\n\nfor k, v in deneme(con, ab).items():\n    print(k, ":", v)\n',
        sol: 'import math\nimport veri\n\ncon = veri.baglan("anadolu_market")\nab = veri.oku("anadolu_market", "ab_test")\n\n\ndef deneme(con, ab):\n    q = lambda sql: con.execute(sql).fetchall()\n    iptal = q("SELECT ROUND(100.0 * SUM(status IN (\'cancelled\', \'returned\')) / COUNT(*), 2) FROM orders")[0][0]\n    kategori = q("""\n        SELECT p.category FROM order_items i\n        JOIN orders o ON o.order_id = i.order_id\n        JOIN products p ON p.product_id = i.product_id\n        WHERE o.status IN (\'delivered\', \'shipped\')\n        GROUP BY p.category ORDER BY COUNT(DISTINCT o.order_id) DESC LIMIT 1\n    """)[0][0]\n    coklu = q("""\n        SELECT COUNT(*) FROM (\n            SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT channel) = 3)\n    """)[0][0]\n    iade = dict(q("SELECT channel, 1.0 * SUM(status = \'returned\') / COUNT(*) FROM orders GROUP BY channel"))\n    n = ab["variant"].value_counts()\n    beklenen = n.sum() / 2\n    ki = float(((n - beklenen) ** 2 / beklenen).sum())\n    return {\n        "iptal_iade_yuzde": iptal,\n        "en_cok_siparis_kategori": kategori,\n        "coklu_kanal_musteri": coklu,\n        "srm_var": math.erfc(math.sqrt(ki / 2)) < 0.01,\n        "web_iade_yuksek": iade["web"] > iade["mobile"] and iade["web"] > iade["store"],\n    }\n\n\nfor k, v in deneme(con, ab).items():\n    print(k, ":", v)\n',
        tests: 'r = deneme(con, ab)\nassert r["iptal_iade_yuzde"] == 14.07, "İptal + iade oranı %14.07"\nassert r["en_cok_siparis_kategori"] == "Kitap", "En çok siparişte geçen kategori Kitap (284 sipariş); satır değil farklı sipariş say"\nassert r["coklu_kanal_musteri"] == 56, "Üç kanalı da kullanan 56 müşteri"\nassert r["srm_var"] is False, "975/1025 ayrımında SRM yok (p ≈ 0.26)"\nassert r["web_iade_yuksek"] is True, "Web iade oranı %6.61; mobil %5.87, mağaza %5.80"\n',
        hints: [
          'Her soruyu ayrı bir küçük sorguyla çöz; önce doğru sayıyı al, sonra birleştir.',
          'Kategori sorusunda <code>COUNT(DISTINCT o.order_id)</code>: aynı siparişte iki kitap varsa bir kez sayılır.',
          'SRM: <code>math.erfc(math.sqrt(ki_kare / 2))</code> 1 serbestlik dereceli ki-kare p-değeridir.'
        ],
        why: 'Ön eleme testleri tam olarak böyle görünür: birbirinden bağımsız, kısa, tuzaklı sorular. Süre baskısında kazanmanın yolu her soruyu ayrı doğrulamak ve tanecik düzeyini (sipariş mi satır mı?) her seferinde kendine sormaktır. Sonunda iki cümlelik yorum ekle: "İptal-iade oranı %14; web iadesi diğer kanallardan yüksek, ürün sayfası bilgisi incelenmeli."'
      }
    ],
    faq: [
      {
        q: 'SQL turunda hangi lehçeyi kullanmalıyım?',
        a: 'Platformun desteklediği lehçeyi baştan sor (çoğunlukla PostgreSQL ya da MySQL). Kalıplar aynıdır; farklar tarih fonksiyonları, NULL sıralaması ve medyan gibi ayrıntılardadır. Emin olmadığın fonksiyonu "PostgreSQL\'de date_trunc ile yapardım" diye söyleyip ilerleyebilirsin.'
      },
      {
        q: 'Canlı kodlamada takılırsam ne yapmalıyım?',
        a: 'Sessiz kalma. Takıldığın yeri söyle, daha basit bir sürümü çöz (ör. önce tek departman için), sonra genelleştir. Mülakatçı çoğu zaman ipucu verir; ipucunu alıp ilerlemek de olumlu değerlendirilir.'
      },
      {
        q: 'İstatistik sorularında formül ezberlemem gerekir mi?',
        a: 'Kavramları doğru anlatmak formülden önemlidir: p-değeri, güven aralığı, güç, SRM, çoklu test. İki oran z-testini ve bootstrap\'ı birkaç satırda yazabilmek yeterli bir teknik derinlik sinyalidir.'
      },
      {
        q: 'Vaka sorusunda doğru cevap var mı?',
        a: 'Genellikle tek doğru cevap yoktur; değerlendirilen yapıdır: soruyu netleştirmek, veri hatasını elemek, KPI ağacıyla ayrıştırmak, hipotezleri önceliklendirmek ve öneriyi ölçülebilir kılmak.'
      },
      {
        q: 'Take-home için ne kadar zaman harcamalıyım?',
        a: 'Verilen süre sınırına uy (genelde 3–6 saat). Fazladan saatler çoğunlukla fark yaratmaz; net bir README, tekrarlanabilir kod ve bir sayfalık özet yaratır. Yapamadıklarını "sonraki adımlar" olarak yazmak dürüstlük puanı getirir.'
      }
    ],
    mistakes: [
      {
        why: 'COUNT(*) LEFT JOIN\'in NULL satırını da sayar; boş grup 1 görünür.',
        bad: 'sql = "SELECT d.name, COUNT(*) FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id GROUP BY d.dept_id"',
        good: 'sql = "SELECT d.name, COUNT(e.emp_id) FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id GROUP BY d.dept_id"'
      },
      {
        why: 'Alt sorguda tek bir NULL, NOT IN\'in hiçbir satır döndürmemesine yol açar.',
        bad: 'sql = "SELECT * FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM kara_liste)"',
        good: 'sql = "SELECT * FROM customers c WHERE NOT EXISTS (SELECT 1 FROM kara_liste k WHERE k.customer_id = c.customer_id)"'
      },
      {
        why: 'Boyut tablosunda yinelenen anahtar satırları çoğaltır ve toplamları şişirir.',
        bad: 'm = siparis.merge(musteri, on="mid")',
        good: 'm = siparis.merge(musteri, on="mid", validate="many_to_one")\nassert len(m) == len(siparis)'
      },
      {
        why: 'Karar yalnız p-değerine değil, deneyin geçerliliğine, etki büyüklüğüne ve koruyucu metriklere dayanır.',
        bad: 'print("p < 0.05, B kazandı, yayına alalım")',
        good: 'print("SRM yok; fark +3.8 puan, %95 GA 0.8–6.7 puan; koruyucu metrikler sağlamsa yayına alırım")'
      },
      {
        why: 'Eksik günler varken 7 satır 7 takvim günü değildir.',
        bad: 'kayan = gunluk_ciro.rolling(7).sum()   # sipariş olmayan günler yok',
        good: 'kayan = gunluk_ciro.resample("D").sum().rolling("7D").sum()'
      }
    ]
  }
);
})(window);
