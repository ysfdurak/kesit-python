/* PythonPatika — 'ofis-otomasyon' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'ofis-otomasyon',
    min: 25,
    html: `<p>Zamanlanmış bir betik sessizce başarısız olursa, sorunu genellikle bir yönetici "rapor neden gelmedi?" diye sorduğunda öğrenirsin. Bu bölüm iki eksiği kapatıyor: her çalıştırmanın sonunda bir <b>çalışma özeti</b> üretmek ve hata olduğunda <b>bildirim</b> göndermek (Teams/Slack webhook ve e-posta); ardından Windows Görev Zamanlayıcı'nın "neden elle çalışıyor da zamanlanınca çalışmıyor" tuzakları.</p>
<h2>Çalışma özeti: her çalıştırma bir kayıt</h2>
<p>Betiğin ana gövdesini bir sarmalayıcıya al: başlangıç-bitiş zamanı, işlenen ve atlanan dosya sayısı, uyarılar ve durum tek bir sözlükte toplansın. Bu özet hem loga, hem bildirime, hem de (istersen) bir CSV'ye "çalışma geçmişi" olarak yazılır.</p>
<pre class="py">import json, traceback
from datetime import datetime

def calistir(is_fonksiyonu, ad, simdi=datetime.now):
    ozet = {"is": ad, "baslangic": simdi().isoformat(timespec="seconds"), "durum": "BAŞARILI",
            "islenen": 0, "atlanan": 0, "uyarilar": []}
    try:
        is_fonksiyonu(ozet)                    # iş, sayaçları ve uyarıları özete yazar
        if ozet["uyarilar"]:
            ozet["durum"] = "UYARILI"
    except Exception as e:
        ozet["durum"] = "HATA"
        ozet["hata"] = f"{type(e).__name__}: {e}"
        ozet["iz"] = traceback.format_exc(limit=3)
    ozet["bitis"] = simdi().isoformat(timespec="seconds")
    return ozet

def rapor_isi(ozet):
    for ad in ["ocak.xlsx", "subat.xlsx", "~$mart.xlsx"]:
        if ad.startswith("~$"):                # Excel'in açık dosya kilidi
            ozet["atlanan"] += 1
            ozet["uyarilar"].append(f"{ad} kilit dosyası, atlandı")
            continue
        ozet["islenen"] += 1

sabit = lambda: datetime(2024, 11, 4, 8, 30)
ozet = calistir(rapor_isi, "aylik_rapor", sabit)
print(json.dumps({k: v for k, v in ozet.items() if k != "iz"}, ensure_ascii=False))</pre>
<h2>Bildirim: webhook ve e-posta</h2>
<p>Microsoft Teams ve Slack, bir kanala dışarıdan mesaj göndermek için <b>gelen webhook</b> (incoming webhook) adresi verir: bu adrese JSON ile POST atarsın, mesaj kanala düşer. Teams'te yeni yol "Workflows" uygulamasındaki "webhook isteği alındığında kanala gönder" akışıdır; eski Office 365 bağlayıcıları kaldırılmaktadır. Adres bir parola gibidir: bilen herkes kanala mesaj atabilir, bu yüzden ortam değişkeninde tutulur.</p>
<pre class="code">import os, json, urllib.request

def webhook_gonder(ozet):
    govde = {"text": f"[{ozet['durum']}] {ozet['is']}: {ozet['islenen']} işlendi, "
                     f"{ozet['atlanan']} atlandı" + (f"\\nHata: {ozet['hata']}" if "hata" in ozet else "")}
    istek = urllib.request.Request(os.environ["TEAMS_WEBHOOK_URL"], data=json.dumps(govde).encode("utf-8"),
                                   headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(istek, timeout=10) as y:
            return y.status
    except OSError as e:
        print("Bildirim gönderilemedi:", e)    # bildirim hatası asıl işi düşürmesin</pre>
<p>Kurallar: yalnız <b>durum değişince ya da hata olunca</b> bildir (her başarılı çalıştırmada mesaj atmak, kanalı sessize alınan bir gürültüye çevirir); aynı hatayı her 5 dakikada bir tekrar gönderme (susturma süresi); mesaja kişisel veri ya da tam yığın izi koyma, ayrıntıyı log dosyasının yolunu vererek ilet; bildirim gönderilemezse bunu logla ama asıl işi başarısız sayma. E-posta için derste gördüğün <code>EmailMessage</code> + <code>smtplib</code> kalıbını aynı özet metniyle kullan; ek olarak log dosyasının son 50 satırını ekleyebilirsin.</p>
<h2>Windows Görev Zamanlayıcı tuzakları</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td>Elle çalışıyor, zamanlanınca "dosya bulunamadı"</td><td>Çalışma klasörü <code>C:\\Windows\\System32</code></td><td>"Başlangıç yeri" (Start in) alanını doldur; kodda <code>Path(__file__).parent</code> kullan</td></tr>
<tr><td>Yalnız oturum açıkken çalışıyor</td><td>"Yalnızca kullanıcı oturum açtığında çalıştır" seçili</td><td>"Kullanıcı oturum açmış olsa da olmasa da çalıştır"ı seç; parola istenir</td></tr>
<tr><td>Oturum kapalıyken ağ sürücüsüne erişemiyor</td><td><code>Z:</code> gibi eşlenmiş sürücüler yalnız etkileşimli oturumda vardır</td><td>UNC yolu kullan: <code>\\\\sunucu\\paylasim\\rapor</code>; hesaba paylaşım izni ver</td></tr>
<tr><td>Parola değişince görev sessizce durdu</td><td>Görev, kaydedilmiş parolayla çalışır</td><td>Parolası süresiz servis hesabı ya da gMSA kullan; parola değişince görevi güncelle</td></tr>
<tr><td>Excel/Outlook otomasyonu takılıyor</td><td>Oturum kapalıyken masaüstü uygulaması açılamaz</td><td>openpyxl/pandas gibi arayüzsüz kütüphaneler, SMTP ya da Graph API kullan</td></tr>
<tr><td>"Son çalıştırma sonucu 0x1"</td><td>Betik 1 çıkış koduyla bitti (Python hatası)</td><td>Betiğin kendi log dosyasına bak; görev çıktısı hiçbir yere yazılmaz</td></tr>
<tr><td>Yanlış Python ya da paket bulunamadı</td><td>PATH'teki <code>python</code> farklı</td><td>Programa sanal ortamın tam yolunu ver: <code>C:\\is\\.venv\\Scripts\\python.exe</code></td></tr></table></div>
<pre class="code">schtasks /create /tn "AnadoluRapor" /sc daily /st 07:45 ^
  /tr "C:\\is\\.venv\\Scripts\\python.exe C:\\is\\rapor.py" ^
  /ru "ANADOLU\\svc_rapor" /rp * /rl LIMITED
schtasks /query /tn "AnadoluRapor" /v /fo LIST     # son çalıştırma zamanı ve sonucu
schtasks /run /tn "AnadoluRapor"                   # şimdi dene</pre>
<p><code>/ru</code> ve <code>/rp *</code> görevin hangi hesapla, oturum açık olmadan çalışacağını belirler (<code>*</code> parolayı gizli sorar). <code>/rl LIMITED</code> yönetici yetkisi vermez; gerekmedikçe yükseltme. "Ayarlar" sekmesinde "görev zaten çalışıyorsa yeni örnek başlatma" seçeneği, derste gördüğün kilit dosyasını tamamlar.</p>
<div class="warn"><b>Kimlik bilgisi tuzağı</b>"Oturum açmasa da çalıştır" seçildiğinde görev, Windows Kimlik Bilgisi Yöneticisi'ne (Credential Manager) senin oturumunda kaydedilmiş sırlara erişemeyebilir ve <code>%USERPROFILE%</code> farklı çözülebilir. Sırları ortam değişkenine görev hesabı için tanımla ya da dosyayı yalnız o hesabın okuyabildiği bir klasöre koy; kendi kişisel hesabını otomasyon için kullanma.</div>
<div class="note"><b>Gerçek işte</b>Ofis otomasyonunun güvenilir olup olmadığını kullanıcılar çıktıdan değil sessizlikten anlar: hata olduğunda bir dakika içinde kanala düşen kısa bir mesaj ve ertesi sabah "dün 3 dosya atlandı, nedeni şu" diyen özet, betiğe duyulan güveni kurar.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'ofis-otomasyon-y1',
        stage: 'Isınma',
        q: 'Görev Zamanlayıcı\'da "oturum açmasa da çalıştır" seçili görev, <code>Z:\\raporlar</code> klasörünü bulamıyor; elle çalıştırınca sorun yok. En olası neden?',
        o: [
          'Görevdeki Python sürümü, betiğin istediğinden eski',
          'Eşlenmiş sürücüler etkileşimsiz oturumda yok; UNC yolu gerekir',
          'Klasörde çok fazla dosya olduğu için listeleme zaman aşımına uğruyor',
          'Görev yönetici yetkisiyle (en yüksek ayrıcalık) çalışmıyor'
        ],
        a: 1,
        why: 'Sürücü harfi eşlemeleri kullanıcının etkileşimli oturumuna aittir; görev ayrı bir oturumda başlar ve Z: yoktur. \\\\sunucu\\paylasim biçimindeki UNC yolu ve görev hesabına paylaşım izni sorunu çözer.'
      },
      {
        t: 'mc',
        id: 'ofis-otomasyon-y2',
        stage: 'Isınma',
        q: 'Her 15 dakikada çalışan bir otomasyon için hangi bildirim politikası doğrudur?',
        o: [
          'Her çalıştırmanın sonunda kanala kısa bir başarı mesajı göndermek',
          'Durum değişince ya da hatada bildirmek; tekrarı susturmak',
          'Tüm sonuçları biriktirip yalnız haftalık bir özet e-postası göndermek',
          'Bildirim göndermeyip her şeyi yalnızca log dosyasına yazmak'
        ],
        a: 1,
        why: 'Günde 96 başarı mesajı kanalı gürültüye çevirir ve insanlar onu sessize alır; o zaman gerçek hata da görülmez. Haftalık özet ya da yalnız log ise hatayı geç fark ettirir.'
      },
      {
        t: 'predict',
        id: 'ofis-otomasyon-y3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        o: ['{\'durum\': \'HATA\', \'islenen\': 3, \'hata\': \'ValueError\'}', '{\'durum\': \'HATA\', \'islenen\': 2, \'hata\': \'ValueError\'}', '{\'durum\': \'BAŞARILI\', \'islenen\': 3}', 'ValueError: c.txt'],
        a: 0,
        code: 'def calistir(is_fonksiyonu):\n    ozet = {"durum": "BAŞARILI", "islenen": 0}\n    try:\n        is_fonksiyonu(ozet)\n    except Exception as e:\n        ozet["durum"] = "HATA"\n        ozet["hata"] = type(e).__name__\n    return ozet\n\ndef is_(o):\n    for ad in ["a.csv", "b.csv", "c.txt"]:\n        o["islenen"] += 1\n        if not ad.endswith(".csv"):\n            raise ValueError(ad)\n\nprint(calistir(is_))\n',
        why: 'Sayaç, hata kontrolünden önce artırıldığı için üçüncü dosya da sayılır: 3. İstisna sarmalayıcıda yakalanır, program çökmez ve özet HATA durumunu taşır. Sayaçları işin gerçekten bittiği yerde artırmak daha doğru bir özet verir.'
      },
      {
        t: 'order',
        id: 'ofis-otomasyon-y4',
        stage: 'Kodu oku',
        q: '<p>Teams webhook\'u için JSON gövdesini hazırlayan satırları sırala. Beklenen çıktı:</p><pre class="out">{"text": "[HATA] aylik_rapor: 2 işlendi, 1 atlandı"}</pre>',
        lines: [
          'import json',
          'ozet = {"is": "aylik_rapor", "durum": "HATA", "islenen": 2, "atlanan": 1}',
          'metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet[\'islenen\']} işlendi, {ozet[\'atlanan\']} atlandı"',
          'govde = json.dumps({"text": metin}, ensure_ascii=False)',
          'print(govde)'
        ],
        expect: '{"text": "[HATA] aylik_rapor: 2 işlendi, 1 atlandı"}\n',
        hint: 'Metin, gövdeye sarılmadan önce kurulmalı.',
        why: 'Webhook\'lar JSON gövde bekler; metni önce f-string ile kur, sonra json.dumps ile sar. ensure_ascii=False Türkçe karakterleri okunur tutar (gönderirken .encode("utf-8") gerekir).'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Bildirim kararı: <code>bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60)</code> yaz. Kurallar sırayla: (1) <code>ozet["durum"]</code> önceki durumdan farklıysa <code>True</code> (ilk çalıştırmada önceki <code>None</code>; başarılıysa bildirme). (2) Durum <code>"HATA"</code> ve <code>son_bildirim</code> <code>None</code> ya da en az <code>susturma_dk</code> dakika önceyse <code>True</code>. (3) Diğer her durumda <code>False</code>. Zamanlar <code>datetime</code>.</p>',
        guide: ['İlk çalıştırma ve başarılı durum: bildirim yok.', 'Durum değiştiyse bildir.', 'Süregelen HATA\'da son bildirimden beri geçen süreyi timedelta ile karşılaştır.'],
        example: 'from datetime import datetime, timedelta\na, b = datetime(2024, 11, 4, 8, 0), datetime(2024, 11, 4, 8, 45)\nprint(b - a >= timedelta(minutes=60))\n',
        start: 'from datetime import datetime, timedelta\n\ndef bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60):\n    durum = ozet["durum"]\n    # TODO: ilk çalıştırma ve başarı\n    # TODO: durum değişimi\n    # TODO: süregelen hata ve susturma\n    return True\n',
        sol: 'from datetime import datetime, timedelta\n\ndef bildirilsin_mi(onceki_durum, ozet, son_bildirim, simdi, susturma_dk=60):\n    durum = ozet["durum"]\n    if onceki_durum is None and durum == "BAŞARILI":\n        return False\n    if durum != onceki_durum:\n        return True\n    if durum == "HATA":\n        return son_bildirim is None or simdi - son_bildirim >= timedelta(minutes=susturma_dk)\n    return False\n',
        tests: 'T = datetime(2024, 11, 4, 9, 0)\nassert not bildirilsin_mi(None, {"durum": "BAŞARILI"}, None, T), "İlk ve başarılı çalıştırma bildirilmez"\nassert bildirilsin_mi("BAŞARILI", {"durum": "HATA"}, None, T), "Hata başladı: bildir"\nassert not bildirilsin_mi("HATA", {"durum": "HATA"}, T - timedelta(minutes=15), T), "15 dk önce bildirildi: sustur"\nassert bildirilsin_mi("HATA", {"durum": "HATA"}, T - timedelta(minutes=60), T), "Susturma süresi doldu: hatırlat"\nassert bildirilsin_mi("HATA", {"durum": "BAŞARILI"}, T - timedelta(minutes=5), T), "Düzeldi: bildir"\nassert not bildirilsin_mi("BAŞARILI", {"durum": "BAŞARILI"}, None, T), "Süregelen başarı bildirilmez"\nassert bildirilsin_mi(None, {"durum": "UYARILI"}, None, T), "İlk çalıştırmada uyarı varsa bildir"\n',
        hints: ['Kural sırası önemli: önce ilk/başarı, sonra değişim, sonra süregelen hata.', 'simdi - son_bildirim bir timedelta verir.', '"Düzeldi" mesajı da değişim kuralıyla gelir.'],
        why: 'Bu, izleme sistemlerinin (Alertmanager, PagerDuty) temel kuralıdır: değişimde bildir, süregelen sorunu belirli aralıklarla hatırlat, düzelince haber ver. Gürültüsüz bildirim, insanların bildirimlere güvenmeye devam etmesini sağlar.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Görev Zamanlayıcı denetimi: <code>gorev_denetle(gorev)</code> yaz. <code>gorev</code> sözlüğünde <code>program</code>, <code>argumanlar</code>, <code>baslangic_yeri</code>, <code>oturumsuz</code> (bool), <code>hesap</code> alanları var. Şu sırayla sorun mesajları döndür:</p><ul><li><code>program</code> küçük harfle <code>python.exe</code>, <code>python</code> ya da <code>py</code> ile <b>bitiyorsa</b> ve içinde <code>\\</code> yoksa: <code>"python tam yol değil"</code></li><li><code>baslangic_yeri</code> boşsa: <code>"başlangıç yeri yok"</code></li><li><code>argumanlar</code> içinde sürücü harfli yol (<code>[A-Z]:\\</code>) varsa ve harf <code>C</code> değilse ve <code>oturumsuz</code> ise: <code>"eşlenmiş sürücü: X:"</code></li><li><code>hesap</code> bir kişi hesabıysa (<code>svc_</code> ile başlamıyorsa, alan adı öneki <code>ANADOLU\\</code> atılarak) ve <code>oturumsuz</code> ise: <code>"kişisel hesap"</code></li></ul>',
        start: 'import re\n\ndef gorev_denetle(gorev):\n    pass\n',
        sol: 'import re\n\ndef gorev_denetle(gorev):\n    s = []\n    prog = gorev.get("program", "")\n    if "\\\\" not in prog and prog.lower().endswith(("python.exe", "python", "py")):\n        s.append("python tam yol değil")\n    if not gorev.get("baslangic_yeri"):\n        s.append("başlangıç yeri yok")\n    if gorev.get("oturumsuz"):\n        for harf in re.findall(r"([A-Za-z]):\\\\", gorev.get("argumanlar", "")):\n            if harf.upper() != "C":\n                s.append(f"eşlenmiş sürücü: {harf.upper()}:")\n                break\n        hesap = gorev.get("hesap", "").split("\\\\")[-1]\n        if not hesap.lower().startswith("svc_"):\n            s.append("kişisel hesap")\n    return s\n',
        tests: 'iyi = {"program": r"C:\\is\\.venv\\Scripts\\python.exe", "argumanlar": r"C:\\is\\rapor.py \\\\dosya\\rapor", "baslangic_yeri": r"C:\\is", "oturumsuz": True, "hesap": r"ANADOLU\\svc_rapor"}\nassert gorev_denetle(iyi) == [], "UNC yolu ve servis hesabıyla sorun yok"\nkotu = {"program": "python.exe", "argumanlar": r"Z:\\raporlar\\aylik.py", "baslangic_yeri": "", "oturumsuz": True, "hesap": r"ANADOLU\\ayse.yilmaz"}\nassert gorev_denetle(kotu) == ["python tam yol değil", "başlangıç yeri yok", "eşlenmiş sürücü: Z:", "kişisel hesap"], f"Gelen: {gorev_denetle(kotu)}"\netkilesimli = dict(kotu, oturumsuz=False, program="py", baslangic_yeri=r"C:\\is")\nassert gorev_denetle(etkilesimli) == ["python tam yol değil"], "Oturum açıkken sürücü ve hesap sorun değil"\n',
        hints: ['Raw string içinde ters bölü kontrolü: "\\\\" in prog.', 'Sürücü harfleri: re.findall(r"([A-Za-z]):\\\\", metin).', 'Alan adını split("\\\\")[-1] ile at.'],
        why: 'Bu kontroller, "elle çalışıyor ama zamanlanınca çalışmıyor" vakalarının çoğunu daha kurulumda yakalar. Ekiplerde görev tanımları XML olarak dışa aktarılıp (schtasks /query /xml) bu tür bir betikle denetlenebilir.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>guvenli_bildir(gonder, ozet)</code> bildirim gönderir; bildirim başarısız olursa (herhangi bir <code>OSError</code>) asıl iş sonucu etkilenmemeli: <code>False</code> döndürmeli. Mesaj metni 300 karakteri geçerse sonuna <code>"…"</code> ekleyerek 300 karaktere kırpılmalı (yığın izi gibi uzun hatalar). Şu anki kod ağ hatasında çöküyor ve kırpmada 301 karakter üretiyor.</p>',
        start: 'def guvenli_bildir(gonder, ozet):\n    metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet.get(\'hata\', \'\')}"\n    if len(metin) > 300:\n        metin = metin[:300] + "…"\n    gonder(metin)\n    return True\n',
        sol: 'def guvenli_bildir(gonder, ozet):\n    metin = f"[{ozet[\'durum\']}] {ozet[\'is\']}: {ozet.get(\'hata\', \'\')}"\n    if len(metin) > 300:\n        metin = metin[:299] + "…"\n    try:\n        gonder(metin)\n    except OSError:\n        return False\n    return True\n',
        tests: 'giden = []\nassert guvenli_bildir(giden.append, {"durum": "HATA", "is": "rapor", "hata": "x" * 1000}) is True, "Başarılı gönderim True"\nassert len(giden[0]) == 300 and giden[0].endswith("…"), f"Metin tam 300 karakter olmalı: {len(giden[0])}"\ndef bozuk(m):\n    raise ConnectionError("ağ yok")\nassert guvenli_bildir(bozuk, {"durum": "HATA", "is": "rapor"}) is False, "Ağ hatası yakalanmalı (ConnectionError bir OSError\'dır)"\ndef zaman_asimi(m):\n    raise TimeoutError()\nassert guvenli_bildir(zaman_asimi, {"durum": "HATA", "is": "rapor"}) is False, "Zaman aşımı da OSError ailesindendir"\n',
        hints: ['İki hata: try/except eksik ve kırpma bir fazla.', '"…" tek karakterdir; 299 + 1 = 300.', 'except OSError: return False'],
        why: 'Bildirim yan iştir: kendi hatası asıl işi başarısız göstermemeli ve yeniden denemeye sokmamalı. ConnectionError, TimeoutError ve urllib.error.URLError hepsi OSError ailesindendir; tek except ile yakalanır.'
      },
      {
        t: 'code',
        id: 'ofis-otomasyon-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Çalışma geçmişinden sabah özeti: <code>sabah_ozeti(gecmis_csv)</code> yaz. CSV sütunları: <code>is,baslangic,durum,islenen,atlanan</code> (<code>baslangic</code> ISO metin). Her iş için son çalıştırmanın durumunu, son 24 saatteki (en yeni kaydın zamanına göre, o an dahil, 24 saat öncesi hariç) toplam işlenen ve atlanan sayısını ve son 24 saatteki <code>HATA</code> sayısını hesapla. Satırları <code>"&lt;is&gt;: son=&lt;durum&gt; işlenen=&lt;n&gt; atlanan=&lt;n&gt; hata=&lt;n&gt;"</code> biçiminde, önce son durumu HATA olanlar, sonra iş adına göre alfabetik sırala ve <code>\n</code> ile birleştir.</p>',
        start: 'import csv, io\nfrom datetime import datetime, timedelta\n\ndef sabah_ozeti(gecmis_csv):\n    pass\n',
        sol: 'import csv, io\nfrom datetime import datetime, timedelta\n\ndef sabah_ozeti(gecmis_csv):\n    satirlar = list(csv.DictReader(io.StringIO(gecmis_csv)))\n    if not satirlar:\n        return ""\n    for r in satirlar:\n        r["t"] = datetime.fromisoformat(r["baslangic"])\n    simdi = max(r["t"] for r in satirlar)\n    esik = simdi - timedelta(hours=24)\n    isler = {}\n    for r in sorted(satirlar, key=lambda r: r["t"]):\n        d = isler.setdefault(r["is"], {"son": None, "islenen": 0, "atlanan": 0, "hata": 0})\n        d["son"] = r["durum"]\n        if r["t"] > esik:\n            d["islenen"] += int(r["islenen"])\n            d["atlanan"] += int(r["atlanan"])\n            d["hata"] += r["durum"] == "HATA"\n    sira = sorted(isler, key=lambda a: (isler[a]["son"] != "HATA", a))\n    return "\\n".join(f"{a}: son={isler[a][\'son\']} işlenen={isler[a][\'islenen\']} atlanan={isler[a][\'atlanan\']} hata={isler[a][\'hata\']}" for a in sira)\n',
        tests: 'G = """is,baslangic,durum,islenen,atlanan\nrapor,2024-11-03T07:45:00,BAŞARILI,12,0\nyedek,2024-11-03T08:00:00,HATA,0,0\nrapor,2024-11-04T07:45:00,UYARILI,10,2\nyedek,2024-11-04T02:00:00,HATA,0,0\nyedek,2024-11-04T08:00:00,HATA,0,0\narsiv,2024-11-04T06:00:00,BAŞARILI,40,1\n"""\nbeklenen = "yedek: son=HATA işlenen=0 atlanan=0 hata=2\\narsiv: son=BAŞARILI işlenen=40 atlanan=1 hata=0\\nrapor: son=UYARILI işlenen=10 atlanan=2 hata=0"\nassert sabah_ozeti(G) == beklenen, "Gelen:\\n" + sabah_ozeti(G)\nassert sabah_ozeti("is,baslangic,durum,islenen,atlanan\\n") == "", "Boş geçmiş"\n',
        hints: [
          'Zamanları datetime\'a çevir; "şimdi" en yeni kaydın zamanıdır (testte sabit kalır).',
          'Kayıtları zamana göre sıralayıp gezersen son durum kendiliğinden en yeni kayıt olur.',
          'Tam 24 saat önceki kayıt (08:00 → 08:00) pencere dışıdır: t > esik.'
        ],
        why: '"Şimdi"yi veriden almak, özeti test edilebilir ve yeniden üretilebilir kılar. HATA\'daki işleri başa almak ise okuyanın ilk satırda neye bakacağını bilmesini sağlar.'
      }
    ],
    faq: [
      {
        q: 'Teams webhook yerine Microsoft Graph API kullanmalı mıyım?',
        a: 'Yalnız bir kanala bildirim atacaksan webhook/Workflows yeterli ve kurulumu en basitidir. Kişilere doğrudan mesaj, dosya yükleme, takvim gibi işler gerekiyorsa Graph API ve bir uygulama kaydı (Azure AD/Entra) gerekir; bu da yetki onayı ister.'
      }
    ]
  }
);
})(window);
