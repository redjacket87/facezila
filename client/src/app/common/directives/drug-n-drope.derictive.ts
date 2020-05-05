import {
  Directive,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[appDrugNDrop]'
})
export class DrugNDropDirective {
  @Output() fileDropped = new EventEmitter<any>();

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const files = evt.dataTransfer.files;

    files?.length && this.fileDropped.emit(files);
  }
}
