/* PythonPatika — 'proje-ml' dersi uzantısı: Anadolu Bank gerçek verisiyle churn, servisleme ve PSI izleme (gerçek veri setleri) */
// needs: numpy, pandas, scikit-learn
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'proje-ml',
    min: 45,
    needs: ['numpy', 'pandas', 'scikit-learn'],
    html: `<h2>Derinleş: sentetik veriden gerçek bankaya</h2><p>Projenin ilk hâlinde churn verisini kendin ürettin; etiketi de sen yazdığın için model doğal olarak iyi çıktı. Gerçek işte etiket hazır gelmez, onu <b>tanımlarsın</b>. Bu bölümde aynı hattı <code>anadolu_bank</code> setiyle kuracağız: <code>bank_accounts</code> (849 hesap, <code>closed_date</code> kapanış tarihi), <code>bank_customers</code> (500 müşteri) ve <code>bank_txns</code> (2024 yılına ait 42.284 işlem). Sonuçlar sentetik veridekinden çok daha mütevazı çıkacak ve bu bir başarısızlık değil, gerçekçiliğin kendisi.</p><h3>1. Etiketi tanımlamak: anlık görüntü ve ufuk</h3><p>Manifestte <code>closed_date</code> "Kapanış tarihi (açıksa boş)" olarak tanımlı ve <code>status = "kapali"</code> ile birebir örtüşüyor. 2024 boyunca 42 müşteri 43 hesap kapatmış. Churn tanımımız: <b>kesim tarihinde (snapshot) en az bir açık hesabı olan müşteri, sonraki 60 gün içinde herhangi bir hesabını kapatırsa churn = 1</b>. Kesim tarihi, modelin canlıda skor üreteceği günü taklit eder: o güne kadar olan her şey özellik, sonrası etikettir.</p><pre class="py">import veri
import numpy as np
import pandas as pd

A = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])
C = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])
TX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],
              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")

def etiket_tablosu(snap, ufuk=60):
    s = pd.Timestamp(snap)
    acik = A[(A["opened_date"] &lt;= s) &amp; (A["closed_date"].isna() | (A["closed_date"] &gt; s))]
    kapanan = acik[(acik["closed_date"] &gt; s) &amp; (acik["closed_date"] &lt;= s + pd.Timedelta(days=ufuk))]
    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})
    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)
    e["snap"] = s
    return e

for sn in ["2024-04-01", "2024-07-01", "2024-10-01"]:
    e = etiket_tablosu(sn)
    print(sn, len(e), "müşteri,", int(e["churn"].sum()), "churn")
</pre><p>Her kesimde yalnızca 5–8 pozitif örnek var. Tek bir kesimle model kurulamaz; bu yüzden aylık kesimleri <b>üst üste koyarız</b> (Nisan–Temmuz eğitim, Ağustos–Ekim test). Bir müşteri birden çok kesimde yer alır; bu yüzden bölme rastgele değil <b>zamana göre</b> yapılır, aksi hâlde aynı müşterinin komşu ayları eğitim ve teste dağılıp sızıntı yaratır.</p><h3>2. 90 günlük pencere özellikleri</h3><p>Özellikler yalnızca kesimden önceki 90 günün işlemlerinden hesaplanır: işlem sayısı (90 ve 30 gün), maaş yatışı sayısı, son işlemden bu yana geçen gün ve <b>ivme</b> (son 30 günün, 90 günlük aylık ortalamaya oranı). Sınır koşulu kritiktir: <code>txn_time &lt; snap</code>. Bir gün bile fazlası geleceği sızdırır.</p><pre class="py">import veri
import numpy as np
import pandas as pd

A = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])
C = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])
TX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],
              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")

def ozellikler(snap, gun=90):
    s = pd.Timestamp(snap)
    t = TX[(TX["txn_time"] &lt; s) &amp; (TX["txn_time"] &gt;= s - pd.Timedelta(days=gun))]
    son30 = t[t["txn_time"] &gt;= s - pd.Timedelta(days=30)]
    g = pd.DataFrame({
        "islem_90": t.groupby("customer_id").size(),
        "islem_30": son30.groupby("customer_id").size(),
        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),
        "son": t.groupby("customer_id")["txn_time"].max(),
    }).fillna({"islem_30": 0, "maas_90": 0})
    g["son_islem_gun"] = (s - g["son"]).dt.days
    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)
    return g.drop(columns="son")

f = ozellikler("2024-07-01")
print(len(f), "müşterinin 90 günde işlemi var")
print(f.loc[[1, 41]].round(2))
</pre><div class="warn"><b>Pencerenin başı da önemli</b><code>bank_txns</code> 1 Ocak 2024'te başlıyor. 1 Mart kesiminde 90 günlük pencerenin bir kısmı veri öncesine düşer; işlem sayıları düşük, ivme yapay olarak yüksek çıkar. İlk geçerli kesim 1 Nisan'dır. Aşağıdaki PSI hesabı bu hatayı nasıl yakalayacağını gösteriyor.</div><h3>3. Model ve dürüst değerlendirme</h3><p>Derste kurduğun <code>ColumnTransformer</code> + <code>LogisticRegression(class_weight="balanced")</code> hattını aynen kullan. Zaman bölmeli testte ROC AUC yaklaşık 0,64, en riskli %10'luk dilimde churn oranı ortalamanın yaklaşık 2,8 katı. Sentetik verideki 0,8+ AUC'ye göre düşük, ama 26 pozitif örnekle eğitilen bir model için anlamlı bir sinyal. Raporda bu sayıyı güven aralığı ya da "pozitif sayısı az" notuyla verirsin; kampanya ekibi için önemli olan lift'tir.</p><h3>4. Servisleme: FastAPI ile skor uç noktası</h3><p>Eğitilen hattı <code>joblib</code> ile kaydedip küçük bir API arkasına koyarsın. Tarayıcıda FastAPI çalışmaz; kod gösterim amaçlıdır.</p><pre class="code"># servis.py  (pip install fastapi uvicorn joblib scikit-learn pandas)
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

model = joblib.load("churn_model.joblib")
app = FastAPI(title="Anadolu Bank churn")

class Musteri(BaseModel):
    islem_90: float
    islem_30: float
    maas_90: float
    son_islem_gun: float
    ivme: float
    risk_score: int
    kidem_yil: float
    segment: str

@app.post("/skor")
def skor(m: Musteri):
    olasilik = model.predict_proba(pd.DataFrame([m.model_dump()]))[0, 1]
    return {"churn_olasiligi": round(float(olasilik), 4)}
# Çalıştır: uvicorn servis:app --reload  -&gt;  http://127.0.0.1:8000/docs
</pre><div class="note"><b>Kendi bilgisayarında dene</b>Komut: <code>pip install fastapi uvicorn joblib</code>. Modeli eğittiğin defterde <code>joblib.dump(pipe, "churn_model.joblib")</code> çalıştır, sonra <code>uvicorn servis:app --reload</code>. Ayrıntılar FastAPI dersinde.</div><h3>5. İzleme: PSI ile veri kayması</h3><p>Etiket 60 gün sonra gelir; o zamana kadar modelin bozulduğunu <b>girdilere bakarak</b> anlarsın. <b>PSI</b> (population stability index) eğitim dağılımını referans alıp kutulara (genellikle 10 kantil) böler ve yeni dönemin aynı kutulardaki payıyla karşılaştırır: <code>PSI = Σ (yeni − ref) · ln(yeni / ref)</code>. Yaygın eşikler: &lt; 0,1 kararlı, 0,1–0,25 izle, &gt; 0,25 alarm. Aynı hesap model skorlarına da uygulanır.</p><pre class="py">import veri
import numpy as np
import pandas as pd

A = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])
C = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])
TX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],
              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")

def etiket_tablosu(snap, ufuk=60):
    s = pd.Timestamp(snap)
    acik = A[(A["opened_date"] &lt;= s) &amp; (A["closed_date"].isna() | (A["closed_date"] &gt; s))]
    kapanan = acik[(acik["closed_date"] &gt; s) &amp; (acik["closed_date"] &lt;= s + pd.Timedelta(days=ufuk))]
    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})
    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)
    e["snap"] = s
    return e

def ozellikler(snap, gun=90):
    s = pd.Timestamp(snap)
    t = TX[(TX["txn_time"] &lt; s) &amp; (TX["txn_time"] &gt;= s - pd.Timedelta(days=gun))]
    son30 = t[t["txn_time"] &gt;= s - pd.Timedelta(days=30)]
    g = pd.DataFrame({
        "islem_90": t.groupby("customer_id").size(),
        "islem_30": son30.groupby("customer_id").size(),
        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),
        "son": t.groupby("customer_id")["txn_time"].max(),
    }).fillna({"islem_30": 0, "maas_90": 0})
    g["son_islem_gun"] = (s - g["son"]).dt.days
    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)
    return g.drop(columns="son")

def veri_seti(snaplar):
    parcalar = []
    for sn in snaplar:
        d = etiket_tablosu(sn).merge(ozellikler(sn), on="customer_id", how="left")
        d = d.merge(C[["customer_id", "segment", "risk_score", "joined_date"]], on="customer_id")
        d["kidem_yil"] = (d["snap"] - d["joined_date"]).dt.days / 365.25
        d = d.fillna({"islem_90": 0, "islem_30": 0, "maas_90": 0, "son_islem_gun": 90, "ivme": 0})
        parcalar.append(d.drop(columns="joined_date"))
    return pd.concat(parcalar, ignore_index=True)

def psi(beklenen, gercek, kutu=10):
    beklenen = np.asarray(beklenen, dtype=float)
    gercek = np.asarray(gercek, dtype=float)
    kenar = np.unique(np.quantile(beklenen, np.linspace(0, 1, kutu + 1)))
    kenar[0], kenar[-1] = -np.inf, np.inf
    pb = np.histogram(beklenen, kenar)[0] / len(beklenen)
    pg = np.histogram(gercek, kenar)[0] / len(gercek)
    pb, pg = np.clip(pb, 1e-4, None), np.clip(pg, 1e-4, None)
    return float(np.sum((pg - pb) * np.log(pg / pb)))

egitim = veri_seti(pd.date_range("2024-04-01", "2024-07-01", freq="MS"))
for ad, yeni in [("Aralık", veri_seti(["2024-12-01"])), ("Mart (eksik pencere)", veri_seti(["2024-03-01"]))]:
    print(ad, {c: round(psi(egitim[c], yeni[c]), 3) for c in ["islem_90", "islem_30", "ivme"]})
</pre><p>Aralık kesiminde tüm PSI değerleri 0,03'ün altında: model güvenle skorlamaya devam edebilir. Mart kesiminde ivme için PSI 4'ün üstünde: bu bir pazar değişimi değil, veri hattı hatasıdır (pencere eksik). İzleme, modelin kendisinden çok veri hattını korur.</p>`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Kesim tarihi 1 Temmuz 2024 olan bir churn veri setine hangi özellik <b>sızıntı</b> yaratır?',
        o: ['1 Nisan – 30 Haziran arası işlem sayısı', 'Müşterinin risk puanı ve kıdem yılı', '1–15 Temmuz arasında yapılan işlem sayısı', 'Son 30 günün 90 güne oranı (ivme)'],
        a: 2,
        why: 'Kesim tarihinden sonraki her bilgi, canlıda skor üretildiği anda henüz bilinmez. 1–15 Temmuz işlemleri kapanış öncesi para çekmeyi yansıtabilir ve test skorunu yapay olarak şişirir.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Etiket tablosu 1 Temmuz kesimiyle kuruluyor (<code>etiket_tablosu</code> derstekiyle aynı). Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n\ne = etiket_tablosu("2024-07-01")\nprint(len(e), int(e["churn"].sum()), e.loc[e["churn"] == 1, "customer_id"].tolist()[:2])\n',
        o: ['481 6 [41, 97]', '500 6 [41, 97]', '481 42 [37, 41]', '481 18 [41, 97]'],
        a: 0,
        why: 'Kesimde açık hesabı olan 481 müşteri var. Yalnızca 1 Temmuz – 30 Ağustos arasında hesap kapatan 6 müşteri churn = 1 alır; yıl boyunca kapatan 42 müşterinin hepsi değil.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Veri kalitesi kontrolü: kapanmış hesaplarda kapanıştan sonra işlem var mı? Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\nx = TX.merge(A[["account_id", "closed_date"]], on="account_id")\nsonra = x[x["txn_time"] > x["closed_date"]]\nprint(len(sonra), sonra["account_id"].nunique() > 0)\n',
        o: ['88 True', '0 False', '938 True', '88 False'],
        a: 0,
        why: 'Kapanış tarihinden sonra 88 işlem görünüyor (ör. kapanış günü saat içindeki işlemler ya da kayıt gecikmesi). Etiket tanımı kapanış TARİHİNE dayandığı için bu kayıtlar özelliklerde kesimden önce kalır; yine de veri kalitesi notuna yazılır.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>PSI fonksiyonunun gövdesini sırala: referans kantillerinden kutu kenarlarını çıkar, uçları sonsuza aç, iki dağılımın kutu paylarını hesapla, sıfırları kırp ve toplamı döndür.</p>',
        needs: ['numpy'],
        lines: ['import numpy as np', 'def psi(b, g, kutu=10):', '    kenar = np.unique(np.quantile(b, np.linspace(0, 1, kutu + 1)))', '    kenar[0], kenar[-1] = -np.inf, np.inf', '    pb = np.clip(np.histogram(b, kenar)[0] / len(b), 1e-4, None)', '    pg = np.clip(np.histogram(g, kenar)[0] / len(g), 1e-4, None)', '    return float(np.sum((pg - pb) * np.log(pg / pb)))', 'print(round(psi(np.arange(100), np.arange(100)), 4), psi(np.arange(100), np.arange(50, 150)) > 0.25)'],
        expect: '0.0 True\n',
        hint: 'Kenarlar paylardan önce, paylar toplamdan önce hesaplanır.',
        why: 'Aynı dağılımda PSI 0\'dır. Yarısı referansın dışına kayan dağılımda PSI alarm eşiğini (0,25) aşar. Uçları sonsuza açmak, referans aralığı dışındaki yeni değerlerin de bir kutuya düşmesini sağlar.'
      },
      {
        t: 'code',
        id: 'proje-ml-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>etiket_tablosu(snap, ufuk=60)</code>: kesim tarihi <code>snap</code>\'te en az bir açık hesabı olan müşterileri (açılış ≤ snap ve kapanış boş ya da &gt; snap) bul. Bu açık hesaplardan biri <code>(snap, snap + ufuk gün]</code> aralığında kapanırsa müşterinin <code>churn</code>\'ü 1, değilse 0. Sütunlar: customer_id (artan), churn, snap. <code>A</code> (hesaplar) yüklü.</p>',
        guide: ['s = pd.Timestamp(snap)', 'Açık hesap maskesi: (opened_date <= s) & (closed_date isna | closed_date > s).', 'Kapanan: açıklardan closed_date > s ve <= s + Timedelta(days=ufuk).', 'Müşteri listesi açık hesaplardan; churn = isin(kapananların customer_id).astype(int).'],
        example: 'import pandas as pd\nh = pd.DataFrame({"m": [1, 2], "kapanis": pd.to_datetime([None, "2024-03-10"])})\ns = pd.Timestamp("2024-03-01")\nprint(((h["kapanis"] > s) & (h["kapanis"] <= s + pd.Timedelta(days=30))).tolist())\n',
        start: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    # TODO: açık hesaplar, ufuk içinde kapananlar, müşteri tablosu\n    return pd.DataFrame()\n',
        sol: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n',
        tests: 'e = etiket_tablosu("2024-07-01")\nassert list(e.columns) == ["customer_id", "churn", "snap"], f"Sütunlar: {list(e.columns)}"\nassert len(e) == 481 and int(e["churn"].sum()) == 6, f"481 müşteri ve 6 churn beklenir: {len(e)}, {e[\'churn\'].sum()}"\nassert e.loc[e["churn"] == 1, "customer_id"].tolist() == [41, 97, 114, 134, 294, 355], "Churn eden müşteriler"\nassert [int(etiket_tablosu(s)["churn"].sum()) for s in ("2024-04-01", "2024-05-01", "2024-10-01")] == [5, 8, 6], "Diğer kesimler"\nassert int(etiket_tablosu("2024-07-01", ufuk=180)["churn"].sum()) > 6, "Ufuk uzayınca daha çok churn"\n',
        hints: ['NaT ile karşılaştırma False döner; açık hesap için isna() ayrıca kontrol edilmeli.', 'Müşteri listesini yalnızca açık hesaplardan kur; kesimden önce tüm hesaplarını kapatmış müşteri zaten kaybedilmiştir.'],
        why: 'Etiket tanımı kesim tarihine ve ufka bağlıdır: aynı veri farklı tanımla farklı churn oranı verir. Tanımı README\'de açıkça yazmak bu yüzden zorunludur.'
      },
      {
        t: 'code',
        id: 'proje-ml-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>ozellikler(snap, gun=90)</code>: kesimden önceki <code>gun</code> günün işlemlerinden (<code>snap - gun ≤ txn_time &lt; snap</code>) müşteri başına şu sütunları hesapla: <code>islem_90</code> (işlem sayısı), <code>islem_30</code> (son 30 gün), <code>maas_90</code> (<code>txn_type == "maas"</code> sayısı), <code>son_islem_gun</code> (snap − son işlem, gün), <code>ivme</code> = islem_30 / (islem_90 / 3). Index customer_id. <code>TX</code> (müşteri numaralı işlemler) yüklü.</p>',
        guide: ['Pencere maskesi: (txn_time < s) & (txn_time >= s - Timedelta(days=gun)).', 'Son 30 gün için ikinci bir maske.', 'Her sayımı groupby("customer_id").size() ile al ve tek DataFrame\'de topla; olmayanları 0 yap.', 'son_islem_gun ve ivme\'yi hesapla, yardımcı sütunu at.'],
        example: 'import pandas as pd\nt = pd.DataFrame({"m": [1, 1, 2], "z": pd.to_datetime(["2024-06-01", "2024-06-20", "2024-05-01"])})\ns = pd.Timestamp("2024-07-01")\ng = pd.DataFrame({"n": t.groupby("m").size(), "son": t.groupby("m")["z"].max()})\ng["gun"] = (s - g["son"]).dt.days\nprint(g)\n',
        start: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[TX["txn_time"] < s]   # TODO: pencerenin başını da sınırla\n    # TODO: sayımlar, son_islem_gun, ivme\n    return pd.DataFrame()\n',
        sol: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] < s) & (TX["txn_time"] >= s - pd.Timedelta(days=gun))]\n    son30 = t[t["txn_time"] >= s - pd.Timedelta(days=30)]\n    g = pd.DataFrame({\n        "islem_90": t.groupby("customer_id").size(),\n        "islem_30": son30.groupby("customer_id").size(),\n        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),\n        "son": t.groupby("customer_id")["txn_time"].max(),\n    }).fillna({"islem_30": 0, "maas_90": 0})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)\n    return g.drop(columns="son")\n',
        tests: 'f = ozellikler("2024-07-01")\nassert len(f) == 465, f"465 müşterinin 90 günde işlemi olmalı, {len(f)} geldi"\nassert sorted(f.columns) == ["islem_30", "islem_90", "ivme", "maas_90", "son_islem_gun"], f"Sütunlar: {list(f.columns)}"\nassert f.loc[41, ["islem_90", "islem_30", "maas_90", "son_islem_gun"]].tolist() == [35, 10, 0, 0], f"41: {f.loc[41].tolist()}"\nassert round(float(f.loc[1, "ivme"]), 3) == 1.2, "1 numaralı müşteride ivme 6 / (15 / 3) = 1.2"\nassert f.loc[1, "islem_90"] == 15, "Kesimden SONRAKİ işlemler sayılmamalı (43 değil 15)"\n',
        hints: ['groupby sayımında işlemi olmayan müşteri satırı oluşmaz; birleştirince NaN olur, fillna(0) ile düzelt.', 'Kesim tarihindeki (snap) işlemler de geleceğe aittir: < kullan, <= değil.'],
        why: 'Pencerenin iki ucu da sınırlı olmalı: üst sınır sızıntıyı, alt sınır pencerenin her kesimde aynı uzunlukta olmasını sağlar.'
      },
      {
        t: 'code',
        id: 'proje-ml-v3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['numpy'],
        q: '<p><code>psi(beklenen, gercek, kutu=10)</code>: referans dağılımın (<code>beklenen</code>) kantillerinden kutu kenarlarını çıkar (<code>np.unique</code> ile tekrarları at), ilk ve son kenarı <code>-inf</code>/<code>inf</code> yap. İki dağılımın kutu paylarını hesapla, 1e-4 altını 1e-4\'e kırp ve <code>Σ (pg − pb) · ln(pg / pb)</code> döndür (float).</p>',
        guide: ['np.quantile(beklenen, np.linspace(0, 1, kutu + 1))', 'np.histogram(x, kenar)[0] / len(x) kutu paylarını verir.', 'np.clip(p, 1e-4, None) log(0) hatasını önler.'],
        example: 'import numpy as np\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8])\nkenar = np.quantile(x, [0, 0.5, 1])\nprint(kenar, np.histogram(x, kenar)[0])\n',
        start: 'import numpy as np\n\ndef psi(beklenen, gercek, kutu=10):\n    # TODO\n    return 0.0\n',
        sol: 'import numpy as np\n\ndef psi(beklenen, gercek, kutu=10):\n    beklenen = np.asarray(beklenen, dtype=float)\n    gercek = np.asarray(gercek, dtype=float)\n    kenar = np.unique(np.quantile(beklenen, np.linspace(0, 1, kutu + 1)))\n    kenar[0], kenar[-1] = -np.inf, np.inf\n    pb = np.histogram(beklenen, kenar)[0] / len(beklenen)\n    pg = np.histogram(gercek, kenar)[0] / len(gercek)\n    pb, pg = np.clip(pb, 1e-4, None), np.clip(pg, 1e-4, None)\n    return float(np.sum((pg - pb) * np.log(pg / pb)))\n',
        tests: 'rng = np.random.default_rng(0)\nref = rng.normal(0, 1, 5000)\nassert psi(ref, ref) == 0.0, "Aynı dağılımda PSI 0"\nassert psi(ref, rng.normal(0, 1, 5000)) < 0.01, "Aynı kaynaktan yeni örnek: kararlı"\nkay = psi(ref, rng.normal(0.5, 1, 5000))\nassert 0.2 < kay < 0.3, f"Yarım standart sapma kayma ~0.25 PSI vermeli, {kay:.3f}"\nassert psi(ref, rng.normal(3, 1, 5000)) > 1, "Büyük kayma çok yüksek PSI"\nassert psi([1, 1, 1, 2], [1, 2, 2, 2]) > 0, "Tekrarlı kenarlar (np.unique) hata vermemeli"\n',
        hints: ['Uçları sonsuza açmazsan referans aralığı dışındaki yeni değerler hiçbir kutuya düşmez.', 'Payları kırpmazsan boş kutuda log(0) = -inf olur.'],
        why: 'PSI simetrik bir ıraksama ölçüsüdür. Yarım standart sapmalık kayma yaklaşık 0,25 verir: alarm eşiği tam olarak bu büyüklükteki kaymayı yakalamak için seçilmiştir.'
      },
      {
        t: 'code',
        id: 'proje-ml-v4',
        stage: 'Kendin yaz',
        diff: 3,
        needs: ['pandas', 'scikit-learn'],
        q: '<p><code>model_degerlendir()</code>: <code>veri_seti</code> (verildi) ile Nisan–Temmuz 2024 aylık kesimlerini eğitim, Ağustos–Ekim kesimlerini test seti yap. <code>ColumnTransformer</code> (SAYISAL → StandardScaler, KATEGORIK → OneHotEncoder(handle_unknown="ignore")) + <code>LogisticRegression(max_iter=1000, class_weight="balanced")</code> hattını eğit. Testte <code>{"egitim_pozitif": int, "test_pozitif": int, "auc": 3 basamak, "lift10": 2 basamak}</code> döndür; lift10 = en yüksek olasılıklı ceil(%10) satırdaki churn oranı / testin genel churn oranı.</p>',
        start: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] < s) & (TX["txn_time"] >= s - pd.Timedelta(days=gun))]\n    son30 = t[t["txn_time"] >= s - pd.Timedelta(days=30)]\n    g = pd.DataFrame({\n        "islem_90": t.groupby("customer_id").size(),\n        "islem_30": son30.groupby("customer_id").size(),\n        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),\n        "son": t.groupby("customer_id")["txn_time"].max(),\n    }).fillna({"islem_30": 0, "maas_90": 0})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)\n    return g.drop(columns="son")\n\ndef veri_seti(snaplar):\n    parcalar = []\n    for sn in snaplar:\n        d = etiket_tablosu(sn).merge(ozellikler(sn), on="customer_id", how="left")\n        d = d.merge(C[["customer_id", "segment", "risk_score", "joined_date"]], on="customer_id")\n        d["kidem_yil"] = (d["snap"] - d["joined_date"]).dt.days / 365.25\n        d = d.fillna({"islem_90": 0, "islem_30": 0, "maas_90": 0, "son_islem_gun": 90, "ivme": 0})\n        parcalar.append(d.drop(columns="joined_date"))\n    return pd.concat(parcalar, ignore_index=True)\nSAYISAL = ["islem_90", "islem_30", "maas_90", "son_islem_gun", "ivme", "risk_score", "kidem_yil"]\nKATEGORIK = ["segment"]\nimport math\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.metrics import roc_auc_score\n\ndef model_degerlendir():\n    pass\n',
        sol: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] < s) & (TX["txn_time"] >= s - pd.Timedelta(days=gun))]\n    son30 = t[t["txn_time"] >= s - pd.Timedelta(days=30)]\n    g = pd.DataFrame({\n        "islem_90": t.groupby("customer_id").size(),\n        "islem_30": son30.groupby("customer_id").size(),\n        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),\n        "son": t.groupby("customer_id")["txn_time"].max(),\n    }).fillna({"islem_30": 0, "maas_90": 0})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)\n    return g.drop(columns="son")\n\ndef veri_seti(snaplar):\n    parcalar = []\n    for sn in snaplar:\n        d = etiket_tablosu(sn).merge(ozellikler(sn), on="customer_id", how="left")\n        d = d.merge(C[["customer_id", "segment", "risk_score", "joined_date"]], on="customer_id")\n        d["kidem_yil"] = (d["snap"] - d["joined_date"]).dt.days / 365.25\n        d = d.fillna({"islem_90": 0, "islem_30": 0, "maas_90": 0, "son_islem_gun": 90, "ivme": 0})\n        parcalar.append(d.drop(columns="joined_date"))\n    return pd.concat(parcalar, ignore_index=True)\nSAYISAL = ["islem_90", "islem_30", "maas_90", "son_islem_gun", "ivme", "risk_score", "kidem_yil"]\nKATEGORIK = ["segment"]\nimport math\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.metrics import roc_auc_score\n\ndef model_degerlendir():\n    tr = veri_seti(pd.date_range("2024-04-01", "2024-07-01", freq="MS"))\n    te = veri_seti(pd.date_range("2024-08-01", "2024-10-01", freq="MS"))\n    hazirlik = ColumnTransformer([("s", StandardScaler(), SAYISAL), ("k", OneHotEncoder(handle_unknown="ignore"), KATEGORIK)])\n    pipe = make_pipeline(hazirlik, LogisticRegression(max_iter=1000, class_weight="balanced"))\n    pipe.fit(tr[SAYISAL + KATEGORIK], tr["churn"])\n    p = pipe.predict_proba(te[SAYISAL + KATEGORIK])[:, 1]\n    n = math.ceil(len(te) * 0.1)\n    ust = te["churn"].to_numpy()[np.argsort(-p)[:n]]\n    return {"egitim_pozitif": int(tr["churn"].sum()), "test_pozitif": int(te["churn"].sum()),\n            "auc": round(float(roc_auc_score(te["churn"], p)), 3),\n            "lift10": round(float(ust.mean() / te["churn"].mean()), 2)}\n',
        tests: 'r = model_degerlendir()\nassert r["egitim_pozitif"] == 26 and r["test_pozitif"] == 18, f"Pozitif sayıları: {r}"\nassert r["auc"] == 0.638, f"AUC: {r[\'auc\']}"\nassert r["lift10"] == 2.76, f"Lift: {r[\'lift10\']}"\n',
        hints: ['pd.date_range("2024-04-01", "2024-07-01", freq="MS") dört ay başı üretir.', 'Bölme zamana göre: rastgele train_test_split kullanma.', 'np.argsort(-p)[:n] en yüksek n olasılığın indeksleri.'],
        why: '26 pozitif örnekle AUC 0,64 mütevazı ama gerçek; en riskli %10\'luk dilim yine de ortalamanın 2,8 katı churn içeriyor. Sentetik verideki parlak sonuçlar etiketi senin yazmandan geliyordu.'
      },
      {
        t: 'code',
        id: 'proje-ml-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. Ekip bu <code>ozellikler</code> fonksiyonuyla eğittiği modelde testte çok yüksek skor gördü ama canlıda model çöktü. 1 Temmuz kesiminde 1 numaralı müşterinin <code>islem_90</code> değeri 15 olmalıyken 43 çıkıyor.</p>',
        start: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[TX["txn_time"] >= s - pd.Timedelta(days=gun)]\n    g = pd.DataFrame({"islem_90": t.groupby("customer_id").size(), "son": t.groupby("customer_id")["txn_time"].max()})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    return g.drop(columns="son")\n',
        sol: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] >= s - pd.Timedelta(days=gun)) & (TX["txn_time"] < s)]\n    g = pd.DataFrame({"islem_90": t.groupby("customer_id").size(), "son": t.groupby("customer_id")["txn_time"].max()})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    return g.drop(columns="son")\n',
        tests: 'f = ozellikler("2024-07-01")\nassert f.loc[1, "islem_90"] == 15, f"1 numaralı müşteri: {f.loc[1, \'islem_90\']}"\nassert (f["son_islem_gun"] >= 0).all(), "Son işlem kesimden sonra olamaz (negatif gün = gelecek bilgisi)"\n',
        hints: ['Pencerenin üst sınırı nerede?', 'Negatif son_islem_gun değerleri neyi gösterir?'],
        why: 'Üst sınır olmayınca kesimden sonraki tüm 2024 işlemleri özelliğe girer; kapanıştan hemen önceki para çekişleri modele "geleceği" söyler. Negatif son_islem_gun, sızıntının en kolay görülen işaretidir.'
      },
      {
        t: 'code',
        id: 'proje-ml-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p><code>izleme_raporu(egitim, yeni, sutunlar)</code>: her sütun için <code>psi</code> (verildi) hesapla ve <code>{sutun: (psi_4_basamak, durum)}</code> döndür; durum: PSI &lt; 0.1 → <code>"kararlı"</code>, 0.1 ≤ PSI &lt; 0.25 → <code>"izle"</code>, ≥ 0.25 → <code>"alarm"</code>. Ayrıca <code>alarm_var(rapor)</code> herhangi bir alarm varsa True döndürsün. Testler eğitim kesimlerini (Nisan–Temmuz) Aralık ve eksik pencereli Mart kesimleriyle karşılaştırır.</p>',
        start: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] < s) & (TX["txn_time"] >= s - pd.Timedelta(days=gun))]\n    son30 = t[t["txn_time"] >= s - pd.Timedelta(days=30)]\n    g = pd.DataFrame({\n        "islem_90": t.groupby("customer_id").size(),\n        "islem_30": son30.groupby("customer_id").size(),\n        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),\n        "son": t.groupby("customer_id")["txn_time"].max(),\n    }).fillna({"islem_30": 0, "maas_90": 0})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)\n    return g.drop(columns="son")\n\ndef veri_seti(snaplar):\n    parcalar = []\n    for sn in snaplar:\n        d = etiket_tablosu(sn).merge(ozellikler(sn), on="customer_id", how="left")\n        d = d.merge(C[["customer_id", "segment", "risk_score", "joined_date"]], on="customer_id")\n        d["kidem_yil"] = (d["snap"] - d["joined_date"]).dt.days / 365.25\n        d = d.fillna({"islem_90": 0, "islem_30": 0, "maas_90": 0, "son_islem_gun": 90, "ivme": 0})\n        parcalar.append(d.drop(columns="joined_date"))\n    return pd.concat(parcalar, ignore_index=True)\n\ndef psi(beklenen, gercek, kutu=10):\n    beklenen = np.asarray(beklenen, dtype=float)\n    gercek = np.asarray(gercek, dtype=float)\n    kenar = np.unique(np.quantile(beklenen, np.linspace(0, 1, kutu + 1)))\n    kenar[0], kenar[-1] = -np.inf, np.inf\n    pb = np.histogram(beklenen, kenar)[0] / len(beklenen)\n    pg = np.histogram(gercek, kenar)[0] / len(gercek)\n    pb, pg = np.clip(pb, 1e-4, None), np.clip(pg, 1e-4, None)\n    return float(np.sum((pg - pb) * np.log(pg / pb)))\n\ndef izleme_raporu(egitim, yeni, sutunlar):\n    pass\n\ndef alarm_var(rapor):\n    pass\n',
        sol: 'import veri\nimport numpy as np\nimport pandas as pd\n\nA = veri.oku("anadolu_bank", "bank_accounts", parse_dates=["opened_date", "closed_date"])\nC = veri.oku("anadolu_bank", "bank_customers", parse_dates=["joined_date"])\nTX = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"],\n              parse_dates=["txn_time"]).merge(A[["account_id", "customer_id"]], on="account_id")\n\ndef etiket_tablosu(snap, ufuk=60):\n    s = pd.Timestamp(snap)\n    acik = A[(A["opened_date"] <= s) & (A["closed_date"].isna() | (A["closed_date"] > s))]\n    kapanan = acik[(acik["closed_date"] > s) & (acik["closed_date"] <= s + pd.Timedelta(days=ufuk))]\n    e = pd.DataFrame({"customer_id": sorted(acik["customer_id"].unique())})\n    e["churn"] = e["customer_id"].isin(kapanan["customer_id"]).astype(int)\n    e["snap"] = s\n    return e\n\ndef ozellikler(snap, gun=90):\n    s = pd.Timestamp(snap)\n    t = TX[(TX["txn_time"] < s) & (TX["txn_time"] >= s - pd.Timedelta(days=gun))]\n    son30 = t[t["txn_time"] >= s - pd.Timedelta(days=30)]\n    g = pd.DataFrame({\n        "islem_90": t.groupby("customer_id").size(),\n        "islem_30": son30.groupby("customer_id").size(),\n        "maas_90": t[t["txn_type"] == "maas"].groupby("customer_id").size(),\n        "son": t.groupby("customer_id")["txn_time"].max(),\n    }).fillna({"islem_30": 0, "maas_90": 0})\n    g["son_islem_gun"] = (s - g["son"]).dt.days\n    g["ivme"] = g["islem_30"] / (g["islem_90"] / 3)\n    return g.drop(columns="son")\n\ndef veri_seti(snaplar):\n    parcalar = []\n    for sn in snaplar:\n        d = etiket_tablosu(sn).merge(ozellikler(sn), on="customer_id", how="left")\n        d = d.merge(C[["customer_id", "segment", "risk_score", "joined_date"]], on="customer_id")\n        d["kidem_yil"] = (d["snap"] - d["joined_date"]).dt.days / 365.25\n        d = d.fillna({"islem_90": 0, "islem_30": 0, "maas_90": 0, "son_islem_gun": 90, "ivme": 0})\n        parcalar.append(d.drop(columns="joined_date"))\n    return pd.concat(parcalar, ignore_index=True)\n\ndef psi(beklenen, gercek, kutu=10):\n    beklenen = np.asarray(beklenen, dtype=float)\n    gercek = np.asarray(gercek, dtype=float)\n    kenar = np.unique(np.quantile(beklenen, np.linspace(0, 1, kutu + 1)))\n    kenar[0], kenar[-1] = -np.inf, np.inf\n    pb = np.histogram(beklenen, kenar)[0] / len(beklenen)\n    pg = np.histogram(gercek, kenar)[0] / len(gercek)\n    pb, pg = np.clip(pb, 1e-4, None), np.clip(pg, 1e-4, None)\n    return float(np.sum((pg - pb) * np.log(pg / pb)))\n\ndef _durum(p):\n    if p < 0.1:\n        return "kararlı"\n    if p < 0.25:\n        return "izle"\n    return "alarm"\n\ndef izleme_raporu(egitim, yeni, sutunlar):\n    rapor = {}\n    for c in sutunlar:\n        p = round(psi(egitim[c], yeni[c]), 4)\n        rapor[c] = (p, _durum(p))\n    return rapor\n\ndef alarm_var(rapor):\n    return any(d == "alarm" for _, d in rapor.values())\n',
        tests: 'egitim = veri_seti(pd.date_range("2024-04-01", "2024-07-01", freq="MS"))\nsut = ["islem_90", "islem_30", "son_islem_gun", "ivme"]\naralik = izleme_raporu(egitim, veri_seti(["2024-12-01"]), sut)\nassert all(d == "kararlı" for _, d in aralik.values()), f"Aralık kararlı olmalı: {aralik}"\nassert alarm_var(aralik) is False\nmart = izleme_raporu(egitim, veri_seti(["2024-03-01"]), sut)\nassert mart["ivme"][1] == "alarm" and mart["ivme"][0] > 4, f"Mart ivme alarmı: {mart[\'ivme\']}"\nassert alarm_var(mart) is True, "Mart kesiminde alarm olmalı"\nassert izleme_raporu(egitim, egitim, ["risk_score"]) == {"risk_score": (0.0, "kararlı")}, "Kendisiyle PSI 0"\n',
        hints: ['Eşikler sırayla: önce < 0.1, sonra < 0.25.', 'any(...) ile tek satırda alarm kontrolü.'],
        why: 'İzleme raporu etiketi beklemeden çalışır. Aralık\'ta girdiler kararlı; Mart\'ta ivme alarmı veri hattındaki eksik pencereyi yakalıyor. Canlıda bu rapor her skorlama işinden önce çalışır ve alarm varsa skorlar yayımlanmaz.'
      }
    ],
    faq: [
      {
        q: 'Neden müşteri başına tek satır yerine aylık kesimleri üst üste koyduk?',
        a: 'Bankada churn nadir bir olaydır: her kesimde yalnızca 5–8 müşteri hesap kapatıyor. Aylık kesimleri birleştirmek pozitif örnek sayısını artırır ve modelin canlıdaki kullanımını (her ay skorlama) taklit eder. Bedeli, aynı müşterinin birden çok satırda yer almasıdır; bu yüzden değerlendirme zamana göre bölünür ve güven aralıkları geniş tutulur.'
      },
      {
        q: '"En az bir hesabını kapatan" yerine "tüm hesaplarını kapatan" müşteriyi churn saymak daha doğru olmaz mı?',
        a: 'İkisi de geçerli tanımlardır. Tüm hesaplarını kapatan yalnızca 6 müşteri var; bununla model kurulamaz. "Bir ürünü bırakma" (kısmi churn) ise çoğu zaman tam kaybın öncü göstergesidir ve kampanya için daha erken bir uyarı verir. Seçtiğin tanımı ve gerekçesini model kartına yaz.'
      }
    ],
    mistakes: [
      {
        bad: 't = TX[TX["txn_time"] >= snap - pd.Timedelta(days=90)]',
        good: 't = TX[(TX["txn_time"] >= snap - pd.Timedelta(days=90)) & (TX["txn_time"] < snap)]',
        why: 'Üst sınır olmadan kesimden sonraki işlemler özelliğe sızar; testte parlak, canlıda çöken model üretir.'
      }
    ]
  }
);
})(window);
