import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as _ from 'lodash';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


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

    getCurrentQuiz() {
        return this.storage.get('quiz');
    }

    getAnagrams(db: AngularFireDatabase, word) {
        return db.object('/alphagrams/' + word);
    }

}