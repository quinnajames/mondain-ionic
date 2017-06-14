import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireModule,  } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  items: FirebaseListObservable<any[]>;
  displayText: String;

  getAnagramList(db: AngularFireDatabase, wordLength = 7, orderBy = 'avgplay', startPos = 2000, listSize = 50) {
    return db.list('/alphagram_ranks/' + wordLength, {
        query: {
          orderByChild: orderBy,
          startAt: startPos,
          endAt: startPos + listSize - 1
        }
      });
  }

  constructor(public navCtrl: NavController, db: AngularFireDatabase) {
      this.items = this.getAnagramList(db);
      this.displayText = "{{item.$key}}";
  }

}
