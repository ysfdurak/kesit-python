import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/n4gen')
from n4jsgen import py, code, emit

body = '<h2>Neden önemli?</h2>\n<p>Django\'ya giriş dersinde proje kurmayı, modeli, migration\'ı, admin\'i ve temel ORM sorgularını gördün. İş ilanlarında "Django + DRF deneyimi" yazdığında beklenen bundan fazlasıdır: liste sayfası 400 sorgu attığında bunu ölçüp bir sorguya indirmek, izin onayı yarıda kalınca veritabanını tutarlı bırakmak, API\'de doğrulama, sayfalama, filtreleme ve nesne düzeyinde izinleri doğru kurmak, kodu testlerle güvenceye almak. Bu derste Pusula İK\'nın izin onay API\'sini bu gözle tasarlayacağız.</p>\n<div class="warn"><b>Django tarayıcıda çalışmaz</b>Django ve DRF kodları <code>pre</code> kutularında gösterim içindir; kendi bilgisayarında <code>pip install django djangorestframework django-filter pytest-django factory-boy</code> ile dene. Çalıştırılabilir kutular ve alıştırmalar, ORM\'in ürettiği SQL\'in eşdeğerini <code>sqlite3</code> ve gerçek Pusula İK ve Lezzet Kurye verisiyle kurar; böylece her ORM satırının veritabanında neye dönüştüğünü görürsün.</div>\n\n<h2>Model ilişkileri, özel Manager ve QuerySet</h2>\n<p>Pusula İK\'nın çekirdeği üç modeldir: <code>Calisan</code> kendi yöneticisine (aynı tabloya) bağlıdır, <code>Izin</code> bir çalışana bağlıdır. Tekrarlanan süzgeçleri her view\'da yazmak yerine <b>özel QuerySet</b> metotlarına koy; zincirlenebilir kalırlar ve iş dilini koda taşırlar.</p>\n' + code(r'''
# izin/models.py
from django.db import models
from django.db.models import Q

class IzinQuerySet(models.QuerySet):
    def bekleyen(self):
        return self.filter(durum="beklemede")

    def gorunur(self, kullanici):                     # nesne düzeyinde yetki tek yerde
        c = kullanici.calisan
        return self.filter(Q(calisan=c) | Q(calisan__yonetici=c))

class Calisan(models.Model):
    ad = models.CharField(max_length=120)
    yonetici = models.ForeignKey("self", null=True, on_delete=models.SET_NULL, related_name="ekip")
    kullanici = models.OneToOneField("auth.User", on_delete=models.CASCADE)

class Izin(models.Model):
    TUR = [("yıllık", "Yıllık"), ("hastalık", "Hastalık"), ("mazeret", "Mazeret"), ("ücretsiz", "Ücretsiz")]
    calisan = models.ForeignKey(Calisan, on_delete=models.CASCADE, related_name="izinler")
    tur = models.CharField(max_length=20, choices=TUR)
    baslangic = models.DateField()
    gun = models.PositiveSmallIntegerField()
    durum = models.CharField(max_length=20, default="beklemede", db_index=True)

    objects = IzinQuerySet.as_manager()

# kullanım: Izin.objects.gorunur(request.user).bekleyen().order_by("baslangic")
''') + '\n<p><code>ForeignKey</code> çoğa-bir, <code>OneToOneField</code> bire-bir, <code>ManyToManyField</code> çoğa-çok ilişkidir; <code>related_name</code> ters yönün adıdır (<code>yonetici.ekip.all()</code>). <code>on_delete</code> seçimi bir iş kararıdır: <code>CASCADE</code> çalışan silinince izinleri de siler, <code>PROTECT</code> silmeyi engeller, <code>SET_NULL</code> bağı koparır.</p>\n\n<h2>Sorgu sayısını ölç: N+1 sorunu</h2>\n<p>QuerySet tembeldir ve ilişkili nesneye her erişim, önceden getirilmemişse yeni bir sorgu atar. 100 izinlik listede her satırda <code>izin.calisan.ad</code> yazdırmak 1 + 100 sorgu demektir. Önce <b>ölç</b>: Django\'da <code>django-debug-toolbar</code>, testte <code>assertNumQueries</code> ya da <code>connection.queries</code>. sqlite3\'te aynı ölçümü <code>set_trace_callback</code> ile yapabilirsin; aşağıdaki kutu gerçek Pusula İK verisinde üç yolu karşılaştırıyor.</p>\n' + py(r'''
import veri

con = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])
sorgular = []
con.set_trace_callback(sorgular.append)

def n_arti_1(limit):                                     # for izin in Izin.objects.all()[:limit]: izin.calisan.ad
    izinler = con.execute("SELECT leave_id, emp_id FROM ik_leaves ORDER BY leave_id LIMIT ?", (limit,)).fetchall()
    return [(lid, con.execute("SELECT full_name FROM ik_employees WHERE emp_id = ?", (e,)).fetchone()[0])
            for lid, e in izinler]

def select_related(limit):                               # Izin.objects.select_related("calisan")
    return con.execute("""SELECT l.leave_id, e.full_name FROM ik_leaves l
                          JOIN ik_employees e ON e.emp_id = l.emp_id
                          ORDER BY l.leave_id LIMIT ?""", (limit,)).fetchall()

def prefetch_related(limit):                             # ikinci sorgu: WHERE emp_id IN (...)
    izinler = con.execute("SELECT leave_id, emp_id FROM ik_leaves ORDER BY leave_id LIMIT ?", (limit,)).fetchall()
    idler = sorted({e for _, e in izinler})
    yer = ",".join("?" * len(idler))
    ad = dict(con.execute(f"SELECT emp_id, full_name FROM ik_employees WHERE emp_id IN ({yer})", idler))
    return [(lid, ad[e]) for lid, e in izinler]

for f in (n_arti_1, select_related, prefetch_related):
    sorgular.clear()
    sonuc = f(100)
    print(f"{f.__name__:17} sorgu={len(sorgular):3}  ilk={sonuc[0]}")
''') + '\n<div class="tbl-wrap"><table>\n<tr><th>Araç</th><th>İlişki türü</th><th>SQL</th><th>Ne zaman?</th></tr>\n<tr><td><code>select_related("calisan")</code></td><td>İleri FK, OneToOne</td><td>Tek sorgu, JOIN</td><td>Her satırda tek ilişkili nesne</td></tr>\n<tr><td><code>prefetch_related("izinler")</code></td><td>Ters FK, ManyToMany</td><td>İki sorgu, <code>IN (...)</code> + Python\'da eşleme</td><td>Her satırda birden çok ilişkili nesne</td></tr>\n<tr><td><code>Prefetch("izinler", queryset=...)</code></td><td>Ters FK, süzülmüş</td><td>İkinci sorgu süzülür</td><td>Yalnız bekleyen izinleri getirmek gibi</td></tr>\n<tr><td><code>only()</code> / <code>defer()</code></td><td>-</td><td>Sütun listesini daraltır</td><td>Büyük metin alanlarını taşımamak</td></tr>\n</table></div>\n<div class="tip"><b>Testle kilitle</b>Bir kez düzelttiğin N+1 sonraki bir değişiklikle geri gelir. <code>with self.assertNumQueries(2):</code> (ya da pytest-django\'da <code>django_assert_num_queries</code>) ile liste uç noktasının sorgu sayısını test et; satır sayısı artınca sorgu sayısının sabit kaldığını görmek gerçek kanıttır.</div>\n\n<h2>annotate, aggregate, F ve Q</h2>\n<p><code>aggregate</code> tüm kümeyi tek değere indirir (<code>{"toplam": 1234}</code>); <code>annotate</code> her satıra (ya da <code>values()</code> ile gruplanan her gruba) hesaplanmış bir alan ekler, yani SQL\'deki <code>GROUP BY</code>\'dır. <code>Q</code> nesneleri <code>|</code> (VEYA), <code>&amp;</code> (VE) ve <code>~</code> (DEĞİL) ile birleşir; <code>F</code> bir sütuna Python\'a çekmeden başvurur ve yarış durumunu önler.</p>\n' + code(r'''
from django.db.models import Count, Sum, Q, F

(Izin.objects
    .filter(baslangic__year=2024)
    .values("calisan__pozisyon__bolum__ad")
    .annotate(talep=Count("id"),
              gun=Sum("gun"),
              hastalik_gun=Sum("gun", filter=Q(tur="hastalık")))
    .order_by("-gun"))

Calisan.objects.filter(pk=418).update(izin_bakiyesi=F("izin_bakiyesi") - 3)   # UPDATE ... SET x = x - 3
''') + '\n' + py(r'''
import veri

con = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves", "ik_positions", "ik_departments"])
satirlar = con.execute("""
    SELECT d.name, COUNT(*) AS talep, SUM(l.days) AS gun,
           SUM(CASE WHEN l.leave_type = 'hastalık' THEN l.days ELSE 0 END) AS hastalik_gun
    FROM ik_leaves l
    JOIN ik_employees e   ON e.emp_id = l.emp_id
    JOIN ik_positions p   ON p.position_id = e.position_id
    JOIN ik_departments d ON d.dept_id = p.dept_id
    WHERE l.start_date >= '2024-01-01'
    GROUP BY d.name ORDER BY gun DESC LIMIT 4""").fetchall()
for ad, talep, gun, hasta in satirlar:
    print(f"{ad:22} talep={talep:4} gün={gun:5} hastalık payı=%{100 * hasta / gun:.0f}")
''') + '\n<p><code>Sum("gun", filter=Q(...))</code> SQL\'de <code>SUM(...) FILTER (WHERE ...)</code> ya da <code>CASE WHEN</code> olarak çıkar. Çift yönlü alt çizgi (<code>calisan__pozisyon__bolum__ad</code>) her adımda bir JOIN ekler.</p>\n\n<h2>Sinyaller ve transaction.atomic</h2>\n<p>Sinyaller (<code>post_save</code>, <code>pre_delete</code>) bir model kaydedildiğinde başka bir kodu tetikler. Kolay görünür ama gizli yan etki üretir: kaydın nereden e-posta gönderdiğini bulmak zorlaşır, <code>bulk_create</code> ve <code>update()</code> sinyal tetiklemez, testler yavaşlar. Kural: kendi uygulamanın içinde açık bir servis fonksiyonu çağır; sinyali yalnız değiştiremediğin üçüncü taraf uygulamalara tepki için kullan.</p>\n<p>Birden çok yazma işlemi "ya hep ya hiç" olmalıdır. İzin onayı hem talebin durumunu değiştirir hem bakiyeyi düşürür; ikincisi başarısız olursa birincisi geri alınmalıdır.</p>\n' + code(r'''
from django.db import transaction

def izni_onayla(talep_id, onaylayan):
    with transaction.atomic():
        talep = Izin.objects.select_for_update().get(pk=talep_id)    # satırı kilitle
        if talep.durum != "beklemede":
            raise ValueError("zaten işlenmiş")
        talep.durum = "onaylandi"
        talep.save(update_fields=["durum"])
        Calisan.objects.filter(pk=talep.calisan_id).update(izin_bakiyesi=F("izin_bakiyesi") - talep.gun)
        transaction.on_commit(lambda: bildirim_gonder.delay(talep_id))   # Celery: commit SONRASI
''') + '\n' + py(r'''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE talep (id INTEGER PRIMARY KEY, durum TEXT)")
con.execute("CREATE TABLE bakiye (emp_id INTEGER PRIMARY KEY, gun INTEGER CHECK (gun >= 0))")
con.execute("INSERT INTO talep VALUES (1, 'beklemede')")
con.execute("INSERT INTO bakiye VALUES (418, 2)")
con.commit()

try:
    with con:                                     # transaction.atomic karşılığı
        con.execute("UPDATE talep SET durum = 'onaylandi' WHERE id = 1")
        con.execute("UPDATE bakiye SET gun = gun - 5 WHERE emp_id = 418")   # CHECK ihlali
except sqlite3.IntegrityError as e:
    print("geri alındı:", e)
print(con.execute("SELECT durum FROM talep").fetchone(), con.execute("SELECT gun FROM bakiye").fetchone())
''') + '\n<p><code>with con:</code> blok hatasız biterse commit, hata çıkarsa rollback yapar; talep "beklemede" kaldı. <code>transaction.on_commit</code> önemlidir: Celery görevini atomic bloğun içinde doğrudan çağırırsan işçi, henüz commit edilmemiş kaydı bulamayabilir.</p>\n\n<h2>Django REST Framework: serializer\'dan router\'a</h2>\n<p>DRF\'te bir isteğin yolu: router URL\'i ViewSet eylemine eşler → kimlik doğrulama → izin sınıfları (<code>has_permission</code>) → throttling → <code>get_queryset</code> ve filtreler → nesne alınırsa <code>has_object_permission</code> → serializer doğrulaması → kaydetme → sayfalanmış yanıt.</p>\n' + code(r'''
# izin/api.py
from rest_framework import serializers, viewsets, permissions, decorators, response, status
from django_filters.rest_framework import DjangoFilterBackend

class IzinSerializer(serializers.ModelSerializer):
    calisan_ad = serializers.CharField(source="calisan.ad", read_only=True)

    class Meta:
        model = Izin
        fields = ["id", "calisan_ad", "tur", "baslangic", "gun", "durum"]
        read_only_fields = ["durum"]

    def validate_gun(self, deger):                       # alan düzeyi
        if not 1 <= deger <= 30:
            raise serializers.ValidationError("1 ile 30 gün arası olmalı.")
        return deger

    def validate(self, veri):                            # nesne düzeyi (alanlar arası)
        if veri["tur"] == "hastalık" and veri["gun"] > 10:
            raise serializers.ValidationError("10 günden uzun hastalık izni rapor ister.")
        return veri

class YoneticiMi(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.calisan.yonetici_id == request.user.calisan.id

class IzinViewSet(viewsets.ModelViewSet):
    serializer_class = IzinSerializer
    permission_classes = [permissions.IsAuthenticated, YoneticiMi]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["tur", "durum"]
    throttle_scope = "izin"

    def get_queryset(self):
        return Izin.objects.gorunur(self.request.user).select_related("calisan")

    def perform_create(self, serializer):
        serializer.save(calisan=self.request.user.calisan)

    @decorators.action(detail=True, methods=["post"])
    def onayla(self, request, pk=None):
        izin = self.get_object()                         # has_object_permission burada çalışır
        izni_onayla(izin.pk, request.user)
        return response.Response({"durum": "onaylandi"}, status=status.HTTP_200_OK)

# urls.py
# router = routers.DefaultRouter(); router.register("izinler", IzinViewSet, basename="izin")
# settings.py
# REST_FRAMEWORK = {"DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
#                   "PAGE_SIZE": 20,
#                   "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
#                   "DEFAULT_THROTTLE_RATES": {"izin": "60/min"}}
''') + '\n<div class="tbl-wrap"><table>\n<tr><th>DRF parçası</th><th>Görevi</th><th>Bu derste taklidi</th></tr>\n<tr><td>Serializer</td><td>Girdiyi doğrular ve tipe çevirir; modeli JSON\'a çevirir</td><td>Alan + nesne doğrulayıcı, hata sözlüğü</td></tr>\n<tr><td>Permission</td><td><code>has_permission</code> (her istek), <code>has_object_permission</code> (nesne alınınca)</td><td>İzin sınıfı zinciri</td></tr>\n<tr><td>Pagination</td><td><code>count/next/previous/results</code></td><td>Sayfa numaralı ve imleçli (keyset) sayfalama</td></tr>\n<tr><td>Filter backend</td><td>Sorgu parametrelerini <code>filter()</code>\'a çevirir</td><td>İzin listeli güvenli WHERE üretici</td></tr>\n<tr><td>Throttle</td><td>Kullanıcı/kapsam başına istek sınırı</td><td>Redis ve kuyruk dersinde token bucket</td></tr>\n</table></div>\n<p>Serializer\'ın doğrulama sırası: her alan için tip dönüşümü ve alan doğrulayıcıları → <code>validate_&lt;alan&gt;</code> → tüm alanlar geçerliyse <code>validate()</code>. Hatalar <code>{"alan": ["mesaj"], "non_field_errors": [...]}</code> biçiminde toplanır ve 400 ile döner.</p>\n' + py(r'''
import datetime as dt

TURLER = {"yıllık", "hastalık", "mazeret", "ücretsiz"}

def dogrula(girdi):
    hatalar, temiz = {}, {}
    for alan, cevir in (("tur", str), ("baslangic", dt.date.fromisoformat), ("gun", int)):
        if alan not in girdi:
            hatalar.setdefault(alan, []).append("Bu alan zorunlu.")
            continue
        try:
            temiz[alan] = cevir(girdi[alan])
        except (TypeError, ValueError):
            hatalar.setdefault(alan, []).append("Geçersiz değer.")
    if "tur" in temiz and temiz["tur"] not in TURLER:
        hatalar.setdefault("tur", []).append(f"{temiz['tur']!r} geçerli bir seçim değil.")
    if not hatalar and temiz["tur"] == "hastalık" and temiz["gun"] > 10:
        hatalar["non_field_errors"] = ["10 günden uzun hastalık izni rapor ister."]
    return (temiz, {}) if not hatalar else ({}, hatalar)

print(dogrula({"tur": "yıllık", "baslangic": "2025-07-01", "gun": "5"}))
print(dogrula({"tur": "tatil", "baslangic": "2025-13-01"}))
print(dogrula({"tur": "hastalık", "baslangic": "2025-02-03", "gun": 14}))
''') + '\n\n<h2>Ayarlar, yönetim komutları ve test</h2>\n<p>Tek bir <code>settings.py</code> ile geliştirme ve üretimi yönetmek hataya açıktır. Yaygın yapı: <code>settings/base.py</code> (ortak), <code>dev.py</code> ve <code>prod.py</code> (<code>from .base import *</code> + farklar); hangisinin yükleneceğini <code>DJANGO_SETTINGS_MODULE</code> belirler, sırlar ortam değişkeninden okunur (Docker dersindeki 12-factor ilkesi). Tekrarlanan bakım işleri (gece bakiye hesabı, eski kayıt temizliği) için özel yönetim komutu yaz:</p>\n' + code(r'''
# izin/management/commands/bakiye_yenile.py   ->   python manage.py bakiye_yenile --yil 2025
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Yıllık izin bakiyelerini yeniden hesaplar"

    def add_arguments(self, parser):
        parser.add_argument("--yil", type=int, required=True)

    def handle(self, *args, yil, **kw):
        n = bakiye_hesapla(yil)
        self.stdout.write(self.style.SUCCESS(f"{n} çalışanın bakiyesi güncellendi"))
''') + '\n' + code(r'''
# tests/test_izin_api.py      ->  pip install pytest-django factory-boy ; pytest
import factory, pytest
from rest_framework.test import APIClient

class CalisanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Calisan
    ad = factory.Faker("name", locale="tr_TR")
    kullanici = factory.SubFactory(UserFactory)

@pytest.mark.django_db
def test_yonetici_ekibinin_iznini_onaylar(django_assert_num_queries):
    yonetici = CalisanFactory()
    izin = IzinFactory(calisan__yonetici=yonetici)
    api = APIClient(); api.force_authenticate(yonetici.kullanici)
    r = api.post(f"/api/izinler/{izin.pk}/onayla/")
    assert r.status_code == 200
    izin.refresh_from_db(); assert izin.durum == "onaylandi"

@pytest.mark.django_db
def test_baskasi_onaylayamaz():
    izin = IzinFactory()
    api = APIClient(); api.force_authenticate(CalisanFactory().kullanici)
    assert api.post(f"/api/izinler/{izin.pk}/onayla/").status_code == 404   # görünmüyor
''') + '\n<p>Factory\'ler test verisini tek satırda, ilişkileriyle birlikte üretir; sabit JSON fixture\'larından daha bakımı kolaydır. <code>@pytest.mark.django_db</code> her testi kendi transaction\'ında çalıştırıp sonunda geri alır.</p>\n\n<h2>Celery, statik ve medya dosyaları</h2>\n<p>E-posta, PDF rapor, toplu içe aktarma gibi uzun işler isteğin içinde yapılmaz; Celery görevine verilir ve <code>transaction.on_commit</code> ile commit\'ten sonra kuyruğa atılır. Broker, yeniden deneme ve ölü mektup kuyruğu ayrıntılarını Redis ve kuyruk dersinde göreceksin. Statik dosyalar (CSS, JS) <code>collectstatic</code> ile tek klasöre toplanır ve WhiteNoise ya da CDN ile sunulur; kullanıcı yüklemeleri (medya, ör. hastalık raporu) ise <code>MEDIA_ROOT</code> ya da S3 benzeri nesne deposuna gider ve <b>asla</b> uygulama sunucusunun kod klasöründe tutulmaz.</p>\n<div class="note"><b>Gerçek işte</b>Django projelerindeki performans sorunlarının büyük kısmı ORM kullanımından gelir: şablonda ya da serializer\'da gizlenmiş N+1, gereksiz <code>count()</code>, indekssiz süzgeç. Kod incelemesinde liste uç noktası için "kaç sorgu atıyor?" sorusu sorulur ve cevabı bir testle verilir. DRF\'te güvenlik hatalarının çoğu da <code>get_queryset</code>\'in kullanıcıya göre süzülmemesinden çıkar.</div>\n\n<section class="deep"><span class="eyebrow">Uzmanlaş</span>\n<h3>Sorgu planı ve indeks</h3>\n<p><code>print(qs.query)</code> ORM\'in SQL\'ini, <code>qs.explain()</code> veritabanının planını gösterir. Sık süzülen alanlara <code>Meta.indexes</code> ile indeks ekle; bileşik indekste sütun sırası sorgudaki eşitlik ve sıralama sırasına uymalı.</p>\n<h3>Subquery, Exists ve pencere fonksiyonları</h3>\n<p><code>annotate(son_izin=Subquery(Izin.objects.filter(calisan=OuterRef("pk")).order_by("-baslangic").values("baslangic")[:1]))</code> her çalışana tek sorguda son iznini ekler; <code>Exists</code> "en az bir bekleyen izni var mı" sorusunu JOIN çoğalması olmadan cevaplar; <code>Window(Rank(), partition_by=...)</code> sıralama raporlarını veritabanında yapar.</p>\n<h3>Büyük veriyle çalışmak</h3>\n<p><code>bulk_create</code> ve <code>bulk_update</code> binlerce satırı birkaç sorguda yazar (sinyal tetiklemez); <code>iterator(chunk_size=2000)</code> büyük QuerySet\'i belleğe almadan gezer; büyük tablolarda sayfa numaralı sayfalama yerine imleçli (cursor) sayfalama <code>OFFSET</code> maliyetinden kurtarır.</p>\n</section>\n'

