import { Component, Input } from '@angular/core';

@Component({
    selector: 'word-history',
    template: `
    <ion-card padding *ngIf="lastQuizWord">
    <h1>Word History</h1>
    <h2>for <b>{{lastQuizAlpha.alpha}}</b>: {{lastQuizAlpha.solutionsStringRep}}</h2><br /> {{lastQuizWord.right}} of {{lastQuizWord.right
    + lastQuizWord.wrong}}<br />
    <b>Last correct: </b>
    <span *ngIf="lastQuizWord.last_correct">{{lastQuizWord.last_correct | date : 'yMMMdjms'}}</span>
    <span *ngIf="!lastQuizWord.last_correct">never</span>
    <br />
    <b>Next scheduled:</b> {{lastQuizWord.next_scheduled | date : 'yMMMdjms'}} <button ion-button (click)="reschedulePreviousWordToNow()">Set to Now</button>
  </ion-card>
    `
})
export class WordHistoryComponent{
    @Input('word') lastQuizWord:any;
    @Input('alpha') lastQuizAlpha:any;
}