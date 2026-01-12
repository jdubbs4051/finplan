import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();
const db = getDatabase();

// Get all accounts
router.get('/', (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY createdAt ASC').all();
    
    const result = accounts.map(account => ({
      id: account.id,
      type: account.type,
      nickname: account.nickname || undefined,
      currentBalance: account.currentBalance,
      contributionPercentage: account.contributionPercentage || undefined,
      monthlyContribution: account.monthlyContribution || undefined,
      timeHorizon: account.timeHorizon || undefined,
      rateOfReturn: account.rateOfReturn || undefined,
      hasCompanyMatch: account.hasCompanyMatch === 1,
      matchPercentage: account.matchPercentage || undefined,
      matchUpToPercentage: account.matchUpToPercentage || undefined,
      dividendYield: account.dividendYield || undefined,
      annualDividendAmount: account.annualDividendAmount || undefined,
      apy: account.apy || undefined,
      expectedYield: account.expectedYield || undefined,
      underlyingAssetGrowth: account.underlyingAssetGrowth || undefined,
      dripEnabled: account.dripEnabled === 1,
      expectedReturnRate: account.expectedReturnRate || undefined,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get single account by ID
router.get('/:id', (req, res) => {
  try {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      id: account.id,
      type: account.type,
      nickname: account.nickname || undefined,
      currentBalance: account.currentBalance,
      contributionPercentage: account.contributionPercentage || undefined,
      monthlyContribution: account.monthlyContribution || undefined,
      timeHorizon: account.timeHorizon || undefined,
      rateOfReturn: account.rateOfReturn || undefined,
      hasCompanyMatch: account.hasCompanyMatch === 1,
      matchPercentage: account.matchPercentage || undefined,
      matchUpToPercentage: account.matchUpToPercentage || undefined,
      dividendYield: account.dividendYield || undefined,
      annualDividendAmount: account.annualDividendAmount || undefined,
      apy: account.apy || undefined,
      expectedYield: account.expectedYield || undefined,
      underlyingAssetGrowth: account.underlyingAssetGrowth || undefined,
      dripEnabled: account.dripEnabled === 1,
      expectedReturnRate: account.expectedReturnRate || undefined,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Create account
router.post('/', (req, res) => {
  try {
    const account = req.body;
    
    // Validate required fields
    if (!account.id || !account.type || account.currentBalance === undefined) {
      return res.status(400).json({ error: 'Missing required fields: id, type, currentBalance' });
    }

    const stmt = db.prepare(`
      INSERT INTO accounts (
        id, type, nickname, currentBalance, contributionPercentage, monthlyContribution,
        timeHorizon, rateOfReturn, hasCompanyMatch, matchPercentage, matchUpToPercentage,
        dividendYield, annualDividendAmount, apy, expectedYield, underlyingAssetGrowth,
        dripEnabled, expectedReturnRate, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      account.id,
      account.type,
      account.nickname || null,
      account.currentBalance,
      account.contributionPercentage || null,
      account.monthlyContribution || null,
      account.timeHorizon || null,
      account.rateOfReturn || null,
      account.hasCompanyMatch ? 1 : 0,
      account.matchPercentage || null,
      account.matchUpToPercentage || null,
      account.dividendYield || null,
      account.annualDividendAmount || null,
      account.apy || null,
      account.expectedYield || null,
      account.underlyingAssetGrowth || null,
      account.dripEnabled ? 1 : 0,
      account.expectedReturnRate || null,
      account.createdAt || Math.floor(Date.now() / 1000)
    );

    const newAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(account.id);
    res.status(201).json({
      id: newAccount.id,
      type: newAccount.type,
      nickname: newAccount.nickname || undefined,
      currentBalance: newAccount.currentBalance,
      contributionPercentage: newAccount.contributionPercentage || undefined,
      monthlyContribution: newAccount.monthlyContribution || undefined,
      timeHorizon: newAccount.timeHorizon || undefined,
      rateOfReturn: newAccount.rateOfReturn || undefined,
      hasCompanyMatch: newAccount.hasCompanyMatch === 1,
      matchPercentage: newAccount.matchPercentage || undefined,
      matchUpToPercentage: newAccount.matchUpToPercentage || undefined,
      dividendYield: newAccount.dividendYield || undefined,
      annualDividendAmount: newAccount.annualDividendAmount || undefined,
      apy: newAccount.apy || undefined,
      expectedYield: newAccount.expectedYield || undefined,
      underlyingAssetGrowth: newAccount.underlyingAssetGrowth || undefined,
      dripEnabled: newAccount.dripEnabled === 1,
      expectedReturnRate: newAccount.expectedReturnRate || undefined,
      createdAt: newAccount.createdAt,
      updatedAt: newAccount.updatedAt
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return res.status(409).json({ error: 'Account with this ID already exists' });
    }
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', (req, res) => {
  try {
    const account = req.body;
    const accountId = req.params.id;

    // Check if account exists
    const existing = db.prepare('SELECT id FROM accounts WHERE id = ?').get(accountId);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const stmt = db.prepare(`
      UPDATE accounts SET
        type = ?,
        nickname = ?,
        currentBalance = ?,
        contributionPercentage = ?,
        monthlyContribution = ?,
        timeHorizon = ?,
        rateOfReturn = ?,
        hasCompanyMatch = ?,
        matchPercentage = ?,
        matchUpToPercentage = ?,
        dividendYield = ?,
        annualDividendAmount = ?,
        apy = ?,
        expectedYield = ?,
        underlyingAssetGrowth = ?,
        dripEnabled = ?,
        expectedReturnRate = ?,
        updatedAt = strftime('%s', 'now')
      WHERE id = ?
    `);

    stmt.run(
      account.type,
      account.nickname || null,
      account.currentBalance,
      account.contributionPercentage || null,
      account.monthlyContribution || null,
      account.timeHorizon || null,
      account.rateOfReturn || null,
      account.hasCompanyMatch ? 1 : 0,
      account.matchPercentage || null,
      account.matchUpToPercentage || null,
      account.dividendYield || null,
      account.annualDividendAmount || null,
      account.apy || null,
      account.expectedYield || null,
      account.underlyingAssetGrowth || null,
      account.dripEnabled ? 1 : 0,
      account.expectedReturnRate || null,
      accountId
    );

    const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
    res.json({
      id: updated.id,
      type: updated.type,
      nickname: updated.nickname || undefined,
      currentBalance: updated.currentBalance,
      contributionPercentage: updated.contributionPercentage || undefined,
      monthlyContribution: updated.monthlyContribution || undefined,
      timeHorizon: updated.timeHorizon || undefined,
      rateOfReturn: updated.rateOfReturn || undefined,
      hasCompanyMatch: updated.hasCompanyMatch === 1,
      matchPercentage: updated.matchPercentage || undefined,
      matchUpToPercentage: updated.matchUpToPercentage || undefined,
      dividendYield: updated.dividendYield || undefined,
      annualDividendAmount: updated.annualDividendAmount || undefined,
      apy: updated.apy || undefined,
      expectedYield: updated.expectedYield || undefined,
      underlyingAssetGrowth: updated.underlyingAssetGrowth || undefined,
      dripEnabled: updated.dripEnabled === 1,
      expectedReturnRate: updated.expectedReturnRate || undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', (req, res) => {
  try {
    const accountId = req.params.id;
    const result = db.prepare('DELETE FROM accounts WHERE id = ?').run(accountId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
