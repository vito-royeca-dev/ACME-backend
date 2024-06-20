const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Distance = require('../models/Distance');

// Read Users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// Update User
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
  res.send(updatedUser);
});

router.post('/update-distance', async (req, res) => {
  const { userId, distance } = req.body;
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

    res.status(200).send('Distance updated successfully');
  } catch (error) {
    console.error('Error updating distance and credits:', error);
    res.status(500).send('Internal Server Error');
  }
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
          totalDistance: { $ifNull: ['$totalDistance', 0] }
        }
      }
    ]);

    res.json(usersWithDistance);
  } catch (error) {
    console.error('Error fetching users with distance:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/update-credits', async (req, res) => {
  const { userId, credits } = req.body;
  try {
    const existingUser = await User.findById(userId);

    if (existingUser) {
      existingUser.credits += credits;
      await existingUser.save();
      res.status(200).send('Distance updated successfully');
    } else {
      res.status(500);
    }
  } catch (error) {
    console.error('Error updating distance and credits:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
