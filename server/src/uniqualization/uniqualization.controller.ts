import { Controller, Get, Post, Res, HttpStatus, Req, UseFilters } from '@nestjs/common';
import { Response, Request } from 'express';
import { createHash } from 'crypto';
import * as rimraf from 'rimraf';

import { VideoUniqalizationType } from './uniqalization.types';
import { InvalidDataErrorResponse } from "../common/http/error/invalid-data-error-response";
import { HttpExceptionFilter } from '../common/http/http-exeption-filter';
import { UniqalizationService } from './uniqalization.service';
import { CommonHttpResponse } from '../common/http/common-http-response';
import {existsSync} from "fs";


@Controller('api/uniqalization')
export class UniqalizationController {
    constructor(
        private uniqalizationService: UniqalizationService
    ) {}

    @Post()
    @UseFilters(new HttpExceptionFilter())
    async getVideo(@Req() req: {body: VideoUniqalizationType }, @Res() res: Response) {
        const { data, name, count } = req.body;

        if (!data || !count || !name) {
            res.status(HttpStatus.BAD_REQUEST).json(new InvalidDataErrorResponse().response);
        }

        const hash = createHash('sha256').update(new Date().toISOString()).digest('hex');

        try {
            await this.uniqalizationService.setUniqalizationRecord(hash);
            const record = await this.uniqalizationService.getRecordByHash(hash);

            res.status(HttpStatus.OK).json(new CommonHttpResponse({
                data: record,
            }).response);

            try {
                await this.uniqalizationService.saveAndHash({
                    data,
                    name,
                    count,
                    hash
                });
            } catch (e) {
                throw e;
            }
        } catch(e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new CommonHttpResponse({
                error: {
                    code: 500,
                    message: e.message ? e.message : JSON.stringify(e)
                },
            }).response);
        }
    }

    @Get('status')
    @UseFilters(new HttpExceptionFilter())
    async checkStatus(@Req() req: Request, @Res() res: Response) {
        const { id } = req.query;

        try {
            const record = await this.uniqalizationService.getRecordByHash(id as string);

            if (!record) {
                rimraf(this.uniqalizationService.getRecordsDir(id as string), () => {});

                return res.status(HttpStatus.NOT_FOUND).json(new CommonHttpResponse({
                    error: {
                        code: 404,
                        message: 'Несуществующая запись'
                    },
                }).response);
            }

            return res.status(HttpStatus.OK).json(new CommonHttpResponse({
                data: record,
            }).response);
        } catch(e) {
            rimraf(this.uniqalizationService.getRecordsDir(id as string), () => {});

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new CommonHttpResponse({
                error: {
                    code: 500,
                    message: e.message ? e.message : JSON.stringify(e)
                },
            }).response);
        }
    }

    @Get('download')
    @UseFilters(new HttpExceptionFilter())
    download(@Req() req: Request, @Res() res: Response) {
        const { id } = req.query;

        const dir = this.uniqalizationService.getRecordsDir(id as string);

        if (existsSync(dir)) {
            return res.status(HttpStatus.OK).sendFile(`${dir}/archive${id}.zip`);
        } else {
            rimraf(this.uniqalizationService.getRecordsDir(id as string), () => {});
            res.status(HttpStatus.NOT_FOUND);
        }
    }

    @Post('delete')
    @UseFilters(new HttpExceptionFilter())
    async deleteRecord(@Req() req: Request, @Res() res: Response) {
        const { id } = req.query;

        try {
            await this.uniqalizationService.deleteRecord(id as string);

            res.status(HttpStatus.OK).end();
        } catch (e) {
            console.log('!!!!!!!!!!!!!')
            console.log('!!!!!!!!!!!!!')
            console.log('!!!!!!!!!!!!!')
            console.log('!!!!!!!!!!!!!')
            console.log('!!!!!!!!!!!!!')
            console.log(e)

            res.status(HttpStatus.OK).end();
        }
    }
}
