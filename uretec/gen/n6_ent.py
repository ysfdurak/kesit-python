from n6lib import *

SHEET = r'''class SahteSheet:
    """gspread Worksheet'in küçük bir taklidi: hücre değerleri her zaman METİN döner."""
    def __init__(self, satirlar):
        self._v = [[str(h) for h in s] for s in satirlar]
        self.cagri = 0                      # API çağrısı sayacı (kota!)

    def get_all_values(self):
        self.cagri += 1
        return [list(s) for s in self._v]

    def update_row(self, satir_no, degerler):          # 1 tabanlı satır no
        self.cagri += 1
        self._v[satir_no - 1] = [str(d) for d in degerler]

    def append_row(self, degerler):
        self.cagri += 1
        self._v.append([str(d) for d in degerler])
'''

EPOSTA_GEN = r'''import csv
import io
import veri
from email.message import EmailMessage
from email import message_from_bytes, policy

txns = veri.kayitlar("ilgaz_bank", "bank_txns")


def rapor_epostasi(gun):
    tampon = io.StringIO()
    yazici = csv.writer(tampon)
    yazici.writerow(["txn_id", "amount", "channel"])
    for t in txns:
        if t["txn_time"].startswith(gun):
            yazici.writerow([t["txn_id"], t["amount"], t["channel"]])
    m = EmailMessage()
    m["From"] = "Kadıköy Şubesi <kadikoy@ilgazbank.example>"
    m["To"] = "operasyon@ilgazbank.example"
    m["Subject"] = f"Günlük işlem raporu {gun}"
    m.set_content("Merhaba,\nGünlük işlem dökümü ektedir.")
    m.add_attachment(tampon.getvalue().encode("utf-8"), maintype="text", subtype="csv",
                     filename=f"islemler_{gun}.csv")
    return m.as_bytes()
'''

body = '''<h2>Neden önemli? Verinin yaşadığı yerler</h2>
<p>Şirketlerde verinin önemli bir kısmı veritabanında değil, iş uygulamalarında yaşar: satış ekibinin hedef tablosu Google Sheets'te, bayilerin günlük raporu e-posta ekinde, alarmlar Teams ya da Slack kanalında, ödeme sağlayıcısının bildirimi bir webhook isteğinde. Otomasyon uzmanının işi bu adaları birbirine bağlamaktır: e-postadaki eki okuyup tabloya yazmak, tabloda bir değer değişince kanala haber vermek, dış sistemden gelen bildirime güvenip güvenmeyeceğine karar vermek.</p>
<p><b>http-api</b> dersinde REST istemcisi yazmayı, <b>yapilandirma</b> dersinde sırları ortam değişkeninde tutmayı, <b>api-web</b> dersinde webhook imzasını gördün. Burada bunları gerçek iş uygulamalarına uyguluyoruz. Tarayıcıda ağ olmadığı için gspread, imaplib ve Microsoft Graph kodlarını <code>&lt;pre class="code"&gt;</code> kutularında göreceksin; alıştırmalarda ise <b>sahte istemcilerle</b> (fake client) çalışacaksın. E-posta ayrıştırma (<code>email</code> modülü) ve imza doğrulama (<code>hmac</code>) ise standart kütüphanede olduğu için tarayıcıda gerçekten çalışır.</p>

<h2>Entegrasyon kalıpları: çekme mi, itme mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Çekme (polling)</th><th>İtme (webhook)</th></tr>
<tr><td>Nasıl çalışır?</td><td>Sen belirli aralıkla "yeni bir şey var mı?" diye sorarsın</td><td>Karşı sistem olay olunca senin adresine HTTP isteği gönderir</td></tr>
<tr><td>Gecikme</td><td>Aralık kadar (ör. 5 dakika)</td><td>Saniyeler</td></tr>
<tr><td>Altyapı</td><td>Zamanlanmış betik yeter, dışarıya açık adres gerekmez</td><td>İnternetten erişilebilen HTTPS uç noktası gerekir</td></tr>
<tr><td>Maliyet</td><td>Boş sorgular API kotası yer</td><td>Yalnız olay olunca istek gelir</td></tr>
<tr><td>Riskler</td><td>İmleç (cursor) hatası: kaçırma ya da tekrar</td><td>Sahte istek, tekrar gönderim, kaçan bildirim</td></tr>
<tr><td>Ne zaman?</td><td>Webhook sunmayan sistemler, ofis betikleri</td><td>Ödeme, form, depo ve CRM olayları</td></tr>
</table></div>
<p>Polling'in kalbi <b>imleç</b>tir: "en son nereye kadar okudum?" bilgisini (son <code>updated_at</code> ya da son kimlik) saklar ve bir sonraki sorguda yalnız ondan sonrasını istersin. Aşağıda Anadolu Market'in fiyat değişikliği tablosunu (<code>price_updates</code>) sayfa sayfa dönen sahte bir API'den çekiyoruz:</p>
'''
body += PY(r'''
import veri

guncellemeler = sorted(veri.kayitlar("anadolu_market", "price_updates"), key=lambda r: r["updated_at"])


def sahte_api(since, limit=5):
    """GET /price-updates?since=...&limit=... taklidi"""
    return [r for r in guncellemeler if r["updated_at"] > since][:limit]


imlec = "2024-11-01 00:00:00"          # bir önceki çalıştırmadan kalan
yeni = []
while sayfa := sahte_api(imlec):
    yeni.extend(sayfa)
    imlec = sayfa[-1]["updated_at"]    # imleci ilerlet
print(len(yeni), "yeni güncelleme, yeni imleç:", imlec)
''')
body += '''<h2>Google Sheets: gspread ve servis hesabı</h2>
<p>Sheets'e betikten erişmenin en temiz yolu bir <b>servis hesabı</b>dır (service account): Google Cloud'da bir "robot kullanıcı" açarsın, JSON anahtarını indirirsin ve tabloyu robotun e-posta adresiyle paylaşırsın. Kişisel hesabınla OAuth yapmaktan farkı, betiğin senin oturumuna bağlı olmamasıdır.</p>
'''
body += CODE(r'''
# pip install gspread
import gspread

gc = gspread.service_account(filename="/etc/gizli/sheets-robot.json")   # repoya KOYMA
ws = gc.open_by_key("1AbC...xyz").worksheet("Bayi Satış")

satirlar = ws.get_all_values()              # her hücre METİN döner
ws.update("B5:D5", [["İzmir", "2024-01-07", 0]])
ws.append_row(["Yeni Bayi", "Bursa", "2024-01-08", 2040])
ws.batch_update([{"range": "D2:D4", "values": [[1250.5], [980], [0]]}])   # tek çağrıda çok aralık
''')
body += '''<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install gspread</code>; Google Cloud Console'da proje aç, "Google Sheets API"yi etkinleştir, servis hesabı oluşturup JSON anahtar indir, tabloyu servis hesabının e-postasıyla "Düzenleyici" olarak paylaş. Anahtar dosyasının yolunu ortam değişkeninden oku (<code>os.environ["SHEETS_ANAHTAR"]</code>) ve <code>.gitignore</code>'a ekle.</div>
<p>Sheets'e yazan betik <b>idempotent</b> olmalıdır: iki kez çalışınca satırlar ikiye katlanmamalı. Bunun yolu "varsa güncelle, yoksa ekle" (upsert) mantığıdır. Sheets API'nin dakikalık kota sınırı olduğu için satır satır okumak yerine tabloyu <b>bir kez</b> okuyup bellekte anahtar → satır numarası haritası kurarsın:</p>
'''
body += PY(SHEET + r'''

ws = SahteSheet([["Bayi", "Şehir", "Tutar"], ["Merkez Bayi", "İstanbul", 1250.5], ["Kızılay Bayi", "Ankara", 980]])


def upsert(ws, satir):
    tum = ws.get_all_values()
    konum = {s[0]: i + 1 for i, s in enumerate(tum)}     # anahtar -> 1 tabanlı satır no
    if satir[0] in konum:
        if tum[konum[satir[0]] - 1] != [str(d) for d in satir]:
            ws.update_row(konum[satir[0]], satir)
    else:
        ws.append_row(satir)


for _ in range(2):                                        # iki kez çalıştır
    upsert(ws, ["Kızılay Bayi", "Ankara", 2410])
    upsert(ws, ["Nilüfer Bayi", "Bursa", 2040])
print(ws.get_all_values())
print("API çağrısı:", ws.cagri)
''')
body += '''<div class="warn"><b>Sheets her şeyi metin döndürür</b><code>get_all_values()</code> sayıları da <code>"980"</code> olarak verir. Anahtarı sayı olan bir tabloda <code>satir[0] == 101</code> karşılaştırması hiç tutmaz ve betik her çalıştırmada aynı satırı yeniden ekler. Karşılaştırmadan önce iki tarafı da aynı türe çevir.</div>

<h2>E-posta okuma: imaplib ve email modülü</h2>
<p>Bayiler, bankalar ve tedarikçiler raporlarını hâlâ çoğunlukla e-posta ekiyle gönderir. <b>IMAP</b> ile posta kutusuna bağlanır, ölçüte göre arar (<code>UNSEEN FROM "..." SINCE 01-Oct-2024</code>), iletiyi ham bayt olarak indirirsin. Gerisini, yani başlıkları, gövdeyi ve ekleri ayrıştırmayı standart kütüphanenin <code>email</code> modülü yapar.</p>
'''
body += CODE(r'''
import imaplib, os
from email import message_from_bytes, policy

with imaplib.IMAP4_SSL("imap.gmail.com") as imap:
    imap.login(os.environ["MAIL_KULLANICI"], os.environ["MAIL_UYGULAMA_SIFRESI"])
    imap.select("INBOX")
    durum, veri = imap.search(None, '(UNSEEN FROM "kadikoy@ilgazbank.example" SINCE 01-Oct-2024)')
    for num in veri[0].split():
        durum, parca = imap.fetch(num, "(RFC822)")
        ileti = message_from_bytes(parca[0][1], policy=policy.default)
        for ek in ileti.iter_attachments():
            if ek.get_filename().endswith(".csv"):
                isle(ek.get_content())                     # metin ya da bayt
        imap.store(num, "+FLAGS", "\\Seen")               # işlendi olarak işaretle
''')
body += '<p>Aşağıdaki kod Ilgaz Bank\'ın 15 Mart 2024 işlemlerinden ekli bir CSV içeren gerçek bir e-posta üretiyor, bayta çeviriyor (IMAP\'ten böyle gelir) ve geri ayrıştırıyor:</p>\n'
body += PY(EPOSTA_GEN + r'''

ham = rapor_epostasi("2024-03-15")
ileti = message_from_bytes(ham, policy=policy.default)
print("Konu  :", ileti["subject"])
print("Kimden:", ileti["from"].addresses[0].display_name)
print("Gövde :", ileti.get_body(("plain",)).get_content().splitlines()[1])
for ek in ileti.iter_attachments():
    satirlar = list(csv.DictReader(io.StringIO(ek.get_content())))
    print("Ek    :", ek.get_filename(), len(satirlar), "satır")
''')
body += '''<div class="tip"><b>policy.default kullan</b><code>message_from_bytes(ham)</code> eski (compat32) politikayla çalışır: Türkçe konu <code>=?utf-8?b?...?=</code> biçiminde kodlu kalır ve <code>get_body</code>, <code>iter_attachments</code> gibi modern metotlar yoktur. <code>policy=policy.default</code> başlıkları çözer ve ekleri kolayca gezmeni sağlar.</div>

<h2>Microsoft Graph, Teams ve Slack</h2>
<p>Microsoft 365 kullanan şirketlerde Outlook postası, Teams ve OneDrive'a <b>Microsoft Graph</b> API'siyle erişilir. Kimlik doğrulama Azure'da kayıtlı bir uygulama ve <b>MSAL</b> kütüphanesiyle yapılır. Yalnız bir kanala mesaj atmak istiyorsan daha basit yol <b>gelen webhook</b>'tur (Teams'te Workflows/Power Automate ile, Slack'te "Incoming Webhook" uygulamasıyla oluşturulur): sana gizli bir URL verilir, o adrese JSON göndermek yeter.</p>
'''
body += CODE(r'''
# pip install msal requests
import msal, requests, os
app = msal.ConfidentialClientApplication(os.environ["AZ_CLIENT_ID"],
        authority=f"https://login.microsoftonline.com/{os.environ['AZ_TENANT']}",
        client_credential=os.environ["AZ_SECRET"])
token = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])["access_token"]
r = requests.get("https://graph.microsoft.com/v1.0/users/rapor@lezzetkurye.example/messages"
                 "?$filter=hasAttachments eq true&$top=10",
                 headers={"Authorization": f"Bearer {token}"}, timeout=10)

# Slack ve Teams gelen webhook: URL bir sırdır, ortam değişkeninde dursun
requests.post(os.environ["SLACK_WEBHOOK_URL"], json=yuk, timeout=10).raise_for_status()
requests.post(os.environ["TEAMS_WEBHOOK_URL"], json=kart, timeout=10).raise_for_status()
''')
body += '<p>Webhook\'un istediği tek şey doğru biçimde bir JSON yüküdür (payload). Slack\'te <b>Block Kit</b>, Teams\'te <b>Adaptive Card</b> kullanılır. Yükü bir fonksiyonla üretmek onu test edilebilir yapar. Lezzet Kurye\'nin 31 Aralık 2024 sipariş özetini Slack bloğuna çeviriyoruz:</p>\n'
body += PY(r'''
import json
from collections import Counter
import veri

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
gun = [s for s in siparisler if s["placed_at"].startswith("2024-12-31")]
durum = Counter(s["status"] for s in gun)

yuk = {
    "text": f"31.12.2024 özeti: {len(gun)} sipariş",          # bildirim önizlemesi
    "blocks": [
        {"type": "header", "text": {"type": "plain_text", "text": "Lezzet Kurye günlük özet"}},
        {"type": "section", "fields": [
            {"type": "mrkdwn", "text": f"*Teslim*\n{durum['teslim']}"},
            {"type": "mrkdwn", "text": f"*İptal*\n{durum['iptal']}"},
            {"type": "mrkdwn", "text": f"*İade*\n{durum['iade']}"},
        ]},
    ],
}
print(json.dumps(yuk, ensure_ascii=False, indent=1)[:260])
''')
body += '''<h2>Gelen webhook'u doğrulamak: HMAC imzası</h2>
<p>Webhook adresin internete açıktır; herkes oraya "ödeme alındı" diye istek atabilir. Bu yüzden sağlayıcılar (Stripe, GitHub, Slack, iyzico) isteği ortak bir gizli anahtarla <b>HMAC-SHA256</b> ile imzalar ve imzayı bir başlıkta gönderir. Alıcı aynı imzayı <b>ham gövde baytları</b> üzerinden yeniden hesaplar ve <code>hmac.compare_digest</code> ile karşılaştırır. Slack ve Stripe imzaya zaman damgasını da katar; 5 dakikadan eski istekler reddedilerek <b>tekrar saldırısı</b> (replay) önlenir.</p>
'''
body += PY(r'''
import hashlib
import hmac
import json

GIZLI = b"whsec_lezzet_test"              # gerçekte ortam değişkeninden
govde = b'{"event_id": "ev_101", "type": "siparis.teslim", "order_id": 2}'
imza = "sha256=" + hmac.new(GIZLI, govde, hashlib.sha256).hexdigest()


def dogrula(govde, imza_basligi, gizli):
    beklenen = "sha256=" + hmac.new(gizli, govde, hashlib.sha256).hexdigest()
    return hmac.compare_digest(beklenen, imza_basligi)


print(dogrula(govde, imza, GIZLI))
print(dogrula(govde.replace(b"2}", b"9}"), imza, GIZLI))        # gövde değiştirildi
print(dogrula(json.dumps(json.loads(govde)).encode(), imza, GIZLI))
''')
body += '''<p>Üçüncü satır neden <code>False</code>? Gövdeyi JSON olarak ayrıştırıp yeniden yazmak boşlukları ve anahtar sırasını değiştirebilir; imza <b>bayt bayt</b> aynı metin üzerinden hesaplanmalıdır. FastAPI'de ham gövdeyi <code>await request.body()</code> ile alırsın:</p>
'''
body += CODE(r'''
from fastapi import FastAPI, Request, Header, HTTPException
app = FastAPI()

@app.post("/webhook/odeme")
async def odeme(request: Request, x_imza: str = Header(...)):
    govde = await request.body()                      # ham bayt, json() DEĞİL
    if not dogrula(govde, x_imza, GIZLI):
        raise HTTPException(401, "imza geçersiz")
    olay = json.loads(govde)
    if zaten_islendi(olay["event_id"]):               # sağlayıcı tekrar gönderebilir
        return {"durum": "tekrar"}
    kuyruga_ekle(olay)                                # ağır işi arka plana ver
    return {"durum": "alındı"}                        # hızlı 2xx dön, yoksa yeniden dener
''')
body += '''<h2>Sırlar, n8n ve Make</h2>
<p>Servis hesabı JSON'u, IMAP uygulama şifresi, webhook URL'leri ve imza anahtarları <b>sır</b>dır: koda, Git'e ve log'a girmez; ortam değişkeni ya da kasa (Azure Key Vault, AWS Secrets Manager) ile verilir, düzenli döndürülür (rotate) ve her entegrasyon için ayrı, en az yetkili anahtar kullanılır. OAuth'ta erişim belirteci (access token) kısa ömürlüdür; yenileme belirteci (refresh token) ise şifre kadar değerlidir.</p>
<p><b>n8n</b> ve <b>Make</b> gibi düşük kodlu araçlar tetikleyici, bağlayıcı ve zamanlama işini hazır sunar: "Gmail'e ek gelince Sheets'e yaz" akışı dakikalar içinde kurulur. Python'un rolü, bu akışın ortasındaki <b>zor adım</b>dır: karmaşık ayrıştırma, doğrulama, hesaplama, model çağrısı. n8n'de "Code" düğümü ya da senin yazdığın küçük bir HTTP servisi (webhook alıcısı) bu adımı üstlenir. İş bölümü kuralı: bağlantı ve tetikleme platformda, iş kuralı ve test edilebilir mantık Python'da.</p>
<div class="note"><b>Gerçek işte</b>Operasyon ekiplerinin en sık istediği entegrasyonlar şunlardır: bayi ya da şube raporu e-postalarındaki ekleri her sabah tabloya işlemek, stok veya fiyat değişince satış kanalına Teams/Slack bildirimi atmak, form ve ödeme webhook'larını CRM'e yazmak, haftalık özeti Sheets'ten alıp yönetime e-postalamak. Bu işlerde hata çoğu zaman koddan değil, tekrar eden çalıştırmadan (çift satır), kaçan imleçten ve sızan sırdan gelir.</div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Webhook alıcısının üç kuralı</h3>
<p>1) İmzayı ham gövdeyle ve sabit zamanlı karşılaştırmayla doğrula. 2) Olay kimliğiyle tekilleştir; sağlayıcılar zaman aşımında aynı olayı yeniden gönderir. 3) İsteğe hızlıca 2xx dön, ağır işi kuyruğa bırak; aksi hâlde sağlayıcı zaman aşımına düşüp yeniden dener ve yük katlanır.</p>
<h3>Polling'de imleç tuzakları</h3>
<p>Aynı zaman damgasına sahip iki kayıt sayfa sınırına denk gelirse <code>&gt;</code> ile ikincisini kaçırırsın, <code>&gt;=</code> ile ilkini tekrar alırsın. Sağlam çözüm bileşik imleçtir: <code>(updated_at, id)</code> çifti ve ona göre sıralama; tekrar gelenleri de idempotent yazma karşılar.</p>
<h3>Kota ve toplu yazma</h3>
<p>Sheets, Graph ve Slack hız sınırı uygular; 429 yanıtında <code>Retry-After</code> başlığına uy. Satır satır güncellemek yerine değişiklikleri biriktirip <code>batch_update</code> ile tek çağrıda yaz.</p>
</section>
'''

