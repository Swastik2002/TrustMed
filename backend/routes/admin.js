const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../server');

// Configure multer for medicine image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/medicines'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'medicine-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const { email, password } = req.body;
  if (email === 'admin@gmail.com' && password === 'admin123') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@gmail.com' && password === 'admin123') {
    res.json({
      user: {
        id: 'admin',
        email: 'admin@gmail.com',
        role: 'admin',
        name: 'Admin'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get Dashboard Stats
router.get('/dashboard', (req, res) => {
  const stats = {};
  
  // Get total doctors
  db.get('SELECT COUNT(*) as count FROM users WHERE role = "doctor"', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    stats.doctorsCount = result.count;
    
    // Get total patients
    db.get('SELECT COUNT(*) as count FROM users WHERE role = "patient"', (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      stats.patientsCount = result.count;
      
      // Get total medicines
      db.get('SELECT COUNT(*) as count FROM medicines', (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        stats.medicinesCount = result.count;
        
        // Get total orders
        db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }
          stats.ordersCount = result.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// Get all doctors
router.get('/doctors', (req, res) => {
  const query = req.query.search 
    ? 'SELECT * FROM users WHERE role = "doctor" AND (name LIKE ? OR email LIKE ? OR specialization LIKE ?)'
    : 'SELECT * FROM users WHERE role = "doctor"';
  
  const params = req.query.search 
    ? [`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`]
    : [];
  
  db.all(query, params, (err, doctors) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(doctors);
  });
});

// Get all patients
router.get('/patients', (req, res) => {
  const query = req.query.search 
    ? 'SELECT * FROM users WHERE role = "patient" AND (name LIKE ? OR email LIKE ?)'
    : 'SELECT * FROM users WHERE role = "patient"';
  
  const params = req.query.search 
    ? [`%${req.query.search}%`, `%${req.query.search}%`]
    : [];
  
  db.all(query, params, (err, patients) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(patients);
  });
});

// Update user (doctor/patient)
router.put('/users/:id', (req, res) => {
  const { name, email, phone, specialization } = req.body;
  const userId = req.params.id;
  
  const query = specialization 
    ? 'UPDATE users SET name = ?, email = ?, phone = ?, specialization = ? WHERE id = ?'
    : 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
  
  const params = specialization 
    ? [name, email, phone, specialization, userId]
    : [name, email, phone, userId];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  });
});

// Add new medicine
router.post('/medicines', upload.single('image'), (req, res) => {
  const { name, description, price, category } = req.body;
  const imageUrl = req.file ? `/uploads/medicines/${req.file.filename}` : null;
  
  db.run(`
    INSERT INTO medicines (name, description, price, category, image_url)
    VALUES (?, ?, ?, ?, ?)
  `, [name, description, price, category, imageUrl], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      description,
      price,
      category,
      image_url: imageUrl
    });
  });
});

// Update medicine
router.put('/medicines/:id', upload.single('image'), (req, res) => {
  const { name, description, price, category } = req.body;
  const medicineId = req.params.id;
  
  let query = 'UPDATE medicines SET name = ?, description = ?, price = ?, category = ?';
  let params = [name, description, price, category];
  
  if (req.file) {
    query += ', image_url = ?';
    params.push(`/uploads/medicines/${req.file.filename}`);
  }
  
  query += ' WHERE id = ?';
  params.push(medicineId);
  
  db.run(query, params, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine updated successfully' });
  });
});

// Delete medicine
router.delete('/medicines/:id', (req, res) => {
  const medicineId = req.params.id;
  
  db.run('DELETE FROM medicines WHERE id = ?', [medicineId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine deleted successfully' });
  });
});

// Get all orders
router.get('/orders', (req, res) => {
  db.all(`
    SELECT o.*, u.name as patient_name, u.email as patient_email
    FROM orders o
    JOIN users u ON o.patient_id = u.id
    ORDER BY o.created_at DESC
  `, (err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(orders);
  });
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  });
});

// Export summary data
router.get('/export', (req, res) => {
  const data = {
    doctors: [],
    patients: [],
    medicines: [],
    orders: []
  };
  
  // Get all doctors
  db.all('SELECT * FROM users WHERE role = "doctor"', (err, doctors) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    data.doctors = doctors;
    
    // Get all patients
    db.all('SELECT * FROM users WHERE role = "patient"', (err, patients) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      data.patients = patients;
      
      // Get all medicines
      db.all('SELECT * FROM medicines', (err, medicines) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        data.medicines = medicines;
        
        // Get all orders
        db.all(`
          SELECT o.*, u.name as patient_name
          FROM orders o
          JOIN users u ON o.patient_id = u.id
        `, (err, orders) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }
          data.orders = orders;
          
          res.json(data);
        });
      });
    });
  });
});

module.exports = router;