const express = require('express')

const AuthController = require('../controllers/authController')
const ProtectMidll = require('../middlewares/Authenticated')

const Authrouter = express.Router()

Authrouter.post('/register', AuthController.RegisterUser);
Authrouter.post('/verify-email', AuthController.VerifyEmail);
Authrouter.post('/login', AuthController.Login);
Authrouter.post('/logout', ProtectMidll, AuthController.Logout);
Authrouter.post('/forgot-password', AuthController.ForgotPassword);
Authrouter.post('/reset-password', AuthController.ResetPassword);

module.exports = Authrouter;
