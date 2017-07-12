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

    addWordList(list) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).update({
                quiz: JSON.stringify(list)
            });
        }

    }

    addRemoteQuizWord(alpha: string, solutions: string[], time, next_scheduled, correct: boolean) {
        let user = this.authProvider.getCurrentUser();
        time = time.toString();
        let right_answers = 1;
        let wrong_answers = 0;
        if (!correct) {
            right_answers = 0;
            wrong_answers = 1;
        }
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction(function(trans) {
                console.log(trans);
                if (trans) {
                    console.log(trans.right);
                    console.log(trans.wrong);
                    
                    if (trans.right !== null && trans.wrong !== null) { // #ZeroBeingFalsyParty
                        trans.right = trans.right + right_answers;
                        trans.wrong = trans.wrong + wrong_answers;
                    }
                    
                    trans.solutions = solutions;
                    trans.last_correct = time;
                    trans.next_scheduled = next_scheduled

                }
                return trans;
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