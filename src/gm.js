MML.gm = function GM(roll20_player_object) {
  const gm = this;
  gm.id = roll20_player_object.get('id');
  gm.name = roll20_player_object.get('name');
  gm.characters = MML.characters.pipe(
    mergeMap(character => Rx.combineLatest(character.gm)),
    filter(),
    scan(function (list, character) {
      list[character.id] = character;
      return character;
    })
  );

  const button_pressed = gm.name.pipe(switchMap(name => MML.button_pressed.pipe(filter(message => name === message.who))));

  const route = button_pressed.pipe(pluck('content'));
  const selected_ids = button_pressed.pipe(pluck('selected'));

  const idle = route.filter('/');
  const main_menu = idle.pipe(switchMapTo(route), filter('/gm'));
  const combat_menu = main_menu.pipe(switchMapTo(route), filter('/gm/combat'));
  const start_combat = combat_menu.pipe(switchMapTo(Rx.zip(
    selected_ids.pipe(filter(ids => ids.length > 0)),
    route.pipe(filter('/gm/combat/start'))
  )));
  const end_combat = start_combat.pipe(switchMapTo(route), filter('/gm/combat/end'));
  const ex_machina_menu = main_menu.pipe(switchMapTo(route), filter('/gm/ex_machina'));
  const add_status_effect = ex_machina_menu.pipe(switchMapTo(route), filter('/gm/ex_machina/add_status_effect'))
  const remove_status_effect = ex_machina_menu.pipe(switchMapTo(route), filter('/gm/ex_machina/remove_status_effect'))

  const no_combatants = start_combat.pipe(filter(ids => ids.length > 0), tap);
  const combatants = start_combat.pipe(
    filter(ids => ids.length > 0),
    switchMap(ids => MML.characters.pipe(filter(character => ids.includes(character.id)))),
    switchMap(ids => Rx.of(ids))
  );

  const combatants_ready = combatants.pipe(
    pluck('ready'),
    combineAll(),
    filter(all_ready => all_ready.every(ready => ready))
  );

  const turn_order = combatants_ready.pipe(
    switchMapTo(combatants),
    pluck('initiative'),
    concatAll(),
    zip(combatants),
    toArray(),
    map(function (characters) {
      characters.sort((character_a, character_b) => character_b[0] - character_a[0]);
      return characters.map(([initiative, character]) => character);
    })
  );

  turn_order.pipe(
      switchMap(characters => Rx.zip(characters.map(character => [character.token_id, character.initiative]))),
      map(([token_id, initiative]) => ({ id: token_id, pr: initiative, custom: '' })),
      toArray()
    )
    .subscribe(function (turn_order) {
      Campaign().set('turnorder', JSON.stringify(turn_order));
    })

  const actor = turn_order.pipe(map(characters => characters[0]));

  const current_action = actor.pipe(pluck('action'));

  const round_started = combatants_ready.pipe(switchMapTo(route), filter('/gm/combat/start_round'));
  const round_ended = combatants.pipe(
    pluck('initiative'),
    toArray(),
    switchMap(initiatives => Rx.combineLatest(initiatives)),
    filter(initiatives => initiatives.every(initiative => initiative < 1)),
    merge(end_combat)
  );

  const game_state = Rx.merge(
    current_action,
    add_status_effect,
    remove_status_effect
  );

  main_menu.pipe(switchMapTo(gm.name)).subscribe(function (name) {
    const buttons = [
      new Menu.Button('Combat', '/gm/combat'),
      new Menu.Button('Ex Machina', '/gm/ex_machina'),
      new Menu.Button('Pass Time', '/gm/pass_time'),
      new Menu.Button('Exit', '/')
    ];
    MML.displayMenu(name, 'Main Menu: ', buttons);
  });

  Rx.merge(combat_menu, no_combatants).pipe(switchMapTo(gm.name)).subscribe(function (name) {
    const buttons = [
      new Menu.Button('Start', '/gm/combat/start'),
      new Menu.Button('Exit', '/')
    ];
    MML.displayMenu(name, 'Main Menu: ', buttons);
  });

  round_ended.pipe(switchMapTo(gm.name)).subscribe(function (name) {
    const buttons = [
      new Menu.Button('Start Round', '/gm/combat/start_round'),
      new Menu.Button('End Combat', '/')
    ];
    MML.displayMenu(name, 'Main Menu: ', buttons);
  });

  ex_machina_menu.pipe(switchMapTo(gm.name)).subscribe(function (name) {
    const buttons = [
      new Menu.Button('Add Status Effect', '/gm/ex_machina/add_status_effect'),
      new Menu.Button('Remove Status Effect', '/gm/ex_machina/remove_status_effect'),
      new Menu.Button('Back', '/gm/ex_machina'),
      new Menu.Button('Exit', '/')
    ];
    MML.displayMenu(name, 'Main Menu: ', buttons);
  });
};

