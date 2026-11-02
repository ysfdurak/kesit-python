/* Kesit Python — portföy sürümü: karşılama kapıları, Hakkında, geri bildirim formu, ders yorumları (Giscus),
   ziyaret sayacı (GoatCounter, çerezsiz), kalıcı depolama isteği ve yedekleme hatırlatması.
   Ayarlar config.js (window.KESIT_CONFIG) içinde; boş bırakılan özellik görünmez. */
(function () {
'use strict';
const C = window.PY_CORE; if (!C) return;
const P = C.P, esc = C.esc, VIEWS = C.VIEWS;
const CFG = () => window.KESIT_CONFIG || {};

const fbBtn = (ders, label) => C.issueLink(ders, 'Konu: ' + ders + '\n\nGeri bildirim:\n', label);

/* Ders yorumları: Giscus */
function giscusOn() { const g = CFG().giscus || {}; return !!(g.repo && g.repoId && g.category && g.categoryId); }
function mountGiscus(m, term) {
  const box = m.querySelector('#gsBox'); if (!box || !giscusOn()) return; const g = CFG().giscus; box.innerHTML = '';
  const theme = document.documentElement.getAttribute('data-theme');
  const dark = theme === 'dark' || (theme !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const sc = document.createElement('script'); sc.src = 'https://giscus.app/client.js'; sc.async = true; sc.crossOrigin = 'anonymous';
  const at = { repo: g.repo, 'repo-id': g.repoId, category: g.category, 'category-id': g.categoryId, mapping: 'specific', term, strict: '1', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: dark ? 'dark' : 'light', lang: 'tr', loading: 'lazy' };
  for (const k in at) sc.setAttribute('data-' + k, at[k]);
  box.appendChild(sc);
}

/* Ziyaret sayacı: GoatCounter */
const GC = { code: String(CFG().goatcounter || '').trim(), q: [], ready: false, last: '' };
function gcInit() {
  if (!GC.code || location.protocol === 'file:' || /claude\.ai|claudeusercontent|localhost|127\.0\.0\.1/.test(location.host)) { GC.code = ''; return; }
  window.goatcounter = { no_onload: true };
  const sc = document.createElement('script'); sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.setAttribute('data-goatcounter', 'https://' + GC.code + '.goatcounter.com/count');
  sc.onload = () => { GC.ready = true; GC.q.splice(0).forEach(v => { try { window.goatcounter.count(v); } catch (e) {} }); };
  document.head.appendChild(sc);
}
function gcSend(v) { if (!GC.code) return; if (GC.ready && window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count(v); } catch (e) {} } else if (GC.q.length < 50) GC.q.push(v); }
function gcPage() { if (!GC.code) return; const path = location.pathname + (location.hash || ''); if (path === GC.last) return; GC.last = path; gcSend({ path, title: document.title }); }

/* Kalıcı depolama */
let persistAsked = false;
window.addEventListener('py-saved', () => { if (persistAsked) return; persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(ok => ok || navigator.storage.persist()).catch(() => {}); } catch (e) {} });

/* Ana sayfa: karşılama kapıları ve yedekleme hatırlatması */
const doneCount = () => C.validDone();
function welcomeHTML() {
  const door = (k, n, t, d) => '<button type="button" class="door" data-kdoor="' + k + '"><span class="door-ic" aria-hidden="true">' + n + '</span><b>' + t + '</b><small>' + d + '</small></button>';
  return '<section class="panel welcome"><div><span class="eyebrow">Hoş geldin</span><h2>Nereden başlayalım?</h2><p class="muted" style="margin:6px 0 0;max-width:70ch">Birini seç; istediğin zaman değiştirebilirsin. Kurulum ve hesap gerekmez.</p></div><div class="doors">' +
    door('yeni', '1', 'Hiç bilmiyorum', 'İlk dersle başla. Kodu tarayıcında çalıştırarak adım adım ilerle.') +
    door('biraz', '2', 'Biraz biliyorum', 'Seviye testiyle nereden devam edeceğini bul.') +
    door('is', '3', 'İşim için lazım', 'Öğrenme yolunu seç: veri analisti, veri bilimci, web geliştirici, yapay zekâ ve diğerleri.') +
    '</div></section>';
}
function backupHTML() {
  const d = doneCount(); if (window.PY_SYNC || d < 10 || d - (P.bkDone || 0) < 10) return '';
  return '<section class="panel bkcard"><div class="grow"><b>İlerlemeni yedekle</b><span class="muted" style="font-size:.88rem">' + d + ' ders bitirdin. İlerlemen bu tarayıcıda saklanıyor; Profil sayfasından dosyaya kaydedersen kaybolmaz, başka cihazda da devam edersin.</span></div><button type="button" class="btn sm pri" data-kbk="1">Profil’e git</button></section>';
}
const homeBase = VIEWS.home.html;
VIEWS.home.html = function () { const show = !P.welcomed && doneCount() === 0; return (show ? welcomeHTML() : '') + backupHTML() + homeBase.call(this); };

/* Ders sayfası: geri bildirim ve yorumlar */
const lessonBase = VIEWS.lesson.html, lessonMount = VIEWS.lesson.mount;
VIEWS.lesson.html = function () {
  let h = lessonBase.call(this); const l = C.LMAP[C.V.id]; if (!l) return h;
  if (giscusOn()) h += '<section class="panel gs-wrap"><div class="sec-head"><h3>Yorumlar</h3><span class="muted" style="font-size:.82rem">GitHub hesabınla yorum yapabilirsin</span></div><div id="gsBox"><div class="muted">Yorumlar yükleniyor…</div></div></section>';
  return h;
};
VIEWS.lesson.mount = function (m) { if (lessonMount) lessonMount.call(this, m); mountGiscus(m, 'ders-' + C.V.id); };

/* Hakkında */
VIEWS.hakkinda = { html() {
  const c = CFG(), A = c.author || {};
  const ex = C.LESSONS.reduce((a, l) => a + (l.ex || []).length, 0);
  const link = (u, t) => u ? '<a class="btn sm" href="' + esc(u) + '" target="_blank" rel="noopener">' + t + '</a>' : '';
  const kpi = (v, t) => '<div class="panel kpi"><b class="num">' + Number(v).toLocaleString('tr-TR') + '</b><span>' + t + '</span></div>';
  const card = (t, body) => '<section class="panel about-card"><div class="sec-head"><h3>' + t + '</h3></div>' + body + '</section>';
  let h = '<div class="about"><div><h1>Hakkında</h1><p class="muted" style="max-width:68ch;margin:6px 0 0">Sıfırdan işe hazır seviyeye Türkçe Python eğitimi. Kurulum yok, hesap yok: tarayıcında çalışan gerçek bir Python motoruyla kod yazarsın, alıştırmalar otomatik testlerle anında denetlenir.</p></div>';
  h += '<div class="about-kpis">' + kpi(C.LESSONS.length, 'ders') + kpi(ex, 'ders içi alıştırma') + kpi(C.BANK.length, 'pratik görevi') + kpi((window.PY_ARENA || []).length, 'arena problemi') + kpi(C.PATHS.length, 'öğrenme yolu') + '</div>';
  if (A.name) h += card('Yapan', '<p style="margin:0"><b style="font-size:1.1rem">' + esc(A.name) + '</b>' + (A.title ? '<br><span class="muted">' + esc(A.title) + '</span>' : '') + '</p>' + (A.bio ? '<p style="margin:0">' + esc(A.bio) + '</p>' : '') + '<div class="row" style="gap:8px;flex-wrap:wrap">' + link(A.linkedin, 'LinkedIn') + link(A.github, 'GitHub') + link(A.repo, 'Kaynak kod') + '</div>');
  if (c.story) h += card('Nasıl yapıldı', '<p style="margin:0">' + esc(c.story) + '</p>');
  h += card('Görüşün önemli', '<p style="margin:0">Bu ücretsiz bir paylaşım ve portföy projesi. Bir hata gördüysen, anlatımı eksik bulduğun bir ders varsa ya da bir fikrin varsa yaz.</p>' + '<div class="row" style="gap:8px"><a class="btn sm" href="' + esc(C.issueUrl('Geri bildirim', 'Geri bildirim:\n')) + '" target="_blank" rel="noopener">Geri bildirim gönder</a></div>');
  const sib = [c.sqlUrl ? '<a href="' + esc(c.sqlUrl) + '">Kesit SQL</a>' : '', c.pbiUrl ? '<a href="' + esc(c.pbiUrl) + '">Kesit Power BI</a>' : ''].filter(Boolean);
  if (sib.length) h += card('Kardeş uygulamalar', '<p style="margin:0">Aynı mantıkla hazırlanmış diğer eğitimler: ' + sib.join(' ve ') + '. Banka, İK, teslimat, havayolu ve bisiklet veri setleri üç uygulamada aynıdır; Anadolu Market\'te aynı şirket ve siparişler kullanılır, Power BI modeli zenginleştirilmiştir.</p>');
  h += card('Sorumluluk notu', '<p style="margin:0">Kesit Python ücretsiz, ticari olmayan bir eğitim ve bilgi paylaşımı projesidir. İçerik özenle hazırlandı ve alıştırmalar otomatik testlerden geçirildi; yine de hatasız olduğu garanti edilmez ve içerik “olduğu gibi” sunulur. Profesyonel bir eğitim, danışmanlık ya da resmî bir sertifika yerine geçmez; bu uygulamada tamamlama belgesi yoktur, sınav sonuçların Profil\'de durur.</p><p style="margin:0">Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir; gerçek kişi ve kurumlarla benzerlik tesadüftür. Python Software Foundation ya da Python Institute ile bir bağımız yoktur; Python, PCEP ve PCAP adları ilgili kuruluşların markalarıdır. Sınav denemeleri özgün olarak yazılmıştır, gerçek sınav soruları değildir.</p>');
  h += card('Gizlilik', '<p style="margin:0">Hesap yok ve site kişisel veri toplamaz. İlerlemen yalnızca kendi tarayıcında saklanır; istersen Profil sayfasından dosyaya kaydedip başka cihazda yükleyebilirsin. Yazı tipleri bu sitenin kendi dosyalarından yüklenir. Site dosyaları ilk ziyarette tarayıcı önbelleğine alınır; yeni sürüm gelince eski önbellek silinir.</p><p style="margin:0">Python motoru (Pyodide) ve kullandığın kütüphaneler, kodu ilk çalıştırdığında jsDelivr’dan iner; bu sırada tarayıcın o sunucuya bağlanır ve IP adresin gibi standart bağlantı bilgileri ona iletilir. Yazdığın kod ve ilerlemen bu sunucuya gönderilmez.' + (giscusOn() ? ' Yorumlar GitHub Discussions üzerinden (Giscus) yapılır ve GitHub’ın koşullarına tabidir.' : '') + ' Geri bildirim bağlantıları GitHub Issues\'a (ya da ayarlanmışsa bir form hizmetine) gider; yalnızca yazdıklarını paylaşırsın.' + (GC.code ? ' Ziyaretler GoatCounter ile çerezsiz ve anonim olarak sayılır; kişiyi tanımlayan bir kimlik tutulmaz.' : '') + '</p>');
  h += card('Bilinen sınırlar', '<ul style="margin:0;padding-left:18px"><li>Python tarayıcıda çalışır (Pyodide, Python 3.12). Temel dil birebir aynıdır; gerçek iş parçacığı, süreç ve ağ yoktur. Bu derslerde ne beklemen gerektiği yazar, bilgisayarında dene görevleri verilir.</li><li>Flask, Django, Docker, Spark gibi araçların alıştırmaları taklit eder; gerçeği için "Kendi bilgisayarında" görevleri var.</li><li>input() girdileri çalıştırmadan önce verilir.</li><li>Çok uzun süren kod 60 saniyede durdurulur; Durdur düğmesi her zaman çalışır, motor yeniden başlar.</li></ul>');
  h += '<details class="panel about-card"><summary><b>Müfredat haritası</b></summary>' + C.curriculumHTML() + '</details>';
  h += card('Lisans', '<p style="margin:0">' + esc(c.license || 'Ders içerikleri ve veri setleri CC BY-NC 4.0 (kaynak göstererek, ticari olmayan amaçlarla paylaşılabilir); uygulama kodu MIT lisansıyla sunulur.') + '</p>');
  return h + '</div>';
} };
if (!C.NAV.some(x => x[0] === 'hakkinda')) C.NAV.push(['hakkinda', 'Hakkında']);
C.ICON.hakkinda = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';

/* Tıklamalar */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-kdoor],[data-kbk]'); if (!t) return;
  if (t.dataset.kdoor) {
    P.welcomed = true; C.save();
    if (t.dataset.kdoor === 'yeni') C.go('lesson', C.LESSONS[0].id);
    else if (t.dataset.kdoor === 'biraz') C.go('exam', 'seviye-tespit');
    else C.go('paths');
    return;
  }
  if (t.dataset.kbk) { P.bkDone = doneCount(); C.save(); C.go('profile'); }
});

gcInit();
if (GC.code) { const ps = history.pushState; history.pushState = function () { const r = ps.apply(this, arguments); setTimeout(gcPage, 0); return r; }; window.addEventListener('popstate', gcPage); setTimeout(gcPage, 0); }
})();
