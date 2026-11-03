/* Kesit Python — uygulama çekirdeği: ilerleme, gezinti, vurgulama, editör, alıştırma denetimi */
(function () {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const unesc = s => String(s == null ? '' : s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const E = window.PY_ENGINE;
const LEVELS = window.PY_LEVELS, ORDER = window.PY_ORDER, TIER = window.PY_TIER, MODS = window.PY_MODS;
const LESSONS = window.PY_LESSONS || [], LMAP = {}; LESSONS.forEach(l => { LMAP[l.id] = l; });
Object.entries(window.PY_MOD_FIX || {}).forEach(([id, m]) => { if (LMAP[id]) LMAP[id].mod = m; });
Object.entries(window.PY_LV_FIX || {}).forEach(([id, v]) => { if (LMAP[id]) LMAP[id].lv = v; });
Object.entries(window.PY_TITLE_FIX || {}).forEach(([id, t]) => { if (LMAP[id]) LMAP[id].title = t; });
(window.PY_OPTIONAL || []).forEach(id => { if (LMAP[id]) LMAP[id].opt = true; });
(window.PY_EXT || []).forEach(x => { const l = LMAP[x.id]; if (!l) return; if (x.ex) l.ex = (l.ex || []).concat(x.ex); if (x.html) { const k = l.body.lastIndexOf('<section class="deep">'); const add = '<section class="more"><span class="eyebrow">Derinleş</span>' + x.html + '</section>'; l.body = k > 0 ? l.body.slice(0, k) + add + l.body.slice(k) : l.body + add; } if (x.min) l.min = (l.min || 15) + x.min; if (x.faq) l.faq = (l.faq || []).concat(x.faq); if (x.mistakes) l.mistakes = (l.mistakes || []).concat(x.mistakes); });
const STAGE_ORDER = ['Isınma', 'Teşhis', 'Kodu oku', 'Adım sırası', 'Rehberli', 'Kendin yaz', 'Hata avı', 'Meydan okuma', 'Mini proje', 'Kendi bilgisayarında'];
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const sameLessonSig = {};
LESSONS.forEach(l => { (l.ex || []).forEach(e => { if (!e.stage) e.stage = e.t === 'mc' ? 'Isınma' : e.t === 'predict' || e.t === 'order' ? 'Kodu oku' : e.t === 'local' ? 'Kendi bilgisayarında' : 'Kendin yaz'; });
  /* Kimliği olmayan alıştırmaların ilerleme anahtarı: eski sürümdeki sıra numarası korunur (ex_anahtar.js), yeni alıştırma içerik özetiyle anahtarlanır */
  const old = (window.PY_EXKEY || {})[l.id] || {}, seen = {};
  (l.ex || []).forEach(e => { if (e.id) return; let sig = String(fnv(e.t + '|' + (e.q || '') + '|' + (e.code || e.sol || ''))); seen[sig] = (seen[sig] || 0) + 1; if (seen[sig] > 1) sig += '.' + seen[sig]; e._k = old[sig] != null ? String(old[sig]) : 'h' + sig; });
  if (l.ex) { const rank = e => STAGE_ORDER.indexOf(e.stage); l.ex = l.ex.map((e, i) => [e, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]); } });
/* Ders metinlerindeki iç kimlikleri başlıklı bağlantıya çevir (<b>http-api</b> dersi → tıklanır başlık) */
function linkIds(h) { if (!h) return h; return String(h).replace(/<(b|code)>([a-z0-9]+(?:-[a-z0-9]+)*)<\/\1>/g, (m, tag, id, at, all) => { if (!LMAP[id]) return m; if (!id.includes('-') && !/^\s*ders/.test(all.slice(at + m.length, at + m.length + 8))) return m; return '<a class="lk" href="#/lesson/' + id + '" data-go="lesson" data-id="' + id + '">' + esc(LMAP[id].title) + '</a>'; }); }
/* Terim dili: Türkçe terimin ilk geçtiği yere İngilizcesi eklenir (ders metninde, kod ve bağlantı dışında) */
const TERMS = (window.PY_TERMS || []).map(([tr, en]) => [new RegExp('(?<![\\p{L}\\p{N}])(' + tr + ')(\\p{L}*)(?![\\p{L}\\p{N}]*\\s*\\()', 'iu'), en]);
function termify(h) { const parts = String(h).split(/(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<a [\s\S]*?<\/a>|<h[1-6][\s\S]*?<\/h[1-6]>|<[^>]+>)/); TERMS.forEach(([re, en]) => { if (new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(h)) return; for (let i = 0; i < parts.length; i += 2) { const m = re.exec(parts[i]); if (m) { const end = m.index + m[0].length; parts[i] = parts[i].slice(0, end) + ' (' + en + ')' + parts[i].slice(end); break; } } }); return parts.join(''); }
LESSONS.forEach(l => { l.body = termify(linkIds(l.body)); (l.ex || []).forEach(e => { if (e.why) e.why = linkIds(e.why); if (e.q) e.q = linkIds(e.q); }); (l.faq || []).forEach(f => { f.a = linkIds(f.a); }); });
const ORDERED = ORDER.map(id => LMAP[id]).filter(Boolean);
LESSONS.forEach(l => { if (!ORDER.includes(l.id)) ORDERED.push(l); });
ORDERED.forEach((l, i) => { l._i = i; });
const PATHS = window.PY_PATHS || [], PMAP = {}; PATHS.forEach(p => PMAP[p.id] = p);
const BANK = window.PY_BANK || [], BMAP = {}; BANK.forEach(t => BMAP[t.id] = t);
const EXAMS = window.PY_EXAMS || [], XMAP = {}; EXAMS.forEach(x => XMAP[x.id] = x);
const lvName = id => (LEVELS.find(l => l.id === id) || {}).name || id;
const fmtN = n => Number(n).toLocaleString('tr-TR');
const lvBadge = id => '<span class="lv lv-' + TIER(id) + '">' + esc(lvName(TIER(id))) + '</span>';
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- İlerleme ---------- */
const KEY = 'pythonpatika.v1';
const FRESH = () => ({ done: {}, ex: {}, bank: {}, exams: {}, rv: {}, xp: 0, days: {}, goal: '', theme: '', name: '', level: '', wrong: [], pg: '', _ts: 0, skip: {}, read: {}, ctx: '', os: '', base: {}, ar: {}, iv: {}, cont: null, conts: [], sims: [], drafts: {} });
function storeOk() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; } }
function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? Object.assign(FRESH(), o) : FRESH(); } catch (e) { return FRESH(); } }
const P = load();
/* Eski kayıtlar: seviye testi yanlışları tekrar kuyruğuna girmez */
Object.keys(P.rv || {}).forEach(k => { if (k.startsWith('exam:seviye-tespit#')) delete P.rv[k]; });
let saveT = null, saveWarned = false;
function validDone() { return Object.keys(P.done || {}).filter(id => LMAP[id]).length; }
function writeNow() { try { localStorage.setItem(KEY, JSON.stringify(P)); localStorage.setItem('kesit.ozet.python', JSON.stringify({ bitti: validDone(), toplam: ORDERED.length })); } catch (e) { if (!saveWarned) { saveWarned = true; toast('Tarayıcı ilerlemeni kaydedemedi: depolama dolu ya da kapalı. Profil\'den dosya yedeği al.'); } } window.dispatchEvent(new CustomEvent('py-saved')); }
function save() { P._ts = Date.now(); clearTimeout(saveT); saveT = setTimeout(writeNow, 150); }
window.addEventListener('pagehide', () => { if (saveT) { clearTimeout(saveT); writeNow(); } });
function replaceProgress(o) { Object.keys(P).forEach(k => delete P[k]); Object.assign(P, FRESH(), o); save(); render(); }
/* Yedek: birleştirme. Yerel ilerleme asla kaybolmaz; aynı kayıtta ileride olan kazanır. */
function mergeProgress(o) {
  const keep = (dst, src, better) => { Object.entries(src || {}).forEach(([k, v]) => { dst[k] = k in dst && better ? better(dst[k], v) : (k in dst ? dst[k] : v); }); };
  const added = Object.keys(o.done || {}).filter(id => LMAP[id] && !P.done[id]).length;
  keep(P.done, Object.fromEntries(Object.entries(o.done || {}).filter(([id]) => LMAP[id])), (a, b) => a < b ? a : b);
  keep(P.ex, o.ex, (a, b) => a < b ? a : b); keep(P.bank, o.bank); keep(P.skip, o.skip); keep(P.read, o.read); keep(P.base, o.base);
  keep(P.days, o.days, (a, b) => Math.max(a, b));
  keep(P.exams, o.exams, (a, b) => { const hist = (a.hist || []).concat(b.hist || []); const seen = new Set(); const h = hist.filter(x => { const k = x.d + '|' + x.pct; if (seen.has(k)) return false; seen.add(k); return true; }).slice(-20); return { best: Math.max(a.best || 0, b.best || 0), hist: h }; });
  keep(P.rv, o.rv);
  keep(P.ar, o.ar, (a, b) => { const subs = (a.subs || []).concat(b.subs || []); const seen = new Set(); return Object.assign({}, b, a, { best: Math.max(a.best || 0, b.best || 0), peek: a.peek || b.peek, subs: subs.filter(x => { const k = x.d + x.code; if (seen.has(k)) return false; seen.add(k); return true; }).slice(-20) }); });
  keep(P.iv, o.iv, (a, b) => (a.d || '') >= (b.d || '') ? a : b);
  ['conts', 'sims'].forEach(k => { const seen = new Set(); P[k] = (P[k] || []).concat(o[k] || []).filter(x => { const s = JSON.stringify(x); if (seen.has(s)) return false; seen.add(s); return true; }).slice(-30); });
  P.xp = Math.max(P.xp || 0, o.xp || 0);
  ['goal', 'level', 'name', 'theme', 'os', 'ctx'].forEach(k => { if (!P[k] && o[k]) P[k] = o[k]; });
  if (o.pg && typeof o.pg === 'object') { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; keep(P.pg, o.pg); }
  keep(P.drafts, o.drafts); if (!P.welcomed && o.welcomed) P.welcomed = true;
  save(); return added;
}
/* Yedek dosyasını doğrular: { app, v, date, data } ya da kimliksiz eski biçim. Geçersizse neden döner, hiçbir şey değişmez. */
function checkBackup(o) {
  if (!o || typeof o !== 'object') return { err: 'Bu dosya bir Kesit Python ilerleme dosyası değil.' };
  if (o.app && o.app !== 'kesit-python') return { err: 'Bu dosya başka bir uygulamaya ait (' + String(o.app).replace('kesit-', 'Kesit ').slice(0, 30) + '); hiçbir şey değiştirilmedi.' };
  const d = o.app ? o.data : o;
  if (!d || typeof d !== 'object' || (!d.done && !d.ex && d.xp == null)) return { err: 'Bu dosya bir Kesit Python ilerleme dosyası değil.' };
  if (!o.app) { const ids = Object.keys(d.done || {}), ok = ids.filter(id => LMAP[id]).length; const exKeys = Object.keys(d.ex || {}).slice(0, 200), exOk = exKeys.filter(k => LMAP[k.split('#')[0]] || /^(bank#|exam:)/.test(k)).length; if ((ids.length && ok < ids.length / 2) || (!ids.length && exKeys.length && exOk < exKeys.length / 2)) return { err: 'Bu dosyadaki derslerin çoğu Kesit Python\'da yok; başka bir uygulamanın yedeği olabilir. Hiçbir şey değiştirilmedi.' }; }
  return { data: d };
}
function addXP(n) { P.xp = (P.xp || 0) + n; const d = today(); P.days[d] = (P.days[d] || 0) + n; save(); }
function streak() { let n = 0; const d = new Date(); if (!P.days[today()]) d.setDate(d.getDate() - 1); for (;;) { const k = d.toISOString().slice(0, 10); if (!P.days[k]) break; n++; d.setDate(d.getDate() - 1); } return n; }
const DAILY_GOAL = 60;

/* ---------- Vurgulama ---------- */
const KW = 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' ');
const BI = 'print len range int str float bool list dict set tuple sum min max sorted enumerate zip map filter abs round open input type isinstance any all iter next reversed super property staticmethod classmethod getattr setattr hasattr id hash repr format divmod pow chr ord bin hex oct vars dir callable frozenset bytes bytearray slice object Exception ValueError TypeError KeyError IndexError ZeroDivisionError AttributeError RuntimeError StopIteration NotImplementedError FileNotFoundError AssertionError self cls'.split(' ');
const KWS = new Set(KW), BIS = new Set(BI);
function hl(code) {
  let out = '', i = 0; const s = String(code); const n = s.length;
  const re = /("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|[rbfuRBFU]{0,2}"(?:\\.|[^"\\\n])*"?|[rbfuRBFU]{0,2}'(?:\\.|[^'\\\n])*'?|#[^\n]*|@[\w.]+|\b0[xXbBoO][\da-fA-F_]+\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[jJ]?\b|\.\d[\d_]*(?:[eE][+-]?\d+)?[jJ]?\b|\b[A-Za-z_]\w*\b|\s+|[^\sA-Za-z_0-9"'#@.]+|[\s\S])/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[0]; const c = t[0];
    if (t.startsWith('#')) out += '<span class="c">' + esc(t) + '</span>';
    else if (t.startsWith('@')) out += '<span class="d">' + esc(t) + '</span>';
    else if (/^[rbfuRBFU]{0,2}["']/.test(t)) out += '<span class="s">' + esc(t) + '</span>';
    else if (/^\.?\d/.test(t)) out += '<span class="n">' + esc(t) + '</span>';
    else if (KWS.has(t)) out += '<span class="k">' + esc(t) + '</span>';
    else if (BIS.has(t)) out += '<span class="f">' + esc(t) + '</span>';
    else out += esc(t);
  }
  return out;
}

/* ---------- Bildirim ---------- */
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); const live = $('#live'); if (live) live.textContent = msg; }

/* ---------- Gezinti ---------- */
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
  lessons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></svg>',
  paths: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19l6-14 4 9 6-6"/></svg>',
  practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
  exams: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l14 8-14 8z"/></svg>',
  ref: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v14H4zM4 10h16M9 10v9"/></svg>',
  arena: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 3l6.5 6.5-9 9L5.5 12z"/><path d="M3 21l4.5-4.5M8 14l2 2"/></svg>',
  interview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H9l-5 4z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/></svg>',
  mistakes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>',
  data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/></svg>',
  placement: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h6l2 2h10v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>',
  cheat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/></svg>',
  glossary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>'
};
const NAVG = [
  ['Öğren', [['home', 'Ana sayfa'], ['paths', 'Öğrenme yolları'], ['lessons', 'Dersler'], ['review', 'Tekrar'], ['placement', 'Seviye testi', 'exam', 'seviye-tespit'], ['ai', 'Yapay Zekâ']]],
  ['Pratik', [['practice', 'Pratik'], ['arena', 'Python Arena'], ['exams', 'Sınavlar']]],
  ['Araçlar', [['play', 'Kod editörü']]],
  ['Kariyer', [['interview', 'Mülakat'], ['projects', 'Bitirme projeleri']]],
  ['Referans', [['data', 'Veri setleri'], ['mistakes', 'Sık hatalar'], ['cheat', 'Kopya kâğıdı', 'ref', 'kopya'], ['glossary', 'Sözlük', 'ref', 'sozluk']]],
  ['', [['profile', 'Profil'], ['hakkinda', 'Hakkında']]]
];
const NAV = NAVG.reduce((a, g) => a.concat(g[1]), []);
const TABNAV = ['home', 'lessons', 'ai', 'interview', 'menu'];   /* mobil alt menü; 'Menü' tüm bölümleri açar */
const V = { name: 'home', id: null, sub: null };
const SCROLL = {}; try { history.scrollRestoration = 'manual'; } catch (e) {}
function hashFor(v) { return '#/' + v.name + (v.id ? '/' + v.id : '') + (v.sub ? '/' + v.sub : ''); }
function go(name, id, sub) { SCROLL[location.hash] = window.scrollY; V.name = name; V.id = id || null; V.sub = sub || null; const h = hashFor(V); if (location.hash !== h) history.pushState(null, '', h); render(); window.scrollTo({ top: 0 }); const m = $('#main'); if (m) m.focus({ preventScroll: true }); }
function fromHash() { const p = location.hash.replace(/^#\/?/, '').split('/'); V.name = p[0] || 'home'; V.id = p[1] ? decodeURIComponent(p[1]) : null; V.sub = p[2] || null; if (!VIEWS[V.name]) V.name = 'home'; }
window.addEventListener('popstate', () => { fromHash(); render(); const y = SCROLL[location.hash] || 0; requestAnimationFrame(() => window.scrollTo({ top: y })); });

/* ---------- Durum yardımcıları ---------- */
/* Erken meydan okumalar (henüz görülmemiş yapı kullanan görevler) dersi bitirmek için gerekmez */
const reqEx = l => (l.ex || []).filter(e => !e.erken);
function exKey(l, i) { const e = l.ex[i]; return l.id + '#' + (e.id || e._k); }
function lessonState(l) { if (P.done[l.id] || (P.read && P.read[l.id])) return 'done'; const rq = reqEx(l); if (!rq.length) return P.done[l.id] ? 'done' : 'new'; const n = rq.filter(e => P.ex[l.id + '#' + (e.id || e._k)]).length; if (n === rq.length) return 'done'; return n ? 'part' : 'new'; }
function lessonPct(l) { if (P.done[l.id] || (P.read && P.read[l.id])) return 100; const rq = reqEx(l); if (!rq.length) return P.done[l.id] ? 100 : 0; return Math.round(100 * rq.filter(e => P.ex[l.id + '#' + (e.id || e._k)]).length / rq.length); }
function checkLessonDone(l) { if (lessonState(l) === 'done' && !P.done[l.id]) { P.done[l.id] = today(); addXP(30); toast('Ders tamamlandı: ' + l.title + ' (+30 XP)'); } }
function levelLessons(lv) { return ORDERED.filter(l => TIER(l.lv) === lv); }
/* İlerleme yüzdesi: isteğe bağlı dersler sayılmaz */
function levelPct(lv) { const ls = levelLessons(lv).filter(l => !l.opt); if (!ls.length) return 0; return Math.round(ls.reduce((a, l) => a + lessonPct(l), 0) / ls.length); }
function myLevel() { if (P.level) return P.level; if (levelPct('temel') >= 80) return levelPct('orta') >= 80 ? 'ileri' : 'orta'; return 'temel'; }
const LV_RANK = { temel: 0, orta: 1, ileri: 2 };
const belowLevel = l => !!P.level && (LV_RANK[TIER(l.lv)] || 0) < (LV_RANK[P.level] || 0);
const isSkipped = l => !!(P.skip && P.skip[l.id]);
/* Yolun etkin ders listesi: temelleri bilmiyorum denildiyse ön koşul dersleri başa eklenir */
function pathLessons(p) { const own = p.lessons.map(id => LMAP[id]).filter(Boolean); if (!P.base || P.base[p.id] !== 'yok') return own; const set = new Set(p.lessons); return (window.PY_PREREQ || []).filter(id => !set.has(id)).map(id => LMAP[id]).filter(Boolean).concat(own); }
const inFlow = l => lessonState(l) !== 'done' && !isSkipped(l) && !l.opt && !belowLevel(l);
function nextLesson() { const path = PMAP[P.goal]; const list = path ? pathLessons(path) : ORDERED; return list.find(inFlow) || null; }
function pathStat(p) { const ls = pathLessons(p), req = ls.filter(l => !l.opt); const n = req.filter(l => lessonState(l) === 'done').length; return { ls, req, n }; }
function ctxPath(l) { const c = PMAP[P.ctx] || PMAP[P.goal]; if (c && pathLessons(c).includes(l)) return c; const g = PMAP[P.goal]; return g && pathLessons(g).includes(l) ? g : null; }
function lessonSeq(l) { const ctx = ctxPath(l); const list = ctx ? pathLessons(ctx) : ORDERED; const i = list.indexOf(l); const fits = x => (l.opt || !x.opt) && !isSkipped(x); let prev = null, next = null; for (let k = i - 1; k >= 0; k--) { if (fits(list[k])) { prev = list[k]; break; } } for (let k = i + 1; k < list.length; k++) { if (fits(list[k]) || (l.opt && !list[k].opt)) { next = list[k]; break; } } return { ctx, list, i, prev, next }; }
function hours(min) { const h = min / 60; return h < 1 ? Math.round(min) + ' dk' : 'yaklaşık ' + (h < 10 ? Math.round(h * 2) / 2 : Math.round(h)).toLocaleString('tr-TR') + ' saat'; }
function repoUrl() { const c = window.KESIT_CONFIG || {}; return (c.author && c.author.repo) || 'https://github.com/ysfdurak/kesit-python'; }
/* Geri bildirim: form adresi yoksa önceden doldurulmuş GitHub Issue */
function issueUrl(title, body) { const c = window.KESIT_CONFIG || {}; const f = String(c.feedbackFormUrl || '').trim(); if (f) return f.indexOf('{ders}') >= 0 ? f.replace('{ders}', encodeURIComponent(title)) : f; return repoUrl() + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body || ''); }
const issueLink = (title, body, label) => '<a class="lk" style="font-size:.78rem" href="' + esc(issueUrl(title, body)) + '" target="_blank" rel="noopener">' + (label || 'Sorun bildir') + '</a>';
function noteWrong(key, kind) { P.rv[key] = { due: Date.now() + 864e5, iv: 1, k: kind, n: ((P.rv[key] || {}).n || 0) + 1 }; save(); }
function noteRight(key) { const r = P.rv[key]; if (!r) return; const iv = Math.min((r.iv || 1) * 2.5, 60); r.iv = iv; r.due = Date.now() + iv * 864e5; r.ok = (r.ok || 0) + 1; if (r.ok >= 3) delete P.rv[key]; save(); }
function dueReviews() { const now = Date.now(); return Object.entries(P.rv).filter(([k, r]) => r.due <= now).map(([k]) => k); }

/* ---------- Ortak parçalar ---------- */
function codebox(code, opt = {}) {
  const id = 'cb' + Math.random().toString(36).slice(2, 8);
  return '<div class="codebox" data-cb="' + id + '"><pre><code>' + hl(code) + '</code></pre><div class="tools"><span class="lbl">' + esc(opt.label || 'Python') + '</span>' + (opt.run === false ? '' : '<button type="button" data-act="cb-run">Çalıştır</button><button type="button" data-act="cb-open">Kod editöründe aç</button>') + '<button type="button" data-act="cb-copy">Kopyala</button></div><div class="out" hidden></div><textarea class="sr-only" aria-hidden="true" tabindex="-1" data-src>' + esc(code) + '</textarea></div>';
}
function enhance(root) {
  $$('pre.py', root).forEach(pre => { const code = unesc(pre.innerHTML).replace(/^\n+|\s+$/g, ''); const w = document.createElement('div'); w.innerHTML = codebox(code); pre.replaceWith(w.firstChild); });
  $$('pre.code', root).forEach(pre => { const code = unesc(pre.innerHTML).replace(/^\n+|\s+$/g, ''); const w = document.createElement('div'); w.innerHTML = codebox(code, { run: false }); pre.replaceWith(w.firstChild); });
  $$('pre.out', root).forEach(pre => { pre.className = 'outbox'; });
}
function outHTML(res, opt = {}) {
  let h = '';
  if (res.out) h += '<pre class="stdout">' + esc(res.out) + '</pre>';
  if (res.stderr) h += '<pre class="stdout stderr" title="Standart hata akışı (stderr)">' + esc(res.stderr) + '</pre>';
  if (res.err) {
    const e = res.err; const tip = E.explain(e);
    h += '<div class="errbox"><b>' + esc(e.type) + (e.line ? ' — ' + (e.where === '<test>' ? 'test' : 'satır ' + e.line) : '') + '</b>' + esc(e.msg || '') + (tip ? '<small>' + esc(tip) + '</small>' : '') + '</div>';
  }
  if (res.images && res.images.length) h += res.images.map(b => '<img class="plotimg" alt="Kodun çizdiği grafik" src="data:image/png;base64,' + b + '">').join('');
  if (!res.out && !res.err && !res.stderr && !(res.images && res.images.length)) h += '<p class="muted" style="margin:0">Çıktı yok. Sonucu görmek için print() kullan.</p>';
  if (opt.ms != null) h += '<div class="ms">' + opt.ms + ' ms</div>';
  return h;
}
const BUSY = { bos: 'Python motoru yükleniyor (ilk seferde 5–15 sn)…', yukleniyor: 'Python motoru yükleniyor (ilk seferde 5–15 sn)…', paket: 'Paket ve veri yükleniyor (ilk kullanımda sürebilir)…', hazir: 'Çalışıyor…', yok: 'Python motoru yükleniyor (ilk seferde 5–15 sn)…' };
function busyHTML(label) { return '<div class="busy"><span class="spin" aria-hidden="true"></span><span class="busy-msg" role="status"' + (label ? ' data-fixed="1"' : '') + '>' + esc(label || BUSY[E.state()] || BUSY.hazir) + '</span><button type="button" class="btn sm ghost" data-act="engine-stop">Durdur</button></div>'; }
E.onState(st => { $$('.busy-msg').forEach(el => { if (!el.dataset.fixed) el.textContent = BUSY[st] || BUSY.hazir; }); });
async function runBox(box) {
  const out = $('.out', box), code = $('[data-src]', box).value; out.hidden = false; out.innerHTML = busyHTML();
  const art = box.closest('.theory');
  try {
    let note = '';
    if (art) {
      /* Defter (notebook) davranışı: ders sayfasındaki örnekler ortak bir ad alanında çalışır; önceki örnekler henüz çalışmadıysa önce onlar sessizce çalıştırılır. */
      const key = 'ders:' + (V.id || '');
      if (art.dataset.ns !== key || +art.dataset.gen !== E.generation()) { await E.resetNs(key); art.dataset.gen = E.generation(); art.dataset.ns = key; $$('.codebox', art).forEach(b => delete b.dataset.ran); }
      const boxes = $$('.codebox', art).filter(b => $('[data-act="cb-run"]', b));
      const idx = boxes.indexOf(box); let pre = 0;
      for (const b of boxes.slice(0, idx)) { if (b.dataset.ran) continue; const c = $('[data-src]', b).value; if (/\binput\(/.test(c)) continue; const pr = await E.run({ code: c, needs: needsOf(c), ns: key }); if (pr.stopped) { out.innerHTML = outHTML(pr); return; } b.dataset.ran = '1'; pre++; }
      if (pre) note = '<div class="ms" style="text-align:left">Bu örnek önceki örneklerin tanımlarını kullanabildiği için yukarıdaki ' + pre + ' örnek de arka planda çalıştırıldı.</div>';
      const res = await E.run({ code, needs: needsOf(code), ns: key });
      if (+art.dataset.gen !== E.generation()) { art.dataset.gen = E.generation(); $$('.codebox', art).forEach(b => delete b.dataset.ran); } else if (!res.stopped) box.dataset.ran = '1';
      out.innerHTML = outHTML(res, { ms: res.ms }) + note;
    } else { const res = await E.run({ code, needs: needsOf(code) }); out.innerHTML = outHTML(res, { ms: res.ms }); }
  } catch (e) { out.innerHTML = engineFail(); }
}
function needsOf(code) { const n = []; if (/\bimport\s+pandas|from\s+pandas/.test(code)) n.push('pandas'); if (/\bimport\s+numpy|from\s+numpy/.test(code)) n.push('numpy'); if (/\bmatplotlib/.test(code)) n.push('matplotlib'); return n; }
function engineFail() { return '<div class="errbox"><b>Python motoru yüklenemedi</b>İnternet bağlantısı gerekir: motor ilk çalıştırmada indirilir, sonra tarayıcı önbelleğinden gelir.<small>Kodu okuyup çözümleri inceleyebilirsin. Bağlantı gelince Çalıştır düğmesine yeniden bas.</small></div>'; }

/* Editör: vurgulu katman + textarea */
function editor(id, code, opt = {}) {
  return '<div class="ed-shell"><div class="ed-top"><span class="lbl">' + esc(opt.label || 'main.py') + '</span><span class="muted" style="font-size:.74rem">Tab: 4 boşluk · Ctrl+Enter: çalıştır</span></div><div class="ed" style="height:' + (opt.h || 240) + 'px"><pre class="hl" aria-hidden="true"><code>' + hl(code) + '\n</code></pre><textarea id="' + id + '" class="ta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python kodu">' + esc(code) + '</textarea></div></div>';
}
function bindEditor(ta) {
  const pre = ta.previousElementSibling; const code = $('code', pre);
  const paint = () => { code.innerHTML = hl(ta.value) + '\n'; pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; };
  ta.addEventListener('input', paint); ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
  ta.addEventListener('keydown', ev => {
    if (ev.key === 'Tab') { ev.preventDefault(); const s = ta.selectionStart, e = ta.selectionEnd; if (ev.shiftKey) { const ls = ta.value.lastIndexOf('\n', s - 1) + 1; if (ta.value.slice(ls, ls + 4) === '    ') { ta.value = ta.value.slice(0, ls) + ta.value.slice(ls + 4); ta.selectionStart = ta.selectionEnd = Math.max(ls, s - 4); } } else { ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(e); ta.selectionStart = ta.selectionEnd = s + 4; } paint(); }
    else if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey) { const s = ta.selectionStart; const ls = ta.value.lastIndexOf('\n', s - 1) + 1; const line = ta.value.slice(ls, s); const ind = (line.match(/^\s*/) || [''])[0] + (/:\s*$/.test(line) ? '    ' : ''); ev.preventDefault(); ta.value = ta.value.slice(0, s) + '\n' + ind + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 1 + ind.length; paint(); }
    else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); const b = ta.closest('[data-exwrap]') && $('[data-act="ex-check"]', ta.closest('[data-exwrap]')) || ta.closest('.play') && $('[data-act="play-run"]', ta.closest('.play')); if (b) b.click(); }
  });
  paint();
}

