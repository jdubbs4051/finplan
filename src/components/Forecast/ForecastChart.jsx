import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from '../../utils/constants.js';
import { calculateAccountForecastWithVariance, calculateAggregatedForecastWithVariance } from '../../utils/calculations.js';
import { useApp } from '../../context/AppContext.jsx';
import './ForecastChart.css';

export function ForecastChart({ forecasts, aggregatedForecast, showAggregated, accounts, profile }) {
  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="forecast-chart-empty">
        <p>No forecast data available. Add accounts and ensure your profile is complete.</p>
      </div>
    );
  }

  // Prepare data for chart
  const prepareChartData = () => {
    if (showAggregated && aggregatedForecast && accounts && profile) {
      // Show individual account lines + variance
      const varianceData = calculateAggregatedForecastWithVariance(accounts, profile);
      const maxYears = Math.max(...forecasts.map(f => f.forecast.length - 1));
      const chartData = [];

      for (let year = 0; year <= maxYears; year++) {
        const dataPoint = { year, age: aggregatedForecast[year]?.age || year };
        
        // Add individual account balances
        forecasts.forEach(({ accountType, forecast }) => {
          if (forecast[year]) {
            dataPoint[accountType] = forecast[year].balance || 0;
          }
        });

        // Add variance scenarios
        if (varianceData.base[year]) {
          dataPoint['Total (Base)'] = varianceData.base[year].balance;
          dataPoint['Total (+2%)'] = varianceData.high[year].balance;
          dataPoint['Total (-2%)'] = varianceData.low[year].balance;
        }

        chartData.push(dataPoint);
      }

      return chartData;
    }

    // Individual account view with variance
    if (!showAggregated && forecasts.length > 0 && accounts && profile) {
      const account = accounts.find(acc => acc.type === forecasts[0].accountType);
      if (account) {
        const varianceData = calculateAccountForecastWithVariance(account, profile);
        const maxYears = varianceData.base.length - 1;
        const chartData = [];

        for (let year = 0; year <= maxYears; year++) {
          chartData.push({
            year,
            age: profile.currentAge + year,
            'Base': varianceData.base[year].balance,
            '+2%': varianceData.high[year].balance,
            '-2%': varianceData.low[year].balance
          });
        }

        return chartData;
      }
    }

    // Fallback: Combine all account forecasts
    const maxYears = Math.max(...forecasts.map(f => f.forecast.length - 1));
    const chartData = [];

    for (let year = 0; year <= maxYears; year++) {
      const dataPoint = { year };
      
      forecasts.forEach(({ accountType, forecast }) => {
        if (forecast[year]) {
          dataPoint[accountType] = forecast[year].balance || 0;
        }
      });

      chartData.push(dataPoint);
    }

    return chartData;
  };

  const chartData = prepareChartData();

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{showAggregated ? `Age ${label}` : `Year ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || '#e5e7eb' }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLines = () => {
    if (showAggregated && accounts && profile) {
      const lines = [];
      
      // Add individual account lines
      forecasts.forEach(({ accountType }) => {
        lines.push(
          <Line
            key={accountType}
            type="monotone"
            dataKey={accountType}
            stroke={ACCOUNT_COLORS[accountType] || '#00b9ff'}
            strokeWidth={2}
            name={ACCOUNT_TYPES[accountType] || accountType}
            dot={false}
          />
        );
      });

      // Add variance lines
      lines.push(
        <Line
          key="base"
          type="monotone"
          dataKey="Total (Base)"
          stroke="#00b9ff"
          strokeWidth={3}
          name="Total (Base)"
          dot={false}
        />,
        <Line
          key="high"
          type="monotone"
          dataKey="Total (+2%)"
          stroke="#00ff88"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Total (+2%)"
          dot={false}
        />,
        <Line
          key="low"
          type="monotone"
          dataKey="Total (-2%)"
          stroke="#ff4444"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Total (-2%)"
          dot={false}
        />
      );

      return lines;
    } else if (!showAggregated && forecasts.length > 0) {
      // Individual account with variance
      return [
        <Line key="base" type="monotone" dataKey="Base" stroke="#00b9ff" strokeWidth={3} name="Base" dot={false} />,
        <Line key="high" type="monotone" dataKey="+2%" stroke="#00ff88" strokeWidth={2} strokeDasharray="5 5" name="+2%" dot={false} />,
        <Line key="low" type="monotone" dataKey="-2%" stroke="#ff4444" strokeWidth={2} strokeDasharray="5 5" name="-2%" dot={false} />
      ];
    } else {
      // Fallback: show individual accounts
      return forecasts.map(({ accountType, accountName }) => (
        <Line
          key={accountType}
          type="monotone"
          dataKey={accountType}
          stroke={ACCOUNT_COLORS[accountType] || '#00b9ff'}
          strokeWidth={2}
          name={accountName || accountType}
          dot={false}
        />
      ));
    }
  };

  return (
    <div className="forecast-chart">
      <h3>{showAggregated ? 'Aggregated Forecast' : 'Account Forecasts'}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={showAggregated ? "age" : "year"} 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            label={{ value: showAggregated ? 'Age' : 'Year', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.375rem' }}
          />
          <Legend wrapperStyle={{ color: '#e5e7eb' }} />
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
