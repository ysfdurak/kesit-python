/* PythonPatika — 'polars-duckdb' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'polars-duckdb',
    min: 30,
    html: `<p>Tek bir büyük Parquet dosyası bir noktadan sonra yetmez: her sorgu bütün dosyayı tarar, yeni gün eklemek için dosyayı baştan yazman gerekir. Veri gölleri (data lake) bu yüzden veriyi <b>bölümlere</b> (partition) ayrılmış klasörlerde tutar. Bu bölümde Pedal İzmir'in 116 bin yolculuğunu ay ay bölümlenmiş bir Parquet gölüne yazacak, DuckDB ile sorgulayacak, bölüm budamayı (partition pruning) ölçecek ve küçük dosya sorununu tanıyacaksın. pyarrow, DuckDB ve polars hem yerelde hem tarayıcıda çalışır.</p>
<h2>Hive bölümleme: klasör adı = sütun değeri</h2>
<p>Hive düzeninde (Hive-style partitioning) bölüm sütunu klasör adına <code>sutun=deger</code> biçiminde yazılır ve dosyanın içinden çıkarılır:</p>
<pre class="out">gol/
├── ay=2024-06/data_0.parquet
├── ay=2024-07/data_0.parquet
└── ay=2024-08/data_0.parquet</pre>
<p>Okuyucu (DuckDB, polars, Spark, Athena, BigQuery) klasör adlarından <code>ay</code> sütununu geri kurar. Asıl kazanç şudur: <code>WHERE ay = '2024-07'</code> filtresi geldiğinde motor diğer klasörlere hiç girmez. Buna <b>bölüm budama</b> denir ve dosya içindeki satır grubu istatistiklerine dayalı atlamadan (predicate pushdown) da önce gelir.</p>
<pre class="py">import veri, duckdb, pathlib, shutil
yol = veri.yol("pedal_izmir", "bk_trips")
shutil.rmtree("gol", ignore_errors=True)
duckdb.sql(f"""
    COPY (SELECT *, strftime(started_at::TIMESTAMP, '%Y-%m') AS ay FROM read_csv_auto('{yol}'))
    TO 'gol' (FORMAT parquet, PARTITION_BY (ay))
""")
print(sorted(str(p) for p in pathlib.Path("gol").rglob("*.parquet")))
print(duckdb.sql("""
    SELECT ay, COUNT(*) AS yolculuk, ROUND(SUM(fare), 2) AS ciro
    FROM read_parquet('gol/**/*.parquet', hive_partitioning = true)
    GROUP BY ay ORDER BY ay
