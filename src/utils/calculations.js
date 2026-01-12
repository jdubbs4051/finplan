import { IRS_401K_LIMIT_UNDER_50, IRS_401K_LIMIT_50_PLUS } from './constants.js';

/**
 * Calculate 401k forecast with company match
 */
export function calculate401kForecast(account, profile, variance = 0) {
  const results = [];
  let balance = account.currentBalance;
  const adjustedRate = account.rateOfReturn + variance;
  const monthlyRate = adjustedRate / 100 / 12;
  let currentSalary = profile.currentSalary;
  const salaryGrowthRate = profile.salaryGrowthRate / 100;

  for (let year = 0; year <= account.timeHorizon; year++) {
    let yearContributions = 0;
    let yearInterest = 0;
    const startBalance = balance;

    // Calculate monthly contributions and match
    for (let month = 0; month < 12 && year < account.timeHorizon; month++) {
      const monthlyContribution = account.monthlyContribution;
      let companyMatch = 0;

      if (account.hasCompanyMatch) {
        const maxMatchableContribution = (currentSalary * account.matchUpToPercentage / 100) / 12;
        const matchableAmount = Math.min(monthlyContribution, maxMatchableContribution);
        companyMatch = matchableAmount * (account.matchPercentage / 100);
      }

      const totalMonthlyContribution = monthlyContribution + companyMatch;
      const balanceBeforeGrowth = balance + totalMonthlyContribution;
      balance += totalMonthlyContribution;
      yearContributions += totalMonthlyContribution;

      // Calculate interest earned this month
      const monthlyInterest = balance * monthlyRate;
      yearInterest += monthlyInterest;

      // Apply monthly growth
      balance *= (1 + monthlyRate);
    }

    const yearGrowth = balance - startBalance - yearContributions;

    results.push({
      year,
      age: profile.currentAge + year,
      balance: balance,
      contributions: yearContributions,
      interest: yearInterest,
      growth: yearGrowth,
      total: balance
    });

    // Update salary for next year
    if (year < account.timeHorizon) {
      currentSalary *= (1 + salaryGrowthRate);
    }
  }

  return results;
}

/**
 * Calculate dividend account forecast
 */
export function calculateDividendForecast(account, variance = 0) {
  const results = [];
  let balance = account.currentBalance;
  const adjustedGrowthRate = account.underlyingAssetGrowth + variance;
  const monthlyGrowthRate = adjustedGrowthRate / 100 / 12;
  const annualYield = account.expectedYield / 100;

  for (let year = 0; year <= account.timeHorizon; year++) {
    let yearContributions = 0;
    let yearInterest = 0;
    const startBalance = balance;

    for (let month = 0; month < 12 && year < account.timeHorizon; month++) {
      // Add monthly contribution
      balance += account.monthlyContribution;
      yearContributions += account.monthlyContribution;

      // Calculate interest from underlying asset growth
      const growthInterest = balance * monthlyGrowthRate;
      yearInterest += growthInterest;
      balance *= (1 + monthlyGrowthRate);

      // Apply dividend yield (monthly)
      const monthlyYield = annualYield / 12;
      if (account.dripEnabled) {
        // DRIP: reinvest dividends (compound into balance)
        const dividendInterest = balance * monthlyYield;
        yearInterest += dividendInterest;
        balance *= (1 + monthlyYield);
      }
      // If DRIP disabled, dividends are paid out and don't affect balance
    }

    const yearGrowth = balance - startBalance - yearContributions;

    results.push({
      year,
      balance: balance,
      contributions: yearContributions,
      interest: yearInterest,
      growth: yearGrowth,
      total: balance
    });
  }

  return results;
}

/**
 * Calculate HYSA forecast
 */
export function calculateHYSAForecast(account, variance = 0) {
  const results = [];
  let balance = account.currentBalance;
  const adjustedAPY = account.apy + variance;
  const monthlyRate = adjustedAPY / 100 / 12;

  for (let year = 0; year <= account.timeHorizon; year++) {
    let yearContributions = 0;
    let yearInterest = 0;
    const startBalance = balance;

    for (let month = 0; month < 12 && year < account.timeHorizon; month++) {
      balance += account.monthlyContribution;
      yearContributions += account.monthlyContribution;
      
      // Calculate interest earned this month
      const monthlyInterest = balance * monthlyRate;
      yearInterest += monthlyInterest;
      
      balance *= (1 + monthlyRate);
    }

    const yearGrowth = balance - startBalance - yearContributions;

    results.push({
      year,
      balance: balance,
      contributions: yearContributions,
      interest: yearInterest,
      growth: yearGrowth,
      total: balance
    });
  }

  return results;
}

