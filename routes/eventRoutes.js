const express = require("express");
const ProtectMidll = require("../middlewares/Authenticated");
const eventController = require("../controllers/eventController");
const uploadmedia = require('../middlewares/uploadMedia')

const EventRouter = express.Router();

EventRouter.post("/", ProtectMidll, uploadmedia, eventController.postevent);
EventRouter.get("/:id", ProtectMidll, eventController.getevent);
EventRouter.put("/:id", ProtectMidll, uploadmedia, eventController.updateevent);
EventRouter.delete("/:id", ProtectMidll, eventController.deleteevent);

module.exports = EventRouter;
