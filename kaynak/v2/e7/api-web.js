/* Kesit Python — v2 e7 uzantı (Derinleş): api-web */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
  id: 'api-web',
  min: 35,
  html: `
<h2>İstemciden sunucuya: API'yi tasarlayan tarafta olmak</h2>
<p>İstemci tarafını (istek atmak, yeniden denemek, sayfaları dolaşmak) <i>http-api</i> dersinde, çatıları <i>flask</i> ve <i>fastapi</i> derslerinde ayrıntılı göreceksin. Bu bölüm hangi çatıyı seçersen seç geçerli kalan <b>sunucu tarafı sözleşmeleri</b> ele alıyor: kaynakları adlandırmak, doğru durum kodunu seçmek, hata gövdesini standartlaştırmak, tekrarlanan isteğe dayanmak (idempotency), webhook imzası doğrulamak ve iyimser eşzamanlılık (ETag). Bunlar mülakatlarda en çok sorulan, çatı belgelerinde en az anlatılan konulardır.</p>

<h3>REST kaynak tasarımı ve durum kodu seçimi</h3>
<div class="tbl-wrap"><table>
<tr><th>İstek</th><th>Anlamı</th><th>Başarılı yanıt</th><th>Sık hata yanıtları</th></tr>
<tr><td><code>GET /siparisler?sehir=İzmir&amp;limit=50</code></td><td>Listele, süz</td><td>200 + liste ve sonraki sayfa imleci</td><td>400 geçersiz parametre</td></tr>
<tr><td><code>GET /siparisler/1042</code></td><td>Tek kaynak</td><td>200 (+ <code>ETag</code>)</td><td>404 yok, 304 değişmedi</td></tr>
<tr><td><code>POST /siparisler</code></td><td>Yeni kaynak oluştur</td><td>201 + <code>Location: /siparisler/1043</code></td><td>422 doğrulama, 409 çakışma</td></tr>
<tr><td><code>PUT /siparisler/1042</code></td><td>Tamamını değiştir (idempotent)</td><td>200 ya da 204</td><td>412 ETag uyuşmadı</td></tr>
<tr><td><code>PATCH /siparisler/1042</code></td><td>Kısmi güncelle</td><td>200</td><td>422, 409</td></tr>
<tr><td><code>DELETE /siparisler/1042</code></td><td>Sil (idempotent)</td><td>204</td><td>404 (ya da yine 204)</td></tr>
<tr><td><code>POST /siparisler/1042/iptal</code></td><td>Kaynağa uymayan eylem</td><td>200/202</td><td>409 durum uygun değil</td></tr>
</table></div>
<p>Kurallar: kaynak adları çoğul isim (<code>/siparisler</code>), fiil URL'de değil yöntemde; 401 "kim olduğunu bilmiyorum", 403 "biliyorum ama yetkin yok"; 422 gövde biçimce doğru ama kurala aykırı, 400 gövde hiç okunamıyor. Uzun süren iş için 202 Accepted + durum sorgulanacak bir adres döndür.</p>

<h3>Tek tip hata gövdesi: problem+json</h3>
<p>Her uç noktanın hatayı başka biçimde dönmesi istemci yazanların kâbusudur. RFC 9457 (eski adıyla RFC 7807) <code>application/problem+json</code> türünde ortak bir biçim önerir: <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, <code>instance</code> alanları ve gerekirse ek alanlar (ör. alan bazlı <code>errors</code>). Tek bir yardımcı fonksiyon yazıp tüm hataları ondan geçirirsen istemciler tek bir ayrıştırıcıyla yetinir.</p>

<h2>Çatısız bir API: WSGI sözleşmesi</h2>
<p>Flask ve Django'nun altında <b>WSGI</b> (Web Server Gateway Interface) vardır: sunucu (gunicorn, uWSGI) her istek için uygulamanı <code>uygulama(environ, start_response)</code> diye çağırır. <code>environ</code> isteği anlatan bir sözlüktür (yöntem, yol, başlıklar, gövde akışı); uygulama <code>start_response(durum, basliklar)</code> çağırıp gövdeyi bayt parçaları olarak döndürür. FastAPI'nin altındaki <b>ASGI</b> aynı fikrin async sürümüdür. Sözleşme yalnızca bir fonksiyon olduğu için uygulamayı ağ olmadan, doğrudan çağırarak test edebilirsin; aşağıdaki örnek tarayıcıda çalışır.</p>
<pre class="py">import io, json
from wsgiref.util import setup_testing_defaults

SIPARISLER = {1042: {"no": 1042, "sehir": "İzmir", "tutar": 1250}}

def json_yanit(start_response, durum, veri, ek=()):
    govde = json.dumps(veri, ensure_ascii=False).encode("utf-8")
    start_response(durum, [("Content-Type", "application/json; charset=utf-8"),
                           ("Content-Length", str(len(govde))), *ek])
    return [govde]

def uygulama(environ, start_response):
    yontem, yol = environ["REQUEST_METHOD"], environ["PATH_INFO"]
    if yontem == "GET" and yol.startswith("/siparisler/"):
        s = SIPARISLER.get(int(yol.rsplit("/", 1)[1]))
        if s is None:
            return json_yanit(start_response, "404 Not Found",
                              {"title": "Sipariş bulunamadı", "status": 404})
        return json_yanit(start_response, "200 OK", s)
    if yontem == "POST" and yol == "/siparisler":
        boy = int(environ.get("CONTENT_LENGTH") or 0)
        veri = json.loads(environ["wsgi.input"].read(boy))
        no = max(SIPARISLER) + 1
        SIPARISLER[no] = {"no": no, **veri}
        return json_yanit(start_response, "201 Created", SIPARISLER[no],
                          [("Location", f"/siparisler/{no}")])
    return json_yanit(start_response, "405 Method Not Allowed", {"status": 405})

def istek_at(yontem, yol, govde=None):          # test istemcisi: ağ yok
    environ = {}
    setup_testing_defaults(environ)
    ham = json.dumps(govde).encode() if govde else b""
    environ.update(REQUEST_METHOD=yontem, PATH_INFO=yol,
                   CONTENT_LENGTH=str(len(ham)), **{"wsgi.input": io.BytesIO(ham)})
    yakalanan = {}
    def start_response(durum, basliklar):
        yakalanan["durum"], yakalanan["basliklar"] = durum, dict(basliklar)
    govde = b"".join(uygulama(environ, start_response))
    return yakalanan["durum"], yakalanan["basliklar"].get("Location"), json.loads(govde)

print(istek_at("GET", "/siparisler/1042"))
print(istek_at("POST", "/siparisler", {"sehir": "Bursa", "tutar": 300}))
print(istek_at("GET", "/siparisler/9"))
</pre>

<h2>Idempotency anahtarı: çift ödemeyi önlemek</h2>
<p>Mobil uygulama "Öde" isteğini gönderdi, ağ koptu, yanıt gelmedi. Uygulama tekrar denerse müşteriden iki kez para çekilebilir; denemezse ödeme belirsiz kalır. Çözüm: istemci her işlem için benzersiz bir <code>Idempotency-Key</code> başlığı üretir (genelde UUID). Sunucu ilk isteğin <b>yanıtını</b> bu anahtarla saklar; aynı anahtarla gelen sonraki istekleri yeniden işlemez, kayıtlı yanıtı döndürür. Aynı anahtar <b>farklı bir gövdeyle</b> gelirse bu istemci hatasıdır (422 ya da 409). Stripe ve birçok banka API'si böyle çalışır.</p>

<h2>Webhook imzası: gelen isteğe güvenmek</h2>
<p>Ödeme sağlayıcısı "ödeme tamamlandı" bilgisini senin <code>/webhook</code> adresine POST eder. Adres herkese açık olduğu için herkes sahte istek gönderebilir. Sağlayıcı gövdeyi ortak bir gizli anahtarla <b>HMAC-SHA256</b> ile imzalar ve imzayı başlıkta gönderir; sen aynı hesabı yapıp karşılaştırırsın. Tekrar saldırısına (replay) karşı imzaya zaman damgası da katılır ve eski istekler reddedilir.</p>
<pre class="py">import hashlib, hmac, json

GIZLI = b"whsec_anadolu_test"

def imzala(zaman: int, govde: bytes) -&gt; str:
    mesaj = str(zaman).encode() + b"." + govde
    return hmac.new(GIZLI, mesaj, hashlib.sha256).hexdigest()

def dogrula(zaman: int, govde: bytes, imza: str, simdi: int, tolerans=300) -&gt; bool:
    if abs(simdi - zaman) &gt; tolerans:
        return False                                   # eski istek: tekrar saldırısı
    return hmac.compare_digest(imzala(zaman, govde), imza)

govde = json.dumps({"olay": "odeme.tamamlandi", "tutar": 1250}).encode()
imza = imzala(1_700_000_000, govde)
print(dogrula(1_700_000_000, govde, imza, simdi=1_700_000_060))
print(dogrula(1_700_000_000, govde.replace(b"1250", b"9999"), imza, simdi=1_700_000_060))
print(dogrula(1_700_000_000, govde, imza, simdi=1_700_009_999))
</pre>
<div class="warn"><b>İmzayı ham baytlar üzerinde hesapla</b>Gövdeyi önce <code>json.loads</code> ile ayrıştırıp sonra <code>json.dumps</code> ile yeniden üretirsen boşluklar, anahtar sırası ve Unicode kaçışları değişir; imza tutmaz. Çatından <b>ham gövdeyi</b> al (Flask'ta <code>request.get_data()</code>, FastAPI'de <code>await request.body()</code>). Karşılaştırmayı da <code>==</code> ile değil <code>hmac.compare_digest</code> ile yap; <code>==</code> ilk farklı karakterde durduğu için süre ölçümüyle imza tahmin edilebilir (timing attack).</div>

<h2>ETag ile iyimser eşzamanlılık</h2>
<p>İki operatör aynı siparişi aynı anda açıp düzenlerse sonra kaydeden, öncekinin değişikliğini sessizce ezer (lost update). Sunucu her GET yanıtında kaynağın sürümünü <code>ETag</code> başlığında verir; istemci PUT/PATCH gönderirken bu değeri <code>If-Match</code> başlığına koyar. Sunucu mevcut sürüm farklıysa <b>412 Precondition Failed</b> döner; istemci kaynağı yeniden okuyup kullanıcıya çakışmayı gösterir. ETag'in ikinci kullanımı önbellektir: <code>If-None-Match</code> eşleşirse 304 Not Modified ve boş gövde döner (istemci tarafını http-api dersinde gördün).</p>

<h2>Sürümleme, hız sınırı ve belgeler</h2>
<ul>
<li><b>Sürümleme:</b> Kırıcı değişiklik (alan silmek, tipini değiştirmek) yeni sürüm ister: <code>/v2/siparisler</code> en yaygın ve en görünür yoldur. Alan <b>eklemek</b> kırıcı değildir; istemcileri bilmedikleri alanları yok saymaya alıştır.</li>
<li><b>Hız sınırı (rate limit):</b> Sunucu tarafında genelde jeton kovası (token bucket) kullanılır: kova saniyede r jetonla dolar, en fazla b jeton tutar, her istek bir jeton harcar. Aşımda 429 ve <code>Retry-After</code> başlığı dön.</li>
<li><b>Sayfalama:</b> <code>offset</code> basittir ama araya kayıt eklenince satır atlar/tekrarlar ve büyük offset'lerde veritabanı yavaşlar. <b>İmleç (cursor)</b> sayfalamada "son görülen id"yi opak bir değer olarak (ör. base64) verirsin; sorgu <code>WHERE id &gt; ?</code> olur.</li>
<li><b>Belge:</b> OpenAPI şeması API'nin sözleşmesidir; FastAPI tiplerden otomatik üretir, Flask'ta apispec gibi eklentiler gerekir. Şemadan istemci kodu ve sözleşme testleri üretilebilir.</li>
</ul>
<div class="tip"><b>Kendi bilgisayarında dene</b>Örnekteki WSGI uygulamasını gerçek bir sunucuyla çalıştırmak için dosyaya kaydedip <code>python -m wsgiref.simple_server</code> yerine üretim sunucusu kullan: <code>pip install gunicorn</code> ve <code>gunicorn modul:uygulama --bind 0.0.0.0:8000</code> (Windows'ta gunicorn çalışmaz; <code>pip install waitress</code> ve <code>waitress-serve --port=8000 modul:uygulama</code>). Sık hata: <code>ModuleNotFoundError</code> alırsan komutu dosyanın bulunduğu klasörden çalıştır ya da <code>--chdir</code> ver.</div>
<div class="note"><b>Gerçek işte</b>Ödeme, sipariş ve havale gibi para hareketi yaratan her POST uç noktasında ilk soru "bu istek iki kez gelirse ne olur?" olmalıdır. Kod incelemesinde idempotency anahtarı, webhook imza doğrulaması ve tek tip hata gövdesi yoksa bunlar genellikle güvenlik ya da muhasebe bulgusu olarak geri döner. API'yi yazan ekip, istemcinin yeniden deneme yapacağını varsaymak zorundadır.</div>
`,
  ex: [
    { t: 'mc', stage: 'Isınma', q: 'Mobil uygulama ödeme isteğine <code>Idempotency-Key</code> başlığı ekliyor. Sunucu aynı anahtarla ikinci bir istek alırsa ne yapmalı?', o: [
        'İsteği yeniden işleyip ödemeyi bir kez daha almalı',
        'İşlemi tekrarlamadan ilk isteğin kayıtlı yanıtını döndürmeli',
        'Her zaman 409 Conflict dönüp istemciyi uyarmalı',
        'Anahtarı yok sayıp isteği normal bir POST gibi işlemeli'
      ], a: 1, why: 'Idempotency anahtarının amacı yeniden denemeyi güvenli yapmaktır: aynı anahtar + aynı gövde ilk yanıtı aynen alır, para ikinci kez çekilmez. Anahtar farklı bir gövdeyle gelirse ancak o zaman hata dönülür.' },
    { t: 'mc', stage: 'Isınma', q: 'İki operatör aynı siparişi düzenliyor. İkincisi PUT isteğinde <code>If-Match: "v3"</code> gönderdi ama sunucudaki sürüm <code>"v4"</code>. Doğru yanıt hangisi?', o: ['200 OK; son yazan kazanır', '304 Not Modified', '412 Precondition Failed', '404 Not Found'], a: 2, why: 'If-Match bir ön koşuldur: istemci "yalnız sürüm v3 ise güncelle" der. Sürüm değiştiyse 412 dönülür ve kayıp güncelleme (lost update) önlenir. 304 yalnız GET\'teki If-None-Match içindir.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'import hmac, hashlib\n\nanahtar = b"gizli"\ngovde = b\'{"tutar": 100}\'\nimza = hmac.new(anahtar, govde, hashlib.sha256).hexdigest()\nyeniden = b\'{"tutar":100}\'\nprint(len(imza), hmac.compare_digest(imza, hmac.new(anahtar, yeniden, hashlib.sha256).hexdigest()))\n', o: ['64 False', '64 True', '32 False', '32 True'], a: 0, why: 'SHA-256 32 bayttır, onaltılık gösterimi 64 karakter. Aynı JSON\'un boşluksuz yazımı farklı baytlardır; imza tutmaz. Bu yüzden imza ham gövde üzerinde doğrulanır.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'def uygulama(environ, start_response):\n    yol = environ["PATH_INFO"]\n    if yol == "/saglik":\n        start_response("200 OK", [("Content-Type", "text/plain")])\n        return [b"tamam"]\n    start_response("404 Not Found", [])\n    return [b"yok: ", yol.encode()]\n\ndef cagir(yol):\n    durum = []\n    govde = b"".join(uygulama({"PATH_INFO": yol}, lambda d, b: durum.append(d)))\n    return durum[0].split()[0], govde.decode()\n\nprint(cagir("/saglik"), cagir("/x"))\n', o: [
        '(\'200\', \'tamam\') (\'404\', \'yok: /x\')',
        '(\'200 OK\', \'tamam\') (\'404 Not Found\', \'yok: /x\')',
        '(200, \'tamam\') (404, \'yok: /x\')',
        '(\'200\', b\'tamam\') (\'404\', b\'yok: /x\')'
      ], a: 0, why: 'WSGI\'de durum "200 OK" gibi bir metindir; split()[0] ilk parçayı metin olarak verir. Gövde bayt parçalarının listesidir; birleştirip decode edince str olur.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'import base64, json\n\ndef imlec_yap(son_id):\n    return base64.urlsafe_b64encode(json.dumps({"id": son_id}).encode()).decode()\n\ndef imlec_coz(imlec):\n    return json.loads(base64.urlsafe_b64decode(imlec))["id"]\n\nkayitlar = list(range(1, 11))\nimlec = imlec_yap(4)\nsayfa = [k for k in kayitlar if k > imlec_coz(imlec)][:3]\nprint(sayfa, imlec_coz(imlec_yap(sayfa[-1])))\n', o: ['[5, 6, 7] 7', '[4, 5, 6] 6', '[5, 6, 7] 4', '[1, 2, 3] 3'], a: 0, why: 'İmleç son görülen id\'yi (4) taşır; sonraki sayfa id > 4 olan ilk 3 kayıttır. Yeni imleç sayfanın son id\'si olan 7\'yi kodlar.' },
    { t: 'order', stage: 'Kodu oku', q: '<p>Gelen webhook isteğinin imzasını doğrulayan kodun satırlarını sırala. Çıktı <code>True</code> olmalı.</p>', lines: [
        'import hmac, hashlib',
        'GIZLI = b"whsec_test"',
        'govde = b\'{"olay": "odeme"}\'',
        'gelen_imza = hmac.new(GIZLI, govde, hashlib.sha256).hexdigest()',
        'beklenen = hmac.new(GIZLI, govde, hashlib.sha256).hexdigest()',
        'print(hmac.compare_digest(beklenen, gelen_imza))'
      ], expect: 'True\n', hint: 'Gizli anahtar ve gövde önce tanımlanır; karşılaştırma en sonda.', why: 'Sunucu aynı gizli anahtarla ham gövdenin HMAC\'ini hesaplar ve compare_digest ile sabit sürede karşılaştırır.' },
    { t: 'code', stage: 'Rehberli', id: 'api-web-x1', diff: 2, q: '<p>Webhook doğrulayıcı yaz. <code>webhook_dogrula(basliklar: dict, govde: bytes, gizli: bytes, simdi: int, tolerans: int = 300) -&gt; dict</code>. Başlıkta <code>"X-Imza"</code> şu biçimde gelir: <code>"t=1700000000,v1=&lt;hex&gt;"</code>. İmza, <code>f"{t}.".encode() + govde</code> mesajının <code>gizli</code> ile HMAC-SHA256 hex özetidir. Kurallar: başlık yoksa ya da biçim bozuksa <code>ValueError("imza başlığı yok")</code> / <code>ValueError("imza biçimi bozuk")</code>; <code>|simdi - t| &gt; tolerans</code> ise <code>ValueError("zaman aşımı")</code>; imza tutmazsa <code>ValueError("imza geçersiz")</code>. Hepsi geçerse gövdeyi <code>json.loads</code> ile çözüp döndür. Karşılaştırmayı <code>hmac.compare_digest</code> ile yap.</p>', guide: [
        'basliklar.get("X-Imza") yoksa hata fırlat.',
        'Başlığı virgülle böl, her parçayı "=" ile anahtar/değer yap; t ve v1 yoksa ya da t sayı değilse "imza biçimi bozuk".',
        'Zaman toleransını denetle.',
        'Beklenen imzayı hmac.new(gizli, mesaj, hashlib.sha256).hexdigest() ile hesapla ve compare_digest ile karşılaştır.',
        'Gövdeyi JSON olarak çözüp döndür.'
      ], example: 'import hmac, hashlib\n\nparcalar = dict(p.split("=", 1) for p in "a=1,b=xyz".split(","))\nprint(parcalar)\nprint(hmac.new(b"k", b"mesaj", hashlib.sha256).hexdigest()[:16])\n', start: 'import hmac, hashlib, json\n\ndef webhook_dogrula(basliklar, govde, gizli, simdi, tolerans=300):\n    baslik = basliklar.get("X-Imza")\n    # TODO: başlığı ayrıştır (t ve v1)\n    # TODO: zaman toleransı\n    # TODO: HMAC hesapla, compare_digest ile karşılaştır\n    return json.loads(govde)\n', sol: 'import hmac, hashlib, json\n\ndef webhook_dogrula(basliklar, govde, gizli, simdi, tolerans=300):\n    baslik = basliklar.get("X-Imza")\n    if not baslik:\n        raise ValueError("imza başlığı yok")\n    try:\n        parcalar = dict(p.split("=", 1) for p in baslik.split(","))\n        t = int(parcalar["t"])\n        imza = parcalar["v1"]\n    except (ValueError, KeyError):\n        raise ValueError("imza biçimi bozuk")\n    if abs(simdi - t) > tolerans:\n        raise ValueError("zaman aşımı")\n    beklenen = hmac.new(gizli, f"{t}.".encode() + govde, hashlib.sha256).hexdigest()\n    if not hmac.compare_digest(beklenen, imza):\n        raise ValueError("imza geçersiz")\n    return json.loads(govde)\n', tests: 'import hmac, hashlib\nG = b"whsec_anadolu"\ngovde = \'{"olay": "odeme.tamamlandi", "tutar": 1250}\'.encode()\ndef baslik(t, g=govde, k=G):\n    return {"X-Imza": f"t={t},v1=" + hmac.new(k, f"{t}.".encode() + g, hashlib.sha256).hexdigest()}\nassert webhook_dogrula(baslik(1000), govde, G, simdi=1100) == {"olay": "odeme.tamamlandi", "tutar": 1250}, "Geçerli imzada gövde çözülüp dönmeli"\ndef hata(*a, **k):\n    try:\n        webhook_dogrula(*a, **k)\n    except ValueError as h:\n        return str(h)\n    return "hata yok"\nassert hata({}, govde, G, 1000) == "imza başlığı yok"\nassert hata({"X-Imza": "bozuk"}, govde, G, 1000) == "imza biçimi bozuk"\nassert hata({"X-Imza": "t=abc,v1=00"}, govde, G, 1000) == "imza biçimi bozuk", "t sayı değilse biçim bozuk"\nassert hata(baslik(1000), govde, G, 1000 + 301) == "zaman aşımı", "300 saniyeden eski istek reddedilmeli"\nassert hata(baslik(1000), govde.replace(b"1250", b"9999"), G, 1000) == "imza geçersiz", "Gövde değiştiyse imza tutmamalı"\nassert hata(baslik(1000, k=b"baska"), govde, G, 1000) == "imza geçersiz", "Yanlış anahtarla imzalanmış istek reddedilmeli"\nassert "compare_digest" in __source__, "Karşılaştırmayı hmac.compare_digest ile yap"\n', hints: [
        'dict(p.split("=", 1) for p in baslik.split(",")) başlığı sözlüğe çevirir; "=" yoksa ValueError, anahtar yoksa KeyError oluşur.',
        'try/except (ValueError, KeyError) ile iki durumu "imza biçimi bozuk" mesajına çevir.',
        'beklenen = hmac.new(gizli, f"{t}.".encode() + govde, hashlib.sha256).hexdigest()'
      ], why: 'Zaman damgasını imzaya katmak tekrar saldırısını, compare_digest ise zamanlama saldırısını önler. Stripe, GitHub ve iyzico gibi sağlayıcıların webhook doğrulaması bu şemanın çeşitlemeleridir.' },
    { t: 'code', stage: 'Rehberli', id: 'api-web-x2', diff: 2, q: '<p>Çatısız bir WSGI uygulaması yaz: <code>uygulama(environ, start_response)</code>. Uç noktalar: <code>GET /saglik</code> → 200, gövde <code>{"durum": "ok"}</code>; <code>GET /urunler/&lt;kod&gt;</code> → <code>URUNLER</code> sözlüğünde varsa 200 ve ürün sözlüğü, yoksa 404 ve <code>{"title": "bulunamadı", "status": 404}</code>; diğer her şey 404 aynı gövdeyle. Tüm yanıtlar JSON (<code>ensure_ascii=False</code>, UTF-8), <code>Content-Type: application/json</code> başlığıyla. Gövdeyi bayt listesi olarak döndür.</p>', guide: [
        'Önce JSON gövdeyi kodlayıp start_response çağıran küçük bir yardımcı yaz.',
        'environ["REQUEST_METHOD"] ve environ["PATH_INFO"] değerlerini al.',
        '/saglik için 200 dön.',
        'Yol /urunler/ ile başlıyorsa kodu ayır ve URUNLER\'de ara.',
        'Kalan her durumda 404 dön.'
      ], example: 'def merhaba(environ, start_response):\n    ad = environ.get("QUERY_STRING", "") or "dünya"\n    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])\n    return [f"Merhaba {ad}".encode()]\n\ndurum = []\nprint(b"".join(merhaba({"QUERY_STRING": "Ayşe"}, lambda d, b: durum.append(d))).decode(), durum)\n', start: 'import json\n\nURUNLER = {"AM-1": {"kod": "AM-1", "ad": "Çay 1 kg", "fiyat": 189.9}}\n\ndef uygulama(environ, start_response):\n    # TODO: yöntem ve yolu oku, uç noktaları ayır\n    start_response("200 OK", [("Content-Type", "application/json")])\n    return [b"{}"]\n', sol: 'import json\n\nURUNLER = {"AM-1": {"kod": "AM-1", "ad": "Çay 1 kg", "fiyat": 189.9}}\n\ndef _json(start_response, durum, veri):\n    start_response(durum, [("Content-Type", "application/json")])\n    return [json.dumps(veri, ensure_ascii=False).encode("utf-8")]\n\ndef uygulama(environ, start_response):\n    yontem, yol = environ["REQUEST_METHOD"], environ["PATH_INFO"]\n    yok = {"title": "bulunamadı", "status": 404}\n    if yontem == "GET" and yol == "/saglik":\n        return _json(start_response, "200 OK", {"durum": "ok"})\n    if yontem == "GET" and yol.startswith("/urunler/"):\n        urun = URUNLER.get(yol[len("/urunler/"):])\n        if urun:\n            return _json(start_response, "200 OK", urun)\n    return _json(start_response, "404 Not Found", yok)\n', tests: 'import json\ndef cagir(yontem, yol):\n    kayit = {}\n    def sr(durum, basliklar):\n        kayit["durum"], kayit["b"] = durum, dict(basliklar)\n    govde = b"".join(uygulama({"REQUEST_METHOD": yontem, "PATH_INFO": yol}, sr))\n    assert isinstance(govde, bytes), "Gövde bayt parçalarından oluşmalı"\n    assert kayit["b"].get("Content-Type", "").startswith("application/json"), "Content-Type application/json olmalı"\n    return kayit["durum"], json.loads(govde.decode("utf-8"))\nassert cagir("GET", "/saglik") == ("200 OK", {"durum": "ok"})\nassert cagir("GET", "/urunler/AM-1") == ("200 OK", {"kod": "AM-1", "ad": "Çay 1 kg", "fiyat": 189.9})\nassert cagir("GET", "/urunler/AM-9") == ("404 Not Found", {"title": "bulunamadı", "status": 404}), "Olmayan ürün 404"\nassert cagir("POST", "/saglik")[0] == "404 Not Found", "Tanımsız yöntem/yol 404"\nkayit = []\nham = b"".join(uygulama({"REQUEST_METHOD": "GET", "PATH_INFO": "/urunler/AM-1"}, lambda d, b: kayit.append(d)))\nassert "Çay".encode("utf-8") in ham, "ensure_ascii=False ile Türkçe karakter kaçışsız UTF-8 olmalı"\n', hints: [
        'WSGI uygulaması start_response("200 OK", [(başlık, değer)]) çağırır ve [bayt] döndürür.',
        'Yol ayrıştırma: yol.startswith("/urunler/") ve yol[len("/urunler/"):].',
        'json.dumps(veri, ensure_ascii=False).encode("utf-8")'
      ], why: 'Flask ve Django\'nun yaptığı iş özünde budur: environ\'u okuyup yönlendirmek ve start_response ile yanıt kurmak. Sözleşmeyi bilmek ara katman yazarken ve test ederken işe yarar.' },
    { t: 'code', stage: 'Rehberli', id: 'api-web-x3', diff: 2, q: '<p>Sunucu tarafında idempotency. <code>IdempotentIsleyici(isle)</code> sınıfı yaz; <code>isle(govde: dict) -&gt; dict</code> asıl iş fonksiyonudur (ör. ödemeyi çeker). <code>cagir(anahtar, govde)</code>: anahtar ilk kez geliyorsa <code>isle</code>\'yi çağırıp sonucu <code>(govde, sonuc)</code> olarak saklasın ve <code>(201, sonuc)</code> döndürsün; aynı anahtar <b>aynı gövdeyle</b> tekrar gelirse işlemeden <code>(200, kayıtlı sonuç)</code>; aynı anahtar <b>farklı gövdeyle</b> gelirse <code>(422, {"hata": "anahtar farklı gövdeyle kullanıldı"})</code>. <code>isle</code> istisna fırlatırsa hiçbir şey saklanmasın (istemci aynı anahtarla tekrar deneyebilsin) ve istisna yükselsin.</p>', guide: [
        '__init__ içinde isle\'yi ve boş bir kayıt sözlüğü sakla.',
        'cagir: anahtar kayıtta varsa kayıtlı gövdeyi karşılaştır.',
        'Gövde aynıysa (200, sonuç), farklıysa (422, hata).',
        'Yoksa isle(govde) çağır; başarılıysa kaydet ve (201, sonuç) döndür.',
        'Kaydı isle başarılı olduktan SONRA yap ki hata durumunda anahtar boşta kalsın.'
      ], example: 'onbellek = {}\n\ndef kare(n):\n    if n in onbellek:\n        return "önbellek", onbellek[n]\n    onbellek[n] = n * n\n    return "hesap", onbellek[n]\n\nprint(kare(4), kare(4))\n', start: 'class IdempotentIsleyici:\n    def __init__(self, isle):\n        self.isle = isle\n        self.kayit = {}\n\n    def cagir(self, anahtar, govde):\n        # TODO: kayıtlı mı? aynı gövde mi?\n        sonuc = self.isle(govde)\n        return 201, sonuc\n', sol: 'class IdempotentIsleyici:\n    def __init__(self, isle):\n        self.isle = isle\n        self.kayit = {}\n\n    def cagir(self, anahtar, govde):\n        if anahtar in self.kayit:\n            eski_govde, sonuc = self.kayit[anahtar]\n            if eski_govde != govde:\n                return 422, {"hata": "anahtar farklı gövdeyle kullanıldı"}\n            return 200, sonuc\n        sonuc = self.isle(govde)\n        self.kayit[anahtar] = (dict(govde), sonuc)\n        return 201, sonuc\n', tests: 'cekilen = []\ndef ode(g):\n    if g["tutar"] <= 0:\n        raise ValueError("tutar")\n    cekilen.append(g["tutar"])\n    return {"odeme_no": len(cekilen), "tutar": g["tutar"]}\nh = IdempotentIsleyici(ode)\nassert h.cagir("k1", {"tutar": 500}) == (201, {"odeme_no": 1, "tutar": 500})\nassert h.cagir("k1", {"tutar": 500}) == (200, {"odeme_no": 1, "tutar": 500}), "Tekrar eden istek kayıtlı yanıtı almalı"\nassert cekilen == [500], "Para yalnız bir kez çekilmeli"\nassert h.cagir("k1", {"tutar": 900})[0] == 422, "Aynı anahtar farklı gövdeyle 422"\nassert h.cagir("k2", {"tutar": 900})[0] == 201, "Yeni anahtar yeni işlem"\ntry:\n    h.cagir("k3", {"tutar": 0})\n    raise AssertionError("İş hatası yükselmeli")\nexcept ValueError:\n    pass\nassert "k3" not in h.kayit, "Başarısız işlem saklanmamalı"\ng = {"tutar": 75}\nassert h.cagir("k4", g)[0] == 201\ng["tutar"] = 1\nassert h.cagir("k4", {"tutar": 75})[0] == 200, "Saklanan gövde, istemcinin sözlüğü sonradan değişse de korunmalı"\n', hints: [
        'Anahtar kayıttaysa self.kayit[anahtar] = (gövde, sonuç) demetini aç.',
        'Kaydetmeyi isle() çağrısından sonraya koy; istisna olursa satıra hiç ulaşılmaz.',
        'Gövdenin kopyasını sakla (dict(govde)); çağıranın sözlüğü sonradan değişebilir.'
      ], why: 'Gerçek sistemlerde kayıt veritabanında tutulur, anahtar benzersiz kısıt (unique) taşır ve belli bir süre (ör. 24 saat) saklanır. Mantık bu kadar sadedir ama çift ödeme hatalarının çoğunu önler.' },
    { t: 'code', stage: 'Kendin yaz', id: 'api-web-x4', diff: 2, q: '<p>Jeton kovası hız sınırlayıcı yaz. <code>JetonKovasi(kapasite, saniyede, saat)</code>: <code>saat</code> o anki zamanı saniye olarak döndüren bir fonksiyondur (testte sahte saat verilir). Kova dolu başlar. <code>izin_ver()</code> çağrısı önce geçen süre kadar jetonu ekler (kapasiteyi aşmadan), jeton ≥ 1 ise birini harcayıp <code>(True, 0)</code>, değilse <code>(False, bekle)</code> döndürür; <code>bekle</code> bir jeton dolana kadar gereken saniyedir (2 basamak yuvarlanmış). Bu, 429 yanıtındaki <code>Retry-After</code> değeridir.</p>', start: 'class JetonKovasi:\n    pass\n', sol: 'class JetonKovasi:\n    def __init__(self, kapasite, saniyede, saat):\n        self.kapasite = kapasite\n        self.saniyede = saniyede\n        self.saat = saat\n        self.jeton = float(kapasite)\n        self.son = saat()\n\n    def izin_ver(self):\n        simdi = self.saat()\n        self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.saniyede)\n        self.son = simdi\n        if self.jeton >= 1:\n            self.jeton -= 1\n            return True, 0\n        return False, round((1 - self.jeton) / self.saniyede, 2)\n', tests: 'zaman = [0.0]\nk = JetonKovasi(3, 2, lambda: zaman[0])\nassert [k.izin_ver()[0] for _ in range(3)] == [True, True, True], "Kova dolu başlar: 3 istek geçer"\nassert k.izin_ver() == (False, 0.5), "Saniyede 2 jeton: bir jeton için 0.5 sn beklenir"\nzaman[0] = 0.5\nassert k.izin_ver() == (True, 0), "0.5 sn sonra bir jeton dolmuş olmalı"\nzaman[0] = 100\nassert [k.izin_ver()[0] for _ in range(4)] == [True, True, True, False], "Uzun beklemede kova kapasiteyi aşmamalı"\nzaman[0] = 100.25\nok, bekle = k.izin_ver()\nassert ok is False and bekle == 0.25, f"Yarım jeton varken 0.25 sn beklenmeli; gelen {bekle}"\n', hints: [
        'Her çağrıda: jeton = min(kapasite, jeton + geçen_süre * saniyede).',
        'Eksik jeton (1 - jeton), dolma hızına (saniyede) bölünürse bekleme süresi çıkar.'
      ], why: 'Saati parametre olarak almak (bağımlılık enjeksiyonu) zamana bağlı kodu beklemeden, kesin sonuçlarla test etmeyi sağlar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'api-web-x5', diff: 2, q: '<p>Tek tip hata gövdesi. <code>problem(status, title, detail=None, **ek) -&gt; tuple[int, dict, dict]</code> fonksiyonu <code>(status, basliklar, govde)</code> döndürsün: başlık <code>{"Content-Type": "application/problem+json"}</code>; gövde <code>type</code> (<code>"about:blank"</code>), <code>title</code>, <code>status</code> ve verilmişse <code>detail</code> alanlarını, ayrıca <code>ek</code> anahtarlarını içersin. Sonra <code>dogrulama_hatasi(hatalar: dict[str, str])</code> 422 için <code>title="Doğrulama hatası"</code>, <code>detail=f"{n} alan geçersiz"</code> ve <code>errors</code> alanında <code>[{"alan": ..., "mesaj": ...}]</code> listesi (alan adına göre sıralı) döndürsün.</p>', start: 'def problem(status, title, detail=None, **ek):\n    pass\n\ndef dogrulama_hatasi(hatalar):\n    pass\n', sol: 'def problem(status, title, detail=None, **ek):\n    govde = {"type": "about:blank", "title": title, "status": status}\n    if detail is not None:\n        govde["detail"] = detail\n    govde.update(ek)\n    return status, {"Content-Type": "application/problem+json"}, govde\n\ndef dogrulama_hatasi(hatalar):\n    liste = [{"alan": a, "mesaj": m} for a, m in sorted(hatalar.items())]\n    return problem(422, "Doğrulama hatası", f"{len(hatalar)} alan geçersiz", errors=liste)\n', tests: 's, b, g = problem(404, "Sipariş bulunamadı", instance="/siparisler/9")\nassert s == 404 and b == {"Content-Type": "application/problem+json"}\nassert g == {"type": "about:blank", "title": "Sipariş bulunamadı", "status": 404, "instance": "/siparisler/9"}, "detail verilmezse gövdede olmamalı"\ns, b, g = dogrulama_hatasi({"tutar": "pozitif olmalı", "sehir": "boş olamaz"})\nassert s == 422 and g["detail"] == "2 alan geçersiz"\nassert g["errors"] == [{"alan": "sehir", "mesaj": "boş olamaz"}, {"alan": "tutar", "mesaj": "pozitif olmalı"}], "errors alan adına göre sıralı olmalı"\nassert g["title"] == "Doğrulama hatası" and g["type"] == "about:blank"\n', hints: [
        'Gövdeyi temel alanlarla kur, detail\'i koşullu ekle, sonra govde.update(ek).',
        'dogrulama_hatasi, problem(422, ..., errors=liste) çağırarak yazılabilir.'
      ], why: 'Tüm hataların tek yardımcıdan geçmesi istemcinin tek ayrıştırıcıyla yetinmesini sağlar; FastAPI ve Django REST Framework için de bu biçime dönüştüren hata işleyicileri yazılır.' },
    { t: 'code', stage: 'Hata avı', id: 'api-web-x6', kind: 'bug', diff: 2, q: '<p>Hatayı bul ve düzelt. <code>sayfa_getir(kayitlar, imlec, limit)</code> imleç tabanlı sayfalama yapıyor: <code>kayitlar</code> id\'ye göre sıralı sözlükler; <code>imlec</code> None ya da son görülen id; dönüş <code>(sayfa, sonraki_imlec)</code>, son sayfada sonraki imleç None. Ama sayfalar arasında aynı kayıt iki kez geliyor ve son sayfadan sonra boş bir sayfa daha isteniyor. Tüm kayıtlar tam bir kez gelmeli.</p>', start: 'def sayfa_getir(kayitlar, imlec, limit):\n    baslangic = imlec or 0\n    sayfa = [k for k in kayitlar if k["id"] >= baslangic][:limit]\n    sonraki = sayfa[-1]["id"] if sayfa else None\n    return sayfa, sonraki\n', sol: 'def sayfa_getir(kayitlar, imlec, limit):\n    kalan = [k for k in kayitlar if imlec is None or k["id"] > imlec]\n    sayfa = kalan[:limit]\n    sonraki = sayfa[-1]["id"] if len(kalan) > limit else None\n    return sayfa, sonraki\n', tests: 'veri = [{"id": i} for i in (3, 5, 8, 13, 21, 34, 55)]\ntoplanan, imlec, istek = [], None, 0\nwhile True:\n    sayfa, imlec = sayfa_getir(veri, imlec, 3)\n    istek += 1\n    toplanan += [k["id"] for k in sayfa]\n    if imlec is None or istek > 10:\n        break\nassert toplanan == [3, 5, 8, 13, 21, 34, 55], f"Her kayıt tam bir kez gelmeli; gelen {toplanan}"\nassert istek == 3, f"7 kayıt, 3\'erli sayfa: 3 istek yeterli; yapılan {istek}"\nassert sayfa_getir(veri, 55, 3) == ([], None)\nassert sayfa_getir(veri[:3], None, 3) == ([{"id": 3}, {"id": 5}, {"id": 8}], None), "Tam dolan son sayfadan sonra imleç None olmalı"\n', hints: [
        'İmleç "son görülen" id\'dir; o kayıt bir daha gelmemeli: >= değil >.',
        'Daha fazla kayıt olup olmadığını anlamak için süzülmüş listenin uzunluğunu limit ile karşılaştır.'
      ], why: 'İmleç sınırında >= kullanmak her sayfanın ilk kaydını tekrarlar. Gerçek API\'lerde "daha var mı?" sorusu genelde limit + 1 kayıt çekip fazlalığa bakarak yanıtlanır.' },
    { t: 'code', stage: 'Hata avı', id: 'api-web-x7', kind: 'bug', diff: 2, q: '<p>Hatayı bul ve düzelt. <code>imza_gecerli_mi(ham_govde, imza, gizli)</code> ödeme sağlayıcısından gelen webhook imzasını doğrulamalı; sağlayıcı imzayı <b>gönderdiği ham baytlar</b> üzerinden HMAC-SHA256 hex olarak hesaplıyor. Mevcut kod geçerli istekleri bile reddediyor, üstelik karşılaştırma zamanlama saldırısına açık. İki sorunu da düzelt.</p>', start: 'import hmac, hashlib, json\n\ndef imza_gecerli_mi(ham_govde, imza, gizli):\n    veri = json.loads(ham_govde)\n    yeniden = json.dumps(veri).encode()\n    beklenen = hmac.new(gizli, yeniden, hashlib.sha256).hexdigest()\n    return beklenen == imza\n', sol: 'import hmac, hashlib, json\n\ndef imza_gecerli_mi(ham_govde, imza, gizli):\n    beklenen = hmac.new(gizli, ham_govde, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(beklenen, imza)\n', tests: 'import hmac, hashlib\nG = b"whsec_x"\nham = \'{"olay":"odeme","tutar":1250,"musteri":"Ayşe"}\'.encode("utf-8")\nimza = hmac.new(G, ham, hashlib.sha256).hexdigest()\nassert imza_gecerli_mi(ham, imza, G) is True, "Sağlayıcının imzaladığı ham gövde geçerli sayılmalı"\nassert imza_gecerli_mi(ham.replace(b"1250", b"1251"), imza, G) is False, "Değiştirilmiş gövde reddedilmeli"\nassert imza_gecerli_mi(ham, "0" * 64, G) is False\nassert "compare_digest" in __source__, "== yerine hmac.compare_digest kullan"\n', hints: [
        'json.dumps varsayılan olarak ", " ve ": " ayırıcıları ve \\u kaçışları kullanır; sağlayıcının baytlarıyla aynı olmaz.',
        'HMAC\'i doğrudan ham_govde üzerinde hesapla; karşılaştırmada hmac.compare_digest kullan.'
      ], why: 'İmza baytların imzasıdır, anlamın değil. Yeniden serileştirme baytları değiştirir. == ise ilk farklı karakterde durduğundan yanıt süresinden imza tahmin edilebilir.' },
    { t: 'code', stage: 'Meydan okuma', id: 'api-web-x8', diff: 3, q: '<p>ETag ile iyimser eşzamanlılık destekleyen küçük bir kaynak deposu yaz. <code>SiparisAPI</code> sınıfı siparişleri <code>{no: (surum, veri)}</code> olarak tutsun; ETag <code>f\'"{surum}"\'</code> biçiminde (tırnaklar dahil). Metotlar (hepsi <code>(durum, basliklar, govde)</code> döndürür):</p><ul><li><code>olustur(veri)</code>: no 1\'den başlayarak artar, sürüm 1; <code>(201, {"Location": "/siparisler/&lt;no&gt;", "ETag": ...}, veri_ve_no)</code>. Gövde <code>{"no": no, **veri}</code>.</li><li><code>getir(no, if_none_match=None)</code>: yoksa <code>(404, {}, None)</code>; If-None-Match güncel ETag ise <code>(304, {"ETag": ...}, None)</code>; değilse 200 ve gövde.</li><li><code>guncelle(no, veri, if_match=None)</code>: yoksa 404; if_match verilmemişse <code>(428, {}, None)</code> (Precondition Required); güncel ETag değilse <code>(412, {"ETag": güncel}, None)</code>; eşleşirse veriyi tamamen değiştir, sürümü 1 artır, 200 ve yeni ETag ile gövdeyi döndür.</li></ul>', start: 'class SiparisAPI:\n    pass\n', sol: 'class SiparisAPI:\n    def __init__(self):\n        self.kayit = {}\n        self.sayac = 0\n\n    @staticmethod\n    def _etag(surum):\n        return f\'"{surum}"\'\n\n    def olustur(self, veri):\n        self.sayac += 1\n        no = self.sayac\n        govde = {"no": no, **veri}\n        self.kayit[no] = (1, govde)\n        return 201, {"Location": f"/siparisler/{no}", "ETag": self._etag(1)}, govde\n\n    def getir(self, no, if_none_match=None):\n        if no not in self.kayit:\n            return 404, {}, None\n        surum, govde = self.kayit[no]\n        etag = self._etag(surum)\n        if if_none_match == etag:\n            return 304, {"ETag": etag}, None\n        return 200, {"ETag": etag}, govde\n\n    def guncelle(self, no, veri, if_match=None):\n        if no not in self.kayit:\n            return 404, {}, None\n        if if_match is None:\n            return 428, {}, None\n        surum, _ = self.kayit[no]\n        if if_match != self._etag(surum):\n            return 412, {"ETag": self._etag(surum)}, None\n        govde = {"no": no, **veri}\n        self.kayit[no] = (surum + 1, govde)\n        return 200, {"ETag": self._etag(surum + 1)}, govde\n', tests: 'api = SiparisAPI()\nd, b, g = api.olustur({"sehir": "İzmir", "tutar": 500})\nassert (d, b, g) == (201, {"Location": "/siparisler/1", "ETag": \'"1"\'}, {"no": 1, "sehir": "İzmir", "tutar": 500})\nassert api.olustur({"sehir": "Bursa", "tutar": 90})[1]["Location"] == "/siparisler/2", "Numara artmalı"\nd, b, g = api.getir(1)\nassert d == 200 and b["ETag"] == \'"1"\'\nassert api.getir(1, if_none_match=\'"1"\') == (304, {"ETag": \'"1"\'}, None), "Değişmeyen kaynakta 304 ve boş gövde"\nassert api.getir(9)[0] == 404\nassert api.guncelle(1, {"sehir": "İzmir", "tutar": 650})[0] == 428, "If-Match olmadan güncelleme 428"\nd, b, g = api.guncelle(1, {"sehir": "İzmir", "tutar": 650}, if_match=\'"1"\')\nassert d == 200 and b == {"ETag": \'"2"\'} and g == {"no": 1, "sehir": "İzmir", "tutar": 650}, "Başarılı güncelleme sürümü artırmalı"\nassert api.guncelle(1, {"sehir": "Ankara", "tutar": 1}, if_match=\'"1"\') == (412, {"ETag": \'"2"\'}, None), "Eski ETag ile güncelleme 412 (kayıp güncelleme önlenir)"\nassert api.getir(1)[2]["tutar"] == 650, "412 sonrası veri değişmemeli"\nassert api.getir(1, if_none_match=\'"1"\')[0] == 200, "Sürüm değişince eski ETag ile 200 dönmeli"\nassert api.guncelle(5, {}, if_match=\'"1"\')[0] == 404\n', hints: [
        'Sürüm ve gövdeyi bir demet olarak sakla; ETag yalnız sürümden üretilir.',
        'Kontrol sırası: 404 → 428 → 412 → güncelle.',
        'ETag değerinde tırnaklar da vardır: f\'"{surum}"\'.'
      ], why: 'Bu, HTTP\'nin yerleşik eşzamanlılık denetimidir: kilit tutmadan iki kullanıcının birbirinin değişikliğini ezmesini engeller ve aynı ETag GET önbelleğini de besler.' }
  ],
  faq: [
    { q: 'PUT ile PATCH arasındaki fark nedir?', a: 'PUT kaynağın tamamını gönderilen temsille değiştirir ve idempotenttir: aynı PUT iki kez gönderilse de sonuç aynıdır. PATCH yalnızca gönderilen alanları değiştirir; "stok -1" gibi göreli bir değişiklik içeriyorsa idempotent değildir. Çakışma riski olan güncellemelerde ikisinde de If-Match kullan.' },
    { q: 'WSGI mi ASGI mi seçmeliyim?', a: 'Flask ve klasik Django WSGI\'dir; her istek bir iş parçacığında baştan sona çalışır, çoğu iş uygulaması için yeterlidir. Çok sayıda eşzamanlı uzun bağlantı (WebSocket, akış, çok sayıda dış API beklemesi) varsa ASGI (FastAPI, Starlette, Django async) daha verimlidir. Sunucular da farklıdır: WSGI için gunicorn/waitress, ASGI için uvicorn.' }
  ],
  mistakes: [
    { bad: '@app.post("/odeme")\ndef odeme(istek):\n    banka.cek(istek.tutar)   # her tekrar denemede yeniden çeker', good: '@app.post("/odeme")\ndef odeme(istek, anahtar):\n    if kayit := idem.getir(anahtar):\n        return kayit\n    return idem.kaydet(anahtar, banka.cek(istek.tutar))', why: 'İstemciler ve ağ katmanları yeniden dener. Para hareketi yaratan uç noktada Idempotency-Key olmadan aynı istek iki kez işlenebilir.' },
    { bad: 'veri = request.get_json()\nif imzala(json.dumps(veri)) == request.headers["X-Imza"]:\n    ...', good: 'ham = request.get_data()\nif hmac.compare_digest(imzala(ham), request.headers["X-Imza"]):\n    ...', why: 'İmza ham baytlar üzerinde hesaplanmalı; yeniden serileştirilen JSON farklı baytlar üretir. == yerine compare_digest zamanlama saldırısını önler.' }
  ]
}
);
})(window);
