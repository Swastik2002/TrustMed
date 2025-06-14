const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Get doctor dashboard data
router.get('/:id/dashboard', (req, res) => {
  const doctorId = req.params.id;
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Get today's appointments
  const todayAppointmentsQuery = `
    SELECT a.id, a.date, a.time, a.reason, a.status, a.patient_id as patientId,
           u.name as patientName
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ? AND a.date = ?
    ORDER BY a.time
  `;

  // Get upcoming appointments (excluding today)
  const upcomingAppointmentsQuery = `
    SELECT a.id, a.date, a.time, a.reason, a.status, a.patient_id as patientId,
           u.name as patientName
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ? AND a.date > ?
    ORDER BY a.date, a.time
    LIMIT 10
  `;

  // Get recent patients
  const recentPatientsQuery = `
    SELECT DISTINCT u.id, u.name, u.email, u.phone,
           (SELECT MAX(a.date) FROM appointments a WHERE a.patient_id = u.id AND a.doctor_id = ?) as lastVisit
    FROM users u
    JOIN appointments a ON u.id = a.patient_id
    WHERE a.doctor_id = ?
    ORDER BY lastVisit DESC
    LIMIT 10
  `;

  // Get pending prescriptions (appointments without prescriptions)
  const pendingPrescriptionsQuery = `
    SELECT a.id as appointmentId, a.date as appointmentDate, a.time, a.reason, a.patient_id,
           u.name as patientName
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    LEFT JOIN prescriptions p ON a.id = p.appointment_id
    WHERE a.doctor_id = ? AND p.id IS NULL AND a.date <= ?
    ORDER BY a.date DESC, a.time
    LIMIT 10
  `;

  // Promise-based approach to handle multiple queries
  const getTodayAppointments = () => {
    return new Promise((resolve, reject) => {
      db.all(todayAppointmentsQuery, [doctorId, today], (err, appointments) => {
        if (err) reject(err);
        else resolve(appointments);
      });
    });
  };

  const getUpcomingAppointments = () => {
    return new Promise((resolve, reject) => {
      db.all(upcomingAppointmentsQuery, [doctorId, today], (err, appointments) => {
        if (err) reject(err);
        else resolve(appointments);
      });
    });
  };

  const getRecentPatients = () => {
    return new Promise((resolve, reject) => {
      db.all(recentPatientsQuery, [doctorId, doctorId], (err, patients) => {
        if (err) reject(err);
        else resolve(patients);
      });
    });
  };

  const getPendingPrescriptions = () => {
    return new Promise((resolve, reject) => {
      db.all(pendingPrescriptionsQuery, [doctorId, today], (err, prescriptions) => {
        if (err) reject(err);
        else resolve(prescriptions);
      });
    });
  };

  // Execute all queries
  Promise.all([
    getTodayAppointments(),
    getUpcomingAppointments(),
    getRecentPatients(),
    getPendingPrescriptions()
  ])
    .then(([todayAppointments, upcomingAppointments, recentPatients, pendingPrescriptions]) => {
      res.json({
        todayAppointments,
        upcomingAppointments,
        recentPatients,
        pendingPrescriptions
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
});

// Get doctor profile
router.get('/:id', (req, res) => {
  const doctorId = req.params.id;
  
  db.get('SELECT id, name, email, phone, role, specialization, created_at FROM users WHERE id = ? AND role = "doctor"', 
    [doctorId], (err, doctor) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json(doctor);
    });
});

// Update doctor profile
router.put('/:id', (req, res) => {
  const doctorId = req.params.id;
  const { name, phone, specialization } = req.body;
  
  db.run('UPDATE users SET name = ?, phone = ?, specialization = ? WHERE id = ? AND role = "doctor"',
    [name, phone, specialization, doctorId], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json({ message: 'Profile updated successfully' });
    });
});

// Get all doctors (for patient appointment booking)
router.get('/', (req, res) => {
  const { specialization } = req.query;
  
  let query = 'SELECT id, name, specialization FROM users WHERE role = "doctor"';
  let params = [];
  
  if (specialization) {
    query += ' AND specialization = ?';
    params.push(specialization);
  }
  
  db.all(query, params, (err, doctors) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(doctors);
  });
});

// Get doctor schedules
router.get('/:id/schedules', (req, res) => {
  const doctorId = req.params.id;
  
  db.all(`
    SELECT id, doctor_id, date, start_time, end_time, slot_duration
    FROM doctor_schedules
    WHERE doctor_id = ?
    ORDER BY date, start_time
  `, [doctorId], (err, schedules) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(schedules);
  });
});

// Add doctor schedule
router.post('/:id/schedules', (req, res) => {
  const doctorId = req.params.id;
  const { date, startTime, endTime, slotDuration } = req.body;
  
  db.run(`
    INSERT INTO doctor_schedules (doctor_id, date, start_time, end_time, slot_duration)
    VALUES (?, ?, ?, ?, ?)
  `, [doctorId, date, startTime, endTime, slotDuration], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.status(201).json({
      id: this.lastID,
      doctor_id: doctorId,
      date,
      start_time: startTime,
      end_time: endTime,
      slot_duration: slotDuration
    });
  });
});

// Delete doctor schedule
router.delete('/:doctorId/schedules/:scheduleId', (req, res) => {
  const { doctorId, scheduleId } = req.params;
  
  db.run('DELETE FROM doctor_schedules WHERE id = ? AND doctor_id = ?', 
    [scheduleId, doctorId], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      res.json({ message: 'Schedule deleted successfully' });
    });
});

// Get a patient's history for a doctor
router.get('/:doctorId/patient-history/:patientId', (req, res) => {
  const { doctorId, patientId } = req.params;
  
  // Get patient info
  db.get('SELECT id, name, email, phone FROM users WHERE id = ? AND role = "patient"',
    [patientId], (err, patient) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Get past appointments
      db.all(`
        SELECT a.id, a.date, a.time, a.reason, a.status
        FROM appointments a
        WHERE a.doctor_id = ? AND a.patient_id = ?
        ORDER BY a.date DESC, a.time DESC
      `, [doctorId, patientId], (err, appointments) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        // Get past prescriptions
        db.all(`
          SELECT p.id, p.diagnosis, p.comments, p.created_at,
                 a.date as appointment_date, a.time as appointment_time
          FROM prescriptions p
          JOIN appointments a ON p.appointment_id = a.id
          WHERE p.doctor_id = ? AND p.patient_id = ?
          ORDER BY p.created_at DESC
        `, [doctorId, patientId], (err, prescriptions) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }
          
          // Get prescription details with medicines
          const getFullPrescriptions = prescriptions.map(prescription => {
            return new Promise((resolve, reject) => {
              db.all(`
                SELECT pm.dosage, pm.morning, pm.afternoon, pm.evening, pm.night,
                      pm.before_meal, pm.after_meal, pm.comments,
                      m.id as medicine_id, m.name, m.category
                FROM prescription_medicines pm
                JOIN medicines m ON pm.medicine_id = m.id
                WHERE pm.prescription_id = ?
              `, [prescription.id], (err, medicines) => {
                if (err) {
                  reject(err);
                } else {
                  prescription.medicines = medicines;
                  resolve(prescription);
                }
              });
            });
          });
          
          Promise.all(getFullPrescriptions)
            .then(fullPrescriptions => {
              res.json({
                patient,
                appointments,
                prescriptions: fullPrescriptions
              });
            })
            .catch(err => {
              console.error(err);
              res.status(500).json({ message: 'Server error' });
            });
        });
      });
    });
});

module.exports = router;