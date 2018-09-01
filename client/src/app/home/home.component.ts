import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';
import * as jwtDecode from 'jwt-decode';

import { User } from '../_models';
import { UserService } from '../_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    currentUser: User;
    users: User[] = [];

    constructor(
        private userService: UserService,
        private cookieService: CookieService
    ) {
        // Getting jwt from cookie
        const accessToken = this.cookieService.get('accessToken');
        // Decoding jwt token
        const decodedUser = jwtDecode(accessToken);
        decodedUser.token = accessToken;
        this.currentUser = decodedUser;
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(id: number) {
        this.userService
            .delete(id)
            .pipe(first())
            .subscribe(() => {
                this.loadAllUsers();
            });
    }

    private loadAllUsers() {
        this.userService
            .getAll()
            .pipe(first())
            .subscribe(users => {
                this.users = users;
            });
    }

    logout() {
        // remove user from cookie to log user out
        this.cookieService.remove('accessToken');
    }
}
