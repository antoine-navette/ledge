import { createTransport } from 'nodemailer';
import type { Env } from './env.js';

export const connectToSmtp = async (smtpUrl: Env['smtpUrl']) => {
    const transporter = createTransport(smtpUrl);

    await transporter.verify();

    return { transporter };
};
