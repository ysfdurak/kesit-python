import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2gen')
from x2lib import *
import os; os.environ['PP_VERI'] = '/home/claude/py/data'; sys.path.insert(0, '/home/claude/py/tools/pylib')

VERI = d('''
    import veri
    import pandas as pd

    def ik_verisi():
        e = veri.oku("pusula_ik", "ik_employees")
        p = veri.oku("pusula_ik", "ik_positions")
        d = e.merge(p[["position_id", "level"]], on="position_id")
        d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)
        d["level"] = d["level"].astype(float)
        y = (d["term_type"] == "gönüllü").astype(int)
        X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]
        return X, y, d["gender"]
''')
MODEL = d('''
    from sklearn.model_selection import train_test_split
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import OneHotEncoder
    from sklearn.pipeline import Pipeline
    from sklearn.linear_model import LogisticRegression

    X, y, cinsiyet = ik_verisi()
    X_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(
        X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)
    kategorik = ["education", "city", "work_mode", "hire_source"]
    on_isleme = ColumnTransformer(
        [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")
    model = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])
    model.fit(X_tr, y_tr)
''')

H = []
H.append('<h2>Derinleş: modeli açıklamak, adil olup olmadığını ölçmek, aramayı hızlandırmak</h2>')
H.append('<p>Skor tablosu "model ne kadar iyi?" sorusunu cevaplar; iş ekibi ise "neden bu kişiyi riskli buldu, kimde yanılıyor, herkese eşit davranıyor mu?" diye sorar. Bu bölümde Pusula İK\'nın gerçek çalışan verisiyle (<code>pusula_ik</code>, 2199 çalışan) <b>gönüllü ayrılma</b> modeli kuracak, sonra onu açıklayacak ve denetleyeceksin. Etiket: <code>term_type == "gönüllü"</code> (yaklaşık %27). Cinsiyet modele <b>özellik olarak verilmiyor</b>; yalnızca adalet denetiminde kullanılıyor.</p>')
H.append(py(VERI + '\n' + MODEL + d('''
    from sklearn.metrics import roc_auc_score
    print("test ROC-AUC:", round(roc_auc_score(y_te, model.predict_proba(X_te)[:, 1]), 3))
''')))
H.append('<p>AUC\'nin 0.6 civarında olması gerçekçi: işe girişte bilinen birkaç özellik, kimin ayrılacağını ancak kısmen açıklar. Böyle bir modeli canlıya almadan önce aşağıdaki dört soruyu sormak zorundasın.</p>')
H.append('<h3>1) Hangi özellik önemli? Permutation importance</h3>')
H.append('<p>Fikir: bir sütunu karıştır (satırlar arasında rastgele yer değiştir), modeli yeniden eğitmeden skoru ölç. Skor ne kadar düşerse model o sütuna o kadar dayanıyordur. Ağaçların <code>feature_importances_</code> değerinden farkı: <b>test verisinde</b> ve seçtiğin metrikle ölçülür, her model türünde çalışır ve çok değerli (yüksek kardinaliteli) sütunlara karşı yanlı değildir. Pipeline\'a ham sütunları verdiğin için önem de ham sütun düzeyinde çıkar.</p>')
H.append(py('''
from sklearn.inspection import permutation_importance

r = permutation_importance(model, X_te, y_te, scoring="roc_auc", n_repeats=5, random_state=0)
onem = pd.Series(r.importances_mean, index=X_te.columns).sort_values(ascending=False)
print(onem.round(4))
'''))
H.append('<div class="warn"><b>İlişkili sütun tuzağı</b>İki sütun aynı bilgiyi taşıyorsa (pozisyon seviyesi ve maaş bandı gibi) birini karıştırınca model diğerinden telafi eder ve ikisi de "önemsiz" görünür. Önem değeri nedensellik de değildir: "seviyeyi yükseltirsek çalışan kalır" sonucu buradan çıkmaz.</div>')
H.append('<h3>2) Etki hangi yönde? PDP ve ICE</h3>')
H.append('<p>Kısmi bağımlılık (partial dependence, PDP) tek bir özelliği sırayla her değere sabitler, tüm satırlar için tahmin alır ve ortalamasını çizer: "diğer her şey veri gibiyken seviye 1\'den 6\'ya çıkınca ortalama ayrılma olasılığı nasıl değişir?" ICE (individual conditional expectation) aynı hesabı ortalama almadan, <b>her satır için ayrı çizgi</b> olarak gösterir; çizgiler birbirine paralel değilse etkileşim vardır.</p>')
H.append(py('''
from sklearn.inspection import partial_dependence

pdp = partial_dependence(model, X_tr, ["level"], kind="both")
print("ızgara:", pdp["grid_values"][0])
print("PDP   :", pdp["average"][0].round(3))
print("ICE boyutu:", pdp["individual"].shape)    # (çıktı, satır, ızgara)
'''))
H.append('<p>Grafiği <code>PartialDependenceDisplay.from_estimator(model, X_tr, ["level"], kind="both")</code> ile çizersin. Tamsayı sütunlar için scikit-learn uyarı verir; sütunu önceden <code>float</code> yapmamızın nedeni bu. SHAP değerleri ise her tahmini özellik katkılarına böler ("bu çalışanın riskini en çok seviyesi artırdı"); <code>pip install shap</code> ile kendi bilgisayarında dene:</p>')
H.append(pc('''
import shap
ozellik = model[:-1].transform(X_te)
aciklayici = shap.LinearExplainer(model[-1], ozellik)
degerler = aciklayici(ozellik)
shap.plots.beeswarm(degerler)        # genel tablo
shap.plots.waterfall(degerler[0])    # tek çalışan için açıklama
'''))
H.append('<h3>3) Kimde yanılıyor? Hata dilimi analizi</h3>')
H.append('<p>Ortalama hata, küçük bir segmentte çok kötü çalışmayı gizler. Test tahminlerini segmentlere (şehir, çalışma biçimi, işe alım kaynağı) göre grupla; her segment için satır sayısı ve hata oranı çıkar, en kötüden iyiye sırala. Çok küçük segmentleri (ör. 30 satırdan az) ayrı işaretle; orada gördüğün fark gürültü olabilir.</p>')
H.append(py('''
tahmin = (model.predict_proba(X_te)[:, 1] >= 0.3).astype(int)
dilim = X_te.assign(hata=(tahmin != y_te.to_numpy()))
tablo = dilim.groupby("city")["hata"].agg(n="size", hata_orani="mean")
print(tablo.sort_values("hata_orani", ascending=False).round(3))
'''))
H.append('<h3>4) Herkese eşit mi? Grup bazında metrikler</h3>')
H.append('<div class="tbl-wrap"><table><tr><th>Metrik</th><th>Grup başına hesap</th><th>İK örneğinde soru</th></tr>'
         '<tr><td>Seçim oranı (demographic parity)</td><td>tahmin = 1 oranı</td><td>Kadınların ne kadarı "riskli" işaretleniyor?</td></tr>'
         '<tr><td>FPR (yanlış alarm)</td><td>FP / (FP + TN)</td><td>Kalacak çalışanların ne kadarına gereksiz müdahale ediliyor?</td></tr>'
         '<tr><td>FNR (kaçırma, equal opportunity)</td><td>FN / (FN + TP)</td><td>Ayrılacak çalışanların ne kadarı gözden kaçıyor?</td></tr></table></div>')
