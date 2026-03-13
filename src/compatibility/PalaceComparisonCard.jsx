import React, { useMemo, useState } from 'react';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getScoreTone(score) {
  if (score >= 5) return 'good';
  if (score >= 0) return 'ok';
  if (score >= -5) return 'warn';
  return 'bad';
}

export default function PalaceComparisonCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  const scorePercent = useMemo(() => (
    clamp(((item.pairScore + 10) / 20) * 100, 0, 100)
  ), [item.pairScore]);

  const tone = getScoreTone(item.pairScore);
  const specialPairs = item.starResult?.specialPairs || [];
  const commonStars = item.starResult?.commonStars || [];

  return (
    <article className={`pair-card tone-${tone}`}>
      <div className="pair-card-top">
        <h4>
          {item.palaceA.name} ↔ {item.palaceB.name}
        </h4>
        <span className="pair-score-chip">{item.pairScore.toFixed(1)}/10</span>
      </div>

      <div className="pair-score-track">
        <div className="pair-score-fill" style={{ width: `${scorePercent}%` }} />
      </div>

      <p className="pair-meta">
        <span>{item.elementResult?.label || 'Không rõ hành'}</span>
        <span>Sao trùng: {commonStars.length}</span>
        <span>Trọng số: {item.weight}</span>
      </p>

      {specialPairs.length > 0 && (
        <p className="pair-special">
          ★ {specialPairs.slice(0, 2).map((pair) => pair.label).join(' • ')}
        </p>
      )}

      <button
        type="button"
        className="pair-expand-btn"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
      </button>

      {expanded && (
        <div className="pair-expand-content">
          <p className="pair-description">{item.description}</p>
          <p className="pair-interpretation">{item.interpretation}</p>
          {commonStars.length > 0 && (
            <p className="pair-extra">
              Sao đồng vị: {commonStars.slice(0, 6).join(', ')}
              {commonStars.length > 6 ? ', ...' : ''}
            </p>
          )}
          {item.crossResult?.details?.length > 0 && (
            <p className="pair-extra">
              Tương tác chéo: {item.crossResult.details.slice(0, 2).join(' | ')}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

