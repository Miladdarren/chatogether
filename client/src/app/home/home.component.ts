import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';

@Component({
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(public authenticationService: AuthenticationService) {}

    ngOnInit() {}
}
