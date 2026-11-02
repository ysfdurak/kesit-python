/* PythonPatika — 'web-scraping' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'web-scraping',
    min: 30,
    html: `<p>Derste Playwright'ı tek bir örnekle tanıdın: sayfayı aç, içeriği al. Gerçek otomasyon işlerinde ise asıl zorluklar başka yerdedir: sayfanın ne zaman "hazır" olduğunu bilmek, her çalıştırmada yeniden giriş yapmamak, sayfanın arkasındaki JSON API'yi bulmak ve dosya indirmek. Bu bölüm bu dört kalıbı gösteriyor; alıştırmalar ise tarayıcıda çalışan BeautifulSoup ve JSON üzerinde.</p>
<h2>Bekleme stratejileri</h2>
<p>Dinamik sayfada içerik JavaScript ile sonradan gelir. En kötü çözüm <code>time.sleep(5)</code>'tir: yavaş ağda yetmez, hızlı ağda boşa bekletir. Playwright'ın <b>locator</b> API'si eylemlerden önce elemanın görünür, etkin ve sabit olmasını kendiliğinden bekler (auto-wait); sen yalnız <b>neyi</b> beklediğini söylersin.</p>
<pre class="code">from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    tarayici = p.chromium.launch(headless=True)
    sayfa = tarayici.new_page()
    sayfa.goto("https://portal.example.com/siparisler", wait_until="domcontentloaded")

    satirlar = sayfa.locator("table#siparis tbody tr")
    expect(satirlar.first).to_be_visible(timeout=10_000)       # ilk satır gelene kadar
    sayfa.get_by_role("button", name="Daha fazla").click()      # tıklamadan önce kendisi bekler
    expect(satirlar).to_have_count(40)                          # 40 satır olana kadar
    sayfa.wait_for_load_state("networkidle")                    # son çare: ağ susana kadar
    print(satirlar.all_inner_texts()[:3])</pre>
<div class="tbl-wrap"><table><tr><th>Bekleme</th><th>Ne zaman?</th></tr>
<tr><td><code>expect(locator).to_be_visible()</code></td><td>Belirli bir eleman görünene kadar (en sağlam)</td></tr>
<tr><td><code>page.wait_for_response(lambda r: "/api/siparis" in r.url)</code></td><td>Belirli bir API çağrısı bitene kadar</td></tr>
<tr><td><code>wait_for_load_state("networkidle")</code></td><td>Ağda 500 ms hiçbir istek olmayana kadar; sürekli yoklama yapan sayfalarda hiç gelmeyebilir</td></tr>
<tr><td><code>time.sleep</code></td><td>Hiçbir zaman (hata ayıklarken bile <code>page.pause()</code> daha iyidir)</td></tr></table></div>
<h2>Giriş yapılan portalda oturumu saklamak</h2>
<p>Her çalıştırmada kullanıcı adı ve parola girmek yavaştır, iki aşamalı doğrulamaya takılır ve hesabı kilitletebilir. Playwright tarayıcı bağlamının çerezlerini ve localStorage'ını bir JSON dosyasına (<code>storage_state</code>) yazar; sonraki çalıştırmalar bu dosyayla giriş yapmış olarak başlar.</p>
<pre class="code">import os
DURUM = "oturum.json"           # .gitignore'a ekle: içinde oturum çerezleri var!

def baglam_ac(tarayici):
    if os.path.exists(DURUM):
        return tarayici.new_context(storage_state=DURUM)
    baglam = tarayici.new_context()
    s = baglam.new_page()
    s.goto("https://portal.example.com/giris")
    s.get_by_label("Kullanıcı adı").fill(os.environ["PORTAL_KULLANICI"])
    s.get_by_label("Parola").fill(os.environ["PORTAL_PAROLA"])
    s.get_by_role("button", name="Giriş").click()
    s.wait_for_url("**/panel")
    baglam.storage_state(path=DURUM)
    return baglam</pre>
