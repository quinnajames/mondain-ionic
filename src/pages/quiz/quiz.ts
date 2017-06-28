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
  quizList: Promise<any>;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private quizService: QuizService) {
  }

  refreshQuizList() {
    this.quizList = this.quizService.getCurrentQuiz();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    this.refreshQuizList();
    
  }

}
