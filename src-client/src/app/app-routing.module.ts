import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuestbookComponent } from './guestbook.component';
import { PageNotFoundComponent } from './pagenotfound.component';

const appRoutes: Routes = [
    { path: 'guestbook', component: GuestbookComponent, data: {offset: 0, limit: 10} },
    { path: 'guestbook/:offset/:limit', component: GuestbookComponent},
    { path: '', redirectTo: '/guestbook', pathMatch: 'full'},
    { path: '**', component: PageNotFoundComponent }
  ];
  

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {
        enableTracing: true // <-- debugging purposes only
      }
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