H.append(py('''
def oranlar(s):
    fp = ((s.tahmin == 1) & (s.y == 0)).sum(); tn = ((s.tahmin == 0) & (s.y == 0)).sum()
    fn = ((s.tahmin == 0) & (s.y == 1)).sum(); tp = ((s.tahmin == 1) & (s.y == 1)).sum()
    return pd.Series({"secim": s.tahmin.mean(), "fpr": fp / (fp + tn), "fnr": fn / (fn + tp)})

grup = pd.DataFrame({"y": y_te.to_numpy(), "tahmin": tahmin, "cinsiyet": g_te.to_numpy()})
print(grup.groupby("cinsiyet")[["y", "tahmin"]].apply(oranlar).round(3))
'''))
H.append('<p>Cinsiyeti modelden çıkarmak adaleti garanti etmez: şehir, eğitim ya da pozisyon seviyesi cinsiyetle ilişkiliyse (vekil değişken, proxy) model farkı yine öğrenir. Bu yüzden ölçmeden "adil" denmez. Farkı gördüğünde seçeneklerin: eşiği gruplara göre değil süreç düzeyinde gözden geçirmek, veriyi incelemek, sonucu model kartına yazmak ve kararı insan incelemesine bağlamak. Bu bulguları dersin önceki bölümündeki <b>model kartına</b> "Açıklanabilirlik" ve "Adalet denetimi" başlıklarıyla ekle.</p>')
H.append('<div class="note"><b>Gerçek işte</b>İK, kredi ve sağlık gibi alanlarda model kararları kişileri doğrudan etkiler; KVKK ve kurum içi etik kurullar "bu kararı nasıl verdiniz?" diye sorar. Ekipler bu yüzden her sürümde PDP, permutation importance, dilim tablosu ve grup metriklerini otomatik rapora koyar. Fairlearn kütüphanesi (<code>MetricFrame</code>) bu tabloyu tek satırda üretir.</div>')
H.append('<h3>Arama bütçesi: Halving, Optuna ve erken durdurma</h3>')
H.append('<p>GridSearchCV her adayı tüm veriyle eğitir. <b>HalvingGridSearchCV</b> ardışık yarılama (successive halving) yapar: ilk turda tüm adaylar az kaynakla (az satırla) yarışır, en iyi 1/factor kadarı bir sonraki tura daha çok kaynakla geçer. Kötü adaylara bütçe harcanmaz.</p>')
H.append(py('''
from sklearn.experimental import enable_halving_search_cv  # deneysel API'yi açar
from sklearn.model_selection import HalvingGridSearchCV

izgara = {"model__C": [0.1, 1.0], "model__class_weight": [None, "balanced"]}
arama = HalvingGridSearchCV(model, izgara, factor=2, scoring="roc_auc", cv=3, random_state=0)
arama.fit(X_tr, y_tr)
print("aday sayıları :", list(arama.n_candidates_))
print("kaynak (satır):", list(arama.n_resources_))
print("en iyi        :", arama.best_params_)
'''))
H.append('<p>Izgara büyüdükçe rastgele ya da Bayesçi arama daha verimlidir. Optuna önceki denemelerin sonucuna bakarak umut verici bölgeden yeni değer önerir ve kötü giden denemeleri erkenden budar (<code>pip install optuna</code>):</p>')
H.append(pc('''
import optuna
from sklearn.model_selection import cross_val_score

def amac(trial):
    C = trial.suggest_float("C", 1e-3, 100, log=True)
    agirlik = trial.suggest_categorical("class_weight", [None, "balanced"])
    model.set_params(model__C=C, model__class_weight=agirlik)
    return cross_val_score(model, X_tr, y_tr, cv=3, scoring="roc_auc").mean()

calisma = optuna.create_study(direction="maximize")
calisma.optimize(amac, n_trials=40, timeout=120)   # bütçe: deneme sayısı ve süre
print(calisma.best_params)
'''))
H.append('<p><b>Erken durdurma</b> (early stopping) ise tek bir modelin içinde bütçe tasarrufudur: boosting ya da sinir ağı her turda doğrulama kaybını ölçer, <code>n_iter_no_change</code> tur boyunca iyileşme yoksa durur (HistGradientBoosting\'de <code>early_stopping=True</code>). Pratik kural: arama bütçesini (deneme sayısı × kat sayısı × eğitim süresi) önceden yaz, kaba aramayla başla, iyi bölgeyi daralt.</p>')
html = ''.join(H)

