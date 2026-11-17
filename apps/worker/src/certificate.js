'use strict';

/** Builds the SVG for a completion certificate; a later step rasterises it to PDF. */
function buildCertificateSvg({ recipient, courseTitle, code, issuedAt }) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="794">
  <rect width="100%" height="100%" fill="#fff" stroke="#4f46e5" stroke-width="12"/>
  <text x="561" y="200" font-size="48" text-anchor="middle">Certificate of Completion</text>
  <text x="561" y="320" font-size="36" text-anchor="middle">${esc(recipient)}</text>
  <text x="561" y="400" font-size="24" text-anchor="middle">has completed ${esc(courseTitle)}</text>
  <text x="561" y="700" font-size="16" text-anchor="middle">Issued ${esc(issuedAt)} - Verify: ${esc(code)}</text>
</svg>`;
}

async function renderCertificate(job) {
  console.warn(`[certificate] rendering for user ${job.userId} course ${job.courseId}`);
  const svg = buildCertificateSvg({
    recipient: job.recipient || 'Learner',
    courseTitle: job.courseTitle || 'Course',
    code: job.code || 'PENDING',
    issuedAt: new Date().toISOString().slice(0, 10),
  });
  return svg;
}

module.exports = { buildCertificateSvg, renderCertificate };
