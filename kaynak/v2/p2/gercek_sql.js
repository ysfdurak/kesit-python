/* Kesit Python: read_sql, to_sql, sunucu bağlantıları. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "sql-analitik",
 "min": 20,
 "html": "<h2>pandas ve SQLAlchemy: read_sql ve to_sql</h2><p>İşte veri çoğu zaman bir veritabanındadır. pandas, SQLAlchemy motoru (engine) üzerinden okur ve yazar. Burada SQLite kullanıyoruz; aynı kod bağlantı adresi değişince başka veritabanında da çalışır.</p>\n<pre class=\"py\">import pandas as pd\nfrom sqlalchemy import create_engine, text\n\nengine = create_engine(\"sqlite:///:memory:\")\npd.DataFrame({\"sehir\": [\"İzmir\", \"Van\"], \"tutar\": [100, 40]}).to_sql(\"satis\", engine, index=False)\nprint(pd.read_sql(text(\"SELECT * FROM satis WHERE tutar &gt; :esik\"), engine, params={\"esik\": 50}))</pre>\n<p>Değeri f-string ile değil parametreyle ver: SQL enjeksiyonunu önler. <code>to_sql</code> için <code>if_exists</code> üç değer alır: <code>fail</code> (varsayılan), <code>replace</code>, <code>append</code>. <code>replace</code> tabloyu silip yeniden kurar; indeks ve kısıtlar da gider, bu yüzden üretimde dikkatli kullan.</p>\n<h3>SQL Server, Oracle, MySQL</h3><p>Değişen yalnız bağlantı adresi ve sürücüdür. Bu sürücüler ağ ister, tarayıcıda çalışmaz; aşağıdaki görevi kendi bilgisayarında yap.</p>\n<div class=\"tbl-wrap\"><table><tr><th>Veritabanı</th><th>Sürücü</th><th>SQLAlchemy adresi</th><th>İlk 10 satır</th></tr>\n<tr><td>SQL Server</td><td>pyodbc</td><td><code>mssql+pyodbc://kul:sifre@sunucu/db?driver=ODBC+Driver+18+for+SQL+Server</code></td><td><code>SELECT TOP 10 ...</code></td></tr>\n<tr><td>Oracle</td><td>oracledb</td><td><code>oracle+oracledb://kul:sifre@sunucu:1521/?service_name=ORCL</code></td><td><code>FETCH FIRST 10 ROWS ONLY</code></td></tr>\n<tr><td>MySQL</td><td>pymysql</td><td><code>mysql+pymysql://kul:sifre@sunucu:3306/db</code></td><td><code>LIMIT 10</code></td></tr>\n<tr><td>PostgreSQL</td><td>psycopg</td><td><code>postgresql+psycopg://kul:sifre@sunucu:5432/db</code></td><td><code>LIMIT 10</code></td></tr></table></div>\n<div class=\"warn\"><b>Şifreyi koda yazma</b>Adresi ortam değişkeninden oku. Sorgunun türü de değişir: SQL Server'da T-SQL, Oracle'da PL/SQL. Söz dizimi farkları Kesit SQL'de anlatılır.</div>",
 "ex": [
  {
   "t": "code",
   "id": "sql-analitik-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>read_sql ve parametre.</b> <code>sehir_cirosu(engine, en_az)</code>: <code>satis(sehir, tutar)</code> tablosundan şehir başına toplamı <code>ciro</code> adıyla, toplamı <code>en_az</code> ve üstü olan şehirleri, ciroya göre azalan döndür. <code>pd.read_sql</code> ve parametre kullan; değeri metne gömme.</p>",
   "start": "import pandas as pd\nfrom sqlalchemy import create_engine, text\n\ndef sehir_cirosu(engine, en_az):\n    pass\n",
   "sol": "import pandas as pd\nfrom sqlalchemy import create_engine, text\n\ndef sehir_cirosu(engine, en_az):\n    sql = text(\"SELECT sehir, SUM(tutar) AS ciro FROM satis GROUP BY sehir HAVING SUM(tutar) >= :en_az ORDER BY ciro DESC\")\n    return pd.read_sql(sql, engine, params={\"en_az\": en_az})\n",
   "tests": "_e = create_engine(\"sqlite:///:memory:\")\npd.DataFrame({\"sehir\": [\"İzmir\", \"Van\", \"İzmir\", \"Kars\"], \"tutar\": [100, 40, 50, 5]}).to_sql(\"satis\", _e, index=False)\n_r = sehir_cirosu(_e, 40)\nassert list(_r.columns) == [\"sehir\", \"ciro\"], \"Sütunlar: \" + repr(list(_r.columns))\nassert _r[\"sehir\"].tolist() == [\"İzmir\", \"Van\"] and _r[\"ciro\"].tolist() == [150, 40], \"Sonuç: \" + repr(_r.to_dict(\"list\"))\nassert sehir_cirosu(_e, 100)[\"sehir\"].tolist() == [\"İzmir\"], \"Eşik parametreden gelmeli\"\nassert \"params\" in __kod__, \"Değeri params ile ver\"\n",
   "hints": [
    "text(\"... :en_az\") ve params={\"en_az\": en_az}",
    "Toplam üzerinde koşul için HAVING."
   ],
   "why": "read_sql sonucu doğrudan DataFrame verir. Filtreyi SQL'de yapmak büyük tabloda satırları Python'a hiç taşımaz.",
   "needs": [
    "pandas",
    "sqlalchemy",
    "sqlite3"
   ]
  },
  {
   "t": "code",
   "id": "sql-analitik-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>to_sql.</b> <code>yukle(engine)</code>: <code>veri.oku(\"anadolu_market\", \"orders\")</code> tablosunu <code>siparis</code> adıyla, indeksiz, varsa üzerine yazarak yükle; sonra SQL ile <code>status</code> başına sayıyı (<code>status</code>, <code>adet</code>; <code>status</code> sıralı) döndür. <code>ekle(engine, df)</code>: df'i <code>gunluk</code> tablosuna ekleyerek yazsın ve tablodaki toplam satır sayısını döndürsün.</p>",
   "start": "import pandas as pd\nimport veri\nfrom sqlalchemy import create_engine\n\ndef yukle(engine):\n    pass\n\ndef ekle(engine, df):\n    pass\n",
   "sol": "import pandas as pd\nimport veri\nfrom sqlalchemy import create_engine\n\ndef yukle(engine):\n    d = veri.oku(\"anadolu_market\", \"orders\")\n    d.to_sql(\"siparis\", engine, if_exists=\"replace\", index=False)\n    return pd.read_sql(\"SELECT status, COUNT(*) AS adet FROM siparis GROUP BY status ORDER BY status\", engine)\n\ndef ekle(engine, df):\n    df.to_sql(\"gunluk\", engine, if_exists=\"append\", index=False)\n    return pd.read_sql(\"SELECT COUNT(*) AS n FROM gunluk\", engine)[\"n\"][0]\n",
   "tests": "_e = create_engine(\"sqlite:///:memory:\")\n_b = veri.oku(\"anadolu_market\", \"orders\")\n_r = yukle(_e); _r = yukle(_e)\nassert _r[\"adet\"].sum() == len(_b), \"İki kez yüklemede satır çiftlenmemeli (replace)\"\nassert _r.set_index(\"status\")[\"adet\"].to_dict() == _b.groupby(\"status\").size().to_dict(), \"Durum sayıları yanlış\"\nassert _r[\"status\"].tolist() == sorted(_r[\"status\"]), \"status sıralı olmalı\"\nassert \"index\" not in pd.read_sql(\"SELECT * FROM siparis LIMIT 1\", _e).columns, \"İndeks tabloya yazılmamalı\"\n_d = pd.DataFrame({\"a\": [1, 2]})\nassert ekle(_e, _d) == 2 and ekle(_e, _d) == 4, \"append ile eklenmeli\"\n",
   "hints": [
    "df.to_sql(\"siparis\", engine, if_exists=\"replace\", index=False)",
    "if_exists=\"append\" mevcut tabloya ekler."
   ],
   "why": "replace basit ama tabloyu yeniden kurar; append idempotent değildir. Çift satır önlemek için ETL bitirmesindeki doğal anahtar yöntemi gerekir.",
   "needs": [
    "pandas",
    "sqlalchemy",
    "sqlite3"
   ]
  },
  {
   "t": "local",
   "id": "sql-analitik-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>Gerçek bir sunucuya bağlan. Sunucu yoksa MySQL ya da SQL Server'ın Docker imajı işe yarar. Bu betik bu ortamda çalıştırılmadı; adresi kendi sunucuna göre düzenle.</p>",
   "steps": [
    "Sürücüyü kur: <code>python -m pip install sqlalchemy pandas pymysql</code> (SQL Server için <code>pyodbc</code> ve ODBC sürücüsü, Oracle için <code>oracledb</code>).",
    "Adresi ortam değişkenine yaz, koda yazma: <code>VERITABANI_URL</code>.",
    "Betiği çalıştır. Sürüm satırı görünmeli."
   ],
   "file": "import os\n\nimport pandas as pd\nfrom sqlalchemy import create_engine, text\n\nengine = create_engine(os.environ[\"VERITABANI_URL\"])\nwith engine.connect() as con:\n    print(con.execute(text(\"SELECT VERSION()\")).scalar())   # SQL Server: SELECT @@VERSION; Oracle: SELECT banner FROM v$version\n\ndf = pd.DataFrame({\"a\": [1, 2]})\ndf.to_sql(\"kesit_deneme\", engine, if_exists=\"replace\", index=False)\nprint(pd.read_sql(\"SELECT * FROM kesit_deneme\", engine))\n",
   "fname": "baglan.py",
   "cmd": "python baglan.py"
  }
 ]
}
);
})(window);
