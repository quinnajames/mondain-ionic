import { Component, Input } from '@angular/core';

@Component({
    selector: 'session-stats',
    template: 
    `<div class="translucent">
    <h1 class="translucent"><b> {{stats.overall.correct}} of {{stats.overall.correct + stats.overall.incorrect}}
      ({{stats.overall.percent}}%)</b></h1><b>Last 30:</b> {{stats.recent.correct}} of {{stats.recent.correct
    + stats.recent.incorrect}}
    </div>`
})

export class SessionStatsComponent {
    @Input() stats:any;
}