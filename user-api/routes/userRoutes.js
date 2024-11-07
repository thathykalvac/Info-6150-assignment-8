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
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF formats are allowed'));
        }
    }
});

// POST: Create User
router.post('/user/create', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const newUser = await User.create({ fullName, email, password: hashedPassword });
        res.status(201).json({ message: 'User created', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT: Update User
router.put('/user/edit', async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.status(200).json({ message: 'User updated' });
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
router.post('/user/uploadImage', upload.single('image'), async (req, res) => {
    const { email } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Image upload failed. Please ensure the file is JPEG, PNG, or GIF format.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.imagePath = req.file.path;
        await user.save();

        res.status(200).json({ message: 'Image uploaded successfully', path: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
