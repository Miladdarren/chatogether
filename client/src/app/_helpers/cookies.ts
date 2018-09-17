import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class Cookies {
    constructor(private cookieService: CookieService) {}
    getAccessToken() {
        return this.cookieService.get('accessToken');
    }
}
