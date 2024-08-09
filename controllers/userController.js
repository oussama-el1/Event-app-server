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
}

module.exports = UserController;
