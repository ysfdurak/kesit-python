import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2gen')
from x2lib import *
import os; os.environ['PP_VERI'] = '/home/claude/py/data'; sys.path.insert(0, '/home/claude/py/tools/pylib')

KURYE = d('''
    import veri
    import pandas as pd

    def kurye_verisi():
        o = veri.oku("lezzet_kurye", "lk_orders")
        r = veri.oku("lezzet_kurye", "lk_restaurants")
        k = veri.oku("lezzet_kurye", "lk_couriers")
        s = veri.oku("lezzet_kurye", "lk_order_lines")
        o = o[o["status"] == "teslim"].copy()
        zaman = pd.to_datetime(o["placed_at"])
        o["saat"] = zaman.dt.hour
        o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)
        o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60
        adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()
        d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")
              .merge(k[["courier_id", "vehicle"]], on="courier_id")
              .merge(adet, on="order_id"))
        d["restoran"] = d["restaurant_id"].astype(str)
        X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()
        for c in ["cuisine", "city", "vehicle", "restoran"]:
            X[c] = X[c].astype("category")
        return X, d["sure_dk"]
''')
BOL = d('''
    from sklearn.model_selection import train_test_split
    X, y = kurye_verisi()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
    KATEGORIK = ["cuisine", "city", "vehicle", "restoran"]
''')

H = []
H.append('<h2>Derinleş: gradient boosting uygulamada (HistGradientBoosting, XGBoost, LightGBM)</h2>')
H.append('<p>Tablo verisinde (satış, kredi, lojistik) en sık kazanan model ailesi gradient boosting\'dir: sığ ağaçlar sırayla eklenir ve her yeni ağaç öncekilerin <b>hatasını</b> (artıkları, residuals) düzeltmeye çalışır. Tahmin, başlangıç değeri artı her ağacın <code>learning_rate</code> ile küçültülmüş katkılarının toplamıdır. Bu bölümde scikit-learn\'ün hızlı uygulaması <code>HistGradientBoosting</code>\'i Lezzet Kurye\'nin gerçek teslimat verisiyle (<code>lezzet_kurye</code>, 6638 teslim edilmiş sipariş) ayarlayacak, sonra aynı ayarların XGBoost ve LightGBM\'deki karşılıklarını göreceksin.</p>')
H.append(py('''
artik_tahmin = [30.0] * 4                 # başlangıç: ortalama süre (dk)
gercek = [25.0, 40.0, 35.0, 20.0]
for tur in range(3):
    artik = [g - t for g, t in zip(gercek, artik_tahmin)]
    duzeltme = [a * 0.5 for a in artik]   # "ağaç" artığı mükemmel bilseydi; lr = 0.5
    artik_tahmin = [t + d for t, d in zip(artik_tahmin, duzeltme)]
    print(tur + 1, [round(t, 1) for t in artik_tahmin])
'''))
H.append('<p>Her tur hatanın yarısını kapatır; küçük <code>learning_rate</code> daha çok tur ister ama genellikle daha iyi genelleşir. Gerçekte ağaç artığı tam bilemez; derinliği ve yaprak sayısı sınırlı olduğu için genel örüntüyü öğrenir.</p>')
H.append('<h3>Neden "Hist"?</h3>')
H.append('<p>Klasik <code>GradientBoostingClassifier</code> her bölme için tüm benzersiz değerleri dener. <code>HistGradientBoostingRegressor/Classifier</code> ise önce her sütunu en fazla 255 kutuya (bin) ayırır ve bölmeleri kutu sınırlarında arar; on binlerce satırda çok daha hızlıdır. Ayrıca eksik değerleri (NaN) kendisi yönetir ve kategorik sütunları one-hot yapmadan doğrudan kullanabilir.</p>')
H.append(py(KURYE + BOL + d('''
    from sklearn.ensemble import HistGradientBoostingRegressor
    from sklearn.metrics import mean_absolute_error

    print(X.shape, "| ortalama süre:", round(y.mean(), 1), "dk")
    taban = mean_absolute_error(y_te, [y_tr.mean()] * len(y_te))
    model = HistGradientBoostingRegressor(
        categorical_features=KATEGORIK,   # pandas category sütunları
        learning_rate=0.1, max_iter=500, max_leaf_nodes=15,
        early_stopping=True, validation_fraction=0.15, n_iter_no_change=10,
        random_state=0)
    model.fit(X_tr, y_tr)
    print("taban MAE:", round(taban, 2), "| HGB MAE:", round(mean_absolute_error(y_te, model.predict(X_te)), 2))
    print("durduğu tur:", model.n_iter_)
''')))
H.append('<p>Model ortalamaya göre hatayı azaltıyor ama mucize beklenmemeli: teslimat süresini trafik, hava ve restoranın o anki yoğunluğu da belirler ve bunlar veride yok. Erken durdurma 500 tur yerine birkaç on turda durdu; <code>n_iter_</code> bunu gösterir.</p>')
H.append('<h3>Önemli ayarlar</h3>')
H.append('<div class="tbl-wrap"><table><tr><th>Parametre</th><th>Varsayılan</th><th>Etkisi</th></tr>'
         '<tr><td><code>learning_rate</code></td><td>0.1</td><td>Her ağacın katkısını küçültür. Düşür (0.05) → daha çok tur, genelde daha iyi sonuç.</td></tr>'
         '<tr><td><code>max_iter</code></td><td>100</td><td>En fazla ağaç sayısı. Erken durdurmayla birlikte üst sınır gibi düşün.</td></tr>'
         '<tr><td><code>max_leaf_nodes</code></td><td>31</td><td>Ağaç başına yaprak; modelin karmaşıklığı. Asıl ayar budur.</td></tr>'
         '<tr><td><code>max_depth</code></td><td>None</td><td>Derinlik sınırı; genelde max_leaf_nodes yeterli.</td></tr>'
         '<tr><td><code>min_samples_leaf</code></td><td>20</td><td>Yapraktaki en az satır; büyütmek gürültüyü ezberlemeyi azaltır.</td></tr>'
         '<tr><td><code>l2_regularization</code></td><td>0</td><td>Yaprak değerlerini küçülten ceza.</td></tr>'
         '<tr><td><code>early_stopping</code></td><td>"auto"</td><td>10.000 satırdan büyük veride kendiliğinden açılır; <code>validation_fraction</code> ve <code>n_iter_no_change</code> ile birlikte çalışır.</td></tr>'
         '<tr><td><code>categorical_features</code></td><td>"from_dtype" (yeni sürümler)</td><td>Kategorik sütunlar; ad listesi ya da bool maske ver. Kategori sayısı <code>max_bins</code>\'i (255) aşmamalı.</td></tr>'
         '<tr><td><code>monotonic_cst</code></td><td>None</td><td>"adet artınca süre azalmasın" gibi iş kuralını modele zorlar.</td></tr></table></div>')
