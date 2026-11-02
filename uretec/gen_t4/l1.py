import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen_t4')
from jsgen import emit

BODY = r'''
<h2>Neden önemli?</h2>
<p>Anadolu Market'in gece çalışan ciro raporu bu sabah İzmir için 0 TL gösterdi. Program hata vermedi, sadece yanlış sonuç üretti. Ekipte biri "dün çalışıyordu" dedi, bir başkası kodu baştan yazmayı önerdi. Deneyimli geliştirici ise şunu yaptı: hatayı tekrar üretti, veriyi küçülttü, iki <code>print</code> ekledi ve on dakikada sorunun bir sözlük anahtarındaki tek harf olduğunu buldu. Hata ayıklama (debugging), yazılımcının günlük işinin belki de yarısıdır ve şansa değil <b>yönteme</b> dayanır. Bu derste o yöntemi öğreneceksin.</p>
<p><code>try/except</code> ile hatayı yakalamayı ve kendi hatanı fırlatmayı "Hatalar ve istisnalar" dersinde gördün. Burada amaç farklı: hatanın <b>nedenini</b> bulmak ve düzeltmek.</p>

<h2>Üç hata ailesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Aile</th><th>Ne zaman ortaya çıkar?</th><th>Örnek</th><th>Belirti</th></tr>
<tr><td>Sözdizimi hatası (syntax error)</td><td>Kod daha çalışmadan, derlenirken</td><td>Kapanmamış parantez, eksik iki nokta, yanlış girinti</td><td>Program hiç başlamaz; <code>SyntaxError</code>, <code>IndentationError</code></td></tr>
<tr><td>Çalışma zamanı hatası (runtime error, exception)</td><td>Kod çalışırken, o satıra gelince</td><td>Sıfıra bölme, olmayan anahtar, yanlış tür</td><td>Traceback ile durur: <code>ZeroDivisionError</code>, <code>KeyError</code>, <code>TypeError</code></td></tr>
<tr><td>Mantık hatası (logic error)</td><td>Hiçbir zaman "patlamaz"</td><td>Yanlış aralık, yanlış koşul, yanlış formül</td><td>Program sessizce <b>yanlış sonuç</b> verir</td></tr>
</table></div>
<p>En tehlikelisi sonuncusudur: kimse fark etmezse yanlış rakam yönetim raporuna kadar gider. Sözdizimi ve çalışma zamanı hataları ise aslında dosttur; sana tam olarak nerede durduklarını söylerler.</p>

<h2>Traceback'i alttan yukarı oku</h2>
<p>Python bir istisna fırlattığında geriye dönük iz (traceback) yazdırır. Yeni başlayanlar en üstten okumaya başlar ve kaybolur. Doğru sıra tam tersidir:</p>
<pre class="out">
Traceback (most recent call last):
  File "gunluk_rapor.py", line 12, in <module>
    print(sehir_ozeti(siparisler))
  File "gunluk_rapor.py", line 7, in sehir_ozeti
    toplam[s["sehir"]] += s["tutar"]
KeyError: 'İzmir'
</pre>
<div class="steps-list"><ol>
<li><b>En alt satır:</b> hata türü ve mesajı. <code>KeyError: 'İzmir'</code> → sözlükte "İzmir" anahtarı yok.</li>
<li><b>Hemen üstündeki File satırı:</b> hatanın gerçekleştiği yer. 7. satır, <code>sehir_ozeti</code> fonksiyonu.</li>
<li><b>Kod satırı:</b> <code>toplam[s["sehir"]] += s["tutar"]</code>. <code>+=</code> önce okur; anahtar ilk kez geliyorsa okuma başarısız olur.</li>
<li><b>Yukarı çık:</b> bu fonksiyonu kim çağırdı? 12. satır. Üst satırlar "buraya nasıl gelindi" hikâyesidir.</li>
</ol></div>
<p>"most recent call last" ifadesi zaten ipucunu verir: en son çağrı en alttadır. Kütüphane kodunun içinde biten bir traceback'te, alttan yukarı çıkarken <b>kendi dosyanın</b> ilk satırını ara; hata çoğunlukla oraya senin verdiğin bir değerden kaynaklanır.</p>
<pre class="py">
siparisler = [
    {"sehir": "İzmir", "tutar": 300},
    {"sehir": "Ankara", "tutar": 150},
    {"sehir": "İzmir", "tutar": 120},
]

def sehir_ozeti(siparisler):
    toplam = {}
    for s in siparisler:
        # Hatalı hâli: toplam[s["sehir"]] += s["tutar"]
        toplam[s["sehir"]] = toplam.get(s["sehir"], 0) + s["tutar"]
    return toplam

print(sehir_ozeti(siparisler))
</pre>

<h2>Hata türüne göre ilk bakılacak yer</h2>
<div class="tbl-wrap"><table>
<tr><th>Hata</th><th>Genelde ne demek?</th><th>İlk bakacağın yer</th></tr>
<tr><td><code>SyntaxError</code></td><td>Python cümleyi anlayamadı</td><td>Gösterilen satır <b>ve bir üstü</b>: kapanmamış parantez/tırnak, eksik <code>:</code></td></tr>
<tr><td><code>IndentationError</code></td><td>Girinti tutarsız</td><td>Sekme/boşluk karışımı, blok sonrası boş gövde</td></tr>
<tr><td><code>NameError</code></td><td>Bu ad tanımlı değil</td><td>Yazım hatası, tanımdan önce kullanım, yanlış kapsam</td></tr>
<tr><td><code>TypeError</code></td><td>Bu türle bu işlem olmaz</td><td><code>input()</code>'tan gelen metin, <code>None</code> dönen fonksiyon, eksik argüman</td></tr>
<tr><td><code>ValueError</code></td><td>Tür doğru, değer uygunsuz</td><td><code>int("12,5")</code> gibi dönüşümler, veri temizliği</td></tr>
<tr><td><code>KeyError</code></td><td>Sözlükte bu anahtar yok</td><td>Anahtarın yazımı, büyük-küçük harf, Türkçe karakter</td></tr>
<tr><td><code>IndexError</code></td><td>Liste bu kadar uzun değil</td><td><code>range</code> sınırları, boş liste, off-by-one</td></tr>
<tr><td><code>AttributeError</code></td><td>Bu nesnede bu nitelik yok</td><td>Değişken beklediğin türde değil (çoğu zaman <code>None</code>)</td></tr>
<tr><td><code>ZeroDivisionError</code></td><td>Sıfıra bölme</td><td>Boş listede ortalama, sıfır adet</td></tr>
</table></div>

<h2>print ile izleme ve f"{x=}" kalıbı</h2>
<p>En eski ve hâlâ en hızlı araç: şüphelendiğin yere değerleri yazdırmak. Python 3.8'den beri f-string içinde <code>=</code> kullanırsan hem ifadeyi hem değerini yazar; etiketi elle yazma derdi biter.</p>
<pre class="py">
def kargo_ucreti(agirlik_kg, sehir):
    taban = 40
    ek = (agirlik_kg - 1) * 12 if agirlik_kg > 1 else 0
    uzak = sehir in ("Van", "Hakkari")
    print(f"{agirlik_kg=} {ek=} {uzak=}")      # geçici izleme satırı
    ucret = taban + ek + (25 if uzak else 0)
    print(f"{ucret=}  {ucret / agirlik_kg=:.2f}")
    return ucret

kargo_ucreti(3, "Van")
kargo_ucreti(0.5, "İzmir")
</pre>
<div class="tip"><b>İzleme satırını işaretle</b>Geçici <code>print</code> satırlarının sonuna <code># DEBUG</code> yaz; iş bitince hepsini tek aramayla bul ve sil. Kalıcı izleme gerekiyorsa <code>print</code> değil <code>logging</code> kullanılır (orta seviyede göreceksin).</div>

<h2>assert ile varsayım kontrolü</h2>
<p>Her kodun içinde söylenmemiş varsayımlar vardır: "liste boş olmaz", "indirim oranı 0 ile 1 arasındadır". <code>assert koşul, "mesaj"</code> bu varsayımı yazıya döker; koşul yanlışsa <code>AssertionError</code> fırlatır. Böylece hata, yanlış değerin <b>doğduğu yerde</b> yakalanır, üç fonksiyon sonra değil.</p>
<pre class="py">
def indirim_uygula(fiyat, oran):
    assert 0 <= oran <= 1, f"oran 0-1 arasında olmalı, gelen: {oran}"
    yeni = fiyat * (1 - oran)
    assert yeni <= fiyat, "indirimli fiyat eskisinden büyük olamaz"
    return round(yeni, 2)

print(indirim_uygula(200, 0.15))
try:
    print(indirim_uygula(200, 15))      # yüzde yerine 15 verildi
except AssertionError as hata:
    print("Yakalandı:", hata)
</pre>
<div class="warn"><b>assert kullanıcı girdisi için değildir</b>Python <code>-O</code> seçeneğiyle çalıştırılınca tüm assert satırları atlanır. Kullanıcıdan ya da dosyadan gelen veriyi doğrulamak için <code>if</code> + <code>raise ValueError</code> kullan; assert yalnızca "bu asla olmamalı" dediğin programcı varsayımları içindir.</div>

<h2>breakpoint() ve pdb</h2>
<p>print'in yetmediği yerde hata ayıklayıcı (debugger) devreye girer: programı bir satırda durdurur, değişkenlere bakmanı ve satır satır ilerlemeni sağlar. Kodun içine <code>breakpoint()</code> yazman yeterli; Python yerleşik <code>pdb</code> ayıklayıcısını açar.</p>
<pre class="code">
def faiz_hesapla(anapara, yillik_oran, ay):
    aylik = yillik_oran / 12
    breakpoint()                 # program burada durur, (Pdb) istemi açılır
    return anapara * (1 + aylik) ** ay

faiz_hesapla(10_000, 0.42, 12)
</pre>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Açılımı</th><th>Ne yapar?</th></tr>
<tr><td><code>n</code></td><td>next</td><td>Sonraki satıra geç; fonksiyon çağrısının içine girmez</td></tr>
<tr><td><code>s</code></td><td>step</td><td>Satırda bir fonksiyon çağrısı varsa içine gir</td></tr>
<tr><td><code>c</code></td><td>continue</td><td>Bir sonraki durma noktasına kadar çalış</td></tr>
<tr><td><code>p ifade</code></td><td>print</td><td>Değeri göster: <code>p aylik</code>, <code>p anapara * 2</code></td></tr>
<tr><td><code>l</code></td><td>list</td><td>Bulunduğun yerin çevresindeki kodu göster</td></tr>
<tr><td><code>w</code></td><td>where</td><td>Çağrı yığınını göster (canlı traceback)</td></tr>
<tr><td><code>q</code></td><td>quit</td><td>Ayıklayıcıdan ve programdan çık</td></tr>
</table></div>
<div class="note"><b>Kendi bilgisayarında dene</b>Tarayıcıdaki çalıştırıcı etkileşimli konsol açmadığı için <code>breakpoint()</code>'i burada değil, terminalde dene: <code>python faiz.py</code>. Program çökmüşse <code>python -m pdb faiz.py</code> ile başlatıp hata anında otomatik durdurabilirsin (post-mortem).</div>

<h2>VS Code hata ayıklayıcısı</h2>
<p>Aynı işi fareyle yapmak istersen VS Code'un Python eklentisi yeterli:</p>
<div class="steps-list"><ol>
<li>Satır numarasının soluna tıkla (ya da <b>F9</b>): kırmızı nokta, yani kesme noktası (breakpoint).</li>
<li><b>F5</b> → "Python File". Program kırmızı noktada durur.</li>
<li>Sol panelde <b>Variables</b> tüm yerel değişkenleri gösterir; <b>Watch</b>'a ifade ekleyip izleyebilirsin.</li>
<li><b>F10</b> step over (n), <b>F11</b> step into (s), <b>Shift+F11</b> fonksiyondan çık, <b>F5</b> devam (c).</li>
<li>Kesme noktasına sağ tıklayıp <b>koşullu</b> yapabilirsin: <code>s["sehir"] == "İzmir"</code>. Bin kayıtlık döngüde yalnızca ilgilendiğin kayıtta durur.</li>
<li><b>Debug Console</b>'da durduğun andaki değişkenlerle Python ifadesi çalıştırabilirsin.</li>
</ol></div>

<h2>Sorunu küçült: minimal örnek</h2>
<p>Elinde 50 bin satırlık sipariş dosyası ve bir yerde patlayan bir rapor var. Gözle aramak yerine sorunu üreten en küçük girdiyi bul. Önce hatayı üreten kaydı otomatik yakala, sonra yalnızca o kayıtla çalış:</p>
<pre class="py">
kayitlar = [
    {"no": "AM-1", "tutar": "120.5"},
    {"no": "AM-2", "tutar": "89"},
    {"no": "AM-3", "tutar": "1.250,00"},     # Türkçe biçim: float'a çevrilmez
    {"no": "AM-4", "tutar": "40"},
]

for i, k in enumerate(kayitlar):
    try:
        float(k["tutar"])
    except ValueError as hata:
        print(f"{i=} {k['no']=} -> {hata}")
        break
</pre>
<p>Artık sorun "rapor çalışmıyor" değil, "<code>float("1.250,00")</code> ValueError veriyor". Bu cümleyle düzeltme yapmak, aramak ve soru sormak çok kolaydır. Minimal örneğin kuralları: hatayı hâlâ üretsin, bunun dışında her şey silinsin, başkası kopyalayıp çalıştırabilsin.</p>

<h2>Rubber duck: sesli anlat</h2>
<p>Masaya bir lastik ördek koy ve kodunu ona satır satır anlat: "Burada listeyi geziyorum, burada toplamı artırıyorum, burada döndürüyorum..." Çoğu zaman cümlenin ortasında "dur, return döngünün içinde" dersin. Yöntemin adı komik ama işe yarar, çünkü sesli anlatmak seni varsaydığın şeyi değil, <b>kodun gerçekten yaptığını</b> okumaya zorlar.</p>

<h2>Hata mesajını aramak ve yapay zekâya sormak</h2>
<p>Hata mesajının <b>genel kısmını</b> ara, sana özel kısmını çıkar: <code>"TypeError: unsupported operand type(s) for +: 'int' and 'str'"</code> iyi bir aramadır; dosya adların ve değişken adların değildir. Yapay zekâya ya da bir foruma sorarken şu beşini ver:</p>
<ol>
<li><b>Ne yapmaya çalışıyorsun?</b> (bir cümle iş hedefi)</li>
<li><b>Minimal kod</b> (çalıştırılabilir, gizli bilgi ve müşteri verisi içermeyen)</li>
<li><b>Tam hata mesajı</b> (traceback'in tamamı, ekran görüntüsü değil metin)</li>
<li><b>Beklenen ve gelen sonuç</b></li>
<li><b>Denediklerin</b> ve Python sürümün</li>
</ol>
<div class="warn"><b>Yapıştırmadan önce düşün</b>Şirket kodu, müşteri adları, IBAN, şifre ve API anahtarları dış bir hizmete gönderilmez. Minimal örnek hazırlamanın bir faydası da budur: gerçek veriyi kurgusal küçük veriyle değiştirirsin. Gelen cevabı da körü körüne yapıştırma; neden çalıştığını anlamadığın düzeltme bir sonraki hatanın tohumudur.</div>

<h2>Klasik böcekler kataloğu</h2>
<div class="tbl-wrap"><table>
<tr><th>Böcek</th><th>Belirti</th><th>Düzeltme</th></tr>
<tr><td>Off-by-one</td><td>Son ya da ilk eleman eksik</td><td><code>range</code> bitişinin hariç olduğunu hatırla</td></tr>
<tr><td>Döngü içinde <code>return</code></td><td>Yalnızca ilk eleman işlenir</td><td><code>return</code>'ü döngü hizasından çıkar</td></tr>
<tr><td><code>==</code> yerine <code>=</code> ya da tersi</td><td>Değer güncellenmez</td><td>Atama <code>=</code>, karşılaştırma <code>==</code></td></tr>
<tr><td>Tamsayı bölme</td><td>Kuruşlar kaybolur</td><td><code>//</code> yerine <code>/</code></td></tr>
<tr><td>Değişebilir varsayılan</td><td>Çağrılar arasında veri sızar</td><td><code>None</code> varsayılanı + içeride yeni liste</td></tr>
<tr><td>Gölgeleme (shadowing)</td><td><code>'int' object is not callable</code></td><td><code>sum</code>, <code>list</code>, <code>max</code> adlarını değişkene verme</td></tr>
<tr><td>Yanlış anahtar</td><td><code>KeyError</code> ya da <code>.get</code> ile sessiz 0</td><td>Anahtarı veriden kopyala</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Profesyonel ekiplerde bir hata bildirimi (bug report) "çalışmıyor" diye açılmaz: adımlar, beklenen, gelen, ortam ve log eklenir. Düzeltmeden önce hatayı yeniden üreten bir test yazılır; test kırmızıyken düzeltilir, yeşile dönünce kod incelemesine gönderilir. Böylece aynı hata bir daha geri gelirse test hemen yakalar. Mülakatlarda da sık sorulur: "Son zamanlarda ayıkladığın zor bir hatayı anlat." İyi cevap, yöntemi anlatan cevaptır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bilimsel yöntem olarak hata ayıklama</h3>
<p>Gözlem → hipotez → deney → sonuç. "Sanırım tutar metin olarak geliyor" bir hipotezdir; <code>print(f"{type(tutar)=}")</code> onun deneyidir. Hipotezleri tek tek ele, aynı anda üç şeyi değiştirme; yoksa hangisinin düzelttiğini bilemezsin.</p>
<h3>İkiye bölerek arama</h3>
<p>Kod dün çalışıyordu, bugün çalışmıyorsa aradaki değişikliklerin ortasını dene, sonra kalan yarının ortasını... Git bunu <code>git bisect</code> komutuyla otomatik yapar: yüz commit arasından bozan commit'i yaklaşık yedi denemede bulursun. Aynı fikir veri için de geçerlidir: dosyanın yarısıyla dene, hata hangi yarıdaysa onu böl.</p>
<h3>Heisenbug ve ortam farkları</h3>
<p>Bazı hatalar gözlemlediğinde kaybolur (zamanlama, rastgelelik, önbellek). Rastgelelikte <code>random.seed</code> ile tekrarlanabilir hâle getir; ortam farkında <code>python --version</code>, <code>pip freeze</code> ve işletim sistemini karşılaştır. "Bende çalışıyor" cümlesi bir sonuç değil, bir ipucudur: iki ortam arasında bir fark var demektir.</p>
<h3>Post-mortem</h3>
<p>Uzun süren bir iş gecenin üçünde çöktüyse, interaktif konsolda <code>import pdb; pdb.pm()</code> son istisnanın yığınına girip o anki değişkenleri gösterir. Üretimde ise log ve hata izleme servisleri (Sentry gibi) traceback'i değişken değerleriyle birlikte saklar.</p>
</section>
'''

