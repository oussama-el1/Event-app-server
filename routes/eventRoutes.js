const express = require("express");
const ProtectMidll = require("../middlewares/Authenticated");
const eventController = require("../controllers/eventController");

const EventRouter = express.Router();

EventRouter.post("/", ProtectMidll, eventController.postevent);
EventRouter.get("/:id", ProtectMidll, eventController.getevent);
EventRouter.put("/:id", ProtectMidll, eventController.updateevent);
EventRouter.delete("/:id", ProtectMidll, eventController.deleteevent);

module.exports = EventRouter;
