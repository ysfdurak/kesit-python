import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad')
from gen import PY, CODE, emit

body = '''
<h2>Neden önemli?</h2>
<p>API ve web dersinde HTTP'nin temellerini (metot, durum kodu, başlık, JSON gövde) ve bir API'yi istemci tarafından tüketmeyi gördün. Şimdi masanın öbür tarafına geçiyoruz: <b>sunucuyu</b> sen yazacaksın. <b>Flask</b>, Python'un en yaygın "mikro" web çatısıdır (micro framework): çekirdeği küçüktür, yalnız yönlendirme (routing), istek/yanıt ve şablon motorunu verir; veritabanı, oturum açma, form gibi ihtiyaçları eklentilerle seçersin. Şirket içi yönetim panelleri, raporlama ekranları, makine öğrenmesi modellerini sunan küçük servisler ve prototipler için çok sık tercih edilir.</p>
<p>Bu dersin özel bir yanı var: Flask bir sunucu çalıştırır ve ağ ister; bu yüzden <b>tarayıcıdaki Python motorunda çalışmaz</b>. Gerçek Flask kodunu gri kutularda göreceksin ve adım adım kendi bilgisayarında çalıştıracaksın. Alıştırmalarda ise Flask'ın içini taklit eden küçük parçaları (yönlendirici, yol parametresi ayrıştırıcı, şablon, form doğrulayıcı) kendin yazacaksın. Bir çatının içini yazan geliştirici, onu kullanırken hata ayıklamakta hiç zorlanmaz.</p>

<h2>İlk uygulama ve kurulum</h2>
''' + CODE(r'''
# app.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def ana_sayfa():
    return "Anadolu Market'e hoş geldin!"

@app.route("/saglik")
def saglik():
    return {"durum": "ok"}          # sözlük döndürmek otomatik JSON yanıtı üretir
''') + '''
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
''' + PY(r'''
class MiniFlask:
    def __init__(self):
        self.kurallar = {}                       # (metot, yol) -> fonksiyon

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
print(app.dispatch("GET", "/yok"))
''') + '''
<p>404 (bulunamadı) ile 405 (metot izinli değil) arasındaki farka dikkat: yol hiç yoksa 404, yol var ama bu metotla tanımlanmamışsa 405 döner. Gerçek Flask da tam olarak böyle davranır.</p>

<h2>Yol parametreleri ve HTTP metotları</h2>
<p>URL'nin bir parçasını değişken olarak almak için kuralda <code>&lt;ad&gt;</code> yazarsın; tür dönüştürücü (converter) eklersen Flask değeri dönüştürür ve uymayan URL'yi daha görünüm fonksiyonuna gelmeden 404 ile reddeder.</p>
''' + CODE(r'''
from flask import Flask, request, abort

app = Flask(__name__)
URUNLER = {1: {"ad": "Çay", "fiyat": 85.5}, 2: {"ad": "Kahve", "fiyat": 240.0}}

@app.get("/urunler/<int:urun_id>")             # @app.route(..., methods=["GET"]) kısayolu
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
    return {"sayfa": sayfa, "urunler": list(URUNLER.values())}
''') + '''
<div class="tbl-wrap"><table>
<tr><th>Dönüştürücü</th><th>Eşleşir</th><th>Örnek</th></tr>
<tr><td><code>&lt;ad&gt;</code> (string)</td><td>Eğik çizgi içermeyen metin</td><td><code>/sehir/İzmir</code></td></tr>
<tr><td><code>&lt;int:ad&gt;</code></td><td>Pozitif tam sayı</td><td><code>/urunler/42</code></td></tr>
<tr><td><code>&lt;float:ad&gt;</code></td><td>Ondalıklı sayı</td><td><code>/kur/32.5</code></td></tr>
<tr><td><code>&lt;path:ad&gt;</code></td><td>Eğik çizgi dahil metin</td><td><code>/dosya/rapor/2024/ocak.pdf</code></td></tr>
<tr><td><code>&lt;uuid:ad&gt;</code></td><td>UUID biçimi</td><td><code>/siparis/3f2a...</code></td></tr>
</table></div>
<p>Flask'ın yönlendiricisi (Werkzeug) kuralları düzenli ifadelere çevirerek eşler. Aynı fikri <code>re</code> ile kurabilirsin:</p>
''' + PY(r'''
import re

DONUSTURUCU = {"int": (r"\d+", int), "str": (r"[^/]+", str)}

def kural_derle(kural):
    tipler = {}
    def degistir(m):
        tip, ad = (m.group(1) or "str"), m.group(2)
        desen, cevir = DONUSTURUCU[tip]
        tipler[ad] = cevir
        return f"(?P<{ad}>{desen})"
    regex = re.sub(r"<(?:(\w+):)?(\w+)>", degistir, kural)
    return re.compile(f"^{regex}$"), tipler

desen, tipler = kural_derle("/musteri/<int:no>/siparis/<durum>")
for yol in ["/musteri/42/siparis/kargoda", "/musteri/abc/siparis/kargoda"]:
    m = desen.match(yol)
    print(yol, "->", {k: tipler[k](v) for k, v in m.groupdict().items()} if m else "404")
''') + '''

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
''' + PY(r'''
from urllib.parse import urlsplit, parse_qs

url = "/urunler?kategori=%C4%B0%C3%A7ecek&sayfa=2&etiket=yeni&etiket=indirim&limit=abc"
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

print(get(args, "sayfa", 1, type=int), get(args, "limit", 20, type=int), get(args, "kategori"))
''') + '''

<h2>Şablonlar: Jinja2</h2>
<p>HTML sayfa üretirken Python içinde metin birleştirmek hem çirkin hem tehlikelidir. Flask, <b>Jinja2</b> şablon motorunu kullanır: <code>templates/</code> klasörüne HTML dosyası koyar, <code>render_template("liste.html", urunler=urunler)</code> ile değişkenleri gönderirsin. Şablonda <code>{{ ifade }}</code> değer basar, <code>{% for %}</code> ve <code>{% if %}</code> akış kurar, <code>|</code> ile filtre uygularsın. jinja2 bu motorda çalışır:</p>
''' + PY(r'''
from jinja2 import Environment, DictLoader

sablonlar = {
    "taban.html": "<title>{% block baslik %}Anadolu Market{% endblock %}</title>\n{% block icerik %}{% endblock %}",
    "liste.html": """{% extends "taban.html" %}
{% block baslik %}Ürünler ({{ urunler|length }}){% endblock %}
{% block icerik %}
<ul>
{% for u in urunler %}  <li class="{{ 'tukendi' if u.stok == 0 else 'var' }}">{{ u.ad }}: {{ "%.2f"|format(u.fiyat) }} TL</li>
{% else %}  <li>Ürün yok</li>
{% endfor %}</ul>
<p>Yorum: {{ yorum }}</p>
{% endblock %}""",
}
env = Environment(loader=DictLoader(sablonlar), autoescape=True, trim_blocks=True)
urunler = [{"ad": "Çay", "fiyat": 85.5, "stok": 10}, {"ad": "Kahve", "fiyat": 240, "stok": 0}]
print(env.get_template("liste.html").render(urunler=urunler, yorum="<script>alert(1)</script>"))
''') + '''
<p>İki şeye dikkat: <code>{% extends %}</code> ve <code>{% block %}</code> ile tüm sayfaların ortak iskeletini tek dosyada tutarsın (şablon kalıtımı). <code>autoescape=True</code> kullanıcıdan gelen <code>&lt;script&gt;</code> gibi içeriği zararsız <code>&amp;lt;script&amp;gt;</code> metnine çevirir; Flask bunu <code>.html</code> şablonlarında varsayılan olarak açar. <code>|safe</code> filtresiyle kaçışı kapatmak, içeriğin güvenli olduğundan <b>emin olmadıkça</b> XSS (siteler arası betik) açığı demektir.</p>

<h2>Form işleme ve POST/Redirect/GET</h2>
''' + CODE(r'''
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.config["SECRET_KEY"] = "gelistirme-icin"     # flash ve oturum için gerekli

@app.route("/iletisim", methods=["GET", "POST"])
def iletisim():
    hatalar = {}
    if request.method == "POST":
        ad = request.form.get("ad", "").strip()
        eposta = request.form.get("eposta", "").strip()
        if len(ad) < 2:
            hatalar["ad"] = "Ad en az 2 karakter olmalı"
        if "@" not in eposta:
            hatalar["eposta"] = "Geçerli bir e-posta gir"
        if not hatalar:
            # ... kaydet ...
            flash("Mesajın alındı, teşekkürler!")
            return redirect(url_for("iletisim"))   # POST'tan sonra yönlendir
    return render_template("iletisim.html", hatalar=hatalar, form=request.form)
''') + '''
<p>Başarılı bir POST'tan sonra sayfayı doğrudan döndürmek yerine <b>yönlendirirsin</b> (POST/Redirect/GET kalıbı). Böylece kullanıcı sayfayı yenilediğinde form ikinci kez gönderilmez; çift sipariş, çift ödeme gibi sorunlar önlenir. <code>url_for("iletisim")</code> URL'yi fonksiyon adından üretir; URL değişse bile kod kırılmaz. Gerçek projelerde formlar <b>Flask-WTF</b> ile doğrulanır; bu eklenti CSRF (siteler arası istek sahteciliği) korumasını da ekler.</p>

<h2>Hata işleyiciler ve durum kodları</h2>
''' + CODE(r'''
from flask import Flask, jsonify, abort

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
    return jsonify(hata="Sunucu hatası"), 500   # iç ayrıntıyı kullanıcıya sızdırma
''') + '''
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
''' + CODE(r'''
# magaza/urunler.py
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

# Çalıştırma: python -m flask --app magaza run --debug
''') + '''
<div class="warn"><b>Gizli anahtarlar koda yazılmaz</b><code>SECRET_KEY</code>, veritabanı şifresi ve API anahtarları ortam değişkeninden ya da gizli yönetim servisinden okunur. Yapılandırma dersindeki kurallar burada da geçerli. <code>debug=True</code> üretimde asla açık olmamalı: hata sayfasındaki etkileşimli konsol, sunucuda kod çalıştırmaya izin verir.</div>

<h2>Test client ile test</h2>
''' + CODE(r'''
# tests/test_urunler.py   (pip install pytest)
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
    assert yanit.status_code in (201, 405)
''') + '''
<p>Test client gerçek bir sunucu başlatmadan isteği uygulamaya doğrudan iletir; testler milisaniyeler içinde çalışır. Fabrika kalıbının asıl faydası burada ortaya çıkar: her test temiz bir uygulama alır.</p>

<h2>Eklentiler: Flask-SQLAlchemy ve Flask-Login (gösterim)</h2>
''' + CODE(r'''
# pip install flask-sqlalchemy flask-login
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

    return app
''') + '''
<p>Flask-SQLAlchemy, SQLAlchemy dersinde öğrendiğin modelleri ve session'ı istek yaşam döngüsüne bağlar. Flask-Login oturum çerezini yönetir ve <code>@login_required</code> ile korunan sayfalara girişsiz erişimi engeller.</p>

<h2>Dağıtım: gunicorn</h2>
<p><code>flask run</code> yalnız geliştirme içindir; tek işlemlidir ve güvenlik için tasarlanmamıştır. Üretimde bir WSGI sunucusu kullanılır:</p>
''' + CODE(r'''
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "magaza:create_app()"
# Windows'ta gunicorn çalışmaz; waitress kullan:
pip install waitress
waitress-serve --port=8000 --call magaza:create_app
''') + '''
<p>Önüne genellikle nginx gibi bir ters vekil (reverse proxy) konur: HTTPS, statik dosyalar ve yük dengeleme orada yapılır. Docker ve dağıtım dersinde bu yapıyı konteynere taşıyacaksın.</p>

<div class="note"><b>Gerçek işte</b>Anadolu Market'in depo ekibi, sabah sevkiyat listesini Excel'den kopyalıyordu. Bir geliştirici iki günde küçük bir Flask uygulaması yazdı: <code>/sevkiyat</code> sayfası veritabanından günün siparişlerini Jinja2 tablosuyla gösteriyor, <code>/sevkiyat/&lt;int:no&gt;/tamamla</code> POST isteği durumu güncelliyor, giriş Flask-Login ile korunuyor. Uygulama fabrikası sayesinde testler bellek içi SQLite ile, üretim PostgreSQL ile çalışıyor; gunicorn ve nginx arkasında şirket ağında yayında. Flask'ın gücü tam olarak bu: küçük bir iç araç için bir öğleden sonrada çalışan bir sistem.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>WSGI: Flask aslında bir fonksiyondur</h3>
<p>Flask uygulaması, WSGI standardına (PEP 3333) uyan çağrılabilir bir nesnedir: <code>app(environ, start_response)</code>. gunicorn her istekte bunu çağırır. Standart kütüphanedeki <code>wsgiref</code> ile en yalın WSGI uygulamasını yazıp sahte bir istekle çağırabilirsin:</p>
''' + PY(r'''
import json

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
print(sahte_istek("/yok"))
''') + '''
<h3>Bağlam yerelleri: request ve g</h3>
<p><code>request</code> küresel bir değişken gibi görünür ama her istek (ve her iş parçacığı) kendi değerini görür; Flask bunu bağlam yerelleri (context locals, <code>contextvars</code>) ile sağlar. İstek boyunca paylaşılacak nesneler (veritabanı bağlantısı, giriş yapan kullanıcı) <code>flask.g</code> içinde tutulur. Bu yüzden görünüm fonksiyonu dışında (ör. arka plan iş parçacığında) <code>request</code>'e erişmek "Working outside of request context" hatası verir.</p>
<h3>Flask mı, FastAPI mı, Django mı?</h3>
<p>Sunucu tarafında HTML üreten panellerde ve küçük servislerde Flask; tip ipuçlarından otomatik doğrulama ve dokümantasyon isteyen JSON API'lerde FastAPI; yönetim paneli, ORM, kimlik doğrulama hepsi hazır gelsin isteyen büyük içerik uygulamalarında Django öne çıkar. Bir sonraki ders FastAPI; karşılaştırma tablosunu orada bulacaksın.</p>
</section>
'''

