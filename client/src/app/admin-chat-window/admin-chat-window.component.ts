import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Chat} from "../shared/interfaces";
import {SocketService} from "../shared/services/socket.service";
import {InteractService} from "../shared/services/interact.service";

@Component({
  selector: 'app-admin-chat-window',
  templateUrl: './admin-chat-window.component.html',
  styleUrls: ['./admin-chat-window.component.scss']
})
export class AdminChatWindowComponent implements OnInit {

  @Input() chat: Chat;
  @Output() dataChanged: EventEmitter<any> = new EventEmitter<any>()

  userMessage: string = ''

  constructor(private socket: SocketService,
              private el: ElementRef,
              private interact: InteractService) {
  }


  ngOnInit(): void {
    this.scrollToEnd()

    this.socket.usersCallback$.subscribe(data => {
      if (data.room === this.chat.room)
        this.scrollToEnd()
    });

    this.interact.draggable(this.el.nativeElement.firstChild)
  }

  sendToParent() {
    this.dataChanged.emit(this.chat.room)
  }

  sendMessage() {
    if(this.userMessage !== '')
      this.socket.emitMessage(this.userMessage, this.chat.room)
    this.userMessage = ''
  }

  scrollToEnd() {
    setTimeout(() => {
      document.getElementById('chatMessages').scrollTop = 99999
    }, 50)

  }
}
