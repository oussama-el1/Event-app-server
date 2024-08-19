const mongoose = require('mongoose');

const TicketShema = mongoose.Schema({

  bookingId: {
    type: String,
    unique: true,
    match: /^[A-Za-z0-9]{8}$/,
    required: true,
  },

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']  
  },

  ticketType: {
    type: String,
    enum: ['Standard', 'VIP'],
    required: true,
  },

  purchaseDate: {
    type: Date,
    default: Date.now,
  },

  seatNumber: {
    type: 'String',
  },

  price: {
    type: Number,
    required: [true, 'Price is Required']
  },

  status: {
    type: String,
    enum: ['Booked', 'cancelled', 'Refunded'],
    default: 'Booked',
  },

  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },

  qrCode: {
    type: String,
  }
});

const Ticket = mongoose.model('Ticket', TicketShema);

module.exports = Ticket;
