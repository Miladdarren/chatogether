import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../_services';
// import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    constructor(
        public authenticationService: AuthenticationService,
        // private chatService: ChatService
        private router: Router
    ) {}

    ngOnInit() {}

    onLogoutClick(): boolean {
        // this.chatService.disconnect();
        this.authenticationService.logout();
        this.router.navigate(['/login']);
        return false;
    }
}
