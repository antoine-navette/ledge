import { ObjectId } from 'mongodb';
import type { EmailVerification } from '../../domain/entities/email-verification.js';
import type { EmailVerificationDocument } from '../types/mongo.email-verification.document.js';

export const toEmailVerificationDocument = (emailVerification: EmailVerification): EmailVerificationDocument => ({
    _id: new ObjectId(emailVerification.id),
    userId: new ObjectId(emailVerification.userId),
    token: emailVerification.token,
    expiresAt: emailVerification.expiresAt,
    createdAt: emailVerification.createdAt,
});

export const toEmailVerification = (document: EmailVerificationDocument): EmailVerification => ({
    id: document._id.toString(),
    userId: document.userId.toString(),
    token: document.token,
    expiresAt: document.expiresAt,
    createdAt: document.createdAt,
});