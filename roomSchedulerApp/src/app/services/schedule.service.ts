/* Developed By Davide Antonino Vincenzo Micale */
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ScheduleClient, ScheduleServer, EditSchedule } from '../shared/schedule';
import { Observable, throwError, of } from 'rxjs';
import { share, map, concat, retryWhen, delay, take, catchError } from 'rxjs/operators';
import { EventSchedule, CreateEvent } from '../shared/event';
import { LoginService } from './login.service';
import { Room } from '../shared/room';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  // Servirà per imporre come header nella chiamata HTTP il tipo del contenuto della chiamata (JSON)
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Tramite dependancy injection ottengo il riferimento ad httpClient e al loginService
  constructor(private httpClient: HttpClient, private loginService: LoginService) {
    // Si sottoscrive al flusso accessToken per poter ottenere l'id dell'accessToken e
    // poterlo mettere negli header delle chiamate http. In questo modo, se l'utente è
    // loggato, e se possiede l'autorizzazione del server, potrà effettuare operazioni
    // nelle aree riservate. Anche se l'utente non fosse loggato, l'id di default
    // dell'accessToken non povocherà errori nelle sezioni del server libere
    loginService.accessToken$.subscribe(accessToken => {
      // Una volta individuato l'accessToken, si assegna il nuovo header all'httpOptions
      // che consiste negli stessi header che aveva in precedenza con in aggiunta,
      // attraverso la funzione set, l'header Authorization e il cui valore sarà l'id
      // dell'accessToken
      this.httpOptions.headers = this.httpOptions.headers.set('Authorization', accessToken.id);
    });
  }

  // La funzione restituisce un observable che emette array di EventSchedule e che prende
  // in ingresso l'id dell'utente a cui appartengono gli eventi
  public getListEvents(userId: number): Observable<EventSchedule[]> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams. A esso con la funzione append
    // viene aggiunto un parametro HTTP. Si aggiunge il parametro che permetta di ordinare
    // i risultati in base alla data di fine, in modo decrescente
    this.httpOptions['params'] = new HttpParams().append('filter[order]', 'dateEnd DESC').
                                                  append('filter[order]', 'dateStart DESC');
    // Si crea un observable di array di EventSchedule ottenuto tramite il metodo http get
    // all'indirizzo specificato e con le opzioni precedentemente impostate
    const events$ = this.httpClient.get<EventSchedule[]>(`/api/Clients/${userId}/events`, this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(events$);
  }

  // La funzione restituisce un observable che emette array di ScheduleServer e che prende
  // in ingresso l'id dell'utente e l'evento a cui appartengono gli schedule
  public getListSchedules(userId: number, eventId: number): Observable<ScheduleServer[]> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams. A esso con la funzione append
    // viene aggiunto un parametro HTTP. Si aggiunge il parametro che permetta di ordinare
    // i risultati in base alla data, in modo crescente
    this.httpOptions['params'] = new HttpParams().append('filter[order]', 'date ASC');
    // Si ottiene l'observable di array di ScheduleServer ottenuto tramite il metodo http get
    // all'indirizzo specificato e con le opzioni precedentemente impostate
    const schedules$ = this.httpClient.get<ScheduleServer[]>(`/api/Clients/${userId}/events/${eventId}/schedules`, this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(schedules$);
  }

  // La funzione restituisce un observable che emette uno schedule e che prende
  // in ingresso l'id dello schedule
  public getSchedule(scheduleId: number): Observable<ScheduleServer> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams
    this.httpOptions['params'] = new HttpParams();
    // Si ottiene l'observable delllo schedule ottenuto tramite il metodo http get
    // all'indirizzo specificato e con le opzioni precedentemente impostate
    const schedule$ = this.httpClient.get<ScheduleServer>(`/api/schedules/${scheduleId}`, this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(schedule$);
  }

  // La funzione si occupa di trovare il primo schedule dell'evento specificato che sia in uno stato di conflitto.
  // Il primo da prendere sarà in ordine crescente
  public getFirstScheduleConflict(eventId: number): Observable<ScheduleServer> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams. Come parametri in ingresso per
    // la ricerca dello schedule si passano il conflict a true, l'ordine crescente e
    // lo schedule dovrà appartenere all'evento specifico. Esso deve essere convertito necessariamente in stringa,
    // perchè i parametri devono necessariamente essere di tipo stringa
    this.httpOptions['params'] = new HttpParams().append('filter[where][conflict]', 'true').append('filter[order]', 'date ASC').
                                                  append('filter[where][eventId]', eventId.toString());
    // Si ottiene l'observable di uno ScheduleServer ottenuto tramite il metodo http get
    // all'indirizzo specificato e con le opzioni precedentemente impostate
    const schedule$ = this.httpClient.get<ScheduleServer>('/api/schedules/findOne', this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(schedule$);
  }

  // La funzione restituisce un observable che emette array di Room e che prende
  // in ingresso la data, l'ora di inizio e l'ora di fine ed eventualmente l'id dello schedule
  // in cui le stanze devono essere libere. Nel caso in cui lo schedule non fosse in stato di
  // conflitto e avesse egli stesso prenotato una stanza, tale stanza comparirà nella lista di
  // stanze libere grazie allo scheduleId
  public getEmptyRooms(date: Date, starting: string, ending: string, scheduleId?: number): Observable<Room[]> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams e inserendo come parametri la
    // date in formato ISO, lo starting e l'ending
    this.httpOptions['params'] = new HttpParams().append('date', date.toISOString()).append('starting', starting).
      append('ending', ending);
      // Nel caso in cui lo scheduleId venisse impostato, esso sarà inserito fra i parametri
      if (scheduleId) {
        // Essendo immutabile un HttpParams, prendo i precedenti parametri, gli appendo lo scheduleId come parametro
        // e il risultato, che sarà a sua volta un HttpParams, lo assegno alle opzioni della chiamata HTTP
        this.httpOptions['params'] = this.httpOptions['params'].append('scheduleId', scheduleId.toString());
      }

    // Si crea un observable di array di EventSchedule ottenuto tramite il metodo http get
    // all'indirizzo specificato e con le opzioni precedentemente impostate
    const events$ = this.httpClient.get<EventSchedule[]>('/api/Rooms/empty', this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(events$);
  }

  // La funzione si occuperà di prelevare i dati dal server e restituendoli al chiamante sottoforma di array di
  // ScheduleClient Observable, prendendo solo quelli che vanno dalla data from alla data to
  public getSchedules(from: Date, to: Date): Observable<ScheduleClient[]> {
    // Impongo i parametri nell'HTTP. Si passa all'interno delle HttpOptions la proprietà params. Per aggiungere parametri
    // bisogna inizialmente creare un nuovo oggetto HttpParams e appendere con la funzione params i vari parametri.
    // append vuole in ingresso il nome del parametro e il suo valore.
    // I filter[include] permettono di includere nel risultato, oltre che lo schedule,
    // anche l'evento e l'aula a cui appartengono gli schedule (così come richiesto da Loopback).
    // Con i filter[where] impongo le condizioni di filtraggio. Nel caso specifico il campo date deve trovarsi fra
    // from e to (la data deve essere minore o uguale la data from e maggiore o uguale alla data to). Osservare che
    // l'append richiede valori in stringhe, bisogna convertire i campi from e to in stringhe nel formato ISO
    this.httpOptions['params'] = new HttpParams().append('filter[include]', 'event').append('filter[include]', 'room').
      append('filter[where][date][between][0]', from.toISOString()).
      append('filter[where][date][between][1]', to.toISOString()).
      // Evito di mostrare gli schedule che sono in conflitto con altri schedule che si dovrebbero verificare nella stessa
      // data e nella stessa aula
      append('filter[where][conflict]', 'false');

    // Definisco un observable di tipo array di ScheduleClient
    let schedules$: Observable<ScheduleClient[]>;
    // Effettuo una chiamata get al server. La chiamata restituisce un Observable di array di ScheduleServer.
    let s$ = this.httpClient.get<ScheduleServer[]>('/api/Schedules', this.httpOptions);
    // Ottengo la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    s$ = this.retryMultipleTimes(s$);
    //  Utilizzando l'operatore pipe posso applicare una catena di operatori uno dietro l'altro e otterrò l'observable
    // di array di ScheduleClient
    schedules$ = s$.pipe(
      // In caso di assenza di errori, si proseguirà nella pipe con l'operatore map che permette di applicare una funzione
      // all'elemento dell'Observable, cioè l'array di schedule. Passo il riferimento dell'array alla funzione suddetta
      map((schedules) => {
        // L'obiettivo è di ottenere un array di schedule che siano più coerenti con ciò che richiede lo jqxScheduler:
        // mentre il server possiede un campo date indicante la data dello schedule e i campi starting ed ending sono
        // delle stringhe contenenti solo ed esclusivamente ora e minuto, nel jqxScheduler è richiesto che starting ed
        // ending siano dei campi di tipo Date e che possiedano al loro interno sia il giorno dello schedule che l'orario
        let schedulesClient: ScheduleClient[];

        // Per prima cosa filtro gli schedule, prendendo solo quelli che possiedono un evento
        // (utile se dovessimo applicare filtri sull'oggetto evento. Purtroppo
        // Loopback restituisce lo schedule anche se il relativo ogggetto non rispetta il filtro e dunque se l'oggetto è nullo. Per questo
        // è importante eliminare gli schedule che hanno il campo event nullo).
        // Il filter è una funzione Java Script che prende in input una funzione, la quale riceve in input, uno alla volta, gli schedule
        // e restituisce un array di schedule. La funzione che viene passata a filter deve restitutire un booleano: se è true, l'elemento
        // viene inserito nell'array di ritorno, altrimenti viene scartato. Nel nostro caso, vengono presi solo gli schedule che hanno un
        // evento
        schedules = schedules.filter((schedule) => schedule.event != null);

        // Devo adesso convertire da array di schedule server ad array di schedule client. Applico la funzione JavaScript map a schedules
        // che a ogni elemento dell'array applica una funzione, che prende uno alla volta in input un elemento dell'array, e che restituisce
        // un array di elementi, presi dalla funzione.
        schedulesClient = schedules.map(schedule => {
          // Per convertire le starting e le ending degli schedule da semplici stringhe con ora e minuti a Date con giorno ora e minuti
          // si crea la costante d di appoggio contente la data di oggi
          const d = new Date(schedule.date);
          // Si crea l'array contenente l'ora e i minuti dallo starting tramite la funzione di split che suddivide la stringa per il :
          let hours = schedule.starting.split(':');
          // Si impone il nuovo orario alla costante d'appoggio d. Osservare che setHours richiede numeri, non stringhe, perciò è necessario
          // prima convertire da stringa a numero ore e minuti
          d.setHours(Number(hours[0]), Number(hours[1]));
          // Si crea la costante starting che avrà la data di d. Non posso assegnare direttamente d, perchè nel momento in cui modifico d
          // anche starting verrà modificato
          const starting = new Date(d);

          // Operazione analoga verrà fatta ad ending
          hours = schedule.ending.split(':');
          d.setHours(Number(hours[0]), Number(hours[1]));
          const ending = new Date(d);

          // Infine, restituisco un elemento di tipo ScheduleClient contenente gli elementi dello schedule con i nuovi starting ed ending di
          // tipo Date e senza la proprietà date (inutile, anche perchè la date è inclusa in starting e in ending)
          return new ScheduleClient(
            schedule.id,
            starting,
            ending,
            schedule.eventId,
            schedule.roomId,
            schedule.event,
            schedule.room
          );

        });

        // Impostare in start e in end la data presa dal campo date
        return schedulesClient;
      }),

      // Infine, per evitare di ripetere a ogni sottoscrizione la chiamata HTTP, si usa share, che permette all'schedule$ di
      // poter condividere il risultato della chiamata al server
      share()
    );

    // Restituisco al chiamante l'Observable, in modo che possa gestire il risultato della chiamata al server
    return schedules$;
  }

  // La funzione si occupa della creazione di un evento, a partire da un oggetto CreateEvent e restituisce un Observable di
  // CreateEvent
  public createEvent(eventSchedule: CreateEvent): Observable<CreateEvent> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams
    this.httpOptions['params'] = new HttpParams();

    // Si ottiene il flusso a partire dalla chiamata post al server, alla quale viene passato l'evento da creare
    const events$ = this.httpClient.post<CreateEvent>(`/api/Clients/${eventSchedule.clientId}/events/`, eventSchedule, this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(events$);
  }

  // La funzione si occupa della modifica di uno o più schedule, prendendo come parametri l'id dell'utente e lo
  // schedule di tipo EditSchedule e restituendo lo schedule aggiornato dal server
  public editSchedule(userId: number, schedule: EditSchedule): Observable<ScheduleServer> {
    // Si cancellano eventuali parametri presettati in precedenti chiamate http effettuate
    // dallo ScheduleService assegnando un nuovo HttpParams
    this.httpOptions['params'] = new HttpParams();

    // Si ottiene il flusso a partire dalla chiamata patch al server, alla quale viene passato lo schedule
    // da aggiornare e le modalità di aggiornamento
    const schedule$ = this.httpClient.patch<ScheduleServer>(`/api/Clients/${userId}/events/${schedule.eventId}/schedules/${schedule.id}`,
                                                      schedule, this.httpOptions);
    // Restituisco la pipe creata dalla funzione retryMultipleTimes che rieffettua più volte la chiamata in
    // caso di errori
    return this.retryMultipleTimes(schedule$);
  }

  // La funzione retryMultipleTimes si occupa applicare a un observable una pipe in modo da ripetere la chiamata più volte in caso di errore
  private retryMultipleTimes(observer$: Observable<any>): Observable<any> {
    // Viene restituito l'observable ottenuto applicando la pipe all'observable d'input
    return observer$.pipe(
      // All'interno della pipe, si effettua un tentativo di catturare e gestire l'errore
      catchError(error => {
        // Se il codice dell'errore è che non è stata trovata l'istanza, non restituisco l'errore
        // ed emetto nel flusso un valore nullo. In questo modo, se venisse usato il componente
        // loading, verrà scatenata la sua reazione, che mostrerà a schermo l'assenza di elementi
        // da mostrare
        if (error.error.error.code === 'MODEL_NOT_FOUND') {
          return of(null);
        } else {
          // Altrimenti, solleva l'errore tramite la funzione JavaScript. Il proseguio della pipe
          // gestirà tale errore
          throw(error);
        }
      }),
      // Si applica la retryWhen che permette di ripetere la chiamata
      // al server in caso di errori rieffettuando la sottoscrizione. All'interno di retryWhen definisco una funzione che
      // dovrà restituire un Observable: dato in ingresso l'observable di partenza a meno dell'errore, posso applicarvi la funzione
      // pipe per applicarvi una serie di operatori.
      retryWhen(errors => errors.pipe(
        // Con l'operatore delay aspetto 1 secondo (in questo modo posso fare nuovi tentativi
        // ognuno distanziato dall'altro di 1 secondo)
        delay(1000),
        // Con take imposto che la ripetizione verrà effettuata per un massimo di 10 volte.
        // Dopo 10 tentativi, si proseguirà con la catena
        take(10),
        // e cioè con concat che mi permette di emettere il throwError, cioè l'emissione
        // di un errore nel flusso
        concat(throwError('Error')))
      ));
  }
}