/* Alıştırma (code) görünümü: ders, pratik ve sınav aynı parçayı kullanır */
function codeExView(e, key, opt = {}) {
  const st = P.ex[key]; const draft = P.pg && P.pg[key] != null ? P.pg[key] : null;
  const code = draft != null ? draft : (e.start || '# kodunu buraya yaz\n');
  return '<div class="ex-grid" data-exwrap="' + esc(key) + '"><div class="panel brief"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Kod görevi') + (e.kind === 'bug' ? ' · hatayı bul' : e.kind === 'tamamla' ? ' · tamamla' : '') + '</span>' + (st ? '<span class="chip on">Çözüldü</span>' : '') + '</div><div class="q">' + e.q + '</div>' + (e.guide && e.guide.length ? '<div class="guide"><span class="eyebrow">Yol haritası</span><ol>' + e.guide.map(g => '<li><label><input type="checkbox"> <span>' + g + '</span></label></li>').join('') + '</ol></div>' : '') + (e.example ? '<details class="exmpl"><summary>Benzer bir örnek gör</summary>' + codebox(e.example, { label: 'örnek' }) + '</details>' : '') + (e.stdin && e.stdin.length ? '<p class="muted" style="font-size:.84rem;margin:0">input() çağrılarına sırayla verilecek girdiler: <code>' + e.stdin.map(esc).join('</code>, <code>') + '</code></p>' : '') + (e.expect != null ? '<details><summary>Beklenen çıktı</summary><pre class="outbox">' + esc(e.expect) + '</pre></details>' : '') + '<div class="row" style="gap:8px"><button class="btn sm" data-act="ex-hint">İpucu</button>' + (opt.noSol ? '' : '<button class="btn sm ghost" data-act="ex-sol">Çözümü göster</button>') + '<button class="btn sm ghost" data-act="ex-reset">Sıfırla</button></div><div class="hints" hidden></div><div class="solbox" hidden></div></div><div class="work">' + editor('ta-' + key.replace(/[^\w-]/g, '_'), code, { h: opt.h || 260 }) + '<div class="row"><button class="btn pri" data-act="ex-check">' + (opt.checkLabel || 'Kontrol et') + '</button><button class="btn" data-act="ex-run">Sadece çalıştır</button><span class="muted engine-note" style="font-size:.8rem"></span></div><div class="out exout" hidden></div></div></div>';
}
function mountCodeEx(wrap, e, key, opt = {}) {
  const ta = $('textarea.ta', wrap); bindEditor(ta);
  let hintN = 0;
  const saveDraft = () => { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; if (ta.value !== (e.start || '')) P.pg[key] = ta.value; else delete P.pg[key]; save(); };
  ta.addEventListener('input', () => { clearTimeout(ta._d); ta._d = setTimeout(saveDraft, 600); });
  wrap.addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return; const act = b.dataset.act; const out = $('.exout', wrap);
    if (act === 'ex-hint') { const h = $('.hints', wrap); const hints = e.hints || []; if (!hints.length) { toast('Bu görevde ipucu yok.'); return; } hintN = Math.min(hintN + 1, hints.length); h.hidden = false; h.innerHTML = hints.slice(0, hintN).map((x, i) => '<div class="tip"><b>İpucu ' + (i + 1) + '</b>' + x + '</div>').join(''); if (hintN < hints.length) b.textContent = 'Bir ipucu daha'; else b.disabled = true; }
    if (act === 'ex-sol') { const s = $('.solbox', wrap); s.hidden = !s.hidden; if (!s.hidden && !s.innerHTML) { s.innerHTML = '<p class="eyebrow">Örnek çözüm</p>' + codebox(e.sol || '', { label: 'çözüm' }) + (e.why ? '<p class="muted">' + e.why + '</p>' : ''); } }
    if (act === 'ex-reset') { ta.value = e.start || ''; ta.dispatchEvent(new Event('input')); out.hidden = true; }
    if (act === 'ex-run' || act === 'ex-check') {
      const check = act === 'ex-check'; out.hidden = false; out.innerHTML = busyHTML();
      let res; try { res = await E.run({ code: ta.value, tests: check ? (e.tests || '') : '', stdin: e.stdin, needs: (e.needs || []).concat(needsOf(ta.value)) }); } catch (x) { out.innerHTML = engineFail(); return; }
      let pass = check && !res.err; let expectMsg = '';
      if (check && pass && e.expect != null && !E.sameOut(res.out, e.expect)) { pass = false; expectMsg = '<div class="errbox"><b>Çıktı beklenenden farklı</b><div class="cmp2"><div><span class="eyebrow">Beklenen</span><pre>' + esc(String(e.expect).trim()) + '</pre></div><div><span class="eyebrow">Senin çıktın</span><pre>' + esc(String(res.out).trim()) + '</pre></div></div></div>'; }
      out.innerHTML = (check ? (pass ? '<div class="okbox"><b>Tüm testler geçti ✓</b>' + (st(key) ? 'Zaten çözmüştün; iyi tekrar.' : 'Harika iş.') + '</div>' : (res.err && res.err.phase === 'test' ? '<div class="errbox"><b>Test başarısız' + (res.err.type !== 'AssertionError' ? ' (' + esc(res.err.type) + ')' : '') + '</b>' + esc(res.err.msg || 'Sonuç beklenenle uyuşmuyor.') + '<small>' + (/^\s*(def|class)\s/m.test(e.sol || '') ? 'Testler kodun çalıştıktan sonra senin tanımladığın adları çağırır; fonksiyon adını ve dönüş değerini kontrol et.' : 'Testler kodun çalıştıktan sonra değişkenleri ve çıktıyı denetler; adları görevdeki gibi yaz.') + '</small></div>' : '')) : '') + expectMsg + outHTML({ out: res.out, images: res.images, stderr: res.stderr, err: res.err && (res.err.phase !== 'test' || !check) ? res.err : null }, { ms: res.ms });
      if (res.stopped) return;
      if (check) { if (pass) { if (!P.ex[key]) { P.ex[key] = today(); addXP(e.pts ? e.pts * 4 : 15); } noteRight(key); if (opt.onPass) opt.onPass(); save(); if (opt.rerender !== false) { const chip = $('.brief .chip', wrap); if (!chip) $('.brief .row', wrap).insertAdjacentHTML('beforeend', '<span class="chip on">Çözüldü</span>'); renderStats(); } } else { noteWrong(key, opt.kind || 'code'); } }
    }
  });
  function st(k) { return !!P.ex[k]; }
}
function exView(e, key, opt = {}) {
  if (e.t === 'mc') return mcView(e, key, opt);
  if (e.t === 'predict') return mcView(e, key, Object.assign({ label: 'Çıktıyı tahmin et' }, opt, { code: e.code }));
  if (e.t === 'order') return orderView(e, key, opt);
  if (e.t === 'local') return localView(e, key, opt);
  return codeExView(e, key, Object.assign({ label: e.kind === 'bug' ? 'Hatayı bul' : e.kind === 'tamamla' ? 'Tamamla' : 'Kod görevi' }, opt));
}
function exMount(w, e, key, opt = {}) {
  if (e.t === 'mc' || e.t === 'predict') return mountMc($('.mc', w), e, key, opt);
  if (e.t === 'order') return mountOrder($('.ord', w), e, key, opt);
  if (e.t === 'local') return mountLocal($('.local', w), e, key, opt);
  return mountCodeEx($('[data-exwrap]', w), e, key, opt);
}
function rng(seed) { let h = fnv(String(seed)) || 1; return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffled(n, seed) { const a = Array.from({ length: n }, (_, i) => i), r = rng(seed); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.every((v, i) => v === i) && n > 1) a.reverse(); return a; }
/* Şık sırası: soru anahtarıyla sabit karışır. "Hepsi / hiçbiri" gibi konuma bağlı şıklar sonda kalır. */
const FIXED_OPT = /^(?:<[^>]+>)?\s*(hepsi|hiçbiri|hiç biri|yukarıdaki|tümü|her ikisi|ikisi de|[a-d] ve [a-d]\b)/i;
function optOrder(o, key) { const idx = shuffled(o.length, 'opt:' + key); return idx.filter(i => !FIXED_OPT.test(String(o[i]))).concat(idx.filter(i => FIXED_OPT.test(String(o[i])))); }
/* Kendi bilgisayarında yapılan görev: yönerge, dosya, komut, beklenen çıktı ve "yaptım" onayı */
function localView(e, key, opt = {}) {
  const st = P.ex[key];
  return '<div class="panel brief local" data-local="' + esc(key) + '"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Kendi bilgisayarında') + '</span>' + (st ? '<span class="chip on">Yaptım</span>' : '') + '</div><div class="q">' + e.q + '</div>' + (e.steps && e.steps.length ? '<ol class="lsteps">' + e.steps.map(s => '<li><label><input type="checkbox"> <span>' + s + '</span></label></li>').join('') + '</ol>' : '') + (e.file ? codebox(e.file, { run: false, label: e.fname || 'dosya' }) : '') + (e.cmd ? '<span class="eyebrow">Terminalde</span>' + codebox(e.cmd, { run: false, label: 'terminal' }) : '') + (e.expect != null ? '<span class="eyebrow">Beklenen çıktı</span><pre class="outbox">' + esc(e.expect) + '</pre>' : '') + (e.why ? '<p class="muted" style="margin:0;font-size:.88rem">' + e.why + '</p>' : '') + '<div class="row"><button class="btn pri sm" data-act="local-done">' + (st ? 'Yaptım ✓' : 'Bunu yaptım') + '</button></div></div>';
}
function mountLocal(el, e, key, opt = {}) { el.addEventListener('click', ev => { const b = ev.target.closest('[data-act="local-done"]'); if (!b) return; if (!P.ex[key]) { P.ex[key] = today(); addXP(10); } if (opt.onPass) opt.onPass(); save(); renderStats(); b.textContent = 'Yaptım ✓'; if (!$('.chip.on', el)) $('.row', el).insertAdjacentHTML('beforeend', '<span class="chip on">Yaptım</span>'); }); }
function orderView(e, key, opt = {}) {
  const st = P.ex[key]; const ord = shuffled(e.lines.length, key); const cell = t => e.plain ? esc(t) : hl(t);
  return '<div class="panel brief ord" data-ord="' + esc(key) + '"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Satırları sırala') + '</span>' + (st ? '<span class="chip on">Çözüldü</span>' : '') + '</div><div class="q">' + e.q + '</div><p class="muted" style="margin:0;font-size:.84rem">' + (e.plain ? 'Adımları ↑ ↓ düğmeleriyle doğru sıraya koy.' : 'Satırları ↑ ↓ düğmeleriyle doğru sıraya koy. Girintiler hazır; sadece sıra önemli.') + '</p><ol class="olines">' + ord.map(i => '<li data-i="' + i + '"><code>' + cell(e.lines[i]) + '</code><span class="mv"><button type="button" data-mv="-1" aria-label="Yukarı">↑</button><button type="button" data-mv="1" aria-label="Aşağı">↓</button></span></li>').join('') + '</ol><div class="row"><button class="btn pri sm" data-act="ord-check">Kontrol et</button>' + (e.plain ? '' : '<button class="btn sm ghost" data-act="ord-run">Bu sırayla çalıştır</button>') + (opt.noSol ? '' : '<button class="btn sm ghost" data-act="ord-sol">Doğru sırayı göster</button>') + '</div><div class="out ordout" hidden></div></div>';
}
function mountOrder(el, e, key, opt = {}) {
  const ol = $('.olines', el); const cur = () => $$('li', ol).map(li => +li.dataset.i); const code = () => cur().map(i => e.lines[i]).join('\n') + '\n';
  el.addEventListener('click', async ev => {
    const mv = ev.target.closest('[data-mv]'); if (mv) { const li = mv.closest('li'); const d = +mv.dataset.mv; if (d < 0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling); if (d > 0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li); li.querySelector('[data-mv="' + d + '"]').focus(); $$('li', ol).forEach(x => x.classList.remove('bad', 'good')); return; }
    const b = ev.target.closest('button[data-act]'); if (!b) return; const out = $('.ordout', el);
    if (b.dataset.act === 'ord-sol') { const items = $$('li', ol); e.lines.forEach((_, i) => ol.appendChild(items.find(li => +li.dataset.i === i))); out.hidden = false; out.innerHTML = '<div class="note"><b>Doğru sıra</b>' + (e.why || '') + '</div>'; return; }
    if (b.dataset.act === 'ord-run') { out.hidden = false; out.innerHTML = busyHTML(); try { const r = await E.run({ code: code(), stdin: e.stdin }); out.innerHTML = outHTML(r); } catch (x) { out.innerHTML = engineFail(); } return; }
    if (b.dataset.act === 'ord-check') {
      const c = cur(); const ok = c.every((v, i) => v === i || e.lines[v] === e.lines[i]);
      $$('li', ol).forEach((li, i) => { li.classList.toggle('good', +li.dataset.i === i); li.classList.toggle('bad', +li.dataset.i !== i); });
      out.hidden = false;
      if (ok) { out.innerHTML = '<div class="okbox"><b>Doğru sıra ✓</b>' + (e.why || '') + '</div>'; if (!P.ex[key]) { P.ex[key] = today(); addXP(10); } noteRight(key); if (opt.onPass) opt.onPass(); save(); renderStats(); }
      else { const first = c.findIndex((v, i) => v !== i); out.innerHTML = '<div class="errbox"><b>Henüz değil</b>' + (first + 1) + '. satırdan itibaren sıra bozuk. Yeşil satırlar doğru yerde.' + (e.hint ? '<small>' + esc(e.hint) + '</small>' : '<small>İpucu: önce tanımlar ve içe aktarmalar, sonra döngü/koşul başlığı, en son çıktı.</small>') + '</div>'; noteWrong(key, 'order'); }
    }
  });
}
function mcView(e, key, opt = {}) {
  const st = P.ex[key];
  return '<div class="panel brief mc" data-mc="' + esc(key) + '"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Soru') + '</span>' + (st ? '<span class="chip on">Doğru</span>' : '') + '</div><div class="q">' + e.q + '</div>' + (opt.code ? codebox(opt.code, { run: false, label: 'Önce tahmin et, sonra çalıştır' }) : '') + '<div class="opts">' + optOrder(e.o, key).map(i => { const o = e.o[i]; return '<button type="button" class="opt" data-i="' + i + '">' + (opt.code ? '<pre class="optpre">' + esc(o) + '</pre>' : o) + '</button>'; }).join('') + '</div><div class="why" hidden></div></div>';
}
function mountMc(el, e, key, opt = {}) {
  el.addEventListener('click', ev => {
    const b = ev.target.closest('.opt'); if (!b || el.dataset.lock) return; const i = +b.dataset.i; const ok = i === e.a;
    $$('.opt', el).forEach(x => { x.disabled = true; if (+x.dataset.i === e.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong'); el.dataset.lock = '1';
    const w = $('.why', el); w.hidden = false; w.innerHTML = '<div class="' + (ok ? 'tip' : 'warn') + '"><b>' + (ok ? 'Doğru' : 'Yanlış') + '</b>' + (e.why || '') + '</div>' + (e.t === 'predict' ? codebox(e.code, { label: 'Şimdi çalıştır ve kendin gör' }) : '') + '<button class="btn sm ghost" data-act="mc-again">Tekrar dene</button>';
    if (ok) { if (!P.ex[key]) { P.ex[key] = today(); addXP(8); } noteRight(key); if (opt.onPass) opt.onPass(); save(); renderStats(); } else noteWrong(key, 'mc');
    if (opt.onAnswer) opt.onAnswer(ok);
  });
  el.addEventListener('click', ev => { if (ev.target.closest('[data-act="mc-again"]')) { delete el.dataset.lock; $$('.opt', el).forEach(x => { x.disabled = false; x.classList.remove('right', 'wrong'); }); $('.why', el).hidden = true; } });
}

/* ---------- Görünümler ---------- */
const VIEWS = {};
function navCur(it) { const [k, , gv, gid] = it; if (gv) return V.name === gv && String(V.id || '') === gid; return V.name === k || (V.name === 'lesson' && k === 'lessons') || (V.name === 'path' && k === 'paths') || (V.name === 'task' && k === 'practice') || (V.name === 'exam' && k === 'exams' && V.id !== 'seviye-tespit') || (/^arena/.test(V.name) && k === 'arena') || (/^interview/.test(V.name) && k === 'interview') || (V.name === 'dataset' && k === 'data'); }
function navBtn(it, due) { const [k, t, gv, gid] = it; return '<button type="button" data-go="' + (gv || k) + '"' + (gid ? ' data-id="' + gid + '"' : '') + ' aria-current="' + navCur(it) + '">' + (ICON[k] || '') + '<span>' + t + '</span>' + (k === 'review' && due ? '<span class="count">' + due + '</span>' : '') + '</button>'; }
function familyHTML() { const c = window.KESIT_CONFIG || {}; const L = [[c.homeUrl, 'Ana sayfa'], [c.sqlUrl, 'Kesit SQL'], [c.pbiUrl, 'Kesit Power BI']].filter(x => x[0]); if (!L.length) return ''; return '<div class="family"><span class="navgrp">Kesit</span>' + L.map(([u, t]) => '<a href="' + esc(u) + '">' + t + '</a>').join('') + '</div>'; }
function renderNav() {
  const nav = $('#nav'); const due = dueReviews().length;
  nav.innerHTML = NAVG.map(([g, items]) => (g ? '<span class="navgrp">' + g + '</span>' : '<span class="navsep"></span>') + items.map(it => navBtn(it, due)).join('')).join('') + familyHTML();
  $('#tabbar').innerHTML = TABNAV.map(k => '<button type="button" data-go="' + k + '" aria-current="' + (V.name === k || (k === 'lessons' && V.name === 'lesson') || (k === 'interview' && /^interview/.test(V.name)) || (k === 'menu' && !TABNAV.includes(V.name) && V.name !== 'lesson' && !/^interview/.test(V.name))) + '">' + ICON[k] + '<span>' + (k === 'menu' ? 'Menü' : NAV.find(x => x[0] === k)[1]) + '</span></button>').join('');
}
function renderStats() {
  const done = validDone(); const s = streak(); const st = E.state();
  const eng = '<div class="engine"><span class="dot ' + (st === 'hazir' ? 'ok' : st === 'yok' ? 'bad' : '') + '"></span>' + ({ bos: 'Python motoru: ilk çalıştırmada yüklenir', yukleniyor: 'Python motoru yükleniyor…', paket: 'Paket yükleniyor…', hazir: E.running() ? 'Kod çalışıyor…' : 'Python 3.12 hazır', yok: 'Motor yüklenemedi' })[st] + (E.running() ? ' <button type="button" class="btn sm ghost" data-act="engine-stop">Durdur</button>' : '') + '</div>';
  $('#sideStats').innerHTML = '<div class="stat"><b class="num">' + fmtN(P.xp) + '</b><span>XP</span></div><div class="stat"><b class="num">' + done + '/' + ORDERED.length + '</b><span>ders</span></div><div class="stat"><b class="num">' + s + '</b><span>gün seri</span></div>' + eng;
  $('#miniStats').textContent = P.xp + ' XP · ' + s + ' gün';
}
function render() { renderNav(); renderStats(); const m0 = $('#main'); const m = m0.cloneNode(false); m0.replaceWith(m); /* görünümlerin mount'ta eklediği dinleyiciler birikmesin */ m.innerHTML = '<div class="wrap">' + (VIEWS[V.name] || VIEWS.home).html() + '</div>'; enhance(m); if (VIEWS[V.name] && VIEWS[V.name].mount) VIEWS[V.name].mount(m); const tt = (NAV.find(x => x[0] === V.name) || [, ''])[1]; document.title = 'Kesit Python' + (V.name !== 'home' && tt ? ' · ' + tt : ''); }

/* Ana sayfa */
VIEWS.home = { html() {
  const nx = nextLesson(); const lv = myLevel(); const welcomeOpen = !P.welcomed && validDone() === 0; const todayXP = P.days[today()] || 0; const due = dueReviews().length; const path = PMAP[P.goal];
  const stops = LEVELS.map(l => { const pct = levelPct(l.id); return '<button type="button" class="panel stop" data-go="lessons" data-id="' + l.id + '"><span class="code" style="color:var(--' + (l.id === 'temel' ? 'l1' : l.id === 'orta' ? 'l3' : 'l5') + ')">' + esc(l.name) + '</span><b>' + esc(l.tag) + '</b><small>' + esc(l.desc) + '</small><small class="muted">' + levelLessons(l.id).filter(x => !x.opt).length + ' ders · ' + esc(l.code) + '</small><div class="bar"><i style="width:' + pct + '%"></i></div><small>%' + pct + ' tamam</small></button>'; }).join('');
  return '<section class="hero"><div class="panel hero-main"><div class="stripe" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><span class="eyebrow">Sıfırdan işe hazır Python</span><h1>Python\'ı <em>tarayıcında</em> çalıştırarak öğren.</h1><p>Tarayıcıda çalışan gerçek CPython, otomatik testli alıştırmalar, öğrenme yolları, pratik görevleri ve sınavlar. Kesit SQL ve Kesit Power BI\'ın kardeşi: aynı sade dil, aynı iş odaklı yaklaşım.</p>' + (welcomeOpen ? '' : '<div class="row">' + (nx ? '<button class="btn pri" data-go="lesson" data-id="' + nx.id + '">' + (validDone() ? 'Kaldığın yerden devam: ' : 'Başla: ') + esc(nx.title) + '</button>' : '<span class="chip on">Sıradaki ders yok: tüm dersler tamam ya da atlandı</span>') + '<button class="btn" data-go="exam" data-id="seviye-tespit">Seviye testi</button></div>') + '</div><div class="panel today"><span class="eyebrow">Bugün</span><div class="kpis"><div class="kpi"><b class="num">' + todayXP + '</b><span>/ ' + DAILY_GOAL + ' XP günlük hedef</span></div><div class="kpi"><b class="num">' + streak() + '</b><span>gün seri</span></div><div class="kpi"><b class="num">' + due + '</b><span>tekrar bekliyor</span></div></div><div class="bar"><i style="width:' + Math.min(100, Math.round(100 * todayXP / DAILY_GOAL)) + '%"></i></div>' + (path ? '<div class="continue"><span class="ic" style="background:' + path.color + '">' + esc(path.short) + '</span><div class="grow"><b>' + esc(path.name) + '</b><small class="muted">' + pathStat(path).n + '/' + pathStat(path).req.length + ' ders</small></div><button class="btn sm" data-go="path" data-id="' + path.id + '">Aç</button></div>' : '<div class="continue"><div class="grow"><b>Hedefini seç</b><small class="muted">Rolüne göre ders sırası ve proje.</small></div><button class="btn sm" data-go="paths">Öğrenme yolları</button></div>') + (due ? '<button class="btn" data-go="review">Tekrarları yap (' + due + ')</button>' : '') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Üç seviye, tek yol</h2><span class="muted">Şu anki seviyen: ' + lvBadge(lv) + '</span></div><div class="climb">' + stops + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Öğrenme yolları</h2><button class="btn sm ghost" data-go="paths">Tümü</button></div><div class="paths">' + PATHS.slice(0, 4).map(pathCard).join('') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Nasıl çalışır?</h2></div><div class="how"><div class="panel"><b>1. Oku ve çalıştır</b><p>Her dersteki örnekler tek tıkla tarayıcında çalışır; kodu değiştirip yeniden dene. Kurulum gerekmez; hazır olduğunda "Bilgisayarına geç" bölümü kendi bilgisayarına geçişi anlatır.</p></div><div class="panel"><b>2. Adım adım alıştır</b><p>Her derste Isınma → Kodu oku → Rehberli → Kendin yaz → Hata avı → Meydan okuma. Rehberli görevlerde yol haritası, benzer örnek ve kademeli ipucu var.</p></div><div class="panel"><b>3. Pekiştir</b><p>Testler anında geri bildirim verir; yanlışların Tekrar\'a girer. Pratik, Python Arena ve zamanlı sınavlarla işe hazır ol.</p></div></div></section>';
}, mount() { renderStats(); } };
function pathCard(p) { const st = pathStat(p), n = st.n, tot = st.req.length || 1; return '<button type="button" class="panel pcard" data-go="path" data-id="' + p.id + '"><div class="row"><span class="ic" style="background:' + p.color + '">' + esc(p.short) + '</span><b>' + esc(p.name) + '</b></div><p>' + esc(p.desc) + '</p><div class="foot"><span>' + st.req.length + ' ders · ' + hours(st.req.reduce((a, l) => a + (l.min || 15), 0)) + '</span><span>' + n + ' tamam</span></div><div class="bar"><i style="width:' + Math.round(100 * n / tot) + '%"></i></div></button>'; }

/* Dersler */
const LF = { q: '' };
VIEWS.lessons = { html() {
  const lv = V.id && LEVELS.find(l => l.id === V.id) ? V.id : 'all';
  const qq = LF.q.trim().toLocaleLowerCase('tr'); const hay = l => (l.title + ' ' + (l.sum || '') + ' ' + l.id + ' ' + ((window.PY_ALIAS || {})[l.id] || '')).toLocaleLowerCase('tr');
  const list = (lv === 'all' ? ORDERED : levelLessons(lv)).filter(l => !qq || hay(l).includes(qq));
  let h = '<div class="sec-head"><div><h1>Dersler</h1></div><div class="filters">' + [['all', 'Tümü'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']].map(([k, t]) => '<button type="button" data-go="lessons" data-id="' + (k === 'all' ? '' : k) + '" aria-pressed="' + (lv === k) + '">' + t + '</button>').join('') + '</div></div><input class="input" data-lf="q" placeholder="Ara: ders adı ya da İngilizce terim (generator, prompt, window function…)" aria-label="Derslerde ara" value="' + esc(LF.q) + '">' + (list.length ? '' : '<p class="muted">Bu aramayla ders bulunamadı.</p>');
  if (lv !== 'all') { const L = LEVELS.find(l => l.id === lv); h += '<div class="panel lvcard"><div class="row" style="justify-content:space-between"><div>' + lvBadge(lv) + ' <b>' + esc(L.tag) + '</b></div><span class="muted">' + esc(L.code) + '</span></div><p class="muted">' + esc(L.desc) + '</p><ul class="can">' + L.can.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul><div class="row"><button class="btn sm" data-go="exam" data-id="' + lv + '-bitirme">' + esc(L.name) + ' bitirme sınavı</button></div></div>'; }
  let curMod = null, curLv = null; h += '<div class="panel lessons">';
  list.forEach(l => { const t = TIER(l.lv); if (lv === 'all' && t !== curLv) { curLv = t; h += '<div class="mod-head lvhead">' + lvBadge(t) + ' ' + esc(LEVELS.find(x => x.id === t).tag) + '</div>'; curMod = null; } if (l.mod !== curMod) { curMod = l.mod; h += '<div class="mod-head">' + esc(l.mod || '') + '</div>'; if (l.opt && l.mod === 'Bilgisayarına geç') h += osPick(); } h += lessonRow(l); });
  return h + '</div>';
}, mount(m) { const q = $('[data-lf="q"]', m); if (q) q.addEventListener('input', () => { LF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('[data-lf="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 300); }); } };
const OS_LESSON = { windows: 'kurulum-windows', mac: 'kurulum-macos-linux' };
function osPick() { return '<div class="ospick"><p class="muted" style="margin:0;font-size:.86rem">İsteğe bağlı: dersler tarayıcıda çalışır, kurulum gerekmez. Python\'ı kendi bilgisayarına kurmaya hazır olduğunda buradan devam et.</p><div class="filters" data-os>' + [['windows', 'Windows'], ['mac', 'macOS ya da Linux']].map(([k, t]) => '<button type="button" data-v="' + k + '" aria-pressed="' + (P.os === k) + '">' + t + '</button>').join('') + '</div></div>'; }
function lessonRow(l) { const s = lessonState(l); const other = l.opt && P.os && Object.values(OS_LESSON).includes(l.id) && OS_LESSON[P.os] !== l.id; const tag = isSkipped(l) ? '<span class="chip">Atlandı</span>' : other ? '<span class="chip">Senin için gerekmez</span>' : l.opt ? '<span class="chip">İsteğe bağlı</span>' : belowLevel(l) && s !== 'done' ? '<span class="chip">Seviyenin altında</span>' : ''; return '<button type="button" class="litem" data-go="lesson" data-id="' + l.id + '"><span class="check ' + s + '">' + (s === 'done' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>' : '') + '</span><div><b>' + esc(l.title) + '</b><small>' + esc(l.sum || '') + '</small></div><div class="meta">' + tag + '<small class="muted">' + (l.min || 15) + ' dk · ' + (l.ex || []).length + ' alıştırma</small>' + (s === 'part' ? '<div class="bar" style="width:70px"><i style="width:' + lessonPct(l) + '%"></i></div>' : '') + '</div></button>'; }

/* Ders görünümü */
VIEWS.lesson = { html() {
  if (!P.welcomed) { P.welcomed = true; save(); } /* ilk ders açılınca ana sayfadaki karşılama kapanır */
  const l = LMAP[V.id]; if (!l) return '<p>Ders bulunamadı.</p>';
  const tab = V.sub || 'ders'; const ex = l.ex || []; const sq = lessonSeq(l); const prev = sq.prev, next = sq.next;
  const ctxChip = sq.ctx ? '<button class="chip lk" data-go="path" data-id="' + sq.ctx.id + '" title="Öğrenme yolunu aç">' + esc(sq.ctx.name) + ' ' + (sq.i + 1) + '/' + sq.list.length + '</button>' : '';
  const rqEx = reqEx(l); const nEx = rqEx.filter(e => P.ex[l.id + '#' + (e.id || e._k)]).length;
  let h = '<div class="lhead"><div class="crumbs"><button data-go="lessons" data-id="' + TIER(l.lv) + '">' + esc(lvName(TIER(l.lv))) + '</button> › <span>' + esc(l.mod || '') + '</span></div><div class="row" style="justify-content:space-between"><div><h1>' + esc(l.title) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(l.sum || '') + '</p></div><div class="row">' + ctxChip + lvBadge(l.lv) + (l.opt ? '<span class="chip">İsteğe bağlı</span>' : '') + '<span class="chip">' + (l.min || 15) + ' dk</span>' + (l.needs && l.needs.length ? '<span class="chip">' + esc(l.needs.join(', ')) + '</span>' : '') + '</div></div>' +
    '<div class="row lacts">' + (lessonState(l) === 'done' ? '' : (P.read && P.read[l.id] ? '' : '<button type="button" class="btn sm ghost" data-act="l-read" title="Alıştırmaları çözmeden bitmiş say; XP verilmez">Okudum, tamam say</button>')) + (P.read && P.read[l.id] ? '<button type="button" class="btn sm ghost" data-act="l-unread">Tamam işaretini kaldır</button>' : '') + (isSkipped(l) ? '<button type="button" class="btn sm ghost" data-act="l-unskip">Atlamayı geri al</button>' : lessonState(l) === 'done' ? '' : '<button type="button" class="btn sm ghost" data-act="l-skip" title="Sıradaki ders hesabında atlanır; tamamlanmış sayılmaz">Bu dersi atla</button>') + issueLink('Ders: ' + l.title, 'Ders: ' + l.title + ' (' + l.id + ')\n\nSorun:\n') + '</div>' +
    '<div class="steps">' + [['ders', 'Ders'], ['alistirma', 'Alıştırmalar (' + nEx + '/' + rqEx.length + ')'], ['sss', 'Sık hatalar ve SSS']].map(([k, t]) => '<button type="button" data-go="lesson" data-id="' + l.id + '" data-sub="' + k + '" aria-current="' + (tab === k) + '" class="' + (k === 'alistirma' && nEx === rqEx.length && rqEx.length ? 'done' : '') + '">' + t + '</button>').join('') + '</div></div>';
  if (tab === 'ders') {
    h += '<article class="panel theory">' + (l.goals && l.goals.length ? '<div class="note goals"><b>Bu dersin sonunda</b><ul>' + l.goals.map(g => '<li>' + esc(g) + '</li>').join('') + '</ul></div>' : '') + l.body + '</article>';
    h += '<div class="row" style="justify-content:space-between"><span class="muted">Örnekleri çalıştır, sonra alıştırmalara geç.</span><button class="btn pri" data-go="lesson" data-id="' + l.id + '" data-sub="alistirma">Alıştırmalara geç →</button></div>';
  } else if (tab === 'alistirma') {
    if (!ex.length) h += '<p class="muted">Bu derste alıştırma yok.</p>';
    const STAGE_DESC = { 'Isınma': 'Kavramı yokla: kısa sorular.', 'Kodu oku': 'Kodu çalıştırmadan çıktıyı tahmin et, satırları sırala.', 'Rehberli': 'Yol haritası ve ipuçlarıyla adım adım yaz.', 'Kendin yaz': 'Görev metninden yola çıkarak sıfırdan yaz.', 'Hata avı': 'Çalışmayan kodu düzelt.', 'Meydan okuma': 'Zor görevler: kenar durumları ve verimlilik.', 'Mini proje': 'Parçaları birleştir, gerçek bir iş çıkar.', 'Teşhis': 'Belirtiyi oku, nedeni bul.', 'Adım sırası': 'Adımları doğru sıraya koy.', 'Kendi bilgisayarında': 'Tarayıcıda çalışmayan gerçek araçlar: kendi bilgisayarında dene, sonra işaretle.' };
    const stages = Array.from(new Set(ex.map(e => e.stage).filter(Boolean)));
    if (stages.length) h += '<div class="stagebar">' + stages.map(sg => { const its = ex.map((e, k) => [e, k]).filter(x => x[0].stage === sg); const n = its.filter(x => P.ex[exKey(l, x[1])]).length; return '<a href="#st-' + encodeURIComponent(sg) + '" class="stg' + (n === its.length ? ' done' : '') + '" data-scroll="st-' + esc(sg) + '"><b>' + esc(sg) + '</b><small>' + n + '/' + its.length + '</small></a>'; }).join('') + '</div>';
    let curStage = null, openOne = false;
    const stageDone = sg => ex.every((e, k) => e.stage !== sg || P.ex[exKey(l, k)]);
    ex.forEach((e, k) => { const key = exKey(l, k); if (e.stage !== curStage) { if (curStage) h += '</details>'; curStage = e.stage; const isOpen = !openOne && !stageDone(curStage); if (isOpen) openOne = true; h += '<details class="stagebox" id="st-' + esc(curStage) + '"' + (isOpen || stages.length === 1 ? ' open' : '') + '><summary class="stagehead"><h2>' + esc(curStage) + '</h2><span class="muted">' + esc(STAGE_DESC[curStage] || '') + '</span></summary>'; } h += '<div class="exblock" data-k="' + k + '"><div class="exhead"><span class="eyebrow">Alıştırma ' + (k + 1) + ' / ' + ex.length + (e.diff ? ' · ' + '★'.repeat(e.diff) : '') + '</span>' + (e.erken ? '<span class="chip warn-chip" title="Bu görev henüz görmediğin bir yapı kullanıyor">Erken meydan okuma · isteğe bağlı</span>' : '') + issueLink('Alıştırma: ' + l.title + ' / ' + key, 'Ders: ' + l.title + ' (' + l.id + ')\nAlıştırma: ' + key + '\n\nSorun:\n') + '</div>' + exView(e, key) + '</div>'; });
    if (curStage) h += '</details>';
    h += '<div class="row" style="justify-content:space-between">' + (prev ? '<button class="btn" data-go="lesson" data-id="' + prev.id + '">← ' + esc(prev.title) + '</button>' : '<span></span>') + (next ? '<button class="btn pri" data-go="lesson" data-id="' + next.id + '">Sonraki: ' + esc(next.title) + ' →</button>' : sq.ctx ? '<button class="btn pri" data-go="path" data-id="' + sq.ctx.id + '">Yolun sonu: ' + esc(sq.ctx.name) + '</button>' : '') + '</div>' + (l.id === 'proje-temel' ? '<div class="note"><b>İsteğe bağlı: Bilgisayarına geç</b> Temel projeni bitirdiysen Python\'ı kendi bilgisayarına kurmanın tam zamanı. <button class="btn sm" data-go="lesson" data-id="kurulum-araclar">Kuruluma başla</button></div>' : '');
  } else {
    h += '<section class="lvl-block">' + ((l.mistakes || []).length ? '<div class="sec-head"><h2>Sık yapılan hatalar</h2></div><div class="mist">' + l.mistakes.map(m => '<div class="panel mrow"><div class="cmp2"><div><span class="eyebrow bad">Hatalı</span>' + codebox(m.bad, { run: false, label: 'hatalı' }) + '</div><div><span class="eyebrow good">Doğru</span>' + codebox(m.good, { run: false, label: 'doğru' }) + '</div></div><p class="muted" style="margin:6px 0 0">' + esc(m.why) + '</p></div>').join('') + '</div>' : '') + ((l.faq || []).length ? '<div class="sec-head"><h2>Sık sorulan sorular</h2></div><div class="faq">' + l.faq.map(f => '<details class="panel"><summary>' + f.q + '</summary><div class="fa">' + f.a + '</div></details>').join('') + '</div>' : '<p class="muted">Bu derste SSS yok.</p>') + '</section>';
  }
  return h;
}, mount(m) {
  const l = LMAP[V.id]; if (!l) return;
  $$('.exblock', m).forEach(w => { const k = +w.dataset.k; const e = l.ex[k]; const key = exKey(l, k); const done = () => { checkLessonDone(l); const tab = $('.steps button[data-sub="alistirma"]', m); if (tab) { const rq = reqEx(l), n = rq.filter(x => P.ex[l.id + '#' + (x.id || x._k)]).length; tab.textContent = 'Alıştırmalar (' + n + '/' + rq.length + ')'; if (n === rq.length) tab.classList.add('done'); } }; exMount(w, e, key, { onPass: done, kind: 'code' }); });
  /* Motor yalnız ilk çalıştırmada yüklenir; hazırsa dersin paketleri arka planda ısıtılır */
  if (l.needs && l.needs.length && E.state() === 'hazir') E.ensurePkgs(l.needs).catch(() => {});
  m.addEventListener('click', ev => { const b = ev.target.closest('[data-act^="l-"]'); if (!b) return; const a = b.dataset.act; P.skip = P.skip || {}; P.read = P.read || {}; if (a === 'l-skip') { P.skip[l.id] = today(); toast('Bu ders atlandı; sıradaki ders hesabına girmez, tamamlanmış sayılmaz.'); } if (a === 'l-unskip') delete P.skip[l.id]; if (a === 'l-read') { P.read[l.id] = today(); if (!P.done[l.id]) P.done[l.id] = today(); toast('Ders tamam sayıldı.'); } if (a === 'l-unread') { delete P.read[l.id]; if (l.ex && l.ex.some((e, i) => !P.ex[exKey(l, i)])) delete P.done[l.id]; } save(); render(); });
} };

/* Öğrenme yolları */
VIEWS.paths = { html() { return '<div class="sec-head"><div><h1>Öğrenme yolları</h1></div></div><p class="muted" style="margin:0;max-width:70ch">Her yol, o rol için gereken dersleri doğru sırada dizer; sınav, mülakat soruları ve portföy projeleriyle biter. Çoğu yol Python temellerini bildiğini varsayar: yol sayfasında "Temelleri bilmiyorum" dersen temel dersler başa eklenir. Hedef yolun ana sayfadaki "devam" düğmesini belirler.</p><div class="paths">' + PATHS.map(pathCard).join('') + '</div>'; } };
VIEWS.path = { html() {
  const p = PMAP[V.id]; if (!p) return '<p>Öğrenme yolu bulunamadı.</p>';
  const st = pathStat(p), ls = st.ls, n = st.n; const nx = ls.find(inFlow);
  const needsBase = p.id !== 'genel' && p.id !== 'sertifika' && (window.PY_PREREQ || []).some(id => !p.lessons.includes(id));
  let h = '<div class="lhead"><div class="crumbs"><button data-go="paths">Öğrenme yolları</button> › <span>' + esc(p.name) + '</span></div><div class="row" style="justify-content:space-between"><div class="row"><span class="ic" style="background:' + p.color + '">' + esc(p.short) + '</span><h1>' + esc(p.name) + '</h1></div><div class="row">' + (P.goal === p.id ? '<span class="chip on">Hedefim</span>' : '<button class="btn pri" data-act="set-goal" data-id="' + p.id + '">Hedefim yap</button>') + (nx ? '<button class="btn" data-act="path-next" data-id="' + nx.id + '">Devam: ' + esc(nx.title) + '</button>' : '') + '</div></div></div>';
  h += '<div class="panel lvcard"><p style="margin:0">' + esc(p.long) + '</p><div class="row" style="margin-top:10px">' + p.skills.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div><p class="muted" style="margin:10px 0 0"><b>Hedef roller:</b> ' + p.jobs.map(esc).join(', ') + '</p><div class="bar" style="margin-top:10px"><i style="width:' + Math.round(100 * n / (st.req.length || 1)) + '%"></i></div><small class="muted">' + n + '/' + st.req.length + ' ders · ' + hours(st.req.reduce((a, l) => a + (l.min || 15), 0)) + (ls.length > st.req.length ? ' · ' + (ls.length - st.req.length) + ' isteğe bağlı ders sayılmaz' : '') + '</small></div>';
  if (needsBase) h += '<div class="panel lvcard prereq"><b>Ön koşul: Python temelleri</b><p class="muted" style="margin:4px 0 8px">' + esc(p.prereqNot || 'Bu yol değişken, koşul, döngü, liste, sözlük ve fonksiyon bildiğini varsayar. Bilmiyorsan temel dersler yolun başına eklenir.') + '</p><div class="filters" data-base>' + [['var', 'Temelleri biliyorum'], ['yok', 'Temelleri bilmiyorum']].map(([k, t]) => '<button type="button" data-v="' + k + '" aria-pressed="' + ((P.base || {})[p.id] === k) + '">' + t + '</button>').join('') + '</div></div>';
  h += pathLinks(p);
  let curLv = null; h += '<div class="panel lessons">'; ls.forEach(l => { const t = TIER(l.lv); if (t !== curLv) { curLv = t; h += '<div class="mod-head lvhead">' + lvBadge(t) + '</div>'; } h += lessonRow(l); }); h += '</div>';
  const sonra = (p.sonra || []).map(id => LMAP[id]).filter(Boolean);
  if (sonra.length) h += '<section class="lvl-block"><div class="sec-head"><h2>İkinci dalga (isteğe bağlı)</h2></div><p class="muted" style="margin:0 0 6px">Yolun parçası sayılmaz; iş bulduktan ya da yolu bitirdikten sonra.</p><div class="panel lessons">' + sonra.map(lessonRow).join('') + '</div></section>';
  return h;
}, mount(m) { m.addEventListener('click', ev => { const f = ev.target.closest('[data-base] button'); if (f) { P.base = P.base || {}; P.base[V.id] = f.dataset.v; save(); render(); return; } const nb = ev.target.closest('[data-act="path-next"]'); if (nb) { P.ctx = V.id; save(); go('lesson', nb.dataset.id); return; } const lr = ev.target.closest('.litem[data-go="lesson"]'); if (lr) { P.ctx = V.id; save(); } const b = ev.target.closest('[data-act="set-goal"]'); if (b) { P.goal = b.dataset.id; P.ctx = b.dataset.id; save(); toast('Hedef öğrenme yolu: ' + PMAP[P.goal].name); render(); } }); } };
function pathLinks(p) {
  const x = XMAP['patika-' + p.id]; const cnt = C_LINKS.counts ? C_LINKS.counts(p.id) : { iv: 0, ar: 0 }; const pf = (window.PY_PORTFOLIO || {})[p.id] || [];
  const card = (attrs, t, d, f) => '<button type="button" class="panel pcard" ' + attrs + '><div class="row"><b>' + t + '</b></div><p>' + d + '</p>' + (f ? '<div class="foot"><span>' + f + '</span></div>' : '') + '</button>';
  return '<div class="paths pathlinks">' + (x ? card('data-go="exam" data-id="' + x.id + '"', 'Yol sınavı', 'Yolu bitirdiğini ölç: test ve kod görevleri, ' + x.min + ' dakika.', x.qs.length + ' soru') : '') + (cnt.iv ? card('data-pl="iv" data-role="' + p.id + '"', 'Bu rolün mülakat soruları', 'Rolüne süzülmüş Python soruları, model cevaplarla.', cnt.iv + ' soru') : '') + (cnt.ar ? card('data-pl="ar" data-role="' + p.id + '"', 'Bu rolün problemleri', 'Python Arena\'da bu role uygun problemler.', cnt.ar + ' problem') : '') + (pf.length ? card('data-go="projects" data-id="' + p.id + '"', 'Portföy için ' + pf.length + ' proje', 'Veri setleriyle yapılabilecek, iş görüşmesinde anlatılacak proje önerileri.', '') : '') + '</div>';
}
const C_LINKS = {};
document.addEventListener('click', ev => { const b = ev.target.closest('[data-pl]'); if (!b) return; if (b.dataset.pl === 'iv' && C_LINKS.iv) C_LINKS.iv(b.dataset.role); if (b.dataset.pl === 'ar' && C_LINKS.ar) C_LINKS.ar(b.dataset.role); });
/* Bitirme projeleri: uygulamadaki proje dersleri ve role göre portföy önerileri */
VIEWS.projects = { html() {
  const pf = window.PY_PORTFOLIO || {}; const ids = ['proje-temel', 'proje-oyunlar', 'proje-orta', 'proje-orta-otomasyon', 'proje-ileri', 'proje-ml', 'proje-ai', 'proje-api'];
  const role = PMAP[V.id] ? V.id : '';
  let h = '<div class="sec-head"><div><h1>Bitirme projeleri</h1></div></div><p class="muted" style="margin:0;max-width:72ch">Önce uygulamadaki bitirme derslerini çöz; sonra rolüne uygun bir projeyi kendi bilgisayarında, Veri setleri\'ndeki verilerle kur ve GitHub\'a koy. Öneriler ödev değildir, otomatik denetlenmez.</p>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Uygulamadaki bitirme dersleri</h2></div><div class="panel lessons">' + ids.map(id => LMAP[id]).filter(Boolean).map(lessonRow).join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Rolüne göre portföy projeleri</h2></div><div class="filters">' + [['', 'Tüm roller']].concat(PATHS.filter(p => pf[p.id]).map(p => [p.id, p.name])).map(([k, t]) => '<button type="button" data-go="projects" data-id="' + k + '" aria-pressed="' + (role === k) + '">' + esc(t) + '</button>').join('') + '</div>' + PATHS.filter(p => pf[p.id] && (!role || role === p.id)).map(p => '<div class="panel lvcard" style="margin-top:10px"><b>' + esc(p.name) + '</b><ul class="pflist">' + pf[p.id].map(([t, d]) => '<li><b>' + esc(t) + '</b> ' + esc(d) + '</li>').join('') + '</ul></div>').join('') + '</section>';
  return h;
} };

/* Pratik */
const KINDS = { yaz: 'sıfırdan yaz', bug: 'hatayı bul', tamamla: 'tamamla', rehberli: 'rehberli', predict: 'çıktıyı tahmin et', order: 'satırları sırala' };
const PF = { lv: 'all', topic: 'all', diff: 'all', kind: 'all', st: 'all', q: '' };
window.PY_PF = topic => { PF.lv = 'all'; PF.topic = topic; PF.diff = 'all'; PF.kind = 'all'; PF.st = 'all'; PF.q = ''; };
VIEWS.practice = { html() {
  const topics = Array.from(new Set(BANK.filter(t => PF.lv === 'all' || TIER(t.lv) === PF.lv).map(t => t.topic)));
  const list = BANK.filter(t => (PF.lv === 'all' || TIER(t.lv) === PF.lv) && (PF.topic === 'all' || t.topic === PF.topic) && (PF.diff === 'all' || String(t.diff) === PF.diff) && (PF.kind === 'all' || (t.t === 'predict' || t.t === 'order' ? t.t : t.kind) === PF.kind) && (PF.st === 'all' || (PF.st === 'done') === !!P.ex['bank#' + t.id]) && (!PF.q || (t.title + ' ' + (t.tags || []).join(' ')).toLocaleLowerCase('tr').includes(PF.q.toLocaleLowerCase('tr'))));
  const solved = BANK.filter(t => P.ex['bank#' + t.id]).length;
  const fb = (name, opts, cur) => '<div class="filters" data-f="' + name + '">' + opts.map(([k, t]) => '<button type="button" data-v="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(t) + '</button>').join('') + '</div>';
  return '<div class="sec-head"><div><h1>Pratik</h1></div><span class="chip on">' + solved + '/' + fmtN(BANK.length) + ' çözüldü</span></div><p class="muted" style="margin:0;max-width:72ch">Konuya göre kısa görevler: bir fonksiyon yaz, hatayı bul, eksik parçayı tamamla. İpuçları ve çözümü açık, testler anında denetler; çözemediklerin Tekrar\'a girer. Girdi okuyup çıktı yazdırdığın, gizli testli ve puanlı problemler için <button class="lk" data-go="arena">Python Arena</button>.</p>' +
    '<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px">' + fb('lv', [['all', 'Tüm seviyeler'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']], PF.lv) + fb('topic', [['all', 'Tüm konular']].concat(topics.map(t => [t, t])), PF.topic) + '<div class="row">' + fb('diff', [['all', 'Her zorluk'], ['1', 'Kolay'], ['2', 'Orta'], ['3', 'Zor']], PF.diff) + fb('kind', [['all', 'Her tür'], ['rehberli', 'Rehberli'], ['yaz', 'Sıfırdan yaz'], ['bug', 'Hatayı bul'], ['tamamla', 'Tamamla'], ['predict', 'Tahmin et'], ['order', 'Sırala']], PF.kind) + fb('st', [['all', 'Hepsi'], ['new', 'Çözülmemiş'], ['done', 'Çözülmüş']], PF.st) + '</div><input class="input" data-f="q" placeholder="Ara: başlık ya da etiket" value="' + esc(PF.q) + '"></div>' +
    '<div class="panel lessons">' + (list.length ? list.map(t => '<button type="button" class="litem" data-go="task" data-id="' + t.id + '"><span class="check ' + (P.ex['bank#' + t.id] ? 'done' : 'new') + '">' + (P.ex['bank#' + t.id] ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>' : '') + '</span><div><b>' + esc(t.title) + '</b><small>' + esc(t.topic) + ' · ' + (KINDS[t.t === 'predict' ? 'predict' : t.t === 'order' ? 'order' : t.kind] || 'görev') + (t.tags ? ' · ' + t.tags.map(esc).join(', ') : '') + '</small></div><div class="meta">' + lvBadge(t.lv) + '<small class="muted">' + '★'.repeat(t.diff || 1) + ' · ' + (t.min || 8) + ' dk</small></div></button>').join('') : '<p class="muted" style="padding:16px">Bu filtrede görev yok.</p>') + '</div>';
}, mount(m) {
  m.addEventListener('click', ev => { const b = ev.target.closest('.filters button'); if (!b) return; const f = b.closest('.filters').dataset.f; PF[f] = b.dataset.v; if (f === 'lv') PF.topic = 'all'; render(); });
  const q = $('[data-f="q"]', m); q.addEventListener('input', () => { PF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('[data-f="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 350); });
} };
VIEWS.task = { html() {
  const t = BMAP[V.id]; if (!t) return '<p>Görev bulunamadı.</p>';
  const list = BANK; const i = list.indexOf(t); const prev = list[i - 1], next = list[i + 1];
  return '<div class="lhead"><div class="crumbs"><button data-go="practice">Pratik</button> › <span>' + esc(t.topic) + '</span></div><div class="row" style="justify-content:space-between"><h1>' + esc(t.title) + '</h1><div class="row">' + lvBadge(t.lv) + '<span class="chip">' + '★'.repeat(t.diff || 1) + '</span><span class="chip">' + (KINDS[t.t === 'predict' ? 'predict' : t.t === 'order' ? 'order' : t.kind] || 'görev') + '</span></div></div></div>' + (t.t === 'predict' || t.t === 'order' ? exView(t, 'bank#' + t.id) : codeExView(t, 'bank#' + t.id, { label: 'Görev ' + t.id.replace('b-', '#'), h: 320 })) + '<div class="row" style="justify-content:space-between">' + (prev ? '<button class="btn" data-go="task" data-id="' + prev.id + '">← Önceki</button>' : '<span></span>') + (next ? '<button class="btn" data-go="task" data-id="' + next.id + '">Sonraki görev →</button>' : '') + '</div>';
}, mount(m) { const t = BMAP[V.id]; if (!t) return; exMount(m, t, 'bank#' + t.id, { kind: 'bank' }); if (t.needs && E.state() === 'hazir') E.ensurePkgs(t.needs).catch(() => {}); } };

/* Sınavlar */
VIEWS.exams = { html() {
  return '<div class="sec-head"><div><h1>Sınavlar</h1></div></div><p class="muted" style="margin:0;max-width:70ch">Zamanlı, özgün sorular. Bitirme sınavları seviyeyi, kodlama sınavları gerçek yazma becerisini ölçer. Sorular gerçek sertifika sorusu değildir; formatı ve zorluğu yansıtır.</p><div class="exams">' + EXAMS.map(x => { const r = P.exams[x.id]; const nq = (x.qs || []).length; const live = P.xs && P.xs.id === x.id; const lab = x.id === 'seviye-tespit' ? '<span class="chip">karma seviye</span>' : x.id === 'pcep-pcap-deneme' ? '<span class="chip">deneme</span>' : lvBadge(x.lv); return '<div class="panel xcard"><div class="row" style="justify-content:space-between"><div>' + lab + ' <span class="chip">' + (x.kind === 'kod' ? 'kodlama' : 'test') + '</span>' + (live ? ' <span class="chip on">devam ediyor</span>' : '') + '</div><span class="muted">' + nq + ' soru · ' + x.min + ' dk' + (x.pass ? ' · geçme %' + x.pass : '') + '</span></div><h3>' + esc(x.title) + '</h3><p class="muted">' + esc(x.desc || '') + '</p><div class="row" style="justify-content:space-between">' + (r ? '<span class="chip ' + (r.best >= (x.pass || 0) ? 'on' : '') + '">En iyi %' + r.best + ' · ' + (r.hist || []).length + ' deneme</span>' : '<span></span>') + '<button class="btn pri sm" data-go="exam" data-id="' + x.id + '">' + (live ? 'Devam et' : r ? 'Tekrar gir' : 'Başla') + '</button></div></div>'; }).join('') + '</div>';
} };
/* Mobilde alt menüde yer almayan tüm bölümler */
const NAV_DESC = { home: 'Günlük hedef ve kaldığın yer', paths: 'Role göre ders sırası, sınav, mülakat, proje', lessons: 'Seviyelere göre tüm dersler', review: 'Yanlışların aralıklı tekrarı', placement: 'Nereden başlayacağını bul', ai: 'Python ile LLM, RAG, ajanlar ve ML', practice: 'Konuya göre kısa görevler', arena: 'Girdi-çıktı problemleri, gizli testler, puan', exams: 'Seviye, yol ve deneme sınavları', play: 'Serbest Python çalıştır', interview: 'Role göre Python mülakat soruları', projects: 'Bitirme dersleri ve portföy önerileri', data: 'Python ile analiz edeceğin 8 veri seti', mistakes: 'Hatalı kod → doğru kod', cheat: 'Tek bakışta sözdizimi', glossary: 'Terimler ve İngilizceleri', profile: 'İlerleme, rozetler, yedek', hakkinda: 'Proje, gizlilik, lisans, müfredat' };VIEWS.menu = { html() {
  return '<div class="sec-head"><div><h1>Menü</h1></div></div>' + NAVG.map(([g, items]) => (g ? '<div class="mod-head" style="padding:4px 0">' + g + '</div>' : '') + '<div class="paths menugrid">' + items.map(([k, t, gv, gid]) => '<button type="button" class="panel pcard" data-go="' + (gv || k) + '"' + (gid ? ' data-id="' + gid + '"' : '') + '><div class="row"><span class="ic navic">' + (ICON[k] || '') + '</span><b>' + esc(t) + '</b></div><p>' + esc(NAV_DESC[k] || '') + '</p></button>').join('') + '</div>').join('') + familyHTML();
} };
const XS = { id: null, i: 0, ans: {}, t0: 0, timer: null, done: false, res: null };
function xsSave() { if (XS.t0 && !XS.done) { P.xs = { id: XS.id, i: XS.i, ans: XS.ans, t0: XS.t0 }; } else if (P.xs && P.xs.id === XS.id) delete P.xs; save(); }
VIEWS.exam = { html() {
  const x = XMAP[V.id]; if (!x) return '<p>Sınav bulunamadı.</p>';
  if (XS.id !== x.id || XS.done && V.sub !== 'sonuc') { if (XS.id !== x.id) { XS.id = x.id; XS.i = 0; XS.ans = {}; XS.t0 = 0; XS.done = false; XS.res = null; if (P.xs && P.xs.id === x.id) { XS.i = P.xs.i || 0; XS.ans = P.xs.ans || {}; XS.t0 = P.xs.t0 || 0; } } }
  if (XS.t0 && !XS.done && /^q\d+$/.test(V.sub || '')) XS.i = Math.min(x.qs.length - 1, +V.sub.slice(1));
  if (!XS.t0) return '<div class="lhead"><div class="crumbs"><button data-go="exams">Sınavlar</button> › <span>' + esc(x.title) + '</span></div><h1>' + esc(x.title) + '</h1></div><div class="panel lvcard"><p>' + esc(x.desc || '') + '</p><ul><li><b>' + x.qs.length + ' soru</b>' + (x.kind === 'kod' ? ' (' + x.qs.filter(q => q.t === 'code').length + ' kodlama görevi)' : '') + '</li><li><b>' + x.min + ' dakika</b>; süre bitince otomatik teslim edilir.</li>' + (x.pass ? '<li>Geçme notu <b>%' + x.pass + '</b>.</li>' : '<li>Sonuçta "Şuradan başla" düğmesi çıkar; geçtiğin seviyenin dersleri sıradaki ders hesabından çıkar.</li>') + (x.id === 'seviye-tespit' ? '<li>Bilmediğin soruda "Bilmiyorum" de; tahmin etme. Yanlışlar Tekrar\'a girmez.</li>' : '<li>Sorular arasında ileri-geri gidebilirsin; yanlışlar Tekrar\'a girer. Sayfayı yenilersen ya da çıkarsan cevapların kaybolmaz, süre işlemeye devam eder.</li>') + '</ul><button class="btn pri" data-act="x-start">Sınavı başlat</button></div>';
  if (XS.done) return examResult(x);
  const q = x.qs[XS.i]; const key = 'exam:' + x.id + '#' + XS.i;
  let h = '<div class="xbar"><div class="row"><b>' + esc(x.title) + '</b><span class="muted">Soru ' + (XS.i + 1) + '/' + x.qs.length + '</span></div><div class="row"><span class="chip timer" id="xtimer">--:--</span><button class="btn sm" data-act="x-submit">Teslim et</button></div></div>';
  h += '<div class="steps xsteps">' + x.qs.map((qq, i) => '<button type="button" data-act="x-go" data-i="' + i + '" aria-current="' + (i === XS.i) + '" class="' + (XS.ans[i] != null && XS.ans[i] !== '' ? 'done' : '') + '">' + (i + 1) + '</button>').join('') + '</div>';
  if (q.t === 'mc' || q.t === 'predict') h += '<div class="panel brief mc xq" data-i="' + XS.i + '"><span class="eyebrow">' + esc(q.topic || 'Soru') + '</span><div class="q">' + q.q + '</div>' + (q.code ? codebox(q.code, { run: false }) : '') + '<div class="opts">' + optOrder(q.o, key).map(i => { const o = q.o[i]; return '<button type="button" class="opt" data-i="' + i + '" aria-pressed="' + (XS.ans[XS.i] === i) + '">' + (q.t === 'predict' ? '<pre class="optpre">' + esc(o) + '</pre>' : o) + '</button>'; }).join('') + (x.id === 'seviye-tespit' ? '<button type="button" class="opt optnone" data-i="-1" aria-pressed="' + (XS.ans[XS.i] === -1) + '">Bilmiyorum</button>' : '') + '</div></div>';
  else h += codeExView(q, key, { label: 'Kodlama görevi · ' + (q.pts || 5) + ' puan', noSol: true, checkLabel: 'Testleri çalıştır', h: 280 });
  h += '<div class="row" style="justify-content:space-between"><button class="btn" data-act="x-go" data-i="' + (XS.i - 1) + '" ' + (XS.i === 0 ? 'disabled' : '') + '>← Önceki</button>' + (XS.i < x.qs.length - 1 ? '<button class="btn pri" data-act="x-go" data-i="' + (XS.i + 1) + '">Sonraki →</button>' : '<button class="btn pri" data-act="x-submit">Teslim et</button>') + '</div>';
  return h;
}, mount(m) {
  const x = XMAP[V.id]; if (!x) return;
  const tick = () => { const el = $('#xtimer'); if (!el || !XS.t0 || XS.done) return; const left = Math.max(0, x.min * 60 - Math.floor((Date.now() - XS.t0) / 1000)); el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); if (left <= 60) el.classList.add('warn'); if (left === 0) { submit(); } };
  clearInterval(XS.timer); if (XS.t0 && !XS.done) { XS.timer = setInterval(tick, 1000); tick(); }
  const q = x.qs[XS.i];
  if (XS.t0 && !XS.done && q && q.t === 'code') { const w = $('[data-exwrap]', m); const ta = $('textarea.ta', w); ta.value = XS.ans[XS.i] != null ? XS.ans[XS.i] : (q.start || ''); mountCodeEx(w, q, 'exam:' + x.id + '#' + XS.i, { rerender: false, kind: 'exam' }); ta.dispatchEvent(new Event('input')); ta.addEventListener('input', () => { XS.ans[XS.i] = ta.value; clearTimeout(ta._x); ta._x = setTimeout(xsSave, 500); }); }
  m.addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return; const act = b.dataset.act;
    if (act === 'x-start') { if (P.xs && P.xs.id !== x.id) toast('Önceki yarım sınav kapatıldı.'); XS.t0 = Date.now(); XS.i = 0; XS.ans = {}; XS.done = false; xsSave(); render(); }
    if (act === 'x-go') { const ni = Math.max(0, Math.min(x.qs.length - 1, +b.dataset.i)); XS.i = ni; xsSave(); go('exam', x.id, 'q' + ni); }
    if (b.classList.contains('opt') && b.closest('.xq')) { XS.ans[XS.i] = +b.dataset.i; xsSave(); $$('.opt', b.closest('.xq')).forEach(o => o.setAttribute('aria-pressed', o === b)); $$('.xsteps button', m)[XS.i].classList.add('done'); }
    if (act === 'x-submit') { if (!confirm('Sınavı teslim etmek istiyor musun?')) return; submit(); }
  });
  async function submit() {
    if (XS.done) return; clearInterval(XS.timer); XS.done = true;
    const m2 = $('#main'); m2.innerHTML = '<div class="wrap"><p class="muted">Değerlendiriliyor… kodlama görevleri gerçek Python ile test ediliyor.</p></div>';
    let got = 0, tot = 0; const rows = []; const topics = {};
    for (let i = 0; i < x.qs.length; i++) {
      const q = x.qs[i]; const pts = q.t === 'code' ? (q.pts || 5) : 1; tot += pts; let ok = false, info = '';
      if (q.t === 'mc' || q.t === 'predict') ok = XS.ans[i] === q.a;
      else { const code = XS.ans[i]; if (code && code.trim()) { try { const r = await E.run({ code, tests: q.tests || '', stdin: q.stdin, needs: (q.needs || []).concat(needsOf(code)), limit: 25000 }); ok = !r.err && (q.expect == null || E.sameOut(r.out, q.expect)); info = r.err ? r.err.type + ': ' + r.err.msg : (ok ? '' : 'çıktı beklenenden farklı'); } catch (e) { info = 'motor yok'; } } else info = 'boş bırakıldı'; }
      if (ok) got += pts; const tp = q.topic || 'Genel'; topics[tp] = topics[tp] || { ok: 0, n: 0, lv: q.lv }; topics[tp].n++; if (ok) topics[tp].ok++;
      rows.push({ i, ok, info, q }); const key = 'exam:' + x.id + '#' + i; if (x.id !== 'seviye-tespit') { if (!ok) noteWrong(key, q.t); else noteRight(key); }
    }
    const pct = Math.round(100 * got / tot); const passed = pct >= (x.pass || 0);
    const r = P.exams[x.id] = P.exams[x.id] || { best: 0, hist: [] }; r.hist.push({ d: today(), pct }); r.best = Math.max(r.best, pct); if (r.hist.length > 20) r.hist.shift();
    addXP(passed ? 60 : 20); if (x.id === 'seviye-tespit') { P.welcomed = true; const lv = suggestLevel(rows); P.level = lv === 'temel' ? '' : lv; XS.lvl = lv; }
    XS.res = { pct, got, tot, passed, rows, topics }; xsSave(); delete P.xs; save(); V.sub = 'sonuc'; history.replaceState(null, '', hashFor(V)); render();
  }
} };
function suggestLevel(rows) { const by = { temel: [0, 0], orta: [0, 0], ileri: [0, 0] }; rows.forEach(r => { const lv = TIER(r.q.lv || 'temel'); if (!by[lv]) return; by[lv][1]++; if (r.ok) by[lv][0]++; }); const rate = lv => by[lv][1] ? by[lv][0] / by[lv][1] : 0; if (rate('temel') >= .75 && rate('orta') >= .7 && rate('ileri') >= .6) return 'ileri'; if (rate('temel') >= .7 && rate('orta') >= .4) return 'orta'; return 'temel'; }
function firstOf(lv) { return ORDERED.find(l => TIER(l.lv) === lv && !l.opt); }
function weakLessons(R) { const norm = s => String(s).toLocaleLowerCase('tr'); const out = []; Object.entries(R.topics).filter(([, v]) => v.ok / v.n < .5).forEach(([t]) => { const key = norm(t).split(/[\s/]/)[0]; const l = ORDERED.find(x => norm(x.title).includes(norm(t)) && !x.opt) || ORDERED.find(x => norm(x.title).includes(key) && !x.opt); if (l && !out.includes(l)) out.push(l); }); return out.slice(0, 3); }
function examResult(x) {
  const R = XS.res; if (!R) return '';
  const ring = '<div class="ring ' + (R.passed ? 'ok' : 'bad') + '"><b class="num">%' + R.pct + '</b><span>' + R.got + '/' + R.tot + ' puan</span></div>';
  let h = '<div class="lhead"><div class="crumbs"><button data-go="exams">Sınavlar</button> › <span>' + esc(x.title) + '</span></div><h1>Sonuç</h1></div><div class="panel xres"><div class="row" style="gap:24px;align-items:center">' + ring + '<div class="grow">' + (x.id === 'seviye-tespit' ? (() => { const lv = XS.lvl || P.level || 'temel'; const st = firstOf(lv); const wk = weakLessons(R); return '<h2>Önerilen başlangıç: ' + lvBadge(lv) + '</h2><p class="muted">' + (lv === 'temel' ? 'En baştan başlamak sana iyi gelir.' : 'Bu seviyenin altındaki dersler sıradaki ders hesabından çıktı; istediğinde yine açabilirsin ve tamamlanmış sayılmazlar.') + ' Seviyeni Profil\'den değiştirebilirsin.</p>' + (st ? '<div class="row"><button class="btn pri" data-go="lesson" data-id="' + st.id + '">Şuradan başla: ' + esc(st.title) + '</button></div>' : '') + (wk.length ? '<p class="muted" style="margin:8px 0 4px">Zayıf kaldığın konular:</p><div class="row">' + wk.map(l => '<button class="btn sm" data-go="lesson" data-id="' + l.id + '">' + esc(l.title) + '</button>').join('') + '</div>' : ''); })() : '<h2>' + (R.passed ? 'Geçtin 🎉' : 'Bu sefer olmadı') + '</h2><p class="muted">' + (R.passed ? 'Bir sonraki adıma hazırsın.' + (R.got < R.tot ? ' Yanlışların Tekrar\'a eklendi.' : '') : 'Geçme notu %' + x.pass + '. Zayıf konular aşağıda; ilgili dersleri tekrar edip yeniden gir.') + '</p>') + '<div class="row"><button class="btn" data-act="x-retry">Yeniden gir</button>' + (x.id === 'seviye-tespit' ? '' : '<button class="btn" data-go="review">Tekrar</button>') + '</div></div></div></div>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Konu dökümü</h2></div><div class="panel"><table class="ttab"><tr><th>Konu</th><th>Doğru</th><th></th></tr>' + Object.entries(R.topics).map(([t, v]) => { const p = Math.round(100 * v.ok / v.n); return '<tr><td>' + esc(t) + '</td><td class="num">' + v.ok + '/' + v.n + '</td><td style="width:40%"><div class="bar"><i style="width:' + p + '%;background:' + (p >= 70 ? 'var(--ok)' : p >= 40 ? 'var(--warn)' : 'var(--err)') + '"></i></div></td></tr>'; }).join('') + '</table></div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Soru soru</h2></div>' + R.rows.map(r => '<details class="panel xrow ' + (r.ok ? 'ok' : 'bad') + '"><summary><span class="check ' + (r.ok ? 'done' : 'bad') + '">' + (r.ok ? '✓' : '✗') + '</span> Soru ' + (r.i + 1) + ' · ' + esc(r.q.topic || '') + (r.info ? ' <span class="muted">— ' + esc(r.info) + '</span>' : '') + '</summary><div class="fa"><div class="q">' + r.q.q + '</div>' + (r.q.t === 'mc' || r.q.t === 'predict' ? '<p><b>Doğru cevap:</b> ' + r.q.o[r.q.a] + (XS.ans[r.i] != null && XS.ans[r.i] !== r.q.a ? '<br><b>Senin cevabın:</b> ' + (XS.ans[r.i] === -1 ? 'Bilmiyorum' : r.q.o[XS.ans[r.i]]) : '') + '</p>' : '<p class="eyebrow">Örnek çözüm</p>' + codebox(r.q.sol || '', { label: 'çözüm' })) + (r.q.why ? '<div class="note"><b>Açıklama</b>' + r.q.why + '</div>' : '') + '</div></details>').join('') + '</section>';
  return h;
}
document.addEventListener('click', ev => { const b = ev.target.closest('[data-act="x-retry"]'); if (b) { XS.id = null; delete P.xs; V.sub = null; history.replaceState(null, '', hashFor(V)); render(); } });

/* Tekrar (aralıklı tekrar) */
VIEWS.review = { html() {
  const due = dueReviews(); const all = Object.keys(P.rv);
  const items = due.map(k => resolveKey(k)).filter(Boolean);
  let h = '<div class="sec-head"><div><h1>Tekrar</h1></div><span class="chip">' + all.length + ' kayıt · ' + due.length + ' bugün</span></div><p class="muted" style="margin:0;max-width:70ch">Yanlış cevapladığın sorular ve çözemediğin görevler burada toplanır. Doğru cevapladıkça aralık uzar (1 → 2,5 → 6 gün…), üç doğrudan sonra listeden düşer.</p>';
  if (!items.length) return h + '<div class="panel" style="padding:22px"><b>Bugün tekrar yok.</b><p class="muted" style="margin:6px 0 0">' + (all.length ? 'Sıradaki tekrar: ' + new Date(Math.min(...all.map(k => P.rv[k].due))).toLocaleDateString('tr-TR') + '.' : 'Dersleri ve pratikleri çözdükçe yanlışların buraya gelir.') + '</p></div>';
  items.forEach((it, i) => { h += '<div class="exblock" data-k="' + i + '"><div class="exhead"><span class="eyebrow">' + esc(it.src) + '</span><button class="btn sm ghost" data-go="' + it.go + '" data-id="' + esc(it.goId) + '">Kaynağa git</button></div>' + exView(it.e, it.key, { label: 'Tekrar' }) + '</div>'; });
  return h;
}, mount(m) { const due = dueReviews(); const items = due.map(k => resolveKey(k)).filter(Boolean); $$('.exblock', m).forEach(w => { const it = items[+w.dataset.k]; exMount(w, it.e, it.key, { onPass: () => renderNav() }); }); } };
function resolveKey(key) {
  if (key.startsWith('bank#')) { const t = BMAP[key.slice(5)]; return t ? { key, e: t, src: 'Pratik: ' + t.title, go: 'task', goId: t.id } : null; }
  if (key.startsWith('exam:')) { const m = key.match(/^exam:(.+)#(\d+)$/); const x = m && XMAP[m[1]]; const q = x && x.qs[+m[2]]; return q ? { key, e: q, src: 'Sınav: ' + x.title, go: 'exam', goId: x.id } : null; }
  const m = key.match(/^(.+?)#(.+)$/); if (!m) return null; const l = LMAP[m[1]]; if (!l) return null; const i = l.ex.findIndex(e => (e.id || e._k) === m[2]); const e = l.ex[i]; return e ? { key, e, src: 'Ders: ' + l.title, go: 'lesson', goId: l.id } : null;
}

/* Kod editörü */
const PLAY_DEFAULT = '# Kod editörü: istediğin Python kodunu yaz, Ctrl+Enter ile çalıştır.\nsiparisler = [\n    {"sehir": "İstanbul", "tutar": 1250.0},\n    {"sehir": "Ankara", "tutar": 640.5},\n    {"sehir": "İstanbul", "tutar": 310.0},\n]\ntoplam = {}\nfor s in siparisler:\n    toplam[s["sehir"]] = toplam.get(s["sehir"], 0) + s["tutar"]\nfor sehir, t in sorted(toplam.items(), key=lambda kv: -kv[1]):\n    print(f"{sehir:<10} {t:>10,.2f} TL")\n';
VIEWS.play = { html() { const code = (P.pg && P.pg.__play) || PLAY_DEFAULT; return '<div class="sec-head"><div><h1>Kod editörü</h1></div><span class="muted">Standart kütüphane; pandas, numpy, matplotlib, scikit-learn gibi paketler ilk kullanımda yüklenir</span></div><div class="play">' + editor('ta-play', code, { h: 360, label: 'kod.py' }) + '<details class="custom"><summary>input() girdileri</summary><textarea class="input mono" rows="3" data-stdin placeholder="Her satıra bir girdi yaz. Örnek:&#10;Ayşe, Yılmaz&#10;25" aria-label="input() girdileri, her satıra bir tane"></textarea></details><div class="row"><button class="btn pri" data-act="play-run">Çalıştır</button><button class="btn" data-act="play-clear">Temizle</button></div><div class="out" hidden></div></div>'; },
  mount(m) { const ta = $('#ta-play', m); bindEditor(ta); ta.addEventListener('input', () => { clearTimeout(ta._d); ta._d = setTimeout(() => { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; P.pg.__play = ta.value; save(); }, 600); });
    m.addEventListener('click', async ev => { const b = ev.target.closest('button'); if (!b) return; const out = $('.play .out', m); if (b.dataset.act === 'play-clear') { ta.value = ''; ta.dispatchEvent(new Event('input')); out.hidden = true; } if (b.dataset.act === 'play-run') { out.hidden = false; out.innerHTML = busyHTML(); const stdin = $('[data-stdin]', m).value.split('\n').filter(s => s.length); try { const r = await E.run({ code: ta.value, stdin, needs: needsOf(ta.value) }); out.innerHTML = outHTML(r, { ms: r.ms }); } catch (e) { out.innerHTML = engineFail(); } } }); } };

/* Referans */
VIEWS.ref = { html() { const tab = ['kopya', 'sozluk', 'mufredat'].includes(V.id) ? V.id : 'kopya'; const D = window.PY_DICT || [], C = window.PY_CHEATS || [];
  const q = (RF.q || '').trim().toLocaleLowerCase('tr');
  let h = '<div class="sec-head"><div><span class="eyebrow">Referans</span><h1>' + (tab === 'kopya' ? 'Kopya kâğıdı' : tab === 'sozluk' ? 'Sözlük' : 'Müfredat haritası') + '</h1></div><div class="filters">' + [['kopya', 'Kopya kâğıdı'], ['sozluk', 'Sözlük']].map(([k, t]) => '<button type="button" data-go="ref" data-id="' + k + '" aria-pressed="' + (tab === k) + '">' + t + '</button>').join('') + '</div></div>';
  if (tab === 'mufredat') h += curriculumHTML();
  else if (tab === 'kopya') h += '<div class="cheats">' + C.map(c => '<div class="panel cheat"><h3>' + esc(c.title) + '</h3><table>' + c.items.map(([k, v]) => '<tr><td><code>' + esc(k) + '</code></td><td class="muted">' + esc(v) + '</td></tr>').join('') + '</table></div>').join('') + '</div>';
  else h += '<input class="input" data-rf placeholder="Ara: Türkçe ya da İngilizce terim" aria-label="Sözlükte ara" value="' + esc(RF.q || '') + '"><div class="panel dict">' + D.filter(([k, v]) => !q || (k + ' ' + v).toLocaleLowerCase('tr').includes(q)).map(([k, v]) => '<div class="drow"><b>' + esc(k) + '</b><span>' + esc(v) + '</span></div>').join('') + '</div>';
  return h; }, mount(m) { const q = $('[data-rf]', m); if (q) q.addEventListener('input', () => { RF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('[data-rf]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 250); }); } };
const RF = { q: '' };


function curriculumHTML() {
  const PL = window.PY_PLATFORMS || [], CU = window.PY_CURRICULUM || [];
  const cnt = { mc: 0, predict: 0, order: 0, code: 0 }; ORDERED.forEach(l => (l.ex || []).forEach(e => { cnt[e.t] = (cnt[e.t] || 0) + 1; }));
  const totalEx = Object.values(cnt).reduce((a, b) => a + b, 0) + BANK.length + EXAMS.reduce((a, x) => a + x.qs.length, 0);
  const byLv = LEVELS.map(L => [L, levelLessons(L.id)]);
  const mark = v => v === 2 ? '<span class="cv c2" title="Ayrı ders/bölüm">●</span>' : v === 1 ? '<span class="cv c1" title="Kısmen">◐</span>' : '<span class="cv c0" title="Yok">○</span>';
  let h = '<p class="muted" style="margin:0;max-width:75ch">Konu kapsamını planlarken bilinen programların kamuya açık ders listelerine bakıldı. Tablo yazarın elle yaptığı yaklaşık bir karşılaştırmadır, ölçüm değildir.</p>';
  h += '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + ORDERED.length + '</b><span>ders</span></div><div class="panel kpi"><b class="num">' + fmtN(totalEx) + '</b><span>alıştırma, görev ve soru</span></div><div class="panel kpi"><b class="num">' + fmtN(cnt.code) + '</b><span>otomatik testli ders kodu görevi</span></div><div class="panel kpi"><b class="num">' + BANK.length + '</b><span>pratik görevi</span></div></div>';
  h += '<div class="panel" style="padding:14px"><table class="ttab"><tr><th>Seviye</th><th>Ders</th><th>Alıştırma</th><th>Süre</th></tr>' + byLv.map(([L, ls]) => '<tr><td>' + lvBadge(L.id) + '</td><td class="num">' + ls.length + '</td><td class="num">' + fmtN(ls.reduce((a, l) => a + (l.ex || []).length, 0)) + '</td><td class="num">~' + Math.round(ls.reduce((a, l) => a + (l.min || 15), 0) / 60) + ' saat ders</td></tr>').join('') + '<tr><td colspan="4" class="muted" style="font-size:.84rem">Alıştırma türleri: ' + cnt.code + ' kod görevi, ' + cnt.predict + ' çıktı tahmini, ' + cnt.order + ' satır sıralama, ' + cnt.mc + ' kavram sorusu.</td></tr></table></div>';
  h += '<div class="panel cur-wrap"><table class="ttab cur"><tr><th>Konu</th><th>Kesit Python dersleri</th>' + PL.map(p => '<th class="pc">' + esc(p) + '</th>').join('') + '</tr>' + CU.map(([t, ids, cov]) => { const ls = ids.map(id => LMAP[id]).filter(Boolean); return '<tr><td><b>' + esc(t) + '</b></td><td>' + ls.map(l => '<button class="lk" data-go="lesson" data-id="' + l.id + '">' + esc(l.title) + '</button>').join(' ') + '</td>' + cov.map(v => '<td class="pc">' + mark(v) + '</td>').join('') + '</tr>'; }).join('') + '</table></div><p class="muted" style="font-size:.8rem">● ayrı ders/bölüm · ◐ kısmen ya da değinilir · ○ yok. Platform adları sahiplerinin ticari markalarıdır; Kesit Python bu kuruluşlarla bağlantılı değildir.</p>';
  return h;
}

/* Profil */
VIEWS.profile = { html() {
  const done = validDone(); const solved = Object.keys(P.ex).length; const bank = BANK.filter(t => P.ex['bank#' + t.id]).length; const exams = Object.values(P.exams).filter(r => r.best >= 70).length;
  const badges = [['İlk adım', 'İlk dersi bitir', done >= 1], ['Beş ders', '5 ders bitir', done >= 5], ['Temel tamam', 'Temel seviyenin tüm dersleri', levelPct('temel') === 100], ['Orta tamam', 'Orta seviyenin tüm dersleri', levelPct('orta') === 100], ['İleri tamam', 'İleri seviyenin tüm dersleri', levelPct('ileri') === 100], ['Pratik 25', '25 pratik görevi çöz', bank >= 25], ['Pratik 75', '75 pratik görevi çöz', bank >= 75], ['Sınav geçti', 'Bir sınavdan %70+ al', exams >= 1], ['Haftalık seri', '7 gün üst üste çalış', streak() >= 7], ['500 XP', '500 XP topla', P.xp >= 500], ['2000 XP', '2000 XP topla', P.xp >= 2000]];
  const days = []; const d = new Date(); d.setDate(d.getDate() - 83); for (let i = 0; i < 84; i++) { const k = d.toISOString().slice(0, 10); days.push('<i title="' + k + ': ' + (P.days[k] || 0) + ' XP" class="' + (P.days[k] >= DAILY_GOAL * 2 ? 'h4' : P.days[k] >= DAILY_GOAL ? 'h3' : P.days[k] >= 25 ? 'h2' : P.days[k] ? 'h1' : '') + '"></i>'); d.setDate(d.getDate() + 1); }
  return '<div class="sec-head"><div><h1>Profil</h1>' + (P.name ? '<p class="muted" style="margin:2px 0 0">' + esc(P.name) + '</p>' : '') + '</div><div class="row"><input class="input" data-name placeholder="Adın" value="' + esc(P.name || '') + '" style="max-width:180px"><select class="input" data-theme style="max-width:140px"><option value="">Sistem teması</option><option value="light"' + (P.theme === 'light' ? ' selected' : '') + '>Açık</option><option value="dark"' + (P.theme === 'dark' ? ' selected' : '') + '>Koyu</option></select></div></div>' +
    '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + fmtN(P.xp) + '</b><span>XP</span></div><div class="panel kpi"><b class="num">' + done + '</b><span>ders bitti</span></div><div class="panel kpi"><b class="num">' + bank + '</b><span>pratik çözüldü</span></div><div class="panel kpi"><b class="num">' + streak() + '</b><span>gün seri</span></div></div>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Seviye ve hedef</h2></div><div class="panel lvcard"><div class="row"><label>Seviyem: <select class="input" data-level style="max-width:160px"><option value="">Otomatik (' + lvName(myLevel()) + ')</option>' + LEVELS.map(l => '<option value="' + l.id + '"' + (P.level === l.id ? ' selected' : '') + '>' + l.name + '</option>').join('') + '</select></label><label>Hedef öğrenme yolu: <select class="input" data-goal style="max-width:220px"><option value="">Seçilmedi</option>' + PATHS.map(p => '<option value="' + p.id + '"' + (P.goal === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></label></div><div class="climb" style="margin-top:12px">' + LEVELS.map(l => '<div><div class="row" style="justify-content:space-between"><span>' + lvBadge(l.id) + '</span><small class="muted">%' + levelPct(l.id) + '</small></div><div class="bar"><i style="width:' + levelPct(l.id) + '%"></i></div></div>').join('') + '</div></div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Son 12 hafta</h2></div><div class="panel" style="padding:14px"><div class="heat">' + days.join('') + '</div><small class="muted">Her kare bir gün; koyuluk kazanılan XP (günlük hedef ' + DAILY_GOAL + ' XP).</small></div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Rozetler</h2></div><div class="badges">' + badges.map(([t, d, ok]) => '<div class="panel badge ' + (ok ? '' : 'off') + '"><span class="bi">' + (ok ? '✓' : '·') + '</span><b>' + esc(t) + '</b><small>' + esc(d) + '</small></div>').join('') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Sınav geçmişi</h2></div><div class="panel">' + (Object.keys(P.exams).length ? '<table class="ttab"><tr><th>Sınav</th><th>En iyi</th><th>Deneme</th><th>Son</th></tr>' + Object.entries(P.exams).map(([id, r]) => '<tr><td>' + esc((XMAP[id] || {}).title || id) + '</td><td class="num">%' + r.best + '</td><td class="num">' + r.hist.length + '</td><td>' + (r.hist[r.hist.length - 1] || {}).d + '</td></tr>').join('') + '</table>' : '<p class="muted" style="padding:14px;margin:0">Henüz sınava girmedin.</p>') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Yedek</h2><span class="chip' + (window.PY_SYNC && window.PY_SYNC.state() === 'acik' ? ' on' : '') + '">' + (window.PY_SYNC && window.PY_SYNC.state() === 'acik' ? 'claude.ai hesabınla eşitleniyor' : storeOk() ? 'Yalnızca bu tarayıcıda' : 'Tarayıcı kaydetmeye izin vermiyor') + '</span></div><div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:10px"><p class="muted" style="margin:0">İlerlemen bu tarayıcıda saklanır.' + (window.PY_SYNC ? ' claude.ai hesabınla açtıysan ayrıca hesabına özel alanda eşitlenir.' : '') + ' Dosya yedeği alırsan kaybolmaz, başka cihazda da yükleyebilirsin. Yükleme mevcut ilerlemenle birleşir, hiçbir şeyin üzerine yazmaz; başka uygulamanın dosyası reddedilir.</p><div class="row"><button class="btn" data-act="prog-export">İlerlemeyi indir (.json)</button><label class="btn ghost" style="cursor:pointer" tabindex="0">Dosyadan yükle<input type="file" accept=".json,application/json" data-act="prog-import" class="sr-only"></label><button class="btn ghost" data-act="prog-reset" style="color:var(--err)">Tümünü sil</button></div></div></section>';
}, mount(m) {
  $('[data-name]', m).addEventListener('change', ev => { P.name = ev.target.value.trim(); save(); });
  $('[data-theme]', m).addEventListener('change', ev => { P.theme = ev.target.value; applyTheme(); save(); });
  $('[data-level]', m).addEventListener('change', ev => { P.level = ev.target.value; save(); render(); });
  $('[data-goal]', m).addEventListener('change', ev => { P.goal = ev.target.value; save(); render(); });
  m.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.act === 'prog-export') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'kesit-python', v: 1, date: today(), data: P }, null, 1)], { type: 'application/json' })); a.download = 'kesit-python-ilerleme-' + today() + '.json'; a.click(); P.bkDone = validDone(); save(); } if (b.dataset.act === 'prog-reset') { if (confirm('Tüm ilerleme silinsin mi? Bu geri alınamaz.')) { replaceProgress({ welcomed: true }); toast('İlerleme silindi.'); } } });
  m.addEventListener('change', ev => { const el = ev.target; if (el.dataset.act === 'prog-import' && el.files[0]) { const r = new FileReader(); r.onload = () => { let o; try { o = JSON.parse(r.result); } catch (e) { toast('Bu dosya okunamadı: geçerli bir JSON değil. Hiçbir şey değiştirilmedi.'); el.value = ''; return; } const c = checkBackup(o); if (c.err) { toast(c.err); el.value = ''; return; } const added = mergeProgress(c.data); render(); toast('Yedek bu cihazdakiyle birleştirildi' + (added ? ': ' + added + ' ders eklendi.' : '.')); }; r.readAsText(el.files[0]); } });
} };

/* ---------- Genel olaylar ---------- */
function applyTheme() { if (P.theme) document.documentElement.setAttribute('data-theme', P.theme); else document.documentElement.removeAttribute('data-theme'); }
document.addEventListener('click', ev => {
  const sc = ev.target.closest('[data-scroll]'); if (sc) { ev.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t && t.tagName === 'DETAILS') t.open = true; if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const g = ev.target.closest('[data-go]'); if (g) { ev.preventDefault(); go(g.dataset.go, g.dataset.id, g.dataset.sub); return; }
  const os = ev.target.closest('[data-os] button'); if (os) { ev.stopPropagation(); P.os = os.dataset.v; save(); render(); return; }
  const b = ev.target.closest('button[data-act]'); if (!b) return; const box = b.closest('.codebox');
  if (b.dataset.act === 'engine-stop') { if (!E.stop()) toast('Motor yükleniyor; durduracak bir kod yok.'); return; }
  if (b.dataset.act === 'cb-run' && box) runBox(box);
  if (b.dataset.act === 'cb-copy' && box) { navigator.clipboard && navigator.clipboard.writeText($('[data-src]', box).value).then(() => toast('Kopyalandı.'), () => toast('Kopyalanamadı.')); }
  if (b.dataset.act === 'cb-open' && box) { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; P.pg.__play = $('[data-src]', box).value; save(); go('play'); }
});
E.onState(() => renderStats());
window.PY_CORE = { C_LINKS, busyHTML, optOrder, validDone, issueLink, issueUrl, curriculumHTML, fmtN, familyHTML, pathStat, lessonRow, P, save, esc, go, render, renderNav, renderStats, toast, codebox, hl, editor, bindEditor, outHTML, engineFail, lvBadge, lvName, addXP, noteWrong, noteRight, needsOf, exView, exMount, codeExView, mountCodeEx, VIEWS, NAV, ICON, V, LESSONS: ORDERED, LMAP, PATHS, PMAP, BANK, BMAP, EXAMS, lessonState, today, replaceProgress, storeOk, streak, DAILY_GOAL, $, $$ };
/* Diğer modüller (arena, mülakat, veri setleri) kendi görünümlerini kaydettikten sonra ilk çizim yapılır */
/* İlk çizim: tüm betikler (app2.js'teki Arena, Mülakat, Sık hatalar, Yapay Zekâ görünümleri dahil) yüklendikten sonra.
   setTimeout(0) yavaş ağda sonraki betik inmeden çalışabiliyor ve #/mistakes gibi adresler ana sayfaya düşüyordu. */
const _init = () => { applyTheme(); fromHash(); render(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init); else setTimeout(_init, 0);
/* Motor burada yüklenmez: ilk Çalıştır / Kontrol et tıklamasında iner (gizlilik metni bunu söyler). */
})();
