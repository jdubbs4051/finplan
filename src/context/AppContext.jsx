import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = storage.getProfile();
    const savedAccounts = storage.getAccounts();
    
    if (savedProfile) {
      setProfile(savedProfile);
    }
    if (savedAccounts) {
      setAccounts(savedAccounts);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      storage.saveProfile(profile);
    }
  }, [profile]);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (accounts.length >= 0) {
      storage.saveAccounts(accounts);
    }
  }, [accounts]);

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: account.id || `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: account.createdAt || Date.now()
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (accountId, updatedAccount) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...updatedAccount, id: accountId } : acc
    ));
  };

  const deleteAccount = (accountId) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
  };

  const clearAllData = () => {
    setProfile(null);
    setAccounts([]);
    storage.clearAll();
  };

  return (
    <AppContext.Provider value={{
      profile,
      accounts,
      updateProfile,
      addAccount,
      updateAccount,
      deleteAccount,
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
