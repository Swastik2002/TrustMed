const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Create a new order
router.post('/', (req, res) => {
  const { patientId, items, totalAmount, address, paymentMethod } = req.body;
  
  if (!patientId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Create the order
    db.run(`
      INSERT INTO orders (patient_id, total_amount, status, address, payment_method)
      VALUES (?, ?, 'pending', ?, ?)
    `, [patientId, totalAmount, address, paymentMethod], function(err) {
      if (err) {
        console.error(err);
        db.run('ROLLBACK');
        return res.status(500).json({ message: 'Error creating order' });
      }
      
      const orderId = this.lastID;
      
      // Prepare statement for order items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, medicine_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);
      
      let hasError = false;
      
      // Add each item to the order
      items.forEach(item => {
        itemStmt.run(
          orderId,
          item.medicineId,
          item.quantity,
          item.price,
          (err) => {
            if (err) {
              console.error(err);
              hasError = true;
            }
          }
        );
      });
      
      itemStmt.finalize();
      
      if (hasError) {
        db.run('ROLLBACK');
        return res.status(500).json({ message: 'Error adding items to order' });
      }
      
      db.run('COMMIT');
      res.status(201).json({
        id: orderId,
        message: 'Order created successfully'
      });
    });
  });
});

// Get order by ID
router.get('/:id', (req, res) => {
  const orderId = req.params.id;
  
  db.get(`
    SELECT o.id, o.patient_id, o.total_amount, o.status, o.address, o.payment_method, o.created_at,
           u.name as patient_name
    FROM orders o
    JOIN users u ON o.patient_id = u.id
    WHERE o.id = ?
  `, [orderId], (err, order) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get the items in the order
    db.all(`
      SELECT oi.id, oi.medicine_id, oi.quantity, oi.price,
             m.name as medicine_name, m.description, m.category
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

// Update order status
router.put('/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated' });
  });
});

// Get all orders for a patient
router.get('/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  
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

module.exports = router;