import { Injectable } from '@angular/core';


@Injectable()
export class Utils {
    LexiconSize: Map<number, number>;
    constructor() {
        const LexiconSize = new Map([
            [2, 92],
            [3, 878],
            [4, 3491],
            [5, 8654],
            [6, 16999],
            [7, 27437],
            [8, 36327],
            [9, 38795],
            [10, 36595],
            [11, 27862],
            [12, 20437],
            [13, 14061],
            [14, 9251],
            [15, 5846]
        ]);
    }

    makeAlphagram(word) {
        if (word.search(/[^a-zA-Z]+/) === -1) {
            word = word.toUpperCase().split("").sort().join("");
            return word;
        }
        return '';
    }

}
