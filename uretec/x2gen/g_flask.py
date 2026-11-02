import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2gen')
from x2lib import *

H = []
H.append('<h2>Derinleş: HTMX ile kısmi güncelleme, form ve fetch ile JSON</h2>')
H.append('<p>Flask şablonları her istekte <b>tam sayfa</b> üretir. Modern arayüzlerde ise sayfanın yalnız bir parçası değişir: arama kutusuna yazdıkça liste süzülür, "Sepete ekle"ye basınca yalnız sepet rozeti güncellenir. Bunun üç yolu var ve bir web geliştiricisinin üçünü de tanıması gerekir.</p>')
H.append('<div class="tbl-wrap"><table><tr><th>Yaklaşım</th><th>Sunucu ne döndürür?</th><th>Artısı</th><th>Eksisi</th></tr>'
         '<tr><td>Sunucu tarafı oluşturma (SSR, klasik)</td><td>Tam HTML sayfa</td><td>Basit, SEO dostu, JavaScript gerekmez</td><td>Her tıklamada sayfa yenilenir</td></tr>'
         '<tr><td>HTMX ("HTML over the wire")</td><td>HTML parçası (partial)</td><td>SSR\'nin basitliği + kısmi güncelleme; tek dil Python</td><td>Çok zengin istemci etkileşiminde sınırlı</td></tr>'
         '<tr><td>SPA (React, Vue) + JSON API</td><td>JSON</td><td>Zengin, uygulama gibi arayüz; mobil ile aynı API</td><td>İki kod tabanı, derleme araçları, durum yönetimi</td></tr></table></div>')