ex = []
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': "Bir tedarikçinin sistemi webhook sunmuyor, yalnız <code>GET /orders?since=...</code> uç noktası var. Siparişleri en fazla 10 dakika gecikmeyle almak istiyorsun. Doğru kalıp hangisi?",
    'o': ['10 dakikada bir çalışan betik; son updated_at imleç olarak saklanır', 'Bir webhook alıcısı yazıp tedarikçinin bize kendiliğinden istek göndermesini beklemek', 'Her çalıştırmada bütün siparişleri baştan çekip tabloya yeniden eklemek', 'Sorgu aralığını 1 saniyeye indirip imleç tutmadan hep son sayfayı okumak'],
    'a': 0,
    'why': "Webhook sunmayan sistemde çekme (polling) tek seçenektir. İmleç yalnız yeni kayıtları istemeni sağlar; bütün veriyi her seferinde çekmek kotayı yer ve tekrar yaratır, imleçsiz sık sorgu ise hem israf hem tekrar demektir."})
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': "Webhook imzasını doğrularken neden <code>beklenen == gelen</code> yerine <code>hmac.compare_digest(beklenen, gelen)</code> kullanılır?",
    'o': ['compare_digest onaltılık imzalardaki büyük-küçük harf farkını yok sayar', '== uzun metinlerde (64 karakterden fazla) karşılaştırma yaparken hata verir', 'Süresi ilk farklı karaktere bağlı değildir; zamanlama saldırısını önler', 'compare_digest imzayı ayrıca sha256 ile yeniden özetler'],
    'a': 2,
    'why': "== ilk farklı karakterde durur; saldırgan yanıt sürelerini ölçerek imzayı karakter karakter tahmin edebilir. compare_digest sabit zamanda karşılaştırır. Harf duyarlılığı ve yeniden özetleme yapmaz."})
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': "Sheets'e bayi satışlarını yazan betik zamanlayıcı yüzünden aynı sabah iki kez çalıştı ve satırlar ikiye katlandı. Kalıcı çözüm hangisi?",
    'o': ['Betiğin başına bekleme (sleep) koymak', 'Satırları her çalıştırmada append_row ile eklemeye devam edip haftada bir elle temizlemek', 'Anahtar sütununa göre upsert yapmak: varsa güncelle, yoksa ekle', 'Tabloyu her çalıştırmada tamamen silip baştan yazmak'],
    'a': 2,
    'why': "Upsert betiği idempotent yapar: kaç kez çalışırsa çalışsın sonuç aynıdır. Tamamen silip yazmak da tekrar etmez ama başkalarının elle eklediği sütunları ve biçimi siler, yazma sırasında tabloyu boş gösterir ve kotayı gereksiz harcar."})

ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'İki gövdenin imzası karşılaştırılıyor. Çıktı nedir?',
    'code': C(r'''
import hashlib
import hmac

k = b"gizli"
a = hmac.new(k, b'{"a":1}', hashlib.sha256).hexdigest()
b = hmac.new(k, b'{"a": 1}', hashlib.sha256).hexdigest()
print(len(a), a == b)
'''),
    'o': ['64 False', '32 False', '64 True', '256 False'],
    'a': 0,
    'why': "SHA-256 32 baytlık özet üretir; hexdigest her baytı iki onaltılık karakterle yazar: 64 karakter. Tek bir boşluk farkı bile bambaşka bir imza verir; bu yüzden imza ham gövde baytları üzerinden doğrulanır."})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'Kodlanmış Türkçe konu başlığı ayrıştırılıyor. Çıktı nedir?',
    'code': C(r'''
from email import message_from_string, policy

ham = "From: sube@banka.example\nSubject: =?utf-8?q?G=C3=BCnl=C3=BCk_rapor?=\n\nEk yok."
m1 = message_from_string(ham)
m2 = message_from_string(ham, policy=policy.default)
print(m2["subject"], m1["subject"] == m2["subject"])
'''),
    'o': ['Günlük rapor False', 'Günlük rapor True', '=?utf-8?q?G=C3=BCnl=C3=BCk_rapor?= False', 'Günlük_rapor False'],
    'a': 0,
    'why': "policy.default başlıktaki MIME kodlamasını (=?utf-8?q?...?=) çözer ve '_' karakterini boşluğa çevirir. Varsayılan eski politika (compat32) ise başlığı kodlu hâliyle bırakır; bu yüzden iki değer eşit değildir."})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'Slack yükü JSON\'a çevriliyor. Çıktı nedir?',
    'code': C(r'''
import json

yuk = {"text": "Çağrı"}
print(json.dumps(yuk), len(json.dumps(yuk, ensure_ascii=False)))
'''),
    'o': ['{"text": "\\u00c7a\\u011fr\\u0131"} 17', '{"text": "Çağrı"} 17', '{"text": "\\u00c7a\\u011fr\\u0131"} 35', '{"text": "Çağrı"} 35'],
    'a': 0,
    'why': "json.dumps varsayılan olarak ASCII dışı karakterleri \\uXXXX kaçışıyla yazar; Slack ikisini de doğru gösterir. ensure_ascii=False ile karakterler olduğu gibi kalır: {\"text\": \"Çağrı\"} 17 karakterdir."})