H.append('<div class="tip"><b>Ayar sırası</b>1) learning_rate=0.1 ve erken durdurmayla başla. 2) max_leaf_nodes (15–63) ve min_samples_leaf (20–200) ara. 3) l2_regularization ekle. 4) En sonda learning_rate\'i düşürüp max_iter\'i büyüt. Aramayı çapraz doğrulamayla yap (pipeline dersindeki HalvingGridSearchCV burada çok işe yarar).</div>')
H.append('<h3>XGBoost ve LightGBM karşılıkları</h3>')
H.append('<p>İş ilanlarında XGBoost ve LightGBM adları sık geçer. İkisi de aynı fikrin bağımsız, çok optimize uygulamalarıdır ve scikit-learn uyumlu sınıflar (<code>XGBRegressor</code>, <code>LGBMRegressor</code>) sunar; yani pipeline, çapraz doğrulama ve arama araçları aynen çalışır. Kavramlar birebir eşlenir, adlar değişir:</p>')
H.append('<div class="tbl-wrap"><table><tr><th>scikit-learn HGB</th><th>XGBoost</th><th>LightGBM</th></tr>'
         '<tr><td>learning_rate</td><td>learning_rate (eta)</td><td>learning_rate</td></tr>'
         '<tr><td>max_iter</td><td>n_estimators</td><td>n_estimators (num_iterations)</td></tr>'
         '<tr><td>max_leaf_nodes</td><td>max_leaves</td><td>num_leaves</td></tr>'
         '<tr><td>max_depth</td><td>max_depth (varsayılan 6)</td><td>max_depth (varsayılan -1, sınırsız)</td></tr>'
         '<tr><td>min_samples_leaf</td><td>min_child_weight (ağırlık toplamı, birebir değil)</td><td>min_child_samples</td></tr>'
         '<tr><td>l2_regularization</td><td>reg_lambda</td><td>reg_lambda (lambda_l2)</td></tr>'
         '<tr><td>max_bins</td><td>max_bin</td><td>max_bin</td></tr>'
         '<tr><td>n_iter_no_change</td><td>early_stopping_rounds</td><td>callbacks=[early_stopping(n)]</td></tr>'
         '<tr><td>categorical_features</td><td>enable_categorical=True + category dtype</td><td>category dtype ya da categorical_feature</td></tr>'
         '<tr><td>(yok)</td><td>subsample, colsample_bytree</td><td>bagging_fraction, feature_fraction</td></tr></table></div>')
