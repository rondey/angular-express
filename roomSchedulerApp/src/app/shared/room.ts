/* Developed By Davide Antonino Vincenzo Micale */
// Il modello del Room
export class Room {
    constructor(
        public id: number,
        public name: string,
        public capacity: number,
        public wifi: boolean,
        public socket: boolean,
        public ethernet: boolean,
        public computer: boolean,
        public interactiveWhiteboard: boolean
    ) {  }
}

// Il modello contenente i filtri degli eventi
export class FiltersRoom {
    constructor(
        // Impongo dei valori di default alle stringhe
        public name: string = '',
        public capacityMin: number = null,
        public capacityMax: number = null,
        public wifi: boolean = null,
        public socket: boolean = null,
        public ethernet: boolean = null,
        public computer: boolean = null,
        public interactiveWhiteboard: boolean = null,
    ) {  }
}
