const Bull = require('bull');
require('dotenv').config()


const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`

const emailQueue = new Bull('emailQueue', REDIS_URL);

module.exports = emailQueue
