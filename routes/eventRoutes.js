const express = require('express');
const ProtectMidll = require('../middlewares/Authenticated')
const eventController = require('../controllers/eventController')

const EventRouter = express.Router();

EventRouter.get('/events', ProtectMidll, eventController.postevent);



module.exports = EventRouter;
