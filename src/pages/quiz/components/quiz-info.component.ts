import { Input, Component } from '@angular/core';
@Component({
    selector: 'quiz-info',
    template: `<div class="inner-table translucent">
              <h1><span id="mapSize" class="translucent" *ngIf="quiz">
              {{quiz.size}}
              </span></h1>
              remaining
              </div>`
})
export class QuizInfoComponent {
    @Input() quiz:Map<string, boolean>;
    
}