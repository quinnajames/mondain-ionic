import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class AngularFireService {
    constructor(public db: AngularFireDatabase) { }

    getAnagrams(word) : FirebaseObjectObservable<any[]> {
        let anagrams = this.db.object('/alphagrams/' + word);
        return anagrams;
    }

    getHooks(word) {
        let hooks = this.db.object('/hooks/' + word);
        return hooks;
    }
}