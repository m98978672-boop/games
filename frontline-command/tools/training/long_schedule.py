"""Pure schedule calculations; times count optimizer work, not wall clock."""
import math

def attempt_target(active,phase_start,phase_budget,attempt_budget=0):
    values=(active,phase_start,phase_budget,attempt_budget)
    if any(not math.isfinite(x) for x in values) or active<0 or phase_start<0 or phase_budget<=0 or attempt_budget<0 or active<phase_start:
        raise ValueError('invalid training schedule')
    full=phase_start+phase_budget
    return min(full,active+attempt_budget) if attempt_budget else full

def attempt_result(active,phase_start,phase_budget,target):
    if active>=phase_start+phase_budget:return 'complete'
    if active>=target:return 'partial'
    return 'incomplete'
