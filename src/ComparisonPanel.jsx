import { memo, useState, useCallback } from 'react';

const ScoreBar = memo(function ScoreBar({ label, score, weight, detail, subLabel }) {
  const barColor = score >= 70 ? '#00dd66' : score >= 40 ? '#ffaa00' : '#ff4444';
  
  return (
    <div className="score-row">
      <div className="score-header">
        <span className="score-label">{label}</span>
        <span className="score-weight">({weight})</span>
        <span className="score-value" style={{ color: barColor }}>{score}/100</span>
      </div>
      <div className="score-bar-bg">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="score-detail">
        {subLabel && <span className="score-sublabel">{subLabel}</span>}
        {detail && <span className="score-detail-text">{detail}</span>}
      </div>
    </div>
  );
});

export default memo(function ComparisonPanel({ result, metaA, metaB }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed(c => !c), []);

  if (!result) return null;

  const { finalScore, breakdown, verdict } = result;
  const ringColor = finalScore >= 70 ? '#00dd66' : finalScore >= 40 ? '#ffaa00' : '#ff4444';

  return (
    <div className={`comparison-panel ${collapsed ? 'collapsed' : ''}`}>
      <button className="panel-toggle" onClick={toggle}>
        {collapsed ? '📊 Mở' : '✕'}
      </button>

      {!collapsed && (
        <>
          <div className="panel-header">
            <h2>Kết Quả Tương Hợp</h2>
            <p className="panel-names">
              <span style={{ color: '#66aaff' }}>{metaA?.name}</span>
              {' '}⚡{' '}
              <span style={{ color: '#ff66aa' }}>{metaB?.name}</span>
            </p>
          </div>

          {/* Vòng tròn điểm tổng */}
          <div className="total-score-ring">
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#333" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeDasharray={`${finalScore * 3.27} 327`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="55" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
                {finalScore}
              </text>
              <text x="60" y="75" textAnchor="middle" fill="#aaa" fontSize="11">
                / 100
              </text>
            </svg>
            <p className="verdict">{verdict}</p>
          </div>

          {/* Chi tiết 5 tầng */}
          <div className="breakdown">
            <ScoreBar
              label="🌊 Ngũ Hành Nạp Âm"
              score={breakdown.nguHanh.score}
              weight={breakdown.nguHanh.weight}
              subLabel={breakdown.nguHanh.label}
              detail={breakdown.nguHanh.detail}
            />
            <ScoreBar
              label="🐉 Địa Chi Cung Mệnh"
              score={breakdown.diaChi.score}
              weight={breakdown.diaChi.weight}
              subLabel={breakdown.diaChi.label}
              detail={breakdown.diaChi.detail}
            />
            <ScoreBar
              label="💍 Phu Thê Chéo"
              score={breakdown.phuTheCheo.score}
              weight={breakdown.phuTheCheo.weight}
              subLabel={breakdown.phuTheCheo.label}
            />
            <ScoreBar
              label="⭐ Chính Tinh Đối Chiếu"
              score={breakdown.chinhTinh.score}
              weight={breakdown.chinhTinh.weight}
              subLabel={breakdown.chinhTinh.label}
            />
            <ScoreBar
              label="💀 Sát Tinh Chéo"
              score={breakdown.satTinh.score}
              weight={breakdown.satTinh.weight}
              subLabel={breakdown.satTinh.label}
            />
          </div>
        </>
      )}
    </div>
  );
});
