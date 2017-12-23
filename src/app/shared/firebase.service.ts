import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AuthProvider } from '../../app/shared/providers/auth';
import firebase from 'firebase';
import moment from 'moment';

@Injectable()
export class FirebaseService {
    constructor(private events: Events,
        private authProvider: AuthProvider) { }

    updateStats(changes) {
        const user = this.authProvider.getCurrentUser();
        if (user) {
            let statsRef = firebase.database().ref('/stats').child(user.uid);
            statsRef.transaction((trans) => {
                console.log(trans);
                if (trans) {
                    for (let x = 2; x <= 15; x++) {
                        changes[x] += trans[x];
                    }
                    changes.total += trans.total;
                }
                return changes; // posts transaction

            },
                function onComplete(Error, committed, snapshot) {
                    if (Error) {
                        console.log("Error trying to update spaced rep stats");
                    }
                    else if (!committed) {
                        console.log("No spaced rep stats update committed")
                    }
                    else {
                        console.log("Spaced rep stats update committed");
                    }
                }, false);
        }
    }

    incrementLog(date) {
        let count = null;
        const user = this.authProvider.getCurrentUser();
        if (user) {
            let logRef = firebase.database().ref('/log').child(user.uid).child(date).child('count');
            logRef.transaction((trans) => {
                console.log(trans);
                count = trans + 1;
                return trans + 1;
            },
            function (Error, committed, snapshot) {
                if (Error) {
                    console.log("Error trying to increment study log");
                }
                else if (!committed) {
                    console.log("not committed")
                    firebase.database().ref('/log').child(user.uid).child(date).set({
                        'count': 1
                    });
                    return 1;
                }
                else {
                    console.log("successfully committed");
                }
            }, true);
        }
        return count;
    }

    getLogRefListener(date) {
        const user = this.authProvider.getCurrentUser();
        if (user) {
        return firebase.database().ref('/log').child(user.uid).child(date);
        }
        else {
            return null;
        }
    }