# beklenen değerler
ns = {}
exec(VERI + MODEL, ns)
import numpy as np
X, y = ns['X'], ns['y']
df = X.assign(y=y.to_numpy(), tahmin=(X['level'] == 1).astype(int).to_numpy())
df['hata'] = df['y'] != df['tahmin']
def _dilim(df, seg, en_az):
    t = df.groupby(seg)['hata'].agg(['size', 'mean'])
    r = [(str(k), int(n), round(float(m), 3)) for k, (n, m) in t.iterrows() if n >= en_az]
    return sorted(r, key=lambda x: (-x[2], x[0]))
DL_CITY = _dilim(df, 'city', 50); DL_SRC = _dilim(df, 'hire_source', 30)
def _grup(y, t, g):
    out = {}
    for k in sorted(set(g)):
        yy = [a for a, b in zip(y, g) if b == k]; tt = [a for a, b in zip(t, g) if b == k]
        fp = sum(1 for a, b in zip(yy, tt) if a == 0 and b == 1); tn = sum(1 for a, b in zip(yy, tt) if a == 0 and b == 0)
        fn = sum(1 for a, b in zip(yy, tt) if a == 1 and b == 0); tp = sum(1 for a, b in zip(yy, tt) if a == 1 and b == 1)
        out[k] = {'secim': round(sum(tt) / len(tt), 3), 'fpr': round(fp / (fp + tn), 3), 'fnr': round(fn / (fn + tp), 3)}
    return out
GR_REAL = _grup(list(df['y']), list(df['tahmin']), list(ns['cinsiyet']))
print(DL_CITY, DL_SRC, GR_REAL)

