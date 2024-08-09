const mailgun = require('mailgun-js');
require('dotenv').config();

const DOMAIN = process.env.MAILGUN_DOMAIN
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN })

module.exports = mg;
