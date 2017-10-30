import { Component, Input } from '@angular/core';

@Component({
    selector: 'log',
    template: `
    
  <ion-card *ngIf="logArray">
  <ion-list>
    <ion-item color="success">
      <ion-row>
      <ion-col col-sm-2 col-md-3 col-lg-4>Date</ion-col>
      <ion-col>Done</ion-col>
    </ion-row>
    </ion-item>

    <ion-item *ngFor="let item of logArray">
      
        <ion-row class="item">
      <ion-col col-sm-2 col-md-3 col-lg-4>
        {{item[0]}}
      </ion-col>
      <ion-col>
        {{item[1]}}
      </ion-col>
    </ion-row>
    </ion-item>
  </ion-list>
</ion-card>

    `
})
export class LogComponent{
    @Input('logArray') logArray:any;
}