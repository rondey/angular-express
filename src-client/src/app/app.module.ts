import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

// Decorator
// Definizione di una funzione utilizzata per "decorare" un altra funzione
// in modo da aggiungere/modificare/estendere le sue funzionalità

@NgModule({
   // delcarations
   // usato per definire i Components/Directives/Pipes che saranno disponibili nel modulo
  declarations: [
    AppComponent
  ],
  // imports
  // usato per definire i moduli esterni da importare utilizzati per estendere le funzionalità del modulo corrente
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule
  ],
  // exports
  // usato per definire tutti i Compoents/Directives/Pipes/Modules da rendere disponibili ad altri moduli
  // che useranno il modulo corrente in fase di import
  exports: [],
  // providers
  // usato per definire tutti i services che questo modulo deve istanziare e rendere disponibili nell'app
  providers: [],
  // entryComponents
  // usato per definire i Components da poter istanziare via codice
  entryComponents: [],
  // bootstraps
  // usato per definire i componenti da avviare. Solo un rootmodule deve avere la definizione di bootstrap
  bootstrap: [AppComponent]
})
export class AppModule { }
