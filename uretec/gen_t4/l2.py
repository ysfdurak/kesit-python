import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen_t4')
from jsgen import emit

BODY = r'''
<h2>Neden önemli?</h2>
<p>Kod bir kez yazılır, onlarca kez okunur: kod incelemesinde (code review), hata ayıklarken, altı ay sonra yeni özellik eklerken. Ilgaz Bank'ın faiz modülünü yazan kişi izne çıktığında, <code>def f(a, b, c)</code> ve içinde <code>* 0.0175</code> gibi açıklamasız sayılar gören ekip arkadaşı bir günü yalnızca "bu ne yapıyor" sorusuna harcar. Temiz kod (clean code), çalışan kodun bir üst basamağıdır: <b>doğru çalışan ve kolay anlaşılan</b> kod.</p>
<p>Python topluluğunun ortak stil kılavuzu <b>PEP 8</b>'dir (Python Enhancement Proposal 8). Kuralların çoğu zevk meselesi gibi görünür ama asıl amaç tutarlılıktır: herkes aynı biçimde yazınca göz biçime değil içeriğe odaklanır. Değişken adlandırmanın temellerini "Değişkenler" dersinde gördün; burada bütün bir programa bakıyoruz.</p>

<h2>Adlandırma kuralları</h2>
<div class="tbl-wrap"><table>
<tr><th>Ne?</th><th>Biçim</th><th>Örnek</th></tr>
<tr><td>Değişken, fonksiyon, parametre, modül</td><td>snake_case</td><td><code>aylik_taksit</code>, <code>hesap_ozeti()</code>, <code>rapor.py</code></td></tr>
<tr><td>Sınıf</td><td>PascalCase (CapWords)</td><td><code>KrediBasvurusu</code>, <code>Siparis</code></td></tr>
<tr><td>Sabit (modül düzeyinde, değişmeyen)</td><td>UPPER_CASE</td><td><code>KDV_ORANI</code>, <code>MAX_DENEME</code></td></tr>
<tr><td>"İçeride kullan" işareti</td><td>_ ile başla</td><td><code>_yardimci()</code>, <code>_onbellek</code></td></tr>
<tr><td>Kaçınılacak</td><td>l, O, I tek harfleri; yerleşik adlar</td><td><code>l = 1</code> (1 mi l mi?), <code>list = [...]</code></td></tr>
</table></div>
<p><b>Anlamlı ad</b> ise kuraldan da önemlidir. Adın uzunluğu kapsamıyla orantılı olsun: üç satırlık bir döngüde <code>i</code> yeterlidir, ama modül boyunca yaşayan bir değişken <code>d</code> olamaz. Mantıksal (bool) değerlere soru gibi okunan adlar ver: <code>odendi_mi</code>, <code>stok_var</code>. Fonksiyon adı bir fiil olsun: <code>hesapla</code>, <code>getir</code>, <code>dogrula</code>.</p>
<pre class="py">
# Önce: ne yaptığını anlamak için kodu çözmen gerekir
def f(l):
    t = 0
    for x in l:
        if x[1]:
            t += x[0]
    return t

# Sonra: adlar kodu anlatır
def odenen_toplam(faturalar):
    toplam = 0
    for tutar, odendi_mi in faturalar:
        if odendi_mi:
            toplam += tutar
    return toplam

faturalar = [(1200, True), (450, False), (300, True)]
print(f(faturalar), odenen_toplam(faturalar))
</pre>
<div class="note"><b>Türkçe ad, Türkçe karakter?</b>Python 3 adlarda ş, ğ, ı gibi harflere izin verir (<code>öğrenci_sayısı = 5</code> çalışır). Yine de çoğu ekip klavye, arama ve araç uyumu için adları ASCII yazar: <code>ogrenci_sayisi</code>. Bu uygulamada da öyle yapıyoruz. Uluslararası ekiplerde adlar genellikle İngilizcedir; önemli olan bir projede <b>tek</b> dil seçmektir.</div>

<h2>Girinti, boşluk ve satır uzunluğu</h2>
<ul>
<li>Girinti <b>4 boşluk</b>; sekme (tab) ile boşluk asla karışmaz.</li>
<li>Atama ve karşılaştırma operatörlerinin iki yanında birer boşluk: <code>toplam = a + b</code>. Varsayılan parametrede boşluk yok: <code>def f(oran=0.2)</code>.</li>
<li>Virgülden sonra boşluk, parantezin içine boşluk yok: <code>f(a, b)</code>, <code>f( a,b )</code> değil.</li>
<li>Satır en fazla <b>79 karakter</b> (birçok ekip black'in varsayılanı olan 88'i kullanır). Uzun satırı ters bölü ile değil, <b>parantez içinde</b> böl.</li>
<li>Üst düzey fonksiyon ve sınıflar arasında <b>iki</b> boş satır, sınıf içindeki metotlar arasında <b>bir</b> boş satır.</li>
</ul>
<pre class="py">
KDV_ORANI = 0.20
KARGO_UCRETI = 39.90
INDIRIM_ESIGI = 1000


def sepet_toplami(ara_toplam, uye_mi):
    indirim = 0.05 if uye_mi and ara_toplam >= INDIRIM_ESIGI else 0
    genel_toplam = (
        ara_toplam * (1 - indirim) * (1 + KDV_ORANI)
        + KARGO_UCRETI
    )
    return round(genel_toplam, 2)


print(sepet_toplami(1200, uye_mi=True))
print(sepet_toplami(400, uye_mi=False))
</pre>
<p>Operatörün satır başında olması (<code>+ KARGO_UCRETI</code>) PEP 8'in güncel önerisidir: matematikte olduğu gibi gözün hangi işlemin yapıldığını satır başında görür.</p>

<h2>Import sırası</h2>
<p>Dosyanın en üstünde, docstring'den hemen sonra, üç grup hâlinde ve aralarında birer boş satırla:</p>
<pre class="code">
"""Anadolu Market günlük ciro raporu."""

import csv                      # 1) standart kütüphane
import datetime as dt
from pathlib import Path

import pandas as pd             # 2) üçüncü taraf (pip ile kurulanlar)

from rapor.ayarlar import KDV_ORANI   # 3) projenin kendi modülleri
</pre>
<p>Her grup kendi içinde alfabetiktir; her satırda tek modül içe aktarılır (<code>import os, sys</code> değil). <code>from modul import *</code> hangi adların geldiğini gizlediği için kullanılmaz. Bu sırayı elle tutmana gerek yok: ruff (<code>ruff check --select I --fix</code>) ya da isort senin yerine dizer.</p>

<h2>Yorum ve docstring</h2>
<p>İyi yorum kodun <b>ne</b> yaptığını değil <b>neden</b> öyle yaptığını anlatır. <code># i'yi 1 artır</code> gürültüdür; <code># Banka hafta sonu çalışmadığı için valörü cumaya çekiyoruz</code> altın değerindedir. Kod değişip yorum değişmezse yorum yalan söylemeye başlar; bu yüzden kodu kendini anlatacak kadar açık yaz, yorumu iş kuralı ve tuhaflıklar için sakla.</p>
<p><b>Docstring</b>, fonksiyonun, sınıfın ya da modülün ilk satırına yazılan üç tırnaklı metindir. Yorumdan farkı: Python onu saklar, <code>help()</code> ve editörler gösterir. İlk satır tek cümlelik özettir; ardından boş satır ve ayrıntılar gelir. İki yaygın biçim vardır:</p>
<pre class="py">
def aylik_taksit(anapara, yillik_faiz, vade_ay):
    """Eşit taksitli kredinin aylık taksitini hesaplar.

    Args:
        anapara: Çekilen kredi tutarı (TL).
        yillik_faiz: Yıllık faiz oranı, 0.42 gibi ondalık.
        vade_ay: Taksit sayısı.

    Returns:
        2 ondalığa yuvarlanmış aylık taksit.

    Raises:
        ValueError: vade_ay pozitif değilse.
    """
    if vade_ay <= 0:
        raise ValueError("vade pozitif olmalı")
    r = yillik_faiz / 12
    if r == 0:
        return round(anapara / vade_ay, 2)
    return round(anapara * r / (1 - (1 + r) ** -vade_ay), 2)


print(aylik_taksit(100_000, 0.42, 12))
print(aylik_taksit.__doc__.splitlines()[0])
</pre>
<p>Yukarıdaki <b>Google stili</b>dir (Args / Returns / Raises). Veri bilimi kütüphanelerinde (numpy, pandas) yaygın olan <b>NumPy stili</b> başlıkları çizgiyle ayırır:</p>
<pre class="code">
def ortalama_sepet(tutarlar):
    """Ortalama sepet tutarını döndürür.

    Parameters
    ----------
    tutarlar : list of float
        Sipariş tutarları.

    Returns
    -------
    float
        Ortalama; liste boşsa 0.0.
    """
</pre>
<p>Hangisini seçtiğin değil, projede <b>tek</b> birini tutarlı kullanman önemlidir. Tip ipuçları (type hints) da belgelemenin parçasıdır: <code>def aylik_taksit(anapara: float, yillik_faiz: float, vade_ay: int) -&gt; float</code> yazınca docstring'de türleri tekrar etmene gerek kalmaz.</p>

<h2>Sihirli sayılardan kaçın</h2>
<p>Kodun ortasındaki açıklamasız sayı "sihirli sayı"dır (magic number). <code>if puan &gt; 1250</code> satırında 1250'nin ne olduğunu bilen tek kişi yazandır. Sayıyı adı olan bir sabite taşı: hem anlam kazanır hem de değiştiğinde tek yerden güncellenir.</p>
<pre class="py">
# Önce
def kart_limiti(gelir):
    if gelir > 85000:
        return gelir * 3
    return gelir * 1.5

# Sonra
YUKSEK_GELIR_ESIGI = 85_000
YUKSEK_GELIR_CARPANI = 3
STANDART_CARPAN = 1.5

def kart_limiti_temiz(aylik_gelir):
    if aylik_gelir > YUKSEK_GELIR_ESIGI:
        return aylik_gelir * YUKSEK_GELIR_CARPANI
    return aylik_gelir * STANDART_CARPAN

print(kart_limiti(90000) == kart_limiti_temiz(90000), kart_limiti_temiz(40000))
</pre>
<p>0, 1, -1 gibi bariz değerler ve <code>range(len(x))</code> gibi kullanımlar sabite çevrilmez; kural "anlamı açık olmayan sayı"lar içindir. <code>85_000</code> yazımı da bir stil inceliğidir: alt çizgi sayıyı okunur yapar, değerini değiştirmez.</p>

<h2>Küçük fonksiyon, DRY, erken dönüş</h2>
<p><b>Tek sorumluluk:</b> bir fonksiyon tek iş yapsın ve adı o işi söylesin. Adında "ve" geçiyorsa (<code>oku_ve_hesapla_ve_yazdir</code>) bölme zamanıdır. Kabaca ekrana sığmayan fonksiyon, büyük olasılıkla fazla iş yapıyordur.</p>
<p><b>DRY</b> (Don't Repeat Yourself, kendini tekrar etme): aynı mantık iki yerde yazılırsa bir gün yalnızca birinde güncellenir ve iki yer birbirini tutmaz. Üç kez kopyalanmış bir blok, bir fonksiyonun habercisidir.</p>
<p><b>Erken dönüş</b> (early return, guard clause): iç içe if merdiveni yerine geçersiz durumları başta eleyip ana yolu düz bırak.</p>
<pre class="py">
# Önce: iç içe merdiven
def kredi_karari_eski(yas, gelir, borc_orani):
    if yas >= 18:
        if gelir >= 20000:
            if borc_orani <= 0.5:
                return "ön onay"
            else:
                return "red: borç"
        else:
            return "red: gelir"
    else:
        return "red: yaş"

# Sonra: erken dönüş
def kredi_karari(yas, gelir, borc_orani):
    if yas < 18:
        return "red: yaş"
    if gelir < 20000:
        return "red: gelir"
    if borc_orani > 0.5:
        return "red: borç"
    return "ön onay"

for basvuru in [(17, 50000, 0.1), (30, 15000, 0.1), (30, 40000, 0.7), (30, 40000, 0.2)]:
    print(kredi_karari(*basvuru), kredi_karari_eski(*basvuru) == kredi_karari(*basvuru))
</pre>

<h2>Zen of Python</h2>
<p>Python'ın tasarım felsefesi 19 kısa ilkeyle yorumlayıcının içine gömülüdür. Çalıştır ve oku:</p>
<pre class="py">
import this
</pre>
<p>En çok alıntılananlar: <i>Beautiful is better than ugly</i> (güzel, çirkinden iyidir), <i>Explicit is better than implicit</i> (açık olan örtük olandan iyidir: <code>from x import *</code> bu yüzden kötüdür), <i>Readability counts</i> (okunabilirlik önemlidir), <i>Errors should never pass silently</i> (hatalar sessizce geçmemeli: çıplak <code>except: pass</code> bu yüzden kötüdür), <i>There should be one obvious way to do it</i> (bir işi yapmanın tek bariz yolu olmalı).</p>

<h2>ruff ve black: stili makineye bırak</h2>
<p>Kuralları ezberlemek yerine araçlara uygulat. <b>black</b> bir biçimlendiricidir (formatter): kodu tek ve tartışmasız bir stile sokar. <b>ruff</b> ise çok hızlı bir denetleyicidir (linter): kullanılmayan import, tanımsız ad, etkisiz ifade, import sırası gibi yüzlerce kuralı denetler; <code>ruff format</code> ile black uyumlu biçimlendirme de yapar.</p>
<pre class="code">
pip install ruff black
ruff check .              # sorunları listele
ruff check . --fix        # düzeltilebilenleri düzelt
ruff format .             # biçimlendir (black uyumlu)
black rapor.py            # ya da yalnızca black
</pre>
<p>Ayarlar proje kökündeki <code>pyproject.toml</code> içinde tutulur, böylece ekipteki herkes aynı kuralları kullanır:</p>
<pre class="code">
[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "N", "B"]   # pycodestyle, pyflakes, import, adlandırma, bugbear
</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>ruff ve black tarayıcıda çalışmaz; terminalde <code>pip install ruff</code> ile kur. VS Code'da "Ruff" eklentisini kurup "Format on Save" açarsan her kayıtta dosya kendiliğinden düzelir. Bu derste bazı denetimleri Python'ın kendi <code>re</code> ve <code>ast</code> modülleriyle nasıl yapabileceğini alıştırmalarda göreceksin.</div>
<div class="tip"><b>Biçim tartışmasını kapat</b>"Bu virgülden sonra boşluk olmalı mı" tartışması kod incelemesinde vakit kaybıdır. Formatter'ı ekip kuralı yapınca bu yorumlar tamamen ortadan kalkar ve inceleme mantığa odaklanır.</div>

<div class="note"><b>Gerçek işte</b>Çoğu şirkette kod, ana dala birleşmeden önce otomatik denetimden geçer: pre-commit kancası commit anında ruff ve black'i çalıştırır, CI hattı (GitHub Actions gibi) stil hatası olan değişikliği kırmızıya boyar. Kod incelemesinde en sık yazılan yorumlar da bu dersin konularıdır: "bu sayının adı ne olmalı?", "bu fonksiyon iki iş yapıyor", "bu blok şurada da var". İş görüşmelerinde verilen ev ödevlerinde (take-home) çalışan ama dağınık kod, çalışan ve temiz koda neredeyse her zaman kaybeder.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tutarlılık, kuraldan önce gelir</h3>
<p>PEP 8'in kendisi bir bölümüne "A Foolish Consistency is the Hobgoblin of Little Minds" başlığını koyar: proje içi tutarlılık PEP 8'den, fonksiyon içi tutarlılık proje kuralından önemlidir. Eski bir kod tabanına camelCase ile yazılmışsa, tek fonksiyonu snake_case'e çevirmek karmaşayı artırır; ya hepsini (bir araçla, ayrı bir değişiklikte) çevirirsin ya da mevcut stile uyarsın.</p>
<h3>Bilişsel karmaşıklık</h3>
<p>Kodun zorluğunu satır sayısı değil, okurun aklında aynı anda tutması gereken şey sayısı belirler. Her iç içe if, her döngü, her bayrak (flag) değişkeni bu yükü artırır. Erken dönüş, küçük yardımcı fonksiyonlar ve anlamlı ara değişkenler (<code>uygun_mu = yas &gt;= 18 and gelir &gt;= ESIK</code>) yükü azaltır. ruff'ın <code>C901</code> kuralı karmaşıklığı sayıp sınırı aşan fonksiyonları işaretler.</p>
<h3>Yeniden düzenleme (refactoring) güvenli yapılır</h3>
<p>Refactor, davranışı değiştirmeden yapıyı iyileştirmektir. Güvenli yolu: önce mevcut davranışı test et, küçük bir adım at, testleri çalıştır, tekrarla. Bu dersin refactor alıştırmaları tam olarak bunu yapar: testler hem eski davranışın korunduğunu hem de yapının düzeldiğini denetler. Orta seviyedeki "Test yazma" dersinde bu güvenlik ağını kendin kuracaksın.</p>
</section>
'''

