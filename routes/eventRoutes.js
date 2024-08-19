const express = require('express');
const ProtectMidll = require('../middlewares/Authenticated')
const eventController = require('../controllers/eventController')

const EventRouter = express.Router();

EventRouter.post('/event', ProtectMidll, eventController.postevent);

module.exports = EventRouter;