ex.append({'t': 'order', 'stage': 'Kodu oku',
    'q': '<p>CSV ekli bir e-posta oluşturup bayta çeviren ve IMAP\'ten gelmiş gibi geri ayrıştıran programın satırlarını sırala.</p>',
    'lines': ['import email.message, email.policy',
              'm = email.message.EmailMessage()',
              'm.set_content("Ek ektedir.")',
              'm.add_attachment(b"sube,tutar\\n1,250\\n", maintype="text", subtype="csv", filename="rapor.csv")',
              'ham = m.as_bytes()',
              'geri = email.message_from_bytes(ham, policy=email.policy.default)',
              'print(geri.get_body(("plain",)).get_content().strip(), [p.get_filename() for p in geri.iter_attachments()])'],
    'expect': "Ek ektedir. ['rapor.csv']\n",
    'hint': 'Gövde, ekten önce ayarlanır; bayta çevirme ekler eklendikten sonra yapılır.',
    'why': "set_content tek parçalı gövde kurar; add_attachment iletiyi multipart/mixed'e çevirip eki ekler. Sıra ters olsaydı set_content ekleri silerdi. as_bytes iletinin ağdaki (IMAP) hâlidir."})

# Rehberli
ex.append({'t': 'code', 'id': 'entegrasyon-saas-1', 'stage': 'Rehberli', 'diff': 2,
    'q': "<p><code>SahteSheet</code>, gspread çalışma sayfasını taklit ediyor (değerleri her zaman metin döndürür, API çağrılarını sayar). <code>upsert_satirlar(ws, satirlar)</code> fonksiyonunu yaz: tabloyu <b>bir kez</b> oku, ilk sütunu anahtar kabul et; her yeni satır için anahtar tabloda varsa ve içerik farklıysa <code>update_row</code>, yoksa <code>append_row</code> çağır, içerik aynıysa hiçbir şey yapma. Dönüş: <code>{\"eklenen\": n, \"guncellenen\": n, \"ayni\": n}</code>.</p>",
    'guide': ["<code>ws.get_all_values()</code> ile tabloyu tek seferde al.", "Anahtar → (1 tabanlı satır no, satırın metin hâli) sözlüğü kur.", "Her yeni satırı önce metne çevir (<code>[str(d) for d in satir]</code>), sonra karşılaştır.", "Yeni eklenen satırı da sözlüğe kaydet ki aynı listede tekrar gelirse ikinci kez eklenmesin."],
    'example': C(r'''
envanter = {"elma": 5, "armut": 2}
for urun, adet in [("armut", 2), ("kiraz", 7), ("elma", 9)]:
    if urun not in envanter:
        print("ekle", urun)
    elif envanter[urun] != adet:
        print("güncelle", urun)
    envanter[urun] = adet
'''),
    'start': C(SHEET + r'''


def upsert_satirlar(ws, satirlar):
    sayac = {"eklenen": 0, "guncellenen": 0, "ayni": 0}
    tum = ws.get_all_values()
    konum = {}     # TODO 1: anahtar -> (satır no, satır)
    for satir in satirlar:
        metin = [str(d) for d in satir]
        # TODO 2: ekle / güncelle / aynı
    return sayac
'''),
    'sol': C(SHEET + r'''


def upsert_satirlar(ws, satirlar):
    sayac = {"eklenen": 0, "guncellenen": 0, "ayni": 0}
    tum = ws.get_all_values()
    konum = {s[0]: (i + 1, s) for i, s in enumerate(tum)}
    for satir in satirlar:
        metin = [str(d) for d in satir]
        if metin[0] not in konum:
            ws.append_row(metin)
            konum[metin[0]] = (len(konum) + 1, metin)
            sayac["eklenen"] += 1
        elif konum[metin[0]][1] != metin:
            no = konum[metin[0]][0]
            ws.update_row(no, metin)
            konum[metin[0]] = (no, metin)
            sayac["guncellenen"] += 1
        else:
            sayac["ayni"] += 1
    return sayac


ws = SahteSheet([["Bayi", "Şehir", "Tutar"], ["Merkez Bayi", "İstanbul", 1250.5]])
print(upsert_satirlar(ws, [["Merkez Bayi", "İstanbul", 1250.5], ["Kızılay Bayi", "Ankara", 2410.0]]))
print(ws.get_all_values())
'''),
    'tests': C(r'''
ws = SahteSheet([["Bayi", "Şehir", "Tutar"], ["Merkez Bayi", "İstanbul", 1250.5], ["Kızılay Bayi", "Ankara", 980]])
yeni = [["Merkez Bayi", "İstanbul", 1250.5], ["Kızılay Bayi", "Ankara", 2410.0], ["Nilüfer Bayi", "Bursa", 2040.0]]
r = upsert_satirlar(ws, yeni)
assert r == {"eklenen": 1, "guncellenen": 1, "ayni": 1}, "İlk çalıştırma: 1 ekleme, 1 güncelleme, 1 aynı; gelen " + str(r)
ws.cagri = 0
r2 = upsert_satirlar(ws, yeni)
assert r2 == {"eklenen": 0, "guncellenen": 0, "ayni": 3}, "İkinci çalıştırma hiçbir şey değiştirmemeli (idempotent)"
assert ws.cagri == 1, "İkinci çalıştırmada yalnız 1 okuma çağrısı olmalı; gelen " + str(ws.cagri)
assert len(ws.get_all_values()) == 4, "Tabloda başlık + 3 satır olmalı"
ws2 = SahteSheet([["Bayi"]])
assert upsert_satirlar(ws2, [["X", 1], ["X", 1]])["eklenen"] == 1, "Aynı listede tekrar eden anahtar ikinci kez eklenmemeli"
'''),
    'hints': ["Sözlük üreteci: <code>{s[0]: (i + 1, s) for i, s in enumerate(tum)}</code> (satır numaraları 1 tabanlı).", "Sheets metin döndürdüğü için karşılaştırmayı metin listeleriyle yap.", "Ekledikten sonra <code>konum</code> sözlüğünü güncelle."],
    'why': "Tek okuma + bellekte harita, kotayı korur ve betiği idempotent yapar. Gerçek gspread'de satır güncellemesi <code>ws.update(f\"A{no}\", [metin])</code> ile yapılır; çok değişiklik varsa hepsi tek <code>batch_update</code> çağrısında gönderilir."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-2', 'stage': 'Rehberli', 'diff': 2,
    'q': "<p>Başlangıç kodu, Ilgaz Bank Kadıköy şubesinin gönderdiği günlük rapor e-postasını (ekinde <code>bank_txns</code> verisinden o günün işlemleri CSV olarak) <b>ham bayt</b> hâlinde üretiyor; IMAP'ten de böyle gelir. <code>eposta_ozet(ham)</code> fonksiyonunu yaz; şu sözlüğü döndürsün:</p><ul><li><code>konu</code>: Subject</li><li><code>gonderen</code>: gönderenin e-posta adresi (yalnız adres)</li><li><code>ekler</code>: ek dosya adları listesi</li><li><code>satir</code>: CSV ekindeki veri satırı sayısı</li><li><code>toplam</code>: <code>amount</code> sütununun toplamı (2 basamak)</li></ul>",
    'guide': ["<code>message_from_bytes(ham, policy=policy.default)</code> ile ayrıştır.", "Gönderen adresi: <code>ileti[\"from\"].addresses[0].addr_spec</code>.", "<code>ileti.iter_attachments()</code> ile ekleri gez; <code>get_filename()</code> ve <code>get_content()</code> kullan.", "CSV metnini <code>csv.DictReader(io.StringIO(...))</code> ile oku, satırları say ve tutarları topla."],
    'example': C(r'''
from email.message import EmailMessage
from email import message_from_bytes, policy
m = EmailMessage()
m["From"] = "Depo <depo@market.example>"
m["Subject"] = "Stok"
m.set_content("ekte")
m.add_attachment(b"x\n1\n", maintype="text", subtype="csv", filename="stok.csv")
g = message_from_bytes(m.as_bytes(), policy=policy.default)
print(g["from"].addresses[0].addr_spec, [e.get_filename() for e in g.iter_attachments()])
'''),
    'start': C(EPOSTA_GEN + r'''

ham = rapor_epostasi("2024-03-15")


def eposta_ozet(ham):
    ileti = message_from_bytes(ham, policy=policy.default)
    ozet = {"konu": ileti["subject"], "gonderen": None, "ekler": [], "satir": 0, "toplam": 0.0}
    # TODO 1: gönderen adresini al
    # TODO 2: ekleri gez; adları topla, CSV satırlarını say ve tutarları topla
    return ozet
'''),
    'sol': C(EPOSTA_GEN + r'''

ham = rapor_epostasi("2024-03-15")


def eposta_ozet(ham):
    ileti = message_from_bytes(ham, policy=policy.default)
    ozet = {"konu": ileti["subject"], "gonderen": ileti["from"].addresses[0].addr_spec,
            "ekler": [], "satir": 0, "toplam": 0.0}
    for ek in ileti.iter_attachments():
        ozet["ekler"].append(ek.get_filename())
        if ek.get_filename().endswith(".csv"):
            satirlar = list(csv.DictReader(io.StringIO(ek.get_content())))
            ozet["satir"] += len(satirlar)
            ozet["toplam"] += sum(float(s["amount"]) for s in satirlar)
    ozet["toplam"] = round(ozet["toplam"], 2)
    return ozet


print(eposta_ozet(ham))
'''),
    'tests': 'r = eposta_ozet(ham)\nassert r == {"konu": "Günlük işlem raporu 2024-03-15", "gonderen": "kadikoy@ilgazbank.example", "ekler": ["islemler_2024-03-15.csv"], "satir": 151, "toplam": 77044.94}, "Özet tutmuyor: " + str(r)\nr2 = eposta_ozet(rapor_epostasi("2024-03-14"))\nassert (r2["satir"], r2["toplam"]) == (129, -20446.46), "14 Mart: 129 satır, -20446.46; gelen " + str((r2["satir"], r2["toplam"]))\n',
    'hints': ["Adres nesnesi: <code>ileti[\"from\"].addresses[0]</code>; <code>.addr_spec</code> yalnız adresi, <code>.display_name</code> görünen adı verir.", "text/csv ekin <code>get_content()</code>'i metin (str) döndürür.", "Tutarlar CSV'den metin gelir: <code>float(s[\"amount\"])</code>."],
    'why': "IMAP yalnız ham baytı getirir; başlık çözme, MIME parçalarını gezme ve ek kodlamasını (base64) açma işi email modülündedir. Aynı fonksiyon, gerçek posta kutusundan gelen iletiyle değişmeden çalışır: test edilebilir entegrasyonun sırrı ağ kısmını incecik tutmaktır."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-3', 'stage': 'Rehberli', 'diff': 1,
    'q': "<p>Lezzet Kurye'nin günlük özetini Slack'e göndermek için Block Kit yükü üret. <code>slack_yuku(siparisler, gun)</code>: <code>placed_at</code>'i <code>gun</code> (<code>\"2024-12-31\"</code>) ile başlayan siparişleri durumlarına göre say ve şu yapıyı döndürsün:</p><pre class=\"out\">{\"text\": \"2024-12-31 özeti: 74 sipariş\",\n \"blocks\": [\n   {\"type\": \"header\", \"text\": {\"type\": \"plain_text\", \"text\": \"Lezzet Kurye günlük özet\"}},\n   {\"type\": \"section\", \"fields\": [\n      {\"type\": \"mrkdwn\", \"text\": \"*teslim*\\n65\"}, ... ]}]}</pre><p><code>fields</code> listesinde her durum için bir alan olsun; durumlar adede göre azalan sırada. O gün sipariş yoksa <code>None</code> döndür (boş bildirim gönderilmez).</p>",
    'guide': ["Güne ait siparişleri süz; boşsa <code>None</code> döndür.", "<code>Counter</code> ile durumları say, <code>most_common()</code> azalan sıra verir.", "Her durum için <code>{\"type\": \"mrkdwn\", \"text\": f\"*{durum}*\\n{adet}\"}</code> alanı üret.", "Başlık bloğu ve bölüm bloğunu <code>blocks</code> listesine koy."],
    'example': C(r'''
from collections import Counter
sayim = Counter(["acik", "kapali", "acik"])
alanlar = [{"type": "mrkdwn", "text": f"*{k}*\n{v}"} for k, v in sayim.most_common()]
print(alanlar)
'''),
    'start': C(r'''
from collections import Counter
import veri

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")


def slack_yuku(siparisler, gun):
    secili = [s for s in siparisler if s["placed_at"].startswith(gun)]
    # TODO 1: boşsa None
    # TODO 2: durumları say ve alanları üret
    alanlar = []
    return {"text": f"{gun} özeti: {len(secili)} sipariş",
            "blocks": []}   # TODO 3: header + section
'''),
    'sol': C(r'''
from collections import Counter
import veri

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")


def slack_yuku(siparisler, gun):
    secili = [s for s in siparisler if s["placed_at"].startswith(gun)]
    if not secili:
        return None
    alanlar = [{"type": "mrkdwn", "text": f"*{d}*\n{n}"}
               for d, n in Counter(s["status"] for s in secili).most_common()]
    return {"text": f"{gun} özeti: {len(secili)} sipariş",
            "blocks": [{"type": "header", "text": {"type": "plain_text", "text": "Lezzet Kurye günlük özet"}},
                       {"type": "section", "fields": alanlar}]}


import json
print(json.dumps(slack_yuku(siparisler, "2024-12-31"), ensure_ascii=False))
'''),
    'tests': C(r'''
y = slack_yuku(siparisler, "2024-12-31")
assert y["text"] == "2024-12-31 özeti: 74 sipariş", "Önizleme metni tutmuyor: " + str(y.get("text"))
assert y["blocks"][0] == {"type": "header", "text": {"type": "plain_text", "text": "Lezzet Kurye günlük özet"}}, "İlk blok başlık olmalı"
assert y["blocks"][1]["type"] == "section", "İkinci blok section olmalı"
assert [f["text"] for f in y["blocks"][1]["fields"]] == ["*teslim*\n65", "*iade*\n5", "*iptal*\n4"], "Alanlar adede göre azalan: teslim 65, iade 5, iptal 4"
assert slack_yuku(siparisler, "2023-01-01") is None, "Siparişsiz günde None dönmeli"
import json
json.dumps(y)
'''),
    'hints': ["<code>Counter(...).most_common()</code> (adet, azalan) sırasıyla demet verir.", "Section bloğu: <code>{\"type\": \"section\", \"fields\": alanlar}</code>."],
    'why': "Yükü saf bir fonksiyonla üretmek, Slack'e hiç bağlanmadan test edebilmeni sağlar; gönderme işi tek satırlık <code>requests.post(url, json=yuk)</code> olarak kalır. <code>text</code> alanı mobil bildirim önizlemesinde ve blokları göstermeyen istemcilerde kullanılır; Slack onu boş bırakmamanı önerir."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-4', 'stage': 'Rehberli', 'diff': 2,
    'q': "<p>Ödeme sağlayıcısı webhook'u <code>X-Imza: sha256=&lt;hex&gt;</code> başlığıyla gönderiyor. <code>imza_dogrula(govde, imza_basligi, gizli)</code> fonksiyonunu yaz: <code>govde</code> ve <code>gizli</code> bayt; başlık <code>sha256=</code> ile başlamıyorsa <code>False</code>; değilse HMAC-SHA256'yı hesaplayıp <code>hmac.compare_digest</code> ile karşılaştırsın.</p>",
    'guide': ["Başlığın önekini <code>startswith(\"sha256=\")</code> ile denetle.", "<code>hmac.new(gizli, govde, hashlib.sha256).hexdigest()</code> ile beklenen imzayı hesapla.", "Önekten sonraki kısımla <code>hmac.compare_digest</code> kullanarak karşılaştır."],
    'example': C(r'''
import hashlib, hmac
anahtar = b"k"
mesaj = b"merhaba"
etiket = hmac.new(anahtar, mesaj, hashlib.sha256).hexdigest()
print(hmac.compare_digest(etiket, hmac.new(anahtar, mesaj, hashlib.sha256).hexdigest()))
'''),
    'start': C(r'''
import hashlib
import hmac

GIZLI = b"whsec_lezzet_test"


def imza_dogrula(govde, imza_basligi, gizli):
    # TODO 1: önek kontrolü
    # TODO 2: beklenen imzayı hesapla ve sabit zamanlı karşılaştır
    return True
'''),
    'sol': C(r'''
import hashlib
import hmac

GIZLI = b"whsec_lezzet_test"


def imza_dogrula(govde, imza_basligi, gizli):
    if not imza_basligi.startswith("sha256="):
        return False
    beklenen = hmac.new(gizli, govde, hashlib.sha256).hexdigest()
    return hmac.compare_digest(beklenen, imza_basligi[len("sha256="):])


g = b'{"event_id": "ev_101", "type": "odeme.basarili", "tutar": 730.0}'
print(imza_dogrula(g, "sha256=" + hmac.new(GIZLI, g, hashlib.sha256).hexdigest(), GIZLI))
'''),
    'tests': C(r'''
g = b'{"event_id": "ev_101", "type": "odeme.basarili", "tutar": 730.0}'
dogru = "sha256=" + hmac.new(GIZLI, g, hashlib.sha256).hexdigest()
assert imza_dogrula(g, dogru, GIZLI) is True, "Doğru imza kabul edilmeli"
assert imza_dogrula(g.replace(b"730.0", b"7300.0"), dogru, GIZLI) is False, "Gövde değiştirilmişse reddedilmeli"
assert imza_dogrula(g, dogru, b"baska_anahtar") is False, "Yanlış anahtarla reddedilmeli"
assert imza_dogrula(g, dogru[len("sha256="):], GIZLI) is False, "Öneksiz başlık reddedilmeli"
assert imza_dogrula(g, "sha256=", GIZLI) is False, "Boş imza reddedilmeli"
assert "compare_digest" in __source__, "Sabit zamanlı karşılaştırma (hmac.compare_digest) kullanılmalı"
'''),
    'hints': ["Önek: <code>imza_basligi[len(\"sha256=\"):]</code>.", "<code>hmac.new(anahtar, mesaj, hashlib.sha256)</code>: anahtar ve mesaj bayt olmalı."],
    'why': "İmza, isteğin gerçekten anahtarı bilen sağlayıcıdan geldiğini ve yolda değişmediğini kanıtlar. Önek denetimi algoritma karışıklığını önler (ör. ileride sha512 eklenirse). Gizli anahtar ortam değişkeninden okunur, koda yazılmaz."})

