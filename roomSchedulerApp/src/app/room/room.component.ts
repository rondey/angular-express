/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Room, FiltersRoom } from '../shared/room';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ScheduleService } from '../services/schedule.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnChanges, OnDestroy {
  // Prende in input la data, starting ed ending, l'id dell'appuntamento e l'id della stanza
  // attualmente selezionata
  @Input() date = null;
  @Input() starting = null;
  @Input() ending = null;
  @Input() scheduleId: number = null;
  @Input() roomIdSelected: number = null;

  // In output restituisco un emettitore di eventi. Gli eventi emessi conterranno un numero
  @Output() roomId = new EventEmitter<number>();

  // Definisco l'array di stanze
  rooms: Room[];
  // Tengo un riferimento al FormGroup, in modo da poter ricevere i valori dei campi del modulo nel template
  filtersForm: FormGroup;


  // Tengo un riferimento alla sottoscrizione dei filtri, in modo da poter effettuare un unsubscribe quando
  // il componente verrà distrutto
  private filtersSubscription: Subscription;
  // Tengo i filtri impostati dall'utente
  private filters: FiltersRoom;

  // Tengo un riferimento alla sottoscrizione della lista delle stanze
  private roomSubscription: Subscription;



  // Tramite Dependancy Injection ottengo il riferimento allo scheduleService, snackbar e il formBuilder
  constructor(private scheduleService: ScheduleService,
    private snackBar: MatSnackBar, private formBuilder: FormBuilder) {
    // Inizializzo i filtri con i filtri di default del FiltersRoom
    this.filters = new FiltersRoom();
    // La funzione group di formBuilder si occupa di prendere tutti i FormControl definiti
    // nel template e di definire così il gruppo di campi del form, evitando così di dover
    // definire uno ad uno tutti i FormControl
    this.filtersForm = this.formBuilder.group(new FiltersRoom());
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
  }

  ngOnInit() {
  }

  // ngOnChanges viene richiamato ogni volta che cambiano i dati dell'input del componente
  // Si ottiene l'oggetto changes contenente solo i dati che cambiano, non tutti gli input
  ngOnChanges(changes: SimpleChanges) {
    // Se la data è presente nell'oggetto
    if (changes.date) {
      // Aggiorno la data
       this.date = changes.date.currentValue;
       // Se cambiasse anche la stanza, significherebbe che questa è la fase della vera
       // inizializzazione del componente. Nel caso in cui essa non cambiasse, significa
       // che l'utente si è limitato a modificare la data
       if (!changes.roomIdSelected) {
          // E azzero l'id della stanza selezionata, in modo da non tenere selezionata una stanza possibilmente
          // non disponibile
          this.roomSelected(0);
       }
    }

    // Se cambiano starting e/o ending li aggiorno
    if (changes.starting) {
      this.starting = changes.starting.currentValue;
    }

    if (changes.ending) {
      this.ending = changes.ending.currentValue;
    }

    // se la data è impostata, eseguo la funzione per ottenere le stanze libere
    if (this.date) {
      this.getEmptyRooms();
    }
  }

  // Mostra una lista di stanze libere in un intervallo di ore
  private getEmptyRooms() {
    // Tramite la funzione getEmptyRooms dello scheduleService è possibile ottenere la lista di
    // stanze libere fra l'ora starting ed ending del giorno date, tenendo conto se la stanza fosse
    // stata in precedenza già occupata dallo schedule stesso. Si effettua la sottoscrizione per ottenere la
    // lista di stanze. Se non la si riesce a ottenere, si mostra un messaggio generico di errore
    this.roomSubscription = this.scheduleService.getEmptyRooms(this.date, this.starting, this.ending, this.scheduleId).
    subscribe((rooms) => {
      this.rooms = rooms;

      let find: Room = null;
      // Una volta ottenuto l'array delle stanze, se è attualmente stata selezionata una stanza,
      // si procede a scorrere tutte le stanze fino a quando non si trova quella attualmente
      // selezionata
      if (this.roomIdSelected > 0) {
        // Tramite la funzione JavaScript find, si cerca nell'array la stanza che soddisfi la condizione
        // richiesta nella funzione contenuta nel parametro. La funzione in questione viene eseguita per
        // ogni stanza
        find = rooms.find(room => {
          // Viene restituito il confronto fra l'id della stanza e l'id della stanza attualmente selezionata
          return room.id === this.roomIdSelected;
        });
      }

      // Nel caso in cui non fosse disponibile la stanza, significa che dovrò eliminarne la selezione.
      // Il compito sarà svolto dalla funzione roomSelected che prende in input il nuovo valore della
      // stanza selezionata, in questo caso 0, cioè nessuna
      if (!find) {
        this.roomSelected(0);
      }
    },
      // Funzione in caso di errore
      () => {
        // Mostro un messaggio generico di errore
        this.snackBar.open('Errore nel caricare le stanze. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
      });
  }

  // La funzione si occupa di aggiornare i filtri salvati in memoria
  onFiltersChange(filters: FiltersRoom) {
    this.filters = filters;
  }

  // La funzione di reset si occupa di resettare i filtri del gruppo utilizzando l'apposita funzione
  // reset che prende in ingresso un nuovo oggetto FiltersRoom, inizializzato con i valori di
  // default. Siccome i valori del gruppo sono cambiati, questa operazione scatenerà nell'observer
  // del gruppo l'emissione di un nuovo evento
  reset() {
    this.filtersForm.reset(new FiltersRoom());
  }

  // Funzione chiamata qualora una stanza venga selezionata
  // Accetta in ingresso l'id della stanza, sia essa una stringa
  // che un numero
  roomSelected(roomId: string|number) {
    // Aggiorno il valore in memoria della stanza selezionata
    this.roomIdSelected = Number(roomId);
    // Emetto un aggiornamento in output con la stanza selezionata
    this.roomId.emit(this.roomIdSelected);
  }

  // Quando il componente smette di servire, è necessario disiscriversi dalla sottoscrizione dei filtri
  ngOnDestroy() {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
    this.filtersSubscription.unsubscribe();
  }

}
