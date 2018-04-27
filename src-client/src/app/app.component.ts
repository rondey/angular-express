import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public now: string;

  constructor(client: HttpClient) {
    client.get('/api/time/now').subscribe((result: {[now: string]: string}) => {
      this.now = result.now;
    });
  }
}
