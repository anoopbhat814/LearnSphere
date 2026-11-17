'use strict';
const net = require('net');

const url = new URL(process.env.DATABASE_URL || 'postgresql://localhost:5432/learnsphere');
const port = Number(url.port || 5432);
const deadline = Date.now() + 60_000;

function attempt() {
  const socket = net.connect(port, url.hostname);
  socket.on('connect', () => { socket.end(); console.warn('database is up'); });
  socket.on('error', () => {
    socket.destroy();
    if (Date.now() > deadline) { console.error('timed out waiting for database'); process.exit(1); }
    setTimeout(attempt, 1000);
  });
}
attempt();
