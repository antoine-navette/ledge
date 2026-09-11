export const SESSION_COOKIE_NAME = 'session_token' as const;
export const SESSION_COOKIE_OPTIONS = { path: '/', httpOnly: true, secure: true, sameSite: 'strict' } as const;
