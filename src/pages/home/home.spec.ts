import { async, TestBed } from '@angular/core/testing';
import { MyApp } from '../../app/app.component';
import { HomePage } from './home';
import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

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
let de: DebugElement;
let el: HTMLElement;


describe('Home: HomePage', () => {

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
                { provide: ErrorHandler, useClass: IonicErrorHandler }
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
        de = null;
        el = null;
    })
    it('is created', () => {
        expect(fixture).toBeTruthy();
        expect(homePageInstance).toBeTruthy();
    })

    it('should create a valid instance of HomePage', () => {
        expect(homePageInstance instanceof HomePage).toBe(true);
    });

    it('renders with Ionic toolbar title of Home', () => {

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css('ion-title'));
        el = de.nativeElement;
        expect(el.textContent).toContain('Home');
    })

    it('renders Search Results header', () => {

        fixture.detectChanges();
        
        de = fixture.debugElement.query(By.css('h1'));
        el = de.nativeElement;
        expect(el.textContent).toContain('Search Results');
    })

});

