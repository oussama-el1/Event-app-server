const express = require('express');
const UserController = require('../controllers/userController');
const ProtectMidll = require('../middlewares/Authenticated');
const upload = require('../middlewares/uploadImage'); 

const UserRouter = express.Router();

UserRouter.get('/events', ProtectMidll, UserController.getEvents);
UserRouter.get('/bookings', ProtectMidll, UserController.getBookings);

UserRouter.get('/me', ProtectMidll, UserController.getMe);
UserRouter.get('/:id', ProtectMidll, UserController.getUser);
UserRouter.put('/me', ProtectMidll, upload.single('profilePicture'), UserController.updateMe);
UserRouter.post('/follow', ProtectMidll, UserController.followUser);
UserRouter.post('/unfollow', ProtectMidll, UserController.unfollowUser);
UserRouter.get('/followers', ProtectMidll, UserController.getFollowers);
UserRouter.get('/followings', ProtectMidll, UserController.getFollowings);
UserRouter.get('/followers-count', ProtectMidll, UserController.getFollowersCount);
UserRouter.get('/following-count', ProtectMidll, UserController.getFollowingCount);
UserRouter.get('/search', ProtectMidll, UserController.searchUsers);

module.exports = UserRouter;
