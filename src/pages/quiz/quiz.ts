import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { LocalQuizService, FirebaseService, AngularFireService } from '../../app/shared/shared';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import * as _ from 'lodash';
import moment from 'moment';

/**
 * Generated class for the QuizPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {
  quizList: Promise<any>;
  quizListRef: firebase.database.Reference;
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
  lastQuizWordHooks: {
    front: FirebaseObjectObservable<any[]>,
    back: FirebaseObjectObservable<any[]>
  }

  // subscriptions
  subscription: FirebaseObjectObservable<any>;
  wordStatSubscription: FirebaseObjectObservable<any>;
  hookSubscription: FirebaseObjectObservable<any>;

  constructor(
    private LocalQuizService: LocalQuizService,
    private authProvider: AuthProvider,
    public db: AngularFireDatabase,
    public firebaseService: FirebaseService,
    public angularFireService: AngularFireService) {
    this.input = {
      answer: ""
    }
    // Initialize session variables
    this.quizIndex = 0;
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
    this.dynamicQuiz = new Map<string, boolean>();
    this.getCurrentUserQuiz();
    this.refreshQuizList();
    this.loadNextWord();

  }


  // wordAdded(alpha: string) {
  //   console.log("word became due: " + alpha);
  //   this.firebaseService.addQuizItem(alpha);
  // }
  // wordChanged(alpha: string) {
  //   console.log("word info changed: " + alpha);
  // }
  // wordRemoved(alpha: string) {
  //   console.log("word no longer due: " + alpha);
  // }


  refreshQuizList() {
    this.quizList = this.LocalQuizService.getCurrentQuiz().then((ql) => {
      this.quizLength = ql.length;
    });
  }



  ionViewDidLoad() {
    this.dueRef = this.firebaseService.getWordsDueListener(parseInt(moment().format('x'), 10)); // sending it current time
    this.dueRef.on('child_added', (data) => { // Arrow function lets you use context
      this.onChildAdded(data);
    }, undefined, this);
    this.dueRef.on('child_changed', (data) => {
      this.onChildRemoved(data);
    });
    this.dueRef.on('child_removed', (data) => {
      this.onChildRemoved(data);
    }, undefined, this);
  }

  onChildAdded(data) {
    if (data.val().next_scheduled && !this.dynamicQuiz.has(data.key)) {
      this.dynamicQuiz.set(data.key, true);
      console.log("word became due: " + data.key);
    }    
  }

  onChildChanged(data) {
    console.log("word info changed: " + data.key);
  }

  onChildRemoved(data) {
    console.log("word no longer due: " + data.key);
    if (this && this.dynamicQuiz) {
      this.dynamicQuiz.delete(data.key);
    }    
  }

  ionViewWillLeave() {
    this.dueRef.off();
    //    this.quizListRef.off();
  }

  updateStats(wasCorrect: boolean, ss: any) { // consider moving all these lastCorrect or whatever into a global variable

    if (wasCorrect) { ss.overall.correct += 1; } else { ss.overall.incorrect += 1; }
    ss.overall.percent = Math.round(ss.overall.correct / (ss.overall.correct + ss.overall.incorrect) * 100);
    // todo: optimize last10 algorithms after first run
    ss.last10.queue.push(wasCorrect);
    if (ss.last10.queue.length > 10) { ss.last10.queue.shift() };
    //console.log("last10 queue: " + ss.last10.queue);
    ss.last10.correct = ss.last10.incorrect = 0;
    ss.last10.queue.forEach(el => {
      if (el === true) { ss.last10.correct += 1; } else { ss.last10.incorrect += 1; }
    })
    ss.last10.percent = Math.round(ss.last10.correct / (ss.last10.correct + ss.last10.incorrect) * 100);

    if (this.lastQuizAlpha)
      {

        console.log(this.dynamicQuiz.get(this.lastQuizAlpha.alpha));
        
      }
    console.log("Map size: " + this.dynamicQuiz.size);
    return ss;

  }


  handleCorrectOrIncorrect(lastCorrect: boolean) {
    this.sessionStats = this.updateStats(lastCorrect, this.sessionStats);
    let rescheduleObj = this.rescheduleLogic(lastCorrect);
    this.subscription.subscribe(subscribeData => {
      this.lastQuizWord = this.firebaseService.addRemoteQuizWord(this.nextWord.word, subscribeData.solutions,
        rescheduleObj.unixtime, rescheduleObj.rescheduletime, lastCorrect)
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

  getCurrentUserQuiz() {
    let user = this.authProvider.getCurrentUser().uid;
    let subscription = this.db.object('/userProfile/' + user);
    subscription.subscribe(subscribeData => {
      let quiz = JSON.parse(subscribeData.quiz);
      //console.log(quiz);
      this.quizList = quiz;
    });
  }


  loadNextWord() {
    this.solutionsGiven = [];
    //console.log("in loadNextWord")
    if (this.lastQuizWord) {
      //console.log("**lastQuizWord.right:" + this.lastQuizWord.right);
      //console.log("**lastQuizWord.wrong:" + this.lastQuizWord.wrong);
      //console.log("**lastQuizWord.lastCorrect:" + this.lastQuizWord.last_correct);
      //console.log("**lastQuizWord.nextScheduled:" + this.lastQuizWord.next_scheduled);
    }
    else {
      //console.log("No lastQuizWord - perhaps this is the start of the quiz");
    }
    this.LocalQuizService.getCurrentQuiz().then((quiz) => {
      let nextQuizWord = quiz[this.quizIndex];
      // let lastCorrect = null;
      // let nextScheduled = null;
      this.subscription = this.angularFireService.getAnagrams(nextQuizWord);
      this.subscription.subscribe(subscribeData => {
        //console.log("in the getAnagrams subscription");

        let nextsolutions = subscribeData.solutions;
        //console.log(subscribeData);
        this.nextWord = {
          word: nextQuizWord,
          solutions: nextsolutions,
          solutionCount: nextsolutions.length,
          lastCorrect: null,
          nextScheduled: null
        };
        console.log("nextWord.word:" + this.nextWord.word);
        //console.log("nextWord.solutions" + this.nextWord.solutions);
      })
      if (this.nextWord) {
        //console.log("nextWord.lastCorrect:" + this.nextWord.lastCorrect);
        //console.log("nextWord.nextScheduled:" + this.nextWord.nextScheduled);
      }
    });


    //console.log("Session stats:")
    //console.log("Overall correct:" + this.sessionStats.overall.correct);
    //console.log("Overall incorrect:" + this.sessionStats.overall.incorrect);
    //console.log("Overall % right" + this.sessionStats.overall.percent);
    //console.log("Last 10 correct:" + this.sessionStats.last10.correct);
    //console.log("Last 10 incorrect:" + this.sessionStats.last10.incorrect);
    //console.log("Last 10 % right" + this.sessionStats.last10.percent);

  }

  // reschedule(time)



  rescheduleLogic(wasCorrect: boolean): any {
    //console.log("Send the following to server:");
    if (wasCorrect) { console.log("Correct: +1") } else { console.log("Incorrect: +1") };
    let wordMoment = moment();
    let unixtime = parseInt(wordMoment.format('x'), 10);
    //console.log("Date/time last correct moved to: " + unixtime);
    //console.log("Which is equivalent to: " + wordMoment.format());
    let rescheduleMoment = moment();
    if (wasCorrect) {
      rescheduleMoment = wordMoment.add('1', 'days');
    }
    else {
      rescheduleMoment = wordMoment.add('1', 'minutes');
    }
    let rescheduletime = parseInt(rescheduleMoment.format('x'), 10);
    //console.log("Reschedules to: " + rescheduletime);
    //console.log("Which is equivalent to " + rescheduleMoment.format());
    return {
      unixtime: unixtime,
      rescheduletime: rescheduletime
    }
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
    //console.log(this.solutionsGiven);
    if (this.nextWord.solutionCount == this.solutionsGiven.length) {
      // console.log("answered all")
      this.handleCorrect();

    }
    //console.log("this.input.answer end: " + this.input.answer);
  }

}
