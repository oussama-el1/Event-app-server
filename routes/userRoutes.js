const express = require('express');
const UserController = require('../controllers/userController')
const ProtectMidll = require('../middlewares/Authenticated')

const UserRouter = express.Router();

UserRouter.get('/me', ProtectMidll, UserController.getMe)

module.exports = UserRouter