# Kendin yaz
ex.append({'t': 'code', 'id': 'entegrasyon-saas-5', 'stage': 'Kendin yaz', 'diff': 2,
    'q': "<p>Slack istekleri şöyle imzalanır: temel metin <code>\"v0:\" + zaman_damgasi + \":\" + govde</code>, imza <code>\"v0=\" + HMAC-SHA256(gizli, temel_metin).hexdigest()</code>. <code>slack_dogrula(govde, zaman, imza, gizli, simdi)</code> yaz: <code>govde</code> metin, <code>zaman</code> metin olarak Unix saniyesi, <code>simdi</code> tamsayı. Zaman damgası sayı değilse ya da <code>simdi</code>'den 300 saniyeden fazla farklıysa (geçmiş ya da gelecek) <code>False</code>; aksi hâlde imzayı sabit zamanlı karşılaştırıp sonucu döndür.</p>",
    'start': C(r'''
import hashlib
import hmac


def slack_dogrula(govde, zaman, imza, gizli, simdi):
    pass
'''),
    'sol': C(r'''
import hashlib
import hmac


def slack_dogrula(govde, zaman, imza, gizli, simdi):
    if not zaman.isdigit() or abs(simdi - int(zaman)) > 300:
        return False
    temel = f"v0:{zaman}:{govde}".encode()
    beklenen = "v0=" + hmac.new(gizli, temel, hashlib.sha256).hexdigest()
    return hmac.compare_digest(beklenen, imza)


G = b"slack_gizli"
govde = "token=x&command=/ozet&text=bugun"
imza = "v0=" + hmac.new(G, f"v0:1735689600:{govde}".encode(), hashlib.sha256).hexdigest()
print(slack_dogrula(govde, "1735689600", imza, G, 1735689650))
'''),
    'tests': C(r'''
G = b"slack_gizli"
govde = "token=x&command=/ozet&text=bugun"
ts = "1735689600"
imza = "v0=" + hmac.new(G, f"v0:{ts}:{govde}".encode(), hashlib.sha256).hexdigest()
assert slack_dogrula(govde, ts, imza, G, 1735689650) is True, "50 sn sonra gelen doğru istek kabul edilmeli"
assert slack_dogrula(govde, ts, imza, G, 1735689600 + 300) is True, "Tam 300 sn sınırda kabul"
assert slack_dogrula(govde, ts, imza, G, 1735689600 + 301) is False, "301 sn eski istek reddedilmeli (replay)"
assert slack_dogrula(govde, ts, imza, G, 1735689600 - 400) is False, "Gelecekten gelen damga da reddedilmeli"
assert slack_dogrula(govde, "1735689601", imza, G, 1735689650) is False, "Zaman damgası değiştirilirse imza tutmamalı"
assert slack_dogrula(govde, "abc", imza, G, 1735689650) is False, "Sayı olmayan damga reddedilmeli"
'''),
    'hints': ["Önce zaman penceresini denetle: <code>abs(simdi - int(zaman)) &gt; 300</code>.", "Temel metni f-string ile kur ve <code>.encode()</code> ile bayta çevir."],
    'why': "Zaman damgasını imzaya katmak, ele geçirilen eski bir isteğin aynen tekrar gönderilmesini (replay) engeller: damga değişirse imza bozulur, değişmezse pencere dışında kalır. Stripe'ın <code>t=...,v1=...</code> biçimi de aynı fikirdir."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-6', 'stage': 'Kendin yaz', 'diff': 2,
    'q': "<p>Anadolu Market fiyat güncellemelerini (<code>price_updates</code>) polling ile çek. <code>FiyatAPI.sayfa(since, limit)</code> hazır: <code>updated_at</code>'i <code>since</code>'tan <b>büyük</b> kayıtları zamana göre sıralı, en çok <code>limit</code> tane döndürür ve çağrı sayısını tutar. <code>cek(api, imlec, limit)</code> yaz: boş sayfa gelene kadar sayfa sayfa çeksin, imleci her sayfanın son kaydına ilerletsin; <code>(kayitlar, yeni_imlec)</code> döndürsün. Ardından <code>fiyatlari_uygula(urunler, kayitlar)</code>: ürün sözlüklerinin listesine kayıtları sırayla uygulasın ve <code>{product_id: güncel_fiyat}</code> döndürsün (yalnız güncellenen ürünler; son güncelleme kazanır).</p>",
    'start': C(r'''
import veri


class FiyatAPI:
    def __init__(self):
        self.veri = sorted(veri.kayitlar("anadolu_market", "price_updates"), key=lambda r: r["updated_at"])
        self.cagri = 0

    def sayfa(self, since, limit):
        self.cagri += 1
        return [r for r in self.veri if r["updated_at"] > since][:limit]


urunler = veri.kayitlar("anadolu_market", "products")


def cek(api, imlec, limit):
    pass


def fiyatlari_uygula(urunler, kayitlar):
    pass
'''),
    'sol': C(r'''
import veri


class FiyatAPI:
    def __init__(self):
        self.veri = sorted(veri.kayitlar("anadolu_market", "price_updates"), key=lambda r: r["updated_at"])
        self.cagri = 0

    def sayfa(self, since, limit):
        self.cagri += 1
        return [r for r in self.veri if r["updated_at"] > since][:limit]


urunler = veri.kayitlar("anadolu_market", "products")


def cek(api, imlec, limit):
    kayitlar = []
    while sayfa := api.sayfa(imlec, limit):
        kayitlar.extend(sayfa)
        imlec = sayfa[-1]["updated_at"]
    return kayitlar, imlec


def fiyatlari_uygula(urunler, kayitlar):
    fiyat = {u["product_id"]: u["price"] for u in urunler}
    degisen = {}
    for k in kayitlar:
        fiyat[k["product_id"]] = k["new_price"]
        degisen[k["product_id"]] = k["new_price"]
    return degisen


api = FiyatAPI()
k, imlec = cek(api, "2024-11-01 00:00:00", 5)
print(len(k), imlec, api.cagri)
print(fiyatlari_uygula(urunler, k))
'''),
    'tests': 'api = FiyatAPI()\nk, imlec = cek(api, "2024-11-01 00:00:00", 5)\nassert len(k) == 10 and imlec == "2024-12-13 07:08:03", "1 Kasım sonrası 10 güncelleme ve imleç 2024-12-13 07:08:03 olmalı; gelen " + str((len(k), imlec))\nassert api.cagri == 3, "5\'erli sayfalarla 3 çağrı (5 + 5 + boş) yapılmalı; gelen " + str(api.cagri)\nk2, imlec2 = cek(api, imlec, 5)\nassert k2 == [] and imlec2 == imlec and api.cagri == 4, "İkinci çalıştırma tek boş çağrıyla bitmeli, imleç değişmemeli"\nhepsi, _ = cek(FiyatAPI(), "", 4)\nassert len(hepsi) == 18, "Baştan çekince 18 güncelleme gelmeli"\nf = fiyatlari_uygula(urunler, hepsi)\nassert f[30] == 16584.0 and f[31] == 508.0, "Son güncelleme kazanmalı: ürün 30 -> 16584.0, ürün 31 -> 508.0"\nassert len(f) == 16, "16 farklı ürün güncellendi"\nassert fiyatlari_uygula(urunler, k) == {16: 2415.0, 35: 400.0, 30: 16584.0, 13: 141.0, 25: 1872.0, 31: 508.0, 36: 2094.0, 6: 898.0, 14: 450.0}, "Kasım sonrası değişen fiyatlar tutmuyor"\n',
    'hints': ["Walrus kalıbı: <code>while sayfa := api.sayfa(imlec, limit):</code>", "İmleç = sayfanın son kaydının <code>updated_at</code>'i.", "Kayıtlar zamana göre sıralı geldiği için sırayla uygulamak 'son güncelleme kazanır' kuralını kendiliğinden sağlar."],
    'why': "İmleci saklayıp bir sonraki çalıştırmada kullanmak, yalnız yeni kayıtları çekmeyi sağlar: ikinci çalıştırma tek boş çağrıyla biter. Ürün 30 Kasım'da 17.536, Aralık'ta 16.584 TL oldu; sıra bozulursa eski fiyat kazanırdı."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-7', 'stage': 'Kendin yaz', 'diff': 2,
    'q': "<p>imaplib'in <code>search</code> metoduna verilecek ölçüt metnini üret. <code>imap_kriteri(kimden=None, konu=None, sonra=None, okunmamis=False)</code>:</p><ul><li><code>okunmamis</code> True ise <code>UNSEEN</code></li><li><code>kimden</code> varsa <code>FROM \"...\"</code></li><li><code>konu</code> varsa <code>SUBJECT \"...\"</code></li><li><code>sonra</code> bir <code>datetime.date</code> ise <code>SINCE 01-Oct-2024</code> biçimi (ay İngilizce üç harf, gün iki hane; yerel ayara bağlı <code>strftime(\"%b\")</code> kullanma)</li></ul><p>Parçalar bu sırayla, tek boşlukla ve parantez içinde birleşsin: <code>(UNSEEN FROM \"a@b\" SINCE 01-Oct-2024)</code>. Hiç ölçüt yoksa <code>\"ALL\"</code>. Değerlerdeki çift tırnak <code>\\\"</code> olarak kaçırılsın.</p>",
    'start': C(r'''
from datetime import date


def imap_kriteri(kimden=None, konu=None, sonra=None, okunmamis=False):
    pass
'''),
    'sol': C(r'''
from datetime import date

AYLAR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _tirnak(s):
    return '"' + s.replace('"', '\\"') + '"'


def imap_kriteri(kimden=None, konu=None, sonra=None, okunmamis=False):
    parcalar = []
    if okunmamis:
        parcalar.append("UNSEEN")
    if kimden:
        parcalar.append("FROM " + _tirnak(kimden))
    if konu:
        parcalar.append("SUBJECT " + _tirnak(konu))
    if sonra:
        parcalar.append(f"SINCE {sonra.day:02d}-{AYLAR[sonra.month - 1]}-{sonra.year}")
    return "(" + " ".join(parcalar) + ")" if parcalar else "ALL"


print(imap_kriteri("kadikoy@ilgazbank.example", sonra=date(2024, 10, 1), okunmamis=True))
'''),
    'tests': C(r'''
assert imap_kriteri("kadikoy@ilgazbank.example", sonra=date(2024, 10, 1), okunmamis=True) == '(UNSEEN FROM "kadikoy@ilgazbank.example" SINCE 01-Oct-2024)', "Örnek ölçüt tutmuyor"
assert imap_kriteri(konu="Günlük rapor") == '(SUBJECT "Günlük rapor")', "Yalnız konu"
assert imap_kriteri(sonra=date(2025, 3, 9)) == "(SINCE 09-Mar-2025)", "Gün iki haneli, ay İngilizce"
assert imap_kriteri() == "ALL", "Ölçüt yoksa ALL"
assert imap_kriteri(konu='Rapor "Mart"') == '(SUBJECT "Rapor \\"Mart\\"")', "Çift tırnak kaçırılmalı"
'''),
    'hints': ["Parçaları bir listede topla, sonda <code>\" \".join</code>.", "Ay adları için sabit bir liste kullan: <code>[\"Jan\", \"Feb\", ...]</code>; <code>%b</code> Türkçe yerel ayarda 'Eki' yazabilir.", "Kaçırma: <code>s.replace('\"', '\\\\\"')</code>."],
    'why': "IMAP tarih biçimi (RFC 3501) İngilizce ay kısaltması ister; Türkçe yerel ayarlı bir sunucuda strftime('%b') farklı sonuç verip aramayı sessizce boşaltır. Ölçütü saf bir fonksiyonla üretmek onu test edilebilir yapar. Türkçe konu araması için <code>imap.search(\"UTF-8\", ...)</code> ya da sunucu desteği gerekir."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-8', 'stage': 'Kendin yaz', 'diff': 2,
    'q': "<p>Ek işleme hattı. Başlangıç kodu şubeden gelen 4 e-postayı ham bayt olarak üretiyor: 13, 14 ve 15 Mart 2024'ün CSV ekli raporları (<code>bank_txns</code>'ten), bir de eki PDF olan bir ileti. <code>gunluk_toplamlar(epostalar)</code> yaz: yalnız <code>islemler_YYYY-MM-DD.csv</code> adındaki ekleri işle, tarihi dosya adından al ve <code>{tarih: (satir_sayisi, tutar_toplami)}</code> döndür (toplam 2 basamak). Aynı tarih iki kez gelirse (yeniden gönderim) ikinci kez sayma.</p>",
    'start': C(EPOSTA_GEN + r'''
import re

pdfli = EmailMessage()
pdfli["From"] = "kadikoy@ilgazbank.example"
pdfli["Subject"] = "Sözleşme"
pdfli.set_content("ekte")
pdfli.add_attachment(b"%PDF-1.4 ...", maintype="application", subtype="pdf", filename="sozlesme.pdf")
epostalar = [rapor_epostasi("2024-03-13"), pdfli.as_bytes(), rapor_epostasi("2024-03-14"),
             rapor_epostasi("2024-03-15"), rapor_epostasi("2024-03-14")]


def gunluk_toplamlar(epostalar):
    pass
'''),
    'sol': C(EPOSTA_GEN + r'''
import re

pdfli = EmailMessage()
pdfli["From"] = "kadikoy@ilgazbank.example"
pdfli["Subject"] = "Sözleşme"
pdfli.set_content("ekte")
pdfli.add_attachment(b"%PDF-1.4 ...", maintype="application", subtype="pdf", filename="sozlesme.pdf")
epostalar = [rapor_epostasi("2024-03-13"), pdfli.as_bytes(), rapor_epostasi("2024-03-14"),
             rapor_epostasi("2024-03-15"), rapor_epostasi("2024-03-14")]


def gunluk_toplamlar(epostalar):
    sonuc = {}
    for ham in epostalar:
        ileti = message_from_bytes(ham, policy=policy.default)
        for ek in ileti.iter_attachments():
            m = re.fullmatch(r"islemler_(\d{4}-\d{2}-\d{2})\.csv", ek.get_filename() or "")
            if not m or m.group(1) in sonuc:
                continue
            satirlar = list(csv.DictReader(io.StringIO(ek.get_content())))
            sonuc[m.group(1)] = (len(satirlar), round(sum(float(s["amount"]) for s in satirlar), 2))
    return sonuc


print(gunluk_toplamlar(epostalar))
'''),
    'tests': 'r = gunluk_toplamlar(epostalar)\nassert r == {"2024-03-13": (142, 98070.49), "2024-03-14": (129, -20446.46), "2024-03-15": (151, 77044.94)}, "Günlük toplamlar tutmuyor: " + str(r)\nassert gunluk_toplamlar([pdfli.as_bytes()]) == {}, "Yalnız PDF ekli iletide sonuç boş olmalı"\n',
    'hints': ["Dosya adını <code>re.fullmatch(r\"islemler_(\\d{4}-\\d{2}-\\d{2})\\.csv\", ad)</code> ile denetle ve tarihi gruptan al.", "Tarih sözlükte zaten varsa <code>continue</code>.", "PDF eki eşleşmediği için kendiliğinden atlanır."],
    'why': "Ek işleme hattında dosya adı sözleşmesi (naming convention) hem filtre hem de anahtar olur. Şubeler raporu yeniden gönderdiğinde aynı günü iki kez saymamak için tarihle tekilleştirmek gerekir; üretimde işlenen ileti kimlikleri (Message-ID) ayrıca saklanır."})

