import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from emit import py, code, write

VERI = '''import numpy as np
import pandas as pd

SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa"]

def veri_uret(n=1000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "yas": rng.integers(18, 75, n),
        "kidem_ay": rng.integers(1, 120, n),
        "urun_sayisi": rng.integers(1, 5, n),
        "aylik_islem": rng.poisson(12, n),
        "bakiye": np.round(rng.gamma(2.0, 15000, n), 2),
        "sehir": rng.choice(SEHIRLER, n, p=[0.4, 0.25, 0.2, 0.15]),
        "mobil_aktif": rng.integers(0, 2, n),
        "sikayet_sayisi": rng.poisson(0.6, n),
    })
    z = (-0.6 + 1.1 * df["sikayet_sayisi"] - 0.5 * (df["urun_sayisi"] - 1)
         - 0.015 * df["kidem_ay"] - 0.06 * (df["aylik_islem"] - 12) - 0.9 * df["mobil_aktif"])
    olasilik = 1 / (1 + np.exp(-z))
    df["churn"] = (rng.random(n) < olasilik).astype(int)
    return df
'''

OZELLIK = '''def ozellik_ekle(df):
    df = df.copy()
    df["islem_urun_orani"] = df["aylik_islem"] / df["urun_sayisi"]
    df["yeni_musteri"] = (df["kidem_ay"] < 12).astype(int)
    df["bakiye_log"] = np.log1p(df["bakiye"])
    return df
'''

KOLON = '''SAYISAL = ["yas", "kidem_ay", "urun_sayisi", "aylik_islem", "bakiye_log", "mobil_aktif",
           "sikayet_sayisi", "islem_urun_orani", "yeni_musteri"]
KATEGORIK = ["sehir"]
'''

PIPE = '''from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

def pipeline_kur(sayisal, kategorik):
    hazirlik = ColumnTransformer([
        ("sayi", StandardScaler(), sayisal),
        ("kat", OneHotEncoder(handle_unknown="ignore"), kategorik),
    ])
    return Pipeline([("hazirlik", hazirlik), ("model", LogisticRegression(max_iter=1000))])
'''

