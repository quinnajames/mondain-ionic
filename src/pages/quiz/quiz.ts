import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuizService } from '../../app/shared/shared';

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
    quizList: any;
  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   private quizService: QuizService) {

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    // this.quizList.forEach(element => {
    //   console.log(element);
    // });
    this.quizList = this.quizService.getCurrentQuiz().then( value => {
      console.log(value);
  }, reason => {
    console.log(reason);
  } );

  }

}
