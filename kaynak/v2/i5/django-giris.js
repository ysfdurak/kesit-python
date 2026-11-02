/* Kesit Python v2 — django-giris */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'django-giris',
  lv: 'ileri',
  mod: 'Web ve API',
  min: 75,
  title: 'Django\'ya giriş: MVT, ORM, admin ve DRF',
  sum: 'Django projesi ve uygulaması kurar; URL, view, model, migration, admin, şablon, form ve kimlik doğrulamayı tanır; ORM sorgularını (filter, exclude, annotate, aggregate, select_related) SQL karşılıklarıyla birlikte düşünmeyi Anadolu Market örneğiyle öğrenirsin.',
  goals: [
    'startproject/startapp ile Django projesi kurar, MVT katmanlarının görevini açıklayabilirim.',
    'urls.py\'de path dönüştürücüleriyle (<int:pk>) yönlendirme yazar, fonksiyon ve sınıf tabanlı view seçebilirim.',
    'Model tanımlar, makemigrations/migrate akışını yönetir, ORM sorgusunun ürettiği SQL\'i tahmin edebilirim.',
    'filter, exclude, Q, annotate, aggregate ve select_related ile verimli sorgu yazar, N+1 sorununu fark ederim.',
    'ModelForm, admin paneli, kimlik doğrulama ve CSRF/XSS varsayılanlarıyla güvenli bir uygulamayı yayına hazırlayabilirim.'
  ],
  body: `
<h2>Neden Django?</h2>
<p>Flask ve FastAPI derslerinde küçük, esnek çatıları (framework) gördün: yönlendirme verirler, gerisini sen seçersin. Django ise "pili içinde" (batteries included) yaklaşımıyla gelir: ORM, migration sistemi, admin paneli, kullanıcı ve yetki sistemi, form doğrulama, şablon motoru, önbellek, e-posta ve güvenlik korumaları tek pakette ve birbiriyle uyumlu. Anadolu Market'in iç yönetim paneli, Ilgaz Bank'ın kredi başvuru takip ekranı ya da belediyenin randevu sistemi gibi <b>veritabanı ağırlıklı, formlu, yetkili kullanıcılı</b> uygulamalarda Django ile birkaç günde çalışan bir ürün çıkarabilirsin.</p>
<div class="warn"><b>Django tarayıcıda çalışmaz</b>Bu dersteki Django kodları <code>pre</code> kutularında gösterim içindir; kendi bilgisayarında denemen gerekir. Çalıştırılabilir kutular ve alıştırmalar ise Django'nun arkasındaki mantığı (QuerySet, URL eşleme, form doğrulama, migration SQL'i) saf Python ve sqlite3 ile taklit eder. Böylece Django'yu "sihir" olarak değil, anlaşılır bir makine olarak öğrenirsin.</div>

<h2>Kurulum: proje ve uygulama</h2>
<div class="steps-list"><ol>
<li>Proje klasörü aç ve sanal ortam kur (Sanal ortam ve pip dersini hatırla).</li>
<li>Django'yu kur, projeyi oluştur, bir uygulama (app) ekle.</li>
<li>Veritabanı tablolarını oluştur ve geliştirme sunucusunu başlat; tarayıcıda <code>http://127.0.0.1:8000/</code> adresini aç.</li>
</ol></div>
<pre class="code"># Windows (PowerShell)
python -m venv .venv
.venv\\Scripts\\Activate.ps1
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

pip install django
django-admin startproject anadolu_market .
python manage.py startapp magaza
python manage.py migrate
python manage.py runserver</pre>
<p>Komutların sonunda şu yapı oluşur:</p>
<pre class="code">anadolu_market/        # proje paketi: ayarlar ve kök URL'ler
    settings.py
    urls.py
    wsgi.py / asgi.py  # sunucunun giriş noktaları
magaza/                # uygulama: tek bir iş alanı
    models.py  views.py  admin.py  apps.py  tests.py
    migrations/
manage.py              # yönetim komutlarının kapısı</pre>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>Ne?</th><th>Anadolu Market örneği</th></tr>
<tr><td>Proje (project)</td><td>Ayarlar, kök URL'ler, uygulamaların toplamı</td><td><code>anadolu_market</code></td></tr>
<tr><td>Uygulama (app)</td><td>Tek bir iş alanının model, view ve şablonları; başka projeye taşınabilir</td><td><code>magaza</code>, <code>siparis</code>, <code>musteri</code></td></tr>
<tr><td><code>INSTALLED_APPS</code></td><td>Projenin tanıdığı uygulamalar</td><td><code>"magaza.apps.MagazaConfig"</code> eklenmezse modeller görünmez</td></tr>
</table></div>
<p>Yeni uygulamayı <code>settings.py</code> içindeki <code>INSTALLED_APPS</code> listesine eklemeyi unutma. Aynı dosyada <code>DATABASES</code> (varsayılan SQLite), <code>DEBUG</code>, <code>ALLOWED_HOSTS</code>, <code>SECRET_KEY</code>, <code>TEMPLATES</code> ve <code>STATIC_URL</code> ayarları bulunur.</p>

<h2>MVT: Model, View, Template</h2>
<p>Django kendi mimarisine MVT der. Klasik MVC ile eşleşmesi biraz kafa karıştırır: Django'nun "view"u MVC'deki controller'a, "template"i MVC'deki view'a karşılık gelir.</p>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Görevi</th><th>Dosya</th></tr>
<tr><td>Model</td><td>Veri yapısı ve iş kuralları; tabloya eşlenir</td><td><code>models.py</code></td></tr>
<tr><td>View</td><td>İsteği alır, modelden veri çeker, yanıt döndürür</td><td><code>views.py</code></td></tr>
<tr><td>Template</td><td>HTML üretimi; mantıktan arındırılmış sunum</td><td><code>templates/</code></td></tr>
<tr><td>URLconf</td><td>Yolu doğru view'a yönlendirir</td><td><code>urls.py</code></td></tr>
</table></div>
<p>Bir isteğin yolculuğu: tarayıcı <code>/urunler/42/</code> ister → ara katmanlar (middleware: oturum, CSRF, güvenlik başlıkları) çalışır → URLconf deseni eşler ve <code>pk=42</code> yakalar → view modeli sorgular → şablon HTML üretir → yanıt yine ara katmanlardan geçip döner.</p>

<h2>URL'ler ve view'lar</h2>
<pre class="code"># magaza/urls.py
from django.urls import path
from . import views

app_name = "magaza"
urlpatterns = [
    path("", views.urun_listesi, name="liste"),
    path("urunler/yeni/", views.UrunOlustur.as_view(), name="yeni"),
    path("urunler/&lt;int:pk&gt;/", views.UrunDetay.as_view(), name="detay"),
    path("kategori/&lt;slug:slug&gt;/", views.kategori, name="kategori"),
]
# anadolu_market/urls.py içinde: path("magaza/", include("magaza.urls"))</pre>
<p>Desenler <b>yukarıdan aşağıya</b> denenir ve ilk eşleşen kazanır. <code>&lt;int:pk&gt;</code> bir dönüştürücüdür (converter): yalnız rakamları eşler ve değeri <code>int</code> olarak view'a verir. Diğerleri: <code>str</code> (eğik çizgi hariç her şey), <code>slug</code>, <code>uuid</code>, <code>path</code>. Arka planda her desen bir düzenli ifadeye çevrilir; aşağıdaki kutu bu fikri taklit ediyor.</p>
<pre class="py">import re

DONUSTURUCU = {"int": (r"[0-9]+", int), "str": (r"[^/]+", str), "slug": (r"[-a-zA-Z0-9_]+", str)}

def derle(desen):
    cevirici = {}
    def degistir(m):
        tur, ad = m.group(1), m.group(2)
        cevirici[ad] = DONUSTURUCU[tur][1]
        return f"(?P&lt;{ad}&gt;{DONUSTURUCU[tur][0]})"
    regex = re.sub(r"&lt;(\\w+):(\\w+)&gt;", degistir, desen)
    return re.compile("^" + regex + "$"), cevirici

regex, cevirici = derle("urunler/&lt;int:pk&gt;/")
for yol in ["urunler/42/", "urunler/abc/", "urunler/7"]:
    m = regex.match(yol)
    if m:
        print(yol, "-&gt;", {k: cevirici[k](v) for k, v in m.groupdict().items()})
    else:
        print(yol, "-&gt; 404")</pre>
<p>View iki biçimde yazılır. Fonksiyon tabanlı view (FBV) açık ve basittir; sınıf tabanlı view (CBV) listeleme, detay, oluşturma gibi tekrarlayan kalıpları hazır verir.</p>
<pre class="code"># magaza/views.py
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView
from django.contrib.auth.decorators import login_required
from .models import Urun

def urun_listesi(request):
    urunler = Urun.objects.filter(aktif=True).order_by("-eklenme")
    return render(request, "magaza/liste.html", {"urunler": urunler})

class UrunDetay(DetailView):
    model = Urun                       # pk'yı URL'den alır, yoksa 404
    template_name = "magaza/detay.html"

class UrunOlustur(CreateView):
    model = Urun
    fields = ["ad", "kategori", "fiyat", "stok"]
    success_url = "/magaza/"</pre>

<h2>Modeller ve ORM</h2>
<p>Model, bir tabloyu temsil eden Python sınıfıdır. Her alan (field) bir sütundur; <code>id</code> birincil anahtarı otomatik eklenir.</p>
<pre class="code"># magaza/models.py
from django.db import models

class Kategori(models.Model):
    ad = models.CharField(max_length=60, unique=True)

class Urun(models.Model):
    ad = models.CharField(max_length=120)
    kategori = models.ForeignKey(Kategori, on_delete=models.PROTECT, related_name="urunler")
    fiyat = models.DecimalField(max_digits=10, decimal_places=2)
    stok = models.PositiveIntegerField(default=0)
    aktif = models.BooleanField(default=True)
    eklenme = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ad</pre>
<p><code>Urun.objects</code> bir yöneticidir (manager); ondan dönen <b>QuerySet</b> iki özelliğe sahiptir: <b>tembeldir</b> (lazy), yani üzerinde döngü kurana, <code>len</code>, <code>list</code> ya da dilim uygulayana kadar veritabanına gitmez; ve <b>zincirlenebilir</b>dir, her <code>filter</code> yeni bir QuerySet döndürür, eskisini değiştirmez. Alan adı ile işlem arasına çift alt çizgi koyarak sorgu yaparsın; buna lookup denir.</p>
<div class="tbl-wrap"><table>
<tr><th>ORM</th><th>SQL karşılığı (yaklaşık)</th></tr>
<tr><td><code>filter(fiyat__gt=100)</code></td><td><code>WHERE fiyat &gt; 100</code></td></tr>
<tr><td><code>filter(ad__icontains="çay")</code></td><td><code>WHERE ad LIKE '%çay%'</code> (büyük/küçük harf duyarsız)</td></tr>
<tr><td><code>filter(sehir__in=["İzmir", "Bursa"])</code></td><td><code>WHERE sehir IN (...)</code></td></tr>
<tr><td><code>exclude(stok=0)</code></td><td><code>WHERE NOT (stok = 0)</code></td></tr>
<tr><td><code>filter(kategori__ad="İçecek")</code></td><td><code>JOIN kategori ... WHERE kategori.ad = ...</code></td></tr>
<tr><td><code>aggregate(Sum("fiyat"))</code></td><td><code>SELECT SUM(fiyat)</code> → tek sözlük</td></tr>
<tr><td><code>values("kategori").annotate(n=Count("id"))</code></td><td><code>GROUP BY kategori</code> → satır başına değer</td></tr>
<tr><td><code>order_by("-fiyat")[:5]</code></td><td><code>ORDER BY fiyat DESC LIMIT 5</code></td></tr>
</table></div>
<pre class="code">from django.db.models import Q, F, Count, Sum, Avg

pahali = Urun.objects.filter(fiyat__gte=500).exclude(stok=0)
print(pahali.query)            # üretilen SQL'i görürsün
izmir_ya_da_buyuk = Siparis.objects.filter(Q(sehir="İzmir") | Q(tutar__gt=1000))
Urun.objects.filter(stok__lt=F("kritik_stok"))          # iki sütunu karşılaştır
Urun.objects.aggregate(toplam=Sum("fiyat"), ort=Avg("fiyat"))
Kategori.objects.annotate(urun_sayisi=Count("urunler")).order_by("-urun_sayisi")
Urun.objects.select_related("kategori")                 # tek JOIN, N+1 yok
Kategori.objects.prefetch_related("urunler")            # 2 sorgu, ters ilişki</pre>
<p>Aşağıdaki kutu, zincirlenebilir ve lookup destekli bir QuerySet'in özünü 20 satırda taklit ediyor. Alıştırmalarda bunu adım adım sen kuracaksın.</p>
<pre class="py">ISLEM = {
    "exact": lambda a, b: a == b,
    "gt": lambda a, b: a &gt; b,
    "lte": lambda a, b: a &lt;= b,
    "icontains": lambda a, b: b.lower() in a.lower(),
}

class Sorgu:
    def __init__(self, kayitlar, kosullar=()):
        self.kayitlar, self.kosullar = kayitlar, list(kosullar)
    def filter(self, **kw):
        return Sorgu(self.kayitlar, self.kosullar + list(kw.items()))
    def __iter__(self):                      # tembel: ancak gezilince çalışır
        for k in self.kayitlar:
            if all(ISLEM[(a.split("__") + ["exact"])[1]](k[a.split("__")[0]], v)
                   for a, v in self.kosullar):
                yield k

urunler = [{"ad": "Rize Çayı", "fiyat": 120}, {"ad": "Türk Kahvesi", "fiyat": 350},
           {"ad": "Yeşil Çay", "fiyat": 90}]
qs = Sorgu(urunler).filter(ad__icontains="çay")
ucuz = qs.filter(fiyat__lte=100)
print([u["ad"] for u in qs])
print([u["ad"] for u in ucuz])</pre>
<p>ORM sonunda SQL üretir. Aynı sorgunun SQL karşılığını sqlite3 ile görmek, Django'da hangi sorgunun pahalı olduğunu sezmeni sağlar:</p>
<pre class="py">import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE kategori (id INTEGER PRIMARY KEY, ad TEXT);
CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, fiyat REAL, kategori_id INTEGER);
INSERT INTO kategori VALUES (1, 'İçecek'), (2, 'Mutfak');
INSERT INTO urun VALUES (1, 'Çay', 120, 1), (2, 'Kahve', 350, 1), (3, 'Bardak', 25, 2);
""")
# Kategori.objects.annotate(n=Count("urunler"), ort=Avg("urunler__fiyat")).order_by("-n")
sql = """SELECT k.ad, COUNT(u.id) AS n, AVG(u.fiyat) AS ort
         FROM kategori k LEFT JOIN urun u ON u.kategori_id = k.id
         GROUP BY k.id ORDER BY n DESC"""
for satir in db.execute(sql):
    print(satir)</pre>

<h2>Migration: modelden tabloya</h2>
<p>Modeli değiştirdiğinde veritabanı kendiliğinden değişmez. İki adım vardır: <code>makemigrations</code> modeldeki farkı bulup <code>migrations/0002_...py</code> dosyası <b>yazar</b>; <code>migrate</code> bu dosyaları veritabanına <b>uygular</b>. Migration dosyaları git'e girer; ekipteki herkes ve sunucu aynı şemaya böyle ulaşır.</p>
<pre class="code">python manage.py makemigrations magaza
python manage.py sqlmigrate magaza 0001     # üretilecek SQL'i göster
python manage.py showmigrations
python manage.py migrate</pre>
<p>Django'nun yaptığını küçük ölçekte taklit edelim: dataclass alanlarından <code>CREATE TABLE</code> üretmek.</p>
<pre class="py">from dataclasses import dataclass, fields

TIP = {int: "INTEGER", str: "VARCHAR(120)", float: "REAL", bool: "BOOL"}

@dataclass
class Musteri:
    ad: str
    sehir: str
    puan: float
    aktif: bool

def create_table(model):
    sutunlar = ['"id" INTEGER PRIMARY KEY AUTOINCREMENT']
    sutunlar += [f'"{f.name}" {TIP[f.type]} NOT NULL' for f in fields(model)]
    return f'CREATE TABLE "magaza_{model.__name__.lower()}" (' + ", ".join(sutunlar) + ");"

print(create_table(Musteri))</pre>
<p>Tablo adının <code>magaza_musteri</code> olmasına dikkat: Django varsayılan olarak <code>uygulama_model</code> adını kullanır.</p>

<h2>Admin paneli</h2>
<p>Django'nun en çok sevilen özelliği: birkaç satırla, yetkili personelin veriyi listeleyip arayıp düzenleyebileceği bir yönetim paneli.</p>
<pre class="code"># magaza/admin.py
from django.contrib import admin
from .models import Urun

@admin.register(Urun)
class UrunAdmin(admin.ModelAdmin):
    list_display = ["ad", "kategori", "fiyat", "stok", "aktif"]
    list_filter = ["kategori", "aktif"]
    search_fields = ["ad"]
    list_select_related = ["kategori"]

# terminalde: python manage.py createsuperuser  → /admin/ adresine gir</pre>

<h2>Şablonlar, formlar ve kimlik doğrulama</h2>
<pre class="code">&lt;!-- magaza/templates/magaza/liste.html --&gt;
{% extends "base.html" %}
{% block icerik %}
  {% for u in urunler %}
    &lt;p&gt;{{ u.ad }} — {{ u.fiyat|floatformat:2 }} TL&lt;/p&gt;
  {% empty %}
    &lt;p&gt;Ürün yok.&lt;/p&gt;
  {% endfor %}
{% endblock %}</pre>
<p><code>{{ u.ad }}</code> çıktısı otomatik kaçırılır (autoescape): ürün adına <code>&lt;script&gt;</code> yazılsa bile metin olarak görünür. Formlarda ise <code>ModelForm</code>, model alanlarından form üretir; <code>is_valid()</code> her alanı dönüştürür, <code>clean_&lt;alan&gt;</code> metotlarındaki kuralları çalıştırır, hataları <code>form.errors</code>'a, temiz veriyi <code>form.cleaned_data</code>'ya koyar.</p>
<pre class="code">from django import forms

class UrunFormu(forms.ModelForm):
    class Meta:
        model = Urun
        fields = ["ad", "kategori", "fiyat", "stok"]

    def clean_fiyat(self):
        fiyat = self.cleaned_data["fiyat"]
        if fiyat &lt;= 0:
            raise forms.ValidationError("Fiyat pozitif olmalı.")
        return fiyat

@login_required
def urun_ekle(request):
    form = UrunFormu(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("magaza:liste")
    return render(request, "magaza/form.html", {"form": form})
# şablonda: &lt;form method="post"&gt;{% csrf_token %}{{ form.as_p }}&lt;/form&gt;</pre>
<p>Aynı doğrulama akışının saf Python taklidi:</p>
<pre class="py">class UrunFormu:
    def __init__(self, veri):
        self.veri, self.errors, self.cleaned_data = veri, {}, {}
    def is_valid(self):
        ad = self.veri.get("ad", "").strip()
        if not ad:
            self.errors["ad"] = "Bu alan zorunlu."
        try:
            fiyat = float(self.veri.get("fiyat", ""))
            if fiyat &lt;= 0:
                self.errors["fiyat"] = "Fiyat pozitif olmalı."
        except ValueError:
            self.errors["fiyat"] = "Geçerli bir sayı gir."
        if not self.errors:
            self.cleaned_data = {"ad": ad, "fiyat": fiyat}
        return not self.errors

f = UrunFormu({"ad": "  Rize Çayı ", "fiyat": "120.5"})
print(f.is_valid(), f.cleaned_data)
g = UrunFormu({"ad": "", "fiyat": "bedava"})
print(g.is_valid(), g.errors)</pre>
<p>Kimlik doğrulama hazırdır: <code>django.contrib.auth</code> kullanıcı modelini, parola özetlemeyi (PBKDF2), giriş/çıkış view'larını, gruplar ve izinleri (<code>user.has_perm("magaza.change_urun")</code>) sağlar. View'ı korumak için <code>@login_required</code> ya da CBV'de <code>LoginRequiredMixin</code> kullanırsın.</p>

<h2>Django REST Framework (DRF)</h2>
<p>Mobil uygulama ya da React ön yüz için JSON API gerekiyorsa DRF eklenir (<code>pip install djangorestframework</code>). Serializer, ModelForm'un API karşılığıdır.</p>
<pre class="code">from rest_framework import serializers, viewsets, routers, permissions

class UrunSerializer(serializers.ModelSerializer):
    class Meta:
        model = Urun
        fields = ["id", "ad", "fiyat", "stok"]

class UrunViewSet(viewsets.ModelViewSet):
    queryset = Urun.objects.select_related("kategori").filter(aktif=True)
    serializer_class = UrunSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

router = routers.DefaultRouter()
router.register("urunler", UrunViewSet)   # GET/POST /urunler/, GET/PUT/DELETE /urunler/5/</pre>

<h2>Güvenlik varsayılanları ve dağıtım</h2>
<div class="tbl-wrap"><table>
<tr><th>Tehdit</th><th>Django'nun varsayılanı</th><th>Seni bozan şey</th></tr>
<tr><td>SQL enjeksiyonu</td><td>ORM her değeri parametre olarak gönderir</td><td><code>raw()</code>/<code>extra()</code> içinde f-string</td></tr>
<tr><td>XSS</td><td>Şablonlarda otomatik kaçış</td><td><code>|safe</code>, <code>mark_safe</code> ile kullanıcı verisi</td></tr>
<tr><td>CSRF</td><td><code>CsrfViewMiddleware</code> + <code>{% csrf_token %}</code></td><td>Gelişigüzel <code>@csrf_exempt</code></td></tr>
<tr><td>Clickjacking</td><td><code>X-Frame-Options: DENY</code></td><td>Middleware'i kaldırmak</td></tr>
<tr><td>Parola</td><td>PBKDF2 ile tuzlu özet</td><td>Parolayı kendi alanında düz saklamak</td></tr>
</table></div>
<p>Yayına almadan önce: <code>DEBUG = False</code>, <code>SECRET_KEY</code> ortam değişkeninden, <code>ALLOWED_HOSTS</code> dolu, veritabanı PostgreSQL, statik dosyalar <code>collectstatic</code> ile toplanmış. Uygulamayı <code>runserver</code> ile değil, gunicorn (WSGI) ya da uvicorn (ASGI) ile çalıştırırsın; önüne nginx ya da bir platform (Render, Railway, Fly.io) konur. Docker ve dağıtım dersinde bu adımları konteynerle birleştireceksin.</p>
<pre class="code">python manage.py check --deploy        # güvenlik ayarlarını denetler
python manage.py collectstatic --noinput
gunicorn anadolu_market.wsgi:application --bind 0.0.0.0:8000 --workers 3</pre>
<div class="tip"><b>İlk projede sıralama</b>Model → makemigrations/migrate → admin'e kaydet → admin'den örnek veri gir → view + URL → şablon. Admin, view yazmadan verini görmeni sağlar; hata ayıklamayı çok kısaltır.</div>
<div class="note"><b>Gerçek işte</b>Kurumsal Django projelerinde en sık performans sorunu N+1 sorgudur: 50 siparişlik bir listede her satır için müşteri adını şablonda <code>{{ s.musteri.ad }}</code> diye yazmak 1 + 50 sorgu üretir. Kod incelemesinde liste view'larında <code>select_related</code>/<code>prefetch_related</code> aranır; geliştirme sırasında django-debug-toolbar ile sayfa başına sorgu sayısı izlenir. İkinci klasik: modeli değiştirip migration dosyasını commit etmeyi unutmak; sunucuda "no such column" hatası alınır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sorgu sayısını ölç, sonra optimize et</h3>
<p><code>from django.db import connection</code> ile <code>len(connection.queries)</code> (DEBUG açıkken) ya da testlerde <code>self.assertNumQueries(2)</code> kullan. <code>only("ad", "fiyat")</code> ve <code>defer("aciklama")</code> gereksiz sütunları çekmez; <code>values_list("ad", flat=True)</code> model nesnesi bile kurmaz. Büyük tabloda <code>iterator()</code> belleği korur; toplu yazmada <code>bulk_create</code> ve <code>update()</code> tek sorguyla çalışır.</p>
<h3>İşlem bütünlüğü ve yarış durumları</h3>
<p>Stok düşme gibi işlemleri <code>transaction.atomic()</code> içinde yap; iki kullanıcı aynı anda son ürünü alırken <code>select_for_update()</code> satırı kilitler. <code>Urun.objects.filter(pk=5).update(stok=F("stok") - 1)</code> ise okuma-yazma arasında kayıp güncellemeyi önler, çünkü hesap veritabanında yapılır.</p>
<h3>Mimari alışkanlıklar</h3>
<p>İş kuralını view'a gömme; model metotlarına ya da ayrı bir <code>services.py</code> katmanına koy. Sinyalleri (signals) ölçülü kullan; gizli yan etkiler hata ayıklamayı zorlaştırır. Ayarları <code>django-environ</code> ya da ortam değişkenleriyle yönet, <code>pytest-django</code> ile test yaz. Uzun süren işleri (e-posta, rapor) Celery gibi bir kuyruğa ver; bunun mantığını Orkestrasyon dersinde göreceksin.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Django\'nun MVT mimarisinde, isteği alıp modelden veri çeken ve yanıt döndüren katman hangisidir?',
      o: ['Template', 'View', 'Model', 'Middleware'],
      a: 1,
      why: 'Django\'da view, MVC\'deki controller rolündedir: isteği işler, veriyi toplar, şablonu doldurur. Template yalnız sunumdur, model veri ve kurallardır, middleware ise her isteğin önünde/arkasında çalışan ortak katmandır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Modele yeni bir <code>indirim</code> alanı ekledin. Veritabanında sütunun oluşması için doğru sıra hangisi?',
      o: ['Yalnız <code>migrate</code> çalıştırmak', '<code>makemigrations</code>, sonra <code>migrate</code>', '<code>migrate</code>, sonra <code>makemigrations</code>', 'Sunucuyu yeniden başlatmak yeter'],
      a: 1,
      why: 'makemigrations model farkını bulup migration dosyasını yazar; migrate o dosyayı veritabanına uygular. Dosya yazılmadan migrate yapacak bir şey bulamaz; sunucuyu yeniden başlatmak şemayı değiştirmez.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Sipariş listesi şablonunda her satırda <code>{{ s.musteri.ad }}</code> yazdırılıyor ve sayfa 101 sorgu üretiyor. En doğru düzeltme hangisi?',
      o: ['Şablonda <code>|safe</code> kullanmak', 'View\'da <code>Siparis.objects.select_related("musteri")</code>', 'Sayfayı önbelleğe alıp sorunu gizlemek', '<code>Siparis.objects.all()</code> yerine <code>list()</code> kullanmak'],
      a: 1,
      why: 'Her siparişte ayrı müşteri sorgusu atılması N+1 sorunudur. select_related ileri yönlü ForeignKey için tek bir JOIN ile müşteriyi de getirir. list() sorgu sayısını değiştirmez, önbellek ise sorunu yalnız örter.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'QuerySet gibi zincirlenen bu sınıf ne yazdırır?',
      code: 'class Sorgu:\n    def __init__(self, kosullar=()):\n        self.kosullar = list(kosullar)\n    def filter(self, **kw):\n        return Sorgu(self.kosullar + list(kw.items()))\n\ntum = Sorgu()\nizmir = tum.filter(sehir="İzmir")\nbuyuk = izmir.filter(tutar__gt=500)\nprint(len(tum.kosullar), len(izmir.kosullar), len(buyuk.kosullar))\n',
      o: ['2 2 2', '0 1 2', '0 0 2', '1 1 2'],
      a: 1,
      why: 'Her filter yeni bir nesne döndürür ve eskisini değiştirmez; Django QuerySet\'i de böyle çalışır. Bu yüzden tum, izmir ve buyuk birbirinden bağımsızdır ve 0, 1, 2 koşul taşır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Lookup ayrıştırma: bu kod ne yazdırır?',
      code: 'for anahtar in ["fiyat__gt", "ad", "kategori__ad__icontains"]:\n    parcalar = anahtar.split("__")\n    if parcalar[-1] in {"gt", "lt", "icontains", "exact"}:\n        alan, islem = "__".join(parcalar[:-1]), parcalar[-1]\n    else:\n        alan, islem = anahtar, "exact"\n    print(alan, islem)\n',
      o: ['fiyat gt\nad exact\nkategori__ad icontains', 'fiyat gt\nad ad\nkategori ad', 'fiyat gt\nad exact\nkategori ad__icontains', 'fiyat__gt exact\nad exact\nkategori__ad__icontains exact'],
      a: 0,
      why: 'Son parça bilinen bir işlemse ayrılır, kalan parçalar alan yolu olarak yeniden birleştirilir; işlem yoksa varsayılan exact\'tir. Django da ilişki üzerinden giden yolları (kategori__ad) böyle çözer.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu sqlite3 sorgusu (bir <code>aggregate</code> karşılığı) ne yazdırır?',
      code: 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE siparis (sehir TEXT, tutar REAL)")\ndb.executemany("INSERT INTO siparis VALUES (?, ?)",\n               [("İzmir", 100), ("Ankara", 300), ("İzmir", 50)])\nsatir = db.execute("SELECT COUNT(*), SUM(tutar) FROM siparis WHERE sehir = ?", ("İzmir",)).fetchone()\nprint(satir)\n',
      o: ['(3, 450.0)', '(2, 150.0)', '[(2, 150.0)]', '(2, 150)'],
      a: 1,
      why: 'fetchone tek bir demet döndürür, liste değil. İzmir\'de iki satır vardır; REAL sütununda toplam 150.0 olarak gelir. Bu, Siparis.objects.filter(sehir="İzmir").aggregate(Count("id"), Sum("tutar")) sorgusunun SQL karşılığıdır.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Dataclass alanlarından Django tarzı <code>CREATE TABLE</code> ifadesi üreten programın satırlarını sırala.</p>',
      lines: ['from dataclasses import dataclass, fields', '@dataclass', 'class Sube:', '    sehir: str', '    calisan: int', 'sutunlar = [f"{f.name} {\'TEXT\' if f.type is str else \'INTEGER\'}" for f in fields(Sube)]', 'print(f"CREATE TABLE magaza_sube ({\', \'.join(sutunlar)});")'],
      expect: 'CREATE TABLE magaza_sube (sehir TEXT, calisan INTEGER);\n',
      hint: 'Önce içe aktarma, sonra dekoratör ve sınıf; sütun listesi sınıf tanımlandıktan sonra kurulabilir.',
      why: 'fields() dataclass\'ın alanlarını tanım sırasıyla verir; her alanın type bilgisi SQL tipine eşlenir. Django\'nun migration motoru da model alanlarını gezip benzer biçimde SQL üretir.' },
    { id: 'django-giris-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>lookup_ayir(anahtar)</code> fonksiyonunu yaz. Django lookup anahtarını <code>(alan, islem)</code> demetine ayırsın. Bilinen işlemler: <code>exact, iexact, gt, gte, lt, lte, contains, icontains, in, startswith</code>. Son parça bunlardan biriyse ayrılır, değilse işlem <code>"exact"</code> olur. Alan yolu birden çok parçalı olabilir: <code>"kategori__ad__icontains"</code> → <code>("kategori__ad", "icontains")</code>.</p>',
      guide: ['Bilinen işlemleri bir kümede tut.', 'Anahtarı "__" ile parçala.', 'Son parça kümedeyse: alan = kalan parçaların "__" ile birleşimi, işlem = son parça.', 'Değilse: alan = anahtarın tamamı, işlem = "exact".'],
      example: 'yol = "musteri__adres__sehir"\nparcalar = yol.split("__")\nprint(parcalar, parcalar[-1], "__".join(parcalar[:-1]))\n',
      start: 'ISLEMLER = {"exact", "iexact", "gt", "gte", "lt", "lte", "contains", "icontains", "in", "startswith"}\n\ndef lookup_ayir(anahtar):\n    parcalar = anahtar.split("__")\n    # TODO: son parça bir işlem mi? değilse "exact" kullan\n    pass\n',
      sol: 'ISLEMLER = {"exact", "iexact", "gt", "gte", "lt", "lte", "contains", "icontains", "in", "startswith"}\n\ndef lookup_ayir(anahtar):\n    parcalar = anahtar.split("__")\n    if len(parcalar) > 1 and parcalar[-1] in ISLEMLER:\n        return "__".join(parcalar[:-1]), parcalar[-1]\n    return anahtar, "exact"\n',
      tests: 'assert lookup_ayir("fiyat__gt") == ("fiyat", "gt"), "fiyat__gt -> (fiyat, gt) olmalı"\nassert lookup_ayir("sehir") == ("sehir", "exact"), "işlem yoksa varsayılan exact olmalı"\nassert lookup_ayir("kategori__ad__icontains") == ("kategori__ad", "icontains"), "ilişki yolu korunmalı: (kategori__ad, icontains)"\nassert lookup_ayir("musteri__sehir") == ("musteri__sehir", "exact"), "son parça işlem değilse tüm anahtar alan yoludur"\n',
      hints: ['split("__") parçaların listesini verir; parcalar[-1] son parçadır.', 'Son parça ISLEMLER içindeyse "__".join(parcalar[:-1]) alan yolunu verir.', 'if parcalar[-1] in ISLEMLER: return "__".join(parcalar[:-1]), parcalar[-1]'],
      why: 'Django lookup\'ları sağdan okunur: son parça işlemse ayrılır, kalanı ilişki boyunca giden alan yoludur.' },
    { id: 'django-giris-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>eslesir(kayit, anahtar, deger)</code> fonksiyonunu yaz: kayıt sözlüğü verilen lookup koşulunu sağlıyorsa <code>True</code> döndürsün. Desteklenecek işlemler: <code>exact</code> (varsayılan), <code>gt</code>, <code>gte</code>, <code>lt</code>, <code>lte</code>, <code>icontains</code> (büyük/küçük harf duyarsız içerir), <code>in</code>, <code>startswith</code>. Alan tek parçalıdır (<code>"fiyat__gt"</code> gibi). <code>lookup_ayir</code> hazır verildi.</p>',
      guide: ['lookup_ayir ile alan ve işlemi al.', 'Kayıttan alanın değerini oku.', 'İşlem adını bir lambda\'ya eşleyen sözlük kur (ör. "gt": lambda a, b: a > b).', 'İlgili lambda\'yı (kayıt değeri, deger) ile çağırıp sonucu döndür.'],
      example: 'KARSILASTIR = {"esit": lambda a, b: a == b, "buyuk": lambda a, b: a > b}\nprint(KARSILASTIR["buyuk"](10, 3), KARSILASTIR["esit"]("a", "b"))\n',
      start: 'def lookup_ayir(anahtar):\n    alan, _, islem = anahtar.partition("__")\n    return alan, islem or "exact"\n\nISLEM = {\n    "exact": lambda a, b: a == b,\n    # TODO: gt, gte, lt, lte, icontains, in, startswith\n}\n\ndef eslesir(kayit, anahtar, deger):\n    # TODO\n    pass\n',
      sol: 'def lookup_ayir(anahtar):\n    alan, _, islem = anahtar.partition("__")\n    return alan, islem or "exact"\n\nISLEM = {\n    "exact": lambda a, b: a == b,\n    "gt": lambda a, b: a > b,\n    "gte": lambda a, b: a >= b,\n    "lt": lambda a, b: a < b,\n    "lte": lambda a, b: a <= b,\n    "icontains": lambda a, b: b.casefold() in a.casefold(),\n    "in": lambda a, b: a in b,\n    "startswith": lambda a, b: a.startswith(b),\n}\n\ndef eslesir(kayit, anahtar, deger):\n    alan, islem = lookup_ayir(anahtar)\n    return ISLEM[islem](kayit[alan], deger)\n',
      tests: 'u = {"ad": "Rize Çayı", "fiyat": 120, "sehir": "İzmir"}\nassert eslesir(u, "fiyat__gt", 100) is True, "120 > 100 olduğu için True"\nassert eslesir(u, "fiyat__gte", 120) is True and eslesir(u, "fiyat__lt", 120) is False, "gte eşitliği kapsar, lt kapsamaz"\nassert eslesir(u, "fiyat__lte", 119) is False, "120 <= 119 değil"\nassert eslesir(u, "ad__icontains", "ÇAY") is True, "icontains büyük/küçük harfe duyarsız olmalı (casefold ya da lower)"\nassert eslesir(u, "sehir__in", ["İzmir", "Bursa"]) is True, "in: değer listede mi"\nassert eslesir(u, "ad__startswith", "Rize") is True, "startswith"\nassert eslesir(u, "sehir", "Ankara") is False, "işlem yazılmadıysa exact"\n',
      hints: ['Her işlem iki argümanlı bir karşılaştırmadır: kayıttaki değer ve aranan değer.', 'icontains için iki tarafı da casefold() ya da lower() ile küçült.', 'return ISLEM[islem](kayit[alan], deger)'],
      why: 'İşlem adını fonksiyona eşleyen bir sözlük (dispatch table), uzun if/elif zincirinin yerini alır ve yeni lookup eklemek tek satırdır. Django da lookup\'ları bir kayıt defterinde (registry) tutar.' },
    { id: 'django-giris-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>url_eslestir(desen, yol)</code> fonksiyonunu yaz. Desen Django sözdizimindedir: <code>"urunler/&lt;int:pk&gt;/"</code>. Yol eşleşirse yakalanan değerlerin sözlüğünü (int dönüştürücüsü için <code>int</code> olarak), eşleşmezse <code>None</code> döndürsün. Desteklenecek dönüştürücüler: <code>int</code> (yalnız rakam) ve <code>str</code> (eğik çizgi hariç en az bir karakter). Eşleşme yolun tamamını kapsamalı.</p>',
      guide: ['re.sub ile desendeki her &lt;tur:ad&gt; parçasını adlandırılmış gruba çevir: (?P&lt;ad&gt;[0-9]+) ya da (?P&lt;ad&gt;[^/]+).', 'Hangi adın int olduğunu bir kümede tut.', 're.fullmatch ile yolu eşleştir; eşleşme yoksa None dön.', 'groupdict() üzerinde gez, int olanları int\'e çevir.'],
      example: 'import re\nm = re.fullmatch(r"siparis/(?P<no>[0-9]+)", "siparis/77")\nprint(m.groupdict(), int(m.group("no")) + 1)\n',
      start: 'import re\n\ndef url_eslestir(desen, yol):\n    int_alanlar = set()\n    def cevir(m):\n        tur, ad = m.group(1), m.group(2)\n        # TODO: int ise ad\'ı kümeye ekle ve uygun regex grubunu döndür\n        pass\n    regex = re.sub(r"<(\\w+):(\\w+)>", cevir, desen)\n    # TODO: fullmatch, None kontrolü, int dönüşümü\n    return None\n',
      sol: 'import re\n\ndef url_eslestir(desen, yol):\n    int_alanlar = set()\n    def cevir(m):\n        tur, ad = m.group(1), m.group(2)\n        if tur == "int":\n            int_alanlar.add(ad)\n            return f"(?P<{ad}>[0-9]+)"\n        return f"(?P<{ad}>[^/]+)"\n    regex = re.sub(r"<(\\w+):(\\w+)>", cevir, desen)\n    m = re.fullmatch(regex, yol)\n    if m is None:\n        return None\n    return {k: int(v) if k in int_alanlar else v for k, v in m.groupdict().items()}\n',
      tests: 'assert url_eslestir("urunler/<int:pk>/", "urunler/42/") == {"pk": 42}, "pk int olarak 42 gelmeli"\nassert url_eslestir("urunler/<int:pk>/", "urunler/abc/") is None, "int dönüştürücüsü harfleri eşlememeli"\nassert url_eslestir("urunler/<int:pk>/", "urunler/42/yorumlar/") is None, "yolun tamamı eşleşmeli (fullmatch)"\nassert url_eslestir("magaza/<str:sehir>/<int:yil>/", "magaza/izmir/2025/") == {"sehir": "izmir", "yil": 2025}, "birden çok dönüştürücü"\nassert url_eslestir("hakkimizda/", "hakkimizda/") == {}, "dönüştürücüsüz desen eşleşirse boş sözlük"\nassert url_eslestir("kategori/<str:ad>/", "kategori//") is None, "str en az bir karakter istemeli"\n',
      hints: ['re.sub\'a fonksiyon verirsen her eşleşme için çağrılır ve döndürdüğü metin yerine konur.', 'Adlandırılmış grup: (?P&lt;pk>[0-9]+); fullmatch tüm metni ister.', 'return {k: int(v) if k in int_alanlar else v for k, v in m.groupdict().items()}'],
      why: 'Django path() desenlerini bu yolla düzenli ifadeye derler; dönüştürücü hem eşleşecek karakterleri hem de view\'a gidecek Python tipini belirler.' },
    { id: 'django-giris-4',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>create_table_sql(model, uygulama)</code> fonksiyonunu yaz: dataclass olan modelden Django tarzı SQL üretsin. Tablo adı <code>uygulama_modeladi</code> (küçük harf). İlk sütun <code>id INTEGER PRIMARY KEY</code>. Tip eşlemesi: <code>int → INTEGER</code>, <code>str → TEXT</code>, <code>float → REAL</code>, <code>bool → BOOLEAN</code>. Varsayılanı olmayan alanlar <code>NOT NULL</code> alır, varsayılanı olanlar almaz. Biçim: <code>CREATE TABLE magaza_urun (id INTEGER PRIMARY KEY, ad TEXT NOT NULL, stok INTEGER);</code></p>',
      guide: ['Tablo adını uygulama + "_" + model.__name__.lower() olarak kur.', 'Sütun listesini "id INTEGER PRIMARY KEY" ile başlat.', 'fields(model) ile gez; f.type\'ı TIP sözlüğüyle SQL tipine çevir.', 'f.default ve f.default_factory ikisi de MISSING ise " NOT NULL" ekle.', 'Sütunları ", " ile birleştirip ifadeyi döndür.'],
      example: 'from dataclasses import dataclass, fields, MISSING\n@dataclass\nclass A:\n    x: int\n    y: int = 0\nfor f in fields(A):\n    print(f.name, f.type, f.default is MISSING)\n',
      start: 'from dataclasses import dataclass, fields, MISSING\n\nTIP = {int: "INTEGER", str: "TEXT", float: "REAL", bool: "BOOLEAN"}\n\ndef create_table_sql(model, uygulama):\n    tablo = f"{uygulama}_{model.__name__.lower()}"\n    sutunlar = ["id INTEGER PRIMARY KEY"]\n    # TODO: her alan için "ad TIP" ya da "ad TIP NOT NULL" ekle\n    return f"CREATE TABLE {tablo} ();"\n',
      sol: 'from dataclasses import dataclass, fields, MISSING\n\nTIP = {int: "INTEGER", str: "TEXT", float: "REAL", bool: "BOOLEAN"}\n\ndef create_table_sql(model, uygulama):\n    tablo = f"{uygulama}_{model.__name__.lower()}"\n    sutunlar = ["id INTEGER PRIMARY KEY"]\n    for f in fields(model):\n        s = f"{f.name} {TIP[f.type]}"\n        if f.default is MISSING and f.default_factory is MISSING:\n            s += " NOT NULL"\n        sutunlar.append(s)\n    return f"CREATE TABLE {tablo} ({\', \'.join(sutunlar)});"\n',
      tests: 'import sqlite3\n@dataclass\nclass Urun:\n    ad: str\n    fiyat: float\n    stok: int = 0\n    aktif: bool = True\nsql = create_table_sql(Urun, "magaza")\nassert sql == "CREATE TABLE magaza_urun (id INTEGER PRIMARY KEY, ad TEXT NOT NULL, fiyat REAL NOT NULL, stok INTEGER, aktif BOOLEAN);", f"üretilen SQL beklenenden farklı:\\n{sql}"\ndb = sqlite3.connect(":memory:")\ndb.execute(sql)\ndb.execute("INSERT INTO magaza_urun (ad, fiyat) VALUES (\'Çay\', 120)")\nassert db.execute("SELECT COUNT(*) FROM magaza_urun").fetchone()[0] == 1, "üretilen SQL sqlite3\\\'te çalışabilmeli"\n@dataclass\nclass Randevu:\n    hasta: str\n    saat: int\nassert create_table_sql(Randevu, "saglik") == "CREATE TABLE saglik_randevu (id INTEGER PRIMARY KEY, hasta TEXT NOT NULL, saat INTEGER NOT NULL);", "tablo adı uygulama_model biçiminde olmalı"\n',
      hints: ['dataclasses.fields(model) her alan için name, type, default bilgisi verir.', 'Varsayılansız alanda f.default is MISSING olur.', 'sutunlar.append(f"{f.name} {TIP[f.type]}" + ("" if varsayilan_var else " NOT NULL"))'],
      why: 'Migration motoru model alanlarını gezer, her alan tipini veritabanı tipine çevirir ve zorunluluğu NOT NULL ile ifade eder. sqlite3 ile çalıştırmak, ürettiğin SQL\'in gerçekten geçerli olduğunu kanıtlar.' },
    { id: 'django-giris-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Zincirlenebilir <code>SorguKumesi</code> sınıfını yaz. <code>SorguKumesi(kayitlar)</code> sözlük listesi alır. Metotlar: <code>filter(**kw)</code> ve <code>exclude(**kw)</code> yeni bir <code>SorguKumesi</code> döndürür (orijinali değiştirmez); <code>order_by(alan)</code> başında <code>-</code> varsa azalan sıralar ve yine yeni nesne döndürür; <code>count()</code> eşleşen sayıyı, <code>first()</code> ilk kaydı ya da <code>None</code>\'u, <code>liste()</code> kayıt listesini döndürür. Lookup\'lar için hazır <code>eslesir(kayit, anahtar, deger)</code> fonksiyonunu kullan. <code>filter</code> içindeki birden çok koşul VE ile bağlanır; <code>exclude(a=1, b=2)</code> ikisini birden sağlayanları dışlar.</p>',
      start: 'ISLEM = {"exact": lambda a, b: a == b, "gt": lambda a, b: a > b, "lt": lambda a, b: a < b,\n         "gte": lambda a, b: a >= b, "icontains": lambda a, b: b.lower() in a.lower()}\n\ndef eslesir(kayit, anahtar, deger):\n    alan, _, islem = anahtar.partition("__")\n    return ISLEM[islem or "exact"](kayit[alan], deger)\n\nclass SorguKumesi:\n    def __init__(self, kayitlar):\n        self._kayitlar = list(kayitlar)\n',
      sol: 'ISLEM = {"exact": lambda a, b: a == b, "gt": lambda a, b: a > b, "lt": lambda a, b: a < b,\n         "gte": lambda a, b: a >= b, "icontains": lambda a, b: b.lower() in a.lower()}\n\ndef eslesir(kayit, anahtar, deger):\n    alan, _, islem = anahtar.partition("__")\n    return ISLEM[islem or "exact"](kayit[alan], deger)\n\nclass SorguKumesi:\n    def __init__(self, kayitlar):\n        self._kayitlar = list(kayitlar)\n\n    def _hepsi(self, k, kw):\n        return all(eslesir(k, a, v) for a, v in kw.items())\n\n    def filter(self, **kw):\n        return SorguKumesi(k for k in self._kayitlar if self._hepsi(k, kw))\n\n    def exclude(self, **kw):\n        return SorguKumesi(k for k in self._kayitlar if not self._hepsi(k, kw))\n\n    def order_by(self, alan):\n        ters = alan.startswith("-")\n        ad = alan.lstrip("-")\n        return SorguKumesi(sorted(self._kayitlar, key=lambda k: k[ad], reverse=ters))\n\n    def count(self):\n        return len(self._kayitlar)\n\n    def first(self):\n        return self._kayitlar[0] if self._kayitlar else None\n\n    def liste(self):\n        return list(self._kayitlar)\n',
      tests: 'siparisler = [\n    {"no": 1, "sehir": "İzmir", "tutar": 1200, "durum": "teslim"},\n    {"no": 2, "sehir": "Ankara", "tutar": 300, "durum": "iptal"},\n    {"no": 3, "sehir": "İzmir", "tutar": 450, "durum": "teslim"},\n    {"no": 4, "sehir": "Bursa", "tutar": 2500, "durum": "kargoda"},\n]\nqs = SorguKumesi(siparisler)\nizmir = qs.filter(sehir="İzmir")\nassert izmir.count() == 2, "İzmir\\\'de 2 sipariş var"\nassert qs.count() == 4, "filter orijinal SorguKumesi\\\'ni değiştirmemeli"\nassert [k["no"] for k in qs.filter(tutar__gt=400, durum="teslim").liste()] == [1, 3], "filter içindeki koşullar VE ile bağlanmalı"\nassert [k["no"] for k in qs.exclude(durum="iptal").order_by("-tutar").liste()] == [4, 1, 3], "exclude + azalan order_by"\nassert qs.order_by("tutar").first()["no"] == 2, "artan sıralamada ilk kayıt en küçük tutar"\nassert qs.filter(sehir="Van").first() is None, "boş sonuçta first() None döndürmeli"\nassert qs.exclude(sehir="İzmir", tutar__gt=1000).count() == 3, "exclude yalnız tüm koşulları birlikte sağlayanı dışlar"\n',
      hints: ['Her metot yeni bir SorguKumesi(...) döndürsün; self._kayitlar\'ı değiştirme.', 'Ortak yardımcı: all(eslesir(k, a, v) for a, v in kw.items()).', 'order_by: ters = alan.startswith("-"); sorted(..., key=lambda k: k[alan.lstrip("-")], reverse=ters)'],
      why: 'Değişmez (immutable) zincirleme sayesinde bir temel sorgudan güvenle farklı alt sorgular türetebilirsin; Django QuerySet\'inin tasarımı tam olarak budur. exclude, filter\'ın koşul bütününün değilidir.' },
    { id: 'django-giris-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>orm_to_sql(tablo, kosullar)</code> fonksiyonunu yaz. <code>kosullar</code> Django filter argümanlarına benzeyen bir sözlüktür; fonksiyon <code>(sql, parametreler)</code> döndürsün. İşlemler: <code>exact</code> → <code>alan = ?</code>, <code>gt</code> → <code>&gt;</code>, <code>gte</code> → <code>&gt;=</code>, <code>lt</code> → <code>&lt;</code>, <code>lte</code> → <code>&lt;=</code>, <code>icontains</code> → <code>alan LIKE ?</code> ve parametre <code>%deger%</code>. Koşullar sözlük sırasıyla <code>AND</code> ile bağlansın. Koşul yoksa <code>WHERE</code> yazılmasın. Değerler asla SQL metnine gömülmesin, hep <code>?</code> ile gitsin.</p><p>Örnek: <code>orm_to_sql("urun", {"fiyat__gt": 100, "ad__icontains": "çay"})</code> → <code>("SELECT * FROM urun WHERE fiyat &gt; ? AND ad LIKE ?", [100, "%çay%"])</code></p>',
      start: 'def orm_to_sql(tablo, kosullar):\n    pass\n',
      sol: 'OP = {"exact": "=", "gt": ">", "gte": ">=", "lt": "<", "lte": "<="}\n\ndef orm_to_sql(tablo, kosullar):\n    parcalar, params = [], []\n    for anahtar, deger in kosullar.items():\n        alan, _, islem = anahtar.partition("__")\n        islem = islem or "exact"\n        if islem == "icontains":\n            parcalar.append(f"{alan} LIKE ?")\n            params.append(f"%{deger}%")\n        else:\n            parcalar.append(f"{alan} {OP[islem]} ?")\n            params.append(deger)\n    sql = f"SELECT * FROM {tablo}"\n    if parcalar:\n        sql += " WHERE " + " AND ".join(parcalar)\n    return sql, params\n',
      tests: 'import sqlite3\nassert orm_to_sql("urun", {"fiyat__gt": 100, "ad__icontains": "çay"}) == ("SELECT * FROM urun WHERE fiyat > ? AND ad LIKE ?", [100, "%çay%"]), "örnekteki çıktı birebir üretilmeli"\nassert orm_to_sql("urun", {}) == ("SELECT * FROM urun", []), "koşulsuz sorguda WHERE olmamalı"\nassert orm_to_sql("musteri", {"sehir": "İzmir"}) == ("SELECT * FROM musteri WHERE sehir = ?", ["İzmir"]), "işlem yoksa ="\nsql, p = orm_to_sql("urun", {"ad": "x\\\' OR 1=1 --"})\nassert "OR 1=1" not in sql, "değer SQL metnine gömülmemeli, parametre olarak gitmeli"\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE urun (ad TEXT, fiyat REAL)")\ndb.executemany("INSERT INTO urun VALUES (?, ?)", [("Rize Çayı", 120), ("Kahve", 350), ("Yeşil Çay", 90)])\nsql, p = orm_to_sql("urun", {"fiyat__lte": 200, "ad__icontains": "Çay"})\nassert sorted(r[0] for r in db.execute(sql, p)) == ["Rize Çayı", "Yeşil Çay"], "üretilen sorgu sqlite3\\\'te doğru satırları getirmeli"\n',
      hints: ['partition("__") alan ve işlemi ayırır; işlem boşsa exact say.', 'İşlem → operatör sözlüğü kur; icontains özel durum: LIKE ve %...%.', 'parcalar listesini " AND " ile birleştir, yalnız doluysa WHERE ekle.'],
      why: 'Django ORM\'i her filtreyi SQL parçası ve parametre çiftine çevirir; değerler sürücüye ayrı gittiği için SQL enjeksiyonu oluşmaz. str(queryset.query) ile bu SQL\'i görebilirsin.' },
    { id: 'django-giris-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Bir form doğrulama sınıfı yaz: <code>KrediBasvuruFormu(veri)</code>. <code>is_valid()</code> çağrıldığında şu kuralları uygulasın, hataları <code>errors</code> sözlüğüne (alan → mesaj), temiz değerleri <code>cleaned_data</code>\'ya koysun ve hata yoksa <code>True</code> döndürsün:</p><ul><li><code>ad</code>: boşluklar kırpıldıktan sonra boş olamaz → mesaj <code>"Zorunlu alan."</code></li><li><code>tc</code>: tam 11 rakam olmalı → <code>"11 haneli olmalı."</code></li><li><code>tutar</code>: tamsayıya çevrilebilmeli (yoksa <code>"Sayı giriniz."</code>), 1000 ile 500000 arasında olmalı (yoksa <code>"Aralık dışı."</code>); temiz değer <code>int</code>.</li></ul><p>Form-geneli kural (Django\'daki <code>clean()</code>): tüm alanlar geçerliyse ve tutar 100000\'den büyükse <code>veri.get("gelir")</code> verilmiş olmalı; yoksa <code>errors["__all__"] = "Yüksek tutar için gelir bilgisi gerekli."</code>.</p>',
      start: 'class KrediBasvuruFormu:\n    def __init__(self, veri):\n        self.veri = veri\n        self.errors = {}\n        self.cleaned_data = {}\n\n    def is_valid(self):\n        pass\n',
      sol: 'class KrediBasvuruFormu:\n    def __init__(self, veri):\n        self.veri = veri\n        self.errors = {}\n        self.cleaned_data = {}\n\n    def is_valid(self):\n        self.errors, temiz = {}, {}\n        ad = str(self.veri.get("ad", "")).strip()\n        if ad:\n            temiz["ad"] = ad\n        else:\n            self.errors["ad"] = "Zorunlu alan."\n        tc = str(self.veri.get("tc", ""))\n        if len(tc) == 11 and tc.isdigit():\n            temiz["tc"] = tc\n        else:\n            self.errors["tc"] = "11 haneli olmalı."\n        try:\n            tutar = int(self.veri.get("tutar", ""))\n            if 1000 <= tutar <= 500000:\n                temiz["tutar"] = tutar\n            else:\n                self.errors["tutar"] = "Aralık dışı."\n        except (TypeError, ValueError):\n            self.errors["tutar"] = "Sayı giriniz."\n        if not self.errors and temiz["tutar"] > 100000 and not self.veri.get("gelir"):\n            self.errors["__all__"] = "Yüksek tutar için gelir bilgisi gerekli."\n        self.cleaned_data = temiz if not self.errors else {}\n        return not self.errors\n',
      tests: 'f = KrediBasvuruFormu({"ad": "  Ayşe Kaya ", "tc": "12345678901", "tutar": "50000"})\nassert f.is_valid() is True, f"geçerli başvuru True dönmeli; hatalar: {f.errors}"\nassert f.cleaned_data == {"ad": "Ayşe Kaya", "tc": "12345678901", "tutar": 50000}, "ad kırpılmalı, tutar int olmalı"\ng = KrediBasvuruFormu({"ad": " ", "tc": "1234", "tutar": "çok"})\nassert g.is_valid() is False, "hatalı form False dönmeli"\nassert g.errors == {"ad": "Zorunlu alan.", "tc": "11 haneli olmalı.", "tutar": "Sayı giriniz."}, f"tüm alan hataları birlikte toplanmalı; gelen {g.errors}"\nassert KrediBasvuruFormu({"ad": "Can", "tc": "1234567890a", "tutar": "999"}).is_valid() is False, "tc rakam olmalı, tutar aralıkta olmalı"\nh = KrediBasvuruFormu({"ad": "Can", "tc": "12345678901", "tutar": "200000"})\nassert h.is_valid() is False and h.errors == {"__all__": "Yüksek tutar için gelir bilgisi gerekli."}, "form-geneli kural çalışmalı"\nassert KrediBasvuruFormu({"ad": "Can", "tc": "12345678901", "tutar": "200000", "gelir": 90000}).is_valid() is True, "gelir verilince geçerli"\nassert KrediBasvuruFormu({"ad": "Can", "tc": "1", "tutar": "200000"}).errors == {}, "is_valid çağrılmadan errors boş kalmalı"\n',
      hints: ['Önce alan alan doğrula, her hatayı errors[alan] = mesaj ile topla; ilk hatada durma.', 'int("çok") ValueError fırlatır; try/except ile "Sayı giriniz." yaz.', 'Form-geneli kuralı yalnız self.errors boşken çalıştır.'],
      why: 'Django formları önce her alanı kendi temizleyicisiyle (clean_&lt;alan&gt;) doğrular, sonra alanlar arası kuralları clean() ile uygular; tüm hataları birlikte toplar ki kullanıcı hepsini tek seferde görsün.' },
    { id: 'django-giris-8',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Aşağıdaki Django sorgusunun SQL karşılığını yaz ve <code>kategori_ozeti(db)</code> fonksiyonunda çalıştır:</p><pre class="out">Kategori.objects.annotate(\n    urun_sayisi=Count("urunler"),\n    toplam_stok=Sum("urunler__stok"),\n).filter(urun_sayisi__gt=0).order_by("-urun_sayisi", "ad")</pre><p>Fonksiyon <code>(kategori_adi, urun_sayisi, toplam_stok)</code> demetlerinin listesini döndürsün. Tablolar: <code>kategori(id, ad)</code>, <code>urun(id, ad, stok, kategori_id)</code>. İpucu: <code>annotate</code> sonrası <code>filter</code>, SQL\'de <code>HAVING</code> olur.</p>',
      start: 'import sqlite3\n\ndef veritabani():\n    db = sqlite3.connect(":memory:")\n    db.executescript("""\n    CREATE TABLE kategori (id INTEGER PRIMARY KEY, ad TEXT);\n    CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, stok INTEGER, kategori_id INTEGER);\n    INSERT INTO kategori VALUES (1, \'İçecek\'), (2, \'Mutfak\'), (3, \'Temizlik\'), (4, \'Atıştırmalık\');\n    INSERT INTO urun VALUES (1, \'Çay\', 40, 1), (2, \'Kahve\', 15, 1), (3, \'Bardak\', 100, 2),\n                            (4, \'Tabak\', 30, 2), (5, \'Cips\', 60, 4);\n    """)\n    return db\n\ndef kategori_ozeti(db):\n    pass\n',
      sol: 'import sqlite3\n\ndef veritabani():\n    db = sqlite3.connect(":memory:")\n    db.executescript("""\n    CREATE TABLE kategori (id INTEGER PRIMARY KEY, ad TEXT);\n    CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, stok INTEGER, kategori_id INTEGER);\n    INSERT INTO kategori VALUES (1, \'İçecek\'), (2, \'Mutfak\'), (3, \'Temizlik\'), (4, \'Atıştırmalık\');\n    INSERT INTO urun VALUES (1, \'Çay\', 40, 1), (2, \'Kahve\', 15, 1), (3, \'Bardak\', 100, 2),\n                            (4, \'Tabak\', 30, 2), (5, \'Cips\', 60, 4);\n    """)\n    return db\n\ndef kategori_ozeti(db):\n    sql = """\n    SELECT k.ad, COUNT(u.id) AS urun_sayisi, SUM(u.stok) AS toplam_stok\n    FROM kategori k\n    LEFT JOIN urun u ON u.kategori_id = k.id\n    GROUP BY k.id, k.ad\n    HAVING COUNT(u.id) > 0\n    ORDER BY urun_sayisi DESC, k.ad\n    """\n    return db.execute(sql).fetchall()\n',
      tests: 'sonuc = kategori_ozeti(veritabani())\nassert isinstance(sonuc, list), "fetchall() ile liste döndür"\nassert len(sonuc) == 3, f"ürünü olmayan Temizlik HAVING ile elenmeli; 3 satır bekleniyordu, gelen {sonuc}"\nassert ("Atıştırmalık", 1, 60) in sonuc, "Atıştırmalık: 1 ürün, 60 stok"\nassert sonuc == [("Mutfak", 2, 130), ("İçecek", 2, 55), ("Atıştırmalık", 1, 60)], f"önce ürün sayısına göre azalan, eşitlikte ada göre artan sıralanmalı (SQLite \\\'M\\\' harfini \\\'İ\\\'den önce sıralar); gelen {sonuc}"\n',
      hints: ['Count("urunler") ters ilişki olduğundan kategori tablosundan urun\'a LEFT JOIN gerekir.', 'annotate → GROUP BY; annotate edilmiş alana filter → HAVING.', 'ORDER BY urun_sayisi DESC, k.ad'],
      why: 'annotate satır başına (grup başına) toplam ekler ve GROUP BY üretir; toplam üzerinden filtre WHERE değil HAVING olur. Sıralamadaki ikinci anahtar, eşit sayılı kategorilerin sırasını belirli kılar.' },
    { id: 'django-giris-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. Mini yönlendirici <code>coz(yol)</code> desenleri sırayla dener ve ilk eşleşen view adını döndürür. Ancak <code>"urunler/yeni/"</code> adresine gidildiğinde ürün oluşturma formu yerine ürün detayı açılıyor ve "yeni" adlı ürün aranıyor. Desen sırasını düzelt (fonksiyona dokunmana gerek yok).</p>',
      start: 'import re\n\nDESENLER = [\n    (r"urunler/", "urun_listesi"),\n    (r"urunler/(?P<slug>[^/]+)/", "urun_detay"),\n    (r"urunler/yeni/", "urun_olustur"),\n]\n\ndef coz(yol):\n    for desen, view in DESENLER:\n        m = re.fullmatch(desen, yol)\n        if m:\n            return view, m.groupdict()\n    return "404", {}\n',
      sol: 'import re\n\nDESENLER = [\n    (r"urunler/", "urun_listesi"),\n    (r"urunler/yeni/", "urun_olustur"),\n    (r"urunler/(?P<slug>[^/]+)/", "urun_detay"),\n]\n\ndef coz(yol):\n    for desen, view in DESENLER:\n        m = re.fullmatch(desen, yol)\n        if m:\n            return view, m.groupdict()\n    return "404", {}\n',
      tests: 'assert coz("urunler/yeni/") == ("urun_olustur", {}), "sabit \\\'yeni\\\' deseni genel slug deseninden ÖNCE gelmeli"\nassert coz("urunler/rize-cayi/") == ("urun_detay", {"slug": "rize-cayi"}), "detay deseni çalışmaya devam etmeli"\nassert coz("urunler/") == ("urun_listesi", {}), "liste deseni"\nassert coz("sepet/") == ("404", {}), "eşleşmeyen yol 404"\n',
      hints: ['Django desenleri yukarıdan aşağı dener; ilk eşleşen kazanır.', '"yeni" kelimesi [^/]+ ile de eşleşir; özel desen genel desenden önce yazılmalı.'],
      why: 'URLconf\'ta özel (sabit) desenler, genel yakalayıcı desenlerden önce gelmelidir; aksi halde genel desen her şeyi yutar. Bu, gerçek Django projelerinde sık görülen ve testsiz fark edilmeyen bir hatadır.' },
    { id: 'django-giris-10',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>siparis_raporu(db)</code> her sipariş için <code>(siparis_no, musteri_adi)</code> listesini doğru döndürüyor ama siparişlerin her biri için ayrı bir müşteri sorgusu atıyor (N+1 sorunu). <code>db</code> sorgu sayan bir sarmalayıcıdır. Fonksiyonu <b>en fazla 2 sorgu</b> (tercihen tek JOIN) kullanacak şekilde düzelt; sonuç sipariş numarasına göre sıralı kalsın.</p>',
      start: 'import sqlite3\n\nclass SayanDB:\n    def __init__(self):\n        self.conn = sqlite3.connect(":memory:")\n        self.sayac = 0\n        self.conn.executescript("""\n        CREATE TABLE musteri (id INTEGER PRIMARY KEY, ad TEXT);\n        CREATE TABLE siparis (no INTEGER PRIMARY KEY, musteri_id INTEGER);\n        INSERT INTO musteri VALUES (1, \'Ayşe\'), (2, \'Mehmet\'), (3, \'Zeynep\');\n        INSERT INTO siparis VALUES (101, 1), (102, 2), (103, 1), (104, 3), (105, 2);\n        """)\n    def execute(self, sql, params=()):\n        self.sayac += 1\n        return self.conn.execute(sql, params)\n\ndef siparis_raporu(db):\n    sonuc = []\n    for no, musteri_id in db.execute("SELECT no, musteri_id FROM siparis ORDER BY no").fetchall():\n        ad = db.execute("SELECT ad FROM musteri WHERE id = ?", (musteri_id,)).fetchone()[0]\n        sonuc.append((no, ad))\n    return sonuc\n',
      sol: 'import sqlite3\n\nclass SayanDB:\n    def __init__(self):\n        self.conn = sqlite3.connect(":memory:")\n        self.sayac = 0\n        self.conn.executescript("""\n        CREATE TABLE musteri (id INTEGER PRIMARY KEY, ad TEXT);\n        CREATE TABLE siparis (no INTEGER PRIMARY KEY, musteri_id INTEGER);\n        INSERT INTO musteri VALUES (1, \'Ayşe\'), (2, \'Mehmet\'), (3, \'Zeynep\');\n        INSERT INTO siparis VALUES (101, 1), (102, 2), (103, 1), (104, 3), (105, 2);\n        """)\n    def execute(self, sql, params=()):\n        self.sayac += 1\n        return self.conn.execute(sql, params)\n\ndef siparis_raporu(db):\n    sql = """SELECT s.no, m.ad FROM siparis s\n             JOIN musteri m ON m.id = s.musteri_id ORDER BY s.no"""\n    return [tuple(r) for r in db.execute(sql).fetchall()]\n',
      tests: 'db = SayanDB()\nr = siparis_raporu(db)\nassert r == [(101, "Ayşe"), (102, "Mehmet"), (103, "Ayşe"), (104, "Zeynep"), (105, "Mehmet")], f"rapor içeriği değişmemeli; gelen {r}"\nassert db.sayac <= 2, f"en fazla 2 sorgu bekleniyordu, {db.sayac} sorgu atıldı (N+1): JOIN kullan (select_related karşılığı)"\n',
      hints: ['Döngü içinde sorgu atmak, satır sayısı kadar ek sorgu demektir.', 'select_related\'ın SQL karşılığı JOIN\'dir: SELECT s.no, m.ad FROM siparis s JOIN musteri m ON ...'],
      why: 'select_related tam olarak bunu yapar: ilişkili tabloyu tek sorguda JOIN ile getirir. Alternatif (prefetch_related) iki sorgu atıp müşterileri bir sözlükte eşler; ikisi de sorgu sayısını satır sayısından bağımsız kılar.' },
    { id: 'django-giris-11',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Django\'nun <code>Q</code> nesnesini taklit et. <code>Q(**kw)</code> birden çok koşulu VE ile tutar. Operatörler: <code>q1 | q2</code> (VEYA), <code>q1 &amp; q2</code> (VE), <code>~q</code> (DEĞİL); hepsi yeni bir <code>Q</code> döndürür ve iç içe kullanılabilir. <code>q.degerlendir(kayit)</code> kayıt koşulu sağlıyorsa <code>True</code> döndürür. Hazır <code>eslesir</code> fonksiyonunu kullan.</p><p>Örnek: <code>(Q(sehir="İzmir") | Q(tutar__gt=1000)) &amp; ~Q(durum="iptal")</code></p>',
      start: 'ISLEM = {"exact": lambda a, b: a == b, "gt": lambda a, b: a > b, "lt": lambda a, b: a < b}\n\ndef eslesir(kayit, anahtar, deger):\n    alan, _, islem = anahtar.partition("__")\n    return ISLEM[islem or "exact"](kayit[alan], deger)\n\nclass Q:\n    def __init__(self, **kw):\n        self.kw = kw\n',
      sol: 'ISLEM = {"exact": lambda a, b: a == b, "gt": lambda a, b: a > b, "lt": lambda a, b: a < b}\n\ndef eslesir(kayit, anahtar, deger):\n    alan, _, islem = anahtar.partition("__")\n    return ISLEM[islem or "exact"](kayit[alan], deger)\n\nclass Q:\n    def __init__(self, **kw):\n        self.kw = kw\n        self.op = "yaprak"\n        self.cocuklar = []\n\n    @classmethod\n    def _bilesik(cls, op, *cocuklar):\n        q = cls()\n        q.op, q.cocuklar = op, list(cocuklar)\n        return q\n\n    def __or__(self, diger):\n        return Q._bilesik("veya", self, diger)\n\n    def __and__(self, diger):\n        return Q._bilesik("ve", self, diger)\n\n    def __invert__(self):\n        return Q._bilesik("degil", self)\n\n    def degerlendir(self, kayit):\n        if self.op == "veya":\n            return any(c.degerlendir(kayit) for c in self.cocuklar)\n        if self.op == "ve":\n            return all(c.degerlendir(kayit) for c in self.cocuklar)\n        if self.op == "degil":\n            return not self.cocuklar[0].degerlendir(kayit)\n        return all(eslesir(kayit, a, v) for a, v in self.kw.items())\n',
      tests: 'veri = [\n    {"no": 1, "sehir": "İzmir", "tutar": 200, "durum": "teslim"},\n    {"no": 2, "sehir": "Ankara", "tutar": 1500, "durum": "teslim"},\n    {"no": 3, "sehir": "İzmir", "tutar": 50, "durum": "iptal"},\n    {"no": 4, "sehir": "Bursa", "tutar": 300, "durum": "teslim"},\n    {"no": 5, "sehir": "Bursa", "tutar": 5000, "durum": "iptal"},\n]\nq = (Q(sehir="İzmir") | Q(tutar__gt=1000)) & ~Q(durum="iptal")\nassert [k["no"] for k in veri if q.degerlendir(k)] == [1, 2], "örnek sorgu 1 ve 2 numaralı siparişleri seçmeli"\nassert [k["no"] for k in veri if Q(sehir="Bursa", durum="teslim").degerlendir(k)] == [4], "tek Q içindeki koşullar VE"\nassert [k["no"] for k in veri if (~Q(sehir="İzmir")).degerlendir(k)] == [2, 4, 5], "~ değilleme"\niki = Q(sehir="Ankara") | Q(sehir="Bursa") | Q(tutar__lt=100)\nassert [k["no"] for k in veri if iki.degerlendir(k)] == [2, 3, 4, 5], "zincirli VEYA"\na = Q(sehir="İzmir")\n_ = a | Q(sehir="Bursa")\nassert [k["no"] for k in veri if a.degerlendir(k)] == [1, 3], "operatörler orijinal Q\\\'yu değiştirmemeli"\n',
      hints: ['Bir Q ya yapraktır (kw koşulları) ya da birleşimdir (op + çocuklar): bir ağaç kur.', '__or__, __and__, __invert__ yeni Q döndürsün; çocukları listede sakla.', 'degerlendir özyinelemeli: veya → any, ve → all, değil → not, yaprak → all(eslesir(...)).'],
      why: 'Django Q nesneleri bir mantık ağacı kurar ve ORM bu ağacı parantezli bir WHERE ifadesine çevirir. Operatör aşırı yüklemesi (dunder metotlar) ile okunur bir sorgu dili elde edilir; değişmezlik zincirlemeyi güvenli kılar.' },
    { id: 'django-giris-12',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Basit bir <code>makemigrations</code> yaz: <code>migration_uret(tablo, eski, yeni)</code>. <code>eski</code> ve <code>yeni</code>, alan adı → SQL tipi sözlükleridir (model\'in önceki ve şimdiki hali). Fonksiyon SQL ifadelerinin listesini döndürsün:</p><ul><li>Yeni eklenen alan: <code>ALTER TABLE tablo ADD COLUMN alan TIP;</code></li><li>Silinen alan: <code>ALTER TABLE tablo DROP COLUMN alan;</code></li><li>Tipi değişen alan: ifade üretme; bunun yerine <code>ValueError</code> fırlat (mesajında alan adı geçsin), çünkü SQLite tip değişikliğini doğrudan yapamaz.</li></ul><p>Sıra: önce eklemeler (yeni modeldeki sırayla), sonra silmeler (eski modeldeki sırayla). Değişiklik yoksa boş liste.</p>',
      start: 'def migration_uret(tablo, eski, yeni):\n    pass\n',
      sol: 'def migration_uret(tablo, eski, yeni):\n    for alan in yeni:\n        if alan in eski and eski[alan] != yeni[alan]:\n            raise ValueError(f"{alan} alanının tipi değişti: {eski[alan]} -> {yeni[alan]}")\n    ifadeler = [f"ALTER TABLE {tablo} ADD COLUMN {a} {t};" for a, t in yeni.items() if a not in eski]\n    ifadeler += [f"ALTER TABLE {tablo} DROP COLUMN {a};" for a in eski if a not in yeni]\n    return ifadeler\n',
      tests: 'import sqlite3\neski = {"ad": "TEXT", "fiyat": "REAL", "eski_kod": "TEXT"}\nyeni = {"ad": "TEXT", "fiyat": "REAL", "stok": "INTEGER", "aktif": "BOOLEAN"}\nm = migration_uret("magaza_urun", eski, yeni)\nassert m == ["ALTER TABLE magaza_urun ADD COLUMN stok INTEGER;", "ALTER TABLE magaza_urun ADD COLUMN aktif BOOLEAN;", "ALTER TABLE magaza_urun DROP COLUMN eski_kod;"], f"beklenen sırada ADD ve DROP ifadeleri; gelen {m}"\nassert migration_uret("t", yeni, yeni) == [], "değişiklik yoksa boş liste"\ntry:\n    migration_uret("t", {"fiyat": "REAL"}, {"fiyat": "TEXT"})\n    assert False, "tip değişikliği ValueError fırlatmalı"\nexcept ValueError as e:\n    assert "fiyat" in str(e), "hata mesajında alan adı geçmeli"\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE magaza_urun (id INTEGER PRIMARY KEY, ad TEXT, fiyat REAL, eski_kod TEXT)")\nfor ifade in m:\n    db.execute(ifade)\nsutunlar = [r[1] for r in db.execute("PRAGMA table_info(magaza_urun)")]\nassert sutunlar == ["id", "ad", "fiyat", "stok", "aktif"], f"ifadeler uygulandıktan sonra şema yeni modelle aynı olmalı; gelen {sutunlar}"\n',
      hints: ['Üç küme: yeni - eski (eklenen), eski - yeni (silinen), kesişimde tipi farklı olanlar.', 'Sıra önemli: küme yerine sözlüğün kendi sırasını kullan (for a in yeni if a not in eski).', 'Tip kontrolünü ifade üretmeden önce yap ki yarım migration dönmesin.'],
      why: 'Django\'nun autodetector\'ı da eski ve yeni model durumlarını karşılaştırıp işlem listesi (AddField, RemoveField, AlterField) çıkarır. Tehlikeli değişiklikleri sessizce geçmek yerine erken hata vermek, veri kaybını önler; PRAGMA ile sonucu doğrulamak da migration testinin özüdür.' },
    { id: 'django-giris-13',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market için sqlite3 üzerinde mini bir model yöneticisi (manager) yaz: <code>UrunYoneticisi(db)</code>. Tablo hazır: <code>urun(id, ad, kategori, fiyat, stok)</code>.</p><ul><li><code>create(**alanlar)</code>: satırı ekler, yeni <code>id</code>\'yi döndürür (parametreli INSERT).</li><li><code>filter(**kosullar)</code>: lookup\'lu koşullarla (<code>exact, gt, gte, lt, lte, icontains</code>) eşleşen satırları <b>sözlük listesi</b> olarak, <code>id</code>\'ye göre sıralı döndürür.</li><li><code>count(**kosullar)</code>: eşleşen satır sayısı (SQL <code>COUNT</code> ile).</li><li><code>update(kosullar, **yeni)</code>: koşula uyan satırları günceller, etkilenen satır sayısını döndürür. <code>kosullar</code> bir sözlüktür.</li></ul><p>Alan adları yalnız <code>ALANLAR</code> kümesinden olabilir; başka ad gelirse <code>ValueError</code> fırlat (SQL\'e kullanıcıdan gelen sütun adı gömülmesin). Tüm değerler <code>?</code> parametresiyle gitsin.</p>',
      start: 'import sqlite3\n\nALANLAR = {"id", "ad", "kategori", "fiyat", "stok"}\n\ndef yeni_db():\n    db = sqlite3.connect(":memory:")\n    db.execute("CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, kategori TEXT, fiyat REAL, stok INTEGER)")\n    return db\n\nclass UrunYoneticisi:\n    def __init__(self, db):\n        self.db = db\n\n    # TODO: create, filter, count, update\n',
      sol: 'import sqlite3\n\nALANLAR = {"id", "ad", "kategori", "fiyat", "stok"}\nOP = {"exact": "= ?", "gt": "> ?", "gte": ">= ?", "lt": "< ?", "lte": "<= ?", "icontains": "LIKE ?"}\n\ndef yeni_db():\n    db = sqlite3.connect(":memory:")\n    db.execute("CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, kategori TEXT, fiyat REAL, stok INTEGER)")\n    return db\n\ndef _alan(ad):\n    if ad not in ALANLAR:\n        raise ValueError(f"bilinmeyen alan: {ad}")\n    return ad\n\nclass UrunYoneticisi:\n    def __init__(self, db):\n        self.db = db\n\n    def _where(self, kosullar):\n        parcalar, params = [], []\n        for anahtar, deger in kosullar.items():\n            alan, _, islem = anahtar.partition("__")\n            islem = islem or "exact"\n            if islem not in OP:\n                raise ValueError(f"bilinmeyen işlem: {islem}")\n            parcalar.append(f"{_alan(alan)} {OP[islem]}")\n            params.append(f"%{deger}%" if islem == "icontains" else deger)\n        sql = " WHERE " + " AND ".join(parcalar) if parcalar else ""\n        return sql, params\n\n    def create(self, **alanlar):\n        adlar = [_alan(a) for a in alanlar]\n        sql = f"INSERT INTO urun ({\', \'.join(adlar)}) VALUES ({\', \'.join(\'?\' for _ in adlar)})"\n        return self.db.execute(sql, list(alanlar.values())).lastrowid\n\n    def filter(self, **kosullar):\n        where, params = self._where(kosullar)\n        cur = self.db.execute(f"SELECT id, ad, kategori, fiyat, stok FROM urun{where} ORDER BY id", params)\n        adlar = [d[0] for d in cur.description]\n        return [dict(zip(adlar, r)) for r in cur.fetchall()]\n\n    def count(self, **kosullar):\n        where, params = self._where(kosullar)\n        return self.db.execute(f"SELECT COUNT(*) FROM urun{where}", params).fetchone()[0]\n\n    def update(self, kosullar, **yeni):\n        set_kismi = ", ".join(f"{_alan(a)} = ?" for a in yeni)\n        where, params = self._where(kosullar)\n        cur = self.db.execute(f"UPDATE urun SET {set_kismi}{where}", list(yeni.values()) + params)\n        return cur.rowcount\n',
      tests: 'db = yeni_db()\nurunler = UrunYoneticisi(db)\ni1 = urunler.create(ad="Rize Çayı", kategori="İçecek", fiyat=120.0, stok=40)\ni2 = urunler.create(ad="Türk Kahvesi", kategori="İçecek", fiyat=350.0, stok=0)\ni3 = urunler.create(ad="Çay Bardağı", kategori="Mutfak", fiyat=25.0, stok=100)\nassert (i1, i2, i3) == (1, 2, 3), "create yeni id\\\'yi döndürmeli (lastrowid)"\nr = urunler.filter(kategori="İçecek", fiyat__gt=100)\nassert [u["ad"] for u in r] == ["Rize Çayı", "Türk Kahvesi"], f"filter sonucu hatalı: {r}"\nassert r[0] == {"id": 1, "ad": "Rize Çayı", "kategori": "İçecek", "fiyat": 120.0, "stok": 40}, "satırlar sözlük olarak dönmeli"\nassert [u["id"] for u in urunler.filter(ad__icontains="KAHVE")] == [2], "icontains LIKE ile çalışmalı (SQLite LIKE ASCII harflerde büyük/küçük duyarsızdır)"\nassert urunler.count(stok=0) == 1 and urunler.count() == 3, "count koşullu ve koşulsuz çalışmalı"\nassert urunler.update({"kategori": "İçecek"}, stok=10) == 2, "update etkilenen satır sayısını döndürmeli"\nassert urunler.filter(id=2)[0]["stok"] == 10, "güncelleme uygulanmalı"\nfor kotu in [lambda: urunler.filter(**{"ad; DROP TABLE urun": 1}), lambda: urunler.create(sifre="x")]:\n    try:\n        kotu()\n        assert False, "bilinmeyen alan adı ValueError fırlatmalı"\n    except ValueError:\n        pass\nassert urunler.count() == 3, "tablo sağlam kalmalı"\nurunler.create(ad="x\\\'); DROP TABLE urun; --", kategori="Test", fiyat=1, stok=1)\nassert urunler.count() == 4, "değerler parametre ile gitmeli; enjeksiyon denemesi sıradan bir ürün adı olarak kaydedilmeli"\n',
      hints: ['Koşul → SQL dönüşümünü bir yardımcıda (_where) topla; filter, count ve update onu paylaşsın.', 'Sütun adlarını ? ile parametreleyemezsin; o yüzden izin listesiyle (ALANLAR) doğrula.', 'cursor.description sütun adlarını verir: dict(zip(adlar, satir)). rowcount etkilenen satır sayısıdır.'],
      why: 'Django\'nun Manager/QuerySet katmanı tam olarak bu işi yapar: anahtar-değer argümanlarını güvenli, parametreli SQL\'e çevirir, sonuçları nesneye dönüştürür. Değerler parametreyle, tanımlayıcılar (sütun adları) izin listesiyle korunur.' }
  ],
  faq: [
    { q: 'Django mı, Flask mı, FastAPI mı seçmeliyim?',
      a: 'Veritabanı ağırlıklı, admin paneli, kullanıcı ve form gerektiren bir ürün (iç yönetim sistemi, e-ticaret arka ofisi, içerik sitesi) için Django en hızlı yoldur. Küçük servis ya da çok özel bir yapı için Flask, yüksek performanslı ve tip güdümlü JSON API için FastAPI daha uygundur. Django + DRF de olgun bir API çözümüdür.' },
    { q: 'Migration dosyalarını git\'e eklemeli miyim?',
      a: 'Evet. Migration dosyaları şemanın sürüm geçmişidir; ekip arkadaşların ve sunucu aynı şemaya bu dosyalarla ulaşır. Sunucuda makemigrations çalıştırılmaz, yalnız migrate çalıştırılır.' },
    { q: 'QuerySet ne zaman veritabanına gider?',
      a: 'Değerlendirildiğinde: döngüde gezildiğinde, list(), len(), bool() çağrıldığında, dilimde adım kullanıldığında ya da şablonda gezildiğinde. filter, exclude, order_by zinciri kurulurken sorgu atılmaz. Aynı QuerySet ikinci kez gezilirse önbelleğini kullanır.' },
    { q: 'select_related ile prefetch_related farkı nedir?',
      a: 'select_related ileri yönlü ForeignKey ve OneToOne için tek bir JOIN sorgusu üretir. prefetch_related ters ilişkiler ve ManyToMany için ikinci bir sorgu atıp sonuçları Python\'da eşler. İkisi de N+1 sorununu çözer.' }
  ],
  mistakes: [
    { why: 'Kullanıcı girdisini raw SQL\'e f-string ile gömmek ORM\'in SQL enjeksiyonu korumasını devre dışı bırakır.',
      bad: 'Urun.objects.raw(f"SELECT * FROM magaza_urun WHERE ad = \'{ad}\'")',
      good: 'Urun.objects.raw("SELECT * FROM magaza_urun WHERE ad = %s", [ad])\n# daha iyisi: Urun.objects.filter(ad=ad)' },
    { why: 'Döngüde ilişkili nesneye erişmek her satır için ayrı sorgu üretir (N+1).',
      bad: 'for s in Siparis.objects.all():\n    print(s.musteri.ad)',
      good: 'for s in Siparis.objects.select_related("musteri"):\n    print(s.musteri.ad)' },
    { why: 'Okuyup Python\'da artırmak, aynı anda gelen iki istekte güncellemelerden birini kaybettirir.',
      bad: 'u = Urun.objects.get(pk=5)\nu.stok = u.stok - 1\nu.save()',
      good: 'from django.db.models import F\nUrun.objects.filter(pk=5).update(stok=F("stok") - 1)' },
    { why: 'Üretimde DEBUG açık kalırsa hata sayfaları ayarları ve kodu dışarı sızdırır; gizli anahtar koda gömülmemeli.',
      bad: 'DEBUG = True\nSECRET_KEY = "django-insecure-abc123"',
      good: 'import os\nDEBUG = os.environ.get("DJANGO_DEBUG") == "1"\nSECRET_KEY = os.environ["DJANGO_SECRET_KEY"]' }
  ] }
);
})(window);
