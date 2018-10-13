import { Event, ICharacter, IChatMessage, IPlayer, IToken, IAttribute } from "../roll20/roll20";
import * as Rx from "rxjs";
import { share, switchMapTo, take } from "rxjs/operators";

function fromR20Event(event_name: Event): Rx.Observable<any> {
  return Rx.Observable.create(observer => on(event_name, event => observer.next(event))).pipe(share());
};

export const Roll20Ready = fromR20Event(Event.Ready).pipe(take(1));

export const ChatMessage: Rx.Observable<IChatMessage> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChatMessage))
);

export const ChangeToken: Rx.Observable<IToken> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeToken))
);

export const AddCharacter: Rx.Observable<ICharacter> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.AddCharacter))
);

export const ChangeCharacter: Rx.Observable<ICharacter> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeCharacter))
);

export const ChangeCharacterName: Rx.Observable<ICharacter> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeCharacterName))
);

export const ChangeCharacterControlledby: Rx.Observable<ICharacter> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeCharacterControlledBy))
);

export const AddAttribute: Rx.Observable<IAttribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.AddAttribute))
);

export const ChangeAttribute: Rx.Observable<IAttribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeAttribute))
);

export const ChangeAttributeCurrent: Rx.Observable<IAttribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeAttributeCurrent))
);

export const ChangeAttributeMax: Rx.Observable<IAttribute> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangeAttributeMax))
);

export const ChangePlayerOnline: Rx.Observable<IPlayer> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangePlayerIsOnline))
);

export const ChangePlayerDisplayname: Rx.Observable<IPlayer> = Roll20Ready.pipe(
  switchMapTo(fromR20Event(Event.ChangePlayerDisplayName))
);