EX = []
A = EX.append

# ---------- Isınma ----------
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'Uzun bir traceback ile karşılaştın. Hatayı anlamak için <b>ilk</b> hangi satırı okumalısın?',
   'o': ['En üstteki "Traceback (most recent call last):" satırını', 'En alttaki hata türü ve mesajı satırını', 'İlk "File ..." satırını', 'En uzun kod satırını'],
   'a': 1,
   'why': 'En son çağrı en alttadır: hata türü ve mesajı oradadır, hemen üstündeki File satırı hatanın gerçekleştiği yeri gösterir. Üst satırlar oraya nasıl gelindiğinin hikâyesidir.'})
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'Rapor programı hiç hata vermeden çalışıyor ama İzmir cirosunu her gün 0 TL gösteriyor. Bu hangi hata ailesidir?',
   'o': ['Sözdizimi hatası (SyntaxError)', 'Mantık hatası', 'Çalışma zamanı hatası (exception)', 'Girinti hatası (IndentationError)'],
   'a': 1,
   'why': 'Program durmuyor, traceback yok; yalnızca sonuç yanlış. Bu mantık hatasıdır ve en tehlikelisidir, çünkü kendini belli etmez. Sözdizimi hatası programı hiç başlatmaz, çalışma zamanı hatası traceback ile durdurur.'})
