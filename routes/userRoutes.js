const express = require('express');
const UserController = require('../controllers/userController');
const ProtectMidll = require('../middlewares/Authenticated');
const upload = require('../middlewares/uploadImage');

const UserRouter = express.Router();

UserRouter.get('/me', ProtectMidll, UserController.getMe);
UserRouter.put('/me', ProtectMidll, upload.single('profilePicture'), UserController.updateMe);
UserRouter.post('/follow', ProtectMidll, UserController.followUser);
UserRouter.post('/unfollow', ProtectMidll, UserController.unfollowUser);
UserRouter.get('/followers', ProtectMidll, UserController.getFollowers);
UserRouter.get('/followings', ProtectMidll, UserController.getFollowings);
UserRouter.get('/search', ProtectMidll, UserController.searchUsers);
UserRouter.get('/events', ProtectMidll, UserController.getEvents);
UserRouter.get('/bookings', ProtectMidll, UserController.getBookings);

// get a specifique user profile
UserRouter.get('/:id', ProtectMidll, UserController.getUser);

module.exports = UserRouter;
