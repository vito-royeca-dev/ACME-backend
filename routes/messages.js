const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Message = require("../models/Message");
const { NEW_MESSAGE } = require('../types/eventTyeps');

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
    
    const validateMessage = [
      body('title').notEmpty().withMessage('title is required'),
      body('body').notEmpty().withMessage('body is required'),
      body('credits').notEmpty().withMessage('Credits are required'),
    ];
    
    router.post('/', isAdmin, validateMessage, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { 
          title,
          body,
          credits,
        } = req.body;
    
        try {
            const newMessage = new Message({ 
              title,
              body,
              credits,
            });
    
            await newMessage.save();
            io.emit(NEW_MESSAGE, {
                data: newMessage,
            });
    
            res.status(201).send(newMessage);
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.get('/', async (req, res) => {
        try {
            const messages = await Message.find();
            res.send(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    
    router.delete('/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
    
        try {
            const deletedMessage = await Message.findByIdAndDelete(id);
            if (!deletedMessage) {
                return res.status(404).json({ message: 'Message not found' });
            }
    
            res.send({ message: 'Message deleted' });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    return router;
};