SAYAC = 'class SorguSayaci:\n    def __init__(self, con):\n        self.con = con\n        self.sorgular = []\n\n    def __enter__(self):\n        self.con.set_trace_callback(self._kaydet)\n        return self\n\n    def _kaydet(self, sql):\n        if sql.lstrip().upper().startswith("SELECT"):\n            self.sorgular.append(sql)\n\n    def __exit__(self, *hata):\n        self.con.set_trace_callback(None)\n        return False\n\n    @property\n    def sayi(self):\n        return len(self.sorgular)\n'

ex = []
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'Yönetici listesi sayfasında her yöneticinin ekibindeki çalışanların adları (<code>yonetici.ekip.all()</code>, ters ForeignKey) gösteriliyor. N+1\'i hangisi çözer?',
  'o': ['<code>select_related("ekip")</code>', '<code>prefetch_related("ekip")</code>', '<code>only("ad")</code>', '<code>order_by("ad")</code>'],
  'a': 1,
  'why': 'select_related yalnız ileri yönlü tekil ilişkiler (FK, OneToOne) için JOIN kurar; ters FK\'de her yöneticinin birden çok çalışanı olduğu için ikinci bir IN (...) sorgusu atıp Python\'da eşleyen prefetch_related gerekir. only sütunları daraltır, sorgu sayısını azaltmaz.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'İzin onaylanınca Celery ile e-posta gönderilecek. Görev, <code>transaction.atomic()</code> bloğunun <b>içinde</b> <code>bildir.delay(id)</code> ile kuyruğa atılıyor ve bazen işçi "kayıt bulunamadı" hatası veriyor. Doğru düzeltme hangisi?',
  'o': ['İşçide görevin başına <code>time.sleep(2)</code> koyup beklemek', '<code>transaction.on_commit(lambda: bildir.delay(id))</code>', 'atomic bloğunu tümden kaldırıp her satırı ayrı kaydetmek', 'Görevi <code>post_save</code> sinyalinin içine taşımak'],
  'a': 1,
  'why': 'İşçi, transaction commit edilmeden önce çalışırsa değişikliği göremez. on_commit görevi ancak commit başarılı olunca kuyruğa atar; rollback olursa hiç atmaz. Uyutmak yarışı gizler, atomic\'i kaldırmak tutarlılığı bozar, post_save de transaction içinde çalıştığı için aynı sorunu taşır.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'DRF\'te <code>has_object_permission</code> ne zaman çağrılır?',
  'o': ['Her istekte, view metodu çalışmadan hemen önce', 'View <code>self.get_object()</code> çağırdığında', 'Yalnız liste (<code>list</code>) isteklerinde, her satır için', 'Serializer doğrulaması bittikten sonra, kaydetmeden önce'],
  'a': 1,
  'why': 'has_permission her istekte çalışır; has_object_permission ise view get_object() ile tek bir nesne aldığında devreye girer. Liste uç noktasında çağrılmaz; bu yüzden listede görünürlük get_queryset ile süzülmelidir, yoksa liste herkesin kayıtlarını döndürür.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Sorgu sayacı ile N+1: bu kod ne yazdırır?',
  'code': 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE calisan (id INTEGER, ad TEXT)")\ncon.execute("CREATE TABLE izin (id INTEGER, calisan_id INTEGER)")\ncon.executemany("INSERT INTO calisan VALUES (?, ?)", [(1, "Cem"), (2, "Ayşe")])\ncon.executemany("INSERT INTO izin VALUES (?, ?)", [(10, 1), (11, 2), (12, 1), (13, 1)])\nsayac = []\ncon.set_trace_callback(sayac.append)\nfor izin_id, cid in con.execute("SELECT id, calisan_id FROM izin").fetchall():\n    con.execute("SELECT ad FROM calisan WHERE id = ?", (cid,)).fetchone()\nprint(len(sayac))\n',
  'o': ['2', '3', '5', '4'],
  'a': 2,
  'why': 'Bir sorgu izinleri getirir, ardından 4 izin için 4 ayrı çalışan sorgusu atılır: 1 + N = 5. Aynı çalışan (Cem) üç kez sorgulanır; ORM de önbellek olmadan aynısını yapar. JOIN (select_related) ile 1, IN (prefetch_related) ile 2 sorguya iner.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'DRF tarzı doğrulama sırası: bu kod ne yazdırır?',
  'code': 'def dogrula(veri):\n    hatalar = {}\n    if not isinstance(veri.get("gun"), int):\n        hatalar["gun"] = ["Tam sayı olmalı."]\n    elif veri["gun"] > 30:\n        hatalar["gun"] = ["En çok 30."]\n    if veri.get("tur") not in {"yıllık", "mazeret"}:\n        hatalar["tur"] = ["Geçersiz seçim."]\n    if not hatalar and veri["tur"] == "mazeret" and veri["gun"] > 3:\n        hatalar["non_field_errors"] = ["Mazeret izni 3 günü aşamaz."]\n    return sorted(hatalar)\n\nprint(dogrula({"gun": 40, "tur": "mazeret"}), dogrula({"gun": 5, "tur": "mazeret"}), dogrula({"gun": "5"}))\n',
  'o': ["['gun'] ['non_field_errors'] ['gun', 'tur']", "['gun', 'non_field_errors'] ['non_field_errors'] ['gun', 'tur']", "['gun'] [] ['gun']", "['gun'] ['non_field_errors'] ['gun']"],
  'a': 0,
  'why': 'İlk çağrıda alan hatası (40 > 30) olduğu için nesne düzeyi kural hiç çalışmaz; DRF de validate() metodunu yalnız alanlar geçerliyse çağırır. İkincide alanlar geçerli, mazeret kuralı ihlal edildi. Üçüncüde "5" metin olduğu için gun hatası, tur eksik olduğu için tur hatası.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Sayfa numaralı sayfalama: 30 restoranlık Lezzet Kurye listesinde bu kod ne yazdırır?',
  'code': 'import math\ntoplam, boyut = 30, 8\nfor sayfa in (1, 4, 5):\n    son = math.ceil(toplam / boyut)\n    if sayfa > son:\n        print(sayfa, "404")\n        continue\n    ofset = (sayfa - 1) * boyut\n    adet = min(boyut, toplam - ofset)\n    print(sayfa, ofset, adet, sayfa < son)\n',
  'o': ['1 0 8 True\n4 24 6 False\n5 404', '1 0 8 True\n4 24 8 True\n5 32 0 False', '1 8 8 True\n4 32 6 False\n5 404', '1 0 8 True\n4 24 6 True\n5 404'],
  'a': 0,
  'why': 'ceil(30 / 8) = 4 sayfa. 4. sayfanın ofseti (4 - 1) × 8 = 24 ve kalan 6 kayıt vardır; son sayfa olduğu için next yoktur (False). 5. sayfa aralık dışıdır; DRF PageNumberPagination bu durumda 404 "Invalid page" döner.'})