H.append(pc('''
# pip install xgboost lightgbm
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor, early_stopping

xgb = XGBRegressor(n_estimators=500, learning_rate=0.1, max_leaves=15, tree_method="hist",
                   enable_categorical=True, early_stopping_rounds=10, random_state=0)
xgb.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)   # gerçekte ayrı bir doğrulama seti kullan
print(xgb.best_iteration)

lgbm = LGBMRegressor(n_estimators=500, learning_rate=0.1, num_leaves=15, random_state=0, verbose=-1)
lgbm.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], callbacks=[early_stopping(10, verbose=False)])
print(lgbm.best_iteration_)
'''))
H.append('<div class="warn"><b>Erken durdurmada test sızıntısı</b>Yukarıdaki kısa örnekte <code>eval_set</code> olarak test seti verildi; gerçek projede bu sızıntıdır, çünkü tur sayısını test setine bakarak seçersin. Eğitim verisinden ayrı bir doğrulama parçası ayır; HGB\'nin <code>validation_fraction</code> ayarı bunu senin yerine yapar.</div>')
H.append('<div class="note"><b>Gerçek işte</b>Kaggle tablo yarışmalarının ve bankaların kredi skor kartlarının büyük kısmı boosting modelleridir. Mülakatlarda sık sorulan sorular: "learning_rate ile n_estimators ilişkisi nedir?", "aşırı öğrenmeyi hangi ayarlarla kontrol edersin?", "kategorik sütunu nasıl verirsin?" Bu tabloyu bilmek üç soruyu da cevaplar. Kütüphane seçiminde ekip standardı belirleyicidir; scikit-learn HGB ek bağımlılık istemediği için iyi bir varsayılandır.</div>')
html = ''.join(H)

ns = {}; exec(KURYE + BOL, ns)
X, y = ns['X'], ns['y']
print(X.shape, round(float(y.mean()), 2), X['adet'].sum())
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
_m = HistGradientBoostingRegressor(categorical_features=ns['KATEGORIK'], learning_rate=0.1, max_iter=500, max_leaf_nodes=15, early_stopping=True, validation_fraction=0.15, n_iter_no_change=10, random_state=0).fit(ns['X_tr'], ns['y_tr'])
print('mae', mean_absolute_error(ns['y_te'], _m.predict(ns['X_te'])), _m.n_iter_, 'taban', mean_absolute_error(ns['y_te'], [ns['y_tr'].mean()] * len(ns['y_te'])))

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Boosting modelinde <code>learning_rate</code>\'i 0.1\'den 0.02\'ye düşürdün, diğer her şey aynı. Ne beklersin?',
    o=['Aynı başarı için yaklaşık 5 kat daha çok tur gerekir; erken durdurma daha geç tetiklenir',
       'Model daha hızlı eğitilir çünkü her ağaç daha küçük ve daha sığ kurulur',
       'Ağaçların yaprak sayısı öğrenme hızıyla orantılı olarak kendiliğinden azalır',
       'Hiçbir fark olmaz; learning_rate yalnız sınıflandırmada kullanılır'],
    a=0, why='learning_rate her ağacın katkısını ölçekler. Küçük adımlarla aynı yola gitmek daha çok adım ister; karşılığında genelleme çoğu zaman iyileşir. Ağaç yapısı max_leaf_nodes ile belirlenir.'))
