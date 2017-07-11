import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';


@Injectable()
export class QuizService {
    storage = new Storage(Storage);
    constructor(private events: Events,
    private authProvider: AuthProvider) { }

    addWordList(list) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).update({
                quiz: JSON.stringify(list)
            });
        }

    }

    addRemoteQuizWord(alpha: string, time, correct: boolean) {
        let user = this.authProvider.getCurrentUser();
        time = time.toString();
        let right_answers = 1;
        let wrong_answers = 0;
        if (!correct) {
            right_answers = 0;
            wrong_answers = 1;
        }
        console.log(time);
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).update({
                last_correct: time,
                right: right_answers,
                wrong: wrong_answers,
                next_scheduled: time
            });
        }
    }

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

    getRemoteQuiz() {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            return firebase.database().ref('/userProfile').child(user.uid).once('value').then(function(snapshot) {
                let quiz = JSON.parse(snapshot.val().quiz);
                console.log(snapshot);
            })
        }  
    }


}