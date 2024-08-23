const express = require('express'); 
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const Authrouter = require('./routes/authRoutes');
const UserRouter = require('./routes/userRoutes');
const TicketRouter = require('./routes/ticketRoutes');
const EventRouter = require('./routes/eventRoutes');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management';

mongoose.connect(uri)
  .then(() => console.log('Connected to Database'))
  .catch((err) => console.log('Database Error :', err));

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use('/api/auth', Authrouter);
app.use('/api/users', UserRouter);
app.use('/api/users', UserRouter);
app.use('/api/tickets', TicketRouter);

app.listen(PORT, () => {
  console.log(`App Running On Port ${PORT}...`);
});
