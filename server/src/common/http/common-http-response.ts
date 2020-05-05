export type CommonHttpResponseType = {
    data?: any;
    error?: {
        code?: number,
        reason: string;
    }
}

export class CommonHttpResponse {
    public response: CommonHttpResponseType;

    constructor(options?) {
        this.response = {
            data: options?.data ? options.data : null,
            error: options?.error ? options.error : null
        }
    }
}
