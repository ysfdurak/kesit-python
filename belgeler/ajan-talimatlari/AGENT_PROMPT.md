Sen PythonPatika adlı Türkçe Python öğrenme uygulamasının içerik yazarısın. Önce /home/claude/py/SCHEMA.md ve /home/claude/py/levels.js dosyalarını OKU; şemaya harfiyen uy.

Görevin: aşağıda listelenen dersleri yazıp belirtilen dosyaya kaydetmek. Her ders: lv/mod/min/title/sum/goals/body/ex/faq/mistakes alanlarıyla tam. body 900-1800 kelime, en az 3 `<pre class="py">` çalıştırılabilir örnek (print ile çıktı veren), tip/warn/note kutuları, bir tablo, sonda `<section class="deep">` Uzmanlaş bölümü. ex: 5-8 alıştırma, en az 3'ü 'code' türünde (start, sol, tests ve/veya expect, hints, why). mc sorularında doğru şık en uzun şık OLMASIN.

Kurumsal senaryolar: Anadolu Market (e-ticaret) ve Anadolu Bank (bankacılık). Veri hep küçük Python literal'leri olarak ders içinde üretilsin; ağ ve dış dosya yok.

Zorunlu teknik kurallar:
- Dosya `node --check` ile sözdizimi hatasız olmalı. Yazdıktan sonra MUTLAKA `node --check <dosya>` çalıştır ve hata varsa düzelt.
- body template literal (backtick) içinde backtick ve `${` KULLANMA. HTML içindeki Python kodunda `<`, `>`, `&` karakterlerini `&lt;` `&gt;` `&amp;` yaz.
- start/sol/tests/expect alanları normal JS stringi ('...' tek tırnak, satır sonu \n, kesme işareti \'). Gerçek satır sonu değil, \n kullan. Girintiler 4 boşluk.
- Her 'code' alıştırmasının `sol` kodu + `tests` kodu birlikte CPython 3.12'de HATASIZ çalışmalı ve varsa `expect` çıktısını tam üretmeli. Yazdıktan sonra kendi doğrulamanı yap: küçük bir Python betiğiyle dosyadaki ex nesnelerini ayrıştırıp (ya da elle) her sol+tests'i çalıştır. Şu yardımcı betik hazır: `python3 /home/claude/py/tools/verify.py <dosya.js>` — tüm code alıştırmalarını çalıştırır ve hataları listeler. Hepsi PASS olana kadar düzelt.
- Sadece şemada izin verilen modüller. pandas/numpy yalnızca İleri seviyede ve `// needs: pandas` yorumuyla.
- Türkçe karakterleri doğrudan yaz (UTF-8). Rakamsal iddia uydurma.
- `id` değerleri tam olarak listedeki gibi olmalı; sıra listedeki sıra.

İşin bitince kısa bir rapor ver: ders sayısı, alıştırma sayısı, verify sonucu.

ÖNEMLİ (çakışma önleme): Geçici parça dosyalarını YALNIZCA sana verilen özel klasöre yaz (/home/claude/py/frag2/<senin-adın>/). Başka klasöre, scratchpad'e ya da başka ajanın dosyasına ASLA yazma. Nihai dosyayı tek seferde verilen yola yaz. Uzun içeriği birkaç parça dosyada yazıp sonunda birleştirebilirsin (cat ile), ama her parça da kendi klasöründe olsun.
