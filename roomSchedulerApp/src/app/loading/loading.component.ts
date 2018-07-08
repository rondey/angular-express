/* Developed By Davide Antonino Vincenzo Micale */
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  // Come input ricevo l'array di elementi di cui tenere traccia
  @Input() elements = undefined;
  constructor() { }

  ngOnInit() {
  }

}
