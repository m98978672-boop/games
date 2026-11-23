import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audit_review_schedule import audit

class ScheduleAuditTests(unittest.TestCase):
    def test_missing_and_delayed_success_do_not_claim_publication(self):
        runs=[{'event':'schedule','headBranch':'main','createdAt':'2026-11-23T08:26:55Z','status':'completed','conclusion':'success'}]
        report=audit(runs,now=datetime(2026,11,23,15,0,tzinfo=timezone.utc))
        self.assertEqual([x['run_state'] for x in report['slots']],['missing_approximate_window','missing_approximate_window','run_success_publication_unverified'])
        self.assertFalse(report['publication_verified'])
    def test_manual_jobs_do_not_count_and_previous_day_long_does(self):
        runs=[{'event':'schedule','headBranch':'main','createdAt':'2026-11-22T22:10:00Z','status':'completed','conclusion':'failure'},
              {'event':'workflow_dispatch','headBranch':'main','createdAt':'2026-11-23T01:10:00Z','status':'completed','conclusion':'success'}]
        states=[x['run_state'] for x in audit(runs,now=datetime(2026,11,23,15,0,tzinfo=timezone.utc))['slots']]
        self.assertEqual(states,['failed_or_cancelled','missing_approximate_window','missing_approximate_window'])
    def test_invalid_does_not_silently_pass(self):
        with self.assertRaises(ValueError): audit([{'event':'schedule','headBranch':'main','createdAt':'oops'}],now=datetime.now(timezone.utc))

if __name__=='__main__': unittest.main()
