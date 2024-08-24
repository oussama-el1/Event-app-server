const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

const EventRouter = require('./routes/eventRoutes')
const Authrouter = require('./routes/authRoutes');
const UserRouter = require('./routes/userRoutes');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management';

mongoose.connect(uri)
  .then(() => console.log('Connected to Database'))
  .catch((err) => console.log('Database Error :', err));

const PORT = process.env.PORT || 5501;

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use('/api/auth', Authrouter);
app.use('/api/users', UserRouter);
app.use('/api/events', EventRouter)
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'static')));


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/signup.html'));
});

app.get('/more_info', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/register_1.html'));
});

app.get('/interests', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/register_2.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

app.get('/verify_email', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/verify_email.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/home.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/user_Aboutme.html'));
});
app.listen(PORT, () => {
  console.log(`App Running On Port ${PORT}...`);
});