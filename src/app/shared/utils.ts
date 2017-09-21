import { Injectable } from '@angular/core';


@Injectable()
export class Utils {
    constructor() { }

    makeAlphagram(word) {
        word = word.toUpperCase().split("").sort().join("");
        return word;
    }

}