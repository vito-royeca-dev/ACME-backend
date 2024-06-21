const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Zone = require('../models/Zone');
const { ZONE_TUNNEL_CHANGE } = require('../types/eventTyeps');

module.exports = (io) => {
    const router = express.Router();

    function isAdmin(req, res, next) {
        const token = req.headers['authorization'] || req.query.token || req.body.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
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
    
    const validateZone = [
        body('centerLat').notEmpty().withMessage('Center latitude is required'),
        body('centerLng').notEmpty().withMessage('Center longitude is required'),
        body('radius').notEmpty().withMessage('Radius is required'),
        body('color').notEmpty().withMessage('Color is required'),
        body('message').notEmpty().withMessage('Message is required'),
        body('visible').notEmpty().withMessage('Visibility status is required'),
        body('credits').notEmpty().withMessage('Credits are required'),
    ];
    
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
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "create",
                type: "zone",
                data: newZone,
            });
    
            res.status(201).send(newZone);
        } catch (error) {
            console.error('Error creating zone:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.get('/', async (req, res) => {
        try {
            const zones = await Zone.find();
            res.send(zones);
        } catch (error) {
            console.error('Error fetching zones:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
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
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "update",
                type: "zone",
                data: updatedZone,
            });
    
            res.send(updatedZone);
        } catch (error) {
            console.error('Error updating zone:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.delete('/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
    
        try {
            const deletedZone = await Zone.findByIdAndDelete(id);
            if (!deletedZone) {
                return res.status(404).json({ message: 'Zone not found' });
            }
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "delete",
                type: "zone",
                data: id,
            });
    
            res.send({ message: 'Zone deleted' });
        } catch (error) {
            console.error('Error deleting zone:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    return router;
};