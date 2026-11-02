#!/bin/bash
# kullanım: v.sh <ders-id>
cd /tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x1/run
F=/home/claude/py/v2/x1/$1.js
python3 ../c_${1//-/_}.py || exit 1
node --check $F || exit 1
echo "--- py3/pandas3"; python3 ../seqv.py $F; python3 /home/claude/py/tools/examples.py $F
echo "--- pandas2.2"; ../../p22/bin/python ../seqv.py $F; ../../p22/bin/python /home/claude/py/tools/examples.py $F
