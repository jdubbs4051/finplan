import { useState } from 'react';
import './Navigation.css';

export function Navigation({ currentView, onViewChange }) {
  const views = [
    { id: 'profile', label: 'Profile' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'forecast', label: 'Forecast' }
  ];

  return (
    <nav className="app-navigation">
      {views.map(view => (
        <button
          key={view.id}
          className={`nav-button ${currentView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
}
