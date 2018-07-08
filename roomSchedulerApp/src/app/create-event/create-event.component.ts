/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventSchedule, CreateEvent } from '../shared/event';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { time_format } from '../shared/schedule';
import { maxDateValidator, maxHourValidator, durationEventValidator, daysEventValidator } from '../shared/create-event-validators';
import { Dialog } from '../shared/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Subscription } from 'rxjs';
import { Moment } from 'moment';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit, OnDestroy {
  // Tengo un riferimento agli eventi
  eventSchedule: CreateEvent;
  // Tengo un riferimento al FormGroup, in modo da poter ricevere i valori dei campi del modulo nel template
  eventForm: FormGroup;

  // Definisco e inizializzo le due variabili che serviranno al template per capire se mostrare o meno i contenitori
  // per definire la durata dell'evento ed eventualmente i giorni della settimana in cui si svolgeranno gli appuntamenti
  showDuration = false;
  // e i giorni della settimana in cui si svolgeranno gli appuntamenti
  showDays = false;

  // Inizializzo l'array che terrà riferimenti ai giorni della settimana, in modo da rendere più agile la loro gestione
  daysForm: AbstractControl [] = [];

  // Tengo traccia se nascondondere il bottone per salvare l'evento da creare
  disableSave = false;

  // Tengo traccia della sottoscrizione della creazione di un evento
  private createEventSubscription: Subscription;

  // Tramite dependancy ottengo i riferimenti al route, scheduleService, lo snackBar, il formBuilder, dialog e router
  constructor(private route: ActivatedRoute, private scheduleService: ScheduleService,
    private snackBar: MatSnackBar, private formBuilder: FormBuilder, public dialog: MatDialog, private router: Router) {
    // Inizializzo eventSchedule
    this.eventSchedule = new CreateEvent();
    // Bisogna individuare l'id dell'utente. Il recupero lo si può fare dall'indirizzo del route.
    // snapshot fornisce l'oggetto paramMap. Tramite la funzione get è possibile prendere dal
    // paramMap un parametro. In questo caso il parametro è userId
    const userId = Number(this.route.snapshot.paramMap.get('userId'));

    // Imposto il clientId
    this.eventSchedule.clientId = userId;

    // La funzione group di formBuilder si occupa di prendere tutti i FormControl definiti
    // nel template e di definire così il gruppo di campi del form, evitando così di dover
    // definire uno ad uno tutti i FormControl con il new FormControl. Qui vengono presentati
    // quali saranno i FormControl, i valori di inizializzazione e i loro validatori. Affinchè
    // i campi siano definiti validi, ogni validatore deve restituire null
    this.eventForm = this.formBuilder.group({
      // Nel name impostiamo impostiamo il valore iniziale e il validatore built-in di campo richiesto
      name: ['', Validators.required ],
      dateStart:  [null, Validators.required ],
      // Nel dateEnd impostiamo il valore null di default ma nessun validatore. Questo perchè verrà
      // inserito a runtime se dovesse servire, cioè se la cadenza dell'evento fosse diversa da una volta
      dateEnd: null,
      hours: 0,
      // Per assegnare più validatori, è necessario inserirli in un array. Il validatore builtin pattern
      // ha lo scopo di verificare che il campo rispetti il pattern richiesto, che nel nostro caso è dato
      // dalla regular expression time_format
      starting: ['', [Validators.pattern(time_format), Validators.required] ],
      // L'ending deve rispettare il validatore custom maxHourValidator che si occupa di verificare che il
      // campo starting assuma un orario minore rispetto a quello di ending
      ending: ['', [Validators.pattern(time_format), maxHourValidator, Validators.required] ],
      // Il campo periodicity deve assumere un valore fra 1 e 5
      periodicity: [0, [Validators.min(1), Validators.max(5)]],
      // I validatori dei giorni della settimana saranno eventualmente inseriti a runtime se la periodicità
      // sarà impostata su personalizzato
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
     });
    // Nell'array dei controlli dei giorni della settimana, inserisco uno alla volta tutti i campi
    this.daysForm.push(this.eventForm.get('sunday'));
    this.daysForm.push(this.eventForm.get('monday'));
    this.daysForm.push(this.eventForm.get('tuesday'));
    this.daysForm.push(this.eventForm.get('wednesday'));
    this.daysForm.push(this.eventForm.get('thursday'));
    this.daysForm.push(this.eventForm.get('friday'));
    this.daysForm.push(this.eventForm.get('saturday'));
  }

  ngOnInit() {
  }

  // Il changePeriodicity è una funzione che viene richiamata dal template ogni volta che il campo
  // periodicity sarà stato modificato. In base al valore assunto dal campo, la funzione dovrà
  // imporre le variabili per mostrare o meno certi campi, eliminare o aggiungere validatori ed
  // lanciare una nuova verifica di validità dei campi
  changePeriodicity() {
    // Definisco le costanti che si occuperanno di mantenere un riferimento al dateEnd e ad hours
    // per richiamarli velocemente
    const dateEndForm = this.eventForm.get('dateEnd');
    const hoursForm = this.eventForm.get('hours');

    // Prendo il valore del campo periodicity e lo converto in un numero
    const periodicity = Number(this.eventForm.get('periodicity').value);

    // Se l'evento si riproponesse su più appuntamenti
    if (periodicity > 1) {
      // In tal caso i campi dateEnd e hours dovranno essere mostrati
      this.showDuration = true;

      // Imposto che il campo dateEnd deve avere il validatore per cui la dateEnd deve essere
      // superiore o uguale alla dateStart e il validatore per verificare che uno e uno solo
      // fra il campo dateEnd e il campo hours sia impostato
      dateEndForm.setValidators([maxDateValidator, durationEventValidator]);
      // Nel campo delle ore, imposto che il valore minimo che può assumere è 0, in modo che
      // l'utente non possa impostare valori negativi. Il durationEventValidator si occuperà
      // di verificare che il campo hours non assuma valore 0 se il campo dateEnd non è
      // impostato e verifica che il campo stia a 0 se il dateEnd viene impostato
      hoursForm.setValidators([Validators.min(0), durationEventValidator]);

      // Nel caso di periodicità personalizzata
      if (periodicity === 5) {
        // I campi dei giorni della settimana devono essere mostrati
        this.showDays = true;
        // Con il foreach, per ciascun giorno della settimana dayForm, presente nell'array
        this.daysForm.forEach((dayForm) => {
          // deve essere impostato il validatore daysEventValidator che si occupa di verificare
          // che almeno uno dei giorni della settimana venga selezionato
          dayForm.setValidators(daysEventValidator);
        });
      } else {
        // Altrimenti i campi dei giorni della settimana non devono essere mostrati
        this.showDays = false;
        // e i validatori a essi assegnati devono essere eliminati
        this.clearDaysValidators();
      }
    } else {
      // Se invece la periodicità fosse una sola volta o che deve ancora essere selezionata
      // dall'utente, nascondo i campi ed elimino i validatori
      this.showDuration = false;
      dateEndForm.clearValidators();
      hoursForm.clearValidators();
      this.clearDaysValidators();
    }
    // In tutti i casi, verifico la validità dei campi
    this.refreshDurationValidity();
  }

  // Quando viene selezionata una stanza, viene aggiornata la roomId dell'evento
  onRoomSelected(roomId: number) {
    this.eventSchedule.roomId = roomId;
  }

  // La funzione si occupa di visualizzare un dialog nel caso in cui la stanza non è stata impostata
  checkLastStep() {
    if (this.eventSchedule.roomId == null || this.eventSchedule.roomId === 0 ) {
      // Inizializzo il contenuto che avrà il messaggio di errore
      const dialog: Dialog = {
        title: 'Errore',
        message: 'Non hai selezionato un\'aula da prenotare'
      };

      // Mostro il messaggio di errore, aprendo il dialog e impostando la larghezza del dialog e il contenuto
      this.dialog.open(DialogComponent, {
        width: '400px',
        data: dialog
      });
    }
  }

  // Si occupa di eliminare i validatori di tutti i campi dei giorni della settimana
  private clearDaysValidators() {
    this.daysForm.forEach((dayForm) => {
      dayForm.clearValidators();
    });
  }

  // Si occupa di verificare la validità del dateEnd, hours e dei giorni della settimana.
  // Infine aggiorna la validità dell'intero gruppo
  refreshDurationValidity() {
    if (this.eventForm.get('dateStart').value != null) {
      // La data è di tipo Moment
      const dateStart: Moment = this.eventForm.get('dateStart').value;
      // Aggiungo 12 ore alla data attuale, in modo che la data nel formato ISO figuri il giorno corretto
      // altrimenti, essendo l'ora in automatico impostata a mezzanotte, porterebbe la data 2 ore indietro
      // e quindi il giorno cambierebbe
      dateStart.add(12, 'hours');
      // Aggiorno nel campo la data con l'orario corretto
      this.eventForm.patchValue({ dateStart: dateStart } );
    }
    if (this.eventForm.get('dateEnd').value != null) {
      const dateEnd: Moment = this.eventForm.get('dateEnd').value;
      dateEnd.add(12, 'hours');
      this.eventForm.patchValue({ dateEnd: dateEnd } );
    }
    // Aggiorno la validità di dateEnd, hours e i giorni della settimana. Potrebbe essere cambiata la
    // periodicità, cambiandone così la loro validità
    this.eventForm.get('dateEnd').updateValueAndValidity();
    this.eventForm.get('hours').updateValueAndValidity();
    this.daysForm.forEach((dayForm) => {
      dayForm.updateValueAndValidity();
    });
    // Aggiorno la validità dell'intero form
    this.eventForm.updateValueAndValidity();
  }

  // Ogni volta che viene selezionato un diverso step, ci si assicura che gli elementi dell'evento siano impostati
  // con i valori del form
  selectionChange() {
    this.eventSchedule.name = this.eventForm.get('name').value;
    this.eventSchedule.dateStart = this.eventForm.get('dateStart').value;
    this.eventSchedule.dateEnd = this.eventForm.get('dateEnd').value;
    this.eventSchedule.hours = this.eventForm.get('hours').value;
    this.eventSchedule.starting = this.eventForm.get('starting').value;
    this.eventSchedule.ending = this.eventForm.get('ending').value;
    this.eventSchedule.periodicity = this.eventForm.get('periodicity').value;

    // Elimino i giorni della settimana precedentemente impostati nell'array
    this.eventSchedule.weekDays = [];

    // e tramite il forEach, per ciascun giorno, inserisco all'interno di weekDays il valore se esso è stato impostato
    // nel form
    this.daysForm.forEach((dayForm, index) => {
      if (dayForm.value) {
        this.eventSchedule.weekDays.push(index);
      }
    });
  }

  // La funzione si occupa di salvare l'evento che si sta cercando di creare
  save() {
    // Disabilito il bottone del salvataggio, in modo da non far partire più di una richiesta di creazione
    this.disableSave = true;

    // Richiedo allo scheduleService la creazione dell'evento passando l'eventSchedule, faccio la sottoscrizione
    // del risultato e lo salvo per poterlo eventualmente eliminare
    this.createEventSubscription = this.scheduleService.createEvent(this.eventSchedule).subscribe((event) => {
      // Mi preparo per la creazione della dialog
      const dialog: Dialog = {
        title : '',
        message : '',
        button: 'Ok, portami alla lista degli appuntamenti',
        // Quando si clicca sul pulsante di chiusura, si viene portati alla pagina degli appuntamenti
        onClose : () => {
          this.router.navigate([`../${event.id}/schedules`], {relativeTo: this.route});
        }
      };

      // Se l'evento è stato creato, ma è presente almeno un conflitto fra i vari appuntamenti
      if (event.conflict) {
        dialog.title = 'Attenzione';
        dialog.message = 'L\'evento  è stato creato. Tuttavia alcuni appuntamenti presentano dei conflitti';
        dialog.button = 'Risolvi i conflitti';
      } else {
        // In assenza di conflitti
        dialog.title = 'Successo';
        dialog.message = 'L\'evento  è stato creato con successo';
      }

      // Mostro il messaggio, aprendo il dialog e impostando la larghezza del dialog e il contenuto
      this.dialog.open(DialogComponent, {
        width: '400px',
        data: dialog
      });
    },
      // Funzione in caso di errore
      () => {
        // Mostro un messaggio generico di errore
        this.snackBar.open('Errore nel salvare l\'evento. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
        // Ripropongo il bottone per il salvataggio dell'evento
        this.disableSave = false;
      });
  }

  // Quando viene distrutto il componente, ci si disiscrive alle sottoscrizioni
  ngOnDestroy() {
    if (this.createEventSubscription) {
      this.createEventSubscription.unsubscribe();
    }
  }
}
