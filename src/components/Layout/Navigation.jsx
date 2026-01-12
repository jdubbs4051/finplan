import { useState } from 'react';
import './Navigation.css';

export function Navigation({ currentView, onViewChange }) {
  const views = [
    { id: 'profile', label: 'Profile', emoji: '👤' },
    { id: 'accounts', label: 'Accounts', emoji: '💼' },
    { id: 'forecast', label: 'Forecast', emoji: '📊' }
  ];

  return (
    <nav className="app-navigation">
      <div className="nav-icon-placeholder">
        {/* Icon placeholder - replace with your logo/icon */}
      </div>
      {views.map(view => (
        <button
          key={view.id}
          className={`nav-button ${currentView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
        >
          <span className="nav-emoji">{view.emoji}</span>
          <span className="nav-label">{view.label}</span>
        </button>
      ))}
    </nav>
  );
}
