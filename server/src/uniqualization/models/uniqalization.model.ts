import { Schema, Document } from 'mongoose';
import { Status } from '../../common/http/statuses';

export interface IUniqalizationModel extends Document {
    hash: string;
    status: Status;
}

export const UniqalizationSchema = new Schema({
    hash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});
