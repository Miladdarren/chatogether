import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as jwtDecode from 'jwt-decode';

import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(emailOrUsername: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, {
        emailOrUsername: emailOrUsername,
        password: password
      })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // Decoding jwt token
            const decodedUser = jwtDecode(user.token);
            decodedUser.token = user.token;

            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(decodedUser));
          }

          return user;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }
}
