import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SendVideoOptionsType } from './uniqalization.types';

enum Api {
  Uniqalization = '/api/uniqalization',
}

@Injectable({
  providedIn: 'root',
})
export class UniqalizationService {
  constructor(private http: HttpClient) {}

  sendVideo(options: SendVideoOptionsType) {
    return this.http.post(Api.Uniqalization, {...options});
  }

  async checkStatus(id: string) {
    const RETRY_INTERVAL = 5000;
    let RETRY_COUNT = 50;
    let data = null;

    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const response: any = await this.http.get(`${Api.Uniqalization}/status?id=${id}`).toPromise();
          if (!response?.data || !RETRY_COUNT || response?.data?.status !== 'progress') {
            clearInterval(interval);

            data = response;

            resolve();
          }

          RETRY_COUNT--;
        } catch(e) {
          data = e.error;
          clearInterval(interval);
          resolve();
        }

      }, RETRY_INTERVAL);
    });

    return data;
  }

  downloadFile(id) {
    return this.http.get(`${Api.Uniqalization}/download?id=${id}`, {
      responseType: 'blob',
    })
  }

  deleteRecord(id) {
    return this.http.post(`${Api.Uniqalization}/delete?id=${id}`, {}).toPromise()
  }
}
