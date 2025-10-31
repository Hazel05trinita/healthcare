// Import Modules
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();

// Middlewares
app.use(cors()); // Allows cross-origin requests [cite: 131]
app.use(express.json()); // Parses incoming JSON data [cite: 381]

// 1. Connect to MongoDB (using your 'healthcare' database)
mongoose.connect("mongodb://127.0.0.1:27017/healthcare") // Adapted from 'college' [cite: 370]
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// 2. Define Schema and Model for Prescriptions
const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true }, 
  drugName: { type: String, required: true },
  dosage: { type: String, required: true },
  // _id is automatically created by MongoDB
});


// 'Prescription' is the model name, 'prescriptions' is the actual collection name in MongoDB [cite: 379]
const Prescription = mongoose.model("Prescription", prescriptionSchema, 'prescriptions'); 

// --- Appointment Schema and Model ---
const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    reason: { type: String, required: false } // Reason can be optional
});

const Appointment = mongoose.model("Appointment", appointmentSchema, 'appointments');

const bcrypt = require('bcrypt'); // Add this line at the top

// --- User Schema and Model Definition ---
const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password will be stored here
  created_at: { type: Date, default: Date.now }
});

// Create the User Model, linking it to a 'users' collection
const User = mongoose.model("User", userSchema, 'users');

// --- Now add new routes below your Prescription APIs ---
// 3. API to view all prescriptions (Read/Fetch) [cite: 384]
app.get("/api/viewAll", async (req, res) => {
  const prescriptions = await Prescription.find();
  res.send(prescriptions);
});

// 4. API to add a new prescription (Create/Insert) [cite: 385]
app.post("/api/addNew", async (req, res) => {
  try{
    // Extract data from the request body
    const { patientName, drugName, dosage } = req.body;
    
    // Create new prescription document
    const newPrescription = new Prescription({ patientName, drugName, dosage });
    await newPrescription.save();
    
    res.json({status: "Prescription Saved Successfully"});
  } catch(err) {
    // Handle errors (like validation failure)
    res.json({status: err.message});
  }
});

// 5. API to delete a prescription using ID (Delete) [cite: 386]
app.post("/api/deleteUser", async (req, res) => {
  const { id } = req.body;
  try {
    // Find the record by its unique ID and delete it
    await Prescription.findByIdAndDelete(id);
    res.json({ status: "Prescription deleted successfully" });
  } catch (err) {
    res.json({ status: "Error deleting prescription" });
  }
});

// --- Appointment APIs ---

// API to view all appointments
app.get("/api/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ appointmentDate: 1 }); // Sort by date
        res.send(appointments);
    } catch (err) {
        res.status(500).json({ status: "Error fetching appointments", error: err.message });
    }
});

// API to add a new appointment
app.post("/api/appointments/new", async (req, res) => {
    try {
        const { patientName, doctorName, appointmentDate, reason } = req.body;
        
        const newAppointment = new Appointment({ 
            patientName, 
            doctorName, 
            appointmentDate: new Date(appointmentDate), // Convert string to Date object
            reason 
        });
        await newAppointment.save();
        
        res.json({ status: "Appointment Scheduled Successfully" });
    } catch(err) {
        res.json({status: err.message});
    }
});

// API to delete an appointment
app.post("/api/deleteAppointment", async (req, res) => {
    const { id } = req.body;
    await Appointment.findByIdAndDelete(id);
    res.json({ status: "Appointment Canceled Successfully" });
});

// API to update an appointment
app.post("/api/appointments/update", async (req, res) => {
    try {
        const { id, patientName, doctorName, appointmentDate, reason } = req.body;

        await Appointment.findByIdAndUpdate(id, {
            patientName,
            doctorName,
            appointmentDate: new Date(appointmentDate), // Ensure date is a Date object
            reason
        });

        res.json({ status: "Appointment Updated Successfully" });
    } catch (err) {
        res.status(500).json({ status: "Error updating appointment", error: err.message });
    }
});


// 1. API to handle User Registration
app.post("/api/register", async (req, res) => {
    try {
        const { full_name, email, username, password } = req.body;

        // Check for existing user (username or email)
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json({ status: "User already exists. Check username or email." });
        }

        // Hash the password securely (Cost factor of 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            full_name,
            email,
            username,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ status: "Registration successful!" });

    } catch (err) {
        res.status(500).json({ status: "Server error during registration.", error: err.message });
    }
});

// 2. API to handle User Login
app.post("/api/login", async (req, res) => {
    try {
        const { identifier, password } = req.body; // 'identifier' can be username or email

        // Find user by username OR email
        const user = await User.findOne({ 
            $or: [{ email: identifier }, { username: identifier }] 
        });

        if (!user) {
            return res.status(401).json({ status: "Invalid Credentials: User not found." });
        }

        // Compare provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ status: "Invalid Credentials: Password incorrect." });
        }

        // Login successful (In a real app, you would issue a JWT token here)
        res.json({ 
            status: "Login successful!", 
            user: { username: user.username, full_name: user.full_name } 
        });

    } catch (err) {
        res.status(500).json({ status: "Server error during login.", error: err.message });
    }
});

// 6. Start the server
const PORT = 7000; // Server port used in the document [cite: 387]
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});