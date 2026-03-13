import React, { useMemo } from 'react';

const SIZE = 360;
const CENTER = SIZE / 2;
const MAX_RADIUS = 132;
const LEVELS = 5;

function toRadius(percent) {
  return (percent / 100) * MAX_RADIUS;
}

function toValuePercent(pairScore) {
  return Math.max(0, Math.min(100, ((pairScore + 10) / 20) * 100));
}

function toWeightedPercent(item) {
  const weighted = item.pairScore * item.weight;
  return Math.max(0, Math.min(100, ((weighted + 10) / 20) * 100));
}

function pointAt(angle, radius) {
  const x = CENTER + (Math.cos(angle) * radius);
  const y = CENTER + (Math.sin(angle) * radius);
  return { x, y };
}

function polygonPath(comparisons, getPercent) {
  if (!comparisons.length) return '';
  return comparisons.map((item, idx) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * idx) / comparisons.length);
    const r = toRadius(getPercent(item));
    const { x, y } = pointAt(angle, r);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function shortLabel(item) {
  if (item.palaceA.name === item.palaceB.name) return item.palaceA.name;
  return `${item.palaceA.name}/${item.palaceB.name}`;
}

export default function CompatibilityRadar({ comparisons = [] }) {
  const gridPaths = useMemo(() => {
    if (!comparisons.length) return [];
    const lines = [];

    for (let level = 1; level <= LEVELS; level += 1) {
      const radius = (MAX_RADIUS * level) / LEVELS;
      const points = comparisons.map((_, idx) => {
        const angle = (-Math.PI / 2) + ((Math.PI * 2 * idx) / comparisons.length);
        const p = pointAt(angle, radius);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      }).join(' ');
      lines.push(points);
    }
    return lines;
  }, [comparisons]);

  const axisLines = useMemo(() => (
    comparisons.map((item, idx) => {
      const angle = (-Math.PI / 2) + ((Math.PI * 2 * idx) / comparisons.length);
      const outer = pointAt(angle, MAX_RADIUS);
      const label = pointAt(angle, MAX_RADIUS + 24);
      return {
        id: item.comparisonId,
        x2: outer.x,
        y2: outer.y,
        lx: label.x,
        ly: label.y,
        text: shortLabel(item),
      };
    })
  ), [comparisons]);

  const basePolygon = useMemo(
    () => polygonPath(comparisons, (item) => toValuePercent(item.pairScore)),
    [comparisons],
  );

  const weightedPolygon = useMemo(
    () => polygonPath(comparisons, (item) => toWeightedPercent(item)),
    [comparisons],
  );

  if (!comparisons.length) return null;

  return (
    <section className="compat-radar-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="compat-radar-svg" role="img" aria-label="Radar tương hợp">
        {gridPaths.map((points, idx) => (
          <polygon key={`grid-${idx + 1}`} points={points} className="radar-grid" />
        ))}

        {axisLines.map((line) => (
          <line
            key={`axis-${line.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={line.x2}
            y2={line.y2}
            className="radar-axis"
          />
        ))}

        <polygon points={weightedPolygon} className="radar-shape weighted" />
        <polygon points={basePolygon} className="radar-shape base" />

        {axisLines.map((line) => (
          <text
            key={`label-${line.id}`}
            x={line.lx}
            y={line.ly}
            className="radar-label"
            textAnchor="middle"
          >
            {line.text}
          </text>
        ))}
      </svg>

      <div className="radar-legend">
        <span><i className="legend-dot base" /> Điểm cặp cung</span>
        <span><i className="legend-dot weighted" /> Điểm sau trọng số</span>
      </div>
    </section>
  );
}

