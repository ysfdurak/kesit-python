#!/bin/bash
# usage: runpre.sh file.js
node -e '
const fs=require("fs");const window={};new Function("window",fs.readFileSync(process.argv[1],"utf8"))(window);
const x=window.PY_EXT[0];const h=x.html;
const words=h.replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length;
console.error("kelime:",words,"ex:",x.ex.length);
const re=/<pre class="py">([\s\S]*?)<\/pre>/g;let m;const out=[];
while((m=re.exec(h))){out.push(m[1].replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&"));}
fs.writeFileSync("/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/pre.json",JSON.stringify(out));
' "$1"
python3 - <<'PY'
import json,io,contextlib,traceback
for i,c in enumerate(json.load(open("/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/pre.json"))):
    buf=io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): exec(c,{"__name__":"__main__"})
        print(f"--- #{i} OK"); print(buf.getvalue())
    except Exception:
        print(f"--- #{i} HATA"); print(buf.getvalue()); traceback.print_exc()
PY
