import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { calculateAccountForecast, calculateAggregatedForecast } from '../../utils/calculations.js';
import { ForecastChart } from './ForecastChart.jsx';
import { ForecastTable } from './ForecastTable.jsx';
import './AggregatedView.css';

export function AggregatedView() {
  const { profile, accounts } = useApp();
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

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

  // Prepare forecast data for chart
  const forecasts = accounts.map(account => ({
    accountType: account.type,
    accountName: account.name || account.type,
    forecast: calculateAccountForecast(account, profile)
  }));

  const aggregatedForecast = calculateAggregatedForecast(accounts, profile);

  return (
    <div className="aggregated-view">
      <div className="view-header">
        <h2>Aggregated Forecast</h2>
        <div className="view-toggle">
          <button
            className={viewMode === 'chart' ? 'active' : ''}
            onClick={() => setViewMode('chart')}
          >
            Chart
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <ForecastChart
          forecasts={forecasts}
          aggregatedForecast={aggregatedForecast}
          showAggregated={true}
          accounts={accounts}
          profile={profile}
        />
      ) : (
        <ForecastTable showAggregated={true} />
      )}

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
    </div>
  );
}
