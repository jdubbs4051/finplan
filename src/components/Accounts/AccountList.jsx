import { useApp } from '../../context/AppContext.jsx';
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '../../utils/constants.js';
import './AccountList.css';

export function AccountList({ onEdit, onDelete }) {
  const { accounts } = useApp();

  if (accounts.length === 0) {
    return (
      <div className="account-list-empty">
        <p>No accounts added yet. Click "Add Account" to get started.</p>
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

  return (
    <div className="account-list">
      <h3>Your Accounts</h3>
      <div className="accounts-grid">
        {accounts.map(account => (
          <div key={account.id} className="account-card" style={{ borderLeftColor: ACCOUNT_COLORS[account.type] }}>
            <div className="account-header">
              <h4>{account.nickname || ACCOUNT_TYPES[account.type]}</h4>
              <div className="account-actions">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(account)} 
                    className="btn-icon btn-edit"
                    title="Edit account"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(account.id)} 
                    className="btn-icon btn-delete"
                    title="Delete account"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="account-details">
              <div className="detail-item">
                <span className="label">Current Balance:</span>
                <span className="value">{formatCurrency(account.currentBalance)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Monthly Contribution:</span>
                <span className="value">{formatCurrency(account.monthlyContribution)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time Horizon:</span>
                <span className="value">{account.timeHorizon} years</span>
              </div>
              {account.type === '401k' && (
                <>
                  <div className="detail-item">
                    <span className="label">Rate of Return:</span>
                    <span className="value">{account.rateOfReturn}%</span>
                  </div>
                  {account.hasCompanyMatch && (
                    <div className="detail-item">
                      <span className="label">Company Match:</span>
                      <span className="value">{account.matchPercentage}% up to {account.matchUpToPercentage}%</span>
                    </div>
                  )}
                </>
              )}
              {account.type === 'dividend' && (
                <>
                  <div className="detail-item">
                    <span className="label">Dividend Yield:</span>
                    <span className="value">{account.expectedYield}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Asset Growth:</span>
                    <span className="value">{account.underlyingAssetGrowth}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">DRIP:</span>
                    <span className="value">{account.dripEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </>
              )}
              {account.type === 'hysa' && (
                <div className="detail-item">
                  <span className="label">APY:</span>
                  <span className="value">{account.apy}%</span>
                </div>
              )}
              {account.type === 'brokerage' && (
                <div className="detail-item">
                  <span className="label">Expected Return:</span>
                  <span className="value">{account.expectedReturnRate}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
