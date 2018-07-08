/* Developed By Davide Antonino Vincenzo Micale */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppComponent } from './app.component';
import { MatToolbarModule, MatCardModule, MatButtonModule,
         MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
         MatSidenavModule, MatIconModule, MatListModule, MatDialogModule, MatCheckboxModule, MatSelectModule,
         MatDatepickerModule,
         MatStepperModule,
         MatProgressBarModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './/app-routing.module';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { DialogComponent } from './dialog/dialog.component';
import { jqxSchedulerComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxscheduler';
import { CalendarComponent } from './calendar/calendar.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventComponent } from './event/event.component';
import { SearchFilterPipe } from './shared/search-filter.pipe';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DateFilterPipe } from './shared/date-filter.pipe';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { CreateEventComponent } from './create-event/create-event.component';
import { RoomComponent } from './room/room.component';
import { LoadingComponent } from './loading/loading.component';
import { NumberFilterPipe } from './shared/number-filter.pipe';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { ScheduleComponent } from './schedule/schedule.component';

// Questa funzione modifica il locale attuale, consentendo di mostrare la data, attraverso la pipe
// data, nel formato e lingua italiana
registerLocaleData(localeIt, 'it');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavComponent,
    DialogComponent,
    jqxSchedulerComponent,
    CalendarComponent,
    EventComponent,
    SearchFilterPipe,
    DateFilterPipe,
    CreateEventComponent,
    RoomComponent,
    LoadingComponent,
    NumberFilterPipe,
    EditScheduleComponent,
    ScheduleComponent
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LayoutModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatStepperModule,
    MatProgressBarModule
  ],
  providers: [
    // Permette di modificare il locale in italiano per il calendario Material
    // consentendo di mostrare il calendario in lingua e formato italiano
    { provide: LOCALE_ID, useValue: 'it-IT' }
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogComponent]
})
export class AppModule { }
