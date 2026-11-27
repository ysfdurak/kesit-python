/* Yayın paketi için ders içeriğini böler: node tools/govde.cjs <paket klasörü>
   - Derlenmiş kök dosyaları (levels, paths, c_*, n_*, x_*, ex_anahtar) yükler, app.js'in açılış hazırlığını
     (uzantı birleştirme, alıştırma aşaması ve ilerleme anahtarı, terim ve bağlantı) burada bir kez çalıştırır.
   - <paket>/dersler.js: bütün derslerin hafif kaydı (gövdesiz; alıştırmalar yalnız t, stage, id, _k, erken), PY_HAZIR = true.
   - <paket>/govde/<modül>.js: o modüldeki derslerin gövdesi, tam alıştırmaları ve diğer ağır alanları.
   Ders açılınca uygulama yalnız o dersin modül dosyasını indirir (kaynak/app.js › govdeYukle). */
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const KOK = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(KOK, 'gh/kesit-python'));
const ICERIK = ['levels.js', 'paths.js', 'c_temel.js', 'c_orta.js', 'c_ileri.js', 'n_temel.js', 'n_orta.js', 'n_ileri.js', 'x_1.js', 'x_2.js', 'ex_anahtar.js'];
const ctx = { console }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ICERIK) vm.runInContext(fs.readFileSync(path.join(KOK, f), 'utf8'), ctx, { filename: f });
/* app.js'in hazırlık bölümü: "const LEVELS" satırından terim satırına kadar, sonra sureDk */
const app = fs.readFileSync(path.join(KOK, 'kaynak/app.js'), 'utf8').split('\n');
const bas = app.findIndex(l => l.startsWith('const LEVELS = window.PY_LEVELS'));
const son = app.findIndex(l => l.includes('LESSONS.forEach(l => { l.body = termify(linkIds(l.body), l.id);'));
const sure = app.find(l => l.startsWith('function sureDk(l)'));
if (bas < 0 || son < bas || !sure) throw new Error('app.js hazırlık bölümü bulunamadı');
const yard = app.filter(l => l.startsWith('const esc = ') || l.startsWith('const unesc = '));
const kod = yard.join('\n') + '\n' + app.slice(bas, son + 1).join('\n') + '\n' + sure + '\nLESSONS.forEach(l => { delete l._sr; sureDk(l); });\nwindow.__L = LESSONS;';
vm.runInContext('(function(){' + kod + '\n})();', ctx, { filename: 'app-hazirlik' });
const L = ctx.__L;
const slug = s => String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diger';
const HAFIF = ['id', 'lv', 'mod', 'min', 'title', 'sum', 'opt', '_sr'];
const EXH = ['t', 'stage', 'id', '_k', 'erken'];
const gruplar = {}, hafif = [];
for (const l of L) {
  const g = slug(l.mod); const h = { _g: g }, a = {};
  for (const [k, v] of Object.entries(l)) {
    if (k === 'ex') { h.ex = (v || []).map(e => { const o = {}; EXH.forEach(x => { if (e[x] !== undefined) o[x] = e[x]; }); return o; }); a.ex = v; }
    else if (HAFIF.includes(k) || (k !== 'body' && JSON.stringify(v).length < 400)) h[k] = v;
    else a[k] = v;
  }
  hafif.push(h); (gruplar[g] = gruplar[g] || {})[l.id] = a;
}
const js = v => JSON.stringify(v).replace(/<\/script/gi, '<\\/script').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
fs.mkdirSync(path.join(OUT, 'govde'), { recursive: true });
const ozet = crypto.createHash('sha256');
let toplam = 0;
for (const [g, obj] of Object.entries(gruplar).sort()) {
  const s = '/* Kesit Python ders gövdeleri: ' + g + ' (tools/govde.cjs üretir) */\nwindow.PY_GOVDE_YUKLE(' + js(g) + ', ' + js(obj) + ');\n';
  fs.writeFileSync(path.join(OUT, 'govde', g + '.js'), s); ozet.update(s); toplam += s.length;
}
const surum = ozet.digest('hex').slice(0, 10);
const d = '/* Kesit Python ders dizini: gövdeler govde/<modül>.js içinde (tools/govde.cjs üretir) */\nwindow.PY_HAZIR = true;\nwindow.PY_GOVDE_SURUM = ' + js(surum) + ';\nwindow.PY_LESSONS = ' + js(hafif) + ';\nwindow.PY_EXT = [];\n';
fs.writeFileSync(path.join(OUT, 'dersler.js'), d);
/* Statik ders sayfaları: öğrenme sırasıyla (PY_ORDER, sonra kalanlar) */
const ORD = (ctx.PY_ORDER || []).map(id => L.find(l => l.id === id)).filter(Boolean); L.forEach(l => { if (!ORD.includes(l)) ORD.push(l); });
const statik = fs.existsSync(path.join(OUT, 'index.html')) ? require('./statik.cjs')(OUT, ORD) : 0;
console.log(JSON.stringify({ statik, ders: L.length, modul: Object.keys(gruplar).length, dizinKB: Math.round(d.length / 1024), govdeMB: +(toplam / 1e6).toFixed(2), surum }));
