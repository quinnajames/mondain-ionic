import { Component } from '@angular/core';
import { QuizInfoComponent } from './components';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';

@Component({
    template:`<div class="translucent">
    <h1><span id="mapSize" class="translucent" *ngIf="quiz">
    {{quiz.size}}
    </span>
    /
    <span id="logCount" class="translucent" *ngIf="log || log === 0">
    {{log}}
    </span>

    </h1>
    </div><div class="translucent">
    remaining / today
    </div>`
})
class TestHostComponent {
    quiz: Map<string, boolean>
    log: number
    constructor() {
        this.quiz = new Map<string, boolean>([["AAU", true], ["AEINRST", false]]);
        this.log = 0;
    }
}


describe('QuizInfoComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QuizInfoComponent, TestHostComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    })

    it('should show a quiz size of 2', () => {
        expect(testHostFixture.nativeElement.querySelector(
            '#mapSize').innerHTML.trim()).toEqual('2');
    })

    it('should show a log size of 0', () => {

        console.log(testHostFixture.nativeElement.querySelector(
            '#logCount'));
        expect(testHostFixture.nativeElement.querySelector(
            '#logCount').innerHTML.trim()).toEqual('0');
    })

})