EX = []
A = EX.append

# ---------- Isınma ----------
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'Modül düzeyinde tanımlanan ve program boyunca değişmeyen KDV oranı için PEP 8\'e uygun ad hangisidir?',
   'o': ['kdvOrani', 'KdvOrani', 'KDV_ORANI', 'kdv_orani'], 'a': 2,
   'why': 'Sabitler UPPER_CASE yazılır. kdvOrani camelCase\'dir ve Python\'da kullanılmaz; KdvOrani sınıf adı gibi okunur; kdv_orani değişken için doğrudur ama sabit olduğunu belli etmez.'})
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'PEP 8\'e göre import grupları dosyanın başında hangi sırayla yazılır?',
   'o': ['Yerel modüller, üçüncü taraf, standart kütüphane', 'Standart kütüphane, üçüncü taraf, yerel modüller', 'Tamamen alfabetik; gruplamaya gerek yok', 'Üçüncü taraf, standart kütüphane, yerel modüller'], 'a': 1,
   'why': 'Önce standart kütüphane (csv, json), sonra pip ile kurulan üçüncü taraf paketler (pandas), en son projenin kendi modülleri gelir; gruplar arasında birer boş satır bulunur ve her grup kendi içinde alfabetiktir.'})
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'Aşağıdaki yorumlardan hangisi koda en çok değer katar?',
   'o': ['# i değişkenini bir artırıyoruz çünkü döngü devam ediyor', '# Banka hafta sonu çalışmadığından valörü cumaya çekiyoruz', '# liste sort metodu ile küçükten büyüğe sıralanıyor', '# bu fonksiyon hesap yapar'], 'a': 1,
   'why': 'İyi yorum kodun neden öyle yazıldığını, yani koddan okunamayan iş kuralını anlatır. Diğerleri kodun zaten açıkça söylediğini tekrarlar ya da hiçbir şey söylemez.'})

