import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { MyApp } from './app.component';
import { HomePage, LoginPage, QuizPage, SignupPage, StatsPage } from '../pages/pages';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';

import { LocalQuizService, FirebaseService, AngularFireService, Utils } from '../app/shared/shared';

import { firebaseConfig } from './firebase.config';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    QuizPage,
    SignupPage,
    StatsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    QuizPage,
    SignupPage,
    StatsPage
  ],
  providers: [
    LocalQuizService,
    FirebaseService,
    AngularFireService,
    StatusBar,
    SplashScreen,
    AuthProvider,
    Utils,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
