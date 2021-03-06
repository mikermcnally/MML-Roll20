MML.startCombat = function startCombat(selectedIds) {
  var gm = state.MML.GM;
  gm.currentRound = 0;
  gm.inCombat = true;
  gm.allCombatants = selectedIds.map(id => MML.characters[id]);
  _.each(MML.players, function(player) {
    player.combatants = player.characters.filter(character => selectedIds.includes(character.id));
  });
  _.each(gm.allCombatants, function(character) {
    MML.setReady(character, false);
    MML.setCombatVision(character);
  });
  MML.setTurnOrder(gm.allCombatants);
  Campaign().set('initiativepage', 'true');
  return MML.newRound(gm);
};

MML.newRound = async function newRound(gm) {
  try {
    gm.currentRound++;
    gm.roundStarted = false;
    gm.allCombatants = await Promise.all(gm.allCombatants.map(character => MML.newRoundUpdate(character)));
    await Promise.all(_.values(MML.players).map(player => MML.prepareCharacters(player)));
    return await MML.startRound(gm);
  } catch (err) {
    log(err.stack)
  }
};

MML.startRound = async function startRound(gm) {
  const {pressedButton} = await MML.goToMenu(gm.player, 'Start round when all characters are ready.', ['Start Round', 'End Combat']);
  if (pressedButton === 'Start Round') {
    if (MML.checkReady(gm.allCombatants)) {
      gm.roundStarted = true;
      _.each(gm.allCombatants, function(character) {
        character.movementAvailable = character.movementRatio;
      });
      return await MML.nextAction(gm);
    } else {
      sendChat('Error', 'Not All Characters Are Ready');
      return await MML.startRound(gm);
    }
  } else {
    return MML.endCombat(gm);
  }
};

MML.endCombat = function endCombat(gm) {
  if (gm.allCombatants.length > 0) {
    _.each(gm.allCombatants, function(character) {
      MML.setReady(character, true);
      MML.setCombatVision(character);
    });
    gm.inCombat = false;
    gm.allCombatants = [];
    Campaign().set('initiativepage', 'false');
  }
};

MML.nextAction = async function nextAction(gm) {
  MML.setTurnOrder(gm.allCombatants);
  if (MML.checkReady(gm.allCombatants)) {
    var character = gm.allCombatants[0];
    if (character.initiative > 0) {
      gm.actor = character.id;
      await MML.startAction(character.player, character, MML.validateAction(character));
      return await MML.nextAction(gm);
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
  _.each(state.MML.GM.allCombatants, function(character) {
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

MML.setTurnOrder = function setTurnOrder(combatants) {
  combatants.sort((a, b) => b.initiative - a.initiative);
  state.MML.GM.allCombatants = combatants;
  const turnorder = combatants.map(function (character) {
    return {
      id: MML.getCharacterToken(character.id).id,
      pr: character.initiative,
      custom: ''
    };
  });
  Campaign().set('turnorder', JSON.stringify(turnorder));
};

MML.assignNewItem = function assignNewItem(input) {
  MML.processCommand({
    type: 'character',
    who: input.target,
    callback: 'setApiCharAttributeJSON',
    input: {
      attribute: 'inventory',
      index: MML.generateRowID(),
      value: state.MML.GM.newItem
    }
  });
  MML.processCommand({
    type: 'player',
    who: MML.characters[input.target].player,
    callback: 'displayMenu',
    input: {}
  });
};
