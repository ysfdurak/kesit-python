/* Kesit Python — 'flask' dersi uzantısı: HTMX ile kısmi güncelleme, temel form, fetch ile JSON, SSR ve SPA farkı (AUDIT Ekle-12) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'flask',
    min: 25,
    html: `<h2>Derinleş: HTMX ile kısmi güncelleme, form ve fetch ile JSON</h2><p>Flask şablonları her istekte <b>tam sayfa</b> üretir. Modern arayüzlerde ise sayfanın yalnız bir parçası değişir: arama kutusuna yazdıkça liste süzülür, "Sepete ekle"ye basınca yalnız sepet rozeti güncellenir. Bunun üç yolu var ve bir web geliştiricisinin üçünü de tanıması gerekir.</p><div class="tbl-wrap"><table><tr><th>Yaklaşım</th><th>Sunucu ne döndürür?</th><th>Artısı</th><th>Eksisi</th></tr><tr><td>Sunucu tarafı oluşturma (SSR, klasik)</td><td>Tam HTML sayfa</td><td>Basit, SEO dostu, JavaScript gerekmez</td><td>Her tıklamada sayfa yenilenir</td></tr><tr><td>HTMX ("HTML over the wire")</td><td>HTML parçası (partial)</td><td>SSR'nin basitliği + kısmi güncelleme; tek dil Python</td><td>Çok zengin istemci etkileşiminde sınırlı</td></tr><tr><td>SPA (React, Vue) + JSON API</td><td>JSON</td><td>Zengin, uygulama gibi arayüz; mobil ile aynı API</td><td>İki kod tabanı, derleme araçları, durum yönetimi</td></tr></table></div><h3>Temel HTML formu</h3><p>Her şeyin temeli, JavaScript olmadan da çalışan formdur. Alanların <code>name</code> özniteliği <code>request.form</code> anahtarını belirler; <code>label</code> ile <code>for</code> erişilebilirlik içindir; tarayıcı doğrulaması (<code>required</code>, <code>min</code>) kullanıcıya kolaylıktır ama sunucu doğrulamasının yerini tutmaz.</p><pre class="code">&lt;form method="post" action="/sepet"&gt;
  &lt;label for="urun"&gt;Ürün&lt;/label&gt;
  &lt;select id="urun" name="urun_id"&gt;
    &lt;option value="19"&gt;Bakır Cezve&lt;/option&gt;
    &lt;option value="20"&gt;Seramik Kupa Seti&lt;/option&gt;
  &lt;/select&gt;
  &lt;label for="adet"&gt;Adet&lt;/label&gt;
  &lt;input id="adet" name="adet" type="number" min="1" max="10" value="1" required&gt;
  &lt;button type="submit"&gt;Sepete ekle&lt;/button&gt;
&lt;/form&gt;</pre><h3>HTMX: öznitelikle AJAX</h3><p>HTMX küçük bir JavaScript kütüphanesidir; sayfaya tek <code>&lt;script&gt;</code> etiketiyle eklenir ve HTML'e yeni öznitelikler kazandırır: <code>hx-get</code>/<code>hx-post</code> hangi adrese istek atılacağını, <code>hx-target</code> gelen HTML'in nereye konacağını, <code>hx-swap</code> nasıl konacağını (<code>innerHTML</code>, <code>outerHTML</code>, <code>beforeend</code>), <code>hx-trigger</code> ne zaman tetikleneceğini söyler. Sunucu JSON değil <b>HTML parçası</b> döndürür.</p><pre class="code">&lt;script src="https://unpkg.com/htmx.org@2.0.4"&gt;&lt;/script&gt;

&lt;input type="search" name="q" placeholder="Ürün ara..."
       hx-get="/urunler" hx-trigger="input changed delay:300ms, search"
       hx-target="#sonuclar" hx-swap="innerHTML"&gt;
&lt;table&gt;&lt;tbody id="sonuclar"&gt;{% include "_urun_satirlari.html" %}&lt;/tbody&gt;&lt;/table&gt;</pre><pre class="code">from flask import Flask, render_template, request

@app.get("/urunler")
def urunler():
    q = request.args.get("q", "")
    liste = urun_ara(q)
    if request.headers.get("HX-Request") == "true":            # HTMX isteği: yalnız parça
        return render_template("_urun_satirlari.html", urunler=liste)
    return render_template("urunler.html", urunler=liste, q=q)  # normal istek: tam sayfa</pre><p>HTMX her isteğe <code>HX-Request: true</code> başlığı ekler. Aynı adres böylece hem tam sayfayı (doğrudan açılınca, arama motoru gelince) hem parçayı (HTMX çağırınca) sunar; buna aşamalı geliştirme (progressive enhancement) denir. Parça şablonu (<code>_urun_satirlari.html</code>) tam sayfa şablonunda <code>{% include %}</code> ile kullanıldığı için HTML iki kez yazılmaz. Mantığı Anadolu Market'in gerçek ürün tablosuyla tarayıcıda dene:</p><pre class="py">import veri
from jinja2 import Environment

urunler = veri.kayitlar("anadolu_market", "products")
env = Environment(autoescape=True)
parca = env.from_string(
    "{% for u in urunler %}&lt;tr&gt;&lt;td&gt;{{ u.name }}&lt;/td&gt;&lt;td&gt;{{ u.category }}&lt;/td&gt;"
    "&lt;td&gt;{{ '%.0f'|format(u.price) }} TL&lt;/td&gt;&lt;/tr&gt;\\n{% endfor %}")

def yanit(basliklar, q):
    liste = [u for u in urunler if q.lower() in u["name"].lower()]
    govde = parca.render(urunler=liste)
    if basliklar.get("HX-Request") == "true":
        return govde
    return "&lt;html&gt;&lt;body&gt;&lt;h1&gt;Ürünler&lt;/h1&gt;&lt;table&gt;" + govde + "&lt;/table&gt;&lt;/body&gt;&lt;/html&gt;"

print(yanit({"HX-Request": "true"}, "set"))
print(yanit({}, "kupa")[:60], "...")</pre><p>Kategori sütunundaki <code>Ev &amp; Yaşam</code> değerinin çıktıda <code>&amp;amp;</code> olarak kaçırıldığına dikkat et: autoescape parçalarda da geçerlidir ve XSS'e karşı korur. Başarılı bir HTMX formundan sonra yönlendirme (302) yerine güncellenmiş parçayı döndür; başka bir bölgeyi de haberdar etmek için <code>HX-Trigger: sepetGuncellendi</code> yanıt başlığıyla bir olay yayınla.</p><h3>fetch ile JSON çağrısı</h3><p>Bir sayfada küçük bir JavaScript etkileşimi gerekiyorsa (sepet tutarını anında hesaplamak gibi) tarayıcının yerleşik <code>fetch</code> fonksiyonu yeterlidir. Flask tarafında <code>request.get_json()</code> gövdeyi okur, <code>jsonify</code> ya da sözlük döndürmek JSON yanıt üretir. Hatalarda da JSON ve doğru durum kodu dön ki istemci <code>r.ok</code> ile ayırt edebilsin.</p><pre class="code">// static/sepet.js
const r = await fetch("/api/sepet", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({urun_id: 19, adet: 2}),
});
const veri = await r.json();
if (r.ok) { document.querySelector("#tutar").textContent = veri.tutar + " TL"; }
else { alert(veri.hata); }</pre><pre class="code">@app.post("/api/sepet")
def sepet_api():
    govde = request.get_json(silent=True) or {}
    durum, sonuc = sepet_hesapla(govde)        # doğrulama + hesap, saf Python
    return sonuc, durum                         # Flask sözlüğü JSON'a çevirir</pre><div class="note"><b>Gerçek işte</b>İç araçlar, yönetim panelleri ve küçük e-ticaret siteleri için Flask + Jinja + HTMX üçlüsü, ayrı bir React projesine göre çok daha az kodla aynı kullanıcı deneyimini verir. Mobil uygulama da aynı veriyi istiyorsa JSON API (FastAPI ya da Flask) ve SPA tercih edilir. Mülakatta "SSR mı SPA mı?" sorusunun iyi cevabı ihtiyaçtan başlar: SEO, etkileşim yoğunluğu, ekip becerisi ve kaç farklı istemcinin olduğu.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Aynı <code>/urunler</code> adresi bazen tam sayfa, bazen yalnız tablo satırlarını döndürüyor. Flask görünümü hangisini döndüreceğine nasıl karar verir?',
        o: ['URL\'nin sonuna HTMX kendiliğinden ?partial=1 ekler', 'HTMX isteğe HX-Request: true başlığını ekler; görünüm bu başlığa bakar', 'İstek POST ise parça, GET ise tam sayfa döndürülür', 'Flask, isteğin tarayıcıdan mı JavaScript\'ten mi geldiğini kendisi bilir'],
        a: 1,
        why: 'HTMX her isteğe HX-Request başlığı koyar. Başlık yoksa istek normal gezinmedir (adres çubuğu, arama motoru) ve tam sayfa döner; böylece sayfa JavaScript olmadan da çalışır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Anadolu Market\'in ürün katalog sayfaları arama motorlarında iyi sıralanmalı, sayfalar hızlı açılmalı ve ekipte yalnız Python bilen iki geliştirici var. Hangisi en uygun başlangıçtır?',
        o: ['Ayrı bir React SPA ve yalnız JSON dönen bir API', 'Flask ile sunucu tarafı oluşturma, gereken yerlerde HTMX ile kısmi güncelleme', 'Tüm sayfayı tek bir fetch çağrısıyla JSON\'dan JavaScript ile oluşturmak', 'Her ürün için elle yazılmış ayrı statik HTML dosyaları'],
        a: 1,
        why: 'SSR, arama motorlarına hazır HTML verir ve ilk açılış hızlıdır; HTMX etkileşimi Python ve HTML ile ekler. SPA iki kod tabanı ve JavaScript uzmanlığı gerektirir; statik dosyalar fiyat ve stok değişince sürdürülemez.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Parça şablonu autoescape açıkken render ediliyor. Bu kod ne yazdırır?',
        code: 'from jinja2 import Environment\nenv = Environment(autoescape=True)\nt = env.from_string(\'<option value="{{ k }}">{{ k }}</option>\')\nprint(t.render(k=\'Ev & Yaşam\'))\n',
        o: ['<option value="Ev &amp; Yaşam">Ev &amp; Yaşam</option>', '<option value="Ev & Yaşam">Ev & Yaşam</option>', '<option value="Ev &amp; Yaşam">Ev & Yaşam</option>', '<option value="Ev%20%26%20Yaşam">Ev & Yaşam</option>'],
        a: 0,
        why: 'autoescape her {{ }} çıktısında &, &lt;, >, " ve \' karakterlerini HTML varlığına çevirir; öznitelik içinde de, metin içinde de. Tarayıcı <code>&amp;amp;</code> değerini ekranda & olarak gösterir ve form gönderiminde de & olarak yollar.' },
      { t: 'code',
        id: 'flask-w1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Canlı arama kutusunun sunucu tarafı: <code>urun_ara(q, kategori=None)</code> Anadolu Market\'in gerçek ürünlerinden adı <code>q</code>\'yu içerenleri (Türkçe büyük/küçük harf duyarsız) döndürsün; <code>kategori</code> verilirse ona da eşit olsun. Boş ya da yalnız boşluk olan <code>q</code> tüm ürünleri (kategori süzgeciyle) verir. Sonuç <code>name</code>\'e göre değil, orijinal sırada (product_id) kalsın. <code>tr_kucuk</code> yardımcısı hazır.</p>',
        guide: ['q\'nun başındaki ve sonundaki boşlukları at, tr_kucuk ile küçült.', 'Ürünleri gez; kategori verildiyse eşit olmayanları atla.', 'Ürün adının tr_kucuk hâli q\'yu içeriyorsa sonuca ekle.'],
        example: 'kelimeler = ["Çay", "Kahve", "Çaydanlık"]\nprint([k for k in kelimeler if "çay" in k.lower()])\n',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef urun_ara(q, kategori=None):\n    sonuc = []\n    # TODO: q\'yu temizle ve küçült, ürünleri süz\n    return sonuc\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\ndef urun_ara(q, kategori=None):\n    aranan = tr_kucuk(q.strip())\n    sonuc = []\n    for u in urunler:\n        if kategori and u["category"] != kategori:\n            continue\n        if aranan in tr_kucuk(u["name"]):\n            sonuc.append(u)\n    return sonuc\n',
        tests: 'adlar = lambda l: [u["name"] for u in l]\nassert adlar(urun_ara("krem")) == ["Nemlendirici Krem", "Güneş Kremi SPF50"], "krem iki üründe geçer"\nassert adlar(urun_ara("İNCE")) == ["İnce Memed"], "Türkçe İ/i doğru eşleşmeli"\nassert adlar(urun_ara("ince")) == ["İnce Memed"], "\'ince\' de İnce Memed\\\'i bulmalı (lower() İ\\\'yi bozar)"\nassert len(urun_ara("  ")) == 40, "Boş arama tüm 40 ürünü döndürmeli"\nassert adlar(urun_ara("set", "Ev & Yaşam")) == ["Çaydanlık Seti", "Seramik Kupa Seti"]\nassert urun_ara("set", "Spor")[0]["name"] == "Dambıl Seti 10kg"\n',
        hints: ['Boş metin her metnin içinde geçer: "" in "abc" True\'dur; boş arama kendiliğinden hepsini verir.', 'Python\'un lower() metodu "İ" harfini iki karakterlik "i̇" yapar; bu yüzden tr_kucuk kullan.'],
        why: 'Canlı aramada her tuşa basışta bu fonksiyon çalışır; HTMX\'in delay:300ms ayarı istek sayısını azaltır. Türkçe harf dönüşümü doğru yapılmazsa "İnce Memed" hiç bulunamaz.' },
      { t: 'code',
        id: 'flask-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Parça şablonunu yaz: <code>satirlar_html(liste)</code> jinja2 ile (<code>autoescape=True</code>) her ürün için tam olarak şu satırı üretsin ve hepsini birleştirip döndürsün: <code>&lt;tr id="urun-{product_id}"&gt;&lt;td&gt;{name}&lt;/td&gt;&lt;td&gt;{fiyat} TL&lt;/td&gt;&lt;/tr&gt;</code>. Fiyat binlik ayırıcı nokta ile ve kuruşsuz yazılsın (<code>15999.0</code> → <code>15.999</code>). Liste boşsa tek satır: <code>&lt;tr&gt;&lt;td colspan="2"&gt;Sonuç yok&lt;/td&gt;&lt;/tr&gt;</code>. Satırlar arasında boşluk ya da yeni satır olmasın.</p>',
        guide: ['Environment(autoescape=True) kur.', 'Fiyatı biçimleyen bir filtre yaz: f"{x:,.0f}".replace(",", ".") ve env.filters\'a ekle.', 'Şablonda for ... else kullan: else bloğu liste boşken çalışır.', 'Şablonu tek satır yaz ki araya boşluk girmesin.'],
        example: 'from jinja2 import Environment\nenv = Environment(autoescape=True)\nenv.filters["iki_kat"] = lambda x: x * 2\nprint(env.from_string("{% for a in l %}[{{ a|iki_kat }}]{% else %}boş{% endfor %}").render(l=[1, 2]))\n',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nfrom jinja2 import Environment\n\ndef satirlar_html(liste):\n    env = Environment(autoescape=True)\n    # TODO: fiyat filtresi ve şablon\n    return ""\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nfrom jinja2 import Environment\n\ndef satirlar_html(liste):\n    env = Environment(autoescape=True)\n    env.filters["tl"] = lambda x: f"{x:,.0f}".replace(",", ".")\n    t = env.from_string(\n        \'{% for u in liste %}<tr id="urun-{{ u.product_id }}"><td>{{ u.name }}</td><td>{{ u.price|tl }} TL</td></tr>\'\n        \'{% else %}<tr><td colspan="2">Sonuç yok</td></tr>{% endfor %}\')\n    return t.render(liste=liste)\n',
        tests: 'assert satirlar_html([urunler[29]]) == \'<tr id="urun-30"><td>Koşu Bandı</td><td>15.999 TL</td></tr>\', "Binlik ayırıcı nokta olmalı"\nassert satirlar_html([]) == \'<tr><td colspan="2">Sonuç yok</td></tr>\'\nh = satirlar_html([urunler[6], urunler[37]])\nassert h == \'<tr id="urun-7"><td>27&#34; Monitör</td><td>7.499 TL</td></tr><tr id="urun-38"><td>Dudak Balmı</td><td>79 TL</td></tr>\', f"Ad içindeki tırnak kaçırılmalı; gelen {h}"\nkotu = {"product_id": 99, "name": "<script>alert(1)</script>", "price": 1.0}\nassert "<script>" not in satirlar_html([kotu]), "autoescape açık olmalı"\n',
        hints: ['Jinja\'da {% for %} ... {% else %} ... {% endfor %} boş liste durumunu yakalar.', 'Python biçimlendirmesi binlik ayırıcı olarak virgül koyar; replace ile noktaya çevir.'],
        why: 'HTMX parçası, tam sayfada {% include %} ile kullanılan şablonun aynısıdır. Gerçek üründe "27\\" Monitör" adındaki çift tırnak bile kaçırılır; autoescape kapalı olsaydı kötü niyetli bir ürün adı betik çalıştırabilirdi.' },
      { t: 'code',
        id: 'flask-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Görünümün karar mantığını yaz: <code>yanit_uret(basliklar, parca)</code>. <code>basliklar</code> istek başlık sözlüğü, <code>parca</code> hazır HTML parçası. Dönüş <code>(govde, yanit_basliklari)</code>:</p><ul><li><code>HX-Request</code> değeri <code>"true"</code> ise gövde yalnız parça.</li><li>Değilse gövde <code>&lt;!doctype html&gt;&lt;html&gt;&lt;body&gt;&lt;table&gt;&lt;tbody id="sonuclar"&gt;</code> + parça + <code>&lt;/tbody&gt;&lt;/table&gt;&lt;/body&gt;&lt;/html&gt;</code>.</li><li>Her iki durumda da yanıt başlıklarında <code>{"Vary": "HX-Request"}</code> olsun (önbellekler iki yanıtı karıştırmasın).</li><li>Başlık adları büyük/küçük harf duyarsız okunmalı (<code>hx-request</code> da geçerli).</li></ul>',
        start: 'def yanit_uret(basliklar, parca):\n    pass\n',
        sol: 'def yanit_uret(basliklar, parca):\n    kucuk = {k.lower(): v for k, v in basliklar.items()}\n    yb = {"Vary": "HX-Request"}\n    if kucuk.get("hx-request") == "true":\n        return parca, yb\n    sayfa = (\'<!doctype html><html><body><table><tbody id="sonuclar">\' + parca\n             + "</tbody></table></body></html>")\n    return sayfa, yb\n',
        tests: 'p = "<tr><td>Bakır Cezve</td></tr>"\nassert yanit_uret({"HX-Request": "true"}, p) == (p, {"Vary": "HX-Request"})\nassert yanit_uret({"hx-request": "true"}, p)[0] == p, "Başlık adı harf duyarsız okunmalı"\ng, b = yanit_uret({}, p)\nassert g == \'<!doctype html><html><body><table><tbody id="sonuclar"><tr><td>Bakır Cezve</td></tr></tbody></table></body></html>\'\nassert b == {"Vary": "HX-Request"}, "Tam sayfada da Vary olmalı"\nassert yanit_uret({"HX-Request": "false"}, p)[0].startswith("<!doctype"), "Yalnız \'true\' değeri parça döndürür"\n',
        hints: ['HTTP başlık adları büyük/küçük harf duyarsızdır; sözlüğü küçük harf anahtarlarla yeniden kur.', 'Vary başlığı her iki dalda da dönmeli.'],
        why: 'Aynı adres iki farklı içerik döndürdüğü için Vary başlığı tarayıcı ve CDN önbelleğine "yanıt HX-Request başlığına göre değişir" der; yoksa geri tuşunda kullanıcı çıplak bir tablo parçası görebilir.' },
      { t: 'code',
        id: 'flask-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>fetch</code> ile gelen JSON\'u işleyen uç noktanın mantığı: <code>sepet_hesapla(govde_metni)</code> <code>(durum, sozluk)</code> döndürsün. Kurallar:</p><ul><li>Gövde geçerli JSON nesnesi değilse <code>(400, {"hata": "geçersiz JSON"})</code>.</li><li><code>kalemler</code> anahtarı boş olmayan liste olmalı; her kalem <code>{"urun_id": int, "adet": int}</code>. Ürün gerçek <code>products</code> tablosunda yoksa <code>(404, {"hata": "ürün yok: ID"})</code>; adet 1–10 dışında ya da int değilse <code>(422, {"hata": "geçersiz adet"})</code>; kalemler eksik/boşsa <code>(422, {"hata": "kalemler gerekli"})</code>.</li><li>Başarıda <code>(200, {"adet": toplam_adet, "tutar": toplam_tutar})</code>; tutar gerçek fiyatlarla, <code>round(..., 2)</code>.</li></ul><p><code>bool</code> değerler adet olarak kabul edilmemeli (<code>True</code> bir int alt sınıfıdır).</p>',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport json\n\ndef sepet_hesapla(govde_metni):\n    pass\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport json\n\nFIYAT = {u["product_id"]: u["price"] for u in urunler}\n\ndef sepet_hesapla(govde_metni):\n    try:\n        govde = json.loads(govde_metni)\n    except (json.JSONDecodeError, TypeError):\n        return 400, {"hata": "geçersiz JSON"}\n    if not isinstance(govde, dict):\n        return 400, {"hata": "geçersiz JSON"}\n    kalemler = govde.get("kalemler")\n    if not isinstance(kalemler, list) or not kalemler:\n        return 422, {"hata": "kalemler gerekli"}\n    adet_toplam, tutar = 0, 0.0\n    for k in kalemler:\n        uid, adet = k.get("urun_id"), k.get("adet")\n        if uid not in FIYAT:\n            return 404, {"hata": f"ürün yok: {uid}"}\n        if type(adet) is not int or not 1 <= adet <= 10:\n            return 422, {"hata": "geçersiz adet"}\n        adet_toplam += adet\n        tutar += FIYAT[uid] * adet\n    return 200, {"adet": adet_toplam, "tutar": round(tutar, 2)}\n',
        tests: 'assert sepet_hesapla(\'{"kalemler": [{"urun_id": 19, "adet": 2}, {"urun_id": 20, "adet": 1}]}\') == (200, {"adet": 3, "tutar": 915.0}), "2 cezve (320) + 1 kupa seti (275) = 915"\nassert sepet_hesapla("{bozuk") == (400, {"hata": "geçersiz JSON"})\nassert sepet_hesapla("[1, 2]")[0] == 400, "Nesne olmayan JSON reddedilmeli"\nassert sepet_hesapla(\'{"kalemler": []}\') == (422, {"hata": "kalemler gerekli"})\nassert sepet_hesapla(\'{"kalemler": [{"urun_id": 99, "adet": 1}]}\') == (404, {"hata": "ürün yok: 99"})\nassert sepet_hesapla(\'{"kalemler": [{"urun_id": 1, "adet": 11}]}\')[0] == 422\nassert sepet_hesapla(\'{"kalemler": [{"urun_id": 1, "adet": true}]}\')[0] == 422, "true adet sayılmamalı"\nassert sepet_hesapla(\'{"kalemler": [{"urun_id": 30, "adet": 1}]}\')[1]["tutar"] == 15999.0\n',
        hints: ['Önce json.loads\'u try içine al; sonra tipleri sırayla denetle.', 'Ürün fiyatlarını bir sözlükte topla: {product_id: price}.', 'type(adet) is int ifadesi bool\'u dışarıda bırakır; isinstance bırakmaz.'],
        why: 'İstemciden gelen hiçbir değere güvenme: fiyat bile istemciden alınmaz, sunucudaki tablodan okunur. Doğru durum kodu (400 biçim, 404 bulunamadı, 422 doğrulama) JavaScript tarafının hatayı doğru göstermesini sağlar.' },
      { t: 'code',
        id: 'flask-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>sepete_ekle(istek)</code> görünümü hem klasik form gönderimini hem HTMX\'i desteklemeli: klasik istekte POST/Redirect/GET gereği <code>(302, "", {"Location": "/sepet"})</code>, HTMX isteğinde ise <b>200</b> ile güncel sepet rozeti parçası (<code>&lt;span id="sepet-rozet"&gt;N&lt;/span&gt;</code>) ve <code>{"HX-Trigger": "sepetGuncellendi"}</code> başlığı döndürmeli. Şu an HTMX isteklerinde de 302 dönüyor; HTMX yönlendirmeyi izleyip tüm sepet sayfasını küçük rozetin içine gömüyor. Ayrıca adet metin olarak gelince sepet sayısı yanlış artıyor.</p>',
        start: 'SEPET = {"adet": 0}\n\ndef sepete_ekle(istek):\n    adet = istek["form"].get("adet", "1")\n    SEPET["adet"] += len(adet)\n    return 302, "", {"Location": "/sepet"}\n',
        sol: 'SEPET = {"adet": 0}\n\ndef sepete_ekle(istek):\n    adet = int(istek["form"].get("adet", "1"))\n    SEPET["adet"] += adet\n    if istek["basliklar"].get("HX-Request") == "true":\n        govde = f\'<span id="sepet-rozet">{SEPET["adet"]}</span>\'\n        return 200, govde, {"HX-Trigger": "sepetGuncellendi"}\n    return 302, "", {"Location": "/sepet"}\n',
        tests: 'SEPET["adet"] = 0\nr = sepete_ekle({"form": {"adet": "12"}, "basliklar": {"HX-Request": "true"}})\nassert r == (200, \'<span id="sepet-rozet">12</span>\', {"HX-Trigger": "sepetGuncellendi"}), f"HTMX isteğine parça dönmeli; gelen {r}"\nr2 = sepete_ekle({"form": {"adet": "3"}, "basliklar": {}})\nassert r2 == (302, "", {"Location": "/sepet"}), "Klasik formda PRG korunmalı"\nassert SEPET["adet"] == 15, f"12 + 3 = 15 olmalı; gelen {SEPET[\'adet\']}"\n',
        hints: ['request.form değerleri her zaman metindir; len("12") 2 verir.', 'HX-Request başlığına göre iki farklı yanıt üret.'],
        why: 'HTMX, fetch gibi 3xx yanıtları tarayıcı düzeyinde izler ve hedef sayfanın tamamını hedef öğeye koyar. HTMX isteğinde parça döndürüp diğer bölgeleri HX-Trigger olayıyla güncellemek doğru kalıptır.' },
      { t: 'code',
        id: 'flask-w6',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>"Kaydırdıkça yükle" (infinite scroll) parçası. <code>sayfa_parcasi(kategori, sayfa, boyut=5)</code> gerçek ürünlerden <code>kategori</code>\'ye ait olanları (product_id sırasıyla) sayfalasın (sayfa 1\'den başlar) ve her ürün için <code>&lt;tr&gt;&lt;td&gt;{name}&lt;/td&gt;&lt;/tr&gt;</code> üretsin (ad HTML kaçışlı: <code>html.escape</code>). Sonraki sayfa varsa sona bir gözcü satırı ekle:</p><p><code>&lt;tr hx-get="/urunler?kategori=...&amp;amp;sayfa=N" hx-trigger="revealed" hx-swap="outerHTML"&gt;&lt;td&gt;Yükleniyor...&lt;/td&gt;&lt;/tr&gt;</code></p><p>Adres <code>urllib.parse.urlencode({"kategori": k, "sayfa": N})</code> ile kurulsun ve öznitelik içinde <code>html.escape</code> ile kaçırılsın (<code>&amp;</code> → <code>&amp;amp;</code>). Sayfa aralık dışındaysa boş metin döndür.</p>',
        start: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport html\nfrom urllib.parse import urlencode\n\ndef sayfa_parcasi(kategori, sayfa, boyut=5):\n    pass\n',
        sol: 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\nimport html\nfrom urllib.parse import urlencode\n\ndef sayfa_parcasi(kategori, sayfa, boyut=5):\n    secili = [u for u in urunler if u["category"] == kategori]\n    bas = (sayfa - 1) * boyut\n    if sayfa < 1 or bas >= len(secili):\n        return ""\n    parca = secili[bas:bas + boyut]\n    satirlar = "".join(f"<tr><td>{html.escape(u[\'name\'])}</td></tr>" for u in parca)\n    if bas + boyut < len(secili):\n        adres = "/urunler?" + urlencode({"kategori": kategori, "sayfa": sayfa + 1})\n        satirlar += (f\'<tr hx-get="{html.escape(adres)}" hx-trigger="revealed" hx-swap="outerHTML">\'\n                     "<td>Yükleniyor...</td></tr>")\n    return satirlar\n',
        tests: 'p1 = sayfa_parcasi("Elektronik", 1)\nassert p1.count("<tr><td>") == 5 and "Kablosuz Kulaklık" in p1, "İlk sayfada 5 ürün"\nassert p1.endswith(\'<tr hx-get="/urunler?kategori=Elektronik&amp;sayfa=2" hx-trigger="revealed" hx-swap="outerHTML"><td>Yükleniyor...</td></tr>\'), f"Gözcü satırı hatalı: {p1[-140:]}"\np2 = sayfa_parcasi("Elektronik", 2)\nassert "hx-get" not in p2 and p2.count("<tr>") == 3, "Elektronikte 8 ürün var: 2. sayfa 3 ürün, gözcü yok"\nassert "27&quot; Monitör" in p2, "Ad içindeki tırnak kaçırılmalı"\ne = sayfa_parcasi("Ev & Yaşam", 1)\nassert "kategori=Ev+%26+Ya%C5%9Fam&amp;sayfa=2" in e, "Kategori URL kodlanmalı, & öznitelikte kaçırılmalı"\nassert sayfa_parcasi("Kitap", 3) == "" and sayfa_parcasi("Kitap", 0) == ""\n',
        hints: ['Dilim başlangıcı (sayfa - 1) * boyut.', 'urlencode boşluğu + ve & karakterini %26 yapar; ardından html.escape adresi öznitelik için güvenli kılar.', 'Gözcü yalnız bas + boyut &lt; toplam ise eklenir.'],
        why: 'hx-trigger="revealed" satır ekranda görünür olunca isteği atar; outerHTML gözcü satırının kendisini yeni satırlarla değiştirir. Böylece JavaScript yazmadan sonsuz kaydırma elde edilir. URL kodlama ve HTML kaçışı iki ayrı katmandır ve ikisi de gerekir.' }
    ],
    faq: [
      { q: 'HTMX öğrenmek için JavaScript bilmem gerekir mi?',
        a: 'Temel kullanım için hayır: öznitelikler ve sunucunun döndürdüğü HTML yeter. Yine de tarayıcı geliştirici araçlarında Ağ (Network) sekmesini okuyabilmek, fetch ve olay (event) kavramlarını bilmek hata ayıklamayı çok kolaylaştırır. Karmaşık istemci durumları gerekiyorsa küçük bir Alpine.js ya da SPA bileşeni eklenebilir.' },
      { q: 'HTMX ile POST isteklerinde CSRF koruması nasıl olur?',
        a: 'Flask-WTF kullanıyorsan şablonda belirteci (token) bir meta etikete koy ve <code>hx-headers=\'{"X-CSRFToken": "..."}\'</code> özniteliğiyle <code>body</code> etiketine ekle; böylece tüm HTMX istekleri başlığı taşır. Form içi gönderimlerde gizli alan da yeterlidir. Django dersindeki ek bölümde aynı konuyu Django açısından görürsün.' }
    ],
    mistakes: [
      { bad: 'return redirect("/sepet")  # HTMX isteğinde de',
        good: 'if request.headers.get("HX-Request") == "true":\n    return render_template("_rozet.html", adet=n), 200, {"HX-Trigger": "sepetGuncellendi"}\nreturn redirect("/sepet")',
        why: 'HTMX yönlendirmeyi izler ve tam sayfayı küçük hedef öğenin içine koyar; HTMX isteklerine parça döndür.' }
    ] }
);
})(window);
