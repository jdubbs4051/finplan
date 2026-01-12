import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { calculateAccountForecast, calculateAggregatedForecast } from '../../utils/calculations.js';
import { ACCOUNT_TYPES } from '../../utils/constants.js';
import './ForecastTable.css';

export function ForecastTable({ account, showAggregated, accounts: providedAccounts }) {
  const { profile, accounts: contextAccounts } = useApp();
  const accounts = providedAccounts || contextAccounts;

  if (!profile) {
    return (
      <div className="forecast-table-empty">
        <p>Please complete your profile to view forecasts.</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // If not aggregated view, use old single account display
  if (!showAggregated && account) {
    const forecastData = calculateAccountForecast(account, profile);
    
    if (forecastData.length === 0) {
      return (
        <div className="forecast-table-empty">
          <p>No forecast data available.</p>
        </div>
      );
    }

    return (
      <div className="forecast-table">
        <h3>Account Forecast</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Starting Balance</th>
                <th>Contributions</th>
                <th>Interest</th>
                <th>Growth</th>
                <th>Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((row, index) => {
                const prevBalance = index > 0 ? forecastData[index - 1].balance : row.balance - row.contributions - row.growth;
                return (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{formatCurrency(prevBalance)}</td>
                    <td>{formatCurrency(row.contributions)}</td>
                    <td>{formatCurrency(row.interest || 0)}</td>
                    <td>{formatCurrency(row.growth)}</td>
                    <td className="ending-balance">{formatCurrency(row.balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Aggregated view - show individual accounts grouped by type
  if (showAggregated) {
    if (!accounts || accounts.length === 0) {
      return (
        <div className="forecast-table-empty">
          <p>Add accounts to see aggregated forecast.</p>
        </div>
      );
    }

    // Calculate forecasts for each account
    const accountForecasts = accounts.map(acc => ({
      account: acc,
      forecast: calculateAccountForecast(acc, profile)
    }));

    if (accountForecasts.length === 0 || accountForecasts[0].forecast.length === 0) {
      return (
        <div className="forecast-table-empty">
          <p>No forecast data available.</p>
        </div>
      );
    }

    // Group accounts by type
    const accountsByType = {};
    accountForecasts.forEach(({ account, forecast }) => {
      if (!accountsByType[account.type]) {
        accountsByType[account.type] = [];
      }
      accountsByType[account.type].push({ account, forecast });
    });

    // Get max years across all forecasts (should be consistent since all use retirement age + 20)
    const maxYears = Math.max(...accountForecasts.map(({ forecast }) => forecast.length - 1));

    // Get account display name
    const getAccountName = (acc) => {
      return acc.nickname || `${ACCOUNT_TYPES[acc.type]} ${accountsByType[acc.type].findIndex(a => a.account.id === acc.id) + 1}`;
    };

    return (
      <div className="forecast-table">
        <h3>Individual Account Forecasts</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th rowSpan="3">Year</th>
                <th rowSpan="3">Age</th>
                {Object.entries(accountsByType).map(([type, typeAccounts]) => (
                  <th key={type} colSpan={typeAccounts.length * 5} className="account-type-header">
                    {ACCOUNT_TYPES[type]}
                  </th>
                ))}
              </tr>
              <tr>
                {Object.entries(accountsByType).map(([type, typeAccounts]) =>
                  typeAccounts.map(({ account }) => (
                    <th key={account.id} colSpan="5" className="account-name-header">
                      {getAccountName(account)}
                    </th>
                  ))
                )}
              </tr>
              <tr>
                {Object.entries(accountsByType).map(([type, typeAccounts]) =>
                  typeAccounts.map(({ account }) => (
                    <React.Fragment key={account.id}>
                      <th className="account-column-header">Start</th>
                      <th className="account-column-header">Contrib</th>
                      <th className="account-column-header">Interest</th>
                      <th className="account-column-header">Growth</th>
                      <th className="account-column-header">End</th>
                    </React.Fragment>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxYears + 1 }, (_, year) => {
                // Get age from first forecast (all should have same age for same year)
                const age = accountForecasts[0]?.forecast[year]?.age || (profile.currentAge + year);
                return (
                  <tr key={year}>
                    <td>{year}</td>
                    <td>{age}</td>
                    {Object.entries(accountsByType).map(([type, typeAccounts]) =>
                      typeAccounts.map(({ account, forecast }) => {
                        const yearData = forecast[year];
                        if (!yearData) {
                          return (
                            <React.Fragment key={account.id}>
                              <td>-</td>
                              <td>-</td>
                              <td>-</td>
                              <td>-</td>
                              <td>-</td>
                            </React.Fragment>
                          );
                        }
                        const prevBalance = year > 0 && forecast[year - 1] 
                          ? forecast[year - 1].balance 
                          : yearData.balance - yearData.contributions - yearData.growth;
                        return (
                          <React.Fragment key={account.id}>
                            <td>{formatCurrency(prevBalance)}</td>
                            <td>{formatCurrency(yearData.contributions)}</td>
                            <td>{formatCurrency(yearData.interest || 0)}</td>
                            <td>{formatCurrency(yearData.growth)}</td>
                            <td className="ending-balance">{formatCurrency(yearData.balance)}</td>
                          </React.Fragment>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="forecast-table-empty">
      <p>Select an account to view its forecast.</p>
    </div>
  );
}
