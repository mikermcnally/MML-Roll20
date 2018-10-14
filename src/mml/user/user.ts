import { Id } from "../../roll20/object";
import * as Rx from "rxjs";
import Menu from "../menu/menu";
import { Route } from "../menu/routes";
import { IR20ChatMessage } from "../../roll20/chat";
import { IPlayer } from "../../roll20/player";
import { Character } from "../character/character";

export type UserName = string & { __type: UserName };

export interface IUser {
  readonly id: Id;
  readonly name: Rx.Observable<UserName>;
  readonly menu: Rx.Observable<Menu>;
  readonly route: Rx.Observable<Route>;
  readonly button_pressed: Rx.Observable<IR20ChatMessage>;

  constructor(roll20_player_object: IPlayer, button_pressed: Rx.Observable<IR20ChatMessage>)

  displayRoll(message: string): void;
  displayTargetSelection(): void;
  selectTarget(): Rx.Observable<Character>;
  getMultipleTargets(player, targets): Rx.Observable<Array<Character>>;
  getRadiusSpellTargets(radius): void;
  displaySpellMarker(player, spellMarker): void;
  chooseSpellTargets(player, character, target): Rx.Observable<Array<Character>>;
}




export * from "./player";
export * from "./gm";