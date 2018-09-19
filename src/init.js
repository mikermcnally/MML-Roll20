const MML = {};
state.MML = state.MML || {};

MML.button_pressed = Rx.chat_message.pipe(
  filter(({ type, content }) => type === 'api' && content.includes('!MML|')),
  map(function (message) {
    message.who = message.who.replace(' (GM)', '');
    message.content = message.content.replace('!MML|', '');
    message.selected = MML.getSelectedIds(message.selected);
    return message;
  })
);

MML.players = Rx.change_player_online.pipe(
  startWith(findObjs({ _type: 'player', online: true }))
);

MML.player_list = MML.players.pipe(
  scan(function (player_list, player) {
    const id = player.get('id');
    if (player.get('online')) {
      player_list[id] = new MML.Player(player);
    } else if (!_.isUndefined(player_list[id])) {
      delete player_list[id];
    }
    return player_list;
  }, {})
);

MML.gm = MML.players.pipe(filter(player => playerIsGM(player.get('id')), map(player => new MML.gm(player))));

MML.player_input = MML.players.pipe(
  pluck('input'),
  mergeAll()
);

MML.game_state = Rx.merge(
  MML.player_input,
  MML.gm.input
);

MML.characters = Rx.merge(
    Rx.from(findObjs({ _type: 'character', archived: false })),
    Rx.add_character
  )
  .pipe(
    map(character => MML.createCharacter(MML.game_state, character)),
    shareReplay()
  );

// MML.character_list = MML.characters.pipe(
//   scan(function (character_list, character) {
//     character_list[character.id] = character;
//     return character_list;
//   }, {})
// );

MML.token_moved = Rx.change_token.pipe(
  filter(([curr, prev]) => curr.get('left') !== prev['left'] && curr.get('top') !== prev['top']),
  map(([token]) => token)
);

MML.character_moved = MML.token_moved.pipe(
  withLatestFrom(MML.character_list),
  filter(([token, character_list]) => Object.keys(character_list).includes(token.get('represents'))),
  map(([token, character_list]) => character_list[token.get('represents')])
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
    MML.gm_time_advance)
  .pipe(
    startWith(state.MML.current_round || 0),
    scan((sum, num) => sum + num)
  );

MML.current_round.subscribe(round => state.MML.current_round = round);