ex.append({'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>İzin onayını tek bir transaction içinde yapan, bakiye yetmezse her şeyi geri alan programın satırlarını sırala.</p>',
  'lines': ['import sqlite3', 'con = sqlite3.connect(":memory:")', 'con.executescript("CREATE TABLE talep (id, durum); CREATE TABLE bakiye (gun CHECK (gun >= 0)); INSERT INTO talep VALUES (1, \'beklemede\'); INSERT INTO bakiye VALUES (2);")', 'try:', '    with con:', '        con.execute("UPDATE talep SET durum = \'onaylandi\'")', '        con.execute("UPDATE bakiye SET gun = gun - 3")', 'except sqlite3.IntegrityError:', '    print(con.execute("SELECT durum FROM talep").fetchone()[0])'],
  'expect': 'beklemede\n',
  'hint': 'Tablolar önce kurulmalı; iki UPDATE aynı with bloğunun içinde, hata yakalama bloğun dışında.',
  'why': 'with con: bloğu transaction.atomic gibi davranır: bakiye CHECK kısıtını ihlal edince IntegrityError fırlar ve bloktaki tüm değişiklikler (talep durumu dahil) geri alınır. Bu yüzden talep "beklemede" kalır.'})

ex.append({'id': 'django-ileri-1', 't': 'code', 'stage': 'Rehberli', 'diff': 1, 'needs': ['sqlite3'],
  'q': '<p>Django\'nun <code>assertNumQueries</code>\'ine benzeyen <code>SorguSayaci(con)</code> bağlam yöneticisini (context manager) yaz. <code>with SorguSayaci(con) as s:</code> bloğu içinde çalışan <b>SELECT</b> ifadelerini <code>s.sorgular</code> listesine eklesin, <code>s.sayi</code> özelliği sayıyı versin. Blok bitince izleme kapansın (<code>set_trace_callback(None)</code>). Başka ifadeler (INSERT, BEGIN...) sayılmasın.</p>',
  'guide': ['__init__\'te bağlantıyı ve boş bir liste sakla.', '__enter__: con.set_trace_callback(self._kaydet) ve return self.', '_kaydet(sql): sql.lstrip().upper().startswith("SELECT") ise listeye ekle.', '__exit__: izlemeyi None ile kapat, False döndür (hatayı yutma).', 'sayi\'yi @property ile len(self.sorgular) olarak tanımla.'],
  'example': 'import sqlite3\ncon = sqlite3.connect(":memory:")\ngoruldu = []\ncon.set_trace_callback(goruldu.append)\ncon.execute("SELECT 1")\ncon.set_trace_callback(None)\ncon.execute("SELECT 2")\nprint(goruldu)\n',
  'start': 'import veri\n\nclass SorguSayaci:\n    def __init__(self, con):\n        self.con = con\n        self.sorgular = []\n\n    def __enter__(self):\n        # TODO: izlemeyi başlat\n        return self\n\n    def _kaydet(self, sql):\n        # TODO: yalnız SELECT\'leri ekle\n        pass\n\n    def __exit__(self, *hata):\n        # TODO: izlemeyi kapat\n        return False\n\n    # TODO: sayi özelliği\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees"])\n',
  'sol': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees"])\n',
  'tests': 'with SorguSayaci(con) as s:\n    for e in (1, 2, 3):\n        con.execute("SELECT full_name FROM ik_employees WHERE emp_id = ?", (e,)).fetchone()\n    con.execute("CREATE TABLE gecici (x)")\n    con.execute("INSERT INTO gecici VALUES (1)")\nassert s.sayi == 3, f"3 SELECT bekleniyordu, {s.sayi} sayıldı; yalnız SELECT\'leri say"\nassert all("ik_employees" in q for q in s.sorgular), "sorgu metinleri saklanmalı"\ncon.execute("SELECT 1")\nassert s.sayi == 3, "blok bitince izleme kapanmalı"\ntry:\n    with SorguSayaci(con) as s2:\n        con.execute("SELECT 2")\n        raise KeyError("x")\nexcept KeyError:\n    pass\nelse:\n    assert False, "__exit__ hatayı yutmamalı (False döndür)"\nassert s2.sayi == 1, "hata olsa da sayım korunmalı"\n',
  'hints': ['set_trace_callback her çalıştırılan SQL metni için verilen fonksiyonu çağırır.', 'with bloğundaki değişkene __enter__\'ın döndürdüğü değer atanır; self döndür.', '@property\ndef sayi(self):\n    return len(self.sorgular)'],
  'why': 'Ölçmeden optimizasyon tahmindir. Django\'nun CaptureQueriesContext ve assertNumQueries araçları aynı fikirle çalışır: veritabanı katmanına bir kanca takıp atılan sorguları toplar. Bu sayaç sonraki görevlerde N+1\'i yakalamak için kullanılacak.'})

ex.append({'id': 'django-ileri-2', 't': 'code', 'stage': 'Rehberli', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>select_related</code> karşılığını yaz. <code>izin_listesi(con, limit)</code> Pusula İK\'da <code>leave_id</code> sırasına göre ilk <code>limit</code> izni <code>(leave_id, full_name, leave_type, days)</code> demetleri olarak döndürsün; çalışan adı <code>ik_employees</code>\'tan gelir. <b>Tek sorgu</b> atmalı (testte <code>SorguSayaci</code> ile ölçülür). <code>limit</code>\'i parametre olarak ver.</p>',
  'guide': ['ik_leaves (l) ile ik_employees (e) tablolarını emp_id üzerinden JOIN et.', 'Seçilecek sütunlar: l.leave_id, e.full_name, l.leave_type, l.days.', 'ORDER BY l.leave_id LIMIT ? ve parametre olarak (limit,).', 'fetchall() sonucunu döndür.'],
  'example': 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.executescript("CREATE TABLE r (id, ad); CREATE TABLE s (id, r_id); INSERT INTO r VALUES (1, \'Fincan\'); INSERT INTO s VALUES (7, 1);")\nprint(con.execute("SELECT s.id, r.ad FROM s JOIN r ON r.id = s.r_id").fetchall())\n',
  'start': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])\n\ndef izin_listesi(con, limit):\n    sonuc = []\n    izinler = con.execute("SELECT leave_id, emp_id, leave_type, days FROM ik_leaves ORDER BY leave_id LIMIT ?", (limit,)).fetchall()\n    for lid, emp, tur, gun in izinler:\n        # TODO: bu döngü N+1 üretir; tek bir JOIN sorgusuyla değiştir\n        ad = con.execute("SELECT full_name FROM ik_employees WHERE emp_id = ?", (emp,)).fetchone()[0]\n        sonuc.append((lid, ad, tur, gun))\n    return sonuc\n',
  'sol': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])\n\ndef izin_listesi(con, limit):\n    return con.execute(\n        """SELECT l.leave_id, e.full_name, l.leave_type, l.days\n           FROM ik_leaves l JOIN ik_employees e ON e.emp_id = l.emp_id\n           ORDER BY l.leave_id LIMIT ?""",\n        (limit,),\n    ).fetchall()\n',
  'tests': 'with SorguSayaci(con) as s:\n    r = izin_listesi(con, 50)\nassert len(r) == 50, "50 satır dönmeli"\nassert s.sayi == 1, f"tek sorgu bekleniyordu, {s.sayi} sorgu atıldı (N+1)"\nassert r[0] == (1, "Cem Bal", "mazeret", 3), "ilk izin Cem Bal\'ın 3 günlük mazeret izni"\nwith SorguSayaci(con) as s:\n    r2 = izin_listesi(con, 500)\nassert s.sayi == 1 and len(r2) == 500, "satır sayısı artınca sorgu sayısı sabit kalmalı"\nassert [x[0] for x in r2] == sorted(x[0] for x in r2), "leave_id sırası korunmalı"\n',
  'hints': ['Döngüdeki ikinci sorgu yerine iki tabloyu JOIN ile birleştir.', 'JOIN ik_employees e ON e.emp_id = l.emp_id', 'return con.execute("SELECT l.leave_id, e.full_name, l.leave_type, l.days FROM ik_leaves l JOIN ik_employees e ON e.emp_id = l.emp_id ORDER BY l.leave_id LIMIT ?", (limit,)).fetchall()'],
  'why': 'Izin.objects.select_related("calisan")[:50] tam olarak bu SQL\'i üretir: tek sorgu, INNER JOIN (alan null olabiliyorsa LEFT OUTER JOIN). Sorgu sayısının veri boyutundan bağımsız olması, N+1\'in çözüldüğünün kanıtıdır.'})

