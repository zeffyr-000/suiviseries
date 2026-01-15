import { Signal, WritableSignal } from '@angular/core';
import { Serie } from './serie.model';

export interface SearchResource {
    readonly results: Signal<Serie[]>;
    readonly isLoading: Signal<boolean>;
    readonly error: Signal<unknown>;
    readonly hasValue: Signal<boolean>;
    readonly query: WritableSignal<string>;
}