ex.append(dict(t='mc', stage='Isınma', q='Lezzet Kurye verisinde 30 değerli <code>restoran</code> sütununu HistGradientBoosting\'e nasıl vermek en uygunudur?',
    o=['Restoran numarasını tamsayı olarak vermek; ağaç zaten uygun bölmeyi kendisi bulur',
       'category tipine çevirip categorical_features ile belirtmek; ağaç kategorileri gruplar',
       'One-hot ile 30 sütuna açmak zorunludur; boosting kategorik veri kabul etmez',
       'Sütunu tamamen atmak; 30 farklı değer ağaç modelleri için çok fazladır'],
    a=1, why='Tamsayı kodlama yapay bir sıra (7 < 12) varsayar. One-hot çalışır ama her bölmede tek kategoriyi ayırabildiği için verimsizdir. Doğal kategorik destek, kategori kümelerini tek bölmede ayırabilir. 255\'ten az kategori sınırı vardır.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Artıklarla düzeltme yapan "boosting" iskeleti. Bu kod ne yazdırır?',
    code=d('''
        gercek = [10.0, 20.0]
        tahmin = [15.0, 15.0]
        for _ in range(2):
            artik = [g - t for g, t in zip(gercek, tahmin)]
            tahmin = [t + 0.5 * a for t, a in zip(tahmin, artik)]
        print(tahmin)
    '''),
    o=['[11.25, 18.75]', '[12.5, 17.5]', '[10.0, 20.0]', '[13.75, 16.25]'], a=0,
    why='1. tur: artıklar -5, +5 → tahmin 12.5, 17.5. 2. tur: artıklar -2.5, +2.5 → 11.25, 18.75. Her tur kalan hatanın yarısını kapatır.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Kategorik sütunu category tipine çevirip erken durdurmalı HistGradientBoosting eğiten ve kaçıncı turda durduğunu yazdıran programın satırlarını sırala.</p>',
    lines=['import pandas as pd',
           'from sklearn.ensemble import HistGradientBoostingRegressor',
           'X = pd.DataFrame({"adet": list(range(60)) * 3, "arac": ["moto", "araba", "bisiklet"] * 60})',
           'y = X["adet"] * 0.5 + X["arac"].map({"moto": 20, "araba": 25, "bisiklet": 30})',
           'X["arac"] = X["arac"].astype("category")',
           'model = HistGradientBoostingRegressor(categorical_features=["arac"], early_stopping=True, n_iter_no_change=5, random_state=0)',
           'model.fit(X, y)',
           'print(model.n_iter_ < 100)'],
    expect='True\n', needs=['pandas'],
    hint='Hedef, arac metin hâlindeyken map ile hesaplanmalı; tip dönüşümü ondan sonra gelir.', why='y, metin değerlere map uygulayarak hesaplanır; sonra sütun category yapılır ve model eğitilir. Erken durdurma varsayılan 100 turdan önce durdurur.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w1', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p>Lezzet Kurye\'nin gerçek tablolarından özellik tablosu kur: <code>sure_ve_ozellik()</code> fonksiyonu yalnız <code>status == "teslim"</code> siparişleri alsın ve şu sütunlu DataFrame döndürsün: <code>order_id</code>, <code>saat</code> (placed_at saati), <code>adet</code> (lk_order_lines\'tan sipariş başına qty toplamı), <code>vehicle</code> (kuryenin aracı, category tipinde), <code>sure_dk</code> (delivered_at − placed_at, dakika, float).</p>',
    guide=['lk_orders\'ı oku ve teslim edilenleri süz.', 'placed_at ve delivered_at\'i pd.to_datetime ile çevir; farkın total_seconds() / 60 değeri süredir.', 'lk_order_lines\'ı order_id\'ye göre grupla, qty topla; lk_couriers\'tan vehicle\'ı courier_id ile birleştir.', 'vehicle sütununu astype("category") yap ve istenen sütunları döndür.'],
    example='import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-10-01 11:00:00"]))\nu = pd.to_datetime(pd.Series(["2024-10-01 11:42:30"]))\nprint(((u - t).dt.total_seconds() / 60).tolist(), t.dt.hour.tolist())\n',
    start='import veri\nimport pandas as pd\n\ndef sure_ve_ozellik():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    # TODO: teslim edilenleri süz, saat ve süreyi hesapla\n    # TODO: adet ve araç bilgisini birleştir\n    return None\n',
    sol=d('''
        import veri
        import pandas as pd

        def sure_ve_ozellik():
            o = veri.oku("lezzet_kurye", "lk_orders")
            s = veri.oku("lezzet_kurye", "lk_order_lines")
            k = veri.oku("lezzet_kurye", "lk_couriers")
            o = o[o["status"] == "teslim"].copy()
            t0 = pd.to_datetime(o["placed_at"])
            o["saat"] = t0.dt.hour
            o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - t0).dt.total_seconds() / 60
            adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()
            d = o.merge(adet, on="order_id").merge(k[["courier_id", "vehicle"]], on="courier_id")
            d["vehicle"] = d["vehicle"].astype("category")
            return d[["order_id", "saat", "adet", "vehicle", "sure_dk"]]
    '''),
    tests=f'''d = sure_ve_ozellik()
assert len(d) == {len(X)}, f"Teslim edilen {len(X)} sipariş bekleniyor, gelen {{len(d)}}"
assert list(d.columns) == ["order_id", "saat", "adet", "vehicle", "sure_dk"], "Sütun adları ve sırası"
assert round(float(d["sure_dk"].mean()), 2) == {round(float(y.mean()), 2)}, "Ortalama teslim süresi {round(float(y.mean()), 2)} dk olmalı"
assert int(d["adet"].sum()) == {int(X['adet'].sum())}, "Toplam ürün adedi tutmalı"
assert str(d["vehicle"].dtype) == "category", "vehicle category tipinde olmalı"
assert round(float(d.groupby("vehicle", observed=True)["sure_dk"].mean()["bisiklet"]), 1) > round(float(d.groupby("vehicle", observed=True)["sure_dk"].mean()["motosiklet"]), 1), "Bisikletli teslimatlar motosikletten uzun sürüyor"
''',
    hints=['Süre: (bitiş − başlangıç).dt.total_seconds() / 60', 's.groupby("order_id")["qty"].sum() sipariş başına adedi verir; reset_index ile birleştirilebilir tabloya çevir.', 'Kurye tablosundan yalnız courier_id ve vehicle sütunlarını alarak merge et.'],
    why='Model başarısının çoğu özellik mühendisliğinden gelir. Zaman damgalarından süre ve saat çıkarmak, satır tablosunu sipariş düzeyine toplamak ve boyut tablosundan bilgi eklemek en sık yapılan üç adımdır.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w2', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p><code>hgb_egit(X_tr, y_tr, X_te, y_te)</code> yaz: <code>HistGradientBoostingRegressor</code> kur (<code>categorical_features=KATEGORIK</code>, <code>learning_rate=0.1</code>, <code>max_iter=500</code>, <code>max_leaf_nodes=15</code>, <code>early_stopping=True</code>, <code>validation_fraction=0.15</code>, <code>n_iter_no_change=10</code>, <code>random_state=0</code>), eğit ve <code>(model, test_mae)</code> döndür (MAE 2 basamak). Veri gerçek Lezzet Kurye tablolarından hazır geliyor.</p>',
    guide=['HistGradientBoostingRegressor\'ı ve mean_absolute_error\'ı içe aktar.', 'Parametreleri görevdeki gibi vererek modeli kur ve fit et.', 'Test tahmininin MAE değerini round(…, 2) ile döndür.'],
    example='from sklearn.ensemble import HistGradientBoostingRegressor\nimport numpy as np\nX = np.arange(40).reshape(-1, 1)\nm = HistGradientBoostingRegressor(max_iter=30).fit(X, X.ravel() * 2)\nprint(m.n_iter_)\n',
    start=KURYE + BOL + '\ndef hgb_egit(X_tr, y_tr, X_te, y_te):\n    # TODO: modeli kur, eğit, MAE hesapla\n    pass\n',
    sol=KURYE + BOL + d('''
        from sklearn.ensemble import HistGradientBoostingRegressor
        from sklearn.metrics import mean_absolute_error

        def hgb_egit(X_tr, y_tr, X_te, y_te):
            model = HistGradientBoostingRegressor(
                categorical_features=KATEGORIK, learning_rate=0.1, max_iter=500, max_leaf_nodes=15,
                early_stopping=True, validation_fraction=0.15, n_iter_no_change=10, random_state=0)
            model.fit(X_tr, y_tr)
            return model, round(mean_absolute_error(y_te, model.predict(X_te)), 2)
    '''),
    tests=d('''
        from sklearn.metrics import mean_absolute_error
        model, mae = hgb_egit(X_tr, y_tr, X_te, y_te)
        taban = mean_absolute_error(y_te, [y_tr.mean()] * len(y_te))
        assert mae < taban - 0.3, f"HGB, ortalama tahmininden ({taban:.2f} dk) belirgin iyi olmalı; gelen {mae}"
        assert model.n_iter_ < 500, "Erken durdurma 500 turdan önce durdurmalı"
        assert model.is_categorical_ is not None and int(model.is_categorical_.sum()) == 4, "4 kategorik sütun tanınmalı"
    '''),
    hints=['Tüm ayarlar kurucu (constructor) parametresidir.', 'mean_absolute_error(y_te, model.predict(X_te))'],
    why='Erken durdurma, eğitim verisinin %15\'ini doğrulama için ayırır ve 10 tur iyileşme yoksa durur. is_categorical_ hangi sütunların kategorik işlendiğini doğrulamanı sağlar.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w3', stage='Kendin yaz', diff=2,
    q='<p>Ekip XGBoost\'tan scikit-learn HGB\'ye geçiyor. <code>xgb_den_hgb(p)</code> yaz: XGBoost parametre sözlüğünü <code>(hgb_parametreleri, karsiligi_yok)</code> demetine çevirsin. Eşleme: <code>learning_rate</code> ya da <code>eta</code> → <code>learning_rate</code>; <code>n_estimators</code> → <code>max_iter</code>; <code>max_leaves</code> → <code>max_leaf_nodes</code>; <code>max_depth</code> → <code>max_depth</code>; <code>reg_lambda</code> → <code>l2_regularization</code>; <code>max_bin</code> → <code>max_bins</code>; <code>early_stopping_rounds</code> → <code>n_iter_no_change</code> ve ek olarak <code>early_stopping=True</code>. Karşılığı olmayan anahtarlar alfabetik sıralı listede dönsün. XGBoost\'ta <code>max_leaves=0</code> "sınırsız" demektir: karşılığı <code>None</code>.</p>',
    start='def xgb_den_hgb(p):\n    pass\n',
    sol=d('''
        ESLEME = {"learning_rate": "learning_rate", "eta": "learning_rate", "n_estimators": "max_iter",
                  "max_leaves": "max_leaf_nodes", "max_depth": "max_depth", "reg_lambda": "l2_regularization",
                  "max_bin": "max_bins", "early_stopping_rounds": "n_iter_no_change"}

        def xgb_den_hgb(p):
            hgb, yok = {}, []
            for k, v in p.items():
                if k not in ESLEME:
                    yok.append(k)
                    continue
                if k == "max_leaves" and v == 0:
                    v = None
                hgb[ESLEME[k]] = v
                if k == "early_stopping_rounds":
                    hgb["early_stopping"] = True
            return hgb, sorted(yok)
    '''),
    tests=d('''
        h, y = xgb_den_hgb({"eta": 0.05, "n_estimators": 800, "max_leaves": 31, "subsample": 0.8, "colsample_bytree": 0.7})
        assert h == {"learning_rate": 0.05, "max_iter": 800, "max_leaf_nodes": 31}, f"Gelen {h}"
        assert y == ["colsample_bytree", "subsample"], "Karşılığı olmayanlar alfabetik"
        h2, _ = xgb_den_hgb({"early_stopping_rounds": 20, "reg_lambda": 1.0, "max_bin": 128, "max_leaves": 0})
        assert h2 == {"n_iter_no_change": 20, "early_stopping": True, "l2_regularization": 1.0, "max_bins": 128, "max_leaf_nodes": None}, f"Gelen {h2}"
        assert xgb_den_hgb({}) == ({}, [])
    '''),
    hints=['Eşlemeyi bir sözlükte tut; eta ve learning_rate aynı hedefe gider.', 'early_stopping_rounds gördüğünde iki anahtar birden yaz.'],
    why='Kavramlar ortak olduğu için geçiş çoğunlukla ad değişikliğidir; satır ve sütun örnekleme (subsample, colsample_bytree) gibi bazı ayarların HGB\'de doğrudan karşılığı yoktur ve raporlanmalıdır.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w4', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p><code>tur_sayilari(X_tr, y_tr, oranlar)</code> yaz: her <code>learning_rate</code> değeri için <code>HistGradientBoostingRegressor(categorical_features=KATEGORIK, learning_rate=oran, max_iter=1000, max_leaf_nodes=15, early_stopping=True, n_iter_no_change=10, random_state=0)</code> eğitsin ve <code>{oran: model.n_iter_}</code> sözlüğü döndürsün. Gerçek veride küçük öğrenme hızının daha çok tura ihtiyaç duyduğunu göreceksin.</p>',
    start=KURYE + BOL + '\ndef tur_sayilari(X_tr, y_tr, oranlar):\n    pass\n',
    sol=KURYE + BOL + 'from sklearn.ensemble import HistGradientBoostingRegressor\n\ndef tur_sayilari(X_tr, y_tr, oranlar):\n    sonuc = {}\n    for oran in oranlar:\n        m = HistGradientBoostingRegressor(categorical_features=KATEGORIK, learning_rate=oran, max_iter=1000,\n                                          max_leaf_nodes=15, early_stopping=True, n_iter_no_change=10, random_state=0)\n        sonuc[oran] = int(m.fit(X_tr, y_tr).n_iter_)\n    return sonuc\n',
    tests=d('''
        t = tur_sayilari(X_tr, y_tr, [0.3, 0.03])
        assert set(t) == {0.3, 0.03}, "Her oran için bir giriş olmalı"
        assert t[0.03] > t[0.3], f"Küçük öğrenme hızı daha çok tur gerektirmeli: {t}"
        assert all(n < 1000 for n in t.values()), "Erken durdurma devrede olmalı"
    '''),
    hints=['Döngüde her oran için yeni bir model kur.', 'Eğitilmiş modelin n_iter_ alanı gerçekleşen tur sayısıdır.'],
    why='Öğrenme hızı ile tur sayısı ters orantılı çalışır; bu yüzden ikisini birlikte ayarlarsın. Erken durdurma doğru tur sayısını senin yerine bulur.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w5', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
    q='<p>Hatayı bul ve düzelt. <code>model_kur(df)</code> teslim süresini tahmin eden modeli eğitiyor ama <code>ValueError</code> veriyor: kategorik sütunlar metin hâlinde kalmış. Düzeltince de model hep <code>max_iter</code> kadar tur dönüyor; erken durdurma çalışmıyor (veri 10.000 satırdan küçük olduğu için "auto" kapalı kalıyor). İki sorunu düzelt; fonksiyon eğitilmiş modeli döndürsün.</p>',
    start=d('''
        import pandas as pd
        from sklearn.ensemble import HistGradientBoostingRegressor

        def model_kur(df):
            X = df[["adet", "arac", "mutfak"]].copy()
            model = HistGradientBoostingRegressor(categorical_features=["arac", "mutfak"],
                                                  max_iter=300, n_iter_no_change=5, random_state=0)
            return model.fit(X, df["sure"])
    '''),
    sol=d('''
        import pandas as pd
        from sklearn.ensemble import HistGradientBoostingRegressor

        def model_kur(df):
            X = df[["adet", "arac", "mutfak"]].copy()
            for c in ["arac", "mutfak"]:
                X[c] = X[c].astype("category")
            model = HistGradientBoostingRegressor(categorical_features=["arac", "mutfak"], early_stopping=True,
                                                  max_iter=300, n_iter_no_change=5, random_state=0)
            return model.fit(X, df["sure"])
    '''),
    tests=d('''
        import numpy as np
        rng = np.random.default_rng(0)
        n = 600
        df = pd.DataFrame({"adet": rng.integers(1, 6, n), "arac": rng.choice(["moto", "araba"], n),
                           "mutfak": rng.choice(["pizza", "döner", "tatlı"], n)})
        df["sure"] = 20 + df["adet"] * 2 + (df["arac"] == "araba") * 5 + rng.normal(0, 3, n)
        m = model_kur(df)
        assert m.n_iter_ < 300, f"Erken durdurma açık olmalı; model {m.n_iter_} tur döndü"
        assert int(m.is_categorical_.sum()) == 2, "İki kategorik sütun tanınmalı"
    '''),
    hints=['HGB metin sütunlarını sayıya çeviremez; pandas category tipine dönüştür.', 'early_stopping="auto" yalnız 10.000 satırdan büyük veride açılır; açıkça True ver.'],
    why='Doğal kategorik destek, sütunun category tipinde (ya da önceden sayıya kodlanmış) olmasını ister. n_iter_no_change tek başına yetmez; early_stopping açık değilse hiç kullanılmaz.'))
ex.append(dict(t='code', id='ml-regresyon-siniflandirma-w6', stage='Meydan okuma', diff=3, needs=['pandas'],
    q='<p>İş kuralı: "Sepetteki ürün adedi artınca tahmini teslim süresi <b>azalmamalı</b>." <code>monoton_model(X_tr, y_tr)</code> yaz: <code>monotonic_cst={"adet": 1}</code> ile HGB kur (diğer ayarlar: <code>categorical_features=KATEGORIK</code>, <code>max_leaf_nodes=15</code>, <code>early_stopping=True</code>, <code>random_state=0</code>) ve eğitilmiş modeli döndür. Sonra <code>monoton_mu(model, X, sutun, degerler)</code> yaz: X\'in her satırı için sütunu sırayla verilen değerlere sabitleyip tahmin etsin; <b>her satırda</b> tahminler azalmayan sıradaysa (1e-9 toleransla) <code>True</code> döndürsün.</p>',
    start=KURYE + BOL + '\ndef monoton_model(X_tr, y_tr):\n    pass\n\ndef monoton_mu(model, X, sutun, degerler):\n    pass\n',
    sol=KURYE + BOL + d('''
        import numpy as np
        from sklearn.ensemble import HistGradientBoostingRegressor

        def monoton_model(X_tr, y_tr):
            m = HistGradientBoostingRegressor(categorical_features=KATEGORIK, monotonic_cst={"adet": 1},
                                              max_leaf_nodes=15, early_stopping=True, random_state=0)
            return m.fit(X_tr, y_tr)

        def monoton_mu(model, X, sutun, degerler):
            sutunlar = []
            for v in degerler:
                kopya = X.copy()
                kopya[sutun] = v
                sutunlar.append(model.predict(kopya))
            tahmin = np.column_stack(sutunlar)
            return bool(np.all(np.diff(tahmin, axis=1) >= -1e-9))
    '''),
    tests=d('''
        import numpy as np
        class Artan:
            def predict(self, X):
                return X["adet"].to_numpy() * 2.0
        class Bozuk:
            def predict(self, X):
                return np.where(X["adet"].to_numpy() == 3, 0.0, 10.0)
        ornek = X_te.head(20)
        assert monoton_mu(Artan(), ornek, "adet", [1, 2, 3]) is True
        assert monoton_mu(Bozuk(), ornek, "adet", [1, 2, 3, 4]) is False, "3\\'te düşen tahmin yakalanmalı"
        m = monoton_model(X_tr, y_tr)
        assert monoton_mu(m, X_te.head(200), "adet", list(range(1, 11))), "Kısıtlı modelde süre adetle azalmamalı"
        assert len(ornek) == 20 and ornek["adet"].dtype.kind in "iu", "monoton_mu X\\'i değiştirmemeli"
    '''),
    hints=['monotonic_cst sözlüğünde 1 artan, -1 azalan, 0 kısıtsız demektir.', 'Her değer için kopyada sütunu sabitle, tahmin sütunlarını np.column_stack ile yan yana koy.', 'np.diff(tahmin, axis=1) satır içindeki ardışık farkları verir; hepsi ≥ -1e-9 olmalı.'],
    why='Monoton kısıtlar, modeli iş mantığıyla uyumlu tutar ve düzenleyiciler (kredi skor kartı gibi) tarafından sıkça istenir. Bu denetim aslında bir ICE testidir: her satırın eğrisi artan olmalı.'))

