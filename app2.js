/* Kesit Python — Python Arena, Mülakat, Sık hatalar, Veri setleri */
(function () {
'use strict';
const C = window.PY_CORE, E = window.PY_ENGINE;
const { P, save, esc, go, render, toast, codebox, hl, editor, bindEditor, outHTML, engineFail, lvBadge, addXP, noteWrong, noteRight, VIEWS, V, $, $$ } = C;
const ARENA = window.PY_ARENA || [], AMAP = {}; ARENA.forEach(a => AMAP[a.id] = a);
/* Mülakat bölümü yalnız Python odaklıdır: davranışsal sorular gösterilmez */
const IV = (window.PY_INTERVIEW || []).filter(q => q.kind !== 'davranissal' && !(q.roles || []).includes('davranissal')), IVMAP = {}; IV.forEach(q => { IVMAP[q.id] = q; q.roles = q.roles || []; });
const MS = window.PY_MISTAKES || [];
const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').trim();
const today = C.today;
const ensure = () => { P.ar = P.ar && typeof P.ar === 'object' ? P.ar : {}; P.iv = P.iv && typeof P.iv === 'object' ? P.iv : {}; P.cont = P.cont || null; P.conts = P.conts || []; P.sims = P.sims || []; P.drafts = P.drafts && typeof P.drafts === 'object' ? P.drafts : {}; };
ensure();
const DIFF = ['Kolay', 'Orta', 'Zor'], DCLS = { Kolay: 'd1', Orta: 'd2', Zor: 'd3' };
const PTS = a => a.pts || ({ Kolay: 10, Orta: 30, Zor: 60 })[a.diff] || 10;
const RANKS = [[0, 'Çaylak'], [100, 'Bronz'], [400, 'Gümüş'], [1000, 'Altın'], [2000, 'Platin'], [4000, 'Elmas'], [7000, 'Usta']];
const arenaScore = () => ARENA.reduce((s, a) => s + Math.round(PTS(a) * ((P.ar[a.id] || {}).best || 0)), 0);
const rankOf = sc => { let r = RANKS[0], nx = null; for (let i = 0; i < RANKS.length; i++) { if (sc >= RANKS[i][0]) { r = RANKS[i]; nx = RANKS[i + 1] || null; } } return { name: r[1], at: r[0], next: nx }; };
const solved = id => ((P.ar[id] || {}).best || 0) >= 1;
const dayIdx = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
const hashStr = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };

/* ================= PYTHON ARENA ================= */
const AF = { track: 'all', diff: 'all', st: 'all', q: '', role: '' };
const ROLE_TRACKS = { genel: ['Python dili', 'Veri tipleri', 'Metinler'], analist: ['Veri seti analizi', 'pandas', 'numpy', 'SQL + Python'], bilimci: ['Veri seti analizi', 'pandas', 'numpy', 'Matematik'], muhendis: ['SQL + Python', 'Veri seti analizi', 'Veri yapıları', 'Algoritmalar'], backend: ['Python dili', 'Veri yapıları', 'Algoritmalar', 'Sınıflar'], ml: ['numpy', 'pandas', 'Matematik', 'Veri seti analizi'], web: ['Python dili', 'Metinler', 'Sınıflar', 'Hatalar ve istisnalar'], ai: ['Metinler', 'Regex', 'Python dili', 'Fonksiyonel'], otomasyon: ['Metinler', 'Regex', 'Tarih ve saat', 'Veri seti analizi'], sertifika: ['Python dili', 'Veri tipleri', 'Sınıflar', 'Hatalar ve istisnalar', 'Fonksiyonel'] };
function arenaHead() {
  const sc = arenaScore(), rk = rankOf(sc), n = ARENA.filter(a => solved(a.id)).length;
  const by = DIFF.map(d => [d, ARENA.filter(a => a.diff === d).length, ARENA.filter(a => a.diff === d && solved(a.id)).length]);
  const pct = rk.next ? Math.round(100 * (sc - rk.at) / (rk.next[0] - rk.at)) : 100;
  return '<div class="panel ar-head"><div class="ar-rank"><span class="eyebrow">Unvan</span><b>' + esc(rk.name) + '</b><div class="bar"><i style="width:' + pct + '%"></i></div><small class="muted">' + (rk.next ? (rk.next[0] - sc) + ' puan sonra ' + rk.next[1] : 'En üst unvan') + '</small></div><div class="ar-kpis"><div><b class="num">' + sc + '</b><span>puan</span></div><div><b class="num">' + n + '/' + ARENA.length + '</b><span>çözüldü</span></div>' + by.map(([d, t, s]) => '<div><b class="num ' + DCLS[d] + 't">' + s + '/' + t + '</b><span>' + d + '</span></div>').join('') + '</div></div>';
}
function daily() { if (!ARENA.length) return null; const pool = ARENA.filter(a => a.diff !== 'Zor'); return pool[dayIdx() % pool.length]; }
VIEWS.arena = { html() {
  const tracks = Array.from(new Set(ARENA.map(a => a.track)));
  const list = ARENA.filter(a => (AF.track === 'all' || a.track === AF.track) && (!AF.role || (ROLE_TRACKS[AF.role] || []).includes(a.track)) && (AF.diff === 'all' || a.diff === AF.diff) && (AF.st === 'all' || (AF.st === 'done') === solved(a.id)) && (!AF.q || (a.title + ' ' + (a.tags || []).join(' ') + ' ' + a.track).toLocaleLowerCase('tr').includes(AF.q.toLocaleLowerCase('tr'))));
  const dq = daily(); const c = P.cont;
  const fb = (name, opts, cur) => '<div class="filters" data-af="' + name + '">' + opts.map(([k, t]) => '<button type="button" data-v="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(t) + '</button>').join('') + '</div>';
  let h = '<div class="sec-head"><div><h1>Python Arena</h1></div></div><p class="muted" style="margin:0;max-width:75ch">İş görüşmesi tarzı problemler: girdiyi standart girdiden okur, sonucu yazdırırsın. Örnek testleri istediğin kadar çalıştır; <b>Gönder</b> dediğinde gizli testler de çalışır, puanın geçen test oranına göre hesaplanır. Konuya göre kısa görevler ve ipuçları için <button class="lk" data-go="practice">Pratik</button>.</p>' + (AF.role ? '<div class="row"><span class="chip on">Rol: ' + esc((C.PMAP[AF.role] || {}).name || AF.role) + '</span><button class="btn sm ghost" data-act="af-role">Tüm problemler</button></div>' : '') + arenaHead();
  h += '<div class="ar-cards">' + (dq ? '<div class="panel ar-card"><span class="eyebrow">Günün sorusu</span><h3>' + esc(dq.title) + '</h3><p class="muted">' + esc(dq.track) + ' · <span class="dchip ' + DCLS[dq.diff] + '">' + dq.diff + '</span> · ' + PTS(dq) + ' puan</p><button class="btn pri sm" data-go="arena-p" data-id="' + dq.id + '">' + (solved(dq.id) ? 'Tekrar çöz' : 'Çöz') + '</button></div>' : '') +
    '<div class="panel ar-card"><span class="eyebrow">Zamanlı set</span><h3>' + (c && !c.done ? 'Devam eden set' : '75 dakikalık oturum') + '</h3><p class="muted">1 kolay, 2 orta, 1 zor problem. Süre bitince puanın kaydedilir.' + (P.conts.length ? ' En iyi: ' + Math.max(...P.conts.map(x => x.score)) + ' puan.' : '') + '</p><button class="btn sm" data-go="arena-c">' + (c && !c.done ? 'Sete dön' : 'Set başlat') + '</button></div></div>';
  h += '<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px">' + fb('diff', [['all', 'Her zorluk']].concat(DIFF.map(d => [d, d])), AF.diff) + fb('track', [['all', 'Tüm alanlar']].concat(tracks.map(t => [t, t + ' (' + ARENA.filter(a => a.track === t).length + ')'])), AF.track) + fb('st', [['all', 'Hepsi'], ['new', 'Çözülmemiş'], ['done', 'Çözülmüş']], AF.st) + '<input class="input" data-af="q" placeholder="Ara: başlık, etiket" value="' + esc(AF.q) + '"></div>';
  h += '<div class="panel lessons">' + (list.length ? list.map(a => { const r = P.ar[a.id] || {}; return '<button type="button" class="litem" data-go="arena-p" data-id="' + a.id + '"><span class="check ' + (solved(a.id) ? 'done' : r.best ? 'part' : 'new') + '">' + (solved(a.id) ? '✓' : '') + '</span><div><b>' + esc(a.title) + '</b><small>' + esc(a.track) + (a.tags && a.tags.length ? ' · ' + a.tags.slice(0, 4).map(esc).join(', ') : '') + '</small></div><div class="meta"><span class="dchip ' + DCLS[a.diff] + '">' + a.diff + '</span><small class="muted">' + (r.best ? Math.round(PTS(a) * r.best) + '/' : '') + PTS(a) + ' puan</small></div></button>'; }).join('') : '<p class="muted" style="padding:16px">Bu filtrede problem yok.</p>') + '</div>';
  return h;
}, mount(m) {
  m.addEventListener('click', ev => { if (ev.target.closest('[data-act="af-role"]')) { AF.role = ''; render(); return; } const b = ev.target.closest('[data-af] button'); if (!b) return; AF[b.closest('[data-af]').dataset.af] = b.dataset.v; render(); });
  const q = $('input[data-af="q"]', m); q.addEventListener('input', () => { AF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('input[data-af="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 350); });
} };

/* Test çalıştırma: üretilen girdiler ve beklenen çıktılar tarayıcıda bir kez hesaplanır */
const GEN = {};
async function caseList(a, withHidden) {
  const cs = (a.samples || []).map((c, i) => ({ kind: 'Örnek ' + (i + 1), in: c.in, out: c.out, sample: true }));
  if (!withHidden) return cs;
  for (let i = 0; i < (a.hidden || []).length; i++) {
    const c = a.hidden[i], key = a.id + '#' + i;
    if (c.gen) {
      if (!GEN[key]) { const g = await E.run({ code: c.gen }); if (g.err) throw new Error('Test üreteci çalışmadı'); const s = await E.run({ code: a.sol, raw: g.out, needs: a.needs }); GEN[key] = { in: g.out, out: s.out }; }
      cs.push({ kind: 'Gizli ' + (i + 1), in: GEN[key].in, out: c.out != null ? c.out : GEN[key].out, big: true });
    } else cs.push({ kind: 'Gizli ' + (i + 1), in: c.in, out: c.out });
  }
  return cs;
}
async function judge(a, code, withHidden, onStep) {
  if (a.mode === 'func') {
    const r = await E.run({ code, tests: a.tests || '', needs: a.needs, limit: 30000 });
    return { total: 1, passed: r.err ? 0 : 1, rows: [{ kind: 'Testler', ok: !r.err, ms: r.ms, err: r.err, out: r.out, stderr: r.stderr }], func: true };
  }
  const cs = await caseList(a, withHidden); const rows = []; let passed = 0;
  for (const c of cs) {
    if (onStep) onStep(rows.length, cs.length);
    const r = await E.run({ code, raw: c.in, needs: a.needs, limit: 20000 });
    const ok = !r.err && norm(r.out) === norm(c.out); if (ok) passed++;
    rows.push({ kind: c.kind, ok, ms: r.ms, err: r.err, got: r.out, exp: c.out, inp: c.in, sample: c.sample, big: c.big, stderr: r.stderr });
    if (r.stopped) { for (let k = rows.length; k < cs.length; k++) rows.push({ kind: cs[k].kind, ok: false, err: { type: 'Çalıştırılmadı', msg: 'Önceki test durdurulduğu için çalışmadı.' }, got: '', exp: cs[k].out, inp: cs[k].in, sample: cs[k].sample, big: cs[k].big }); break; }
  }
  return { total: cs.length, passed, rows };
}
function resultHTML(a, J, submit) {
  const all = J.passed === J.total;
  let h = '<div class="' + (all ? 'okbox' : 'errbox') + '"><b>' + (all ? (submit ? 'Kabul edildi ✓ ' : 'Örnekler geçti ✓ ') : 'Geçen test: ') + J.passed + '/' + J.total + '</b>' + (submit ? 'Puan: ' + Math.round(PTS(a) * J.passed / J.total) + '/' + PTS(a) + (all ? '' : ' · Kısmi puan, geçen test oranıyla hesaplanır.') : (all ? 'Şimdi Gönder ile gizli testleri de çalıştır.' : '')) + '</div>';
  h += '<div class="trows">' + J.rows.map(r => '<details class="trow ' + (r.ok ? 'ok' : 'bad') + '"' + (!r.ok && (r.sample || J.func) ? ' open' : '') + '><summary><span>' + (r.ok ? '✓' : '✗') + '</span> ' + esc(r.kind) + '<small class="muted">' + (r.ms != null ? r.ms + ' ms' : '') + '</small></summary>' +
    (r.err ? '<div class="errbox"><b>' + esc(r.err.type) + (r.err.line ? ' — ' + (r.err.where === '<test>' ? 'test' : 'satır ' + r.err.line) : '') + '</b>' + esc(r.err.msg || '') + (E.explain(r.err) ? '<small>' + esc(E.explain(r.err)) + '</small>' : '') + '</div>' : '') +
    (J.func ? (r.out ? '<pre class="stdout">' + esc(r.out) + '</pre>' : '') :
      (r.sample || r.ok === false && !r.big ? '<div class="cmp3">' + (r.sample ? '<div><span class="eyebrow">Girdi</span><pre>' + esc(String(r.inp).slice(0, 2000)) + '</pre></div>' : '') + '<div><span class="eyebrow">Beklenen</span><pre>' + esc(String(r.exp).slice(0, 2000)) + '</pre></div><div><span class="eyebrow">Senin çıktın</span><pre>' + esc(String(r.got || '').slice(0, 2000)) + '</pre></div></div>' : (r.big && !r.ok ? '<p class="muted" style="margin:6px 0 0">Büyük girdili gizli test. Kenar durumları ve verimliliği kontrol et.</p>' : ''))) +
    (r.stderr ? '<pre class="stdout stderr">' + esc(r.stderr.slice(0, 1500)) + '</pre>' : '') + '</details>').join('') + '</div>';
  return h;
}
VIEWS['arena-p'] = { html() {
  const a = AMAP[V.id]; if (!a) return '<p>Problem bulunamadı.</p>';
  const tab = V.sub || 'problem'; const r = P.ar[a.id] || {}; const c = P.cont && !P.cont.done && P.cont.ids.includes(a.id) ? P.cont : null;
  let h = (c ? contestBar() : '') + '<div class="lhead"><div class="crumbs"><button data-go="' + (c ? 'arena-c' : 'arena') + '">' + (c ? 'Zamanlı set' : 'Python Arena') + '</button> › <span>' + esc(a.track) + '</span></div><div class="row" style="justify-content:space-between"><h1>' + esc(a.title) + '</h1><div class="row"><span class="dchip ' + DCLS[a.diff] + '">' + a.diff + '</span><span class="chip">' + PTS(a) + ' puan</span>' + (solved(a.id) ? '<span class="chip on">Çözüldü</span>' : r.best ? '<span class="chip">En iyi %' + Math.round(100 * r.best) + '</span>' : '') + '</div></div>' +
    '<div class="steps">' + [['problem', 'Problem'], ['cozum', 'Çözüm ve açıklama'], ['gonderim', 'Gönderimler (' + (r.subs || []).length + ')']].map(([k, t]) => '<button type="button" data-go="arena-p" data-id="' + a.id + '" data-sub="' + k + '" aria-current="' + (tab === k) + '">' + t + '</button>').join('') + '</div></div>';
  if (tab === 'cozum') {
    if (!solved(a.id) && !r.peek && !c) return h + '<div class="panel lvcard"><p style="margin:0">Çözümü görmeden önce en az bir kez denemeni öneririz. Çözümü açarsan problemi yine çözebilirsin ama <b>bu problemden puan alamazsın</b>.</p><div class="row"><button class="btn" data-act="ar-peek">Yine de göster</button><button class="btn pri" data-go="arena-p" data-id="' + a.id + '">Denemeye dön</button></div></div>';
    if (c) return h + '<div class="panel lvcard"><p style="margin:0">Set sürerken çözümler kapalı.</p></div>';
    return h + '<article class="panel theory">' + (a.editorial || '') + '<h3>Örnek çözüm</h3>' + codebox(a.sol, { label: 'çözüm' }) + '</article>';
  }
  if (tab === 'gonderim') return h + '<div class="panel">' + ((r.subs || []).length ? '<table class="ttab"><tr><th>Tarih</th><th>Sonuç</th><th>Puan</th><th></th></tr>' + r.subs.slice().reverse().map((s, i) => '<tr><td>' + esc(s.d) + '</td><td>' + s.p + '/' + s.t + ' test</td><td class="num">' + Math.round(PTS(a) * s.p / s.t) + '</td><td><button class="btn sm ghost" data-act="ar-load" data-i="' + (r.subs.length - 1 - i) + '">Kodu yükle</button></td></tr>').join('') + '</table>' : '<p class="muted" style="padding:14px;margin:0">Henüz gönderim yok.</p>') + '</div>';
  const code = P.drafts[a.id] != null ? P.drafts[a.id] : (a.start || (a.mode === 'func' ? '' : 'import sys\n\n# girdiyi oku: input() ya da sys.stdin\n'));
  h += '<div class="ex-grid ar-grid"><div class="panel brief"><div class="q">' + a.statement + '</div>' + (a.mode === 'func' ? '' : (a.input ? '<h4>Girdi biçimi</h4>' + a.input : '') + (a.output ? '<h4>Çıktı biçimi</h4>' + a.output : '')) + (a.constraints ? '<h4>Kısıtlar</h4><p><code>' + esc(a.constraints) + '</code></p>' : '') +
    (a.samples || []).map((s, i) => '<h4>Örnek ' + (i + 1) + '</h4>' + (a.mode === 'func' ? '<pre class="outbox">' + esc(s.in) + '  →  ' + esc(s.out) + '</pre>' : '<div class="cmp3"><div><span class="eyebrow">Girdi</span><pre>' + esc(s.in) + '</pre></div><div><span class="eyebrow">Çıktı</span><pre>' + esc(s.out) + '</pre></div></div>') + (s.why ? '<p class="muted" style="font-size:.86rem">' + s.why + '</p>' : '')).join('') +
    '<div class="row" style="gap:8px;margin-top:6px"><button class="btn sm" data-act="ar-hint">İpucu</button>' + (a.tags ? a.tags.map(t => '<span class="chip">' + esc(t) + '</span>').join('') : '') + '</div><div class="hints" hidden></div></div>' +
    '<div class="work">' + editor('ta-ar', code, { h: 340, label: a.mode === 'func' ? 'cozum.py' : 'cozum.py · stdin → stdout' }) +
    (a.mode === 'func' ? '' : '<details class="custom"><summary>Kendi girdinle çalıştır</summary><textarea class="input mono" rows="4" data-custom placeholder="Girdiyi buraya yaz">' + esc((a.samples || [{}])[0].in || '') + '</textarea><button class="btn sm" data-act="ar-custom">Bu girdiyle çalıştır</button></details>') +
    '<div class="row"><button class="btn" data-act="ar-run">' + (a.mode === 'func' ? 'Testleri çalıştır' : 'Örnekleri çalıştır') + '</button><button class="btn pri" data-act="ar-submit">Gönder</button><button class="btn ghost sm" data-act="ar-reset">Sıfırla</button></div><div class="out exout" hidden></div></div></div>';
  return h;
}, mount(m) {
  const a = AMAP[V.id]; if (!a) return; const r = (P.ar[a.id] = P.ar[a.id] || {});
  if (P.cont && !P.cont.done) tickContest();
  m.addEventListener('click', async ev => {
    const b = ev.target.closest('button[data-act]'); if (!b) return; const act = b.dataset.act;
    if (act === 'ar-peek') { if (!confirm('Çözümü açarsan bu problemden puan alamazsın. Devam edilsin mi?')) return; r.peek = 1; save(); render(); return; }
    if (act === 'ar-load') { P.drafts[a.id] = r.subs[+b.dataset.i].code; save(); go('arena-p', a.id); return; }
    if (act === 'ar-hint') { const hs = a.hints || []; const box = $('.hints', m); r.hn = Math.min((r.hn || 0) + 1, hs.length); box.hidden = false; box.innerHTML = hs.length ? hs.slice(0, r.hn).map((x, i) => '<div class="tip"><b>İpucu ' + (i + 1) + '</b>' + esc(x) + '</div>').join('') : '<p class="muted">Bu problemde ipucu yok.</p>'; return; }
    const ta = $('#ta-ar', m); const out = $('.exout', m); if (!ta) return;
    if (act === 'ar-reset') { if (!confirm('Kodun başlangıç haline dönsün mü?')) return; delete P.drafts[a.id]; save(); render(); return; }
    out.hidden = false;
    if (act === 'ar-custom') { out.innerHTML = C.busyHTML(); try { const res = await E.run({ code: ta.value, raw: $('[data-custom]', m).value, needs: a.needs }); out.innerHTML = outHTML(res, { ms: res.ms }); } catch (e) { out.innerHTML = engineFail(); } return; }
    if (act === 'ar-run' || act === 'ar-submit') {
      const sub = act === 'ar-submit'; $$('button[data-act^="ar-"]', m).forEach(x => x.disabled = true);
      out.innerHTML = C.busyHTML();
      try {
        const J = await judge(a, ta.value, sub, (i, n) => { out.innerHTML = C.busyHTML('Test ' + (i + 1) + '/' + n + ' çalışıyor…'); });
        out.innerHTML = resultHTML(a, J, sub);
        if (sub) {
          const frac = J.passed / J.total; r.subs = (r.subs || []).concat([{ d: new Date().toLocaleString('tr-TR'), p: J.passed, t: J.total, code: ta.value }]).slice(-20);
          const counted = r.peek && !(r.best >= 1) ? 0 : frac;
          if (counted > (r.best || 0)) { const gain = Math.round(PTS(a) * (counted - (r.best || 0))); r.best = counted; if (gain > 0) { addXP(Math.max(5, Math.round(gain / 2))); toast('+' + gain + ' arena puanı' + (counted >= 1 ? ' · Çözüldü!' : '')); } }
          if (P.cont && !P.cont.done && P.cont.ids.includes(a.id)) { P.cont.best[a.id] = Math.max(P.cont.best[a.id] || 0, frac); }
          save(); C.renderStats();
        }
      } catch (e) { out.innerHTML = engineFail(); }
      $$('button[data-act^="ar-"]', m).forEach(x => x.disabled = false);
    }
  });
  const ta = $('#ta-ar', m); if (ta) { bindEditor(ta); ta.addEventListener('input', () => { clearTimeout(ta._d); ta._d = setTimeout(() => { P.drafts[a.id] = ta.value; save(); }, 600); }); ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); $('[data-act="ar-run"]', m).click(); } }); }
} };

/* Zamanlı set */
function pickContest() {
  const seed = Date.now(); const by = d => ARENA.filter(a => a.diff === d && a.mode !== 'func' && !solved(a.id)).concat(ARENA.filter(a => a.diff === d && a.mode !== 'func' && solved(a.id)));
  const take = (d, n) => { const pool = by(d).slice(0, 40); const out = []; let x = seed; while (out.length < n && pool.length) { x = (x * 1103515245 + 12345) >>> 0; out.push(pool.splice(x % pool.length, 1)[0].id); } return out; };
  return take('Kolay', 1).concat(take('Orta', 2), take('Zor', 1));
}
function contestScore(c) { return c.ids.reduce((s, id) => s + Math.round(PTS(AMAP[id] || {}) * (c.best[id] || 0)), 0); }
function contestBar() { const c = P.cont; return '<div class="xbar"><div class="row"><b>Zamanlı set</b><span class="muted">' + contestScore(c) + ' puan</span></div><div class="row"><span class="chip timer" id="ctimer">--:--</span><button class="btn sm" data-go="arena-c">Problemler</button></div></div>'; }
let CT = null;
function tickContest() {
  clearInterval(CT); const c = P.cont; if (!c || c.done) return;
  const f = () => { const left = Math.max(0, c.min * 60 - Math.floor((Date.now() - c.t0) / 1000)); const el = $('#ctimer'); if (el) { el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); el.classList.toggle('warn', left < 300); } if (!left) finishContest(); };
  f(); CT = setInterval(f, 1000);
}
function finishContest() { const c = P.cont; if (!c || c.done) return; clearInterval(CT); c.done = true; c.score = contestScore(c); P.conts = P.conts.concat([{ d: today(), score: c.score, max: c.ids.reduce((s, id) => s + PTS(AMAP[id] || {}), 0), ids: c.ids, best: c.best }]).slice(-30); addXP(30); save(); toast('Zamanlı set bitti: ' + c.score + ' puan'); if (/^arena/.test(V.name)) render(); }
VIEWS['arena-c'] = { html() {
  const c = P.cont;
  if (!c || c.done) {
    let h = '<div class="sec-head"><div><span class="eyebrow">Python Arena</span><h1>Zamanlı set</h1></div><button class="btn sm ghost" data-go="arena">Arena\'ya dön</button></div>';
    if (c && c.done) h += '<div class="panel xres"><div class="row" style="gap:24px"><div class="ring ' + (c.score ? 'ok' : 'bad') + '"><b class="num">' + c.score + '</b><span>puan</span></div><div class="grow"><h2>Set bitti</h2><p class="muted">Çözemediğin problemler Arena\'da seni bekliyor; çözümleri artık açabilirsin.</p><div class="lessons panel">' + c.ids.map(id => { const a = AMAP[id]; return a ? '<button class="litem" data-go="arena-p" data-id="' + id + '"><span class="check ' + ((c.best[id] || 0) >= 1 ? 'done' : 'new') + '">' + ((c.best[id] || 0) >= 1 ? '✓' : '') + '</span><div><b>' + esc(a.title) + '</b><small>' + a.diff + ' · %' + Math.round(100 * (c.best[id] || 0)) + ' test</small></div><div class="meta"><small>' + Math.round(PTS(a) * (c.best[id] || 0)) + '/' + PTS(a) + '</small></div></button>' : ''; }).join('') + '</div></div></div></div>';
    h += '<div class="panel lvcard"><h3>Yeni zamanlı set</h3><ul><li>4 problem: 1 kolay, 2 orta, 1 zor (önce çözmediklerin seçilir).</li><li>75 dakika; istediğin sırayla çöz, istediğin kadar gönder.</li><li>Puan: her problemde en iyi gönderimin geçen test oranı × problem puanı.</li><li>Set boyunca çözümler kapalı.</li></ul><button class="btn pri" data-act="c-start">Başlat</button></div>';
    if (P.conts.length) h += '<section class="lvl-block"><div class="sec-head"><h2>Geçmiş</h2></div><div class="panel"><table class="ttab"><tr><th>Tarih</th><th>Puan</th></tr>' + P.conts.slice().reverse().map(x => '<tr><td>' + esc(x.d) + '</td><td class="num">' + x.score + '/' + x.max + '</td></tr>').join('') + '</table></div></section>';
    return h;
  }
  return contestBar() + '<div class="sec-head"><h1>Set problemleri</h1><button class="btn sm ghost" data-act="c-end">Seti bitir</button></div><div class="panel lessons">' + c.ids.map((id, i) => { const a = AMAP[id]; return a ? '<button class="litem" data-go="arena-p" data-id="' + id + '"><span class="check ' + ((c.best[id] || 0) >= 1 ? 'done' : (c.best[id] ? 'part' : 'new')) + '">' + String.fromCharCode(65 + i) + '</span><div><b>' + esc(a.title) + '</b><small>' + esc(a.track) + '</small></div><div class="meta"><span class="dchip ' + DCLS[a.diff] + '">' + a.diff + '</span><small>' + Math.round(PTS(a) * (c.best[id] || 0)) + '/' + PTS(a) + '</small></div></button>' : ''; }).join('') + '</div>';
}, mount(m) {
  if (P.cont && !P.cont.done) tickContest();
  m.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'c-start') { P.cont = { t0: Date.now(), min: 75, ids: pickContest(), best: {}, done: false }; save(); render(); } if (b.dataset.act === 'c-end' && confirm('Set bitirilsin mi?')) finishContest(); });
} };

