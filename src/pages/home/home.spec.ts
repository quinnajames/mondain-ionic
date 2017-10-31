import { DebugElement, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { IonicErrorHandler, IonicModule, NavController } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { HomePage } from './home';
import { MyApp } from '../../app/app.component';
import { AuthProvider } from '../../app/shared/providers/auth';
import { FirebaseService, Utils, AngularFireService } from '../../app/shared/shared';
import { AngularFireAuth } from 'angularfire2/auth';

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
                FirebaseService,
                AngularFireService,
                AngularFireAuth,
                StatusBar,
                SplashScreen,
                AuthProvider,
                Utils,
                { provide: ErrorHandler, useClass: IonicErrorHandler }
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePage);
        homePageInstance = fixture.componentInstance;
        homePageInstance.loggedIn = true;
    });

    afterEach(() => {
        fixture.destroy();
        homePageInstance = null;
        de = null;
        el = null;
    });

    it('is created', () => {
        expect(fixture).toBeTruthy();
        expect(homePageInstance).toBeTruthy();
    });

    it('should create a valid instance of HomePage', () => {
        expect(homePageInstance instanceof HomePage).toBe(true);
    });

    it('renders with Ionic toolbar title of Home', () => {

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css('ion-title'));
        el = de.nativeElement;
        expect(el.textContent).toContain('Home');
    });

    it('renders Search Results header', () => {

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css('h1'));
        el = de.nativeElement;
        expect(el.textContent).toContain('Search Results');
    });

    it('starts with custom study list undefined', () => {
        expect(homePageInstance.userQuizList).toBeUndefined();
    });

    it('starts showing the Enter Custom List button', () => {

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css('#enterCustomListButton'));
        el = de.nativeElement;
        expect(el.textContent).toContain('Enter Custom List');
    });
    it('starts NOT showing the Save Custom List button', () => {

        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('#saveCustomListButton'));
        expect(de).toBeNull();
    });
    it('calls setEmptyCustomList() when the Enter Custom List button is clicked', async(() => {
        spyOn(homePageInstance, 'setEmptyCustomList');
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('#enterCustomListButton'));
        de.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(homePageInstance.setEmptyCustomList).toHaveBeenCalled();
    }));

    it('stops showing the Enter Custom List button when the button is clicked', async(() => {
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('#enterCustomListButton'));
        expect(de).not.toBeNull();
        de.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(homePageInstance.displayCustomList).toBe(true);
    }));

    it('sets displayCustomList as true when setEmptyCustomList() is called', async(() => {
        homePageInstance.setEmptyCustomList();
        fixture.detectChanges();
        expect(homePageInstance.displayCustomList).toBeTruthy;
    }));

});

