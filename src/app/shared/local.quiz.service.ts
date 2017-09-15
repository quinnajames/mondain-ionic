import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';


@Injectable()
export class LocalQuizService {
    constructor(private events: Events,
    private authProvider: AuthProvider,
    private storage: Storage) { }

    addListToLocalStorage(list) {
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

    makeAlphagram(word) { // this function should not be here. perhaps separate utils, or a shared Word type with this method attached to it
        word = word.toUpperCase().split("").sort().join("");
        return word;
    }


}