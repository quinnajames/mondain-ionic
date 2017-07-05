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
    quiz = <any>[];

    addWordList(list) {
        let user = this.authProvider.getCurrentUser();
        if (user) {
            firebase.database().ref('/userProfile').child(user.uid).update({
                quiz: JSON.stringify(list)
            });
        }

    }

    // addWordList(list) {
    //     return new Promise(resolve => {
    //         this.storage.set('quiz', list).then(() => {
    //             this.events.publish('quiz:changed');
    //             resolve();
    //         });  
    //     });
    // }

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