A({'t': 'mc', 'stage': 'Isınma',
   'q': 'pdb ile durduğun satırda <code>toplam = hesapla(sepet)</code> var ve <code>hesapla</code> fonksiyonunun <b>içine</b> girip satır satır izlemek istiyorsun. Hangi komutu yazarsın?',
   'o': ['n (next)', 'c (continue)', 's (step)', 'q (quit)'],
   'a': 2,
   'why': 's (step) satırdaki çağrının içine girer. n (next) çağrıyı tek adımda çalıştırıp sonraki satıra geçer, c bir sonraki kesme noktasına kadar çalışır, q ayıklayıcıdan çıkar.'})

# ---------- Kodu oku ----------
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'f-string içindeki <code>=</code> kalıbı ne yazdırır?',
   'code': '''
sepet = [120, 80]
indirim = 0.25
toplam = sum(sepet)
print(f"{toplam=}")
print(f"{toplam * (1 - indirim)=}")
''',
   'o': ['toplam=200\n150.0', 'toplam=200\ntoplam * (1 - indirim)=150.0', '200\n150.0', 'toplam = 200\ntoplam * (1 - indirim) = 150.0'],
   'a': 1,
   'why': '<code>f"{ifade=}"</code> ifadenin metnini, eşittir işaretini ve değerini yazar; boşluk eklemez (eşittirin çevresine boşluk koyarsan o boşlukları da aynen yazar). Karmaşık ifadelerde de ifade metni olduğu gibi görünür.'})
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'Değişebilir varsayılan parametre: bu kod ne yazdırır?',
   'code': '''
def sepete_ekle(urun, sepet=[]):
    sepet.append(urun)
    return sepet

a = sepete_ekle("çay")
b = sepete_ekle("kahve")
print(a)
print(b)
''',
   'o': ["['çay']\n['kahve']", "['çay']\n['çay', 'kahve']", "['çay', 'kahve']\n['çay', 'kahve']", "['kahve']\n['kahve']"],
   'a': 2,
   'why': 'Varsayılan liste fonksiyon tanımlanırken BİR KEZ oluşturulur ve her çağrıda aynı liste kullanılır. a ve b aynı nesneyi gösterir; bu yüzden ikisi de iki ürünü içerir. Düzeltmesi: <code>sepet=None</code> ve içeride <code>if sepet is None: sepet = []</code>.'})
A({'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod çalışınca ne olur?',
   'code': '''
musteri = {"ad": "Ayşe", "sehir": "İzmir"}
print("Müşteri:", musteri["ad"])
print("Şehir:", musteri["Sehir"])
''',
   'raises': True,
   'o': ['Müşteri: Ayşe\nŞehir: İzmir', 'İlk satırı yazar, sonra KeyError verir', 'Müşteri: Ayşe\nŞehir: None', 'NameError verir'],
   'a': 1,
   'why': 'Sözlük anahtarları büyük-küçük harfe duyarlıdır: "sehir" var, "Sehir" yok. Python ilk print\'i çalıştırır, ikincisinde KeyError ile durur. Köşeli parantez None döndürmez; o davranış <code>.get()</code>\'e aittir.'})
