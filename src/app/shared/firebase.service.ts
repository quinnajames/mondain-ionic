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
        let trans_object = null;
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction(function (trans) {
                console.log(trans);
                if (trans) {
                    var right = trans.right;
                    var wrong = trans.wrong;
                    if (trans.right == null) {
                        right = 0;
                    }
                    if (trans.wrong == null) {
                        wrong = 0;
                    }
                    right = trans.right + right_answers;
                    wrong = trans.wrong + wrong_answers;
                    trans_object = {
                        right: right,
                        wrong: wrong,
                        solutions: solutions,
                        last_correct: time,
                        next_scheduled: next_scheduled
                    };
                    return trans_object;
                };
            },
                function (Error, committed, snapshot) {
                    if (!committed) {
                        firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set({
                            solutions: solutions,
                            last_correct: time,
                            next_scheduled: next_scheduled,
                            right: right_answers,
                            wrong: wrong_answers
                        });
                    }
                }, false);
        }
        if (!trans_object) {
            trans_object = {
                solutions: solutions,
                last_correct: time,
                next_scheduled: next_scheduled,
                right: right_answers,
                wrong: wrong_answers
            };
        }
        return trans_object;
    }

    getPerUserWordStats(word: string) {
<<<<<<< HEAD
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
=======
    let user = this.authProvider.getCurrentUser();
    let stats = {
        lastCorrect: null,
        nextScheduled: null
    }
    if (user) {
        firebase.database().ref('/userProfile').child(user.uid).child(word).once('value').then(function (snapshot) {
            //console.log("**snapshot**:" + snapshot);
            stats.lastCorrect = snapshot.last_correct;
            stats.nextScheduled = snapshot.next_scheduled;
>>>>>>> d6254b1ad2e3159425e15a1d4b7d90444151d713
            });
            return stats;
        }
    }
    //let stats = this.db.object('/userProfile/' + uid + '/' + word);
    // return stats;


    getRemoteQuiz() {
        let user = this.authProvider.getCurrentUser();
        if (user) {
<<<<<<< HEAD
            return firebase.database().ref('/userProfile').child(user.uid).once('value').then(function (snapshot) {
                //let quiz = JSON.parse(snapshot.val().quiz);
                console.log(snapshot);
=======
            return firebase.database().ref('/userProfile').child(user.uid).once('value').then(function(snapshot) {
               // console.log(snapshot);
>>>>>>> d6254b1ad2e3159425e15a1d4b7d90444151d713
            })
        }
    }
    getWordHooks(word) {
        let hooks = {
            front: null,
            back: null
        }
        if (word) {
            firebase.database().ref('/hooks').child(word).once('value').then(function(snapshot) {
                hooks.front = snapshot.front;
                hooks.back = snapshot.back;
            });
            return hooks;
        }  
    }
}