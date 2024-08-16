const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event Title is required'],
  },

  description: {
    type: String,
    reuired: [true, 'Event description is required'],
  },

  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },

  location: {
    address: {
      type: String,
      required: [true, 'Event address is required'],  
    },
    city: String,
    state: String,
    zip: String,
    country: String
  },

  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required'],
  },

  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
  ],

  ticketLimit: {
    type: Number,
    require: [true, 'Event ticketLimit is required'],
  },

  ticketSold: {
    type: Number,
    default: 0
  },

  categories: [
    {
      type: String,
      enum: ['Music', 'Sports', 'Conference', 'Festival', 'Other']
    }
  ],

  media: [
    {
      type: String,
    }
  ],

  isPublic: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

EventSchema.pre('save', function(next) {
  this.updatedAt = date.now(),
  next();
});

EventSchema.index({ date: 1});
EventSchema.index({ organizer: 1 });
EventSchema.index({ isPublic: 1, date: 1});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
