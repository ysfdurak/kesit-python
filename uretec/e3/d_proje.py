EXT = dict(id='proje-temel', min=75)

BANKA_HELPERS = r'''
TURLER = ("yatirma", "cekme", "havale")

def hareketleri_oku(metin):
    hareketler, hatali = [], 0
    for satir in metin.strip().splitlines()[1:]:
        if not satir.strip():
            continue
        try:
            id_, tarih, hesap, tur, tutar = satir.strip().split(",")
            if tur not in TURLER:
                raise ValueError("bilinmeyen tür")
            hareketler.append({"id": int(id_), "tarih": tarih, "hesap": hesap,
                               "tur": tur, "tutar": float(tutar)})
        except ValueError:
            hatali += 1
    return hareketler, hatali

def hesap_bakiyeleri(hareketler, acilis):
    bakiye = dict(acilis)
    for h in hareketler:
        isaret = 1 if h["tur"] == "yatirma" else -1
        bakiye[h["hesap"]] = round(bakiye.get(h["hesap"], 0) + isaret * h["tutar"], 2)
    return bakiye

def supheli_islemler(hareketler, esik):
    adaylar = [h for h in hareketler if h["tur"] != "yatirma" and h["tutar"] >= esik]
    adaylar.sort(key=lambda h: h["tutar"], reverse=True)
    return [h["id"] for h in adaylar]

def banka_raporu(bakiyeler, supheli, hatali, tarih):
    yil, ay, gun = tarih.split("-")
    satirlar = [f"ILGAZ BANK GÜN SONU - {gun}.{ay}.{yil}",
                f"Hesap sayısı  : {len(bakiyeler)}"]
    for hesap in sorted(bakiyeler):
        satirlar.append(f"  {hesap:<6}{bakiyeler[hesap]:>14,.2f} TL")
    if supheli:
        satirlar.append(f"Şüpheli işlem : {len(supheli)} (" + ", ".join(str(i) for i in supheli) + ")")
    else:
        satirlar.append("Şüpheli işlem : yok")
    satirlar.append(f"Hatalı satır  : {hatali}")
    return "\n".join(satirlar)
'''

BANKA_METIN_TEST = r'''
METIN = """id,tarih,hesap,tur,tutar
1,2026-10-27,TR01,yatirma,5000
2,2026-10-27,TR01,cekme,1200.5

3,2026-10-27,TR02,havale,15000
4,2026-10-27,TR02,yatirma,abc
5,2026-10-27,TR03,cekme,300
6,2026-10-27,TR01,havale,9000
7,2026-10-27,TR03,iade,50
8,2026-10-27,TR03
"""
'''

