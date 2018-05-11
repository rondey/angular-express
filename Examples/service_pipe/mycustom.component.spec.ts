import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MycustomComponent } from './mycustom.component';

describe('MycustomComponent', () => {
  let component: MycustomComponent;
  let fixture: ComponentFixture<MycustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MycustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MycustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
