/* PythonPatika — 'pandas-giris' dersi uzantısı: Ders veri setleri (gerçek veri setleri) */
// needs: pandas, sqlite3
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-giris',
    min: 20,
    needs: ['pandas', 'sqlite3'],
    html: `<h2>Derinleş: ders veri setleri (veri modülü)</h2><p>Şimdiye kadar tabloları elle, küçük sözlüklerden kurduk. Gerçek işte ise veri hazır gelir: binlerce satırlık sipariş dökümü, on binlerce banka hareketi. PythonPatika bunun için tarayıcıda hazır bekleyen ortak <b>veri setleri</b> sunar. Bunlar SQLPatika ve PBIPatika'da kullandığın kurgusal şirketlerin aynısıdır: Anadolu Market'te SQL ile yazdığın sorguyu burada pandas ile tekrar kurabilir, sonuçları karşılaştırabilirsin. Tüm veriler kurgusaldır; gerçek kişi ya da kuruma ait değildir.</p><h3>Hangi setler var?</h3><div class="tbl-wrap"><table><tr><th>Set</th><th>Konu</th><th>Öne çıkan tablolar</th></tr><tr><td><code>anadolu_market</code></td><td>E-ticaret</td><td>customers (150), orders (910), order_items (1.620), products, ab_test, raw_signups</td></tr><tr><td><code>anadolu_bank</code></td><td>Bankacılık</td><td>bank_customers (500), bank_accounts (849), bank_txns (~42 bin)</td></tr><tr><td><code>pusula_ik</code></td><td>İnsan kaynakları</td><td>çalışanlar, maaşlar, izinler, performans</td></tr><tr><td><code>lezzet_kurye</code></td><td>Yemek teslimat</td><td>lk_orders, lk_couriers, lk_ratings</td></tr><tr><td><code>kanat_havayollari</code></td><td>Havayolu</td><td>hv_flights, hv_delays, hv_bookings</td></tr><tr><td><code>pedal_izmir</code></td><td>Bisiklet paylaşımı</td><td>bk_trips (~117 bin), bk_stations, bk_weather</td></tr><tr><td><code>kesit_bi</code></td><td>Power BI yıldız şeması</td><td>Satislar, Urunler, Musteriler, Tarih, RFMSegmentleri</td></tr><tr><td><code>kirli_veri</code></td><td>Temizlik pratiği</td><td>bayi, hedef, urun, musteri (dağınık Excel çıktıları)</td></tr></table></div><p>Listeyi ve bir setin tablolarını kodla görmek için:</p><pre class="py">import veri

veri.liste()                        # tüm setler, tablo ve satır sayıları
veri.tablolar("anadolu_market")     # tablolar ve sütunları
print(veri.sutunlar("anadolu_market", "orders"))
</pre><div class="note"><b>Set adı kodda geçmeli</b>Tarayıcı yalnız kodunda adı geçen veri setini indirir. Set adını bir değişkende birleştirerek (ör. <code>"anadolu_" + "market"</code>) üretirsen dosya yüklenmez; adı her zaman açıkça yaz.</div><h3>Okumanın dört yolu</h3><div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th>Ne döndürür</th><th>Ne zaman</th></tr><tr><td><code>veri.oku(set, tablo, **kw)</code></td><td>pandas DataFrame</td><td>Analizin çoğu. Ek argümanlar <code>pd.read_csv</code>'ye geçer: <code>parse_dates</code>, <code>usecols</code>, <code>dtype</code>.</td></tr><tr><td><code>veri.kayitlar(set, tablo)</code></td><td><code>list[dict]</code>; sayılar int/float, boşlar <code>None</code></td><td>pandas gerekmeyen saf Python görevleri</td></tr><tr><td><code>veri.baglan(set, tablolar=[...])</code></td><td>Bellek içi <code>sqlite3</code> bağlantısı</td><td>SQL yazmak, SQLPatika sorgularını Python'dan çalıştırmak</td></tr><tr><td><code>veri.yol(set, tablo)</code></td><td>CSV dosyasının yolu</td><td><code>pd.read_csv</code>, <code>csv</code> modülü, polars ya da DuckDB ile kendin okumak</td></tr></table></div><pre class="py">import veri
import pandas as pd

siparis = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
print(siparis.shape)                          # (910, 5)
print(siparis["order_date"].min().date(), siparis["order_date"].max().date())
print(siparis["channel"].value_counts().to_dict())
</pre><p>CSV dosyalarında tarih metin olarak saklanır. <code>parse_dates</code> vermezsen <code>order_date</code> sütunu metin kalır ve <code>.dt</code> erişimcisi hata verir. Bu, gerçek veride en sık karşılaşacağın ilk hatadır.</p><pre class="py">import veri

hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")
kapali = [h for h in hesaplar if h["closed_date"] is not None]
print(len(hesaplar), "hesap,", len(kapali), "kapalı")
print(hesaplar[0]["account_type"], hesaplar[0]["credit_limit"])   # vadesiz None
</pre><h3>SQL ile pandas yan yana</h3><p><code>veri.baglan</code> seti bellekteki bir SQLite veritabanına yükler. SQLPatika'da yazdığın sorgu aynen çalışır; sonucu <code>pd.read_sql_query</code> ile DataFrame'e alıp pandas'la devam edebilirsin. Büyük setlerde (pedal_izmir, anadolu_bank) <code>tablolar=[...]</code> ile yalnız gereken tabloları yükle; hem bellek hem süre kazanırsın.</p><pre class="py">import veri
import pandas as pd

con = veri.baglan("anadolu_market", tablolar=["orders", "customers"])
sql = """
SELECT c.segment, COUNT(*) AS siparis
FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'delivered'
GROUP BY c.segment ORDER BY siparis DESC
"""
print(pd.read_sql_query(sql, con))
con.close()
</pre><div class="tip"><b>İki yoldan aynı sayıya ulaş</b>Bir rakamı raporlamadan önce onu iki farklı yoldan hesapla: bir kez SQL ile, bir kez pandas ile. İkisi tutuyorsa birleştirme (join) ya da filtre hatası yapmamışsındır. Analistlerin "mutabakat" (reconciliation) dediği alışkanlık budur.</div><div class="note"><b>Gerçek işte</b>Şirketlerde veri ya bir veri ambarından SQL ile gelir ya da paylaşılan klasördeki CSV/Excel dosyalarından. <code>veri</code> modülü bu iki yolu taklit eder: <code>baglan</code> ambarı, <code>oku</code> ve <code>yol</code> dosyayı. Kendi bilgisayarında aynı kodu <code>pd.read_csv("orders.csv")</code> ya da <code>sqlalchemy.create_engine(...)</code> ile çalıştırırsın; analiz kısmı değişmez.</div><p>Sonraki ileri veri derslerinde (temizlik, groupby, zaman serisi, görselleştirme, istatistik, kümeleme, NLP) bu setlerden gerçek tablolarla alıştırmalar bulacaksın.</p>`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: '<code>veri.oku("anadolu_market", "orders")</code> ile okunan tabloda <code>order_date</code> sütunu için hangisi doğrudur?',
        o: ['Otomatik olarak datetime türüne çevrilir, .dt hemen kullanılabilir', 'Metin gelir; .dt için parse_dates ya da pd.to_datetime gerekir', 'Tamsayı (Unix zaman damgası) olarak gelir', 'Sütun okunmaz, ayrıca yüklenmesi gerekir'],
        a: 1,
        why: 'CSV dosyasında tarih yalnızca metindir. pandas, sen <code>parse_dates=["order_date"]</code> demezsen onu metin bırakır; <code>.dt.year</code> gibi işlemler o zaman hata verir.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Gerçek Anadolu Market sipariş tablosu okunuyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\ndf = veri.oku("anadolu_market", "orders")\nprint(df.shape)\nprint(df["status"].nunique())\n',
        o: ['(910, 5)\n4', '(5, 910)\n4', '(910, 5)\n910', '(911, 5)\n4'],
        a: 0,
        why: 'shape (satır, sütun) verir: 910 sipariş, 5 sütun. Başlık satırı veri sayılmaz. status sütununda dört farklı değer var: delivered, shipped, cancelled, returned.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'pandas\'sız okuma. Bu kod ne yazdırır?',
        code: 'import veri\nhesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")\nilk = hesaplar[0]\nprint(type(hesaplar).__name__, len(hesaplar))\nprint(ilk["account_id"] + 1, ilk["closed_date"])\n',
        o: ['list 849\n100002 None', 'DataFrame 849\n100002 NaN', 'list 849\n100002 ', 'list 850\n100002 None'],
        a: 0,
        why: 'kayitlar sözlük listesi döndürür ve sayıları int/float\'a çevirir; bu yüzden account_id + 1 çalışır. Boş hücreler None olur (pandas\'taki NaN değil).'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Anadolu Market\'i SQLite\'a yükleyip en çok sipariş gelen kanalı yazdıran programın satırlarını sırala.</p>',
        needs: ['sqlite3'],
        lines: ['import veri', 'con = veri.baglan("anadolu_market", tablolar=["orders"])', 'imlec = con.execute("SELECT channel, COUNT(*) AS n FROM orders GROUP BY channel ORDER BY n DESC")', 'ilk = imlec.fetchone()', 'print(ilk)', 'con.close()'],
        expect: '(\'mobile\', 409)\n',
        hint: 'Bağlantı olmadan sorgu, sorgu olmadan satır olmaz; kapatma en sonda.',
        why: 'baglan bağlantıyı döndürür, execute imleci, fetchone ilk satırı. Sorgu azalan sıralandığı için ilk satır en kalabalık kanal: mobile, 409 sipariş.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v1',
        stage: 'Rehberli',
        diff: 1,
        needs: ['pandas'],
        q: '<p><code>durum_sayilari()</code> fonksiyonu <code>anadolu_market</code> setindeki <code>orders</code> tablosunu okuyup her <code>status</code> değerinin sipariş sayısını <b>çoktan aza</b> sıralı bir sözlük olarak döndürsün (değerler Python <code>int</code>).</p>',
        guide: ['veri.oku ile orders tablosunu oku.', 'status sütununda value_counts() çağır (zaten çoktan aza sıralar).', 'Sonucu sözlüğe çevir; değerleri int() ile Python tamsayısı yap.'],
        example: 'import veri\nmusteri = veri.oku("anadolu_market", "customers")\nprint(musteri["segment"].value_counts().to_dict())\n',
        start: 'import veri\n\ndef durum_sayilari():\n    df = veri.oku("anadolu_market", "orders")\n    # TODO: status sütununun değer sayımlarını sözlük olarak döndür\n    return {}\n',
        sol: 'import veri\n\ndef durum_sayilari():\n    df = veri.oku("anadolu_market", "orders")\n    sayim = df["status"].value_counts()\n    return {k: int(v) for k, v in sayim.items()}\n',
        tests: 'd = durum_sayilari()\nassert isinstance(d, dict), "Sözlük döndürmelisin"\nassert d == {"delivered": 712, "cancelled": 72, "shipped": 70, "returned": 56}, f"Sayımlar beklenenden farklı: {d}"\nassert list(d)[0] == "delivered", "İlk anahtar en sık durum (delivered) olmalı"\nassert sum(d.values()) == 910, "Toplam 910 sipariş olmalı"\n',
        hints: ['Tek sütunun frekansı için value_counts kullanılır.', 'df["status"].value_counts() bir Series döndürür; .items() ile gezilebilir.', 'return {k: int(v) for k, v in df["status"].value_counts().items()}'],
        why: 'value_counts sıklığa göre azalan sıralı Series verir; sözlük ekleme sırasını koruduğu için sıra da korunur.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>yillik_siparis()</code> fonksiyonu <code>orders</code> tablosunu <code>order_date</code> sütunu tarih olacak şekilde okusun ve <code>{yıl: sipariş_sayısı}</code> sözlüğünü yıla göre artan sırada döndürsün (anahtar ve değerler <code>int</code>).</p>',
        guide: ['veri.oku çağrısına parse_dates=["order_date"] ekle.', 'Yılı df["order_date"].dt.year ile al.', 'Yıla göre grupla ve size() ile say.', 'Sözlüğe çevirirken anahtar ve değeri int() yap.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"tarih": pd.to_datetime(["2024-01-05", "2024-02-11", "2025-01-02"])})\nprint(df.groupby(df["tarih"].dt.year).size().to_dict())\n',
        start: 'import veri\n\ndef yillik_siparis():\n    df = veri.oku("anadolu_market", "orders")   # TODO: tarih sütununu datetime oku\n    # TODO: yıla göre say\n    return {}\n',
        sol: 'import veri\n\ndef yillik_siparis():\n    df = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    sayim = df.groupby(df["order_date"].dt.year).size()\n    return {int(y): int(n) for y, n in sayim.items()}\n',
        tests: 'd = yillik_siparis()\nassert d == {2022: 64, 2023: 309, 2024: 537}, f"Yıllık sayımlar farklı: {d}"\nassert list(d) == [2022, 2023, 2024], "Yıllar artan sırada olmalı"\n',
        hints: ['Tarihin parçası için önce sütun datetime olmalı.', 'parse_dates ve .dt.year birlikte kullanılır.', 'df.groupby(df["order_date"].dt.year).size()'],
        why: 'Veri 2022 ortasında başlıyor, bu yüzden 2022\'de az sipariş var. groupby anahtarları sıralı döndürür.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>eksik_rapor(set_adi, tablo)</code> fonksiyonu verilen tabloyu <code>veri.oku</code> ile okusun ve yalnızca <b>eksik değeri olan</b> sütunlar için <code>{sütun: eksik_sayısı}</code> sözlüğü döndürsün (değerler <code>int</code>, tablodaki sütun sırasıyla). Testler <code>anadolu_market/customers</code> ve <code>anadolu_bank/bank_accounts</code> tablolarıyla çağırır.</p>',
        start: 'import veri\n\ndef eksik_rapor(set_adi, tablo):\n    pass\n\nprint(eksik_rapor("anadolu_market", "customers"))\n',
        sol: 'import veri\n\ndef eksik_rapor(set_adi, tablo):\n    df = veri.oku(set_adi, tablo)\n    eksik = df.isna().sum()\n    return {k: int(v) for k, v in eksik.items() if v > 0}\n\nprint(eksik_rapor("anadolu_market", "customers"))\nprint(eksik_rapor("anadolu_bank", "bank_accounts"))\n',
        tests: 'assert eksik_rapor("anadolu_market", "customers") == {"city": 7, "email": 11}, "customers tablosunda city 7, email 11 eksik olmalı"\nr = eksik_rapor("anadolu_bank", "bank_accounts")\nassert r == {"closed_date": 806, "credit_limit": 637}, f"bank_accounts için beklenmeyen sonuç: {r}"\nassert all(type(v) is int for v in r.values()), "Değerler Python int olmalı"\n',
        hints: ['isna() her hücre için True/False verir; sum() sütun başına True sayar.', 'Sözlük kurarken yalnızca 0\'dan büyükleri al.'],
        why: 'bank_accounts\'ta closed_date açık hesaplarda, credit_limit kredi kartı dışındaki hesaplarda boştur. Bu eksiklik hata değil, anlamlıdır: yorumlarken sütun açıklamasına (manifest) bak.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p><code>en_kalabalik_sehirler(n)</code> fonksiyonu <code>veri.baglan("anadolu_market")</code> ile bağlanıp SQL ile şehri boş olmayan müşterileri şehre göre saysın; en kalabalık <code>n</code> şehri <code>[(şehir, sayı), ...]</code> listesi olarak döndürsün. Eşitlikte şehir adına göre alfabetik sırala. Bağlantıyı kapatmayı unutma.</p>',
        start: 'import veri\n\ndef en_kalabalik_sehirler(n):\n    pass\n',
        sol: 'import veri\n\ndef en_kalabalik_sehirler(n):\n    con = veri.baglan("anadolu_market", tablolar=["customers"])\n    try:\n        return con.execute(\n            "SELECT city, COUNT(*) AS adet FROM customers "\n            "WHERE city IS NOT NULL GROUP BY city "\n            "ORDER BY adet DESC, city LIMIT ?", (n,)\n        ).fetchall()\n    finally:\n        con.close()\n',
        tests: 'r = en_kalabalik_sehirler(3)\nassert r == [("İstanbul", 28), ("Eskişehir", 17), ("İzmir", 16)], f"İlk üç şehir farklı: {r}"\nassert en_kalabalik_sehirler(4)[-1] == ("Ankara", 15), "4. şehir Ankara (15) olmalı"\nassert all(s is not None for s, _ in en_kalabalik_sehirler(20)), "Boş şehirler (NULL) sayılmamalı"\n',
        hints: ['WHERE city IS NOT NULL ile boşları ele; = NULL çalışmaz.', 'LIMIT değerini ? parametresiyle ver.', 'ORDER BY adet DESC, city'],
        why: 'SQL\'de NULL karşılaştırması IS NULL / IS NOT NULL ile yapılır. LIMIT parametreli verilince sorgu güvenli kalır.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>aylik_2024()</code> 2024 yılındaki siparişleri ay ay sayıp <code>{ay_no: adet}</code> döndürmeli. Ama çalıştırınca <code>AttributeError: Can only use .dt accessor with datetimelike values</code> veriyor.</p>',
        start: 'import veri\n\ndef aylik_2024():\n    df = veri.oku("anadolu_market", "orders")\n    df = df[df["order_date"].dt.year == 2024]\n    sayim = df.groupby(df["order_date"].dt.month).size()\n    return {int(a): int(n) for a, n in sayim.items()}\n',
        sol: 'import veri\n\ndef aylik_2024():\n    df = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    df = df[df["order_date"].dt.year == 2024]\n    sayim = df.groupby(df["order_date"].dt.month).size()\n    return {int(a): int(n) for a, n in sayim.items()}\n',
        tests: 'd = aylik_2024()\nassert d == {1: 44, 2: 34, 3: 41, 4: 29, 5: 41, 6: 43, 7: 37, 8: 46, 9: 43, 10: 55, 11: 62, 12: 62}, f"Aylık sayımlar farklı: {d}"\nassert sum(d.values()) == 537, "2024\'te 537 sipariş var"\n',
        hints: ['CSV\'den okunan tarih sütununun türü nedir?', 'Okurken parse_dates=["order_date"] ver ya da pd.to_datetime ile çevir.'],
        why: 'CSV\'de tarih metindir; .dt yalnızca datetime sütunlarda çalışır. Okurken parse_dates vermek en temiz çözümdür.'
      },
      {
        t: 'code',
        id: 'pandas-giris-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'sqlite3'],
        q: '<p>Mutabakat görevi. <code>kategori_ciro_sql()</code> <code>veri.baglan</code> ve SQL ile, <code>kategori_ciro_pd()</code> <code>veri.oku</code> ve pandas <code>merge</code> ile aynı soruyu cevaplasın: <b>teslim edilmiş</b> (<code>status = "delivered"</code>) siparişlerde kategori başına ciro. Ciro = <code>quantity * unit_price * (1 - discount)</code>. İkisi de <code>{kategori: ciro}</code> sözlüğü döndürsün (2 basamağa yuvarlı <code>float</code>, ciroya göre azalan).</p>',
        start: 'import veri\nimport pandas as pd\n\ndef kategori_ciro_sql():\n    pass\n\ndef kategori_ciro_pd():\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef kategori_ciro_sql():\n    con = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "products"])\n    sql = """\n    SELECT p.category, SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS ciro\n    FROM order_items oi\n    JOIN orders o ON o.order_id = oi.order_id\n    JOIN products p ON p.product_id = oi.product_id\n    WHERE o.status = \'delivered\'\n    GROUP BY p.category ORDER BY ciro DESC\n    """\n    satirlar = con.execute(sql).fetchall()\n    con.close()\n    return {k: round(v, 2) for k, v in satirlar}\n\ndef kategori_ciro_pd():\n    oi = veri.oku("anadolu_market", "order_items")\n    o = veri.oku("anadolu_market", "orders")\n    p = veri.oku("anadolu_market", "products")\n    d = oi.merge(o, on="order_id").merge(p, on="product_id")\n    d = d[d["status"] == "delivered"]\n    ciro = (d["quantity"] * d["unit_price"] * (1 - d["discount"])).groupby(d["category"]).sum()\n    ciro = ciro.sort_values(ascending=False)\n    return {k: round(float(v), 2) for k, v in ciro.items()}\n',
        tests: 'beklenen = {"Elektronik": 286705.5, "Ev & Yaşam": 202513.7, "Spor": 165322.4, "Giyim": 156494.35, "Kitap": 127512.8, "Kozmetik": 106722.25, "Hediye": 14945.0}\na = kategori_ciro_sql()\nb = kategori_ciro_pd()\nassert a == beklenen, f"SQL sonucu farklı: {a}"\nassert b == beklenen, f"pandas sonucu farklı: {b}"\nassert list(b) == list(beklenen), "Sıra ciroya göre azalan olmalı"\nassert round(sum(b.values()), 2) == 1060216.0, "Toplam teslim edilmiş ciro 1.060.216 TL olmalı"\n',
        hints: ['Üç tablo gerekir: order_items (tutar), orders (status), products (category).', 'SQL\'de iki JOIN, pandas\'ta iki merge; filtreyi birleştirmeden sonra uygula.', 'İki sonucu yan yana yazdırıp karşılaştır; tutmuyorsa hangi filtreyi unuttuğuna bak.'],
        why: 'İki bağımsız yol aynı sayıyı verdiğinde birleştirme ve filtre mantığına güvenebilirsin. Elektronik, teslim edilmiş cironun yaklaşık %27\'sini getiriyor.'
      }
    ],
    faq: [
      {
        q: 'veri modülünü kendi bilgisayarımda nasıl kullanırım?',
        a: 'Modül yalnızca PythonPatika içindedir. Kendi bilgisayarında aynı tabloları CSV olarak indirip <code>pd.read_csv("orders.csv")</code> ile okursun; kodun geri kalanı değişmez. SQLite için <code>df.to_sql("orders", con)</code> ile tabloyu bir bağlantıya yazabilirsin.'
      },
      {
        q: 'Büyük tabloları (bk_trips, bank_txns) okumak yavaş, ne yapmalıyım?',
        a: 'Yalnızca gereken sütunları <code>veri.oku(..., usecols=[...])</code> ile oku; SQL kullanıyorsan <code>veri.baglan(set, tablolar=["bk_trips"])</code> ile yalnızca o tabloyu yükle. Aynı tabloyu bir hücrede bir kez okuyup değişkende tut, her fonksiyonda yeniden okuma.'
      }
    ],
    mistakes: [
      {
        bad: 'import veri\nadi = "anadolu_" + "market"\ndf = veri.oku(adi, "orders")',
        good: 'import veri\ndf = veri.oku("anadolu_market", "orders")',
        why: 'Tarayıcı yalnızca kodda adı açıkça geçen veri setini indirir; birleştirilmiş adı tanıyamaz.'
      }
    ]
  }
);
})(window);