FRAMEWORK = r'''import re
from urllib.parse import urlsplit, parse_qsl


class Istek:
    def __init__(self, method, args, json):
        self.method = method
        self.args = args
        self.json = json


class MiniApp:
    def __init__(self):
        self.kurallar = []

    def route(self, kural, methods=("GET",)):
        regex = "^" + re.sub(r"<int:(\w+)>", r"(?P<\1>\\d+)", kural) + "$"
        def kaydet(fn):
            self.kurallar.append((re.compile(regex), tuple(methods), fn))
            return fn
        return kaydet

    def istek(self, method, url, json=None):
        parca = urlsplit(url)
        yol_var = False
        for regex, metotlar, fn in self.kurallar:
            m = regex.match(parca.path)
            if not m:
                continue
            yol_var = True
            if method in metotlar:
                params = {k: int(v) for k, v in m.groupdict().items()}
                sonuc = fn(Istek(method, dict(parse_qsl(parca.query)), json), **params)
                return sonuc if isinstance(sonuc, tuple) else (sonuc, 200)
        return ({"hata": "Method Not Allowed"}, 405) if yol_var else ({"hata": "Not Found"}, 404)
'''

ex = [
  dict(t='mc', stage='Isınma',
       q='Kural <code>@app.route("/urunler/&lt;int:urun_id&gt;")</code> tanımlı. Kullanıcı <code>/urunler/abc</code> adresine GET isteği atarsa ne olur?',
       o=['Fonksiyon urun_id="abc" ile çağrılır', 'Flask 404 döndürür; fonksiyon hiç çağrılmaz', 'Fonksiyon çağrılır ve ValueError fırlar, 500 döner', 'Flask 400 Bad Request döndürür'], a=1,
       why='int dönüştürücüsü yalnız rakamlardan oluşan parçayla eşleşir. "abc" hiçbir kuralla eşleşmediği için Werkzeug yönlendiricisi 404 üretir; görünüm fonksiyonuna hiç gelinmez, dönüştürme hatası da oluşmaz.'),
  dict(t='mc', stage='Isınma',
       q='Sipariş formu POST ile başarıyla kaydedildi. Bundan sonra en doğru yanıt hangisi?',
       o=['Aynı form şablonunu 200 ile yeniden döndürmek', 'Teşekkür sayfasına redirect (302/303) ile yönlendirmek', 'Boş bir 204 No Content yanıtı döndürmek', 'Kaydedilen siparişi 201 ile JSON olarak dönmek'], a=1,
       why='POST/Redirect/GET kalıbı: yönlendirme sonrası tarayıcı GET yapar, kullanıcı sayfayı yenilese bile form tekrar gönderilmez. Şablonu doğrudan döndürmek yenilemede çift sipariş riskidir; 201 JSON ise HTML formu değil API istemcisi için uygundur.'),
  dict(t='mc', stage='Isınma',
       q='Flask şablonunda <code>{{ yorum|safe }}</code> kullanılıyor ve <code>yorum</code> müşterinin yazdığı metin. Sorun nedir?',
       o=['safe filtresi metni kırpar, uzun yorumlar kesilir', 'Otomatik kaçış kapanır; zararlı betik çalışabilir (XSS)', 'safe yalnızca sayılarla çalışır, metinde hata verir', 'Sorun yok; safe güvenli karakterleri seçer'], a=1,
       why='|safe Jinja2\'ye "bu içerik zaten güvenli HTML, kaçışlama" der. Kullanıcı girdisinde bu, &lt;script&gt; etiketinin sayfada çalışması demektir. Kullanıcıdan gelen veriyi hiçbir zaman safe ile işaretleme.'),
  dict(t='predict', stage='Kodu oku', q='Jinja2 döngüsü ve filtreleri: bu kod ne yazdırır?',
       code=r'''from jinja2 import Template

t = Template("{% for u in urunler %}{{ loop.index }}.{{ u.ad|upper }}={{ '%.1f'|format(u.fiyat) }}{{ ', ' if not loop.last }}{% endfor %}")
print(t.render(urunler=[{"ad": "çay", "fiyat": 85.5}, {"ad": "kahve", "fiyat": 240}]))
''',
       o=['1.ÇAY=85.5, 2.KAHVE=240.0', '0.ÇAY=85.5, 1.KAHVE=240.0', '1.ÇAY=85.5, 2.KAHVE=240.0, ', '1.çay=85.5, 2.kahve=240'], a=0,
       why='loop.index 1\'den başlar (0 tabanlı olan loop.index0\'dır). upper Türkçe karakterleri de büyütür, "%.1f" biçimi 240\'ı 240.0 yapar. loop.last son turda True olduğu için sona virgül eklenmez.'),
  dict(t='predict', stage='Kodu oku', q='Otomatik kaçış (autoescape): bu kod ne yazdırır?',
       code=r'''from jinja2 import Environment

env = Environment(autoescape=True)
t = env.from_string("<p>{{ yorum }}</p>")
print(t.render(yorum='<b>Harika</b> & hızlı'))
''',
       o=['<p><b>Harika</b> & hızlı</p>', '<p>&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı</p>', '<p>Harika & hızlı</p>', '&lt;p&gt;&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı&lt;/p&gt;'], a=1,
       why='autoescape yalnız {{ }} ile basılan değeri kaçışlar; şablonun kendi HTML\'i (&lt;p&gt;) olduğu gibi kalır. Değerdeki &lt;, &gt; ve &amp; karakterleri HTML varlıklarına çevrilir, böylece tarayıcı onları etiket olarak yorumlamaz.'),
  dict(t='predict', stage='Kodu oku', q='Dekoratörle route kaydı: bu kod ne yazdırır?',
       code=r'''KURALLAR = {}

def route(yol, methods=("GET",)):
    def kaydet(fn):
        for m in methods:
            KURALLAR[(m, yol)] = fn.__name__
        return fn
    return kaydet

@route("/sepet", methods=["GET", "POST"])
def sepet():
    return "sepet"

@route("/")
def ana():
    return "ana"

print(len(KURALLAR), KURALLAR[("POST", "/sepet")], sepet())
''',
       o=['2 sepet sepet', '3 sepet sepet', '3 sepet None', '2 POST sepet'], a=1,
       why='/sepet iki metotla iki kural, / bir kural ekler: toplam 3. Kayıtta fonksiyonun adı tutulur. Dekoratör fonksiyonu aynen döndürdüğü için sepet() hâlâ normal çalışır ve "sepet" verir.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Flask\'ın <code>@app.route</code> mekanizmasını taklit eden ve bir isteği yönlendiren programın satırlarını sırala.</p>',
       lines=['kurallar = {}', 'def route(yol):', '    def kaydet(fn):', '        kurallar[yol] = fn', '        return fn', '    return kaydet', '@route("/saglik")', 'def saglik():', '    return {"durum": "ok"}', 'print(kurallar["/saglik"]())'],
       expect="{'durum': 'ok'}\n",
       hint='Kayıt sözlüğü en başta; parametreli dekoratör iki katmanlıdır: dış fonksiyon iç dekoratörü döndürür.',
       why='route("/saglik") çağrısı kaydet fonksiyonunu döndürür; kaydet saglik\'i sözlüğe ekleyip aynen geri verir. Sonra sözlükten fonksiyon bulunup çağrılır.'),
  dict(id='flask-1', t='code', stage='Rehberli', diff=1,
       q='<p>Flask\'ın yönlendiricisini taklit eden <code>MiniFlask</code> sınıfını tamamla.</p><ul><li><code>route(path, methods=("GET",))</code>: dekoratör; her metot için <code>(metot, path)</code> anahtarıyla fonksiyonu <code>self.kurallar</code>\'a kaydetsin ve fonksiyonu aynen döndürsün.</li><li><code>dispatch(method, path)</code>: kural varsa fonksiyonu çağırsın. Fonksiyon <code>(gövde, durum)</code> demeti döndürürse onu, aksi hâlde <code>(gövde, 200)</code> döndürsün. Yol başka bir metotla kayıtlıysa <code>("Method Not Allowed", 405)</code>, hiç yoksa <code>("Not Found", 404)</code>.</li></ul>',
       guide=['route içinde kaydet(fn) adlı iç fonksiyon yaz; methods üzerinde dönüp self.kurallar[(m, path)] = fn yap ve fn\'i döndür.', 'route, kaydet fonksiyonunu döndürmeli (parametreli dekoratör).', 'dispatch\'te önce (method, path) anahtarına bak; varsa fonksiyonu çağır.', 'Sonuç demetse aynen, değilse (sonuc, 200) döndür.', 'Yoksa: kurallardaki yollardan biri path ise 405, değilse 404.'],
       example=r'''class OlayYolu:
    def __init__(self):
        self.dinleyiciler = {}

    def dinle(self, olay):
        def kaydet(fn):
            self.dinleyiciler[olay] = fn
            return fn
        return kaydet

yol = OlayYolu()

@yol.dinle("siparis_olustu")
def bildir(no):
    return f"{no} için e-posta gönderildi"

print(yol.dinleyiciler["siparis_olustu"]("AM-7"))
''',
       start=r'''class MiniFlask:
    def __init__(self):
        self.kurallar = {}

    def route(self, path, methods=("GET",)):
        def kaydet(fn):
            # TODO: her metot için kaydet, fn'i döndür
            pass
        return kaydet

    def dispatch(self, method, path):
        # TODO: 200 / 405 / 404 mantığı
        return "Not Found", 404
''',
       sol=r'''class MiniFlask:
    def __init__(self):
        self.kurallar = {}

    def route(self, path, methods=("GET",)):
        def kaydet(fn):
            for m in methods:
                self.kurallar[(m, path)] = fn
            return fn
        return kaydet

    def dispatch(self, method, path):
        fn = self.kurallar.get((method, path))
        if fn is not None:
            sonuc = fn()
            return sonuc if isinstance(sonuc, tuple) else (sonuc, 200)
        if any(p == path for _, p in self.kurallar):
            return "Method Not Allowed", 405
        return "Not Found", 404
''',
       tests=r'''app = MiniFlask()

@app.route("/")
def ana():
    return "Hoş geldin"

@app.route("/sepet", methods=["GET", "POST"])
def sepet():
    return "Sepet", 201

assert ana() == "Hoş geldin", "dekoratör fonksiyonu aynen döndürmeli (return fn)"
assert app.dispatch("GET", "/") == ("Hoş geldin", 200), "demet olmayan sonuç 200 ile sarılmalı"
assert app.dispatch("POST", "/sepet") == ("Sepet", 201), "fonksiyon demet döndürürse aynen iletilmeli"
assert app.dispatch("GET", "/sepet") == ("Sepet", 201), "aynı fonksiyon iki metotla kayıtlı olmalı"
assert app.dispatch("DELETE", "/sepet") == ("Method Not Allowed", 405), "yol var ama metot yoksa 405"
assert app.dispatch("POST", "/") == ("Method Not Allowed", 405), "GET için tanımlı yola POST 405 almalı"
assert app.dispatch("GET", "/yok") == ("Not Found", 404), "yol yoksa 404"
''',
       hints=['Parametreli dekoratör: route(...) çağrısı kaydet\'i döndürür, Python da kaydet(fn)\'i çağırır.', 'isinstance(sonuc, tuple) ile demet olup olmadığını anla.', '405 için: any(p == path for _, p in self.kurallar)'],
       why='Flask\'ın URL haritası da (metot kümesi, kural) → görünüm fonksiyonu eşlemesidir. 404 ile 405 ayrımı, istemcinin hatasını doğru anlamasını sağlar: 405 yanıtı "bu adres var ama bu metotla değil" der.'),
  dict(id='flask-2', t='code', stage='Rehberli', diff=2,
       q='<p><code>eslestir(kural, yol)</code> fonksiyonunu yaz. Flask kuralındaki parametreleri ayrıştırır:</p><ul><li><code>&lt;ad&gt;</code>: eğik çizgi içermeyen, boş olmayan metin (değer <code>str</code>)</li><li><code>&lt;int:ad&gt;</code>: yalnız rakamlardan oluşan parça (değer <code>int</code>)</li></ul><p>Eşleşirse parametre sözlüğünü, eşleşmezse <code>None</code> döndürsün. Yolun <b>tamamı</b> eşleşmeli. Örnek: <code>eslestir("/urun/&lt;int:id&gt;", "/urun/42")</code> → <code>{"id": 42}</code>.</p>',
       guide=['Kuraldaki her &lt;...&gt; parçasını re.sub ile adlandırılmış gruba çevir: &lt;int:ad&gt; → (?P&lt;ad&gt;\\d+), &lt;ad&gt; → (?P&lt;ad&gt;[^/]+).', 'Hangi adın int olduğunu bir kümede tut.', 'Deseni ^ ve $ ile sarıp re.fullmatch (ya da match) kullan.', 'Eşleşmezse None; eşleşirse groupdict() içindeki int adlarını int\'e çevir.'],
       example=r'''import re

kural = "/rapor/<yil>"
desen = re.sub(r"<(\w+)>", r"(?P<\1>\\d{4})", kural)
print(desen)
m = re.fullmatch(desen, "/rapor/2024")
print(m.groupdict() if m else None)
print(re.fullmatch(desen, "/rapor/24"))
''',
       start=r'''import re

def eslestir(kural, yol):
    int_adlar = set()

    def cevir(m):
        tip, ad = m.group(1), m.group(2)
        # TODO: tip "int" ise ad'ı int_adlar'a ekle ve rakam grubu döndür
        # TODO: değilse eğik çizgisiz metin grubu döndür
        return ""

    desen = re.sub(r"<(?:(\w+):)?(\w+)>", cevir, kural)
    # TODO: tam eşleştir, None ya da dönüştürülmüş sözlük döndür
    return None
''',
       sol=r'''import re

def eslestir(kural, yol):
    int_adlar = set()

    def cevir(m):
        tip, ad = m.group(1), m.group(2)
        if tip == "int":
            int_adlar.add(ad)
            return f"(?P<{ad}>\\d+)"
        return f"(?P<{ad}>[^/]+)"

    desen = re.sub(r"<(?:(\w+):)?(\w+)>", cevir, kural)
    m = re.fullmatch(desen, yol)
    if m is None:
        return None
    return {k: int(v) if k in int_adlar else v for k, v in m.groupdict().items()}
''',
       tests=r'''assert eslestir("/urun/<int:id>", "/urun/42") == {"id": 42}, "int parametresi int'e çevrilmeli"
assert eslestir("/urun/<int:id>", "/urun/abc") is None, "rakam olmayan değer int ile eşleşmemeli"
assert eslestir("/sehir/<ad>", "/sehir/İzmir") == {"ad": "İzmir"}, "string parametresi metin olarak gelmeli"
assert eslestir("/sehir/<ad>", "/sehir/a/b") is None, "string parametresi eğik çizgi içermemeli"
assert eslestir("/musteri/<int:no>/siparis/<durum>", "/musteri/7/siparis/kargoda") == {"no": 7, "durum": "kargoda"}, "birden çok parametre"
assert eslestir("/urunler", "/urunler") == {}, "parametresiz kural eşleşince boş sözlük"
assert eslestir("/urunler", "/urunler/5") is None, "yolun tamamı eşleşmeli"
assert eslestir("/sehir/<ad>", "/sehir/") is None, "boş parametre eşleşmemeli"
''',
       hints=['re.sub\'a fonksiyon verirsen her eşleşme için çağrılır ve dönen metin yerine konur.', 'Adlandırılmış grup sözdizimi (?P&lt;ad&gt;desen); m.groupdict() {ad: değer} verir.', 'Tam eşleşme için re.fullmatch(desen, yol); sonra {k: int(v) if k in int_adlar else v ...}'],
       why='Werkzeug yönlendiricisi de kuralları derleyip düzenli ifadeyle eşler; dönüştürücüler hem deseni hem de dönüşümü tanımlar. Bu yüzden &lt;int:id&gt; ile tanımlı bir route\'ta id her zaman int gelir ve doğrulama yazman gerekmez.'),
  dict(id='flask-3', t='code', stage='Rehberli', diff=2,
       q='<p><code>siparis_tablosu(siparisler)</code> fonksiyonunu yaz. jinja2 ile <code>autoescape=True</code> bir <code>Environment</code> kur ve şu çıktıyı üretecek şablonu render etsin (her sipariş bir satır; liste boşsa tek satır <code>&lt;tr&gt;&lt;td&gt;Sipariş yok&lt;/td&gt;&lt;/tr&gt;</code>):</p><pre class="out">&lt;tr&gt;&lt;td&gt;AM-1&lt;/td&gt;&lt;td&gt;Ayşe&lt;/td&gt;&lt;td&gt;120.00&lt;/td&gt;&lt;/tr&gt;</pre><p>Satırlar <code>\\n</code> ile ayrılsın, tutar iki basamaklı yazılsın. Müşteri adındaki HTML kaçışlanmalı.</p>',
       guide=['from jinja2 import Environment; env = Environment(autoescape=True)', 'Şablonda {% for s in siparisler %} ... {% else %} ... {% endfor %} kullan.', 'Tutarı "%.2f"|format(s.tutar) ile biçimlendir.', 'Satır sonlarını yönetmek için satırları döngüde üretip join yerine şablonda {{ "\\n" if not loop.last }} kullanabilirsin.', 'env.from_string(sablon).render(siparisler=siparisler) sonucunu döndür.'],
       example=r'''from jinja2 import Environment

env = Environment(autoescape=True)
t = env.from_string("{% for p in personel %}<li>{{ p.ad }} ({{ p.bolum }})</li>{{ '\n' if not loop.last }}{% else %}<li>Kimse yok</li>{% endfor %}")
print(t.render(personel=[{"ad": "Ali", "bolum": "İK"}, {"ad": "Ece", "bolum": "Satış & Pazarlama"}]))
print(t.render(personel=[]))
''',
       start=r'''from jinja2 import Environment

SABLON = (
    "{% for s in siparisler %}"
    "<tr><td>{{ s.no }}</td><td>TODO</td><td>TODO</td></tr>"
    "{{ '\n' if not loop.last }}"
    "{% else %}"
    "TODO"
    "{% endfor %}"
)


def siparis_tablosu(siparisler):
    env = Environment()  # TODO: kaçışlama açık olmalı
    return env.from_string(SABLON).render(siparisler=siparisler)
''',
       sol=r'''from jinja2 import Environment

SABLON = (
    "{% for s in siparisler %}"
    "<tr><td>{{ s.no }}</td><td>{{ s.musteri }}</td><td>{{ '%.2f'|format(s.tutar) }}</td></tr>"
    "{{ '\n' if not loop.last }}"
    "{% else %}"
    "<tr><td>Sipariş yok</td></tr>"
    "{% endfor %}"
)


def siparis_tablosu(siparisler):
    env = Environment(autoescape=True)
    return env.from_string(SABLON).render(siparisler=siparisler)
''',
       tests=r'''veri = [{"no": "AM-1", "musteri": "Ayşe", "tutar": 120}, {"no": "AM-2", "musteri": "Mehmet", "tutar": 89.456}]
beklenen = "<tr><td>AM-1</td><td>Ayşe</td><td>120.00</td></tr>\n<tr><td>AM-2</td><td>Mehmet</td><td>89.46</td></tr>"
assert siparis_tablosu(veri) == beklenen, f"çıktı hatalı:\n{siparis_tablosu(veri)}"
assert siparis_tablosu([]) == "<tr><td>Sipariş yok</td></tr>", "boş listede 'Sipariş yok' satırı"
r = siparis_tablosu([{"no": "AM-3", "musteri": "<script>x</script>", "tutar": 1}])
assert "&lt;script&gt;" in r and "<script>" not in r, "müşteri adı kaçışlanmalı (autoescape=True)"
''',
       hints=['for döngüsünün {% else %} dalı liste boşsa çalışır.', 'Biçimlendirme filtresi: {{ "%.2f"|format(s.tutar) }}', 'Environment(autoescape=True) olmadan &lt;script&gt; olduğu gibi basılır.'],
       why='Flask\'ın render_template fonksiyonu arka planda tam olarak bunu yapar: autoescape açık bir Jinja2 ortamında şablonu bağlam değişkenleriyle render eder. Biçimlendirmeyi şablona, hesaplamayı Python\'a bırakmak görünümü sade tutar.'),
  dict(id='flask-4', t='code', stage='Kendin yaz', diff=2,
       q='<p>Kayıt formu doğrulayıcısı yaz: <code>form_dogrula(form)</code>. <code>form</code>, <code>request.form</code> gibi metin değerli bir sözlüktür. <code>(temiz, hatalar)</code> demeti döndürsün:</p><ul><li><code>ad</code>: kırpılmış hâli 2-50 karakter olmalı.</li><li><code>eposta</code>: kırpılmış, küçük harfe çevrilmiş; <code>^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$</code> desenine uymalı.</li><li><code>yas</code>: tam sayıya çevrilebilmeli ve 18-120 arasında olmalı.</li><li><code>kvkk</code>: değeri <code>"on"</code> olmalı (işaretlenmiş onay kutusu).</li></ul><p>Eksik alan da geçersiz sayılır. <code>hatalar</code>: geçersiz alan adı → Türkçe mesaj. <code>temiz</code>: <b>yalnız geçerli</b> alanların temizlenmiş değerleri (<code>yas</code> int, <code>kvkk</code> <code>True</code>).</p>',
       start=r'''import re

def form_dogrula(form):
    temiz, hatalar = {}, {}
    return temiz, hatalar
''',
       sol=r'''import re

EPOSTA = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")


def form_dogrula(form):
    temiz, hatalar = {}, {}
    ad = form.get("ad", "").strip()
    if 2 <= len(ad) <= 50:
        temiz["ad"] = ad
    else:
        hatalar["ad"] = "Ad 2-50 karakter olmalı"
    eposta = form.get("eposta", "").strip().lower()
    if EPOSTA.match(eposta):
        temiz["eposta"] = eposta
    else:
        hatalar["eposta"] = "Geçerli bir e-posta gir"
    try:
        yas = int(form.get("yas", ""))
        if not 18 <= yas <= 120:
            raise ValueError
        temiz["yas"] = yas
    except ValueError:
        hatalar["yas"] = "Yaş 18-120 arasında bir sayı olmalı"
    if form.get("kvkk") == "on":
        temiz["kvkk"] = True
    else:
        hatalar["kvkk"] = "Aydınlatma metnini onaylamalısın"
    return temiz, hatalar
''',
       tests=r'''t, h = form_dogrula({"ad": "  Ayşe Yılmaz ", "eposta": " Ayse@AnadoluMarket.com.tr ", "yas": "34", "kvkk": "on"})
assert h == {}, f"geçerli formda hata olmamalı: {h}"
assert t == {"ad": "Ayşe Yılmaz", "eposta": "ayse@anadolumarket.com.tr", "yas": 34, "kvkk": True}, f"temiz veri hatalı: {t}"
t, h = form_dogrula({"ad": "A", "eposta": "ayse@", "yas": "on yedi"})
assert set(h) == {"ad", "eposta", "yas", "kvkk"}, f"dört alan da hatalı olmalı, gelen {set(h)}"
assert t == {}, "geçersiz alanlar temiz veride yer almamalı"
t, h = form_dogrula({"ad": "Can", "eposta": "can@x.com", "yas": "17", "kvkk": "on"})
assert set(h) == {"yas"} and "yas" not in t and t["ad"] == "Can", "yalnız yaş (18 altı) hatalı olmalı"
_, h = form_dogrula({"ad": "Can", "eposta": "can x@y.com", "yas": "121", "kvkk": ""})
assert set(h) == {"eposta", "yas", "kvkk"}, "boşluklu e-posta, 120 üstü yaş ve işaretsiz kvkk geçersiz"
assert all(isinstance(m, str) and m for m in h.values()), "her hataya bir mesaj yazılmalı"
''',
       hints=['Her alanı ayrı ele al; eksik alan için form.get(alan, "") kullan.', 'int("on yedi") ValueError fırlatır; aralık dışını da aynı except\'e düşürmek için raise ValueError kullanabilirsin.', 'Onay kutusu işaretliyse tarayıcı "on" gönderir, işaretsizse alanı hiç göndermez.'],
       why='Doğrulama sunucu tarafında yapılmalıdır; tarayıcıdaki kontroller kolayca atlatılır. Hataları alan adına göre döndürmek, şablonun her hatayı ilgili kutunun altında göstermesini sağlar. Flask-WTF ve pydantic aynı fikri hazır sunar.'),
  dict(id='flask-5', t='code', stage='Kendin yaz', diff=2,
       q='<p>Flask\'ın <code>jsonify</code> davranışını taklit eden <code>json_yanit(veri, durum=200)</code> fonksiyonunu yaz. <code>(govde, durum, basliklar)</code> döndürsün:</p><ul><li><code>govde</code>: <code>json.dumps(veri, ensure_ascii=False)</code>; durum <code>204</code> ise boş metin.</li><li><code>basliklar</code>: <code>{"Content-Type": "application/json", "Content-Length": bayt_uzunlugu}</code>; uzunluk gövdenin <b>UTF-8 bayt</b> sayısının metin hâli.</li><li><code>durum</code> 100-599 arasında bir <code>int</code> değilse <code>ValueError</code>.</li></ul><p>Ayrıca <code>hata_yaniti(durum, mesaj)</code> yaz: <code>json_yanit({"hata": mesaj, "durum": durum}, durum)</code> döndürsün; durum 400\'den küçükse <code>ValueError</code>.</p>',
       start=r'''import json

def json_yanit(veri, durum=200):
    pass


def hata_yaniti(durum, mesaj):
    pass
''',
       sol=r'''import json

def json_yanit(veri, durum=200):
    if isinstance(durum, bool) or not isinstance(durum, int) or not 100 <= durum <= 599:
        raise ValueError(f"Geçersiz durum kodu: {durum!r}")
    govde = "" if durum == 204 else json.dumps(veri, ensure_ascii=False)
    basliklar = {"Content-Type": "application/json",
                 "Content-Length": str(len(govde.encode("utf-8")))}
    return govde, durum, basliklar


def hata_yaniti(durum, mesaj):
    if durum < 400:
        raise ValueError("Hata yanıtı 4xx ya da 5xx olmalı")
    return json_yanit({"hata": mesaj, "durum": durum}, durum)
''',
       tests=r'''g, d, b = json_yanit({"sehir": "İzmir", "adet": 2}, 201)
assert g == '{"sehir": "İzmir", "adet": 2}', "Türkçe karakterler kaçışsız (ensure_ascii=False) yazılmalı"
assert d == 201 and b["Content-Type"] == "application/json", "durum ve içerik türü"
assert b["Content-Length"] == "30", f"Content-Length bayt sayısı olmalı (İ 2 bayttır): beklenen 30, gelen {b['Content-Length']}"
assert json_yanit([1, 2]) == ("[1, 2]", 200, {"Content-Type": "application/json", "Content-Length": "6"}), "varsayılan durum 200"
assert json_yanit({"x": 1}, 204)[0] == "" and json_yanit({"x": 1}, 204)[2]["Content-Length"] == "0", "204'te gövde boş"
for kotu in [99, 600, "200", True]:
    try:
        json_yanit({}, kotu)
        assert False, f"durum={kotu!r} ValueError vermeli"
    except ValueError:
        pass
g, d, _ = hata_yaniti(404, "Ürün bulunamadı")
assert (g, d) == ('{"hata": "Ürün bulunamadı", "durum": 404}', 404), "hata yanıtı biçimi"
try:
    hata_yaniti(200, "x")
    assert False, "200 ile hata yanıtı ValueError vermeli"
except ValueError:
    pass
''',
       hints=['Uzunluk karakter değil bayt cinsindendir: len(govde.encode("utf-8")).', 'bool, int\'in alt sınıfıdır; True\'yu ayrıca reddet.', 'hata_yaniti içinde json_yanit\'i yeniden kullan; kodu tekrarlama.'],
       why='HTTP başlıklarındaki Content-Length bayt sayısıdır; Türkçe karakterler UTF-8\'de 2 bayt tuttuğu için karakter sayısı yanlış sonuç verir ve istemci gövdeyi eksik okur. Tutarlı bir hata gövdesi biçimi, API istemcilerinin hataları tek yerden işlemesini sağlar.'),
  dict(id='flask-6', t='code', stage='Kendin yaz', diff=2,
       q='<p>Flask\'taki <code>request.args</code> nesnesini taklit eden <code>Args</code> sınıfını yaz. Kurucu <code>Args(sorgu)</code>: <code>"kategori=%C4%B0%C3%A7ecek&amp;sayfa=2&amp;etiket=a&amp;etiket=b"</code> gibi ham sorgu dizesi alır (<code>urllib.parse.parse_qsl</code> kullan; boş değerleri de koru).</p><ul><li><code>get(anahtar, default=None, type=None)</code>: anahtarın <b>ilk</b> değeri; yoksa <code>default</code>. <code>type</code> verilirse dönüştürür; dönüştürme <code>ValueError</code> verirse <code>default</code> döner.</li><li><code>getlist(anahtar, type=None)</code>: tüm değerlerin listesi (yoksa boş liste); dönüştürülemeyenler atlanır.</li><li><code>anahtar in args</code> çalışsın.</li></ul>',
       start=r'''from urllib.parse import parse_qsl


class Args:
    def __init__(self, sorgu):
        pass
''',
       sol=r'''from urllib.parse import parse_qsl


class Args:
    def __init__(self, sorgu):
        self._veri = {}
        for k, v in parse_qsl(sorgu, keep_blank_values=True):
            self._veri.setdefault(k, []).append(v)

    def get(self, anahtar, default=None, type=None):
        if anahtar not in self._veri:
            return default
        deger = self._veri[anahtar][0]
        if type is None:
            return deger
        try:
            return type(deger)
        except ValueError:
            return default

    def getlist(self, anahtar, type=None):
        sonuc = []
        for v in self._veri.get(anahtar, []):
            try:
                sonuc.append(type(v) if type else v)
            except ValueError:
                continue
        return sonuc

    def __contains__(self, anahtar):
        return anahtar in self._veri
''',
       tests=r'''a = Args("kategori=%C4%B0%C3%A7ecek&sayfa=2&etiket=yeni&etiket=indirim&limit=abc&q=&id=3&id=x&id=5")
assert a.get("kategori") == "İçecek", "yüzde kodlaması çözülmeli"
assert a.get("sayfa", 1, type=int) == 2, "type=int dönüştürmeli"
assert a.get("limit", 20, type=int) == 20, "dönüştürülemeyen değerde default dönmeli"
assert a.get("yok", "varsayılan") == "varsayılan" and a.get("yok") is None, "eksik anahtar default"
assert a.get("etiket") == "yeni", "get ilk değeri döndürmeli"
assert a.getlist("etiket") == ["yeni", "indirim"], "getlist tüm değerleri sırayla"
assert a.getlist("id", type=int) == [3, 5], "getlist dönüştürülemeyenleri atlamalı"
assert a.getlist("yok") == [], "eksik anahtarda boş liste"
assert a.get("q") == "" and "q" in a and "yok" not in a, "boş değer korunmalı; in çalışmalı"
''',
       hints=['parse_qsl(sorgu, keep_blank_values=True) (anahtar, değer) demetleri listesi verir; tekrar eden anahtarlar ayrı demetlerdir.', 'Anahtar → değer listesi sözlüğü kur: setdefault(k, []).append(v)', 'in desteği için __contains__ metodu yaz.'],
       why='Sorgu dizesinde aynı anahtar birden çok kez gelebilir (?etiket=a&amp;etiket=b), bu yüzden Werkzeug MultiDict kullanır. get(..., type=int) kalıbı, kullanıcının elle bozduğu URL\'lerde 500 hatası yerine makul varsayılana düşmeyi sağlar.'),
  dict(id='flask-7', t='code', stage='Kendin yaz', diff=3,
       q='<p>Blueprint mantığını kur.</p><ul><li><code>Blueprint(ad, url_prefix="")</code>: <code>route(kural, methods=("GET",))</code> dekoratörü kuralları <code>(kural, metotlar, fonksiyon)</code> olarak kendi listesinde biriktirsin ve fonksiyonu döndürsün.</li><li><code>Uygulama</code>: <code>register_blueprint(bp)</code> her kuralı <code>url_prefix + kural</code> yoluyla ve <code>"bp_adi.fonksiyon_adi"</code> uç nokta (endpoint) adıyla kaydetsin. Aynı ad ile ikinci blueprint kaydı <code>ValueError</code> versin.</li><li><code>url_map()</code>: <code>"METOT YOL -&gt; endpoint"</code> metinlerinin <b>sıralı</b> listesi.</li><li><code>url_for(endpoint)</code>: endpoint\'in yolunu döndürsün; yoksa <code>LookupError</code>.</li></ul>',
       start=r'''class Blueprint:
    def __init__(self, ad, url_prefix=""):
        self.ad = ad
        self.url_prefix = url_prefix


class Uygulama:
    def __init__(self):
        pass
''',
       sol=r'''class Blueprint:
    def __init__(self, ad, url_prefix=""):
        self.ad = ad
        self.url_prefix = url_prefix
        self.kurallar = []

    def route(self, kural, methods=("GET",)):
        def kaydet(fn):
            self.kurallar.append((kural, tuple(methods), fn))
            return fn
        return kaydet


class Uygulama:
    def __init__(self):
        self.blueprints = {}
        self.uclar = {}
        self.harita = []

    def register_blueprint(self, bp):
        if bp.ad in self.blueprints:
            raise ValueError(f"{bp.ad} zaten kayıtlı")
        self.blueprints[bp.ad] = bp
        for kural, metotlar, fn in bp.kurallar:
            yol = bp.url_prefix + kural
            endpoint = f"{bp.ad}.{fn.__name__}"
            self.uclar[endpoint] = yol
            for m in metotlar:
                self.harita.append(f"{m} {yol} -> {endpoint}")

    def url_map(self):
        return sorted(self.harita)

    def url_for(self, endpoint):
        if endpoint not in self.uclar:
            raise LookupError(endpoint)
        return self.uclar[endpoint]
''',
       tests=r'''urunler = Blueprint("urunler", url_prefix="/api/urunler")
siparisler = Blueprint("siparisler", url_prefix="/api/siparisler")

@urunler.route("/")
def liste():
    return []

@urunler.route("/<int:id>", methods=["GET", "DELETE"])
def detay(id):
    return {}

@siparisler.route("/", methods=["POST"])
def olustur():
    return {}

assert liste() == [], "route dekoratörü fonksiyonu aynen döndürmeli"
app = Uygulama()
app.register_blueprint(urunler)
app.register_blueprint(siparisler)
assert app.url_map() == [
    "DELETE /api/urunler/<int:id> -> urunler.detay",
    "GET /api/urunler/ -> urunler.liste",
    "GET /api/urunler/<int:id> -> urunler.detay",
    "POST /api/siparisler/ -> siparisler.olustur",
], f"url_map hatalı: {app.url_map()}"
assert app.url_for("urunler.detay") == "/api/urunler/<int:id>", "url_for endpoint yolunu vermeli"
try:
    app.url_for("urunler.yok")
    assert False, "bilinmeyen endpoint LookupError vermeli"
except LookupError:
    pass
try:
    app.register_blueprint(Blueprint("urunler"))
    assert False, "aynı adlı blueprint ikinci kez kaydedilememeli"
except ValueError:
    pass
''',
       hints=['Blueprint kuralları hemen uygulamaya eklemez; yalnız biriktirir. Ekleme register_blueprint anında olur (ertelenmiş kayıt).', 'Endpoint adı: f"{bp.ad}.{fn.__name__}"; yol: bp.url_prefix + kural.', 'url_map için her metot için ayrı satır üret ve sorted ile sırala.'],
       why='Gerçek Flask\'ta da blueprint kayıtları ertelenir ve register_blueprint anında uygulamaya aktarılır; url_for("urunler.detay") gibi ad alanlı uç noktalar böyle oluşur. Bu sayede aynı blueprint farklı ön eklerle (ör. /api/v1, /api/v2) kaydedilebilir.'),
  dict(id='flask-8', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p>Uygulamanın merkezi hata işleyicisi istisnayı HTTP durum koduna çeviriyor: <code>KimlikHatasi</code> → 401, <code>YetkiHatasi</code> → 403, <code>BulunamadiHatasi</code> → 404, <code>DogrulamaHatasi</code> → 422, diğer her şey → 500. Ama <code>UrunBulunamadi</code> (bir <code>BulunamadiHatasi</code> alt sınıfı) 500 dönüyor ve 500 yanıtlarında iç hata mesajı (ör. veritabanı şifresi içeren bağlantı hatası) kullanıcıya sızıyor. <b>Hataları bul ve düzelt.</b> 500\'de mesaj her zaman <code>"Sunucu hatası"</code> olmalı; diğerlerinde <code>str(hata)</code>.</p>',
       start=r'''class UygulamaHatasi(Exception):
    pass

class KimlikHatasi(UygulamaHatasi):
    pass

class YetkiHatasi(UygulamaHatasi):
    pass

class BulunamadiHatasi(UygulamaHatasi):
    pass

class DogrulamaHatasi(UygulamaHatasi):
    pass

class UrunBulunamadi(BulunamadiHatasi):
    pass


DURUMLAR = {KimlikHatasi: 401, YetkiHatasi: 403, BulunamadiHatasi: 404, DogrulamaHatasi: 422}


def hata_isle(hata):
    kod = DURUMLAR.get(type(hata), 500)
    return {"hata": str(hata)}, kod
''',
       sol=r'''class UygulamaHatasi(Exception):
    pass

class KimlikHatasi(UygulamaHatasi):
    pass

class YetkiHatasi(UygulamaHatasi):
    pass

class BulunamadiHatasi(UygulamaHatasi):
    pass

class DogrulamaHatasi(UygulamaHatasi):
    pass

class UrunBulunamadi(BulunamadiHatasi):
    pass


DURUMLAR = {KimlikHatasi: 401, YetkiHatasi: 403, BulunamadiHatasi: 404, DogrulamaHatasi: 422}


def hata_isle(hata):
    for sinif, kod in DURUMLAR.items():
        if isinstance(hata, sinif):
            return {"hata": str(hata)}, kod
    return {"hata": "Sunucu hatası"}, 500
''',
       tests=r'''assert hata_isle(UrunBulunamadi("Ürün 42 yok")) == ({"hata": "Ürün 42 yok"}, 404), "alt sınıf da 404 almalı: type() yerine isinstance kullan"
assert hata_isle(KimlikHatasi("Giriş yap")) == ({"hata": "Giriş yap"}, 401), "kimlik hatası 401"
assert hata_isle(YetkiHatasi("İzin yok"))[1] == 403, "yetki hatası 403"
assert hata_isle(DogrulamaHatasi("fiyat negatif"))[1] == 422, "doğrulama hatası 422"
assert hata_isle(ConnectionError("postgres://admin:Gizli123@db")) == ({"hata": "Sunucu hatası"}, 500), "500'de iç mesaj sızdırılmamalı"
assert hata_isle(UygulamaHatasi("genel")) == ({"hata": "Sunucu hatası"}, 500), "eşlenmemiş uygulama hatası da 500"
''',
       hints=['type(hata) tam türü verir; alt sınıflar sözlükte anahtar olarak bulunmaz.', 'Sözlüğü gezip isinstance(hata, sinif) ile kontrol et.', 'Eşleşme yoksa sabit "Sunucu hatası" mesajıyla 500 dön; ayrıntı yalnız günlüğe yazılmalı.'],
       why='Flask\'ın errorhandler mekanizması da istisnanın MRO\'sunu (kalıtım zinciri) gezerek en özel işleyiciyi bulur. 500 yanıtında iç ayrıntıyı göstermek, saldırgana sistem hakkında bilgi verir; ayrıntı yalnız sunucu günlüğüne yazılmalıdır.'),
  dict(id='flask-9', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p>Ürün yorumları sayfası müşteri yorumlarını Jinja2 ile basıyor. Güvenlik testi, yoruma <code>&lt;script&gt;</code> yazılınca betiğin çalıştığını gösterdi; ayrıca puanı olmayan (<code>puan</code> anahtarı eksik) yorumlarda sayfa boş yıldız yerine hata veriyor. <b>Hataları bul ve düzelt.</b> Puan yoksa <code>-</code> yazılsın.</p>',
       start=r'''from jinja2 import Environment, StrictUndefined

env = Environment(undefined=StrictUndefined)
SABLON = env.from_string(
    "{% for y in yorumlar %}"
    "<li><b>{{ y.ad }}</b> ({{ y.puan }}/5): {{ y.metin|safe }}</li>"
    "{% endfor %}"
)


def yorumlari_goster(yorumlar):
    return SABLON.render(yorumlar=yorumlar)
''',
       sol=r'''from jinja2 import Environment, StrictUndefined

env = Environment(undefined=StrictUndefined, autoescape=True)
SABLON = env.from_string(
    "{% for y in yorumlar %}"
    "<li><b>{{ y.ad }}</b> ({{ y.get('puan', '-') }}/5): {{ y.metin }}</li>"
    "{% endfor %}"
)


def yorumlari_goster(yorumlar):
    return SABLON.render(yorumlar=yorumlar)
''',
       tests=r'''r = yorumlari_goster([{"ad": "Ayşe", "puan": 5, "metin": "Çok hızlı geldi"}])
assert r == "<li><b>Ayşe</b> (5/5): Çok hızlı geldi</li>", f"normal yorum biçimi bozulmamalı: {r}"
r = yorumlari_goster([{"ad": "Kötü<i>", "puan": 1, "metin": "<script>alert('x')</script>"}])
assert "<script>" not in r and "&lt;script&gt;" in r, "yorum metni kaçışlanmalı: |safe kaldır ve autoescape aç"
assert "Kötü&lt;i&gt;" in r, "ad da kaçışlanmalı"
r = yorumlari_goster([{"ad": "Can", "metin": "İdare eder"}])
assert r == "<li><b>Can</b> (-/5): İdare eder</li>", f"puanı olmayan yorumda '-' yazmalı: {r}"
''',
       hints=['|safe filtresi kullanıcı verisinde XSS açığıdır; ayrıca Environment varsayılan olarak autoescape kapalıdır.', 'Environment(..., autoescape=True) ile tüm {{ }} çıktıları kaçışlanır.', 'Eksik anahtar için şablonda y.get("puan", "-") ya da {{ y.puan|default("-") }} kullanabilirsin.'],
       why='Flask .html şablonlarında autoescape\'i varsayılan açar; ama jinja2\'yi doğrudan kullanırken (e-posta şablonu, rapor üretimi) kapalıdır ve unutmak kolaydır. StrictUndefined, eksik değişkeni sessizce boş basmak yerine hata vererek yazım hatalarını yakalar; isteğe bağlı alanlar için açıkça varsayılan vermek gerekir.'),
  dict(id='flask-10', t='code', stage='Meydan okuma', diff=3,
       q='<p>Tam bir mini çatı yaz: <code>MiniFlask</code>.</p><ul><li><code>route(kural, methods=("GET",))</code>: kural <code>&lt;ad&gt;</code> ve <code>&lt;int:ad&gt;</code> parametreleri içerebilir. Kurallar tanım sırasıyla denenir.</li><li><code>dispatch(method, yol)</code> → <code>(govde, durum)</code>: ilk eşleşen kuralın fonksiyonunu parametreleri anahtar kelime argümanı olarak vererek çağır. Fonksiyon <code>dict</code> ya da <code>list</code> döndürürse gövde <code>json.dumps(..., ensure_ascii=False)</code> olsun; metin aynen kalsın; <code>(gövde, durum)</code> demeti de desteklensin (gövdesi yine dönüştürülür).</li><li>Yol eşleşip metot uymuyorsa 405, hiç eşleşmiyorsa 404. <code>errorhandler(kod)</code> dekoratörüyle 404/405 için özel işleyici kaydedilebilsin: işleyici <code>(yol)</code> argümanıyla çağrılır ve dönüşü aynı kurallarla yanıta çevrilir (durum kodu verilmemişse ilgili hata kodu kullanılır). İşleyici yoksa <code>("Not Found", 404)</code> / <code>("Method Not Allowed", 405)</code>.</li></ul>',
       start=r'''import json
import re


class MiniFlask:
    def __init__(self):
        self.kurallar = []
        self.hata_isleyicileri = {}
''',
       sol=r'''import json
import re


class MiniFlask:
    def __init__(self):
        self.kurallar = []
        self.hata_isleyicileri = {}

    @staticmethod
    def _derle(kural):
        int_adlar = set()

        def cevir(m):
            tip, ad = m.group(1), m.group(2)
            if tip == "int":
                int_adlar.add(ad)
                return f"(?P<{ad}>\\d+)"
            return f"(?P<{ad}>[^/]+)"

        return re.compile(re.sub(r"<(?:(\w+):)?(\w+)>", cevir, kural)), int_adlar

    def route(self, kural, methods=("GET",)):
        desen, int_adlar = self._derle(kural)

        def kaydet(fn):
            self.kurallar.append((desen, int_adlar, set(methods), fn))
            return fn
        return kaydet

    def errorhandler(self, kod):
        def kaydet(fn):
            self.hata_isleyicileri[kod] = fn
            return fn
        return kaydet

    @staticmethod
    def _yanit(sonuc, varsayilan_durum):
        durum = varsayilan_durum
        if isinstance(sonuc, tuple):
            sonuc, durum = sonuc
        if isinstance(sonuc, (dict, list)):
            sonuc = json.dumps(sonuc, ensure_ascii=False)
        return sonuc, durum

    def _hata(self, kod, yol, metin):
        if kod in self.hata_isleyicileri:
            return self._yanit(self.hata_isleyicileri[kod](yol), kod)
        return metin, kod

    def dispatch(self, method, yol):
        yol_var = False
        for desen, int_adlar, metotlar, fn in self.kurallar:
            m = desen.fullmatch(yol)
            if not m:
                continue
            yol_var = True
            if method not in metotlar:
                continue
            params = {k: int(v) if k in int_adlar else v for k, v in m.groupdict().items()}
            return self._yanit(fn(**params), 200)
        if yol_var:
            return self._hata(405, yol, "Method Not Allowed")
        return self._hata(404, yol, "Not Found")
''',
       tests=r'''app = MiniFlask()
URUNLER = {1: {"ad": "Çay", "fiyat": 85.5}}

@app.route("/")
def ana():
    return "Merhaba"

@app.route("/urunler/<int:uid>")
def urun(uid):
    if uid not in URUNLER:
        return {"hata": "yok"}, 404
    return URUNLER[uid]

@app.route("/urunler", methods=["POST"])
def ekle():
    return {"id": 2}, 201

@app.route("/sehir/<ad>/subeler")
def subeler(ad):
    return [ad.upper(), "merkez"]

assert app.dispatch("GET", "/") == ("Merhaba", 200), "metin aynen 200 ile"
assert app.dispatch("GET", "/urunler/1") == ('{"ad": "Çay", "fiyat": 85.5}', 200), "dict JSON'a çevrilmeli, int parametre int gelmeli"
assert app.dispatch("GET", "/urunler/9") == ('{"hata": "yok"}', 404), "demet içindeki dict de JSON olmalı"
assert app.dispatch("POST", "/urunler") == ('{"id": 2}', 201), "POST kuralı"
assert app.dispatch("GET", "/sehir/izmir/subeler") == ('["IZMIR", "merkez"]', 200), "metin parametresi ve liste gövde"
assert app.dispatch("GET", "/urunler/abc") == ("Not Found", 404), "int olmayan parametre 404"
assert app.dispatch("GET", "/urunler") == ("Method Not Allowed", 405), "yol var metot yok: 405"

@app.errorhandler(404)
def bulunamadi(yol):
    return {"hata": "bulunamadı", "yol": yol}

@app.errorhandler(405)
def metot(yol):
    return "Metot desteklenmiyor", 400

assert app.dispatch("GET", "/yok") == ('{"hata": "bulunamadı", "yol": "/yok"}', 404), "özel 404 işleyicisi; durum verilmemişse 404"
assert app.dispatch("DELETE", "/") == ("Metot desteklenmiyor", 400), "işleyicinin verdiği durum kodu kullanılmalı"
''',
       hints=['Her kuralı route anında bir kez derle (regex + int adları kümesi) ve listede sakla; dispatch\'te sırayla dene.', 'Yanıta çevirme mantığını (_yanit) tek yardımcıda topla; hem görünüm hem hata işleyici sonuçları için kullan.', 'Önce tüm kuralları dene; yol eşleşip metot uymadıysa bir bayrak tut, döngü sonunda 405/404 kararını ver.'],
       why='Bu, Flask\'ın çekirdeğinin küçültülmüş bir modelidir: kural derleme, sıralı eşleme, dönüştürücüler, dönüş değerinden yanıt üretme (make_response) ve hata işleyicileri. Bir çatıyı içten tanıyan geliştirici, "neden 405 alıyorum?" gibi soruları saniyeler içinde çözer.'),
  dict(id='flask-11', t='code', stage='Mini proje', diff=3,
       q='<p>Anadolu Market ürün API\'si. Başlangıç kodundaki <code>MiniApp</code> çatısı hazır (dokunma): görünüm fonksiyonları <code>(istek, **parametreler)</code> alır; <code>istek.args</code> sorgu sözlüğü, <code>istek.json</code> gövdedir; <code>app.istek(metot, url, json=None)</code> → <code>(govde, durum)</code>. Bir <b>uygulama fabrikası</b> yaz: <code>create_app(baslangic_urunleri)</code> her çağrıda <b>kendi</b> ürün deposuna sahip yeni bir uygulama döndürsün (depo: <code>baslangic_urunleri</code> listesinin kopyası; her ürün <code>{"id", "ad", "fiyat", "kategori"}</code>).</p><ul><li><code>GET /urunler</code>: tüm ürünler (id sırasıyla); <code>?kategori=</code> verilirse filtrele; <code>?max_fiyat=</code> sayıysa fiyatı ona eşit/küçük olanlar (sayı değilse <code>({"hata": ...}, 400)</code>).</li><li><code>GET /urunler/&lt;int:id&gt;</code>: ürün ya da <code>({"hata": "Ürün bulunamadı"}, 404)</code>.</li><li><code>POST /urunler</code>: gövde <code>ad</code> (boş olmayan metin), <code>fiyat</code> (pozitif sayı, bool değil), <code>kategori</code> (metin, isteğe bağlı, varsayılan <code>"Genel"</code>) içermeli. Geçersizse <code>({"hata": "Doğrulama hatası", "alanlar": [hatalı alan adları, sıralı]}, 422)</code>. Geçerliyse yeni id = en büyük id + 1 (depo boşsa 1), ürünü ekle, <code>(urun, 201)</code>.</li><li><code>DELETE /urunler/&lt;int:id&gt;</code>: sil, <code>("", 204)</code>; yoksa 404.</li></ul>',
       start=FRAMEWORK + r'''

def create_app(baslangic_urunleri):
    app = MiniApp()
    # TODO: depo ve route'lar
    return app
''',
       sol=FRAMEWORK + r'''

def create_app(baslangic_urunleri):
    app = MiniApp()
    depo = {u["id"]: dict(u) for u in baslangic_urunleri}
    BULUNAMADI = ({"hata": "Ürün bulunamadı"}, 404)

    @app.route("/urunler", methods=["GET", "POST"])
    def urunler(istek):
        if istek.method == "POST":
            return urun_ekle(istek.json or {})
        sonuc = [depo[k] for k in sorted(depo)]
        if "kategori" in istek.args:
            sonuc = [u for u in sonuc if u["kategori"] == istek.args["kategori"]]
        if "max_fiyat" in istek.args:
            try:
                ust = float(istek.args["max_fiyat"])
            except ValueError:
                return {"hata": "max_fiyat sayı olmalı"}, 400
            sonuc = [u for u in sonuc if u["fiyat"] <= ust]
        return sonuc

    def urun_ekle(veri):
        hatali = []
        ad = veri.get("ad")
        if not isinstance(ad, str) or not ad.strip():
            hatali.append("ad")
        fiyat = veri.get("fiyat")
        if isinstance(fiyat, bool) or not isinstance(fiyat, (int, float)) or fiyat <= 0:
            hatali.append("fiyat")
        kategori = veri.get("kategori", "Genel")
        if not isinstance(kategori, str):
            hatali.append("kategori")
        if hatali:
            return {"hata": "Doğrulama hatası", "alanlar": sorted(hatali)}, 422
        yeni_id = max(depo, default=0) + 1
        urun = {"id": yeni_id, "ad": ad.strip(), "fiyat": fiyat, "kategori": kategori}
        depo[yeni_id] = urun
        return urun, 201

    @app.route("/urunler/<int:uid>", methods=["GET", "DELETE"])
    def urun(istek, uid):
        if uid not in depo:
            return BULUNAMADI
        if istek.method == "DELETE":
            del depo[uid]
            return "", 204
        return depo[uid]

    return app
''',
       tests=r'''BASLANGIC = [{"id": 1, "ad": "Çay", "fiyat": 85.5, "kategori": "İçecek"},
             {"id": 3, "ad": "Bisküvi", "fiyat": 25.0, "kategori": "Atıştırmalık"},
             {"id": 2, "ad": "Kahve", "fiyat": 240.0, "kategori": "İçecek"}]
app = create_app(BASLANGIC)
g, d = app.istek("GET", "/urunler")
assert d == 200 and [u["id"] for u in g] == [1, 2, 3], "tüm ürünler id sırasıyla"
g, d = app.istek("GET", "/urunler?kategori=%C4%B0%C3%A7ecek&max_fiyat=100")
assert d == 200 and [u["ad"] for u in g] == ["Çay"], "kategori ve max_fiyat birlikte filtrelemeli"
assert app.istek("GET", "/urunler?max_fiyat=ucuz")[1] == 400, "sayı olmayan max_fiyat 400"
assert app.istek("GET", "/urunler/2") == ({"id": 2, "ad": "Kahve", "fiyat": 240.0, "kategori": "İçecek"}, 200), "tek ürün"
assert app.istek("GET", "/urunler/99") == ({"hata": "Ürün bulunamadı"}, 404), "olmayan ürün 404"
g, d = app.istek("POST", "/urunler", json={"ad": " Şeker ", "fiyat": 32})
assert (g, d) == ({"id": 4, "ad": "Şeker", "fiyat": 32, "kategori": "Genel"}, 201), f"yeni ürün 201: {g, d}"
g, d = app.istek("POST", "/urunler", json={"ad": "", "fiyat": True, "kategori": 5})
assert (g, d) == ({"hata": "Doğrulama hatası", "alanlar": ["ad", "fiyat", "kategori"]}, 422), f"422 ve sıralı alan listesi: {g}"
assert app.istek("POST", "/urunler")[1] == 422, "gövdesiz POST 422"
assert app.istek("DELETE", "/urunler/1") == ("", 204), "silme 204"
assert app.istek("DELETE", "/urunler/1")[1] == 404, "ikinci silme 404"
assert app.istek("PUT", "/urunler/2")[1] == 405, "tanımsız metot 405 (çatı halleder)"
app2 = create_app(BASLANGIC)
assert len(app2.istek("GET", "/urunler")[0]) == 3, "her fabrika çağrısı bağımsız depo almalı"
assert BASLANGIC[0]["ad"] == "Çay" and len(BASLANGIC) == 3, "başlangıç listesi değiştirilmemeli"
bos = create_app([])
assert bos.istek("POST", "/urunler", json={"ad": "Su", "fiyat": 10})[0]["id"] == 1, "boş depoda ilk id 1"
''',
       hints=['Depoyu create_app içinde yerel değişken olarak kur; iç görünüm fonksiyonları onu kapanış (closure) olarak görür, böylece her uygulama bağımsız olur.', 'Aynı yol için GET ve POST\'u tek fonksiyonda istek.method ile ayır; doğrulamayı ayrı bir yardımcı fonksiyona çıkar.', 'Yeni id: max(depo, default=0) + 1. Kopyalamak için dict(u) kullan; başlangıç verisini değiştirme.'],
       why='Uygulama fabrikası kalıbı, her testin temiz bir uygulama ve depo almasını sağlar; küresel durum testleri birbirine bağlar. Durum kodları (200, 201, 204, 400, 404, 405, 422) API sözleşmesinin parçasıdır ve istemciler onlara göre davranır.'),
]

