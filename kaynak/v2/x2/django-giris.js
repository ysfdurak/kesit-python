/* Kesit Python — 'django-giris' dersi uzantısı: HTMX ile kısmi güncelleme, CSRF, fetch ile JSON, form hataları ve SPA kararı (AUDIT Ekle-12) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'django-giris',
    min: 25,
    html: `<h2>Derinleş: Django'da HTMX, form, fetch ile JSON ve SPA kararı</h2><p>Django'nun şablon sistemi, formları ve admin paneli sunucu tarafı oluşturma (SSR) için kurulmuştur. Bir noktada şu karar gelir: arayüzü ayrı bir SPA (React) ve DRF API'siyle mi kuracağız, yoksa Django şablonlarını koruyup yalnız gereken yerleri dinamik mi yapacağız? İkinci yolun en yaygın aracı HTMX'tir. Flask dersindeki ek bölümde HTMX'in temel özniteliklerini (<code>hx-get</code>, <code>hx-target</code>, <code>hx-swap</code>, <code>hx-trigger</code>) gördüysen, burada aynı fikrin Django'daki karşılığını, CSRF'yi ve JSON uç noktalarını öğreneceksin.</p><div class="tbl-wrap"><table><tr><th>Soru</th><th>Django şablonu + HTMX</th><th>DRF + SPA</th></tr><tr><td>Arama motoru (SEO) önemli mi?</td><td>Hazır HTML, doğal</td><td>Ek sunucu tarafı oluşturma gerekir</td></tr><tr><td>Mobil uygulama da aynı veriyi kullanacak mı?</td><td>Ayrı JSON uç noktaları gerekir</td><td>Aynı API</td></tr><tr><td>Ekip</td><td>Python ağırlıklı</td><td>Ayrı ön yüz uzmanlığı</td></tr><tr><td>Admin, form, yetki</td><td>Django'nun hazır araçları aynen</td><td>API ve istemcide yeniden kurulur</td></tr></table></div><h3>Parça şablonu ve HX-Request</h3><p>Django'da parça şablonu ayrı bir dosyadır ve tam sayfa şablonunda <code>{% include %}</code> ile kullanılır. Görünüm, <code>request.headers</code> ile HTMX isteğini tanır; <code>django-htmx</code> paketi bunu <code>request.htmx</code> olarak kısaltır. Sayfalamada Django'nun <code>Paginator</code> sınıfı kullanılır.</p><pre class="code"># urunler/views.py
from django.core.paginator import Paginator
from django.shortcuts import render
from .models import Urun

def urun_listesi(request):
    q = request.GET.get("q", "")
    qs = Urun.objects.filter(ad__icontains=q).order_by("id")
    sayfa = Paginator(qs, 12).get_page(request.GET.get("sayfa"))
    baglam = {"sayfa": sayfa, "q": q}
    if request.headers.get("HX-Request") == "true":          # ya da request.htmx
        return render(request, "urunler/_satirlar.html", baglam)
    return render(request, "urunler/liste.html", baglam)</pre><pre class="code">{# urunler/_satirlar.html #}
{% for u in sayfa %}
  &lt;tr&gt;&lt;td&gt;{{ u.ad }}&lt;/td&gt;&lt;td&gt;{{ u.fiyat }} TL&lt;/td&gt;&lt;/tr&gt;
{% endfor %}
{% if sayfa.has_next %}
  &lt;tr hx-get="?q={{ q|urlencode }}&amp;sayfa={{ sayfa.next_page_number }}"
      hx-trigger="revealed" hx-swap="outerHTML"&gt;&lt;td&gt;Yükleniyor...&lt;/td&gt;&lt;/tr&gt;
{% endif %}</pre><h3>CSRF: Django'nun kapısı</h3><p>Django, POST/PUT/PATCH/DELETE isteklerinde CSRF belirteci (token) ister. Klasik formda <code>{% csrf_token %}</code> gizli bir <code>csrfmiddlewaretoken</code> alanı ekler. HTMX ve <code>fetch</code> isteklerinde belirteç <b>başlıkla</b> gönderilir: <code>X-CSRFToken</code>. Belirtecin değeri <code>csrftoken</code> çerezinde de durur.</p><pre class="code">&lt;body hx-headers='{"X-CSRFToken": "{{ csrf_token }}"}'&gt;   {# tüm HTMX istekleri başlığı taşır #}

&lt;script&gt;
function cerez(ad) {
  return document.cookie.split("; ").find(c =&gt; c.startsWith(ad + "="))?.split("=")[1];
}
const r = await fetch("/api/sepet/", {
  method: "POST",
  headers: {"Content-Type": "application/json", "X-CSRFToken": cerez("csrftoken")},
  body: JSON.stringify({urun_id: 19, adet: 2}),
});
&lt;/script&gt;</pre><p>Çerezden belirteç okumak tarayıcıda çalışan kodun işidir; mantığı Python'la görelim. Gerçek Anadolu Market ürünlerini <code>veri</code> modülünden okuyup JSON'a çeviriyoruz:</p><pre class="py">import json
from decimal import Decimal
from http.cookies import SimpleCookie
import veri

c = SimpleCookie()
c.load("sessionid=abc123; csrftoken=Xy9QeT2k")
print("çerezdeki belirteç:", c["csrftoken"].value)

urunler = veri.kayitlar("anadolu_market", "products")
kitaplar = [{"id": u["product_id"], "ad": u["name"], "fiyat": Decimal(str(u["price"]))}
            for u in urunler if u["category"] == "Kitap"][:3]

def ondalik(o):                      # DjangoJSONEncoder'ın yaptığı gibi
    if isinstance(o, Decimal):
        return str(o)
    raise TypeError(f"{type(o).__name__} JSON'a çevrilemez")

print(json.dumps(kitaplar, default=ondalik, ensure_ascii=False))</pre><h3>JsonResponse ve fetch</h3><p>JSON uç noktası için DRF şart değildir; küçük işlerde <code>JsonResponse</code> yeter. İki ayrıntı: varsayılan <code>safe=True</code> yalnız sözlük kabul eder (liste için <code>safe=False</code>), ve <code>DecimalField</code> değerleri Django'nun kodlayıcısında metne çevrilir. Türkçe karakterlerin kaçırılmaması için <code>json_dumps_params={"ensure_ascii": False}</code> verilebilir.</p><pre class="code">import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@require_POST
def sepet_api(request):
    try:
        govde = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"hata": "geçersiz JSON"}, status=400)
    form = SepetFormu(govde)                       # Django formu JSON ile de çalışır
    if not form.is_valid():
        return JsonResponse({"hatalar": form.errors}, status=422)
    return JsonResponse({"tutar": str(form.tutar())})

def kategoriler(request):
    return JsonResponse(list(Kategori.objects.values("id", "ad")), safe=False,
                        json_dumps_params={"ensure_ascii": False})</pre><h3>Form hataları HTMX ile</h3><p>HTMX 2, varsayılan olarak 4xx/5xx yanıtları sayfaya yerleştirmez. Form hatalarını göstermek için iki yol var: hatalı formu 200 ile parça olarak döndürmek, ya da 422 dönüp <code>HX-Retarget</code> ve <code>HX-Reswap</code> yanıt başlıklarıyla hataların nereye konacağını söylemek (ve istemcide 422'yi yerleştirmeye izin veren yapılandırmayı açmak). Hangi yolu seçersen seç, kural aynıdır: doğrulama her zaman sunucuda yapılır.</p><div class="note"><b>Gerçek işte</b>Django + HTMX, özellikle iç sistemlerde (bayi portalı, İK izin ekranı, stok paneli) yaygınlaşıyor: admin paneli, kimlik doğrulama ve form doğrulaması hazır gelir; ön yüz projesi gerekmez. Mobil uygulama ya da dış ortaklar için ise aynı modeller üzerine DRF API eklenir. Mülakatta "Django ile SPA" sorulursa CSRF'nin başlıkla gönderildiğini ve CORS'un ayrı bir konu olduğunu söyleyebilmelisin.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Bir Django görünümü <code>return JsonResponse([{"id": 1}, {"id": 2}])</code> satırında <code>TypeError</code> veriyor. Neden?',
        o: ['JsonResponse varsayılan olarak yalnız sözlük kabul eder; liste için safe=False', 'Django, JSON yanıtlarında yalnızca DRF serializer kullanılmasını zorunlu kılar', 'Liste elemanları sözlükse önce json.dumps ile metne çevrilmeleri gerekir', 'JsonResponse yalnızca POST isteklerine cevap olarak kullanılabilen bir sınıftır'],
        a: 0,
        why: 'safe=True varsayılanı eski tarayıcılardaki bir JSON dizisi güvenlik açığına karşı konmuştur; bilinçli olarak liste döndürmek için safe=False verirsin. JsonResponse serileştirmeyi kendisi yapar.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Django sayfasındaki JavaScript, <code>fetch</code> ile <code>/api/sepet/</code> adresine POST atıyor ve <b>403 CSRF verification failed</b> alıyor. En doğru çözüm hangisi?',
        o: ['Görünüme @csrf_exempt dekoratörü ekleyip korumayı o uç nokta için kaldırmak', 'csrftoken çerezindeki belirteci X-CSRFToken başlığıyla göndermek', 'İsteği POST yerine GET ile gönderip verileri sorgu dizesine koymak', 'settings.py içinde CSRF_COOKIE_SECURE ayarını False yapmak'],
        a: 1,
        why: 'Django başlıktaki belirteci çerezdekiyle karşılaştırır. csrf_exempt korumayı kapatır; GET ile veri değiştirmek HTTP anlamını bozar ve önbelleğe/yeniden denemeye açıktır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Django Paginator\'ı taklit eden hesap: 40 ürün, sayfa başına 12. Bu kod ne yazdırır?',
        code: 'import math\ntoplam, boyut = 40, 12\nsayfa_sayisi = math.ceil(toplam / boyut)\nfor n in (1, 4):\n    bas = (n - 1) * boyut\n    son = min(bas + boyut, toplam)\n    print(n, son - bas, n < sayfa_sayisi)\n',
        o: ['1 12 True\n4 4 False', '1 12 True\n4 12 False', '1 12 True\n4 4 True', '1 12 False\n4 4 False'],
        a: 0,
        why: '40 / 12 = 3.33 → 4 sayfa. 4. sayfa 36. elemandan başlar ve 40\'ta biter: 4 ürün. Son sayfa olduğu için has_next False.' },
      { t: 'code',
        id: 'django-giris-w1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Django\'nun CSRF denetimini basitleştirilmiş hâliyle yaz: <code>csrf_gecerli_mi(istek)</code>. <code>istek</code> sözlüğünde <code>"metot"</code>, <code>"cerez"</code> (ham <code>Cookie</code> başlık metni), <code>"basliklar"</code> ve <code>"form"</code> var. Kurallar:</p><ul><li>Güvenli metotlar (<code>GET</code>, <code>HEAD</code>, <code>OPTIONS</code>, <code>TRACE</code>) her zaman <code>True</code>.</li><li>Diğerlerinde <code>csrftoken</code> çerezi yoksa <code>False</code>.</li><li>Gönderilen belirteç: önce <code>form["csrfmiddlewaretoken"]</code>, yoksa <code>X-CSRFToken</code> başlığı. Yoksa <code>False</code>.</li><li>Karşılaştırma <code>hmac.compare_digest</code> ile yapılsın.</li></ul>',
        guide: ['Metot güvenliyse hemen True döndür.', 'http.cookies.SimpleCookie ile çerez metnini ayrıştır, csrftoken\'ı al.', 'Belirteci önce formdan, sonra başlıktan oku.', 'İkisi de varsa hmac.compare_digest ile karşılaştır.'],
        example: 'from http.cookies import SimpleCookie\nc = SimpleCookie()\nc.load("a=1; b=2")\nprint(c["b"].value, "c" in c)\n',
        start: 'import hmac\nfrom http.cookies import SimpleCookie\n\nGUVENLI = {"GET", "HEAD", "OPTIONS", "TRACE"}\n\ndef csrf_gecerli_mi(istek):\n    # TODO: güvenli metot kontrolü\n    # TODO: çerezden csrftoken\n    # TODO: formdan ya da başlıktan gönderilen belirteç\n    return None\n',
        sol: 'import hmac\nfrom http.cookies import SimpleCookie\n\nGUVENLI = {"GET", "HEAD", "OPTIONS", "TRACE"}\n\ndef csrf_gecerli_mi(istek):\n    if istek["metot"].upper() in GUVENLI:\n        return True\n    c = SimpleCookie()\n    c.load(istek.get("cerez", ""))\n    if "csrftoken" not in c:\n        return False\n    gelen = istek.get("form", {}).get("csrfmiddlewaretoken") or istek.get("basliklar", {}).get("X-CSRFToken")\n    if not gelen:\n        return False\n    return hmac.compare_digest(gelen, c["csrftoken"].value)\n',
        tests: 'cerez = "sessionid=s1; csrftoken=T0k3n"\nassert csrf_gecerli_mi({"metot": "GET", "cerez": "", "basliklar": {}, "form": {}}) is True, "GET güvenli"\nassert csrf_gecerli_mi({"metot": "POST", "cerez": cerez, "basliklar": {"X-CSRFToken": "T0k3n"}, "form": {}}) is True, "fetch başlıkla"\nassert csrf_gecerli_mi({"metot": "POST", "cerez": cerez, "basliklar": {}, "form": {"csrfmiddlewaretoken": "T0k3n"}}) is True, "klasik form"\nassert csrf_gecerli_mi({"metot": "DELETE", "cerez": cerez, "basliklar": {"X-CSRFToken": "baska"}, "form": {}}) is False\nassert csrf_gecerli_mi({"metot": "POST", "cerez": "sessionid=s1", "basliklar": {"X-CSRFToken": "T0k3n"}, "form": {}}) is False, "çerez yoksa red"\nassert csrf_gecerli_mi({"metot": "post", "cerez": cerez, "basliklar": {}, "form": {}}) is False, "belirteç yoksa red"\n',
        hints: ['Metodu upper() ile normalize et.', 'SimpleCookie nesnesinde "csrftoken" in c ile varlık kontrolü yapılır; değer c["csrftoken"].value.', 'compare_digest zamanlama saldırısına karşı sabit sürede karşılaştırır.'],
        why: 'Saldırgan site, kurbanın tarayıcısına çerez gönderttirebilir ama çerezi okuyamaz; bu yüzden aynı değerin form alanında ya da başlıkta da gelmesi isteğin gerçekten senin sayfandan geldiğini kanıtlar. Gerçek Django ayrıca Origin/Referer denetimi ve belirteç maskeleme yapar.' },
      { t: 'code',
        id: 'django-giris-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Django <code>Paginator</code>\'ının özünü yaz: <code>SayfaBolucu(nesneler, sayfa_basi)</code>. Özellikler/metotlar: <code>num_pages</code> (en az 1), <code>sayfa(n)</code> → bir <code>Sayfa</code> nesnesi. <code>Sayfa</code>\'nın alanları: <code>object_list</code> (liste), <code>number</code>, <code>has_next()</code>, <code>has_previous()</code>, <code>next_page_number()</code> (sonraki yoksa <code>ValueError</code>). <code>get_page(n)</code> ise hoşgörülü olsun: <code>n</code> sayıya çevrilemezse 1. sayfa, aralık dışındaysa son sayfa. Testler gerçek 40 üründe çalışır.</p>',
        guide: ['num_pages = max(1, ceil(len / sayfa_basi)).', 'Sayfa sınıfı bölücüye ve numaraya bakarak has_next ve has_previous\'ı hesaplar.', 'sayfa(n) dilimi (n-1)*boyut ile başlatır; aralık dışı n için ValueError.', 'get_page içinde int() hatasını yakala ve sınırla.'],
        example: 'import math\nprint(math.ceil(40 / 12), max(1, math.ceil(0 / 12)))\n',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport math\n\nclass Sayfa:\n    pass\n\nclass SayfaBolucu:\n    def __init__(self, nesneler, sayfa_basi):\n        self.nesneler = list(nesneler)\n        self.sayfa_basi = sayfa_basi\n    # TODO: num_pages, sayfa, get_page\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport math\n\nclass Sayfa:\n    def __init__(self, object_list, number, bolucu):\n        self.object_list, self.number, self.bolucu = object_list, number, bolucu\n\n    def has_next(self):\n        return self.number < self.bolucu.num_pages\n\n    def has_previous(self):\n        return self.number > 1\n\n    def next_page_number(self):\n        if not self.has_next():\n            raise ValueError("sonraki sayfa yok")\n        return self.number + 1\n\nclass SayfaBolucu:\n    def __init__(self, nesneler, sayfa_basi):\n        self.nesneler = list(nesneler)\n        self.sayfa_basi = sayfa_basi\n\n    @property\n    def num_pages(self):\n        return max(1, math.ceil(len(self.nesneler) / self.sayfa_basi))\n\n    def sayfa(self, n):\n        if not 1 <= n <= self.num_pages:\n            raise ValueError("geçersiz sayfa")\n        bas = (n - 1) * self.sayfa_basi\n        return Sayfa(self.nesneler[bas:bas + self.sayfa_basi], n, self)\n\n    def get_page(self, n):\n        try:\n            n = int(n)\n        except (TypeError, ValueError):\n            n = 1\n        return self.sayfa(min(max(n, 1), self.num_pages))\n',
        tests: 'b = SayfaBolucu(urunler, 12)\nassert b.num_pages == 4, "40 ürün / 12 = 4 sayfa"\ns = b.sayfa(1)\nassert [u["product_id"] for u in s.object_list] == list(range(1, 13)) and s.has_next() and not s.has_previous()\nassert s.next_page_number() == 2\nson = b.sayfa(4)\nassert len(son.object_list) == 4 and not son.has_next() and son.object_list[-1]["name"] == "Gurme Lokum Kutusu"\ntry:\n    son.next_page_number(); assert False, "Son sayfada ValueError"\nexcept ValueError:\n    pass\nassert b.get_page("abc").number == 1 and b.get_page(None).number == 1, "Sayıya çevrilemeyen değer 1. sayfa"\nassert b.get_page("99").number == 4, "Aralık dışı son sayfa"\nassert SayfaBolucu([], 10).num_pages == 1 and SayfaBolucu([], 10).sayfa(1).object_list == []\n',
        hints: ['num_pages için @property kullan: b.num_pages parantezsiz okunur.', 'int(None) TypeError, int("abc") ValueError verir; ikisini birden yakala.', 'Sınırlamak için min(max(n, 1), num_pages).'],
        why: 'Paginator.page katı (hatalı sayfada hata), get_page hoşgörülüdür; URL\'den gelen ?sayfa= değeri her şey olabileceği için görünümlerde get_page tercih edilir. has_next sonsuz kaydırmadaki gözcü satırının koşuludur.' },
      { t: 'code',
        id: 'django-giris-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>JsonResponse</code>\'u taklit et: <code>json_yanit(veri, safe=True, status=200)</code> <code>(status, govde, basliklar)</code> döndürsün. <code>safe</code> doğruyken <code>veri</code> sözlük değilse <code>TypeError("In order to allow non-dict objects to be serialized set the safe parameter to False.")</code>. Gövde <code>json.dumps(..., ensure_ascii=False)</code>; <code>Decimal</code> → <code>str</code>, <code>datetime.date</code>/<code>datetime</code> → <code>isoformat()</code>, diğer bilinmeyen tipler <code>TypeError</code>. Başlık: <code>{"Content-Type": "application/json"}</code>.</p>',
        start: 'import datetime\nimport json\nfrom decimal import Decimal\n\ndef json_yanit(veri, safe=True, status=200):\n    pass\n',
        sol: 'import datetime\nimport json\nfrom decimal import Decimal\n\ndef _kodla(o):\n    if isinstance(o, Decimal):\n        return str(o)\n    if isinstance(o, (datetime.date, datetime.datetime)):\n        return o.isoformat()\n    raise TypeError(f"{type(o).__name__} JSON\'a çevrilemez")\n\ndef json_yanit(veri, safe=True, status=200):\n    if safe and not isinstance(veri, dict):\n        raise TypeError("In order to allow non-dict objects to be serialized set the safe parameter to False.")\n    govde = json.dumps(veri, ensure_ascii=False, default=_kodla)\n    return status, govde, {"Content-Type": "application/json"}\n',
        tests: 'r = json_yanit({"ad": "Bakır Cezve", "fiyat": Decimal("320.00"), "tarih": datetime.date(2024, 12, 31)})\nassert r == (200, \'{"ad": "Bakır Cezve", "fiyat": "320.00", "tarih": "2024-12-31"}\', {"Content-Type": "application/json"}), f"Gelen {r}"\ntry:\n    json_yanit([1, 2]); assert False, "Liste safe=True ile reddedilmeli"\nexcept TypeError as h:\n    assert "safe parameter" in str(h)\nassert json_yanit([1, 2], safe=False, status=201)[:2] == (201, "[1, 2]")\ntry:\n    json_yanit({"x": {1, 2}}); assert False, "Küme JSON\\\'a çevrilemez"\nexcept TypeError:\n    pass\n',
        hints: ['json.dumps\'ın default parametresine bilinmeyen tipleri çeviren bir fonksiyon ver.', 'default fonksiyonu çeviremediği tipte TypeError fırlatmalı; None döndürürse "null" yazılır.'],
        why: 'Django modellerindeki DecimalField ve DateField değerleri standart json modülünde hata verir; DjangoJSONEncoder bunları metne çevirir. Para tutarını float yerine metin olarak göndermek kuruş hassasiyetini korur.' },
      { t: 'code',
        id: 'django-giris-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>HTMX formu için yanıt seçici: <code>form_yaniti(gecerli, hatalar, htmx)</code> <code>(status, govde, basliklar)</code> döndürsün.</p><ul><li>Geçerli + HTMX: <code>(200, \'&lt;p class="ok"&gt;Kaydedildi&lt;/p&gt;\', {"HX-Trigger": "kayitEklendi"})</code></li><li>Geçerli + klasik: <code>(302, "", {"Location": "/basvurular/"})</code></li><li>Geçersiz + HTMX: <code>(422, govde, {"HX-Retarget": "#form-hatalari", "HX-Reswap": "innerHTML"})</code>; govde, hatalar sözlüğünden (alan adına göre sıralı) <code>&lt;li&gt;alan: mesaj&lt;/li&gt;</code> satırlarıyla kurulan <code>&lt;ul&gt;...&lt;/ul&gt;</code>; alan ve mesaj <code>html.escape</code> ile kaçırılır, bir alanın birden çok mesajı varsa her biri ayrı <code>li</code>.</li><li>Geçersiz + klasik: aynı <code>&lt;ul&gt;</code> gövdesiyle <code>(400, govde, {})</code>.</li></ul>',
        start: 'import html\n\ndef form_yaniti(gecerli, hatalar, htmx):\n    pass\n',
        sol: 'import html\n\ndef _hata_listesi(hatalar):\n    satirlar = "".join(f"<li>{html.escape(alan)}: {html.escape(m)}</li>"\n                       for alan in sorted(hatalar) for m in hatalar[alan])\n    return "<ul>" + satirlar + "</ul>"\n\ndef form_yaniti(gecerli, hatalar, htmx):\n    if gecerli:\n        if htmx:\n            return 200, \'<p class="ok">Kaydedildi</p>\', {"HX-Trigger": "kayitEklendi"}\n        return 302, "", {"Location": "/basvurular/"}\n    govde = _hata_listesi(hatalar)\n    if htmx:\n        return 422, govde, {"HX-Retarget": "#form-hatalari", "HX-Reswap": "innerHTML"}\n    return 400, govde, {}\n',
        tests: 'assert form_yaniti(True, {}, True) == (200, \'<p class="ok">Kaydedildi</p>\', {"HX-Trigger": "kayitEklendi"})\nassert form_yaniti(True, {}, False) == (302, "", {"Location": "/basvurular/"})\nh = {"tutar": ["Tutar 0\\\'dan büyük olmalı"], "eposta": ["Geçersiz <e-posta>", "Zorunlu alan"]}\ns, g, b = form_yaniti(False, h, True)\nassert s == 422 and b == {"HX-Retarget": "#form-hatalari", "HX-Reswap": "innerHTML"}\nassert g == "<ul><li>eposta: Geçersiz &lt;e-posta&gt;</li><li>eposta: Zorunlu alan</li><li>tutar: Tutar 0&#x27;dan büyük olmalı</li></ul>", f"Gelen {g}"\nassert form_yaniti(False, h, False) == (400, g, {})\n',
        hints: ['Hata listesini üreten küçük bir yardımcı fonksiyon yaz; iki geçersiz dalda da kullan.', 'İç içe comprehension: for alan in sorted(hatalar) for m in hatalar[alan].'],
        why: 'HTMX isteğinde yönlendirme yerine parça ve olay başlığı, hatada ise hedefi değiştiren başlıklar döndürmek; klasik formda PRG ve 400 kullanmak. Aynı görünüm iki istemci türünü de doğru karşılar.' },
      { t: 'code',
        id: 'django-giris-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>kategori_urunleri(kategori)</code> görünümü <code>fetch</code> ile çağrılıyor ve gerçek ürünlerden o kategoridekileri <code>[{"id", "ad", "fiyat"}]</code> listesi olarak JSON\'a çevirmeli (fiyat <code>Decimal</code>, JSON\'da metin, <b>iki ondalık</b>: <code>"145.00"</code>). Üç sorun var: yanıt <code>TypeError</code> veriyor (Decimal), JSON\'da Türkçe karakterler <code>\\u00e7</code> gibi kaçırılıyor ve fiyatlar <code>"145.0"</code> biçiminde çıkıyor. Dönüş: JSON metni.</p>',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport json\nfrom decimal import Decimal\n\ndef kategori_urunleri(kategori):\n    liste = [{"id": u["product_id"], "ad": u["name"], "fiyat": Decimal(str(u["price"]))}\n             for u in urunler if u["category"] == kategori]\n    return json.dumps(liste)\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport json\nfrom decimal import Decimal\n\ndef _kodla(o):\n    if isinstance(o, Decimal):\n        return str(o)\n    raise TypeError(type(o).__name__)\n\ndef kategori_urunleri(kategori):\n    liste = [{"id": u["product_id"], "ad": u["name"],\n              "fiyat": Decimal(str(u["price"])).quantize(Decimal("0.01"))}\n             for u in urunler if u["category"] == kategori]\n    return json.dumps(liste, ensure_ascii=False, default=_kodla)\n',
        tests: 'r = json.loads(kategori_urunleri("Kitap"))\nassert len(r) == 7, "Kitap kategorisinde 7 ürün var"\nassert r[0] == {"id": 9, "ad": "Suç ve Ceza", "fiyat": "145.00"}, f"Gelen {r[0]}"\nassert "Suç ve Ceza" in kategori_urunleri("Kitap"), "Türkçe karakterler kaçırılmamalı (ensure_ascii=False)"\nassert json.loads(kategori_urunleri("Hediye"))[0]["fiyat"] == "500.00"\nassert kategori_urunleri("Yok") == "[]"\n',
        hints: ['json.dumps\'a Decimal\'i metne çeviren bir default fonksiyonu ver.', 'Decimal("145.0").quantize(Decimal("0.01")) iki ondalığa sabitler.', 'ensure_ascii=False Türkçe karakterleri olduğu gibi bırakır.'],
        why: 'Django\'nun DecimalField\'ı kendi ondalık hassasiyetini (decimal_places=2) korur ve DjangoJSONEncoder bunu metne çevirir. Standart json modülü Decimal\'i tanımaz; ensure_ascii varsayılanı da Türkçe metni okunmaz kılar.' },
      { t: 'code',
        id: 'django-giris-w6',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Aktif aramada eşleşen kısmı vurgula: <code>vurgula(metin, sorgu)</code> metindeki <code>sorgu</code> eşleşmelerini (Türkçe büyük/küçük harf duyarsız) <code>&lt;mark&gt;...&lt;/mark&gt;</code> içine alsın, <b>orijinal yazımı koruyarak</b>. Metnin geri kalanı ve eşleşen parça <code>html.escape</code> ile kaçırılsın (XSS!). Boş sorguda yalnız kaçırılmış metin döner. Türkçe küçültme: <code>"I"→"ı"</code>, <code>"İ"→"i"</code>, sonra <code>lower()</code> (bu dönüşüm uzunluğu korur). Sonra <code>arama_parcasi(sorgu)</code> yaz: gerçek ürünlerden adı sorguyu içerenler için <code>&lt;li&gt;{vurgulu ad}&lt;/li&gt;</code> satırlarını birleştirsin; sonuç yoksa <code>&lt;li class="bos"&gt;Sonuç yok&lt;/li&gt;</code>.</p>',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport html\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef vurgula(metin, sorgu):\n    pass\n\ndef arama_parcasi(sorgu):\n    pass\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport html\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef vurgula(metin, sorgu):\n    if not sorgu:\n        return html.escape(metin)\n    km, ks = tr_kucuk(metin), tr_kucuk(sorgu)\n    parcalar, i = [], 0\n    while True:\n        j = km.find(ks, i)\n        if j == -1:\n            parcalar.append(html.escape(metin[i:]))\n            break\n        parcalar.append(html.escape(metin[i:j]))\n        parcalar.append("<mark>" + html.escape(metin[j:j + len(sorgu)]) + "</mark>")\n        i = j + len(sorgu)\n    return "".join(parcalar)\n\ndef arama_parcasi(sorgu):\n    ks = tr_kucuk(sorgu)\n    satirlar = [f"<li>{vurgula(u[\'name\'], sorgu)}</li>" for u in urunler if ks in tr_kucuk(u["name"])]\n    return "".join(satirlar) or \'<li class="bos">Sonuç yok</li>\'\n',
        tests: 'assert vurgula("Seramik Kupa Seti", "set") == "Seramik Kupa <mark>Set</mark>i", "Orijinal yazım korunmalı"\nassert vurgula("İnce Memed", "ince") == "<mark>İnce</mark> Memed", "Türkçe İ eşleşmeli"\nassert vurgula("Ada <b>", "a") == "<mark>A</mark>d<mark>a</mark> &lt;b&gt;", "Tüm eşleşmeler ve kaçış"\nassert vurgula(\'27" Monitör\', "") == "27&quot; Monitör"\nassert vurgula("a<b>a", "<b>") == "a<mark>&lt;b&gt;</mark>a", "Eşleşen parça da kaçırılmalı"\nassert arama_parcasi("kahve") == "<li>Türk <mark>Kahve</mark>si Makinesi</li>"\nassert arama_parcasi("SET").count("<mark>Set</mark>") == 3, "Çaydanlık Seti, Seramik Kupa Seti, Dambıl Seti 10kg"\nassert arama_parcasi("xyz") == \'<li class="bos">Sonuç yok</li>\'\n',
        hints: ['Aramayı küçültülmüş metinde yap ama dilimi orijinal metinden al; dönüşüm uzunluğu koruduğu için indeksler aynıdır.', 'str.find(alt, baslangic) bir sonraki eşleşmenin indeksini, yoksa -1 verir.', 'Kaçışı en son değil, her parçaya ayrı uygula; <mark> etiketlerini kaçırma.'],
        why: 'Önce kaçırıp sonra vurgulamak <code>&amp;lt;</code> gibi parçaları bölebilir; önce vurgulayıp sonra kaçırmak da <code>&lt;mark&gt;</code> etiketini bozar. Doğru yol parçaları ayırıp her metin parçasını ayrı kaçırmaktır. Django şablonunda bu fonksiyonun sonucu mark_safe ile işaretlenir; içeride kaçış yapıldığı için güvenlidir.' }
    ],
    faq: [
      { q: 'HTMX ile Django REST Framework birlikte kullanılır mı?',
        a: 'Kullanılabilir ama genellikle gerekmez: HTMX HTML bekler, DRF JSON üretir. Yaygın düzen şudur: web arayüzü Django şablonları + HTMX ile, mobil uygulama ve dış ortaklar DRF API\'siyle beslenir; ikisi aynı modelleri ve servis fonksiyonlarını paylaşır.' },
      { q: 'django-htmx paketini kurmalı mıyım?',
        a: 'Zorunlu değil; <code>request.headers.get("HX-Request")</code> yeter. Paket (<code>pip install django-htmx</code>) <code>request.htmx</code> kısayolu, HTMX\'e özgü yanıt sınıfları (<code>HttpResponseClientRedirect</code> gibi) ve geliştirme sırasında hata sayfası desteği verir; birden çok HTMX görünümün varsa kullanışlıdır.' }
    ],
    mistakes: [
      { bad: 'return JsonResponse(list(qs.values()))',
        good: 'return JsonResponse(list(qs.values()), safe=False)',
        why: 'JsonResponse varsayılan olarak yalnız sözlük kabul eder; liste için safe=False gerekir.' }
    ] }
);
})(window);
