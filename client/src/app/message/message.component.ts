import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

import { AuthenticationService } from '../_services/authentication.service';
import { Message } from '../_models/message';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
    @Input()
    message: Message;
    time: string;
    fadeTime: boolean;
    user: any;

    constructor(private authenticationService: AuthenticationService) {}

    ngOnInit() {
        setTimeout(() => {
            this.updateFromNow();
            this.fadeTime = true;
        }, 2000);
        setInterval(() => {
            this.updateFromNow();
        }, 60000);

        this.user = this.authenticationService.getUserData();
    }

    updateFromNow(): void {
        this.time = moment(this.message.created).fromNow();
    }
}
