const express = require('express');
const router = express.Router();
const { db } = require('../server');
const upload = require('../middleware/upload');
const Tesseract = require('tesseract.js');
const path = require('path');
const stringSimilarity = require('string-similarity');

// Get all medicines (with optional filters)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM medicines';
  let params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  if (search) {
    query += category ? ' AND' : ' WHERE';
    query += ' (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY name';

  db.all(query, params, (err, medicines) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(medicines);
  });
});

// Get medicine by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM medicines WHERE id = ?', [req.params.id], (err, medicine) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  });
});

// Get all medicine categories
router.get('/categories/all', (req, res) => {
  db.all('SELECT DISTINCT category FROM medicines ORDER BY category', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(categories.map(cat => cat.category));
  });
});

// OCR prescription image and match against medicines
router.post('/extract-prescription', upload.single('prescriptionImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const { data } = await Tesseract.recognize(
      path.join(__dirname, '..', 'uploads', req.file.filename),
      'eng'
    );

    const rawText = data.text;
    const cleanedText = rawText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with one
      .trim();

    // Split text into individual words
    const words = cleanedText.split(' ');

    // Fetch all medicines from the database
    db.all('SELECT * FROM medicines', [], (err, allMedicines) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      const matchedMedicines = [];

      allMedicines.forEach(med => {
        const medNameLower = med.name.toLowerCase();  // Normalize medicine name

        // Check for substring match
        words.forEach(word => {
          if (medNameLower.includes(word)) {
            // If a substring match is found, add to matchedMedicines only if not already added
            if (!matchedMedicines.some(existingMed => existingMed.name.toLowerCase() === med.name.toLowerCase())) {
              matchedMedicines.push(med);
            }
            return; // No need to continue checking other words if a match is found
          }
        });

        // If no substring match, check for fuzzy match using string-similarity
        if (matchedMedicines.indexOf(med) === -1) {
          const similarity = stringSimilarity.compareTwoStrings(cleanedText, medNameLower);
          if (similarity > 0.6) { // Threshold for fuzzy matching
            // Only add if not already in the list
            if (!matchedMedicines.some(existingMed => existingMed.name.toLowerCase() === med.name.toLowerCase())) {
              matchedMedicines.push(med);
            }
          }
        }
      });

      // Return the matched medicines and extracted text
      res.json({
        success: true,
        extractedText: rawText,
        matchedMedicines
      });
    });
  } catch (err) {
    console.error('OCR error:', err);
    res.status(500).json({ message: 'Failed to process image' });
  }
});

// Add a new medicine (with optional image upload)
router.post('/add', upload.single('image'), (req, res) => {
  const { name, description, price, category, in_stock } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const sql = `
    INSERT INTO medicines (name, description, price, category, in_stock, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [name, description, price, category, in_stock, image_url], function (err) {
    if (err) {
      console.error('Error inserting medicine:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ id: this.lastID, message: 'Medicine added successfully' });
  });
});

module.exports = router;
