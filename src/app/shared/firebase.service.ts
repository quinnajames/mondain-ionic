import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';


@Injectable()
export class FirebaseService {
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

    addRemoteQuizWord(alpha: string, solutions: string[], time, next_scheduled, correct: boolean) {
        let user = this.authProvider.getCurrentUser();
        time = time.toString();
        let right_answers = 1;
        let wrong_answers = 0;
        if (!correct) {
            right_answers = 0;
            wrong_answers = 1;
        }
        let transaction = null;
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
                transaction = trans;
            });
                if (!transaction) {
                    firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set({
                        solutions: solutions,
                        last_correct: time,
                        next_scheduled: next_scheduled,
                        right: right_answers,
                        wrong: wrong_answers
                    });
                    return {
                        solutions: solutions,
                        last_correct: time,
                        next_scheduled: next_scheduled,
                        right: right_answers,
                        wrong: wrong_answers                       
                    }
                }
                else {
                    return transaction;
                }
        }
    }

    getPerUserWordStats(word: string) {
    let user = this.authProvider.getCurrentUser();
    let stats = {
        lastCorrect: null,
        nextScheduled: null
    }
    if (user) {
        firebase.database().ref('/userProfile').child(user.uid).child(word).once('value').then(function (snapshot) {
            console.log("**snapshot**:" + snapshot);
            stats.lastCorrect = snapshot.last_correct;
            stats.nextScheduled = snapshot.next_scheduled;
            });
        return stats;
        }
    } 
        //let stats = this.db.object('/userProfile/' + uid + '/' + word);
       // return stats;


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