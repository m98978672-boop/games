// Diagnostic measurement helper. Samples live unit counts; it never creates,
// removes, revives, or prevents spawning of units. Its own cost affects FPS.
export function createPopulationMonitor(target, initial, { requireFrames = true } = {}) {
  if (!Number.isSafeInteger(target) || target <= 0 || !Number.isSafeInteger(initial) || initial < 0) throw Error('invalid population target/initial');
  if (typeof requireFrames !== 'boolean') throw Error('invalid frame requirement');
  let minAlive = Infinity, maxAlive = -Infinity, samples = 0, before = 0, after = 0, frames = 0, firstOutside2Percent = null;
  function observe(alive, phase) {
    if (!Number.isSafeInteger(alive) || alive < 0 || !['start', 'before-step', 'after-step', 'frame'].includes(phase)) throw Error('invalid population observation');
    minAlive = Math.min(minAlive, alive); maxAlive = Math.max(maxAlive, alive); samples++;
    if (phase === 'before-step') before++;
    if (phase === 'after-step') after++;
    if (phase === 'frame') frames++;
    if (firstOutside2Percent === null && Math.abs(alive - target) > target * 0.02) firstOutside2Percent = { sample: samples, phase, alive };
  }
  function summary() {
    const covered = samples > 0 && before > 0 && before === after && (!requireFrames || frames > 0);
    return { target, initial, frameRequired: requireFrames, samples, beforeStepSamples: before, afterStepSamples: after, frameSamples: frames,
      minAlive: samples ? minAlive : null, maxAlive: samples ? maxAlive : null, firstOutside2Percent,
      strictExact: covered && initial === target && minAlive === target && maxAlive === target,
      within2Percent: covered && initial === target && firstOutside2Percent === null };
  }
  return { observe, summary };
}
