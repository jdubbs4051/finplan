import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, 'data');
const profilePath = join(dbDir, 'profile.json');
const accountsPath = join(dbDir, 'accounts.json');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize data files if they don't exist
function initDataFiles() {
  if (!existsSync(profilePath)) {
    writeFileSync(profilePath, JSON.stringify(null), 'utf8');
  }
  if (!existsSync(accountsPath)) {
    writeFileSync(accountsPath, JSON.stringify([]), 'utf8');
  }
}

export function getDatabase() {
  initDataFiles();
  return {
    getProfile: () => {
      try {
        const data = readFileSync(profilePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error reading profile:', error);
        return null;
      }
    },
    saveProfile: (profile) => {
      try {
        const data = {
          ...profile,
          updatedAt: Math.floor(Date.now() / 1000)
        };
        writeFileSync(profilePath, JSON.stringify(data, null, 2), 'utf8');
        return data;
      } catch (error) {
        console.error('Error saving profile:', error);
        throw error;
      }
    },
    getAccounts: () => {
      try {
        const data = readFileSync(accountsPath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error reading accounts:', error);
        return [];
      }
    },
    getAccountById: (id) => {
      try {
        const accounts = JSON.parse(readFileSync(accountsPath, 'utf8'));
        return accounts.find(acc => acc.id === id) || null;
      } catch (error) {
        console.error('Error reading account:', error);
        return null;
      }
    },
    saveAccount: (account) => {
      try {
        const accounts = JSON.parse(readFileSync(accountsPath, 'utf8'));
        const index = accounts.findIndex(acc => acc.id === account.id);
        const accountData = {
          ...account,
          updatedAt: Math.floor(Date.now() / 1000)
        };
        
        if (index >= 0) {
          accounts[index] = accountData;
        } else {
          accounts.push(accountData);
        }
        
        writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), 'utf8');
        return accountData;
      } catch (error) {
        console.error('Error saving account:', error);
        throw error;
      }
    },
    deleteAccount: (id) => {
      try {
        const accounts = JSON.parse(readFileSync(accountsPath, 'utf8'));
        const filtered = accounts.filter(acc => acc.id !== id);
        writeFileSync(accountsPath, JSON.stringify(filtered, null, 2), 'utf8');
        return filtered.length < accounts.length;
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    },
    deleteAllAccounts: () => {
      try {
        writeFileSync(accountsPath, JSON.stringify([], null, 2), 'utf8');
        return true;
      } catch (error) {
        console.error('Error deleting all accounts:', error);
        throw error;
      }
    },
    deleteProfile: () => {
      try {
        writeFileSync(profilePath, JSON.stringify(null), 'utf8');
        return true;
      } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }
    }
  };
}

export function initDatabase() {
  initDataFiles();
  return getDatabase();
}
