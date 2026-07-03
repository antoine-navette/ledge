export type DeleteTransactionSchema = {
    params: {
        transactionId: string;
    };
    cookies: {
        sessionToken?: string | undefined;
    };
};
