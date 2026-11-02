/* Kesit Python — 'git-proje-yapisi' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'git-proje-yapisi',
    min: 25,
    needs: ['sqlite3'],
    html: `<p>Bir işe alımcı portföy deponu ortalama bir-iki dakika inceler ve çoğu zaman yalnız README'yi okur. Bu bölüm, bir analiz ya da yazılım projesini GitHub'da "okunur" bir portföy parçasına çevirmeyi anlatıyor: README şablonu, bulgu özeti, ekran görüntüleri ve depoyu yayına alma adımları.</p>
<h2>Portföy deposunun yapısı</h2>
<pre class="out">anadolu-market-analizi/
├── README.md              ← vitrin: 1 dakikada okunur
├── notebooks/             ← keşif (çıktıları temizlenmiş, nbstripout)
├── src/analiz/            ← tekrar kullanılan kod
├── raporlar/rapor.html    ← nbconvert/Quarto çıktısı
├── gorseller/             ← README'de kullanılan PNG'ler (küçük, sıkıştırılmış)
├── data/README.md         ← veri nereden, nasıl indirilir (ham veri depoda değil)
├── tests/
├── pyproject.toml / requirements.txt
└── LICENSE</pre>
<h2>README şablonu</h2>
<p>İyi bir portföy README'si bir hikâye anlatır: sorun neydi, ne yaptın, ne buldun, nasıl tekrar üretilir. Aşağıdaki başlıklar hem analiz hem yazılım projelerinde işe yarar:</p>
<pre class="code"># Anadolu Market: Şehir bazlı satış ve iade analizi

&gt; 910 siparişlik e-ticaret verisinde ciro ve iadeyi şehir, kanal ve zamana göre inceledim.
&gt; En önemli bulgu: ... (tek cümle, rakamla)

![Şehir bazlı ciro](gorseller/sehir_ciro.png)

## Sorun
Yönetim hangi şehirlerde büyümeye yatırım yapılacağını soruyor.

## Veri
- Kaynak: Kesit Python "anadolu_market" kurgusal veri seti (10 tablo, 6.236 satır)
- Dönem: 2022-06 – 2024-12

## Yöntem
SQL (sqlite3) ile birleştirme → pandas ile temizlik → kohort ve RFM → görselleştirme

## Bulgular
| Şehir | Teslim edilen sipariş | Ciro (TL) |
|---|---|---|
| İstanbul | 162 | 199.387,25 |
| ...

1. ...
2. ...

## Öneriler ve sınırlamalar

## Nasıl çalıştırılır
    git clone https://github.com/kullanici/anadolu-market-analizi
    cd anadolu-market-analizi &amp;&amp; pip install -r requirements.txt
    python -m analiz.rapor        # raporlar/rapor.html üretir

## Teknolojiler
Python 3.12 · pandas · SQLite · matplotlib · pytest</pre>
<div class="tip"><b>Bulgu özeti nasıl yazılır?</b>Her bulgu bir cümle, bir rakam ve bir "neden önemli" içersin: "İzmir, İstanbul'un yarısı kadar siparişle onun cirosunun üçte ikisini üretiyor; sipariş başı ciro İstanbul'dan %26 yüksek." Yöntemi bulgunun önüne koyma; okuyucu önce sonucu görmek ister. Sınırlamaları dürüstçe yaz (kurgusal veri, kısa dönem, örneklem küçük): bu bir zayıflık değil, olgunluk işaretidir.</div>
<p>Bulgu tablosunu elle yazmak yerine koddan üret; README sayıları ile rapor sayıları hiç ayrışmaz:</p>
<pre class="py">import veri
conn = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])
satirlar = conn.execute("""
    SELECT c.city, COUNT(DISTINCT o.order_id),
           ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2) AS ciro
    FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)
    WHERE o.status = 'delivered' AND c.city IS NOT NULL
    GROUP BY c.city ORDER BY ciro DESC LIMIT 3""").fetchall()

tl = lambda x: f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
print("| Şehir | Teslim edilen sipariş | Ciro (TL) |")
print("|---|---|---|")
for sehir, n, ciro in satirlar:
    print(f"| {sehir} | {n} | {tl(ciro)} |")</pre>
<h2>Ekran görüntüleri ve görseller</h2>
<p>README'nin en üstündeki tek bir grafik ya da uygulama ekran görüntüsü, okuyucunun kalmasını sağlar. Görselleri <code>gorseller/</code> klasörüne koy, göreli yolla bağla (<code>![açıklama](gorseller/x.png)</code>), alternatif metni anlamlı yaz, boyutu küçük tut (genişlik 1200 px civarı, birkaç yüz KB). Etkileşimli bir uygulama ise kısa bir GIF ya da canlı demo bağlantısı (Streamlit Community Cloud, Render, GitHub Pages) çok etkilidir.</p>
<h2>GitHub'da yayın</h2>
<div class="steps-list"><ol>
<li>Gizli bilgi taraması: <code>.env</code>, parola, kişisel veri depoda olmamalı (<code>git log -p | grep -i parola</code>; GitHub secret scanning da uyarır).</li>
<li>Büyük dosya: GitHub 100 MB üstü dosyayı reddeder, 50 MB'ta uyarır. Veriyi depoya koyma; nasıl indirileceğini <code>data/README.md</code>'de anlat ya da Git LFS kullan.</li>
<li>Notebook çıktılarını temizle (<code>nbstripout</code>) ama rapor HTML'ini <code>raporlar/</code>'a koy.</li>
<li><code>gh repo create anadolu-market-analizi --public --source=. --push</code> ya da web arayüzünden depo oluşturup <code>git remote add origin ...</code> + <code>git push -u origin main</code>.</li>
<li>Depo sayfasında "About" kısmına tek cümlelik açıklama ve konular (topics: <code>python</code>, <code>pandas</code>, <code>data-analysis</code>) ekle; profilinde en iyi 4-6 depoyu sabitle (pin).</li>
<li>Rapor HTML'ini GitHub Pages ile yayınla (Settings → Pages → <code>main</code>/<code>docs</code>); README'den bağlantı ver.</li>
</ol></div>
<div class="note"><b>Gerçek işte</b>İşe alımcılar çok sayıda "Titanic" ve "Iris" deposu görür. Seni ayıran; gerçekçi bir iş sorusu, koddan üretilen ve tekrar edilebilen sonuçlar, temiz klasör yapısı, testler ve tek komutla çalışan kurulumdur. Kesit Python, Kesit SQL ve Kesit Power BI'daki aynı veri setleriyle yaptığın SQL, Python ve Power BI analizlerini tek bir portföy hikâyesinde birleştirebilirsin.</div>`,
    ex: [{
        t: 'mc',
        id: 'git-proje-yapisi-y1',
        stage: 'Isınma',
        q: 'Portföy README\'sinin en üstünde (ilk ekranda) ne olmalı?',
        o: ['Kurulum komutlarının adım adım ayrıntılı listesi', 'Tek cümlelik özet, en önemli bulgu ve bir görsel', 'Kullanılan tüm kütüphanelerin sürüm numaralı tablosu', 'Projenin lisans metninin tamamı ve telif bilgisi'],
        a: 1,
        why: 'Okuyucu ilk ekranda "bu ne, neden ilginç?" sorusunun cevabını görmezse devam etmez. Kurulum, teknolojiler ve lisans aşağıda yer alır; lisans metni ayrı LICENSE dosyasında durur.'
      },
    {
        t: 'mc',
        id: 'git-proje-yapisi-y2',
        stage: 'Isınma',
        q: 'Analiz projende 180 MB\'lık ham CSV var. Portföy deposunda en doğru yaklaşım hangisi?',
        o: [
          'CSV\'yi doğrudan commit edip push etmek',
          'Veriyi depoya koymayıp data/README.md\'de kaynağını ve indirme adımını anlatmak',
          'CSV\'yi ZIP\'leyip 100 MB\'ın altına indirip commit etmek',
          'Verinin yalnız ilk 1000 satırını commit edip analizi onunla çalıştırmak'
        ],
        a: 1,
        why: 'GitHub 100 MB üstü dosyaları reddeder; büyük ikili dosyalar depoyu kalıcı olarak şişirir. Kaynak ve indirme betiğiyle tekrar üretilebilirlik sağlanır. Gerçekten sürümlenmesi gereken büyük dosyalar için Git LFS ya da DVC kullanılır.'
      }],
    faq: [
      {
        q: 'Portföyde kaç proje olmalı?',
        a: 'Nicelikten çok nitelik: hedeflediğin role uygun 3-5 iyi proje. Analist için bir SQL + Python analizi ve bir pano; bilimci için uçtan uca bir model (veri → değerlendirme → servis); mühendis için bir veri hattı; backend için testli, dockerize bir API. Her birinde README şablonundaki bölümler eksiksiz olsun.'
      }
    ]
  }
);
})(window);
