/* Developed By Davide Antonino Vincenzo Micale */
import { EventSchedule } from './event';
import { Room } from './room';

// Il modello del ScheduleClient (il modello di schedule del client)
export class ScheduleClient {
    constructor(
        public id: number,
        public starting: Date,
        public ending: Date,
        public eventId: number,
        public roomId: number,
        public event?: EventSchedule,
        public room?: Room,
        public resizable: boolean = false,
        public draggable: boolean = false
    ) {  }
}


// Il modello del ScheduleServer (il modello di schedule del server)
export class ScheduleServer {
    constructor(
        public id: number,
        public starting: string,
        public ending: string,
        public date: Date,
        public conflict: boolean,
        public otherConflicts: boolean,
        public eventId: number,
        public roomId: number,
        public event?: EventSchedule,
        public room?: Room
    ) {  }
}

// Il modello della modifica di un appuntamento
export class EditSchedule {
    public id: number;
    public date: Date;
    public starting: string;
    public ending: string;
    public updateAll: number;
    public conflict: boolean;
    public eventId: number;
    public roomId: number;
}

// Il modello contenente i filtri degli schedule
export class FiltersSchedule {
    constructor(
        // Impongo dei valori di default
        public dateStart: Date = null,
        public dateEnd: Date = null,
        public conflict: boolean = false
    ) {  }
}

// Definisco la regular expression che verifichi se una stringa è un orario.
// Le regular expression sono definiti fra '/' .
// Con ^ e $ indico rispettivamente che la stringa deve iniziare e finire
// in base a ciò che è stabilito all'interno della regular expression.
// L'espressione è suddivisa in due gruppi, separati dal carattere ':'.
// Il primo gruppo (che rappresenta le ore) può avere il numero 0 seguito
// da un numero da 0 a 9,
// oppure può avere il numero 1 seguito da un numero da 0 a 9, oppure può
// avere il numero 2 seguito da un numero 0 a 3 (d'altronde, le ore vanno
// dalle 00 alle 23). Il secondo gruppo (che rappresenta i minuti) è
// composto da un numero che assume valori da 0 a 5 e da un numero che
// assume valori da 0 a 9 (i minuti assumono valori da 00 a 59)
export const time_format = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
