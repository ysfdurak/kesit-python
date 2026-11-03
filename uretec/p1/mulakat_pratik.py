#!/usr/bin/env python3
"""Mülakat (m-391..394) ve Pratik (b-551..553) ek içeriği: kod çıktıları gerçekten çalıştırılarak yazılır."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emit import KOK, calistir
K1 = '''olaylar = [("10-01", "10-01 09:00"), ("10-01", "10-01 18:00"), ("10-02", "10-02 08:00"),
          ("10-03", "10-01 12:00"), ("10-03", "10-03 07:00")]

def zamana_gore():
    tablo, son = [], ""
    for parti in ["10-01", "10-02", "10-03"]:
        tablo += [z for p, z in olaylar if p == parti and z > son]
        son = max(tablo)
    return len(tablo)

def partiye_gore():
    tablo, son = set(), ""
    for parti in ["10-01", "10-02", "10-03"]:
        if parti > son:
            tablo |= {z for p, z in olaylar if p == parti}
            son = parti
    return len(tablo)

print(len(olaylar), zamana_gore(), partiye_gore())
'''
K2 = '''gunluk = [
    {"parti": "10-01", "gelen": 100, "eklenen": 95, "tekrar": 3, "red": 2},
    {"parti": "10-02", "gelen": 80, "eklenen": 70, "tekrar": 5, "red": 3},
    {"parti": "10-03", "gelen": 90, "eklenen": 0, "tekrar": 88, "red": 2},
]
tablo_satiri = 165

kayip = [g["parti"] for g in gunluk if g["gelen"] != g["eklenen"] + g["tekrar"] + g["red"]]
fark = tablo_satiri - sum(g["eklenen"] for g in gunluk)
print(kayip, fark)
print("yayımla" if not kayip and fark == 0 else "durdur")
'''
M = [
 dict(id='m-391', roles=['muhendis', 'otomasyon'], lv='orta', topic='Artımlı yükleme ve geç gelen veri', kind='kod-okuma',
  q='İki artımlı yükleme sürümü aynı olayları işliyor. Biri filigranı (watermark) olay zamanına, diğeri parti tarihine bağlıyor. Çıktı nedir, hangisini seçersin?',
  a='<p><b>Kısa cevap:</b> Olay zamanına bakan sürüm geç gelen olayı sessizce kaybeder, parti tarihine bakan kaybetmez.</p><p><b>Neden:</b> <code>10-03</code> partisinde gelen <code>10-01 12:00</code> olayı, filigran o anda <code>10-02 08:00</code> olduğu için "eski" sayılıp atılır. Hata çıkmaz, rapor eksik kalır. Parti tarihi ise verinin bize ulaştığı anı anlatır; olay ne kadar eski olursa olsun geldiği partiyle işlenir.</p><p><b>Üretimde:</b> Son birkaç günü yeniden okuyan bir geri bakış penceresi eklenir, çünkü kaynak dosyayı düzeltip yeniden gönderebilir. Bu da yükleme idempotent olduğu için güvenlidir. Filigran veriyle aynı işlemde yazılır.</p>',
  code=K1, follow=['Olay zamanına dayanmak zorunda olsaydın kaybı nasıl azaltırdın?', 'Geri bakış penceresini ne kadar seçersin, neye bakarsın?'], flags=['"Son zamandan büyükleri almak yeter" demek', 'Geç gelen veriyi hiç düşünmemek', 'Filigranı yüklemeden önce kalıcı yazmak'], tip='Sayıyı söyledikten sonra kaybın hata üretmediğini vurgula: asıl tehlike budur.'),
 dict(id='m-392', roles=['muhendis', 'analist', 'is-analisti'], lv='orta', topic='Veri kalitesi: satır mutabakatı', kind='kod-okuma',
  q='Çalışma günlüğünden yayın kararı veren küçük bir kalite testi var. Çıktı nedir? Bu test neyi yakalar, neyi yakalayamaz?',
  a='<p><b>Kısa cevap:</b> Her parti için <code>gelen = eklenen + tekrar + red</code> dengesi aranır, tablo satırı da eklenen toplamıyla karşılaştırılır. Burada <code>10-02</code> partisinde 2 satır hiçbir yerde görünmüyor, yayın durur.</p><p><b>Yakaladığı:</b> Kaybolan satır, yanlış sayım, tablonun dışarıdan değiştirilmesi. <code>10-03</code> satırı sorun değildir: yeniden gönderilen dosyada 88 tekrar normaldir, idempotent yükleme bunu ayıklamıştır.</p><p><b>Yakalayamadığı:</b> Değerin yanlış olması. Satır sayısı tutarken tutar sütunu kaymış olabilir; bunun için değer aralığı, kabul edilen değer listesi ve dönem karşılaştırması gibi ayrı testler gerekir. Testin bozulmayı gerçekten yakaladığını, veriyi bilerek bozarak denersin.</p>',
  code=K2, follow=['Hangi testler işi durdurmalı, hangileri yalnız uyarmalı?', 'Red oranına eşik koyar mısın? Nasıl seçersin?'], flags=['Yalnız "satır sayısı sıfır değil" testi yazmak', 'Testin temiz veride geçmesini yeterli saymak', 'Reddedilen satırları sayıya katmamak'], tip='Hata ve uyarı ayrımını örnekle anlat: çift satır işi durdurur, saati kaymış istemci raporlanır.'),
 dict(id='m-393', roles=['muhendis', 'backend'], lv='ileri', topic='İdempotent yükleme tasarımı', kind='tasarim',
  q='Gece çalışan bir yükleme işi yarıda kesilip yeniden başlatılıyor ve kaynak bazen aynı dosyayı iki kez gönderiyor. Satır çiftlenmemesini nasıl garanti eder, bunu nasıl kanıtlarsın?',
  a='<p><b>Tasarım:</b> Önce doğal anahtarı bul. Sistem numarası çoğu zaman işe yaramaz: aynı olay farklı numarayla iki kez gelebilir. Anahtarı veritabanında <code>UNIQUE</code> kısıtıyla koru ki her kod yolu için geçerli olsun. Yüklemeyi <code>ON CONFLICT DO NOTHING</code> (değişmeyen olaylar) ya da <code>DO UPDATE</code> (değişen kayıtlar) ile yaz; <code>INSERT OR REPLACE</code> satırı silip yeniden yazdığı için çoğu zaman istenmez.</p><p><b>İşlem sınırı:</b> Parti başına tek işlem: satırlar, reddedilenler, günlük ve filigran birlikte onaylanır. Çökerse parti hiç olmamış sayılır.</p><p><b>Kanıt:</b> Testte üç şey yap. Aynı işi iki kez çalıştır, satır sayısı değişmesin. Tek seferde ve gün gün yükleyip tablo özetlerini karşılaştır. Yüklemenin ortasında hata üret; filigranın ilerlemediğini ve yeniden çalıştırınca işin tamamlandığını göster.</p>',
  follow=['Doğal anahtar yoksa ne yaparsın?', 'Bu tasarım akış işlemede nasıl değişir?'], flags=['"try/except ile yakalarım" deyip çifti açıklamamak', 'Çift denetimini yalnız Python belleğinde yapmak', 'Filigranı veriden ayrı işlemde yazmak'], tip='Kanıt kısmını söyleyen aday az olur; test senaryosunu sayarak bitir.'),
 dict(id='m-394', roles=['analist', 'is-analisti'], lv='orta', topic='Vaka: toplam tutuyor ama veri yanlış', kind='vaka',
  q='Finans, iki sistemin kupon toplamının neredeyse aynı olduğunu söyleyip işi kapatmak istiyor. Fark yalnız yüzde 2. Ne yaparsın?',
  a='<p><b>Kısa cevap:</b> Toplamın tutması eşleşme demek değildir. Sipariş bazında karşılaştırırım, sonra karar veririm.</p><p><b>Adımlar:</b> Beklenen sonucu dosyaya bakmadan kuraldan hesaplarım. İki kaynağı anahtarla dış birleştirmeyle karşılaştırırım; iç birleştirme aradığım farkları siler. Farkları sınıflandırırım: eksik, fazla, çift, tutar farkı. Eksik ile çift birbirini götürdüğü için net rakam küçük görünebilir; önemli olan müşteriye söz verilen kuponun oluşması.</p><p><b>Sonuç:</b> Sınıfları adetleriyle ve sahipleriyle paylaşırım: çift kupon tekrar korumasını, tutar farkı kural sınırını işaret eder. Kabul ya da ret kararını önceden yazılmış kritere göre veririm. Kesit Python\'daki kupon mutabakatı projesi bu akışın uygulamasıdır.</p>',
  follow=['Fark kabul edilebilir mi kararını kim verir?', 'Bu denetimi her sürümde nasıl tekrar edersin?'], flags=['Net fark küçük diye kapatmak', 'Kendi hesabını dosyaya göre düzeltmek', 'Farkı sahibine götürmeden raporlamak'], tip='Önce kabul kriterini sor: tutarlılık mı, tutar mı önemli?'),
]
for q in M:
    if q.get('code'):
        _, o = calistir(q['code']); q['out'] = o.strip()
        print(q['id'], q['out'])
open(KOK + '/kaynak/v3/m5/mulakat_m5_01.js', 'w', encoding='utf-8').write(
  "/* Kesit Python: mülakat: artımlı yük, veri kalitesi, idempotent yükleme, mutabakat. uretec/p1 üretir. */\n(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(\n" + ',\n'.join(json.dumps(q, ensure_ascii=False) for q in M) + "\n); })(window);\n")

B = [
 dict(id='b-551', lv='ileri', topic='ETL ve Orkestrasyon', diff=2, kind='bug', title='Geç gelen satırı kaybeden filigran (hatayı bul)', tags=['etl', 'filigran', 'artımlı'], min=8,
  q='<p><code>artimli(partiler)</code> partileri sırayla işleyip tabloyu döndürmeli. <code>partiler</code>: <code>{parti: [(no, zaman), ...]}</code>. Olay zamanına bakan filtre, geç gelen satırı sessizce atıyor. Düzelt: her partideki tüm satırlar işlensin, aynı <code>no</code> iki kez girmesin. Sonuç <code>no</code> sıralı liste olsun.</p>',
  start='def artimli(partiler):\n    tablo, son = {}, ""\n    for parti in sorted(partiler):\n        for no, zaman in partiler[parti]:\n            if zaman > son:\n                tablo[no] = zaman\n        if tablo:\n            son = max(tablo.values())\n    return sorted(tablo.items())\n',
  sol='def artimli(partiler):\n    tablo = {}\n    for parti in sorted(partiler):\n        for no, zaman in partiler[parti]:\n            tablo.setdefault(no, zaman)\n    return sorted(tablo.items())\n',
  tests='_p = {"10-01": [(1, "10-01 09"), (2, "10-01 18")], "10-02": [(3, "10-02 08")], "10-03": [(4, "10-01 12"), (5, "10-03 07"), (3, "10-02 08")]}\nassert artimli(_p) == [(1, "10-01 09"), (2, "10-01 18"), (3, "10-02 08"), (4, "10-01 12"), (5, "10-03 07")], "Geç gelen 4 numara tabloda olmalı, 3 numara bir kez: " + repr(artimli(_p))\nassert artimli({}) == []\n',
  hints=['Filtre satırını kaldır; tekrarı no anahtarı çözer.', 'setdefault ilk geleni korur.'],
  why='Filtre "yeni" kavramını olay zamanına bağlıyordu. İşlem sırası parti tarihinden gelir; çifti ise anahtar engeller.'),
 dict(id='b-552', lv='ileri', topic='ETL ve Orkestrasyon', diff=2, kind='yaz', title='Satır mutabakatı ile kalite testi', tags=['etl', 'veri kalitesi', 'mutabakat'], min=8,
  q='<p><code>mutabakat(gunluk, tablo_satiri)</code> yaz. <code>gunluk</code>: <code>{"parti", "gelen", "eklenen", "tekrar", "red"}</code> sözlüklerinin listesi. Sözlük döndür: <code>"kayip"</code>: <code>gelen - (eklenen + tekrar + red)</code> sıfır olmayan partiler için <code>(parti, fark)</code> listesi; <code>"tablo_farki"</code>: <code>tablo_satiri</code> ile eklenen toplamının farkı; <code>"yayinla"</code>: ikisi de temizse <code>True</code>.</p>',
  start='def mutabakat(gunluk, tablo_satiri):\n    pass\n',
  sol='def mutabakat(gunluk, tablo_satiri):\n    kayip = [(g["parti"], g["gelen"] - (g["eklenen"] + g["tekrar"] + g["red"])) for g in gunluk]\n    kayip = [k for k in kayip if k[1] != 0]\n    fark = tablo_satiri - sum(g["eklenen"] for g in gunluk)\n    return {"kayip": kayip, "tablo_farki": fark, "yayinla": not kayip and fark == 0}\n',
  tests='_g = [{"parti": "a", "gelen": 10, "eklenen": 8, "tekrar": 1, "red": 1}, {"parti": "b", "gelen": 5, "eklenen": 3, "tekrar": 0, "red": 0}]\nassert mutabakat(_g, 11) == {"kayip": [("b", 2)], "tablo_farki": 0, "yayinla": False}, repr(mutabakat(_g, 11))\nassert mutabakat(_g[:1], 8) == {"kayip": [], "tablo_farki": 0, "yayinla": True}\nassert mutabakat(_g[:1], 9) == {"kayip": [], "tablo_farki": 1, "yayinla": False}, "Tablo farkı da yayını durdurmalı"\nassert mutabakat([], 0)["yayinla"] is True\n',
  hints=['Önce her parti için farkı hesapla, sonra sıfır olanları at.', 'not kayip boş listede True olur.'],
  why='Bu en ucuz ve en güçlü kalite testidir: bir satır eklenmedi, tekrar sayılmadı ve reddedilmediyse bir yerde kaybolmuştur.'),
 dict(id='b-553', lv='ileri', topic='ETL ve Orkestrasyon', diff=2, kind='yaz', title='Önce temizle, sonra doğal anahtarla tekilleştir', tags=['etl', 'doğal anahtar', 'sqlite3'], min=10, needs=['sqlite3'],
  q='<p>Kaynak aynı olayı farklı <code>id</code> ve farklı yazımla iki kez gönderebiliyor. <code>yukle(con, satirlar)</code> yaz. Satır: <code>{"id", "kul", "tur", "zaman"}</code>. Tür <code>strip().lower()</code> ile temizlenir. Tablo <code>olay(id, kul, tur, zaman)</code>, doğal anahtar <code>(kul, tur, zaman)</code> üzerinde UNIQUE olsun; yoksa oluştur. Yinelenen satır hata vermesin, ilk gelen kalsın. Eklenen satır sayısını döndür.</p>',
  start='def yukle(con, satirlar):\n    pass\n',
  sol='def yukle(con, satirlar):\n    con.execute("CREATE TABLE IF NOT EXISTS olay (id INTEGER, kul INTEGER, tur TEXT, zaman TEXT, UNIQUE (kul, tur, zaman))")\n    once = con.total_changes\n    temiz = [(s["id"], s["kul"], s["tur"].strip().lower(), s["zaman"]) for s in satirlar]\n    con.executemany("INSERT INTO olay VALUES (?, ?, ?, ?) ON CONFLICT (kul, tur, zaman) DO NOTHING", temiz)\n    return con.total_changes - once\n',
  tests='import sqlite3\n_c = sqlite3.connect(":memory:")\n_s = [{"id": 1, "kul": 5, "tur": "visit", "zaman": "10:00"}, {"id": 2, "kul": 5, "tur": " VISIT ", "zaman": "10:00"}, {"id": 3, "kul": 6, "tur": "visit", "zaman": "10:00"}]\nassert yukle(_c, _s) == 2, "Yazım farkına rağmen 2 satır eklenmeli"\nassert yukle(_c, _s) == 0, "İkinci yükleme satır eklememeli"\nassert _c.execute("SELECT id, tur FROM olay ORDER BY id").fetchall() == [(1, "visit"), (3, "visit")], "İlk gelen kalmalı ve tür temiz olmalı"\ntry:\n    _c.execute("INSERT INTO olay VALUES (9, 5, \'visit\', \'10:00\')")\n    assert False, "UNIQUE kısıtı tabloda olmalı"\nexcept sqlite3.IntegrityError:\n    pass\n',
  hints=['Temizlik yüklemeden önce: tekrar denetimi temiz değer üzerinde çalışır.', 'Eklenen sayısı için total_changes farkını al.'],
  why='Tekrarı temizlikten önce ararsan "VISIT" ile "visit" farklı görünür. Kısıtı veritabanına koymak kuralı her kod yolu için geçerli kılar.'),
]
open(KOK + '/kaynak/v2/b3/bank_ileri_etl.js', 'w', encoding='utf-8').write(
  "/* Kesit Python: pratik bankası: ETL ek görevleri (b-551..553). uretec/p1 üretir. */\n(function (W) {\n'use strict';\nconst B = W.PY_BANK = W.PY_BANK || [];\nB.push(\n" + ',\n'.join(json.dumps(b, ensure_ascii=False) for b in B) + "\n);\n})(window);\n")
