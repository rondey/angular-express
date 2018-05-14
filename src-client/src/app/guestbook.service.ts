import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, mapTo, share, retry, filter } from 'rxjs/operators';

@Injectable()
export class GuestbookService {
    public guests$: Observable<Array<Guest>>;
    public clientState$ = new BehaviorSubject<ClientState>({
        signed: false
    });

    private version = -1;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private httpClient: HttpClient) {
        const clientState = localStorage.getItem(clientStateStorageKey);
        if (clientState) {
            try {
                this.clientState$.next(JSON.parse(clientState));
            } catch {
                console.log('Error in client state parsing');
            }
        }

        this.guests$ = interval(1000)
            .pipe(
                switchMap(() => this.httpClient.get<number>('/api/guestbook/version')),
                filter((version) => {
                    if (this.version === version) {
                        return false;
                    }

                    this.version = version;
                    return true;
                }),
                switchMap(() => this.httpClient.get<Array<Guest>>('/api/guestbook/guests')),
                retry(3),
                share()
            );
    }

    public clear(): void {
        this.httpClient.delete('/api/guestbook/clear').subscribe(() => {
            this.clientState$.next({
                signed: false
            });
        });
    }

    public sign(guest: Guest): void {
        const currentState = this.clientState$.getValue();
        if (!currentState.signed) {
            this.httpClient.put<Array<Guest>>('/api/guestbook/sign', [guest], this.httpOptions).subscribe(() => {
                currentState.signed = true;
                localStorage.setItem(clientStateStorageKey, JSON.stringify(currentState));
                this.clientState$.next(currentState);
            });
        }
    }
}

export interface Guest {
    sign: string;
    message: string;
    date: number;
}

export interface ClientState {
    signed: boolean;
}

const clientStateStorageKey = 'guestbookClientState';
