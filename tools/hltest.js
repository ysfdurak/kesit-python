#!/usr/bin/env node
/* Vurgulayıcı özellik testi: tüm içerikteki kodda un(hl(x)) === x olmalı. Kullanım: node tools/hltest.js (derlemeden sonra) */
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..'); global.window = global;
const h = fs.readFileSync(path.join(R, 'index.html'), 'utf8');
for (const f of h.match(/src="[^"]+\.js"/g).map(s => s.slice(5, -1)).filter(f => !/^(app|app2|engine|sync|portfolio|config)\.js$/.test(f))) vm.runInThisContext(fs.readFileSync(path.join(R, f), 'utf8'));
const src = fs.readFileSync(path.join(R, 'kaynak/app.js'), 'utf8');
const kws = src.match(/const KW = .*\n/)[0], bis = src.match(/const BI = .*\n/)[0], fn = src.match(/function hl\(code\) \{[\s\S]*?\n\}/)[0];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = new Function('esc', kws + bis + 'const KWS = new Set(KW), BIS = new Set(BI);' + fn + ';return hl')(esc);
const un = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
let n = 0, bad = 0; const chk = (w, c) => { if (c == null || typeof c !== 'string') return; n++; if (un(hl(c)) !== c) { bad++; if (bad < 20) console.log('FAIL', w, JSON.stringify(c.slice(0, 80))); } };
const tag = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const exs = (w, e) => { ['code', 'start', 'sol', 'tests', 'example', 'file', 'cmd'].forEach(k => chk(w + '.' + k, e[k])); (e.lines || []).forEach(x => chk(w + '.line', x)); };
for (const l of window.PY_LESSONS) { for (const m of String(l.body).matchAll(/<pre class="(?:py|code)"[^>]*>([\s\S]*?)<\/pre>/g)) chk(l.id + '.body', tag(m[1])); (l.ex || []).forEach((e, i) => exs(l.id + '#' + i, e)); (l.mistakes || []).forEach(m => { chk(l.id + '.m', m.bad); chk(l.id + '.m', m.good); }); }
for (const x of window.PY_EXT || []) { for (const m of String(x.html || '').matchAll(/<pre class="(?:py|code)"[^>]*>([\s\S]*?)<\/pre>/g)) chk(x.id + '.ext', tag(m[1])); (x.ex || []).forEach((e, i) => exs(x.id + '+' + i, e)); }
(window.PY_BANK || []).forEach(t => exs('bank ' + t.id, t)); (window.PY_EXAMS || []).forEach(x => x.qs.forEach((q, i) => exs('sınav ' + x.id + i, q)));
(window.PY_ARENA || []).forEach(a => { chk('arena', a.sol); chk('arena', a.start); }); (window.PY_INTERVIEW || []).forEach(q => chk('mülakat', q.code)); (window.PY_MISTAKES || []).forEach(m => { chk('hata', m.bad); chk('hata', m.good); });
['a = 1_000_000', '0xFF 0b101 0o755 4j 1.5e-3 .5 1.', 'f = "abc', "g = 'x", 'şöyle = "ç" # yorum', 's = """a\nb', '@dekor\ndef f(): pass', '<>&"\''].forEach(c => chk('elle', c));
console.log('vurgulayıcı testi: ' + n + ' kod parçası, ' + bad + ' hata'); process.exit(bad ? 1 : 0);