# ---------- Kodu oku ----------
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'Docstring Python tarafından saklanır. Bu kod ne yazdırır?',
   'code': '''
def kdv_ekle(tutar, oran=0.20):
    """KDV dahil tutarı döndürür.

    Args:
        tutar: KDV hariç tutar (TL).
        oran: KDV oranı, 0-1 arası.
    """
    return round(tutar * (1 + oran), 2)

print(kdv_ekle.__doc__.splitlines()[0])
print(kdv_ekle(100))
''',
   'o': ['KDV dahil tutarı döndürür.\n120.0', 'None\n120.0', '"""KDV dahil tutarı döndürür.\n120.0', 'KDV dahil tutarı döndürür.\n120'],
   'a': 0,
   'why': 'Fonksiyonun ilk ifadesi olan metin __doc__ niteliğinde saklanır (tırnaklar olmadan). splitlines()[0] özet satırını verir. 100 * 1.2 float çarpımı olduğu için sonuç 120.0\'dır.'})
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'Erken dönüşlü (guard clause) bu fonksiyon ne yazdırır?',
   'code': '''
def kargo_durumu(siparis):
    if siparis is None:
        return "sipariş yok"
    if not siparis.get("odendi"):
        return "ödeme bekleniyor"
    if siparis.get("stok", 0) == 0:
        return "stok bekleniyor"
    return "kargoya hazır"

print(kargo_durumu({"odendi": True, "stok": 0}))
print(kargo_durumu({"stok": 3}))
''',
   'o': ['kargoya hazır\nkargoya hazır', 'stok bekleniyor\nödeme bekleniyor', 'stok bekleniyor\nkargoya hazır', 'ödeme bekleniyor\nstok bekleniyor'],
   'a': 1,
   'why': 'Koşullar yukarıdan aşağı denenir, ilk tutan return fonksiyonu bitirir. İlk siparişte ödeme var ama stok 0; ikincide "odendi" anahtarı yok, get None döndürür ve not None True olur.'})
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'Geçerli ad (Python kabul eder) ile PEP 8\'e uygun ad aynı şey değildir. Bu kod ne yazdırır?',
   'code': '''
print("hesaplaToplam".isidentifier(), "2tutar".isidentifier(), "aylik_taksit".islower())
''',
   'o': ['False False True', 'True False True', 'True True True', 'True False False'],
   'a': 1,
   'why': 'hesaplaToplam geçerli bir Python adıdır (yalnızca PEP 8\'e aykırıdır), rakamla başlayan 2tutar geçersizdir. islower() harflerin hepsi küçükse True döner; alt çizgi harf olmadığından sonucu etkilemez.'})
A({'t': 'order', 'stage': 'Kodu oku',
   'q': '<p>PEP 8\'e uygun küçük bir modülün satırlarını sırala: import, sabit, docstring\'li fonksiyon, <code>__main__</code> bloğu.</p>',
   'lines': ['import math', 'KUTU_KAPASITESI = 12', 'def kutu_sayisi(adet):', '    """Adet ürün için gereken kutu sayısını döndürür."""',
             '    return math.ceil(adet / KUTU_KAPASITESI)', 'if __name__ == "__main__":', '    print(kutu_sayisi(30))'],
   'tests': '''
assert kutu_sayisi.__doc__ == "Adet ürün için gereken kutu sayısını döndürür.", "Docstring fonksiyonun İLK satırı olmalı"
assert kutu_sayisi(24) == 2 and kutu_sayisi(25) == 3, "kutu_sayisi yukarı yuvarlamalı"
''',
   'expect': '3',
   'hint': 'PEP 8 sırası: import\'lar, sonra sabitler, sonra fonksiyonlar, en sonda betik olarak çalıştırılınca devreye giren blok. Docstring, def satırının hemen altında olmalı.',
   'why': 'İçe aktarmalar en üstte, sabitler onların altında, ardından tanımlar gelir. Docstring yalnızca gövdenin ilk ifadesi olduğunda __doc__ olarak saklanır. __main__ bloğu dosya import edildiğinde çalışmaz.'})

# ---------- Rehberli ----------
A({'t': 'code', 'stage': 'Rehberli', 'id': 'kod-stili-r1', 'diff': 2,
   'q': '<p>Bir adın hangi adlandırma biçiminde olduğunu bulan <code>ad_turu(ad)</code> fonksiyonunu <code>re.fullmatch</code> ile yaz. Dönüş değerleri:</p><ul><li><code>"snake_case"</code>: küçük harfle başlar; küçük harf, rakam ve tek alt çizgilerle ayrılmış parçalar (<code>aylik_taksit</code>, <code>x</code>, <code>kdv_orani2</code>)</li><li><code>"UPPER_CASE"</code>: büyük harfle başlar; büyük harf, rakam ve alt çizgiler (<code>KDV_ORANI</code>, <code>MAX</code>)</li><li><code>"PascalCase"</code>: her parça büyük harf + en az bir küçük harf/rakam (<code>KrediBasvurusu</code>, <code>Hesap</code>)</li><li>Hiçbiri değilse <code>"diğer"</code> (<code>toplamTutar</code>, <code>Kdv_Orani</code>, <code>_gizli</code>)</li></ul>',
   'guide': ['Her biçim için bir desen yaz: snake için [a-z][a-z0-9]*(_[a-z0-9]+)*', 'UPPER için aynı deseni büyük harflerle yaz.', 'PascalCase için ([A-Z][a-z0-9]+)+ deseni yeterli.', 're.fullmatch ile sırayla dene; eşleşen ilk biçimi döndür, hiçbiri yoksa "diğer".'],
   'example': '''
import re

PLAKA = r"\\d{2} [A-Z]{1,3} \\d{2,4}"
for metin in ["34 ABC 123", "34abc123", "06 A 1234"]:
    print(metin, bool(re.fullmatch(PLAKA, metin)))
''',
   'start': '''
import re

SNAKE = r"[a-z][a-z0-9]*(_[a-z0-9]+)*"
# TODO: UPPER = ...
# TODO: PASCAL = ...

def ad_turu(ad):
    if re.fullmatch(SNAKE, ad):
        return "snake_case"
    # TODO: UPPER_CASE ve PascalCase kontrolleri
    return "diğer"
''',
   'sol': '''
import re

SNAKE = r"[a-z][a-z0-9]*(_[a-z0-9]+)*"
UPPER = r"[A-Z][A-Z0-9]*(_[A-Z0-9]+)*"
PASCAL = r"([A-Z][a-z0-9]+)+"

def ad_turu(ad):
    if re.fullmatch(SNAKE, ad):
        return "snake_case"
    if re.fullmatch(UPPER, ad):
        return "UPPER_CASE"
    if re.fullmatch(PASCAL, ad):
        return "PascalCase"
    return "diğer"
''',
   'tests': '''
for ad in ["aylik_taksit", "x", "kdv_orani2", "rapor"]:
    assert ad_turu(ad) == "snake_case", ad + " snake_case olmalı"
for ad in ["KDV_ORANI", "MAX", "HTTP_404"]:
    assert ad_turu(ad) == "UPPER_CASE", ad + " UPPER_CASE olmalı"
for ad in ["KrediBasvurusu", "Hesap", "Siparis2"]:
    assert ad_turu(ad) == "PascalCase", ad + " PascalCase olmalı"
for ad in ["toplamTutar", "Kdv_Orani", "_gizli", "aylik__taksit", "2tutar"]:
    assert ad_turu(ad) == "diğer", ad + " hiçbir biçime uymuyor: diğer olmalı"
''',
   'hints': ['re.fullmatch metnin TAMAMI desene uyarsa eşleşme döndürür, yoksa None.', 'UPPER deseni snake deseninin büyük harfli kopyasıdır: [A-Z][A-Z0-9]*(_[A-Z0-9]+)*', 'PASCAL = r"([A-Z][a-z0-9]+)+" ve if re.fullmatch(PASCAL, ad): return "PascalCase"'],
   'why': 'Linter\'ların adlandırma kuralları (ruff N kuralları, pep8-naming) tam olarak bu tür desenlerle çalışır. fullmatch kullanmak önemlidir; match yalnızca başı denetler ve "aylikTaksit"i snake sanabilir.'})