H.append('<h3>Temel HTML formu</h3>')
H.append('<p>Her şeyin temeli, JavaScript olmadan da çalışan formdur. Alanların <code>name</code> özniteliği <code>request.form</code> anahtarını belirler; <code>label</code> ile <code>for</code> erişilebilirlik içindir; tarayıcı doğrulaması (<code>required</code>, <code>min</code>) kullanıcıya kolaylıktır ama sunucu doğrulamasının yerini tutmaz.</p>')
H.append(pc('''
<form method="post" action="/sepet">
  <label for="urun">Ürün</label>
  <select id="urun" name="urun_id">
    <option value="19">Bakır Cezve</option>
    <option value="20">Seramik Kupa Seti</option>
  </select>
  <label for="adet">Adet</label>
  <input id="adet" name="adet" type="number" min="1" max="10" value="1" required>
  <button type="submit">Sepete ekle</button>
</form>
'''))
H.append('<h3>HTMX: öznitelikle AJAX</h3>')
H.append('<p>HTMX küçük bir JavaScript kütüphanesidir; sayfaya tek <code>&lt;script&gt;</code> etiketiyle eklenir ve HTML\'e yeni öznitelikler kazandırır: <code>hx-get</code>/<code>hx-post</code> hangi adrese istek atılacağını, <code>hx-target</code> gelen HTML\'in nereye konacağını, <code>hx-swap</code> nasıl konacağını (<code>innerHTML</code>, <code>outerHTML</code>, <code>beforeend</code>), <code>hx-trigger</code> ne zaman tetikleneceğini söyler. Sunucu JSON değil <b>HTML parçası</b> döndürür.</p>')
H.append(pc('''
<script src="https://unpkg.com/htmx.org@2.0.4"></script>

<input type="search" name="q" placeholder="Ürün ara..."
       hx-get="/urunler" hx-trigger="input changed delay:300ms, search"
       hx-target="#sonuclar" hx-swap="innerHTML">
<table><tbody id="sonuclar">{% include "_urun_satirlari.html" %}</tbody></table>
'''))
H.append(pc('''
from flask import Flask, render_template, request

@app.get("/urunler")
def urunler():
    q = request.args.get("q", "")
    liste = urun_ara(q)
    if request.headers.get("HX-Request") == "true":            # HTMX isteği: yalnız parça
        return render_template("_urun_satirlari.html", urunler=liste)
    return render_template("urunler.html", urunler=liste, q=q)  # normal istek: tam sayfa
'''))
H.append('<p>HTMX her isteğe <code>HX-Request: true</code> başlığı ekler. Aynı adres böylece hem tam sayfayı (doğrudan açılınca, arama motoru gelince) hem parçayı (HTMX çağırınca) sunar; buna aşamalı geliştirme (progressive enhancement) denir. Parça şablonu (<code>_urun_satirlari.html</code>) tam sayfa şablonunda <code>{% include %}</code> ile kullanıldığı için HTML iki kez yazılmaz. Mantığı Anadolu Market\'in gerçek ürün tablosuyla tarayıcıda dene:</p>')
H.append(py('''
import veri
from jinja2 import Environment

urunler = veri.kayitlar("anadolu_market", "products")
env = Environment(autoescape=True)
parca = env.from_string(
    "{% for u in urunler %}<tr><td>{{ u.name }}</td><td>{{ u.category }}</td>"
    "<td>{{ '%.0f'|format(u.price) }} TL</td></tr>\\n{% endfor %}")

def yanit(basliklar, q):
    liste = [u for u in urunler if q.lower() in u["name"].lower()]
    govde = parca.render(urunler=liste)
    if basliklar.get("HX-Request") == "true":
        return govde
    return "<html><body><h1>Ürünler</h1><table>" + govde + "</table></body></html>"

print(yanit({"HX-Request": "true"}, "set"))
print(yanit({}, "kupa")[:60], "...")
'''))
H.append('<p>Kategori sütunundaki <code>Ev &amp; Yaşam</code> değerinin çıktıda <code>&amp;amp;</code> olarak kaçırıldığına dikkat et: autoescape parçalarda da geçerlidir ve XSS\'e karşı korur. Başarılı bir HTMX formundan sonra yönlendirme (302) yerine güncellenmiş parçayı döndür; başka bir bölgeyi de haberdar etmek için <code>HX-Trigger: sepetGuncellendi</code> yanıt başlığıyla bir olay yayınla.</p>')
H.append('<h3>fetch ile JSON çağrısı</h3>')
H.append('<p>Bir sayfada küçük bir JavaScript etkileşimi gerekiyorsa (sepet tutarını anında hesaplamak gibi) tarayıcının yerleşik <code>fetch</code> fonksiyonu yeterlidir. Flask tarafında <code>request.get_json()</code> gövdeyi okur, <code>jsonify</code> ya da sözlük döndürmek JSON yanıt üretir. Hatalarda da JSON ve doğru durum kodu dön ki istemci <code>r.ok</code> ile ayırt edebilsin.</p>')
H.append(pc('''
// static/sepet.js
const r = await fetch("/api/sepet", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({urun_id: 19, adet: 2}),
});
const veri = await r.json();
if (r.ok) { document.querySelector("#tutar").textContent = veri.tutar + " TL"; }
else { alert(veri.hata); }
'''))
H.append(pc('''
@app.post("/api/sepet")
def sepet_api():
    govde = request.get_json(silent=True) or {}
    durum, sonuc = sepet_hesapla(govde)        # doğrulama + hesap, saf Python
    return sonuc, durum                         # Flask sözlüğü JSON'a çevirir
'''))
H.append('<div class="note"><b>Gerçek işte</b>İç araçlar, yönetim panelleri ve küçük e-ticaret siteleri için Flask + Jinja + HTMX üçlüsü, ayrı bir React projesine göre çok daha az kodla aynı kullanıcı deneyimini verir. Mobil uygulama da aynı veriyi istiyorsa JSON API (FastAPI ya da Flask) ve SPA tercih edilir. Mülakatta "SSR mı SPA mı?" sorusunun iyi cevabı ihtiyaçtan başlar: SEO, etkileşim yoğunluğu, ekip becerisi ve kaç farklı istemcinin olduğu.</div>')
html = ''.join(H)

