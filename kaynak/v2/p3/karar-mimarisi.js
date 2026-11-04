/* Kesit Python: Karar odaklı yapay zekâ mimarisi. uretec/p3 üretir, elle düzenleme. */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(Object.assign({ id: 'karar-mimarisi', lv: 'ileri' }, {
 "mod": "Yapay Zekâ",
 "min": 65,
 "needs": [
  "ajan-uretimde",
  "pydantic-dogrulama"
 ],
 "title": "Karar odaklı yapay zekâ mimarisi",
 "sum": "Modeli serbest metin yazan değil, denetlenebilir karar üreten bir bileşen olarak kurarsın: karar şeması, kurallarla birlikte çalışma, güven eşiği, insana yükseltme, denetim izi, geri alınabilirlik, karar kalitesi ölçümü.",
 "goals": [
  "Modelin çıktısını doğrulanan bir karar şemasına bağlayabilirim.",
  "Kuralın kesin olduğu yerde modeli devre dışı bırakabilirim.",
  "Güven eşiğini maliyete göre seçebilir, kalibrasyonu sınayabilirim.",
  "Geri alınamaz eylemi insana yönlendirebilirim.",
  "Sonradan değiştirilince fark edilen bir denetim izi yazabilirim.",
  "Karar kalitesini doğru paydalarla ölçebilirim."
 ],
 "body": "<div class=\"note\"><b>Bu başlık hakkında dürüst bir not</b>\"Karar odaklı yapay zekâ mimarisi\" yerleşik bir standart ya da tek tanımı olan bir terim <b>değildir</b>. Benzer ifadeleri (\"decision-centric architecture\", \"decision intelligence\") danışmanlık ve ürün yazılarında farklı anlamlarla görürsün; bilinen bir standart kurumu tanımı bulamadık. Bu derste ifadeyi şöyle <b>yorumluyoruz</b>: <b>modelin serbest metin değil, kararı ürettiği, kararın da kurallar ve insanla birlikte denetlendiği yapı</b>. Parçaların her biri (şemalı çıktı, kural motoru, insan onayı, denetim izi) yerleşik uygulamalardır; bir araya getiriş bizim önerimizdir. Mülakatta bu adı duyarsan önce ne kastedildiğini sor.</div>\n<h2>Neden serbest metin yetmez?</h2>\n<p>İade, kredi ön değerlendirme, destek önceliği gibi işlerde sonuç bir cümle değil, bir <b>karardır</b>: kim, neye, ne kadar, neden. Serbest metin ne kodla işlenir ne de ölçülür.</p>\n<pre class=\"py\"># Aynı iade talebi, iki çıktı biçimi. Hangisini kod işleyebilir, hangisi denetlenebilir?\nserbest = \"Müşteri haklı görünüyor, sanırım iade edilebilir ama tutar biraz yüksek.\"\nkarar = {\"karar\": \"yukselt\", \"tutar\": 0, \"guven\": 0.55, \"gerekce\": [\"BILGI_EKSIK\"], \"kanit\": [\"fotoğraf yok\"]}\n\nprint(\"serbest metinde 'iade' var mı:\", \"iade\" in serbest)  # peki onay mı, ret mi?\nprint(\"karar türü:\", karar[\"karar\"], \"| güven:\", karar[\"guven\"])\nprint(\"insana gitmeli mi:\", karar[\"karar\"] == \"yukselt\" or karar[\"guven\"] &lt; 0.8)</pre>\n<p>Bu derste de model yok: görevlerdeki model yerine sabit bir işlev ya da sahte öneri kullanıyoruz. Amaç modelin kararını değil, kararın etrafındaki yapıyı sınamak.</p>\n<h2>Altı parça</h2>\n<div class=\"tbl-wrap\"><table><tr><th>Parça</th><th>Soru</th><th>Yoksa ne olur</th></tr>\n<tr><td><b>Karar şeması</b></td><td>Çıktı hangi alanlardan oluşur?</td><td>Metni kim yorumlayacak belli olmaz</td></tr>\n<tr><td><b>Kural ve model</b></td><td>Kim neye karar verir?</td><td>Model politikayı çiğner</td></tr>\n<tr><td><b>Güven eşiği</b></td><td>Ne zaman otomatik?</td><td>Ya her şey otomatik ya her şey insanda</td></tr>\n<tr><td><b>Yükseltme</b></td><td>İnsan ne görür?</td><td>İnsan önüne bağlamsız iş düşer</td></tr>\n<tr><td><b>Denetim izi</b></td><td>Altı ay sonra neden sorulursa?</td><td>Karar savunulamaz</td></tr>\n<tr><td><b>Geri alınabilirlik</b></td><td>Yanlışsa dönüş var mı?</td><td>Küçük hata büyük zarar olur</td></tr></table></div>\n<h2>Karar şeması</h2>\n<p>Modelden doğrudan bu şemaya uyan JSON iste, sağlayıcının yapılandırılmış çıktı özelliği varsa kullan, ama <b>sonucu yine kendin doğrula</b>. Gerekçe serbest metin değil, kapalı bir kod listesi olsun: sayılabilir, kümelenebilir. Kanıt alanı zorunlu olsun. Alanlar arası kuralları da yaz: ret kararında tutar sıfır olmalı. Doğrulamadan geçemeyen çıktı insana gider, sessizce düzeltilmez.</p>\n<h2>Kural önce, model gri alanda</h2>\n<p>Politikanın kesin olduğu yerde model çağırmak hem para kaybıdır hem risktir. Süre dolduysa cevap bellidir. Sıra şöyledir: kesin kurallar, sonra model, sonra modelin sonucunu sınırlayan kurallar. Model \"onayla\" dese bile <b>istenenden fazla tutar veremez</b>. Kuralları sürüm numarasıyla sakla; karar hangi sürümle verildi, izde görünür.</p>\n<h2>Güven eşiği</h2>\n<p>İki yanılgı var. Birincisi modelin söylediği güvene olduğu gibi inanmak: dil modellerinin kendi bildirdiği güven genellikle kalibre değildir, 0,9 dediği işlerde doğruluk 0,9 çıkmayabilir. Bu yüzden önce etiketli veriyle <b>kalibrasyon tablosu</b> çıkarırsın. İkincisi eşiği \"yüksek olsun\" diye seçmek. Eşik bir iş kararıdır: yanlış otomatik karar ne kadara mal oluyor, insan incelemesi ne kadara? Bu iki rakamla eşik hesaplanır. Yanlışın bedeli büyükse eşik yükselir, insan pahalıysa düşer.</p>\n<h2>Yükseltme ve geri alınabilirlik</h2>\n<p>Eylemleri geri alınabilirliğe göre ayır. Kupon tanımlamak geri alınır, para göndermek alınmaz. Geri alınamaz eylem güven kaç olursa olsun insan onayı ister. Geri alma \"silmek\" değil <b>telafi eylemidir</b>, tek kez çalışır, süresi olabilir ve o da izde görünür. Yükseltmede insan modelin önerisini, kanıtı ve kuralın sonucunu görür; yalnız önerinin kopyasını onaylayan insan ise gerçek bir denetim sayılmaz, bu yüzden değiştirme oranını da ölçersin.</p>\n<h2>Denetim izi</h2>\n<p>Her karar için girdi özeti, kural ve model sürümü, eşik, sonuç ve kararı veren yazılır. Her kayıt öncekinin özetini içerirse sonradan değişiklik zincirde görünür. Zincirin sınırı da var: <b>sondan silinen kayıt zincirle anlaşılmaz</b>, son özeti başka bir yerde saklamak gerekir. Dosya yazma izni olan biri zinciri baştan da üretebilir; gerçek sistemde kayıt yetkisi ayrı tutulur. Kişisel veriyi ize açık yazma: özet ya da numara yeter.</p>\n<h2>Karar kalitesi</h2>\n<div class=\"tbl-wrap\"><table><tr><th>Ölçü</th><th>Payda</th><th>Tuzak</th></tr>\n<tr><td>Otomatik oran</td><td>Tüm kararlar</td><td>Tek başına hedef olursa kalite düşer</td></tr>\n<tr><td>Otomatik doğruluk</td><td>Sonucu bilinen <b>otomatik</b> kararlar</td><td>İnsan kararları ve etiketsizler karışmasın</td></tr>\n<tr><td>Etiket oranı</td><td>Otomatik kararlar</td><td>Düşükse doğruluk rakamı zayıf kanıttır</td></tr>\n<tr><td>İnsanın değiştirme oranı</td><td>Model önerisi olan yükseltmeler</td><td>Sıfıra yakınsa insan körlemesine onaylıyor olabilir</td></tr>\n<tr><td>Grup kırılımı</td><td>Şehir, kanal, müşteri tipi</td><td>Ortalama, bir grubun kötü sonucunu gizler</td></tr></table></div>\n<p>Etiketler geç gelir: iadenin doğru olup olmadığı haftalar sonra anlaşılır. Bilinmeyeni yanlış saymak da doğru saymak da hatadır, \"bilinmiyor\" olarak bırak.</p>",
 "ex": [
  {
   "t": "mc",
   "id": "karar-mimarisi-m1",
   "stage": "Isınma",
   "q": "\"Karar odaklı yapay zekâ mimarisi\" için hangisi doğru?",
   "o": [
    "ISO tarafından tanımlanmış bir standarttır",
    "Yerleşik tek tanımı olmayan bir ifadedir",
    "Yalnız bir bulut sağlayıcısının ürün adıdır",
    "MCP protokolünün başka bir adıdır"
   ],
   "a": 1,
   "why": "Bu ders ifadeyi kendi yorumuyla kullanıyor ve bunu açıkça söylüyor."
  },
  {
   "t": "mc",
   "id": "karar-mimarisi-m2",
   "stage": "Isınma",
   "q": "İade süresi dolmuş bir talep için model \"onayla, güven 0,99\" diyor. Doğru sonuç?",
   "o": [
    "Güven yüksek, onaylanır",
    "Kural reddeder",
    "İnsana sorulur",
    "Model tekrar çağrılır"
   ],
   "a": 1,
   "why": "Kesin kural modelden önce gelir. Bu durumda model hiç çağrılmamalıydı."
  },
  {
   "t": "mc",
   "id": "karar-mimarisi-m3",
   "stage": "Isınma",
   "q": "Yanlış otomatik karar 100 TL, insan incelemesi 5 TL. Eşik nasıl seçilir?",
   "o": [
    "Toplam maliyeti en az yapan değer",
    "Her iş için sabit 0,95 değeri alınarak",
    "Modele kendi eşiği sorularak belirlenir",
    "En çok kararı otomatik yapan değer seçilir"
   ],
   "a": 0,
   "why": "Eşik bir maliyet hesabıdır. Sabit \"güvenli\" rakam, veriye ve bedele bakmaz."
  },
  {
   "t": "mc",
   "id": "karar-mimarisi-m4",
   "stage": "Isınma",
   "q": "Otomatik doğruluk hesabında sonucu henüz bilinmeyen kararlar ne yapılır?",
   "o": [
    "Yanlış sayılır",
    "Doğru sayılır",
    "Paydaya girmez",
    "Rastgele etiketlenir"
   ],
   "a": 2,
   "why": "Bilinmeyeni sayıya katmak raporu iki yönde de bozar. Etiket oranı rakamın ne kadar güvenilir olduğunu söyler."
  },
  {
   "t": "predict",
   "id": "karar-mimarisi-t1",
   "stage": "Kodu oku",
   "q": "Toplam maliyeti ne yazdırır?",
   "code": "v = [(0.9, True), (0.8, False), (0.5, True)]\nesik, yanlis, insan = 0.7, 100, 5\nm = 0\nfor g, d in v:\n    m += (0 if d else yanlis) if g >= esik else insan\nprint(m)",
   "o": [
    "100",
    "105",
    "110",
    "5"
   ],
   "a": 1,
   "why": "0,9 doğru: 0. 0,8 yanlış: 100. 0,5 eşik altı: insan 5. Toplam 105."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>Karar şeması.</b> Pydantic ile <code>Karar</code>: <code>karar</code> (<code>onayla, reddet, yukselt</code>), <code>tutar</code> (0 ve üstü), <code>guven</code> (0 ile 1), <code>gerekce</code> (en az bir kod: <code>GEC_TESLIM, HASAR, SURE_ASIMI, BILGI_EKSIK</code>), <code>kanit</code> (en az bir metin). Fazla alan yasak. Onay dışında tutar 0, onayda 0 olamaz. <code>coz(metin)</code>: <code>(Karar, None)</code> ya da <code>(None, hata listesi)</code>. Serbest metin de hata listesi verir.</p>",
   "start": "from typing import Literal\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator\n\nclass Karar(BaseModel):\n    pass\n\ndef coz(metin):\n    # (Karar, None) ya da (None, hata listesi)\n    pass\n",
   "sol": "from typing import Literal\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator\n\nclass Karar(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    karar: Literal[\"onayla\", \"reddet\", \"yukselt\"]\n    tutar: float = Field(ge=0)\n    guven: float = Field(ge=0, le=1)\n    gerekce: list[Literal[\"GEC_TESLIM\", \"HASAR\", \"SURE_ASIMI\", \"BILGI_EKSIK\"]] = Field(min_length=1)\n    kanit: list[str] = Field(min_length=1)\n\n    @model_validator(mode=\"after\")\n    def tutar_tutarli(self):\n        if self.karar != \"onayla\" and self.tutar != 0:\n            raise ValueError(\"onay dışında tutar 0 olmalı\")\n        if self.karar == \"onayla\" and self.tutar == 0:\n            raise ValueError(\"onayda tutar 0 olamaz\")\n        return self\n\ndef coz(metin):\n    try:\n        return Karar.model_validate_json(metin), None\n    except ValidationError as e:\n        return None, [str(h[\"loc\"]) + \": \" + h[\"msg\"] for h in e.errors()]\n",
   "tests": "import json as _j\n_D = {\"karar\": \"onayla\", \"tutar\": 450.0, \"guven\": 0.9, \"gerekce\": [\"GEC_TESLIM\"], \"kanit\": [\"teslim 72 dk\"]}\n_k, _h = coz(_j.dumps(_D))\nassert _h is None and _k.karar == \"onayla\" and _k.tutar == 450, \"Geçerli karar: \" + repr(_h)\nfor _n, _d in [(\"serbest metin\", \"Bence onaylayalım, müşteri haklı.\"), (\"bilinmeyen karar\", {**_D, \"karar\": \"belki\"}), (\"güven 1 üstü\", {**_D, \"guven\": 1.2}),\n               (\"negatif tutar\", {**_D, \"tutar\": -1}), (\"bilinmeyen gerekçe\", {**_D, \"gerekce\": [\"HISSETTIM\"]}), (\"boş gerekçe\", {**_D, \"gerekce\": []}),\n               (\"kanıt yok\", {**_D, \"kanit\": []}), (\"fazla alan\", {**_D, \"not\": \"x\"}), (\"eksik alan\", {\"karar\": \"onayla\"}),\n               (\"ret ve tutar\", {**_D, \"karar\": \"reddet\"}), (\"onay ve sıfır\", {**_D, \"tutar\": 0})]:\n    _m = _d if isinstance(_d, str) else _j.dumps(_d)\n    _k, _h = coz(_m)\n    assert _k is None and _h, \"Reddedilmeli: \" + _n\n_k, _h = coz(_j.dumps({**_D, \"karar\": \"yukselt\", \"tutar\": 0}))\nassert _h is None, \"Yükseltme tutarı 0\"\n",
   "hints": [
    "Karar.model_validate_json(metin) hem JSON hem şema denetler.",
    "ConfigDict(extra=\"forbid\")",
    "@model_validator(mode=\"after\") alanlar arası denetim için."
   ],
   "why": "Çıktı şemaya girince kod işleyebilir, kapalı gerekçe kodları da sayılabilir."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Kural ve model.</b> <code>kural_karari(t)</code>: teslim değilse <code>reddet TESLIM_DEGIL</code>; <code>gun</code> süreyi aşarsa <code>reddet SURE_ASIMI</code>; <code>istenen &gt; odenen</code> ise <code>yukselt TUTAR_ASIMI</code>; <code>istenen</code> küçük tutar ve altındaysa <code>onayla KUCUK_TUTAR</code>; yoksa <code>None</code>. <code>karar_ver(t, model)</code>: kural kesinse modeli çağırma, <code>{\"karar\", \"kod\", \"kaynak\": \"kural\", \"tutar\"}</code>. Model <code>None</code> dönerse <code>yukselt MODEL_GECERSIZ</code>. Model istenenden çok tutar verirse <code>yukselt MODEL_TUTAR_ASIMI</code>. Yoksa <code>kaynak: \"model\"</code>, <code>kod</code> ilk gerekçe, <code>guven</code> ile.</p>",
   "start": "POLITIKA = {\"sure_gun\": 14, \"kucuk_tutar\": 50, \"surum\": \"2026-11\"}\n\ndef kural_karari(t, p=POLITIKA):\n    pass  # kesin karar ya da None\n\ndef karar_ver(t, model):\n    pass\n",
   "sol": "POLITIKA = {\"sure_gun\": 14, \"kucuk_tutar\": 50, \"surum\": \"2026-11\"}\n\ndef kural_karari(t, p=POLITIKA):\n    if t[\"durum\"] != \"teslim\":\n        return {\"karar\": \"reddet\", \"kod\": \"TESLIM_DEGIL\"}\n    if t[\"gun\"] > p[\"sure_gun\"]:\n        return {\"karar\": \"reddet\", \"kod\": \"SURE_ASIMI\"}\n    if t[\"istenen\"] > t[\"odenen\"]:\n        return {\"karar\": \"yukselt\", \"kod\": \"TUTAR_ASIMI\"}\n    if t[\"istenen\"] <= p[\"kucuk_tutar\"]:\n        return {\"karar\": \"onayla\", \"kod\": \"KUCUK_TUTAR\"}\n    return None\n\ndef karar_ver(t, model):\n    k = kural_karari(t)\n    if k:\n        return {**k, \"kaynak\": \"kural\", \"tutar\": t[\"istenen\"] if k[\"karar\"] == \"onayla\" else 0}\n    o = model(t)\n    if o is None:\n        return {\"karar\": \"yukselt\", \"kod\": \"MODEL_GECERSIZ\", \"kaynak\": \"kural\", \"tutar\": 0}\n    tutar = o[\"tutar\"] if o[\"karar\"] == \"onayla\" else 0\n    if tutar > t[\"istenen\"]:\n        return {\"karar\": \"yukselt\", \"kod\": \"MODEL_TUTAR_ASIMI\", \"kaynak\": \"kural\", \"tutar\": 0}\n    return {\"karar\": o[\"karar\"], \"kod\": o[\"gerekce\"][0], \"kaynak\": \"model\", \"tutar\": tutar, \"guven\": o[\"guven\"]}\n",
   "tests": "_T = lambda **k: {\"durum\": \"teslim\", \"gun\": 3, \"odenen\": 500, \"istenen\": 200, **k}\n_C = []\ndef _m(ka=\"onayla\", tu=200, gu=0.9):\n    def f(t):\n        _C.append(t)\n        return {\"karar\": ka, \"tutar\": tu, \"guven\": gu, \"gerekce\": [\"HASAR\"]}\n    return f\n_r = karar_ver(_T(durum=\"iptal\"), _m())\nassert _r[\"karar\"] == \"reddet\" and _r[\"kaynak\"] == \"kural\" and _r[\"tutar\"] == 0 and _C == [], \"Kural kesinse model çağrılmaz: \" + repr(_r)\n_r = karar_ver(_T(gun=15), _m())\nassert _r[\"karar\"] == \"reddet\" and _r[\"kod\"] == \"SURE_ASIMI\" and _C == [], \"Model onaylasa da süre aşımı reddedilir\"\nassert karar_ver(_T(gun=14), _m())[\"kaynak\"] == \"model\", \"14. gün sınırı içindedir\"\n_C.clear()\n_r = karar_ver(_T(istenen=900), _m(tu=900))\nassert _r[\"karar\"] == \"yukselt\" and _r[\"kod\"] == \"TUTAR_ASIMI\" and _C == [], \"Ödenenden fazla istek insana gider\"\n_r = karar_ver(_T(istenen=50), _m())\nassert _r[\"karar\"] == \"onayla\" and _r[\"kaynak\"] == \"kural\" and _r[\"tutar\"] == 50 and _C == [], \"Küçük tutar kuralla onay\"\n_r = karar_ver(_T(), _m())\nassert _r == {\"karar\": \"onayla\", \"kod\": \"HASAR\", \"kaynak\": \"model\", \"tutar\": 200, \"guven\": 0.9}, \"Gri alan modelin: \" + repr(_r)\n_r = karar_ver(_T(), _m(tu=450))\nassert _r[\"karar\"] == \"yukselt\" and _r[\"kaynak\"] == \"kural\", \"Model istenenden çok veremez\"\n_r = karar_ver(_T(), lambda t: None)\nassert _r[\"karar\"] == \"yukselt\" and _r[\"kod\"] == \"MODEL_GECERSIZ\", \"Model çıktısı geçersizse insana\"\n_r = karar_ver(_T(), _m(\"reddet\", 0))\nassert _r[\"karar\"] == \"reddet\" and _r[\"tutar\"] == 0, \"Model reddi\"\n",
   "hints": [
    "Modeli yalnız kural None dönünce çağır.",
    "Tutar onayda istenen, diğerlerinde 0."
   ],
   "why": "Modeli çağırmadan verilen karar hem ucuzdur hem savunulur."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-3",
   "stage": "Meydan okuma",
   "diff": 3,
   "q": "<p><b>Eşik hesabı.</b> Vaka: <code>{\"guven\", \"dogru\"}</code>. <code>toplam_maliyet(vakalar, esik, yanlis, insan)</code>: eşik ve üstü otomatik (yanlışsa <code>yanlis</code>), altı <code>insan</code>. <code>esik_sec</code> en az maliyetli <code>(esik, maliyet)</code> döndürür; \"hepsini insana ver\" de bir seçenektir. <code>kalibrasyon(vakalar, kova=5)</code>: dolu kovalar için <code>{\"alt\", \"adet\", \"guven\", \"dogruluk\", \"fark\"}</code>, üçü de 3 basamak yuvarlanır, güven 1.0 son kovaya düşer.</p>",
   "start": "def toplam_maliyet(vakalar, esik, yanlis, insan):\n    pass\n\ndef esik_sec(vakalar, yanlis, insan):\n    pass  # (eşik, maliyet)\n\ndef kalibrasyon(vakalar, kova=5):\n    pass\n",
   "sol": "def toplam_maliyet(vakalar, esik, yanlis, insan):\n    m = 0\n    for v in vakalar:\n        if v[\"guven\"] >= esik:\n            m += 0 if v[\"dogru\"] else yanlis\n        else:\n            m += insan\n    return m\n\ndef esik_sec(vakalar, yanlis, insan):\n    adaylar = sorted({v[\"guven\"] for v in vakalar} | {1.01})\n    enIyi, enAz = None, None\n    for e in adaylar:\n        m = toplam_maliyet(vakalar, e, yanlis, insan)\n        if enAz is None or m <= enAz:\n            enIyi, enAz = e, m\n    return enIyi, enAz\n\ndef kalibrasyon(vakalar, kova=5):\n    d = {}\n    for v in vakalar:\n        i = min(int(v[\"guven\"] * kova), kova - 1)\n        d.setdefault(i, []).append(v)\n    out = []\n    for i in sorted(d):\n        L = d[i]\n        ort = sum(x[\"guven\"] for x in L) / len(L)\n        dog = sum(1 for x in L if x[\"dogru\"]) / len(L)\n        out.append({\"alt\": i / kova, \"adet\": len(L), \"guven\": round(ort, 3), \"dogruluk\": round(dog, 3), \"fark\": round(ort - dog, 3)})\n    return out\n",
   "tests": "_V = [{\"guven\": g, \"dogru\": d} for g, d in [(0.95, True), (0.93, True), (0.9, False), (0.85, True), (0.8, True), (0.7, False), (0.65, True), (0.6, False), (0.4, False), (0.3, False)]]\nassert toplam_maliyet(_V, 0.9, 100, 5) == 100 + 7 * 5, \"Maliyet: \" + repr(toplam_maliyet(_V, 0.9, 100, 5))\nassert toplam_maliyet(_V, 0.0, 10, 5) == 50, \"Hepsi otomatik\"\nassert toplam_maliyet(_V, 2.0, 10, 5) == 50, \"Hepsi insan\"\ndef _kaba(y, i):\n    return min(toplam_maliyet(_V, e / 100, y, i) for e in range(0, 102))\nfor _y, _i in [(100, 5), (10, 5), (1000, 1), (2, 5), (30, 30)]:\n    _e, _m = esik_sec(_V, _y, _i)\n    assert _m == _kaba(_y, _i), f\"yanlis={_y} insan={_i}: en düşük maliyet {_kaba(_y, _i)}, senin {_m}\"\n    assert toplam_maliyet(_V, _e, _y, _i) == _m, \"Dönen eşik o maliyeti vermeli\"\n_e, _ = esik_sec(_V, 1000, 1)\nassert _e > 0.9, \"Yanlış çok pahalıysa eşik yanlış vakanın üstüne çıkar: \" + repr(_e)\n_e2, _ = esik_sec(_V, 100, 5)\n_e3, _ = esik_sec(_V, 2, 5)\nassert _e3 < _e2, \"İnsan pahalılaşınca eşik düşmeli\"\n_e4, _ = esik_sec(_V, 30, 30)\nassert esik_sec([{\"guven\": 0.9, \"dogru\": False}, {\"guven\": 0.8, \"dogru\": False}], 10, 1)[1] == 2, \"Model hep yanlışsa en ucuzu hepsini insana vermek\"\n_k = kalibrasyon(_V, 5)\nassert [x[\"alt\"] for x in _k] == [0.2, 0.4, 0.6, 0.8], \"Kovalar: \" + repr(_k)\nassert _k[3] == {\"alt\": 0.8, \"adet\": 5, \"guven\": 0.886, \"dogruluk\": 0.8, \"fark\": 0.086}, repr(_k[3])\nassert kalibrasyon([{\"guven\": 1.0, \"dogru\": True}], 5)[0][\"alt\"] == 0.8, \"Güven 1.0 son kovaya düşer\"\n",
   "hints": [
    "Aday eşikler vakalardaki güven değerleri ve 1'in üstünde bir değer.",
    "min(int(g * kova), kova - 1)"
   ],
   "why": "Eşiği maliyet belirler. En yüksek doğruluğu veren eşik çoğu zaman en ucuz olan değildir."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-4",
   "stage": "Kendin yaz",
   "diff": 3,
   "q": "<p><b>Zincirli denetim izi.</b> <code>ekle(yol, kayit)</code>: <code>ZORUNLU</code> alan eksikse <code>ValueError</code>, yazmaz. Satır: <code>{\"kayit\", \"onceki\", \"ozet\"}</code>; <code>ozet</code>, önceki özet ve kaydın sıralı JSON'unun SHA-256'sıdır. <code>son_ozet(yol)</code>: yoksa boş metin. <code>dogrula(yol, beklenen_son=None)</code>: <code>(True, None)</code>; bozuk ilk satırda <code>(False, satır_no)</code>; son özet tutmazsa <code>(False, \"son\")</code>.</p>",
   "start": "import hashlib, json\n\nZORUNLU = (\"girdi_ozeti\", \"kural_surumu\", \"model_surumu\", \"esik\", \"karar\", \"yapan\")\n\ndef ekle(yol, kayit):\n    pass\n\ndef son_ozet(yol):\n    pass\n\ndef dogrula(yol, beklenen_son=None):\n    pass  # (True, None) ya da (False, satır no ya da \"son\")\n",
   "sol": "import hashlib, json\n\nZORUNLU = (\"girdi_ozeti\", \"kural_surumu\", \"model_surumu\", \"esik\", \"karar\", \"yapan\")\n\ndef _ozet(onceki, kayit):\n    return hashlib.sha256((onceki + json.dumps(kayit, sort_keys=True, ensure_ascii=False)).encode()).hexdigest()\n\ndef son_ozet(yol):\n    try:\n        with open(yol, encoding=\"utf-8\") as f:\n            satirlar = f.read().splitlines()\n    except FileNotFoundError:\n        return \"\"\n    return json.loads(satirlar[-1])[\"ozet\"] if satirlar else \"\"\n\ndef ekle(yol, kayit):\n    eksik = [k for k in ZORUNLU if k not in kayit]\n    if eksik:\n        raise ValueError(\"eksik alan: \" + \", \".join(eksik))\n    onceki = son_ozet(yol)\n    with open(yol, \"a\", encoding=\"utf-8\") as f:\n        f.write(json.dumps({\"kayit\": kayit, \"onceki\": onceki, \"ozet\": _ozet(onceki, kayit)}, ensure_ascii=False) + \"\\n\")\n\ndef dogrula(yol, beklenen_son=None):\n    onceki = \"\"\n    with open(yol, encoding=\"utf-8\") as f:\n        for i, s in enumerate(f.read().splitlines(), 1):\n            d = json.loads(s)\n            if d[\"onceki\"] != onceki or d[\"ozet\"] != _ozet(onceki, d[\"kayit\"]):\n                return False, i\n            onceki = d[\"ozet\"]\n    if beklenen_son is not None and onceki != beklenen_son:\n        return False, \"son\"\n    return True, None\n",
   "tests": "import os, tempfile, json as _j\n_y = os.path.join(tempfile.mkdtemp(), \"iz.jsonl\")\n_K = lambda n, k=\"onayla\": {\"girdi_ozeti\": \"a\" + str(n), \"kural_surumu\": \"2026-11\", \"model_surumu\": \"sahte-1\", \"esik\": 0.8, \"karar\": k, \"yapan\": \"sistem\"}\nassert son_ozet(_y) == \"\", \"Dosya yoksa boş\"\nfor _i in range(1, 5):\n    ekle(_y, _K(_i))\nassert dogrula(_y) == (True, None), \"Sağlam zincir: \" + repr(dogrula(_y))\ntry:\n    ekle(_y, {\"karar\": \"x\"})\n    raise AssertionError(\"Eksik alan reddedilmeli\")\nexcept ValueError:\n    pass\nassert len(open(_y, encoding=\"utf-8\").read().splitlines()) == 4, \"Eksik kayıt yazılmamalı\"\n_s = open(_y, encoding=\"utf-8\").read().splitlines()\n_son = son_ozet(_y)\nassert dogrula(_y, _son) == (True, None), \"Doğru bağ\"\ndef _dene(sat):\n    open(_y, \"w\", encoding=\"utf-8\").write(\"\\n\".join(sat) + \"\\n\")\n    return dogrula(_y)\n_d = _j.loads(_s[1]); _d[\"kayit\"][\"karar\"] = \"reddet\"\nassert _dene([_s[0], _j.dumps(_d, ensure_ascii=False), _s[2], _s[3]]) == (False, 2), \"Değişen kayıt 2. satırda yakalanmalı\"\nassert _dene([_s[0], _s[2], _s[3]]) == (False, 2), \"Silinen satır yakalanmalı\"\nassert _dene([_s[1], _s[0], _s[2], _s[3]]) == (False, 1), \"Sıra değişimi yakalanmalı\"\n_h = _j.loads(_s[1]); _h[\"kayit\"][\"karar\"] = \"reddet\"; _h[\"ozet\"] = \"sahte\"\nassert _dene([_s[0], _j.dumps(_h, ensure_ascii=False), _s[2], _s[3]])[0] is False, \"Sahte özet\"\n_dene(_s[:3])\nassert dogrula(_y)[0] is True, \"Sondan silme zincirle anlaşılmaz\"\nassert dogrula(_y, _son) == (False, \"son\"), \"Dışarıda saklanan son özet sondan silmeyi yakalar\"\n",
   "hints": [
    "Doğrulamada önceki özeti kendin taşı, satırdakine güvenme.",
    "sort_keys=True"
   ],
   "why": "Her satır öncekine bağlı olduğu için ortadaki değişiklik zinciri kırar. Sondan silme için dışarıda bir özet gerekir."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-5",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Geri alınabilirlik.</b> <code>Uygulayici</code>: <code>geri_alinabilir(ad)</code> telafi işlevi var mı söyler. <code>uygula(ad, girdi, onaylayan=None)</code>: geri alınamaz eylem onaysızsa <code>PermissionError</code>; eylemi çalıştırır, numara döndürür. <code>geri_al(no)</code>: telafiyi sonucu vererek çalıştırır, <code>True</code> döner; ikinci kez <code>False</code> ve etkisiz; süre dolmuş ya da eylem geri alınamaz ise <code>ValueError</code>.</p>",
   "start": "class Uygulayici:\n    def __init__(self, saat):\n        self.saat, self.eylemler, self.kayit = saat, {}, {}\n\n    def tanimla(self, ad, yap, geri=None, pencere=None):\n        self.eylemler[ad] = {\"yap\": yap, \"geri\": geri, \"pencere\": pencere}\n\n    def geri_alinabilir(self, ad):\n        pass\n\n    def uygula(self, ad, girdi, onaylayan=None):\n        pass  # eylem numarası\n\n    def geri_al(self, no):\n        pass  # True; zaten geri alındıysa False\n",
   "sol": "class Uygulayici:\n    def __init__(self, saat):\n        self.saat, self.eylemler, self.kayit = saat, {}, {}\n\n    def tanimla(self, ad, yap, geri=None, pencere=None):\n        self.eylemler[ad] = {\"yap\": yap, \"geri\": geri, \"pencere\": pencere}\n\n    def geri_alinabilir(self, ad):\n        return self.eylemler[ad][\"geri\"] is not None\n\n    def uygula(self, ad, girdi, onaylayan=None):\n        e = self.eylemler[ad]\n        if e[\"geri\"] is None and onaylayan is None:\n            raise PermissionError(\"geri alınamaz eylem insan onayı ister\")\n        no = len(self.kayit) + 1\n        s = e[\"yap\"](**girdi)\n        self.kayit[no] = {\"ad\": ad, \"girdi\": girdi, \"sonuc\": s, \"t\": self.saat(), \"geri_alindi\": False}\n        return no\n\n    def geri_al(self, no):\n        k = self.kayit[no]\n        e = self.eylemler[k[\"ad\"]]\n        if e[\"geri\"] is None:\n            raise ValueError(\"bu eylem geri alınamaz\")\n        if k[\"geri_alindi\"]:\n            return False\n        if e[\"pencere\"] is not None and self.saat() - k[\"t\"] > e[\"pencere\"]:\n            raise ValueError(\"geri alma süresi doldu\")\n        e[\"geri\"](k[\"sonuc\"])\n        k[\"geri_alindi\"] = True\n        return True\n",
   "tests": "_t = [0]; _bak = {\"c\": 100}; _gon = []\n_U = Uygulayici(lambda: _t[0])\ndef _yuk(t):\n    _bak[\"c\"] += t\n    return t\n_U.tanimla(\"kupon\", _yuk, lambda s: _bak.__setitem__(\"c\", _bak[\"c\"] - s), pencere=60)\n_U.tanimla(\"havale\", lambda t: _gon.append(t))\nassert _U.geri_alinabilir(\"kupon\") is True and _U.geri_alinabilir(\"havale\") is False, \"Geri alınabilirlik\"\n_n = _U.uygula(\"kupon\", {\"t\": 30})\nassert _bak[\"c\"] == 130, \"Uygulandı\"\nassert _U.geri_al(_n) is True and _bak[\"c\"] == 100, \"Telafi eylemi çalışmalı\"\nassert _U.geri_al(_n) is False and _bak[\"c\"] == 100, \"İkinci geri alma bakiyeyi bozmamalı\"\n_n = _U.uygula(\"kupon\", {\"t\": 5}); _t[0] = 61\ntry:\n    _U.geri_al(_n)\n    raise AssertionError(\"Süresi dolan eylem geri alınmamalı\")\nexcept ValueError:\n    pass\nassert _bak[\"c\"] == 105, \"Süre dolunca bakiye aynı kalır\"\ntry:\n    _U.uygula(\"havale\", {\"t\": 9})\n    raise AssertionError(\"Geri alınamaz eylem onaysız çalışmamalı\")\nexcept PermissionError:\n    pass\nassert _gon == [], \"Havale gitmemeli\"\n_h = _U.uygula(\"havale\", {\"t\": 9}, onaylayan=\"ayse\")\nassert _gon == [9], \"Onayla çalışır\"\ntry:\n    _U.geri_al(_h)\n    raise AssertionError(\"Havale geri alınamaz\")\nexcept ValueError:\n    pass\n",
   "hints": [
    "Kayda t, sonuc ve geri_alindi yaz.",
    "Pencere None ise süre sınırı yok."
   ],
   "why": "Geri alma da yan etkidir. İki kez çalışırsa bakiye bozulur."
  },
  {
   "t": "code",
   "id": "karar-mimarisi-6",
   "stage": "Hata avı",
   "diff": 2,
   "q": "<p><b>Doğru paydalar.</b> Kayıt: <code>{\"yapan\", \"karar\", \"gercek\", \"model_onerisi\", \"grup\", \"maliyet\"}</code>. <code>kalite(kayitlar)</code>: <code>otomatik_oran, yukseltme_orani, etiket_orani</code> (otomatiklerin kaçında gerçek biliniyor), <code>otomatik_dogruluk</code> (etiketli otomatiklerden; yoksa <code>None</code>), <code>insan_degistirme</code> (model önerisi olan yükseltmelerde önerisi değişenlerin payı; yoksa <code>None</code>), <code>grup_dogruluk</code>, <code>maliyet</code> toplamı.</p>",
   "start": "def kalite(kayitlar):\n    pass\n",
   "sol": "def kalite(kayitlar):\n    n = len(kayitlar)\n    oto = [k for k in kayitlar if k[\"yapan\"] == \"sistem\"]\n    yuk = [k for k in kayitlar if k[\"yapan\"] == \"insan\"]\n    etiketli = [k for k in oto if k.get(\"gercek\") is not None]\n    dogru = [k for k in etiketli if k[\"gercek\"] == k[\"karar\"]]\n    onerili = [k for k in yuk if k.get(\"model_onerisi\") is not None]\n    degisen = [k for k in onerili if k[\"model_onerisi\"] != k[\"karar\"]]\n    gruplar = {}\n    for k in etiketli:\n        gruplar.setdefault(k[\"grup\"], []).append(k[\"gercek\"] == k[\"karar\"])\n    return {\"otomatik_oran\": len(oto) / n, \"yukseltme_orani\": len(yuk) / n,\n            \"etiket_orani\": len(etiketli) / len(oto) if oto else 0,\n            \"otomatik_dogruluk\": len(dogru) / len(etiketli) if etiketli else None,\n            \"insan_degistirme\": len(degisen) / len(onerili) if onerili else None,\n            \"grup_dogruluk\": {g: sum(v) / len(v) for g, v in sorted(gruplar.items())},\n            \"maliyet\": sum(k.get(\"maliyet\", 0) for k in kayitlar)}\n",
   "tests": "_R = lambda y, k, g=None, o=None, gr=\"A\", m=0: {\"yapan\": y, \"karar\": k, \"gercek\": g, \"model_onerisi\": o, \"grup\": gr, \"maliyet\": m}\n_K = [_R(\"sistem\", \"onayla\", \"onayla\", m=1), _R(\"sistem\", \"onayla\", \"reddet\", gr=\"B\", m=1), _R(\"sistem\", \"reddet\", \"reddet\", gr=\"B\"), _R(\"sistem\", \"onayla\", None),\n      _R(\"insan\", \"onayla\", \"onayla\", \"onayla\", m=20), _R(\"insan\", \"reddet\", \"reddet\", \"onayla\", m=20), _R(\"insan\", \"onayla\", None, None, m=20), _R(\"sistem\", \"reddet\", None)]\n_s = kalite(_K)\nassert _s[\"otomatik_oran\"] == 5 / 8, \"Otomatik oran: \" + repr(_s[\"otomatik_oran\"])\nassert _s[\"yukseltme_orani\"] == 3 / 8, \"Yükseltme oranı\"\nassert _s[\"etiket_orani\"] == 3 / 5, \"Etiket oranı: otomatik kararların ne kadarında sonuç biliniyor\"\nassert abs(_s[\"otomatik_dogruluk\"] - 2 / 3) < 1e-9, \"Doğruluk yalnız etiketli otomatik kararlardan: \" + repr(_s[\"otomatik_dogruluk\"])\nassert _s[\"insan_degistirme\"] == 1 / 2, \"Modelin önerisini insan kaç kez değiştirdi: \" + repr(_s[\"insan_degistirme\"])\nassert _s[\"grup_dogruluk\"] == {\"A\": 1.0, \"B\": 0.5}, \"Grup: \" + repr(_s[\"grup_dogruluk\"])\nassert _s[\"maliyet\"] == 62, \"Maliyet\"\n_b = kalite([_R(\"insan\", \"onayla\", None)])\nassert _b[\"otomatik_dogruluk\"] is None and _b[\"otomatik_oran\"] == 0, \"Hiç otomatik karar yoksa doğruluk bilinmez, 0 değil\"\n",
   "hints": [
    "yapan sistem ya da insan.",
    "gercek None ise etiket yok."
   ],
   "why": "Yanlış payda iyi görünen ama yanlış bir rakam verir. Bilinmeyen 0 değildir."
  }
 ],
 "faq": [
  {
   "q": "Her yapay zekâ işi böyle mi kurulmalı?",
   "a": "Hayır. Özetleme ya da taslak üretme gibi işlerde son kararı zaten insan verir, bu yapı fazladır. Bu mimari, çıktısı doğrudan eylem başlatan ve sonradan hesabı sorulacak işler içindir."
  },
  {
   "q": "Model kendi güvenini söyleyebiliyor mu?",
   "a": "Söyler, ama bu rakam olasılık gibi davranmayabilir. Etiketli veriyle kalibrasyon tablosu çıkar; tutmuyorsa rakama değil tabloya güven."
  },
  {
   "q": "Kural mı model mi, nasıl ayırırım?",
   "a": "Politikada yazılı, tek cevabı olan her şey kuraldır. Yorum isteyen kısım, örneğin şikâyet metninin ne anlattığı, modele kalır."
  }
 ],
 "mistakes": [
  {
   "bad": "if \"onay\" in cevap: uygula()",
   "good": "k, hata = coz(cevap)\nif k and k.karar == \"onayla\": uygula()",
   "why": "Metin içinde \"onaylanamaz\" da geçer. Karar şemadan okunur."
  },
  {
   "bad": "esik = 0.95  # güvenli olsun",
   "good": "esik, _ = esik_sec(etiketli, yanlis=100, insan=5)",
   "why": "Eşik, yanlışın ve insanın bedeline bağlıdır."
  },
  {
   "bad": "dogruluk = dogru / len(tum_kararlar)",
   "good": "dogruluk = dogru / len(etiketli_otomatik)",
   "why": "Payda yanlışsa rakam bir şey söylemez."
  }
 ]
}));
})(window);
