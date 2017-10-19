import { Component, Input } from '@angular/core';

@Component({
    selector: 'log',
    template: `
    
  <ion-card *ngIf="statsObjectLoaded">
  <ion-list>
    <ion-item color="success">
      <ion-row>
      <ion-col col-sm-2 col-md-3 col-lg-4>Date</ion-col>
      <ion-col>Done</ion-col>
    </ion-row>
    </ion-item>

    <ion-item *ngFor="let item of logObject">
      
        <ion-row class="item">
      <ion-col col-sm-2 col-md-3 col-lg-4>
        {{item.date}}
      </ion-col>
      <ion-col>
        {{item.count}}
      </ion-col>
    </ion-row>
    </ion-item>
  </ion-list>
</ion-card>

    `
})
export class LogComponent{
    @Input('logObject') logObject:any;
}