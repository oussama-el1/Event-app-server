const express = require("express");
const ProtectMidll = require("../middlewares/Authenticated");
const eventController = require("../controllers/eventController");

const EventRouter = express.Router();

EventRouter.post("/events", ProtectMidll, eventController.postevent);
EventRouter.get("/events/:id", ProtectMidll, eventController.getevent);
EventRouter.put("/events/:id", ProtectMidll, eventController.updateevent);
EventRouter.delete("/events/:id", ProtectMidll, eventController.deleteevent);

module.exports = EventRouter;
