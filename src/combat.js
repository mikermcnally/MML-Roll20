/**
 * Start encounter
 * Determine initiative
 * First general action phase
 * 
 */

const start_combat = gm_chat.pipe(
  filter(message => message.button === 'Start Combat'),
  pluck('selected')
);

const end_combat = start_combat.pipe(
  switchMapTo(button_pressed.pipe(filter(button => button === 'End Combat')), share())
);

const round_started = start_combat.pipe(switchMap(function () {
  
}));

const determine_intiative = start_combat.pipe(switchMap(function (characters) {
  
}));
