const MML = {};
state.MML = state.MML || {};

MML.players = Rx.change_player_online.pipe(
  startWith(findObjs({
    _type: 'player',
    online: true
  }, {
    caseInsensitive: false
  }))
);

MML.player_list = MML.players.pipe(
  scan(function (player_list, player) {
    const id = player.get('id');
    if (player.get('online')) {
      player_list[id] = player;
    } else if (!_.isUndefined(player_list[id])) {
      delete player_list[id];
    }
    return player_list;
  }, {})
);

MML.GM = MML.players.pipe(filter(player => playerIsGM(player.get('id'))));

MML.button_pressed = Rx.chat_message.pipe(
  filter(({ type, content }) => type === 'api' && content.includes('!MML|')),
  map(function (message) {
    message.who = message.who.replace(' (GM)', '');
    message.content = message.content.replace('!MML|', '');
    message.selected = MML.getSelectedIds(message.selected);
    return message;
  }),
  // share(),
  tap(() => log('button'))
);

MML.characters = Rx.add_character.pipe(
  startWith(
    findObjs({
      _type: 'character',
      archived: false
    }, {
      caseInsensitive: false
    })
  ),
  tap(function (character) {
    const id = character.get('id');
    const name = character.get('name');

    MML.createAttribute('id', id, '', character);
    MML.createAttribute('name', name, '', character);
    MML.createAttribute('race', 'Human', '', character);
    MML.createAttribute('gender', 'Male', '', character);
    MML.createAttribute('stature_roll', 6, '', character);
    MML.createAttribute('strength_roll', 6, '', character);
    MML.createAttribute('coordination_roll', 6, '', character);
    MML.createAttribute('health_roll', 6, '', character);
    MML.createAttribute('beauty_roll', 6, '', character);
    MML.createAttribute('intellect_roll', 6, '', character);
    MML.createAttribute('reason_roll', 6, '', character);
    MML.createAttribute('creativity_roll', 6, '', character);
    MML.createAttribute('presence_roll', 6, '', character);
    MML.createAttribute('fom_init_bonus', 6, '', character);
    MML.createAttribute('right_hand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);
    MML.createAttribute('leftHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);
  }),
  map(character => MML.createCharacter(character.id))
);

MML.character_list = MML.characters.pipe(
  scan(function (character_list, character) {
    character_list[character.id] = character;
    return character_list;
  }, {})
);

MML.character_controlled_by = Rx.change_character_controlledby.pipe(
  map(function (character) {
    return {
      character_id: character.id,
      player_id_list: character.controlledby.split(',')
    };
  })
);

MML.character_controlled_by_error = MML.character_controlled_by.pipe(
  filter(({ player_id_list }) => player_id_list.length === 0 || player_id_list.length > 1),
  withLatestFrom(MML.GM),
  tap(([controlled_by, gm]) => sendChat(gm.name, 'Character needs exactly 1 player'))
)

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
    MML.new_round.pipe(count()),
    MML.gm_time_advance)
  .pipe(
    startWith(state.MML.current_round || 0),
    scan((sum, num) => sum + num)
  );

MML.current_round.subscribe(round => state.MML.current_round = round);

MML.init = function () {
  MML.initializeMenu(state.MML.GM.player);

  on('add:attribute', function (attribute) {
    var id = attribute.get('_characterid');
    var attrName = attribute.get('name');

    if (attrName.includes('repeating_skills') || attrName.includes('repeating_weaponskills')) {
      MML.updateCharacterSheet(characters[id]);
    }
  });

  on('change:character:name', function (changedCharacter) {
    const character = MML.characters[changedCharacter.get('id')];
    character.name = changedCharacter.get('name');
    MML.updateCharacterSheet(character);
  });

  on('change:attribute:current', function (attribute) {
    var character = MML.characters[attribute.get('_characterid')];
    var attrName = attribute.get('name');
    var roll;
    var rollAttributes = [
      'statureRoll',
      'strengthRoll',
      'coordinationRoll',
      'healthRoll',
      'beautyRoll',
      'intellectRoll',
      'reasonRoll',
      'creativityRoll',
      'presenceRoll'
    ];

    if (rollAttributes.includes(attrName)) {
      roll = parseFloat(attribute.get('current'));
      if (isNaN(roll) || roll < 6) {
        roll = 6;
      } else if (roll > 20) {
        roll = 20;
      }
      MML.setCurrentAttribute(character.id, attrName, roll);
      MML.updateCharacterSheet(character);
    } else if (attrName === 'player') {
      character.setPlayer();
    } else if (attrName != 'tab') {
      MML.updateCharacterSheet(character);
    }
  });
};
