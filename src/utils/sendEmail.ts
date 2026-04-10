import nodemailer from 'nodemailer';
import { CONFIG } from "../config";
import fs from 'fs';
import path from 'path';
import { emailsSentTotal } from '../promMetrics';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.EMAIL_USER,
    pass: CONFIG.EMAIL_PASS,
  },
});

const sendMail: typeof transporter.sendMail = async (mailOptions) => {
  const result = await transporter.sendMail(mailOptions);
  emailsSentTotal.inc();
  return result;
}

const getTemplate = (templateName: string, variables: Record<string, string>): string => {
  const templatePath = path.join(__dirname, '..', '..', 'emailTemplates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');
  return template.replace(/\[\[\s*([a-zA-Z0-9_.-]+)\s*\]\]/g, (_, path) => {
    return variables[path] || path;
  });
}

export const sendSuccessActivationEmail = async (to: string, repo: string, unsubscribeToken: string) => {
  let template: string;
  try {
    template = getTemplate('confirmSubscription', {
      "repo.name": repo,
      "unsubscribe.link": `${CONFIG.BASE_URL}/unsubscribe/${unsubscribeToken}`,
      "repo.link": `https://github.com/${repo}/releases`
    });
  } catch (error) {
    template = `Thanks for activating your subscription to ${repo}! To unsubscribe, click here: ${CONFIG.BASE_URL}/unsubscribe/${unsubscribeToken}`;
  }
  const mailOptions = {
    from: CONFIG.EMAIL_USER,
    to,
    subject: `Subscription to ${repo} activated successfully!`,
    html: template,
  };

  await sendMail(mailOptions);
}

export const sendActivationEmail = async (to: string, token: string, repo: string) => {
  let template: string;
  try {
    template = getTemplate('activateSubscription', {
      "repo.name": repo,
      "activation.link": `${CONFIG.BASE_URL}/confirm/${token}`,
      "repo.link": `https://github.com/${repo}/releases`
    });
  } catch (error) {
    template = `Please click the following link to activate your subscription: ${CONFIG.BASE_URL}/confirm/${token}`;
  }
  const mailOptions = {
    from: CONFIG.EMAIL_USER,
    to,
    subject: `Activate your subscription on the ${repo}`,
    html: template,
  };

  await sendMail(mailOptions);
}

export const sendNotificationEmail = async (to: string, repo: string, unsubscribeToken: string) => {
  let template: string;
  try {
    template = getTemplate('newRelease', {
      "repo.name": repo,
      "unsubscribe.link": `${CONFIG.BASE_URL}/unsubscribe/${unsubscribeToken}`,
      "repo.link": `https://github.com/${repo}/releases`
    });
  } catch (error) {
    template = `A new release has been published for ${repo}. Check it out! To unsubscribe, click here: ${CONFIG.BASE_URL}/unsubscribe/${unsubscribeToken}`;
  }

  const mailOptions = {
    from: CONFIG.EMAIL_USER,
    to,
    subject: `New release for ${repo}`,
    html: template,
  };

  await sendMail(mailOptions);
}

