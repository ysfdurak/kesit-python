#!/bin/bash
V=/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/vf
cd /home/claude/py
for f in "$@"; do
  grep -qE 'class=\\?"py' $f || continue
  out=$V/ex/$(echo $f | sed 's|/|_|g').log
  timeout 2400 node --max-old-space-size=4000 tools/pyodide_examples.mjs $f > $out 2>&1
  grep -E "^(HATA|YOK|YAVAŞ)" $out | cut -c1-260
  grep -q "pyodide örnek" $out || echo "ÇÖKTÜ $f: $(tail -2 $out | cut -c1-200)"
done
echo EXCHAIN-DONE
