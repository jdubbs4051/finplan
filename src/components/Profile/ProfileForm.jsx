import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './ProfileForm.css';

export function ProfileForm({ onSave }) {
  const { profile, updateProfile } = useApp();
  const [formData, setFormData] = useState({
    currentAge: profile?.currentAge || '',
    retirementAge: profile?.retirementAge || '',
    currentSalary: profile?.currentSalary || '',
    salaryGrowthRate: profile?.salaryGrowthRate || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        currentAge: profile.currentAge || '',
        retirementAge: profile.retirementAge || '',
        currentSalary: profile.currentSalary || '',
        salaryGrowthRate: profile.salaryGrowthRate || ''
      });
    }
  }, [profile]);

  const validate = () => {
    const newErrors = {};

    if (!formData.currentAge || formData.currentAge <= 0) {
      newErrors.currentAge = 'Current age must be greater than 0';
    }

    if (!formData.retirementAge || formData.retirementAge <= 0) {
      newErrors.retirementAge = 'Retirement age must be greater than 0';
    }

    if (formData.currentAge && formData.retirementAge && 
        Number(formData.retirementAge) <= Number(formData.currentAge)) {
      newErrors.retirementAge = 'Retirement age must be greater than current age';
    }

    if (!formData.currentSalary || formData.currentSalary <= 0) {
      newErrors.currentSalary = 'Current salary must be greater than 0';
    }

    if (formData.salaryGrowthRate === '' || formData.salaryGrowthRate < 0) {
      newErrors.salaryGrowthRate = 'Salary growth rate must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const profileData = {
      currentAge: Number(formData.currentAge),
      retirementAge: Number(formData.retirementAge),
      currentSalary: Number(formData.currentSalary),
      salaryGrowthRate: Number(formData.salaryGrowthRate)
    };

    updateProfile(profileData);
    if (onSave) {
      onSave();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="profile-form-container">
      <h2>User Profile</h2>
      <p className="form-description">
        Please provide your basic information to get started with your financial forecast.
      </p>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="currentAge">Current Age</label>
          <input
            type="number"
            id="currentAge"
            name="currentAge"
            value={formData.currentAge}
            onChange={handleChange}
            min="1"
            required
          />
          {errors.currentAge && <span className="error">{errors.currentAge}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="retirementAge">Retirement Age</label>
          <input
            type="number"
            id="retirementAge"
            name="retirementAge"
            value={formData.retirementAge}
            onChange={handleChange}
            min="1"
            required
          />
          {errors.retirementAge && <span className="error">{errors.retirementAge}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="currentSalary">Current Annual Salary ($)</label>
          <input
            type="number"
            id="currentSalary"
            name="currentSalary"
            value={formData.currentSalary}
            onChange={handleChange}
            min="0"
            step="1000"
            required
          />
          {errors.currentSalary && <span className="error">{errors.currentSalary}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="salaryGrowthRate">Expected Annual Salary Growth Rate (%)</label>
          <input
            type="number"
            id="salaryGrowthRate"
            name="salaryGrowthRate"
            value={formData.salaryGrowthRate}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.1"
            required
          />
          <small className="form-help">Expected percentage increase per year</small>
          {errors.salaryGrowthRate && <span className="error">{errors.salaryGrowthRate}</span>}
        </div>

        <button type="submit" className="btn-primary">
          {profile ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
