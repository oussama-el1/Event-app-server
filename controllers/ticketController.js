const Event = require('../models/Event');
const Ticket = require('../models/Tickets');
const { generateUniqueBookingId, generateQRCode } = require('../utils/helpers');

class TicketController {

  static async purchase(req, res) {
    try {
        const user = req.user.id;
        const { event: eventId, ticketType, price, quantity } = req.body;
    
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

            tickets.push(newTicket);
        }

        await Ticket.insertMany(tickets);

        eventDoc.ticketSold += quantity;
        await eventDoc.save();

        res.status(201).json({ message: 'Tickets purchased successfully', tickets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
  };

  static async getTicket(req, res) {    
  };
};

module.exports = TicketController;
