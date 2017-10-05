import { async, TestBed, inject } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AuthProvider } from '../providers/auth/auth';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { ErrorHandler } from '@angular/core';
import { IonicErrorHandler, IonicModule } from 'ionic-angular';

import { LocalQuizService, FirebaseService, AngularFireService } from './shared/shared';


describe('MyApp', () => {
    let fixture;
    let myAppInstance;
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
        myAppInstance = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        myAppInstance = null;
    })

    it('should create a valid instance of MyApp', () => {
        expect(myAppInstance instanceof MyApp).toBe(true);
    });
    it('should have 5 pages in the page array', () => {
        expect(myAppInstance.pages.length).toEqual(5);
    });
    it('should have the correct pages in the page array', () => {
            expect(myAppInstance.pages).toContain({ title: 'Home', component: 'HomePage' });
            expect(myAppInstance.pages).toContain({ title: 'Quiz', component: 'QuizPage' });
            expect(myAppInstance.pages).toContain({ title: 'Stats', component: 'StatsPage' });
            expect(myAppInstance.pages).toContain({ title: 'Signup', component: 'SignupPage' });
            expect(myAppInstance.pages).toContain({ title: 'Login', component: 'LoginPage' });
    }); 
    it('should have the correct home page declared', () => {
        expect(myAppInstance['rootPage']).toBe('HomePage');
    });

});

