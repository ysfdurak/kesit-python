from build import py, pc

BODY = '''<h2>Neden önemli?</h2>
<p>Anadolu Market her pazartesi 12 mağaza müdürüne haftalık satış raporu, her ay 40.000 müşteriye kişiselleştirilmiş kampanya e-postası gönderir. Bunları <code>print</code> ve metin birleştirmeyle üretmeye çalışırsan kod ile görünüm birbirine dolanır: tasarımcı bir tabloya sütun eklemek istediğinde Python kodunu değiştirmen gerekir, müşteri adında bir <code>&lt;</code> karakteri sayfayı bozar. Çözüm <b>şablon</b> (template) kullanmaktır: görünüm bir şablonda, veri Python\'da durur; şablon motoru ikisini birleştirir (render).</p>
<p><i>Metin biçimlendirme ve rapor üretme</i> dersinde f-string ve <code>format</code> ile küçük raporlar yazdın. Bu derste üç basamak çıkıyoruz: standart kütüphanedeki <code>string.Template</code>, endüstri standardı <b>Jinja2</b> (Flask, Ansible, dbt, Airflow ve sayısız raporlama aracı onu kullanır) ve bunlarla HTML e-posta, HTML ve Markdown rapor üreten bir boru hattı (pipeline). Jinja2 tarayıcı motorunda hazır; kendi bilgisayarında <code>pip install jinja2</code>.</p>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Mantık (döngü, koşul)</th><th>Güvenli mi?</th><th>Ne zaman?</th></tr>
<tr><td>f-string</td><td>Python içinde</td><td>Şablon koda gömülü, dışarıdan gelemez</td><td>Kısa, tek satırlık mesajlar ve loglar</td></tr>
<tr><td><code>str.format</code></td><td>Yok</td><td>Kullanıcı şablonunda tehlikeli</td><td>Eski kod; şablon sabitse</td></tr>
<tr><td><code>string.Template</code></td><td>Yok</td><td>Evet, yalnızca ad değiştirir</td><td>Kullanıcının düzenlediği basit metinler (SMS, bildirim)</td></tr>
<tr><td>Jinja2</td><td>Var: for, if, makro, kalıtım</td><td>autoescape ile evet</td><td>HTML rapor, e-posta, yapılandırma dosyası, belge</td></tr>
</table></div>

<h2>string.Template: güvenli ve basit</h2>
<p><code>string.Template</code> yer tutucuları <code>$ad</code> biçiminde yazar (bitişik metin gerekiyorsa süslü parantezli biçim de vardır: <code>$&#123;ad&#125;TL</code>). Yalnızca ad değiştirir; ifade, nitelik erişimi ya da çağrı yapmaz. Bu yüzden şablonu pazarlama ekibinin bir yönetim panelinden düzenlemesine izin verebilirsin.</p>
''' + py('''
from string import Template

sms = Template("Sayın $ad, $tutar TL tutarlı siparişiniz $sehir şubesine ulaştı. Kod: $kod")
print(sms.substitute(ad="Ayşe", tutar="1.249,90", sehir="İzmir", kod="AM-1042"))

eksik = {"ad": "Mehmet", "tutar": "89,90"}
print(sms.safe_substitute(eksik))       # eksikler olduğu gibi kalır
try:
    sms.substitute(eksik)
except KeyError as e:
    print("Eksik alan:", e)
print(Template("İndirim: %$oran").substitute(oran=15), Template("Fiyat: $$100").substitute())
''') + '''
<p><code>substitute</code> eksik anahtarda <code>KeyError</code> verir (üretimde tercih edilir: eksik veriyle mesaj gitmesin); <code>safe_substitute</code> eksik yer tutucuyu olduğu gibi bırakır (taslak önizleme için). Gerçek bir <code>$</code> işareti için <code>$$</code> yazılır.</p>

<h2>f-string ve format\'ın sınırı: şablon kimden geliyor?</h2>
<p>f-string harikadır ama şablon <b>kodun içinde</b> yazılmak zorundadır; dosyadan ya da veritabanından okunan bir metni f-string\'e çeviremezsin. Akla gelen ilk çözüm <code>str.format</code>\'tır; ama şablonu kullanıcı yazıyorsa bu bir güvenlik açığıdır, çünkü format alanı nitelik ve indeks erişimine izin verir:</p>
''' + py('''
class Musteri:
    def __init__(self, ad):
        self.ad = ad
        self._kart_no = "4543 1234 5678 9012"     # gizli olmalı

m = Musteri("Ayşe")
print("Merhaba {m.ad}".format(m=m))                 # beklenen kullanım
print("Merhaba {m._kart_no}".format(m=m))           # kötü niyetli şablon
print("{m.__class__.__init__.__globals__[Musteri]}".format(m=m))   # içeriye sızma
''') + '''
<div class="warn"><b>Kural</b>Kullanıcının yazdığı metni asla <code>str.format</code>, <code>eval</code> ya da f-string\'e dönüştürüp çalıştırma. Basit metin için <code>string.Template</code>, mantık gerekiyorsa Jinja2\'nin <code>SandboxedEnvironment</code>\'ını kullan.</div>

<h2>Jinja2 temelleri: değişken, filtre, for, if</h2>
<p>Jinja üç tür işaretleme kullanır: <code>{{ ... }}</code> ifade yazdırır, <code>{% ... %}</code> komut çalıştırır (for, if, set, macro), <code>{# ... #}</code> yorumdur. Sözlük anahtarına ve nesne niteliğine aynı noktalı yazımla erişirsin: <code>{{ s.tutar }}</code>.</p>
''' + py('''
from jinja2 import Environment

env = Environment(trim_blocks=True, lstrip_blocks=True)
sablon = env.from_string("""Haftalık özet - {{ magaza|upper }}
{% for s in siparisler %}
{{ loop.index }}. {{ s.no }} {{ s.musteri|default("Misafir") }} {{ "%.2f"|format(s.tutar) }} TL{% if s.tutar > 1000 %} *{% endif %}

{% else %}
Bu hafta sipariş yok.
{% endfor %}
Toplam: {{ siparisler|sum(attribute="tutar")|round(2) }} TL ({{ siparisler|length }} sipariş)
""")
veri = [{"no": "AM-1", "musteri": "Ayşe", "tutar": 1249.9},
        {"no": "AM-2", "musteri": None, "tutar": 89.5},
        {"no": "AM-3", "tutar": 450}]
print(sablon.render(magaza="Kadıköy", siparisler=veri))
print(sablon.render(magaza="Bornova", siparisler=[]))
''') + '''
<p>Burada birçok şey bir arada: <code>loop.index</code> 1\'den sayar (<code>loop.index0</code>, <code>loop.first</code>, <code>loop.last</code>, <code>loop.length</code> da var), <code>{% else %}</code> liste boşsa çalışır, <code>trim_blocks</code> ve <code>lstrip_blocks</code> komut satırlarının bıraktığı boş satırları ve girintileri temizler. <code>default</code> filtresi tanımsız değeri yakalar; <code>None</code> için <code>default("Misafir", true)</code> yazman gerekir (çıktıdaki "None"a dikkat).</p>
<div class="tbl-wrap"><table>
<tr><th>Filtre</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>upper, lower, title, capitalize</code></td><td><code>{{ "çay"|upper }}</code></td><td>ÇAY</td></tr>
<tr><td><code>default(x, true)</code></td><td><code>{{ none_deger|default("-", true) }}</code></td><td>-</td></tr>
<tr><td><code>round(n), int, float</code></td><td><code>{{ 3.14159|round(2) }}</code></td><td>3.14</td></tr>
<tr><td><code>format</code></td><td><code>{{ "%.2f"|format(5) }}</code></td><td>5.00</td></tr>
<tr><td><code>length, sum, min, max</code></td><td><code>{{ liste|sum(attribute="tutar") }}</code></td><td>Toplam</td></tr>
<tr><td><code>join, sort, unique, groupby</code></td><td><code>{{ adlar|sort|join(", ") }}</code></td><td>Sıralı liste</td></tr>
<tr><td><code>e (escape), safe, striptags</code></td><td><code>{{ yorum|e }}</code></td><td>HTML kaçışlı</td></tr>
</table></div>

<h2>Kendi filtren: Türk lirası biçimi</h2>
<p>Hazır filtreler İngilizce biçim kullanır (1,249.90). Türkiye\'de beklenen <b>1.249,90 TL</b>\'dir. Bir Python fonksiyonunu <code>env.filters</code> sözlüğüne eklersen şablonda filtre olarak kullanırsın. Filtre, şablon derlenmeden <b>önce</b> kaydedilmelidir.</p>
''' + py('''
from jinja2 import Environment

def tl(deger, ondalik=2):
    metin = f"{deger:,.{ondalik}f}"                   # 1,249.90
    return metin.translate(str.maketrans(",.", ".,")) + " TL"   # 1.249,90 TL

env = Environment()
env.filters["tl"] = tl
print(env.from_string("Ciro: {{ ciro|tl }} | Ortalama: {{ ort|tl(0) }}").render(ciro=182450.5, ort=1249.9))
''') + '''

<h2>Makro ve kalıtım: tekrarı kaldırmak</h2>
<p><b>Makro</b> (macro) şablon içindeki fonksiyondur: aynı rozeti, butonu ya da tablo satırını tekrar tekrar yazmazsın. <b>Kalıtım</b> (template inheritance) ise tüm raporların ortak iskeletini (logo, CSS, alt bilgi) bir <i>taban şablonda</i> tutar; alt şablonlar yalnızca <code>{% block %}</code> bölümlerini doldurur. Gerçek projede şablonlar <code>templates/</code> klasöründe dosya olarak durur ve <code>FileSystemLoader("templates")</code> ile yüklenir; burada aynı şeyi <code>DictLoader</code> ile bellekte yapıyoruz.</p>
''' + py('''
from jinja2 import Environment, DictLoader

sablonlar = {
    "taban.html": """<html><body>
<h1>Anadolu Market | {% block baslik %}Rapor{% endblock %}</h1>
{% block icerik %}{% endblock %}
<footer>Otomatik üretildi</footer>
</body></html>""",
    "makrolar.html": """{% macro rozet(durum) -%}
<span class="rozet {{ durum }}">{{ {"teslim": "Teslim", "kargoda": "Yolda"}.get(durum, "Bekliyor") }}</span>
{%- endmacro %}""",
    "kargo.html": """{% extends "taban.html" %}
{% from "makrolar.html" import rozet %}
{% block baslik %}Kargo durumu{% endblock %}
{% block icerik %}<ul>
{% for g in gonderiler %}<li>{{ g.no }} {{ rozet(g.durum) }}</li>
{% endfor %}</ul>{% endblock %}""",
}
env = Environment(loader=DictLoader(sablonlar), autoescape=True)
print(env.get_template("kargo.html").render(gonderiler=[{"no": "AM-1", "durum": "teslim"}, {"no": "AM-2", "durum": "hazir"}]))
''') + '''
<div class="tip"><b>Kalıtım kuralları</b><code>{% extends %}</code> alt şablonun ilk komutu olmalıdır; alt şablonda block dışında yazılan metin görünmez. Taban bloğun içeriğini silmeden üstüne eklemek için <code>{{ super() }}</code> kullanılır.</div>

<h2>autoescape ve XSS</h2>
<p>HTML üretirken en büyük tehlike <b>XSS</b> (cross-site scripting): kullanıcıdan gelen bir metnin (ürün yorumu, müşteri adı) içindeki <code>&lt;script&gt;</code> etiketi, raporu açan yöneticinin tarayıcısında çalışır. Jinja\'da <code>autoescape=True</code> değişkenlerden gelen <code>&lt; &gt; &amp; " \'</code> karakterlerini HTML varlıklarına çevirir; şablonun kendi etiketlerine dokunmaz.</p>
''' + py('''
from jinja2 import Environment, select_autoescape

yorum = '<script>alert("hack")</script> Çok güzel & hızlı'
tehlikeli = Environment().from_string("<p>{{ y }}</p>").render(y=yorum)
guvenli = Environment(autoescape=True).from_string("<p>{{ y }}</p>").render(y=yorum)
print(tehlikeli)
print(guvenli)
env = Environment(autoescape=select_autoescape(["html", "xml"]))   # dosya uzantısına göre
print(env.from_string("{{ x|safe }}").render(x="<b>güvendiğin HTML</b>"))
''') + '''
<p><code>Environment()</code>\'ın varsayılanı <b>autoescape kapalıdır</b> (Jinja HTML dışında YAML, SQL, Markdown da ürettiği için). HTML üreten her ortamda açıkça aç. <code>|safe</code> filtresi kaçışı kapatır: yalnızca senin ürettiğin, kullanıcı girdisi içermeyen HTML için kullan.</p>

<h2>Boru hattı: CSV → özet → HTML rapor</h2>
<p>Şimdi parçaları birleştirelim: ham CSV satırlarını oku, şehre göre özetle, Jinja ile satır içi CSS\'li (e-posta istemcileri harici CSS\'i çoğunlukla yok sayar) bir HTML tablo üret. Bu kalıp her haftalık raporun iskeletidir; bitirme projesinde bunu tam bir otomasyona dönüştüreceksin.</p>
''' + py('''
import csv, io
from collections import defaultdict
from jinja2 import Environment

CSV = """sehir,urun,tutar
İzmir,Çay,450
Ankara,Kahve,1249.9
İzmir,Kahve,890
İstanbul,Çay,2100
Ankara,Su,75.5
"""

ozet = defaultdict(lambda: {"adet": 0, "ciro": 0.0})
for satir in csv.DictReader(io.StringIO(CSV)):
    ozet[satir["sehir"]]["adet"] += 1
    ozet[satir["sehir"]]["ciro"] += float(satir["tutar"])
satirlar = sorted(({"sehir": s, **d} for s, d in ozet.items()), key=lambda r: -r["ciro"])

env = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)
env.filters["tl"] = lambda x: f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"
rapor = env.from_string("""<h2 style="color:#1a5">Şehir bazında satış</h2>
<table style="border-collapse:collapse">
{% for r in satirlar %}
  <tr><td>{{ r.sehir }}</td><td>{{ r.adet }}</td><td style="text-align:right">{{ r.ciro|tl }}</td></tr>
{% endfor %}
  <tr><th>Toplam</th><th>{{ satirlar|sum(attribute="adet") }}</th><th>{{ satirlar|sum(attribute="ciro")|tl }}</th></tr>
</table>""").render(satirlar=satirlar)
print(rapor)
''') + '''
<p>Aynı veriden <b>Markdown</b> rapor (GitHub, Teams, Notion, Confluence okur) üretmek de bir şablon değişikliğidir. Markdown HTML olmadığı için burada autoescape kapalı kalır:</p>
''' + py('''
from jinja2 import Environment

env = Environment(trim_blocks=True, lstrip_blocks=True)
md = env.from_string("""# {{ baslik }}

| Şehir | Sipariş | Ciro |
|---|---:|---:|
{% for r in satirlar %}
| {{ r.sehir }} | {{ r.adet }} | {{ "%.2f"|format(r.ciro) }} |
{% endfor %}

**En iyi şehir:** {{ (satirlar|first).sehir }}
""")
print(md.render(baslik="43. hafta", satirlar=[{"sehir": "İstanbul", "adet": 1, "ciro": 2100.0},
                                             {"sehir": "İzmir", "adet": 2, "ciro": 1340.0}]))
''') + '''
<p>HTML raporu e-postaya koymak <i>Ofis ve iş akışı otomasyonu</i> dersindeki <code>EmailMessage</code> ile tek satırdır: <code>msg.set_content(duz_metin)</code> ardından <code>msg.add_alternative(html, subtype="html")</code>. Hem düz metin hem HTML sürümü göndermek spam filtrelerinde puanını iyileştirir ve HTML göstermeyen istemcilerde de okunur kalır.</p>

<div class="note"><b>Gerçek işte</b>Bir e-ticaret firmasında kampanya e-postaları pazarlama ekibinin düzenlediği Jinja şablonlarıyla üretilir. Ekip bir gün şablona <code>{{ musteri.ad }}</code> yerine <code>{{ musteri.isim }}</code> yazdı; varsayılan <code>Undefined</code> sessizce boş metin bastığı için 40.000 kişiye "Merhaba ," diye başlayan e-posta gitti. Çözüm: <code>Environment(undefined=StrictUndefined)</code> ile tanımsız değişkende hata almak ve gönderimden önce şablonu örnek veriyle render eden bir test eklemek.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>StrictUndefined ve şablon testleri</h3>
<p>Varsayılan davranışta tanımsız değişken boş metin olur. Üretim ortamında <code>StrictUndefined</code> kullan: hata erken ve yüksek sesle gelsin. Şablonları birim testiyle denetle: örnek veriyle render et, beklenen parçaların çıktıda olduğunu (ya da tüm çıktının kayıtlı bir "anlık görüntüyle" aynı olduğunu, snapshot testing) doğrula.</p>
<h3>Dosya düzeni ve önbellek</h3>
''' + pc('''
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

KLASOR = Path(__file__).parent / "templates"      # templates/taban.html, templates/haftalik.html
env = Environment(
    loader=FileSystemLoader(KLASOR),
    autoescape=select_autoescape(["html", "xml"]),
    undefined=StrictUndefined,
    trim_blocks=True, lstrip_blocks=True,
)
html = env.get_template("haftalik.html").render(ozet=ozet)
Path("cikti/haftalik.html").write_text(html, encoding="utf-8")
''') + '''
<p>Environment\'ı bir kez oluştur ve yeniden kullan: derlenen şablonlar önbelleğe alınır. Her render\'da yeni Environment kurmak gereksiz yere yavaştır.</p>
<h3>Kullanıcı şablonları ve sandbox</h3>
<p>Müşterilerin kendi şablonunu yazdığı bir üründe <code>jinja2.sandbox.SandboxedEnvironment</code> kullanılır: alt çizgili niteliklere ve tehlikeli metotlara erişimi engeller. Yine de zaman aşımı ve çıktı boyutu sınırı gibi ek önlemler gerekir.</p>
<h3>PDF ve Word</h3>
<p>HTML raporu PDF\'e çevirmek için <code>weasyprint</code> (<code>HTML(string=html).write_pdf("rapor.pdf")</code>), Word şablonunu Jinja sözdizimiyle doldurmak için <code>docxtpl</code> kullanılır. İkisi de kendi bilgisayarında çalışır (<code>pip install weasyprint docxtpl</code>); mantık bu dersteki şablonlarla aynıdır.</p>
</section>
'''

