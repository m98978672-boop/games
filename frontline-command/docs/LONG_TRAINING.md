# Long model-training pipeline

This is offline research tooling, not a playable feature. The public game does
not load these weights. A model trained here must not replace the existing
commander or wall-routing code without independent safety, battle, browser,
performance and conversion checks.

## Data and limits

`collect-long-training.mjs` makes train/dev/test splits. The waypoint task
contains Game.step-validated synthetic U-shaped obstacle scenes with varied
geometry, seeds and sides; labels choose one of two waypoint candidates, not a
complete path or combat strategy. The commander task records side-isolated
normal-game snapshots for both factions, labeled by the existing simple
heuristic (hold, build, supply); these are not expert human demonstrations.
Test seeds, geometry and observations are checked for overlap. Duplicates are
removed. The complete generated manifest and dataset are stored with each run.

`train-long.py` starts from the earlier obstacle adapter, mixes waypoint and
commander examples, and selects the best adapter using only dev data. It counts
only forward/backward/optimizer time, not model downloads, evaluation or
checkpoint uploads. Three stages request 18,000 active seconds apiece.
Checkpoints include model adapter, optimizer, random states, dataset digest,
phase and active-time counters. They are uploaded in alternating slots, and
completed stages are also saved. A failed stage needs a GitHub Actions job
rerun; resumption is from the newest successfully uploaded slot and any work
since it is lost. If runner time limits prevent 5 active hours in one attempt,
rerunning the failed job can continue it. Only load trusted checkpoints.

After all stages, the evaluation job compares the best adapter, its starting
adapter, base model and standard route algorithm on the 48 unseen waypoint
scenes, with physical Game.step replay and wall-crossing counts. It also scores
free-form base and adapter output with the game's command validator on eight
unseen commander snapshots. This is a limited offline test, not a real match,
not a test of all tactics, and not WebLLM or GPU validation. Duration alone
cannot establish that the model is smarter.

The workflow first runs a short staged-training and checkpoint-resumption
smoke test. Preparation and the long stages only start if it passes. The GitHub
run is successful only if that test, preparation, all three training stages,
and evaluation succeed. The release contains `long-dataset.tar.gz`, checkpoint
archives and finally `long-evaluation.tar.gz`; check the progress JSON for the
actual active seconds and the evaluation summary for results. The release and
checkpoints are research outputs and are not published into the game.

### Recovery for run 44671482687

If that run stops unsuccessfully, do not start another trainer while it is still
running. A separate, dormant recovery workflow can continue the same release
with the same optimizer, counters and data. Trigger it on the working branch by
changing and committing `tools/training/start-recovery.flag` and pushing the
branch. Its guard checks the original run has completed unsuccessfully; a smoke
test checks resumption and partial snapshots. Each five-hour phase is now split
into two jobs with up to 2.5 active hours apiece. A partial job saves a regular
checkpoint but does not claim the phase has completed; the second job must verify
completion before the next phase starts. It skips already completed phases,
resumes the newest checkpoint and eventually evaluates. If a recovery attempt
still fails or times out, it can be triggered again, after confirming the
previous recovery has stopped. Its concurrency group prevents parallel recovery
jobs from writing to the same release. The workflow is not running unless
explicitly triggered.
