const fs = require('fs');
const path = require('path');

const { generateUniqueBookingId, generateQRCode } = require('../utils/helpers');
const User = require('../models/User')
const Event = require('../models/Event');
const Ticket = require('../models/Tickets');

class TicketController {
  static async purchase(req, res) {
    try {
        const user = req.user.id;
        const { event: eventId, ticketType, quantity } = req.body;

        const userDoc = await User.findById(user);

        if (!userDoc) {
            throw new Error('User not found');
        }
    
        const eventDoc = await Event.findById(eventId);

        if (!eventDoc) {
            throw new Error('Event not found');
        }

        if (eventDoc.ticketSold >= eventDoc.ticketLimit) {
            throw new Error('This event is sold out');
        }

        if (eventDoc.ticketSold + quantity > eventDoc.ticketLimit) {
            throw new Error(`You can only purchase up to ${eventDoc.ticketLimit - eventDoc.ticketSold} tickets`);
        }

        const price = eventDoc.getTicketPrice(ticketType);

        let bookedSeats = [];

        if (eventDoc.seats.length > 0) {
            const availableSeats = eventDoc.seats.filter(s => s.status === 'available');
            if (availableSeats.length < quantity) {
                throw new Error('Not enough seats available');
            }

            bookedSeats = availableSeats.slice(0, quantity);
            bookedSeats.forEach(seat => seat.status = 'booked');
            await eventDoc.save();
        }

        const bookingId = await generateUniqueBookingId();
        const tickets = [];
        
        for (let i = 0; i < quantity; i++) {
            const seatNumber = bookedSeats[i] ? bookedSeats[i].seatNumber : null;
            const newTicket = new Ticket({
                bookingId,
                event: eventDoc._id,
                user,
                ticketType,
                seatNumber,
                price,
                quantity: 1,
            });

            const qrCodeData = {
                bookingId,
                ticketId: newTicket._id,
                seatNumber,
                price,
                ticketType,
                quantity: 1
            };

            const qrCodePath = await generateQRCode(qrCodeData);
            newTicket.qrCode = qrCodePath;

            userDoc.bookedTickets.push(newTicket._id);
            eventDoc.tickets.push(newTicket._id);

            tickets.push(newTicket);
        }

        await Ticket.insertMany(tickets);

        eventDoc.ticketSold += quantity;

        await eventDoc.save();
        await userDoc.save();

        res.status(201).json({ 
            message: 'Tickets purchased successfully',
            tickets,
            remainingTickets: eventDoc.ticketLimit - eventDoc.ticketSold
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
  };

  static async getTicket(req, res) {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User Not Found',
        });
      }
  
      const bookedTickets = user.bookedTickets;
  
      if (!bookedTickets.includes(ticketId)) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this ticket',
        });
      }

      const ticketDoc = await Ticket.findById(ticketId).populate({
        path: 'event',
        select: 'title date location organizer media',
      });

      if (!ticketDoc) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket Not Found',
        });
      }
  
      res.status(200).json({
        status: 'success',
        ticket: ticketDoc,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message || err.toString(),
      });
    }
  };

  static async cancelTicket(req, res) {
      const userId = req.user.id;
      const ticketId = req.params.id;

      try {
          const user = await User.findById(userId);
          if (!user) {
              return res.status(404).json({
                  status: 'error',
                  message: 'User Not Found',
              });
          }

          const bookedTickets = user.bookedTickets;
          if (!bookedTickets.includes(ticketId)) {
              return res.status(403).json({
                  status: 'error',
                  message: 'You are not authorized to cancel this ticket',
              });
          }

          const ticket = await Ticket.findById(ticketId).populate('event');
          if (!ticket) {
              return res.status(404).json({
                  status: 'error',
                  message: 'Ticket Not Found',
              });
          }

          if (ticket.status === 'cancelled' || ticket.status === 'Refunded') {
              return res.status(400).json({
                  status: 'error',
                  message: 'Ticket is already cancelled or refunded',
              });
          }

          ticket.status = 'cancelled';
          await ticket.save();

          if (ticket.event) {
              const event = await Event.findById(ticket.event._id);
              if (event) {
                  if (ticket.seatNumber) {
                      const seat = event.seats.find(s => s.seatNumber === ticket.seatNumber);
                      if (seat) {
                          seat.status = 'available';
                      }
                  }
                  event.ticketSold -= ticket.quantity;
                  event.tickets.pull(ticketId);
                  await event.save();
              }
          }

          user.bookedTickets.pull(ticketId);
          await user.save();

          if (ticket.qrCode) {
              const qrCodePath = path.resolve(`${ticket.qrCode}`);
              fs.unlink(qrCodePath, (err) => {
                  if (err) {
                      console.error('Error deleting QR code file:', err);
                  }
              });
          }

          res.status(200).json({
              status: 'success',
              message: 'Ticket cancelled successfully' 
          });
      } catch (err) {
          res.status(500).json({
              status: 'error',
              message: err.message || err.toString()
          });
      }
  };
};

module.exports = TicketController;