A({'t': 'order', 'stage': 'Kodu oku',
   'q': '<p>Varsayımlarını assert ile kontrol eden <code>ortalama</code> fonksiyonunun satırlarını sırala. Boş liste, bölme yapılmadan <b>önce</b> yakalanmalı.</p>',
   'lines': ['def ortalama(tutarlar):', '    assert tutarlar, "tutarlar boş olamaz"', '    sonuc = sum(tutarlar) / len(tutarlar)',
             '    assert min(tutarlar) <= sonuc <= max(tutarlar), "ortalama aralık dışında"', '    return sonuc', 'print(ortalama([100, 200, 300]))'],
   'tests': '''
hata = None
try:
    ortalama([])
except AssertionError as e:
    hata = str(e)
except ZeroDivisionError:
    hata = "sıfıra bölme"
assert hata == "tutarlar boş olamaz", "Boş liste bölmeden ÖNCE ilk assert ile yakalanmalı; gelen: " + str(hata)
''',
   'expect': '200.0',
   'hint': 'Ön koşul (girdi boş olmamalı) hesaptan önce, son koşul (sonuç aralıkta olmalı) hesaptan sonra gelir.',
   'why': 'Ön koşul assert\'i girdiyi, son koşul assert\'i sonucu denetler. İlk assert bölmeden sonra gelseydi boş listede anlamlı mesaj yerine ZeroDivisionError görürdün.'})

# ---------- Rehberli ----------
A({'t': 'code', 'stage': 'Rehberli', 'id': 'hata-ayiklama-r1', 'diff': 2,
   'q': '<p>Destek ekibi sana traceback metinlerini yapıştırıyor. <code>traceback_ozeti(metin)</code> fonksiyonunu yaz; şu üç anahtarlı sözlüğü döndürsün:</p><ul><li><code>"tur"</code>: son satırdaki hata türü (ör. <code>"KeyError"</code>)</li><li><code>"mesaj"</code>: ilk <code>": "</code>\'den sonraki kısım; mesaj yoksa <code>""</code></li><li><code>"satir"</code>: metindeki <b>son</b> <code>line N</code> ifadesindeki N (int); hiç yoksa <code>None</code></li></ul>',
   'guide': ['Metni satırlara böl ve boş satırları at.', 'Son satırı al: hata türü ve mesaj oradadır.', 'Son satırı yalnızca ilk ": " noktasından ikiye böl (mesajın içinde de ": " olabilir).', 're.findall ile tüm "line N" sayılarını bul, sonuncusunu int yap.', 'Üç değeri sözlükte döndür.'],
   'example': '''
log = "2026-10-28 09:14 ERROR: disk dolu: /var/log"
seviye_ve_zaman, mesaj = log.split(": ", 1)
print(seviye_ve_zaman.split()[-1], "|", mesaj)

import re
metin = "sayfa 3, sayfa 7, sayfa 12"
print(re.findall(r"sayfa (\\d+)", metin)[-1])
''',
   'start': '''
import re

def traceback_ozeti(metin):
    satirlar = [s for s in metin.strip().splitlines() if s.strip()]
    son = satirlar[-1]
    # TODO: son satırı ": " noktasından EN FAZLA bir kez böl (tur, mesaj)
    # TODO: mesaj yoksa mesaj = ""
    # TODO: re.findall ile "line (sayı)" eşleşmelerini bul, sonuncuyu int yap
    pass
''',
   'sol': '''
import re

def traceback_ozeti(metin):
    satirlar = [s for s in metin.strip().splitlines() if s.strip()]
    son = satirlar[-1]
    if ": " in son:
        tur, mesaj = son.split(": ", 1)
    else:
        tur, mesaj = son, ""
    numaralar = re.findall(r"line (\\d+)", metin)
    satir = int(numaralar[-1]) if numaralar else None
    return {"tur": tur.strip(), "mesaj": mesaj, "satir": satir}
''',
   'tests': '''
tb = "\\n".join([
    "Traceback (most recent call last):",
    '  File "rapor.py", line 14, in <module>',
    "    print(rapor(siparisler))",
    '  File "rapor.py", line 9, in rapor',
    '    toplam += s["tutar"]',
    "KeyError: 'tutar'",
])
o = traceback_ozeti(tb)
assert isinstance(o, dict), "Fonksiyon bir sözlük döndürmeli"
assert o["tur"] == "KeyError", "tur KeyError olmalı: hata türü EN ALT satırdadır"
assert o["mesaj"] == "'tutar'", "mesaj \\"'tutar'\\" olmalı"
assert o["satir"] == 9, "satir 9 olmalı: hatanın gerçekleştiği yer EN SONDAKİ line ifadesidir, 14 değil"
tb2 = "Traceback (most recent call last):\\n  File \\"x.py\\", line 3, in <module>\\nValueError: invalid literal for int() with base 10: 'abc'"
o2 = traceback_ozeti(tb2)
assert o2["mesaj"] == "invalid literal for int() with base 10: 'abc'", "Mesajın içinde de ': ' var; yalnızca İLK ': ' noktasından böl (split(': ', 1))"
assert o2["satir"] == 3, "tek line varsa o alınmalı"
tb3 = "Traceback (most recent call last):\\n  File \\"y.py\\", line 2, in <module>\\nKeyboardInterrupt\\n"
o3 = traceback_ozeti(tb3)
assert o3["tur"] == "KeyboardInterrupt" and o3["mesaj"] == "", "Mesajsız hatada mesaj boş metin olmalı"
assert traceback_ozeti("SyntaxError: invalid syntax")["satir"] is None, "line ifadesi yoksa satir None olmalı"
''',
   'hints': ['Hatanın türü ve mesajı traceback\'in son satırındadır; satır numarası da EN SON "line N" ifadesindedir.', 'str.split(": ", 1) yalnızca ilk ayırıcıda böler; re.findall(r"line (\\d+)", metin) tüm numaraları liste olarak verir.', 'numaralar = re.findall(r"line (\\d+)", metin) ve satir = int(numaralar[-1]) if numaralar else None'],
   'why': 'Traceback alttan yukarı okunur: son satır "ne oldu", son File satırı "nerede oldu" sorusunu yanıtlar. split(": ", 1) mesajın kendi içindeki iki noktaları korur.'})

A({'t': 'code', 'stage': 'Rehberli', 'id': 'hata-ayiklama-r2', 'diff': 1,
   'q': '<p>Anadolu Market\'te <code>indirimli_fiyat(fiyat, oran)</code> fonksiyonu yanlış girdilerle sessizce saçma fiyatlar üretiyor. Varsayımları <code>assert</code> ile yaz:</p><ul><li><code>fiyat &gt;= 0</code> değilse mesaj: <code>"fiyat negatif olamaz"</code></li><li><code>0 &lt;= oran &lt;= 1</code> değilse mesaj: <code>"oran 0 ile 1 arasında olmalı"</code></li></ul><p>Sonra <code>round(fiyat * (1 - oran), 2)</code> döndür.</p>',
   'guide': ['Fonksiyonun ilk satırında fiyat için assert yaz.', 'İkinci assert ile oranın aralığını denetle (zincirli karşılaştırma kullanabilirsin).', 'Mesajları görevdeki metinlerle BİREBİR aynı yaz.', 'Hesabı yap ve yuvarlayıp döndür.'],
   'example': '''
def stoktan_dus(stok, adet):
    assert adet > 0, "adet pozitif olmalı"
    assert adet <= stok, "stok yetersiz"
    return stok - adet

print(stoktan_dus(10, 3))
try:
    stoktan_dus(2, 5)
except AssertionError as e:
    print("Yakalandı:", e)
''',
   'start': '''
def indirimli_fiyat(fiyat, oran):
    # TODO: fiyat negatifse "fiyat negatif olamaz" mesajlı assert
    # TODO: oran 0-1 dışındaysa "oran 0 ile 1 arasında olmalı" mesajlı assert
    return round(fiyat * (1 - oran), 2)
''',
   'sol': '''
def indirimli_fiyat(fiyat, oran):
    assert fiyat >= 0, "fiyat negatif olamaz"
    assert 0 <= oran <= 1, "oran 0 ile 1 arasında olmalı"
    return round(fiyat * (1 - oran), 2)
''',
   'tests': '''
assert indirimli_fiyat(200, 0.15) == 170.0, "200 TL %15 indirimle 170.0 olmalı"
assert indirimli_fiyat(99.9, 0) == 99.9, "oran 0 ise fiyat aynı kalmalı"
def _mesaj(f, o):
    try:
        indirimli_fiyat(f, o)
    except AssertionError as e:
        return str(e)
    return None
assert _mesaj(200, 15) == "oran 0 ile 1 arasında olmalı", "oran=15 (yüzde sanılmış) AssertionError vermeli"
assert _mesaj(200, -0.1) == "oran 0 ile 1 arasında olmalı", "negatif oran AssertionError vermeli"
assert _mesaj(-5, 0.1) == "fiyat negatif olamaz", "negatif fiyat AssertionError vermeli"
assert _mesaj(100, 1) is None, "oran tam 1 (yüzde 100 indirim) geçerli bir sınır değeri"
''',
   'hints': ['assert koşul, "mesaj" biçimi: koşul False ise mesajla AssertionError fırlar.', 'Aralık denetimini tek satırda yaz: 0 <= oran <= 1', 'assert 0 <= oran <= 1, "oran 0 ile 1 arasında olmalı"'],
   'why': 'assert, yanlış değeri doğduğu yerde durdurur. oran=15 gibi bir hata, assert olmadan -2800 TL gibi bir fiyat üretip çok sonra fark edilirdi.'})

