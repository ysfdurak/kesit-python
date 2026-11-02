#!/bin/bash
# kullanım: run.sh <kaynak.py>  -> üret + verify + examples
S=/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad
OUTF=$(python3 $S/gen.py "$1" | tee /dev/stderr | grep 'yazıldı:' | awk '{print $2}')
[ -z "$OUTF" ] && exit 1
mkdir -p $S/wd && cd $S/wd
python3 /home/claude/py/tools/verify.py "$OUTF" 2>&1 | tail -40
python3 /home/claude/py/tools/examples.py -v "$OUTF" 2>&1 | tail -30
