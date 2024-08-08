const crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../utils/cacheUtils');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
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

      const user = await User.findone({ email });
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

      const ismatch = await User.comparePassword(password);
      console.log(match);


      if (!ismatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid password',
        })
      };

      const token = generateToken(user);
      const key = `auth_${token}`
      await redisClient.set(key, user._id, 3600);

      return res.status(500).json({
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

  static async ProtectMidll(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const key = `auth_${token}`;
      const userid = await redisClient.get(key);
      if (userid !== user._id) {
        return res.sendStatus(403);
      };
   
      req.user = user;
      next();
    });
  }
}

module.exports = AuthController
