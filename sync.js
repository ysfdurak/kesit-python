/* Kesit Python — bulut eşitleme (isteğe bağlı).
   claude.ai'da oturum açmış ve bu sayfaya yazma izni olan kişilerde ilerleme, kişiye özel ve gizli
   data/users/<id>/progress belgesinde de tutulur; başka cihazda açınca en yeni olan kullanılır.
   Bağlantı yoksa ya da izin yoksa ilerleme yalnızca tarayıcıda kalır; Profil'den dosya yedeği alınabilir. */
(function () {
'use strict';
const C = window.PY_CORE; if (!C) return; const P = C.P;
const SY = { state: 'kapali', ref: null, busy: false, last: '' };
let pushT = null;
function pushSoon() { if (!SY.ref) return; clearTimeout(pushT); pushT = setTimeout(push, 4000); }
async function push() { if (KESIT_STORAGE.isBlocked()) return;
  if (!SY.ref || SY.busy) return; const json = JSON.stringify(P); if (json === SY.last || json.length > 240000) return;
  SY.busy = true; try { await SY.ref.set({ json, ts: P._ts || Date.now(), v: 1 }); SY.last = json; SY.state = 'acik'; } catch (e) { SY.state = 'hata'; } finally { SY.busy = false; }
}
async function connect() { if (KESIT_STORAGE.isBlocked()) return;
  try {
    const cl = window.claude; if (!cl || !cl.use) return;
    const [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); if (!db || !user) return;
    let can = null; try { can = await user.can('data.write'); } catch (e) { can = null; } if (can === false) return;
    const id = await user.id(); if (!id) return;
    const ref = db.collection('data/users/' + id).doc('progress');
    const snap = await ref.get(); SY.ref = ref;
    const rem = snap.exists ? snap.data() : null;
    let remDone = 0; try { remDone = rem && rem.json ? Object.keys(JSON.parse(rem.json).done || {}).length : 0; } catch (e) {}
    const localWins = !P._ts && Object.keys(P.done || {}).length > remDone;
    if (rem && rem.json && !localWins && (rem.ts || 0) > (P._ts || 0)) { C.replaceProgress(JSON.parse(rem.json)); SY.last = rem.json; C.toast('İlerlemen başka bir cihazdan eşitlendi.'); }
    SY.state = 'acik'; await push();
  } catch (e) { SY.state = 'hata'; }
}
window.addEventListener('py-saved', pushSoon);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(); });
setTimeout(connect, 800);
window.PY_SYNC = { state: () => SY.state, push };
})();