ex.append({'id': 'django-ileri-3', 't': 'code', 'stage': 'Rehberli', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>prefetch_related</code> karşılığını yaz. <code>ekipler(con, yonetici_idler)</code> her yönetici için doğrudan bağlı çalışanların adlarını <b>alfabetik</b> liste olarak veren sözlük döndürsün: <code>{yonetici_id: [ad, ...]}</code>. Ekibi olmayan yönetici boş liste alsın. <b>Tam iki sorgu</b> atmalı: önce yöneticiler (<code>emp_id IN (...)</code>), sonra tüm ekipler (<code>manager_id IN (...)</code>); eşlemeyi Python\'da yap. Yalnız aktif çalışanları (<code>term_date IS NULL</code>) say.</p>',
  'guide': ['Yer tutucu metni kur: ",".join("?" * len(idler)).', '1. sorgu: SELECT emp_id FROM ik_employees WHERE emp_id IN (...) ile var olan yöneticileri bul; her biri için boş liste aç.', '2. sorgu: SELECT manager_id, full_name ... WHERE term_date IS NULL AND manager_id IN (...) ORDER BY full_name.', 'Sonuçları sonuc[manager_id].append(ad) ile dağıt.'],
  'example': 'satirlar = [(13, "Ali"), (34, "Ece"), (13, "Can")]\ngrup = {13: [], 34: [], 99: []}\nfor m, ad in satirlar:\n    grup[m].append(ad)\nprint(grup)\n',
  'start': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees"])\n\ndef ekipler(con, yonetici_idler):\n    idler = list(yonetici_idler)\n    yer = ",".join("?" * len(idler))\n    sonuc = {}\n    # TODO: 1. sorgu yöneticiler, 2. sorgu ekipler\n    return sonuc\n',
  'sol': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees"])\n\ndef ekipler(con, yonetici_idler):\n    idler = list(yonetici_idler)\n    yer = ",".join("?" * len(idler))\n    sonuc = {}\n    for (emp,) in con.execute(f"SELECT emp_id FROM ik_employees WHERE emp_id IN ({yer})", idler):\n        sonuc[emp] = []\n    satirlar = con.execute(\n        f"SELECT manager_id, full_name FROM ik_employees WHERE term_date IS NULL AND manager_id IN ({yer}) ORDER BY full_name",\n        idler,\n    )\n    for m, ad in satirlar:\n        sonuc[m].append(ad)\n    return sonuc\n',
  'tests': 'with SorguSayaci(con) as s:\n    e = ekipler(con, [13, 34, 418])\nassert s.sayi == 2, f"tam 2 sorgu bekleniyordu, {s.sayi} atıldı"\nassert set(e) == {13, 34, 418}, "her yönetici anahtar olmalı"\nassert len(e[13]) == 89 and len(e[34]) == 72, "aktif ekip büyüklükleri: 13 -> 89, 34 -> 72"\nassert e[418] == [], "ekibi olmayan boş liste almalı"\nassert e[13] == sorted(e[13]), "adlar alfabetik olmalı"\nwith SorguSayaci(con) as s:\n    ekipler(con, [13, 14, 33, 34, 35, 38, 40, 41])\nassert s.sayi == 2, "yönetici sayısı artınca da 2 sorgu"\n',
  'hints': ['IN listesinin uzunluğu kadar ? üret ve parametreleri liste olarak ver.', 'İlk sorgu sözlüğün anahtarlarını kurar; böylece ekibi olmayan yönetici de görünür.', 'ORDER BY full_name ile gelirse her listeye sırayla eklenen adlar zaten alfabetik olur.'],
  'why': 'prefetch_related("ekip") tam olarak böyle çalışır: ana sorgu, ardından ilişkili tüm satırlar için tek bir IN sorgusu ve Python\'da eşleme. Sorgu sayısı yönetici sayısından bağımsızdır. Prefetch(..., queryset=Calisan.objects.filter(term_date__isnull=True)) ikinci sorguyu süzmenin ORM yoludur.'})

ex.append({'id': 'django-ileri-4', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>DRF serializer\'ını taklit eden <code>IzinTalepSerializer(data)</code> sınıfını yaz. <code>is_valid()</code> doğrulamayı yapıp <code>True/False</code> döndürsün; sonrasında <code>validated_data</code> (temiz sözlük) ve <code>errors</code> (<code>{alan: [mesaj]}</code>) dolu olsun.</p><ul><li><code>tur</code>: zorunlu, <code>{"yıllık", "hastalık", "mazeret", "ücretsiz"}</code> içinden.</li><li><code>baslangic</code>: zorunlu, ISO tarih metni → <code>datetime.date</code>.</li><li><code>gun</code>: zorunlu, <code>int(...)</code>\'e çevrilebilmeli, 1–30 arası.</li><li>Alan hatası yoksa nesne kuralı: <code>mazeret</code> izni 3 günü aşamaz → <code>errors["non_field_errors"]</code>.</li></ul><p>Eksik alanın mesajı <code>"Bu alan zorunlu."</code>, diğer mesajlar serbest.</p>',
  'guide': ['validated_data ve errors\'ı boş sözlük olarak başlat.', 'Her alan için: yoksa zorunlu mesajı; varsa çevir (int, date.fromisoformat) ve hata olursa mesaj ekle.', 'validate_<alan> mantığı: tur seçimde mi, gun 1–30 mu.', 'Alan hatası yoksa nesne kuralını çalıştır.', 'is_valid: not self.errors döndür; hatada validated_data boş kalsın.'],
  'example': 'hatalar = {}\nhatalar.setdefault("gun", []).append("Tam sayı olmalı.")\nhatalar.setdefault("gun", []).append("En az 1.")\nprint(hatalar)\n',
  'start': 'import datetime as dt\n\nTURLER = {"yıllık", "hastalık", "mazeret", "ücretsiz"}\n\nclass IzinTalepSerializer:\n    def __init__(self, data):\n        self.initial_data = data\n        self.validated_data = {}\n        self.errors = {}\n\n    def _hata(self, alan, mesaj):\n        self.errors.setdefault(alan, []).append(mesaj)\n\n    def is_valid(self):\n        # TODO: alanları çevir ve doğrula, sonra nesne kuralı\n        return not self.errors\n',
  'sol': 'import datetime as dt\n\nTURLER = {"yıllık", "hastalık", "mazeret", "ücretsiz"}\n\nclass IzinTalepSerializer:\n    def __init__(self, data):\n        self.initial_data = data\n        self.validated_data = {}\n        self.errors = {}\n\n    def _hata(self, alan, mesaj):\n        self.errors.setdefault(alan, []).append(mesaj)\n\n    def is_valid(self):\n        d, temiz = self.initial_data, {}\n        for alan in ("tur", "baslangic", "gun"):\n            if alan not in d or d[alan] in (None, ""):\n                self._hata(alan, "Bu alan zorunlu.")\n        if "tur" not in self.errors:\n            if d["tur"] in TURLER:\n                temiz["tur"] = d["tur"]\n            else:\n                self._hata("tur", f"{d[\'tur\']!r} geçerli bir seçim değil.")\n        if "baslangic" not in self.errors:\n            try:\n                temiz["baslangic"] = dt.date.fromisoformat(str(d["baslangic"]))\n            except ValueError:\n                self._hata("baslangic", "Tarih YYYY-AA-GG olmalı.")\n        if "gun" not in self.errors:\n            try:\n                gun = int(d["gun"])\n            except (TypeError, ValueError):\n                self._hata("gun", "Tam sayı olmalı.")\n            else:\n                if 1 <= gun <= 30:\n                    temiz["gun"] = gun\n                else:\n                    self._hata("gun", "1 ile 30 arasında olmalı.")\n        if not self.errors and temiz["tur"] == "mazeret" and temiz["gun"] > 3:\n            self._hata("non_field_errors", "Mazeret izni 3 günü aşamaz.")\n        self.validated_data = {} if self.errors else temiz\n        return not self.errors\n',
  'tests': 'import datetime as dt\ns = IzinTalepSerializer({"tur": "yıllık", "baslangic": "2025-07-01", "gun": "5"})\nassert s.is_valid() is True, f"geçerli talep kabul edilmeli: {s.errors}"\nassert s.validated_data == {"tur": "yıllık", "baslangic": dt.date(2025, 7, 1), "gun": 5}, "değerler tipine çevrilmeli (date, int)"\ns = IzinTalepSerializer({"tur": "tatil", "gun": "x"})\nassert s.is_valid() is False and s.validated_data == {}, "hatalı girdi reddedilmeli ve validated_data boş kalmalı"\nassert set(s.errors) == {"tur", "baslangic", "gun"}, f"üç alan hatası bekleniyordu: {s.errors}"\nassert s.errors["baslangic"] == ["Bu alan zorunlu."], "eksik alan mesajı"\ns = IzinTalepSerializer({"tur": "mazeret", "baslangic": "2025-02-30", "gun": 2})\nassert s.is_valid() is False and list(s.errors) == ["baslangic"], "geçersiz tarih (30 Şubat) yakalanmalı"\ns = IzinTalepSerializer({"tur": "mazeret", "baslangic": "2025-02-03", "gun": 4})\nassert s.is_valid() is False and list(s.errors) == ["non_field_errors"], "mazeret 3 günü aşamaz"\ns = IzinTalepSerializer({"tur": "mazeret", "baslangic": "2025-02-03", "gun": 0})\nassert list(s.errors) == [] and s.is_valid() is False and list(s.errors) == ["gun"], "gun 1-30 arası; alan hatası varken nesne kuralı çalışmamalı"\nassert IzinTalepSerializer({"tur": "hastalık", "baslangic": "2025-03-03", "gun": 30}).is_valid(), "30 sınır değeri geçerli"\n',
  'hints': ['Önce zorunlulukları kontrol et; sonra yalnız hatası olmayan alanları çevir.', 'int("x") ValueError, int(None) TypeError verir; ikisini de yakala. date.fromisoformat("2025-02-30") ValueError verir.', 'Nesne kuralını if not self.errors: koşuluyla çalıştır; sonunda validated_data = {} if self.errors else temiz.'],
  'why': 'DRF\'te doğrulama katmanlıdır: tip dönüşümü (to_internal_value), alan doğrulayıcıları (validate_gun), sonra alanlar arası kural (validate). Hatalar alan adına göre liste olarak toplanır ki istemci formun doğru yerinde gösterebilsin. Nesne kuralının yalnız alanlar geçerliyken çalışması, None ile karşılaştırma gibi ikincil hataları önler.'})

ex.append({'id': 'django-ileri-5', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>Bu ORM sorgusunun SQL karşılığını yaz:</p><pre class="code">Izin.objects.filter(baslangic__year=yil)\n    .values("calisan__pozisyon__bolum__ad")\n    .annotate(talep=Count("id"), gun=Sum("gun"),\n              hastalik_gun=Sum("gun", filter=Q(tur="hastalık")))\n    .order_by("-gun", "calisan__pozisyon__bolum__ad")</pre><p><code>departman_ozeti(con, yil)</code> Pusula İK verisinde <code>(bölüm_adı, talep, gun, hastalik_gun)</code> demetleri listesi döndürsün. Zincir: <code>ik_leaves → ik_employees → ik_positions → ik_departments</code>. Yıl, <code>start_date</code>\'in ilk dört karakteridir; yılı parametre olarak ver (<code>str(yil)</code>). Hastalık izni olmayan bölümde <code>hastalik_gun</code> 0 olsun.</p>',
  'start': 'import veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves", "ik_positions", "ik_departments"])\n\ndef departman_ozeti(con, yil):\n    pass\n',
  'sol': 'import veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves", "ik_positions", "ik_departments"])\n\ndef departman_ozeti(con, yil):\n    return con.execute(\n        """SELECT d.name, COUNT(*), SUM(l.days),\n                  SUM(CASE WHEN l.leave_type = \'hastalık\' THEN l.days ELSE 0 END)\n           FROM ik_leaves l\n           JOIN ik_employees e ON e.emp_id = l.emp_id\n           JOIN ik_positions p ON p.position_id = e.position_id\n           JOIN ik_departments d ON d.dept_id = p.dept_id\n           WHERE substr(l.start_date, 1, 4) = ?\n           GROUP BY d.name\n           ORDER BY 3 DESC, 1""",\n        (str(yil),),\n    ).fetchall()\n',
  'tests': 'r = departman_ozeti(con, 2024)\nassert len(r) == 12, f"12 bölüm bekleniyordu, {len(r)} geldi"\nassert r[0] == ("Mağaza Operasyonları", 965, 3126, 719), f"2024\'ün ilk satırı beklenenden farklı: {r[0]}"\nassert r[-1] == ("Genel Müdürlük", 1, 6, 0), "hastalık izni olmayan bölümde hastalik_gun 0 olmalı (CASE ... ELSE 0)"\nassert [x[2] for x in r] == sorted((x[2] for x in r), reverse=True), "gün toplamına göre azalan sıralanmalı"\nr23 = departman_ozeti(con, 2023)\nassert r23[:2] == [("Mağaza Operasyonları", 1004, 3264, 827), ("Yazılım Geliştirme", 697, 2350, 454)], "yıl parametresi doğru uygulanmalı (2023)"\nassert "?" in __source__, "yılı SQL\'e parametre ile ver"\n',
  'hints': ['values(...).annotate(...) → GROUP BY d.name; Count → COUNT(*), Sum → SUM.', 'Sum(filter=Q(...)) → SUM(CASE WHEN l.leave_type = \'hastalık\' THEN l.days ELSE 0 END)', 'baslangic__year=yil → substr(l.start_date, 1, 4) = ? ve parametre (str(yil),)'],
  'why': 'values() + annotate() ikilisi SQL\'deki GROUP BY\'dır; her çift alt çizgi bir JOIN ekler. Koşullu toplam için CASE WHEN her veritabanında çalışır (PostgreSQL\'de Django FILTER (WHERE ...) üretir). ELSE 0 yazmazsan eşleşmeyen satırlar NULL olur ve SUM hiç eşleşme yoksa NULL döndürür.'})

