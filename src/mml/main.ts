import * as Rx from "rxjs";
import { filter, map, shareReplay, switchMapTo, startWith } from "rxjs/operators";
import { getSelectedIds } from "../utilities/utilities";
import { ChatMessage, ChangePlayerOnline, AddCharacter } from "../utilities/events";
import { IPlayer } from "../roll20/player";
import { Player } from "./user/player";
import { Character } from "./character/character";


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
  startWith(...findObjs({ _type: 'player', online: true }) as Array<IPlayer>),
  shareReplay()
);

export const Players = Users.pipe(filter(user => !playerIsGM(user.id)), map(user => new Player(user)));
export const CurrentGM = Users.pipe(filter(user => playerIsGM(user.id)), map(user => new GM(user)));

export const Tokens = Rx.merge(
    Rx.from(findObjs({ _type: 'graphic', archived: false })),
    
  )
  .pipe(
    shareReplay()
  );

export const Characters = Rx.merge(
    Rx.from(findObjs({ _type: 'character', archived: false })),
    AddCharacter
  )
  .pipe(
    map(character => new Character(character, )),
    shareReplay()
  );

MML.spell_marker_moved = Rx.change_token.pipe(filter(token => token.get('name').includes('spellMarker')));

MML.spell_marker_moved.subscribe(token => toBack(token));

MML.aoe_spell_targets = MML.spell_marker_moved.pipe(
  map(([token]) => MML.getAoESpellTargets(token))
);

MML.select_target = MML.button_pressed.pipe(filter(message => message.includes('selectTarget')));
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