body = f'''
<h2>Proje: Ilgaz Bank müşteri kaybı tahmini</h2>
<p>Ilgaz Bank\'ın bireysel bankacılık ekibi her ay bazı müşterilerin hesabını kapatıp başka bankaya geçtiğini görüyor. Yeni müşteri kazanmak, mevcut müşteriyi tutmaktan çok daha pahalı. Soru şu: <b>"Önümüzdeki dönemde hangi müşteriler ayrılmaya (churn) yakın, kime tutundurma teklifi yapalım?"</b> Bu bitirme projesinde makine öğrenmesi derslerinde (<code>ml-giris</code>, <code>ml-regresyon-siniflandirma</code>, <code>ml-pipeline-degerlendirme</code>) öğrendiğin her şeyi tek bir iş problemi etrafında birleştireceksin: veri, keşif, özellik mühendisliği, pipeline, çapraz doğrulama, eşik seçimi, açıklama, rapor ve model dosyası.</p>
<div class="tbl-wrap"><table>
<tr><th>Adım</th><th>Soru</th><th>Araç</th><th>Çıktı</th></tr>
<tr><td>1. Veri</td><td>Elimizde ne var?</td><td>numpy <code>default_rng(seed)</code></td><td><code>veri_uret</code></td></tr>
<tr><td>2. Keşif</td><td>Churn oranı ne, kimde yüksek?</td><td>pandas groupby</td><td>Oran tabloları</td></tr>
<tr><td>3. Özellikler</td><td>Hangi türetilmiş bilgi işe yarar?</td><td>pandas</td><td><code>ozellik_ekle</code></td></tr>
<tr><td>4. Pipeline</td><td>Hazırlık + model tek nesnede</td><td>ColumnTransformer, Pipeline</td><td><code>pipeline_kur</code></td></tr>
<tr><td>5. Doğrulama</td><td>Model ne kadar iyi?</td><td>StratifiedKFold, ROC AUC</td><td>CV skoru</td></tr>
<tr><td>6. Eşik</td><td>Kime teklif gidecek?</td><td>Maliyet fonksiyonu</td><td>En ucuz eşik</td></tr>
<tr><td>7. Açıklama</td><td>Neden ayrılıyorlar?</td><td>Katsayılar</td><td>Özellik önemi</td></tr>
<tr><td>8. Rapor ve teslim</td><td>Yönetime ne söyleyeceğiz?</td><td>f-string, pickle + BytesIO</td><td>Rapor metni, model dosyası</td></tr>
</table></div>
<div class="note"><b>Her kutu bağımsız</b>Sayfadaki her kod kutusu kendi başına çalışır; bu yüzden veri üretimi gibi parçalar kutularda tekrar eder. Gerçek projede bunlar <code>veri.py</code>, <code>ozellik.py</code>, <code>model.py</code>, <code>rapor.py</code> modüllerinde bir kez yazılır.</div>

<h2>1. Sentetik veri üretimi</h2>
<p>Gerçek müşteri verisi bu derste kullanılamaz (KVKK), o yüzden gerçekçi ilişkiler taşıyan sentetik veri üretiyoruz: şikayet sayısı arttıkça ayrılma olasılığı artar; ürün sayısı, kıdem, işlem sıklığı ve mobil uygulama kullanımı ise müşteriyi bağlar. Churn, bu etkilerden hesaplanan olasılıkla rastgele çekilir; böylece model mükemmel değil, gerçek hayattaki gibi "iyi ama hatalı" olur. <code>seed</code> sabitlendiği için herkes aynı veriyi alır.</p>
{py(VERI + r"""
df = veri_uret()
print(df.shape)
print(df.head(3).to_string())
print("churn oranı:", round(df["churn"].mean(), 3))
""")}
<div class="warn"><b>Sentetik veri kendi cevabını bilir</b>Formülü biz yazdığımız için modelin "şikayet sayısı önemli" demesi bizi şaşırtmaz. Bu bir öğrenme düzeneğidir; gerçek projede ilişkileri veri söyler ve sürprizler olur.</div>

<h2>2. Keşifsel analiz ve 3. özellik mühendisliği</h2>
<p>Modelden önce veriye bak: churn oranı ne (sınıf dengesizliği var mı), hangi gruplarda yüksek? Sonra ham sütunlardan iş anlamı olan yeni sütunlar türet. Kural: her özellik <b>tahmin anında bilinebilir</b> olmalı. "Hesap kapanış tarihi" ya da "kapanış nedeni" gibi churn\'den sonra oluşan bilgiler modele girerse sahte bir başarı elde edersin (veri sızıntısı, data leakage).</p>
{py(VERI + OZELLIK + r"""
df = ozellik_ekle(veri_uret())
print("Genel churn:", round(df["churn"].mean(), 3))
print(df.groupby("sikayet_sayisi")["churn"].agg(["mean", "size"]).round(3).head(4))
print(df.groupby("mobil_aktif")["churn"].mean().round(3).to_dict())
df["kidem_grubu"] = pd.cut(df["kidem_ay"], [0, 12, 36, 120], labels=["<1 yıl", "1-3 yıl", "3+ yıl"])
print(df.groupby("kidem_grubu", observed=True)["churn"].mean().round(3).to_dict())
print(df[["aylik_islem", "urun_sayisi", "islem_urun_orani", "yeni_musteri", "bakiye_log"]].head(2).round(2).to_string())
""")}
<p>Şikayet sayısı arttıkça churn oranı belirgin biçimde artıyor, mobil uygulama kullananlar daha az ayrılıyor, 3 yıldan uzun süredir müşteri olanlar daha sadık. Churn oranı %18 civarında: dengesiz bir sınıf, bu yüzden doğruluk (accuracy) yerine ROC AUC ve maliyet odaklı değerlendirme kullanacağız.</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Formül</th><th>İş anlamı</th></tr>
<tr><td><code>islem_urun_orani</code></td><td>aylık işlem / ürün sayısı</td><td>Ürün başına kullanım yoğunluğu</td></tr>
<tr><td><code>yeni_musteri</code></td><td>kıdem &lt; 12 ay</td><td>İlk yıl kritik dönem</td></tr>
<tr><td><code>bakiye_log</code></td><td>log(1 + bakiye)</td><td>Çarpık dağılımı yumuşatır</td></tr>
</table></div>

<h2>4. Pipeline ve 5. çapraz doğrulama</h2>
<p>Sayısal sütunlar ölçeklenir, şehir one-hot kodlanır, sonra lojistik regresyon. Hepsi tek <code>Pipeline</code> içinde olduğu için çapraz doğrulamada her katta hazırlık yalnızca eğitim kısmına fit edilir ve yeni müşteriye tahmin yaparken aynı adımlar otomatik uygulanır. <code>handle_unknown="ignore"</code>, eğitimde görülmemiş bir şehir (ör. "Antalya") geldiğinde hata yerine sıfır vektör üretir. <b>StratifiedKFold</b> her katta churn oranını korur; skorun ortalaması kadar dağılımı (±) da önemlidir.</p>
<h2>6. Eşik seçimi ve iş maliyeti</h2>
<p>Model bir olasılık verir; "teklif gönder" kararı için bir eşik gerekir. Varsayılan 0.5 bir iş kararı değil, bir varsayımdır. Hataların maliyeti eşit değildir:</p>
<ul>
<li><b>Yanlış pozitif</b> (FP): kalacak müşteriye teklif gönderdik; maliyet = teklif bedeli (ör. 300 TL).</li>
<li><b>Yanlış negatif</b> (FN): gidecek müşteriyi kaçırdık; maliyet = müşterinin bırakacağı değer (ör. 1.500 TL).</li>
</ul>
<p>FN daha pahalıysa eşik düşer: daha çok kişiye teklif gönderip daha az kişiyi kaçırırız. Rakamlar örnektir; gerçek değerleri finans ekibiyle belirlersin.</p>
{py(VERI + OZELLIK + KOLON + PIPE + r"""
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.metrics import roc_auc_score

df = ozellik_ekle(veri_uret())
X, y = df[SAYISAL + KATEGORIK], df["churn"].to_numpy()
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
skorlar = cross_val_score(pipeline_kur(SAYISAL, KATEGORIK), X, y, cv=cv, scoring="roc_auc")
print(f"CV ROC AUC: {skorlar.mean():.3f} ± {skorlar.std():.3f}")

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
olas = pipeline_kur(SAYISAL, KATEGORIK).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]

def is_maliyeti(y_gercek, olas, esik, fp_maliyet=300, fn_maliyet=1500):
    tahmin = olas >= esik
    fp = int((tahmin & (y_gercek == 0)).sum())
    fn = int((~tahmin & (y_gercek == 1)).sum())
    return fp * fp_maliyet + fn * fn_maliyet

for e in [0.1, 0.2, 0.3, 0.5, 0.7]:
    print(f"eşik {e:.1f}: {is_maliyeti(y_te, olas, e):>7,} TL")
print("hiç teklif yok:", is_maliyeti(y_te, olas, 1.01))
""")}
<p>Tablo, 0.5 eşiğinin bu maliyet yapısında pahalı olduğunu, daha düşük bir eşiğin binlerce lira tasarruf ettirdiğini gösterir. "Hiç teklif yok" satırı da modelin iş değerini ölçmek için temel çizgidir.</p>
<div class="tip"><b>Eşiği test setinde seçme</b>En iyi eşiği test setinde arayıp aynı sette raporlarsan iyimser bir rakam verirsin. Doğrusu, eşiği eğitim verisinden (ör. çapraz doğrulama tahminleriyle, <code>cross_val_predict</code>) seçip test setinde bir kez raporlamaktır. Bitirme çözümünde böyle yapacağız.</div>

<h2>7. Model açıklama: özellik önemi</h2>
<p>Yönetim "neden?" diye soracak. Lojistik regresyonda ölçeklenmiş sütunların katsayıları, o özelliğin bir standart sapma artışının churn log-olasılığını ne kadar değiştirdiğini söyler: pozitif katsayı riski artırır, negatif azaltır. <code>pipe.named_steps["hazirlik"].get_feature_names_out()</code> ColumnTransformer\'ın ürettiği sütun adlarını (<code>sayi__sikayet_sayisi</code>, <code>kat__sehir_İzmir</code>) verir; bunları <code>pipe.named_steps["model"].coef_[0]</code> ile eşleştirip mutlak değere göre sıralarsın. Tam çözümde bu tabloyu göreceksin. Ağaç modellerinde <code>feature_importances_</code>, model türünden bağımsız olarak da <code>permutation_importance</code> kullanılır. Unutma: katsayı nedensellik değil ilişkidir; "mobil uygulamayı zorunlu yapalım, churn düşsün" sonucu bir deney (A/B testi) olmadan çıkarılamaz.</p>

<h2>8. İş raporu ve modeli kaydetmek</h2>
<p>Rapor, teknik olmayan biri için yazılır: kaç müşteriye teklif, beklenen tasarruf, ana nedenler. <code>sablon-rapor</code> dersindeki jinja2 burada gerekmez; düz f-string yeter. Model ise <code>pickle</code> ile bayta çevrilip dosyaya, nesne deposuna ya da veritabanına yazılır. Tarayıcıda disk yerine bellekte bir dosya gibi davranan <code>io.BytesIO</code> kullanıyoruz.</p>
{py(VERI + OZELLIK + KOLON + PIPE + r"""
import io
import pickle

df = ozellik_ekle(veri_uret())
X = df[SAYISAL + KATEGORIK]
pipe = pipeline_kur(SAYISAL, KATEGORIK).fit(X, df["churn"])

tampon = io.BytesIO()
pickle.dump(pipe, tampon)
print("model boyutu:", len(tampon.getvalue()), "bayt")

tampon.seek(0)
yuklenen = pickle.load(tampon)
print("aynı tahmin:", (yuklenen.predict_proba(X)[:, 1] == pipe.predict_proba(X)[:, 1]).all())

yeni = pd.DataFrame([{"yas": 34, "kidem_ay": 5, "urun_sayisi": 1, "aylik_islem": 3, "bakiye": 1200.0,
                      "sehir": "Antalya", "mobil_aktif": 0, "sikayet_sayisi": 3}])
print("yeni müşteri churn olasılığı:", round(float(yuklenen.predict_proba(ozellik_ekle(yeni)[SAYISAL + KATEGORIK])[0, 1]), 2))
""")}
<div class="warn"><b>pickle güvenliği ve sürümler</b><code>pickle.load</code> güvenilmeyen bir dosyayı açarsa keyfi kod çalıştırabilir; yalnızca kendi ürettiğin modelleri yükle. Model, kaydedildiği scikit-learn sürümüyle yüklenmelidir; sürümü <code>requirements.txt</code>\'e sabitle. Büyük modellerde <code>joblib.dump</code> daha verimlidir.</div>

<h2>Tam çözüm</h2>
<p>Aşağıdaki kutu tüm adımları birleştirir: eşik, eğitim verisinde çapraz doğrulama tahminleriyle seçilir, test setinde bir kez raporlanır.</p>
{py(VERI + OZELLIK + KOLON + PIPE + r"""
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_predict
from sklearn.metrics import roc_auc_score

FP_TL, FN_TL = 300, 1500

def is_maliyeti(y, olas, esik):
    t = olas >= esik
    return int(((t == 1) & (y == 0)).sum()) * FP_TL + int(((t == 0) & (y == 1)).sum()) * FN_TL

df = ozellik_ekle(veri_uret())
X, y = df[SAYISAL + KATEGORIK], df["churn"].to_numpy()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
pipe = pipeline_kur(SAYISAL, KATEGORIK)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
oof = cross_val_predict(pipe, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
esikler = [round(e, 2) for e in np.arange(0.05, 0.95, 0.05)]
esik = min(esikler, key=lambda e: (is_maliyeti(y_tr, oof, e), e))

pipe.fit(X_tr, y_tr)
olas = pipe.predict_proba(X_te)[:, 1]
model_maliyet = is_maliyeti(y_te, olas, esik)
bos_maliyet = is_maliyeti(y_te, olas, 1.01)
adlar = [a.split("__", 1)[1] for a in pipe.named_steps["hazirlik"].get_feature_names_out()]
katsayi = pipe.named_steps["model"].coef_[0]
sira = np.argsort(-np.abs(katsayi))
ilk3 = [adlar[i] for i in sira[:3]]
print("özellik önemi:", {adlar[i]: round(float(katsayi[i]), 2) for i in sira[:5]})

rapor = (
    f"ILGAZ BANK | Müşteri kaybı modeli raporu\n"
    f"Test müşteri sayısı: {len(y_te)} (gerçek churn oranı %{100 * y_te.mean():.1f})\n"
    f"ROC AUC: {roc_auc_score(y_te, olas):.3f}\n"
    f"Seçilen eşik: {esik:.2f} -> teklif gönderilecek: {int((olas >= esik).sum())} müşteri\n"
    f"Maliyet: model ile {model_maliyet:,} TL, modelsiz {bos_maliyet:,} TL\n"
    f"Tahmini tasarruf: {bos_maliyet - model_maliyet:,} TL\n"
    f"Riski en çok etkileyen özellikler: {', '.join(ilk3)}"
)
print(rapor)
""")}

<div class="note"><b>Gerçek işte</b>Bankalarda churn modeli genelde aylık çalışan bir toplu işin (batch) parçasıdır: veri ambarından son 6-12 ayın davranış özellikleri çekilir, model skorları üretilir, en riskli müşteriler CRM\'e "tutundurma listesi" olarak düşer ve şube/çağrı merkezi aksiyon alır. Model, kampanya grubu ile kontrol grubu karşılaştırılarak (A/B testi) değerlendirilir; çünkü asıl soru "kimin gideceğini bildik mi" değil, "teklif gerçekten fark yarattı mı"dır. Ayrıca model risk yönetimi ekipleri modelin açıklanabilirliğini, adil olup olmadığını (ör. yaş gruplarına göre hata oranları) ve veri kaymasını (data drift) düzenli denetler.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Daha iyi model ve kalibrasyon</h3>
<p>Lojistik regresyon güçlü ve açıklanabilir bir temel çizgidir. <code>HistGradientBoostingClassifier</code> gibi ağaç tabanlı modeller etkileşimleri kendiliğinden yakalayıp AUC\'yi artırabilir. Maliyet hesabı olasılıklara dayandığı için olasılıkların <b>kalibre</b> olması (0.3 diyen müşterilerin gerçekten ~%30\'unun ayrılması) önemlidir; <code>CalibratedClassifierCV</code> ve kalibrasyon eğrisi (<code>calibration_curve</code>) ile kontrol et.</p>
<h3>Hedef: kim ayrılacak değil, kim ikna edilebilir</h3>
<p>Churn modeli riskli müşteriyi bulur ama teklife kimin olumlu tepki vereceğini söylemez. Bir sonraki adım "uplift modeling"dir: kampanya ve kontrol grubu verisiyle, teklifin ayrılma olasılığını en çok düşürdüğü müşterileri hedeflemek.</p>
<h3>Üretime alma</h3>
<p>Modeli bir paket fonksiyonu (<code>skorla(df) -&gt; olasılıklar</code>) arkasına koy, girdi şemasını pydantic ya da pandera ile doğrula, model sürümünü ve eğitim tarihini meta veri olarak kaydet, aylık dağılım değişimlerini izle (ör. churn oranı, özellik ortalamaları). <code>veri-boru-hatti</code> ve <code>orkestrasyon</code> dersleri bu kısmı ele alır.</p>
</section>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Churn oranı %18 olan veriyi eğitim/test olarak bölerken neden <code>stratify=y</code> kullanırsın?',
    o=['Eğitimi hızlandırmak için', 'Eğitim ve test setinde churn oranının aynı kalması için', 'Kategorik sütunları otomatik kodlamak için', 'Aykırı değerleri test setinden çıkarmak için'],
    a=1, why='Tabakalı (stratified) bölme sınıf oranını her parçada korur; aksi hâlde test seti şans eseri çok az ya da çok fazla churn içerebilir ve skorlar yanıltıcı olur.'))
ex.append(dict(t='mc', stage='Isınma', q='Aşağıdaki sütunlardan hangisi churn modeline girerse <b>veri sızıntısı</b> olur?',
    o=['Son 3 aydaki şikayet sayısı', 'Müşterinin kullandığı ürün sayısı', 'Hesap kapanış talebinin alındığı tarih', 'Mobil uygulamaya son giriş tarihi'],
    a=2, why='Hesap kapanış talebi, churn olayının kendisinin bir parçasıdır ve tahmin anında bilinemez. Model bunu öğrenirse testte mükemmel, gerçekte işe yaramaz olur. Diğerleri tahmin anında bilinen davranış bilgileridir.'))
ex.append(dict(t='mc', stage='Isınma', q='Kaçırılan bir müşterinin maliyeti (FN) 1.500 TL, gereksiz teklifin maliyeti (FP) 100 TL. Eşiği 0.5\'ten nasıl değiştirmek mantıklıdır?',
    o=['Eşiği düşürmek: daha çok müşteriye teklif, daha az kaçırılan', 'Eşiği yükseltmek: yalnızca çok emin olunanlara teklif', 'Eşiği 0.5\'te bırakmak; maliyetler eşiği etkilemez', 'Eşiği 1.0 yapmak; hiç teklif göndermemek en ucuzu'],
    a=0, why='FN, FP\'den 15 kat pahalıysa birkaç gereksiz teklif, tek bir kaçırılan müşteriden ucuzdur. Eşiği düşürmek FN\'yi azaltıp FP\'yi artırır; doğru nokta maliyet hesabıyla bulunur.'))

ex.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import pandas as pd\n\ndf = pd.DataFrame({"sehir": ["Ankara", "İzmir", "Ankara", "İzmir", "İzmir"], "churn": [1, 0, 0, 0, 1]})\nprint(df.groupby("sehir")["churn"].mean().round(2).to_dict())\n',
    o=["{'Ankara': 0.5, 'İzmir': 0.33}", "{'Ankara': 1, 'İzmir': 1}", "{'Ankara': 0.4, 'İzmir': 0.6}", "{'Ankara': 0.5, 'İzmir': 0.67}"], a=0,
    why='0/1 sütunun ortalaması orandır. Ankara: 1 ve 0 → 0.5; İzmir: 0, 0, 1 → 1/3 ≈ 0.33. Toplam (sum) değil ortalama (mean) alındığına dikkat.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Eşik 0.3 iken bu kod ne yazdırır?',
    code='import numpy as np\n\ny = np.array([1, 0, 1, 0, 0, 1])\nolas = np.array([0.8, 0.4, 0.2, 0.1, 0.35, 0.6])\nt = olas >= 0.3\nfp = int(((t == 1) & (y == 0)).sum())\nfn = int(((t == 0) & (y == 1)).sum())\nprint(fp, fn, fp * 100 + fn * 1500)\n',
    o=['1 1 1600', '2 1 1700', '2 0 200', '1 2 3100'], a=1,
    why='Eşik üstü: 0.8, 0.4, 0.35, 0.6. Bunlardan gerçekte 0 olanlar 0.4 ve 0.35 → FP = 2. Eşik altında gerçekte 1 olan 0.2 → FN = 1. Maliyet 2 × 100 + 1 × 1500 = 1700.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nimport pandas as pd\n\ndf = pd.DataFrame({"yas": [30, 40, 50], "bakiye": [1.0, 2.0, 3.0], "sehir": ["Ankara", "İzmir", "Bursa"]})\nct = ColumnTransformer([("sayi", StandardScaler(), ["yas", "bakiye"]), ("kat", OneHotEncoder(), ["sehir"])])\nprint(ct.fit_transform(df).shape)\n',
    o=['(3, 3)', '(3, 4)', '(3, 5)', '(3, 6)'], a=2,
    why='İki sayısal sütun ölçeklenip aynen kalır (2), şehir üç farklı değer için üç 0/1 sütuna açılır (3): toplam 5 sütun.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Sayısal sütunları ölçekleyen, şehri one-hot kodlayan ve lojistik regresyon eğiten pipeline\'ı kuran programın satırlarını sırala.</p>',
    lines=['import pandas as pd', 'from sklearn.compose import ColumnTransformer', 'from sklearn.preprocessing import StandardScaler, OneHotEncoder', 'from sklearn.pipeline import Pipeline', 'from sklearn.linear_model import LogisticRegression',
           'df = pd.DataFrame({"sikayet": [0, 3, 1, 4, 0, 2], "sehir": ["A", "B", "A", "B", "A", "A"], "churn": [0, 1, 0, 1, 0, 1]})',
           'hazirlik = ColumnTransformer([("sayi", StandardScaler(), ["sikayet"]), ("kat", OneHotEncoder(handle_unknown="ignore"), ["sehir"])])',
           'pipe = Pipeline([("hazirlik", hazirlik), ("model", LogisticRegression())]).fit(df[["sikayet", "sehir"]], df["churn"])',
           'print(pipe.predict(pd.DataFrame({"sikayet": [5], "sehir": ["C"]})).tolist())'],
    expect='[1]\n', hint='Hazırlık adımı pipeline\'dan önce tanımlanmalı; tahmin en sonda.',
    why='Veri → ColumnTransformer → Pipeline ve fit → tahmin. Görülmemiş şehir "C" handle_unknown="ignore" sayesinde hata vermez; 5 şikayet yüksek risk olarak [1] tahmin edilir.'))

ex.append(dict(t='code', id='proje-ml-1', stage='Rehberli', diff=2,
    q='<p>Veri üreticiyi tamamla. <code>veri_uret(n, seed)</code> start kodunda sütunları üretiyor; eksik olan churn hesabı. Şu doğrusal skoru hesapla: <code>z = -0.6 + 1.1*sikayet_sayisi - 0.5*(urun_sayisi - 1) - 0.015*kidem_ay - 0.06*(aylik_islem - 12) - 0.9*mobil_aktif</code>, olasılığı <code>1 / (1 + exp(-z))</code> ile bul, <code>rng.random(n) &lt; olasilik</code> ile 0/1 churn sütunu üret (int).</p>',
    guide=['z serisini df sütunlarından formüle göre hesapla.', 'np.exp ile sigmoid uygula.', 'Aynı rng ile rng.random(n) çek ve olasılıkla karşılaştır.', '.astype(int) ile df["churn"] sütununa yaz.'],
    example='import numpy as np\nrng = np.random.default_rng(0)\np = np.array([0.1, 0.9, 0.5])\nprint((rng.random(3) < p).astype(int))\n',
    start=VERI.split('    z = (')[0] + '    # TODO: z skorunu hesapla\n    # TODO: sigmoid ile olasılığa çevir\n    # TODO: df["churn"] = ...\n    return df\n',
    sol=VERI,
    tests='a = veri_uret(500, 1)\nb = veri_uret(500, 1)\nassert "churn" in a.columns, "churn sütunu eklenmeli"\nassert a.equals(b), "Aynı seed aynı veriyi üretmeli"\nassert not a.equals(veri_uret(500, 2)), "Farklı seed farklı veri üretmeli"\nassert set(a["churn"].unique()) <= {0, 1}, "churn 0/1 olmalı"\noran = a["churn"].mean()\nassert 0.15 < oran < 0.4, f"Churn oranı gerçekçi aralıkta (%15-40) olmalı; gelen {oran:.3f}"\nassert a[a["sikayet_sayisi"] >= 2]["churn"].mean() > a[a["sikayet_sayisi"] == 0]["churn"].mean() + 0.2, "Şikayeti çok olanların churn oranı belirgin yüksek olmalı"\nassert a[a["mobil_aktif"] == 1]["churn"].mean() < a[a["mobil_aktif"] == 0]["churn"].mean(), "Mobil aktifler daha az ayrılmalı"\n',
    hints=['Sütun işlemleri vektörel: df["sikayet_sayisi"] * 1.1 tüm satırlara uygulanır.', 'olasilik = 1 / (1 + np.exp(-z))', 'df["churn"] = (rng.random(n) < olasilik).astype(int)'],
    why='Lojistik (sigmoid) fonksiyonu doğrusal bir skoru 0-1 arası olasılığa çevirir; olasılıkla rastgele çekim de veriye gerçekçi gürültü ekler. Aynı rng nesnesini kullanmak tüm veriyi tek seed\'e bağlar.'))
ex.append(dict(t='code', id='proje-ml-2', stage='Rehberli', diff=1,
    q='<p><code>ozellik_ekle(df)</code>: orijinal DataFrame\'i <b>değiştirmeden</b> kopyasına üç sütun eklesin: <code>islem_urun_orani</code> = aylik_islem / urun_sayisi, <code>yeni_musteri</code> = kidem_ay &lt; 12 ise 1 değilse 0 (int), <code>bakiye_log</code> = <code>np.log1p(bakiye)</code>.</p>',
    guide=['df = df.copy() ile başla.', 'Oranı iki sütunun bölümüyle hesapla.', 'Karşılaştırmanın sonucunu .astype(int) ile 0/1 yap.', 'np.log1p ile bakiye_log ekle ve kopyayı döndür.'],
    example='import pandas as pd\nd = pd.DataFrame({"a": [5, 20]})\nd2 = d.copy()\nd2["buyuk"] = (d2["a"] > 10).astype(int)\nprint(d.columns.tolist(), d2["buyuk"].tolist())\n',
    start='import numpy as np\nimport pandas as pd\n\ndef ozellik_ekle(df):\n    # TODO: kopya al ve üç özelliği ekle\n    return df\n',
    sol='import numpy as np\nimport pandas as pd\n\n' + OZELLIK,
    tests='d = pd.DataFrame({"aylik_islem": [12, 3], "urun_sayisi": [4, 1], "kidem_ay": [5, 40], "bakiye": [0.0, 99.0]})\nr = ozellik_ekle(d)\nassert r["islem_urun_orani"].tolist() == [3.0, 3.0], "12/4 ve 3/1 -> 3.0"\nassert r["yeni_musteri"].tolist() == [1, 0], "5 ay yeni (1), 40 ay değil (0)"\nassert abs(r["bakiye_log"].iloc[1] - np.log(100)) < 1e-9 and r["bakiye_log"].iloc[0] == 0, "log1p(0)=0, log1p(99)=log(100)"\nassert "yeni_musteri" not in d.columns, "Orijinal DataFrame değişmemeli (copy)"\n',
    hints=['Kopya almazsan çağıranın verisi de değişir (yan etki).', 'df["yeni_musteri"] = (df["kidem_ay"] < 12).astype(int)'],
    why='Özellik fonksiyonları saf (pure) olmalı: aynı girdiye aynı çıktı, yan etki yok. Böylece eğitimde ve canlıda aynı fonksiyon güvenle çağrılır.'))
ex.append(dict(t='code', id='proje-ml-3', stage='Rehberli', diff=2,
    q='<p><code>pipeline_kur(sayisal, kategorik)</code>: <code>ColumnTransformer</code> ile sayısal sütunlara <code>StandardScaler</code>, kategoriklere <code>OneHotEncoder(handle_unknown="ignore")</code> uygulasın; adımlar <code>"sayi"</code> ve <code>"kat"</code> adlı olsun. Bunu <code>Pipeline([("hazirlik", ...), ("model", LogisticRegression(max_iter=1000))])</code> içine koyup döndürsün (eğitmeden).</p>',
    guide=['ColumnTransformer\'a (ad, dönüştürücü, sütunlar) üçlülerinden oluşan liste ver.', 'Pipeline\'a ("hazirlik", ct) ve ("model", LogisticRegression(max_iter=1000)) adımlarını ver.', 'Eğitilmemiş pipeline\'ı döndür.'],
    example='from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\np = Pipeline([("olcek", StandardScaler()), ("model", LinearRegression())])\nprint(list(p.named_steps))\n',
    start='from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\ndef pipeline_kur(sayisal, kategorik):\n    hazirlik = None  # TODO: ColumnTransformer\n    return None      # TODO: Pipeline\n',
    sol=PIPE,
    tests='import pandas as pd\np = pipeline_kur(["sikayet", "kidem"], ["sehir"])\nassert list(p.named_steps) == ["hazirlik", "model"], "Adım adları hazirlik ve model olmalı"\nd = pd.DataFrame({"sikayet": [0, 3, 1, 4, 0, 2, 0, 5], "kidem": [50, 3, 40, 2, 70, 10, 90, 1], "sehir": ["A", "B", "A", "B", "A", "A", "B", "A"], "churn": [0, 1, 0, 1, 0, 1, 0, 1]})\np.fit(d[["sikayet", "kidem", "sehir"]], d["churn"])\nadlar = p.named_steps["hazirlik"].get_feature_names_out().tolist()\nassert adlar == ["sayi__sikayet", "sayi__kidem", "kat__sehir_A", "kat__sehir_B"], f"Sütun adları: {adlar}"\nyeni = pd.DataFrame({"sikayet": [4], "kidem": [2], "sehir": ["Z"]})\nassert p.predict(yeni).tolist() == [1], "Görülmemiş şehirde hata vermemeli (handle_unknown) ve riskli müşteriyi 1 tahmin etmeli"\nassert p.named_steps["model"].max_iter == 1000, "max_iter=1000 olmalı"\n',
    hints=['ColumnTransformer([("sayi", StandardScaler(), sayisal), ("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)])', 'Pipeline adımları (ad, nesne) demetleri listesidir.'],
    why='Hazırlık ve modeli tek nesnede tutmak, çapraz doğrulamada sızıntıyı önler ve canlıda "ölçeklemeyi unuttum" hatasını imkânsız kılar.'))
ex.append(dict(t='code', id='proje-ml-4', stage='Rehberli', diff=2,
    q='<p><code>cv_skoru(pipe, X, y)</code>: <code>StratifiedKFold(n_splits=5, shuffle=True, random_state=0)</code> ile <code>cross_val_score(..., scoring="roc_auc")</code> çalıştırsın; <code>(ortalama, std)</code> demetini 3 basamağa yuvarlı düz float olarak döndürsün. Veri üretici, özellik ve pipeline fonksiyonları start kodunda hazır.</p>',
    guide=['StratifiedKFold nesnesini parametrelerle kur.', 'cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc") çağır.', 'Skor dizisinin mean ve std değerlerini float + round(..., 3) ile döndür.'],
    example='import numpy as np\nskor = np.array([0.81, 0.79, 0.84])\nprint(round(float(skor.mean()), 3), round(float(skor.std()), 3))\n',
    start=VERI + OZELLIK + KOLON + PIPE + '\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\n\ndef cv_skoru(pipe, X, y):\n    # TODO: StratifiedKFold ve cross_val_score\n    return 0.0, 0.0\n',
    sol=VERI + OZELLIK + KOLON + PIPE + '\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\n\ndef cv_skoru(pipe, X, y):\n    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)\n    s = cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc")\n    return round(float(s.mean()), 3), round(float(s.std()), 3)\n',
    tests='from sklearn.model_selection import StratifiedKFold, cross_val_score\ndf = ozellik_ekle(veri_uret(600, 3))\nX, y = df[SAYISAL + KATEGORIK], df["churn"]\nort, std = cv_skoru(pipeline_kur(SAYISAL, KATEGORIK), X, y)\nbek = cross_val_score(pipeline_kur(SAYISAL, KATEGORIK), X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc")\nassert ort == round(float(bek.mean()), 3), f"Ortalama {round(float(bek.mean()), 3)} olmalı; gelen {ort}"\nassert std == round(float(bek.std()), 3), "Std aynı katlarla hesaplanmalı"\nassert 0.7 < ort < 1.0, "Model rastgeleden (0.5) belirgin iyi olmalı"\n',
    hints=['scoring="roc_auc" olasılık sıralamasını değerlendirir; eşikten bağımsızdır.', 'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)'],
    why='Tabakalı ve karıştırılmış katlar, dengesiz veride kararlı ve tekrarlanabilir bir skor verir; std ise modelin ne kadar oynak olduğunu gösterir.'))

ex.append(dict(t='code', id='proje-ml-5', stage='Kendin yaz', diff=1,
    q='<p><code>is_maliyeti(y_gercek, olasilik, esik, fp_maliyet, fn_maliyet)</code>: <code>olasilik &gt;= esik</code> olanları "teklif gönder" say; yanlış pozitif ve yanlış negatif sayılarını maliyetlerle çarpıp toplam maliyeti düz <code>int</code> ya da <code>float</code> olarak döndür. Girdiler liste ya da numpy dizisi olabilir.</p>',
    start='import numpy as np\n\ndef is_maliyeti(y_gercek, olasilik, esik, fp_maliyet, fn_maliyet):\n    pass\n',
    sol='import numpy as np\n\ndef is_maliyeti(y_gercek, olasilik, esik, fp_maliyet, fn_maliyet):\n    y = np.asarray(y_gercek)\n    t = np.asarray(olasilik) >= esik\n    fp = int((t & (y == 0)).sum())\n    fn = int((~t & (y == 1)).sum())\n    return fp * fp_maliyet + fn * fn_maliyet\n',
    tests='y = [1, 0, 1, 0, 0, 1]\np = [0.8, 0.4, 0.2, 0.1, 0.35, 0.6]\nassert is_maliyeti(y, p, 0.3, 100, 1500) == 1700, "2 FP + 1 FN = 1700"\nassert is_maliyeti(y, p, 0.5, 100, 1500) == 1500, "Eşik 0.5: 0 FP, 1 FN"\nassert is_maliyeti(y, p, 0.0, 100, 1500) == 300, "Herkese teklif: 3 FP, 0 FN"\nassert is_maliyeti(y, p, 1.01, 100, 1500) == 4500, "Hiç teklif yok: 3 FN"\nassert isinstance(is_maliyeti(np.array(y), np.array(p), 0.3, 100, 1500), (int, float)), "Düz sayı dönmeli"\n',
    hints=['Listeleri np.asarray ile diziye çevir; böylece & ve == eleman bazında çalışır.', 'FP: tahmin 1 ve gerçek 0; FN: tahmin 0 ve gerçek 1.'],
    why='Bu fonksiyon modeli iş diline bağlayan köprüdür: AUC yerine "kaç lira" konuşmayı sağlar.'))
ex.append(dict(t='code', id='proje-ml-6', stage='Kendin yaz', diff=2,
    q='<p><code>en_iyi_esik(y_gercek, olasilik, esikler, fp_maliyet=100, fn_maliyet=1500)</code>: verilen eşik listesinde toplam maliyeti en düşük eşiği bulsun; eşitlikte <b>küçük</b> eşiği seçsin. <code>(esik, maliyet)</code> döndürsün. Maliyet hesabını kendi yardımcı fonksiyonunla yap.</p>',
    start='import numpy as np\n\ndef en_iyi_esik(y_gercek, olasilik, esikler, fp_maliyet=100, fn_maliyet=1500):\n    pass\n',
    sol='import numpy as np\n\ndef _maliyet(y, p, e, fpm, fnm):\n    t = p >= e\n    return int((t & (y == 0)).sum()) * fpm + int((~t & (y == 1)).sum()) * fnm\n\ndef en_iyi_esik(y_gercek, olasilik, esikler, fp_maliyet=100, fn_maliyet=1500):\n    y, p = np.asarray(y_gercek), np.asarray(olasilik)\n    return min(((e, _maliyet(y, p, e, fp_maliyet, fn_maliyet)) for e in esikler), key=lambda x: (x[1], x[0]))\n',
    tests='y = [1, 0, 1, 0, 0, 1]\np = [0.8, 0.4, 0.2, 0.1, 0.35, 0.6]\nassert en_iyi_esik(y, p, [0.1, 0.3, 0.5, 0.7]) == (0.1, 300), f"FN pahalı: en düşük eşik kazanır; gelen {en_iyi_esik(y, p, [0.1, 0.3, 0.5, 0.7])}"\nassert en_iyi_esik(y, p, [0.38, 0.36]) == (0.36, 1600), "0.36 ve 0.38 aynı maliyette (1 FP + 1 FN): küçük eşik seçilmeli"\nassert en_iyi_esik(y, p, [0.1, 0.5, 0.9], fp_maliyet=1000, fn_maliyet=100) == (0.5, 100), "FP pahalıysa düşük eşik (0.1) pahalıya patlar; 0.5 kazanmalı"\n',
    hints=['min(..., key=lambda x: (maliyet, esik)) eşitliği küçük eşikle çözer.', 'Maliyet fonksiyonunu bir önceki alıştırmadaki gibi yaz.'],
    why='Eşik seçimi bir optimizasyondur: aday eşikleri dene, iş maliyetini en aza indireni seç. Eşitlik kuralını açıkça yazmak sonucu deterministik yapar.'))
ex.append(dict(t='code', id='proje-ml-7', stage='Kendin yaz', diff=2,
    q='<p><code>model_bayt(model)</code>: modeli <code>pickle</code> ile bir <code>io.BytesIO</code>\'ya yazıp <b>bayt</b> (bytes) olarak döndürsün. <code>model_yukle(veri)</code>: bu baytlardan modeli geri yüklesin. Test, yüklenen modelin aynı tahminleri verdiğini kontrol edecek.</p>',
    start='import io\nimport pickle\n\ndef model_bayt(model):\n    pass\n\ndef model_yukle(veri):\n    pass\n',
    sol='import io\nimport pickle\n\ndef model_bayt(model):\n    tampon = io.BytesIO()\n    pickle.dump(model, tampon)\n    return tampon.getvalue()\n\ndef model_yukle(veri):\n    return pickle.load(io.BytesIO(veri))\n',
    tests='import numpy as np\nfrom sklearn.linear_model import LogisticRegression\nX = np.array([[0.0], [1.0], [2.0], [3.0], [4.0], [5.0]])\ny = np.array([0, 0, 0, 1, 1, 1])\nm = LogisticRegression().fit(X, y)\nb = model_bayt(m)\nassert isinstance(b, bytes) and len(b) > 100, "bytes dönmeli"\nm2 = model_yukle(b)\nassert m2 is not m, "Yeni bir nesne yüklenmeli"\nassert np.allclose(m2.predict_proba(X), m.predict_proba(X)), "Yüklenen model aynı olasılıkları vermeli"\n',
    hints=['BytesIO bellekte bir dosya gibidir; getvalue() içindeki baytları verir.', 'Yüklerken io.BytesIO(veri) ile yeni bir tampon oluştur.'],
    why='Baytlara çevirmek, modeli diske, nesne deposuna ya da veritabanına aynı şekilde yazmanı sağlar. Unutma: pickle yalnızca güvendiğin kaynaktan yüklenir.'))

ex.append(dict(t='code', id='proje-ml-8', stage='Hata avı', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>teklif_listesi(pipe, X, esik)</code> churn olasılığı eşiğin üzerindeki müşterilerin <b>indekslerini</b> döndürmeli. Ama rapora en sadık müşteriler giriyor.</p>',
    start='import numpy as np\n\ndef teklif_listesi(pipe, X, esik):\n    olas = pipe.predict_proba(X)[:, 0]\n    return [int(i) for i in np.flatnonzero(olas >= esik)]\n',
    sol='import numpy as np\n\ndef teklif_listesi(pipe, X, esik):\n    olas = pipe.predict_proba(X)[:, 1]\n    return [int(i) for i in np.flatnonzero(olas >= esik)]\n',
    tests='import numpy as np\nfrom sklearn.linear_model import LogisticRegression\nX = np.array([[0], [1], [2], [6], [7], [8]], dtype=float)\ny = np.array([0, 0, 0, 1, 1, 1])\nm = LogisticRegression().fit(X, y)\nr = teklif_listesi(m, np.array([[0.0], [8.0], [7.5]]), 0.5)\nassert r == [1, 2], f"Çok şikayetli (8 ve 7.5) müşteriler listede olmalı; gelen {r}. predict_proba sütunları hangi sınıfa ait?"\n',
    hints=['predict_proba sütunları model.classes_ sırasındadır: [0, 1].', 'Churn (1) olasılığı ikinci sütundur: [:, 1].'],
    why='predict_proba(X)[:, 0] "kalma" olasılığıdır. Yanlış sütun, listeyi tamamen ters çevirir ve kampanya bütçesi en sadık müşterilere gider. Emin değilsen model.classes_\'a bak.'))
ex.append(dict(t='code', id='proje-ml-9', stage='Hata avı', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. Model Ankara, İzmir, Bursa müşterileriyle eğitildi. Canlıda ilk "Antalya" müşterisi gelince <code>skorla</code> çöktü. <code>pipeline_kur</code> fonksiyonunu düzelt; fonksiyon adları ve adımlar aynı kalsın.</p>',
    start='import pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\ndef pipeline_kur():\n    ct = ColumnTransformer([("sayi", StandardScaler(), ["sikayet"]), ("kat", OneHotEncoder(), ["sehir"])])\n    return Pipeline([("hazirlik", ct), ("model", LogisticRegression())])\n\ndef skorla(pipe, df):\n    return pipe.predict_proba(df[["sikayet", "sehir"]])[:, 1].round(2).tolist()\n',
    sol='import pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\ndef pipeline_kur():\n    ct = ColumnTransformer([("sayi", StandardScaler(), ["sikayet"]), ("kat", OneHotEncoder(handle_unknown="ignore"), ["sehir"])])\n    return Pipeline([("hazirlik", ct), ("model", LogisticRegression())])\n\ndef skorla(pipe, df):\n    return pipe.predict_proba(df[["sikayet", "sehir"]])[:, 1].round(2).tolist()\n',
    tests='egitim = pd.DataFrame({"sikayet": [0, 3, 1, 4, 0, 2, 0, 5, 1], "sehir": ["Ankara", "İzmir", "Bursa", "Ankara", "İzmir", "Bursa", "Ankara", "İzmir", "Bursa"], "churn": [0, 1, 0, 1, 0, 1, 0, 1, 0]})\np = pipeline_kur().fit(egitim[["sikayet", "sehir"]], egitim["churn"])\ntry:\n    s = skorla(p, pd.DataFrame({"sikayet": [4], "sehir": ["Antalya"]}))\nexcept ValueError as e:\n    assert False, f"Görülmemiş şehir hata verdi: {e}"\nassert len(s) == 1 and s[0] > 0.5, "Antalya müşterisi skorlanmalı; 4 şikayet yüksek risk"\n',
    hints=['OneHotEncoder varsayılan olarak eğitimde görmediği kategoride hata verir.', 'handle_unknown="ignore" görülmemiş kategoriyi tüm sütunları 0 olan bir satıra çevirir.'],
    why='Canlı veri her zaman eğitim verisinden fazlasını getirir: yeni şehir, yeni kanal, yeni ürün. handle_unknown="ignore" modelin çökmesini önler; ayrıca yeni kategorileri izleyip modeli düzenli yeniden eğitmek gerekir.'))

ex.append(dict(t='code', id='proje-ml-10', stage='Meydan okuma', diff=3,
    q='<p><code>en_onemli_ozellikler(pipe, n=3)</code>: eğitilmiş pipeline\'dan (adımlar <code>"hazirlik"</code> ve <code>"model"</code>) özellik adlarını <code>get_feature_names_out()</code> ile al, önekleri (<code>"sayi__"</code>, <code>"kat__"</code>; yani ilk <code>"__"</code>\'ye kadar olan kısım) at, katsayıların <b>mutlak değerine</b> göre büyükten küçüğe sıralayıp ilk n tanesini <code>(ad, katsayı 2 basamak, "artırır"/"azaltır")</code> demetleri olarak döndür.</p>',
    start=VERI + OZELLIK + KOLON + PIPE + '\ndef en_onemli_ozellikler(pipe, n=3):\n    pass\n',
    sol=VERI + OZELLIK + KOLON + PIPE + '\ndef en_onemli_ozellikler(pipe, n=3):\n    adlar = [a.split("__", 1)[1] for a in pipe.named_steps["hazirlik"].get_feature_names_out()]\n    katsayi = pipe.named_steps["model"].coef_[0]\n    sira = np.argsort(-np.abs(katsayi))[:n]\n    return [(adlar[i], round(float(katsayi[i]), 2), "artırır" if katsayi[i] > 0 else "azaltır") for i in sira]\n',
    tests='df = ozellik_ekle(veri_uret(1500, 5))\np = pipeline_kur(SAYISAL, KATEGORIK).fit(df[SAYISAL + KATEGORIK], df["churn"])\nr = en_onemli_ozellikler(p, 3)\nassert len(r) == 3 and all(len(x) == 3 for x in r), "3 adet (ad, katsayı, yön) demeti dönmeli"\nassert r[0][0] == "sikayet_sayisi" and r[0][2] == "artırır", f"En önemli özellik riski artıran sikayet_sayisi olmalı; gelen {r}"\nassert all("__" not in x[0] for x in r), "Önekler atılmalı"\nassert abs(r[0][1]) >= abs(r[1][1]) >= abs(r[2][1]), "Mutlak değere göre azalan sıra"\nassert any(x[0] == "mobil_aktif" and x[2] == "azaltır" for x in en_onemli_ozellikler(p, 5)), "mobil_aktif riski azaltan ilk 5 özellik arasında olmalı"\nassert type(r[0][1]) is float, "Katsayı düz float olmalı"\n',
    hints=['np.argsort(-np.abs(katsayi)) mutlak değere göre azalan sıra verir.', 'a.split("__", 1)[1] öneki atar; şehir adlarında "__" yoksa güvenlidir.'],
    why='İşaret yönü (artırır/azaltır) ile büyüklüğü birlikte sunmak, "neden?" sorusunun teknik olmayan cevabıdır. Ölçekleme sayesinde katsayılar karşılaştırılabilir hâldedir.'))
ex.append(dict(t='code', id='proje-ml-11', stage='Meydan okuma', diff=3,
    q='<p>Kampanya ekibi yalnızca en riskli %10\'a ulaşabiliyor. <code>ust_dilim_lift(y_gercek, olasilik, oran=0.1)</code>: olasılığa göre en yüksek <code>ceil(n * oran)</code> müşteriyi seç (eşit olasılıkta önce gelen indeks; kararlı sıralama), bu dilimdeki churn oranını genel churn oranına böl ve <b>lift</b>\'i 2 basamağa yuvarla. Genel oran 0 ise 0.0 döndür.</p>',
    start='import math\nimport numpy as np\n\ndef ust_dilim_lift(y_gercek, olasilik, oran=0.1):\n    pass\n',
    sol='import math\nimport numpy as np\n\ndef ust_dilim_lift(y_gercek, olasilik, oran=0.1):\n    y = np.asarray(y_gercek, dtype=float)\n    p = np.asarray(olasilik, dtype=float)\n    genel = y.mean() if len(y) else 0.0\n    if genel == 0:\n        return 0.0\n    k = math.ceil(len(y) * oran)\n    sira = np.argsort(-p, kind="stable")[:k]\n    return round(float(y[sira].mean() / genel), 2)\n',
    tests='y = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0]\np = [0.9, 0.8, 0.1, 0.7, 0.2, 0.3, 0.1, 0.05, 0.2, 0.15]\nassert ust_dilim_lift(y, p, 0.1) == 5.0, "En riskli 1 kişi churn: 1.0 / 0.2 = 5.0"\nassert ust_dilim_lift(y, p, 0.3) == 3.33, "En riskli 3 kişide 2 churn: 0.667 / 0.2 = 3.33"\nassert ust_dilim_lift(y, p, 1.0) == 1.0, "Herkes seçilirse lift 1"\nassert ust_dilim_lift([0, 0], [0.5, 0.4]) == 0.0, "Genel oran 0 -> 0.0"\nassert ust_dilim_lift([0, 1, 1], [0.5, 0.5, 0.1], 0.3) == 0.0, "Eşit olasılıkta önce gelen (indeks 0, churn değil) seçilmeli: lift 0.0"\n',
    hints=['np.argsort(-p, kind="stable") büyükten küçüğe sıralar ve eşitlikte orijinal sırayı korur.', 'Lift = dilim churn oranı / genel churn oranı.'],
    why='Lift, "modelle seçtiğimiz grupta churn rastgele seçime göre kaç kat fazla" sorusunu cevaplar; bütçesi sınırlı kampanyalarda AUC\'den daha anlaşılır bir iş ölçüsüdür.'))

ex.append(dict(t='code', id='proje-ml-12', stage='Mini proje', diff=2,
    q='<p>Yönetim raporu. <code>is_raporu(s)</code>: <code>s</code> sözlüğünde <code>musteri</code> (int), <code>churn_orani</code> (0-1), <code>auc</code>, <code>esik</code>, <code>teklif</code> (int), <code>model_maliyet</code>, <code>bos_maliyet</code> (int TL), <code>ozellikler</code> (ad listesi) var. Tam olarak şu biçimde çok satırlı metin döndür (sayılar binlik ayırıcı olarak nokta kullanır):</p><pre class="out">ILGAZ BANK - Müşteri Kaybı Raporu\nİncelenen müşteri: 250 (churn %24.8)\nModel kalitesi (ROC AUC): 0.812\nEşik 0.15 ile 112 müşteriye teklif önerilir.\nMaliyet: 31.400 TL (modelsiz 93.000 TL)\nTasarruf: 61.600 TL (%66.2)\nBaşlıca nedenler: sikayet_sayisi, mobil_aktif, urun_sayisi</pre><p>Tasarruf yüzdesi bos_maliyet\'e göre; bos_maliyet 0 ise yüzde 0.0.</p>',
    start='def is_raporu(s):\n    pass\n',
    sol='def tl(x):\n    return f"{x:,}".replace(",", ".")\n\ndef is_raporu(s):\n    tasarruf = s["bos_maliyet"] - s["model_maliyet"]\n    yuzde = 100 * tasarruf / s["bos_maliyet"] if s["bos_maliyet"] else 0.0\n    return "\\n".join([\n        "ILGAZ BANK - Müşteri Kaybı Raporu",\n        f"İncelenen müşteri: {s[\'musteri\']} (churn %{100 * s[\'churn_orani\']:.1f})",\n        f"Model kalitesi (ROC AUC): {s[\'auc\']:.3f}",\n        f"Eşik {s[\'esik\']:.2f} ile {s[\'teklif\']} müşteriye teklif önerilir.",\n        f"Maliyet: {tl(s[\'model_maliyet\'])} TL (modelsiz {tl(s[\'bos_maliyet\'])} TL)",\n        f"Tasarruf: {tl(tasarruf)} TL (%{yuzde:.1f})",\n        f"Başlıca nedenler: {\', \'.join(s[\'ozellikler\'])}",\n    ])\n',
    tests='s = {"musteri": 250, "churn_orani": 0.248, "auc": 0.81234, "esik": 0.15, "teklif": 112, "model_maliyet": 31400, "bos_maliyet": 93000, "ozellikler": ["sikayet_sayisi", "mobil_aktif", "urun_sayisi"]}\nbek = "ILGAZ BANK - Müşteri Kaybı Raporu\\nİncelenen müşteri: 250 (churn %24.8)\\nModel kalitesi (ROC AUC): 0.812\\nEşik 0.15 ile 112 müşteriye teklif önerilir.\\nMaliyet: 31.400 TL (modelsiz 93.000 TL)\\nTasarruf: 61.600 TL (%66.2)\\nBaşlıca nedenler: sikayet_sayisi, mobil_aktif, urun_sayisi"\nr = is_raporu(s)\nassert r == bek, f"Rapor farklı:\\n{r}"\ns2 = dict(s, model_maliyet=0, bos_maliyet=0, musteri=1250000)\nr2 = is_raporu(s2)\nassert "İncelenen müşteri: 1250000" in r2 and "Tasarruf: 0 TL (%0.0)" in r2, "bos_maliyet 0 iken sıfıra bölme olmamalı"\n',
    hints=['Binlik ayırıcı: f"{x:,}" virgül koyar; .replace(",", ".") ile Türkçe biçime çevir.', 'Satırları listede toplayıp "\\n".join ile birleştir; sondaki boşluk/yeni satır olmasın.'],
    why='Rapor, modelin değerini yöneticinin diline (müşteri, lira, yüzde, neden) çevirir. Biçim fonksiyonlarını (tl) ayırmak, aynı biçimi tüm raporlarda tutarlı kılar.'))
ex.append(dict(t='code', id='proje-ml-13', stage='Mini proje', diff=3,
    q='<p>Uçtan uca churn hattı. <code>uctan_uca(seed=7, n=1200)</code>: start kodundaki <code>veri_uret</code>, <code>ozellik_ekle</code>, <code>pipeline_kur</code>\'u kullanarak:</p><ol><li>Veriyi üret, özellikleri ekle; <code>train_test_split(test_size=0.25, stratify=y, random_state=0)</code>.</li><li>Eğitim setinde <code>cross_val_predict(..., cv=StratifiedKFold(5, shuffle=True, random_state=0), method="predict_proba")</code> ile olasılık al; <code>[0.05, 0.10, ..., 0.90]</code> eşiklerinden FP=300, FN=1500 maliyetle en ucuzunu seç (eşitlikte küçük).</li><li>Pipeline\'ı tüm eğitim setine fit et, test setinde olasılık üret.</li><li>Döndür: <code>{"auc": test AUC (3 basamak), "esik": seçilen eşik, "model_maliyet": test maliyeti, "bos_maliyet": eşik 1.01 maliyeti, "model": pickle baytları}</code>.</li></ol>',
    start=VERI + OZELLIK + KOLON + PIPE + '\nimport pickle\nfrom sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_predict\nfrom sklearn.metrics import roc_auc_score\n\ndef uctan_uca(seed=7, n=1200):\n    pass\n',
    sol=VERI + OZELLIK + KOLON + PIPE + '''
