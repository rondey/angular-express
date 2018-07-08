/* Developed By Davide Antonino Vincenzo Micale */
import { Client } from './client';

// Il modello del Event
export class EventSchedule {
    constructor(
        public id: number,
        public name: string,
        public dateStart: Date,
        public dateEnd: Date,
        public conflict: boolean,
        public clientId: number,
        // Non è obbligatorio il client
        public client?: Client
    ) {  }
}

// Il modello della creazione di un evento
export class CreateEvent {
    public id: number;
    public name: string;
    public dateStart: Date;
    public dateEnd: Date;
    public hours: number;
    public starting: string;
    public ending: string;
    public periodicity: number;
    public weekDays: number[];
    public conflict: boolean;
    public clientId: number;
    public roomId: number;
}

// Il modello contenente i filtri degli schedule del calendario
export class FiltersCalendar {
    constructor(
        // Impongo dei valori di default alle stringhe
        public eventSchedule: string = '',
        public roomId: string = ''
    ) {  }
}

// Il modello contenente i filtri degli eventi
export class FiltersEvent {
    constructor(
        // Impongo dei valori di default alle stringhe
        public eventSchedule: string = '',
        public dateStart: Date = null,
        public dateEnd: Date = null,
        public conflict: boolean = false
    ) {  }
}
