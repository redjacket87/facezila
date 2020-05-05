import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from './app.component';
import { UniqalizationModule } from './pages/uniqalization/uniqalization.module';
import { AppRoutingModule } from "./app-routing.module";

@NgModule({
  imports: [ BrowserModule, FormsModule, UniqalizationModule, AppRoutingModule, HttpClientModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