URUN = 'import veri\nurunler = veri.kayitlar("anadolu_market", "products")\n'
TRK = 'def tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n'

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Aynı <code>/urunler</code> adresi bazen tam sayfa, bazen yalnız tablo satırlarını döndürüyor. Flask görünümü hangisini döndüreceğine nasıl karar verir?',
    o=['URL\'nin sonuna HTMX kendiliğinden ?partial=1 ekler', 'HTMX isteğe HX-Request: true başlığını ekler; görünüm bu başlığa bakar', 'İstek POST ise parça, GET ise tam sayfa döndürülür', 'Flask, isteğin tarayıcıdan mı JavaScript\'ten mi geldiğini kendisi bilir'],
    a=1, why='HTMX her isteğe HX-Request başlığı koyar. Başlık yoksa istek normal gezinmedir (adres çubuğu, arama motoru) ve tam sayfa döner; böylece sayfa JavaScript olmadan da çalışır.'))
ex.append(dict(t='mc', stage='Isınma', q='Anadolu Market\'in ürün katalog sayfaları arama motorlarında iyi sıralanmalı, sayfalar hızlı açılmalı ve ekipte yalnız Python bilen iki geliştirici var. Hangisi en uygun başlangıçtır?',
    o=['Ayrı bir React SPA ve yalnız JSON dönen bir API', 'Flask ile sunucu tarafı oluşturma, gereken yerlerde HTMX ile kısmi güncelleme', 'Tüm sayfayı tek bir fetch çağrısıyla JSON\'dan JavaScript ile oluşturmak', 'Her ürün için elle yazılmış ayrı statik HTML dosyaları'],
    a=1, why='SSR, arama motorlarına hazır HTML verir ve ilk açılış hızlıdır; HTMX etkileşimi Python ve HTML ile ekler. SPA iki kod tabanı ve JavaScript uzmanlığı gerektirir; statik dosyalar fiyat ve stok değişince sürdürülemez.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Parça şablonu autoescape açıkken render ediliyor. Bu kod ne yazdırır?',
    code=d('''
        from jinja2 import Environment
        env = Environment(autoescape=True)
        t = env.from_string('<option value="{{ k }}">{{ k }}</option>')
        print(t.render(k='Ev & Yaşam'))
    '''),
    o=['<option value="Ev &amp; Yaşam">Ev &amp; Yaşam</option>', '<option value="Ev & Yaşam">Ev & Yaşam</option>', '<option value="Ev &amp; Yaşam">Ev & Yaşam</option>', '<option value="Ev%20%26%20Yaşam">Ev & Yaşam</option>'], a=0,
    why='autoescape her {{ }} çıktısında &, <, >, " ve \' karakterlerini HTML varlığına çevirir; öznitelik içinde de, metin içinde de. Tarayıcı &amp;amp; değerini ekranda & olarak gösterir ve form gönderiminde de & olarak yollar.'))
ex.append(dict(t='code', id='flask-w1', stage='Rehberli', diff=1,
    q='<p>Canlı arama kutusunun sunucu tarafı: <code>urun_ara(q, kategori=None)</code> Anadolu Market\'in gerçek ürünlerinden adı <code>q</code>\'yu içerenleri (Türkçe büyük/küçük harf duyarsız) döndürsün; <code>kategori</code> verilirse ona da eşit olsun. Boş ya da yalnız boşluk olan <code>q</code> tüm ürünleri (kategori süzgeciyle) verir. Sonuç <code>name</code>\'e göre değil, orijinal sırada (product_id) kalsın. <code>tr_kucuk</code> yardımcısı hazır.</p>',
    guide=['q\'nun başındaki ve sonundaki boşlukları at, tr_kucuk ile küçült.', 'Ürünleri gez; kategori verildiyse eşit olmayanları atla.', 'Ürün adının tr_kucuk hâli q\'yu içeriyorsa sonuca ekle.'],
    example='kelimeler = ["Çay", "Kahve", "Çaydanlık"]\nprint([k for k in kelimeler if "çay" in k.lower()])\n',
    start=URUN + TRK + '\ndef urun_ara(q, kategori=None):\n    sonuc = []\n    # TODO: q\'yu temizle ve küçült, ürünleri süz\n    return sonuc\n',
    sol=URUN + TRK + d('''

        def urun_ara(q, kategori=None):
            aranan = tr_kucuk(q.strip())
            sonuc = []
            for u in urunler:
                if kategori and u["category"] != kategori:
                    continue
                if aranan in tr_kucuk(u["name"]):
                    sonuc.append(u)
            return sonuc
    '''),
    tests=d('''
        adlar = lambda l: [u["name"] for u in l]
        assert adlar(urun_ara("krem")) == ["Nemlendirici Krem", "Güneş Kremi SPF50"], "krem iki üründe geçer"
        assert adlar(urun_ara("İNCE")) == ["İnce Memed"], "Türkçe İ/i doğru eşleşmeli"
        assert adlar(urun_ara("ince")) == ["İnce Memed"], "'ince' de İnce Memed\\'i bulmalı (lower() İ\\'yi bozar)"
        assert len(urun_ara("  ")) == 40, "Boş arama tüm 40 ürünü döndürmeli"
        assert adlar(urun_ara("set", "Ev & Yaşam")) == ["Çaydanlık Seti", "Seramik Kupa Seti"]
        assert urun_ara("set", "Spor")[0]["name"] == "Dambıl Seti 10kg"
    '''),
    hints=['Boş metin her metnin içinde geçer: "" in "abc" True\'dur; boş arama kendiliğinden hepsini verir.', 'Python\'un lower() metodu "İ" harfini iki karakterlik "i̇" yapar; bu yüzden tr_kucuk kullan.'],
    why='Canlı aramada her tuşa basışta bu fonksiyon çalışır; HTMX\'in delay:300ms ayarı istek sayısını azaltır. Türkçe harf dönüşümü doğru yapılmazsa "İnce Memed" hiç bulunamaz.'))
