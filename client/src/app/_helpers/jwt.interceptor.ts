import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { Cookies } from '../_helpers/cookies';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private cookies: Cookies) {}
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        const accessToken = this.cookies.getAccessToken();
        if (accessToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `${accessToken}`
                }
            });
        }

        return next.handle(request);
    }
}
