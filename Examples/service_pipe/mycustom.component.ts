import { Component, OnInit } from '@angular/core';
import {CustomService} from './custom.service';

@Component({
  selector: 'app-mycustom',
  templateUrl: './mycustom.component.html',
  styleUrls: ['./mycustom.component.css']
})
export class MycustomComponent implements OnInit {

  constructor(private myservice: CustomService) { }

  birthday = new Date(1986,4,21);

  cash = 25.6789;
  chars = 'testo lungo da splittare';

  formatted;
  setFormat(){
    this.formatted = 'shortDate';
  }

  dataResults;

  ngOnInit() {
    this.myservice.getStatus();

    this.myservice.getData()
    .then(data=>{
      this.dataResults = data;
    })
  }

}
