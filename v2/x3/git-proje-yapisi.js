/* PythonPatika — 'git-proje-yapisi' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
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
- Kaynak: PythonPatika "anadolu_market" kurgusal veri seti (10 tablo, 6.236 satır)
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
<div class="note"><b>Gerçek işte</b>İşe alımcılar çok sayıda "Titanic" ve "Iris" deposu görür. Seni ayıran; gerçekçi bir iş sorusu, koddan üretilen ve tekrar edilebilen sonuçlar, temiz klasör yapısı, testler ve tek komutla çalışan kurulumdur. PythonPatika, SQLPatika ve PBIPatika'daki aynı veri setleriyle yaptığın SQL, Python ve Power BI analizlerini tek bir portföy hikâyesinde birleştirebilirsin.</div>`,
    ex: [
      {
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
      },
      {
        t: 'predict',
        id: 'git-proje-yapisi-y3',
        stage: 'Kodu oku',
        q: 'Türkçe para biçimi: bu kod ne yazdırır?',
        o: ['199.387,25 96.956,10 0,50', '199,387.25 96,956.10 0.50', '199.387,25 96.956,1 0,5', '199387,25 96956,10 0,50'],
        a: 0,
        code: 'tl = lambda x: f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\nprint(tl(199387.25), tl(96956.1), tl(0.5))\n',
        why: ':,.2f binlik ayırıcı olarak virgül, ondalık olarak nokta koyar ve iki basamağa tamamlar. Geçici bir karakter (X) üzerinden yer değiştirmek, iki replace\'in birbirini bozmasını önler.'
      },
      {
        t: 'order',
        id: 'git-proje-yapisi-y4',
        stage: 'Kodu oku',
        q: '<p>README\'deki Markdown görsel bağlantılarını bulup eksik dosyaları yazdıran programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">eksik: [\'gorseller/kohort.png\']</pre>',
        lines: [
          'import re',
          'readme = "# Proje\\n![Ciro](gorseller/ciro.png)\\nMetin\\n![Kohort](gorseller/kohort.png)"',
          'mevcut = {"gorseller/ciro.png", "README.md"}',
          'yollar = re.findall(r"!\\[[^\\]]*\\]\\(([^)]+)\\)", readme)',
          'print("eksik:", [y for y in yollar if y not in mevcut])'
        ],
        expect: 'eksik: [\'gorseller/kohort.png\']\n',
        hint: 'Desen, yolları çıkarmadan önce derlenecek README metnine ihtiyaç duyar.',
        why: '![alt](yol) kalıbında yalnız parantez içindeki yol gruplanır. Görsel dosyası commit edilmezse GitHub\'da kırık görsel görünür; bu kontrol CI\'da ya da pre-commit kancasında çalıştırılabilir.'
      },
      {
        t: 'code',
        id: 'git-proje-yapisi-y5',
        stage: 'Rehberli',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>README bulgu tablosunu koddan üret: <code>bulgu_tablosu(conn, n=3)</code>, Anadolu Market\'te teslim edilen (<code>delivered</code>) siparişlerin şehir bazında sipariş sayısı ve cirosuna (<code>quantity * unit_price * (1 - discount)</code>) göre ilk <code>n</code> şehri Markdown tablosu metni olarak döndürsün. Başlık: <code>| Şehir | Sipariş | Ciro (TL) | Sipariş başı (TL) |</code>, ayırıcı <code>|---|---:|---:|---:|</code>. Tutarlar Türkçe biçimde (<code>199.387,25</code>); sipariş başı ciro 2 ondalık. Şehri boş müşterileri dışarıda bırak. Satırlar <code>\n</code> ile birleşik, sonda satır sonu yok.</p>',
        guide: [
          'SQL ile şehir, COUNT(DISTINCT order_id) ve SUM ciroyu hesapla; ciroya göre azalan sırala, LIMIT ile kes.',
          'Türkçe para biçimi için yardımcı fonksiyon yaz.',
          'Başlık ve ayırıcı satırını listeye koy, her şehir için bir satır ekle.',
          '"\\n".join ile birleştir.'
        ],
        example: 'satirlar = [("Kitap", 3, 450.0)]\nmd = ["| Kategori | Adet | Tutar |", "|---|---:|---:|"]\nmd += [f"| {k} | {a} | {t:.2f} |" for k, a, t in satirlar]\nprint("\\n".join(md))\n',
        start: 'def tl(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\ndef bulgu_tablosu(conn, n=3):\n    satirlar = []\n    # TODO: SQL sorgusu\n    md = ["| Şehir | Sipariş | Ciro (TL) | Sipariş başı (TL) |", "|---|---:|---:|---:|"]\n    # TODO: satırları ekle\n    return "\\n".join(md)\n',
        sol: 'def tl(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\ndef bulgu_tablosu(conn, n=3):\n    satirlar = conn.execute("""\n        SELECT c.city, COUNT(DISTINCT o.order_id) AS adet,\n               SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS ciro\n        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)\n        WHERE o.status = \'delivered\' AND c.city IS NOT NULL\n        GROUP BY c.city ORDER BY ciro DESC LIMIT ?""", (n,)).fetchall()\n    md = ["| Şehir | Sipariş | Ciro (TL) | Sipariş başı (TL) |", "|---|---:|---:|---:|"]\n    for sehir, adet, ciro in satirlar:\n        md.append(f"| {sehir} | {adet} | {tl(ciro)} | {tl(ciro / adet)} |")\n    return "\\n".join(md)\n',
        tests: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])\nt = bulgu_tablosu(c).split("\\n")\nassert len(t) == 5, f"Başlık + ayırıcı + 3 satır: {len(t)}"\nassert t[2] == "| İstanbul | 162 | 199.387,25 | 1.230,79 |", f"İlk satır: {t[2]}"\nassert t[3] == "| İzmir | 84 | 130.451,15 | 1.552,99 |", f"İkinci satır: {t[3]}"\nassert t[4] == "| Eskişehir | 61 | 98.332,90 | 1.612,01 |", f"Üçüncü: {t[4]}"\nassert len(bulgu_tablosu(c, 1).split("\\n")) == 3, "n=1 tek satır"\n',
        hints: ['LIMIT ? ile n\'yi parametre olarak ver.', 'COUNT(DISTINCT ...) kalem JOIN\'inin şişirmesini önler.', 'Sipariş başı = ciro / adet; aynı tl() ile biçimle.'],
        why: 'Bulgu tablosunu koddan üretmek, veri ya da analiz değişince README\'nin sessizce eskimesini önler. Eskişehir\'in ciroda üçüncü, sipariş başı ciroda ise ilk üçün en yükseği olması gibi bir gözlem, README\'de tek cümlelik bulgu olmayı hak eder.'
      },
      {
        t: 'code',
        id: 'git-proje-yapisi-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>README denetleyicisi yaz: <code>readme_denetle(md)</code> eksikleri liste olarak döndürsün, şu sırayla:</p><ul><li>İlk boş olmayan satır <code># </code> ile başlamıyorsa: <code>"başlık yok"</code></li><li>Şu <code>## </code> bölümlerinden eksik olan her biri için <code>"bölüm yok: &lt;ad&gt;"</code> (sırayla): <code>Sorun</code>, <code>Veri</code>, <code>Bulgular</code>, <code>Nasıl çalıştırılır</code>. Başlık karşılaştırması büyük/küçük harf duyarsız ve baştaki-sondaki boşluklar yok sayılarak yapılır.</li><li>Hiç görsel (<code>![...](...)</code>) yoksa: <code>"görsel yok"</code></li><li><code>Bulgular</code> bölümünde (bir sonraki <code>## </code> başlığına kadar) hiç rakam yoksa: <code>"bulgularda rakam yok"</code> (bölüm yoksa bu kontrolü yapma)</li></ul>',
        start: 'import re\n\ndef readme_denetle(md):\n    pass\n',
        sol: 'import re\n\nGEREKLI = ["Sorun", "Veri", "Bulgular", "Nasıl çalıştırılır"]\n\ndef readme_denetle(md):\n    sorunlar = []\n    satirlar = md.splitlines()\n    ilk = next((s for s in satirlar if s.strip()), "")\n    if not ilk.startswith("# "):\n        sorunlar.append("başlık yok")\n    bolumler = {}\n    ad = None\n    for s in satirlar:\n        if s.startswith("## "):\n            ad = s[3:].strip().casefold()\n            bolumler[ad] = []\n        elif ad is not None:\n            bolumler[ad].append(s)\n    for g in GEREKLI:\n        if g.casefold() not in bolumler:\n            sorunlar.append(f"bölüm yok: {g}")\n    if not re.search(r"!\\[[^\\]]*\\]\\([^)]+\\)", md):\n        sorunlar.append("görsel yok")\n    b = bolumler.get("bulgular")\n    if b is not None and not re.search(r"\\d", "\\n".join(b)):\n        sorunlar.append("bulgularda rakam yok")\n    return sorunlar\n',
        tests: 'IYI = """# Anadolu Market analizi\n![Ciro](gorseller/ciro.png)\n## Sorun\nBüyüme nerede?\n## Veri\n910 sipariş\n##  bulgular\nİzmir\'de sipariş başı ciro 1.553 TL.\n## Nasıl çalıştırılır\npip install -r requirements.txt\n"""\nassert readme_denetle(IYI) == [], f"İyi README: {readme_denetle(IYI)}"\nKOTU = """\nProje\n\n## Bulgular\nİzmir iyi gidiyor.\n## Kurulum\npip install x\n"""\nassert readme_denetle(KOTU) == ["başlık yok", "bölüm yok: Sorun", "bölüm yok: Veri", "bölüm yok: Nasıl çalıştırılır", "görsel yok", "bulgularda rakam yok"], f"Gelen: {readme_denetle(KOTU)}"\nassert "bulgularda rakam yok" not in readme_denetle("# X\\n## Sorun\\n"), "Bulgular bölümü yoksa rakam kontrolü yapılmaz"\n',
        hints: [
          'Satırları gezip "## " ile başlayanlarda yeni bölüm aç; sonraki satırları o bölüme ekle.',
          'casefold() Türkçe dışı harflerde lower\'dan daha sağlamdır; burada başlıklar ASCII olmayan harf de içerebilir.',
          'Görsel için re.search(r"!\\[[^\\]]*\\]\\([^)]+\\)", md).'
        ],
        why: 'Bu kontrol listesini pre-commit kancası ya da CI adımı yapmak, portföydeki tüm depoların aynı kalite çıtasını tutmasını sağlar. Rakamsız bulgu ("satışlar iyi") okuyucuya hiçbir şey söylemez.'
      },
      {
        t: 'code',
        id: 'git-proje-yapisi-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>yayin_oncesi(dosyalar)</code> push öncesi denetim yapar. <code>dosyalar</code> <code>{yol: boyut_bayt}</code> sözlüğüdür. Döndür: <code>{"buyuk": [...], "gizli": [...]}</code>. <code>buyuk</code>: 50 MB (50 × 1024 × 1024 bayt) ve üstü dosyalar; <code>gizli</code>: adı tam olarak <code>.env</code> olan (herhangi bir klasörde) ya da <code>.pem</code>/<code>.key</code> ile biten dosyalar; <code>.env.example</code> gizli <b>değildir</b>. İki liste de sıralı. Şu anki kod 50 MB\'ı bayt yerine yanlış hesaplıyor ve <code>.env.example</code>\'ı gizli sayıyor, <code>config/.env</code>\'i kaçırıyor.</p>',
        start: 'def yayin_oncesi(dosyalar):\n    buyuk = sorted(y for y, b in dosyalar.items() if b > 50 * 1000)\n    gizli = sorted(y for y in dosyalar if y.startswith(".env") or y.endswith((".pem", ".key")))\n    return {"buyuk": buyuk, "gizli": gizli}\n',
        sol: 'from pathlib import PurePosixPath\n\ndef yayin_oncesi(dosyalar):\n    buyuk = sorted(y for y, b in dosyalar.items() if b >= 50 * 1024 * 1024)\n    gizli = sorted(y for y in dosyalar if PurePosixPath(y).name == ".env" or y.endswith((".pem", ".key")))\n    return {"buyuk": buyuk, "gizli": gizli}\n',
        tests: 'MB = 1024 * 1024\nD = {"README.md": 4000, "data/siparisler.csv": 180 * MB, "gorseller/ciro.png": 300_000, "model.pkl": 50 * MB,\n     ".env": 120, ".env.example": 90, "config/.env": 60, "deploy/sunucu.pem": 1700, "notebooks/analiz.ipynb": 2 * MB}\nr = yayin_oncesi(D)\nassert r["buyuk"] == ["data/siparisler.csv", "model.pkl"], f"Büyük dosyalar: {r[\'buyuk\']}"\nassert r["gizli"] == [".env", "config/.env", "deploy/sunucu.pem"], f"Gizli dosyalar: {r[\'gizli\']}"\n',
        hints: ['Üç hata: birim (1000 değil 1024 × 1024), eşitlik (>=) ve yol yerine dosya adı.', 'PurePosixPath(y).name dosyanın yalnız adını verir.', '.env.example adı ".env" ile başlar ama ".env" değildir.'],
        why: 'Push sonrası fark edilen bir sır, git geçmişinden silinse bile kopyalanmış sayılır ve değiştirilmesi gerekir; bu yüzden kontrol push öncesinde yapılır. Büyük dosya ise geçmişte kalıcı yer kaplar ve depoyu klonlamayı yavaşlatır.'
      },
      {
        t: 'code',
        id: 'git-proje-yapisi-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>README\'yi şablondan üret: <code>readme_uret(proje)</code>. <code>proje</code> sözlüğünde <code>ad</code>, <code>ozet</code>, <code>gorsel</code> (yol ya da <code>None</code>), <code>sorun</code>, <code>veri</code> (madde listesi), <code>bulgular</code> (madde listesi), <code>komutlar</code> (liste), <code>teknolojiler</code> (liste) var. Çıktı şu sırada Markdown olmalı (bölümler arasında tek boş satır, sonda tek <code>\n</code>):</p><pre class="out"># &lt;ad&gt;\n\n&gt; &lt;ozet&gt;\n\n![&lt;ad&gt;](&lt;gorsel&gt;)        (gorsel None ise bu blok yok)\n\n## Sorun\n&lt;sorun&gt;\n\n## Veri\n- madde\n...\n\n## Bulgular\n1. madde\n2. madde\n\n## Nasıl çalıştırılır\n```bash\nkomut\n```\n\n## Teknolojiler\nA · B · C</pre><p>Boş liste olan bölüm (veri, bulgular, komutlar, teknolojiler) tamamen atlanır. Metinlerin baş/son boşlukları kırpılır.</p>',
        start: 'def readme_uret(proje):\n    return ""\n',
        sol: 'def readme_uret(proje):\n    p = {k: (v.strip() if isinstance(v, str) else v) for k, v in proje.items()}\n    bloklar = [f"# {p[\'ad\']}", f"> {p[\'ozet\']}"]\n    if p.get("gorsel"):\n        bloklar.append(f"![{p[\'ad\']}]({p[\'gorsel\']})")\n    bloklar.append(f"## Sorun\\n{p[\'sorun\']}")\n    if p.get("veri"):\n        bloklar.append("## Veri\\n" + "\\n".join(f"- {m.strip()}" for m in p["veri"]))\n    if p.get("bulgular"):\n        bloklar.append("## Bulgular\\n" + "\\n".join(f"{i}. {m.strip()}" for i, m in enumerate(p["bulgular"], 1)))\n    if p.get("komutlar"):\n        bloklar.append("## Nasıl çalıştırılır\\n```bash\\n" + "\\n".join(k.strip() for k in p["komutlar"]) + "\\n```")\n    if p.get("teknolojiler"):\n        bloklar.append("## Teknolojiler\\n" + " · ".join(t.strip() for t in p["teknolojiler"]))\n    return "\\n\\n".join(bloklar) + "\\n"\n',
        tests: 'P = {"ad": "Anadolu Market analizi", "ozet": " 910 siparişte şehir bazlı ciro. ", "gorsel": "gorseller/ciro.png",\n     "sorun": "Büyüme nerede?", "veri": ["anadolu_market", "2022-06 – 2024-12 "],\n     "bulgular": ["İstanbul ciroda ilk: 199.387,25 TL", "İzmir sipariş başı ciro: 1.552,99 TL"],\n     "komutlar": ["pip install -r requirements.txt", "python -m analiz.rapor"], "teknolojiler": ["Python", "pandas", "SQLite"]}\nbeklenen = ("# Anadolu Market analizi\\n\\n> 910 siparişte şehir bazlı ciro.\\n\\n![Anadolu Market analizi](gorseller/ciro.png)\\n\\n"\n            "## Sorun\\nBüyüme nerede?\\n\\n## Veri\\n- anadolu_market\\n- 2022-06 – 2024-12\\n\\n"\n            "## Bulgular\\n1. İstanbul ciroda ilk: 199.387,25 TL\\n2. İzmir sipariş başı ciro: 1.552,99 TL\\n\\n"\n            "## Nasıl çalıştırılır\\n" + chr(96) * 3 + "bash\\npip install -r requirements.txt\\npython -m analiz.rapor\\n" + chr(96) * 3 + "\\n\\n"\n            "## Teknolojiler\\nPython · pandas · SQLite\\n")\nassert readme_uret(P) == beklenen, "Çıktı şablonla birebir aynı olmalı"\nkisa = readme_uret(dict(P, gorsel=None, veri=[], komutlar=[], teknolojiler=[]))\nassert "![" not in kisa and "## Veri" not in kisa and "## Nasıl" not in kisa and "## Teknolojiler" not in kisa, "Boş bölümler atlanmalı"\nassert kisa.endswith("1.552,99 TL\\n") and not kisa.endswith("\\n\\n"), "Sonda tek satır sonu"\n',
        hints: ['Her bölümü bir metin bloğu olarak listeye ekle; en sonda "\\n\\n".join ile birleştir.', 'Numaralı liste için enumerate(liste, 1).', 'Kod çiti için üç ters tırnak; boş bölümleri if ile atla.'],
        why: 'Şablondan üretilen README tüm portföy depolarında tutarlı bir yapı sağlar; içerik (bulgular, rakamlar) ise analiz kodundan beslenebilir. Blokları listede toplayıp en sonda birleştirmek, boş satır ve isteğe bağlı bölüm sorunlarını tek yerden çözer.'
      }
    ],
    faq: [
      {
        q: 'Portföyde kaç proje olmalı?',
        a: 'Nicelikten çok nitelik: hedeflediğin role uygun 3-5 iyi proje. Analist için bir SQL + Python analizi ve bir pano; bilimci için uçtan uca bir model (veri → değerlendirme → servis); mühendis için bir veri hattı; backend için testli, dockerize bir API. Her birinde README şablonundaki bölümler eksiksiz olsun.'
      }
    ]
  }
);
})(window);
