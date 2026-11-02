(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'api-web', lv: 'ileri', mod: 'Mimari', min: 42,
    title: 'API ve web: HTTP, requests/httpx, FastAPI ve doğrulama',
    sum: 'HTTP\'nin temelleri, requests/httpx kullanım kalıpları, FastAPI ile uç nokta yazma, JSON doğrulama, hata kodları, yeniden deneme ve zaman aşımı; tarayıcıda sahte istemci ve fonksiyon tabanlı yönlendiriciyle çalıştır.',
    goals: ['HTTP yöntemleri, durum kodları ve başlıkları doğru yorumlayabilirim', 'requests/httpx ile oturum, zaman aşımı ve hata yönetimi kalıplarını uygulayabilirim', 'FastAPI uç noktasının yapısını ve pydantic doğrulamasının mantığını açıklayabilirim', 'Dış API yanıtını şemaya göre doğrulayıp tutarlı hata kodları üretebilirim', 'Üstel geri çekilme ile yeniden deneme ve idempotency mantığını kurabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Kurumsal Python kodunun büyük bölümü bir ağ sınırında durur: Anadolu Market\'in sipariş servisi kargo firmasının API\'sine istek atar, Ilgaz Bank\'ın kredi modülü skor servisinden yanıt bekler. Bu sınırda her şey ters gidebilir: zaman aşımı, 503, bozuk JSON, beklenmeyen alan. Bu derste HTTP\'yi, istemci kütüphanelerini ve bir API yazmanın iskeletini öğreneceksin. Tarayıcıda ağ erişimi olmadığı için örnekler <b>sahte istemci</b> (fake client) ile çalışır; gerçek <code>requests</code>/<code>httpx</code>/FastAPI kodu gösterim olarak verilir. Sahte istemci yaklaşımı aynı zamanda ekiplerin birim testte kullandığı yöntemdir, boşa gitmez.</p>

<h2>HTTP temelleri</h2>
<p>Bir HTTP isteği: yöntem (GET, POST, PUT, PATCH, DELETE), yol (<code>/siparisler/42</code>), başlıklar (<code>Authorization</code>, <code>Content-Type</code>) ve gövde (genelde JSON). Yanıt: durum kodu, başlıklar, gövde. GET ve DELETE idempotent (tekrarlanınca aynı sonuç), POST değildir; bu yüzden POST\'u körlemesine yeniden denemek çift sipariş yaratabilir.</p>
<div class="tbl-wrap"><table><tr><th>Kod</th><th>Anlamı</th><th>İstemci ne yapmalı</th></tr><tr><td>200 / 201</td><td>Başarılı / oluşturuldu</td><td>Gövdeyi işle</td></tr><tr><td>204</td><td>Başarılı, gövde yok</td><td>JSON parse etmeye çalışma</td></tr><tr><td>400 / 422</td><td>Hatalı istek / doğrulama hatası</td><td>Yeniden deneme; girdiyi düzelt</td></tr><tr><td>401 / 403</td><td>Kimlik yok / yetki yok</td><td>Token yenile ya da dur</td></tr><tr><td>404</td><td>Kaynak yok</td><td>İş kuralına göre karar</td></tr><tr><td>429</td><td>Çok fazla istek</td><td>Retry-After kadar bekle</td></tr><tr><td>500 / 502 / 503</td><td>Sunucu hatası</td><td>Üstel geri çekilmeyle yeniden dene</td></tr></table></div>

<h2>requests ve httpx kalıpları</h2>
<p>İki kütüphane de benzer arayüz sunar; <code>httpx</code> async ve HTTP/2 destekler. Üç kural: her isteğe <b>zaman aşımı</b> ver (varsayılan sonsuzdur), <b>oturum</b> (Session/Client) kullan (bağlantı tekrar kullanımı, ortak başlık), <code>raise_for_status()</code> ile 4xx/5xx\'i istisnaya çevir.</p>
<pre class="py"># Gösterim: gerçek projede böyle yazılır (burada çalışmaz)
GOSTERIM = '''
import httpx

with httpx.Client(base_url="https://api.anadolu.example",
                  headers={"Authorization": "Bearer TOKEN"},
                  timeout=httpx.Timeout(5.0, connect=2.0)) as client:
    r = client.get("/siparisler", params={"durum": "bekliyor", "limit": 50})
    r.raise_for_status()
    siparisler = r.json()
    r2 = client.post("/siparisler", json={"musteri": 10, "tutar": 99.9})
    print(r2.status_code, r2.json()["id"])
'''
print(GOSTERIM.strip().splitlines()[0])
print('Satır sayısı:', len(GOSTERIM.strip().splitlines()))
</pre>
<p>Şimdi aynı sözleşmeye uyan, elimizdeki yanıtları döndüren küçük bir sahte istemci yazalım. Gerçek kodda bu sınıfın yerine <code>httpx.Client</code> geçer; iş mantığı değişmez.</p>
<pre class="py">import json

class SahteYanit:
    def __init__(self, status_code, govde='', headers=None):
        self.status_code = status_code
        self.text = govde
        self.headers = headers or {}
    def json(self):
        return json.loads(self.text)
    def raise_for_status(self):
        if self.status_code &gt;= 400:
            raise RuntimeError(f'HTTP {self.status_code}')

class SahteIstemci:
    """Yol -&gt; yanıt tablosu; gerçek httpx.Client ile aynı yüzey."""
    def __init__(self, tablo):
        self.tablo = tablo
        self.istekler = []
    def get(self, yol, params=None, timeout=5.0):
        self.istekler.append(('GET', yol, params))
        return self.tablo.get(yol, SahteYanit(404, '{"detail":"yok"}'))
    def post(self, yol, json=None, timeout=5.0):
        self.istekler.append(('POST', yol, json))
        return self.tablo.get(yol, SahteYanit(404, '{"detail":"yok"}'))

client = SahteIstemci({
    '/siparisler/42': SahteYanit(200, '{"id": 42, "tutar": 149.9, "durum": "kargoda"}'),
    '/siparisler/99': SahteYanit(404, '{"detail": "sipariş yok"}'),
})

def siparis_getir(client, no):
    r = client.get(f'/siparisler/{no}', timeout=5.0)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()

print(siparis_getir(client, 42))
print(siparis_getir(client, 99))
print(client.istekler)
</pre>
<div class="warn"><b>Zaman aşımı yoksa üretimde askıda kalırsın</b><code>requests.get(url)</code> varsayılan olarak sonsuza kadar bekler. Bir bağlantı zaman aşımı (connect) ve bir okuma zaman aşımı (read) belirle; httpx\'te <code>Timeout(5.0, connect=2.0)</code>, requests\'te <code>timeout=(2, 5)</code>.</div>

<h2>FastAPI ile uç nokta</h2>
<p>FastAPI, fonksiyon imzasındaki tip ipuçlarından hem doğrulamayı hem belgeyi üretir. Gövde modeli pydantic <code>BaseModel</code>\'dir: alan tipleri uymazsa otomatik 422 döner.</p>
<pre class="py">GOSTERIM = '''
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class SiparisIstek(BaseModel):
    musteri_id: int
    tutar: float = Field(gt=0)
    sehir: str

DB: dict[int, dict] = {}

@app.post("/siparisler", status_code=201)
def siparis_olustur(s: SiparisIstek):
    no = len(DB) + 1
    DB[no] = s.model_dump() | {"id": no, "durum": "bekliyor"}
    return DB[no]

@app.get("/siparisler/{no}")
def siparis_getir(no: int):
    if no not in DB:
        raise HTTPException(status_code=404, detail="sipariş yok")
    return DB[no]
'''
print('FastAPI uç noktaları:', [s.strip() for s in GOSTERIM.splitlines() if s.startswith('@app')])
</pre>
<p>Pyodide\'de FastAPI yok; ama mantığı <b>fonksiyon tabanlı yönlendirici</b> (router) ile birebir kurabiliriz: yol deseni + yöntem bir fonksiyona eşlenir, gövde bir doğrulayıcıdan geçer, hata durumunda kod ve detay döner.</p>
<pre class="py">import json, re
from dataclasses import dataclass, asdict

class HTTPHata(Exception):
    def __init__(self, kod, detay):
        self.kod, self.detay = kod, detay

@dataclass
class SiparisIstek:          # pydantic mantığı, elle
    musteri_id: int
    tutar: float
    sehir: str
    @classmethod
    def dogrula(cls, ham: dict):
        hatalar = []
        if not isinstance(ham.get('musteri_id'), int): hatalar.append('musteri_id int olmalı')
        t = ham.get('tutar')
        if not isinstance(t, (int, float)) or t &lt;= 0: hatalar.append('tutar &gt; 0 olmalı')
        if not isinstance(ham.get('sehir'), str) or not ham['sehir']: hatalar.append('sehir boş olamaz')
        if hatalar:
            raise HTTPHata(422, hatalar)
        return cls(ham['musteri_id'], float(t), ham['sehir'])

class Uygulama:
    def __init__(self):
        self.rotalar = []          # (yöntem, regex, fonksiyon)
    def rota(self, yontem, desen):
        rx = re.compile('^' + re.sub(r'\\{(\\w+)\\}', r'(?P&lt;\\1&gt;[^/]+)', desen) + '$')
        def kaydet(fn):
            self.rotalar.append((yontem, rx, fn)); return fn
        return kaydet
    def istek(self, yontem, yol, govde=None):
        for y, rx, fn in self.rotalar:
            m = rx.match(yol)
            if m and y == yontem:
                try:
                    return 200, fn(**m.groupdict(), govde=govde)
                except HTTPHata as e:
                    return e.kod, {'detail': e.detay}
        return 404, {'detail': 'rota yok'}

app = Uygulama()
DB = {}

@app.rota('POST', '/siparisler')
def olustur(govde):
    s = SiparisIstek.dogrula(govde)
    no = len(DB) + 1
    DB[no] = asdict(s) | {'id': no, 'durum': 'bekliyor'}
    return DB[no]

@app.rota('GET', '/siparisler/{no}')
def getir(no, govde=None):
    no = int(no)
    if no not in DB:
        raise HTTPHata(404, 'sipariş yok')
    return DB[no]

print(app.istek('POST', '/siparisler', {'musteri_id': 7, 'tutar': 99.9, 'sehir': 'Bursa'}))
print(app.istek('POST', '/siparisler', {'musteri_id': '7', 'tutar': -1}))
print(app.istek('GET', '/siparisler/1'))
print(app.istek('GET', '/siparisler/5'))
</pre>
<div class="tip"><b>Doğrulama sınırda, güven içeride</b>Gövdeyi uç noktada bir kez doğrula; iç fonksiyonlara doğrulanmış dataclass/pydantic nesnesi ver. Hata yanıtı tutarlı bir şekil taşısın: <code>{"detail": ...}</code>. Günlük kaydına istek kimliğini (request id) ekle; destek ekibi hatayı bununla bulur.</div>

<h2>Yeniden deneme ve zaman aşımı</h2>
<p>Geçici hatalar (429, 502, 503, bağlantı kopması) için <b>üstel geri çekilme</b> (exponential backoff) kullan: 1 s, 2 s, 4 s... ve küçük rastgele sapma (jitter) ekle ki yüzlerce istemci aynı anda tekrar vurmasın. 4xx hatalarında (429 hariç) yeniden deneme yapma; istek zaten yanlış. POST\'ta yeniden deneme yapacaksan <code>Idempotency-Key</code> başlığı gönder.</p>
<pre class="py">import random

def geri_cekilme_sureleri(deneme, taban=1.0, tavan=30.0, jitter=0.2):
    """deneme 0,1,2... için bekleme süreleri (saniye)."""
    sure = min(tavan, taban * 2 ** deneme)
    return round(sure * (1 + random.uniform(-jitter, jitter)), 2)

def yeniden_dene(fn, deneme_sayisi=4, uyku=lambda s: None):
    son_hata = None
    for i in range(deneme_sayisi):
        try:
            r = fn()
            if r.status_code in (429, 502, 503):
                raise RuntimeError(f'geçici: {r.status_code}')
            return r
        except RuntimeError as e:
            son_hata = e
            if i &lt; deneme_sayisi - 1:
                uyku(geri_cekilme_sureleri(i))
    raise RuntimeError(f'{deneme_sayisi} denemede başarısız: {son_hata}')

random.seed(1)
yanitlar = iter([SahteYanit(503), SahteYanit(503), SahteYanit(200, '{"ok": true}')])
bekleme = []
r = yeniden_dene(lambda: next(yanitlar), uyku=bekleme.append)
print(r.status_code, r.json(), 'beklemeler:', bekleme)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim API istemcisi kontrol listesi</h3>
<p>Kurumsal bir istemci modülü şu parçaları taşır: tek bir <code>Client</code> nesnesi (oturum), merkezi zaman aşımı, 5xx/429 için geri çekilmeli yeniden deneme, 4xx için anlamlı iş istisnaları (<code>SiparisBulunamadi</code> gibi), yanıt şemasının doğrulanması (TypedDict/pydantic), istek kimliği ve süresinin loglanması. Sahte istemciyi <code>Protocol</code> ile tanımlarsan hem gerçek hem test istemcisi aynı imzaya uyar; iş mantığı ağ olmadan test edilir.</p>
<p>Sunucu tarafında FastAPI\'nin bağımlılık enjeksiyonu (<code>Depends</code>) veritabanı oturumu ve kimlik doğrulamayı uç noktadan ayırır. Asenkron uç noktalar (<code>async def</code>) yalnızca I/O beklerken kazanç sağlar; CPU ağırlıklı işi <code>run_in_executor</code> ya da ayrı işçiye ver. Sürümleme (<code>/v1/</code>), sayfalama (<code>limit/offset</code> ya da imleç), oran sınırlama (rate limit) ve OpenAPI belgesi, bir API\'nin "üretime hazır" sayılması için beklenen asgari özelliklerdir.</p>
<p>Devre kesici (circuit breaker) kalıbını da bil: dış servis art arda başarısız olunca bir süre hiç istek atmadan hızlı hata dön; böylece hem kendi hizmetin yavaşlamaz hem de karşı tarafa yük bindirmezsin.</p>
</section>`,
    ex: [
      { t: 'mc', q: 'Bir POST isteği 503 ile başarısız oldu. En doğru davranış hangisi?',
        o: ['Hemen tekrar dene, en fazla 100 kez', 'Üstel geri çekilme ve Idempotency-Key ile sınırlı sayıda yeniden dene', 'Hiç yeniden deneme; 5xx kalıcıdır', 'Yöntemi GET\'e çevirip dene'],
        a: 1, why: '503 geçici bir hatadır; geri çekilme ile yeniden denemek doğrudur. POST idempotent olmadığından çift kayıt riskini Idempotency-Key ile önlersin. Anında ve sınırsız tekrar sunucuyu daha da zorlar.' },
      { t: 'code', id: 'api-web-2',
        q: '<p>Sahte yanıt sınıfı verildi. <code>yanit_isle(yanit)</code> fonksiyonu yaz: 2xx ise <code>yanit.json()</code> döndürsün (204 ise <code>None</code>); 404 ise <code>None</code>; 429 ve 5xx ise <code>GeciciHata</code> (özel istisna) fırlatsın; diğer 4xx için <code>KaliciHata</code> fırlatsın. İstisnalar <code>kod</code> özniteliği taşısın.</p>',
        start: 'import json\n\nclass SahteYanit:\n    def __init__(self, status_code, text=\'\'):\n        self.status_code, self.text = status_code, text\n    def json(self):\n        return json.loads(self.text)\n\nclass GeciciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'geçici hata {kod}\')\n        self.kod = kod\n\nclass KaliciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'kalıcı hata {kod}\')\n        self.kod = kod\n\ndef yanit_isle(yanit):\n    pass\n',
        sol: 'import json\n\nclass SahteYanit:\n    def __init__(self, status_code, text=\'\'):\n        self.status_code, self.text = status_code, text\n    def json(self):\n        return json.loads(self.text)\n\nclass GeciciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'geçici hata {kod}\')\n        self.kod = kod\n\nclass KaliciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'kalıcı hata {kod}\')\n        self.kod = kod\n\ndef yanit_isle(yanit):\n    k = yanit.status_code\n    if k == 204:\n        return None\n    if 200 <= k < 300:\n        return yanit.json()\n    if k == 404:\n        return None\n    if k == 429 or k >= 500:\n        raise GeciciHata(k)\n    raise KaliciHata(k)\n',
        tests: 'assert yanit_isle(SahteYanit(200, \'{"a": 1}\')) == {\'a\': 1}, "200 json dönmeli"\nassert yanit_isle(SahteYanit(201, \'[1]\')) == [1], "201 de başarılı"\nassert yanit_isle(SahteYanit(204)) is None, "204 gövdesiz: None"\nassert yanit_isle(SahteYanit(404, \'{}\')) is None, "404 None"\nfor k in (429, 500, 503):\n    try:\n        yanit_isle(SahteYanit(k)); assert False, f"{k} GeciciHata vermeli"\n    except GeciciHata as e:\n        assert e.kod == k, "kod özniteliği"\nfor k in (400, 401, 422):\n    try:\n        yanit_isle(SahteYanit(k)); assert False, f"{k} KaliciHata vermeli"\n    except KaliciHata as e:\n        assert e.kod == k, "kod özniteliği"\n',
        hints: ['204 kontrolünü 2xx kontrolünden önce yap; json() boş metinde patlar.', '429 ve >=500 geçici, geri kalan 4xx kalıcı.'],
        why: 'Durum kodunu iş istisnalarına çevirmek, çağıran kodun "yeniden dene / vazgeç / yok say" kararını HTTP ayrıntısı bilmeden vermesini sağlar.' },
      { t: 'code', id: 'api-web-3',
        q: '<p>Üstel geri çekilmeli yeniden deneme. <code>yeniden_dene(fn, deneme=3, bekle=None)</code>: <code>fn()</code> çağrısı <code>GeciciHata</code> fırlatırsa bekleyip tekrar dener; beklemeler 1, 2, 4... saniye (<code>2 ** i</code>) ve her bekleme <code>bekle(saniye)</code> ile yapılır (None ise beklemez). <code>deneme</code> kadar denedikten sonra hâlâ başarısızsa son istisnayı yeniden fırlatsın. Diğer istisnalar hemen yayılsın. Başarılı sonucu döndürsün.</p>',
        start: 'class GeciciHata(Exception):\n    pass\n\ndef yeniden_dene(fn, deneme=3, bekle=None):\n    pass\n',
        sol: 'class GeciciHata(Exception):\n    pass\n\ndef yeniden_dene(fn, deneme=3, bekle=None):\n    son = None\n    for i in range(deneme):\n        try:\n            return fn()\n        except GeciciHata as e:\n            son = e\n            if i < deneme - 1 and bekle is not None:\n                bekle(2 ** i)\n    raise son\n',
        tests: 'sayac = {\'n\': 0}\ndef bazen():\n    sayac[\'n\'] += 1\n    if sayac[\'n\'] < 3:\n        raise GeciciHata(\'503\')\n    return \'ok\'\nbeklemeler = []\nassert yeniden_dene(bazen, deneme=4, bekle=beklemeler.append) == \'ok\', "Üçüncü denemede başarmalı"\nassert beklemeler == [1, 2], "Beklemeler 1 ve 2 saniye olmalı"\nassert sayac[\'n\'] == 3, "Başarıdan sonra tekrar denenmemeli"\ndef hep():\n    raise GeciciHata(\'hep\')\ntry:\n    yeniden_dene(hep, deneme=2)\n    assert False, "Tüm denemeler başarısızsa istisna fırlamalı"\nexcept GeciciHata as e:\n    assert str(e) == \'hep\', "Son istisna yeniden fırlatılmalı"\ndef kalici():\n    raise ValueError(\'kalıcı\')\ntry:\n    yeniden_dene(kalici)\n    assert False\nexcept ValueError:\n    pass\n',
        hints: ['Döngüde başarı olursa hemen return.', 'Son denemeden sonra bekleme yapma; raise son.'],
        why: 'Yalnızca geçici hatayı yakalayıp diğerlerini yaymak, programlama hatalarının yeniden denemeyle gizlenmesini önler.' },
      { t: 'code', id: 'api-web-4',
        q: '<p>pydantic mantığını elle kur. <code>dogrula_siparis(ham: dict) -> dict</code>: kurallar: <code>musteri_id</code> pozitif int (bool değil), <code>tutar</code> pozitif sayı, <code>sehir</code> boş olmayan str, <code>urunler</code> en az bir elemanlı str listesi. Tüm hataları toplayıp <code>DogrulamaHatasi(hatalar: list[str])</code> fırlat (istisnanın <code>hatalar</code> özniteliği olsun); her hata mesajı alan adıyla başlasın. Geçerliyse <code>tutar</code> float\'a çevrilmiş yeni sözlük döndür.</p>',
        start: 'class DogrulamaHatasi(Exception):\n    def __init__(self, hatalar):\n        super().__init__(\'; \'.join(hatalar))\n        self.hatalar = hatalar\n\ndef dogrula_siparis(ham):\n    pass\n',
        sol: 'class DogrulamaHatasi(Exception):\n    def __init__(self, hatalar):\n        super().__init__(\'; \'.join(hatalar))\n        self.hatalar = hatalar\n\ndef dogrula_siparis(ham):\n    h = []\n    m = ham.get(\'musteri_id\')\n    if not isinstance(m, int) or isinstance(m, bool) or m <= 0:\n        h.append(\'musteri_id: pozitif tam sayı olmalı\')\n    t = ham.get(\'tutar\')\n    if not isinstance(t, (int, float)) or isinstance(t, bool) or t <= 0:\n        h.append(\'tutar: pozitif sayı olmalı\')\n    s = ham.get(\'sehir\')\n    if not isinstance(s, str) or not s.strip():\n        h.append(\'sehir: boş olamaz\')\n    u = ham.get(\'urunler\')\n    if not isinstance(u, list) or not u or not all(isinstance(x, str) for x in u):\n        h.append(\'urunler: en az bir ürün adı içeren liste olmalı\')\n    if h:\n        raise DogrulamaHatasi(h)\n    return {\'musteri_id\': m, \'tutar\': float(t), \'sehir\': s, \'urunler\': list(u)}\n',
        tests: 'ok = dogrula_siparis({\'musteri_id\': 5, \'tutar\': 120, \'sehir\': \'İzmir\', \'urunler\': [\'kahve\']})\nassert ok[\'tutar\'] == 120.0 and isinstance(ok[\'tutar\'], float), "tutar float olmalı"\nassert ok[\'urunler\'] == [\'kahve\'] and ok[\'sehir\'] == \'İzmir\', "Alanlar korunmalı"\ntry:\n    dogrula_siparis({\'musteri_id\': \'5\', \'tutar\': -1, \'sehir\': \'\', \'urunler\': []})\n    assert False, "Hatalı girdi DogrulamaHatasi vermeli"\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 4, "Dört hata toplanmalı"\n    assert all(any(h.startswith(a) for a in (\'musteri_id\', \'tutar\', \'sehir\', \'urunler\')) for h in e.hatalar), "Mesajlar alan adıyla başlamalı"\ntry:\n    dogrula_siparis({\'musteri_id\': True, \'tutar\': 1, \'sehir\': \'A\', \'urunler\': [\'x\']})\n    assert False, "bool musteri_id reddedilmeli"\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 1 and e.hatalar[0].startswith(\'musteri_id\')\ntry:\n    dogrula_siparis({})\n    assert False\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 4, "Eksik alanlar da hata olmalı"\n',
        hints: ['bool, int\'in alt sınıfıdır; isinstance(m, bool) ile ayrıca dışla.', 'Hataları listede topla, sonunda tek seferde fırlat; API 422 yanıtı tüm hataları birlikte gösterir.'],
        why: 'Tüm hataları birden döndürmek istemcinin üç tur yerine tek turda düzeltme yapmasını sağlar; pydantic de böyle davranır.' },
      { t: 'mc', q: 'FastAPI bir uç noktanın gövde modelinde tip uyuşmazlığı bulursa varsayılan olarak hangi durum kodunu döner?',
        o: ['400', '404', '422', '500'],
        a: 2, why: 'FastAPI/pydantic doğrulama hataları için 422 Unprocessable Entity döner ve hata listesini detail alanında verir. 400 genel hatalı istek, 500 sunucu hatasıdır.' },
      { t: 'code', id: 'api-web-6',
        q: '<p>Fonksiyon tabanlı yönlendirici yaz. <code>Uygulama</code> sınıfı: <code>rota(yontem, desen)</code> dekoratörü; desen <code>/x/{ad}</code> biçiminde parametre içerebilir. <code>istek(yontem, yol, govde=None)</code> eşleşen fonksiyonu yol parametreleri (str) ve <code>govde=</code> ile çağırıp <code>(200, sonuç)</code> döndürsün; fonksiyon <code>HTTPHata(kod, detay)</code> fırlatırsa <code>(kod, {\'detail\': detay})</code>; yol eşleşir ama yöntem eşleşmezse <code>(405, {\'detail\': \'yöntem desteklenmiyor\'})</code>; hiç eşleşme yoksa <code>(404, {\'detail\': \'rota yok\'})</code>.</p>',
        start: 'import re\n\nclass HTTPHata(Exception):\n    def __init__(self, kod, detay):\n        self.kod, self.detay = kod, detay\n\nclass Uygulama:\n    def __init__(self):\n        self.rotalar = []\n    # rota, istek\n',
        sol: 'import re\n\nclass HTTPHata(Exception):\n    def __init__(self, kod, detay):\n        self.kod, self.detay = kod, detay\n\nclass Uygulama:\n    def __init__(self):\n        self.rotalar = []\n\n    def rota(self, yontem, desen):\n        rx = re.compile(\'^\' + re.sub(r\'\\{(\\w+)\\}\', r\'(?P<\\1>[^/]+)\', desen) + \'$\')\n        def kaydet(fn):\n            self.rotalar.append((yontem, rx, fn))\n            return fn\n        return kaydet\n\n    def istek(self, yontem, yol, govde=None):\n        yol_eslesti = False\n        for y, rx, fn in self.rotalar:\n            m = rx.match(yol)\n            if not m:\n                continue\n            yol_eslesti = True\n            if y != yontem:\n                continue\n            try:\n                return 200, fn(**m.groupdict(), govde=govde)\n            except HTTPHata as e:\n                return e.kod, {\'detail\': e.detay}\n        if yol_eslesti:\n            return 405, {\'detail\': \'yöntem desteklenmiyor\'}\n        return 404, {\'detail\': \'rota yok\'}\n',
        tests: 'app = Uygulama()\nDB = {\'1\': {\'id\': 1, \'ad\': \'kahve\'}}\n@app.rota(\'GET\', \'/urunler/{no}\')\ndef getir(no, govde=None):\n    if no not in DB:\n        raise HTTPHata(404, \'ürün yok\')\n    return DB[no]\n@app.rota(\'POST\', \'/urunler\')\ndef ekle(govde):\n    return {\'eklendi\': govde[\'ad\']}\nassert app.istek(\'GET\', \'/urunler/1\') == (200, {\'id\': 1, \'ad\': \'kahve\'}), "Yol parametresi ile GET"\nassert app.istek(\'GET\', \'/urunler/9\') == (404, {\'detail\': \'ürün yok\'}), "HTTPHata koda dönmeli"\nassert app.istek(\'POST\', \'/urunler\', {\'ad\': \'çay\'}) == (200, {\'eklendi\': \'çay\'}), "POST gövde"\nassert app.istek(\'DELETE\', \'/urunler\')[0] == 405, "Yol var yöntem yok: 405"\nassert app.istek(\'GET\', \'/yok\') == (404, {\'detail\': \'rota yok\'}), "Bilinmeyen yol 404"\nassert getir(\'1\') == DB[\'1\'], "Dekoratör fonksiyonu aynen döndürmeli"\n',
        hints: ['Deseni regex\'e çevir: {ad} -> (?P<ad>[^/]+).', 'Yol eşleşti ama yöntem farklıysa bayrak tut; döngü sonunda 405 döndür.'],
        why: 'Gerçek çerçeveler de aynı şeyi yapar: desen -> regex, eşleşme -> fonksiyon çağrısı, istisna -> durum kodu. 405 ayrımı, istemciye yolun doğru ama yöntemin yanlış olduğunu söyler.' },
      { t: 'code', id: 'api-web-7',
        q: '<p>Sayfalı API tüketimi. Sahte istemcinin <code>get(yol, params)</code> metodu <code>{\'items\': [...], \'next\': sonraki_sayfa_veya_None}</code> döndüren <code>SahteYanit</code> verir. <code>tum_siparisler(client, yol=\'/siparisler\')</code> fonksiyonu <code>page=1</code>\'den başlayıp <code>next</code> None olana kadar tüm <code>items</code>\'ı tek listede toplayıp döndürsün. Her yanıtta <code>raise_for_status()</code> çağır. Sahte istemci ve 3 sayfalık veri start kodunda hazır.</p>',
        start: 'import json\n\nclass SahteYanit:\n    def __init__(self, kod, veri):\n        self.status_code, self._veri = kod, veri\n    def json(self):\n        return self._veri\n    def raise_for_status(self):\n        if self.status_code >= 400:\n            raise RuntimeError(f\'HTTP {self.status_code}\')\n\nclass SahteIstemci:\n    SAYFALAR = {1: ([1, 2], 2), 2: ([3, 4], 3), 3: ([5], None)}\n    def __init__(self):\n        self.cagri = []\n    def get(self, yol, params=None):\n        p = (params or {}).get(\'page\', 1)\n        self.cagri.append(p)\n        items, nxt = self.SAYFALAR[p]\n        return SahteYanit(200, {\'items\': [{\'id\': i} for i in items], \'next\': nxt})\n\ndef tum_siparisler(client, yol=\'/siparisler\'):\n    pass\n',
        sol: 'import json\n\nclass SahteYanit:\n    def __init__(self, kod, veri):\n        self.status_code, self._veri = kod, veri\n    def json(self):\n        return self._veri\n    def raise_for_status(self):\n        if self.status_code >= 400:\n            raise RuntimeError(f\'HTTP {self.status_code}\')\n\nclass SahteIstemci:\n    SAYFALAR = {1: ([1, 2], 2), 2: ([3, 4], 3), 3: ([5], None)}\n    def __init__(self):\n        self.cagri = []\n    def get(self, yol, params=None):\n        p = (params or {}).get(\'page\', 1)\n        self.cagri.append(p)\n        items, nxt = self.SAYFALAR[p]\n        return SahteYanit(200, {\'items\': [{\'id\': i} for i in items], \'next\': nxt})\n\ndef tum_siparisler(client, yol=\'/siparisler\'):\n    hepsi = []\n    sayfa = 1\n    while sayfa is not None:\n        r = client.get(yol, params={\'page\': sayfa})\n        r.raise_for_status()\n        veri = r.json()\n        hepsi.extend(veri[\'items\'])\n        sayfa = veri[\'next\']\n    return hepsi\n',
        tests: 'c = SahteIstemci()\nsonuc = tum_siparisler(c)\nassert [s[\'id\'] for s in sonuc] == [1, 2, 3, 4, 5], "Tüm sayfalar birleştirilmeli"\nassert c.cagri == [1, 2, 3], "Sayfalar sırayla ve bir kez istenmeli"\n',
        hints: ['while sayfa is not None döngüsü; her turda params={\'page\': sayfa}.', 'veri[\'next\'] ile sonraki sayfayı al.'],
        why: 'Sayfalama döngüsü gerçek API\'lerde en sık yazılan kalıptır; sahte istemci iş mantığını ağ olmadan test etmeni sağlar.' }
    ],
    faq: [
      { q: 'requests mi httpx mi?', a: 'Yeni projelerde httpx: aynı arayüz, async ve HTTP/2 desteği, zaman aşımı varsayılanı daha güvenli. requests çok yaygın; mevcut projede değiştirmeye değmeyebilir.' },
      { q: 'FastAPI yerine Flask/Django kullanmalı mıyım?', a: 'Saf API için FastAPI (tip tabanlı doğrulama, otomatik OpenAPI, async). Yönetim paneli, ORM ve oturum yönetimi gerekiyorsa Django. Flask küçük ve esnek, ama doğrulama ve belgeyi kendin eklersin.' },
      { q: 'Test ortamında gerçek API\'ye istek atmalı mıyım?', a: 'Birim testlerde hayır: sahte istemci ya da respx/responses ile yanıtları taklit et. Entegrasyon testlerinde ayrı bir sandbox ortamı kullan; CI\'da ağ bağımlılığı testleri kırılgan yapar.' }
    ],
    mistakes: [
      { bad: 'r = requests.get(url)\nveri = r.json()', good: 'r = session.get(url, timeout=(2, 5))\nr.raise_for_status()\nveri = r.json()', why: 'Zaman aşımı olmadan istek sonsuza kadar bekleyebilir; raise_for_status olmadan 500 yanıtının gövdesini veri sanırsın.' },
      { bad: 'for i in range(10):\n    try:\n        return client.post(url, json=veri)\n    except Exception:\n        continue', good: 'for i in range(4):\n    try:\n        return client.post(url, json=veri, headers={\'Idempotency-Key\': key})\n    except GeciciHata:\n        time.sleep(2 ** i)\nraise', why: 'Tüm istisnaları yutup anında tekrar denemek hem çift kayıt yaratır hem de kalıcı hataları gizler.' },
      { bad: 'veri = r.json()\ntutar = veri[\'tutar\'] * 1.2', good: 'veri = r.json()\nif not isinstance(veri.get(\'tutar\'), (int, float)):\n    raise ValueError(\'tutar eksik veya sayı değil\')\ntutar = veri[\'tutar\'] * 1.2', why: 'Dış API yanıtı sözleşmeye uymayabilir; sınırda doğrulamadan kullanmak belirsiz hatalara yol açar.' }
    ]
  }
);
})(window);
