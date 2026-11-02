/* PythonPatika — 'web-guvenlik' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'web-guvenlik',
    min: 30,
    html: `<p>Derste OWASP haritasını, enjeksiyonu, XSS'i ve parola saklamayı gördün; güvenlik başlıklarına ve SSRF'ye yalnız adıyla değindik. Bu bölüm dört konuyu uygulamaya döküyor: tarayıcıya "nasıl davran" diyen <b>güvenlik başlıkları</b>, sunucunu saldırganın vekiline çeviren <b>SSRF</b>, oturum çerezinin çalınmadan ele geçirildiği <b>oturum sabitleme</b> ve bağımlılık taramasının CI'a bağlanması.</p>
<h2>Güvenlik başlıkları</h2>
<p>Her HTTP yanıtına eklenen birkaç başlık, kodda bir hata olsa bile saldırının etkisini sınırlar (derinlemesine savunma).</p>
<div class="tbl-wrap"><table><tr><th>Başlık</th><th>Örnek değer</th><th>Neyi önler?</th></tr>
<tr><td><code>Content-Security-Policy</code></td><td><code>default-src 'self'; script-src 'self'; frame-ancestors 'none'</code></td><td>XSS: yalnız izinli kaynaklardan betik çalışır, satır içi betik engellenir</td></tr>
<tr><td><code>Strict-Transport-Security</code></td><td><code>max-age=31536000; includeSubDomains</code></td><td>HTTPS'ten HTTP'ye düşürme (SSL stripping)</td></tr>
<tr><td><code>X-Frame-Options</code></td><td><code>DENY</code></td><td>Tıklama hırsızlığı (clickjacking): sayfanın başka sitede iframe içinde açılması</td></tr>
<tr><td><code>X-Content-Type-Options</code></td><td><code>nosniff</code></td><td>Tarayıcının dosya türünü tahmin edip metni betik olarak çalıştırması</td></tr>
<tr><td><code>Referrer-Policy</code></td><td><code>strict-origin-when-cross-origin</code></td><td>URL'deki token ve parametrelerin başka sitelere sızması</td></tr>
<tr><td><code>Set-Cookie</code> bayrakları</td><td><code>Secure; HttpOnly; SameSite=Lax</code></td><td>Çerezin HTTP'den gitmesi, JavaScript ile okunması, CSRF</td></tr></table></div>
<pre class="code"># Flask: her yanıta başlık ekleyen kanca
@app.after_request
def guvenlik_basliklari(yanit):
    yanit.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
    yanit.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    yanit.headers["X-Content-Type-Options"] = "nosniff"
    yanit.headers["X-Frame-Options"] = "DENY"
    yanit.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return yanit
# Django: SECURE_HSTS_SECONDS, SECURE_CONTENT_TYPE_NOSNIFF, X_FRAME_OPTIONS ayarları; CSP için django-csp</pre>
<p>CSP'yi doğrudan zorlamak eski sayfaları bozabilir; önce <code>Content-Security-Policy-Report-Only</code> ile yalnız raporla, ihlalleri topla, sonra zorla. <code>'unsafe-inline'</code> ve <code>'unsafe-eval'</code> CSP'nin XSS korumasını büyük ölçüde boşa çıkarır. HSTS'i ilk kez açarken <code>max-age</code>'i küçük başlat; tarayıcı bu süre boyunca siteye HTTP ile hiç bağlanmaz.</p>
<h2>SSRF: sunucunu vekil yapmak</h2>
<p>Sunucu tarafı istek sahteciliği (Server-Side Request Forgery), kullanıcının verdiği bir URL'ye sunucunun istek atmasıyla ortaya çıkar: "ürün görselini şu adresten içe aktar", "webhook adresin", "PDF'e çevrilecek sayfa". Saldırgan dış adres yerine <code>http://169.254.169.254/</code> (bulut sağlayıcının meta veri servisi, geçici kimlik bilgileri burada), <code>http://localhost:6379</code> (Redis) ya da <code>http://10.0.0.5/admin</code> gibi yalnız iç ağdan erişilebilen adresleri verir. İstek senin sunucundan çıktığı için güvenlik duvarı onu içeriden sayar.</p>
<pre class="py">import ipaddress, socket
from urllib.parse import urlsplit

def guvenli_mi(url, cozumle=socket.gethostbyname):
    parca = urlsplit(url)
    if parca.scheme not in ("http", "https") or not parca.hostname:
        return False
    try:
        ip = ipaddress.ip_address(cozumle(parca.hostname))
    except (OSError, ValueError):
        return False
    return ip.is_global              # özel, döngü, bağlantı-yerel, ayrılmış adresler False

sahte_dns = {"cdn.anadolu.example": "93.184.216.34", "ic.example": "10.0.0.5"}.get
for u in ["https://cdn.anadolu.example/a.png", "http://169.254.169.254/latest/meta-data/",
          "http://ic.example/admin", "file:///etc/passwd", "http://127.0.0.1:6379/"]:
    print(guvenli_mi(u, lambda h: sahte_dns(h) or h), u)</pre>
<p>Kural listesi: yalnız <code>http/https</code>; adı DNS ile <b>çözüp IP'yi</b> denetle (ad kontrolü yetmez, <code>ic.example</code> iç IP'ye çözülebilir); mümkünse alan adı izin listesi kullan; yönlendirmeleri (redirect) kapat ya da her adımı yeniden denetle; denetlediğin IP'ye bağlan (DNS yeniden bağlama, DNS rebinding saldırısında ad ikinci sorguda başka IP'ye çözülür); yanıt boyutu ve süresi için sınır koy. Bulutta meta veri servisi için IMDSv2 gibi token zorunlu sürümleri aç.</p>
<h2>Oturum sabitleme (session fixation)</h2>
<p>Saldırgan önce siteden kendi oturum kimliğini alır, sonra kurbanın tarayıcısına bu kimliği yerleştirir (URL parametresi, alt alan adından çerez). Kurban giriş yaptığında sunucu <b>aynı kimliği</b> yetkili yapar; saldırgan da elindeki kimlikle kurbanın hesabına girer. Çare basittir: <b>yetki düzeyi değiştiğinde (giriş, yetki yükseltme) oturum kimliğini yenile</b>, eski kimliği geçersiz kıl; çıkışta oturumu sunucu tarafında sil. Django <code>login()</code> bunu kendiliğinden yapar (<code>cycle_key</code>); Flask'ta sunucu taraflı oturumda kimliği elle yenilemen gerekir. Ayrıca oturum kimliğini asla URL'de taşıma ve çerezlerde <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code> kullan.</p>
<h2>Bağımlılık taraması CI'da</h2>
<p><code>pip-audit</code> kurulu paketleri bilinen açık veritabanına (PyPI Advisory, OSV) karşı tarar. kalite-ci dersindeki iş akışına bir adım olarak eklenir; açık bulunursa iş kırmızı olur. Dependabot ya da Renovate, güncellemeleri otomatik PR olarak açar.</p>
<pre class="code">- name: Bağımlılık taraması
  run: |
    pip install pip-audit
    pip-audit -r requirements.txt --strict --desc</pre>
<div class="note"><b>Gerçek işte</b>Sızma testi (pentest) raporlarının ilk sayfasında çoğunlukla eksik güvenlik başlıkları ve çerez bayrakları yer alır; bunlar en ucuz düzeltmelerdir. SSRF ise bulut ortamlarında kimlik bilgisi sızıntısına yol açtığı için en pahalı bulgular arasındadır. Kod incelemesinde "kullanıcıdan gelen URL'ye istek atılıyor mu?" sorusu ayrı bir madde olmalı.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'web-guvenlik-y1',
        stage: 'Isınma',
        q: 'Sayfan saldırganın sitesinde görünmez bir <code>iframe</code> içinde açılıp kullanıcıya "Sil" düğmesine tıklatılıyor. Hangi başlık bunu doğrudan engeller?',
        o: [
          '<code>X-Content-Type-Options: nosniff</code> (tür tahmini)',
          '<code>X-Frame-Options: DENY</code>',
          '<code>Referrer-Policy: no-referrer</code> (adres sızıntısı)',
          '<code>Strict-Transport-Security: max-age=31536000</code>'
        ],
        a: 1,
        why: 'Tıklama hırsızlığı (clickjacking) sayfanın başka bir sitede çerçeve içinde gösterilmesine dayanır; X-Frame-Options: DENY ya da CSP frame-ancestors bunu yasaklar. nosniff tür tahminini, Referrer-Policy yönlendiren adres sızıntısını, HSTS ise HTTP\'ye düşürmeyi engeller.'
      },
      {
        t: 'mc',
        id: 'web-guvenlik-y2',
        stage: 'Isınma',
        q: 'Giriş fonksiyonun kullanıcıyı doğruladıktan sonra mevcut oturuma <code>kullanici_id</code> yazıyor, oturum kimliğini değiştirmiyor. Bu hangi saldırıya açıktır?',
        o: ['SQL enjeksiyonu', 'Oturum sabitleme (session fixation)', 'Sunucu tarafı istek sahteciliği (SSRF)', 'Dizin geçişi (path traversal)'],
        a: 1,
        why: 'Saldırgan önceden bildiği bir oturum kimliğini kurbana kabul ettirirse, kurban girişten sonra aynı kimlikle yetkili olur. Girişte kimliği yenilemek (Django\'da cycle_key) saldırganın elindeki kimliği değersiz kılar.'
      },
      {
        t: 'predict',
        id: 'web-guvenlik-y3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        o: ['True False False False', 'True False True False', 'True False False True', 'False False False False'],
        a: 0,
        code: 'import ipaddress\nfor a in ["8.8.8.8", "10.0.0.5", "169.254.169.254", "::ffff:127.0.0.1"]:\n    print(ipaddress.ip_address(a).is_global, end=" ")\n',
        why: 'Yalnız 8.8.8.8 genel internet adresidir. 10.x özel ağ, 169.254.169.254 bağlantı-yerel (bulut meta veri servisi), ::ffff:127.0.0.1 ise IPv6 kılığındaki 127.0.0.1\'dir. is_global, bu tuzakların hepsini False sayar; adres metniyle "127." öneki aramak ise sonuncuyu kaçırırdı.'
      },
      {
        t: 'predict',
        id: 'web-guvenlik-y4',
        stage: 'Kodu oku',
        q: 'URL ayrıştırma tuzakları: bu kod ne yazdırır?',
        o: ['evil.com\nevil.com\ngood.com', 'good.com\ngood.com\ngood.com', 'good.com\nevil.com\nGOOD.com', 'evil.com\ngood.com\ngood.com'],
        a: 0,
        code: 'from urllib.parse import urlsplit\nfor u in ["http://good.com@evil.com/", "http://evil.com#@good.com", "http://GOOD.com:8080/"]:\n    print(urlsplit(u).hostname)\n',
        why: '@ işaretinden önceki kısım kullanıcı bilgisidir; gerçek ana makine evil.com\'dur. # sonrası parça (fragment) olduğu için ikinci adres de evil.com\'a gider. hostname küçük harfe çevrilir ve portu ayırır. "good.com" in url gibi metin kontrolleri bu yüzden güvenli değildir.'
      },
      {
        t: 'code',
        id: 'web-guvenlik-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>baslik_denetle(basliklar)</code> yaz: yanıt başlıklarının sözlüğünü alıp (adlar büyük/küçük harf duyarsız) eksik ya da zayıf olanlar için mesaj listesi döndürsün, şu sırayla:</p><ul><li>CSP yoksa <code>"CSP yok"</code>; varsa ve <code>\'unsafe-inline\'</code> içeriyorsa <code>"CSP unsafe-inline"</code></li><li>HSTS yoksa <code>"HSTS yok"</code>; varsa ve <code>max-age</code> 15552000\'den (180 gün) küçükse <code>"HSTS kısa"</code></li><li><code>X-Content-Type-Options</code> değeri <code>nosniff</code> değilse <code>"nosniff yok"</code></li><li><code>X-Frame-Options</code> yoksa ve CSP\'de <code>frame-ancestors</code> da yoksa <code>"çerçeve koruması yok"</code></li></ul>',
        guide: [
          'Önce anahtarları küçük harfe çevirerek yeni bir sözlük kur.',
          'CSP ve HSTS için get ile değeri al, None ise "yok" mesajı ekle.',
          'HSTS max-age değerini re.search(r"max-age=(\\d+)") ile çek.',
          'Çerçeve kontrolünde iki başlığı birlikte değerlendir.'
        ],
        example: 'import re\nb = {"Cache-Control": "max-age=600, public"}\nk = {a.lower(): v for a, v in b.items()}\nprint(int(re.search(r"max-age=(\\d+)", k["cache-control"]).group(1)))\n',
        start: 'import re\n\ndef baslik_denetle(basliklar):\n    b = {}\n    # TODO: adları küçük harfe çevir\n    sorunlar = []\n    # TODO: CSP, HSTS, nosniff, çerçeve\n    return sorunlar\n',
        sol: 'import re\n\ndef baslik_denetle(basliklar):\n    b = {a.lower(): v for a, v in basliklar.items()}\n    sorunlar = []\n    csp = b.get("content-security-policy")\n    if csp is None:\n        sorunlar.append("CSP yok")\n    elif "\'unsafe-inline\'" in csp:\n        sorunlar.append("CSP unsafe-inline")\n    hsts = b.get("strict-transport-security")\n    if hsts is None:\n        sorunlar.append("HSTS yok")\n    else:\n        m = re.search(r"max-age=(\\d+)", hsts)\n        if not m or int(m.group(1)) < 15552000:\n            sorunlar.append("HSTS kısa")\n    if b.get("x-content-type-options", "").strip().lower() != "nosniff":\n        sorunlar.append("nosniff yok")\n    if "x-frame-options" not in b and "frame-ancestors" not in (csp or ""):\n        sorunlar.append("çerçeve koruması yok")\n    return sorunlar\n',
        tests: 'iyi = {"Content-Security-Policy": "default-src \'self\'; frame-ancestors \'none\'", "Strict-Transport-Security": "max-age=31536000; includeSubDomains", "X-Content-Type-Options": "nosniff"}\nassert baslik_denetle(iyi) == [], "frame-ancestors varsa X-Frame-Options gerekmez"\nassert baslik_denetle({}) == ["CSP yok", "HSTS yok", "nosniff yok", "çerçeve koruması yok"], "Boş yanıt dört sorun"\nzayif = {"content-security-policy": "script-src \'self\' \'unsafe-inline\'", "STRICT-TRANSPORT-SECURITY": "max-age=300", "x-content-type-options": "NOSNIFF", "X-Frame-Options": "DENY"}\nassert baslik_denetle(zayif) == ["CSP unsafe-inline", "HSTS kısa"], f"Büyük/küçük harf duyarsız olmalı: {baslik_denetle(zayif)}"\n',
        hints: ['HTTP başlık adları büyük/küçük harf duyarsızdır.', 'csp None olabilir; "frame-ancestors" in (csp or "") güvenli yazımdır.', 'max-age sayısını int\'e çevirip 15552000 ile karşılaştır.'],
        why: 'Bu, securityheaders.com ve ZAP gibi tarayıcıların yaptığı pasif kontrolün özüdür. Bir duman testine ekleyip her dağıtımdan sonra prod yanıtını denetlemek, birinin yanlışlıkla başlıkları kaldırmasını yakalar.'
      },
      {
        t: 'code',
        id: 'web-guvenlik-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>SSRF koruması: <code>url_guvenli(url, cozumle, izinli_alanlar=None)</code> yaz. <code>cozumle(ad)</code> bir IP metni döndüren DNS fonksiyonudur (testte sahte), hata verirse güvensiz say. Kurallar: şema <code>http</code> ya da <code>https</code>; ana makine adı olmalı; <code>izinli_alanlar</code> verilmişse ana makine bunlardan biri ya da bir alt alanı (<code>.cdn.example</code> ile biten) olmalı; çözülen IP <code>is_global</code> olmalı; IPv4 eşlemeli IPv6 adreslerde (<code>::ffff:</code>) içteki IPv4 denetlensin. <code>True</code>/<code>False</code> döndür.</p>',
        start: 'import ipaddress\nfrom urllib.parse import urlsplit\n\ndef url_guvenli(url, cozumle, izinli_alanlar=None):\n    pass\n',
        sol: 'import ipaddress\nfrom urllib.parse import urlsplit\n\ndef url_guvenli(url, cozumle, izinli_alanlar=None):\n    p = urlsplit(url)\n    if p.scheme not in ("http", "https") or not p.hostname:\n        return False\n    ad = p.hostname\n    if izinli_alanlar is not None and not any(ad == a or ad.endswith("." + a) for a in izinli_alanlar):\n        return False\n    try:\n        ip = ipaddress.ip_address(cozumle(ad))\n    except Exception:\n        return False\n    if getattr(ip, "ipv4_mapped", None):\n        ip = ip.ipv4_mapped\n    return ip.is_global\n',
        tests: 'DNS = {"cdn.anadolu.example": "93.184.216.34", "img.cdn.anadolu.example": "93.184.216.35",\n       "ic.example": "10.0.0.5", "kotu.example": "::ffff:169.254.169.254"}\ndef coz(ad):\n    if ad in DNS:\n        return DNS[ad]\n    ipaddress.ip_address(ad)\n    return ad\nassert url_guvenli("https://cdn.anadolu.example/a.png", coz), "Genel IP\'ye çözülen ad güvenli"\nassert not url_guvenli("http://169.254.169.254/latest/meta-data/", coz), "Meta veri servisi engellenmeli"\nassert not url_guvenli("http://ic.example/admin", coz), "Ad iç IP\'ye çözülüyorsa engellenmeli"\nassert not url_guvenli("http://kotu.example/", coz), "IPv4 eşlemeli IPv6 içindeki adres denetlenmeli"\nassert not url_guvenli("file:///etc/passwd", coz), "Yalnız http/https"\nassert not url_guvenli("http://yok.example/", coz), "Çözülemeyen ad güvensiz"\nassert not url_guvenli("http://cdn.anadolu.example@10.0.0.5/", coz), "@ öncesi kullanıcı bilgisidir; gerçek hedef 10.0.0.5"\nI = ["cdn.anadolu.example"]\nassert url_guvenli("https://img.cdn.anadolu.example/x", coz, I), "Alt alan izinli"\nassert not url_guvenli("https://cdn.anadolu.example.evil.com/x", lambda a: "93.184.216.36", I), "Önek benzerliği izin vermez"\n',
        hints: ['urlsplit(url).hostname kullanıcı bilgisini ve portu ayırır.', 'İzin listesi: ad == alan ya da ad.endswith("." + alan).', 'ip.ipv4_mapped None değilse onu denetle; is_global her şeyi kapsar.'],
        why: 'Ad yerine çözülen IP\'yi denetlemek ve IPv6 kılıklarını açmak SSRF filtrelerinin en sık atlanan iki adımıdır. Gerçek istemcide denetlenen IP\'ye bağlanmak ve yönlendirmeleri kapatmak da gerekir; aksi hâlde DNS yeniden bağlama ile filtre atlatılır.'
      },
      {
        t: 'code',
        id: 'web-guvenlik-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>OturumDeposu</code> sunucu taraflı oturumları tutuyor. <code>giris_yap(eski_kimlik, kullanici)</code> girişte oturumu yetkilendirip kullanılacak kimliği döndürmeli. Şu anki kod saldırganın önceden verdiği kimliği yetkili yapıyor (oturum sabitleme). Girişte yeni rastgele kimlik üret, eski oturumdaki veriyi (ör. sepet) yeni kimliğe taşı ve eski kimliği sil.</p>',
        start: 'import secrets\n\nclass OturumDeposu:\n    def __init__(self):\n        self.oturumlar = {}\n\n    def yeni(self):\n        k = secrets.token_urlsafe(16)\n        self.oturumlar[k] = {}\n        return k\n\n    def giris_yap(self, eski_kimlik, kullanici):\n        veri = self.oturumlar.setdefault(eski_kimlik, {})\n        veri["kullanici"] = kullanici\n        return eski_kimlik\n',
        sol: 'import secrets\n\nclass OturumDeposu:\n    def __init__(self):\n        self.oturumlar = {}\n\n    def yeni(self):\n        k = secrets.token_urlsafe(16)\n        self.oturumlar[k] = {}\n        return k\n\n    def giris_yap(self, eski_kimlik, kullanici):\n        veri = self.oturumlar.pop(eski_kimlik, {})\n        yeni = secrets.token_urlsafe(16)\n        self.oturumlar[yeni] = {**veri, "kullanici": kullanici}\n        return yeni\n',
        tests: 'd = OturumDeposu()\nsaldirgan = d.yeni()\nd.oturumlar[saldirgan]["sepet"] = [7]\nkimlik = d.giris_yap(saldirgan, "ece")\nassert kimlik != saldirgan, "Girişte oturum kimliği yenilenmeli"\nassert saldirgan not in d.oturumlar, "Eski (saldırganın bildiği) kimlik geçersiz olmalı"\nassert d.oturumlar[kimlik] == {"sepet": [7], "kullanici": "ece"}, "Sepet yeni oturuma taşınmalı"\nassert len(kimlik) >= 20, "Kimlik tahmin edilemez uzunlukta olmalı"\nk2 = d.giris_yap("hic-yok", "ali")\nassert d.oturumlar[k2] == {"kullanici": "ali"} and "hic-yok" not in d.oturumlar, "Bilinmeyen kimlik de yeni oturum açmalı"\n',
        hints: ['Sorun: girişten önce ve sonra kimlik aynı kalıyor.', 'pop ile eski veriyi al ve eski kaydı sil.', 'Yeni kimliği secrets.token_urlsafe ile üret, veriyi kopyalayıp kullanıcıyı ekle.'],
        why: 'Yetki düzeyi değiştiği an kimliği yenilemek, saldırganın önceden yerleştirdiği kimliği değersiz kılar. Django login() ve Spring Security bunu varsayılan olarak yapar; kendi oturum katmanını yazıyorsan bu senin sorumluluğundadır.'
      },
      {
        t: 'code',
        id: 'web-guvenlik-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>CSP değerlendiricisi: <code>csp_izinli(csp, tur, kaynak, sayfa_kokeni)</code> yaz. <code>csp</code> politika metni (yönergeler <code>;</code> ile ayrılır), <code>tur</code> <code>"script"</code>, <code>"img"</code> ya da <code>"style"</code>, <code>kaynak</code> tam URL ya da satır içi kod için <code>"inline"</code>. Kurallar: önce <code>&lt;tur&gt;-src</code> yönergesine bak, yoksa <code>default-src</code>\'a; ikisi de yoksa izinli. Kaynak ifadeleri: <code>\'none\'</code> (hiçbiri), <code>\'self\'</code> (kaynağın kökeni sayfa kökeniyle aynı: şema + ana makine + port), <code>\'unsafe-inline\'</code> (yalnız <code>"inline"</code>\'a izin), <code>https:</code> (her https adresi), <code>*.alan.com</code> (alt alanlar, kökün kendisi değil), tam köken <code>https://cdn.example.com</code>. <code>"inline"</code> yalnız <code>\'unsafe-inline\'</code> ile izinlidir.</p>',
        start: 'from urllib.parse import urlsplit\n\ndef csp_izinli(csp, tur, kaynak, sayfa_kokeni):\n    pass\n',
        sol: 'from urllib.parse import urlsplit\n\ndef _koken(url):\n    p = urlsplit(url)\n    port = p.port or {"http": 80, "https": 443}.get(p.scheme)\n    return (p.scheme, p.hostname, port)\n\ndef csp_izinli(csp, tur, kaynak, sayfa_kokeni):\n    yonergeler = {}\n    for parca in csp.split(";"):\n        kel = parca.split()\n        if kel:\n            yonergeler[kel[0].lower()] = kel[1:]\n    ifadeler = yonergeler.get(tur + "-src", yonergeler.get("default-src"))\n    if ifadeler is None:\n        return True\n    if kaynak == "inline":\n        return "\'unsafe-inline\'" in ifadeler\n    p = urlsplit(kaynak)\n    for ifade in ifadeler:\n        if ifade == "\'self\'" and _koken(kaynak) == _koken(sayfa_kokeni):\n            return True\n        if ifade == "https:" and p.scheme == "https":\n            return True\n        if ifade.startswith("*.") and p.hostname and p.hostname.endswith(ifade[1:]):\n            return True\n        if "://" in ifade and _koken(ifade) == _koken(kaynak):\n            return True\n    return False\n',
        tests: 'CSP = "default-src \'self\'; script-src \'self\' https://cdn.example.com *.anadolu.com; img-src https:; style-src \'self\' \'unsafe-inline\'; object-src \'none\'"\nS = "https://market.anadolu.com"\nassert csp_izinli(CSP, "script", "https://market.anadolu.com/app.js", S), "\'self\' aynı köken"\nassert csp_izinli(CSP, "script", "https://cdn.example.com/lib.js", S), "Tam köken eşleşmesi"\nassert csp_izinli(CSP, "script", "https://odeme.anadolu.com/x.js", S), "*.anadolu.com alt alanı"\nassert not csp_izinli(CSP, "script", "https://anadolu.com/x.js", S), "*. kökün kendisini kapsamaz"\nassert not csp_izinli(CSP, "script", "inline", S), "script-src unsafe-inline içermiyor"\nassert csp_izinli(CSP, "style", "inline", S), "style-src unsafe-inline içeriyor"\nassert csp_izinli(CSP, "img", "https://herhangi.net/a.png", S) and not csp_izinli(CSP, "img", "http://herhangi.net/a.png", S), "img-src https: yalnız https"\nassert not csp_izinli(CSP, "script", "http://cdn.example.com/lib.js", S), "Tam köken ifadesinde şema da eşleşmeli (http ≠ https)"\nassert not csp_izinli("default-src \'self\'", "script", "http://market.anadolu.com/app.js", S), "Şema farklıysa \'self\' değildir"\nassert csp_izinli("default-src \'self\'", "img", "https://market.anadolu.com:443/a.png", S), "Varsayılan port eşittir; default-src\'a düşülür"\nassert csp_izinli("", "script", "https://x.com/a.js", S), "Politika yoksa izinli"\n',
        hints: [
          'Politikayı {yönerge: [ifadeler]} sözlüğüne çevir; önce tur-src, yoksa default-src.',
          'Köken karşılaştırması için (şema, ana makine, port) demeti kur; port yoksa 80/443.',
          '\'none\' hiçbir koşulu sağlamadığı için kendiliğinden False verir.'
        ],
        why: 'Tarayıcı CSP\'yi tam olarak bu adımlarla uygular: önce özel yönerge, yoksa default-src. Politikayı yazmadan önce sayfanın yüklediği kaynakları bu şekilde denetlemek, Report-Only aşamasında çıkacak ihlalleri önceden görmeni sağlar.'
      }
    ],
    faq: [
      {
        q: 'CSP\'yi Nginx\'te mi uygulamalıyım, uygulamada mı?',
        a: 'Sabit başlıklar (HSTS, nosniff, X-Frame-Options) Nginx\'te tek yerde verilebilir. CSP ise sayfaya göre değişebilir ve nonce (her istekte üretilen rastgele değer) gerektirebilir; bu durumda uygulamada üretilir. İkisini birden yazarsan tarayıcı iki CSP\'yi de uygular ve en kısıtlayıcısı geçerli olur.'
      },
      {
        q: 'SSRF\'ye karşı ağ düzeyinde ne yapılabilir?',
        a: 'Dış URL çeken işi ayrı bir servis ya da konteynerde çalıştır ve bu servisin iç ağa, meta veri servisine çıkışını güvenlik grubu/ağ politikasıyla kapat. Uygulama kodundaki denetim ve ağ kuralı birlikte derinlemesine savunma oluşturur.'
      }
    ]
  }
);
})(window);
