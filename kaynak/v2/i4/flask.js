/* PythonPatika v2 — flask */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{id: 'flask',
  lv: 'ileri',
  mod: 'Web ve API',
  min: 60,
  title: 'Flask ile web uygulaması',
  sum: 'Flask uygulaması kurar; route, HTTP metotları, request/response, jsonify, Jinja2 şablonları, form doğrulama, hata işleyiciler, blueprint, uygulama fabrikası, test client ve gunicorn ile dağıtımı öğrenir, çatının içini mini bir yönlendirici yazarak kavrarsın.',
  goals: ['Flask uygulamasını kurup kendi bilgisayarımda geliştirme sunucusuyla çalıştırabilirim.', 'Route, yol parametresi, HTTP metodu ve doğru durum koduyla uç noktalar tasarlayabilirim.', 'Jinja2 şablonlarıyla güvenli (autoescape) HTML üretir, formları sunucu tarafında doğrularım.', 'Blueprint, uygulama fabrikası, yapılandırma ve test client ile sürdürülebilir proje kurarım.', 'Dekoratörle route kaydeden mini bir çatı yazarak Flask\'ın iç işleyişini açıklayabilirim.'],
  body: `
<h2>Neden önemli?</h2>
<p>API ve web dersinde HTTP'nin temellerini (metot, durum kodu, başlık, JSON gövde) ve bir API'yi istemci tarafından tüketmeyi gördün. Şimdi masanın öbür tarafına geçiyoruz: <b>sunucuyu</b> sen yazacaksın. <b>Flask</b>, Python'un en yaygın "mikro" web çatısıdır (micro framework): çekirdeği küçüktür, yalnız yönlendirme (routing), istek/yanıt ve şablon motorunu verir; veritabanı, oturum açma, form gibi ihtiyaçları eklentilerle seçersin. Şirket içi yönetim panelleri, raporlama ekranları, makine öğrenmesi modellerini sunan küçük servisler ve prototipler için çok sık tercih edilir.</p>
<p>Bu dersin özel bir yanı var: Flask bir sunucu çalıştırır ve ağ ister; bu yüzden <b>tarayıcıdaki Python motorunda çalışmaz</b>. Gerçek Flask kodunu gri kutularda göreceksin ve adım adım kendi bilgisayarında çalıştıracaksın. Alıştırmalarda ise Flask'ın içini taklit eden küçük parçaları (yönlendirici, yol parametresi ayrıştırıcı, şablon, form doğrulayıcı) kendin yazacaksın. Bir çatının içini yazan geliştirici, onu kullanırken hata ayıklamakta hiç zorlanmaz.</p>

<h2>İlk uygulama ve kurulum</h2>
<pre class="code"># app.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def ana_sayfa():
    return "Anadolu Market'e hoş geldin!"

@app.route("/saglik")
def saglik():
    return {"durum": "ok"}          # sözlük döndürmek otomatik JSON yanıtı üretir</pre>

<div class="steps-list"><ol>
<li>Proje klasörü aç ve sanal ortam kur: <code>python -m venv .venv</code>, ardından Windows'ta <code>.venv\\Scripts\\activate</code>, macOS/Linux'ta <code>source .venv/bin/activate</code>.</li>
<li>Flask'ı kur: <code>pip install flask</code></li>
<li>Yukarıdaki kodu <code>app.py</code> olarak kaydet.</li>
<li>Geliştirme sunucusunu başlat: <code>python -m flask --app app run --debug</code></li>
<li>Tarayıcıda <code>http://127.0.0.1:5000/</code> ve <code>http://127.0.0.1:5000/saglik</code> adreslerini aç. Kodu değiştirip kaydettiğinde <code>--debug</code> sayesinde sunucu kendini yeniden başlatır.</li>
</ol></div>
<div class="note"><b>Kendi bilgisayarında dene</b>Flask bu sayfadaki motorda çalışmaz. Gri kutulardaki (<code>pre.code</code>) kodları kendi bilgisayarında, sanal ortam içinde dene. Yeşil "Çalıştır" düğmeli kutular ise Flask'ın arkasındaki fikirleri standart kütüphane ve jinja2 ile gösterir; onları burada çalıştırabilirsin.</div>

<h2>Flask'ın kalbi: dekoratörle yönlendirme</h2>
<p><code>@app.route("/")</code> sihirli değildir. Dekoratörler dersinde gördüğün parametreli dekoratörün ta kendisidir: fonksiyonu bir kayda (URL kuralları tablosu) ekler ve fonksiyonu <b>değiştirmeden</b> geri döndürür. Gelen istekte Flask bu tabloda yol ve metodu arar, eşleşen fonksiyonu (view function) çağırır. Aşağıda bu mekanizmanın 20 satırlık bir modeli var.</p>
<pre class="py">class MiniFlask:
    def __init__(self):
        self.kurallar = {}                       # (metot, yol) -&gt; fonksiyon

    def route(self, yol, methods=("GET",)):
        def kaydet(fn):
            for m in methods:
                self.kurallar[(m, yol)] = fn
            return fn                            # fonksiyonu aynen geri ver
        return kaydet

    def dispatch(self, metot, yol):
        if (metot, yol) in self.kurallar:
            return self.kurallar[(metot, yol)](), 200
        if any(y == yol for _, y in self.kurallar):
            return "Method Not Allowed", 405
        return "Not Found", 404

app = MiniFlask()

@app.route("/")
def ana_sayfa():
    return "Hoş geldin"

@app.route("/sepet", methods=["GET", "POST"])
def sepet():
    return "Sepetin"

print(app.dispatch("GET", "/"))
print(app.dispatch("POST", "/sepet"))
print(app.dispatch("DELETE", "/sepet"))
print(app.dispatch("GET", "/yok"))</pre>

<p>404 (bulunamadı) ile 405 (metot izinli değil) arasındaki farka dikkat: yol hiç yoksa 404, yol var ama bu metotla tanımlanmamışsa 405 döner. Gerçek Flask da tam olarak böyle davranır.</p>

<h2>Yol parametreleri ve HTTP metotları</h2>
<p>URL'nin bir parçasını değişken olarak almak için kuralda <code>&lt;ad&gt;</code> yazarsın; tür dönüştürücü (converter) eklersen Flask değeri dönüştürür ve uymayan URL'yi daha görünüm fonksiyonuna gelmeden 404 ile reddeder.</p>
<pre class="code">from flask import Flask, request, abort

app = Flask(__name__)
URUNLER = {1: {"ad": "Çay", "fiyat": 85.5}, 2: {"ad": "Kahve", "fiyat": 240.0}}

@app.get("/urunler/&lt;int:urun_id&gt;")             # @app.route(..., methods=["GET"]) kısayolu
def urun_getir(urun_id):
    if urun_id not in URUNLER:
        abort(404)
    return URUNLER[urun_id]

@app.route("/urunler", methods=["GET", "POST"])
def urunler():
    if request.method == "POST":
        veri = request.get_json()               # JSON gövde
        yeni_id = max(URUNLER) + 1
        URUNLER[yeni_id] = veri
        return {"id": yeni_id, **veri}, 201     # (gövde, durum kodu)
    kategori = request.args.get("kategori")     # ?kategori=İçecek
    sayfa = request.args.get("sayfa", 1, type=int)
    return {"sayfa": sayfa, "urunler": list(URUNLER.values())}</pre>

<div class="tbl-wrap"><table>
<tr><th>Dönüştürücü</th><th>Eşleşir</th><th>Örnek</th></tr>
<tr><td><code>&lt;ad&gt;</code> (string)</td><td>Eğik çizgi içermeyen metin</td><td><code>/sehir/İzmir</code></td></tr>
<tr><td><code>&lt;int:ad&gt;</code></td><td>Pozitif tam sayı</td><td><code>/urunler/42</code></td></tr>
<tr><td><code>&lt;float:ad&gt;</code></td><td>Ondalıklı sayı</td><td><code>/kur/32.5</code></td></tr>
<tr><td><code>&lt;path:ad&gt;</code></td><td>Eğik çizgi dahil metin</td><td><code>/dosya/rapor/2024/ocak.pdf</code></td></tr>
<tr><td><code>&lt;uuid:ad&gt;</code></td><td>UUID biçimi</td><td><code>/siparis/3f2a...</code></td></tr>
</table></div>
<p>Flask'ın yönlendiricisi (Werkzeug) kuralları düzenli ifadelere çevirerek eşler. Aynı fikri <code>re</code> ile kurabilirsin:</p>
<pre class="py">import re

DONUSTURUCU = {"int": (r"\\d+", int), "str": (r"[^/]+", str)}

def kural_derle(kural):
    tipler = {}
    def degistir(m):
        tip, ad = (m.group(1) or "str"), m.group(2)
        desen, cevir = DONUSTURUCU[tip]
        tipler[ad] = cevir
        return f"(?P&lt;{ad}&gt;{desen})"
    regex = re.sub(r"&lt;(?:(\\w+):)?(\\w+)&gt;", degistir, kural)
    return re.compile(f"^{regex}$"), tipler

desen, tipler = kural_derle("/musteri/&lt;int:no&gt;/siparis/&lt;durum&gt;")
for yol in ["/musteri/42/siparis/kargoda", "/musteri/abc/siparis/kargoda"]:
    m = desen.match(yol)
    print(yol, "-&gt;", {k: tipler[k](v) for k, v in m.groupdict().items()} if m else "404")</pre>


<h2>request ve response</h2>
<p>Görünüm fonksiyonu içinde <code>request</code> nesnesi o anki isteği temsil eder. Döndürdüğün değeri Flask bir yanıta (response) çevirir.</p>
<div class="tbl-wrap"><table>
<tr><th>İstek bilgisi</th><th>Flask'ta</th><th>Döndürülen değer</th><th>Flask ne yapar?</th></tr>
<tr><td>Sorgu dizesi <code>?sayfa=2</code></td><td><code>request.args.get("sayfa", 1, type=int)</code></td><td><code>"metin"</code></td><td>200, text/html</td></tr>
<tr><td>HTML form alanı</td><td><code>request.form["eposta"]</code></td><td><code>{"a": 1}</code> ya da liste</td><td>200, JSON (jsonify)</td></tr>
<tr><td>JSON gövde</td><td><code>request.get_json()</code></td><td><code>(govde, 201)</code></td><td>Durum kodunu ayarlar</td></tr>
<tr><td>Başlıklar</td><td><code>request.headers["Authorization"]</code></td><td><code>(govde, 200, {"X-Kaynak": "AM"})</code></td><td>Başlık ekler</td></tr>
<tr><td>Yüklenen dosya</td><td><code>request.files["fatura"]</code></td><td><code>redirect(url_for("liste"))</code></td><td>302 yönlendirme</td></tr>
</table></div>
<p>Sorgu dizesi her zaman <b>metin</b> gelir; <code>type=int</code> verirsen dönüştürme başarısız olduğunda Flask hata vermez, varsayılanı döndürür. Aynı davranışı standart kütüphaneyle şöyle görebilirsin:</p>
<pre class="py">from urllib.parse import urlsplit, parse_qs

url = "/urunler?kategori=%C4%B0%C3%A7ecek&amp;sayfa=2&amp;etiket=yeni&amp;etiket=indirim&amp;limit=abc"
parcalar = urlsplit(url)
args = parse_qs(parcalar.query)
print(parcalar.path)
print(args)

def get(args, anahtar, varsayilan=None, type=None):
    if anahtar not in args:
        return varsayilan
    deger = args[anahtar][0]
    try:
        return type(deger) if type else deger
    except ValueError:
        return varsayilan

print(get(args, "sayfa", 1, type=int), get(args, "limit", 20, type=int), get(args, "kategori"))</pre>


<h2>Şablonlar: Jinja2</h2>
<p>HTML sayfa üretirken Python içinde metin birleştirmek hem çirkin hem tehlikelidir. Flask, <b>Jinja2</b> şablon motorunu kullanır: <code>templates/</code> klasörüne HTML dosyası koyar, <code>render_template("liste.html", urunler=urunler)</code> ile değişkenleri gönderirsin. Şablonda <code>{{ ifade }}</code> değer basar, <code>{% for %}</code> ve <code>{% if %}</code> akış kurar, <code>|</code> ile filtre uygularsın. jinja2 bu motorda çalışır:</p>
<pre class="py">from jinja2 import Environment, DictLoader

sablonlar = {
    "taban.html": "&lt;title&gt;{% block baslik %}Anadolu Market{% endblock %}&lt;/title&gt;\\n{% block icerik %}{% endblock %}",
    "liste.html": """{% extends "taban.html" %}
{% block baslik %}Ürünler ({{ urunler|length }}){% endblock %}
{% block icerik %}
&lt;ul&gt;
{% for u in urunler %}  &lt;li class="{{ 'tukendi' if u.stok == 0 else 'var' }}"&gt;{{ u.ad }}: {{ "%.2f"|format(u.fiyat) }} TL&lt;/li&gt;
{% else %}  &lt;li&gt;Ürün yok&lt;/li&gt;
{% endfor %}&lt;/ul&gt;
&lt;p&gt;Yorum: {{ yorum }}&lt;/p&gt;
{% endblock %}""",
}
env = Environment(loader=DictLoader(sablonlar), autoescape=True, trim_blocks=True)
urunler = [{"ad": "Çay", "fiyat": 85.5, "stok": 10}, {"ad": "Kahve", "fiyat": 240, "stok": 0}]
print(env.get_template("liste.html").render(urunler=urunler, yorum="&lt;script&gt;alert(1)&lt;/script&gt;"))</pre>

<p>İki şeye dikkat: <code>{% extends %}</code> ve <code>{% block %}</code> ile tüm sayfaların ortak iskeletini tek dosyada tutarsın (şablon kalıtımı). <code>autoescape=True</code> kullanıcıdan gelen <code>&lt;script&gt;</code> gibi içeriği zararsız <code>&amp;lt;script&amp;gt;</code> metnine çevirir; Flask bunu <code>.html</code> şablonlarında varsayılan olarak açar. <code>|safe</code> filtresiyle kaçışı kapatmak, içeriğin güvenli olduğundan <b>emin olmadıkça</b> XSS (siteler arası betik) açığı demektir.</p>

<h2>Form işleme ve POST/Redirect/GET</h2>
<pre class="code">from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.config["SECRET_KEY"] = "gelistirme-icin"     # flash ve oturum için gerekli

@app.route("/iletisim", methods=["GET", "POST"])
def iletisim():
    hatalar = {}
    if request.method == "POST":
        ad = request.form.get("ad", "").strip()
        eposta = request.form.get("eposta", "").strip()
        if len(ad) &lt; 2:
            hatalar["ad"] = "Ad en az 2 karakter olmalı"
        if "@" not in eposta:
            hatalar["eposta"] = "Geçerli bir e-posta gir"
        if not hatalar:
            # ... kaydet ...
            flash("Mesajın alındı, teşekkürler!")
            return redirect(url_for("iletisim"))   # POST'tan sonra yönlendir
    return render_template("iletisim.html", hatalar=hatalar, form=request.form)</pre>

<p>Başarılı bir POST'tan sonra sayfayı doğrudan döndürmek yerine <b>yönlendirirsin</b> (POST/Redirect/GET kalıbı). Böylece kullanıcı sayfayı yenilediğinde form ikinci kez gönderilmez; çift sipariş, çift ödeme gibi sorunlar önlenir. <code>url_for("iletisim")</code> URL'yi fonksiyon adından üretir; URL değişse bile kod kırılmaz. Gerçek projelerde formlar <b>Flask-WTF</b> ile doğrulanır; bu eklenti CSRF (siteler arası istek sahteciliği) korumasını da ekler.</p>

<h2>Hata işleyiciler ve durum kodları</h2>
<pre class="code">from flask import Flask, jsonify, abort

app = Flask(__name__)

class StokYetersiz(Exception):
    pass

@app.errorhandler(404)
def bulunamadi(hata):
    return jsonify(hata="Kaynak bulunamadı"), 404

@app.errorhandler(StokYetersiz)
def stok_hatasi(hata):
    return jsonify(hata=str(hata)), 409

@app.errorhandler(500)
def sunucu_hatasi(hata):
    app.logger.exception("Beklenmeyen hata")
    return jsonify(hata="Sunucu hatası"), 500   # iç ayrıntıyı kullanıcıya sızdırma</pre>

<div class="tbl-wrap"><table>
<tr><th>Kod</th><th>Anlam</th><th>Ne zaman döndürürsün?</th></tr>
<tr><td>200 OK</td><td>Başarılı</td><td>GET, başarılı güncelleme</td></tr>
<tr><td>201 Created</td><td>Oluşturuldu</td><td>POST ile yeni kayıt</td></tr>
<tr><td>204 No Content</td><td>Gövdesiz başarı</td><td>DELETE</td></tr>
<tr><td>302/303</td><td>Yönlendirme</td><td>Form gönderiminden sonra</td></tr>
<tr><td>400 Bad Request</td><td>İstek bozuk</td><td>Geçersiz JSON, eksik alan</td></tr>
<tr><td>401 / 403</td><td>Kimlik yok / yetki yok</td><td>Giriş yapılmamış / izin yok</td></tr>
<tr><td>404 / 405</td><td>Yol yok / metot yok</td><td>Kayıt bulunamadı / yanlış metot</td></tr>
<tr><td>409 Conflict</td><td>Durum çakışması</td><td>Stok yetersiz, aynı e-posta kayıtlı</td></tr>
<tr><td>500</td><td>Sunucu hatası</td><td>Yakalanmamış istisna</td></tr>
</table></div>

<h2>Uygulama fabrikası, blueprint ve yapılandırma</h2>
<p>Büyüyen bir projede tüm route'ları tek dosyaya koymak sürdürülemez. <b>Blueprint</b>, ilgili route'ları (ör. ürünler, siparişler, yönetim) ayrı modüllerde gruplar ve bir URL ön ekiyle uygulamaya bağlar. <b>Uygulama fabrikası</b> (application factory) ise uygulamayı modül düzeyinde değil bir fonksiyonda oluşturur: test için farklı, üretim için farklı yapılandırmayla istediğin kadar bağımsız uygulama üretebilirsin.</p>
<pre class="code"># magaza/urunler.py
from flask import Blueprint
bp = Blueprint("urunler", __name__, url_prefix="/api/urunler")

@bp.get("/")
def liste():
    return {"urunler": []}

# magaza/__init__.py
import os
from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(SECRET_KEY="dev", VERITABANI="sqlite:///magaza.db")
    app.config.from_prefixed_env()           # FLASK_SECRET_KEY gibi ortam değişkenleri
    if test_config:
        app.config.update(test_config)
    from . import urunler
    app.register_blueprint(urunler.bp)
    return app

# Çalıştırma: python -m flask --app magaza run --debug</pre>

<div class="warn"><b>Gizli anahtarlar koda yazılmaz</b><code>SECRET_KEY</code>, veritabanı şifresi ve API anahtarları ortam değişkeninden ya da gizli yönetim servisinden okunur. Yapılandırma dersindeki kurallar burada da geçerli. <code>debug=True</code> üretimde asla açık olmamalı: hata sayfasındaki etkileşimli konsol, sunucuda kod çalıştırmaya izin verir.</div>

<h2>Test client ile test</h2>
<pre class="code"># tests/test_urunler.py   (pip install pytest)
import pytest
from magaza import create_app

@pytest.fixture
def client():
    app = create_app({"TESTING": True})
    return app.test_client()

def test_liste(client):
    yanit = client.get("/api/urunler/")
    assert yanit.status_code == 200
    assert yanit.get_json() == {"urunler": []}

def test_olmayan_yol(client):
    assert client.get("/yok").status_code == 404

def test_urun_ekle(client):
    yanit = client.post("/api/urunler/", json={"ad": "Çay", "fiyat": 85.5})
    assert yanit.status_code in (201, 405)</pre>

<p>Test client gerçek bir sunucu başlatmadan isteği uygulamaya doğrudan iletir; testler milisaniyeler içinde çalışır. Fabrika kalıbının asıl faydası burada ortaya çıkar: her test temiz bir uygulama alır.</p>

<h2>Eklentiler: Flask-SQLAlchemy ve Flask-Login (gösterim)</h2>
<pre class="code"># pip install flask-sqlalchemy flask-login
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_required, current_user
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()
login = LoginManager()

class Kullanici(UserMixin, db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    eposta: Mapped[str] = mapped_column(unique=True)

@login.user_loader
def yukle(kullanici_id):
    return db.session.get(Kullanici, int(kullanici_id))

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///magaza.db"
    app.config["SECRET_KEY"] = "dev"
    db.init_app(app)
    login.init_app(app)

    @app.get("/hesabim")
    @login_required
    def hesabim():
        return {"eposta": current_user.eposta}

    return app</pre>

<p>Flask-SQLAlchemy, SQLAlchemy dersinde öğrendiğin modelleri ve session'ı istek yaşam döngüsüne bağlar. Flask-Login oturum çerezini yönetir ve <code>@login_required</code> ile korunan sayfalara girişsiz erişimi engeller.</p>

<h2>Dağıtım: gunicorn</h2>
<p><code>flask run</code> yalnız geliştirme içindir; tek işlemlidir ve güvenlik için tasarlanmamıştır. Üretimde bir WSGI sunucusu kullanılır:</p>
<pre class="code">pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "magaza:create_app()"
# Windows'ta gunicorn çalışmaz; waitress kullan:
pip install waitress
waitress-serve --port=8000 --call magaza:create_app</pre>

<p>Önüne genellikle nginx gibi bir ters vekil (reverse proxy) konur: HTTPS, statik dosyalar ve yük dengeleme orada yapılır. Docker ve dağıtım dersinde bu yapıyı konteynere taşıyacaksın.</p>

<div class="note"><b>Gerçek işte</b>Anadolu Market'in depo ekibi, sabah sevkiyat listesini Excel'den kopyalıyordu. Bir geliştirici iki günde küçük bir Flask uygulaması yazdı: <code>/sevkiyat</code> sayfası veritabanından günün siparişlerini Jinja2 tablosuyla gösteriyor, <code>/sevkiyat/&lt;int:no&gt;/tamamla</code> POST isteği durumu güncelliyor, giriş Flask-Login ile korunuyor. Uygulama fabrikası sayesinde testler bellek içi SQLite ile, üretim PostgreSQL ile çalışıyor; gunicorn ve nginx arkasında şirket ağında yayında. Flask'ın gücü tam olarak bu: küçük bir iç araç için bir öğleden sonrada çalışan bir sistem.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>WSGI: Flask aslında bir fonksiyondur</h3>
<p>Flask uygulaması, WSGI standardına (PEP 3333) uyan çağrılabilir bir nesnedir: <code>app(environ, start_response)</code>. gunicorn her istekte bunu çağırır. Standart kütüphanedeki <code>wsgiref</code> ile en yalın WSGI uygulamasını yazıp sahte bir istekle çağırabilirsin:</p>
<pre class="py">import json

def uygulama(environ, start_response):
    yol = environ["PATH_INFO"]
    if yol == "/saglik":
        govde, durum = {"durum": "ok"}, "200 OK"
    else:
        govde, durum = {"hata": "bulunamadı"}, "404 NOT FOUND"
    veri = json.dumps(govde, ensure_ascii=False).encode("utf-8")
    start_response(durum, [("Content-Type", "application/json"), ("Content-Length", str(len(veri)))])
    return [veri]

def sahte_istek(yol):
    yakalanan = {}
    def start_response(durum, basliklar):
        yakalanan["durum"], yakalanan["basliklar"] = durum, dict(basliklar)
    govde = b"".join(uygulama({"REQUEST_METHOD": "GET", "PATH_INFO": yol}, start_response))
    return yakalanan["durum"], govde.decode()

print(sahte_istek("/saglik"))
print(sahte_istek("/yok"))</pre>

<h3>Bağlam yerelleri: request ve g</h3>
<p><code>request</code> küresel bir değişken gibi görünür ama her istek (ve her iş parçacığı) kendi değerini görür; Flask bunu bağlam yerelleri (context locals, <code>contextvars</code>) ile sağlar. İstek boyunca paylaşılacak nesneler (veritabanı bağlantısı, giriş yapan kullanıcı) <code>flask.g</code> içinde tutulur. Bu yüzden görünüm fonksiyonu dışında (ör. arka plan iş parçacığında) <code>request</code>'e erişmek "Working outside of request context" hatası verir.</p>
<h3>Flask mı, FastAPI mı, Django mı?</h3>
<p>Sunucu tarafında HTML üreten panellerde ve küçük servislerde Flask; tip ipuçlarından otomatik doğrulama ve dokümantasyon isteyen JSON API'lerde FastAPI; yönetim paneli, ORM, kimlik doğrulama hepsi hazır gelsin isteyen büyük içerik uygulamalarında Django öne çıkar. Bir sonraki ders FastAPI; karşılaştırma tablosunu orada bulacaksın.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Kural <code>@app.route("/urunler/&lt;int:urun_id&gt;")</code> tanımlı. Kullanıcı <code>/urunler/abc</code> adresine GET isteği atarsa ne olur?',
      o: ['Fonksiyon urun_id="abc" ile çağrılır', 'Flask 404 döndürür; fonksiyon hiç çağrılmaz', 'Fonksiyon çağrılır ve ValueError fırlar, 500 döner', 'Flask 400 Bad Request döndürür'],
      a: 1,
      why: 'int dönüştürücüsü yalnız rakamlardan oluşan parçayla eşleşir. "abc" hiçbir kuralla eşleşmediği için Werkzeug yönlendiricisi 404 üretir; görünüm fonksiyonuna hiç gelinmez, dönüştürme hatası da oluşmaz.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Sipariş formu POST ile başarıyla kaydedildi. Bundan sonra en doğru yanıt hangisi?',
      o: ['Aynı form şablonunu 200 ile yeniden döndürmek', 'Teşekkür sayfasına redirect (302/303) ile yönlendirmek', 'Boş bir 204 No Content yanıtı döndürmek', 'Kaydedilen siparişi 201 ile JSON olarak dönmek'],
      a: 1,
      why: 'POST/Redirect/GET kalıbı: yönlendirme sonrası tarayıcı GET yapar, kullanıcı sayfayı yenilese bile form tekrar gönderilmez. Şablonu doğrudan döndürmek yenilemede çift sipariş riskidir; 201 JSON ise HTML formu değil API istemcisi için uygundur.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Flask şablonunda <code>{{ yorum|safe }}</code> kullanılıyor ve <code>yorum</code> müşterinin yazdığı metin. Sorun nedir?',
      o: ['safe filtresi metni kırpar, uzun yorumlar kesilir', 'Otomatik kaçış kapanır; zararlı betik çalışabilir (XSS)', 'safe yalnızca sayılarla çalışır, metinde hata verir', 'Sorun yok; safe güvenli karakterleri seçer'],
      a: 1,
      why: '|safe Jinja2\'ye "bu içerik zaten güvenli HTML, kaçışlama" der. Kullanıcı girdisinde bu, &lt;script&gt; etiketinin sayfada çalışması demektir. Kullanıcıdan gelen veriyi hiçbir zaman safe ile işaretleme.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Jinja2 döngüsü ve filtreleri: bu kod ne yazdırır?',
      code: 'from jinja2 import Template\n\nt = Template("{% for u in urunler %}{{ loop.index }}.{{ u.ad|upper }}={{ \'%.1f\'|format(u.fiyat) }}{{ \', \' if not loop.last }}{% endfor %}")\nprint(t.render(urunler=[{"ad": "çay", "fiyat": 85.5}, {"ad": "kahve", "fiyat": 240}]))\n',
      o: ['1.ÇAY=85.5, 2.KAHVE=240.0', '0.ÇAY=85.5, 1.KAHVE=240.0', '1.ÇAY=85.5, 2.KAHVE=240.0, ', '1.çay=85.5, 2.kahve=240'],
      a: 0,
      why: 'loop.index 1\'den başlar (0 tabanlı olan loop.index0\'dır). upper Türkçe karakterleri de büyütür, "%.1f" biçimi 240\'ı 240.0 yapar. loop.last son turda True olduğu için sona virgül eklenmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Otomatik kaçış (autoescape): bu kod ne yazdırır?',
      code: 'from jinja2 import Environment\n\nenv = Environment(autoescape=True)\nt = env.from_string("<p>{{ yorum }}</p>")\nprint(t.render(yorum=\'<b>Harika</b> & hızlı\'))\n',
      o: ['<p><b>Harika</b> & hızlı</p>', '<p>&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı</p>', '<p>Harika & hızlı</p>', '&lt;p&gt;&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı&lt;/p&gt;'],
      a: 1,
      why: 'autoescape yalnız {{ }} ile basılan değeri kaçışlar; şablonun kendi HTML\'i (&lt;p&gt;) olduğu gibi kalır. Değerdeki &lt;, &gt; ve &amp; karakterleri HTML varlıklarına çevrilir, böylece tarayıcı onları etiket olarak yorumlamaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Dekoratörle route kaydı: bu kod ne yazdırır?',
      code: 'KURALLAR = {}\n\ndef route(yol, methods=("GET",)):\n    def kaydet(fn):\n        for m in methods:\n            KURALLAR[(m, yol)] = fn.__name__\n        return fn\n    return kaydet\n\n@route("/sepet", methods=["GET", "POST"])\ndef sepet():\n    return "sepet"\n\n@route("/")\ndef ana():\n    return "ana"\n\nprint(len(KURALLAR), KURALLAR[("POST", "/sepet")], sepet())\n',
      o: ['2 sepet sepet', '3 sepet sepet', '3 sepet None', '2 POST sepet'],
      a: 1,
      why: '/sepet iki metotla iki kural, / bir kural ekler: toplam 3. Kayıtta fonksiyonun adı tutulur. Dekoratör fonksiyonu aynen döndürdüğü için sepet() hâlâ normal çalışır ve "sepet" verir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Flask\'ın <code>@app.route</code> mekanizmasını taklit eden ve bir isteği yönlendiren programın satırlarını sırala.</p>',
      lines: ['kurallar = {}', 'def route(yol):', '    def kaydet(fn):', '        kurallar[yol] = fn', '        return fn', '    return kaydet', '@route("/saglik")', 'def saglik():', '    return {"durum": "ok"}', 'print(kurallar["/saglik"]())'],
      expect: '{\'durum\': \'ok\'}\n',
      hint: 'Kayıt sözlüğü en başta; parametreli dekoratör iki katmanlıdır: dış fonksiyon iç dekoratörü döndürür.',
      why: 'route("/saglik") çağrısı kaydet fonksiyonunu döndürür; kaydet saglik\'i sözlüğe ekleyip aynen geri verir. Sonra sözlükten fonksiyon bulunup çağrılır.' },
    { id: 'flask-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Flask\'ın yönlendiricisini taklit eden <code>MiniFlask</code> sınıfını tamamla.</p><ul><li><code>route(path, methods=("GET",))</code>: dekoratör; her metot için <code>(metot, path)</code> anahtarıyla fonksiyonu <code>self.kurallar</code>\'a kaydetsin ve fonksiyonu aynen döndürsün.</li><li><code>dispatch(method, path)</code>: kural varsa fonksiyonu çağırsın. Fonksiyon <code>(gövde, durum)</code> demeti döndürürse onu, aksi hâlde <code>(gövde, 200)</code> döndürsün. Yol başka bir metotla kayıtlıysa <code>("Method Not Allowed", 405)</code>, hiç yoksa <code>("Not Found", 404)</code>.</li></ul>',
      guide: ['route içinde kaydet(fn) adlı iç fonksiyon yaz; methods üzerinde dönüp self.kurallar[(m, path)] = fn yap ve fn\'i döndür.', 'route, kaydet fonksiyonunu döndürmeli (parametreli dekoratör).', 'dispatch\'te önce (method, path) anahtarına bak; varsa fonksiyonu çağır.', 'Sonuç demetse aynen, değilse (sonuc, 200) döndür.', 'Yoksa: kurallardaki yollardan biri path ise 405, değilse 404.'],
      example: 'class OlayYolu:\n    def __init__(self):\n        self.dinleyiciler = {}\n\n    def dinle(self, olay):\n        def kaydet(fn):\n            self.dinleyiciler[olay] = fn\n            return fn\n        return kaydet\n\nyol = OlayYolu()\n\n@yol.dinle("siparis_olustu")\ndef bildir(no):\n    return f"{no} için e-posta gönderildi"\n\nprint(yol.dinleyiciler["siparis_olustu"]("AM-7"))\n',
      start: 'class MiniFlask:\n    def __init__(self):\n        self.kurallar = {}\n\n    def route(self, path, methods=("GET",)):\n        def kaydet(fn):\n            # TODO: her metot için kaydet, fn\'i döndür\n            pass\n        return kaydet\n\n    def dispatch(self, method, path):\n        # TODO: 200 / 405 / 404 mantığı\n        return "Not Found", 404\n',
      sol: 'class MiniFlask:\n    def __init__(self):\n        self.kurallar = {}\n\n    def route(self, path, methods=("GET",)):\n        def kaydet(fn):\n            for m in methods:\n                self.kurallar[(m, path)] = fn\n            return fn\n        return kaydet\n\n    def dispatch(self, method, path):\n        fn = self.kurallar.get((method, path))\n        if fn is not None:\n            sonuc = fn()\n            return sonuc if isinstance(sonuc, tuple) else (sonuc, 200)\n        if any(p == path for _, p in self.kurallar):\n            return "Method Not Allowed", 405\n        return "Not Found", 404\n',
      tests: 'app = MiniFlask()\n\n@app.route("/")\ndef ana():\n    return "Hoş geldin"\n\n@app.route("/sepet", methods=["GET", "POST"])\ndef sepet():\n    return "Sepet", 201\n\nassert ana() == "Hoş geldin", "dekoratör fonksiyonu aynen döndürmeli (return fn)"\nassert app.dispatch("GET", "/") == ("Hoş geldin", 200), "demet olmayan sonuç 200 ile sarılmalı"\nassert app.dispatch("POST", "/sepet") == ("Sepet", 201), "fonksiyon demet döndürürse aynen iletilmeli"\nassert app.dispatch("GET", "/sepet") == ("Sepet", 201), "aynı fonksiyon iki metotla kayıtlı olmalı"\nassert app.dispatch("DELETE", "/sepet") == ("Method Not Allowed", 405), "yol var ama metot yoksa 405"\nassert app.dispatch("POST", "/") == ("Method Not Allowed", 405), "GET için tanımlı yola POST 405 almalı"\nassert app.dispatch("GET", "/yok") == ("Not Found", 404), "yol yoksa 404"\n',
      hints: ['Parametreli dekoratör: route(...) çağrısı kaydet\'i döndürür, Python da kaydet(fn)\'i çağırır.', 'isinstance(sonuc, tuple) ile demet olup olmadığını anla.', '405 için: any(p == path for _, p in self.kurallar)'],
      why: 'Flask\'ın URL haritası da (metot kümesi, kural) → görünüm fonksiyonu eşlemesidir. 404 ile 405 ayrımı, istemcinin hatasını doğru anlamasını sağlar: 405 yanıtı "bu adres var ama bu metotla değil" der.' },
    { id: 'flask-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>eslestir(kural, yol)</code> fonksiyonunu yaz. Flask kuralındaki parametreleri ayrıştırır:</p><ul><li><code>&lt;ad&gt;</code>: eğik çizgi içermeyen, boş olmayan metin (değer <code>str</code>)</li><li><code>&lt;int:ad&gt;</code>: yalnız rakamlardan oluşan parça (değer <code>int</code>)</li></ul><p>Eşleşirse parametre sözlüğünü, eşleşmezse <code>None</code> döndürsün. Yolun <b>tamamı</b> eşleşmeli. Örnek: <code>eslestir("/urun/&lt;int:id&gt;", "/urun/42")</code> → <code>{"id": 42}</code>.</p>',
      guide: ['Kuraldaki her &lt;...&gt; parçasını re.sub ile adlandırılmış gruba çevir: &lt;int:ad&gt; → (?P&lt;ad&gt;\\d+), &lt;ad&gt; → (?P&lt;ad&gt;[^/]+).', 'Hangi adın int olduğunu bir kümede tut.', 'Deseni ^ ve $ ile sarıp re.fullmatch (ya da match) kullan.', 'Eşleşmezse None; eşleşirse groupdict() içindeki int adlarını int\'e çevir.'],
      example: 'import re\n\nkural = "/rapor/<yil>"\ndesen = re.sub(r"<(\\w+)>", r"(?P<\\1>\\\\d{4})", kural)\nprint(desen)\nm = re.fullmatch(desen, "/rapor/2024")\nprint(m.groupdict() if m else None)\nprint(re.fullmatch(desen, "/rapor/24"))\n',
      start: 'import re\n\ndef eslestir(kural, yol):\n    int_adlar = set()\n\n    def cevir(m):\n        tip, ad = m.group(1), m.group(2)\n        # TODO: tip "int" ise ad\'ı int_adlar\'a ekle ve rakam grubu döndür\n        # TODO: değilse eğik çizgisiz metin grubu döndür\n        return ""\n\n    desen = re.sub(r"<(?:(\\w+):)?(\\w+)>", cevir, kural)\n    # TODO: tam eşleştir, None ya da dönüştürülmüş sözlük döndür\n    return None\n',
      sol: 'import re\n\ndef eslestir(kural, yol):\n    int_adlar = set()\n\n    def cevir(m):\n        tip, ad = m.group(1), m.group(2)\n        if tip == "int":\n            int_adlar.add(ad)\n            return f"(?P<{ad}>\\\\d+)"\n        return f"(?P<{ad}>[^/]+)"\n\n    desen = re.sub(r"<(?:(\\w+):)?(\\w+)>", cevir, kural)\n    m = re.fullmatch(desen, yol)\n    if m is None:\n        return None\n    return {k: int(v) if k in int_adlar else v for k, v in m.groupdict().items()}\n',
      tests: 'assert eslestir("/urun/<int:id>", "/urun/42") == {"id": 42}, "int parametresi int\'e çevrilmeli"\nassert eslestir("/urun/<int:id>", "/urun/abc") is None, "rakam olmayan değer int ile eşleşmemeli"\nassert eslestir("/sehir/<ad>", "/sehir/İzmir") == {"ad": "İzmir"}, "string parametresi metin olarak gelmeli"\nassert eslestir("/sehir/<ad>", "/sehir/a/b") is None, "string parametresi eğik çizgi içermemeli"\nassert eslestir("/musteri/<int:no>/siparis/<durum>", "/musteri/7/siparis/kargoda") == {"no": 7, "durum": "kargoda"}, "birden çok parametre"\nassert eslestir("/urunler", "/urunler") == {}, "parametresiz kural eşleşince boş sözlük"\nassert eslestir("/urunler", "/urunler/5") is None, "yolun tamamı eşleşmeli"\nassert eslestir("/sehir/<ad>", "/sehir/") is None, "boş parametre eşleşmemeli"\n',
      hints: ['re.sub\'a fonksiyon verirsen her eşleşme için çağrılır ve dönen metin yerine konur.', 'Adlandırılmış grup sözdizimi (?P&lt;ad&gt;desen); m.groupdict() {ad: değer} verir.', 'Tam eşleşme için re.fullmatch(desen, yol); sonra {k: int(v) if k in int_adlar else v ...}'],
      why: 'Werkzeug yönlendiricisi de kuralları derleyip düzenli ifadeyle eşler; dönüştürücüler hem deseni hem de dönüşümü tanımlar. Bu yüzden &lt;int:id&gt; ile tanımlı bir route\'ta id her zaman int gelir ve doğrulama yazman gerekmez.' },
    { id: 'flask-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>siparis_tablosu(siparisler)</code> fonksiyonunu yaz. jinja2 ile <code>autoescape=True</code> bir <code>Environment</code> kur ve şu çıktıyı üretecek şablonu render etsin (her sipariş bir satır; liste boşsa tek satır <code>&lt;tr&gt;&lt;td&gt;Sipariş yok&lt;/td&gt;&lt;/tr&gt;</code>):</p><pre class="out">&lt;tr&gt;&lt;td&gt;AM-1&lt;/td&gt;&lt;td&gt;Ayşe&lt;/td&gt;&lt;td&gt;120.00&lt;/td&gt;&lt;/tr&gt;</pre><p>Satırlar <code>\\n</code> ile ayrılsın, tutar iki basamaklı yazılsın. Müşteri adındaki HTML kaçışlanmalı.</p>',
      guide: ['from jinja2 import Environment; env = Environment(autoescape=True)', 'Şablonda {% for s in siparisler %} ... {% else %} ... {% endfor %} kullan.', 'Tutarı "%.2f"|format(s.tutar) ile biçimlendir.', 'Satır sonlarını yönetmek için satırları döngüde üretip join yerine şablonda {{ "\\n" if not loop.last }} kullanabilirsin.', 'env.from_string(sablon).render(siparisler=siparisler) sonucunu döndür.'],
      example: 'from jinja2 import Environment\n\nenv = Environment(autoescape=True)\nt = env.from_string("{% for p in personel %}<li>{{ p.ad }} ({{ p.bolum }})</li>{{ \'\\n\' if not loop.last }}{% else %}<li>Kimse yok</li>{% endfor %}")\nprint(t.render(personel=[{"ad": "Ali", "bolum": "İK"}, {"ad": "Ece", "bolum": "Satış & Pazarlama"}]))\nprint(t.render(personel=[]))\n',
      start: 'from jinja2 import Environment\n\nSABLON = (\n    "{% for s in siparisler %}"\n    "<tr><td>{{ s.no }}</td><td>TODO</td><td>TODO</td></tr>"\n    "{{ \'\\n\' if not loop.last }}"\n    "{% else %}"\n    "TODO"\n    "{% endfor %}"\n)\n\n\ndef siparis_tablosu(siparisler):\n    env = Environment()  # TODO: kaçışlama açık olmalı\n    return env.from_string(SABLON).render(siparisler=siparisler)\n',
      sol: 'from jinja2 import Environment\n\nSABLON = (\n    "{% for s in siparisler %}"\n    "<tr><td>{{ s.no }}</td><td>{{ s.musteri }}</td><td>{{ \'%.2f\'|format(s.tutar) }}</td></tr>"\n    "{{ \'\\n\' if not loop.last }}"\n    "{% else %}"\n    "<tr><td>Sipariş yok</td></tr>"\n    "{% endfor %}"\n)\n\n\ndef siparis_tablosu(siparisler):\n    env = Environment(autoescape=True)\n    return env.from_string(SABLON).render(siparisler=siparisler)\n',
      tests: 'veri = [{"no": "AM-1", "musteri": "Ayşe", "tutar": 120}, {"no": "AM-2", "musteri": "Mehmet", "tutar": 89.456}]\nbeklenen = "<tr><td>AM-1</td><td>Ayşe</td><td>120.00</td></tr>\\n<tr><td>AM-2</td><td>Mehmet</td><td>89.46</td></tr>"\nassert siparis_tablosu(veri) == beklenen, f"çıktı hatalı:\\n{siparis_tablosu(veri)}"\nassert siparis_tablosu([]) == "<tr><td>Sipariş yok</td></tr>", "boş listede \'Sipariş yok\' satırı"\nr = siparis_tablosu([{"no": "AM-3", "musteri": "<script>x</script>", "tutar": 1}])\nassert "&lt;script&gt;" in r and "<script>" not in r, "müşteri adı kaçışlanmalı (autoescape=True)"\n',
      hints: ['for döngüsünün {% else %} dalı liste boşsa çalışır.', 'Biçimlendirme filtresi: {{ "%.2f"|format(s.tutar) }}', 'Environment(autoescape=True) olmadan &lt;script&gt; olduğu gibi basılır.'],
      why: 'Flask\'ın render_template fonksiyonu arka planda tam olarak bunu yapar: autoescape açık bir Jinja2 ortamında şablonu bağlam değişkenleriyle render eder. Biçimlendirmeyi şablona, hesaplamayı Python\'a bırakmak görünümü sade tutar.' },
    { id: 'flask-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kayıt formu doğrulayıcısı yaz: <code>form_dogrula(form)</code>. <code>form</code>, <code>request.form</code> gibi metin değerli bir sözlüktür. <code>(temiz, hatalar)</code> demeti döndürsün:</p><ul><li><code>ad</code>: kırpılmış hâli 2-50 karakter olmalı.</li><li><code>eposta</code>: kırpılmış, küçük harfe çevrilmiş; <code>^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$</code> desenine uymalı.</li><li><code>yas</code>: tam sayıya çevrilebilmeli ve 18-120 arasında olmalı.</li><li><code>kvkk</code>: değeri <code>"on"</code> olmalı (işaretlenmiş onay kutusu).</li></ul><p>Eksik alan da geçersiz sayılır. <code>hatalar</code>: geçersiz alan adı → Türkçe mesaj. <code>temiz</code>: <b>yalnız geçerli</b> alanların temizlenmiş değerleri (<code>yas</code> int, <code>kvkk</code> <code>True</code>).</p>',
      start: 'import re\n\ndef form_dogrula(form):\n    temiz, hatalar = {}, {}\n    return temiz, hatalar\n',
      sol: 'import re\n\nEPOSTA = re.compile(r"^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$")\n\n\ndef form_dogrula(form):\n    temiz, hatalar = {}, {}\n    ad = form.get("ad", "").strip()\n    if 2 <= len(ad) <= 50:\n        temiz["ad"] = ad\n    else:\n        hatalar["ad"] = "Ad 2-50 karakter olmalı"\n    eposta = form.get("eposta", "").strip().lower()\n    if EPOSTA.match(eposta):\n        temiz["eposta"] = eposta\n    else:\n        hatalar["eposta"] = "Geçerli bir e-posta gir"\n    try:\n        yas = int(form.get("yas", ""))\n        if not 18 <= yas <= 120:\n            raise ValueError\n        temiz["yas"] = yas\n    except ValueError:\n        hatalar["yas"] = "Yaş 18-120 arasında bir sayı olmalı"\n    if form.get("kvkk") == "on":\n        temiz["kvkk"] = True\n    else:\n        hatalar["kvkk"] = "Aydınlatma metnini onaylamalısın"\n    return temiz, hatalar\n',
      tests: 't, h = form_dogrula({"ad": "  Ayşe Yılmaz ", "eposta": " Ayse@AnadoluMarket.com.tr ", "yas": "34", "kvkk": "on"})\nassert h == {}, f"geçerli formda hata olmamalı: {h}"\nassert t == {"ad": "Ayşe Yılmaz", "eposta": "ayse@anadolumarket.com.tr", "yas": 34, "kvkk": True}, f"temiz veri hatalı: {t}"\nt, h = form_dogrula({"ad": "A", "eposta": "ayse@", "yas": "on yedi"})\nassert set(h) == {"ad", "eposta", "yas", "kvkk"}, f"dört alan da hatalı olmalı, gelen {set(h)}"\nassert t == {}, "geçersiz alanlar temiz veride yer almamalı"\nt, h = form_dogrula({"ad": "Can", "eposta": "can@x.com", "yas": "17", "kvkk": "on"})\nassert set(h) == {"yas"} and "yas" not in t and t["ad"] == "Can", "yalnız yaş (18 altı) hatalı olmalı"\n_, h = form_dogrula({"ad": "Can", "eposta": "can x@y.com", "yas": "121", "kvkk": ""})\nassert set(h) == {"eposta", "yas", "kvkk"}, "boşluklu e-posta, 120 üstü yaş ve işaretsiz kvkk geçersiz"\nassert all(isinstance(m, str) and m for m in h.values()), "her hataya bir mesaj yazılmalı"\n',
      hints: ['Her alanı ayrı ele al; eksik alan için form.get(alan, "") kullan.', 'int("on yedi") ValueError fırlatır; aralık dışını da aynı except\'e düşürmek için raise ValueError kullanabilirsin.', 'Onay kutusu işaretliyse tarayıcı "on" gönderir, işaretsizse alanı hiç göndermez.'],
      why: 'Doğrulama sunucu tarafında yapılmalıdır; tarayıcıdaki kontroller kolayca atlatılır. Hataları alan adına göre döndürmek, şablonun her hatayı ilgili kutunun altında göstermesini sağlar. Flask-WTF ve pydantic aynı fikri hazır sunar.' },
    { id: 'flask-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Flask\'ın <code>jsonify</code> davranışını taklit eden <code>json_yanit(veri, durum=200)</code> fonksiyonunu yaz. <code>(govde, durum, basliklar)</code> döndürsün:</p><ul><li><code>govde</code>: <code>json.dumps(veri, ensure_ascii=False)</code>; durum <code>204</code> ise boş metin.</li><li><code>basliklar</code>: <code>{"Content-Type": "application/json", "Content-Length": bayt_uzunlugu}</code>; uzunluk gövdenin <b>UTF-8 bayt</b> sayısının metin hâli.</li><li><code>durum</code> 100-599 arasında bir <code>int</code> değilse <code>ValueError</code>.</li></ul><p>Ayrıca <code>hata_yaniti(durum, mesaj)</code> yaz: <code>json_yanit({"hata": mesaj, "durum": durum}, durum)</code> döndürsün; durum 400\'den küçükse <code>ValueError</code>.</p>',
      start: 'import json\n\ndef json_yanit(veri, durum=200):\n    pass\n\n\ndef hata_yaniti(durum, mesaj):\n    pass\n',
      sol: 'import json\n\ndef json_yanit(veri, durum=200):\n    if isinstance(durum, bool) or not isinstance(durum, int) or not 100 <= durum <= 599:\n        raise ValueError(f"Geçersiz durum kodu: {durum!r}")\n    govde = "" if durum == 204 else json.dumps(veri, ensure_ascii=False)\n    basliklar = {"Content-Type": "application/json",\n                 "Content-Length": str(len(govde.encode("utf-8")))}\n    return govde, durum, basliklar\n\n\ndef hata_yaniti(durum, mesaj):\n    if durum < 400:\n        raise ValueError("Hata yanıtı 4xx ya da 5xx olmalı")\n    return json_yanit({"hata": mesaj, "durum": durum}, durum)\n',
      tests: 'g, d, b = json_yanit({"sehir": "İzmir", "adet": 2}, 201)\nassert g == \'{"sehir": "İzmir", "adet": 2}\', "Türkçe karakterler kaçışsız (ensure_ascii=False) yazılmalı"\nassert d == 201 and b["Content-Type"] == "application/json", "durum ve içerik türü"\nassert b["Content-Length"] == "30", f"Content-Length bayt sayısı olmalı (İ 2 bayttır): beklenen 30, gelen {b[\'Content-Length\']}"\nassert json_yanit([1, 2]) == ("[1, 2]", 200, {"Content-Type": "application/json", "Content-Length": "6"}), "varsayılan durum 200"\nassert json_yanit({"x": 1}, 204)[0] == "" and json_yanit({"x": 1}, 204)[2]["Content-Length"] == "0", "204\'te gövde boş"\nfor kotu in [99, 600, "200", True]:\n    try:\n        json_yanit({}, kotu)\n        assert False, f"durum={kotu!r} ValueError vermeli"\n    except ValueError:\n        pass\ng, d, _ = hata_yaniti(404, "Ürün bulunamadı")\nassert (g, d) == (\'{"hata": "Ürün bulunamadı", "durum": 404}\', 404), "hata yanıtı biçimi"\ntry:\n    hata_yaniti(200, "x")\n    assert False, "200 ile hata yanıtı ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: ['Uzunluk karakter değil bayt cinsindendir: len(govde.encode("utf-8")).', 'bool, int\'in alt sınıfıdır; True\'yu ayrıca reddet.', 'hata_yaniti içinde json_yanit\'i yeniden kullan; kodu tekrarlama.'],
      why: 'HTTP başlıklarındaki Content-Length bayt sayısıdır; Türkçe karakterler UTF-8\'de 2 bayt tuttuğu için karakter sayısı yanlış sonuç verir ve istemci gövdeyi eksik okur. Tutarlı bir hata gövdesi biçimi, API istemcilerinin hataları tek yerden işlemesini sağlar.' },
    { id: 'flask-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Flask\'taki <code>request.args</code> nesnesini taklit eden <code>Args</code> sınıfını yaz. Kurucu <code>Args(sorgu)</code>: <code>"kategori=%C4%B0%C3%A7ecek&amp;sayfa=2&amp;etiket=a&amp;etiket=b"</code> gibi ham sorgu dizesi alır (<code>urllib.parse.parse_qsl</code> kullan; boş değerleri de koru).</p><ul><li><code>get(anahtar, default=None, type=None)</code>: anahtarın <b>ilk</b> değeri; yoksa <code>default</code>. <code>type</code> verilirse dönüştürür; dönüştürme <code>ValueError</code> verirse <code>default</code> döner.</li><li><code>getlist(anahtar, type=None)</code>: tüm değerlerin listesi (yoksa boş liste); dönüştürülemeyenler atlanır.</li><li><code>anahtar in args</code> çalışsın.</li></ul>',
      start: 'from urllib.parse import parse_qsl\n\n\nclass Args:\n    def __init__(self, sorgu):\n        pass\n',
      sol: 'from urllib.parse import parse_qsl\n\n\nclass Args:\n    def __init__(self, sorgu):\n        self._veri = {}\n        for k, v in parse_qsl(sorgu, keep_blank_values=True):\n            self._veri.setdefault(k, []).append(v)\n\n    def get(self, anahtar, default=None, type=None):\n        if anahtar not in self._veri:\n            return default\n        deger = self._veri[anahtar][0]\n        if type is None:\n            return deger\n        try:\n            return type(deger)\n        except ValueError:\n            return default\n\n    def getlist(self, anahtar, type=None):\n        sonuc = []\n        for v in self._veri.get(anahtar, []):\n            try:\n                sonuc.append(type(v) if type else v)\n            except ValueError:\n                continue\n        return sonuc\n\n    def __contains__(self, anahtar):\n        return anahtar in self._veri\n',
      tests: 'a = Args("kategori=%C4%B0%C3%A7ecek&sayfa=2&etiket=yeni&etiket=indirim&limit=abc&q=&id=3&id=x&id=5")\nassert a.get("kategori") == "İçecek", "yüzde kodlaması çözülmeli"\nassert a.get("sayfa", 1, type=int) == 2, "type=int dönüştürmeli"\nassert a.get("limit", 20, type=int) == 20, "dönüştürülemeyen değerde default dönmeli"\nassert a.get("yok", "varsayılan") == "varsayılan" and a.get("yok") is None, "eksik anahtar default"\nassert a.get("etiket") == "yeni", "get ilk değeri döndürmeli"\nassert a.getlist("etiket") == ["yeni", "indirim"], "getlist tüm değerleri sırayla"\nassert a.getlist("id", type=int) == [3, 5], "getlist dönüştürülemeyenleri atlamalı"\nassert a.getlist("yok") == [], "eksik anahtarda boş liste"\nassert a.get("q") == "" and "q" in a and "yok" not in a, "boş değer korunmalı; in çalışmalı"\n',
      hints: ['parse_qsl(sorgu, keep_blank_values=True) (anahtar, değer) demetleri listesi verir; tekrar eden anahtarlar ayrı demetlerdir.', 'Anahtar → değer listesi sözlüğü kur: setdefault(k, []).append(v)', 'in desteği için __contains__ metodu yaz.'],
      why: 'Sorgu dizesinde aynı anahtar birden çok kez gelebilir (?etiket=a&amp;etiket=b), bu yüzden Werkzeug MultiDict kullanır. get(..., type=int) kalıbı, kullanıcının elle bozduğu URL\'lerde 500 hatası yerine makul varsayılana düşmeyi sağlar.' },
    { id: 'flask-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 3,
      q: '<p>Blueprint mantığını kur.</p><ul><li><code>Blueprint(ad, url_prefix="")</code>: <code>route(kural, methods=("GET",))</code> dekoratörü kuralları <code>(kural, metotlar, fonksiyon)</code> olarak kendi listesinde biriktirsin ve fonksiyonu döndürsün.</li><li><code>Uygulama</code>: <code>register_blueprint(bp)</code> her kuralı <code>url_prefix + kural</code> yoluyla ve <code>"bp_adi.fonksiyon_adi"</code> uç nokta (endpoint) adıyla kaydetsin. Aynı ad ile ikinci blueprint kaydı <code>ValueError</code> versin.</li><li><code>url_map()</code>: <code>"METOT YOL -&gt; endpoint"</code> metinlerinin <b>sıralı</b> listesi.</li><li><code>url_for(endpoint)</code>: endpoint\'in yolunu döndürsün; yoksa <code>LookupError</code>.</li></ul>',
      start: 'class Blueprint:\n    def __init__(self, ad, url_prefix=""):\n        self.ad = ad\n        self.url_prefix = url_prefix\n\n\nclass Uygulama:\n    def __init__(self):\n        pass\n',
      sol: 'class Blueprint:\n    def __init__(self, ad, url_prefix=""):\n        self.ad = ad\n        self.url_prefix = url_prefix\n        self.kurallar = []\n\n    def route(self, kural, methods=("GET",)):\n        def kaydet(fn):\n            self.kurallar.append((kural, tuple(methods), fn))\n            return fn\n        return kaydet\n\n\nclass Uygulama:\n    def __init__(self):\n        self.blueprints = {}\n        self.uclar = {}\n        self.harita = []\n\n    def register_blueprint(self, bp):\n        if bp.ad in self.blueprints:\n            raise ValueError(f"{bp.ad} zaten kayıtlı")\n        self.blueprints[bp.ad] = bp\n        for kural, metotlar, fn in bp.kurallar:\n            yol = bp.url_prefix + kural\n            endpoint = f"{bp.ad}.{fn.__name__}"\n            self.uclar[endpoint] = yol\n            for m in metotlar:\n                self.harita.append(f"{m} {yol} -> {endpoint}")\n\n    def url_map(self):\n        return sorted(self.harita)\n\n    def url_for(self, endpoint):\n        if endpoint not in self.uclar:\n            raise LookupError(endpoint)\n        return self.uclar[endpoint]\n',
      tests: 'urunler = Blueprint("urunler", url_prefix="/api/urunler")\nsiparisler = Blueprint("siparisler", url_prefix="/api/siparisler")\n\n@urunler.route("/")\ndef liste():\n    return []\n\n@urunler.route("/<int:id>", methods=["GET", "DELETE"])\ndef detay(id):\n    return {}\n\n@siparisler.route("/", methods=["POST"])\ndef olustur():\n    return {}\n\nassert liste() == [], "route dekoratörü fonksiyonu aynen döndürmeli"\napp = Uygulama()\napp.register_blueprint(urunler)\napp.register_blueprint(siparisler)\nassert app.url_map() == [\n    "DELETE /api/urunler/<int:id> -> urunler.detay",\n    "GET /api/urunler/ -> urunler.liste",\n    "GET /api/urunler/<int:id> -> urunler.detay",\n    "POST /api/siparisler/ -> siparisler.olustur",\n], f"url_map hatalı: {app.url_map()}"\nassert app.url_for("urunler.detay") == "/api/urunler/<int:id>", "url_for endpoint yolunu vermeli"\ntry:\n    app.url_for("urunler.yok")\n    assert False, "bilinmeyen endpoint LookupError vermeli"\nexcept LookupError:\n    pass\ntry:\n    app.register_blueprint(Blueprint("urunler"))\n    assert False, "aynı adlı blueprint ikinci kez kaydedilememeli"\nexcept ValueError:\n    pass\n',
      hints: ['Blueprint kuralları hemen uygulamaya eklemez; yalnız biriktirir. Ekleme register_blueprint anında olur (ertelenmiş kayıt).', 'Endpoint adı: f"{bp.ad}.{fn.__name__}"; yol: bp.url_prefix + kural.', 'url_map için her metot için ayrı satır üret ve sorted ile sırala.'],
      why: 'Gerçek Flask\'ta da blueprint kayıtları ertelenir ve register_blueprint anında uygulamaya aktarılır; url_for("urunler.detay") gibi ad alanlı uç noktalar böyle oluşur. Bu sayede aynı blueprint farklı ön eklerle (ör. /api/v1, /api/v2) kaydedilebilir.' },
    { id: 'flask-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Uygulamanın merkezi hata işleyicisi istisnayı HTTP durum koduna çeviriyor: <code>KimlikHatasi</code> → 401, <code>YetkiHatasi</code> → 403, <code>BulunamadiHatasi</code> → 404, <code>DogrulamaHatasi</code> → 422, diğer her şey → 500. Ama <code>UrunBulunamadi</code> (bir <code>BulunamadiHatasi</code> alt sınıfı) 500 dönüyor ve 500 yanıtlarında iç hata mesajı (ör. veritabanı şifresi içeren bağlantı hatası) kullanıcıya sızıyor. <b>Hataları bul ve düzelt.</b> 500\'de mesaj her zaman <code>"Sunucu hatası"</code> olmalı; diğerlerinde <code>str(hata)</code>.</p>',
      start: 'class UygulamaHatasi(Exception):\n    pass\n\nclass KimlikHatasi(UygulamaHatasi):\n    pass\n\nclass YetkiHatasi(UygulamaHatasi):\n    pass\n\nclass BulunamadiHatasi(UygulamaHatasi):\n    pass\n\nclass DogrulamaHatasi(UygulamaHatasi):\n    pass\n\nclass UrunBulunamadi(BulunamadiHatasi):\n    pass\n\n\nDURUMLAR = {KimlikHatasi: 401, YetkiHatasi: 403, BulunamadiHatasi: 404, DogrulamaHatasi: 422}\n\n\ndef hata_isle(hata):\n    kod = DURUMLAR.get(type(hata), 500)\n    return {"hata": str(hata)}, kod\n',
      sol: 'class UygulamaHatasi(Exception):\n    pass\n\nclass KimlikHatasi(UygulamaHatasi):\n    pass\n\nclass YetkiHatasi(UygulamaHatasi):\n    pass\n\nclass BulunamadiHatasi(UygulamaHatasi):\n    pass\n\nclass DogrulamaHatasi(UygulamaHatasi):\n    pass\n\nclass UrunBulunamadi(BulunamadiHatasi):\n    pass\n\n\nDURUMLAR = {KimlikHatasi: 401, YetkiHatasi: 403, BulunamadiHatasi: 404, DogrulamaHatasi: 422}\n\n\ndef hata_isle(hata):\n    for sinif, kod in DURUMLAR.items():\n        if isinstance(hata, sinif):\n            return {"hata": str(hata)}, kod\n    return {"hata": "Sunucu hatası"}, 500\n',
      tests: 'assert hata_isle(UrunBulunamadi("Ürün 42 yok")) == ({"hata": "Ürün 42 yok"}, 404), "alt sınıf da 404 almalı: type() yerine isinstance kullan"\nassert hata_isle(KimlikHatasi("Giriş yap")) == ({"hata": "Giriş yap"}, 401), "kimlik hatası 401"\nassert hata_isle(YetkiHatasi("İzin yok"))[1] == 403, "yetki hatası 403"\nassert hata_isle(DogrulamaHatasi("fiyat negatif"))[1] == 422, "doğrulama hatası 422"\nassert hata_isle(ConnectionError("postgres://admin:Gizli123@db")) == ({"hata": "Sunucu hatası"}, 500), "500\'de iç mesaj sızdırılmamalı"\nassert hata_isle(UygulamaHatasi("genel")) == ({"hata": "Sunucu hatası"}, 500), "eşlenmemiş uygulama hatası da 500"\n',
      hints: ['type(hata) tam türü verir; alt sınıflar sözlükte anahtar olarak bulunmaz.', 'Sözlüğü gezip isinstance(hata, sinif) ile kontrol et.', 'Eşleşme yoksa sabit "Sunucu hatası" mesajıyla 500 dön; ayrıntı yalnız günlüğe yazılmalı.'],
      why: 'Flask\'ın errorhandler mekanizması da istisnanın MRO\'sunu (kalıtım zinciri) gezerek en özel işleyiciyi bulur. 500 yanıtında iç ayrıntıyı göstermek, saldırgana sistem hakkında bilgi verir; ayrıntı yalnız sunucu günlüğüne yazılmalıdır.' },
    { id: 'flask-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Ürün yorumları sayfası müşteri yorumlarını Jinja2 ile basıyor. Güvenlik testi, yoruma <code>&lt;script&gt;</code> yazılınca betiğin çalıştığını gösterdi; ayrıca puanı olmayan (<code>puan</code> anahtarı eksik) yorumlarda sayfa boş yıldız yerine hata veriyor. <b>Hataları bul ve düzelt.</b> Puan yoksa <code>-</code> yazılsın.</p>',
      start: 'from jinja2 import Environment, StrictUndefined\n\nenv = Environment(undefined=StrictUndefined)\nSABLON = env.from_string(\n    "{% for y in yorumlar %}"\n    "<li><b>{{ y.ad }}</b> ({{ y.puan }}/5): {{ y.metin|safe }}</li>"\n    "{% endfor %}"\n)\n\n\ndef yorumlari_goster(yorumlar):\n    return SABLON.render(yorumlar=yorumlar)\n',
      sol: 'from jinja2 import Environment, StrictUndefined\n\nenv = Environment(undefined=StrictUndefined, autoescape=True)\nSABLON = env.from_string(\n    "{% for y in yorumlar %}"\n    "<li><b>{{ y.ad }}</b> ({{ y.get(\'puan\', \'-\') }}/5): {{ y.metin }}</li>"\n    "{% endfor %}"\n)\n\n\ndef yorumlari_goster(yorumlar):\n    return SABLON.render(yorumlar=yorumlar)\n',
      tests: 'r = yorumlari_goster([{"ad": "Ayşe", "puan": 5, "metin": "Çok hızlı geldi"}])\nassert r == "<li><b>Ayşe</b> (5/5): Çok hızlı geldi</li>", f"normal yorum biçimi bozulmamalı: {r}"\nr = yorumlari_goster([{"ad": "Kötü<i>", "puan": 1, "metin": "<script>alert(\'x\')</script>"}])\nassert "<script>" not in r and "&lt;script&gt;" in r, "yorum metni kaçışlanmalı: |safe kaldır ve autoescape aç"\nassert "Kötü&lt;i&gt;" in r, "ad da kaçışlanmalı"\nr = yorumlari_goster([{"ad": "Can", "metin": "İdare eder"}])\nassert r == "<li><b>Can</b> (-/5): İdare eder</li>", f"puanı olmayan yorumda \'-\' yazmalı: {r}"\n',
      hints: ['|safe filtresi kullanıcı verisinde XSS açığıdır; ayrıca Environment varsayılan olarak autoescape kapalıdır.', 'Environment(..., autoescape=True) ile tüm {{ }} çıktıları kaçışlanır.', 'Eksik anahtar için şablonda y.get("puan", "-") ya da {{ y.puan|default("-") }} kullanabilirsin.'],
      why: 'Flask .html şablonlarında autoescape\'i varsayılan açar; ama jinja2\'yi doğrudan kullanırken (e-posta şablonu, rapor üretimi) kapalıdır ve unutmak kolaydır. StrictUndefined, eksik değişkeni sessizce boş basmak yerine hata vererek yazım hatalarını yakalar; isteğe bağlı alanlar için açıkça varsayılan vermek gerekir.' },
    { id: 'flask-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Tam bir mini çatı yaz: <code>MiniFlask</code>.</p><ul><li><code>route(kural, methods=("GET",))</code>: kural <code>&lt;ad&gt;</code> ve <code>&lt;int:ad&gt;</code> parametreleri içerebilir. Kurallar tanım sırasıyla denenir.</li><li><code>dispatch(method, yol)</code> → <code>(govde, durum)</code>: ilk eşleşen kuralın fonksiyonunu parametreleri anahtar kelime argümanı olarak vererek çağır. Fonksiyon <code>dict</code> ya da <code>list</code> döndürürse gövde <code>json.dumps(..., ensure_ascii=False)</code> olsun; metin aynen kalsın; <code>(gövde, durum)</code> demeti de desteklensin (gövdesi yine dönüştürülür).</li><li>Yol eşleşip metot uymuyorsa 405, hiç eşleşmiyorsa 404. <code>errorhandler(kod)</code> dekoratörüyle 404/405 için özel işleyici kaydedilebilsin: işleyici <code>(yol)</code> argümanıyla çağrılır ve dönüşü aynı kurallarla yanıta çevrilir (durum kodu verilmemişse ilgili hata kodu kullanılır). İşleyici yoksa <code>("Not Found", 404)</code> / <code>("Method Not Allowed", 405)</code>.</li></ul>',
      start: 'import json\nimport re\n\n\nclass MiniFlask:\n    def __init__(self):\n        self.kurallar = []\n        self.hata_isleyicileri = {}\n',
      sol: 'import json\nimport re\n\n\nclass MiniFlask:\n    def __init__(self):\n        self.kurallar = []\n        self.hata_isleyicileri = {}\n\n    @staticmethod\n    def _derle(kural):\n        int_adlar = set()\n\n        def cevir(m):\n            tip, ad = m.group(1), m.group(2)\n            if tip == "int":\n                int_adlar.add(ad)\n                return f"(?P<{ad}>\\\\d+)"\n            return f"(?P<{ad}>[^/]+)"\n\n        return re.compile(re.sub(r"<(?:(\\w+):)?(\\w+)>", cevir, kural)), int_adlar\n\n    def route(self, kural, methods=("GET",)):\n        desen, int_adlar = self._derle(kural)\n\n        def kaydet(fn):\n            self.kurallar.append((desen, int_adlar, set(methods), fn))\n            return fn\n        return kaydet\n\n    def errorhandler(self, kod):\n        def kaydet(fn):\n            self.hata_isleyicileri[kod] = fn\n            return fn\n        return kaydet\n\n    @staticmethod\n    def _yanit(sonuc, varsayilan_durum):\n        durum = varsayilan_durum\n        if isinstance(sonuc, tuple):\n            sonuc, durum = sonuc\n        if isinstance(sonuc, (dict, list)):\n            sonuc = json.dumps(sonuc, ensure_ascii=False)\n        return sonuc, durum\n\n    def _hata(self, kod, yol, metin):\n        if kod in self.hata_isleyicileri:\n            return self._yanit(self.hata_isleyicileri[kod](yol), kod)\n        return metin, kod\n\n    def dispatch(self, method, yol):\n        yol_var = False\n        for desen, int_adlar, metotlar, fn in self.kurallar:\n            m = desen.fullmatch(yol)\n            if not m:\n                continue\n            yol_var = True\n            if method not in metotlar:\n                continue\n            params = {k: int(v) if k in int_adlar else v for k, v in m.groupdict().items()}\n            return self._yanit(fn(**params), 200)\n        if yol_var:\n            return self._hata(405, yol, "Method Not Allowed")\n        return self._hata(404, yol, "Not Found")\n',
      tests: 'app = MiniFlask()\nURUNLER = {1: {"ad": "Çay", "fiyat": 85.5}}\n\n@app.route("/")\ndef ana():\n    return "Merhaba"\n\n@app.route("/urunler/<int:uid>")\ndef urun(uid):\n    if uid not in URUNLER:\n        return {"hata": "yok"}, 404\n    return URUNLER[uid]\n\n@app.route("/urunler", methods=["POST"])\ndef ekle():\n    return {"id": 2}, 201\n\n@app.route("/sehir/<ad>/subeler")\ndef subeler(ad):\n    return [ad.upper(), "merkez"]\n\nassert app.dispatch("GET", "/") == ("Merhaba", 200), "metin aynen 200 ile"\nassert app.dispatch("GET", "/urunler/1") == (\'{"ad": "Çay", "fiyat": 85.5}\', 200), "dict JSON\'a çevrilmeli, int parametre int gelmeli"\nassert app.dispatch("GET", "/urunler/9") == (\'{"hata": "yok"}\', 404), "demet içindeki dict de JSON olmalı"\nassert app.dispatch("POST", "/urunler") == (\'{"id": 2}\', 201), "POST kuralı"\nassert app.dispatch("GET", "/sehir/izmir/subeler") == (\'["IZMIR", "merkez"]\', 200), "metin parametresi ve liste gövde"\nassert app.dispatch("GET", "/urunler/abc") == ("Not Found", 404), "int olmayan parametre 404"\nassert app.dispatch("GET", "/urunler") == ("Method Not Allowed", 405), "yol var metot yok: 405"\n\n@app.errorhandler(404)\ndef bulunamadi(yol):\n    return {"hata": "bulunamadı", "yol": yol}\n\n@app.errorhandler(405)\ndef metot(yol):\n    return "Metot desteklenmiyor", 400\n\nassert app.dispatch("GET", "/yok") == (\'{"hata": "bulunamadı", "yol": "/yok"}\', 404), "özel 404 işleyicisi; durum verilmemişse 404"\nassert app.dispatch("DELETE", "/") == ("Metot desteklenmiyor", 400), "işleyicinin verdiği durum kodu kullanılmalı"\n',
      hints: ['Her kuralı route anında bir kez derle (regex + int adları kümesi) ve listede sakla; dispatch\'te sırayla dene.', 'Yanıta çevirme mantığını (_yanit) tek yardımcıda topla; hem görünüm hem hata işleyici sonuçları için kullan.', 'Önce tüm kuralları dene; yol eşleşip metot uymadıysa bir bayrak tut, döngü sonunda 405/404 kararını ver.'],
      why: 'Bu, Flask\'ın çekirdeğinin küçültülmüş bir modelidir: kural derleme, sıralı eşleme, dönüştürücüler, dönüş değerinden yanıt üretme (make_response) ve hata işleyicileri. Bir çatıyı içten tanıyan geliştirici, "neden 405 alıyorum?" gibi soruları saniyeler içinde çözer.' },
    { id: 'flask-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market ürün API\'si. Başlangıç kodundaki <code>MiniApp</code> çatısı hazır (dokunma): görünüm fonksiyonları <code>(istek, **parametreler)</code> alır; <code>istek.args</code> sorgu sözlüğü, <code>istek.json</code> gövdedir; <code>app.istek(metot, url, json=None)</code> → <code>(govde, durum)</code>. Bir <b>uygulama fabrikası</b> yaz: <code>create_app(baslangic_urunleri)</code> her çağrıda <b>kendi</b> ürün deposuna sahip yeni bir uygulama döndürsün (depo: <code>baslangic_urunleri</code> listesinin kopyası; her ürün <code>{"id", "ad", "fiyat", "kategori"}</code>).</p><ul><li><code>GET /urunler</code>: tüm ürünler (id sırasıyla); <code>?kategori=</code> verilirse filtrele; <code>?max_fiyat=</code> sayıysa fiyatı ona eşit/küçük olanlar (sayı değilse <code>({"hata": ...}, 400)</code>).</li><li><code>GET /urunler/&lt;int:id&gt;</code>: ürün ya da <code>({"hata": "Ürün bulunamadı"}, 404)</code>.</li><li><code>POST /urunler</code>: gövde <code>ad</code> (boş olmayan metin), <code>fiyat</code> (pozitif sayı, bool değil), <code>kategori</code> (metin, isteğe bağlı, varsayılan <code>"Genel"</code>) içermeli. Geçersizse <code>({"hata": "Doğrulama hatası", "alanlar": [hatalı alan adları, sıralı]}, 422)</code>. Geçerliyse yeni id = en büyük id + 1 (depo boşsa 1), ürünü ekle, <code>(urun, 201)</code>.</li><li><code>DELETE /urunler/&lt;int:id&gt;</code>: sil, <code>("", 204)</code>; yoksa 404.</li></ul>',
      start: 'import re\nfrom urllib.parse import urlsplit, parse_qsl\n\n\nclass Istek:\n    def __init__(self, method, args, json):\n        self.method = method\n        self.args = args\n        self.json = json\n\n\nclass MiniApp:\n    def __init__(self):\n        self.kurallar = []\n\n    def route(self, kural, methods=("GET",)):\n        regex = "^" + re.sub(r"<int:(\\w+)>", r"(?P<\\1>\\\\d+)", kural) + "$"\n        def kaydet(fn):\n            self.kurallar.append((re.compile(regex), tuple(methods), fn))\n            return fn\n        return kaydet\n\n    def istek(self, method, url, json=None):\n        parca = urlsplit(url)\n        yol_var = False\n        for regex, metotlar, fn in self.kurallar:\n            m = regex.match(parca.path)\n            if not m:\n                continue\n            yol_var = True\n            if method in metotlar:\n                params = {k: int(v) for k, v in m.groupdict().items()}\n                sonuc = fn(Istek(method, dict(parse_qsl(parca.query)), json), **params)\n                return sonuc if isinstance(sonuc, tuple) else (sonuc, 200)\n        return ({"hata": "Method Not Allowed"}, 405) if yol_var else ({"hata": "Not Found"}, 404)\n\n\ndef create_app(baslangic_urunleri):\n    app = MiniApp()\n    # TODO: depo ve route\'lar\n    return app\n',
      sol: 'import re\nfrom urllib.parse import urlsplit, parse_qsl\n\n\nclass Istek:\n    def __init__(self, method, args, json):\n        self.method = method\n        self.args = args\n        self.json = json\n\n\nclass MiniApp:\n    def __init__(self):\n        self.kurallar = []\n\n    def route(self, kural, methods=("GET",)):\n        regex = "^" + re.sub(r"<int:(\\w+)>", r"(?P<\\1>\\\\d+)", kural) + "$"\n        def kaydet(fn):\n            self.kurallar.append((re.compile(regex), tuple(methods), fn))\n            return fn\n        return kaydet\n\n    def istek(self, method, url, json=None):\n        parca = urlsplit(url)\n        yol_var = False\n        for regex, metotlar, fn in self.kurallar:\n            m = regex.match(parca.path)\n            if not m:\n                continue\n            yol_var = True\n            if method in metotlar:\n                params = {k: int(v) for k, v in m.groupdict().items()}\n                sonuc = fn(Istek(method, dict(parse_qsl(parca.query)), json), **params)\n                return sonuc if isinstance(sonuc, tuple) else (sonuc, 200)\n        return ({"hata": "Method Not Allowed"}, 405) if yol_var else ({"hata": "Not Found"}, 404)\n\n\ndef create_app(baslangic_urunleri):\n    app = MiniApp()\n    depo = {u["id"]: dict(u) for u in baslangic_urunleri}\n    BULUNAMADI = ({"hata": "Ürün bulunamadı"}, 404)\n\n    @app.route("/urunler", methods=["GET", "POST"])\n    def urunler(istek):\n        if istek.method == "POST":\n            return urun_ekle(istek.json or {})\n        sonuc = [depo[k] for k in sorted(depo)]\n        if "kategori" in istek.args:\n            sonuc = [u for u in sonuc if u["kategori"] == istek.args["kategori"]]\n        if "max_fiyat" in istek.args:\n            try:\n                ust = float(istek.args["max_fiyat"])\n            except ValueError:\n                return {"hata": "max_fiyat sayı olmalı"}, 400\n            sonuc = [u for u in sonuc if u["fiyat"] <= ust]\n        return sonuc\n\n    def urun_ekle(veri):\n        hatali = []\n        ad = veri.get("ad")\n        if not isinstance(ad, str) or not ad.strip():\n            hatali.append("ad")\n        fiyat = veri.get("fiyat")\n        if isinstance(fiyat, bool) or not isinstance(fiyat, (int, float)) or fiyat <= 0:\n            hatali.append("fiyat")\n        kategori = veri.get("kategori", "Genel")\n        if not isinstance(kategori, str):\n            hatali.append("kategori")\n        if hatali:\n            return {"hata": "Doğrulama hatası", "alanlar": sorted(hatali)}, 422\n        yeni_id = max(depo, default=0) + 1\n        urun = {"id": yeni_id, "ad": ad.strip(), "fiyat": fiyat, "kategori": kategori}\n        depo[yeni_id] = urun\n        return urun, 201\n\n    @app.route("/urunler/<int:uid>", methods=["GET", "DELETE"])\n    def urun(istek, uid):\n        if uid not in depo:\n            return BULUNAMADI\n        if istek.method == "DELETE":\n            del depo[uid]\n            return "", 204\n        return depo[uid]\n\n    return app\n',
      tests: 'BASLANGIC = [{"id": 1, "ad": "Çay", "fiyat": 85.5, "kategori": "İçecek"},\n             {"id": 3, "ad": "Bisküvi", "fiyat": 25.0, "kategori": "Atıştırmalık"},\n             {"id": 2, "ad": "Kahve", "fiyat": 240.0, "kategori": "İçecek"}]\napp = create_app(BASLANGIC)\ng, d = app.istek("GET", "/urunler")\nassert d == 200 and [u["id"] for u in g] == [1, 2, 3], "tüm ürünler id sırasıyla"\ng, d = app.istek("GET", "/urunler?kategori=%C4%B0%C3%A7ecek&max_fiyat=100")\nassert d == 200 and [u["ad"] for u in g] == ["Çay"], "kategori ve max_fiyat birlikte filtrelemeli"\nassert app.istek("GET", "/urunler?max_fiyat=ucuz")[1] == 400, "sayı olmayan max_fiyat 400"\nassert app.istek("GET", "/urunler/2") == ({"id": 2, "ad": "Kahve", "fiyat": 240.0, "kategori": "İçecek"}, 200), "tek ürün"\nassert app.istek("GET", "/urunler/99") == ({"hata": "Ürün bulunamadı"}, 404), "olmayan ürün 404"\ng, d = app.istek("POST", "/urunler", json={"ad": " Şeker ", "fiyat": 32})\nassert (g, d) == ({"id": 4, "ad": "Şeker", "fiyat": 32, "kategori": "Genel"}, 201), f"yeni ürün 201: {g, d}"\ng, d = app.istek("POST", "/urunler", json={"ad": "", "fiyat": True, "kategori": 5})\nassert (g, d) == ({"hata": "Doğrulama hatası", "alanlar": ["ad", "fiyat", "kategori"]}, 422), f"422 ve sıralı alan listesi: {g}"\nassert app.istek("POST", "/urunler")[1] == 422, "gövdesiz POST 422"\nassert app.istek("DELETE", "/urunler/1") == ("", 204), "silme 204"\nassert app.istek("DELETE", "/urunler/1")[1] == 404, "ikinci silme 404"\nassert app.istek("PUT", "/urunler/2")[1] == 405, "tanımsız metot 405 (çatı halleder)"\napp2 = create_app(BASLANGIC)\nassert len(app2.istek("GET", "/urunler")[0]) == 3, "her fabrika çağrısı bağımsız depo almalı"\nassert BASLANGIC[0]["ad"] == "Çay" and len(BASLANGIC) == 3, "başlangıç listesi değiştirilmemeli"\nbos = create_app([])\nassert bos.istek("POST", "/urunler", json={"ad": "Su", "fiyat": 10})[0]["id"] == 1, "boş depoda ilk id 1"\n',
      hints: ['Depoyu create_app içinde yerel değişken olarak kur; iç görünüm fonksiyonları onu kapanış (closure) olarak görür, böylece her uygulama bağımsız olur.', 'Aynı yol için GET ve POST\'u tek fonksiyonda istek.method ile ayır; doğrulamayı ayrı bir yardımcı fonksiyona çıkar.', 'Yeni id: max(depo, default=0) + 1. Kopyalamak için dict(u) kullan; başlangıç verisini değiştirme.'],
      why: 'Uygulama fabrikası kalıbı, her testin temiz bir uygulama ve depo almasını sağlar; küresel durum testleri birbirine bağlar. Durum kodları (200, 201, 204, 400, 404, 405, 422) API sözleşmesinin parçasıdır ve istemciler onlara göre davranır.' }
  ],
  faq: [
    { q: 'Flask kodunu neden burada çalıştıramıyorum?',
      a: 'Flask bir HTTP sunucusu başlatır ve ağ bağlantısı dinler; tarayıcıdaki Python motoru buna izin vermez. Alıştırmalar Flask\'ın mantığını (yönlendirme, şablon, doğrulama) taklit eder. Gerçek kodu kendi bilgisayarında sanal ortamda pip install flask ile kurup python -m flask --app app run --debug ile çalıştır.' },
    { q: 'flask run ile python app.py arasındaki fark ne?',
      a: 'python app.py, dosyanın sonunda app.run() çağrısı varsa çalışır. python -m flask --app app run ise Flask\'ın komut satırı aracını kullanır; --debug, ortam değişkenleri ve uygulama fabrikası desteği gibi kolaylıklar sunar. Her ikisi de yalnız geliştirme içindir; üretimde gunicorn ya da waitress kullan.' },
    { q: 'Flask ile REST API mi yazmalıyım, FastAPI ile mi?',
      a: 'Flask ile de çok iyi API yazılır (jsonify, blueprint, Flask-SQLAlchemy). FastAPI tip ipuçlarından otomatik doğrulama ve Swagger dokümantasyonu üretir, async\'i doğal destekler. Sunucu tarafında HTML üreten panellerde Flask, saf JSON API\'lerde çoğu zaman FastAPI tercih edilir.' },
    { q: 'Flask uygulamam aynı anda kaç kullanıcıya hizmet verir?',
      a: 'Geliştirme sunucusu buna göre tasarlanmamıştır. gunicorn -w 4 dört işlem (worker) başlatır; her biri bir isteği işler. Genel kural (2 x çekirdek sayısı) + 1 işlemdir. Uzun beklemeli işler (e-posta, rapor) isteğin içinde değil, kuyruk ve arka plan işçisinde (Celery, RQ) yapılmalıdır.' }
  ],
  mistakes: [
    { why: 'Üretimde debug modu etkileşimli hata konsolu açar; sunucuda kod çalıştırma riskidir.',
      bad: 'app.run(host="0.0.0.0", debug=True)',
      good: '# üretim: gunicorn -w 4 "magaza:create_app()"\n# debug yalnız yerelde: python -m flask --app magaza run --debug' },
    { why: 'Başarılı POST sonrası şablonu döndürmek, sayfa yenilendiğinde formun yeniden gönderilmesine yol açar.',
      bad: 'if form_gecerli:\n    kaydet()\n    return render_template("form.html")',
      good: 'if form_gecerli:\n    kaydet()\n    return redirect(url_for("tesekkurler"))' },
    { why: 'request.args değerleri metindir; int() hatalı girdide 500 verir. type=int geçersiz değerde varsayılana düşer.',
      bad: 'sayfa = int(request.args["sayfa"])',
      good: 'sayfa = request.args.get("sayfa", 1, type=int)' },
    { why: 'Kullanıcı verisini |safe ile basmak XSS açığıdır.',
      bad: '<p>{{ yorum|safe }}</p>',
      good: '<p>{{ yorum }}</p>' },
    { why: 'Gizli anahtarı koda yazmak onu git geçmişine sızdırır.',
      bad: 'app.config["SECRET_KEY"] = "cok-gizli-123"',
      good: 'app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]' }
  ] }
);
})(window);