A({'t': 'code', 'stage': 'Rehberli', 'id': 'hata-ayiklama-r3', 'diff': 2,
   'q': '<p>Sorunu küçültmenin ilk adımı, hatayı üreten kaydı bulmaktır. <code>ilk_bozuk_kayit(kayitlar, islem)</code> fonksiyonunu yaz: kayıtları sırayla gezsin, her birine <code>islem(kayit)</code> uygulasın; <b>ilk</b> hata veren kayıt için <code>(indeks, hata_turu_adi)</code> demetini döndürsün (ör. <code>(2, "ValueError")</code>). Hiçbiri hata vermezse <code>None</code> döndürsün.</p>',
   'guide': ['enumerate ile hem indeksi hem kaydı al.', 'islem(kayit) çağrısını try bloğuna koy.', 'except Exception as e ile yakala; hata türünün adı type(e).__name__ ile alınır.', 'İlk hatada hemen döndür; döngü biterse None döndür.'],
   'example': '''
degerler = ["10", "x", "30"]
for i, d in enumerate(degerler):
    try:
        int(d)
    except Exception as e:
        print(i, type(e).__name__, e)
''',
   'start': '''
def ilk_bozuk_kayit(kayitlar, islem):
    for i, kayit in enumerate(kayitlar):
        # TODO: islem(kayit) çağrısını try içine al
        # TODO: hata olursa (i, hata türünün adı) döndür
        pass
    return None
''',
   'sol': '''
def ilk_bozuk_kayit(kayitlar, islem):
    for i, kayit in enumerate(kayitlar):
        try:
            islem(kayit)
        except Exception as e:
            return i, type(e).__name__
    return None
''',
   'tests': '''
assert ilk_bozuk_kayit(["120", "85.5", "1.250,00", "x"], float) == (2, "ValueError"), "float(\\"1.250,00\\") ValueError verir: sonuç (2, \\"ValueError\\") olmalı (ilk bozuk kayıt)"
siparisler = [{"tutar": 10, "adet": 2}, {"tutar": 5}, {"adet": 1}]
assert ilk_bozuk_kayit(siparisler, lambda s: s["tutar"] * s["adet"]) == (1, "KeyError"), "1. kayıtta adet yok: (1, \\"KeyError\\") beklenir"
assert ilk_bozuk_kayit([4, 2, 1], lambda x: 10 / x) is None, "Hiç hata yoksa None döndürmeli"
assert ilk_bozuk_kayit([], float) is None, "Boş listede None döndürmeli"
assert ilk_bozuk_kayit([1, 0, "a"], lambda x: 10 / x) == (1, "ZeroDivisionError"), "Sıfıra bölme de yakalanmalı"
''',
   'hints': ['Hata yakalamak için try/except, indeks için enumerate kullan.', 'Hata türünün adı: type(e).__name__', 'except Exception as e:\n    return i, type(e).__name__'],
   'why': 'Elli bin kayıtlık bir dosyada sorunu gözle aramak yerine ilk bozuk kaydı otomatik buldun. Artık hatayı o tek kayıtla, yani minimal örnekle inceleyebilirsin.'})

# ---------- Kendin yaz ----------
A({'t': 'code', 'stage': 'Kendin yaz', 'id': 'hata-ayiklama-k1', 'diff': 2,
   'q': '<p>Üç hata ailesini otomatik ayırt et. <code>hata_sinifi(kod)</code> fonksiyonu Python kodunu metin olarak alsın ve şunu döndürsün:</p><ul><li>Kod derlenemiyorsa (SyntaxError, IndentationError dahil) <code>"sözdizimi"</code></li><li>Derleniyor ama çalışırken istisna fırlatıyorsa <code>"çalışma zamanı"</code></li><li>Sorunsuz çalışıyorsa <code>"çalıştı"</code></li></ul><p>İpucu: <code>compile(kod, "&lt;kod&gt;", "exec")</code> derler, <code>exec(derlenmis, {})</code> boş bir ad alanında çalıştırır.</p>',
   'start': '''
def hata_sinifi(kod):
    pass
''',
   'sol': '''
def hata_sinifi(kod):
    try:
        derlenmis = compile(kod, "<kod>", "exec")
    except SyntaxError:
        return "sözdizimi"
    try:
        exec(derlenmis, {})
    except Exception:
        return "çalışma zamanı"
    return "çalıştı"
''',
   'tests': '''
assert hata_sinifi("x = (1, 2") == "sözdizimi", "Kapanmamış parantez sözdizimi hatasıdır"
assert hata_sinifi("if True:\\nx = 1") == "sözdizimi", "IndentationError, SyntaxError\\'un alt sınıfıdır: sözdizimi"
assert hata_sinifi("d = {}\\nd[\\"a\\"]") == "çalışma zamanı", "Olmayan anahtar çalışırken KeyError verir"
assert hata_sinifi("x = 1 / 0") == "çalışma zamanı", "Sıfıra bölme çalışma zamanı hatasıdır"
assert hata_sinifi("x = 2\\ny = x * 3") == "çalıştı", "Hatasız kod çalıştı olmalı"
assert hata_sinifi("ortalama = sum([1, 2]) // 2") == "çalıştı", "Mantık hatası (// ile kuruş kaybı) otomatik yakalanamaz: kod çalışır"
''',
   'hints': ['İki ayrı try bloğu kullan: biri derleme, biri çalıştırma için.', 'IndentationError, SyntaxError\'un alt sınıfıdır; except SyntaxError ikisini de yakalar.'],
   'why': 'Derleme aşaması sözdizimini, çalıştırma aşaması çalışma zamanı hatalarını ortaya çıkarır. Son test önemli bir dersi gösterir: mantık hatası hiçbir aşamada "patlamaz"; onu ancak beklenen sonucu denetleyen testler yakalar.'})

