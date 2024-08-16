const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path to your User model

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost:27017/event-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Update user with new bookedTickets
async function updateUserBookedTickets(userId) {
  try {
    const ticketIds = [
      "64d8c4d8f6a6e2b8d7e3c9d1",
      "64d8c4d8f6a6e2b8d7e3c9d2",
      "64d8c4d8f6a6e2b8d7e3c9d3",
      "64d8c4d8f6a6e2b8d7e3c9d4",
      "64d8c4d8f6a6e2b8d7e3c9d5",
      "64d8c4d8f6a6e2b8d7e3c9d6",
      "64d8c4d8f6a6e2b8d7e3c9d7",
      "64d8c4d8f6a6e2b8d7e3c9d8",
      "64d8c4d8f6a6e2b8d7e3c9d9",
      "64d8c4d8f6a6e2b8d7e3c9da",
    ];

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    user.bookedTickets = ticketIds;

    await user.save();
    console.log('User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    mongoose.connection.close();
  }
}

updateUserBookedTickets('66bf8ee5852b28286f8ab534');
