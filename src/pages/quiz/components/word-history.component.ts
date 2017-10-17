import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'word-history',
    template: `
    <ion-card padding *ngIf="lastQuizWord">
    <h1>Word History</h1>
    <h2>for {{lastQuizAlpha.alpha}}: <span class="solutions">{{lastQuizAlpha.solutionsStringRep}}</span></h2><br /> {{lastQuizWord.right}} of {{lastQuizWord.right
    + lastQuizWord.wrong}}<br />
    <b>Last correct: </b>
    <span *ngIf="lastQuizWord.last_correct">{{lastQuizWord.last_correct | date : 'yMMMdjms'}}</span>
    <span *ngIf="!lastQuizWord.last_correct">never</span>
    <br />
    <b>Next scheduled:</b> {{lastQuizWord.next_scheduled | date : 'yMMMdjms'}} <button ion-button (click)="reschedulePreviousWordToNow(true)">
    Set to Now</button>
  </ion-card>
    `
})
export class WordHistoryComponent{
    @Input('word') lastQuizWord:any;
    @Input('alpha') lastQuizAlpha:any;

    @Output() onReschedule = new EventEmitter<boolean>();
    rescheduled = false;
    reschedulePreviousWordToNow(rescheduled:boolean) {
        this.onReschedule.emit(rescheduled);
        this.rescheduled = true;
    }
}