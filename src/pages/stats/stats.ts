import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../app/shared/shared';
import { LoadingController } from 'ionic-angular';

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
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseService: FirebaseService,
    public loading: LoadingController) {


  }

  getStats() {
    this.statsObject = this.firebaseService.getStats();
  }
  getStatsForceReload() {
    this.statsObject = this.firebaseService.getStats(true);
  }
  ionViewDidLoad() {


    //   let loader = this.loading.create({
    //     content: 'Getting statistics...',
    //   });
    //   loader.present().then(() => {
    //     this.statsObject = this.firebaseService.getStats();
    //   }).then(() => {
    //     setTimeout(() => {
    //       this.statsObjectLoaded = this.firebaseService.getStats();
    //       console.log(this.statsObjectLoaded);
    //       loader.dismiss(); }, 250);
    //     })
    // }
  }
}