/**
 * Calculate brokerage account forecast
 */
export function calculateBrokerageForecast(account, variance = 0) {
  const results = [];
  let balance = account.currentBalance;
  const adjustedRate = account.expectedReturnRate + variance;
  const monthlyRate = adjustedRate / 100 / 12;

  for (let year = 0; year <= account.timeHorizon; year++) {
    let yearContributions = 0;
    let yearInterest = 0;
    const startBalance = balance;

    for (let month = 0; month < 12 && year < account.timeHorizon; month++) {
      balance += account.monthlyContribution;
      yearContributions += account.monthlyContribution;
      
      // Calculate interest earned this month
      const monthlyInterest = balance * monthlyRate;
      yearInterest += monthlyInterest;
      
      balance *= (1 + monthlyRate);
    }

    const yearGrowth = balance - startBalance - yearContributions;

    results.push({
      year,
      balance: balance,
      contributions: yearContributions,
      interest: yearInterest,
      growth: yearGrowth,
      total: balance
    });
  }

  return results;
}

/**
 * Calculate forecast for any account type
 */
export function calculateAccountForecast(account, profile, variance = 0) {
  switch (account.type) {
    case '401k':
      return calculate401kForecast(account, profile, variance);
    case 'dividend':
      return calculateDividendForecast(account, variance);
    case 'hysa':
      return calculateHYSAForecast(account, variance);
    case 'brokerage':
      return calculateBrokerageForecast(account, variance);
    default:
      return [];
  }
}

/**
 * Calculate forecast with variance scenarios (+/- 2%)
 */
export function calculateAccountForecastWithVariance(account, profile) {
  return {
    base: calculateAccountForecast(account, profile, 0),
    high: calculateAccountForecast(account, profile, 2),
    low: calculateAccountForecast(account, profile, -2)
  };
}

/**
 * Calculate aggregated forecast across all accounts
 */
export function calculateAggregatedForecast(accounts, profile, variance = 0) {
  if (!accounts || accounts.length === 0) {
    return [];
  }

  const forecasts = accounts.map(account => ({
    accountId: account.id,
    accountType: account.type,
    forecast: calculateAccountForecast(account, profile, variance)
  }));

  // Find maximum time horizon
  const maxYears = Math.max(...forecasts.map(f => f.forecast.length - 1));

  const aggregated = [];
  for (let year = 0; year <= maxYears; year++) {
    let totalBalance = 0;
    let totalContributions = 0;
    let totalGrowth = 0;
    let totalInterest = 0;

    forecasts.forEach(({ forecast }) => {
      if (forecast[year]) {
        totalBalance += forecast[year].balance || 0;
        totalContributions += forecast[year].contributions || 0;
        totalGrowth += forecast[year].growth || 0;
        totalInterest += forecast[year].interest || 0;
      }
    });

    aggregated.push({
      year,
      age: profile ? profile.currentAge + year : year,
      balance: totalBalance,
      contributions: totalContributions,
      interest: totalInterest,
      growth: totalGrowth,
      total: totalBalance
    });
  }

  return aggregated;
}

/**
 * Calculate aggregated forecast with variance scenarios
 */
export function calculateAggregatedForecastWithVariance(accounts, profile) {
  return {
    base: calculateAggregatedForecast(accounts, profile, 0),
    high: calculateAggregatedForecast(accounts, profile, 2),
    low: calculateAggregatedForecast(accounts, profile, -2)
  };
}

/**
 * Validate 401k contribution limits
 */
export function validate401kContribution(monthlyContribution, currentAge, timeHorizon, profile) {
  const annualContribution = monthlyContribution * 12;
  const ageAtEnd = currentAge + timeHorizon;
  
  // Determine which limit applies
  const limit = ageAtEnd >= 50 ? IRS_401K_LIMIT_50_PLUS : IRS_401K_LIMIT_UNDER_50;
  
  return {
    isValid: annualContribution <= limit,
    annualContribution,
    limit,
    exceedsBy: annualContribution > limit ? annualContribution - limit : 0
  };
}
