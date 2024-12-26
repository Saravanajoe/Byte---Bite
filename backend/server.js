const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_secret_key_here';

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/byteandbite', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Models
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
}));

const Cafe = mongoose.model('Cafe', new mongoose.Schema({
    cafeName: String,
    location: String,
    games: String,
    consoles: String,
    openClose: String,
    phoneNumber: String,
    instagram: String,
    feePerHour: Number,
    foodMenu: Array,
    image: String,
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
    cafeName: String,
    slot: String,
    user: String,
}));

// Routes

// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ username }, JWT_SECRET);
    res.send({ message: 'Login successful', token });
});

// Add Cafe
const upload = multer({ dest: 'uploads/' });
app.post('/add-cafe', upload.single('image'), async (req, res) => {
    const { cafeName, location, games, consoles, openClose, phoneNumber, instagram, feePerHour, foodMenu } = req.body;
    const cafe = new Cafe({
        cafeName,
        location,
        games,
        consoles,
        openClose,
        phoneNumber,
        instagram,
        feePerHour,
        foodMenu: JSON.parse(foodMenu),
        image: `/uploads/${req.file.filename}`,
    });
    await cafe.save();
    res.status(201).send({ message: 'Cafe added successfully' });
});

// Get Cafes
app.get('/cafes', async (req, res) => {
    const cafes = await Cafe.find();
    res.send(cafes);
});

// Book Slot
app.post('/book-slot', async (req, res) => {
    const { cafeName, slot, user } = req.body;
    const booking = new Booking({ cafeName, slot, user });
    await booking.save();
    res.status(201).send({ message: 'Slot booked successfully' });
});

// Get Bookings
app.get('/bookings/:cafeName', async (req, res) => {
    const { cafeName } = req.params;
    const bookings = await Booking.find({ cafeName });
    res.send(bookings);
});

// Delete Cafe
app.delete('/delete-cafe/:id', async (req, res) => {
    const { id } = req.params;
    await Cafe.findByIdAndDelete(id);
    res.send({ message: 'Cafe deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
// Admin Login Endpoint
app.post('/login', async (req, res) => {
    console.log("Request Body:", req.body); // Log the request body

    const { username, password } = req.body;

    // Example admin credentials
    const adminUsername = "admin";
    const adminPassword = "1234";

    if (username === adminUsername && password === adminPassword) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ message: "Login successful", token });
    } else {
        res.status(401).send({ message: "Invalid username or password" });
    }
});

