
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

  gender: {
    type: String,
    enum: ['Male', 'Female']
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
      ref: 'User',
      unique: true
    }
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true
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
    country: {
      type: String,
      required: [true, "Country is required"],
    }
  },

  createdEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  ],

  bookedTickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
  ],
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.hashedPassword;
      delete ret.__v;
      delete ret.followers;
      delete ret.following;
      delete ret.createdEvents;
      delete ret.bookedTickets;

      ret.fullName = `${ret.firstName} ${ret.lastName}`;
      return ret;
    },
  },
});

UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });
UserSchema.index({ listOfInterest: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });


UserSchema.methods.hashPassword = async function(password) {
  this.hashedPassword = await bcrypt.hash(password, 10);
}

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.hashedPassword);
}

UserSchema.methods.generateBio = function() {
  const { firstName, lastName, email, listOfInterest, maritalStatus, tel, birthDate, address } = this;

  const interests = listOfInterest.join(', ');
  const addressString = address ? `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}` : 'Not provided';

  const bio = `
    Hi, I'm ${firstName} ${lastName}.
    You can reach me at ${email}.
    I am ${maritalStatus} and my contact number is ${tel}.
    I was born on ${birthDate.toDateString()}.
    My interests include ${interests}.
    My address is ${addressString}.
  `;

  this.bio = bio.trim();

  return this.bio;
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
