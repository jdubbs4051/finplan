import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// Get profile
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const profile = db.getProfile();
    res.json(profile);
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

    const db = getDatabase();
    const existing = db.getProfile();
    
    const profileData = {
      currentAge,
      retirementAge,
      currentSalary,
      salaryGrowthRate,
      createdAt: existing?.createdAt || Math.floor(Date.now() / 1000)
    };

    const saved = db.saveProfile(profileData);
    res.status(existing ? 200 : 201).json(saved);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Delete profile
router.delete('/', (req, res) => {
  try {
    const db = getDatabase();
    db.deleteProfile();
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