ex.append(dict(t='code', id='flask-w2', stage='Rehberli', diff=2,
    q='<p>Parça şablonunu yaz: <code>satirlar_html(liste)</code> jinja2 ile (<code>autoescape=True</code>) her ürün için tam olarak şu satırı üretsin ve hepsini birleştirip döndürsün: <code>&lt;tr id="urun-{product_id}"&gt;&lt;td&gt;{name}&lt;/td&gt;&lt;td&gt;{fiyat} TL&lt;/td&gt;&lt;/tr&gt;</code>. Fiyat binlik ayırıcı nokta ile ve kuruşsuz yazılsın (<code>15999.0</code> → <code>15.999</code>). Liste boşsa tek satır: <code>&lt;tr&gt;&lt;td colspan="2"&gt;Sonuç yok&lt;/td&gt;&lt;/tr&gt;</code>. Satırlar arasında boşluk ya da yeni satır olmasın.</p>',
    guide=['Environment(autoescape=True) kur.', 'Fiyatı biçimleyen bir filtre yaz: f"{x:,.0f}".replace(",", ".") ve env.filters\'a ekle.', 'Şablonda for ... else kullan: else bloğu liste boşken çalışır.', 'Şablonu tek satır yaz ki araya boşluk girmesin.'],
    example='from jinja2 import Environment\nenv = Environment(autoescape=True)\nenv.filters["iki_kat"] = lambda x: x * 2\nprint(env.from_string("{% for a in l %}[{{ a|iki_kat }}]{% else %}boş{% endfor %}").render(l=[1, 2]))\n',
    start=URUN + 'from jinja2 import Environment\n\ndef satirlar_html(liste):\n    env = Environment(autoescape=True)\n    # TODO: fiyat filtresi ve şablon\n    return ""\n',
    sol=URUN + d('''
        from jinja2 import Environment

        def satirlar_html(liste):
            env = Environment(autoescape=True)
            env.filters["tl"] = lambda x: f"{x:,.0f}".replace(",", ".")
            t = env.from_string(
                '{% for u in liste %}<tr id="urun-{{ u.product_id }}"><td>{{ u.name }}</td><td>{{ u.price|tl }} TL</td></tr>'
                '{% else %}<tr><td colspan="2">Sonuç yok</td></tr>{% endfor %}')
            return t.render(liste=liste)
    '''),
    tests=d('''
        assert satirlar_html([urunler[29]]) == '<tr id="urun-30"><td>Koşu Bandı</td><td>15.999 TL</td></tr>', "Binlik ayırıcı nokta olmalı"
        assert satirlar_html([]) == '<tr><td colspan="2">Sonuç yok</td></tr>'
        h = satirlar_html([urunler[6], urunler[37]])
        assert h == '<tr id="urun-7"><td>27&#34; Monitör</td><td>7.499 TL</td></tr><tr id="urun-38"><td>Dudak Balmı</td><td>79 TL</td></tr>', f"Ad içindeki tırnak kaçırılmalı; gelen {h}"
        kotu = {"product_id": 99, "name": "<script>alert(1)</script>", "price": 1.0}
        assert "<script>" not in satirlar_html([kotu]), "autoescape açık olmalı"
    '''),
    hints=['Jinja\'da {% for %} ... {% else %} ... {% endfor %} boş liste durumunu yakalar.', 'Python biçimlendirmesi binlik ayırıcı olarak virgül koyar; replace ile noktaya çevir.'],
    why='HTMX parçası, tam sayfada {% include %} ile kullanılan şablonun aynısıdır. Gerçek üründe "27\\" Monitör" adındaki çift tırnak bile kaçırılır; autoescape kapalı olsaydı kötü niyetli bir ürün adı betik çalıştırabilirdi.'))
