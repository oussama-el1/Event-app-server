const express = require('express');
const mongose = require('mongoose');

const Authrouter = require('./routes/authRoutes')
const UserRouter = require('./routes/userRoutes');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management';

mongose.connect(uri)
  .then(() => console.log('Connected to Database'))
  .catch((err) => console.log('Database Error :', err));


const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json());
app.use('/api/auth', Authrouter);
app.use('/api/users', UserRouter);

app.listen(PORT, () => {
  console.log(`App Running On Port ${PORT}...`);
});
