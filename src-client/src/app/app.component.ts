import {
  Component, OnChanges, OnInit, DoCheck, AfterContentInit,
  AfterContentChecked, AfterViewInit, AfterViewChecked, SimpleChanges
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnChanges, OnInit, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked {
  public now: string;

  constructor(client: HttpClient) {
    client.get('/api/time/now').subscribe((result: {[now: string]: string}) => {
      this.now = result.now;
    });
  }

  ngAfterViewChecked(): void {
    console.log(`ngAfterViewChecked AppComponent`);
  }

  ngAfterViewInit(): void {
    console.log(`ngAfterViewInit AppComponent`);
  }

  ngAfterContentChecked(): void {
    console.log(`ngAfterContentChecked AppComponent`);
  }

  ngAfterContentInit(): void {
    console.log(`ngAfterContentInit AppComponent`);
  }

  ngDoCheck(): void {
    console.log(`ngDoCheck AppComponent`);
  }

  ngOnInit(): void {
    console.log(`ngOnInit AppComponent`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`ngOnChanges AppComponent`);
  }
}
