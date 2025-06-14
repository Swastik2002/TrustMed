const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { db } = require('../server');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, specialization } = req.body;
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const query = `
        INSERT INTO users (name, email, password, phone, role, specialization)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [name, email, hashedPassword, phone, role, specialization], function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error creating user' });
        }
        
        // Get the newly created user (without password)
        db.get('SELECT id, name, email, phone, role, specialization FROM users WHERE id = ?', 
          [this.lastID], (err, newUser) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error retrieving user data' });
            }
            
            res.status(201).json({ 
              message: 'User registered successfully',
              user: newUser
            });
          });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user by email and role
    db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      // Send user data
      res.json({ 
        message: 'Login successful',
        user: userWithoutPassword
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;