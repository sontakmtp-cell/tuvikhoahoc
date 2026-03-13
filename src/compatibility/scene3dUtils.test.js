import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVisibleComparisonIdsFor3D,
  pickBestPairByNode,
  rankComparisonsFor3D,
} from './scene3dUtils.js';

function comp(id, score, palaceA, palaceB) {
  return {
    comparisonId: id,
    pairScore: score,
    palaceA: { name: palaceA },
    palaceB: { name: palaceB },
  };
}

test('rankComparisonsFor3D should return top 3 positive and top 3 negative', () => {
  const comparisons = [
    comp('c1', 1.5, 'Mệnh', 'Mệnh'),
    comp('c2', 5.2, 'Phu Thê', 'Phu Thê'),
    comp('c3', -4.7, 'Tài Bạch', 'Tài Bạch'),
    comp('c4', 3.1, 'Phúc Đức', 'Phúc Đức'),
    comp('c5', -1.4, 'Tử Tức', 'Tử Tức'),
    comp('c6', -6.2, 'Tật Ách', 'Tật Ách'),
    comp('c7', 2.0, 'Mệnh', 'Phu Thê'),
    comp('c8', -3.2, 'Nô Bộc', 'Nô Bộc'),
  ];

  const ranked = rankComparisonsFor3D(comparisons);

  assert.deepEqual(ranked.strongTop.map((item) => item.comparisonId), ['c2', 'c4', 'c7']);
  assert.deepEqual(ranked.conflictTop.map((item) => item.comparisonId), ['c6', 'c3', 'c8']);
  assert.equal(ranked.activeDefault, 'c2');
});

test('rankComparisonsFor3D should pick strongest abs score when no positive', () => {
  const comparisons = [
    comp('c1', -1.2, 'Mệnh', 'Mệnh'),
    comp('c2', -5.8, 'Phu Thê', 'Phu Thê'),
    comp('c3', -3.0, 'Tài Bạch', 'Tài Bạch'),
  ];
  const ranked = rankComparisonsFor3D(comparisons);
  assert.equal(ranked.activeDefault, 'c2');
});

test('pickBestPairByNode should pick pair with highest absolute score for node', () => {
  const comparisons = [
    comp('c1', 2.2, 'Mệnh', 'Mệnh'),
    comp('c2', -5.5, 'Mệnh', 'Phu Thê'),
    comp('c3', 4.2, 'Phúc Đức', 'Mệnh'),
    comp('c4', -1.1, 'Mệnh', 'Tài Bạch'),
  ];

  const bestA = pickBestPairByNode('A', 'Mệnh', comparisons);
  const bestB = pickBestPairByNode('B', 'Mệnh', comparisons);

  assert.equal(bestA?.comparisonId, 'c2');
  assert.equal(bestB?.comparisonId, 'c3');
});

test('getVisibleComparisonIdsFor3D should respect Strong/Conflict/All filters', () => {
  const comparisons = [
    comp('c1', 4.1, 'Mệnh', 'Mệnh'),
    comp('c2', 2.6, 'Phu Thê', 'Phu Thê'),
    comp('c3', -3.8, 'Tài Bạch', 'Tài Bạch'),
    comp('c4', -1.9, 'Tử Tức', 'Tử Tức'),
  ];
  const ranked = rankComparisonsFor3D(comparisons);

  const strongIds = getVisibleComparisonIdsFor3D({
    comparisons,
    activeId: 'c3',
    filter: 'strong',
    strongTop: ranked.strongTop,
    conflictTop: ranked.conflictTop,
  });
  const conflictIds = getVisibleComparisonIdsFor3D({
    comparisons,
    activeId: 'c1',
    filter: 'conflict',
    strongTop: ranked.strongTop,
    conflictTop: ranked.conflictTop,
  });
  const allIds = getVisibleComparisonIdsFor3D({
    comparisons,
    activeId: 'c2',
    filter: 'all',
    strongTop: ranked.strongTop,
    conflictTop: ranked.conflictTop,
  });

  assert.deepEqual([...strongIds].sort(), ['c1', 'c2', 'c3'].sort());
  assert.deepEqual([...conflictIds].sort(), ['c1', 'c3', 'c4'].sort());
  assert.deepEqual([...allIds].sort(), ['c1', 'c2', 'c3', 'c4'].sort());
});

