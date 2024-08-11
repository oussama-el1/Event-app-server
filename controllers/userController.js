const { validationResult, body } = require('express-validator');
const User = require('../models/User');

class UserController {
  /**
   * function getMe
   * get the current Authentificated User
   * return object for the user excluding the password and the secure fields
   */
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
  
  /**
   * The magic of Update a User  
   * Update the authentificated User profile and setting
   * Allowed Filed : firstName, lastName, bio,...
   * also you can update Notification and DarkMode...
   * this route can both body types : form-data or json
   * but for updating profile is mandatory to use form-data
   * To avoid probleme use form-data
   */
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

  static async followUser(req, res) {
    try {
      const currentUserId = req.user.id;
      const targetUserId = req.body.targetUserId;

      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }

      const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(targetUserId)
      ]);

      if (!currentUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (currentUser.following.includes(targetUserId)) {
        return res.status(400).json({ message: "You are already following this user" });
      }

      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await Promise.all([
        currentUser.save(),
        targetUser.save()
      ]);

      res.status(200).json({ message: "Successfully followed the user" });
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async unfollowUser(req, res) {
    const currentUserId = req.user.id;
    const targetUserId = req.body.targetUserId;
  
    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ message: 'User ID and target user ID are required' });
    }
  
    try {
      const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(targetUserId)
      ]);
  
      if (!currentUser || !targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!currentUser.following.includes(targetUserId)) {
        return res.status(400).json({ message: 'You are not following this user' });
      }

      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
  
      await Promise.all([
        currentUser.save(),
        targetUser.save()
      ]);
  
      res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error(`Error unfollowing user: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowers(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('followers');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const followers = user.followers;
      res.status(200).json(followers);
    } catch (error) {
      console.error(`Error getting followers: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowing(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('following');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const following = user.following;
      res.status(200).json(following);
    } catch (error) {
      console.error(`Error getting following: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowersCount(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const followersCount = user.followers.length;
      res.status(200).json({ followersCount });
    } catch (error) {
      console.error(`Error getting followers count: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowingCount(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const followingCount = user.following.length;
      res.status(200).json({ followingCount });
    } catch (error) {
      console.error(`Error getting following count: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowersDetails(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('followers');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const followers = user.followers;
      const followersDetails = followers.map((follower) => {
        return {
          fullname: `${follower.firstName} ${follower.lastName}`,
          profilePicture: follower.profilePicture
        };
      });
  
      res.status(200).json(followersDetails);
    } catch (error) {
      console.error(`Error getting followers details: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFollowingDetails(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('following');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const following = user.following;
      const followingDetails = following.map((following) => {
        return {
          fullname: `${following.firstName} ${following.lastName}`,
          profilePicture: following.profilePicture
        };
      });
      res.status(200).json(followingDetails);
    } catch (error) {
      console.error(`Error getting following details: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

}

module.exports = UserController;
