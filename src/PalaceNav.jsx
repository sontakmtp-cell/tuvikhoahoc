import React from 'react';

const elementColors = {
  "Kim": "#F5C842",
  "Mộc": "#2ECC71",
  "Thủy": "#3498DB",
  "Hỏa": "#E74C3C",
  "Thổ": "#D4A574"
};

export default function PalaceNav({ palaces, focusedId, onSelect }) {
  return (
    <nav id="palace-nav" className="palace-nav">
      <div className="nav-title">CUNG</div>
      {palaces.map((p) => {
        const color = elementColors[p.element] || "#fff";
        const isActive = focusedId === p.id;
        return (
          <button
            key={p.id}
            className={`nav-item ${isActive ? 'nav-active' : ''}`}
            style={{ '--dot-color': color }}
            onClick={() => onSelect(p.id)}
            title={`Cung ${p.name} (${p.element})`}
          >
            <span className="nav-dot" />
            <span className="nav-label">{p.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
