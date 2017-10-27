import { Input, Component } from '@angular/core';
@Component({
    selector: 'quiz-info',
    template: `<div class="translucent">
              <table>
              <tr>
              <td class="info-cell caption" *ngIf="log || log === 0">Today</td>
              <td class="info-cell caption" *ngIf="log || log === 0">Left</td>
              </tr>
              <tr>
                <td class="info-cell headline">
                    <span id="logCount" class="translucent" *ngIf="log || log === 0">
                    {{log}}
                    </span>
                </td>
                <td class="info-cell headline">
                    <span id="mapSize" class="translucent" *ngIf="quiz && log || log === 0">
                    {{quiz.size}}
                    </span>
                </td>
              </tr>
              </table>
              </div>`
})
export class QuizInfoComponent {
    @Input() quiz:Map<string, boolean>;
    @Input() log:number;
}
