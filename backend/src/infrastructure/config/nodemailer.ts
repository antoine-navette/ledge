import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from './env.js';

type Input = {
    smtpUrl: Env['smtpUrl'];
};

type Output = {
    smtpTransporter: Transporter;
};

export const connectToSmtp = ({ smtpUrl }: Input): Output => {
    const smtpTransporter: Transporter = createTransport(smtpUrl);

    return { smtpTransporter };
};
