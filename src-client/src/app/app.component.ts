import {
  Component, OnChanges, OnInit, DoCheck, AfterContentInit,
  AfterContentChecked, AfterViewInit, AfterViewChecked, SimpleChanges
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { AboutComponent } from './about.component';
import { GuestbookService } from './guestbook.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public now: Date;

  constructor(
    client: HttpClient,
    private guestbookService: GuestbookService,
    private matDialog: MatDialog) {

    client.get('/api/time/now').subscribe((result: { [now: string]: string }) => {
      this.now = result.now ? new Date(result.now) : new Date();
    }, () => {
      this.now = new Date();
    });
  }

  public openAbout(text?: string) {
    this.matDialog.open(AboutComponent, {
      data: text ? text : 'Made with love by nZo'
    });
  }

  public openHelp() {
    this.openAbout('The answer to any question is 42!');
  }

  public reload() {
    console.log('Reloading application state');
  }

  public clear() {
    this.guestbookService.clear();
  }
}
