import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuizPage } from './quiz';

// Sub-page components
import { InputBoxComponent,
         QuizButtonsComponent,
         QuizInfoComponent,
         QuizQuestionComponent,
         SessionStatsComponent,
         SolutionsBoxComponent,
         WordHistoryComponent } from './components/components';

@NgModule({
  declarations: [
    QuizPage,
    InputBoxComponent,
    QuizButtonsComponent,
    QuizInfoComponent,
    QuizQuestionComponent,
    SessionStatsComponent,
    SolutionsBoxComponent,
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
