const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Get patient dashboard data
router.get('/:id/dashboard', (req, res) => {
  const patientId = req.params.id;

  // Get upcoming appointments
  const appointmentsQuery = `
    SELECT a.id, a.date, a.time, a.reason, a.status, 
           u.name as doctorName, u.specialization
    FROM appointments a
    JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = ? AND a.date >= date('now')
    ORDER BY a.date, a.time
    LIMIT 5
  `;

  // Get recent prescriptions
  const prescriptionsQuery = `
    SELECT p.id, p.diagnosis, p.created_at, 
           u.name as doctorName,
           (SELECT COUNT(*) FROM prescription_medicines WHERE prescription_id = p.id) as medicineCount
    FROM prescriptions p
    JOIN users u ON p.doctor_id = u.id
    WHERE p.patient_id = ?
    ORDER BY p.created_at DESC
    LIMIT 5
  `;

  // Get pending orders
  const ordersQuery = `
    SELECT o.id, o.total_amount, o.status, o.created_at
    FROM orders o
    WHERE o.patient_id = ? AND o.status = 'pending'
    ORDER BY o.created_at DESC
  `;

  // Promised-based approach to handle multiple queries
  const getAppointments = () => {
    return new Promise((resolve, reject) => {
      db.all(appointmentsQuery, [patientId], (err, appointments) => {
        if (err) reject(err);
        else resolve(appointments);
      });
    });
  };

  const getPrescriptions = () => {
    return new Promise((resolve, reject) => {
      db.all(prescriptionsQuery, [patientId], (err, prescriptions) => {
        if (err) reject(err);
        else {
          // Get medicines for each prescription
          const promises = prescriptions.map(prescription => {
            return new Promise((resolve, reject) => {
              db.all(`
                SELECT m.id, m.name, m.category, pm.dosage, pm.morning, pm.afternoon, pm.evening, pm.night, pm.before_meal, pm.after_meal
                FROM prescription_medicines pm
                JOIN medicines m ON pm.medicine_id = m.id
                WHERE pm.prescription_id = ?
              `, [prescription.id], (err, medicines) => {
                if (err) reject(err);
                else {
                  prescription.medicines = medicines;
                  resolve(prescription);
                }
              });
            });
          });
          
          Promise.all(promises)
            .then(results => resolve(results))
            .catch(err => reject(err));
        }
      });
    });
  };

  const getOrders = () => {
    return new Promise((resolve, reject) => {
      db.all(ordersQuery, [patientId], (err, orders) => {
        if (err) reject(err);
        else resolve(orders);
      });
    });
  };

  // Execute all queries
  Promise.all([getAppointments(), getPrescriptions(), getOrders()])
    .then(([upcomingAppointments, recentPrescriptions, pendingOrders]) => {
      res.json({
        upcomingAppointments,
        recentPrescriptions,
        pendingOrders
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
});

// Get patient profile
router.get('/:id', (req, res) => {
  const patientId = req.params.id;
  
  db.get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? AND role = "patient"', 
    [patientId], (err, patient) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(patient);
    });
});

// Update patient profile
router.put('/:id', (req, res) => {
  const patientId = req.params.id;
  const { name, phone } = req.body;
  
  db.run('UPDATE users SET name = ?, phone = ? WHERE id = ? AND role = "patient"',
    [name, phone, patientId], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json({ message: 'Profile updated successfully' });
    });
});

// Get all prescriptions for a patient
router.get('/:id/prescriptions', (req, res) => {
  const patientId = req.params.id;
  
  db.all(`
    SELECT p.id, p.diagnosis, p.comments, p.created_at, 
           a.date as appointment_date, a.time as appointment_time,
           u.name as doctor_name, u.specialization
    FROM prescriptions p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN users u ON p.doctor_id = u.id
    WHERE p.patient_id = ?
    ORDER BY p.created_at DESC
  `, [patientId], (err, prescriptions) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(prescriptions);
  });
});

// Get specific prescription with medicines
router.get('/:patientId/prescriptions/:prescriptionId', (req, res) => {
  const { patientId, prescriptionId } = req.params;
  
  // Get prescription details
  db.get(`
    SELECT p.id, p.diagnosis, p.comments, p.created_at, 
           a.date as appointment_date, a.time as appointment_time, a.reason,
           u.name as doctor_name, u.specialization
    FROM prescriptions p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN users u ON p.doctor_id = u.id
    WHERE p.id = ? AND p.patient_id = ?
  `, [prescriptionId, patientId], (err, prescription) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Get medicines in the prescription
    db.all(`
      SELECT pm.id, pm.dosage, pm.morning, pm.afternoon, pm.evening, pm.night,
             pm.before_meal, pm.after_meal, pm.comments,
             m.id as medicine_id, m.name, m.description, m.price, m.category
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
    `, [prescriptionId], (err, medicines) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      prescription.medicines = medicines;
      res.json(prescription);
    });
  });
});

// Get all orders for a patient
router.get('/:id/orders', (req, res) => {
  const patientId = req.params.id;
  
  db.all(`
    SELECT id, total_amount, status, address, payment_method, created_at
    FROM orders
    WHERE patient_id = ?
    ORDER BY created_at DESC
  `, [patientId], (err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(orders);
  });
});

// Get specific order with items
router.get('/:patientId/orders/:orderId', (req, res) => {
  const { patientId, orderId } = req.params;
  
  // Get order details
  db.get(`
    SELECT id, total_amount, status, address, payment_method, created_at
    FROM orders
    WHERE id = ? AND patient_id = ?
  `, [orderId, patientId], (err, order) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get items in the order
    db.all(`
      SELECT oi.id, oi.quantity, oi.price,
             m.id as medicine_id, m.name, m.description, m.category
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      WHERE oi.order_id = ?
    `, [orderId], (err, items) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      order.items = items;
      res.json(order);
    });
  });
});

module.exports = router;