ex.append(dict(t='code', id='flask-w3', stage='Kendin yaz', diff=2,
    q='<p>Görünümün karar mantığını yaz: <code>yanit_uret(basliklar, parca)</code>. <code>basliklar</code> istek başlık sözlüğü, <code>parca</code> hazır HTML parçası. Dönüş <code>(govde, yanit_basliklari)</code>:</p><ul><li><code>HX-Request</code> değeri <code>"true"</code> ise gövde yalnız parça.</li><li>Değilse gövde <code>&lt;!doctype html&gt;&lt;html&gt;&lt;body&gt;&lt;table&gt;&lt;tbody id="sonuclar"&gt;</code> + parça + <code>&lt;/tbody&gt;&lt;/table&gt;&lt;/body&gt;&lt;/html&gt;</code>.</li><li>Her iki durumda da yanıt başlıklarında <code>{"Vary": "HX-Request"}</code> olsun (önbellekler iki yanıtı karıştırmasın).</li><li>Başlık adları büyük/küçük harf duyarsız okunmalı (<code>hx-request</code> da geçerli).</li></ul>',
    start='def yanit_uret(basliklar, parca):\n    pass\n',
    sol=d('''
        def yanit_uret(basliklar, parca):
            kucuk = {k.lower(): v for k, v in basliklar.items()}
            yb = {"Vary": "HX-Request"}
            if kucuk.get("hx-request") == "true":
                return parca, yb
            sayfa = ('<!doctype html><html><body><table><tbody id="sonuclar">' + parca
                     + "</tbody></table></body></html>")
            return sayfa, yb
    '''),
    tests=d('''
        p = "<tr><td>Bakır Cezve</td></tr>"
        assert yanit_uret({"HX-Request": "true"}, p) == (p, {"Vary": "HX-Request"})
        assert yanit_uret({"hx-request": "true"}, p)[0] == p, "Başlık adı harf duyarsız okunmalı"
        g, b = yanit_uret({}, p)
        assert g == '<!doctype html><html><body><table><tbody id="sonuclar"><tr><td>Bakır Cezve</td></tr></tbody></table></body></html>'
        assert b == {"Vary": "HX-Request"}, "Tam sayfada da Vary olmalı"
        assert yanit_uret({"HX-Request": "false"}, p)[0].startswith("<!doctype"), "Yalnız 'true' değeri parça döndürür"
    '''),
    hints=['HTTP başlık adları büyük/küçük harf duyarsızdır; sözlüğü küçük harf anahtarlarla yeniden kur.', 'Vary başlığı her iki dalda da dönmeli.'],
    why='Aynı adres iki farklı içerik döndürdüğü için Vary başlığı tarayıcı ve CDN önbelleğine "yanıt HX-Request başlığına göre değişir" der; yoksa geri tuşunda kullanıcı çıplak bir tablo parçası görebilir.'))
