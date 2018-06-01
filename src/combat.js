const start_combat = button_pressed.pipe(filter(button => button === 'Start Combat'));
const end_combat = start_combat.pipe(
  switchMapTo(button_pressed.pipe(filter(button => button === 'End Combat')))
);

