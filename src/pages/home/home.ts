import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { QuizPage } from '../pages';
import { AuthProvider } from '../../providers/auth/auth';
import { LocalQuizService, FirebaseService } from '../../app/shared/shared';

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
  requery: FirebaseListObservable<any[]>;
  quizList: any[];
  userIdent: any;
  loggedIn: boolean;
  userQuizList: any;
  userQuizListSplit: string[];

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
    public db: AngularFireDatabase,
    public auth: AuthProvider,
    private localQuizService: LocalQuizService,
    private firebaseService: FirebaseService) {
    // default values for display
    this.inputListSize = 10;
    this.inputWordLength = 7;
    this.inputStartPos = 2000;

    this.items = this.getAnagramList(db, this.inputWordLength, undefined, this.inputStartPos, this.inputListSize);

    this.userIdent = auth.getCurrentUserIdent();
    this.loggedIn = auth.isLoggedIn();
    this.quizList = [];
    this.refreshQuery();
  }


  refreshLogin() {
    console.log("refreshLogin()");
    this.userIdent = this.auth.getCurrentUserIdent();
    this.loggedIn = this.auth.isLoggedIn();  
    console.log(this.auth.getCurrentUserIdent()); 
  }

  refreshQuery() {
    this.requery = this.getAnagramList(this.db, this.inputWordLength, undefined, -(-this.inputStartPos), -(-this.inputListSize), true);
    this.quizList = [];
    this.requery.subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        this.quizList.push(snapshot.key);
        console.log(snapshot.key);
      });
    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
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
    this.firebaseService.addWordList(studyList);
    this.firebaseService.addDynamicWordList(studyList);

    let user = this.auth.getCurrentUser().uid;
    let subscription = this.db.object('/userProfile/' + user);
    subscription.subscribe(subscribeData => {
      let quiz = JSON.parse(subscribeData.quiz);
      console.log("sync");
      console.log(quiz);
      this.localQuizService.addListToLocalStorage(quiz);
    });
  }

  setEmptyCustomList() {
    this.userQuizList = [];
    this.userQuizListSplit = [];
  }

  saveUserQuizList() {
     this.userQuizListSplit = this.userQuizList.split(/\r?\n/);
     for (var x = 0; x < this.userQuizListSplit.length; x++) {
       this.userQuizListSplit[x] = this.localQuizService.makeAlphagram(this.userQuizListSplit[x]);
     }
    this.firebaseService.addDynamicWordList(this.userQuizListSplit);
     this.localQuizService.addListToLocalStorage(this.userQuizListSplit);     
     this.setEmptyCustomList();
  }

}