ex.append(dict(t='code', id='flask-w4', stage='Kendin yaz', diff=2,
    q='<p><code>fetch</code> ile gelen JSON\'u işleyen uç noktanın mantığı: <code>sepet_hesapla(govde_metni)</code> <code>(durum, sozluk)</code> döndürsün. Kurallar:</p><ul><li>Gövde geçerli JSON nesnesi değilse <code>(400, {"hata": "geçersiz JSON"})</code>.</li><li><code>kalemler</code> anahtarı boş olmayan liste olmalı; her kalem <code>{"urun_id": int, "adet": int}</code>. Ürün gerçek <code>products</code> tablosunda yoksa <code>(404, {"hata": "ürün yok: ID"})</code>; adet 1–10 dışında ya da int değilse <code>(422, {"hata": "geçersiz adet"})</code>; kalemler eksik/boşsa <code>(422, {"hata": "kalemler gerekli"})</code>.</li><li>Başarıda <code>(200, {"adet": toplam_adet, "tutar": toplam_tutar})</code>; tutar gerçek fiyatlarla, <code>round(..., 2)</code>.</li></ul><p><code>bool</code> değerler adet olarak kabul edilmemeli (<code>True</code> bir int alt sınıfıdır).</p>',
    start=URUN + 'import json\n\ndef sepet_hesapla(govde_metni):\n    pass\n',
    sol=URUN + d('''
        import json

        FIYAT = {u["product_id"]: u["price"] for u in urunler}

        def sepet_hesapla(govde_metni):
            try:
                govde = json.loads(govde_metni)
            except (json.JSONDecodeError, TypeError):
                return 400, {"hata": "geçersiz JSON"}
            if not isinstance(govde, dict):
                return 400, {"hata": "geçersiz JSON"}
            kalemler = govde.get("kalemler")
            if not isinstance(kalemler, list) or not kalemler:
                return 422, {"hata": "kalemler gerekli"}
            adet_toplam, tutar = 0, 0.0
            for k in kalemler:
                uid, adet = k.get("urun_id"), k.get("adet")
                if uid not in FIYAT:
                    return 404, {"hata": f"ürün yok: {uid}"}
                if type(adet) is not int or not 1 <= adet <= 10:
                    return 422, {"hata": "geçersiz adet"}
                adet_toplam += adet
                tutar += FIYAT[uid] * adet
            return 200, {"adet": adet_toplam, "tutar": round(tutar, 2)}
    '''),
    tests=d('''
        assert sepet_hesapla('{"kalemler": [{"urun_id": 19, "adet": 2}, {"urun_id": 20, "adet": 1}]}') == (200, {"adet": 3, "tutar": 915.0}), "2 cezve (320) + 1 kupa seti (275) = 915"
        assert sepet_hesapla("{bozuk") == (400, {"hata": "geçersiz JSON"})
        assert sepet_hesapla("[1, 2]")[0] == 400, "Nesne olmayan JSON reddedilmeli"
        assert sepet_hesapla('{"kalemler": []}') == (422, {"hata": "kalemler gerekli"})
        assert sepet_hesapla('{"kalemler": [{"urun_id": 99, "adet": 1}]}') == (404, {"hata": "ürün yok: 99"})
        assert sepet_hesapla('{"kalemler": [{"urun_id": 1, "adet": 11}]}')[0] == 422
        assert sepet_hesapla('{"kalemler": [{"urun_id": 1, "adet": true}]}')[0] == 422, "true adet sayılmamalı"
        assert sepet_hesapla('{"kalemler": [{"urun_id": 30, "adet": 1}]}')[1]["tutar"] == 15999.0
    '''),
    hints=['Önce json.loads\'u try içine al; sonra tipleri sırayla denetle.', 'Ürün fiyatlarını bir sözlükte topla: {product_id: price}.', 'type(adet) is int ifadesi bool\'u dışarıda bırakır; isinstance bırakmaz.'],
    why='İstemciden gelen hiçbir değere güvenme: fiyat bile istemciden alınmaz, sunucudaki tablodan okunur. Doğru durum kodu (400 biçim, 404 bulunamadı, 422 doğrulama) JavaScript tarafının hatayı doğru göstermesini sağlar.'))
