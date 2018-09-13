import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {
    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {}

    login(emailOrUsername: string, password: string) {
        return this.http
            .post<any>(`${environment.apiUrl}/auth/login`, {
                emailOrUsername: emailOrUsername,
                password: password
            })
            .pipe(
                map(user => {
                    return user;
                })
            );
    }

    loggedIn(): boolean {
        if (this.cookieService.get('accessToken')) {
            // logged in so return true
            return true;
        }
    }

    logout() {
        // remove user from cookie to log user out
        this.cookieService.remove('accessToken');
    }
}
