import {
    inject, fakeAsync, tick, TestBed
} from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Utils } from '../../app/shared/shared';

describe('Utils', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Utils
            ]
        });
    });
    describe('makeAlphagram', () => {
        it('converts a string to its alphagram',
        inject([Utils], (utils: Utils) => {
            expect(utils.makeAlphagram('MONDAIN')).toBe('ADIMNNO');
        }));
        it('converts a lowercase string to uppercase alphagram',
        inject([Utils], (utils: Utils) => {
            expect(utils.makeAlphagram('menadione')).toBe('ADEEIMNNO');
        }));
        it('returns an empty string if passed a word with a number in it',
        inject([Utils], (utils: Utils) => {
            expect(utils.makeAlphagram('men4dione')).toBe('');
        }));
    });
});

