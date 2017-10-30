import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatsPage } from './stats';
import { LogComponent } from './components/components';
import { ReversePipe } from '../../app/shared/shared';

@NgModule({
  declarations: [
    StatsPage,
    LogComponent,
    ReversePipe
  ],
  imports: [
    IonicPageModule.forChild(StatsPage),
  ],
  exports: [
    StatsPage
  ]
})
export class StatsPageModule {}
