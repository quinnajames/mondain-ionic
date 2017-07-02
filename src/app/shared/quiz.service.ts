import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';


@Injectable()
export class QuizService {
    storage = new Storage(Storage);
    constructor(private events: Events) { }
    quiz = <any>[];

    addWordList(list) {
        return new Promise(resolve => {
            this.storage.set('quiz', list).then(() => {
                this.events.publish('quiz:changed');
                resolve();
            });
        });
    }

    getCurrentQuiz() : Promise<any> {
        return this.storage.get('quiz');
    }


}