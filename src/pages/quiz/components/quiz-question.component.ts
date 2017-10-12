import { Component, Input } from '@angular/core';

@Component({
    selector: 'quiz-question',
    template: `<ion-item id="quizAnswer" class="translucent"
                *ngIf="question">
                <span [ngClass]="{'quizQuestion': question.length < 9,
                'quizNine': question.length >= 9 && question.length < 12,
                'quizTwelve': question.length >= 12}">
                {{question}}</span>
                </ion-item>`
})
export class QuizQuestionComponent {
    @Input() question:string;
    quizClass: string;
    constructor() {
        this.quizClass = 'quizQuestion';
        
    }
    addStyle() {
        if (this.question) {
            if(this.question.length >= 12) this.quizClass = 'quizTwelve';
            else if (this.question.length >= 9) this.quizClass = 'quizNine';
        }
    }
}
