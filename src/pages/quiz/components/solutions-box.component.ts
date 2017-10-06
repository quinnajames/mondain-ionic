import { Input, Component } from '@angular/core';

@Component({
    selector: 'solutions-box',
    template: `
    <ion-item id="solutionsGivenItem" *ngIf="solutions">
    <span *ngFor="let item of solutions" class="solution">
      {{item}}
    </span>
  </ion-item>`
})
export class SolutionsBoxComponent {
    @Input() solutions:string[];
}