KURAL = VERI + d('''
    X, y, cinsiyet = ik_verisi()
    # Eski kural tabanlı sistem: seviye 1 olanları "ayrılır" diye işaretliyor
    tahmin = (X["level"] == 1).astype(int)
''')

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Permutation importance hesaplanırken bir sütunun değerleri karıştırılıyor. Neden bu ölçüm <b>test</b> verisinde yapılmalı?',
    o=['Eğitim verisinde sütun karıştırmak scikit-learn\'de hata verir, bu yüzden test seti zorunludur',
       'Test verisinde model, ezberlediği gürültüye değil genellenen ilişkilere ne kadar dayandığını gösterir',
       'Test verisi daha küçük olduğu için hesap daha hızlıdır, sonuç ise aynıdır',
       'Karıştırmadan sonra model her sütun için yeniden eğitildiğinden ayrı bir veri parçası gerekir'],
    a=1, why='Eğitimde ölçülen önem, aşırı öğrenilmiş (ezberlenmiş) ilişkileri de önemli gösterir. Model yeniden eğitilmez; yalnızca karıştırılmış veriyle skor ölçülür. Eğitim verisinde de çalışır, ama anlamı farklıdır.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Ardışık yarılamada (successive halving) her turdaki aday ve kaynak sayısı. Bu kod ne yazdırır?',
    code=d('''
        aday, kaynak, factor = 27, 20, 3
        turlar = []
        while aday >= 1:
            turlar.append((aday, kaynak))
            if aday == 1:
                break
            aday //= factor
            kaynak *= factor
        print(turlar)
    '''),
    o=['[(27, 20), (9, 60), (3, 180), (1, 540)]', '[(27, 20), (9, 60), (3, 180)]', '[(27, 20), (13, 40), (6, 80), (3, 160), (1, 320)]', '[(27, 540), (9, 180), (3, 60), (1, 20)]'], a=0,
    why='Her turda adaylar factor\'e bölünür, aday başına kaynak factor ile çarpılır: 27→9→3→1 aday, 20→60→180→540 satır. Toplam bütçe her turda yaklaşık sabittir (27×20 ≈ 9×60).'))
ex.append(dict(t='predict', stage='Kodu oku', q='İki grup için FPR ve FNR. Bu kod ne yazdırır?',
    code=d('''
        y     = [1, 0, 0, 1, 0, 1, 0, 0]
        tahm  = [1, 1, 0, 0, 0, 1, 1, 0]
        grup  = ["A", "A", "A", "A", "B", "B", "B", "B"]
        for g in ("A", "B"):
            s = [(a, t) for a, t, k in zip(y, tahm, grup) if k == g]
            fp = sum(1 for a, t in s if a == 0 and t == 1)
            neg = sum(1 for a, t in s if a == 0)
            fn = sum(1 for a, t in s if a == 1 and t == 0)
            poz = sum(1 for a, t in s if a == 1)
            print(g, fp / neg, fn / poz)
    '''),
    o=['A 0.5 0.5\nB 0.3333333333333333 0.0', 'A 0.5 0.5\nB 0.5 0.0', 'A 0.25 0.25\nB 0.25 0.0', 'A 1.0 0.5\nB 0.3333333333333333 0.0'], a=0,
    why='A: negatifler (y=0) 2 tane, biri yanlış alarm → FPR 0.5; pozitifler 2, biri kaçmış → FNR 0.5. B: 3 negatiften 1 alarm → 1/3; tek pozitif yakalanmış → 0.0.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w1', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p>PDP\'yi elle hesapla. <code>pdp_elle(model, X, sutun, degerler)</code>: her değer için X\'in <b>kopyasında</b> <code>sutun</code>\'u o değere sabitle, <code>model.predict_proba(...)[:, 1]</code> ortalamasını al; ortalamaları 4 basamağa yuvarlanmış liste olarak döndür. Testler sahte bir modelle ve gerçek İK modeliyle (sklearn\'ün <code>partial_dependence</code> sonucu) karşılaştırır.</p>',
    guide=['Sonuç için boş liste aç.', 'Her değerde X.copy() al ve sütunu o değere ata.', 'predict_proba(...)[:, 1].mean() hesapla, round(…, 4) ile listeye ekle.', 'Listeyi döndür.'],
    example='import pandas as pd\ndf = pd.DataFrame({"a": [1, 2], "b": [3, 4]})\nkopya = df.copy()\nkopya["a"] = 10\nprint(kopya["a"].tolist(), df["a"].tolist())\n',
    start=VERI + MODEL + '\ndef pdp_elle(model, X, sutun, degerler):\n    sonuc = []\n    # TODO: her değer için kopyada sütunu sabitle, ortalama olasılığı ekle\n    return sonuc\n',
    sol=VERI + MODEL + '\ndef pdp_elle(model, X, sutun, degerler):\n    sonuc = []\n    for v in degerler:\n        kopya = X.copy()\n        kopya[sutun] = v\n        sonuc.append(round(float(model.predict_proba(kopya)[:, 1].mean()), 4))\n    return sonuc\n',
    tests=d('''
        import numpy as np
        class Sahte:
            def predict_proba(self, X):
                p = (X["a"] * 0.1 + X["b"] * 0.0).to_numpy()
                return np.column_stack([1 - p, p])
        df = pd.DataFrame({"a": [1.0, 2.0, 3.0], "b": [5.0, 6.0, 7.0]})
        assert pdp_elle(Sahte(), df, "a", [0.0, 5.0]) == [0.0, 0.5], "a sabitlenince olasılık 0.1*a olmalı"
        assert df["a"].tolist() == [1.0, 2.0, 3.0], "Orijinal X değişmemeli: X.copy() kullan"
        from sklearn.inspection import partial_dependence
        ref = partial_dependence(model, X_tr, ["level"], kind="average")
        izgara = [float(v) for v in ref["grid_values"][0]]
        elle = pdp_elle(model, X_tr, "level", izgara)
        assert np.allclose(elle, ref["average"][0], atol=1e-4), f"sklearn PDP ile aynı olmalı: {ref['average'][0].round(4)}"
        assert elle[0] > elle[-1], "Gerçek veride seviye arttıkça ortalama ayrılma olasılığı düşüyor"
    '''),
    hints=['PDP = sütun sabitken tahminlerin ortalaması.', 'kopya = X.copy(); kopya[sutun] = v; model.predict_proba(kopya)[:, 1].mean()', 'round(float(...), 4) ile listeye ekle.'],
    why='scikit-learn\'ün "brute" yöntemi de tam olarak bunu yapar. Kopya almazsan orijinal veriyi bozarsın ve sonraki her hesap yanlış veriyle yapılır.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w2', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p>Adalet denetimi için <code>grup_metrikleri(y, tahmin, grup)</code> yaz: üç eşit uzunlukta liste (ya da seri) alıp her grup için <code>{"secim": .., "fpr": .., "fnr": ..}</code> döndürsün; değerler 3 basamak. Payda 0 ise metrik <code>None</code> olsun. Gerçek veri testi: Pusula İK\'nın eski kural tabanlı sistemi (seviye 1 → "ayrılır") cinsiyete göre denetleniyor.</p>',
    guide=['Grupları sorted(set(grup)) ile gez.', 'Her grupta FP, TN, FN, TP sayılarını çıkar.', 'secim = tahmin ortalaması; fpr = FP/(FP+TN); fnr = FN/(FN+TP).', 'Payda 0 ise None yaz, değilse round(…, 3).'],
    example='y = [1, 0, 1]\nt = [1, 1, 0]\ntp = sum(1 for a, b in zip(y, t) if a == 1 and b == 1)\nprint(tp)\n',
    start=KURAL + '\ndef grup_metrikleri(y, tahmin, grup):\n    sonuc = {}\n    # TODO: her grup için secim, fpr, fnr\n    return sonuc\n',
    sol=KURAL + d('''

        def _oran(pay, payda):
            return round(pay / payda, 3) if payda else None

        def grup_metrikleri(y, tahmin, grup):
            y, tahmin, grup = list(y), list(tahmin), list(grup)
            sonuc = {}
            for g in sorted(set(grup)):
                s = [(a, t) for a, t, k in zip(y, tahmin, grup) if k == g]
                fp = sum(1 for a, t in s if a == 0 and t == 1)
                tn = sum(1 for a, t in s if a == 0 and t == 0)
                fn = sum(1 for a, t in s if a == 1 and t == 0)
                tp = sum(1 for a, t in s if a == 1 and t == 1)
                sonuc[g] = {"secim": _oran(fp + tp, len(s)), "fpr": _oran(fp, fp + tn), "fnr": _oran(fn, fn + tp)}
            return sonuc
    ''').replace(KURAL, ''),
    tests=f'''r = grup_metrikleri([1, 0, 0, 1], [1, 1, 0, 0], ["A", "A", "B", "B"])
assert r["A"] == {{"secim": 1.0, "fpr": 1.0, "fnr": 0.0}}, f"A grubu: ikisi de işaretli (seçim 1.0), tek negatif yanlış alarm (FPR 1.0); gelen {{r['A']}}"
assert r["B"] == {{"secim": 0.0, "fpr": 0.0, "fnr": 1.0}}, "B grubu: pozitif kaçırılmış (FNR 1.0)"
assert grup_metrikleri([0, 0], [1, 0], ["A", "A"])["A"]["fnr"] is None, "Pozitif yoksa FNR tanımsız: None"
g = grup_metrikleri(y, tahmin, cinsiyet)
assert g == {GR_REAL!r}, f"Gerçek veride beklenen {GR_REAL!r}, gelen {{g}}"
''',
    hints=['Dört hücreyi (TP, FP, TN, FN) grup içinde say.', 'FPR negatiflerin (y=0) içindeki alarm oranıdır; FNR pozitiflerin (y=1) içindeki kaçırma oranıdır.', 'Bölmeden önce paydayı kontrol eden küçük bir yardımcı fonksiyon yaz.'],
    why='Seçim oranı demographic parity, FNR farkı equal opportunity ölçüsüdür. Gerçek veride kural, kadınlarda daha çok alarm üretiyor; bu fark model kartına yazılmalı.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w3', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p>Hata dilimi analizi: <code>hata_dilimi(df, segment, en_az=30)</code>. <code>df</code>\'de <code>y</code>, <code>tahmin</code> ve segment sütunu var. Her segment için <code>(segment_degeri, satir_sayisi, hata_orani)</code> üret (hata oranı 3 basamak, segment değeri <code>str</code>, sayı <code>int</code>); <code>en_az</code>\'dan küçük segmentleri at; hata oranına göre azalan, eşitlikte ada göre artan sırala. Gerçek veri: eski kural sisteminin şehir ve işe alım kaynağına göre hataları.</p>',
    start=KURAL + 'df = X.assign(y=y.to_numpy(), tahmin=tahmin.to_numpy())\n\ndef hata_dilimi(df, segment, en_az=30):\n    pass\n',
    sol=KURAL + 'df = X.assign(y=y.to_numpy(), tahmin=tahmin.to_numpy())\n\ndef hata_dilimi(df, segment, en_az=30):\n    hata = df["y"] != df["tahmin"]\n    tablo = hata.groupby(df[segment]).agg(["size", "mean"])\n    sonuc = [(str(k), int(r["size"]), round(float(r["mean"]), 3)) for k, r in tablo.iterrows() if r["size"] >= en_az]\n    return sorted(sonuc, key=lambda t: (-t[2], t[0]))\n',
    tests=f'''k = pd.DataFrame({{"y": [1, 0, 1, 0, 1], "tahmin": [1, 1, 0, 0, 1], "s": ["a", "a", "b", "b", "c"]}})
assert hata_dilimi(k, "s", en_az=2) == [("a", 2, 0.5), ("b", 2, 0.5)], "c tek satır, elenmeli; a ve b eşit hata, ada göre sıralı"
assert hata_dilimi(df, "city", 50) == {DL_CITY!r}, "Şehir dilimi: Bursa ve Antalya (34 satır) elenir"
assert hata_dilimi(df, "hire_source") == {DL_SRC!r}, "İşe alım kaynağı dilimi beklenenle aynı olmalı"
''',
    hints=['Hata serisi: df["y"] != df["tahmin"]; bunu segment sütununa göre grupla.', '.agg(["size", "mean"]) satır sayısını ve hata oranını birlikte verir.', 'sorted(..., key=lambda t: (-t[2], t[0]))'],
    why='Bool hata serisinin ortalaması hata oranıdır. Küçük segmentleri atmak gürültü kaynaklı "en kötü segment" alarmlarını önler; atılanlar raporda ayrıca belirtilmelidir.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w4', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p><code>onem_sirasi(model, X, y)</code> yaz: <code>permutation_importance</code> ile (<code>scoring="roc_auc"</code>, <code>n_repeats=5</code>, <code>random_state=0</code>) her sütunun ortalama önemini hesapla ve sütun adlarını önemden büyüğe sıralı liste olarak döndür. Gerçek İK modeli test verisinde değerlendirilir.</p>',
    start=VERI + MODEL + '\ndef onem_sirasi(model, X, y):\n    pass\n',
    sol=VERI + MODEL + 'from sklearn.inspection import permutation_importance\n\ndef onem_sirasi(model, X, y):\n    r = permutation_importance(model, X, y, scoring="roc_auc", n_repeats=5, random_state=0)\n    return [ad for _, ad in sorted(zip(r.importances_mean, X.columns), reverse=True)]\n',
    tests=d('''
        s = onem_sirasi(model, X_te, y_te)
        assert sorted(s) == sorted(X_te.columns), "Her sütun bir kez yer almalı"
        assert s[0] == "level", f"Gerçek veride en önemli sütun pozisyon seviyesi (level) olmalı, gelen {s[0]}"
        assert s.index("education") < s.index("work_mode"), "Eğitim, çalışma biçiminden daha önemli çıkmalı"
    '''),
    hints=['sklearn.inspection.permutation_importance sonucu importances_mean alanı taşır.', 'zip(r.importances_mean, X.columns) demetlerini büyükten küçüğe sırala.'],
    why='Önem ham sütun düzeyinde ölçülür çünkü karıştırma pipeline\'a girmeden önce yapılır; one-hot sütunlarını tek tek yorumlamak zorunda kalmazsın.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w5', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p><code>halving_ara(model, X, y)</code> yaz: <code>HalvingGridSearchCV</code> ile <code>model__C</code> için <code>[0.1, 1.0]</code>, <code>model__class_weight</code> için <code>[None, "balanced"]</code> ızgarasını <code>factor=2</code>, <code>scoring="roc_auc"</code>, <code>cv=3</code>, <code>random_state=0</code> ile ara. Dönüş: <code>(aday_sayilari, en_iyi_parametreler)</code>; ilki her turdaki aday sayısı listesi (<code>int</code>). Deneysel API\'yi açmayı unutma.</p>',
    start=VERI + MODEL + '\ndef halving_ara(model, X, y):\n    pass\n',
    sol=VERI + MODEL + 'from sklearn.experimental import enable_halving_search_cv\nfrom sklearn.model_selection import HalvingGridSearchCV\n\ndef halving_ara(model, X, y):\n    izgara = {"model__C": [0.1, 1.0], "model__class_weight": [None, "balanced"]}\n    arama = HalvingGridSearchCV(model, izgara, factor=2, scoring="roc_auc", cv=3, random_state=0).fit(X, y)\n    return [int(n) for n in arama.n_candidates_], arama.best_params_\n',
    tests=d('''
        adaylar, en_iyi = halving_ara(model, X_tr, y_tr)
        assert adaylar == [4, 2, 1], f"4 aday factor=2 ile 4 → 2 → 1 iner, gelen {adaylar}"
        assert set(en_iyi) == {"model__C", "model__class_weight"}, "En iyi parametreler iki anahtar içermeli"
        assert en_iyi["model__C"] in (0.1, 1.0)
    '''),
    hints=['from sklearn.experimental import enable_halving_search_cv satırı sınıfı içe aktarmadan ÖNCE gelmeli.', 'Eğitilmiş aramanın n_candidates_ ve best_params_ alanları var.'],
    why='Halving, ilk turda dört adayı az satırla dener, yarısını eler ve kalanlara daha çok satır verir; son aday tüm veriyle değerlendirilir.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w6', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
    q='<p>Hatayı bul ve düzelt. <code>ice_egrileri(model, X, sutun, degerler)</code> her satır için bir ICE eğrisi (değer başına olasılık listesi) döndürmeli. İlk çağrıda doğru görünüyor ama çağrıdan sonra analistin X tablosu bozuluyor: <code>sutun</code>\'daki tüm değerler son ızgara değerine dönüşüyor ve sonraki her analiz yanlış çıkıyor.</p>',
    start=d('''
        import numpy as np
        import pandas as pd

        def ice_egrileri(model, X, sutun, degerler):
            calisma = X
            egriler = np.zeros((len(X), len(degerler)))
            for j, v in enumerate(degerler):
                calisma[sutun] = v
                egriler[:, j] = model.predict_proba(calisma)[:, 1]
            return egriler.round(3).tolist()
    '''),
    sol=d('''
        import numpy as np
        import pandas as pd

        def ice_egrileri(model, X, sutun, degerler):
            calisma = X.copy()
            egriler = np.zeros((len(X), len(degerler)))
            for j, v in enumerate(degerler):
                calisma[sutun] = v
                egriler[:, j] = model.predict_proba(calisma)[:, 1]
            return egriler.round(3).tolist()
    '''),
    tests=d('''
        class Sahte:
            def predict_proba(self, X):
                p = (X["a"] * 0.1 + X["b"] * 0.01).to_numpy()
                return np.column_stack([1 - p, p])
        df = pd.DataFrame({"a": [1.0, 2.0], "b": [10.0, 20.0]})
        e = ice_egrileri(Sahte(), df, "a", [0.0, 5.0])
        assert e == [[0.1, 0.6], [0.2, 0.7]], f"Her satırın kendi eğrisi olmalı, gelen {e}"
        assert df["a"].tolist() == [1.0, 2.0], "Fonksiyon çağıranın X tablosunu değiştirmemeli"
    '''),
    hints=['calisma = X satırı yeni tablo oluşturmaz; aynı nesneye ikinci ad verir.', 'X.copy() ile bağımsız kopya al.'],
    why='pandas DataFrame\'i atama ile kopyalanmaz. Açıklama araçları veriyi değiştirerek çalıştığı için her zaman kopya üzerinde çalışmalıdır; aksi hâlde sessiz veri bozulması olur.'))
