# Balanced commander training (offline only)

This is not a new game mode and does not change the running game or the
separate 15-hour run. The command-model snapshot is frozen from the latest
uploaded checkpoint, so the two runs cannot overwrite one another.

## Why

The original side-isolated commander data had 300 training observations and
its simple teacher tends to pick squad zero. The new collector starts with
snapshots captured from normal simulation games, then deterministically permutes
squad/point/build lists and removes lists to provide counterfactual cases. It
recalculates and validates every teacher proposal using the same game parser,
removes duplicate inputs across splits, and uses different simulation seeds
for train, development and final test. These permutations do not represent new
battles. The teacher is a simple rule, not an expert or a strategic oracle.

The model chooses an action type by comparing four action-token logits. A
side-neutral deterministic filter masks impossible actions and fills the first
legal squad/point/build indexes. This guarantees formatting and rejects
unsupported actions but the argument choice comes from the filter, not the
neural network. The objective uses only one action token rather than a full
free-form answer, and examples are sampled by teacher action instead of raw
frequency. This is **not directly comparable** to unconstrained WebLLM text.

The structured trainer checks base-weight and dataset hashes, trains a copied
adapter, picks the trained adapter only if exact teacher imitation on dev is
strictly better, and compares that choice with the starting adapter on separate
test seeds. The test report contains the raw side-isolated inputs and
predictions so the actual game validator can check every result. A small action
sample or format validity does not establish stronger combat. Reserved tests
from the 15-hour run remain separate. A normal battle, original unscripted
browser model, physics/latency and both-faction performance would still need
evaluation before any production integration.

The run uses twelve training examples, not the whole augmented set; the count
of generated counterfactuals must never be described as thousands of real wars
or thousands of model-training steps. Weights are research outputs only and
are not wired into the game.
