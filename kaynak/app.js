/* PythonPatika — uygulama çekirdeği: ilerleme, gezinti, vurgulama, editör, alıştırma denetimi */
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
(window.PY_EXT || []).forEach(x => { const l = LMAP[x.id]; if (!l) return; if (x.ex) l.ex = (l.ex || []).concat(x.ex); if (x.html) { const k = l.body.lastIndexOf('<section class="deep">'); const add = '<section class="more"><span class="eyebrow">Derinleş</span>' + x.html + '</section>'; l.body = k > 0 ? l.body.slice(0, k) + add + l.body.slice(k) : l.body + add; } if (x.min) l.min = (l.min || 15) + x.min; if (x.faq) l.faq = (l.faq || []).concat(x.faq); if (x.mistakes) l.mistakes = (l.mistakes || []).concat(x.mistakes); });
const STAGE_ORDER = ['Isınma', 'Kodu oku', 'Rehberli', 'Kendin yaz', 'Hata avı', 'Meydan okuma', 'Mini proje'];
LESSONS.forEach(l => { if (l.ex && l.ex.some(e => e.stage)) { const rank = e => { const i = STAGE_ORDER.indexOf(e.stage || ''); return i < 0 ? (e.t === 'mc' || e.t === 'predict' ? 0 : 3) : i; }; l.ex = l.ex.map((e, i) => [e, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]); } });
const ORDERED = ORDER.map(id => LMAP[id]).filter(Boolean);
LESSONS.forEach(l => { if (!ORDER.includes(l.id)) ORDERED.push(l); });
ORDERED.forEach((l, i) => { l._i = i; });
const PATHS = window.PY_PATHS || [], PMAP = {}; PATHS.forEach(p => PMAP[p.id] = p);
const BANK = window.PY_BANK || [], BMAP = {}; BANK.forEach(t => BMAP[t.id] = t);
const EXAMS = window.PY_EXAMS || [], XMAP = {}; EXAMS.forEach(x => XMAP[x.id] = x);
const lvName = id => (LEVELS.find(l => l.id === id) || {}).name || id;
const lvBadge = id => '<span class="lv lv-' + TIER(id) + '">' + esc(lvName(TIER(id))) + '</span>';
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- İlerleme ---------- */
const KEY = 'pythonpatika.v1';
const FRESH = () => ({ done: {}, ex: {}, bank: {}, exams: {}, rv: {}, xp: 0, days: {}, goal: '', theme: '', name: '', level: '', wrong: [], pg: '', _ts: 0 });
function storeOk() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; } }
function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? Object.assign(FRESH(), o) : FRESH(); } catch (e) { return FRESH(); } }
const P = load();
let saveT = null;
function save() { P._ts = Date.now(); clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} window.dispatchEvent(new CustomEvent('py-saved')); }, 150); }
function replaceProgress(o) { Object.keys(P).forEach(k => delete P[k]); Object.assign(P, FRESH(), o); save(); render(); }
function addXP(n) { P.xp = (P.xp || 0) + n; const d = today(); P.days[d] = (P.days[d] || 0) + n; save(); }
function streak() { let n = 0; const d = new Date(); if (!P.days[today()]) d.setDate(d.getDate() - 1); for (;;) { const k = d.toISOString().slice(0, 10); if (!P.days[k]) break; n++; d.setDate(d.getDate() - 1); } return n; }
const DAILY_GOAL = 60;