ex.append(dict(t='code', id='ml-pipeline-degerlendirme-w7', stage='Meydan okuma', diff=3,
    q='<p>Erken durdurmayı elle uygula. <code>erken_durdur(model, X_va, y_va, sabir=5)</code>: <code>model</code> eğitilmiş bir boosting modeli; <code>model.staged_predict_proba(X_va)</code> her turdan sonraki olasılıkları sırayla verir. Her tur için <code>sklearn.metrics.log_loss</code> hesapla. Kayıp, o ana kadarki en iyiden <b>kesin olarak</b> küçükse en iyiyi güncelle; art arda <code>sabir</code> tur iyileşme olmazsa dur. <code>(en_iyi_tur, en_iyi_kayip)</code> döndür: tur 1\'den başlar, kayıp 4 basamak.</p>',
    start='from sklearn.metrics import log_loss\n\ndef erken_durdur(model, X_va, y_va, sabir=5):\n    pass\n',
    sol=d('''
        from sklearn.metrics import log_loss

        def erken_durdur(model, X_va, y_va, sabir=5):
            en_iyi_tur, en_iyi = 0, float("inf")
            bekleme = 0
            for tur, olas in enumerate(model.staged_predict_proba(X_va), start=1):
                kayip = log_loss(y_va, olas, labels=[0, 1])
                if kayip < en_iyi:
                    en_iyi_tur, en_iyi, bekleme = tur, kayip, 0
                else:
                    bekleme += 1
                    if bekleme >= sabir:
                        break
            return en_iyi_tur, round(en_iyi, 4)
    '''),
    tests=d('''
        import numpy as np
        class Sahte:
            def __init__(self, pler):
                self.pler = pler
                self.uretilen = 0
            def staged_predict_proba(self, X):
                for p in self.pler:
                    self.uretilen += 1
                    yield np.array([[1 - p, p], [p, 1 - p]])
        y = [1, 0]
        m = Sahte([0.6, 0.7, 0.8, 0.75, 0.7, 0.72, 0.9])
        tur, kayip = erken_durdur(m, None, y, sabir=3)
        assert tur == 3, f"En iyi kayıp 3. turda (p=0.8), gelen {tur}"
        assert kayip == round(-np.log(0.8), 4), "Kayıp 3. turdaki log_loss olmalı"
        assert m.uretilen == 6, f"3 tur iyileşme olmayınca 6. turda durmalı; üretilen tur {m.uretilen}"
        m2 = Sahte([0.6, 0.7, 0.8, 0.75, 0.7, 0.72, 0.9])
        assert erken_durdur(m2, None, y, sabir=5)[0] == 7, "Sabır 5 iken 7. tur (p=0.9) da görülür"
        from sklearn.ensemble import GradientBoostingClassifier
        from sklearn.datasets import make_classification
        Xs, ys = make_classification(n_samples=400, flip_y=0.2, random_state=0)
        gb = GradientBoostingClassifier(n_estimators=150, learning_rate=0.3, random_state=0).fit(Xs[:300], ys[:300])
        t, k = erken_durdur(gb, Xs[300:], ys[300:], sabir=10)
        assert 1 <= t < 150, "Gürültülü veride en iyi tur 150 turdan önce gelmeli"
    '''),
    hints=['enumerate(model.staged_predict_proba(X_va), start=1) ile tur numarasını tut.', 'Bir "bekleme" sayacı tut: iyileşmede sıfırla, değilse artır; sabıra ulaşınca break.', 'log_loss(y_va, olas, labels=[0, 1]) her tur için kaybı verir.'],
    why='Üreteç tabanlı staged_predict_proba sayesinde gereksiz turlar hiç hesaplanmaz. HistGradientBoosting\'in early_stopping=True ve n_iter_no_change ayarları aynı mantığı eğitim sırasında uygular.'))

