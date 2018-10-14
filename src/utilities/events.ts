import { R20Event, IR20Character, IR20ChatMessage, IR20Player, IR20Token, IR20Attribute } from "../roll20/roll20";
import * as Rx from "rxjs";
import { share, switchMapTo, take } from "rxjs/operators";

function fromR20Event(event_name: R20Event): Rx.Observable<any> {
  return Rx.Observable.create(observer => on(event_name, event => observer.next(event))).pipe(share());
};

export const Roll20Ready = fromR20Event(R20Event.Ready).pipe(take(1));

export const ChatMessage: Rx.Observable<IR20ChatMessage> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChatMessage))
);

export const AddToken: Rx.Observable<IR20Token> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.AddToken))
);

export const ChangeToken: Rx.Observable<IR20Token> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeToken))
);

export const AddCharacter: Rx.Observable<IR20Character> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.AddCharacter))
);

export const ChangeCharacter: Rx.Observable<IR20Character> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeCharacter))
);

export const ChangeCharacterName: Rx.Observable<IR20Character> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeCharacterName))
);

export const ChangeCharacterControlledby: Rx.Observable<IR20Character> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeCharacterControlledBy))
);

export const AddAttribute: Rx.Observable<IR20Attribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.AddAttribute))
);

export const ChangeAttribute: Rx.Observable<IR20Attribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeAttribute))
);

export const ChangeAttributeCurrent: Rx.Observable<IR20Attribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeAttributeCurrent))
);

export const ChangeAttributeMax: Rx.Observable<IR20Attribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangeAttributeMax))
);

export const ChangePlayerOnline: Rx.Observable<IR20Player> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangePlayerIsOnline))
);

export const ChangePlayerDisplayname: Rx.Observable<IR20Player> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(R20Event.ChangePlayerDisplayName))
);