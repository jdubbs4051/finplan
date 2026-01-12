import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { validate401kContribution } from '../../utils/calculations.js';
import { DEFAULT_401K_RETURN_RATE, DEFAULT_401K_RETURN_RANGE } from '../../utils/constants.js';
import './AccountForm.css';

export function Account401k({ account, onSave, onCancel }) {
  const { profile } = useApp();
  const [formData, setFormData] = useState({
    currentBalance: account?.currentBalance || '',
    monthlyContribution: account?.monthlyContribution || '',
    timeHorizon: account?.timeHorizon || '',
    rateOfReturn: account?.rateOfReturn || DEFAULT_401K_RETURN_RATE,
    hasCompanyMatch: account?.hasCompanyMatch || false,
    matchPercentage: account?.matchPercentage || '',
    matchUpToPercentage: account?.matchUpToPercentage || ''
  });
  const [errors, setErrors] = useState({});
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    if (formData.monthlyContribution && profile) {
      const validationResult = validate401kContribution(
        Number(formData.monthlyContribution),
        profile.currentAge,
        Number(formData.timeHorizon) || 0,
        profile
      );
      setValidation(validationResult);
    } else {
      setValidation(null);
    }
  }, [formData.monthlyContribution, formData.timeHorizon, profile]);

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

    if (!formData.rateOfReturn || formData.rateOfReturn < 0) {
      newErrors.rateOfReturn = 'Rate of return must be 0 or greater';
    }

    if (formData.hasCompanyMatch) {
      if (!formData.matchPercentage || formData.matchPercentage <= 0) {
        newErrors.matchPercentage = 'Match percentage must be greater than 0';
      }
      if (!formData.matchUpToPercentage || formData.matchUpToPercentage <= 0) {
        newErrors.matchUpToPercentage = 'Match up to percentage must be greater than 0';
      }
    }

    if (validation && !validation.isValid) {
      newErrors.monthlyContribution = `Annual contribution exceeds IRS limit of $${validation.limit.toLocaleString()}`;
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
      type: '401k',
      currentBalance: Number(formData.currentBalance),
      monthlyContribution: Number(formData.monthlyContribution),
      timeHorizon: Number(formData.timeHorizon),
      rateOfReturn: Number(formData.rateOfReturn),
      hasCompanyMatch: formData.hasCompanyMatch,
      matchPercentage: formData.hasCompanyMatch ? Number(formData.matchPercentage) : 0,
      matchUpToPercentage: formData.hasCompanyMatch ? Number(formData.matchUpToPercentage) : 0
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
      <h3>401(k) Account</h3>

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
        {validation && (
          <div className={`validation-message ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid 
              ? `Annual contribution: $${validation.annualContribution.toLocaleString()} (within limit)`
              : `Annual contribution: $${validation.annualContribution.toLocaleString()} exceeds limit by $${validation.exceedsBy.toLocaleString()}`
            }
          </div>
        )}
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
        <label htmlFor="rateOfReturn">Expected Rate of Return (%)</label>
        <input
          type="number"
          id="rateOfReturn"
          name="rateOfReturn"
          value={formData.rateOfReturn}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          required
        />
        <small className="form-help">
          Typical range: {DEFAULT_401K_RETURN_RANGE.min}% - {DEFAULT_401K_RETURN_RANGE.max}% 
          ({DEFAULT_401K_RETURN_RANGE.description})
        </small>
        {errors.rateOfReturn && <span className="error">{errors.rateOfReturn}</span>}
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="hasCompanyMatch"
            checked={formData.hasCompanyMatch}
            onChange={handleChange}
          />
          Company provides 401(k) match
        </label>
      </div>

      {formData.hasCompanyMatch && (
        <>
          <div className="form-group">
            <label htmlFor="matchPercentage">Company Match Percentage (%)</label>
            <input
              type="number"
              id="matchPercentage"
              name="matchPercentage"
              value={formData.matchPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
              required={formData.hasCompanyMatch}
            />
            <small className="form-help">e.g., 50 means company matches 50% of your contribution</small>
            {errors.matchPercentage && <span className="error">{errors.matchPercentage}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="matchUpToPercentage">Match Up To (% of salary)</label>
            <input
              type="number"
              id="matchUpToPercentage"
              name="matchUpToPercentage"
              value={formData.matchUpToPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              required={formData.hasCompanyMatch}
            />
            <small className="form-help">e.g., 6 means company matches up to 6% of your salary</small>
            {errors.matchUpToPercentage && <span className="error">{errors.matchUpToPercentage}</span>}
          </div>
        </>
      )}

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
