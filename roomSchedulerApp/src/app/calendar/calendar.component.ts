/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { FiltersCalendar } from '../shared/event';
import { ScheduleClient } from '../shared/schedule';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { filterString } from '../shared/filter';
import { Room } from '../shared/room';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  // Tengo un riferimento alla sottoscrizione attuale, in modo da poter eliminare la sottoscrizione se non dovesse servire
  // più la risposta
  private schedulesSubscription: Subscription;

  // Definisco l'altezza nel jqxScheduler dei contenitori degli schedule, sia per la view mensile che per la view con la
  // timeline del giorno
  private resourceMonthRowHeight = 100;
  private resourceTimelineDayTimeline = 34;

  // Tengo in una variabile l'intervallo di giorni a cui gli schedule devono appartenere
  private from: Date;
  private to: Date;
  // Tengo in memoria l'array di schedule, in modo da poter applicare loro i filtri
  private schedules: ScheduleClient[];
  // Tengo l'array di aule, che verranno usate nel template per mostrare le aule
  rooms: Room[];

  // Tengo un riferimento al FormGroup, in modo da poter ricevere i valori dei campi del modulo nel template
  filtersForm: FormGroup;

  // Tengo i filtri impostati dall'utente
  private filters: FiltersCalendar;
  // Tengo un riferimento alla sottoscrizione dei filtri, in modo da poter effettuare un unsubscribe quando
  // il componente verrà distrutto
  private filtersSubscription: Subscription;

  // Tengo un riferimento allo stato di caricamento degli schedule
  loading: boolean;

  // Definisco l'adattatore
  dataAdapter: any;

  // Definisco le traduzioni del jqxScheduler
  localization: any = {
    // separator of parts of a date (e.g. '/' in 11/05/1955)
    '/': '/',
    // separator of parts of a time (e.g. ':' in 05:44 PM)
    ':': ':',
    // the first day of the week (0 = Sunday, 1 = Monday, etc)
    firstDay: 1,
    days: {
      // full day names
      names: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
      // abbreviated day names
      namesAbbr: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
      // shortest day names
      namesShort: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']
    },
    months: {
      // full month names (13 months for lunar calendards -- 13th month should be '' if not lunar)
      names: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre', ''],
      // abbreviated month names
      namesAbbr: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dec', '']
    },
    // AM and PM designators in one of these forms:
    // The usual view, and the upper and lower case versions
    //      [standard,lowercase,uppercase]
    // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
    //      null
    AM: ['AM', 'am', 'AM'],
    PM: ['PM', 'pm', 'PM'],
    eras: [
      // eras in reverse chronological order.
      // name: the name of the era in this culture (e.g. A.D., C.E.)
      // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
      // offset: offset in years from gregorian calendar
      { 'name': 'A.D.', 'start': null, 'offset': 0 }
    ],
    twoDigitYearMax: 2029,
    patterns: {
      // short date pattern
      d: 'M/d/yyyy',
      // long date pattern
      D: 'dddd, MMMM dd, yyyy',
      // short time pattern
      t: 'h:mm tt',
      // long time pattern
      T: 'h:mm:ss tt',
      // long date, short time pattern
      f: 'dddd, MMMM dd, yyyy h:mm tt',
      // long date, long time pattern
      F: 'dddd, MMMM dd, yyyy h:mm:ss tt',
      // month/day pattern
      M: 'MMMM dd',
      // month/year pattern
      Y: 'yyyy MMMM',
      // S is a sortable format that does not lety by culture
      S: 'yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss',
      // formatting of dates in MySQL DataBases
      ISO: 'yyyy-MM-dd hh:mm:ss',
      ISO2: 'yyyy-MM-dd HH:mm:ss',
      d1: 'dd.MM.yyyy',
      d2: 'dd-MM-yyyy',
      d3: 'dd-MMMM-yyyy',
      d4: 'dd-MM-yy',
      d5: 'H:mm',
      d6: 'HH:mm',
      d7: 'HH:mm tt',
      d8: 'dd/MMMM/yyyy',
      d9: 'MMMM-dd',
      d10: 'MM-dd',
      d11: 'MM-dd-yyyy'
    },
    backString: 'Indietro',
    forwardString: 'Avanti',
    toolBarPreviousButtonString: 'Indietro',
    toolBarNextButtonString: 'Avanti',
    loadString: 'Caricamento in corso...',
    todayString: ' ',
    dayViewString: 'Giorno',
    weekViewString: 'Settimana',
    monthViewString: 'Mese',
    timelineDayViewString: 'Timeline Giorno',
    timelineWeekViewString: 'Timeline Settimana',
    timelineMonthViewString: 'Timeline Mese',
    loadingErrorMessage: 'Errore di caricamento.',
    clearString: 'Oggi'
  };

  // Definisco come verranno mostrate le aule
  resources: any = {
    // Imposto lo schema dei colori
    colorScheme: 'scheme05',
    // Imposto la proprietà dal quale dovranno essere tratti i nomi delle aule
    dataField: 'room',
    // Definisco con quale orientamento mostrare le risorse
    orientation: 'vertical',
    // Definisco l'altezza delle righe che conterranno gli schedule. Essendo di default
    // la view impostata al timeline del giorno, imposto la corrispettiva altezza
    resourceRowHeight: this.resourceTimelineDayTimeline
  };

  // Imposto le modalità di visualizzazione a disposizione dell'utente
  views: any[] =
    [
      // Con type indico il tipo mentre con timeRuler e il formatString indico il
      // formato della data, che in questo caso sarà in 24h
      // La prima modalità è la timeline del giorno
      { type: 'timelineDayView', timeRuler: { formatString: 'HH:mm' } },
      // La seconda è quella a vista mensile
      { type: 'monthView', timeRuler: { formatString: 'HH:mm' } },
    ];

  // Indico la sorgente dal quale vengono presi gli schedule
  source: any = {
    // Indico il tipo di dati usato, in questo caso si ha un array di schedule
    dataType: 'array',
    // Indico i campi all'interno di ciascun elemento dell'array e assegno loro
    // un nome per poterli identificare poi quando si dovrà imporre la corrispondenza
    // fra i campi di jqxSchedule e i campi originali. Per ogni campo si indicano il
    // nome e il tipo
    dataFields: [
      { name: 'id', type: 'number' },
      // Nel caso in cui uno dei campi si trova all'interno di un oggetto, si usa il
      // map per indicare l'ubicazione esatta del campo. Ad esempio in questo caso
      // il campo name corrisponderà al nome dell'evento, il quale si trova
      // all'interno dell'oggetto event
      { name: 'name', type: 'string', map: 'event>name' },
      { name: 'room', type: 'string', map: 'room>name' },
      { name: 'starting', type: 'date' },
      { name: 'ending', type: 'date' },
      // Il campo resizable indica se lo schedule può essere modificato nella durata
      // attraverso il jqxSchedule
      { name: 'resizable', type: 'boolean' },
      // Il campo draggable indica se lo schedule può essere impostato a un altro giorno
      // attraverso il jqxSchedule
      { name: 'draggable', type: 'boolean' }
    ],
    // Indico quale sarà il campo che contiene l'id dello schedule
    id: 'id'
  };

  // Vengono indicate qui le corrispondenze fra i campi di jqxSchedule e i campi del dataFields
  appointmentDataFields: any =
    {
      from: 'starting',
      to: 'ending',
      id: 'id',
      subject: 'name',
      resourceId: 'room',
      resizable: 'resizable',
      draggable: 'draggable'
    };

  // Tramite dependancy ottengo i riferimenti a scheduleService, lo snackBar e il formBuilder
  constructor(private scheduleService: ScheduleService, private snackBar: MatSnackBar, private formBuilder: FormBuilder) {
    // Inizializzo i filtri con i filtri di default del FiltersCalendar
    this.filters = new FiltersCalendar();

    // Bisogna prelevare i dati degli schedule dal server e passarli al jqxSchedule.
    // Per farlo bisogna passare alla funzione getSchedules l'intervallo di date
    // degli schedule da prelevare. Inizialmente serviranno tutti gli schedule che vanno
    // dalla mezzanotte del giorno odierno fino a un secondo prima della mezzanotte del
    // giorno dopo. Per questa ragione vengono costruite le date from e to
    // from avrà la data di oggi
    this.from = new Date();
    // con orario mezzanotte e 0 minuti
    this.from.setHours(0, 0);
    // to avrà la data di oggi
    this.to = new Date();
    // con orario 23:59
    this.to.setHours(23, 59);
    // Avvio la funzione per ottenere gli schedule
    this.getSchedules();

    // La funzione group di formBuilder si occupa di prendere tutti i FormControl definiti
    // nel template e di definire così il gruppo di campi del form, evitando così di dover
    // definire uno ad uno tutti i FormControl
    this.filtersForm = this.formBuilder.group(new FiltersCalendar());
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
    this.filtersSubscription = this.filtersForm.valueChanges.pipe(
      // Il primo operatore è debounceTime che si mette in ascolto degli eventi emessi e aspetta
      // un lasso di tempo dall'ultimo evento ricevuto, in questo caso 500 millisecondi, prima di
      // emettere a sua volta un evento. In questo modo, si aspetta finchè l'utente non ha concluso
      // di inserire i propri input
      debounceTime(500),
      // successivamente, si usa l'operatore distinctUntilChanged che emette un evento soltanto se
      // il contenuto dell'ultimo evento ricevuto è diverso dal contenuto ricevuto precedentemente.
      // Purtroppo non funziona molto bene con gli oggeti, per via del modo con cui essi vengono
      // gestiti: quando JavaScript fa una comparazione di due oggetti, quello che fa è comparare
      // i loro riferimenti in memoria, perciò se entrambi puntano alla stessa zona di memoria, allora
      // i due oggetti sono uguali, altrimenti no. Di conseguenza, a ogni evento ricevuto, risulterebbe
      // al distinctUntilChanged che i due oggetti sono diversi. Per risolvere il problema, viene
      // passato al distinctUntilChanged una funzione che viene chiamata per poter identificare quando
      // i due oggetti devono essere identificati come diversi. All'interno della funzione da dare a
      // distinctUntilChanged si passa una funzione, la quale può ricevere in input i riferimenti
      // al vecchio e al nuovo oggetto. La funzione deve restituire un booleano. In questo caso,
      // la funzione restituisce true, quindi i due oggetti sono uguali, solo se entrambi gli oggetti
      // hanno tutte le loro proprietà uguali, cioè stesso nome dell'evento e id della stanza
      distinctUntilChanged((f: FiltersCalendar, g: FiltersCalendar) =>
                              f.eventSchedule === g.eventSchedule && f.roomId === g.roomId)
    ).
    // Infine viene fatta una sottoscrizione al nuovo osservatore generato dalla pipe. A ogni evento
    // emesso, viene applicata la funzione che si occuperà di filtrare gli schedule
    subscribe(val => this.onFiltersChange(val));
  }



  ngOnInit() { }

  // La funzione viene chiamata quando in jqxSchedule viene cambiata la data. Quando ciò
  // avviene, bisogna caricare nel jqxSchedule gli schedule della nuova data
  onDateChange(event: any): void {
    // In event.args sono contenuti i campi from e to
    const args = event.args;

    // Aggiorno il nuovo intervallo di date. Osservare che le date sono in un particolare formato di
    // date. Tale formato mette a disposizione la funzione toDate() per convertirle nel formato Date
    // di javascript
    this.from = args.from.toDate();
    this.to = args.to.toDate();

    // Chiamo la funzione per caricare i nuovi schedule e ottenere solo quelli che vanno da from a to
    this.getSchedules();
  }

  // La funzione si occupa di aggiornare i filtri salvati in memoria e chiama la funzione showSchedules
  // che si occuperà di mostrare gli schedule che rispettano i filtri
  onFiltersChange(filters: FiltersCalendar) {
    this.filters = filters;
    this.showSchedules();
  }

  // La funzione di reset si occupa di resettare i filtri del gruppo utilizzando l'apposita funzione
  // reset che prende in ingresso un nuovo oggetto FiltersCalendar, inizializzato con i valori di
  // default. Siccome i valori del gruppo sono cambiati, questa operazione scatenerà nell'observer
  // del gruppo l'emissione di un nuovo evento
  reset() {
    this.filtersForm.reset(new FiltersCalendar());
  }

  // La funzione viene chiamata ogni volta che viene cambiata la view del jqxScheduler
  onViewChange(event: any): void {
    // Memorizzo il newViewType che conterrà il nome della nuova view
    const viewType = event.args.newViewType;

    // In base al nome della view scelta
    switch (viewType) {
      // se è la view mensile, imposto l'altezza del blocco degli schedule per l'altezza mensile
      case 'monthView':
        this.resources.resourceRowHeight = this.resourceMonthRowHeight;
        break;
      // se è la view timeline, imposto l'altezza del blocco degli schedule per l'altezza timeline
      case 'timelineDayView':
        this.resources.resourceRowHeight = this.resourceTimelineDayTimeline;
        break;
    }

    // Il cambio della view comporta un cambio dell'intervallo di date degli schedule da mostrare
    // Devo perciò chiamare la funzione di onDateChange e passo l'intero evento. Al suo interno
    // c'è anche l'intervallo di date attuale
    this.onDateChange(event);
  }

  // La funzione si occupa di ricevere dal server gli schedule
  private getSchedules() {
    // Mi assicuro che la barra di caricamento venga mostrata
    this.loading = true;
    // Se ho già una sottoscrizione in memoria, ne elimino la sottoscrizione con l'unsubscribe. In questo modo,
    // nel caso in cui il precedente flusso non ha ancora finito di emettere il risultato,
    // quando creo il nuovo flusso non corro il pericolo di ricevere risultati vecchi che non servono più
    if (this.schedulesSubscription) {
      this.schedulesSubscription.unsubscribe();
    }

    // Chiamo la funzione getSchedules dello ScheduleService passandogli l'intervallo di date a cui gli schedule devono
    // appartenere e ricevo la risposta dal server, sottoforma di Observable (perciò devo effettuare la subscribe per
    // poterlo interpretare). Alla subscribe passo una funzione in caso di emissione di un nuovo evento. La funzione
    // prende gli schedule in ingresso, salva gli schedule in memoria, richiama la funzione per mostrare tutte le aule
    // degli schedule da mostrare nella Select dei filtri del template dello schedule e infine richiama la funzione per
    // mostrare nel jqxScheduler gli schedule
    this.schedulesSubscription = this.scheduleService.getSchedules(this.from, this.to).subscribe((schedules) => {
      // Ho gli schedule, nascondo la barra di caricamento
      this.loading = false;
      this.schedules = schedules;
      this.showRooms();
      this.showSchedules();
    },
      // Funzione in caso di errore
      () => {
        // È terminata la fase di caricamento. Nascondo la barra di caricamento
        this.loading = false;
        // Mostro un messaggio generico di errore
        this.snackBar.open('Errore nel caricare gli eventi. Si prega di riprovare più tardi', 'Chiudi', { duration: 2000 });
      });
  }

  // La funzione si occupa di trovare e salvare tutte le stanze degli schedule, in modo da poterle mostrare nel filtro del template
  private showRooms() {
    // Azzero l'array delle stanze
    this.rooms = [];

    // L'obiettivo della funzione è di trovare tutte le stanze degli schedule. Per farlo è necessario scandire ogni schedule
    // e verificare che nell'array delle stanze non sia ancora presente tale stanza. Se non è presente, l'aggiungo, altrimenti
    // passo allo schedule successivo dell'array degli schedule

    // Con forEarch, funzione di JavaScript, applico a ogni elemento di schedules una funzione. Alla funzione viene
    // passato in ingresso lo schedule dell'iterazione corrente
    this.schedules.forEach(schedule => {
      // La funzione find di JavaScript consente di verificare che esista un elemento dell'array che soddisfi una
      // determinata condizione. La condizione la si definisce attraverso il passaggio in ingresso di una funzione.
      // In questo caso specifico, la condizione è che la stanza dell'iterazione corrente, l'id della stanza
      // corrisponda all'id della stanza dello schedule. La funzione find si blocca appena trova una stanza che
      // soddisfi la condizione, ritornando true . Se non dovesse trovarne, restituirà false
      // Se la stanza dello schedule non è presente nell'array
      if (!this.rooms.find((room) => room.id === schedule.roomId)) {
        // la inserisco tramite l'operazione di push
        this.rooms.push(schedule.room);
      }
    });
  }

  // Si occupa di mostrare gli schedule nel jqxScheduler, filtrati in base ai filtri attualmente impostati
  private showSchedules() {
    // Impongo in source gli schedule, previa filtraggio con la funzione JavaScript di filter.
    // Il filter prende in ingresso una funzione e in base a ciò restituisce un array di elementi.
    // La funzione viene applicata a ogni elemento dell'array schedules
    this.source.localData = this.schedules.filter( schedule =>
      // Il filterString è una funzione che permette di comparare due stringhe fra loro in maniera case unsensitive
      // Se perciò il nome dell'evento dello schedule contiene al suo interno l'eventSchedule e contemporaneamente
      // se il filtro dell'id della stanza è nullo oppure se il numero del filtro della stanza è uguale a quella
      // dell'attuale schedule, allora lo schedule verrà accettato, altrimenti respinto
      filterString(this.filters.eventSchedule, schedule.event.name) &&
        (this.filters.roomId === '' || Number(this.filters.roomId) === schedule.roomId)
    );

    // Utilizzo il dataAdapter su source per impostare sia il dataAdapter
    this.dataAdapter = new jqx.dataAdapter(this.source);
    // che le risorse (che corrispondono alle aule)
    this.resources.source = new jqx.dataAdapter(this.source);
  }

  // Quando viene distrutto il componente
  ngOnDestroy(): void {
    // Si effettua la unsubscribe per evitare leak memory
    this.filtersSubscription.unsubscribe();
    // Si effettua la unsubscribe per evitare che se l'utente cambia pagina, continui un eventuale caricamento
    // e venga eseguito il risultato di una emissione
    this.schedulesSubscription.unsubscribe();
  }
}