# Hata avı
ex.append({'t': 'code', 'id': 'entegrasyon-saas-9', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
    'q': "<p>Webhook alıcısı, sağlayıcının imzasını doğru göndermesine rağmen bütün istekleri <code>401</code> ile reddediyor. Kod gövdeyi önce JSON'a çevirip sonra imzayı hesaplıyor ve imzaları <code>==</code> ile karşılaştırıyor. <b>Hataları bul ve düzelt</b>: <code>webhook_al(ham_govde, imza)</code> imzayı <b>ham baytlar</b> üzerinden ve sabit zamanlı karşılaştırmayla doğrulasın; geçerliyse <code>(200, olay_sozlugu)</code>, değilse <code>(401, None)</code> döndürsün.</p>",
    'start': C(r'''
import hashlib
import hmac
import json

GIZLI = b"whsec_lezzet_test"


def webhook_al(ham_govde, imza):
    olay = json.loads(ham_govde)
    yeniden = json.dumps(olay).encode()
    beklenen = hmac.new(GIZLI, yeniden, hashlib.sha256).hexdigest()
    if beklenen == imza:
        return 200, olay
    return 401, None


ham = b'{"event_id":"ev_7","type":"siparis.teslim","order_id":2}'
print(webhook_al(ham, hmac.new(GIZLI, ham, hashlib.sha256).hexdigest()))
'''),
    'sol': C(r'''
import hashlib
import hmac
import json

GIZLI = b"whsec_lezzet_test"


def webhook_al(ham_govde, imza):
    beklenen = hmac.new(GIZLI, ham_govde, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(beklenen, imza):
        return 401, None
    return 200, json.loads(ham_govde)


ham = b'{"event_id":"ev_7","type":"siparis.teslim","order_id":2}'
print(webhook_al(ham, hmac.new(GIZLI, ham, hashlib.sha256).hexdigest()))
'''),
    'tests': C(r'''
ham = b'{"event_id":"ev_7","type":"siparis.teslim","order_id":2}'
imza = hmac.new(GIZLI, ham, hashlib.sha256).hexdigest()
assert webhook_al(ham, imza) == (200, {"event_id": "ev_7", "type": "siparis.teslim", "order_id": 2}), "Doğru imzalı ham gövde kabul edilmeli"
assert webhook_al(ham.replace(b"2}", b"3}"), imza) == (401, None), "Değiştirilmiş gövde reddedilmeli"
assert webhook_al(b'{"a": 1,  "b": 2}', hmac.new(GIZLI, b'{"a": 1,  "b": 2}', hashlib.sha256).hexdigest())[0] == 200, "Boşluklu gövde de ham hâliyle doğrulanmalı"
assert "compare_digest" in __source__, "hmac.compare_digest kullanılmalı"
'''),
    'hints': ["Sağlayıcı imzayı hangi metin üzerinden hesapladı? json.dumps ayırıcıları ', ' ve ': ' kullanır.", "İmzayı <code>ham_govde</code> ile hesapla, JSON'a ancak doğrulamadan sonra çevir.", "<code>==</code> yerine <code>hmac.compare_digest</code>."],
    'why': "Gövdeyi ayrıştırıp yeniden yazmak boşlukları ve anahtar sırasını değiştirir; imza artık aynı bayt dizisini kapsamaz. Doğru sıra: ham baytla doğrula, sonra ayrıştır. Böylece doğrulanmamış veriyi hiç işlememiş olursun; == yerine compare_digest ise zamanlama saldırısına kapıyı kapatır."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-10', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
    'q': "<p>Her sabah çalışan stok senkronu, Sheets'teki ürün tablosuna aynı ürünleri <b>her gün yeniden ekliyor</b>; tablo şişmiş. Anahtar sütunu <code>product_id</code>. <b>Hatayı bul ve düzelt</b>: <code>stok_senkron(ws, urunler)</code> var olan ürünün stoğunu güncellesin, yalnız yeni ürünü eklesin; <code>(eklenen, guncellenen)</code> döndürsün.</p>",
    'start': C(SHEET + r'''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def stok_senkron(ws, urunler):
    tum = ws.get_all_values()
    konum = {s[0]: i + 1 for i, s in enumerate(tum)}
    eklenen = guncellenen = 0
    for u in urunler:
        satir = [u["product_id"], u["name"], u["stock"]]
        if u["product_id"] in konum:
            ws.update_row(konum[u["product_id"]], satir)
            guncellenen += 1
        else:
            ws.append_row(satir)
            eklenen += 1
    return eklenen, guncellenen


ws = SahteSheet([["product_id", "name", "stock"]])
print(stok_senkron(ws, urunler), stok_senkron(ws, urunler), len(ws.get_all_values()))
'''),
    'sol': C(SHEET + r'''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def stok_senkron(ws, urunler):
    tum = ws.get_all_values()
    konum = {s[0]: i + 1 for i, s in enumerate(tum)}
    eklenen = guncellenen = 0
    for u in urunler:
        satir = [u["product_id"], u["name"], u["stock"]]
        anahtar = str(u["product_id"])
        if anahtar in konum:
            ws.update_row(konum[anahtar], satir)
            guncellenen += 1
        else:
            ws.append_row(satir)
            konum[anahtar] = len(konum) + 1
            eklenen += 1
    return eklenen, guncellenen


ws = SahteSheet([["product_id", "name", "stock"]])
print(stok_senkron(ws, urunler), stok_senkron(ws, urunler), len(ws.get_all_values()))
'''),
    'tests': C(r'''
ws = SahteSheet([["product_id", "name", "stock"]])
assert stok_senkron(ws, urunler) == (40, 0), "İlk çalıştırmada 40 ürün eklenmeli"
assert stok_senkron(ws, urunler) == (0, 40), "İkinci çalıştırmada 40 ürün güncellenmeli, hiçbiri eklenmemeli"
assert len(ws.get_all_values()) == 41, "Tabloda başlık + 40 satır kalmalı; gelen " + str(len(ws.get_all_values()))
degisik = [dict(u, stock=0) if u["product_id"] == 1 else u for u in urunler]
stok_senkron(ws, degisik)
assert ws.get_all_values()[1] == ["1", "Kablosuz Kulaklık", "0"], "Ürün 1'in stoğu 0'a güncellenmeli"
'''),
    'hints': ["<code>get_all_values()</code> ne tür değerler döndürüyor? <code>u[\"product_id\"]</code> ne tür?", "Anahtarı karşılaştırmadan önce metne çevir: <code>str(u[\"product_id\"])</code>."],
    'why': "Sheets (ve CSV, e-posta, form gövdesi) her şeyi metin olarak verir; Python'da <code>1 == \"1\"</code> False'tur. Tür uyuşmazlığı hata fırlatmadığı için sessizce her gün yeni satır eklendi. Anahtar karşılaştırmalarında iki tarafı aynı türe normalize etmek ve ikinci çalıştırmanın hiçbir şey eklemediğini test etmek bu sınıf hatayı yakalar."})

