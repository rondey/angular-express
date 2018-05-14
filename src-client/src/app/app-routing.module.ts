import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuestbookComponent } from './guestbook.component';
import { PageNotFoundComponent } from './page-not-found.component';

const appRoutes: Routes = [
    { path: 'guestbook', component: GuestbookComponent },
    { path: '', redirectTo: '/guestbook', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];


@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                enableTracing: false // <-- debugging purposes only
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