LESSON = {
    'id': 'sablon-rapor', 'lv': 'orta', 'mod': 'Otomasyon ve Araçlar', 'min': 45,
    'title': 'Şablonla rapor üretme: string.Template ve Jinja2',
    'sum': 'string.Template ile güvenli basit metinler, Jinja2 ile değişken, filtre, döngü, koşul, makro ve kalıtım kullanan HTML/Markdown raporlar üretir; autoescape ile XSS\'i önler, CSV\'den HTML e-postaya giden bir rapor boru hattı kurarsın.',
    'goals': [
        'string.Template, f-string, str.format ve Jinja2 arasında güvenlik ve ihtiyaca göre seçim yapabilirim.',
        'Jinja2 şablonunda değişken, filtre, for/else, if ve loop değişkenlerini kullanarak rapor üretebilirim.',
        'Kendi filtremi (Türk lirası biçimi) yazar, makro ve şablon kalıtımıyla tekrarı kaldırabilirim.',
        'autoescape ile XSS\'i önler, StrictUndefined ile eksik veriyi erken yakalayabilirim.',
        'CSV verisini özetleyip HTML ve Markdown rapora, oradan HTML e-postaya dönüştüren bir boru hattı kurabilirim.'
    ],
    'body': BODY,
    'faq': [
        {'q': 'Jinja2 ile Django şablonları aynı şey mi?', 'a': 'Sözdizimleri çok benzer ({{ }}, {% %}) ama aynı motor değildir. Jinja2 daha esnektir (ifadeler, fonksiyon çağrıları) ve web dışı işlerde de (Ansible, dbt, rapor) kullanılır. Birini öğrenen diğerine birkaç saatte geçer.'},
        {'q': 'Şablonda karmaşık hesap yapmalı mıyım?', 'a': 'Hayır. Toplama, gruplama ve sıralamayı Python\'da yap, şablona hazır veri ver. Şablon yalnızca görünümden sorumlu olmalı; içinde iş mantığı biriktiğinde test etmek ve hata bulmak zorlaşır. sum, length gibi basit filtreler sorun değildir.'},
        {'q': 'Jinja\'da döngü içinde bir değişkeni neden güncelleyemiyorum?', 'a': 'Jinja\'da for döngüsünün kendi kapsamı vardır; içeride set ile atanan değer döngü bitince kaybolur. Toplam için sum filtresini kullan ya da {% set ns = namespace(toplam=0) %} ile oluşturduğun nesnenin niteliğini güncelle (ns.toplam).'},
        {'q': 'HTML e-postada CSS neden çalışmıyor?', 'a': 'Gmail ve Outlook gibi istemciler <style> bloklarını ve harici CSS\'i kısmen ya da tamamen yok sayar. Stilleri style="..." ile satır içi yaz, düzen için tablo kullan; premailer gibi araçlar CSS\'i otomatik satır içine taşır.'},
        {'q': 'Markdown raporu nerede kullanırım?', 'a': 'GitHub/GitLab sorunları ve README\'ler, Teams/Slack mesajları, Notion ve Confluence sayfaları, Jupyter notları Markdown okur. Aynı veriden HTML ve Markdown iki ayrı şablonla üretilebilir; veri katmanı değişmez.'}
    ],
    'mistakes': [
        {'bad': 'env = Environment()\nhtml = env.from_string("<p>{{ yorum }}</p>").render(yorum=kullanici_yorumu)', 'good': 'env = Environment(autoescape=True)\nhtml = env.from_string("<p>{{ yorum }}</p>").render(yorum=kullanici_yorumu)', 'why': 'Jinja\'nın varsayılanı autoescape kapalıdır; kullanıcı girdisindeki <script> raporu açanın tarayıcısında çalışır (XSS).'},
        {'bad': '{% set toplam = 0 %}\n{% for k in kalemler %}{% set toplam = toplam + k.tutar %}{% endfor %}\n{{ toplam }}', 'good': '{{ kalemler|sum(attribute="tutar") }}', 'why': 'Döngü içindeki set dışarıya taşınmaz; toplam 0 kalır. sum filtresi ya da namespace kullan.'},
        {'bad': 'sablon = kullanici_metni\nmesaj = sablon.format(musteri=m)', 'good': 'from string import Template\nmesaj = Template(kullanici_metni).safe_substitute(ad=m.ad)', 'why': 'str.format nitelik zincirine izin verir ({musteri.__class__...}); kullanıcı şablonu gizli verilere ulaşabilir.'},
        {'bad': 'env = Environment()\nt = env.from_string("{{ x|tl }}")\nenv.filters["tl"] = tl', 'good': 'env = Environment()\nenv.filters["tl"] = tl\nt = env.from_string("{{ x|tl }}")', 'why': 'Filtreler şablon derlenirken çözülür; kaydedilmemiş filtre TemplateAssertionError verir.'},
        {'bad': '{{ musteri.isim }}  {# yanlış ad, sessizce boş basar #}', 'good': 'env = Environment(undefined=StrictUndefined)', 'why': 'Varsayılan Undefined tanımsız değişkeni boş metin yapar; StrictUndefined hatayı gönderimden önce yakalar.'}
    ],
}

