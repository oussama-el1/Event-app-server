const crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const redisClient = require('../utils/cacheUtils');


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
      } = req.body


      if (!email) {
        return res.status(400).json(
          { status : "error",
            message : "Missing Email" }
        );
      }

      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        
        if (existingUser.emailVerified === false) {
          return res.status(400).json(
            { status : "error",
              message : "User Already Exist but Email is not Verified" }
          );
        }

        return res.status(400).json(
          { status : "error",
            message : "User Already Exist" }
        );
      }
      
      const otp = crypto.randomInt(100000, 999999);
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

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
      });

      await newUser.hashPassword(password)
      await newUser.save();
      
      // send a otp to the User via Email
      console.log("Otp is : ", otp);

      return res.status(201).json({
        status: 'succes',
        message: 'User create successfully',
        data: newUser,
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
      await redisClient.set(key, user._id, 3600);

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
      console.log(ismatch);


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
  }

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
  
      res.status(200).json({ status: 'succes', message: 'Password reset email sent', resetUrl });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static async ResetPassword(req, res) {
    const { token } = req.query;
    const { currentPassword, newPassword } = req.body;
  
    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Token, current password, and new password are required' });
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
  
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
  
      await user.hashPassword(newPassword);
      await user.save();
  
      await redisClient.del(`reset_${token}`);
  
      res.status(200).json({ message: 'Password successfully reset' });
    } catch (err) {
      console.error(`Error resetting password: ${err.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  

  static async ProtectMidll(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const key = `auth_${token}`;
      const userid = await redisClient.get(key);
      if (userid !== user.id) {
        return res.sendStatus(403);
      };
   
      req.user = user;
      next();
    });
  };
}

module.exports = AuthController
