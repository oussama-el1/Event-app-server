const express = require('express');

const ProtectMidll = require('../middlewares/Authenticated');
const validateTicketPurchase = require('../middlewares/validateTicketPurchase');
const TicketController = require('../controllers/ticketController');


const TicketRouter = express.Router();

TicketRouter.post('/purchase', ProtectMidll, validateTicketPurchase, TicketController.purchase);
TicketRouter.get('/:id', ProtectMidll, TicketController.getTicket);

module.exports = TicketRouter;
