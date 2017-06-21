import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
    quizList: any[];
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.quizList = JSON.parse(this.navParams.data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    // this.quizList.forEach(element => {
    //   console.log(element);
    // });
    console.log(this.quizList);
  }

}