A({'t': 'code', 'stage': 'Kendin yaz', 'id': 'hata-ayiklama-k2', 'diff': 1,
   'q': '<p>İyi soru, yarı cevaptır. <code>soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12")</code> fonksiyonu, yapay zekâya ya da foruma sorulacak metni şu biçimde döndürsün (satırlar <code>"\\n"</code> ile birleşir):</p><pre class="out">Hedef: {hedef}\nPython: {surum}\nKod:\n{kod}\nHata:\n{hata}\nBeklenen: {beklenen}\nDenediklerim:\n- {1. deneme}\n- {2. deneme}</pre><p><code>kod</code> ve <code>hata</code>\'nın sonundaki boşluk/satır sonları kırpılsın (<code>rstrip</code>). <code>denenenler</code> boş listeyse tek satır <code>- (henüz bir şey denemedim)</code> yazılsın.</p>',
   'start': '''
def soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12"):
    pass
''',
   'sol': '''
def soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12"):
    satirlar = [
        f"Hedef: {hedef}",
        f"Python: {surum}",
        "Kod:",
        kod.rstrip(),
        "Hata:",
        hata.rstrip(),
        f"Beklenen: {beklenen}",
        "Denediklerim:",
    ]
    if denenenler:
        for d in denenenler:
            satirlar.append(f"- {d}")
    else:
        satirlar.append("- (henüz bir şey denemedim)")
    return "\\n".join(satirlar)
''',
   'tests': '''
s = soru_sablonu("Şehre göre ciro toplamak", "t = {}\\nt['İzmir'] += 5\\n", "KeyError: 'İzmir'\\n", "{'İzmir': 5}", ["get kullanmayı denedim", "anahtarı yazdırdım"])
beklenen = "Hedef: Şehre göre ciro toplamak\\nPython: 3.12\\nKod:\\nt = {}\\nt['İzmir'] += 5\\nHata:\\nKeyError: 'İzmir'\\nBeklenen: {'İzmir': 5}\\nDenediklerim:\\n- get kullanmayı denedim\\n- anahtarı yazdırdım"
assert s == beklenen, "Biçim birebir aynı olmalı. Gelen:\\n" + str(s)
s2 = soru_sablonu("Ortalama", "print(1/0)", "ZeroDivisionError: division by zero", "hata yok", [], surum="3.13")
assert "Python: 3.13" in s2, "surum parametresi kullanılmalı"
assert s2.endswith("Denediklerim:\\n- (henüz bir şey denemedim)"), "Deneme yoksa \\"- (henüz bir şey denemedim)\\" satırı eklenmeli"
''',
   'hints': ['Satırları bir listede toplayıp en sonda "\\n".join ile birleştirmek en temiz yoldur.', 'Boş liste koşullarda False sayılır: if denenenler: ... else: ...'],
   'why': 'Hedef, minimal kod, tam hata, beklenen sonuç ve denediklerin: iyi bir sorunun beş parçası. Bu şablonu kullanan biri genellikle soruyu yazarken cevabı kendisi bulur.'})

# ---------- Hata avı ----------
A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b1', 'diff': 1,
   'q': '<p><b>Hatayı bul ve düzelt.</b> <code>son_n_gun_toplami(gunluk_ciro, n)</code> listenin son <code>n</code> gününün cirosunu toplamalı. Satış müdürü "son gün hiç sayılmıyor" diyor.</p>',
   'start': '''
def son_n_gun_toplami(gunluk_ciro, n):
    """Listenin son n gününün cirosunu toplar."""
    toplam = 0
    for i in range(len(gunluk_ciro) - n, len(gunluk_ciro) - 1):
        toplam += gunluk_ciro[i]
    return toplam
''',
   'sol': '''
def son_n_gun_toplami(gunluk_ciro, n):
    """Listenin son n gününün cirosunu toplar."""
    toplam = 0
    for i in range(len(gunluk_ciro) - n, len(gunluk_ciro)):
        toplam += gunluk_ciro[i]
    return toplam
''',
   'tests': '''
assert son_n_gun_toplami([100, 200, 300, 400], 2) == 700, "Son 2 gün 300 + 400 = 700 olmalı"
assert son_n_gun_toplami([100, 200, 300, 400], 1) == 400, "Son 1 gün 400 olmalı"
assert son_n_gun_toplami([100, 200, 300, 400], 4) == 1000, "Tüm günler 1000 olmalı"
''',
   'hints': ['range(baslangic, bitis) bitişi DAHİL ETMEZ.', 'Son indeks len - 1\'dir; onu da dahil etmek için bitiş len olmalı.'],
   'why': 'Klasik off-by-one: range\'in bitişi zaten hariçtir, ayrıca 1 çıkarınca son eleman iki kez dışarıda kalır. Daha Pythonic çözüm: <code>sum(gunluk_ciro[-n:])</code>.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b2', 'diff': 1,
   'q': '<p><b>Hatayı bul ve düzelt.</b> <code>onayli_toplam(siparisler)</code> durum alanı <code>"onaylandı"</code> olan siparişlerin tutarlarını toplamalı. Ama rapor çoğu gün yalnızca ilk siparişi sayıyor, bazen 0 veriyor.</p>',
   'start': '''
def onayli_toplam(siparisler):
    toplam = 0
    for s in siparisler:
        if s["durum"] == "onaylandı":
            toplam += s["tutar"]
        return toplam
''',
   'sol': '''
def onayli_toplam(siparisler):
    toplam = 0
    for s in siparisler:
        if s["durum"] == "onaylandı":
            toplam += s["tutar"]
    return toplam
''',
   'tests': '''
sip = [
    {"durum": "onaylandı", "tutar": 100},
    {"durum": "iptal", "tutar": 50},
    {"durum": "onaylandı", "tutar": 250},
]
assert onayli_toplam(sip) == 350, "100 + 250 = 350 olmalı; tüm siparişler gezilmeli"
assert onayli_toplam(sip[1:]) == 250, "İlk sipariş iptalse de diğerleri sayılmalı"
assert onayli_toplam([]) == 0, "Boş listede 0 dönmeli (None değil)"
''',
   'hints': ['return satırının girintisine bak: hangi bloğun içinde?', 'return döngüyle aynı hizada (for ile aynı sütunda) olmalı.'],
   'why': 'return döngünün içinde kalınca ilk turdan sonra fonksiyon biter. Boş listede ise döngüye hiç girilmez ve fonksiyon None döndürür. Python\'da girinti anlam taşır; bu tür hatayı rubber duck yöntemiyle sesli okuyarak çabucak yakalarsın.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b3', 'diff': 1,
   'q': '<p><b>Hatayı bul ve düzelt.</b> Ödemesi tamamlanan siparişin durumu <code>"kargoda"</code> olmalı. Kod hata vermiyor ama siparişler hep <code>"hazırlanıyor"</code> durumunda kalıyor.</p>',
   'start': '''
def durumu_guncelle(siparis):
    if siparis["odeme"] == "tamam":
        siparis["durum"] == "kargoda"
    return siparis
''',
   'sol': '''
def durumu_guncelle(siparis):
    if siparis["odeme"] == "tamam":
        siparis["durum"] = "kargoda"
    return siparis
''',
   'tests': '''
s = durumu_guncelle({"no": "AM-7", "odeme": "tamam", "durum": "hazırlanıyor"})
assert s["durum"] == "kargoda", "Ödeme tamamsa durum 'kargoda' olmalı"
s2 = durumu_guncelle({"no": "AM-8", "odeme": "bekliyor", "durum": "hazırlanıyor"})
assert s2["durum"] == "hazırlanıyor", "Ödeme bekliyorsa durum değişmemeli"
''',
   'hints': ['İkinci satırdaki işlem bir atama mı, yoksa karşılaştırma mı?', '== karşılaştırır ve sonucu (True/False) bir yere koymadan atar; atama = ile yapılır.'],
   'why': '<code>siparis["durum"] == "kargoda"</code> geçerli bir ifadedir: False üretir ve sonuç çöpe gider. Python hata vermez, çünkü sözdizimi doğrudur; bu yüzden mantık hatasıdır. ruff gibi araçlar "etkisiz ifade" uyarısıyla bunu yakalar.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b4', 'diff': 1,
   'q': '<p><b>Hatayı bul ve düzelt.</b> İK\'nın performans paneli çalışanın ortalama puanını 2 ondalıkla göstermeli. [4, 5, 4] puanları için 4.33 beklenirken ekranda hep 4 görünüyor.</p>',
   'start': '''
def ortalama_puan(puanlar):
    return round(sum(puanlar) // len(puanlar), 2)
''',
   'sol': '''
def ortalama_puan(puanlar):
    return round(sum(puanlar) / len(puanlar), 2)
''',
   'tests': '''
assert ortalama_puan([4, 5, 4]) == 4.33, "13 / 3 = 4.333... → 4.33 olmalı"
assert ortalama_puan([3, 4]) == 3.5, "7 / 2 = 3.5 olmalı"
assert ortalama_puan([5]) == 5, "Tek puanda puanın kendisi"
''',
   'hints': ['Python\'da iki bölme operatörü vardır: / ve //', '// tamsayı (taban) bölmesidir, kesirli kısmı atar.'],
   'why': '// taban bölmesi yapar: 13 // 3 = 4. round sonradan kesirli kısmı geri getiremez. Ortalama, oran ve para hesaplarında / kullanılır.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b5', 'diff': 2,
   'q': '<p><b>Hatayı bul ve düzelt.</b> Her müşteriye yeni bir sepet açılıyor. Ama Mehmet sepetini açtığında Ayşe\'nin ürünlerini görüyor! <code>yeni_sepet</code> ve <code>sepete_ekle</code> fonksiyonlarını düzelt; çağıranın verdiği bir liste varsa o yine kullanılabilmeli.</p>',
   'start': '''
def yeni_sepet(musteri, urunler=[]):
    return {"musteri": musteri, "urunler": urunler}

def sepete_ekle(sepet, urun):
    sepet["urunler"].append(urun)
''',
   'sol': '''
def yeni_sepet(musteri, urunler=None):
    if urunler is None:
        urunler = []
    return {"musteri": musteri, "urunler": urunler}

def sepete_ekle(sepet, urun):
    sepet["urunler"].append(urun)
''',
   'tests': '''
a = yeni_sepet("Ayşe")
sepete_ekle(a, "çay")
b = yeni_sepet("Mehmet")
assert b["urunler"] == [], "Mehmet'in sepeti boş başlamalı; varsayılan liste paylaşılıyor"
sepete_ekle(b, "kahve")
assert a["urunler"] == ["çay"], "Ayşe'nin sepetinde yalnızca çay olmalı"
c = yeni_sepet("Zeynep", ["süt"])
assert c["urunler"] == ["süt"], "Verilen liste kullanılmalı"
''',
   'hints': ['Varsayılan değer fonksiyon tanımlanırken bir kez oluşturulur.', 'Varsayılanı None yap; fonksiyonun içinde None ise yeni bir boş liste oluştur.'],
   'why': 'Değişebilir (mutable) varsayılan bütün çağrılarda aynı nesnedir; veri müşteriler arasında sızar. None + içeride yeni liste, Python\'ın standart kalıbıdır.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b6', 'diff': 2,
   'q': '<p><b>Hatayı bul ve düzelt.</b> <code>sepet_ozeti(sepetler)</code> her sepetin toplamını ve genel toplamı <code>(liste, genel)</code> olarak döndürmeli. Çalıştırınca <code>TypeError: \'int\' object is not callable</code> alıyorsun. Değişkene anlamlı ve yerleşik fonksiyonları gölgelemeyen bir ad ver.</p>',
   'start': '''
def sepet_ozeti(sepetler):
    """Her sepetin toplamını ve genel toplamı döndürür."""
    sonuc = []
    for sepet in sepetler:
        sum = 0
        for fiyat in sepet:
            sum += fiyat
        sonuc.append(sum)
    genel = sum(sonuc)
    return sonuc, genel
''',
   'sol': '''
def sepet_ozeti(sepetler):
    """Her sepetin toplamını ve genel toplamı döndürür."""
    sonuc = []
    for sepet in sepetler:
        sepet_toplami = 0
        for fiyat in sepet:
            sepet_toplami += fiyat
        sonuc.append(sepet_toplami)
    genel = sum(sonuc)
    return sonuc, genel
''',
   'tests': '''
assert sepet_ozeti([[10, 20], [5], [1, 2, 3]]) == ([30, 5, 6], 41), "([30, 5, 6], 41) bekleniyor"
assert sepet_ozeti([]) == ([], 0), "Boş girdide ([], 0) dönmeli"
assert "sum =" not in __source__ and "sum +=" not in __source__, "sum yerleşik bir fonksiyondur; değişkene bu adı verme"
''',
   'hints': ['Hata mesajı "int çağrılamaz" diyor: hangi ad hem sayı hem fonksiyon olarak kullanılıyor?', 'Fonksiyon içinde sum\'a atama yapınca o ad yerelde bir sayıya dönüşür ve yerleşik sum() gizlenir.'],
   'why': 'Bir adı yeniden atamak, aynı adlı yerleşik fonksiyonu o kapsamda gölgeler (shadowing). sum, list, max, min, id, input, type sık gölgelenen adlardır. Anlamlı ad (sepet_toplami) hem hatayı giderir hem de kodu okunur kılar.'})

