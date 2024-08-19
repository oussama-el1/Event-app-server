const User = require("../models/User");
const Event = require("../models/Event");

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
  };
}

module.exports = eventController;
