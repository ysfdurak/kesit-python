LESSON = {
'id': 'dosya-ileri',
'lv': 'orta',
'mod': 'Standart Kütüphane',
'min': 45,
'title': 'İleri dosya işlemleri: ikili mod, akışlar, arşiv ve atomik yazma',
'sum': 'Metin ve ikili modu ayırır; bytes/bytearray, seek/tell, OSError alt sınıfları, standart akışlar, pathlib glob, shutil, zipfile/tarfile, tempfile ve atomik yazmayla gerçek dosya işlerini sağlam yaparsın.',
'goals': [
    'Metin modu ile ikili modu (rb/wb) ayırır, bytes ve bytearray ile bayt düzeyinde çalışabilirim.',
    'read, readline, seek ve tell ile dosya içinde gezinir, büyük dosyayı parça parça okuyabilirim.',
    'OSError alt sınıflarını ve errno kodlarını kullanarak dosya hatalarını anlamlı mesajlara çevirebilirim.',
    'pathlib (glob, rglob, with_suffix), shutil, zipfile, tarfile ve tempfile ile klasörleri toplu işleyebilirim.',
    'Geçici dosya + os.replace ile yarım kalmayan (atomik) yazma yapıp stdout/stderr ayrımını doğru kullanabilirim.',
],
'body': r'''
<h2>Neden önemli?</h2>
<p>Anadolu Market'in gece çalışan işlerini düşün: her mağaza kasası günün satışlarını bir CSV dosyası olarak <code>gelen/2026-10-27/</code> klasörüne bırakıyor, ödeme sistemi ikili (binary) bir dekont arşivi gönderiyor, muhasebe sabah 08.00'de <code>rapor.json</code> dosyasını okuyor. Bu işte üç şey ters gidebilir: yanlış modda açılan dosya Türkçe karakterleri bozar, bir klasördeki 500 dosyadan biri bozuk olduğu için tüm iş durur, ya da program rapor yazarken çöker ve muhasebe yarım bir JSON okur.</p>
<p>Temel düzeydeki <b>Dosya işlemleri</b> dersinde <code>open</code>, <code>with</code>, okuma-yazma modlarını ve pathlib'in ilk adımlarını gördün. Bu ders o temelin üstüne kurumsal düzeyi koyar: bayt düzeyinde çalışma, dosya içinde gezinme, hata türlerini ayırma, standart akışlar, klasörleri toplu işleme, arşivler ve hiçbir zaman yarım kalmayan yazma.</p>

<h2>Metin modu ve ikili mod</h2>
<p>Diskte her şey bayttır (byte). <b>Metin modu</b> (<code>"r"</code>, <code>"w"</code>) baytları senin için bir kodlamayla (encoding) çözer ve <code>str</code> verir; satır sonlarını da işletim sistemine göre çevirir. <b>İkili mod</b> (<code>"rb"</code>, <code>"wb"</code>) hiçbir çeviri yapmaz, ham <code>bytes</code> verir. Resim, PDF, zip, şifreli dosya ya da özet (hash) hesabı için her zaman ikili mod kullanırsın.</p>
<pre class="py">import tempfile, os
with tempfile.TemporaryDirectory() as d:
    yol = os.path.join(d, "sehir.txt")
    with open(yol, "w", encoding="utf-8") as f:
        yazilan = f.write("İzmir\nÇorum\n")
    print("yazılan karakter:", yazilan)
    with open(yol, "rb") as f:
        ham = f.read()
    print(type(ham).__name__, len(ham), "bayt")
    print(ham)
    print(ham.decode("utf-8").splitlines())</pre>
<p>12 karakter yazdın ama dosya 14 bayt: UTF-8'de <code>İ</code> ve <code>Ç</code> ikişer bayt tutar. Metin modunda <code>write</code> yazılan <b>karakter</b> sayısını, ikili modda <b>bayt</b> sayısını döndürür.</p>
<div class="tbl-wrap"><table>
<tr><th>Mod</th><th>Anlamı</th><th>Dosya yoksa</th><th>Dosya varsa</th></tr>
<tr><td><code>r</code> / <code>rb</code></td><td>Oku</td><td>FileNotFoundError</td><td>Baştan okur</td></tr>
<tr><td><code>w</code> / <code>wb</code></td><td>Yaz</td><td>Oluşturur</td><td>İçeriği SİLER</td></tr>
<tr><td><code>a</code> / <code>ab</code></td><td>Sona ekle</td><td>Oluşturur</td><td>Sona yazar</td></tr>
<tr><td><code>x</code> / <code>xb</code></td><td>Yalnız yeni dosya</td><td>Oluşturur</td><td>FileExistsError</td></tr>
<tr><td><code>r+</code> / <code>r+b</code></td><td>Oku ve yaz</td><td>FileNotFoundError</td><td>Silmeden, imlecin olduğu yere yazar</td></tr>
</table></div>
<div class="warn"><b>encoding'i hep açıkça yaz</b>Metin modunda <code>encoding</code> vermezsen Python işletim sisteminin varsayılanını kullanır; Windows'ta bu hâlâ cp1254 olabilir. Kendi makinende çalışan betik sunucuda Türkçe karakterleri bozar. Excel'in ürettiği CSV'lerin başındaki BOM işaretini atmak için <code>encoding="utf-8-sig"</code> kullan.</div>

<h2>bytes ve bytearray: tampon olarak baytlar</h2>
<p><code>bytes</code> değişmez (immutable) bir bayt dizisidir; <code>bytearray</code> ise değiştirilebilir (mutable) kardeşidir. Bir ağ paketini, sabit genişlikli bir banka kaydını ya da parça parça gelen veriyi biriktirirken <code>bytearray</code> bir <b>tampon</b> (buffer) gibi kullanılır: her eklemede yeni nesne üretmez.</p>
<pre class="py">imza = b"PK\x03\x04"           # zip dosyalarının ilk 4 baytı
print(imza[0], imza[:2], len(imza))   # indeks tek bayt -> int verir

tampon = bytearray()
for parca in [b"AB", b"-", b"2026"]:
    tampon.extend(parca)              # yerinde büyür
tampon[0] = ord("X")                  # yerinde değiştir
print(tampon, bytes(tampon))
print("2026".encode("ascii") in tampon)
print(bytes([72, 105]).decode())       # sayılardan bayt</pre>
<p>Dikkat: <code>imza[0]</code> bir <b>tam sayı</b> (80) verir, <code>imza[:2]</code> ise <code>bytes</code>. <code>str</code> ile <code>bytes</code> asla karışmaz: <code>b"abc" == "abc"</code> False'tur, <code>b"abc" + "d"</code> TypeError verir. Geçiş her zaman <code>encode</code> (str → bytes) ve <code>decode</code> (bytes → str) ile yapılır.</p>

<h2>İmleç: read, readline, seek, tell</h2>
<p>Açık bir dosyanın bir <b>imleci</b> (file pointer) vardır. Her okuma imleci ileri taşır. <code>tell()</code> imlecin konumunu, <code>seek(konum, nereden)</code> imleci taşımayı sağlar: <code>nereden</code> 0 = baştan, 1 = bulunduğun yerden, 2 = sondan. İkili modda bunlar bayt cinsindendir; metin modunda <code>seek</code> yalnızca <code>tell</code>'den aldığın değerlerle güvenlidir.</p>
<pre class="py">import io
f = io.BytesIO(b"ID;TUTAR\n101;250\n102;975\n")   # bellek içi ikili dosya
print(f.readline())          # ilk satır (başlık)
print(f.tell())              # 9 bayt okundu
print(f.read(3))             # sonraki 3 bayt
f.seek(0)                    # başa dön
print(len(f.readlines()), "satır")
f.seek(-4, 2)                # sondan 4 bayt geri
print(f.read())</pre>
<p><code>io.BytesIO</code> ve <code>io.StringIO</code> diskte dosya açmadan aynı arayüzü verir; testlerde ve küçük denemelerde çok işine yarar. <code>readlines()</code> tüm dosyayı listeye yükler; büyük dosyada bunun yerine <code>for satir in f</code> kullan.</p>

<h2>Büyük dosyayı parça parça okumak</h2>
<p>5 GB'lık bir işlem arşivinin özetini (hash) hesaplamak ya da satırlarını saymak için dosyayı belleğe almazsın; sabit boyutlu parçalar (chunk) hâlinde okursun. Walrus operatörü (<code>:=</code>) bu döngüyü çok temiz yazar.</p>
<pre class="py">import hashlib, io
dosya = io.BytesIO(b"islem;" * 10_000)
ozet = hashlib.sha256()
parca_sayisi = 0
while parca := dosya.read(8192):     # boş bytes gelince döngü biter
    ozet.update(parca)
    parca_sayisi += 1
print(parca_sayisi, "parça")
print(ozet.hexdigest()[:16])
print(ozet.hexdigest() == hashlib.sha256(b"islem;" * 10_000).hexdigest())</pre>
<p>Bellek kullanımı dosya boyutundan bağımsızdır: hep en fazla 8 KB. Parça sınırına denk gelen bir satır sonu ya da çok baytlı bir harf ikiye bölünebilir; bu yüzden satır mantığı gerekiyorsa son parçayı bir sonrakine taşırsın ya da doğrudan <code>for satir in f</code> kullanırsın (o da içeride tamponlu okur).</p>

<h2>Hata türleri: OSError ailesi ve errno</h2>
<p>Dosya ve işletim sistemiyle ilgili tüm hatalar <code>OSError</code>'dan türer. Her birinin bir <b>errno</b> kodu (işletim sisteminin hata numarası), bir <code>strerror</code> açıklaması ve çoğunlukla bir <code>filename</code> alanı vardır. Python, errno koduna bakarak doğru alt sınıfı kendisi seçer.</p>
<div class="tbl-wrap"><table>
<tr><th>Alt sınıf</th><th>errno</th><th>Ne zaman?</th></tr>
<tr><td><code>FileNotFoundError</code></td><td>ENOENT</td><td>Dosya ya da klasör yok</td></tr>
<tr><td><code>FileExistsError</code></td><td>EEXIST</td><td><code>"x"</code> modu, <code>mkdir</code> var olan klasörde</td></tr>
<tr><td><code>PermissionError</code></td><td>EACCES, EPERM</td><td>Okuma/yazma izni yok, dosya başka programda kilitli (Windows)</td></tr>
<tr><td><code>IsADirectoryError</code></td><td>EISDIR</td><td>Klasörü dosya gibi açmaya çalıştın</td></tr>
<tr><td><code>NotADirectoryError</code></td><td>ENOTDIR</td><td>Dosyayı klasör gibi kullandın</td></tr>
</table></div>
<pre class="py">import errno, tempfile
try:
    open("/yok/boyle/bir/dosya.csv", encoding="utf-8")
except FileNotFoundError as e:
    print(type(e).__name__, e.errno == errno.ENOENT, e.filename)

with tempfile.TemporaryDirectory() as d:
    try:
        open(d, encoding="utf-8")
    except IsADirectoryError as e:
        print("Klasör açılamaz:", e.strerror)
    except PermissionError as e:          # bazı sistemler klasör için bunu verir
        print("İzin hatası:", e.strerror)

hata = OSError(errno.EACCES, "Erişim reddedildi")
print(type(hata).__name__, isinstance(hata, OSError))</pre>
<p>Son satır önemli: <code>OSError(errno.EACCES, ...)</code> yazdığında Python sana doğrudan <code>PermissionError</code> verir. Bu yüzden ya alt sınıfları yakalarsın (okunur), ya da <code>OSError</code> yakalayıp <code>e.errno</code> ile ayırırsın (daha ayrıntılı). Özelden genele sırala: önce <code>FileNotFoundError</code>, en sonda <code>OSError</code>.</p>

<h2>Standart akışlar: stdin, stdout, stderr</h2>
<p>Her programın üç hazır akışı vardır: <code>sys.stdin</code> (girdi), <code>sys.stdout</code> (normal çıktı) ve <code>sys.stderr</code> (hata ve uyarı çıktısı). Bunlar da dosya nesnesidir; <code>write</code>, <code>readline</code>, <code>for satir in sys.stdin</code> ile kullanılır. Kural basit: <b>sonuç stdout'a, gürültü stderr'e</b>. Böylece <code>python rapor.py &gt; rapor.csv</code> diye yönlendiren biri dosyasına uyarı mesajı karışmadan yalnız veriyi alır.</p>
<pre class="py">import sys, io, contextlib
kayitlar = ["Ankara;250", "Bursa;abc", "İzmir;975"]
cikti, hatalar = io.StringIO(), io.StringIO()
with contextlib.redirect_stdout(cikti), contextlib.redirect_stderr(hatalar):
    for k in kayitlar:
        sehir, tutar = k.split(";")
        if tutar.isdigit():
            print(f"{sehir},{tutar}")
        else:
            print(f"UYARI: geçersiz tutar -&gt; {k}", file=sys.stderr)
print("stdout:", cikti.getvalue().splitlines())
print("stderr:", hatalar.getvalue().strip())</pre>
<p><code>redirect_stdout</code>/<code>redirect_stderr</code> akışı geçici olarak başka bir dosya nesnesine çevirir; test yazarken programın ne yazdırdığını yakalamanın standart yolu budur. Gerçek bir komut satırı aracında ise <code>for satir in sys.stdin:</code> ile boru hattından (pipe) gelen veriyi satır satır okursun: <code>cat siparis.csv | python temizle.py</code>.</p>

<h2>pathlib ileri: klasörü sorgulamak</h2>
<pre class="py">from pathlib import Path
import tempfile
with tempfile.TemporaryDirectory() as d:
    kok = Path(d)
    (kok / "2026" / "10").mkdir(parents=True, exist_ok=True)   # ara klasörler de
    for ad in ["2026/10/ankara.csv", "2026/10/izmir.csv", "2026/notlar.txt", "ozet.csv"]:
        (kok / ad).write_text("tarih,tutar\n", encoding="utf-8")
    print(sorted(p.name for p in kok.iterdir()))          # yalnız bir seviye
    print(sorted(p.name for p in kok.glob("*.csv")))      # bu klasörde
    print(sorted(p.relative_to(kok).as_posix() for p in kok.rglob("*.csv")))  # tüm alt klasörler
    p = kok / "2026/10/ankara.csv"
    print(p.stem, p.suffix, p.with_suffix(".json").name, p.parent.name)
    print(p.stat().st_size, "bayt", p.exists(), p.is_file())</pre>
<p><code>glob("*.csv")</code> yalnızca o klasöre, <code>rglob("*.csv")</code> tüm alt ağaca bakar (<code>glob("**/*.csv")</code> ile aynı). <code>iterdir()</code> ve <code>glob</code> sırası işletim sistemine göre değişir; raporda tekrarlanabilir sonuç için <b>her zaman sırala</b>. <code>stem</code> son uzantı hariç ad, <code>suffix</code> son uzantı, <code>suffixes</code> tüm uzantılardır (<code>.tar.gz</code> için iki tane).</p>

<h2>shutil, tempfile, zipfile ve tarfile</h2>
<p><code>shutil</code> dosya düzeyinde üst işlemleri yapar: <code>copy</code> (içerik + izinler), <code>copy2</code> (tarihler de), <code>copytree</code> (klasör ağacı), <code>move</code> (taşı/yeniden adlandır), <code>rmtree</code> (klasörü içiyle sil, geri dönüşü yok). <code>tempfile</code> güvenli geçici dosya ve klasör verir; <code>TemporaryDirectory</code> blok bitince her şeyi temizler.</p>
<pre class="py">import shutil, tempfile, zipfile, tarfile
from pathlib import Path
with tempfile.TemporaryDirectory() as d:
    kok = Path(d)
    kaynak = kok / "rapor"
    kaynak.mkdir()
    (kaynak / "ciro.csv").write_text("sehir,tutar\nAnkara,250\n", encoding="utf-8")
    (kaynak / "not.txt").write_text("gece işi tamam", encoding="utf-8")
    shutil.copy(kaynak / "ciro.csv", kaynak / "ciro_yedek.csv")

    zip_yolu = kok / "rapor.zip"
    with zipfile.ZipFile(zip_yolu, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in sorted(kaynak.rglob("*")):
            z.write(p, arcname=p.relative_to(kaynak).as_posix())
    with zipfile.ZipFile(zip_yolu) as z:
        print(z.namelist())
        print(z.read("ciro.csv").decode("utf-8").splitlines()[1])

    with tarfile.open(kok / "rapor.tar.gz", "w:gz") as t:
        t.add(kaynak, arcname="rapor")
    with tarfile.open(kok / "rapor.tar.gz") as t:
        print(sorted(m.name for m in t.getmembers() if m.isfile()))
    shutil.rmtree(kaynak)
    print(kaynak.exists())</pre>
<div class="warn"><b>Güvenmediğin arşivi körü körüne açma</b>Bir zip/tar içindeki <code>../../etc/passwd</code> gibi adlar hedef klasörün dışına yazabilir (path traversal). <code>tarfile</code> için Python 3.12'de <code>t.extractall(hedef, filter="data")</code> kullan; zip'te her adın <code>Path(hedef, ad).resolve()</code> sonucunun hedefin içinde kaldığını kontrol et.</div>

<h2>Atomik yazma ve dosya kilidi</h2>
<p>Program <code>open("rapor.json", "w")</code> ile dosyayı açtığı anda eski içerik silinir. Yazma sürerken elektrik kesilirse ya da program çökerse geride yarım bir dosya kalır. Çözüm: önce <b>aynı klasörde</b> geçici bir dosyaya yaz, kapat, sonra <code>os.replace</code> ile asıl adın üzerine taşı. <code>os.replace</code> aynı dosya sisteminde <b>atomiktir</b>: okuyan kişi ya eski dosyanın tamamını ya yeni dosyanın tamamını görür, arası yoktur.</p>
<pre class="py">import os, json, tempfile
def atomik_json_yaz(yol, veri):
    klasor = os.path.dirname(os.path.abspath(yol))
    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(veri, f, ensure_ascii=False)
            f.flush()
            os.fsync(f.fileno())        # diske gerçekten yazıldığından emin ol
        os.replace(gecici, yol)          # tek hamlede yer değiştir
    except BaseException:
        os.unlink(gecici)                # hata olursa çöp bırakma
        raise

with tempfile.TemporaryDirectory() as d:
    hedef = os.path.join(d, "rapor.json")
    atomik_json_yaz(hedef, {"sehir": "Ankara", "ciro": 1250})
    atomik_json_yaz(hedef, {"sehir": "İzmir", "ciro": 975})
    print(open(hedef, encoding="utf-8").read(), os.listdir(d))</pre>
<p>Geçici dosyanın hedefle <b>aynı klasörde</b> olması şarttır; <code>/tmp</code> başka bir disk bölümündeyse <code>os.replace</code> atomik olamaz ya da hata verir.</p>
<p>İki süreç aynı dosyaya aynı anda yazıyorsa <b>kilit</b> (lock) gerekir. En taşınabilir basit yöntem bir kilit dosyasıdır: <code>open("is.lock", "x")</code> dosya zaten varsa <code>FileExistsError</code> verir, yani kilidi yalnızca bir süreç alabilir; iş bitince <code>os.remove</code> ile bırakırsın. İşletim sistemi düzeyinde kilit için Linux/macOS'ta <code>fcntl.flock</code>, Windows'ta <code>msvcrt.locking</code>, ikisini birden saran üçüncü parti <code>filelock</code> paketi vardır.</p>
<div class="tip"><b>Kilit dosyası çökmeye dayanıklı olmalı</b>Program kilidi aldıktan sonra çökerse kilit dosyası kalır ve sonraki çalışma sonsuza dek bekler. Kilidi <code>try/finally</code> içinde bırak, kilit dosyasına süreç numarası (PID) ve zaman yaz ki eski kilitleri tanıyabilesin.</div>

<h2>Klasörü toplu işlemek</h2>
<p>Gerçek işlerin çoğu şu kalıptır: bir klasördeki dosyaları bul, her birini oku, bozuk olanı atla ama kaydını tut, sonucu tek bir rapora atomik yaz.</p>
<pre class="py">import csv, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as d:
    kok = Path(d)
    (kok / "ankara.csv").write_text("sehir,tutar\nAnkara,250\nAnkara,100\n", encoding="utf-8")
    (kok / "izmir.csv").write_text("sehir,tutar\nİzmir,975\nİzmir,yok\n", encoding="utf-8")
    toplam, hatali = {}, []
    for yol in sorted(kok.glob("*.csv")):
        with yol.open(encoding="utf-8", newline="") as f:
            for no, satir in enumerate(csv.DictReader(f), start=2):
                try:
                    tutar = float(satir["tutar"])
                except ValueError:
                    hatali.append(f"{yol.name}:{no}")
                    continue
                toplam[satir["sehir"]] = toplam.get(satir["sehir"], 0) + tutar
    print(toplam)
    print("hatalı satırlar:", hatali)</pre>
<div class="note"><b>Gerçek işte</b>Bankalarda ve e-ticarette "gece işi" (batch job) dediğin şey çoğunlukla budur: SFTP'ye düşen dosyaları bulmak, işlemek, işleneni <code>arsiv/</code> klasörüne <code>shutil.move</code> ile taşımak, hatalıyı <code>hatali/</code> klasörüne ayırmak ve sonucu atomik yazmak. Hatalı satırın dosya adı ve satır numarasıyla loglanması, sabah gelen "rakam tutmuyor" e-postasını beş dakikada çözmeni sağlar. Aynı dosyanın iki kez işlenmemesi için işlenmiş dosyaların özetini (sha256) bir listede tutmak da yaygın bir pratiktir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Arabellek, flush ve fsync</h3>
<p><code>write</code> veriyi önce Python'un arabelleğine (buffer), sonra işletim sisteminin önbelleğine yazar; diske ne zaman gideceğine işletim sistemi karar verir. <code>f.flush()</code> Python arabelleğini boşaltır, <code>os.fsync(f.fileno())</code> işletim sisteminden diske yazmasını ister. Para ve sipariş gibi kaybı kabul edilemeyen veride ikisini birlikte kullanırsın; her satırda yapmak ise çok yavaştır, toplu yaparsın.</p>
<h3>os.scandir ve büyük klasörler</h3>
<p>Yüz binlerce dosyalı klasörde <code>os.scandir</code>, dosya türü ve boyut bilgisini tek sistem çağrısıyla getirdiği için <code>os.listdir</code> + <code>os.stat</code>'tan belirgin hızlıdır; pathlib'in <code>iterdir</code>'i de içeride benzer çalışır.</p>
<h3>mmap ve readinto</h3>
<p><code>mmap</code> modülü dosyayı belleğe eşler; çok büyük ikili dosyada rastgele konumlara <code>seek</code> etmeden dilimle erişirsin. <code>f.readinto(bytearray(n))</code> ise var olan bir tampona okur, her okumada yeni nesne üretmez; yüksek hacimli ikili protokollerde kullanılır.</p>
<h3>Kodlama hataları</h3>
<p>Kaynağını bilmediğin metin dosyasında <code>errors="replace"</code> bozuk baytları yerine koyma karakteriyle değiştirir, <code>errors="strict"</code> (varsayılan) hata verir. Veri kaybını görmezden gelmek yerine önce hatayı yakalayıp hangi dosyada olduğunu loglamak daha güvenlidir.</p>
</section>
''',
'ex': [
# ---------------- Isınma
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Bir PDF dekontu <code>open(yol, "rb")</code> ile açıp <code>f.read()</code> çağırdın. Dönen değerin türü nedir?',
 'o': ['str', 'bytes', 'bytearray', 'list[int]'], 'a': 1,
 'why': 'İkili modda okuma her zaman değişmez bytes döndürür. str metin modunda döner; bytearray değiştirilebilir bir tampondur ve read ile değil, bytearray(...) ya da readinto ile elde edilir.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Muhasebe <code>rapor.json</code> dosyasını her an okuyabiliyor. Raporu yazarken çökme olsa bile muhasebenin asla yarım dosya görmemesi için en doğru yöntem hangisidir?',
 'o': ['Dosyayı "a" modunda açıp sona eklemek', 'Geçici dosyaya yazıp os.replace ile taşımak', 'Her satır yazıldıktan sonra f.flush() çağırmak', 'Dosyayı "w" yerine "x" modunda açmak'], 'a': 1,
 'why': 'os.replace aynı dosya sisteminde atomiktir; okuyan ya eski ya yeni dosyanın tamamını görür. flush yalnızca arabelleği boşaltır, çökme anında dosya yine yarım kalır; "a" ve "x" modu da yazma sırasındaki yarım durumu önlemez.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Tek bir <code>except</code> bloğuyla FileNotFoundError, PermissionError ve IsADirectoryError hatalarının üçünü birden yakalamak istiyorsun. Hangisini yazarsın?',
 'o': ['except IOError as e:', 'except OSError as e:', 'except ValueError as e:', 'except FileNotFoundError as e:'], 'a': 1,
 'why': 'Üçü de OSError\'ın alt sınıfıdır. IOError, Python 3\'te OSError\'ın eski adıdır (çalışır ama eski stil); ValueError bu aileden değildir; FileNotFoundError yalnızca kendisini yakalar.'},
# ---------------- Kodu oku
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': r'''
import io
f = io.BytesIO(b"ANADOLU")
f.read(3)
print(f.tell())
f.seek(-2, 2)
print(f.read())
''',
 'o': ['3\nb\'LU\'', '3\nb\'DOLU\'', '2\nb\'LU\'', '3\nLU'], 'a': 0,
 'why': 'read(3) imleci 3. bayta taşır, tell() 3 verir. seek(-2, 2) sondan 2 bayt geri gider; read() kalan b\'LU\' baytlarını döndürür. İkili modda sonuç bytes olduğu için çıktıda b\'...\' görünür.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': r'''
tampon = bytearray(b"abc")
tampon[0] = 65
tampon.extend(b"!")
print(tampon)
''',
 'o': ['TypeError hatası verir', 'bytearray(b\'Abc!\')', 'b\'Abc!\'', 'bytearray(b\'65bc!\')'], 'a': 1,
 'why': 'bytearray değiştirilebilir; bir indekse 0-255 arası tam sayı atanır ve 65 "A" baytıdır. extend sona bayt ekler. TypeError, aynı kodu değişmez bytes ile yazsaydın gelirdi.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': r'''
from pathlib import Path
p = Path("gelen/rapor.2026.csv")
print(p.stem, p.suffix, p.with_suffix(".json").name)
''',
 'o': ['rapor .2026.csv rapor.json', 'rapor.2026 csv rapor.2026.json', 'rapor.2026 .csv rapor.2026.json', 'rapor.2026.csv .csv rapor.json'], 'a': 2,
 'why': 'suffix yalnızca SON uzantıdır (.csv, noktasıyla birlikte); stem son uzantı hariç addır (rapor.2026). with_suffix yalnızca son uzantıyı değiştirir. Tüm uzantılar için suffixes kullanılır.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>Dosyayı yarım bırakmadan yazan <code>atomik_yaz(yol, metin)</code> fonksiyonunun satırlarını sırala.</p>',
 'lines': [
    'def atomik_yaz(yol, metin):',
    '    import os, tempfile',
    '    klasor = os.path.dirname(os.path.abspath(yol))',
    '    fd, gecici = tempfile.mkstemp(dir=klasor)',
    '    with os.fdopen(fd, "w", encoding="utf-8") as f:',
    '        f.write(metin)',
    '    os.replace(gecici, yol)',
 ],
 'tests': r'''
import tempfile as _t, os as _o
_d = _t.mkdtemp()
_p = _o.path.join(_d, "rapor.txt")
atomik_yaz(_p, "ilk")
atomik_yaz(_p, "ikinci")
assert open(_p, encoding="utf-8").read() == "ikinci", "son yazılan içerik görünmeli"
assert _o.listdir(_d) == ["rapor.txt"], "klasörde geçici dosya kalmamalı"
''',
 'hint': 'Modüller fonksiyonun ilk satırında içe aktarılır. Geçici dosyanın klasörü bilinmeden mkstemp çağrılamaz; os.replace ancak dosya kapandıktan sonra gelir.',
 'why': 'Önce hedefin klasörü bulunur, geçici dosya aynı klasörde açılır, içerik yazılıp with bloğuyla kapatılır ve en son os.replace tek hamlede yer değiştirir.'},
# ---------------- Rehberli
{'t': 'code', 'stage': 'Rehberli', 'id': 'dosya-ileri-1', 'diff': 1,
 'q': '<p>Anadolu Bank\'ın belge sistemine yüklenen dosyaların uzantısına güvenilmiyor; türü dosyanın ilk baytlarından (sihirli sayı, magic number) anlamak gerekiyor. <code>dosya_turu(yol)</code> fonksiyonunu yaz: dosyayı <b>ikili modda</b> açsın, ilk 4 baytı okusun ve şunu döndürsün:</p><ul><li><code>b"%PDF"</code> ile başlıyorsa <code>"pdf"</code></li><li><code>b"PK\\x03\\x04"</code> ile başlıyorsa <code>"zip"</code></li><li><code>b"\\x89PNG"</code> ile başlıyorsa <code>"png"</code></li><li>aksi hâlde <code>"bilinmiyor"</code></li></ul>',
 'guide': ['Dosyayı "rb" moduyla with bloğunda aç.', 'f.read(4) ile yalnızca ilk 4 baytı oku (tüm dosyayı değil).', 'Okunan baytları b"..." ile başlayan imzalarla karşılaştır (str ile değil).', 'Hiçbiri tutmazsa "bilinmiyor" döndür.'],
 'example': r'''
import io
f = io.BytesIO(b"GIF89a...")
bas = f.read(3)
print(bas, bas == b"GIF", bas == "GIF")
''',
 'start': r'''
def dosya_turu(yol):
    # TODO: dosyayı ikili modda aç ve ilk 4 baytı oku
    # TODO: imzalarla karşılaştır
    return "bilinmiyor"
''',
 'sol': r'''
IMZALAR = {b"%PDF": "pdf", b"PK\x03\x04": "zip", b"\x89PNG": "png"}

def dosya_turu(yol):
    with open(yol, "rb") as f:
        bas = f.read(4)
    return IMZALAR.get(bas, "bilinmiyor")
''',
 'tests': r'''
import tempfile, os
_d = tempfile.mkdtemp()
def _yaz(ad, veri):
    p = os.path.join(_d, ad)
    with open(p, "wb") as f:
        f.write(veri)
    return p
assert dosya_turu(_yaz("a.pdf", b"%PDF-1.7 dekont")) == "pdf", "%PDF ile başlayan dosya pdf olmalı"
assert dosya_turu(_yaz("b.dat", b"PK\x03\x04icerik")) == "zip", "PK\\x03\\x04 imzası zip demektir (uzantı .dat olsa bile)"
assert dosya_turu(_yaz("c.png", b"\x89PNG\r\n\x1a\n")) == "png", "\\x89PNG imzası png demektir"
assert dosya_turu(_yaz("d.pdf", b"merhaba")) == "bilinmiyor", "uzantı .pdf olsa da içerik pdf değilse bilinmiyor dönmeli"
assert dosya_turu(_yaz("e.bin", b"")) == "bilinmiyor", "boş dosya bilinmiyor dönmeli"
''',
 'hints': ['İkili modda okunan değer bytes\'tır; karşılaştırırken b"%PDF" gibi bayt değişmezleri kullan.', 'with open(yol, "rb") as f: bas = f.read(4)', 'Bir sözlük {b"%PDF": "pdf", ...} kurup sozluk.get(bas, "bilinmiyor") döndürebilirsin.'],
 'why': 'Uzantı kullanıcı tarafından değiştirilebilir, ama dosya biçimleri ilk baytlarında sabit bir imza taşır. İkili modda yalnızca 4 bayt okumak hem doğru hem de büyük dosyada hızlıdır.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'dosya-ileri-2', 'diff': 2,
 'q': '<p>Anadolu Bank\'ın günlük işlem arşivi gigabaytlarca olabilir; dosyanın değişmediğini kanıtlamak için SHA-256 özetini <b>belleğe tamamını almadan</b> hesaplamalısın. <code>parcali_ozet(yol, parca=65536)</code> fonksiyonunu yaz: dosyayı ikili modda <code>parca</code> baytlık parçalar hâlinde okusun, her parçayı <code>hashlib.sha256</code> nesnesine eklesin ve <code>(ozet_hex, parca_sayisi)</code> demetini döndürsün. Boş dosyada parça sayısı 0\'dır.</p>',
 'guide': ['hashlib.sha256() ile boş bir özet nesnesi oluştur ve sayacı 0 yap.', 'Dosyayı "rb" ile aç.', 'while parca_veri := f.read(parca): döngüsüyle oku; boş bytes gelince döngü biter.', 'Her parçada ozet.update(...) çağır ve sayacı artır.', '(ozet.hexdigest(), sayac) döndür.'],
 'example': r'''
import hashlib, io
f = io.StringIO("a-b-c-d-e")
parcalar = []
while p := f.read(4):
    parcalar.append(p)
print(parcalar)
h = hashlib.sha256()
h.update(b"ab"); h.update(b"c")
print(h.hexdigest() == hashlib.sha256(b"abc").hexdigest())
''',
 'start': r'''
import hashlib

def parcali_ozet(yol, parca=65536):
    ozet = hashlib.sha256()
    sayac = 0
    # TODO: dosyayı ikili modda aç
    # TODO: parça parça oku, ozet.update ile ekle, sayacı artır
    return ozet.hexdigest(), sayac
''',
 'sol': r'''
import hashlib

def parcali_ozet(yol, parca=65536):
    ozet = hashlib.sha256()
    sayac = 0
    with open(yol, "rb") as f:
        while parca_veri := f.read(parca):
            ozet.update(parca_veri)
            sayac += 1
    return ozet.hexdigest(), sayac
''',
 'tests': r'''
import tempfile, os, hashlib
_d = tempfile.mkdtemp()
_veri = ("2026-10-27;TR12;250.00\n" * 40).encode("utf-8")
_p = os.path.join(_d, "islem.dat")
with open(_p, "wb") as f:
    f.write(_veri)
_h, _n = parcali_ozet(_p, parca=100)
assert _h == hashlib.sha256(_veri).hexdigest(), "özet, tüm dosyanın tek seferde alınan özetiyle aynı olmalı"
assert _n == -(-len(_veri) // 100), f"{len(_veri)} bayt 100\'lük parçayla {-(-len(_veri) // 100)} parça olmalı, gelen {_n}"
_b = os.path.join(_d, "bos.dat"); open(_b, "wb").close()
assert parcali_ozet(_b) == (hashlib.sha256(b"").hexdigest(), 0), "boş dosyada parça sayısı 0 olmalı"
''',
 'hints': ['Parçalı okuma kalıbı: f.read(n) boş bytes (b"") döndürünce dosya bitmiştir.', 'while parca_veri := f.read(parca): ile hem okur hem kontrol edersin.', 'Döngü içi: ozet.update(parca_veri); sayac += 1'],
 'why': 'sha256 nesnesi parçaları sırayla eklemeye izin verir; sonuç tek seferde hesaplanan özetle aynıdır. Bellek kullanımı dosya boyutundan bağımsız, parça boyutu kadardır.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'dosya-ileri-3', 'diff': 2,
 'q': '<p>Anadolu Market\'in log klasörü <code>magaza/yil/ay/*.log</code> biçiminde iç içe. <code>log_ozeti(klasor)</code> fonksiyonunu yaz: <code>klasor</code> (str ya da Path) altındaki <b>tüm alt klasörlerdeki</b> <code>.log</code> dosyalarını bulsun ve <code>{göreli_yol: satır_sayısı}</code> sözlüğünü döndürsün. Anahtar, klasöre göre göreli yolun <code>/</code> ile yazılmış hâli olsun (ör. <code>"ankara/2026/10/a.log"</code>); sözlük anahtara göre <b>sıralı</b> eklensin. <code>.txt</code> gibi diğer dosyalar sayılmaz.</p>',
 'guide': ['Path(klasor) ile bir Path nesnesi oluştur.', 'rglob("*.log") ile tüm alt ağaçtaki log dosyalarını bul ve sorted ile sırala.', 'Her dosya için p.relative_to(kok).as_posix() ile anahtarı üret.', 'Satır sayısını dosyayı açıp satır satır sayarak bul (sum(1 for _ in f)).'],
 'example': r'''
from pathlib import Path
import tempfile
with tempfile.TemporaryDirectory() as d:
    kok = Path(d)
    (kok / "a" / "b").mkdir(parents=True)
    (kok / "a" / "b" / "x.csv").write_text("1\n2\n", encoding="utf-8")
    for p in sorted(kok.rglob("*.csv")):
        print(p.relative_to(kok).as_posix())
''',
 'start': r'''
from pathlib import Path

def log_ozeti(klasor):
    kok = Path(klasor)
    sonuc = {}
    # TODO: rglob ile .log dosyalarını sıralı gez
    # TODO: göreli yolu anahtar, satır sayısını değer yap
    return sonuc
''',
 'sol': r'''
from pathlib import Path

def log_ozeti(klasor):
    kok = Path(klasor)
    sonuc = {}
    for p in sorted(kok.rglob("*.log")):
        with p.open(encoding="utf-8") as f:
            sonuc[p.relative_to(kok).as_posix()] = sum(1 for _ in f)
    return sonuc
''',
 'tests': r'''
import tempfile
from pathlib import Path as _P
_k = _P(tempfile.mkdtemp())
for _ad, _icerik in {"ankara/2026/10/a.log": "x\ny\nz\n", "ankara/2026/09/b.log": "x\n", "izmir/c.log": "", "izmir/not.txt": "1\n2\n", "kok.log": "tek satır"}.items():
    (_k / _ad).parent.mkdir(parents=True, exist_ok=True)
    (_k / _ad).write_text(_icerik, encoding="utf-8")
_s = log_ozeti(str(_k))
assert "izmir/not.txt" not in _s, ".txt dosyaları sayılmamalı"
assert _s == {"ankara/2026/09/b.log": 1, "ankara/2026/10/a.log": 3, "izmir/c.log": 0, "kok.log": 1}, f"beklenen sözlük farklı: {_s}"
assert list(_s) == sorted(_s), "anahtarlar sıralı eklenmeli (rglob sırası işletim sistemine göre değişir)"
''',
 'hints': ['Alt klasörler dahil arama için glob değil rglob kullan.', 'for p in sorted(kok.rglob("*.log")):', 'sonuc[p.relative_to(kok).as_posix()] = sum(1 for _ in p.open(encoding="utf-8"))  (with ile açman daha doğru)'],
 'why': 'rglob tüm alt ağacı tarar; sorted ile sonuç her makinede aynı sırada olur. relative_to + as_posix, Windows\'ta bile / ayraçlı, taşınabilir bir anahtar üretir. sum(1 for _ in f) satırları belleğe almadan sayar.'},
# ---------------- Kendin yaz
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'dosya-ileri-4', 'diff': 2,
 'q': '<p>Destek ekibi kullanıcıya teknik hata metni göstermek istemiyor. <code>hata_mesaji(e)</code> fonksiyonunu yaz: bir <code>OSError</code> nesnesi alsın ve <b>errno</b> koduna göre şu Türkçe mesajı döndürsün:</p><ul><li><code>errno.ENOENT</code> → <code>"Dosya bulunamadı: &lt;dosya_adı&gt;"</code></li><li><code>errno.EACCES</code> ya da <code>errno.EPERM</code> → <code>"Erişim izni yok: &lt;dosya_adı&gt;"</code></li><li><code>errno.EISDIR</code> → <code>"Bu bir klasör: &lt;dosya_adı&gt;"</code></li><li>diğerleri → <code>"Sistem hatası: &lt;strerror&gt;"</code></li></ul><p><code>&lt;dosya_adı&gt;</code> için <code>e.filename</code> kullan; <code>None</code> ise <code>"?"</code> yaz.</p>',
 'start': r'''
import errno

def hata_mesaji(e):
    pass
''',
 'sol': r'''
import errno

def hata_mesaji(e):
    ad = e.filename if e.filename is not None else "?"
    if e.errno == errno.ENOENT:
        return f"Dosya bulunamadı: {ad}"
    if e.errno in (errno.EACCES, errno.EPERM):
        return f"Erişim izni yok: {ad}"
    if e.errno == errno.EISDIR:
        return f"Bu bir klasör: {ad}"
    return f"Sistem hatası: {e.strerror}"
''',
 'tests': r'''
import errno as _e
assert hata_mesaji(OSError(_e.ENOENT, "No such file", "siparis.csv")) == "Dosya bulunamadı: siparis.csv", "ENOENT -> Dosya bulunamadı"
assert hata_mesaji(OSError(_e.EACCES, "Permission denied", "maas.xlsx")) == "Erişim izni yok: maas.xlsx", "EACCES -> Erişim izni yok"
assert hata_mesaji(OSError(_e.EPERM, "Not permitted")) == "Erişim izni yok: ?", "EPERM de izin hatasıdır; dosya adı yoksa ? yazılmalı"
assert hata_mesaji(OSError(_e.EISDIR, "Is a directory", "raporlar")) == "Bu bir klasör: raporlar", "EISDIR -> Bu bir klasör"
assert hata_mesaji(OSError(_e.ENOSPC, "No space left on device", "a")) == "Sistem hatası: No space left on device", "tanımsız errno için strerror kullanılmalı"
try:
    open("/olmayan/klasor/dosya.txt")
except OSError as _x:
    assert hata_mesaji(_x) == "Dosya bulunamadı: /olmayan/klasor/dosya.txt", "gerçek open hatasıyla da çalışmalı"
''',
 'hints': ['OSError nesnesinin errno, strerror ve filename alanları vardır.', 'errno modülündeki sabitlerle karşılaştır: e.errno == errno.ENOENT', 'İzin için e.errno in (errno.EACCES, errno.EPERM) yaz.'],
 'why': 'errno sayısal ve işletim sisteminden bağımsız bir isimle (sabitle) karşılaştırılır. Alt sınıf kontrolü (isinstance) da çalışırdı; errno ise ENOSPC (disk dolu) gibi alt sınıfı olmayan durumları da ayırmanı sağlar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'dosya-ileri-5', 'diff': 2,
 'q': '<p>Gece raporlarını tek pakette göndermek için <code>arsivle(klasor, zip_yolu)</code> fonksiyonunu yaz: <code>klasor</code> altındaki <b>tüm dosyaları</b> (alt klasörler dahil) <code>zipfile.ZIP_DEFLATED</code> sıkıştırmayla <code>zip_yolu</code> dosyasına eklesin. Arşiv içindeki adlar klasöre göre göreli ve <code>/</code> ayraçlı olsun (ör. <code>"2026/ciro.csv"</code>). Fonksiyon arşivdeki adların <b>sıralı listesini</b> döndürsün. Klasörlerin kendisi arşive girmez, yalnız dosyalar.</p>',
 'start': r'''
import zipfile
from pathlib import Path

def arsivle(klasor, zip_yolu):
    pass
''',
 'sol': r'''
import zipfile
from pathlib import Path

def arsivle(klasor, zip_yolu):
    kok = Path(klasor)
    with zipfile.ZipFile(zip_yolu, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in sorted(kok.rglob("*")):
            if p.is_file():
                z.write(p, arcname=p.relative_to(kok).as_posix())
    with zipfile.ZipFile(zip_yolu) as z:
        return sorted(z.namelist())
''',
 'tests': r'''
import tempfile, zipfile as _z
from pathlib import Path as _P
_t = _P(tempfile.mkdtemp())
_k = _t / "rapor"
(_k / "2026" / "10").mkdir(parents=True)
(_k / "ozet.txt").write_text("tamam", encoding="utf-8")
(_k / "2026" / "ciro.csv").write_text("sehir,tutar\nAnkara,250\n" * 50, encoding="utf-8")
(_k / "2026" / "10" / "iade.csv").write_text("id\n7\n", encoding="utf-8")
_zy = _t / "paket.zip"
_ad = arsivle(_k, _zy)
assert _ad == ["2026/10/iade.csv", "2026/ciro.csv", "ozet.txt"], f"arşiv adları göreli, / ayraçlı ve sıralı olmalı: {_ad}"
with _z.ZipFile(_zy) as z:
    assert z.read("ozet.txt") == b"tamam", "dosya içeriği arşivde aynen bulunmalı"
    assert z.getinfo("2026/ciro.csv").compress_type == _z.ZIP_DEFLATED, "ZIP_DEFLATED sıkıştırması kullanılmalı"
    assert all(not n.endswith("/") for n in z.namelist()), "klasör girdileri arşive eklenmemeli"
''',
 'hints': ['zipfile.ZipFile(zip_yolu, "w", compression=zipfile.ZIP_DEFLATED) ile yazma modunda aç.', 'rglob("*") hem dosya hem klasör verir; p.is_file() ile süz.', 'z.write(p, arcname=p.relative_to(kok).as_posix()) — arcname vermezsen tam yol arşive girer.'],
 'why': 'arcname vermezsen arşivin içine makinedeki tam yol yazılır, açan kişi /home/... klasörleriyle karşılaşır. Göreli ve / ayraçlı ad, arşivin her işletim sisteminde aynı açılmasını sağlar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'dosya-ileri-6', 'diff': 2,
 'q': '<p>Bir komut satırı aracı yazıyorsun; çıktısı başka programa yönlendirilecek. <code>kayitlari_isle(satirlar)</code> fonksiyonunu yaz: her satır <code>"sehir;tutar"</code> biçimindedir. Geçerli satırlar (iki parça var ve tutar <code>float</code>\'a çevrilebiliyor) <b>stdout</b>\'a <code>"sehir,tutar"</code> olarak (tutar 2 ondalıkla, ör. <code>Ankara,250.00</code>) yazılsın; geçersiz satırlar <b>stderr</b>\'e <code>"ATLANDI: &lt;satır&gt;"</code> olarak yazılsın. Fonksiyon geçerli satır sayısını döndürsün.</p>',
 'start': r'''
import sys

def kayitlari_isle(satirlar):
    pass
''',
 'sol': r'''
import sys

def kayitlari_isle(satirlar):
    gecerli = 0
    for satir in satirlar:
        parcalar = satir.split(";")
        try:
            sehir, tutar = parcalar
            tutar = float(tutar)
        except ValueError:
            print(f"ATLANDI: {satir}", file=sys.stderr)
            continue
        print(f"{sehir},{tutar:.2f}")
        gecerli += 1
    return gecerli
''',
 'tests': r'''
import io, contextlib
_o, _h = io.StringIO(), io.StringIO()
with contextlib.redirect_stdout(_o), contextlib.redirect_stderr(_h):
    _n = kayitlari_isle(["Ankara;250", "Bursa;abc", "İzmir;975.5", "bozuk", "Van;1;2"])
assert _n == 2, f"2 geçerli satır var, gelen {_n}"
assert _o.getvalue().splitlines() == ["Ankara,250.00", "İzmir,975.50"], "stdout\'ta yalnız geçerli satırlar, 2 ondalıkla olmalı: " + repr(_o.getvalue())
assert _h.getvalue().splitlines() == ["ATLANDI: Bursa;abc", "ATLANDI: bozuk", "ATLANDI: Van;1;2"], "geçersiz satırlar stderr\'e gitmeli: " + repr(_h.getvalue())
''',
 'hints': ['print(..., file=sys.stderr) ile stderr\'e yazarsın.', 'sehir, tutar = satir.split(";") parça sayısı 2 değilse ValueError verir; float("abc") de ValueError verir.', 'İkisini tek try/except ValueError ile yakalayabilirsin.'],
 'why': 'Veri stdout\'a, uyarılar stderr\'e gider; böylece python arac.py > temiz.csv yazan kişinin dosyasına uyarı karışmaz. Açma (unpacking) ve float dönüşümü aynı hata türünü verdiği için tek except yeterlidir.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'dosya-ileri-7', 'diff': 2,
 'q': '<p>Lojistik ekibi sevkiyat belgelerini <code>.tar.gz</code> olarak yolluyor. <code>tar_icerik(tar_yolu)</code> fonksiyonunu yaz: arşivi <b>açmadan</b> (diske çıkarmadan) içindeki <b>yalnız dosyaların</b> <code>(ad, boyut)</code> demetlerini ada göre sıralı liste olarak döndürsün. Klasör girdileri listeye girmez.</p>',
 'start': r'''
import tarfile

def tar_icerik(tar_yolu):
    pass
''',
 'sol': r'''
import tarfile

def tar_icerik(tar_yolu):
    with tarfile.open(tar_yolu, "r:*") as t:
        return sorted((m.name, m.size) for m in t.getmembers() if m.isfile())
''',
 'tests': r'''
import tempfile, tarfile as _tf
from pathlib import Path as _P
_t = _P(tempfile.mkdtemp())
_k = _t / "sevk"
(_k / "irsaliye").mkdir(parents=True)
(_k / "irsaliye" / "IRS-1.txt").write_text("A" * 120, encoding="utf-8")
(_k / "liste.csv").write_text("kod\n1\n", encoding="utf-8")
_y = _t / "sevk.tar.gz"
with _tf.open(_y, "w:gz") as t:
    t.add(_k, arcname="sevk")
_s = tar_icerik(_y)
assert _s == [("sevk/irsaliye/IRS-1.txt", 120), ("sevk/liste.csv", 6)], f"yalnız dosyalar, (ad, boyut) ve sıralı olmalı: {_s}"
''',
 'hints': ['tarfile.open(yol) sıkıştırmayı kendisi tanır ("r:*").', 't.getmembers() TarInfo listesi verir; m.isfile(), m.name, m.size alanlarını kullan.', 'return sorted((m.name, m.size) for m in t.getmembers() if m.isfile())'],
 'why': 'getmembers arşivin başlık bilgilerini okur, içeriği diske çıkarmaz. Bu hem hızlıdır hem de güvenilmeyen arşivleri açmadan incelemenin güvenli yoludur.'},
# ---------------- Hata avı
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'dosya-ileri-8', 'diff': 2,
 'q': '<p>Bir stajyer yüklenen dosyanın PNG olup olmadığını kontrol eden <code>png_mi(yol)</code> fonksiyonunu yazdı ama gerçek PNG dosyalarında program çöküyor. <b>Hatayı bul ve düzelt.</b> Fonksiyon dosyanın ilk 4 baytı <code>b"\\x89PNG"</code> ise True, değilse False döndürmeli.</p>',
 'start': r'''
def png_mi(yol):
    with open(yol, "r", encoding="utf-8") as f:
        return f.read(4) == "\x89PNG"
''',
 'sol': r'''
def png_mi(yol):
    with open(yol, "rb") as f:
        return f.read(4) == b"\x89PNG"
''',
 'tests': r'''
import tempfile, os
_d = tempfile.mkdtemp()
_p = os.path.join(_d, "logo.png")
with open(_p, "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")
_m = os.path.join(_d, "not.txt")
with open(_m, "wb") as f:
    f.write("Çok önemli not".encode("utf-8"))
assert png_mi(_p) is True, "gerçek PNG imzası True vermeli (0x89 baytı UTF-8 olarak çözülemez, ikili mod gerekir)"
assert png_mi(_m) is False, "metin dosyası False vermeli"
''',
 'hints': ['0x89 baytı tek başına geçerli bir UTF-8 karakteri değildir; metin modunda okuma UnicodeDecodeError verir.', 'Dosyayı "rb" ile aç ve encoding parametresini kaldır.', 'Karşılaştırmayı bytes ile yap: b"\\x89PNG".'],
 'why': 'İkili dosya metin modunda açılınca Python baytları UTF-8 olarak çözmeye çalışır ve geçersiz baytta çöker. Ayrıca "\\x89PNG" bir str, dosyadan gelen ise bytes olmalıdır; ikisi asla eşit olmaz.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'dosya-ileri-9', 'diff': 2,
 'q': '<p>Büyük log dosyalarında satır saymak için yazılmış <code>satir_say(yol, parca=1024)</code> fonksiyonu çalışmıyor. Dosya <code>\\n</code> ile bitmese bile son satır sayılmalı; boş dosya 0 satırdır. <b>Hataları bul ve düzelt</b> (birden fazla var).</p>',
 'start': r'''
def satir_say(yol, parca=1024):
    sayac = 0
    with open(yol, "rb") as f:
        veri = f.read(parca)
        while veri:
            sayac += veri.count("\n")
            veri = f.read(parca)
''',
 'sol': r'''
def satir_say(yol, parca=1024):
    sayac = 0
    son = b""
    with open(yol, "rb") as f:
        veri = f.read(parca)
        while veri:
            sayac += veri.count(b"\n")
            son = veri[-1:]
            veri = f.read(parca)
    if son and son != b"\n":
        sayac += 1
    return sayac
''',
 'tests': r'''
import tempfile, os
_d = tempfile.mkdtemp()
def _y(icerik):
    p = os.path.join(_d, f"f{len(os.listdir(_d))}.log")
    with open(p, "wb") as f:
        f.write(icerik)
    return p
assert satir_say(_y(b"a\nb\nc\n")) == 3, "\\n ile biten 3 satır 3 sayılmalı"
assert satir_say(_y(b"a\nb\nc")) == 3, "son satır \\n ile bitmese de sayılmalı"
assert satir_say(_y(b"")) == 0, "boş dosya 0 satırdır"
assert satir_say(_y(b"x" * 10 + b"\n" + b"y" * 10), parca=4) == 2, "parça sınırları sonucu değiştirmemeli"
assert satir_say(_y(b"tek"), parca=2) == 1, "\\n olmayan tek satır 1 sayılmalı"
''',
 'hints': ['bytes.count bir bytes ister: veri.count(b"\\n").', 'Fonksiyon hiçbir şey döndürmüyor; sonda return sayac olmalı.', 'Son okunan parçanın son baytını sakla (veri[-1:]); \\n değilse bir satır daha ekle.'],
 'why': 'Üç hata vardı: bytes içinde str aramak TypeError verir, return unutulmuş (None döner) ve \\n ile bitmeyen son satır sayılmıyordu. Son baytı veri[-1:] ile almak (veri[-1] değil) bytes döndürür, karşılaştırma tutarlı kalır.'},
# ---------------- Meydan okuma
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'dosya-ileri-10', 'diff': 3,
 'q': '<p>Unix\'teki <code>tail</code> komutunu yaz: <code>son_satirlar(yol, n)</code> UTF-8 bir dosyanın son <code>n</code> satırını (satır sonu karakterleri olmadan) liste olarak döndürsün. Dosya çok büyük olabilir: dosyanın <b>tamamını okuma</b>; ikili modda <b>sondan geriye doğru</b> parça parça <code>seek</code> ederek yalnızca gereken kadarını oku. Kenar durumlar: dosya <code>n</code>\'den az satırlıysa hepsini döndür; boş dosya <code>[]</code>; dosya <code>\\n</code> ile bitse de bitmese de son satır doğru gelsin; <code>n &lt;= 0</code> ise <code>[]</code>.</p>',
 'start': r'''
import os

def son_satirlar(yol, n, parca=4096):
    pass
''',
 'sol': r'''
import os

def son_satirlar(yol, n, parca=4096):
    if n <= 0:
        return []
    with open(yol, "rb") as f:
        f.seek(0, os.SEEK_END)
        konum = f.tell()
        veri = b""
        while konum > 0 and veri.count(b"\n") <= n:
            oku = min(parca, konum)
            konum -= oku
            f.seek(konum)
            veri = f.read(oku) + veri
    if konum > 0:
        veri = veri[veri.index(b"\n") + 1:]   # yarım kalan ilk satırı at
    satirlar = veri.decode("utf-8").splitlines()
    return satirlar[-n:]
''',
 'tests': r'''
import tempfile, os
_d = tempfile.mkdtemp()
_p = os.path.join(_d, "buyuk.log")
with open(_p, "w", encoding="utf-8") as f:
    for i in range(1, 2001):
        f.write(f"satır {i} ğüşıöç\n")
assert son_satirlar(_p, 3) == ["satır 1998 ğüşıöç", "satır 1999 ğüşıöç", "satır 2000 ğüşıöç"], "son 3 satır yanlış"
assert son_satirlar(_p, 3, parca=7) == son_satirlar(_p, 3), "küçük parça boyutuyla da aynı sonuç gelmeli"
assert len(son_satirlar(_p, 5000)) == 2000, "n satır sayısından büyükse tüm satırlar dönmeli"
_q = os.path.join(_d, "kisa.log")
with open(_q, "w", encoding="utf-8") as f:
    f.write("a\nb\nc")
assert son_satirlar(_q, 2, parca=2) == ["b", "c"], "\\n ile bitmeyen dosyada son satır gelmeli"
_b = os.path.join(_d, "bos.log"); open(_b, "w").close()
assert son_satirlar(_b, 3) == [], "boş dosya [] döndürmeli"
assert son_satirlar(_p, 0) == [], "n=0 için []"
assert "seek" in __source__, "dosyanın sonundan geriye seek ederek okumalısın"
''',
 'hints': ['f.seek(0, os.SEEK_END); f.tell() dosya boyutunu verir.', 'Konumu parça kadar geri al, seek et, oku ve okuduğunu biriktirdiğin baytların BAŞINA ekle. Yeterli \\n toplanınca dur.', 'Çok baytlı harfler parça sınırında bölünebilir; decode işlemini en sonda, birleşmiş baytlar üzerinde yap. n+1 tane \\n görmek, son satırın \\n ile bittiği durumu da kapsar.'],
 'why': 'Sondan geriye okuma, n satır için yalnızca birkaç parça okur; 5 GB\'lık log dosyasında bile anında döner. decode\'u sonda yapmak, parça sınırına denk gelen çok baytlı Türkçe harflerin bozulmasını önler.'},
# ---------------- Mini proje
{'t': 'code', 'stage': 'Mini proje', 'id': 'dosya-ileri-11', 'diff': 3,
 'q': '<p><b>Gece işi:</b> Anadolu Market mağazaları satış dosyalarını <code>gelen</code> klasörünün alt klasörlerine bırakıyor. <code>gece_isi(gelen, cikti_json)</code> fonksiyonunu yaz:</p><ol><li><code>gelen</code> altındaki tüm <code>.csv</code> dosyalarını (alt klasörler dahil, sıralı) oku; başlık <code>sehir,tutar</code>, kodlama UTF-8.</li><li>Tutarı <code>float</code>\'a çevrilemeyen satırları atla ve <code>"dosya_göreli_yolu:satır_no"</code> biçiminde kaydet (başlık 1. satırdır, ilk veri satırı 2).</li><li>Şehir bazında toplam ciroyu hesapla (2 ondalığa yuvarla).</li><li>Sonucu <code>{"dosya": dosya_sayısı, "sehir": {...}, "hatali": [...]}</code> olarak <code>cikti_json</code>\'a <b>atomik</b> yaz (aynı klasörde geçici dosya + <code>os.replace</code>, <code>ensure_ascii=False</code>).</li><li>Aynı sözlüğü döndür.</li></ol>',
 'start': r'''
import csv, json, os, tempfile
from pathlib import Path

def gece_isi(gelen, cikti_json):
    pass
''',
 'sol': r'''
import csv, json, os, tempfile
from pathlib import Path

def atomik_json(yol, veri):
    klasor = os.path.dirname(os.path.abspath(yol))
    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(veri, f, ensure_ascii=False)
        os.replace(gecici, yol)
    except BaseException:
        os.unlink(gecici)
        raise

def gece_isi(gelen, cikti_json):
    kok = Path(gelen)
    dosyalar = sorted(kok.rglob("*.csv"))
    sehir, hatali = {}, []
    for yol in dosyalar:
        ad = yol.relative_to(kok).as_posix()
        with yol.open(encoding="utf-8", newline="") as f:
            for no, satir in enumerate(csv.DictReader(f), start=2):
                try:
                    tutar = float(satir["tutar"])
                except (ValueError, TypeError):
                    hatali.append(f"{ad}:{no}")
                    continue
                sehir[satir["sehir"]] = sehir.get(satir["sehir"], 0) + tutar
    sonuc = {"dosya": len(dosyalar), "sehir": {k: round(v, 2) for k, v in sehir.items()}, "hatali": hatali}
    atomik_json(cikti_json, sonuc)
    return sonuc
''',
 'tests': r'''
import tempfile, json as _j, os as _os
from pathlib import Path as _P
_t = _P(tempfile.mkdtemp())
_g = _t / "gelen"
for _ad, _ic in {"ankara/k1.csv": "sehir,tutar\nAnkara,250.5\nAnkara,yok\nAnkara,100\n", "izmir/k1.csv": "sehir,tutar\nİzmir,975\n", "izmir/eski/k0.csv": "sehir,tutar\nAnkara,49.5\nİzmir,\n", "notlar.txt": "atla"}.items():
    (_g / _ad).parent.mkdir(parents=True, exist_ok=True)
    (_g / _ad).write_text(_ic, encoding="utf-8")
_cikti = _t / "rapor"
_cikti.mkdir()
_y = _cikti / "rapor.json"
_y.write_text("eski rapor", encoding="utf-8")
_s = gece_isi(_g, _y)
assert _s["dosya"] == 3, f"3 csv dosyası var (txt sayılmaz), gelen {_s['dosya']}"
assert _s["sehir"] == {"Ankara": 400.0, "İzmir": 975.0}, f"şehir toplamları yanlış: {_s['sehir']}"
assert _s["hatali"] == ["ankara/k1.csv:3", "izmir/eski/k0.csv:3"], f"hatalı satırlar dosya:satır biçiminde ve sıralı dosya sırasında olmalı: {_s['hatali']}"
_ok = _j.loads(_y.read_text(encoding="utf-8"))
assert _ok == _s, "JSON dosyasındaki içerik döndürülen sözlükle aynı olmalı"
assert "İzmir" in _y.read_text(encoding="utf-8"), "ensure_ascii=False ile Türkçe karakterler okunur kalmalı"
assert _os.listdir(_cikti) == ["rapor.json"], "çıktı klasöründe geçici dosya kalmamalı"
''',
 'hints': ['İşi iki fonksiyona böl: biri atomik JSON yazsın, diğeri dosyaları toplasın.', 'csv.DictReader + enumerate(..., start=2) ile satır numarası; boş tutar ("") da float\'a çevrilemez.', 'Atomik yazma: tempfile.mkstemp(dir=hedefin_klasörü) → os.fdopen ile yaz → os.replace(gecici, hedef).'],
 'why': 'Bu, gerçek bir toplu iş (batch job) iskeletidir: dosyaları deterministik sırayla bul, bozuk satırı işi durdurmadan kaydet, sonucu atomik yaz. Muhasebe hiçbir zaman yarım rapor görmez, hatalı satırlar da dosya ve satır numarasıyla bulunabilir.'},
],
'faq': [
    {'q': 'Ne zaman metin modu, ne zaman ikili mod kullanmalıyım?', 'a': 'İçeriği insanın okuyacağı karakterler olarak işliyorsan (CSV, JSON, log) metin modu ve açık encoding. Resim, PDF, arşiv, şifreli veri, özet hesabı ya da bayt konumuyla (seek) çalışacağın her durumda ikili mod. Emin değilsen önce ikili oku, sonra kendin decode et.'},
    {'q': 'readlines() ile for satir in f arasında fark var mı?', 'a': 'readlines() tüm dosyayı tek seferde listeye yükler; for satir in f ise dosyayı tamponlu ve tembel (lazy) okur, bellekte yalnız birkaç satır tutar. Küçük dosyada fark yok, büyük dosyada for döngüsü tek doğru seçimdir.'},
    {'q': 'os.replace ile shutil.move arasındaki fark ne?', 'a': 'os.replace aynı dosya sisteminde tek bir atomik yeniden adlandırmadır ve hedef varsa üzerine yazar. shutil.move farklı disklere de taşıyabilir ama bu durumda kopyala + sil yapar; atomik değildir. Atomik yazmada os.replace kullan.'},
    {'q': 'Geçici dosyayı neden /tmp yerine hedefin klasöründe açıyoruz?', 'a': '/tmp çoğu sistemde ayrı bir dosya sistemidir. Farklı dosya sistemleri arasında yeniden adlandırma atomik olamaz; os.replace bu durumda hata verir. Aynı klasör aynı dosya sistemi demektir.'},
    {'q': 'Tarayıcıdaki Python\'da dosyalar nereye yazılıyor?', 'a': 'Bu uygulamada Python bellekte sanal bir dosya sistemi kullanır; sayfa yenilenince dosyalar kaybolur. Kodun kendi bilgisayarında aynen çalışır, yalnızca dosyalar gerçekten diske yazılır.'},
],
'mistakes': [
    {'bad': 'with open("logo.png") as f:\n    veri = f.read()', 'good': 'with open("logo.png", "rb") as f:\n    veri = f.read()', 'why': 'İkili dosya metin modunda açılırsa Python baytları karakter olarak çözmeye çalışır ve UnicodeDecodeError verir ya da veriyi bozar.'},
    {'bad': 'if veri.startswith("%PDF"):\n    ...', 'good': 'if veri.startswith(b"%PDF"):\n    ...', 'why': 'bytes ile str karşılaştırılamaz ya da karıştırılamaz; bytes metotları bytes argüman ister, aksi hâlde TypeError ya da her zaman False alırsın.'},
    {'bad': 'with open("rapor.json", "w") as f:\n    json.dump(buyuk_veri, f)', 'good': 'fd, tmp = tempfile.mkstemp(dir=".")\nwith os.fdopen(fd, "w") as f:\n    json.dump(buyuk_veri, f)\nos.replace(tmp, "rapor.json")', 'why': '"w" dosyayı açar açmaz siler; yazma sırasında çökme olursa geride yarım ya da boş bir rapor kalır. Geçici dosya + os.replace bunu önler.'},
    {'bad': 'for p in Path("gelen").glob("*.csv"):\n    isle(p)', 'good': 'for p in sorted(Path("gelen").rglob("*.csv")):\n    isle(p)', 'why': 'glob yalnızca o klasöre bakar, alt klasörleri kaçırır; ayrıca sıra işletim sistemine göre değişir. Tekrarlanabilir rapor için rglob ve sorted kullan.'},
    {'bad': 'except Exception:\n    print("Dosya yok")', 'good': 'except FileNotFoundError as e:\n    print("Dosya yok:", e.filename)\nexcept PermissionError as e:\n    print("İzin yok:", e.filename)', 'why': 'Her hatayı "dosya yok" diye raporlamak izin ve disk dolu gibi sorunları gizler; hatayı bulmak saatler sürer. OSError alt sınıflarını ayrı yakala.'},
],
}
