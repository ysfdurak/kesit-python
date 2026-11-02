/* Kesit Python — v2/o4: HTTP ve REST API istemcisi (orta / Otomasyon ve Araçlar) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'http-api',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 50,
  title: 'HTTP ve REST API istemcisi: requests, httpx ve dayanıklı istekler',
  sum: 'HTTP isteğinin anatomisini, metotları ve durum kodlarını öğrenir; requests/httpx ile kimlik doğrulamalı, zaman aşımlı, sayfalı ve hız sınırına saygılı API istemcisi yazar, sahte taşıyıcıyla test edersin.',
  goals: [
    'Bir HTTP isteğinin metodunu, adresini, başlıklarını ve gövdesini; yanıtın durum kodunu yorumlayabilirim.',
    'requests ve httpx ile sorgu parametreli, JSON gövdeli, zaman aşımlı ve kimlik doğrulamalı istek atabilirim.',
    'Sayfalı API\'lerden tüm kayıtları toplayıp yanıtı şemaya göre doğrulayabilirim.',
    '429 ve 5xx hatalarında Retry-After ve üstel geri çekilmeyle güvenle yeniden deneyebilirim.',
    'API anahtarlarını ortam değişkeninde tutup günlüklerde maskeleyebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in sipariş sistemi kargo firmasının API'sinden teslimat durumlarını, Ilgaz Bank'ın ödeme API'sinden tahsilat sonuçlarını, merkez bankasının servisinden döviz kurlarını çeker. Modern yazılımda sistemler birbirleriyle çoğunlukla <b>HTTP</b> üzerinden konuşan <b>API</b>'lerle (Application Programming Interface) haberleşir. Bir API istemcisi yazmak kolaydır; <b>dayanıklı</b> bir istemci yazmak ise ayrı bir beceridir: ağ kopar, sunucu yavaşlar, hız sınırına takılırsın, beklenmedik JSON gelir. Bu derste ikisini de öğreneceksin.</p>
<p>Önceki derste HTML kazımayı gördün; API ise verinin makine için hazırlanmış, kurallı halidir. API varsa kazımaya gerek yoktur. Sunucu tarafını (FastAPI ile uç nokta yazmayı) ileri seviyedeki "API ve web" dersinde göreceksin; burada istemci tarafındayız.</p>

<h2>HTTP isteğinin anatomisi</h2>
<pre class="code">POST /v1/siparisler?kaynak=mobil HTTP/1.1          ← metot, yol, sorgu parametresi
Host: api.anadolumarket.example
Authorization: Bearer eyJhbGciOi...                 ← kimlik doğrulama başlığı
Content-Type: application/json                      ← gövdenin biçimi
Accept: application/json                            ← beklediğin yanıt biçimi

{"musteri_id": 1042, "urunler": [{"sku": "AM-101", "adet": 2}]}   ← gövde (body)</pre>
<p>Yanıt da benzer yapıdadır: bir <b>durum kodu</b> (status code), başlıklar ve gövde. REST tarzı API'lerde adres bir <b>kaynağı</b> (resource: siparişler, müşteriler), metot ise o kaynağa ne yapılacağını anlatır.</p>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Amaç</th><th>Gövde</th><th>Güvenli</th><th>Idempotent</th></tr>
<tr><td>GET</td><td>Kaynağı oku</td><td>Yok</td><td>Evet</td><td>Evet</td></tr>
<tr><td>POST</td><td>Yeni kaynak oluştur / işlem başlat</td><td>Var</td><td>Hayır</td><td>Hayır</td></tr>
<tr><td>PUT</td><td>Kaynağı tamamen değiştir</td><td>Var</td><td>Hayır</td><td>Evet</td></tr>
<tr><td>PATCH</td><td>Kaynağın bir kısmını güncelle</td><td>Var</td><td>Hayır</td><td>Genelde hayır</td></tr>
<tr><td>DELETE</td><td>Kaynağı sil</td><td>Genelde yok</td><td>Hayır</td><td>Evet</td></tr>
</table></div>
<p><b>Güvenli</b> (safe) metot sunucuda bir şey değiştirmez. <b>Idempotent</b> metodu aynı istekle bir kez de on kez de çağırsan sonuç aynıdır. Bu ayrım yeniden denemede hayati önem taşır: GET'i tekrar denemek zararsızdır, ama zaman aşımına uğrayan bir ödeme POST'unu körlemesine tekrarlarsan müşteriden iki kez para çekebilirsin.</p>

<h2>Durum kodları</h2>
<div class="tbl-wrap"><table>
<tr><th>Kod</th><th>Anlamı</th><th>İstemci ne yapmalı?</th></tr>
<tr><td>200 OK</td><td>Başarılı, gövdede veri var</td><td>JSON'u oku</td></tr>
<tr><td>201 Created</td><td>Kaynak oluşturuldu</td><td>Yeni kaynağın kimliğini ya da <code>Location</code> başlığını al</td></tr>
<tr><td>204 No Content</td><td>Başarılı, gövde yok</td><td><code>.json()</code> çağırma</td></tr>
<tr><td>301 / 302 / 304</td><td>Taşındı / geçici yönlendirme / değişmedi</td><td>Kütüphane yönlendirmeyi izler; 304'te önbelleği kullan</td></tr>
<tr><td>400 Bad Request</td><td>İstek hatalı (eksik alan, yanlış biçim)</td><td>Tekrar deneme; isteği düzelt</td></tr>
<tr><td>401 Unauthorized</td><td>Kimlik doğrulanamadı (anahtar yok/yanlış/süresi dolmuş)</td><td>Token'ı yenile ya da yapılandırmayı düzelt</td></tr>
<tr><td>403 Forbidden</td><td>Kim olduğun belli ama yetkin yok</td><td>Tekrar deneme; yetki iste</td></tr>
<tr><td>404 Not Found</td><td>Kaynak yok</td><td>Çoğu zaman "yok" olarak işle (None)</td></tr>
<tr><td>409 / 422</td><td>Çakışma / doğrulama hatası</td><td>Gövdedeki hata ayrıntısını kullanıcıya göster</td></tr>
<tr><td>429 Too Many Requests</td><td>Hız sınırı aşıldı</td><td><code>Retry-After</code> kadar bekle, sonra tekrar dene</td></tr>
<tr><td>500 / 502 / 503 / 504</td><td>Sunucu ya da ağ geçidi sorunu</td><td>Geri çekilerek sınırlı sayıda tekrar dene</td></tr>
</table></div>

<h2>requests ile istek atmak</h2>
<p><code>requests</code> Python'un en yaygın HTTP kütüphanesidir. Tarayıcı motorunda ağ olmadığı için bu kodu kendi bilgisayarında dene.</p>
<pre class="code">import os
import requests

TABAN = "https://api.anadolumarket.example/v1"
token = os.environ["ANADOLU_API_TOKEN"]          # anahtar kodda değil, ortamda

with requests.Session() as oturum:                # bağlantıyı yeniden kullanır, ortak başlık
    oturum.headers.update({"Authorization": f"Bearer {token}", "Accept": "application/json"})

    y = oturum.get(f"{TABAN}/siparisler", params={"sehir": "İzmir", "sayfa": 1}, timeout=10)
    y.raise_for_status()                          # 4xx/5xx → requests.HTTPError
    for s in y.json()["veri"]:
        print(s["id"], s["tutar"])

    yeni = oturum.post(f"{TABAN}/siparisler", json={"musteri_id": 1042, "tutar": 349.9}, timeout=(3, 10))
    print(yeni.status_code, yeni.headers.get("Location"))</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install requests httpx</code>. Gerçek bir API ile denemek için herkese açık test servisleri (ör. httpbin) kullanabilirsin. httpx tarayıcı motorunda da yüklü; ağ isteği atamaz ama birazdan göreceğin sahte taşıyıcıyla tam çalışır.</div>
<ul>
<li><code>params=</code> sorgu parametrelerini doğru kodlar (Türkçe karakter, boşluk, <code>&amp;</code>). Adresi f-string ile elle kurma.</li>
<li><code>json=</code> gövdeyi JSON'a çevirir ve <code>Content-Type</code> başlığını ekler; <code>data=</code> form gönderir.</li>
<li><code>timeout=</code> <b>her zaman</b> ver. Vermezsen istek sonsuza kadar bekleyebilir. <code>(3, 10)</code>: 3 sn bağlantı, 10 sn okuma.</li>
<li><code>Session</code> TCP bağlantısını yeniden kullanır; aynı sunucuya çok istek atıyorsan belirgin hızlanır.</li>
</ul>

<h2>httpx ve sahte taşıyıcıyla test</h2>
<p><code>httpx</code>, requests'e çok benzeyen modern bir kütüphanedir; ek olarak async desteği ve HTTP/2 sunar. En büyük test kolaylığı <code>MockTransport</code>'tur: istemci gerçek ağ yerine senin yazdığın bir fonksiyona istek gönderir. Böylece istemci kodun hiç değişmeden test edilir. Bu derste alıştırmaların çoğu bu yöntemi kullanıyor.</p>
<pre class="py">import httpx

def sahte_sunucu(istek: httpx.Request) -&gt; httpx.Response:
    if istek.headers.get("Authorization") != "Bearer gizli-123":
        return httpx.Response(401, json={"hata": "yetkisiz"})
    if istek.url.path == "/v1/siparisler/AM-7":
        return httpx.Response(200, json={"id": "AM-7", "durum": "kargoda"})
    return httpx.Response(404, json={"hata": "bulunamadı"})

istemci = httpx.Client(
    transport=httpx.MockTransport(sahte_sunucu),
    base_url="https://api.anadolumarket.example/v1",
    headers={"Authorization": "Bearer gizli-123"},
    timeout=5.0,
)
y = istemci.get("/siparisler/AM-7")
print(y.status_code, y.json())
y = istemci.get("/siparisler/AM-999")
print(y.status_code, y.is_success)
try:
    y.raise_for_status()
except httpx.HTTPStatusError as e:
    print("Hata:", e.response.status_code, e.request.url)</pre>

<h2>Sorgu parametreleri ve kimlik doğrulama</h2>
<p>Sorgu parametreleri adresin <code>?</code> sonrasındaki <code>anahtar=değer</code> çiftleridir. Özel karakterler yüzde kodlamasıyla (percent-encoding) yazılır; <code>urlencode</code> bunu senin yerine yapar.</p>
<pre class="py">from urllib.parse import urlencode
import base64

params = {"sehir": "İzmir", "q": "çay &amp; şeker", "sayfa": 2, "kategori": None}
temiz = {k: v for k, v in params.items() if v is not None}
print(urlencode(temiz))

kullanici, parola = "rapor_bot", "s3cr3t"
kod = base64.b64encode(f"{kullanici}:{parola}".encode()).decode()
print("Authorization: Basic", kod)</pre>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Nasıl gönderilir?</th><th>Not</th></tr>
<tr><td>API anahtarı</td><td><code>X-API-Key: abc123</code> başlığı (bazen <code>?api_key=</code>)</td><td>Başlık tercih edilir; adres günlüklere düşer</td></tr>
<tr><td>Bearer token</td><td><code>Authorization: Bearer &lt;token&gt;</code></td><td>OAuth2/JWT; süresi dolar, yenilenir</td></tr>
<tr><td>Basic</td><td><code>Authorization: Basic base64(kullanıcı:parola)</code></td><td>Base64 şifreleme değildir; yalnız HTTPS ile</td></tr>
<tr><td>OAuth2 client credentials</td><td>Önce token uç noktasından token alınır</td><td>Kurumsal servisler arası yaygın yöntem</td></tr>
</table></div>

<h2>Gizli anahtarlar: kodda değil, ortamda</h2>
<p>API anahtarını koda yazıp Git'e göndermek en sık ve en pahalı hatalardan biridir: depo bir kez paylaşıldığında anahtar sızmış sayılır ve iptal edilmesi gerekir. Anahtarlar <b>ortam değişkeninde</b> (environment variable) ya da bir gizli anahtar yöneticisinde (secret manager) tutulur. Yerelde <code>.env</code> dosyası kullanıyorsan onu <code>.gitignore</code>'a ekle.</p>
<pre class="py">import os

def token_al(ortam=os.environ):
    token = ortam.get("ANADOLU_API_TOKEN")
    if not token:
        raise RuntimeError("ANADOLU_API_TOKEN tanımlı değil; .env dosyanı ya da ortamını kontrol et")
    return token

def maskele(deger):
    return "****" + deger[-4:] if len(deger) &gt; 4 else "****"

try:
    token_al({})
except RuntimeError as e:
    print("Hata:", e)
t = token_al({"ANADOLU_API_TOKEN": "tok_live_8f3a91c2"})
print("Kullanılan token:", maskele(t))</pre>
<div class="warn"><b>Günlükte sır olmaz</b>İstek başlıklarını hata ayıklamak için yazdırırken <code>Authorization</code>, <code>X-API-Key</code>, <code>Cookie</code> değerlerini maskele. Günlük sistemleri çoğu zaman uygulamadan çok daha fazla kişinin erişimine açıktır.</div>

<h2>Sayfalama</h2>
<p>API'ler büyük listeleri parça parça verir. Üç yaygın biçim vardır ve istemcinin döngüsü buna göre kurulur:</p>
<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>İstek</th><th>Durma koşulu</th></tr>
<tr><td>Sayfa numarası</td><td><code>?sayfa=3&amp;boyut=100</code></td><td>Boş liste ya da <code>sayfa == toplam_sayfa</code></td></tr>
<tr><td>Offset/limit</td><td><code>?offset=200&amp;limit=100</code></td><td>Dönen kayıt sayısı &lt; limit</td></tr>
<tr><td>İmleç (cursor)</td><td><code>?imlec=eyJpZCI6...</code></td><td>Yanıttaki <code>sonraki_imlec</code> boş</td></tr>
<tr><td>Link başlığı</td><td>Yanıtta <code>Link: &lt;...&gt;; rel="next"</code></td><td><code>rel="next"</code> yok</td></tr>
</table></div>
<p>İmleç tabanlı sayfalama, veri arada değişse bile kayıt atlamaz ya da tekrarlamaz; büyük ve canlı veri için en sağlam yöntemdir. Her durumda bir <b>en fazla sayfa</b> sınırı koymak, hatalı bir API'nin istemcini sonsuz döngüye sokmasını önler.</p>

<h2>Hız sınırı ve üstel geri çekilme</h2>
<p>Çoğu API dakikada belli sayıda isteğe izin verir; aşarsan <b>429</b> döner ve çoğu zaman <code>Retry-After</code> başlığıyla kaç saniye beklemen gerektiğini söyler. Geçici sunucu hatalarında (502, 503, 504) ise <b>üstel geri çekilme</b> (exponential backoff) uygulanır: 1 sn, 2 sn, 4 sn, 8 sn… Çok sayıda istemci aynı anda tekrar denemesin diye bekleme süresine küçük bir rastgelelik (jitter) eklenir.</p>
<pre class="py">import random

def bekleme(deneme, retry_after=None, taban=1.0, tavan=30.0, rng=random.Random(0)):
    if retry_after is not None and str(retry_after).isdigit():
        return float(retry_after)
    ust = min(tavan, taban * 2 ** deneme)
    return round(rng.uniform(0, ust), 2)        # "full jitter"

for i in range(6):
    print(i, bekleme(i))
print("Retry-After ile:", bekleme(0, retry_after="7"))</pre>
<div class="steps-list"><ol>
<li>Yalnızca <b>geçici</b> hataları tekrar dene: zaman aşımı, bağlantı hatası, 408, 429, 502, 503, 504.</li>
<li>400, 401, 403, 404, 422 gibi istemci hatalarını tekrar deneme; aynı istek aynı sonucu verir.</li>
<li>Deneme sayısını sınırla (genelde 3–5) ve son denemeden sonra hatayı yukarı fırlat; sessizce <code>None</code> döndürme.</li>
<li>Idempotent olmayan istekleri (POST) yalnızca sunucu destekliyorsa bir <code>Idempotency-Key</code> başlığıyla tekrar dene.</li>
<li>Her denemeyi günlüğe yaz: hangi adres, hangi kod, ne kadar beklendi.</li>
</ol></div>

<h2>Hata yönetimi ve yanıt doğrulama</h2>
<div class="tbl-wrap"><table>
<tr><th>requests</th><th>httpx</th><th>Ne zaman?</th></tr>
<tr><td><code>requests.Timeout</code></td><td><code>httpx.TimeoutException</code></td><td>Süre doldu</td></tr>
<tr><td><code>requests.ConnectionError</code></td><td><code>httpx.ConnectError</code> (<code>TransportError</code>)</td><td>DNS, bağlantı reddi, ağ kopması</td></tr>
<tr><td><code>requests.HTTPError</code></td><td><code>httpx.HTTPStatusError</code></td><td><code>raise_for_status()</code> 4xx/5xx gördü</td></tr>
<tr><td><code>requests.RequestException</code></td><td><code>httpx.HTTPError</code></td><td>Hepsinin atası</td></tr>
</table></div>
<p>2xx almak verinin doğru olduğu anlamına gelmez. Dış sistemden gelen her yanıtı sınırda <b>doğrula</b>: beklenen alanlar var mı, tipleri doğru mu, değerler mantıklı mı? Küçük işlerde elle kontrol, büyük işlerde <code>pydantic</code> modelleri kullanılır. Doğrulanmamış veri sistemin içine sızarsa hata çok daha uzakta ve pahalı bir yerde ortaya çıkar.</p>

<div class="note"><b>Gerçek işte</b>Bir sağlık randevu sisteminde hastane bilgi sisteminin API'si yoğun saatlerde 503 döner. İyi bir entegrasyon her isteğe zaman aşımı koyar, 503 ve 429'da geri çekilerek en fazla 4 kez dener, randevu oluşturma POST'unu her randevu için üretilen sabit bir <code>Idempotency-Key</code> ile gönderir (tekrar denemede çift randevu oluşmaz), tüm token'ları günlükte maskeler ve sağlayıcı tamamen çöktüğünde kullanıcıya "kaydınız sıraya alındı" deyip işi kuyruğa bırakır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İstemciyi sınıfa sar</h3>
<p>Uygulamanın her yerinde <code>httpx.get</code> çağırmak yerine tek bir <code>KargoAPI</code> sınıfı yaz: taban adres, kimlik, zaman aşımı, yeniden deneme ve doğrulama bu sınıfta olsun; dışarıya <code>gonderi_durumu(takip_no)</code> gibi iş diliyle konuşan metotlar açsın. Testlerde sınıfa <code>MockTransport</code>'lu bir <code>httpx.Client</code> enjekte edersin.</p>
<h3>Devre kesici (circuit breaker)</h3>
<p>Karşı servis tamamen çöktüyse her isteği 4 kez denemek hem seni yavaşlatır hem onu daha çok yorar. Devre kesici, art arda belli sayıda hata görünce bir süre hiç istek atmadan hemen hata döner, sonra tek bir deneme isteğiyle servisin düzelip düzelmediğine bakar.</p>
<h3>Önbellek ve koşullu istek</h3>
<p>Sık değişmeyen veride (ürün kataloğu, il listesi) yanıtın <code>ETag</code> başlığını sakla, sonraki istekte <code>If-None-Match</code> gönder; değişmediyse sunucu gövdesiz 304 döner. Hem hız sınırını korursun hem bant genişliğini.</p>
<h3>Async istemci</h3>
<p>Yüzlerce bağımsız isteği sırayla atmak yavaştır. <code>httpx.AsyncClient</code> ve <code>asyncio.gather</code> ile eşzamanlı istek atabilirsin; ama eşzamanlılığı bir semafor ile sınırla ki hız sınırına çarpmayasın. Ayrıntıları ileri seviyedeki async dersinde göreceksin.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: 'Zaman aşımına uğrayan bir isteği, ek önlem almadan güvenle tekrar deneyebileceğin metot grubu hangisi?',
      o: ['POST ve PATCH', 'GET, PUT ve DELETE', 'Yalnızca POST', 'Hiçbiri; HTTP\'de tekrar deneme yapılmaz'], a: 1,
      why: 'GET, PUT ve DELETE idempotenttir: tekrar çağrılınca sunucudaki son durum değişmez. POST ve çoğu PATCH idempotent değildir; tekrar denemek çift kayıt ya da çift ödeme yaratabilir, bu yüzden Idempotency-Key gibi bir önlem gerekir.' },
    { t: 'mc', stage: 'Isınma',
      q: 'API geçerli token\'la geldiğin halde "bu raporu görme yetkin yok" diyor. Hangi durum kodunu beklersin?',
      o: ['401 Unauthorized', '404 Not Found', '403 Forbidden', '429 Too Many Requests'], a: 2,
      why: '401 kimliğin doğrulanamadığını (token yok ya da geçersiz) söyler; 403 ise kim olduğun bilindiği halde bu işleme yetkin olmadığını. İkisinde de tekrar denemek işe yaramaz.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Kargo API anahtarını ekip olarak paylaşacağınız bir projede nerede tutmalısın?',
      o: ['Ortam değişkeninde ya da gizli anahtar yöneticisinde', 'config.py içinde sabit olarak, depo zaten özel olduğu için', 'README dosyasında, yeni gelen herkes kolayca bulsun', 'Adresin sorgu parametresinde, her istekle birlikte'], a: 0,
      why: 'Kodda ya da depoda duran anahtar, depoya erişen herkese ve geçmişe sızar. Adres parametreleri günlüklere düşer. Doğru yer ortam değişkeni ya da secret manager; yerel .env dosyası da .gitignore\'da olmalı.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from urllib.parse import urlencode\nprint(urlencode({"sehir": "Van", "q": "çay & şeker", "sayfa": 2}))\n',
      o: ['sehir=Van&q=çay & şeker&sayfa=2', 'sehir=Van&q=%C3%A7ay+%26+%C5%9Feker&sayfa=2', 'sehir=Van&q=çay+%26+şeker&sayfa=2', 'sehir=Van&q=%C3%A7ay%20&%20%C5%9Feker&sayfa=2'], a: 1,
      why: 'urlencode boşluğu + yapar, & işaretini %26 olarak kodlar (yoksa yeni parametre sanılırdı) ve Türkçe harfleri UTF-8 baytlarının yüzde kodlamasına çevirir. Sayı otomatik metne döner.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import httpx\n\ndef isleyici(istek):\n    return httpx.Response(404, json={"hata": "yok"})\n\nwith httpx.Client(transport=httpx.MockTransport(isleyici)) as c:\n    y = c.get("https://api.example/musteri/7")\nprint(y.status_code, y.is_success, y.json()["hata"])\n',
      o: ['404 False yok', 'HTTPStatusError', '404 True yok', '200 True yok'], a: 0,
      why: 'httpx (requests gibi) 4xx/5xx yanıtlarında kendiliğinden hata fırlatmaz; yanıtı döndürür. Hata istersen raise_for_status() çağırmalısın. is_success yalnızca 2xx için True\'dur.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Üstel geri çekilme bekleme süreleri. Bu kod ne yazdırır?',
      code: 'taban, tavan = 1, 8\nprint([min(tavan, taban * 2 ** i) for i in range(6)])\n',
      o: ['[1, 2, 4, 8, 16, 32]', '[2, 4, 8, 8, 8, 8]', '[1, 2, 4, 8, 8, 8]', '[0, 1, 2, 4, 8, 8]'], a: 2,
      why: '2**0=1, 2**1=2, 2**2=4, 2**3=8; sonrası tavan ile 8\'de kalır. Tavan olmasa bekleme süreleri hızla dakikalara çıkar; üretimde bir de rastgelelik (jitter) eklenir.' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Sahte taşıyıcıyla çalışan httpx istemcisini kurup bir siparişi sorgulayan kodu sırala. Çıktı <code>AM-7 kargoda</code> olmalı.</p>',
      lines: ['import httpx', 'def isleyici(istek):', '    return httpx.Response(200, json={"id": istek.url.params["id"], "durum": "kargoda"})', 'istemci = httpx.Client(transport=httpx.MockTransport(isleyici), base_url="https://api.anadolumarket.example")', 'yanit = istemci.get("/siparis", params={"id": "AM-7"})', 'yanit.raise_for_status()', 'veri = yanit.json()', 'print(veri["id"], veri["durum"])'],
      expect: 'AM-7 kargoda\n',
      hint: 'Önce içe aktarma, sonra sahte sunucu fonksiyonu, sonra istemci. JSON\'u okumadan önce durumu kontrol et.',
      why: 'İstemci sahte sunucu fonksiyonunu tanımak için onun önceden tanımlanmış olmasına ihtiyaç duyar. raise_for_status() ile hata kontrolü json() okumadan önce yapılır ki hata gövdesi veri sanılmasın.' },
    { t: 'code', stage: 'Rehberli', id: 'http-api-1', diff: 1,
      q: '<p><code>kod_yorumla(kod)</code> fonksiyonunu yaz: HTTP durum kodunu <code>(sinif, tekrar_dene)</code> demetine çevirsin. <code>sinif</code>: 1xx <code>"bilgi"</code>, 2xx <code>"başarılı"</code>, 3xx <code>"yönlendirme"</code>, 4xx <code>"istemci hatası"</code>, 5xx <code>"sunucu hatası"</code>. <code>tekrar_dene</code> yalnızca 408, 429, 500, 502, 503, 504 için <code>True</code>. 100–599 dışındaki kodlarda <code>ValueError</code>.</p>',
      guide: ['Aralık dışını en başta ValueError ile reddet.', 'Sınıfı bulmak için kod // 100 ile yüzler basamağını al.', 'Yüzler basamağını sınıf adına eşleyen bir sözlük kullan.', 'Tekrar denenebilir kodları bir kümede tut ve üyeliğe bak.'],
      example: '# Benzer teknik: puanı harf notuna çevirmek\nHARF = {10: "AA", 9: "AA", 8: "BA", 7: "BB", 6: "CB"}\ndef not_ver(puan):\n    if not 0 <= puan <= 100:\n        raise ValueError("puan 0-100 olmalı")\n    return HARF.get(puan // 10, "FF")\nprint(not_ver(87), not_ver(42))\n',
      start: 'TEKRAR = {408, 429, 500, 502, 503, 504}\n\ndef kod_yorumla(kod):\n    # TODO: 100-599 dışıysa ValueError\n    # TODO: kod // 100 ile sınıfı bul\n    # TODO: (sinif, kod in TEKRAR) döndür\n    pass\n',
      sol: 'TEKRAR = {408, 429, 500, 502, 503, 504}\nSINIF = {1: "bilgi", 2: "başarılı", 3: "yönlendirme", 4: "istemci hatası", 5: "sunucu hatası"}\n\ndef kod_yorumla(kod):\n    if not 100 <= kod <= 599:\n        raise ValueError(f"Geçersiz durum kodu: {kod}")\n    return (SINIF[kod // 100], kod in TEKRAR)\n',
      tests: 'assert kod_yorumla(200) == ("başarılı", False), "200 başarılıdır, tekrar gerekmez"\nassert kod_yorumla(204) == ("başarılı", False)\nassert kod_yorumla(304) == ("yönlendirme", False)\nassert kod_yorumla(404) == ("istemci hatası", False), "404 tekrar denenmez: kaynak yok"\nassert kod_yorumla(429) == ("istemci hatası", True), "429 hız sınırıdır, beklenip tekrar denenir"\nassert kod_yorumla(501) == ("sunucu hatası", False), "501 Not Implemented kalıcıdır"\nassert kod_yorumla(503) == ("sunucu hatası", True), "503 geçicidir"\nassert kod_yorumla(101)[0] == "bilgi"\nfor k in (99, 600, 0):\n    try:\n        kod_yorumla(k)\n        assert False, f"{k} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Yüzler basamağı sınıfı belirler.', 'SINIF = {1: "bilgi", 2: "başarılı", ...}; SINIF[kod // 100]', 'return (SINIF[kod // 100], kod in TEKRAR)'],
      why: 'Durum kodunun ilk basamağı sınıfı söyler, ama tekrar deneme kararı tek tek kodlara bağlıdır: 429 bir istemci hatası olduğu halde denenir, 501 sunucu hatası olduğu halde denenmez.' },
    { t: 'code', stage: 'Rehberli', id: 'http-api-2', diff: 2,
      q: '<p><code>istek_hazirla(taban, yol, params=None, token=None)</code> fonksiyonunu yaz ve <code>{"url": ..., "headers": {...}}</code> döndürsün. Kurallar: taban ile yol arasında <b>tek</b> <code>/</code> olsun (taban <code>/</code> ile bitse de yol <code>/</code> ile başlasa da); <code>params</code> içindeki <code>None</code> değerler atılsın, kalanlar <code>urlencode</code> ile <code>?</code> sonrasına eklensin (boşsa <code>?</code> olmasın); başlıklarda her zaman <code>"Accept": "application/json"</code> olsun; token verilmişse <code>"Authorization": "Bearer &lt;token&gt;"</code> eklensin.</p>',
      guide: ['Adresi taban.rstrip("/") + "/" + yol.lstrip("/") ile birleştir.', 'params\'tan None olmayanları sözlük kavramasıyla süz.', 'Süzülmüş sözlük boş değilse "?" + urlencode(...) ekle.', 'Başlık sözlüğünü Accept ile başlat; token varsa Authorization ekle.'],
      example: '# Benzer teknik: dosya yolu parçalarını tek eğik çizgiyle birleştirmek\ndef birlestir(*parcalar):\n    return "/".join(p.strip("/") for p in parcalar if p)\nprint(birlestir("veri/", "/2026/", "ekim.csv"))\n',
      start: 'from urllib.parse import urlencode\n\ndef istek_hazirla(taban, yol, params=None, token=None):\n    url = taban + yol  # TODO: tek eğik çizgi garanti et\n    # TODO: None değerli parametreleri at, urlencode ile ekle\n    headers = {}\n    # TODO: Accept ve (varsa) Authorization başlıkları\n    return {"url": url, "headers": headers}\n',
      sol: 'from urllib.parse import urlencode\n\ndef istek_hazirla(taban, yol, params=None, token=None):\n    url = taban.rstrip("/") + "/" + yol.lstrip("/")\n    temiz = {k: v for k, v in (params or {}).items() if v is not None}\n    if temiz:\n        url += "?" + urlencode(temiz)\n    headers = {"Accept": "application/json"}\n    if token:\n        headers["Authorization"] = f"Bearer {token}"\n    return {"url": url, "headers": headers}\n',
      tests: 'r = istek_hazirla("https://api.example/v1/", "/siparisler", {"sehir": "İzmir", "sayfa": 2, "durum": None}, "tok123")\nassert r["url"] == "https://api.example/v1/siparisler?sehir=%C4%B0zmir&sayfa=2", "tek eğik çizgi, None atılmış ve kodlanmış parametreler; bulunan: " + r["url"]\nassert r["headers"] == {"Accept": "application/json", "Authorization": "Bearer tok123"}, "Accept her zaman, Authorization Bearer biçiminde"\nr2 = istek_hazirla("https://api.example/v1", "musteriler/7")\nassert r2["url"] == "https://api.example/v1/musteriler/7", "eğik çizgi eksikse eklenmeli"\nassert "Authorization" not in r2["headers"], "token yoksa Authorization olmamalı"\nassert istek_hazirla("https://a.example", "x", {"y": None})["url"] == "https://a.example/x", "tüm parametreler None ise ? eklenmemeli"\n',
      hints: ['rstrip("/") ve lstrip("/") uçlardaki eğik çizgileri temizler.', '{k: v for k, v in (params or {}).items() if v is not None}', 'if temiz: url += "?" + urlencode(temiz)'],
      why: 'Adres birleştirmedeki çift ya da eksik eğik çizgi, 404\'lerin en sinsi nedenlerindendir. None parametreyi göndermek bazı API\'lerde "boş metin" diye yorumlanıp yanlış filtreye yol açar.' },
    { t: 'code', stage: 'Rehberli', id: 'http-api-3', diff: 2,
      q: '<p><code>musteri_getir(client, musteri_id)</code> fonksiyonunu yaz. <code>client</code> bir <code>httpx.Client</code>\'tır (testte sahte taşıyıcılı). <code>GET /musteriler/{musteri_id}</code> isteği atsın; 200\'de JSON sözlüğü döndürsün; 404\'te <code>None</code> döndürsün; diğer tüm hata kodlarında <code>raise_for_status()</code> ile <code>httpx.HTTPStatusError</code> fırlatsın.</p>',
      guide: ['client.get(f"/musteriler/{musteri_id}") ile isteği at.', 'Durum 404 ise None döndür.', 'Diğer durumlar için raise_for_status() çağır (2xx\'te bir şey yapmaz).', 'Son olarak yanit.json() döndür.'],
      example: '# Benzer teknik: sahte taşıyıcıyla ürün sorgusu\nimport httpx\ndef sunucu(istek):\n    return httpx.Response(200, json={"sku": istek.url.path.split("/")[-1], "stok": 4})\nc = httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.example")\nprint(c.get("/urunler/AM-5").json())\n',
      start: 'import httpx\n\ndef musteri_getir(client, musteri_id):\n    yanit = client.get(f"/musteriler/{musteri_id}")\n    # TODO: 404 ise None\n    # TODO: diğer hatalarda raise_for_status\n    # TODO: JSON döndür\n    pass\n',
      sol: 'import httpx\n\ndef musteri_getir(client, musteri_id):\n    yanit = client.get(f"/musteriler/{musteri_id}")\n    if yanit.status_code == 404:\n        return None\n    yanit.raise_for_status()\n    return yanit.json()\n',
      tests: 'import httpx\ndef sunucu(istek):\n    no = istek.url.path.rsplit("/", 1)[-1]\n    if no == "7":\n        return httpx.Response(200, json={"id": 7, "ad": "Ayşe"})\n    if no == "500":\n        return httpx.Response(500)\n    if no == "403":\n        return httpx.Response(403)\n    return httpx.Response(404)\nc = httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.ilgazbank.example")\nassert musteri_getir(c, 7) == {"id": 7, "ad": "Ayşe"}, "200\'de JSON sözlüğü dönmeli"\nassert musteri_getir(c, 99) is None, "404\'te None dönmeli"\nfor kod in (500, 403):\n    try:\n        musteri_getir(c, kod)\n        assert False, f"{kod} için HTTPStatusError bekleniyordu"\n    except httpx.HTTPStatusError:\n        pass\n',
      hints: ['yanit.status_code ile durumu kontrol et.', '404 kontrolü raise_for_status\'tan ÖNCE olmalı, yoksa 404 de hata fırlatır.', 'if yanit.status_code == 404: return None'],
      why: '404\'ü "kayıt yok" olarak işlemek iş mantığında doğaldır; ama 403 ya da 500\'ü None\'a çevirmek bir yetki ya da sunucu sorununu "müşteri yok" diye gizler. Bu yüzden yalnızca beklenen durum özel işlenir, gerisi hata olarak yükselir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'http-api-4', diff: 1,
      q: '<p><code>bekle_suresi(deneme, retry_after=None, taban=1.0, tavan=30.0)</code> fonksiyonunu yaz (deneme 0\'dan başlar). <code>retry_after</code> bir tam sayı ya da rakamlardan oluşan metinse (ör. <code>"7"</code>) o süreyi float olarak döndürsün, ama <code>tavan</code>\'ı aşmasın. Değilse (None ya da tarih metni gibi sayı olmayan bir değer) <code>min(tavan, taban * 2 ** deneme)</code> döndürsün. <code>deneme</code> negatifse <code>ValueError</code>.</p>',
      start: 'def bekle_suresi(deneme, retry_after=None, taban=1.0, tavan=30.0):\n    pass\n',
      sol: 'def bekle_suresi(deneme, retry_after=None, taban=1.0, tavan=30.0):\n    if deneme < 0:\n        raise ValueError("deneme negatif olamaz")\n    if retry_after is not None and str(retry_after).strip().isdigit():\n        return float(min(int(str(retry_after).strip()), tavan))\n    return float(min(tavan, taban * 2 ** deneme))\n',
      tests: 'assert bekle_suresi(0) == 1.0, "ilk deneme taban kadar beklemeli"\nassert bekle_suresi(3) == 8.0, "1 * 2**3 = 8"\nassert bekle_suresi(10) == 30.0, "tavan aşılmamalı"\nassert bekle_suresi(0, retry_after="7") == 7.0, "Retry-After metni sayı olarak kullanılmalı"\nassert bekle_suresi(5, retry_after=2) == 2.0, "Retry-After geri çekilmeden önceliklidir"\nassert bekle_suresi(0, retry_after="120") == 30.0, "Retry-After de tavanla sınırlanmalı"\nassert bekle_suresi(2, retry_after="Wed, 21 Oct 2026 07:28:00 GMT") == 4.0, "sayı olmayan Retry-After yok sayılmalı"\nassert bekle_suresi(1, taban=0.5) == 1.0\ntry:\n    bekle_suresi(-1)\n    assert False, "negatif deneme ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: ['Önce Retry-After\'ı kontrol et; str(x).isdigit() hem int hem metin için çalışır.', 'Retry-After yoksa üstel formül: taban * 2 ** deneme.', 'Her iki durumda da min(..., tavan) uygula.'],
      why: 'Sunucunun söylediği bekleme süresi her zaman tahmininden iyidir; ama bir hata yüzünden saatlerce beklememek için tavan şarttır. Retry-After HTTP tarihi de olabilir; desteklemiyorsan sessizce üstel geri çekilmeye düşmek güvenli bir varsayılandır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'http-api-5', diff: 2,
      q: '<p>İmleçli sayfalama. <code>tum_kayitlar(client, yol="/siparisler", limit=2, en_fazla_sayfa=50)</code> fonksiyonunu yaz. API her yanıtta <code>{"veri": [...], "sonraki_imlec": "..." ya da null}</code> döndürür. İlk istekte yalnızca <code>limit</code> parametresi gönder; sonrakilerde <code>limit</code> ve <code>imlec</code> gönder. Her yanıtta <code>raise_for_status()</code> çağır. <code>sonraki_imlec</code> boş olunca ya da <code>en_fazla_sayfa</code> isteğe ulaşınca dur; tüm kayıtları tek listede döndür.</p>',
      start: 'import httpx\n\ndef tum_kayitlar(client, yol="/siparisler", limit=2, en_fazla_sayfa=50):\n    pass\n',
      sol: 'import httpx\n\ndef tum_kayitlar(client, yol="/siparisler", limit=2, en_fazla_sayfa=50):\n    kayitlar = []\n    imlec = None\n    for _ in range(en_fazla_sayfa):\n        params = {"limit": limit}\n        if imlec:\n            params["imlec"] = imlec\n        yanit = client.get(yol, params=params)\n        yanit.raise_for_status()\n        govde = yanit.json()\n        kayitlar.extend(govde["veri"])\n        imlec = govde.get("sonraki_imlec")\n        if not imlec:\n            break\n    return kayitlar\n',
      tests: 'import httpx\nVERI = [{"id": i} for i in range(1, 6)]\nistekler = []\ndef sunucu(istek):\n    p = dict(istek.url.params)\n    istekler.append(p)\n    bas = int(p.get("imlec", "0"))\n    lim = int(p["limit"])\n    parca = VERI[bas:bas + lim]\n    sonraki = str(bas + lim) if bas + lim < len(VERI) else None\n    return httpx.Response(200, json={"veri": parca, "sonraki_imlec": sonraki})\nc = httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.example")\nk = tum_kayitlar(c)\nassert [x["id"] for x in k] == [1, 2, 3, 4, 5], "tüm sayfalar sırayla toplanmalı"\nassert istekler[0] == {"limit": "2"}, "ilk istekte imlec gönderilmemeli; giden: " + str(istekler[0])\nassert istekler[1] == {"limit": "2", "imlec": "2"}, "sonraki isteklerde imlec gönderilmeli"\nassert len(istekler) == 3, "5 kayıt / 2 = 3 istek"\nistekler.clear()\nassert len(tum_kayitlar(c, limit=1, en_fazla_sayfa=2)) == 2, "sayfa sınırına uyulmalı"\nassert len(istekler) == 2\ndef bozuk(istek):\n    return httpx.Response(500)\ntry:\n    tum_kayitlar(httpx.Client(transport=httpx.MockTransport(bozuk), base_url="https://api.example"))\n    assert False, "500 yanıtında HTTPStatusError bekleniyordu"\nexcept httpx.HTTPStatusError:\n    pass\n',
      hints: ['for _ in range(en_fazla_sayfa) sayfa sınırını kendiliğinden uygular.', 'params sözlüğünü her turda yeniden kur; imlec varsa ekle.', 'imlec = govde.get("sonraki_imlec"); boşsa break.'],
      why: 'İmleç, sunucunun "kaldığın yer" işaretidir; istemci onu yorumlamaz, olduğu gibi geri gönderir. Sayfa sınırı ise hatalı bir API\'nin hep aynı imleci döndürmesi gibi durumlarda sonsuz döngüyü engeller.' },
    { t: 'code', stage: 'Kendin yaz', id: 'http-api-6', diff: 2,
      q: '<p>Kargo API\'sinden gelen sipariş kaydını doğrula. <code>yanit_dogrula(veri)</code> hata mesajlarının listesini döndürsün (sorun yoksa <code>[]</code>). Kurallar ve mesajlar (bu sırayla denetle):</p><ul><li><code>id</code>: zorunlu, <code>int</code> (bool değil). Eksikse <code>"id eksik"</code>, türü yanlışsa <code>"id türü hatalı"</code>.</li><li><code>musteri</code>: zorunlu, boş olmayan <code>str</code>. Mesajlar <code>"musteri eksik"</code> / <code>"musteri türü hatalı"</code> (boş ya da yalnız boşluk da türü hatalı sayılır).</li><li><code>tutar</code>: zorunlu, <code>int</code> ya da <code>float</code> (bool değil). <code>"tutar eksik"</code> / <code>"tutar türü hatalı"</code>; sayıysa ve negatifse <code>"tutar negatif olamaz"</code>.</li><li><code>durum</code>: zorunlu, <code>"hazirlaniyor"</code>, <code>"kargoda"</code>, <code>"teslim"</code>\'den biri. Eksikse <code>"durum eksik"</code>, değilse <code>"durum geçersiz: &lt;değer&gt;"</code>.</li></ul><p><code>veri</code> sözlük değilse <code>["kayıt sözlük değil"]</code> döndür.</p>',
      start: 'def yanit_dogrula(veri):\n    pass\n',
      sol: 'DURUMLAR = {"hazirlaniyor", "kargoda", "teslim"}\n\ndef yanit_dogrula(veri):\n    if not isinstance(veri, dict):\n        return ["kayıt sözlük değil"]\n    hatalar = []\n    if "id" not in veri:\n        hatalar.append("id eksik")\n    elif not isinstance(veri["id"], int) or isinstance(veri["id"], bool):\n        hatalar.append("id türü hatalı")\n    if "musteri" not in veri:\n        hatalar.append("musteri eksik")\n    elif not isinstance(veri["musteri"], str) or not veri["musteri"].strip():\n        hatalar.append("musteri türü hatalı")\n    if "tutar" not in veri:\n        hatalar.append("tutar eksik")\n    elif not isinstance(veri["tutar"], (int, float)) or isinstance(veri["tutar"], bool):\n        hatalar.append("tutar türü hatalı")\n    elif veri["tutar"] < 0:\n        hatalar.append("tutar negatif olamaz")\n    if "durum" not in veri:\n        hatalar.append("durum eksik")\n    elif veri["durum"] not in DURUMLAR:\n        hatalar.append(f"durum geçersiz: {veri[\'durum\']}")\n    return hatalar\n',
      tests: 'iyi = {"id": 7, "musteri": "Ayşe", "tutar": 349.9, "durum": "kargoda"}\nassert yanit_dogrula(iyi) == [], "geçerli kayıtta hata olmamalı"\nassert yanit_dogrula({"id": True, "musteri": "  ", "tutar": "349,9", "durum": "kayip"}) == ["id türü hatalı", "musteri türü hatalı", "tutar türü hatalı", "durum geçersiz: kayip"], "bool id, boş müşteri, metin tutar ve geçersiz durum yakalanmalı"\nassert yanit_dogrula({"musteri": "Can", "tutar": -5}) == ["id eksik", "tutar negatif olamaz", "durum eksik"], "eksik alanlar ve negatif tutar"\nassert yanit_dogrula({"id": 1, "musteri": "A", "tutar": False, "durum": "teslim"}) == ["tutar türü hatalı"], "bool bir sayı gibi kabul edilmemeli"\nassert yanit_dogrula([1, 2]) == ["kayıt sözlük değil"]\nassert yanit_dogrula({"id": 2, "musteri": "B", "tutar": 0, "durum": "teslim"}) == [], "0 tutar geçerlidir"\n',
      hints: ['bool, int\'in alt sınıfıdır: isinstance(True, int) True verir; ayrıca bool olmadığını kontrol et.', 'Her alan için önce "var mı", sonra "türü doğru mu", sonra "değeri mantıklı mı" sırasıyla elif zinciri kur.', 'Tüm hataları topla; ilk hatada durma.'],
      why: 'Tüm hataları tek seferde raporlamak, karşı taraftaki ekibe düzeltilecek her şeyi bir kerede söyler. bool tuzağı gerçek hayatta sık görülür: JSON\'daki true değeri int kontrolünü geçer.' },
    { t: 'code', stage: 'Kendin yaz', id: 'http-api-7', diff: 2,
      q: '<p>Hata ayıklama günlüğü için <code>basliklari_maskele(basliklar)</code> fonksiyonunu yaz: başlık sözlüğünün <b>kopyasını</b> döndürsün (orijinal değişmesin). Adı büyük/küçük harf duyarsız olarak <code>authorization</code>, <code>x-api-key</code>, <code>cookie</code> olan başlıkların değerini maskele: değer bir şema ve boşlukla başlıyorsa (<code>"Bearer abc..."</code>, <code>"Basic ..."</code>) şemayı koru; gizli kısmın yalnızca son 4 karakteri görünsün: <code>"Bearer ****9f3a"</code>. Gizli kısım 4 karakter ya da daha kısaysa tamamen <code>"****"</code> olsun.</p>',
      start: 'def basliklari_maskele(basliklar):\n    pass\n',
      sol: 'GIZLI = {"authorization", "x-api-key", "cookie"}\n\ndef _maske(sir):\n    return "****" + sir[-4:] if len(sir) > 4 else "****"\n\ndef basliklari_maskele(basliklar):\n    sonuc = {}\n    for ad, deger in basliklar.items():\n        if ad.lower() in GIZLI:\n            parcalar = deger.split(" ", 1)\n            if len(parcalar) == 2:\n                deger = parcalar[0] + " " + _maske(parcalar[1])\n            else:\n                deger = _maske(deger)\n        sonuc[ad] = deger\n    return sonuc\n',
      tests: 'b = {"Authorization": "Bearer tok_live_8f3a91c29f3a", "X-API-Key": "abc", "Accept": "application/json", "cookie": "oturum=12345678"}\nm = basliklari_maskele(b)\nassert m["Authorization"] == "Bearer ****9f3a", "şema korunmalı, son 4 karakter görünmeli; bulunan: " + m["Authorization"]\nassert m["X-API-Key"] == "****", "4 ya da daha kısa sır tamamen maskelenmeli"\nassert m["Accept"] == "application/json", "gizli olmayan başlık değişmemeli"\nassert m["cookie"] == "****5678", "küçük harfli başlık adı da yakalanmalı"\nassert b["Authorization"].startswith("Bearer tok_live"), "orijinal sözlük değişmemeli"\nassert basliklari_maskele({}) == {}\n',
      hints: ['Başlık adlarını karşılaştırmadan önce lower() ile küçült.', 'deger.split(" ", 1) şema ve sırrı ayırır; tek parça gelirse şema yoktur.', 'Yeni bir sözlüğe yaz; orijinale dokunma.'],
      why: 'HTTP başlık adları büyük/küçük harf duyarsızdır; maskelemeyi tam ada göre yaparsan "authorization" yazımı sızar. Şemayı korumak hata ayıklamada hangi kimlik yönteminin kullanıldığını gösterir, sırrı göstermez.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'http-api-8', diff: 2,
      q: '<p><code>guvenli_get(client, yol, deneme=3, uyku=time.sleep)</code> şu kurala uymalı: 2xx → JSON döndür; 429 ve 5xx → <code>uyku(2 ** i)</code> ile bekleyip tekrar dene (son denemeden sonra <b>bekleme</b>); diğer 4xx → hemen <code>raise_for_status()</code> ile hata; tüm denemeler tükenirse son yanıtta <code>raise_for_status()</code> ile hata. Mevcut kod 404 gövdesini veri sanıyor, tükenince sessizce <code>None</code> döndürüyor ve son denemeden sonra da boşuna bekliyor. <b>Hataları bul ve düzelt.</b></p>',
      start: 'import time\nimport httpx\n\ndef guvenli_get(client, yol, deneme=3, uyku=time.sleep):\n    for i in range(deneme):\n        y = client.get(yol)\n        if y.status_code < 500:\n            return y.json()\n        uyku(2 ** i)\n',
      sol: 'import time\nimport httpx\n\ndef guvenli_get(client, yol, deneme=3, uyku=time.sleep):\n    for i in range(deneme):\n        y = client.get(yol)\n        if y.is_success:\n            return y.json()\n        if y.status_code != 429 and y.status_code < 500:\n            y.raise_for_status()\n        if i < deneme - 1:\n            uyku(2 ** i)\n    y.raise_for_status()\n',
      tests: 'import httpx\ndef istemci(kodlar):\n    sira = iter(kodlar)\n    def sunucu(istek):\n        k = next(sira)\n        return httpx.Response(k, json={"kod": k})\n    return httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.example")\nbeklemeler = []\nassert guvenli_get(istemci([503, 429, 200]), "/x", uyku=beklemeler.append) == {"kod": 200}, "503 ve 429 sonrası 200 gelince JSON dönmeli"\nassert beklemeler == [1, 2], "iki başarısız denemeden sonra 1 ve 2 sn beklenmeli"\nbeklemeler.clear()\ntry:\n    guvenli_get(istemci([404]), "/x", uyku=beklemeler.append)\n    assert False, "404 hemen HTTPStatusError fırlatmalı"\nexcept httpx.HTTPStatusError:\n    pass\nassert beklemeler == [], "404 için beklenmemeli"\ntry:\n    guvenli_get(istemci([500, 502, 503]), "/x", uyku=beklemeler.append)\n    assert False, "denemeler tükenince hata fırlatılmalı, None dönmemeli"\nexcept httpx.HTTPStatusError as e:\n    assert e.response.status_code == 503, "son yanıtın hatası fırlatılmalı"\nassert beklemeler == [1, 2], "son denemeden sonra beklenmemeli (3 deneme, 2 bekleme)"\n',
      hints: ['"< 500" koşulu 404 ve 429\'u da başarılı sayıyor.', 'Tekrar denenebilir mi? 429 ya da >= 500. Değilse ve başarısızsa raise_for_status().', 'Döngüden sonra y.raise_for_status() ekle; beklemeyi if i < deneme - 1 ile koru.'],
      why: 'Sessizce None döndüren bir istemci, hatayı çok uzakta (rapor boş geldiğinde) ortaya çıkarır. Yalnız geçici hataları tekrar denemek, son denemeden sonra beklememek ve sonunda hatayı yükseltmek dayanıklı istemcinin üç temel kuralıdır.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'http-api-9', diff: 1,
      q: '<p>Ürün arama fonksiyonu <code>"çay &amp; şeker"</code> gibi aramalarda yanlış sonuç veriyor: sunucu sorguyu <code>"çay "</code> olarak alıyor. Ayrıca kategori verilmediğinde adrese <code>kategori=None</code> metni gidiyor. <b>Hataları bul ve düzelt</b>: parametreleri doğru kodla, <code>None</code> olanı hiç gönderme.</p>',
      start: 'import httpx\n\ndef urun_ara(client, sorgu, kategori=None):\n    yanit = client.get(f"/urunler?q={sorgu}&kategori={kategori}")\n    yanit.raise_for_status()\n    return yanit.json()\n',
      sol: 'import httpx\n\ndef urun_ara(client, sorgu, kategori=None):\n    params = {"q": sorgu}\n    if kategori is not None:\n        params["kategori"] = kategori\n    yanit = client.get("/urunler", params=params)\n    yanit.raise_for_status()\n    return yanit.json()\n',
      tests: 'import httpx\ndef sunucu(istek):\n    return httpx.Response(200, json=dict(istek.url.params))\nc = httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.anadolumarket.example")\nassert urun_ara(c, "çay & şeker") == {"q": "çay & şeker"}, "sorgu bütün olarak gitmeli, kategori hiç gönderilmemeli; giden: " + str(urun_ara(c, "çay & şeker"))\nassert urun_ara(c, "kupa", "mutfak") == {"q": "kupa", "kategori": "mutfak"}\nassert urun_ara(c, "50% indirim") == {"q": "50% indirim"}, "yüzde işareti de doğru kodlanmalı"\n',
      hints: ['f-string ile adres kurmak & ve % gibi karakterleri kodlamaz.', 'httpx\'te client.get(yol, params={...}) parametreleri doğru kodlar.', 'kategori None ise sözlüğe hiç ekleme.'],
      why: '& sorgu parametrelerini ayıran karakterdir; kodlanmazsa "şeker" yeni ve adsız bir parametreye dönüşür. params= hem kodlamayı hem Türkçe karakterleri doğru yapar.' },
    { t: 'code', stage: 'Meydan okuma', id: 'http-api-10', diff: 3,
      q: '<p>Dayanıklı istek fonksiyonu: <code>dayanikli_istek(client, metot, yol, json=None, anahtar=None, deneme=4, taban=0.5, uyku=time.sleep)</code>.</p><ul><li>İsteği <code>client.request(metot, yol, json=json, headers=...)</code> ile at. <code>anahtar</code> verilmişse <code>Idempotency-Key</code> başlığı olarak gönder.</li><li>Tekrar denenebilir durumlar: <code>httpx.TransportError</code> (bağlantı/zaman aşımı), 429, 502, 503, 504. 429\'da <code>Retry-After</code> (saniye) varsa o kadar, yoksa ve diğer durumlarda <code>taban * 2 ** i</code> kadar bekle. Son denemeden sonra bekleme.</li><li><b>Idempotent olmayan</b> metotlar (POST, PATCH) yalnızca <code>anahtar</code> verilmişse tekrar denenir; yoksa ilk hatada hata yükselt.</li><li>Diğer hata kodlarında hemen <code>raise_for_status()</code>. Denemeler tükenince son hatayı yükselt (son yanıt varsa <code>raise_for_status()</code>, yoksa son <code>TransportError</code>).</li><li>Başarılıysa JSON döndür; 204 ise <code>None</code>.</li></ul>',
      start: 'import time\nimport httpx\n\ndef dayanikli_istek(client, metot, yol, json=None, anahtar=None, deneme=4, taban=0.5, uyku=time.sleep):\n    pass\n',
      sol: 'import time\nimport httpx\n\nGECICI = {429, 502, 503, 504}\n\ndef dayanikli_istek(client, metot, yol, json=None, anahtar=None, deneme=4, taban=0.5, uyku=time.sleep):\n    metot = metot.upper()\n    tekrar_olur = metot not in ("POST", "PATCH") or anahtar is not None\n    basliklar = {"Idempotency-Key": anahtar} if anahtar else {}\n    son_hata = None\n    for i in range(deneme):\n        bekle = taban * 2 ** i\n        try:\n            y = client.request(metot, yol, json=json, headers=basliklar)\n        except httpx.TransportError as e:\n            son_hata = e\n            if not tekrar_olur:\n                raise\n        else:\n            if y.is_success:\n                return None if y.status_code == 204 else y.json()\n            if y.status_code not in GECICI or not tekrar_olur:\n                y.raise_for_status()\n            son_hata = y\n            ra = y.headers.get("Retry-After", "")\n            if y.status_code == 429 and ra.isdigit():\n                bekle = float(ra)\n        if i < deneme - 1:\n            uyku(bekle)\n    if isinstance(son_hata, httpx.Response):\n        son_hata.raise_for_status()\n    raise son_hata\n',
      tests: 'import httpx\ndef kur(adimlar, kayit):\n    sira = iter(adimlar)\n    def sunucu(istek):\n        kayit.append((istek.method, istek.headers.get("Idempotency-Key")))\n        a = next(sira)\n        if a == "kopuk":\n            raise httpx.ConnectError("ağ yok", request=istek)\n        if isinstance(a, tuple):\n            return httpx.Response(a[0], headers=a[1])\n        return httpx.Response(a, json={"ok": a}) if a != 204 else httpx.Response(204)\n    return httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.example")\nk, b = [], []\nassert dayanikli_istek(kur(["kopuk", (429, {"Retry-After": "3"}), 503, 200], k), "GET", "/a", uyku=b.append) == {"ok": 200}, "geçici hatalardan sonra başarı JSON döndürmeli"\nassert b == [0.5, 3.0, 2.0], "kopuk: 0.5, 429: Retry-After 3, 503: 0.5*2**2=2.0; bulunan: " + str(b)\nk, b = [], []\ntry:\n    dayanikli_istek(kur([503, 200], k), "POST", "/odeme", json={"t": 1}, uyku=b.append)\n    assert False, "anahtarsız POST tekrar denenmemeli, hata yükselmeli"\nexcept httpx.HTTPStatusError:\n    pass\nassert len(k) == 1 and b == [], "anahtarsız POST tek istek, sıfır bekleme"\nk, b = [], []\nassert dayanikli_istek(kur([502, 201], k), "post", "/odeme", json={"t": 1}, anahtar="od-42", uyku=b.append) == {"ok": 201}, "anahtarlı POST tekrar denenebilir"\nassert k == [("POST", "od-42"), ("POST", "od-42")], "her denemede aynı Idempotency-Key gitmeli"\nk, b = [], []\nassert dayanikli_istek(kur([204], k), "DELETE", "/s/1", uyku=b.append) is None, "204 için None"\ntry:\n    dayanikli_istek(kur([422], k), "PUT", "/s/1", uyku=b.append)\n    assert False, "422 hemen hata vermeli"\nexcept httpx.HTTPStatusError:\n    pass\nk, b = [], []\ntry:\n    dayanikli_istek(kur(["kopuk"] * 3, k), "GET", "/a", deneme=3, uyku=b.append)\n    assert False, "bağlantı hep koparsa TransportError yükselmeli"\nexcept httpx.TransportError:\n    pass\nassert b == [0.5, 1.0], "3 deneme, 2 bekleme"\nk, b = [], []\ntry:\n    dayanikli_istek(kur([503, 504], k), "GET", "/a", deneme=2, uyku=b.append)\n    assert False\nexcept httpx.HTTPStatusError as e:\n    assert e.response.status_code == 504, "son yanıtın hatası yükselmeli"\n',
      hints: ['Önce "bu istek tekrar denenebilir mi?" kararını ver: metot POST/PATCH değilse ya da anahtar varsa.', 'try/except httpx.TransportError ile ağ hatalarını, else bloğunda yanıt kodlarını işle; son hatayı bir değişkende tut.', 'Bekleme süresini her turda taban * 2 ** i ile başlat; 429 ve sayısal Retry-After varsa onunla değiştir.'],
      why: 'Bu fonksiyon üretimdeki bir HTTP istemcisinin kalbidir. Idempotency-Key, sunucunun aynı anahtarlı ikinci POST\'u yeni işlem değil tekrar olarak tanımasını sağlar; anahtar yoksa POST\'u tekrar denememek çift ödeme riskini sıfırlar.' },
    { t: 'code', stage: 'Mini proje', id: 'http-api-11', diff: 3,
      q: '<p>Anadolu Market günlük şehir özeti. <code>gunluk_ozet_gonder(client, tarih, ortam)</code> şunu yapsın:</p><ol><li><code>ortam["ANADOLU_API_TOKEN"]</code>\'dan token al; yoksa ya da boşsa <code>RuntimeError</code>. Tüm isteklerde <code>Authorization: Bearer &lt;token&gt;</code> gönder.</li><li><code>GET /siparisler?tarih=...&amp;sayfa=n</code> ile sayfa 1\'den başlayarak tüm sayfaları çek. Yanıt: <code>{"veri": [...], "toplam_sayfa": k}</code>. <code>sayfa == toplam_sayfa</code> olunca ya da veri boş gelince dur. Her yanıtta <code>raise_for_status()</code>.</li><li>Geçerli sipariş: <code>sehir</code> boş olmayan metin, <code>tutar</code> sayı (bool değil) ve &gt;= 0. Geçersizleri say.</li><li>Şehre göre tutarları topla (2 basamak yuvarla) ve <code>POST /raporlar</code> ile <code>{"tarih": tarih, "sehirler": {...}, "gecersiz": n}</code> gönder.</li><li>Yanıt 201 değilse <code>raise_for_status()</code> (201 dışı 2xx de hata sayılsın: <code>RuntimeError</code>). 201 ise yanıt JSON\'undaki <code>"rapor_id"</code>\'yi döndür.</li></ol>',
      start: 'import httpx\n\ndef gunluk_ozet_gonder(client, tarih, ortam):\n    pass\n',
      sol: 'import httpx\n\ndef _gecerli(s):\n    sehir, tutar = s.get("sehir"), s.get("tutar")\n    return (isinstance(sehir, str) and sehir.strip() != ""\n            and isinstance(tutar, (int, float)) and not isinstance(tutar, bool) and tutar >= 0)\n\ndef gunluk_ozet_gonder(client, tarih, ortam):\n    token = ortam.get("ANADOLU_API_TOKEN")\n    if not token:\n        raise RuntimeError("ANADOLU_API_TOKEN tanımlı değil")\n    basliklar = {"Authorization": f"Bearer {token}"}\n    sehirler, gecersiz, sayfa = {}, 0, 1\n    while True:\n        y = client.get("/siparisler", params={"tarih": tarih, "sayfa": sayfa}, headers=basliklar)\n        y.raise_for_status()\n        govde = y.json()\n        veri = govde.get("veri") or []\n        for s in veri:\n            if _gecerli(s):\n                sehirler[s["sehir"]] = round(sehirler.get(s["sehir"], 0) + s["tutar"], 2)\n            else:\n                gecersiz += 1\n        if not veri or sayfa >= govde.get("toplam_sayfa", sayfa):\n            break\n        sayfa += 1\n    r = client.post("/raporlar", json={"tarih": tarih, "sehirler": sehirler, "gecersiz": gecersiz}, headers=basliklar)\n    r.raise_for_status()\n    if r.status_code != 201:\n        raise RuntimeError(f"Beklenmeyen durum: {r.status_code}")\n    return r.json()["rapor_id"]\n',
      tests: 'import httpx, json\nSAYFALAR = {1: [{"sehir": "İzmir", "tutar": 100.5}, {"sehir": "Ankara", "tutar": 50}], 2: [{"sehir": "İzmir", "tutar": 19.5}, {"sehir": "", "tutar": 10}, {"sehir": "Van", "tutar": True}], 3: [{"sehir": "Van", "tutar": 0.1}, {"tutar": 5}]}\ngelen = {"get": [], "post": None, "auth": set()}\ndef sunucu(istek):\n    gelen["auth"].add(istek.headers.get("Authorization"))\n    if istek.method == "GET":\n        p = dict(istek.url.params)\n        gelen["get"].append(p)\n        return httpx.Response(200, json={"veri": SAYFALAR[int(p["sayfa"])], "toplam_sayfa": 3})\n    gelen["post"] = json.loads(istek.content)\n    return httpx.Response(201, json={"rapor_id": "R-2026-10-27"})\nc = httpx.Client(transport=httpx.MockTransport(sunucu), base_url="https://api.anadolumarket.example")\nrid = gunluk_ozet_gonder(c, "2026-10-27", {"ANADOLU_API_TOKEN": "tok_9"})\nassert rid == "R-2026-10-27", "201 yanıtındaki rapor_id dönmeli"\nassert [g["sayfa"] for g in gelen["get"]] == ["1", "2", "3"], "üç sayfa da çekilmeli ve dördüncüye geçilmemeli"\nassert gelen["get"][0]["tarih"] == "2026-10-27", "tarih parametresi gönderilmeli"\nassert gelen["auth"] == {"Bearer tok_9"}, "tüm isteklerde Bearer token olmalı"\nassert gelen["post"] == {"tarih": "2026-10-27", "sehirler": {"İzmir": 120.0, "Ankara": 50, "Van": 0.1}, "gecersiz": 3}, "rapor gövdesi hatalı: " + str(gelen["post"])\ntry:\n    gunluk_ozet_gonder(c, "2026-10-27", {})\n    assert False, "token yoksa RuntimeError bekleniyordu"\nexcept RuntimeError:\n    pass\ndef bos_sunucu(istek):\n    if istek.method == "GET":\n        return httpx.Response(200, json={"veri": [], "toplam_sayfa": 0})\n    return httpx.Response(200, json={"rapor_id": "X"})\ntry:\n    gunluk_ozet_gonder(httpx.Client(transport=httpx.MockTransport(bos_sunucu), base_url="https://a.example"), "2026-10-27", {"ANADOLU_API_TOKEN": "t"})\n    assert False, "201 yerine 200 dönerse RuntimeError bekleniyordu"\nexcept RuntimeError:\n    pass\n',
      hints: ['Token kontrolünü her şeyden önce yap; başlık sözlüğünü bir kez kur, her istekte ver.', 'while True döngüsünde sayfa sayfa ilerle; veri boşsa ya da sayfa >= toplam_sayfa ise break.', 'POST sonrası önce raise_for_status(), sonra status_code == 201 kontrolü.'],
      why: 'Gerçek entegrasyonlar tam olarak bu adımlardan oluşur: kimlik, sayfalı okuma, doğrulama, toplama, yazma, sonucun kontrolü. Sahte taşıyıcı sayesinde tüm akışı ağ olmadan, istekleri tek tek denetleyerek test ettin.' }
  ],
  faq: [
    { q: 'requests mi httpx mi kullanmalıyım?', a: 'İkisinin senkron API\'si neredeyse aynıdır. Yeni projelerde httpx; async desteği, HTTP/2 ve MockTransport ile test kolaylığı sunar. requests ise ekosistemde çok yaygındır ve eski kodda karşına çıkar. Bir dersi öğrenen ötekini bir saatte öğrenir.' },
    { q: 'timeout için hangi değeri seçmeliyim?', a: 'Karşı servisin normal yanıt süresinin birkaç katı: çoğu iç API için 5–10 saniye okuma, 3 saniye bağlantı makuldür. Önemli olan hiç vermemek değil; timeout yoksa tek bir asılı bağlantı tüm iş akışını kilitler.' },
    { q: 'raise_for_status() mu, status_code kontrolü mü?', a: 'Beklenmeyen her hatayı yükseltmek için raise_for_status(); 404\'ü "kayıt yok" saymak gibi özel bir anlam vereceğin kodlar için önce status_code kontrolü. İkisi birlikte kullanılır: özel durumları önce işle, gerisini raise_for_status()\'a bırak.' },
    { q: 'Testlerde gerçek API\'ye istek atabilir miyim?', a: 'Birim testlerde atma: yavaştır, kotayı tüketir, ağ yokken kırılır ve sonuç değişkendir. MockTransport (httpx) ya da responses/requests-mock (requests) ile sahte yanıt ver. Gerçek servisle sözleşmeyi ayrı ve seyrek çalışan entegrasyon testlerinde doğrula.' }
  ],
  mistakes: [
    { bad: 'y = requests.get(url)', good: 'y = requests.get(url, timeout=10)\ny.raise_for_status()', why: 'Zaman aşımı olmayan istek sonsuza kadar bekleyebilir; durum kontrolü olmadan 500 hata sayfası veri gibi işlenir.' },
    { bad: 'requests.get(f"{TABAN}/ara?q={sorgu}")', good: 'requests.get(f"{TABAN}/ara", params={"q": sorgu})', why: 'Elle kurulan adreste &, %, boşluk ve Türkçe harfler kodlanmaz; sorgu bölünür ya da bozulur.' },
    { bad: 'API_KEY = "sk_live_51H..."  # config.py', good: 'API_KEY = os.environ["ANADOLU_API_KEY"]', why: 'Koda yazılan anahtar depoyla birlikte sızar; ortam değişkeni ya da gizli anahtar yöneticisi kullan.' },
    { bad: 'while True:\n    try:\n        return post_odeme()\n    except Exception:\n        pass', good: 'for i in range(4):\n    try:\n        return post_odeme(idempotency_key=anahtar)\n    except GeciciHata:\n        time.sleep(2 ** i)\nraise', why: 'Sınırsız ve beklemesiz tekrar sunucuyu boğar; tüm hataları yutmak kalıcı hatayı gizler; anahtarsız POST tekrarı çift ödeme yaratabilir.' },
    { bad: 'print("İstek başlıkları:", istek.headers)', good: 'print("İstek başlıkları:", basliklari_maskele(istek.headers))', why: 'Günlüğe düşen Authorization ya da API anahtarı, günlüğe erişen herkese sızar.' }
  ]
});
})(window);
