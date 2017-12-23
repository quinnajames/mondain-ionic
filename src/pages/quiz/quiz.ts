import { Component, EventEmitter } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import * as _ from 'lodash'; // currently only using this for indexOf
import moment from 'moment';
import { Subject } from 'rxjs/Subject';
import { FirebaseService, AngularFireService } from '../../app/shared/shared';
import { AuthProvider } from '../../app/shared/providers/auth';

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
  minimal: boolean;

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
    this.minimal = true;

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

    const base = [0xC4, 0xC5, 0xDB];
    const dark = [0x6B, 0x6E, 0xA0];
    const light = [0xFD, 0xFD, 0xFD];

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

  /* getCurrentMoment is a more self-explanatory alias for
  the moment.js library's moment(). **/
  getCurrentMoment() {
    return moment();
  }

  /* getCurrentDate returns the date when called.
  Uses YY-MM-DD (eg 17-12-31)
  This is currently the preferred format for stats logging.**/
  getCurrentDate() {
    return moment().format('YY-MM-DD');
  }

  /* getCurrentUnixTimestamp returns the current Unix timestamp.
  This is most immediately useful to determine which words
  are due, but can also be used for the 'last correct' field. **/
  getCurrentUnixTimestamp(): number {
    return parseInt(moment().format('x'), 10);
  }

  /* getUnixTimestampFromMoment generates a Unix timestamp
  from a moment.js moment. Used for a rescheduling due date. **/
  getUnixTimestampFromMoment(input: moment.Moment): number {
    return parseInt(input.format('x'), 10);
  }


  /* refreshQuiz (re)sets the Firebase words-due query from a timestamp. **/
  //Current use of this function needs some attention.
  refreshQuiz(timestamp) {
    this.dueRef = this.firebaseService.getWordsDueListener(timestamp);
  }


  /* getCountPerDay determines the number of quiz questions done on
  a given day. This is used to set the log count, or retrieve a running
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

  /* setLogCount determines quiz questions done today, specifically,
  using getCountPerDay. **/
  setLogCount() {
    this.getCountPerDay(this.getCurrentDate());
  }

  /* getIteratorFromEntries initializes an iterator from the
  dynamicQuiz variable, which is a Map. It does so by calling the
  Map prototype's entries function, which uses insertion order
  (most recent? first). So, quiz entries are served in that
  order, which is originally derived from the dueRef Firebase
  query. **/
  getIteratorFromEntries() {
    if (!this.dynamicQuizIterator) {
      this.dynamicQuizIterator = this.dynamicQuiz.entries();
    }
  }

  /* setDefaultNextWord sets the next word to the 'default' value
  of the first word in the dictionary. If something goes wrong
  with retrieving the next word, this should happen rather
  than the whole app crashing. But, this ought to be accompanied
  by an error message. **/
  setDefaultNextWord() {
    this.nextWordDynamic = "AA";
  }

  /* setNextWordDynamic retrieves the next item from the
  dynamicQuizIterator. If it fails to do so, it tries
  to regenerate the dynamicQuizIterator. If the quiz
  is done, it does this regeneration 30 minutes into
  the future. When done running, it resolves a Promise,
  so that it can be chained with other functions. **/
  // 30 minutes into the future often produces no words.
  // The time could be set higher, or it could keep trying
  // until it finds at least one word due in the future.
  // Depending on the step size, that could take a while.
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

  /* startDynamicQuiz updates the dynamic quiz, and then loads the
  next word. **/
  // This function is no longer used and must be deleted.
  startDynamicQuiz() {
    console.log("startDynamicQuiz()")
    this.updateDynamicQuiz().then(() => this.loadNextWord());
  }

  /* updateDynamicQuiz creates the iterator from its entries,
  tries again if that fails, sets the next word, then
  resolves. **/
  // Needs some proper error handling, I wager.
  updateDynamicQuiz() {
    return new Promise((resolve) => {

      console.log("updateDynamicQuiz()")
      if (this.dynamicQuiz) {

        this.getIteratorFromEntries();
        let nextword = this.dynamicQuizIterator.next();
        if (nextword.done) {
          // Perhaps try to move the due date first in this case.
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

  /* Actually loads the next word for display and quizzing,
  retrieving the set of solutions against which the user
  will be quizzed. It returns a promise when the next
  word is retrieved. **/
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
            if (!nextsolutions) {
              console.log("Bugged word:" + nextQuizWord);
              nextsolutions = [];
            }
            else {
              nextsolutions.forEach((s) => {
                console.log(`${s} hooks: `);
                console.log(this.firebaseService.getWordHooks(s));
              })
            }
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

  /**updateStats is an update function, used for
      this.sessionStats.
      Percent here is an integer up to 100,
      not a decimal between 0-1. */
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


  /** rescheduleLogic determines how to reschedule an answered word.
      Takes a wasCorrect parameter, asking whether the last word was
      answered correctly. Parameter can be derived from
      this.sessionStats, but this function is uncoupled from it. */
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

  /** rescheduleWordtoNow is shorthand for calling rescheduleWord
      with the current word and the result of getting the current
      time with getCurrentUnixTimestamp.*/
  rescheduleWordToNow(alpha: string) {
    this.firebaseService.rescheduleWord(alpha, this.getCurrentUnixTimestamp());
  }

  /* updateRescheduleObj parses sessionStats to determine if the
  previous answer was correct, passing that information on to
  the rescheduleLogic function. Therefore, it should be called
  AFTER stats are updated. */
  updateRescheduleObj() {
    this.rescheduleObj = this.rescheduleLogic(this.sessionStats.recent.queue[-1] || null); // was last question correct?
  }

  //aliases


  /* handleCorrect is shorthand for calling handleCorrectOrIncorrect
  with a 'true' parameter. **/
  handleCorrect() {
    this.handleCorrectOrIncorrect(true);
  }

  /* handleIncorrect is shorthand for calling handleCorrectOrIncorrect
  with a 'false' parameter. **/
  handleIncorrect() {
    this.handleCorrectOrIncorrect(false);
  }

  /* handleCorrectOrIncorrect takes care of a variety of tasks
  that must be performed once a question has finished being
  answered. It:
  - updates the session stats,
  - progresses in the quiz,
  - updates the background changer,
  - increments the day's log,
  - updates the rescheduler,
  - updates the word's remote stats, and
  - gets solutions for the next quiz word.
  These specific tasks are all farmed out to other functions. **/
  handleCorrectOrIncorrect(lastCorrect: boolean) {
    console.log("handle correctOrIncorrect " + lastCorrect)
    this.sessionStats = this.updateStats(lastCorrect, this.sessionStats);
    this.updateDynamicQuiz();
    this.updateBackground();
    this.firebaseService.incrementLog(this.getCurrentDate());
    this.setLogCount();
    this.updateRescheduleObj; //updateRescheduleObj isn't being called,
    // but rescheduling still happens, a fact which needs attention.
    this.lastQuizWord = this.firebaseService.addRemoteQuizWord(this.nextWord.word,
      this.rescheduleObj.unixtime, this.rescheduleObj.rescheduletime, lastCorrect)
    //addRemoteQuizWord may not be the best name for this function.

    // get solutions
    this.updateLastQuizAlphaAndMoveToNext();
  }


  /** updateLastQuizAlphaAndMoveToNext makes the current word the
  previous word, and tries to load the next word. It stringifies the
  solution set for the previous word so that it can be displayed
  in the WordHistoryComponent. */
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

  /** answerOnChange is called whenever the answer changes. It
  evaluates whether the current answer is a solution, and if
  so, adds that to the user-provided solutions set and
  clears the answer box. If the user has gotten all solutions
  entered, the function marks the question correct. */
  // I don't think the toUpperCase needs to happen before
  // the word length test passes, either.
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

  /** clearsAnswer clears the answer box. */
  clearAnswer() {
    this.input.answer = "";
    this.input$.next("");
  }


   //Input handlers

    /* reschedulePreviousWordToNow reschedules a word to be due at
    the current time. This is used by the SetToNow button
    in the WordHistoryComponent. **/

    reschedulePreviousWordToNow(event: boolean) {
      console.log("in reschedulePreviousWord");
      if (this.lastQuizAlpha && this.lastQuizWord) {
        this.firebaseService.addRemoteQuizWordReset(this.lastQuizAlpha.alpha, null,
          this.getCurrentUnixTimestamp(), null);
        // I'm not sure if resetting last correct on server side is actually what I want in this case.
        // But it's at least a time-neutral thing to do.
        this.lastQuizWord.last_correct = null; // Might as well reflect what I'm sending.
        this.lastQuizWord.next_scheduled = this.getCurrentUnixTimestamp(); // Technically this is wrong --
        // next scheduled can be up to a half day previous.
        // Ultimately I should be getting correct data back from the server here,
        // but it isn't a priority because all that really matters is reflecting that I changed something
        // and that it's more or less reset the due date.
        this.lastQuizWord.right = 0; // New, cruel reset function.
      }
    }

      /* handleAnswer determines whether to call handleCorrect()
      or handleIncorrect based on a parameter.
      This is used by the buttons in the quizButtons component.**/

      handleAnswer(correct: number) {
        if (correct === 1) this.handleCorrect();
        else if (correct === 0) this.handleIncorrect();
      }

}