/* ---------- Vurgulama ---------- */
const KW = 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' ');
const BI = 'print len range int str float bool list dict set tuple sum min max sorted enumerate zip map filter abs round open input type isinstance any all iter next reversed super property staticmethod classmethod getattr setattr hasattr id hash repr format divmod pow chr ord bin hex oct vars dir callable frozenset bytes bytearray slice object Exception ValueError TypeError KeyError IndexError ZeroDivisionError AttributeError RuntimeError StopIteration NotImplementedError FileNotFoundError AssertionError self cls'.split(' ');
const KWS = new Set(KW), BIS = new Set(BI);
function hl(code) {
  let out = '', i = 0; const s = String(code); const n = s.length;
  const re = /("""[\s\S]*?"""|'''[\s\S]*?'''|[rbfRBF]{0,2}"(?:\\.|[^"\\\n])*"|[rbfRBF]{0,2}'(?:\\.|[^'\\\n])*'|#[^\n]*|@[\w.]+|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\b[A-Za-z_]\w*\b|[^\sA-Za-z_0-9"'#@]+|\s+)/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[0]; const c = t[0];
    if (t.startsWith('#')) out += '<span class="c">' + esc(t) + '</span>';
    else if (t.startsWith('@')) out += '<span class="d">' + esc(t) + '</span>';
    else if (/^[rbfRBF]{0,2}["']/.test(t)) out += '<span class="s">' + esc(t) + '</span>';
    else if (/^\d/.test(t)) out += '<span class="n">' + esc(t) + '</span>';
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
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>'
};
const NAV = [['home', 'Ana sayfa'], ['lessons', 'Dersler'], ['paths', 'Patikalar'], ['ai', 'Yapay Zekâ'], ['practice', 'Pratik'], ['arena', 'Kodlama Arenası'], ['exams', 'Sınavlar'], ['interview', 'Mülakat'], ['mistakes', 'Sık hatalar'], ['data', 'Veri setleri'], ['review', 'Tekrar'], ['play', 'Deneme alanı'], ['ref', 'Başvuru'], ['profile', 'Profil']];
const TABNAV = ['home', 'lessons', 'ai', 'interview', 'menu'];   /* mobil alt menü; 'Menü' tüm bölümleri açar */
const V = { name: 'home', id: null, sub: null };
function hashFor(v) { return '#/' + v.name + (v.id ? '/' + v.id : '') + (v.sub ? '/' + v.sub : ''); }
function go(name, id, sub) { V.name = name; V.id = id || null; V.sub = sub || null; const h = hashFor(V); if (location.hash !== h) history.pushState(null, '', h); render(); window.scrollTo({ top: 0 }); const m = $('#main'); if (m) m.focus({ preventScroll: true }); }
function fromHash() { const p = location.hash.replace(/^#\/?/, '').split('/'); V.name = p[0] || 'home'; V.id = p[1] ? decodeURIComponent(p[1]) : null; V.sub = p[2] || null; if (!VIEWS[V.name]) V.name = 'home'; }
window.addEventListener('popstate', () => { fromHash(); render(); });

/* ---------- Durum yardımcıları ---------- */
function exKey(l, i) { const e = l.ex[i]; return l.id + '#' + (e.id || i); }
function lessonState(l) { if (!l.ex || !l.ex.length) return P.done[l.id] ? 'done' : 'new'; const n = l.ex.filter((e, i) => P.ex[exKey(l, i)]).length; if (n === l.ex.length) return 'done'; return n ? 'part' : 'new'; }
function lessonPct(l) { if (!l.ex || !l.ex.length) return P.done[l.id] ? 100 : 0; return Math.round(100 * l.ex.filter((e, i) => P.ex[exKey(l, i)]).length / l.ex.length); }
function checkLessonDone(l) { if (lessonState(l) === 'done' && !P.done[l.id]) { P.done[l.id] = today(); addXP(30); toast('Ders tamamlandı: ' + l.title + ' (+30 XP)'); } }
function levelLessons(lv) { return ORDERED.filter(l => TIER(l.lv) === lv); }
function levelPct(lv) { const ls = levelLessons(lv); if (!ls.length) return 0; return Math.round(ls.reduce((a, l) => a + lessonPct(l), 0) / ls.length); }
function myLevel() { if (P.level) return P.level; if (levelPct('temel') >= 80) return levelPct('orta') >= 80 ? 'ileri' : 'orta'; return 'temel'; }
function nextLesson() { const path = PMAP[P.goal]; const list = path ? path.lessons.map(id => LMAP[id]).filter(Boolean) : ORDERED; return list.find(l => lessonState(l) !== 'done') || null; }
function noteWrong(key, kind) { P.rv[key] = { due: Date.now() + 864e5, iv: 1, k: kind, n: ((P.rv[key] || {}).n || 0) + 1 }; save(); }
function noteRight(key) { const r = P.rv[key]; if (!r) return; const iv = Math.min((r.iv || 1) * 2.5, 60); r.iv = iv; r.due = Date.now() + iv * 864e5; r.ok = (r.ok || 0) + 1; if (r.ok >= 3) delete P.rv[key]; save(); }
function dueReviews() { const now = Date.now(); return Object.entries(P.rv).filter(([k, r]) => r.due <= now).map(([k]) => k); }

/* ---------- Ortak parçalar ---------- */
function codebox(code, opt = {}) {
  const id = 'cb' + Math.random().toString(36).slice(2, 8);
  return '<div class="codebox" data-cb="' + id + '"><pre><code>' + hl(code) + '</code></pre><div class="tools"><span class="lbl">' + esc(opt.label || 'Python') + '</span>' + (opt.run === false ? '' : '<button type="button" data-act="cb-run">Çalıştır</button><button type="button" data-act="cb-open">Deneme alanında aç</button>') + '<button type="button" data-act="cb-copy">Kopyala</button></div><div class="out" hidden></div><textarea class="sr-only" aria-hidden="true" tabindex="-1" data-src>' + esc(code) + '</textarea></div>';
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
  if (!res.out && !res.err && !res.stderr) h += '<p class="muted" style="margin:0">Çıktı yok. Sonucu görmek için print() kullan.</p>';
  if (opt.ms != null) h += '<div class="ms">' + res.ms + ' ms</div>';
  return h;
}
async function runBox(box) {
  const out = $('.out', box), code = $('[data-src]', box).value; out.hidden = false; out.innerHTML = '<p class="muted" style="margin:0">' + (E.state() === 'hazir' ? 'Çalışıyor…' : 'Python motoru yükleniyor (ilk seferde 5–15 sn)…') + '</p>';
  const art = box.closest('.theory');
  try {
    let note = '';
    if (art) {
      /* Defter (notebook) davranışı: ders sayfasındaki örnekler ortak bir ad alanında çalışır; önceki örnekler henüz çalışmadıysa önce onlar sessizce çalıştırılır. */
      const key = 'ders:' + (V.id || '');
      if (art.dataset.ns !== key) { await E.resetNs(key); art.dataset.ns = key; $$('.codebox', art).forEach(b => delete b.dataset.ran); }
      const boxes = $$('.codebox', art).filter(b => $('[data-act="cb-run"]', b));
      const idx = boxes.indexOf(box); let pre = 0;
      for (const b of boxes.slice(0, idx)) { if (b.dataset.ran) continue; const c = $('[data-src]', b).value; if (/\binput\(/.test(c)) continue; await E.run({ code: c, needs: needsOf(c), ns: key }); b.dataset.ran = '1'; pre++; }
      if (pre) note = '<div class="ms" style="text-align:left">Bu örnek önceki örneklerin tanımlarını kullanabildiği için yukarıdaki ' + pre + ' örnek de arka planda çalıştırıldı.</div>';
      const res = await E.run({ code, needs: needsOf(code), ns: key }); box.dataset.ran = '1';
      out.innerHTML = outHTML(res, { ms: res.ms }) + note;
    } else { const res = await E.run({ code, needs: needsOf(code) }); out.innerHTML = outHTML(res, { ms: res.ms }); }
  } catch (e) { out.innerHTML = engineFail(); }
}
function needsOf(code) { const n = []; if (/\bimport\s+pandas|from\s+pandas/.test(code)) n.push('pandas'); if (/\bimport\s+numpy|from\s+numpy/.test(code)) n.push('numpy'); if (/\bmatplotlib/.test(code)) n.push('matplotlib'); return n; }
function engineFail() { return '<div class="errbox"><b>Python motoru yüklenemedi</b>İnternet bağlantısı gerekir (motor ilk açılışta indirilir, sonra önbellekten gelir). ' + esc(E.error() || '') + '<small>Kodu okuyup çözümleri inceleyebilirsin; çalıştırmak için bağlantı geldiğinde sayfayı yenile.</small></div>'; }

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
    if (act === 'ex-hint') { const h = $('.hints', wrap); const hints = e.hints || []; if (!hints.length) { toast('Bu görevde ipucu yok.'); return; } hintN = Math.min(hintN + 1, hints.length); h.hidden = false; h.innerHTML = hints.slice(0, hintN).map((x, i) => '<div class="tip"><b>İpucu ' + (i + 1) + '</b>' + esc(x) + '</div>').join(''); if (hintN < hints.length) b.textContent = 'Bir ipucu daha'; else b.disabled = true; }
    if (act === 'ex-sol') { const s = $('.solbox', wrap); s.hidden = !s.hidden; if (!s.hidden && !s.innerHTML) { s.innerHTML = '<p class="eyebrow">Örnek çözüm</p>' + codebox(e.sol || '', { label: 'çözüm' }) + (e.why ? '<p class="muted">' + e.why + '</p>' : ''); } }
    if (act === 'ex-reset') { ta.value = e.start || ''; ta.dispatchEvent(new Event('input')); out.hidden = true; }
    if (act === 'ex-run' || act === 'ex-check') {
      const check = act === 'ex-check'; out.hidden = false; out.innerHTML = '<p class="muted" style="margin:0">' + (E.state() === 'hazir' ? 'Çalışıyor…' : 'Python motoru yükleniyor (ilk seferde 5–15 sn)…') + '</p>';
      let res; try { res = await E.run({ code: ta.value, tests: check ? (e.tests || '') : '', stdin: e.stdin, needs: (e.needs || []).concat(needsOf(ta.value)) }); } catch (x) { out.innerHTML = engineFail(); return; }
      let pass = check && !res.err; let expectMsg = '';
      if (check && pass && e.expect != null && !E.sameOut(res.out, e.expect)) { pass = false; expectMsg = '<div class="errbox"><b>Çıktı beklenenden farklı</b><div class="cmp2"><div><span class="eyebrow">Beklenen</span><pre>' + esc(String(e.expect).trim()) + '</pre></div><div><span class="eyebrow">Senin çıktın</span><pre>' + esc(String(res.out).trim()) + '</pre></div></div></div>'; }
      out.innerHTML = (check ? (pass ? '<div class="okbox"><b>Tüm testler geçti ✓</b>' + (st(key) ? 'Zaten çözmüştün; iyi tekrar.' : 'Harika iş.') + '</div>' : (res.err && res.err.phase === 'test' ? '<div class="errbox"><b>Test başarısız' + (res.err.type !== 'AssertionError' ? ' (' + esc(res.err.type) + ')' : '') + '</b>' + esc(res.err.msg || 'Sonuç beklenenle uyuşmuyor.') + '<small>Testler kodun çalıştıktan sonra senin tanımladığın adları çağırır; fonksiyon adını ve dönüş değerini kontrol et.</small></div>' : '')) : '') + expectMsg + outHTML({ out: res.out, err: res.err && (res.err.phase !== 'test' || !check) ? res.err : null }, { ms: res.ms });
      if (check) { if (pass) { if (!P.ex[key]) { P.ex[key] = today(); addXP(e.pts ? e.pts * 4 : 15); } noteRight(key); if (opt.onPass) opt.onPass(); save(); if (opt.rerender !== false) { const chip = $('.brief .chip', wrap); if (!chip) $('.brief .row', wrap).insertAdjacentHTML('beforeend', '<span class="chip on">Çözüldü</span>'); renderStats(); } } else { noteWrong(key, opt.kind || 'code'); } }
    }
  });
  function st(k) { return !!P.ex[k]; }
}
function exView(e, key, opt = {}) {
  if (e.t === 'mc') return mcView(e, key, opt);
  if (e.t === 'predict') return mcView(e, key, Object.assign({ label: 'Çıktıyı tahmin et' }, opt, { code: e.code }));
  if (e.t === 'order') return orderView(e, key, opt);
  return codeExView(e, key, Object.assign({ label: e.kind === 'bug' ? 'Hatayı bul' : e.kind === 'tamamla' ? 'Tamamla' : 'Kod görevi' }, opt));
}
function exMount(w, e, key, opt = {}) {
  if (e.t === 'mc' || e.t === 'predict') return mountMc($('.mc', w), e, key, opt);
  if (e.t === 'order') return mountOrder($('.ord', w), e, key, opt);
  return mountCodeEx($('[data-exwrap]', w), e, key, opt);
}
function shuffled(n, seed) { const a = Array.from({ length: n }, (_, i) => i); let x = 0; for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) >>> 0; for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } if (a.every((v, i) => v === i) && n > 1) a.reverse(); return a; }
function orderView(e, key, opt = {}) {
  const st = P.ex[key]; const ord = shuffled(e.lines.length, key);
  return '<div class="panel brief ord" data-ord="' + esc(key) + '"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Satırları sırala') + '</span>' + (st ? '<span class="chip on">Çözüldü</span>' : '') + '</div><div class="q">' + e.q + '</div><p class="muted" style="margin:0;font-size:.84rem">Satırları ↑ ↓ düğmeleriyle doğru sıraya koy. Girintiler hazır; sadece sıra önemli.</p><ol class="olines">' + ord.map(i => '<li data-i="' + i + '"><code>' + hl(e.lines[i]) + '</code><span class="mv"><button type="button" data-mv="-1" aria-label="Yukarı">↑</button><button type="button" data-mv="1" aria-label="Aşağı">↓</button></span></li>').join('') + '</ol><div class="row"><button class="btn pri sm" data-act="ord-check">Kontrol et</button><button class="btn sm ghost" data-act="ord-run">Bu sırayla çalıştır</button>' + (opt.noSol ? '' : '<button class="btn sm ghost" data-act="ord-sol">Doğru sırayı göster</button>') + '</div><div class="out ordout" hidden></div></div>';
}
function mountOrder(el, e, key, opt = {}) {
  const ol = $('.olines', el); const cur = () => $$('li', ol).map(li => +li.dataset.i); const code = () => cur().map(i => e.lines[i]).join('\n') + '\n';
  el.addEventListener('click', async ev => {
    const mv = ev.target.closest('[data-mv]'); if (mv) { const li = mv.closest('li'); const d = +mv.dataset.mv; if (d < 0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling); if (d > 0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li); li.querySelector('[data-mv="' + d + '"]').focus(); $$('li', ol).forEach(x => x.classList.remove('bad', 'good')); return; }
    const b = ev.target.closest('button[data-act]'); if (!b) return; const out = $('.ordout', el);
    if (b.dataset.act === 'ord-sol') { const items = $$('li', ol); e.lines.forEach((_, i) => ol.appendChild(items.find(li => +li.dataset.i === i))); out.hidden = false; out.innerHTML = '<div class="note"><b>Doğru sıra</b>' + (e.why || '') + '</div>'; return; }
    if (b.dataset.act === 'ord-run') { out.hidden = false; out.innerHTML = '<p class="muted" style="margin:0">Çalışıyor…</p>'; try { const r = await E.run({ code: code(), stdin: e.stdin }); out.innerHTML = outHTML(r); } catch (x) { out.innerHTML = engineFail(); } return; }
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
  return '<div class="panel brief mc" data-mc="' + esc(key) + '"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(opt.label || 'Soru') + '</span>' + (st ? '<span class="chip on">Doğru</span>' : '') + '</div><div class="q">' + e.q + '</div>' + (opt.code ? codebox(opt.code, { run: false, label: 'Önce tahmin et, sonra çalıştır' }) : '') + '<div class="opts">' + e.o.map((o, i) => '<button type="button" class="opt" data-i="' + i + '">' + (opt.code ? '<pre class="optpre">' + esc(o) + '</pre>' : o) + '</button>').join('') + '</div><div class="why" hidden></div></div>';
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
function renderNav() {
  const nav = $('#nav'); const due = dueReviews().length;
  nav.innerHTML = NAV.map(([k, t]) => '<button type="button" data-go="' + k + '" aria-current="' + (V.name === k || (V.name === 'lesson' && k === 'lessons') || (V.name === 'path' && k === 'paths') || (V.name === 'task' && k === 'practice') || (V.name === 'exam' && k === 'exams') || (/^arena/.test(V.name) && k === 'arena') || (/^interview/.test(V.name) && k === 'interview') || (V.name === 'dataset' && k === 'data')) + '">' + ICON[k] + '<span>' + t + '</span>' + (k === 'review' && due ? '<span class="count">' + due + '</span>' : '') + '</button>').join('');
  $('#tabbar').innerHTML = TABNAV.map(k => '<button type="button" data-go="' + k + '" aria-current="' + (V.name === k || (k === 'menu' && !TABNAV.includes(V.name) && !(V.name === 'lesson'))) + '">' + ICON[k] + '<span>' + (k === 'menu' ? 'Menü' : NAV.find(x => x[0] === k)[1]) + '</span></button>').join('');
}
function renderStats() {
  const done = Object.keys(P.done).length; const s = streak(); const st = E.state();
  const eng = '<div class="engine"><span class="dot ' + (st === 'hazir' ? 'ok' : st === 'yok' ? 'bad' : '') + '"></span>' + ({ bos: 'Python motoru: hazır bekliyor', yukleniyor: 'Python motoru yükleniyor…', paket: 'Paket yükleniyor…', hazir: 'Python 3.12 çalışıyor', yok: 'Motor yüklenemedi' })[st] + '</div>';
  $('#sideStats').innerHTML = '<div class="stat"><b class="num">' + P.xp + '</b><span>XP</span></div><div class="stat"><b class="num">' + done + '/' + ORDERED.length + '</b><span>ders</span></div><div class="stat"><b class="num">' + s + '</b><span>gün seri</span></div>' + eng;
  $('#miniStats').textContent = P.xp + ' XP · ' + s + ' gün';
}
function render() { renderNav(); renderStats(); const m0 = $('#main'); const m = m0.cloneNode(false); m0.replaceWith(m); /* görünümlerin mount'ta eklediği dinleyiciler birikmesin */ m.innerHTML = '<div class="wrap">' + (VIEWS[V.name] || VIEWS.home).html() + '</div>'; enhance(m); if (VIEWS[V.name] && VIEWS[V.name].mount) VIEWS[V.name].mount(m); document.title = 'PythonPatika' + (V.name !== 'home' ? ' · ' + (NAV.find(x => x[0] === V.name) || [, ''])[1] : ''); }

/* Ana sayfa */
VIEWS.home = { html() {
  const nx = nextLesson(); const lv = myLevel(); const todayXP = P.days[today()] || 0; const due = dueReviews().length; const path = PMAP[P.goal];
  const stops = LEVELS.map(l => { const pct = levelPct(l.id); return '<button type="button" class="panel stop" data-go="lessons" data-id="' + l.id + '"><span class="code" style="color:var(--' + (l.id === 'temel' ? 'l1' : l.id === 'orta' ? 'l3' : 'l5') + ')">' + esc(l.name) + '</span><b>' + esc(l.tag) + '</b><small>' + esc(l.desc) + '</small><small class="muted">' + levelLessons(l.id).length + ' ders · ' + esc(l.code) + '</small><div class="bar"><i style="width:' + pct + '%"></i></div><small>%' + pct + ' tamam</small></button>'; }).join('');
  return '<section class="hero"><div class="panel hero-main"><div class="stripe" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><span class="eyebrow">Sıfırdan işe hazır Python</span><h1>Python\'ı <em>tarayıcında</em> çalıştırarak öğren.</h1><p>Gerçek CPython motoru, otomatik testli alıştırmalar, rol patikaları, pratik bankası ve sınavlar. SQLPatika ve PBIPatika\'nın kardeşi: aynı sade dil, aynı iş odaklı yaklaşım.</p><div class="row">' + (nx ? '<button class="btn pri" data-go="lesson" data-id="' + nx.id + '">' + (Object.keys(P.done).length ? 'Kaldığın yerden devam: ' : 'Başla: ') + esc(nx.title) + '</button>' : '<span class="chip on">Tüm dersler tamam 🎉</span>') + '<button class="btn" data-go="exam" data-id="seviye-tespit">Seviye tespit sınavı</button></div></div><div class="panel today"><span class="eyebrow">Bugün</span><div class="kpis"><div class="kpi"><b class="num">' + todayXP + '</b><span>/ ' + DAILY_GOAL + ' XP günlük hedef</span></div><div class="kpi"><b class="num">' + streak() + '</b><span>gün seri</span></div><div class="kpi"><b class="num">' + due + '</b><span>tekrar bekliyor</span></div></div><div class="bar"><i style="width:' + Math.min(100, Math.round(100 * todayXP / DAILY_GOAL)) + '%"></i></div>' + (path ? '<div class="continue"><span class="ic" style="background:' + path.color + '">' + esc(path.short) + '</span><div class="grow"><b>' + esc(path.name) + ' patikası</b><small class="muted">' + path.lessons.filter(id => LMAP[id] && lessonState(LMAP[id]) === 'done').length + '/' + path.lessons.length + ' ders</small></div><button class="btn sm" data-go="path" data-id="' + path.id + '">Aç</button></div>' : '<div class="continue"><div class="grow"><b>Hedefini seç</b><small class="muted">Rolüne göre ders sırası ve proje.</small></div><button class="btn sm" data-go="paths">Patikalar</button></div>') + (due ? '<button class="btn" data-go="review">Tekrarları yap (' + due + ')</button>' : '') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Üç seviye, tek yol</h2><span class="muted">Şu anki seviyen: ' + lvBadge(lv) + '</span></div><div class="climb">' + stops + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Rol patikaları</h2><button class="btn sm ghost" data-go="paths">Tümü</button></div><div class="paths">' + PATHS.slice(0, 4).map(pathCard).join('') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Nasıl çalışır?</h2><button class="btn sm ghost" data-go="ref" data-id="mufredat">Müfredat haritası</button></div><div class="how"><div class="panel"><b>1. Oku ve çalıştır</b><p>Her dersteki örnekler tek tıkla tarayıcında çalışır; kodu değiştirip yeniden dene. Kurulum dersleri kendi bilgisayarına geçişi adım adım anlatır.</p></div><div class="panel"><b>2. Adım adım alıştır</b><p>Her derste Isınma → Kodu oku → Rehberli → Kendin yaz → Hata avı → Meydan okuma. Rehberli görevlerde yol haritası, benzer örnek ve kademeli ipucu var.</p></div><div class="panel"><b>3. Pekiştir</b><p>Testler anında geri bildirim verir; yanlışların tekrar kuyruğuna girer. Pratik bankası ve zamanlı sınavlarla işe hazır ol.</p></div></div></section>';
}, mount() { renderStats(); } };
function pathCard(p) { const n = p.lessons.filter(id => LMAP[id] && lessonState(LMAP[id]) === 'done').length; return '<button type="button" class="panel pcard" data-go="path" data-id="' + p.id + '"><div class="row"><span class="ic" style="background:' + p.color + '">' + esc(p.short) + '</span><b>' + esc(p.name) + '</b></div><p>' + esc(p.desc) + '</p><div class="foot"><span>' + p.lessons.length + ' ders</span><span>' + n + ' tamam</span></div><div class="bar"><i style="width:' + Math.round(100 * n / p.lessons.length) + '%"></i></div></button>'; }

/* Dersler */
VIEWS.lessons = { html() {
  const lv = V.id && LEVELS.find(l => l.id === V.id) ? V.id : 'all';
  const list = lv === 'all' ? ORDERED : levelLessons(lv);
  let h = '<div class="sec-head"><div><span class="eyebrow">Dersler</span><h1>' + (lv === 'all' ? 'Tüm dersler' : lvName(lv) + ' seviye') + '</h1></div><div class="filters">' + [['all', 'Tümü'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']].map(([k, t]) => '<button type="button" data-go="lessons" data-id="' + (k === 'all' ? '' : k) + '" aria-pressed="' + (lv === k) + '">' + t + '</button>').join('') + '</div></div>';
  if (lv !== 'all') { const L = LEVELS.find(l => l.id === lv); h += '<div class="panel lvcard"><div class="row" style="justify-content:space-between"><div>' + lvBadge(lv) + ' <b>' + esc(L.tag) + '</b></div><span class="muted">' + esc(L.code) + '</span></div><p class="muted">' + esc(L.desc) + '</p><ul class="can">' + L.can.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul><div class="row"><button class="btn sm" data-go="exam" data-id="' + lv + '-bitirme">' + esc(L.name) + ' bitirme sınavı</button></div></div>'; }
  let curMod = null, curLv = null; h += '<div class="panel lessons">';
  list.forEach(l => { const t = TIER(l.lv); if (lv === 'all' && t !== curLv) { curLv = t; h += '<div class="mod-head lvhead">' + lvBadge(t) + ' ' + esc(LEVELS.find(x => x.id === t).tag) + '</div>'; curMod = null; } if (l.mod !== curMod) { curMod = l.mod; h += '<div class="mod-head">' + esc(l.mod || '') + '</div>'; } h += lessonRow(l); });
  return h + '</div>';
} };
function lessonRow(l) { const s = lessonState(l); return '<button type="button" class="litem" data-go="lesson" data-id="' + l.id + '"><span class="check ' + s + '">' + (s === 'done' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>' : '') + '</span><div><b>' + esc(l.title) + '</b><small>' + esc(l.sum || '') + '</small></div><div class="meta"><small class="muted">' + (l.min || 15) + ' dk · ' + (l.ex || []).length + ' alıştırma</small>' + (s === 'part' ? '<div class="bar" style="width:70px"><i style="width:' + lessonPct(l) + '%"></i></div>' : '') + '</div></button>'; }

/* Ders görünümü */
VIEWS.lesson = { html() {
  const l = LMAP[V.id]; if (!l) return '<p>Ders bulunamadı.</p>';
  const tab = V.sub || 'ders'; const ex = l.ex || []; const i = l._i; const prev = ORDERED[i - 1], next = ORDERED[i + 1];
  const nEx = ex.filter((e, k) => P.ex[exKey(l, k)]).length;
  let h = '<div class="lhead"><div class="crumbs"><button data-go="lessons" data-id="' + TIER(l.lv) + '">' + esc(lvName(TIER(l.lv))) + '</button> › <span>' + esc(l.mod || '') + '</span></div><div class="row" style="justify-content:space-between"><div><h1>' + esc(l.title) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(l.sum || '') + '</p></div><div class="row">' + lvBadge(l.lv) + '<span class="chip">' + (l.min || 15) + ' dk</span>' + (l.needs && l.needs.length ? '<span class="chip">' + esc(l.needs.join(', ')) + '</span>' : '') + '</div></div>' +
    '<div class="steps">' + [['ders', 'Ders'], ['alistirma', 'Alıştırmalar (' + nEx + '/' + ex.length + ')'], ['sss', 'Sık hatalar ve SSS']].map(([k, t]) => '<button type="button" data-go="lesson" data-id="' + l.id + '" data-sub="' + k + '" aria-current="' + (tab === k) + '" class="' + (k === 'alistirma' && nEx === ex.length && ex.length ? 'done' : '') + '">' + t + '</button>').join('') + '</div></div>';
  if (tab === 'ders') {
    h += '<article class="panel theory">' + (l.goals && l.goals.length ? '<div class="note goals"><b>Bu dersin sonunda</b><ul>' + l.goals.map(g => '<li>' + esc(g) + '</li>').join('') + '</ul></div>' : '') + l.body + '</article>';
    h += '<div class="row" style="justify-content:space-between"><span class="muted">Örnekleri çalıştır, sonra alıştırmalara geç.</span><button class="btn pri" data-go="lesson" data-id="' + l.id + '" data-sub="alistirma">Alıştırmalara geç →</button></div>';
  } else if (tab === 'alistirma') {
    if (!ex.length) h += '<p class="muted">Bu derste alıştırma yok.</p>';
    const STAGE_DESC = { 'Isınma': 'Kavramı yokla: kısa sorular.', 'Kodu oku': 'Kodu çalıştırmadan çıktıyı tahmin et, satırları sırala.', 'Rehberli': 'Yol haritası ve ipuçlarıyla adım adım yaz.', 'Kendin yaz': 'Görev metninden yola çıkarak sıfırdan yaz.', 'Hata avı': 'Çalışmayan kodu düzelt.', 'Meydan okuma': 'Zor görevler: kenar durumları ve verimlilik.', 'Mini proje': 'Parçaları birleştir, gerçek bir iş çıkar.' };
    const stages = Array.from(new Set(ex.map(e => e.stage).filter(Boolean)));
    if (stages.length) h += '<div class="stagebar">' + stages.map(sg => { const its = ex.map((e, k) => [e, k]).filter(x => x[0].stage === sg); const n = its.filter(x => P.ex[exKey(l, x[1])]).length; return '<a href="#st-' + encodeURIComponent(sg) + '" class="stg' + (n === its.length ? ' done' : '') + '" data-scroll="st-' + esc(sg) + '"><b>' + esc(sg) + '</b><small>' + n + '/' + its.length + '</small></a>'; }).join('') + '</div>';
    let curStage = null;
    ex.forEach((e, k) => { const key = exKey(l, k); if (e.stage && e.stage !== curStage) { curStage = e.stage; h += '<div class="stagehead" id="st-' + esc(curStage) + '"><h2>' + esc(curStage) + '</h2><span class="muted">' + esc(STAGE_DESC[curStage] || '') + '</span></div>'; } h += '<div class="exblock" data-k="' + k + '"><div class="exhead"><span class="eyebrow">Alıştırma ' + (k + 1) + ' / ' + ex.length + (e.diff ? ' · ' + '★'.repeat(e.diff) : '') + '</span></div>' + exView(e, key) + '</div>'; });
    h += '<div class="row" style="justify-content:space-between">' + (prev ? '<button class="btn" data-go="lesson" data-id="' + prev.id + '">← ' + esc(prev.title) + '</button>' : '<span></span>') + (next ? '<button class="btn pri" data-go="lesson" data-id="' + next.id + '">Sonraki: ' + esc(next.title) + ' →</button>' : '') + '</div>';
  } else {
    h += '<section class="lvl-block">' + ((l.mistakes || []).length ? '<div class="sec-head"><h2>Sık yapılan hatalar</h2></div><div class="mist">' + l.mistakes.map(m => '<div class="panel mrow"><div class="cmp2"><div><span class="eyebrow bad">Hatalı</span>' + codebox(m.bad, { run: false, label: 'hatalı' }) + '</div><div><span class="eyebrow good">Doğru</span>' + codebox(m.good, { run: false, label: 'doğru' }) + '</div></div><p class="muted" style="margin:6px 0 0">' + esc(m.why) + '</p></div>').join('') + '</div>' : '') + ((l.faq || []).length ? '<div class="sec-head"><h2>Sık sorulan sorular</h2></div><div class="faq">' + l.faq.map(f => '<details class="panel"><summary>' + esc(f.q) + '</summary><div class="fa">' + f.a + '</div></details>').join('') + '</div>' : '<p class="muted">Bu derste SSS yok.</p>') + '</section>';
  }
  return h;
}, mount(m) {
  const l = LMAP[V.id]; if (!l) return;
  $$('.exblock', m).forEach(w => { const k = +w.dataset.k; const e = l.ex[k]; const key = exKey(l, k); const done = () => { checkLessonDone(l); const tab = $('.steps button[data-sub="alistirma"]', m); if (tab) { const n = l.ex.filter((x, i) => P.ex[exKey(l, i)]).length; tab.textContent = 'Alıştırmalar (' + n + '/' + l.ex.length + ')'; if (n === l.ex.length) tab.classList.add('done'); } }; exMount(w, e, key, { onPass: done, kind: 'code' }); });
  if (l.needs && l.needs.length && E.state() !== 'yok') E.ensurePkgs(l.needs).catch(() => {});
} };

/* Patikalar */
VIEWS.paths = { html() { return '<div class="sec-head"><div><span class="eyebrow">Patikalar</span><h1>Rolüne göre yol</h1></div></div><p class="muted" style="margin:0;max-width:70ch">Her patika, o rol için gereken dersleri doğru sırada dizer ve bitirme projesine götürür. Hedef patikan ana sayfadaki "devam" düğmesini ve önerilen dersleri belirler.</p><div class="paths">' + PATHS.map(pathCard).join('') + '</div>'; } };
VIEWS.path = { html() {
  const p = PMAP[V.id]; if (!p) return '<p>Patika bulunamadı.</p>';
  const ls = p.lessons.map(id => LMAP[id]).filter(Boolean); const n = ls.filter(l => lessonState(l) === 'done').length; const nx = ls.find(l => lessonState(l) !== 'done');
  let h = '<div class="lhead"><div class="crumbs"><button data-go="paths">Patikalar</button> › <span>' + esc(p.name) + '</span></div><div class="row" style="justify-content:space-between"><div class="row"><span class="ic" style="background:' + p.color + '">' + esc(p.short) + '</span><h1>' + esc(p.name) + '</h1></div><div class="row">' + (P.goal === p.id ? '<span class="chip on">Hedefim</span>' : '<button class="btn pri" data-act="set-goal" data-id="' + p.id + '">Hedefim yap</button>') + (nx ? '<button class="btn" data-go="lesson" data-id="' + nx.id + '">Devam: ' + esc(nx.title) + '</button>' : '') + '</div></div></div>';
  h += '<div class="panel lvcard"><p style="margin:0">' + esc(p.long) + '</p><div class="row" style="margin-top:10px">' + p.skills.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div><p class="muted" style="margin:10px 0 0"><b>Hedef roller:</b> ' + p.jobs.map(esc).join(', ') + '</p><div class="bar" style="margin-top:10px"><i style="width:' + Math.round(100 * n / ls.length) + '%"></i></div><small class="muted">' + n + '/' + ls.length + ' ders · yaklaşık ' + ls.reduce((a, l) => a + (l.min || 15), 0) + ' dk</small></div>';
  let curLv = null; h += '<div class="panel lessons">'; ls.forEach((l, i) => { const t = TIER(l.lv); if (t !== curLv) { curLv = t; h += '<div class="mod-head lvhead">' + lvBadge(t) + '</div>'; } h += lessonRow(l); }); h += '</div>';
  return h;
}, mount(m) { m.addEventListener('click', ev => { const b = ev.target.closest('[data-act="set-goal"]'); if (b) { P.goal = b.dataset.id; save(); toast('Hedef patika: ' + PMAP[P.goal].name); render(); } }); } };

/* Pratik bankası */
const KINDS = { yaz: 'sıfırdan yaz', bug: 'hatayı bul', tamamla: 'tamamla', rehberli: 'rehberli', predict: 'çıktıyı tahmin et', order: 'satırları sırala' };
const PF = { lv: 'all', topic: 'all', diff: 'all', kind: 'all', st: 'all', q: '' };
window.PY_PF = topic => { PF.lv = 'all'; PF.topic = topic; PF.diff = 'all'; PF.kind = 'all'; PF.st = 'all'; PF.q = ''; };
VIEWS.practice = { html() {
  const topics = Array.from(new Set(BANK.filter(t => PF.lv === 'all' || TIER(t.lv) === PF.lv).map(t => t.topic)));
  const list = BANK.filter(t => (PF.lv === 'all' || TIER(t.lv) === PF.lv) && (PF.topic === 'all' || t.topic === PF.topic) && (PF.diff === 'all' || String(t.diff) === PF.diff) && (PF.kind === 'all' || (t.t === 'predict' || t.t === 'order' ? t.t : t.kind) === PF.kind) && (PF.st === 'all' || (PF.st === 'done') === !!P.ex['bank#' + t.id]) && (!PF.q || (t.title + ' ' + (t.tags || []).join(' ')).toLocaleLowerCase('tr').includes(PF.q.toLocaleLowerCase('tr'))));
  const solved = BANK.filter(t => P.ex['bank#' + t.id]).length;
  const fb = (name, opts, cur) => '<div class="filters" data-f="' + name + '">' + opts.map(([k, t]) => '<button type="button" data-v="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(t) + '</button>').join('') + '</div>';
  return '<div class="sec-head"><div><span class="eyebrow">Pratik bankası</span><h1>' + BANK.length + ' görev, otomatik test</h1></div><span class="chip on">' + solved + ' çözüldü</span></div><p class="muted" style="margin:0;max-width:70ch">Ders anlatımı yok, yalnızca iş: sıfırdan yaz, hatayı bul ya da eksik parçayı tamamla. Testler anında kontrol eder; çözemediklerin tekrar kuyruğuna girer.</p>' +
    '<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px">' + fb('lv', [['all', 'Tüm seviyeler'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']], PF.lv) + fb('topic', [['all', 'Tüm konular']].concat(topics.map(t => [t, t])), PF.topic) + '<div class="row">' + fb('diff', [['all', 'Her zorluk'], ['1', 'Kolay'], ['2', 'Orta'], ['3', 'Zor']], PF.diff) + fb('kind', [['all', 'Her tür'], ['rehberli', 'Rehberli'], ['yaz', 'Sıfırdan yaz'], ['bug', 'Hatayı bul'], ['tamamla', 'Tamamla'], ['predict', 'Tahmin et'], ['order', 'Sırala']], PF.kind) + fb('st', [['all', 'Hepsi'], ['new', 'Çözülmemiş'], ['done', 'Çözülmüş']], PF.st) + '</div><input class="input" data-f="q" placeholder="Ara: başlık ya da etiket" value="' + esc(PF.q) + '"></div>' +
    '<div class="panel lessons">' + (list.length ? list.map(t => '<button type="button" class="litem" data-go="task" data-id="' + t.id + '"><span class="check ' + (P.ex['bank#' + t.id] ? 'done' : 'new') + '">' + (P.ex['bank#' + t.id] ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>' : '') + '</span><div><b>' + esc(t.title) + '</b><small>' + esc(t.topic) + ' · ' + (KINDS[t.t === 'predict' ? 'predict' : t.t === 'order' ? 'order' : t.kind] || 'görev') + (t.tags ? ' · ' + t.tags.map(esc).join(', ') : '') + '</small></div><div class="meta">' + lvBadge(t.lv) + '<small class="muted">' + '★'.repeat(t.diff || 1) + ' · ' + (t.min || 8) + ' dk</small></div></button>').join('') : '<p class="muted" style="padding:16px">Bu filtrede görev yok.</p>') + '</div>';
}, mount(m) {
  m.addEventListener('click', ev => { const b = ev.target.closest('.filters button'); if (!b) return; const f = b.closest('.filters').dataset.f; PF[f] = b.dataset.v; if (f === 'lv') PF.topic = 'all'; render(); });
  const q = $('[data-f="q"]', m); q.addEventListener('input', () => { PF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('[data-f="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 350); });
} };
VIEWS.task = { html() {
  const t = BMAP[V.id]; if (!t) return '<p>Görev bulunamadı.</p>';
  const list = BANK; const i = list.indexOf(t); const prev = list[i - 1], next = list[i + 1];
  return '<div class="lhead"><div class="crumbs"><button data-go="practice">Pratik bankası</button> › <span>' + esc(t.topic) + '</span></div><div class="row" style="justify-content:space-between"><h1>' + esc(t.title) + '</h1><div class="row">' + lvBadge(t.lv) + '<span class="chip">' + '★'.repeat(t.diff || 1) + '</span><span class="chip">' + (KINDS[t.t === 'predict' ? 'predict' : t.t === 'order' ? 'order' : t.kind] || 'görev') + '</span></div></div></div>' + (t.t === 'predict' || t.t === 'order' ? exView(t, 'bank#' + t.id) : codeExView(t, 'bank#' + t.id, { label: 'Görev ' + t.id.replace('b-', '#'), h: 320 })) + '<div class="row" style="justify-content:space-between">' + (prev ? '<button class="btn" data-go="task" data-id="' + prev.id + '">← Önceki</button>' : '<span></span>') + (next ? '<button class="btn" data-go="task" data-id="' + next.id + '">Sonraki görev →</button>' : '') + '</div>';
}, mount(m) { const t = BMAP[V.id]; if (!t) return; exMount(m, t, 'bank#' + t.id, { kind: 'bank' }); if (t.needs) E.ensurePkgs(t.needs).catch(() => {}); } };

/* Sınavlar */
VIEWS.exams = { html() {
  return '<div class="sec-head"><div><span class="eyebrow">Sınavlar</span><h1>Kendini ölç</h1></div></div><p class="muted" style="margin:0;max-width:70ch">Zamanlı, özgün sorular. Bitirme sınavları seviyeyi, kodlama sınavları gerçek yazma becerisini ölçer. Sorular gerçek sertifika sorusu değildir; formatı ve zorluğu yansıtır.</p><div class="exams">' + EXAMS.map(x => { const r = P.exams[x.id]; const nq = (x.qs || []).length; return '<div class="panel xcard"><div class="row" style="justify-content:space-between"><div>' + lvBadge(x.lv) + ' <span class="chip">' + (x.kind === 'kod' ? 'kodlama' : 'test') + '</span></div><span class="muted">' + nq + ' soru · ' + x.min + ' dk' + (x.pass ? ' · geçme %' + x.pass : '') + '</span></div><h3>' + esc(x.title) + '</h3><p class="muted">' + esc(x.desc || '') + '</p><div class="row" style="justify-content:space-between">' + (r ? '<span class="chip ' + (r.best >= (x.pass || 0) ? 'on' : '') + '">En iyi %' + r.best + ' · ' + (r.hist || []).length + ' deneme</span>' : '<span></span>') + '<button class="btn pri sm" data-go="exam" data-id="' + x.id + '">' + (r ? 'Tekrar gir' : 'Başla') + '</button></div></div>'; }).join('') + '</div>';
} };
/* Mobilde alt menüde yer almayan tüm bölümler */
const NAV_DESC = { home: 'Günlük hedef ve kaldığın yer', lessons: 'Seviyelere göre tüm dersler', paths: 'Role göre öğrenme yolları', ai: 'Python ile LLM, RAG, ajanlar ve ML', practice: 'Seviyeli pratik görevleri', arena: 'HackerRank tarzı problemler', exams: 'Seviye ve patika sınavları', interview: 'Role göre Python mülakat soruları', mistakes: 'Hatalı kod → doğru kod', data: 'SQL ve Power BI veri setleri', review: 'Aralıklı tekrar kuyruğu', play: 'Serbest Python çalıştır', ref: 'Kopya kâğıdı, sözlük, müfredat', profile: 'İlerleme, rozetler, ayarlar' };
VIEWS.menu = { html() {
  return '<div class="sec-head"><div><span class="eyebrow">Menü</span><h1>Tüm bölümler</h1></div></div><div class="paths">' + NAV.map(([k, t]) => '<button type="button" class="panel pcard" data-go="' + k + '"><div class="row"><span class="ic navic">' + ICON[k] + '</span><b>' + esc(t) + '</b></div><p>' + esc(NAV_DESC[k] || '') + '</p></button>').join('') + '</div>';
} };
const XS = { id: null, i: 0, ans: {}, t0: 0, timer: null, done: false, res: null };
VIEWS.exam = { html() {
  const x = XMAP[V.id]; if (!x) return '<p>Sınav bulunamadı.</p>';
  if (XS.id !== x.id || XS.done && V.sub !== 'sonuc') { if (XS.id !== x.id) { XS.id = x.id; XS.i = 0; XS.ans = {}; XS.t0 = 0; XS.done = false; XS.res = null; } }
  if (!XS.t0) return '<div class="lhead"><div class="crumbs"><button data-go="exams">Sınavlar</button> › <span>' + esc(x.title) + '</span></div><h1>' + esc(x.title) + '</h1></div><div class="panel lvcard"><p>' + esc(x.desc || '') + '</p><ul><li><b>' + x.qs.length + ' soru</b>' + (x.kind === 'kod' ? ' (' + x.qs.filter(q => q.t === 'code').length + ' kodlama görevi)' : '') + '</li><li><b>' + x.min + ' dakika</b>; süre bitince otomatik teslim edilir.</li>' + (x.pass ? '<li>Geçme notu <b>%' + x.pass + '</b>.</li>' : '<li>Sonuçta hangi seviyeden başlaman gerektiği önerilir.</li>') + '<li>Sorular arasında ileri-geri gidebilirsin; yanlışlar tekrar kuyruğuna girer.</li></ul><button class="btn pri" data-act="x-start">Sınavı başlat</button></div>';
  if (XS.done) return examResult(x);
  const q = x.qs[XS.i]; const key = 'exam:' + x.id + '#' + XS.i;
  let h = '<div class="xbar"><div class="row"><b>' + esc(x.title) + '</b><span class="muted">Soru ' + (XS.i + 1) + '/' + x.qs.length + '</span></div><div class="row"><span class="chip timer" id="xtimer">--:--</span><button class="btn sm" data-act="x-submit">Teslim et</button></div></div>';
  h += '<div class="steps xsteps">' + x.qs.map((qq, i) => '<button type="button" data-act="x-go" data-i="' + i + '" aria-current="' + (i === XS.i) + '" class="' + (XS.ans[i] != null && XS.ans[i] !== '' ? 'done' : '') + '">' + (i + 1) + '</button>').join('') + '</div>';
  if (q.t === 'mc' || q.t === 'predict') h += '<div class="panel brief mc xq" data-i="' + XS.i + '"><span class="eyebrow">' + esc(q.topic || 'Soru') + '</span><div class="q">' + q.q + '</div>' + (q.code ? codebox(q.code, { run: false }) : '') + '<div class="opts">' + q.o.map((o, i) => '<button type="button" class="opt" data-i="' + i + '" aria-pressed="' + (XS.ans[XS.i] === i) + '">' + (q.t === 'predict' ? '<pre class="optpre">' + esc(o) + '</pre>' : o) + '</button>').join('') + '</div></div>';
  else h += codeExView(q, key, { label: 'Kodlama görevi · ' + (q.pts || 5) + ' puan', noSol: true, checkLabel: 'Testleri çalıştır', h: 280 });
  h += '<div class="row" style="justify-content:space-between"><button class="btn" data-act="x-go" data-i="' + (XS.i - 1) + '" ' + (XS.i === 0 ? 'disabled' : '') + '>← Önceki</button>' + (XS.i < x.qs.length - 1 ? '<button class="btn pri" data-act="x-go" data-i="' + (XS.i + 1) + '">Sonraki →</button>' : '<button class="btn pri" data-act="x-submit">Teslim et</button>') + '</div>';
  return h;
}, mount(m) {
  const x = XMAP[V.id]; if (!x) return;
  const tick = () => { const el = $('#xtimer'); if (!el || !XS.t0 || XS.done) return; const left = Math.max(0, x.min * 60 - Math.floor((Date.now() - XS.t0) / 1000)); el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); if (left <= 60) el.classList.add('warn'); if (left === 0) { submit(); } };
  clearInterval(XS.timer); if (XS.t0 && !XS.done) { XS.timer = setInterval(tick, 1000); tick(); }
  const q = x.qs[XS.i];
  if (XS.t0 && !XS.done && q && q.t === 'code') { const w = $('[data-exwrap]', m); const ta = $('textarea.ta', w); ta.value = XS.ans[XS.i] != null ? XS.ans[XS.i] : (q.start || ''); mountCodeEx(w, q, 'exam:' + x.id + '#' + XS.i, { rerender: false, kind: 'exam' }); ta.dispatchEvent(new Event('input')); ta.addEventListener('input', () => { XS.ans[XS.i] = ta.value; }); }
  m.addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return; const act = b.dataset.act;
    if (act === 'x-start') { XS.t0 = Date.now(); XS.i = 0; XS.ans = {}; XS.done = false; render(); }
    if (act === 'x-go') { XS.i = Math.max(0, Math.min(x.qs.length - 1, +b.dataset.i)); render(); }
    if (b.classList.contains('opt') && b.closest('.xq')) { XS.ans[XS.i] = +b.dataset.i; $$('.opt', b.closest('.xq')).forEach(o => o.setAttribute('aria-pressed', o === b)); $$('.xsteps button', m)[XS.i].classList.add('done'); }
    if (act === 'x-submit') { if (!confirm('Sınavı teslim etmek istiyor musun?')) return; submit(); }
  });
  async function submit() {
    if (XS.done) return; clearInterval(XS.timer); XS.done = true;
    const m2 = $('#main'); m2.innerHTML = '<div class="wrap"><p class="muted">Değerlendiriliyor… kodlama görevleri gerçek Python ile test ediliyor.</p></div>';
    let got = 0, tot = 0; const rows = []; const topics = {};
    for (let i = 0; i < x.qs.length; i++) {
      const q = x.qs[i]; const pts = q.t === 'code' ? (q.pts || 5) : 1; tot += pts; let ok = false, info = '';
      if (q.t === 'mc' || q.t === 'predict') ok = XS.ans[i] === q.a;
      else { const code = XS.ans[i]; if (code && code.trim()) { try { const r = await E.run({ code, tests: q.tests || '', stdin: q.stdin, needs: (q.needs || []).concat(needsOf(code)) }); ok = !r.err && (q.expect == null || E.sameOut(r.out, q.expect)); info = r.err ? r.err.type + ': ' + r.err.msg : (ok ? '' : 'çıktı beklenenden farklı'); } catch (e) { info = 'motor yok'; } } else info = 'boş bırakıldı'; }
      if (ok) got += pts; const tp = q.topic || 'Genel'; topics[tp] = topics[tp] || { ok: 0, n: 0, lv: q.lv }; topics[tp].n++; if (ok) topics[tp].ok++;
      rows.push({ i, ok, info, q }); const key = 'exam:' + x.id + '#' + i; if (!ok) noteWrong(key, q.t); else noteRight(key);
    }
    const pct = Math.round(100 * got / tot); const passed = pct >= (x.pass || 0);
    const r = P.exams[x.id] = P.exams[x.id] || { best: 0, hist: [] }; r.hist.push({ d: today(), pct }); r.best = Math.max(r.best, pct); if (r.hist.length > 20) r.hist.shift();
    addXP(passed ? 60 : 20); if (x.id === 'seviye-tespit') { const lv = suggestLevel(rows); P.level = lv; }
    XS.res = { pct, got, tot, passed, rows, topics }; save(); V.sub = 'sonuc'; render();
  }
} };
function suggestLevel(rows) { const by = { temel: [0, 0], orta: [0, 0], ileri: [0, 0] }; rows.forEach(r => { const lv = TIER(r.q.lv || 'temel'); if (!by[lv]) return; by[lv][1]++; if (r.ok) by[lv][0]++; }); const rate = lv => by[lv][1] ? by[lv][0] / by[lv][1] : 0; if (rate('temel') >= .75 && rate('orta') >= .6 && rate('ileri') >= .5) return 'ileri'; if (rate('temel') >= .7 && rate('orta') >= .5) return 'orta'; return 'temel'; }
function examResult(x) {
  const R = XS.res; if (!R) return '';
  const ring = '<div class="ring ' + (R.passed ? 'ok' : 'bad') + '"><b class="num">%' + R.pct + '</b><span>' + R.got + '/' + R.tot + ' puan</span></div>';
  let h = '<div class="lhead"><div class="crumbs"><button data-go="exams">Sınavlar</button> › <span>' + esc(x.title) + '</span></div><h1>Sonuç</h1></div><div class="panel xres"><div class="row" style="gap:24px;align-items:center">' + ring + '<div class="grow">' + (x.id === 'seviye-tespit' ? '<h2>Önerilen başlangıç: ' + lvBadge(P.level) + '</h2><p class="muted">Seviyeni Profil\'den istediğin zaman değiştirebilirsin. Dersler sayfasında bu seviyeden başla.</p>' : '<h2>' + (R.passed ? 'Geçtin 🎉' : 'Bu sefer olmadı') + '</h2><p class="muted">' + (R.passed ? 'Bir sonraki seviyeye geçmeye hazırsın. Yanlışların tekrar kuyruğuna eklendi.' : 'Geçme notu %' + x.pass + '. Zayıf konular aşağıda; ilgili dersleri tekrar edip yeniden gir.') + '</p>') + '<div class="row"><button class="btn" data-act="x-retry">Yeniden gir</button><button class="btn" data-go="review">Tekrar kuyruğu</button></div></div></div></div>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Konu dökümü</h2></div><div class="panel"><table class="ttab"><tr><th>Konu</th><th>Doğru</th><th></th></tr>' + Object.entries(R.topics).map(([t, v]) => { const p = Math.round(100 * v.ok / v.n); return '<tr><td>' + esc(t) + '</td><td class="num">' + v.ok + '/' + v.n + '</td><td style="width:40%"><div class="bar"><i style="width:' + p + '%;background:' + (p >= 70 ? 'var(--ok)' : p >= 40 ? 'var(--warn)' : 'var(--err)') + '"></i></div></td></tr>'; }).join('') + '</table></div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Soru soru</h2></div>' + R.rows.map(r => '<details class="panel xrow ' + (r.ok ? 'ok' : 'bad') + '"><summary><span class="check ' + (r.ok ? 'done' : 'bad') + '">' + (r.ok ? '✓' : '✗') + '</span> Soru ' + (r.i + 1) + ' · ' + esc(r.q.topic || '') + (r.info ? ' <span class="muted">— ' + esc(r.info) + '</span>' : '') + '</summary><div class="fa"><div class="q">' + r.q.q + '</div>' + (r.q.t === 'mc' || r.q.t === 'predict' ? '<p><b>Doğru cevap:</b> ' + r.q.o[r.q.a] + (XS.ans[r.i] != null && XS.ans[r.i] !== r.q.a ? '<br><b>Senin cevabın:</b> ' + r.q.o[XS.ans[r.i]] : '') + '</p>' : '<p class="eyebrow">Örnek çözüm</p>' + codebox(r.q.sol || '', { label: 'çözüm' })) + (r.q.why ? '<div class="note"><b>Açıklama</b>' + r.q.why + '</div>' : '') + '</div></details>').join('') + '</section>';
  return h;
}
document.addEventListener('click', ev => { const b = ev.target.closest('[data-act="x-retry"]'); if (b) { XS.id = null; V.sub = null; render(); } });

/* Tekrar (aralıklı tekrar) */
VIEWS.review = { html() {
  const due = dueReviews(); const all = Object.keys(P.rv);
  const items = due.map(k => resolveKey(k)).filter(Boolean);
  let h = '<div class="sec-head"><div><span class="eyebrow">Tekrar</span><h1>Aralıklı tekrar</h1></div><span class="chip">' + all.length + ' kayıt · ' + due.length + ' bugün</span></div><p class="muted" style="margin:0;max-width:70ch">Yanlış cevapladığın sorular ve çözemediğin görevler burada toplanır. Doğru cevapladıkça aralık uzar (1 → 2,5 → 6 gün…), üç doğrudan sonra listeden düşer.</p>';
  if (!items.length) return h + '<div class="panel" style="padding:22px"><b>Bugün tekrar yok.</b><p class="muted" style="margin:6px 0 0">' + (all.length ? 'Sıradaki tekrar: ' + new Date(Math.min(...all.map(k => P.rv[k].due))).toLocaleDateString('tr-TR') + '.' : 'Dersleri ve pratikleri çözdükçe yanlışların buraya gelir.') + '</p></div>';
  items.forEach((it, i) => { h += '<div class="exblock" data-k="' + i + '"><div class="exhead"><span class="eyebrow">' + esc(it.src) + '</span><button class="btn sm ghost" data-go="' + it.go + '" data-id="' + esc(it.goId) + '">Kaynağa git</button></div>' + exView(it.e, it.key, { label: 'Tekrar' }) + '</div>'; });
  return h;
}, mount(m) { const due = dueReviews(); const items = due.map(k => resolveKey(k)).filter(Boolean); $$('.exblock', m).forEach(w => { const it = items[+w.dataset.k]; exMount(w, it.e, it.key, { onPass: () => renderNav() }); }); } };
function resolveKey(key) {
  if (key.startsWith('bank#')) { const t = BMAP[key.slice(5)]; return t ? { key, e: t, src: 'Pratik: ' + t.title, go: 'task', goId: t.id } : null; }
  if (key.startsWith('exam:')) { const m = key.match(/^exam:(.+)#(\d+)$/); const x = m && XMAP[m[1]]; const q = x && x.qs[+m[2]]; return q ? { key, e: q, src: 'Sınav: ' + x.title, go: 'exam', goId: x.id } : null; }
  const m = key.match(/^(.+?)#(.+)$/); if (!m) return null; const l = LMAP[m[1]]; if (!l) return null; const i = l.ex.findIndex((e, k) => (e.id || String(k)) === m[2]); const e = l.ex[i]; return e ? { key, e, src: 'Ders: ' + l.title, go: 'lesson', goId: l.id } : null;
}

/* Deneme alanı */
const PLAY_DEFAULT = '# Deneme alanı: istediğin Python kodunu yaz, Ctrl+Enter ile çalıştır.\nsiparisler = [\n    {"sehir": "İstanbul", "tutar": 1250.0},\n    {"sehir": "Ankara", "tutar": 640.5},\n    {"sehir": "İstanbul", "tutar": 310.0},\n]\ntoplam = {}\nfor s in siparisler:\n    toplam[s["sehir"]] = toplam.get(s["sehir"], 0) + s["tutar"]\nfor sehir, t in sorted(toplam.items(), key=lambda kv: -kv[1]):\n    print(f"{sehir:<10} {t:>10,.2f} TL")\n';
VIEWS.play = { html() { const code = (P.pg && P.pg.__play) || PLAY_DEFAULT; return '<div class="sec-head"><div><span class="eyebrow">Deneme alanı</span><h1>Serbest Python</h1></div><span class="muted">Standart kütüphane + pandas, numpy, matplotlib (ilk kullanımda yüklenir)</span></div><div class="play">' + editor('ta-play', code, { h: 360, label: 'oyun_alani.py' }) + '<div class="row"><button class="btn pri" data-act="play-run">Çalıştır</button><button class="btn" data-act="play-clear">Temizle</button><span class="muted" style="font-size:.8rem">input() için girdileri virgülle ayırarak yaz:</span><input class="input" data-stdin placeholder="örn. Ayşe, 25" style="max-width:220px"></div><div class="out" hidden></div></div>'; },
  mount(m) { const ta = $('#ta-play', m); bindEditor(ta); ta.addEventListener('input', () => { clearTimeout(ta._d); ta._d = setTimeout(() => { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; P.pg.__play = ta.value; save(); }, 600); });
    m.addEventListener('click', async ev => { const b = ev.target.closest('button'); if (!b) return; const out = $('.play .out', m); if (b.dataset.act === 'play-clear') { ta.value = ''; ta.dispatchEvent(new Event('input')); out.hidden = true; } if (b.dataset.act === 'play-run') { out.hidden = false; out.innerHTML = '<p class="muted" style="margin:0">' + (E.state() === 'hazir' ? 'Çalışıyor…' : 'Python motoru yükleniyor…') + '</p>'; const stdin = $('[data-stdin]', m).value.split(',').map(s => s.trim()).filter(Boolean); try { const r = await E.run({ code: ta.value, stdin, needs: needsOf(ta.value) }); out.innerHTML = outHTML(r, { ms: r.ms }); } catch (e) { out.innerHTML = engineFail(); } } }); } };

/* Başvuru */
VIEWS.ref = { html() { const tab = V.id || 'mufredat'; const D = window.PY_DICT || [], C = window.PY_CHEATS || [];
  let h = '<div class="sec-head"><div><span class="eyebrow">Başvuru</span><h1>' + (tab === 'mufredat' ? 'Müfredat haritası' : 'Hızlı başvuru') + '</h1></div><div class="filters">' + [['mufredat', 'Müfredat haritası'], ['kopya', 'Kopya kâğıdı'], ['sozluk', 'Sözlük']].map(([k, t]) => '<button type="button" data-go="ref" data-id="' + k + '" aria-pressed="' + (tab === k) + '">' + t + '</button>').join('') + '</div></div>';
  if (tab === 'mufredat') h += curriculumHTML();
  else if (tab === 'kopya') h += '<div class="cheats">' + C.map(c => '<div class="panel cheat"><h3>' + esc(c.title) + '</h3><table>' + c.items.map(([k, v]) => '<tr><td><code>' + esc(k) + '</code></td><td class="muted">' + esc(v) + '</td></tr>').join('') + '</table></div>').join('') + '</div>';
  else h += '<div class="panel dict">' + D.map(([k, v]) => '<div class="drow"><b>' + esc(k) + '</b><span>' + esc(v) + '</span></div>').join('') + '</div>';
  return h; } };


function curriculumHTML() {
  const PL = window.PY_PLATFORMS || [], CU = window.PY_CURRICULUM || [];
  const cnt = { mc: 0, predict: 0, order: 0, code: 0 }; ORDERED.forEach(l => (l.ex || []).forEach(e => { cnt[e.t] = (cnt[e.t] || 0) + 1; }));
  const totalEx = Object.values(cnt).reduce((a, b) => a + b, 0) + BANK.length + EXAMS.reduce((a, x) => a + x.qs.length, 0);
  const byLv = LEVELS.map(L => [L, levelLessons(L.id)]);
  const mark = v => v === 2 ? '<span class="cv c2" title="Ayrı ders/bölüm">●</span>' : v === 1 ? '<span class="cv c1" title="Kısmen">◐</span>' : '<span class="cv c0" title="Yok">○</span>';
  let h = '<p class="muted" style="margin:0;max-width:75ch">PythonPatika müfredatı; DataCamp, Codecademy, Harvard CS50P, Python Institute PCEP/PCAP sınav konuları, popüler Udemy bootcamp\'ları ve Kaggle Learn programları incelenerek, hepsinin kapsadığı konuların birleşimi olacak şekilde kuruldu. Tablo yaklaşık bir karşılaştırmadır.</p>';
  h += '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + ORDERED.length + '</b><span>ders</span></div><div class="panel kpi"><b class="num">' + totalEx + '</b><span>alıştırma, görev ve soru</span></div><div class="panel kpi"><b class="num">' + cnt.code + '</b><span>otomatik testli ders kodu görevi</span></div><div class="panel kpi"><b class="num">' + BANK.length + '</b><span>pratik bankası görevi</span></div></div>';
  h += '<div class="panel" style="padding:14px"><table class="ttab"><tr><th>Seviye</th><th>Ders</th><th>Alıştırma</th><th>Süre</th></tr>' + byLv.map(([L, ls]) => '<tr><td>' + lvBadge(L.id) + '</td><td class="num">' + ls.length + '</td><td class="num">' + ls.reduce((a, l) => a + (l.ex || []).length, 0) + '</td><td class="num">~' + Math.round(ls.reduce((a, l) => a + (l.min || 15), 0) / 60) + ' saat ders</td></tr>').join('') + '<tr><td colspan="4" class="muted" style="font-size:.84rem">Alıştırma türleri: ' + cnt.code + ' kod görevi, ' + cnt.predict + ' çıktı tahmini, ' + cnt.order + ' satır sıralama, ' + cnt.mc + ' kavram sorusu.</td></tr></table></div>';
  h += '<div class="panel cur-wrap"><table class="ttab cur"><tr><th>Konu</th><th>PythonPatika dersleri</th>' + PL.map(p => '<th class="pc">' + esc(p) + '</th>').join('') + '</tr>' + CU.map(([t, ids, cov]) => { const ls = ids.map(id => LMAP[id]).filter(Boolean); return '<tr><td><b>' + esc(t) + '</b></td><td>' + ls.map(l => '<button class="lk" data-go="lesson" data-id="' + l.id + '">' + esc(l.title) + '</button>').join(' ') + '</td>' + cov.map(v => '<td class="pc">' + mark(v) + '</td>').join('') + '</tr>'; }).join('') + '</table></div><p class="muted" style="font-size:.8rem">● ayrı ders/bölüm · ◐ kısmen ya da değinilir · ○ yok. Platform adları sahiplerinin ticari markalarıdır; PythonPatika bu kuruluşlarla bağlantılı değildir.</p>';
  return h;
}

/* Profil */
VIEWS.profile = { html() {
  const done = Object.keys(P.done).length; const solved = Object.keys(P.ex).length; const bank = BANK.filter(t => P.ex['bank#' + t.id]).length; const exams = Object.values(P.exams).filter(r => r.best >= 70).length;
  const badges = [['İlk adım', 'İlk dersi bitir', done >= 1], ['Beş ders', '5 ders bitir', done >= 5], ['Temel tamam', 'Temel seviyenin tüm dersleri', levelPct('temel') === 100], ['Orta tamam', 'Orta seviyenin tüm dersleri', levelPct('orta') === 100], ['İleri tamam', 'İleri seviyenin tüm dersleri', levelPct('ileri') === 100], ['Pratik 25', '25 pratik görevi çöz', bank >= 25], ['Pratik 75', '75 pratik görevi çöz', bank >= 75], ['Sınav geçti', 'Bir sınavdan %70+ al', exams >= 1], ['Haftalık seri', '7 gün üst üste çalış', streak() >= 7], ['500 XP', '500 XP topla', P.xp >= 500], ['2000 XP', '2000 XP topla', P.xp >= 2000]];
  const days = []; const d = new Date(); d.setDate(d.getDate() - 83); for (let i = 0; i < 84; i++) { const k = d.toISOString().slice(0, 10); days.push('<i title="' + k + ': ' + (P.days[k] || 0) + ' XP" class="' + (P.days[k] >= DAILY_GOAL * 2 ? 'h4' : P.days[k] >= DAILY_GOAL ? 'h3' : P.days[k] >= 25 ? 'h2' : P.days[k] ? 'h1' : '') + '"></i>'); d.setDate(d.getDate() + 1); }
  return '<div class="sec-head"><div><span class="eyebrow">Profil</span><h1>' + esc(P.name || 'Öğrenci') + '</h1></div><div class="row"><input class="input" data-name placeholder="Adın" value="' + esc(P.name || '') + '" style="max-width:180px"><select class="input" data-theme style="max-width:140px"><option value="">Sistem teması</option><option value="light"' + (P.theme === 'light' ? ' selected' : '') + '>Açık</option><option value="dark"' + (P.theme === 'dark' ? ' selected' : '') + '>Koyu</option></select></div></div>' +
    '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + P.xp + '</b><span>XP</span></div><div class="panel kpi"><b class="num">' + done + '</b><span>ders bitti</span></div><div class="panel kpi"><b class="num">' + bank + '</b><span>pratik çözüldü</span></div><div class="panel kpi"><b class="num">' + streak() + '</b><span>gün seri</span></div></div>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Seviye ve hedef</h2></div><div class="panel lvcard"><div class="row"><label>Seviyem: <select class="input" data-level style="max-width:160px"><option value="">Otomatik (' + lvName(myLevel()) + ')</option>' + LEVELS.map(l => '<option value="' + l.id + '"' + (P.level === l.id ? ' selected' : '') + '>' + l.name + '</option>').join('') + '</select></label><label>Hedef patika: <select class="input" data-goal style="max-width:220px"><option value="">Seçilmedi</option>' + PATHS.map(p => '<option value="' + p.id + '"' + (P.goal === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></label></div><div class="climb" style="margin-top:12px">' + LEVELS.map(l => '<div><div class="row" style="justify-content:space-between"><span>' + lvBadge(l.id) + '</span><small class="muted">%' + levelPct(l.id) + '</small></div><div class="bar"><i style="width:' + levelPct(l.id) + '%"></i></div></div>').join('') + '</div></div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Son 12 hafta</h2></div><div class="panel" style="padding:14px"><div class="heat">' + days.join('') + '</div><small class="muted">Her kare bir gün; koyuluk kazanılan XP (günlük hedef ' + DAILY_GOAL + ' XP).</small></div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Rozetler</h2></div><div class="badges">' + badges.map(([t, d, ok]) => '<div class="panel badge ' + (ok ? '' : 'off') + '"><span class="bi">' + (ok ? '✓' : '·') + '</span><b>' + esc(t) + '</b><small>' + esc(d) + '</small></div>').join('') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Sınav geçmişi</h2></div><div class="panel">' + (Object.keys(P.exams).length ? '<table class="ttab"><tr><th>Sınav</th><th>En iyi</th><th>Deneme</th><th>Son</th></tr>' + Object.entries(P.exams).map(([id, r]) => '<tr><td>' + esc((XMAP[id] || {}).title || id) + '</td><td class="num">%' + r.best + '</td><td class="num">' + r.hist.length + '</td><td>' + (r.hist[r.hist.length - 1] || {}).d + '</td></tr>').join('') + '</table>' : '<p class="muted" style="padding:14px;margin:0">Henüz sınava girmedin.</p>') + '</div></section>' +
    '<section class="lvl-block"><div class="sec-head"><h2>Yedek ve eşitleme</h2><span class="chip' + (window.PY_SYNC && window.PY_SYNC.state() === 'acik' ? ' on' : '') + '">' + (window.PY_SYNC && window.PY_SYNC.state() === 'acik' ? 'claude.ai hesabınla eşitleniyor' : storeOk() ? 'Yalnızca bu tarayıcıda' : 'Tarayıcı kaydetmeye izin vermiyor') + '</span></div><div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:10px"><p class="muted" style="margin:0">İlerlemen bu tarayıcıda saklanır; claude.ai hesabınla açtıysan ayrıca hesabına özel alanda eşitlenir ve başka cihazda kaldığın yerden devam edersin. Dosya yedeği her durumda çalışır.</p><div class="row"><button class="btn" data-act="prog-export">İlerlemeyi indir (.json)</button><label class="btn ghost" style="cursor:pointer">Dosyadan geri yükle<input type="file" accept=".json,application/json" data-act="prog-import" class="sr-only"></label><button class="btn ghost" data-act="prog-reset" style="color:var(--err)">Tümünü sil</button></div></div></section>';
}, mount(m) {
  $('[data-name]', m).addEventListener('change', ev => { P.name = ev.target.value.trim(); save(); });
  $('[data-theme]', m).addEventListener('change', ev => { P.theme = ev.target.value; applyTheme(); save(); });
  $('[data-level]', m).addEventListener('change', ev => { P.level = ev.target.value; save(); render(); });
  $('[data-goal]', m).addEventListener('change', ev => { P.goal = ev.target.value; save(); render(); });
  m.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.act === 'prog-export') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' })); a.download = 'PythonPatika-ilerleme-' + today() + '.json'; a.click(); } if (b.dataset.act === 'prog-reset') { if (confirm('Tüm ilerleme silinsin mi? Bu geri alınamaz.')) { replaceProgress({}); toast('İlerleme silindi.'); } } });
  m.addEventListener('change', ev => { const el = ev.target; if (el.dataset.act === 'prog-import' && el.files[0]) { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o || typeof o !== 'object' || (!o.done && !o.ex && o.xp == null)) throw 0; replaceProgress(o); toast('İlerleme geri yüklendi.'); } catch (e) { toast('Bu dosya bir PythonPatika ilerleme dosyası değil.'); } }; r.readAsText(el.files[0]); } });
} };

/* ---------- Genel olaylar ---------- */
function applyTheme() { if (P.theme) document.documentElement.setAttribute('data-theme', P.theme); else document.documentElement.removeAttribute('data-theme'); }
document.addEventListener('click', ev => {
  const sc = ev.target.closest('[data-scroll]'); if (sc) { ev.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const g = ev.target.closest('[data-go]'); if (g) { ev.preventDefault(); go(g.dataset.go, g.dataset.id, g.dataset.sub); return; }
  const b = ev.target.closest('button[data-act]'); if (!b) return; const box = b.closest('.codebox');
  if (b.dataset.act === 'cb-run' && box) runBox(box);
  if (b.dataset.act === 'cb-copy' && box) { navigator.clipboard && navigator.clipboard.writeText($('[data-src]', box).value).then(() => toast('Kopyalandı.'), () => toast('Kopyalanamadı.')); }
  if (b.dataset.act === 'cb-open' && box) { P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; P.pg.__play = $('[data-src]', box).value; save(); go('play'); }
});
E.onState(() => renderStats());
window.PY_CORE = { lessonRow, P, save, esc, go, render, renderNav, renderStats, toast, codebox, hl, editor, bindEditor, outHTML, engineFail, lvBadge, lvName, addXP, noteWrong, noteRight, needsOf, exView, exMount, codeExView, mountCodeEx, VIEWS, NAV, ICON, V, LESSONS: ORDERED, LMAP, PATHS, PMAP, BANK, BMAP, EXAMS, lessonState, today, replaceProgress, storeOk, streak, DAILY_GOAL, $, $$ };
/* Diğer modüller (arena, mülakat, veri setleri) kendi görünümlerini kaydettikten sonra ilk çizim yapılır */
/* İlk çizim: tüm betikler (app2.js'teki Arena, Mülakat, Sık hatalar, Yapay Zekâ görünümleri dahil) yüklendikten sonra.
   setTimeout(0) yavaş ağda sonraki betik inmeden çalışabiliyor ve #/mistakes gibi adresler ana sayfaya düşüyordu. */
const _init = () => { applyTheme(); fromHash(); render(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init); else setTimeout(_init, 0);
/* Motoru arka planda ısıt: ilk çalıştırma beklemesin */
setTimeout(() => { if (navigator.onLine !== false) E.boot().catch(() => {}); }, 1200);
})();
