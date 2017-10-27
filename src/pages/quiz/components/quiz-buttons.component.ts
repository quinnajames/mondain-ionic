import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    'selector': 'quiz-buttons',
    'template': `<ion-card id="buttonCard" class="outer-table">
    <div class="inner-table" >
      <button ion-fab id="correctButton" class="quizButtonItem button-align"  (click)="handleClick(1)">
            <ion-icon name="checkmark"></ion-icon>
          </button>
    </div>
    <div class="inner-table">
      <button ion-fab id="incorrectButton" class="quizButtonItem button-align" (click)="handleClick(0)">
        <ion-icon name="thumbs-down"></ion-icon>
        </button>
    </div>
  </ion-card>`
})
export class QuizButtonsComponent {
    @Output() onAnswer = new EventEmitter<number>();
    handleClick(correctness:number) {
        this.onAnswer.emit(correctness);
    }
}