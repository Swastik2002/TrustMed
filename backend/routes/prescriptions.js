const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Create a new prescription
router.post('/', (req, res) => {
  const { appointmentId, doctorId, patientId, diagnosis, comments, medicines } = req.body;
  
  if (!appointmentId || !doctorId || !patientId || !medicines || !Array.isArray(medicines)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Create the prescription
    db.run(`
      INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, comments)
      VALUES (?, ?, ?, ?, ?)
    `, [appointmentId, doctorId, patientId, diagnosis, comments], function(err) {
      if (err) {
        console.error(err);
        db.run('ROLLBACK');
        return res.status(500).json({ message: 'Error creating prescription' });
      }
      
      const prescriptionId = this.lastID;
      
      // Prepare statement for medicine details
      const medicineStmt = db.prepare(`
        INSERT INTO prescription_medicines 
        (prescription_id, medicine_id, dosage, morning, afternoon, evening, night, before_meal, after_meal, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let hasError = false;
      
      // Add each medicine to the prescription
      medicines.forEach(medicine => {
        medicineStmt.run(
          prescriptionId,
          medicine.medicineId,
          medicine.dosage || '',
          medicine.morning ? 1 : 0,
          medicine.afternoon ? 1 : 0,
          medicine.evening ? 1 : 0,
          medicine.night ? 1 : 0,
          medicine.beforeMeal ? 1 : 0,
          medicine.afterMeal ? 1 : 0,
          medicine.comments || '',
          (err) => {
            if (err) {
              console.error(err);
              hasError = true;
            }
          }
        );
      });
      
      medicineStmt.finalize();
      
      if (hasError) {
        db.run('ROLLBACK');
        return res.status(500).json({ message: 'Error adding medicines to prescription' });
      }
      
      // Update appointment status to completed
      db.run('UPDATE appointments SET status = "completed" WHERE id = ?', [appointmentId], (err) => {
        if (err) {
          console.error(err);
          db.run('ROLLBACK');
          return res.status(500).json({ message: 'Error updating appointment status' });
        }
        
        db.run('COMMIT');
        res.status(201).json({
          id: prescriptionId,
          message: 'Prescription created successfully'
        });
      });
    });
  });
});

// Get prescription by ID
router.get('/:id', (req, res) => {
  const prescriptionId = req.params.id;
  
  db.get(`
    SELECT p.id, p.appointment_id, p.doctor_id, p.patient_id, p.diagnosis, p.comments, p.created_at,
           d.name as doctor_name, d.specialization as doctor_specialization,
           pt.name as patient_name,
           a.date as appointment_date, a.time as appointment_time
    FROM prescriptions p
    JOIN users d ON p.doctor_id = d.id
    JOIN users pt ON p.patient_id = pt.id
    JOIN appointments a ON p.appointment_id = a.id
    WHERE p.id = ?
  `, [prescriptionId], (err, prescription) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Get the medicines in the prescription
    db.all(`
      SELECT pm.id, pm.medicine_id, pm.dosage, pm.morning, pm.afternoon, pm.evening, pm.night,
             pm.before_meal, pm.after_meal, pm.comments,
             m.name as medicine_name, m.description, m.category, m.price
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

// Get prescriptions for a specific appointment
router.get('/appointment/:appointmentId', (req, res) => {
  const appointmentId = req.params.appointmentId;
  
  db.get(`
    SELECT p.id, p.diagnosis, p.comments, p.created_at
    FROM prescriptions p
    WHERE p.appointment_id = ?
  `, [appointmentId], (err, prescription) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!prescription) {
      return res.json(null);
    }
    
    // Get the medicines in the prescription
    db.all(`
      SELECT pm.medicine_id, pm.dosage, pm.morning, pm.afternoon, pm.evening, pm.night,
             pm.before_meal, pm.after_meal, pm.comments,
             m.name as medicine_name, m.category
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
    `, [prescription.id], (err, medicines) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      prescription.medicines = medicines;
      res.json(prescription);
    });
  });
});

// Get all prescriptions for a doctor
router.get('/doctor/:doctorId', (req, res) => {
  const doctorId = req.params.doctorId;
  
  db.all(`
    SELECT p.id, p.appointment_id, p.patient_id, p.diagnosis, p.created_at,
           pt.name as patient_name,
           a.date as appointment_date, a.time as appointment_time
    FROM prescriptions p
    JOIN users pt ON p.patient_id = pt.id
    JOIN appointments a ON p.appointment_id = a.id
    WHERE p.doctor_id = ?
    ORDER BY p.created_at DESC
  `, [doctorId], (err, prescriptions) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(prescriptions);
  });
});

// Get all prescriptions for a patient
router.get('/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  
  db.all(`
    SELECT p.id, p.appointment_id, p.doctor_id, p.diagnosis, p.created_at,
           d.name as doctor_name, d.specialization,
           a.date as appointment_date, a.time as appointment_time
    FROM prescriptions p
    JOIN users d ON p.doctor_id = d.id
    JOIN appointments a ON p.appointment_id = a.id
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

module.exports = router;