ex.append(dict(t='code', id='flask-w5', stage='Hata avı', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>sepete_ekle(istek)</code> görünümü hem klasik form gönderimini hem HTMX\'i desteklemeli: klasik istekte POST/Redirect/GET gereği <code>(302, "", {"Location": "/sepet"})</code>, HTMX isteğinde ise <b>200</b> ile güncel sepet rozeti parçası (<code>&lt;span id="sepet-rozet"&gt;N&lt;/span&gt;</code>) ve <code>{"HX-Trigger": "sepetGuncellendi"}</code> başlığı döndürmeli. Şu an HTMX isteklerinde de 302 dönüyor; HTMX yönlendirmeyi izleyip tüm sepet sayfasını küçük rozetin içine gömüyor. Ayrıca adet metin olarak gelince sepet sayısı yanlış artıyor.</p>',
    start=d('''
        SEPET = {"adet": 0}

        def sepete_ekle(istek):
            adet = istek["form"].get("adet", "1")
            SEPET["adet"] += len(adet)
            return 302, "", {"Location": "/sepet"}
    '''),
    sol=d('''
        SEPET = {"adet": 0}

        def sepete_ekle(istek):
            adet = int(istek["form"].get("adet", "1"))
            SEPET["adet"] += adet
            if istek["basliklar"].get("HX-Request") == "true":
                govde = f'<span id="sepet-rozet">{SEPET["adet"]}</span>'
                return 200, govde, {"HX-Trigger": "sepetGuncellendi"}
            return 302, "", {"Location": "/sepet"}
    '''),
    tests=d('''
        SEPET["adet"] = 0
        r = sepete_ekle({"form": {"adet": "12"}, "basliklar": {"HX-Request": "true"}})
        assert r == (200, '<span id="sepet-rozet">12</span>', {"HX-Trigger": "sepetGuncellendi"}), f"HTMX isteğine parça dönmeli; gelen {r}"
        r2 = sepete_ekle({"form": {"adet": "3"}, "basliklar": {}})
        assert r2 == (302, "", {"Location": "/sepet"}), "Klasik formda PRG korunmalı"
        assert SEPET["adet"] == 15, f"12 + 3 = 15 olmalı; gelen {SEPET['adet']}"
    '''),
    hints=['request.form değerleri her zaman metindir; len("12") 2 verir.', 'HX-Request başlığına göre iki farklı yanıt üret.'],
    why='HTMX, fetch gibi 3xx yanıtları tarayıcı düzeyinde izler ve hedef sayfanın tamamını hedef öğeye koyar. HTMX isteğinde parça döndürüp diğer bölgeleri HX-Trigger olayıyla güncellemek doğru kalıptır.'))
