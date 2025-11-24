import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Holidays } from './pages/holidays/holidays';

const routes: Routes = [
  { path: '', redirectTo: '/holidays', pathMatch: 'full' },
  { path: 'holidays', component: Holidays }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
