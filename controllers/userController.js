const { validationResult, body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

class UserController {
  static async getMe(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { ...userData } = user.toObject();

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateMe(req, res) {
    await body('firstName').optional().isString().withMessage('First name must be a string').run(req);
    await body('lastName').optional().isString().withMessage('Last name must be a string').run(req);
    await body('tel').optional().isString().withMessage('Telephone must be a string').run(req);
    await body('birthDate').optional().isISO8601().withMessage('Invalid birth date format').run(req);
    await body('profilePicture').optional().isString().withMessage('Profile picture URL must be a string').run(req);
    await body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters').run(req);
    await body('address').optional().isObject().withMessage('Address must be an object').run(req);
    await body('listOfInterest').optional().isArray().withMessage('listOfInterest must be an array').custom((value) => value.every(item => typeof item === 'string'))
        .withMessage('Each item in listOfInterest must be a string');

    await body('maritalStatus').optional().isIn(['Married', 'Single', 'Prefer not to say', 'Other']);
    await body('notification').optional().isBoolean();
    await body('darkMode').optional().isBoolean();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const updates = req.body;

      console.log('after file midll :', req.body);


      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in request' });
      }

      const allowedFields = ['firstName', 'lastName', 'tel', 'birthDate', 'bio', 'address', 'listOfInterest', 'maritalStatus', 'notification', 'darkMode'];

      const filteredUpdates = Object.keys(updates)
        .filter(field => allowedFields.includes(field))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      
        if (req.file) {
          filteredUpdates.profilePicture = req.file.path;
        }

      const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = user.toObject();

      res.status(200).json(userData);
    } catch (error) {
      console.error(`Error updating user: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async FolowUser(req, res) {
  }

  static async UnfolowUser(req, res) {
  }
}

module.exports = UserController;
