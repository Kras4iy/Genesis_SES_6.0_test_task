import nodemailer from 'nodemailer';
import { CONFIG } from "../../config";
import fs from 'fs';
import path from 'path';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.EMAIL_USER,
    pass: CONFIG.EMAIL_PASS,
  },
});

const getTemplate = (templateName: string, variables: Record<string, string>): string => {
  const templatePath = path.join(__dirname, '..', '..', '..', 'emailTemplates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');
  return template.replace(/\[\[\s*([a-zA-Z0-9_.-]+)\s*\]\]/g, (_, path) => {
    return variables[path] || path;
  });
}

export const sendActivationEmail = async (to: string, token: string) => {
  const mailOptions = {
    from: CONFIG.EMAIL_USER,
    to,
    subject: 'Activate your subscription',
    text: `Please click the following link to activate your subscription: ${CONFIG.BASE_URL}/confirm/${token}`,
  };

  await transporter.sendMail(mailOptions);
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
    // text: `A new release has been published for ${repo}. Check it out!`,
    html: template,
  };

  await transporter.sendMail(mailOptions);
}

