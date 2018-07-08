/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit } from '@angular/core';
// Importo il modello del form di login
import { Login } from '../shared/login';
import { LoginService } from '../services/login.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Dialog } from '../shared/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Creo la variabile login in modo da poterla poi ricevere dal template e abilitare le reazioni
  login: Login = new Login();
  // Tengo traccia dello stato di richiesta di login, se è in atto in questo momento o no. Nella fase iniziale non lo sarà
  inProgress = false;

  // Nel costruttore, tramite dependancy injection, ottengo il loginService che si occuperà di effettuare la chiamata al server,
  // lo snackbar di material che si occupa di mostrare all'utente il messaggio di successo del login e infine il dialog per
  // mostrare i messaggi di errore
  constructor(private loginService: LoginService, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { }

  ngOnInit() {
  }

  onSubmit() {
    // Sottomesso il form, il login è in corso
    this.inProgress = true;
    // Eventuali messaggi precedentemente mostrati vengono chiusi
    this.snackBar.dismiss();

    // Ricevo la risposta dal server, sottoforma di Observable (perciò devo effettuare la subscribe per poterlo interpretare)
    this.loginService.login(this.login).subscribe( () => {
        // Mostro il messaggio di successo
        this.snackBar.open('Accesso riuscito', 'Chiudi', { duration: 2000});
        // La fase di login è terminata
        this.inProgress = false;

        // Imposto l'url in cui verrà rediretto l'utente. Se è già stato impostato nel LoginService uso quello, altrimenti
        // vado nella home
        const redirect = this.loginService.redirectUrl ? this.loginService.redirectUrl : '/home';

        // Reindirizzamento dell'utente
        this.router.navigate([redirect]);
      },
      (error) => {
        // Inizializzo il contenuto che avrà il messaggio di errore
        const dialog: Dialog = {
          title: 'Errore',
          message: ''
        };

        if (error.error.error != null) {
          // Il vero messaggio di errore si trova molto in profondità...
          error = error.error.error;

          // Se i dati del login non sono corretti
          if (error.code === 'LOGIN_FAILED') {
            // Definisco il messaggio di errore dei dati
            dialog.message = 'Email e/o password errati';
          }
        } else {
          // Errore generico, definisco l'errore HTTP
          dialog.message = error.statusText;
        }
        // Mostro il messaggio di errore, aprendo il dialog e impostando la larghezza del dialog e il contenuto
        this.dialog.open(DialogComponent, {
          width: '400px',
          data: dialog
        });
        // La fase di login è terminata
        this.inProgress = false;
      }
    );
  }

}
