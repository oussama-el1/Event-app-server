const path = require('path'); // Import the path module
const fs = require('fs');
const User = require("../models/User");
const Event = require("../models/Event");
const Joi = require("joi");
const uuid = require('uuid')

class eventController {
  static async postevent(req, res) {
    try {
      let location = req.body.location
      const { title, description, date, ticketLimit, categories } =
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
      location = JSON.parse(location)
      const { address, city, state, zip, country } = location;
      if (!address || !city || !state || !zip || !country ) {
        return res.status(400).json({ status: "error", message: " missing some input in address" });
      }
      if (!req.uploadDir) {
        return res.status(500).json({ message: "Upload directory not set" });
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
        location :{
          address,
          city,
          state,
          zip,
          country
        },
        ticketLimit,
        categories,
        organizer
      });

      await newEvent.save();
      const eventID = newEvent._id.toString();
      const finalDir = path.resolve(
        `/tmp/event-app/events/${eventID}/${uuid.v4()}/`
      );

      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
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
      console.error("Error creating event:", error); // Log the error to the console
      res.status(500).json({ message: "Error creating event", error: error.message });
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
        location :{
          address,
          city,
          state,
          zip,
          country
        },
        ticketLimit,
        categories,
        isPublic,
      } = req.body;
      const { error } = validateEvent({
        title,
        description,
        date,
        location :{
          address,
          city,
          state,
          zip,
          country
        },
        ticketLimit,
        categories,
        isPublic,
      });
      if (error)
        return res.status(400).json({
          message: error.details[0].message,
        });
      if (!req.uploadDir) {
          return res.status(500).json({ message: "Upload directory not set" });
      }
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          date,
          location :{
            address,
            city,
            state,
            zip,
            country
          },
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
          `/tmp/event-app/events/${event._id}/${uuid.v4()}/`
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
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(50).required(),
    date: Joi.date().required(),
    location: Joi.object({
      address: Joi.string().min(5).required(),
      city: Joi.string(),
      state: Joi.string(),
      zip: Joi.string(),
      country: Joi.string()
    }).required(),
    ticketLimit: Joi.number().min(1).required(),
    categories: Joi.array().items(Joi.string().valid('Music', 'Sports', 'Conference', 'Festival', 'Other')).required(),
    isPublic: Joi.boolean(),
    media: Joi.string().optional(),
  });

  return schema.validate(event, { abortEarly: false });
}

module.exports = eventController;