A({'t': 'code', 'stage': 'Rehberli', 'id': 'kod-stili-r2', 'diff': 2,
   'q': '<p>Kod incelemesinde "docstring\'i olmayan fonksiyonlar" listesini otomatik çıkar. <code>docstringsiz_fonksiyonlar(kaynak)</code> Python kaynak kodunu metin olarak alsın, docstring\'i olmayan tüm fonksiyonların (iç içe ve sınıf metotları dahil) adlarını <b>kaynaktaki satır sırasına göre</b> liste olarak döndürsün. <code>ast</code> modülünü kullan.</p>',
   'guide': ['ast.parse(kaynak) ile sözdizimi ağacını oluştur.', 'ast.walk(agac) ile tüm düğümleri gez.', 'Düğüm ast.FunctionDef ya da ast.AsyncFunctionDef ise ast.get_docstring(dugum) ile docstring\'e bak.', 'None ise (satır_no, ad) olarak biriktir; sonunda satır numarasına göre sıralayıp yalnızca adları döndür.'],
   'example': '''
import ast

kaynak = "import json\\nx = 1\\ndef f():\\n    return x\\nclass Hesap:\\n    pass\\n"
agac = ast.parse(kaynak)
for dugum in ast.walk(agac):
    if isinstance(dugum, ast.ClassDef):
        print("sınıf:", dugum.name, "satır", dugum.lineno, "docstring:", ast.get_docstring(dugum))
''',
   'start': '''
import ast

def docstringsiz_fonksiyonlar(kaynak):
    agac = ast.parse(kaynak)
    bulunan = []
    for dugum in ast.walk(agac):
        # TODO: dugum bir fonksiyon tanımı mı? (FunctionDef / AsyncFunctionDef)
        # TODO: ast.get_docstring(dugum) None ise (satır, ad) ekle
        pass
    # TODO: satıra göre sırala, yalnızca adları döndür
    return []
''',
   'sol': '''
import ast

def docstringsiz_fonksiyonlar(kaynak):
    agac = ast.parse(kaynak)
    bulunan = []
    for dugum in ast.walk(agac):
        if isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if ast.get_docstring(dugum) is None:
                bulunan.append((dugum.lineno, dugum.name))
    bulunan.sort()
    return [ad for _, ad in bulunan]
''',
   'tests': '''
kod = """
def toplam(a, b):
    \\"\\"\\"İki sayıyı toplar.\\"\\"\\"
    return a + b

def fark(a, b):
    # yorum docstring değildir
    return a - b

class Hesap:
    \\"\\"\\"Banka hesabı.\\"\\"\\"
    def yatir(self, tutar):
        def _kontrol(t):
            return t > 0
        return _kontrol(tutar)

    def bakiye(self):
        \\"\\"\\"Bakiyeyi döndürür.\\"\\"\\"
        return 0
"""
assert docstringsiz_fonksiyonlar(kod) == ["fark", "yatir", "_kontrol"], "Beklenen ['fark', 'yatir', '_kontrol'] (satır sırasıyla), gelen " + str(docstringsiz_fonksiyonlar(kod))
assert docstringsiz_fonksiyonlar("x = 1\\n") == [], "Fonksiyon yoksa boş liste"
assert docstringsiz_fonksiyonlar("async def getir():\\n    return 1\\n") == ["getir"], "async fonksiyonlar da sayılmalı"
''',
   'hints': ['ast.walk tüm düğümleri (iç içe olanlar dahil) gezer ama sırası kaynaktaki sıra değildir; bu yüzden lineno ile sıralaman gerekir.', 'isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)) ve ast.get_docstring(dugum) is None', 'bulunan.append((dugum.lineno, dugum.name)); bulunan.sort(); return [ad for _, ad in bulunan]'],
   'why': 'ast, kodu metin olarak değil yapı olarak okur: yorum ile docstring\'i, fonksiyon ile değişkeni ayırt eder. ruff\'ın D (pydocstyle) kuralları ve birçok kalite aracı tam olarak bu ağaç üzerinde çalışır.'})

A({'t': 'code', 'stage': 'Rehberli', 'id': 'kod-stili-r3', 'diff': 2,
   'q': '<p><b>Refactor:</b> İskeletteki <code>f(a, s)</code> fonksiyonu Anadolu Market\'in kargo ücretini doğru hesaplıyor ama okunmuyor. Davranışı <b>aynen koruyarak</b> <code>kargo_ucreti(agirlik_kg, sehir)</code> fonksiyonunu yaz ve sihirli sayıları şu modül sabitlerine taşı:</p><ul><li><code>TABAN_UCRET = 40</code>, <code>KG_BASI_EK = 12</code>, <code>UZAK_BOLGE_EK = 25</code></li><li><code>UZAK_SEHIRLER = ("Van", "Hakkari")</code></li></ul><p>Testler, fonksiyon gövdesinde 0 ve 1 dışında sayı kalmadığını da denetler.</p>',
   'guide': ['Dört sabiti dosyanın üstünde tanımla.', 'Ağırlık 1 kg\'ı aşıyorsa aşan her kg için KG_BASI_EK eklenir; ek ücreti ayrı bir değişkende hesapla.', 'Şehir UZAK_SEHIRLER içindeyse UZAK_BOLGE_EK ekle (in ile).', 'Toplamı döndür; eski f fonksiyonunu silebilirsin.'],
   'example': '''
SAATLIK_UCRET = 250
MESAI_CARPANI = 1.5
NORMAL_SAAT = 45

def haftalik_ucret(calisilan_saat):
    fazla_mesai = max(0, calisilan_saat - NORMAL_SAAT)
    normal = calisilan_saat - fazla_mesai
    return normal * SAATLIK_UCRET + fazla_mesai * SAATLIK_UCRET * MESAI_CARPANI

print(haftalik_ucret(40), haftalik_ucret(50))
''',
   'start': '''
def f(a, s):
    if s == "Van" or s == "Hakkari":
        return 40 + (a - 1) * 12 + 25 if a > 1 else 40 + 25
    else:
        return 40 + (a - 1) * 12 if a > 1 else 40

# TODO: sabitleri tanımla
# TODO: def kargo_ucreti(agirlik_kg, sehir): ...
''',
   'sol': '''
TABAN_UCRET = 40
KG_BASI_EK = 12
UZAK_BOLGE_EK = 25
UZAK_SEHIRLER = ("Van", "Hakkari")


def kargo_ucreti(agirlik_kg, sehir):
    """Ağırlık ve şehre göre kargo ücretini döndürür."""
    ek_kilo = max(0, agirlik_kg - 1)
    ucret = TABAN_UCRET + ek_kilo * KG_BASI_EK
    if sehir in UZAK_SEHIRLER:
        ucret += UZAK_BOLGE_EK
    return ucret
''',
   'tests': '''
import ast

def _eski(a, s):
    if s == "Van" or s == "Hakkari":
        return 40 + (a - 1) * 12 + 25 if a > 1 else 40 + 25
    return 40 + (a - 1) * 12 if a > 1 else 40

assert (TABAN_UCRET, KG_BASI_EK, UZAK_BOLGE_EK) == (40, 12, 25), "Sabit değerleri görevdeki gibi olmalı"
assert set(UZAK_SEHIRLER) == {"Van", "Hakkari"}, "UZAK_SEHIRLER Van ve Hakkari'yi içermeli"
for agirlik in [0.5, 1, 2, 3.5, 10]:
    for sehir in ["İzmir", "Van", "Hakkari", "Ankara"]:
        assert abs(kargo_ucreti(agirlik, sehir) - _eski(agirlik, sehir)) < 1e-9, f"Davranış değişti: {agirlik} kg, {sehir}"
_fn = [d for d in ast.walk(ast.parse(__source__)) if isinstance(d, ast.FunctionDef) and d.name == "kargo_ucreti"][0]
_sayilar = [d.value for d in ast.walk(_fn) if isinstance(d, ast.Constant) and type(d.value) in (int, float)]
assert all(v in (0, 1) for v in _sayilar), "kargo_ucreti içinde sihirli sayı kaldı: " + str([v for v in _sayilar if v not in (0, 1)])
''',
   'hints': ['Önce sabitleri yaz, sonra eski formüldeki 40, 12, 25 yerine adlarını koy.', 'a > 1 ise (a - 1) * 12, değilse 0: bunu max(0, agirlik_kg - 1) * KG_BASI_EK ile tek ifadede yazabilirsin.', 'if sehir in UZAK_SEHIRLER: ucret += UZAK_BOLGE_EK'],
   'why': 'Davranış aynı, ama artık ücret değişince tek satır güncellenir ve kod iş kuralını kendisi anlatır. Eski koddaki iki dallı tekrar da (DRY ihlali) ortadan kalktı.'})