A({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'hata-ayiklama-b7', 'diff': 2,
   'q': '<p><b>Hatayı bul ve düzelt.</b> Bu sabahki sorun: İzmir cirosu 0 TL çıkıyor ama İzmir\'den siparişler olduğu kesin. Kod hata vermiyor. Önce <code>print</code> ile bir kaydın anahtarlarına bak, sonra düzelt.</p>',
   'start': '''
siparisler = [
    {"no": "AM-1", "sehir": "İzmir", "tutar": 300},
    {"no": "AM-2", "sehir": "Ankara", "tutar": 150},
    {"no": "AM-3", "sehir": "İzmir", "tutar": 120},
]

def sehir_cirosu(siparisler, sehir):
    toplam = 0
    for s in siparisler:
        if s.get("şehir") == sehir:
            toplam += s["tutar"]
    return toplam

print(sehir_cirosu(siparisler, "İzmir"))
''',
   'sol': '''
siparisler = [
    {"no": "AM-1", "sehir": "İzmir", "tutar": 300},
    {"no": "AM-2", "sehir": "Ankara", "tutar": 150},
    {"no": "AM-3", "sehir": "İzmir", "tutar": 120},
]

def sehir_cirosu(siparisler, sehir):
    toplam = 0
    for s in siparisler:
        if s["sehir"] == sehir:
            toplam += s["tutar"]
    return toplam

print(sehir_cirosu(siparisler, "İzmir"))
''',
   'tests': '''
assert sehir_cirosu(siparisler, "İzmir") == 420, "İzmir cirosu 300 + 120 = 420 olmalı"
assert sehir_cirosu(siparisler, "Ankara") == 150, "Ankara cirosu 150 olmalı"
assert sehir_cirosu(siparisler, "Bursa") == 0, "Siparişi olmayan şehir 0"
''',
   'hints': ['print(siparisler[0].keys()) ile gerçek anahtar adlarına bak.', 'Veride "sehir" (s ile), kodda "şehir" (ş ile) yazıyor. .get olmayan anahtarda None döndürdüğü için hata gizleniyor.'],
   'why': '.get olmayan anahtarda sessizce None döndürür; None hiçbir şehre eşit olmadığı için toplam 0 kalır. Anahtarın her zaman var olması gereken yerde köşeli parantez kullanmak hatayı KeyError olarak hemen görünür kılardı. Anahtar adını elle yazmak yerine veriden kopyala.'})