# Meydan okuma
ex.append({'t': 'code', 'id': 'entegrasyon-saas-11', 'stage': 'Meydan okuma', 'diff': 3,
    'q': "<p>Çatısız bir webhook alıcısı yaz (FastAPI uç noktasının gövdesi gibi). <code>Alici(gizli)</code> sınıfının <code>isle(basliklar, govde, simdi)</code> metodu <code>(durum_kodu, mesaj)</code> döndürsün. Kurallar sırayla:</p><ol><li>Başlık adları büyük-küçük harfe duyarsız: <code>X-Zaman</code> ve <code>X-Imza</code> yoksa <code>(400, \"başlık eksik\")</code>.</li><li><code>X-Zaman</code> sayı değilse ya da <code>simdi</code>'den 300 saniyeden fazla uzaksa <code>(401, \"zaman\")</code>.</li><li>İmza <code>sha256=</code> + HMAC-SHA256(gizli, <code>zaman.encode() + b\".\" + govde</code>) değilse <code>(401, \"imza\")</code>.</li><li>Gövde geçerli JSON değilse ya da <code>event_id</code> yoksa <code>(400, \"gövde\")</code>.</li><li><code>event_id</code> daha önce işlendiyse <code>(200, \"tekrar\")</code>.</li><li>Olay türü (<code>type</code>) <code>siparis.teslim</code> ya da <code>siparis.iptal</code> ise olayı <code>self.kuyruk</code> listesine ekle ve <code>(202, \"alındı\")</code>; bilinmeyen türde kuyruğa ekleme ama kimliği yine işlenmiş say ve <code>(200, \"yok sayıldı\")</code>.</li></ol>",
    'start': C(r'''
import hashlib
import hmac
import json


class Alici:
    def __init__(self, gizli):
        self.gizli = gizli
        self.kuyruk = []
        self.gorulen = set()

    def isle(self, basliklar, govde, simdi):
        pass
'''),
    'sol': C(r'''
import hashlib
import hmac
import json

TURLER = {"siparis.teslim", "siparis.iptal"}


class Alici:
    def __init__(self, gizli):
        self.gizli = gizli
        self.kuyruk = []
        self.gorulen = set()

    def isle(self, basliklar, govde, simdi):
        b = {k.lower(): v for k, v in basliklar.items()}
        zaman, imza = b.get("x-zaman"), b.get("x-imza")
        if zaman is None or imza is None:
            return 400, "başlık eksik"
        if not zaman.isdigit() or abs(simdi - int(zaman)) > 300:
            return 401, "zaman"
        beklenen = "sha256=" + hmac.new(self.gizli, zaman.encode() + b"." + govde, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(beklenen, imza):
            return 401, "imza"
        try:
            olay = json.loads(govde)
            eid = olay["event_id"]
        except (ValueError, KeyError, TypeError):
            return 400, "gövde"
        if eid in self.gorulen:
            return 200, "tekrar"
        self.gorulen.add(eid)
        if olay.get("type") in TURLER:
            self.kuyruk.append(olay)
            return 202, "alındı"
        return 200, "yok sayıldı"


G = b"whsec_lezzet_test"
g = b'{"event_id": "ev_1", "type": "siparis.teslim", "order_id": 2}'
z = "1735689600"
imza = "sha256=" + hmac.new(G, z.encode() + b"." + g, hashlib.sha256).hexdigest()
a = Alici(G)
print(a.isle({"x-zaman": z, "X-IMZA": imza}, g, 1735689610), a.isle({"X-Zaman": z, "X-Imza": imza}, g, 1735689620))
'''),
    'tests': C(r'''
G = b"whsec_lezzet_test"
def imzala(z, g):
    return "sha256=" + hmac.new(G, z.encode() + b"." + g, hashlib.sha256).hexdigest()
z = "1735689600"
a = Alici(G)
g1 = b'{"event_id": "ev_1", "type": "siparis.teslim", "order_id": 2}'
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g1)}, g1, 1735689610) == (202, "alındı"), "Geçerli teslim olayı kuyruğa alınmalı"
assert a.isle({"x-zaman": z, "x-imza": imzala(z, g1)}, g1, 1735689620) == (200, "tekrar"), "Aynı event_id ikinci kez işlenmemeli (başlık adları küçük harfle de çalışmalı)"
assert len(a.kuyruk) == 1, "Kuyrukta tek olay olmalı"
assert a.isle({"X-Zaman": z}, g1, 1735689610) == (400, "başlık eksik"), "İmza başlığı yoksa 400"
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g1)}, g1, 1735690000) == (401, "zaman"), "400 sn eski istek 401 zaman"
assert a.isle({"X-Zaman": "1735689601", "X-Imza": imzala(z, g1)}, g1, 1735689610) == (401, "imza"), "Zaman damgası değiştirilirse imza tutmamalı"
g2 = b'{"type": "siparis.teslim"}'
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g2)}, g2, 1735689610) == (400, "gövde"), "event_id yoksa 400 gövde"
g3 = b'bozuk{'
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g3)}, g3, 1735689610) == (400, "gövde"), "Geçersiz JSON 400 gövde"
g4 = b'{"event_id": "ev_9", "type": "kurye.konum"}'
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g4)}, g4, 1735689610) == (200, "yok sayıldı"), "Bilinmeyen tür yok sayılmalı"
assert a.isle({"X-Zaman": z, "X-Imza": imzala(z, g4)}, g4, 1735689610) == (200, "tekrar"), "Yok sayılan olay da işlenmiş sayılmalı"
assert len(a.kuyruk) == 1, "Bilinmeyen tür kuyruğa eklenmemeli"
'''),
    'hints': ["Başlıkları küçük harfe normalize et: <code>{k.lower(): v for k, v in basliklar.items()}</code>.", "Sıra önemli: imza doğrulanmadan gövdeyi ayrıştırma ve kimlik kaydetme.", "JSON hatası <code>ValueError</code> (JSONDecodeError onun alt sınıfı), eksik alan <code>KeyError</code>, liste gövde <code>TypeError</code> verir."],
    'why': "Bu sıra, gerçek alıcıların savunma katmanlarıdır: ucuz denetimler önce, imza ondan sonra, iş mantığı en son. 202 'kabul edildi, işlenecek' demektir: ağır iş kuyruğa bırakılır ve sağlayıcıya hızlı yanıt verilir. Bilinmeyen olay türünü 4xx ile reddetmek sağlayıcının sonsuza kadar yeniden denemesine yol açar; 200 ile yok saymak doğrusudur."})

