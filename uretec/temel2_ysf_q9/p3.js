/* ───────────────────────── 6. DOSYA İŞLEMLERİ ───────────────────────── */
{
  id: 'dosya-islemleri',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 30,
  title: 'Dosya işlemleri',
  sum: 'Veri programdan uzun yaşar: open ve with, okuma-yazma modları, satır satır okuma, CSV metnini elle ayrıştırma ve pathlib ile modern dosya yolu.',
  goals: [
    'with open(...) kalıbıyla dosyayı güvenle açıp kapatabilirim.',
    'r, w, a modlarının farkını bilir ve doğru modu seçebilirim.',
    'Büyük dosyayı satır satır okuyup her satırı işleyebilirim.',
    'Basit bir CSV metnini split ile ayrıştırıp sayısal alanları dönüştürebilirim.',
    'pathlib.Path ile dosya yolu kurup read_text / write_text kullanabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Program kapanınca değişkenler silinir. Anadolu Market'in sipariş listesi, Anadolu Bank'ın günlük işlem dökümü ise kalıcı olmalı: diske yazılır, yarın yeniden okunur, başka programlara verilir. İş hayatında verinin büyük bölümü hâlâ düz metin ve CSV dosyalarında dolaşır. Bu derste önce bellekte küçük dosyalar oluşturup okuyacağız; aynı kod bilgisayarındaki gerçek dosyalarda da çalışır.</p>
<div class="note"><b>Tarayıcıdaki dosyalar</b>Bu uygulama tarayıcıda çalıştığı için yazdığın dosyalar bellek içi bir dosya sisteminde oluşur; sayfayı yenileyince silinir. Kendi bilgisayarında aynı kod gerçek dosyalar üretir. Alıştırmalarda önce dosyayı kodla yazıp sonra okuyacağız.</div>

<h2>open ve with: aç, kullan, kesin kapat</h2>
<p><code>open(yol, mod, encoding="utf-8")</code> bir dosya nesnesi döndürür. <code>with</code> bloğu bittiğinde dosya, hata olsa bile <b>otomatik kapanır</b>. Kapanmayan dosya veri kaybına ve "dosya kullanımda" hatalarına yol açar; bu yüzden hep <code>with</code> kullan.</p>
<pre class="py">with open("notlar.txt", "w", encoding="utf-8") as f:
    f.write("Anadolu Market günlük notlar\\n")
    f.write("Kulaklık stoğu kritik\\n")

with open("notlar.txt", "r", encoding="utf-8") as f:
    icerik = f.read()

print(icerik)
print("Karakter sayısı:", len(icerik))</pre>
<div class="tip"><b>encoding="utf-8" yazmayı unutma</b>Türkçe karakterler (ş, ğ, İ) için şart. Windows'ta varsayılan kodlama farklı olabilir ve "ş" yerine bozuk karakterler görürsün. Her open çağrısına ekle.</div>

<h2>Dosya modları</h2>
<div class="tbl-wrap"><table>
<tr><th>Mod</th><th>Adı</th><th>Dosya varsa</th><th>Dosya yoksa</th></tr>
<tr><td><code>"r"</code></td><td>okuma (read)</td><td>baştan okur</td><td>FileNotFoundError</td></tr>
<tr><td><code>"w"</code></td><td>yazma (write)</td><td><b>içeriği siler</b>, baştan yazar</td><td>oluşturur</td></tr>
<tr><td><code>"a"</code></td><td>ekleme (append)</td><td>sonuna ekler</td><td>oluşturur</td></tr>
<tr><td><code>"x"</code></td><td>yeni oluştur</td><td>FileExistsError</td><td>oluşturur</td></tr>
<tr><td><code>"rb"</code> / <code>"wb"</code></td><td>ikili (binary)</td><td colspan="2">resim, PDF gibi metin olmayan dosyalar; encoding verilmez</td></tr>
</table></div>
<div class="warn"><b>"w" acımasızdır</b>Var olan dosyayı "w" ile açtığın anda içeriği silinir, henüz hiçbir şey yazmamış olsan bile. Günlük (log) tutuyorsan "a" kullan.</div>
<pre class="py">with open("islem.log", "w", encoding="utf-8") as f:
    f.write("09:00 sistem açıldı\\n")

with open("islem.log", "a", encoding="utf-8") as f:
    f.write("09:15 sipariş 1001 alındı\\n")
    f.write("09:20 sipariş 1002 alındı\\n")

with open("islem.log", encoding="utf-8") as f:   # mod verilmezse "r"
    print(f.read())</pre>

<h2>Satır satır okuma</h2>
<p><code>read()</code> tüm dosyayı tek metin olarak belleğe alır; milyonlarca satırlık bir log için uygun değildir. Dosya nesnesi üzerinde doğrudan <code>for</code> ile dönersen Python satırları teker teker okur. Her satırın sonunda <code>\\n</code> gelir; <code>strip()</code> ile temizle.</p>
<pre class="py">with open("islem.log", encoding="utf-8") as f:
    for numara, satir in enumerate(f, start=1):
        satir = satir.strip()
        if "sipariş" in satir:
            print(f"{numara}: {satir}")

# Tüm satırları liste olarak almak
with open("islem.log", encoding="utf-8") as f:
    satirlar = f.readlines()
print(len(satirlar), "satır")
print(satirlar[0].rstrip())</pre>

<h2>CSV'yi elle ayrıştırma</h2>
<p>CSV (comma-separated values), her satırın bir kayıt, virgülle ayrılmış her parçanın bir alan olduğu düz metin dosyasıdır; Excel açar, her sistem üretir. İlk satır genelde başlık. Dosyadan okunan her şey metindir; sayısal alanları <code>int</code>/<code>float</code> ile dönüştürmeyi unutma.</p>
<pre class="py">csv_metni = """id,musteri,sehir,tutar
1001,Ayşe,Ankara,900.0
1002,Mehmet,İzmir,820.0
1003,Elif,Ankara,930.0
1004,Can,İstanbul,450.0
"""
with open("siparisler.csv", "w", encoding="utf-8") as f:
    f.write(csv_metni)

siparisler = []
with open("siparisler.csv", encoding="utf-8") as f:
    basliklar = f.readline().strip().split(",")
    for satir in f:
        satir = satir.strip()
        if not satir:            # boş satırı atla
            continue
        alanlar = satir.split(",")
        kayit = dict(zip(basliklar, alanlar))
        kayit["id"] = int(kayit["id"])
        kayit["tutar"] = float(kayit["tutar"])
        siparisler.append(kayit)

print(basliklar)
print(siparisler[0])
print("Toplam:", sum(s["tutar"] for s in siparisler))</pre>
<p><code>dict(zip(basliklar, alanlar))</code> hilesi başlıkla değeri eşleştirip sözlük üretir; sütun sırası değişse bile kod bozulmaz. Alan içinde virgül ya da tırnak varsa (adres gibi) elle split yetmez; o zaman standart <code>csv</code> modülünü kullanırsın, orta seviyede göreceğiz.</p>

<h2>Dosyaya rapor yazma</h2>
<p>Önceki derste ürettiğin rapor metnini dosyaya yazmak tek satır: <code>f.write(rapor)</code>. Birden çok satırı tek seferde yazmak için <code>writelines</code> var ama satır sonlarını kendin eklemelisin; en temizi <code>"\\n".join(...)</code> ile metni hazırlayıp yazmaktır.</p>
<pre class="py">satirlar = [f"{'Şehir':&lt;10}{'Ciro':&gt;10}", "-" * 20]
for sehir, ciro in [("Ankara", 1830.0), ("İzmir", 820.0), ("İstanbul", 450.0)]:
    satirlar.append(f"{sehir:&lt;10}{ciro:&gt;10,.2f}")

with open("rapor.txt", "w", encoding="utf-8") as f:
    f.write("\\n".join(satirlar) + "\\n")

with open("rapor.txt", encoding="utf-8") as f:
    print(f.read())</pre>

<h2>pathlib: dosya yolu bir nesnedir</h2>
<p><code>os.path</code> ile metin birleştirmek yerine <code>pathlib.Path</code> yolu bir nesne olarak taşır; <code>/</code> operatörüyle parçalar birleşir, işletim sistemi farkı (Windows'ta ters bölü) kendiliğinden çözülür. Küçük dosyalar için <code>read_text</code> ve <code>write_text</code> kısayolları <code>with open</code> yazmaktan da kısadır.</p>
<pre class="py">from pathlib import Path

klasor = Path("raporlar")
klasor.mkdir(exist_ok=True)          # varsa hata verme
dosya = klasor / "ciro_2024_03.txt"  # yol birleştirme

dosya.write_text("Ankara;1830.00\\nİzmir;820.00\\n", encoding="utf-8")
print(dosya.exists(), dosya.name, dosya.suffix, dosya.parent)
print(dosya.read_text(encoding="utf-8"))

for p in klasor.glob("*.txt"):       # klasördeki txt dosyaları
    print("bulundu:", p)</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Büyük dosyada bellek</h3>
<p>Satır satır okuma, dosya ne kadar büyük olursa olsun bellekte yalnız bir satır tutar. Bir gigabaytlık log'u <code>read()</code> ile açmak programı çökertebilir; <code>for satir in f</code> ile dakikalar sürse de biter. Orta seviyedeki üreteçler (generator) bu fikri genelleştirir.</p>
<h3>Yolu sabit yazma</h3>
<p><code>"C:/Users/ayse/rapor.txt"</code> gibi mutlak yollar başka bilgisayarda çalışmaz. Betiğin bulunduğu klasöre göreli yol kur: <code>Path(__file__).parent / "veri" / "siparisler.csv"</code>. Ayarları ortam değişkeninden okumak da yaygındır.</p>
<h3>Atomik yazma</h3>
<p>Rapor yazılırken elektrik kesilirse yarım dosya kalır. Kurumsal betikler önce geçici dosyaya yazar, sonra <code>Path.replace</code> ile asıl adına taşır; taşıma işlemi ya tamamen olur ya hiç olmaz. Veri kaybının ucuz çözümü budur.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'dosya-islemleri-1',
      q: '<p><code>notlari_yaz(yol, notlar)</code> fonksiyonu bir metin listesini, <b>her not ayrı satırda</b> olacak şekilde verilen dosyaya yazsın (mod <code>"w"</code>, encoding utf-8). Son satırdan sonra da <code>\\n</code> olsun. Fonksiyon bir şey döndürmesin.</p>',
      start: 'def notlari_yaz(yol, notlar):\n    pass\n',
      sol: 'def notlari_yaz(yol, notlar):\n    with open(yol, "w", encoding="utf-8") as f:\n        for n in notlar:\n            f.write(n + "\\n")\n',
      tests: 'notlari_yaz("n1.txt", ["Kulaklık stoğu kritik", "Kargo firması değişti"])\nwith open("n1.txt", encoding="utf-8") as f:\n    icerik = f.read()\nassert icerik == "Kulaklık stoğu kritik\\nKargo firması değişti\\n", "her not ayrı satırda ve sonunda satır sonu olmalı"\nnotlari_yaz("n1.txt", ["tek"])\nwith open("n1.txt", encoding="utf-8") as f:\n    assert f.read() == "tek\\n", "w modu eski içeriği silmeli"\nnotlari_yaz("n2.txt", [])\nwith open("n2.txt", encoding="utf-8") as f:\n    assert f.read() == "", "boş liste boş dosya üretmeli"\n',
      hints: ['with open(yol, "w", encoding="utf-8") as f:', 'Her nota "\\n" ekleyerek f.write et.'],
      why: 'write satır sonu eklemez; her nota kendin eklersin. "w" modu dosyayı her çağrıda sıfırdan yazar.' },
    { t: 'code', id: 'dosya-islemleri-2',
      q: '<p><code>log_ekle(yol, mesaj)</code> fonksiyonu mesajı dosyanın <b>sonuna</b> yeni satır olarak eklesin; eski içerik silinmesin. Dosya yoksa oluşturulsun.</p>',
      start: 'def log_ekle(yol, mesaj):\n    pass\n',
      sol: 'def log_ekle(yol, mesaj):\n    with open(yol, "a", encoding="utf-8") as f:\n        f.write(mesaj + "\\n")\n',
      tests: 'import os\nif os.path.exists("islem_test.log"):\n    os.remove("islem_test.log")\nlog_ekle("islem_test.log", "09:00 sistem açıldı")\nlog_ekle("islem_test.log", "09:15 sipariş 1001 alındı")\nwith open("islem_test.log", encoding="utf-8") as f:\n    satirlar = f.read().splitlines()\nassert satirlar == ["09:00 sistem açıldı", "09:15 sipariş 1001 alındı"], "iki çağrıdan sonra iki satır olmalı; eski satır korunmalı"\n',
      hints: ['Ekleme modu "a".', 'Mesajın sonuna "\\n" ekle.'],
      why: '"a" modu dosya sonuna yazar ve dosya yoksa oluşturur. "w" kullansaydın ikinci çağrı ilkini silerdi.' },
    { t: 'mc', q: 'Var olan bir dosyayı <code>open("rapor.txt", "w")</code> ile açıp hiçbir şey yazmadan kapatırsan ne olur?',
      o: ['Dosya değişmez', 'FileExistsError oluşur', 'Dosyanın içeriği silinir', 'Dosya salt okunur olur'], a: 2,
      why: '"w" modu dosyayı açar açmaz içeriğini sıfırlar; yazıp yazmaman fark etmez. Var olan içeriği korumak için "a" ya da "r+" kullanılır.' },
    { t: 'code', id: 'dosya-islemleri-3',
      q: '<p><code>kritik_satirlar(yol, anahtar)</code> fonksiyonu dosyayı <b>satır satır</b> okusun ve içinde <code>anahtar</code> metni geçen satırları (baştaki ve sondaki boşluklar temizlenmiş halde) liste olarak döndürsün. <code>read()</code> kullanma; dosya nesnesi üzerinde for ile dön.</p>',
      start: 'def kritik_satirlar(yol, anahtar):\n    bulunanlar = []\n    pass\n    return bulunanlar\n',
      sol: 'def kritik_satirlar(yol, anahtar):\n    bulunanlar = []\n    with open(yol, encoding="utf-8") as f:\n        for satir in f:\n            satir = satir.strip()\n            if anahtar in satir:\n                bulunanlar.append(satir)\n    return bulunanlar\n',
      tests: 'with open("stok.log", "w", encoding="utf-8") as f:\n    f.write("Kulaklık stok: 12\\nKlavye stok: 3 KRITIK\\nMouse stok: 25\\nMonitör stok: 0 KRITIK\\n")\nassert kritik_satirlar("stok.log", "KRITIK") == ["Klavye stok: 3 KRITIK", "Monitör stok: 0 KRITIK"], "KRITIK geçen iki satır dönmeli"\nassert kritik_satirlar("stok.log", "Mouse") == ["Mouse stok: 25"], "Mouse satırı dönmeli, satır sonu temizlenmiş olmalı"\nassert kritik_satirlar("stok.log", "Webcam") == [], "eşleşme yoksa boş liste"\nimport inspect\nassert ".read()" not in inspect.getsource(kritik_satirlar), "read() yerine satır satır oku"\n',
      hints: ['for satir in f: her turda bir satır verir.', 'strip() ile satır sonunu temizle, sonra in ile kontrol et.'],
      why: 'Dosya nesnesi yinelenebilirdir; satır satır okumak belleği korur. strip olmadan satır sonundaki \\n listeye girer.' },
    { t: 'code', id: 'dosya-islemleri-4',
      q: '<p><code>csv_oku(yol)</code> fonksiyonu başlık satırı <code>id,musteri,sehir,tutar</code> olan bir CSV dosyasını okuyup her satırı sözlük olarak döndürsün (liste içinde). <code>id</code> alanı <b>int</b>, <code>tutar</code> alanı <b>float</b> olsun; diğerleri metin kalsın. Boş satırları atla.</p>',
      start: 'def csv_oku(yol):\n    kayitlar = []\n    with open(yol, encoding="utf-8") as f:\n        basliklar = f.readline().strip().split(",")\n        for satir in f:\n            pass\n    return kayitlar\n',
      sol: 'def csv_oku(yol):\n    kayitlar = []\n    with open(yol, encoding="utf-8") as f:\n        basliklar = f.readline().strip().split(",")\n        for satir in f:\n            satir = satir.strip()\n            if not satir:\n                continue\n            kayit = dict(zip(basliklar, satir.split(",")))\n            kayit["id"] = int(kayit["id"])\n            kayit["tutar"] = float(kayit["tutar"])\n            kayitlar.append(kayit)\n    return kayitlar\n',
      tests: 'with open("sip.csv", "w", encoding="utf-8") as f:\n    f.write("id,musteri,sehir,tutar\\n1001,Ayşe,Ankara,900.0\\n1002,Mehmet,İzmir,820.5\\n\\n1003,Elif,Ankara,930\\n")\nk = csv_oku("sip.csv")\nassert len(k) == 3, "boş satır atlanınca 3 kayıt olmalı"\nassert k[0] == {"id": 1001, "musteri": "Ayşe", "sehir": "Ankara", "tutar": 900.0}, "ilk kayıt sözlük olarak doğru olmalı"\nassert isinstance(k[1]["id"], int) and isinstance(k[1]["tutar"], float), "id int, tutar float olmalı"\nassert k[2]["tutar"] == 930.0, "tam sayı yazılmış tutar da float olmalı"\n',
      hints: ['Her satırı strip edip boşsa continue.', 'dict(zip(basliklar, satir.split(","))) sözlük üretir.', 'int() ve float() ile iki alanı dönüştür.'],
      why: 'Dosyadan gelen her şey metindir; sayısal alanları açıkça dönüştürmek gerekir. zip ile başlık-değer eşlemesi sütun sırasına bağımlılığı kaldırır.' },
    { t: 'mc', q: '<code>with open(...) as f:</code> kalıbının asıl faydası nedir?',
      o: ['Dosyayı daha hızlı okur', 'Blok bitince dosyayı hata olsa bile kapatır', 'Dosyayı otomatik UTF-8 yapar', 'Dosya yoksa oluşturur'], a: 1,
      why: 'with, bağlam yöneticisi (context manager) olarak blok sonunda close() çağrısını garanti eder; istisna fırlasa bile. Hız, kodlama ve dosya oluşturma ile ilgisi yoktur.' },
    { t: 'code', id: 'dosya-islemleri-5',
      q: '<p><code>pathlib</code> kullanarak <code>rapor_kaydet(klasor_adi, dosya_adi, metin)</code> fonksiyonunu yaz: klasörü yoksa oluştursun (<code>mkdir(exist_ok=True)</code>), <code>klasor / dosya_adi</code> yoluna metni <code>write_text</code> ile (utf-8) yazsın ve oluşan <code>Path</code> nesnesini döndürsün.</p>',
      start: 'from pathlib import Path\n\ndef rapor_kaydet(klasor_adi, dosya_adi, metin):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef rapor_kaydet(klasor_adi, dosya_adi, metin):\n    klasor = Path(klasor_adi)\n    klasor.mkdir(exist_ok=True)\n    yol = klasor / dosya_adi\n    yol.write_text(metin, encoding="utf-8")\n    return yol\n',
      tests: 'from pathlib import Path\np = rapor_kaydet("raporlar_test", "ciro.txt", "Ankara;1830.00\\n")\nassert isinstance(p, Path), "Path nesnesi dönmeli"\nassert p.exists(), "dosya oluşmalı"\nassert p.name == "ciro.txt" and p.parent.name == "raporlar_test", "yol klasor/dosya biçiminde olmalı"\nassert p.read_text(encoding="utf-8") == "Ankara;1830.00\\n", "içerik doğru yazılmalı"\np2 = rapor_kaydet("raporlar_test", "ciro.txt", "yeni")\nassert p2.read_text(encoding="utf-8") == "yeni", "ikinci çağrı (klasör varken) hata vermemeli ve üzerine yazmalı"\n',
      hints: ['Path(klasor_adi).mkdir(exist_ok=True)', 'Yolu / ile birleştir; write_text ile yaz; Path nesnesini döndür.'],
      why: 'pathlib ile klasör oluşturma, yol birleştirme ve yazma üç kısa satırdır; exist_ok=True tekrar çağrılarda hata vermesini engeller.' }
  ],
  faq: [
    { q: 'Dosyayı with olmadan açarsam ne olur?', a: 'Çalışır ama close() çağırmayı sen hatırlamalısın; hata fırlarsa kapanmayabilir ve son yazılanlar diske ulaşmayabilir. with bunu senin yerine garantiler; alışkanlık edin.' },
    { q: 'readline, readlines ve for farkı nedir?', a: 'readline bir satır okur, readlines tüm satırları liste yapar (belleğe alır), for satir in f ise satırları tek tek, bellek dostu şekilde verir. Büyük dosyada for kullan.' },
    { q: 'Dosya yoksa hata almak istemiyorum.', a: 'Önce Path(yol).exists() ile kontrol et ya da bir sonraki derste göreceğin try/except FileNotFoundError ile yakala. Yazma modları (w, a) dosyayı zaten oluşturur.' }
  ],
  mistakes: [
    { bad: 'f = open("rapor.txt", "w")\nf.write("...")', good: 'with open("rapor.txt", "w", encoding="utf-8") as f:\n    f.write("...")', why: 'Kapatılmayan dosyada veri diske yazılmayabilir; with blok sonunda kapatır.' },
    { bad: 'with open("gunluk.log", "w") as f:\n    f.write("yeni olay\\n")', good: 'with open("gunluk.log", "a", encoding="utf-8") as f:\n    f.write("yeni olay\\n")', why: '"w" eski kayıtları siler; günlük için ekleme modu "a" gerekir.' },
    { bad: 'for satir in f:\n    if satir == "Ankara":\n        ...', good: 'for satir in f:\n    if satir.strip() == "Ankara":\n        ...', why: 'Okunan satırın sonunda \\n vardır; strip etmeden karşılaştırma hiç eşleşmez.' },
    { bad: 'toplam += kayit["tutar"]', good: 'toplam += float(kayit["tutar"])', why: 'Dosyadan okunan alan metindir; sayıya çevirmeden toplanamaz (TypeError).' }
  ]
},
/* ───────────────────────── 7. HATALAR ───────────────────────── */
{
  id: 'hatalar',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 28,
  title: 'Hatalar ve istisnalar',
  sum: 'Program çökmesin, anlamlı mesaj versin: hata türleri, traceback okuma, try/except/else/finally, raise ile kendi hatanı fırlatma ve savunmacı kod.',
  goals: [
    'Bir traceback mesajını okuyup hatanın türünü ve satırını bulabilirim.',
    'try/except ile belirli hata türlerini yakalayıp programın devam etmesini sağlayabilirim.',
    'else ve finally bloklarının ne zaman çalıştığını açıklayabilirim.',
    'raise ile geçersiz girdide anlamlı bir hata fırlatabilirim.',
    'Hangi hatayı yakalayıp hangisini yukarı bırakacağıma karar verebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank'ın gece çalışan rapor betiği, bir satırda tutar yerine "yok" yazdığı için saat 03:00'te çöktü ve sabah hiç rapor yoktu. Oysa o satırı atlayıp loga yazsa, kalan binlerce satır işlenirdi. Hata (error) kaçınılmazdır; mesele programın hatayı <b>nasıl karşıladığı</b>dır. Python'da hatalar <b>istisna</b> (exception) adlı nesnelerle temsil edilir ve yakalanabilir.</p>

<h2>Hata mesajı (traceback) okuma</h2>
<pre class="py">def ortalama(liste):
    return sum(liste) / len(liste)

try:
    ortalama([])
except Exception as e:
    print(type(e).__name__, "->", e)</pre>
<p>Bu kodu yakalamasaydık Python şöyle bir <b>traceback</b> basardı:</p>
<pre class="out">Traceback (most recent call last):
  File "rapor.py", line 5, in &lt;module&gt;
    ortalama([])
  File "rapor.py", line 2, in ortalama
    return sum(liste) / len(liste)
ZeroDivisionError: division by zero</pre>
<p>Okuma sırası: <b>en alt satır</b> hatanın türü ve mesajıdır; hemen üstü hatanın oluştuğu satır; yukarı doğru çıktıkça oraya hangi çağrılarla gelindiğini görürsün. Önce en alta bak, sonra kendi dosyandaki ilk satırı bul.</p>

<h2>Sık karşılaşılan hata türleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Hata</th><th>Ne zaman</th><th>Örnek</th></tr>
<tr><td><code>SyntaxError</code></td><td>Kod daha çalışmadan: yazım hatası</td><td>eksik iki nokta, kapanmayan parantez</td></tr>
<tr><td><code>NameError</code></td><td>Tanımsız ad</td><td><code>print(toplm)</code></td></tr>
<tr><td><code>TypeError</code></td><td>Yanlış tür</td><td><code>"5" + 3</code></td></tr>
<tr><td><code>ValueError</code></td><td>Tür doğru, değer uygunsuz</td><td><code>int("abc")</code></td></tr>
<tr><td><code>KeyError</code></td><td>Sözlükte olmayan anahtar</td><td><code>musteri["telefon"]</code></td></tr>
<tr><td><code>IndexError</code></td><td>Listede olmayan indeks</td><td><code>liste[10]</code></td></tr>
<tr><td><code>ZeroDivisionError</code></td><td>Sıfıra bölme</td><td><code>toplam / 0</code></td></tr>
<tr><td><code>FileNotFoundError</code></td><td>Dosya yok</td><td><code>open("yok.txt")</code></td></tr>
<tr><td><code>AttributeError</code></td><td>Nesnede olmayan öznitelik</td><td><code>"abc".push("d")</code></td></tr>
</table></div>

<h2>try / except: hatayı yakala</h2>
<p>Hata çıkabilecek kodu <code>try</code> bloğuna, hata olursa yapılacak işi <code>except</code> bloğuna yaz. Yakalayacağın hata türünü <b>açıkça</b> belirt; birden fazla tür için demet ya da ayrı except blokları kullan.</p>
<pre class="py">ham_tutarlar = ["900.0", "820.5", "yok", "930", "", "45,50"]
toplam = 0.0
hatali = []

for ham in ham_tutarlar:
    try:
        toplam += float(ham)
    except ValueError:
        hatali.append(ham)

print("Toplam:", toplam)
print("Atlanan değerler:", hatali)</pre>
<pre class="py">musteri = {"ad": "Ayşe", "sehir": "Ankara"}
alanlar = ["ad", "telefon", "sehir"]

for alan in alanlar:
    try:
        print(alan, "=", musteri[alan])
    except KeyError as e:
        print("eksik alan:", e)

try:
    sonuc = 100 / int("0")
except (ZeroDivisionError, ValueError) as e:
    print("hesap yapılamadı:", type(e).__name__)</pre>
<div class="warn"><b>Çıplak except yazma</b><code>except:</code> ya da <code>except Exception:</code> her şeyi yutar: yazım hatasını, yanlış değişken adını, kullanıcının Ctrl+C'sini bile. Hata gizlenir, program yanlış sonuçla sessizce devam eder. Hangi hatayı beklediğini biliyorsan onu yaz; bilmiyorsan muhtemelen yakalamamalısın.</div>

<h2>else ve finally</h2>
<ul>
  <li><b>else</b>: try bloğu <b>hatasız</b> biterse çalışır. "Hata çıkabilecek kısım" ile "başarılıysa yapılacak kısım" ayrılır.</li>
  <li><b>finally</b>: hata olsa da olmasa da, hatta except içinde return olsa bile <b>her zaman</b> çalışır. Kaynak kapatma, geçici dosya silme, "işlem bitti" logu için.</li>
</ul>
<pre class="py">def dosya_toplami(yol):
    try:
        f = open(yol, encoding="utf-8")
    except FileNotFoundError:
        print("dosya yok:", yol)
        return 0
    else:
        toplam = sum(float(s) for s in f if s.strip())
        print("okundu:", yol)
        return toplam
    finally:
        print("işlem tamamlandı:", yol)

with open("tutarlar.txt", "w", encoding="utf-8") as f:
    f.write("100\\n250.5\\n\\n49.5\\n")

print(dosya_toplami("tutarlar.txt"))
print(dosya_toplami("olmayan.txt"))</pre>
<p>Sıra sabittir: <code>try</code> → <code>except</code> (bir ya da daha çok) → <code>else</code> → <code>finally</code>. Gerçek kodda dosya için <code>with</code> kullanırsın; finally'nin yaptığı kapatma işini with zaten yapar.</p>

<h2>raise: kendi hatanı fırlat</h2>
<p>Fonksiyonun geçersiz girdi aldığında sessizce yanlış sonuç üretmesi, hata vermesinden kötüdür. <code>raise</code> ile uygun bir istisna fırlat; mesajı açıklayıcı yaz. Girdiyi fonksiyonun başında kontrol etmeye <b>savunmacı kod</b> (defensive programming) denir.</p>
<pre class="py">def para_cek(bakiye, tutar):
    if tutar &lt;= 0:
        raise ValueError(f"tutar pozitif olmalı, gelen: {tutar}")
    if tutar &gt; bakiye:
        raise ValueError(f"yetersiz bakiye: {bakiye} &lt; {tutar}")
    return bakiye - tutar

print(para_cek(1000, 300))
for deneme in (-5, 5000):
    try:
        para_cek(1000, deneme)
    except ValueError as e:
        print("RED:", e)</pre>
<p>Hangi tür? Değer uygunsuzsa <code>ValueError</code>, tür yanlışsa <code>TypeError</code>, bir şey bulunamadıysa <code>KeyError</code>/<code>LookupError</code>. Orta seviyede kendi hata sınıflarını (<code>class YetersizBakiye(Exception)</code>) tanımlayacaksın.</p>
<div class="tip"><b>Yakala ya da bırak</b>Bir hatayı yalnızca onunla ilgili <b>anlamlı bir şey yapabiliyorsan</b> yakala: atla, varsayılan kullan, kullanıcıya düzgün mesaj ver. Yapamıyorsan bırak yukarı çıksın; çağıran fonksiyon ya da ana program karar versin. except bloğunda yalnızca <code>raise</code> yazarak hatayı loglayıp yeniden fırlatabilirsin.</div>

<h2>Savunmacı kod: EAFP ve LBYL</h2>
<p>İki yaklaşım var. <b>LBYL</b> (look before you leap): önce kontrol et, sonra yap: <code>if "tutar" in kayit:</code>. <b>EAFP</b> (easier to ask forgiveness than permission): yap, hata çıkarsa yakala: <code>try: kayit["tutar"] except KeyError:</code>. Python topluluğu çoğunlukla EAFP'yi tercih eder; özellikle kontrol ile kullanım arasında durum değişebiliyorsa (dosya, ağ). Ama girdinin geçerliliğini fonksiyon başında <code>raise</code> ile doğrulamak her zaman iyidir.</p>
<pre class="py">kayit = {"id": 1001, "tutar": "900.0"}

# LBYL
if "tutar" in kayit and kayit["tutar"].replace(".", "").isdigit():
    print("LBYL:", float(kayit["tutar"]))

# EAFP
try:
    print("EAFP:", float(kayit["tutar"]))
except (KeyError, ValueError) as e:
    print("geçersiz kayıt:", e)

# dict.get ile varsayılan: en kısa yol
print(kayit.get("sehir", "bilinmiyor"))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hata bir mesajdır, gürültü değil</h3>
<p>İyi bir hata mesajı ne beklendiğini, ne geldiğini ve mümkünse hangi kaydı söyler: <code>ValueError("satır 42: tutar sayı olmalı, gelen 'yok'")</code>. Gece çalışan betiğin loguna bakan kişi sorunu dakikalar içinde bulur.</p>
<h3>Hata zinciri</h3>
<p>Düşük seviye hatayı yakalayıp daha anlamlı bir hata fırlatırken <code>raise YeniHata(...) from e</code> yaz; traceback her iki hatayı da gösterir, asıl neden kaybolmaz.</p>
<h3>Hataları say, sonra karar ver</h3>
<p>Toplu veri işlerken ilk hatada durmak yerine hataları bir listede topla; iş bitince "1000 satırdan 3'ü atlandı" diye raporla. Kabul edilebilir hata oranı iş birimine göre değişir: kampanya e-postası için yüzde 1 sorun değil, banka mutabakatı için tek satır bile kabul edilmez. Bu kararı kodun değil, iş kuralının vermesi gerekir; sen sayıyı ölçülebilir hale getir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'hatalar-1',
      q: '<p><code>guvenli_float(metin)</code> fonksiyonu metni <code>float</code>\'a çevirsin; çevrilemezse (<code>ValueError</code>) <code>None</code> döndürsün. Yalnızca ValueError yakala.</p>',
      start: 'def guvenli_float(metin):\n    pass\n',
      sol: 'def guvenli_float(metin):\n    try:\n        return float(metin)\n    except ValueError:\n        return None\n',
      tests: 'assert guvenli_float("900.5") == 900.5, "900.5 metni sayıya çevrilmeli"\nassert guvenli_float("yok") is None, "çevrilemeyen metin için None"\nassert guvenli_float("") is None, "boş metin için None"\nassert guvenli_float("  42 ") == 42.0, "boşluklu sayı float tarafından kabul edilir"\nimport inspect\nsrc = inspect.getsource(guvenli_float)\nassert "ValueError" in src, "ValueError açıkça yakalanmalı"\nassert "except:" not in src and "except Exception" not in src, "çıplak except kullanma"\n',
      hints: ['try içinde return float(metin).', 'except ValueError: return None'],
      why: 'Yalnızca beklenen hata yakalanır; başka bir sorun (örneğin None gelirse TypeError) gizlenmez, yukarı çıkar.' },
    { t: 'code', id: 'hatalar-2',
      q: '<p><code>toplam_ve_hatalar(ham_liste)</code> fonksiyonu metin listesini gezsin; sayıya çevrilebilenleri toplasın, çevrilemeyenleri ayrı listede biriktirsin ve <code>(toplam, hatalilar)</code> demeti döndürsün. Örnek: <code>["900.0", "yok", "100"]</code> → <code>(1000.0, ["yok"])</code></p>',
      start: 'def toplam_ve_hatalar(ham_liste):\n    toplam = 0.0\n    hatalilar = []\n    for ham in ham_liste:\n        pass\n    return toplam, hatalilar\n',
      sol: 'def toplam_ve_hatalar(ham_liste):\n    toplam = 0.0\n    hatalilar = []\n    for ham in ham_liste:\n        try:\n            toplam += float(ham)\n        except ValueError:\n            hatalilar.append(ham)\n    return toplam, hatalilar\n',
      tests: 'assert toplam_ve_hatalar(["900.0", "yok", "100"]) == (1000.0, ["yok"]), "toplam 1000.0, hatalı [yok] olmalı"\nassert toplam_ve_hatalar(["1", "2", "3"]) == (6.0, []), "hepsi geçerliyse hatalı liste boş"\nassert toplam_ve_hatalar(["a", "", "45,5"]) == (0.0, ["a", "", "45,5"]), "virgüllü sayı da geçersizdir"\nassert toplam_ve_hatalar([]) == (0.0, []), "boş liste için (0.0, [])"\n',
      hints: ['try/except döngünün içinde olmalı ki bir hata diğer elemanları engellemesin.', 'except ValueError: hatalilar.append(ham)'],
      why: 'Hata döngü içinde yakalandığı için tek bozuk kayıt tüm işi durdurmaz; bozuklar raporlanır. "45,5" Python için geçersizdir çünkü ondalık ayırıcı noktadır.' },
    { t: 'mc', q: '<code>int("12.5")</code> hangi hatayı fırlatır?',
      o: ['TypeError', 'ValueError', 'SyntaxError', 'Hata vermez, 12 döner'], a: 1,
      why: 'Argümanın türü doğrudur (metin) ama değeri tam sayı biçiminde değildir; bu ValueError\'dır. TypeError tür yanlış olduğunda (int([1])) çıkar.' },
    { t: 'code', id: 'hatalar-3',
      q: '<p>Anadolu Bank havale kuralı: <code>havale(bakiye, tutar)</code> fonksiyonu tutar <b>0 veya negatifse</b> <code>ValueError("tutar pozitif olmalı")</code>, tutar <b>bakiyeden büyükse</b> <code>ValueError("yetersiz bakiye")</code> fırlatsın; aksi halde yeni bakiyeyi döndürsün. Mesajlar tam olarak böyle olsun.</p>',
      start: 'def havale(bakiye, tutar):\n    pass\n',
      sol: 'def havale(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if tutar > bakiye:\n        raise ValueError("yetersiz bakiye")\n    return bakiye - tutar\n',
      tests: 'assert havale(1000, 300) == 700, "1000 - 300 = 700 dönmeli"\nassert havale(500, 500) == 0, "bakiyenin tamamı gönderilebilmeli"\nfor kotu, mesaj in [(0, "tutar pozitif olmalı"), (-5, "tutar pozitif olmalı"), (5000, "yetersiz bakiye")]:\n    try:\n        havale(1000, kotu)\n    except ValueError as e:\n        assert str(e) == mesaj, f"tutar={kotu} için mesaj \'{mesaj}\' olmalı, gelen: {e}"\n    else:\n        raise AssertionError(f"tutar={kotu} için ValueError fırlatılmalı")\n',
      hints: ['raise ValueError("...") ile fırlat.', 'Önce pozitiflik, sonra bakiye kontrolü.'],
      why: 'Geçersiz girdide sessizce yanlış sonuç dönmek yerine açık hata fırlatılır; çağıran taraf except ile yakalayıp kullanıcıya gösterir.' },
    { t: 'mc', q: 'Aşağıdaki bloklardan hangisi <b>hata olsa da olmasa da</b> her zaman çalışır?',
      o: ['else', 'except', 'finally', 'try'], a: 2,
      why: 'finally her durumda, hatta except içinde return olsa bile çalışır; kaynak temizliği için kullanılır. else yalnızca try hatasız bittiğinde, except yalnızca hata olduğunda çalışır.' },
    { t: 'code', id: 'hatalar-4',
      q: '<p><code>dosya_satir_sayisi(yol)</code> fonksiyonu dosyadaki satır sayısını döndürsün; dosya yoksa (<code>FileNotFoundError</code>) <code>-1</code> döndürsün. Her iki durumda da fonksiyon sonunda <code>"kontrol edildi: &lt;yol&gt;"</code> yazdırılsın (finally kullan).</p>',
      start: 'def dosya_satir_sayisi(yol):\n    try:\n        pass\n    except FileNotFoundError:\n        pass\n    finally:\n        pass\n',
      sol: 'def dosya_satir_sayisi(yol):\n    try:\n        with open(yol, encoding="utf-8") as f:\n            return sum(1 for _ in f)\n    except FileNotFoundError:\n        return -1\n    finally:\n        print(f"kontrol edildi: {yol}")\n',
      tests: 'import io, contextlib\nwith open("satirlar.txt", "w", encoding="utf-8") as f:\n    f.write("a\\nb\\nc\\n")\nbuf = io.StringIO()\nwith contextlib.redirect_stdout(buf):\n    r1 = dosya_satir_sayisi("satirlar.txt")\n    r2 = dosya_satir_sayisi("olmayan_dosya.txt")\nassert r1 == 3, "3 satırlık dosya için 3 dönmeli"\nassert r2 == -1, "olmayan dosya için -1 dönmeli"\ncikti = buf.getvalue()\nassert "kontrol edildi: satirlar.txt" in cikti, "var olan dosya için finally mesajı yazılmalı"\nassert "kontrol edildi: olmayan_dosya.txt" in cikti, "olmayan dosya için de finally mesajı yazılmalı"\n',
      hints: ['try içinde dosyayı with ile aç ve satırları say.', 'except FileNotFoundError: return -1', 'finally içindeki print, return olsa bile çalışır.'],
      why: 'finally bloğu her iki yoldan çıkışta da çalışır; return bile onu atlatamaz. Bu yüzden "iş bitti" logu için ideal yerdir.' },
    { t: 'mc', q: '<code>except:</code> (çıplak except) yazmak neden önerilmez?',
      o: ['Python 3\'te geçersizdir', 'Yalnızca bir hata türü yakalar', 'Yazım hataları ve Ctrl+C dahil her şeyi yutar, sorunu gizler', 'try bloğunu yavaşlatır'], a: 2,
      why: 'Çıplak except tüm istisnaları (KeyboardInterrupt ve SystemExit dahil) yakalar; gerçek hata görünmez ve program yanlış veriyle devam eder. Sözdizimi olarak geçerlidir ve hız etkisi yoktur.' }
  ],
  faq: [
    { q: 'Hata yakalayınca program yavaşlar mı?', a: 'try bloğuna girmenin maliyeti neredeyse sıfırdır; maliyet hata fırlatıldığında oluşur. Hata nadir olduğu sürece EAFP tarzı (önce dene, sonra yakala) genellikle önceden kontrol etmekten hızlıdır.' },
    { q: 'except Exception as e yazmak çıplak except ile aynı mı?', a: 'Neredeyse. Exception, KeyboardInterrupt ve SystemExit\'i kapsamaz, o kadar. Yine de çok geniştir; yalnızca en dış katmanda (ana program) loglamak için kullan ve mutlaka e\'yi kaydet.' },
    { q: 'assert ile raise farkı nedir?', a: 'assert geliştirme sırasında "bu asla olmamalı" kontrolüdür ve -O bayrağıyla kapatılabilir; kullanıcı girdisi doğrulaması için uygun değildir. Girdi kontrolü için raise ValueError kullan.' }
  ],
  mistakes: [
    { bad: 'try:\n    tutar = float(ham)\nexcept:\n    tutar = 0', good: 'try:\n    tutar = float(ham)\nexcept ValueError:\n    tutar = 0', why: 'Çıplak except her hatayı yutar; yalnızca beklediğin türü yakala.' },
    { bad: 'def bol(a, b):\n    if b == 0:\n        return "hata"\n    return a / b', good: 'def bol(a, b):\n    if b == 0:\n        raise ZeroDivisionError("bölen sıfır olamaz")\n    return a / b', why: 'Hata yerine metin döndürmek çağıran tarafta tür karmaşasına yol açar; istisna fırlat.' },
    { bad: 'for ham in liste:\n    toplam += float(ham)   # ilk hatada tüm döngü durur', good: 'for ham in liste:\n    try:\n        toplam += float(ham)\n    except ValueError:\n        hatali.append(ham)', why: 'Toplu işte hata döngü içinde yakalanmalı ki tek bozuk kayıt işi durdurmasın.' },
    { bad: 'try:\n    f = open(yol)\n    veri = f.read()\n    islem(veri)\nexcept FileNotFoundError:\n    ...', good: 'try:\n    f = open(yol)\nexcept FileNotFoundError:\n    ...\nelse:\n    with f:\n        islem(f.read())', why: 'try bloğu küçük tutulmalı; yalnızca hata beklenen satır içinde olsun, gerisi else\'e.' }
  ]
},
/* ───────────────────────── 8. PROJE: ANADOLU MARKET SİPARİŞ RAPORU ───────────────────────── */
{
  id: 'proje-temel',
  lv: 'temel',
  mod: 'Bitirme',
  min: 45,
  title: 'Bitirme projesi: Anadolu Market sipariş raporu',
  sum: 'Temel seviyede öğrendiğin her şeyi birleştir: sipariş listesinden toplam ciro, şehre göre toplam, en çok satan ürün ve biçimli rapor metni üreten, dosyaya yazan küçük bir program.',
  goals: [
    'Bir iş isteğini küçük, test edilebilir fonksiyonlara bölebilirim.',
    'Liste ve sözlüklerle toplam, gruplama ve en büyük bulma hesaplarını yapabilirim.',
    'Hesap fonksiyonlarını sunum (rapor metni) fonksiyonundan ayırabilirim.',
    'Bozuk kayıtları hata yakalayarak atlayıp raporda sayısını gösterebilirim.',
    'Raporu dosyaya yazıp geri okuyarak doğrulayabilirim.'
  ],
  body: `
<h2>İş isteği</h2>
<p>Anadolu Market operasyon müdürü senden şunu istiyor: "Her sabah dünkü siparişlerin özetini istiyorum: toplam ciro, hangi şehre ne kadar sattık, en çok satan ürün hangisi. Düz metin olsun, e-postaya yapıştırayım." Elinde sipariş kayıtları var; bu derste isteği adım adım çalışan bir programa çevireceksin. Alıştırmalar projenin parçalarıdır: her biri bir fonksiyon, sonuncusu hepsini birleştirir.</p>

<h2>Veri</h2>
<p>Her sipariş bir sözlük: <code>id</code>, <code>musteri</code>, <code>sehir</code>, <code>urun</code>, <code>adet</code>, <code>birim_fiyat</code>. Sipariş tutarı <code>adet × birim_fiyat</code>. Veriyi kodun içinde küçük bir liste olarak tutuyoruz; gerçekte CSV'den gelir, onu da 6. derste öğrendin.</p>
<pre class="py">SIPARISLER = [
    {"id": 1001, "musteri": "Ayşe", "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},
    {"id": 1002, "musteri": "Mehmet", "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},
    {"id": 1003, "musteri": "Elif", "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},
    {"id": 1004, "musteri": "Can", "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},
    {"id": 1005, "musteri": "Zeynep", "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},
    {"id": 1006, "musteri": "Burak", "sehir": "Ankara", "urun": "Monitör", "adet": 1, "birim_fiyat": 4599.00},
]
print(len(SIPARISLER), "sipariş")
print(SIPARISLER[0])</pre>

<h2>Adım 1: Planı fonksiyonlara böl</h2>
<p>Büyük işi tek seferde yazmaya kalkma. Önce isteği parçala; her parça tek iş yapan, girdi alıp çıktı döndüren bir fonksiyon olsun:</p>
<div class="steps-list"><ol>
<li><code>siparis_tutari(siparis)</code>: tek siparişin tutarı.</li>
<li><code>toplam_ciro(siparisler)</code>: tüm tutarların toplamı.</li>
<li><code>sehre_gore_ciro(siparisler)</code>: şehir → toplam tutar sözlüğü.</li>
<li><code>en_cok_satan(siparisler)</code>: adet toplamı en yüksek ürün ve adedi.</li>
<li><code>rapor_metni(siparisler)</code>: yukarıdakileri çağırıp biçimli metin üretir.</li>
<li><code>raporu_kaydet(metin, yol)</code>: metni dosyaya yazar.</li>
</ol></div>
<p>Hesap fonksiyonları (1-4) <b>saf</b>: yalnızca veri alır, sonuç döndürür, hiçbir şey yazdırmaz. Sunum (5) ve dosya (6) ayrıdır. Böylece her hesabı tek başına test edebilir, raporun biçimini değiştirirken hesaba dokunmazsın.</p>

<h2>Adım 2: Tek siparişin tutarı ve toplam ciro</h2>
<pre class="py">SIPARISLER = [
    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},
    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},
    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},
]

def siparis_tutari(siparis):
    """adet × birim fiyat, 2 ondalığa yuvarlanmış."""
    return round(siparis["adet"] * siparis["birim_fiyat"], 2)

def toplam_ciro(siparisler):
    toplam = 0.0
    for s in siparisler:
        toplam += siparis_tutari(s)
    return round(toplam, 2)

print(siparis_tutari(SIPARISLER[0]))
print(toplam_ciro(SIPARISLER))</pre>
<p>Küçük fonksiyon büyüğünün içinde kullanılır; tutar hesabı değişirse (örneğin indirim eklenirse) yalnız <code>siparis_tutari</code> değişir.</p>

<h2>Adım 3: Şehre göre gruplama</h2>
<p>Döngüler dersindeki sayaç kalıbının toplama versiyonu: anahtar şehir, değer biriken tutar.</p>
<pre class="py">def sehre_gore_ciro(siparisler):
    ciro = {}
    for s in siparisler:
        sehir = s["sehir"]
        ciro[sehir] = round(ciro.get(sehir, 0.0) + siparis_tutari(s), 2)
    return ciro

print(sehre_gore_ciro(SIPARISLER))</pre>

<h2>Adım 4: En çok satan ürün</h2>
<p>Önce ürün → toplam adet sözlüğü kur, sonra en büyüğü bul. <code>max</code> fonksiyonuna <code>key</code> vererek sözlüğü değerine göre tarayabilirsin.</p>
<pre class="py">def en_cok_satan(siparisler):
    adetler = {}
    for s in siparisler:
        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]
    if not adetler:
        return None, 0
    urun = max(adetler, key=adetler.get)
    return urun, adetler[urun]

print(en_cok_satan(SIPARISLER))</pre>
<div class="note"><b>Boş veri</b>Hiç sipariş yoksa <code>max</code> boş sözlükte hata verir. Erken dönüşle <code>(None, 0)</code> döndürmek, raporun "Dün sipariş olmadı" diyebilmesini sağlar. Her hesap fonksiyonunda "boş gelirse ne olur?" diye sor.</div>

<h2>Adım 5: Bozuk kayıtlara dayanıklılık</h2>
<p>Gerçek veride <code>adet</code> metin olarak gelebilir, <code>birim_fiyat</code> eksik olabilir. Hesabı çökertmek yerine bozuk kayıtları ayır ve raporda sayısını göster. Temizleme işini de ayrı bir fonksiyona ver:</p>
<pre class="py">def temizle(ham_siparisler):
    """Geçerli siparişleri ve atlanan kayıt sayısını döndürür."""
    temiz, atlanan = [], 0
    for s in ham_siparisler:
        try:
            kayit = dict(s)
            kayit["adet"] = int(s["adet"])
            kayit["birim_fiyat"] = float(s["birim_fiyat"])
            if kayit["adet"] &lt;= 0:
                raise ValueError("adet pozitif olmalı")
            temiz.append(kayit)
        except (KeyError, ValueError, TypeError):
            atlanan += 1
    return temiz, atlanan

ham = [
    {"id": 1, "sehir": "Ankara", "urun": "Mouse", "adet": "3", "birim_fiyat": "349.5"},
    {"id": 2, "sehir": "İzmir", "urun": "Klavye", "adet": "yok", "birim_fiyat": 1249},
    {"id": 3, "sehir": "Bursa", "urun": "Kulaklık", "adet": 1},
]
temiz, atlanan = temizle(ham)
print(len(temiz), "geçerli,", atlanan, "atlandı")
print(temiz[0])</pre>

<h2>Adım 6: Rapor metni ve dosya</h2>
<p>Metin biçimlendirme dersindeki hizalama ve join kalıbı. Rapor fonksiyonu hesap yapmaz; hesap fonksiyonlarını çağırır ve satırları dizer.</p>
<pre class="py">from datetime import date

def rapor_metni(siparisler, tarih, atlanan=0):
    toplam = toplam_ciro(siparisler)
    sehirler = sehre_gore_ciro(siparisler)
    urun, adet = en_cok_satan(siparisler)
    satirlar = [
        f"ANADOLU MARKET GÜNLÜK RAPOR - {tarih:%d.%m.%Y}",
        "=" * 40,
        f"Sipariş sayısı : {len(siparisler)}",
        f"Toplam ciro    : {toplam:,.2f} TL",
        "",
        "Şehre göre ciro",
    ]
    for sehir, ciro in sorted(sehirler.items(), key=lambda x: x[1], reverse=True):
        satirlar.append(f"  {sehir:&lt;12}{ciro:&gt;14,.2f} TL")
    satirlar.append("")
    satirlar.append(f"En çok satan   : {urun} ({adet} adet)")
    if atlanan:
        satirlar.append(f"Atlanan kayıt  : {atlanan}")
    return "\\n".join(satirlar)

rapor = rapor_metni(SIPARISLER, date(2024, 3, 5), atlanan=1)
print(rapor)

with open("gunluk_rapor.txt", "w", encoding="utf-8") as f:
    f.write(rapor + "\\n")
print("\\nDosyadan geri okundu, satır sayısı:", len(open("gunluk_rapor.txt", encoding="utf-8").read().splitlines()))</pre>

<h2>Kontrol listesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Neden</th></tr>
<tr><td>Her fonksiyon tek iş mi yapıyor?</td><td>Test ve değişiklik kolaylığı</td></tr>
<tr><td>Hesap fonksiyonları print ediyor mu?</td><td>Etmemeli; sunumdan ayrı kalmalı</td></tr>
<tr><td>Boş liste verince çöküyor mu?</td><td>Sipariş olmayan gün de rapor ister</td></tr>
<tr><td>Bozuk kayıt tüm raporu durduruyor mu?</td><td>Durdurmamalı; sayılıp raporlanmalı</td></tr>
<tr><td>Para 2 ondalıkla ve binlik ayırıcıyla mı?</td><td>Müdür Excel'den alışkın</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bu program gerçekte nasıl çalışır?</h3>
<p>Orta seviyede aynı projeyi CSV modülüyle dosyadan okuyacak, <code>dataclass</code> ile siparişi tip güvenli bir nesneye çevirecek, <code>collections.Counter</code> ve <code>defaultdict</code> ile gruplama kodunu yarıya indirecek, <code>unittest</code> ile her fonksiyona test yazacaksın. İleri seviyede ise <code>pandas</code> ile <code>groupby("sehir")["tutar"].sum()</code> tek satır olacak. Temel bu: parçala, saf tut, biçimi ayır.</p>
<h3>Zamanlama</h3>
<p>"Her sabah" isteği kodun içine girmez; işletim sisteminin zamanlayıcısı (cron, Görev Zamanlayıcı) betiği 07:00'de çalıştırır. Betik <code>if __name__ == "__main__":</code> bloğunda veriyi okur, raporu üretir, dosyaya yazar ve çıkar. Betiğin kendisi "ne zaman" sorusunu bilmez; bu, sorumlulukları ayırmanın bir başka örneğidir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'proje-temel-1',
      q: '<p><b>Adım 1.</b> <code>siparis_tutari(siparis)</code> fonksiyonu sözlükteki <code>adet</code> × <code>birim_fiyat</code> çarpımını <b>2 ondalığa yuvarlayıp</b> döndürsün. Ardından <code>toplam_ciro(siparisler)</code> tüm siparişlerin tutar toplamını (yine 2 ondalık) döndürsün; boş listede <code>0.0</code>.</p>',
      start: 'def siparis_tutari(siparis):\n    pass\n\ndef toplam_ciro(siparisler):\n    pass\n',
      sol: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    toplam = 0.0\n    for s in siparisler:\n        toplam += siparis_tutari(s)\n    return round(toplam, 2)\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n]\nassert siparis_tutari(S[0]) == 1799.8, "2 x 899.90 = 1799.8 olmalı"\nassert siparis_tutari(S[2]) == 1048.5, "3 x 349.50 = 1048.5 olmalı"\nassert toplam_ciro(S) == 4097.3, "toplam 4097.3 olmalı"\nassert toplam_ciro([]) == 0.0, "boş liste için 0.0"\n',
      hints: ['round(adet * fiyat, 2)', 'toplam_ciro içinde siparis_tutari fonksiyonunu çağır; hesabı tekrar yazma.'],
      why: 'Küçük fonksiyon büyüğün içinde kullanılır; tutar formülü tek yerde yaşar.' },
    { t: 'code', id: 'proje-temel-2',
      q: '<p><b>Adım 2.</b> <code>sehre_gore_ciro(siparisler)</code> fonksiyonu her şehrin toplam sipariş tutarını (adet × birim_fiyat, 2 ondalık) sözlük olarak döndürsün. Örnek: <code>{"Ankara": 2848.3, "İzmir": 1249.0}</code>. Boş liste için boş sözlük.</p>',
      start: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    pass\n    return ciro\n',
      sol: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        sehir = s["sehir"]\n        ciro[sehir] = round(ciro.get(sehir, 0.0) + siparis_tutari(s), 2)\n    return ciro\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n]\nr = sehre_gore_ciro(S)\nassert set(r) == {"Ankara", "İzmir", "İstanbul"}, "üç şehir olmalı"\nassert abs(r["Ankara"] - 2848.3) < 1e-6, "Ankara 1799.8 + 1048.5 = 2848.3 olmalı"\nassert abs(r["İzmir"] - 1249.0) < 1e-6, "İzmir 1249.0 olmalı"\nassert abs(r["İstanbul"] - 899.9) < 1e-6, "İstanbul 899.9 olmalı"\nassert sehre_gore_ciro([]) == {}, "boş liste için boş sözlük"\n',
      hints: ['ciro.get(sehir, 0.0) ile mevcut toplamı al, tutarı ekle, geri yaz.', 'Her adımda round(..., 2) kayan nokta kalıntılarını temizler.'],
      why: 'Sözlükle gruplama kalıbı: anahtar şehir, değer biriken tutar. collections.defaultdict ile daha da kısalır, orta seviyede göreceksin.' },
    { t: 'code', id: 'proje-temel-3',
      q: '<p><b>Adım 3.</b> <code>en_cok_satan(siparisler)</code> fonksiyonu toplam <b>adedi</b> en yüksek ürünün adını ve toplam adedini <code>(urun, adet)</code> demeti olarak döndürsün. Boş listede <code>(None, 0)</code>.</p>',
      start: 'def en_cok_satan(siparisler):\n    adetler = {}\n    pass\n',
      sol: 'def en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n    {"id": 1005, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},\n]\nassert en_cok_satan(S) == ("Mouse", 5), "Mouse 3 + 2 = 5 adetle ilk olmalı"\nassert en_cok_satan(S[:2]) == ("Kulaklık", 2), "ilk iki siparişte Kulaklık 2 adet"\nassert en_cok_satan([]) == (None, 0), "boş liste için (None, 0)"\n',
      hints: ['Önce ürün -> toplam adet sözlüğü kur.', 'max(adetler, key=adetler.get) en yüksek değerli anahtarı verir.', 'Boş kontrolünü max çağrısından önce yap.'],
      why: 'Gruplama + en büyüğü bulma. max\'a key vermek, anahtarları değerlerine göre karşılaştırmasını sağlar.' },
    { t: 'code', id: 'proje-temel-4',
      q: '<p><b>Adım 4.</b> <code>temizle(ham)</code> fonksiyonu ham kayıt listesini gezsin; her kaydın kopyasında <code>adet</code>\'i <code>int</code>, <code>birim_fiyat</code>\'ı <code>float</code> yapsın. Alan eksikse (<code>KeyError</code>), çevrilemezse (<code>ValueError</code>, <code>TypeError</code>) ya da adet 0 veya negatifse kaydı atlasın. <code>(temiz_liste, atlanan_sayisi)</code> döndürsün.</p>',
      start: 'def temizle(ham):\n    temiz = []\n    atlanan = 0\n    for s in ham:\n        try:\n            pass\n        except (KeyError, ValueError, TypeError):\n            atlanan += 1\n    return temiz, atlanan\n',
      sol: 'def temizle(ham):\n    temiz = []\n    atlanan = 0\n    for s in ham:\n        try:\n            kayit = dict(s)\n            kayit["adet"] = int(s["adet"])\n            kayit["birim_fiyat"] = float(s["birim_fiyat"])\n            if kayit["adet"] <= 0:\n                raise ValueError("adet pozitif olmalı")\n            temiz.append(kayit)\n        except (KeyError, ValueError, TypeError):\n            atlanan += 1\n    return temiz, atlanan\n',
      tests: 'ham = [\n    {"id": 1, "sehir": "Ankara", "urun": "Mouse", "adet": "3", "birim_fiyat": "349.5"},\n    {"id": 2, "sehir": "İzmir", "urun": "Klavye", "adet": "yok", "birim_fiyat": 1249},\n    {"id": 3, "sehir": "Bursa", "urun": "Kulaklık", "adet": 1},\n    {"id": 4, "sehir": "Ankara", "urun": "Monitör", "adet": 0, "birim_fiyat": 4599.0},\n    {"id": 5, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": None},\n]\ntemiz, atlanan = temizle(ham)\nassert atlanan == 4, "4 kayıt atlanmalı (metin adet, eksik fiyat, sıfır adet, None fiyat)"\nassert len(temiz) == 1 and temiz[0]["id"] == 1, "yalnız 1 numaralı kayıt kalmalı"\nassert temiz[0]["adet"] == 3 and isinstance(temiz[0]["adet"], int), "adet int 3 olmalı"\nassert temiz[0]["birim_fiyat"] == 349.5 and isinstance(temiz[0]["birim_fiyat"], float), "birim_fiyat float 349.5 olmalı"\nassert ham[0]["adet"] == "3", "orijinal kayıt değiştirilmemeli (kopya üzerinde çalış)"\nassert temizle([]) == ([], 0), "boş liste için ([], 0)"\n',
      hints: ['dict(s) ile kopya al; orijinali değiştirme.', 'int ve float dönüşümleri try içinde; adet <= 0 için raise ValueError.', 'float(None) TypeError fırlatır; demet içindeki üç tür bunu da yakalar.'],
      why: 'Hata döngü içinde yakalanır, bozuk kayıt sayılır ve iş devam eder. Kopya üzerinde çalışmak çağıranın verisini bozmaz.' },
    { t: 'code', id: 'proje-temel-5',
      q: '<p><b>Adım 5.</b> Verilen yardımcı fonksiyonları kullanarak <code>rapor_metni(siparisler)</code> fonksiyonunu yaz. Tam olarak şu satırları <code>"\\n"</code> ile birleştirip döndürsün:</p><ol><li><code>ANADOLU MARKET GÜNLÜK RAPOR</code></li><li><code>Sipariş sayısı: N</code></li><li><code>Toplam ciro: X TL</code> (X binlik ayırıcılı, 2 ondalık)</li><li>Ciroya göre <b>büyükten küçüğe</b> sıralı her şehir için: şehir adı 10 karakter sola yaslı, ardından ciro 12 karakter sağa yaslı binlik ayırıcılı 2 ondalık, ardından <code> TL</code></li><li><code>En çok satan: URUN (ADET adet)</code></li></ol>',
      start: 'def siparis_tutari(s):\n    return round(s["adet"] * s["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        ciro[s["sehir"]] = round(ciro.get(s["sehir"], 0.0) + siparis_tutari(s), 2)\n    return ciro\n\ndef en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n\ndef rapor_metni(siparisler):\n    satirlar = ["ANADOLU MARKET GÜNLÜK RAPOR"]\n    # satırları ekle\n    return "\\n".join(satirlar)\n',
      sol: 'def siparis_tutari(s):\n    return round(s["adet"] * s["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        ciro[s["sehir"]] = round(ciro.get(s["sehir"], 0.0) + siparis_tutari(s), 2)\n    return ciro\n\ndef en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n\ndef rapor_metni(siparisler):\n    satirlar = ["ANADOLU MARKET GÜNLÜK RAPOR"]\n    satirlar.append(f"Sipariş sayısı: {len(siparisler)}")\n    satirlar.append(f"Toplam ciro: {toplam_ciro(siparisler):,.2f} TL")\n    sehirler = sehre_gore_ciro(siparisler)\n    for sehir, ciro in sorted(sehirler.items(), key=lambda x: x[1], reverse=True):\n        satirlar.append(f"{sehir:<10}{ciro:>12,.2f} TL")\n    urun, adet = en_cok_satan(siparisler)\n    satirlar.append(f"En çok satan: {urun} ({adet} adet)")\n    return "\\n".join(satirlar)\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n    {"id": 1005, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},\n    {"id": 1006, "sehir": "Ankara", "urun": "Monitör", "adet": 1, "birim_fiyat": 4599.00},\n]\nbeklenen = "\\n".join([\n    "ANADOLU MARKET GÜNLÜK RAPOR",\n    "Sipariş sayısı: 6",\n    "Toplam ciro: 9,595.20 TL",\n    "Ankara      7,447.30 TL",\n    "İzmir       1,948.00 TL",\n    "İstanbul      899.90 TL",\n    "En çok satan: Mouse (5 adet)",\n])\ngelen = rapor_metni(S)\nassert gelen == beklenen, "rapor metni beklenenle aynı olmalı:\\n" + beklenen + "\\n--- gelen ---\\n" + gelen\nbos = rapor_metni([])\nassert "Sipariş sayısı: 0" in bos and "Toplam ciro: 0.00 TL" in bos, "boş liste için 0 sipariş ve 0.00 TL"\n',
      hints: ['Her satırı f-string ile satirlar listesine ekle.', 'sorted(sehirler.items(), key=lambda x: x[1], reverse=True) ciroya göre büyükten küçüğe sıralar.', 'Şehir satırı: f"{sehir:<10}{ciro:>12,.2f} TL"'],
      why: 'Rapor fonksiyonu hesap yapmaz; hazır fonksiyonları çağırıp satırları dizer. Sıralama için sorted ve key kullanılır; biçimleme f-string belirteçleriyle yapılır.' },
    { t: 'code', id: 'proje-temel-6',
      q: '<p><b>Adım 6.</b> <code>raporu_kaydet(metin, yol)</code> fonksiyonu metni dosyaya (utf-8, <code>"w"</code>) yazsın, sonuna bir satır sonu eklesin ve <b>yazılan satır sayısını</b> döndürsün. Satır sayısını dosyayı <b>geri okuyarak</b> hesapla.</p>',
      start: 'def raporu_kaydet(metin, yol):\n    pass\n',
      sol: 'def raporu_kaydet(metin, yol):\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write(metin + "\\n")\n    with open(yol, encoding="utf-8") as f:\n        return sum(1 for _ in f)\n',
      tests: 'rapor = "ANADOLU MARKET GÜNLÜK RAPOR\\nSipariş sayısı: 6\\nToplam ciro: 9,595.20 TL"\nn = raporu_kaydet(rapor, "proje_rapor.txt")\nassert n == 3, "3 satırlık rapor için 3 dönmeli"\nwith open("proje_rapor.txt", encoding="utf-8") as f:\n    icerik = f.read()\nassert icerik == rapor + "\\n", "dosya içeriği metin + satır sonu olmalı"\nassert raporu_kaydet("tek satır", "proje_rapor.txt") == 1, "ikinci çağrı üzerine yazmalı ve 1 dönmeli"\n',
      hints: ['İlk with ile yaz, ikinci with ile oku.', 'Satır saymak için for satir in f döngüsü ya da sum(1 for _ in f).'],
      why: 'Yazdığını geri okuyup doğrulamak, dosya işlemlerinde en basit sağlamadır. Yazma ve okuma ayrı with bloklarında yapılır.' }
  ],
  faq: [
    { q: 'Neden tek bir büyük fonksiyon yazmadık?', a: 'Tek fonksiyon çalışır ama bir hata çıktığında nerede olduğunu bulmak, yalnızca şehir hesabını test etmek ya da rapor biçimini değiştirmek zorlaşır. Küçük fonksiyonlar lego parçası gibidir; orta seviyedeki testler de bu parçalara yazılır.' },
    { q: 'Veri gerçekte nereden gelir?', a: 'Genellikle CSV dosyası, veritabanı ya da bir API. Temel seviyede CSV okumayı öğrendin; orta seviyede csv modülü, SQLite ve JSON ile aynı projeyi gerçek kaynaklara bağlayacaksın.' },
    { q: 'Kayan nokta toplamları neden round ile temizliyoruz?', a: '0.1 + 0.2 gibi toplamlar ikili sistemde tam temsil edilemez ve 0.30000000000000004 çıkabilir. Her adımda round(..., 2) kuruş hassasiyetini korur. Bankacılık ölçeğinde Decimal kullanılır.' }
  ],
  mistakes: [
    { bad: 'def toplam_ciro(siparisler):\n    for s in siparisler:\n        print(s["adet"] * s["birim_fiyat"])', good: 'def toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)', why: 'Hesap fonksiyonu print etmemeli, değer döndürmeli; raporu başka fonksiyon yazar.' },
    { bad: 'urun = max(adetler)', good: 'urun = max(adetler, key=adetler.get)', why: 'key olmadan max anahtarları (ürün adlarını) alfabetik karşılaştırır, değerleri değil.' },
    { bad: 'for s in ham:\n    s["adet"] = int(s["adet"])', good: 'for s in ham:\n    kayit = dict(s)\n    kayit["adet"] = int(s["adet"])', why: 'Gelen sözlüğü yerinde değiştirmek çağıranın verisini bozar; kopya üzerinde çalış.' },
    { bad: 'sorted(sehirler.items(), reverse=True)', good: 'sorted(sehirler.items(), key=lambda x: x[1], reverse=True)', why: 'key verilmezse demetler ilk elemana (şehir adı) göre sıralanır, ciroya göre değil.' }
  ]
}
);
})(window);
