import { createTransport } from 'nodemailer';
import type { Env } from './env.js';

export const connectToSmtp = (smtpUrl: Env['smtpUrl']) => {
    const transporter = createTransport(smtpUrl);

    return { transporter };
};
