import { Id } from "../../roll20/object";
import * as Rx from "rxjs";
import Menu from "../menu/menu";
import { Routes } from "../routes";
import { IR20ChatMessage } from "../../roll20/chat";
import { IR20Player } from "../../roll20/player";
import { Character } from "../character/character";
import { IGameEvent } from "../mml";

export type UserName = string & { __type: UserName };

export interface IUser {
  readonly id: Id;
  readonly name: Rx.Observable<UserName>;
  readonly menu: Rx.Observable<Menu>;
  readonly route: Rx.Observable<Routes>;
  readonly button_pressed: Rx.Observable<IR20ChatMessage>;
  [property: string]: any;

  constructor(roll20_player_object: IR20Player, button_pressed: Rx.Observable<IR20ChatMessage>, game_events: Rx.Observable<IGameEvent>)

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