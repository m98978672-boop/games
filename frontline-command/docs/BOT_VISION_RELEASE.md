# Normal-play bot vision: 2026-11-07

The published default was a 110-degree facing cone; a stationary enemy behind a bot could remain unseen. Enable the existing surround sensor for both factions in ordinary play. Its range is unchanged; each target must pass the existing world line-of-sight check, including opaque walls. Hearing and last-known memory are separate; infantry shooting decisions require current contact. There is no new player-facing mode. Config is loaded from the shipped JSON, not restored from player settings or saved matches. The old flag-off path remains available internally for reproducible comparisons.

Verification in this checkout:

- `tests/bot-surround-vision.mjs`: eight directions, both factions, distance, invalid targets, real wall and memory. `tests/bot-surround-step.mjs` executes actual `Game.step` for both factions: behind, moving target, lost LOS, opaque wall and hold fire. Isolated scenes do not represent complete wars.
- `tools/bot-surround-paired.mjs`: 40 paired tests per scene. Rear: contact and shots 0/40 old vs 40/40 new. Front: 40/40 both. Opaque HQ wall at close range: old incorrectly detects/shoots 40/40, new 0/40. Open LOS is mocked in the front/rear scenes; the HQ wall is real.
- `tools/bot-surround-combat-paired.mjs`: 20 same-seed 30-second pairs with normal systems, one symmetric placement; old/new shots 537/632, contact samples 659/803. No wars ended. This is descriptive only, not evidence of improved win rate, balance, or effectiveness; decision changes cause RNG streams to diverge.
- Full `npm test` passed including symmetry and duel tests. Simulation-only performance: 392 units 11.65 ms/tick, 400 units 13.60 ms/tick, 500 units 18.27 ms/tick on this machine. Not a browser frame-rate guarantee. Chromium tests passed for actual config, explicit legacy fallback, and live game reload/memory.

Known limitations: sensing updates at the existing LOD think frequency; infantry with a target beyond weapon range may follow its existing orders rather than close in, and medics/engineers retain their existing support priorities. This change alone is not a general intelligence upgrade. The separately running model training is not used by this feature.
