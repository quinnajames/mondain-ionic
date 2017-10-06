import { Component, Input } from '@angular/core';

@Component({
    selector: 'quiz-question',
    template: `<ion-item id="quizAnswer" class="text quizQuestion translucent" *ngIf="question">
                {{ question }}
                </ion-item>`
})
export class QuizQuestionComponent {
    @Input() question:string;
}