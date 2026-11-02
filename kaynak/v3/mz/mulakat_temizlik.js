/* Kesit Python — mülakat bankası temizliği: davranışsal sorular ve Python'a dayanmayan genel sorular (istatistik, HTTP, SQL izolasyonu, genel sistem tasarımı) çıkarıldı. Mülakat bölümü yalnız Python odaklıdır. */
(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || [];
const CIKAR = new Set(('m-062 m-074 m-101 m-103 m-104 m-107 m-108 m-112 m-161 m-162 m-163 m-166 m-167 m-168 m-169 m-172 m-176 m-184 m-186 m-187 m-189 m-190 m-191 m-199 m-201 m-203 m-209 m-211 m-215 m-224 m-228 m-229 m-231 m-232 m-235 m-238 m-240 m-247 m-252 m-254 m-255 m-258 m-261 m-262 m-267 m-270 m-275 m-280 m-284').split(' '));
for (let i = Q.length - 1; i >= 0; i--) { const q = Q[i]; if (CIKAR.has(q.id) || q.kind === 'davranissal' || (q.roles || []).includes('davranissal')) Q.splice(i, 1); }
})(window);
