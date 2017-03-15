MML.startCombat = function(selectedCharNames) {
  var gm = state.MML.GM;
  gm.currentRound = 1;
  gm.combatants = selectedCharNames;

  if (gm.combatants.length > 0) {
    gm.inCombat = true;
    _.each(MML.players, function(player) { player.combatants = []; });
    _.each(gm.combatants, function(charName) {
      var character = MML.characters[charName];
      character.player.combatants.push(charName);
      character.setReady(false);
      character.setCombatVision();
    });
    MML.setTurnOrder();
    Campaign().set('initiativepage', 'true');
    MML.newRound();
  } else {
    sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
    gm.player.buttons = [gm.player.menuButtons.combatMenu];
    gm.player.menuCommand(gm.player.name, 'Combat');
  }
};

MML.newRound = function() {
  var gm = state.MML.GM;
  gm.currentRound++;
  gm.roundStarted = false;
  _.each(gm.combatants, function(charName) {
    MML.characters[charName].newRoundUpdateCharacter();
  });
  _.each(MML.players, function(player) {
    MML.players[player.name].newRoundUpdatePlayer();
  });
};

MML.startRound = function() {
  var gm = state.MML.GM;
  if (MML.checkReady()) {
    gm.roundStarted = true;

    _.each(gm.combatants, function(charName) {
      MML.characters[charName].movementAvailable = MML.characters[charName].movementRatio;
    });

    MML.nextAction();
  }
};

