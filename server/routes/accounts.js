import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// Get all accounts
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const accounts = db.getAccounts();
    res.json(accounts || []);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get single account by ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const account = db.getAccountById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Create account
router.post('/', (req, res) => {
  try {
    const account = req.body;
    console.log('Received account creation request:', JSON.stringify(account, null, 2));
    
    // Validate required fields
    if (!account.id || !account.type || account.currentBalance === undefined) {
      console.error('Validation failed - missing fields:', {
        hasId: !!account.id,
        hasType: !!account.type,
        hasCurrentBalance: account.currentBalance !== undefined
      });
      return res.status(400).json({ 
        error: 'Missing required fields: id, type, currentBalance',
        received: {
          id: account.id,
          type: account.type,
          currentBalance: account.currentBalance
        }
      });
    }

    const db = getDatabase();
    
    // Check if account already exists
    const existing = db.getAccountById(account.id);
    if (existing) {
      console.error('Duplicate account ID:', account.id);
      return res.status(409).json({ error: 'Account with this ID already exists' });
    }

    // Prepare account data
    const accountData = {
      ...account,
      createdAt: account.createdAt || Math.floor(Date.now() / 1000)
    };

    const saved = db.saveAccount(accountData);
    console.log('Account created successfully:', account.id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating account:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create account',
      details: error.message 
    });
  }
});

// Update account
router.put('/:id', (req, res) => {
  try {
    const account = req.body;
    const accountId = req.params.id;

    const db = getDatabase();
    
    // Check if account exists
    const existing = db.getAccountById(accountId);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Preserve createdAt, update other fields
    const accountData = {
      ...account,
      id: accountId,
      createdAt: existing.createdAt || account.createdAt || Math.floor(Date.now() / 1000)
    };

    const updated = db.saveAccount(accountData);
    res.json(updated);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', (req, res) => {
  try {
    const accountId = req.params.id;
    const db = getDatabase();
    
    const deleted = db.deleteAccount(accountId);
    if (!deleted) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
