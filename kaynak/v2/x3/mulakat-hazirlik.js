/* Kesit Python — 'mulakat-hazirlik' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'mulakat-hazirlik',
    min: 30,
    html: `<p>Bu ders her rol için ortak çekirdeği veriyor: Python kavramları, algoritma kalıpları, canlı kodlama ve davranışsal sorular. Ama bir veri analisti ile bir backend geliştiricinin mülakatı aynı değildir. Bu bölüm iki şey ekliyor: öğrenme yoluna göre "hangi bölüm sana ne kadar lazım" haritası ve kendi kendine uygulayabileceğin 45 dakikalık bir deneme mülakatı senaryosu.</p>
<h2>Öğrenme yollarına göre harita</h2>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Bu dersten öncelik</th><th>Ardından çalış</th><th>Mülakatta ağırlık</th></tr>
<tr><td>Veri analisti</td><td>Kavram soruları, sözlükle sayım, davranışsal sorular</td><td><b>Veri mülakatı</b> (SQL, pandas, metrik, vaka), <b>İş metrikleri</b></td><td>SQL canlı yazım, pandas ile analiz, iş sorusunu metriğe çevirme</td></tr>
<tr><td>Veri bilimci / ML</td><td>Kavramlar, Big-O, kayan pencere, heap</td><td><b>Veri mülakatı</b>, ML derslerindeki SSS'ler</td><td>İstatistik, model değerlendirme, sızıntı, A/B testi, ev ödevi</td></tr>
<tr><td>Veri mühendisi</td><td>Kalıpların tamamı, Big-O, ev ödevi</td><td><b>Veri mülakatı</b>, <b>Mülakat kalıpları 2</b>, <b>Sistem tasarımı</b></td><td>SQL, ETL tasarımı, idempotentlik, bölümleme, orkestrasyon</td></tr>
<tr><td>Backend / web</td><td>Kalıpların tamamı, canlı kodlama ipuçları</td><td><b>Mülakat kalıpları 2</b>, <b>Sistem tasarımı</b></td><td>Algoritma (orta), API ve veritabanı tasarımı, önbellek, güvenlik</td></tr>
<tr><td>AI mühendisi</td><td>Kavramlar, sözlük/küme kalıpları, ev ödevi</td><td><b>Sistem tasarımı</b> (LLM servisleri), LLM dersleri</td><td>RAG tasarımı, değerlendirme, maliyet ve gecikme</td></tr>
<tr><td>Otomasyon</td><td>Kavramlar, sayım ve metin kalıpları</td><td>Python Arena (Kolay/Orta)</td><td>Dosya, Excel, hata yönetimi; çoğunlukla pratik görev</td></tr>
<tr><td>Sertifika (PCEP/PCAP)</td><td>Kavram soruları ve "yanlış ama sık verilen cevaplar"</td><td><b>Mülakat kalıpları 2</b>, sınav bölümü</td><td>Dil ayrıntısı: kapsam, değişebilirlik, istisnalar, OOP</td></tr></table></div>
<p>Haritayı şöyle kullan: kendi satırındaki ilk sütunu bu derste pekiştir, ikinci sütundaki dersleri sırayla bitir, üçüncü sütunu deneme mülakatlarında ağırlık olarak kullan. Python Arena'da rolüne uygun alan süzgeciyle günde 1-2 soru çözmek, kalıpları otomatikleştirmenin en verimli yoludur.</p>
<h2>45 dakikalık deneme mülakatı</h2>
<p>Gerçek teknik mülakatların çoğu 45-60 dakikadır ve benzer bir akışı izler. Bir arkadaşınla rol değiştirerek ya da kendi kendine süre tutarak uygula; ekranını kaydet ve sonra izle. Senaryo Anadolu Market'in backend/veri pozisyonuna göre yazıldı.</p>
<div class="tbl-wrap"><table><tr><th>Dakika</th><th>Bölüm</th><th>Görüşmeci ne yapar?</th><th>Sen ne yapmalısın?</th></tr>
<tr><td>0-5</td><td>Tanışma</td><td>"Kendinden ve son projenden bahset."</td><td>90 saniyelik hazır özet: kim, ne yaptın, hangi sonuç</td></tr>
<tr><td>5-10</td><td>Kavram ısınması</td><td>2-3 kısa soru: değişebilirlik, üreteç, GIL</td><td>Kısa tanım + örnek; bilmediğini kabul et ama akıl yürüt</td></tr>
<tr><td>10-35</td><td>Canlı kodlama</td><td>Bir problem, sonra bir takip sorusu</td><td>Netleştir → örnek → kaba çözüm → iyileştir → test et</td></tr>
<tr><td>35-40</td><td>Tasarım/vaka</td><td>"Bunu günde 10 milyon siparişe nasıl ölçeklersin?"</td><td>Darboğazı adlandır, iki seçenek ve ödünleşimini söyle</td></tr>
<tr><td>40-45</td><td>Senin soruların</td><td>"Sormak istediğin bir şey var mı?"</td><td>Ekip, kod inceleme, yayın süreci üzerine 2 hazır soru</td></tr></table></div>
<h3>Canlı kodlama problemi (25 dakika)</h3>
<p><b>Görev:</b> "Sipariş akışında her sipariş <code>(musteri_id, zaman_sn)</code> olarak geliyor. Son 60 saniyede 3'ten fazla sipariş veren müşterileri, sınırı ilk aştıkları an itibarıyla raporla." <b>Takip sorusu:</b> "Akış sıralı gelmiyorsa ne değişir? Bellek sınırlıysa?"</p>
<pre class="py">from collections import defaultdict, deque

def supheliler(siparisler, pencere=60, sinir=3):
    son = defaultdict(deque)          # müşteri -&gt; penceredeki zamanlar
    bulunan = {}
    for musteri, t in siparisler:     # zaman sırasıyla geldiğini varsayıyoruz (netleştir!)
        q = son[musteri]
        q.append(t)
        while q[0] &lt;= t - pencere:    # pencereden çıkanları at
            q.popleft()
        if len(q) &gt; sinir and musteri not in bulunan:
            bulunan[musteri] = t
    return bulunan

akis = [(7, 0), (7, 10), (9, 12), (7, 30), (7, 55), (9, 70), (7, 61), (7, 62)]
print(supheliler(akis))</pre>
<p>Değerlendirme ölçütleri: Soruyu netleştirdin mi (pencere dahil mi, sıralı mı)? Kaba çözümü söyleyip (her siparişte tüm geçmişi taramak, O(n²)) iyileştirdin mi? Karmaşıklığı söyledin mi (her zaman en fazla bir kez eklenip çıkarılır: O(n) zaman, O(müşteri × pencere) bellek)? Kenar durumları denedin mi (aynı saniyede sipariş, tam 60 saniye sınırı)?</p>
<h3>Kendini puanla</h3>
<div class="tbl-wrap"><table><tr><th>Ölçüt</th><th>1 (zayıf)</th><th>3 (iyi)</th></tr>
<tr><td>Problem çözme</td><td>Doğrudan koda atladı, varsayım sormadı</td><td>Netleştirdi, örnek üzerinde düşündü, alternatifleri tarttı</td></tr>
<tr><td>Kod</td><td>Çalışmadı ya da okunmuyor</td><td>Çalışıyor, adlar anlamlı, fonksiyonlara bölünmüş</td></tr>
<tr><td>İletişim</td><td>Sessiz yazdı</td><td>Düşündüğünü sesli anlattı, ipucunu kullandı</td></tr>
<tr><td>Test</td><td>Hiç denemedi</td><td>Kendi örnekleriyle ve kenar durumlarla denedi</td></tr>
<tr><td>Karmaşıklık</td><td>Bilmiyor</td><td>Zaman ve bellek için doğru O(...) ve gerekçe</td></tr></table></div>
<div class="tip"><b>Haftalık plan</b>Mülakat sürecindeysen haftada iki deneme yap: biri bu senaryoyla, biri Python Arena'dan rastgele bir Orta soruyla. Her denemeden sonra en düşük puanlı ölçüt için bir sonraki haftaya tek bir hedef yaz ("kodlamadan önce iki örnek yazacağım").</div>
<div class="note"><b>Gerçek işte</b>İşe alım ekipleri adayı tek bir doğru cevaptan çok sürece göre değerlendirir: belirsizlik karşısında soru sorması, takıldığında ilerleyebilmesi ve kendi kodunu test etmesi. Bu yüzden deneme mülakatı, soru ezberlemekten çok daha verimli bir hazırlıktır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'mulakat-hazirlik-y1',
        stage: 'Isınma',
        q: 'Veri analisti pozisyonuna hazırlanıyorsun ve iki haftan var. Bu yolun haritasına göre en verimli öncelik hangisi?',
        o: [
          'Dinamik programlama ve graf algoritmalarına ağırlık vermek',
          'SQL ve pandas ile canlı analiz ile iş sorusunu metriğe çevirme',
          'Kubernetes ve dağıtım araçlarını öğrenmek',
          'Metaprogramlama ve tanımlayıcıları (descriptor) çalışmak'
        ],
        a: 1,
        why: 'Analist mülakatlarının ağırlığı SQL\'de canlı sorgu, pandas ile analiz ve iş metriği yorumudur; Veri mülakatı ve İş metrikleri dersleri bunu hedefler. Zor algoritmalar ve altyapı konuları bu rolde nadiren sorulur.'
      },
      {
        t: 'mc',
        id: 'mulakat-hazirlik-y2',
        stage: 'Isınma',
        q: 'Canlı kodlamada problemi okudun ve hemen bir çözüm aklına geldi. İlk ne yapmalısın?',
        o: [
          'Görüşmeciyi bekletmemek için hemen kodlamaya başlamak',
          'Girdi ve kenar durumları sorup örnekle yaklaşımı anlatmak',
          'Önce en iyi çözümü bulana kadar uzun süre sessizce düşünmek',
          'Benzer bir LeetCode sorusunun numarasını söylemek'
        ],
        a: 1,
        why: 'Netleştirme ve yaklaşımı anlatma, hem yanlış problemi çözme riskini azaltır hem de görüşmecinin değerlendirdiği iletişim ölçütünü doldurur. Sessiz düşünme ve doğrudan kodlama en sık düşük puan nedenlerindendir.'
      },
      {
        t: 'predict',
        id: 'mulakat-hazirlik-y3',
        stage: 'Kodu oku',
        q: 'Deneme mülakatındaki çözüm: bu akış için ne yazdırır?',
        o: ['{7: 55}', '{7: 61}', '{7: 62}', '{7: 55, 9: 70}'],
        a: 0,
        code: 'from collections import defaultdict, deque\n\ndef supheliler(siparisler, pencere=60, sinir=3):\n    son = defaultdict(deque)\n    bulunan = {}\n    for musteri, t in siparisler:\n        q = son[musteri]\n        q.append(t)\n        while q[0] <= t - pencere:\n            q.popleft()\n        if len(q) > sinir and musteri not in bulunan:\n            bulunan[musteri] = t\n    return bulunan\n\nprint(supheliler([(7, 0), (7, 10), (9, 12), (7, 30), (7, 55), (9, 70), (7, 61), (7, 62)]))\n',
        why: '55. saniyede müşteri 7\'nin penceresinde 0, 10, 30, 55 vardır (55 - 60 = -5 ve 0 > -5): dört sipariş, sınır 3 aşılır. 61\'de 0 pencereden çıkar ama müşteri zaten bulunmuştur. Müşteri 9\'un yalnız iki siparişi vardır.'
      },
      {
        t: 'order',
        id: 'mulakat-hazirlik-y4',
        stage: 'Kodu oku',
        q: '<p>Deneme mülakatı puan kartını hesaplayan programın satırlarını sırala: ölçüt puanlarının ortalamasını al ve en zayıf ölçütü yazdır. Beklenen çıktı:</p><pre class="out">ortalama 2.2 | geliştir: test</pre>',
        lines: [
          'puanlar = {"problem": 3, "kod": 2, "iletisim": 3, "test": 1, "karmasiklik": 2}',
          'ortalama = sum(puanlar.values()) / len(puanlar)',
          'zayif = min(puanlar, key=puanlar.get)',
          'print(f"ortalama {ortalama:.1f} | geliştir: {zayif}")'
        ],
        expect: 'ortalama 2.2 | geliştir: test\n',
        hint: 'Sözlük önce tanımlanmalı; hesaplar ondan sonra, yazdırma en sonda.',
        why: 'min(sozluk, key=sozluk.get) değeri en küçük anahtarı verir. Her denemeden sonra tek bir zayıf ölçüte odaklanmak, hazırlığı ölçülebilir kılar.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Deneme mülakatının takip sorusu: akış <b>sırasız</b> gelebilir. <code>supheliler_sirasiz(siparisler, pencere=60, sinir=3)</code> yaz: tüm siparişler elindeyse, her müşteri için zamanlarını sıralayıp herhangi bir <code>pencere</code> saniyelik yarı açık aralıkta (<code>(t - pencere, t]</code>) <code>sinir</code>\'dan fazla sipariş olan ilk anı bul. <code>{musteri: ilk_an}</code> döndür.</p>',
        guide: [
          'Siparişleri müşteriye göre grupla (defaultdict(list)).',
          'Her müşterinin zamanlarını sırala.',
          'İki işaretçi (sol, sağ) ile kayan pencere: sağ ilerlerken zaman[sol] &lt;= zaman[sağ] - pencere oldukça sol\'u ilerlet.',
          'Pencere boyu sağ - sol + 1 sınırı aşınca o zamanı kaydet ve o müşteriyi bırak.'
        ],
        example: 'z = [1, 2, 5, 9, 10]\nsol = 0\nfor sag in range(len(z)):\n    while z[sol] <= z[sag] - 4:\n        sol += 1\n    print(z[sag], sag - sol + 1)\n',
        start: 'from collections import defaultdict\n\ndef supheliler_sirasiz(siparisler, pencere=60, sinir=3):\n    gruplar = defaultdict(list)\n    # TODO: grupla\n    sonuc = {}\n    for musteri, zamanlar in gruplar.items():\n        zamanlar.sort()\n        # TODO: iki işaretçili pencere\n    return sonuc\n',
        sol: 'from collections import defaultdict\n\ndef supheliler_sirasiz(siparisler, pencere=60, sinir=3):\n    gruplar = defaultdict(list)\n    for musteri, t in siparisler:\n        gruplar[musteri].append(t)\n    sonuc = {}\n    for musteri, zamanlar in gruplar.items():\n        zamanlar.sort()\n        sol = 0\n        for sag in range(len(zamanlar)):\n            while zamanlar[sol] <= zamanlar[sag] - pencere:\n                sol += 1\n            if sag - sol + 1 > sinir:\n                sonuc[musteri] = zamanlar[sag]\n                break\n    return sonuc\n',
        tests: 'akis = [(7, 62), (9, 70), (7, 30), (7, 0), (9, 12), (7, 55), (7, 10), (7, 61)]\nassert supheliler_sirasiz(akis) == {7: 55}, "Sırasız akışta da müşteri 7 55. saniyede yakalanmalı"\nassert supheliler_sirasiz([(1, 0), (1, 60), (1, 120), (1, 180)]) == {}, "Tam 60 sn aralık pencereye girmez (yarı açık)"\nassert supheliler_sirasiz([(2, 5)] * 4) == {2: 5}, "Aynı saniyede 4 sipariş"\nassert supheliler_sirasiz([]) == {}, "Boş akış"\n',
        hints: ['Sıralama sonrası problem, sıralı bir dizide kayan pencereye dönüşür.', 'Sol işaretçi yalnız ileri gider; toplam iş O(n log n) (sıralama) + O(n).', 'while zamanlar[sol] &lt;= zamanlar[sag] - pencere: sol += 1'],
        why: 'Takip sorusunda beklenen, kısıtı değiştirince veri yapısını yeniden seçebilmendir: sırasız ama tam veri varsa sırala + iki işaretçi; sonsuz akışta ise olay zamanına göre tampon ve gecikme sınırı (watermark) gerekir.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y6',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Yol haritasını koda dök: <code>calisma_plani(yol, bitenler)</code> yaz. <code>HARITA</code> sözlüğü hazır: her yol için sıralı ders listesi. Yoldaki derslerden <code>bitenler</code> kümesinde olmayanları sırayla döndür. Bilinmeyen yol için <code>ValueError</code> fırlat; mesajda geçerli yollar alfabetik ve virgülle ayrılmış olsun.</p>',
        start: 'HARITA = {\n    "analist": ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"],\n    "backend": ["mulakat-hazirlik", "mulakat-kaliplari-2", "sistem-tasarimi"],\n    "muhendis": ["mulakat-hazirlik", "veri-mulakat", "mulakat-kaliplari-2", "sistem-tasarimi"],\n}\n\ndef calisma_plani(yol, bitenler):\n    pass\n',
        sol: 'HARITA = {\n    "analist": ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"],\n    "backend": ["mulakat-hazirlik", "mulakat-kaliplari-2", "sistem-tasarimi"],\n    "muhendis": ["mulakat-hazirlik", "veri-mulakat", "mulakat-kaliplari-2", "sistem-tasarimi"],\n}\n\ndef calisma_plani(yol, bitenler):\n    if yol not in HARITA:\n        raise ValueError("Geçerli yollar: " + ", ".join(sorted(HARITA)))\n    return [d for d in HARITA[yol] if d not in bitenler]\n',
        tests: 'assert calisma_plani("backend", {"mulakat-hazirlik"}) == ["mulakat-kaliplari-2", "sistem-tasarimi"], "Biten ders çıkarılmalı, sıra korunmalı"\nassert calisma_plani("analist", set()) == ["mulakat-hazirlik", "veri-mulakat", "is-metrikleri"], "Hiç bitmemişse tüm liste"\nassert calisma_plani("muhendis", set(HARITA["muhendis"])) == [], "Hepsi bittiyse boş"\ntry:\n    calisma_plani("tasarimci", set())\n    assert False, "Bilinmeyen yol ValueError vermeli"\nexcept ValueError as e:\n    assert str(e) == "Geçerli yollar: analist, backend, muhendis", f"Mesaj: {e}"\n',
        hints: ['Önce yol anahtarını denetle.', 'Liste kavrayışı ile sırayı koruyarak süz.', '", ".join(sorted(HARITA))'],
        why: 'Basit bir görev, ama mülakatta da beklenen iki alışkanlığı içerir: geçersiz girdide anlamlı hata mesajı ve sırayı koruyan süzme.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. Adayın canlı kodlamada yazdığı <code>ilk_tekrarsiz(metin)</code>, bir metinde yalnız bir kez geçen <b>ilk</b> karakteri döndürmeli; yoksa <code>None</code>. Görüşmeci "Peki <code>"anadolu"</code> için?" diye soruyor ve fonksiyon yanlış cevap veriyor. Hem doğruluk hem O(n) karmaşıklık beklenir.</p>',
        start: 'def ilk_tekrarsiz(metin):\n    for i, ch in enumerate(metin):\n        if ch not in metin[i + 1:]:\n            return ch\n    return None\n',
        sol: 'from collections import Counter\n\ndef ilk_tekrarsiz(metin):\n    sayac = Counter(metin)\n    for ch in metin:\n        if sayac[ch] == 1:\n            return ch\n    return None\n',
        tests: 'assert ilk_tekrarsiz("anadolu") == "n", "\'a\' tekrar eder; ilk tekrarsız \'n\'"\nassert ilk_tekrarsiz("market") == "m", "Hiç tekrar yoksa ilk karakter"\nassert ilk_tekrarsiz("aabb") is None, "Tekrarsız yoksa None"\nassert ilk_tekrarsiz("") is None, "Boş metin"\nassert ilk_tekrarsiz("x" * 50000 + "y") == "y", "Uzun girdide doğru ve hızlı olmalı"\n',
        hints: ['Kod yalnız sağa bakıyor; soldaki tekrarları görmüyor. Üstelik her adımda dilim kopyalıyor: O(n²).', 'Önce tüm karakterleri say, sonra metni baştan gez.', 'Counter(metin) ve sayac[ch] == 1.'],
        why: '"anadolu"da son "a" kendinden sonra tekrar etmediği için yanlış kod onu... aslında ilk "a"yı atlar ama "n"yi bulur gibi görünür; asıl hata "d o l u" gibi sona yakın karakterlerde ortaya çıkar ve uzun girdide O(n²) zaman aşımı verir. İki geçişli sayım hem doğru hem O(n)\'dir; mülakatta kenar durumları ve büyük girdiyi kendin denemek bu hatayı yakalar.'
      },
      {
        t: 'code',
        id: 'mulakat-hazirlik-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>45 dakikalık mülakatı zaman çizelgesiyle planla: <code>zaman_cizelgesi(bolumler, baslangic="14:00")</code> yaz. <code>bolumler</code> <code>(ad, dakika)</code> listesidir. Her bölüm için <code>"HH:MM-HH:MM ad"</code> metni üret. Toplam süre 45 dakikayı aşarsa, en uzun bölümden (eşitlikte listede önce gelen) aşan dakikaları düş; bu bölüm 10 dakikanın altına inecekse <code>ValueError</code> fırlat. Saat 24:00\'ü geçerse 00:00\'dan devam etsin.</p>',
        start: 'def zaman_cizelgesi(bolumler, baslangic="14:00"):\n    return []\n',
        sol: 'def zaman_cizelgesi(bolumler, baslangic="14:00"):\n    bolumler = [list(b) for b in bolumler]\n    fazla = sum(d for _, d in bolumler) - 45\n    if fazla > 0:\n        i = max(range(len(bolumler)), key=lambda k: (bolumler[k][1], -k))\n        if bolumler[i][1] - fazla < 10:\n            raise ValueError("en uzun bölüm 10 dakikanın altına iner")\n        bolumler[i][1] -= fazla\n    s, d = map(int, baslangic.split(":"))\n    t = s * 60 + d\n    fmt = lambda m: f"{(m // 60) % 24:02d}:{m % 60:02d}"\n    sonuc = []\n    for ad, dk in bolumler:\n        sonuc.append(f"{fmt(t)}-{fmt(t + dk)} {ad}")\n        t += dk\n    return sonuc\n',
        tests: 'B = [("Tanışma", 5), ("Kavram", 5), ("Kodlama", 25), ("Tasarım", 5), ("Sorular", 5)]\nassert zaman_cizelgesi(B) == ["14:00-14:05 Tanışma", "14:05-14:10 Kavram", "14:10-14:35 Kodlama", "14:35-14:40 Tasarım", "14:40-14:45 Sorular"], "Tam 45 dakika"\nuzun = [("Tanışma", 10), ("Kodlama", 30), ("Tasarım", 10)]\nassert zaman_cizelgesi(uzun, "09:30")[1] == "09:40-10:05 Kodlama", "5 dakika fazlalık en uzun bölümden düşülmeli"\nassert zaman_cizelgesi([("A", 20), ("B", 20)], "23:50") == ["23:50-00:10 A", "00:10-00:30 B"], "Gece yarısı geçişi"\ntry:\n    zaman_cizelgesi([("A", 15), ("B", 15), ("C", 15), ("D", 15)])\n    assert False, "15 dakika fazlalık bir bölümü 0\'a indirir: ValueError"\nexcept ValueError:\n    pass\n',
        hints: [
          'Dakikayı tek bir sayı olarak (gün başından itibaren) tut; biçimlendirmede // 60 ve % 60 kullan.',
          'En uzun bölümün indeksini max(range(n), key=lambda k: (dakika, -k)) ile bul (eşitlikte ilk).',
          'Saat için (dakika // 60) % 24.'
        ],
        why: 'Zaman hesabını dakikaya indirip sonda biçimlendirmek, saat ve gün geçişlerindeki hataları ortadan kaldırır. Mülakatta da "zaman, para ve tarih için tek birime indir" ilkesi sık beklenen bir olgunluk işaretidir.'
      }
    ],
    faq: [
      {
        q: 'Deneme mülakatı için kimle çalışabilirim?',
        a: 'Aynı yoldaki bir arkadaşla rol değiştirerek; yoksa süre tutup kendini kaydederek. Görüşmeci rolündeyken puan kartını doldurmak, kendi zayıflıklarını görmek için de etkilidir. Topluluklar ve mentorluk programları da karşılıklı deneme oturumları düzenler.'
      }
    ]
  }
);
})(window);