# ---------- Kendin yaz ----------
A({'t': 'code', 'stage': 'Kendin yaz', 'id': 'kod-stili-k1', 'diff': 2,
   'q': '<p><b>Erken dönüşle yeniden yaz.</b> Ilgaz Bank\'ın ön onay kuralları, sırasıyla:</p><ol><li><code>yas &lt; 18</code> → <code>"red: yaş"</code></li><li><code>aylik_gelir &lt; 20000</code> → <code>"red: gelir"</code></li><li><code>borc_orani &gt; 0.5</code> → <code>"red: borç"</code></li><li>Hepsi geçerse → <code>"ön onay"</code></li></ol><p><code>kredi_on_onay(yas, aylik_gelir, borc_orani)</code> fonksiyonunu <b>else ve elif kullanmadan</b>, iç içe if olmadan (her if fonksiyon gövdesinin doğrudan içinde) yaz.</p>',
   'start': '''
def kredi_on_onay(yas, aylik_gelir, borc_orani):
    if yas >= 18:
        if aylik_gelir >= 20000:
            if borc_orani <= 0.5:
                return "ön onay"
            else:
                return "red: borç"
        else:
            return "red: gelir"
    else:
        return "red: yaş"
''',
   'sol': '''
def kredi_on_onay(yas, aylik_gelir, borc_orani):
    if yas < 18:
        return "red: yaş"
    if aylik_gelir < 20000:
        return "red: gelir"
    if borc_orani > 0.5:
        return "red: borç"
    return "ön onay"
''',
   'tests': '''
import ast
assert kredi_on_onay(17, 50000, 0.1) == "red: yaş", "17 yaş reddedilmeli"
assert kredi_on_onay(30, 15000, 0.1) == "red: gelir", "Düşük gelir reddedilmeli"
assert kredi_on_onay(30, 40000, 0.7) == "red: borç", "Yüksek borç oranı reddedilmeli"
assert kredi_on_onay(18, 20000, 0.5) == "ön onay", "Sınır değerler (18, 20000, 0.5) onaylanmalı"
assert kredi_on_onay(16, 1000, 0.9) == "red: yaş", "Kurallar sırayla denetlenmeli: önce yaş"
_fn = [d for d in ast.walk(ast.parse(__source__)) if isinstance(d, ast.FunctionDef) and d.name == "kredi_on_onay"][0]
_ifler = [d for d in ast.walk(_fn) if isinstance(d, ast.If)]
assert all(not d.orelse for d in _ifler), "else/elif kullanma: geçersiz durumu return ile erkenden ele"
assert all(d in _fn.body for d in _ifler), "İç içe if olmamalı; her if fonksiyon gövdesinin doğrudan içinde olmalı"
''',
   'hints': ['Koşulları tersine çevir: "yaş 18 ve üstüyse devam" yerine "18\'den küçükse hemen reddet".', 'Her red durumu kendi if\'i ve return\'üyle; en sonda koşulsuz return "ön onay".'],
   'why': 'Erken dönüşle her kural tek satırda okunur, yeni kural eklemek bir if eklemek kadar kolaydır ve girinti hiç derinleşmez. İç içe merdivende ise hangi else\'in hangi if\'e ait olduğunu takip etmek gerekir.'})

A({'t': 'code', 'stage': 'Kendin yaz', 'id': 'kod-stili-k2', 'diff': 1,
   'q': '<p>Küçük bir stil denetleyicisi: <code>uzun_satirlar(kaynak, sinir=79)</code> kaynak metindeki satırlardan uzunluğu <code>sinir</code>\'ı <b>aşan</b> satırların numaralarını (1\'den başlayarak) liste olarak döndürsün. Satır sonundaki boşluklar da uzunluğa dahildir; satır sonu karakteri dahil değildir.</p>',
   'start': '''
def uzun_satirlar(kaynak, sinir=79):
    pass
''',
   'sol': '''
def uzun_satirlar(kaynak, sinir=79):
    return [no for no, satir in enumerate(kaynak.splitlines(), start=1) if len(satir) > sinir]
''',
   'tests': '''
kod = "x = 1\\n" + "y = " + "1 + " * 20 + "1\\n" + "\\n" + "z = 2" + " " * 80 + "\\n"
assert uzun_satirlar(kod) == [2, 4], "2. satır uzun, 4. satır sondaki boşluklar yüzünden uzun: [2, 4] beklenir; gelen " + str(uzun_satirlar(kod))
assert uzun_satirlar("a" * 79) == [], "Tam 79 karakter sınırı AŞMAZ"
assert uzun_satirlar("a" * 80) == [1], "80 karakter sınırı aşar"
assert uzun_satirlar("kisa\\n" + "b" * 90, sinir=88) == [2], "sinir parametresi kullanılmalı"
assert uzun_satirlar("") == [], "Boş metinde boş liste"
''',
   'hints': ['splitlines() satırları satır sonu olmadan verir; enumerate(..., start=1) 1\'den numaralandırır.', 'Koşul len(satir) > sinir (eşitlik serbest).'],
   'why': 'pycodestyle\'ın E501 kuralı bu kadar basittir. Liste kavrayışı (list comprehension) ile tek satırda yazılabilir; bu yapıyı orta seviyede ayrıntılı göreceksin.'})

A({'t': 'code', 'stage': 'Kendin yaz', 'id': 'kod-stili-k3', 'diff': 2,
   'q': '<p><b>DRY refactor.</b> Ekipteki bir rapor betiği aynı bloğu her şehir için kopyalamış:</p><pre class="out">izmir_adet = 0\nizmir_toplam = 0\nfor s in siparisler:\n    if s["sehir"] == "İzmir":\n        izmir_adet += 1\n        izmir_toplam += s["tutar"]\nprint("İzmir: " + str(izmir_adet) + " sipariş, " + str(round(izmir_toplam, 2)) + " TL")\n# ... aynısı Ankara ve Bursa için ...</pre><p>Bunun yerine iki fonksiyon yaz:</p><ul><li><code>sehir_raporu(siparisler, sehir)</code> → <code>"İzmir: 2 sipariş, 420.50 TL"</code> biçiminde metin (tutar her zaman 2 ondalık)</li><li><code>tum_raporlar(siparisler, sehirler)</code> → her şehir için bir satır içeren liste</li></ul><p>Kodunda şehir adı (İzmir, Ankara, Bursa) <b>hiç geçmemeli</b>.</p>',
   'start': '''
def sehir_raporu(siparisler, sehir):
    pass


def tum_raporlar(siparisler, sehirler):
    pass
''',
   'sol': '''
def sehir_raporu(siparisler, sehir):
    """Bir şehrin sipariş sayısını ve cirosunu tek satırlık metin olarak döndürür."""
    adet = 0
    toplam = 0
    for siparis in siparisler:
        if siparis["sehir"] == sehir:
            adet += 1
            toplam += siparis["tutar"]
    return f"{sehir}: {adet} sipariş, {toplam:.2f} TL"


def tum_raporlar(siparisler, sehirler):
    """Her şehir için rapor satırlarını liste olarak döndürür."""
    return [sehir_raporu(siparisler, sehir) for sehir in sehirler]
''',
   'tests': '''
sip = [
    {"sehir": "İzmir", "tutar": 300},
    {"sehir": "Ankara", "tutar": 150.25},
    {"sehir": "İzmir", "tutar": 120.5},
]
assert sehir_raporu(sip, "İzmir") == "İzmir: 2 sipariş, 420.50 TL", "Biçim: 'İzmir: 2 sipariş, 420.50 TL'; gelen " + repr(sehir_raporu(sip, "İzmir"))
assert sehir_raporu(sip, "Bursa") == "Bursa: 0 sipariş, 0.00 TL", "Siparişi olmayan şehir: 0 sipariş, 0.00 TL"
assert tum_raporlar(sip, ["Ankara", "Bursa"]) == ["Ankara: 1 sipariş, 150.25 TL", "Bursa: 0 sipariş, 0.00 TL"], "tum_raporlar her şehir için bir satır döndürmeli"
for ad in ["İzmir", "Ankara", "Bursa"]:
    assert ad not in __source__, ad + " kodda geçmemeli: şehir bir parametredir, sabit kodlanmamalı"
''',
   'hints': ['Değişen tek şey şehir adı: onu parametre yap.', 'f-string\'te {toplam:.2f} her zaman 2 ondalık yazar.'],
   'why': 'Tekrarlanan blok bir fonksiyona dönüşünce yeni şehir eklemek tek kelimelik bir değişiklik olur ve biçim değişikliği tek yerden yapılır.'})

