import { Injectable } from '@angular/core';


@Injectable()
export class Utils {
    constructor() {

    }

    makeAlphagram(word) {
        if (word.search(/[^a-zA-Z]+/) === -1) {
            word = word.toUpperCase().split("").sort().join("");
            return word;
        }
        return '';
    }

}
