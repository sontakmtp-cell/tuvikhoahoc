import React from 'react';

const MODES = [
  { id: 'romance', icon: '💕', label: 'Tình Duyên', description: 'Ưu tiên các cung liên quan cảm xúc, hôn nhân, gia đạo.' },
  { id: 'business', icon: '💼', label: 'Làm Ăn', description: 'Ưu tiên phong cách hợp tác, tài chính và vận công việc.' },
];

export default function ModeSelector({ mode, onChange }) {
  const activeMode = MODES.find((item) => item.id === mode) || MODES[0];

  return (
    <section className="compat-section">
      <h3 className="compat-section-title">2) Chọn chế độ so sánh</h3>
      <div className="mode-switch">
        <div className={`mode-switch-indicator ${mode === 'business' ? 'at-business' : ''}`} />
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mode-switch-btn ${mode === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="mode-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <p className="compat-muted">{activeMode.description}</p>
    </section>
  );
}
