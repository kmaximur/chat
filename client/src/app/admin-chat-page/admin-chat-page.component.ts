import {Component, OnInit, ViewChild} from '@angular/core';
import {SocketService} from "../shared/services/socket.service";
import {Chat, Session} from "../shared/interfaces";
import {AdminChatWindowComponent} from "../admin-chat-window/admin-chat-window.component";
import Sortable from 'sortablejs';

@Component({
  selector: 'app-admin-chat-page',
  templateUrl: './admin-chat-page.component.html',
  styleUrls: ['./admin-chat-page.component.scss']
})
export class AdminChatPageComponent implements OnInit {
  @ViewChild(AdminChatWindowComponent) viewChild: AdminChatWindowComponent

  sessions: Session[] = []
  openedChats: Chat[] = []
  filterArgs = {
    filterText: '',
    filterActive: 'All'
  }

  constructor(private socket: SocketService) {
  }

  ngOnInit(): void {
    this.socket.connect('admin')

    this.socket.usersCallback$.subscribe(data => {
      for(let i = 0; i<this.openedChats.length; i++){
        if(this.openedChats[i].room === data.room){
          this.openedChats[i].messages.push(data)
          break
        }
      }
    });

    this.socket.adminsCallback$.subscribe(data => {
      let exist = false
      for(let i = 0; i<this.sessions.length; i++){
        if(this.sessions[i].login === data.login){
          this.sessions[i].active = data.active
          exist = true
          break
        }
      }
      if (!exist)
        this.sessions.push(data)
    })

    Sortable.create(document.getElementById('sessionsGrid'), {
      animation: 250,
      direction: 'horizontal'
    });
  }

  dataFromWindowChat(room) {
    this.socket.exitFromRoom(room)
    const idx = this.openedChats.findIndex(item => item.room === room)
    if (idx !== -1)
      this.openedChats.splice(idx, 1)
    for(let i = 0; i<this.sessions.length; i++){
      if(this.sessions[i].login === room){
        this.sessions[i].opened = false
        break
      }
    }
  }

  openChat(room) {
    for(let i = 0; i<this.sessions.length; i++){
      if(this.sessions[i].login === room){
        this.sessions[i].opened = true
        break
      }
    }
    this.openedChats.push({room, messages: []})
    this.socket.joinToRoom(room)
  }
}
