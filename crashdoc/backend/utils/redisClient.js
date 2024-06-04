const Redis = require("ioredis");
const redisUrl =
  process.env.REDIS ||
  "rediss://default:AbLXAAIncDEyOThhMTM2ZmRlM2U0ZDE3ODY1MmY1YzM1OWEyZThmM3AxNDU3ODM@credible-iguana-45783.upstash.io:6379";

if (!redisUrl) {
  throw new Error("REDIS_URL not found in .env file");
}

module.exports.redis = new Redis(redisUrl);
