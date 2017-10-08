import { Injectable } from '@angular/core';


@Injectable()
export class SearchParams {
    constructor(public listSize: number, public startPos: number, public wordLength: number) {
        let lexiconSize = new Map([
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
        console.log(listSize);
        console.log(startPos);
        console.log(wordLength);
        console.log(lexiconSize);
        let lastWord = lexiconSize.get(wordLength);
        console.log(lastWord);
        console.log(lexiconSize.get(2));
        console.log(lexiconSize.get(wordLength));
        if (startPos + listSize - 1 > lastWord) {
            let newstart = startPos = lastWord - listSize + 1;
            console.log("start pos is wrong -- should be " + newstart);
        }
    }
  }