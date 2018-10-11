import { isEmpty, switchMap } from "rxjs/operators";
import {  } from ".";

export function prepareAction(button_pressed, character: MML) {
  // const action = {
  //   ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
  //   modifiers: [],
  //   weapon: MML.getEquippedWeapon(character)
  // };

  // if (_.has(character.statusEffects, 'Stunned')) {
  //   _.extend(action, { ts: Date.now(), name: 'Movement Only' });
  //   return MML.finalizeAction(player, character, action);
  // } else if (character.situational_init_bonus !== 'No Combat') {
  //   return MML.buildAction(player, character, action).pipe(
  //     switchMapTo(MML.finalizeAction(player, character, action))
  //   );
  // } else {
  //   return {
  //     id: character.id,
  //     attribute: 'action',
  //     value: Rx.empty()
  //   };
  // }
  return character.action.pipe(
    isEmpty(),
    switchMap(function (has_action) {
      return has_action ? MML.changeAction(button_pressed, character) : MML.buildAction(button_pressed, character);
    })
  );
}
