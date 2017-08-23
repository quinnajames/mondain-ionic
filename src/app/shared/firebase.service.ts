import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import moment from 'moment';

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
        var right_answers = 1;
        var wrong_answers = 0;
        if (!correct) {
            right_answers = 0;
            wrong_answers = 1;
        }
        var word_object = {
            last_correct: time,
            next_scheduled: next_scheduled,
            solutions: solutions,
            right: right_answers,
            wrong: wrong_answers
        };
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction(function (trans) {
                console.log(trans);
                function removeSolutions(obj) {
                    delete obj.solutions;
                    return obj;
                }
                if (trans) {
                    if (trans.right) {
                        word_object.right += trans.right;
                    }
                    if (trans.wrong) {
                        word_object.wrong += trans.wrong;
                    }
                    if (trans.next_scheduled) {
                        if (correct) { // regular moment() parse is ms (x in format); moment.unix() parse is s (X in format)
                            // the moment() function for unix accepts ints, which is what we're working with
                            word_object.next_scheduled = parseInt(moment(trans.next_scheduled).add('1', 'days').format('x'), 10); // push forward next scheduled time by 1 day
                        }
                        else {
                            if (trans.last_correct) {
                                word_object.last_correct = parseInt(trans.last_correct, 10);
                            }
                            word_object.next_scheduled = parseInt(moment().add('1', 'minutes').format('x'), 10); // move back to 1 minute after now
                        }
                    }
                }
                delete word_object.solutions; // don't need this in the transaction if solutions are already present; they won't change
                console.log("word_object to return: ")
                console.log(removeSolutions(word_object));
                return removeSolutions(word_object); // returns TO THE DB (if transaction)
            },
                function (Error, committed, snapshot) {
                    if (Error) {
                        console.log("Error trying to update word stats");
                        // return null;
                    }
                    else if (!committed) {
                        firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set(word_object);
                        // firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set({
                        //     solutions: solutions, // have to add the solutions if creating for first time/using set
                        //     last_correct: time,
                        //     next_scheduled: next_scheduled,
                        //     right: right_answers,
                        //     wrong: wrong_answers
                        // });
                    }
                    else {
                        console.log("successfully committed");
                    }
                }, false);
        }
        return word_object; // returns TO FUNCTION CALLER to get data back
    }

    getPerUserWordStats(word: string) {
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
            });
            return stats;
        }
    }
    //let stats = this.db.object('/userProfile/' + uid + '/' + word);
    // return stats;


    getRemoteQuiz() {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            return firebase.database().ref('/userProfile').child(user.uid).once('value').then(function (snapshot) {
                //let quiz = JSON.parse(snapshot.val().quiz);
                console.log(snapshot);
            })
        }
    }
    getWordHooks(word) {
        let hooks = {
            front: null,
            back: null
        }
        if (word) {
            firebase.database().ref('/hooks').child(word).once('value').then(function (snapshot) {
                hooks.front = snapshot.front;
                hooks.back = snapshot.back;
            });
            return hooks;
        }
    }
}