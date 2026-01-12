import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Navigation } from './components/Layout/Navigation.jsx';
import { ProfileForm } from './components/Profile/ProfileForm.jsx';
import { ProfileDisplay } from './components/Profile/ProfileDisplay.jsx';
import { AccountList } from './components/Accounts/AccountList.jsx';
import { Account401k } from './components/Accounts/Account401k.jsx';
import { AccountDividend } from './components/Accounts/AccountDividend.jsx';
import { AccountHYSA } from './components/Accounts/AccountHYSA.jsx';
import { AccountBrokerage } from './components/Accounts/AccountBrokerage.jsx';
import { AggregatedView } from './components/Forecast/AggregatedView.jsx';
import './App.css';

function AppContent() {
  const { profile, accounts, addAccount, updateAccount, deleteAccount } = useApp();
  const [currentView, setCurrentView] = useState('profile');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setSelectedAccountType(account.type);
    setShowAccountForm(true);
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccount(accountId);
    }
  };

  const handleSaveAccount = (accountData) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
    setShowAccountForm(false);
    setSelectedAccountType(null);
    setEditingAccount(null);
  };

  const handleCancelAccount = () => {
    setShowAccountForm(false);
    setSelectedAccountType(null);
    setEditingAccount(null);
  };

  const renderAccountForm = () => {
    const account = editingAccount || null;
    const commonProps = { account, onSave: handleSaveAccount, onCancel: handleCancelAccount };

    switch (selectedAccountType) {
      case '401k':
        return <Account401k {...commonProps} />;
      case 'dividend':
        return <AccountDividend {...commonProps} />;
      case 'hysa':
        return <AccountHYSA {...commonProps} />;
      case 'brokerage':
        return <AccountBrokerage {...commonProps} />;
      default:
        return null;
    }
  };


  return (
    <div className="app">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      <main className="app-main">
        {currentView === 'profile' && (
          <div className="profile-view">
            {profile ? (
              <>
                <ProfileDisplay onEdit={() => setCurrentView('profile')} />
                <ProfileForm onSave={() => {}} />
              </>
            ) : (
              <ProfileForm onSave={() => {}} />
            )}
          </div>
        )}

        {currentView === 'accounts' && (
          <div className="accounts-view">
            {!showAccountForm ? (
              <>
                <div className="accounts-header">
                  <h2>Manage Accounts</h2>
                  <button onClick={handleAddAccount} className="btn-primary">
                    + Add Account
                  </button>
                </div>
                <AccountList onEdit={handleEditAccount} onDelete={handleDeleteAccount} />
              </>
            ) : (
              <div className="account-form-view">
                {!selectedAccountType ? (
                  <div className="account-type-selector">
                    <h2>Select Account Type</h2>
                    <div className="account-type-grid">
                      <button
                        className="account-type-card"
                        onClick={() => setSelectedAccountType('401k')}
                      >
                        <h3>401(k)</h3>
                        <p>Employer-sponsored retirement account</p>
                      </button>
                      <button
                        className="account-type-card"
                        onClick={() => setSelectedAccountType('dividend')}
                      >
                        <h3>Dividend Investing</h3>
                        <p>Dividend-focused investment account</p>
                      </button>
                      <button
                        className="account-type-card"
                        onClick={() => setSelectedAccountType('hysa')}
                      >
                        <h3>High Yield Savings</h3>
                        <p>High-yield savings account</p>
                      </button>
                      <button
                        className="account-type-card"
                        onClick={() => setSelectedAccountType('brokerage')}
                      >
                        <h3>Brokerage Account</h3>
                        <p>Regular investment brokerage account</p>
                      </button>
                    </div>
                    <button onClick={handleCancelAccount} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                ) : (
                  renderAccountForm()
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'forecast' && (
          <div className="forecast-view">
            <AggregatedView />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
