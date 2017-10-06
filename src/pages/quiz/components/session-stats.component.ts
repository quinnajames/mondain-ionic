import { Component, Input } from '@angular/core';

@Component({
    selector: 'session-stats',
    template: 
    `<div class="inner-table translucent">
    <h1 class="translucent"><b> {{stats.overall.correct}} of {{stats.overall.correct + stats.overall.incorrect}}
      ({{stats.overall.percent}}%)</b></h1><b>Last 10:</b> {{stats.last10.correct}} of {{stats.last10.correct
    + stats.last10.incorrect}}
    </div>`
})

export class SessionStatsComponent {
    @Input() stats:any;
}