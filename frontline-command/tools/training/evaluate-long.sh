#!/usr/bin/env bash
# Independent evaluation after all 54,000 seconds of training are complete.
set -euo pipefail
: "${RUNNER_TEMP:?}" "${GITHUB_RUN_ID:?}" "${GH_TOKEN:?}" "${GH_REPO:?}"
tag="frontline-learning-15h-${TRAINING_RUN_ID:-$GITHUB_RUN_ID}"
mkdir -p "$RUNNER_TEMP/long-data" "$RUNNER_TEMP/completed" "$RUNNER_TEMP/starting" "$RUNNER_TEMP/eval-input" "$RUNNER_TEMP/eval-output"
gh release download "$tag" --pattern long-dataset.tar.gz --dir "$RUNNER_TEMP"
gh release download "$tag" --pattern phase-3-complete.tar.gz --dir "$RUNNER_TEMP"
gh release download frontline-obstacle-v2-44626512571 --pattern frontline-obstacle-v2.tar.gz --dir "$RUNNER_TEMP"
echo "ba79aaf92c5c4bf11dbb22b3a0b324a834b2aa2f4fa0f376d6d498a02087f4d6  $RUNNER_TEMP/frontline-obstacle-v2.tar.gz" | sha256sum -c -
tar -xzf "$RUNNER_TEMP/long-dataset.tar.gz" -C "$RUNNER_TEMP/long-data"
tar -xzf "$RUNNER_TEMP/phase-3-complete.tar.gz" -C "$RUNNER_TEMP/completed"
tar -xzf "$RUNNER_TEMP/frontline-obstacle-v2.tar.gz" -C "$RUNNER_TEMP/starting" adapter
python - "$RUNNER_TEMP/completed/checkpoint/progress.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]));assert r['phase']==3 and r['active_seconds']>=54000
print('Completed training:',json.dumps(r))
PY
cp "$RUNNER_TEMP/completed/checkpoint/progress.json" "$RUNNER_TEMP/eval-output/training-progress.json"
python frontline-command/tools/training/make-long-eval-data.py --data "$RUNNER_TEMP/long-data" --out "$RUNNER_TEMP/eval-input"
# Identical unseen scenes: compare the starting adapter and the selected best.
for kind in starting best; do
  if [[ "$kind" == starting ]]; then adapter="$RUNNER_TEMP/starting/adapter";else adapter="$RUNNER_TEMP/completed/checkpoint/best";fi
  python -u frontline-command/tools/training/obstacle-holdout-infer.py --data "$RUNNER_TEMP/eval-input/waypoint.json" --adapter "$adapter" --output "$RUNNER_TEMP/eval-output/$kind-inference.json"
  node frontline-command/tools/training/replay-obstacle-holdout.mjs "$RUNNER_TEMP/eval-output/$kind-inference.json" "$RUNNER_TEMP/eval-output/$kind-replay.json"
done
# Actual game validator, free-generated output; no WebLLM grammar and no war test.
python -u frontline-command/tools/training/eval-qwen.py --data "$RUNNER_TEMP/eval-input/commander" --adapter "$RUNNER_TEMP/completed/checkpoint/best" --output "$RUNNER_TEMP/eval-output/commander.json" --count 8
node frontline-command/tools/training/score-generated.mjs "$RUNNER_TEMP/eval-output/commander.json"
python - "$RUNNER_TEMP/eval-output" <<'PY'
import json,os,sys
p=sys.argv[1];base=json.load(open(os.path.join(p,'starting-replay.json')))['summary'];best=json.load(open(os.path.join(p,'best-replay.json')))['summary'];command=json.load(open(os.path.join(p,'commander.json')))['scores'];progress=json.load(open(os.path.join(p,'training-progress.json')))
summary={'training':progress,'waypoint_starting':base,'waypoint_best':best,'commander':command,'deploymentReady':False,'limitation':'Offline CPU model inference plus isolated synthetic Game.step replay; no normal battle, WebLLM conversion, browser inference or performance acceptance.'}
open(os.path.join(p,'summary.json'),'w').write(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print('::notice::LONG_EVALUATION '+json.dumps(summary,ensure_ascii=True,separators=(',',':')))
PY
tar -C "$RUNNER_TEMP/eval-output" -czf "$RUNNER_TEMP/long-evaluation.tar.gz" .
gh release upload "$tag" "$RUNNER_TEMP/long-evaluation.tar.gz" --clobber
