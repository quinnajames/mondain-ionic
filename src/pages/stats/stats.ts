import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../app/shared/shared';
import { LoadingController } from 'ionic-angular';
import * as _ from 'lodash';

/**
 * Generated class for the StatsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html',
})
export class StatsPage {

  statsObject: any;
  statsObjectLoaded: any;
  wordLengths: any[];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseService: FirebaseService,
    public loading: LoadingController) {

    this.wordLengths = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }



  getStats() {
    console.log("run getStats")
    if (!this.statsObject) {
      this.firebaseService.getStatsRef().once('value').then((data) => {
        this.statsObject = data.val();
      }).then(() => { 
       console.log("ready");
       if (this.statsObject)
       {
        this.statsObjectLoaded = this.statsObject;
       }
      })
    }
    console.log("");
  }
  getStatsForceReload() {
    this.statsObject = this.firebaseService.getStats(true);
  }
  ionViewDidLoad() {

    let loader = this.loading.create({
      content: 'Getting statistics...'
    });
    loader.present().then(() => {
      
    this.getStats();
      _.debounce(this.getStats, 250);
    }).then(() => {
      loader.dismiss();
    });

  }
}