""").fetchall())</pre>
<p>Aynı gölü başka araçlarla da yazabilirsin; üçü de aynı klasör yapısını üretir ve birbirinin yazdığını okur:</p>
<pre class="code">import pyarrow.parquet as pq
pq.write_to_dataset(tablo, root_path="gol", partition_cols=["ay"])      # pyarrow

df.write_parquet("gol", partition_by="ay")                              # polars (yeni sürümler)
pl.scan_parquet("gol/**/*.parquet", hive_partitioning=True).filter(pl.col("ay") == "2024-07")</pre>
<h2>Budamayı ölçmek</h2>
<p>Budamanın gerçekten çalıştığını tahmin etme, ölç. DuckDB'de <code>EXPLAIN ANALYZE</code> taranan dosya sayısını gösterir (çıktının biçimi sürüme göre değişir):</p>
<pre class="code">EXPLAIN ANALYZE
SELECT COUNT(*) FROM read_parquet('gol/**/*.parquet', hive_partitioning = true)
WHERE ay = '2024-07';</pre>
<pre class="out">│ File Filters: ay = '2024-07'    │
│ Scanning Files: 1/3             │
│ Total Files Read: 1             │</pre>
<p>Budamayı bozan üç klasik hata var. Bir: filtreyi bölüm sütununa değil türetilmiş bir ifadeye yazmak (<code>WHERE strftime(started_at, '%Y-%m') = '2024-07'</code> tüm dosyaları açar; <code>WHERE ay = '2024-07'</code> açmaz). İki: tür uyuşmazlığı; <code>yil=2024</code> klasörü sayıya, <code>ay=07</code> metne çevrilebilir, karşılaştırmayı aynı türle yap. Üç: filtreyi bir alt sorgunun sonucuna bağlamak; değer sorgu planlanırken bilinmediği için budama yapılamayabilir.</p>
<h2>Bölüm sütunu nasıl seçilir? Küçük dosya sorunu</h2>
<div class="tbl-wrap"><table><tr><th>Seçim</th><th>Sonuç</th></tr>
<tr><td>Sorgularda hep filtrelenen, düşük kardinaliteli sütun (gün, ay, ülke)</td><td>İyi: az klasör, büyük dosyalar, güçlü budama</td></tr>
<tr><td>Yüksek kardinaliteli sütun (<code>user_id</code>, <code>trip_id</code>)</td><td>Kötü: binlerce klasör, her birinde birkaç KB'lık dosya</td></tr>
<tr><td>Çok seviye (<code>gun/istasyon/saat</code>)</td><td>Kötü: bölüm sayısı çarpılarak büyür</td></tr></table></div>
<p>Küçük dosya sorunu (small files problem) şudur: her dosyanın açılması, üst verisinin (footer) okunması ve bulut depolamada ayrı bir istek gerektirmesi sabit bir maliyettir. 6.000 kullanıcıya bölünmüş bir göl, 3 aylık bir gölden yüzlerce kat yavaş sorgulanabilir. Kaba kural: dosya başına 100 MB ile 1 GB arası hedefle; günlük artımlı yazımlar küçük dosyalar üretiyorsa düzenli olarak <b>sıkıştır</b> (compaction): bir bölümdeki küçük dosyaları okuyup birkaç büyük dosya olarak yeniden yaz. Delta Lake ve Apache Iceberg gibi tablo biçimleri bunu (<code>OPTIMIZE</code>) ve atomik yazmayı hazır sunar.</p>
<div class="warn"><b>Bölümleme her derde deva değil</b>116 bin satırlık bir tabloyu bölümlemek ölçülebilir bir kazanç getirmez; tek Parquet dosyası zaten saniyenin altında okunur. Bölümleme gigabaytlar ve sürekli eklenen veri için düşünülür.</div>
<div class="note"><b>Gerçek işte</b>Veri mühendisliği mülakatlarında "S3'teki olay verisini nasıl düzenlersin?" sorusu çok sık gelir. Beklenen cevap: Parquet, tarihe göre Hive bölümleme, dosya boyutu hedefi, sıkıştırma işi ve sorgu motorunun budamayı kullandığını EXPLAIN ile doğrulamak.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'polars-duckdb-y1',
        stage: 'Isınma',
        q: 'Olay verisi <code>gun=YYYY-MM-DD</code> klasörlerine bölümlenmiş. <code>WHERE gun = \'2024-07-15\'</code> sorgusu hızlıdır ama <code>WHERE CAST(olay_zamani AS DATE) = \'2024-07-15\'</code> yavaştır. Neden?',
        o: [
          'İkinci sorgu tarihleri metin olarak karşılaştırdığı için her satırda ayrı dönüşüm yapar',
          'Budama yalnız bölüm sütunundaki filtrede çalışır; ikincisi tüm klasörleri açar',
          'CAST işlemi Parquet\'te desteklenmediği için DuckDB veriyi önce CSV\'ye çevirir',
          'İkinci sorgu satır grubu istatistiklerini kapatır ve yavaş bir dizin taraması kullanır'
        ],
        a: 1,
        why: 'Motor hangi klasörlere girmeyeceğine sorguyu planlarken, klasör adlarındaki değerlere bakarak karar verir. Filtre bölüm sütununda değilse bu karar verilemez ve her dosya açılır. Satır grubu istatistikleri biraz yardımcı olsa da dosyaların açılma maliyeti kalır.'
      },
      {
        t: 'mc',
        id: 'polars-duckdb-y2',
        stage: 'Isınma',
        q: 'Pedal İzmir yolculukları için bölüm sütunu seçiyorsun; sorgular çoğunlukla tarih aralığına göre. Hangisi en iyi seçim?',
        o: ['<code>user_id</code> (6.000 farklı değer)', '<code>trip_id</code> (her satır farklı)', '<code>ay</code> ya da büyük veride <code>gun</code>', '<code>distance_km</code> (ondalıklı sayı)'],
        a: 2,
        why: 'Bölüm sütunu sık filtrelenen ve düşük kardinaliteli olmalıdır. user_id ve trip_id binlerce klasör ve küçük dosya üretir; ondalıklı bir ölçüm sütunu ise anlamsız sayıda bölüm yaratır.'
      },
      {
        t: 'predict',
        id: 'polars-duckdb-y3',
        stage: 'Kodu oku',
        q: 'Hive yolundan bölüm değerlerini çıkaran bu kod ne yazdırır?',
        o: [
          '{\'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} str',
          '{\'yil\': 2024, \'ay\': 7, \'sehir\': \'İzmir\'} int',
          '{\'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} int',
          '{\'gol\': None, \'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} str'
        ],
        a: 0,
        code: 'yol = "gol/yil=2024/ay=07/sehir=İzmir/data_0.parquet"\nbolumler = dict(p.split("=", 1) for p in yol.split("/") if "=" in p)\nprint(bolumler, type(bolumler["ay"]).__name__)\n',
        why: 'Klasör adı her zaman metindir; "07" bile. Okuyucu motorlar tür çıkarımı yapabilir (DuckDB yil\'i sayıya çevirebilir), bu yüzden filtre değerini bölüm sütununun gerçek türüyle yazmak önemlidir. "gol" ve dosya adı = içermediği için atlanır.'
      },
      {
        t: 'order',
        id: 'polars-duckdb-y4',
        stage: 'Kodu oku',
        q: '<p>pyarrow ile satış kanalına göre bölümlü küçük bir göl yazıp DuckDB ile yalnız web bölümünü sayan programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">[\'kanal=mobil\', \'kanal=web\'] 2</pre>',
        lines: [
          'import pyarrow as pa, pyarrow.parquet as pq, duckdb, pathlib, shutil',
          'tablo = pa.table({"kanal": ["web", "mobil", "web"], "tutar": [120, 80, 45]})',
          'shutil.rmtree("mini_gol", ignore_errors=True)',
          'pq.write_to_dataset(tablo, root_path="mini_gol", partition_cols=["kanal"])',
          'klasorler = sorted(p.name for p in pathlib.Path("mini_gol").iterdir())',
          'n = duckdb.execute("SELECT COUNT(*) FROM read_parquet(\'mini_gol/**/*.parquet\', hive_partitioning = true) WHERE kanal = \'web\'").fetchone()[0]',
          'print(klasorler, n)'
        ],
        expect: '[\'kanal=mobil\', \'kanal=web\'] 2\n',
        hint: 'Tablo yazılmadan klasörler listelenemez; eski klasör silinmeden yazılırsa önceki çalıştırmanın dosyaları eklenir.',
        why: 'write_to_dataset her bölüme ayrı dosya yazar ve mevcut klasöre ekleme yapar; bu yüzden önce temizlik gerekir. DuckDB hive_partitioning ile kanal sütununu klasör adından geri kurar ve filtrede yalnız web klasörünü okur. Not: bazı pyarrow sürümleri Türkçe karakterli bölüm değerlerini klasör adında yüzde kodlamasıyla yazar (İzmir → %C4%B0zmir); bölüm değerlerinde ASCII tercih et.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Bölüm budamayı kendin yap: <code>budanmis(yollar, filtre)</code>, Hive yollarının listesinden yalnız <code>filtre</code> sözlüğündeki <b>tüm</b> koşullara uyan dosyaları döndürsün. Filtre değeri tek bir metin ya da metin kümesi (<code>set</code>, "IN" anlamında) olabilir. Filtrede olan ama yolda bulunmayan bölüm sütunu, o dosyanın elenmesine yol açmaz (motor emin olamadığı için okur). Orijinal sırayı koru.</p>',
        guide: [
          'Her yol için bölüm sözlüğünü çıkar: "=" içeren parçaları split("=", 1) ile ayır.',
          'Filtredeki her (sütun, değer) için: sütun yolda yoksa geç; varsa değer eşleşmeli.',
          'Değer set ise "in", değilse "==" ile karşılaştır.',
          'Tüm koşullar sağlanan yolları listeye ekle.'
        ],
        example: 'kosul = {"07", "08"}\nfor deger in ["06", "07"]:\n    print(deger, deger in kosul if isinstance(kosul, set) else deger == kosul)\n',
        start: 'def budanmis(yollar, filtre):\n    sonuc = []\n    for yol in yollar:\n        bolum = {}\n        # TODO: bölüm sözlüğünü kur\n        uyar = True\n        # TODO: filtre koşullarını denetle\n        if uyar:\n            sonuc.append(yol)\n    return sonuc\n',
        sol: 'def budanmis(yollar, filtre):\n    sonuc = []\n    for yol in yollar:\n        bolum = dict(p.split("=", 1) for p in yol.split("/") if "=" in p)\n        uyar = True\n        for sutun, deger in filtre.items():\n            if sutun not in bolum:\n                continue\n            v = bolum[sutun]\n            if (v not in deger) if isinstance(deger, set) else (v != deger):\n                uyar = False\n                break\n        if uyar:\n            sonuc.append(yol)\n    return sonuc\n',
        tests: 'Y = ["gol/yil=2024/ay=06/a.parquet", "gol/yil=2024/ay=07/a.parquet", "gol/yil=2024/ay=07/b.parquet",\n     "gol/yil=2024/ay=08/a.parquet", "gol/yil=2025/ay=01/a.parquet"]\nassert budanmis(Y, {"ay": "07"}) == Y[1:3], "Yalnız ay=07 klasöründeki iki dosya"\nassert budanmis(Y, {"yil": "2024", "ay": {"07", "08"}}) == Y[1:4], "IN filtresi ve iki koşul"\nassert budanmis(Y, {"sehir": "İzmir"}) == Y, "Yolda olmayan sütun budama yapamaz; hepsi okunur"\nassert budanmis(Y, {"yil": "2023"}) == [], "Hiçbiri uymaz"\nassert budanmis(Y, {}) == Y, "Filtre yoksa her şey okunur"\n',
        hints: ['Önce bölüm sözlüğü: dict(p.split("=", 1) for p in yol.split("/") if "=" in p).', 'Koşul başarısızsa uyar = False yapıp iç döngüden çık.', 'Değerler metindir: "07" ile 7 eşit değildir.'],
        why: 'Motorların yaptığı budama tam olarak budur: dosyaları açmadan, yalnız yol metnine bakarak eleme. Bu işlem dosya sayısıyla doğrusal ve çok ucuzdur; bu yüzden binlerce dosyalı göllerde bile anında yapılır.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Lezzet Kurye siparişlerinden bir göl kur ve sorgula. İki fonksiyon yaz:</p><ul><li><code>gol_kur(kok)</code>: <code>veri.yol("lezzet_kurye", "lk_orders")</code> CSV\'sini DuckDB ile oku, <code>ay</code> (<code>placed_at</code>\'in <code>YYYY-MM</code> hâli) ve <code>status</code> sütunlarına göre (bu sırayla) Hive bölümlü Parquet olarak <code>kok</code> klasörüne yaz. Klasör varsa önce sil. Ay klasörlerinin adlarını sıralı liste döndür.</li><li><code>ay_ozeti(kok, ay)</code>: gölü <code>hive_partitioning</code> ile okuyup verilen ayın durum → sipariş sayısı sözlüğünü döndür. Ay değerini SQL\'e parametreyle ver.</li></ul>',
        start: 'import veri, duckdb, shutil, pathlib\n\ndef gol_kur(kok):\n    pass\n\ndef ay_ozeti(kok, ay):\n    pass\n',
        sol: 'import veri, duckdb, shutil, pathlib\n\ndef gol_kur(kok):\n    shutil.rmtree(kok, ignore_errors=True)\n    yol = veri.yol("lezzet_kurye", "lk_orders")\n    duckdb.sql(f"""\n        COPY (SELECT *, substr(CAST(placed_at AS VARCHAR), 1, 7) AS ay FROM read_csv_auto(\'{yol}\'))\n        TO \'{kok}\' (FORMAT parquet, PARTITION_BY (ay, status))\n    """)\n    return sorted(p.name for p in pathlib.Path(kok).iterdir() if p.is_dir())\n\ndef ay_ozeti(kok, ay):\n    satirlar = duckdb.execute(\n        f"SELECT status, COUNT(*) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) "\n        "WHERE ay = ? GROUP BY status", [ay]).fetchall()\n    return dict(satirlar)\n',
        tests: 'aylar = gol_kur("kurye_gol")\nassert aylar == ["ay=2024-10", "ay=2024-11", "ay=2024-12", "ay=2025-01"], f"Dört ay klasörü beklenir: {aylar}"\nalt = sorted(p.name for p in pathlib.Path("kurye_gol/ay=2024-10").iterdir())\nassert alt == ["status=iade", "status=iptal", "status=teslim"], f"Ayın içinde durum klasörleri olmalı: {alt}"\nassert ay_ozeti("kurye_gol", "2024-10") == {"teslim": 1931, "iptal": 109, "iade": 47}, "Ekim 2024 durum sayıları"\nassert ay_ozeti("kurye_gol", "2025-01") == {"teslim": 1, "iptal": 2}, "Ocak 2025\'te yalnız 3 sipariş var"\nassert gol_kur("kurye_gol") == aylar, "İkinci kurulum aynı sonucu vermeli (önce silinmeli)"\nassert ay_ozeti("kurye_gol", "2024-10")["teslim"] == 1931, "Yeniden kurulumda veri ikilenmemeli"\n',
        hints: [
          'DuckDB: COPY (SELECT ..., ifade AS ay FROM read_csv_auto(...)) TO kok (FORMAT parquet, PARTITION_BY (ay, status)).',
          'Okurken read_parquet(kok/**/*.parquet, hive_partitioning = true); ** alt klasörlerin hepsini kapsar.',
          'duckdb.execute(sorgu, [ay]) ile ? parametresini bağla; dict(fetchall()) sözlüğe çevirir.'
        ],
        why: 'İki seviyeli bölümleme (ay/durum) "Ekim\'in iptalleri" gibi sorgularda tek klasöre iner. Yeniden kurulumda klasörü silmek idempotentliği sağlar; silmezsen DuckDB hata verir ya da başka araçlar dosyaları ekleyerek veriyi ikiler.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Sıkıştırma (compaction) planı: <code>sikistirma_plani(dosyalar, hedef_mb)</code> yaz. <code>dosyalar</code>, <code>(bolum, boyut_mb)</code> demetlerinin listesidir. Her bölüm için dosyaları <b>verildikleri sırayla</b> gruplara topla: bir dosyayı eklemek grubun toplamını <code>hedef_mb</code>\'nin üstüne çıkaracaksa yeni grup başlat. Zaten <code>hedef_mb</code>\'den büyük ya da eşit dosyalar tek başına kalır ve plana girmez. Yalnız <b>birden çok dosya içeren</b> grupları, bölüm adına göre sıralı sözlük olarak döndür: <code>{bolum: [[boyutlar], ...]}</code>; hiç grubu kalmayan bölümü sözlüğe koyma.</p>',
        start: 'def sikistirma_plani(dosyalar, hedef_mb):\n    return {}\n',
        sol: 'def sikistirma_plani(dosyalar, hedef_mb):\n    bolumler = {}\n    for bolum, boyut in dosyalar:\n        bolumler.setdefault(bolum, []).append(boyut)\n    plan = {}\n    for bolum in sorted(bolumler):\n        gruplar, grup, toplam = [], [], 0\n        for b in bolumler[bolum]:\n            if b >= hedef_mb:\n                continue\n            if grup and toplam + b > hedef_mb:\n                gruplar.append(grup)\n                grup, toplam = [], 0\n            grup.append(b)\n            toplam += b\n        if grup:\n            gruplar.append(grup)\n        gruplar = [g for g in gruplar if len(g) > 1]\n        if gruplar:\n            plan[bolum] = gruplar\n    return plan\n',
        tests: 'D = [("gun=01", 30), ("gun=01", 40), ("gun=01", 50), ("gun=01", 10), ("gun=02", 300), ("gun=02", 5),\n     ("gun=03", 60), ("gun=03", 70), ("gun=03", 20)]\np = sikistirma_plani(D, 128)\nassert p["gun=01"] == [[30, 40, 50]], f"gun=01: 30+40+50=120, 10 eklenirse 130 > 128; tek kalan 10 plana girmez: {p.get(\'gun=01\')}"\nassert "gun=02" not in p, "300 MB zaten büyük; 5 MB tek başına kalır: gun=02 planda olmamalı"\nassert p["gun=03"] == [[70, 20]], f"gun=03: 60 tek kalır, 70+20 birleşir: {p.get(\'gun=03\')}"\nassert list(p) == ["gun=01", "gun=03"], "Bölümler sıralı olmalı"\nassert sikistirma_plani([], 128) == {}, "Boş liste"\n',
        hints: ['Önce dosyaları bölüme göre grupla (setdefault).', 'Her bölümde sırayla yürü; toplam + b > hedef ise mevcut grubu kapat.', 'Sonda tek elemanlı grupları at: birleştirilecek bir şey yok.'],
        why: 'Delta Lake OPTIMIZE ve Iceberg rewrite_data_files bu tür bir plan çıkarır: küçük dosyaları hedef boyuta yakın gruplar hâlinde birleştirir. Tek dosyalık grubu yeniden yazmak hiçbir şey kazandırmaz, yalnız maliyettir.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>aylik_ciro(kok, ay)</code> Hive bölümlü gölde verilen ayın toplam tutarını döndürmeli. Sorgu ya hata veriyor ya da 0 döndürüyor: filtre değeri SQL\'e tırnaksız gömülmüş, <code>2024-07</code> bir çıkarma işlemi olarak (2017) yorumlanıyor. Değeri parametre olarak bağla.</p>',
        start: 'import duckdb, pyarrow as pa, pyarrow.parquet as pq, shutil\n\ndef aylik_ciro(kok, ay):\n    sorgu = f"SELECT COALESCE(SUM(tutar), 0) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) WHERE ay = {ay}"\n    return duckdb.execute(sorgu).fetchone()[0]\n',
        sol: 'import duckdb, pyarrow as pa, pyarrow.parquet as pq, shutil\n\ndef aylik_ciro(kok, ay):\n    sorgu = f"SELECT COALESCE(SUM(tutar), 0) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) WHERE ay = ?"\n    return duckdb.execute(sorgu, [ay]).fetchone()[0]\n',
        tests: 'shutil.rmtree("ciro_gol", ignore_errors=True)\nt = pa.table({"ay": ["2024-06", "2024-07", "2024-07", "2024-08"], "tutar": [100, 250, 50, 75]})\npq.write_to_dataset(t, root_path="ciro_gol", partition_cols=["ay"])\nassert aylik_ciro("ciro_gol", "2024-07") == 300, "Temmuz cirosu 250 + 50 = 300"\nassert aylik_ciro("ciro_gol", "2024-08") == 75, "Ağustos 75"\nassert aylik_ciro("ciro_gol", "2023-01") == 0, "Olmayan ay 0"\n',
        hints: ['f-string\'e gömülen 2024-07 SQL\'de sayısal bir ifadedir.', 'Değeri ? ile parametre olarak ver: duckdb.execute(sorgu, [ay]).', 'Parametre bağlama hem tür sorununu hem SQL enjeksiyonunu çözer.'],
        why: 'Değeri metne gömmek bu tür sessiz tür hatalarına ve enjeksiyona açıktır. Parametreyle verilen değer motor tarafından doğru türde karşılaştırılır ve bölüm budaması da çalışmaya devam eder.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Küçük dosya raporu: <code>dosya_raporu(kok, esik_kb)</code> yaz. <code>kok</code> altındaki tüm <code>.parquet</code> dosyalarını bul; her dosyanın bölümünü, kök ile dosya arasındaki klasör yolu olarak (<code>"gun=01/sehir=İzmir"</code> gibi, ayırıcı <code>/</code>) al. Döndür:</p><ul><li><code>"bolum"</code>: farklı bölüm sayısı</li><li><code>"dosya"</code>: dosya sayısı</li><li><code>"ort_kb"</code>: ortalama dosya boyutu (KB = 1024 bayt), 1 ondalık</li><li><code>"kucuk_oran"</code>: boyutu <code>esik_kb</code>\'den küçük dosyaların oranı, 2 ondalık</li><li><code>"en_parcali"</code>: en çok dosya içeren bölüm (eşitlikte alfabetik ilk)</li></ul><p>Hiç dosya yoksa <code>{"bolum": 0, "dosya": 0, "ort_kb": 0.0, "kucuk_oran": 0.0, "en_parcali": None}</code>.</p>',
        start: 'from pathlib import Path\n\ndef dosya_raporu(kok, esik_kb):\n    pass\n',
        sol: 'from pathlib import Path\nfrom collections import Counter\n\ndef dosya_raporu(kok, esik_kb):\n    kok = Path(kok)\n    dosyalar = sorted(kok.rglob("*.parquet"))\n    if not dosyalar:\n        return {"bolum": 0, "dosya": 0, "ort_kb": 0.0, "kucuk_oran": 0.0, "en_parcali": None}\n    bolum_say = Counter("/".join(d.parent.relative_to(kok).parts) for d in dosyalar)\n    boyutlar = [d.stat().st_size / 1024 for d in dosyalar]\n    en = sorted(bolum_say.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]\n    return {"bolum": len(bolum_say), "dosya": len(dosyalar),\n            "ort_kb": round(sum(boyutlar) / len(boyutlar), 1),\n            "kucuk_oran": round(sum(b < esik_kb for b in boyutlar) / len(boyutlar), 2),\n            "en_parcali": en}\n',
        tests: 'import shutil\nshutil.rmtree("rapor_gol", ignore_errors=True)\ndef yaz(yol, kb):\n    p = Path("rapor_gol") / yol\n    p.parent.mkdir(parents=True, exist_ok=True)\n    p.write_bytes(b"x" * int(kb * 1024))\nyaz("gun=01/sehir=İzmir/a.parquet", 2); yaz("gun=01/sehir=İzmir/b.parquet", 3); yaz("gun=01/sehir=İzmir/c.parquet", 1)\nyaz("gun=01/sehir=Ankara/a.parquet", 500); yaz("gun=02/sehir=Ankara/a.parquet", 4); yaz("gun=02/sehir=Ankara/b.parquet", 10)\n(Path("rapor_gol") / "_SUCCESS").write_text("")\nr = dosya_raporu("rapor_gol", 64)\nassert r["bolum"] == 3 and r["dosya"] == 6, f"3 bölüm, 6 parquet dosyası (_SUCCESS sayılmaz): {r}"\nassert r["ort_kb"] == 86.7, f"(2+3+1+500+4+10)/6 = 86.7 KB: {r[\'ort_kb\']}"\nassert r["kucuk_oran"] == 0.83, f"6 dosyanın 5\'i 64 KB\'tan küçük: {r[\'kucuk_oran\']}"\nassert r["en_parcali"] == "gun=01/sehir=İzmir", f"En parçalı bölüm: {r[\'en_parcali\']}"\nassert dosya_raporu("yok_boyle_klasor", 64)["en_parcali"] is None, "Dosya yoksa boş rapor"\n',
        hints: [
          'Path(kok).rglob("*.parquet") alt klasörlerdeki tüm dosyaları verir.',
          'Bölüm: d.parent.relative_to(kok).parts parçalarını "/" ile birleştir (Windows\'ta da aynı sonuç).',
          'Eşitlikte alfabetik ilk için sorted(..., key=lambda kv: (-kv[1], kv[0])).'
        ],
        why: 'Bu rapor bir göl sağlık kontrolüdür: ortalama dosya boyutu düşük ve küçük dosya oranı yüksekse sorgular yavaşlar ve bulut istek maliyeti artar. Sıkıştırma işini bu metriklere göre tetiklemek yaygın bir uygulamadır.'
      }
    ],
    faq: [
      {
        q: 'Hive bölümleme ile Delta Lake / Iceberg arasındaki fark ne?',
        a: 'Hive bölümleme yalnız bir klasör adlandırma kuralıdır; hangi dosyaların tabloya ait olduğunu klasörü listeleyerek bulursun ve yarım yazılan dosyalar okunabilir. Delta Lake ve Iceberg bunun üzerine bir işlem günlüğü (transaction log) ekler: atomik yazma, zaman yolculuğu, şema evrimi, gizli bölümleme ve OPTIMIZE gibi bakım komutları. Dosyalar yine Parquet\'tir.'
      }
    ],
    mistakes: [
      {
        why: 'Tek yıldız yalnız kök klasördeki dosyaları eşler; bölüm klasörlerinin içindekiler okunmaz. ** tüm alt klasörleri kapsar; hive_partitioning ise bölüm sütununu klasör adından geri kurar.',
        bad: 'duckdb.sql("SELECT * FROM read_parquet(\'gol/*.parquet\')")',
        good: 'duckdb.sql("SELECT * FROM read_parquet(\'gol/**/*.parquet\', hive_partitioning = true)")'
      }
    ]
  }
);
})(window);
