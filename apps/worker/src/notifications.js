'use strict';
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT || 1025),
});

const TEMPLATES = {
  'enrollment.welcome': () => ({ subject: 'Welcome to your new course', text: 'You are enrolled. Start your first lesson today!' }),
  'quiz.passed': (p) => ({ subject: 'Quiz passed', text: `Great job - you scored ${p.score}%.` }),
};

async function handleNotification(job) {
  const tpl = TEMPLATES[job.kind];
  if (!tpl) throw new Error(`unknown notification kind ${job.kind}`);
  const { subject, text } = tpl(job);
  await transport.sendMail({ from: 'no-reply@learnsphere.dev', to: job.email || `${job.userId}@users.invalid`, subject, text });
}

module.exports = { handleNotification, TEMPLATES };
