const PROFILE_KEY = 'financial_forecast_profile';
const ACCOUNTS_KEY = 'financial_forecast_accounts';

export const storage = {
  // Profile operations
  saveProfile: (profile) => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  getProfile: () => {
    try {
      const profile = localStorage.getItem(PROFILE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  },

  // Accounts operations
  saveAccounts: (accounts) => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return true;
    } catch (error) {
      console.error('Error saving accounts:', error);
      return false;
    }
  },

  getAccounts: () => {
    try {
      const accounts = localStorage.getItem(ACCOUNTS_KEY);
      return accounts ? JSON.parse(accounts) : [];
    } catch (error) {
      console.error('Error loading accounts:', error);
      return [];
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ACCOUNTS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};
