const express = require('express');

const User = require('../models/User');
const Distance = require('../models/Distance');
const { LOCATION_UPDATE, CREDIT_UPDATE } = require('../types/eventTyeps');

module.exports = (io) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
  });
  
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.send(updatedUser);
  });

  router.get('/users-by-date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const startDate = new Date(date).setHours(0, 0, 0, 0);
      const endDate = new Date(date).setHours(23, 59, 59, 999);
  
      const usersWithDistance = await User.aggregate([
        {
          $lookup: {
            from: 'distances',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $gte: ['$date', new Date(startDate)] },
                      { $lt: ['$date', new Date(endDate)] }
                    ]
                  }
                }
              }
            ],
            as: 'distances'
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userName: '$name',
            userEmail: '$email',
            userCredits: '$credits',
            userLocation: '$location',
            totalDistance: {
              $sum: {
                $map: {
                  input: '$distances',
                  as: 'distance',
                  in: '$$distance.distance'
                }
              }
            }
          }
        },
        {
          $addFields: {
            totalDistance: { $ifNull: ['$totalDistance', 0] },
            userLocation: {$ifNull: ['$userLocation', {longitude: 0, latitude: 0}]}
          }
        }
      ]);
  
      res.json(usersWithDistance);
    } catch (error) {
      console.error('Error fetching users with distance:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/update-distance-location', async (req, res) => {
    
    const { userId, distance, location } = req.body;
    console.log("update-distance-location", userId, distance, location);
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const existingDistance = await Distance.findOne({ userId, date: today });
  
      if (existingDistance) {
        existingDistance.distance += distance;
        await existingDistance.save();
      } else {
        const newDistance = new Distance({ userId, date: today, distance });
        await newDistance.save();
      }
  
      // Update user credits
      const user = await User.findById(userId);
      if (user) {
        user.location = location; // Assume 1 distance unit equals 1 credit
        await user.save();
      }

      io.emit(LOCATION_UPDATE, {
        userId,
        location,
      });

      res.status(200).send('Distance and location updated successfully');
    } catch (error) {
      console.error('Error updating distance and location:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/update-credits' , async (req, res) => {
    const { userId, credits } = req.body;
    console.log("update-crdits", userId, credits);
    try {
      const user = await User.findById(userId);
      if (user) {
        user.credits += credits;
        await user.save();
        io.emit(CREDIT_UPDATE, user);
        res.status(200).send('Distance and location updated successfully');
      } else {
        res.status(200).send("The user doesn't exist");
      }
    } catch (e) {
      console.error('Error updating credits:', e);
      res.status(500).send('Internal Server Error');
    }
  })
  return router;
}