/* ================= MÜLAKAT MERKEZİ ================= */
const ROLES = [['genel', 'Python (genel)'], ['analist', 'Veri Analisti'], ['bilimci', 'Veri Bilimci'], ['ml', 'ML Mühendisi'], ['muhendis', 'Veri Mühendisi'], ['backend', 'Backend'], ['web', 'Web'], ['ai', 'Yapay Zekâ'], ['otomasyon', 'Otomasyon']];
const KINDS = { kavram: 'Kavram', 'kod-okuma': 'Kod okuma', tasarim: 'Python ile tasarım', vaka: 'Vaka' };
const IF = { role: 'all', lv: 'all', kind: 'all', st: 'all', q: '' };
const ivState = id => (P.iv[id] || {}).r;
/* Soru metinleri kendi içeriğimiz: <code>/<b> gibi biçim etiketi varsa HTML olarak bas, yoksa kaçışla */
const qh = s => /<\/?(code|b|i|em|strong|br|pre|kbd)\b/.test(String(s || '')) ? String(s) : esc(s);   // 2 bildim, 1 kısmen, 0 bilemedim
function ivCard(q, open) {
  const st = ivState(q.id);
  return '<details class="panel ivq"' + (open ? ' open' : '') + ' data-iv="' + q.id + '"><summary><div><span class="eyebrow">' + esc(KINDS[q.kind] || 'Soru') + ' · ' + esc(q.topic || '') + '</span><b>' + qh(q.q) + '</b></div><span class="ivst s' + (st == null ? 'n' : st) + '">' + (st === 2 ? 'Bildim' : st === 1 ? 'Kısmen' : st === 0 ? 'Tekrar' : '') + '</span></summary><div class="fa">' +
    (q.code ? codebox(q.code, { label: 'kod' }) : '') + '<div class="ivans">' + q.a + (q.out ? '<p><b>Çıktı:</b> <code>' + esc(q.out) + '</code></p>' : '') + '</div>' +
    (q.follow && q.follow.length ? '<div class="note"><b>Olası takip soruları</b><ul>' + q.follow.map(f => '<li>' + qh(f) + '</li>').join('') + '</ul></div>' : '') +
    (q.flags && q.flags.length ? '<div class="warn"><b>Zayıf cevap işaretleri</b><ul>' + q.flags.map(f => '<li>' + qh(f) + '</li>').join('') + '</ul></div>' : '') +
    (q.tip ? '<div class="tip"><b>İpucu</b>' + esc(q.tip) + '</div>' : '') +
    '<div class="row ivrate"><span class="muted" style="font-size:.85rem">Bu soruyu nasıl cevapladın?</span><button class="btn sm" data-r="2">Bildim</button><button class="btn sm" data-r="1">Kısmen</button><button class="btn sm" data-r="0">Bilemedim</button></div></div></details>';
}
function rateIv(id, r) { P.iv[id] = { r, d: today(), n: ((P.iv[id] || {}).n || 0) + 1 }; save(); }
function ivFilter() { return IV.filter(q => (IF.role === 'all' || (q.roles || []).includes(IF.role)) && (IF.lv === 'all' || q.lv === IF.lv) && (IF.kind === 'all' || q.kind === IF.kind) && (IF.st === 'all' || (IF.st === 'tekrar' ? ivState(q.id) != null && ivState(q.id) < 2 : IF.st === 'yeni' ? ivState(q.id) == null : ivState(q.id) === 2)) && (!IF.q || (q.q + ' ' + q.topic).toLocaleLowerCase('tr').includes(IF.q.toLocaleLowerCase('tr')))); }
VIEWS.interview = { html() {
  const tab = V.id || 'bank'; const list = ivFilter();
  const done = IV.filter(q => ivState(q.id) === 2).length;
  const fb = (name, opts, cur) => '<div class="filters" data-if="' + name + '">' + opts.map(([k, t]) => '<button type="button" data-v="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(t) + '</button>').join('') + '</div>';
  let h = '<div class="sec-head"><div><h1>Mülakat</h1></div><div class="filters">' + [['bank', 'Soru bankası'], ['kart', 'Kart modu'], ['sim', 'Simülasyon']].map(([k, t]) => '<button type="button" data-go="' + (k === 'sim' ? 'interview-sim' : 'interview') + '" data-id="' + (k === 'sim' ? '' : k) + '" aria-pressed="' + (tab === k) + '">' + t + '</button>').join('') + '</div></div>';
  h += '<p class="muted" style="margin:0;max-width:75ch">' + IV.length + ' Python sorusu, role göre: Python dili ve OOP, pandas/numpy ile veri, scikit-learn ile ML, veri hatları, Flask/FastAPI/Django, Python ile yapay zekâ ve otomasyon. Her soruda model cevap, takip soruları ve "zayıf cevap" işaretleri var. Kendini puanla; "Bilemedim" dediklerin kart modunda öne gelir. Kodlama turu için Python Arena\'yı kullan.</p>';
  h += '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + IV.length + '</b><span>soru</span></div><div class="panel kpi"><b class="num">' + done + '</b><span>bildim</span></div><div class="panel kpi"><b class="num">' + IV.filter(q => ivState(q.id) != null && ivState(q.id) < 2).length + '</b><span>tekrar edilecek</span></div><div class="panel kpi"><b class="num">' + P.sims.length + '</b><span>simülasyon</span></div></div>';
  h += '<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px">' + fb('role', [['all', 'Tüm roller']].concat(ROLES.map(([k, t]) => [k, t + ' (' + IV.filter(q => (q.roles || []).includes(k)).length + ')'])), IF.role) + '<div class="row">' + fb('lv', [['all', 'Her seviye'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']], IF.lv) + fb('kind', [['all', 'Her tür']].concat(Object.entries(KINDS)), IF.kind) + fb('st', [['all', 'Hepsi'], ['yeni', 'Görülmemiş'], ['tekrar', 'Tekrar'], ['bildim', 'Bildim']], IF.st) + '</div><input class="input" data-if="q" placeholder="Ara" value="' + esc(IF.q) + '"></div>';
  if (tab === 'kart') {
    const pool = list.slice().sort((x, y) => { const a = ivState(x.id), b = ivState(y.id); const w = s => s == null ? 1 : s === 0 ? 0 : s === 1 ? 2 : 3; return w(a) - w(b) || hashStr(x.id + today()) - hashStr(y.id + today()); });
    const q = pool[0];
    return h + (q ? '<div class="flash">' + ivCard(q, false) + '<p class="muted" style="font-size:.84rem">Önce cevabını sesli ya da yazılı söyle, sonra kartı açıp model cevapla karşılaştır. ' + pool.length + ' kart kaldı (bu filtrede).</p></div>' : '<p class="muted">Bu filtrede kart yok.</p>');
  }
  return h + '<div class="ivlist">' + list.slice(0, 200).map(q => ivCard(q, false)).join('') + (list.length > 200 ? '<p class="muted">İlk 200 soru gösteriliyor; filtreyi daralt.</p>' : '') + '</div>';
}, mount(m) {
  m.addEventListener('click', ev => {
    const f = ev.target.closest('[data-if] button'); if (f) { IF[f.closest('[data-if]').dataset.if] = f.dataset.v; render(); return; }
    const b = ev.target.closest('.ivrate button'); if (b) { const id = b.closest('[data-iv]').dataset.iv; rateIv(id, +b.dataset.r); if ((V.id || 'bank') === 'kart') render(); else { const s = b.closest('[data-iv]').querySelector('.ivst'); s.className = 'ivst s' + b.dataset.r; s.textContent = ['Tekrar', 'Kısmen', 'Bildim'][+b.dataset.r]; toast('Kaydedildi'); } }
  });
  const q = $('input[data-if="q"]', m); if (q) q.addEventListener('input', () => { IF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('input[data-if="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 350); });
} };
const ivRole = pid => pid === 'sertifika' ? 'genel' : pid;
C.C_LINKS.counts = pid => ({ iv: IV.filter(q => q.roles.includes(ivRole(pid))).length, ar: ARENA.filter(a => (ROLE_TRACKS[pid] || []).includes(a.track)).length });
C.C_LINKS.iv = pid => { IF.role = ivRole(pid); IF.lv = IF.kind = IF.st = 'all'; IF.q = ''; go('interview'); };
C.C_LINKS.ar = pid => { AF.role = pid; AF.track = AF.diff = AF.st = 'all'; AF.q = ''; go('arena'); };
/* Mülakat simülasyonu */
const SIM = { s: null };
VIEWS['interview-sim'] = { html() {
  const s = SIM.s;
  let h = '<div class="sec-head"><div><span class="eyebrow">Mülakat</span><h1>Mülakat simülasyonu</h1></div><button class="btn sm ghost" data-go="interview">Soru bankası</button></div>';
  if (!s) {
    h += '<div class="panel lvcard"><p style="margin:0">Python teknik mülakatının akışı: önce seçtiğin role göre 8 Python sorusu (kavram, kod okuma, tasarım) (her birine cevabını yaz, sonra model cevabı aç ve kendini puanla), ardından bir kodlama problemi. Toplam 45 dakika.</p><h3>Rolünü seç</h3><div class="filters" data-simrole>' + ROLES.map(([k, t]) => '<button type="button" data-v="' + k + '">' + t + '</button>').join('') + '</div><h3>Seviye</h3><div class="filters" data-simlv>' + [['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']].map(([k, t], i) => '<button type="button" data-v="' + k + '" aria-pressed="' + (i === 1) + '">' + t + '</button>').join('') + '</div></div>';
    if (P.sims.length) h += '<section class="lvl-block"><div class="sec-head"><h2>Geçmiş</h2></div><div class="panel"><table class="ttab"><tr><th>Tarih</th><th>Rol</th><th>Kavram</th><th>Kodlama</th></tr>' + P.sims.slice().reverse().map(x => '<tr><td>' + esc(x.d) + '</td><td>' + esc((ROLES.find(r => r[0] === x.role) || [, x.role])[1]) + '</td><td class="num">%' + x.qp + '</td><td class="num">' + (x.cp == null ? '–' : '%' + x.cp) + '</td></tr>').join('') + '</table></div></section>';
    return h;
  }
  const left = Math.max(0, 45 * 60 - Math.floor((Date.now() - s.t0) / 1000));
  h += '<div class="xbar"><div class="row"><b>' + esc((ROLES.find(r => r[0] === s.role) || [, ''])[1]) + '</b><span class="muted">Adım ' + (s.i + 1) + '/' + (s.qs.length + 1) + '</span></div><div class="row"><span class="chip timer" id="stimer">' + String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0') + '</span><button class="btn sm" data-act="s-end">Bitir</button></div></div>';
  if (s.done) {
    const rs = s.qs.map(id => s.r[id]); const qp = Math.round(100 * rs.reduce((a, x) => a + (x || 0), 0) / (2 * s.qs.length));
    return h + '<div class="panel xres"><h2>Değerlendirme</h2><p>Kavram soruları: <b>%' + qp + '</b> · Kodlama: <b>' + (s.cp == null ? 'denenmedi' : '%' + s.cp) + '</b></p><p class="muted">' + (qp >= 75 ? 'Güçlü bir tur. Takip sorularını da çalışarak derinleş.' : qp >= 45 ? 'Temel iyi; "Kısmen" dediğin konuları kart modunda tekrar et.' : 'Bu rol için temel konuları ders ve soru bankasıyla tekrar et.') + '</p><div class="ivlist">' + s.qs.map(id => IVMAP[id] ? ivCard(IVMAP[id], false) : '').join('') + '</div><div class="row"><button class="btn pri" data-act="s-new">Yeni simülasyon</button></div></div>';
  }
  if (s.i < s.qs.length) {
    const q = IVMAP[s.qs[s.i]];
    return h + '<div class="panel brief"><span class="eyebrow">Soru ' + (s.i + 1) + ' · ' + esc(KINDS[q.kind] || '') + ' · ' + esc(q.topic || '') + '</span><h2 style="margin:6px 0">' + qh(q.q) + '</h2>' + (q.code ? codebox(q.code, { run: false, label: 'kod' }) : '') + '<textarea class="input" rows="5" data-sima placeholder="Cevabını kendi cümlelerinle yaz (mülakatta söyleyeceğin gibi)">' + esc(s.ans[q.id] || '') + '</textarea>' + (s.show ? '<div class="ivans panel" style="padding:12px">' + q.a + (q.out ? '<p><b>Çıktı:</b> <code>' + esc(q.out) + '</code></p>' : '') + (q.flags ? '<div class="warn"><b>Zayıf cevap işaretleri</b><ul>' + q.flags.map(f => '<li>' + qh(f) + '</li>').join('') + '</ul></div>' : '') + '</div><div class="row"><span class="muted">Kendini puanla:</span><button class="btn sm" data-sr="2">Bildim</button><button class="btn sm" data-sr="1">Kısmen</button><button class="btn sm" data-sr="0">Bilemedim</button></div>' : '<div class="row"><button class="btn pri" data-act="s-show">Model cevabı göster</button></div>') + '</div>';
  }
  const a = AMAP[s.prob];
  return h + '<div class="panel lvcard"><span class="eyebrow">Kodlama turu</span><h2>' + (a ? esc(a.title) : 'Problem yok') + '</h2><p class="muted">Problemi Python Arena\'da aç, çöz ve gönder; sonra buraya dönüp simülasyonu bitir. Simülasyon puanı problemdeki en iyi test oranından alınır.</p><div class="row">' + (a ? '<button class="btn pri" data-go="arena-p" data-id="' + a.id + '">Problemi aç</button>' : '') + '<button class="btn" data-act="s-end">Simülasyonu bitir</button></div></div>';
}, mount(m) {
  clearInterval(SIM.t); if (SIM.s && !SIM.s.done) SIM.t = setInterval(() => { const el = $('#stimer'); if (!el) return; const left = Math.max(0, 45 * 60 - Math.floor((Date.now() - SIM.s.t0) / 1000)); el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); el.classList.toggle('warn', left < 300); if (!left) end(); }, 1000);
  const end = () => { const s = SIM.s; if (!s || s.done) return; s.done = true; const a = AMAP[s.prob]; s.cp = a && P.ar[a.id] && P.ar[a.id].best != null ? Math.round(100 * P.ar[a.id].best) : null; const qp = Math.round(100 * s.qs.reduce((x, id) => x + (s.r[id] || 0), 0) / (2 * s.qs.length)); P.sims = P.sims.concat([{ d: today(), role: s.role, qp, cp: s.cp }]).slice(-30); addXP(25); save(); render(); };
  m.addEventListener('click', ev => {
    const rb = ev.target.closest('[data-simrole] button'); if (rb) { const lv = ($('[data-simlv] [aria-pressed="true"]', m) || {}).dataset ? $('[data-simlv] [aria-pressed="true"]', m).dataset.v : 'orta'; startSim(rb.dataset.v, lv); return; }
    const lb = ev.target.closest('[data-simlv] button'); if (lb) { $$('[data-simlv] button', m).forEach(x => x.setAttribute('aria-pressed', x === lb)); return; }
    const sr = ev.target.closest('[data-sr]'); if (sr) { const s = SIM.s; const id = s.qs[s.i]; s.r[id] = +sr.dataset.sr; rateIv(id, +sr.dataset.sr); s.i++; s.show = false; render(); return; }
    const b = ev.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 's-show') { const ta = $('[data-sima]', m); SIM.s.ans[SIM.s.qs[SIM.s.i]] = ta.value; SIM.s.show = true; render(); }
    if (b.dataset.act === 's-end') end();
    if (b.dataset.act === 's-new') { SIM.s = null; render(); }
  });
} };
function startSim(role, lv) {
  const order = { temel: 0, orta: 1, ileri: 2 };
  let pool = IV.filter(q => (q.roles || []).includes(role) && q.kind !== 'davranissal');
  pool.sort((x, y) => Math.abs(order[x.lv] - order[lv]) - Math.abs(order[y.lv] - order[lv]) || hashStr(x.id + Date.now()) - hashStr(y.id + Date.now()));
  const qs = pool.slice(0, 8).map(q => q.id);
  const dataRole = ['analist', 'bilimci', 'ml', 'muhendis'].includes(role);
  const probs = ARENA.filter(a => a.diff === (lv === 'temel' ? 'Kolay' : lv === 'ileri' ? 'Zor' : 'Orta') && (dataRole ? /Veri|pandas|SQL|numpy/.test(a.track) : !/Veri|pandas|SQL|numpy/.test(a.track)));
  const prob = probs.length ? probs[Date.now() % probs.length].id : null;
  SIM.s = { role, lv, qs, prob, i: 0, r: {}, ans: {}, t0: Date.now(), show: false, done: false };
  render();
}


/* ================= PYTHON İLE YAPAY ZEKÂ ================= */
function aiSets() { const L = C.LESSONS; return { llm: L.filter(l => l.mod === 'Yapay Zekâ' || l.id === 'proje-ai'), ml: L.filter(l => l.mod === 'Makine öğrenmesi' || ['ml-giris', 'mlops-yasam-dongusu', 'proje-ml'].includes(l.id)) }; }
VIEWS.ai = { html() {
  const L = C.LESSONS, row = C.lessonRow;
  const { llm, ml } = aiSets();
  const hazir = ['numpy', 'pandas-giris', 'pydantic-dogrulama', 'http-api', 'async', 'fastapi'].map(id => L.find(l => l.id === id)).filter(Boolean);
  const exN = ls => ls.reduce((a, l) => a + (l.ex || []).length, 0);
  const done = ls => ls.filter(l => C.lessonState(l) === 'done').length;
  const ivAi = IV.filter(q => q.roles.includes('ai')), ivMl = IV.filter(q => q.roles.includes('ml'));
  const tasks = C.BANK.filter(t => /scikit|NLP|numpy/.test(t.topic));
  const sec = (t, d, ls) => '<section class="lvl-block"><div class="sec-head"><div><h2>' + t + '</h2><p class="muted" style="margin:2px 0 0">' + d + ' · ' + done(ls) + '/' + ls.length + ' ders tamam · ' + exN(ls) + ' alıştırma</p></div></div><div class="panel lessons">' + ls.map(row).join('') + '</div></section>';
  let h = '<div class="sec-head"><div><h1>Yapay Zekâ</h1></div><div class="row"><button class="btn pri sm" data-go="path" data-id="ai">Öğrenme yolunu aç</button><button class="btn sm" data-go="exam" data-id="patika-ai">Yol sınavı</button></div></div>';
  h += '<p class="muted" style="margin:0;max-width:75ch">Python\'dan LLM API\'lerini çağırmak, prompt (istem) tasarlamak ve çıktıyı pydantic ile doğrulamak, embedding ile anlamsal arama ve RAG kurmak, araç kullanan ajanlar yazmak, LLM uygulamasını test etmek ve yerel modellerle çalışmak. Alıştırmalar tarayıcıda gerçek Python ile çalışır; ücretli API yerine aynı arayüzü taklit eden sahte istemciler kullanılır, gerçek SDK kodu her derste "Kendi bilgisayarında dene" olarak verilir.</p>';
  h += '<div class="kpis kpis4"><div class="panel kpi"><b class="num">' + (llm.length + ml.length) + '</b><span>ders</span></div><div class="panel kpi"><b class="num">' + (exN(llm) + exN(ml)) + '</b><span>alıştırma</span></div><div class="panel kpi"><b class="num">' + ivAi.length + '</b><span>yapay zekâ mülakat sorusu</span></div><div class="panel kpi"><b class="num">' + ivMl.length + '</b><span>ML mülakat sorusu</span></div></div>';
  h += sec('LLM ve üretken yapay zekâ', 'API, prompt, RAG, ajanlar, değerlendirme, yerel modeller', llm);
  h += sec('Makine öğrenmesi ve derin öğrenme', 'scikit-learn, özellik mühendisliği, NLP, sinir ağları, MLOps', ml);
  h += sec('Önce bunlar', 'Yapay zekâ derslerinin dayandığı Python temelleri', hazir);
  h += '<section class="lvl-block"><div class="sec-head"><h2>Mülakata hazırlan</h2></div><div class="paths">' +
    '<button type="button" class="panel pcard" data-act="ai-iv" data-role="ai"><div class="row"><span class="ic navic">?</span><b>Yapay zekâ mülakat soruları</b></div><p>Python ile LLM, RAG, ajan ve değerlendirme soruları; model cevap ve takip soruları.</p><div class="foot"><span>' + ivAi.length + ' soru</span><span>' + ivAi.filter(q => ivState(q.id) === 2).length + ' bildim</span></div></button>' +
    '<button type="button" class="panel pcard" data-act="ai-iv" data-role="ml"><div class="row"><span class="ic navic">?</span><b>ML mülakat soruları</b></div><p>scikit-learn, sızıntı, değerlendirme, numpy/pandas ile model kodu.</p><div class="foot"><span>' + ivMl.length + ' soru</span><span>' + ivMl.filter(q => ivState(q.id) === 2).length + ' bildim</span></div></button>' +
    '<button type="button" class="panel pcard" data-act="ai-sim"><div class="row"><span class="ic navic">▶</span><b>Yapay zekâ mülakat simülasyonu</b></div><p>Yapay zekâ rolü için 8 Python sorusu ve bir kodlama problemi, 45 dakika.</p><div class="foot"><span>Rol: Yapay Zekâ</span><span></span></div></button>' +
    '</div></section>';
  if (tasks.length) h += '<section class="lvl-block"><div class="sec-head"><h2>Pratik görevleri</h2></div><div class="panel lessons">' + tasks.map(t => '<button type="button" class="litem" data-go="task" data-id="' + t.id + '"><span class="check ' + (P.ex['bank#' + t.id] ? 'done' : 'new') + '"></span><div><b>' + esc(t.title) + '</b><small>' + esc(t.topic) + '</small></div><div class="meta">' + lvBadge(t.lv) + '</div></button>').join('') + '</div></section>';
  return h;
}, mount(m) {
  m.addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'ai-iv') { IF.role = b.dataset.role; IF.lv = IF.kind = IF.st = 'all'; IF.q = ''; go('interview'); }
    if (b.dataset.act === 'ai-sim') { go('interview-sim'); setTimeout(() => startSim('ai', 'orta'), 0); }
  });
} };

/* ================= SIK HATALAR ================= */
const MF = { topic: 'all', lv: 'all', q: '', src: 'all' };
function allMistakes() {
  const own = MS.map(m => Object.assign({ src: 'katalog' }, m));
  const fromLessons = []; C.LESSONS.forEach(l => (l.mistakes || []).forEach((m, i) => fromLessons.push({ id: l.id + '-m' + i, topic: l.title, lv: l.lv, title: m.why.split(/[.;:]/)[0].slice(0, 90), bad: m.bad, good: m.good, why: m.why, src: 'ders', lesson: l.id })));
  return own.concat(fromLessons);
}
let MCACHE = null;
VIEWS.mistakes = { html() {
  const all = MCACHE || (MCACHE = allMistakes());
  const topics = Array.from(new Set(all.filter(m => m.src === 'katalog').map(m => m.topic)));
  const list = all.filter(m => (MF.src === 'all' || m.src === MF.src) && (MF.topic === 'all' || m.topic === MF.topic) && (MF.lv === 'all' || C.LESSONS && (m.lv === MF.lv || String(m.lv).startsWith(MF.lv))) && (!MF.q || (m.title + ' ' + m.why + ' ' + m.topic).toLocaleLowerCase('tr').includes(MF.q.toLocaleLowerCase('tr'))));
  const fb = (name, opts, cur) => '<div class="filters" data-mf="' + name + '">' + opts.map(([k, t]) => '<button type="button" data-v="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(t) + '</button>').join('') + '</div>';
  let h = '<div class="sec-head"><div><h1>Sık hatalar</h1></div><span class="chip">' + all.length + ' kayıt</span></div><p class="muted" style="margin:0;max-width:75ch">Her kartta hatalı kod, gerçekte ne olduğu, doğru kod ve akılda kalacak kural var. Kodları çalıştırıp farkı kendin gör. Katalog kayıtlarına ek olarak tüm derslerin "sık hata" bölümleri de burada toplanır.</p>';
  h += '<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px">' + fb('src', [['all', 'Hepsi'], ['katalog', 'Katalog (' + all.filter(m => m.src === 'katalog').length + ')'], ['ders', 'Derslerden (' + all.filter(m => m.src === 'ders').length + ')']], MF.src) + fb('lv', [['all', 'Her seviye'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']], MF.lv) + (topics.length ? fb('topic', [['all', 'Tüm konular']].concat(topics.map(t => [t, t])), MF.topic) : '') + '<input class="input" data-mf="q" placeholder="Ara: hata, konu" value="' + esc(MF.q) + '"></div>';
  h += '<div class="mlist">' + list.slice(0, 120).map(m => '<details class="panel mcard"><summary><div><span class="eyebrow">' + esc(m.topic || '') + (m.src === 'ders' ? ' · ders' : '') + '</span><b>' + esc(m.title) + '</b></div>' + (m.lv ? lvBadge(m.lv) : '') + '</summary><div class="fa"><div class="cmp2"><div><span class="eyebrow bad">Hatalı</span>' + codebox(m.bad, { label: 'hatalı' }) + (m.bad_out ? '<pre class="outbox">' + esc(m.bad_out) + '</pre>' : m.bad_err ? '<pre class="outbox stderr">' + esc(m.bad_err) + '</pre>' : '') + '</div><div><span class="eyebrow good">Doğru</span>' + codebox(m.good, { label: 'doğru' }) + (m.good_out ? '<pre class="outbox">' + esc(m.good_out) + '</pre>' : '') + '</div></div><p>' + esc(m.why) + '</p>' + (m.rule ? '<div class="tip"><b>Kural</b>' + esc(m.rule) + '</div>' : '') + (m.lesson ? '<button class="btn sm ghost" data-go="lesson" data-id="' + m.lesson + '">Derse git</button>' : '') + '</div></details>').join('') + (list.length > 120 ? '<p class="muted">İlk 120 kayıt gösteriliyor; filtreyi daralt.</p>' : '') + '</div>';
  return h;
}, mount(m) {
  m.addEventListener('click', ev => { const f = ev.target.closest('[data-mf] button'); if (f) { MF[f.closest('[data-mf]').dataset.mf] = f.dataset.v; if (f.closest('[data-mf]').dataset.mf === 'src') MF.topic = 'all'; render(); } });
  const q = $('input[data-mf="q"]', m); if (q) q.addEventListener('input', () => { MF.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { const pos = q.selectionStart; render(); const nq = $('input[data-mf="q"]'); nq.focus(); nq.setSelectionRange(pos, pos); }, 350); });
} };

/* ================= VERİ SETLERİ ================= */
let DMAN = null;
function loadMan() { return DMAN ? Promise.resolve(DMAN) : fetch('data/manifest.json').then(r => r.json()).then(j => (DMAN = j.datasets)); }
function parseCSV(txt, max) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) { const ch = txt[i];
    if (q) { if (ch === '"') { if (txt[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; if (rows.length > max) break; } else if (ch !== '\r') cell += ch; }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const snippet = (k, t, cols) => '# Saf Python (pandas gerekmez)\nimport veri\nkayitlar = veri.kayitlar("' + k + '", "' + t + '")\nprint(len(kayitlar), "satır")\nprint(kayitlar[0])\n\n# pandas ile\ndf = veri.oku("' + k + '", "' + t + '")\nprint(df.head())\nprint(df.describe(include="all").T.head(' + Math.min(cols, 12) + '))\n';
const sqlSnippet = (k, t) => 'import veri\ncon = veri.baglan("' + k + '")\nfor satir in con.execute(\'SELECT * FROM "' + t + '" LIMIT 5\'):\n    print(satir)\n';
const DOMAIN = { anadolu_market: 'E-ticaret', ilgaz_bank: 'Banka', pusula_ik: 'İK', lezzet_kurye: 'Yemek teslimatı', kanat_havayollari: 'Havayolu', pedal_izmir: 'Bisiklet paylaşımı', kesit_bi: 'E-ticaret, yıldız şema', kirli_veri: 'Veri temizliği' };
function sinirHTML(keys, man) {
  const S = window.KESIT_SINIRLAR || {}; const ln = x => Array.isArray(x) ? x : x ? [x] : [];
  return '<section class="lvl-block" id="sinirlar"><div class="sec-head"><h2>Bilerek bırakılanlar ve bilinen sınırlamalar</h2></div><p class="muted" style="margin:0 0 8px;max-width:75ch">Veride tuhaf bir şey görürsen önce buraya bak: bazı hatalar temizlik pratiği için bilerek bırakılır, bazıları bilinen sınırlamadır.</p><div class="panel" style="padding:4px 14px">' + keys.map(k => { const e = S[k]; const items = e && typeof e === 'object' && !Array.isArray(e) ? ['bilerek', 'sinir'].flatMap(t => ln(e[t]).map(x => [t === 'bilerek' ? 'Bilerek: ' : 'Sınırlama: ', x])) : ln(e).map(x => ['', x]); return '<div class="drow"><b>' + esc((man[k] || {}).name || k) + '</b><span>' + (items.length ? '<ul style="margin:0;padding-left:18px">' + items.map(([p, x]) => '<li>' + esc(p + x) + '</li>').join('') + '</ul>' : '<span class="muted">Bu set için henüz not yok.</span>') + '</span></div>'; }).join('') + '</div></section>';
}
VIEWS.data = { html() {
  return '<div class="sec-head"><div><h1>Veri setleri</h1></div></div><p class="muted" style="margin:0;max-width:75ch">Python ile çalışacağın 8 veri seti, tamamı kurgusal. Banka, İK, teslimat, havayolu ve bisiklet setleri Kesit SQL ve Kesit Power BI ile aynıdır. Anadolu Market\'te aynı şirket ve siparişler kullanılır; Power BI modeli zenginleştirilmiştir. Kodda <code>import veri</code> yazıp veri setinin adını kullanman yeterli; dosyalar tarayıcıya otomatik iner.</p><div id="dsl" class="paths"><p class="muted">Yükleniyor…</p></div><div id="dsr"></div>' +
    '<section class="lvl-block"><div class="sec-head"><h2>veri modülü</h2></div>' + codebox('import veri\nveri.liste()                                   # veri setleri\nveri.tablolar("anadolu_market")                # tablolar ve sütunlar\nk = veri.kayitlar("ilgaz_bank", "bank_accounts")  # sözlük listesi (pandas gerekmez)\ndf = veri.oku("anadolu_market", "orders")      # pandas DataFrame\ncon = veri.baglan("kanat_havayollari")         # bellek içi SQLite: SQL + Python\nprint(con.execute("SELECT COUNT(*) FROM hv_flights").fetchone())\n', { label: 'veri modülü' }) + '</section>';
}, mount(m) {
  loadMan().then(man => { const el = $('#dsl', m); if (!el) return; el.innerHTML = Object.entries(man).map(([k, d]) => { const n = Object.values(d.tables).reduce((a, t) => a + t.rows, 0); const tasks = C.BANK.filter(t => t.ds === k).length; return '<button type="button" class="panel pcard" data-go="dataset" data-id="' + k + '"><div class="row" style="justify-content:space-between"><b>' + esc(d.name) + '</b><span class="chip">' + esc(DOMAIN[k] || '') + '</span></div><p>' + esc(d.desc) + '</p><div class="foot"><span>' + Object.keys(d.tables).length + ' tablo · ' + n.toLocaleString('tr-TR') + ' satır</span><span>' + (tasks ? tasks + ' görev' : '') + '</span></div></button>'; }).join(''); const sr = $('#dsr', m); if (sr) sr.innerHTML = sinirHTML(Object.keys(man), man); }).catch(() => { const el = $('#dsl', m); if (el) el.innerHTML = '<p class="muted">Veri seti listesi yüklenemedi.</p>'; });
} };
VIEWS.dataset = { html() {
  return '<div class="lhead"><div class="crumbs"><button data-go="data">Veri setleri</button> › <span>' + esc(V.id || '') + '</span></div><div id="dsv"><p class="muted">Yükleniyor…</p></div></div>';
}, mount(m) {
  loadMan().then(man => {
    const k = V.id, d = man[k], el = $('#dsv', m); if (!d) { el.innerHTML = '<p>Veri seti bulunamadı.</p>'; return; }
    const tasks = C.BANK.filter(t => t.ds === k); const arena = ARENA.filter(a => (a.sol || '').includes(k));
    let h = '<div class="row" style="justify-content:space-between"><h1>' + esc(d.name) + '</h1><span class="chip">' + esc(DOMAIN[k] || d.source) + '</span></div><p class="muted">' + esc(d.desc) + '</p>';
    if (tasks.length || arena.length) h += '<div class="panel lvcard"><b>Bu veriyle pratik</b><div class="row">' + (tasks.length ? '<button class="btn sm" data-dsp="' + k + '">' + tasks.length + ' pratik görevi</button>' : '') + arena.slice(0, 6).map(a => '<button class="btn sm ghost" data-go="arena-p" data-id="' + a.id + '">' + esc(a.title) + '</button>').join('') + '</div></div>';
    if (d.rels && d.rels.length) h += '<details class="panel" style="padding:12px 14px"><summary><b>İlişkiler (yıldız şema)</b></summary><table class="ttab">' + d.rels.map(r => '<tr><td>' + esc(r.from) + '[' + esc(r.fromCol) + ']</td><td>→</td><td>' + esc(r.to) + '[' + esc(r.toCol) + ']</td></tr>').join('') + '</table></details>';
    h += sinirHTML([k], man);
    h += Object.entries(d.tables).map(([t, info]) => '<details class="panel dtab" data-t="' + esc(t) + '"><summary><div><b>' + esc(t) + '</b><small class="muted"> · ' + info.rows.toLocaleString('tr-TR') + ' satır · ' + info.cols.length + ' sütun · ' + (info.bytes / 1e6 >= 0.1 ? (info.bytes / 1e6).toFixed(1) + ' MB' : Math.round(info.bytes / 1e3) + ' KB') + '</small></div></summary><div class="fa">' + (info.note ? '<p class="muted">' + esc(info.note) + '</p>' : '') + '<div class="tbl-wrap"><table class="ttab"><tr><th>Sütun</th>' + (info.cols.some(c => c[1] || c[2]) ? '<th>Tür</th><th>Açıklama</th>' : '') + '</tr>' + info.cols.map(c => '<tr><td><code>' + esc(c[0]) + '</code>' + (c[3] === 'pk' ? ' <span class="chip">PK</span>' : c[3] && c[3].startsWith('fk:') ? ' <span class="chip">→ ' + esc(c[3].slice(3)) + '</span>' : '') + '</td>' + (info.cols.some(x => x[1] || x[2]) ? '<td class="muted">' + esc(c[1] || '') + '</td><td>' + esc(c[2] || '') + '</td>' : '') + '</tr>').join('') + '</table></div><div class="row"><button class="btn sm" data-prev="' + esc(t) + '">İlk 12 satırı önizle</button><button class="btn sm ghost" data-play="' + esc(t) + '">Kod editöründe aç</button><button class="btn sm ghost" data-playsql="' + esc(t) + '">SQL ile aç</button></div><div class="prev"></div></div></details>').join('');
    el.innerHTML = h;
    el.addEventListener('click', async ev => {
      const pv = ev.target.closest('[data-prev]'); const pl = ev.target.closest('[data-play]'); const ps = ev.target.closest('[data-playsql]'); const dp = ev.target.closest('[data-dsp]');
      if (dp) { window.PY_PF && window.PY_PF(tasks[0].topic); go('practice'); return; }
      if (pl || ps) { const t = (pl || ps).dataset.play || (pl || ps).dataset.playsql; P.pg = P.pg && typeof P.pg === 'object' ? P.pg : {}; P.pg.__play = ps ? sqlSnippet(k, t) : snippet(k, t, d.tables[t].cols.length); save(); go('play'); return; }
      if (pv) { const t = pv.dataset.prev, box = pv.closest('.fa').querySelector('.prev'); box.innerHTML = '<p class="muted">Yükleniyor…</p>'; try { const r = await fetch('data/' + k + '/' + t + '.csv'); const reader = r.body && r.body.getReader ? r.body.getReader() : null; let txt = ''; if (reader) { const dec = new TextDecoder(); while (txt.split('\n').length < 15) { const { done, value } = await reader.read(); if (done) break; txt += dec.decode(value, { stream: true }); } reader.cancel(); } else txt = (await r.text()).slice(0, 20000); const rows = parseCSV(txt, 12); box.innerHTML = '<div class="preview"><table><tr>' + rows[0].map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>' + rows.slice(1, 13).map(rw => '<tr>' + rw.map(c => '<td>' + (c === '' ? '<span class="muted">boş</span>' : esc(c)) + '</td>').join('') + '</tr>').join('') + '</table></div>'; } catch (e) { box.innerHTML = '<p class="muted">Önizleme yüklenemedi.</p>'; } }
    });
  }).catch(() => { const el = $('#dsv', m); if (el) el.innerHTML = '<p class="muted">Veri seti bilgisi yüklenemedi.</p>'; });
} };

/* Ana sayfa ve profil eklemeleri */
const homeHtml = VIEWS.home.html;
VIEWS.home.html = function () {
  const sc = arenaScore(), rk = rankOf(sc); const ai = aiSets();
  return homeHtml.call(this) + '<section class="lvl-block"><div class="sec-head"><h2>Uygula ve hazırlan</h2></div><div class="paths">' +
    '<button type="button" class="panel pcard" data-go="ai"><div class="row"><span class="ic navic">' + C.ICON.ai + '</span><b>Yapay Zekâ</b></div><p>LLM API, prompt tasarımı, RAG, ajanlar, değerlendirme ve yerel modeller; makine öğrenmesi dersleri ve mülakat soruları tek sayfada.</p><div class="foot"><span>' + (ai.llm.length + ai.ml.length) + ' ders</span><span>' + IV.filter(q => q.roles.includes('ai')).length + ' mülakat sorusu</span></div></button>' +
    '<button type="button" class="panel pcard" data-go="arena"><div class="row"><span class="ic" style="background:var(--s8)">⚔</span><b>Python Arena</b></div><p>' + ARENA.length + ' problem: girdi-çıktı biçimi, gizli testler, puan ve unvan, günün sorusu, zamanlı set.</p><div class="foot"><span>' + esc(rk.name) + ' · ' + sc + ' puan</span><span>' + ARENA.filter(a => solved(a.id)).length + ' çözüldü</span></div></button>' +
    '<button type="button" class="panel pcard" data-go="interview"><div class="row"><span class="ic" style="background:var(--s7)">?</span><b>Mülakat</b></div><p>' + IV.length + ' mülakat sorusu ve model cevap; rol bazlı simülasyon ve kart modu.</p><div class="foot"><span>' + IV.filter(q => ivState(q.id) === 2).length + ' bildim</span><span>9 rol</span></div></button>' +
    '<button type="button" class="panel pcard" data-go="mistakes"><div class="row"><span class="ic" style="background:var(--s2)">!</span><b>Sık hatalar</b></div><p>Hatalı kod → gerçekte ne olur → doğru kod → kural. Çalıştırıp farkı gör.</p><div class="foot"><span>' + MS.length + ' katalog kaydı</span><span>+ derslerden</span></div></button>' +
    '<button type="button" class="panel pcard" data-go="data"><div class="row"><span class="ic" style="background:var(--s3)">▤</span><b>Veri setleri</b></div><p>8 kurgusal veri seti: e-ticaret, banka, İK, teslimat, havayolu, bisiklet, Power BI modeli, kirli veri.</p><div class="foot"><span>~283 bin satır</span><span>import veri</span></div></button>' +
    '</div></section>';
};
const profHtml = VIEWS.profile.html;
VIEWS.profile.html = function () {
  const sc = arenaScore(), rk = rankOf(sc);
  return profHtml.call(this) + '<section class="lvl-block"><div class="sec-head"><h2>Arena ve mülakat</h2></div><div class="kpis kpis4"><div class="panel kpi"><b class="num">' + sc + '</b><span>Arena puanı · unvan: ' + esc(rk.name) + '</span></div><div class="panel kpi"><b class="num">' + ARENA.filter(a => solved(a.id)).length + '</b><span>problem çözüldü</span></div><div class="panel kpi"><b class="num">' + P.conts.length + '</b><span>zamanlı set</span></div><div class="panel kpi"><b class="num">' + IV.filter(q => ivState(q.id) === 2).length + '/' + IV.length + '</b><span>mülakat sorusu</span></div></div></section>';
};
})();
