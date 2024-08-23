const path = require("path"); // Import the path module
const fs = require("fs");
const User = require("../models/User");
const Event = require("../models/Event");
const Joi = require("joi");

class eventController {
  static async postevent(req, res) {
    try {
      let location = req.body.location;
      let ticketPricing = req.body.ticketPricing;
      const { title, description, date, ticketLimit, categories } = req.body;

      if (
        !title ||
        !description ||
        !date ||
        !location ||
        !ticketLimit ||
        !categories ||
        !ticketPricing
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "Missing Some input" });
      }

      location = JSON.parse(location);
      const { address, city, state, zip, country } = location;

      if (!address || !city || !state || !zip || !country) {
        return res
          .status(400)
          .json({ status: "error", message: " missing some input in address" });
      }

      ticketPricing = JSON.parse(ticketPricing);
      const { standard, vip } = ticketPricing;
      if (!standard || !vip) {
        return res.status(400).json({
          status: "error",
          message: " missing some input in ticketPricing",
        });
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
        ticketPricing,
      });

      if (error)
        return res.status(400).json({
          message: error.details[0].message,
        });

      const newEvent = new Event({
        title,
        description,
        date,
        location: {
          address,
          city,
          state,
          zip,
          country,
        },
        ticketLimit,
        categories,
        organizer,
        ticketPricing: {
          standard,
          vip,
        },
      });

      await newEvent.save();
      const eventID = newEvent._id.toString();
      const finalDir = path.resolve(`/tmp/event-app/events/${eventID}/`);

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
      res
        .status(500)
        .json({ message: "Error creating event", error: error.message });
    }
  }

  static async getevent(req, res) {
    try {
      const events = await Event.findById(req.params.id);
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
      res.status(500).json({ message: "Event not found for this ID", error });
    }
  }

  static async updateevent(req, res) {
    try {
      const { title, description, date, ticketLimit, categories, isPublic } =
        req.body;

      let location = req.body.location;
      let ticketPricing = req.body.ticketPricing;

      location = JSON.parse(location);
      const { address, city, state, zip, country } = location;
      ticketPricing = JSON.parse(ticketPricing);
      const { standard, vip } = ticketPricing;

      const { error } = validateEvent({
        title,
        description,
        date,
        location: {
          address,
          city,
          state,
          zip,
          country,
        },
        ticketLimit,
        categories,
        isPublic,
        ticketPricing: {
          standard,
          vip,
        },
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
          location: {
            address,
            city,
            state,
            zip,
            country,
          },
          ticketLimit,
          categories,
          isPublic,
          ticketPricing: {
            standard,
            vip,
          },
          seats: undefined,
        },
        { new: true }
      );
      if (!event) {
        return res
          .status(400)
          .json({ message: "Event ID not found in request" });
      }
      if (req.files && req.files.length > 0) {
        const finalDir = path.resolve(`/tmp/event-app/events/${event._id}/`);

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

      const event = await Event.findByIdAndRemove(req.params.id);
      if (!event) {
        return res.status(400).json({ message: "Event ID not found" });
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

  static async gethomeevent(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const userID = req.user.id;
      const user = await User.findById(userID);
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }
      const intersets = user.listOfInterest;
      const country = user.address.country;
      if (!country) {
        return res.status(400).json({
          status: "error",
          message: "User country is not set in the profile.",
        });
      }
      console.log({
        categories: { $in: interests },
        "location.country": country,
        date: { $gt: Date.now() },
      });
      const events = await Event.find({
        $and: {
          categories: { $in: intersets },
          "location.country": country,
          date: { $gt: Date.now() },
        },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ date: 1 })
        .populate("organizer")
        .select("title date location organizer.lastName");
      res.status(200).json({
        events,
      });
    } catch (error) {
      console.error(`Error during search: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async addSeats(req, res) {
    const userId = req.user.id;
    const eventId = req.params.id;

    try {
      const [user, event] = await Promise.all([
        User.findById(userId),
        Event.findById(eventId),
      ]);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      if (!event) {
        return res.status(404).json({
          status: "error",
          message: "Event not found",
        });
      }

      if (event.organizer.toString() !== userId) {
        return res.status(403).json({
          status: "error",
          message: "User is not authorized to add seats to this event",
        });
      }

      const { seats } = req.body;
      const { error } = validateSeats({ seats });
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message,
        });
      }

      const seatNumbers = new Set(event.seats.map((seat) => seat.seatNumber));
      const newSeats = [];

      for (const seatNumber of seats) {
        if (seatNumbers.has(seatNumber)) {
          return res.status(400).json({
            status: "error",
            message: `Seat number ${seatNumber} already exists for this event`,
          });
        }
        seatNumbers.add(seatNumber);
        newSeats.push({ seatNumber, status: "available" });
      }

      event.seats.push(...newSeats);
      await event.save();

      res.status(200).json({
        status: "success",
        message: "Seats added successfully",
        seats: newSeats,
      });
    } catch (error) {
      console.error(`Error adding seats: ${error.message}`);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
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
      country: Joi.string(),
    }).required(),
    ticketPricing: Joi.object({
      standard: Joi.number().required(),
      vip: Joi.number().required(),
    }).required(),
    ticketLimit: Joi.number().min(1).required(),
    categories: Joi.array()
      .items(
        Joi.string().valid("Music", "Sports", "Conference", "Festival", "Other")
      )
      .required(),
    isPublic: Joi.boolean(),
    media: Joi.string().optional(),
  });

  return schema.validate(event, { abortEarly: false });
}
function validateSeats(seats) {
  const seatsSchema = Joi.object({
    seats: Joi.array().items(Joi.string().min(1)).unique().required(),
  });
  return seatsSchema.validate(seats, { abortEarly: false });
}
module.exports = eventController;
