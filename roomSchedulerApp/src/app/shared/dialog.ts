/* Developed By Davide Antonino Vincenzo Micale */
// Il modello del dialog
export class Dialog {
    constructor(
        public title: string,
        public message: string,
        public button?: string,
        public onClose?: Function
    ) {  }
}
