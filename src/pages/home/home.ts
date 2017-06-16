import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireModule,  } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { QuizPage } from '../pages';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  items: FirebaseListObservable<any[]>;
  displayText: String;
  inputWordLength: number;
  inputOrderBy: String;
  inputStartPos: number;
  inputListSize: number;
  db: AngularFireDatabase;
  requery: FirebaseListObservable<any[]>;

  getAnagramList(db: AngularFireDatabase, wordLength = 7, orderBy = 'avgplay', startPos = 2000, listSize = 20, getSnapshot = false) {
    return db.list('/alphagram_ranks/' + wordLength, {
        query: {
          orderByChild: orderBy,
          startAt: startPos,
          endAt: startPos + listSize - 1
        },
        preserveSnapshot: getSnapshot
      });
  }

  constructor(public navCtrl: NavController, db: AngularFireDatabase) {
      // default values for display
      this.inputListSize = 10;
      this.inputWordLength = 7;
      this.inputStartPos = 2000;

      this.items = this.getAnagramList(db, this.inputWordLength, undefined, this.inputStartPos, this.inputListSize);
      // //console.log(this.items);
      // this.items.subscribe(snapshots => {
      //   snapshots.forEach(snapshot => {
      //     console.log(snapshot.key);
      //     console.log(snapshot.val());
      //   })
      // })
      this.db = db;
      // this.displayText = "{{item.$key}} {{item.$value.avgplay}}";
  }
  refreshList() {
      let inputListSize = -(-this.inputListSize); // coerce to a number so the calc inside function works
      //console.log(2000 + inputListSize - 1);
      let inputStartPos = -(-this.inputStartPos);
      this.items = this.getAnagramList(this.db, this.inputWordLength, undefined, inputStartPos, inputListSize);
  }

  goToQuiz() {
    this.requery = this.getAnagramList(this.db, this.inputWordLength, undefined, -(-this.inputListSize), -(-this.inputStartPos), true);
    this.navCtrl.push(QuizPage);
  }

}
