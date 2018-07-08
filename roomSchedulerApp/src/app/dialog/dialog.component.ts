/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Dialog } from '../shared/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  // Tramite il dependancy injection ricevo il riferimento alla dialog e viene iniettato anche il campo data
  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Dialog) {
    // Se non è impostato un testo per il bottone di chiusura, uso quello di default
    if (!data.button) {
      data.button = 'Ok';
    }
   }

  ngOnInit() {
  }

  close() {
    // Tramite il riferimento ricevuto nel costruttore, posso chiudere la dialog
    this.dialogRef.close();
    // Se è impostata una funzione da eseguire al click sul bottone, la eseguo
    if (this.data.onClose) {
      this.data.onClose();
    }
  }

}