import pickle
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_predict
from sklearn.metrics import roc_auc_score

def maliyet(y, p, e, fp=300, fn=1500):
    t = p >= e
    return int((t & (y == 0)).sum()) * fp + int((~t & (y == 1)).sum()) * fn

def uctan_uca(seed=7, n=1200):
    df = ozellik_ekle(veri_uret(n, seed))
    X, y = df[SAYISAL + KATEGORIK], df["churn"].to_numpy()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
    pipe = pipeline_kur(SAYISAL, KATEGORIK)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
    oof = cross_val_predict(pipe, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
    esikler = [round(0.05 * i, 2) for i in range(1, 19)]
    esik = min(esikler, key=lambda e: (maliyet(y_tr, oof, e), e))
    pipe.fit(X_tr, y_tr)
    p = pipe.predict_proba(X_te)[:, 1]
    return {"auc": round(float(roc_auc_score(y_te, p)), 3), "esik": esik,
            "model_maliyet": maliyet(y_te, p, esik), "bos_maliyet": maliyet(y_te, p, 1.01),
            "model": pickle.dumps(pipe)}
''',
    tests='r = uctan_uca()\nassert set(r) == {"auc", "esik", "model_maliyet", "bos_maliyet", "model"}, f"Anahtarlar: {set(r)}"\nassert 0.7 < r["auc"] < 1.0, f"AUC makul olmalı: {r[\'auc\']}"\nassert 0.05 <= r["esik"] <= 0.5, f"FN pahalı olduğu için eşik düşük çıkmalı: {r[\'esik\']}"\nassert r["model_maliyet"] < r["bos_maliyet"] * 0.8, "Model, hiç teklif göndermemekten en az %20 ucuz olmalı"\nimport pickle\nm = pickle.loads(r["model"])\nyeni = ozellik_ekle(pd.DataFrame([{"yas": 30, "kidem_ay": 3, "urun_sayisi": 1, "aylik_islem": 2, "bakiye": 500.0, "sehir": "Van", "mobil_aktif": 0, "sikayet_sayisi": 4}]))\nassert m.predict_proba(yeni[SAYISAL + KATEGORIK])[0, 1] > 0.8, "Kaydedilen model yüklenip yeni (görülmemiş şehirli) riskli müşteriyi yüksek skorlamalı"\nr2 = uctan_uca()\nassert (r2["auc"], r2["esik"], r2["model_maliyet"]) == (r["auc"], r["esik"], r["model_maliyet"]), "Sonuçlar tekrarlanabilir olmalı (seed)"\n',
    hints=['Eşik listesi: [round(0.05 * i, 2) for i in range(1, 19)].', 'Eşiği eğitimdeki çapraz doğrulama tahminleriyle seç, test setine yalnızca raporlamak için dokun.', 'pickle.dumps(pipe) doğrudan bayt döndürür.'],
    why='Bu fonksiyon bitirme projesinin özetidir: tekrarlanabilir veri, sızıntısız eşik seçimi, test setinde dürüst raporlama ve teslim edilebilir model. Her adım ayrı test edilebilir parçalardan kuruldu.'))

lesson = dict(
    id='proje-ml', lv='ileri', mod='Bitirme', min=90, needs=['scikit-learn', 'pandas'],
    title='Bitirme projesi 2: Ilgaz Bank müşteri kaybı (churn) tahmini',
    sum='Sentetik banka verisi üretip keşfeder, özellik mühendisliği yapar, ColumnTransformer\'lı pipeline\'ı çapraz doğrulamayla değerlendirir, iş maliyetine göre eşik seçer, modeli açıklar, f-string ile yönetim raporu yazar ve modeli BytesIO ile kaydedip yüklersin.',
    goals=['Tekrarlanabilir sentetik veri üretip pandas ile churn oranlarını gruplara göre keşfedebilirim.',
           'Sızıntı yaratmayan özellikler türetip ColumnTransformer + LogisticRegression pipeline\'ı kurabilirim.',
           'StratifiedKFold ile ROC AUC ölçüp yanlış pozitif/negatif maliyetine göre karar eşiği seçebilirim.',
           'Katsayılarla özellik önemini açıklayıp sonuçları yönetim raporuna çevirebilirim.',
           'Modeli pickle ve BytesIO ile kaydedip yükleyebilir, görülmemiş kategorilere dayanıklı hâle getirebilirim.'],
    body=body, ex=ex,
    faq=[dict(q='Neden doğruluk (accuracy) yerine ROC AUC ve maliyet kullandık?', a='Churn oranı %18 iken herkese "kalır" diyen model %82 doğruluk alır ama tek bir müşteriyi yakalamaz. ROC AUC olasılık sıralamasının kalitesini ölçer, maliyet ise kararın iş sonucunu. İkisi birlikte doğru resmi verir.'),
         dict(q='FP ve FN maliyetlerini nereden bileceğim?', a='Finans ve pazarlama ekiplerinden: teklifin ortalama maliyeti (indirim, puan, çağrı merkezi zamanı) ve bir müşterinin ayrılınca kaybettirdiği ortalama değer (müşteri yaşam boyu değeri). Kesin değil, makul aralıklarla duyarlılık analizi yap.'),
         dict(q='Lojistik regresyon yerine daha güçlü bir model kullanmalı mıyım?', a='Önce bu temel çizgiyi kur ve ölç. Ardından HistGradientBoostingClassifier gibi bir modeli aynı pipeline, aynı CV ve aynı maliyet fonksiyonuyla karşılaştır. Kazanç küçükse açıklanabilir modeli tercih etmek bankacılıkta sık görülen bir karardır.'),
         dict(q='Model ne sıklıkla yeniden eğitilmeli?', a='Veri ve müşteri davranışı değiştikçe. Pratikte aylık ya da çeyreklik yeniden eğitim yaygındır; özellik dağılımlarını ve canlıdaki AUC\'yi izleyip belirgin bir düşüşte erken yeniden eğitim tetiklenir.'),
         dict(q='Sentetik veriyle kurduğum proje portföyde işe yarar mı?', a='Evet, eğer uçtan uca süreci (sızıntı kontrolü, CV, eşik, maliyet, rapor, model kaydı) net gösteriyorsa. README\'de verinin sentetik olduğunu ve hangi ilişkilerin bilerek konduğunu açıkça yaz; mümkünse açık bir veri setiyle (ör. telekom churn veri setleri) aynı hattı tekrar çalıştır.')],
    mistakes=[dict(bad='olas = pipe.predict_proba(X)[:, 0]', good='olas = pipe.predict_proba(X)[:, 1]   # classes_ == [0, 1]', why='İlk sütun "kalma" olasılığıdır; yanlış sütun teklif listesini tersine çevirir.'),
              dict(bad='X = StandardScaler().fit_transform(df[SAYISAL])\nX_tr, X_te = train_test_split(X)', good='pipe = pipeline_kur(SAYISAL, KATEGORIK)\npipe.fit(X_tr, y_tr)', why='Ölçekleyiciyi bölmeden önce tüm veriye fit etmek test bilgisini eğitime sızdırır; Pipeline hazırlığı yalnızca eğitim kısmına fit eder.'),
              dict(bad='esik = min(esikler, key=lambda e: maliyet(y_te, olas_te, e))\nprint(maliyet(y_te, olas_te, esik))', good='oof = cross_val_predict(pipe, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]\nesik = min(esikler, key=lambda e: maliyet(y_tr, oof, e))', why='Eşiği test setinde seçip aynı sette raporlamak iyimser bir sonuç verir; eşik eğitim verisinden seçilmelidir.'),
              dict(bad='OneHotEncoder()', good='OneHotEncoder(handle_unknown="ignore")', why='Varsayılan kodlayıcı canlıda ilk yeni kategoride (yeni şehir) hata verir.'),
              dict(bad='df["kapanis_nedeni"] = ...   # modele özellik olarak girdi', good='# yalnızca tahmin anında bilinen sütunlar: şikayet, ürün, kıdem, işlem', why='Churn\'den sonra oluşan bilgiler veri sızıntısıdır; test skoru harika, canlı performans çöp olur.')]
)

write(lesson, '/home/claude/py/v2/i3/proje-ml.js', 'İleri: proje-ml (bitirme projesi 2, churn tahmini)')
