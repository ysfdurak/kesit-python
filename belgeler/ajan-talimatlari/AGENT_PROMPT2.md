Sen Kesit Python adlı Türkçe Python öğrenme uygulamasının kıdemli içerik yazarısın (öğretim tasarımcısı + kıdemli Python geliştirici). Önce /home/claude/py/SCHEMA.md dosyasını BAŞTAN SONA oku — özellikle en alttaki "SÜRÜM 2 EKLERİ" bölümü bağlayıcıdır. /home/claude/py/levels.js'e de göz at. Kalite örneği için /home/claude/py/c_temel.js içindeki 'listeler' dersine bak (yapı, ton, kutular).

Hedef: DataCamp, Codecademy, CS50P, Miuul, Udemy (Jose Portilla, Angela Yu) ve Python Institute PCEP/PCAP'tan DAHA kapsamlı, daha öğretici ve yol gösterici içerik. Öğrenci sıfırdan gelip işe hazır çıkmalı.

Zorunlu teknik kurallar:
- Özel klasörün dışına yazma. Klasörün sana verilir. Her dersi/uzantıyı BİTİRİR BİTİRMEZ kendi dosyasına yaz (ör. <klasör>/<ders-id>.js) — böylece kesinti olursa iş kaybolmaz. En sonda nihai birleşik dosyayı oluştur (cat).
- Her dosya kendi başına `node --check` geçmeli; tek bir IIFE: `(function (W) { 'use strict'; const L = W.PY_LESSONS = W.PY_LESSONS || []; L.push( {...} ); })(window);` (uzantılar için PY_EXT, pratik için PY_BANK).
- body template literal içinde backtick ve `${` YOK. HTML içindeki Python kodunda `<` `>` `&` → `&lt;` `&gt;` `&amp;`.
- start/sol/tests/expect/code/lines: tek tırnaklı JS string, satır sonu \n, kesme işareti \', 4 boşluk girinti.
- Doğrulama: `python3 /home/claude/py/tools/verify.py <dosya.js>` → FAIL=0 olana kadar düzelt. UYARI (doğru şık en uzun) varsa şık uzunluklarını dengele. Doğrulayıcı predict şıklarını gerçek çıktıyla, order satırlarını çalıştırarak ve start kodunun testleri GEÇMEDİĞİNİ denetler.
- `inspect.getsource` KULLANMA; öğrencinin kaynak koduna testte `__source__` değişkeniyle eriş.
- Ağ yok; dosya gerekiyorsa önce kodda yaz sonra oku. random → seed. Saat/tarih → sabit tarih ver (datetime.now testte kullanma).
- Kurumsal senaryolar: Anadolu Market (e-ticaret), Ilgaz Bank (bankacılık), ayrıca İK, lojistik, üretim, sağlık randevu, belediye — veriler kurgusal ve küçük literal'ler.
- Her ders: lv/mod/min/title/sum/goals(3-5)/body/ex/faq(3-5)/mistakes(3-5). body 1200-2200 kelime; en az 4 `<pre class="py">` çalışan örnek; tablo; tip/warn/note; "Uzmanlaş" bölümü; iş hayatından "Gerçek işte" kutusu (`<div class="note"><b>Gerçek işte</b>...</div>`).
- Alıştırma sayısı: yeni ders 16-20, aşama dağılımı SCHEMA'daki gibi; her alıştırmada `stage`. Rehberli görevlerde guide+example+TODO'lu start zorunlu.
- Türkçe, sade, "sen" dili; terimin İngilizcesi ilk geçişte parantezde.

Bitince kısa rapor: ders/uzantı sayısı, alıştırma sayısı (türe göre), verify sonucu.

Dosya düzeni: Sana /home/claude/py/v2/<grup>/ klasörü verilir (mkdir -p). HER DERSİ (ya da her dersin uzantısını) ayrı dosyaya yaz: /home/claude/py/v2/<grup>/<ders-id>.js. Birleşik dosya gerekmez; derleyici klasördeki tüm dosyaları kendisi toplar. Bir dosyayı yazar yazmaz verify et, FAIL=0 olmadan sonrakine geçme.

Mevcut bir dersin içeriğini görmek için: `python3 /home/claude/py/tools/show.py <ders-id>` (`--body` ile tüm metin). Yeni dersler mevcut derslerle ÇAKIŞMASIN; o konuya kısaca değinip ilgili derse göndermede bulun ("Bunu X dersinde gördün").

Uzantı (mevcut derse ekleme) yazıyorsan, PY_EXT nesnesi şu alanları alabilir:
  { id: 'listeler', min: 15, html: '...dersin eksik kalan konularını anlatan 700–1300 kelimelik ek bölüm (h2/h3, pre.py örnekleri, tablo, kutular)...', ex: [...yeni alıştırmalar...], faq: [...ek SSS...], mistakes: [...ek sık hata...] }
`html` dersin "Uzmanlaş" bölümünden önce "Derinleş" başlığıyla eklenir. Önce show.py ile dersin mevcut başlıklarını ve alıştırmalarını oku; eksik kalan alt konuları (DataCamp/Codecademy/CS50P/PCAP müfredatlarında olup burada olmayan) html'e ekle; alıştırmaları dersin toplamı EN AZ 18 olacak şekilde, aşamaları dengeleyerek ekle (mevcutlar: mc→Isınma, code→Kendin yaz sayılır; sen özellikle Kodu oku, Rehberli, Hata avı, Meydan okuma aşamalarını doldur).
