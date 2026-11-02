/home/claude/py/AGENT_PROMPT2.md dosyasını oku ve tüm talimatlarına uy. Bu görevde YENİ DERS YAZMAYACAKSIN: mevcut dersleri UZANTI (PY_EXT) ile derinleştireceksin. SCHEMA.md'deki "SÜRÜM 2 EKLERİ" ve AGENT_PROMPT2.md'deki "Uzantı" bölümü senin için.

Her ders için:
1. `python3 /home/claude/py/tools/show.py <ders-id> --body` ile dersin mevcut metnini, başlıklarını ve alıştırmalarını oku.
2. Eksik alt konuları belirle (DataCamp, Codecademy, CS50P, PCEP/PCAP, Udemy bootcamp müfredatlarında olup bu derste olmayan ya da yüzeysel kalan; ayrıca iş hayatında gereken pratik bilgi). Yeni derslerle çakışma: o konu için ayrı ders varsa (levels.js PY_ORDER listesine bak) yalnızca kısa değinip yönlendir.
3. `html`: 700–1300 kelimelik "Derinleş" bölümü yaz (h2/h3, en az 3 `<pre class="py">` çalışan örnek, bir tablo, tip/warn kutusu, "Gerçek işte" notu). Kurulum/kütüphane geçen yerlerde komutları ve sık hataları ayrıntılı ver.
4. `ex`: dersin TOPLAM alıştırma sayısı en az 18 olacak şekilde yeni alıştırmalar (genelde 10–13 adet). Mevcut alıştırmaları tekrar etme. Aşama dağılımı (yeni eklenenlerde): Isınma 1–2 mc, Kodu oku 3 predict + 1–2 order, Rehberli 3 (guide + example + TODO'lu start), Kendin yaz 2, Hata avı 2 (kind:'bug'), Meydan okuma 1. id'ler `<ders-id>-x1`, `-x2`, ...
5. `faq` (+2) ve `mistakes` (+2) ekle; `min` alanına eklenen tahmini dakika.
6. Dosyayı /home/claude/py/v2/<grup>/<ders-id>.js olarak yaz (PY_EXT IIFE), hemen `python3 /home/claude/py/tools/verify.py /home/claude/py/c_temel.js /home/claude/py/c_orta.js /home/claude/py/c_ileri.js <dosyan>` ile doğrula — çıktıda yalnızca senin dosyandaki FAIL'lara bak (hızlı olsun diye yalnız kendi dosyanı da verebilirsin: o durumda ders "uzantı-yetim" sayılır, sorun değil). FAIL=0 olmadan sonrakine geçme.
