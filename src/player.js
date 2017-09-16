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
  });
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

MML.goToMenu = function goToMenu(player, menu) {
  MML.displayMenu(player, menu);
  return MML.setMenuButtons(player, menu.buttons);
};

MML.processRoll = function processRoll(player, roll) {
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
        return MML.processRoll(player, MML.changeRoll(player, roll, player.pressedButton.replace('changeRoll ', '')));
      }
    });
};

MML.displayGmRoll = function displayGmRoll(player, roll) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + roll.message + "}}");
};

MML.displayPlayerRoll = function displayPlayerRoll(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + roll.message + "}}");
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

MML.selectTarget = function selectTarget(player) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(player) {
      if (player.pressedButton.indexOf('selectTarget') > -1) {
        resolve(player);
      }
    };
  });
};

MML.getSingleTarget = function getSingleTarget(player) {
  MML.displayTargetSelection(player);
  return MML.selectTarget(player)
    .then(function (player) {
      return MML.characters[player.pressedButton.replace('selectTarget ', '')];
    });
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

MML.getRadiusSpellTargets = function getRadiusSpellTargets(player, radius) {
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

  MML.displaySpellMarker(player);
};

MML.chooseSpellTargets = function chooseSpellTargets(player, character, action) {
  if (['Caster', 'Touch', 'Single'].indexOf(action.spell.target) > -1) {
    MML.getSpellTargets();
  } else if (action.spell.target.indexOf('\' Radius') > -1) {
    MML.getRadiusSpellTargets(parseInt(action.spell.target.replace('\' Radius', '')));
  } else {
    return [];
  }
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

MML.prepareAction = function prepareAction([player, character, action]) {
  return MML.goToMenu(player, MML.prepareActionMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
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
    buttons: ['Primary', 'Secondary']
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
          character.statusEffects['Melee This Round'] = {
            id: generateRowID(),
            name: 'Melee This Round'
          };
          if (_.has(character.statusEffects, 'Number of Defenses')) {
            character.statusEffects['Number of Defenses'].number++;
          } else {
            MML.addStatusEffect(character, 'Number of Defenses', {
              number: 1
            });
          }
          return MML.processRoll(player, MML.universalRoll('meleeBlock', [blockChance]));
        case 'Dodge: ' + dodgeChance + '%':
          character.statusEffects['Melee This Round'] = {
            id: generateRowID(),
            name: 'Melee This Round'
          };
          character.statusEffects['Dodged This Round'] = {
            id: generateRowID(),
            name: 'Dodged This Round'
          };
          if (_.has(character.statusEffects, 'Number of Defenses')) {
            character.statusEffects['Number of Defenses'].number++;
          } else {
            MML.addStatusEffect(character, 'Number of Defenses', {
              number: 1
            });
          }
          return MML.processRoll(player, MML.universalRoll('meleeDodge', [dodgeChance]));
        case 'Take it':
          return [player, {result: 'Failure'}];
      }
    });
};

MML.enterNumberOfDice = function enterNumberOfDice(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:enterNumberOfDiceMenu} {{title=Enter Number of Dice}}');
};

MML.prepareCharacters = function prepareCharacters(player) {
  MML.prepareNextCharacter(player, 0);
};

MML.prepareNextCharacter = function prepareNextCharacter(player, index) {
  if (index < player.combatants.length) {
    MML.buildAction(player, player.combatants[index])
      .then(function(player) {
        console.log("SHOW ME WHAT YOU GOT");
        console.log(player);
        MML.prepareNextCharacter(player, index + 1);
      }).catch(log);
  } else if (player.name === state.MML.GM.name) {
    MML.startRound(player);
  }
};