TL = 'def tl(deger):\n    metin = f"{deger:,.2f}"\n    return metin.translate(str.maketrans(",.", ".,")) + " TL"\n'

EX = [
    {'t': 'mc', 'stage': 'Isınma', 'q': '<code>string.Template</code> ile <code>substitute</code> ve <code>safe_substitute</code> arasındaki fark nedir?',
     'o': ['substitute eksik anahtarda KeyError verir; safe_substitute yer tutucuyu olduğu gibi bırakır', 'substitute HTML özel karakterlerini kaçırır, safe_substitute ham metni olduğu gibi basar', 'safe_substitute yalnızca sayı değerlerini değiştirir, metinleri şablonda bırakır', 'İkisi aynı işi yapar; safe_substitute yalnızca eski sürümlerden kalan bir addır'],
     'a': 0, 'why': 'Üretimde substitute tercih edilir: eksik veriyle mesaj gönderilmesin. safe_substitute taslak önizleme ya da aşamalı doldurma için uygundur. İkisi de HTML kaçışı yapmaz.'},
    {'t': 'mc', 'stage': 'Isınma', 'q': 'Jinja2\'de <code>autoescape=True</code> ne işe yarar?',
     'o': ['Şablondaki tüm HTML etiketlerini silerek yalnızca düz metin üretir', 'Değişkenlerden gelen <, >, & karakterlerini kaçırıp XSS\'i önler', 'Tanımsız değişkenlerde boş metin yerine hemen hata fırlatır', 'Şablonu ilk kullanımda derleyip sonraki çağrılar için önbelleğe alır'],
     'a': 1, 'why': 'autoescape yalnızca {{ }} ile basılan değerleri kaçırır, şablonun kendi etiketlerine dokunmaz. Tanımsız değişken için StrictUndefined, önbellek için Environment\'ın yeniden kullanımı gerekir.'},
    {'t': 'mc', 'stage': 'Isınma', 'q': 'Mağaza müdürlerinin kendi SMS metnini panelden yazmasına izin vereceksin. Neden <code>metin.format(musteri=m)</code> kullanmamalısın?',
     'o': ['format Türkçe karakterleri bozar, SMS\'lerde soru işareti görünür', 'format çok yavaştır, binlerce SMS\'te zaman aşımına yol açar', 'Şablon {musteri.__class__...} gibi nitelik zinciriyle gizli verilere erişebilir', 'format yalnızca sayıları biçimlendirir, metin yer tutucusu desteklemez'],
     'a': 2, 'why': 'str.format alanlarında nokta ve köşeli parantezle nitelik/indeks erişimi serbesttir. Kullanıcı yazdığı şablonla nesnenin gizli alanlarına ve modül globallerine ulaşabilir. string.Template yalnızca ad değiştirir.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
     'code': 'from string import Template\nt = Template("Sayın $ad, $tutar TL borcunuz var. Kod: $kod")\nprint(t.safe_substitute(ad="Ayşe", tutar=150))\n',
     'o': ['Sayın Ayşe, 150 TL borcunuz var. Kod: ', 'KeyError: \'kod\'', 'Sayın Ayşe, 150 TL borcunuz var. Kod: $kod', 'Sayın Ayşe, 150 TL borcunuz var. Kod: None'],
     'a': 2, 'why': 'safe_substitute eksik anahtarı hata vermeden olduğu gibi bırakır. substitute kullanılsaydı KeyError: \'kod\' alırdın. Sayılar str() ile metne çevrilir.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'for ... else ile yazılmış şablon iki çağrıda ne üretir?',
     'code': 'from jinja2 import Template\nt = Template("{% for s in sip %}{{ loop.index }}.{{ s }} {% else %}sipariş yok{% endfor %}")\nprint(t.render(sip=["Çay", "Kahve"]))\nprint(t.render(sip=[]))\n',
     'o': ['0.Çay 1.Kahve\nsipariş yok', '1.Çay 2.Kahve\nsipariş yok', '1.Çay 2.Kahve sipariş yok\nsipariş yok', '1.Çay 2.Kahve\n'],
     'a': 1, 'why': 'loop.index 1\'den başlar (0\'dan başlayan loop.index0\'dır). Jinja\'daki for-else, Python\'dakinden farklıdır: else yalnızca liste BOŞSA çalışır.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'autoescape açık ortam bu yorumu nasıl basar?',
     'code': 'from jinja2 import Environment\nenv = Environment(autoescape=True)\nt = env.from_string("<p>{{ yorum }}</p>")\nprint(t.render(yorum="<b>Harika</b> & hızlı"))\n',
     'o': ['<p><b>Harika</b> & hızlı</p>', '&lt;p&gt;&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı&lt;/p&gt;', '<p>Harika & hızlı</p>', '<p>&lt;b&gt;Harika&lt;/b&gt; &amp; hızlı</p>'],
     'a': 3, 'why': 'Yalnızca değişkenden gelen değer kaçırılır; şablonun kendi <p> etiketi olduğu gibi kalır. Etiketler silinmez, varlığa çevrilir; tarayıcı onları metin olarak gösterir.'},
    {'t': 'order', 'stage': 'Kodu oku', 'q': '<p>Kendi filtresini kullanan Jinja programının satırlarını sırala. Çıktı <code>&lt;li&gt;Kahve: 1,249.90 TL&lt;/li&gt;</code> olmalı.</p>',
     'lines': ['from jinja2 import Environment', 'env = Environment(autoescape=True)', 'env.filters["tl"] = lambda x: f"{x:,.2f} TL"', 'sablon = env.from_string("<li>{{ urun }}: {{ fiyat|tl }}</li>")', 'print(sablon.render(urun="Kahve", fiyat=1249.9))'],
     'expect': '<li>Kahve: 1,249.90 TL</li>\n', 'hint': 'Filtre, onu kullanan şablon derlenmeden önce kaydedilmeli.',
     'why': 'from_string şablonu hemen derler; o anda tl filtresi yoksa TemplateAssertionError alınır. Bu yüzden sıra: ortam → filtre → şablon → render.'},
]

