/* Kesit Python — 'istatistik' dersi uzantısı: A/B testi: SRM, z-testi, peeking ve CUPED (gerçek veri setleri) */
// needs: numpy, pandas, scipy
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'istatistik',
    min: 35,
    needs: ['numpy', 'pandas', 'scipy'],
    html: `<h2>Derinleş: gerçek bir A/B testini uçtan uca okumak</h2><p>Derste A/B testinin temel mantığını gördün. Gerçek bir deneyi raporlamadan önce kıdemli analistlerin sırayla sorduğu dört soru vardır: <b>(1) Gruplar doğru bölündü mü?</b> (SRM), <b>(2) Dönüşüm farkı anlamlı mı ve ne kadar büyük?</b> (oranlar için z-testi ve güven aralığı), <b>(3) Sonuca erken mi baktık?</b> (peeking), <b>(4) Daha az kullanıcıyla aynı kesinliğe ulaşabilir miydik?</b> (CUPED). Hepsini Anadolu Market'in gerçek deney tablosuyla yapacağız: <code>anadolu_market/ab_test</code>, 2.000 kullanıcı; <code>variant</code> A (eski tasarım) ya da B (yeni tasarım), <code>converted</code> 0/1, <code>revenue</code> kullanıcının getirdiği gelir.</p><pre class="py">import veri

ab = veri.oku("anadolu_market", "ab_test")
ozet = ab.groupby("variant").agg(kullanici=("user_id", "size"), donusum=("converted", "mean"),
                                 gelir_kisi=("revenue", "mean"))
print(ozet.round(4))
</pre><h3>1. Önce SRM: örneklem oranı uyumsuzluğu</h3><p>Deney %50/%50 tasarlandıysa gruplar yaklaşık eşit olmalı. A'da 975, B'de 1.025 kullanıcı var. Bu fark şans eseri mi? <b>SRM</b> (sample ratio mismatch) kontrolü, beklenen oranla gözlenen sayıları ki-kare uygunluk testiyle karşılaştırır. SRM varsa (ör. B sayfası bazı tarayıcılarda çöküyor ve o kullanıcılar kaydedilmiyorsa) gruplar artık karşılaştırılabilir değildir ve <b>hiçbir sonuç yorumlanmaz</b>. Bu kontrol için çok küçük bir eşik (ör. p &lt; 0.001) kullanılır; amaç ciddi kırılmaları yakalamaktır.</p><pre class="py">import veri
from scipy import stats

ab = veri.oku("anadolu_market", "ab_test")
n = ab["variant"].value_counts().reindex(["A", "B"])
beklenen = [n.sum() * 0.5, n.sum() * 0.5]
sonuc = stats.chisquare(n.values, f_exp=beklenen)
print(n.to_dict(), "p =", round(float(sonuc.pvalue), 4))
print("SRM var" if sonuc.pvalue &lt; 0.001 else "SRM yok: analize devam")
</pre><h3>2. Oranlar için z-testi ve fark için güven aralığı</h3><p>İki dönüşüm oranını karşılaştırmanın standart yolu iki oran z-testidir. Test istatistiği birleşik (pooled) oranla hesaplanır: <code>z = (p_B − p_A) / √(p(1−p)(1/n_A + 1/n_B))</code>. Fark için güven aralığında ise her grubun kendi oranı kullanılır (birleştirilmemiş standart hata). Raporda p-değeri tek başına değil, <b>farkın büyüklüğü ve aralığıyla</b> birlikte verilir.</p><pre class="py">import veri
import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

ab = veri.oku("anadolu_market", "ab_test")
g = ab.groupby("variant")["converted"].agg(["sum", "count"])
xa, na = g.loc["A"]; xb, nb = g.loc["B"]
pa, pb = xa / na, xb / nb
p = (xa + xb) / (na + nb)
z = (pb - pa) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))
pdeg = 2 * stats.norm.sf(abs(z))
se = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
print(f"A %{pa*100:.2f}  B %{pb*100:.2f}  fark {100*(pb-pa):.2f} puan")
print(f"z = {z:.3f}, p = {pdeg:.4f}, %95 GA: [{100*(pb-pa-1.96*se):.2f}, {100*(pb-pa+1.96*se):.2f}] puan")
print("statsmodels:", [round(float(v), 4) for v in proportions_ztest([xb, xa], [nb, na])])
</pre><p>Gelir gibi çarpık metriklerde (kullanıcıların %87'si 0 gelir getiriyor) ortalama farkı için Welch t-testi ya da daha güvenli olarak <b>bootstrap</b> güven aralığı kullanılır; derste gördüğün yöntem burada da geçerlidir.</p><h3>3. Peeking: sonuca her gün bakmak</h3><p>Deneyi her gün açıp "p &lt; 0.05 oldu mu?" diye bakar ve olduğu gün durdurursan, yanlış pozitif oranın %5 değil çok daha yüksek olur. Aşağıda kullanıcılar geliş sırasına (<code>user_id</code>) göre birikirken p-değerinin nasıl dalgalandığını görüyorsun: 200 kullanıcıda p = 0.014 ile "anlamlı" görünüyor, sonra yüzlerce kullanıcı boyunca 0.05'in üstüne çıkıyor.</p><pre class="py">import veri
import numpy as np
from scipy import stats

ab = veri.oku("anadolu_market", "ab_test").sort_values("user_id")

def p_deger(s):
    g = s.groupby("variant")["converted"].agg(["sum", "count"])
    xa, na = g.loc["A"]; xb, nb = g.loc["B"]
    p = (xa + xb) / (na + nb)
    z = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))
    return 2 * stats.norm.sf(abs(z))

yol = [round(float(p_deger(ab.iloc[:k])), 3) for k in range(200, 2001, 200)]
print(yol)
</pre><p>Gerçekte fark olmayan (A/A) binlerce deney simüle edersen, 10 kez bakıp ilk "anlamlı" sonuçta durmak yanlış pozitif oranını yaklaşık %5'ten %15–20'ye çıkarır. Çözümler: örneklem büyüklüğünü güç analiziyle <b>önceden</b> belirleyip yalnızca sonda bakmak; ara bakış gerekiyorsa <b>sıralı test</b> (sequential testing) kullanmak. Sıralı testlerde her ara bakışa α'nın bir kısmı harcanır (alpha spending; O'Brien-Fleming sınırları ilk bakışlarda çok katı, sonda neredeyse 0.05'tir) ya da her an geçerli (always-valid) p-değerleri üreten yöntemler (mSPRT) kullanılır. Ticari deney platformlarının "erken durdurma" düğmeleri bu yöntemlere dayanır.</p><h3>4. CUPED: deney öncesi veriyle varyans azaltma</h3><p>Kullanıcıların harcaması deneyden önce de çok farklıdır; bu doğal farklılık gürültü olarak test sonucuna girer. <b>CUPED</b> (Controlled-experiment Using Pre-Experiment Data), deney öncesi metrik <code>X</code> ile sonuç <code>Y</code> arasındaki ilişkiyi kullanarak gürültüyü çıkarır: <code>θ = cov(Y, X) / var(X)</code>, <code>Y_cuped = Y − θ (X − ort(X))</code>. X deneyden önce ölçüldüğü için gruplardan bağımsızdır; bu yüzden ortalama fark değişmez (yansızdır), yalnızca varyans yaklaşık <code>ρ²</code> oranında düşer. Aynı kesinlik için daha az kullanıcı, yani daha kısa deney demektir.</p><div class="warn"><b>Veri notu</b><code>ab_test</code> tablosunda deney öncesi metrik yok. CUPED'i göstermek için aşağıda tohumlu (seed) bir simülasyon kullanıyoruz. Kendi şirketinde X genellikle deneyden önceki 2–4 haftanın aynı metriğidir (harcama, oturum sayısı).</div><pre class="py">import numpy as np

def deney(seed=21, n=2000, etki=3.0):
    rng = np.random.default_rng(seed)
    onceki = rng.gamma(2.0, 30.0, n)          # deney öncesi 30 günlük harcama
    grup = rng.integers(0, 2, n)              # 0 = A, 1 = B
    sonraki = 0.8 * onceki + rng.normal(0, 20, n) + etki * grup
    return onceki, grup, sonraki

from scipy import stats

x, g, y = deney()
theta = np.cov(y, x)[0, 1] / np.var(x, ddof=1)
y_c = y - theta * (x - x.mean())
for ad, m in [("ham", y), ("CUPED", y_c)]:
    fark = m[g == 1].mean() - m[g == 0].mean()
    p = stats.ttest_ind(m[g == 1], m[g == 0], equal_var=False).pvalue
    print(f"{ad:6} fark={fark:.2f}  varyans={m.var(ddof=1):.0f}  p={p:.4f}")
</pre><div class="note"><b>Gerçek işte</b>Deney raporunun ilk satırı SRM sonucudur; SRM varsa rapor orada biter ve mühendislik ekibiyle kök neden aranır. Sonra birincil metrik (dönüşüm) farkı ve güven aralığı, ardından koruma metrikleri (gelir, iade, sayfa hızı) gelir. Deney süresi ve örneklem başlamadan yazılı olarak sabitlenir; ara bakış yapılacaksa sıralı test planı da önceden yazılır.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Gerçek deneyde SRM kontrolü yapılıyor. Bu kod ne yazdırır?',
        needs: ['pandas', 'scipy'],
        code: 'import veri\nfrom scipy import stats\nab = veri.oku("anadolu_market", "ab_test")\nn = ab["variant"].value_counts().reindex(["A", "B"])\np = stats.chisquare(n.values).pvalue\nprint(n.tolist(), round(float(p), 3), p < 0.001)\n',
        o: ['[975, 1025] 0.264 False', '[975, 1025] 0.264 True', '[1025, 975] 0.026 True', '[975, 1025] 0.012 False'],
        a: 0,
        why: 'f_exp verilmezse chisquare eşit dağılım bekler. 50 kişilik fark 2.000 kullanıcıda şans eseri görülebilecek düzeydedir (p ≈ 0.26); SRM yok. 0.012 dönüşüm testinin p-değeridir, karıştırma.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Kullanıcılar geldikçe p-değeri izleniyor. Bu kod ne yazdırır?',
        needs: ['pandas', 'scipy'],
        code: 'import veri\nimport numpy as np\nfrom scipy import stats\nab = veri.oku("anadolu_market", "ab_test").sort_values("user_id")\ndef p_deger(s):\n    g = s.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]; xb, nb = g.loc["B"]\n    p = (xa + xb) / (na + nb)\n    z = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n    return 2 * stats.norm.sf(abs(z))\nyol = [bool(p_deger(ab.iloc[:k]) < 0.05) for k in (200, 500, 900, 2000)]\nprint(yol)\n',
        o: ['[True, False, False, True]', '[False, False, False, True]', '[True, True, True, True]', '[True, False, True, True]'],
        a: 0,
        why: '200 kullanıcıda p = 0.014 (anlamlı görünüyor), 500 ve 900\'de 0.05\'in üstünde, sonda yine anlamlı. 200\'de durup "kazandık" demek peeking hatasıdır; karar önceden belirlenen örneklemde verilir.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>ab_test tablosunda iki oran z-testini elle yapıp z ve p\'yi yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas', 'scipy'],
        lines: ['import veri', 'import numpy as np', 'from scipy import stats', 'g = veri.oku("anadolu_market", "ab_test").groupby("variant")["converted"].agg(["sum", "count"])', 'xa, na = g.loc["A"]; xb, nb = g.loc["B"]', 'p = (xa + xb) / (na + nb)', 'z = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))', 'print(round(float(z), 3), round(float(2 * stats.norm.sf(abs(z))), 4))'],
        expect: '2.517 0.0118\n',
        hint: 'Birleşik oran p, z\'den önce hesaplanır; z de p-değerinden önce.',
        why: 'İki yönlü p-değeri 2·P(Z > |z|) olur. statsmodels.proportions_ztest aynı sonucu verir.'
      },
      {
        t: 'code',
        id: 'istatistik-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas', 'scipy'],
        q: '<p><code>srm_kontrol(df, oran_a=0.5, esik=0.001)</code>: <code>variant</code> sütunundaki A ve B sayılarını beklenen oranla (<code>oran_a</code>, B için <code>1 - oran_a</code>) ki-kare uygunluk testiyle karşılaştır. <code>{"n_a": int, "n_b": int, "p": 4 basamak float, "srm": bool}</code> döndür (<code>srm</code>: p &lt; esik). Testler gerçek <code>ab_test</code> tablosunu ve izleme kaybı yaşanmış bozuk bir kopyasını kullanır.</p>',
        guide: ['n = df["variant"].value_counts().reindex(["A", "B"]).', 'beklenen = [toplam * oran_a, toplam * (1 - oran_a)].', 'stats.chisquare(n.values, f_exp=beklenen).pvalue', 'Sözlüğü int/float/bool dönüşümleriyle döndür.'],
        example: 'from scipy import stats\ngozlenen = [480, 520]\nprint(round(float(stats.chisquare(gozlenen, f_exp=[500, 500]).pvalue), 4))\n',
        start: 'import veri\nfrom scipy import stats\n\ndef srm_kontrol(df, oran_a=0.5, esik=0.001):\n    n = df["variant"].value_counts().reindex(["A", "B"])\n    # TODO: beklenen sayılar, ki-kare testi, sözlük\n    return {}\n',
        sol: 'import veri\nfrom scipy import stats\n\ndef srm_kontrol(df, oran_a=0.5, esik=0.001):\n    n = df["variant"].value_counts().reindex(["A", "B"])\n    toplam = n.sum()\n    beklenen = [toplam * oran_a, toplam * (1 - oran_a)]\n    p = float(stats.chisquare(n.values, f_exp=beklenen).pvalue)\n    return {"n_a": int(n["A"]), "n_b": int(n["B"]), "p": round(p, 4), "srm": bool(p < esik)}\n',
        tests: 'ab = veri.oku("anadolu_market", "ab_test")\nr = srm_kontrol(ab)\nassert r == {"n_a": 975, "n_b": 1025, "p": 0.2636, "srm": False}, f"Gerçek deney: {r}"\nbozuk = ab[~((ab["variant"] == "B") & (ab["converted"] == 0) & (ab["user_id"] % 5 == 0))]\nr2 = srm_kontrol(bozuk)\nassert r2["n_b"] == 862 and r2["p"] == 0.0084, f"Bozuk kopya: {r2}"\nassert r2["srm"] is False, "p = 0.0084 > 0.001: bu eşikte alarm yok"\nassert srm_kontrol(bozuk, esik=0.01)["srm"] is True, "esik=0.01 ile SRM alarmı vermeli"\nassert srm_kontrol(ab, oran_a=0.4)["srm"] is True, "%40/%60 tasarlanmış deneyde 975/1025 ciddi uyumsuzluktur"\n',
        hints: ['f_exp beklenen SAYILARdır, oran değil.', 'reindex(["A", "B"]) sırayı sabitler.'],
        why: 'Gerçek deneyde SRM yok. Bozuk kopyada B\'den dönüşmeyen bazı kullanıcılar kaybolmuş: bu hem SRM\'ye yol açar hem de B\'nin dönüşüm oranını yapay olarak şişirir. Bu yüzden SRM varken sonuç yorumlanmaz.'
      },
      {
        t: 'code',
        id: 'istatistik-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas', 'scipy'],
        q: '<p><code>oran_ztest(df)</code>: A ve B dönüşüm oranları için birleşik z-testi yap. Sözlük döndür: <code>oran_a</code>, <code>oran_b</code>, <code>fark</code> (B − A) (hepsi 4 basamak), <code>z</code> (3 basamak), <code>p</code> (iki yönlü, 4 basamak), <code>ga</code>: fark için birleştirilmemiş standart hatayla %95 güven aralığı <code>(alt, ust)</code> (4 basamak, 1.96 kullan).</p>',
        guide: ['Gruplara göre sum ve count al.', 'Birleşik oran p ile z = (pb − pa) / √(p(1−p)(1/na + 1/nb)).', 'p-değeri: 2 * stats.norm.sf(abs(z)).', 'GA için se = √(pa(1−pa)/na + pb(1−pb)/nb); fark ± 1.96·se.'],
        example: 'import numpy as np\nfrom scipy import stats\nxa, na, xb, nb = 50, 500, 70, 500\np = (xa + xb) / (na + nb)\nz = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\nprint(round(z, 3), round(2 * stats.norm.sf(abs(z)), 4))\n',
        start: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef oran_ztest(df):\n    g = df.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    # TODO: oranlar, z, p, güven aralığı\n    return {}\n',
        sol: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef oran_ztest(df):\n    g = df.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    pa, pb = xa / na, xb / nb\n    p = (xa + xb) / (na + nb)\n    z = (pb - pa) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n    pdeg = 2 * stats.norm.sf(abs(z))\n    se = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)\n    fark = pb - pa\n    return {"oran_a": round(float(pa), 4), "oran_b": round(float(pb), 4), "fark": round(float(fark), 4),\n            "z": round(float(z), 3), "p": round(float(pdeg), 4),\n            "ga": (round(float(fark - 1.96 * se), 4), round(float(fark + 1.96 * se), 4))}\n',
        tests: 'r = oran_ztest(veri.oku("anadolu_market", "ab_test"))\nassert r["oran_a"] == 0.1087 and r["oran_b"] == 0.1463, f"Oranlar: {r}"\nassert r["fark"] == 0.0376, f"Fark: {r}"\nassert r["z"] == 2.517 and r["p"] == 0.0118, f"z ve p: {r}"\nassert r["ga"] == (0.0085, 0.0668), f"Güven aralığı: {r[\'ga\']}"\n',
        hints: ['Test istatistiğinde birleşik oran, güven aralığında gruba özgü oranlar kullanılır.', 'İki yönlü test: 2 * sf(|z|).'],
        why: 'B dönüşümü 3,8 puan artırıyor (%10,9 → %14,6); aralık 0,9 ile 6,7 puan. Aralık sıfırı içermiyor ama genişliği, etkinin büyüklüğü konusunda hâlâ belirsizlik olduğunu söylüyor.'
      },
      {
        t: 'code',
        id: 'istatistik-v3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['numpy'],
        q: '<p><code>cuped(y, x)</code>: θ = cov(y, x) / var(x) (ikisinde de <code>ddof=1</code>) hesapla ve <code>(y_cuped, theta)</code> döndür; <code>y_cuped = y - theta * (x - x.mean())</code>. Testler derste kullanılan <code>deney()</code> simülasyonunu (verildi) kullanır.</p>',
        guide: ['np.cov(y, x)[0, 1] kovaryansı verir (ddof=1 varsayılan).', 'np.var(x, ddof=1) örneklem varyansı.', 'theta ile x\'in ortalamadan sapmasını çarpıp y\'den çıkar.'],
        example: 'import numpy as np\nx = np.array([1.0, 2.0, 3.0, 4.0])\ny = np.array([2.1, 3.9, 6.2, 7.8])\nprint(round(np.cov(y, x)[0, 1] / np.var(x, ddof=1), 3))\n',
        start: 'import numpy as np\n\ndef deney(seed=21, n=2000, etki=3.0):\n    rng = np.random.default_rng(seed)\n    onceki = rng.gamma(2.0, 30.0, n)          # deney öncesi 30 günlük harcama\n    grup = rng.integers(0, 2, n)              # 0 = A, 1 = B\n    sonraki = 0.8 * onceki + rng.normal(0, 20, n) + etki * grup\n    return onceki, grup, sonraki\n\ndef cuped(y, x):\n    # TODO: theta ve düzeltilmiş y\n    return y, 0.0\n',
        sol: 'import numpy as np\n\ndef deney(seed=21, n=2000, etki=3.0):\n    rng = np.random.default_rng(seed)\n    onceki = rng.gamma(2.0, 30.0, n)          # deney öncesi 30 günlük harcama\n    grup = rng.integers(0, 2, n)              # 0 = A, 1 = B\n    sonraki = 0.8 * onceki + rng.normal(0, 20, n) + etki * grup\n    return onceki, grup, sonraki\n\ndef cuped(y, x):\n    theta = np.cov(y, x)[0, 1] / np.var(x, ddof=1)\n    return y - theta * (x - x.mean()), float(theta)\n',
        tests: 'x, g, y = deney()\nyc, th = cuped(y, x)\nassert round(th, 3) == 0.8, f"theta ~0.80 olmalı, {th}"\nassert abs(yc.mean() - y.mean()) < 1e-9, "CUPED ortalamayı değiştirmemeli"\nazalma = 1 - yc.var(ddof=1) / y.var(ddof=1)\nassert 0.7 < azalma < 0.8, f"Varyans yaklaşık %75 azalmalı, {azalma:.3f}"\nr = np.corrcoef(x, y)[0, 1]\nassert abs(azalma - r ** 2) < 1e-9, "Varyans azalması korelasyonun karesine eşittir"\n',
        hints: ['np.cov iki diziden 2x2 matris döndürür; [0, 1] çapraz terimdir.', 'x - x.mean() ortalaması 0 olduğu için y\'nin ortalaması korunur.'],
        why: 'Varyans azalması tam olarak ρ² kadardır: deney öncesi metrik sonuçla ne kadar ilişkiliyse o kadar gürültü çıkar. ρ = 0,87 ile varyans yaklaşık dörtte birine iner.'
      },
      {
        t: 'code',
        id: 'istatistik-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas', 'scipy'],
        q: '<p><code>ardisik_p(df, adim=100)</code>: tabloyu <code>user_id</code>\'ye göre sırala; ilk <code>adim</code>, <code>2·adim</code>, ... kullanıcı (son nokta tüm tablo) için dönüşüm z-testinin iki yönlü p-değerini hesapla ve 3 basamaklı <code>float</code> listesi döndür. Bu, her gün sonuca bakan bir ekibin göreceği yoldur.</p>',
        start: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef ardisik_p(df, adim=100):\n    pass\n',
        sol: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef ardisik_p(df, adim=100):\n    s = df.sort_values("user_id")\n    sonuc = []\n    for k in range(adim, len(s) + 1, adim):\n        g = s.iloc[:k].groupby("variant")["converted"].agg(["sum", "count"])\n        xa, na = g.loc["A"]\n        xb, nb = g.loc["B"]\n        p = (xa + xb) / (na + nb)\n        z = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n        sonuc.append(round(float(2 * stats.norm.sf(abs(z))), 3))\n    return sonuc\n',
        tests: 'ab = veri.oku("anadolu_market", "ab_test")\nyol = ardisik_p(ab)\nassert len(yol) == 20, "2000 / 100 = 20 bakış"\nassert yol[:4] == [0.158, 0.014, 0.052, 0.125], f"İlk bakışlar: {yol[:4]}"\nassert yol[-1] == 0.012, "Son bakış tüm tablonun p-değeri"\nassert sum(p < 0.05 for p in yol) == 11, "20 bakışın 11\'inde p < 0.05"\nassert ardisik_p(ab, adim=500) == [0.07, 0.035, 0.057, 0.012], "adim=500 ile 4 bakış"\n',
        hints: ['range(adim, len(s) + 1, adim) son noktayı da kapsar (2000 adim\'in katıysa).', 'Her bakışta yalnızca ilk k satırı kullan: s.iloc[:k].'],
        why: 'p-değeri veri biriktikçe rastgele yürür; 0.05 çizgisinin iki yanında gidip gelir. "Bir kez altına indi" anlamlılık değildir.'
      },
      {
        t: 'code',
        id: 'istatistik-v5',
        stage: 'Kendin yaz',
        diff: 3,
        needs: ['numpy', 'scipy'],
        q: '<p>Peeking\'in maliyetini simüle et. <code>aa_peeking(tekrar=500, n=2000, oran=0.11, bakis=10, seed=42)</code>: <code>rng = np.random.default_rng(seed)</code>. Her tekrarda önce <code>a = rng.random(n) &lt; oran</code>, sonra <code>b = rng.random(n) &lt; oran</code> üret (iki grup da AYNI oran: A/A testi). <code>n/bakis</code>, <code>2n/bakis</code>, ..., <code>n</code> kullanıcıda birleşik z-testi yap. <code>(herhangi_bakista_anlamli_orani, yalniz_sonda_anlamli_orani)</code> döndür (3 basamak, α = 0.05).</p>',
        start: 'import numpy as np\nfrom scipy import stats\n\ndef aa_peeking(tekrar=500, n=2000, oran=0.11, bakis=10, seed=42):\n    pass\n',
        sol: 'import numpy as np\nfrom scipy import stats\n\ndef _p(xa, xb, k):\n    p = (xa + xb) / (2 * k)\n    se = np.sqrt(p * (1 - p) * (2 / k))\n    z = (xb - xa) / k / se if se > 0 else 0.0\n    return 2 * stats.norm.sf(abs(z))\n\ndef aa_peeking(tekrar=500, n=2000, oran=0.11, bakis=10, seed=42):\n    rng = np.random.default_rng(seed)\n    herhangi = sonda = 0\n    adim = n // bakis\n    for _ in range(tekrar):\n        a = rng.random(n) < oran\n        b = rng.random(n) < oran\n        ps = [_p(a[:k].sum(), b[:k].sum(), k) for k in range(adim, n + 1, adim)]\n        herhangi += any(p < 0.05 for p in ps)\n        sonda += ps[-1] < 0.05\n    return round(herhangi / tekrar, 3), round(sonda / tekrar, 3)\n',
        tests: 'h, s = aa_peeking()\nassert (h, s) == (0.19, 0.064), f"Beklenen (0.19, 0.064), gelen {(h, s)}"\nassert h > 2.5 * s, "10 kez bakmak yanlış pozitifi katlamalı"\nh1, s1 = aa_peeking(tekrar=200, bakis=1)\nassert h1 == s1, "Tek bakışta iki oran aynı olmalı"\n',
        hints: ['Kümülatif sayı: a[:k].sum().', 'Gerçekte fark yokken p < 0.05 bulmak yanlış pozitiftir.', 'any(...) "en az bir bakışta" demektir.'],
        why: 'Fark yokken bile 10 kez bakıp ilk anlamlı sonuçta durmak, deneylerin yaklaşık %19\'unda "kazanan" ilan ettirir. Yalnızca sonda bakıldığında oran nominal %5\'e yakındır.'
      },
      {
        t: 'code',
        id: 'istatistik-v6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas', 'scipy'],
        q: '<p>Hatayı bul ve düzelt. <code>donusum_p(df)</code> A/B dönüşüm farkı için <b>iki yönlü</b> z-testi p-değerini 4 basamakla döndürmeli (beklenen 0.0118). Ama 0.0059 dönüyor ve A ile B\'nin yeri değişince 0.9941 oluyor.</p>',
        start: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef donusum_p(df):\n    g = df.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    p = (xa + xb) / (na + nb)\n    z = (xa / na - xb / nb) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n    return round(float(stats.norm.cdf(z)), 4)\n',
        sol: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef donusum_p(df):\n    g = df.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    p = (xa + xb) / (na + nb)\n    z = (xa / na - xb / nb) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n    return round(float(2 * stats.norm.sf(abs(z))), 4)\n',
        tests: 'ab = veri.oku("anadolu_market", "ab_test")\nassert donusum_p(ab) == 0.0118, f"İki yönlü p 0.0118 olmalı, {donusum_p(ab)} geldi"\nters = ab.assign(variant=ab["variant"].map({"A": "B", "B": "A"}))\nassert donusum_p(ters) == 0.0118, "Grupların adı değişince iki yönlü p değişmemeli"\n',
        hints: ['norm.cdf(z) tek yönlü ve işarete bağlıdır.', 'İki yönlü: 2 * norm.sf(abs(z)).'],
        why: 'Tek yönlü olasılık hem yarı yarıya küçük çıkar hem de farkın yönüne göre 0.006 ile 0.994 arasında savrulur. Önceden "yalnızca B daha iyi olabilir" diye yazılmış bir hipotez yoksa iki yönlü test kullanılır.'
      },
      {
        t: 'code',
        id: 'istatistik-v7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'scipy'],
        q: '<p><code>karar_notu(df, seed=0, B=2000)</code>: deney raporu üret. Adımlar: (1) SRM (%50/%50, eşik 0.001); SRM varsa <code>{"karar": "DUR: SRM", "srm_p": p}</code> döndür. (2) Dönüşüm z-testi (iki yönlü p, 4 basamak). (3) Kullanıcı başına gelir farkı (B − A) için bootstrap %95 güven aralığı: <code>rng = np.random.default_rng(seed)</code>; her turda ÖNCE B\'nin, SONRA A\'nın gelirlerinden yerine koyarak aynı büyüklükte örnek çek (<code>rng.choice</code>), ortalama farkını kaydet; <code>np.percentile(..., [2.5, 97.5])</code>, 2 basamak. (4) Karar: p &lt; 0.05 ve gelir aralığının alt ucu &gt; 0 ise <code>"YAYINLA"</code>, değilse <code>"BEKLE"</code>. Dönüş: <code>{"karar", "srm_p", "donusum_p", "gelir_farki", "gelir_ga"}</code> (<code>srm_p</code> 4, <code>gelir_farki</code> 2 basamak).</p>',
        start: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef karar_notu(df, seed=0, B=2000):\n    pass\n',
        sol: 'import veri\nimport numpy as np\nfrom scipy import stats\n\ndef karar_notu(df, seed=0, B=2000):\n    n = df["variant"].value_counts().reindex(["A", "B"])\n    srm_p = round(float(stats.chisquare(n.values).pvalue), 4)\n    if srm_p < 0.001:\n        return {"karar": "DUR: SRM", "srm_p": srm_p}\n    g = df.groupby("variant")["converted"].agg(["sum", "count"])\n    xa, na = g.loc["A"]\n    xb, nb = g.loc["B"]\n    p = (xa + xb) / (na + nb)\n    z = (xb / nb - xa / na) / np.sqrt(p * (1 - p) * (1 / na + 1 / nb))\n    dp = round(float(2 * stats.norm.sf(abs(z))), 4)\n    ra = df.loc[df["variant"] == "A", "revenue"].to_numpy()\n    rb = df.loc[df["variant"] == "B", "revenue"].to_numpy()\n    rng = np.random.default_rng(seed)\n    farklar = []\n    for _ in range(B):\n        farklar.append(rng.choice(rb, len(rb)).mean() - rng.choice(ra, len(ra)).mean())\n    alt, ust = np.percentile(farklar, [2.5, 97.5])\n    ga = (round(float(alt), 2), round(float(ust), 2))\n    karar = "YAYINLA" if dp < 0.05 and ga[0] > 0 else "BEKLE"\n    return {"karar": karar, "srm_p": srm_p, "donusum_p": dp,\n            "gelir_farki": round(float(rb.mean() - ra.mean()), 2), "gelir_ga": ga}\n',
        tests: 'ab = veri.oku("anadolu_market", "ab_test")\nr = karar_notu(ab)\nassert r["srm_p"] == 0.2636 and r["donusum_p"] == 0.0118, f"Testler: {r}"\nassert r["gelir_farki"] == 21.68, f"Kişi başı gelir farkı 21.68 TL olmalı: {r}"\nassert r["gelir_ga"] == (8.19, 35.96), f"Bootstrap aralığı: {r.get(\'gelir_ga\')}"\nassert r["karar"] == "YAYINLA", "İki metrik de olumlu: YAYINLA"\nbozuk = ab[~((ab["variant"] == "B") & (ab["converted"] == 0) & (ab["user_id"] % 2 == 0))]\nassert karar_notu(bozuk)["karar"] == "DUR: SRM", "Ciddi SRM\'de rapor durmalı"\nkucuk = ab[ab["user_id"] <= 500]\nassert karar_notu(kucuk, B=500)["karar"] == "BEKLE", "500 kullanıcıyla kanıt yetersiz"\n',
        hints: ['SRM kontrolü bir kapıdır: geçmezse diğer hesaplara hiç girme.', 'Bootstrap\'te rastgele çekim sırası sonucu değiştirir; önce B, sonra A.', 'Karar kuralını tek satırda yaz: dp < 0.05 and ga[0] > 0.'],
        why: 'Gerçek deneyde SRM yok, dönüşüm farkı anlamlı (p = 0.012) ve kişi başı gelir farkının aralığı (8 ile 36 TL) sıfırın üstünde: yeni tasarım yayına alınabilir. Aynı kod bozuk veride durur, küçük örneklemde "bekle" der.'
      }
    ],
    faq: [
      {
        q: 'SRM için neden 0.05 değil de 0.001 gibi küçük bir eşik kullanılıyor?',
        a: 'SRM kontrolü her deneyde, çoğu zaman her gün çalışır. 0.05 eşiğiyle sağlıklı deneylerin %5\'inde boşuna alarm verirdi. Gerçek bölme hataları genellikle çok küçük p-değerleri üretir; 0.001 yanlış alarmı azaltırken ciddi kırılmaları yine yakalar.'
      },
      {
        q: 'CUPED ile regresyona kovaryat eklemek aynı şey mi?',
        a: 'Neredeyse aynıdır: Y ~ grup + X regresyonundaki grup katsayısı, CUPED ile düzeltilmiş ortalama farkına çok yakındır. CUPED\'in avantajı basitliği ve deney platformlarında metrik bazında kolayca uygulanabilmesidir. Kural ikisinde de aynı: kovaryat deneyden ÖNCE ölçülmüş olmalı.'
      }
    ],
    mistakes: [
      {
        bad: 'p = stats.norm.cdf(z)',
        good: 'p = 2 * stats.norm.sf(abs(z))',
        why: 'cdf tek yönlüdür ve farkın işaretine göre 0\'a ya da 1\'e yakın çıkar; iki yönlü test için 2·sf(|z|) kullanılır.'
      },
      {
        bad: '# her gün bak, p < 0.05 olunca durdur',
        good: '# örneklemi güç analiziyle önceden belirle, sonda bak\n# ya da sıralı test (alpha spending) kullan',
        why: 'Tekrarlı bakış yanlış pozitif oranını %5\'in çok üstüne çıkarır.'
      }
    ]
  }
);
})(window);
