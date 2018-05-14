import { Component, OnInit } from '@angular/core';
import { GuestbookService } from './guestbook.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'sign',
    templateUrl: './sign.component.html',
    styleUrls: ['./sign.component.html']
})
export class SignComponent implements OnInit {
    public signForm: FormGroup;
    public commentMaxLength = 250;
    public commentMinLength = 0;

    public nameMaxLength = 30;
    public nameMinLength = 3;

    constructor(private guestbookService: GuestbookService) {

    }

    ngOnInit(): void {
        this.signForm = new FormGroup({
            'name': new FormControl('', [
                Validators.required,
                Validators.minLength(this.nameMinLength),
                Validators.maxLength(this.nameMaxLength)
            ]),
            'comment': new FormControl('', [
                Validators.minLength(this.commentMinLength),
                Validators.maxLength(this.commentMaxLength)
            ])
        });
    }

    public sendSign() {
        this.guestbookService.sign({
            date: new Date().valueOf(),
            message: this.signForm.controls['comment'].value,
            sign: this.signForm.controls['name'].value
        });
    }
}