EX += [
    {'t': 'code', 'stage': 'Rehberli', 'diff': 1,
     'q': '<p>Ilgaz Bank fatura hatırlatma SMS\'leri. <code>hatirlatmalar(musteriler)</code> fonksiyonunu tamamla. Her müşteri sözlüğü için <code>SABLON.substitute</code> ile mesaj üret. <code>tutar</code> 2 ondalıkla yazılsın (<code>f"{tutar:.2f}"</code>). Gerekli alanı (<code>ad</code>, <code>tarih</code>, <code>tutar</code>) eksik olan müşteriyi atla ve adını (yoksa <code>"?"</code>) <code>eksikler</code> listesine ekle. <code>(mesajlar, eksikler)</code> döndür.</p>',
     'guide': ['Her müşteri için try bloğu aç.', 'substitute\'a ad, tarih ve biçimlenmiş tutarı ver: m["tutar"] eksikse burada da KeyError oluşur.', 'Başarılıysa mesajı mesajlar listesine ekle.', 'except KeyError: içinde m.get("ad", "?") değerini eksikler\'e ekle.'],
     'example': 'from string import Template\n\nt = Template("$urun stoğu $adet adede düştü")\nfor kayit in [{"urun": "Çay", "adet": 3}, {"urun": "Su"}]:\n    try:\n        print(t.substitute(urun=kayit["urun"], adet=kayit["adet"]))\n    except KeyError as e:\n        print("eksik alan:", e)\n',
     'start': 'from string import Template\n\nSABLON = Template("Sayın $ad, $tarih son ödeme tarihli $tutar TL faturanızı hatırlatırız.")\n\ndef hatirlatmalar(musteriler):\n    mesajlar, eksikler = [], []\n    for m in musteriler:\n        # TODO: substitute ile mesajı üret (tutar 2 ondalık)\n        # TODO: KeyError olursa adı (yoksa "?") eksikler\'e ekle\n        pass\n    return mesajlar, eksikler\n',
     'sol': 'from string import Template\n\nSABLON = Template("Sayın $ad, $tarih son ödeme tarihli $tutar TL faturanızı hatırlatırız.")\n\ndef hatirlatmalar(musteriler):\n    mesajlar, eksikler = [], []\n    for m in musteriler:\n        try:\n            mesajlar.append(SABLON.substitute(ad=m["ad"], tarih=m["tarih"], tutar=f"{m[\'tutar\']:.2f}"))\n        except KeyError:\n            eksikler.append(m.get("ad", "?"))\n    return mesajlar, eksikler\n',
     'tests': 'ms, ek = hatirlatmalar([\n    {"ad": "Ayşe", "tarih": "30.10.2026", "tutar": 1249.9},\n    {"ad": "Mehmet", "tutar": 89},\n    {"tarih": "01.11.2026", "tutar": 10},\n    {"ad": "Zeynep", "tarih": "05.11.2026", "tutar": 75},\n])\nassert ms == ["Sayın Ayşe, 30.10.2026 son ödeme tarihli 1249.90 TL faturanızı hatırlatırız.", "Sayın Zeynep, 05.11.2026 son ödeme tarihli 75.00 TL faturanızı hatırlatırız."], f"Mesajlar: {ms}"\nassert ek == ["Mehmet", "?"], f"Eksikler: {ek} (tarihi olmayan Mehmet, adı olmayan ?)"\n',
     'hints': ['Eksik alan m["tarih"] erişiminde KeyError fırlatır; bunu yakala.', 'tutar=f"{m[\'tutar\']:.2f}" ile biçimle.', 'except KeyError: eksikler.append(m.get("ad", "?"))'],
     'why': 'Eksik veriyle mesaj göndermek ("Sayın , ...") müşteri gözünde kurumsal hatadır. substitute\'un sert davranışı bu durumu yakalamayı kolaylaştırır; eksikler listesi veri ekibine düzeltme görevi olarak gider.'},
    {'t': 'code', 'stage': 'Rehberli', 'diff': 2,
     'q': '<p><code>siparis_tablosu(siparisler)</code> fonksiyonunu tamamla. Jinja2 ile (autoescape açık) şu HTML\'i üretsin:</p><pre class="out">&lt;table&gt;\n&lt;tr&gt;&lt;td&gt;AM-1&lt;/td&gt;&lt;td&gt;Ayşe&lt;/td&gt;&lt;td&gt;1249.90&lt;/td&gt;&lt;/tr&gt;\n...her sipariş için bir satır...\n&lt;tr&gt;&lt;th colspan="2"&gt;Toplam&lt;/th&gt;&lt;th&gt;1339.40&lt;/th&gt;&lt;/tr&gt;\n&lt;/table&gt;</pre><p>Tutarlar <code>"%.2f"|format(...)</code> ile 2 ondalık; toplam <code>sum(attribute="tutar")</code> filtresiyle hesaplansın. Sözlük anahtarları: <code>no</code>, <code>musteri</code>, <code>tutar</code>.</p>',
     'guide': ['Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True) oluştur.', 'Şablonda {% for s in siparisler %} ... {% endfor %} ile her satırı yaz.', 'Tutar için {{ "%.2f"|format(s.tutar) }}.', 'Toplam satırında siparisler|sum(attribute="tutar") sonucunu yine format ile yaz.', 'render(siparisler=siparisler) sonucunu döndür.'],
     'example': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nt = env.from_string("""<ul>\n{% for u in urunler %}\n<li>{{ u.ad }} ({{ "%.1f"|format(u.puan) }})</li>\n{% endfor %}\n</ul>\nOrtalama: {{ "%.1f"|format((urunler|sum(attribute="puan")) / (urunler|length)) }}""")\nprint(t.render(urunler=[{"ad": "Çay", "puan": 4.5}, {"ad": "Kahve", "puan": 4}]))\n',
     'start': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nSABLON = env.from_string("""<table>\n{# TODO: her sipariş için <tr><td>no</td><td>musteri</td><td>tutar</td></tr> #}\n{# TODO: toplam satırı #}\n</table>""")\n\ndef siparis_tablosu(siparisler):\n    return SABLON.render(siparisler=siparisler)\n',
     'sol': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nSABLON = env.from_string("""<table>\n{% for s in siparisler %}\n<tr><td>{{ s.no }}</td><td>{{ s.musteri }}</td><td>{{ "%.2f"|format(s.tutar) }}</td></tr>\n{% endfor %}\n<tr><th colspan="2">Toplam</th><th>{{ "%.2f"|format(siparisler|sum(attribute="tutar")) }}</th></tr>\n</table>""")\n\ndef siparis_tablosu(siparisler):\n    return SABLON.render(siparisler=siparisler)\n',
     'tests': 'html = siparis_tablosu([{"no": "AM-1", "musteri": "Ayşe", "tutar": 1249.9}, {"no": "AM-2", "musteri": "<script>x</script>", "tutar": 89.5}])\nsatirlar = [s.strip() for s in html.strip().splitlines()]\nassert satirlar[0] == "<table>" and satirlar[-1] == "</table>", f"Tablo etiketleri: {satirlar}"\nassert satirlar[1] == "<tr><td>AM-1</td><td>Ayşe</td><td>1249.90</td></tr>", f"İlk satır: {satirlar[1]}"\nassert satirlar[2] == "<tr><td>AM-2</td><td>&lt;script&gt;x&lt;/script&gt;</td><td>89.50</td></tr>", "Müşteri adı HTML kaçışlı olmalı (autoescape)"\nassert satirlar[3] == \'<tr><th colspan="2">Toplam</th><th>1339.40</th></tr>\', f"Toplam satırı: {satirlar[3]}"\nassert len(satirlar) == 5, "Fazladan boş satır olmamalı (trim_blocks)"\nbos = [s.strip() for s in siparis_tablosu([]).strip().splitlines()]\nassert bos == ["<table>", \'<tr><th colspan="2">Toplam</th><th>0.00</th></tr>\', "</table>"], f"Boş liste: {bos}"\n',
     'hints': ['Değişkenlere s.no, s.musteri, s.tutar ile eriş; Jinja sözlük anahtarını nokta ile okur.', 'Toplam: {{ "%.2f"|format(siparisler|sum(attribute="tutar")) }}', 'for satırı ve endfor satırı kendi satırlarında dururken trim_blocks onların bıraktığı satır sonunu siler.'],
     'why': 'Hesabı filtreyle yapıp biçimi şablonda tutmak sunum ile veriyi ayırır. autoescape sayesinde müşteri adındaki <script> metin olarak görünür, çalışmaz.'},
    {'t': 'code', 'stage': 'Rehberli', 'diff': 2,
     'q': '<p>Türk lirası filtresi yaz ve kullan:</p><ol><li><code>tl(deger)</code>: <code>1249.9</code> → <code>"1.249,90 TL"</code>, <code>-5</code> → <code>"-5,00 TL"</code>.</li><li><code>env</code> ortamına <code>"tl"</code> adıyla kaydet.</li><li><code>fiyat_listesi(urunler)</code>: her ürün için <code>"- {ad}: {fiyat|tl}"</code> satırı üretip satırları <code>\\n</code> ile birleştirilmiş tek metin olarak döndürsün (Jinja şablonuyla).</li></ol>',
     'guide': ['f"{deger:,.2f}" İngilizce biçimi verir: 1,249.90.', 'str.maketrans(",.", ".,") ile virgül ve noktayı yer değiştir, sonuna " TL" ekle.', 'env.filters["tl"] = tl satırını şablonu derlemeden önce yaz.', 'Şablonda {% for u in urunler %}- {{ u.ad }}: {{ u.fiyat|tl }}{% if not loop.last %}\\n{% endif %}{% endfor %} benzeri bir yapı kur.'],
     'example': 'from jinja2 import Environment\n\ndef yuzde(x):\n    return "%" + f"{x * 100:.1f}".replace(".", ",")\n\nenv = Environment()\nenv.filters["yuzde"] = yuzde\nprint(env.from_string("Pay: {{ oran|yuzde }}").render(oran=0.4567))\n',
     'start': 'from jinja2 import Environment\n\ndef tl(deger):\n    # TODO: 1249.9 -> "1.249,90 TL"\n    pass\n\nenv = Environment()\n# TODO: filtreyi kaydet\nSABLON = env.from_string("{# TODO: her ürün için - ad: fiyat|tl #}")\n\ndef fiyat_listesi(urunler):\n    return SABLON.render(urunler=urunler)\n',
     'sol': 'from jinja2 import Environment\n\n' + TL + '\nenv = Environment()\nenv.filters["tl"] = tl\nSABLON = env.from_string("{% for u in urunler %}- {{ u.ad }}: {{ u.fiyat|tl }}{% if not loop.last %}\\n{% endif %}{% endfor %}")\n\ndef fiyat_listesi(urunler):\n    return SABLON.render(urunler=urunler)\n',
     'tests': 'assert tl(1249.9) == "1.249,90 TL", f"tl(1249.9) = {tl(1249.9)!r}"\nassert tl(1234567.891) == "1.234.567,89 TL"\nassert tl(0) == "0,00 TL" and tl(-5) == "-5,00 TL"\nassert env.filters.get("tl") is tl, "Filtre env.filters[\\"tl\\"] olarak kaydedilmeli"\nassert fiyat_listesi([{"ad": "Çay", "fiyat": 45}, {"ad": "Kahve makinesi", "fiyat": 12499.5}]) == "- Çay: 45,00 TL\\n- Kahve makinesi: 12.499,50 TL", "Satırlar \\\\n ile ayrılmalı, sonda boş satır olmamalı"\nassert fiyat_listesi([]) == ""\n',
     'hints': ['Önce İngilizce biçim, sonra karakter takası: metin.translate(str.maketrans(",.", ".,")).', 'loop.last son yinelemede True olur; satır sonunu yalnızca son değilse ekle.', 'Jinja metninde \\n gerçek bir satır sonudur (Python string kaçışı).'],
     'why': 'Yerel biçimi tek bir filtrede toplamak, tüm raporların aynı biçimi kullanmasını garanti eder. Takas yöntemi (virgül↔nokta) locale ayarına bağımlı olmadığı için sunucuda da aynı sonucu verir.'},
]

