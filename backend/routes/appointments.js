const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Get available time slots for a doctor on a specific date
router.get('/available-slots', (req, res) => {
  const { doctorId, date } = req.query;
  
  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor ID and date are required' });
  }
  
  // First, get the doctor's schedule for that date
  db.get(`
    SELECT id, start_time, end_time, slot_duration
    FROM doctor_schedules
    WHERE doctor_id = ? AND date = ?
  `, [doctorId, date], (err, schedule) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!schedule) {
      return res.json({ available: false, message: 'No schedule for this date', slots: [] });
    }
    
    // Get all booked appointments for this doctor on this date
    db.all(`
      SELECT time
      FROM appointments
      WHERE doctor_id = ? AND date = ?
    `, [doctorId, date], (err, bookedAppointments) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Convert booked times to a Set for easy lookup
      const bookedTimes = new Set(bookedAppointments.map(app => app.time));
      
      // Parse schedule times
      const startTimeParts = schedule.start_time.match(/(\d+):(\d+) ([AP]M)/);
      const endTimeParts = schedule.end_time.match(/(\d+):(\d+) ([AP]M)/);
      
      if (!startTimeParts || !endTimeParts) {
        return res.status(500).json({ message: 'Invalid schedule time format' });
      }
      
      // Convert to 24-hour format for calculation
      let startHour = parseInt(startTimeParts[1]);
      const startMinute = parseInt(startTimeParts[2]);
      const startPeriod = startTimeParts[3];
      
      let endHour = parseInt(endTimeParts[1]);
      const endMinute = parseInt(endTimeParts[2]);
      const endPeriod = endTimeParts[3];
      
      // Adjust hours to 24-hour format
      if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
      if (startPeriod === 'AM' && startHour === 12) startHour = 0;
      
      if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (endPeriod === 'AM' && endHour === 12) endHour = 0;
      
      // Calculate slot times
      const slotDuration = schedule.slot_duration;
      const availableSlots = [];
      
      // Start time in minutes (for easy calculation)
      let currentMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      while (currentMinutes < endMinutes) {
        // Convert current minutes back to 12-hour format
        const slotHour = Math.floor(currentMinutes / 60);
        const slotMinute = currentMinutes % 60;
        
        // Format time (e.g., "9:00 AM", "2:30 PM")
        const period = slotHour >= 12 ? 'PM' : 'AM';
        const displayHour = slotHour % 12 || 12;
        const displayMinute = slotMinute === 0 ? '00' : slotMinute;
        
        const timeSlot = `${displayHour}:${displayMinute} ${period}`;
        
        // Check if slot is available
        if (!bookedTimes.has(timeSlot)) {
          availableSlots.push(timeSlot);
        }
        
        // Move to next slot
        currentMinutes += slotDuration;
      }
      
      res.json({
        available: true,
        slots: availableSlots
      });
    });
  });
});

// Book an appointment
router.post('/', (req, res) => {
  const { patientId, doctorId, date, time, reason } = req.body;
  
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Check if doctor is available at that time
  db.get(`
    SELECT id
    FROM doctor_schedules
    WHERE doctor_id = ? AND date = ?
  `, [doctorId, date], (err, schedule) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!schedule) {
      return res.status(400).json({ message: 'Doctor is not available on this date' });
    }
    
    // Check if time slot is already booked
    db.get(`
      SELECT id
      FROM appointments
      WHERE doctor_id = ? AND date = ? AND time = ?
    `, [doctorId, date, time], (err, existingAppointment) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (existingAppointment) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
      
      // Create the appointment
      db.run(`
        INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status)
        VALUES (?, ?, ?, ?, ?, 'scheduled')
      `, [patientId, doctorId, date, time, reason], function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error creating appointment' });
        }
        
        res.status(201).json({
          id: this.lastID,
          patient_id: patientId,
          doctor_id: doctorId,
          date,
          time,
          reason,
          status: 'scheduled'
        });
      });
    });
  });
});

// Get appointments for a patient
router.get('/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  
  db.all(`
    SELECT a.id, a.date, a.time, a.reason, a.status,
           u.name as doctorName, u.specialization
    FROM appointments a
    JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = ?
    ORDER BY a.date, a.time
  `, [patientId], (err, appointments) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(appointments);
  });
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', (req, res) => {
  const doctorId = req.params.doctorId;
  const { date } = req.query;
  
  let query = `
    SELECT a.id, a.date, a.time, a.reason, a.status,
           u.id as patientId, u.name as patientName
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ?
  `;
  
  let params = [doctorId];
  
  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY a.date, a.time';
  
  db.all(query, params, (err, appointments) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(appointments);
  });
});

// Get a specific appointment
router.get('/:id', (req, res) => {
  const appointmentId = req.params.id;
  
  db.get(`
    SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time, a.reason, a.status,
           p.name as patientName, p.email as patientEmail, p.phone as patientPhone,
           d.name as doctorName, d.specialization
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    WHERE a.id = ?
  `, [appointmentId], (err, appointment) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  });
});

// Update appointment status
router.put('/:id/status', (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  
  const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  db.run('UPDATE appointments SET status = ? WHERE id = ?',
    [status, appointmentId], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.json({ message: 'Appointment status updated' });
    });
});

// Cancel an appointment
router.delete('/:id', (req, res) => {
  const appointmentId = req.params.id;
  
  db.run('DELETE FROM appointments WHERE id = ?', [appointmentId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment cancelled successfully' });
  });
});

module.exports = router;