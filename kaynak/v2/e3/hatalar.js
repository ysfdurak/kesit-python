/* Kesit Python — uzantı: hatalar (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'hatalar',
    min: 40,
    html: `<h2>Derinleş: istisnaların aile ağacı ve sağlam hata akışı</h2>
<p>try/except/else/finally ve raise'ı öğrendin. Şimdi PCEP/PCAP sınavlarının ve iş görüşmelerinin sevdiği, gerçek projelerde de sık hataya yol açan ayrıntılara bakıyoruz: istisnaların hiyerarşisi (hierarchy), except bloklarının sırası, istisna nesnesinin içi, yeniden fırlatma ve "tekrar dene" kalıbı. Kendi istisna sınıf ağacını kurmak, <code>raise ... from</code> ve logging ayrıntıları orta seviyedeki <b>Hata tasarımı</b> dersinde; traceback okuma teknikleri ise <b>Hata ayıklama</b> dersinde.</p>

<h3>İstisnalar bir aile ağacıdır</h3>
<p>Her istisna bir sınıftır ve sınıflar birbirinden türer. <code>except X</code> yazdığında X'in kendisini <b>ve tüm alt türlerini</b> yakalarsın. Bu yüzden <code>except LookupError</code> hem KeyError'ı hem IndexError'ı yakalar; <code>except OSError</code> FileNotFoundError'ı da, PermissionError'ı da.</p>
<div class="tbl-wrap"><table>
<tr><th>Üst sınıf</th><th>Alt sınıflardan bazıları</th><th>Ne zaman yakalanır?</th></tr>
<tr><td><code>BaseException</code></td><td>SystemExit, KeyboardInterrupt, Exception</td><td>Neredeyse hiç; Ctrl+C ve sys.exit buradadır</td></tr>
<tr><td><code>Exception</code></td><td>aşağıdakilerin hepsi</td><td>En üst seviyede "beklenmeyen hata" logu için</td></tr>
<tr><td><code>ArithmeticError</code></td><td>ZeroDivisionError, OverflowError</td><td>Hesaplama hataları</td></tr>
<tr><td><code>LookupError</code></td><td>KeyError, IndexError</td><td>"Aranan yok" durumları</td></tr>
<tr><td><code>ValueError</code></td><td>UnicodeDecodeError</td><td>Tür doğru, değer uygunsuz</td></tr>
<tr><td><code>OSError</code></td><td>FileNotFoundError, PermissionError, FileExistsError</td><td>Dosya ve işletim sistemi</td></tr>
</table></div>
<pre class="py">print(issubclass(KeyError, LookupError))          # True
print(issubclass(FileNotFoundError, OSError))     # True
print(issubclass(KeyboardInterrupt, Exception))   # False!
print(KeyError.__mro__)                           # soy ağacı, alttan yukarı

veriler = [{"ad": "Ayşe"}, [10, 20]]
for veri, anahtar in [(veriler[0], "telefon"), (veriler[1], 5)]:
    try:
        print(veri[anahtar])
    except LookupError as e:
        print("Bulunamadı:", type(e).__name__, e)
</pre>
<div class="tip"><b>except Exception neden Ctrl+C'yi yakalamaz?</b>KeyboardInterrupt ve SystemExit bilerek Exception'ın dışında, doğrudan BaseException'ın altındadır. Böylece <code>except Exception</code> yazsan bile kullanıcı programı durdurabilir. Çıplak <code>except:</code> ise BaseException'ı da yakalar; bu yüzden tehlikelidir.</div>

<h3>except sırası: özelden genele</h3>
<p>Python except bloklarını <b>yukarıdan aşağıya</b> dener ve <b>ilk uyan</b> bloğu çalıştırır; diğerlerine bakmaz. Genel bir tür (Exception, LookupError) özel olandan önce gelirse özel blok asla çalışmaz. Python bu durumda uyarı vermez; hata sessizce yanlış mesajla sonuçlanır.</p>
<pre class="py">def tutar_oku(kayit):
    try:
        return float(kayit["tutar"])
    except KeyError:
        return "tutar alanı yok"
    except ValueError:
        return "tutar sayı değil"
    except Exception as e:                 # en sona: beklenmeyenler
        return f"beklenmeyen: {type(e).__name__}"

print(tutar_oku({"tutar": "250.5"}))
print(tutar_oku({}))
print(tutar_oku({"tutar": "yok"}))
print(tutar_oku({"tutar": None}))         # float(None) → TypeError
</pre>

<h3>İstisna nesnesinin içi</h3>
<p><code>except ValueError as e</code> ile aldığın <code>e</code> sıradan bir nesnedir: <code>type(e).__name__</code> hata adını, <code>str(e)</code> mesajı, <code>e.args</code> fırlatılırken verilen argümanları verir. Raporlama için ad + mesaj ikilisini kullan. Dikkat: <code>e</code> adı except bloğu bitince <b>silinir</b>; sonra lazımsa başka bir değişkene ata.</p>
<pre class="py">son_hata = None
try:
    int("12,5")
except ValueError as e:
    print("Ad:", type(e).__name__)
    print("Mesaj:", e)
    print("args:", e.args)
    son_hata = e                    # e blok sonunda silinecek, sakla

print("Blok dışında:", repr(son_hata))
print("'e' hâlâ var mı?", "e" in dir())
</pre>

<h3>Yeniden fırlatma ve kendi küçük istisnan</h3>
<p>Bazen hatayı yakalayıp bir şey yapmak (log yazmak, sayaç artırmak) ama sonra yine de yukarı iletmek istersin. except içinde tek başına <code>raise</code> yazmak, yakalanan istisnayı traceback'iyle birlikte aynen yeniden fırlatır. İş kuralları için tek satırlık bir sınıf yeter: <code>class StokYetersiz(Exception): pass</code>. Çağıran taraf ValueError'larla karışmadan yalnızca bu durumu yakalayabilir.</p>
<pre class="py">class StokYetersiz(Exception):
    pass

stok = {"kulaklık": 3, "kablo": 40}
hata_sayaci = 0

def satis_yap(urun, adet):
    global hata_sayaci
    try:
        if stok[urun] &lt; adet:
            raise StokYetersiz(f"{urun}: stok {stok[urun]}, istenen {adet}")
        stok[urun] -= adet
    except StokYetersiz:
        hata_sayaci += 1
        raise                       # say ve aynen yukarı ilet

for urun, adet in [("kablo", 5), ("kulaklık", 10)]:
    try:
        satis_yap(urun, adet)
        print("Satıldı:", urun)
    except StokYetersiz as e:
        print("Satış reddedildi →", e)
print("Hata sayacı:", hata_sayaci, "| Stok:", stok)
</pre>

<h3>Tekrar dene (retry) kalıbı</h3>
<p>Ağ, veritabanı ya da kilitli dosya gibi <b>geçici</b> hatalarda ikinci deneme çoğu zaman başarır. Kalıp: sınırlı sayıda dene, her başarısızlığı not et, son denemede de olmazsa hatayı yukarı ilet. Kalıcı hatalarda (ValueError gibi) tekrar denemek boşunadır; yalnız geçici olduğunu bildiğin türü yakala.</p>
<pre class="py">cevaplar = iter([ConnectionError("zaman aşımı"), ConnectionError("bağlantı koptu"), "kur=34.2"])

def kur_getir():                       # sahte servis: önce iki kez hata verir
    c = next(cevaplar)
    if isinstance(c, Exception):
        raise c
    return c

for deneme in range(1, 4):
    try:
        sonuc = kur_getir()
    except ConnectionError as e:
        print(f"Deneme {deneme} başarısız: {e}")
        if deneme == 3:
            raise
    else:
        print(f"Deneme {deneme} başarılı: {sonuc}")
        break
</pre>
<div class="warn"><b>finally içinde return yazma</b>finally bloğundaki <code>return</code>, try'da fırlayan istisnayı da, try'daki return değerini de <b>yutar</b>. Hata sessizce kaybolur. finally'yi yalnız temizlik için kullan (Python 3.14 bu kullanım için uyarı verir).</div>

<div class="note"><b>Gerçek işte</b>Kurumsal bir veri betiğinde hata yönetimi üç katmanlıdır: (1) satır seviyesinde bozuk kaydı yakala, hatalılar listesine yaz ve devam et; (2) geçici dış hataları (bağlantı) sınırlı sayıda tekrar dene; (3) en üstte, ana fonksiyonda <code>except Exception</code> ile beklenmeyen her şeyi logla ve programı sıfırdan farklı bir çıkış koduyla bitir ki zamanlayıcı (cron, Airflow) işin başarısız olduğunu anlasın. Ortada kalan kod hatayı yakalamaz; yukarı akmasına izin verir.</div>
`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Bir fonksiyonda önce <code>except Exception:</code>, altında <code>except ValueError:</code> bloğu var. <code>int("abc")</code> hata verince ne olur?',
        o: [
          'ValueError bloğu çalışır, çünkü Python en özel bloğu seçer',
          'Exception bloğu çalışır; ValueError bloğuna hiç ulaşılmaz',
          'Önce Exception, ardından ValueError bloğu sırayla çalışır',
          'Python SyntaxError verir'
        ],
        a: 1,
        why: 'except blokları yukarıdan aşağıya denenir ve ilk uyan çalışır. ValueError bir Exception olduğu için ilk blok yakalar. Python bunu hata saymaz; özel türleri her zaman önce yazmalısın.' },
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>except LookupError:</code> hangi hataları yakalar?',
        o: [
          'Yalnızca adı tam olarak LookupError olan hatayı',
          'KeyError ve IndexError dahil tüm alt türlerini',
          'Yalnız KeyError hatasını',
          'Programdaki tüm hataları, tıpkı Exception gibi'
        ],
        a: 1,
        why: 'except bir sınıfı ve onun tüm alt sınıflarını yakalar. KeyError ve IndexError, LookupError\'dan türer. ValueError ya da ZeroDivisionError ise bu ailede değildir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'try:\n    print("A")\n    x = 1 / 0\n    print("B")\nexcept ZeroDivisionError:\n    print("C")\nelse:\n    print("D")\nfinally:\n    print("E")\n',
        o: ['A\nC\nE', 'A\nB\nC\nE', 'A\nC\nD\nE', 'A\nE'],
        a: 0,
        why: 'Hata satırında try bloğu kesilir (B yazılmaz), uyan except çalışır (C). else yalnız hata OLMAZSA çalışır (D yok), finally her zaman (E).' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'def f():\n    try:\n        return "try"\n    finally:\n        print("temizlik")\n\nprint(f())\n',
        o: ['try', 'temizlik', 'temizlik\ntry', 'try\ntemizlik'],
        a: 2,
        why: 'return değeri hesaplanır ama fonksiyondan çıkmadan önce finally çalışır ve "temizlik" yazılır. Sonra print(f()) dönen "try" değerini yazar.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'try:\n    [10, 20][5]\nexcept LookupError:\n    print("arama hatası")\nexcept IndexError:\n    print("indeks hatası")\n',
        o: ['indeks hatası', 'arama hatası', 'arama hatası\nindeks hatası', 'IndexError: list index out of range'],
        a: 1,
        why: 'IndexError, LookupError\'ın alt sınıfıdır ve ilk uyan blok LookupError bloğudur. Özel blok (IndexError) hiçbir zaman çalışmaz: sıra özelden genele olmalıydı.' },
      { t: 'predict',
        stage: 'Kodu oku',
        raises: true,
        q: 'Bu kod çalışınca ne olur?',
        code: 'try:\n    int("on iki")\nexcept ValueError as e:\n    pass\nprint(e)\n',
        o: ['invalid literal for int() with base 10: \'on iki\' yazdırır', 'NameError hatası verir', 'None yazdırır', 'ValueError hatası verir'],
        a: 1,
        why: 'except ... as e ile bağlanan ad, blok bitince Python tarafından silinir (döngüsel referansı önlemek için). Bloğun dışında e tanımsızdır: NameError. Sonra lazımsa blok içinde başka bir değişkene ata.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Geçici hata veren bir servisi en fazla 3 kez deneyen kodun satırlarını sırala. Servis ilk iki çağrıda ConnectionError fırlatıyor.</p>',
        lines: [
          'yanitlar = iter([ConnectionError("x"), ConnectionError("y"), "OK"])',
          'def servis():',
          '    y = next(yanitlar)',
          '    if isinstance(y, Exception): raise y',
          '    return y',
          'for deneme in range(1, 4):',
          '    try:',
          '        print(deneme, servis())',
          '        break',
          '    except ConnectionError:',
          '        print(deneme, "tekrar")'
        ],
        expect: '1 tekrar\n2 tekrar\n3 OK\n',
        hint: 'Önce sahte yanıtlar, sonra servis fonksiyonu; döngüde try içinde çağır ve başarılıysa break ile çık.',
        why: 'Retry kalıbı: başarılı çağrıdan sonra break döngüyü bitirir; except yalnız geçici hata türünü yakalar ve döngü bir sonraki denemeye geçer.' },
      { t: 'code',
        id: 'hatalar-x1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>yeniden_dene(islem, deneme=3)</code> fonksiyonunu yaz. <code>islem</code> argümansız bir fonksiyondur.</p><ul><li>islem()\'i çağır; başarılıysa sonucunu döndür.</li><li><code>ConnectionError</code> fırlatırsa tekrar dene; toplam en fazla <code>deneme</code> kez çağır.</li><li>Son deneme de başarısız olursa son ConnectionError\'ı <b>yeniden fırlat</b>.</li><li>Başka türden hatalar (ör. ValueError) yakalanmasın, hemen yukarı çıksın.</li></ul>',
        guide: [
          'range(deneme) ile en fazla deneme kez dönen bir for döngüsü kur.',
          'Döngü içinde try: return islem() yaz; başarılı çağrı fonksiyondan hemen çıkar.',
          'except ConnectionError bloğunda, bu son denemeyse raise ile hatayı yeniden fırlat.',
          'Başka except bloğu yazma: diğer hatalar kendiliğinden yukarı çıkar.'
        ],
        example: '# Farklı iş: bir listedeki ilk sayıya çevrilebilen değeri bul, hiçbiri olmazsa son hatayı ilet\ndef ilk_sayi(degerler):\n    for i, d in enumerate(degerler):\n        try:\n            return int(d)\n        except ValueError:\n            if i == len(degerler) - 1:\n                raise\nprint(ilk_sayi(["a", "b", "42"]))\n',
        start: 'def yeniden_dene(islem, deneme=3):\n    for i in range(deneme):\n        # TODO: try içinde islem() sonucunu döndür\n        # TODO: ConnectionError olursa: son denemeyse raise, değilse devam\n        pass\n',
        sol: 'def yeniden_dene(islem, deneme=3):\n    for i in range(deneme):\n        try:\n            return islem()\n        except ConnectionError:\n            if i == deneme - 1:\n                raise\n',
        tests: 'def _sahte(cevaplar):\n    it = iter(cevaplar)\n    sayac = {"n": 0}\n    def f():\n        sayac["n"] += 1\n        c = next(it)\n        if isinstance(c, Exception):\n            raise c\n        return c\n    return f, sayac\nf, s = _sahte([ConnectionError("1"), ConnectionError("2"), "kur=34.2"])\nassert yeniden_dene(f) == "kur=34.2", "Üçüncü denemede başarılı sonuç döndürülmeli"\nassert s["n"] == 3, "islem tam 3 kez çağrılmalı"\nf, s = _sahte(["hemen"])\nassert yeniden_dene(f) == "hemen" and s["n"] == 1, "İlk çağrı başarılıysa tekrar çağrılmamalı"\nf, s = _sahte([ConnectionError("a"), ConnectionError("son")])\ntry:\n    yeniden_dene(f, deneme=2)\n    assert False, "Tüm denemeler başarısızsa ConnectionError yeniden fırlatılmalı"\nexcept ConnectionError as e:\n    assert str(e) == "son", "SON hata fırlatılmalı (except içinde tek başına raise)"\nassert s["n"] == 2, "deneme=2 ise en fazla 2 çağrı"\nf, s = _sahte([ValueError("kalıcı"), "x"])\ntry:\n    yeniden_dene(f)\n    assert False, "ValueError yakalanmamalı"\nexcept ValueError:\n    pass\nassert s["n"] == 1, "Kalıcı hata (ValueError) tekrar denenmemeli"\n',
        hints: [
          'Başarılı çağrıda return, döngüyü ve fonksiyonu birlikte bitirir.',
          'Son denemeyi i == deneme - 1 ile anlarsın; except içinde yalın raise yakalanan hatayı aynen fırlatır.',
          'except ConnectionError: bloğunda → if i == deneme - 1: raise'
        ],
        why: 'Yalnız geçici hata türü yakalanır; kalıcı hatalar ilk seferde yukarı çıkar. Yalın raise traceback\'i korur, böylece son hatanın nedeni kaybolmaz.' },
      { t: 'code',
        id: 'hatalar-x2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Gece çalışan bir doğrulama betiği için <code>hata_ozeti(fonk, girdiler)</code> fonksiyonunu yaz: her girdi için <code>fonk(girdi)</code> çağrılsın. Sonuç sözlüğünde <code>"OK"</code> anahtarı başarılı çağrı sayısını, diğer anahtarlar <b>hata adı</b> (<code>type(e).__name__</code>) → o hatanın sayısını tutsun. Yalnız <code>Exception</code> ailesini yakala.</p>',
        guide: [
          'Boş bir sözlük oluştur.',
          'Her girdi için try içinde fonk(girdi) çağır.',
          'except Exception as e ile hatanın adını type(e).__name__ ile al ve sayacı artır.',
          'else bloğunda "OK" sayacını artır.',
          'Sözlüğü döndür.'
        ],
        example: 'sayac = {}\nfor metin in ["10", "x", "3.5"]:\n    try:\n        int(metin)\n    except ValueError as e:\n        ad = type(e).__name__\n        sayac[ad] = sayac.get(ad, 0) + 1\n    else:\n        sayac["OK"] = sayac.get("OK", 0) + 1\nprint(sayac)\n',
        start: 'def hata_ozeti(fonk, girdiler):\n    ozet = {}\n    for g in girdiler:\n        try:\n            fonk(g)\n        # TODO: except Exception as e → ozet[hata adı] += 1\n        # TODO: else → ozet["OK"] += 1\n        except Exception:\n            pass\n    return ozet\n',
        sol: 'def hata_ozeti(fonk, girdiler):\n    ozet = {}\n    for g in girdiler:\n        try:\n            fonk(g)\n        except Exception as e:\n            ad = type(e).__name__\n            ozet[ad] = ozet.get(ad, 0) + 1\n        else:\n            ozet["OK"] = ozet.get("OK", 0) + 1\n    return ozet\n',
        tests: 'def tutar(kayit):\n    return 100 / float(kayit["tutar"])\ngirdiler = [{"tutar": "50"}, {"tutar": "0"}, {}, {"tutar": "yok"}, {"tutar": "4"}, {"tutar": None}]\no = hata_ozeti(tutar, girdiler)\nassert o.get("OK") == 2, "2 başarılı çağrı olmalı (50 ve 4)"\nassert o.get("ZeroDivisionError") == 1, "tutar 0 → ZeroDivisionError sayılmalı"\nassert o.get("KeyError") == 1 and o.get("ValueError") == 1 and o.get("TypeError") == 1, "Her hata kendi adıyla sayılmalı: " + str(o)\nassert len(o) == 5, "Fazladan anahtar olmamalı: " + str(o)\nassert hata_ozeti(tutar, []) == {}, "Boş girdide boş sözlük"\n',
        hints: [
          'Hata adını almak için type(e).__name__ kullan.',
          'Sayım için sozluk.get(anahtar, 0) + 1 kalıbı; başarı için else bloğu.',
          'except Exception as e: bloğunda ad = type(e).__name__ ve ozet[ad] = ozet.get(ad, 0) + 1'
        ],
        why: 'Toplu işte tek bozuk kayıt tüm işi durdurmamalı. Hataları ada göre saymak sabah raporunda "hangi sorun ne sıklıkta" sorusunu cevaplar. else bloğu başarı yolunu try\'dan ayırır.' },
      { t: 'code',
        id: 'hatalar-x3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Anadolu Market stok modülü. <code>StokYetersiz</code> adında <code>Exception</code>\'dan türeyen bir sınıf tanımla. <code>stoktan_dus(stok, urun, adet)</code>:</p><ul><li>Ürün sözlükte yoksa <code>KeyError</code> kendiliğinden fırlasın (yakalama).</li><li><code>adet</code> 1\'den küçükse <code>ValueError("adet pozitif olmalı")</code>.</li><li>Stok yetmiyorsa <code>StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")</code>.</li><li>Yeterse stoku azalt ve kalan miktarı döndür.</li></ul>',
        guide: [
          'class StokYetersiz(Exception): pass ile sınıfı tanımla.',
          'Fonksiyonda önce adet kontrolünü yap ve ValueError fırlat.',
          'mevcut = stok[urun] satırı ürün yoksa KeyError\'ı kendisi üretir.',
          'mevcut < adet ise StokYetersiz fırlat; değilse sözlüğü güncelle ve kalanı döndür.'
        ],
        example: 'class LimitAsildi(Exception):\n    pass\n\ndef harca(limit, tutar):\n    if tutar > limit:\n        raise LimitAsildi(f"limit {limit}, istenen {tutar}")\n    return limit - tutar\n\ntry:\n    harca(500, 800)\nexcept LimitAsildi as e:\n    print("Reddedildi:", e)\n',
        start: '# TODO: StokYetersiz sınıfını tanımla\n\ndef stoktan_dus(stok, urun, adet):\n    # TODO: adet < 1 → ValueError("adet pozitif olmalı")\n    mevcut = stok[urun]\n    # TODO: mevcut < adet → StokYetersiz(...)\n    stok[urun] = mevcut - adet\n    return stok[urun]\n',
        sol: 'class StokYetersiz(Exception):\n    pass\n\ndef stoktan_dus(stok, urun, adet):\n    if adet < 1:\n        raise ValueError("adet pozitif olmalı")\n    mevcut = stok[urun]\n    if mevcut < adet:\n        raise StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")\n    stok[urun] = mevcut - adet\n    return stok[urun]\n',
        tests: 'assert issubclass(StokYetersiz, Exception), "StokYetersiz, Exception\'dan türemeli"\ns = {"kulaklık": 3, "kablo": 40}\nassert stoktan_dus(s, "kablo", 15) == 25 and s["kablo"] == 25, "Stok azaltılıp kalan döndürülmeli"\ntry:\n    stoktan_dus(s, "kulaklık", 5)\n    assert False, "Stok yetmeyince StokYetersiz fırlatılmalı"\nexcept StokYetersiz as e:\n    assert str(e) == "kulaklık: stok 3, istenen 5", "Mesaj biçimi farklı: " + str(e)\nassert s["kulaklık"] == 3, "Hata durumunda stok değişmemeli"\nfor kotu in (0, -2):\n    try:\n        stoktan_dus(s, "kablo", kotu)\n        assert False, "adet < 1 için ValueError bekleniyordu"\n    except ValueError as e:\n        assert str(e) == "adet pozitif olmalı"\ntry:\n    stoktan_dus(s, "mouse", 1)\n    assert False, "Olmayan ürün KeyError vermeli"\nexcept KeyError:\n    pass\n',
        hints: [
          'Özel istisna için gövdesi pass olan bir sınıf yeter: class Ad(Exception): pass',
          'Kontrolleri stok güncellemesinden ÖNCE yap ki hata durumunda stok bozulmasın.',
          'if mevcut < adet: raise StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")'
        ],
        why: 'Kendi istisna sınıfın, çağıranın iş kuralı ihlalini (stok yetersiz) girdi hatasından (ValueError) ve veri hatasından (KeyError) ayırmasını sağlar. Kontroller değişiklikten önce yapılır: ya hep ya hiç.' },
      { t: 'code',
        id: 'hatalar-x4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>satirlari_isle(satirlar)</code> fonksiyonu <code>"ad,yas"</code> biçimindeki metinleri işlesin ve <code>(kayitlar, hatalar)</code> demeti döndürsün:</p><ul><li><code>kayitlar</code>: başarılı satırlardan <code>(ad, yas_int)</code> demetleri.</li><li><code>hatalar</code>: <code>(satır_no, hata_adı)</code> demetleri; satır numarası 1\'den başlar. Virgül yoksa <code>IndexError</code>, yaş sayı değilse <code>ValueError</code> oluşur (ikisini de yakala, başka türü yakalama).</li></ul>',
        sol: 'def satirlari_isle(satirlar):\n    kayitlar, hatalar = [], []\n    for no, satir in enumerate(satirlar, start=1):\n        try:\n            parca = satir.split(",")\n            kayitlar.append((parca[0].strip(), int(parca[1])))\n        except (IndexError, ValueError) as e:\n            hatalar.append((no, type(e).__name__))\n    return kayitlar, hatalar\n',
        tests: 'k, h = satirlari_isle(["Ayşe,34", "Mehmet", "Elif, 29", "Can,otuz", "Zeynep,41"])\nassert k == [("Ayşe", 34), ("Elif", 29), ("Zeynep", 41)], "Başarılı kayıtlar: " + str(k)\nassert h == [(2, "IndexError"), (4, "ValueError")], "Hatalar satır numarası (1\'den) ve hata adıyla: " + str(h)\nassert satirlari_isle([]) == ([], []), "Boş girdi"\ntry:\n    satirlari_isle([None])\n    assert False, "None satırı AttributeError vermeli; yalnız IndexError ve ValueError yakalanmalı"\nexcept AttributeError:\n    pass\n',
        hints: ['enumerate(satirlar, start=1) satır numarasını verir.', 'Birden çok türü tek blokta yakalamak için demet: except (IndexError, ValueError) as e:'],
        why: 'Toplu veri işlerinde hata satırını numarasıyla kaydetmek, kaynağı düzeltecek kişiye tam adres verir. Yalnız beklenen türleri yakalamak, beklenmeyen bir hatanın (None gibi) gizlenmesini önler.' },
      { t: 'code',
        id: 'hatalar-x5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>tutar_cevir(metin)</code>: Türkçe biçimli tutarı float\'a çevirsin (<code>"1.250,50"</code> → <code>1250.5</code>, <code>" 300 "</code> → <code>300.0</code>). Çevrilemezse içteki teknik hatayı göstermek yerine <code>ValueError(f"geçersiz tutar: {metin!r}")</code> fırlatsın. Metin <code>str</code> değilse <code>TypeError("tutar metin olmalı")</code> fırlatsın.</p>',
        sol: 'def tutar_cevir(metin):\n    if not isinstance(metin, str):\n        raise TypeError("tutar metin olmalı")\n    temiz = metin.strip().replace(".", "").replace(",", ".")\n    try:\n        return float(temiz)\n    except ValueError:\n        raise ValueError(f"geçersiz tutar: {metin!r}") from None\n',
        tests: 'assert tutar_cevir("1.250,50") == 1250.5, "1.250,50 → 1250.5"\nassert tutar_cevir(" 300 ") == 300.0, "Kenar boşlukları temizlenmeli"\nassert tutar_cevir("89,9") == 89.9\nfor kotu in ("yok", "", "12a"):\n    try:\n        tutar_cevir(kotu)\n        assert False, repr(kotu) + " için ValueError bekleniyordu"\n    except ValueError as e:\n        assert str(e) == f"geçersiz tutar: {kotu!r}", "Mesaj \'geçersiz tutar: \' + repr(metin) olmalı, gelen: " + str(e)\ntry:\n    tutar_cevir(300)\n    assert False, "Sayı verilirse TypeError bekleniyordu"\nexcept TypeError as e:\n    assert str(e) == "tutar metin olmalı"\n',
        hints: [
          'Önce isinstance(metin, str) kontrolü; sonra try içinde float.',
          'except ValueError içinde yeni bir ValueError fırlat; {metin!r} tırnaklı gösterir. (from None içteki hatayı traceback\'ten gizler.)'
        ],
        why: 'Hatayı yakalayıp anlamlı bir mesajla yeniden fırlatmak, çağırana teknik "could not convert string to float" yerine iş diliyle bilgi verir. Tür kontrolü ayrı bir hatadır: TypeError.' },
      { t: 'code',
        id: 'hatalar-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>hesap_durumu(bakiye_metni)</code> metni sayıya çevirip <code>"negatif"</code>, <code>"sıfır"</code> ya da <code>"pozitif"</code> döndürmeli; metin sayı değilse <code>"geçersiz"</code>, metin <code>None</code> ise <code>"eksik"</code> döndürmeli. Ama "eksik" hiç dönmüyor.</p>',
        start: 'def hesap_durumu(bakiye_metni):\n    try:\n        b = float(bakiye_metni)\n    except Exception:\n        return "geçersiz"\n    except TypeError:\n        return "eksik"\n    if b < 0:\n        return "negatif"\n    return "sıfır" if b == 0 else "pozitif"\n',
        sol: 'def hesap_durumu(bakiye_metni):\n    try:\n        b = float(bakiye_metni)\n    except TypeError:\n        return "eksik"\n    except ValueError:\n        return "geçersiz"\n    if b < 0:\n        return "negatif"\n    return "sıfır" if b == 0 else "pozitif"\n',
        tests: 'assert hesap_durumu("-15.5") == "negatif"\nassert hesap_durumu("0") == "sıfır"\nassert hesap_durumu("1200") == "pozitif"\nassert hesap_durumu("bin lira") == "geçersiz", "Sayı olmayan metin \'geçersiz\'"\nassert hesap_durumu(None) == "eksik", "float(None) TypeError verir; \'eksik\' dönmeli. except sırasını kontrol et"\n',
        hints: [
          'except blokları sırayla denenir; ilk uyan çalışır. TypeError bir Exception mı?',
          'Özel türleri (TypeError, ValueError) genel türden önce yaz; burada Exception\'a hiç gerek yok.'
        ],
        why: 'except Exception en üstte olduğu için TypeError da orada yakalanıyor ve alttaki blok ölü kod kalıyordu. Özelden genele sırala; genel bloğa ihtiyaç yoksa hiç yazma.' },
      { t: 'code',
        id: 'hatalar-x7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>ortalama_sepet(siparisler)</code> sipariş sözlüklerinin <code>"tutar"</code> ortalamasını döndürmeli; liste boşsa <code>0</code>. Fonksiyon her durumda 0 döndürüyor. Ayrıca bir siparişte tutar alanı yoksa hata <b>gizlenmemeli</b> (KeyError yukarı çıkmalı). İki sorunu da düzelt.</p>',
        start: 'def ortalama_sepet(siparisler):\n    try:\n        toplam = sum(s["tutr"] for s in siparisler)\n        return toplam / len(siparisler)\n    except:\n        return 0\n',
        sol: 'def ortalama_sepet(siparisler):\n    try:\n        toplam = sum(s["tutar"] for s in siparisler)\n        return toplam / len(siparisler)\n    except ZeroDivisionError:\n        return 0\n',
        tests: 'assert ortalama_sepet([{"tutar": 100}, {"tutar": 250}]) == 175, "Ortalama 175 olmalı; anahtar adını kontrol et"\nassert ortalama_sepet([]) == 0, "Boş liste 0 döndürmeli (ZeroDivisionError)"\ntry:\n    ortalama_sepet([{"tutar": 10}, {"adet": 2}])\n    assert False, "Tutar alanı eksik sipariş KeyError vermeli; çıplak except hatayı gizliyor"\nexcept KeyError:\n    pass\n',
        hints: [
          'Çıplak except, yazım hatasından doğan KeyError\'ı da yutup 0 döndürüyor. Anahtar adına bak.',
          'Yalnız beklediğin hatayı yakala: boş listede len 0 olduğu için ZeroDivisionError.'
        ],
        why: 'Çıplak except, "tutr" yazım hatasını yıllarca gizleyebilir: rapor hep 0 gösterir, kimse fark etmez. Yalnız beklenen hatayı (boş listede sıfıra bölme) yakalamak gerçek hataların görünmesini sağlar.' },
      { t: 'code',
        id: 'hatalar-x8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Destek paneli için <code>hata_kategorisi(hata)</code> fonksiyonunu yaz. Parametre bir <b>istisna nesnesi</b>dir. Kategoriler (yukarıdan aşağı ilk uyan geçerli):</p><ul><li><code>"dosya"</code>: OSError ailesi (FileNotFoundError, PermissionError...)</li><li><code>"arama"</code>: LookupError ailesi (KeyError, IndexError)</li><li><code>"girdi"</code>: ValueError veya TypeError ailesi</li><li><code>"hesap"</code>: ArithmeticError ailesi</li><li><code>"kesinti"</code>: Exception OLMAYAN BaseException\'lar (KeyboardInterrupt, SystemExit)</li><li><code>"diger"</code>: geri kalan her şey</li></ul><p>Sınıf adlarını metin olarak karşılaştırma; hiyerarşiyi kullan (<code>isinstance</code>).</p>',
        sol: 'def hata_kategorisi(hata):\n    if isinstance(hata, OSError):\n        return "dosya"\n    if isinstance(hata, LookupError):\n        return "arama"\n    if isinstance(hata, (ValueError, TypeError)):\n        return "girdi"\n    if isinstance(hata, ArithmeticError):\n        return "hesap"\n    if not isinstance(hata, Exception):\n        return "kesinti"\n    return "diger"\n',
        tests: 'assert hata_kategorisi(FileNotFoundError("x")) == "dosya"\nassert hata_kategorisi(PermissionError("x")) == "dosya", "PermissionError da OSError ailesindendir"\nassert hata_kategorisi(KeyError("k")) == "arama" and hata_kategorisi(IndexError()) == "arama"\nassert hata_kategorisi(ValueError()) == "girdi" and hata_kategorisi(TypeError()) == "girdi"\nu = UnicodeDecodeError("utf-8", b"\\xff", 0, 1, "geçersiz bayt")\nassert hata_kategorisi(u) == "girdi", "UnicodeDecodeError, ValueError\'ın alt sınıfıdır → girdi"\nassert hata_kategorisi(ZeroDivisionError()) == "hesap" and hata_kategorisi(OverflowError()) == "hesap"\nassert hata_kategorisi(KeyboardInterrupt()) == "kesinti", "KeyboardInterrupt Exception değildir"\nassert hata_kategorisi(SystemExit(1)) == "kesinti"\nassert hata_kategorisi(RuntimeError()) == "diger" and hata_kategorisi(AttributeError()) == "diger"\nclass OzelHata(KeyError):\n    pass\nassert hata_kategorisi(OzelHata()) == "arama", "KeyError\'dan türeyen özel hata da arama kategorisinde"\n_k = __source__\nassert "__name__" not in _k, "Sınıf adını metin olarak karşılaştırma; isinstance ile hiyerarşiyi kullan"\n',
        hints: ['isinstance(nesne, Sınıf) alt sınıfları da kapsar; bir demet de verebilirsin.', 'Kesinti kontrolü: not isinstance(hata, Exception). Sıra önemli; "diger" en sonda.'],
        why: 'isinstance hiyerarşiyi bilir: UnicodeDecodeError\'ı "girdi", KeyError\'dan türeyen özel sınıfı "arama" sayar. Ada göre karşılaştırma bu alt sınıfları kaçırırdı. except bloklarının çalışma mantığı da tamamen budur.' }
    ],
    faq: [
      { q: 'Hangi hatanın hangi sınıftan türediğini nasıl öğrenirim?',
        a: 'HataAdi.__mro__ soy ağacını gösterir (ör. KeyError.__mro__). issubclass(KeyError, LookupError) True/False verir. Resmi belgelerde "Exception hierarchy" başlığı tüm ağacı listeler.' },
      { q: 'raise ile raise e arasında fark var mı?',
        a: 'except içinde yalın raise, yakalanan istisnayı orijinal traceback\'iyle aynen fırlatır. raise e de aynı nesneyi fırlatır ama traceback\'e bu satırı ekler. Yeniden iletmek için yalın raise tercih edilir; türü değiştirmek gerekiyorsa raise YeniHata(...) from e kullanılır (Hata tasarımı dersi).' }
    ],
    mistakes: [
      { bad: 'try:\n    islem()\nexcept Exception:\n    print("genel")\nexcept ValueError:\n    print("değer hatası")',
        good: 'try:\n    islem()\nexcept ValueError:\n    print("değer hatası")\nexcept Exception:\n    print("genel")',
        why: 'İlk uyan except çalışır. Genel tür üstteyse özel blok ölü koddur; sıra her zaman özelden genele olmalı.' },
      { bad: 'try:\n    sonuc = hesapla()\nexcept ValueError as e:\n    pass\nprint(e)',
        good: 'son_hata = None\ntry:\n    sonuc = hesapla()\nexcept ValueError as e:\n    son_hata = e\nprint(son_hata)',
        why: '"as e" ile bağlanan ad except bloğu bitince silinir; dışarıda kullanırsan NameError alırsın. Gerekiyorsa başka bir değişkene ata.' }
    ]
  }
);
})(window);
