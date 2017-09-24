MML.startCombat = function startCombat(player) {
  var gm = state.MML.GM;
  gm.currentRound = 0;
  gm.combatants = [];
  if (player.selectedCharNames.length > 0) {
    gm.inCombat = true;
    _.each(MML.players, function(player) { player.combatants = []; });
    _.each(player.selectedCharNames, function(charName) {
      var character = MML.characters[charName];
      gm.combatants.push(character);
      character.player.combatants.push(character);
      MML.setReady(character, false);
      MML.setCombatVision(character);
    });
    MML.setTurnOrder(gm.combatants);
    Campaign().set('initiativepage', 'true');
    return MML.newRound();
    // return MML.combatMenu(player);
  } else {
    sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
    return MML.goToMenu(player, MML.GmMenuCombat(player));
  }
};

MML.newRound = function newRound() {
  var gm = state.MML.GM;
  gm.currentRound++;
  gm.roundStarted = false;
  gm.fatigueChecks = [];
  _.each(gm.combatants, function(character) {
    MML.newRoundUpdate(character);
  });
  if (gm.fatigueChecks.length > 0) {
    gm.fatigueCheckIndex = 0;
    MML.nextFatigueCheck();
  } else {
    return Promise.all(_.values(MML.players).map(function (player) {
        return MML.prepareCharacters(player);
      }))
      .then(function (players) {
        return MML.startRound(gm.player);
      });
  }
};

MML.endCombat = function endCombat() {
  var gm = state.MML.GM;
  if (gm.combatants.length > 0) {
    _.each(gm.combatants, function(charName) {
      MML.characters[charName].setReady(true);
      MML.characters[charName].setCombatVision();
    });
    gm.inCombat = false;
    gm.combatants = [];
    Campaign().set('initiativepage', 'false');
  }
};

MML.nextAction = function nextAction() {
  var gm = state.MML.GM;
  MML.setTurnOrder(gm.combatants);
  if (MML.checkReady()) {
    var character = gm.combatants[0];
    if (character.initiative > 0) {
      gm.actor = character.name;
      return MML.startAction(character.player, character, MML.validateAction(character))
        .then(MML.nextAction)
        .catch(log);
    } else {
      return MML.newRound();
    }
  }
};

MML.nextFatigueCheck = function nextFatigueCheck() {
  var gm = state.MML.GM;
  if (gm.fatigueCheckIndex < gm.fatigueChecks.length) {
    var character = gm.fatigueChecks[gm.fatigueCheckIndex];
    var player = character.player;
    if (character.roundsRest >= 6) {
      player.charMenuFatigueRecoveryRoll(character.name);
    } else {
      player.charMenuFatigueCheckRoll(character.name);
    }
    player.displayMenu();
    gm.fatigueCheckIndex++;
  } else {
    _.each(MML.players, function(player) {
      MML.prepareCharacters(player);
    });
  }
};

MML.setTargets = function setTargets() {
  this.targets = this.characters[this.actor].action.targets;
  this.targetIndex = 0;
  this.currentTarget = this.targets[0];
};

MML.checkReady = function checkReady() {
  return _.every(state.MML.GM.combatants, function (character) {
    return character.ready;
  });
};

MML.displayThreatZones = function displayThreatZones(toggle) {
  _.each(state.MML.GM.combatants, function(character) {
    var token = MML.getCharacterToken(character);
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
  combatants.sort(function(a, b) { return b.initiative - a.initiative; });
  state.MML.GM.combatants = combatants;
  var turnorder = [];
  _.each(combatants, function (character) {
    turnorder.push({
      id: MML.getCharacterToken(character).id,
      pr: character.initiative,
      custom: ''
    });
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
      index: generateRowID(),
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

MML.parseCommand = function(msg) {
  if (msg.type === 'api' && msg.content.indexOf('!MML|') !== -1) {
    var player = MML.players[msg.who.replace(' (GM)', '')];
    player.buttonPressed(_.extend(player, {
      pressedButton: msg.content.replace('!MML|', ''),
      selectedCharNames: MML.getSelectedCharNames(msg.selected)
    }));
  }
};
