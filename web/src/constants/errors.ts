import type { components } from '../../types.gen.ts';

type Schemas = components['schemas'];

// Every error code of the API, taken from the generated schemas, plus the frontend's own: NETWORK_ERROR when the API
// can't be reached, and ROUTE_NOT_FOUND for the router's 404 page
export type ErrorCode = Extract<Schemas[keyof Schemas], { code: string }>['code'] | 'NETWORK_ERROR' | 'ROUTE_NOT_FOUND';

// A Record, so that a new API code without a message fails the build
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    NETWORK_ERROR: "Can't reach the server. Check your internet connection.",
    INTERNAL_SERVER_ERROR: 'Something went wrong on our side. Please try again later.',
    ROUTE_NOT_FOUND: "This page doesn't exist.",
    TOO_MANY_REQUESTS: 'Too many attempts in a short time. Please wait a moment.',
    PAYLOAD_TOO_LARGE: 'The data sent is too large.',
    UNSUPPORTED_MEDIA_TYPE: "The format of the data sent isn't supported.",
    BAD_REQUEST: 'The data sent is invalid.',
    UNPROCESSABLE_CONTENT: "The data sent doesn't follow the expected rules.",
    UNAUTHORIZED: 'You need to be logged in to do this.',
    FORBIDDEN: "You don't have access to this.",

    CREDENTIALS_INVALID: 'Wrong email or password.',
    EMAIL_ALREADY_IN_USE: 'An account already exists with this email address.',

    EMAIL_ALREADY_VERIFIED: 'Your email address is already verified.',
    EMAIL_VERIFICATION_COOLDOWN_ACTIVE: 'A verification email was sent recently. Please wait a few minutes.',
    EMAIL_VERIFICATION_EXPIRED: 'This verification link has expired. Request a new one from your profile.',
    EMAIL_VERIFICATION_NOT_FOUND: "This verification link isn't valid, or was already used.",

    TRANSACTION_NOT_FOUND: "This transaction doesn't exist, or was deleted.",
};

export const ERROR_TITLES: Partial<Record<ErrorCode, string>> = {
    NETWORK_ERROR: 'Connection lost',
    INTERNAL_SERVER_ERROR: 'Server error',
    ROUTE_NOT_FOUND: 'Page not found',
    TOO_MANY_REQUESTS: 'Too many requests',
    FORBIDDEN: 'Access denied',
};
