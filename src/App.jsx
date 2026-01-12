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
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
    setSaveError(null);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setSelectedAccountType(account.type);
    setShowAccountForm(true);
    setSaveError(null);
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        alert('Failed to delete account. Please try again.');
        console.error('Delete error:', error);
      }
    }
  };

  const handleSaveAccount = async (accountData) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, accountData);
      } else {
        await addAccount(accountData);
      }
      // Only close form if save succeeds
      setShowAccountForm(false);
      setSelectedAccountType(null);
      setEditingAccount(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      setSaveError(error.message || 'Failed to save account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAccount = () => {
    setShowAccountForm(false);
    setSelectedAccountType(null);
    setEditingAccount(null);
    setSaveError(null);
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
                  <>
                    {saveError && (
                      <div style={{ 
                        padding: '1rem', 
                        marginBottom: '1rem', 
                        backgroundColor: '#fee', 
                        color: '#c33',
                        borderRadius: '4px',
                        border: '1px solid #fcc'
                      }}>
                        <strong>Error saving account:</strong> {saveError}
                        {saveError.includes('Cannot connect to server') && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                            <p>To start the backend server, run:</p>
                            <code style={{ 
                              display: 'block', 
                              padding: '0.5rem', 
                              backgroundColor: '#fff', 
                              color: '#000',
                              borderRadius: '4px',
                              marginTop: '0.5rem'
                            }}>
                              npm run server
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                    {saving && (
                      <div style={{ 
                        padding: '1rem', 
                        marginBottom: '1rem', 
                        backgroundColor: '#eef', 
                        color: '#336',
                        borderRadius: '4px',
                        border: '1px solid #ccf'
                      }}>
                        Saving account...
                      </div>
                    )}
                    {renderAccountForm()}
                  </>
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
