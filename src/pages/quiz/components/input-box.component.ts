import { Input, Component, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/subject';

@Component({
    selector: 'input-box',
    template: `
    <ion-item class="translucent">
      <input id="quizInput" type="text" [(ngModel)]="answer" (ngModelChange)="answerOnChange($event)" />
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
    answerOnChange(newval) {
        this.answer = newval;
        this.answerChanger.emit(newval);
    }
    ngOnDestroy() {
        this.inputSubject.unsubscribe();
    }

}