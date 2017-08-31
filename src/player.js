MML.displayMenu = function displayMenu(player, menu) {
  var buttons = menu.buttons;
  var toChat = '/w "' + player.name + '" &{template:charMenu} {{name=' + menu.message + '}} ';

  // TODO: recursify this
  _.each(buttons, function(button) {
    var noSpace = button.replace(/\s+/g, '');
    toChat = toChat + '{{' + noSpace + '=[' + button + '](!MML|' + button + ')}} ';
  });
  sendChat(player.name, toChat, null, {
    noarchive: true
  }); //Change to true this when they fix the bug
};

MML.setMenuButtons = function setMenuButtons(player, buttons) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(player) {
      if (_.contains(buttons, player.pressedButton)) {
        resolve(player);
      }
    };
  });
};

MML.setRollButtons = function setRollButtons(player) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(player) {
      if (player.pressedButton === 'acceptRoll' || (player.pressedButton.indexOf('changeRoll') > -1 && player.name === state.MML.GM.name)) {
        resolve(player);
      }
    };
  });
};

MML.displayTargetSelection = function displayTargetSelection(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:selectTarget}');
};

MML.getSingleTarget = function getSingleTarget(player) {
  MML.displayTargetSelection();
  return MML.selectTarget(player);
};

MML.getSpellTargets = function getSpellTargets() {
  MML.displayTargetSelection({
    charName: this.name,
    callback: 'getAdditionalTarget'
  });
};


MML.getAdditionalTarget = function getAdditionalTarget(target) {
  var targetArray;

  if (_.isUndefined(state.MML.GM.currentAction.targetArray)) {
    state.MML.GM.currentAction.targetArray = [target];
    state.MML.GM.currentAction.targetIndex = 0;
  } else {
    state.MML.GM.currentAction.targetArray.push(target);
  }

  this.player.charMenuAddTarget(this.name);
  this.player.displayMenu();
};

MML.getRadiusSpellTargets = function getRadiusSpellTargets(radius) {
  state.MML.GM.currentAction.parameters.spellMarker = 'spellMarkerCircle';
  var token = MML.getCharacterToken(this);
  var graphic = createObj('graphic', {
    name: 'spellMarkerCircle',
    _pageid: token.get('_pageid'),
    layer: 'objects',
    left: token.get('left'),
    top: token.get('top'),
    width: MML.feetToPixels(radius * 2),
    height: MML.feetToPixels(radius * 2),
    imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/27869253/ixTcySIkxTEEsbospj4PpA/thumb.png?1485314508',
    controlledby: MML.getPlayerFromName(this.player.name).get('id')
  });
  toBack(graphic);

  this.player.charMenuPlaceSpellMarker(this.name);
  this.player.displayMenu();
};

MML.goToMenu = function goToMenu(player, menu) {
  MML.displayMenu(player, menu);
  return MML.setMenuButtons(player, menu.buttons);
};

MML.initializeMenu = function initializeMenu(player) {
  return MML.setMenuButtons(player, ['initializeMenu'])
    .then(function(player) {
      if (player.name === state.MML.GM.name) {
        return MML.GmMenuMain(player);
      }
    })
    .catch(log);
};

MML.GmMenuMain = function GmMenuMain(player) {
  var menu = {
    message: 'Main Menu: ',
    buttons: [
      'Combat',
      'Roll Dice'
    ]
  };

  return MML.goToMenu(player, menu)
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Combat':
          return MML.GmMenuCombat(player);
        case 'Roll Dice':
          return MML.selectDieSizeMenu(player);
      }
    });
};

MML.prepareAction = function prepareAction([player, character, action]) {
  return MML.goToMenu(player, MML.prepareActionMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
};

MML.prepareActionMenu = function prepareActionMenu(player, character, action) {
  return {
    message: 'Prepare ' + character.name + '\'s action',
    buttons: function() {
      var buttons = [
        'Movement Only',
        'Observe',
        'Ready Item',
        'Attack'
      ];

      if (!_.isUndefined(action.weapon) && MML.isRangedWeapon(action.weapon)) {
        if (action.weapon.family !== 'MWM' || action.weapon.loaded === action.weapon.reload) {
          buttons.push('Aim');
        } else {
          buttons.push('Reload');
        }
      }

      if ((_.has(character.statusEffects, 'Holding') ||
          (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1)) &&
        !_.has(character.statusEffects, 'Held') &&
        !_.contains(character.action.modifiers, 'Release Opponent')
      ) {
        buttons.push('Release Opponent');
      }

      if (character.spells.length > 0) {
        buttons.push('Cast');
      }

      if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
        buttons.push('Continue Casting');
      }
      return buttons;
    }()
  };
};

MML.prepareAttackAction = function prepareAttackAction([player, character, action]) {
  action.ts = Date.now();
  action.name = 'Attack';
  return MML.goToMenu(player, MML.prepareAttackActionMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    })
    .then(function([player, character, action]) {
      if (player.pressedButton === 'Shoot From Cover') {
        action.modifiers.push('Shoot From Cover');
      } else if (player.pressedButton !== 'Standard') {
        action.weaponType = player.pressedButton;
      }
      if (['Head Butt', 'Takedown', 'Grapple', 'Regain Feet', 'Place a Hold', 'Break a Hold', 'Break Grapple'].indexOf(player.pressedButton) !== -1) {
        return MML.chooseAttackStance([player, character, action]).then(MML.setAttackStance);
      } else {
        return MML.chooseCalledShot([player, character, action])
          .then(MML.setCalledShot)
          .then(MML.chooseAttackStance)
          .then(MML.setAttackStance);
      }
    })
    .then(function([player, character, action]) {
      if (!MML.isWieldingRangedWeapon(character)) {
        if (!MML.isUnarmed(character) && action.weapon.secondaryType !== '') {
          return MML.chooseDamageType([player, character, action]).then(MML.setDamageType);
        } else {
          if (!MML.isUnarmedAction(action)) {
            action.weaponType = 'primary';
          } else {
            action.weapon = MML.unarmedAttacks[action.weaponType];
          }
          return [player, character, action];
        }
      }
    });
};

