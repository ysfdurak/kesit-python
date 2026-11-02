/* Kesit Python — 'pandas-giris' dersi uzantısı (Derinleş) */
// needs: pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-giris',
    min: 30,
    needs: ['pandas'],
    html: `<h2>Derinleş: kurulum, sürümler ve veriyi doğru okumak</h2><p>Gerçek işte pandas'la geçen zamanın büyük kısmı hesap değil, <b>veriyi doğru okumaktır</b>. Türkiye'de Excel'den alınmış bir CSV'de ayraç noktalı virgüldür, ondalık virgüldür, binlik nokta; posta kodunun baştaki sıfırı kaybolur, tarih gün.ay.yıl yazılır, Türkçe karakterler bozulur. Bu bölümde kurulumdan başlayıp <code>read_csv</code>'nin bu sorunları çözen parametrelerini, ardından Excel, JSON ve SQL kaynaklarını görüyoruz.</p><h3>Kurulum ve sürüm</h3><pre class="code"># Sanal ortam etkinken (Windows, macOS, Linux aynı)
python -m pip install pandas            # numpy da birlikte gelir
python -m pip install "pandas[excel]"   # read_excel/to_excel için openpyxl vb.
python -m pip install pyarrow           # hızlı okuma, parquet, string türü
python -c "import pandas as pd; print(pd.__version__)"

# requirements.txt ile sabitleme
pandas&gt;=2.2,&lt;4
</pre><p>Tarayıcıdaki motorda pandas 2.2, güncel bilgisayarlarda çoğunlukla 3.x bulunur. Bu dersteki kodlar iki sürümde de aynı sonucu verir. Hangi sürümle çalıştığını ve hangi yardımcı paketlerin kurulu olduğunu kodla da görebilirsin:</p><pre class="py">import pandas as pd

print(pd.__version__)
ana, kucuk = (int(x) for x in pd.__version__.split(".")[:2])
print("3.x mi?", ana &gt;= 3)
# pd.show_versions()  # tüm bağımlılıkların raporu (hata bildirirken eklenir)
</pre><div class="tbl-wrap"><table><tr><th>Konu</th><th>pandas 2.2</th><th>pandas 3.x</th><th>İki sürümde güvenli yazım</th></tr><tr><td>Kopyalama</td><td>Copy-on-Write isteğe bağlı, zincirleme atama bazen çalışır</td><td>Copy-on-Write her zaman açık; zincirleme atama asıl tabloyu değiştirmez</td><td><code>df.loc[maske, "s"] = x</code></td></tr><tr><td>Metin sütunu türü</td><td><code>object</code></td><td>varsayılan <code>str</code> (string türü)</td><td><code>pd.api.types.is_string_dtype(s)</code> ile kontrol et, <code>== object</code> yazma</td></tr><tr><td>Aylık sıklık</td><td><code>"M"</code> uyarı verir</td><td><code>"M"</code> kaldırıldı</td><td><code>"ME"</code> (ay sonu), <code>"MS"</code> (ay başı)</td></tr><tr><td>JSON metni okuma</td><td>Ham metin uyarı verir</td><td>Ham metin hata verir</td><td><code>pd.read_json(io.StringIO(metin))</code></td></tr></table></div><h3>read_csv: Türkiye'deki CSV'yi okumak</h3><p>Excel Türkçe bölge ayarıyla CSV kaydettiğinde ayraç <code>;</code> olur, çünkü virgül ondalık işaretidir. Aşağıdaki parametreler en sık ihtiyaç duyacağın setir:</p><div class="tbl-wrap"><table><tr><th>Parametre</th><th>Ne yapar</th><th>Örnek</th></tr><tr><td><code>sep</code></td><td>Sütun ayracı</td><td><code>sep=";"</code>, sekme için <code>sep="\\t"</code></td></tr><tr><td><code>decimal</code></td><td>Ondalık işareti</td><td><code>decimal=","</code> → "12,5" = 12.5</td></tr><tr><td><code>thousands</code></td><td>Binlik ayırıcı</td><td><code>thousands="."</code> → "1.250" = 1250</td></tr><tr><td><code>encoding</code></td><td>Karakter kodlaması</td><td><code>"utf-8"</code>, <code>"utf-8-sig"</code>, <code>"cp1254"</code></td></tr><tr><td><code>parse_dates</code> + <code>date_format</code></td><td>Tarih sütunlarını datetime yapar</td><td><code>parse_dates=["tarih"], date_format="%d.%m.%Y"</code></td></tr><tr><td><code>dtype</code></td><td>Sütun türünü zorlar</td><td><code>dtype={"posta_kodu": str}</code> baştaki sıfırı korur</td></tr><tr><td><code>usecols</code></td><td>Yalnız gereken sütunlar</td><td><code>usecols=["musteri", "tutar"]</code></td></tr><tr><td><code>na_values</code></td><td>Eksik sayılacak ek değerler</td><td><code>na_values=["-", "yok"]</code></td></tr><tr><td><code>nrows</code>, <code>skiprows</code></td><td>İlk n satırı oku / baştaki satırları atla</td><td><code>skiprows=2</code> (rapor başlığı varsa)</td></tr><tr><td><code>index_col</code></td><td>Bir sütunu index yapar</td><td><code>index_col="siparis_id"</code></td></tr><tr><td><code>chunksize</code></td><td>Parça parça okur (büyük dosya)</td><td><code>for parca in pd.read_csv(f, chunksize=100_000)</code></td></tr></table></div><pre class="py">import io
import pandas as pd

excel_csv = """siparis_id;musteri_no;sehir;tutar;tarih
1001;00412;İstanbul;1.250,50;03.04.2024
1002;07730;Ankara;89,90;05.04.2024
1003;00412;İzmir;-;12.04.2024
"""
df = pd.read_csv(
    io.StringIO(excel_csv),
    sep=";", decimal=",", thousands=".",
    dtype={"musteri_no": str},          # 00412 sıfırıyla kalsın
    na_values=["-"],                    # "-" eksik değer
    parse_dates=["tarih"], date_format="%d.%m.%Y",
)
print(df)
print(df["tutar"].sum())                # 1340.4
print(df["tarih"].dt.month.tolist())    # [4, 4, 4]
print(df["musteri_no"].tolist())
</pre><div class="warn"><b>Gün mü ay mı?</b>"03.04.2024" biçim verilmezse ay.gün sırasıyla okunup 3 Nisan yerine 4 Mart olabilir ve hiçbir hata almazsın. Türkiye tarihlerinde her zaman <code>date_format="%d.%m.%Y"</code> (ya da <code>pd.to_datetime(..., format="%d.%m.%Y")</code>) ver.</div><h3>Kirli başlık ve bozuk satırlar</h3><p>ERP raporları çoğu zaman birkaç satırlık başlıkla ("Anadolu Market - Mart Raporu") başlar, sonunda "Toplam" satırı olur, arada da fazla ayraç içeren bozuk satırlar bulunur. <code>skiprows</code> baştaki satırları, <code>skipfooter</code> (yalnızca <code>engine="python"</code> ile) sondakileri atlar; <code>on_bad_lines="skip"</code> sütun sayısı uymayan satırları atlar, <code>"warn"</code> atlarken uyarı da yazar. Atlanan satırları sessizce kaybetmek yerine sayısını raporlamak iyi bir alışkanlıktır.</p><pre class="py">import io
import pandas as pd

rapor = """Anadolu Market - Mart Raporu
Oluşturma: 01.04.2024
id,sehir,tutar
1,Bursa,450
2,Ankara,120,FAZLA
3,İzmir,300
Toplam,,870
"""
df = pd.read_csv(io.StringIO(rapor), skiprows=2, skipfooter=1,
                 engine="python", on_bad_lines="skip", index_col="id")
print(df)
print(len(df), "satır okundu")
</pre><p>Okuduktan sonra mutlaka şu üç kontrolü yap: <code>df.shape</code> (satır sayısı beklenenle aynı mı?), <code>df.dtypes</code> (tutar sayı, tarih datetime mı?) ve <code>df.isna().sum()</code> (beklenmedik eksik var mı?). Büyük dosyalarda <code>engine="pyarrow"</code> (pyarrow kuruluysa) okumayı belirgin hızlandırır ama <code>skipfooter</code> gibi bazı parametreleri desteklemez.</p><h3>Kodlama (encoding) sorunları</h3><p>Eski sistemlerden ve Türkçe Windows'tan gelen dosyalar çoğunlukla <code>cp1254</code> (Windows-1254) kodlamasındadır; UTF-8 sanılarak okunursa <code>UnicodeDecodeError</code> alırsın ya da "ÅŸ" gibi bozuk harfler görürsün. Excel'in Türkçe karakterleri doğru göstermesi için yazarken <code>utf-8-sig</code> (başında BOM işareti olan UTF-8) kullanılır.</p><pre class="py">import pandas as pd

with open("eski_sistem.csv", "w", encoding="cp1254") as f:
    f.write("sehir;ciro\\nŞanlıurfa;1200\\nÇorum;800\\n")

try:
    pd.read_csv("eski_sistem.csv", sep=";")           # utf-8 varsayılır
except UnicodeDecodeError as e:
    print("Hata:", type(e).__name__)

df = pd.read_csv("eski_sistem.csv", sep=";", encoding="cp1254")
print(df["sehir"].tolist())

# Excel'de Türkçe açılsın: ; ayraç, virgül ondalık, BOM'lu UTF-8
df["ciro"] = df["ciro"] / 3
df.to_csv("rapor.csv", sep=";", decimal=",", encoding="utf-8-sig", index=False, float_format="%.2f")
print(open("rapor.csv", encoding="utf-8-sig").read())
</pre><h3>Excel, JSON ve SQL kaynakları</h3><p><code>read_excel</code> için <code>openpyxl</code> paketi gerekir; tarayıcıda çalışmaz, kendi bilgisayarında dene:</p><pre class="code"># python -m pip install openpyxl
import pandas as pd

df = pd.read_excel("satislar.xlsx", sheet_name="Mart", skiprows=2,
                   usecols="A:E", dtype={"musteri_no": str})
tum = pd.read_excel("satislar.xlsx", sheet_name=None)   # {sayfa_adı: DataFrame}
df.to_excel("ozet.xlsx", index=False, sheet_name="Özet")
</pre><p>API'lerden gelen JSON çoğunlukla kayıt listesidir; iç içe alanlar için <code>pd.json_normalize</code> sütunları <code>musteri.sehir</code> gibi düzleştirir. Veritabanı için <code>pd.read_sql(sorgu, baglanti, params=...)</code> sorgu sonucunu doğrudan DataFrame yapar; kullanıcıdan gelen değeri sorguya f-string ile değil <code>params</code> ile ver (SQL enjeksiyonu).</p><pre class="py">import io, json, sqlite3
import pandas as pd

api = '[{"id": 1, "tutar": 450.0, "musteri": {"ad": "Ayşe", "sehir": "Bursa"}},' \\
      ' {"id": 2, "tutar": 120.5, "musteri": {"ad": "Ali", "sehir": "Ankara"}}]'
print(pd.read_json(io.StringIO(api)).columns.tolist())
duz = pd.json_normalize(json.loads(api))
print(duz.columns.tolist())

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE siparis (id INTEGER, sehir TEXT, tutar REAL)")
con.executemany("INSERT INTO siparis VALUES (?, ?, ?)",
                [(1, "Bursa", 450.0), (2, "Ankara", 120.5), (3, "Bursa", 80.0)])
q = "SELECT sehir, SUM(tutar) AS ciro FROM siparis WHERE tutar &gt;= ? GROUP BY sehir"
print(pd.read_sql(q, con, params=(100,)))
con.close()
</pre><div class="tip"><b>Okuma fonksiyonu yaz</b>Aynı kaynaktan her ay veri alıyorsan tüm parametreleri tek bir <code>oku_siparis(yol)</code> fonksiyonunda topla ve sonunda <code>assert</code> ile beklenen sütunları, türleri kontrol et. Kaynağın biçimi değiştiğinde hata raporu üretmeden önce yakalanır.</div><div class="note"><b>Gerçek işte</b>Muhasebe, ERP ve banka ekstrelerinden alınan CSV dosyalarında en sık üç hata çıkar: tutarların metin kalması (decimal/thousands verilmemiş), müşteri ya da vergi numarasının baştaki sıfırı kaybetmesi (dtype=str verilmemiş) ve tarihlerde gün-ay karışması. Bir dosyayı okuduktan hemen sonra <code>df.info()</code> çıktısında tutarın float, tarihin datetime olduğunu görmeden analize geçme.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        needs: ['pandas'],
        q: 'Excel\'den Türkçe ayarlarla dışa aktarılmış bir dosyada satırlar şöyle: <code>1001;İzmir;1.250,50</code>. Tutarı sayı olarak doğru okuyan çağrı hangisi?',
        o: ['<code>pd.read_csv(f, encoding="utf-8-sig")</code>', '<code>pd.read_csv(f, sep=";", decimal=",", thousands=".")</code>', '<code>pd.read_csv(f, sep=";", decimal=".", thousands=",")</code>', '<code>pd.read_csv(f, sep=",", decimal=",", dtype=float)</code>'],
        a: 1,
        why: 'Ayraç noktalı virgül, ondalık virgül, binlik nokta: üçü birlikte verilmezse 1.250,50 metin olarak kalır ya da yanlış sayıya dönüşür.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Ayraç belirtilmeden noktalı virgüllü bir dosya okunuyor. Ne yazdırır?',
        code: 'import io\nimport pandas as pd\nmetin = "sehir;ciro\\nBursa;100\\nAnkara;250\\n"\ndf = pd.read_csv(io.StringIO(metin))\nprint(df.shape)\n',
        o: ['(2, 2)', '(2, 1)', '(3, 2)', 'ParserError hatası verir'],
        a: 1,
        why: 'Varsayılan ayraç virgüldür; satırlarda virgül olmadığı için her satır tek bir sütun ("sehir;ciro") olarak okunur: 2 satır, 1 sütun. Hata vermemesi bu sorunu sinsi yapar; okuduktan sonra shape ve columns\'a bak.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Bu kod ne yazdırır?',
        code: 'import io\nimport pandas as pd\nmetin = "posta_kodu;sehir\\n06100;Ankara\\n35210;İzmir\\n"\ndf = pd.read_csv(io.StringIO(metin), sep=";")\nprint(df["posta_kodu"].tolist())\n',
        o: ['[\'06100\', \'35210\']', '[6100, 35210]', '[06100, 35210]', '[\'6100\', \'35210\']'],
        a: 1,
        why: 'pandas sütunun tamamı sayıya benzediği için int64 yapar ve baştaki sıfır kaybolur. Posta kodu, müşteri numarası, IBAN gibi kimlikleri dtype={"posta_kodu": str} ile okumalısın.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Türkçe biçimli tutarlar okunuyor. Ne yazdırır?',
        code: 'import io\nimport pandas as pd\nmetin = "urun;tutar\\nKahve;1.234,50\\nÇay;250,00\\n"\ndf = pd.read_csv(io.StringIO(metin), sep=";", decimal=",", thousands=".")\nprint(df["tutar"].sum())\n',
        o: ['1484.5', '1234.5250.0', '1.48450', '251.2345'],
        a: 0,
        why: 'thousands="." binlik noktasını atar, decimal="," virgülü ondalık nokta yapar: 1234.5 + 250.0 = 1484.5. Parametreler verilmeseydi sütun metin kalır ve sum metinleri birleştirirdi.' },
      { t: 'order',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: '<p>Bellekte bir SQLite tablosu kurup sorgu sonucunu DataFrame olarak okuyan programın satırlarını sırala.</p>',
        lines: ['import sqlite3, pandas as pd', 'con = sqlite3.connect(":memory:")', 'con.execute("CREATE TABLE s (sehir TEXT, tutar REAL)")', 'con.executemany("INSERT INTO s VALUES (?, ?)", [("Bursa", 40.0), ("Bursa", 60.0)])', 'df = pd.read_sql("SELECT sehir, SUM(tutar) AS ciro FROM s GROUP BY sehir", con)', 'print(df["ciro"].tolist())'],
        expect: '[100.0]\n',
        hint: 'Bağlantı → tablo → veri → sorgu → yazdır.',
        why: 'read_sql bir bağlantı ve SQL sorgusu alır; tablo ve veri sorgudan önce hazır olmalıdır.' },
      { t: 'code',
        id: 'pandas-giris-x1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Muhasebeden gelen Excel CSV\'sini okuyan <code>tr_csv_oku(metin)</code> fonksiyonunu yaz. Biçim: ayraç <code>;</code>, ondalık <code>,</code>, binlik <code>.</code>, tarih <code>gg.aa.yyyy</code>. Fonksiyon DataFrame döndürsün; <code>tutar</code> float, <code>tarih</code> datetime olsun.</p>',
        guide: ['Metni io.StringIO ile dosya gibi ver.', 'sep, decimal ve thousands parametrelerini ekle.', 'parse_dates=["tarih"] ve date_format="%d.%m.%Y" ile tarihi çöz.', 'DataFrame\'i döndür.'],
        example: 'import io\nimport pandas as pd\nmetin = "a|b\\n1|2,5\\n"\nprint(pd.read_csv(io.StringIO(metin), sep="|", decimal=","))\n',
        start: 'import io\nimport pandas as pd\n\ndef tr_csv_oku(metin):\n    # TODO: sep, decimal, thousands\n    # TODO: parse_dates ve date_format\n    return pd.read_csv(io.StringIO(metin))\n',
        sol: 'import io\nimport pandas as pd\n\ndef tr_csv_oku(metin):\n    return pd.read_csv(io.StringIO(metin), sep=";", decimal=",", thousands=".",\n                       parse_dates=["tarih"], date_format="%d.%m.%Y")\n',
        tests: 'import pandas as pd\nm = "fis;tutar;tarih\\n1;1.250,50;03.04.2024\\n2;89,90;15.04.2024\\n"\ndf = tr_csv_oku(m)\nassert list(df.columns) == ["fis", "tutar", "tarih"], f"Sütunlar ayrılmamış: {list(df.columns)} (sep)"\nassert pd.api.types.is_float_dtype(df["tutar"]), "tutar float olmalı (decimal ve thousands)"\nassert abs(df["tutar"].sum() - 1340.4) < 1e-6, "1250.50 + 89.90 = 1340.40"\nassert pd.api.types.is_datetime64_any_dtype(df["tarih"]), "tarih datetime olmalı"\nassert df["tarih"].dt.month.tolist() == [4, 4], "03.04.2024 Nisan ayıdır: gün.ay.yıl biçimi"\n',
        hints: ['read_csv\'ye sep=";", decimal=",", thousands="." ver.', 'Tarih için parse_dates=["tarih"] ve date_format="%d.%m.%Y".'],
        why: 'Yerel biçimli CSV\'yi doğru okumak dört parametreye bağlıdır; okuma anında doğru tür vermek sonradan str.replace zinciriyle uğraşmaktan hem hızlı hem güvenlidir.' },
      { t: 'code',
        id: 'pandas-giris-x2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Sipariş API\'si iç içe JSON döndürüyor. <code>api_tablosu(json_metni)</code> fonksiyonu metni <code>json.loads</code> ile çözüp <code>pd.json_normalize</code> ile düzleştirsin, sütunları <code>id, tutar, ad, sehir</code> olarak yeniden adlandırıp bu sırayla döndürsün.</p>',
        guide: ['json.loads ile metni Python listesine çevir.', 'pd.json_normalize iç içe alanları "musteri.ad" gibi sütunlara açar.', 'rename(columns={...}) ile "musteri.ad" → "ad", "musteri.sehir" → "sehir".', 'df[["id", "tutar", "ad", "sehir"]] ile sırayı sabitle.'],
        example: 'import pandas as pd\nveri = [{"no": 1, "adres": {"il": "Bursa"}}]\nd = pd.json_normalize(veri).rename(columns={"adres.il": "il"})\nprint(d)\n',
        start: 'import json\nimport pandas as pd\n\ndef api_tablosu(json_metni):\n    veri = json.loads(json_metni)\n    # TODO: düzleştir\n    # TODO: yeniden adlandır ve sırala\n    return pd.DataFrame(veri)\n',
        sol: 'import json\nimport pandas as pd\n\ndef api_tablosu(json_metni):\n    veri = json.loads(json_metni)\n    df = pd.json_normalize(veri)\n    df = df.rename(columns={"musteri.ad": "ad", "musteri.sehir": "sehir"})\n    return df[["id", "tutar", "ad", "sehir"]]\n',
        tests: 'm = \'[{"id": 1, "tutar": 450.0, "musteri": {"ad": "Ayşe", "sehir": "Bursa"}}, {"id": 2, "tutar": 120.5, "musteri": {"ad": "Ali", "sehir": "Ankara"}}]\'\ndf = api_tablosu(m)\nassert list(df.columns) == ["id", "tutar", "ad", "sehir"], f"Sütunlar id, tutar, ad, sehir olmalı; gelen {list(df.columns)}"\nassert df["sehir"].tolist() == ["Bursa", "Ankara"], "sehir iç içe alandan gelmeli"\nassert df["tutar"].sum() == 570.5, "tutar toplamı 570.5"\n',
        hints: ['İç içe sözlükleri sütuna açan fonksiyon pd.json_normalize.', 'Açılan sütun adları noktalıdır: "musteri.ad".'],
        why: 'json_normalize iç içe yapıyı düz tabloya çevirir; rename ve sütun listesiyle seçim çıktının şemasını sabitler, böylece API\'ye yeni alan eklense de raporun bozulmaz.' },
      { t: 'code',
        id: 'pandas-giris-x3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>buyuk_siparisler(con, esik)</code> fonksiyonu SQLite bağlantısındaki <code>siparis(id, sehir, tutar)</code> tablosundan <code>tutar &gt;= esik</code> olan satırları <b>parametreli sorgu</b> ile (<code>params</code>) okuyup tutara göre azalan sırada DataFrame döndürsün.</p>',
        guide: ['SQL sorgusunu ? yer tutucusuyla yaz.', 'ORDER BY tutar DESC ekle.', 'pd.read_sql(sorgu, con, params=(esik,)) çağır.', 'Değeri f-string ile sorguya gömme.'],
        example: 'import sqlite3\nimport pandas as pd\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE u (ad TEXT, stok INT)")\ncon.executemany("INSERT INTO u VALUES (?, ?)", [("kahve", 5), ("çay", 50)])\nprint(pd.read_sql("SELECT * FROM u WHERE stok < ?", con, params=(10,)))\n',
        start: 'import pandas as pd\n\ndef buyuk_siparisler(con, esik):\n    sorgu = "SELECT id, sehir, tutar FROM siparis"\n    # TODO: WHERE ... >= ? ve ORDER BY ekle\n    # TODO: params ile oku\n    return pd.read_sql(sorgu, con)\n',
        sol: 'import pandas as pd\n\ndef buyuk_siparisler(con, esik):\n    sorgu = "SELECT id, sehir, tutar FROM siparis WHERE tutar >= ? ORDER BY tutar DESC"\n    return pd.read_sql(sorgu, con, params=(esik,))\n',
        tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER, sehir TEXT, tutar REAL)")\ncon.executemany("INSERT INTO siparis VALUES (?, ?, ?)", [(1, "Bursa", 450.0), (2, "Ankara", 120.5), (3, "İzmir", 900.0), (4, "Bursa", 300.0)])\ndf = buyuk_siparisler(con, 300)\nassert df["id"].tolist() == [3, 1, 4], f"300 ve üstü, azalan: [3, 1, 4] bekleniyor; gelen {df[\'id\'].tolist()}"\nassert buyuk_siparisler(con, 10000).empty, "Eşleşme yoksa boş DataFrame"\nassert "params" in __source__, "Değeri params ile ver (SQL enjeksiyonuna karşı)"\n',
        hints: ['Yer tutucu: WHERE tutar >= ?', 'pd.read_sql(sorgu, con, params=(esik,)): tek elemanlı demette virgülü unutma.'],
        why: 'Parametreli sorgu, değeri veritabanı sürücüsünün güvenle yerleştirmesini sağlar; kullanıcı girdisi f-string ile gömülürse SQL enjeksiyonuna açık olursun.' },
      { t: 'code',
        id: 'pandas-giris-x4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>hafif_oku(metin)</code> virgülle ayrılmış CSV metninden yalnızca <code>musteri_no</code> ve <code>tutar</code> sütunlarını okusun (<code>usecols</code>). <code>musteri_no</code> baştaki sıfırları korunarak metin olsun; tutar sütunundaki <code>"-"</code> ve <code>"yok"</code> değerleri eksik (NaN) sayılsın. DataFrame döndür.</p>',
        start: 'import io\nimport pandas as pd\n\ndef hafif_oku(metin):\n    pass\n',
        sol: 'import io\nimport pandas as pd\n\ndef hafif_oku(metin):\n    return pd.read_csv(io.StringIO(metin), usecols=["musteri_no", "tutar"],\n                       dtype={"musteri_no": str}, na_values=["-", "yok"])\n',
        tests: 'm = "musteri_no,ad,sehir,tutar\\n00412,Ayşe,Bursa,450\\n07730,Ali,Ankara,-\\n10001,Can,İzmir,yok\\n"\ndf = hafif_oku(m)\nassert list(df.columns) == ["musteri_no", "tutar"], f"Yalnızca iki sütun okunmalı: {list(df.columns)}"\nassert df["musteri_no"].tolist() == ["00412", "07730", "10001"], "Baştaki sıfırlar korunmalı (dtype=str)"\nassert df["tutar"].isna().sum() == 2, "- ve yok eksik sayılmalı (na_values)"\nassert df["tutar"].sum() == 450, "Tutar sayısal olmalı"\n',
        hints: ['usecols=[...] ile sütun seçilir; dtype={"musteri_no": str} sıfırları korur.', 'na_values=["-", "yok"] bu metinleri NaN yapar, sütun da sayıya dönüşür.'],
        why: 'Gereksiz sütunları okumamak bellek ve süre kazandırır; kimlik sütunlarını metin, eksik işaretlerini NaN yapmak verinin doğru türde gelmesini sağlar.' },
      { t: 'code',
        id: 'pandas-giris-x5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>excel_icin_yaz(df, yol)</code> raporu Türkçe Excel\'in doğrudan açabileceği biçimde yazmalı: ayraç <code>;</code>, ondalık virgül, BOM\'lu UTF-8 (<code>utf-8-sig</code>) ve index sütunu olmadan. Şu anki dosya Excel\'de tek sütun ve bozuk harflerle açılıyor.</p>',
        start: 'import pandas as pd\n\ndef excel_icin_yaz(df, yol):\n    df.to_csv(yol)\n',
        sol: 'import pandas as pd\n\ndef excel_icin_yaz(df, yol):\n    df.to_csv(yol, sep=";", decimal=",", encoding="utf-8-sig", index=False)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["Şanlıurfa", "Çorum"], "ciro": [1234.5, 80.25]})\nexcel_icin_yaz(df, "rapor_test.csv")\nham = open("rapor_test.csv", "rb").read()\nassert ham.startswith(b"\\xef\\xbb\\xbf"), "Dosya BOM ile başlamalı: encoding=\\"utf-8-sig\\""\nmetin = ham.decode("utf-8-sig").splitlines()\nassert metin[0] == "sehir;ciro", f"Başlık \'sehir;ciro\' olmalı (index=False, sep=\';\'); gelen {metin[0]!r}"\nassert metin[1] == "Şanlıurfa;1234,5", f"Ondalık virgül olmalı; gelen {metin[1]!r}"\n',
        hints: ['to_csv da read_csv gibi sep ve decimal alır.', 'encoding="utf-8-sig" ve index=False ekle.'],
        why: 'Türkçe Excel CSV\'yi bölge ayarına göre böler ve BOM görmezse kodlamayı yanlış tahmin eder. Dört parametre birlikte verilince dosya çift tıkla doğru açılır.' },
      { t: 'code',
        id: 'pandas-giris-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>aylik_adet(df)</code>, <code>tarih</code> sütunu "gg.aa.yyyy" metni olan tabloda her ayın sipariş sayısını <code>{ay_no: adet}</code> sözlüğü olarak döndürmeli. Nisan siparişleri Mart\'a yazılıyor ve hiç hata çıkmıyor.</p>',
        start: 'import pandas as pd\n\ndef aylik_adet(df):\n    tarih = pd.to_datetime(df["tarih"])\n    return tarih.dt.month.value_counts().sort_index().to_dict()\n',
        sol: 'import pandas as pd\n\ndef aylik_adet(df):\n    tarih = pd.to_datetime(df["tarih"], format="%d.%m.%Y")\n    return tarih.dt.month.value_counts().sort_index().to_dict()\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"tarih": ["03.04.2024", "05.04.2024", "09.05.2024"]})\nr = aylik_adet(df)\nassert r == {4: 2, 5: 1}, f"Nisan 2, Mayıs 1 olmalı; gelen {r}. Biçimi açıkça ver: format=\\"%d.%m.%Y\\""\n',
        hints: ['Biçim verilmezse pandas ilk değere bakıp ay-gün sırası tahmin edebilir.', 'pd.to_datetime(..., format="%d.%m.%Y")'],
        why: 'Tarih biçimi tahminine güvenmek sessiz veri hatası üretir: 03.04 hem 3 Nisan hem 4 Mart olabilir. Açık format hem doğru hem hızlıdır; uymayan değer olursa hata verip seni uyarır.' },
      { t: 'code',
        id: 'pandas-giris-x7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Çok büyük bir sipariş dosyasını belleğe tek seferde alamıyorsun. <code>parcali_ciro(metin, boyut)</code> CSV metnini <code>pd.read_csv(..., chunksize=boyut)</code> ile parça parça okusun, her parçada <code>sehir</code> bazında <code>tutar</code> toplasın ve sonuçları birleştirip <code>{sehir: ciro}</code> sözlüğünü şehir adına göre sıralı döndürsün (değerler float). Yalnızca <code>sehir</code> ve <code>tutar</code> sütunlarını oku.</p>',
        start: 'import io\nimport pandas as pd\n\ndef parcali_ciro(metin, boyut):\n    pass\n',
        sol: 'import io\nimport pandas as pd\n\ndef parcali_ciro(metin, boyut):\n    toplam = None\n    for parca in pd.read_csv(io.StringIO(metin), usecols=["sehir", "tutar"], chunksize=boyut):\n        ara = parca.groupby("sehir")["tutar"].sum()\n        toplam = ara if toplam is None else toplam.add(ara, fill_value=0)\n    if toplam is None:\n        return {}\n    return {k: float(v) for k, v in sorted(toplam.items())}\n',
        tests: 'satirlar = ["id,sehir,tutar,not"] + [f"{i},{[\'Bursa\', \'Ankara\', \'İzmir\'][i % 3]},{i * 10},x" for i in range(1, 11)]\nm = "\\n".join(satirlar) + "\\n"\nr = parcali_ciro(m, 3)\nassert r == {"Ankara": 220.0, "Bursa": 180.0, "İzmir": 150.0}, f"Beklenen Ankara 220, Bursa 180, İzmir 150; gelen {r}"\nassert list(r) == sorted(r), "Anahtarlar şehir adına göre sıralı olmalı"\nassert parcali_ciro(m, 100) == r, "Parça boyutu sonucu değiştirmemeli"\nassert "chunksize" in __source__, "chunksize ile parça parça oku"\nassert parcali_ciro("id,sehir,tutar\\n", 5) == {}, "Boş dosya boş sözlük"\n',
        hints: ['chunksize verilince read_csv DataFrame değil, parçaları veren bir yineleyici döndürür.', 'Parça özetlerini Series.add(..., fill_value=0) ile birleştir; bir şehir bazı parçalarda olmayabilir.', 'Son adımda sorted(toplam.items()) ile sıralı sözlük kur.'],
        why: 'chunksize ile bellek kullanımı parça boyutuyla sınırlı kalır. Toplam gibi birleştirilebilir özetler parça parça hesaplanıp toplanabilir; ortalama gibi özetlerde toplam ve adet ayrı ayrı taşınmalıdır.' }
    ],
    faq: [
      { q: 'UnicodeDecodeError: \'utf-8\' codec can\'t decode byte hatası alıyorum.',
        a: 'Dosya UTF-8 değil. Türkçe Windows/eski sistem çıktısıysa encoding="cp1254", Excel\'in BOM\'lu UTF-8\'iyse encoding="utf-8-sig" dene. latin-1 her baytı okur ama Türkçe harfleri (ş, ğ, ı) yanlış gösterir; son çare değil, yanlış çözümdür.' },
      { q: 'read_excel "Missing optional dependency \'openpyxl\'" diyor.',
        a: 'pandas Excel dosyalarını kendi okumaz, motor paketine ihtiyaç duyar: .xlsx için python -m pip install openpyxl, eski .xls için xlrd. Bu paketler tarayıcı motorunda yoktur; kendi bilgisayarında kur.' }
    ],
    mistakes: [
      { bad: 'df = pd.read_csv("musteri.csv")\n# musteri_no: 412',
        good: 'df = pd.read_csv("musteri.csv", dtype={"musteri_no": str})\n# musteri_no: "00412"',
        why: 'Sayıya benzeyen kimlik sütunları int olur ve baştaki sıfırlar kaybolur; birleştirmeler (merge) bu yüzden eşleşmez.' },
      { bad: 'pd.read_json(json_metni)',
        good: 'pd.read_json(io.StringIO(json_metni))',
        why: 'Ham JSON metni vermek pandas 2.2\'de uyarı, 3.x\'te hatadır; metni dosya gibi StringIO ile ver.' }
    ]
  }
);
})(window);
