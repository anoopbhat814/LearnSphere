'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildCertificateSvg } = require('./certificate');

test('certificate svg escapes user input', () => {
  const svg = buildCertificateSvg({ recipient: '<b>Eve</b>', courseTitle: 'Go & Rust', code: 'LS-1', issuedAt: '2024-01-01' });
  assert.ok(!svg.includes('<b>'));
  assert.ok(svg.includes('Go &amp; Rust'));
});
