import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { FirebaseService, AngularFireService } from '../../app/shared/shared';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import * as _ from 'lodash';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {
  quizList: Promise<any>;
  dueRef: firebase.database.Query;
  input: { // encapsulate this in input to avoid an issue with Angular scopes
    answer: string;
  }
  nextWord: {
    word: string,
    solutions: FirebaseObjectObservable<any[]>,
    solutionCount: number;
    lastCorrect: number;
    nextScheduled: number;
    // nextDue
  };
  sessionStats: {
    overall: {
      correct: number;
      incorrect: number;
      percent: number;
    }
    last10: {
      correct: number;
      incorrect: number;
      percent: number;
      queue: boolean[];
    }
  };
  quizIndex: any;
  quizLength: any;
  solutionsGiven: string[];
  dynamicQuiz: Map<string, boolean>;
  dynamicQuizIterator: any;
  nextWordDynamic: string;
  lastQuizWord: {
    right: number,
    wrong: number,
    last_correct: any,
    next_scheduled: any
  }
  lastWasCorrect: boolean // eventually to be made redundant with the stats queue
  rescheduleObj: {
    unixtime: number
    rescheduletime: number
  }
  lastQuizAlpha: {
    alpha: string,
    solutions: string[],
    solutionsStringRep: string
  }
  lastQuizWordHooks: {
    front: FirebaseObjectObservable<any[]>,
    back: FirebaseObjectObservable<any[]>
  }

  // subscriptions
  subscription: FirebaseObjectObservable<any>;
  wordStatSubscription: FirebaseObjectObservable<any>;
  hookSubscription: FirebaseObjectObservable<any>;

  constructor(
    public loading: LoadingController,
    private authProvider: AuthProvider,
    public db: AngularFireDatabase,
    public firebaseService: FirebaseService,
    public angularFireService: AngularFireService) {
    this.input = {
      answer: ""
    }
    // Initialize session variables
    this.quizIndex = 0;
    this.quizLength = 1;
    this.sessionStats = {
      overall: {
        correct: 0,
        incorrect: 0,
        percent: 0.0
      },
      last10: {
        correct: 0,
        incorrect: 0,
        percent: 0.0,
        queue: []
      }
    };
    this.lastWasCorrect = null;
    this.rescheduleObj = {
      unixtime: null,
      rescheduletime: null
    }
    this.dynamicQuiz = new Map<string, boolean>();

  }

  getCurrentMoment() {
    return moment();
  }

  getCurrentUnixTimestamp(): number {
    return parseInt(moment().format('x'), 10);
  }

  ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Getting quiz entries...',
    });
    loader.present().then(() => {
      this.dueRef = this.firebaseService.getWordsDueListener(this.getCurrentUnixTimestamp()); // sending it current time
      this.dueRef.on('child_added', (data) => { // Arrow function lets you use context
        this.onChildAdded(data);
      }, undefined, this);
      this.dueRef.on('child_changed', (data) => {
        this.onChildChanged(data);
      });
      this.dueRef.on('child_removed', (data) => {
        this.onChildRemoved(data);
      }, undefined, this);
    }).then(() => {
      this.startDynamicQuiz();
      _.debounce(() => {
        this.startDynamicQuiz;
      }, 300);
    }).then(() => {
      loader.dismiss();
    })
  }

  onChildAdded(data) {
    if (data.val().next_scheduled && !this.dynamicQuiz.has(data.key)) {
      this.dynamicQuiz.set(data.key, true);
      console.log("word became due: " + data.key);
      this.startDynamicQuiz();
    }
  }



  onChildChanged(data) {
    console.log("word info changed: " + data.key);
    if (data.child("next_scheduled")) {
      console.log(data.val().next_scheduled);
      if (data.val().next_scheduled > this.getCurrentUnixTimestamp()) {
        this.dynamicQuiz.delete(data.key);
      }
    }
  }

  onChildRemoved(data) {
    console.log("word no longer due: " + data.key);
    if (this && this.dynamicQuiz) {
      this.dynamicQuiz.delete(data.key);
    }
  }

  ionViewWillLeave() {
    this.dueRef.off();
  }


  // Component handling
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


  //Internal

  getIteratorFromEntries() {
    if (!this.dynamicQuizIterator) {
      this.dynamicQuizIterator = this.dynamicQuiz.entries();
    }
  }

  setDefaultNextWord() {
    this.nextWordDynamic = "AA";
  }

  getBackground() {
    let base = 'color-';
    if (this.sessionStats) {
      if (this.sessionStats.overall.percent) {
        let percent = Math.floor(this.sessionStats.overall.percent);
        if (percent > 95) {
          return base + '100';
        }
        else if (percent > 90) {
          return base + '95';
        }
        else if (percent > 85) {
          return base + '90';
        }
        else if (percent > 80) {
          return base + '85';
        }
        else if (percent > 70) {
          return base + '80';
        }
        else if (percent > 60) {
          return base + '70';
        }
        else if (percent > 50) {
          return base + '60';
        }
        else if (percent > 20) {
          return base + '50';
        }
      }
    }
    return base + '0';
  }

  setNextWordDynamic(nextword) {
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
          this.setDefaultNextWord();
        }
      }
      else {
        this.setDefaultNextWord();
      }
      console.log("I think this means the quiz is done");
    }
  }

  startDynamicQuiz() {
    this.updateDynamicQuiz();
    this.loadNextWord();
  }
  updateDynamicQuiz() {
    if (this.dynamicQuiz) {
      this.getIteratorFromEntries();
      let nextword = this.dynamicQuizIterator.next();
      if (nextword.done) {
        this.getIteratorFromEntries();
      }
      if (nextword) {
        this.setNextWordDynamic(nextword);
      }

      else {
        console.log("Iterator not initialized");
      }
    }
    else {
      console.log("Quiz not initialized");
    }
  }

  /** Update function, has side effects on this.sessionStats */
  updateStats(wasCorrect: boolean, ss: any) { // consider moving all these lastCorrect or whatever into a global variable

    if (wasCorrect) { ss.overall.correct += 1; } else { ss.overall.incorrect += 1; }
    ss.overall.percent = Math.round(ss.overall.correct / (ss.overall.correct + ss.overall.incorrect) * 100);
    // todo: optimize last10 algorithms after first run
    ss.last10.queue.push(wasCorrect);
    if (ss.last10.queue.length > 10) { ss.last10.queue.shift() };
    ss.last10.correct = ss.last10.incorrect = 0;
    ss.last10.queue.forEach(el => {
      if (el === true) { ss.last10.correct += 1; } else { ss.last10.incorrect += 1; }
    })
    ss.last10.percent = Math.round(ss.last10.correct / (ss.last10.correct + ss.last10.incorrect) * 100);
    this.sessionStats = ss;
    this.lastWasCorrect = ss.last10.queue[-1] || null;
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



  updateRescheduleObj() {
    this.rescheduleObj = this.rescheduleLogic(this.lastWasCorrect);
  }

  handleCorrectOrIncorrect(lastCorrect: boolean) {
    this.updateStats(lastCorrect, this.sessionStats);
    this.updateDynamicQuiz();
    this.updateRescheduleObj;
    this.lastQuizWord = this.firebaseService.addRemoteQuizWord(this.nextWord.word,
      this.rescheduleObj.unixtime, this.rescheduleObj.rescheduletime, lastCorrect)

    // get solutions
    this.subscription.subscribe(subscribeData => {
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
      if (this.quizIndex < this.quizLength - 1) {
        this.quizIndex++;
        try { this.loadNextWord() }
        catch (Exception) { console.log(Exception) };
      }
      else {
        //console.log("Quiz done - looping back.");
        this.jumpToIndexAndLoad(0);
      }
    })
  }

  loadNextWord() {
    this.solutionsGiven = [];
    let nextQuizWord;
    if (this.nextWordDynamic) {
      nextQuizWord = this.nextWordDynamic;
    }
    else {
      nextQuizWord = "AA";
    }
    this.subscription = this.angularFireService.getAnagrams(nextQuizWord);
    this.subscription.subscribe(subscribeData => {
      let nextsolutions = subscribeData.solutions;
      this.nextWord = {
        word: nextQuizWord,
        solutions: nextsolutions,
        solutionCount: nextsolutions.length,
        lastCorrect: null,
        nextScheduled: null
      };
    })
  }


  //aliases

  handleCorrect() {
    this.handleCorrectOrIncorrect(true);
  }

  handleIncorrect() {
    this.handleCorrectOrIncorrect(false);
  }

  jumpToIndexAndLoad(index) {
    this.quizIndex = index;
    try { this.loadNextWord() }
    catch (Exception) { console.log(Exception) };
  }

  answerOnChange(answer) {
    let localanswer = answer.toUpperCase();
    if (localanswer.length == this.nextWord.word.length // No need to look at array if length is wrong
      && _.indexOf(this.nextWord.solutions, localanswer) > -1
      && _.indexOf(this.solutionsGiven, localanswer) == -1) {
      this.solutionsGiven.push(localanswer);
      this.input.answer = ""; // Reset global answer
    }
    if (this.nextWord.solutionCount == this.solutionsGiven.length) {
      this.handleCorrect();
    }
  }

}
