const emailQueue = require('../queues/emailQueue');
const mg = require('../services/mailgun');
require('dotenv').config()

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;

  const data = {
    from : process.env.MAIlGUN_FROM,
    to,
    subject,
    html,
  };

  try {
    await mg.messages().send(data);
    console.log(`Email sent to ${to}`) 
  } catch(err) {
    console.log(`Failed to sent Email : ${err.message}`) 
  }
});