MML.prepareAttackActionMenu = function prepareAttackActionMenu(player, character, action) {
  return {
    message: 'Attack Menu',
    buttons: function() {
      var buttons = [];
      var weapon = action.weapon;
      if (weapon !== 'unarmed' &&
        (weapon.family !== 'MWM' || weapon.loaded === weapon.reload) &&
        ((!_.has(character.statusEffects, 'Grappled') &&
            !_.has(character.statusEffects, 'Holding') &&
            !_.has(character.statusEffects, 'Held') &&
            !_.has(character.statusEffects, 'Taken Down') &&
            !_.has(character.statusEffects, 'Pinned') &&
            !_.has(character.statusEffects, 'Overborne')) ||
          (!MML.isRangedWeapon(weapon) && weapon.rank < 2))
      ) {
        buttons.push('Standard');
        if (MML.isRangedWeapon(weapon)) {
          buttons.push('Shoot From Cover');
        } //else if (!_.has(character.statusEffects, 'Grappled') &&
        //   !_.has(character.statusEffects, 'Holding') &&
        //   !_.has(character.statusEffects, 'Held') &&
        //   !_.has(character.statusEffects, 'Taken Down') &&
        //   !_.has(character.statusEffects, 'Pinned') &&
        //   !_.has(character.statusEffects, 'Overborne')
        // ) {
        //   buttons.push({
        //     text: 'Sweep Attack',
        //     nextMenu: 'chooseCalledShot',
        //     callback: function() {
        //       character.action.modifiers.push('Sweep Attack');
        //       MML.displayMenu(player);
        //     }
        //   });
        // }
      }

      buttons.push('Punch');
      buttons.push('Kick');
      if (!_.contains(character.action.modifiers, 'Release Opponent')) {
        if (!_.has(character.statusEffects, 'Grappled') &&
          !_.has(character.statusEffects, 'Holding') &&
          !_.has(character.statusEffects, 'Held') &&
          !_.has(character.statusEffects, 'Taken Down') &&
          !_.has(character.statusEffects, 'Pinned') &&
          !_.has(character.statusEffects, 'Overborne')
        ) {
          buttons.push('Grapple');
          // character.action.weaponType = 'Grapple';
        }
        if (((_.has(character.statusEffects, 'Grappled') || _.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Holding')) &&
            character.movementPosition === 'Prone') ||
          ((_.has(character.statusEffects, 'Taken Down') || _.has(character.statusEffects, 'Overborne')) && !_.has(character.statusEffects, 'Pinned'))
        ) {
          buttons.push('Regain Feet');
        }
        if (!_.has(character.statusEffects, 'Holding') &&
          !_.has(character.statusEffects, 'Held') &&
          !_.has(character.statusEffects, 'Pinned') &&
          (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
        ) {
          buttons.push('Place a Hold');
        }
        if (_.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Pinned')) {
          buttons.push('Break a Hold');
        }
        if ((_.has(character.statusEffects, 'Grappled')) &&
          !_.has(character.statusEffects, 'Pinned') &&
          !_.has(character.statusEffects, 'Held')
        ) {
          buttons.push('Break Grapple');
        }
        if ((_.has(character.statusEffects, 'Holding') ||
            (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1) ||
            (_.has(character.statusEffects, 'Held') && character.statusEffects['Held'].targets.length === 1)) &&
          !(_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) &&
          character.movementPosition !== 'Prone'
        ) {
          buttons.push('Takedown');
        }
        if (_.has(character.statusEffects, 'Held') ||
          _.has(character.statusEffects, 'Grappled') ||
          _.has(character.statusEffects, 'Holding') ||
          _.has(character.statusEffects, 'Taken Down') ||
          _.has(character.statusEffects, 'Pinned') ||
          _.has(character.statusEffects, 'Overborne')
        ) {
          if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) {
              return target.bodyPart === 'Head';
            }).length === 0) {
            buttons.push('Head Butt');
          }
          buttons.push('Bite');
        }
      }
      return buttons;
    }()
  };
};

MML.chooseCalledShot = function chooseCalledShot([player, character, action]) {
  return MML.goToMenu(player, {
      message: 'Choose Called Shot',
      buttons: ['None', 'Body Part', 'Specific Hit Position']
    })
    .then(function(player) {
      return [player, character, action];
    });
};

MML.setCalledShot = function setCalledShot([player, character, action]) {
  switch (player.pressedButton) {
    case 'Called Shot':
      action.modifiers.push('Called Shot');
      break;
    case 'Called Shot Specific':
      action.modifiers.push('Called Shot Specific');
      break;
    default:
      break;
  }
  return [player, character, action];
};

MML.chooseAttackStance = function chooseAttackStance([player, character, action]) {
  return MML.goToMenu(player, {
      message: 'Choose Attack Stance',
      buttons: ['Neutral', 'Defensive', 'Aggressive']
    })
    .then(function(player) {
      return [player, character, action];
    });
};

MML.setAttackStance = function setAttackStance([player, character, action]) {
  switch (player.pressedButton) {
    case 'Defensive':
      action.modifiers.push('Defensive Stance');
      break;
    case 'Neutral':
      break;
    case 'Aggressive':
      action.modifiers.push('Aggressive Stance');
      break;
  }
  return [player, character, action];
};

MML.chooseDamageType = function chooseDamageType([player, character, action]) {
  return [MML.goToMenu(player, {
    message: 'Choose a Damage Type',
    buttons: ['Neutral', 'Defensive', 'Aggressive']
  }), character, action];
};

