const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please Enter your FirstName"],
  },

  lastName: {
    type: String,
    required: [true, "Please Enter your LastName"],
  },

  email: {
    type: String,
    required: [true, "Please Enter your Email"],
    unique: true,
  },

  hashedPassword: {
    type: String,
    required: true,
  },

  listOfInterest: {
    type: [String],
    required: [true, "Please Enter your Interests"],
  },

  maritalStatus: {
    type: String,
    enum: ['Married', 'Single', 'Prefer not to say', 'Other'],
    default: 'Prefer not to say',
  },

  tel: {
    type: String,
    required: [true, "Please Enter your Telephone Number"],
  },

  birthDate: {
    type: Date,
    required: true,
  },

  notification: {
    type: Boolean,
    default: true
  },

  darkMode: {
    type: Boolean,
    default: false
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  otp: { 
    type: String 
  },
  
  otpExpires: { 
    type: Date 
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  profilePicture: {
    type: String,
  },

  bio: {
    type: String,
    maxlength: 500
  },

  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.hashedPassword;
      delete ret.__v;
      ret.fullName = `${ret.firstName} ${ret.lastName}`;
      return ret;
    },
  },
});

UserSchema.methods.hashPassword = async function(password) {
  this.hashedPassword = await bcrypt.hash(password, 10);
}

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.hashedPassword);
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
