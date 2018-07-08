/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScheduleServer, FiltersSchedule } from '../shared/schedule';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  // Tengo un riferimento agli schedule ricevuti dal server
  schedules: ScheduleServer[];
  // Tengo un riferimento al FormGroup, in modo da poter ricevere i valori dei campi del modulo nel template
  filtersForm: FormGroup;
  // Tengo un riferimento alla sottoscrizione dei filtri, in modo da poter effettuare un unsubscribe quando
  // il componente verrà distrutto
  private filtersSubscription: Subscription;
  // Tengo i filtri impostati dall'utente
  private filters: FiltersSchedule;

  // Tengo un riferimento all'id dell'utente
  userId: number;

  // Tengo traccia della sottoscrizione dell'evento per poterlo eliminare in caso di necessità
  private scheduleSubscription: Subscription;

  // Tramite dependancy ottengo i riferimenti al route, scheduleService, lo snackBar e il formBuilder
  constructor(private route: ActivatedRoute, private scheduleService: ScheduleService,
              private snackBar: MatSnackBar, private formBuilder: FormBuilder) {
    // Inizializzo i filtri con i filtri di default del FiltersSchedule
    this.filters = new FiltersSchedule();
    // La funzione group di formBuilder si occupa di prendere tutti i FormControl definiti
    // nel template e di definire così il gruppo di campi del form, evitando così di dover
    // definire uno ad uno tutti i FormControl
    this.filtersForm = this.formBuilder.group(new FiltersSchedule());
    // Il gruppo offre l'observable valueChanges che emette un evento a ogni cambiamento
    // presente nei campi del gruppo.
    // L'obiettivo è quello di evitare all'utente di dover cliccare in un bottone ogni volta
    // che vuole cambiare i filtri. Si vuole che dopo un nuovo inserimento dell'utente, vengano
    // in automatico applicati i filtri all'array di schedule attualmente presenti. Si vuole però
    // evitare che a ogni singolo inserimento venga effettuato il filtraggio, per evitare cicli
    // di computazioni inutili. Si applicano dunque degli operatori all'observable, utilizzando
    // prima di tutto l'operatore pipe per poter applicare la catena di operatori. Dopo
    // aver imposto la pipe, viene effettuata la subscribe al nuovo observer. È importante
    // mantenere in memoria un riferimento a questa sottoscrizione in modo da potersi disiscrivere
    // quando non servirà più
    this.filtersSubscription = this.filtersForm.valueChanges.subscribe(val => this.onFiltersChange(val));

    // Bisogna individuare l'id dell'utente. Il recupero lo si può fare dall'indirizzo del route.
    // snapshot fornisce l'oggetto paramMap. Tramite la funzione get è possibile prendere dal
    // paramMap un parametro. In questo caso il parametro è userId
    this.userId = Number(this.route.snapshot.paramMap.get('userId'));

    // In modo analogo, recupero l'id dell'evento dell'appuntamento
    const eventId = Number(this.route.snapshot.paramMap.get('eventId'));

    // Tramite la funzione getListEvents dello scheduleService è possibile ottenere la lista di
    // eventi appartenente all'id dell'utente e che si riferiscono all'evento dello specifico id.
    // Si effettua la sottoscrizione per ottenere la
    // lista di schedule. Se non la si riesce a ottenere, si mostra un messaggio generico di errore.
    // Salvo il riferimento alla sottoscrizione
    this.scheduleSubscription = this.scheduleService.getListSchedules(this.userId, eventId).subscribe((schedules) => {
      this.schedules = schedules;
    },
      // Funzione in caso di errore
      () => {
        // Mostro un messaggio generico di errore
        this.snackBar.open('Errore nel caricare gli appuntamenti. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
      });
  }

  ngOnInit() {
  }

  // La funzione si occupa di aggiornare i filtri salvati in memoria
  onFiltersChange(filters: FiltersSchedule) {
    this.filters = filters;
  }

  // La funzione di reset si occupa di resettare i filtri del gruppo utilizzando l'apposita funzione
  // reset che prende in ingresso un nuovo oggetto FiltersSchedule, inizializzato con i valori di
  // default. Siccome i valori del gruppo sono cambiati, questa operazione scatenerà nell'observer
  // del gruppo l'emissione di un nuovo evento
  reset() {
    this.filtersForm.reset(new FiltersSchedule());
  }

  // Quando il componente smette di servire, è necessario disiscriversi dalla sottoscrizione dei filtri e degli eventi
  ngOnDestroy() {
    this.scheduleSubscription.unsubscribe();
    this.filtersSubscription.unsubscribe();
  }

}
