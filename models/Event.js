const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available',
  }
});

const EventSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event Title is required'],
  },

  description: {
    type: String,
    required: [true, 'Event description is required'],
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
    required: [true, 'Event ticket limit is required'],
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

  seats: [SeatSchema],

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

  ticketPricing: {
    standard: {
      type: Number,
      required: [true, 'Standard ticket price is required'],
    },
    vip: {
      type: Number,
      required: [true, 'VIP ticket price is required'],
    }
  }
});

EventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

EventSchema.index({ date: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ isPublic: 1, date: 1 });

EventSchema.methods.getTicketPrice = function(ticketType) {
  switch (ticketType) {
    case 'Standard':
      return this.ticketPricing.standard;
    case 'VIP':
      return this.ticketPricing.vip;
    default:
      throw new Error('Invalid ticket type');
  }
};

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