<p>Oturum süresi dolunca (portal giriş sayfasına yönlendirince) dosyayı silip yeniden giriş yap. Çerezlerin süresini dosyadan okuyabilirsin: her çerezin <code>expires</code> alanı Unix zamanıdır (<code>-1</code>: tarayıcı kapanınca biten oturum çerezi).</p>
<h2>Ağ yanıtını yakalayıp gizli API'yi kullanmak</h2>
<p>Çoğu dinamik sayfa veriyi bir JSON uç noktasından çeker ve HTML'i tarayıcıda üretir. O JSON'u doğrudan almak, HTML'i kazımaktan çok daha sağlam ve hızlıdır: seçiciler kırılmaz, sayılar biçimlenmemiş gelir. Tarayıcının geliştirici araçlarında Ağ (Network) sekmesinde Fetch/XHR süzgeciyle bu çağrıyı bulabilir ya da Playwright ile yakalayabilirsin:</p>
<pre class="code">with sayfa.expect_response(lambda r: "/api/v1/siparisler" in r.url and r.status == 200) as bilgi:
    sayfa.get_by_role("button", name="Listele").click()
veri = bilgi.value.json()                    # {"items": [...], "next_cursor": "..."}

# Uç noktayı öğrendikten sonra aynı oturum çerezleriyle doğrudan çağır:
yanit = baglam.request.get("https://portal.example.com/api/v1/siparisler", params={"cursor": veri["next_cursor"]})</pre>
<div class="warn"><b>Gizli API de kurallara tabidir</b>Belgelenmemiş bir uç noktayı kullanmak sitenin kullanım koşullarına aykırı olabilir ve haber vermeden değişebilir. Derste gördüğün robots.txt, hız sınırı ve KVKK kuralları burada da geçerli. Resmî bir API varsa onu tercih et.</div>
<h2>Dosya indirmek</h2>
<p>Rapor dışa aktarma düğmeleri çoğunlukla bir indirme başlatır. Playwright indirmeyi bir olay olarak yakalar; dosyayı geçici bir yerden kendi klasörüne sen taşırsın. Dosya adını tarihle zenginleştir ve önce geçici ada yazıp sonra yeniden adlandır ki yarım dosya bir sonraki adımda okunmasın.</p>
<pre class="code">with sayfa.expect_download() as indirme:
    sayfa.get_by_role("link", name="Excel'e aktar").click()
