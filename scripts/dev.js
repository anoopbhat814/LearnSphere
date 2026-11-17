#!/usr/bin/env node
'use strict';
const { spawn } = require('child_process');

const procs = [
  { name: 'api', cmd: 'npm', args: ['run', 'dev', '-w', '@learnsphere/api'] },
  { name: 'web', cmd: 'npm', args: ['run', 'dev', '-w', '@learnsphere/web'] },
  { name: 'worker', cmd: 'npm', args: ['start', '-w', '@learnsphere/worker'] },
];

const children = procs.map(({ name, cmd, args }) => {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = (stream) => stream.on('data', (d) => process.stdout.write(`[${name}] ${d}`));
  prefix(child.stdout);
  prefix(child.stderr);
  child.on('exit', (code) => console.warn(`[${name}] exited with ${code}`));
  return child;
});

process.on('SIGINT', () => {
  children.forEach((c) => c.kill('SIGINT'));
  process.exit(0);
});
