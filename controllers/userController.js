const { validationResult, body } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Tickets')

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

      const userData = user.toObject();

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = user.toObject();

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
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
  };

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
  };

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
  };

  static async getFollowers(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('followers');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const followers = user.followers.map(follower => follower.toObject());

      res.status(200).json(followers);
    } catch (error) {
      console.error(`Error getting followers: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static async getFollowings(req, res) {
    const userId = req.user.id;
    try {
      const user = await User.findById(userId).populate('following');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const followings = user.following.map(following => following.toObject());
      res.status(200).json(followings);
    } catch (error) {
      console.error(`Error getting following: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Search users
   * exemple of request : http://localhost:5000/api/user/search?query=oussama
   * return : array of users
   */
  static async searchUsers(req, res) {
    const query = req.query.query.trim();
  
    if (query.length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters long' });
    }
  
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
  
    try {
      const result = await User.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { listOfInterest: { $regex: query, $options: 'i' } }
        ]
      })
      .skip((page - 1) * limit)
      .limit(limit);

      const totalUsers = await User.countDocuments({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { listOfInterest: { $regex: query, $options: 'i' } }
      ]
    });

      const users = result.map(user => user.toObject());

      res.status(200).json({
        users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit)
      });
    } catch (error) {
      console.error(`Error during search: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getEvents(req, res) {
    try {
      const userId = req.user.id;
      const { filterBy = {}, sortBy = {}, limit = 10, page = 1 } = req.query;

      const user = await User.findById(userId)
        .populate('createdEvents')
        .exec();

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      let events = user.createdEvents;

      if (filterBy.title) {
        events = events.filter(event => event.title.toLowerCase().includes(filterBy.title.toLowerCase()));
      }

      if (filterBy.startDate && filterBy.endDate) {
        const startDate = new Date(filterBy.startDate);
        const endDate = new Date(filterBy.endDate);
        events = events.filter(event => new Date(event.date) >= startDate && new Date(event.date) <= endDate);
      }

      if (filterBy.location) {
        events = events.filter(event => event.location.city.toLowerCase() === filterBy.location.toLowerCase());
      }

      if (filterBy.categories) {
        const categoriesArray = filterBy.categories.split(',').map(category => category.trim().toLowerCase());
        events = events.filter(event => event.categories.some(category => categoriesArray.includes(category.toLowerCase())));
      }

      const validSortOrder = (Sortorder) => {
        const validOrders = [1, -1, 'ASC', 'DESC'];
        if (validOrders.includes(Sortorder)) {
          return Sortorder === 'ASC' ? 1 : Sortorder === 'DESC' ? -1 : Sortorder;
        }
        return -1;
      };

      if (sortBy.date) {
        events = events.sort((a, b) => validSortOrder(sortBy.date) * (new Date(a.date) - new Date(b.date)));
      }

      const totalEvents = events.length;
      const totalPages = Math.ceil(totalEvents / limit);
      const paginatedEvents = events.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        events: paginatedEvents,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents,
        }
      });
    } catch (error) {
      console.error(`Error getting events: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getBookings(req, res) {
    try {
      const userId = req.user.id;
      const { filterBy = {}, sortBy = { date: -1 }, page = 1, limit = 10 } = req.query;

      const user = await User.findById(userId)
        .populate({
          path: 'bookedTickets',
          populate: {
            path: 'event',
          }
        })
        .exec();

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      console.log(user);

      let bookings = user.bookedTickets;

      if (filterBy.status) {
        const validStatus = ['Booked', 'Cancelled', 'Refunded'];

        if (!validStatus.includes(filterBy.status)) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid Booking Status',
          });
        }

        bookings = bookings.filter(ticket => ticket.status === filterBy.status);
      }

      if (filterBy.ticketType) {
        const validTypes = ['Standard', 'VIP'];

        if (!validTypes.includes(filterBy.ticketType)) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid Ticket Type',
          });
        }

        bookings = bookings.filter(ticket => ticket.ticketType === filterBy.ticketType);
      }

      const validSortOrder = (Sortorder) => {
        const validOrders = [1, -1, 'ASC', 'DESC'];
        if (validOrders.includes(Sortorder)) {
          return Sortorder === 'ASC' ? 1 : Sortorder === 'DESC' ? -1 : Sortorder;
        }
        return -1;
      };

      if (sortBy.date) {
        bookings = bookings.sort((a, b) => validSortOrder(sortBy.date) * (a.event.date - b.event.date));
      }

      if (sortBy.purchaseDate) {
        bookings = bookings.sort((a, b) => validSortOrder(sortBy.purchaseDate) * (a.purchaseDate - b.purchaseDate));
      }

      if (sortBy.price) {
        bookings = bookings.sort((a, b) => validSortOrder(sortBy.price) * (a.price - b.price));
      }

      const totalBookings = bookings.length;
      const totalPages = Math.ceil(totalBookings / limit);
      const paginatedBookings = bookings.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        bookings: paginatedBookings,
        pagination: {
          page: parseInt(page),
          totalPages,
          totalBookings,
        }
      });
    } catch (err) {
      console.error(`Error getting bookings: ${err.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = UserController;
