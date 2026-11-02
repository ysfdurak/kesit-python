#!/bin/bash
# kullanım: chain.sh cp|pyo dosyalar...
mode=$1; shift; V=/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/vf
cd $V/cp
for f in "$@"; do
  out=$V/$mode/$(echo $f | sed 's|/home/claude/py/||; s|/|_|g').log
  [ -s "$out" ] && grep -q "PASS=" "$out" && continue
  if [ $mode = cp ]; then VW=2 VT=4 timeout 3000 python3 /home/claude/py/tools/verify.py $f > $out 2>&1
  else (cd /home/claude/py && timeout 3000 node --max-old-space-size=4000 tools/pyodide_verify.mjs $f > $out 2>&1); fi
  echo "$(basename $out): $(grep -E 'PASS=' $out | tail -1)"
done
echo CHAIN-DONE