# ---------- Hata avı ----------
A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kod-stili-b1', 'diff': 1,
   'q': '<p><b>Hatayı bul ve düzelt.</b> KDV oranı geçen yıl %18\'den %20\'ye çıktı. Muhasebe, sepet toplamı ile ürün fiyatlarının toplamının tutmadığını bildirdi. Sorunu düzelt ve bir daha olmaması için oranı tek bir <code>KDV_ORANI = 0.20</code> sabitine taşı; üç fonksiyon da onu kullansın.</p>',
   'start': '''
def urun_fiyati(net):
    return round(net * 1.20, 2)


def sepet_toplami(netler):
    return round(sum(netler) * 1.18, 2)


def fatura_satiri(urun, net):
    return f"{urun}: {round(net * 1.20, 2)} TL"
''',
   'sol': '''
KDV_ORANI = 0.20


def urun_fiyati(net):
    return round(net * (1 + KDV_ORANI), 2)


def sepet_toplami(netler):
    return round(sum(netler) * (1 + KDV_ORANI), 2)


def fatura_satiri(urun, net):
    return f"{urun}: {urun_fiyati(net)} TL"
''',
   'tests': '''
assert sepet_toplami([100, 50]) == 180.0, "150 TL net, %20 KDV ile 180.0 olmalı"
assert urun_fiyati(100) == 120.0, "100 TL net ürün 120.0 olmalı"
assert fatura_satiri("Çay", 50) == "Çay: 60.0 TL", "Fatura satırı 'Çay: 60.0 TL' olmalı"
assert KDV_ORANI == 0.20, "KDV_ORANI sabiti 0.20 olmalı"
assert "1.18" not in __source__ and "1.20" not in __source__ and "1.2)" not in __source__, "Oran sayı olarak tekrar yazılmamalı; KDV_ORANI sabitini kullan"
''',
   'hints': ['Üç fonksiyondaki çarpanları karşılaştır: biri farklı.', 'Sabiti dosyanın başında tanımla ve çarpanı (1 + KDV_ORANI) olarak yaz.'],
   'why': 'Aynı sayı üç yerde yazılınca oran değiştiğinde biri unutuldu: DRY ihlalinin tipik sonucu. Sabit, bilginin tek kaynağı (single source of truth) olur.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kod-stili-b2', 'diff': 2,
   'q': '<p><b>Hatayı bul ve düzelt.</b> IBAN\'ın ülke kodunu kontrol eden fonksiyon <code>"TR33..."</code> için bazen "yurt dışı" diyor, <code>eksik_mi</code> ise PEP 8 denetiminden geçmiyor. PEP 8 kuralı: <code>is</code> yalnızca <code>None</code> gibi tekil nesnelerle, değer karşılaştırması <code>==</code> ile yapılır.</p>',
   'start': '''
def iban_bolgesi(iban):
    """TR ile başlayan IBAN'ları yurt içi sayar."""
    ulke = iban.replace(" ", "")[:2].upper()
    if ulke is "TR":
        return "yurt içi"
    return "yurt dışı"


def eksik_mi(deger):
    return deger == None or deger == ""
''',
   'sol': '''
def iban_bolgesi(iban):
    """TR ile başlayan IBAN'ları yurt içi sayar."""
    ulke = iban.replace(" ", "")[:2].upper()
    if ulke == "TR":
        return "yurt içi"
    return "yurt dışı"


def eksik_mi(deger):
    return deger is None or deger == ""
''',
   'tests': '''
assert iban_bolgesi("tr33 0006 1005 1978 6457 8413 26") == "yurt içi", "Küçük harfli TR IBAN da yurt içi olmalı"
assert iban_bolgesi("TR33 0006 1005 1978 6457 8413 26") == "yurt içi", "TR IBAN yurt içi olmalı"
assert iban_bolgesi("DE89 3704 0044 0532 0130 00") == "yurt dışı", "DE IBAN yurt dışı olmalı"
assert eksik_mi(None) and eksik_mi("") and not eksik_mi(0), "None ve boş metin eksik, 0 eksik değil"
assert 'is "' not in __source__, "Metinleri is ile karşılaştırma; == kullan"
assert "== None" not in __source__, "None ile karşılaştırma is None ile yapılır"
''',
   'hints': ['is "aynı nesne mi?" diye sorar; upper() her seferinde YENİ bir metin nesnesi üretir.', 'ulke == "TR" ve deger is None'],
   'why': 'is kimlik, == eşitlik karşılaştırmasıdır. Kısa metinler bazen önbelleğe alındığı için is tesadüfen çalışır; bu yüzden hata "bazen" görünür. Python 3.8+ bu kullanım için SyntaxWarning de verir. None tekil olduğundan onu is ile karşılaştırmak hem doğru hem PEP 8 önerisidir.'})

# ---------- Meydan okuma ----------
A({'t': 'code', 'stage': 'Meydan okuma', 'id': 'kod-stili-m1', 'diff': 3,
   'q': '<p>Mini bir adlandırma linter\'ı yaz: <code>adlandirma_denetle(kaynak)</code> kaynağı <code>ast</code> ile tarasın ve şu ihlalleri <b>satır numarasına göre sıralı</b> metin listesi olarak döndürsün:</p><ul><li>Fonksiyon adı snake_case değilse: <code>"3: fonksiyon \'hesaplaToplam\' snake_case değil"</code></li><li>Sınıf adı PascalCase değilse: <code>"7: sınıf \'banka_hesabi\' PascalCase değil"</code></li><li>Parametre adı snake_case değilse: <code>"3: parametre \'Tutar\' snake_case değil"</code> (satır: parametrenin satırı)</li></ul><p>Başında alt çizgi olan adlar (<code>_yardimci</code>, <code>__init__</code>) baştaki/sondaki alt çizgiler atılarak denetlenir. Aynı satırda birden çok ihlal varsa önce fonksiyon/sınıf, sonra parametreler (soldan sağa) gelir. Desenler: snake <code>[a-z][a-z0-9]*(_[a-z0-9]+)*</code>, Pascal <code>([A-Z][a-z0-9]+)+</code>.</p>',
   'start': '''
import ast
import re

def adlandirma_denetle(kaynak):
    pass
''',
   'sol': '''
import ast
import re

SNAKE = re.compile(r"[a-z][a-z0-9]*(_[a-z0-9]+)*")
PASCAL = re.compile(r"([A-Z][a-z0-9]+)+")


def _uygun(desen, ad):
    return desen.fullmatch(ad.strip("_")) is not None


def adlandirma_denetle(kaynak):
    """Fonksiyon, sınıf ve parametre adlarındaki PEP 8 ihlallerini döndürür."""
    bulgular = []
    for dugum in ast.walk(ast.parse(kaynak)):
        if isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not _uygun(SNAKE, dugum.name):
                bulgular.append((dugum.lineno, dugum.col_offset, f"{dugum.lineno}: fonksiyon '{dugum.name}' snake_case değil"))
            argumanlar = dugum.args.posonlyargs + dugum.args.args + dugum.args.kwonlyargs
            for arg in argumanlar:
                if not _uygun(SNAKE, arg.arg):
                    bulgular.append((arg.lineno, arg.col_offset, f"{arg.lineno}: parametre '{arg.arg}' snake_case değil"))
        elif isinstance(dugum, ast.ClassDef):
            if not _uygun(PASCAL, dugum.name):
                bulgular.append((dugum.lineno, dugum.col_offset, f"{dugum.lineno}: sınıf '{dugum.name}' PascalCase değil"))
    bulgular.sort()
    return [metin for _, _, metin in bulgular]
''',
   'tests': '''
kod = """import math

def hesaplaToplam(Tutar, adet):
    return Tutar * adet

def _yardimci(x):
    return x

class banka_hesabi:
    def __init__(self, ilkBakiye):
        self.bakiye = ilkBakiye

    def ParaYatir(self, tutar):
        return tutar

class KrediBasvurusu:
    pass
"""
beklenen = [
    "3: fonksiyon 'hesaplaToplam' snake_case değil",
    "3: parametre 'Tutar' snake_case değil",
    "9: sınıf 'banka_hesabi' PascalCase değil",
    "10: parametre 'ilkBakiye' snake_case değil",
    "13: fonksiyon 'ParaYatir' snake_case değil",
]
sonuc = adlandirma_denetle(kod)
assert sonuc == beklenen, "Beklenen:\\n" + "\\n".join(beklenen) + "\\nGelen:\\n" + "\\n".join(map(str, sonuc or []))
assert adlandirma_denetle("def f(a, *, b_c=1):\\n    pass\\n") == [], "Uygun adlarda boş liste"
assert adlandirma_denetle("def g(*, Oran):\\n    pass\\n") == ["1: parametre 'Oran' snake_case değil"], "Yalnız-anahtar (keyword-only) parametreler de denetlenmeli"
''',
   'hints': ['ast.walk ile FunctionDef ve ClassDef düğümlerini bul; parametreler dugum.args.args, posonlyargs ve kwonlyargs listelerindedir (her biri ast.arg, adı .arg).', 'Sıralamayı garantiye almak için her bulguyu (satır, sütun, metin) demeti olarak biriktir ve sort et; def adının sütunu parametrelerinkinden küçüktür.', 'Alt çizgileri at: ad.strip("_") ve desen.fullmatch(...) ile denetle.'],
   'why': 'Gerçek linter\'lar (ruff\'ın N kuralları) aynı yolu izler: kaynağı ağaca çevirir, düğümleri gezer, her kural bir desen ya da koşuldur. (satır, sütun) ile sıralamak çıktıyı deterministik ve editördeki konumla uyumlu yapar.'})

