import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'login-bar',
    template: `  <ion-item color="lightgrey" class="login-bar">
    <span class="login-item">
        Logged in as: {{userIdent}}</span>
    <span class="login-item"><button ion-button *ngIf="!loggedIn" (click)="refreshLogin()">Login</button></span>
  </ion-item>`
})
export class LoginBarComponent {
    @Input() userIdent:string;
    @Input() loggedIn:boolean;
    @Output() clickLogin = new EventEmitter();
    refreshLogin() {
        this.clickLogin.emit();
    }
}