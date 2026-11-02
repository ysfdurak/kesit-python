/* PythonPatika v2 — uzantı: fonksiyonlar */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'fonksiyonlar',
  min: 40,
  html: `
<h2>Docstring: fonksiyonun kullanım kılavuzu</h2>
<p>Fonksiyon gövdesinin ilk satırına yazılan üç tırnaklı metne belge dizgisi (docstring) denir. Yorumdan farkı, çalışma anında erişilebilir olmasıdır: <code>help(fonksiyon)</code> ve <code>fonksiyon.__doc__</code> onu gösterir, VS Code fareyle üzerine gelince açar. Ekip kodunda herkese açık her fonksiyonun bir docstring'i olur: ne yaptığı, parametreleri, dönüş değeri ve hangi durumda hata verdiği.</p>
<pre class="py">def taksit(tutar: float, ay: int, faiz: float = 0.0) -&gt; float:
    """Aylık taksit tutarını hesaplar.

    Args:
        tutar: Kredi anaparası (TL).
        ay: Taksit sayısı, 1 veya daha büyük.
        faiz: Aylık faiz oranı (0.02 = %2).

    Returns:
        2 ondalığa yuvarlanmış aylık taksit.

    Raises:
        ValueError: ay 1'den küçükse.
    """
    if ay &lt; 1:
        raise ValueError("ay en az 1 olmalı")
    if faiz == 0:
        return round(tutar / ay, 2)
    return round(tutar * faiz / (1 - (1 + faiz) ** -ay), 2)

print(taksit(12000, 12), taksit(12000, 12, 0.02))
print(taksit.__doc__.splitlines()[0])
print(taksit.__annotations__)</pre>
<p>Tip ipuçları (<code>tutar: float</code>, <code>-&gt; float</code>) da <code>__annotations__</code> içinde saklanır ama Python çalışma anında onları <b>denetlemez</b>; <code>taksit("abc", 3)</code> yine çağrılır ve içeride hata verir. Denetimi mypy gibi araçlar ve editörün yapar. "Değer ya da None" dönen fonksiyonlar için <code>-&gt; float | None</code>, liste için <code>list[float]</code>, sözlük için <code>dict[str, int]</code> yazılır.</p>

<h2>Parametrelerin tam sırası</h2>
<p>Bir fonksiyon tanımında parametre türlerinin sırası sabittir. Hepsini bir arada pek görmezsin ama kütüphane belgelerini okurken bu kalıbı tanıman gerekir.</p>
<div class="tbl-wrap"><table>
<tr><th>Sıra</th><th>Tür</th><th>Yazım</th><th>Nasıl çağrılır?</th></tr>
<tr><td>1</td><td>Yalnız konumsal</td><td><code>a, /</code></td><td>Yalnızca sırayla: <code>f(1)</code></td></tr>
<tr><td>2</td><td>Normal</td><td><code>b</code>, <code>c=2</code></td><td>Sırayla ya da adla</td></tr>
<tr><td>3</td><td>Değişken konumsal</td><td><code>*args</code></td><td>Fazla konumsal argümanlar demet olur</td></tr>
<tr><td>4</td><td>Yalnız anahtar sözcüklü</td><td><code>*</code> ya da <code>*args</code> sonrası: <code>d</code></td><td>Yalnızca adla: <code>d=4</code></td></tr>
<tr><td>5</td><td>Değişken anahtar sözcüklü</td><td><code>**kwargs</code></td><td>Fazla adlı argümanlar sözlük olur</td></tr>
</table></div>
<pre class="py">def ornek(a, /, b, c=2, *args, d, **kwargs):
    print(a, b, c, args, d, kwargs)

ornek(1, 2, d=4)
ornek(1, 2, 3, 9, 9, d=4, rapor=True)
try:
    ornek(a=1, b=2, d=4)
except TypeError as h:
    print("Hata:", h)</pre>
<p>Son çağrının hata mesajı ilginçtir: <code>a</code> yalnız konumsal olduğu için <code>a=1</code> onun yerine geçmez, <code>**kwargs</code> sözlüğüne düşer; Python da "a eksik" der. Yalnız konumsal parametreler bu yüzden kullanılır: parametre adını ileride değiştirmek, çağıranların kodunu bozmaz. <code>len(obj)</code> gibi yerleşik fonksiyonlar da böyle tanımlıdır.</p>

<h2>Çağrı tarafında açma: * ve **</h2>
<p><code>*args</code> ve <code>**kwargs</code>'ın tersi de var: çağrı sırasında bir listeyi <code>*</code> ile konumsal argümanlara, bir sözlüğü <code>**</code> ile adlı argümanlara dağıtabilirsin. Ayarları bir yapılandırma sözlüğünde tutup fonksiyona tek hamlede vermek böyle yapılır.</p>
<pre class="py">def fiyat(tutar, kdv=0.20, indirim=0):
    return round(tutar * (1 + kdv) - indirim, 2)

kampanya = {"kdv": 0.10, "indirim": 5}
print(fiyat(100, **kampanya))          # fiyat(100, kdv=0.10, indirim=5)
arg = [250, 0.01]
print(fiyat(*arg))                     # fiyat(250, 0.01)
try:
    fiyat(100, **{"kdv": 0.1, "kargo": 30})
except TypeError as h:
    print("Bilinmeyen ayar:", h)</pre>
<p>Sözlükte fonksiyonun tanımadığı bir anahtar varsa <code>TypeError</code> alırsın; bu iyi bir şeydir, yazım hatalı ayar adlarını hemen yakalar.</p>

<h2>Argüman nasıl aktarılır: kopya mı, referans mı?</h2>
<p>Python argümanı ne kopyalar ne de "değişkenin kendisini" verir: parametre, çağıranın nesnesine bağlanan <b>yeni bir addır</b> (nesne referansıyla aktarım). Sonuç iki kurala iner: parametre üzerinden nesneyi <b>değiştirirsen</b> (append, sözlüğe atama) çağıran da görür; parametreye <b>yeni bir değer atarsan</b> yalnız yerel ad değişir, çağıran etkilenmez.</p>
<pre class="py">def ekle(sepet, urun):
    sepet.append(urun)        # nesneyi değiştirir: çağıran görür

def sifirla(sepet):
    sepet = []                # yalnız yerel adı yeniden bağlar

def bosalt(sepet):
    sepet.clear()             # nesneyi değiştirir

s = ["çay"]
ekle(s, "kahve"); print(s)
sifirla(s); print(s)          # değişmedi!
bosalt(s); print(s)</pre>
<div class="warn"><b>Gizli yan etki</b>Bir fonksiyonun aldığı listeyi ya da sözlüğü sessizce değiştirmesi en zor bulunan hatalardandır. Kural: ya girdiyi değiştirme ve yeni nesne döndür (saf fonksiyon), ya da değiştiriyorsan adında ve docstring'inde belirt ve <code>None</code> döndür (<code>list.sort()</code> gibi).</div>

<h2>Fonksiyon alan fonksiyonlar</h2>
<p>Fonksiyonlar değer olduğu için başka bir fonksiyona argüman olarak verilebilir. <code>sorted(..., key=...)</code> bunun en bilinen örneği. Kendi fonksiyonların da "nasıl" kısmını dışarıdan alabilir; böylece aynı döngüyü farklı kurallarla yeniden kullanırsın. Bu tür fonksiyonlara üst düzey fonksiyon (higher-order function) denir.</p>
<pre class="py">def uygula(degerler, islem):
    sonuc = []
    for d in degerler:
        sonuc.append(islem(d))
    return sonuc

def kdv_ekle(f):
    return round(f * 1.2, 2)

print(uygula([100, 49.9], kdv_ekle))
print(uygula(["  izmir ", "ANKARA"], str.strip))
print(uygula([-3, 4], abs))</pre>
<p>Tek satırlık küçük fonksiyonları yerinde tanımlamak için <code>lambda</code>, hazır <code>map</code>/<code>filter</code> ve fonksiyon döndüren fonksiyonlar (kapanış, closure) Fonksiyonel programlama ve Kapanışlar derslerinde; kendini çağıran fonksiyonlar ise Özyineleme dersinde.</p>
<div class="note"><b>Gerçek işte</b>Kod incelemelerinde fonksiyonlara bakılan ilk şeyler: tek bir iş yapıyor mu, adı fiil mi (<code>hesapla_</code>, <code>getir_</code>, <code>kaydet_</code>), girdisini gizlice değiştiriyor mu, docstring'i ve tip ipuçları var mı, hata durumunda ne yapıyor? Küçük, saf ve belgelenmiş fonksiyonlar birim testle kolayca sınanır; Test yazma dersinde göreceğin <code>assert</code> tabanlı testler tam olarak bu fonksiyonlar üzerine kurulur.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdaki fonksiyonlardan hangisi <b>çağıranın listesini</b> değiştirir?',
      o: ['def f(l): l = l + [1]', 'def f(l): l = [1]', 'def f(l): l.append(1)', 'def f(l): return l + [1]'],
      a: 2,
      why: 'append nesnenin kendisini değiştirir; çağıran aynı nesneyi gördüğü için değişikliği görür. l = ... yeni nesneyi yalnız yerel ada bağlar; l + [1] ise yeni liste üretir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Değiştirme mi, yeniden bağlama mı? Bu kod ne yazdırır?',
      code: 'def a(l):\n    l.append(4)\n\ndef b(l):\n    l = [0]\n\nx = [1]\na(x)\nb(x)\nprint(x)\n',
      o: ['[1]', '[1, 4]', '[0]', '[0, 4]'],
      a: 1,
      why: 'a nesneyi değiştirir (4 eklenir). b ise yerel l adını yeni bir listeye bağlar; x\'in gösterdiği nesneye dokunmaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Çağrıda açma: bu kod ne yazdırır?',
      code: 'def fiyat(tutar, kdv=0.2, indirim=0):\n    return round(tutar * (1 + kdv) - indirim, 2)\n\nayar = {"kdv": 0.1, "indirim": 5}\nargs = [100]\nprint(fiyat(*args, **ayar), fiyat(200, **{"indirim": 10}))\n',
      o: ['115.0 230.0', '105.0 230.0', '105.0 220.0', 'TypeError'],
      a: 1,
      why: 'İlk çağrı fiyat(100, kdv=0.1, indirim=5) = 110 - 5 = 105.0. İkincisinde kdv varsayılan 0.2 kalır: 240 - 10 = 230.0.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalıştırılınca ne olur?',
      code: 'def transfer(hesap, /, tutar, *, aciklama):\n    return f"{hesap}: {tutar} ({aciklama})"\n\nprint(transfer("TR01", 500, aciklama="kira"))\nprint(transfer(hesap="TR01", tutar=500, aciklama="kira"))\n',
      o: ['İki satır da aynı metni yazar', 'İlk satırı yazar, sonra TypeError verir', 'İlk satırda TypeError verir', 'SyntaxError verir'],
      a: 1,
      raises: true,
      why: '/ işaretinden önceki hesap yalnız konumsal verilebilir; adla verilince TypeError olur. İlk çağrı kurallara uyduğu için çalışır ve yazdırılır.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Docstring\'li bir ortalama fonksiyonu tanımlayıp hem sonucu hem belgesini yazdıran programın satırlarını sırala.</p>',
      lines: ['def ortalama(sayilar):', '    """Sayı listesinin ortalamasını döndürür; boşsa None."""', '    if not sayilar:', '        return None', '    return sum(sayilar) / len(sayilar)', 'print(ortalama([10, 20, 60]), ortalama([]))', 'print(ortalama.__doc__)'],
      expect: '30.0 None\nSayı listesinin ortalamasını döndürür; boşsa None.\n',
      hint: 'Docstring fonksiyon gövdesinin İLK ifadesi olmalı; başka yerde olursa __doc__ None olur.',
      why: 'Docstring yalnızca gövdenin ilk ifadesiyse __doc__\'a atanır. Boş liste kontrolü bölmeden önce gelir; aksi halde ZeroDivisionError olur.' },
    { id: 'fonksiyonlar-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>uygula(degerler, islem)</code> fonksiyonunu yaz: <code>islem</code> tek argüman alan bir fonksiyondur. <code>degerler</code> listesindeki her elemana <code>islem</code>\'i uygulayıp sonuçlardan oluşan <b>yeni</b> liste döndür. Ardından <code>kdv_ekle(f)</code> fonksiyonunu yaz: fiyata %20 ekleyip 2 ondalığa yuvarlasın.</p>',
      guide: ['uygula içinde boş bir sonuç listesi oluştur.', 'Her d için islem(d) çağır ve sonucu ekle (islem\'i parantezsiz alıp burada çağırıyorsun).', 'Listeyi döndür.', 'kdv_ekle(f): round(f * 1.2, 2) döndürsün.'],
      example: 'def iki_kat(x):\n    return x * 2\n\ndef her_birine(liste, fn):\n    for x in liste:\n        print(fn(x))\n\nher_birine([1, 2], iki_kat)\n',
      start: 'def uygula(degerler, islem):\n    sonuc = []\n    # TODO: her elemana islem uygula\n    return sonuc\n\ndef kdv_ekle(f):\n    # TODO\n    pass\n',
      sol: 'def uygula(degerler, islem):\n    sonuc = []\n    for d in degerler:\n        sonuc.append(islem(d))\n    return sonuc\n\ndef kdv_ekle(f):\n    return round(f * 1.2, 2)\n',
      tests: 'assert uygula([100, 49.9], kdv_ekle) == [120.0, 59.88], "kdv_ekle her fiyata uygulanmalı"\nassert uygula([" a ", "b "], str.strip) == ["a", "b"], "herhangi bir fonksiyonla çalışmalı (str.strip)"\nassert uygula([], abs) == [], "boş liste"\nv = [-1, 2]\nuygula(v, abs)\nassert v == [-1, 2], "girdi listesi değişmemeli"\n',
      hints: ['Fonksiyon bir değerdir: islem(d) ile çağırırsın.', 'kdv_ekle\'yi uygula\'ya verirken parantez koyma: uygula(liste, kdv_ekle)'],
      why: 'Döngü "nasıl gezileceğini", islem ise "her elemana ne yapılacağını" belirler. İkisini ayırmak aynı döngüyü sınırsız işlemle kullanmanı sağlar; bu, map fonksiyonunun kendisidir.' },
    { id: 'fonksiyonlar-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Aşağıdaki <code>bicimle</code> fonksiyonu hazır. <code>toplu_bicimle(tutarlar, ayarlar)</code> fonksiyonunu yaz: <code>ayarlar</code> bir sözlüktür (ör. <code>{"para": "USD", "ondalik": 0}</code>, boş da olabilir). Her tutarı <code>bicimle</code> ile, ayarları <code>**</code> ile açarak biçimlendir ve metin listesi döndür.</p>',
      guide: ['bicimle\'yi olduğu gibi bırak.', 'Boş sonuç listesi oluştur.', 'Her tutar için bicimle(tutar, **ayarlar) çağır ve ekle.', 'Listeyi döndür.'],
      example: 'def selamla(ad, unvan="", nokta="."):\n    return f"Merhaba {unvan}{ad}{nokta}"\n\nayar = {"unvan": "Dr. ", "nokta": "!"}\nprint(selamla("Ece", **ayar))\nprint(selamla("Can", **{}))\n',
      start: 'def bicimle(tutar, para="TL", ondalik=2):\n    return f"{tutar:,.{ondalik}f} {para}"\n\ndef toplu_bicimle(tutarlar, ayarlar):\n    sonuc = []\n    for t in tutarlar:\n        # TODO: ayarları ** ile aç\n        sonuc.append(bicimle(t))\n    return sonuc\n',
      sol: 'def bicimle(tutar, para="TL", ondalik=2):\n    return f"{tutar:,.{ondalik}f} {para}"\n\ndef toplu_bicimle(tutarlar, ayarlar):\n    sonuc = []\n    for t in tutarlar:\n        sonuc.append(bicimle(t, **ayarlar))\n    return sonuc\n',
      tests: 'assert toplu_bicimle([1234.5, 10], {}) == ["1,234.50 TL", "10.00 TL"], "ayar yoksa varsayılanlar"\nassert toplu_bicimle([1234.5], {"para": "USD", "ondalik": 0}) == ["1,234 USD"], "ayarlar ** ile aktarılmalı"\nassert toplu_bicimle([5], {"ondalik": 1}) == ["5.0 TL"], "yalnız bazı ayarlar verilebilir"\n',
      hints: ['f(**{"a": 1}) çağrısı f(a=1) ile aynıdır.', 'bicimle(t, **ayarlar)'],
      why: '** sözlüğü adlı argümanlara açar; sözlükte olmayan parametreler varsayılan değerini korur. Ayarları tek bir yapılandırma sözlüğünde tutmanın standart yolu budur.' },
    { id: 'fonksiyonlar-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>iskonto(fiyat: float, oran: float) -&gt; float</code> fonksiyonunu yaz. Fiyata oran kadar indirim uygulayıp 2 ondalığa yuvarlanmış sonucu döndürsün. Gereksinimler:</p><ul><li>Bir docstring olsun (ilk satırı ne yaptığını anlatsın).</li><li>Parametre ve dönüş tip ipuçları yazılsın.</li><li><code>oran</code> 0 ile 1 arasında (ikisi dahil) değilse ya da fiyat negatifse <code>ValueError</code> fırlatsın.</li></ul>',
      guide: ['def satırına tip ipuçlarını ve -> float dönüş tipini yaz.', 'Gövdenin ilk satırına üç tırnaklı docstring koy.', 'Koruma koşulu: if not 0 <= oran <= 1 or fiyat < 0: raise ValueError("...")', 'round(fiyat * (1 - oran), 2) döndür.'],
      example: 'def kdv(tutar: float, oran: float = 0.2) -> float:\n    """KDV tutarını hesaplar."""\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    return round(tutar * oran, 2)\n\nprint(kdv(100), kdv.__doc__, kdv.__annotations__)\n',
      start: 'def iskonto(fiyat, oran):\n    # TODO: tip ipuçları, docstring, doğrulama\n    return round(fiyat * (1 - oran), 2)\n',
      sol: 'def iskonto(fiyat: float, oran: float) -> float:\n    """Fiyata oran kadar indirim uygular ve 2 ondalığa yuvarlar.\n\n    oran 0 ile 1 arasında olmalı; fiyat negatif olamaz.\n    """\n    if not 0 <= oran <= 1 or fiyat < 0:\n        raise ValueError("geçersiz fiyat ya da oran")\n    return round(fiyat * (1 - oran), 2)\n',
      tests: 'assert iskonto(200, 0.15) == 170.0, "200 TL %15 indirim: 170"\nassert iskonto(99.9, 0) == 99.9 and iskonto(50, 1) == 0, "sınır oranlar 0 ve 1 geçerli"\nassert iskonto.__doc__ and iskonto.__doc__.strip(), "docstring yazılmalı"\na = iskonto.__annotations__\nassert a.get("fiyat") is float and a.get("oran") is float and a.get("return") is float, f"tip ipuçları eksik: {a}"\nfor f, o in [(100, 1.5), (100, -0.1), (-5, 0.1)]:\n    try:\n        iskonto(f, o)\n        assert False, f"iskonto({f}, {o}) ValueError vermeliydi"\n    except ValueError:\n        pass\n',
      hints: ['Docstring gövdenin ilk ifadesi olmalı.', 'Zincirleme karşılaştırma: 0 <= oran <= 1', 'def iskonto(fiyat: float, oran: float) -> float:'],
      why: 'Docstring ve tip ipuçları fonksiyonun sözleşmesini belgeler; doğrulama ise sözleşmeye uymayan girdiyi sessiz yanlış sonuç yerine açık bir hatayla reddeder.' },
    { id: 'fonksiyonlar-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Saf fonksiyon: <code>temizle(kayitlar)</code> fonksiyonunu yaz. <code>kayitlar</code>, <code>"ad"</code> ve <code>"sehir"</code> anahtarlı sözlüklerin listesidir. Her kaydın ad ve şehrindeki baştaki/sondaki boşlukları silinmiş <b>yeni</b> sözlüklerden oluşan <b>yeni</b> bir liste döndür. Kayıtlardaki diğer anahtarlar aynen korunmalı. Girdi listesi ve içindeki sözlükler <b>değişmemeli</b>.</p>',
      start: 'def temizle(kayitlar):\n    pass\n',
      sol: 'def temizle(kayitlar):\n    sonuc = []\n    for k in kayitlar:\n        yeni = dict(k)\n        yeni["ad"] = k["ad"].strip()\n        yeni["sehir"] = k["sehir"].strip()\n        sonuc.append(yeni)\n    return sonuc\n',
      tests: 'girdi = [{"ad": " Ayşe ", "sehir": "İzmir  ", "no": 7}, {"ad": "Can", "sehir": " Bursa", "no": 8}]\nr = temizle(girdi)\nassert r == [{"ad": "Ayşe", "sehir": "İzmir", "no": 7}, {"ad": "Can", "sehir": "Bursa", "no": 8}], f"gelen {r}"\nassert girdi[0]["ad"] == " Ayşe " and girdi[1]["sehir"] == " Bursa", "girdi sözlükleri değişmemeli: her kaydın kopyasını al"\nassert r is not girdi and r[0] is not girdi[0], "yeni liste ve yeni sözlükler döndürülmeli"\nassert temizle([]) == [], "boş liste"\n',
      hints: ['Listeyi kopyalamak yetmez; içindeki sözlükleri de kopyalamalısın: dict(k).', 'Kopyada ad ve şehri strip ile güncelle.'],
      why: 'Sığ liste kopyası aynı sözlükleri paylaşır; içerik değişince girdi de değişirdi. Her kaydı dict(k) ile kopyalamak fonksiyonu saf yapar: aynı girdiye hep aynı çıktı, dışarıya etkisi yok.' },
    { id: 'fonksiyonlar-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>filtrele(kayitlar, *kosullar)</code> fonksiyonunu yaz. Her koşul, bir kayıt alıp True/False döndüren bir fonksiyondur. <b>Tüm</b> koşulları sağlayan kayıtların listesini döndür (sıra korunsun). Hiç koşul verilmezse tüm kayıtlar döner. Testte kullanılmak üzere iki koşul fonksiyonu da yaz: <code>izmirli(k)</code> (şehir İzmir mi) ve <code>buyuk(k)</code> (tutar 1000 ve üstü mü).</p>',
      start: 'def filtrele(kayitlar, *kosullar):\n    pass\n\ndef izmirli(k):\n    pass\n\ndef buyuk(k):\n    pass\n',
      sol: 'def filtrele(kayitlar, *kosullar):\n    sonuc = []\n    for k in kayitlar:\n        if all(kosul(k) for kosul in kosullar):\n            sonuc.append(k)\n    return sonuc\n\ndef izmirli(k):\n    return k["sehir"] == "İzmir"\n\ndef buyuk(k):\n    return k["tutar"] >= 1000\n',
      tests: 's = [{"no": 1, "sehir": "İzmir", "tutar": 1500}, {"no": 2, "sehir": "Ankara", "tutar": 2000}, {"no": 3, "sehir": "İzmir", "tutar": 300}]\nassert [k["no"] for k in filtrele(s, izmirli)] == [1, 3], "yalnız İzmir"\nassert [k["no"] for k in filtrele(s, izmirli, buyuk)] == [1], "İzmir VE büyük"\nassert [k["no"] for k in filtrele(s, buyuk)] == [1, 2], "yalnız büyük"\nassert filtrele(s) == s, "koşul yoksa hepsi"\n',
      hints: ['*kosullar bir demet olarak gelir; her elemanı bir fonksiyondur.', 'all(kosul(k) for kosul in kosullar) boş demette True verir.'],
      why: 'Koşulları fonksiyon olarak almak filtreyi genişletilebilir yapar; all() boş koşul listesinde True döndürdüğünden "koşul yoksa hepsi" kuralı kendiliğinden sağlanır.' },
    { id: 'fonksiyonlar-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>kdv_tutari(fiyat, oran=0.20)</code> KDV tutarını 2 ondalığa yuvarlayıp <b>döndürmeli</b>. Ekrana doğru sayı yazılıyor ama <code>toplam = fiyat + kdv_tutari(fiyat)</code> satırı <code>TypeError</code> veriyor.</p>',
      start: 'def kdv_tutari(fiyat, oran=0.20):\n    print(round(fiyat * oran, 2))\n',
      sol: 'def kdv_tutari(fiyat, oran=0.20):\n    return round(fiyat * oran, 2)\n',
      tests: 'assert kdv_tutari(100) == 20.0, "100 TL\'nin KDV\'si 20 olmalı ve DÖNDÜRÜLMELİ"\nassert kdv_tutari(250, 0.10) == 25.0, "oran parametresi"\nassert 100 + kdv_tutari(100) == 120.0, "dönüş değeri hesapta kullanılabilmeli"\n',
      hints: ['print ekrana yazar ama değer döndürmez; fonksiyon None döndürür.', 'print yerine return kullan.'],
      why: 'return yazılmayan fonksiyon None döndürür; None ile toplama TypeError verir. Hesap yapan fonksiyon değer döndürmeli, yazdırma işi çağırana kalmalı.' },
    { id: 'fonksiyonlar-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>sepeti_bosalt(sepet)</code> ödeme tamamlanınca çağıranın sepet listesini <b>yerinde</b> boşaltmalı ve boşaltılan ürün sayısını döndürmeli. Sayı doğru dönüyor ama sepet dolu kalıyor.</p>',
      start: 'def sepeti_bosalt(sepet):\n    adet = len(sepet)\n    sepet = []\n    return adet\n',
      sol: 'def sepeti_bosalt(sepet):\n    adet = len(sepet)\n    sepet.clear()\n    return adet\n',
      tests: 's = ["çay", "kahve", "şeker"]\nn = sepeti_bosalt(s)\nassert n == 3, "3 ürün boşaltıldı"\nassert s == [], f"çağıranın sepeti boşalmalı; şu an {s}"\nassert sepeti_bosalt([]) == 0, "boş sepet"\n',
      hints: ['sepet = [] yalnız yerel adı yeni bir listeye bağlar; çağıranın listesi aynı kalır.', 'Nesnenin kendisini değiştiren metot: sepet.clear() (ya da del sepet[:])'],
      why: 'Parametreye atama yerel adı yeniden bağlar; nesneyi değiştirmek için nesnenin metodunu çağırmak gerekir. clear() aynı liste nesnesini boşaltır, çağıran da görür.' },
    { id: 'fonksiyonlar-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Genel amaçlı özet fonksiyonu: <code>ozetle(kayitlar, grup_fn, deger_fn=None, *, sirali=False)</code> yaz.</p><ul><li><code>grup_fn(kayit)</code> her kaydın grup anahtarını verir.</li><li><code>deger_fn(kayit)</code> toplanacak değeri verir; <code>None</code> ise her kayıt 1 sayılır (adet).</li><li>Sonuç grup → toplam sözlüğüdür.</li><li><code>sirali=True</code> (yalnız adla verilebilir) ise sözlük yerine <code>(grup, toplam)</code> listesi döndür: toplam azalan, eşitlikte grup adı artan.</li></ul><p>Testlerde kullanmak için <code>sehir(k)</code> ve <code>tutar(k)</code> yardımcı fonksiyonlarını da yaz.</p>',
      start: 'def ozetle(kayitlar, grup_fn, deger_fn=None, *, sirali=False):\n    pass\n\ndef sehir(k):\n    pass\n\ndef tutar(k):\n    pass\n',
      sol: 'def ozetle(kayitlar, grup_fn, deger_fn=None, *, sirali=False):\n    toplam = {}\n    for k in kayitlar:\n        g = grup_fn(k)\n        d = 1 if deger_fn is None else deger_fn(k)\n        toplam[g] = toplam.get(g, 0) + d\n    if not sirali:\n        return toplam\n    def anahtar(cift):\n        return (-cift[1], cift[0])\n    return sorted(toplam.items(), key=anahtar)\n\ndef sehir(k):\n    return k["sehir"]\n\ndef tutar(k):\n    return k["tutar"]\n',
      tests: 's = [{"sehir": "İzmir", "tutar": 100}, {"sehir": "Ankara", "tutar": 250}, {"sehir": "İzmir", "tutar": 150}, {"sehir": "Bursa", "tutar": 250}]\nassert ozetle(s, sehir) == {"İzmir": 2, "Ankara": 1, "Bursa": 1}, "deger_fn yoksa adet sayılmalı"\nassert ozetle(s, sehir, tutar) == {"İzmir": 250, "Ankara": 250, "Bursa": 250}, "tutar toplamı"\nassert ozetle(s, sehir, tutar, sirali=True) == [("Ankara", 250), ("Bursa", 250), ("İzmir", 250)], "eşitlikte ad artan"\nassert ozetle(s, sehir, sirali=True)[0] == ("İzmir", 2), "adet azalan sıralı"\ntry:\n    ozetle(s, sehir, tutar, True)\n    assert False, "sirali yalnız adla verilebilmeli (* işaretinden sonra)"\nexcept TypeError:\n    pass\nassert ozetle([], sehir) == {}, "boş liste"\n',
      hints: ['Gruplama kalıbı: toplam[g] = toplam.get(g, 0) + d', 'deger_fn None ise d = 1.', '* işaretinden sonraki parametreler yalnız adla verilir: def f(a, b=None, *, sirali=False).'],
      why: 'Neyin gruplanacağı ve neyin toplanacağı dışarıdan fonksiyon olarak gelince aynı kod şehir bazlı ciro, ürün bazlı adet ya da ay bazlı işlem sayısı için çalışır. Yalnız-adla parametre, True gibi anlamsız konumsal bayrakları engeller.' }
  ],
  faq: [
    { q: 'Docstring ile yorum (#) arasında ne fark var?', a: 'Docstring fonksiyonun <b>ne yaptığını</b> ve nasıl kullanılacağını anlatır ve çalışma anında <code>help()</code> ile görülür. Yorum ise kodun <b>neden</b> öyle yazıldığını açıklar ve yalnız kaynak kodda görünür.' },
    { q: 'Tip ipucu yazınca Python yanlış türü engeller mi?', a: 'Hayır. Tip ipuçları çalışma anında denetlenmez; editörün ve mypy gibi araçların yanlış kullanımı önceden yakalaması içindir. Çalışma anında denetim gerekiyorsa <code>isinstance</code> ile kendin kontrol eder ya da Pydantic gibi kütüphaneler kullanırsın.' }
  ],
  mistakes: [
    { bad: 'def bosalt(sepet):\n    sepet = []', good: 'def bosalt(sepet):\n    sepet.clear()', why: 'Parametreye yeni değer atamak yalnız yerel adı değiştirir; çağıranın nesnesini değiştirmek için nesnenin metodunu kullan.' },
    { bad: 'uygula(fiyatlar, kdv_ekle())', good: 'uygula(fiyatlar, kdv_ekle)', why: 'Fonksiyonu argüman olarak verirken parantez koyma; parantez onu hemen çağırır ve sonucunu (çoğu zaman hata ya da None) verir.' }
  ]
}
);
})(window);
