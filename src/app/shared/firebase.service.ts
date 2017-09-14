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
                    let correctness = 0;
                    if (trans.right) {
                        word_object.right += trans.right;
                    }
                    if (trans.wrong) {
                        word_object.wrong += trans.wrong;
                    }
                    correctness = word_object.right - word_object.wrong;
                    //if (correctness < 0) correctness = 0;
                    if (!correct) {
                        correctness = -1;
                    }
                    if (trans.last_correct) {
                        word_object.last_correct = parseInt(trans.last_correct, 10);
                    }
                    console.log("correctness: " + correctness);
                    word_object.next_scheduled = parseInt(moment().add(correctness, 'days').format('x'), 10);
                }
                if (trans && trans.solutions) {
                    return removeSolutions(word_object);
                }
                else {
                    return word_object;
                }
            },
                function (Error, committed, snapshot) {
                    if (Error) {
                        console.log("Error trying to update word stats");
                        // return null;
                    }
                    else if (!committed) {
                        firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set(word_object);
                    }
                    else {
                        console.log("successfully committed");
                    }
                }, false);
        }
        return word_object; // returns TO FUNCTION CALLER to get data back
    }

    /** Expects a number that is a unix timestamp. */
    getWordsDueListener(deadline: number): firebase.database.Query {
        const user = this.authProvider.getCurrentUser();
        if (user) {
            return firebase.database().ref('/userProfile').child(user.uid).orderByChild("next_scheduled").endAt(deadline);
        }
        return null;
    }


    // addQuizItem(alphagram: string) {

    //     let user = this.authProvider.getCurrentUser();
    //     if (user) {
    //         let userRef = firebase.database().ref('/userProfile').child(user.uid).child("dynamicQuiz");

    //         userRef.transaction(function (currentQuiz) {
    //             if (currentQuiz === null) {
    //                 return JSON.stringify([alphagram]);
    //             }
    //             else {
    //                 let list = <string[]>JSON.parse(currentQuiz);
    //                 if (list.indexOf(alphagram) === -1) {
    //                     list.push(alphagram);
    //                 }
    //                 return JSON.stringify(list);
    //             }
    //         })
    //     }
    // }

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