EXT['html'] = r'''
<h2>Derinleş: aynı iskeletle yeni projeler</h2>
<p>Sipariş raporunu bitirdin. Asıl kazanım raporun kendisi değil, <b>iskelet</b>: oku → temizle → hesapla → sun → kaydet. İş hayatında karşına çıkacak küçük otomasyonların çoğu bu beş adımın farklı verilerle tekrarıdır. Bu bölümde iskeleti açıkça adlandırıyor, programı bilgisayarında çalışacak bir dosya düzenine sokuyor ve dört yeni proje varyasyonu veriyoruz. Alıştırmalarda bunlardan birini, <b>Ilgaz Bank gün sonu raporunu</b>, adım adım rehberle sıfırdan inşa edeceksin.</p>

<h3>Beş adımlık iskelet</h3>
<div class="tbl-wrap"><table>
<tr><th>Adım</th><th>Sipariş raporu</th><th>Banka gün sonu</th><th>Stok uyarısı</th><th>İK mesai özeti</th></tr>
<tr><td>Oku</td><td>CSV → sözlük listesi</td><td>hareket CSV metni</td><td>stok sözlüğü</td><td>giriş-çıkış kayıtları</td></tr>
<tr><td>Temizle</td><td><code>temizle</code></td><td>hatalı satırı say</td><td>negatif adedi ele</td><td>eksik saati ayır</td></tr>
<tr><td>Hesapla</td><td>ciro, şehir, en çok satan</td><td>bakiye, şüpheli işlem</td><td>eşik altı ürünler</td><td>toplam ve fazla mesai</td></tr>
<tr><td>Sun</td><td><code>rapor_metni</code></td><td><code>banka_raporu</code></td><td>sipariş listesi</td><td>kişi başı tablo</td></tr>
<tr><td>Kaydet</td><td>txt dosyası</td><td>tarihli txt</td><td>tedarikçiye CSV</td><td>bordroya CSV</td></tr>
</table></div>
<p>Kural aynı: her adım ayrı fonksiyon; hesap fonksiyonları <b>saf</b> (yazdırmaz, dosyaya dokunmaz, girdiyi değiştirmez), girdi/çıktı yalnızca uçlarda. Böylece "rapor biçimini değiştir" isteği hesaplara, "yeni veri kaynağı" isteği rapora dokunmaz.</p>

<h3>Programın girişi: main ve __name__ koruması</h3>
<p>Fonksiyonları yazdın; peki program nereden başlar? Python dosyası iki şekilde kullanılabilir: doğrudan çalıştırılır (<code>python rapor.py</code>) ya da başka bir dosya onu <code>import</code> eder (testler gibi). <code>if __name__ == "__main__":</code> bloğu yalnızca birinci durumda çalışır. Ayarlanabilir değerleri dosyanın başına BÜYÜK_HARFLİ sabitler olarak koy; ileride bunları ayar dosyasından ya da komut satırından okuyacaksın.</p>
<pre class="py">
ESIK_TL = 10_000            # ayarlar en üstte, tek yerde
CIKTI = "gun_sonu.txt"

def oku():
    return [("TR01", "cekme", 1200.5), ("TR02", "havale", 15000.0), ("TR01", "yatirma", 5000.0)]

def supheli(hareketler, esik):
    return [h for h in hareketler if h[1] != "yatirma" and h[2] >= esik]

def rapor(hareketler, liste):
    return f"{len(hareketler)} hareket, {len(liste)} şüpheli"

def main():
    hareketler = oku()
    liste = supheli(hareketler, ESIK_TL)
    metin = rapor(hareketler, liste)
    with open(CIKTI, "w", encoding="utf-8") as f:
        f.write(metin + "\n")
    print(metin)

if __name__ == "__main__":
    main()
</pre>
<div class="tip"><b>Neden main()?</b>Kodu modül seviyesine dağınık yazarsan, test dosyası <code>import rapor</code> dediği anda rapor üretilir ve dosya yazılır. main içine alınca import yalnız fonksiyonları tanımlar; testler onları tek tek çağırır.</div>

<h3>Kendi projeni test et: küçük assert seti</h3>
<p>Henüz pytest bilmiyorsun ama bilmen gerekmiyor: bilinen küçük girdiler için beklenen çıktıyı <code>assert</code> ile yazan bir <code>testler()</code> fonksiyonu, kodu her değiştirdiğinde "bir şeyi bozdum mu?" sorusunu saniyede cevaplar. En az üç durum test et: normal veri, boş veri, bozuk veri.</p>
<pre class="py">
def sehre_gore(siparisler):
    sonuc = {}
    for sehir, tutar in siparisler:
        sonuc[sehir] = round(sonuc.get(sehir, 0) + tutar, 2)
    return sonuc

def testler():
    assert sehre_gore([("Ankara", 10.1), ("Ankara", 0.2)]) == {"Ankara": 10.3}, "kuruş yuvarlama"
    assert sehre_gore([]) == {}, "boş gün"
    assert sehre_gore([("İzmir", 5)]) == {"İzmir": 5}, "tek kayıt"
    print("Tüm testler geçti")

testler()
</pre>

<h3>Bilgisayarında proje düzeni</h3>
<p>Tarayıcıda tek hücrede çalıştın; gerçek projede birkaç dosya olur. Basit ve yeterli düzen:</p>
<pre class="code">
gun_sonu_raporu/
├── rapor.py          # fonksiyonlar + main()
├── test_rapor.py     # assert'li testler (sonra pytest)
├── veri/
│   └── hareketler.csv
├── cikti/            # üretilen raporlar (git'e eklenmez)
└── README.md         # ne yapar, nasıl çalışır
</pre>
<pre class="code">
cd gun_sonu_raporu
python rapor.py              # Windows
python3 rapor.py             # macOS / Linux
python test_rapor.py         # testler
</pre>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>can't open file 'rapor.py'</code></td><td>Terminal başka klasörde</td><td>Önce <code>cd</code> ile proje klasörüne geç</td></tr>
<tr><td><code>FileNotFoundError: veri/hareketler.csv</code></td><td>Göreli yol çalışma klasörüne göre</td><td><code>Path(__file__).parent / "veri" / ...</code></td></tr>
<tr><td><code>python</code> komutu Microsoft Store'u açıyor</td><td>Windows takma adı</td><td><code>py rapor.py</code> ya da kurulumu PATH'e ekle</td></tr>
<tr><td>Türkçe harfler bozuk</td><td>encoding verilmemiş</td><td>Her <code>open</code>'a <code>encoding="utf-8"</code></td></tr>
</table></div>

<h3>Dört varyasyon: kendine meydan oku</h3>
<ol>
<li><b>Ilgaz Bank gün sonu</b> (alıştırmalarda rehberli): hareket CSV'sini oku, hesap bakiyelerini güncelle, eşiği aşan çekme/havaleleri işaretle, raporu yaz.</li>
<li><b>Stok uyarı raporu</b>: ürün başına farklı kritik eşik, eşiği olmayana varsayılan eşik; kritik ürünleri adede göre sırala, tedarikçiye gönderilecek listeyi üret.</li>
<li><b>İK mesai özeti</b>: çalışan, gün ve saat kayıtlarından kişi başı toplam saat ve günlük 9 saati aşan fazla mesai.</li>
<li><b>Dönem karşılaştırma</b>: dünkü ve bugünkü şehir cirolarını karşılaştır, yüzde değişimi hesapla; dün satış olmayan şehirde yüzde yerine "yeni" yaz.</li>
</ol>
<div class="warn"><b>Girdiyi değiştirme</b>Temizleme fonksiyonunda <code>kayit = s</code> yazıp <code>kayit["adet"] = int(...)</code> dersen, çağıranın orijinal listesini de değiştirirsin; aynı veriyle ikinci rapor farklı çıkar. Önce kopyala: <code>kayit = dict(s)</code>. Bakiye sözlüğü için de aynısı: <code>bakiye = dict(acilis)</code>.</div>

<h3>Bitirmeden önce: projeyi "teslim edilebilir" yapmak</h3>
<ul>
<li>README'de üç şey: ne yapar, nasıl çalıştırılır (komut), girdi dosyasının biçimi.</li>
<li>Rapor dosyasının adında tarih: <code>gun_sonu_2026-10-27.txt</code>.</li>
<li>Hatalı satır sayısı raporda görünür; sıfır değilse ayrıca hatalı satırları bir dosyaya yaz.</li>
<li>Sihirli sayılar (10000, 9 saat) sabit olarak en üstte.</li>
</ul>
<pre class="py">
from datetime import date

RAPOR_TARIHI = date(2026, 10, 27)          # gerçek betikte date.today()
ham = ["1,TR01,5000", "2,TR01,abc", "3,TR02,300", "4,TR02"]

gecerli, hatalilar = [], []
for no, satir in enumerate(ham, start=1):
    parca = satir.split(",")
    if len(parca) == 3 and parca[2].isdigit():
        gecerli.append(parca)
    else:
        hatalilar.append(f"{no}: {satir}")

ad = f"gun_sonu_{RAPOR_TARIHI.isoformat()}.txt"
with open(ad, "w", encoding="utf-8") as f:
    f.write(f"Geçerli hareket: {len(gecerli)}\n")
if hatalilar:
    with open(ad.replace(".txt", "_hatalar.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(hatalilar) + "\n")
print("Rapor:", ad)
print("Hatalı satırlar:", hatalilar)
</pre>

<div class="note"><b>Gerçek işte</b>Bir analist ya da yeni başlayan geliştiricinin ilk aylarda yazdığı işlerin çoğu tam olarak bu ölçektedir: bir klasörden dosya okuyan, birkaç hesap yapan, e-postaya yapıştırılacak ya da paylaşılan klasöre bırakılacak bir rapor üreten 100–200 satırlık betik. Bu betik bir kez yazılıp unutulmaz; her ay biri "şu sütunu da ekler misin?" der. İskeleti temiz kurduysan değişiklik on dakika sürer, kurmadıysan yeniden yazarsın. Portfolyon için de bu varyasyonlardan ikisini GitHub'a README'li biçimde koymak, iş görüşmesinde "Python biliyorum" demekten çok daha ikna edicidir.</div>
'''

