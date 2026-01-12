import { useApp } from '../../context/AppContext.jsx';
import { calculateAccountForecast, calculateAggregatedForecast } from '../../utils/calculations.js';
import './ForecastTable.css';

export function ForecastTable({ account, showAggregated }) {
  const { profile, accounts } = useApp();

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

  let forecastData = [];

  if (showAggregated) {
    if (!accounts || accounts.length === 0) {
      return (
        <div className="forecast-table-empty">
          <p>Add accounts to see aggregated forecast.</p>
        </div>
      );
    }
    forecastData = calculateAggregatedForecast(accounts, profile);
  } else if (account) {
    forecastData = calculateAccountForecast(account, profile);
  } else {
    return (
      <div className="forecast-table-empty">
        <p>Select an account to view its forecast.</p>
      </div>
    );
  }

  if (forecastData.length === 0) {
    return (
      <div className="forecast-table-empty">
        <p>No forecast data available.</p>
      </div>
    );
  }

  return (
    <div className="forecast-table">
      <h3>{showAggregated ? 'Aggregated Forecast' : 'Account Forecast'}</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              {showAggregated && <th>Age</th>}
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
                  {showAggregated && <td>{row.age}</td>}
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
