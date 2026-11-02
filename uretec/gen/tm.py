import sys,time; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri
t0=time.time(); import pandas as pd; print('import pd',time.time()-t0)
t0=time.time(); t=veri.oku('pedal_izmir','bk_trips',parse_dates=['started_at','ended_at']); print('oku',time.time()-t0)
t0=time.time(); c=veri.baglan('pedal_izmir',tablolar=['bk_trips','bk_users']); print('baglan',time.time()-t0)
