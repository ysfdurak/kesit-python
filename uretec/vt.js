(function (W) { const B = W.PY_BANK = W.PY_BANK || []; B.push(
 { id: 'vt-1', lv: 'temel', topic: 'x', diff: 1, kind: 'yaz', title: 't', q: 'q', sol: 'import veri\nk = veri.kayitlar("kanat_havayollari", "hv_aircraft")\nprint(len(k), max(x["seats"] for x in k))\n', expect: '15 289' },
 { id: 'vt-2', lv: 'temel', topic: 'x', diff: 1, kind: 'yaz', title: 't', q: 'q', sol: 'import veri\ndf = veri.oku("anadolu_market", "orders")\nprint(len(df))\n', expect: '910' }
); })(window);
