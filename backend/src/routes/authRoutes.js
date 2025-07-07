const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// POST /api/signup
router.post('/signup', async(request, response) => {
    try {
        const {username, password, role} = request.body;

        if (!username || !password || !role) {
            return response.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({username});
        if (existingUser) {
            return response.status(400).json({message: 'Username already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ username, password: hashedPassword, role});
        await user.save();

        response.status(201).json({message: 'User created successfully'});
    } catch (err) {
        response.status(500).json({message: 'Signup failed', error: err.message})
    }
})

// POST /api/login
router.post('/login', async (request, response) => {
    try {
        const {username, password} = request.body;

        const user = await User.findOne({username});
        if (!user){
            return response.status(400).json({message: 'Invalid Username'});
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch){
            return response.status(400).json({message: 'Invalid Password'});
        }

        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        );

        response.json({token, role: user.role})
    } catch (err) {
        response.status(500).json({message: 'Login failed', error: err.message})
    }
});

module.exports = router;