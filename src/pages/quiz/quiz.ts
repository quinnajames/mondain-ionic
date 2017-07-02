import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuizService } from '../../app/shared/shared';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


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
  nextWord: {
    word: String,
    solutions: FirebaseObjectObservable<any[]>;
    // nextDue
  };
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private quizService: QuizService,
    public db: AngularFireDatabase) {
  }

  refreshQuizList() {
    this.quizList = this.quizService.getCurrentQuiz();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    this.refreshQuizList();
    this.loadNextWord();

  }

  getAnagrams(word) {
    let anagrams = this.db.object('/alphagrams/' + word);
    //console.log("anagrams");
    return anagrams;
  }


  loadNextWord() {
    console.log("in loadNextWord")
    this.quizService.getCurrentQuiz().then((quiz) => {
      let nextword = quiz[0];
      //let nextword = "CDEHINS";
      let subscription = this.getAnagrams(nextword);
      subscription.subscribe(subscribeData => {
          console.log("in the subscription");
          let nextsolutions = subscribeData.solutions;
          console.log(subscribeData);
          this.nextWord = {
            word: nextword,
            solutions: nextsolutions
          };
        console.log(this.nextWord.solutions);
      })
    });
  }

}
