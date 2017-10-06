import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuizPage } from './quiz';

// Sub-page components
import { WordHistoryComponent, SessionStatsComponent } from './components/components';

@NgModule({
  declarations: [
    QuizPage,
    WordHistoryComponent,
    SessionStatsComponent
  ],
  imports: [
    IonicPageModule.forChild(QuizPage),
  ],
  exports: [
    QuizPage
  ]
})
export class QuizPageModule {}
