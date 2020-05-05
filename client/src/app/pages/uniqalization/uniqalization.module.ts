import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from '@angular/forms';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { ProgressComponent } from '../../common/components/progress/progress.component';
import { UniqalizationComponent } from './uniqalization.component';
import { DrugNDropDirective } from "../../common/directives/drug-n-drope.derictive";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    IconSpriteModule.forRoot({path: 'assets/sprites/icons-sprite.svg'}),
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [ UniqalizationComponent, ProgressComponent, DrugNDropDirective ],
})
export class UniqalizationModule {}
