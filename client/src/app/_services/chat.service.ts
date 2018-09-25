import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import * as io from 'socket.io-client';
import { Message } from '../_models/message';
import { environment } from '../../environments/environment';

const BASE_URL = environment.apiUrl;

@Injectable()
export class ChatService {
    private socket: any;
    private chatUrl: string = environment.apiUrl;
    private apiUrl = `${BASE_URL}/messages`;
    private usersUrl = `${BASE_URL}/users/all`;

    constructor(private http: HttpClient) {}

    connect(username: string, callback: Function = () => {}): void {
        // initialize the connection
        this.socket = io(this.chatUrl, { path: '/chat' });

        this.socket.on('error', error => {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        });

        this.socket.on('connect', () => {
            this.sendUser(username);
            console.log('connected to the chat server');
            callback();
        });
    }

    isConnected(): boolean {
        if (this.socket != null) {
            return true;
        } else {
            return false;
        }
    }

    sendUser(username: string): void {
        this.socket.emit('username', { username: username });
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    getConversation(name1: string, name2: string): any {
        let url = this.apiUrl;
        if (name2 != 'chat-room') {
            const route = '/' + name1 + '/' + name2;
            url += route;
        }

        return this.http.get(url);
    }

    getUserList(): any {
        const url = this.usersUrl;

        return this.http.get(url);
    }

    receiveMessage(): any {
        const observable = new Observable(observer => {
            this.socket.on('message', (data: Message) => {
                observer.next(data);
            });
        });

        return observable;
    }

    receiveActiveList(): any {
        const observable = new Observable(observer => {
            this.socket.on('active', data => {
                observer.next(data);
            });
        });

        return observable;
    }

    sendMessage(message: Message, chatWith: string): void {
        this.socket.emit('message', { message: message, to: chatWith });
    }

    getActiveList(): void {
        this.socket.emit('getactive');
    }
}
