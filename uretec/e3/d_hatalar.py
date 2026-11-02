EXT = dict(id='hatalar', min=40)

EXT['html'] = r'''
<h2>Derinleş: istisnaların aile ağacı ve sağlam hata akışı</h2>
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
<pre class="py">
print(issubclass(KeyError, LookupError))          # True
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
<pre class="py">
def tutar_oku(kayit):
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
<pre class="py">
son_hata = None
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
<pre class="py">
class StokYetersiz(Exception):
    pass

stok = {"kulaklık": 3, "kablo": 40}
hata_sayaci = 0

def satis_yap(urun, adet):
    global hata_sayaci
    try:
        if stok[urun] < adet:
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
<pre class="py">
cevaplar = iter([ConnectionError("zaman aşımı"), ConnectionError("bağlantı koptu"), "kur=34.2"])

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
'''

EXT['ex'] = [
dict(t='mc', stage='Isınma', q='Bir fonksiyonda önce <code>except Exception:</code>, altında <code>except ValueError:</code> bloğu var. <code>int("abc")</code> hata verince ne olur?',
     o=['ValueError bloğu çalışır, çünkü Python en özel bloğu seçer', 'Exception bloğu çalışır; ValueError bloğuna hiç ulaşılmaz', 'Önce Exception, ardından ValueError bloğu sırayla çalışır', 'Python SyntaxError verir'], a=1,
     why='except blokları yukarıdan aşağıya denenir ve ilk uyan çalışır. ValueError bir Exception olduğu için ilk blok yakalar. Python bunu hata saymaz; özel türleri her zaman önce yazmalısın.'),
dict(t='mc', stage='Isınma', q='<code>except LookupError:</code> hangi hataları yakalar?',
     o=['Yalnızca adı tam olarak LookupError olan hatayı', 'KeyError ve IndexError dahil tüm alt türlerini', 'Yalnız KeyError hatasını', 'Programdaki tüm hataları, tıpkı Exception gibi'], a=1,
     why='except bir sınıfı ve onun tüm alt sınıflarını yakalar. KeyError ve IndexError, LookupError\'dan türer. ValueError ya da ZeroDivisionError ise bu ailede değildir.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
try:
    print("A")
    x = 1 / 0
    print("B")
except ZeroDivisionError:
    print("C")
else:
    print("D")
finally:
    print("E")
''', o=['A\nC\nE', 'A\nB\nC\nE', 'A\nC\nD\nE', 'A\nE'], a=0,
     why='Hata satırında try bloğu kesilir (B yazılmaz), uyan except çalışır (C). else yalnız hata OLMAZSA çalışır (D yok), finally her zaman (E).'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
def f():
    try:
        return "try"
    finally:
        print("temizlik")

print(f())
''', o=['try', 'temizlik', 'temizlik\ntry', 'try\ntemizlik'], a=2,
     why='return değeri hesaplanır ama fonksiyondan çıkmadan önce finally çalışır ve "temizlik" yazılır. Sonra print(f()) dönen "try" değerini yazar.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
try:
    [10, 20][5]
except LookupError:
    print("arama hatası")
except IndexError:
    print("indeks hatası")
''', o=['indeks hatası', 'arama hatası', 'arama hatası\nindeks hatası', 'IndexError: list index out of range'], a=1,
     why='IndexError, LookupError\'ın alt sınıfıdır ve ilk uyan blok LookupError bloğudur. Özel blok (IndexError) hiçbir zaman çalışmaz: sıra özelden genele olmalıydı.'),
dict(t='predict', stage='Kodu oku', raises=True, q='Bu kod çalışınca ne olur?',
     code=r'''
try:
    int("on iki")
except ValueError as e:
    pass
print(e)
''', o=["invalid literal for int() with base 10: 'on iki' yazdırır", 'NameError hatası verir', 'None yazdırır', 'ValueError hatası verir'], a=1,
     why='except ... as e ile bağlanan ad, blok bitince Python tarafından silinir (döngüsel referansı önlemek için). Bloğun dışında e tanımsızdır: NameError. Sonra lazımsa blok içinde başka bir değişkene ata.'),
dict(t='order', stage='Kodu oku', q='<p>Geçici hata veren bir servisi en fazla 3 kez deneyen kodun satırlarını sırala. Servis ilk iki çağrıda ConnectionError fırlatıyor.</p>',
     lines=['yanitlar = iter([ConnectionError("x"), ConnectionError("y"), "OK"])',
            'def servis():',
            '    y = next(yanitlar)',
            '    if isinstance(y, Exception): raise y',
            '    return y',
            'for deneme in range(1, 4):',
            '    try:',
            '        print(deneme, servis())',
            '        break',
            '    except ConnectionError:',
            '        print(deneme, "tekrar")'],
     expect='1 tekrar\n2 tekrar\n3 OK\n',
     hint='Önce sahte yanıtlar, sonra servis fonksiyonu; döngüde try içinde çağır ve başarılıysa break ile çık.',
     why='Retry kalıbı: başarılı çağrıdan sonra break döngüyü bitirir; except yalnız geçici hata türünü yakalar ve döngü bir sonraki denemeye geçer.'),
dict(t='code', id='hatalar-x1', stage='Rehberli', diff=2,
     q='<p><code>yeniden_dene(islem, deneme=3)</code> fonksiyonunu yaz. <code>islem</code> argümansız bir fonksiyondur.</p><ul><li>islem()\'i çağır; başarılıysa sonucunu döndür.</li><li><code>ConnectionError</code> fırlatırsa tekrar dene; toplam en fazla <code>deneme</code> kez çağır.</li><li>Son deneme de başarısız olursa son ConnectionError\'ı <b>yeniden fırlat</b>.</li><li>Başka türden hatalar (ör. ValueError) yakalanmasın, hemen yukarı çıksın.</li></ul>',
     guide=['range(deneme) ile en fazla deneme kez dönen bir for döngüsü kur.', 'Döngü içinde try: return islem() yaz; başarılı çağrı fonksiyondan hemen çıkar.', 'except ConnectionError bloğunda, bu son denemeyse raise ile hatayı yeniden fırlat.', 'Başka except bloğu yazma: diğer hatalar kendiliğinden yukarı çıkar.'],
     example=r'''
# Farklı iş: bir listedeki ilk sayıya çevrilebilen değeri bul, hiçbiri olmazsa son hatayı ilet
def ilk_sayi(degerler):
    for i, d in enumerate(degerler):
        try:
            return int(d)
        except ValueError:
            if i == len(degerler) - 1:
                raise
print(ilk_sayi(["a", "b", "42"]))
''',
     start=r'''
def yeniden_dene(islem, deneme=3):
    for i in range(deneme):
        # TODO: try içinde islem() sonucunu döndür
        # TODO: ConnectionError olursa: son denemeyse raise, değilse devam
        pass
''',
     sol=r'''
def yeniden_dene(islem, deneme=3):
    for i in range(deneme):
        try:
            return islem()
        except ConnectionError:
            if i == deneme - 1:
                raise
''',
     tests=r'''
def _sahte(cevaplar):
    it = iter(cevaplar)
    sayac = {"n": 0}
    def f():
        sayac["n"] += 1
        c = next(it)
        if isinstance(c, Exception):
            raise c
        return c
    return f, sayac
f, s = _sahte([ConnectionError("1"), ConnectionError("2"), "kur=34.2"])
assert yeniden_dene(f) == "kur=34.2", "Üçüncü denemede başarılı sonuç döndürülmeli"
assert s["n"] == 3, "islem tam 3 kez çağrılmalı"
f, s = _sahte(["hemen"])
assert yeniden_dene(f) == "hemen" and s["n"] == 1, "İlk çağrı başarılıysa tekrar çağrılmamalı"
f, s = _sahte([ConnectionError("a"), ConnectionError("son")])
try:
    yeniden_dene(f, deneme=2)
    assert False, "Tüm denemeler başarısızsa ConnectionError yeniden fırlatılmalı"
except ConnectionError as e:
    assert str(e) == "son", "SON hata fırlatılmalı (except içinde tek başına raise)"
assert s["n"] == 2, "deneme=2 ise en fazla 2 çağrı"
f, s = _sahte([ValueError("kalıcı"), "x"])
try:
    yeniden_dene(f)
    assert False, "ValueError yakalanmamalı"
except ValueError:
    pass
assert s["n"] == 1, "Kalıcı hata (ValueError) tekrar denenmemeli"
''',
     hints=['Başarılı çağrıda return, döngüyü ve fonksiyonu birlikte bitirir.', 'Son denemeyi i == deneme - 1 ile anlarsın; except içinde yalın raise yakalanan hatayı aynen fırlatır.', 'except ConnectionError: bloğunda → if i == deneme - 1: raise'],
     why='Yalnız geçici hata türü yakalanır; kalıcı hatalar ilk seferde yukarı çıkar. Yalın raise traceback\'i korur, böylece son hatanın nedeni kaybolmaz.'),
dict(t='code', id='hatalar-x2', stage='Rehberli', diff=2,
     q='<p>Gece çalışan bir doğrulama betiği için <code>hata_ozeti(fonk, girdiler)</code> fonksiyonunu yaz: her girdi için <code>fonk(girdi)</code> çağrılsın. Sonuç sözlüğünde <code>"OK"</code> anahtarı başarılı çağrı sayısını, diğer anahtarlar <b>hata adı</b> (<code>type(e).__name__</code>) → o hatanın sayısını tutsun. Yalnız <code>Exception</code> ailesini yakala.</p>',
     guide=['Boş bir sözlük oluştur.', 'Her girdi için try içinde fonk(girdi) çağır.', 'except Exception as e ile hatanın adını type(e).__name__ ile al ve sayacı artır.', 'else bloğunda "OK" sayacını artır.', 'Sözlüğü döndür.'],
     example=r'''
sayac = {}
for metin in ["10", "x", "3.5"]:
    try:
        int(metin)
    except ValueError as e:
        ad = type(e).__name__
        sayac[ad] = sayac.get(ad, 0) + 1
    else:
        sayac["OK"] = sayac.get("OK", 0) + 1
print(sayac)
''',
     start=r'''
def hata_ozeti(fonk, girdiler):
    ozet = {}
    for g in girdiler:
        try:
            fonk(g)
        # TODO: except Exception as e → ozet[hata adı] += 1
        # TODO: else → ozet["OK"] += 1
        except Exception:
            pass
    return ozet
''',
     sol=r'''
def hata_ozeti(fonk, girdiler):
    ozet = {}
    for g in girdiler:
        try:
            fonk(g)
        except Exception as e:
            ad = type(e).__name__
            ozet[ad] = ozet.get(ad, 0) + 1
        else:
            ozet["OK"] = ozet.get("OK", 0) + 1
    return ozet
''',
     tests=r'''
def tutar(kayit):
    return 100 / float(kayit["tutar"])
girdiler = [{"tutar": "50"}, {"tutar": "0"}, {}, {"tutar": "yok"}, {"tutar": "4"}, {"tutar": None}]
o = hata_ozeti(tutar, girdiler)
assert o.get("OK") == 2, "2 başarılı çağrı olmalı (50 ve 4)"
assert o.get("ZeroDivisionError") == 1, "tutar 0 → ZeroDivisionError sayılmalı"
assert o.get("KeyError") == 1 and o.get("ValueError") == 1 and o.get("TypeError") == 1, "Her hata kendi adıyla sayılmalı: " + str(o)
assert len(o) == 5, "Fazladan anahtar olmamalı: " + str(o)
assert hata_ozeti(tutar, []) == {}, "Boş girdide boş sözlük"
''',
     hints=['Hata adını almak için type(e).__name__ kullan.', 'Sayım için sozluk.get(anahtar, 0) + 1 kalıbı; başarı için else bloğu.', 'except Exception as e: bloğunda ad = type(e).__name__ ve ozet[ad] = ozet.get(ad, 0) + 1'],
     why='Toplu işte tek bozuk kayıt tüm işi durdurmamalı. Hataları ada göre saymak sabah raporunda "hangi sorun ne sıklıkta" sorusunu cevaplar. else bloğu başarı yolunu try\'dan ayırır.'),
dict(t='code', id='hatalar-x3', stage='Rehberli', diff=2,
     q='<p>Anadolu Market stok modülü. <code>StokYetersiz</code> adında <code>Exception</code>\'dan türeyen bir sınıf tanımla. <code>stoktan_dus(stok, urun, adet)</code>:</p><ul><li>Ürün sözlükte yoksa <code>KeyError</code> kendiliğinden fırlasın (yakalama).</li><li><code>adet</code> 1\'den küçükse <code>ValueError("adet pozitif olmalı")</code>.</li><li>Stok yetmiyorsa <code>StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")</code>.</li><li>Yeterse stoku azalt ve kalan miktarı döndür.</li></ul>',
     guide=['class StokYetersiz(Exception): pass ile sınıfı tanımla.', 'Fonksiyonda önce adet kontrolünü yap ve ValueError fırlat.', 'mevcut = stok[urun] satırı ürün yoksa KeyError\'ı kendisi üretir.', 'mevcut < adet ise StokYetersiz fırlat; değilse sözlüğü güncelle ve kalanı döndür.'],
     example=r'''
class LimitAsildi(Exception):
    pass

def harca(limit, tutar):
    if tutar > limit:
        raise LimitAsildi(f"limit {limit}, istenen {tutar}")
    return limit - tutar

try:
    harca(500, 800)
except LimitAsildi as e:
    print("Reddedildi:", e)
''',
     start=r'''
# TODO: StokYetersiz sınıfını tanımla

def stoktan_dus(stok, urun, adet):
    # TODO: adet < 1 → ValueError("adet pozitif olmalı")
    mevcut = stok[urun]
    # TODO: mevcut < adet → StokYetersiz(...)
    stok[urun] = mevcut - adet
    return stok[urun]
''',
     sol=r'''
class StokYetersiz(Exception):
    pass

def stoktan_dus(stok, urun, adet):
    if adet < 1:
        raise ValueError("adet pozitif olmalı")
    mevcut = stok[urun]
    if mevcut < adet:
        raise StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")
    stok[urun] = mevcut - adet
    return stok[urun]
''',
     tests=r'''
assert issubclass(StokYetersiz, Exception), "StokYetersiz, Exception'dan türemeli"
s = {"kulaklık": 3, "kablo": 40}
assert stoktan_dus(s, "kablo", 15) == 25 and s["kablo"] == 25, "Stok azaltılıp kalan döndürülmeli"
try:
    stoktan_dus(s, "kulaklık", 5)
    assert False, "Stok yetmeyince StokYetersiz fırlatılmalı"
except StokYetersiz as e:
    assert str(e) == "kulaklık: stok 3, istenen 5", "Mesaj biçimi farklı: " + str(e)
assert s["kulaklık"] == 3, "Hata durumunda stok değişmemeli"
for kotu in (0, -2):
    try:
        stoktan_dus(s, "kablo", kotu)
        assert False, "adet < 1 için ValueError bekleniyordu"
    except ValueError as e:
        assert str(e) == "adet pozitif olmalı"
try:
    stoktan_dus(s, "mouse", 1)
    assert False, "Olmayan ürün KeyError vermeli"
except KeyError:
    pass
''',
     hints=['Özel istisna için gövdesi pass olan bir sınıf yeter: class Ad(Exception): pass', 'Kontrolleri stok güncellemesinden ÖNCE yap ki hata durumunda stok bozulmasın.', 'if mevcut < adet: raise StokYetersiz(f"{urun}: stok {mevcut}, istenen {adet}")'],
     why='Kendi istisna sınıfın, çağıranın iş kuralı ihlalini (stok yetersiz) girdi hatasından (ValueError) ve veri hatasından (KeyError) ayırmasını sağlar. Kontroller değişiklikten önce yapılır: ya hep ya hiç.'),
dict(t='code', id='hatalar-x4', stage='Kendin yaz', diff=2,
     q='<p><code>satirlari_isle(satirlar)</code> fonksiyonu <code>"ad,yas"</code> biçimindeki metinleri işlesin ve <code>(kayitlar, hatalar)</code> demeti döndürsün:</p><ul><li><code>kayitlar</code>: başarılı satırlardan <code>(ad, yas_int)</code> demetleri.</li><li><code>hatalar</code>: <code>(satır_no, hata_adı)</code> demetleri; satır numarası 1\'den başlar. Virgül yoksa <code>IndexError</code>, yaş sayı değilse <code>ValueError</code> oluşur (ikisini de yakala, başka türü yakalama).</li></ul>',
     sol=r'''
def satirlari_isle(satirlar):
    kayitlar, hatalar = [], []
    for no, satir in enumerate(satirlar, start=1):
        try:
            parca = satir.split(",")
            kayitlar.append((parca[0].strip(), int(parca[1])))
        except (IndexError, ValueError) as e:
            hatalar.append((no, type(e).__name__))
    return kayitlar, hatalar
''',
     tests=r'''
k, h = satirlari_isle(["Ayşe,34", "Mehmet", "Elif, 29", "Can,otuz", "Zeynep,41"])
assert k == [("Ayşe", 34), ("Elif", 29), ("Zeynep", 41)], "Başarılı kayıtlar: " + str(k)
assert h == [(2, "IndexError"), (4, "ValueError")], "Hatalar satır numarası (1'den) ve hata adıyla: " + str(h)
assert satirlari_isle([]) == ([], []), "Boş girdi"
try:
    satirlari_isle([None])
    assert False, "None satırı AttributeError vermeli; yalnız IndexError ve ValueError yakalanmalı"
except AttributeError:
    pass
''',
     hints=['enumerate(satirlar, start=1) satır numarasını verir.', 'Birden çok türü tek blokta yakalamak için demet: except (IndexError, ValueError) as e:'],
     why='Toplu veri işlerinde hata satırını numarasıyla kaydetmek, kaynağı düzeltecek kişiye tam adres verir. Yalnız beklenen türleri yakalamak, beklenmeyen bir hatanın (None gibi) gizlenmesini önler.'),
dict(t='code', id='hatalar-x5', stage='Kendin yaz', diff=2,
     q='<p><code>tutar_cevir(metin)</code>: Türkçe biçimli tutarı float\'a çevirsin (<code>"1.250,50"</code> → <code>1250.5</code>, <code>" 300 "</code> → <code>300.0</code>). Çevrilemezse içteki teknik hatayı göstermek yerine <code>ValueError(f"geçersiz tutar: {metin!r}")</code> fırlatsın. Metin <code>str</code> değilse <code>TypeError("tutar metin olmalı")</code> fırlatsın.</p>',
     sol=r'''
def tutar_cevir(metin):
    if not isinstance(metin, str):
        raise TypeError("tutar metin olmalı")
    temiz = metin.strip().replace(".", "").replace(",", ".")
    try:
        return float(temiz)
    except ValueError:
        raise ValueError(f"geçersiz tutar: {metin!r}") from None
''',
     tests=r'''
assert tutar_cevir("1.250,50") == 1250.5, "1.250,50 → 1250.5"
assert tutar_cevir(" 300 ") == 300.0, "Kenar boşlukları temizlenmeli"
assert tutar_cevir("89,9") == 89.9
for kotu in ("yok", "", "12a"):
    try:
        tutar_cevir(kotu)
        assert False, repr(kotu) + " için ValueError bekleniyordu"
    except ValueError as e:
        assert str(e) == f"geçersiz tutar: {kotu!r}", "Mesaj 'geçersiz tutar: ' + repr(metin) olmalı, gelen: " + str(e)
try:
    tutar_cevir(300)
    assert False, "Sayı verilirse TypeError bekleniyordu"
except TypeError as e:
    assert str(e) == "tutar metin olmalı"
''',
     hints=['Önce isinstance(metin, str) kontrolü; sonra try içinde float.', 'except ValueError içinde yeni bir ValueError fırlat; {metin!r} tırnaklı gösterir. (from None içteki hatayı traceback\'ten gizler.)'],
     why='Hatayı yakalayıp anlamlı bir mesajla yeniden fırlatmak, çağırana teknik "could not convert string to float" yerine iş diliyle bilgi verir. Tür kontrolü ayrı bir hatadır: TypeError.'),
dict(t='code', id='hatalar-x6', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>hesap_durumu(bakiye_metni)</code> metni sayıya çevirip <code>"negatif"</code>, <code>"sıfır"</code> ya da <code>"pozitif"</code> döndürmeli; metin sayı değilse <code>"geçersiz"</code>, metin <code>None</code> ise <code>"eksik"</code> döndürmeli. Ama "eksik" hiç dönmüyor.</p>',
     start=r'''
def hesap_durumu(bakiye_metni):
    try:
        b = float(bakiye_metni)
    except Exception:
        return "geçersiz"
    except TypeError:
        return "eksik"
    if b < 0:
        return "negatif"
    return "sıfır" if b == 0 else "pozitif"
''',
     sol=r'''
def hesap_durumu(bakiye_metni):
    try:
        b = float(bakiye_metni)
    except TypeError:
        return "eksik"
    except ValueError:
        return "geçersiz"
    if b < 0:
        return "negatif"
    return "sıfır" if b == 0 else "pozitif"
''',
     tests=r'''
assert hesap_durumu("-15.5") == "negatif"
assert hesap_durumu("0") == "sıfır"
assert hesap_durumu("1200") == "pozitif"
assert hesap_durumu("bin lira") == "geçersiz", "Sayı olmayan metin 'geçersiz'"
assert hesap_durumu(None) == "eksik", "float(None) TypeError verir; 'eksik' dönmeli. except sırasını kontrol et"
''',
     hints=['except blokları sırayla denenir; ilk uyan çalışır. TypeError bir Exception mı?', 'Özel türleri (TypeError, ValueError) genel türden önce yaz; burada Exception\'a hiç gerek yok.'],
     why='except Exception en üstte olduğu için TypeError da orada yakalanıyor ve alttaki blok ölü kod kalıyordu. Özelden genele sırala; genel bloğa ihtiyaç yoksa hiç yazma.'),
dict(t='code', id='hatalar-x7', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>ortalama_sepet(siparisler)</code> sipariş sözlüklerinin <code>"tutar"</code> ortalamasını döndürmeli; liste boşsa <code>0</code>. Fonksiyon her durumda 0 döndürüyor. Ayrıca bir siparişte tutar alanı yoksa hata <b>gizlenmemeli</b> (KeyError yukarı çıkmalı). İki sorunu da düzelt.</p>',
     start=r'''
def ortalama_sepet(siparisler):
    try:
        toplam = sum(s["tutr"] for s in siparisler)
        return toplam / len(siparisler)
    except:
        return 0
''',
     sol=r'''
def ortalama_sepet(siparisler):
    try:
        toplam = sum(s["tutar"] for s in siparisler)
        return toplam / len(siparisler)
    except ZeroDivisionError:
        return 0
''',
     tests=r'''
assert ortalama_sepet([{"tutar": 100}, {"tutar": 250}]) == 175, "Ortalama 175 olmalı; anahtar adını kontrol et"
assert ortalama_sepet([]) == 0, "Boş liste 0 döndürmeli (ZeroDivisionError)"
try:
    ortalama_sepet([{"tutar": 10}, {"adet": 2}])
    assert False, "Tutar alanı eksik sipariş KeyError vermeli; çıplak except hatayı gizliyor"
except KeyError:
    pass
''',
     hints=['Çıplak except, yazım hatasından doğan KeyError\'ı da yutup 0 döndürüyor. Anahtar adına bak.', 'Yalnız beklediğin hatayı yakala: boş listede len 0 olduğu için ZeroDivisionError.'],
     why='Çıplak except, "tutr" yazım hatasını yıllarca gizleyebilir: rapor hep 0 gösterir, kimse fark etmez. Yalnız beklenen hatayı (boş listede sıfıra bölme) yakalamak gerçek hataların görünmesini sağlar.'),
dict(t='code', id='hatalar-x8', stage='Meydan okuma', diff=3,
     q='<p>Destek paneli için <code>hata_kategorisi(hata)</code> fonksiyonunu yaz. Parametre bir <b>istisna nesnesi</b>dir. Kategoriler (yukarıdan aşağı ilk uyan geçerli):</p><ul><li><code>"dosya"</code>: OSError ailesi (FileNotFoundError, PermissionError...)</li><li><code>"arama"</code>: LookupError ailesi (KeyError, IndexError)</li><li><code>"girdi"</code>: ValueError veya TypeError ailesi</li><li><code>"hesap"</code>: ArithmeticError ailesi</li><li><code>"kesinti"</code>: Exception OLMAYAN BaseException\'lar (KeyboardInterrupt, SystemExit)</li><li><code>"diger"</code>: geri kalan her şey</li></ul><p>Sınıf adlarını metin olarak karşılaştırma; hiyerarşiyi kullan (<code>isinstance</code>).</p>',
     sol=r'''
def hata_kategorisi(hata):
    if isinstance(hata, OSError):
        return "dosya"
    if isinstance(hata, LookupError):
        return "arama"
    if isinstance(hata, (ValueError, TypeError)):
        return "girdi"
    if isinstance(hata, ArithmeticError):
        return "hesap"
    if not isinstance(hata, Exception):
        return "kesinti"
    return "diger"
''',
     tests=r'''
assert hata_kategorisi(FileNotFoundError("x")) == "dosya"
assert hata_kategorisi(PermissionError("x")) == "dosya", "PermissionError da OSError ailesindendir"
assert hata_kategorisi(KeyError("k")) == "arama" and hata_kategorisi(IndexError()) == "arama"
assert hata_kategorisi(ValueError()) == "girdi" and hata_kategorisi(TypeError()) == "girdi"
u = UnicodeDecodeError("utf-8", b"\xff", 0, 1, "geçersiz bayt")
assert hata_kategorisi(u) == "girdi", "UnicodeDecodeError, ValueError'ın alt sınıfıdır → girdi"
assert hata_kategorisi(ZeroDivisionError()) == "hesap" and hata_kategorisi(OverflowError()) == "hesap"
assert hata_kategorisi(KeyboardInterrupt()) == "kesinti", "KeyboardInterrupt Exception değildir"
assert hata_kategorisi(SystemExit(1)) == "kesinti"
assert hata_kategorisi(RuntimeError()) == "diger" and hata_kategorisi(AttributeError()) == "diger"
class OzelHata(KeyError):
    pass
assert hata_kategorisi(OzelHata()) == "arama", "KeyError'dan türeyen özel hata da arama kategorisinde"
_k = __source__
assert "__name__" not in _k, "Sınıf adını metin olarak karşılaştırma; isinstance ile hiyerarşiyi kullan"
''',
     hints=['isinstance(nesne, Sınıf) alt sınıfları da kapsar; bir demet de verebilirsin.', 'Kesinti kontrolü: not isinstance(hata, Exception). Sıra önemli; "diger" en sonda.'],
     why='isinstance hiyerarşiyi bilir: UnicodeDecodeError\'ı "girdi", KeyError\'dan türeyen özel sınıfı "arama" sayar. Ada göre karşılaştırma bu alt sınıfları kaçırırdı. except bloklarının çalışma mantığı da tamamen budur.'),
]

EXT['faq'] = [
 dict(q='Hangi hatanın hangi sınıftan türediğini nasıl öğrenirim?', a='HataAdi.__mro__ soy ağacını gösterir (ör. KeyError.__mro__). issubclass(KeyError, LookupError) True/False verir. Resmi belgelerde "Exception hierarchy" başlığı tüm ağacı listeler.'),
 dict(q='raise ile raise e arasında fark var mı?', a='except içinde yalın raise, yakalanan istisnayı orijinal traceback\'iyle aynen fırlatır. raise e de aynı nesneyi fırlatır ama traceback\'e bu satırı ekler. Yeniden iletmek için yalın raise tercih edilir; türü değiştirmek gerekiyorsa raise YeniHata(...) from e kullanılır (Hata tasarımı dersi).'),
]
EXT['mistakes'] = [
 dict(bad='try:\n    islem()\nexcept Exception:\n    print("genel")\nexcept ValueError:\n    print("değer hatası")', good='try:\n    islem()\nexcept ValueError:\n    print("değer hatası")\nexcept Exception:\n    print("genel")', why='İlk uyan except çalışır. Genel tür üstteyse özel blok ölü koddur; sıra her zaman özelden genele olmalı.'),
 dict(bad='try:\n    sonuc = hesapla()\nexcept ValueError as e:\n    pass\nprint(e)', good='son_hata = None\ntry:\n    sonuc = hesapla()\nexcept ValueError as e:\n    son_hata = e\nprint(son_hata)', why='"as e" ile bağlanan ad except bloğu bitince silinir; dışarıda kullanırsan NameError alırsın. Gerekiyorsa başka bir değişkene ata.'),
]
