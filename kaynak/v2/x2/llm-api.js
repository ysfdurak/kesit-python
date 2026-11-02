/* Kesit Python — 'llm-api' dersi uzantısı: yerel modeller, Protocol ile sağlayıcıdan bağımsız istemci, SSE ve model yönlendirme (AUDIT Ekle-9) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'llm-api',
    min: 25,
    html: `<h2>Derinleş: yerel modeller, sağlayıcıdan bağımsız istemci, SSE ve model yönlendirme</h2><p>Şimdiye kadar tek bir bulut sağlayıcısının SDK'sıyla çalıştın. Gerçek projelerde üç ihtiyaç hemen çıkar: müşteri verisi dışarı çıkmasın diye <b>yerel model</b> kullanmak, sağlayıcı değişince kodu baştan yazmamak ve cevabı kullanıcıya <b>akış</b> (streaming) olarak iletmek. Bir de maliyet: her soruya en büyük modeli çağırmak gereksiz pahalıdır.</p><h3>Açık ve yerel modeller</h3><p>Açık ağırlıklı (open-weight) modelleri kendi makinende ya da sunucunda çalıştırabilirsin. En kolay yol <b>Ollama</b>dır: modeli indirir, yerelde bir HTTP sunucusu açar (varsayılan <code>localhost:11434</code>) ve OpenAI uyumlu bir uç nokta sunar. vLLM ve LM Studio da aynı uyumlu arayüzü verir; Hugging Face ise barındırılan modeller için <code>InferenceClient</code> sağlar.</p><pre class="code"># Terminal: ollama pull llama3.2   ve   ollama serve
from openai import OpenAI      # pip install openai

yerel = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # anahtar yok sayılır
cevap = yerel.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Kargo gecikmesi şikâyetini tek cümlede özetle: ..."}],
)
print(cevap.choices[0].message.content)

from huggingface_hub import InferenceClient   # pip install huggingface_hub
hf = InferenceClient(token="hf_...")          # anahtarı ortam değişkeninden oku
print(hf.chat_completion(messages=[{"role": "user", "content": "Merhaba"}], max_tokens=50))</pre><div class="tbl-wrap"><table><tr><th></th><th>Bulut API</th><th>Yerel / kendi sunucun</th></tr><tr><td>Kalite</td><td>En güçlü modeller</td><td>Küçük ve orta modeller; dar görevlerde yeterli</td></tr><tr><td>Veri</td><td>Sağlayıcıya gider (sözleşme ve KVKK değerlendirmesi gerekir)</td><td>Kurum dışına çıkmaz</td></tr><tr><td>Maliyet</td><td>Token başına ödeme</td><td>Donanım ve işletme maliyeti; hacim büyüdükçe avantajlı</td></tr><tr><td>İşletme</td><td>Sağlayıcı yönetir</td><td>GPU, güncelleme, ölçekleme senin işin</td></tr></table></div><h3>Sağlayıcıdan bağımsız istemci: Protocol</h3><p>Her sağlayıcının cevap biçimi farklıdır: biri metni <code>content</code> blok listesinde, diğeri <code>choices[0].message.content</code> içinde döndürür; token sayılarının adları bile farklıdır. Uygulama kodunun bunları bilmemesi için tek bir arayüz tanımla ve her sağlayıcıya bir <b>adaptör</b> yaz. <code>typing.Protocol</code> yapısal tip denetimi yapar: bir sınıf <code>sohbet</code> metoduna sahipse, kalıtım almadan da bu arayüzü karşılar.</p><pre class="py">from dataclasses import dataclass
from typing import Protocol

@dataclass
class Yanit:
    metin: str
    girdi_token: int
    cikti_token: int
    saglayici: str

class SohbetIstemcisi(Protocol):
    def sohbet(self, mesajlar: list[dict], azami_token: int = 512) -&gt; Yanit: ...

class SahteBulut:                         # gerçek SDK çağrısının yerine sabit ham cevap
    def sohbet(self, mesajlar, azami_token=512):
        ham = {"content": [{"type": "text", "text": "Kargonuz yarın teslim edilecek."}],
               "usage": {"input_tokens": 42, "output_tokens": 9}}
        metin = "".join(b["text"] for b in ham["content"] if b["type"] == "text")
        return Yanit(metin, ham["usage"]["input_tokens"], ham["usage"]["output_tokens"], "bulut")

class SahteYerel:
    def sohbet(self, mesajlar, azami_token=512):
        ham = {"choices": [{"message": {"content": "Kargo yarın gelir."}}],
               "usage": {"prompt_tokens": 40, "completion_tokens": 6}}
        u = ham["usage"]
        return Yanit(ham["choices"][0]["message"]["content"], u["prompt_tokens"], u["completion_tokens"], "yerel")

def ozetle(istemci: SohbetIstemcisi, sikayet: str) -&gt; str:   # uygulama kodu tek arayüzü bilir
    y = istemci.sohbet([{"role": "user", "content": f"Özetle: {sikayet}"}])
    return f"[{y.saglayici}] {y.metin} ({y.girdi_token}+{y.cikti_token} token)"

for ist in (SahteBulut(), SahteYerel()):
    print(ozetle(ist, "Siparişim 5 gündür gelmedi"))</pre><p>Bu tasarımın kazancı: testte sahte istemci verirsin, canlıda gerçek adaptörü; sağlayıcı değiştirmek tek satırlık yapılandırmadır. LiteLLM gibi kütüphaneler bu katmanı hazır sunar, ama kendi küçük arayüzünü tanımlamak bağımlılığı ve sürprizleri azaltır.</p><h3>SSE ile akışı istemciye iletmek</h3><p>Model cevabı parça parça (token token) gelir. Bunu tarayıcıya iletmenin en basit yolu <b>Server-Sent Events</b>'tir (SSE): sunucu <code>text/event-stream</code> türünde açık bir HTTP yanıtı tutar ve her olayı düz metin olarak yazar. Biçim çok basittir: isteğe bağlı <code>event:</code> ve <code>id:</code> satırları, bir ya da birkaç <code>data:</code> satırı ve olayı bitiren <b>boş satır</b>. İki nokta ile başlayan satır yorumdur (bağlantıyı canlı tutmak için kullanılır).</p><pre class="py">import json

def sse(veri, olay=None):
    satirlar = [f"event: {olay}"] if olay else []
    metin = veri if isinstance(veri, str) else json.dumps(veri, ensure_ascii=False)
    satirlar += [f"data: {s}" for s in metin.split("\\n")]
    return "\\n".join(satirlar) + "\\n\\n"

def model_akisi():                       # gerçek SDK akışının yerine
    yield from ["Kargonuz ", "yarın ", "teslim ", "edilecek."]

govde = "".join(sse({"parca": p}) for p in model_akisi()) + sse("[DONE]", olay="bitti")
print(govde)</pre><p>FastAPI'de bu üreteci <code>StreamingResponse</code> ile döndürürsün. Tarayıcı tarafında <code>EventSource</code> (yalnız GET) ya da <code>fetch</code> ile gövdeyi okuyarak parçaları ekrana eklersin. Ters vekil sunucuda (Nginx) tamponlamayı kapatmayı unutma; aksi hâlde parçalar birikip tek seferde gelir.</p><pre class="code">from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/sohbet/akis")
async def akis(soru: str):
    async def uret():
        async with istemci.messages.stream(model=MODEL, max_tokens=500,
                                           messages=[{"role": "user", "content": soru}]) as s:
            async for parca in s.text_stream:
                yield sse({"parca": parca})
        yield sse("[DONE]", olay="bitti")
    return StreamingResponse(uret(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})</pre><h3>Model yönlendirme: küçük model, büyük model</h3><p>Şikâyet kategorisi seçmek gibi basit işler küçük ve ucuz modelle, uzun belge analizi ya da kod yazma gibi işler büyük modelle yapılır. Yönlendirici (router) basit kurallarla başlar: istemin uzunluğu, görev türü, istenen çıktı (JSON şeması) ve kullanıcının planı. Bir adım ötesi <b>kademeli</b> (cascade) yaklaşımdır: önce küçük model denenir, cevap doğrulamayı geçmezse (JSON bozuk, güven düşük) büyük modele gidilir. Her iki durumda da hangi isteğin hangi modele gittiğini ve maliyetini logla; yönlendirme kurallarını bu verilerle ayarlarsın.</p><div class="note"><b>Gerçek işte</b>Ilgaz Bank gibi düzenlemeye tabi kurumlarda yaygın mimari şudur: kişisel veri içeren istekler kurum içindeki yerel modele, kişisel veri içermeyen genel istekler bulut modeline gider; tüm çağrılar tek bir iç "LLM ağ geçidi" (gateway) servisinden geçer. Ağ geçidi anahtarları saklar, hız sınırı ve bütçe uygular, istekleri maskeler ve loglar. Bu bölümdeki Protocol, SSE ve yönlendirici, o ağ geçidinin küçük bir modelidir.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'OpenAI SDK\'sıyla yazılmış bir sınıflandırma betiğini yerel Ollama modeline taşımak istiyorsun. En az değişiklik hangisi?',
        o: ['SDK\'yı kaldırıp HTTP isteklerini socket modülüyle elle yazmak', 'İstemciyi base_url="http://localhost:11434/v1" ile kurup model adını değiştirmek', 'Mesajları JSON yerine düz metin olarak göndermek gerekir', 'Yerel modeller sohbet biçimini desteklemez; istemi tek metne çevirmek'],
        a: 1,
        why: 'Ollama, vLLM ve LM Studio OpenAI uyumlu uç nokta sunar; aynı SDK base_url ve model adı değişerek kullanılır. API anahtarı yok sayılır ama boş bırakılmaz.' },
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>class SohbetIstemcisi(Protocol): def sohbet(self, mesajlar): ...</code> tanımlı. <code>class Yerel:</code> sınıfı Protocol\'den kalıtım almıyor ama aynı imzalı bir <code>sohbet</code> metodu var. Ne olur?',
        o: ['Yerel, tip denetleyicisi (mypy) için SohbetIstemcisi yerine geçer: yapısal tiplemedir', 'Yerel sınıfı Protocol\'den kalıtım almadığı için çalışma anında TypeError verir', 'Protocol yalnızca soyut sınıflarla birlikte kullanıldığında çalışan bir özelliktir', 'Tip denetleyicisi yalnızca isim aynıysa (Yerel → SohbetIstemcisi) kabul eder'],
        a: 0,
        why: 'Protocol "şu metodlara sahip olan her şey" demektir (duck typing\'in tip denetimli hâli). Kalıtım gerekmez; çalışma anında hiçbir denetim yapılmaz, denetim mypy gibi araçlarda olur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bir SSE akışını olaylara bölen kod. Ne yazdırır?',
        code: 'akis = "data: Mer\\n\\n: canli\\n\\nevent: bitti\\ndata: [DONE]\\n\\n"\nfor blok in akis.split("\\n\\n"):\n    if not blok:\n        continue\n    olay, veri = "message", []\n    for satir in blok.split("\\n"):\n        if satir.startswith(":"):\n            continue\n        alan, _, deger = satir.partition(": ")\n        if alan == "event":\n            olay = deger\n        elif alan == "data":\n            veri.append(deger)\n    if veri:\n        print(olay, "|", "\\n".join(veri))\n',
        o: ['message | Mer\nbitti | [DONE]', 'message | Mer\nmessage | canli\nbitti | [DONE]', 'message | Mer\nmessage | [DONE]', 'Mer\n[DONE]'],
        a: 0,
        why: 'Boş satır olayları ayırır. ": canli" bir yorumdur ve veri satırı olmadığı için yazdırılmaz. Olay adı verilmeyen olayın türü varsayılan olarak "message" olur.' },
      { t: 'code',
        id: 'llm-api-w1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>sse_bicimle(veri, olay=None, kimlik=None)</code> fonksiyonunu yaz. Sıra: varsa <code>event: ...</code>, varsa <code>id: ...</code>, sonra veri satırları. <code>veri</code> metin değilse <code>json.dumps(veri, ensure_ascii=False)</code> ile metne çevir. Metindeki her satır ayrı bir <code>data: </code> satırı olsun. Satırlar <code>\\n</code> ile birleşsin ve olay <b>boş satırla</b> bitsin (sonda <code>\\n\\n</code>).</p>',
        guide: ['Boş bir satır listesi aç; olay ve kimlik varsa önce onları ekle.', 'veri metin değilse json.dumps ile metne çevir.', 'Metni satırlara böl, her birini "data: " önekiyle listeye ekle.', 'Listeyi "\\n" ile birleştir, sonuna "\\n\\n" ekle.'],
        example: 'satirlar = ["a", "b"]\nprint(repr("\\n".join(f"x: {s}" for s in satirlar) + "\\n\\n"))\n',
        start: 'import json\n\ndef sse_bicimle(veri, olay=None, kimlik=None):\n    satirlar = []\n    # TODO: event ve id satırları\n    # TODO: veriyi metne çevir, her satırı data: ile ekle\n    return ""\n',
        sol: 'import json\n\ndef sse_bicimle(veri, olay=None, kimlik=None):\n    satirlar = []\n    if olay:\n        satirlar.append(f"event: {olay}")\n    if kimlik is not None:\n        satirlar.append(f"id: {kimlik}")\n    metin = veri if isinstance(veri, str) else json.dumps(veri, ensure_ascii=False)\n    satirlar += [f"data: {s}" for s in metin.split("\\n")]\n    return "\\n".join(satirlar) + "\\n\\n"\n',
        tests: 'assert sse_bicimle("merhaba") == "data: merhaba\\n\\n", "En basit olay: tek data satırı ve boş satır"\nassert sse_bicimle({"parca": "Çay"}) == \'data: {"parca": "Çay"}\\n\\n\', "Sözlük JSON olmalı, Türkçe karakter kaçırılmamalı"\nassert sse_bicimle("[DONE]", olay="bitti", kimlik=7) == "event: bitti\\nid: 7\\ndata: [DONE]\\n\\n", "Sıra: event, id, data"\nassert sse_bicimle("a\\nb") == "data: a\\ndata: b\\n\\n", "Çok satırlı veri her satır için ayrı data: satırı olmalı"\nassert sse_bicimle("x", kimlik=0).startswith("id: 0\\n"), "kimlik 0 da yazılmalı (None kontrolü yap)"\n',
        hints: ['SSE\'de olayı bitiren şey boş satırdır.', 'metin.split("\\n") ile satırlara böl; her birine "data: " ekle.', 'kimlik 0 olabilir: "if kimlik is not None" kullan.'],
        why: 'Veri içinde yeni satır varsa tek data: satırına yazmak olayı bozar; standart her satırın ayrı data: satırı olmasını ister ve istemci bunları \\n ile yeniden birleştirir.' },
      { t: 'code',
        id: 'llm-api-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>İki sağlayıcının ham cevabını ortak <code>Yanit</code> nesnesine çeviren adaptörleri yaz (dataclass hazır):</p><ul><li><code>blok_donustur(ham)</code>: <code>{"content": [{"type": "text", "text": ...}, {"type": "tool_use", ...}], "usage": {"input_tokens": .., "output_tokens": ..}}</code>. Yalnız <code>type == "text"</code> blokların metnini birleştir. saglayici: <code>"blok"</code>.</li><li><code>secenek_donustur(ham)</code>: <code>{"choices": [{"message": {"content": ...}}], "usage": {"prompt_tokens": .., "completion_tokens": ..}}</code>. İçerik <code>None</code> olabilir (yalnız araç çağrısı varsa); o zaman boş metin. saglayici: <code>"secenek"</code>.</li></ul>',
        guide: ['Blok biçiminde metin bloklarını bir comprehension ile süz ve "".join ile birleştir.', 'Token alan adlarını her biçimin kendi adlarından oku.', 'Seçenek biçiminde ilk seçeneğin message.content değerini al; None ise "" kullan.'],
        example: 'ham = {"parcalar": [{"t": "a", "v": "x"}, {"t": "b", "v": "y"}]}\nprint("".join(p["v"] for p in ham["parcalar"] if p["t"] == "a"))\n',
        start: 'from dataclasses import dataclass\n\n@dataclass\nclass Yanit:\n    metin: str\n    girdi_token: int\n    cikti_token: int\n    saglayici: str\n\ndef blok_donustur(ham):\n    # TODO\n    pass\n\ndef secenek_donustur(ham):\n    # TODO\n    pass\n',
        sol: 'from dataclasses import dataclass\n\n@dataclass\nclass Yanit:\n    metin: str\n    girdi_token: int\n    cikti_token: int\n    saglayici: str\n\ndef blok_donustur(ham):\n    metin = "".join(b["text"] for b in ham["content"] if b.get("type") == "text")\n    u = ham["usage"]\n    return Yanit(metin, u["input_tokens"], u["output_tokens"], "blok")\n\ndef secenek_donustur(ham):\n    icerik = ham["choices"][0]["message"].get("content") or ""\n    u = ham["usage"]\n    return Yanit(icerik, u["prompt_tokens"], u["completion_tokens"], "secenek")\n',
        tests: 'b = {"content": [{"type": "text", "text": "Kargo "}, {"type": "tool_use", "name": "takip"}, {"type": "text", "text": "yolda."}],\n     "usage": {"input_tokens": 30, "output_tokens": 5}}\nassert blok_donustur(b) == Yanit("Kargo yolda.", 30, 5, "blok"), "Yalnız text blokları birleştirilmeli"\ns = {"choices": [{"message": {"content": "Tamam."}}], "usage": {"prompt_tokens": 12, "completion_tokens": 2}}\nassert secenek_donustur(s) == Yanit("Tamam.", 12, 2, "secenek")\ns2 = {"choices": [{"message": {"content": None, "tool_calls": [{}]}}], "usage": {"prompt_tokens": 9, "completion_tokens": 4}}\nassert secenek_donustur(s2).metin == "", "content None ise boş metin dönmeli"\n',
        hints: ['b.get("type") == "text" süzgeciyle metin bloklarını seç.', 'ham["choices"][0]["message"].get("content") or ""'],
        why: 'Adaptörler sağlayıcıya özgü biçimi uygulamanın geri kalanından saklar. Araç çağrısı bloklarını süzmek ve None içeriği boş metne çevirmek, sonraki kodun her yerde özel durum kontrolü yapmasını önler.' },
      { t: 'code',
        id: 'llm-api-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>sse_ayristir(metin)</code> yaz: SSE akış metnini <code>[{"event": .., "data": .., "id": ..}]</code> listesine çevirsin. Kurallar: olaylar boş satırla (<code>\\n\\n</code>) ayrılır; <code>:</code> ile başlayan satırlar yorumdur; alan ile değer <code>": "</code> ile ayrılır; birden çok <code>data</code> satırı <code>\\n</code> ile birleşir; event yoksa <code>"message"</code>, id yoksa <code>None</code>. Hiç data satırı olmayan bloklar listeye girmez. Sondaki yarım (boş satırla bitmemiş) blok da <b>alınmaz</b>; çünkü henüz tamamlanmamıştır.</p>',
        start: 'def sse_ayristir(metin):\n    pass\n',
        sol: 'def sse_ayristir(metin):\n    bloklar = metin.split("\\n\\n")\n    tamam = bloklar[:-1]          # son parça boş ya da yarım\n    olaylar = []\n    for blok in tamam:\n        olay, kimlik, veri = "message", None, []\n        for satir in blok.split("\\n"):\n            if not satir or satir.startswith(":"):\n                continue\n            alan, _, deger = satir.partition(": ")\n            if alan == "event":\n                olay = deger\n            elif alan == "id":\n                kimlik = deger\n            elif alan == "data":\n                veri.append(deger)\n        if veri:\n            olaylar.append({"event": olay, "data": "\\n".join(veri), "id": kimlik})\n    return olaylar\n',
        tests: 'm = "data: a\\n\\n: ping\\n\\nevent: bitti\\nid: 3\\ndata: x\\ndata: y\\n\\ndata: yarim"\nr = sse_ayristir(m)\nassert r[0] == {"event": "message", "data": "a", "id": None}, f"İlk olay: {r[0]}"\nassert r[1] == {"event": "bitti", "data": "x\\ny", "id": "3"}, "Çok satırlı data \\n ile birleşmeli"\nassert len(r) == 2, "Yorum bloğu ve yarım son blok alınmamalı"\nassert sse_ayristir("") == []\n',
        hints: ['split("\\n\\n") sonucunun son elemanı ya boştur ya da henüz bitmemiş bloktur.', 'satir.partition(": ") alan ve değeri ayırır.', 'Her blokta olay="message", kimlik=None, veri=[] ile başla.'],
        why: 'Akış ağdan parça parça geldiği için son blok yarım olabilir; gerçek istemciler tamponda tutup bir sonraki parçayla birleştirir. Yorum satırları bağlantıyı canlı tutmak (keep-alive) içindir.' },
      { t: 'code',
        id: 'llm-api-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Kurallı model yönlendirici yaz: <code>yonlendir(istem, json_gerekli=False)</code> <code>"kucuk"</code> ya da <code>"buyuk"</code> döndürsün. Kurallar sırayla:</p><ol><li>Tahmini token (<code>math.ceil(len(istem) / 4)</code>) 1500\'den büyükse <code>"buyuk"</code>.</li><li>İstem (Türkçe küçük harfe çevrilmiş: önce <code>"I"→"ı"</code>, <code>"İ"→"i"</code>, sonra <code>lower()</code>) şu kelimelerden birini <b>kelime başı olarak</b> içeriyorsa <code>"buyuk"</code>: <code>"analiz", "kod", "karşılaştır", "neden"</code> (ör. "kodu" ve "Analizi" eşleşir, "dekod" eşleşmez).</li><li><code>json_gerekli</code> doğruysa ve istem 300 karakterden uzunsa <code>"buyuk"</code>.</li><li>Aksi hâlde <code>"kucuk"</code>.</li></ol>',
        start: 'def yonlendir(istem, json_gerekli=False):\n    pass\n',
        sol: 'import math\nimport re\n\nANAHTAR = ("analiz", "kod", "karşılaştır", "neden")\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef yonlendir(istem, json_gerekli=False):\n    if math.ceil(len(istem) / 4) > 1500:\n        return "buyuk"\n    k = tr_kucuk(istem)\n    if any(re.search(r"\\b" + a, k) for a in ANAHTAR):\n        return "buyuk"\n    if json_gerekli and len(istem) > 300:\n        return "buyuk"\n    return "kucuk"\n',
        tests: 'assert yonlendir("Bu şikâyetin kategorisi nedir?") == "kucuk", "Basit sınıflandırma küçük modele"\nassert yonlendir("Bu kodu incele") == "buyuk", "kelime başında \'kod\' büyük modele"\nassert yonlendir("ANALİZ yap") == "buyuk", "Türkçe büyük harf İ doğru küçültülmeli"\nassert yonlendir("Mesaj dekodlandı mı?") == "kucuk", "\'dekod\' kelime başı değil"\nassert yonlendir("x" * 6001) == "buyuk", "6001 karakter ≈ 1501 token"\nassert yonlendir("y" * 301, json_gerekli=True) == "buyuk"\nassert yonlendir("y" * 301) == "kucuk"\n',
        hints: ['Kelime başı için regex \\b kullan: re.search(r"\\b" + kelime, metin).', 'Python\'un lower() metodu "İ" harfini "i̇" (noktalı iki karakter) yapar; önce replace ile düzelt.'],
        why: 'Kurallı yönlendirme açıklanabilir ve ucuzdur. Loglardan hangi isteklerin küçük modelde başarısız olduğunu görerek kuralları zamanla ayarlarsın; gerekirse küçük bir sınıflandırıcıyla değiştirirsin.' },
      { t: 'code',
        id: 'llm-api-w5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>YedekliIstemci(saglayicilar)</code> sınıfını yaz. <code>saglayicilar</code>, <code>sohbet(mesajlar)</code> metodu olan nesnelerin listesi (hepsi aynı Protocol\'ü karşılar). <code>sohbet(mesajlar)</code> sırayla dener: <code>GeciciHata</code> gelirse sonraki sağlayıcıya geçer; <code>KaliciHata</code> (ör. geçersiz istek) gelirse hiç denemeden <b>yeniden fırlatır</b>; hepsi geçici hatayla düşerse son hatayı <code>RuntimeError("tüm sağlayıcılar başarısız")</code> ile fırlatır (<code>raise ... from hata</code>). Başarıda yanıtı döndürür ve kaçıncı sağlayıcının cevap verdiğini <code>self.son_kullanilan</code> (0 tabanlı) alanına yazar.</p>',
        start: 'class GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\nclass YedekliIstemci:\n    pass\n',
        sol: 'class GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\nclass YedekliIstemci:\n    def __init__(self, saglayicilar):\n        self.saglayicilar = list(saglayicilar)\n        self.son_kullanilan = None\n\n    def sohbet(self, mesajlar):\n        son_hata = None\n        for i, s in enumerate(self.saglayicilar):\n            try:\n                yanit = s.sohbet(mesajlar)\n            except GeciciHata as h:\n                son_hata = h\n                continue\n            self.son_kullanilan = i\n            return yanit\n        raise RuntimeError("tüm sağlayıcılar başarısız") from son_hata\n',
        tests: 'class S:\n    def __init__(self, sonuc):\n        self.sonuc, self.cagri = sonuc, 0\n    def sohbet(self, mesajlar):\n        self.cagri += 1\n        if isinstance(self.sonuc, Exception):\n            raise self.sonuc\n        return self.sonuc\na, b = S(GeciciHata("429")), S("yedek cevap")\ny = YedekliIstemci([a, b])\nassert y.sohbet([]) == "yedek cevap" and y.son_kullanilan == 1, "Geçici hatada ikinciye geçmeli"\nc, d2 = S(KaliciHata("400")), S("kullanılmamalı")\ntry:\n    YedekliIstemci([c, d2]).sohbet([])\n    assert False, "KaliciHata yeniden fırlatılmalı"\nexcept KaliciHata:\n    pass\nassert d2.cagri == 0, "Kalıcı hatada yedek sağlayıcı denenmemeli"\ntry:\n    YedekliIstemci([S(GeciciHata("a")), S(GeciciHata("b"))]).sohbet([])\n    assert False, "Hepsi düşünce RuntimeError beklenir"\nexcept RuntimeError as h:\n    assert str(h.__cause__) == "b", "Son hata __cause__ olarak bağlanmalı (raise ... from)"\n',
        hints: ['Yalnız GeciciHata\'yı yakala; KaliciHata yakalanmazsa kendiliğinden yukarı çıkar.', 'Döngü bitince raise RuntimeError(...) from son_hata.'],
        why: 'Yedekleme (fallback) yalnız geçici sorunlar için anlamlıdır. Geçersiz istek her sağlayıcıda da geçersizdir; onu denemeye devam etmek maliyeti ve gecikmeyi artırır.' },
      { t: 'code',
        id: 'llm-api-w6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>akis_govdesi(parcalar)</code> model parçalarını SSE gövdesine çeviriyor: her parça için <code>data: {"parca": ...}</code> olayı, en sonda <code>event: bitti</code> ve <code>data: [DONE]</code>. Tarayıcıda parçalar birbirine yapışıyor, Türkçe karakterler <code>\\u00e7</code> gibi görünüyor ve bitiş olayı hiç tetiklenmiyor.</p>',
        start: 'import json\n\ndef akis_govdesi(parcalar):\n    govde = ""\n    for p in parcalar:\n        govde += "data: " + json.dumps({"parca": p}) + "\\n"\n    govde += "event: bitti\\ndata: [DONE]"\n    return govde\n',
        sol: 'import json\n\ndef akis_govdesi(parcalar):\n    govde = ""\n    for p in parcalar:\n        govde += "data: " + json.dumps({"parca": p}, ensure_ascii=False) + "\\n\\n"\n    govde += "event: bitti\\ndata: [DONE]\\n\\n"\n    return govde\n',
        tests: 'g = akis_govdesi(["Çay ", "hazır"])\nassert g == \'data: {"parca": "Çay "}\\n\\ndata: {"parca": "hazır"}\\n\\nevent: bitti\\ndata: [DONE]\\n\\n\', f"Gelen: {g!r}"\nassert akis_govdesi([]) == "event: bitti\\ndata: [DONE]\\n\\n", "Parça yoksa yalnız bitiş olayı"\n',
        hints: ['Tek \\n ile biten satırlar aynı olayın parçası sayılır; olayı boş satır bitirir.', 'json.dumps Türkçe karakterleri varsayılan olarak kaçırır: ensure_ascii=False.'],
        why: 'SSE\'de olay sınırı boş satırdır; tek \\n ile yazılan data satırları tek bir olayda birleşir. Son olay da boş satırla bitmezse istemci onu tamamlanmamış sayar ve hiç tetiklemez.' },
      { t: 'code',
        id: 'llm-api-w7',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Asenkron akış aktarıcısı yaz: <code>async def sse_akisi(kaynak)</code> bir <b>async generator</b> olsun. <code>kaynak</code> metin parçaları üreten bir async iterator. Her parça için <code>data: {"i": sira, "parca": parca}</code> olayı üret (sira 0\'dan başlar; JSON <code>ensure_ascii=False</code>). Kaynak bitince <code>event: bitti</code> olayı, verisi <code>{"parca_sayisi": n, "karakter": toplam}</code>. Kaynak bir istisna fırlatırsa <code>event: hata</code> olayı, verisi <code>{"mesaj": str(hata)}</code> üret ve dur (istisnayı yutma ama dışarı da fırlatma). Her olay <code>\\n\\n</code> ile biter.</p>',
        start: 'import json\n\nasync def sse_akisi(kaynak):\n    pass\n',
        sol: 'import json\n\ndef _olay(veri, olay=None):\n    bas = f"event: {olay}\\n" if olay else ""\n    return bas + "data: " + json.dumps(veri, ensure_ascii=False) + "\\n\\n"\n\nasync def sse_akisi(kaynak):\n    n = karakter = 0\n    try:\n        async for parca in kaynak:\n            yield _olay({"i": n, "parca": parca})\n            n += 1\n            karakter += len(parca)\n    except Exception as h:\n        yield _olay({"mesaj": str(h)}, "hata")\n        return\n    yield _olay({"parca_sayisi": n, "karakter": karakter}, "bitti")\n',
        tests: 'import asyncio\nasync def kaynak(parcalar, hata=None):\n    for p in parcalar:\n        await asyncio.sleep(0)\n        yield p\n    if hata:\n        raise hata\nasync def topla(gen):\n    return [o async for o in gen]\nr = asyncio.run(topla(sse_akisi(kaynak(["Mer", "haba"]))))\nassert r[0] == \'data: {"i": 0, "parca": "Mer"}\\n\\n\', f"İlk olay: {r[0]!r}"\nassert r[-1] == \'event: bitti\\ndata: {"parca_sayisi": 2, "karakter": 7}\\n\\n\', f"Bitiş olayı: {r[-1]!r}"\nr2 = asyncio.run(topla(sse_akisi(kaynak(["a"], TimeoutError("zaman aşımı")))))\nassert len(r2) == 2 and r2[1] == \'event: hata\\ndata: {"mesaj": "zaman aşımı"}\\n\\n\', f"Hata olayı bekleniyordu: {r2!r}"\nassert asyncio.run(topla(sse_akisi(kaynak([]))))[0].startswith("event: bitti"), "Boş kaynakta yalnız bitiş olayı"\n',
        hints: ['async def içinde yield kullanınca fonksiyon async generator olur; kaynağı async for ile gez.', 'Döngüyü try/except Exception ile sar; hata olayını yield ettikten sonra return ile çık.', 'Bitiş olayını try bloğunun dışında, döngü normal bitince üret.'],
        why: 'İstemciye hata olayı göndermek, bağlantıyı sessizce koparmaktan çok daha iyi bir kullanıcı deneyimi verir: arayüz "yanıt yarıda kaldı, tekrar dene" diyebilir. FastAPI bu üreteci StreamingResponse ile doğrudan yayınlar.' }
    ],
    faq: [
      { q: 'Yerel model mi, bulut API mi seçmeliyim?',
        a: 'Önce görevi bulut modelinde çalışır hâle getir ve bir değerlendirme seti oluştur. Sonra aynı seti yerel modelde çalıştır: kalite yeterliyse ve veri gizliliği ya da hacim maliyeti önemliyse yerele geç. Çoğu kurum ikisini birlikte kullanır; Protocol tabanlı istemci bu geçişi kolaylaştırır.' },
      { q: 'SSE mi WebSocket mi?',
        a: 'LLM cevabı gibi tek yönlü (sunucudan istemciye) akışlarda SSE daha basittir: düz HTTP, otomatik yeniden bağlanma, vekil sunucularla uyumlu. İstemcinin de sürekli veri gönderdiği (ses, ortak düzenleme) iki yönlü senaryolarda WebSocket kullanılır. FastAPI dersindeki ek bölümde ikisini de görürsün.' }
    ],
    mistakes: [
      { bad: 'yield "data: " + json.dumps(veri) + "\\n"',
        good: 'yield "data: " + json.dumps(veri, ensure_ascii=False) + "\\n\\n"',
        why: 'SSE olayını boş satır bitirir; tek \\n ile olaylar birbirine yapışır.' }
    ] }
);
})(window);
