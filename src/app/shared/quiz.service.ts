import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';


@Injectable()
export class QuizService {
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


}