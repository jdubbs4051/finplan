import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { calculateAccountForecast, calculateAggregatedForecast } from '../../utils/calculations.js';
import { ForecastChart } from './ForecastChart.jsx';
import { ForecastTable } from './ForecastTable.jsx';
import { ACCOUNT_TYPES } from '../../utils/constants.js';
import './AggregatedView.css';

export function AggregatedView() {
  const { profile, accounts } = useApp();
  const [visibleAccounts, setVisibleAccounts] = useState({});

  // Initialize visible accounts when accounts change
  useEffect(() => {
    const initial = {};
    accounts.forEach(acc => {
      // Preserve existing visibility state if account already exists, otherwise default to true
      initial[acc.id] = visibleAccounts[acc.id] !== undefined ? visibleAccounts[acc.id] : true;
    });
    setVisibleAccounts(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.map(acc => acc.id).join(',')]); // Re-run when account IDs change

  if (!profile) {
    return (
      <div className="aggregated-view-empty">
        <p>Please complete your profile to view aggregated forecasts.</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="aggregated-view-empty">
        <p>Add accounts to see aggregated forecasts.</p>
      </div>
    );
  }

  // Filter accounts based on visibility
  const visibleAccountsList = accounts.filter(acc => visibleAccounts[acc.id] !== false);
  
  // Prepare forecast data for chart
  const forecasts = visibleAccountsList.map(account => ({
    accountType: account.type,
    accountName: account.name || account.type,
    forecast: calculateAccountForecast(account, profile)
  }));

  const aggregatedForecast = calculateAggregatedForecast(visibleAccountsList, profile);

  const toggleAccount = (accountId) => {
    setVisibleAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  return (
    <div className="aggregated-view">
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{accounts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Total Balance</div>
          <div className="stat-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(accounts.reduce((sum, acc) => sum + acc.currentBalance, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Total Contributions</div>
          <div className="stat-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(accounts.reduce((sum, acc) => sum + acc.monthlyContribution, 0))}
          </div>
        </div>
        {aggregatedForecast.length > 0 && (
          <div className="stat-card highlight">
            <div className="stat-label">Projected Balance at Retirement</div>
            <div className="stat-value">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(aggregatedForecast[aggregatedForecast.length - 1]?.balance || 0)}
            </div>
          </div>
        )}
      </div>

      <div className="view-header">
        <h2>Aggregated Forecast</h2>
        <div className="account-toggles">
          <span className="toggle-label">Show/Hide Accounts:</span>
          {accounts.map(account => (
            <label key={account.id} className="account-toggle">
              <input
                type="checkbox"
                checked={visibleAccounts[account.id] !== false}
                onChange={() => toggleAccount(account.id)}
              />
              <span>{account.nickname || ACCOUNT_TYPES[account.type] || account.type}</span>
            </label>
          ))}
        </div>
      </div>

      <ForecastChart
        forecasts={forecasts}
        aggregatedForecast={aggregatedForecast}
        showAggregated={true}
        accounts={visibleAccountsList}
        profile={profile}
      />
      
      <ForecastTable showAggregated={true} accounts={visibleAccountsList} />
    </div>
  );
}
