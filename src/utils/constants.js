// IRS 401k Contribution Limits (2024)
export const IRS_401K_LIMIT_UNDER_50 = 23000;
export const IRS_401K_LIMIT_50_PLUS = 30500;

// Default rate of return suggestions
export const DEFAULT_401K_RETURN_RATE = 7.5; // Long-term average
export const DEFAULT_401K_RETURN_RANGE = {
  min: 7,
  max: 10,
  description: "Long-term historical average for 401k accounts"
};

// Account type labels
export const ACCOUNT_TYPES = {
  '401k': '401(k)',
  'dividend': 'Dividend Investing',
  'hysa': 'High Yield Savings Account',
  'brokerage': 'Regular Brokerage'
};

// Account type colors for visualization (Fidelity-inspired)
export const ACCOUNT_COLORS = {
  '401k': '#00b9ff',
  'dividend': '#00ff88',
  'hysa': '#ffaa00',
  'brokerage': '#aa88ff'
};