ex.append(dict(t='code', id='flask-w6', stage='Meydan okuma', diff=3,
    q='<p>"Kaydırdıkça yükle" (infinite scroll) parçası. <code>sayfa_parcasi(kategori, sayfa, boyut=5)</code> gerçek ürünlerden <code>kategori</code>\'ye ait olanları (product_id sırasıyla) sayfalasın (sayfa 1\'den başlar) ve her ürün için <code>&lt;tr&gt;&lt;td&gt;{name}&lt;/td&gt;&lt;/tr&gt;</code> üretsin (ad HTML kaçışlı: <code>html.escape</code>). Sonraki sayfa varsa sona bir gözcü satırı ekle:</p><p><code>&lt;tr hx-get="/urunler?kategori=...&amp;amp;sayfa=N" hx-trigger="revealed" hx-swap="outerHTML"&gt;&lt;td&gt;Yükleniyor...&lt;/td&gt;&lt;/tr&gt;</code></p><p>Adres <code>urllib.parse.urlencode({"kategori": k, "sayfa": N})</code> ile kurulsun ve öznitelik içinde <code>html.escape</code> ile kaçırılsın (<code>&amp;</code> → <code>&amp;amp;</code>). Sayfa aralık dışındaysa boş metin döndür.</p>',
    start=URUN + 'import html\nfrom urllib.parse import urlencode\n\ndef sayfa_parcasi(kategori, sayfa, boyut=5):\n    pass\n',
    sol=URUN + d('''
        import html
        from urllib.parse import urlencode

        def sayfa_parcasi(kategori, sayfa, boyut=5):
            secili = [u for u in urunler if u["category"] == kategori]
            bas = (sayfa - 1) * boyut
            if sayfa < 1 or bas >= len(secili):
                return ""
            parca = secili[bas:bas + boyut]
            satirlar = "".join(f"<tr><td>{html.escape(u['name'])}</td></tr>" for u in parca)
            if bas + boyut < len(secili):
                adres = "/urunler?" + urlencode({"kategori": kategori, "sayfa": sayfa + 1})
                satirlar += (f'<tr hx-get="{html.escape(adres)}" hx-trigger="revealed" hx-swap="outerHTML">'
                             "<td>Yükleniyor...</td></tr>")
            return satirlar
    '''),
    tests=d('''
        p1 = sayfa_parcasi("Elektronik", 1)
        assert p1.count("<tr><td>") == 5 and "Kablosuz Kulaklık" in p1, "İlk sayfada 5 ürün"
        assert p1.endswith('<tr hx-get="/urunler?kategori=Elektronik&amp;sayfa=2" hx-trigger="revealed" hx-swap="outerHTML"><td>Yükleniyor...</td></tr>'), f"Gözcü satırı hatalı: {p1[-140:]}"
        p2 = sayfa_parcasi("Elektronik", 2)
        assert "hx-get" not in p2 and p2.count("<tr>") == 3, "Elektronikte 8 ürün var: 2. sayfa 3 ürün, gözcü yok"
        assert "27&quot; Monitör" in p2, "Ad içindeki tırnak kaçırılmalı"
        e = sayfa_parcasi("Ev & Yaşam", 1)
        assert "kategori=Ev+%26+Ya%C5%9Fam&amp;sayfa=2" in e, "Kategori URL kodlanmalı, & öznitelikte kaçırılmalı"
        assert sayfa_parcasi("Kitap", 3) == "" and sayfa_parcasi("Kitap", 0) == ""
    '''),
    hints=['Dilim başlangıcı (sayfa - 1) * boyut.', 'urlencode boşluğu + ve & karakterini %26 yapar; ardından html.escape adresi öznitelik için güvenli kılar.', 'Gözcü yalnız bas + boyut < toplam ise eklenir.'],
    why='hx-trigger="revealed" satır ekranda görünür olunca isteği atar; outerHTML gözcü satırının kendisini yeni satırlarla değiştirir. Böylece JavaScript yazmadan sonsuz kaydırma elde edilir. URL kodlama ve HTML kaçışı iki ayrı katmandır ve ikisi de gerekir.'))

faq = [
    dict(q='HTMX öğrenmek için JavaScript bilmem gerekir mi?', a='Temel kullanım için hayır: öznitelikler ve sunucunun döndürdüğü HTML yeter. Yine de tarayıcı geliştirici araçlarında Ağ (Network) sekmesini okuyabilmek, fetch ve olay (event) kavramlarını bilmek hata ayıklamayı çok kolaylaştırır. Karmaşık istemci durumları gerekiyorsa küçük bir Alpine.js ya da SPA bileşeni eklenebilir.'),
    dict(q='HTMX ile POST isteklerinde CSRF koruması nasıl olur?', a='Flask-WTF kullanıyorsan şablonda belirteci (token) bir meta etikete koy ve <code>hx-headers=\'{"X-CSRFToken": "..."}\'</code> özniteliğiyle <code>body</code> etiketine ekle; böylece tüm HTMX istekleri başlığı taşır. Form içi gönderimlerde gizli alan da yeterlidir. Django dersindeki ek bölümde aynı konuyu Django açısından görürsün.'),
]
mistakes = [dict(bad='return redirect("/sepet")  # HTMX isteğinde de', good='if request.headers.get("HX-Request") == "true":\n    return render_template("_rozet.html", adet=n), 200, {"HX-Trigger": "sepetGuncellendi"}\nreturn redirect("/sepet")', why='HTMX yönlendirmeyi izler ve tam sayfayı küçük hedef öğenin içine koyar; HTMX isteklerine parça döndür.')]
emit(dict(id='flask', min=25, html=html, ex=ex, faq=faq, mistakes=mistakes), 'HTMX ile kısmi güncelleme, temel form, fetch ile JSON, SSR ve SPA farkı (AUDIT Ekle-12)')
