import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuizPage } from './quiz';

// Sub-page components
import { WordHistoryComponent } from './components/word-history.component';

@NgModule({
  declarations: [
    QuizPage,
    WordHistoryComponent
  ],
  imports: [
    IonicPageModule.forChild(QuizPage),
  ],
  exports: [
    QuizPage
  ]
})
export class QuizPageModule {}
