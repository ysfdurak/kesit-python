/* PythonPatika — ileri: veri-modelleme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'veri-modelleme',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 60,
  needs: ['sqlite3', 'duckdb'],
  title: 'Veri modelleme ve ambar: normalizasyon, yıldız şema, SCD',
  sum: 'OLTP ile OLAP\'ı ayırır, normalizasyonu ve bilinçli denormalizasyonu öğrenirsin; Kimball yöntemiyle tanecik, olgu ve boyut tasarlar, kesit_bi yıldız şemasını okur, tarih boyutu ve vekil anahtar üretir, SCD 1-2-3 uygular ve anadolu_market\'i yıldız şemaya dönüştürürsün.',
  goals: [
    'OLTP ve OLAP modellerinin farkını açıklayıp bir tabloyu 3NF\'e normalize edebilirim.',
    'Bir olgu tablosunun taneciğini belirleyip SQL ile test edebilir, ölçüleri toplanabilirliğine göre doğru özetleyebilirim.',
    'Yıldız şema sorgusu yazabilir, tarih boyutu ve vekil anahtar üretebilirim.',
    'SCD tip 1, 2 ve 3\'ü uygulayıp olguları olay anındaki boyut sürümüne bağlayabilirim.',
    'Normalize bir işlem veritabanını (anadolu_market) yıldız şemaya dönüştürüp kaynakla mutabakat edebilirim.'
  ],
  body: `
<h2>Neden veri modelleme?</h2>
<p>Anadolu Market'in sipariş sistemi saniyede onlarca küçük işlem yapar: sepete ekle, stok düş, ödeme al. Bu sistemin tabloları hızlı ve tutarlı <b>yazmak</b> için tasarlanmıştır. Pazarlama müdürü ise şunu sorar: "2024'te bölge ve kategori bazında ciro nasıl değişti, hedefin ne kadarını tuttuk?" Bu soruyu sipariş sisteminin on tablosu üzerinden her seferinde yeniden JOIN'leyerek yanıtlamak hem yavaştır hem de her analist farklı bir tanım kullanır. Çözüm, analize uygun ikinci bir model kurmaktır: <b>veri ambarı</b> (data warehouse) ve onun en yaygın deseni olan <b>yıldız şema</b> (star schema).</p>
<p>Bu derste iki dünyayı ayıracak, normalizasyonu ve bilinçli denormalizasyonu, Kimball yönteminin olgu (fact) ve boyut (dimension) kavramlarını, tanecik (grain) seçimini, ölçü türlerini, tarih boyutunu, vekil anahtarı ve yavaş değişen boyutları (SCD) öğreneceksin. Örnekler PBIPatika'daki <code>kesit_bi</code> modeli ve SQLPatika'daki <code>anadolu_market</code> verisiyle çalışır. SQL tarafını <i>sql-analitik</i>, yükleme tarafını <i>veri-boru-hatti</i> dersinde gördün.</p>

<h2>OLTP ile OLAP</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>OLTP (işlem sistemi)</th><th>OLAP (analitik sistem)</th></tr>
<tr><td>Amaç</td><td>Tek tek kayıt yaz/oku</td><td>Milyonlarca satırı topla, karşılaştır</td></tr>
<tr><td>Sorgu</td><td><code>WHERE id = ?</code>, kısa transaction</td><td><code>GROUP BY</code> ay, bölge, kategori</td></tr>
<tr><td>Model</td><td>Normalize (3NF), çok tablo</td><td>Yıldız şema, az ve geniş tablo</td></tr>
<tr><td>Geçmiş</td><td>Çoğunlukla güncel durum</td><td>Zaman içindeki değişim (SCD)</td></tr>
<tr><td>Örnek</td><td>PostgreSQL, MySQL, SQLite</td><td>BigQuery, Snowflake, DuckDB, Power BI modeli</td></tr>
</table></div>

<h2>Normalizasyon: 1NF, 2NF, 3NF</h2>
<p>Normalizasyon, aynı bilginin tek yerde tutulması için tabloları bölmektir. Amaç güncelleme anomalilerini (bir müşterinin şehrini üç satırda değiştirip birini unutmak) önlemektir.</p>
<ul>
<li><b>1NF</b>: Her hücrede tek değer. "urunler: Kulaklık, Klavye" gibi listeli hücre yok; her ürün ayrı satır.</li>
<li><b>2NF</b>: Bileşik anahtarlı tabloda her sütun anahtarın <i>tamamına</i> bağlı. <code>(siparis_no, urun_no)</code> anahtarlı kalem tablosunda <code>urun_adi</code> yalnız <code>urun_no</code>'ya bağlıdır; ürün tablosuna taşınır.</li>
<li><b>3NF</b>: Anahtar olmayan sütun başka bir anahtar olmayan sütuna bağlı değil. Siparişte <code>musteri_no</code> ve <code>musteri_sehri</code> birlikte duruyorsa şehir müşteriye bağlıdır; müşteri tablosuna gider.</li>
</ul>
<pre class="py">duz = [   # tek tablo: her satırda müşteri ve ürün bilgisi tekrar ediyor
    {"siparis": 1, "musteri": 7, "sehir": "İzmir", "urun": 27, "urun_adi": "Keten Gömlek", "adet": 1},
    {"siparis": 1, "musteri": 7, "sehir": "İzmir", "urun": 9, "urun_adi": "Suç ve Ceza", "adet": 2},
    {"siparis": 2, "musteri": 7, "sehir": "İzmir", "urun": 9, "urun_adi": "Suç ve Ceza", "adet": 1},
]
musteri = {r["musteri"]: {"sehir": r["sehir"]} for r in duz}
urun = {r["urun"]: {"ad": r["urun_adi"]} for r in duz}
siparis = {r["siparis"]: {"musteri": r["musteri"]} for r in duz}
kalem = [(r["siparis"], r["urun"], r["adet"]) for r in duz]
print(musteri, urun, siparis, kalem, sep="\\n")</pre>
<p>Ambar tarafında ise bilinçli olarak <b>denormalize</b> ederiz: ürün boyutunda kategori adı ürünün yanında durur, kategori ayrı tabloya bölünmez. Okuma çok, yazma az olduğu için tekrar maliyeti düşük, JOIN tasarrufu büyüktür.</p>

<h2>Kimball: olgu, boyut ve tanecik</h2>
<p><b>Olgu tablosu</b> (fact table) ölçülebilir olayları tutar: satış satırı, uçuş, banka işlemi. Sütunları boyut anahtarları ve sayısal <b>ölçüler</b>dir (adet, tutar). <b>Boyut tablosu</b> (dimension table) olayın bağlamını verir: kim (müşteri), ne (ürün), ne zaman (tarih), nerede (mağaza). Filtreler ve gruplamalar boyutlardan gelir.</p>
<p>Modelin ilk ve en önemli kararı <b>tanecik</b>tir (grain): "olgu tablosunda bir satır tam olarak neyi temsil eder?" Kimball'ın sırası: iş sürecini seç, tanecik bildir, boyutları belirle, ölçüleri belirle. Tanecik net değilse sayılar ikiye katlanır ya da kaybolur.</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçü türü</th><th>Tanım</th><th>Örnek (kesit_bi)</th></tr>
<tr><td>Toplanabilir (additive)</td><td>Tüm boyutlarda toplanabilir</td><td><code>Satislar.Tutar</code>, <code>Adet</code></td></tr>
<tr><td>Yarı toplanabilir (semi-additive)</td><td>Bazı boyutlarda toplanır, <b>zamanda</b> toplanmaz</td><td><code>StokGorunum.StokAdet</code>, banka bakiyesi</td></tr>
<tr><td>Toplanamaz (non-additive)</td><td>Hiç toplanmaz; bileşenlerinden yeniden hesaplanır</td><td><code>BirimFiyat</code>, <code>Indirim</code> oranı, kâr marjı</td></tr>
</table></div>
<div class="warn"><b>Stok toplanmaz</b>Ocak sonu stoğu 307, şubat sonu 303 ise "çeyrek stoğu 610" diye bir şey yoktur. Yarı toplanabilir ölçüde zaman boyunca <b>dönem sonu</b> (son değer) ya da ortalama alınır; ürünler ve depolar arasında ise toplanabilir.</div>

<h2>Yıldız ve kar tanesi: kesit_bi modelini okumak</h2>
<p><b>Yıldız şemada</b> olgu tablosu ortada, her boyut tek bir JOIN uzaklığındadır. <b>Kar tanesi</b> (snowflake) şemada boyutlar da normalize edilir (ürün → kategori → departman); daha az tekrar, daha çok JOIN. Power BI ve çoğu ambar için önerilen yıldızdır.</p>
<p>PBIPatika'daki <code>kesit_bi</code> modeli tipik bir yıldızdır: <code>Satislar</code> olgu tablosu (tanecik: <b>sipariş satırı</b>, <code>SatirNo</code> benzersiz), <code>Urunler</code>, <code>Musteriler</code>, <code>Tarih</code> boyutları. <code>Hedefler</code> ayrı bir olgu tablosudur ve taneciği farklıdır (<b>ay × kategori</b>). <code>StokGorunum</code> ise periyodik anlık görüntü (periodic snapshot) olgusudur: her ay sonu, her ürün için bir satır.</p>
<pre class="py">import veri

con = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler", "Musteriler", "Tarih"])
sql = """
SELECT t.Yil, u.Kategori, ROUND(SUM(s.Tutar), 2) AS ciro
FROM Satislar s
JOIN Tarih t      ON t.Tarih = s.Tarih
JOIN Urunler u    ON u.UrunNo = s.UrunNo
JOIN Musteriler m ON m.MusteriNo = s.MusteriNo
WHERE s.Durum NOT IN ('İptal', 'İade') AND t.Yil = 2024 AND m.Segment = 'Premium'
GROUP BY t.Yil, u.Kategori
ORDER BY ciro DESC
LIMIT 3
"""
for satir in con.execute(sql):
    print(satir)
# tanecik kontrolü: SatirNo benzersiz mi?
print(con.execute("SELECT COUNT(*), COUNT(DISTINCT SatirNo) FROM Satislar").fetchone())</pre>
<p>Sorgunun şekline dikkat: tüm filtreler (yıl, segment) boyutlardan, toplanan değer olgudan gelir. Power BI'da aynı şeyi model görünümünde 1-çok (one-to-many) ilişkilerle, dilimleyicilerle (slicer) yaparsın; PBIPatika'daki modelin tam bu yapıda olmasının nedeni budur.</p>

<h2>Tarih boyutu ve vekil anahtar</h2>
<p>Tarih boyutu her ambarın ilk boyutudur: her gün için bir satır; yıl, çeyrek, ay adı, hafta sonu, tatil gibi sütunlar. Böylece "hafta sonu satışları" ya da "çeyrek bazında" sorgular tarih fonksiyonu yazmadan, basit bir filtreyle yapılır. Tarih boyutunu Python ile birkaç satırda üretebilirsin:</p>
<pre class="py">from datetime import date, timedelta

AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

def tarih_satiri(g):
    return {
        "tarih_key": g.year * 10000 + g.month * 100 + g.day,   # 20240315 gibi okunur vekil anahtar
        "tarih": g.isoformat(),
        "yil": g.year,
        "ceyrek": (g.month - 1) // 3 + 1,
        "ay_adi": AYLAR[g.month - 1],
        "hafta_sonu": g.weekday() &gt;= 5,
    }

baslangic = date(2024, 3, 29)
for i in range(3):
    print(tarih_satiri(baslangic + timedelta(days=i)))</pre>
<p><b>Vekil anahtar</b> (surrogate key), boyut satırına ambarın verdiği anlamsız tamsayı kimliktir; kaynak sistemin <b>doğal anahtarı</b> (natural/business key: müşteri no, ürün kodu) ayrı sütunda durur. Neden? (1) Aynı müşterinin geçmiş sürümlerini (SCD2) ayırt etmek için her sürüme ayrı anahtar gerekir; (2) farklı kaynak sistemlerin numaraları çakışabilir; (3) tamsayı JOIN'leri hızlıdır; (4) "bilinmeyen müşteri" için <code>-1</code> gibi özel bir satır tutabilirsin. Tarih boyutunda ise <code>20240315</code> biçimi istisnai olarak okunur bir vekil anahtardır.</p>

<h2>Yavaş değişen boyutlar (SCD)</h2>
<p>Müşteri Ankara'dan İzmir'e taşındı. Geçen yılın satışları hangi bölgede görünmeli? Bu sorunun cevabı SCD (slowly changing dimension) tipidir:</p>
<div class="tbl-wrap"><table>
<tr><th>Tip</th><th>Ne yapar?</th><th>Geçmiş satışlar</th><th>Ne zaman?</th></tr>
<tr><td>Tip 0</td><td>Hiç değişmez</td><td>İlk değer</td><td>Doğum tarihi, ilk kayıt kanalı</td></tr>
<tr><td>Tip 1</td><td>Üstüne yazar</td><td>Yeni değerle görünür (geçmiş kaybolur)</td><td>Yazım düzeltmesi, e-posta</td></tr>
<tr><td>Tip 2</td><td>Yeni satır ekler; eski satır kapanır (<code>gecerli_bitis</code>, <code>guncel</code>)</td><td>O tarihteki değerle görünür</td><td>Şehir, segment, fiyat listesi</td></tr>
<tr><td>Tip 3</td><td>Önceki değer için ayrı sütun</td><td>Hem eski hem yeni karşılaştırılabilir</td><td>Bölge yeniden yapılanması</td></tr>
</table></div>
<pre class="py">boyut = [{"key": 1, "musteri_no": 7, "sehir": "Ankara", "baslangic": "2023-01-01", "bitis": None, "guncel": True}]

def scd2(boyut, musteri_no, yeni_sehir, tarih):
    eski = next(r for r in boyut if r["musteri_no"] == musteri_no and r["guncel"])
    if eski["sehir"] == yeni_sehir:
        return                                   # değişiklik yok, yeni sürüm açma
    eski["bitis"], eski["guncel"] = tarih, False  # eski sürümü kapat
    boyut.append({"key": max(r["key"] for r in boyut) + 1, "musteri_no": musteri_no,
                  "sehir": yeni_sehir, "baslangic": tarih, "bitis": None, "guncel": True})

scd2(boyut, 7, "İzmir", "2024-06-01")
scd2(boyut, 7, "İzmir", "2024-07-01")            # tekrar: etkisiz
for r in boyut:
    print(r)</pre>
<p>SCD2'de olgu satırı, olay tarihinde geçerli olan sürümün <b>vekil anahtarını</b> taşır; böylece 2023 satışı Ankara'da, 2024 Temmuz satışı İzmir'de görünür. SCD2'nin SQL ve upsert ile yüklenmesini <i>veri-boru-hatti</i> dersinde, dbt snapshot ile otomatikleştirilmesini <i>dbt-elt</i> dersinde görürsün.</p>

<h2>anadolu_market'ten yıldız şemaya</h2>
<p>SQLPatika'daki <code>anadolu_market</code> bir OLTP modelidir: <code>orders</code> (başlık), <code>order_items</code> (kalem), <code>customers</code>, <code>products</code>. Bunu yıldıza çevirmek için: tanecik = sipariş kalemi; boyutlar = tarih, müşteri, ürün (+ kanal, durum gibi düşük kardinaliteli sütunlar olguda kalabilir); ölçüler = adet, brüt tutar, indirim, net tutar. DuckDB ile:</p>
<pre class="py">import duckdb
import veri

con = duckdb.connect()
for t in ["orders", "order_items", "products"]:
    con.execute(f"CREATE TABLE {t} AS SELECT * FROM read_csv('{veri.yol('anadolu_market', t)}')")

con.execute("""
CREATE TABLE dim_urun AS
SELECT ROW_NUMBER() OVER (ORDER BY product_id) AS urun_key, product_id, name AS urun, category AS kategori
FROM products
""")
con.execute("""
CREATE TABLE fact_satis AS
SELECT i.item_id,
       CAST(strftime(o.order_date, '%Y%m%d') AS INTEGER) AS tarih_key,
       d.urun_key, o.customer_id, o.channel AS kanal, o.status AS durum,
       i.quantity AS adet,
       ROUND(i.quantity * i.unit_price * (1 - i.discount), 2) AS net_tutar
FROM order_items i
JOIN orders o   ON o.order_id = i.order_id
JOIN dim_urun d ON d.product_id = i.product_id
""")
print(con.execute("SELECT COUNT(*), ROUND(SUM(net_tutar), 2) FROM fact_satis").fetchone())
print(con.execute("""
    SELECT d.kategori, ROUND(SUM(f.net_tutar), 2) FROM fact_satis f JOIN dim_urun d USING (urun_key)
    WHERE f.durum &lt;&gt; 'cancelled' GROUP BY 1 ORDER BY 2 DESC LIMIT 3
""").fetchall())</pre>
<p>Olgu tablosu 1620 satır, kalem tablosuyla aynı: tanecik korundu. Toplam net tutar <code>kesit_bi.Satislar</code>'ın tutar toplamıyla (1.346.189,85) bire bir aynı; PBIPatika modeli de tam olarak bu dönüşümle üretilmiştir.</p>

<h2>Data vault ve one-big-table</h2>
<ul>
<li><b>Data vault</b>: hub (iş anahtarları), link (ilişkiler) ve satellite (zamanla değişen öznitelikler) tablolarıyla, kaynakları değiştirmeden ve tam denetim izi bırakarak entegre eder. Çok kaynaklı, düzenlemeye tabi kurumlarda ham entegrasyon katmanı olarak kullanılır; üstüne yine yıldız şema kurulur.</li>
<li><b>One-big-table (OBT)</b>: tüm boyut sütunlarını olguya katlayıp tek geniş tablo yapmak. Sütun tabanlı ambarlarda (BigQuery, DuckDB) basit raporlar için hızlı ve kolaydır; ama SCD, tutarlı boyut ve bakım zorlaşır. Genellikle yıldızın <i>üstüne</i> bir sunum katmanı olarak üretilir.</li>
</ul>
<div class="note"><b>Gerçek işte</b>Bir veri ekibine katıldığında ilk soracağın şey "bu tablonun taneciği ne?" olmalı. Panolardaki sayı farklarının çoğu model hatasıdır: başlık düzeyindeki kargo ücretini kalem düzeyindeki tabloya JOIN'leyip toplamak (fan-out), stoğu aylar boyunca toplamak, ya da müşteri boyutunu tip 1 tutup geçmiş bölge raporlarının her ay değişmesi. Kıdemli mühendisler her olgu tablosunun yanına tek cümlelik tanecik tanımını ve "toplanabilir mi?" notunu yazar; bu, dbt belgelerinde ve Power BI ölçü açıklamalarında standarttır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tutarlı boyutlar ve veri yolu matrisi</h3>
<p>Aynı <code>dim_tarih</code> ve <code>dim_urun</code>'u satış, stok ve hedef olgularının hepsi paylaşırsa (conformed dimension), farklı olgular aynı satırda karşılaştırılabilir (drill-across): "hedef ve gerçekleşen, kategori ve ay bazında". Kimball'ın veri yolu matrisi (bus matrix) satırlarda iş süreçlerini, sütunlarda boyutları gösterir ve ambar yol haritası olarak kullanılır.</p>
<h3>Rol yapan boyut</h3>
<p><code>Satislar</code> tablosunda iki tarih var: <code>Tarih</code> (sipariş) ve <code>TeslimTarihi</code>. Tek bir tarih boyutu iki farklı rolde, iki ayrı takma adla JOIN'lenir (role-playing dimension). Power BI'da biri etkin, diğeri <code>USERELATIONSHIP</code> ile kullanılan pasif ilişkidir.</p>
<h3>Bilinmeyen üye ve geç gelen boyut</h3>
<p><code>kesit_bi.Musteriler</code>'de 7 müşterinin bölgesi boş. Raporda NULL grubu yerine boyuta "Bilinmiyor" değeri koymak (ya da <code>-1</code> anahtarlı bilinmeyen üye satırı) standarttır. Olgu, boyut kaydından önce gelirse (late-arriving dimension) olguyu <code>-1</code>'e bağlar, boyut gelince düzeltirsin.</p>
<h3>Olgu tablosu türleri</h3>
<p>İşlem (transaction: her satış), periyodik anlık görüntü (her ay sonu stok), biriken anlık görüntü (accumulating snapshot: siparişin sipariş, kargo, teslim tarihleri tek satırda güncellenir) ve olgusuz olgu (factless fact: derse katılım gibi yalnız "oldu" bilgisi).</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir olgu tablosu tasarlarken Kimball yöntemine göre <b>ilk</b> verilmesi gereken karar hangisidir?',
      o: [
        'Hangi ölçülerin tutulacağı',
        'Tanecik: bir satırın tam olarak neyi temsil ettiği',
        'Boyut tablolarının hangi sütunları içereceği',
        'Vekil anahtarların veri türü'
      ],
      a: 1,
      why: 'Sıra: iş süreci, tanecik, boyutlar, ölçüler. Tanecik belirlenmeden hangi boyutların ve ölçülerin o satıra ait olduğu bilinemez; yanlış tanecik çift sayıma ya da kayıp detaya yol açar.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdaki ölçülerden hangisi <b>yarı toplanabilir</b> (semi-additive) bir ölçüdür?',
      o: [
        'Satış satırının tutarı',
        'Ay sonu banka hesap bakiyesi',
        'Ürünün birim fiyatı',
        'Satılan adet'
      ],
      a: 1,
      why: 'Bakiye ve stok, hesaplar veya ürünler arasında toplanır ama zaman boyunca toplanmaz (ocak + şubat bakiyesi anlamsızdır). Tutar ve adet tamamen toplanabilir, birim fiyat ise hiç toplanmaz.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Müşteri boyutunda kaynak sistemin <code>musteri_no</code>\'su varken ayrıca vekil anahtar (<code>musteri_key</code>) tutmanın en önemli nedeni nedir?',
      o: [
        'Tamsayı anahtar her durumda daha az disk kaplar',
        'SCD2\'de her müşteri sürümü ayrı anahtar ister',
        'Kaynak sistem numaraları her zaman metin türündedir',
        'Power BI doğal anahtarla tablolar arası ilişki kuramaz'
      ],
      a: 1,
      why: 'SCD tip 2\'de bir müşterinin birden çok sürümü olur; musteri_no artık satırı tek başına tanımlamaz. Vekil anahtar her sürümü ayırır ve olgu satırı olay anındaki sürüme bağlanır. Kaynaktan bağımsızlık ve hız da artı değerdir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Analist çeyrek stoğunu hesaplıyor. Bu kod ne yazdırır?',
      code: 'stok = [  # (ay_sonu, urun, adet)  periyodik anlık görüntü\n    ("01-31", "A", 10), ("01-31", "B", 5),\n    ("02-28", "A", 8), ("02-28", "B", 6),\n    ("03-31", "A", 7), ("03-31", "B", 9),\n]\nyanlis = sum(a for _, _, a in stok)\nson_ay = max(t for t, _, _ in stok)\ndogru = sum(a for t, _, a in stok if t == son_ay)\nprint(yanlis, dogru)\n',
      o: ['45 16', '16 45', '45 15', '16 16'],
      a: 0,
      why: 'Tüm ayları toplamak (45) stok gibi yarı toplanabilir ölçüde anlamsızdır. Çeyrek sonu stoğu son anlık görüntüdeki ürünlerin toplamıdır: 7 + 9 = 16.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Kargo ücreti sipariş başlığında, ürünler kalem tablosunda. Bu kod ne yazdırır?',
      code: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.executescript("""\nCREATE TABLE siparis (no INTEGER, kargo REAL);\nCREATE TABLE kalem (siparis_no INTEGER, urun TEXT);\nINSERT INTO siparis VALUES (1, 30), (2, 50);\nINSERT INTO kalem VALUES (1, \'A\'), (1, \'B\'), (1, \'C\'), (2, \'A\');\n""")\nprint(con.execute("SELECT SUM(s.kargo) FROM siparis s JOIN kalem k ON k.siparis_no = s.no").fetchone()[0])\n',
      o: ['80.0', '140.0', '110.0', '4'],
      a: 1,
      why: 'JOIN, başlık satırını her kalem için tekrarlar (fan-out): 30 üç kez, 50 bir kez = 140. Gerçek kargo toplamı 80\'dir. Başlık düzeyindeki ölçüyü kalem taneciğine indirmeden toplamamalısın.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'SCD2 boyutunda olay tarihine göre sürüm aranıyor. Bu kod ne yazdırır?',
      code: 'boyut = [\n    {"key": 11, "no": 7, "segment": "Bireysel", "bas": "2023-01-01", "bit": "2024-03-01"},\n    {"key": 12, "no": 7, "segment": "Premium", "bas": "2024-03-01", "bit": "9999-12-31"},\n]\n\ndef anahtar(no, tarih):\n    for r in boyut:\n        if r["no"] == no and r["bas"] <= tarih < r["bit"]:\n            return r["key"], r["segment"]\n\nprint(anahtar(7, "2024-02-29"), anahtar(7, "2024-03-01"))\n',
      o: [
        '(11, \'Bireysel\') (12, \'Premium\')',
        '(11, \'Bireysel\') (11, \'Bireysel\')',
        '(12, \'Premium\') (12, \'Premium\')',
        '(11, \'Bireysel\') None'
      ],
      a: 0,
      why: 'Aralık yarı açıktır: başlangıç dahil, bitiş hariç. 2024-02-29 ilk sürüme, tam 2024-03-01 ikinci sürüme düşer. Uçlarda çakışma olmaması için bitiş = yeni sürümün başlangıcı ve "<" kullanılır; açık sürümün bitişi uzak bir tarihtir (9999-12-31).' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Bir haftalık tarih boyutu üreten programın satırlarını sırala.</p>',
      lines: [
        'from datetime import date, timedelta',
        'bas = date(2024, 12, 28)',
        'gunler = [bas + timedelta(days=i) for i in range(7)]',
        'boyut = [{"key": int(g.strftime("%Y%m%d")), "hs": g.weekday() >= 5} for g in gunler]',
        'print(boyut[0]["key"], boyut[-1]["key"], sum(r["hs"] for r in boyut))'
      ],
      expect: '20241228 20250103 2\n',
      hint: 'Önce başlangıç tarihi, sonra gün listesi, sonra o listeden boyut satırları.',
      why: '28 Aralık 2024 Cumartesi; yedi gün 3 Ocak 2025\'e uzanır ve içinde iki hafta sonu günü (Cumartesi, Pazar) vardır. Tarih boyutu yıl geçişlerini kendiliğinden doğru yönetir.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'veri-modelleme-1',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p><code>tarih_boyutu(baslangic, bitis)</code> yaz: iki <code>date</code> arasındaki (ikisi de dahil) her gün için şu sözlüğü üreten bir liste döndürsün: <code>tarih</code> (ISO metin), <code>tarih_key</code> (YYYYMMDD tamsayı), <code>yil</code>, <code>ceyrek_no</code> (1–4), <code>ay_no</code>, <code>ay</code> (Türkçe kısa ad: Oca, Şub, Mar, Nis, May, Haz, Tem, Ağu, Eyl, Eki, Kas, Ara), <code>hafta_sonu</code> (<code>"Evet"</code>/<code>"Hayır"</code>). Sonucu <code>kesit_bi</code>\'nin <code>Tarih</code> boyutuyla karşılaştıracağız.</p>',
      guide: [
        'Ay adları için 12 elemanlı bir liste tanımla.',
        'Gün sayısını (bitis - baslangic).days + 1 ile bul ve timedelta ile dolaş.',
        'Çeyrek: (ay - 1) // 3 + 1; anahtar: yil*10000 + ay*100 + gun.',
        'hafta_sonu: weekday() 5 ya da 6 ise "Evet".'
      ],
      example: 'from datetime import date, timedelta\n\nGUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\nbas = date(2025, 1, 1)\nfor i in range(3):\n    g = bas + timedelta(days=i)\n    print(g.isoformat(), GUNLER[g.weekday()], g.isocalendar().week)\n',
      start: 'from datetime import date, timedelta\nimport veri\n\nAYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]\n\n\ndef tarih_boyutu(baslangic, bitis):\n    satirlar = []\n    # TODO: baslangic\'tan bitis\'e (dahil) her gün için sözlük üret\n    return satirlar\n\n\nboyut = tarih_boyutu(date(2022, 1, 1), date(2024, 12, 31))\nprint(len(boyut), boyut[:1])\n',
      sol: 'from datetime import date, timedelta\nimport veri\n\nAYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]\n\n\ndef tarih_boyutu(baslangic, bitis):\n    satirlar = []\n    for i in range((bitis - baslangic).days + 1):\n        g = baslangic + timedelta(days=i)\n        satirlar.append({\n            "tarih": g.isoformat(),\n            "tarih_key": g.year * 10000 + g.month * 100 + g.day,\n            "yil": g.year,\n            "ceyrek_no": (g.month - 1) // 3 + 1,\n            "ay_no": g.month,\n            "ay": AYLAR[g.month - 1],\n            "hafta_sonu": "Evet" if g.weekday() >= 5 else "Hayır",\n        })\n    return satirlar\n\n\nboyut = tarih_boyutu(date(2022, 1, 1), date(2024, 12, 31))\nprint(len(boyut), boyut[:1])\n',
      tests: '_b = tarih_boyutu(date(2022, 1, 1), date(2024, 12, 31))\nassert len(_b) == 1096, f"2022-2024 arası 1096 gün (2024 artık yıl), gelen {len(_b)}"\n_ref = {r["Tarih"]: r for r in veri.kayitlar("kesit_bi", "Tarih")}\n_fark = [r["tarih"] for r in _b if (r["yil"], r["ceyrek_no"], r["ay_no"], r["ay"], r["hafta_sonu"]) != (_ref[r["tarih"]]["Yil"], _ref[r["tarih"]]["CeyrekNo"], _ref[r["tarih"]]["AyNo"], _ref[r["tarih"]]["Ay"], _ref[r["tarih"]]["HaftaSonu"])]\nassert not _fark, f"kesit_bi Tarih boyutuyla uyuşmayan günler var, ilki: {_fark[:1]}"\nassert _b[59]["tarih_key"] == 20220301 and isinstance(_b[59]["tarih_key"], int), "tarih_key YYYYMMDD tamsayı olmalı"\nassert sum(r["hafta_sonu"] == "Evet" for r in _b) == 314, "3 yılda 314 hafta sonu günü var"\nassert len(tarih_boyutu(date(2024, 2, 28), date(2024, 3, 1))) == 3, "29 Şubat 2024 dahil 3 gün"\n',
      hints: [
        'for i in range((bitis - baslangic).days + 1): g = baslangic + timedelta(days=i)',
        'Ay adı: AYLAR[g.month - 1]; çeyrek: (g.month - 1) // 3 + 1',
        '"Evet" if g.weekday() >= 5 else "Hayır"'
      ],
      why: 'Tarih boyutu bir kez üretilir ve tüm olgu tabloları onu paylaşır. Takvim mantığını (artık yıl, çeyrek, hafta sonu) tek yerde hesaplamak, her raporda tarih fonksiyonu yazmaktan hem hızlı hem tutarlıdır.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'veri-modelleme-2',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Tanecik testi. <code>tanecik_ihlali(con, tablo, sutunlar)</code> yaz: verilen sütun kombinasyonunun tabloda benzersiz olup olmadığını denetlesin ve <b>birden fazla satırı olan</b> kombinasyon sayısını döndürsün (0 = tanecik doğru). <code>kesit_bi</code> ile dene: <code>Satislar</code> için <code>["SatirNo"]</code>, <code>["SiparisNo"]</code>; <code>Hedefler</code> için <code>["Tarih", "Kategori"]</code>.</p>',
      guide: [
        'Sütun listesini virgülle birleştirip SQL\'e koy (sütun adları senin kontrolünde).',
        'GROUP BY sütunlar HAVING COUNT(*) > 1 ile tekrar eden grupları bul.',
        'Bu grupları bir alt sorguda sayıp tek sayı döndür.'
      ],
      example: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE vardiya (personel, gun)")\ncon.executemany("INSERT INTO vardiya VALUES (?, ?)", [("Ali", "Pzt"), ("Ali", "Pzt"), ("Ece", "Pzt")])\nprint(con.execute("SELECT personel, gun, COUNT(*) FROM vardiya GROUP BY personel, gun HAVING COUNT(*) > 1").fetchall())\n',
      start: 'import veri\n\n\ndef tanecik_ihlali(con, tablo, sutunlar):\n    # TODO: sütunları virgülle birleştir\n    # TODO: GROUP BY ... HAVING COUNT(*) > 1 olan grupları say\n    return None\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Hedefler"])\nprint(tanecik_ihlali(con, "Satislar", ["SatirNo"]))\n',
      sol: 'import veri\n\n\ndef tanecik_ihlali(con, tablo, sutunlar):\n    liste = ", ".join(f\'"{s}"\' for s in sutunlar)\n    sql = f\'SELECT COUNT(*) FROM (SELECT 1 FROM "{tablo}" GROUP BY {liste} HAVING COUNT(*) > 1)\'\n    return con.execute(sql).fetchone()[0]\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Hedefler"])\nprint(tanecik_ihlali(con, "Satislar", ["SatirNo"]))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["Satislar", "Hedefler"])\nassert tanecik_ihlali(_c, "Satislar", ["SatirNo"]) == 0, "Satislar\'ın taneciği sipariş satırıdır: SatirNo benzersiz"\n_s = tanecik_ihlali(_c, "Satislar", ["SiparisNo"])\nassert _s == _c.execute("SELECT COUNT(*) FROM (SELECT SiparisNo FROM Satislar GROUP BY 1 HAVING COUNT(*) > 1)").fetchone()[0] and _s > 0, "çok kalemli siparişler SiparisNo düzeyinde tekrar eder"\nassert tanecik_ihlali(_c, "Hedefler", ["Tarih", "Kategori"]) == 0, "Hedefler\'in taneciği ay x kategori"\nassert tanecik_ihlali(_c, "Hedefler", ["Tarih"]) == 36, "her ay 7 kategori var: 36 ayın hepsi tekrar eder"\n',
      hints: [
        'Alt sorgu: SELECT 1 FROM tablo GROUP BY a, b HAVING COUNT(*) > 1',
        'Dışta COUNT(*) ile alt sorgunun satırlarını say.',
        'Türkçe karakterli ya da büyük harfli adları çift tırnakla yaz: "SatirNo".'
      ],
      why: 'Tanecik bir iddiadır ve test edilmelidir. Bu sorgu dbt\'nin unique testinin (dbt-elt dersi) ta kendisidir; her yüklemeden sonra çalıştırılırsa fan-out ve çift yükleme hataları panoya ulaşmadan yakalanır.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'veri-modelleme-3',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Yıldız sorgusu. <code>bolge_ciro(con, yil)</code> yaz: <code>kesit_bi</code> modelinde <code>Satislar</code>\'ı <code>Musteriler</code> ve <code>Tarih</code> ile birleştir, verilen yılda <code>Durum</code>\'u <code>\'İptal\'</code> olmayan satırların <code>Tutar</code> toplamını bölge bazında hesapla. Bölgesi boş (NULL) olan müşteriler <code>"Bilinmiyor"</code> grubunda görünsün. <code>[(bolge, ciro), ...]</code> listesini ciroya göre azalan sırada, ciro 2 basamağa yuvarlanmış döndür.</p>',
      guide: [
        'Olgu: Satislar s; boyutlar: Musteriler m (MusteriNo), Tarih t (Tarih).',
        'Yıl filtresini boyuttan al: t.Yil = ?',
        'COALESCE(m.Bolge, \'Bilinmiyor\') ile boşları adlandır.',
        'GROUP BY 1, ORDER BY 2 DESC; ROUND(SUM(s.Tutar), 2).'
      ],
      example: 'import veri\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler"])\nprint(con.execute("""\n    SELECT u.Kategori, COUNT(*) FROM Satislar s JOIN Urunler u ON u.UrunNo = s.UrunNo\n    GROUP BY 1 ORDER BY 2 DESC LIMIT 2\n""").fetchall())\n',
      start: 'import veri\n\n\ndef bolge_ciro(con, yil):\n    sql = """\n        SELECT m.Bolge, ROUND(SUM(s.Tutar), 2)\n        FROM Satislar s\n        -- TODO: Musteriler ve Tarih ile birleştir\n        -- TODO: yıl ve durum filtresi, NULL bölge -> \'Bilinmiyor\'\n        GROUP BY 1 ORDER BY 2 DESC\n    """\n    return con.execute(sql).fetchall()\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler", "Tarih"])\nprint(bolge_ciro(con, 2024))\n',
      sol: 'import veri\n\n\ndef bolge_ciro(con, yil):\n    sql = """\n        SELECT COALESCE(m.Bolge, \'Bilinmiyor\') AS bolge, ROUND(SUM(s.Tutar), 2) AS ciro\n        FROM Satislar s\n        JOIN Musteriler m ON m.MusteriNo = s.MusteriNo\n        JOIN Tarih t      ON t.Tarih = s.Tarih\n        WHERE t.Yil = ? AND s.Durum <> \'İptal\'\n        GROUP BY 1 ORDER BY 2 DESC\n    """\n    return con.execute(sql, (yil,)).fetchall()\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler", "Tarih"])\nprint(bolge_ciro(con, 2024))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler", "Tarih"])\n_r = bolge_ciro(_c, 2024)\nassert _r[:2] == [("İç Anadolu", 255512.8), ("Marmara", 155605.3)], f"2024 ilk iki bölge yanlış: {_r[:2]}"\nassert ("Bilinmiyor", 40514.45) in _r, "bölgesi boş müşteriler \'Bilinmiyor\' olarak görünmeli"\nassert all(b is not None for b, _ in _r), "NULL bölge kalmamalı"\nassert len(_r) == 7, "6 bölge + Bilinmiyor"\nassert bolge_ciro(_c, 2022) != _r, "yıl parametresi kullanılmalı"\n',
      hints: [
        'JOIN Musteriler m ON m.MusteriNo = s.MusteriNo JOIN Tarih t ON t.Tarih = s.Tarih',
        'WHERE t.Yil = ? AND s.Durum <> \'İptal\' ve parametre (yil,)',
        'SELECT COALESCE(m.Bolge, \'Bilinmiyor\')'
      ],
      why: 'Yıldız sorgusunun kalıbı hep aynıdır: olguyu boyutlara bağla, filtreyi ve gruplamayı boyuttan, toplamı olgudan al. Boş boyut değerlerini adlandırmak raporda "(boş)" satırını ortadan kaldırır; ambarda bu genellikle boyut yüklenirken yapılır.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'veri-modelleme-4',
      diff: 2,
      q: '<p>Vekil anahtar dağıtıcı. <code>anahtar_ata(dogal_anahtarlar, eslesme)</code> yaz: <code>eslesme</code> mevcut <code>{dogal_anahtar: vekil_anahtar}</code> sözlüğüdür (yeni yüklemelerde korunmalı). Listede yeni gelen her doğal anahtara, mevcut en büyük vekil anahtardan devam eden bir sonraki tamsayıyı ver (boş sözlükte 1\'den başla; geliş sırasına göre). Fonksiyon güncellenmiş sözlüğü değiştirmeden <b>yeni</b> bir sözlük ve listedeki her elemanın vekil anahtarını içeren listeyi <code>(yeni_eslesme, anahtarlar)</code> olarak döndürsün. <code>None</code> doğal anahtar <code>-1</code> (bilinmeyen üye) alsın ve sözlüğe eklenmesin.</p>',
      guide: [
        'eslesme\'nin kopyasını al (dict(eslesme)).',
        'Sonraki anahtar: max(değerler, default=0) + 1; -1 gibi özel değerleri hesaba katma.',
        'Listeyi dolaş; None ise -1, sözlükte varsa mevcut değer, yoksa yeni değer ver ve sayacı artır.',
        'Sözlüğü ve anahtar listesini döndür.'
      ],
      example: 'etiket = {}\nsayac = 100\nfor sehir in ["Van", "Bursa", "Van"]:\n    if sehir not in etiket:\n        etiket[sehir] = sayac\n        sayac += 1\nprint(etiket)\n',
      start: 'def anahtar_ata(dogal_anahtarlar, eslesme):\n    yeni = dict(eslesme)\n    anahtarlar = []\n    # TODO: sonraki anahtarı bul\n    # TODO: her doğal anahtar için vekil anahtar ver (None -> -1)\n    return yeni, anahtarlar\n\n\nprint(anahtar_ata(["M7", "M9", "M7", None], {"M1": 1, "M7": 2}))\n',
      sol: 'def anahtar_ata(dogal_anahtarlar, eslesme):\n    yeni = dict(eslesme)\n    anahtarlar = []\n    sonraki = max((v for v in yeni.values() if v > 0), default=0) + 1\n    for d in dogal_anahtarlar:\n        if d is None:\n            anahtarlar.append(-1)\n            continue\n        if d not in yeni:\n            yeni[d] = sonraki\n            sonraki += 1\n        anahtarlar.append(yeni[d])\n    return yeni, anahtarlar\n\n\nprint(anahtar_ata(["M7", "M9", "M7", None], {"M1": 1, "M7": 2}))\n',
      tests: '_e = {"M1": 1, "M7": 2}\n_y, _a = anahtar_ata(["M7", "M9", "M7", None, "M3"], _e)\nassert _a == [2, 3, 2, -1, 4], f"anahtarlar yanlış: {_a}"\nassert _y == {"M1": 1, "M7": 2, "M9": 3, "M3": 4}, f"eşleşme yanlış: {_y}"\nassert _e == {"M1": 1, "M7": 2}, "girdi sözlüğü değiştirilmemeli"\nassert anahtar_ata(["A", "B"], {}) == ({"A": 1, "B": 2}, [1, 2]), "boş eşleşmede 1\'den başla"\nassert anahtar_ata([None], {}) == ({}, [-1]), "None sözlüğe eklenmez"\nassert anahtar_ata(["X"], {"?": -1, "Y": 5})[1] == [6], "-1 özel değeri sayaçta dikkate alınmamalı"\n',
      hints: [
        'sonraki = max((v for v in yeni.values() if v > 0), default=0) + 1',
        'Sözlükte yoksa yeni[d] = sonraki; sonraki += 1',
        'Her eleman için anahtarlar.append(yeni[d])'
      ],
      why: 'Vekil anahtarlar kalıcı olmalıdır: bir kez verilen anahtar sonraki yüklemelerde değişirse olgu tablosundaki tüm bağlar bozulur. Bilinmeyen üye (-1) ise olguyu kaybetmeden boyut eksikliğini görünür kılar.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-modelleme-5',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Normalizasyon. Destek ekibi sana <code>anadolu_market</code>\'ten JOIN\'lenmiş düz bir Excel dökümü verdi: her satırda <code>order_id, order_date, customer_id, city, product_id, product_name, category, quantity</code>. <code>normalize_et(duz)</code> yaz (<code>duz</code>: sözlük listesi) ve 3NF\'e uygun dört yapı döndürsün: <code>{"musteri": {customer_id: city}, "urun": {product_id: (product_name, category)}, "siparis": {order_id: (order_date, customer_id)}, "kalem": [(order_id, product_id, quantity), ...]}</code>. Aynı doğal anahtar için çelişen değer gelirse (ör. aynı müşteri iki farklı şehir) <code>ValueError</code> fırlat.</p>',
      start: 'import veri\n\n\ndef normalize_et(duz):\n    pass\n\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers", "products"])\ncon.row_factory = lambda c, r: {d[0]: v for d, v in zip(c.description, r)}\nduz = con.execute("""\n    SELECT o.order_id, o.order_date, o.customer_id, c.city, i.product_id,\n           p.name AS product_name, p.category, i.quantity\n    FROM order_items i JOIN orders o USING (order_id)\n    JOIN customers c USING (customer_id) JOIN products p USING (product_id)\n    WHERE o.order_id <= 50\n""").fetchall()\nn = normalize_et(duz)\nprint(len(duz), {k: len(v) for k, v in n.items()} if n else n)\n',
      sol: 'import veri\n\n\ndef normalize_et(duz):\n    musteri, urun, siparis, kalem = {}, {}, {}, []\n\n    def koy(sozluk, anahtar, deger):\n        if anahtar in sozluk and sozluk[anahtar] != deger:\n            raise ValueError(f"Çelişen değer: {anahtar}: {sozluk[anahtar]} / {deger}")\n        sozluk[anahtar] = deger\n\n    for r in duz:\n        koy(musteri, r["customer_id"], r["city"])\n        koy(urun, r["product_id"], (r["product_name"], r["category"]))\n        koy(siparis, r["order_id"], (r["order_date"], r["customer_id"]))\n        kalem.append((r["order_id"], r["product_id"], r["quantity"]))\n    return {"musteri": musteri, "urun": urun, "siparis": siparis, "kalem": kalem}\n\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers", "products"])\ncon.row_factory = lambda c, r: {d[0]: v for d, v in zip(c.description, r)}\nduz = con.execute("""\n    SELECT o.order_id, o.order_date, o.customer_id, c.city, i.product_id,\n           p.name AS product_name, p.category, i.quantity\n    FROM order_items i JOIN orders o USING (order_id)\n    JOIN customers c USING (customer_id) JOIN products p USING (product_id)\n    WHERE o.order_id <= 50\n""").fetchall()\nn = normalize_et(duz)\nprint(len(duz), {k: len(v) for k, v in n.items()} if n else n)\n',
      tests: '_n = normalize_et(duz)\nassert len(_n["kalem"]) == len(duz) == 90, f"her düz satır bir kalemdir (90), gelen {len(_n[\'kalem\'])}"\nassert len(_n["siparis"]) == 50, "ilk 50 sipariş"\nassert len(_n["musteri"]) == len({r["customer_id"] for r in duz}), "her müşteri bir kez"\nassert _n["urun"][27] == ("Keten Gömlek", "Giyim"), "ürün 27: Keten Gömlek, Giyim"\nassert _n["siparis"][1] == ("2023-04-27", 1), "sipariş 1: tarih ve müşteri"\n_bozuk = duz[:2] + [dict(duz[0], city="Atlantis")]\ntry:\n    normalize_et(_bozuk)\n    assert False, "aynı müşteri için iki farklı şehir ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: [
        'Her varlık için bir sözlük tut; kalemler bir listedir (bileşik anahtar).',
        'Eklemeden önce: anahtar sözlükte varsa ve değer farklıysa ValueError.',
        'Ürün değeri demet olsun: (product_name, category)'
      ],
      why: 'Normalizasyon, tekrar eden bilgiyi tek yere taşır ve çelişkiyi görünür kılar: düz dosyada aynı müşteri iki şehirle gelebilir, normalize modelde bu imkânsızdır. Ambar ise bunun tersini bilinçli yapar: okumayı hızlandırmak için boyutları geniş tutar.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-modelleme-6',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Yarı toplanabilir ölçü. <code>kesit_bi.StokGorunum</code> her ay sonu, her ürün için stok adedini tutar (<code>Tarih, UrunNo, StokAdet, ...</code>). <code>yil_sonu_stok(con)</code> yaz: her yıl için o yılın <b>son anlık görüntüsündeki</b> toplam <code>StokAdet</code>\'i <code>{yil(int): toplam}</code> olarak döndürsün. Ayları toplamak yanlış olur.</p>',
      start: 'import veri\n\n\ndef yil_sonu_stok(con):\n    pass\n\n\ncon = veri.baglan("kesit_bi", tablolar=["StokGorunum"])\nprint(yil_sonu_stok(con))\n',
      sol: 'import veri\n\n\ndef yil_sonu_stok(con):\n    sql = """\n        SELECT CAST(substr(Tarih, 1, 4) AS INTEGER) AS yil, SUM(StokAdet)\n        FROM StokGorunum\n        WHERE Tarih IN (SELECT MAX(Tarih) FROM StokGorunum GROUP BY substr(Tarih, 1, 4))\n        GROUP BY yil\n    """\n    return dict(con.execute(sql).fetchall())\n\n\ncon = veri.baglan("kesit_bi", tablolar=["StokGorunum"])\nprint(yil_sonu_stok(con))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["StokGorunum"])\n_r = yil_sonu_stok(_c)\nassert _r == {2022: 325, 2023: 309, 2024: 311}, f"yıl sonu stokları {{2022: 325, 2023: 309, 2024: 311}} olmalı (ayları toplamak 3541 gibi anlamsız sayılar verir), gelen {_r}"\n',
      hints: [
        'Önce her yılın en son Tarih\'ini bul: MAX(Tarih) GROUP BY yıl.',
        'Sonra yalnız o tarihlerdeki satırları topla.',
        'Yıl: CAST(substr(Tarih, 1, 4) AS INTEGER)'
      ],
      why: 'Stok ve bakiye gibi anlık görüntü ölçüleri zamanda "son değer" (ya da ortalama) ile özetlenir. Power BI\'da bunun karşılığı LASTDATE / LASTNONBLANK ile yazılan ölçülerdir; PBIPatika\'daki stok ölçüleri bu yüzden SUM değil dönem sonu mantığıyla kurulur.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-modelleme-7',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Farklı tanecikteki olguları karşılaştır (drill-across). <code>kesit_bi.Hedefler</code> <b>ay × kategori</b> düzeyinde (<code>Tarih</code> ayın ilk günü), <code>Satislar</code> ise satır düzeyindedir. <code>hedef_gerceklesme(con, yil)</code> yaz: verilen yılda her kategori için gerçekleşen ciroyu (Durum <code>\'İptal\'</code> ve <code>\'İade\'</code> hariç <code>Tutar</code> toplamı) ve hedef toplamını hesapla; <code>{kategori: oran}</code> döndür (oran = gerçekleşen / hedef, 3 basamak). Önce her iki olguyu <b>ortak taneciğe</b> (kategori) indir, sonra birleştir; ham satırları hedefle JOIN\'leme.</p>',
      start: 'import veri\n\n\ndef hedef_gerceklesme(con, yil):\n    pass\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler", "Hedefler"])\nprint(hedef_gerceklesme(con, 2024))\n',
      sol: 'import veri\n\n\ndef hedef_gerceklesme(con, yil):\n    sql = """\n        WITH gercek AS (\n            SELECT u.Kategori, SUM(s.Tutar) AS ciro\n            FROM Satislar s JOIN Urunler u ON u.UrunNo = s.UrunNo\n            WHERE substr(s.Tarih, 1, 4) = ? AND s.Durum NOT IN (\'İptal\', \'İade\')\n            GROUP BY u.Kategori\n        ), hedef AS (\n            SELECT Kategori, SUM(Hedef) AS hedef\n            FROM Hedefler WHERE substr(Tarih, 1, 4) = ?\n            GROUP BY Kategori\n        )\n        SELECT h.Kategori, ROUND(1.0 * COALESCE(g.ciro, 0) / h.hedef, 3)\n        FROM hedef h LEFT JOIN gercek g ON g.Kategori = h.Kategori\n    """\n    return dict(con.execute(sql, (str(yil), str(yil))).fetchall())\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler", "Hedefler"])\nprint(hedef_gerceklesme(con, 2024))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler", "Hedefler"])\n_r = hedef_gerceklesme(_c, 2024)\nassert len(_r) == 7, f"7 kategori bekleniyordu: {_r}"\nassert _r["Elektronik"] == 0.942, f"Elektronik: 200930.05 / 213300 = 0.942, gelen {_r[\'Elektronik\']}"\nassert _r["Hediye"] == 0.793, f"Hediye: 9200 / 11600 = 0.793, gelen {_r[\'Hediye\']}"\nassert _r["Spor"] == 0.974, f"Spor: 96620.45 / 99200 = 0.974, gelen {_r[\'Spor\']}"\n',
      hints: [
        'İki CTE yaz: biri kategori bazında gerçekleşen, biri kategori bazında hedef.',
        'Ham Satislar ile Hedefler\'i doğrudan JOIN\'lemek her hedefi satır sayısı kadar çoğaltır.',
        'Sonuçta iki özet tabloyu Kategori üzerinden birleştir ve böl. Dikkat: SQLite\'ta iki tamsayının bölümü tamsayıdır (9200 / 11600 = 0); 1.0 * ile ondalığa çevir.'
      ],
      why: 'Farklı tanecikli olgular yalnız ortak boyutlar (tutarlı boyutlar: kategori, ay) üzerinden, önce özetlenip sonra birleştirilerek karşılaştırılır. Power BI\'da Hedefler tablosunun Tarih ve Kategori boyutlarına ayrı ayrı bağlanması da bu yüzdendir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-modelleme-8',
      diff: 2,
      q: '<p>SCD tip 1 ve tip 3. <code>boyut_guncelle(boyut, degisiklikler)</code> yaz. <code>boyut</code>: <code>{musteri_no: {"ad": ..., "eposta": ..., "bolge": ..., "onceki_bolge": ...}}</code>. <code>degisiklikler</code>: <code>(musteri_no, alan, yeni_deger)</code> listesi. Kurallar: <code>ad</code> ve <code>eposta</code> <b>tip 1</b> (üstüne yaz); <code>bolge</code> <b>tip 3</b> (değer gerçekten değiştiyse eski değeri <code>onceki_bolge</code>\'ye taşı, yenisini <code>bolge</code>\'ye yaz). Başka alan gelirse <code>KeyError</code>. Boyutu yerinde değiştir ve değişen müşteri sayısını döndür (aynı değerle gelen güncelleme sayılmaz).</p>',
      start: 'def boyut_guncelle(boyut, degisiklikler):\n    pass\n\n\nboyut = {7: {"ad": "Can Yılmaz", "eposta": "can@x.com", "bolge": "İç Anadolu", "onceki_bolge": None}}\nprint(boyut_guncelle(boyut, [(7, "bolge", "Ege")]), boyut)\n',
      sol: 'TIP1 = {"ad", "eposta"}\nTIP3 = {"bolge": "onceki_bolge"}\n\n\ndef boyut_guncelle(boyut, degisiklikler):\n    degisen = set()\n    for no, alan, yeni in degisiklikler:\n        satir = boyut[no]\n        if alan in TIP1:\n            if satir[alan] != yeni:\n                satir[alan] = yeni\n                degisen.add(no)\n        elif alan in TIP3:\n            if satir[alan] != yeni:\n                satir[TIP3[alan]] = satir[alan]\n                satir[alan] = yeni\n                degisen.add(no)\n        else:\n            raise KeyError(alan)\n    return len(degisen)\n\n\nboyut = {7: {"ad": "Can Yılmaz", "eposta": "can@x.com", "bolge": "İç Anadolu", "onceki_bolge": None}}\nprint(boyut_guncelle(boyut, [(7, "bolge", "Ege")]), boyut)\n',
      tests: '_b = {\n    7: {"ad": "Can Yılmaz", "eposta": "can@x.com", "bolge": "İç Anadolu", "onceki_bolge": None},\n    9: {"ad": "Ece Kurt", "eposta": "ece@x.com", "bolge": "Marmara", "onceki_bolge": None},\n}\nassert boyut_guncelle(_b, [(7, "bolge", "Ege"), (7, "eposta", "can@y.com"), (9, "bolge", "Marmara")]) == 1, "yalnız müşteri 7 değişti (9 aynı değerle geldi)"\nassert _b[7]["bolge"] == "Ege" and _b[7]["onceki_bolge"] == "İç Anadolu", "tip 3: eski bölge onceki_bolge\'ye taşınmalı"\nassert _b[7]["eposta"] == "can@y.com", "tip 1: e-posta üstüne yazılır"\nassert _b[9]["onceki_bolge"] is None, "değişmeyen bölge onceki_bolge\'yi ezmemeli"\nassert boyut_guncelle(_b, [(7, "bolge", "Akdeniz")]) == 1 and _b[7]["onceki_bolge"] == "Ege", "tip 3 yalnız bir önceki değeri tutar"\ntry:\n    boyut_guncelle(_b, [(9, "maas", 1)]); assert False, "bilinmeyen alan KeyError"\nexcept KeyError:\n    pass\n',
      hints: [
        'Alanları iki kümeye ayır: tip 1 alanları ve tip 3 alanı -> önceki sütun eşleşmesi.',
        'Değer aynıysa hiçbir şey yapma (sayma da).',
        'Değişen müşterileri bir kümede topla; aynı müşteri birden çok kez sayılmasın.'
      ],
      why: 'Bir boyutta sütun bazında farklı SCD tipleri karışık kullanılır: yazım düzeltmesi geçmişi değiştirmeli (tip 1), bölge değişikliği ise karşılaştırılabilir kalmalı (tip 3 ya da tip 2). Değişmeyen değeri "değişiklik" saymamak gereksiz sürüm ve gürültü üretmeyi önler.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'veri-modelleme-9',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Hatayı bul ve düzelt. Lojistik ekibi "sipariş başına ortalama kargo süresi" istiyor. <code>kesit_bi.Satislar</code>\'ta <code>KargoGun</code> sipariş düzeyinde bir bilgidir ama satır (kalem) düzeyindeki tabloda her kalemde tekrar eder. <code>ort_kargo(con)</code> çok kalemli siparişlere fazla ağırlık veriyor. Ortalamayı <b>sipariş taneciğinde</b> hesapla (KargoGun boş olanları dışarıda bırak), 4 basamağa yuvarla.</p>',
      start: 'import veri\n\n\ndef ort_kargo(con):\n    return con.execute(\n        "SELECT ROUND(AVG(KargoGun), 4) FROM Satislar WHERE KargoGun IS NOT NULL"\n    ).fetchone()[0]\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar"])\nprint(ort_kargo(con))\n',
      sol: 'import veri\n\n\ndef ort_kargo(con):\n    return con.execute("""\n        SELECT ROUND(AVG(kargo), 4) FROM (\n            SELECT SiparisNo, MAX(KargoGun) AS kargo\n            FROM Satislar WHERE KargoGun IS NOT NULL\n            GROUP BY SiparisNo\n        )\n    """).fetchone()[0]\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar"])\nprint(ort_kargo(con))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["Satislar"])\n_r = ort_kargo(_c)\nassert _r != 3.1209, "3.1209 kalem ağırlıklı ortalamadır: çok kalemli siparişler birden çok kez sayılıyor"\nassert _r == 3.0889, f"sipariş düzeyinde ortalama 3.0889 olmalı, gelen {_r}"\n',
      hints: [
        'Önce siparişe indir: GROUP BY SiparisNo, sonra ortalamasını al.',
        'Bir siparişin tüm kalemlerinde KargoGun aynıdır; MAX ya da MIN ile tek değere indir.'
      ],
      why: 'Ölçü, ait olduğu tanecikte toplanmalıdır. Başlık düzeyindeki bilgi kalem tablosuna taşındığında (denormalizasyon) her toplama ve ortalamada önce tekrar eden satırları tekilleştirmek gerekir; aksi halde çok kalemli siparişler sonucu çarpıtır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'veri-modelleme-10',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>scd2_uygula(boyut, musteri_no, segment, tarih)</code> müşteri segmenti değiştiğinde SCD tip 2 uygulamalıydı: mevcut güncel satırı kapatıp (<code>bitis = tarih</code>, <code>guncel = False</code>) yeni vekil anahtarlı satır açmak. Ama raporlarda geçmiş satışlar da yeni segmentle görünüyor. Ayrıca segment değişmediğinde de yeni satır açılıyor. İki hatayı da düzelt.</p>',
      start: 'def scd2_uygula(boyut, musteri_no, segment, tarih):\n    guncel = next(r for r in boyut if r["no"] == musteri_no and r["guncel"])\n    guncel["segment"] = segment\n    boyut.append({"key": max(r["key"] for r in boyut) + 1, "no": musteri_no, "segment": segment,\n                  "bas": tarih, "bitis": "9999-12-31", "guncel": True})\n    guncel["guncel"] = False\n\n\nboyut = [{"key": 1, "no": 7, "segment": "Bireysel", "bas": "2023-01-01", "bitis": "9999-12-31", "guncel": True}]\nscd2_uygula(boyut, 7, "Premium", "2024-03-01")\nprint(boyut)\n',
      sol: 'def scd2_uygula(boyut, musteri_no, segment, tarih):\n    guncel = next(r for r in boyut if r["no"] == musteri_no and r["guncel"])\n    if guncel["segment"] == segment:\n        return\n    guncel["bitis"] = tarih\n    guncel["guncel"] = False\n    boyut.append({"key": max(r["key"] for r in boyut) + 1, "no": musteri_no, "segment": segment,\n                  "bas": tarih, "bitis": "9999-12-31", "guncel": True})\n\n\nboyut = [{"key": 1, "no": 7, "segment": "Bireysel", "bas": "2023-01-01", "bitis": "9999-12-31", "guncel": True}]\nscd2_uygula(boyut, 7, "Premium", "2024-03-01")\nprint(boyut)\n',
      tests: '_b = [{"key": 1, "no": 7, "segment": "Bireysel", "bas": "2023-01-01", "bitis": "9999-12-31", "guncel": True},\n      {"key": 2, "no": 9, "segment": "Kurumsal", "bas": "2023-05-01", "bitis": "9999-12-31", "guncel": True}]\nscd2_uygula(_b, 7, "Premium", "2024-03-01")\nassert _b[0]["segment"] == "Bireysel", "eski sürümün segmenti değişmemeli: geçmiş satışlar Bireysel kalmalı"\nassert _b[0]["bitis"] == "2024-03-01" and _b[0]["guncel"] is False, "eski sürüm kapatılmalı (bitis = değişiklik tarihi)"\nassert _b[-1] == {"key": 3, "no": 7, "segment": "Premium", "bas": "2024-03-01", "bitis": "9999-12-31", "guncel": True}, f"yeni sürüm yanlış: {_b[-1]}"\nscd2_uygula(_b, 9, "Kurumsal", "2024-04-01")\nassert len(_b) == 3, "segment değişmediyse yeni satır açılmamalı"\nassert sum(r["guncel"] for r in _b if r["no"] == 7) == 1, "her müşterinin tek güncel satırı olmalı"\n',
      hints: [
        'Eski satırın özniteliğini değiştirmek SCD1 davranışıdır; SCD2\'de eski satır yalnızca kapatılır.',
        'Eski satırda yalnız bitis ve guncel alanları değişmeli.',
        'Başta segment aynıysa return ile çık.'
      ],
      why: 'SCD2\'nin özü eski sürümü dondurmaktır: öznitelikleri olduğu gibi kalır, yalnız geçerlilik aralığı kapanır. Değişmeyen değerle yeni sürüm açmak ise boyutu gereksiz şişirir ve "değişiklik sayısı" metriklerini bozar.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'veri-modelleme-11',
      diff: 3,
      q: '<p>Olguyu doğru sürüme bağla (point-in-time lookup). <code>olgu_bagla(boyut, olgular)</code> yaz. <code>boyut</code>: SCD2 satırları <code>{"key", "no", "bas", "bitis"}</code> (aralık <code>[bas, bitis)</code>, açık sürümde <code>bitis = "9999-12-31"</code>). <code>olgular</code>: <code>{"id", "no", "tarih"}</code> sözlükleri. Her olguya, tarihinde geçerli sürümün <code>key</code>\'ini yaz (<code>"musteri_key"</code> alanı); eşleşen sürüm yoksa (müşteri yok ya da tarih ilk sürümden önce) <code>-1</code>. Yeni liste döndür, girdileri değiştirme. Boyut büyük olabilir: her olgu için tüm boyutu taramak yerine müşteri bazında sıralı sürümler ve <code>bisect</code> kullan.</p>',
      start: 'import bisect\n\n\ndef olgu_bagla(boyut, olgular):\n    pass\n',
      sol: 'import bisect\nfrom collections import defaultdict\n\n\ndef olgu_bagla(boyut, olgular):\n    surumler = defaultdict(list)\n    for r in boyut:\n        surumler[r["no"]].append(r)\n    baslar = {}\n    for no, liste in surumler.items():\n        liste.sort(key=lambda r: r["bas"])\n        baslar[no] = [r["bas"] for r in liste]\n    sonuc = []\n    for o in olgular:\n        key = -1\n        if o["no"] in surumler:\n            i = bisect.bisect_right(baslar[o["no"]], o["tarih"]) - 1\n            if i >= 0:\n                r = surumler[o["no"]][i]\n                if o["tarih"] < r["bitis"]:\n                    key = r["key"]\n        sonuc.append({**o, "musteri_key": key})\n    return sonuc\n',
      tests: '_boyut = [\n    {"key": 12, "no": 7, "bas": "2024-03-01", "bitis": "9999-12-31"},\n    {"key": 11, "no": 7, "bas": "2023-01-01", "bitis": "2024-03-01"},\n    {"key": 20, "no": 9, "bas": "2023-06-01", "bitis": "2023-09-01"},\n]\n_olgu = [\n    {"id": 1, "no": 7, "tarih": "2023-05-10"},\n    {"id": 2, "no": 7, "tarih": "2024-03-01"},\n    {"id": 3, "no": 7, "tarih": "2022-12-31"},\n    {"id": 4, "no": 9, "tarih": "2023-10-01"},\n    {"id": 5, "no": 5, "tarih": "2024-01-01"},\n    {"id": 6, "no": 9, "tarih": "2023-08-31"},\n]\n_r = olgu_bagla(_boyut, _olgu)\nassert [o["musteri_key"] for o in _r] == [11, 12, -1, -1, -1, 20], f"anahtarlar yanlış: {[o[\'musteri_key\'] for o in _r]}"\nassert "musteri_key" not in _olgu[0], "girdi olguları değiştirilmemeli"\nassert _boyut[0]["key"] == 12, "girdi boyut listesinin sırası değiştirilmemeli"\nassert "bisect" in __source__, "bisect ile ara"\nimport random as _rnd\n_rnd.seed(1)\n_bb = []\nfor _n in range(300):\n    for _k, _y in enumerate(range(2015, 2025)):\n        _bb.append({"key": _n * 100 + _k, "no": _n, "bas": f"{_y}-01-01", "bitis": f"{_y + 1}-01-01" if _y < 2024 else "9999-12-31"})\n_oo = [{"id": i, "no": _rnd.randrange(300), "tarih": f"{_rnd.randrange(2015, 2026)}-06-15"} for i in range(20000)]\n_rr = olgu_bagla(_bb, _oo)\nassert all(o["musteri_key"] == o["no"] * 100 + min(int(o["tarih"][:4]) - 2015, 9) for o in _rr), "büyük girdide sonuçlar yanlış"\n',
      hints: [
        'Müşteri numarasına göre sürümleri grupla ve bas\'a göre sırala; ayrı bir bas listesi tut.',
        'bisect_right(baslar, tarih) - 1 tarihten önce ya da tarihte başlayan son sürümün indeksini verir.',
        'Bulunan sürümde tarih < bitis değilse (aralık kapanmış) -1 ver; olgu sözlüğünü {**o, "musteri_key": key} ile kopyala.'
      ],
      why: 'Ambar yüklemesinde olgu satırına boyut anahtarı atamak (surrogate key lookup) en sık yapılan işlemdir. SQL\'de bu "JOIN ... ON no = no AND tarih >= bas AND tarih < bitis" ile yapılır; Python\'da sıralı arama O(log n) maliyetle büyük hacimde de hızlı kalır.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'veri-modelleme-12',
      diff: 3,
      needs: ['sqlite3'],
      q: '<p>Rol yapan boyut. <code>kesit_bi.Satislar</code>\'ta iki tarih var: <code>Tarih</code> (sipariş) ve <code>TeslimTarihi</code>. Aynı <code>Tarih</code> boyutunu iki rolde kullanarak <code>hafta_sonu_teslim(con)</code> yaz: <b>hafta içi verilip</b> (sipariş günü <code>HaftaSonu = \'Hayır\'</code>) <b>hafta sonu teslim edilen</b> satırların, teslim tarihi dolu olan hafta içi siparişlere oranını 4 basamakla döndür. <code>Tarih</code> tablosunu iki farklı takma adla JOIN\'le; tarih fonksiyonu (<code>strftime</code> vb.) kullanma.</p>',
      start: 'import veri\n\n\ndef hafta_sonu_teslim(con):\n    pass\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Tarih"])\nprint(hafta_sonu_teslim(con))\n',
      sol: 'import veri\n\n\ndef hafta_sonu_teslim(con):\n    toplam, hs = con.execute("""\n        SELECT COUNT(*), SUM(CASE WHEN teslim.HaftaSonu = \'Evet\' THEN 1 ELSE 0 END)\n        FROM Satislar s\n        JOIN Tarih siparis ON siparis.Tarih = s.Tarih\n        JOIN Tarih teslim  ON teslim.Tarih = s.TeslimTarihi\n        WHERE siparis.HaftaSonu = \'Hayır\'\n    """).fetchone()\n    return round(hs / toplam, 4)\n\n\ncon = veri.baglan("kesit_bi", tablolar=["Satislar", "Tarih"])\nprint(hafta_sonu_teslim(con))\n',
      tests: '_c = veri.baglan("kesit_bi", tablolar=["Satislar", "Tarih"])\nassert hafta_sonu_teslim(_c) == round(324 / 1110, 4), f"1110 hafta içi siparişin 324\'ü hafta sonu teslim: 0.2919 bekleniyordu, gelen {hafta_sonu_teslim(_c)}"\nassert "strftime" not in __source__ and "weekday" not in __source__, "tarih fonksiyonu yerine Tarih boyutunu kullan"\nassert __source__.count("JOIN Tarih") + __source__.count("join Tarih") >= 2, "Tarih boyutu iki rolde (iki JOIN) kullanılmalı"\n',
      hints: [
        'JOIN Tarih siparis ON siparis.Tarih = s.Tarih ve JOIN Tarih teslim ON teslim.Tarih = s.TeslimTarihi',
        'INNER JOIN teslim tarihi boş olanları kendiliğinden dışarıda bırakır.',
        'SUM(CASE WHEN teslim.HaftaSonu = \'Evet\' THEN 1 ELSE 0 END) / COUNT(*)'
      ],
      why: 'Tek bir tarih boyutu sipariş, teslim, fatura gibi birçok rolde kullanılır; her rol ayrı bir takma adla bağlanır. Power BI\'da aynı durum bir etkin, diğerleri pasif ilişki ve USERELATIONSHIP ile çözülür.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'veri-modelleme-13',
      diff: 3,
      needs: ['duckdb'],
      q: '<p><code>anadolu_market</code>\'ten yıldız şema kur (DuckDB). <code>yildiz_kur(con)</code> yaz; CSV\'leri <code>veri.yol(...)</code> ile oku ve şu tabloları oluştur:</p><ul><li><code>dim_tarih</code>: siparişlerin en küçük ve en büyük tarihi arasındaki her gün (boşluksuz): <code>tarih_key</code> (YYYYMMDD int), <code>tarih</code>, <code>yil</code>, <code>ay</code>.</li><li><code>dim_urun</code>: <code>urun_key</code> (product_id sırasıyla 1\'den başlayan vekil anahtar), <code>product_id</code>, <code>urun</code>, <code>kategori</code>.</li><li><code>dim_musteri</code>: <code>musteri_key</code> (customer_id sırasıyla 1\'den), <code>customer_id</code>, <code>sehir</code> (boşsa <code>\'Bilinmiyor\'</code>), <code>segment</code>.</li><li><code>fact_satis</code> (tanecik: sipariş kalemi): <code>item_id</code>, <code>tarih_key</code>, <code>urun_key</code>, <code>musteri_key</code>, <code>durum</code>, <code>adet</code>, <code>net_tutar</code> = adet × birim fiyat × (1 − indirim), 2 basamak.</li></ul><p>Fonksiyon <code>{"fact": satır sayısı, "ciro": iptal (cancelled) hariç net tutar toplamı (2 basamak), "gun": dim_tarih satır sayısı, "bilinmeyen_sehir_cirosu": şehri Bilinmiyor olan müşterilerin iptal hariç cirosu}</code> döndürsün.</p>',
      start: 'import duckdb\nimport veri\n\n\ndef yildiz_kur(con):\n    for t in ["orders", "order_items", "products", "customers"]:\n        con.execute(f"CREATE TABLE {t} AS SELECT * FROM read_csv(\'{veri.yol(\'anadolu_market\', t)}\')")\n    # TODO: dim_tarih, dim_urun, dim_musteri, fact_satis\n    return {}\n\n\ncon = duckdb.connect()\nprint(yildiz_kur(con))\n',
      sol: 'import duckdb\nimport veri\n\n\ndef yildiz_kur(con):\n    for t in ["orders", "order_items", "products", "customers"]:\n        con.execute(f"CREATE TABLE {t} AS SELECT * FROM read_csv(\'{veri.yol(\'anadolu_market\', t)}\')")\n    con.execute("""\n        CREATE TABLE dim_tarih AS\n        SELECT CAST(strftime(g, \'%Y%m%d\') AS INTEGER) AS tarih_key, CAST(g AS DATE) AS tarih,\n               year(g) AS yil, month(g) AS ay\n        FROM (SELECT unnest(generate_series(MIN(order_date)::TIMESTAMP, MAX(order_date)::TIMESTAMP, INTERVAL 1 DAY)) AS g\n              FROM orders)\n    """)\n    con.execute("""\n        CREATE TABLE dim_urun AS\n        SELECT ROW_NUMBER() OVER (ORDER BY product_id) AS urun_key, product_id,\n               name AS urun, category AS kategori\n        FROM products\n    """)\n    con.execute("""\n        CREATE TABLE dim_musteri AS\n        SELECT ROW_NUMBER() OVER (ORDER BY customer_id) AS musteri_key, customer_id,\n               COALESCE(city, \'Bilinmiyor\') AS sehir, segment\n        FROM customers\n    """)\n    con.execute("""\n        CREATE TABLE fact_satis AS\n        SELECT i.item_id,\n               CAST(strftime(o.order_date, \'%Y%m%d\') AS INTEGER) AS tarih_key,\n               u.urun_key, m.musteri_key, o.status AS durum, i.quantity AS adet,\n               ROUND(i.quantity * i.unit_price * (1 - i.discount), 2) AS net_tutar\n        FROM order_items i\n        JOIN orders o      ON o.order_id = i.order_id\n        JOIN dim_urun u    ON u.product_id = i.product_id\n        JOIN dim_musteri m ON m.customer_id = o.customer_id\n    """)\n    q = lambda sql: con.execute(sql).fetchone()[0]\n    return {\n        "fact": q("SELECT COUNT(*) FROM fact_satis"),\n        "ciro": round(float(q("SELECT SUM(net_tutar) FROM fact_satis WHERE durum <> \'cancelled\'")), 2),\n        "gun": q("SELECT COUNT(*) FROM dim_tarih"),\n        "bilinmeyen_sehir_cirosu": round(float(q("""\n            SELECT COALESCE(SUM(f.net_tutar), 0) FROM fact_satis f JOIN dim_musteri m USING (musteri_key)\n            WHERE m.sehir = \'Bilinmiyor\' AND f.durum <> \'cancelled\'"""\n        )), 2),\n    }\n\n\ncon = duckdb.connect()\nprint(yildiz_kur(con))\n',
      tests: 'import duckdb as _d\n_c = _d.connect()\n_r = yildiz_kur(_c)\n_bek = _c.execute("""SELECT ROUND(SUM(i.quantity * i.unit_price * (1 - i.discount)), 2) FROM order_items i\n    JOIN orders o USING (order_id) WHERE o.status <> \'cancelled\'""").fetchone()[0]\nassert _r["fact"] == 1620, f"tanecik sipariş kalemi: 1620 satır olmalı, gelen {_r[\'fact\']}"\nassert abs(_r["ciro"] - float(_bek)) < 0.05, f"iptal hariç ciro yanlış: {_r[\'ciro\']} / {_bek}"\nassert _r["gun"] == 924, f"2022-06-22 ile 2024-12-31 arası 924 gün (boşluksuz), gelen {_r[\'gun\']}"\nassert _c.execute("SELECT COUNT(*) FROM fact_satis f LEFT JOIN dim_tarih t USING (tarih_key) WHERE t.tarih_key IS NULL").fetchone()[0] == 0, "her olgunun tarih_key\'i dim_tarih\'te olmalı"\nassert _c.execute("SELECT MIN(urun_key), MAX(urun_key), COUNT(DISTINCT urun_key) FROM dim_urun").fetchone() == (1, 40, 40), "urun_key 1..40"\nassert _c.execute("SELECT COUNT(*) FROM dim_musteri WHERE sehir = \'Bilinmiyor\'").fetchone()[0] == 7, "şehri boş 7 müşteri Bilinmiyor olmalı"\n_bs = _c.execute("""SELECT SUM(i.quantity * i.unit_price * (1 - i.discount)) FROM order_items i JOIN orders o USING (order_id)\n    JOIN customers c USING (customer_id) WHERE c.city IS NULL AND o.status <> \'cancelled\'""").fetchone()[0] or 0\nassert abs(_r["bilinmeyen_sehir_cirosu"] - float(_bs)) < 0.05, f"Bilinmiyor şehir cirosu yanlış: {_r[\'bilinmeyen_sehir_cirosu\']}"\n',
      hints: [
        'Vekil anahtar: ROW_NUMBER() OVER (ORDER BY product_id)',
        'Gün listesi: generate_series(MIN(order_date)::TIMESTAMP, MAX(order_date)::TIMESTAMP, INTERVAL 1 DAY) ve unnest; anahtar CAST(strftime(g, \'%Y%m%d\') AS INTEGER)',
        'Olguda doğal anahtarlarla boyutlara JOIN\'leyip vekil anahtarları seç.'
      ],
      why: 'Bu, ambar mühendisinin günlük işidir: tanecik seç, boyutları vekil anahtarla kur, olguyu boyutlara bağla, boşları "Bilinmiyor" yap ve sonucu kaynakla mutabakat et (satır sayısı ve ciro). PBIPatika\'daki kesit_bi modeli bu dönüşümün Power BI\'a yüklenmiş halidir.' }
  ],
  faq: [
    { q: 'Yıldız şema mı, tek geniş tablo (OBT) mı?',
      a: 'Önce yıldız: boyutlar tekrar kullanılabilir, SCD ve tutarlı boyutlar mümkün olur. Belirli bir panonun hızı veya basitliği için yıldızın üstüne OBT üretmek iyi bir sunum katmanıdır; tek kaynak olarak OBT ise bakımı zorlaştırır.' },
    { q: 'Her boyut SCD2 mi olmalı?',
      a: 'Hayır. Yalnız geçmişin doğru raporlanması gereken öznitelikler (bölge, segment, fiyat listesi) için. SCD2 boyutu büyütür ve sorguları karmaşıklaştırır; yazım düzeltmeleri gibi alanlar tip 1 kalmalıdır.' },
    { q: 'Power BI modeliyle bu dersin ilişkisi ne?',
      a: 'Power BI\'ın içindeki VertiPaq motoru yıldız şema için optimize edilmiştir. PBIPatika\'daki kesit_bi modeli; olgu tabloları (Satislar, Hedefler, StokGorunum) ve paylaşılan boyutlarla (Tarih, Urunler, Musteriler) kurulmuş bir yıldızdır. Burada tasarladığın modeli doğrudan Power BI\'a yükleyebilirsin.' },
    { q: 'Kar tanesi şema ne zaman mantıklı?',
      a: 'Çok büyük ve sık güncellenen alt hiyerarşiler (ör. on binlerce mağazayı paylaşan bölge/ülke tablosu) varsa ya da kaynak modeli ambar içinde ara katman olarak tutuyorsan. Raporlama katmanında genellikle düzleştirip yıldız yaparsın.' }
  ],
  mistakes: [
    { bad: 'SELECT SUM(s.kargo) FROM siparis s JOIN kalem k ON k.siparis_no = s.no',
      good: 'SELECT SUM(kargo) FROM siparis',
      why: 'Başlık düzeyindeki ölçü kalem düzeyine JOIN\'lenince her kalem için tekrar eder (fan-out). Ölçüyü kendi taneciğinde topla.' },
    { bad: 'SELECT yil, SUM(stok_adet) FROM stok_gorunum GROUP BY yil',
      good: 'SELECT yil, SUM(stok_adet) FROM stok_gorunum\nWHERE tarih IN (SELECT MAX(tarih) FROM stok_gorunum GROUP BY yil)\nGROUP BY yil',
      why: 'Stok ve bakiye zamanda toplanmaz (yarı toplanabilir). Dönem sonu değerini ya da ortalamayı al.' },
    { bad: 'eski["segment"] = yeni_segment  # SCD2 sanılıyor',
      good: 'eski["bitis"], eski["guncel"] = tarih, False\nboyut.append({...yeni sürüm...})',
      why: 'Eski satırın özniteliğini değiştirmek tip 1\'dir ve geçmişi yeniden yazar. SCD2\'de eski sürüm dondurulur, yalnız kapatılır.' },
    { bad: 'fact_satis.musteri_no  # doğal anahtarla bağlamak',
      good: 'fact_satis.musteri_key  # olay anındaki sürümün vekil anahtarı',
      why: 'SCD2 boyutunda doğal anahtar birden çok satıra karşılık gelir; JOIN satırları çoğaltır. Olgu, vekil anahtarla tek sürüme bağlanmalıdır.' }
  ]
});
})(window);