MML.setDamageType = function setDamageType([player, character, action]) {
  if (player.pressedButton === 'Secondary') {
    action.weaponType = 'secondary';
  } else {
    action.weaponType = 'primary';
  }
  return [player, character, action];
};

MML.chooseMeleeDefense = function chooseMeleeDefense(player, character, dodgeChance, blockChance, attackerWeapon) {
  return MML.goToMenu(player, MML.chooseMeleeDefenseMenu(character, dodgeChance, blockChance, attackerWeapon))
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Block: ' + blockChance + '%':
          character.statusEffects['Melee this Round'] = {
            id: generateRowID(),
            name: 'Melee this Round'
          };
          return MML.displayRoll(player, MML.universalRoll('meleeBlock', [blockChance]));
        case 'Dodge: ' + dodgeChance + '%':
          character.statusEffects['Melee this Round'] = {
            id: generateRowID(),
            name: 'Melee this Round'
          };
          return MML.displayRoll(player, MML.universalRoll('meleeBlock', [dodgeChance]));
        case 'Take it':
          return [player, {
            result: 'Failure'
          }];
      }
    });
};

MML.chooseMeleeDefenseMenu = function chooseMeleeDefenseMenu(character, dodgeChance, blockChance, attackerWeapon) {
  var message = 'How will ' + character.name + ' defend?';
  var buttons = ['Dodge: ' + dodgeChance + '%', 'Take it'];
  if (!MML.isUnarmed(character) || attackerWeapon.family === "Unarmed") {
    buttons.unshift('Block: ' + blockChance + '%');
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.displayRoll = function displayRoll(player, roll) {
  if (player.name === state.MML.GM.name) {
    MML.displayGmRoll(player, roll);
  } else {
    MML.displayPlayerRoll(player, roll);
  }
  return MML.setRollButtons(player)
    .then(function(player) {
      if (player.pressedButton === 'acceptRoll') {
        return [player, roll];
      } else {
        return MML.displayRoll(player, MML.changeRoll(player, roll, player.pressedButton.replace('changeRoll ', '')));
      }
    });
};

MML.displayGmRoll = function displayGmRoll(player, roll) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + roll.message + "}}");
};

MML.displayPlayerRoll = function displayPlayerRoll(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + roll.message + "}}");
};

MML.changeRoll = function changeRoll(player, roll, valueString) {
  var value = parseInt(valueString);
  var range = roll.range.split('-');
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);

  if (isNaN(value)) {
    sendChat('Error', 'Roll value must be numerical.');
    return roll;
  } else {
    if (roll.type === 'universal' || roll.type === 'attribute') {
      if (value >= low && value <= high) {
        roll.value = value;
        if (roll.type === 'universal') {
          roll = MML.universalRollResult(roll);
        } else {
          roll = MML.attributeCheckResult(roll);
        }
      } else {
        sendChat('Error', 'New roll value out of range.');
      }
    } else {
      if (value + roll.modifier >= low && value + roll.modifier <= high) {
        roll.value = value;
        if (roll.type === 'damage') {
          roll = MML.damageRollResult(roll);
        } else if (roll.type === 'generic') {
          roll = MML.genericRollResult(roll);
        } else {
          roll.result = value;
        }
      } else {
        sendChat('Error', 'New roll value out of range.');
      }
    }
    return roll;
  }
};

MML.enterNumberOfDice = function enterNumberOfDice(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:enterNumberOfDiceMenu} {{title=Enter Number of Dice}}');
};

MML.setApiPlayerAttribute = function setApiPlayerAttribute(player, attribute, value) {
  player[attribute] = value;
};

MML.prepareCharacters = function prepareCharacters(player) {
  MML.prepareNextCharacter(player, 0);
};

MML.prepareNextCharacter = function prepareNextCharacter(player, index) {
  if (index < player.combatants.length) {
    MML.buildAction(player, player.combatants[index])
      .then(function(player) {
        MML.prepareNextCharacter(player, index + 1);
      }).catch(log);
  } else if (player.name === state.MML.GM.name) {
    MML.startRound(player);
  }
};

MML.menuIdle = function menuIdle(player, who) {
  player.who = who;
  player.message = 'Menu Closed';
  player.buttons = [];
  if (state.MML.GM.name === player.name && !state.MML.GM.inCombat) {
    player.menu = 'GmMenuMain';
    player.buttons = [player.menuButtons.GmMenuMain];
  }
};

MML.menuPause = function menuPause(player) {};

MML.GmMenuAssignStatusEffect = function GmMenuAssignStatusEffect(player, who) {
  player.who = who;
  player.message = 'Choose a Status Effect: ';
  player.buttons = [];

  _.each(MML.statusEffects, function(effect, effectName) {
    player.buttons.push({
      text: effectName,
      nextMenu: 'GmMenuItemQuality',
      callback: function(text) {
        state.MML.GM.newItem = MML.items[text];
        MML.displayMenu(player);
      }
    });
  });
};

MML.selectDieSizeMenu = function selectDieSizeMenu(player, who) {
  player.who = who;
  player.message = 'Choose a Status Effect: ';
  player.buttons = [];

  player.buttons.push({
    text: '2',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      player.dice = '2';
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '3',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '4',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '6',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      player.dice = '6';
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '8',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '10',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '12',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '20',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '100',
    nextMenu: 'selectDieNumberMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
};

MML.selectDieSizeMenu = function selectDieSizeMenu(player) {
  MML.enterNumberOfDice(player);
};

MML.customRoll = function customRoll(numberOfDice) {
  sendChat(player.name, '/w "' + player.name + 'Result: ' + rollDice(player.dice, numberOfDice));
};

MML.GmMenuCombat = function GmMenuCombat(player) {
  var menu = {
    message: 'Select tokens and begin.',
    buttons: [
      'Start Combat',
      'Back'
    ]
  };

  return MML.goToMenu(player, menu)
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Start Combat':
          return MML.startCombat(player);
        case 'Back':
          return MML.GmMenuMain(player);
      }
    });
};

