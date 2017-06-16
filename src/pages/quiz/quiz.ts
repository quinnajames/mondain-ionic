import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database';

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
    items: FirebaseListObservable<any[]>;
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    //this.items = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
    console.log(this.items);
  }

}
