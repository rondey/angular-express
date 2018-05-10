import { Component } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'guestbook',
  templateUrl: './guestbook.component.html'
})
export class GuestbookComponent 
{
  public now: string;
  public offset: number;
  public limit: number;

  constructor(client: HttpClient, private route: ActivatedRoute, private router: Router) {
    client.get('/api/time/now').subscribe((result: {[now: string]: string}) => {
      this.now = result.now;
    });
  }

  ngOnInit(): void {
    console.log(`ngOnInit AppComponent`);
    this.route.params.subscribe(params => {
      if(params.hasOwnProperty('offset'))
      {
        console.log(params.offset);
        console.log(params.limit);
        this.offset = params.offset;
        this.limit = params.limit;
      }
    });

    this.route.data.subscribe(data => {
      if(data.hasOwnProperty('offset'))
      {
        console.log(data.offset);
        console.log(data.limit);
        this.offset = data.offset;
        this.limit = data.limit;
      }
    });
  }
}