// MML.game_state = MML.players.pipe();

// MML.gm_created_effects = MML.menuIdle.pipe(

// );

// MML.statusEffects = Rx.merge(
//   MML.action_results,
//   MML.gm_created_effects
// );

// MML.startCombat = function startCombat(selectedIds) {
//   var gm = state.MML.gm;
//   gm.inCombat = true;
//   const allCombatants = selectedIds.map(id => MML.characters[id]);
//   _.each(MML.players, function(player) {
//     player.combatants = player.characters.filter(character => selectedIds.includes(character.id));
//   });
//   _.each(allCombatants, function(character) {
//     MML.setReady(character, false);
//     MML.setCombatVision(character);
//   });
//   const sortedCombatants = MML.setTurnOrder(allCombatants);
//   return MML.newRound(gm, 0, sortedCombatants);
// };

// Rx.merge(
//   MML.startCombat.pipe(mapTo('true')),
//   MML.endCombat.pipe(mapTo('false'))
// )
// .subscribe(show => Campaign().set('initiativepage', show));

// MML.newRound = Rx.merge(MML.startCombat).pipe(

// );

async function newRound(gm, currentRound, combatants) {
  try {
    gm.roundStarted = false;
    const updatedCombatants = await Promise.all(combatants.map(character => MML.newRoundUpdate(character)));
    const actions = await Promise.all(_.values(MML.players).map(player => MML.prepareCharacters(player)));
    return await MML.startRound(gm, currentRound, actions);
  } catch (err) {
    log(err.stack)
  }
};

MML.startRound = async function startRound(gm, currentRound, actions) {
  const { pressedButton } = await MML.displayMenu(gm.player, 'Start round when all characters are ready.', ['Start Round', 'End Combat']);
  if (pressedButton === 'Start Round') {
    if (MML.checkReady(gm.allCombatants)) {
      gm.roundStarted = true;
      _.each(gm.allCombatants, function (character) {
        character.movementAvailable = character.movementRatio;
      });
      return await MML.nextAction(gm, currentRound, actions);
    } else {
      sendChat('Error', 'Not All Characters Are Ready');
      return await MML.startRound(gm);
    }
  } else {
    return MML.endCombat(gm);
  }
};

MML.nextAction = async function nextAction(gm, currentRound, combatants) {
  const sortedCombatants = MML.setTurnOrder(combatants);
  if (MML.checkReady(sortedCombatants)) {
    const character = sortedCombatants[0];
    if (character.initiative > 0) {
      gm.actor = character.id;
      await MML.startAction(character.player, character, MML.validateAction(character));
      return await MML.nextAction(gm, currentRound, sortedCombatants);
    } else {
      return MML.newRound(gm);
    }
  }
};

MML.checkReady = function checkReady(combatants) {
  return _.every(combatants, function (character) {
    return character.ready;
  });
};

MML.displayThreatZones = function displayThreatZones(toggle) {
  _.each(state.MML.gm.allCombatants, function (character) {
    var token = MML.getCharacterToken(character.id);
    var radius1 = '';
    var radius2 = '';
    var color1 = '#FF0000';
    var color2 = '#FFFF00';
    if (toggle && !MML.isWieldingRangedWeapon(character) && !MML.isUnarmed(character)) {
      var weapon = MML.getEquippedWeapon(character);
      radius1 = MML.weaponRanks[weapon.rank].high;
      radius2 = MML.weaponRanks[weapon.rank + 1].high;
    }
    MML.displayAura(token, radius1, 1, color1);
    MML.displayAura(token, radius2, 2, color2);
  });
};

MML.assignNewItem = function assignNewItem(input) {
  MML.processCommand({
    type: 'character',
    who: input.target,
    callback: 'setApiCharAttributeJSON',
    input: {
      attribute: 'inventory',
      index: MML.generateRowID(),
      value: state.MML.gm.newItem
    }
  });
  MML.processCommand({
    type: 'player',
    who: MML.characters[input.target].player,
    callback: 'sendChatMenu',
    input: {}
  });
};