ex.append({'t': 'code', 'id': 'entegrasyon-saas-12', 'stage': 'Meydan okuma', 'diff': 3,
    'q': "<p>Sheets kotasını korumak için hücre değişikliklerini <code>batch_update</code> aralıklarına topla. <code>toplu_aralik(degisiklikler)</code>: <code>(satir, sutun, deger)</code> demetleri (1 tabanlı) alır. Aynı sütunda <b>ardışık satırlardaki</b> değişiklikler tek bir dikey aralıkta birleşir. Dönüş: <code>[{\"range\": \"B2:B4\", \"values\": [[...], [...], [...]]}, ...]</code> listesi; aralıklar önce sütuna, sonra başlangıç satırına göre sıralı. Tek hücre <code>\"C7\"</code> biçiminde (<code>\"C7:C7\"</code> değil). Sütun harfleri Z'den sonra <code>AA</code>, <code>AB</code>... diye devam eder. Aynı hücre birden çok kez geçerse son değer kazanır.</p>",
    'start': C(r'''
def toplu_aralik(degisiklikler):
    pass
'''),
    'sol': C(r'''
def sutun_harf(n):
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def toplu_aralik(degisiklikler):
    hucre = {}
    for satir, sutun, deger in degisiklikler:
        hucre[(sutun, satir)] = deger
    sonuc, grup = [], []
    for (sutun, satir) in sorted(hucre):
        if grup and grup[-1][0] == sutun and grup[-1][1] == satir - 1:
            grup.append((sutun, satir))
        else:
            if grup:
                sonuc.append(grup)
            grup = [(sutun, satir)]
    if grup:
        sonuc.append(grup)
    cikti = []
    for g in sonuc:
        h = sutun_harf(g[0][0])
        bas, son = f"{h}{g[0][1]}", f"{h}{g[-1][1]}"
        cikti.append({"range": bas if len(g) == 1 else f"{bas}:{son}",
                      "values": [[hucre[k]] for k in g]})
    return cikti


print(toplu_aralik([(2, 4, 1250.5), (3, 4, 2410), (4, 4, 0), (7, 3, "Bursa"), (2, 28, "x")]))
'''),
    'tests': C(r'''
r = toplu_aralik([(2, 4, 1250.5), (3, 4, 2410), (4, 4, 0), (7, 3, "Bursa"), (2, 28, "x")])
assert r == [{"range": "C7", "values": [["Bursa"]]},
             {"range": "D2:D4", "values": [[1250.5], [2410], [0]]},
             {"range": "AB2", "values": [["x"]]}], "Aralıklar tutmuyor: " + str(r)
r2 = toplu_aralik([(5, 1, "a"), (3, 1, "b"), (4, 1, "c"), (9, 1, "d"), (4, 1, "C")])
assert r2 == [{"range": "A3:A5", "values": [["b"], ["C"], ["a"]]}, {"range": "A9", "values": [["d"]]}], "Sırasız girdi sıralanmalı, son değer kazanmalı, aradaki boşluk aralığı bölmeli: " + str(r2)
assert toplu_aralik([(1, 26, 1), (1, 27, 2), (1, 52, 3), (1, 53, 4)]) == [{"range": "Z1", "values": [[1]]}, {"range": "AA1", "values": [[2]]}, {"range": "AZ1", "values": [[3]]}, {"range": "BA1", "values": [[4]]}], "Sütun harfleri: 26=Z, 27=AA, 52=AZ, 53=BA"
assert toplu_aralik([]) == [], "Boş girdide boş liste"
'''),
    'hints': ["Önce <code>{(sutun, satir): deger}</code> sözlüğüyle tekilleştir; <code>sorted</code> sütun, sonra satır sırası verir.", "Ardışıklık: aynı sütun ve satır = önceki satır + 1.", "Sütun harfi için 1 tabanlı 26'lık sistem: <code>n, r = divmod(n - 1, 26)</code>."],
    'why': "Sheets API dakikalık istek sınırı uygular; 300 hücreyi tek tek yazmak kotayı bitirir, tek <code>batch_update</code> ile göndermek bir istek harcar. A1 gösterimi ve 'bijective base-26' sütun harfleri (Z'den sonra AA) Excel ve Sheets otomasyonunda sürekli karşına çıkar."})

