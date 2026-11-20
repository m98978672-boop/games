#!/usr/bin/env bash
# Runs one 5-hour active-training phase; resumes the most recent saved slot
# from this phase after a failed job, or the preceding completed phase.
set -euo pipefail
: "${RUNNER_TEMP:?}" "${GITHUB_RUN_ID:?}" "${GH_TOKEN:?}" "${GH_REPO:?}" "${PHASE:?}"
case "$PHASE" in 1|2|3) ;; *) echo 'Invalid phase' >&2; exit 1;; esac
tag="frontline-learning-15h-${TRAINING_RUN_ID:-$GITHUB_RUN_ID}"
mkdir -p "$RUNNER_TEMP/long-data" "$RUNNER_TEMP/long-work" "$RUNNER_TEMP/slots"
gh release download "$tag" --pattern long-dataset.tar.gz --dir "$RUNNER_TEMP"
tar -xzf "$RUNNER_TEMP/long-dataset.tar.gz" -C "$RUNNER_TEMP/long-data"
assets=$(gh release view "$tag" --json assets --jq '.assets[].name')
contains_asset(){ grep -Fxq "$1" <<< "$assets"; }
complete="phase-$PHASE-complete.tar.gz"
if contains_asset "$complete"; then
  gh release download "$tag" --pattern "$complete" --dir "$RUNNER_TEMP/slots"
  mkdir -p "$RUNNER_TEMP/complete"
  tar -xzf "$RUNNER_TEMP/slots/$complete" -C "$RUNNER_TEMP/complete"
  python - "$RUNNER_TEMP/complete/checkpoint/progress.json" "$PHASE" <<'PY'
import json,sys
p=json.load(open(sys.argv[1]));assert p['phase']==int(sys.argv[2]);assert p['phase_budget_seconds']==18000
assert p['active_seconds']>=p['phase_start_active']+18000
print('Completed phase already preserved:',json.dumps(p))
PY
  exit 0
fi
for slot in 0 1; do
  name="phase-$PHASE-slot-$slot.tar.gz"
  if contains_asset "$name"; then
    gh release download "$tag" --pattern "$name" --dir "$RUNNER_TEMP/slots"
    mkdir -p "$RUNNER_TEMP/slot-$slot"
    tar -xzf "$RUNNER_TEMP/slots/$name" -C "$RUNNER_TEMP/slot-$slot"
  fi
done
best=$(python - "$RUNNER_TEMP" "$PHASE" <<'PY'
import json,os,sys
root=sys.argv[1];phase=int(sys.argv[2]);candidates=[]
for slot in (0,1):
 p=os.path.join(root,f'slot-{slot}','checkpoint','progress.json')
 if os.path.exists(p):
  d=json.load(open(p))
  if d['phase']==phase:candidates.append((float(d['active_seconds']),int(d['steps']),os.path.dirname(p)))
print(max(candidates)[2] if candidates else '')
PY
)
args=(--data "$RUNNER_TEMP/long-data" --work "$RUNNER_TEMP/long-work" --phase "$PHASE" --active-seconds 18000 --release "$tag")
if [[ -n "$best" ]]; then
  echo "Resuming phase $PHASE from its latest durable checkpoint."
  args+=(--resume "$best")
elif [[ "$PHASE" != 1 ]]; then
  previous=$((PHASE-1));name="phase-$previous-complete.tar.gz"
  gh release download "$tag" --pattern "$name" --dir "$RUNNER_TEMP/slots"
  mkdir -p "$RUNNER_TEMP/previous"
  tar -xzf "$RUNNER_TEMP/slots/$name" -C "$RUNNER_TEMP/previous"
  args+=(--resume "$RUNNER_TEMP/previous/checkpoint")
else
  gh release download frontline-obstacle-v2-44626512571 --pattern frontline-obstacle-v2.tar.gz --dir "$RUNNER_TEMP"
  echo "ba79aaf92c5c4bf11dbb22b3a0b324a834b2aa2f4fa0f376d6d498a02087f4d6  $RUNNER_TEMP/frontline-obstacle-v2.tar.gz" | sha256sum -c -
  mkdir -p "$RUNNER_TEMP/source"
  tar -xzf "$RUNNER_TEMP/frontline-obstacle-v2.tar.gz" -C "$RUNNER_TEMP/source" adapter
  args+=(--initial-adapter "$RUNNER_TEMP/source/adapter")
fi
python -u frontline-command/tools/training/train-long.py "${args[@]}"
