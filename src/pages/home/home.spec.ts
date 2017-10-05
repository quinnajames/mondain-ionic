import { async, TestBed } from '@angular/core/testing';
import { MyApp } from '../../app/app.component';
import { HomePage } from './home';
import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { IonicErrorHandler, IonicModule } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { IonicStorageModule } from '@ionic/storage';
import { QuizPage } from '../pages';
import { AuthProvider } from '../../providers/auth/auth';
import { LocalQuizService, FirebaseService, Utils } from '../../app/shared/shared';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { AngularFireService } from '../../app/shared/shared';

import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp } from 'ionic-angular';

describe('Home: HomePage', () => {
    let fixture;
    let homePageInstance;
    const firebaseConfig = {
        apiKey: "foo",
        authDomain: "mondain-db.firebaseapp.com",
        databaseURL: "https://mondain-db.firebaseio.com",
        projectId: "mondain-db",
        storageBucket: "mondain-db.appspot.com",
        messagingSenderId: "1"
    };
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp, HomePage],
            imports: [
                BrowserModule,
                IonicModule.forRoot(MyApp),
                AngularFireModule.initializeApp(firebaseConfig),
                AngularFireDatabaseModule,
                IonicStorageModule.forRoot()
            ],
            providers: [
                NavController,
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
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePage);
        homePageInstance = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        homePageInstance = null;
    })

    it('should create a valid instance of HomePage', () => {
        expect( homePageInstance instanceof HomePage).toBe(true);
    });

});

