const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Zone = require('../models/Zone');
const jwt = require('jsonwebtoken');

// Middleware to check admin permissions
function isAdmin(req, res, next) {
    // Get the token from the request headers or query parameters or body
    const token = req.headers['authorization'] || req.query.token || req.body.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded);
        // Check if user is admin
        if (decoded.username === 'admin') {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden: Admin permission required' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}

// Validation middleware for creating or updating a zone
const validateZone = [
    body('centerLat').notEmpty().withMessage('Center latitude is required'),
    body('centerLng').notEmpty().withMessage('Center longitude is required'),
    body('radius').notEmpty().withMessage('Radius is required'),
    body('color').notEmpty().withMessage('Color is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('visible').notEmpty().withMessage('Visibility status is required'),
    body('credits').notEmpty().withMessage('Credits are required'),
];

// Create Zone
router.post('/', isAdmin, validateZone, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { 
        centerLat,
        centerLng,
        radius,
        color,
        message,
        visible,
        credits,
    } = req.body;

    try {
        const newZone = new Zone({ 
            centerLat,
            centerLng,
            radius,
            color,
            message,
            visible,
            credits, 
        });

        await newZone.save();
        res.status(201).send(newZone);
    } catch (error) {
        console.error('Error creating zone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Read Zones
router.get('/', async (req, res) => {
    try {
        const zones = await Zone.find();
        console.log(zones);
        res.send(zones);
    } catch (error) {
        console.error('Error fetching zones:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Zone
router.put('/:id', isAdmin, validateZone, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedZone = await Zone.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedZone) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        res.send(updatedZone);
    } catch (error) {
        console.error('Error updating zone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete Zone
router.delete('/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedZone = await Zone.findByIdAndDelete(id);
        if (!deletedZone) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        res.send({ message: 'Zone deleted' });
    } catch (error) {
        console.error('Error deleting zone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
