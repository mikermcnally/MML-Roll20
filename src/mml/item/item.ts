import { Id } from "../../roll20/object";
import { Float } from "../../utilities/float";
import * as Rx from 'rxjs';
import { Character } from "../mml";

export interface IItem {
  readonly id: Id;
  readonly character_id: Rx.Observable<Character['id']>;
  readonly weight: Float.Positive;
  readonly name: Rx.Observable<string>;
  readonly modifiers?: Rx.Observable<Array<IItemModifier>>;

  updateCharacterSheet(): void;
}

export interface IItemModifier {
  
}

export * from "./armor/armor";