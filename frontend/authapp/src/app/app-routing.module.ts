import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { TrashComponent } from './components/trash/trash.component';

const routes: Routes = [
  {
    path :'',component:HomeComponent
  },
  {
    path : 'login',component:LoginComponent
  },
  {
    path :'trash',component :TrashComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }