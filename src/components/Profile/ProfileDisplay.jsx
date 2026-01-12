import { useApp } from '../../context/AppContext.jsx';
import './ProfileDisplay.css';

export function ProfileDisplay({ onEdit }) {
  const { profile } = useApp();

  if (!profile) {
    return (
      <div className="profile-display">
        <p>No profile information available. Please create your profile first.</p>
      </div>
    );
  }

  return (
    <div className="profile-display">
      <h3>Your Profile</h3>
      <div className="profile-info">
        <div className="profile-item">
          <span className="label">Current Age:</span>
          <span className="value">{profile.currentAge} years</span>
        </div>
        <div className="profile-item">
          <span className="label">Retirement Age:</span>
          <span className="value">{profile.retirementAge} years</span>
        </div>
        <div className="profile-item">
          <span className="label">Years to Retirement:</span>
          <span className="value">{profile.retirementAge - profile.currentAge} years</span>
        </div>
        <div className="profile-item">
          <span className="label">Current Salary:</span>
          <span className="value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(profile.currentSalary)}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">Expected Salary Growth:</span>
          <span className="value">{profile.salaryGrowthRate}% per year</span>
        </div>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="btn-secondary">
          Edit Profile
        </button>
      )}
    </div>
  );
}
