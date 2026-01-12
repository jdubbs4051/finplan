import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const savedProfile = await storage.getProfile();
        const savedAccounts = await storage.getAccounts();
        
        if (savedProfile) {
          setProfile(savedProfile);
        }
        if (savedAccounts && Array.isArray(savedAccounts)) {
          setAccounts(savedAccounts);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save profile to API whenever it changes
  useEffect(() => {
    if (profile && !loading) {
      storage.saveProfile(profile).catch(error => {
        console.error('Failed to save profile:', error);
      });
    }
  }, [profile, loading]);

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const addAccount = async (account) => {
    const newAccount = {
      ...account,
      id: account.id || `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: account.createdAt || Math.floor(Date.now() / 1000)
    };
    
    console.log('Adding account:', newAccount);
    
    // Save to backend first (don't do optimistic update to avoid confusion)
    try {
      const result = await storage.addAccount(newAccount);
      if (!result) {
        throw new Error('Failed to save account to backend');
      }
      
      // Reload accounts from backend to ensure sync
      const updatedAccounts = await storage.getAccounts();
      if (updatedAccounts && Array.isArray(updatedAccounts)) {
        setAccounts(updatedAccounts);
      } else {
        // Fallback: add to local state if backend returns invalid data
        setAccounts([...accounts, newAccount]);
      }
    } catch (error) {
      console.error('Failed to save account:', error);
      throw error; // Re-throw so caller can handle it
    }
  };

  const updateAccount = async (accountId, updatedAccount) => {
    const updated = { ...updatedAccount, id: accountId };
    
    // Optimistically update UI
    const updatedAccounts = accounts.map(acc => 
      acc.id === accountId ? updated : acc
    );
    setAccounts(updatedAccounts);
    
    // Save to backend
    try {
      await storage.updateAccount(accountId, updated);
      // Reload accounts to ensure sync
      const syncedAccounts = await storage.getAccounts();
      if (syncedAccounts) {
        setAccounts(syncedAccounts);
      }
    } catch (error) {
      console.error('Failed to update account:', error);
      // Revert optimistic update on error
      setAccounts(accounts);
      throw error;
    }
  };

  const deleteAccount = async (accountId) => {
    // Optimistically update UI
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    
    // Delete from backend
    try {
      await storage.deleteAccount(accountId);
      // Reload accounts to ensure sync
      const syncedAccounts = await storage.getAccounts();
      if (syncedAccounts) {
        setAccounts(syncedAccounts);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      // Revert optimistic update on error
      setAccounts(accounts);
      throw error;
    }
  };

  const clearAllData = async () => {
    setProfile(null);
    setAccounts([]);
    try {
      await storage.clearAll();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      profile,
      accounts,
      loading,
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