MML.endCombat = function() {
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

MML.nextAction = function() {
  var gm = state.MML.GM;
  MML.setTurnOrder();
  if (MML.checkReady()) {
    if (MML.characters[gm.combatants[0]].initiative > 0) {
      gm.actor = gm.combatants[0];
      var player = MML.characters[gm.actor].player;
      player.charMenuStartAction(gm.actor, MML.validateAction(MML.characters[gm.actor]));
      player.displayMenu();
    } else {
      MML.newRound();
    }
  }
};

MML.getRadiusSpellTargets = function(radius) {
  state.MML.GM.currentAction.parameters.spellMarker = 'spellMarkerCircle';
  var token = MML.getTokenFromChar(this.name);
  var graphic = createObj('graphic', {
       name: 'spellMarkerCircle',
       _pageid: token.get('_pageid'),
       layer: 'objects',
       left: token.get('left'),
       top: token.get('top'),
       width: MML.feetToPixels(radius*2),
       height: MML.feetToPixels(radius*2),
       imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/27869253/ixTcySIkxTEEsbospj4PpA/thumb.png?1485314508',
       controlledby: MML.getPlayerFromName(this.player.name).get('id')
     });
   toBack(graphic);

   this.player.charMenuPlaceSpellMarker(this.name);
   this.player.displayMenu();
};

MML.setTargets = function() {
  this.targets = this.characters[this.actor].action.targets;
  this.targetIndex = 0;
  this.currentTarget = this.targets[0];
};

MML.checkReady = function() {
  var everyoneReady = true;

  _.each(state.MML.GM.combatants, function(charName) {
    if (MML.characters[charName].ready === false) {
      everyoneReady = false;
    }
  });

  return everyoneReady;
};

MML.displayThreatZones = function(toggle) {
  _.each(state.MML.GM.combatants, function(combatant) {
    var character = MML.characters[combatant];
    var token = MML.getTokenFromChar(combatant);
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

// Turn Order Functions
MML.setTurnOrder = function() {
  var gm = state.MML.GM;
  var turnorder = [];

  var index;
  for (index in gm.combatants) {
    turnorder.push({
      id: MML.getTokenFromChar(gm.combatants[index]).id,
      pr: MML.characters[gm.combatants[index]].initiative,
      custom: ''
    });
  }

  turnorder.sort(function(a, b) {
    if (parseFloat(b.pr) === parseFloat(a.pr)) {
      if (a.custom !== '' && b.custom !== '') {
        return parseFloat(b.custom) - parseFloat(a.custom);
      } else {
        return 0;
      }
    } else {
      return parseFloat(b.pr) - parseFloat(a.pr);
    }
  });

  index = 0;
  for (index in gm.combatants) {
    //Orders the tokens based on initiative
    gm.combatants[index] = MML.getCharFromToken(getObj('graphic', turnorder[index].id));
  }

  Campaign().set('turnorder', JSON.stringify(turnorder));
};

MML.changeRoll = function(value) {
  var gm = state.MML.GM;
  var range = gm.currentRoll.range.split('-');
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);

  if (value >= low && value <= high) {
    if (gm.currentRoll.type === 'damage') {
      gm.currentRoll.value = -value;
      gm.currentRoll.message = 'Roll: ' + value + '\nRange: ' + gm.currentRoll.range;
    } else {
      gm.currentRoll.value = value;
      if (gm.currentRoll.type === 'universal') {
        gm.currentRoll = MML.universalRollResult(gm.currentRoll);
      } else if (gm.currentRoll.type === 'attribute') {
        gm.currentRoll = MML.attributeCheckResult(gm.currentRoll);
      } else if (gm.currentRoll.type === 'generic') {
        gm.currentRoll = MML.genericRollResult(gm.currentRoll);
      }
    }
  } else {
    sendChat('Error', 'New roll value out of range.');
  }
  MML.characters[gm.currentRoll.character][gm.currentRoll.callback]();
};

MML.assignNewItem = function(input) {
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

// var exampleCommand = {
//   type: 'player',
//   who: MML.players[playerName],
//   callback:'menuCommand',
//   input: {
//     rollResult: 'Success'
//   }
// };

MML.processCommand = function(command) {
  try {
    switch (command.type) {
      case 'character':
        var character = MML.characters[command.who];
        character[command.callback].apply(character, command.input);
        break;
      case 'player':
        var player = MML.players[command.who];
        player[command.callback].apply(player, command.input);
        break;
      case 'GM':
        MML[command.callback].apply(state.MML.GM, command.input);
        break;
      default:
        break;
    }
  } catch (error) {
    sendChat('', 'processCommand failed');
    // log(state.MML.GM);
    // log(MML.players);
    // log(MML.characters);
    log(command);
    log(error.message);
    log(error.stack);
  }
};

MML.parseCommand = function(msg) {
  var who;
  if (msg.type === 'api' && msg.content.indexOf('!MML|') !== -1) {
    var command = 'parse failed';
    var content = msg.content.replace('!MML|', '');
    who = msg.who.replace(' (GM)', '');
    var input;

    if (content.indexOf('selectTarget') !== -1) {
      var stringIn = content.replace('selectTarget ', '').split('|');
      var character = stringIn[0];
      var target = stringIn[1];
      var hexedInput = stringIn[2];

      input = MML.dehexify(hexedInput);

      try {
        input = JSON.parse(input);
      } catch (e) {
        command = 'selectTarget parse failed';
        sendChat('', command);
        log(stringIn);
        log(input);
        MML.error();
      }
      input.target = target;

      command = {
        type: 'player',
        who: who,
        callback: input.callback,
        input: input
      };
    } else if (content.indexOf('changeRoll') !== -1) {
      var value = parseInt(content.replace('changeRoll ', ''));

      if (!isNaN(value)) {
        command = {
          type: 'player',
          who: state.MML.GM.name,
          callback: 'changeRoll',
          input: {
            value: value
          }
        };
      } else {
        sendChat('Error', 'Please enter a numerical value.');
      }
    } else if (content.indexOf('acceptRoll') !== -1) {
      if (MML.players[who].currentRoll.accepted === false) {
        var player = MML.players[who];
        MML.players[player.name].currentRoll.accepted = true;

        command = {
          type: 'character',
          who: player.who,
          callback: player.currentRoll.callback,
          input: {}
        };
      }
    } else if (content.indexOf('displayItemOptions') !== -1) {
      input = content.replace('displayItemOptions ', '').split('|');
      var charName = input[0];
      var itemId = input[1];

      command = {
        type: 'player',
        who: who,
        callback: 'displayItemOptions',
        input: {
          who: charName,
          itemId: itemId
        }
      };
    } else {
      command = MML.dehexify(content);
      try {
        command = JSON.parse(command);
      } catch (e) {
        log(command);
        log(content);
        sendChat('Game', 'JSON parse failed');
      }

      command.input.push(MML.getSelectedCharNames(msg.selected));
    }
    if (state.MML.commandRecorder) {
      state.MML.commandArray.push(command);
    }
    MML.processCommand(command);
  }
};