EXT['ex'] = [
dict(t='mc', stage='Isınma', q='Rapor projesinde hangi fonksiyonun <code>print</code> çağırması ya da dosyaya yazması <b>uygun değildir</b>?',
     o=['main(): programın girişi ve sonucu gösteren yer', 'sehre_gore_ciro(siparisler): şehir → tutar hesaplayan fonksiyon', 'raporu_kaydet(metin, yol): metni diske yazan fonksiyon', 'Hiçbiri; her fonksiyon gerektiğinde ekrana yazabilir'], a=1,
     why='Hesap fonksiyonları saf olmalı: veri alır, değer döndürür. Böylece test edilebilir ve farklı sunumlarda (e-posta, dosya, ekran) yeniden kullanılır. Ekrana ve dosyaya yazma yalnız uçlarda (main, kaydet) yapılır.'),
dict(t='mc', stage='Isınma', q='<code>if __name__ == "__main__": main()</code> bloğunun amacı nedir?',
     o=['Programı daha hızlı çalıştırmak için yorumlayıcıya özel bir ipucu vermek', 'Dosya doğrudan çalıştırılınca main()\'i çağırmak, import edilince çağırmamak', 'main fonksiyonunu diğer dosyalardan ve import edenlerden gizlemek', 'Eski Python 2 sürümleriyle geriye dönük uyumluluk sağlamak'], a=1,
     why='Doğrudan çalıştırılan dosyada __name__ "__main__" olur; import edilen dosyada modülün adıdır. Böylece test dosyası import ettiğinde rapor üretilmez, yalnız fonksiyonlar tanımlanır.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
adetler = {}
for urun, adet in [("Mouse", 2), ("Klavye", 3), ("Mouse", 1)]:
    adetler[urun] = adetler.get(urun, 0) + adet
print(max(adetler, key=adetler.get), adetler)
''', o=["Mouse {'Mouse': 3, 'Klavye': 3}", "Klavye {'Mouse': 3, 'Klavye': 3}", "Mouse {'Mouse': 2, 'Klavye': 3}", "Klavye {'Klavye': 3, 'Mouse': 3}"], a=0,
     why='Mouse 2+1=3, Klavye 3: eşitlik var. max eşitlikte ilk karşılaştığı (sözlüğe ilk eklenen) anahtarı döndürür: Mouse. Raporda eşitlik kuralı önemliyse key\'i bilinçli seç (ör. adet, sonra ad).'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
ciro = {"İzmir": 820.0, "Ankara": 1830.0, "Bursa": 450.0}
for sehir, tutar in sorted(ciro.items(), key=lambda x: x[1], reverse=True)[:2]:
    print(f"{sehir:<7}|{tutar:>9,.2f}")
''', o=['Ankara | 1,830.00\nİzmir  |   820.00', 'Ankara|1,830.00\nİzmir|820.00', 'Bursa  |   450.00\nİzmir  |   820.00', 'Ankara |  1830.00\nİzmir  |    820.00'], a=0,
     why='Değere göre azalan sıralayıp ilk ikisini alır. :<7 adı 7 karaktere sola, :>9,.2f tutarı binlik ayırıcı ve 2 ondalıkla 9 karaktere sağa yaslar.'),
dict(t='predict', stage='Kodu oku', q='Temizleme fonksiyonu girdiyi kopyalamıyor. Bu kod ne yazdırır?',
     code=r'''
def temizle(kayitlar):
    for k in kayitlar:
        k["adet"] = int(k["adet"]) * 2
    return kayitlar

ham = [{"adet": "3"}]
temizle(ham)
temizle(ham)
print(ham)
''', o=["[{'adet': '3'}]", "[{'adet': 6}]", "[{'adet': 12}]", "[{'adet': '33'}]"], a=2,
     why='Fonksiyon aynı sözlüğü yerinde değiştiriyor. İlk çağrı "3" → 6, ikinci çağrı 6 → 12 yapar ve ham da değişir. Bu yüzden temizlemede dict(k) ile kopya alınır.'),
dict(t='order', stage='Kodu oku', q='<p>main() ile yapılandırılmış küçük bir rapor programının satırlarını sırala. Çıktı: <code>2 kayıt, toplam 200</code></p>',
     lines=['def main():',
            '    ham = ["Ankara;120", "İzmir;x", "Ankara;80"]',
            '    gecerli = [s.split(";") for s in ham if s.split(";")[1].isdigit()]',
            '    toplam = sum(int(t) for _, t in gecerli)',
            '    print(len(gecerli), "kayıt, toplam", toplam)',
            'if __name__ == "__main__":',
            '    main()'],
     expect='2 kayıt, toplam 200\n',
     hint='Veri → temizle → hesapla → yazdır; main çağrısı en sonda ve koruma bloğunun içinde.',
     why='İskelet sırası: veri, temizleme (geçerli satırlar), hesap (toplam), sunum (print). __name__ koruması dosyanın en altında yer alır.'),
dict(t='code', id='proje-temel-x1', stage='Rehberli', diff=2,
     q='<p><b>Banka projesi, Adım 1: Oku ve temizle.</b> Ilgaz Bank hareket dosyası şu biçimde: başlık <code>id,tarih,hesap,tur,tutar</code>; tur yalnız <code>yatirma</code>, <code>cekme</code>, <code>havale</code> olabilir.</p><p><code>hareketleri_oku(metin)</code> fonksiyonu <code>(hareketler, hatali)</code> döndürsün:</p><ul><li><code>hareketler</code>: her geçerli satır için <code>{"id": int, "tarih": str, "hesap": str, "tur": str, "tutar": float}</code></li><li><code>hatali</code>: alan sayısı 5 olmayan, tutarı/id\'si sayıya çevrilemeyen ya da türü bilinmeyen satır sayısı. Boş satırlar sayılmaz, atlanır.</li></ul>',
     guide=['metin.strip().splitlines() ile satırlara böl, [1:] ile başlığı atla.', 'Boş satırı (strip sonrası) continue ile geç.', 'try içinde satırı virgülle 5 değişkene aç: alan sayısı yanlışsa açma işlemi ValueError verir.', 'Tür TURLER içinde değilse kendin raise ValueError yap.', 'Sözlüğü oluştururken int ve float çevirisi yap; except ValueError\'da hatali += 1.'],
     example=r'''
# Farklı veri: personel satırları "ad,yas" → yanlış alan sayısı da ValueError verir
for satir in ["Ayşe,34", "Mehmet", "Can,30,fazla"]:
    try:
        ad, yas = satir.split(",")
        print(ad, int(yas))
    except ValueError as e:
        print("hatalı:", satir, "→", e)
''',
     start=r'''
TURLER = ("yatirma", "cekme", "havale")

def hareketleri_oku(metin):
    hareketler, hatali = [], 0
    for satir in metin.strip().splitlines()[1:]:
        # TODO: boş satırı atla
        # TODO: try: 5 alana aç, türü denetle, sözlüğü ekle
        # TODO: except ValueError: hatali += 1
        pass
    return hareketler, hatali
''',
     sol='\n' + BANKA_HELPERS.split('def hesap_bakiyeleri')[0],
     tests=BANKA_METIN_TEST + r'''
h, hatali = hareketleri_oku(METIN)
assert [x["id"] for x in h] == [1, 2, 3, 5, 6], "Geçerli id'ler 1,2,3,5,6 olmalı, gelen: " + str([x["id"] for x in h])
assert hatali == 3, "3 hatalı satır var: tutar 'abc', tür 'iade', eksik alanlı satır. Boş satır SAYILMAZ. Gelen: " + str(hatali)
assert h[1] == {"id": 2, "tarih": "2026-10-27", "hesap": "TR01", "tur": "cekme", "tutar": 1200.5}, "Sözlük yapısı ve türler: " + str(h[1])
assert isinstance(h[0]["tutar"], float), "tutar float olmalı"
assert hareketleri_oku("id,tarih,hesap,tur,tutar\n") == ([], 0), "Yalnız başlık varsa boş liste ve 0"
''',
     hints=['Alan sayısı denetimini ayrıca yazmana gerek yok: a, b, c, d, e = liste fazla/eksik elemanda ValueError verir.', 'raise ValueError("bilinmeyen tür") ile türü de aynı except bloğuna yönlendir.', 'id_, tarih, hesap, tur, tutar = satir.strip().split(",")'],
     why='Tek bir except ValueError üç farklı bozukluğu (alan sayısı, sayı çevirisi, bilinmeyen tür) yakalar; böylece temizleme mantığı kısa kalır ve hiçbir bozuk satır programı durdurmaz.'),
dict(t='code', id='proje-temel-x2', stage='Rehberli', diff=2,
     q='<p><b>Banka projesi, Adım 2: Bakiyeleri hesapla.</b> <code>hesap_bakiyeleri(hareketler, acilis)</code>: <code>acilis</code> hesap → açılış bakiyesi sözlüğüdür. <code>yatirma</code> bakiyeyi artırır, <code>cekme</code> ve <code>havale</code> azaltır. Açılışta olmayan hesap 0\'dan başlar. Her güncellemede 2 ondalığa yuvarla. <b>acilis sözlüğünü değiştirme</b>; yeni sözlük döndür.</p>',
     guide=['acilis\'in kopyasını al: bakiye = dict(acilis).', 'Her harekette türüne göre işaret belirle (+1 ya da -1).', 'bakiye.get(hesap, 0) ile mevcut değeri al, işaret × tutar ekle ve yuvarla.', 'Kopyayı döndür.'],
     example=r'''
# Farklı veri: depo giriş/çıkışlarından stok hesabı
baslangic = {"kablo": 10}
stok = dict(baslangic)
for urun, yon, adet in [("kablo", "giris", 5), ("mouse", "cikis", 2)]:
    isaret = 1 if yon == "giris" else -1
    stok[urun] = stok.get(urun, 0) + isaret * adet
print(stok, baslangic)
''',
     start=r'''
def hesap_bakiyeleri(hareketler, acilis):
    bakiye = acilis          # TODO: bu bir kopya değil!
    for h in hareketler:
        # TODO: yatirma → +1, diğerleri → -1
        # TODO: bakiye[hesap] = round(eski + isaret * tutar, 2)
        pass
    return bakiye
''',
     sol=r'''
def hesap_bakiyeleri(hareketler, acilis):
    bakiye = dict(acilis)
    for h in hareketler:
        isaret = 1 if h["tur"] == "yatirma" else -1
        bakiye[h["hesap"]] = round(bakiye.get(h["hesap"], 0) + isaret * h["tutar"], 2)
    return bakiye
''',
     tests=r'''
H = [{"id": 1, "hesap": "TR01", "tur": "yatirma", "tutar": 5000.0},
     {"id": 2, "hesap": "TR01", "tur": "cekme", "tutar": 1200.5},
     {"id": 3, "hesap": "TR02", "tur": "havale", "tutar": 15000.0},
     {"id": 5, "hesap": "TR03", "tur": "cekme", "tutar": 300.0},
     {"id": 6, "hesap": "TR01", "tur": "havale", "tutar": 0.1},
     {"id": 7, "hesap": "TR01", "tur": "yatirma", "tutar": 0.2}]
acilis = {"TR01": 1000.0, "TR02": 20000.0}
b = hesap_bakiyeleri(H, acilis)
assert b == {"TR01": 4799.6, "TR02": 5000.0, "TR03": -300.0}, "Beklenen {'TR01': 4799.6, 'TR02': 5000.0, 'TR03': -300.0}, gelen: " + str(b)
assert acilis == {"TR01": 1000.0, "TR02": 20000.0}, "acilis sözlüğü DEĞİŞMEMELİ: dict(acilis) ile kopya al"
assert hesap_bakiyeleri([], {"TR09": 5}) == {"TR09": 5}, "Hareket yoksa açılış bakiyeleri aynen dönmeli"
''',
     hints=['bakiye = acilis yalnızca ikinci bir ad oluşturur; kopya için dict(acilis).', 'Koşullu ifade: isaret = 1 if h["tur"] == "yatirma" else -1', 'bakiye[h["hesap"]] = round(bakiye.get(h["hesap"], 0) + isaret * h["tutar"], 2)'],
     why='Kopya almak saf fonksiyonun şartıdır; aksi hâlde aynı açılış bakiyesiyle ikinci hesaplama yanlış çıkar. Her adımda yuvarlamak kuruş hatalarının birikmesini önler (0.1 + 0.2 örneği).'),
dict(t='code', id='proje-temel-x3', stage='Rehberli', diff=2,
     q='<p><b>Banka projesi, Adım 3: Şüpheli işlemler.</b> <code>supheli_islemler(hareketler, esik)</code>: türü <code>cekme</code> ya da <code>havale</code> olup tutarı <code>esik</code>\'e <b>eşit veya büyük</b> hareketlerin <code>id</code>\'lerini, tutara göre <b>büyükten küçüğe</b> sıralı liste olarak döndür. Yatırmalar şüpheli sayılmaz.</p>',
     guide=['Koşulu sağlayan hareketleri bir listeye süz (comprehension ya da for + if).', 'Süzülen listeyi key=lambda h: h["tutar"] ve reverse=True ile sırala.', 'Sıralı listeden yalnız id\'leri çek ve döndür.'],
     example=r'''
# Farklı veri: 30 dakikadan uzun teslimatların kodları, süreye göre azalan
teslimatlar = [{"kod": "A", "dk": 45}, {"kod": "B", "dk": 20}, {"kod": "C", "dk": 90}]
uzun = [t for t in teslimatlar if t["dk"] >= 30]
uzun.sort(key=lambda t: t["dk"], reverse=True)
print([t["kod"] for t in uzun])
''',
     start=r'''
def supheli_islemler(hareketler, esik):
    # TODO: tur yatirma DEĞİL ve tutar >= esik olanları süz
    adaylar = []
    # TODO: tutara göre azalan sırala
    # TODO: yalnız id'leri döndür
    return adaylar
''',
     sol=r'''
def supheli_islemler(hareketler, esik):
    adaylar = [h for h in hareketler if h["tur"] != "yatirma" and h["tutar"] >= esik]
    adaylar.sort(key=lambda h: h["tutar"], reverse=True)
    return [h["id"] for h in adaylar]
''',
     tests=r'''
H = [{"id": 1, "tur": "yatirma", "tutar": 50000.0},
     {"id": 2, "tur": "cekme", "tutar": 1200.5},
     {"id": 3, "tur": "havale", "tutar": 15000.0},
     {"id": 6, "tur": "havale", "tutar": 9000.0},
     {"id": 8, "tur": "cekme", "tutar": 10000.0}]
assert supheli_islemler(H, 10000) == [3, 8], "Eşik 10000: havale 15000 (id 3) ve tam 10000 olan çekme (id 8). Yatırma sayılmaz. Gelen: " + str(supheli_islemler(H, 10000))
assert supheli_islemler(H, 5000) == [3, 8, 6], "Tutara göre büyükten küçüğe sıralı olmalı"
assert supheli_islemler(H, 10**9) == [], "Eşik çok yüksekse boş liste"
''',
     hints=['İki koşul: h["tur"] != "yatirma" and h["tutar"] >= esik', 'list.sort(key=..., reverse=True) yerinde sıralar; sorted(...) yeni liste döndürür.', 'return [h["id"] for h in adaylar]'],
     why='Süz → sırala → seç: veri işlemenin en sık üçlüsü. Eşitlik (>=) iş kuralında açıkça belirtilmeli; tam eşikteki işlem de şüphelidir.'),
dict(t='code', id='proje-temel-x4', stage='Rehberli', diff=2,
     q='<p><b>Banka projesi, Adım 4: Rapor metni.</b> <code>banka_raporu(bakiyeler, supheli, hatali, tarih)</code> şu satırları <code>"\\n"</code> ile birleştirip döndürsün (tarih <code>"2026-10-27"</code> biçiminde gelir):</p><pre class="out">ILGAZ BANK GÜN SONU - 27.10.2026\nHesap sayısı  : 3\n  TR01        4,800.60 TL\n  TR02        5,000.00 TL\n  TR03         -300.00 TL\nŞüpheli işlem : 2 (3, 8)\nHatalı satır  : 1</pre><ul><li>Hesap satırları hesap adına göre alfabetik; biçim <code>f"  {hesap:&lt;6}{bakiye:&gt;14,.2f} TL"</code>.</li><li>Şüpheli liste boşsa satır <code>Şüpheli işlem : yok</code> olsun.</li></ul>',
     guide=['tarih.split("-") ile yıl, ay, günü al ve başlığı gün.ay.yıl olarak kur.', 'Hesap sayısı satırını ekle.', 'sorted(bakiyeler) ile hesapları dolaş, verilen biçimle satır ekle.', 'Şüpheli satırı: liste doluysa sayı ve ", ".join ile id\'ler, boşsa "yok".', 'Hatalı satır sayısını ekle ve "\\n".join ile birleştir.'],
     example=r'''
yil, ay, gun = "2026-01-05".split("-")
print(f"{gun}.{ay}.{yil}")
ids = [12, 7]
print(", ".join(str(i) for i in ids))
print(f"  {'TR9':<6}{-1234.5:>14,.2f} TL")
''',
     start=r'''
def banka_raporu(bakiyeler, supheli, hatali, tarih):
    yil, ay, gun = tarih.split("-")
    satirlar = [f"ILGAZ BANK GÜN SONU - {gun}.{ay}.{yil}"]
    # TODO: "Hesap sayısı  : N"
    # TODO: alfabetik hesap satırları
    # TODO: şüpheli satırı (dolu / "yok")
    # TODO: "Hatalı satır  : N"
    return "\n".join(satirlar)
''',
     sol='\n' + 'def banka_raporu' + BANKA_HELPERS.split('def banka_raporu')[1],
     tests=r'''
r = banka_raporu({"TR03": -300.0, "TR01": 4800.6, "TR02": 5000.0}, [3, 8], 1, "2026-10-27")
beklenen = "ILGAZ BANK GÜN SONU - 27.10.2026\nHesap sayısı  : 3\n  TR01        4,800.60 TL\n  TR02        5,000.00 TL\n  TR03         -300.00 TL\nŞüpheli işlem : 2 (3, 8)\nHatalı satır  : 1"
r_s, b_s = r.splitlines(), beklenen.splitlines()
assert len(r_s) == len(b_s), f"{len(b_s)} satır bekleniyordu, {len(r_s)} geldi"
for i, (g, b) in enumerate(zip(r_s, b_s), 1):
    assert g == b, f"{i}. satır farklı:\n  beklenen: {b!r}\n  gelen   : {g!r}"
r2 = banka_raporu({}, [], 0, "2026-01-05")
assert r2.splitlines() == ["ILGAZ BANK GÜN SONU - 05.01.2026", "Hesap sayısı  : 0", "Şüpheli işlem : yok", "Hatalı satır  : 0"], "Boş günde de rapor üretilmeli: " + repr(r2)
''',
     hints=['Satırları bir listeye ekle, en sonda tek seferde birleştir.', 'Şüpheli id\'leri metne çevirip birleştir: ", ".join(str(i) for i in supheli)', 'if supheli: satirlar.append(f"Şüpheli işlem : {len(supheli)} (" + ... + ")") else: satirlar.append("Şüpheli işlem : yok")'],
     why='Sunum fonksiyonu hesap yapmaz, hazır sonuçları biçimler. Boş durumun ("yok", 0 hesap) ayrıca test edilmesi, sipariş/hareket olmayan günde raporun çökmemesini garanti eder.'),
dict(t='code', id='proje-temel-x5', stage='Kendin yaz', diff=2,
     q='<p><b>Varyasyon: Stok uyarı raporu.</b> <code>kritik_stoklar(stok, esikler, varsayilan=5)</code>: <code>stok</code> ürün → adet, <code>esikler</code> ürün → kritik eşik sözlüğü. Eşiği olmayan ürün için <code>varsayilan</code> kullanılır. Adedi eşiğine <b>eşit veya altında</b> olan ürünleri <code>(urun, adet)</code> demetleri olarak döndür; adede göre artan, eşit adette ürün adına göre alfabetik sırala.</p>',
     sol=r'''
def kritik_stoklar(stok, esikler, varsayilan=5):
    kritik = [(u, a) for u, a in stok.items() if a <= esikler.get(u, varsayilan)]
    return sorted(kritik, key=lambda x: (x[1], x[0]))
''',
     tests=r'''
stok = {"kulaklık": 4, "kablo": 30, "monitör": 2, "mouse": 6, "klavye": 2, "webcam": 5}
esikler = {"kablo": 50, "mouse": 10}
k = kritik_stoklar(stok, esikler)
assert k == [("klavye", 2), ("monitör", 2), ("kulaklık", 4), ("webcam", 5), ("mouse", 6), ("kablo", 30)], "Sıralama adet artan, eşitlikte ad: " + str(k)
assert kritik_stoklar(stok, {}, varsayilan=2) == [("klavye", 2), ("monitör", 2)], "varsayilan parametresi kullanılmalı"
assert kritik_stoklar({}, esikler) == [], "Boş stok"
''',
     hints=['Ürünün eşiği: esikler.get(urun, varsayilan).', 'Çoklu sıralama anahtarı demettir: key=lambda x: (x[1], x[0]).'],
     why='get ile varsayılan eşik, ayrı if dallarını gereksiz kılar. Demet anahtar, birincil ve ikincil sıralamayı tek seferde yapar; rapor her çalıştırmada aynı sırada çıkar.'),
dict(t='code', id='proje-temel-x6', stage='Kendin yaz', diff=2,
     q='<p><b>Varyasyon: İK mesai özeti.</b> <code>mesai_ozeti(kayitlar, gunluk_sinir=9)</code>: <code>kayitlar</code> <code>(ad, gun, saat)</code> demetleridir; aynı kişinin aynı gün birden çok kaydı olabilir (saatleri toplanır). Sonuç: ad → <code>{"toplam": ..., "fazla": ...}</code>. <code>fazla</code>, her gün için günlük toplamın <code>gunluk_sinir</code>\'ı aşan kısmının toplamıdır.</p>',
     sol=r'''
def mesai_ozeti(kayitlar, gunluk_sinir=9):
    gunluk = {}
    for ad, gun, saat in kayitlar:
        gunluk[(ad, gun)] = gunluk.get((ad, gun), 0) + saat
    ozet = {}
    for (ad, gun), saat in gunluk.items():
        k = ozet.setdefault(ad, {"toplam": 0, "fazla": 0})
        k["toplam"] += saat
        k["fazla"] += max(0, saat - gunluk_sinir)
    return ozet
''',
     tests=r'''
K = [("Ayşe", "Pzt", 8), ("Ayşe", "Pzt", 3), ("Ayşe", "Sal", 9), ("Can", "Pzt", 10), ("Can", "Sal", 7.5), ("Elif", "Pzt", 4)]
o = mesai_ozeti(K)
assert o["Ayşe"] == {"toplam": 20, "fazla": 2}, "Ayşe: Pzt 8+3=11 (2 fazla), Sal 9 (fazla yok). Gelen: " + str(o.get("Ayşe"))
assert o["Can"] == {"toplam": 17.5, "fazla": 1}, "Can: Pzt 10 (1 fazla), Sal 7.5"
assert o["Elif"] == {"toplam": 4, "fazla": 0}
assert mesai_ozeti(K, gunluk_sinir=8)["Ayşe"]["fazla"] == 4, "Sınır 8 ise Ayşe: 3 + 1 = 4 fazla"
assert mesai_ozeti([]) == {}
''',
     hints=['Önce (ad, gün) anahtarıyla günlük toplamları çıkar; fazla mesai ancak gün toplamı belli olunca hesaplanır.', 'max(0, saat - sinir) negatif fazla mesaiyi önler; setdefault iç sözlüğü bir kez oluşturur.'],
     why='İki aşamalı gruplama: önce kişi+gün, sonra kişi. Fazla mesaiyi tek tek kayıtlar üzerinden hesaplamak (8 ve 3 ayrı ayrı sınırın altında) yanlış sonuç verir; iş kuralı gün toplamına bakar.'),
dict(t='code', id='proje-temel-x7', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>temizle(ham)</code> geçerli kayıtların <b>kopyalarında</b> adet\'i int\'e çevirmeli ve <code>(temiz, atlanan)</code> döndürmeli. Rapor ilk çalıştırmada doğru ama aynı <code>ham</code> listesiyle ikinci kez çalışınca bozuk kayıt sayısı değişiyor; çağıranın verisi de bozuluyor.</p>',
     start=r'''
def temizle(ham):
    temiz, atlanan = [], 0
    for s in ham:
        kayit = s
        try:
            kayit["adet"] = int(kayit["adet"])
            if kayit["adet"] <= 0:
                raise ValueError
            temiz.append(kayit)
        except (KeyError, ValueError):
            kayit["adet"] = 0
            atlanan += 1
    return temiz, atlanan
''',
     sol=r'''
def temizle(ham):
    temiz, atlanan = [], 0
    for s in ham:
        kayit = dict(s)
        try:
            kayit["adet"] = int(kayit["adet"])
            if kayit["adet"] <= 0:
                raise ValueError
            temiz.append(kayit)
        except (KeyError, ValueError):
            atlanan += 1
    return temiz, atlanan
''',
     tests=r'''
ham = [{"urun": "Mouse", "adet": "3"}, {"urun": "Klavye", "adet": "yok"}, {"urun": "Kablo", "adet": "-1"}, {"urun": "Webcam"}]
t1, a1 = temizle(ham)
assert ham[0]["adet"] == "3", "Girdi değişmemeli: kayit = dict(s) ile kopya al"
assert "adet" not in ham[3] and ham[1]["adet"] == "yok", "Hatalı kayıtlar da yerinde değiştirilmemeli (adet=0 atama satırı gereksiz)"
t2, a2 = temizle(ham)
assert (len(t1), a1) == (1, 3) and (len(t2), a2) == (1, 3), "İki çalıştırma aynı sonucu vermeli: 1 temiz, 3 atlanan"
assert t1[0] == {"urun": "Mouse", "adet": 3}
''',
     hints=['kayit = s yeni sözlük oluşturmaz; aynı nesneye ikinci ad verir.', 'dict(s) ile kopyala; except içindeki kayit["adet"] = 0 satırı da girdiyi bozuyor, sil.'],
     why='Takma ad (alias) hatası: kayit ve s aynı sözlüktür. Kopya almadan yapılan her değişiklik çağıranın listesine yansır ve fonksiyon ikinci kez çağrıldığında farklı sonuç verir. Saf fonksiyonun ilk kuralı: girdiyi değiştirme.'),
dict(t='code', id='proje-temel-x8', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>pay_tablosu(ciro)</code> şehirleri ciroya göre <b>büyükten küçüğe</b> sıralayıp her biri için <code>"Ankara  %60.0"</code> biçiminde satır listesi döndürmeli (pay 1 ondalık, ad 8 karaktere sola yaslı). Toplam ciro 0 ise boş liste. Şu an sıra alfabetik, yüzdeler hep 0 ve boş/sıfır cirolu veride program çöküyor.</p>',
     start=r'''
def pay_tablosu(ciro):
    toplam = sum(ciro.values())
    satirlar = []
    for sehir in sorted(ciro):
        pay = ciro[sehir] // toplam * 100
        satirlar.append(f"{sehir:<8}%{pay:.1f}")
    return satirlar
''',
     sol=r'''
def pay_tablosu(ciro):
    toplam = sum(ciro.values())
    if toplam == 0:
        return []
    satirlar = []
    for sehir, tutar in sorted(ciro.items(), key=lambda x: x[1], reverse=True):
        pay = tutar / toplam * 100
        satirlar.append(f"{sehir:<8}%{pay:.1f}")
    return satirlar
''',
     tests=r'''
t = pay_tablosu({"İzmir": 250.0, "Ankara": 600.0, "Bursa": 150.0})
assert t == ["Ankara  %60.0", "İzmir   %25.0", "Bursa   %15.0"], "Ciroya göre azalan sıra ve doğru yüzdeler: " + str(t)
assert pay_tablosu({}) == [], "Boş sözlük → boş liste (sıfıra bölme olmamalı)"
assert pay_tablosu({"Van": 0}) == [], "Toplam 0 → boş liste"
''',
     hints=['Üç sorun: sıralama anahtarı, // (tam bölme) ve toplam 0 kontrolü.', 'sorted(ciro.items(), key=lambda x: x[1], reverse=True) ve tutar / toplam * 100'],
     why='sorted(ciro) anahtarları (şehir adlarını) sıralar; değere göre sıralama için key gerekir. // tam sayı bölmesi 600 // 1000 = 0 verir. Toplamı 0 olan veri için erken dönüş, sipariş olmayan günde çökmeyi önler.'),
dict(t='code', id='proje-temel-x9', stage='Meydan okuma', diff=3,
     q='<p><b>Varyasyon: Dönem karşılaştırma.</b> <code>karsilastir(dun, bugun)</code>: iki sözlük şehir → ciro. Her iki sözlükteki şehirlerin <b>birleşimi</b> için <code>(sehir, dun_ciro, bugun_ciro, degisim)</code> demeti üret; olmayan taraf 0 sayılır. <code>degisim</code>: dünkü ciro 0 ise <code>"yeni"</code> (bugün de 0 ise <code>"-"</code>), değilse yüzde değişim 1 ondalığa yuvarlanmış float (<code>(bugun-dun)/dun*100</code>). Liste, <b>mutlak ciro farkına</b> (<code>abs(bugun-dun)</code>) göre büyükten küçüğe, eşitlikte şehir adına göre alfabetik sıralı olsun.</p>',
     sol=r'''
def karsilastir(dun, bugun):
    sonuc = []
    for sehir in set(dun) | set(bugun):
        d, b = dun.get(sehir, 0), bugun.get(sehir, 0)
        if d == 0:
            degisim = "-" if b == 0 else "yeni"
        else:
            degisim = round((b - d) / d * 100, 1)
        sonuc.append((sehir, d, b, degisim))
    sonuc.sort(key=lambda x: (-abs(x[2] - x[1]), x[0]))
    return sonuc
''',
     tests=r'''
dun = {"Ankara": 1000.0, "İzmir": 800.0, "Bursa": 300.0, "Van": 0}
bugun = {"Ankara": 1250.0, "İzmir": 600.0, "Konya": 200.0, "Van": 0}
r = karsilastir(dun, bugun)
beklenen = [("Bursa", 300.0, 0, -100.0), ("Ankara", 1000.0, 1250.0, 25.0), ("Konya", 0, 200.0, "yeni"), ("İzmir", 800.0, 600.0, -25.0), ("Van", 0, 0, "-")]
assert r == beklenen, "Beklenen:\n" + str(beklenen) + "\nGelen:\n" + str(r)
assert karsilastir({}, {}) == [], "İki boş sözlük"
assert karsilastir({"A": 3}, {"A": 4})[0][3] == 33.3, "Yüzde 1 ondalığa yuvarlanmalı"
''',
     hints=['Şehir birleşimi: set(dun) | set(bugun). Olmayan değer için .get(sehir, 0).', 'Sıra: önce mutlak fark (büyükten küçüğe), sonra ad. key=lambda x: (-abs(x[2] - x[1]), x[0])', 'Dikkat: Ankara ve Konya farkları 250 ve 200; Konya ile İzmir eşit (200): eşitlikte "Konya", "İzmir"den önce gelir (İ harfi Unicode\'da Latin harflerinden sonradır).'],
     why='Birleşim kümesi, yalnız bir dönemde var olan şehirleri kaçırmamayı sağlar. Sıfıra bölme iş diliyle çözülür ("yeni"). Negatif anahtar hilesi, bir ölçütte azalan diğerinde artan sıralamayı tek sort ile yapar.'),
dict(t='code', id='proje-temel-x10', stage='Mini proje', diff=3,
     q='<p><b>Banka projesi, Adım 5: Hepsini birleştir.</b> Önceki adımların fonksiyonları başlangıç kodunda hazır. <code>gun_sonu(metin, acilis, esik, yol)</code> fonksiyonunu yaz:</p><ol><li>Metni oku/temizle (<code>hareketleri_oku</code>).</li><li>Bakiyeleri ve şüpheli işlemleri hesapla.</li><li>Raporu üret: tarih ilk geçerli hareketin tarihi; geçerli hareket yoksa <code>"0000-00-00"</code>.</li><li>Raporu <code>yol</code>\'a utf-8 ile, sonunda satır sonu olacak şekilde yaz.</li><li>Rapor metnini döndür.</li></ol>',
     guide=['hareketleri_oku(metin) ile (hareketler, hatali) al.', 'hesap_bakiyeleri ve supheli_islemler\'i çağır.', 'Tarihi koşullu ifadeyle seç: hareketler doluysa hareketler[0]["tarih"].', 'banka_raporu ile metni üret, with open(yol, "w", encoding="utf-8") ile yaz.', 'Metni döndür.'],
     example=r'''
# Aynı birleştirme fikri, küçük ölçek: oku → hesapla → sun → kaydet
def oku(m): return [int(x) for x in m.split(",") if x.strip().isdigit()]
def hesapla(s): return sum(s)
def sun(t): return f"Toplam: {t}"
def calistir(m, yol):
    metin = sun(hesapla(oku(m)))
    with open(yol, "w", encoding="utf-8") as f:
        f.write(metin + "\n")
    return metin
print(calistir("3, 4, x, 5", "ornek_toplam.txt"))
''',
     start=BANKA_HELPERS + r'''

def gun_sonu(metin, acilis, esik, yol):
    # TODO: oku → bakiye → şüpheli → tarih → rapor → dosyaya yaz → döndür
    pass
''',
     sol=BANKA_HELPERS + r'''

def gun_sonu(metin, acilis, esik, yol):
    hareketler, hatali = hareketleri_oku(metin)
    bakiyeler = hesap_bakiyeleri(hareketler, acilis)
    supheli = supheli_islemler(hareketler, esik)
    tarih = hareketler[0]["tarih"] if hareketler else "0000-00-00"
    rapor = banka_raporu(bakiyeler, supheli, hatali, tarih)
    with open(yol, "w", encoding="utf-8") as f:
        f.write(rapor + "\n")
    return rapor
''',
     tests=BANKA_METIN_TEST + r'''
r = gun_sonu(METIN, {"TR01": 1000.0, "TR02": 20000.0}, 9000, "x10_gun_sonu.txt")
beklenen = "ILGAZ BANK GÜN SONU - 27.10.2026\nHesap sayısı  : 3\n  TR01       -4,200.50 TL\n  TR02        5,000.00 TL\n  TR03         -300.00 TL\nŞüpheli işlem : 2 (3, 6)\nHatalı satır  : 3"
assert r == beklenen, "Rapor farklı. Beklenen:\n" + beklenen + "\nGelen:\n" + str(r)
assert open("x10_gun_sonu.txt", encoding="utf-8").read() == beklenen + "\n", "Rapor dosyaya sonunda satır sonuyla yazılmalı"
r2 = gun_sonu("id,tarih,hesap,tur,tutar\n9,x,TR1,iade,5\n", {}, 100, "x10_bos.txt")
assert r2.splitlines()[0] == "ILGAZ BANK GÜN SONU - 00.00.0000", "Geçerli hareket yoksa tarih 0000-00-00 olmalı"
assert r2.splitlines()[-1] == "Hatalı satır  : 1"
''',
     hints=['Fonksiyonları sırayla çağır; her birinin çıktısı bir sonrakinin girdisi.', 'tarih = hareketler[0]["tarih"] if hareketler else "0000-00-00"', 'Dosyaya rapor + "\\n" yaz, sonra return rapor.'],
     why='Birleştirici fonksiyon kendi hesabını yapmaz; yalnız adımları sıraya koyar. Her adım ayrı test edildiği için burada hata çıkarsa yeri hemen bulunur. Boş gün senaryosu, gece çalışan işin hiçbir koşulda çökmemesini garanti eder.'),
]

