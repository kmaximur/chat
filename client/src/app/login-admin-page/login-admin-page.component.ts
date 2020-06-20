import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {AuthService} from "../shared/services/auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-login-admin-page',
  templateUrl: './login-admin-page.component.html',
  styleUrls: ['./login-admin-page.component.scss']
})
export class LoginAdminPageComponent implements OnInit,OnDestroy {

  form: FormGroup
  aSub: Subscription

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      login: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5)])
    })

    this.route.queryParams.subscribe((params: Params) => {
      if (params['accessDenied']) {
        MaterialService.toast('Для начала авторизуйтесь в системе')
      } else if (params['sessionFailed']) {
        MaterialService.toast('Пожалуйста войдите в систему снова')
      }
    })

  }

  onSubmit() {
    this.form.disable()
    this.aSub = this.auth.loginAdmin(this.form.value).subscribe(
      () => this.router.navigate(['/adminchat']),
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

  ngOnDestroy(): void {
    if (this.aSub)
      this.aSub.unsubscribe()
  }

}
