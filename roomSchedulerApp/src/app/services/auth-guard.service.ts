/* Developed By Davide Antonino Vincenzo Micale */
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  // Il servizio lo inietto nel root. Questo perchè verrà usato per tutta l'app per verificare che
  // l'utente sia autorizzato nell'accedere alle pagine dell'app
  providedIn: 'root'
})

// Gli auth guard si occupano di verificare le autorizzazioni dell'utente. Affinchè l'auth guard dia
// o meno il permesso di accedere a una pagina, deve implementare il CanActivate
export class AuthGuard implements CanActivate {

  // Tramite dependancy injection ricevo il loginService e il router
  constructor(private loginService: LoginService, private router: Router) { }

  // La funzione canActivate permette di restituire al chiamante true se l'utente può accedere alla
  // pagina, false se non può. Riceve in ingresso il route, che nel nostro caso non servirà, e lo
  // state
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // All'interno dello state c'è l'url a cui si sta provando a entrare
    const url: string = state.url;

    // Chiamo la funzione interna checkAuth
    return this.checkAuth(url, route);
  }

  // La funzione canActivateChild permette di restituire al chiamante true se l'utente può accedere alla
  // pagina, false se non può. Nel nostro caso, la risposta verrà data dal canActivate
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  // Il checkAuth si occupa di verificare che l'utente sia attualmente connesso e in base a ciò
  // se l'utente ha l'autorizzazione o meno a proseguire
  private checkAuth(url: string, route: ActivatedRouteSnapshot): boolean {
    // Verifica innanzitutto se l'utente è loggato chiamando l'apposita funzione del LoginService
    if (this.loginService.isLogged()) {
      // Ottengo route l'id dell'utente
      const userId = route.paramMap.get('userId');
      // Nel caso in cui il percorso contiene uno userId, se questo è 0 (non esiste alcun id di utente a 0),
      // oppure se l'id è diverso da quello con cui ci si è loggati, allora non si ha il permesso di proseguire
      if ( userId != null && ( Number(userId) === 0 || Number(userId) !== this.loginService.myUserId()) ) {
        return false;
      }
      // Se l'autorizzazione è stata chiesta per accedere alla pagina di login, siccome l'utente
      // è già connesso, non ha motivo di restare in tale pagina. Altrimenti può proseguire.
      // Si controlla perciò se l'url a cui si tenta di entrare è quello della pagina di login
      return url !== '/login';
    }

    // Se si è giunti fin qui è perchè l'utente non è loggato.
    // Se l'utente sta cercando di entrare nella pagina di login, allora è autorizzato ad entrare
    if (url === '/login') {
      return true;
    }

    // Se si è giunti qui è perchè l'utente vuole entrare in un'altra pagina.
    // Memorizzo nel loginService, l'url a cui bisognerà essere reindirizzati una volta terminata
    // la procedura di login
    this.loginService.redirectUrl = url;

    // Reindirizzo l'utente nella pagina di login tramite la funzione del router di nome navigate
    // Come parametro prende una lista di stringhe, ognuno è un pezzo dell'url
    this.router.navigate(['/login']);

    // Infine restituisce false, indicando che l'utente non ha l'autorizzazione a proseguire
    return false;
  }
}
