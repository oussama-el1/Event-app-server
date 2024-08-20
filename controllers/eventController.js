const User = require("../models/User");
const Event = require("../models/Event");
const Joi = require("joi");

class eventController {
  static async postevent(req, res) {
    try {
      const { title, description, date, location, ticketLimit, categories } =
        req.body;

      if (
        !title ||
        !description ||
        !date ||
        !location ||
        !ticketLimit ||
        !categories
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "Missing Some input" });
      }

      const organizer = req.user.id;
      const user = await User.findById(organizer);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "user not found",
        });
      }
      const { error } = validateEvent({
        title,
        description,
        date,
        location,
        ticketLimit,
        categories,
      });
      if (error)
        return res.status(400).json({
          message: error.details[0].message,
        });
      const newEvent = new Event({
        title,
        description,
        date,
        location,
        ticketLimit,
        categories,
        organizer,
      });

      await newEvent.save();

      user.createdEvents.push(newEvent._id);
      await user.save();

      res.status(201).json({
        message: "Event created successfully",
        event: { id: newEvent._id, name: newEvent.title },
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating event", error });
    }
  }
  static async getevent(req, res) {
    try {
      const organizer = req.user.id;
      const user = await User.findById(organizer);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "user not found",
        });
      }
      const events = await Event.find({ organizer: organizer }).sort({
        createdAt: -1,
      });
      if (!events) {
        return res.status(404).json({
          status: "error",
          message: "Event not found",
        });
      }
      res.status(200).json({
        status: "success",
        data: events,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Event not found for this organizer", error });
    }
  }
  static async updateevent(req, res) {
    try {
      const { title, description, date, location, ticketLimit, categories } =
        req.body;
      const { error } = validateEvent({
        title,
        description,
        date,
        location,
        ticketLimit,
        categories,
      });
      if (error)
        return res.status(400).json({
          message: error.details[0].message,
        });
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { title, description, date, location, ticketLimit, categories },
        { new: true }
      );
      if (!event) {
        return res
          .status(400)
          .json({ message: "Event ID not found in request" });
      }
      await event.save();
      res.status(200).json(event);
    } catch (error) {
      console.error(`Error updating event: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async deleteevent(req, res) {
    try {
      const event = Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res
          .status(400)
          .json({ message: "Event ID not found in request" });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error(`Error deleting event: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

function validateEvent(event) {
  const schema = {
    title: Joi.string().min(3).required(),
    description: Joi.string().min(50).required(),
    date: Joi.date().required(),
    location: Joi.string().min(5).required(),
    ticketLimit: Joi.number().min(1).required(),
    categories: Joi.string().required(),
  };

  return Joi.validate(event, schema);
}

module.exports = eventController;
