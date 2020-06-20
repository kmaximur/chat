import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.scss']
})
export class SiteLayoutComponent implements OnInit {

  constructor(private auth: AuthService,
              private router: Router,
              private socket: SocketService) {
  }

  ngOnInit(): void {
  }

  logOut() {
    this.auth.logout()
    this.socket.disconnect()
    this.router.navigate(['/login'])
  }

}