MML.GmMenuNewItem = function GmMenuNewItem(player, who) {
  player.who = who;
  player.message = 'Select item type:';
  player.buttons = [player.menuButtons.newWeapon,
    player.menuButtons.newShield,
    player.menuButtons.newArmor,
    player.menuButtons.newSpellComponent,
    player.menuButtons.newMiscItem,
    player.menuButtons.toMainGmMenu
  ];
};

MML.GmMenuNewWeapon = function GmMenuNewWeapon(player, who) {
  player.who = who;
  player.message = 'Select weapon type:';
  player.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === 'weapon') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'GmMenuItemQuality',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};
MML.GmMenuNewShield = function GmMenuNewShield(player, who) {
  player.who = who;
  player.message = 'Select shield type:';
  player.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === 'shield') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'GmMenuItemQuality',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};
MML.GmMenuNewArmor = function GmMenuNewArmor(player, who) {
  player.who = who;
  player.message = 'Select armor style:';
  player.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === 'armor') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'GmMenuArmorMaterial',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};
MML.GmMenuArmorMaterial = function GmMenuArmorMaterial(player, who) {
  player.who = who;
  player.message = 'Select armor material:';
  player.buttons = [];

  _.each(MML.APVList, function(material) {
    player.buttons.push({
      text: material.name,
      nextMenu: 'GmMenuItemQuality',
      callback: function(text) {
        var material = MML.APVList[text];
        state.MML.GM.newItem.material = material.name;
        state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
        state.MML.GM.newItem.name = material.name + ' ' + state.MML.GM.newItem.name;
        MML.displayMenu(player);
      }
    });
  }, player);
};
MML.GmMenuNewItemProperties = function GmMenuNewItemProperties(player, who) {
  player.who = who;
  player.message = 'Add new properties:';
  player.buttons = [player.menuButtons.assignNewItem];
};
MML.GmMenuassignNewItem = function GmMenuassignNewItem(player, who) {
  player.who = who;
  player.message = 'Select character:';
  player.buttons = [];

  _.each(MML.characters, function(character) {
    player.buttons.push({
      text: index,
      nextMenu: 'GmMenuMain',
      callback: function() {
        MML.displayMenu(player);
      }
    });
  }, player);
};
MML.GmMenuItemQuality = function GmMenuItemQuality(player, who) {
  player.who = who;
  player.message = 'Select a quality level:';
  player.buttons = [player.menuButtons.itemQualityPoor,
    player.menuButtons.itemQualityStandard,
    player.menuButtons.itemQualityExcellent,
    player.menuButtons.itemQualityMasterWork
  ];
};
MML.displayItemOptions = function displayItemOptions(player, who, itemId) {
  var character = MML.characters[who];
  var item = character.inventory[itemId];
  var buttons = [];
  var unequipButton;
  var hands;
  player.menu = 'menuIdle';
  player.message = 'Item Menu';
  player.who = who;

  if (item.type === 'weapon') {
    //Weapon already equipped
    if (character.leftHand._id === itemId || character.rightHand._id === itemId) {
      unequipButton = {
        text: 'Unequip',
        nextMenu: 'menuIdle'
      };

      if (character.leftHand._id === itemId && character.rightHand._id === itemId) {
        unequipButton.callback = function() {
          character.leftHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          character.rightHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.displayMenu(player);
        };
      } else if (character.leftHand._id === itemId) {
        unequipButton.callback = function() {
          character.leftHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.displayMenu(player);
        };
      } else {
        unequipButton.callback = function() {
          character.rightHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.displayMenu(player);
        };
      }
      buttons.push(unequipButton);
    } else {
      _.each(item.grips, function(grip, gripName) {
        if (gripName === 'One Hand') {
          buttons.push({
            text: 'Equip Left Hand',
            nextMenu: 'menuIdle',
            callback: function(text) {
              character.leftHand = {
                _id: itemId,
                grip: gripName
              };
              MML.displayMenu(player);
            }
          });
          buttons.push({
            text: 'Equip Right Hand',
            nextMenu: 'menuIdle',
            callback: function(text) {
              character.rightHand = {
                _id: itemId,
                grip: gripName
              };
              MML.displayMenu(player);
            }
          });
        } else {
          buttons.push({
            text: 'Equip ' + gripName,
            nextMenu: 'menuIdle',
            callback: function(text) {
              character.leftHand = {
                _id: itemId,
                grip: gripName
              };
              character.rightHand = {
                _id: itemId,
                grip: gripName
              };
              MML.displayMenu(player);
            }
          });
        }
      });
    }
  } else if (item.type === 'armor') {
    log(item.type);
  } else if (item.type === 'shield') {
    buttons.push({
      text: 'Equip Left Hand',
      nextMenu: 'menuIdle',
      callback: function(text) {
        character.leftHand = {
          _id: itemId,
          grip: 'One Hand'
        };
        MML.displayMenu(player);
      }
    });
    buttons.push({
      text: 'Equip Right Hand',
      nextMenu: 'menuIdle',
      callback: function(text) {
        character.rightHand = {
          _id: itemId,
          grip: 'One Hand'
        };
        MML.displayMenu(player);
      }
    });
  } else if (item.type === 'spellComponent') {
    log(item.type);
  } else {
    log(item.type);
  }

  buttons.push({
    text: 'Exit',
    nextMenu: 'menuIdle',
    callback: function(text) {
      MML.displayMenu(player);
    }
  });

  player.buttons = buttons;
  MML.displayMenu(player);
};

MML.startRound = function startRound(player) {
  return MML.goToMenu(player, {
      message: 'Start round when all characters are ready.',
      buttons: ['Start Round', 'End Combat']
    })
    .then(function() {
      var gm = state.MML.GM;

      if (MML.checkReady()) {
        gm.roundStarted = true;
        _.each(gm.combatants, function(character) {
          character.movementAvailable = character.movementRatio;
        });
        MML.nextAction();
      }
    });
};

