const express = require('express');
const ProtectMidll = require('../middlewares/Authenticated')
const eventController = require('../controllers/eventController')

const eventRouter = express.Router();

UserRouter.get('/events', ProtectMidll, eventController.postevent);



module.exports = UserRouter;
