import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { IonicPageModule } from 'ionic-angular';
import { LoginBarComponent } from './components/components';

@NgModule({
    declarations: [HomePage,
    LoginBarComponent],
    imports: [IonicPageModule.forChild(HomePage)]
})
export class HomePageModule {}