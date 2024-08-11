const express = require('express');
const UserController = require('../controllers/userController')
const ProtectMidll = require('../middlewares/Authenticated')
const upload = require('../middlewares/uploadImage'); 

const UserRouter = express.Router();

UserRouter.get('/me', ProtectMidll, UserController.getMe);
UserRouter.put('/user', ProtectMidll, upload.single('profilePicture'), UserController.updateMe);
UserRouter.post('/follow', ProtectMidll, UserController.followUser);
UserRouter.post('/unfollow', ProtectMidll, UserController.unfollowUser);
UserRouter.get('/followers', ProtectMidll, UserController.getFollowers);
UserRouter.get('/followings', ProtectMidll, UserController.getFollowings);
UserRouter.get('/followers-count', ProtectMidll, UserController.getFollowersCount);
UserRouter.get('/following-count', ProtectMidll, UserController.getFollowingCount);

module.exports = UserRouter