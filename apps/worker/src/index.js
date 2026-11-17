'use strict';
const Redis = require('ioredis');
const { renderCertificate } = require('./certificate');
const { handleNotification } = require('./notifications');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const handlers = {
  certificates: renderCertificate,
  notifications: handleNotification,
};

async function loop() {
  for (;;) {
    const res = await redis.brpop(Object.keys(handlers), 5);
    if (!res) continue;
    const [queue, payload] = res;
    try {
      await handlers[queue](JSON.parse(payload));
    } catch (err) {
      console.error(`[worker] ${queue} job failed:`, err.message);
      await redis.lpush(`${queue}:dead`, payload);
    }
  }
}

process.on('SIGTERM', () => redis.quit().then(() => process.exit(0)));
loop();
