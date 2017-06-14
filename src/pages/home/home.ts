import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireModule,  } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  items: FirebaseListObservable<any[]>;

  constructor(public navCtrl: NavController, db: AngularFireDatabase) {
      this.items = db.list('/alphagram_ranks/6', {
        query: {
          orderByChild: 'avgplay',
          startAt: 2000,
          endAt: 2010
        }
      });
  }

}
