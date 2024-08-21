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
      });

      await newEvent.save();
      const eventID = newEvent._id.toString();
      const finalDir = path.resolve(
        `/tmp/event-app/events/${eventID}-${Date.now()}/`
      );

      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      req.files.forEach((file) => {
        const newFilePath = path.join(finalDir, path.basename(file.path));
        fs.renameSync(file.path, newFilePath);
      });

      newEvent.media = req.files.map((file) =>
        path.join(finalDir, path.basename(file.path))
      );
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
      const events = await Event.find({ organizer: organizer })
        .populate(
          "User",
          "firstName, lastName, email, gender, listOfInterest, "
        )
        .sort({
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
      const {
        title,
        description,
        date,
        location,
        ticketLimit,
        categories,
        isPublic,
      } = req.body;
      const { error } = validateEvent({
        title,
        description,
        date,
        location,
        ticketLimit,
        categories,
        isPublic,
      });
      if (error)
        return res.status(400).json({
          message: error.details[0].message,
        });
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          date,
          location,
          ticketLimit,
          categories,
          isPublic,
        },
        { new: true }
      );
      if (!event) {
        return res
          .status(400)
          .json({ message: "Event ID not found in request" });
      }
      if (req.files && req.files.length > 0) {
        const finalDir = path.resolve(
          `/tmp/event-app/events/${event._id}-${Date.now()}/`
        );

        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }

        req.files.forEach((file) => {
          const newFilePath = path.join(finalDir, path.basename(file.path));
          fs.renameSync(file.path, newFilePath);
        });

        event.media = req.files.map((file) =>
          path.join(finalDir, path.basename(file.path))
        );
        await event.save();
        res.status(200).json(event);
      }
    } catch (error) {
      console.error(`Error updating event: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async deleteevent(req, res) {
    try {
      const organizer = req.user.id;
      const user = await User.findById(organizer);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "user not found",
        });
      }

      const event = Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res
          .status(400)
          .json({ message: "Event ID not found in request" });
      }
      user.createdEvents.pull(req.params.id);
      await user.save();
      res.status(200).json({
        message: "Event deleted successfully",
        event: { id: event._id, name: event.title },
      });
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
    isPublic: Joi.boolean().required(),
    media: Joi.string(),
  };

  return Joi.validate(event, schema);
}

module.exports = eventController;
