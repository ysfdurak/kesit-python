/* Kesit Python — pratik bankası (orta): Regex, JSON/CSV/YAML, Dosya İşlemleri (b-271…b-280) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-271',
    lv: 'orta',
    topic: 'Regex',
    diff: 2,
    kind: 'rehberli',
    title: 'Telefon numaralarını tek biçime getir',
    q: '<p>CRM\'de cep telefonları farklı biçimlerde girilmiş: <code>"0532 123 45 67"</code>, <code>"05321234567"</code>, <code>"+90 (532) 123-45-67"</code>, <code>"532.123.45.67"</code>. <code>telefon_normallestir(metin)</code> fonksiyonunu yaz: geçerli bir Türkiye cep numarasıysa <code>"+90 532 123 45 67"</code> biçiminde döndürsün, değilse <code>None</code>. Önce rakam olmayan her şeyi <code>re.sub</code> ile sil, sonra <code>re.fullmatch</code> ile isteğe bağlı <code>90</code>/<code>0</code> öneki ve <code>5</code> ile başlayan 10 haneyi gruplarla yakala.</p>',
    guide: ['<code>rakamlar = re.sub(r"\\D", "", metin)</code> ile yalnızca rakamları bırak.', 'Desen: isteğe bağlı önek <code>(?:90|0)?</code>, ardından gruplar: <code>(5\\d{2})(\\d{3})(\\d{2})(\\d{2})</code>.', '<code>re.fullmatch</code> eşleşmezse <code>None</code> döndür.', 'Eşleşirse grupları <code>"+90 {} {} {} {}"</code> biçiminde birleştir.'],
    example: 'import re\n# Önce temizle, sonra tüm metni gruplarla doğrula\nposta = re.sub(r"\\D", "", "TR-34 710")\nm = re.fullmatch(r"(\\d{2})(\\d{3})", posta)\nprint(posta, m.groups() if m else None)   # 34710 (\'34\', \'710\')\n',
    start: 'import re\n\ndef telefon_normallestir(metin):\n    # TODO 1: rakam olmayanları sil\n    # TODO 2: fullmatch ile önek + 4 grup\n    # TODO 3: eşleşmezse None, eşleşirse biçimle\n    return metin\n',
    sol: 'import re\n\nDESEN = re.compile(r"(?:90|0)?(5\\d{2})(\\d{3})(\\d{2})(\\d{2})")\n\ndef telefon_normallestir(metin):\n    rakamlar = re.sub(r"\\D", "", metin)\n    m = DESEN.fullmatch(rakamlar)\n    if not m:\n        return None\n    return "+90 " + " ".join(m.groups())\n',
    tests: 'hedef = "+90 532 123 45 67"\nfor g in ["0532 123 45 67", "05321234567", "+90 (532) 123-45-67", "532.123.45.67"]:\n    assert telefon_normallestir(g) == hedef, f"{g!r} → {hedef!r} bekleniyordu, gelen {telefon_normallestir(g)!r}"\nassert telefon_normallestir("0212 555 44 33") is None, "sabit hat (5 ile başlamayan) geçersiz sayılmalı"\nassert telefon_normallestir("0532 123 45") is None, "eksik hane geçersiz (fullmatch kısmi eşleşmeyi reddeder)"\nassert telefon_normallestir("905321234567890") is None, "fazla hane geçersiz"\n',
    hints: ['<code>\\D</code> "rakam olmayan" demektir.', 'Önek için gruplamayan parantez: <code>(?:90|0)?</code>; geri kalan 4 grup.', '<code>"+90 " + " ".join(m.groups())</code>'],
    why: 'Önce gürültüyü (boşluk, tire, parantez, nokta) temizleyip sonra katı bir desenle doğrulamak, her biçim için ayrı desen yazmaktan çok daha sağlamdır. <code>fullmatch</code> fazla/eksik haneyi reddeder; gruplamayan <code>(?:...)</code> öneki <code>groups()</code> dışında tutar. Gerçek projelerde uluslararası numaralar için <code>phonenumbers</code> kütüphanesi kullanılır; tek ülkeye özgü veri temizliğinde bu yaklaşım yeterlidir.',
    tags: ['re.sub', 'fullmatch', 'normalizasyon'],
    min: 7
  },

  {
    id: 'b-272',
    lv: 'orta',
    topic: 'Regex',
    diff: 2,
    kind: 'rehberli',
    title: 'Şifre politikası: ileriye bakış',
    q: '<p>Ilgaz Bank internet şubesi şifre kuralı: en az 8 karakter, en az bir <b>büyük harf</b> (A-Z), en az bir <b>rakam</b>, en az bir <b>özel karakter</b> (<code>!@#$%*.-</code> içinden), <b>boşluk yok</b>. <code>sifre_gecerli(s)</code> fonksiyonunu tek bir <code>re.fullmatch</code> deseniyle, ileriye bakış (lookahead, <code>(?=...)</code>) kullanarak yaz; <code>True/False</code> döndürsün.</p>',
    guide: ['Her "en az bir" kuralı ayrı bir ileriye bakış olur: <code>(?=.*[A-Z])</code> gibi; bunlar karakter tüketmez.', 'Rakam için <code>(?=.*\\d)</code>, özel karakter için <code>(?=.*[!@#$%*.-])</code>.', 'Uzunluk ve boşluk yasağını tüketen kısım halleder: <code>\\S{8,}</code>.', 'Hepsini birleştirip <code>re.fullmatch(desen, s) is not None</code> döndür.'],
    example: 'import re\n# İleriye bakış: "ileride şu var mı?" diye bakar ama konumu ilerletmez\ndesen = r"(?=.*[aeıioöuü])\\w{3,}"   # en az bir sesli harf, en az 3 harf\nfor k in ["kitap", "krt", "ab"]:\n    print(k, bool(re.fullmatch(desen, k)))\n',
    start: 'import re\n\ndef sifre_gecerli(s):\n    # TODO 1: büyük harf, rakam, özel karakter için üç lookahead\n    # TODO 2: boşluksuz en az 8 karakter\n    desen = r".{8,}"\n    return re.fullmatch(desen, s) is not None\n',
    sol: 'import re\n\nDESEN = re.compile(r"(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%*.-])\\S{8,}")\n\ndef sifre_gecerli(s):\n    return DESEN.fullmatch(s) is not None\n',
    tests: 'assert sifre_gecerli("Anadolu.2026") is True, "tüm kuralları sağlayan şifre geçerli"\nassert sifre_gecerli("anadolu.2026") is False, "büyük harf yok"\nassert sifre_gecerli("Anadolu.Bank") is False, "rakam yok"\nassert sifre_gecerli("Anadolu2026") is False, "özel karakter yok"\nassert sifre_gecerli("An.2026") is False, "8 karakterden kısa"\nassert sifre_gecerli("Anadolu 2026!") is False, "boşluk içeremez"\n',
    hints: ['Lookahead\'ler desenin başında arka arkaya yazılır; sıraları önemli değildir.', 'Karakter sınıfında <code>-</code> en sonda olursa aralık değil düz tire sayılır.', '<code>r"(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%*.-])\\S{8,}"</code>'],
    why: 'İleriye bakışlar konumu değiştirmeden "metnin bir yerinde X var mı?" diye sorar; bu yüzden birden fazla koşul tek desende VE ile birleşir, asıl tüketimi <code>\\S{8,}</code> yapar. Alternatif ve çoğu ekipte daha okunur çözüm: her kuralı ayrı kontrol etmek (<code>any(c.isupper() for c in s)</code> ...); bu, kullanıcıya hangi kuralın eksik olduğunu söylemeyi de kolaylaştırır. Tek desen ise HTML <code>pattern</code> özniteliği gibi yalnızca regex kabul eden yerlerde kazanır.',
    tags: ['lookahead', 'fullmatch', 'doğrulama'],
    min: 7
  },

  {
    id: 'b-273',
    lv: 'orta',
    topic: 'Regex',
    diff: 2,
    kind: 'yaz',
    title: 'SMS şablonunu doldur',
    q: '<p>Kampanya SMS şablonları <code>"Merhaba {{ad}}, {{tutar}} TL puanınız var."</code> biçiminde. <code>sablon_doldur(sablon, veri)</code> fonksiyonunu yaz: <code>{{anahtar}}</code> yer tutucularını (süslü parantez içinde boşluk olabilir: <code>{{ ad }}</code>) <code>veri</code> sözlüğündeki değerle değiştirsin. Sözlükte olmayan anahtar <b>olduğu gibi kalsın</b> (log\'da fark edilsin diye). <code>re.sub</code>\'a fonksiyon ver.</p>',
    start: 'import re\n\ndef sablon_doldur(sablon, veri):\n    # buraya yaz\n    pass\n',
    sol: 'import re\n\nYER = re.compile(r"\\{\\{\\s*(\\w+)\\s*\\}\\}")\n\ndef sablon_doldur(sablon, veri):\n    def degistir(m):\n        anahtar = m.group(1)\n        return str(veri[anahtar]) if anahtar in veri else m.group(0)\n    return YER.sub(degistir, sablon)\n',
    tests: 's = "Merhaba {{ad}}, {{ tutar }} TL puanınız var. Kod: {{kod}}"\nr = sablon_doldur(s, {"ad": "Ece", "tutar": 150})\nassert r == "Merhaba Ece, 150 TL puanınız var. Kod: {{kod}}", f"bilinmeyen anahtar aynen kalmalı, sayılar str\'ye çevrilmeli; gelen: {r!r}"\nassert sablon_doldur("Sabit metin", {}) == "Sabit metin", "yer tutucu yoksa metin değişmemeli"\n',
    hints: ['Süslü parantez regex\'te özel; <code>\\{\\{</code> ile kaçır. Anahtarı <code>(\\w+)</code> grubuyla yakala.', '<code>re.sub(desen, fonksiyon, metin)</code>: fonksiyon eşleşme nesnesini alır, yerine konacak metni döndürür.', 'Bilinmeyen anahtarda <code>m.group(0)</code> (tüm eşleşme) döndür.'],
    why: '<code>re.sub</code>\'a metin yerine fonksiyon vermek, her eşleşme için dinamik karar vermeyi sağlar: sözlükte varsa değer, yoksa eşleşmenin kendisi. <code>str()</code> sayısal değerleri güvenle ekler. Gerçek şablon ihtiyaçlarında (döngü, koşul, kaçış) <code>jinja2</code> kullanılır; basit yer tutucular için standart kütüphanedeki <code>string.Template</code> (<code>$ad</code> sözdizimi ve <code>safe_substitute</code>) de aynı "bilinmeyeni bırak" davranışını sunar.',
    tags: ['re.sub', 'callback', 'şablon'],
    min: 6
  },

  {
    id: 'b-274',
    lv: 'orta',
    topic: 'Regex',
    diff: 3,
    kind: 'yaz',
    title: 'Tırnaklı anahtar=değer ayrıştırıcı',
    q: '<p>Ödeme ağ geçidi log\'ları <code>ad="Ece Kaya" tutar=150.5 sehir=İzmir not=""</code> biçiminde. Değer tırnaklıysa içinde boşluk olabilir (tırnaklar sonuca girmez), tırnaksızsa ilk boşluğa kadar sürer. <code>kv_ayristir(satir)</code> fonksiyonunu yaz: sözlük döndürsün, tüm değerler <code>str</code> kalsın. <code>re.finditer</code> ve <b>alternatif</b> (<code>|</code>) içeren isimli gruplar kullan.</p>',
    start: 'import re\n\ndef kv_ayristir(satir):\n    # buraya yaz\n    pass\n',
    sol: 'import re\n\nKV = re.compile(r\'(?P<k>\\w+)=(?:"(?P<q>[^"]*)"|(?P<v>\\S+))\')\n\ndef kv_ayristir(satir):\n    sonuc = {}\n    for m in KV.finditer(satir):\n        sonuc[m["k"]] = m["q"] if m["q"] is not None else m["v"]\n    return sonuc\n',
    tests: 'r = kv_ayristir(\'ad="Ece Kaya" tutar=150.5 sehir=İzmir not=""\')\nassert r == {"ad": "Ece Kaya", "tutar": "150.5", "sehir": "İzmir", "not": ""}, f"beklenmeyen sonuç: {r}"\nassert r["not"] == "", "boş tırnaklı değer boş metin olmalı (None değil): \'is not None\' ile kontrol et"\nassert kv_ayristir("") == {}, "boş satır boş sözlük"\n',
    hints: ['Değer kısmı iki seçenekli: <code>"([^"]*)"</code> ya da <code>(\\S+)</code>. Tırnaklı seçenek ÖNCE yazılmalı.', 'Eşleşmeyen grup <code>None</code> döner; boş tırnak <code>""</code> ise boş metindir.', '<code>m["q"] if m["q"] is not None else m["v"]</code>'],
    why: 'Alternatifler soldan sağa denenir; tırnaklı biçim önce gelmezse <code>\\S+</code> <code>"Ece</code> kısmını yutar. Katılmayan grup <code>None</code>, katılıp boş eşleşen grup <code>""</code> döner; <code>or</code> kullanmak boş değeri yanlışlıkla diğer gruba düşürür, bu yüzden <code>is not None</code> şart. Kaçışlı tırnak (<code>\\"</code>) gibi durumlar gerekiyorsa standart kütüphanedeki <code>shlex.split</code> daha sağlam bir alternatiftir.',
    tags: ['finditer', 'alternation', 'named group'],
    min: 9
  },

  {
    id: 'b-275',
    lv: 'orta',
    topic: 'JSON/CSV/YAML',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'JSON gidiş-dönüşünde ne değişir?',
    q: '<p>Bir sözlük önbelleğe JSON olarak yazılıp geri okunuyor. Bu kod ne yazdırır?</p>',
    code: 'import json\n\nveri = {1: ("a", "b"), "ok": True, "yok": None}\ngeri = json.loads(json.dumps(veri))\nprint(geri)\nprint(geri == veri)\n',
    o: ['{1: (\'a\', \'b\'), \'ok\': True, \'yok\': None}\nTrue', '{\'1\': [\'a\', \'b\'], \'ok\': True, \'yok\': None}\nFalse', '{\'1\': [\'a\', \'b\'], \'ok\': \'true\', \'yok\': \'null\'}\nFalse', '{1: [\'a\', \'b\'], \'ok\': True, \'yok\': None}\nFalse'],
    a: 1,
    hints: ['JSON\'da nesne anahtarları yalnızca metin olabilir.', 'JSON\'da demet (tuple) türü yoktur; yalnızca dizi vardır.'],
    why: 'JSON\'un tür sistemi Python\'dan dardır: anahtarlar metne çevrilir (1 → "1"), demetler diziye, oradan listeye döner. <code>true</code>/<code>null</code> ise doğru biçimde <code>True</code>/<code>None</code>\'a çevrilir. Sonuç orijinale eşit değildir. Önbellek ya da API\'de sayısal anahtar kullanıyorsan okurken geri çevirmen (<code>{int(k): v ...}</code>) ya da baştan metin anahtar kullanman gerekir.',
    tags: ['json', 'serileştirme', 'tür dönüşümü'],
    min: 2
  },

  {
    id: 'b-276',
    lv: 'orta',
    topic: 'JSON/CSV/YAML',
    diff: 2,
    kind: 'rehberli',
    title: 'Excel uyumlu Türkçe CSV raporu',
    q: '<p>Muhasebe, raporları Türkçe Excel\'de açıyor: alan ayırıcı <b>noktalı virgül</b>, ondalık ayırıcı <b>virgül</b>. <code>rapor_csv(satirlar)</code> fonksiyonunu yaz: <code>[{"sehir": "Ankara", "ciro": 1250.5}, ...]</code> listesinden <code>csv.DictWriter</code> ile başlıklı (<code>sehir;ciro</code>) bir CSV metni üretsin. Ciro iki ondalıkla ve virgülle yazılsın (<code>1250,50</code>). Satır sonu <code>"\\n"</code> olsun. Şehir adında <code>;</code> varsa csv modülü otomatik tırnaklamalı.</p>',
    guide: ['Metne yazmak için <code>io.StringIO()</code> kullan.', '<code>csv.DictWriter(akis, fieldnames=["sehir", "ciro"], delimiter=";", lineterminator="\\n")</code> oluştur.', '<code>writeheader()</code> çağır, sonra her satırda ciroyu <code>f"{ciro:.2f}".replace(".", ",")</code> ile biçimleyip <code>writerow</code>.', '<code>akis.getvalue()</code> döndür.'],
    example: 'import csv, io\nakis = io.StringIO()\nw = csv.writer(akis, delimiter="|", lineterminator="\\n")\nw.writerow(["ad", "not"])\nw.writerow(["Ece", "çok|iyi"])   # ayırıcı içeren alan tırnaklanır\nprint(akis.getvalue())\n',
    start: 'import csv\nimport io\n\ndef rapor_csv(satirlar):\n    akis = io.StringIO()\n    # TODO 1: DictWriter (; ayırıcı, \\n satır sonu)\n    # TODO 2: başlık\n    # TODO 3: ciroyu virgüllü biçimleyip satırları yaz\n    return akis.getvalue()\n',
    sol: 'import csv\nimport io\n\ndef rapor_csv(satirlar):\n    akis = io.StringIO()\n    w = csv.DictWriter(akis, fieldnames=["sehir", "ciro"], delimiter=";", lineterminator="\\n")\n    w.writeheader()\n    for s in satirlar:\n        w.writerow({"sehir": s["sehir"], "ciro": f"{s[\'ciro\']:.2f}".replace(".", ",")})\n    return akis.getvalue()\n',
    tests: 'r = rapor_csv([{"sehir": "Ankara", "ciro": 1250.5}, {"sehir": "İzmir", "ciro": 80}])\nassert r == "sehir;ciro\\nAnkara;1250,50\\nİzmir;80,00\\n", f"CSV metni farklı:\\n{r}"\nr2 = rapor_csv([{"sehir": "Bursa;Merkez", "ciro": 1}])\nassert r2.splitlines()[1] == \'"Bursa;Merkez";1,00\', "ayırıcı içeren alan tırnaklanmalı (csv modülü bunu otomatik yapar)"\nassert rapor_csv([]) == "sehir;ciro\\n", "boş listede yalnızca başlık"\n',
    hints: ['CSV\'yi elle <code>";".join</code> ile kurma; tırnaklama kurallarını csv modülü bilir.', 'Ondalık için: <code>f"{x:.2f}".replace(".", ",")</code>.', 'Varsayılan satır sonu <code>"\\r\\n"</code>dir; <code>lineterminator="\\n"</code> ver.'],
    why: '<code>csv</code> modülü ayırıcı, tırnak ve satır sonu içeren alanları standart (RFC 4180) biçimde kaçırır; elle birleştirme ilk "Bursa;Merkez" verisinde bozulur. Türkçe bölgesel ayarlı Excel virgülü ondalık saydığı için ayırıcı noktalı virgüldür. Dosyaya yazarken <code>open(..., "w", newline="", encoding="utf-8-sig")</code> kullan: <code>newline=""</code> boş satırları, <code>utf-8-sig</code> (BOM) Excel\'deki Türkçe karakter bozulmasını önler.',
    tags: ['csv.DictWriter', 'delimiter', 'Excel'],
    min: 7
  },

  {
    id: 'b-277',
    lv: 'orta',
    topic: 'JSON/CSV/YAML',
    diff: 2,
    kind: 'yaz',
    needs: ['pyyaml'],
    title: 'YAML\'dan zamanlanmış görev listesi',
    q: '<p>Gece çalışan ETL görevleri bir YAML dosyasında tanımlı. <code>aktif_gorevler(yaml_metin)</code> fonksiyonunu yaz: <code>yaml.safe_load</code> ile ayrıştırsın, <code>gorevler</code> listesinden <code>aktif</code> alanı <code>true</code> olanların (alan yoksa aktif say) adlarını <code>saat</code>\'e göre artan sırada liste olarak döndürsün. <code>gorevler</code> anahtarı yoksa boş liste.</p><pre>gorevler:\n  - ad: stok_esitle\n    saat: "02:00"\n  - ad: rapor_gonder\n    saat: "06:30"\n    aktif: false</pre>',
    start: 'import yaml\n\ndef aktif_gorevler(yaml_metin):\n    # buraya yaz\n    pass\n',
    sol: 'import yaml\n\ndef aktif_gorevler(yaml_metin):\n    veri = yaml.safe_load(yaml_metin) or {}\n    gorevler = [g for g in veri.get("gorevler", []) if g.get("aktif", True)]\n    return [g["ad"] for g in sorted(gorevler, key=lambda g: g["saat"])]\n',
    tests: 'y = """\ngorevler:\n  - ad: rapor_gonder\n    saat: "06:30"\n  - ad: yedek_al\n    saat: "03:15"\n    aktif: false\n  - ad: stok_esitle\n    saat: "02:00"\n    aktif: true\n"""\nr = aktif_gorevler(y)\nassert r == ["stok_esitle", "rapor_gonder"], f"aktif görevler saate göre: [\'stok_esitle\', \'rapor_gonder\'] bekleniyordu, gelen {r}"\nassert aktif_gorevler("baska: 1") == [], "gorevler anahtarı yoksa boş liste"\nassert aktif_gorevler("") == [], "boş YAML (None döner) boş liste vermeli"\n',
    hints: ['<code>yaml.safe_load</code> boş metinde <code>None</code> döndürür; <code>or {}</code> ile koru.', '<code>g.get("aktif", True)</code> alan yoksa aktif sayar.', 'Saatleri tırnaklı yaz/oku: "HH:MM" metinleri doğru sıralanır.'],
    why: 'YAML insan tarafından düzenlenen yapılandırmalar için okunurdur; <code>safe_load</code> yalnızca temel türleri üretir, <code>yaml.load</code> ise güvenilmeyen girdide keyfi nesne oluşturabileceği için kullanılmamalıdır. Dikkat: tırnaksız <code>02:00</code> bazı YAML sürümlerinde altmışlık sayı olarak yorumlanabilir; saatleri tırnaklamak güvenlidir. Daha katı şema doğrulaması gerekirse sonucu <code>pydantic</code> modeline vermek iyi bir sonraki adımdır.',
    tags: ['yaml', 'safe_load', 'yapılandırma'],
    min: 6
  },

  {
    id: 'b-278',
    lv: 'orta',
    topic: 'JSON/CSV/YAML',
    diff: 3,
    kind: 'yaz',
    title: 'İç içe JSON\'u düz sütunlara aç',
    q: '<p>Sipariş API\'si iç içe JSON döndürüyor; analiz ekibi düz tablo istiyor. <code>duzlestir(veri, ayrac=".")</code> fonksiyonunu yaz: iç içe sözlük ve listeleri tek seviyeli sözlüğe çevirsin. Sözlük anahtarları yol olarak birleşsin (<code>"musteri.adres.sehir"</code>), liste elemanları indeksle (<code>"kalemler.0.ad"</code>). Boş sözlük/liste değer olarak aynen kalsın.</p>',
    start: 'def duzlestir(veri, ayrac="."):\n    # buraya yaz\n    pass\n',
    sol: 'def duzlestir(veri, ayrac="."):\n    sonuc = {}\n\n    def gez(deger, yol):\n        if isinstance(deger, dict) and deger:\n            for k, v in deger.items():\n                gez(v, f"{yol}{ayrac}{k}" if yol else str(k))\n        elif isinstance(deger, list) and deger:\n            for i, v in enumerate(deger):\n                gez(v, f"{yol}{ayrac}{i}" if yol else str(i))\n        else:\n            sonuc[yol] = deger\n\n    gez(veri, "")\n    return sonuc\n',
    tests: 's = {"no": 501, "musteri": {"ad": "Ece", "adres": {"sehir": "İzmir"}},\n     "kalemler": [{"ad": "Kalem", "adet": 3}, {"ad": "Defter", "adet": 1}], "etiketler": []}\nr = duzlestir(s)\nbeklenen = {"no": 501, "musteri.ad": "Ece", "musteri.adres.sehir": "İzmir",\n            "kalemler.0.ad": "Kalem", "kalemler.0.adet": 3, "kalemler.1.ad": "Defter", "kalemler.1.adet": 1,\n            "etiketler": []}\nassert r == beklenen, f"düzleştirme yanlış: {r}"\nassert duzlestir({"a": {"b": 1}}, ayrac="__") == {"a__b": 1}, "ayraç parametresi kullanılmalı"\n',
    hints: ['Özyinelemeli bir iç fonksiyon yaz: (değer, o ana kadarki yol).', 'Sözlükte anahtarları, listede indeksleri yola ekle; ilk seviyede ayraç koyma.', 'Yaprak (sözlük/liste olmayan ya da boş olan) değerde <code>sonuc[yol] = deger</code>.'],
    why: 'Ağaç yapılı veriyi özyinelemeyle gezip yolu biriktirmek, derinliği bilinmeyen JSON\'lar için genel bir çözümdür. Boş kapları yaprak saymak veri kaybını önler. pandas kullanıyorsan <code>pd.json_normalize(veri, sep=".")</code> sözlükleri aynı biçimde açar (listeleri ise <code>record_path</code> ile ayrı satırlara böler); kütüphanesiz ortamlarda ve ETL betiklerinde bu fonksiyon işini görür.',
    tags: ['json', 'özyineleme', 'düzleştirme'],
    min: 9
  },

  {
    id: 'b-279',
    lv: 'orta',
    topic: 'JSON/CSV/YAML',
    diff: 1,
    kind: 'bug',
    title: 'Tırnaklı virgülde bozulan CSV',
    q: '<p>Hatayı bul ve düzelt. <code>musteri_sayisi(csv_metin)</code> başlıklı CSV\'de şehir başına müşteri sayısını döndürmeli. Bazı müşteri adlarında virgül var (<code>"Kaya, Ece"</code> tırnaklı yazılmış); elle <code>split(",")</code> bu satırlarda sütunları kaydırıyor.</p>',
    start: 'def musteri_sayisi(csv_metin):\n    sayim = {}\n    satirlar = csv_metin.strip().split("\\n")[1:]\n    for satir in satirlar:\n        ad, sehir = satir.split(",")[:2]\n        sayim[sehir] = sayim.get(sehir, 0) + 1\n    return sayim\n',
    sol: 'import csv\nimport io\n\ndef musteri_sayisi(csv_metin):\n    sayim = {}\n    for r in csv.DictReader(io.StringIO(csv_metin.strip())):\n        sayim[r["sehir"]] = sayim.get(r["sehir"], 0) + 1\n    return sayim\n',
    tests: 'm = \'ad,sehir\\n"Kaya, Ece",İzmir\\nCan Demir,Ankara\\n"Yıldız, Ali",İzmir\\n\'\nr = musteri_sayisi(m)\nassert r == {"İzmir": 2, "Ankara": 1}, f"tırnaklı virgül alan ayırıcı sayılmamalı; csv modülü kullan. Gelen: {r}"\n',
    hints: ['CSV yalnızca "virgülle ayrılmış metin" değildir: tırnak ve kaçış kuralları vardır.', '<code>csv.DictReader(io.StringIO(metin))</code>'],
    why: '<code>"Kaya, Ece"</code> tek bir alandır; <code>split(",")</code> tırnakları bilmediği için onu ikiye böler ve şehir sütunu " Ece" olur. <code>csv</code> modülü tırnak, kaçış ve çok satırlı alanları standarda göre çözer. Kural: CSV\'yi asla elle bölme; büyük veride <code>pandas.read_csv</code> aynı kuralları uygular.',
    tags: ['csv', 'tırnak', 'DictReader'],
    min: 3
  },

  {
    id: 'b-280',
    lv: 'orta',
    topic: 'Dosya İşlemleri',
    diff: 1,
    t: 'order',
    kind: 'order',
    title: 'Rapor klasörü oluştur ve listele',
    q: '<p>Geçici bir dizinde <code>aylik_raporlar</code> klasörünü oluşturup içine iki CSV yazan ve klasördeki CSV adlarını sıralı listeleyen programı sırala. Çıktı <code>[\'ocak.csv\', \'subat.csv\']</code> olmalı.</p>',
    lines: ['import tempfile, pathlib', 'klasor = pathlib.Path(tempfile.mkdtemp()) / "aylik_raporlar"', 'klasor.mkdir()', 'for ay in ["ocak", "subat"]:', '    (klasor / f"{ay}.csv").write_text("sehir;ciro\\n", encoding="utf-8")', 'adlar = sorted(p.name for p in klasor.glob("*.csv"))', 'print(adlar)'],
    expect: '[\'ocak.csv\', \'subat.csv\']\n',
    hint: 'Klasör yazılmadan önce oluşturulmalı; listeleme dosyalar yazıldıktan sonra yapılır.',
    hints: ['Klasör yazılmadan önce oluşturulmalı; listeleme dosyalar yazıldıktan sonra yapılır.'],
    why: '<code>pathlib.Path</code> yolları <code>/</code> operatörüyle birleştirir, işletim sistemine göre doğru ayırıcıyı kullanır. <code>write_text</code> dosyayı açıp yazıp kapatır; <code>glob("*.csv")</code> desene uyan yolları üretir (sırası garanti değildir, bu yüzden <code>sorted</code>). <code>mkdir()</code> klasör varsa hata verir; tekrar çalışabilir betiklerde <code>mkdir(parents=True, exist_ok=True)</code> kullanılır.',
    tags: ['pathlib', 'glob', 'mkdir'],
    min: 3
  }
);
})(window);
