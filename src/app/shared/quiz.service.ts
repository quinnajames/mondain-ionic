import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as _ from 'lodash';


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

    // addWordList(list) {
    //     let quiz = [];
    //     return new Promise(resolve => {
    //         quiz = this.storage.get('quiz');
    //     }
    //     //     list.forEach(element => {
    //     //         this.storage.set(element.toString(), Date.now().toString());
    //         ).then(() => {
    //             this.events.publish('quiz:changed');
    //             resolve();
    //         });
    //     });
    // }

    // removeWordList(list) {
    //     return new Promise(resolve => {
    //         list.forEach(element => {
    //             this.storage.remove(element.toString());
    //         }).then(() => {
    //             this.events.publish('quiz:changed');
    //             resolve();
    //         });
    //     });
    // }

    // getWords() {
    //     return new Promise(resolve => {
    //         let results = [];
    //         this.storage.forEach(data => {
    //             let parsed = JSON.parse(data);
    //             // TODO: add time test with dueby param
    //             results.push(parsed);
    //             console.log(results);
    //         });
    //         return resolve(results);
    //     });
    // }

}