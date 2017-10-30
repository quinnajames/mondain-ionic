import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';


@Injectable()

export class AuthProvider {
    constructor(public afAuth: AngularFireAuth) { }

    loginUser(email: string, password: string): firebase.Promise<any> {
        return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    }

    signupUser(email: string, password: string): firebase.Promise<any> {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((newUser) => {
            firebase.database().ref('/userProfile').child(newUser.uid).set({
                email: email
            });
        });
    }

    resetPassword(email: string): firebase.Promise<any> {
        return this.afAuth.auth.sendPasswordResetEmail(email);
    }

    logoutUser(): firebase.Promise<any> {
        return this.afAuth.auth.signOut();
    }

    isLoggedIn() {
        this.afAuth.authState.subscribe(auth => {
            console.log(!!auth);
            return !!auth;
        })
    }

    getAuthSub() {
        return this.afAuth.authState;
    }

    // TODO: refactoring target
    getCurrentUserIdent() {
        this.afAuth.authState.subscribe(auth => {
            console.log(auth);
            if (auth) return auth.email;
            else return "No user";
        })
    }
    getCurrentUser() {
        this.afAuth.authState.subscribe(auth => {
            console.log("getCurrentUser()");
            console.log(auth);
            return auth;
        })
    }


}