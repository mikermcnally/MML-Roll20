const start_combat = button_pressed.pipe(filter(button => button === 'Start Combat'), share());
const end_combat = start_combat.pipe(
  switchMapTo(button_pressed.pipe(filter(button => button === 'End Combat')), share())
);

const combat_phase = prompt_character_actions.pipe(
  concatAll()
);

const combat_round = start_combat.pipe(switchMapTo(

))