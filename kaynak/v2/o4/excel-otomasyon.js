/* Kesit Python — v2/o4: Excel otomasyonu (orta / Otomasyon ve Araçlar) */
// needs: pandas
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'excel-otomasyon',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 50,
  title: 'Excel otomasyonu: openpyxl, pandas ve rapor üretimi',
  sum: 'Excel dosyasını kod gözüyle tanır; openpyxl ile hücre, formül, stil ve grafik yazar, pandas ile çok sayfalı rapor üretir, Türkçe sayı ve tarih biçimlerini doğru çevirirsin.',
  goals: [
    'Çalışma kitabı, sayfa ve hücre kavramlarını; A1 adresini satır/sütun numarasına ve geri çevirebilirim.',
    'openpyxl ile hücre, formül, sayı biçimi, sütun genişliği, birleştirme ve grafik içeren bir rapor yazabilirim.',
    'pandas read_excel, to_excel ve ExcelWriter ile çok sayfalı dosya okuyup yazabilirim.',
    'Türkçe ondalık (1.234,56) ve tarih biçimlerini, Excel tarih seri numaralarını doğru dönüştürebilirim.',
    'Haftalık bir Excel raporunu baştan sona otomatikleştiren adımları planlayıp kodlayabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market finans ekibinde her pazartesi aynı iş yapılıyor: satış sisteminden CSV indirilir, Excel'de açılır, şehirlere göre özet tablo hazırlanır, toplam satırına formül yazılır, başlık kalın yapılır, sütunlar genişletilir, bir grafik eklenir ve dosya yöneticilere gönderilir. Bu iş her hafta 1–2 saat sürer ve her seferinde küçük bir kopyala-yapıştır hatası riski taşır. Python ile aynı rapor birkaç saniyede, her hafta aynı biçimde ve hatasız üretilir.</p>
<p>Şirketlerin büyük kısmında veri hâlâ Excel'de yaşar: bütçe tabloları, stok sayımları, İK puantajları, belediye tahsilat listeleri. Excel'i okuyup yazabilen bir Python geliştiricisi, "veri ekibi" ile "iş birimi" arasındaki köprü olur. Bu derste iki ana aracı öğreneceksin: hücre düzeyinde kontrol için <b>openpyxl</b>, tablo düzeyinde hızlı iş için <b>pandas</b>.</p>

<h2>Excel dosyasının yapısı</h2>
<p>Bir <code>.xlsx</code> dosyası aslında içinde XML dosyaları olan bir ZIP arşividir. Kod gözüyle bakınca üç katman vardır:</p>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>İngilizcesi</th><th>openpyxl</th><th>pandas</th></tr>
<tr><td>Çalışma kitabı</td><td>workbook</td><td><code>Workbook()</code>, <code>load_workbook()</code></td><td><code>pd.ExcelFile</code>, <code>ExcelWriter</code></td></tr>
<tr><td>Sayfa</td><td>worksheet</td><td><code>wb["Özet"]</code>, <code>wb.active</code></td><td><code>sheet_name="Özet"</code></td></tr>
<tr><td>Hücre</td><td>cell</td><td><code>ws["B2"]</code>, <code>ws.cell(row=2, column=2)</code></td><td><code>df.iloc[0, 1]</code></td></tr>
<tr><td>Aralık</td><td>range</td><td><code>ws["A1:C10"]</code>, <code>iter_rows()</code></td><td><code>usecols="A:C"</code>, <code>nrows=10</code></td></tr>
</table></div>
<p>Hücre adresi (cell address) harf + sayıdır: <code>B2</code> 2. satır, 2. sütun demektir. Sütun harfleri 26 tabanlı ama sıfırsız bir sayma sistemidir: A=1 … Z=26, AA=27, AZ=52, BA=53. Bu yüzden "harfi sayıya çevir" işlemi klasik bir mülakat sorusudur ve Excel otomasyonunda sürekli lazım olur.</p>
<pre class="py">def sutun_no(harfler):
    no = 0
    for ch in harfler.upper():
        no = no * 26 + (ord(ch) - ord("A") + 1)
    return no

for h in ["A", "Z", "AA", "AZ", "BA", "XFD"]:
    print(h, "→", sutun_no(h))</pre>
<p>Son satırdaki <code>XFD</code> Excel'in en son sütunudur (16.384). Bir sayfada en fazla 1.048.576 satır bulunur; daha büyük veri için Excel doğru araç değildir.</p>

<h2>openpyxl ile rapor yazmak</h2>
<p>Aşağıdaki kod hem bilgisayarında hem de bu sayfada çalışır: dersin sonundaki "Gerçek .xlsx dosyasıyla çalışmak" bölümünde ve alıştırmalarda openpyxl tarayıcıda gerçek dosya yazar. İlk bölüm hücre modelini saf Python ile kurar, mantığı görmen için.</p>
<pre class="code">from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.chart import BarChart, Reference

wb = Workbook()
ws = wb.active
ws.title = "Şehir Özeti"

ws["A1"] = "Anadolu Market — Haftalık Ciro"
ws.merge_cells("A1:C1")                       # başlığı üç sütuna yay
ws["A1"].font = Font(size=14, bold=True)
ws["A1"].alignment = Alignment(horizontal="center")

ws.append(["Şehir", "Sipariş", "Ciro"])       # 2. satır: başlıklar
for satir in [["İzmir", 42, 18250.5], ["Ankara", 35, 15100.0], ["Bursa", 18, 7420.75]]:
    ws.append(satir)

ws["A6"] = "TOPLAM"
ws["B6"] = "=SUM(B3:B5)"                      # formül metin olarak yazılır
ws["C6"] = "=SUM(C3:C5)"

baslik = PatternFill("solid", fgColor="DDEBF7")
for hucre in ws[2]:                            # 2. satırın tüm hücreleri
    hucre.font = Font(bold=True)
    hucre.fill = baslik
for satir in ws.iter_rows(min_row=3, min_col=3, max_col=3):
    satir[0].number_format = "#,##0.00"        # binlik ayraç + 2 ondalık

ws.column_dimensions["A"].width = 16
ws.freeze_panes = "A3"                        # başlıklar kaydırınca sabit kalsın

grafik = BarChart()
grafik.title = "Şehre göre ciro"
veri = Reference(ws, min_col=3, min_row=2, max_row=5)
etiket = Reference(ws, min_col=1, min_row=3, max_row=5)
grafik.add_data(veri, titles_from_data=True)
grafik.set_categories(etiket)
ws.add_chart(grafik, "E2")

wb.save("haftalik_rapor.xlsx")</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Kurulum: <code>pip install openpyxl</code> (pandas ile Excel yazmak için de gerekir). Dosyayı Excel ya da LibreOffice ile açıp sonucu gör. Bu sayfada openpyxl ilk kullanımda iner (yaklaşık 270 KB); pandas ile Excel de aynı paketi kullanır.</div>
<p>Okumak için <code>load_workbook</code> kullanılır. <code>iter_rows(values_only=True)</code> hücre nesneleri yerine doğrudan değerleri demet (tuple) olarak verir; veriyi işlemenin en pratik yoludur:</p>
<pre class="code">from openpyxl import load_workbook

wb = load_workbook("stok.xlsx", data_only=True)   # formül yerine son hesaplanan değer
ws = wb["Depo"]
print(ws.max_row, ws.max_column)
for urun, adet, fiyat in ws.iter_rows(min_row=2, values_only=True):
    if adet is None:          # boş hücre None gelir
        continue
    print(urun, adet * fiyat)</pre>
<div class="warn"><b>openpyxl formül hesaplamaz</b><code>ws["B6"] = "=SUM(B3:B5)"</code> yazdığında dosyaya yalnızca formül metni gider; değeri Excel dosyayı açınca hesaplar. <code>data_only=True</code> ile okuduğunda ise Excel'in en son kaydettiği değeri görürsün. Dosyayı hiç Excel'de açılmamış (yalnız Python'la üretilmiş) bir formül hücresi <code>None</code> döner. Değere kodda ihtiyacın varsa toplamı Python'da hesapla.</div>

<h3>Hücreleri kod içinde modellemek</h3>
<p>openpyxl'in yaptığı iş özünde "adres → değer" eşlemesidir. Bunu bir sözlükle taklit edersen hem mantığı kavrar hem de raporu test edilebilir hale getirirsin: önce sözlüğü üret ve test et, en son tek bir fonksiyonla Excel'e dök.</p>
<pre class="py">def harf(n):
    s = ""
    while n &gt; 0:
        n, kalan = divmod(n - 1, 26)
        s = chr(65 + kalan) + s
    return s

satirlar = [["Şehir", "Ciro"], ["İzmir", 18250.5], ["Ankara", 15100.0]]
sayfa = {}
for r, satir in enumerate(satirlar, start=1):
    for c, deger in enumerate(satir, start=1):
        sayfa[f"{harf(c)}{r}"] = deger
son = len(satirlar)
sayfa[f"A{son + 1}"] = "TOPLAM"
sayfa[f"B{son + 1}"] = f"=SUM(B2:B{son})"
for adres, deger in sayfa.items():
    print(adres, deger)</pre>

<h2>Formüller: İngilizce ad, virgül ayraç</h2>
<p>Türkçe Excel'de <code>=TOPLA(B2;B10)</code> görürsün ama dosyanın içinde formüller her zaman <b>İngilizce ad</b> ve <b>virgül ayraç</b> ile saklanır. Excel açılırken arayüz diline çevirir. Bu yüzden openpyxl ile Türkçe formül yazarsan Excel <code>#AD?</code> (#NAME?) hatası gösterir.</p>
<div class="tbl-wrap"><table>
<tr><th>Türkçe arayüz</th><th>Dosyaya yazılacak</th><th>Örnek</th></tr>
<tr><td>TOPLA</td><td>SUM</td><td><code>=SUM(C2:C50)</code></td></tr>
<tr><td>ORTALAMA</td><td>AVERAGE</td><td><code>=AVERAGE(C2:C50)</code></td></tr>
<tr><td>EĞER</td><td>IF</td><td><code>=IF(C2&gt;1000,"Büyük","Küçük")</code></td></tr>
<tr><td>ETOPLA</td><td>SUMIF</td><td><code>=SUMIF(A:A,"İzmir",C:C)</code></td></tr>
<tr><td>EĞERSAY</td><td>COUNTIF</td><td><code>=COUNTIF(A:A,"Ankara")</code></td></tr>
<tr><td>DÜŞEYARA</td><td>VLOOKUP</td><td><code>=VLOOKUP(A2,Fiyat!A:B,2,FALSE)</code></td></tr>
</table></div>
<pre class="py">TR_EN = {"TOPLA": "SUM", "ORTALAMA": "AVERAGE", "EĞERSAY": "COUNTIF"}

def formul(islev, sutun, ilk, son):
    ad = TR_EN.get(islev.upper(), islev.upper())
    return f"={ad}({sutun}{ilk}:{sutun}{son})"

print(formul("TOPLA", "C", 2, 41))
print(formul("average", "D", 2, 41))</pre>

<h2>pandas ile Excel: tablo düzeyinde iş</h2>
<p>Hücre biçimiyle değil, veriyle ilgileniyorsan pandas çok daha kısadır. pandas'ı ileri seviyede derinlemesine göreceksin; burada Excel'e özgü kısımlar yeterli.</p>
<pre class="code">import pandas as pd

df = pd.read_excel("satislar.xlsx", sheet_name="Ekim", usecols="A:D", dtype={"musteri_no": str})
tum = pd.read_excel("satislar.xlsx", sheet_name=None)   # {sayfa_adı: DataFrame} sözlüğü
birlesik = pd.concat(tum.values(), keys=tum.keys(), names=["ay", None]).reset_index(level=0)

ozet = df.pivot_table(index="sehir", columns="kategori", values="tutar", aggfunc="sum", fill_value=0)

with pd.ExcelWriter("rapor.xlsx", engine="openpyxl") as yazici:
    df.to_excel(yazici, sheet_name="Ham Veri", index=False)
    ozet.to_excel(yazici, sheet_name="Özet")
    yazici.sheets["Özet"].column_dimensions["A"].width = 18   # openpyxl sayfasına erişim</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install pandas openpyxl</code>. pandas <code>.xlsx</code> okumak ve yazmak için arka planda openpyxl kullanır; eski <code>.xls</code> için <code>xlrd</code> gerekir.</div>
<p>Rapor üretiminin "hesap" kısmı dosya biçiminden bağımsızdır. Aynı pivot mantığını CSV ile görelim; Excel'e yazmayı dersin sonundaki görevlerde yapacaksın:</p>
<pre class="py">import io
import pandas as pd

csv_metni = """sehir,ay,tutar
İzmir,Eylül,1200
İzmir,Ekim,1500
Ankara,Ekim,900
Ankara,Ekim,300
Bursa,Eylül,450
"""
df = pd.read_csv(io.StringIO(csv_metni))
ozet = df.pivot_table(index="sehir", columns="ay", values="tutar", aggfunc="sum", fill_value=0)
print(ozet)
print(ozet.reset_index().to_csv(index=False))</pre>

<h2>openpyxl mi, xlsxwriter mı, CSV mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Okur</th><th>Yazar</th><th>Güçlü yanı</th><th>Zayıf yanı</th></tr>
<tr><td>openpyxl</td><td>Evet</td><td>Evet</td><td>Var olan dosyayı açıp değiştirme, şablon doldurma</td><td>Büyük dosyada yavaş, formül hesaplamaz</td></tr>
<tr><td>xlsxwriter</td><td>Hayır</td><td>Evet</td><td>Hızlı, zengin grafik ve koşullu biçim</td><td>Yalnız yeni dosya; var olanı düzenleyemez</td></tr>
<tr><td>pandas</td><td>Evet</td><td>Evet</td><td>Tablo dönüştürme, pivot, çok sayfa</td><td>Hücre stili için alttaki motora inmen gerekir</td></tr>
<tr><td>CSV</td><td>Evet</td><td>Evet</td><td>Evrensel, hızlı, satır satır akış</td><td>Tek sayfa, stil/formül/tip yok</td></tr>
</table></div>
<p>Kural: sistemden sisteme veri taşıyorsan <b>CSV</b> (ya da Parquet); insanların okuyacağı biçimli bir rapor üretiyorsan <b>XLSX</b>. Şirket şablonunu doldurmak gerekiyorsa openpyxl, sıfırdan büyük ve grafikli rapor için xlsxwriter (<code>pip install xlsxwriter</code>, <code>pd.ExcelWriter(..., engine="xlsxwriter")</code>).</p>

<h2>Türkçe sayı ve tarih biçimleri</h2>
<p>Excel bir sayıyı içeride her zaman sayı olarak tutar; <code>1.234,56</code> yalnızca <b>görünüştür</b> (number format). Sorun, birileri Türkçe Excel'den CSV aldığında ya da hücreye sayıyı metin olarak yapıştırdığında başlar: <code>"1.234,56"</code> metni <code>float()</code> ile çevrilemez. Doğru sıra önemlidir: önce binlik noktalarını sil, sonra ondalık virgülünü noktaya çevir.</p>
<pre class="py">def tr_coz(metin):
    temiz = metin.strip().replace("TL", "").strip()
    return float(temiz.replace(".", "").replace(",", "."))

def tr_yaz(sayi):
    s = f"{sayi:,.2f}"                       # 1,234,567.89
    return s.replace(",", "_").replace(".", ",").replace("_", ".")

print(tr_coz("1.234,56"), tr_coz("  -12,5 TL"))
print(tr_yaz(1234567.891), tr_yaz(0.5))</pre>
<p>pandas'ta aynı iş parametreyle yapılır: <code>pd.read_csv(yol, sep=";", decimal=",", thousands=".", encoding="utf-8-sig")</code>. Türkçe Excel CSV'yi noktalı virgülle ayırır, çünkü virgül ondalık işaretidir. <code>utf-8-sig</code> ise Excel'in dosya başına koyduğu BOM işaretini temizler; bunu json-csv dersinde de görmüştün.</p>
<p>Tarihler ise Excel'de <b>seri numarası</b> olarak saklanır: 1899-12-30'dan bu yana geçen gün sayısı. Bazen tarih sütunu <code>45000</code> gibi sayılarla gelir; bunu şöyle çevirirsin:</p>
<pre class="py">from datetime import date, timedelta, datetime

def excel_tarih(seri):
    return date(1899, 12, 30) + timedelta(days=int(seri))

print(excel_tarih(45000), excel_tarih(46323))
print(datetime.strptime("28.10.2026", "%d.%m.%Y").date())
print(date(2026, 10, 28).strftime("%d.%m.%Y"))</pre>
<div class="tip"><b>Biçim ve değer ayrı tutulur</b>openpyxl'de hücreye <code>date</code> nesnesi yaz ve <code>number_format = "DD.MM.YYYY"</code> ver; tarihi metin olarak yazma. Böylece Excel'de sıralama, filtre ve tarih formülleri çalışır.</div>

<h2>Büyük dosyalar</h2>
<p>openpyxl normal modda tüm dosyayı belleğe alır; 200 bin satırlık bir dosyada yüzlerce MB bellek kullanabilir. İki özel mod vardır:</p>
<ul>
<li><code>load_workbook(yol, read_only=True)</code>: satırları akış halinde okur; yalnızca <code>iter_rows</code> ile gezinirsin, hücre yazamazsın. İş bitince <code>wb.close()</code>.</li>
<li><code>Workbook(write_only=True)</code>: yalnızca <code>ws.append()</code> ile sona satır eklersin; çok hızlı ve az bellekli yazım.</li>
</ul>
<p>pandas <code>read_excel</code> parça parça (chunk) okumayı desteklemez. Düzenli gelen büyük Excel dosyalarını bir kez CSV ya da Parquet'e çevirmek, sonraki işleri çok hızlandırır.</p>

<h2>Rapor otomasyonunun adımları</h2>
<div class="steps-list"><ol>
<li><b>Girdiyi doğrula:</b> beklenen sayfa ve sütunlar var mı, tipler doğru mu? Eksikse anlaşılır bir hata ver.</li>
<li><b>Temizle:</b> boş satırları at, Türkçe sayı/tarih metinlerini çevir, şehir adlarını standartlaştır.</li>
<li><b>Hesapla:</b> özetleri Python/pandas ile hesapla ve test et; Excel formülüne güvenme.</li>
<li><b>Yerleştir:</b> sonucu hücre sözlüğüne ya da DataFrame'e koy; toplam satırına okuyan kişi için formül de ekleyebilirsin.</li>
<li><b>Biçimlendir:</b> başlık stili, sayı biçimi, sütun genişliği, dondurulmuş bölmeler, grafik.</li>
<li><b>Kaydet ve dağıt:</b> tarihli dosya adı (<code>rapor_2026-10-26.xlsx</code>), arşiv klasörü, e-posta ya da paylaşım klasörü.</li>
</ol></div>
<div class="note"><b>Gerçek işte</b>Bir lojistik firmasının bölge müdürleri her sabah "dünkü teslimat başarısı" Excel'ini bekler. İyi kurulmuş otomasyon şablon dosyayı (<code>sablon.xlsx</code>) openpyxl ile açar, yalnızca veri hücrelerini doldurur, logoyu ve biçimleri olduğu gibi bırakır, dosyayı tarihli adla kaydeder. İş birimi tanıdığı görünümden vazgeçmek zorunda kalmaz, sen de biçimle uğraşmazsın.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hesap Python'da, sunum Excel'de</h3>
<p>Olgun otomasyonlarda hesap mantığı saf Python fonksiyonlarındadır (test edilebilir), Excel katmanı ince bir "yazıcı"dır. Bu derste hücre sözlüğü kurmanın nedeni budur: <code>{"B7": "=SUM(B2:B6)"}</code> sözlüğünü birim testle doğrularsın, openpyxl'e döken 5 satırlık fonksiyon nadiren hata yapar.</p>
<h3>Formülleri yeniden hesaplatmak</h3>
<p>Formül değerlerine Python'dan ihtiyacın varsa ya değeri kendin hesaplarsın ya da dosyayı hesaplayan bir programdan geçirirsin: LibreOffice'in başsız (headless) modu ya da Windows'ta Excel'i süren <code>xlwings</code>. Sunucu ortamında Excel kurulu olmadığı için genelde ilk yol seçilir.</p>
<h3>Güvenlik ve sürdürülebilirlik</h3>
<ul>
<li><code>.xlsm</code> dosyaları makro içerir; openpyxl makroları çalıştırmaz, <code>keep_vba=True</code> ile yalnızca korur.</li>
<li>Kullanıcıdan gelen metinler <code>=</code> ile başlıyorsa Excel onu formül sanar (CSV/formula injection). Dışa aktarırken başına <code>'</code> eklemek ya da metin tipini zorlamak yaygın önlemdir.</li>
<li>Aynı girdi aynı dosyayı üretmeli (idempotent): sabit sıralama, sabit sayfa sırası, tarih <code>datetime.now()</code> yerine parametre.</li>
</ul>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: 'Python ile oluşturulmuş ve hiç Excel\'de açılmamış bir dosyada <code>B6 = "=SUM(B2:B5)"</code> var. <code>load_workbook(yol, data_only=True)</code> ile okursan <code>ws["B6"].value</code> ne olur?',
      o: ['Toplamın sayısal değeri', 'None', '"=SUM(B2:B5)" metni', 'openpyxl formülü hesaplayıp float verir'], a: 1,
      why: 'openpyxl formül hesaplamaz. data_only=True, Excel\'in en son kaydettiği hesaplanmış değeri okur; dosya hiç Excel\'de açılıp kaydedilmediyse bu değer yoktur ve None gelir. data_only=False olsaydı formül metni gelirdi.' },
    { t: 'mc', stage: 'Isınma',
      q: '<code>pd.read_excel("rapor.xlsx", sheet_name=None)</code> ne döndürür?',
      o: ['Yalnızca ilk sayfanın DataFrame\'i', 'Sayfa adlarının listesi', 'Sayfa adı → DataFrame sözlüğü', 'Tüm sayfaları alt alta birleştiren tek DataFrame'], a: 2,
      why: 'sheet_name=None "tüm sayfalar" demektir ve sonuç {sayfa_adı: DataFrame} sözlüğüdür. Varsayılan (0) yalnızca ilk sayfayı okur; birleştirmeyi pd.concat ile sen yaparsın.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Türkçe Excel kullanan bir ekip için openpyxl ile toplam formülü yazacaksın. Hücreye hangisini koymalısın?',
      o: ['=TOPLA(B2:B10)', '=TOPLA(B2;B10)', '=SUM(B2:B10)', '=SUM(B2;B10)'], a: 2,
      why: 'Dosya içinde formüller her zaman İngilizce işlev adı ve virgül ayraçla saklanır; Excel açarken arayüz diline çevirir. Türkçe ad yazarsan #AD? hatası görürsün. Aralık için iki nokta (:) kullanılır.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import re\nm = re.fullmatch(r"([A-Z]+)(\\d+)", "AB12")\nprint(m.group(1), int(m.group(2)) + 1)\n',
      o: ['AB 13', 'AB12 13', 'A 13', 'AB 121'], a: 0,
      why: 'İlk grup bir ya da daha çok büyük harfi (AB), ikinci grup rakamları (12) yakalar. int("12") + 1 = 13. Hücre adresini harf ve satır numarası olarak ayırmanın en temiz yolu budur.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'openpyxl <code>iter_rows(values_only=True)</code> boş hücreler için None verir. Bu taklit kod ne yazdırır?',
      code: 'satirlar = [("Ürün", "Adet"), ("Kalem", 3), ("Defter", None), ("Silgi", 5)]\ntoplam = 0\nfor urun, adet in satirlar[1:]:\n    toplam += adet or 0\nprint(toplam)\n',
      o: ['TypeError', '3', '8', '9'], a: 2,
      why: 'satirlar[1:] başlık satırını atlar. None or 0 ifadesi 0 verir, böylece boş hücre toplamı bozmaz: 3 + 0 + 5 = 8. "or 0" olmasa None ile toplama TypeError verirdi.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'x = 1234567.891\ns = f"{x:,.2f}"\nprint(s.replace(",", "X").replace(".", ",").replace("X", "."))\n',
      o: ['1,234,567.89', '1.234.567,891', '1234567,89', '1.234.567,89'], a: 3,
      why: ':,.2f binlik ayraç olarak virgül koyar ve 2 basamağa yuvarlar: 1,234,567.89. Geçici bir işaretle (X) yer değiştirme yapılınca Türkçe biçim 1.234.567,89 elde edilir. Doğrudan iki replace yapsaydın tüm işaretler aynı karaktere dönerdi.' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Satır listesini <code>(satır, sütun) → değer</code> sözlüğüne çeviren kodu sırala. Sonuç <code>Ankara 6</code> yazdırmalı.</p>',
      lines: ['satirlar = [["Şehir", "Ciro"], ["İzmir", 1200], ["Ankara", 950]]', 'sayfa = {}', 'for r, satir in enumerate(satirlar, start=1):', '    for c, deger in enumerate(satir, start=1):', '        sayfa[(r, c)] = deger', 'print(sayfa[(3, 1)], len(sayfa))'],
      expect: 'Ankara 6\n',
      hint: 'Excel satır ve sütunları 1\'den başlar; enumerate\'e start=1 ver. İç döngü hücreleri, dış döngü satırları gezer.',
      why: 'Dış döngü her satırı numarasıyla, iç döngü her hücreyi sütun numarasıyla verir. 3 satır × 2 sütun = 6 hücre; (3, 1) adresinde "Ankara" vardır.' },
    { t: 'code', stage: 'Rehberli', id: 'excel-otomasyon-1', diff: 1,
      q: '<p><code>adres_coz(adres)</code> fonksiyonunu yaz: <code>"A1"</code> gibi bir hücre adresini <code>(satir, sutun)</code> demetine çevirsin. Örnekler: <code>"A1"</code> → <code>(1, 1)</code>, <code>"C5"</code> → <code>(5, 3)</code>, <code>"AA10"</code> → <code>(10, 27)</code>. Küçük harf de kabul edilsin (<code>"b2"</code> → <code>(2, 2)</code>). Geçersiz adreste (<code>"12A"</code>, <code>"A0"</code>, <code>""</code>) <code>ValueError</code> fırlatsın.</p>',
      guide: ['Adresi strip() ve upper() ile normalleştir.', 're.fullmatch ile harf grubu ve rakam grubunu ayır; eşleşme yoksa ValueError fırlat.', 'Harfleri soldan sağa gez: sutun = sutun * 26 + (harfin sırası).', 'Satır numarası 0 ise ValueError fırlat; değilse (satir, sutun) döndür.'],
      example: '# Benzer teknik: ikilik metni elle sayıya çevirmek\ndef ikilik(metin):\n    deger = 0\n    for ch in metin:\n        deger = deger * 2 + int(ch)\n    return deger\n\nprint(ikilik("1011"))  # 11\n',
      start: 'import re\n\ndef adres_coz(adres):\n    adres = adres.strip().upper()\n    # TODO: re.fullmatch ile harfleri ve rakamları ayır\n    # TODO: harfleri sütun numarasına çevir (A=1, Z=26, AA=27)\n    # TODO: satır 0 ise ya da eşleşme yoksa ValueError\n    pass\n',
      sol: 'import re\n\ndef adres_coz(adres):\n    adres = adres.strip().upper()\n    m = re.fullmatch(r"([A-Z]+)(\\d+)", adres)\n    if not m:\n        raise ValueError(f"Geçersiz adres: {adres!r}")\n    harfler, rakamlar = m.groups()\n    satir = int(rakamlar)\n    if satir == 0:\n        raise ValueError("Satır numarası 1\'den başlar")\n    sutun = 0\n    for ch in harfler:\n        sutun = sutun * 26 + (ord(ch) - ord("A") + 1)\n    return (satir, sutun)\n',
      tests: 'assert adres_coz("A1") == (1, 1), "A1 → (1, 1) olmalı"\nassert adres_coz("C5") == (5, 3), "C5 → (5, 3): C üçüncü sütundur"\nassert adres_coz("Z3") == (3, 26), "Z 26. sütundur"\nassert adres_coz("AA10") == (10, 27), "AA, Z\'den sonraki 27. sütundur"\nassert adres_coz("b2") == (2, 2), "küçük harf de kabul edilmeli"\nassert adres_coz("XFD1048576") == (1048576, 16384), "Excel\'in son hücresi"\nfor kotu in ["12A", "A0", "", "A-1"]:\n    try:\n        adres_coz(kotu)\n        assert False, f"{kotu!r} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Harf → sayı dönüşümü 26 tabanlı ama sıfırsız bir sayma sistemidir.', 're.fullmatch(r"([A-Z]+)(\\d+)", adres) iki grubu verir.', 'Döngü: sutun = sutun * 26 + (ord(ch) - ord("A") + 1)'],
      why: 'Düzenli ifade adresi güvenle ikiye böler; harfler soldan sağa 26 ile çarpılarak birikir (A=1 olduğu için sıfırsız). Geçersiz girdiyi erken reddetmek, otomasyonda yanlış hücreye yazmayı önler.' },
    { t: 'code', stage: 'Rehberli', id: 'excel-otomasyon-2', diff: 2,
      q: '<p><code>sayfa_olustur(satirlar)</code> fonksiyonunu yaz: iç içe satır listesini <code>{"A1": deger, ...}</code> biçiminde hücre sözlüğüne çevirsin. Satır ve sütunlar 1\'den başlar; değeri <code>None</code> olan hücreler sözlüğe <b>eklenmesin</b> (boş hücre). Sütun harfi için hazır verilen <code>sutun_harfi</code> fonksiyonunu kullan.</p>',
      guide: ['Boş bir sözlük oluştur.', 'Satırları enumerate(..., start=1) ile numarasıyla gez.', 'Her satırın hücrelerini de enumerate(..., start=1) ile gez.', 'Değer None değilse adresi sutun_harfi(c) + str(r) olarak kur ve sözlüğe yaz.', 'Sözlüğü döndür.'],
      example: '# Benzer teknik: koltuk planı (sıra harfi + koltuk no)\nplan = [["Ali", None], ["Ece", "Can"]]\nkoltuk = {}\nfor i, sira in enumerate(plan):\n    for j, kisi in enumerate(sira, start=1):\n        if kisi is not None:\n            koltuk["ABC"[i] + str(j)] = kisi\nprint(koltuk)\n',
      start: 'def sutun_harfi(n):\n    s = ""\n    while n > 0:\n        n, kalan = divmod(n - 1, 26)\n        s = chr(65 + kalan) + s\n    return s\n\ndef sayfa_olustur(satirlar):\n    sayfa = {}\n    # TODO: satırları ve hücreleri numarasıyla gez\n    # TODO: None olmayan değerleri "B3" gibi adreslerle sözlüğe koy\n    return sayfa\n',
      sol: 'def sutun_harfi(n):\n    s = ""\n    while n > 0:\n        n, kalan = divmod(n - 1, 26)\n        s = chr(65 + kalan) + s\n    return s\n\ndef sayfa_olustur(satirlar):\n    sayfa = {}\n    for r, satir in enumerate(satirlar, start=1):\n        for c, deger in enumerate(satir, start=1):\n            if deger is not None:\n                sayfa[f"{sutun_harfi(c)}{r}"] = deger\n    return sayfa\n',
      tests: 'veri = [["Ürün", "Adet", "Fiyat"], ["Kalem", 3, 12.5], ["Defter", None, 40]]\ns = sayfa_olustur(veri)\nassert s["A1"] == "Ürün", "A1 ilk başlık olmalı"\nassert s["C2"] == 12.5, "C2 kalemin fiyatı olmalı"\nassert s["A3"] == "Defter", "A3 ikinci ürün olmalı"\nassert "B3" not in s, "None değerli hücre sözlüğe eklenmemeli (boş hücre)"\nassert len(s) == 8, "9 hücreden biri boş, 8 kayıt olmalı"\nassert sayfa_olustur([]) == {}, "boş liste boş sözlük vermeli"\ngenis = sayfa_olustur([list(range(1, 29))])\nassert genis["AB1"] == 28, "28. sütun AB olmalı"\n',
      hints: ['İki iç içe enumerate döngüsü gerekir; ikisine de start=1 ver.', 'Adres: f"{sutun_harfi(c)}{r}"', 'if deger is not None: sayfa[adres] = deger (0 ve "" geçerli değerlerdir, "if deger" yazma).'],
      why: 'Hücre sözlüğü, openpyxl\'in iç modelinin sade bir kopyasıdır. None kontrolünü "is not None" ile yapmak 0 gibi geçerli değerleri kaybetmeni önler.' },
    { t: 'code', stage: 'Rehberli', id: 'excel-otomasyon-3', diff: 2,
      q: '<p>Ilgaz Bank\'tan gelen Excel\'de tarih sütunu seri numarası olarak geldi. <code>excel_tarih(seri)</code> fonksiyonunu yaz: Excel seri numarasını (<code>int</code>, <code>float</code> ya da <code>"45000"</code> gibi metin) <code>datetime.date</code> nesnesine çevirsin; başlangıç <code>date(1899, 12, 30)</code>. Ondalık kısım saati gösterir, at (<code>45000.75</code> → aynı gün). Ayrıca <code>tarih_metni(seri)</code> sonucu <code>"GG.AA.YYYY"</code> biçiminde döndürsün. Negatif seri için <code>ValueError</code>.</p>',
      guide: ['Gelen değeri float\'a çevir (metin de gelebilir).', 'Negatifse ValueError fırlat.', 'date(1899, 12, 30) + timedelta(days=int(seri)) ile günü bul.', 'tarih_metni içinde excel_tarih sonucunu strftime("%d.%m.%Y") ile biçimle.'],
      example: '# Benzer teknik: UNIX zaman damgasından gün\nfrom datetime import date, timedelta\nbaslangic = date(1970, 1, 1)\nprint(baslangic + timedelta(days=20000))\nprint((baslangic + timedelta(days=20000)).strftime("%d.%m.%Y"))\n',
      start: 'from datetime import date, timedelta\n\ndef excel_tarih(seri):\n    # TODO: float\'a çevir, negatifse ValueError\n    # TODO: 1899-12-30 + gün sayısı\n    pass\n\ndef tarih_metni(seri):\n    # TODO: GG.AA.YYYY\n    pass\n',
      sol: 'from datetime import date, timedelta\n\ndef excel_tarih(seri):\n    deger = float(seri)\n    if deger < 0:\n        raise ValueError("Seri numarası negatif olamaz")\n    return date(1899, 12, 30) + timedelta(days=int(deger))\n\ndef tarih_metni(seri):\n    return excel_tarih(seri).strftime("%d.%m.%Y")\n',
      tests: 'from datetime import date\nassert excel_tarih(45000) == date(2023, 3, 15), "45000 → 2023-03-15 olmalı"\nassert excel_tarih("46323") == date(2026, 10, 28), "metin olarak gelen seri de çevrilmeli"\nassert excel_tarih(45000.75) == date(2023, 3, 15), "ondalık kısım saattir, gün değişmemeli"\nassert excel_tarih(1) == date(1899, 12, 31), "1 → 1899-12-31"\nassert tarih_metni(46323) == "28.10.2026", "biçim GG.AA.YYYY olmalı"\ntry:\n    excel_tarih(-3)\n    assert False, "negatif seri ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: ['Excel tarihleri bir başlangıç gününden bu yana geçen gün sayısıdır.', 'timedelta(days=int(float(seri)))', 'tarih_metni: return excel_tarih(seri).strftime("%d.%m.%Y")'],
      why: 'Excel 1900 artık yıl hatası yüzünden başlangıç olarak 1899-12-30 kullanılır; böylece 1 Mart 1900 sonrası tüm tarihler doğru çıkar. pandas\'ta aynı iş pd.to_datetime(seri, unit="D", origin="1899-12-30") ile yapılır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'excel-otomasyon-4', diff: 1,
      q: '<p><code>formul_uret(islev, sutun, ilk, son)</code> fonksiyonunu yaz. Türkçe ya da İngilizce işlev adını alıp Excel dosyasına yazılacak formül metnini döndürsün: <code>formul_uret("TOPLA", "B", 2, 10)</code> → <code>"=SUM(B2:B10)"</code>. Eşlemeler: TOPLA→SUM, ORTALAMA→AVERAGE, MAK→MAX, MİN→MIN, BAĞ_DEĞ_SAY→COUNT. İngilizce adlar (büyük/küçük harf fark etmez) olduğu gibi kabul edilsin. Bilinmeyen işlev ya da <code>ilk &gt; son</code> ise <code>ValueError</code>; sütun küçük harfle gelirse büyüt.</p>',
      start: 'def formul_uret(islev, sutun, ilk, son):\n    pass\n',
      sol: 'TR_EN = {"TOPLA": "SUM", "ORTALAMA": "AVERAGE", "MAK": "MAX", "MİN": "MIN", "BAĞ_DEĞ_SAY": "COUNT"}\n\ndef formul_uret(islev, sutun, ilk, son):\n    ad = islev.strip().upper()\n    if ad in TR_EN:\n        ad = TR_EN[ad]\n    elif ad not in TR_EN.values():\n        raise ValueError(f"Bilinmeyen işlev: {islev}")\n    if ilk > son:\n        raise ValueError("ilk satır son satırdan büyük olamaz")\n    s = sutun.upper()\n    return f"={ad}({s}{ilk}:{s}{son})"\n',
      tests: 'assert formul_uret("TOPLA", "B", 2, 10) == "=SUM(B2:B10)", "TOPLA → SUM"\nassert formul_uret("ORTALAMA", "c", 2, 41) == "=AVERAGE(C2:C41)", "sütun büyük harfe çevrilmeli"\nassert formul_uret("max", "D", 5, 5) == "=MAX(D5:D5)", "İngilizce ad küçük harfle gelse de kabul edilmeli"\nassert formul_uret("MİN", "E", 1, 3) == "=MIN(E1:E3)", "MİN → MIN"\nassert formul_uret("BAĞ_DEĞ_SAY", "A", 2, 9) == "=COUNT(A2:A9)"\nfor args in [("DÜŞEYARA", "A", 1, 2), ("TOPLA", "B", 10, 2)]:\n    try:\n        formul_uret(*args)\n        assert False, f"{args} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Türkçe→İngilizce eşlemeyi sözlükte tut.', 'Türkçe "İ" harfi için "MİN".upper() zaten "MİN" olur; sözlük anahtarını büyük harfle yaz.', 'Bilinmeyen kontrolü: ad ne sözlüğün anahtarlarında ne de değerlerinde ise hata.'],
      why: 'Formül metnini tek bir yerde üretmek, Türkçe ad ve ayraç hatalarını kaynağında keser. Bilinmeyen işlevi sessizce yazmak yerine hata vermek, raporda #AD? görmekten iyidir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'excel-otomasyon-5', diff: 2,
      q: '<p>Türkçe Excel\'den metin olarak gelen tutarları işlemek için iki fonksiyon yaz:</p><ul><li><code>tr_sayi_coz(metin)</code>: <code>"1.234,56"</code> → <code>1234.56</code>, <code>" -12,5 TL "</code> → <code>-12.5</code>, <code>"1.000"</code> → <code>1000.0</code>, <code>"7"</code> → <code>7.0</code>. Baştaki/sondaki boşlukları ve sondaki <code>TL</code> ekini at.</li><li><code>tr_sayi_yaz(sayi)</code>: 2 ondalıklı Türkçe biçim döndürsün: <code>1234567.891</code> → <code>"1.234.567,89"</code>, <code>-0.5</code> → <code>"-0,50"</code>.</li></ul>',
      start: 'def tr_sayi_coz(metin):\n    pass\n\ndef tr_sayi_yaz(sayi):\n    pass\n',
      sol: 'def tr_sayi_coz(metin):\n    temiz = metin.strip()\n    if temiz.upper().endswith("TL"):\n        temiz = temiz[:-2].strip()\n    return float(temiz.replace(".", "").replace(",", "."))\n\ndef tr_sayi_yaz(sayi):\n    s = f"{sayi:,.2f}"\n    return s.replace(",", "_").replace(".", ",").replace("_", ".")\n',
      tests: 'assert tr_sayi_coz("1.234,56") == 1234.56, "binlik nokta silinmeli, virgül ondalık olmalı"\nassert tr_sayi_coz(" -12,5 TL ") == -12.5, "boşluk ve TL eki atılmalı"\nassert tr_sayi_coz("1.000") == 1000.0, "1.000 Türkçede bin demektir"\nassert tr_sayi_coz("7") == 7.0\nassert tr_sayi_yaz(1234567.891) == "1.234.567,89", "binlik nokta, ondalık virgül"\nassert tr_sayi_yaz(-0.5) == "-0,50", "her zaman 2 ondalık"\nassert tr_sayi_yaz(999.999) == "1.000,00", "yuvarlama binlik ayracı da etkiler"\nassert tr_sayi_coz(tr_sayi_yaz(48210.4)) == 48210.4, "iki fonksiyon birbirinin tersi olmalı"\n',
      hints: ['Çözerken sıra önemli: önce noktaları sil, sonra virgülü noktaya çevir.', 'Yazarken f"{x:,.2f}" İngilizce biçimi verir; geçici bir karakterle yer değiştir.', 'replace(",", "_").replace(".", ",").replace("_", ".")'],
      why: 'Türkçe biçimde nokta binlik, virgül ondalık işaretidir. Sıralı replace ve geçici karakter hilesi locale ayarına bağımlı olmadan her makinede aynı sonucu verir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'excel-otomasyon-6', diff: 2,
      q: '<p>pandas ile pivot raporu. <code>pivot_csv(csv_metni)</code> fonksiyonunu yaz: <code>sehir,ay,tutar</code> başlıklı CSV metnini okusun, şehir satırları × ay sütunları olacak biçimde tutar toplamlarını hesaplasın (eksik kombinasyon <code>0</code>), şehir adını sütun olarak geri getirip <code>to_csv(index=False)</code> sonucunu döndürsün. (Gerçek işte bunun yerine <code>to_excel</code> yazardın.) Sütunlar ve satırlar alfabetik sıralı olsun (pivot_table varsayılanı).</p>',
      start: 'import io\nimport pandas as pd\n\ndef pivot_csv(csv_metni):\n    pass\n',
      sol: 'import io\nimport pandas as pd\n\ndef pivot_csv(csv_metni):\n    df = pd.read_csv(io.StringIO(csv_metni))\n    ozet = df.pivot_table(index="sehir", columns="ay", values="tutar", aggfunc="sum", fill_value=0)\n    return ozet.reset_index().to_csv(index=False)\n',
      tests: 'veri = "sehir,ay,tutar\\nİzmir,Eylül,1200\\nİzmir,Ekim,1500\\nAnkara,Ekim,900\\nAnkara,Ekim,300\\nBursa,Eylül,450\\n"\nsonuc = pivot_csv(veri)\nsatirlar = sonuc.strip().splitlines()\nassert satirlar[0] == "sehir,Ekim,Eylül", "başlık: sehir ve alfabetik aylar olmalı, bulunan: " + satirlar[0]\nassert satirlar[1] == "Ankara,1200,0", "Ankara Ekim 900+300=1200, Eylül 0 olmalı"\nassert satirlar[2] == "Bursa,0,450", "eksik kombinasyon 0 olmalı (fill_value)"\nassert satirlar[3] == "İzmir,1500,1200"\nassert len(satirlar) == 4, "3 şehir + başlık"\n',
      hints: ['pd.read_csv(io.StringIO(metin)) ile metni oku.', 'df.pivot_table(index=..., columns=..., values=..., aggfunc="sum", fill_value=0)', 'Şehri sütuna geri almak için reset_index(), sonra to_csv(index=False).'],
      why: 'pivot_table Excel\'deki PivotTable\'ın kod karşılığıdır. fill_value=0 boş hücreleri sıfırla doldurur; reset_index olmadan to_csv(index=False) şehir sütununu kaybederdi.' },
    { t: 'code', stage: 'Kendin yaz', id: 'excel-otomasyon-7', diff: 2,
      q: '<p>Her ayın satışı ayrı sayfada geliyor. <code>sayfalari_birlestir(sayfalar)</code> fonksiyonunu yaz: <code>{"Ocak": [["Ürün", "Adet"], ["Kalem", 3]], "Şubat": [...]}</code> gibi bir sözlük alsın; tek bir satır listesi döndürsün: ilk satır <code>["Sayfa", "Ürün", "Adet"]</code>, sonraki satırların başında sayfa adı olsun. Sayfalar sözlükteki sırayla eklensin. Boş sayfa (hiç satırı yok) atlansın. Başlıkları ilk dolu sayfadan farklı olan bir sayfa varsa <code>ValueError</code> fırlat (mesajda sayfa adı geçsin). Hiç dolu sayfa yoksa <code>[]</code> döndür.</p>',
      start: 'def sayfalari_birlestir(sayfalar):\n    pass\n',
      sol: 'def sayfalari_birlestir(sayfalar):\n    baslik = None\n    sonuc = []\n    for ad, satirlar in sayfalar.items():\n        if not satirlar:\n            continue\n        bas, *govde = satirlar\n        if baslik is None:\n            baslik = list(bas)\n            sonuc.append(["Sayfa"] + baslik)\n        elif list(bas) != baslik:\n            raise ValueError(f"{ad} sayfasının başlıkları farklı: {bas}")\n        for satir in govde:\n            sonuc.append([ad] + list(satir))\n    return sonuc\n',
      tests: 'veri = {"Ocak": [["Ürün", "Adet"], ["Kalem", 3], ["Defter", 5]], "Şubat": [], "Mart": [["Ürün", "Adet"], ["Silgi", 2]]}\ns = sayfalari_birlestir(veri)\nassert s[0] == ["Sayfa", "Ürün", "Adet"], "ilk satır Sayfa + başlıklar olmalı"\nassert s[1] == ["Ocak", "Kalem", 3], "satırın başına sayfa adı eklenmeli"\nassert s[-1] == ["Mart", "Silgi", 2], "sayfalar sırayla eklenmeli, boş Şubat atlanmalı"\nassert len(s) == 4, "1 başlık + 3 veri satırı"\nassert sayfalari_birlestir({}) == [], "hiç sayfa yoksa boş liste"\nassert sayfalari_birlestir({"A": [["x"]]}) == [["Sayfa", "x"]], "yalnız başlıklı sayfa da başlığı kurar"\ntry:\n    sayfalari_birlestir({"Ocak": [["Ürün", "Adet"]], "Nisan": [["Urun", "Adet"], ["Kalem", 1]]})\n    assert False, "farklı başlıkta ValueError bekleniyordu"\nexcept ValueError as e:\n    assert "Nisan" in str(e), "hata mesajında sorunlu sayfanın adı geçmeli"\n',
      hints: ['İlk dolu sayfanın başlığını sakla; sonrakileri onunla karşılaştır.', 'bas, *govde = satirlar ile başlığı ve veri satırlarını ayır.', 'Her veri satırı için [ad] + list(satir) ekle.'],
      why: 'pd.concat(tum.values(), keys=...) aynı işi pandas\'ta yapar; ama başlık uyuşmazlığını kendin denetlemezsen pandas sessizce NaN dolu sütunlar üretir. Erken ve açık hata, yanlış rapordan iyidir.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'excel-otomasyon-8', diff: 1,
      q: '<p>Stajyerin yazdığı fonksiyon Türkçe tutar metinlerini toplamalı ama <code>"1.234,56"</code> gibi değerlerde ya hata veriyor ya da yanlış sonuç üretiyor. <b>Hatayı bul ve düzelt.</b> <code>toplam_tutar(["1.234,56", "100", "2,44"])</code> → <code>1337.0</code> olmalı.</p>',
      start: 'def toplam_tutar(metinler):\n    toplam = 0\n    for m in metinler:\n        toplam += float(m.replace(",", ".").replace(".", ""))\n    return round(toplam, 2)\n',
      sol: 'def toplam_tutar(metinler):\n    toplam = 0\n    for m in metinler:\n        toplam += float(m.replace(".", "").replace(",", "."))\n    return round(toplam, 2)\n',
      tests: 'assert toplam_tutar(["1.234,56", "100", "2,44"]) == 1337.0, "1234.56 + 100 + 2.44 = 1337.0 olmalı"\nassert toplam_tutar(["0,5"]) == 0.5, "0,5 yarım demektir, 5 değil"\nassert toplam_tutar([]) == 0, "boş liste 0"\n',
      hints: ['"0,5" için kod ne üretiyor? Adım adım replace sonuçlarını yazdır.', 'Virgülü noktaya çevirdikten sonra tüm noktaları silersen ondalık işaret de gider.', 'Sırayı değiştir: önce binlik noktaları sil, sonra virgülü noktaya çevir.'],
      why: 'replace sırası yanlıştı: virgül noktaya çevrildikten sonra tüm noktalar silinince ondalık kısım tam sayıya karıştı ("0,5" → "05" → 5.0). Önce binlik ayraç, sonra ondalık ayraç dönüştürülmelidir.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'excel-otomasyon-9', diff: 2,
      q: '<p><code>iter_rows(values_only=True)</code> ile okunan stok sayfasından ürün başına stok değerini (adet × fiyat) toplayan fonksiyon çalışmıyor. Kodda <b>üç hata</b> var: başlık satırı işleme giriyor, aynı ürünün ikinci satırı ilkini eziyor ve boş (None) adet çökertiyor. <b>Hataları bul ve düzelt.</b> Boş adet 0 sayılsın.</p>',
      start: 'def urun_degerleri(satirlar):\n    sonuc = {}\n    for urun, adet, fiyat in satirlar:\n        sonuc[urun] = adet * fiyat\n    return sonuc\n',
      sol: 'def urun_degerleri(satirlar):\n    sonuc = {}\n    for urun, adet, fiyat in satirlar[1:]:\n        sonuc[urun] = sonuc.get(urun, 0) + (adet or 0) * fiyat\n    return sonuc\n',
      tests: 'veri = [("Ürün", "Adet", "Fiyat"), ("Kalem", 3, 10.0), ("Defter", None, 40.0), ("Kalem", 2, 10.0), ("Silgi", 4, 2.5)]\nd = urun_degerleri(veri)\nassert "Ürün" not in d, "başlık satırı veri olarak işlenmemeli"\nassert d["Kalem"] == 50.0, "Kalem iki satırda: 30 + 20 = 50 olmalı (toplanmalı, ezilmemeli)"\nassert d["Defter"] == 0, "boş adet 0 sayılmalı"\nassert d["Silgi"] == 10.0\n',
      hints: ['Döngü ilk satırdan başlıyor; başlıkta "Adet" * "Fiyat" yapılmaya çalışılıyor.', 'Atama (=) yerine birikimli toplama gerekir: sonuc.get(urun, 0) + ...', 'None için (adet or 0) kullan.'],
      why: 'values_only satırlarında ilk satır genelde başlıktır; satirlar[1:] (ya da iter_rows(min_row=2)) ile atlanır. Aynı anahtar tekrar gelince get ile biriktirmek, boş hücreyi "or 0" ile nötrlemek gerçek Excel verisinde şarttır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'excel-otomasyon-10', diff: 3,
      q: '<p><code>aralik_hucreleri(aralik)</code> fonksiyonunu yaz: <code>"B2:C3"</code> gibi bir aralığı satır öncelikli (önce soldan sağa, sonra aşağı) hücre adresleri listesine çevirsin: <code>["B2", "C2", "B3", "C3"]</code>. Kurallar: tek hücre (<code>"A1"</code>) → <code>["A1"]</code>; ters yazılmış aralık (<code>"C3:B2"</code>) normalleştirilip aynı sonucu versin; küçük harf ve boşluk kabul; <code>"Z1:AB1"</code> → <code>["Z1", "AA1", "AB1"]</code>. Geçersiz adreste <code>ValueError</code>. Adres çözme ve sütun harfi fonksiyonlarını kendin yaz.</p>',
      start: 'def aralik_hucreleri(aralik):\n    pass\n',
      sol: 'import re\n\ndef _coz(adres):\n    m = re.fullmatch(r"([A-Z]+)(\\d+)", adres.strip().upper())\n    if not m or int(m.group(2)) == 0:\n        raise ValueError(f"Geçersiz adres: {adres!r}")\n    sutun = 0\n    for ch in m.group(1):\n        sutun = sutun * 26 + ord(ch) - 64\n    return int(m.group(2)), sutun\n\ndef _harf(n):\n    s = ""\n    while n > 0:\n        n, k = divmod(n - 1, 26)\n        s = chr(65 + k) + s\n    return s\n\ndef aralik_hucreleri(aralik):\n    parcalar = aralik.split(":")\n    if len(parcalar) == 1:\n        parcalar = parcalar * 2\n    if len(parcalar) != 2:\n        raise ValueError(f"Geçersiz aralık: {aralik!r}")\n    (r1, c1), (r2, c2) = _coz(parcalar[0]), _coz(parcalar[1])\n    r1, r2 = sorted((r1, r2))\n    c1, c2 = sorted((c1, c2))\n    return [f"{_harf(c)}{r}" for r in range(r1, r2 + 1) for c in range(c1, c2 + 1)]\n',
      tests: 'assert aralik_hucreleri("B2:C3") == ["B2", "C2", "B3", "C3"], "satır öncelikli sıra: B2, C2, B3, C3"\nassert aralik_hucreleri("A1") == ["A1"], "tek hücre kendisini vermeli"\nassert aralik_hucreleri("C3:B2") == ["B2", "C2", "B3", "C3"], "ters aralık normalleştirilmeli"\nassert aralik_hucreleri(" z1 : ab1 ") == ["Z1", "AA1", "AB1"], "Z\'den AA\'ya geçiş ve küçük harf/boşluk"\nassert len(aralik_hucreleri("A1:J100")) == 1000, "10 sütun × 100 satır = 1000 hücre"\nfor kotu in ["A1:B", "1A:B2", "A1:B2:C3", "A0"]:\n    try:\n        aralik_hucreleri(kotu)\n        assert False, f"{kotu!r} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Aralığı ":" ile ikiye böl; tek parça varsa başlangıç = bitiş.', 'İki köşeyi (satır, sütun) olarak çöz, sonra satırları ve sütunları ayrı ayrı sırala (min, max).', 'Dış döngü satırlar, iç döngü sütunlar olan bir liste üreteci kur.'],
      why: 'openpyxl\'de ws["B2:C3"] tam olarak bu sırada satır demetleri verir. Köşeleri ayrı ayrı sıralamak "C3:B2" ya da "B3:C2" gibi tüm ters yazımları tek kurala bağlar.' },
    { t: 'code', stage: 'Mini proje', id: 'excel-otomasyon-11', diff: 3,
      q: '<p>Haftalık ciro raporunun hücre modelini üret. <code>haftalik_rapor(csv_metni)</code> şunu yapsın:</p><ol><li><code>sehir;tutar</code> başlıklı, <b>noktalı virgül</b> ayraçlı ve tutarları Türkçe biçimli (<code>1.250,50</code>) CSV metnini oku; boş satırları atla.</li><li>Şehre göre tutarları topla; ciroya göre <b>büyükten küçüğe</b> sırala (eşitlikte şehir adına göre).</li><li><code>{"hucreler": {...}, "genislik": {...}}</code> döndür. <code>hucreler</code>: <code>A1="Şehir"</code>, <code>B1="Ciro"</code>, sonra her şehir bir satır (ciro 2 basamağa yuvarlanmış float), en altta <code>A{n}="TOPLAM"</code> ve <code>B{n}="=SUM(B2:B{n-1})"</code>.</li><li><code>genislik</code>: A ve B sütunları için o sütundaki en uzun değerin metin uzunluğu + 2 (formül de dahil, sayılar <code>str()</code> ile ölçülür).</li></ol>',
      start: 'import csv\nimport io\n\ndef haftalik_rapor(csv_metni):\n    pass\n',
      sol: 'import csv\nimport io\n\ndef _tr(metin):\n    return float(metin.strip().replace(".", "").replace(",", "."))\n\ndef haftalik_rapor(csv_metni):\n    okuyucu = csv.DictReader(io.StringIO(csv_metni), delimiter=";")\n    ciro = {}\n    for satir in okuyucu:\n        sehir = (satir.get("sehir") or "").strip()\n        if not sehir:\n            continue\n        ciro[sehir] = ciro.get(sehir, 0) + _tr(satir["tutar"])\n    sirali = sorted(ciro.items(), key=lambda x: (-x[1], x[0]))\n    hucreler = {"A1": "Şehir", "B1": "Ciro"}\n    for i, (sehir, tutar) in enumerate(sirali, start=2):\n        hucreler[f"A{i}"] = sehir\n        hucreler[f"B{i}"] = round(tutar, 2)\n    n = len(sirali) + 2\n    hucreler[f"A{n}"] = "TOPLAM"\n    hucreler[f"B{n}"] = f"=SUM(B2:B{n - 1})"\n    genislik = {}\n    for adres, deger in hucreler.items():\n        sutun = adres[0]\n        genislik[sutun] = max(genislik.get(sutun, 0), len(str(deger)) + 2)\n    return {"hucreler": hucreler, "genislik": genislik}\n',
      tests: 'veri = "sehir;tutar\\nİzmir;1.250,50\\nAnkara;900\\n\\nİzmir;749,50\\nEskişehir;900\\nAnkara;1.100,25\\n"\nr = haftalik_rapor(veri)\nh = r["hucreler"]\nassert h["A1"] == "Şehir" and h["B1"] == "Ciro", "başlıklar A1 ve B1\'de olmalı"\nassert h["A2"] == "Ankara" and h["B2"] == 2000.25, "en yüksek ciro Ankara 2000.25 (900 + 1100,25)"\nassert h["A3"] == "İzmir" and h["B3"] == 2000.0, "İzmir 1250,50 + 749,50 = 2000.0"\nassert h["A4"] == "Eskişehir", "üçüncü sırada Eskişehir"\nassert h["A5"] == "TOPLAM", "toplam satırı veriden sonra gelmeli"\nassert h["B5"] == "=SUM(B2:B4)", "formül yalnızca veri satırlarını kapsamalı"\nassert len(h) == 10, "5 satır × 2 sütun"\nassert r["genislik"] == {"A": 11, "B": 13}, "A: Eskişehir(9)+2, B: =SUM(B2:B4)(11)+2; bulunan: " + str(r["genislik"])\ne = haftalik_rapor("sehir;tutar\\nBursa;5\\nAdana;5\\n")["hucreler"]\nassert e["A2"] == "Adana", "eşit ciroda şehir adına göre sıralanmalı"\n',
      hints: ['csv.DictReader(io.StringIO(metin), delimiter=";") ile oku; boş satırlarda sehir alanı boş/None gelir.', 'sorted(ciro.items(), key=lambda x: (-x[1], x[0])) büyükten küçüğe ve eşitlikte ada göre sıralar.', 'Toplam satırı n = şehir sayısı + 2; formül B2\'den B{n-1}\'e kadar.'],
      why: 'Bu fonksiyon raporun tüm "akıl" kısmını taşır ve tamamen test edilebilir. Kendi bilgisayarında son adım yalnızca for adres, deger in hucreler.items(): ws[adres] = deger ve column_dimensions ayarıdır.' }
  ],
  faq: [
    { q: 'openpyxl mi pandas mı kullanmalıyım?', a: 'Veriyi okuyup dönüştürüyor ve tablo halinde yazıyorsan pandas; hücre biçimi, birleştirme, grafik, var olan şablonu doldurma gibi hücre düzeyinde kontrol gerekiyorsa openpyxl. Çoğu raporda ikisi birlikte kullanılır: pandas hesaplar, ExcelWriter ile yazar, yazici.sheets üzerinden openpyxl ile biçimlendirirsin.' },
    { q: 'Dosyayı Excel açıkken Python ile kaydedebilir miyim?', a: 'Windows\'ta Excel açık dosyayı kilitler; PermissionError alırsın. Otomasyonda çıktıyı tarihli yeni bir dosyaya yazmak hem bu sorunu hem de üzerine yazma riskini ortadan kaldırır.' },
    { q: 'Excel kodu tarayıcıda çalışır mı?', a: 'Evet. openpyxl ve XlsxWriter gerçek .xlsx dosyasını tarayıcının belleğinde yazar ve okur; dosyayı indirip Excel\'de açabilirsin. Çalışmayan: formül hesaplama (Excel yapar), grafik önizleme ve kurulu Excel isteyen xlwings.' },
    { q: 'CSV\'yi Excel\'de açınca Türkçe karakterler bozuk çıkıyor.', a: 'Dosyayı encoding="utf-8-sig" ile yaz; Excel BOM işaretini görünce UTF-8 olarak açar. Türkçe Excel için ayrıca sep=";" ve decimal="," kullanmak sütunların doğru bölünmesini sağlar.' },
    { q: 'Hücreye yazdığım tarih Excel\'de sayı olarak görünüyor.', a: 'Excel tarihleri seri numarası olarak saklar; görünüm number_format ile belirlenir. Hücreye date nesnesi yaz ve number_format = "DD.MM.YYYY" ver.' }
  ],
  mistakes: [
    { bad: 'ws["B6"] = "=TOPLA(B2;B5)"', good: 'ws["B6"] = "=SUM(B2:B5)"', why: 'Dosyaya formül İngilizce ad ve virgül/iki nokta ile yazılır; Türkçe ad Excel\'de #AD? hatası verir.' },
    { bad: 'float("1.234,56".replace(",", "."))', good: 'float("1.234,56".replace(".", "").replace(",", "."))', why: 'Önce binlik noktaları silmezsen "1.234.56" oluşur ve ValueError alırsın; sıra önemlidir.' },
    { bad: 'wb = load_workbook("rapor.xlsx", data_only=True)\nprint(ws["B6"].value)  # formülün değerini bekliyorum', good: 'toplam = sum(adetler)  # hesabı Python\'da yap\nws["B6"] = "=SUM(B2:B5)"  # formül sadece okuyan kişi için', why: 'openpyxl formül hesaplamaz; data_only yalnızca Excel\'in son kaydettiği değeri okur ve Python\'la üretilmiş dosyada None döner.' },
    { bad: 'for satir in ws.iter_rows(values_only=True):\n    toplam += satir[1]', good: 'for satir in ws.iter_rows(min_row=2, values_only=True):\n    toplam += satir[1] or 0', why: 'İlk satır başlıktır ve boş hücreler None gelir; ikisi de toplamayı çökertir.' },
    { bad: 'ws["A2"] = "28.10.2026"', good: 'ws["A2"] = date(2026, 10, 28)\nws["A2"].number_format = "DD.MM.YYYY"', why: 'Tarihi metin yazarsan Excel\'de sıralama ve tarih formülleri çalışmaz; değeri date olarak yaz, görünümü biçimle ayarla.' }
  ]
});
})(window);
