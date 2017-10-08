import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { IonicPageModule } from 'ionic-angular';
import { LoginBarComponent } from './components/components';
import { SearchParams } from './search-params.class';

@NgModule({
    declarations: [HomePage,
    LoginBarComponent],
    imports: [IonicPageModule.forChild(HomePage)],
    providers: [SearchParams]
})
export class HomePageModule {}