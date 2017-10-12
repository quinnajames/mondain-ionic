import { Input, Component } from '@angular/core';
@Component({
    selector: 'quiz-info',
    template: `<div class="translucent">
              <h1><span id="mapSize" class="translucent" *ngIf="quiz">
              {{quiz.size}}
              </span>
              /
              <span id="logCount" class="translucent" *ngIf="log">
              {{log}}
              </span>
              
              </h1>
              </div><div class="translucent">
              remaining / today
              </div>`
})
export class QuizInfoComponent {
    @Input() quiz:Map<string, boolean>;
    @Input() log:number;
}