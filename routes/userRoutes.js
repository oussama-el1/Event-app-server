const express = require('express');
const UserController = require('../controllers/userController')
const ProtectMidll = require('../middlewares/Authenticated')
const upload = require('../middlewares/uploadImage'); 

const UserRouter = express.Router();

UserRouter.get('/me', ProtectMidll, UserController.getMe);
UserRouter.put('/user', ProtectMidll, upload.single('profilePicture'), UserController.updateMe);

module.exports = UserRouter
