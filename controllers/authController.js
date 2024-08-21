const crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const redisClient = require('../utils/cacheUtils');
const emailQueue = require('../queues/emailQueue');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

class AuthController {
  static async RegisterUser(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        listOfInterest,
        tel,
        birthDate,
        maritalStatus,
        address,
        gender
      } = req.body
      console.log("hh");
      if (!email) {
        return res.status(400).json(
          { status : "error",
            message : "Missing Email" }
        );
      }
      console.log("jj");
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        
        if (existingUser.emailVerified === false) {
          return res.status(400).json(
            { status : "error",
              message : "User Already Exist but Email is not Verified" }
          );
        }
        console.log("cc");
        return res.status(400).json(
          { status : "error",
            message : "User Already Exist" }
        );
      }
      
      const otp = crypto.randomInt(100000, 999999);
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      const newUser = new User({
        firstName,
        lastName,
        email,
        listOfInterest,
        maritalStatus,
        tel,
        birthDate,
        otp,
        otpExpires,
        address,
        gender
      });
      
      newUser.generateBio();
      await newUser.hashPassword(password)
      await newUser.save();
      
      // add job
      await emailQueue.add({
        to: email,
        subject: 'Verify Email OTP',
        text: `Please verify your email with the folowing OTP : ${otp}`
      });

      console.log(newUser);
      return res.status(201).json({
        status: 'succes',
        message: 'User create successfully',
      });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  };

  static async VerifyEmail(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        })
      };

      if (!otp) {
        return res.status(400).json({
          status: 'error',
          message: 'OTP is required'
        })
      };

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'User Not Found',
        })
      };

      if (user.otp !== otp) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid OTP',
        })
      };

      if (new Date() > user.otpExpires) {
        return res.status(400).json({
          status: 'error',
          message: 'OTP has expired',
        })
      };

      user.emailVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;

      await user.save()

      const token = generateToken(user);
      const key = `auth_${token}`
      await redisClient.set(key, user.id, 3600);

      return res.status(200).json({
        status : 'succes',
        message: 'Email verified successfuly',
        token
      });
    } catch(err) {
      return res.status(500).json({
        status : 'error',
        message: err.message,
      });
    }
  };

  static async Login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        })
      };

      if (!password) {
        return res.status(400).json({
          status: 'error',
          message: 'password is required'
        })
      };

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Account Not Found',
        })
      };

      if (!user.emailVerified) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is not Verified',
        })
      };

      const ismatch = await user.comparePassword(password);

      if (!ismatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid password',
        })
      };

      const token = generateToken(user);
      const key = `auth_${token}`
      await redisClient.set(key, user.id, 3600);

      return res.status(200).json({
        status: 'success',
        message: 'Login Successful',
        token
      });
    } catch(err) {
      return res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  };

  static async Logout(req, res) {
    const haedtoken = req.headers['authorization'];
    const token = haedtoken.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      await redisClient.del(`auth_${token}`);
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static async ForgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');

      await redisClient.set(`reset_${resetToken}`, user.id, 3600);
  
      const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;  

      await emailQueue.add({
        to: email,
        subject: 'Password Reset',
        text: `Please use The following Token to reset your password  : ${resetUrl}`
      });

      res.status(200).json({ status: 'succes', message: 'Password reset email sent', resetUrl });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static async ResetPassword(req, res) {
    const { token } = req.query;
    const { newPassword } = req.body;
  
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token, and new password are required' });
    }
  
    try {
      const userId = await redisClient.get(`reset_${token}`);
      if (!userId) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.hashPassword(newPassword);
      await user.save();
  
      await redisClient.del(`reset_${token}`);
  
      res.status(200).json({ message: 'Password successfully reset' });
    } catch (err) {
      console.error(`Error resetting password: ${err.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

module.exports = AuthController
