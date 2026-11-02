/* PythonPatika — 'seaborn-plotly' dersi uzantısı: panoya geçiş: KPI, Streamlit/Dash gösterimi, pano tasarımı, veri hikâyesi, tek dosyalık HTML rapor (AUDIT Ekle-3) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'seaborn-plotly',
    min: 28,
    html: `<h2>Derinleş: grafikten panoya ve rapora</h2><p>Tek grafik bir soruyu cevaplar; <b>pano</b> (dashboard) ise bir ekibin her sabah baktığı soruları tek ekranda toplar. Bu bölümde Python'la pano kurmanın iki popüler yolunu (Streamlit ve Dash), iyi pano tasarımının ilkelerini, veri hikâyesinin akışını ve e-postayla gönderilebilen <b>tek dosyalık HTML rapor</b> üretmeyi göreceksin. Rakamlar PBIPatika'nın <code>kesit_bi.Satislar</code> tablosundan (1620 satış satırı) geliyor; aynı panoyu orada Power BI ile kuruyorsun.</p><h3>Önce rakamlar: KPI hesabı</h3><pre class="py">import veri
import pandas as pd

s = veri.oku("kesit_bi", "Satislar")
s = s[s["Durum"] != "İptal"].copy()
s["YilAy"] = s["Tarih"].str[:7]

def kpi(df):
    ciro = df["Tutar"].sum()
    siparis = df["SiparisNo"].nunique()
    return {"ciro": round(ciro), "siparis": siparis, "sepet": round(ciro / siparis),
            "marj": round(1 - df["Maliyet"].sum() / ciro, 3)}

bu = kpi(s[s["YilAy"] == "2024-12"])
onceki = kpi(s[s["YilAy"] == "2024-11"])
for ad in bu:
    degisim = (bu[ad] - onceki[ad]) / onceki[ad]
    print(f"{ad:&lt;8} {bu[ad]:&gt;10,}  ({degisim:+.1%} geçen aya göre)")</pre><h3>Streamlit: betikten uygulamaya</h3><p>Streamlit'te uygulama yukarıdan aşağı çalışan bir betiktir; kullanıcı bir filtreyi her değiştirdiğinde betik baştan çalışır. Bu yüzden veriyi okuyan fonksiyon <code>@st.cache_data</code> ile önbelleğe alınır. <code>pip install streamlit</code> ve <code>streamlit run pano.py</code> ile kendi bilgisayarında dene:</p><pre class="code"># pano.py
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Kesit Satış Panosu", layout="wide")

@st.cache_data
def yukle():
    s = pd.read_csv("Satislar.csv")
    return s[s["Durum"] != "İptal"].assign(YilAy=lambda d: d["Tarih"].str[:7])

s = yukle()
kanallar = st.sidebar.multiselect("Kanal", sorted(s["Kanal"].unique()), default=sorted(s["Kanal"].unique()))
ay = st.sidebar.selectbox("Ay", sorted(s["YilAy"].unique(), reverse=True))
f = s[s["Kanal"].isin(kanallar)]

k1, k2, k3 = st.columns(3)
bu, onceki = f[f["YilAy"] == ay], f[f["YilAy"] &lt; ay]
k1.metric("Ciro", f"{bu['Tutar'].sum():,.0f} TL")
k2.metric("Sipariş", bu["SiparisNo"].nunique())
k3.metric("Ortalama sepet", f"{bu['Tutar'].sum() / max(bu['SiparisNo'].nunique(), 1):,.0f} TL")

aylik = f.groupby("YilAy", as_index=False)["Tutar"].sum()
st.plotly_chart(px.line(aylik, x="YilAy", y="Tutar", title="Aylık ciro"), use_container_width=True)
st.dataframe(bu.groupby("Kanal")["Tutar"].sum().sort_values(ascending=False))</pre><h3>Dash: bileşen ve geri çağırma</h3><p>Dash (Plotly'nin çatısı) farklı bir model kullanır: sayfa düzeni bileşen ağacıdır, etkileşim ise girdi ve çıktıları açıkça bağlayan <b>geri çağırma</b> (callback) fonksiyonlarıyla kurulur. Yalnız etkilenen bileşen yeniden hesaplanır; daha çok kod ister ama büyük, çok sayfalı panolarda daha kontrollüdür (<code>pip install dash</code>).</p><pre class="code">from dash import Dash, Input, Output, dcc, html
import plotly.express as px

app = Dash(__name__)
app.layout = html.Div([
    dcc.Dropdown(sorted(s["Kanal"].unique()), "Mobil", id="kanal"),
    dcc.Graph(id="grafik"),
])

@app.callback(Output("grafik", "figure"), Input("kanal", "value"))
def guncelle(kanal):
    aylik = s[s["Kanal"] == kanal].groupby("YilAy", as_index=False)["Tutar"].sum()
    return px.bar(aylik, x="YilAy", y="Tutar")

app.run(debug=True)</pre><div class="tbl-wrap"><table><tr><th></th><th>Streamlit</th><th>Dash</th><th>Power BI</th></tr><tr><td>Öğrenme</td><td>En kolay</td><td>Orta (callback)</td><td>Tıkla-sürükle + DAX</td></tr><tr><td>Ne zaman?</td><td>Hızlı prototip, ML demosu, iç araç</td><td>Özelleştirilmiş, büyük web panosu</td><td>Kurumsal raporlama, yetki, paylaşım</td></tr><tr><td>Yayın</td><td>Streamlit Community Cloud, sunucu</td><td>Herhangi bir Python web sunucusu</td><td>Power BI Hizmeti</td></tr></table></div><h3>Pano tasarım ilkeleri</h3><ul><li><b>Üstte KPI kartları:</b> 3–5 ana sayı, her birinin yanında karşılaştırma (geçen ay, hedef) ve yönü. Karşılaştırmasız sayı anlam taşımaz.</li><li><b>Soldan sağa, yukarıdan aşağı ayrıntıya:</b> özet → eğilim (zaman çizgisi) → kırılım (kanal, kategori) → ayrıntı tablosu.</li><li><b>Filtreler tek yerde</b> (kenar çubuğu ya da üst şerit) ve hepsini etkiler; etkin filtre ekranda görünsün.</li><li><b>Ayrıntıya inme</b> (drill-down): bölge → şehir → müşteri gibi hiyerarşide tıklayarak inmek; her seviyede toplamlar tutarlı olmalı.</li><li><b>Az renk:</b> gri temel, vurgu yalnız dikkat çekilecek yerde; kırmızı/yeşil yerine erişilebilir palet (bu dersteki renk bölümü).</li></ul><p><b>Veri hikâyesi</b> akışı panodan farklıdır; tek bir mesajı iletir: <b>bağlam</b> ("Aralık'ta ciro geçen yıla göre arttı"), <b>gerilim</b> ("ama iade oranı Mağaza kanalında iki katına çıktı"), <b>çözüm</b> ("Mağaza iade sürecinin incelenmesini öneriyoruz"). Her grafiğin başlığı bir bulgu cümlesi olsun: "Aylık ciro" değil, "Ciro Aralık'ta yılın zirvesine çıktı".</p><h3>Tek dosyalık HTML rapor</h3><p>Herkesin tarayıcısı vardır; sunucu kurmadan paylaşılabilecek en pratik çıktı tek bir HTML dosyasıdır. Grafikleri <b>base64</b> ile gömersen dosya dışa bağımlılık olmadan açılır. plotly ile etkileşimli rapor için <code>fig.to_html(full_html=False, include_plotlyjs="cdn")</code> parçalarını birleştirirsin (ya da çevrimdışı için <code>include_plotlyjs=True</code>).</p><pre class="py">import base64, html, io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

aylik = s[s["YilAy"].str.startswith("2024")].groupby("YilAy")["Tutar"].sum()
fig, ax = plt.subplots(figsize=(6, 2.5))
ax.plot(aylik.index.str[5:], aylik.values, color="#2a6f97")
ax.set_title("2024'te ciro yıl sonuna doğru yükseldi")
tampon = io.BytesIO()
fig.savefig(tampon, format="png", dpi=100, bbox_inches="tight")
plt.close(fig)
png = base64.b64encode(tampon.getvalue()).decode()

rapor = f"""&lt;!doctype html&gt;&lt;html lang="tr"&gt;&lt;meta charset="utf-8"&gt;
&lt;title&gt;{html.escape("Satış Raporu — Aralık 2024")}&lt;/title&gt;
&lt;h1&gt;Aralık 2024&lt;/h1&gt;&lt;p&gt;Ciro: {bu['ciro']:,} TL&lt;/p&gt;
&lt;img alt="Aylık ciro" src="data:image/png;base64,{png}"&gt;&lt;/html&gt;"""
print(len(rapor), "karakter; görsel gömülü:", "data:image/png;base64," in rapor)</pre><div class="note"><b>Gerçek işte</b>Analistler genellikle iki çıktı üretir: kurumsal pano (Power BI, Tableau, Looker) ve haftalık/aylık yorumlu rapor (HTML, PDF, e-posta). Streamlit ise veri bilimi ekiplerinin model sonuçlarını paydaşa göstermesinin en hızlı yoludur. Hangi aracı seçersen seç, mülakatlarda değerlendirilen şey aynıdır: doğru KPI, karşılaştırma, temiz hiyerarşi ve tek cümlelik bulgu.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Streamlit panosunda kenar çubuğundaki kanal filtresini her değiştirdiğinde sayfa birkaç saniye donuyor. Betikte veri her seferinde <code>pd.read_csv</code> ile okunuyor. En doğru düzeltme hangisi?',
        o: ['Veriyi okuyan fonksiyonu @st.cache_data ile önbelleğe almak', 'Filtreyi kaldırıp bütün kanalları her zaman tek grafikte göstermek', 'Streamlit yerine Excel dosyasını e-postayla göndermeye geri dönmek', 'CSV dosyasını her filtrede yeniden oluşturup diske tekrar yazmak'],
        a: 0,
        why: 'Streamlit her etkileşimde betiği baştan çalıştırır. cache_data, aynı argümanlarla çağrılan fonksiyonun sonucunu saklar; dosya bir kez okunur ve filtreler yalnız bellekteki tabloyu süzer.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Yönetici panosunun en üst satırına konacak bir KPI kartı için en iyi tasarım hangisi?',
        o: ['"Ciro: 54.312 TL" — yalnız sayı, sade görünüm', '"Ciro: 54.312 TL ▲ %8,4 geçen aya göre" — sayı, karşılaştırma ve yön', 'Ciroyu gösteren 12 dilimli renkli bir pasta grafiği', 'Tüm siparişlerin satır satır listelendiği kaydırmalı bir tablo'],
        a: 1,
        why: 'Karşılaştırmasız sayı "iyi mi kötü mü?" sorusunu cevaplamaz. KPI kartı tek bakışta okunmalı: değer, referans (geçen ay, hedef) ve yön. Pasta ve uzun tablo ayrıntı içindir, üst satır için değil.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'KPI kartı için değişim metni biçimlendiriliyor. Bu kod ne yazdırır?',
        code: 'def degisim(bu, onceki):\n    if not onceki:\n        return "—"\n    o = (bu - onceki) / onceki\n    ok = "▲" if o > 0 else "▼" if o < 0 else "="\n    return f"{ok} {abs(o):.1%}"\n\nprint(degisim(54312, 50100), degisim(900, 1000), degisim(5, 0), degisim(7, 7))\n',
        o: ['▲ 8.4% ▼ 10.0% — = 0.0%', '▲ 8.4% ▼ -10.0% — = 0.0%', '▲ 0.1% ▼ 0.1% — = 0.0%', '▲ 8.4% ▼ 10.0% ZeroDivisionError'],
        a: 0,
        why: '(54312 − 50100) / 50100 ≈ 0.084 → %8.4; 900\'ün 1000\'e göre değişimi −%10, abs ile işaretsiz yazılır ve yönü ok verir. Önceki değer 0 ise bölme yapılmaz ve "—" döner.' },
      { t: 'code',
        id: 'seaborn-plotly-w1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Gerçek <code>kesit_bi.Satislar</code> verisinden KPI kartları: <code>kpi(df)</code> bir dönemin satırlarından <code>{"ciro", "siparis", "sepet", "marj"}</code> sözlüğü döndürsün: ciro = Tutar toplamı (2 basamak), siparis = benzersiz SiparisNo sayısı (int), sepet = ciro / siparis (2 basamak), marj = 1 − Maliyet toplamı / ciro (3 basamak). Boş dönemde hepsi 0 olsun. Veri (iptaller atılmış, <code>YilAy</code> sütunu eklenmiş) hazır.</p>',
        guide: ['Boş DataFrame\'i başta yakala.', 'Tutar toplamını ve SiparisNo.nunique() değerini hesapla.', 'Sepeti ve marjı bu iki değerden türet.', 'Değerleri float/int\'e çevirip yuvarla.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"no": [1, 1, 2], "t": [10.0, 5.0, 20.0]})\nprint(df["t"].sum(), df["no"].nunique())\n',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\n\ndef kpi(df):\n    # TODO: boş dönem kontrolü\n    # TODO: ciro, siparis, sepet, marj\n    return {}\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum())\n    siparis = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": siparis,\n            "sepet": round(ciro / siparis, 2),\n            "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n',
        tests: 'assert kpi(s[s["YilAy"] == "2024-12"]) == {\'ciro\': 94000.95, \'siparis\': 58, \'sepet\': 1620.71, \'marj\': 0.393}, "Aralık 2024 KPI değerleri beklenenden farklı"\nassert kpi(s[s["YilAy"] == "2024-11"]) == {\'ciro\': 89055.6, \'siparis\': 58, \'sepet\': 1535.44, \'marj\': 0.376}\nassert kpi(s[s["YilAy"] == "2030-01"]) == {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}, "Boş dönemde sıfırlar"\nassert type(kpi(s)["siparis"]) is int\n',
        hints: ['Bir siparişte birden çok satır olduğu için sipariş sayısı satır sayısı değildir: nunique.', 'Marj: 1 - maliyet / ciro.'],
        why: 'Ortalama sepet "satır başına" değil "sipariş başına" hesaplanır; aksi hâlde çok kalemli siparişler sepeti olduğundan küçük gösterir. Boş dönem kontrolü pano filtresi hiç veri bırakmadığında sıfıra bölmeyi önler.' },
      { t: 'code',
        id: 'seaborn-plotly-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Pano filtre katmanı: <code>filtrele(df, kanallar=None, ay_bas=None, ay_bit=None)</code>. <code>kanallar</code> liste ise yalnız o kanallar; <code>None</code> ise filtre yok; <b>boş liste</b> hiçbir satır döndürmez (Streamlit multiselect\'te her şey kaldırılınca). <code>ay_bas</code>/<code>ay_bit</code> <code>"YYYY-AA"</code> biçiminde, iki uç dahil. Orijinal tabloyu değiştirme. Gerçek veri hazır.</p>',
        guide: ['Boolean maske olarak pd.Series(True, index=df.index) ile başla.', 'Her filtre verildiyse maskeyi & ile daralt; kanallar için isin.', 'Ay karşılaştırması metinle yapılabilir: "2024-03" <= "2024-10".', 'df[maske] döndür.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"k": ["a", "b", "c"], "ay": ["2024-01", "2024-02", "2024-03"]})\nm = pd.Series(True, index=df.index)\nm &= df["k"].isin(["a", "c"])\nm &= df["ay"] >= "2024-02"\nprint(df[m])\n',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\n\ndef filtrele(df, kanallar=None, ay_bas=None, ay_bit=None):\n    maske = pd.Series(True, index=df.index)\n    # TODO: filtreleri uygula\n    return df\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef filtrele(df, kanallar=None, ay_bas=None, ay_bit=None):\n    maske = pd.Series(True, index=df.index)\n    if kanallar is not None:\n        maske &= df["Kanal"].isin(kanallar)\n    if ay_bas is not None:\n        maske &= df["YilAy"] >= ay_bas\n    if ay_bit is not None:\n        maske &= df["YilAy"] <= ay_bit\n    return df[maske]\n',
        tests: 'f = filtrele(s, ["Mobil"], "2024-10", "2024-12")\nassert f.groupby("YilAy")["Tutar"].sum().round(2).to_dict() == {\'2024-10\': 32563.65, \'2024-11\': 38595.8, \'2024-12\': 31924.35}, "Mobil, 2024 son çeyrek aylık ciro"\nassert len(filtrele(s)) == len(s), "Filtre yoksa tüm satırlar"\nassert len(filtrele(s, [])) == 0, "Boş kanal listesi hiçbir satır döndürmemeli (None ile karıştırma)"\nassert set(filtrele(s, ay_bas="2024-12")["YilAy"]) == {"2024-12"}\nassert "Kanal" in s.columns and len(s) == 1499, "Orijinal tablo değişmemeli"\n',
        hints: ['"if kanallar:" boş listeyi "filtre yok" sanır; "if kanallar is not None:" kullan.', 'maske &= koşul ile filtreleri art arda ekle.'],
        why: 'Pano filtrelerinde "seçilmemiş" (None) ile "hepsi kaldırılmış" (boş liste) farklı anlamlardır. İkisini karıştırmak, kullanıcı tüm kanalları kaldırdığında panonun yine tüm veriyi göstermesine yol açar.' },
      { t: 'code',
        id: 'seaborn-plotly-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Ayrıntıya inme (drill-down): <code>ayrinti(df, musteri, yol)</code>. <code>yol</code> seçilmiş seviyelerin listesi: <code>[]</code> → bölge toplamları; <code>["Marmara"]</code> → Marmara\'daki şehir toplamları. <code>df</code> satış satırları, <code>musteri</code> müşteri boyutu (MusteriNo, Bolge, Sehir); boş Bolge/Sehir <code>"Bilinmiyor"</code> sayılır. Dönüş: <code>{ad: tutar}</code> sözlüğü, tutar 2 basamak, büyükten küçüğe. Test, 2024 satışlarında gerçek <code>kesit_bi.Musteriler</code> ile çalışır.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nmusteri = veri.oku("kesit_bi", "Musteriler")\ns24 = s[s["YilAy"].str.startswith("2024")]\n\ndef ayrinti(df, musteri, yol):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nmusteri = veri.oku("kesit_bi", "Musteriler")\ns24 = s[s["YilAy"].str.startswith("2024")]\nSEVIYELER = ["Bolge", "Sehir"]\n\ndef ayrinti(df, musteri, yol):\n    boyut = musteri[["MusteriNo"] + SEVIYELER].fillna({c: "Bilinmiyor" for c in SEVIYELER})\n    t = df.merge(boyut, on="MusteriNo", validate="many_to_one")\n    for seviye, deger in zip(SEVIYELER, yol):\n        t = t[t[seviye] == deger]\n    grup = SEVIYELER[len(yol)]\n    toplam = t.groupby(grup)["Tutar"].sum().sort_values(ascending=False)\n    return {k: round(float(v), 2) for k, v in toplam.items()}\n',
        tests: 'b = ayrinti(s24, musteri, [])\nassert b == {\'İç Anadolu\': 255512.8, \'Marmara\': 155605.3, \'Akdeniz\': 112878.6, \'Karadeniz\': 79834.35, \'Ege\': 74048.3, \'Bilinmiyor\': 40514.45, \'Güneydoğu Anadolu\': 28671.9}, "2024 bölge toplamları"\nassert ayrinti(s24, musteri, ["Marmara"]) == {\'İstanbul\': 115565.0, \'Bursa\': 40040.3}, "Marmara\\\'nın şehir kırılımı"\nassert abs(sum(ayrinti(s24, musteri, ["Marmara"]).values()) - b["Marmara"]) < 0.05, "Alt seviyelerin toplamı üst seviyeye eşit olmalı"\n',
        hints: ['Seviye listesi tut: ["Bolge", "Sehir"]; yol uzunluğu bir sonraki gruplama seviyesini verir.', 'zip(SEVIYELER, yol) ile seçilmiş seviyeleri sırayla filtrele.'],
        why: 'Ayrıntıya inmede her seviyenin toplamı üst seviyedeki değere eşit olmalıdır; boş değerleri "Bilinmiyor" yapmak bu tutarlılığı korur. Power BI\'daki hiyerarşi ve drill-down düğmeleri tam olarak bu mantıkla çalışır.' },
      { t: 'code',
        id: 'seaborn-plotly-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Tek dosyalık HTML rapor iskeleti: <code>html_rapor(baslik, kartlar, gorseller)</code>. <code>kartlar</code> <code>[(ad, deger_metni)]</code>, <code>gorseller</code> <code>[(aciklama, png_bytes)]</code>. Çıktı tam olarak şu parçaların birleşimi olsun (araya boşluk yok):</p><ul><li><code>&lt;!doctype html&gt;&lt;html lang="tr"&gt;&lt;head&gt;&lt;meta charset="utf-8"&gt;&lt;title&gt;{baslik}&lt;/title&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;{baslik}&lt;/h1&gt;</code></li><li>Her kart: <code>&lt;div class="kart"&gt;&lt;b&gt;{ad}&lt;/b&gt; {deger}&lt;/div&gt;</code></li><li>Her görsel: <code>&lt;img alt="{aciklama}" src="data:image/png;base64,{b64}"&gt;</code></li><li><code>&lt;/body&gt;&lt;/html&gt;</code></li></ul><p>Tüm metinler <code>html.escape</code> ile kaçırılsın (alt özniteliği dahil).</p>',
        start: 'import base64\nimport html\n\ndef html_rapor(baslik, kartlar, gorseller):\n    pass\n',
        sol: 'import base64\nimport html\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    parca = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    for ad, deger in kartlar:\n        parca.append(f\'<div class="kart"><b>{html.escape(ad)}</b> {html.escape(deger)}</div>\')\n    for aciklama, png in gorseller:\n        kod = base64.b64encode(png).decode()\n        parca.append(f\'<img alt="{html.escape(aciklama)}" src="data:image/png;base64,{kod}">\')\n    parca.append("</body></html>")\n    return "".join(parca)\n',
        tests: 'r = html_rapor("Satış & İade", [("Ciro", "54.312 TL")], [("Aylık \\"ciro\\"", b"PNG")])\nassert r == (\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Satış &amp; İade</title></head>\'\n             \'<body><h1>Satış &amp; İade</h1><div class="kart"><b>Ciro</b> 54.312 TL</div>\'\n             \'<img alt="Aylık &quot;ciro&quot;" src="data:image/png;base64,UE5H"></body></html>\'), f"Gelen {r}"\nassert "<script>" not in html_rapor("<script>", [], [])\n',
        hints: ['base64.b64encode(bytes).decode() metin verir.', 'html.escape varsayılan olarak çift tırnağı da &quot; yapar; öznitelik için güvenli.'],
        why: 'Gömülü görselli tek HTML dosyası e-postayla gönderilebilir, paylaşılan klasörde açılabilir ve sunucu gerektirmez. Başlık ya da kart metni veriden geldiği için kaçış XSS\'e karşı şarttır.' },
      { t: 'code',
        id: 'seaborn-plotly-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>sepet_karti(df)</code> panodaki "Ortalama sepet" kartını hesaplıyor ama değer, finans ekibinin hesapladığından çok düşük çıkıyor; ayrıca filtre tüm veriyi elediğinde pano <code>ZeroDivisionError</code> ile çöküyor. Ortalama sepet = toplam tutar / <b>sipariş</b> sayısı; veri yoksa <code>0.0</code>. Sonuç 2 basamak.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef sepet_karti(df):\n    return round(df["Tutar"].sum() / len(df), 2)\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef sepet_karti(df):\n    n = df["SiparisNo"].nunique()\n    if n == 0:\n        return 0.0\n    return round(float(df["Tutar"].sum()) / n, 2)\n',
        tests: 'assert sepet_karti(s[s["YilAy"] == "2024-12"]) == 1620.71, "Aralık 2024 ortalama sepeti 1620.71 TL olmalı (sipariş başına)"\nassert sepet_karti(s.iloc[0:0]) == 0.0, "Boş veride 0.0"\n',
        hints: ['Bir siparişte birden çok satır olabilir.', 'len(df) satır sayısıdır; sipariş sayısı SiparisNo.nunique().'],
        why: 'Satış tablosunun tanecik düzeyi (grain) sipariş satırıdır, sipariş değil. KPI tanımı hangi düzeyde ise payda o düzeyde sayılmalıdır; pano filtreleri boş sonuç da üretebileceği için sıfıra bölme her kartta korunmalıdır.' },
      { t: 'code',
        id: 'seaborn-plotly-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'matplotlib'],
        q: '<p>Uçtan uca aylık rapor: <code>aylik_rapor(df, ay)</code> tek dosyalık HTML metni döndürsün. Gereken: (1) <code>kpi</code> ile seçilen ayın ve bir önceki ayın KPI\'ları; (2) dört kart, sırayla <code>Ciro</code>, <code>Sipariş</code>, <code>Ortalama sepet</code>, <code>Marj</code>; değer metni <code>"{değer} ({değişim})"</code>: ciro ve sepet <code>f"{x:,.0f} TL"</code>, sipariş <code>str(n)</code>, marj <code>f"{x:.1%}"</code>; değişim yüzde değişim <code>f"{o:+.1%}"</code>, önceki 0 ise <code>"yeni"</code>; (3) son 12 ayın (seçilen ay dahil) aylık ciro çizgi grafiği matplotlib ile PNG olarak gömülsün, başlığı bir bulgu cümlesi: ciro önceki aya göre arttıysa <code>"{ay} cirosu önceki aydan yüksek"</code>, değilse <code>"{ay} cirosu önceki aydan düşük"</code> (alt metni de bu cümle); (4) <code>html_rapor</code>, <code>kpi</code> hazır. Önceki ay: <code>pd.Period(ay) - 1</code>.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nimport base64, html, io\n\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum()); n = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": n, "sepet": round(ciro / n, 2), "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    p = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    p += [f\'<div class="kart"><b>{html.escape(a)}</b> {html.escape(d)}</div>\' for a, d in kartlar]\n    p += [f\'<img alt="{html.escape(a)}" src="data:image/png;base64,{base64.b64encode(g).decode()}">\' for a, g in gorseller]\n    return "".join(p + ["</body></html>"])\n\ndef aylik_rapor(df, ay):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nimport base64, html, io\nimport matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum()); n = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": n, "sepet": round(ciro / n, 2), "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    p = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    p += [f\'<div class="kart"><b>{html.escape(a)}</b> {html.escape(d)}</div>\' for a, d in kartlar]\n    p += [f\'<img alt="{html.escape(a)}" src="data:image/png;base64,{base64.b64encode(g).decode()}">\' for a, g in gorseller]\n    return "".join(p + ["</body></html>"])\n\ndef _degisim(bu, onceki):\n    return "yeni" if not onceki else f"{(bu - onceki) / onceki:+.1%}"\n\ndef aylik_rapor(df, ay):\n    onceki_ay = str(pd.Period(ay) - 1)\n    bu, on = kpi(df[df["YilAy"] == ay]), kpi(df[df["YilAy"] == onceki_ay])\n    bicim = {"ciro": lambda x: f"{x:,.0f} TL", "siparis": str,\n             "sepet": lambda x: f"{x:,.0f} TL", "marj": lambda x: f"{x:.1%}"}\n    adlar = {"ciro": "Ciro", "siparis": "Sipariş", "sepet": "Ortalama sepet", "marj": "Marj"}\n    kartlar = [(adlar[k], f"{bicim[k](bu[k])} ({_degisim(bu[k], on[k])})") for k in adlar]\n    bas = str(pd.Period(ay) - 11)\n    aylik = df[(df["YilAy"] >= bas) & (df["YilAy"] <= ay)].groupby("YilAy")["Tutar"].sum()\n    yon = "yüksek" if bu["ciro"] > on["ciro"] else "düşük"\n    cumle = f"{ay} cirosu önceki aydan {yon}"\n    fig, ax = plt.subplots(figsize=(6, 2.5))\n    ax.plot(aylik.index, aylik.values)\n    ax.set_title(cumle)\n    tampon = io.BytesIO()\n    fig.savefig(tampon, format="png", dpi=80)\n    plt.close(fig)\n    return html_rapor(f"Satış raporu — {ay}", kartlar, [(cumle, tampon.getvalue())])\n',
        tests: 'import re\nr = aylik_rapor(s, "2024-12")\nkartlar = re.findall(r\'<div class="kart"><b>(.*?)</b> (.*?)</div>\', r)\nassert [k[0] for k in kartlar] == ["Ciro", "Sipariş", "Ortalama sepet", "Marj"], f"Kart sırası: {kartlar}"\nassert kartlar[1][1] == "58 (+0.0%)", f"Sipariş kartı: {kartlar[1]}"\nassert kartlar[0][1] == "94,001 TL (+5.6%)", f"Ciro kartı: {kartlar[0]}"\nassert \'alt="2024-12 cirosu önceki aydan yüksek"\' in r, "Bulgu cümlesi alt metinde olmalı"\npng = re.search(r"base64,([A-Za-z0-9+/=]+)", r).group(1)\nimport base64\nassert base64.b64decode(png)[:4] == b"\\x89PNG", "Gömülü görsel PNG olmalı"\nassert "(yeni)" in aylik_rapor(s, "2022-06"), "İlk satış ayında önceki ay yok: yeni"\n',
        hints: ['pd.Period("2024-12") - 1 → 2024-11; str() ile metne çevir.', 'Kartları bir ad sözlüğü ve biçim sözlüğüyle döngüde üret.', 'Görseli io.BytesIO\'ya savefig ile yaz, getvalue() ile bytes al; plt.close unutma.'],
        why: 'Bu, zamanlanmış bir betiğin her ay e-postayla göndereceği raporun çekirdeğidir: KPI + karşılaştırma + bulgu cümlesi başlıklı grafik. Hesaplama, biçimlendirme ve sunum ayrı fonksiyonlarda olduğu için her biri ayrı test edilebilir.' }
    ],
    faq: [
      { q: 'Streamlit panomu başkalarıyla nasıl paylaşırım?',
        a: 'Kod GitHub\'daysa Streamlit Community Cloud\'a ücretsiz yayınlayabilirsin; kurum içi veride ise uygulamayı bir sunucuda ya da Docker konteynerinde çalıştırıp kurum ağına açarsın. Kişisel ya da gizli veriyi herkese açık bir uygulamaya koyma; Streamlit\'in kimlik doğrulama seçeneklerini ya da kurumun ters vekil sunucusunu kullan.' },
      { q: 'Pano mu, rapor mu hazırlamalıyım?',
        a: 'Aynı soruya düzenli olarak bakılıyorsa (günlük satış, stok) pano; bir karar için tek seferlik bir mesaj iletilecekse (kampanya sonucu, yıllık değerlendirme) hikâyeli rapor. Çoğu ekipte ikisi birlikte yaşar: pano izlemeyi, rapor yorumlamayı sağlar.' }
    ],
    mistakes: [
      { bad: 'sepet = df["Tutar"].sum() / len(df)',
        good: 'sepet = df["Tutar"].sum() / df["SiparisNo"].nunique()',
        why: 'Satış tablosu sipariş satırı düzeyindedir; sipariş başına KPI için benzersiz sipariş sayısına böl.' }
    ] }
);
})(window);
