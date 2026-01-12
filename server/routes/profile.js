import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();
const db = getDatabase();

// Get profile
router.get('/', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile ORDER BY createdAt DESC LIMIT 1').get();
    
    if (!profile) {
      return res.json(null);
    }

    // Convert SQLite integer timestamps to numbers
    const result = {
      currentAge: profile.currentAge,
      retirementAge: profile.retirementAge,
      currentSalary: profile.currentSalary,
      salaryGrowthRate: profile.salaryGrowthRate,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update profile
router.post('/', (req, res) => {
  try {
    const { currentAge, retirementAge, currentSalary, salaryGrowthRate } = req.body;

    // Validate required fields
    if (currentAge === undefined || retirementAge === undefined || 
        currentSalary === undefined || salaryGrowthRate === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if profile exists
    const existing = db.prepare('SELECT id FROM profile ORDER BY createdAt DESC LIMIT 1').get();

    if (existing) {
      // Update existing profile
      const stmt = db.prepare(`
        UPDATE profile 
        SET currentAge = ?, retirementAge = ?, currentSalary = ?, 
            salaryGrowthRate = ?, updatedAt = strftime('%s', 'now')
        WHERE id = ?
      `);
      stmt.run(currentAge, retirementAge, currentSalary, salaryGrowthRate, existing.id);
      
      const updated = db.prepare('SELECT * FROM profile WHERE id = ?').get(existing.id);
      res.json({
        currentAge: updated.currentAge,
        retirementAge: updated.retirementAge,
        currentSalary: updated.currentSalary,
        salaryGrowthRate: updated.salaryGrowthRate,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      });
    } else {
      // Create new profile
      const stmt = db.prepare(`
        INSERT INTO profile (currentAge, retirementAge, currentSalary, salaryGrowthRate)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(currentAge, retirementAge, currentSalary, salaryGrowthRate);
      
      const newProfile = db.prepare('SELECT * FROM profile WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json({
        currentAge: newProfile.currentAge,
        retirementAge: newProfile.retirementAge,
        currentSalary: newProfile.currentSalary,
        salaryGrowthRate: newProfile.salaryGrowthRate,
        createdAt: newProfile.createdAt,
        updatedAt: newProfile.updatedAt
      });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Delete profile
router.delete('/', (req, res) => {
  try {
    db.prepare('DELETE FROM profile').run();
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
