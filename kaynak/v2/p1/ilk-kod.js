/* Kesit Python: yeni başlayan için ilk ders. Kapı "Hiç bilmiyorum" buraya açılır. */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'ilk-kod',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 5,
  title: 'İlk kodun: birkaç dakikada başla',
  sum: 'Kurulum yok. Çalıştır\'a bas, ilk kodunun sonucunu gör.',
  goals: [],
  body: `
<p>Aşağıdaki kutuda <b>Çalıştır</b>'a bas. Python ilk seferde birkaç saniye hazırlanır, yavaş bağlantıda daha uzun sürebilir.</p>
<pre class="py">print("Merhaba, Python!")</pre>
<p>Bu senin ilk programın. <code>print</code>, parantez içindekini ekrana yazar. Tırnak içindeki her şey metindir.</p>
<h2>Şimdi değiştir</h2>
<p>Kutunun içine tıkla, tırnak içine kendi adını yaz ve yeniden çalıştır. Bozmaktan korkma: en kötü ihtimalle Python sana bir hata mesajı gösterir, sen de düzeltirsin.</p>
<h2>Hesap yaptır</h2>
<p>Tırnak olmayınca Python yazdığını hesaplar. Yıldız (<code>*</code>) çarpma demektir.</p>
<pre class="py">print(4 * 325)
print("4 * 325")</pre>
<p>İlk satır 1300 yazar. İkinci satır tırnak içinde olduğu için olduğu gibi yazılır. Programlamanın ilk kuralını gördün: bilgisayar tam olarak yazdığını yapar.</p>
<div class="tip"><b>Telefondaysan</b>Düz tırnak (") kullan. Bazı klavyeler kıvrık tırnak (“) yazar; Python onu tanımaz ve hata verir.</div>
<p>Sıradaki adım: aşağıdaki iki kısa alıştırma. Sonra "Python nedir?" dersiyle devam edersin.</p>`,
  ex: [
    { t: 'mc', id: 'ilk-kod-s1', q: '<code>print("2 + 3")</code> ne yazar?',
      o: ['5', '2 + 3', 'Hata verir', 'Hiçbir şey yazmaz'], a: 1,
      why: 'Tırnak içindeki her şey metindir, hesaplanmaz; olduğu gibi yazılır. Tırnaksız <code>print(2 + 3)</code> ise 5 yazar.' },
    { t: 'code', id: 'ilk-kod-1', q: '<p>Ekrana tam olarak <code>Merhaba, Python!</code> yazdır.</p>',
      start: 'print("")\n', sol: 'print("Merhaba, Python!")\n', expect: 'Merhaba, Python!\n',
      hints: ['Yazdırılacak metni iki tırnağın arasına yaz.', 'print("Merhaba, Python!")'],
      why: 'print parantez içindeki metni yazar. Çıktı harfi harfine denetlenir; virgül ve ünlem de metnin parçasıdır.' },
    { t: 'code', id: 'ilk-kod-2', q: '<p>Bir müşteri 3 adet 120 TL\'lik ürün aldı. Çarpmayı Python\'a yaptırarak yalnız sonucu yazdır.</p>',
      start: 'print()\n', sol: 'print(3 * 120)\n', expect: '360\n',
      tests: 'assert "*" in __kod__, "Sonucu elle yazma; çarpmayı * ile Python\'a yaptır"\n',
      hints: ['Tırnak kullanma; tırnak içindeki hesap yapılmaz.', 'print(3 * 120)'],
      why: 'Tırnaksız yazılan ifade önce hesaplanır, sonra sonucu yazılır.' }
  ],
  faq: [
    { q: 'Bir şey kurmam gerekiyor mu?', a: 'Hayır. Python tarayıcının içinde çalışır. İlk çalıştırmada motor bir kez iner (yaklaşık 6 MB), sonra çok daha hızlı açılır.' },
    { q: 'Hata aldım, bir şeyi bozdum mu?', a: 'Hayır. Hata mesajı yalnız o kutuyu ilgilendirir. Kodu düzeltip yeniden çalıştırman yeter.' }
  ],
  mistakes: [
    { bad: 'Print("Merhaba")', good: 'print("Merhaba")', why: 'Python büyük ve küçük harfi ayırır. Komutlar küçük harfle yazılır.' }
  ]
});
})(window);
