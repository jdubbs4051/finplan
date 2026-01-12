const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const storage = {
  // Profile operations
  saveProfile: async (profile) => {
    try {
      await apiCall('/profile', {
        method: 'POST',
        body: JSON.stringify(profile),
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      // Fallback to localStorage if API fails
      try {
        localStorage.setItem('financial_forecast_profile', JSON.stringify(profile));
      } catch (localError) {
        console.error('LocalStorage fallback also failed:', localError);
      }
      return false;
    }
  },

  getProfile: async () => {
    try {
      const profile = await apiCall('/profile');
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to localStorage if API fails
      try {
        const profile = localStorage.getItem('financial_forecast_profile');
        return profile ? JSON.parse(profile) : null;
      } catch (localError) {
        console.error('LocalStorage fallback also failed:', localError);
        return null;
      }
    }
  },

  // Accounts operations
  saveAccounts: async (accounts) => {
    try {
      // Sync all accounts - delete all and recreate
      // First, get existing accounts to delete them
      const existingAccounts = await apiCall('/accounts').catch(() => []);
      
      // Delete all existing accounts
      for (const account of existingAccounts) {
        try {
          await apiCall(`/accounts/${account.id}`, { method: 'DELETE' });
        } catch (error) {
          console.warn(`Failed to delete account ${account.id}:`, error);
        }
      }

      // Create all accounts
      for (const account of accounts) {
        try {
          await apiCall('/accounts', {
            method: 'POST',
            body: JSON.stringify(account),
          });
        } catch (error) {
          console.error(`Failed to save account ${account.id}:`, error);
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving accounts:', error);
      // Fallback to localStorage if API fails
      try {
        localStorage.setItem('financial_forecast_accounts', JSON.stringify(accounts));
      } catch (localError) {
        console.error('LocalStorage fallback also failed:', localError);
      }
      return false;
    }
  },

  getAccounts: async () => {
    try {
      const accounts = await apiCall('/accounts');
      return accounts || [];
    } catch (error) {
      console.error('Error loading accounts:', error);
      // Fallback to localStorage if API fails
      try {
        const accounts = localStorage.getItem('financial_forecast_accounts');
        return accounts ? JSON.parse(accounts) : [];
      } catch (localError) {
        console.error('LocalStorage fallback also failed:', localError);
        return [];
      }
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      await apiCall('/profile', { method: 'DELETE' });
      const accounts = await apiCall('/accounts').catch(() => []);
      for (const account of accounts) {
        try {
          await apiCall(`/accounts/${account.id}`, { method: 'DELETE' });
        } catch (error) {
          console.warn(`Failed to delete account ${account.id}:`, error);
        }
      }
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      // Fallback to localStorage
      try {
        localStorage.removeItem('financial_forecast_profile');
        localStorage.removeItem('financial_forecast_accounts');
      } catch (localError) {
        console.error('LocalStorage fallback also failed:', localError);
      }
      return false;
    }
  },

  // Individual account operations (for better sync)
  addAccount: async (account) => {
    try {
      await apiCall('/accounts', {
        method: 'POST',
        body: JSON.stringify(account),
      });
      return true;
    } catch (error) {
      console.error('Error adding account:', error);
      return false;
    }
  },

  updateAccount: async (accountId, account) => {
    try {
      await apiCall(`/accounts/${accountId}`, {
        method: 'PUT',
        body: JSON.stringify(account),
      });
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      return false;
    }
  },

  deleteAccount: async (accountId) => {
    try {
      await apiCall(`/accounts/${accountId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  },
};
