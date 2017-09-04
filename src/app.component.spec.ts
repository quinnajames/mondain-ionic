import { async, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AuthProvider } from './providers/auth/auth';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app/app.component';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage, LoginPage, SignupPage, QuizPage } from './pages/pages';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { LocalQuizService, FirebaseService, AngularFireService } from './app/shared/shared';

describe('MyApp', () => {
    let fixture;
    let component;
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
            declarations: [MyApp],
            imports: [
                BrowserModule,
                IonicModule.forRoot(MyApp),
                AngularFireModule.initializeApp(firebaseConfig),
                AngularFireDatabaseModule,
                IonicStorageModule.forRoot()
            ],
            providers: [

                LocalQuizService,
                FirebaseService,
                AngularFireService,
                StatusBar,
                SplashScreen,
                AuthProvider,
                {provide: ErrorHandler, useClass: IonicErrorHandler}
            ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        component = fixture.componentInstance;
    });

    it('should create a valid instance of MyApp', () => {
        expect(component instanceof MyApp).toBe(true);
    });
});

