/* Developed By Davide Antonino Vincenzo Micale */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AuthGuard } from './services/auth-guard.service';
import { EventComponent } from './event/event.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';

// Definisco i route, cioè i componenti che devono essere caricati in base all'url
const routes: Routes = [
  // Se il percorso è home, viene usato il CalendarComponent
  { path: 'home', component: CalendarComponent },
  // Nel caso dell'url base, mi limito a usare la stessa route usata per il calendario
  // dove full indica che l'url nella barra dell'indirizzo viene modificata
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Se il percorso è login, viene usato il LoginComponent.
  // Con canActivate indico un'array di auth guard che si preoccupano di verificare che
  // l'utente abbia l'autorizzazione per accedere alla pagina
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  // Nel caso del percorso sia clients, si verifica con l'auth guard l'utente vi possa
  // accedere. Con children si indica un array di path e che questi sono figli del
  // percorso attuale
  {
    path: 'clients',
    canActivate: [AuthGuard],
    children: [
      // Si osservi che di percorsi ne possiede uno solo e che è un riferimento a se
      // stesso, a cui è applicato il canActivateChild che permette di applicare ai
      // figli di questo percorso l'auth guard. L'idea è di evitare di mettere un
      // auth guard per ogni figlio e di snellire il tutto attraverso questo percorso
      {
        path: '',
        canActivateChild: [AuthGuard],
        // Come unico figlio possiede il :userId . Esso sarà parametro di input
        // Attualmente il percorso è perciò /clients/:userId
        children: [
          // { path: '', component: LoginComponent },
          {
            path: ':userId',
            children: [
              // { path: '', component: CalendarComponent },

              // Il percorso a questo livello sarà /clients/:userId/events
              {
                path: 'events', children: [
                  { path: '', component: EventComponent },
                  { path: 'create', component: CreateEventComponent },
                  {
                    path: ':eventId',
                    children: [
                      // Il percorso a questo livello sarà /clients/:userId/events/:eventId
                      {
                        path: 'schedules', children: [
                          { path: '', component: ScheduleComponent },
                          { path: 'conflicts', component: EditScheduleComponent },
                          {
                            path: ':scheduleId',
                            children: [
                              // Il percorso a questo livello sarà /clients/:userId/events/:eventId/schedules/:scheduleId
                                { path: 'edit', component: EditScheduleComponent }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    // Inizializzo il router e indico i route dell'applicazione. I route sono a livello radice
    RouterModule.forRoot(routes, {
      enableTracing: false // <-- debugging purposes only
    }
    )
  ],
  // Esporto il modulo, affinchè i metodi offerti dal router possano essere usati nell'app
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
