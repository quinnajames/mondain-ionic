import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import moment from 'moment';

@Injectable()
export class FirebaseService {
    constructor(private events: Events,
        private authProvider: AuthProvider) { }

    getAnagramListStatic(wordLength = 7, orderBy = 'avgplay', startPos = 1000, listSize = 10) {
        console.log("in getAnagramListStatic");
        let user = this.authProvider.getCurrentUser();
        if (user) {
            console.log("user exists");
            let ref = firebase.database().ref('/alphagram_ranks/' + wordLength);
            ref.orderByChild(orderBy).startAt(startPos).endAt(startPos + listSize - 1).once('value').then((data) => {
                console.log(data);
            }, (Error) => { console.log(Error); });
        }
    }

    getWordHistoryList(wordLength = 7, orderBy = 'avgplay', startPos = 1000, listSize = 10) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            let wordList = [];
            console.log("user exists");
            let ref = firebase.database().ref('/alphagram_ranks/' + wordLength).orderByChild(orderBy).startAt(startPos).endAt(startPos + listSize - 1);
            ref.on('child_added', (dataSnapshot) => { // I do child_added so it calls once per child
                let quizStatsRef = firebase.database().ref('/userProfile').child(user.uid).child(dataSnapshot.key);
                let hasHistory = false;
                quizStatsRef.once('value').then((val) => {
                    if (val && val.val() && val.val().next_scheduled) {
                        hasHistory = true;
                    }
                    wordList.push({
                        alphagram: dataSnapshot.key,
                        rank: dataSnapshot.val().avgplay,
                        hasHistory: hasHistory
                    })
                }, (Error) => { console.log(Error); })

            }, (Error) => { console.log(Error); });
            return wordList;
        }
        return null;
    }

    addWordList(list) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).update({
                quiz: JSON.stringify(list)
            });
        }
    }

    addDynamicWordList(list: string[]) {
        let user = this.authProvider.getCurrentUser();
        let word_objects = [];
        if (user) {
            console.log(list);
            for (let x = 0; x < list.length; x++) { // refactor out moment stuff to a separate service
                word_objects.push(this.addRemoteQuizWord(list[x], null, parseInt(moment().format('x'), 10)));
            }
        };
        return word_objects;
    }


    addRemoteQuizWord(alpha: string, time, next_scheduled, correct?: boolean) {
        let user = this.authProvider.getCurrentUser();
        let right_answers = 0;
        let wrong_answers = 0;
        if (correct === true) {
            right_answers = 1;
        }
        if (correct === false) {
            wrong_answers = 1;
        }
        // null is neither so stays at 0
        var word_object = {
            last_correct: time,
            next_scheduled: next_scheduled,
            right: right_answers,
            wrong: wrong_answers
        };
        console.log(word_object);
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction(function (trans) {
                // Transaction callback
                console.log(trans);
                const right_multiplier = 1.4;
                const wrong_multiplier = 2;
                const right_exponent = 1.7;
                const wrong_exponent = 1.5;
                if (trans) {
                    let correctness = 0;
                    if (trans.right) {
                        word_object.right += trans.right;
                    }
                    if (trans.wrong) {
                        word_object.wrong += trans.wrong;
                    }
                    console.log(word_object.right);
                    console.log(word_object.wrong);
                    correctness = Math.floor(right_multiplier * Math.pow(word_object.right, right_exponent) -
                        wrong_multiplier * Math.pow(word_object.wrong, wrong_exponent));
                    if (correctness < 0) correctness = 0;
                    if (correct === false) {
                        correctness = -1;
                    }
                    if (trans.last_correct) {
                        word_object.last_correct = parseInt(trans.last_correct, 10);
                    }
                    console.log("correctness: " + correctness);
                    word_object.next_scheduled = parseInt(moment().add(correctness, 'days').format('x'), 10);
                }
                return word_object;

            },
                // onComplete function
                function (Error, committed, snapshot) {
                    if (Error) {
                        console.log("Error trying to update word stats");
                        // return null;
                    }
                    else if (!committed) {
                        firebase.database().ref('/userProfile/' + user.uid + '/' + alpha).set(word_object);
                        console.log(word_object);
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

    getWordHooks(word) {
        // to use
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
