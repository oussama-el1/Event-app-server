const express = require('express');
const ProtectMidll = require('../middlewares/Authenticated');
const TicketController = require('../controllers/ticketController');

const TicketRouter = express.Router();

TicketRouter.get('/ticket', ProtectMidll, TicketController.getTicket);

module.exports = TicketRouter;
