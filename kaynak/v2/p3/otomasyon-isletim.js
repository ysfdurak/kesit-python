/* Kesit Python: Otomasyonu işletmek. uretec/p3 üretir, elle düzenleme. */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(Object.assign({ id: 'otomasyon-isletim', lv: 'ileri' }, {
 "mod": "Otomasyon, web ve araçlar",
 "min": 70,
 "needs": [],
 "title": "Otomasyonu işletmek: hata, tekrar, kilit, günlük",
 "sum": "Çalışan betiği gece kimse bakmadan çalışan işe çevirirsin: geçici hatayı tekrarlama, atomik yazma, kilit, katmanlı ayar ve gizli değer, maskeli JSON günlük, robots.txt ve hız sınırı, karantina, kaçan gün hesabı, paketleme ve test.",
 "goals": [
  "Geçici ve kalıcı hatayı ayırıp güvenle yeniden deneyebilirim.",
  "Yarım dosya bırakmayan yazma ve çift çalışmayı önleyen kilit kurabilirim.",
  "Ayarları katmanlı okuyup gizli değeri dosyadan ve günlükten uzak tutabilirim.",
  "Web verisi çekerken robots.txt ve hız sınırına uyabilirim.",
  "Kötü kaydı karantinaya alıp işi sürdürebilir, ne zaman duracağını bilirim.",
  "İşi paketleyip pytest ile sınayabilir, zamanlayıcıya verebilirim."
 ],
 "body": "<h2>Betik ile iş arasındaki fark</h2>\n<p>Dosya, Excel, PDF, e-posta ve web işlerinin nasıl yapıldığını <b>ofis-otomasyon</b>, <b>pdf-word-otomasyon</b>, <b>excel-otomasyon</b> ve <b>web-scraping</b> derslerinde gördün. Bu ders işin görünmeyen yarısını anlatır: kimse başında değilken ne olur?</p>\n<div class=\"tbl-wrap\"><table><tr><th>Soru</th><th>Parça</th></tr><tr><td>Ağ gidip geldi</td><td>Yeniden deneme: yalnız geçici hata</td></tr><tr><td>Elektrik kesildi, dosya yarım kaldı</td><td>Atomik yazma</td></tr><tr><td>Dünkü iş bitmeden bugünkü başladı</td><td>Kilit</td></tr><tr><td>İki kez çalıştı</td><td>İdempotent tasarım: işlenmiş kaydı dosyada tut</td></tr><tr><td>Sunucu değişti, parola değişti</td><td>Katmanlı ayar, gizli değer ortamda</td></tr><tr><td>Gece 3'te patladı, neden?</td><td>JSON günlük, koşu numarası, maskeleme</td></tr><tr><td>1000 satırın 3'ü bozuk</td><td>Karantina ve hata oranı</td></tr><tr><td>Bilgisayar 4 gün kapalıydı</td><td>Kaçan gün hesabı</td></tr><tr><td>Başka makinede nasıl çalışacak?</td><td>Paket, test, zamanlayıcı</td></tr></table></div>\n<pre class=\"py\"># Aynı iş, iki yazım. Çalışan betik ile işletilebilen iş arasındaki fark tablodaki sorulardır.\nimport json, os, tempfile\n\ndef rapor_kirilgan(klasor, veri):\n    with open(os.path.join(klasor, \"rapor.json\"), \"w\") as f:     # yarıda kesilirse bozuk dosya\n        f.write(json.dumps(veri))\n\ndef rapor_saglam(klasor, veri):\n    yol = os.path.join(klasor, \"rapor.json\")\n    fd, gecici = tempfile.mkstemp(dir=klasor)\n    with os.fdopen(fd, \"w\", encoding=\"utf-8\") as f:\n        f.write(json.dumps(veri, ensure_ascii=False))\n    os.replace(gecici, yol)                                      # ya eski dosya ya yeni dosya, arası yok\n\nd = tempfile.mkdtemp()\nrapor_saglam(d, {\"toplam\": 42})\nprint(os.listdir(d), open(os.path.join(d, \"rapor.json\")).read())</pre>\n<h2>Yeniden deneme</h2>\n<p>Yalnız düzelebilecek hatayı tekrarla: zaman aşımı, bağlantı kopması, 429, 5xx. 400, 401, 404 tekrarla düzelmez, sunucuyu yorarsın. Bekleme üstel artar, üst sınırı olur, biraz rastgelelik eklenir ki aynı anda düşen işler aynı anda dönmesin. Sunucu <code>Retry-After</code> gönderdiyse ona uy. Yan etkili işlemlerde (para, e-posta) önce idempotent yap, sonra tekrarla.</p>\n<h2>Atomik yazma ve kilit</h2>\n<p><code>os.replace</code> aynı dosya sisteminde atomiktir: okuyan ya eski dosyayı ya yeniyi görür. Geçici dosya bu yüzden hedefle <b>aynı klasörde</b> açılır. Kilit için <code>O_CREAT | O_EXCL</code> kullanılır: dosyayı oluşturma ve var mı bakma tek adımdır, \"önce bak sonra oluştur\" iki sürecin de geçmesine izin verir. Süreç ölürse kilit kalır; bu yüzden zaman damgası tutulur ve bayat kilit devralınır. Bu kilit paylaşımlı ağ sürücüsünde güvenilir olmayabilir, tek makine için düşün.</p>\n<h2>Ayar ve gizli değer</h2>\n<p>Sıra: varsayılan, dosya, ortam değişkeni, komut satırı. Sonraki öncekini ezer. Ortamdan gelen değer hep metindir: <code>bool(\"false\")</code> <code>True</code> verir, dönüştürmeyi kendin yap. Parola ve anahtar dosyaya, koda ve Git'e girmez, ortam değişkeni ya da kurumun gizli değer kasasından gelir. Dosyada bulursan çalışmayı reddet.</p>\n<h2>Günlük</h2>\n<p>Satır başına bir JSON, her satırda koşu numarası. Böylece <code>grep</code> ve pandas ile okunur. Maskeleme filtrede yapılır, çağıran kişinin hatırlamasına bırakılmaz. Maskelemeyi biçimlenmiş mesajda yap: gizli değer <code>%s</code> argümanı olarak da gelebilir. Bu desen her sızıntıyı yakalamaz; en iyisi gizli değeri günlüğe hiç vermemektir.</p>\n<h2>Web veri çekmede etik ve sınırlar</h2>\n<ul><li><b>Önce API.</b> Sitenin resmî API'si ya da dışa aktarma özelliği varsa onu kullan.</li><li><b>Kullanım koşulları.</b> Sitenin şartlarını oku. <code>robots.txt</code> erişim kuralını bildirir, ama izin veya hukuk belgesi değildir: yasaklıyorsa uy, izin veriyor diye her şey serbest olmaz.</li><li><b>Kişisel veri.</b> Herkese açık olması serbestçe toplanabileceği anlamına gelmez; KVKK gibi düzenlemeler geçerlidir. Şüphede hukuk birimine sor. Bu ders hukuki danışmanlık değildir.</li><li><b>Yük.</b> Kimliğini <code>User-Agent</code> ile söyle, aralık bırak, aynı sayfayı önbellekten oku.</li><li><b>Kimlik doğrulaması ve engel.</b> Girişle korunan alanı ya da CAPTCHA'yı aşmaya çalışma.</li></ul>\n<h2>Kötü kayıt: durmak mı, devam mı?</h2>\n<p>Tek bozuk satır bütün işi durdurmamalı, ama sessizce de atılmamalı: <b>karantina</b> dosyasına nedenle yazılır. Hata oranı çok yükselince devam etmek de yanlıştır, kaynak bozuk olabilir. Çıkış kodu zamanlayıcıya durumu söyler: 0 temiz, 1 kısmi, 2 durdu.</p>\n<h2>Zamanlama</h2>\n<p>Zamanlayıcı (cron, Windows Görev Zamanlayıcı) işi başlatır, sonucu umursamaz; kaçırılan çalışmayı da telafi etmez. Bu yüzden son başarılı günü dosyada tut, kaçan iş günlerini hesapla, çok fazlaysa kendi başına çalışma, insana sor. Tarih ve saat için tek bir saat dilimi seç.</p>",
 "ex": [
  {
   "t": "mc",
   "id": "otomasyon-isletim-m1",
   "stage": "Isınma",
   "q": "API 401 döndü. İş ne yapmalı?",
   "o": [
    "Durup anahtarı bildirmeli",
    "Üstel bekleyip tekrarlamalı",
    "Yeni anahtar uydurmalı",
    "Sonucu boş kabul etmeli"
   ],
   "a": 0,
   "why": "401 tekrarla düzelmez, kimlik sorunudur."
  },
  {
   "t": "mc",
   "id": "otomasyon-isletim-m2",
   "stage": "Isınma",
   "q": "Geçici dosya neden hedefle aynı klasörde açılır?",
   "o": [
    "Daha az yer kaplasın",
    "Dosya adı kısa olsun",
    "Taşıma atomik olsun",
    "İzin istemesin diye"
   ],
   "a": 2,
   "why": "Farklı dosya sistemleri arasında os.replace atomik olmaz, hata da verebilir."
  },
  {
   "t": "mc",
   "id": "otomasyon-isletim-m3",
   "stage": "Isınma",
   "q": "robots.txt bir sayfaya izin veriyor. Ne anlama gelir?",
   "o": [
    "Veri her amaçla kullanılabilir",
    "Kişisel veri toplanabilir",
    "Kullanım koşullarına bakılmaz",
    "Yalnız erişim kuralı geçer"
   ],
   "a": 3,
   "why": "robots.txt hukuki izin değildir; şartlar ve kişisel veri mevzuatı ayrıca geçerlidir."
  },
  {
   "t": "mc",
   "id": "otomasyon-isletim-m4",
   "stage": "Isınma",
   "q": "1000 satırın 600'ü hatalı geliyor. Doğrusu hangisi?",
   "o": [
    "Hepsini karantinaya yazıp bitir",
    "İşi durdur, kaynağa bak",
    "Hatalıları sessizce at",
    "Satırları tahminle düzelt"
   ],
   "a": 1,
   "why": "Bu oran kaynağın bozulduğunu gösterir. Eşik aşılınca durmak doğrudur."
  },
  {
   "t": "predict",
   "id": "otomasyon-isletim-t1",
   "stage": "Kodu oku",
   "q": "Ne yazdırır?",
   "code": "import os\nayar = {\"kuru\": False}\nortam = {\"KURU\": \"false\"}\nayar[\"kuru\"] = bool(ortam[\"KURU\"])\nprint(ayar[\"kuru\"], ortam[\"KURU\"].lower() in (\"1\", \"true\"))",
   "o": [
    "False False",
    "True False",
    "True True",
    "False True"
   ],
   "a": 1,
   "why": "Boş olmayan her metin bool ile True olur. Bu yüzden elle dönüştürülür."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>Yeniden deneme.</b> <code>bekleme_suresi(i, taban, ust, rastgele)</code>: <code>min(ust, taban * 2**i) * (0.5 + rastgele() / 2)</code>. <code>yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=..., rastgele=...)</code>: <code>TimeoutError</code>, <code>ConnectionError</code> ve <code>GECICI</code> kodlu <code>HttpHata</code> tekrarlanır; denemeler bitince son hata yükselir, son denemeden sonra beklenmez. <code>tekrar_sonra</code> varsa üst sınırla birlikte o beklenir. Başka her hata hemen yükselir.</p>",
   "start": "class HttpHata(Exception):\n    def __init__(self, kod, tekrar_sonra=None):\n        super().__init__(f\"HTTP {kod}\")\n        self.kod, self.tekrar_sonra = kod, tekrar_sonra\n\nGECICI = {408, 429, 500, 502, 503, 504}\n\ndef bekleme_suresi(i, taban, ust, rastgele):\n    pass\n\ndef yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=lambda s: None, rastgele=lambda: 1.0):\n    pass\n",
   "sol": "class HttpHata(Exception):\n    def __init__(self, kod, tekrar_sonra=None):\n        super().__init__(f\"HTTP {kod}\")\n        self.kod, self.tekrar_sonra = kod, tekrar_sonra\n\nGECICI = {408, 429, 500, 502, 503, 504}\n\ndef bekleme_suresi(i, taban, ust, rastgele):\n    return min(ust, taban * 2 ** i) * (0.5 + rastgele() / 2)\n\ndef yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=lambda s: None, rastgele=lambda: 1.0):\n    for i in range(deneme):\n        try:\n            return fn()\n        except (TimeoutError, ConnectionError):\n            if i == deneme - 1:\n                raise\n            bekle(bekleme_suresi(i, taban, ust, rastgele))\n        except HttpHata as e:\n            if e.kod not in GECICI or i == deneme - 1:\n                raise\n            if e.tekrar_sonra is not None:\n                bekle(min(e.tekrar_sonra, ust))\n            else:\n                bekle(bekleme_suresi(i, taban, ust, rastgele))\n",
   "tests": "def _F(*olay):\n    k = list(olay)\n    s = {\"n\": 0}\n    def f():\n        s[\"n\"] += 1\n        o = k.pop(0)\n        if isinstance(o, Exception):\n            raise o\n        return o\n    f.s = s\n    return f\n_b = []\n_f = _F(HttpHata(503), TimeoutError(), \"ok\")\nassert yeniden_dene(_f, bekle=_b.append) == \"ok\" and _f.s[\"n\"] == 3, \"Geçici hatalar tekrarlanır\"\nassert _b == [1.0, 2.0], \"Üstel bekleme: \" + repr(_b)\nfor _kod in [400, 401, 403, 404, 422]:\n    _f = _F(HttpHata(_kod), \"ok\")\n    try:\n        yeniden_dene(_f)\n        raise AssertionError(f\"{_kod} tekrarlanmamalı\")\n    except HttpHata:\n        pass\n    assert _f.s[\"n\"] == 1, f\"{_kod}: tek deneme\"\n_b = []\n_f = _F(HttpHata(429, tekrar_sonra=7), \"ok\")\nyeniden_dene(_f, bekle=_b.append)\nassert _b == [7], \"Retry-After üstel beklemenin yerine geçer: \" + repr(_b)\n_b = []\nyeniden_dene(_F(HttpHata(429, tekrar_sonra=900), \"ok\"), ust=60, bekle=_b.append)\nassert _b == [60], \"Sunucu saatlerce bekle derse üst sınır geçerli\"\n_b = []\nyeniden_dene(_F(TimeoutError(), TimeoutError(), TimeoutError(), \"ok\"), taban=10, ust=25, bekle=_b.append)\nassert _b == [10.0, 20.0, 25.0], \"Bekleme üst sınırı: \" + repr(_b)\n_b = []\nyeniden_dene(_F(TimeoutError(), \"ok\"), bekle=_b.append, rastgele=lambda: 0.0)\nassert _b == [0.5], \"Rastgele: aynı anda dönen işler yayılsın\"\n_b = []\n_f = _F(*[TimeoutError() for _ in range(9)])\ntry:\n    yeniden_dene(_f, deneme=3, bekle=_b.append)\n    raise AssertionError(\"Denemeler bitince son hata yükselmeli\")\nexcept TimeoutError:\n    pass\nassert _f.s[\"n\"] == 3 and len(_b) == 2, \"Üç deneme, iki bekleme\"\n_f = _F(ValueError(\"kötü veri\"), \"ok\")\ntry:\n    yeniden_dene(_f)\n    raise AssertionError(\"Programlama hatası tekrarlanmaz\")\nexcept ValueError:\n    pass\n",
   "hints": [
    "bekle ve rastgele dışarıdan gelir, test zaman harcamaz.",
    "Python'da sırayla except yaz."
   ],
   "why": "Her hatayı tekrarlamak kötü veriyi dört kez işler, sunucuyu da yorar."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-2",
   "stage": "Kendin yaz",
   "diff": 3,
   "q": "<p><b>Atomik yazma ve kilit.</b> <code>atomik_yaz(yol, metin)</code>: aynı klasörde geçici dosya, <code>os.replace</code>; hata olursa geçici dosya silinir, eski dosya bozulmaz. <code>Kilit(yol, saat, bayat=3600)</code>: bağlam yöneticisi. <code>O_CREAT | O_EXCL</code> ile oluşturup <code>{\"t\": saat()}</code> yazar. Kilit varsa ve taze ise <code>KilitDolu</code>; yaşı <code>bayat</code>ı aşmışsa siler, yeniden dener. Çıkışta, hata olsa da kaldırır.</p>",
   "start": "import json, os, tempfile\n\ndef atomik_yaz(yol, metin):\n    pass\n\nclass KilitDolu(Exception):\n    pass\n\nclass Kilit:\n    def __init__(self, yol, saat, bayat=3600):\n        self.yol, self.saat, self.bayat = yol, saat, bayat\n\n    def __enter__(self):\n        pass\n\n    def __exit__(self, *a):\n        pass\n",
   "sol": "import json, os, tempfile\n\ndef atomik_yaz(yol, metin):\n    klasor = os.path.dirname(os.path.abspath(yol))\n    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=\".tmp\")\n    try:\n        with os.fdopen(fd, \"w\", encoding=\"utf-8\") as f:\n            f.write(metin)\n            f.flush()\n            os.fsync(f.fileno())\n        os.replace(gecici, yol)\n    except BaseException:\n        os.unlink(gecici)\n        raise\n\nclass KilitDolu(Exception):\n    pass\n\nclass Kilit:\n    def __init__(self, yol, saat, bayat=3600):\n        self.yol, self.saat, self.bayat = yol, saat, bayat\n\n    def __enter__(self):\n        for _ in range(2):\n            try:\n                fd = os.open(self.yol, os.O_CREAT | os.O_EXCL | os.O_WRONLY)\n            except FileExistsError:\n                with open(self.yol, encoding=\"utf-8\") as f:\n                    t = json.load(f)[\"t\"]\n                if self.saat() - t <= self.bayat:\n                    raise KilitDolu(self.yol)\n                os.unlink(self.yol)\n                continue\n            with os.fdopen(fd, \"w\", encoding=\"utf-8\") as f:\n                json.dump({\"t\": self.saat()}, f)\n            return self\n        raise KilitDolu(self.yol)\n\n    def __exit__(self, *a):\n        os.unlink(self.yol)\n        return False\n",
   "tests": "import tempfile as _t, os as _o\n_d = _t.mkdtemp(); _y = _d + \"/durum.json\"\natomik_yaz(_y, \"bir\")\nassert open(_y, encoding=\"utf-8\").read() == \"bir\", \"Yazıldı\"\natomik_yaz(_y, \"iki\")\nassert open(_y, encoding=\"utf-8\").read() == \"iki\" and _o.listdir(_d) == [\"durum.json\"], \"Geçici dosya kalmaz: \" + repr(_o.listdir(_d))\n_es = _o.replace\n_sp = []\ndef _say(a, b):\n    _sp.append((a, b))\n    return _es(a, b)\n_o.replace = _say\natomik_yaz(_y, \"üç\")\n_o.replace = _es\nassert _sp and _sp[0][1] == _y and _o.path.dirname(_sp[0][0]) == _d, \"Geçici dosya aynı klasörde olup os.replace ile taşınmalı\"\nclass _Bozuk:\n    def __str__(self):\n        return \"x\"\ntry:\n    atomik_yaz(_y, _Bozuk())\n    raise AssertionError(\"Metin olmayan yazılamaz\")\nexcept TypeError:\n    pass\nassert open(_y, encoding=\"utf-8\").read() == \"üç\" and _o.listdir(_d) == [\"durum.json\"], \"Yarım kalan yazma eski dosyayı bozmaz, çöp bırakmaz\"\n_s = [100]; _k = _d + \"/is.kilit\"\nwith Kilit(_k, lambda: _s[0]):\n    assert _o.path.exists(_k), \"Kilit dosyası oluşur\"\n    try:\n        with Kilit(_k, lambda: _s[0]):\n            raise AssertionError(\"İkinci çalışma girememeli\")\n    except KilitDolu:\n        pass\n    assert _o.path.exists(_k), \"Reddedilen çalışma kilidi silmemeli\"\nassert not _o.path.exists(_k), \"Çıkışta kilit kalkar\"\ntry:\n    with Kilit(_k, lambda: _s[0]):\n        raise RuntimeError(\"iş patladı\")\nexcept RuntimeError:\n    pass\nassert not _o.path.exists(_k), \"Hata olsa da kilit kalkar\"\nwith open(_k, \"w\", encoding=\"utf-8\") as _f:\n    _f.write('{\"t\": 100}')\n_s[0] = 100 + 3601\nwith Kilit(_k, lambda: _s[0], bayat=3600):\n    assert _o.path.exists(_k), \"Bayat kilit devralınır (ölmüş süreçten kalmış)\"\nwith open(_k, \"w\", encoding=\"utf-8\") as _f:\n    _f.write('{\"t\": 100}')\n_s[0] = 100 + 3600\ntry:\n    with Kilit(_k, lambda: _s[0], bayat=3600):\n        raise AssertionError(\"Taze kilit devralınmaz\")\nexcept KilitDolu:\n    pass\n",
   "hints": [
    "tempfile.mkstemp(dir=klasor)",
    "os.open ile O_EXCL; FileExistsError yakala.",
    "__exit__ False döndürsün, hata yutulmasın."
   ],
   "why": "\"Önce var mı diye bak\" iki sürecin birden geçmesine izin verir. O_EXCL tek adımdır."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-3",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Katmanlı ayar.</b> <code>ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=())</code>. Sıra: varsayılan, TOML, <code>KESIT_</code> ile başlayan ortam değişkenleri (küçük harfe çevrilir, yalnız bilinen ayar ve <code>GIZLI</code> adlar), <code>None</code> olmayan <code>cli</code>. Ortam değeri varsayılanın türüne çevrilir: <code>bool</code> yalnız <code>1, true, 0, false</code>; geçersizse <code>ValueError</code>. TOML içinde gizli alan varsa değeri söylemeden <code>ValueError</code>. Zorunlu eksikse adını söyleyen <code>ValueError</code>. <code>goster(a)</code> gizlileri <code>***</code> yapar.</p>",
   "start": "import tomllib\n\nGIZLI = {\"api_anahtari\", \"smtp_parola\"}\n\ndef ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=()):\n    pass\n\ndef goster(a):\n    pass\n",
   "sol": "import tomllib\n\nGIZLI = {\"api_anahtari\", \"smtp_parola\"}\n\ndef ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=()):\n    d = tomllib.loads(toml_metni) if toml_metni else {}\n    yasak = sorted(GIZLI & set(d))\n    if yasak:\n        raise ValueError(\"gizli değer dosyada olamaz: \" + \", \".join(yasak))\n    a = {**varsayilan, **d}\n    for k, v in ortam.items():\n        if not k.startswith(\"KESIT_\"):\n            continue\n        ad = k[len(\"KESIT_\"):].lower()\n        if ad not in a and ad not in GIZLI:\n            continue\n        ornek = a.get(ad)\n        if isinstance(ornek, bool):\n            if v.lower() not in (\"1\", \"true\", \"0\", \"false\"):\n                raise ValueError(f\"{ad}: mantıksal değer bekleniyor\")\n            v = v.lower() in (\"1\", \"true\")\n        elif isinstance(ornek, int):\n            v = int(v)\n        elif isinstance(ornek, float):\n            v = float(v)\n        a[ad] = v\n    a.update({k: v for k, v in cli.items() if v is not None})\n    eksik = [k for k in zorunlu if a.get(k) in (None, \"\")]\n    if eksik:\n        raise ValueError(\"eksik ayar: \" + \", \".join(eksik))\n    return a\n\ndef goster(a):\n    return {k: (\"***\" if k in GIZLI and a[k] else v) for k, v in a.items()}\n",
   "tests": "_V = {\"klasor\": \"gelen\", \"deneme\": 3, \"kuru\": False, \"oran\": 0.5}\n_a = ayar_yukle(_V, 'klasor = \"dosya\"\\ndeneme = 5\\n', {\"KESIT_DENEME\": \"7\", \"PATH\": \"/bin\"}, {\"deneme\": None, \"kuru\": True})\nassert _a[\"klasor\"] == \"dosya\" and _a[\"deneme\"] == 7 and _a[\"kuru\"] is True and _a[\"oran\"] == 0.5, \"Sıra: varsayılan < dosya < ortam < komut satırı: \" + repr(_a)\nassert \"path\" not in _a, \"İlgisiz ortam değişkeni ayara girmez\"\nassert ayar_yukle(_V, 'deneme = 5', {\"KESIT_DENEME\": \"7\"}, {\"deneme\": 9})[\"deneme\"] == 9, \"Komut satırı en üstte\"\nassert ayar_yukle(_V, 'deneme = 5', {}, {})[\"deneme\"] == 5, \"Dosya varsayılanı ezer\"\nassert ayar_yukle(_V, '', {\"KESIT_KURU\": \"false\"}, {})[\"kuru\"] is False, \"'false' metni False olmalı\"\nassert ayar_yukle(_V, '', {\"KESIT_KURU\": \"1\"}, {})[\"kuru\"] is True, \"1 True\"\nassert ayar_yukle(_V, '', {\"KESIT_ORAN\": \"0.25\"}, {})[\"oran\"] == 0.25, \"Ondalık dönüşümü\"\n_b = ayar_yukle(_V, '', {\"KESIT_DENEME\": \"4\"}, {})[\"deneme\"]\nassert _b == 4 and isinstance(_b, int), \"Ortam metni sayıya dönmeli\"\nfor _bad in [\"abc\"]:\n    try:\n        ayar_yukle(_V, '', {\"KESIT_DENEME\": _bad}, {})\n        raise AssertionError(\"Geçersiz sayı hata vermeli\")\n    except ValueError:\n        pass\ntry:\n    ayar_yukle(_V, '', {\"KESIT_KURU\": \"evet\"}, {})\n    raise AssertionError(\"Geçersiz mantıksal hata vermeli\")\nexcept ValueError:\n    pass\ntry:\n    ayar_yukle(_V, 'api_anahtari = \"abc123\"', {}, {})\n    raise AssertionError(\"Dosyada gizli değer reddedilmeli\")\nexcept ValueError as _e:\n    assert \"abc123\" not in str(_e), \"Hata mesajı gizli değeri taşımamalı\"\n_g = ayar_yukle(_V, '', {\"KESIT_API_ANAHTARI\": \"gizli-1\"}, {}, zorunlu=[\"api_anahtari\"])\nassert _g[\"api_anahtari\"] == \"gizli-1\", \"Gizli değer ortamdan gelir\"\nassert goster(_g)[\"api_anahtari\"] == \"***\" and goster(_g)[\"deneme\"] == 3 and \"gizli-1\" not in str(goster(_g)), \"Gösterimde maskelenir\"\ntry:\n    ayar_yukle(_V, '', {}, {}, zorunlu=[\"api_anahtari\"])\n    raise AssertionError(\"Zorunlu ayar eksikse hata\")\nexcept ValueError as _e:\n    assert \"api_anahtari\" in str(_e), \"Hangi ayar eksik söylenmeli\"\n",
   "hints": [
    "tomllib.loads",
    "isinstance(ornek, bool) int'ten önce gelmeli."
   ],
   "why": "bool(\"false\") True verir: ortam değişkeninin en bilinen tuzağı."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-4",
   "stage": "Hata avı",
   "diff": 2,
   "q": "<p><b>Maskeli JSON günlük.</b> <code>gunluk_kur(ad, akis, kosu)</code> <code>logging</code> kaydedicisi döndürür: <code>INFO</code> seviye, üst kaydediciye geçmez, ikinci kurulum çift yazmaz. <code>JsonBicim</code> satıra <code>kosu, seviye, mesaj</code> ve hata varsa <code>hata</code> (tür adı) yazar. <code>Maskele</code> filtresi biçimlenmiş mesajda <code>token, parola, password, api_key, authorization</code> sonrası <code>=</code> ya da <code>:</code> ile gelen değeri <code>***</code> yapar (<code>Bearer</code> dahil). Yalnız \"token\" kelimesi maskelenmez.</p>",
   "start": "import json, logging, re\n\nclass Maskele(logging.Filter):\n    def filter(self, kayit):\n        pass\n\nclass JsonBicim(logging.Formatter):\n    def __init__(self, kosu):\n        super().__init__()\n        self.kosu = kosu\n\n    def format(self, kayit):\n        pass\n\ndef gunluk_kur(ad, akis, kosu):\n    pass\n",
   "sol": "import json, logging, re\n\nGIZLI_DESEN = re.compile(r\"(?i)\\b(token|parola|password|api[_-]?key|authorization)(\\s*[=:]\\s*)(bearer\\s+)?\\S+\")\n\nclass Maskele(logging.Filter):\n    def filter(self, kayit):\n        kayit.msg = GIZLI_DESEN.sub(lambda m: m.group(1) + m.group(2) + \"***\", kayit.getMessage())\n        kayit.args = ()\n        return True\n\nclass JsonBicim(logging.Formatter):\n    def __init__(self, kosu):\n        super().__init__()\n        self.kosu = kosu\n\n    def format(self, kayit):\n        d = {\"kosu\": self.kosu, \"seviye\": kayit.levelname, \"mesaj\": kayit.getMessage()}\n        if kayit.exc_info:\n            d[\"hata\"] = kayit.exc_info[0].__name__\n        return json.dumps(d, ensure_ascii=False)\n\ndef gunluk_kur(ad, akis, kosu):\n    g = logging.getLogger(ad)\n    g.handlers.clear()\n    g.setLevel(logging.INFO)\n    g.propagate = False\n    h = logging.StreamHandler(akis)\n    h.setFormatter(JsonBicim(kosu))\n    h.addFilter(Maskele())\n    g.addHandler(h)\n    return g\n",
   "tests": "import io, json as _j\n_a = io.StringIO()\n_g = gunluk_kur(\"t1\", _a, \"k-7\")\n_g.info(\"başladı %d dosya\", 3)\n_g.warning(\"istek token=abc123 ile gitti\")\n_g.info(\"Authorization: Bearer xyz.789 başlığı\")\n_g.info(\"parola: %s\", \"gizli9\")\n_g.debug(\"görünmez\")\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    _g.exception(\"bölme\")\n_s = [_j.loads(x) for x in _a.getvalue().splitlines()]\nassert len(_s) == 5, \"Her kayıt tek JSON satırı, DEBUG yok: \" + repr(_a.getvalue())\nassert _s[0] == {\"kosu\": \"k-7\", \"seviye\": \"INFO\", \"mesaj\": \"başladı 3 dosya\"}, repr(_s[0])\n_m = _a.getvalue()\nfor _x in [\"abc123\", \"xyz.789\", \"gizli9\"]:\n    assert _x not in _m, \"Gizli değer günlükte: \" + _x\nassert \"token=***\" in _s[1][\"mesaj\"], \"Maske: \" + _s[1][\"mesaj\"]\nassert _s[1][\"seviye\"] == \"WARNING\", \"Seviye\"\nassert \"başlığı\" in _s[2][\"mesaj\"], \"Gizli olmayan kısım kalır\"\nassert _s[4][\"hata\"] == \"ZeroDivisionError\", \"Hata türü kayıtta\"\n_g2 = gunluk_kur(\"t1\", _a, \"k-8\")\n_n = len(_a.getvalue().splitlines())\n_g2.info(\"tek\")\nassert len(_a.getvalue().splitlines()) == _n + 1, \"İkinci kurulum çift yazmamalı\"\n_g.info(\"metin token gizli değil\")\nassert \"token gizli değil\" in _a.getvalue(), \"'token' kelimesi tek başına maskelenmez\"\n",
   "hints": [
    "kayit.getMessage() biçimlenmiş metni verir, sonra kayit.args = ().",
    "g.handlers.clear() ve g.propagate = False."
   ],
   "why": "Gizli değer %s argümanı olarak da gelir. Ham kalıba bakan filtre bunu kaçırır."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-5",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Kibar istemci.</b> <code>KibarIstemci(ajan, robots, getir, saat, bekle, aralik=2.0)</code>: <code>robots</code> alan adından <code>robots.txt</code> metnine sözlük. <code>al(adres)</code>: önbellekteyse hemen döner. robots.txt bilinmiyorsa ya da yasaklıyorsa <code>None</code>, istek gitmez. Aynı alan adında son istekten beri <code>max(aralik, Crawl-delay)</code> geçmediyse kalan süre beklenir. <code>getir(adres, {\"User-Agent\": ajan})</code>.</p>",
   "start": "from urllib.robotparser import RobotFileParser\nfrom urllib.parse import urlsplit\n\nclass KibarIstemci:\n    def __init__(self, ajan, robots, getir, saat, bekle, aralik=2.0):\n        pass\n\n    def al(self, adres):\n        pass  # sayfa metni; izin yoksa None\n",
   "sol": "from urllib.robotparser import RobotFileParser\nfrom urllib.parse import urlsplit\n\nclass KibarIstemci:\n    def __init__(self, ajan, robots, getir, saat, bekle, aralik=2.0):\n        self.ajan, self.getir, self.saat, self.bekle = ajan, getir, saat, bekle\n        self.aralik, self.son, self.onbellek = aralik, {}, {}\n        self.kurallar = {}\n        for alan, metin in robots.items():\n            r = RobotFileParser()\n            r.parse(metin.splitlines())\n            self.kurallar[alan] = r\n\n    def al(self, adres):\n        if adres in self.onbellek:\n            return self.onbellek[adres]\n        alan = urlsplit(adres).netloc\n        r = self.kurallar.get(alan)\n        if r is None or not r.can_fetch(self.ajan, adres):\n            return None\n        gecikme = max(self.aralik, r.crawl_delay(self.ajan) or 0)\n        if alan in self.son:\n            kalan = self.son[alan] + gecikme - self.saat()\n            if kalan > 0:\n                self.bekle(kalan)\n        sonuc = self.getir(adres, {\"User-Agent\": self.ajan})\n        self.son[alan] = self.saat()\n        self.onbellek[adres] = sonuc\n        return sonuc\n",
   "tests": "_R = {\"a.test\": \"User-agent: *\\nDisallow: /ozel/\\nCrawl-delay: 5\\n\", \"b.test\": \"User-agent: *\\nAllow: /\\n\", \"c.test\": \"User-agent: kesit\\nDisallow: /\\n\\nUser-agent: *\\nAllow: /\\n\"}\n_t = [0.0]; _bek = []; _ist = []\ndef _ge(u, h):\n    _ist.append((u, h[\"User-Agent\"]))\n    return \"içerik:\" + u\ndef _be(s):\n    _bek.append(s)\n    _t[0] += s\n_k = KibarIstemci(\"kesit\", _R, _ge, lambda: _t[0], _be, aralik=2.0)\nassert _k.al(\"https://a.test/liste\") == \"içerik:https://a.test/liste\", \"İzinli sayfa\"\nassert _ist[0][1] == \"kesit\", \"Kimliğini söyle: User-Agent\"\nassert _k.al(\"https://a.test/ozel/x\") is None and len(_ist) == 1, \"robots.txt yasağına uyulur, istek gitmez\"\nassert _k.al(\"https://c.test/x\") is None, \"Bu ajana özel yasak\"\nassert _k.al(\"https://yok.test/\") is None, \"robots.txt bilinmiyorsa gitme\"\n_k.al(\"https://a.test/iki\")\nassert _bek == [5.0], \"Crawl-delay daha uzunsa o beklenir: \" + repr(_bek)\nassert _k.al(\"https://b.test/1\") and _bek == [5.0], \"Başka site beklemez\"\n_k.al(\"https://b.test/2\")\nassert _bek == [5.0, 2.0], \"En az aralık: \" + repr(_bek)\n_n = len(_ist)\n_k.al(\"https://b.test/2\")\nassert len(_ist) == _n and _bek == [5.0, 2.0], \"Aynı adres önbellekten, istek ve bekleme yok\"\n_t[0] += 100\n_k.al(\"https://b.test/3\")\nassert _bek == [5.0, 2.0], \"Yeterince zaman geçtiyse bekleme yok\"\n",
   "hints": [
    "RobotFileParser().parse(metin.splitlines())",
    "r.can_fetch ve r.crawl_delay",
    "urlsplit(adres).netloc"
   ],
   "why": "Bilinmeyen robots.txt için izinli saymak en sık yapılan kolaycılıktır. Burada güvenli taraf seçildi."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-6",
   "stage": "Hata avı",
   "diff": 2,
   "q": "<p><b>Karantina.</b> <code>parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4)</code>. İstisna veren kayıt <code>{\"kayit\", \"hata\", \"mesaj\"}</code> olarak ekleme kipinde yazılır, iş sürer. En az <code>en_az</code> kayıt işlenmişken hata oranı <code>hata_orani</code>nı aşarsa durur. Dönüş: <code>{\"basarili\", \"hatali\", \"islenmeyen\", \"cikis\"}</code>, çıkış 0 temiz, 1 kısmi, 2 durdu.</p>",
   "start": "import json\n\ndef parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4):\n    # {\"basarili\", \"hatali\", \"islenmeyen\", \"cikis\"}: 0 temiz, 1 bazı kayıtlar hatalı, 2 durduruldu\n    pass\n",
   "sol": "import json\n\ndef parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4):\n    ok, bad, durdu = 0, 0, False\n    for i, k in enumerate(kayitlar):\n        try:\n            isle(k)\n            ok += 1\n        except Exception as e:\n            bad += 1\n            with open(karantina_yolu, \"a\", encoding=\"utf-8\") as f:\n                f.write(json.dumps({\"kayit\": k, \"hata\": type(e).__name__, \"mesaj\": str(e)}, ensure_ascii=False) + \"\\n\")\n            if ok + bad >= en_az and bad / (ok + bad) > hata_orani:\n                durdu = True\n                break\n    kod = 2 if durdu else (1 if bad else 0)\n    return {\"basarili\": ok, \"hatali\": bad, \"islenmeyen\": len(kayitlar) - ok - bad, \"cikis\": kod}\n",
   "tests": "import tempfile, os, json as _j\n_d = tempfile.mkdtemp(); _y = _d + \"/k.jsonl\"\n_c = []\ndef _is(k):\n    if k < 0:\n        raise ValueError(\"negatif tutar\")\n    _c.append(k)\nassert parti_isle([1, 2, 3], _is, _y) == {\"basarili\": 3, \"hatali\": 0, \"islenmeyen\": 0, \"cikis\": 0}, \"Temiz parti\"\nassert not os.path.exists(_y) or not open(_y).read(), \"Hatasız partide karantina boş\"\n_c.clear()\n_r = parti_isle([1, -2, 3, 4, 5], _is, _y)\nassert _r == {\"basarili\": 4, \"hatali\": 1, \"islenmeyen\": 0, \"cikis\": 1} and _c == [1, 3, 4, 5], \"Tek kötü kayıt işi durdurmaz: \" + repr(_r)\n_s = [_j.loads(x) for x in open(_y, encoding=\"utf-8\").read().splitlines()]\nassert _s == [{\"kayit\": -2, \"hata\": \"ValueError\", \"mesaj\": \"negatif tutar\"}], \"Karantina kaydı: \" + repr(_s)\n_c.clear()\n_r = parti_isle([-1, -2, -3, -4, 5, 6, 7, 8], _is, _d + \"/k2.jsonl\")\nassert _r[\"cikis\"] == 2 and _r[\"hatali\"] == 4 and _r[\"islenmeyen\"] == 4 and _c == [], \"Hata oranı aşınca durur: kaynak bozuk olabilir: \" + repr(_r)\n_c.clear()\n_r = parti_isle([-1, 2, 3, 4], _is, _d + \"/k3.jsonl\")\nassert _r[\"cikis\"] == 1, \"İlk kayıt kötü diye hemen durma: en az sayı var: \" + repr(_r)\n_r = parti_isle([-1, -2, -3, 4], _is, _d + \"/k4.jsonl\", en_az=10)\nassert _r[\"cikis\"] == 1 and _r[\"islenmeyen\"] == 0, \"en_az dolmadan durmaz\"\nparti_isle([-9], _is, _y)\nassert len(open(_y, encoding=\"utf-8\").read().splitlines()) == 2, \"Karantina önceki kayıtları korur\"\n",
   "hints": [
    "Oranı her hatada hesapla.",
    "type(e).__name__"
   ],
   "why": "Tek bozuk satır işi durdurmaz; bozuk kaynak da sona kadar işlenmez."
  },
  {
   "t": "code",
   "id": "otomasyon-isletim-7",
   "stage": "Kendin yaz",
   "diff": 1,
   "q": "<p><b>Kaçan iş günleri.</b> <code>kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31)</code>: <code>son_basarili</code>dan sonraki günden <code>bugun</code>e kadar (dahil) hafta içi ve tatil olmayan günlerin listesi. <code>en_cok</code>tan fazlaysa <code>ValueError</code>.</p>",
   "start": "from datetime import date, timedelta\n\ndef kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31):\n    pass\n",
   "sol": "from datetime import date, timedelta\n\ndef kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31):\n    tatiller = set(tatiller)\n    g = son_basarili + timedelta(days=1)\n    cikti = []\n    while g <= bugun:\n        if g.weekday() < 5 and g not in tatiller:\n            cikti.append(g)\n        g += timedelta(days=1)\n    if len(cikti) > en_cok:\n        raise ValueError(f\"{len(cikti)} gün kaçmış, elle bakılmalı\")\n    return cikti\n",
   "tests": "_D = date\nassert kacan_gunler(_D(2026, 11, 3), _D(2026, 11, 3)) == [], \"Bugün çalıştıysa kaçan yok\"\nassert kacan_gunler(_D(2026, 11, 2), _D(2026, 11, 3)) == [_D(2026, 11, 3)], \"Dünkü başarılı, bugün çalışır\"\n_r = kacan_gunler(_D(2026, 11, 5), _D(2026, 11, 10))\nassert _r == [_D(2026, 11, 6), _D(2026, 11, 9), _D(2026, 11, 10)], \"Hafta sonu atlanır: \" + repr(_r)\n_r = kacan_gunler(_D(2026, 11, 5), _D(2026, 11, 10), tatiller=[_D(2026, 11, 9)])\nassert _r == [_D(2026, 11, 6), _D(2026, 11, 10)], \"Tatil atlanır\"\n_r = kacan_gunler(_D(2026, 10, 30), _D(2026, 11, 2))\nassert _r == [_D(2026, 11, 2)], \"Ay geçişi\"\nassert kacan_gunler(_D(2026, 11, 7), _D(2026, 11, 8)) == [], \"Yalnız hafta sonu\"\nassert kacan_gunler(_D(2026, 11, 10), _D(2026, 11, 3)) == [], \"Saat geride olsa da boş\"\ntry:\n    kacan_gunler(_D(2020, 1, 1), _D(2026, 11, 3))\n    raise AssertionError(\"Çok fazla gün kaçtıysa kendi kendine çalışma\")\nexcept ValueError:\n    pass\nassert len(kacan_gunler(_D(2020, 1, 1), _D(2026, 11, 3), en_cok=9999)) > 1000, \"Sınır ayarlanabilir\"\n",
   "hints": [
    "weekday() &lt; 5 hafta içidir.",
    "timedelta(days=1) ile ilerle."
   ],
   "why": "Dört gün kapalı kalan bilgisayarda yalnız bugünü çalıştırmak üç raporu kaybeder."
  },
  {
   "t": "local",
   "id": "otomasyon-isletim-y1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>İşi paketle, sına, zamanlayıcıya ver. Paketleme ve testler burada çalıştırıldı: <code>pip install -e .</code>, <code>kesit-rapor</code> komutu ve üç pytest testi geçti. cron ve Görev Zamanlayıcı satırları burada çalıştırılmadı.</p>",
   "steps": [
    "Boş klasörde sanal ortam aç. Aşağıdaki kodu <code>kesit_rapor.py</code> olarak kaydet.",
    "<code>pyproject.toml</code> dosyası:<pre class=\"code\">[build-system]\nrequires = [\"setuptools>=68\"]\nbuild-backend = \"setuptools.build_meta\"\n\n[project]\nname = \"kesit-rapor\"\nversion = \"0.1.0\"\nrequires-python = \">=3.11\"\n\n[project.scripts]\nkesit-rapor = \"kesit_rapor:ana\"\n\n[tool.setuptools]\npy-modules = [\"kesit_rapor\"]\n</pre>",
    "<code>test_kesit_rapor.py</code> dosyası:<pre class=\"code\">import json\nfrom kesit_rapor import ana, calis\n\ndef test_ilk_calisma_rapor_yazar(tmp_path):\n    assert calis(tmp_path, \"2026-11-03\") == {\"durum\": \"yazildi\"}\n    assert json.loads((tmp_path / \"2026-11-03.json\").read_text(\"utf-8\"))[\"gun\"] == \"2026-11-03\"\n\ndef test_ikinci_calisma_atlar(tmp_path):\n    calis(tmp_path, \"2026-11-03\")\n    assert calis(tmp_path, \"2026-11-03\") == {\"durum\": \"atlandi\"}\n\ndef test_cikis_kodu(tmp_path, capsys):\n    assert ana([\"--klasor\", str(tmp_path), \"--gun\", \"2026-11-03\"]) == 0\n    assert \"yazildi\" in capsys.readouterr().out\n    assert ana([\"--klasor\", str(tmp_path / \"yok\"), \"--gun\", \"bozuk\"]) == 2\n</pre>",
    "<code>python -m pip install -e . pytest</code>, sonra <code>python -m pytest -q</code> ve <code>kesit-rapor --gun 2026-11-03</code>. İkinci çalıştırmada <code>atlandi</code> yazar. <code>echo $?</code> çıkış kodunu gösterir.",
    "Linux ve macOS cron: <code>30 7 * * 1-5 cd /yol && .venv/bin/kesit-rapor &gt;&gt; is.log 2&gt;&amp;1</code>.",
    "Windows: <code>schtasks /Create /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 07:30 /TN KesitRapor /TR \"C:\\yol\\.venv\\Scripts\\kesit-rapor.exe\"</code>.",
    "Zamanlayıcı ortam değişkenlerini kabuktan almaz: gerekli ayarları açıkça ver."
   ],
   "file": "\"\"\"kesit_rapor.py: paketlenebilir küçük bir iş. Zamanlayıcı yalnız çıkış koduna bakar.\"\"\"\nimport argparse, json, logging, os, sys, tempfile\nfrom datetime import date\nfrom pathlib import Path\n\nlog = logging.getLogger(\"kesit_rapor\")\n\ndef calis(klasor, gun):\n    date.fromisoformat(gun)\n    y = Path(klasor) / f\"{gun}.json\"\n    if y.exists():\n        return {\"durum\": \"atlandi\"}\n    Path(klasor).mkdir(parents=True, exist_ok=True)\n    fd, g = tempfile.mkstemp(dir=klasor)\n    with os.fdopen(fd, \"w\", encoding=\"utf-8\") as f:\n        json.dump({\"gun\": gun}, f)\n    os.replace(g, y)\n    return {\"durum\": \"yazildi\"}\n\ndef ana(argv=None):\n    ap = argparse.ArgumentParser(prog=\"kesit-rapor\")\n    ap.add_argument(\"--klasor\", default=os.environ.get(\"KESIT_KLASOR\", \"raporlar\"))\n    ap.add_argument(\"--gun\", default=date.today().isoformat())\n    a = ap.parse_args(argv)\n    logging.basicConfig(level=logging.INFO, stream=sys.stderr)\n    try:\n        s = calis(a.klasor, a.gun)\n    except ValueError as e:\n        log.error(\"geçersiz girdi: %s\", e)\n        return 2\n    print(s[\"durum\"])\n    return 0\n\nif __name__ == \"__main__\":\n    sys.exit(ana())\n",
   "fname": "kesit_rapor.py",
   "cmd": "python -m pytest -q && kesit-rapor --gun 2026-11-03",
   "expect": "3 passed\nyazildi"
  }
 ],
 "faq": [
  {
   "q": "Bunların hepsi küçük bir betik için fazla değil mi?",
   "a": "Elle başlatıp başında durduğun betik için fazla. Zamanlanmış ve parayla, müşteriyle ilgili işler için değil. Önce atomik yazma ve idempotent tasarımı ekle, gerisini ihtiyaç olunca."
  },
  {
   "q": "tenacity gibi hazır kütüphane kullanayım mı?",
   "a": "Kullanabilirsin, olgun bir araçtır. Burada amaç neyi tekrarlaman gerektiğini anlamak; o kararı yine sen verirsin."
  },
  {
   "q": "Web verisi çekmek yasal mı?",
   "a": "Tek cevabı yok: siteye, verinin türüne, kullanım amacına ve ülkeye bağlıdır. Bu ders hukuki danışmanlık değildir. Kişisel veri ya da ticari kullanım varsa hukuk birimine sor."
  }
 ],
 "mistakes": [
  {
   "bad": "if not os.path.exists(kilit):\n    open(kilit, \"w\")",
   "good": "os.open(kilit, os.O_CREAT | os.O_EXCL | os.O_WRONLY)",
   "why": "Bakmak ve oluşturmak ayrı adımsa iki süreç de geçer."
  },
  {
   "bad": "except Exception:\n    time.sleep(5)\n    continue",
   "good": "except (TimeoutError, ConnectionError):",
   "why": "Programlama hatasını sonsuza dek tekrarlar."
  },
  {
   "bad": "log.info(\"giriş \" + parola)",
   "good": "log.info(\"giriş denendi: %s\", kullanici)",
   "why": "Filtre yardımcıdır, gizli değeri günlüğe hiç vermemek esastır."
  }
 ]
}));
})(window);
