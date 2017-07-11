import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuizService } from '../../app/shared/shared';
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
  input: { // encapsulate this in input to avoid an issue with Angular scopes
    answer: string;
  }
  nextWord: {
    word: string,
    solutions: FirebaseObjectObservable<any[]>,
    solutionCount: Number;
    // nextDue
  };
  quizIndex: any;
  quizLength: any;
  solutionsGiven: string[];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private quizService: QuizService,
    private authProvider: AuthProvider,
    public db: AngularFireDatabase) {
    this.input = {
      answer: ""
    }
    this.quizIndex = 0;
  }

  refreshQuizList() {
    this.quizList = this.quizService.getCurrentQuiz().then((ql) => {
      this.quizLength = ql.length;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    this.getCurrentUserQuiz();
    this.refreshQuizList();
    this.loadNextWord();


  }

  getAnagrams(word) {
    let anagrams = this.db.object('/alphagrams/' + word);
    return anagrams;
  }

  getCurrentUserQuiz() {
    let user = this.authProvider.getCurrentUser().uid;
    let subscription = this.db.object('/userProfile/' + user);
    subscription.subscribe(subscribeData => {
      let quiz = JSON.parse(subscribeData.quiz);
      console.log(quiz);
      this.quizList = quiz;
    });
  }


  loadNextWord() {
    this.solutionsGiven = [];
    console.log("in loadNextWord")
    this.quizService.getCurrentQuiz().then((quiz) => {
      let nextword = quiz[this.quizIndex];
      let subscription = this.getAnagrams(nextword);
      subscription.subscribe(subscribeData => {
        console.log("in the subscription");
        let nextsolutions = subscribeData.solutions;
        console.log(subscribeData);
        this.nextWord = {
          word: nextword,
          solutions: nextsolutions,
          solutionCount: nextsolutions.length
        };
        console.log("nextWord.word:" + this.nextWord.word);
        console.log("nextWord.solutions" + this.nextWord.solutions);
      })
    });
  }

  // reschedule(time)

  handleCorrect() {
    console.log("Send the following to server:");
    console.log("Correct: +1");
    let unixtime = moment();
    console.log("Date/time last correct moved to: " + unixtime.format('x'));
    console.log("Which will be displayed as: " + unixtime.format());
    let reschedule = moment().add('1', 'days');
    console.log("Correct reschedules to: " + reschedule.format());
    this.quizService.addRemoteQuizWord(this.nextWord.word, reschedule.format('x'), true)
    if (this.quizIndex < this.quizLength - 1) {
      this.quizIndex++;
      try { this.loadNextWord() }
      catch (Exception) { console.log(Exception) };
    }
    else {
      console.log("Quiz done.")
    }
  }

  handleIncorrect() {
    console.log("Send the following to server:");
    console.log("Incorrect: +1");
    let unixtime = moment();
    console.log("Date/time last correct moved to: " + unixtime.format('x'));
    console.log("Which will be displayed as: " + unixtime.format());
    let reschedule = moment().add('1', 'minutes');
    console.log("Incorrect reschedules to: " + reschedule.format());
    this.quizService.addRemoteQuizWord(this.nextWord.word, reschedule.format('x'), false)
    if (this.quizIndex < this.quizLength - 1) {
      this.quizIndex++;
      try { this.loadNextWord() }
      catch (Exception) { console.log(Exception) };
    }
    else {
      console.log("Quiz done.")
    }  
  }


  answerOnChange(answer) {

    //console.log("this.input.answer start: " + this.input.answer);
    //console.log("**calling answerOnChange()");
    let localanswer = answer.toUpperCase();
    if (localanswer.length == this.nextWord.word.length // No need to look at array if length is wrong
      && _.indexOf(this.nextWord.solutions, localanswer) > -1
      && _.indexOf(this.solutionsGiven, localanswer) == -1) {
      this.solutionsGiven.push(localanswer);
      this.input.answer = ""; // Reset global answer
    }
    console.log(this.solutionsGiven);
    if (this.nextWord.solutionCount == this.solutionsGiven.length) {
      console.log("answered all")
      this.handleCorrect();

    }
    //console.log("this.input.answer end: " + this.input.answer);
  }

}
