import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatsPage } from './stats';
import { LogComponent } from './components/components';

@NgModule({
  declarations: [
    StatsPage,
    LogComponent
  ],
  imports: [
    IonicPageModule.forChild(StatsPage),
  ],
  exports: [
    StatsPage
  ]
})
export class StatsPageModule {}
