import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FileUploadModule } from 'ng2-file-upload';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent } from './_directives';
import { AuthGuard } from './_guards';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import {
    AlertService,
    AuthenticationService,
    UserService,
    ChatService
} from './_services';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { CookieModule } from 'ngx-cookie';
import { NavbarComponent } from './navbar';
import { ProfileComponent } from './profile';
import { RefreshComponent } from './refresh/refresh.component';
import { ChatRoomComponent } from './chat-room';
import { ActiveListComponent } from './active-list';
import { MessageComponent } from './message';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        CookieModule.forRoot(),
        FileUploadModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        NavbarComponent,
        ProfileComponent,
        RefreshComponent,
        ChatRoomComponent,
        ActiveListComponent,
        MessageComponent
    ],
    providers: [
        AuthGuard,
        AlertService,
        AuthenticationService,
        UserService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        ChatService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
