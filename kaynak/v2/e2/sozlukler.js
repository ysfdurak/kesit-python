/* Kesit Python v2 — uzantı: sozlukler */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'sozlukler',
  min: 35,
  html: `
<h2>Sözlükleri birleştirmek</h2>
<p>İki kaynaktan gelen ayarları ya da fiyat listelerini birleştirmek günlük iştir. Python 3.9'dan beri bunun için <code>|</code> (yeni sözlük) ve <code>|=</code> (yerinde) operatörleri var. Aynı anahtar iki tarafta da varsa <b>sağdaki kazanır</b>. Eski kodlarda aynı işi <code>{**a, **b}</code> ya da <code>a.update(b)</code> ile görürsün.</p>
<pre class="py">varsayilan = {"para_birimi": "TL", "kdv": 0.20, "kargo": 49.9}
kampanya = {"kargo": 0, "indirim": 0.10}

ayar = varsayilan | kampanya          # yeni sözlük, sağdaki kazanır
print(ayar)
print(varsayilan)                     # değişmedi

eski_yol = {**varsayilan, **kampanya} # aynı sonuç
print(ayar == eski_yol)

varsayilan |= {"kdv": 0.10}           # yerinde güncelleme
print(varsayilan["kdv"])</pre>
<p>Birleştirme <b>üzerine yazar</b>, toplamaz. İki deponun stoklarını toplamak istiyorsan döngüyle <code>get(..., 0)</code> kalıbını kullanırsın; aşağıdaki alıştırmalarda bunu yapacaksın.</p>

<h2>Silmenin dört yolu</h2>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Dönen değer</th><th>Anahtar yoksa</th><th>Ne zaman?</th></tr>
<tr><td><code>del d[k]</code></td><td>-</td><td><code>KeyError</code></td><td>Anahtarın var olduğundan eminsen</td></tr>
<tr><td><code>d.pop(k)</code></td><td>Silinen değer</td><td><code>KeyError</code></td><td>Değeri kullanacaksan</td></tr>
<tr><td><code>d.pop(k, varsayilan)</code></td><td>Değer ya da varsayılan</td><td>Varsayılanı döndürür</td><td>"Varsa al ve sil"</td></tr>
<tr><td><code>d.popitem()</code></td><td>Son eklenen (anahtar, değer)</td><td>Boşsa <code>KeyError</code></td><td>Yığın gibi tüketmek</td></tr>
<tr><td><code>d.clear()</code></td><td>None</td><td>-</td><td>Hepsini boşalt</td></tr>
</table></div>
<pre class="py">kuponlar = {"YAZ10": 10, "ILK50": 50}
indirim = kuponlar.pop("YAZ10", 0)    # kullanılan kupon silinir
print(indirim, kuponlar)
print(kuponlar.pop("SAHTE", 0))       # yoksa 0, hata yok
sepet = {"çay": 2, "kahve": 1}
print(sepet.popitem())                # en son eklenen: ('kahve', 1)</pre>

<h2>Gezerken değiştirme tuzağı</h2>
<p>Bir sözlüğü <code>for</code> ile gezerken ona anahtar ekler ya da silersen Python <code>RuntimeError: dictionary changed size during iteration</code> verir. Çözüm: anahtarların bir <b>kopyası</b> üzerinde gez (<code>list(d)</code>) ya da silinecekleri önce topla, sonra sil. Var olan anahtarın <b>değerini</b> değiştirmek ise güvenlidir.</p>
<pre class="py">stok = {"çay": 0, "kahve": 5, "şeker": 0, "su": 12}
for urun in list(stok):               # kopya üzerinde gez
    if stok[urun] == 0:
        del stok[urun]
print(stok)

for urun in stok:                     # değer güncellemek serbest
    stok[urun] += 10
print(stok)</pre>

<h2>Görünümler (views) canlıdır ve küme gibi davranır</h2>
<p><code>keys()</code>, <code>values()</code>, <code>items()</code> kopya değil, sözlüğe açılan <b>canlı pencerelerdir</b> (view): sözlük değişince görünüm de değişir. Ayrıca <code>keys()</code> küme işlemlerini destekler; iki fiyat listesini karşılaştırırken kümeye çevirmene bile gerek kalmaz.</p>
<pre class="py">eski = {"çay": 120, "kahve": 340, "kek": 90}
yeni = {"çay": 125, "kahve": 340, "su": 15}
anahtarlar = yeni.keys()
print("Eklenen:", anahtarlar - eski.keys())
print("Kalkan:", eski.keys() - anahtarlar)
ortak = sorted(eski.keys() &amp; anahtarlar)
print("Fiyatı değişen:", [u for u in ortak if eski[u] != yeni[u]])
yeni["süt"] = 40
print(len(anahtarlar))                 # görünüm güncellendi: 4</pre>
<p>Son satırdaki köşeli parantezli tek satırlık döngü bir liste comprehension'dır; Comprehension dersinde ayrıntılı göreceksin. Sözlük comprehension'ı da (<code>{u: f * 1.2 for u, f in fiyat.items()}</code>) orada.</p>

<h2>Değerde arama yavaştır</h2>
<p><code>"İzmir" in musteri</code> yalnızca <b>anahtarlara</b> bakar ve karma (hash) sayesinde neredeyse anında yanıt verir. <code>"İzmir" in musteri.values()</code> ise listedeki gibi baştan sona tarar. Değere göre sık arama yapıyorsan, ters sözlüğü bir kez kurup sonra anahtarla aramak çok daha hızlıdır. Örneğin müşteri numarası → e-posta sözlüğün varsa ve sürekli "bu e-posta kimin?" diye soruyorsan, e-posta → müşteri numarası sözlüğünü bir kez üret.</p>
<pre class="py">eposta = {"M-1": "ayse@ornek.com", "M-2": "can@ornek.com"}
print("can@ornek.com" in eposta)            # False: anahtarlara bakar
print("can@ornek.com" in eposta.values())   # True ama yavaş tarama
kimin = {}
for no, adres in eposta.items():
    kimin[adres] = no
print(kimin["can@ornek.com"])                 # hızlı ters arama</pre>
<p>İç içe sözlüklerde güvenli erişimi (<code>.get</code> zinciri) ve derin kopyayı İç içe veri yapıları dersinde ayrıntılı göreceksin; buradaki kalıplar o dersin temelidir.</p>

<h2>Değere göre sıralamak ve ilk N</h2>
<p>Sözlük ekleme sırasını korur ama kendisi sıralanmaz. "En çok satan 3 ürün" için öğeleri (<code>items()</code>) değere göre sıralarsın. İki kısa yol var: anahtarları <code>key=d.get</code> ile sıralamak ya da çiftleri bir anahtar fonksiyonla sıralamak. Eşitlik kuralı gerekiyorsa demet anahtar kullan.</p>
<pre class="py">satis = {"çay": 120, "kahve": 340, "su": 120, "kek": 210}
print(sorted(satis, key=satis.get, reverse=True)[:3])

def adet_sonra_ad(cift):
    urun, adet = cift
    return (-adet, urun)             # adet azalan, eşitlikte ad artan

for urun, adet in sorted(satis.items(), key=adet_sonra_ad):
    print(f"{urun:&lt;6}{adet:&gt;5}")</pre>

<h2>Ters çevirme ve gruplama</h2>
<p>Sözlüğü ters çevirmek (değer → anahtar) değerler benzersizse tek döngüdür. Değerler tekrar ediyorsa bilgi kaybolmasın diye her değere bir <b>liste</b> bağlarsın; bu da gruplama kalıbıdır. <code>setdefault(k, [])</code> anahtar yoksa boş listeyi koyup döndürür, varsa var olanı döndürür.</p>
<pre class="py">bolge = {"İzmir": "Ege", "Manisa": "Ege", "Ankara": "İç Anadolu", "Konya": "İç Anadolu", "Bursa": "Marmara"}
gruplar = {}
for sehir, b in bolge.items():
    gruplar.setdefault(b, []).append(sehir)
print(gruplar)</pre>
<div class="warn"><b>dict.fromkeys ile liste paylaşımı</b><code>dict.fromkeys(["İzmir", "Ankara"], [])</code> her anahtara <b>aynı</b> listeyi bağlar: birine eklediğin herkese görünür. Değişebilir varsayılan gerekiyorsa <code>setdefault</code> ya da Collections dersinde göreceğin <code>defaultdict(list)</code> kullan. Sayım için hazır araç <code>collections.Counter</code> da o derste.</div>
<div class="tip"><b>Eşitlik sıraya bakmaz</b><code>{"a": 1, "b": 2} == {"b": 2, "a": 1}</code> True'dur. Testlerde sözlükleri doğrudan <code>==</code> ile karşılaştırabilirsin; sıralama ancak yazdırırken önemlidir.</div>
<div class="note"><b>Gerçek işte</b>Uygulamalar ayarlarını çoğunlukla katmanlı tutar: kod içindeki varsayılanlar, üstüne yapılandırma dosyası, en üstte ortam değişkenleri. Bu katmanlar tam olarak <code>varsayilan | dosya | ortam</code> birleştirmesidir; sağdaki kazanır. Fiyat ya da stok listesi senkronizasyonunda da ilk iş iki sözlüğün anahtar farkını (eklenen/kalkan) ve ortak anahtarlarda değeri değişenleri çıkarmaktır.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>a = {"kargo": 49.9, "kdv": 0.2}</code> ve <code>b = {"kargo": 0}</code> için <code>(a | b)["kargo"]</code> nedir?',
      o: ['49.9, çünkü soldaki öncelikli', '0, çünkü aynı anahtarda sağdaki kazanır', '49.9 + 0 toplamı', 'KeyError, çünkü aynı anahtar iki sözlükte de tanımlı'],
      a: 1,
      why: '| birleştirmesinde aynı anahtar iki tarafta varsa sağdaki sözlüğün değeri kullanılır. Değerler toplanmaz; toplama gerekiyorsa döngü yazarsın.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Birleştirme: bu kod ne yazdırır?',
      code: 'a = {"kalem": 3, "defter": 45}\nb = {"kalem": 4, "silgi": 5}\nc = a | b\na |= {"defter": 50}\nprint(c)\nprint(a)\n',
      o: ["{'kalem': 4, 'defter': 45, 'silgi': 5}\n{'kalem': 3, 'defter': 50}", "{'kalem': 3, 'defter': 45, 'silgi': 5}\n{'kalem': 3, 'defter': 50}", "{'kalem': 4, 'defter': 50, 'silgi': 5}\n{'kalem': 3, 'defter': 50}", "{'kalem': 7, 'defter': 45, 'silgi': 5}\n{'kalem': 3, 'defter': 95}"],
      a: 0,
      why: 'c = a | b yeni bir sözlüktür: kalem için sağdaki 4 kazanır. Sonradan a\'yı yerinde güncellemek c\'yi etkilemez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalıştırılınca ne olur?',
      code: 'stok = {"çay": 0, "kahve": 5, "şeker": 0}\nfor u in stok:\n    if stok[u] == 0:\n        del stok[u]\nprint(stok)\n',
      o: ["{'kahve': 5}", "{'kahve': 5, 'şeker': 0}", 'RuntimeError verir', 'KeyError verir'],
      a: 2,
      raises: true,
      why: 'Gezilen sözlükten anahtar silmek boyutunu değiştirir; Python bunu yakalar: RuntimeError: dictionary changed size during iteration. list(stok) üzerinde gezmelisin.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'fromkeys tuzağı: bu kod ne yazdırır?',
      code: 'd = dict.fromkeys(["İzmir", "Ankara"], [])\nd["İzmir"].append("AM-1")\nprint(d)\n',
      o: ["{'İzmir': ['AM-1'], 'Ankara': []}", "{'İzmir': ['AM-1'], 'Ankara': ['AM-1']}", "{'İzmir': 'AM-1', 'Ankara': []}", 'AttributeError verir'],
      a: 1,
      why: 'fromkeys verilen tek liste nesnesini her anahtara bağlar. İki anahtar da aynı listeyi gösterdiği için ekleme ikisinde de görünür.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>En çok satan üç ürünü adetleriyle yazdıran programın satırlarını sırala.</p>',
      lines: ['satis = {"çay": 120, "kahve": 340, "su": 90, "kek": 210}', 'sirali = sorted(satis, key=satis.get, reverse=True)', 'for urun in sirali[:3]:', '    print(urun, satis[urun])'],
      expect: 'kahve 340\nkek 210\nçay 120\n',
      hint: 'Önce veri, sonra anahtarları değere göre sırala, en son ilk üçünü gez.',
      why: 'key=satis.get her anahtarın sıralama ölçütü olarak değerini kullanır; reverse=True büyükten küçüğe sıralar, [:3] ilk üçü alır.' },
    { id: 'sozlukler-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>İki deponun stokları sözlük olarak geliyor. <code>stok_birlestir(depo1, depo2)</code> fonksiyonunu yaz: iki depodaki adetleri <b>toplayan</b> yeni bir sözlük döndürsün. Girdi sözlükleri değişmesin. (<code>|</code> üzerine yazar, toplamaz; burada işe yaramaz.)</p>',
      guide: ['depo1\'in bir kopyasını oluştur (dict(depo1) ya da depo1.copy()).', 'depo2\'nin öğelerini (urun, adet) gez.', 'Kopyada urun\'ün mevcut adedini get(urun, 0) ile al, adedi ekle.', 'Kopyayı döndür.'],
      example: 'puan = {"Ali": 10}\nek = {"Ali": 5, "Ece": 7}\nsonuc = puan.copy()\nfor ad, p in ek.items():\n    sonuc[ad] = sonuc.get(ad, 0) + p\nprint(sonuc, puan)\n',
      start: 'def stok_birlestir(depo1, depo2):\n    toplam = dict(depo1)\n    # TODO: depo2\'deki adetleri toplama ekle\n    return toplam\n',
      sol: 'def stok_birlestir(depo1, depo2):\n    toplam = dict(depo1)\n    for urun, adet in depo2.items():\n        toplam[urun] = toplam.get(urun, 0) + adet\n    return toplam\n',
      tests: 'd1 = {"çay": 10, "kahve": 4}\nd2 = {"kahve": 6, "şeker": 3}\nr = stok_birlestir(d1, d2)\nassert r == {"çay": 10, "kahve": 10, "şeker": 3}, f"kahve 4 + 6 = 10 olmalı; gelen {r}"\nassert d1 == {"çay": 10, "kahve": 4} and d2 == {"kahve": 6, "şeker": 3}, "girdi sözlükleri değişmemeli"\nassert stok_birlestir({}, {}) == {}, "iki boş depo"\n',
      hints: ['Sayım kalıbının toplama versiyonu: get(urun, 0) + adet.', 'for urun, adet in depo2.items():', 'toplam[urun] = toplam.get(urun, 0) + adet'],
      why: 'Kopya üzerinde çalışmak girdileri korur; get(..., 0) ilk kez görülen ürünlerde KeyError\'u önler ve toplamayı tek satıra indirir.' },
    { id: 'sozlukler-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>bolgeye_gore(sehir_bolge)</code> fonksiyonunu yaz. Girdi <code>{"İzmir": "Ege", "Manisa": "Ege", "Ankara": "İç Anadolu"}</code> gibi şehir → bölge sözlüğüdür. Bölge → şehir listesi sözlüğü döndür: <code>{"Ege": ["İzmir", "Manisa"], "İç Anadolu": ["Ankara"]}</code>. Listelerde şehirler girdideki sırayla yer alsın.</p>',
      guide: ['Boş bir sonuç sözlüğü oluştur.', 'items() ile (sehir, bolge) çiftlerini gez.', 'setdefault(bolge, []) bölgenin listesini (yoksa yeni boş liste) verir; ona şehri ekle.', 'Sonucu döndür.'],
      example: 'calisanlar = {"Ayşe": "IT", "Mehmet": "İK", "Zeynep": "IT"}\nekip = {}\nfor ad, birim in calisanlar.items():\n    ekip.setdefault(birim, []).append(ad)\nprint(ekip)\n',
      start: 'def bolgeye_gore(sehir_bolge):\n    sonuc = {}\n    for sehir, bolge in sehir_bolge.items():\n        # TODO: bölgenin listesine şehri ekle\n        pass\n    return sonuc\n',
      sol: 'def bolgeye_gore(sehir_bolge):\n    sonuc = {}\n    for sehir, bolge in sehir_bolge.items():\n        sonuc.setdefault(bolge, []).append(sehir)\n    return sonuc\n',
      tests: 'g = {"İzmir": "Ege", "Ankara": "İç Anadolu", "Manisa": "Ege", "Konya": "İç Anadolu", "Bursa": "Marmara"}\nr = bolgeye_gore(g)\nassert r == {"Ege": ["İzmir", "Manisa"], "İç Anadolu": ["Ankara", "Konya"], "Marmara": ["Bursa"]}, f"beklenen gruplama farklı; gelen {r}"\nassert r["Ege"] is not r["Marmara"], "her bölgenin kendi listesi olmalı (fromkeys tuzağı)"\nassert bolgeye_gore({}) == {}, "boş girdi"\n',
      hints: ['Tersine çevirirken değerler tekrar ediyorsa her yeni anahtara bir liste bağla.', 'sonuc.setdefault(bolge, [])', 'sonuc.setdefault(bolge, []).append(sehir)'],
      why: 'Değerler tekrarlandığı için düz ters çevirme ({bolge: sehir}) son şehri bırakıp diğerlerini kaybeder. setdefault her bölgeye bir kez yeni liste açar ve sonraki şehirleri ona ekler.' },
    { id: 'sozlukler-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>en_cok_n(satis, n)</code> fonksiyonunu yaz. <code>satis</code> ürün → adet sözlüğüdür. En çok satan <code>n</code> ürünü <code>(urun, adet)</code> demetleri listesi olarak döndür: adet <b>azalan</b>, eşit adette ürün adı <b>artan</b> (alfabetik) olsun. <code>n</code> ürün sayısından büyükse hepsini döndür.</p>',
      guide: ['Bir anahtar fonksiyonu yaz: (urun, adet) çifti alıp (-adet, urun) döndürsün.', 'satis.items() öğelerini bu anahtarla sırala.', 'Sıralı listenin ilk n elemanını dilimle ve döndür.'],
      example: 'notlar = {"Ali": 70, "Can": 85, "Ece": 85}\n\ndef anahtar(cift):\n    ad, puan = cift\n    return (-puan, ad)\n\nprint(sorted(notlar.items(), key=anahtar)[:2])\n',
      start: 'def en_cok_n(satis, n):\n    def anahtar(cift):\n        urun, adet = cift\n        # TODO: adet azalan, eşitlikte ad artan\n        return urun\n    return sorted(satis.items(), key=anahtar)\n',
      sol: 'def en_cok_n(satis, n):\n    def anahtar(cift):\n        urun, adet = cift\n        return (-adet, urun)\n    return sorted(satis.items(), key=anahtar)[:n]\n',
      tests: 's = {"çay": 120, "kahve": 340, "su": 120, "kek": 210, "ayran": 15}\nassert en_cok_n(s, 3) == [("kahve", 340), ("kek", 210), ("su", 120)], f"çay ile su eşit (120); alfabetik olarak su, çaydan önce gelir (ç Unicode\'da z\'den sonra); gelen {en_cok_n(s, 3)}"\nassert en_cok_n(s, 0) == [], "n=0 boş liste"\nassert len(en_cok_n(s, 10)) == 5, "n fazlaysa tüm ürünler"\nassert en_cok_n({}, 2) == [], "boş sözlük"\n',
      hints: ['Demet anahtar: (-adet, urun).', 'Dilimleme [:n] fazla n\'de hata vermez.', 'return sorted(satis.items(), key=anahtar)[:n]'],
      why: 'Eksi işaretli adet azalan sırayı, ikinci eleman olarak ad eşitlikte alfabetik sırayı sağlar. reverse=True kullanmak adları da ters sıralardı.' },
    { id: 'sozlukler-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>kdv_dahil_fiyatlar(fiyatlar, oranlar, varsayilan=0.20)</code> fonksiyonunu yaz. <code>fiyatlar</code> ürün → KDV hariç fiyat; <code>oranlar</code> yalnızca bazı ürünler için özel KDV oranı içerir. Her ürüne kendi oranını, yoksa <code>varsayilan</code>\'ı uygulayıp 2 ondalığa yuvarlanmış KDV dahil fiyatlardan oluşan <b>yeni</b> sözlük döndür.</p>',
      start: 'def kdv_dahil_fiyatlar(fiyatlar, oranlar, varsayilan=0.20):\n    pass\n',
      sol: 'def kdv_dahil_fiyatlar(fiyatlar, oranlar, varsayilan=0.20):\n    sonuc = {}\n    for urun, fiyat in fiyatlar.items():\n        oran = oranlar.get(urun, varsayilan)\n        sonuc[urun] = round(fiyat * (1 + oran), 2)\n    return sonuc\n',
      tests: 'f = {"ekmek": 10.0, "telefon": 1000.0, "kitap": 50.0}\no = {"ekmek": 0.01, "kitap": 0.0}\nassert kdv_dahil_fiyatlar(f, o) == {"ekmek": 10.1, "telefon": 1200.0, "kitap": 50.0}, f"gelen {kdv_dahil_fiyatlar(f, o)}"\nassert kdv_dahil_fiyatlar(f, {}, 0.10)["telefon"] == 1100.0, "özel oran yoksa varsayılan kullanılmalı"\nassert kdv_dahil_fiyatlar({}, o) == {}, "boş fiyat listesi"\n',
      hints: ['oranlar.get(urun, varsayilan) özel oran yoksa varsayılanı verir.', 'Oran 0.0 olabilir; "or" ile varsayılan seçersen 0 oranı yanlışlıkla varsayılana döner.'],
      why: 'get\'in ikinci argümanı, eksik anahtar için güvenli varsayılandır. oranlar.get(urun) or varsayilan yazmak 0.0 oranını falsy sayıp yanlış sonuç verirdi.' },
    { id: 'sozlukler-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Fiyat listesi senkronizasyonu: <code>fark_raporu(eski, yeni)</code> fonksiyonunu yaz. İki ürün → fiyat sözlüğünü karşılaştırıp şu anahtarlarla sözlük döndür; her değer <b>sıralı liste</b> olsun: <code>"eklenen"</code> (yalnız yenide), <code>"kalkan"</code> (yalnız eskide), <code>"degisen"</code> (ikisinde de var, fiyatı farklı).</p>',
      start: 'def fark_raporu(eski, yeni):\n    pass\n',
      sol: 'def fark_raporu(eski, yeni):\n    ortak = eski.keys() & yeni.keys()\n    return {\n        "eklenen": sorted(yeni.keys() - eski.keys()),\n        "kalkan": sorted(eski.keys() - yeni.keys()),\n        "degisen": sorted(u for u in ortak if eski[u] != yeni[u]),\n    }\n',
      tests: 'e = {"çay": 120, "kahve": 340, "kek": 90, "su": 10}\ny = {"çay": 125, "kahve": 340, "su": 12, "süt": 40}\nassert fark_raporu(e, y) == {"eklenen": ["süt"], "kalkan": ["kek"], "degisen": ["su", "çay"]}, f"gelen {fark_raporu(e, y)}"\nassert fark_raporu(e, e) == {"eklenen": [], "kalkan": [], "degisen": []}, "aynı listede fark yok"\nassert fark_raporu({}, {"a": 1}) == {"eklenen": ["a"], "kalkan": [], "degisen": []}, "boş eski liste"\n',
      hints: ['keys() görünümleri küme işlemlerini destekler: yeni.keys() - eski.keys().', 'Değişenler için ortak anahtarları gez ve değerleri karşılaştır.'],
      why: 'Anahtar farkları küme işlemiyle tek satırda çıkar; değer karşılaştırması yalnız ortak anahtarlarda anlamlıdır.' },
    { id: 'sozlukler-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>zam_uygula(fiyatlar, oran)</code> zamlı fiyatlardan oluşan yeni bir sözlük döndürmeli ama <b>girdiyi değiştirmemeli</b>. Fonksiyon iki kez çağrılınca zam üst üste biniyor ve orijinal fiyat listesi bozuluyor.</p>',
      start: 'def zam_uygula(fiyatlar, oran):\n    yeni = fiyatlar\n    for urun in yeni:\n        yeni[urun] = round(yeni[urun] * (1 + oran), 2)\n    return yeni\n',
      sol: 'def zam_uygula(fiyatlar, oran):\n    yeni = dict(fiyatlar)\n    for urun in yeni:\n        yeni[urun] = round(yeni[urun] * (1 + oran), 2)\n    return yeni\n',
      tests: 'f = {"çay": 100.0, "kahve": 200.0}\nr = zam_uygula(f, 0.10)\nassert r == {"çay": 110.0, "kahve": 220.0}, f"zamlı fiyatlar yanlış: {r}"\nassert f == {"çay": 100.0, "kahve": 200.0}, f"orijinal fiyatlar değişmemeli; şu an {f}"\nassert r is not f, "yeni bir sözlük döndürülmeli"\n',
      hints: ['yeni = fiyatlar kopya oluşturmaz; iki ad aynı sözlüğü gösterir.', 'dict(fiyatlar) ya da fiyatlar.copy() ile sığ kopya al.'],
      why: 'Atama yalnızca yeni bir ad bağlar. Kopya alınmazsa fonksiyon çağıranın sözlüğünü değiştirir (yan etki); değerler sayı olduğu için sığ kopya yeterlidir.' },
    { id: 'sozlukler-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>pasifleri_sil(musteriler)</code>, müşteri no → durum sözlüğünden durumu <code>"pasif"</code> olanları <b>yerinde</b> silmeli ve silinen müşteri numaralarını sıralı liste olarak döndürmeli. Kod <code>RuntimeError</code> veriyor.</p>',
      start: 'def pasifleri_sil(musteriler):\n    silinen = []\n    for no in musteriler:\n        if musteriler[no] == "pasif":\n            del musteriler[no]\n            silinen.append(no)\n    return sorted(silinen)\n',
      sol: 'def pasifleri_sil(musteriler):\n    silinen = []\n    for no in list(musteriler):\n        if musteriler[no] == "pasif":\n            del musteriler[no]\n            silinen.append(no)\n    return sorted(silinen)\n',
      tests: 'm = {"M-3": "pasif", "M-1": "aktif", "M-2": "pasif", "M-4": "aktif"}\nayni = m\nassert pasifleri_sil(m) == ["M-2", "M-3"], "M-2 ve M-3 silinmeli"\nassert m == {"M-1": "aktif", "M-4": "aktif"}, f"kalanlar yanlış: {m}"\nassert m is ayni, "sözlük yerinde değişmeli"\nassert pasifleri_sil({}) == [], "boş sözlük"\n',
      hints: ['Gezilen sözlüğün boyutu döngü sırasında değişemez.', 'Anahtarların kopyası üzerinde gez: for no in list(musteriler):'],
      why: 'list(musteriler) anahtarların o anki listesini çıkarır; döngü bu listeyi gezerken orijinal sözlükten güvenle silebilirsin.' },
    { id: 'sozlukler-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Ilgaz Bank mobil uygulama oturum günlüğü: <code>oturum_sureleri(olaylar)</code> fonksiyonunu yaz. <code>olaylar</code>, zaman sırasına dizilmiş <code>(kullanici, olay, dakika)</code> demetleridir; <code>olay</code> <code>"giris"</code> ya da <code>"cikis"</code>. Her kullanıcının toplam oturum süresini (çıkış dakikası − giriş dakikası) sözlük olarak döndür. Kurallar:</p><ul><li>Girişi olmayan çıkış yok sayılır.</li><li>Açıkken gelen ikinci giriş, öncekinin yerine geçer (önceki oturum sayılmaz).</li><li>Sonunda kapanmamış oturumlar sayılmaz.</li><li>Hiç tamamlanmış oturumu olmayan kullanıcı sonuçta yer almaz.</li></ul>',
      start: 'def oturum_sureleri(olaylar):\n    pass\n',
      sol: 'def oturum_sureleri(olaylar):\n    acik = {}\n    toplam = {}\n    for kullanici, olay, dakika in olaylar:\n        if olay == "giris":\n            acik[kullanici] = dakika\n        elif olay == "cikis":\n            bas = acik.pop(kullanici, None)\n            if bas is not None:\n                toplam[kullanici] = toplam.get(kullanici, 0) + dakika - bas\n    return toplam\n',
      tests: 'o = [("ayse", "giris", 0), ("can", "giris", 5), ("ayse", "cikis", 12), ("can", "cikis", 9), ("ayse", "giris", 20), ("ayse", "cikis", 23)]\nassert oturum_sureleri(o) == {"ayse": 15, "can": 4}, f"ayşe 12 + 3, can 4; gelen {oturum_sureleri(o)}"\nassert oturum_sureleri([("x", "cikis", 5)]) == {}, "girişsiz çıkış yok sayılır"\nassert oturum_sureleri([("x", "giris", 0), ("x", "giris", 10), ("x", "cikis", 14)]) == {"x": 4}, "ikinci giriş öncekinin yerine geçer"\nassert oturum_sureleri([("x", "giris", 0), ("x", "cikis", 4), ("x", "cikis", 9)]) == {"x": 4}, "ikinci çıkışın açık oturumu yok"\nassert oturum_sureleri([("x", "giris", 0)]) == {}, "kapanmamış oturum sayılmaz"\nassert oturum_sureleri([("x", "giris", 7), ("x", "cikis", 7)]) == {"x": 0}, "0 dakikalık oturum da tamamlanmış sayılır"\n',
      hints: ['İki sözlük tut: açık oturumların başlangıcı ve kullanıcı başına toplam.', 'Çıkışta pop(kullanici, None): açık oturum varsa başlangıcı alır ve kapatır, yoksa None.', 'Başlangıç 0 olabilir; "if bas:" değil "if bas is not None:" kullan.'],
      why: 'Açık oturumlar sözlüğü bir durum makinesi gibi çalışır: giriş açar (üzerine yazar), çıkış pop ile hem okur hem kapatır. 0. dakikada başlayan oturum için is not None kontrolü şarttır.' }
  ],
  faq: [
    { q: '<code>|</code> ile <code>update</code> arasında fark var mı?', a: '<code>a | b</code> yeni bir sözlük üretir, a ve b değişmez. <code>a.update(b)</code> ve <code>a |= b</code> a\'yı yerinde değiştirir ve None döndürür. Girdiyi korumak istediğin fonksiyonlarda <code>|</code> kullan.' },
    { q: 'Sözlüğü değere göre sıralayıp yine sözlük olarak tutabilir miyim?', a: 'Evet: <code>dict(sorted(d.items(), key=...))</code> sıralı çiftlerden yeni sözlük kurar ve sözlük ekleme sırasını korur. Ama sonradan eklenen anahtar sona gider; sıra bir veri garantisi değil, gösterim kolaylığıdır.' }
  ],
  mistakes: [
    { bad: 'for k in d:\n    if d[k] == 0:\n        del d[k]', good: 'for k in list(d):\n    if d[k] == 0:\n        del d[k]', why: 'Gezilen sözlükten silmek RuntimeError verir; anahtarların kopyası üzerinde gez.' },
    { bad: 'gruplar = dict.fromkeys(bolgeler, [])', good: 'gruplar = {}\nfor b in bolgeler:\n    gruplar[b] = []', why: 'fromkeys tek bir liste nesnesini tüm anahtarlara bağlar; birine eklenen herkeste görünür.' }
  ]
}
);
})(window);
