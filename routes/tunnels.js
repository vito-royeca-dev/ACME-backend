const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const Tunnel = require('../models/Tunnel');
const { io } = require('../server');
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
    
    const validateTunnel = [
        body('startLat').notEmpty().withMessage('Start latitude is required'),
        body('startLng').notEmpty().withMessage('Start longitude is required'),
        body('endLat').notEmpty().withMessage('End latitude is required'),
        body('endLng').notEmpty().withMessage('End longitude is required'),
        body('color').notEmpty().withMessage('Color is required'),
        body('opacity').notEmpty().withMessage('Opacity is required'),
        body('message').notEmpty().withMessage('Message is required'),
        body('visible').notEmpty().withMessage('Visibility status is required'),
        body('credits').notEmpty().withMessage('Credits are required'),
    ];
    
    router.post('/', isAdmin, validateTunnel, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const {
            startLat,
            startLng,
            endLat,
            endLng,
            color,
            opacity,
            message,
            visible,
            credits,
        } = req.body;
    
        try {
            const newTunnel = new Tunnel({
                startLat,
                startLng,
                endLat,
                endLng,
                color,
                opacity,
                message,
                visible,
                credits,
            });
    
            await newTunnel.save();
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "create",
                type: "tunnel",
                data: newTunnel,
            });
    
            res.status(201).send(newTunnel);
        } catch (error) {
            console.error('Error creating tunnel:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.get('/', async (req, res) => {
        try {
            const tunnels = await Tunnel.find();
            res.send(tunnels);
        } catch (error) {
            console.error('Error fetching tunnels:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.put('/:id', isAdmin, validateTunnel, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { id } = req.params;
        const updates = req.body;
    
        try {
            const updatedTunnel = await Tunnel.findByIdAndUpdate(id, updates, { new: true });
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "update",
                type: "tunnel",
                data: updatedTunnel,
            });
            
            res.send(updatedTunnel);
        } catch (error) {
            console.error('Error updating tunnel:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.delete('/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
        try {
            await Tunnel.findByIdAndDelete(id);
            io.emit(ZONE_TUNNEL_CHANGE, {
                action: "delete",
                type: "tunnel",
                data: id,
            });
    
            res.send({ message: 'Tunnel deleted' });
        } catch (error) {
            console.error('Error deleting tunnel:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    return router;
};

