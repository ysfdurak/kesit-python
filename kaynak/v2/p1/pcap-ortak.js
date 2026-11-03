/* Kesit Python: 'git-proje-yapisi' uzantısı: PCAP-31-04 bölüm 6.2 için issue, inceleme ve birleştirme kararı */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'git-proje-yapisi',
  min: 8,
  html: `<h2>Ortak çalışma: issue, inceleme, birleştirme kararı</h2>
<p>Git komutları işin yarısıdır; diğer yarısı insanlarla anlaşmaktır. Depo paylaşılınca değişiklik bir sohbetle başlar, bir kararla biter.</p>
<div class="tbl-wrap"><table><tr><th>Aşama</th><th>İyi uygulama</th></tr>
<tr><td>Issue (kayıt)</td><td>Ne bekleniyor, ne oluyor, nasıl tekrar edilir, hangi sürüm. Karar ve gerekçe de buraya yazılır.</td></tr>
<tr><td>Dal ve commit</td><td>Tek amaçlı dal, anlaşılır mesaj: <code>Kupon tutarını Decimal'e taşı</code>. Issue numarasını mesaja ekle.</td></tr>
<tr><td>Pull request</td><td>Neyi, neden değiştirdiğin ve nasıl denediğin. Küçük tutulan değişiklik daha iyi incelenir.</td></tr>
<tr><td>Kod inceleme</td><td>Kişiye değil koda, somut ve gerekçeli yorum: "Boş liste gelirse burada sıfıra bölünür, bir test ekleyelim mi?"</td></tr>
<tr><td>Yoruma cevap</td><td>Kabul ettiysen düzelt, etmediysen nedenini yaz. Sessizce kapatma; karar kayıtta kalsın.</td></tr>
<tr><td>CI (sürekli entegrasyon)</td><td>Her değişiklikte aynı testler aynı ortamda çalışır. "Bende çalışıyor" tartışmasını bitirir.</td></tr>
<tr><td>Birleştirme kararı</td><td>Testler geçti, inceleme onaylandı, açık yorum kalmadı. Biri eksikse birleştirme.</td></tr></table></div>
<p>Çakışma (merge conflict) en çok iki kişi aynı satırı değiştirince çıkar. Sık <code>git pull</code>, küçük değişiklik ve işi önceden konuşmak çakışmayı azaltır. Çıktığında iki tarafın niyetini oku, gerekiyorsa arkadaşına sor, sonra testleri yeniden çalıştır.</p>`,
  ex: [
    { t: 'mc', stage: 'Teşhis', id: 'git-proje-yapisi-o1', q: '<p>Hata kaydı açacaksın. Hangisi en kullanışlı issue metnidir?</p>',
      o: ['Rapor yine bozuk çıkıyor, bugün içinde acil bakılması gerekiyor lütfen', 'Sürüm 1.4: --ay 2024-12 ile toplam 0 çıkıyor, 1.450 bekleniyordu; adımlar ekte', 'Dün çalışıyordu, bugün açınca çalışmıyor, neden olduğunu anlamadım', 'Kod çok kötü yazılmış, bence tamamen baştan yazılması gerekiyor'], a: 1,
      why: 'İyi kayıt, başka birinin sorunu tekrar üretmesini sağlar: sürüm, adımlar, beklenen ve gerçek sonuç.' },
    { t: 'mc', stage: 'Teşhis', id: 'git-proje-yapisi-o2', q: '<p>Pull request\'te inceleyen onay verdi, ama CI\'daki iki test kırmızı. Ne yaparsın?</p>',
      o: ['Birleştirmem; önce testlerin neden düştüğünü çözerim', 'Onay verildiği için bekletmeden hemen birleştiririm', 'Kırmızı testleri kapatıp ardından birleştiririm', 'Yerelde geçiyorsa CI önemsizdir, birleştiririm'], a: 0,
      why: 'Onay ve otomatik testler ayrı sorulara cevap verir. Testler düşerken birleştirmek hatayı herkesin dalına taşır.' },
    { t: 'mc', stage: 'Teşhis', id: 'git-proje-yapisi-o3', q: '<p>İki geliştirici aynı fonksiyonun aynı satırını farklı dallarda değiştirdi. Birleştirmede ne beklersin?</p>',
      o: ['Git en son yazılan satırı otomatik olarak seçer', 'İki satır da dosyaya otomatik olarak eklenir', 'Git çakışma bildirir, kararı kişi verir', 'Dallardan biri kendiliğinden silinip gider'], a: 2,
      why: 'Aynı satırda hangi niyetin doğru olduğunu Git bilemez. İnsan karar verir, testler sonucu doğrular.' }
  ]
});
})(window);
