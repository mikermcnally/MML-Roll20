MML.startCombat = function(selectedCharNames) {
  this.currentRound = 1;
  this.combatants = selectedCharNames;

  if (this.combatants.length > 0) {
    this.inCombat = true;
    _.each(MML.players, function(player) { player.combatants = []; });
    _.each(this.combatants, function(charName) {
      var character = MML.characters[charName];
      MML.players[character.player].combatants.push(charName);
      character.setReady(false);
      character.setCombatVision();
    });
    MML.setTurnOrder();
    Campaign().set('initiativepage', 'true');
    MML.newRound();
  } else {
    sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
    this.player.buttons = [MML.menuButtons.combatMenu];
    this.player.menuCommand(this.player, 'Combat');
  }
};

MML.newRound = function() {
  this.currentRound++;
  this.roundStarted = false;
  _.each(this.combatants, function(charName) {
    MML.processCommand({
      type: 'character',
      who: charName,
      callback: 'newRoundUpdateCharacter',
      input: {}
    });
  });
  _.each(MML.players, function(player) {
    MML.processCommand({
      type: 'player',
      who: player.name,
      callback: 'newRoundUpdatePlayer',
      input: {
        who: player.who
      }
    });
  });
};

MML.startRound = function() {
  if (MML.checkReady()) {
    this.roundStarted = true;

    _.each(this.combatants, function(charName) {
      MML.processCommand({
        type: 'character',
        who: charName,
        callback: 'update',
        input: {
          attribute: 'initiativeRoll'
        }
      });
      MML.processCommand({
        type: 'character',
        who: charName,
        callback: 'setApiCharAttribute',
        input: {
          attribute: 'movementAvailable',
          value: MML.characters[charName].movementRatio
        }
      });
    });

    MML.processCommand({
      type: 'GM',
      callback: 'nextAction',
      input: {}
    });
  }
};

MML.endCombat = function() {
  if (this.combatants.length > 0) {
    _.each(this.combatants, function(charName) {
      MML.processCommand({
        type: 'character',
        who: charName,
        callback: 'setApiCharAttribute',
        input: {
          attribute: 'ready',
          value: true
        }
      });
      MML.processCommand({
        type: 'character',
        who: charName,
        callback: 'setCombatVision',
        input: {
          inCombat: false
        }
      });
    });
    this.inCombat = false;
    this.combatants = [];
    Campaign().set('initiativepage', 'false');
  }
};

MML.nextAction = function() {
  MML.processCommand({
    type: 'GM',
    callback: 'setTurnOrder',
    input: {}
  });

  if (MML.checkReady()) {
    if (MML.characters[this.combatants[0]].initiative > 0) {
      this.actor = this.combatants[0];
      var playerName = MML.characters[this.actor].player;

      MML.processCommand({
        type: 'player',
        who: playerName,
        callback: 'charMenuStartAction',
        input: {
          who: this.actor,
          actionValid: MML.validateAction(MML.characters[this.actor])
        }
      });
      MML.processCommand({
        type: 'player',
        who: playerName,
        callback: 'displayMenu',
        input: {}
      });
    } else {
      MML.processCommand({
        type: 'GM',
        callback: 'newRound',
        input: {}
      });
    }
  }
};

MML.getRadiusSpellTargets = function(input) {
  state.MML.GM.currentAction.parameters.spellMarker = 'spellMarkerCircle';
  var token = MML.getTokenFromChar(this.name);
  var graphic = createObj('graphic', {
       name: 'spellMarkerCircle',
       _pageid: token.get('_pageid'),
       layer: 'objects',
       left: token.get('left'),
       top: token.get('top'),
       width: MML.feetToPixels(input.radius*2),
       height: MML.feetToPixels(input.radius*2),
       imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/27869253/ixTcySIkxTEEsbospj4PpA/thumb.png?1485314508',
       controlledby: MML.getPlayerFromName(this.player).get('id')
     });
   toBack(graphic);

   MML.processCommand({
     type: 'player',
     who: this.player,
     callback: 'charMenuPlaceSpellMarker',
     input: { who: this.name }
   });
   MML.processCommand({
     type: 'player',
     who: this.player,
     callback: 'displayMenu',
     input: {}
   });
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

MML.displayThreatZones = function(input) {
  var toggle = input.toggle;
  _.each(this.combatants, function(combatant) {
    var character = MML.characters[combatant];
    var token = MML.getTokenFromChar(combatant);
    var radius1 = '';
    var radius2 = '';
    var color1 = '#FF0000';
    var color2 = '#FFFF00';
    if (toggle && !MML.isWieldingRangedWeapon(character) && !MML.isUnarmed(character)) {
      var weapon = MML.getMeleeWeapon(character);
      radius1 = MML.weaponRanks[weapon.rank].high;
      radius2 = MML.weaponRanks[weapon.rank + 1].high;
    }
    MML.displayAura(token, radius1, 1, color1);
    MML.displayAura(token, radius2, 2, color2);
  });
};

// Turn Order Functions
MML.setTurnOrder = function() {
  var turnorder = [];

  var index;
  for (index in this.combatants) {
    turnorder.push({
      id: MML.getTokenFromChar(this.combatants[index]).id,
      pr: MML.characters[this.combatants[index]].initiative,
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
  for (index in this.combatants) {
    //Orders the tokens based on initiative
    this.combatants[index] = MML.getCharFromToken(getObj('graphic', turnorder[index].id));
  }

  Campaign().set('turnorder', JSON.stringify(turnorder));
};

MML.changeRoll = function(input) {
  var value = input.value;
  var range = this.currentRoll.range.split('-');
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);
  log(this.currentRoll.callback);
  if (value >= low && value <= high) {
    if (this.currentRoll.type === 'damage') {
      this.currentRoll.value = -value;
      this.currentRoll.message = 'Roll: ' + value + '\nRange: ' + this.currentRoll.range;
    } else {
      this.currentRoll.value = value;
      if (this.currentRoll.type === 'universal') {
        this.currentRoll = MML.universalRollResult(this.currentRoll);
      } else if (this.currentRoll.type === 'attribute') {
        this.currentRoll = MML.attributeCheckResult(this.currentRoll);
      } else if (this.currentRoll.type === 'generic') {
        this.currentRoll = MML.genericRollResult(this.currentRoll);
      }
    }
  } else {
    sendChat('Error', 'New roll value out of range.');
  }
  MML.processCommand({
    type: 'character',
    who: this.currentRoll.character,
    callback: this.currentRoll.callback,
    input: {}
  });
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
          who: state.MML.GM.player,
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

      command.input.selectedCharNames = MML.getSelectedCharNames(msg.selected);
    }
    if (state.MML.commandRecorder) {
      state.MML.commandArray.push(command);
    }
    MML.processCommand(command);
  }
};
