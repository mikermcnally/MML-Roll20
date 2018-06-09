SoS.startCombat = function startCombat(selectedIds) {
  var gm = state.SoS.GM;
  gm.inCombat = true;
  const allCombatants = selectedIds.map(id => SoS.characters[id]);
  _.each(SoS.players, function(player) {
    player.combatants = player.characters.filter(character => selectedIds.includes(character.id));
  });
  _.each(allCombatants, function(character) {
    SoS.setReady(character, false);
    SoS.setCombatVision(character);
  });
  const sortedCombatants = SoS.setTurnOrder(allCombatants);
  Campaign().set('initiativepage', 'true');
  return SoS.newRound(gm, 0, sortedCombatants);
};

SoS.newRound = async function newRound(gm, currentRound, combatants) {
  try {
    gm.roundStarted = false;
    const updatedCombatants = await Promise.all(combatants.map(character => SoS.newRoundUpdate(character)));
    const actions = await Promise.all(_.values(SoS.players).map(player => SoS.prepareCharacters(player)));
    return await SoS.startRound(gm, currentRound, actions);
  } catch (err) {
    log(err.stack)
  }
};

SoS.startRound = async function startRound(gm, currentRound, actions) {
  const {pressedButton} = await SoS.goToMenu(gm.player, 'Start round when all characters are ready.', ['Start Round', 'End Combat']);
  if (pressedButton === 'Start Round') {
    if (SoS.checkReady(gm.allCombatants)) {
      gm.roundStarted = true;
      _.each(gm.allCombatants, function(character) {
        character.movementAvailable = character.movementRatio;
      });
      return await SoS.nextAction(gm, currentRound, actions);
    } else {
      sendChat('Error', 'Not All Characters Are Ready');
      return await SoS.startRound(gm);
    }
  } else {
    return SoS.endCombat(gm);
  }
};

SoS.endCombat = function endCombat(gm) {
  if (gm.allCombatants.length > 0) {
    _.each(gm.allCombatants, function(character) {
      SoS.setReady(character, true);
      SoS.setCombatVision(character);
    });
    gm.inCombat = false;
    gm.allCombatants = [];
    Campaign().set('initiativepage', 'false');
  }
};

SoS.nextAction = async function nextAction(gm, currentRound, combatants) {
  const sortedCombatants = SoS.setTurnOrder(combatants);
  if (SoS.checkReady(sortedCombatants)) {
    const character = sortedCombatants[0];
    if (character.initiative > 0) {
      gm.actor = character.id;
      await SoS.startAction(character.player, character, SoS.validateAction(character));
      return await SoS.nextAction(gm, currentRound, sortedCombatants);
    } else {
      return SoS.newRound(gm);
    }
  }
};

SoS.checkReady = function checkReady(combatants) {
  return _.every(combatants, function (character) {
    return character.ready;
  });
};

SoS.displayThreatZones = function displayThreatZones(toggle) {
  _.each(state.SoS.GM.allCombatants, function(character) {
    var token = SoS.getCharacterToken(character.id);
    var radius1 = '';
    var radius2 = '';
    var color1 = '#FF0000';
    var color2 = '#FFFF00';
    if (toggle && !SoS.isWieldingRangedWeapon(character) && !SoS.isUnarmed(character)) {
      var weapon = SoS.getEquippedWeapon(character);
      radius1 = SoS.weaponRanks[weapon.rank].high;
      radius2 = SoS.weaponRanks[weapon.rank + 1].high;
    }
    SoS.displayAura(token, radius1, 1, color1);
    SoS.displayAura(token, radius2, 2, color2);
  });
};

SoS.setTurnOrder = function setTurnOrder(combatants) {
  combatants.sort((character_a, character_b) => character_b.initiative - character_a.initiative);
  const turnorder = combatants.map(function (character) {
    return {
      id: SoS.getCharacterToken(character.id).id,
      pr: character.initiative,
      custom: ''
    };
  });
  Campaign().set('turnorder', JSON.stringify(turnorder));
  return combatants;
};

SoS.assignNewItem = function assignNewItem(input) {
  SoS.processCommand({
    type: 'character',
    who: input.target,
    callback: 'setApiCharAttributeJSON',
    input: {
      attribute: 'inventory',
      index: SoS.generateRowID(),
      value: state.SoS.GM.newItem
    }
  });
  SoS.processCommand({
    type: 'player',
    who: SoS.characters[input.target].player,
    callback: 'displayMenu',
    input: {}
  });
};
