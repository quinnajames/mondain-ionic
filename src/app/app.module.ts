import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { MyApp } from './app.component';
import { HomePage, LoginPage, QuizPage, SignupPage } from '../pages/pages';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AuthProvider } from '../providers/auth/auth';

import { QuizService } from '../app/shared/shared';

export const firebaseConfig = {
    apiKey: "AIzaSyCGOb45VB012KLxfvhr8yHBapEvw4iyEC8",
    authDomain: "mondain-db.firebaseapp.com",
    databaseURL: "https://mondain-db.firebaseio.com",
    projectId: "mondain-db",
    storageBucket: "mondain-db.appspot.com",
    messagingSenderId: "436243055966"
};


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    QuizPage,
    SignupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    QuizPage,
    SignupPage
  ],
  providers: [
    QuizService,
    StatusBar,
    SplashScreen,
    AuthProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
