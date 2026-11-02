#!/bin/bash
# kullanım: run.sh NN
D=/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/spec
python3 $D/gen.py $D/spec$1.py /home/claude/py/v2/b1/bank_temel_$1.js && python3 /home/claude/py/tools/verify.py /home/claude/py/v2/b1/bank_temel_$1.js