EX += [
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>Kargo listesi için bir <b>makro</b> kullan. <code>SABLON</code> metninde <code>rozet(durum)</code> adlı bir makro tanımla; makro <code>&lt;span class="rozet DURUM"&gt;ETİKET&lt;/span&gt;</code> üretsin. Etiketler: <code>teslim</code> → <code>Teslim edildi</code>, <code>kargoda</code> → <code>Yolda</code>, diğerleri → <code>Hazırlanıyor</code>. <code>kargo_listesi(gonderiler)</code> her gönderi için bir satır döndürsün: <code>AM-1: &lt;span class="rozet teslim"&gt;Teslim edildi&lt;/span&gt;</code> (satırlar <code>\\n</code> ile, sonda boş satır yok). autoescape açık olsun.</p>',
     'start': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True)\nSABLON = ""\n\ndef kargo_listesi(gonderiler):\n    pass\n',
     'sol': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True)\nSABLON = """{% macro rozet(durum) -%}\n<span class="rozet {{ durum }}">{% if durum == "teslim" %}Teslim edildi{% elif durum == "kargoda" %}Yolda{% else %}Hazırlanıyor{% endif %}</span>\n{%- endmacro %}\n{%- for g in gonderiler %}{{ g.no }}: {{ rozet(g.durum) }}{% if not loop.last %}\n{% endif %}{% endfor %}"""\n\ndef kargo_listesi(gonderiler):\n    return env.from_string(SABLON).render(gonderiler=gonderiler)\n',
     'tests': 'r = kargo_listesi([{"no": "AM-1", "durum": "teslim"}, {"no": "AM-2", "durum": "kargoda"}, {"no": "AM-3", "durum": "yeni"}])\nassert r.split("\\n") == [\'AM-1: <span class="rozet teslim">Teslim edildi</span>\', \'AM-2: <span class="rozet kargoda">Yolda</span>\', \'AM-3: <span class="rozet yeni">Hazırlanıyor</span>\'], f"Çıktı: {r!r}"\nassert "{% macro rozet" in __source__, "Rozet bir Jinja makrosu ({% macro rozet(durum) %}) olarak yazılmalı"\nr2 = kargo_listesi([{"no": "AM-9", "durum": "\\"><script>"}])\nassert "<script>" not in r2, "Durum değeri kaçırılmalı (autoescape)"\n',
     'hints': ['{% macro rozet(durum) %}...{% endmacro %} şablonun başında tanımlanır, sonra {{ rozet(g.durum) }} diye çağrılır.', 'Boşluk kontrolü: {%- ve -%} etiketin yanındaki boşlukları ve satır sonlarını yutar.', 'Satır ayırıcı için {% if not loop.last %} ve gerçek bir satır sonu kullan.'],
     'why': 'Makro, şablon içinde tekrar eden HTML parçasını tek yerde tanımlar; rozetin görünümü değişince tek satır değişir. Boşluk kontrol işaretleri (-) makro tanımının çıktıya boş satır bırakmasını engeller.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p><b>Şablon kalıtımı.</b> <code>taban.html</code> hazır verildi. <code>SABLONLAR["magaza.html"]</code> şablonunu yaz: <code>taban.html</code>\'i genişletsin (<code>extends</code>), <code>baslik</code> bloğuna <code>Mağaza: {{ ad }}</code>, <code>icerik</code> bloğuna her ürün için <code>&lt;li&gt;urun - adet&lt;/li&gt;</code> yazsın. <code>magaza_raporu(ad, urunler)</code> bu şablonu render edip döndürsün. <code>urunler</code>: <code>[("Çay", 120), ...]</code> demetleri.</p>',
     'start': 'from jinja2 import Environment, DictLoader\n\nSABLONLAR = {\n    "taban.html": "<html><h1>{% block baslik %}{% endblock %}</h1><ul>{% block icerik %}{% endblock %}</ul><p>Anadolu Market</p></html>",\n    "magaza.html": "",\n}\nenv = Environment(loader=DictLoader(SABLONLAR), autoescape=True)\n\ndef magaza_raporu(ad, urunler):\n    pass\n',
     'sol': 'from jinja2 import Environment, DictLoader\n\nSABLONLAR = {\n    "taban.html": "<html><h1>{% block baslik %}{% endblock %}</h1><ul>{% block icerik %}{% endblock %}</ul><p>Anadolu Market</p></html>",\n    "magaza.html": \'{% extends "taban.html" %}{% block baslik %}Mağaza: {{ ad }}{% endblock %}{% block icerik %}{% for urun, adet in urunler %}<li>{{ urun }} - {{ adet }}</li>{% endfor %}{% endblock %}\',\n}\nenv = Environment(loader=DictLoader(SABLONLAR), autoescape=True)\n\ndef magaza_raporu(ad, urunler):\n    return env.get_template("magaza.html").render(ad=ad, urunler=urunler)\n',
     'tests': 'r = magaza_raporu("Kadıköy", [("Çay", 120), ("Kahve", 45)])\nassert r == "<html><h1>Mağaza: Kadıköy</h1><ul><li>Çay - 120</li><li>Kahve - 45</li></ul><p>Anadolu Market</p></html>", f"Çıktı: {r}"\nassert "extends" in SABLONLAR["magaza.html"], "magaza.html taban.html\'i extends ile genişletmeli"\nassert "<html>" not in SABLONLAR["magaza.html"], "İskeleti tekrar yazma; taban şablondan gelsin"\nassert magaza_raporu("A&B", []) == "<html><h1>Mağaza: A&amp;B</h1><ul></ul><p>Anadolu Market</p></html>"\n',
     'hints': ['Alt şablon {% extends "taban.html" %} ile başlar.', 'Blokları aynı adla yeniden tanımla: {% block baslik %}...{% endblock %}.', 'Demetleri for içinde açabilirsin: {% for urun, adet in urunler %}. Şablonu env.get_template("magaza.html") ile al.'],
     'why': 'Kalıtım sayesinde 20 farklı rapor tek bir iskeleti paylaşır; logo ya da alt bilgi değişince yalnızca taban şablon düzenlenir. Alt şablon yalnızca kendine özgü bölümleri içerir.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p><code>md_rapor(baslik, satirlar)</code> Jinja ile şu Markdown\'u üretsin (<code>satirlar</code>: <code>{"magaza", "ciro"}</code> sözlükleri; ciro tam sayı, binlik ayırıcı nokta):</p><pre class="out"># Haftalık satış\n\n| Mağaza | Ciro |\n|---|---:|\n| Kadıköy | 98.200 |\n| Çankaya | 84.250 |\n\n**Toplam:** 182.450 TL</pre><p>Çıktının sonunda tek bir satır sonu olsun. Liste boşsa tablo başlığı yine yazılsın, toplam 0 olsun.</p>',
     'start': 'from jinja2 import Environment\n\ndef md_rapor(baslik, satirlar):\n    pass\n',
     'sol': 'from jinja2 import Environment\n\nenv = Environment(trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True)\nenv.filters["binlik"] = lambda x: f"{x:,}".replace(",", ".")\nMD = env.from_string("""# {{ baslik }}\n\n| Mağaza | Ciro |\n|---|---:|\n{% for s in satirlar %}\n| {{ s.magaza }} | {{ s.ciro|binlik }} |\n{% endfor %}\n\n**Toplam:** {{ satirlar|sum(attribute="ciro")|binlik }} TL\n""")\n\ndef md_rapor(baslik, satirlar):\n    return MD.render(baslik=baslik, satirlar=satirlar)\n',
     'tests': 'r = md_rapor("Haftalık satış", [{"magaza": "Kadıköy", "ciro": 98200}, {"magaza": "Çankaya", "ciro": 84250}])\nassert r == "# Haftalık satış\\n\\n| Mağaza | Ciro |\\n|---|---:|\\n| Kadıköy | 98.200 |\\n| Çankaya | 84.250 |\\n\\n**Toplam:** 182.450 TL\\n", f"Çıktı:\\n{r!r}"\nassert md_rapor("Boş", []) == "# Boş\\n\\n| Mağaza | Ciro |\\n|---|---:|\\n\\n**Toplam:** 0 TL\\n", f"Boş liste: {md_rapor(\'Boş\', [])!r}"\nassert md_rapor("X", [{"magaza": "A", "ciro": 1234567}]).count("1.234.567") == 2\n',
     'hints': ['Binlik ayırıcı: f"{x:,}".replace(",", ".") küçük bir filtre olarak kaydedilebilir.', 'trim_blocks ve lstrip_blocks for/endfor satırlarının boş satır bırakmasını engeller.', 'Jinja varsayılan olarak şablonun sonundaki tek satır sonunu siler; korumak için keep_trailing_newline=True.'],
     'why': 'Markdown tabloları boşluk ve satır sonuna duyarlıdır; Jinja\'nın boşluk ayarlarını (trim_blocks, lstrip_blocks, keep_trailing_newline) bilmek çıktıyı tam kontrol etmeni sağlar. ---: sütunu sağa hizalar.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>Gönderimden önce şablonu denetleyen <code>guvenli_render(sablon_metni, **veri)</code> yaz. <code>StrictUndefined</code> kullanan bir ortamla render etsin:</p><ul><li>Başarılıysa <code>(True, cikti)</code></li><li>Tanımsız değişken varsa <code>(False, "eksik: AD")</code> (AD, tanımsız değişkenin adı; Jinja\'nın hata mesajı <code>\'AD\' is undefined</code> biçimindedir)</li><li>Şablon sözdizimi bozuksa <code>(False, "sözdizimi: SATIR")</code> (hatanın satır numarası, <code>e.lineno</code>)</li></ul>',
     'start': 'import re\nfrom jinja2 import Environment, StrictUndefined, UndefinedError, TemplateSyntaxError\n\ndef guvenli_render(sablon_metni, **veri):\n    pass\n',
     'sol': 'import re\nfrom jinja2 import Environment, StrictUndefined, UndefinedError, TemplateSyntaxError\n\nENV = Environment(undefined=StrictUndefined)\n\ndef guvenli_render(sablon_metni, **veri):\n    try:\n        return True, ENV.from_string(sablon_metni).render(**veri)\n    except UndefinedError as e:\n        eslesme = re.search(r"\'(\\w+)\' is undefined", str(e))\n        return False, f"eksik: {eslesme.group(1) if eslesme else str(e)}"\n    except TemplateSyntaxError as e:\n        return False, f"sözdizimi: {e.lineno}"\n',
     'tests': 'assert guvenli_render("Merhaba {{ ad }}", ad="Ayşe") == (True, "Merhaba Ayşe")\nassert guvenli_render("Merhaba {{ isim }}, {{ ad }}", ad="Ayşe") == (False, "eksik: isim"), "Tanımsız değişken boş geçilmemeli; StrictUndefined hata vermeli"\nassert guvenli_render("Satır 1\\n{% for x in l %}{{ x }}", l=[1]) == (False, "sözdizimi: 2"), "Kapanmamış for sözdizimi hatasıdır"\nassert guvenli_render("{{ m.ad }}", m={"ad": "Ali"}) == (True, "Ali")\nassert guvenli_render("{{ x|default(\'-\') }}") == (True, "-"), "default filtresi StrictUndefined ile de çalışır"\n',
     'hints': ['Environment(undefined=StrictUndefined) tanımsız değişkende UndefinedError fırlatır.', 'Mesajdan adı çekmek için re.search(r"\'(\\w+)\' is undefined", str(e)).', 'TemplateSyntaxError nesnesinin lineno niteliği hatalı satırı verir.'],
     'why': 'Şablonu örnek veriyle önceden render edip hataları yakalamak, binlerce kişiye bozuk e-posta gitmesini önleyen ucuz bir sigortadır. default filtresi bilerek bırakılan opsiyonel alanlar için kaçış yolu sağlar.'},
]

