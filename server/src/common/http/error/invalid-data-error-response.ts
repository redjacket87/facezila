import { CommonHttpResponse } from '../common-http-response';
import { Status } from '../statuses';

export class InvalidDataErrorResponse extends CommonHttpResponse {
    constructor() {
        super();

        this.response = {
            ...this.response,
            data: null,
            error: {
                code: 400,
                reason: 'Request must contain valid data'
            }
        }
    }
}
