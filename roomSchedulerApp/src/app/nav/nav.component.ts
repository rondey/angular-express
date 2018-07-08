/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnDestroy {
  private accessTokenSubscription: Subscription;
  loggedIn: boolean;
  userId: number;

  // Utilizzato dal nav per sapere se lo schermo è piccolo tale da richiedere di nascondere il menù
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  // Tramite Dependancy Injection ottengo il loginService e il breakpointObserver
  constructor(private loginService: LoginService, private breakpointObserver: BreakpointObserver) {
    this.accessTokenSubscription = this.loginService.accessToken$.subscribe((accessToken) => {
      // Ottengo la loggedIn per conoscere se l'utente si è loggato
      this.loggedIn = loginService.isLogged();
      // Ottengo l'id dell'utente
      this.userId = accessToken.userId;
    });
  }

  ngOnDestroy() {
    // Elimino la sottoscrizione
    this.accessTokenSubscription.unsubscribe();
  }

}