MML.assignStatusEffect = function assignStatusEffect(player, character) {
  return MML.goToMenu(player, MML.assignStatusEffectMenu(player, character))
    .then(function(player) {
      return player, character;
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

MML.chooseSpell = function chooseSpell([player, character, action]) {
  return MML.goToMenu(player, MML.chooseSpellMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
};

MML.chooseMetaMagicInitiative = function chooseMetaMagicInitiative([player, character, action]) {
  return MML.goToMenu(player, MML.chooseMetaMagicInitiativeMenu(player, character, action))
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Called Shot':
        case 'Called Shot Specific':
        case 'Ease Spell':
        case 'Hasten Spell':
          action.modifiers.push(player.pressedButton);
          return MML.chooseMetaMagicInitiative([player, character, action]);
        case 'Remove Called Shot':
        case 'Remove Called Shot Specific':
        case 'Remove Ease Spell':
        case 'Remove Hasten Spell':
          action.modifiers = _.without(action.modifiers, player.pressedButton.replace('Remove ', ''));
          return MML.chooseMetaMagicInitiative([player, character, action]);
        case 'Next Menu':
          return [player, character, action];
      }
    });
};

MML.chooseMetaMagic = function chooseMetaMagic([player, character, action]){
  return MML.goToMenu(player, MML.chooseMetaMagicMenu(player, character, action))
    .then(function(player) {
      if (player.pressedButton.indexOf('Remove ') === 0) {
        action.modifiers = _.without(action.modifiers, player.pressedButton.replace('Remove ', ''));
        return MML.chooseMetaMagic([player, character, action]);
      } else if (pressedButton !== 'Cast Spell') {
        action.modifiers.push(player.pressedButton);
        return MML.chooseMetaMagic([player, character, action]);
      } else {
        return [player, character, action];
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
        MML.chooseMetaMagic(player, who);
        MML.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      MML.chooseMetaMagic(player, who);
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
        MML.chooseMetaMagic(player, who);
        MML.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      MML.chooseMetaMagic(player, who);
      MML.displayMenu(player);
    }
  });
};

MML.readyItem = function readyItem(player, character, action) {
  function createUniqueItemName(itemMap, originalName, name, iteration = 2) {
    if (_.isUndefined(itemMap[name])) {
      return name;
    }
    return createUniqueItemName(itemMap, originalName, originalName + '_' + iteration, iteration + 1);
  }

  var itemMap = {};
  _.chain(character.inventory)
    .pick(function (item) {
      return ['weapon', 'spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 &&
        character.rightHand._id !== item._id &&
        character.leftHand._id !== item._id;
    })
    .each(function (item) {
      itemMap[createUniqueItemName(itemMap, item.name, item.name)] = item._id;
    });

  return MML.goToMenu(player, MML.readyItemMenu(player, character, itemMap))
    .then(function(player) {
      return MML.chooseGrip(player, character, itemMap, player.pressedButton);
    });
};

MML.readyItemMenu = function readyItemMenu(player, character, itemMap) {
  var message = 'Choose item or items for ' + character.name;
  var buttons = _.keys(itemMap).concat('Back');
  return {message: message, buttons: buttons};
};

MML.chooseGrip = function chooseGrip(player, character, itemMap, selectedItem) {
  var item = character.inventory[itemMap[selectedItem]];
  return MML.goToMenu(player, MML.chooseGripMenu(player, character, item))
    .then(function(player) {
      var itemWithGrip = { item: item, grip: player.pressedButton };
      if (player.pressedButton === 'Left Hand' || player.pressedButton === 'Right Hand') {
        return MML.readyAdditionalItem(player, character, _.omit(itemMap, selectedItem), itemWithGrip);
      }
      return [itemWithGrip];
    });
};

MML.chooseGripMenu = function chooseGripMenu(player, character, item) {
  var message = 'How will ' + character.name + ' hold their ' + item.name + '?';
  var buttons = [];

  if (['spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 ||
    (item.type === 'weapon' && _.has(item.grips, 'One Hand'))
  ) {
    buttons = buttons.concat(['Left Hand', 'Right Hand']);
  }
  if (item.type === 'weapon') {
    buttons = buttons.concat(_.keys(item.grips).filter(function(grip) { return grip !== 'One Hand'; }));
  }
  return {message: message, buttons: buttons};
};

MML.readyAdditionalItem = function readyAdditionalItem(player, character, itemMap, previousItem) {
  var message = 'Choose another item or continue';
  var buttons = _.keys(itemMap).concat('Continue');
  return MML.goToMenu(player, {message: message, buttons: buttons})
    .then(function(player) {
      var item = character.inventory[itemMap[player.pressedButton]];
      return [previousItem, { item: item, grip: previousItem.grip === 'Right Hand' ? 'Left Hand' : 'Right Hand' }];
    });
};

MML.finalizeAction = function finalizeAction([player, character, action]) {
  return MML.goToMenu(player, MML.finalizeActionMenu(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
};

MML.startAction = function startAction(player, character, validAction) {
  return MML.goToMenu(player, MML.startActionMenu(player, character, validAction))
    .then(function(player) {
      switch (player.pressedButton) {
        case 'Start Action':
          return MML.combatMovement(player, character)
            .then(function ([player, character]) {
              return MML.processAction(player, character, character.action);
            });
        case 'Change Action':
          if (_.has(character.statusEffects, 'Changed Action')) {
            character.statusEffects['Changed Action'].level++;
          } else {
            MML.addStatusEffect(character, 'Changed Action', {
              id: generateRowID(),
              name: 'Changed Action',
              level: 1
            });
          }
          return MML.buildAction(player, character)
            .then(MML.nextAction);
        case 'Movement Only':
          return MML.combatMovement(player, character)
            .then(function ([player, character]) {
              return MML.endAction(player, character, character.action);
            });
      }
    });
};

MML.combatMovement = function combatMovement(player, character) {
  MML.displayThreatZones(true);
  return MML.goToMenu(player, MML.combatMovementMenu(player, character))
    .then(function(player) {
      if (player.pressedButton !== 'End Movement') {
        character.movementType = player.pressedButton;
        MML.displayMovement(character);
        return MML.goToMenu(player, {message: 'End ' + character.name + '\'s movement', buttons: ['End Movement']})
          .then(function(player) {
            MML.displayThreatZones(false);
            return [player, character];
          });
      } else {
        MML.displayThreatZones(false);
        return [player, character];
      }
    });
};

MML.displaySpellMarker = function displaySpellMarker(player) {
  return MML.goToMenu(player, { message: 'Move and resize spell marker.', buttons: ['Accept'] })
    .then(function (player) {
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
    });
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

MML.displayObserveMenu = function displayObserveMenu(player, character, action) {
  return MML.goToMenu(player, {message: character.name + ' observes the situation.', buttons: ['End Action']})
    .then(function(player) {
      return [player, character, action];
    });
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


MML.GmMenuWorld = function GmMenuWorld(player, input) {
  //pass time, travel, other stuff
};

MML.GmMenuUtilities = function GmMenuUtilities(player, input) {
  //edit states and other api stuff
};

MML.promiseMeNed = function promiseMeNed(bastard) {
  var prince = bastard;
  return new Promise(function(resolve, reject) {
    resolve(prince);
    reject();
  });
};

MML.Player = function Player(name, isGM) {
  this.name = name;
  this.characters = [];
};