A({'t': 'code', 'stage': 'Meydan okuma', 'id': 'kod-stili-m2', 'diff': 3,
   'q': '<p>isort\'un küçük bir kopyası: <code>importlari_duzenle(satirlar, yerel=())</code> import satırlarından oluşan listeyi PEP 8 düzenine soksun ve yeni liste döndürsün:</p><ul><li>Gruplar: 1) standart kütüphane (üst modül adı <code>sys.stdlib_module_names</code> içinde), 2) üçüncü taraf, 3) yerel (üst modül adı <code>yerel</code> içinde ya da <code>from .</code> ile başlayan).</li><li>Her grup modül adına göre (küçük harfe çevrilmiş) alfabetik; modül adı aynıysa satır metnine göre.</li><li>Boş olmayan gruplar arasına tek bir <code>""</code> satırı; başta ve sonda boş satır yok.</li><li>Satırlardaki baş/son boşlukları temizle, boş satırları ve tekrarları at.</li></ul><p>Modül adı: <code>import a.b as c</code> → <code>a.b</code>; <code>from a.b import c</code> → <code>a.b</code>. Üst modül adı ilk noktaya kadarki kısımdır.</p>',
   'start': '''
import sys

def importlari_duzenle(satirlar, yerel=()):
    pass
''',
   'sol': '''
import sys


def _modul_adi(satir):
    parcalar = satir.split()
    return parcalar[1]


def _grup(modul, yerel):
    if modul.startswith("."):
        return 2
    ust = modul.split(".")[0]
    if ust in yerel:
        return 2
    if ust in sys.stdlib_module_names:
        return 0
    return 1


def importlari_duzenle(satirlar, yerel=()):
    """Import satırlarını standart / üçüncü taraf / yerel gruplarına ayırıp sıralar."""
    temiz = {s.strip() for s in satirlar if s.strip()}
    gruplar = [[], [], []]
    for satir in temiz:
        modul = _modul_adi(satir)
        gruplar[_grup(modul, yerel)].append((modul.lower(), satir))
    sonuc = []
    for grup in gruplar:
        if not grup:
            continue
        if sonuc:
            sonuc.append("")
        sonuc.extend(satir for _, satir in sorted(grup))
    return sonuc
''',
   'tests': '''
girdi = [
    "import pandas as pd",
    "from rapor.ayarlar import KDV_ORANI",
    "  import json",
    "",
    "from pathlib import Path",
    "import numpy as np",
    "from . import yardimci",
    "import csv",
    "import json",
    "from collections import Counter",
]
beklenen = [
    "from collections import Counter",
    "import csv",
    "import json",
    "from pathlib import Path",
    "",
    "import numpy as np",
    "import pandas as pd",
    "",
    "from . import yardimci",
    "from rapor.ayarlar import KDV_ORANI",
]
sonuc = importlari_duzenle(girdi, yerel=("rapor",))
assert sonuc == beklenen, "Beklenen:\\n" + "\\n".join(beklenen) + "\\nGelen:\\n" + "\\n".join(map(str, sonuc or []))
assert importlari_duzenle(["import requests", "import os.path"]) == ["import os.path", "", "import requests"], "os.path'in üst modülü os: standart kütüphane"
assert importlari_duzenle(["import Zebra_lib", "import attr"]) == ["import attr", "import Zebra_lib"], "Sıralama büyük-küçük harfe duyarsız olmalı"
assert importlari_duzenle([]) == [], "Boş girdide boş liste"
''',
   'hints': ['"import x" ve "from x import y" satırlarının ikisinde de modül adı ikinci kelimedir: satir.split()[1].', 'Üç gruplu bir liste tut ([[], [], []]); her satırı (modul.lower(), satir) demeti olarak doğru gruba ekle ve sorted ile sırala.', 'Tekrarları atmak için önce temizlenmiş satırları bir kümeye koy; grupları birleştirirken yalnızca sonuç boş değilse araya "" ekle.'],
   'why': 'Sıralama anahtarını (modül adı, satır) demeti olarak kurmak hem birincil hem ikincil sıralamayı tek seferde çözer. sys.stdlib_module_names Python 3.10\'dan beri standart kütüphane modüllerinin resmi listesidir; isort ve ruff da benzer listeler kullanır.'})

