import {Injectable} from "@angular/core";
import io from 'socket.io-client';
import {environment} from 'src/environments/environment';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {Messages, Session} from "../interfaces";

@Injectable({
  providedIn: "root"
})

export class SocketService {

  private socket = null
  private login: string = null
  private admin: boolean = false

  private usersCallback: Subject<Messages> = new Subject<Messages>();
  usersCallback$ = this.usersCallback.asObservable();

  private adminsCallback: Subject<Session> = new Subject<Session>();
  adminsCallback$ = this.adminsCallback.asObservable();

  constructor(private auth: AuthService,
              private router: Router) {
  }

  connect(user) {

    this.admin = user === 'admin';

    if (this.auth.isAuthenticated()) {
      this.socket = io.connect(environment.apiUrl, {
        transports: ['websocket'],
        query: {
          token: this.auth.getToken(),
          user
        }
      });
      this.socket.on('reconnect_attempt', () => {
        try {
          this.socket.io.opts.query = {
            token: this.auth.getToken(),
            user
          }
        } catch (e) {
        }
      });
      this.socket.on('connectedLogin', (data) => {
        this.login = data.login
      });

      this.socket.on('error', (error) => {
        this.unauthorized()
      });
      this.socket.on('connect', () => {
        // console.log('socket connected')
      });
      this.socket.on('messages', (data) => {
        this.loadChat(data)
      });
      this.socket.on('newMessage', (data) => {
        this.newMessage(data)
      });
      this.socket.on('sessionList', (data) => {
        this.sessionList(data)
      });
      this.socket.on('updateSessions', (data) => {
        this.updateSessions(data)
      });
      this.socket.on('disconnect', () => {
        this.socket = null
      });
    } else {
      this.unauthorized()
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect(true)
      this.socket = null
    }
  }

  unauthorized() {
    this.router.navigate(['/login'], {
      queryParams: {
        accessDenied: true
      }
    })
    this.disconnect()
  }

  loadChat(messages: Messages[]) {
    messages.forEach(message => {
      this.usersCallback.next(message);
    })
  }

  newMessage(message: Messages) {
    this.usersCallback.next(message);
  }

  emitMessage(message: string, room: string = null) {
    if (this.login && this.socket) {
      const mes: Messages = {
        login: this.login,
        text: message,
        admin: this.admin,
        room
      }
      this.socket.emit('newMessage', mes)
    }
  }

  sessionList(sessions: Session[]) {
    sessions.forEach(session => {
      this.adminsCallback.next(session);
    })
  }

  updateSessions(session: Session) {
    this.adminsCallback.next(session);
  }

  joinToRoom(id: string) {
    if (this.admin)
      this.socket.emit('joinToRoom', id)
  }

  exitFromRoom(id: string) {
    if (this.admin)
      this.socket.emit('exitFromRoom', id)
  }
}
