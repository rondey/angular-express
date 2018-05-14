import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Guest } from './guestbook.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'guest',
    templateUrl: './guest.component.html',
    styleUrls: ['./guest.component.scss']
})
export class GuestComponent implements OnChanges {
    @Input() guest: Guest;

    public sign: string;
    public message: string;
    public date: Date;

    constructor() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        this.sign = this.guest.sign;
        this.message = this.guest.message;
        this.date = new Date(this.guest.date);
    }
}
