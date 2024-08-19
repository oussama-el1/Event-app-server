const jwt = require('jsonwebtoken');
require('dotenv').config();

const redisClient = require('../utils/cacheUtils');

const JWT_SECRET = process.env.JWT_SECRET;


async function ProtectMidll(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const key = `auth_${token}`;
    const userid = await redisClient.get(key);
    if (userid !== user.id) {
      return res.sendStatus(403);
    };

    req.user = user;
    next();
  });
};

module.exports = ProtectMidll;
