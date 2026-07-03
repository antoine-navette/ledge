export type ReadTransactionSchema = {
    params: {
        transactionId: string;
    };
    cookies: {
        sessionToken?: string | undefined;
    };
};
