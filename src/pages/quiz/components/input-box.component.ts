import { Input, Component, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/subject';

@Component({
    selector: 'input-box',
    template: `
    <ion-item class="translucent">
      <input id="quizInput" type="text" [(ngModel)]="answer" 
      (ngModelChange)="answerOnChange($event)" (keyup.enter)="onEnter($event)" />
    </ion-item>`
})
export class InputBoxComponent {
    @Input() answer:string;
    @Input() inputSubject:Subject<any>;
    ngOnInit() {
        this.inputSubject.subscribe(event => {
            this.answer = "";
        })
    }
    @Output() answerChanger = new EventEmitter();
    @Output() isBlankEnter = new EventEmitter();
    answerOnChange(newval) {
        this.answer = newval;
        this.answerChanger.emit(newval);
    }
    onEnter(val) {
        console.log("enter")
        console.log(this.answer)
        if (this.answer === "")
        {
            
        console.log("strict equality")
            this.isBlankEnter.emit();
        }
    }
    ngOnDestroy() {
        this.inputSubject.unsubscribe();
    }

}