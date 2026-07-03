import type { Response } from 'express';
import type { Session } from '../../../domain/entities/session.js';

export const setSessionCookie = (res: Response, session: Session, rememberMe: boolean): void => {
    const maxAge = rememberMe ? session.expiresAt.getTime() - Date.now() : undefined;

    res.cookie('sessionToken', session.token, {
        maxAge,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
};

export const clearSessionCookie = (res: Response): void => {
    res.clearCookie('sessionToken');
};