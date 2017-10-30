import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { QuizPage } from '../pages';
import { AuthProvider } from '../../app/shared/providers/auth';
import { FirebaseService, Utils } from '../../app/shared/shared';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SearchParams } from './search-params.class'

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [SearchParams]
})





export class HomePage {


  items: FirebaseListObservable<any[]>;
  displayText: String;
  inputWordLength: number;
  inputOrderBy: string;
  inputStartPos: number;
  inputListSize: number;

  searchParams: SearchParams;
  searchParamsSubject: Subject<any>;

  requery: FirebaseListObservable<any[]>;
  quizList: any[];
  userIdent: any;
  userQuizList: any;
  userQuizListSplit: string[];
  dynamicQueryList: any[];
  displayCustomList: boolean;

  
  auth$: Observable<firebase.User>;
  loggedIn: boolean;

  getAnagramList(db: AngularFireDatabase, wordLength = 7, orderBy = 'avgplay', startPos = 2000, listSize = 20, getSnapshot = false) {
    this.firebaseService.getAnagramListStatic(wordLength, orderBy, startPos, listSize);
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
    private firebaseService: FirebaseService,
    public utils: Utils) {
    // default values for display
    this.inputListSize = 25;
    this.inputWordLength = 7;
    this.inputStartPos = 1;
    this.inputOrderBy = 'avgplay';
    this.items = this.getAnagramList(db, this.inputWordLength, this.inputOrderBy, this.inputStartPos, this.inputListSize);
    this.loggedIn = false;
    this.userIdent = auth.getCurrentUserIdent();
    this.quizList = [];
    this.dynamicQueryList = [];
    this.refreshQuery();
    this.displayCustomList = false;
    this.searchParams = new SearchParams(25, 7, 1);
    this.searchParamsSubject = new Subject<SearchParams>();
    this.auth$ = this.auth.getAuthSub();
  }

  ngOnInit() {
    this.auth$.subscribe(
      auth => {
        console.log(auth);
        this.loggedIn = !!auth;
        if (auth) this.userIdent = auth.email;
        else this.userIdent = "No user";
      }
    )
    this.searchParamsSubject.subscribe(
      (v) => {
        console.log(v);
        console.log("in the subscription");
        let inputListSize = -(-v.listSize);
        if (inputListSize > 50) inputListSize = 50;
        if (inputListSize < 1 || isNaN(inputListSize)) inputListSize = 1;
        let inputStartPos = -(-v.startPos);
        let inputWordLength = -(-v.wordLength);
        this.items = this.getAnagramList(this.db, inputWordLength, this.inputOrderBy, inputStartPos, inputListSize);
        console.log(this.items);
        this.dynamicQueryList = this.firebaseService.getWordHistoryList(inputWordLength, this.inputOrderBy, inputStartPos, inputListSize);
        this.quizList = [];
        this.items.subscribe(snapshots => {
          //console.log(snapshots);
          snapshots.forEach(snapshot => {
            this.quizList.push(snapshot.$key);
            //console.log(snapshot.$key);
          });
        });
      }
    );
    this.searchParamsSubject.next(this.searchParams);
  }

  refreshLogin() {
    console.log("refreshLogin()");
    this.userIdent = this.auth.getCurrentUserIdent();
    this.loggedIn = this.auth.isLoggedIn();
    console.log(this.auth.getCurrentUserIdent());
  }

  refreshQuery() {
    this.requery = this.items;
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

  goToLogin() {
    this.navCtrl.push('LoginPage');
  }

  refreshList(inputObj?: { listSize: number, startPos: number, wordLength: number }) {
    console.log("in refreshList");
    console.log(this.searchParamsSubject)
    let inputListSize = -(-this.inputListSize);
    if (inputListSize > 50) inputListSize = 50;
    if (inputListSize < 1 || isNaN(inputListSize)) inputListSize = 1;
    this.searchParamsSubject.next(new SearchParams(inputListSize, -(-this.inputStartPos), -(-this.inputWordLength))); 
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

    console.log(this.firebaseService.addDynamicWordList(studyList));

    let user = this.auth.getCurrentUser().uid;
    let subscription = this.db.object('/userProfile/' + user);
    subscription.subscribe(subscribeData => {
      let quiz = JSON.parse(subscribeData.quiz);
      console.log("sync");
      console.log(quiz);
    });
  }

  setEmptyCustomList() {
    this.userQuizList = [];
    this.userQuizListSplit = [];
    this.displayCustomList = true;
  }

  saveUserQuizList() {
    this.userQuizListSplit = this.userQuizList.split(/\r?\n/);
    for (var x = 0; x < this.userQuizListSplit.length; x++) {
      this.userQuizListSplit[x] = this.utils.makeAlphagram(this.userQuizListSplit[x]);
    }
    this.firebaseService.addDynamicWordList(this.userQuizListSplit);
    this.setEmptyCustomList();
  }

}
