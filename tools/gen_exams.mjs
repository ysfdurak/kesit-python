// Patika (rol) sınavlarını, iki ortamda doğrulanmış ders alıştırmalarından derler.
// Kullanım: node tools/gen_exams.mjs > v3/s1/sinav_roller.js   (dist/ derlendikten sonra)
import fs from 'fs';
const D = new URL('../docs/', import.meta.url).pathname;
const window = {}; globalThis.window = window;
for (const f of ['levels.js', 'paths.js', 'c_temel.js', 'c_orta.js', 'c_ileri.js', 'n_temel.js', 'n_orta.js', 'n_ileri.js', 'x_1.js', 'x_2.js']) new Function('window', fs.readFileSync(D + f, 'utf8'))(window);
const L = {}; window.PY_LESSONS.forEach(l => L[l.id] = { ...l, ex: [...(l.ex || [])] });
(window.PY_EXT || []).forEach(x => { if (L[x.id]) L[x.id].ex.push(...(x.ex || [])); });
const TIER = window.PY_TIER;
const genel = new Set(window.PY_PATHS.find(p => p.id === 'genel').lessons);
// deterministik karıştırma
const rnd = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; };
const pick = (arr, r) => arr.length ? arr[Math.floor(r() * arr.length)] : null;
const strip = s => String(s || '').replace(/<[^>]+>/g, '');
const KIND = { genel: 'Temel', analist: 'Veri analisti', bilimci: 'Veri bilimci', muhendis: 'Veri mühendisi', backend: 'Backend geliştirici', ml: 'Makine öğrenmesi mühendisi', web: 'Web geliştirici', ai: 'Yapay zekâ geliştiricisi', otomasyon: 'Otomasyon uzmanı', sertifika: 'Sertifika ve mülakat' };
const out = [];
for (const p of window.PY_PATHS) {
  const r = rnd('sinav-' + p.id);
  let ids = p.lessons.filter(id => L[id] && (p.id === 'genel' || p.id === 'sertifika' || !genel.has(id)));
  if (ids.length < 8) ids = p.lessons.filter(id => L[id]);
  const used = new Set(); const qs = [];
  const tests = e => ['mc', 'predict'].includes(e.t) && e.o && e.o.length >= 3 && e.a != null;
  // 1) her dersten sırayla bir test sorusu (mc / predict), 16 soruya kadar
  // role özgü dersler önce: daha az patikada geçen ders o rolün çekirdeğidir
  const cnt = id => window.PY_PATHS.filter(q => q.lessons.includes(id)).length;
  const rk = {}; ids.forEach(id => rk[id] = cnt(id) + r() * .9);
  const order = [...ids].sort((x, y) => rk[x] - rk[y]);
  for (let pass = 0; qs.length < 16 && pass < 3; pass++) {
    for (const id of order) {
      if (qs.length >= 16) break;
      const c = L[id].ex.filter(e => tests(e) && !used.has(e.id || e.q));
      const e = pick(c, r); if (!e) continue; used.add(e.id || e.q);
      const q = { t: e.t, lv: TIER(L[id].lv), topic: L[id].title, q: e.q, o: e.o, a: e.a, why: e.why || '' };
      if (e.code) q.code = e.code; if (e.raises) q.raises = e.raises;
      qs.push(q);
    }
  }
  // 2) farklı derslerden 4 kodlama görevi (Kendin yaz / Rehberli, kolay-orta)
  const codeIds = order.filter(id => L[id].ex.some(e => e.t === 'code' && e.tests && e.sol)).slice();
  const codes = [];
  for (const id of codeIds) {
    if (codes.length >= 4) break;
    const c = L[id].ex.filter(e => e.t === 'code' && e.tests && e.sol && (e.stage === 'Kendin yaz' || e.stage === 'Rehberli' || !e.stage) && (e.diff || 1) <= 2 && !/input\(/.test(e.sol));
    const e = pick(c, r); if (!e) continue;
    const needs = [...new Set([...(L[id].needs || []), ...(e.needs || [])])];
    const q = { t: 'code', lv: TIER(L[id].lv), topic: L[id].title, pts: 5, q: e.q, start: e.start || '', sol: e.sol, tests: e.tests, why: e.why || '' };
    if (needs.length) q.needs = needs; if (e.stdin) q.stdin = e.stdin; if (e.expect != null) q.expect = e.expect;
    codes.push(q);
  }
  qs.push(...codes);
  const lv = p.id === 'genel' ? 'temel' : ['analist', 'otomasyon', 'web', 'sertifika'].includes(p.id) ? 'orta' : 'ileri';
  out.push({ id: 'patika-' + p.id, title: p.name + ' patikası sınavı', lv, kind: 'kod', min: 60, pass: 70,
    desc: KIND[p.id] + ' rolü için ' + qs.length + ' soruluk karma sınav: ' + (qs.length - codes.length) + ' test sorusu ve ' + codes.length + ' kodlama görevi (her biri 5 puan). Sorular ' + p.name + ' patikasındaki derslerden seçilir; patikayı bitirdiğini ölçmek için gir.',
    qs });
}
process.stdout.write('/* PythonPatika — patika (rol) sınavları: doğrulanmış ders alıştırmalarından derlendi (tools/gen_exams.mjs) */\n(function (W) {\n\'use strict\';\nconst E = W.PY_EXAMS = W.PY_EXAMS || [];\nE.push(\n' + out.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n);\n})(window);\n');
console.error(out.map(x => x.id + ': ' + x.qs.length + ' (' + x.qs.filter(q => q.t === 'code').length + ' kod)').join('\n'));