faq = [
    dict(q='HistGradientBoosting mi, XGBoost/LightGBM mi kullanmalıyım?', a='Ek bağımlılık istemediğin ve verin yüz binlerce satır civarında olduğu sürece HGB çok iyi bir varsayılandır. Çok büyük veri, GPU eğitimi, özel kayıp fonksiyonları ya da ekip standardı gerekiyorsa XGBoost/LightGBM seç. Üçünün sonuçları iyi ayarlandığında genellikle birbirine yakındır; farkı veri ve özellikler yaratır.'),
    dict(q='Boosting modeline ölçekleme (StandardScaler) gerekir mi?', a='Hayır. Ağaçlar eşik karşılaştırmasıyla böler; sütunun ölçeği sonucu değiştirmez. Eksik değerler de HGB\'de doldurulmadan kullanılabilir. Pipeline\'da yalnızca kategorik dönüşüm ve özellik üretimi kalır.'),
]
mistakes = [dict(bad='model = HistGradientBoostingRegressor(n_iter_no_change=10)  # 5 bin satır', good='model = HistGradientBoostingRegressor(early_stopping=True, n_iter_no_change=10)', why='early_stopping="auto" yalnız 10.000 satırın üstünde açılır; küçük veride açıkça True ver.')]
emit(dict(id='ml-regresyon-siniflandirma', min=28, html=html, ex=ex, faq=faq, mistakes=mistakes), 'HistGradientBoosting ayarları, kategorik destek ve XGBoost/LightGBM eşlemesi (AUDIT Ekle-8)')
