import type { Transporter } from 'nodemailer';
import type { EmailSender } from '../../domain/ports/email-sender.js';

export class NodemailerEmailSender implements EmailSender {
    constructor(private transporter: Transporter) {}

    send = async (from: string, to: string, subject: string, html: string) => {
        await this.transporter.sendMail({ from, to, subject, html });
    };
}
