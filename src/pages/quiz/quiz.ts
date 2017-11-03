import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { FirebaseService, AngularFireService } from '../../app/shared/shared';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthProvider } from '../../app/shared/providers/auth';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import moment from 'moment';
import { EventEmitter } from '@angular/core';


@IonicPage()
@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {

  /** Page variables */
  input: {
    answer: string;
  }
  pageBackground: string;
  loader: any;

  /** Stats variables */
  logCount: number;
  sessionStats: {
    overall: {
      correct: number;
      incorrect: number;
      percent: number;
    }
    recent: {
      correct: number;
      incorrect: number;
      percent: number;
      queue: boolean[];
    }
  };

  /** Quiz related variables */
  quizList: Promise<any>;
  dynamicQuiz: Map<string, boolean>;
  dynamicQuizIterator: any;
  quizDone: boolean;

  /** Rescheduling related variables */
  rescheduleObj: {
    unixtime: number
    rescheduletime: number
  }
  rescheduleMoment: moment.Moment;

  /** Solutions related variables */
  nextWord: {
    word: string,
    solutions: FirebaseObjectObservable<any[]>,
    solutionCount: number;
    lastCorrect: number;
    nextScheduled: number;
  };
  solutionsGiven: string[];

  /** Word related variables */
  nextWordDynamic: string;

  lastQuizWord: {
    right: number,
    wrong: number,
    last_correct: any,
    next_scheduled: any
  }
  lastQuizAlpha: {
    alpha: string,
    solutions: string[],
    solutionsStringRep: string
  }

  /** Firebase references */
  dueRef: firebase.database.Query;

  /** Rx subscriptions */
  wordStat$: FirebaseObjectObservable<any>;
  anagram$: FirebaseObjectObservable<any>;

  /** Rx subjects */
  input$: Subject<any>;
  childAdded$: Subject<any>;

  constructor(
    public loading: LoadingController,
    private authProvider: AuthProvider,
    public db: AngularFireDatabase,
    public firebaseService: FirebaseService,
    public angularFireService: AngularFireService) {
    this.input = {
      answer: ""
    }
    /** Initialize session variables */


   // Page
    this.pageBackground = '#c4c5db';

    // Stats
    this.sessionStats = {
      overall: {
        correct: 0,
        incorrect: 0,
        percent: 0.0
      },
      recent: {
        correct: 0,
        incorrect: 0,
        percent: 0.0,
        queue: []
      }
    };

    // Rescheduling

    this.rescheduleMoment = moment();
    this.rescheduleObj = {
      unixtime: null,
      rescheduletime: null
    }

    // Quiz
    this.dynamicQuiz = new Map<string, boolean>();

    // Rx
    this.input$ = new Subject();

  }

  /*Ionic 3 life-cycle hooks **/


  /* ionViewDidLoad fires when the page is created.
      If the page is cached, it won't fire again.
      I put the loader and Firebase quiz setup here. **/
  ionViewDidLoad() {
    this.loader = this.loading.create({
      content: 'Getting quiz entries...',
      duration: 10000,
      dismissOnPageChange: true
    });
    this.loader.present().then(() => {
      this.childAdded$ = new Subject();
      this.dueRef = this.firebaseService.getWordsDueListener(this.getCurrentUnixTimestamp());
      this.dueRef.on('child_added', (data) => {
        this.onChildAdded(data);
      }, undefined, this);
      this.dueRef.on('child_changed', (data) => {
        this.onChildChanged(data);
      });
      this.dueRef.on('child_removed', (data) => {
        this.onChildRemoved(data);
      }, undefined, this);
    }).then(() => {
      let done$ = this.childAdded$.debounceTime(500);
      done$.subscribe(() => {
        this.updateDynamicQuiz().then(() => this.loadNextWord().then(() => this.loader.dismiss()));
        }
      )
    })
  }

  /* ionViewWillLeave fires when the page is about to leave.
      So I don't need to know which words are due anymore. **/
  ionViewWillLeave() {
      this.dueRef.off();
  }

  /* dueRef reaction functions **/

  /* onChildAdded fires whenever a new child is added in the
      dueRef query. On the initial run of the query, this
      function also runs for each child actually retrieved.
      I send the results of this function to the childAdded$
      subscription to be passed on to the page quiz. **/
  onChildAdded(data) {
    if (data.val().next_scheduled && !this.dynamicQuiz.has(data.key)) {
      this.dynamicQuiz.set(data.key, true);
      console.log("word became due: " + data.key);
      this.childAdded$.next(data.key);
    }
  }


  /* onChildChanged runs whenever the data at a child
      location changes. **/
  onChildChanged(data) {
    console.log("word info changed: " + data.key);
    if (data.child("next_scheduled")) {
      console.log(data.val().next_scheduled);
      if (data.val().next_scheduled > this.getCurrentUnixTimestamp()) {
        this.dynamicQuiz.delete(data.key);
      }
    }
  }

  /* onChildRemoved runs whenever the data at a child
      location is removed. In the case of the dueRef query,
      a word no longer being due should trigger this. **/
  onChildRemoved(data) {
    console.log("word no longer due: " + data.key);
    if (this && this.dynamicQuiz) {
      this.dynamicQuiz.delete(data.key);
    }
  }



  /* Page functions **/

  /* updateBackground uses sessionStats to calculate what
      color the page's background should be.
      It does this by interpolating between the 'base'
      color, and either 'dark' or 'light' colors,
      depending on how far away recent stats are
      from a baseline of 80 percent. **/
  updateBackground() {
    const percent = this.sessionStats.recent.percent;

    let base = [0xC4, 0xC5, 0xDB];
    let dark = [0x6B, 0x6E, 0xA0];
    let light = [0xFD, 0xFD, 0xFD];

    function adjustHex(diffMultiplier, changeArr, i) {
      return Math.floor(((changeArr[i] - base[i]) * diff / diffMultiplier) + base[i]);
    }

    let hex = base;
    let diff = percent - 80;
    if (diff > 0.1) {
      for (let x = 0; x < 3; x++) {
        hex[x] = adjustHex(20, light, x);
      }
    }
    else if (diff < 0.1) {
      for (let x = 0; x < 3; x++) {
        hex[x] = adjustHex(-80, dark, x);
      }
    }
    console.log(hex);
    this.pageBackground = '#' + hex.map((c) => c.toString(16)).join("");

  }

  /* A more self-explanatory alias for the moment.js
      library's moment(). **/
  getCurrentMoment() {
    return moment();
  }

  /* Returns the date when called.
      Uses YY-MM-DD (eg 17-12-31)
      This is currently the preferred format for stats logging.**/
  getCurrentDate() {
    return moment().format('YY-MM-DD');
  }

  /* Returns the current Unix timestamp.
      This is most immediately useful to determine which words
      are due, but can also be used for the 'last correct' field. **/
  getCurrentUnixTimestamp(): number {
    return parseInt(moment().format('x'), 10);
  }

  /* Generates a Unix timestamp from a moment.js moment.
      This could be used for a rescheduling due date. **/
  getUnixTimestampFromMoment(input: moment.Moment): number {
    return parseInt(input.format('x'), 10);
  }


  /* (Re)sets the Firebase words-due listener from a timestamp. **/
  //Current use of this function needs some attention.
  refreshQuiz(timestamp) {
    this.dueRef = this.firebaseService.getWordsDueListener(timestamp);
  }


  /* Determine the number of quiz questions done on a given day.
      This can be used to set the log count, or retrieve a running
      cont of questions done for display on the page.**/
  // Some attention needs to go to the question of whether this
  // function will ever be called with a date other than the
  // current date.
  getCountPerDay(date) {
    const user = this.authProvider.getCurrentUser();
    if (user) {
      let logRef = this.firebaseService.getLogRefListener(date);
      logRef.once('value').then((data) => {
        console.log(data.val());
        this.logCount = data.val().count;
      })
    }
    else {
      return null;
    }
  }

  /* Determine quiz questions done today, specifically. **/
  setLogCount() {
    this.getCountPerDay(this.getCurrentDate());
  }


  reschedulePreviousWordToNow(event: boolean) {
    console.log("in reschedulePreviousWord");
    if (this.lastQuizAlpha && this.lastQuizWord) {
      this.lastQuizWord.next_scheduled = this.rescheduleWordToNow(this.lastQuizAlpha.alpha);
    }
  }

  handleAnswer(correct: number) {
    if (correct === 1) this.handleCorrect();
    else if (correct === 0) this.handleIncorrect();
  }

  getIteratorFromEntries() {
    if (!this.dynamicQuizIterator) {
      this.dynamicQuizIterator = this.dynamicQuiz.entries();
    }
  }

  setDefaultNextWord() {
    this.nextWordDynamic = "AA";
  }

  setNextWordDynamic(nextword) {
    return new Promise((resolve) => {

      console.log("setNextWordDynamic()")
      while (nextword && nextword.value && !nextword.value[1] && !nextword.done) { // skip over FALSE-set elements in map
        console.log(`${nextword.value[0]} is due: ${nextword.value[1]}`)
        nextword = this.dynamicQuizIterator.next();
      }
      if (!nextword.done) {
        this.nextWordDynamic = nextword.value[0];
        console.log(`${nextword.value[0]} is due: ${nextword.value[1]}`)
      }
      else {
        this.dynamicQuizIterator = this.dynamicQuiz.entries();
        if (this.dynamicQuiz.size > 0) {
          nextword = this.dynamicQuizIterator.next();
          if (nextword.value[1]) {
            this.nextWordDynamic = nextword.value[0];
          }
          else {
            console.log(`${nextword.value[0]} is due: ${nextword.value[1]}`);
            if (this.dynamicQuiz.size === 0) {
              this.quizDone = true;
              this.dynamicQuiz = new Map<string, boolean>()
              this.rescheduleMoment = this.rescheduleMoment.add('30', 'minutes');
              this.refreshQuiz(this.getUnixTimestampFromMoment(this.rescheduleMoment));
            }
          }
        }
        else {
          if (this.dynamicQuiz.size === 0) {
            this.quizDone = true;
            this.dynamicQuiz = new Map<string, boolean>()
            this.rescheduleMoment = this.rescheduleMoment.add('30', 'minutes');
            this.refreshQuiz(this.getUnixTimestampFromMoment(this.rescheduleMoment));
          }
        }
      }
      resolve(true);
    })
  }

  startDynamicQuiz() {
    console.log("startDynamicQuiz()")
    this.updateDynamicQuiz();
    this.loadNextWord();
  }

  updateDynamicQuiz() {
    return new Promise((resolve) => {

      console.log("updateDynamicQuiz()")
      if (this.dynamicQuiz) {

        this.getIteratorFromEntries();
        let nextword = this.dynamicQuizIterator.next();
        if (nextword.done) {
          this.getIteratorFromEntries();
        }
        if (nextword) {
          this.setNextWordDynamic(nextword).then(() => resolve(true));
        }
        else {
          console.log("Iterator not initialized");
          resolve(true);
        }
      }
      else {
        console.log("Quiz not initialized");
        resolve(true);
      }
    });
  }

  loadNextWord() {
    return new Promise((resolve) => {

      console.log("loadNextWord()")
      this.solutionsGiven = [];
      let nextQuizWord;
      if (this.nextWordDynamic) {
        nextQuizWord = this.nextWordDynamic;
      }
      else {
        nextQuizWord = "AA";
      }
      this.anagram$ = this.angularFireService.getAnagrams(nextQuizWord);
      this.anagram$.subscribe(subscribeData => {
        let nextsolutions = subscribeData.solutions;
        this.nextWord = {
          word: nextQuizWord,
          solutions: nextsolutions,
          solutionCount: nextsolutions.length,
          lastCorrect: null,
          nextScheduled: null
        };
        resolve(true);
      })
    })
  }

  /** Update function, used for this.sessionStats. */
  /** Note that percent is an integer up to 100. */
  updateStats(wasCorrect: boolean, ss: any) { // note that I can't use 'this.sessionStats.recent.queue[-1] || null' here
    if (wasCorrect) { ss.overall.correct += 1; } else { ss.overall.incorrect += 1; }
    ss.overall.percent = Math.round(ss.overall.correct / (ss.overall.correct + ss.overall.incorrect) * 100);
    // todo: optimize recent algorithms after first run
    ss.recent.queue.push(wasCorrect);
    if (ss.recent.queue.length > 30) { ss.recent.queue.shift() };
    ss.recent.correct = ss.recent.incorrect = 0;
    ss.recent.queue.forEach(el => {
      if (el === true) { ss.recent.correct += 1; } else { ss.recent.incorrect += 1; }
    })
    ss.recent.percent = Math.round(ss.recent.correct / (ss.recent.correct + ss.recent.incorrect) * 100);
    return ss;
  }


  rescheduleLogic(wasCorrect: boolean): any {
    if (wasCorrect) { console.log("Correct: +1") } else { console.log("Incorrect: +1") };
    let wordMoment = this.getCurrentMoment();
    let unixtime = this.getCurrentUnixTimestamp();
    let rescheduleMoment;
    if (wasCorrect) {
      rescheduleMoment = wordMoment.add('1', 'days');
    }
    else {
      rescheduleMoment = wordMoment.add('1', 'minutes');
    }
    let rescheduletime = parseInt(rescheduleMoment.format('x'), 10);
    return {
      unixtime: unixtime,
      rescheduletime: rescheduletime
    }
  }

  rescheduleWordToNow(alpha: string) {
    this.firebaseService.rescheduleWord(alpha, this.getCurrentUnixTimestamp());
  }

  /* Post refactoring, can only be called AFTER stats are updated. */
  updateRescheduleObj() {
    this.rescheduleObj = this.rescheduleLogic(this.sessionStats.recent.queue[-1] || null); // was last question correct?
  }

  //aliases

  handleCorrect() {
    this.handleCorrectOrIncorrect(true);
  }

  handleIncorrect() {
    this.handleCorrectOrIncorrect(false);
  }

  handleCorrectOrIncorrect(lastCorrect: boolean) {
    console.log("handle correctOrIncorrect " + lastCorrect)
    this.sessionStats = this.updateStats(lastCorrect, this.sessionStats);
    this.updateDynamicQuiz();
    this.updateBackground();
    this.firebaseService.incrementLog(this.getCurrentDate());
    this.setLogCount();
    this.updateRescheduleObj;
    this.lastQuizWord = this.firebaseService.addRemoteQuizWord(this.nextWord.word,
      this.rescheduleObj.unixtime, this.rescheduleObj.rescheduletime, lastCorrect)

    // get solutions
    this.updateLastQuizAlphaAndMoveToNext();
  }

  updateLastQuizAlphaAndMoveToNext() {
    this.anagram$.subscribe(subscribeData => {
      let solutionString = "";
      for (var x = 0; x < subscribeData.solutions.length; x++) {
        solutionString = solutionString += subscribeData.solutions[x] + " ";
      }
      solutionString = solutionString.slice()
      console.log(subscribeData.solutions);
      console.log(solutionString);
      this.lastQuizAlpha = {
        alpha: this.nextWord.word,
        solutions: subscribeData.solutions,
        solutionsStringRep: solutionString
      };
      try { this.loadNextWord() }
      catch (Exception) { console.log(Exception) };
    })
  }

  answerOnChange(answer) {
    console.log("parent answer: " + this.input.answer);
    let localanswer = answer.toUpperCase();
    if (localanswer.length == this.nextWord.word.length // No need to look at array if length is wrong
      && _.indexOf(this.nextWord.solutions, localanswer) > -1
      && _.indexOf(this.solutionsGiven, localanswer) == -1) {
      console.log("solution given: " + this.input.answer);
      this.solutionsGiven.push(localanswer);
      this.clearAnswer(); // Reset global answer
    }
    if (this.nextWord.solutionCount == this.solutionsGiven.length) {
      this.handleCorrect();
    }
  }

  clearAnswer() {
    this.input.answer = "";
    this.input$.next("");
  }

}
