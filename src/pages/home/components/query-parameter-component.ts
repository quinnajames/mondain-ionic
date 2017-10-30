import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'query-parameter',
    template: `<ion-item color="item-background" class="searchInput">
    <ion-label>Start Position</ion-label>
    <ion-input type="number" [min]="minvalue" [max]="maxvalue" [step]="stepvalue" 
    [(ngModel)]="inputvalue" (blur)="callRefreshList($event)"></ion-input>
  </ion-item>`
})
export class QueryParameterComponent{
    @Input() inputvalue:number;
    @Input() minvalue:number;
    @Input() maxvalue:number;
    @Input() stepvalue:number;
    @Output() onBlur = new EventEmitter<any>();
    callRefreshList() {
        
    }
}