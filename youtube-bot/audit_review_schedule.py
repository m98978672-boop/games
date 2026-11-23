"""Read-only audit of scheduled publisher runs; never proves YouTube publication.

Run creation windows are approximate: delayed GitHub schedules can be missed or
misclassified. Missing/failed runs require investigation, not automatic upload.
"""
from __future__ import annotations
import json
import sys
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

MOSCOW = ZoneInfo('Europe/Moscow')
UTC = timezone.utc


def audit(runs, *, now):
    if now.tzinfo is None: raise ValueError('now requires timezone')
    day=now.astimezone(MOSCOW).date()
    # UTC run-creation windows from the existing publisher cron. Nonoverlapping.
    midnight=datetime.combine(day, time.min, UTC)
    windows=[('long_06_msk',midnight-timedelta(hours=2),midnight+timedelta(hours=1)),
             ('short_08_msk',midnight+timedelta(hours=1),midnight+timedelta(hours=5)),
             ('short_12_msk',midnight+timedelta(hours=5),midnight+timedelta(hours=11))]
    if not isinstance(runs,list): raise ValueError('Expected run list')
    result=[]
    for name,start,end in windows:
        matches=[]
        for run in runs:
            if not isinstance(run,dict) or run.get('event')!='schedule' or run.get('headBranch')!='main': continue
            try:
                created=datetime.fromisoformat(run['createdAt'].replace('Z','+00:00')).astimezone(UTC)
            except (KeyError, ValueError, TypeError): raise ValueError('Invalid run timestamp')
            if start <= created < end: matches.append(run)
        if not matches: state='missing_approximate_window'
        elif any(r.get('status') != 'completed' for r in matches): state='in_progress'
        elif any(r.get('conclusion') == 'success' for r in matches): state='run_success_publication_unverified'
        else: state='failed_or_cancelled'
        result.append({'slot':name,'run_state':state,'matching_runs':len(matches)})
    return {'moscow_date':day.isoformat(),'slots':result,'publication_verified':False}


if __name__ == '__main__':
    result=audit(json.load(sys.stdin), now=datetime.now(UTC))
    print(json.dumps(result, ensure_ascii=False))
