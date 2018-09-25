import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { ProfileComponent } from './profile';
import { RefreshComponent } from './refresh';
import { ChatRoomComponent } from './chat-room';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    {
        path: 'chat',
        canActivate: [AuthGuard],
        children: [
            { path: ':chatWith', component: ChatRoomComponent },
            { path: '**', redirectTo: '/chat/chat-room', pathMatch: 'full' }
        ]
    },

    // Just for refresh purpose
    { path: 'refresh', component: RefreshComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