MML.charMenuCast = function charMenuCast(player, who) {
  player.who = who;
  player.message = 'Choose a spell';
  player.buttons = [];
  var character = MML.characters[who];
  _.each(character.spells, function(spellName) {
    if (_.isUndefined(MML.spells[spellName].requiredItem) ||
      (_.isUndefined(character.action.items) &&
        (character.inventory[character.rightHand._id].name === MML.spells[spellName].requiredItem || character.inventory[character.leftHand._id].name === MML.spells[spellName].requiredItem)) ||
      (!_.isUndefined(character.action.items) &&
        _.filter(character.action.items, function(item) {
          return character.inventory[item.itemId].name === MML.spells[spellName].requiredItem;
        }, character).length > 0)
    ) {
      player.buttons.push({
        text: spellName,
        nextMenu: 'menuPause',
        callback: function() {
          _.extend(character.action, {
            spell: MML.spells[spellName],
          });
          MML.charMenuMetaMagicInitiative(player, who);
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};
MML.charMenuMetaMagicInitiative = function charMenuMetaMagicInitiative(player, who) {
  player.who = who;
  player.message = 'Choose meta magic';
  player.buttons = [];
  var character = MML.characters[who];

  if (_.contains(character.action.spell.metaMagic, 'Called Shot')) {
    player.buttons.push({
      text: 'Called Shot',
      nextMenu: 'menuPause',
      callback: function() {
        if (_.contains(character.action.modifiers, 'Called Shot')) {
          character.action.modifiers = _.without(character.action.modifiers, 'Called Shot');
        } else {
          character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
          character.action.modifiers.push('Called Shot');
        }
        MML.charMenuMetaMagicInitiative(player, who);
        MML.displayMenu(player);
      }
    });
    player.buttons.push({
      text: 'Called Shot Specific',
      nextMenu: 'menuPause',
      callback: function() {
        if (_.contains(character.action.modifiers, 'Called Shot Specific')) {
          character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
        } else {
          character.action.modifiers = _.without(character.action.modifiers, 'Called Shot');
          character.action.modifiers.push('Called Shot Specific');
        }
        MML.charMenuMetaMagicInitiative(player, who);
        MML.displayMenu(player);
      }
    });
  }
  player.buttons.push({
    text: 'Ease Spell',
    nextMenu: 'menuPause',
    callback: function() {
      if (_.contains(character.action.modifiers, 'Ease Spell')) {
        character.action.modifiers = _.without(character.action.modifiers, 'Ease Spell');
      } else {
        character.action.modifiers = _.without(character.action.modifiers, 'Hasten Spell');
        character.action.modifiers.push('Ease Spell');
      }
      MML.charMenuMetaMagicInitiative(player, who);
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: 'Hasten Spell',
    nextMenu: 'menuPause',
    callback: function() {
      if (_.contains(character.action.modifiers, 'Hasten Spell')) {
        character.action.modifiers = _.without(character.action.modifiers, 'Hasten Spell');
      } else {
        character.action.modifiers = _.without(character.action.modifiers, 'Ease Spell');
        character.action.modifiers.push('Hasten Spell');
      }
      MML.charMenuMetaMagicInitiative(player, who);
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: 'Next Menu',
    nextMenu: 'finalizeActionMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
};
MML.charMenuMetaMagic = function charMenuMetaMagic(player, who) {
  player.who = who;
  player.message = 'Choose meta magic';
  player.buttons = [];
  var character = MML.characters[who];

  _.each(_.without(character.action.spell.metaMagic, 'Called Shot', 'Called Shot Specific'), function(metaMagicName) {
    player.buttons.push({
      text: metaMagicName,
      nextMenu: 'menuPause',
      callback: function(input) {
        if (_.contains(character.action.modifiers, metaMagicName)) {
          delete state.MML.GM.currentAction.metaMagic[metaMagicName];
          MML.charMenuMetaMagic(player, who);
        } else {
          player['charMenu' + metaMagicName.replace(/\s/g, '')](who);
        }
        MML.displayMenu(player);
      }
    });
  }, player);
  player.buttons.push({
    text: 'Cast Spell',
    nextMenu: 'menuPause',
    callback: function() {
      character.chooseSpellTargets();
    }
  });
};
MML.charMenuAddTarget = function charMenuAddTarget(player, who) {
  player.who = who;
  player.buttons = [];
  var character = MML.characters[who];
  state.MML.GM.currentAction.parameters.metaMagic['Increase Targets'] = {
    epMod: state.MML.GM.currentAction.targetArray.length,
    castingMod: -10 * state.MML.GM.currentAction.targetArray.length
  };
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  player.message = 'Current EP Cost: ' + epProduct + '\nAdd another target or cast spell:';

  if (character.ep > epProduct) {
    player.buttons.push({
      text: 'Add Target',
      nextMenu: 'menuPause',
      callback: function() {
        character.chooseSpellTargets();
      }
    });
  }
  player.buttons.push({
    text: 'Cast Spell',
    nextMenu: 'menuPause',
    callback: function() {
      character[character.action.callback]();
    }
  });
};
MML.charMenuIncreasePotency = function charMenuIncreasePotency(player, who) {
  player.who = who;
  player.message = 'Increase potency by how many times?';
  player.buttons = [];
  var character = MML.characters[who];
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > Math.pow(2, i - 1) * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + Math.pow(2, i - 1) * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Potency'] = {
          epMod: Math.pow(2, i - 1),
          castingMod: -10,
          level: i
        };
        MML.charMenuMetaMagic(player, who);
        MML.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      MML.charMenuMetaMagic(player, who);
      MML.displayMenu(player);
    }
  });
};
MML.charMenuIncreaseDuration = function charMenuIncreaseDuration(player, who) {
  player.who = who;
  player.message = 'Increase duration by how many times?';
  player.buttons = [];
  var character = MML.characters[who];
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > i * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + i * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Duration'] = {
          epMod: i,
          castingMod: 0,
          level: i
        };
        MML.charMenuMetaMagic(player, who);
        MML.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      MML.charMenuMetaMagic(player, who);
      MML.displayMenu(player);
    }
  });
};

MML.charMenuReadyItem = function charMenuReadyItem(player, character) {
  player.message = 'Choose item or items for ' + character.name;
  var buttons = [];

  _.each(character.inventory, function(item, _id) {
    if (['weapon', 'spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 &&
      character.rightHand._id !== _id &&
      character.leftHand._id !== _id
    ) {
      buttons.push({
        text: item.name,
        nextMenu: 'menuPause',
        callback: function() {
          MML.charMenuChooseHands(player, who, item, _id);
          MML.displayMenu(player);
        }
      });
    }
  });
  buttons.push({
    text: 'Back',
    nextMenu: 'prepareActionMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons = buttons;

  var weapon = _.find(character.action.items, function(item) {
    return character.inventory[item.itemId].type === 'weapon';
  });
  if (_.isUndefined(weapon)) {
    character.action.weapon = 'unarmed';
  } else {
    if (weapon.grip === 'Right' || weapon.grip === 'Left') {
      character.action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], 'One Hand');
    } else {
      character.action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], weapon.grip);
    }
  }
};
MML.charMenuChooseHands = function charMenuChooseHands(player, who, item, itemId) {
  player.who = who;
  player.message = 'Choose item or items for' + who;
  var buttons = [];
  var character = MML.characters[who];

  if (['spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 ||
    (item.type === 'weapon' && _.has(item.grips, 'One Hand'))
  ) {
    buttons.push({
      text: 'Left',
      nextMenu: 'charMenuReadyAdditionalItem',
      callback: function() {
        character.action.items = [{
          itemId: itemId,
          grip: 'Left'
        }];
        MML.charMenuReadyAdditionalItem(player, who, 'Right', itemId);
        MML.displayMenu(player);
      }
    });
    buttons.push({
      text: 'Right',
      nextMenu: 'charMenuReadyAdditionalItem',
      callback: function() {
        character.action.items = [{
          itemId: itemId,
          grip: 'Right'
        }];
        MML.charMenuReadyAdditionalItem(player, who, 'Left', itemId);
        MML.displayMenu(player);
      }
    });
  }
  if (item.type === 'weapon') {
    _.each(item.grips, function(grip, name) {
      if (name !== 'One Hand') {
        buttons.push({
          text: name,
          nextMenu: 'menuIdle',
          callback: function() {
            character.action.items = [{
              itemId: itemId,
              grip: name
            }];
            MML.prepareActionMenu(player, who);
            MML.displayMenu(player);
          }
        });
      }
    });
  }
  player.buttons = buttons;
};
MML.charMenuReadyAdditionalItem = function charMenuReadyAdditionalItem(player, who, hand, previousItemId) {
  player.who = who;
  player.message = 'Choose another item or finalize action for ' + player.who;
  var buttons = [];
  var character = MML.characters[who];

  _.each(character.inventory, function(item, _id) {
    if (['weapon', 'spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 &&
      character.rightHand._id !== _id &&
      character.leftHand._id !== _id &&
      previousItemId !== _id
    ) {
      buttons.push({
        text: item.name,
        nextMenu: 'menuIdle',
        callback: function() {
          character.action.items.push({
            itemId: _id,
            grip: hand
          });
          MML.prepareActionMenu(player, who);
          MML.displayMenu(player);
        }
      });
    }
  });

  buttons.push({
    text: 'Next Menu',
    nextMenu: 'prepareActionMenu',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons = buttons;
};

MML.finalizeAction = function finalizeAction([player, character, action]) {
  return MML.goToMenu(player, MML.finalizeActionMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
};

MML.finalizeActionMenu = function finalizeActionMenu(player, character, action) {
  var message;
  var buttons;
  if (state.MML.GM.roundStarted === true) {
    message = 'Accept or change action for ' + character.name;
    buttons = [
      'Accept',
      'Edit Action'
    ];
  } else if (_.has(character.statusEffects, 'Stunned')) {
    message = character.name + ' is stunned and can only move. Roll initiative';
    buttons = [
      'Roll'
    ];
  } else {
    message = 'Roll initiative or change action for ' + character.name;
    buttons = [
      'Roll',
      'Edit Action'
    ];
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.startAction = function startAction(player, character, validAction) {
  return MML.goToMenu(player, MML.startActionMenu(player, character, validAction))
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Start Action':
          return MML.combatMovement(player, character)
            .then(function ([player, character]) {

              return MML.processAction(player, character);
            });
        case 'Change Action':
          return MML.buildAction(player, character)
            .then(function(player) {
              return MML.processAction(player, character);
            });
      }
    });
};

MML.startActionMenu = function startActionMenu(player, character, validAction) {
  var message;
  var buttons;
  if (_.has(character.statusEffects, 'Stunned') || _.has(character.statusEffects, 'Dodged player Round')) {
    message = 'Start ' + character.name + '\'s action';
    buttons = ['Start Action'];
  } else if (validAction) {
    message = 'Start or change ' + character.name + '\'s action';
    buttons = ['Start Action', 'Change Action'];
  } else {
    message = character.name + '\'s action no longer valid.';
    buttons = ['Change Action'];
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.combatMovement = function combatMovement(player, character) {
  MML.displayThreatZones(true);
  return MML.goToMenu(player, MML.combatMovementMenu(player, character))
    .then(function(player) {
      character.movementPosition = player.pressedButton;
      MML.displayMovement(character);
      return [player, character];
    });
};

MML.combatMovementMenu = function combatMovementMenu(player, character) {
  var message = 'Move ' + character.name + '.';
  var buttons = ['Prone', 'Stalk', 'Crawl', 'Walk', 'Jog', 'Run', 'Movement'];
  return {
    message: message,
    buttons: buttons
  };
};

MML.charMenuPlaceSpellMarker = function charMenuPlaceSpellMarker(player, who) {
  player.who = who;
  player.message = 'Move and resize spell marker.';
  player.buttons = [{
    text: 'Accept',
    nextMenu: 'menuPause',
    callback: function() {
      var spellMarker = MML.getSpellMarkerToken(state.MML.GM.currentAction.parameters.spellMarker);
      var targets = MML.getAoESpellTargets(spellMarker);
      var character = MML.characters[who];
      _.each(MML.characters, function(character) {
        var token = MML.getCharacterToken(character.name);
        if (!_.isUndefined(token)) {
          token.set('tint_color', 'transparent');
        }
      });
      spellMarker.remove();
      MML.setCurrentCharacterTargets(player, {
        targets: targets
      });
      character[character.action.callback]();
    }
  }];
};
MML.charMenuSelectBodyPart = function charMenuSelectBodyPart(player, who) {
  player.who = who;
  player.message = 'Choose a Body Part.';
  player.buttons = [];

  var bodyParts = MML.getBodyParts(MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

  _.each(bodyParts, function(part) {
    player.buttons.push({
      text: part,
      nextMenu: 'menuIdle',
      callback: function(text) {
        state.MML.GM.currentAction.calledShot = text;
        MML.characters[player.who].processAttack();
      }
    });
  }, player);
};
MML.charMenuSelectHitPosition = function charMenuSelectHitPosition(player, who) {
  player.who = who;
  player.message = 'Choose a Hit Position.';
  player.buttons = [];

  var hitPositions = MML.getHitPositionNames(MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

  _.each(hitPositions, function(position) {
    player.buttons.push({
      text: position,
      nextMenu: 'menuIdle',
      callback: function(text) {
        state.MML.GM.currentAction.calledShot = text;
        MML.characters[player.who].processAttack();
      }
    });
  }, player);
};

MML.charMenuAttackRoll = function charMenuAttackRoll(player, who) {
  player.who = who;
  player.message = 'Roll Attack.';
  player.buttons = [player.menuButtons.rollDice];
};

MML.charMenuRangedDefenseRoll = function charMenuRangedDefenseRoll(player, who, defenseChance) {
  var character = MML.characters[who];
  player.who = who;
  player.message = 'How will ' + who + ' defend?';
  player.buttons = [{
    text: 'Defend: ' + defenseChance + '%',
    nextMenu: 'menuIdle',
    callback: function() {
      character.statusEffects['Melee player Round'] = {
        id: generateRowID(),
        name: 'Melee player Round'
      };
      character.rangedDefenseRoll(defenseChance);
    }
  }, {
    text: 'Take it',
    nextMenu: 'menuIdle',
    callback: function() {
      character.forgoDefense('defenseRoll');
    }
  }];
};
MML.charMenuGrappleDefenseRoll = function charMenuGrappleDefenseRoll(player, who, brawlChance, attackChance) {
  var character = MML.characters[who];
  player.who = who;
  player.message = 'How will ' + who + ' defend?';
  var buttons = [];

  if (!_.isUndefined(attackChance)) {
    buttons.push({
      text: 'With Weapon: ' + attackChance + '%',
      nextMenu: 'menuIdle',
      callback: function() {
        character.grappleDefenseWeaponRoll(attackChance);
      }
    });
  }
  buttons.push({
    text: 'Brawl: ' + brawlChance + '%',
    nextMenu: 'menuIdle',
    callback: function() {
      character.grappleDefenseBrawlRoll(brawlChance);
    }
  });
  buttons.push({
    text: 'Take it',
    nextMenu: 'menuIdle',
    callback: function() {
      character.forgoDefense(brawlDefenseRoll);
    }
  });
  player.buttons = buttons;
};
MML.charMenuResistRelease = function charMenuResistRelease(player, who, attacker) {
  player.who = who;
  player.message = 'Allow ' + attacker.name + ' to release grapple?';

  var buttons = [{
    text: 'Yes',
    nextMenu: 'menuIdle',
    callback: function() {
      state.MML.GM.currentAction.parameters.targetAgreed = true;
      MML.releaseOpponentAction();
    }
  }, {
    text: 'No',
    nextMenu: 'menuIdle',
    callback: function() {
      state.MML.GM.currentAction.parameters.targetAgreed = false;
      MML.releaseOpponentAction();
    }
  }];
  player.buttons = buttons;
};
MML.charMenuMajorWoundRoll = function charMenuMajorWoundRoll(player, who) {
  player.who = who;
  player.message = 'Major Wound Roll.';
  player.buttons = [{
    text: 'Roll Willpower',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[player.who].majorWoundRoll();
    }
  }];
};
MML.charMenuDisablingWoundRoll = function charMenuDisablingWoundRoll(player, who) {
  player.who = who;
  player.message = 'Disabling Wound Roll.';
  player.buttons = [{
    text: 'Roll System Strength',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[player.who].disablingWoundRoll();
    }
  }];
};
MML.charMenuWoundFatigueRoll = function charMenuWoundFatigueRoll(player, who) {
  player.who = who;
  player.message = 'Wound Fatigue Roll.';
  player.buttons = [{
    text: 'Roll System Strength',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[player.who].multiWoundRoll();
    }
  }];
};
MML.charMenuSensitiveAreaRoll = function charMenuSensitiveAreaRoll(player, who) {
  player.who = who;
  player.message = 'Sensitive Area Roll.';
  player.buttons = [{
    text: 'Roll Willpower',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[player.who].sensitiveAreaRoll();
    }
  }];
};
MML.charMenuKnockdownRoll = function charMenuKnockdownRoll(player, who) {
  player.who = who;
  player.message = 'Knockdown Roll.';
  player.buttons = [{
    text: 'Roll System Strength',
    nextMenu: 'menuIdle',
    callback: function() {
      MMML.characters[player.who].knockdownRoll();
    }
  }];
};
MML.charMenuFatigueCheckRoll = function charMenuFatigueCheckRoll(player, who) {
  player.who = who;
  player.message = 'Fatigue Roll.';
  player.buttons = [{
    text: 'Roll Fitness',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[player.who].fatigueCheckRoll();
    }
  }];
};
MML.charMenuFatigueRecoveryRoll = function charMenuFatigueRecoveryRoll(player, who) {
  player.who = who;
  player.message = 'Fatigue Recovery Roll.';
  player.buttons = [{
    text: 'Roll Health',
    nextMenu: 'menuIdle',
    callback: function(input) {
      MML.characters[player.who].fatigueRecoveryRoll();
    }
  }];
};
MML.charMenuholdAimRoll = function charMenuholdAimRoll(player, who) {
  player.who = who;
  player.message = 'Aim Hold Roll.';
  player.buttons = [{
    text: 'Roll Strength',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[who].holdAimRoll();
    }
  }];
};
MML.charMenuGenericRoll = function charMenuGenericRoll(player, who, message, dice, name, callback) {
  player.who = who;
  player.message = message;
  player.buttons = [{
    text: 'Roll ' + dice,
    nextMenu: 'menuIdle',
    callback: function() {
      MML.genericRoll(MML.characters[who], name, dice, callback);
    }
  }];
};
MML.charMenuObserveAction = function charMenuObserveAction(player, who) {
  player.who = who;
  player.message = player.who + ' observes the situation.';
  player.buttons = [player.menuButtons.endAction];
};
MML.charMenuAimAction = function charMenuAimAction(player, who) {
  player.who = who;
  player.message = player.who + ' aims at ' + state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex] + '.';
  player.buttons = [player.menuButtons.endAction];
};
MML.charMenuReloadAction = function charMenuReloadAction(player, who) {
  player.who = who;
  player.message = player.who + ' reloads. ' + state.MML.GM.currentAction.parameters.attackerWeapon.loaded + '/' + state.MML.GM.currentAction.parameters.attackerWeapon.reload + ' done.';
  player.buttons = [player.menuButtons.endAction];
};
MML.charMenuContinueCasting = function charMenuContinueCasting(player, who) {
  player.who = who;
  player.message = player.who + '\' starts casting a spell.';
  player.buttons = [player.menuButtons.endAction];
};

MML.setCurrentCharacterTargets = function setCurrentCharacterTargets(player, input) {
  var targetArray;

  if (!_.isUndefined(input.target)) {
    targetArray = [input.target];
  } else {
    targetArray = input.targets;
  }
  state.MML.GM.currentAction.targetArray = targetArray;
  state.MML.GM.currentAction.targetIndex = 0;
  state.MML.GM.currentAction.character[state.MML.GM.currentAction.character.action.callback]();
};

MML.menuButtons = {};

MML.menuButtons.newItemMenu = {
  text: 'New Item',
  nextMenu: 'GmMenuNewItem',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.newWeapon = {
  text: 'Weapon',
  nextMenu: 'GmMenuNewWeapon',
  callback: function() {
    MML.displayMenu(player);
  }
};

MML.menuButtons.newShield = {
  text: 'Shield',
  nextMenu: 'GmMenuNewShield',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.newArmor = {
  text: 'Armor',
  nextMenu: 'GmMenuNewArmor',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.newSpellComponent = {
  text: 'Spell Component',
  nextMenu: 'GmMenuNewSpellComponent',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.newMiscItem = {
  text: 'Misc',
  nextMenu: 'GmMenuNewMiscItem',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.itemQualityPoor = {
  text: 'Poor',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.MML.GM.newItem.quality = text;
    MML.displayMenu(player);
  }
};
MML.menuButtons.itemQualityStandard = {
  text: 'Standard',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.MML.GM.newItem.quality = text;
    MML.displayMenu(player);
  }
};
MML.menuButtons.itemQualityExcellent = {
  text: 'Excellent',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.MML.GM.newItem.quality = text;
    MML.displayMenu(player);
  }
};
MML.menuButtons.itemQualityMasterWork = {
  text: 'Master Work',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.MML.GM.newItem.quality = text;
    MML.displayMenu(player);
  }
};
MML.menuButtons.assignNewItem = {
  text: 'Assign Item',
  nextMenu: 'GmMenuMain',
  callback: function(input) {
    input.charName = player.name;
    input.callback = 'assignNewItem';
    MML.displayTargetSelection(input);
  }
};

MML.menuButtons.changeAction = {
  text: 'Change Action',
  nextMenu: 'prepareActionMenu',
  callback: function() {
    MML.characters[player.who].action = {
      modifiers: []
    };
    if (_.has(character.statusEffects, 'Changed Action')) {
      character.statusEffects['Changed Action'].level++;
    } else {
      MML.addStatusEffect(character, 'Changed Action', {
        id: generateRowID(),
        name: 'Changed Action',
        level: 1
      });
    }
    MML.displayMenu(player);
  }
};

MML.menuButtons.endMovement = {
  text: 'End Movement',
  nextMenu: 'menuIdle',
  callback: function() {
    var path = getObj('path', MML.characters[player.who].pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
    MML.displayThreatZones(false);
    MML.characters[player.who].startAction();
  }
};

MML.GmMenuWorld = function GmMenuWorld(player, input) {
  //pass time, travel, other stuff
};

MML.GmMenuUtilities = function GmMenuUtilities(player, input) {
  //edit states and other api stuff
};


MML.Player = function Player(name, isGM) {
  this.name = name;
  this.characters = [];
};
