(function (W) { const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(
{id:'p1',code:'import pydantic, jinja2, sys\nprint(pydantic.VERSION, jinja2.__version__, sys.version_info[:2])\n',out:'x'},
{id:'p2',code:'from zoneinfo import ZoneInfo\nfrom datetime import datetime\nprint(datetime(2024,3,30,12,tzinfo=ZoneInfo("Europe/Berlin")).utcoffset())\n',out:'x'},
{id:'p3',code:'import asyncio\nasync def f():\n    await asyncio.sleep(0.01)\n    return 1\nasync def m():\n    t=asyncio.create_task(f()); t.cancel()\n    try:\n        await t\n    except asyncio.CancelledError:\n        print("iptal")\nasyncio.run(m())\n',out:'x'},
{id:'p4',code:'import sqlite3\nprint(sqlite3.sqlite_version)\n',out:'x'},
{id:'p5',code:'import shutil, tempfile, zipfile, email.message, argparse, shlex\nprint("ok")\n',out:'x'}
); })(window);