# Mini proje
ex.append({'t': 'code', 'id': 'entegrasyon-saas-13', 'stage': 'Mini proje', 'diff': 3,
    'q': "<p><b>Kirli bayi listesini Sheets'e senkronla ve değişikliği Teams'e bildir.</b> Veri: <code>veri.kayitlar(\"kirli_veri\", \"bayi\", cevir=False)</code> (başlık satırı, boş satır, tekrar eden satır, Türkçe sayı ve dağınık şehir yazımı içerir; sütunlar <code>Column1</code>..<code>Column5</code>).</p><ol><li><code>temizle(kayitlar)</code>: yalnız tarihi <code>GG.AA.YYYY</code> biçiminde olan satırları al; tamamen aynı satırların tekrarını at; bayi başına <code>{\"bayi\": ..., \"sehir\": ..., \"tutar\": ...}</code> topla. Şehir: boşlukları kırp, ilk harf büyük (<code>i</code> → <code>İ</code>), kalanı küçük (<code>I</code> → <code>ı</code>). Tutar: Türkçe sayı, <code>-</code> ise 0. Liste bayi adına göre sıralı, tutar 2 basamak.</li><li><code>senkron(ws, bayiler)</code>: sahte Sheets'e <code>[bayi, sehir, tutar]</code> satırlarını upsert et; değişen ya da eklenen bayi adlarını sıralı liste olarak döndür.</li><li><code>teams_karti(degisenler)</code>: değişiklik yoksa <code>None</code>; varsa Teams'in Adaptive Card yükünü döndür: <code>{\"type\": \"message\", \"attachments\": [{\"contentType\": \"application/vnd.microsoft.card.adaptive\", \"content\": {\"type\": \"AdaptiveCard\", \"version\": \"1.4\", \"body\": [{\"type\": \"TextBlock\", \"text\": \"Bayi tablosu güncellendi (N)\", \"weight\": \"Bolder\"}, {\"type\": \"TextBlock\", \"text\": \"ad1, ad2, ...\", \"wrap\": True}]}}]}</code>.</li></ol>",
    'start': C(SHEET + r'''
import re
import veri

ham = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def temizle(kayitlar):
    pass


def senkron(ws, bayiler):
    pass


def teams_karti(degisenler):
    pass
'''),
    'sol': C(SHEET + r'''
import re
import veri

ham = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def sehir_duzelt(s):
    s = s.strip()
    ilk = "İ" if s[0] in "iİ" else s[0].upper()
    kalan = s[1:].replace("I", "ı").replace("İ", "i").lower()
    return ilk + kalan


def tutar_cevir(s):
    s = s.strip()
    return 0.0 if s == "-" else float(s.replace(".", "").replace(",", "."))


def temizle(kayitlar):
    gorulen, toplam = set(), {}
    for k in kayitlar:
        satir = tuple(k[f"Column{i}"] for i in range(1, 6))
        if not re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", satir[2].strip()) or satir in gorulen:
            continue
        gorulen.add(satir)
        b = satir[0].strip()
        kayit = toplam.setdefault(b, {"bayi": b, "sehir": sehir_duzelt(satir[1]), "tutar": 0.0})
        kayit["tutar"] = round(kayit["tutar"] + tutar_cevir(satir[3]), 2)
    return sorted(toplam.values(), key=lambda x: x["bayi"])


def senkron(ws, bayiler):
    tum = ws.get_all_values()
    konum = {s[0]: (i + 1, s) for i, s in enumerate(tum)}
    degisen = []
    for b in bayiler:
        metin = [b["bayi"], b["sehir"], str(b["tutar"])]
        if b["bayi"] not in konum:
            ws.append_row(metin)
            konum[b["bayi"]] = (len(konum) + 1, metin)
            degisen.append(b["bayi"])
        elif konum[b["bayi"]][1] != metin:
            ws.update_row(konum[b["bayi"]][0], metin)
            degisen.append(b["bayi"])
    return sorted(degisen)


def teams_karti(degisenler):
    if not degisenler:
        return None
    return {"type": "message", "attachments": [{
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {"type": "AdaptiveCard", "version": "1.4", "body": [
            {"type": "TextBlock", "text": f"Bayi tablosu güncellendi ({len(degisenler)})", "weight": "Bolder"},
            {"type": "TextBlock", "text": ", ".join(degisenler), "wrap": True}]}}]}


bayiler = temizle(ham)
for b in bayiler:
    print(b)
ws = SahteSheet([["Bayi", "Şehir", "Tutar"], ["Merkez Bayi", "İstanbul", 1250.5]])
d = senkron(ws, bayiler)
print(d)
print(teams_karti(d)["attachments"][0]["content"]["body"][0]["text"], teams_karti(senkron(ws, bayiler)))
'''),
    'tests': 'b = temizle(ham)\nassert [x["bayi"] for x in b] == ["Alsancak Bayi", "Konyaaltı Bayi", "Kızılay Bayi", "Merkez Bayi", "Nilüfer Bayi", "Ortahisar Bayi"], "Bayi listesi (Selçuklu tarihi bilinmediği için yok): " + str([x["bayi"] for x in b])\nassert {x["bayi"]: x["sehir"] for x in b}["Alsancak Bayi"] == "İzmir" and {x["bayi"]: x["sehir"] for x in b}["Merkez Bayi"] == "İstanbul", "Şehir: \'izmir  \' -> \'İzmir\', \' istanbul \' -> \'İstanbul\'"\nassert {x["bayi"]: x["tutar"] for x in b} == {"Alsancak Bayi": 0.0, "Konyaaltı Bayi": 1115.75, "Kızılay Bayi": 2410.0, "Merkez Bayi": 1250.5, "Nilüfer Bayi": 2040.0, "Ortahisar Bayi": 890.0}, "Tutarlar: tekrar eden Merkez satırı bir kez, Kızılay iki gün toplamı"\nws = SahteSheet([["Bayi", "Şehir", "Tutar"], ["Merkez Bayi", "İstanbul", 1250.5]])\nd = senkron(ws, b)\nassert d == ["Alsancak Bayi", "Konyaaltı Bayi", "Kızılay Bayi", "Nilüfer Bayi", "Ortahisar Bayi"], "Merkez Bayi aynı olduğu için değişmemeli; gelen " + str(d)\nk = teams_karti(d)\nassert k["type"] == "message" and k["attachments"][0]["contentType"] == "application/vnd.microsoft.card.adaptive", "Teams mesaj zarfı tutmuyor"\ngovde = k["attachments"][0]["content"]["body"]\nassert govde[0]["text"] == "Bayi tablosu güncellendi (5)" and govde[1]["text"].startswith("Alsancak Bayi, Konyaaltı"), "Kart metni tutmuyor"\nassert senkron(ws, b) == [] and teams_karti([]) is None, "İkinci çalıştırmada değişiklik ve bildirim olmamalı"\nassert len(ws.get_all_values()) == 7, "Tabloda başlık + 6 bayi olmalı"\n',
    'hints': ["Tarih kontrolü hem başlığı, boş satırı hem de 'bilinmiyor' tarihli satırı eler: <code>re.fullmatch(r\"\\d{2}\\.\\d{2}\\.\\d{4}\", tarih)</code>.", "Türkçe büyük/küçük harf: <code>\"izmir\"[0].upper()</code> 'I' verir; ilk harf 'i' ise elle 'İ' yaz, kalan için önce 'I'→'ı', 'İ'→'i' çevir.", "Sheets'e tutarı <code>str(...)</code> olarak yaz ve karşılaştırmayı metinle yap; ikinci çalıştırma boş liste ve <code>None</code> kart vermeli."],
    'why': "Bu hat gerçek bir ofis otomasyonunun üç katmanını birleştirir: temizlik (dağınık kaynak), idempotent hedef yazımı (upsert) ve yalnız değişiklik olunca bildirim. 'Selçuklu Bayi' tarihi bilinmediği için dışarıda kaldı; üretimde böyle satırlar ayrı bir 'karantina' sekmesine yazılır ve bildirimde sayıları belirtilir."})

faq = [
    {'q': 'Gmail ya da Outlook\'a normal şifremle bağlanabilir miyim?', 'a': 'Çoğu zaman hayır. Gmail iki adımlı doğrulama açıkken "uygulama şifresi" ister ya da OAuth ile bağlanman gerekir; Microsoft 365 temel kimlik doğrulamayı (kullanıcı adı + şifreyle IMAP) kapattı, Graph API ve OAuth (MSAL) önerilir. Her durumda şifre koda değil ortam değişkenine ya da kasaya yazılır.'},
    {'q': 'gspread ile Google Sheets API\'yi doğrudan çağırmanın farkı ne?', 'a': 'gspread resmi API\'nin üzerine kurulu, kullanımı kolay bir kütüphanedir: hücre, aralık ve satır işlemleri tek satırdır. Biçimlendirme, koşullu biçim ya da grafik gibi ileri işlemler için google-api-python-client ile doğrudan <code>spreadsheets.batchUpdate</code> çağırırsın. Basit veri okuma/yazma için gspread yeterlidir.'},
    {'q': 'Webhook alıcımı geliştirirken dışarıdan nasıl erişilebilir yaparım?', 'a': 'Yerelde ngrok ya da Cloudflare Tunnel gibi bir tünel aracı geçici bir HTTPS adresi verir. Çoğu sağlayıcı panelinde "test olayı gönder" düğmesi ve gönderim geçmişi bulunur; imza ve tekrar mantığını önce bu kayıtlı istekleri kullanan testlerle doğrula.'},
    {'q': 'n8n/Make varken Python yazmaya gerek var mı?', 'a': 'Bağlayıcısı hazır, kuralı basit akışlarda düşük kodlu araç daha hızlıdır. Karmaşık ayrıştırma, doğrulama, hesaplama, sürüm kontrolü ve test gereken adımlarda Python daha sağlamdır. En yaygın düzen ikisinin birlikteliğidir: tetikleme ve bağlantı platformda, iş mantığı Python fonksiyonunda ya da küçük bir HTTP servisinde.'},
    {'q': 'Slack\'te webhook yerine bot ne zaman gerekir?', 'a': 'Gelen webhook yalnız tek bir kanala mesaj atar. Kullanıcı komutlarına (/ozet) yanıt vermek, düğmelere tıklanınca işlem yapmak, mesaj okumak ya da birden çok kanala yazmak için bir Slack uygulaması (bot token, Events API, Bolt for Python) gerekir; gelen istekleri de Slack imzasıyla doğrularsın.'}
]
mistakes = [
    {'bad': 'olay = await request.json()\nimza_dogrula(json.dumps(olay).encode(), imza)', 'good': 'govde = await request.body()\nimza_dogrula(govde, imza)\nolay = json.loads(govde)', 'why': 'İmza ham bayt dizisi üzerinden hesaplanır; ayrıştırıp yeniden yazmak boşluk ve sırayı değiştirir, doğrulama hep başarısız olur.'},
    {'bad': 'if satir[0] == urun["product_id"]:   # Sheets "101" döner', 'good': 'if satir[0] == str(urun["product_id"]):', 'why': 'Sheets, CSV ve form verisi metindir; tür uyuşmazlığı sessizce eşleşmeyi bozar ve her çalıştırmada satır çoğalır.'},
    {'bad': 'SLACK_URL = "https://hooks.slack.com/services/T000/B000/XXXX"', 'good': 'SLACK_URL = os.environ["SLACK_WEBHOOK_URL"]', 'why': 'Webhook URL\'si bir sırdır: bilen herkes kanalına mesaj atabilir. Koda ve Git\'e yazma, ortam değişkeninden oku.'},
    {'bad': 'ileti = message_from_bytes(ham)\nprint(ileti["subject"])   # =?utf-8?b?...', 'good': 'ileti = message_from_bytes(ham, policy=policy.default)\nprint(ileti["subject"])', 'why': 'Varsayılan eski politika Türkçe başlıkları çözmez ve iter_attachments gibi modern metotları sunmaz.'},
    {'bad': 'for s in yeni_satirlar:\n    ws.append_row(s)   # her çalıştırmada', 'good': 'upsert_satirlar(ws, yeni_satirlar)', 'why': 'Zamanlanmış betik tekrar çalışabilir; yalnız ekleme yapan betik idempotent değildir ve tabloyu şişirir.'}
]

lesson = {
    'id': 'entegrasyon-saas', 'lv': 'orta', 'mod': 'Otomasyon ve Araçlar', 'min': 55,
    'title': 'İş uygulamalarıyla entegrasyon: Google Sheets, e-posta, Teams, Slack ve webhook',
    'sum': "Polling ile webhook'u karşılaştırır; gspread ile idempotent Sheets güncellemesini, imaplib ve email modülüyle e-posta ve ek okumayı, Microsoft Graph, Teams ve Slack webhook yüklerini, HMAC ile webhook imza doğrulamayı, sırların yönetimini ve n8n/Make ile iş bölümünü sahte istemciler ve gerçek veri setleriyle uygularsın.",
    'goals': ["Bir entegrasyon için polling ile webhook arasında seçim yapar, imleçle kayıp ve tekrarsız polling yazabilirim.", "Sheets'e anahtar sütunuyla idempotent upsert yapar, değişiklikleri kotayı koruyacak biçimde toplu yazabilirim.", "IMAP ile gelen ham e-postayı email modülüyle ayrıştırıp ekleri bir işleme hattına bağlayabilirim.", "Slack Block Kit ve Teams Adaptive Card yüklerini test edilebilir fonksiyonlarla üretebilirim.", "Gelen webhook'u ham gövde, HMAC imzası, zaman penceresi ve olay kimliğiyle güvenli biçimde karşılayabilirim."],
    'body': body.replace('${', '&#36;{'), 'ex': ex, 'faq': faq, 'mistakes': mistakes}

if __name__ == '__main__':
    write('/home/claude/py/v2/n6/entegrasyon-saas.js', 'İş uygulamalarıyla entegrasyon', lesson)