EXT['faq'] = [
 dict(q='Projemi GitHub\'a koymak istiyorum, nelere dikkat etmeliyim?', a='README (ne yapar, nasıl çalışır, örnek çıktı), örnek veri dosyası (gerçek müşteri verisi ASLA), testler ve .gitignore (cikti/ klasörü, __pycache__). Kişisel ya da kurumsal veriyi, şifreleri ve API anahtarlarını depoya koyma. Git ayrıntıları orta seviyedeki Git ve proje yapısı dersinde.'),
 dict(q='Projem büyüdü, tek dosya karıştı. Ne yapmalıyım?', a='Önce dosya içinde bölümlere ayır (okuma, hesap, rapor). 300-400 satırı geçince bu bölümleri ayrı modüllere taşı (okuma.py, hesap.py, rapor.py) ve main dosyasında import et. Modüller ve paketler dersinde bunun düzenini göreceksin.'),
]
EXT['mistakes'] = [
 dict(bad='def temizle(ham):\n    for s in ham:\n        s["adet"] = int(s["adet"])\n    return ham', good='def temizle(ham):\n    temiz = []\n    for s in ham:\n        kayit = dict(s)\n        kayit["adet"] = int(kayit["adet"])\n        temiz.append(kayit)\n    return temiz', why='Girdiyi yerinde değiştirmek çağıranın verisini bozar; aynı veriyle ikinci çalıştırma farklı sonuç verir. Kopya üzerinde çalış.'),
 dict(bad='# rapor.py\nveri = oku("veri.csv")\nprint(rapor_metni(veri))', good='# rapor.py\ndef main():\n    veri = oku("veri.csv")\n    print(rapor_metni(veri))\n\nif __name__ == "__main__":\n    main()', why='Modül seviyesindeki kod import edildiği anda çalışır; testler rapor üretir, dosya arar. main() ve __name__ koruması programın girişini tek yere toplar.'),
]
