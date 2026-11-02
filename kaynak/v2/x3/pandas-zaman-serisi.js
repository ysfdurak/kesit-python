/* PythonPatika — 'pandas-zaman-serisi' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-zaman-serisi',
    min: 25,
    needs: ['pandas'],
    html: `<p>Bu derste zamanı ölçmeyi, kovalara bölmeyi ve dönemleri kıyaslamayı öğrendin. Bir sonraki doğal soru "yarın kaç?" sorusudur, yani tahmin (forecasting). Tahmin modelleri, ARIMA ve üstel düzeltme <b>Zaman serisi tahmini</b> dersinin konusu; bu bölüm o derse köprü kuruyor: geçmişten özellik (feature) üretmek, bunu <b>sızıntısız</b> yapmak ve modeli dürüstçe sınamak. Veri, Pedal İzmir'in Haziran-Ağustos 2024 arasındaki 116 bin bisiklet yolculuğu.</p>
<h2>Önce seriyi kur: günlük yolculuk sayısı</h2>
<pre class="py">import veri
import pandas as pd
yol = veri.oku("pedal_izmir", "bk_trips")
zaman = pd.to_datetime(yol["started_at"])
gunluk = zaman.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)
gunluk.name = "yolculuk"
print(len(gunluk), gunluk.index.min().date(), gunluk.index.max().date())
print(gunluk.head(7).tolist())
print(gunluk.groupby(gunluk.index.dayofweek).mean().round(0).tolist())   # Pzt..Paz</pre>
<p><code>asfreq("D", fill_value=0)</code> hiç yolculuk olmayan günleri de 0 olarak ekler; eksik gün, gecikme (lag) hesabını sessizce kaydırır. Haftanın günü ortalamaları mevsimselliği (seasonality) gösterir: modelin bunu öğrenmesi için ona "geçen haftanın aynı günü" bilgisini vermen gerekir.</p>
<h2>Gecikme ve pencere özellikleri</h2>
<p>Klasik makine öğrenmesi modelleri (doğrusal regresyon, gradyan artırma) sırayı bilmez; her satırı bağımsız görür. Zaman bilgisini ona sütun olarak verirsin:</p>
<div class="tbl-wrap"><table><tr><th>Özellik</th><th>pandas</th><th>Anlamı</th></tr>
<tr><td>lag_1</td><td><code>s.shift(1)</code></td><td>Dünkü değer</td></tr>
<tr><td>lag_7</td><td><code>s.shift(7)</code></td><td>Geçen haftanın aynı günü</td></tr>
<tr><td>ort_7</td><td><code>s.shift(1).rolling(7).mean()</code></td><td>Dünden geriye son 7 günün ortalaması</td></tr>
<tr><td>haftanin_gunu</td><td><code>s.index.dayofweek</code></td><td>Takvimden gelir; gelecek için de bilinir</td></tr></table></div>
<div class="warn"><b>Sızıntının en sinsi biçimi: shift'siz rolling</b><code>s.rolling(7).mean()</code> bugünün değerini de içerir. Tahmin anında bugünün değeri henüz bilinmediği için model eğitimde "cevabı görür", testte harika, canlıda kötü sonuç verir. Kural: tahmin edilen an t ise, özellik yalnız t'den <b>önce</b> bilinen bilgiyle hesaplanmalı. Pencereyi her zaman <code>shift(1)</code>'den sonra uygula.</div>
<pre class="py">X = pd.DataFrame({
    "y": gunluk,
    "lag_1": gunluk.shift(1),
    "lag_7": gunluk.shift(7),
    "ort_7": gunluk.shift(1).rolling(7).mean(),
    "sizan_ort_7": gunluk.rolling(7).mean(),          # YANLIŞ: bugünü içerir
    "haftanin_gunu": gunluk.index.dayofweek,
}).dropna()
print(len(X))
print(X[["y", "ort_7", "sizan_ort_7"]].corr().round(3).loc["y"].tolist())</pre>
<p>Sızan özelliğin hedefle korelasyonu belirgin biçimde yüksek çıkar; bu fark "çok iyi" görünen ama canlıda çöken modelin işaretidir. Çok adımlı tahminde (7 gün sonrası) kural daha da sıkıdır: ufuk h ise en yakın gecikme <code>shift(h)</code> olabilir.</p>
<p>Dış değişkenlerde (exogenous) aynı soruyu sor: "Tahmin anında bunu gerçekten bilir miyim?" Pedal İzmir'in <code>bk_weather</code> tablosundaki gerçekleşen yağmur, yarının yolculuğunu tahmin ederken bilinmez; canlıda elinde yalnız hava <b>tahmini</b> olur. Eğitimde gerçekleşen değeri kullanmak modeli olduğundan iyi gösterir. Takvim bilgileri (tatil, okul dönemi, kampanya planı) ise önceden bilinir ve güvenle kullanılır.</p>
<h2>Dürüst sınama: zamana göre bölme</h2>
<p>Rastgele <code>train_test_split</code> zaman serisinde yasaktır: test günleri eğitim günlerinin arasına serpiştirilir ve model geleceği görür. Doğrusu son N günü test olarak ayırmak ya da ileri yürüyen doğrulama (walk-forward) yapmaktır: önce 1-60. günlerle eğit, 61-67'yi tahmin et; sonra 1-67 ile eğit, 68-74'ü tahmin et... scikit-learn'de bunu <code>TimeSeriesSplit</code> yapar.</p>
<pre class="py">from sklearn.model_selection import TimeSeriesSplit
for i, (egitim, test) in enumerate(TimeSeriesSplit(n_splits=3, test_size=7).split(X)):
    print(i, "eğitim:", X.index[egitim[0]].date(), "→", X.index[egitim[-1]].date(),
          "| test:", X.index[test[0]].date(), "→", X.index[test[-1]].date())</pre>
<h2>Kıyas modelleri: önce basit olanı yen</h2>
<p>Her tahmin modelinin geçmesi gereken iki çıta vardır: <b>naive</b> (yarın = bugün) ve <b>mevsimsel naive</b> (yarın = geçen haftanın aynı günü). Modelin ortalama mutlak hatası (MAE) bunlardan iyi değilse karmaşıklık boşunadır.</p>
<pre class="py">test = gunluk.iloc[-14:]
naive = gunluk.shift(1).iloc[-14:]
mevsimsel = gunluk.shift(7).iloc[-14:]
print("naive MAE:", round((test - naive).abs().mean(), 1))
print("mevsimsel naive MAE:", round((test - mevsimsel).abs().mean(), 1))</pre>
<p>Bu veride naive daha iyi çıkıyor; yani yolculuk sayısı haftalık örüntüden çok son günlerin düzeyine bağlı. Böyle bir bulgu, model kurmadan önce hangi özelliklerin önemli olacağını söyler. <b>Zaman serisi tahmini</b> dersinde bu kıyasları ExponentialSmoothing, SARIMA ve gecikme özellikli gradyan artırma modelleriyle aşmaya çalışacaksın.</p>
<div class="note"><b>Gerçek işte</b>Talep tahmini (kaç bisiklet, kaç kurye, kaç kasiyer) operasyon ekiplerinin her gün kullandığı bir çıktıdır. Veri bilimi mülakatlarında "modelin testte çok iyi ama canlıda kötü, ne olabilir?" sorusunun ilk cevabı neredeyse her zaman zaman sızıntısıdır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'pandas-zaman-serisi-y1',
        stage: 'Isınma',
        q: 'Yarının satışını tahmin eden bir model için hangi özellik <b>sızıntı</b> içerir?',
        o: ['<code>s.shift(1)</code>', '<code>s.shift(7)</code>', '<code>s.rolling(7).mean()</code>', '<code>s.index.dayofweek</code>'],
        a: 2,
        why: 'rolling(7).mean() o günün değerini de pencereye katar; tahmin anında bu değer bilinmez. shift(1).rolling(7).mean() doğrusudur. Haftanın günü ise takvimden gelir ve gelecek için de bilinir, sızıntı değildir.'
      },
      {
        t: 'mc',
        id: 'pandas-zaman-serisi-y2',
        stage: 'Isınma',
        q: '92 günlük seride bir modeli sınamak için en doğru bölme hangisi?',
        o: ['train_test_split(X, y, test_size=0.2, shuffle=True)', 'Son 14 günü test, öncesini eğitim olarak ayırmak', 'Hafta sonlarını test, hafta içlerini eğitim yapmak', 'Her ayın ilk haftasını test olarak ayırmak'],
        a: 1,
        why: 'Model gerçekte hep geçmişle eğitilip gelecekte kullanılır; sınama da bunu taklit etmeli. Karıştırarak bölmek ya da aralara serpiştirilmiş test günleri, modelin bir test gününün hem öncesini hem sonrasını görmesine yol açar.'
      },
      {
        t: 'predict',
        id: 'pandas-zaman-serisi-y3',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Bu kod ne yazdırır?',
        o: ['[nan, nan, 15.0, 25.0, 35.0]', '[nan, 15.0, 25.0, 35.0, 45.0]', '[15.0, 25.0, 35.0, 45.0, nan]', '[nan, nan, 20.0, 30.0, 40.0]'],
        a: 0,
        code: 'import pandas as pd\ns = pd.Series([10, 20, 30, 40, 50])\nprint(s.shift(1).rolling(2).mean().tolist())\n',
        why: 'shift(1) seriyi [nan, 10, 20, 30, 40] yapar. 2\'lik pencere ilk tam pencereyi 3. elemanda bulur: (10+20)/2 = 15. Böylece 30 değerinin satırında yalnız ondan önceki iki değerin ortalaması durur: sızıntı yok.'
      },
      {
        t: 'order',
        id: 'pandas-zaman-serisi-y4',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: '<p>Gecikme özelliklerini üretip son 3 günü test olarak ayıran programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">4 3</pre>',
        lines: [
          'import pandas as pd',
          's = pd.Series(range(10), index=pd.date_range("2024-06-01", periods=10, freq="D"))',
          'X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "lag_3": s.shift(3)})',
          'X = X.dropna()',
          'egitim, test = X.iloc[:-3], X.iloc[-3:]',
          'print(len(egitim), len(test))'
        ],
        expect: '4 3\n',
        hint: 'dropna, bölmeden önce yapılmalı; yoksa eğitim kümesinde NaN kalır.',
        why: 'lag_3 ilk üç satırı NaN yapar; dropna sonrası 7 satır kalır. Son 3 gün test, ilk 4 gün eğitim olur. Bölme her zaman sıralı ve iloc ile yapılır.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y5',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Pedal İzmir için sızıntısız özellik tablosu kur. <code>ozellikler(s)</code> yaz: günlük yolculuk serisi <code>s</code> (DatetimeIndex) alsın ve şu sütunlarla, NaN içeren satırları atılmış bir DataFrame döndürsün: <code>y</code> (seri), <code>lag_1</code>, <code>lag_7</code>, <code>ort_7</code> (dünden geriye 7 günün ortalaması), <code>haftanin_gunu</code> (0 = Pazartesi). Testler gerçek veriyle çalışır.</p>',
        guide: [
          'DataFrame\'i sözlükle kur: her sütun s üzerinde bir dönüşüm.',
          'Gecikmeler için shift(1) ve shift(7).',
          'Pencere için önce shift(1), sonra rolling(7).mean().',
          'haftanin_gunu = s.index.dayofweek; en sonda dropna().'
        ],
        example: 'import pandas as pd\nsatis = pd.Series([5, 7, 6, 9], index=pd.date_range("2024-01-01", periods=4))\nprint(pd.DataFrame({"y": satis, "dun": satis.shift(1), "ay": satis.index.month}).dropna())\n',
        start: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef ozellikler(s):\n    X = pd.DataFrame({\n        "y": s,\n        # TODO: lag_1, lag_7\n        # TODO: ort_7 (sızıntısız)\n        # TODO: haftanin_gunu\n    })\n    return X\n',
        sol: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef ozellikler(s):\n    X = pd.DataFrame({\n        "y": s,\n        "lag_1": s.shift(1),\n        "lag_7": s.shift(7),\n        "ort_7": s.shift(1).rolling(7).mean(),\n        "haftanin_gunu": s.index.dayofweek,\n    })\n    return X.dropna()\n',
        tests: 's = gunluk_seri()\nX = ozellikler(s)\nassert list(X.columns) == ["y", "lag_1", "lag_7", "ort_7", "haftanin_gunu"], f"Sütunlar: {list(X.columns)}"\nassert len(X) == 85, f"92 gün - 7 (lag_7 ve ort_7 için) = 85 satır, gelen {len(X)}"\nson = X.loc["2024-08-31"]\nassert son["y"] == 1388 and son["lag_1"] == 1399 and son["lag_7"] == 1341, "31 Ağustos: y=1388, dün 1399, geçen hafta 1341"\nassert round(son["ort_7"], 2) == 1312.71, f"ort_7 o günü İÇERMEMELİ: 24-30 Ağustos ortalaması 1312.71, gelen {son[\'ort_7\']:.2f}"\nassert son["haftanin_gunu"] == 5, "31 Ağustos 2024 Cumartesi (5)"\n',
        hints: ['Her özellik "o güne kadar bilinen" bilgiyle hesaplanmalı.', 'ort_7 = s.shift(1).rolling(7).mean(); sıralama önemli.', 'İlk 7 satırda lag_7 ve ort_7 NaN olur; dropna ile at.'],
        why: 'Bu tablo bir regresyon ya da gradyan artırma modelinin girdisidir. ort_7 testindeki değer, bugünü içeren hatalı pencereden farklıdır; sızıntıyı test ile yakalamanın yolu tam olarak budur: bilinen bir gün için özelliği elle hesaplayıp karşılaştırmak.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y6',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Kıyas modellerinin hatasını hesapla: <code>kiyas_mae(s, test_gun=14)</code> yaz. Serinin son <code>test_gun</code> gününü test kabul et; her test günü için naive tahmin (önceki gün) ve mevsimsel naive tahmin (7 gün önce) yap. <code>{"naive": mae1, "mevsimsel": mae2}</code> döndür (1 ondalık). Gerçek Pedal İzmir serisinde dene.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef kiyas_mae(s, test_gun=14):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef kiyas_mae(s, test_gun=14):\n    test = s.iloc[-test_gun:]\n    naive = s.shift(1).iloc[-test_gun:]\n    mevsimsel = s.shift(7).iloc[-test_gun:]\n    return {"naive": round(float((test - naive).abs().mean()), 1),\n            "mevsimsel": round(float((test - mevsimsel).abs().mean()), 1)}\n',
        tests: 's = gunluk_seri()\nr = kiyas_mae(s)\nassert r == {"naive": 96.6, "mevsimsel": 107.8}, f"Son 14 gün: naive 96.6, mevsimsel 107.8 beklenir, gelen {r}"\nk = pd.Series([10, 20, 10, 20, 10, 20, 10, 20, 10], index=pd.date_range("2024-01-01", periods=9))\nassert kiyas_mae(k, test_gun=2) == {"naive": 10.0, "mevsimsel": 10.0}, "Küçük seri kontrolü"\n',
        hints: ['Tahminleri shift ile üret, sonra son test_gun satırı al.', 'MAE = (gerçek - tahmin).abs().mean().', 'Sonucu float\'a çevirip round(..., 1) uygula.'],
        why: 'Kıyas modelleri tahmin projesinin ilk adımıdır: kurduğun her model bu iki sayıyı geçmek zorunda. Bu veride naive\'in kazanması, düzey değişimlerinin haftalık örüntüden daha belirleyici olduğunu söyler.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>hazirla(s, test_gun)</code> özellik tablosunu kurup eğitim ve test kümesine bölmeli. Modelin testteki başarısı şüphe uyandıracak kadar yüksek: hem özelliklerde hem bölmede zaman sızıntısı var. <code>ort_3</code> dünden geriye 3 günün ortalaması olmalı; bölme son <code>test_gun</code> günü test yapmalı. Fonksiyon <code>(egitim, test)</code> DataFrame\'leri döndürür.</p>',
        start: 'import pandas as pd\n\ndef hazirla(s, test_gun):\n    X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "ort_3": s.rolling(3).mean()}).dropna()\n    test = X.sample(n=test_gun, random_state=0)\n    egitim = X.drop(test.index)\n    return egitim, test\n',
        sol: 'import pandas as pd\n\ndef hazirla(s, test_gun):\n    X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "ort_3": s.shift(1).rolling(3).mean()}).dropna()\n    egitim, test = X.iloc[:-test_gun], X.iloc[-test_gun:]\n    return egitim, test\n',
        tests: 's = pd.Series([10, 12, 14, 13, 15, 18, 20, 19, 22, 25], index=pd.date_range("2024-06-01", periods=10))\ne, t = hazirla(s, 3)\nassert t.index.min() > e.index.max(), "Tüm test günleri eğitim günlerinden SONRA olmalı"\nassert list(t.index.day) == [8, 9, 10], f"Test son 3 gün olmalı: {list(t.index.day)}"\nassert t.loc["2024-06-10", "ort_3"] == (20 + 19 + 22) / 3, "10 Haziran ort_3: 7-9 Haziran ortalaması (o gün hariç)"\nassert len(e) == 4, f"shift(1)+rolling(3) ilk 3 satırı atar: 7 satırdan 3\'ü test, 4 eğitim; gelen {len(e)}"\n',
        hints: ['İki hata var: biri ort_3\'te, biri bölmede.', 'Pencereden önce shift(1) uygula.', 'Rastgele örnek yerine iloc[:-n] ve iloc[-n:] kullan.'],
        why: 'Rastgele örneklenen test günleri, komşu günlerin eğitimde olması yüzünden kolay tahmin edilir; bugünü içeren pencere ise cevabı doğrudan verir. İkisi birlikte canlıda hiç görülmeyecek bir başarı üretir.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>İleri yürüyen doğrulamayı kendin yaz: <code>katlar(n, n_splits, test_size)</code>, scikit-learn\'ün <code>TimeSeriesSplit(n_splits, test_size=test_size)</code> davranışını taklit etsin. <code>n</code> satır sayısıdır. Son kat serinin sonunda biter; katlar birbirini izler, her katın test bloğu <code>test_size</code> uzunluğundadır ve eğitim, test bloğunun başına kadar olan tüm satırlardır (genişleyen pencere). Her katı <code>(egitim_bas, egitim_son, test_bas, test_son)</code> demeti olarak döndür; <code>son</code> değerleri hariçtir (Python dilimi gibi). Eğitim boş kalacaksa <code>ValueError</code> fırlat.</p>',
        start: 'def katlar(n, n_splits, test_size):\n    return []\n',
        sol: 'def katlar(n, n_splits, test_size):\n    ilk_test = n - n_splits * test_size\n    if ilk_test <= 0:\n        raise ValueError("eğitim kümesi boş kalıyor")\n    sonuc = []\n    for i in range(n_splits):\n        tb = ilk_test + i * test_size\n        sonuc.append((0, tb, tb, tb + test_size))\n    return sonuc\n',
        tests: 'from sklearn.model_selection import TimeSeriesSplit\nimport numpy as np\nfor n, k, t in [(85, 3, 7), (20, 4, 3), (10, 2, 4)]:\n    beklenen = [(int(a[0]), int(a[-1]) + 1, int(b[0]), int(b[-1]) + 1) for a, b in TimeSeriesSplit(n_splits=k, test_size=t).split(np.zeros(n))]\n    assert katlar(n, k, t) == beklenen, f"n={n}, k={k}, t={t}: sklearn {beklenen}, gelen {katlar(n, k, t)}"\ntry:\n    katlar(10, 5, 2)\n    assert False, "10 satırda 5x2 test bloğu eğitime yer bırakmaz: ValueError"\nexcept ValueError:\n    pass\n',
        hints: ['Test blokları sondan geriye dizilir: ilk test bloğu n - n_splits * test_size\'da başlar.', 'i. katın test başı: ilk_test + i * test_size; eğitim 0\'dan test başına kadar.', 'ilk_test <= 0 ise eğitim boştur.'],
        why: 'Genişleyen pencereli ileri yürüyen doğrulama, modelin her tahminde yalnız geçmişi gördüğü gerçek kullanımı taklit eder. Hata katlar boyunca artıyorsa veri dağılımı kayıyordur (drift); bu da zaman serisi tahmini dersinde yeniden eğitim sıklığını belirleyecek.'
      }
    ],
    faq: [
      {
        q: 'Gecikme özellikleri mi, ARIMA gibi klasik modeller mi?',
        a: 'Tek bir seri ve az veri varsa ExponentialSmoothing/ARIMA güçlü ve yorumlanabilirdir. Çok sayıda seri (her istasyon, her ürün), dış değişkenler (hava, kampanya) ve doğrusal olmayan ilişkiler varsa gecikme özellikleri + gradyan artırma genellikle daha iyi sonuç verir. Her iki durumda da önce naive kıyasla başla.'
      }
    ],
    mistakes: [
      {
        why: 'Pencere o günü içerirse model cevabı görerek öğrenir; testte mükemmel, canlıda başarısız olur. Pencereyi her zaman shift ettikten sonra uygula.',
        bad: 'X["ort_7"] = s.rolling(7).mean()',
        good: 'X["ort_7"] = s.shift(1).rolling(7).mean()'
      }
    ]
  }
);
})(window);
