import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL,
})
  .on('connect', () => console.log('Redis connected'))
  .on('error', err => console.log('Redis Client Error', err));