ex.append({'id': 'django-ileri-6', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>DRF izin sınıfı zincirini taklit et. Her izin sınıfının <code>has_permission(istek)</code> ve <code>has_object_permission(istek, nesne)</code> metotları var. İki sınıf yaz:</p><ul><li><code>GirisYapmis</code>: <code>istek["kullanici"]</code> <code>None</code> değilse izin verir; nesne düzeyinde her zaman <code>True</code>.</li><li><code>SahibiYaDaYoneticisi</code>: istek düzeyinde <code>True</code>; nesne düzeyinde güvenli yöntemlerde (<code>GET</code>, <code>HEAD</code>, <code>OPTIONS</code>) nesnenin sahibi (<code>nesne["emp_id"]</code>) ya da sahibinin yöneticisi (<code>nesne["manager_id"]</code>) ise <code>True</code>; diğer yöntemlerde yalnız yönetici ise <code>True</code>.</li></ul><p>Sonra <code>kontrol_et(siniflar, istek, nesne=None)</code> yaz: kullanıcı yoksa ve bir sınıf reddederse <code>401</code>, kullanıcı varken reddedilirse <code>403</code>; önce tüm sınıfların <code>has_permission</code>\'ı, nesne verilmişse ardından tüm <code>has_object_permission</code>\'lar denenir; hepsi geçerse <code>200</code>. <code>istek</code> <code>{"kullanici": emp_id ya da None, "yontem": "GET"}</code> biçimindedir.</p>',
  'start': 'class GirisYapmis:\n    pass\n\nclass SahibiYaDaYoneticisi:\n    pass\n\ndef kontrol_et(siniflar, istek, nesne=None):\n    pass\n',
  'sol': 'GUVENLI = {"GET", "HEAD", "OPTIONS"}\n\nclass GirisYapmis:\n    def has_permission(self, istek):\n        return istek["kullanici"] is not None\n\n    def has_object_permission(self, istek, nesne):\n        return True\n\nclass SahibiYaDaYoneticisi:\n    def has_permission(self, istek):\n        return True\n\n    def has_object_permission(self, istek, nesne):\n        k = istek["kullanici"]\n        if istek["yontem"] in GUVENLI:\n            return k in (nesne["emp_id"], nesne["manager_id"])\n        return k == nesne["manager_id"]\n\ndef kontrol_et(siniflar, istek, nesne=None):\n    reddet = 401 if istek["kullanici"] is None else 403\n    izinler = [s() for s in siniflar]\n    if not all(i.has_permission(istek) for i in izinler):\n        return reddet\n    if nesne is not None and not all(i.has_object_permission(istek, nesne) for i in izinler):\n        return reddet\n    return 200\n',
  'tests': 'S = [GirisYapmis, SahibiYaDaYoneticisi]\nizin = {"leave_id": 3319, "emp_id": 418, "manager_id": 42}\nassert kontrol_et(S, {"kullanici": None, "yontem": "GET"}, izin) == 401, "giriş yoksa 401"\nassert kontrol_et(S, {"kullanici": 418, "yontem": "GET"}, izin) == 200, "sahibi okuyabilir"\nassert kontrol_et(S, {"kullanici": 42, "yontem": "GET"}, izin) == 200, "yöneticisi okuyabilir"\nassert kontrol_et(S, {"kullanici": 603, "yontem": "GET"}, izin) == 403, "başkası okuyamaz"\nassert kontrol_et(S, {"kullanici": 418, "yontem": "PATCH"}, izin) == 403, "sahibi kendi iznini değiştiremez/onaylayamaz"\nassert kontrol_et(S, {"kullanici": 42, "yontem": "POST"}, izin) == 200, "yönetici onaylayabilir"\nassert kontrol_et(S, {"kullanici": 603, "yontem": "GET"}) == 200, "nesne yoksa (liste) yalnız has_permission çalışır"\nassert kontrol_et([GirisYapmis], {"kullanici": None, "yontem": "GET"}) == 401, "liste isteğinde de giriş şart"\nassert kontrol_et([], {"kullanici": None, "yontem": "GET"}) == 200, "izin sınıfı yoksa (AllowAny) geçer"\n',
  'hints': ['Sınıfları örnekle: [s() for s in siniflar]; DRF de get_permissions() içinde aynısını yapar.', 'all(...) boş listede True döner; bu AllowAny davranışını verir.', 'Ret kodu kullanıcının varlığına bağlı: 401 if istek["kullanici"] is None else 403.'],
  'why': 'DRF\'te permission_classes listesindeki sınıfların hepsi geçmelidir (VE). has_object_permission yalnız nesne alındığında çalışır; bu yüzden liste görünürlüğü ayrıca get_queryset ile süzülmelidir. Kimliği doğrulanmamış istek reddedildiğinde DRF 401 (WWW-Authenticate başlığı varsa) ya da 403 döner; bu ayrım kimlik-yetki dersindeki authN/authZ farkıdır.'})

ex.append({'id': 'django-ileri-7', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>DRF <code>PageNumberPagination</code> yanıtını üret. <code>sayfala(con, sayfa, boyut, url)</code> Lezzet Kurye <code>lk_restaurants</code> tablosunu <code>restaurant_id</code> sırasıyla sayfalayıp şu sözlüğü döndürsün:</p><pre class="code">{"count": toplam, "next": url + "?page=N" ya da None,\n "previous": url + "?page=N" ya da None,\n "results": [{"id": ..., "name": ..., "city": ...}, ...]}</pre><p><code>sayfa</code> 1\'den küçükse ya da son sayfadan büyükse <code>ValueError("Geçersiz sayfa")</code> fırlat. Tablo boşsa tek bir boş sayfa (<code>sayfa=1</code>) geçerlidir. <code>LIMIT ? OFFSET ?</code> kullan.</p>',
  'start': 'import veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"])\n\ndef sayfala(con, sayfa, boyut, url):\n    pass\n',
  'sol': 'import math\nimport veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"])\n\ndef sayfala(con, sayfa, boyut, url):\n    toplam = con.execute("SELECT COUNT(*) FROM lk_restaurants").fetchone()[0]\n    son = max(1, math.ceil(toplam / boyut))\n    if not 1 <= sayfa <= son:\n        raise ValueError("Geçersiz sayfa")\n    satirlar = con.execute(\n        "SELECT restaurant_id, name, city FROM lk_restaurants ORDER BY restaurant_id LIMIT ? OFFSET ?",\n        (boyut, (sayfa - 1) * boyut),\n    ).fetchall()\n    return {\n        "count": toplam,\n        "next": f"{url}?page={sayfa + 1}" if sayfa < son else None,\n        "previous": f"{url}?page={sayfa - 1}" if sayfa > 1 else None,\n        "results": [{"id": i, "name": n, "city": c} for i, n, c in satirlar],\n    }\n',
  'tests': 'U = "/api/restoranlar/"\np1 = sayfala(con, 1, 8, U)\nassert p1["count"] == 30, "toplam 30 restoran"\nassert p1["next"] == "/api/restoranlar/?page=2" and p1["previous"] is None, "ilk sayfada previous None"\nassert p1["results"][0] == {"id": 1, "name": "Köşe Dönercisi", "city": "İstanbul"}, "results sözlük listesi olmalı"\nassert len(p1["results"]) == 8, "sayfa boyutu 8"\np4 = sayfala(con, 4, 8, U)\nassert len(p4["results"]) == 6 and p4["next"] is None and p4["previous"] == "/api/restoranlar/?page=3", "son sayfa 6 kayıt, next None"\nassert [r["id"] for r in p4["results"]] == [25, 26, 27, 28, 29, 30], "OFFSET (sayfa - 1) * boyut"\nfor kotu in (0, 5, -1):\n    try:\n        sayfala(con, kotu, 8, U)\n        assert False, f"sayfa={kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\nbos = veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"])\nbos.execute("DELETE FROM lk_restaurants")\nassert sayfala(bos, 1, 8, U) == {"count": 0, "next": None, "previous": None, "results": []}, "boş tabloda tek boş sayfa"\n',
  'hints': ['Son sayfa = ceil(count / boyut), ama en az 1 (boş tablo).', 'OFFSET = (sayfa - 1) * boyut; LIMIT = boyut.', 'next yalnız sayfa < son, previous yalnız sayfa > 1 ise dolu.'],
  'why': 'DRF\'in sayfa numaralı yanıt biçimi budur ve istemciler next bağlantısını None olana kadar izler. Bu yöntem iki sorgu atar (COUNT + LIMIT/OFFSET); büyük tablolarda hem COUNT hem büyük OFFSET pahalıdır. Meydan okuma görevinde bunu imleçli sayfalamayla çözeceksin.'})

