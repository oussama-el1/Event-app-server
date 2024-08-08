import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({
      url: 'redis://localhost:6379'
    });

    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    this.client.on('error', (err) => {
      console.error(`Redis Error : ${err.message || err.toString()}`);
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected from the server');
    });

    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message || err.toString()}`);
    });
  }

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (err) {
      console.error(`Error ${err.message || err.toString()} Redis while getting the key: ${key}`);
    }
  }

  async set(key, val, expire) {
    try {
      await this.client.setEx(key, expire, val);
    } catch (err) {
      console.error(`Error ${err.message || err.toString()} Redis while setting the key: ${key}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Error ${err.message || err.toString()} Redis while deleting the key: ${key}`);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