# ---------- Mini proje ----------
A({'t': 'code', 'stage': 'Mini proje', 'id': 'kod-stili-p1', 'diff': 3,
   'q': '<p><b>Dağınık rapor betiğini temizle.</b> İskeletteki <code>r(l)</code> fonksiyonu doğru sonuç üretiyor ama okunmuyor. Veri anahtarları değiştirilemez (başka sistemden geliyor): <code>"d"</code> durum, <code>"a"</code> adet, <code>"p"</code> birim fiyat, <code>"c"</code> şehir.</p><p>Aynı metni üreten şu yapıyı kur:</p><ul><li><code>siparis_tutari(siparis)</code>: adet × birim fiyat</li><li><code>sehre_gore_ciro(siparisler)</code>: yalnızca durumu <code>"ok"</code> olanlar için şehir → ciro sözlüğü (şehirler ilk görülme sırasıyla)</li><li><code>siparis_raporu(siparisler)</code>: <code>r</code> ile <b>birebir aynı</b> metni döndürür</li></ul><p>Kurallar: her fonksiyonun docstring\'i olsun; fonksiyon, parametre ve değişken adları en az 3 karakter (<code>_</code> hariç); <code>"ok"</code> durumu <code>ONAYLI_DURUM</code> sabitinde dursun; hiçbir satır 79 karakteri aşmasın; eski <code>r</code> fonksiyonunu sil.</p>',
   'start': '''
def r(l):
    t=0
    d={}
    for x in l:
        if x["d"]=="ok":
            t=t+x["a"]*x["p"]
            if x["c"] in d:
                d[x["c"]]=d[x["c"]]+x["a"]*x["p"]
            else:
                d[x["c"]]=x["a"]*x["p"]
    s=""
    for k in d:
        s=s+k+": "+str(round(d[k],2))+"\\n"
    s=s+"TOPLAM: "+str(round(t,2))
    return s

# TODO: ONAYLI_DURUM, siparis_tutari, sehre_gore_ciro, siparis_raporu
''',
   'sol': '''
ONAYLI_DURUM = "ok"


def siparis_tutari(siparis):
    """Siparişin tutarını (adet x birim fiyat) döndürür."""
    return siparis["a"] * siparis["p"]


def sehre_gore_ciro(siparisler):
    """Onaylı siparişlerin şehir bazında toplam cirosunu döndürür."""
    ciro = {}
    for siparis in siparisler:
        if siparis["d"] != ONAYLI_DURUM:
            continue
        sehir = siparis["c"]
        ciro[sehir] = ciro.get(sehir, 0) + siparis_tutari(siparis)
    return ciro


def siparis_raporu(siparisler):
    """Şehir satırları ve genel toplamdan oluşan rapor metnini döndürür."""
    ciro = sehre_gore_ciro(siparisler)
    satirlar = [f"{sehir}: {round(tutar, 2)}" for sehir, tutar in ciro.items()]
    satirlar.append(f"TOPLAM: {round(sum(ciro.values()), 2)}")
    return "\\n".join(satirlar)
''',
   'tests': '''
import ast

def _eski(l):
    t = 0
    d = {}
    for x in l:
        if x["d"] == "ok":
            t = t + x["a"] * x["p"]
            if x["c"] in d:
                d[x["c"]] = d[x["c"]] + x["a"] * x["p"]
            else:
                d[x["c"]] = x["a"] * x["p"]
    s = ""
    for k in d:
        s = s + k + ": " + str(round(d[k], 2)) + "\\n"
    s = s + "TOPLAM: " + str(round(t, 2))
    return s

veri = [
    {"d": "ok", "a": 2, "p": 49.9, "c": "İzmir"},
    {"d": "iptal", "a": 1, "p": 500, "c": "Ankara"},
    {"d": "ok", "a": 1, "p": 1250, "c": "Ankara"},
    {"d": "ok", "a": 3, "p": 15.5, "c": "İzmir"},
]
assert siparis_tutari(veri[0]) == 2 * 49.9, "siparis_tutari adet x fiyat olmalı"
assert sehre_gore_ciro(veri) == {"İzmir": 2 * 49.9 + 3 * 15.5, "Ankara": 1250}, "sehre_gore_ciro yalnızca 'ok' siparişleri saymalı"
for ornek in [veri, [], veri[1:2], veri[::-1]]:
    assert siparis_raporu(ornek) == _eski(ornek), "Rapor metni eski r() ile birebir aynı olmalı. Beklenen:\\n" + _eski(ornek) + "\\nGelen:\\n" + str(siparis_raporu(ornek))
assert ONAYLI_DURUM == "ok", "ONAYLI_DURUM sabiti 'ok' olmalı"
_agac = ast.parse(__source__)
_fonks = [d for d in ast.walk(_agac) if isinstance(d, ast.FunctionDef)]
assert "r" not in [f.name for f in _fonks], "Eski r fonksiyonunu sil"
for _f in _fonks:
    assert ast.get_docstring(_f), _f.name + " fonksiyonunun docstring'i olmalı"
_adlar = [f.name for f in _fonks] + [a.arg for f in _fonks for a in f.args.args]
_adlar += [d.id for d in ast.walk(_agac) if isinstance(d, ast.Name) and isinstance(d.ctx, ast.Store)]
_kisa = sorted({a for a in _adlar if len(a) < 3 and a != "_"})
assert not _kisa, "Anlamsız kısa adlar var: " + str(_kisa)
assert all(len(s) <= 79 for s in __source__.splitlines()), "79 karakteri aşan satır var"
''',
   'hints': ['Önce siparis_tutari\'yı yaz; r içinde x["a"]*x["p"] üç kez tekrar ediyor.', 'Şehir toplamı için ciro.get(sehir, 0) + ... kalıbı if/else\'i gereksiz kılar. Genel toplam, onaylı şehir cirolarının toplamıyla aynıdır.', 'Rapor: önce satırları bir listede topla, sonra "\\n".join; f"{sehir}: {round(tutar, 2)}" eski str(round(...)) ile aynı metni üretir.'],
   'why': 'Davranış eski fonksiyonla karşılaştırılarak korundu (karakterizasyon testi), yapı ise üç küçük, adı ve docstring\'i olan fonksiyona ayrıldı. Gerçek projelerde eski kodu temizlerken izlenen yol tam olarak budur: önce davranışı kilitle, sonra yeniden düzenle.'})

LESSON = {
    'id': 'kod-stili', 'lv': 'temel', 'mod': 'Dosya ve Hata', 'min': 35,
    'title': 'Temiz kod ve PEP 8',
    'sum': 'PEP 8 adlandırma, boşluk ve import kurallarını, docstring yazmayı, sihirli sayılardan kaçınmayı, DRY ve erken dönüşü öğrenir; dağınık kodu davranışını bozmadan yeniden düzenler, ruff ve black ile stili otomatiğe bağlarsın.',
    'goals': [
        'Değişken, fonksiyon, sınıf ve sabitleri PEP 8\'e uygun ve anlamlı adlandırabilirim.',
        'Girinti, boşluk, satır uzunluğu ve import sırasını kurallara göre düzenleyebilirim.',
        'Google ya da NumPy stilinde docstring ve "neden"i anlatan yorumlar yazabilirim.',
        'Sihirli sayıları sabite taşıyıp tekrarı fonksiyona çevirerek ve erken dönüş kullanarak kodu davranışını bozmadan yeniden düzenleyebilirim.',
        'ruff ve black\'in ne işe yaradığını bilir, re ve ast ile basit stil denetimleri yazabilirim.',
    ],
    'body': BODY,
    'ex': EX,
    'faq': [
        {'q': 'Satır sınırı 79 mu, 88 mi, 120 mi?', 'a': 'PEP 8 79 der; black ve ruff varsayılanı 88\'dir; bazı ekipler 100-120 kullanır. Doğru sayı, ekibinin pyproject.toml dosyasında yazan sayıdır. Önemli olan herkesin aynı sınırı kullanması ve bunu bir aracın denetlemesidir.'},
        {'q': 'Her fonksiyona docstring yazmak zorunda mıyım?', 'a': 'Başkalarının çağıracağı (public) her fonksiyon, sınıf ve modül için evet. _ ile başlayan küçük iç yardımcılarda, adı ve tip ipuçları yeterince açıksa atlanabilir. Kural koymak yerine ruff\'ın D kurallarıyla hangi düzeyin zorunlu olduğunu ekipçe seçin.'},
        {'q': 'black ile ruff arasında hangisini seçmeliyim?', 'a': 'İkisi farklı işler yapar: black biçimlendirir, ruff denetler (ve ruff format ile black uyumlu biçimlendirme de yapar). Yeni projelerde çoğu ekip tek araçla ilerlemek için yalnızca ruff (check + format) kullanır.'},
        {'q': 'Kısa değişken adları hiç mi kullanılmaz?', 'a': 'Kısa kapsamda kullanılır: üç satırlık döngüde i, matematik formülünde x ve y, comprehension\'da tek harf kabul görür. Kural "ad, kapsamı kadar uzun olsun"dur: modül boyunca yaşayan bir değişken tek harf olamaz.'},
        {'q': 'Yorum mu yazmalıyım, kodu mu açık yazmalıyım?', 'a': 'Önce kodu açık yaz: anlamlı ad, küçük fonksiyon, adlandırılmış sabit. Bunlar yetmiyorsa, yani kodun neden öyle olduğu (iş kuralı, dış sistemin tuhaflığı, performans tercihi) koddan anlaşılmıyorsa yorum yaz.'},
    ],
    'mistakes': [
        {'bad': 'def HesaplaToplam(siparisListesi):\n    ...', 'good': 'def hesapla_toplam(siparisler):\n    ...', 'why': 'Fonksiyon ve parametre adları snake_case yazılır; PascalCase sınıflara aittir. Liste olduğunu adla değil çoğul ekle belirtmek yeterlidir.'},
        {'bad': 'if puan > 1250:\n    limit = gelir * 3', 'good': 'PRIM_ESIGI = 1250\nLIMIT_CARPANI = 3\nif puan > PRIM_ESIGI:\n    limit = gelir * LIMIT_CARPANI', 'why': 'Sihirli sayının anlamını yalnızca yazan bilir ve değiştiğinde tüm kopyaları bulmak gerekir.'},
        {'bad': 'import os, sys\nfrom hesap import *', 'good': 'import os\nimport sys\n\nfrom hesap import faiz_hesapla', 'why': 'Her satırda tek import; yıldızlı import hangi adların geldiğini gizler ve ad çakışmalarına yol açar.'},
        {'bad': 'def f(x):\n    # x\'i 2 ile çarp\n    return x * 2', 'good': 'def iki_katina_cikar(tutar):\n    """Kampanya günü puanı ikiye katlar."""\n    return tutar * 2', 'why': 'Kodu tekrar eden yorum değer katmaz; iyi ad ve iş kuralını söyleyen docstring katar.'},
        {'bad': 'if deger == None:\n    ...', 'good': 'if deger is None:\n    ...', 'why': 'None tekil bir nesnedir; PEP 8 onu is ile karşılaştırmayı ister. Değer karşılaştırması ise her zaman == ile yapılır.'},
    ],
}

emit(LESSON, '/home/claude/py/v2/t4/kod-stili.js', 'Temiz kod ve PEP 8 — temel / Dosya ve Hata')
