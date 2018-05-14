import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GuestbookService, Guest } from './guestbook.service';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'guestbook',
    templateUrl: './guestbook.component.html',
    styleUrls: ['./guestbook.component.scss']
})
export class GuestbookComponent implements OnInit, OnDestroy {
    public guests: Array<Guest> = [];
    public signed = false;

    private guestsSubscription: Subscription;
    private clientStateSubscription: Subscription;

    constructor(client: HttpClient, private guestbookService: GuestbookService) {
        this.guestsSubscription = this.guestbookService.guests$.subscribe((result) => {
            this.guests = result;
        });

        this.clientStateSubscription = this.guestbookService.clientState$.subscribe((state) => {
            this.signed = state.signed;
        });
    }

    ngOnInit(): void {
        //
    }

    ngOnDestroy(): void {
        this.guestsSubscription.unsubscribe();
        this.clientStateSubscription.unsubscribe();
    }
}
