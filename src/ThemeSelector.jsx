import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const themes = [
  { id: 'mystical', label: 'Huyền Bí', icon: '✨' },
  { id: 'asian', label: 'Á Đông Cổ Điển', icon: '🏮' },
  { id: 'scifi', label: 'Khoa học Tương Lai', icon: '🌐' }
];

export default function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find(t => t.id === activeTheme) || themes[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button 
        className="theme-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Theme"
      >
        <span className="theme-icon">{currentTheme.icon}</span>
        <span className="theme-label">{currentTheme.label}</span>
        <span className={`theme-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${activeTheme === theme.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTheme(theme.id);
                setIsOpen(false);
              }}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
