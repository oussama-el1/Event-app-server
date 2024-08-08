const express = require('express')
const AuthController = require('../controllers/authController')

const Authrouter = express.Router()

Authrouter.post('/register', AuthController.RegisterUser);
Authrouter.post('/verify-email', AuthController.VerifyEmail);

module.exports = Authrouter;
