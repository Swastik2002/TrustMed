const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const upload = require('./middleware/upload');

// Initialize express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Setup multer for file uploads
// Ensure uploads folder exists & serve static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    // initializeDatabase();
  } 
});
module.exports.db = db;

initializeDatabase();

// Initialize database tables
function initializeDatabase() {
db.serialize(() => {
  // Users Table (for both patients and doctors)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      specialization TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctor Schedules Table
  db.run(`
    CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_duration INTEGER DEFAULT 30,
      FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Appointments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Prescriptions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      diagnosis TEXT,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Medicines Table
  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      in_stock BOOLEAN DEFAULT 1,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prescription Medicines Table (for medicines in prescriptions)
  db.run(`
    CREATE TABLE IF NOT EXISTS prescription_medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      dosage TEXT,
      morning BOOLEAN DEFAULT 0,
      afternoon BOOLEAN DEFAULT 0,
      evening BOOLEAN DEFAULT 0,
      night BOOLEAN DEFAULT 0,
      before_meal BOOLEAN DEFAULT 0,
      after_meal BOOLEAN DEFAULT 0,
      comments TEXT,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE CASCADE
    )
  `);

  // Orders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      address TEXT,
      payment_method TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Order Items Table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE CASCADE
    )
  `);

  // Insert sample medicines data
  db.get("SELECT COUNT(*) as count FROM medicines", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      const sampleMedicines = [
        { name: 'Paracetamol', description: 'For fever and pain relief', price: 5.99, category: 'Pain Relief' },
        { name: 'Amoxicillin', description: 'Antibiotic for bacterial infections', price: 12.99, category: 'Antibiotics' },
        { name: 'Omeprazole', description: 'For acid reflux and ulcers', price: 8.49, category: 'Stomach' },
        { name: 'Cetirizine', description: 'Antihistamine for allergies', price: 7.29, category: 'Allergy' },
        { name: 'Aspirin', description: 'Blood thinner and pain reliever', price: 4.59, category: 'Pain Relief' },
        { name: 'Albuterol', description: 'For asthma and COPD', price: 15.99, category: 'Respiratory' },
        { name: 'Metformin', description: 'For type 2 diabetes', price: 9.99, category: 'Diabetes' },
        { name: 'Atorvastatin', description: 'For high cholesterol', price: 14.29, category: 'Cholesterol' },
        { name: 'Lisinopril', description: 'For high blood pressure', price: 10.99, category: 'Blood Pressure' },
        { name: 'Sertraline', description: 'For depression and anxiety', price: 18.49, category: 'Mental Health' },
        { name: 'Ibuprofen', description: 'For pain and inflammation', price: 6.79, category: 'Pain Relief' },
        { name: 'Levothyroxine', description: 'For thyroid disorders', price: 12.59, category: 'Thyroid' },
        { name: 'Simvastatin', description: 'For high cholesterol', price: 13.79, category: 'Cholesterol' },
        { name: 'Metoprolol', description: 'For high blood pressure and heart conditions', price: 11.99, category: 'Blood Pressure' },
        { name: 'Losartan', description: 'For high blood pressure', price: 10.49, category: 'Blood Pressure' },
        { name: 'Allopurinol', description: 'For gout and kidney stones', price: 8.99, category: 'Gout' },
        { name: 'Furosemide', description: 'Diuretic for fluid retention', price: 7.49, category: 'Diuretic' },
        { name: 'Fluoxetine', description: 'For depression and OCD', price: 16.99, category: 'Mental Health' },
        { name: 'Warfarin', description: 'Blood thinner', price: 9.29, category: 'Blood Thinner' },
        { name: 'Ciprofloxacin', description: 'Antibiotic for bacterial infections', price: 13.99, category: 'Antibiotics' },
        { name: 'Ranitidine', description: 'For stomach acid reduction', price: 7.99, category: 'Stomach' },
        { name: 'Escitalopram', description: 'For depression and anxiety', price: 17.29, category: 'Mental Health' },
        { name: 'Loratadine', description: 'For allergies', price: 6.29, category: 'Allergy' },
        { name: 'Montelukast', description: 'For asthma and allergies', price: 14.79, category: 'Respiratory' },
        { name: 'Doxycycline', description: 'Antibiotic for various infections', price: 11.29, category: 'Antibiotics' },
        { name: 'Gabapentin', description: 'For nerve pain and seizures', price: 13.49, category: 'Pain Relief' },
        { name: 'Hydrochlorothiazide', description: 'Diuretic for high blood pressure', price: 8.79, category: 'Blood Pressure' },
        { name: 'Tramadol', description: 'For moderate to severe pain', price: 12.29, category: 'Pain Relief' },
        { name: 'Azithromycin', description: 'Antibiotic for bacterial infections', price: 15.49, category: 'Antibiotics' },
        { name: 'Prednisone', description: 'Corticosteroid for inflammation', price: 9.79, category: 'Anti-inflammatory' }
      ];
      
      const insertMedicine = db.prepare("INSERT INTO medicines (name, description, price, category) VALUES (?, ?, ?, ?)");
      
      sampleMedicines.forEach(medicine => {
        insertMedicine.run(medicine.name, medicine.description, medicine.price, medicine.category);
      });
      
      insertMedicine.finalize();
      console.log('Sample medicines data inserted');
    }
  });
});
}

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the database connection for routes to use
// module.exports = { db, upload };