EX += [
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 1,
     'q': '<p>Ürün yorumlarını gösteren sayfa, bir müşterinin yazdığı <code>&lt;script&gt;</code> etiketini olduğu gibi basıyor (XSS açığı). Ama şablonun kendi <code>&lt;li&gt;</code> etiketleri bozulmamalı. <b>Hatayı bul ve düzelt.</b></p>',
     'start': 'from jinja2 import Environment\n\nenv = Environment()\nSABLON = env.from_string("<ul>{% for y in yorumlar %}<li><b>{{ y.ad }}</b>: {{ y.metin }}</li>{% endfor %}</ul>")\n\ndef yorum_sayfasi(yorumlar):\n    return SABLON.render(yorumlar=yorumlar)\n',
     'sol': 'from jinja2 import Environment\n\nenv = Environment(autoescape=True)\nSABLON = env.from_string("<ul>{% for y in yorumlar %}<li><b>{{ y.ad }}</b>: {{ y.metin }}</li>{% endfor %}</ul>")\n\ndef yorum_sayfasi(yorumlar):\n    return SABLON.render(yorumlar=yorumlar)\n',
     'tests': 'r = yorum_sayfasi([{"ad": "Ayşe", "metin": "Çok iyi & hızlı"}, {"ad": "x", "metin": "<script>alert(1)</script>"}])\nassert "<script>" not in r, "Kullanıcı metnindeki <script> kaçırılmalı"\nassert r == "<ul><li><b>Ayşe</b>: Çok iyi &amp; hızlı</li><li><b>x</b>: &lt;script&gt;alert(1)&lt;/script&gt;</li></ul>", f"Çıktı: {r}"\n',
     'hints': ['Jinja Environment\'ın varsayılanı autoescape=False\'tur.', 'Environment(autoescape=True) şablonun etiketlerine dokunmaz, yalnızca {{ }} değerlerini kaçırır.'],
     'why': 'XSS, web uygulamalarında en sık görülen açıklardandır. HTML üreten her Jinja ortamında autoescape açık olmalı; tek tek |e eklemek unutulmaya mahkûmdur.'},
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
     'q': '<p>Sepet özeti her zaman <code>Toplam: 0.00 TL</code> yazıyor. Kalemlerin adet × fiyat toplamı yazılmalı. <b>Hatayı bul ve düzelt</b> (hesap şablonda kalabilir ya da Python\'a taşınabilir).</p>',
     'start': 'from jinja2 import Environment\n\nenv = Environment(trim_blocks=True, lstrip_blocks=True)\nSABLON = env.from_string("""{% set toplam = 0 %}\n{% for k in kalemler %}\n{{ k.urun }} x{{ k.adet }}\n{% set toplam = toplam + k.adet * k.fiyat %}\n{% endfor %}\nToplam: {{ "%.2f"|format(toplam) }} TL""")\n\ndef sepet_ozeti(kalemler):\n    return SABLON.render(kalemler=kalemler)\n',
     'sol': 'from jinja2 import Environment\n\nenv = Environment(trim_blocks=True, lstrip_blocks=True)\nSABLON = env.from_string("""{% set ns = namespace(toplam=0) %}\n{% for k in kalemler %}\n{{ k.urun }} x{{ k.adet }}\n{% set ns.toplam = ns.toplam + k.adet * k.fiyat %}\n{% endfor %}\nToplam: {{ "%.2f"|format(ns.toplam) }} TL""")\n\ndef sepet_ozeti(kalemler):\n    return SABLON.render(kalemler=kalemler)\n',
     'tests': 'r = sepet_ozeti([{"urun": "Çay", "adet": 2, "fiyat": 45.5}, {"urun": "Kahve", "adet": 1, "fiyat": 120.25}])\nassert r.strip().splitlines() == ["Çay x2", "Kahve x1", "Toplam: 211.25 TL"], f"Çıktı: {r!r}"\nassert sepet_ozeti([]).strip() == "Toplam: 0.00 TL"\n',
     'hints': ['Jinja\'da for döngüsünün kendi kapsamı vardır; içeride set ile yapılan atama dışarı taşınmaz.', 'Çözüm 1: {% set ns = namespace(toplam=0) %} ve döngüde {% set ns.toplam = ... %}. Çözüm 2: toplamı Python\'da hesaplayıp şablona ver.'],
     'why': 'Bu, Jinja\'nın en ünlü tuzağıdır: Python\'daki gibi davranacağını sanırsın ama döngü içi set yerel kalır. namespace nesnesinin niteliği ise döngü dışında da güncellenmiş olur. Genel ilke: hesabı Python\'da yap, şablona sonucu ver.'},
    {'t': 'code', 'stage': 'Meydan okuma', 'diff': 3,
     'q': '<p><b>CSV → özet → HTML.</b> <code>csv_html_rapor(csv_metin)</code> yaz. CSV sütunları: <code>sehir,urun,tutar</code>.</p><ul><li>Şehre göre sipariş sayısı ve ciroyu topla; ciroya göre <b>büyükten küçüğe</b> sırala (eşitlikte şehir adına göre).</li><li>Her şehrin toplam ciro içindeki payını yüzde olarak hesapla.</li><li>Jinja (autoescape açık) ile şu satırları üret; her satır kendi satırında, başında/sonunda boşluk olmadan:<br><code>&lt;h2&gt;Şehir raporu (N sipariş)&lt;/h2&gt;</code><br><code>&lt;table&gt;</code><br><code>&lt;tr&gt;&lt;td&gt;ŞEHİR&lt;/td&gt;&lt;td&gt;ADET&lt;/td&gt;&lt;td&gt;CİRO:.2f&lt;/td&gt;&lt;td&gt;%PAY:.1f&lt;/td&gt;&lt;/tr&gt;</code> (her şehir)<br><code>&lt;/table&gt;</code></li><li>Boş ya da yalnız başlıklı CSV\'de <code>&lt;p&gt;Veri yok&lt;/p&gt;</code> döndür. <code>tutar</code> boş ya da sayı değilse o satırı atla.</li></ul>',
     'start': 'import csv, io\nfrom collections import defaultdict\nfrom jinja2 import Environment\n\ndef csv_html_rapor(csv_metin):\n    pass\n',
     'sol': 'import csv, io\nfrom collections import defaultdict\nfrom jinja2 import Environment\n\nENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nRAPOR = ENV.from_string("""<h2>Şehir raporu ({{ toplam_adet }} sipariş)</h2>\n<table>\n{% for r in satirlar %}\n<tr><td>{{ r.sehir }}</td><td>{{ r.adet }}</td><td>{{ "%.2f"|format(r.ciro) }}</td><td>%{{ "%.1f"|format(r.pay) }}</td></tr>\n{% endfor %}\n</table>""")\n\ndef csv_html_rapor(csv_metin):\n    ozet = defaultdict(lambda: [0, 0.0])\n    for satir in csv.DictReader(io.StringIO(csv_metin)):\n        try:\n            tutar = float(satir["tutar"])\n        except (TypeError, ValueError):\n            continue\n        ozet[satir["sehir"]][0] += 1\n        ozet[satir["sehir"]][1] += tutar\n    if not ozet:\n        return "<p>Veri yok</p>"\n    toplam = sum(c for _, c in ozet.values())\n    satirlar = [{"sehir": s, "adet": a, "ciro": c, "pay": (c / toplam * 100) if toplam else 0.0} for s, (a, c) in ozet.items()]\n    satirlar.sort(key=lambda r: (-r["ciro"], r["sehir"]))\n    return RAPOR.render(satirlar=satirlar, toplam_adet=sum(r["adet"] for r in satirlar))\n',
     'tests': 'CSV = "sehir,urun,tutar\\nİzmir,Çay,450\\nAnkara,Kahve,1249.9\\nİzmir,Kahve,890\\nİstanbul,Çay,2100\\nAnkara,Su,75.5\\nBursa,Çay,abc\\nBursa,Su,\\n<b>Van</b>,Çay,0\\n"\nr = csv_html_rapor(CSV)\nsatirlar = [s.strip() for s in r.strip().splitlines()]\nassert satirlar[0] == "<h2>Şehir raporu (6 sipariş)</h2>", f"Başlık: {satirlar[0]} (geçersiz tutarlı 2 satır sayılmamalı)"\nassert satirlar[1] == "<table>" and satirlar[-1] == "</table>"\nassert satirlar[2:-1] == [\n    "<tr><td>İstanbul</td><td>1</td><td>2100.00</td><td>%44.1</td></tr>",\n    "<tr><td>İzmir</td><td>2</td><td>1340.00</td><td>%28.1</td></tr>",\n    "<tr><td>Ankara</td><td>2</td><td>1325.40</td><td>%27.8</td></tr>",\n    "<tr><td>&lt;b&gt;Van&lt;/b&gt;</td><td>1</td><td>0.00</td><td>%0.0</td></tr>",\n], f"Satırlar: {satirlar[2:-1]}"\nassert csv_html_rapor("sehir,urun,tutar\\n") == "<p>Veri yok</p>"\nassert csv_html_rapor("") == "<p>Veri yok</p>"\nr2 = [s.strip() for s in csv_html_rapor("sehir,urun,tutar\\nB,x,0\\nA,y,0\\n").strip().splitlines()]\nassert r2[2:4] == ["<tr><td>A</td><td>1</td><td>0.00</td><td>%0.0</td></tr>", "<tr><td>B</td><td>1</td><td>0.00</td><td>%0.0</td></tr>"], "Toplam 0 ise sıfıra bölme olmamalı; eşit cirolar şehir adına göre sıralanmalı"\n',
     'hints': ['Özeti Python\'da çıkar (defaultdict), şablona hazır ve sıralı satır listesi ver.', 'float() hatası için try/except ValueError (boş metin de ValueError verir); sıralama anahtarı (-ciro, sehir).', 'Toplam ciro 0 olabilir: pay hesabında sıfıra bölmeyi engelle.'],
     'why': 'Rapor boru hattının üç katmanı ayrıdır: ayrıştırma ve temizleme (csv + try/except), özetleme (defaultdict, sort), sunum (Jinja). Her katman ayrı test edilebilir; kenar durumlar (boş dosya, bozuk tutar, sıfır toplam, HTML içeren veri) üretimde mutlaka gelir.'},
    {'t': 'code', 'stage': 'Mini proje', 'diff': 3,
     'q': '<p><b>Kişisel öneri bülteni.</b> <code>bulten_olustur(musteri, oneriler)</code> bir <code>EmailMessage</code> döndürsün:</p><ul><li>From <code>bulten@anadolumarket.com.tr</code>, To <code>musteri["email"]</code>, Subject <code>"{ad}, sana özel {n} öneri"</code></li><li>Düz metin gövde (autoescape <b>kapalı</b> Jinja): ilk satır <code>Merhaba {ad},</code>, sonra her öneri için <code>- {urun}: {fiyat|tl}</code></li><li>HTML sürüm (<code>add_alternative</code>, autoescape <b>açık</b> Jinja): <code>&lt;p&gt;Merhaba {ad},&lt;/p&gt;&lt;ul&gt;&lt;li&gt;{urun}: {fiyat|tl}&lt;/li&gt;...&lt;/ul&gt;</code></li><li><code>tl</code> filtresi hazır verildi; iki ortama da kaydet.</li><li>Öneri listesi boşsa <code>ValueError</code> fırlat (boş bülten gönderilmez).</li></ul>',
     'start': 'from email.message import EmailMessage\nfrom jinja2 import Environment\n\n' + TL + '\ndef bulten_olustur(musteri, oneriler):\n    pass\n',
     'sol': 'from email.message import EmailMessage\nfrom jinja2 import Environment\n\n' + TL + '\nDUZ_ENV = Environment(trim_blocks=True)\nHTML_ENV = Environment(autoescape=True)\nfor _env in (DUZ_ENV, HTML_ENV):\n    _env.filters["tl"] = tl\n\nDUZ = DUZ_ENV.from_string("""Merhaba {{ ad }},\n{% for o in oneriler %}\n- {{ o.urun }}: {{ o.fiyat|tl }}\n{% endfor %}""")\nHTML = HTML_ENV.from_string("<p>Merhaba {{ ad }},</p><ul>{% for o in oneriler %}<li>{{ o.urun }}: {{ o.fiyat|tl }}</li>{% endfor %}</ul>")\n\ndef bulten_olustur(musteri, oneriler):\n    if not oneriler:\n        raise ValueError("öneri listesi boş")\n    ad = musteri["ad"]\n    msg = EmailMessage()\n    msg["From"] = "bulten@anadolumarket.com.tr"\n    msg["To"] = musteri["email"]\n    msg["Subject"] = f"{ad}, sana özel {len(oneriler)} öneri"\n    msg.set_content(DUZ.render(ad=ad, oneriler=oneriler))\n    msg.add_alternative(HTML.render(ad=ad, oneriler=oneriler), subtype="html")\n    return msg\n',
     'tests': 'oneriler = [{"urun": "Filtre kahve <1kg>", "fiyat": 349.9}, {"urun": "Çaydanlık", "fiyat": 1249}]\nm = bulten_olustur({"ad": "Ayşe", "email": "ayse@ornek.com"}, oneriler)\nassert m["From"] == "bulten@anadolumarket.com.tr" and m["To"] == "ayse@ornek.com"\nassert m["Subject"] == "Ayşe, sana özel 2 öneri", f"Konu: {m[\'Subject\']}"\nassert m.get_content_type() == "multipart/alternative", "Düz metin + HTML: multipart/alternative olmalı"\nduz = m.get_body(("plain",)).get_content().strip().splitlines()\nassert duz == ["Merhaba Ayşe,", "- Filtre kahve <1kg>: 349,90 TL", "- Çaydanlık: 1.249,00 TL"], f"Düz metin: {duz} (düz metinde kaçış olmamalı)"\nhtml = m.get_body(("html",)).get_content().strip()\nassert html == "<p>Merhaba Ayşe,</p><ul><li>Filtre kahve &lt;1kg&gt;: 349,90 TL</li><li>Çaydanlık: 1.249,00 TL</li></ul>", f"HTML: {html}"\ntry:\n    bulten_olustur({"ad": "Ali", "email": "a@b.com"}, [])\n    assert False, "Boş öneri listesinde ValueError beklenir"\nexcept ValueError:\n    pass\n',
     'hints': ['İki ayrı Environment kur: düz metin için autoescape kapalı, HTML için açık. Filtreyi ikisine de kaydet.', 'set_content(duz) sonra add_alternative(html, subtype="html").', 'Düz metin şablonunda trim_blocks=True for/endfor satırlarının boş satır bırakmasını engeller.'],
     'why': 'Aynı veriden iki çıktı (metin ve HTML) üretmek e-posta pazarlamasının standardıdır. Kaçış bağlama göredir: HTML\'de <1kg> varlığa çevrilmeli, düz metinde ise olduğu gibi kalmalıdır; bu yüzden iki ayrı ortam kullanılır.'},
]
LESSON['ex'] = EX
