import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
D={t:veri.oku('pusula_ik',t) for t in ['ik_employees','ik_leaves','ik_positions','ik_salaries','ik_reviews','ik_candidates','ik_requisitions','ik_departments']}
e=D['ik_employees']
print(e.term_type.value_counts(dropna=False)); print(e.term_reason.value_counts()); print(e.hire_source.value_counts()); print(e.work_mode.value_counts()); print(e.city.value_counts())
print(e.hire_date.min(), e.hire_date.max(), e.term_date.min(), e.term_date.max())
l=D['ik_leaves']; l['dow']=pd.to_datetime(l.start_date).dt.dayofweek
print(pd.crosstab(l.leave_type,l.dow))
print(l.start_date.min(), l.start_date.max())
c=D['ik_candidates']; print(c.stage.value_counts()); print(c.source.value_counts()); print(pd.crosstab(c.source,c.stage))
print(D['ik_requisitions'].status.value_counts())
r=D['ik_reviews']; print(r.review_year.value_counts().sort_index()); print(r.rating.value_counts().sort_index()); print(r.potential.value_counts(dropna=False))
s=D['ik_salaries']; print(s.reason.value_counts()); print(s.effective_date.max())
