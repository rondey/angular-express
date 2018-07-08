/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Dialog } from '../shared/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Moment } from 'moment';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { time_format, EditSchedule, ScheduleServer } from '../shared/schedule';
import { maxHourValidator } from '../shared/create-event-validators';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.css']
})
export class EditScheduleComponent implements OnInit, OnDestroy {
  // Tengo un riferimento allo schedule
  schedule: EditSchedule;
  // Tengo un riferimento al FormGroup, in modo da poter ricevere i valori dei campi del modulo nel template
  scheduleForm: FormGroup;

  // Tengo i riferimenti all'id dell'utente loggato, all'id dell'evento e all'id dello schedule modificato
  private clientId: number;
  private eventId: number;
  private scheduleId: number;

  // Tengo traccia se nascondondere il bottone per salvare le modifiche all'appuntamento
  disableSave = false;

  // Tengo traccia della sottoscrizione della ricerca dello schedule da modificare, la ricezione e la sua modifica
  private searchScheduleSubscription: Subscription;
  private scheduleSubscription: Subscription;
  private editScheduleSubscription: Subscription;

  private scheduleURL: string;

  // Tramite dependancy ottengo i riferimenti al route, scheduleService, lo snackBar, il formBuilder, dialog e router
  constructor(private route: ActivatedRoute, private scheduleService: ScheduleService,
    private snackBar: MatSnackBar, private formBuilder: FormBuilder, public dialog: MatDialog, private router: Router) {
    // Inizializzo lo schedule
    this.schedule = new EditSchedule();
    // Bisogna individuare l'id dell'utente. Il recupero lo si può fare dall'indirizzo del route.
    // snapshot fornisce l'oggetto paramMap. Tramite la funzione get è possibile prendere dal
    // paramMap un parametro. In questo caso il parametro è userId
    this.clientId = Number(this.route.snapshot.paramMap.get('userId'));

    // Bisogna individuare l'id dell'evento. Il recupero lo si può fare dall'indirizzo del route.
    // snapshot fornisce l'oggetto paramMap. Tramite la funzione get è possibile prendere dal
    // paramMap un parametro. In questo caso il parametro è eventId
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));

    // Bisogna individuare l'id dello schedule. Il recupero lo si può tentare dall'indirizzo del route.
    // snapshot fornisce l'oggetto paramMap. Tramite la funzione get è possibile prendere dal
    // paramMap un parametro. In questo caso il parametro è scheduleId
    this.scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));


    // Nel caso in cui non era presente nell'URL l'id dello schedule.
    // Questo avviene qualora si voglia cercare i conflitti
    if (!this.scheduleId) {
      this.scheduleURL = '../';
      // Bisognerà andare a cercare il primo schedule in stato di conflitto dell'evento.
      // Mantengo il riferimento alla sottoscrizione
      this.scheduleSubscription = this.scheduleService.getFirstScheduleConflict(this.eventId).subscribe((schedule) => {
        // Se si riesce a trovare tale schedule, chiamo la funzione che si occupi degli aggiornamenti
        this.showSchedule(schedule);
      },
        // Funzione in caso di errore
        () => {
          // Mostro un messaggio generico di errore
          this.snackBar.open('Errore nel trovare il conflitto. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
        });
    } else {
      this.scheduleURL = '../../';
      // Se invece lo scheduleId era stato impostato, si sta cercando di modificare uno specifico schedule
      // Ottengo dal server lo schedule, mantenendo un riferimento alla sottoscrizione
      this.scheduleSubscription = this.scheduleService.getSchedule(this.scheduleId).subscribe((schedule) => {
        this.showSchedule(schedule);
      },
        // Funzione in caso di errore
        () => {
          // Mostro un messaggio generico di errore
          this.snackBar.open('Errore nel caricare l\'appuntamento. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
        });
    }



    // La funzione group di formBuilder si occupa di prendere tutti i FormControl definiti
    // nel template e di definire così il gruppo di campi del form, evitando così di dover
    // definire uno ad uno tutti i FormControl con il new FormControl. Qui vengono presentati
    // quali saranno i FormControl, i valori di inizializzazione e i loro validatori. Affinchè
    // i campi siano definiti validi, ogni validatore deve restituire null
    this.scheduleForm = this.formBuilder.group({
      // Il campo date deve essere inizializzato con una stringa vuota e tramite il Validators.required
      // si indica che il campo è obbligatorio
      date: ['', Validators.required],
      // Per assegnare più validatori, è necessario inserirli in un array. Il validatore builtin pattern
      // ha lo scopo di verificare che il campo rispetti il pattern richiesto, che nel nostro caso è dato
      // dalla regular expression time_format
      starting: ['', [Validators.pattern(time_format), Validators.required]],
      // L'ending deve rispettare il validatore custom maxHourValidator che si occupa di verificare che il
      // campo starting assuma un orario minore rispetto a quello di ending
      ending: ['', [Validators.pattern(time_format), maxHourValidator, Validators.required]],
      // Il campo updateAll deve assumere un valore fra 1 e 4
      updateAll: [0, [Validators.min(1), Validators.max(4)]]
    });
  }

  ngOnInit() {
  }

  onDateChange() {
    // La data è di tipo Moment
    const date: Moment = this.scheduleForm.get('date').value;
    // Aggiungo 12 ore alla data attuale, in modo che la data nel formato ISO figuri il giorno corretto
    // altrimenti, essendo l'ora in automatico impostata a mezzanotte, porterebbe la data 2 ore indietro
    // e quindi il giorno cambierebbe
    date.add(12, 'hours');
    // Aggiorno nel campo la data con l'orario corretto
    this.scheduleForm.patchValue({ date: date });
  }

  // Quando viene selezionata una stanza, viene aggiornata la roomId dell'appuntamento
  onRoomSelected(roomId: number) {
    this.schedule.roomId = roomId;
  }

  // La funzione si occupa di visualizzare un dialog nel caso in cui la stanza non è stata impostata
  checkLastStep() {
    if (this.schedule.roomId == null || this.schedule.roomId === 0) {
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

  // Ogni volta che viene selezionato un diverso step, ci si assicura che gli elementi dell'appuntamento siano impostati
  // con i valori del form
  selectionChange() {
    this.schedule.date = this.scheduleForm.get('date').value;
    this.schedule.starting = this.scheduleForm.get('starting').value;
    this.schedule.ending = this.scheduleForm.get('ending').value;
    // Con number converto una stringa in un numero
    this.schedule.updateAll = Number(this.scheduleForm.get('updateAll').value);
  }

  // La funzione si occupa di salvare l'appuntamento che si sta cercando di modificare
  save() {
    // Disabilito il bottone del salvataggio, in modo da non far partire più di una richiesta di aggiornamento
    this.disableSave = true;

    // Richiedo allo scheduleService la modifica dell'appuntamento passando l'id dell'utente e lo schedule, faccio la sottoscrizione
    // del risultato e lo salvo per poterlo eventualmente eliminare
    this.editScheduleSubscription = this.scheduleService.editSchedule(this.clientId, this.schedule).subscribe((schedule) => {
      // Mi preparo per la creazione della dialog
      const dialog: Dialog = {
        title: '',
        message: '',
        button: 'Ok, portami alla lista degli appuntamenti',
        // Quando si clicca sul pulsante di chiusura, si viene portati alla pagina degli appuntamenti.
        // In navigate, all'interno dell'array viene passato l'URL, con relativeTo, gli si indica l'indirizzo
        // che è stato passato a chi è relativo, nel nostro caso è relativo all'indirizzo della pagina in cui
        // ci si trova attualmente
        onClose : () => {
          this.router.navigate([this.scheduleURL], {relativeTo: this.route});
        }
      };

      // Se l'appuntamento è stato modificato, ma è presente almeno un conflitto fra i vari appuntamenti
      if (schedule.conflict || schedule.otherConflicts) {
        dialog.title = 'Attenzione';
        dialog.message = 'La modifica è stata salvata. Tuttavia alcuni appuntamenti presentano dei conflitti';
      } else {
        // In assenza di conflitti
        dialog.title = 'Successo';
        dialog.message = 'La modifica è stata effettuata con successo!';
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
        this.snackBar.open('Errore nel salvare l\'appuntamento. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
        // Ripropongo il bottone per il salvataggio dell'evento
        this.disableSave = false;
      });
  }

  // La funzione si occupa, oltre che aggiornare il riferimento allo schedule da modificare, di inserire i dati dello schedule
  // all'interno del form di modifica
  private showSchedule(schedule: ScheduleServer) {
    // Se si ottiene uno schedule, si aggiornano i valori in base allo schedule ottenuto
    if (schedule) {
      // Tramite la funzione getSchedule dello scheduleService è possibile ottenere lo schedule
      // desiderato appartenente all'id dell'utente e all'id dell'evento. Si effettua la sottoscrizione per ottenere
      // lo schedule. Se non lo si riesce a ottenere, si mostra un messaggio generico di errore.
      // Salvo il riferimento alla sottoscrizione
      this.schedule = {
        id: schedule.id,
        date: new Date(schedule.date),
        starting: schedule.starting,
        ending: schedule.ending,
        conflict: schedule.conflict,
        roomId: schedule.roomId,
        eventId: schedule.eventId,
        updateAll: 0
      };

      // Si aggiornano i valori del form
      this.scheduleForm.patchValue({
        date: this.schedule.date,
        starting: schedule.starting,
        ending: schedule.ending,
      });
    } else {
      // Lo schedule è inizializzato a null
      this.schedule = null;
    }
  }

  // Quando viene distrutto il componente, ci si disiscrive alle sottoscrizioni
  ngOnDestroy() {
    if (this.editScheduleSubscription) {
      this.editScheduleSubscription.unsubscribe();
    }
    if (this.searchScheduleSubscription) {
      this.searchScheduleSubscription.unsubscribe();
    }
    if (this.scheduleSubscription) {
      this.scheduleSubscription.unsubscribe();
    }
  }

}
