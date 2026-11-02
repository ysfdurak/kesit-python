/* PythonPatika — v2/o4: Komut satırı araçları (orta / Otomasyon ve Araçlar) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'cli-araclari',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 50,
  title: 'Komut satırı araçları: argparse, click, rich ve boru hatları',
  sum: 'Betiklerini gerçek komut satırı aracına dönüştürürsün: argparse ile alt komut, tür, seçenek ve grup; click ve typer ile kısa CLI; rich ile tablo; stdin/stdout, çıkış kodları ve yapılandırma önceliğiyle boru hattına uyumlu araç yazarsın.',
  goals: [
    'argparse ile konumsal argüman, seçenek, tür dönüşümü, choices, nargs, bayrak ve alt komut tanımlayabilirim.',
    'parse_args\'a liste vererek CLI\'ımı test edebilir, click\'te CliRunner kullanabilirim.',
    'stdin\'den okuyan, sonucu stdout\'a, günlüğü stderr\'e yazan ve doğru çıkış kodu dönen araçlar yazabilirim.',
    'Yapılandırmayı argüman > ortam değişkeni > dosya > varsayılan önceliğiyle birleştirebilirim.',
    'rich ile okunur tablolar üretip click/typer ile argparse arasında bilinçli seçim yapabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in operasyon ekibi her sabah üç betik çalıştırıyor: stok uyarısı, kargo gecikme raporu, iade özeti. Betiklerin içinde sabit yazılmış dosya adları ve eşik değerleri var; bir şeyi değiştirmek için kodu açmak gerekiyor. Bir <b>komut satırı arayüzü</b> (CLI, command-line interface) ile aynı betik şöyle kullanılır: <code>stok-uyar satis.csv --esik 5 --bicim json</code>. Artık kodu açmadan farklı dosya ve eşikle çalışır, zamanlanmış görevlere (cron) ve CI hatlarına eklenir, başka araçlarla boru (pipe) ile birleşir.</p>
<p><code>sys.argv</code> ve temel argparse'ı standart kütüphane dersinde görmüştün; paketlemedeki "entry point" kısmını ileri seviyede göreceksin. Bu ders ikisinin arasındaki boşluğu doldurur: <b>kullanıcı dostu, test edilebilir ve otomasyona uygun</b> bir CLI nasıl tasarlanır?</p>

<h2>Bir komutun anatomisi</h2>
<pre class="code">$ stok  ekle    AM-101    --adet 3   --depo izmir   -v
  │     │       │         │          │              └─ kısa bayrak (flag)
  │     │       │         │          └─ seçenek + değer (option)
  │     │       │         └─ seçenek + değer
  │     │       └─ konumsal argüman (positional)
  │     └─ alt komut (subcommand)
  └─ program</pre>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>argparse</th><th>Örnek</th></tr>
<tr><td>Konumsal argüman</td><td><code>add_argument("dosya")</code></td><td><code>rapor satis.csv</code></td></tr>
<tr><td>Seçenek</td><td><code>add_argument("--limit", type=int, default=10)</code></td><td><code>--limit 5</code></td></tr>
<tr><td>Bayrak</td><td><code>add_argument("--ozet", action="store_true")</code></td><td><code>--ozet</code></td></tr>
<tr><td>Sınırlı seçim</td><td><code>choices=["csv", "json"]</code></td><td><code>--bicim json</code></td></tr>
<tr><td>Çok değer</td><td><code>nargs="+"</code> (en az 1), <code>"*"</code> (0+), <code>"?"</code> (0/1), <code>2</code></td><td><code>--sehir İzmir Bursa</code></td></tr>
<tr><td>Sayaç</td><td><code>action="count"</code></td><td><code>-vv</code> → 2</td></tr>
<tr><td>Tekrarlanan</td><td><code>action="append"</code></td><td><code>--etiket a --etiket b</code></td></tr>
</table></div>

<h2>argparse ileri: türler, seçimler, varsayılanlar</h2>
<p><code>parse_args()</code> argümansız çağrılınca <code>sys.argv[1:]</code>'i okur. Ona bir <b>liste</b> verirsen terminal olmadan test edebilirsin; bu derste hep bunu yapacağız.</p>
<pre class="py">import argparse

parser = argparse.ArgumentParser(prog="rapor", description="Anadolu Market satış raporu üretir.")
parser.add_argument("dosya", help="Satış CSV dosyası (stdin için -)")
parser.add_argument("--sehir", choices=["İzmir", "Ankara", "Bursa"], help="Yalnız bu şehir")
parser.add_argument("--limit", type=int, default=10, metavar="N", help="En fazla N satır (varsayılan: %(default)s)")
parser.add_argument("--ozet", action="store_true", help="Yalnızca toplamları göster")
parser.add_argument("-v", "--verbose", action="count", default=0, help="Ayrıntı düzeyi (-v, -vv)")
parser.add_argument("--etiket", nargs="*", default=[], help="Bir ya da daha çok etiket")

args = parser.parse_args(["satis.csv", "--sehir", "İzmir", "--limit", "5", "-vv", "--etiket", "kampanya", "ekim"])
print(args)
print(args.limit + 1, args.ozet, args.verbose)
print(vars(args)["etiket"])</pre>
<ul>
<li><code>type=</code> dönüşümü argparse yapar ve hatalı değerde kullanıcıya düzgün bir hata mesajı gösterir. Kendi fonksiyonunu da verebilirsin; geçersiz değerde <code>argparse.ArgumentTypeError</code> fırlatmalıdır.</li>
<li>Seçenek adındaki tire, nitelik adında alt çizgiye döner: <code>--min-stok</code> → <code>args.min_stok</code>.</li>
<li>Hatalı girdide argparse kullanım bilgisini <b>stderr</b>'e yazar ve <code>SystemExit(2)</code> fırlatır. <code>--help</code> ise yardım metnini basıp <code>SystemExit(0)</code> fırlatır.</li>
</ul>
<pre class="py">import argparse

def pozitif_int(metin):
    try:
        n = int(metin)
    except ValueError:
        raise argparse.ArgumentTypeError(f"tam sayı değil: {metin!r}")
    if n &lt;= 0:
        raise argparse.ArgumentTypeError(f"pozitif olmalı: {n}")
    return n

p = argparse.ArgumentParser(prog="stok")
p.add_argument("--adet", type=pozitif_int, required=True)
grup = p.add_mutually_exclusive_group()
grup.add_argument("--json", action="store_true")
grup.add_argument("--csv", action="store_true")

print(p.parse_args(["--adet", "3", "--json"]))
for hatali in (["--adet", "-2"], ["--adet", "1", "--json", "--csv"]):
    try:
        p.parse_args(hatali)
    except SystemExit as e:
        print("çıkış kodu:", e.code)</pre>
<p><b>Birbirini dışlayan grup</b> (mutually exclusive group), aynı anda verilmemesi gereken seçenekleri (<code>--json</code> ile <code>--csv</code>, <code>--sessiz</code> ile <code>--ayrinti</code>) argparse düzeyinde engeller; kendi <code>if</code> kontrollerini yazmana gerek kalmaz.</p>

<h3>Alt komutlar</h3>
<p><code>git commit</code>, <code>pip install</code> gibi araçlar alt komut kullanır. argparse'ta her alt komut kendi ayrıştırıcısına sahiptir; <code>set_defaults(func=...)</code> ile her alt komutu bir fonksiyona bağlamak en temiz kalıptır.</p>
<pre class="py">import argparse

STOK = {"AM-101": 4, "AM-102": 12}

def ekle(args):
    STOK[args.sku] = STOK.get(args.sku, 0) + args.adet
    print(f"{args.sku}: {STOK[args.sku]}")
    return 0

def listele(args):
    for sku, adet in sorted(STOK.items()):
        if args.az is None or adet &lt;= args.az:
            print(sku, adet)
    return 0

def main(argv=None):
    parser = argparse.ArgumentParser(prog="stok")
    alt = parser.add_subparsers(dest="komut", required=True)
    p_ekle = alt.add_parser("ekle", help="Stoğa ürün ekle")
    p_ekle.add_argument("sku")
    p_ekle.add_argument("--adet", type=int, default=1)
    p_ekle.set_defaults(func=ekle)
    p_liste = alt.add_parser("listele", help="Stoğu listele")
    p_liste.add_argument("--az", type=int, metavar="N", help="Adedi N ve altındakiler")
    p_liste.set_defaults(func=listele)
    args = parser.parse_args(argv)
    return args.func(args)

print("kod:", main(["ekle", "AM-101", "--adet", "3"]))
print("kod:", main(["listele", "--az", "10"]))</pre>

<h2>Unix felsefesi: stdin, stdout, stderr ve çıkış kodu</h2>
<p>İyi bir CLI başka araçlarla birleşebilir. Bunun dört kuralı vardır:</p>
<div class="tbl-wrap"><table>
<tr><th>Kanal</th><th>Ne yazılır?</th><th>Python</th></tr>
<tr><td>stdin</td><td>Girdi verisi (dosya yerine boru ile)</td><td><code>sys.stdin</code>; dosya adı <code>-</code> ise stdin oku</td></tr>
<tr><td>stdout</td><td>Yalnızca <b>sonuç verisi</b></td><td><code>print(...)</code></td></tr>
<tr><td>stderr</td><td>Uyarı, ilerleme, hata, günlük</td><td><code>print(..., file=sys.stderr)</code>, <code>logging</code></td></tr>
<tr><td>Çıkış kodu</td><td>0 başarı; 0 dışı hata</td><td><code>sys.exit(main())</code></td></tr>
</table></div>
<pre class="code">$ cat siparisler.csv | python stok_uyar.py - --esik 5 --bicim csv &gt; kritik.csv
$ echo $?            # 0: kritik ürün yok, 3: kritik ürün var, 2: kullanım hatası
$ python stok_uyar.py siparisler.csv 2&gt;hatalar.log | sort -t, -k3 -n</pre>
<p>Günlük mesajlarını stdout'a yazarsan <code>&gt; kritik.csv</code> dosyası bozulur, bir sonraki araç "Uyarı: ..." satırını veri sanır. Çıkış kodu ise cron'un, CI'ın ve kabuk betiklerinin "başarılı mı?" sorusunu yanıtlar. Yaygın sözleşme: <code>0</code> başarı, <code>1</code> genel hata, <code>2</code> kullanım hatası (argparse'ın kullandığı), <code>130</code> Ctrl+C ile kesilme.</p>
<pre class="py">import io
import sys

def sayilari_topla(akis, hata=sys.stderr):
    toplam, atlanan = 0.0, 0
    for no, satir in enumerate(akis, start=1):
        satir = satir.strip()
        if not satir or satir.startswith("#"):
            continue
        try:
            toplam += float(satir.replace(",", "."))
        except ValueError:
            atlanan += 1
            print(f"uyarı: {no}. satır sayı değil: {satir!r}", file=hata)
    return toplam, atlanan

sahte_stdin = io.StringIO("# günlük tahsilat\\n120,5\\n80\\n\\nyok\\n49.5\\n")
sahte_stderr = io.StringIO()
print(sayilari_topla(sahte_stdin, sahte_stderr))
print("stderr'e giden:", sahte_stderr.getvalue().strip())</pre>
<div class="tip"><b>Akışı parametre yap</b>Fonksiyonların <code>sys.stdin</code>/<code>sys.stdout</code>'a doğrudan dokunmak yerine akışı parametre olarak alsın (<code>akis=sys.stdin</code>). Böylece testte <code>io.StringIO</code> verirsin; üretimde varsayılan değer kullanılır.</div>
<pre class="code">import sys

def main(argv=None) -&gt; int:
    ...                      # argparse, iş mantığı
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("iptal edildi", file=sys.stderr)
        sys.exit(130)</pre>

<h2>Yapılandırma önceliği</h2>
<p>Gerçek araçlarda bir ayar dört yerden gelebilir. Kabul görmüş öncelik sırası: <b>komut satırı argümanı &gt; ortam değişkeni &gt; yapılandırma dosyası &gt; varsayılan</b>. En özel ve en geçici olan kazanır. <code>collections.ChainMap</code> bu katmanlamayı tek satırda yapar; ancak argparse'ın verilmemiş seçenekler için koyduğu <code>None</code> değerlerini önce süzmelisin.</p>
<pre class="py">from collections import ChainMap

varsayilan = {"esik": 5, "bicim": "tablo", "renk": True}
dosya = {"esik": 10, "renk": False}                       # ör. ~/.stokrc (TOML/JSON)
ortam_ham = {"STOK_BICIM": "json", "PATH": "/usr/bin"}
ortam = {k[5:].lower(): v for k, v in ortam_ham.items() if k.startswith("STOK_")}
argumanlar = {"esik": 3, "bicim": None}                   # argparse çıktısı (vars(args))
argumanlar = {k: v for k, v in argumanlar.items() if v is not None}

ayar = ChainMap(argumanlar, ortam, dosya, varsayilan)
print(dict(ayar))
print(ayar.maps.index(next(m for m in ayar.maps if "renk" in m)), "→ renk dosyadan geldi")</pre>
<div class="warn"><b>Ortam değişkenleri hep metindir</b><code>STOK_ESIK=7</code> Python'a <code>"7"</code> olarak gelir; <code>STOK_RENK=false</code> ise boş olmayan bir metin olduğu için <code>bool("false")</code> <b>True</b> verir. Ortamdan gelen değeri varsayılanın türüne göre açıkça çevir.</div>

<h2>click ve typer: daha az kodla CLI</h2>
<p><b>click</b>, seçenekleri dekoratörlerle tanımlar; renkli çıktı, onay soruları, dosya türleri ve en önemlisi test için <code>CliRunner</code> sunar. Tarayıcı motorunda da çalışır:</p>
<pre class="py">import click
from click.testing import CliRunner

@click.command()
@click.argument("sehir")
@click.option("--esik", type=float, default=0.0, show_default=True, help="En düşük tutar")
@click.option("--detay", is_flag=True, help="Her siparişi listele")
def ozet(sehir, esik, detay):
    """Bir şehrin sipariş özetini yazar."""
    siparisler = [("AM-1", "İzmir", 1200.0), ("AM-2", "İzmir", 80.0), ("AM-3", "Bursa", 500.0)]
    secilen = [s for s in siparisler if s[1] == sehir and s[2] &gt;= esik]
    if detay:
        for no, _, tutar in secilen:
            click.echo(f"  {no}: {tutar:.2f}")
    click.echo(f"{sehir}: {len(secilen)} sipariş, {sum(s[2] for s in secilen):.2f} TL")

runner = CliRunner()
sonuc = runner.invoke(ozet, ["İzmir", "--esik", "100", "--detay"])
print(sonuc.exit_code)
print(sonuc.output)
print(runner.invoke(ozet, ["İzmir", "--esik", "yüz"]).exit_code)</pre>
<p><b>typer</b> ise click'in üzerine kurulu ve tip ipuçlarından CLI üretir: fonksiyon imzası arayüzün kendisidir. Tarayıcıda yüklü değildir; kendi bilgisayarında dene.</p>
<pre class="code">import typer

app = typer.Typer(help="Anadolu Market stok aracı")

@app.command()
def uyar(dosya: str, esik: int = 5, bicim: str = "tablo", ayrinti: bool = False):
    """Stoğu eşiğin altındaki ürünleri listeler."""
    typer.echo(f"{dosya} okunuyor, eşik={esik}, biçim={bicim}")

@app.command()
def ekle(sku: str, adet: int = typer.Option(1, min=1)):
    typer.echo(f"{sku} +{adet}")

if __name__ == "__main__":
    app()          # python stok.py uyar satis.csv --esik 3 --ayrinti</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install typer rich</code> (click typer ile birlikte gelir). <code>python stok.py --help</code> ile otomatik yardım sayfasını gör; typer ayrıca kabuk tamamlama (shell completion) kurulumunu da sunar.</div>
<div class="tbl-wrap"><table>
<tr><th></th><th>argparse</th><th>click</th><th>typer</th></tr>
<tr><td>Kurulum</td><td>Standart kütüphane</td><td><code>pip install click</code></td><td><code>pip install typer</code></td></tr>
<tr><td>Tanım biçimi</td><td>Ayrıştırıcı nesnesi</td><td>Dekoratörler</td><td>Tip ipuçları</td></tr>
<tr><td>Test</td><td><code>parse_args(liste)</code></td><td><code>CliRunner</code></td><td><code>typer.testing.CliRunner</code></td></tr>
<tr><td>Ne zaman?</td><td>Bağımlılık istemeyen betikler, kütüphaneler</td><td>Büyük, çok komutlu araçlar</td><td>Hızlı, modern, tip odaklı araçlar</td></tr>
</table></div>

<h2>rich: okunur terminal çıktısı</h2>
<p><b>rich</b> renkli metin, tablo, ilerleme çubuğu ve güzel hata izleri üretir. <code>Console(file=io.StringIO())</code> ile çıktıyı bir metne yönlendirip test edebilirsin; terminal olmayan bir dosyaya yazarken renk kodu üretmez.</p>
<pre class="py">import io
from rich.console import Console
from rich.table import Table

tablo = Table(title="Kritik stok — İzmir deposu")
tablo.add_column("SKU", style="bold")
tablo.add_column("Ürün")
tablo.add_column("Adet", justify="right")
for sku, ad, adet in [("AM-101", "Çay bardağı", 2), ("AM-207", "Demlik", 0), ("AM-310", "Kupa", 4)]:
    tablo.add_row(sku, ad, str(adet), style="red" if adet == 0 else None)

konsol = Console(file=io.StringIO(), width=50)
konsol.print(tablo)
print(konsol.file.getvalue())</pre>
<pre class="code">from rich.progress import track
import time

for dosya in track(["ocak.csv", "subat.csv", "mart.csv"], description="İşleniyor..."):
    time.sleep(0.5)</pre>
<p>İlerleme çubukları ve renkler <b>stderr</b>'e ya da yalnızca terminale gitmelidir: <code>Console(stderr=True)</code>. Çıktı bir dosyaya ya da boruya yönlendirildiğinde (<code>sys.stdout.isatty()</code> False) süslemeyi kapatıp düz CSV/JSON üretmek iyi bir CLI'ın işaretidir.</p>

<div class="note"><b>Gerçek işte</b>Bir belediyenin bilgi işlem ekibi su faturası tahakkuk betiğini <code>tahakkuk hesapla --donem 2026-10 --mahalle Konak --kuru-calistir</code> biçiminde bir CLI'a çevirdi. <code>--kuru-calistir</code> (dry-run) veritabanına yazmadan ne yapılacağını gösteriyor; çıkış kodları gece çalışan zamanlayıcıya hatayı bildiriyor; tüm ayarlar <code>TAHAKKUK_*</code> ortam değişkenlerinden de verilebildiği için aynı araç test ve canlı ortamda kod değişmeden çalışıyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İyi CLI tasarımı kontrol listesi</h3>
<ul>
<li><b>Tahmin edilebilir adlar:</b> <code>--output/-o</code>, <code>--verbose/-v</code>, <code>--quiet/-q</code>, <code>--dry-run</code>, <code>--force</code>, <code>--version</code> gibi alışılmış seçenekleri aynı anlamda kullan.</li>
<li><b>Tehlikeli işlemde onay:</b> silme/üzerine yazma için onay iste; otomasyon için <code>--yes</code> ile atlanabilsin.</li>
<li><b>Idempotent çalıştırma:</b> aynı komutu iki kez çalıştırmak ikinci kez zarar vermesin (aynı raporu ikinci kez eklememek gibi).</li>
<li><b>Makine okunur çıktı:</b> insanlar için tablo, makineler için <code>--json</code>; JSON'u stdout'a, açıklamaları stderr'e yaz.</li>
<li><b>Anlamlı hata mesajı:</b> ne oldu, neden, ne yapmalı: "satis.csv bulunamadı; yolu kontrol et ya da - ile stdin'den ver".</li>
</ul>
<h3>Paket olarak kurulum</h3>
<p><code>pyproject.toml</code> içindeki <code>[project.scripts]</code> bölümüne <code>stok = "stokaraci.cli:main"</code> yazınca <code>pip install .</code> sonrası <code>stok</code> komutu her yerde çalışır. Bu bağlantıyı ileri seviyedeki paketleme dersinde kuracaksın; <code>main(argv=None) -&gt; int</code> imzası bu yüzden önemlidir.</p>
<h3>Test stratejisi</h3>
<p>İş mantığını saf fonksiyonlarda tut, CLI katmanı yalnızca ayrıştırsın ve çağırsın. CLI testlerinde <code>main([...])</code>'i çağır, çıkış kodunu ve <code>io.StringIO</code>'ya yönlendirilen stdout/stderr'i denetle; pytest kullanıyorsan <code>capsys</code> ve <code>monkeypatch.setenv</code> bu işi kolaylaştırır.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: '<code>parser.add_argument("--sehir", nargs="+")</code> tanımıyla <code>--sehir İzmir Bursa</code> verilirse <code>args.sehir</code> ne olur?',
      o: ['"İzmir Bursa"', '["İzmir", "Bursa"]', '"İzmir" (Bursa yok sayılır)', 'Hata: seçenek tek değer alır'], a: 1,
      why: 'nargs="+" en az bir değer toplar ve sonucu liste olarak verir. nargs="*" sıfır ya da daha çok, "?" sıfır ya da bir değer demektir. nargs verilmezse seçenek tek değer alır.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Gece çalışan stok betiğin veritabanına bağlanamadı. Zamanlayıcının (cron/CI) hatayı fark etmesi için ne yapmalısın?',
      o: ['Hatayı stdout\'a yazıp 0 ile çıkmak', 'Hiçbir şey yazmadan 0 ile çıkmak', 'Hata mesajını stderr\'e yazıp 0 dışı bir kodla çıkmak', 'Hata mesajını bir dosyaya yazıp çıkmak'], a: 2,
      why: 'Otomasyon araçları başarıyı çıkış koduna bakarak anlar: 0 başarı, 0 dışı hata. Mesaj stderr\'e gider ki stdout\'taki veri bozulmasın. Yalnızca dosyaya yazmak kimseyi uyarmaz.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Bir ayar hem varsayılanda (5), hem yapılandırma dosyasında (10), hem <code>STOK_ESIK=7</code> ortam değişkeninde, hem de <code>--esik 3</code> argümanında verilmiş. Yaygın öncelik kuralına göre hangisi kullanılır?',
      o: ['10', '7', '5', '3'], a: 3,
      why: 'Öncelik: argüman > ortam > dosya > varsayılan. En özel ve en geçici kaynak kazanır; kullanıcı komutu yazarken açıkça bir değer verdiyse ona uyulur.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import argparse\np = argparse.ArgumentParser()\np.add_argument("dosya")\np.add_argument("--limit", type=int, default=10)\np.add_argument("--ozet", action="store_true")\na = p.parse_args(["satis.csv", "--limit", "5"])\nprint(a.dosya, a.limit * 2, a.ozet)\n',
      o: ['satis.csv 55 False', 'satis.csv 10 None', 'satis.csv 20 False', 'satis.csv 10 False'], a: 3,
      why: 'type=int sayesinde "5" sayıya döner; 5 * 2 = 10 (type olmasaydı "55" olurdu). store_true bayrağı verilmediğinde varsayılan olarak False\'tur, None değil.' },
    { t: 'predict', stage: 'Kodu oku', raises: true,
      q: 'Bu kod çalışınca ne olur?',
      code: 'import argparse\np = argparse.ArgumentParser(prog="rapor")\np.add_argument("--sehir", choices=["İzmir", "Ankara"])\nargs = p.parse_args(["--sehir", "Rize"])\nprint(args.sehir)\n',
      o: ['Rize yazdırır', 'None yazdırır', 'ValueError hatası', 'SystemExit (kod 2) ile çıkar'], a: 3,
      why: 'choices dışındaki değerde argparse stderr\'e "invalid choice" mesajını ve kullanım satırını yazar, sonra sys.exit(2) çağırır (SystemExit). Testte bunu try/except SystemExit ile yakalarsın.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from collections import ChainMap\nvarsayilan = {"limit": 10, "bicim": "tablo", "renk": True}\ndosya = {"limit": 50, "renk": False}\nortam = {"bicim": "json"}\narguman = {"limit": 5}\nayar = ChainMap(arguman, ortam, dosya, varsayilan)\nprint(ayar["limit"], ayar["bicim"], ayar["renk"])\n',
      o: ['5 json False', '50 json False', '10 tablo True', '5 tablo True'], a: 0,
      why: 'ChainMap anahtarı soldan sağa sözlüklerde arar ve ilk bulduğunu verir: limit argümandan (5), bicim ortamdan (json), renk dosyadan (False).' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Alt komutlu bir ayrıştırıcı kurup <code>ekle AM-7</code> komutunu çözen kodu sırala. Çıktı <code>ekle AM-7</code> olmalı.</p>',
      lines: ['import argparse', 'parser = argparse.ArgumentParser(prog="stok")', 'alt = parser.add_subparsers(dest="komut", required=True)', 'ekle = alt.add_parser("ekle")', 'ekle.add_argument("sku")', 'args = parser.parse_args(["ekle", "AM-7"])', 'print(args.komut, args.sku)'],
      expect: 'ekle AM-7\n',
      hint: 'Alt ayrıştırıcılar ana ayrıştırıcıdan, alt komut ayrıştırıcısı da add_subparsers sonucundan türetilir. Argümanlar parse_args\'tan önce tanımlanmalı.',
      why: 'Zincir: ana ayrıştırıcı → add_subparsers → add_parser("ekle") → ekle\'ye argüman. dest="komut" hangi alt komutun seçildiğini args.komut\'a yazar.' },
    { t: 'code', stage: 'Rehberli', id: 'cli-araclari-1', diff: 1,
      q: '<p><code>parser_olustur()</code> fonksiyonunu yaz; şu özelliklerde bir <code>argparse.ArgumentParser</code> döndürsün (<code>prog="rapor"</code>):</p><ul><li>Konumsal <code>dosya</code>.</li><li><code>--sehir</code>: yalnızca <code>"İzmir"</code>, <code>"Ankara"</code>, <code>"Bursa"</code>; varsayılan <code>None</code>.</li><li><code>--limit</code>: tam sayı, varsayılan <code>10</code>.</li><li><code>--ozet</code>: bayrak (verilirse <code>True</code>).</li><li><code>-v</code>/<code>--verbose</code>: sayaç, varsayılan <code>0</code>.</li><li><code>--etiket</code>: sıfır ya da daha çok değer, varsayılan <code>[]</code>.</li></ul>',
      guide: ['ArgumentParser(prog="rapor") oluştur.', 'Konumsal argüman için yalnızca adı ver: add_argument("dosya").', '--sehir için choices, --limit için type=int ve default=10 kullan.', '--ozet için action="store_true", -v için action="count" ve default=0.', '--etiket için nargs="*" ve default=[]; ayrıştırıcıyı döndür.'],
      example: '# Benzer teknik: yedekleme aracı ayrıştırıcısı\nimport argparse\np = argparse.ArgumentParser(prog="yedek")\np.add_argument("kaynak")\np.add_argument("--sikistir", choices=["zip", "gz"], default="zip")\np.add_argument("--gun", type=int, default=7)\np.add_argument("--kuru", action="store_true")\nprint(p.parse_args(["/veri", "--gun", "3"]))\n',
      start: 'import argparse\n\ndef parser_olustur():\n    p = argparse.ArgumentParser(prog="rapor")\n    p.add_argument("dosya")\n    # TODO: --sehir (choices), --limit (int, 10), --ozet (bayrak)\n    # TODO: -v/--verbose (sayaç), --etiket (nargs="*")\n    return p\n',
      sol: 'import argparse\n\ndef parser_olustur():\n    p = argparse.ArgumentParser(prog="rapor")\n    p.add_argument("dosya")\n    p.add_argument("--sehir", choices=["İzmir", "Ankara", "Bursa"])\n    p.add_argument("--limit", type=int, default=10)\n    p.add_argument("--ozet", action="store_true")\n    p.add_argument("-v", "--verbose", action="count", default=0)\n    p.add_argument("--etiket", nargs="*", default=[])\n    return p\n',
      tests: 'p = parser_olustur()\na = p.parse_args(["satis.csv"])\nassert (a.dosya, a.sehir, a.limit, a.ozet, a.verbose, a.etiket) == ("satis.csv", None, 10, False, 0, []), "varsayılanlar: None, 10, False, 0, []; bulunan: " + str(vars(a))\nb = p.parse_args(["x.csv", "--sehir", "Bursa", "--limit", "3", "--ozet", "-vv", "--etiket", "a", "b"])\nassert b.sehir == "Bursa" and b.limit == 3, "--limit int\'e çevrilmeli"\nassert b.ozet is True and b.verbose == 2, "--ozet True, -vv 2 olmalı"\nassert b.etiket == ["a", "b"], "--etiket liste toplamalı"\nassert p.parse_args(["x", "--verbose"]).verbose == 1, "uzun ad --verbose da çalışmalı"\nimport contextlib, io\nfor hatali in (["x", "--sehir", "Rize"], ["x", "--limit", "on"], []):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()):\n            p.parse_args(hatali)\n        assert False, f"{hatali} için SystemExit bekleniyordu"\n    except SystemExit as e:\n        assert e.code == 2, "kullanım hatası kodu 2 olmalı"\n',
      hints: ['Her özellik add_argument\'ın bir parametresidir: choices, type, default, action, nargs.', 'Kısa ve uzun ad birlikte: add_argument("-v", "--verbose", action="count", default=0).', 'nargs="*" verilmediğinde varsayılan None olur; default=[] ver.'],
      why: 'argparse tür dönüşümü, seçim denetimi ve hata mesajını senin yerine yapar. Ayrıştırıcıyı bir fonksiyonda kurmak onu test edilebilir kılar: parse_args\'a liste verip sonuçları denetlersin.' },
    { t: 'code', stage: 'Rehberli', id: 'cli-araclari-2', diff: 2,
      q: '<p><code>ayar_coz(arguman, ortam, dosya, varsayilan)</code> fonksiyonunu yaz: <code>varsayilan</code>\'daki her anahtar için son değeri bulup sözlük döndürsün. Öncelik: <code>arguman</code> (değer <code>None</code> değilse) &gt; <code>ortam</code> (anahtar <code>"RAPOR_" + ad.upper()</code>) &gt; <code>dosya</code> &gt; <code>varsayilan</code>. Ortamdan gelen metni varsayılanın türüne çevir: <code>bool</code> için <code>"1"</code>, <code>"true"</code>, <code>"evet"</code>, <code>"yes"</code> (büyük/küçük harf duyarsız) <code>True</code>, diğer her şey <code>False</code>; <code>int</code> ve <code>float</code> için ilgili dönüşüm; <code>str</code> olduğu gibi.</p>',
      guide: ['Sonuç sözlüğünü varsayilan\'ın anahtarları üzerinden kur.', 'Önce arguman.get(ad) None değil mi diye bak.', 'Sonra ortam anahtarını "RAPOR_" + ad.upper() olarak ara; bulursan türe göre çeviren yardımcıyı çağır.', 'Yoksa dosya\'ya, o da yoksa varsayilan\'a düş.', 'bool kontrolünü int\'ten önce yap (bool, int\'in alt sınıfıdır).'],
      example: '# Benzer teknik: metni örnek değerin türüne çevirmek\ndef cevir(metin, ornek):\n    if isinstance(ornek, bool):\n        return metin.lower() in ("1", "true")\n    return type(ornek)(metin)\nprint(cevir("42", 0), cevir("TRUE", False), cevir("2.5", 1.0))\n',
      start: 'def _cevir(metin, ornek):\n    # TODO: bool / int / float / str dönüşümü\n    return metin\n\ndef ayar_coz(arguman, ortam, dosya, varsayilan):\n    sonuc = {}\n    for ad, vars_deger in varsayilan.items():\n        # TODO: arguman > ortam > dosya > varsayilan\n        sonuc[ad] = vars_deger\n    return sonuc\n',
      sol: 'DOGRU = {"1", "true", "evet", "yes"}\n\ndef _cevir(metin, ornek):\n    if isinstance(ornek, bool):\n        return metin.strip().lower() in DOGRU\n    if isinstance(ornek, int):\n        return int(metin)\n    if isinstance(ornek, float):\n        return float(metin)\n    return metin\n\ndef ayar_coz(arguman, ortam, dosya, varsayilan):\n    sonuc = {}\n    for ad, vars_deger in varsayilan.items():\n        anahtar = "RAPOR_" + ad.upper()\n        if arguman.get(ad) is not None:\n            sonuc[ad] = arguman[ad]\n        elif anahtar in ortam:\n            sonuc[ad] = _cevir(ortam[anahtar], vars_deger)\n        elif ad in dosya:\n            sonuc[ad] = dosya[ad]\n        else:\n            sonuc[ad] = vars_deger\n    return sonuc\n',
      tests: 'vars_ = {"esik": 5, "bicim": "tablo", "renk": True, "oran": 0.1, "limit": 100}\nr = ayar_coz({"esik": 3, "bicim": None}, {"RAPOR_BICIM": "json", "RAPOR_RENK": "false", "RAPOR_ORAN": "0.25", "PATH": "/bin"}, {"esik": 10, "limit": 50, "renk": True}, vars_)\nassert r == {"esik": 3, "bicim": "json", "renk": False, "oran": 0.25, "limit": 50}, "öncelik ya da tür dönüşümü hatalı: " + str(r)\nassert isinstance(r["oran"], float), "ortamdan gelen oran float olmalı"\nassert ayar_coz({}, {"RAPOR_RENK": "EVET"}, {}, {"renk": False})["renk"] is True, "EVET True sayılmalı"\nassert ayar_coz({}, {"RAPOR_ESIK": "7"}, {"esik": 9}, {"esik": 5})["esik"] == 7, "ortam dosyadan önceliklidir ve int\'e çevrilmeli"\nassert ayar_coz({"esik": 0}, {"RAPOR_ESIK": "7"}, {}, {"esik": 5})["esik"] == 0, "0 geçerli bir argümandır, None değildir"\nassert ayar_coz({}, {}, {}, {"x": 1}) == {"x": 1}\n',
      hints: ['"false" boş olmayan bir metin olduğu için bool("false") True verir; bu yüzden özel liste gerekir.', 'isinstance(True, int) True döner: bool kontrolü önce gelmeli.', 'arguman.get(ad) is not None — "if arguman.get(ad)" yazarsan 0 değeri kaybolur.'],
      why: 'Bu katmanlama 12-faktör uygulamalarının ve çoğu kurumsal aracın temelidir: aynı kod geliştirici makinesinde dosyadan, sunucuda ortamdan, elle çalıştırmada argümandan ayar alır. Tür dönüşümü ve None/0 ayrımı en sık hata kaynaklarıdır.' },
    { t: 'code', stage: 'Rehberli', id: 'cli-araclari-3', diff: 2,
      q: '<p>click ile <code>ozet</code> komutunu yaz. Hazır verilen <code>SIPARISLER</code> listesini kullanarak:</p><ul><li>Zorunlu <code>--sehir</code> seçeneği (metin).</li><li><code>--esik</code>: float, varsayılan <code>0</code>; tutarı bundan küçük siparişler sayılmasın.</li><li><code>--detay</code>: bayrak; verilirse önce her sipariş için <code>"  AM-1: 1200.00"</code> biçiminde satır yaz.</li><li>Son satır: <code>"İzmir: 2 sipariş, 1280.00 TL"</code> biçiminde.</li></ul><p>Çıktıyı <code>click.echo</code> ile yaz. Testler <code>CliRunner</code> ile çalışır.</p>',
      guide: ['@click.command() dekoratörüyle fonksiyonu komut yap.', '@click.option("--sehir", required=True), @click.option("--esik", type=float, default=0.0), @click.option("--detay", is_flag=True) ekle.', 'Fonksiyon parametreleri seçenek adlarıyla aynı olmalı: def ozet(sehir, esik, detay).', 'Siparişleri şehre ve eşiğe göre süz, detay varsa satır satır yaz, sonra özet satırını yaz.'],
      example: '# Benzer teknik: click ile selamlama komutu ve testi\nimport click\nfrom click.testing import CliRunner\n\n@click.command()\n@click.option("--ad", required=True)\n@click.option("--tekrar", type=int, default=1)\n@click.option("--bagir", is_flag=True)\ndef selam(ad, tekrar, bagir):\n    metin = f"Merhaba {ad}"\n    for _ in range(tekrar):\n        click.echo(metin.upper() if bagir else metin)\n\nprint(CliRunner().invoke(selam, ["--ad", "Ece", "--tekrar", "2", "--bagir"]).output)\n',
      start: 'import click\n\nSIPARISLER = [("AM-1", "İzmir", 1200.0), ("AM-2", "İzmir", 80.0), ("AM-3", "Bursa", 500.0), ("AM-4", "İzmir", 40.0)]\n\n# TODO: @click.command() ve üç seçenek\ndef ozet(sehir, esik, detay):\n    # TODO: süz, detay satırları, özet satırı (click.echo)\n    pass\n',
      sol: 'import click\n\nSIPARISLER = [("AM-1", "İzmir", 1200.0), ("AM-2", "İzmir", 80.0), ("AM-3", "Bursa", 500.0), ("AM-4", "İzmir", 40.0)]\n\n@click.command()\n@click.option("--sehir", required=True)\n@click.option("--esik", type=float, default=0.0)\n@click.option("--detay", is_flag=True)\ndef ozet(sehir, esik, detay):\n    secilen = [s for s in SIPARISLER if s[1] == sehir and s[2] >= esik]\n    if detay:\n        for no, _, tutar in secilen:\n            click.echo(f"  {no}: {tutar:.2f}")\n    toplam = sum(s[2] for s in secilen)\n    click.echo(f"{sehir}: {len(secilen)} sipariş, {toplam:.2f} TL")\n',
      tests: 'from click.testing import CliRunner\nimport click\nassert isinstance(ozet, click.Command), "ozet bir click komutu olmalı (@click.command())"\nr = CliRunner()\ns = r.invoke(ozet, ["--sehir", "İzmir", "--esik", "50"])\nassert s.exit_code == 0, "başarılı çalışma 0 ile bitmeli: " + s.output\nassert s.output == "İzmir: 2 sipariş, 1280.00 TL\\n", "eşik 50 ile AM-4 düşmeli; bulunan: " + repr(s.output)\nd = r.invoke(ozet, ["--sehir", "İzmir", "--detay"])\nassert d.output.splitlines() == ["  AM-1: 1200.00", "  AM-2: 80.00", "  AM-4: 40.00", "İzmir: 3 sipariş, 1320.00 TL"], "detay satırları ve özet: " + repr(d.output)\nassert r.invoke(ozet, ["--sehir", "Van"]).output == "Van: 0 sipariş, 0.00 TL\\n", "eşleşme yoksa 0 sipariş"\nassert r.invoke(ozet, []).exit_code == 2, "--sehir zorunlu; verilmezse kullanım hatası (2)"\nassert r.invoke(ozet, ["--sehir", "İzmir", "--esik", "elli"]).exit_code == 2, "--esik float olmalı"\n',
      hints: ['Seçenekler fonksiyonun üstüne, @click.command()\'ın altına yazılır.', 'required=True zorunluluk, type=float dönüşüm, is_flag=True bayrak sağlar.', 'click.echo(f"{sehir}: {len(secilen)} sipariş, {toplam:.2f} TL")'],
      why: 'click seçenek tanımını, tür dönüşümünü, zorunluluk denetimini ve hata kodunu (2) dekoratörlerle halleder. CliRunner komutu gerçek bir terminal olmadan çağırıp çıktıyı ve çıkış kodunu verir; CLI testi için idealdir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'cli-araclari-4', diff: 2,
      q: '<p>Alt komutlu stok aracı. <code>main(argv, stok)</code> fonksiyonunu yaz (stok: <code>{sku: adet}</code> sözlüğü, yerinde değişir). Çıkış kodunu döndürsün:</p><ul><li><code>ekle SKU [--adet N]</code> (N varsayılan 1): stoğu artırır, <code>"AM-7: 5"</code> biçiminde yeni adedi yazar, 0 döner.</li><li><code>dus SKU --adet N</code> (zorunlu): stok yetmezse ya da SKU yoksa stderr\'e <code>"yetersiz stok: AM-7"</code> yazar ve <b>1</b> döner; yeterse düşer, yeni adedi yazar, 0 döner.</li><li><code>listele [--az N]</code>: SKU\'ya göre sıralı <code>"AM-7 5"</code> satırları (N verilmişse yalnız adedi N ve altı), 0 döner.</li><li>argparse kullanım hatasında (bilinmeyen komut, eksik argüman) <b>2</b> dönsün (SystemExit\'i yakala).</li></ul>',
      start: 'import argparse\nimport sys\n\ndef main(argv, stok):\n    pass\n',
      sol: 'import argparse\nimport sys\n\ndef main(argv, stok):\n    p = argparse.ArgumentParser(prog="stok")\n    alt = p.add_subparsers(dest="komut", required=True)\n    e = alt.add_parser("ekle")\n    e.add_argument("sku")\n    e.add_argument("--adet", type=int, default=1)\n    d = alt.add_parser("dus")\n    d.add_argument("sku")\n    d.add_argument("--adet", type=int, required=True)\n    l = alt.add_parser("listele")\n    l.add_argument("--az", type=int)\n    try:\n        args = p.parse_args(argv)\n    except SystemExit as hata:\n        return hata.code if isinstance(hata.code, int) else 2\n    if args.komut == "ekle":\n        stok[args.sku] = stok.get(args.sku, 0) + args.adet\n        print(f"{args.sku}: {stok[args.sku]}")\n    elif args.komut == "dus":\n        if stok.get(args.sku, 0) < args.adet:\n            print(f"yetersiz stok: {args.sku}", file=sys.stderr)\n            return 1\n        stok[args.sku] -= args.adet\n        print(f"{args.sku}: {stok[args.sku]}")\n    else:\n        for sku in sorted(stok):\n            if args.az is None or stok[sku] <= args.az:\n                print(sku, stok[sku])\n    return 0\n',
      tests: 'import io, contextlib\ndef calistir(argv, stok):\n    o, e = io.StringIO(), io.StringIO()\n    with contextlib.redirect_stdout(o), contextlib.redirect_stderr(e):\n        kod = main(argv, stok)\n    return kod, o.getvalue(), e.getvalue()\nS = {"AM-2": 12, "AM-1": 4}\nassert calistir(["ekle", "AM-1", "--adet", "3"], S) == (0, "AM-1: 7\\n", ""), "ekle: yeni adet yazılmalı, kod 0"\nassert calistir(["ekle", "AM-9"], S)[1] == "AM-9: 1\\n", "varsayılan adet 1"\nk, o, e = calistir(["dus", "AM-1", "--adet", "10"], S)\nassert k == 1 and o == "" and "yetersiz stok: AM-1" in e, "yetersiz stokta stderr mesajı ve kod 1"\nassert S["AM-1"] == 7, "başarısız düşüm stoğu değiştirmemeli"\nassert calistir(["dus", "AM-2", "--adet", "2"], S)[:2] == (0, "AM-2: 10\\n")\nassert calistir(["listele"], S)[1] == "AM-1 7\\nAM-2 10\\nAM-9 1\\n", "SKU\'ya göre sıralı liste"\nassert calistir(["listele", "--az", "7"], S)[1] == "AM-1 7\\nAM-9 1\\n", "--az filtresi (7 dahil)"\nassert calistir(["sat", "AM-1"], S)[0] == 2, "bilinmeyen komut kod 2"\nassert calistir(["dus", "AM-1"], S)[0] == 2, "zorunlu --adet eksikse kod 2"\n',
      hints: ['Her alt komut için alt.add_parser; zorunlu seçenek için required=True.', 'parse_args\'ı try/except SystemExit içine al; e.code kullanım hatasında 2\'dir.', 'Hata mesajını print(..., file=sys.stderr) ile yaz.'],
      why: 'main(argv) -> int imzası CLI\'ı hem terminalde (sys.exit(main(sys.argv[1:], stok))) hem testte kullanılabilir kılar. Başarısız işlemde durumu değiştirmemek ve doğru çıkış kodunu dönmek otomasyon güvenliğinin temelidir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'cli-araclari-5', diff: 2,
      q: '<p>Boru hattına uyumlu girdi. İki fonksiyon yaz:</p><ul><li><code>kaynak_ac(yol, stdin)</code>: <code>yol == "-"</code> ise <code>stdin</code>\'i, değilse <code>open(yol, encoding="utf-8")</code> ile açılmış dosyayı döndürsün.</li><li><code>tutarlari_topla(akis, hata)</code>: akıştaki satırları okusun; boş satırları ve <code>#</code> ile başlayanları atlasın; kalanları Türkçe ya da İngilizce ondalıkla sayıya çevirsin (<code>"120,5"</code> ve <code>"49.5"</code>); çevrilemeyen satır için <code>hata</code> akışına <code>"uyarı: N. satır atlandı"</code> (N satır numarası, 1\'den) yazsın. <code>(toplam, atlanan_sayisi)</code> döndürsün; toplam 2 basamağa yuvarlansın.</li></ul>',
      start: 'def kaynak_ac(yol, stdin):\n    pass\n\ndef tutarlari_topla(akis, hata):\n    pass\n',
      sol: 'def kaynak_ac(yol, stdin):\n    if yol == "-":\n        return stdin\n    return open(yol, encoding="utf-8")\n\ndef tutarlari_topla(akis, hata):\n    toplam, atlanan = 0.0, 0\n    for no, satir in enumerate(akis, start=1):\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        try:\n            toplam += float(satir.replace(",", "."))\n        except ValueError:\n            atlanan += 1\n            print(f"uyarı: {no}. satır atlandı", file=hata)\n    return round(toplam, 2), atlanan\n',
      tests: 'import io\nsahte_in = io.StringIO("# tahsilat\\n120,5\\n\\nyok\\n49.5\\n  30  \\nx1\\n")\nhata = io.StringIO()\nassert kaynak_ac("-", sahte_in) is sahte_in, "- verilince stdin kullanılmalı"\nassert tutarlari_topla(sahte_in, hata) == (200.0, 2), "120,5 + 49.5 + 30 = 200.0; 2 satır atlanmalı"\nassert hata.getvalue().splitlines() == ["uyarı: 4. satır atlandı", "uyarı: 7. satır atlandı"], "satır numaraları 1\'den sayılmalı ve atlanan boş/yorum satırları da sayıya dahil olmalı: " + repr(hata.getvalue())\nwith open("tahsilat.txt", "w", encoding="utf-8") as f:\n    f.write("10\\n20,25\\n")\nwith kaynak_ac("tahsilat.txt", None) as f:\n    assert tutarlari_topla(f, io.StringIO()) == (30.25, 0), "dosyadan okuma da çalışmalı"\n',
      hints: ['enumerate(akis, start=1) satır numarası verir; atlanan satırlar da sayılmaya devam eder.', 'replace(",", ".") hem "120,5" hem "49.5" için çalışır (binlik ayraç yok varsayımıyla).', 'print(..., file=hata) ile uyarıyı ayrı akışa yaz.'],
      why: '"-" stdin sözleşmesi aracını cat, grep, curl gibi araçlarla birleştirmeni sağlar. Uyarıların ayrı akışa gitmesi, sonucu > ile dosyaya yönlendiren kullanıcının verisini temiz tutar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'cli-araclari-6', diff: 2,
      q: '<p>rich ile rapor tablosu. <code>rapor_tablosu(satirlar, baslik)</code> fonksiyonunu yaz: <code>[("İzmir", 1200.5), ("Ankara", 950.0)]</code> gibi şehir-ciro listesini rich <code>Table</code> ile çizip <b>metin</b> olarak döndürsün. Tablo başlığı <code>baslik</code>; sütunlar <code>"Şehir"</code> ve sağa yaslı <code>"Ciro"</code>; ciro Türkçe biçimde (<code>1.200,50</code>); en altta <code>"TOPLAM"</code> satırı. Çıktıyı <code>Console(file=io.StringIO(), width=60)</code> ile üret.</p>',
      start: 'import io\nfrom rich.console import Console\nfrom rich.table import Table\n\ndef rapor_tablosu(satirlar, baslik):\n    pass\n',
      sol: 'import io\nfrom rich.console import Console\nfrom rich.table import Table\n\ndef _tr(x):\n    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")\n\ndef rapor_tablosu(satirlar, baslik):\n    tablo = Table(title=baslik)\n    tablo.add_column("Şehir")\n    tablo.add_column("Ciro", justify="right")\n    for sehir, ciro in satirlar:\n        tablo.add_row(sehir, _tr(ciro))\n    tablo.add_row("TOPLAM", _tr(sum(c for _, c in satirlar)), end_section=False)\n    konsol = Console(file=io.StringIO(), width=60)\n    konsol.print(tablo)\n    return konsol.file.getvalue()\n',
      tests: 't = rapor_tablosu([("İzmir", 1200.5), ("Ankara", 950.0), ("Bursa", 300)], "Haftalık ciro")\nassert isinstance(t, str), "metin döndürmeli"\nassert "Haftalık ciro" in t, "başlık çıktıda olmalı"\nassert "Şehir" in t and "Ciro" in t, "sütun başlıkları olmalı"\nsatir = next(s for s in t.splitlines() if "Ankara" in s)\nassert "  950,00 │" in satir, "ciro sağa yaslı ve Türkçe biçimli olmalı: " + satir\nassert "1.200,50" in t, "binlik nokta, ondalık virgül"\nson = next(s for s in t.splitlines() if "TOPLAM" in s)\nassert "2.450,50" in son, "TOPLAM satırında genel toplam olmalı: " + son\nassert "\\x1b[" not in t, "dosyaya yazarken renk kodu olmamalı"\n',
      hints: ['Table(title=...), add_column("Ciro", justify="right"), add_row(...)', 'Türkçe biçim: f"{x:,.2f}" ve geçici karakterle yer değiştirme.', 'konsol = Console(file=io.StringIO(), width=60); konsol.print(tablo); konsol.file.getvalue()'],
      why: 'rich çıktıyı bir dosya nesnesine yönlendirebildiği için tablo üretimi de test edilebilir hale gelir. Terminal olmayan bir dosyaya yazarken renk kodu üretmemesi, aynı aracın boru hattında güvenle kullanılmasını sağlar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'cli-araclari-7', diff: 2,
      q: '<p>Birbirini dışlayan seçenekler. <code>cikti_ayari(argv)</code> fonksiyonunu argparse ile yaz ve <code>(bicim, seviye)</code> döndürsün:</p><ul><li>Grup 1: <code>--json</code> ya da <code>--csv</code> (ikisi birden olamaz). Hiçbiri yoksa bicim <code>"tablo"</code>.</li><li>Grup 2: <code>-q</code>/<code>--sessiz</code> ya da <code>-v</code>/<code>--ayrinti</code> (ikisi birden olamaz). Seviye <code>"sessiz"</code>, <code>"ayrinti"</code> ya da <code>"normal"</code>.</li></ul><p>Çakışmada argparse\'ın kendi hatası (<code>SystemExit</code>, kod 2) yükselsin.</p>',
      start: 'import argparse\n\ndef cikti_ayari(argv):\n    pass\n',
      sol: 'import argparse\n\ndef cikti_ayari(argv):\n    p = argparse.ArgumentParser(prog="rapor")\n    g1 = p.add_mutually_exclusive_group()\n    g1.add_argument("--json", action="store_true")\n    g1.add_argument("--csv", action="store_true")\n    g2 = p.add_mutually_exclusive_group()\n    g2.add_argument("-q", "--sessiz", action="store_true")\n    g2.add_argument("-v", "--ayrinti", action="store_true")\n    a = p.parse_args(argv)\n    bicim = "json" if a.json else "csv" if a.csv else "tablo"\n    seviye = "sessiz" if a.sessiz else "ayrinti" if a.ayrinti else "normal"\n    return bicim, seviye\n',
      tests: 'import contextlib, io\nassert cikti_ayari([]) == ("tablo", "normal"), "varsayılan tablo ve normal"\nassert cikti_ayari(["--json", "-q"]) == ("json", "sessiz")\nassert cikti_ayari(["--csv", "--ayrinti"]) == ("csv", "ayrinti")\nassert cikti_ayari(["-v"]) == ("tablo", "ayrinti")\nfor hatali in (["--json", "--csv"], ["-q", "-v"]):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()) as e:\n            cikti_ayari(hatali)\n        assert False, f"{hatali} birlikte verilemez"\n    except SystemExit as hata:\n        assert hata.code == 2, "çakışma kullanım hatasıdır (2)"\nassert cikti_ayari(["--json", "--sessiz"]) == ("json", "sessiz"), "farklı gruplardan seçenekler birlikte verilebilir"\n',
      hints: ['p.add_mutually_exclusive_group() bir grup döndürür; seçenekleri gruba eklersin.', 'İki ayrı grup kur; farklı gruplardaki seçenekler birlikte kullanılabilir.', 'Koşullu ifade zinciri: "json" if a.json else "csv" if a.csv else "tablo"'],
      why: 'Çakışma kontrolünü argparse\'a bırakmak hem kodu kısaltır hem de kullanıcıya standart, anlaşılır bir hata mesajı ("not allowed with argument") verir.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'cli-araclari-8', diff: 1,
      q: '<p><code>filtrele(argv, siparisler)</code> ilk <code>--limit</code> kadar siparişi döndürmeli; <code>--ozet</code> verilirse yalnızca toplam tutarı döndürmeli. Ama <code>--limit 2</code> verince <code>TypeError</code> alınıyor ve <code>--ozet</code> verilmese de hep toplam dönüyor. <b>İki hatayı bul ve düzelt.</b></p>',
      start: 'import argparse\n\ndef filtrele(argv, siparisler):\n    p = argparse.ArgumentParser()\n    p.add_argument("--limit", default=10)\n    p.add_argument("--ozet", action="store_true", default=True)\n    a = p.parse_args(argv)\n    secilen = siparisler[:a.limit]\n    if a.ozet:\n        return sum(secilen)\n    return secilen\n',
      sol: 'import argparse\n\ndef filtrele(argv, siparisler):\n    p = argparse.ArgumentParser()\n    p.add_argument("--limit", type=int, default=10)\n    p.add_argument("--ozet", action="store_true")\n    a = p.parse_args(argv)\n    secilen = siparisler[:a.limit]\n    if a.ozet:\n        return sum(secilen)\n    return secilen\n',
      tests: 'S = [100, 250, 75, 40]\nassert filtrele(["--limit", "2"], S) == [100, 250], "--limit int\'e çevrilmeli ve liste dönmeli"\nassert filtrele(["--limit", "3", "--ozet"], S) == 425, "--ozet verilince toplam dönmeli"\nassert filtrele([], S) == S, "varsayılan: limit 10, özet yok"\n',
      hints: ['Komut satırından gelen her değer metindir; type= vermezsen "2" kalır.', 'store_true bayrağının varsayılanı zaten False\'tur; default=True onu hep açık yapar.', 'type=int ekle, default=True\'yu sil.'],
      why: 'type olmadan dilimleme "2" metniyle yapılmaya çalışılır ve TypeError oluşur. store_true + default=True bayrağı kullanıcının kapatamayacağı bir seçeneğe dönüştürür; bayrağı kapatmak gerekiyorsa store_false ya da BooleanOptionalAction kullanılır.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'cli-araclari-9', diff: 2,
      q: '<p><code>main(argv, stdout, stderr)</code> bir sayı alıp iki katını yazmalı. Hatalı girdide kullanıcıya mesaj gösteriyor ama zamanlayıcı hatayı hiç fark etmiyor ve <code>araç 5 &gt; sonuc.txt</code> kullanan ekip dosyada hata mesajı buluyor. Sözleşme: başarı 0, kullanım hatası (argüman yok ya da sayı değil) <b>2</b>; hata mesajı yalnızca <b>stderr</b>\'e. <b>Hataları bul ve düzelt.</b></p>',
      start: 'def main(argv, stdout, stderr):\n    try:\n        n = int(argv[0])\n    except (IndexError, ValueError):\n        print("Hata: bir tam sayı bekleniyordu", file=stdout)\n        return 0\n    print(n * 2, file=stdout)\n    return 0\n',
      sol: 'def main(argv, stdout, stderr):\n    try:\n        n = int(argv[0])\n    except (IndexError, ValueError):\n        print("Hata: bir tam sayı bekleniyordu", file=stderr)\n        return 2\n    print(n * 2, file=stdout)\n    return 0\n',
      tests: 'import io\no, e = io.StringIO(), io.StringIO()\nassert main(["21"], o, e) == 0 and o.getvalue() == "42\\n" and e.getvalue() == "", "başarı: stdout\'ta 42, kod 0"\nfor argv in ([], ["yirmi"]):\n    o, e = io.StringIO(), io.StringIO()\n    kod = main(argv, o, e)\n    assert kod == 2, f"{argv} için kullanım hatası kodu 2 olmalı, gelen {kod}"\n    assert o.getvalue() == "", "hata mesajı stdout\'a gitmemeli (yönlendirilen dosyayı bozar)"\n    assert "tam sayı" in e.getvalue(), "hata mesajı stderr\'e yazılmalı"\n',
      hints: ['Zamanlayıcı başarıyı neye bakarak anlar?', 'stdout yalnızca veri içindir; > ile dosyaya giden de odur.', 'Hata dalında file=stderr ve return 2.'],
      why: '0 ile biten bir hata, otomasyonun gözünde başarıdır; hata sessizce yayılır. Mesajı stderr\'e yazmak ise stdout\'u veri için temiz tutar: kullanıcı ekranda hatayı görür, dosyaya yalnızca geçerli sonuç gider.' },
    { t: 'code', stage: 'Meydan okuma', id: 'cli-araclari-10', diff: 3,
      q: '<p>Tarih aralığı seçeneği. <code>aralik_turu(bugun)</code> fonksiyonunu yaz: argparse\'ta <code>type=</code> olarak kullanılacak bir <b>fonksiyon döndürsün</b> (kapanış/closure). Dönen fonksiyon bir metni <code>(baslangic, bitis)</code> <code>date</code> demetine çevirsin:</p><ul><li><code>"2026-10-01..2026-10-31"</code> → iki tarih.</li><li><code>"2026-10-05"</code> → aynı gün iki kez.</li><li><code>"sonN"</code> (ör. <code>"son7"</code>) → bugün dahil son N gün: <code>(bugun - (N-1) gün, bugun)</code>; N en az 1.</li><li>Başlangıç bitişten sonraysa, biçim bozuksa ya da N &lt; 1 ise <code>argparse.ArgumentTypeError</code>.</li></ul><p>Ayrıca <code>parser_kur(bugun)</code> yaz: <code>--aralik</code> seçeneği bu türü kullansın, varsayılanı <code>"son7"</code> metni olsun (argparse varsayılan metni de türe göre çevirir).</p>',
      start: 'import argparse\nfrom datetime import date, timedelta\n\ndef aralik_turu(bugun):\n    pass\n\ndef parser_kur(bugun):\n    pass\n',
      sol: 'import argparse\nimport re\nfrom datetime import date, timedelta\n\ndef aralik_turu(bugun):\n    def _tarih(metin):\n        try:\n            return date.fromisoformat(metin.strip())\n        except ValueError:\n            raise argparse.ArgumentTypeError(f"geçersiz tarih: {metin!r}")\n\n    def cevir(metin):\n        metin = metin.strip()\n        m = re.fullmatch(r"son(\\d+)", metin)\n        if m:\n            n = int(m.group(1))\n            if n < 1:\n                raise argparse.ArgumentTypeError("son N için N en az 1 olmalı")\n            return (bugun - timedelta(days=n - 1), bugun)\n        if ".." in metin:\n            bas_m, bit_m = metin.split("..", 1)\n            bas, bit = _tarih(bas_m), _tarih(bit_m)\n        else:\n            bas = bit = _tarih(metin)\n        if bas > bit:\n            raise argparse.ArgumentTypeError(f"başlangıç bitişten sonra: {metin}")\n        return (bas, bit)\n    return cevir\n\ndef parser_kur(bugun):\n    p = argparse.ArgumentParser(prog="rapor")\n    p.add_argument("--aralik", type=aralik_turu(bugun), default="son7")\n    return p\n',
      tests: 'import argparse, contextlib, io\nfrom datetime import date\nB = date(2026, 10, 28)\nt = aralik_turu(B)\nassert t("2026-10-01..2026-10-31") == (date(2026, 10, 1), date(2026, 10, 31)), "iki tarihli aralık"\nassert t("2026-10-05") == (date(2026, 10, 5), date(2026, 10, 5)), "tek gün iki kez"\nassert t("son7") == (date(2026, 10, 22), B), "son7: bugün dahil 7 gün"\nassert t("son1") == (B, B), "son1 yalnızca bugün"\nfor kotu in ["2026-10-31..2026-10-01", "28.10.2026", "son0", "2026-13-01", "dün"]:\n    try:\n        t(kotu)\n        assert False, f"{kotu!r} için ArgumentTypeError bekleniyordu"\n    except argparse.ArgumentTypeError:\n        pass\np = parser_kur(B)\nassert p.parse_args([]).aralik == (date(2026, 10, 22), B), "varsayılan son7 metni türe göre çevrilmeli"\nassert p.parse_args(["--aralik", "son30"]).aralik[0] == date(2026, 9, 29)\ntry:\n    with contextlib.redirect_stderr(io.StringIO()) as e:\n        p.parse_args(["--aralik", "2026-10-31..2026-10-01"])\n    assert False, "geçersiz aralıkta SystemExit bekleniyordu"\nexcept SystemExit as h:\n    assert h.code == 2\n',
      hints: ['Dış fonksiyon bugun\'ü yakalar ve tek argüman alan iç fonksiyonu döndürür; argparse type= tek argümanlı çağrılabilir bekler.', 'date.fromisoformat ValueError fırlatır; onu ArgumentTypeError\'a çevir ki argparse düzgün mesaj göstersin.', 're.fullmatch(r"son(\\d+)", metin) göreli biçimi yakalar.'],
      why: 'Özel tür fonksiyonu, doğrulamayı ayrıştırma anına taşır: hatalı tarih iş mantığına hiç ulaşmaz ve kullanıcı standart argparse hatası alır. bugun\'ü parametre yapmak (datetime.now yerine) aracı deterministik ve test edilebilir kılar.' },
    { t: 'code', stage: 'Mini proje', id: 'cli-araclari-11', diff: 3,
      q: '<p>Kritik stok uyarı aracı. <code>stok_uyar(argv, stdin, stdout, stderr, ortam)</code> çıkış kodunu döndürsün:</p><ol><li>Argümanlar: konumsal <code>girdi</code> (varsayılan <code>"-"</code>, yani stdin; değilse dosya yolu), <code>--esik</code> (int), <code>--bicim</code> (<code>csv</code> ya da <code>json</code>, varsayılan <code>csv</code>). Kullanım hatasında 2 dön (stderr\'e argparse mesajı gider).</li><li>Eşik önceliği: <code>--esik</code> &gt; <code>ortam["STOK_ESIK"]</code> &gt; 5.</li><li>Girdi CSV: <code>sku,ad,adet</code> başlıklı. <code>adet</code> tam sayı değilse stderr\'e <code>"uyarı: AM-x atlandı"</code> yaz ve devam et.</li><li>Kritik ürün: <code>adet &lt; esik</code>. Adede, eşitlikte sku\'ya göre sırala.</li><li>stdout: <code>csv</code> ise <code>sku,ad,adet</code> başlıklı CSV (satır sonu <code>\\n</code>); <code>json</code> ise <code>[{"sku":..., "ad":..., "adet":...}]</code> listesi (<code>ensure_ascii=False</code>). stderr\'e <code>"N kritik ürün (eşik E)"</code> yaz.</li><li>Dönüş: kritik ürün yoksa 0, varsa 3.</li></ol>',
      start: 'import argparse\nimport csv\nimport json\n\ndef stok_uyar(argv, stdin, stdout, stderr, ortam):\n    pass\n',
      sol: 'import argparse\nimport contextlib\nimport csv\nimport json\n\ndef stok_uyar(argv, stdin, stdout, stderr, ortam):\n    p = argparse.ArgumentParser(prog="stok-uyar")\n    p.add_argument("girdi", nargs="?", default="-")\n    p.add_argument("--esik", type=int)\n    p.add_argument("--bicim", choices=["csv", "json"], default="csv")\n    try:\n        with contextlib.redirect_stderr(stderr):\n            a = p.parse_args(argv)\n    except SystemExit as h:\n        return h.code if isinstance(h.code, int) else 2\n    esik = a.esik if a.esik is not None else int(ortam.get("STOK_ESIK", 5))\n    akis = stdin if a.girdi == "-" else open(a.girdi, encoding="utf-8", newline="")\n    kritik = []\n    with contextlib.ExitStack() as yigin:\n        if akis is not stdin:\n            yigin.enter_context(akis)\n        for satir in csv.DictReader(akis):\n            try:\n                adet = int(satir["adet"])\n            except (TypeError, ValueError):\n                print(f"uyarı: {satir.get(\'sku\')} atlandı", file=stderr)\n                continue\n            if adet < esik:\n                kritik.append({"sku": satir["sku"], "ad": satir["ad"], "adet": adet})\n    kritik.sort(key=lambda k: (k["adet"], k["sku"]))\n    if a.bicim == "json":\n        stdout.write(json.dumps(kritik, ensure_ascii=False) + "\\n")\n    else:\n        w = csv.DictWriter(stdout, fieldnames=["sku", "ad", "adet"], lineterminator="\\n")\n        w.writeheader()\n        w.writerows(kritik)\n    print(f"{len(kritik)} kritik ürün (eşik {esik})", file=stderr)\n    return 3 if kritik else 0\n',
      tests: 'import io, json\nVERI = "sku,ad,adet\\nAM-3,Kupa,2\\nAM-1,Çay bardağı,0\\nAM-9,Demlik,x\\nAM-2,Tepsi,2\\nAM-5,Termos,8\\n"\ndef cal(argv, ortam=None, veri=VERI):\n    o, e = io.StringIO(), io.StringIO()\n    kod = stok_uyar(argv, io.StringIO(veri), o, e, ortam or {})\n    return kod, o.getvalue(), e.getvalue()\nk, o, e = cal([])\nassert k == 3, "kritik ürün varsa kod 3"\nassert o == "sku,ad,adet\\nAM-1,Çay bardağı,0\\nAM-2,Tepsi,2\\nAM-3,Kupa,2\\n", "adet sonra sku sıralı CSV; bulunan: " + repr(o)\nassert "uyarı: AM-9 atlandı" in e and "3 kritik ürün (eşik 5)" in e, "uyarı ve özet stderr\'de olmalı: " + repr(e)\nk, o, e = cal(["-", "--bicim", "json", "--esik", "1"])\nassert json.loads(o) == [{"sku": "AM-1", "ad": "Çay bardağı", "adet": 0}], "--esik 1 ile yalnız AM-1; JSON çıktı"\nassert "Çay" in o, "ensure_ascii=False ile Türkçe karakter korunmalı"\nassert cal([], {"STOK_ESIK": "10"})[2].endswith("4 kritik ürün (eşik 10)\\n"), "ortamdaki eşik varsayılandan önceliklidir"\nassert "eşik 3" in cal(["--esik", "3"], {"STOK_ESIK": "10"})[2], "argüman ortamdan önceliklidir"\nassert cal(["--esik", "0"])[0] == 0, "kritik yoksa kod 0"\nk, o, e = cal(["--bicim", "xml"])\nassert k == 2 and o == "" and "invalid choice" in e, "kullanım hatası: kod 2, stdout boş, mesaj stderr\'de"\nwith open("stok.csv", "w", encoding="utf-8") as f:\n    f.write("sku,ad,adet\\nAM-7,Bardak,1\\n")\nassert cal(["stok.csv"])[1] == "sku,ad,adet\\nAM-7,Bardak,1\\n", "dosya yolu verilince dosyadan okunmalı"\n',
      hints: ['Konumsal argümanı isteğe bağlı yapmak için nargs="?" ve default="-".', 'argparse hata mesajını verilen stderr\'e yönlendirmek için contextlib.redirect_stderr kullan; SystemExit\'i yakalayıp kodunu döndür.', 'CSV yazarken csv.DictWriter(stdout, fieldnames=[...], lineterminator="\\n").'],
      why: 'Bu araç iyi bir CLI\'ın tüm sözleşmelerini taşır: stdin ya da dosya, yapılandırma önceliği, veri stdout\'a, günlük stderr\'e, anlamlı çıkış kodları (0 tamam, 3 uyarı, 2 kullanım hatası). Akışları parametre almak tüm davranışı terminal olmadan test etmeni sağladı.' }
  ],
  faq: [
    { q: 'argparse, click ve typer arasında nasıl seçim yaparım?', a: 'Bağımlılık istemeyen küçük betiklerde ve kütüphanelerde argparse yeterli ve her yerde var. Çok komutlu, büyüyecek araçlarda click\'in dekoratör yapısı ve CliRunner\'ı çok rahattır. Tip ipuçlarını zaten yazıyorsan typer en az kodla en iyi yardım sayfasını üretir. Üçünde de iş mantığını CLI katmanından ayrı tutmak geçişi kolaylaştırır.' },
    { q: 'Betiğimi neden python betik.py yerine doğrudan komut olarak çalıştıramıyorum?', a: 'Komut olarak çalışması için paket olarak kurulması (pyproject.toml\'da [project.scripts]) ya da Linux/macOS\'ta dosyanın başına #!/usr/bin/env python3 yazılıp chmod +x ile çalıştırılabilir yapılması gerekir. Önerilen yol paketlemedir; ileri seviyede göreceksin.' },
    { q: 'Ortam değişkenini Windows\'ta ve Linux\'ta nasıl veririm?', a: 'Linux/macOS: STOK_ESIK=7 python stok.py (yalnız o komut için) ya da export STOK_ESIK=7. Windows PowerShell: $env:STOK_ESIK = "7". Windows cmd: set STOK_ESIK=7. Python\'da hepsi os.environ["STOK_ESIK"] olarak, metin halinde gelir.' },
    { q: 'Kullanıcıdan input() ile bilgi istemek kötü mü?', a: 'Etkileşimli sorular otomasyonu (cron, CI, boru hattı) kilitler. Tüm girdiyi argüman, ortam ya da dosyadan almak; onay gerekiyorsa --yes ile atlanabilir kılmak ve sys.stdin.isatty() False ise soru sormamak iyi uygulamadır.' }
  ],
  mistakes: [
    { bad: 'p.add_argument("--limit", default=10)\nsatirlar[:args.limit]', good: 'p.add_argument("--limit", type=int, default=10)', why: 'Komut satırından gelen her değer metindir; type= vermezsen "5" metni ile işlem yaparsın ve TypeError alırsın.' },
    { bad: 'print("Uyarı: 3 satır atlandı")\nprint(sonuc_csv)', good: 'print("Uyarı: 3 satır atlandı", file=sys.stderr)\nprint(sonuc_csv)', why: 'Günlük mesajları stdout\'a giderse > ile yönlendirilen veri dosyası ve boru hattındaki sonraki araç bozulur.' },
    { bad: 'except Exception as e:\n    print(e)\n# betik 0 ile biter', good: 'except Exception as e:\n    print(f"Hata: {e}", file=sys.stderr)\n    return 1', why: '0 çıkış kodu otomasyon için "başarılı" demektir; hatayı yutmak zamanlanmış görevlerin sessizce bozulmasına yol açar.' },
    { bad: 'renk = bool(os.environ.get("STOK_RENK", "true"))', good: 'renk = os.environ.get("STOK_RENK", "true").lower() in {"1", "true", "evet", "yes"}', why: 'bool("false") True\'dur; ortamdan gelen metni açıkça yorumlaman gerekir.' },
    { bad: 'p.add_argument("--json", action="store_true")\np.add_argument("--csv", action="store_true")\n# ikisi birden verilirse?', good: 'g = p.add_mutually_exclusive_group()\ng.add_argument("--json", action="store_true")\ng.add_argument("--csv", action="store_true")', why: 'Birbirini dışlayan seçenekleri gruba koymazsan çelişkili bir komut sessizce kabul edilir ve hangisinin geçerli olduğu koddaki if sırasına kalır.' }
  ]
});
})(window);