# ---------- Meydan okuma ----------
A({'t': 'code', 'stage': 'Meydan okuma', 'id': 'hata-ayiklama-m1', 'diff': 3,
   'q': '<p>Minimal örneği otomatik bul. <code>kucult(kayitlar, hata_verir)</code> fonksiyonunu yaz. <code>hata_verir(liste)</code>, verilen liste hatayı üretiyorsa True döndüren bir fonksiyondur.</p><ul><li>Başlangıç listesi hatayı üretmiyorsa <code>ValueError("başlangıç listesi hatayı üretmiyor")</code> fırlat.</li><li>Elemanları tek tek çıkarmayı dene: çıkarınca hata hâlâ oluşuyorsa o elemanı kalıcı olarak at, oluşmuyorsa tut ve sonrakine geç.</li><li>Sonuç <b>1-minimal</b> olmalı: hatayı üretir ama içinden herhangi tek bir eleman çıkarılırsa artık üretmez.</li><li>Girdi listesini değiştirme; elemanların göreli sırasını koru.</li></ul>',
   'start': '''
def kucult(kayitlar, hata_verir):
    pass
''',
   'sol': '''
def kucult(kayitlar, hata_verir):
    if not hata_verir(list(kayitlar)):
        raise ValueError("başlangıç listesi hatayı üretmiyor")
    sonuc = list(kayitlar)
    i = 0
    while i < len(sonuc):
        aday = sonuc[:i] + sonuc[i + 1:]
        if hata_verir(aday):
            sonuc = aday
        else:
            i += 1
    return sonuc
''',
   'tests': '''
def _bir_minimal(sonuc, f):
    return f(sonuc) and all(not f(sonuc[:i] + sonuc[i + 1:]) for i in range(len(sonuc)))

veri = [100, -5, 30, -2, 80]
kopya = list(veri)
negatif_var = lambda l: any(x < 0 for x in l)
r = kucult(veri, negatif_var)
assert veri == kopya, "Girdi listesi değiştirilmemeli"
assert len(r) == 1 and r[0] < 0, "Tek bir negatif sayı yeterli: sonuç tek elemanlı olmalı, gelen " + str(r)

ikili = lambda l: "A" in l and "B" in l
r2 = kucult(["x", "A", "y", "z", "B", "w"], ikili)
assert r2 == ["A", "B"], "Hata A ve B birlikteyken oluşuyor: ['A', 'B'] beklenir (sıra korunmalı), gelen " + str(r2)

buyuk = lambda l: sum(l) > 1000
r3 = kucult([400, 300, 200, 500, 100], buyuk)
assert _bir_minimal(r3, buyuk), "Sonuç 1-minimal olmalı: hangi elemanı çıkarsan hata kaybolmalı, gelen " + str(r3)

try:
    kucult([1, 2, 3], negatif_var)
    assert False, "Hata üretmeyen başlangıç listesinde ValueError beklenir"
except ValueError as e:
    assert str(e) == "başlangıç listesi hatayı üretmiyor", "ValueError mesajı görevdeki gibi olmalı"
''',
   'hints': ['Bir indeks i ile listede ilerle; aday = sonuc[:i] + sonuc[i+1:] i. elemanı çıkarılmış kopyadır.', 'Aday hâlâ hata veriyorsa sonuc = aday yap ve i\'yi ARTIRMA (aynı konuma yeni bir eleman kaydı); vermiyorsa i += 1.'],
   'why': 'Bu, delta debugging fikrinin sade hâlidir: hatayı üreten girdiden gereksiz her parçayı atarak tekrar üreten en küçük örneğe inersin. Gerçek araçlar parçaları ikiye bölerek daha hızlı ilerler ama ilke aynıdır.'})

LESSON = {
    'id': 'hata-ayiklama', 'lv': 'temel', 'mod': 'Dosya ve Hata', 'min': 35,
    'title': 'Hata ayıklama (debugging)',
    'sum': 'Traceback\'i alttan yukarı okur, print ve f"{x=}" ile izler, assert ile varsayımları denetler, pdb ve VS Code ile adım adım ilerler, sorunu küçültüp doğru soruyu sorarak hatayı yöntemle bulursun.',
    'goals': [
        'Traceback\'i alttan yukarı okuyup hatanın türünü ve yerini bulabilirim.',
        'Sözdizimi, çalışma zamanı ve mantık hatalarını ayırt edebilirim.',
        'print, f"{x=}", assert ve breakpoint()/pdb ile kodun gerçekte ne yaptığını izleyebilirim.',
        'Sorunu minimal bir örneğe küçültüp arama motoruna ya da yapay zekâya doğru soruyu sorabilirim.',
        'Off-by-one, döngü içi return, değişebilir varsayılan, gölgeleme gibi klasik böcekleri tanıyıp düzeltebilirim.',
    ],
    'body': BODY,
    'ex': EX,
    'faq': [
        {'q': 'print ile mi ayıklamalıyım, debugger ile mi?', 'a': 'İkisi de meşru. Küçük betikte ve hızlı bir hipotezi denerken print (özellikle f"{x=}") çoğu zaman yeterli ve hızlıdır. Döngünün 500. turunda ne olduğunu görmek, çağrı yığınında gezmek ya da birçok değişkene aynı anda bakmak gerekiyorsa debugger zaman kazandırır.'},
        {'q': 'Traceback kütüphane dosyalarıyla doluysa ne yapmalıyım?', 'a': 'Alttan yukarı çık ve kendi dosyanın ilk geçtiği File satırını bul. Hata çoğunlukla oradan kütüphaneye verdiğin değerdedir (yanlış tür, None, boş veri). Kütüphanenin kendisinin hatalı olması çok daha nadirdir.'},
        {'q': 'assert ile if + raise arasındaki fark ne?', 'a': 'assert programcı varsayımları içindir ve python -O ile kapatılabilir. Kullanıcı girdisini, dosya içeriğini ya da dış sistemden gelen veriyi doğrulamak için her zaman if + raise ValueError kullan; bu denetim asla kapatılmamalıdır.'},
        {'q': 'Yapay zekâ düzeltmeyi verdi ve çalıştı. Yeterli mi?', 'a': 'Hayır. Neden çalıştığını anlayana kadar iş bitmiş sayılmaz. Hatayı yeniden üreten küçük bir test ekle, düzeltmenin yalnızca belirtiyi mi yoksa nedeni mi giderdiğini kontrol et. Anlamadığın düzeltme ileride daha zor bir hataya dönüşebilir.'},
        {'q': 'Hata bazen oluyor bazen olmuyor. Nereden başlamalıyım?', 'a': 'Önce tekrarlanabilir hâle getir: rastgeleliği seed ile sabitle, girdiyi kaydet, tarih-saati sabit ver. Tekrarlanamayan hata ayıklanamaz; tekrarlanınca normal bir hataya dönüşür.'},
    ],
    'mistakes': [
        {'bad': 'try:\n    rapor = hazirla(veri)\nexcept:\n    pass', 'good': 'try:\n    rapor = hazirla(veri)\nexcept KeyError as e:\n    print("Eksik alan:", e)\n    raise', 'why': 'Hatayı yutmak, hata ayıklamanın en büyük düşmanıdır: traceback kaybolur ve sorun çok sonra başka bir yerde ortaya çıkar.'},
        {'bad': 'print(toplam)\nprint(adet)', 'good': 'print(f"{toplam=} {adet=}")', 'why': 'Etiketsiz print çıktıları karışır; hangi sayının hangi değişkene ait olduğunu unutursun. f"{x=}" adıyla birlikte yazar.'},
        {'bad': 'def oran_hesapla(kullanici_girdisi):\n    assert kullanici_girdisi > 0\n    ...', 'good': 'def oran_hesapla(kullanici_girdisi):\n    if kullanici_girdisi <= 0:\n        raise ValueError("pozitif olmalı")\n    ...', 'why': 'assert -O ile kapatılabilir; kullanıcı ve dış veri doğrulaması her zaman açık kalmalıdır.'},
        {'bad': 'for i in range(1, len(gunler)):\n    print(gunler[i])', 'good': 'for gun in gunler:\n    print(gun)', 'why': 'İndeksle gezmek off-by-one hatasına kapı açar; doğrudan elemanlar üzerinde gezmek hem daha kısa hem daha güvenlidir.'},
        {'bad': 'sehir = s.get("şehir")   # anahtar aslında "sehir"', 'good': 'sehir = s["sehir"]', 'why': 'Var olması gereken anahtarda .get hatayı gizler ve None döndürür; köşeli parantez yanlış anahtarı KeyError ile hemen gösterir.'},
    ],
}

emit(LESSON, '/home/claude/py/v2/t4/hata-ayiklama.js', 'Hata ayıklama (debugging) — temel / Dosya ve Hata')