faq = [
    dict(q='Model düşük AUC verdi; yine de açıklamaya ve adalet denetimine değer mi?', a='Evet. Zayıf bir model bile karar sürecine girdiyse kimde yanıldığını ve gruplara nasıl davrandığını bilmen gerekir. Ayrıca açıklama araçları çoğu zaman modelin neden zayıf olduğunu da gösterir: belirleyici bilgi (ör. maaş artışı, yönetici değişimi) özelliklerde yoktur.'),
    dict(q='HalvingGridSearchCV neden "experimental" altında?', a='scikit-learn API\'si ileride değişebilecek özellikleri deneysel olarak işaretler; <code>from sklearn.experimental import enable_halving_search_cv</code> satırı bu sınıfları bilinçli olarak açmanı ister. Davranış güvenilirdir, yalnız parametre adları gelecekte değişebilir; sürümünü requirements dosyasında sabitle.'),
]
mistakes = [dict(bad='calisma = X\ncalisma["level"] = 3', good='calisma = X.copy()\ncalisma["level"] = 3', why='Atama kopya oluşturmaz; açıklama hesabı orijinal veriyi sessizce bozar.')]
emit(dict(id='ml-pipeline-degerlendirme', min=30, html=html, ex=ex, faq=faq, mistakes=mistakes), 'açıklanabilirlik (PDP/ICE, permutation importance), hata dilimi, adalet metrikleri ve arama bütçesi (AUDIT Ekle-5, Ekle-6)')