ex.append({'id': 'django-ileri-8', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>django-filter</code> benzeri güvenli bir filtre arka ucu yaz. <code>kuryeleri_suz(con, params)</code> URL sorgu parametreleri sözlüğünü (değerler metin) Lezzet Kurye <code>lk_couriers</code> sorgusuna çevirip <code>courier_id</code> listesini (artan) döndürsün. İzinli filtreler:</p><ul><li><code>city</code>, <code>vehicle</code>: eşitlik</li><li><code>rating__gte</code>, <code>rating__lte</code>: sayısal karşılaştırma (<code>float</code>\'a çevir)</li><li><code>name__icontains</code>: <code>full_name</code> içinde, büyük/küçük harf duyarsız (Python tarafında <code>casefold</code> karşılaştırması yeterli; Türkçe harfler için SQL <code>LIKE</code>\'a güvenme)</li></ul><p>İzinli olmayan her anahtarda <code>ValueError</code> fırlat (sütun adı asla kullanıcıdan SQL\'e geçmesin). Değerler <code>?</code> parametresiyle gitsin.</p>',
  'start': 'import veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_couriers"])\n\ndef kuryeleri_suz(con, params):\n    pass\n',
  'sol': 'import veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_couriers"])\n\nSQL_FILTRE = {\n    "city": ("city = ?", str),\n    "vehicle": ("vehicle = ?", str),\n    "rating__gte": ("rating >= ?", float),\n    "rating__lte": ("rating <= ?", float),\n}\n\ndef kuryeleri_suz(con, params):\n    kosullar, degerler, aranan = [], [], None\n    for anahtar, deger in params.items():\n        if anahtar == "name__icontains":\n            aranan = deger.casefold()\n        elif anahtar in SQL_FILTRE:\n            parca, cevir = SQL_FILTRE[anahtar]\n            kosullar.append(parca)\n            degerler.append(cevir(deger))\n        else:\n            raise ValueError(f"Bilinmeyen filtre: {anahtar}")\n    sql = "SELECT courier_id, full_name FROM lk_couriers"\n    if kosullar:\n        sql += " WHERE " + " AND ".join(kosullar)\n    sql += " ORDER BY courier_id"\n    return [i for i, ad in con.execute(sql, degerler) if aranan is None or aranan in ad.casefold()]\n',
  'tests': 'assert len(kuryeleri_suz(con, {"city": "İzmir"})) == 9, "İzmir\'de 9 kurye var"\nassert len(kuryeleri_suz(con, {"vehicle": "motosiklet", "rating__gte": "4.3"})) == 15, "motosikletli ve puanı >= 4.3 olan 15 kurye"\nassert kuryeleri_suz(con, {"city": "Ankara", "rating__gte": "4.2"}) == [4, 24, 30, 34, 38, 39, 48, 51, 53, 59], "filtreler VE ile birleşmeli"\nassert len(kuryeleri_suz(con, {})) == 60, "filtre yoksa tüm kuryeler"\nassert 1 in kuryeleri_suz(con, {"name__icontains": "OĞUZ"}), "icontains Türkçe büyük harfle de bulmalı (Oğuz Güneş)"\nassert kuryeleri_suz(con, {"rating__lte": "3.75"}) == kuryeleri_suz(con, {"rating__gte": "3", "rating__lte": "3.75"}), "lte sınırı dahil"\nfor kotu in ({"rating; DROP TABLE lk_couriers": "1"}, {"full_name": "x"}, {"city__in": "İzmir"}):\n    try:\n        kuryeleri_suz(con, kotu)\n        assert False, f"{list(kotu)[0]!r} izinli değil; ValueError bekleniyordu"\n    except ValueError:\n        pass\nassert con.execute("SELECT COUNT(*) FROM lk_couriers").fetchone()[0] == 60, "tablo sağlam kalmalı"\n',
  'hints': ['İzinli anahtarları bir sözlükte SQL parçasıyla eşle: "rating__gte": "rating >= ?".', 'Değerleri ayrı bir listede topla ve execute(sql, degerler) ile ver.', 'icontains için SQL dönüşünü Python\'da süz: aranan in ad.casefold().'],
  'why': 'Filtre arka uçları sorgu parametrelerini ORM süzgecine çevirir; güvenliği iki kurala dayanır: tanımlayıcılar (sütun, işlem) izin listesinden gelir, değerler parametreyle gider. SQLite\'ın LIKE ve lower() fonksiyonları yalnız ASCII harflerde büyük/küçük harf duyarsızdır; "OĞUZ" ile "Oğuz" eşleşmez. PostgreSQL\'de ILIKE ya da citext kullanılır.'})

ex.append({'id': 'django-ileri-9', 't': 'code', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug', 'needs': ['sqlite3'],
  'q': '<p><b>Hatayı bul ve düzelt.</b> Lezzet Kurye destek panelindeki <code>siparis_kartlari(con, idler)</code> fonksiyonu verilen siparişler için <code>(order_id, restoran_adı, kurye_adı)</code> listesi üretiyor. Sonuçlar doğru ama 200 siparişlik sayfa 401 sorgu atıyor ve yavaş. Ayrıca kuryesi atanmamış (<code>courier_id</code> NULL) siparişte çöküyor. Düzelt: <b>tek sorgu</b>, kuryesi olmayan siparişte kurye adı <code>None</code>, sonuç <code>order_id</code> sırasıyla.</p>',
  'start': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_orders", "lk_restaurants", "lk_couriers"])\n\ndef siparis_kartlari(con, idler):\n    sonuc = []\n    for oid in sorted(idler):\n        rid, cid = con.execute("SELECT restaurant_id, courier_id FROM lk_orders WHERE order_id = ?", (oid,)).fetchone()\n        restoran = con.execute("SELECT name FROM lk_restaurants WHERE restaurant_id = ?", (rid,)).fetchone()[0]\n        kurye = con.execute("SELECT full_name FROM lk_couriers WHERE courier_id = ?", (cid,)).fetchone()[0]\n        sonuc.append((oid, restoran, kurye))\n    return sonuc\n',
  'sol': 'import veri\n\n' + SAYAC + '\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_orders", "lk_restaurants", "lk_couriers"])\n\ndef siparis_kartlari(con, idler):\n    idler = list(idler)\n    if not idler:\n        return []\n    yer = ",".join("?" * len(idler))\n    return con.execute(\n        f"""SELECT o.order_id, r.name, c.full_name\n            FROM lk_orders o\n            JOIN lk_restaurants r ON r.restaurant_id = o.restaurant_id\n            LEFT JOIN lk_couriers c ON c.courier_id = o.courier_id\n            WHERE o.order_id IN ({yer})\n            ORDER BY o.order_id""",\n        idler,\n    ).fetchall()\n',
  'tests': 'with SorguSayaci(con) as s:\n    r = siparis_kartlari(con, [3, 1, 2, 358])\nassert r == [(1, "Sultan Döner", "Nur Yıldırım"), (2, "Sultan Döner", "Özge Tunç"), (3, "Fincan", "Kaan Kurt"), (358, "Bizim Mutfak", "Ayşe Aslan")], f"kartlar beklenenden farklı: {r}"\nassert s.sayi == 1, f"tek sorgu bekleniyordu, {s.sayi} atıldı"\nr = siparis_kartlari(con, [35, 1])\nassert r[1][0] == 35 and r[1][2] is None, "kuryesiz siparişte kurye adı None olmalı (LEFT JOIN)"\nwith SorguSayaci(con) as s:\n    r = siparis_kartlari(con, range(1, 201))\nassert len(r) == 200 and s.sayi == 1, "200 sipariş tek sorgu"\nassert siparis_kartlari(con, []) == [], "boş liste"\n',
  'hints': ['Her sipariş için üç ayrı sorgu atılıyor: 1 + 2N değil, 2N + ... Hepsini tek JOIN\'de topla.', 'Kurye atanmamış siparişler INNER JOIN\'de kaybolur; kurye tablosuna LEFT JOIN kullan.', 'IN listesi için yer tutucuları ",".join("?" * len(idler)) ile üret; boş listede SQL\'e gitmeden [] dön.'],
  'why': 'Orijinal kod her sipariş için iki ek sorgu atıyordu (select_related unutulmuş bir serializer\'ın tipik görüntüsü). ORM\'de karşılığı Siparis.objects.filter(pk__in=idler).select_related("restoran", "kurye"); null olabilen FK için Django otomatik LEFT OUTER JOIN kurar. Kuryesiz sipariş ise ikinci hatayı gösteriyor: None ile sorgu boş döner ve [0] indekslemesi çöker.'})

ex.append({'id': 'django-ileri-10', 't': 'code', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>onayla(con, talep_id)</code> izin talebini onaylayıp çalışanın bakiyesinden günü düşüyor. İki sorun var: (1) bakiye yetmediğinde (tablodaki <code>CHECK (gun &gt;= 0)</code> ihlali) talep yine de "onaylandi" olarak kalıyor; (2) bakiye Python\'da okunup yazıldığı için aynı anda gelen iki onayda biri kayboluyor. Düzelt: iki güncelleme tek transaction\'da olsun (<code>with con:</code>), bakiye <code>F()</code> gibi SQL içinde düşülsün (<code>gun = gun - ?</code>), yalnız <code>"beklemede"</code> talepler onaylansın. Başarıda <code>True</code>, bakiye yetmezse ya da talep beklemede değilse <code>False</code> döndür.</p>',
  'start': 'import sqlite3\n\ndef kur():\n    con = sqlite3.connect(":memory:", isolation_level="DEFERRED")\n    con.executescript("""\n        CREATE TABLE talep (id INTEGER PRIMARY KEY, emp_id INTEGER, gun INTEGER, durum TEXT);\n        CREATE TABLE bakiye (emp_id INTEGER PRIMARY KEY, gun INTEGER CHECK (gun >= 0));\n        INSERT INTO talep VALUES (1, 418, 5, \'beklemede\'), (2, 418, 10, \'beklemede\'), (3, 603, 2, \'onaylandi\');\n        INSERT INTO bakiye VALUES (418, 12), (603, 20);\n    """)\n    return con\n\ndef onayla(con, talep_id):\n    emp, gun, durum = con.execute("SELECT emp_id, gun, durum FROM talep WHERE id = ?", (talep_id,)).fetchone()\n    con.execute("UPDATE talep SET durum = \'onaylandi\' WHERE id = ?", (talep_id,))\n    con.commit()\n    mevcut = con.execute("SELECT gun FROM bakiye WHERE emp_id = ?", (emp,)).fetchone()[0]\n    try:\n        con.execute("UPDATE bakiye SET gun = ? WHERE emp_id = ?", (mevcut - gun, emp))\n        con.commit()\n    except sqlite3.IntegrityError:\n        return False\n    return True\n',
  'sol': 'import sqlite3\n\ndef kur():\n    con = sqlite3.connect(":memory:", isolation_level="DEFERRED")\n    con.executescript("""\n        CREATE TABLE talep (id INTEGER PRIMARY KEY, emp_id INTEGER, gun INTEGER, durum TEXT);\n        CREATE TABLE bakiye (emp_id INTEGER PRIMARY KEY, gun INTEGER CHECK (gun >= 0));\n        INSERT INTO talep VALUES (1, 418, 5, \'beklemede\'), (2, 418, 10, \'beklemede\'), (3, 603, 2, \'onaylandi\');\n        INSERT INTO bakiye VALUES (418, 12), (603, 20);\n    """)\n    return con\n\ndef onayla(con, talep_id):\n    try:\n        with con:\n            n = con.execute("UPDATE talep SET durum = \'onaylandi\' WHERE id = ? AND durum = \'beklemede\'", (talep_id,)).rowcount\n            if n == 0:\n                return False\n            con.execute(\n                "UPDATE bakiye SET gun = gun - (SELECT gun FROM talep WHERE id = ?) "\n                "WHERE emp_id = (SELECT emp_id FROM talep WHERE id = ?)",\n                (talep_id, talep_id),\n            )\n    except sqlite3.IntegrityError:\n        return False\n    return True\n',
  'tests': 'con = kur()\nassert onayla(con, 1) is True, "bakiye yeterli: onaylanmalı"\nassert con.execute("SELECT gun FROM bakiye WHERE emp_id = 418").fetchone()[0] == 7, "12 - 5 = 7"\nassert onayla(con, 2) is False, "10 gün için bakiye (7) yetmez"\nassert con.execute("SELECT durum FROM talep WHERE id = 2").fetchone()[0] == "beklemede", "bakiye yetmeyince talep durumu da geri alınmalı (tek transaction)"\nassert con.execute("SELECT gun FROM bakiye WHERE emp_id = 418").fetchone()[0] == 7, "bakiye değişmemeli"\nassert onayla(con, 1) is False, "zaten onaylı talep ikinci kez düşülmemeli"\nassert onayla(con, 3) is False and con.execute("SELECT gun FROM bakiye WHERE emp_id = 603").fetchone()[0] == 20, "beklemede olmayan talep işlenmemeli"\nassert "gun - " in __source__.replace("gun -?", "gun - ?"), "bakiyeyi SQL içinde düş (gun = gun - ...): F() ifadesinin karşılığı"\n',
  'hints': ['commit\'i iki güncellemenin arasına koymak, ilkinin geri alınamaması demek. İkisini tek with con: bloğuna al.', 'Okuyup Python\'da çıkarmak yerine UPDATE bakiye SET gun = gun - ? ... yaz; işlem veritabanında atomik olur.', 'Durum kontrolünü UPDATE ... WHERE id = ? AND durum = \'beklemede\' ile yap ve rowcount\'a bak.'],
  'why': 'transaction.atomic ve F() ifadesi iki farklı sorunu çözer: atomic, birden çok yazmayı "ya hep ya hiç" yapar; F(), oku-değiştir-yaz yarışını tek bir SQL ifadesine indirger. Durum koşulunu WHERE\'e koymak da aynı talebin iki kez onaylanmasını (çift tıklama, iki sekme) engelleyen iyimser bir kilittir.'})

ex.append({'id': 'django-ileri-11', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3, 'needs': ['sqlite3'],
  'q': '<p>İmleçli (keyset / cursor) sayfalama yaz; DRF\'in <code>CursorPagination</code>\'ı gibi. <code>imlecli_sayfa(con, boyut, imlec=None)</code> Pusula İK <code>ik_leaves</code> kayıtlarını <b>en yeniden eskiye</b> (<code>start_date DESC, leave_id DESC</code>) sıralayıp <code>(satirlar, sonraki_imlec)</code> döndürsün. <code>satirlar</code> <code>(leave_id, start_date)</code> demetleridir.</p><ul><li>İmleç, sayfanın son satırının <code>[start_date, leave_id]</code> değerlerinin JSON\'unun base64url kodlamasıdır (opak metin).</li><li>İmleç verilmişse <code>OFFSET</code> kullanma; <code>WHERE (start_date, leave_id) &lt; (?, ?)</code> ile devam et.</li><li>Son sayfada <code>sonraki_imlec</code> <code>None</code>. Bozuk imleçte <code>ValueError</code>.</li></ul>',
  'start': 'import base64, json\nimport veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_leaves"])\n\ndef imlecli_sayfa(con, boyut, imlec=None):\n    pass\n',
  'sol': 'import base64, json\nimport veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_leaves"])\n\ndef _kodla(deger):\n    return base64.urlsafe_b64encode(json.dumps(deger).encode()).decode()\n\ndef _coz(imlec):\n    try:\n        tarih, lid = json.loads(base64.urlsafe_b64decode(imlec.encode()))\n        return str(tarih), int(lid)\n    except Exception:\n        raise ValueError("Geçersiz imleç")\n\ndef imlecli_sayfa(con, boyut, imlec=None):\n    sql = "SELECT leave_id, start_date FROM ik_leaves"\n    p = []\n    if imlec is not None:\n        tarih, lid = _coz(imlec)\n        sql += " WHERE (start_date, leave_id) < (?, ?)"\n        p = [tarih, lid]\n    sql += " ORDER BY start_date DESC, leave_id DESC LIMIT ?"\n    satirlar = con.execute(sql, p + [boyut + 1]).fetchall()\n    sonraki = None\n    if len(satirlar) > boyut:\n        satirlar = satirlar[:boyut]\n        sonraki = _kodla([satirlar[-1][1], satirlar[-1][0]])\n    return satirlar, sonraki\n',
  'tests': 'ref = con.execute("SELECT leave_id, start_date FROM ik_leaves ORDER BY start_date DESC, leave_id DESC").fetchall()\ns1, i1 = imlecli_sayfa(con, 7)\nassert s1 == ref[:7], "ilk sayfa en yeni 7 izin olmalı"\nassert isinstance(i1, str), "sonraki imleç metin olmalı"\ns2, i2 = imlecli_sayfa(con, 7, i1)\nassert s2 == ref[7:14], "ikinci sayfa ilk sayfanın devamı olmalı"\ntoplam, imlec, adim = [], None, 0\nwhile True:\n    s, imlec = imlecli_sayfa(con, 2500, imlec)\n    toplam += s\n    adim += 1\n    if imlec is None:\n        break\nassert toplam == ref and adim == 7, "tüm sayfalar birleşince 16577 kayıt eksiksiz ve tekrarsız gelmeli (7 sayfa)"\nkesin, son = imlecli_sayfa(con, 16577)\nassert son is None, "tam bölünen son sayfada imleç None olmalı"\nsayfa_a, ia = imlecli_sayfa(con, 3)\ncon.execute("INSERT INTO ik_leaves VALUES (99999, 1, \'yıllık\', \'2030-01-01\', 1)")\nsayfa_b, _ = imlecli_sayfa(con, 3, ia)\nassert sayfa_b == ref[3:6], "araya yeni kayıt eklense de sonraki sayfa kaymamalı (OFFSET\'in sorunu)"\nassert "OFFSET" not in __source__.upper(), "OFFSET kullanma"\ntry:\n    imlecli_sayfa(con, 3, "bozuk!!")\n    assert False, "bozuk imleç ValueError vermeli"\nexcept ValueError:\n    pass\n',
  'hints': ['Bir fazla satır iste (LIMIT boyut + 1): fazlası geldiyse sonraki sayfa vardır.', 'SQLite satır değeri karşılaştırmasını destekler: WHERE (start_date, leave_id) < (?, ?) azalan sıranın devamını verir.', 'Çözme adımlarını try içine al ve her hatayı ValueError\'a çevir.'],
  'why': 'OFFSET\'li sayfalamada veritabanı atlanan satırları da okur ve araya kayıt eklenince sayfalar kayar (bir satır iki kez görünür ya da hiç görünmez). Keyset sayfalama son görülen anahtardan devam eder: indeksle hızlıdır ve kaymaz. Sıralamaya benzersiz bir sütun (leave_id) eklemek, aynı tarihli kayıtlarda kararlılık için şarttır. Bedeli: rastgele sayfaya atlayamazsın ve toplam sayı vermezsin.'})

ex.append({'id': 'django-ileri-12', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3, 'needs': ['sqlite3'],
  'q': '<p>Django\'nun <code>Q</code> nesnesini taklit et. <code>Q(**kosullar)</code> anahtarları <code>alan</code> ya da <code>alan__islem</code> olan koşulları VE ile bağlar (işlemler: <code>exact</code>, <code>gt</code>, <code>gte</code>, <code>lt</code>, <code>lte</code>, <code>in</code>). <code>|</code> VEYA, <code>&amp;</code> VE, <code>~</code> DEĞİL üretir. <code>derle()</code> <code>(sql, parametreler)</code> döndürsün; her bileşik ifade parantezlensin. <code>izinli</code> alanlar dışında bir alan kullanılırsa <code>derle()</code> <code>ValueError</code> versin. Örnek:</p><pre class="code">q = (Q(city="Ankara", rating__gte=4.2) | Q(vehicle="bisiklet")) &amp; ~Q(courier_id__in=[4, 24])\nq.derle()  # ("(((city = ? AND rating &gt;= ?) OR (vehicle = ?)) AND (NOT (courier_id IN (?, ?))))",\n          #  ["Ankara", 4.2, "bisiklet", 4, 24])</pre><p>Alan izin listesi: <code>{"courier_id", "city", "vehicle", "rating"}</code>. Testler sonucu Lezzet Kurye <code>lk_couriers</code> üzerinde çalıştırır.</p>',
  'start': 'IZINLI = {"courier_id", "city", "vehicle", "rating"}\n\nclass Q:\n    def __init__(self, **kosullar):\n        pass\n\n    def derle(self):\n        pass\n',
  'sol': 'IZINLI = {"courier_id", "city", "vehicle", "rating"}\nOP = {"exact": "=", "gt": ">", "gte": ">=", "lt": "<", "lte": "<="}\n\nclass Q:\n    def __init__(self, **kosullar):\n        self.tur = "yaprak"\n        self.kosullar = list(kosullar.items())\n        self.cocuklar = []\n\n    @classmethod\n    def _bilesik(cls, tur, cocuklar):\n        q = cls()\n        q.tur, q.cocuklar = tur, cocuklar\n        return q\n\n    def __and__(self, diger):\n        return Q._bilesik("AND", [self, diger])\n\n    def __or__(self, diger):\n        return Q._bilesik("OR", [self, diger])\n\n    def __invert__(self):\n        return Q._bilesik("NOT", [self])\n\n    def derle(self):\n        if self.tur == "NOT":\n            sql, p = self.cocuklar[0].derle()\n            return f"(NOT {sql})", p\n        if self.tur in ("AND", "OR"):\n            parcalar, p = [], []\n            for c in self.cocuklar:\n                s, cp = c.derle()\n                parcalar.append(s)\n                p += cp\n            return "(" + f" {self.tur} ".join(parcalar) + ")", p\n        parcalar, p = [], []\n        for anahtar, deger in self.kosullar:\n            alan, _, islem = anahtar.partition("__")\n            islem = islem or "exact"\n            if alan not in IZINLI or (islem not in OP and islem != "in"):\n                raise ValueError(f"İzinsiz alan ya da işlem: {anahtar}")\n            if islem == "in":\n                deger = list(deger)\n                parcalar.append(f"{alan} IN ({\', \'.join(\'?\' * len(deger))})")\n                p += deger\n            else:\n                parcalar.append(f"{alan} {OP[islem]} ?")\n                p.append(deger)\n        return "(" + " AND ".join(parcalar) + ")", p\n',
  'tests': 'import veri\n_c = veri.baglan("lezzet_kurye", tablolar=["lk_couriers"])\ndef calistir(q):\n    sql, p = q.derle()\n    return [r[0] for r in _c.execute(f"SELECT courier_id FROM lk_couriers WHERE {sql} ORDER BY courier_id", p)]\nq = (Q(city="Ankara", rating__gte=4.2) | Q(vehicle="bisiklet")) & ~Q(courier_id__in=[4, 24])\nassert q.derle() == ("(((city = ? AND rating >= ?) OR (vehicle = ?)) AND (NOT (courier_id IN (?, ?))))", ["Ankara", 4.2, "bisiklet", 4, 24]), f"derleme çıktısı farklı: {q.derle()}"\nbeklenen = [r[0] for r in _c.execute("SELECT courier_id FROM lk_couriers WHERE ((city = \'Ankara\' AND rating >= 4.2) OR vehicle = \'bisiklet\') AND courier_id NOT IN (4, 24) ORDER BY courier_id")]\nassert calistir(q) == beklenen, "üretilen SQL doğru kuryeleri döndürmeli"\nassert len(calistir(Q(city="İzmir"))) == 9, "tek koşul (exact)"\nassert len(calistir(Q(vehicle="motosiklet") & Q(rating__gte=4.3))) == 15, "& ile VE"\nassert len(calistir(~Q(vehicle="motosiklet"))) == 6, "~ ile DEĞİL"\nassert calistir(Q(rating__gt=4.4) | Q(rating__lt=3.8)) == [r[0] for r in _c.execute("SELECT courier_id FROM lk_couriers WHERE rating > 4.4 OR rating < 3.8 ORDER BY 1")], "| ile VEYA"\nfor kotu in (Q(full_name="x"), Q(city__like="%a%"), Q(city="x") | Q(**{"rating) OR 1=1 --": 1})):\n    try:\n        kotu.derle()\n        assert False, "izinsiz alan ya da işlem ValueError vermeli"\n    except ValueError:\n        pass\n',
  'hints': ['Q\'yu bir ağaç olarak düşün: yaprak (koşullar) ya da bileşik düğüm (AND / OR / NOT + çocuklar).', '__or__, __and__ ve __invert__ yeni bir bileşik Q döndürsün; derle() özyinelemeli olsun.', 'Yaprakta her koşulu "alan OP ?" yap, değerleri sırayla parametre listesine ekle; in için len(deger) kadar ? üret.'],
  'why': 'Django\'nun Q nesnesi tam da böyle bir ağaçtır (django.utils.tree.Node) ve derleyici onu özyinelemeyle WHERE ifadesine çevirir. Operatör aşırı yükleme (__or__, __and__, __invert__) okunabilir bir sorgu dili kurar; parantezleme de AND/OR önceliği hatalarını önler. Alan izin listesi, dinamik sorgularda SQL enjeksiyonuna karşı tek savunmadır.'})

ex.append({'id': 'django-ileri-13', 't': 'code', 'stage': 'Mini proje', 'diff': 3, 'needs': ['sqlite3'],
  'q': '<p><b>Pusula İK izin onay API\'si.</b> <code>IzinAPI(con)</code> sınıfını yaz. <code>con</code> Pusula İK bağlantısıdır; kurucu <code>izin_talep(id INTEGER PRIMARY KEY, emp_id, leave_type, start_date, days, durum)</code> tablosunu oluştursun. Yanıtlar <code>(durum_kodu, gövde)</code>.</p><ul><li><code>olustur(kullanici, veri)</code>: <code>veri</code> doğrulaması: <code>leave_type</code> <code>{"yıllık", "hastalık", "mazeret", "ücretsiz"}</code> içinde, <code>start_date</code> geçerli ISO tarih, <code>days</code> 1–30 tam sayı. Hatada <code>(400, {alan: [mesaj]})</code>. Başarıda talebi <code>"beklemede"</code> ekle, <code>(201, {"id": ..., "durum": "beklemede"})</code>.</li><li><code>listele(kullanici, sayfa=1, boyut=10)</code>: kullanıcının kendi talepleri + doğrudan bağlı çalışanlarının talepleri, <code>id</code> sırasıyla; <code>(200, {"count": ..., "results": [{"id", "emp_id", "leave_type", "days", "durum"}...]})</code>.</li><li><code>onayla(kullanici, talep_id)</code>: talep görünmüyorsa (yukarıdaki kapsamda değilse) <code>(404, "yok")</code>; kullanıcı sahibinin yöneticisi değilse <code>(403, "yetki")</code>; durum <code>"beklemede"</code> değilse <code>(409, "zaten")</code>. Başarıda tek transaction içinde durumu <code>"onaylandi"</code> yap ve <code>ik_leaves</code>\'a <code>leave_id = MAX(leave_id) + 1</code> ile kalıcı kayıt ekle; <code>(200, {"leave_id": ...})</code>.</li></ul><p><code>kullanici</code> bir <code>emp_id</code>\'dir. Yöneticilik bilgisi <code>ik_employees.manager_id</code>\'den gelir.</p>',
  'start': 'import datetime as dt\nimport veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])\n\nclass IzinAPI:\n    def __init__(self, con):\n        self.con = con\n        # TODO: izin_talep tablosunu oluştur\n\n    def olustur(self, kullanici, veri):\n        pass\n\n    def listele(self, kullanici, sayfa=1, boyut=10):\n        pass\n\n    def onayla(self, kullanici, talep_id):\n        pass\n',
  'sol': 'import datetime as dt\nimport veri\n\ncon = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])\n\nTURLER = {"yıllık", "hastalık", "mazeret", "ücretsiz"}\nKAPSAM = "(t.emp_id = ? OR t.emp_id IN (SELECT emp_id FROM ik_employees WHERE manager_id = ?))"\n\nclass IzinAPI:\n    def __init__(self, con):\n        self.con = con\n        con.execute("CREATE TABLE IF NOT EXISTS izin_talep (id INTEGER PRIMARY KEY, emp_id INTEGER, leave_type TEXT, start_date TEXT, days INTEGER, durum TEXT)")\n\n    @staticmethod\n    def _dogrula(veri):\n        hatalar = {}\n        if veri.get("leave_type") not in TURLER:\n            hatalar["leave_type"] = ["Geçersiz izin türü."]\n        try:\n            dt.date.fromisoformat(str(veri.get("start_date")))\n        except ValueError:\n            hatalar["start_date"] = ["Tarih YYYY-AA-GG olmalı."]\n        gun = veri.get("days")\n        if not isinstance(gun, int) or isinstance(gun, bool) or not 1 <= gun <= 30:\n            hatalar["days"] = ["1 ile 30 arasında tam sayı olmalı."]\n        return hatalar\n\n    def olustur(self, kullanici, veri):\n        hatalar = self._dogrula(veri)\n        if hatalar:\n            return (400, hatalar)\n        with self.con:\n            cur = self.con.execute(\n                "INSERT INTO izin_talep (emp_id, leave_type, start_date, days, durum) VALUES (?, ?, ?, ?, \'beklemede\')",\n                (kullanici, veri["leave_type"], veri["start_date"], veri["days"]),\n            )\n        return (201, {"id": cur.lastrowid, "durum": "beklemede"})\n\n    def listele(self, kullanici, sayfa=1, boyut=10):\n        p = (kullanici, kullanici)\n        toplam = self.con.execute(f"SELECT COUNT(*) FROM izin_talep t WHERE {KAPSAM}", p).fetchone()[0]\n        satirlar = self.con.execute(\n            f"SELECT id, emp_id, leave_type, days, durum FROM izin_talep t WHERE {KAPSAM} ORDER BY id LIMIT ? OFFSET ?",\n            p + (boyut, (sayfa - 1) * boyut),\n        ).fetchall()\n        alanlar = ("id", "emp_id", "leave_type", "days", "durum")\n        return (200, {"count": toplam, "results": [dict(zip(alanlar, s)) for s in satirlar]})\n\n    def onayla(self, kullanici, talep_id):\n        t = self.con.execute(\n            f"""SELECT t.emp_id, t.leave_type, t.start_date, t.days, t.durum, e.manager_id\n                FROM izin_talep t JOIN ik_employees e ON e.emp_id = t.emp_id\n                WHERE t.id = ? AND {KAPSAM}""",\n            (talep_id, kullanici, kullanici),\n        ).fetchone()\n        if t is None:\n            return (404, "yok")\n        emp, tur, tarih, gun, durum, yonetici = t\n        if yonetici != kullanici:\n            return (403, "yetki")\n        if durum != "beklemede":\n            return (409, "zaten")\n        with self.con:\n            self.con.execute("UPDATE izin_talep SET durum = \'onaylandi\' WHERE id = ?", (talep_id,))\n            yeni = self.con.execute("SELECT MAX(leave_id) + 1 FROM ik_leaves").fetchone()[0]\n            self.con.execute("INSERT INTO ik_leaves VALUES (?, ?, ?, ?, ?)", (yeni, emp, tur, tarih, gun))\n        return (200, {"leave_id": yeni})\n',
  'tests': '_c = veri.baglan("pusula_ik", tablolar=["ik_employees", "ik_leaves"])\napi = IzinAPI(_c)\nkod, g = api.olustur(418, {"leave_type": "yıllık", "start_date": "2025-07-01", "days": 5})\nassert (kod, g) == (201, {"id": 1, "durum": "beklemede"}), f"geçerli talep 201 dönmeli: {kod} {g}"\nkod, g = api.olustur(418, {"leave_type": "tatil", "start_date": "2025-02-30", "days": 0})\nassert kod == 400 and set(g) == {"leave_type", "start_date", "days"}, f"üç alan hatası bekleniyordu: {g}"\nassert api.olustur(418, {"leave_type": "yıllık", "start_date": "2025-07-01", "days": "5"})[0] == 400, "days metin olamaz"\napi.olustur(603, {"leave_type": "hastalık", "start_date": "2025-03-03", "days": 2})\napi.olustur(42, {"leave_type": "mazeret", "start_date": "2025-04-01", "days": 1})\nkod, g = api.listele(42)\nassert kod == 200 and g["count"] == 2 and [r["id"] for r in g["results"]] == [1, 3], "Barış (42) kendi talebini ve ekibindeki Cem\'in talebini görmeli"\nassert api.listele(418)[1]["count"] == 1, "Cem yalnız kendi talebini görür"\nassert api.listele(42, sayfa=2, boyut=1)[1]["results"][0]["id"] == 3, "sayfalama çalışmalı"\nassert api.onayla(418, 2) == (404, "yok"), "Cem, 603\'ün talebini göremez: 404"\nassert api.onayla(418, 1) == (403, "yetki"), "kişi kendi talebini onaylayamaz: 403"\nassert api.onayla(42, 3) == (403, "yetki"), "Barış kendi talebini onaylayamaz"\nonceki = _c.execute("SELECT MAX(leave_id) FROM ik_leaves").fetchone()[0]\nkod, g = api.onayla(42, 1)\nassert (kod, g) == (200, {"leave_id": onceki + 1}), f"yönetici onaylamalı ve yeni leave_id dönmeli: {kod} {g}"\nassert _c.execute("SELECT emp_id, leave_type, start_date, days FROM ik_leaves WHERE leave_id = ?", (onceki + 1,)).fetchone() == (418, "yıllık", "2025-07-01", 5), "onaylanan izin ik_leaves\'e yazılmalı"\nassert api.onayla(42, 1) == (409, "zaten"), "ikinci onay 409"\nassert api.onayla(33, 2)[0] == 200, "603\'ün yöneticisi (33) onaylayabilir"\nassert api.onayla(42, 999) == (404, "yok"), "olmayan talep 404"\n',
  'hints': ['Kapsam koşulunu (kendi + doğrudan ekip) bir SQL parçası olarak bir kez yaz; listele ve onayla aynı parçayı kullansın.', 'onayla\'da sıra: görünür mü (404) → yönetici mi (403) → durum (409) → transaction içinde UPDATE + INSERT.', 'days için isinstance(gun, int) kontrol et; DRF IntegerField "5"i kabul eder ama burada JSON tipi isteniyor.'],
  'why': 'Bu küçük sınıf bir DRF ViewSet\'inin iskeletidir: serializer doğrulaması (400), get_queryset ile kapsam (404), izin sınıfı (403), iş kuralı (409) ve transaction.atomic ile tutarlı yazma. Kapsamı tek bir yerde tutmak, liste ile detay uç noktalarının farklı kurallar uygulamasını (sık görülen IDOR kaynağı) engeller.'})

lesson = {
  'id': 'django-ileri',
  'lv': 'ileri',
  'mod': 'Web ve API',
  'min': 85,
  'title': 'İleri Django ve DRF: ORM optimizasyonu, izinler ve test',
  'sum': 'Özel QuerySet ve manager yazar, N+1 sorununu ölçüp select_related/prefetch_related ile çözer, annotate/F/Q ve transaction.atomic\'i SQL karşılıklarıyla kavrar; DRF serializer, izin, sayfalama ve filtreleme mantığını Pusula İK izin onay API\'si üzerinde kurarsın.',
  'goals': [
    'Özel QuerySet/manager ile iş kurallarını modele taşır, model ilişkilerini doğru on_delete seçimiyle kurabilirim.',
    'Sorgu sayısını ölçer, N+1 sorununu select_related ve prefetch_related ile çözer ve bunu testle kilitleyebilirim.',
    'annotate, aggregate, F ve Q ifadelerinin ürettiği SQL\'i yazar, transaction.atomic ve on_commit ile tutarlı yazma yapabilirim.',
    'DRF serializer doğrulaması, izin sınıfları, sayfalama (sayfa numaralı ve imleçli) ve filtrelemeyi tasarlayabilirim.',
    'Ayarları ortama göre ayırır, yönetim komutu ve pytest-django + factory testleri yazar, Celery\'yi doğru noktada bağlayabilirim.'
  ],
  'needs': ['sqlite3'],
  'body': body,
  'ex': ex,
  'faq': [
    {'q': 'select_related her zaman daha mı iyi? Tek sorgu çünkü.', 'a': 'Hayır. İleri FK için evet; ama ters ilişkide JOIN satırları çoğaltır (bir yönetici × 80 çalışan = 80 satır, yönetici sütunları 80 kez taşınır). Birden çok ilişkili nesnede prefetch_related\'ın iki sorgusu genelde daha hızlıdır. Ölç ve karar ver.'},
    {'q': 'Sinyalleri hiç kullanmamalı mıyım?', 'a': 'Kendi kodunda açık servis fonksiyonu tercih et; okuyan kişi neyin tetiklendiğini görür. Sinyal, değiştiremediğin bir uygulamanın (ör. django.contrib.auth) olayına tepki vermek ya da gerçekten gevşek bağlı bir eklenti için uygundur. bulk_create, update() ve raw SQL sinyal tetiklemez; bu da sürprizlere yol açar.'},
    {'q': 'DRF mi, Django Ninja mı, FastAPI mi?', 'a': 'Mevcut bir Django projesine API ekliyorsan DRF olgun ekosistemi (izinler, throttling, browsable API) ile güvenli seçimdir. Tip ipucu odaklı, FastAPI benzeri bir deneyim istersen Django Ninja Django içinde çalışır. Django\'ya ihtiyacın yoksa (admin, ORM) FastAPI daha hafiftir.'},
    {'q': 'Testlerde fixture mı, factory mi?', 'a': 'JSON fixture\'lar şema değiştikçe bozulur ve testin neye ihtiyaç duyduğunu gizler. factory_boy her testin yalnız gereken veriyi açıkça üretmesini sağlar: IzinFactory(calisan__yonetici=yonetici). Büyük referans verisi (il listesi gibi) için migration ile yüklenen veri daha uygundur.'}
  ],
  'mistakes': [
    {'why': 'Serializer\'da ilişkili alana erişmek ama queryset\'te getirmemek, her satır için ek sorgu demektir.', 'bad': 'class IzinViewSet(viewsets.ModelViewSet):\n    queryset = Izin.objects.all()   # serializer calisan.ad okuyor', 'good': 'class IzinViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        return Izin.objects.gorunur(self.request.user).select_related("calisan")'},
    {'why': 'Liste uç noktasında get_queryset kullanıcıya göre süzülmezse herkes herkesin kaydını görür; has_object_permission listede çalışmaz.', 'bad': 'queryset = Izin.objects.all()\npermission_classes = [YoneticiMi]', 'good': 'def get_queryset(self):\n    return Izin.objects.gorunur(self.request.user)'},
    {'why': 'Celery görevini transaction içinde kuyruğa atmak, işçinin henüz commit edilmemiş kaydı aramasına yol açar.', 'bad': 'with transaction.atomic():\n    izin.save()\n    bildir.delay(izin.pk)', 'good': 'with transaction.atomic():\n    izin.save()\n    transaction.on_commit(lambda: bildir.delay(izin.pk))'},
    {'why': 'Python\'da oku-değiştir-yaz, eşzamanlı isteklerde güncelleme kaybettirir.', 'bad': 'c = Calisan.objects.get(pk=418)\nc.izin_bakiyesi -= 5\nc.save()', 'good': 'Calisan.objects.filter(pk=418).update(izin_bakiyesi=F("izin_bakiyesi") - 5)'},
    {'why': 'count() sonra liste ayrı sorgudur; yalnız varlık soruyorsan exists() yeterli ve hızlıdır.', 'bad': 'if Izin.objects.filter(durum="beklemede").count() > 0:', 'good': 'if Izin.objects.filter(durum="beklemede").exists():'}
  ]
}

emit(lesson, '/home/claude/py/v2/n4/django-ileri.js')
