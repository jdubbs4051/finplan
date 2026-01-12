import { useState } from 'react';
import './AccountForm.css';

export function AccountHYSA({ account, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nickname: account?.nickname || '',
    currentBalance: account?.currentBalance || '',
    monthlyContribution: account?.monthlyContribution || '',
    timeHorizon: account?.timeHorizon || '',
    apy: account?.apy || ''
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

    if (!formData.apy || formData.apy < 0) {
      newErrors.apy = 'APY must be 0 or greater';
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
      type: 'hysa',
      nickname: formData.nickname.trim() || undefined,
      currentBalance: Number(formData.currentBalance),
      monthlyContribution: Number(formData.monthlyContribution),
      timeHorizon: Number(formData.timeHorizon),
      apy: Number(formData.apy)
    };

    if (account?.id) {
      accountData.id = account.id;
      accountData.createdAt = account.createdAt;
    }

    onSave(accountData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      <h3>High Yield Savings Account (HYSA)</h3>

      <div className="form-group">
        <label htmlFor="nickname">Nickname (Optional)</label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          placeholder="e.g., Emergency Fund, Savings"
          maxLength={50}
        />
        <small className="form-help">Give this account a friendly name to identify it easily</small>
      </div>

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
        <label htmlFor="apy">Annual Percentage Yield (APY) (%)</label>
        <input
          type="number"
          id="apy"
          name="apy"
          value={formData.apy}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.01"
          required
        />
        <small className="form-help">Annual percentage yield offered by the savings account</small>
        {errors.apy && <span className="error">{errors.apy}</span>}
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
