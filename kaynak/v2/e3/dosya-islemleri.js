/* Kesit Python — uzantı: dosya-islemleri (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'dosya-islemleri',
    min: 40,
    html: `<h2>Derinleş: dosyalarla günlük iş</h2>
<p>Temeli kurdun: <code>open</code>, <code>with</code>, modlar, satır satır okuma, <code>pathlib</code>. Bu bölümde iş hayatında her hafta karşına çıkacak işleri ele alıyoruz: "dosya bulunamadı" hatasının asıl nedeni, yolu parçalarına ayırmak, aynı anda iki dosyayla çalışmak, şubelerden gelen dosyaları birleştirmek ve Excel'den gelen bozuk görünen CSV'ler. İkili (binary) mod, <code>seek</code>, arşivler ve atomik yazmanın ayrıntısı orta seviyedeki <b>İleri dosya işlemleri</b> dersinde; <code>csv</code> ve <code>json</code> modülleri de <b>JSON ve CSV</b> dersinde.</p>

<h3>Çalışma klasörü: göreli yol nereden başlar?</h3>
<p><code>open("siparisler.csv")</code> yazdığında Python dosyayı betiğin yanında değil, <b>çalışma klasöründe</b> (current working directory) arar. Terminalde hangi klasördeyken <code>python</code> komutunu verdiysen orasıdır. VS Code'da "Çalıştır" düğmesi çoğu zaman proje kökünü kullanır; bu yüzden "bende çalışıyordu" hatalarının yarısı buradan çıkar.</p>
<pre class="py">from pathlib import Path
import os

print("Çalışma klasörü:", Path.cwd())
print("Aynı bilgi os ile:", os.getcwd())

yol = Path("olmayan_rapor.csv")
print("Göreli yol:", yol)
print("Python aslında burada arayacak:", yol.resolve())
print("Var mı?", yol.exists())
</pre>
<div class="tip"><b>FileNotFoundError aldığında üç soru</b>1) <code>Path.cwd()</code> nerede? 2) <code>Path(yol).resolve()</code> tam olarak neyi gösteriyor? 3) Dosya adında gizli uzantı var mı (Windows "rapor.csv.txt" diye kaydetmiş olabilir)? Bu üçünü yazdırmak tahmin yürütmekten hızlıdır.</div>

<h3>Yolu parçalarına ayır: Path'in sorgu araçları</h3>
<p>Dosya adlarıyla metin işlemi (<code>split(".")</code>, <code>replace</code>) yapmak kırılgandır: "rapor.v2.csv" gibi adlar seni şaşırtır. <code>Path</code> nesnesi her parçayı ayrı özellik olarak verir.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>"veri/2026/satis_ekim.csv" için sonuç</th><th>Ne işe yarar?</th></tr>
<tr><td><code>p.name</code></td><td>satis_ekim.csv</td><td>Klasörsüz tam dosya adı</td></tr>
<tr><td><code>p.stem</code></td><td>satis_ekim</td><td>Uzantısız ad; rapor başlığı, sözlük anahtarı</td></tr>
<tr><td><code>p.suffix</code></td><td>.csv</td><td>Uzantı (noktasıyla)</td></tr>
<tr><td><code>p.parent</code></td><td>veri/2026</td><td>Bulunduğu klasör</td></tr>
<tr><td><code>p.with_suffix(".json")</code></td><td>veri/2026/satis_ekim.json</td><td>Aynı yerde farklı uzantılı çıktı</td></tr>
<tr><td><code>p.with_name("ozet.txt")</code></td><td>veri/2026/ozet.txt</td><td>Aynı klasörde başka dosya</td></tr>
<tr><td><code>p.is_file()</code> / <code>p.is_dir()</code></td><td>True / False</td><td>Var mı ve türü ne?</td></tr>
<tr><td><code>p.stat().st_size</code></td><td>bayt cinsinden boyut</td><td>Boş dosyayı atlamak</td></tr>
<tr><td><code>p.unlink(missing_ok=True)</code></td><td>dosyayı siler</td><td>Yoksa hata vermeden</td></tr>
<tr><td><code>klasor.iterdir()</code> / <code>klasor.rglob("*.csv")</code></td><td>içerik / alt klasörler dahil arama</td><td>Toplu işleme</td></tr>
</table></div>
<pre class="py">from pathlib import Path

klasor = Path("veri") / "2026"
klasor.mkdir(parents=True, exist_ok=True)     # ara klasörleri de oluştur
p = klasor / "satis_ekim.csv"
p.write_text("id,tutar\\n1,250\\n2,400\\n", encoding="utf-8")

print(p.name, "|", p.stem, "|", p.suffix)
print("Klasör:", p.parent.as_posix())
print("JSON çıktısı:", p.with_suffix(".json").as_posix())
print("Boyut:", p.stat().st_size, "bayt")

for dosya in sorted(Path("veri").rglob("*.csv")):
    print("CSV bulundu:", dosya.as_posix())
</pre>
<p><code>mkdir(parents=True, exist_ok=True)</code> ikilisini ezberle: "ara klasörler de yoksa oluştur, varsa sessiz kal". <code>as_posix()</code> yolu her işletim sisteminde eğik çizgiyle (/) yazar; rapor ve log çıktısında tutarlı görünür.</p>

<h3>Aynı anda iki dosya: oku, süz, yaz</h3>
<p>Tek bir <code>with</code> satırında birden çok dosya açabilirsin. Kaynaktan satır satır okuyup hedefe yazmak, bellekte tüm dosyayı tutmadan "filtre" kurmanın standart yoludur. <code>print(..., file=f)</code> da dosyaya yazar ve satır sonunu kendisi ekler; <code>write</code> ise yalnız metin (str) alır ve <code>\\n</code> eklemez.</p>
<pre class="py">with open("banka_islem.log", "w", encoding="utf-8") as f:
    f.write("09:01 OK havale 1500\\n09:04 HATA zaman aşımı\\n09:10 OK eft 320\\n09:12 HATA limit aşıldı\\n")

hata_sayisi = 0
with open("banka_islem.log", encoding="utf-8") as kaynak, \\
     open("hatalar.log", "w", encoding="utf-8") as hedef:
    for satir in kaynak:
        if " HATA " in satir:
            hedef.write(satir)          # satırın kendi \\n'i var
            hata_sayisi += 1
    print(f"Toplam {hata_sayisi} hata", file=hedef)   # print satır sonunu ekler

print(open("hatalar.log", encoding="utf-8").read())
n = open("deneme.txt", "w", encoding="utf-8").write("Ankara\\n")
print("write dönen değer (yazılan karakter):", n)
</pre>
<div class="warn"><b>write sayı kabul etmez</b><code>f.write(1500)</code> → <code>TypeError: write() argument must be str, not int</code>. Önce <code>str()</code> ya da f-string kullan: <code>f.write(f"{ciro:.2f}\\n")</code>. Ayrıca son örnekteki gibi <code>with</code> kullanmadan açılan dosya kapanmayabilir; o satır yalnızca dönen değeri göstermek için.</div>

<h3>Şubelerden gelen dosyaları birleştirmek</h3>
<p>Anadolu Market'in her şubesi günlük satışını ayrı CSV olarak gönderiyor; hepsinin başlığı aynı. Birleştirirken başlığı yalnız bir kez yaz, boş satırları atla, kaynak dosyanın adını yeni bir sütun olarak ekle ki sonradan "bu satır hangi şubeden geldi?" sorusu cevaplanabilsin.</p>
<pre class="py">from pathlib import Path

gelen = Path("gelen_subeler")
gelen.mkdir(exist_ok=True)
(gelen / "kadikoy.csv").write_text("urun,adet\\nkulaklik,3\\nkablo,10\\n", encoding="utf-8")
(gelen / "cankaya.csv").write_text("urun,adet\\nkulaklik,5\\n\\n", encoding="utf-8")

cikti = ["sube,urun,adet"]
for dosya in sorted(gelen.glob("*.csv")):
    satirlar = dosya.read_text(encoding="utf-8").splitlines()
    for satir in satirlar[1:]:              # başlığı atla
        if satir.strip():
            cikti.append(f"{dosya.stem},{satir}")

Path("tum_subeler.csv").write_text("\\n".join(cikti) + "\\n", encoding="utf-8")
print(Path("tum_subeler.csv").read_text(encoding="utf-8"))
</pre>

<h3>Excel'den gelen CSV: BOM ve noktalı virgül</h3>
<p>Türkçe Excel "CSV (UTF-8)" olarak kaydettiğinde iki sürpriz yapar: ayırıcı virgül değil <b>noktalı virgüldür</b> (çünkü ondalık ayırıcı virgüldür: <code>1250,50</code>), ve dosyanın başına görünmez bir <b>BOM</b> (byte order mark, <code>\\ufeff</code>) karakteri koyar. Sonuç: ilk sütunun adı <code>"id"</code> değil <code>"\\ufeffid"</code> olur ve <code>kayit["id"]</code> KeyError verir.</p>
<pre class="py">with open("excel_cikti.csv", "w", encoding="utf-8-sig") as f:   # Excel gibi BOM'lu yaz
    f.write("id;musteri;tutar\\n1;Ayşe;1250,50\\n")

with open("excel_cikti.csv", encoding="utf-8") as f:
    print("utf-8 ile ilk başlık:", repr(f.readline().split(";")[0]))

with open("excel_cikti.csv", encoding="utf-8-sig") as f:
    basliklar = f.readline().strip().split(";")
    alanlar = f.readline().strip().split(";")
kayit = dict(zip(basliklar, alanlar))
kayit["tutar"] = float(kayit["tutar"].replace(".", "").replace(",", "."))
print("utf-8-sig ile:", kayit)
</pre>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td>İlk sütun adı <code>\\ufeffid</code></td><td>BOM</td><td><code>encoding="utf-8-sig"</code></td></tr>
<tr><td>Her satır tek alan</td><td>Ayırıcı <code>;</code></td><td><code>split(";")</code> ya da csv modülünde <code>delimiter=";"</code></td></tr>
<tr><td><code>float("1.250,50")</code> ValueError</td><td>Türkçe sayı biçimi</td><td>Önce binlik noktayı sil, sonra virgülü noktaya çevir</td></tr>
<tr><td>"ÅŸ" gibi bozuk harfler</td><td>Dosya cp1254/latin ile yazılmış</td><td><code>encoding="cp1254"</code> dene</td></tr>
<tr><td>Satırlar arası boş satır (Windows)</td><td>Çift satır sonu</td><td>csv modülüyle yazarken <code>newline=""</code></td></tr>
</table></div>

<h3>Basit ayar dosyası okumak</h3>
<p>Küçük betikler ayarlarını çoğu zaman <code>anahtar=değer</code> satırlarından oluşan bir dosyada tutar. <code>#</code> ile başlayan satırlar yorumdur. Satırı yalnızca <b>ilk</b> eşittir işaretinden bölmek önemlidir; değerin içinde de <code>=</code> olabilir (<code>split("=", 1)</code>). Daha zengin biçimler (INI, TOML, .env) <b>Yapılandırma</b> dersinde.</p>

<div class="note"><b>Gerçek işte</b>Muhasebe ekibi her sabah bankadan gelen ekstre dosyalarını bir klasöre bırakır; senin betiğin klasörü tarar (<code>glob</code>), yeni dosyaları birleştirir, hatalı satırları ayrı bir dosyaya yazar ve işlenen dosyayı "islenmis" klasörüne taşır (<code>rename</code>). Bu iş akışının her parçasını bu derste gördün. İki altın kural: girdiyi asla yerinde değiştirme (yeni dosya üret) ve her çıktı dosyasının adına tarih koy (<code>rapor_2026-10-28.txt</code>), böylece dünkü rapor üzerine yazılmaz.</div>
`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>Path("raporlar/ocak_2026.csv").stem</code> ifadesinin değeri nedir?',
        o: ['"ocak_2026.csv"', '"ocak_2026"', '".csv"', '"raporlar/ocak_2026"'],
        a: 1,
        why: 'stem, klasörsüz ve uzantısız addır. Tam ad (uzantılı) name, uzantı suffix, klasör ise parent özelliğidir.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Excel\'den kaydedilen bir CSV\'yi <code>encoding="utf-8"</code> ile okuyunca ilk başlık <code>"\\ufeffid"</code> çıkıyor ve <code>kayit["id"]</code> KeyError veriyor. En doğru çözüm hangisi?',
        o: [
          'Dosyayı encoding="utf-8-sig" ile açmak',
          'Başlıkları upper() ile büyük harfe çevirmek',
          'Dosyayı "rb" moduyla açıp elle çözmek',
          'Her satırda strip() yerine split() kullanmak'
        ],
        a: 0,
        why: '\\ufeff, Excel\'in dosya başına koyduğu BOM karakteridir. utf-8-sig kodlaması varsa BOM\'u atlar, yoksa normal utf-8 gibi davranır. strip() BOM\'u silmez; ikili mod ise gereksiz zahmettir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'with open("pr_log1.txt", "w", encoding="utf-8") as f:\n    f.write("açıldı\\n")\nfor _ in range(2):\n    with open("pr_log1.txt", "a", encoding="utf-8") as f:\n        f.write("işlem\\n")\nwith open("pr_log1.txt", encoding="utf-8") as f:\n    print(len(f.readlines()))\n',
        o: ['2', '3', '1', '4'],
        a: 1,
        why: '"w" dosyayı bir satırla başlatır; döngüde "a" iki kez sona ekler. Toplam 3 satır. "a" eski içeriği silmez, bu yüzden 2 değil.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: '<code>write</code> metodu ne döndürür? Bu kod ne yazdırır?',
        code: 'with open("pr_sehir.txt", "w", encoding="utf-8") as f:\n    n = f.write("İzmir\\n")\nprint(n)\n',
        o: ['None', '5', '6', '7'],
        a: 2,
        why: 'write yazılan KARAKTER sayısını döndürür: "İzmir" 5 karakter + "\\n" 1 karakter = 6. Bayt sayısı değil karakter sayısıdır; İ iki bayt olsa da tek karakter sayılır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'from pathlib import Path\np = Path("veri/2026/satis.csv")\nprint(p.with_suffix(".json").name, p.parent.name)\n',
        o: ['satis.json 2026', 'satis.csv.json veri/2026', 'satis.json veri/2026', 'satis 2026'],
        a: 0,
        why: 'with_suffix uzantıyı değiştirir (eklemez) ve name klasörsüz adı verir: satis.json. parent "veri/2026" yoludur ama onun .name\'i son parça olan "2026"dır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        raises: true,
        q: 'Bu kod çalışınca ne olur?',
        code: 'with open("pr_yeni_rapor.txt", "w", encoding="utf-8") as f:\n    f.write("v1\\n")\nwith open("pr_yeni_rapor.txt", "x", encoding="utf-8") as f:\n    f.write("v2\\n")\nprint("tamam")\n',
        o: ['tamam yazdırır', 'FileExistsError hatası verir', 'Dosyaya v2 eklenir, tamam yazdırır', 'FileNotFoundError hatası verir'],
        a: 1,
        why: '"x" modu "yalnızca yeni dosya oluştur" demektir; dosya zaten varsa FileExistsError fırlatır. Yanlışlıkla eski raporun üzerine yazmayı önlemek için kullanılır.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Banka log dosyasından yalnızca HATA satırlarını <code>hatalar_sirala.log</code> dosyasına süzen ve kaç satır yazıldığını gösteren programın satırlarını sırala.</p>',
        lines: [
          'open("islem_sirala.log", "w", encoding="utf-8").write("OK a\\nHATA b\\nOK c\\nHATA d\\n")',
          'adet = 0',
          'with open("islem_sirala.log", encoding="utf-8") as kaynak, open("hatalar_sirala.log", "w", encoding="utf-8") as hedef:',
          '    for satir in kaynak:',
          '        if satir.startswith("HATA"):',
          '            hedef.write(satir)',
          '            adet += 1',
          'print(adet, "satır yazıldı")'
        ],
        expect: '2 satır yazıldı\n',
        hint: 'Önce kaynak dosya var olmalı; sayaç döngüden önce sıfırlanmalı; yazma ve sayma if bloğunun içinde.',
        why: 'Filtre kalıbı: iki dosyayı aynı with satırında aç, kaynağı satır satır dolaş, koşulu sağlayanı hedefe yaz. Sayaç döngüden önce tanımlanır, sonuç döngü bittikten sonra yazdırılır.' },
      { t: 'code',
        id: 'dosya-islemleri-x1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Anadolu Market şubeleri aynı başlıklı (<code>urun,adet</code>) CSV dosyaları gönderiyor. <code>sube_birlestir(dosyalar, hedef)</code> fonksiyonunu yaz:</p><ul><li><code>dosyalar</code>: dosya yollarının listesi; <code>hedef</code>: yazılacak dosyanın yolu.</li><li>Hedefe başlık satırını <b>bir kez</b> <code>sube,urun,adet</code> olarak yaz.</li><li>Her dosyanın veri satırlarını (başlık hariç, boş satırlar atlanarak) başına dosyanın <b>uzantısız adını</b> ve virgül ekleyerek yaz.</li><li>Yazılan veri satırı sayısını döndür.</li></ul>',
        guide: [
          'Hedef dosyayı "w" kipinde with ile aç ve başlığı yaz.',
          'Her kaynak yol için Path(yol).stem ile şube adını bul.',
          'Kaynağı aç, ilk satırı (başlık) next(f) ya da readline() ile geç.',
          'Kalan satırlarda strip() boş değilse "sube,satir" biçiminde yaz ve sayacı artır.',
          'Sayacı döndür.'
        ],
        example: 'from pathlib import Path\n# Farklı bir iş: her log dosyasının ilk satırını (başlık) atlayıp satırlarını say\nPath("ornek_a.log").write_text("BASLIK\\nx\\ny\\n", encoding="utf-8")\nfor yol in ["ornek_a.log"]:\n    with open(yol, encoding="utf-8") as f:\n        next(f)                      # başlığı geç\n        veri = [s.strip() for s in f if s.strip()]\n    print(Path(yol).stem, len(veri))\n',
        start: 'from pathlib import Path\n\ndef sube_birlestir(dosyalar, hedef):\n    adet = 0\n    with open(hedef, "w", encoding="utf-8") as out:\n        # TODO: başlık satırını yaz: sube,urun,adet\n        for yol in dosyalar:\n            sube = Path(yol).stem\n            # TODO: dosyayı aç, başlığı atla, dolu satırları "sube,satir" olarak yaz\n            pass\n    return adet\n',
        sol: 'from pathlib import Path\n\ndef sube_birlestir(dosyalar, hedef):\n    adet = 0\n    with open(hedef, "w", encoding="utf-8") as out:\n        out.write("sube,urun,adet\\n")\n        for yol in dosyalar:\n            sube = Path(yol).stem\n            with open(yol, encoding="utf-8") as f:\n                next(f, None)\n                for satir in f:\n                    satir = satir.strip()\n                    if satir:\n                        out.write(f"{sube},{satir}\\n")\n                        adet += 1\n    return adet\n',
        tests: 'from pathlib import Path\nPath("x1_kadikoy.csv").write_text("urun,adet\\nkulaklik,3\\nkablo,10\\n", encoding="utf-8")\nPath("x1_cankaya.csv").write_text("urun,adet\\n\\nkulaklik,5\\n\\n", encoding="utf-8")\nPath("x1_bos.csv").write_text("urun,adet\\n", encoding="utf-8")\nn = sube_birlestir(["x1_kadikoy.csv", "x1_cankaya.csv", "x1_bos.csv"], "x1_tum.csv")\nsatirlar = Path("x1_tum.csv").read_text(encoding="utf-8").splitlines()\nassert satirlar[0] == "sube,urun,adet", "İlk satır başlık olmalı: sube,urun,adet"\nassert satirlar.count("sube,urun,adet") == 1, "Başlık yalnızca BİR kez yazılmalı; kaynakların başlıklarını atla"\nassert satirlar[1:] == ["x1_kadikoy,kulaklik,3", "x1_kadikoy,kablo,10", "x1_cankaya,kulaklik,5"], "Veri satırları sube adıyla (uzantısız) ve boş satırlar atlanarak yazılmalı, gelen: " + str(satirlar[1:])\nassert n == 3, "Döndürülen değer yazılan veri satırı sayısı (3) olmalı, gelen: " + str(n)\n',
        hints: [
          'Başlığı döngüden ÖNCE bir kez yaz; kaynak dosyaların ilk satırını atla.',
          'Path(yol).stem uzantısız adı verir; next(f, None) dosyanın ilk satırını tüketir.',
          'Döngü: for satir in f: satir = satir.strip(); if satir: out.write(f"{sube},{satir}\\n"); adet += 1'
        ],
        why: 'Başlık bir kez, veriler kaynak adıyla etiketlenerek yazılır. Kaynak adını sütun olarak eklemek, birleşik veride izlenebilirlik sağlar.' },
      { t: 'code',
        id: 'dosya-islemleri-x2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>ayar_oku(yol)</code> fonksiyonunu yaz. Dosyada <code>anahtar=değer</code> satırları var. Kurallar:</p><ul><li>Boş satırları ve <code>#</code> ile başlayan (baştaki boşluklar atıldıktan sonra) yorum satırlarını atla.</li><li>Satırı yalnızca <b>ilk</b> <code>=</code> işaretinden böl; anahtar ve değerin kenar boşluklarını temizle.</li><li>Sözlük döndür (değerler metin kalsın).</li></ul>',
        guide: [
          'Dosyayı with ve encoding="utf-8" ile aç, boş bir sözlük oluştur.',
          'Her satırı strip() et; boşsa ya da "#" ile başlıyorsa continue.',
          'satir.split("=", 1) ile anahtar ve değere ayır.',
          'İkisini de strip() edip sözlüğe koy; sonunda sözlüğü döndür.'
        ],
        example: 'satir = "  sunucu_adi =  db.anadolu.local  "\nanahtar, deger = satir.strip().split("=", 1)\nprint(repr(anahtar.strip()), repr(deger.strip()))\nprint("baglanti=host=x;port=5".split("=", 1))   # yalnız ilk = noktasından\n',
        start: 'def ayar_oku(yol):\n    ayarlar = {}\n    with open(yol, encoding="utf-8") as f:\n        for satir in f:\n            satir = satir.strip()\n            # TODO: boş ya da # ile başlayan satırı atla\n            # TODO: ilk = noktasından böl, temizle, sözlüğe ekle\n            pass\n    return ayarlar\n',
        sol: 'def ayar_oku(yol):\n    ayarlar = {}\n    with open(yol, encoding="utf-8") as f:\n        for satir in f:\n            satir = satir.strip()\n            if not satir or satir.startswith("#"):\n                continue\n            anahtar, deger = satir.split("=", 1)\n            ayarlar[anahtar.strip()] = deger.strip()\n    return ayarlar\n',
        tests: 'metin = "# Ilgaz Bank rapor ayarları\\nsube = Kadıköy\\n\\n   # eski: sube=Ankara\\nesik=1000\\nbaglanti = host=db;port=5432\\n"\nopen("x2_ayar.cfg", "w", encoding="utf-8").write(metin)\na = ayar_oku("x2_ayar.cfg")\nassert isinstance(a, dict), "Sözlük döndürmelisin"\nassert a.get("sube") == "Kadıköy", "sube değeri kenar boşlukları temizlenmiş \'Kadıköy\' olmalı"\nassert a.get("esik") == "1000", "Değerler metin olarak kalmalı: \'1000\'"\nassert a.get("baglanti") == "host=db;port=5432", "Değerin içindeki = korunmalı: split(\'=\', 1) kullan"\nassert len(a) == 3, "Yorumlar (girintili olanlar dahil) ve boş satırlar atlanmalı; 3 anahtar bekleniyor, gelen: " + str(list(a))\n',
        hints: [
          'İki ayrı kontrol: satır boş mu, satır "#" ile mi başlıyor (strip SONRASI)?',
          'split("=", 1) en fazla bir kez böler, iki parça döner.',
          'anahtar, deger = satir.split("=", 1); ayarlar[anahtar.strip()] = deger.strip()'
        ],
        why: 'Önce strip, sonra boş/yorum kontrolü; böylece girintili yorumlar da atlanır. maxsplit=1, değerin içindeki = işaretlerini korur.' },
      { t: 'code',
        id: 'dosya-islemleri-x3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>klasor_ozeti(klasor)</code> fonksiyonunu yaz: verilen klasördeki <b>yalnız <code>.csv</code></b> dosyalarını bulup <code>{uzantısız_ad: veri_satırı_sayısı}</code> sözlüğü döndürsün. Veri satırı = başlık hariç, boş olmayan satır. Sözlüğün anahtarları alfabetik sırada eklensin.</p>',
        guide: [
          'Path(klasor).glob("*.csv") ile yalnız CSV dosyalarını bul; sorted() ile sırala.',
          'Her dosyayı read_text ile oku ve splitlines() ile satırlara böl.',
          'İlk satırı (başlık) at, kalanlarda strip() sonrası dolu olanları say.',
          'Sonucu dosya.stem anahtarıyla sözlüğe koy.'
        ],
        example: 'from pathlib import Path\nd = Path("ornek_klasor"); d.mkdir(exist_ok=True)\n(d / "a.txt").write_text("x\\ny\\n", encoding="utf-8")\n(d / "b.log").write_text("z\\n", encoding="utf-8")\nfor p in sorted(d.glob("*.txt")):\n    print(p.stem, len(p.read_text(encoding="utf-8").splitlines()))\n',
        start: 'from pathlib import Path\n\ndef klasor_ozeti(klasor):\n    ozet = {}\n    # TODO: Path(klasor).glob("*.csv") sonucunu sıralayıp dolaş\n    # TODO: her dosyada başlık hariç dolu satırları say, ozet[dosya.stem] = sayi\n    return ozet\n',
        sol: 'from pathlib import Path\n\ndef klasor_ozeti(klasor):\n    ozet = {}\n    for dosya in sorted(Path(klasor).glob("*.csv")):\n        satirlar = dosya.read_text(encoding="utf-8").splitlines()\n        ozet[dosya.stem] = sum(1 for s in satirlar[1:] if s.strip())\n    return ozet\n',
        tests: 'from pathlib import Path\nd = Path("x3_gelen_klasor"); d.mkdir(exist_ok=True)\nfor eski in d.iterdir():\n    eski.unlink()\n(d / "izmir.csv").write_text("id,tutar\\n1,10\\n2,20\\n\\n", encoding="utf-8")\n(d / "ankara.csv").write_text("id,tutar\\n1,5\\n", encoding="utf-8")\n(d / "bos.csv").write_text("id,tutar\\n", encoding="utf-8")\n(d / "notlar.txt").write_text("id,tutar\\n1,99\\n", encoding="utf-8")\no = klasor_ozeti("x3_gelen_klasor")\nassert "notlar" not in o, "Yalnız .csv dosyaları sayılmalı; notlar.txt atlanmalı"\nassert o == {"ankara": 1, "bos": 0, "izmir": 2}, "Beklenen {\'ankara\': 1, \'bos\': 0, \'izmir\': 2}: başlık ve boş satırlar sayılmaz. Gelen: " + str(o)\nassert list(o) == ["ankara", "bos", "izmir"], "Anahtarlar alfabetik sırada eklenmeli (sorted ile dolaş)"\n',
        hints: [
          'glob deseni "*.csv" yalnız CSV dosyalarını getirir; sırası garanti değildir, sorted kullan.',
          'satirlar[1:] başlığı atlar; sum(1 for s in ... if s.strip()) dolu satırları sayar.',
          'ozet[dosya.stem] = sum(1 for s in satirlar[1:] if s.strip())'
        ],
        why: 'glob filtreler, sorted deterministik sıra verir, stem anahtarı okunur bir rapor sağlar. Boş dosya da 0 ile raporlanır; "dosya geldi ama boş" bilgisi değerlidir.' },
      { t: 'code',
        id: 'dosya-islemleri-x4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Türkçe Excel\'in ürettiği CSV\'yi oku. <code>excel_csv_oku(yol)</code> fonksiyonu: dosya BOM\'lu olabilir (<code>utf-8-sig</code> kullan), ayırıcı <code>;</code>, başlık <code>id;musteri;tutar</code>. Her satırı sözlük yap; <code>id</code> int, <code>tutar</code> float olsun. Tutar Türkçe biçimde gelir: <code>1.250,50</code> → <code>1250.5</code>. Boş satırları atla, sözlük listesi döndür.</p>',
        sol: 'def excel_csv_oku(yol):\n    kayitlar = []\n    with open(yol, encoding="utf-8-sig") as f:\n        basliklar = f.readline().strip().split(";")\n        for satir in f:\n            satir = satir.strip()\n            if not satir:\n                continue\n            k = dict(zip(basliklar, satir.split(";")))\n            k["id"] = int(k["id"])\n            k["tutar"] = float(k["tutar"].replace(".", "").replace(",", "."))\n            kayitlar.append(k)\n    return kayitlar\n',
        tests: 'with open("x4_excel.csv", "w", encoding="utf-8-sig") as f:\n    f.write("id;musteri;tutar\\n1;Ayşe Yılmaz;1.250,50\\n\\n2;Mert Kaya;89,90\\n3;Şule Ak;12.000\\n")\nk = excel_csv_oku("x4_excel.csv")\nassert len(k) == 3, "Boş satır atlanınca 3 kayıt kalmalı"\nassert "id" in k[0], "İlk anahtar \'id\' olmalı; \'\\\\ufeffid\' görüyorsan utf-8-sig kullan"\nassert k[0]["id"] == 1 and isinstance(k[0]["id"], int), "id int olmalı"\nassert k[0]["tutar"] == 1250.5, "1.250,50 → 1250.5 olmalı: önce binlik noktayı sil, sonra virgülü noktaya çevir"\nassert k[1]["tutar"] == 89.9, "89,90 → 89.9 olmalı"\nassert k[2]["tutar"] == 12000.0, "12.000 → 12000.0 olmalı (nokta binlik ayırıcı)"\nassert k[2]["musteri"] == "Şule Ak", "Türkçe karakterler korunmalı"\n',
        hints: ['utf-8-sig BOM\'u otomatik atlar; başlığı readline ile al ve ";" ile böl.', 'Sayı çevirisinde sıra önemli: replace(".", "") SONRA replace(",", ".").'],
        why: 'Excel uyumluluğu için üç dönüşüm gerekir: BOM\'suz okuma, doğru ayırıcı ve yerel sayı biçimini Python biçimine çevirme. Sıra ters olursa 1.250,50 → 1.250.50 olur ve float hata verir.' },
      { t: 'code',
        id: 'dosya-islemleri-x5',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Raporların üzerine yazılmasın diye adlarına tarih eklenecek. <code>tarihli_ad(yol, tarih)</code> fonksiyonu, yolun klasörünü ve uzantısını koruyarak adın sonuna <code>_tarih</code> eklesin ve sonucu <b>eğik çizgili metin</b> (<code>as_posix()</code>) olarak döndürsün.</p><p>Örnek: <code>tarihli_ad("cikti/rapor.txt", "2026-10-28")</code> → <code>"cikti/rapor_2026-10-28.txt"</code></p>',
        sol: 'from pathlib import Path\n\ndef tarihli_ad(yol, tarih):\n    p = Path(yol)\n    return p.with_name(f"{p.stem}_{tarih}{p.suffix}").as_posix()\n',
        tests: 'assert tarihli_ad("cikti/rapor.txt", "2026-10-28") == "cikti/rapor_2026-10-28.txt", "Klasör ve uzantı korunmalı"\nassert tarihli_ad("ozet.csv", "2026-01-05") == "ozet_2026-01-05.csv", "Klasörsüz yol da çalışmalı"\nassert tarihli_ad("arsiv/2026/satis.v2.csv", "x") == "arsiv/2026/satis.v2_x.csv", "Çok noktalı adda yalnız SON uzantı ayrılmalı (stem/suffix kullan, split(\'.\') değil)"\nassert tarihli_ad("veri/README", "t") == "veri/README_t", "Uzantısız dosyada da çalışmalı"\n',
        hints: ['Path(yol).stem ve .suffix ile adı ve uzantıyı ayrı al.', 'p.with_name(yeni_ad) aynı klasörde yeni bir yol üretir; .as_posix() ile metne çevir.'],
        why: 'with_name klasörü korur; stem ve suffix çok noktalı adlarda bile doğru ayrım yapar. split(".") ile yapılan çözümler "satis.v2.csv" gibi adlarda bozulur.' },
      { t: 'code',
        id: 'dosya-islemleri-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>rapor_yaz(yol, ciro)</code> şehir→ciro sözlüğünü her satıra <code>Şehir;1830.00</code> biçiminde (2 ondalık) yazmalı. Ama program TypeError veriyor; düzeltsen bile tüm şehirler tek satıra yapışıyor.</p>',
        start: 'def rapor_yaz(yol, ciro):\n    with open(yol, "w", encoding="utf-8") as f:\n        for sehir, tutar in ciro.items():\n            f.write(sehir + ";" + tutar)\n',
        sol: 'def rapor_yaz(yol, ciro):\n    with open(yol, "w", encoding="utf-8") as f:\n        for sehir, tutar in ciro.items():\n            f.write(f"{sehir};{tutar:.2f}\\n")\n',
        tests: 'rapor_yaz("x6_ciro.txt", {"Ankara": 1830, "İzmir": 820.5})\nicerik = open("x6_ciro.txt", encoding="utf-8").read()\nassert icerik.splitlines() == ["Ankara;1830.00", "İzmir;820.50"], "Her şehir ayrı satırda ve 2 ondalıkla yazılmalı, gelen: " + repr(icerik)\nassert icerik.endswith("\\n"), "write satır sonu eklemez; her satırın sonuna \\\\n koy"\n',
        hints: ['write yalnız str kabul eder; sayıyı metne çevir (f-string en temizi).', 'write, print gibi satır sonu eklemez: f"{sehir};{tutar:.2f}\\n"'],
        why: 'İki klasik hata: write\'a sayı vermek (TypeError) ve satır sonunu unutmak. f-string ikisini birden çözer ve biçimi (.2f) de belirler.' },
      { t: 'code',
        id: 'dosya-islemleri-x7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>kayitlari_kaydet(yol, kayitlar)</code> her kaydı dosyaya ayrı satır olarak yazmalı ve dosyadaki <b>önceki içeriği silmeli</b> (yeni gün, yeni dosya). Ama dosyada hep yalnızca son kayıt kalıyor.</p>',
        start: 'def kayitlari_kaydet(yol, kayitlar):\n    for kayit in kayitlar:\n        with open(yol, "w", encoding="utf-8") as f:\n            f.write(kayit + "\\n")\n',
        sol: 'def kayitlari_kaydet(yol, kayitlar):\n    with open(yol, "w", encoding="utf-8") as f:\n        for kayit in kayitlar:\n            f.write(kayit + "\\n")\n',
        tests: 'open("x7_gun.txt", "w", encoding="utf-8").write("dünden kalan\\n")\nkayitlari_kaydet("x7_gun.txt", ["1001 Ayşe", "1002 Can", "1003 Elif"])\ns = open("x7_gun.txt", encoding="utf-8").read().splitlines()\nassert "dünden kalan" not in s, "Önceki içerik silinmeli (\'w\' kipi doğru, ama dosya bir kez açılmalı)"\nassert s == ["1001 Ayşe", "1002 Can", "1003 Elif"], "Üç kaydın hepsi sırayla yazılmalı, gelen: " + str(s)\nkayitlari_kaydet("x7_gun.txt", [])\nassert open("x7_gun.txt", encoding="utf-8").read() == "", "Boş listede dosya boşaltılmalı (yine de bir kez \'w\' ile açılmalı)"\n',
        hints: ['"w" kipi dosyayı her AÇILIŞTA siler. Kaç kez açılıyor?', 'with satırını döngünün DIŞINA (üstüne) taşı.'],
        why: 'Döngü içinde "w" ile açmak her turda dosyayı sıfırlar; sadece son kayıt kalır. Dosyayı bir kez aç, döngüyle yaz. "a" kullanmak da çözüm değil: o zaman dünkü içerik silinmez.' },
      { t: 'code',
        id: 'dosya-islemleri-x8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Linux\'taki <code>tail</code> komutunu yaz: <code>son_satirlar(yol, n)</code> dosyanın <b>boş olmayan son n satırını</b> (sondaki <code>\\n</code> temizlenmiş, sırası korunmuş) liste olarak döndürsün.</p><ul><li>Dosya çok büyük olabilir: <code>read()</code> ya da <code>readlines()</code> kullanma, satır satır oku ve bellekte en fazla n satır tut (<code>collections.deque(maxlen=n)</code> işini görür).</li><li><code>n &lt;= 0</code> ise <code>[]</code>; dosya yoksa <code>[]</code> döndür.</li></ul>',
        sol: 'from collections import deque\n\ndef son_satirlar(yol, n):\n    if n <= 0:\n        return []\n    try:\n        with open(yol, encoding="utf-8") as f:\n            son = deque((s.rstrip("\\n") for s in f if s.strip()), maxlen=n)\n    except FileNotFoundError:\n        return []\n    return list(son)\n',
        tests: 'with open("x8_buyuk.log", "w", encoding="utf-8") as f:\n    for i in range(1, 1001):\n        f.write(f"satır {i}\\n")\n        if i % 100 == 0:\n            f.write("\\n")\nassert son_satirlar("x8_buyuk.log", 3) == ["satır 998", "satır 999", "satır 1000"], "Son 3 dolu satır sırasıyla dönmeli (boş satırlar sayılmaz)"\nassert son_satirlar("x8_buyuk.log", 0) == [], "n=0 ise boş liste"\nassert son_satirlar("x8_buyuk.log", -2) == [], "Negatif n için boş liste"\nopen("x8_kisa.log", "w", encoding="utf-8").write("a\\nb\\n")\nassert son_satirlar("x8_kisa.log", 10) == ["a", "b"], "Dosya n\'den kısaysa tüm satırlar dönmeli"\nassert son_satirlar("x8_olmayan_dosya.log", 5) == [], "Dosya yoksa boş liste dönmeli"\n_kod = __source__.replace(" ", "")\nassert ".read()" not in _kod and "readlines" not in _kod, "Büyük dosyada tümünü belleğe alma: read()/readlines() kullanma, satır satır oku"\n',
        hints: [
          'deque(maxlen=n) dolunca en eski elemanı kendisi atar; sonunda elinde son n eleman kalır.',
          'deque(üreteç, maxlen=n) tek satırda olur; dosya yokluğunu try/except FileNotFoundError ile yakala.',
          'n <= 0 kontrolünü en başta yap: deque(maxlen=0) her şeyi atar ama negatif maxlen ValueError verir.'
        ],
        why: 'deque(maxlen=n) bellekte yalnız n satır tutar; dosya bir milyon satır da olsa bellek sabit kalır. Kenar durumlar (n<=0, kısa dosya, olmayan dosya) iş betiklerinin sessizce çökmesini önler.' }
    ],
    faq: [
      { q: 'os.path mi pathlib mi kullanmalıyım?',
        a: 'Yeni kodda pathlib. Path nesnesi / ile birleşir, name/stem/suffix gibi parçaları hazır verir ve Windows/Linux farkını kendisi çözer. Eski kodlarda os.path.join, os.path.basename görürsen karşılıkları: Path / "x", p.name. open() iki türü de kabul eder.' },
      { q: 'Bende çalışan betik sunucuda "FileNotFoundError" veriyor, neden?',
        a: 'Göreli yollar çalışma klasörüne göre çözülür; sunucuda (zamanlanmış görev, cron) çalışma klasörü farklıdır. Yolu betiğin konumuna göre kur: Path(__file__).parent / "veri" / "x.csv". Tanı için Path.cwd() ve Path(yol).resolve() yazdır.' },
      { q: 'write ile print(file=f) arasında ne fark var?',
        a: 'write yalnız str alır, satır sonu eklemez ve yazılan karakter sayısını döndürür. print birden çok değeri (sayı dahil) boşlukla birleştirir ve sonuna \\n ekler. Hızlı rapor satırları için print(..., file=f) pratiktir.' }
    ],
    mistakes: [
      { bad: 'for kayit in kayitlar:\n    with open("gun.txt", "w", encoding="utf-8") as f:\n        f.write(kayit + "\\n")',
        good: 'with open("gun.txt", "w", encoding="utf-8") as f:\n    for kayit in kayitlar:\n        f.write(kayit + "\\n")',
        why: 'Döngü içinde "w" ile açmak dosyayı her turda sıfırlar; yalnız son kayıt kalır. Dosyayı bir kez aç.' },
      { bad: 'with open("excel.csv", encoding="utf-8") as f:\n    basliklar = f.readline().strip().split(",")',
        good: 'with open("excel.csv", encoding="utf-8-sig") as f:\n    basliklar = f.readline().strip().split(";")',
        why: 'Türkçe Excel CSV\'si BOM ile başlar ve ; ile ayrılır. utf-8 ile okursan ilk başlık "\\ufeffid" olur, virgülle bölersen her satır tek alan kalır.' }
    ]
  }
);
})(window);