dosya = indirme.value
hedef = f"indirilenler/{dosya.suggested_filename}"
dosya.save_as(hedef)</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install playwright</code> ve <code>playwright install chromium</code>. <code>playwright codegen https://site</code> komutu tarayıcıda yaptığın tıklamaları koda çevirir; seçicileri bulmak için harika bir başlangıçtır. Tarayıcı içinde Playwright çalışmaz; aşağıdaki alıştırmalar kazınan HTML ve yakalanan JSON üzerinde çalışır.</div>
<div class="note"><b>Gerçek işte</b>Otomasyon ekiplerinde tipik iş, tedarikçi ya da kamu portalından her sabah rapor indirmektir. Sağlam bir çözümün işaretleri: sleep yok, oturum dosyası saklanıyor ve süresi denetleniyor, veri mümkünse JSON'dan alınıyor, dosya adları tarihle ve atomik olarak kaydediliyor, her adım loglanıyor.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'web-scraping-y1',
        stage: 'Isınma',
        q: 'Playwright betiğin bazen boş tablo okuyor. Şu an <code>sayfa.goto(url)</code> sonrasında <code>time.sleep(2)</code> var. En sağlam düzeltme hangisi?',
        o: [
          'Beklemeyi <code>time.sleep(10)</code> yapıp güvenli tarafta kalmak',
          'İlk satır görünene kadar <code>expect(...).to_be_visible()</code>',
          'Tablo dolana kadar sayfayı üç kez yeniden yüklemek',
          'Betiği <code>headless=False</code> ile görünür tarayıcıda çalıştırmak'
        ],
        a: 1,
        why: 'Sabit bekleme ağ hızına bağlıdır; ya yetmez ya boşa bekletir. Beklemeyi bir koşula (eleman görünür, sayı şu kadar, belirli API yanıtı geldi) bağlamak hem hızlı hem güvenilirdir. headless kipinin bekleme ile ilgisi yoktur.'
      },
      {
        t: 'mc',
        id: 'web-scraping-y2',
        stage: 'Isınma',
        q: 'Kaydedilen <code>storage_state</code> dosyası (oturum.json) için doğru yaklaşım hangisi?',
        o: [
          'Ekip arkadaşları da kullansın diye depoya commit etmek',
          'Parola gibi korumak: .gitignore\'a ekleyip süresi dolunca yenilemek',
          'Her çalıştırmadan sonra ekibe e-postayla yedeğini göndermek',
          'İçindeki çerezleri kopyalayıp betiğin koduna sabit yazmak'
        ],
        a: 1,
        why: 'Dosya oturum çerezlerini içerir; ele geçiren kişi parolaya gerek duymadan hesaba girer. Parola gibi korunmalı, depoya girmemeli ve oturum süresi dolunca yeniden üretilmelidir.'
      },
      {
        t: 'predict',
        id: 'web-scraping-y3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        o: ['[\'AM-1\'] 3', '[\'AM-1\'] 2', '[\'AM-1\', \'AM-2\'] 3', '[] 3'],
        a: 0,
        code: 'from bs4 import BeautifulSoup\nhtml = """<table id="s"><tr><th>No</th><th>Tutar</th></tr>\n<tr data-durum="kargoda"><td>AM-1</td><td>1.250,50 TL</td></tr>\n<tr data-durum="iptal"><td>AM-2</td><td>80,00 TL</td></tr></table>"""\nsoup = BeautifulSoup(html, "html.parser")\nprint([tr.td.text for tr in soup.select("tr[data-durum=\'kargoda\']")], len(soup.select("tr")))\n',
        why: 'Öznitelik seçici [data-durum=\'kargoda\'] yalnız ilk veri satırını seçer; tr.td o satırdaki ilk hücredir. Başlık satırı da bir tr olduğu için toplam 3 satır vardır.'
      },
      {
        t: 'order',
        id: 'web-scraping-y4',
        stage: 'Kodu oku',
        q: '<p>Yakalanan API yanıtından teslim edilen siparişlerin toplamını hesaplayan programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">2 1330.5</pre>',
        lines: [
          'import json',
          'yanit = \'{"items": [{"no": "AM-1", "durum": "teslim", "tutar": 1250.5}, {"no": "AM-2", "durum": "iptal", "tutar": 80}, {"no": "AM-3", "durum": "teslim", "tutar": 80}]}\'',
          'veri = json.loads(yanit)',
          'teslim = [x for x in veri["items"] if x["durum"] == "teslim"]',
          'print(len(teslim), sum(x["tutar"] for x in teslim))'
        ],
        expect: '2 1330.5\n',
        hint: 'Metin önce JSON\'a çevrilmeli; süzme ondan sonra.',
        why: 'API yanıtında sayılar zaten sayıdır: "1.250,50 TL" gibi biçimlenmiş metni ayrıştırma derdi yoktur. Gizli API\'yi kullanmanın en büyük kazancı budur.'
      },
      {
        t: 'code',
        id: 'web-scraping-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Portaldan kazınan sipariş tablosunu ayrıştır: <code>tablo_oku(html)</code> yaz. Tablo <code>table#siparis</code>; ilk satır başlıktır (<code>th</code>). Her veri satırını başlık adlarını anahtar yapan sözlüğe çevir. <code>Tutar</code> sütunu <code>"1.250,50 TL"</code> biçiminde; float\'a çevir. Hücre metinlerini kırp. Hücre sayısı başlıkla tutmayan satırları atla.</p>',
        guide: [
          'soup.select_one("table#siparis") ile tabloyu, select("tr") ile satırları al.',
          'İlk satırın th metinlerinden başlık listesini kur.',
          'Diğer satırlarda td metinlerini get_text(strip=True) ile al; uzunluk tutmuyorsa geç.',
          'Tutar\'ı "TL", "." ve "," dönüşümüyle float yap; dict(zip(...)) ile sözlük kur.'
        ],
        example: 'from bs4 import BeautifulSoup\ns = BeautifulSoup("<ul><li> a </li><li>b</li></ul>", "html.parser")\nprint([li.get_text(strip=True) for li in s.select("li")])\nprint(float("2.040,75".replace(".", "").replace(",", ".")))\n',
        start: 'from bs4 import BeautifulSoup\n\ndef tablo_oku(html):\n    soup = BeautifulSoup(html, "html.parser")\n    satirlar = soup.select_one("table#siparis").select("tr")\n    basliklar = []\n    # TODO: başlıklar\n    kayitlar = []\n    # TODO: veri satırları ve Tutar dönüşümü\n    return kayitlar\n',
        sol: 'from bs4 import BeautifulSoup\n\ndef tablo_oku(html):\n    soup = BeautifulSoup(html, "html.parser")\n    satirlar = soup.select_one("table#siparis").select("tr")\n    basliklar = [th.get_text(strip=True) for th in satirlar[0].select("th")]\n    kayitlar = []\n    for tr in satirlar[1:]:\n        hucreler = [td.get_text(strip=True) for td in tr.select("td")]\n        if len(hucreler) != len(basliklar):\n            continue\n        k = dict(zip(basliklar, hucreler))\n        k["Tutar"] = float(k["Tutar"].replace("TL", "").strip().replace(".", "").replace(",", "."))\n        kayitlar.append(k)\n    return kayitlar\n',
        tests: 'H = """<html><body><table id="ozet"><tr><td>yok say</td></tr></table>\n<table id="siparis">\n<tr><th>No</th><th>Şehir</th><th>Tutar</th></tr>\n<tr><td> AM-101 </td><td>İzmir</td><td>1.250,50 TL</td></tr>\n<tr><td>AM-102</td><td>Ankara</td><td>80,00 TL</td></tr>\n<tr><td colspan="3">Toplam: 1.330,50 TL</td></tr>\n<tr><td>AM-103</td><td>Bursa</td><td>12.040,00 TL</td></tr>\n</table></body></html>"""\nk = tablo_oku(H)\nassert len(k) == 3, f"Toplam satırı atlanmalı, 3 kayıt beklenir: {len(k)}"\nassert k[0] == {"No": "AM-101", "Şehir": "İzmir", "Tutar": 1250.5}, f"İlk kayıt: {k[0]}"\nassert k[2]["Tutar"] == 12040.0, "Binlik ayırıcı nokta kaldırılmalı"\n',
        hints: [
          'Başlık ve hücre sayısını karşılaştırarak özet/toplam satırlarını ele.',
          'Türkçe sayı: önce binlik noktaları sil, sonra virgülü noktaya çevir.',
          'k["Tutar"] = float(k["Tutar"].replace("TL", "").strip().replace(".", "").replace(",", "."))'
        ],
        why: 'Başlıkları HTML\'den okumak, sütun sırası değişse bile kodu çalışır tutar. Toplam satırı gibi yapısı farklı satırları hücre sayısıyla elemek de kazıyıcıyı sağlamlaştırır.'
      },
      {
        t: 'code',
        id: 'web-scraping-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Oturum dosyası hâlâ geçerli mi? <code>oturum_gecerli(durum_json, alan, simdi, pay_sn=300)</code> yaz. <code>durum_json</code> Playwright\'ın <code>storage_state</code> metnidir: <code>{"cookies": [{"name", "domain", "expires", ...}], "origins": [...]}</code>. <code>alan</code> için (çerezin <code>domain</code>\'i alanla aynıysa ya da <code>"." + alan</code> ise, ya da alan çerez alanının alt alanıysa) <code>name</code>\'i <code>"oturum"</code> olan çerezi bul. Çerez yoksa <code>False</code>; <code>expires</code> <code>-1</code> ise (tarayıcı oturumu) <code>False</code> (betik yeni süreçte açılınca geçersizdir); aksi hâlde <code>expires</code> <code>simdi + pay_sn</code>\'den büyükse <code>True</code>.</p>',
        start: 'import json\n\ndef oturum_gecerli(durum_json, alan, simdi, pay_sn=300):\n    pass\n',
        sol: 'import json\n\ndef oturum_gecerli(durum_json, alan, simdi, pay_sn=300):\n    durum = json.loads(durum_json)\n    for c in durum.get("cookies", []):\n        d = c.get("domain", "").lstrip(".")\n        if c.get("name") == "oturum" and (alan == d or alan.endswith("." + d)):\n            if c.get("expires", -1) == -1:\n                return False\n            return c["expires"] > simdi + pay_sn\n    return False\n',
        tests: 'import json\nS = 1_730_000_000\nd = json.dumps({"cookies": [\n    {"name": "dil", "domain": "portal.example.com", "expires": S + 99999},\n    {"name": "oturum", "domain": ".example.com", "expires": S + 3600},\n    {"name": "oturum", "domain": "baska.com", "expires": -1}], "origins": []})\nassert oturum_gecerli(d, "portal.example.com", S), "Üst alan çerezi (.example.com) alt alanda geçerli, 1 saat var"\nassert not oturum_gecerli(d, "portal.example.com", S + 3500), "5 dakikalık paydan az kaldıysa yenile"\nassert not oturum_gecerli(d, "baska.com", S), "Tarayıcı oturumu çerezi (-1) yeni süreçte geçersiz"\nassert not oturum_gecerli(d, "evilexample.com", S), "evilexample.com, example.com\'un alt alanı değildir"\nassert not oturum_gecerli(json.dumps({"cookies": []}), "portal.example.com", S), "Çerez yoksa False"\n',
        hints: [
          'Çerez alanındaki baştaki noktayı lstrip(".") ile at.',
          'Alt alan kontrolü: alan == d or alan.endswith("." + d); yalnız endswith(d) evilexample.com\'u da kabul eder.',
          'Süre kontrolüne güvenlik payı ekle: işin ortasında oturum düşmesin.'
        ],
        why: 'Oturumu işin başında denetleyip yenilemek, iş yarıdayken giriş sayfasına yönlendirilip yanlış HTML kazımayı önler. Alan eşleştirmede nokta sınırına dikkat etmek ise tarayıcıların çerez kuralının aynısıdır.'
      },
      {
        t: 'code',
        id: 'web-scraping-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Ağ trafiğinden gizli API\'yi bul: <code>api_adaylari(kayitlar)</code> yaz. <code>kayitlar</code> HAR benzeri sözlükler: <code>{"url", "method", "status", "content_type", "size"}</code>. JSON döndüren (<code>content_type</code> <code>application/json</code> ile başlayan), başarılı (200-299), <code>GET</code> isteklerini seç; sorgu parametreleri hariç yolu (<code>scheme://host/path</code>) anahtar yap ve aynı yoldan gelenleri birleştir. <code>(yol, cagri_sayisi, toplam_boyut)</code> listesini toplam boyuta göre azalan döndür.</p>',
        start: 'from urllib.parse import urlsplit\n\ndef api_adaylari(kayitlar):\n    pass\n',
        sol: 'from urllib.parse import urlsplit\n\ndef api_adaylari(kayitlar):\n    ozet = {}\n    for k in kayitlar:\n        if k["method"] != "GET" or not (200 <= k["status"] < 300):\n            continue\n        if not k.get("content_type", "").startswith("application/json"):\n            continue\n        p = urlsplit(k["url"])\n        yol = f"{p.scheme}://{p.netloc}{p.path}"\n        say, boyut = ozet.get(yol, (0, 0))\n        ozet[yol] = (say + 1, boyut + k["size"])\n    return sorted(((y, s, b) for y, (s, b) in ozet.items()), key=lambda t: -t[2])\n',
        tests: 'K = [\n {"url": "https://p.example.com/app.js", "method": "GET", "status": 200, "content_type": "application/javascript", "size": 90000},\n {"url": "https://p.example.com/api/v1/siparisler?sayfa=1", "method": "GET", "status": 200, "content_type": "application/json; charset=utf-8", "size": 4200},\n {"url": "https://p.example.com/api/v1/siparisler?sayfa=2", "method": "GET", "status": 200, "content_type": "application/json", "size": 3900},\n {"url": "https://p.example.com/api/v1/ozet", "method": "GET", "status": 200, "content_type": "application/json", "size": 600},\n {"url": "https://p.example.com/api/v1/izleme", "method": "POST", "status": 204, "content_type": "application/json", "size": 0},\n {"url": "https://p.example.com/api/v1/kampanya", "method": "GET", "status": 404, "content_type": "application/json", "size": 50}]\nassert api_adaylari(K) == [("https://p.example.com/api/v1/siparisler", 2, 8100), ("https://p.example.com/api/v1/ozet", 1, 600)], f"Gelen: {api_adaylari(K)}"\nassert api_adaylari([]) == [], "Boş trafik"\n',
        hints: ['Üç süzgeç: GET, 2xx, JSON içerik türü (charset eki olabilir: startswith).', 'urlsplit ile query\'yi at: scheme + netloc + path.', 'Sözlükte (sayı, boyut) biriktir, sonra boyuta göre azalan sırala.'],
        why: 'Sayfalanan bir listede aynı uç nokta farklı parametrelerle defalarca çağrılır; yola göre gruplayınca asıl veri kaynağı en büyük toplamla öne çıkar. Bu, Ağ sekmesinde elle yaptığın keşfin otomatik hâlidir.'
      },
      {
        t: 'code',
        id: 'web-scraping-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>urunleri_oku(html)</code> her ürün kartından <code>(ad, fiyat)</code> çifti çıkarmalı; fiyatı olmayan (stokta yok) kartta fiyat <code>None</code> olmalı. Kod ilk fiyatsız kartta <code>AttributeError</code> veriyor; ayrıca <code>class</code> yerine <code>class_</code> kullanılması gereken yerde yanlış parametre var.</p>',
        start: 'from bs4 import BeautifulSoup\n\ndef urunleri_oku(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = []\n    for kart in soup.find_all("div", {"class": "kart"}):\n        ad = kart.find("h3").text.strip()\n        fiyat = kart.find("span", cls="fiyat").text\n        sonuc.append((ad, float(fiyat.replace(",", "."))))\n    return sonuc\n',
        sol: 'from bs4 import BeautifulSoup\n\ndef urunleri_oku(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = []\n    for kart in soup.find_all("div", class_="kart"):\n        ad = kart.find("h3").get_text(strip=True)\n        f = kart.find("span", class_="fiyat")\n        sonuc.append((ad, float(f.get_text(strip=True).replace(",", ".")) if f else None))\n    return sonuc\n',
        tests: 'H = """<div class="kart"><h3> Yoga Matı </h3><span class="eski">499,00</span><span class="fiyat">399,90</span></div>\n<div class="kart tukendi"><h3>Kamp Çadırı</h3><span class="etiket">Stokta yok</span></div>\n<div class="kart"><h3>Termos</h3><span class="fiyat"> 459,00 </span></div>"""\nassert urunleri_oku(H) == [("Yoga Matı", 399.9), ("Kamp Çadırı", None), ("Termos", 459.0)], f"Gelen: {urunleri_oku(H)}"\n',
        hints: [
          'cls diye bir parametre yok; BeautifulSoup bunu "cls" adlı öznitelik arar ve ilk span\'ı bile bulamaz.',
          'find bulamazsa None döner; .text çağırmadan önce denetle.',
          'f = kart.find("span", class_="fiyat"); ... if f else None'
        ],
        why: 'class_ BeautifulSoup\'un class özniteliği için ayrılmış adıdır; başka adlar öznitelik adı sayılır. find\'ın None döndürmesi ise kazımada en sık çöküş nedenidir: eksik alan normal bir durumdur ve koda yansıtılmalıdır.'
      },
      {
        t: 'code',
        id: 'web-scraping-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Cursor tabanlı sayfalamayı yakalanan JSON üzerinde yürüt: <code>tumunu_cek(getir, sinir=100)</code> yaz. <code>getir(cursor)</code> bir sayfa döndürür: <code>{"items": [...], "next_cursor": str | None}</code>; ilk çağrı <code>cursor=None</code> ile. Tüm öğeleri sırayla topla, <code>id</code>\'si daha önce görülen öğeyi tekrar ekleme (sayfalar örtüşebilir). <code>next_cursor</code> <code>None</code> olunca dur. Aynı cursor ikinci kez gelirse (sonsuz döngü) ya da <code>sinir</code> sayfa aşılırsa <code>RuntimeError</code> fırlat.</p>',
        start: 'def tumunu_cek(getir, sinir=100):\n    return []\n',
        sol: 'def tumunu_cek(getir, sinir=100):\n    ogeler, gorulen_id, gorulen_cursor = [], set(), set()\n    cursor, sayfa = None, 0\n    while True:\n        sayfa += 1\n        if sayfa > sinir:\n            raise RuntimeError("sayfa sınırı aşıldı")\n        yanit = getir(cursor)\n        for o in yanit["items"]:\n            if o["id"] not in gorulen_id:\n                gorulen_id.add(o["id"])\n                ogeler.append(o)\n        cursor = yanit.get("next_cursor")\n        if cursor is None:\n            return ogeler\n        if cursor in gorulen_cursor:\n            raise RuntimeError("cursor tekrarlandı")\n        gorulen_cursor.add(cursor)\n',
        tests: 'SAYFALAR = {None: {"items": [{"id": 1}, {"id": 2}], "next_cursor": "c2"},\n            "c2": {"items": [{"id": 2}, {"id": 3}], "next_cursor": "c3"},\n            "c3": {"items": [{"id": 4}], "next_cursor": None}}\ncagrilar = []\ndef getir(c):\n    cagrilar.append(c)\n    return SAYFALAR[c]\nassert [o["id"] for o in tumunu_cek(getir)] == [1, 2, 3, 4], "Örtüşen id 2 bir kez eklenmeli"\nassert cagrilar == [None, "c2", "c3"], f"Üç sayfa çağrılmalı: {cagrilar}"\nDONGU = {None: {"items": [], "next_cursor": "a"}, "a": {"items": [{"id": 1}], "next_cursor": "b"}, "b": {"items": [], "next_cursor": "a"}}\ntry:\n    tumunu_cek(lambda c: DONGU[c])\n    assert False, "Tekrarlanan cursor RuntimeError vermeli"\nexcept RuntimeError:\n    pass\ntry:\n    tumunu_cek(lambda c: {"items": [], "next_cursor": str(int(c or 0) + 1)}, sinir=5)\n    assert False, "Sınır aşımı RuntimeError vermeli"\nexcept RuntimeError:\n    pass\n',
        hints: [
          'Üç küme/sayaç tut: görülen id\'ler, görülen cursor\'lar, sayfa sayısı.',
          'Döngü koşulunu next_cursor None olana kadar sürdür; her turda önce sınırı denetle.',
          'Tekrarlanan cursor sonsuz döngünün işaretidir; sessizce durmak yerine hata fırlat.'
        ],
        why: 'Gerçek API\'lerde sayfalar arası örtüşme (yeni kayıt eklenince kayma) ve hatalı cursor döngüleri olur. Tekilleştirme ve iki koruyucu (cursor tekrar kontrolü, sayfa sınırı), gece çalışan bir kazıyıcının sonsuza kadar asılı kalmasını önler.'
      }
    ],
    faq: [
      {
        q: 'Playwright mı, Selenium mu?',
        a: 'Yeni projelerde Playwright: otomatik bekleme, ağ yakalama, oturum dosyası, paralel bağlamlar ve codegen hazır gelir; kurulum tek komuttur. Selenium daha eski ve yaygındır, çok farklı tarayıcı ve dil desteği gereken kurumsal test altyapılarında hâlâ sık görülür.'
      }
    ]
  }
);
})(window);
