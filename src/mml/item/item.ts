import { Id } from "../../roll20/object";
import { Float } from "../../utilities/float";
import * as Rx from 'rxjs';

export interface IItem {
  readonly id: Id;
  readonly weight: Float.Positive;
  readonly name: Rx.Observable<string>;

  toJSON(): string;
}

export interface IItemModifiers {
  
}