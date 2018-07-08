/* Developed By Davide Antonino Vincenzo Micale */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Login } from '../shared/login';
import { Observable, BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';
import { AccessToken, accessTokenStorageKey } from '../shared/access-token';

@Injectable({
    // In questo modo il servizio è disponibile in tutta l'app
    providedIn: 'root'
})
export class LoginService {
    // Contiene l'url al quale l'utente verrà reindirizzato a seguito del login
    redirectUrl: string;
    // Contiene l'access token dell'utente
    private accessToken: AccessToken;

    // Servirà per imporre come header nella chiamata HTTP il tipo del contenuto della chiamata (JSON)
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    // Definisco il BehaviorSubject che conterrà l'AccessToken
    public accessToken$ = new BehaviorSubject<AccessToken>({
        userId: 0,
        id: '',
        ttl: 0,
        created: new Date(0)
    });


    // Tramite Dependancy Injection ottengo httpClient che permette di effettuare le chiamate HTTP
    constructor(private httpClient: HttpClient) {
        // Prelevo l'AccessToken dalla memoria dal LocalStorage, la memoria a lungo termine del Browser
        const accessToken = localStorage.getItem(accessTokenStorageKey);
        // Se effettivamente è presente
        if (accessToken) {
            try {
                // Invio l'acccessToken a tutti coloro che si sono sottoscritti ad accessToken$. Il Browser memorizza solo stringhe,
                // di conseguenza è necessario effettuare il parsing della stringa
                this.accessToken$.next(JSON.parse(accessToken));
            } catch {
                console.log('Error in client state parsing');
            }
        }
        this.accessToken$.subscribe( (at) => {
            this.accessToken = at;
         } );
     }

    // La funzione di login serve per poter effettuare l'operazione di login. Prende in ingresso i dati del login e restituisce un
    // Observable di tipo AccessToken
    public login(login: Login): Observable<AccessToken> {
        // Effettuo una chiamata post al server. La chiamata restituisce un Observable. Utilizzando l'operatore pipe posso applicare
        // una catena di operatori uno dietro l'altro. Nel caso specifico si applica la share, che permette all'accessToken$ di
        // poter condividere il risultato della chiamata al server (altrimenti, a ogni subscribe verrebbe rieffettuata la chiamata
        // al server)
        const login$ = this.httpClient.post<AccessToken>('/api/Clients/login', login, this.httpOptions).pipe(share());
        // Alla fase di login, restituisco l'elemento ottenuto dal server
        login$.subscribe(
            // Se è andato a buon fine il login, ricevo l'accessToken
            (accessToken: AccessToken) => {
                // Lo salvo nella memoria a lungo termine del Browser, come una semplice stringa
                localStorage.setItem(accessTokenStorageKey, JSON.stringify(accessToken));
                // Invio l'accessToken a tutti coloro che si sono sottoscritti ad accessToken$
                this.accessToken$.next(accessToken);
            }
        );

        // Restituisco al chiamante l'Observable, in modo che possa gestire il risultato della chiamata al server
        return login$;
    }

    // Permette di sapere se attualmente è stato effettuato o meno il login
    public isLogged(): boolean {
        // Se è definito l'id dell'utente, che deve essere maggiore di 0, allora si è attualmente loggati
        if ( this.accessToken.userId > 0 ) {
            return true;
        }
        return false;
    }

    // Funzione per ottenere il proprio id
    public myUserId(): number {
        return this.accessToken.userId;
    }
}