    getStatsRef() {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            return firebase.database().ref('/stats').child(user.uid);
        }
        else {
            return null;
        }
    }

    getLogRef() {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            return firebase.database().ref('/log').child(user.uid);
        }
        else {
            return null;
        }        
    }

    getStats(getFullData = false) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            let userProfileRef = firebase.database().ref('/userProfile').child(user.uid);
            let statsRef = firebase.database().ref('/stats').child(user.uid);

            statsRef.once('value').then((data) => {

                console.log(data.val());
                if (!data.exists() || getFullData) {

                    userProfileRef.once('value').then((fulldata) => {
                        let statsObject = {
                            total: 0,
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0,
                            6: 0,
                            7: 0,
                            8: 0,
                            9: 0,
                            10: 0,
                            11: 0,
                            12: 0,
                            13: 0,
                            14: 0,
                            15: 0
                        }
                        //console.log(data.val());                    
                        console.log("querying fulldata")
                        statsObject.total = fulldata.numChildren() - 2;
                        fulldata.forEach((childSnapshot) => {
                            if (childSnapshot.key !== "quiz" && childSnapshot.key !== "email") {
                                //console.log(childSnapshot.key + " " + (+statsObject[childSnapshot.key.length] + 1).toString());
                                statsObject[childSnapshot.key.length]++;
                            }
                        })
                        statsRef.set(statsObject);
                        console.log(statsObject);
                        return statsObject;
                    }, (Error) => console.log(Error))

                }
                else {
                    console.log(data.val());
                    console.log("NOT querying fulldata")
                    return data.val();
                }
            })
        }
        return null;
    }

    getAnagramListStatic(wordLength = 7, orderBy = 'avgplay', startPos = 1000, listSize = 10) {
        console.log("in getAnagramListStatic");
        let user = this.authProvider.getCurrentUser();
        if (user) {
            console.log("user exists");
            let ref = firebase.database().ref('/alphagram_ranks/' + wordLength);
            ref.orderByChild(orderBy).startAt(startPos).endAt(startPos + listSize - 1).once('value').then((data) => {
                console.log(data.val());
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
                let displayTag = "not studied";
                quizStatsRef.once('value').then((val) => {
                    if (val && val.val() && val.val().next_scheduled) {
                        hasHistory = true;
                        displayTag = "studied";
                    }
                    wordList.push({
                        alphagram: dataSnapshot.key,
                        rank: dataSnapshot.val().avgplay,
                        hasHistory: hasHistory,
                        displayTag: displayTag
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
        let statsObject = {
            total: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: 0,
            14: 0,
            15: 0
        }
        if (user) {
            console.log(list);
            for (let x = 0; x < list.length; x++) { // refactor out moment stuff to a separate service
                word_objects.push(this.addRemoteQuizWord(list[x], null, parseInt(moment().format('x'), 10)));
                statsObject[list[x].length]++;
                statsObject.total++;
            }
            this.updateStats(statsObject);
        };
        return word_objects;
    }

    addDynamicWordListReset(list: string[]) {
        let user = this.authProvider.getCurrentUser();
        let word_objects = [];
        let statsObject = {
            total: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: 0,
            14: 0,
            15: 0
        }
        if (user) {
            console.log(list);
            for (let x = 0; x < list.length; x++) { // refactor out moment stuff to a separate service
                word_objects.push(this.addRemoteQuizWordReset(list[x], null, parseInt(moment().format('x'), 10)));
                statsObject[list[x].length]++;
                statsObject.total++;
            }
            this.updateStats(statsObject);
        };
        return word_objects;
    }

    addRemoteQuizWordReset(alpha: string, time, next_scheduled, correct?: boolean) {
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
            right: 0,
            wrong: wrong_answers
        };
        console.log(word_object);
        if (user) {
            console.log(`Trying transaction on ${alpha}`);
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction((trans) => {
                console.log(trans);
                if (trans) {
                    let correctness = -1; // reset
                    if (trans.wrong) {
                        word_object.wrong += trans.wrong;
                    }
                    console.log(word_object.right); 
                    console.log(word_object.wrong);
                    if (trans.last_correct) {
                        word_object.last_correct = parseInt(trans.last_correct, 10);
                    }
                    if (!trans.last_correct && correct) {
                        word_object.last_correct = parseInt(moment().format('x'), 10);
                    }
                    console.log("correctness: " + correctness);
                    const MINS_IN_HALF_DAY = 720;
                    word_object.next_scheduled = parseInt(moment().add(correctness * MINS_IN_HALF_DAY + this.getRandomMinutes(correctness), 'minutes').format('x'), 10);
                }
                return word_object; // posts transaction

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
        return word_object; // returns to function caller
    }


    correctnessCalc(right, wrong) {
        const right_multiplier = 1.4;
        const wrong_multiplier = 2;
        const right_exponent = 1.7;
        const wrong_exponent = 1.5;
        let correctness = 1 + Math.floor(right_multiplier * Math.pow(right, right_exponent) -
            wrong_multiplier * Math.pow(wrong, wrong_exponent));
        if (correctness < 0) correctness = 0;
        return correctness;
    }

    getRandomMinutes(days) {
        const MINS_IN_FULL_DAY = 1440;
        const minutes_max = days * MINS_IN_FULL_DAY;
        return Math.floor(Math.random() * minutes_max);
    }

    /* Returns the time the word was rescheduled to. **/
    rescheduleWord(alpha: string, new_time) {
        let user = this.authProvider.getCurrentUser();

        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction((trans) => {
                console.log(trans);
                if (trans) {
                    let word_object = trans;
                    word_object.next_scheduled = new_time;
                    return word_object; // posts transaction
                }
            },
                // onComplete function
                function (Error, committed, snapshot) {
                    if (Error) {
                        console.log("Error trying to update word stats");
                        // return null;
                    }
                    else if (!committed) {
                        console.log("Not committed: perhaps this word isn't in the database");
                    }
                    else {
                        console.log("successfully committed");
                    }
                }, false);
        }
        return new_time;
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
            firebase.database().ref('/userProfile').child(user.uid).child(alpha).transaction((trans) => {
                console.log(trans);
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
                    correctness = this.correctnessCalc(word_object.right, word_object.wrong);
                    if (correct === false) {
                        correctness = -1;
                    }
                    if (trans.last_correct) {
                        word_object.last_correct = parseInt(trans.last_correct, 10);
                    }
                    if (!trans.last_correct && correct) {
                        word_object.last_correct = parseInt(moment().format('x'), 10);
                    }
                    console.log("correctness: " + correctness);
                    const MINS_IN_HALF_DAY = 720;
                    word_object.next_scheduled = parseInt(moment().add(correctness * MINS_IN_HALF_DAY + this.getRandomMinutes(correctness), 'minutes').format('x'), 10);
                }
                return word_object; // posts transaction

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
        return word_object; // returns to function caller
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
