import { Injectable } from '@nestjs/common';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffprobe from '@ffprobe-installer/ffprobe';
import * as VideoHash from 'video-hash';
import { copyFile, existsSync, mkdirSync, writeFile } from 'fs';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import * as rimraf from 'rimraf';
import * as path from 'path';
import { zip } from 'zip-a-folder';

import { Status } from '../common/http/statuses'
import { IUniqalizationModel } from './models/uniqalization.model';
import { PrepareVideoOptionsType } from './uniqalization.types';

const vHash = VideoHash({
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path
});

@Injectable()
export class UniqalizationService {
    constructor(
        @InjectConnection('uniqalization') private connection: Connection,
        @InjectModel('Uniqalization') private uniqalizationModel: Model<IUniqalizationModel>,
    ) {}

    async setUniqalizationRecord(hash: string) {
        try {
            const model = new this.uniqalizationModel({
                hash,
                status: Status.Progress
            });

            await model.save();
        } catch(e) {
            throw e;
        }
    }

    getRecordsDir(hash: string) {
        return `${path.resolve(__dirname, '../../../tmp')}/${hash}`;
    }

    async getRecordByHash(hash: string) {
        try {
            return await this.uniqalizationModel.findOne({ hash });
        } catch(e) {
            throw e;
        }
    }

    async deleteRecord(hash: string) {
        try {
            await this.uniqalizationModel.findOneAndDelete({ hash });
            await rimraf(this.getRecordsDir(hash), () => {})
        } catch(e) {
            throw e;
        }
    }

    async setHash(video: typeof vHash): Promise<void> {
        return await vHash.video(video).hash();
    }

    async saveVideo(data, writeTo: string): Promise<void> {
        return new Promise((resolve, reject) => {
            writeFile(writeTo, data, "binary", (err) => {
                if (err) {
                    reject(err);
                }

                resolve();
            })
        })
    }

     async saveAndHash(options: PrepareVideoOptionsType) {
        const { data, count, hash, name } = options;
        const commonDir = this.getRecordsDir(hash);
        const filesDir = `${commonDir}/files`;
        const initialFileName = `${filesDir}/${name}`;
        let currentFileName = initialFileName;

        if (!existsSync(commonDir)) {
            try {
                mkdirSync(commonDir, '0711');
                mkdirSync(filesDir, '0711');
            } catch(e) {
                throw(e);
            }
        }

        try {
            await this.saveVideo(data, initialFileName);
            for (let i = 1; i <= count; i++) {
                if (i > 1) {
                    const initialFileNameToArray = initialFileName.split('.');
                    const extension = initialFileNameToArray.pop();
                    currentFileName = `${initialFileNameToArray.join('')}${i}.${extension}`;
                    await copyFile(initialFileName, currentFileName, (err) => {});
                }

                await this.setHash(currentFileName);
            }

            await zip(filesDir, `${commonDir}/archive${hash}.zip`);
            await this.uniqalizationModel.findOneAndUpdate({hash}, {status: Status.Success});
        } catch(e) {
            await rimraf(commonDir, () => {});
            await this.uniqalizationModel.findOneAndRemove({hash});
            throw e;
        }
    }
}
