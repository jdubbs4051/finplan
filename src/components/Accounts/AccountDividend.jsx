import { useState } from 'react';
import './AccountForm.css';

export function AccountDividend({ account, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    currentBalance: account?.currentBalance || '',
    monthlyContribution: account?.monthlyContribution || '',
    timeHorizon: account?.timeHorizon || '',
    expectedYield: account?.expectedYield || '',
    underlyingAssetGrowth: account?.underlyingAssetGrowth || '',
    dripEnabled: account?.dripEnabled !== undefined ? account.dripEnabled : true
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.currentBalance || formData.currentBalance < 0) {
      newErrors.currentBalance = 'Current balance must be 0 or greater';
    }

    if (!formData.monthlyContribution || formData.monthlyContribution < 0) {
      newErrors.monthlyContribution = 'Monthly contribution must be 0 or greater';
    }

    if (!formData.timeHorizon || formData.timeHorizon <= 0) {
      newErrors.timeHorizon = 'Time horizon must be greater than 0';
    }

    if (!formData.expectedYield || formData.expectedYield < 0) {
      newErrors.expectedYield = 'Expected yield must be 0 or greater';
    }

    if (!formData.underlyingAssetGrowth || formData.underlyingAssetGrowth < 0) {
      newErrors.underlyingAssetGrowth = 'Underlying asset growth must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const accountData = {
      type: 'dividend',
      currentBalance: Number(formData.currentBalance),
      monthlyContribution: Number(formData.monthlyContribution),
      timeHorizon: Number(formData.timeHorizon),
      expectedYield: Number(formData.expectedYield),
      underlyingAssetGrowth: Number(formData.underlyingAssetGrowth),
      dripEnabled: formData.dripEnabled
    };

    if (account?.id) {
      accountData.id = account.id;
      accountData.createdAt = account.createdAt;
    }

    onSave(accountData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <h3>Dividend Investing Account</h3>

      <div className="form-group">
        <label htmlFor="currentBalance">Current Balance ($)</label>
        <input
          type="number"
          id="currentBalance"
          name="currentBalance"
          value={formData.currentBalance}
          onChange={handleChange}
          min="0"
          step="100"
          required
        />
        {errors.currentBalance && <span className="error">{errors.currentBalance}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="monthlyContribution">Monthly Contribution ($)</label>
        <input
          type="number"
          id="monthlyContribution"
          name="monthlyContribution"
          value={formData.monthlyContribution}
          onChange={handleChange}
          min="0"
          step="50"
          required
        />
        {errors.monthlyContribution && <span className="error">{errors.monthlyContribution}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="timeHorizon">Time Horizon (years)</label>
        <input
          type="number"
          id="timeHorizon"
          name="timeHorizon"
          value={formData.timeHorizon}
          onChange={handleChange}
          min="1"
          required
        />
        {errors.timeHorizon && <span className="error">{errors.timeHorizon}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expectedYield">Expected Dividend Yield (%)</label>
        <input
          type="number"
          id="expectedYield"
          name="expectedYield"
          value={formData.expectedYield}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          required
        />
        <small className="form-help">Annual dividend yield percentage</small>
        {errors.expectedYield && <span className="error">{errors.expectedYield}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="underlyingAssetGrowth">Expected Underlying Asset Growth (% per year)</label>
        <input
          type="number"
          id="underlyingAssetGrowth"
          name="underlyingAssetGrowth"
          value={formData.underlyingAssetGrowth}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          required
        />
        <small className="form-help">Expected annual growth rate of the underlying assets</small>
        {errors.underlyingAssetGrowth && <span className="error">{errors.underlyingAssetGrowth}</span>}
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="dripEnabled"
            checked={formData.dripEnabled}
            onChange={handleChange}
          />
          Enable DRIP (Dividend Reinvestment Plan)
        </label>
        <small className="form-help">If enabled, dividends will be automatically reinvested</small>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {account ? 'Update Account' : 'Add Account'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
