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
        return !!this.afAuth.auth.currentUser;
    }

    getAuthSub() {
        return this.afAuth.authState;
    }

    getCurrentUserIdent() {
        let user = this.afAuth.auth.currentUser;
        if (user) {
            return user.email;
        }
        else return null;
    }
    getCurrentUser() {
        let user = this.afAuth.auth.currentUser;
        if (user) {
            return user;
        }
        else return null;
    }


}