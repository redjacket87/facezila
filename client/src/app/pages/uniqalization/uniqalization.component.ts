import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';

import { UploadedFileType } from './uniqalization.types';
import { UniqalizationService } from '../../common/services/uniqalization.service';
import { CommonHttpResponseType } from '../../../../../server/src/common/http/common-http-response';
import { Status } from '../../../../../server/src/common/http/statuses';

@Component({
  selector: 'app-uniqalization',
  templateUrl: './uniqalization.component.html',
  styleUrls: [ './uniqalization.component.scss' ]
})
export class UniqalizationComponent  {
  readonly RANGE_STEP = 1024;
  readonly MAXIMUM_FILE_SIZE = 1024 * 1024 * 20;
  readonly SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  readonly AVAILABLE_FORMATS = ['mp4', 'm4a', 'm4v', 'f4v', 'f4a', 'm4b', 'm4r', 'f4b', 'mov'];
  workInProgress = false;
  file: UploadedFileType = null;
  videoSource: any = null;
  fileReader = new FileReader();
  fileData: string | ArrayBuffer = null;
  form = this.formBuilder.group({
    archiveName: [''],
    count: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
  });
  showSpinner = false;

  constructor(
    private domSanitizer: DomSanitizer,
    private uniqalizationService: UniqalizationService,
    private formBuilder: FormBuilder
  ) {}

  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  deleteFile() {
    if (this.workInProgress) return;

    this.file = null;
    this.fileData = null;
  }

  uploadFilesSimulator() {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.file?.progress === 100) {
          clearInterval(progressInterval);
        } else {
          if (!this.file) {
            clearInterval(progressInterval);

            return;
          }

          this.file.progress += 20;
        }
      }, 100);
    }, 500);
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }

  prepareFilesList(files: Array<File & {progress: number}>): void {
    const file = files?.[0];
    if (!file) return;

    if (!this.AVAILABLE_FORMATS.includes(this.getFileExtension(file.name))) {
      alert(`Файл должен иметь один из следующих форматов: ${this.AVAILABLE_FORMATS.join(' ')}`);

      return;
    }

    if (file.size > this.MAXIMUM_FILE_SIZE) {
      alert(`Файл должен иметь размер не больше: ${this.formatBytes(this.MAXIMUM_FILE_SIZE)}`);

      return;
    }

    file.progress = 0;
    this.file = file;
    this.videoSource = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));

    this.uploadFilesSimulator();
    this.readFile();
  }

  formatBytes(bytes: number): string {
    if (!bytes) {
      return '0 Bytes';
    }

    const decimal = 2;
    const range = Math.floor(Math.log(bytes) / Math.log(this.RANGE_STEP));
    const bytesInCurrentRange = parseFloat((bytes / Math.pow(this.RANGE_STEP, range)).toFixed(decimal));


    return `${bytesInCurrentRange} ${this.SIZES[range]}`;
  }

  isFormValid(): boolean {
    const count = this.form?.value?.count;

    return count && count <= 10;
  }

  readFile() {
    if (!this.file) {
      return;
    }

    this.fileReader.readAsBinaryString(this.file);

    this.fileReader.onload = () => {
      this.fileData = this.fileReader.result;
    };

    this.fileReader.onerror = () => {
      this.deleteFile();
      alert(`При чтении файла произошла ошибка, попробуйте загрузить файл еще раз`);
    };
  }

  submitForm() {
    if (!this.form.valid) {
      return;
    }

    this.showSpinner = true;
    this.uniqalizationService.sendVideo({
      count: this.form?.value?.count,
      data: this.fileData,
      name: this.file.name
    }).subscribe(async (response: CommonHttpResponseType) => {
      this.showSpinner = false;
      if (response.error || !response?.data?.hash) {
        this.deleteFile();
        alert('Что-то пошло не так попробуйте загрузить файл еще раз.');
        return;
      }

      const { hash } = response.data;
      this.workInProgress = true;
      const checkStatus = await this.uniqalizationService.checkStatus(hash);

      if (checkStatus?.data?.status === Status.Progress) {
        alert('Затрачено слишком много времени на обработку. Попробуйте еще раз.');
        this.deleteFile();
        this.workInProgress = false;
      }

      if (checkStatus?.data?.status === Status.Error || !checkStatus?.data) {
        alert('Что-то пошло не так. Попробуйте еще раз.');
        this.deleteFile();
        this.workInProgress = false;
      }

      if (checkStatus?.data?.status === Status.Success) {
        this.uniqalizationService.downloadFile(hash).subscribe((response) => {
          const archiveName = this.form?.value?.archiveName;
          saveAs(response, `${archiveName}.zip`)
          this.workInProgress = false;
          this.uniqalizationService.deleteRecord(hash);
        });

      }
    }, (e) => {
      this.showSpinner = false;
      alert('Что-то пошло не так. Попробуйте повторить попытку.')
    });
  }
}
