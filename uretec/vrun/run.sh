#!/bin/bash
f=$1; n=$(basename $(dirname $f))_$(basename $f .js)
cd /tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/vrun
python3 /home/claude/py/tools/verify.py "$f" > "$n.log" 2>&1