L = dict(
  id='flask', lv='ileri', mod='Web ve API', min=60,
  title='Flask ile web uygulaması',
  sum='Flask uygulaması kurar; route, HTTP metotları, request/response, jsonify, Jinja2 şablonları, form doğrulama, hata işleyiciler, blueprint, uygulama fabrikası, test client ve gunicorn ile dağıtımı öğrenir, çatının içini mini bir yönlendirici yazarak kavrarsın.',
  goals=['Flask uygulamasını kurup kendi bilgisayarımda geliştirme sunucusuyla çalıştırabilirim.', 'Route, yol parametresi, HTTP metodu ve doğru durum koduyla uç noktalar tasarlayabilirim.', 'Jinja2 şablonlarıyla güvenli (autoescape) HTML üretir, formları sunucu tarafında doğrularım.', 'Blueprint, uygulama fabrikası, yapılandırma ve test client ile sürdürülebilir proje kurarım.', 'Dekoratörle route kaydeden mini bir çatı yazarak Flask\'ın iç işleyişini açıklayabilirim.'],
  body=body, ex=ex,
  faq=[
    dict(q='Flask kodunu neden burada çalıştıramıyorum?', a='Flask bir HTTP sunucusu başlatır ve ağ bağlantısı dinler; tarayıcıdaki Python motoru buna izin vermez. Alıştırmalar Flask\'ın mantığını (yönlendirme, şablon, doğrulama) taklit eder. Gerçek kodu kendi bilgisayarında sanal ortamda pip install flask ile kurup python -m flask --app app run --debug ile çalıştır.'),
    dict(q='flask run ile python app.py arasındaki fark ne?', a='python app.py, dosyanın sonunda app.run() çağrısı varsa çalışır. python -m flask --app app run ise Flask\'ın komut satırı aracını kullanır; --debug, ortam değişkenleri ve uygulama fabrikası desteği gibi kolaylıklar sunar. Her ikisi de yalnız geliştirme içindir; üretimde gunicorn ya da waitress kullan.'),
    dict(q='Flask ile REST API mi yazmalıyım, FastAPI ile mi?', a='Flask ile de çok iyi API yazılır (jsonify, blueprint, Flask-SQLAlchemy). FastAPI tip ipuçlarından otomatik doğrulama ve Swagger dokümantasyonu üretir, async\'i doğal destekler. Sunucu tarafında HTML üreten panellerde Flask, saf JSON API\'lerde çoğu zaman FastAPI tercih edilir.'),
    dict(q='Flask uygulamam aynı anda kaç kullanıcıya hizmet verir?', a='Geliştirme sunucusu buna göre tasarlanmamıştır. gunicorn -w 4 dört işlem (worker) başlatır; her biri bir isteği işler. Genel kural (2 x çekirdek sayısı) + 1 işlemdir. Uzun beklemeli işler (e-posta, rapor) isteğin içinde değil, kuyruk ve arka plan işçisinde (Celery, RQ) yapılmalıdır.'),
  ],
  mistakes=[
    dict(why='Üretimde debug modu etkileşimli hata konsolu açar; sunucuda kod çalıştırma riskidir.',
         bad='app.run(host="0.0.0.0", debug=True)', good='# üretim: gunicorn -w 4 "magaza:create_app()"\n# debug yalnız yerelde: python -m flask --app magaza run --debug'),
    dict(why='Başarılı POST sonrası şablonu döndürmek, sayfa yenilendiğinde formun yeniden gönderilmesine yol açar.',
         bad='if form_gecerli:\n    kaydet()\n    return render_template("form.html")', good='if form_gecerli:\n    kaydet()\n    return redirect(url_for("tesekkurler"))'),
    dict(why='request.args değerleri metindir; int() hatalı girdide 500 verir. type=int geçersiz değerde varsayılana düşer.',
         bad='sayfa = int(request.args["sayfa"])', good='sayfa = request.args.get("sayfa", 1, type=int)'),
    dict(why='Kullanıcı verisini |safe ile basmak XSS açığıdır.',
         bad='<p>{{ yorum|safe }}</p>', good='<p>{{ yorum }}</p>'),
    dict(why='Gizli anahtarı koda yazmak onu git geçmişine sızdırır.',
         bad='app.config["SECRET_KEY"] = "cok-gizli-123"', good='app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]'),
  ])

emit(L, '/home/claude/py/v2/i4/flask.js')
