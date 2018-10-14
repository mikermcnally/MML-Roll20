import * as Rx from "rxjs";
import { filter, map, shareReplay, switchMapTo, startWith } from "rxjs/operators";
import { getSelectedIds } from "../utilities/utilities";
import { ChatMessage, ChangePlayerOnline, AddCharacter, AddToken, ChangeToken } from "../utilities/events";
import { IR20Player } from "../roll20/player";
import { GM, Player } from "./user/user";
import { Character } from "./character/character";
import { ObjectType } from "../roll20/object";
import { IGameEvent } from "./mml";
import { IR20Token, TokenProperties } from "../roll20/token";
import { IR20Character } from "../roll20/roll20";


state.MML = state.MML || {};

export const ButtonPressed = ChatMessage.pipe(
  filter(({ type, content }) => type === 'api' && content.includes('!MML|')),
  map(function (message) {
    message.who = message.who.replace(' (GM)', '');
    message.content = message.content.replace('!MML|', '');
    message.selected = getSelectedIds(message.selected);
    return message;
  })
);

export const Users = ChangePlayerOnline.pipe(
  startWith(...findObjs({ _type: ObjectType.Player, online: true }) as Array<IR20Player>),
  shareReplay()
);

export const GameEvents = new Rx.Subject<IGameEvent>();
export const Players = Users.pipe(filter(user => !playerIsGM(user.id)), map(user => new Player(user)));
export const CurrentGM = Users.pipe(filter(user => playerIsGM(user.id)), map(user => new GM(user, ButtonPressed, GameEvents)));
export const Tokens = AddToken.pipe(
  startWith(...findObjs({ _type: ObjectType.Graphic, archived: false })),
  map(token => token as IR20Token),
  shareReplay()
);

export const TokenMoved = Rx.merge(ChangeTokenTop, ChangeTokenLeft)

MML.spell_marker_moved = Ch.pipe(filter(token => token.get(TokenProperties.Name).includes('spellMarker')));

MML.spell_marker_moved.subscribe(token => toBack(token));

MML.aoe_spell_targets = MML.spell_marker_moved.pipe(
  map(([token]) => MML.getAoESpellTargets(token))
);

export const Characters = AddCharacter.pipe(
  startWith(...findObjs({ _type: ObjectType.Character, archived: false })),
  map(character => new Character(character as IR20Character, GameEvents, Tokens)),
  shareReplay()
);


// _.each(MML.characters, function (character) {
//   var token = MML.getCharacterToken(character.id);
//   if (!_.isUndefined(token)) {
//     if (targets.includes(character.id)) {
//       token.set('tint_color', '#00FF00');
//     } else {
//       token.set('tint_color', 'transparent');
//     }
//   }
// });
// metaMagic['Modified AoE'] = MML.getAoESpellModifier(token, spell);
// sendChat('GM',
//   'EP Cost: ' + MML.getModifiedEpCost() + '\n' +
//   'Chance to Cast: ' + MML.getModifiedCastingChance()
// );

MML.in_combat = Rx.merge(MML.start_combat.pipe(mapTo(true)), MML.end_combat.pipe(mapTo(false)));

MML.new_round = Rx.of('idk yet');
MML.gm_time_advance = Rx.of('idk yet');

MML.current_round = Rx.merge(
  MML.new_round.pipe(mapTo(1)),
  MML.gm_time_advance
)
  .pipe(
    startWith(state.MML.current_round || 0),
    scan((sum, num) => sum + num)
  );

MML.current_round.subscribe(round => state.MML.current_round = round);

Rx.merge().subscribe(GameEvents);