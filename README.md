Mondain Words is a web and mobile app using the [Ionic](http://ionicframework.com/docs/) framework. It requires the Ionic CLI to run.

## Firebase

The app uses a [Firebase](http://firebase.google.com) backend. To mirror the app you will want to create your own Firebase database, set up validation rules, and then add a ```firebase.config.ts``` file to export a variable called ```firebaseConfig``` with the format described [here](https://firebase.google.com/docs/web/setup).