import {Component, OnInit} from '@angular/core';
import {SocketService} from "../shared/services/socket.service";
import {Messages} from "../shared/interfaces";

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {

  messages: Messages[] = []
  userMessage: string = ''

  constructor(private socket: SocketService) {
  }

  ngOnInit(): void {
    this.socket.connect('user')
    this.scrollToEnd()

    this.socket.usersCallback$.subscribe(data => {
      this.messages.push(data)
      this.scrollToEnd()
    });
  }

  sendMessage() {
    if(this.userMessage !== '')
      this.socket.emitMessage(this.userMessage)
    this.userMessage = ''
  }

  scrollToEnd() {
    setTimeout(() => {
      document.getElementById('chatMessages').scrollTop = 99999
    }, 50)
  }

}

