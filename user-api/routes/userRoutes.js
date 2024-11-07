const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');
const router = express.Router();

// Multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF formats are allowed'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter 
});

// POST: Create User
router.post('/user/create', async (req, res) => {
    const { fullName, email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate full name
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(fullName)) {
        return res.status(400).json({ message: 'Full name should contain only letters and spaces' });
    }

    if (fullName.length < 3 || fullName.length > 100) {
        return res.status(400).json({ message: 'Full name must be between 3 and 100 characters' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Proceed with creating the user if all validations pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const newUser = await User.create({ fullName, email, password: hashedPassword });
        res.status(201).json({ message: 'User created', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT: Update User with strong password validation and full name validation
router.put('/user/edit', async (req, res) => {
    const { email, fullName, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate full name
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!fullName) {
        return res.status(400).json({ message: 'Full name is required' });
    }
    if (!nameRegex.test(fullName)) {
        return res.status(400).json({ message: 'Full name should contain only letters and spaces' });
    }
    if (fullName.length < 3 || fullName.length > 100) {
        return res.status(400).json({ message: 'Full name must be between 3 and 100 characters' });
    }

    // Validate password strength if it's provided
    if (password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
        }
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update full name and password (password is hashed)
        if (fullName) user.fullName = fullName;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// DELETE: Delete User
router.delete('/user/delete', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: Retrieve All Users
router.get('/user/getAll', async (req, res) => {
    try {
        const users = await User.find({}, 'fullName email password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Upload Image
router.post('/user/uploadImage', (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError || err?.message.includes('Only JPEG, PNG, and GIF formats')) {
            return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and GIF formats are allowed.' });
        } else if (err) {
            return res.status(500).json({ message: 'An unexpected error occurred.', error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { email } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded or invalid file type' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.imagePath = req.file.path;
        await user.save();

        res.status(200).json({
            message: 'Image uploaded successfully',
            path: req.file.path,
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


module.exports = router;
