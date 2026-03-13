function absScore(item) {
  return Math.abs(item?.pairScore || 0);
}

function byScoreDesc(a, b) {
  return (b?.pairScore || 0) - (a?.pairScore || 0);
}

function byScoreAsc(a, b) {
  return (a?.pairScore || 0) - (b?.pairScore || 0);
}

function byAbsScoreDesc(a, b) {
  return absScore(b) - absScore(a);
}

export function rankComparisonsFor3D(comparisons = []) {
  const safe = Array.isArray(comparisons) ? comparisons : [];
  const strongTop = safe
    .filter((item) => (item?.pairScore || 0) > 0)
    .sort(byScoreDesc)
    .slice(0, 3);

  const conflictTop = safe
    .filter((item) => (item?.pairScore || 0) < 0)
    .sort(byScoreAsc)
    .slice(0, 3);

  let activeDefault = null;
  if (strongTop.length > 0) {
    activeDefault = strongTop[0].comparisonId;
  } else if (safe.length > 0) {
    activeDefault = [...safe].sort(byAbsScoreDesc)[0].comparisonId;
  }

  return {
    strongTop,
    conflictTop,
    activeDefault,
  };
}

function matchSide(item, side, palaceName) {
  if (!item || !palaceName) return false;
  if (side === 'A') return item.palaceA?.name === palaceName;
  if (side === 'B') return item.palaceB?.name === palaceName;
  return false;
}

export function pickBestPairByNode(side, palaceName, comparisons = []) {
  const safe = Array.isArray(comparisons) ? comparisons : [];
  const candidates = safe.filter((item) => matchSide(item, side, palaceName));
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => {
    const absDiff = absScore(b) - absScore(a);
    if (absDiff !== 0) return absDiff;
    return byScoreDesc(a, b);
  })[0];
}

export function getVisibleComparisonIdsFor3D({
  comparisons = [],
  activeId = null,
  filter = 'all',
  strongTop = [],
  conflictTop = [],
}) {
  const safe = Array.isArray(comparisons) ? comparisons : [];
  const ids = new Set();

  if (activeId) {
    ids.add(activeId);
  }

  if (filter === 'strong' || filter === 'all') {
    strongTop.forEach((item) => ids.add(item.comparisonId));
  }
  if (filter === 'conflict' || filter === 'all') {
    conflictTop.forEach((item) => ids.add(item.comparisonId));
  }

  if (ids.size === 0 && safe.length > 0) {
    ids.add(safe[0].comparisonId);
  }

  return ids;
}

