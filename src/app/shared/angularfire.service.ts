import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class AngularFireService {
    constructor(public db: AngularFireDatabase) { }

    getAnagrams(word) {
        let anagrams = this.db.object('/alphagrams/' + word);
        return anagrams;
    }
    
    getPerUserWordStats(word, uid) {
        let stats = this.db.object('/userProfile/' + uid + '/' + word);
        return stats;
    }
}