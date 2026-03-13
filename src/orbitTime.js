/**
 * Shared orbit time module.
 * Single source of truth for orbital time, used by both
 * Planet components and ConnectionLines to stay perfectly in sync.
 *
 * Time accumulates only when not paused.
 */

let _orbitTime = 0;
let _lastClock = 0;

export function getOrbitTime() {
  return _orbitTime;
}

export function updateOrbitTime(clockElapsed, paused) {
  const dt = clockElapsed - _lastClock;
  _lastClock = clockElapsed;
  if (!paused && dt > 0 && dt < 1) { // guard against huge dt on first frame
    _orbitTime += dt;
  }
}
