import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireModule, } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { QuizPage } from '../pages';
import { AuthProvider } from '../../providers/auth/auth';
import { QuizService } from '../../app/shared/shared';

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
  quizList: any[];
  userIdent: any;
  loggedIn: boolean;


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

  constructor(public navCtrl: NavController,
    db: AngularFireDatabase,
    auth: AuthProvider,
    private quizService: QuizService) {
    // default values for display
    this.inputListSize = 10;
    this.inputWordLength = 7;
    this.inputStartPos = 2000;

    this.items = this.getAnagramList(db, this.inputWordLength, undefined, this.inputStartPos, this.inputListSize);

    this.db = db;
    this.userIdent = auth.getCurrentUserIdent();
    this.loggedIn = auth.isLoggedIn();
    this.quizList = [];
    this.refreshQuery();
  }


  refreshQuery() {
    this.requery = this.getAnagramList(this.db, this.inputWordLength, undefined, -(-this.inputStartPos), -(-this.inputListSize), true);
    this.requery.subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        this.quizList.push(snapshot.key);
        console.log(snapshot.key);
      });
    });
  }




  refreshList() {
    let inputListSize = -(-this.inputListSize); // coerce to a number so the calc inside function works
    let inputStartPos = -(-this.inputStartPos);
    this.items = this.getAnagramList(this.db, this.inputWordLength, undefined, inputStartPos, inputListSize);
    this.refreshQuery();
  }

  goToQuiz() {
    this.navCtrl.push(QuizPage, this.quizList);
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  addToStudyList() {
    console.log(this.quizList);
    let studyList = [];
    this.quizList.forEach(element => {
      studyList.push(element);
      console.log(element);
    });
    this.quizService.addWordList(studyList);
  }

}
