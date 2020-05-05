import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UniqalizationComponent } from "./pages/uniqalization/uniqalization.component";

const appRoutes: Routes = [
  { path: '', redirectTo: '/uniqalization', pathMatch: 'full' },
  { path: 'uniqalization', component: UniqalizationComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
