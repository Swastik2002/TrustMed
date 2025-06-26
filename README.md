# 🏥 TrustMed

**TrustMed** is a full-stack healthcare platform enabling patients, doctors, and admins to manage appointments, prescriptions, medicine orders, and user data — all in one place.

---

## 📍 Live Demo

🌐 [Frontend (Vercel)](https://swastik-trustmed.vercel.app)  
🌐 [Backend (Railway)](https://trustmed.onrender.com/)

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** SQLite (can be migrated to PostgreSQL)
- **File Uploads:** Multer
- **Hosting:** Railway (backend), Vercel (frontend)

---

## 📁 Project Structure

TrustMed/
├── backend/ # Node.js backend (Express + SQLite)
│ ├── routes/
│ ├── middleware/
│ ├── uploads/
│ ├── database.db
│ └── server.js
├── frontend/ # React frontend (Vite)
│ ├── public/
│ │ └── logo.png
│ ├── src/
│ ├── vite.config.js
│ └── .env

---

## 🔐 Features

### 👩‍⚕️ Patient Panel
- Book appointments with doctors
- View prescriptions
- Order medicines
- Track orders and profile

### 🩺 Doctor Panel
- Set availability schedule
- Manage appointments
- Generate prescriptions
- Access patient history

### 🛠 Admin Panel
- Manage patients and doctors
- Manage medicines and orders

---

### 📦 Future Enhancements
Full migration to PostgreSQL,
Add authentication (JWT/session),
Notifications (email/SMS) and 
Responsive mobile design improvements

### 👨‍💻 Author
Built with ❤️ by Swastik Garg
