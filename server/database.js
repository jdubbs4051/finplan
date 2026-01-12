import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, 'data');
const dbPath = join(dbDir, 'financial_forecast.db');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();
  return database;
}

function initTables() {
  // Profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      currentAge REAL NOT NULL,
      retirementAge REAL NOT NULL,
      currentSalary REAL NOT NULL,
      salaryGrowthRate REAL NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      nickname TEXT,
      currentBalance REAL NOT NULL,
      contributionPercentage REAL,
      monthlyContribution REAL,
      timeHorizon REAL,
      rateOfReturn REAL,
      hasCompanyMatch INTEGER DEFAULT 0,
      matchPercentage REAL DEFAULT 0,
      matchUpToPercentage REAL DEFAULT 0,
      dividendYield REAL,
      annualDividendAmount REAL,
      apy REAL,
      expectedYield REAL,
      underlyingAssetGrowth REAL,
      dripEnabled INTEGER DEFAULT 0,
      expectedReturnRate REAL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Migrate existing tables - add new columns if they don't exist
  migrateTables();

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
    CREATE INDEX IF NOT EXISTS idx_accounts_created ON accounts(createdAt);
  `);
}

function migrateTables() {
  try {
    // Get table info to check existing columns
    const accountColumns = db.prepare("PRAGMA table_info(accounts)").all();
    const columnNames = accountColumns.map(col => col.name);

    // Add missing columns if they don't exist
    if (!columnNames.includes('expectedYield')) {
      db.exec('ALTER TABLE accounts ADD COLUMN expectedYield REAL');
    }
    if (!columnNames.includes('underlyingAssetGrowth')) {
      db.exec('ALTER TABLE accounts ADD COLUMN underlyingAssetGrowth REAL');
    }
    if (!columnNames.includes('dripEnabled')) {
      db.exec('ALTER TABLE accounts ADD COLUMN dripEnabled INTEGER DEFAULT 0');
    }
    if (!columnNames.includes('expectedReturnRate')) {
      db.exec('ALTER TABLE accounts ADD COLUMN expectedReturnRate REAL');
    }
  } catch (error) {
    console.warn('Migration warning:', error.message);
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
