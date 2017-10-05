import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class AngularFireService {
    constructor(public db: AngularFireDatabase) { }

    getAnagrams(word) : FirebaseObjectObservable<any[]> {
        return this.db.object('/alphagrams/' + word);
    }

    getHooks(word) : FirebaseObjectObservable<any[]> {
        return this.db.object('/hooks/' + word);
    }
}
