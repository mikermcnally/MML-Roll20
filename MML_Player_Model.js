MML.displayMenu = function displayMenu(player, menu) {
  var buttons = menu.buttons;
  var toChat = '/w "' + player.name + '" &{template:charMenu} {{name=' + menu.message + '}} ';

  // TODO: recursify this
  _.each(buttons, function(button) {
    var noSpace = button.replace(/\s+/g, '');
    toChat = toChat + '{{' + noSpace + '=[' + button + '](!MML|' + button + ')}} ';
  });
  sendChat(player.name, toChat, null, { noarchive: true }); //Change to true this when they fix the bug
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
  return MML.setMenuButtons(player, menu.buttons)
    .then(menu.command)
    .catch(log);
};

MML.initializeMenu = function initializeMenu(player) {
  return MML.setMenuButtons(player, ['initializeMenu'])
    .then(function(player) {
      if (player.name === state.MML.GM.name) {
        return MML.goToMenu(player, MML.GmMenuMain(player));
      }
    });
};

MML.charMenuPrepareAction = function charMenuPrepareAction(player, character) {
  return {
    message: 'Prepare ' + character.name + '\'s action',
    buttons: function() {
      var buttons = [
        'Movement Only',
        'Observe',
        'Ready Item',
        'Attack'
      ];

      if (!_.isUndefined(character.action.weapon) && MML.isRangedWeapon(character.action.weapon)) {
        if (character.action.weapon.family !== 'MWM' || character.action.weapon.loaded === character.action.weapon.reload) {
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
    }(),
    command: MML.charMenuPrepareActionCommand
  };
};

MML.charMenuPrepareActionCommand = function charMenuPrepareActionCommand(player, character) {
  switch (player.pressedButton) {
    case 'Attack':
      character.action.weapon = MML.getEquippedWeapon(character);
      return MML.goToMenu(player, MML.charMenuAttack(player, character));
    case 'Ready Item':
      return MML.goToMenu(player, MML.charMenuReadyItem(player, character));
    case 'Aim':
      _.extend(MML.characters[player.who].action, {
        ts: Date.now(),
        name: 'Aim',
        getTargets: 'getSingleTarget',
        callback: 'startAimAction'
      });
      return MML.goToMenu(player, MML.charMenuAimAction(player, character));
    case 'Reload':
      _.extend(MML.characters[player.who].action, {
        ts: Date.now(),
        name: 'Reload',
        callback: 'reloadAction'
      });
      return MML.goToMenu(player, MML.charMenuReloadAction(player, character));
    case 'Release Opponent':
      character.action.modifiers.push('Release Opponent');
      return MML.goToMenu(player, MML.charMenuPrepareAction(player, character));
    case 'Cast':
      return MML.goToMenu(player, MML.charMenuCast(player, character));
    case 'Continue Casting':
      character.action = MML.clone(character.previousAction);
      return MML.goToMenu(player, MML.charMenuFinalizeAction(player, character));
  }
};

MML.charMenuAttack = function charMenuAttack(who) {
  player.who = who;
  player.message = 'Attack Menu';
  var buttons = [];
  var character = MML.characters[who];
  var weapon = character.action.weapon;
  if (weapon !== 'unarmed' &&
    (weapon.family !== 'MWM' || weapon.loaded === character.action.weapon.reload) &&
    ((!_.has(character.statusEffects, 'Grappled') &&
        !_.has(character.statusEffects, 'Holding') &&
        !_.has(character.statusEffects, 'Held') &&
        !_.has(character.statusEffects, 'Taken Down') &&
        !_.has(character.statusEffects, 'Pinned') &&
        !_.has(character.statusEffects, 'Overborne')) ||
      (!MML.isRangedWeapon(weapon) && weapon.rank < 2))
  ) {
    buttons.push({
      text: 'Standard',
      nextMenu: 'charMenuAttackCalledShot',
      callback: function() {
        MML.displayMenu(player);
      }
    });
    if (MML.isRangedWeapon(weapon)) {
      buttons.push({
        text: 'Shoot From Cover',
        nextMenu: 'charMenuAttackCalledShot',
        callback: function(input) {
          character.action.modifiers.push('Shoot From Cover');
          MML.displayMenu(player);
        }
      });
    } //else if (!_.has(character.statusEffects, 'Grappled') &&
    //   !_.has(character.statusEffects, 'Holding') &&
    //   !_.has(character.statusEffects, 'Held') &&
    //   !_.has(character.statusEffects, 'Taken Down') &&
    //   !_.has(character.statusEffects, 'Pinned') &&
    //   !_.has(character.statusEffects, 'Overborne')
    // ) {
    //   buttons.push({
    //     text: 'Sweep Attack',
    //     nextMenu: 'charMenuAttackCalledShot',
    //     callback: function() {
    //       character.action.modifiers.push('Sweep Attack');
    //       MML.displayMenu(player);
    //     }
    //   });
    // }
  }

  buttons.push({
    text: 'Punch',
    nextMenu: 'menuPause',
    callback: function() {
      character.action.weaponType = 'Punch';
      MML.charMenuAttackCalledShot(player, who);
      MML.displayMenu(player);
    }
  });
  buttons.push({
    text: 'Kick',
    nextMenu: 'menuPause',
    callback: function() {
      character.action.weaponType = 'Kick';
      MML.charMenuAttackCalledShot(player, who);
      MML.displayMenu(player);
    }
  });
  if (!_.contains(character.action.modifiers, 'Release Opponent')) {
    if (!_.has(character.statusEffects, 'Grappled') &&
      !_.has(character.statusEffects, 'Holding') &&
      !_.has(character.statusEffects, 'Held') &&
      !_.has(character.statusEffects, 'Taken Down') &&
      !_.has(character.statusEffects, 'Pinned') &&
      !_.has(character.statusEffects, 'Overborne')
    ) {
      buttons.push({
        text: 'Grapple',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Grapple';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if (((_.has(character.statusEffects, 'Grappled') || _.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Holding')) &&
        character.movementPosition === 'Prone') ||
      ((_.has(character.statusEffects, 'Taken Down') || _.has(character.statusEffects, 'Overborne')) && !_.has(character.statusEffects, 'Pinned'))
    ) {
      buttons.push({
        text: 'Regain Feet',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Regain Feet';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if (!_.has(character.statusEffects, 'Holding') &&
      !_.has(character.statusEffects, 'Held') &&
      !_.has(character.statusEffects, 'Pinned') &&
      (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
    ) {
      buttons.push({
        text: 'Place a Hold',
        nextMenu: 'menuPause',
        callback: function(input) {
          character.action.weaponType = 'Place a Hold';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if (_.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Pinned')) {
      buttons.push({
        text: 'Break a Hold',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Break a Hold';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if ((_.has(character.statusEffects, 'Grappled')) &&
      !_.has(character.statusEffects, 'Pinned') &&
      !_.has(character.statusEffects, 'Held')
    ) {
      buttons.push({
        text: 'Break Grapple',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Break Grapple';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if ((_.has(character.statusEffects, 'Holding') ||
        (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1) ||
        (_.has(character.statusEffects, 'Held') && character.statusEffects['Held'].targets.length === 1)) &&
      !(_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) &&
      character.movementPosition !== 'Prone'
    ) {
      buttons.push({
        text: 'Takedown',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Takedown';
          MML.charMenuAttackStance(player, who);
          MML.displayMenu(player);
        }
      });
    }
    if (_.has(character.statusEffects, 'Held') ||
      _.has(character.statusEffects, 'Grappled') ||
      _.has(character.statusEffects, 'Holding') ||
      _.has(character.statusEffects, 'Taken Down') ||
      _.has(character.statusEffects, 'Pinned') ||
      _.has(character.statusEffects, 'Overborne')
    ) {
      if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) { return target.bodyPart === 'Head'; }).length === 0) {
        buttons.push({
          text: 'Head Butt',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Head Butt';
            MML.charMenuAttackStance(player, who);
            MML.displayMenu(player);
          }
        });
      }
      buttons.push({
        text: 'Bite',
        nextMenu: 'menuPause',
        callback: function() {
          character.action.weaponType = 'Bite';
          MML.charMenuAttackCalledShot(player, who);
          MML.displayMenu(player);
        }
      });
    }
  }
  player.buttons = buttons;
};

MML.menuCommand = function menuCommand(player, who, buttonText, selectedCharNames) {
  var button = _.findWhere(player.buttons, {
    text: buttonText
  });
  if (!_.isUndefined(button)) {
    player.menu = button.nextMenu;
    player[button.nextMenu](who);
    button.callback.apply(player, [button.text, selectedCharNames]);
  }
};

MML.displayGmRoll = function displayGmRoll(player, roll) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + player.currentRoll.message + "}}");
};

MML.displayPlayerRoll = function displayPlayerRoll(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + player.currentRoll.message + "}}");
};

MML.changeRoll = function changeRoll(player, roll, value) {
  var range = player.currentRoll.range.split('-');
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);

  if (value >= low && value <= high) {
    if (player.currentRoll.type === 'damage') {
      player.currentRoll.value = -value;
      player.currentRoll.result = -value;
      player.currentRoll.message = 'Roll: ' + value + '\nRange: ' + player.currentRoll.range;
    } else {
      player.currentRoll.value = value;
      if (player.currentRoll.type === 'universal') {
        player.currentRoll = MML.universalRollResult(player.currentRoll);
      } else if (player.currentRoll.type === 'attribute') {
        player.currentRoll = MML.attributeCheckResult(player.currentRoll);
      } else if (player.currentRoll.type === 'generic') {
        player.currentRoll = MML.genericRollResult(player.currentRoll);
      }
    }
  } else {
    sendChat('Error', 'New roll value out of range.');
  }
  MML.characters[player.currentRoll.character][player.currentRoll.callback]();
};

MML.enterNumberOfDice = function enterNumberOfDice(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:enterNumberOfDiceMenu} {{title=Enter Number of Dice}}');
};

MML.setApiPlayerAttribute = function setApiPlayerAttribute(player, attribute, value) {
  player[attribute] = value;
};

MML.newRoundUpdatePlayer = function newRoundUpdatePlayer(player) {
  player.characterIndex = 0;
  player.who = player.combatants[0];
  var character = MML.characters[player.who];

  if (player.combatants.length > 0) {
    if (_.has(character.statusEffects, 'Stunned')) {
      character.applyStatusEffects();
      MML.goToMenu(player, MML.charMenuFinalizeAction(player, character));
    } else if (character.situationalInitBonus !== 'No Combat') {
      MML.goToMenu(player, MML.charMenuPrepareAction(player, character));
    } else {
      character.setReady(true);
      MML.prepareNextCharacter(player);
    }
  } else if (player.name === state.MML.GM.name) {
    MML.goToMenu(player, MML.GmMenuStartRound(player, 'GM'));
  }
};

MML.prepareNextCharacter = function prepareNextCharacter(player) {
  player.characterIndex++;
  var character = MML.characters[player.combatants[player.characterIndex]];

  if (player.characterIndex < player.combatants.length) {
    if (_.has(character.statusEffects, 'Stunned')) {
      character.applyStatusEffects();
      MML.charMenuFinalizeAction(player, character.name);
      MML.displayMenu(player);
    } else if (character.situationalInitBonus !== 'No Combat') {
      MML.charMenuPrepareAction(player, character.name);
      MML.displayMenu(player);
    } else {
      character.setReady(true);
      MML.prepareNextCharacter(player);
    }
  } else if (player.name === state.MML.GM.name) {
    MML.GmMenuStartRound(player, 'GM');
    MML.displayMenu(player);
  } else {
    player.nextMenu = 'menuIdle';
    MML.displayMenu(player);
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

MML.GmMenuMain = function GmMenuMain(player) {
  return {
    message: 'Main Menu: ',
    buttons: [
      'Combat',
      'Roll Dice'
    ],
    command: function(player) {
      switch (player.pressedButton) {
        case 'Combat':
          return MML.goToMenu(player, MML.GmMenuCombat(player));
        case 'Roll Dice':
          return MML.goToMenu(player, MML.selectDieSizeMenu(player));
      }
    }
  };
};

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

MML.GmMenuCombat = function GmMenuCombat() {
  return {
    message: 'Select tokens and begin.',
    buttons: [
      'Start Combat',
      'Back'
    ],
    command: function(player) {
      switch (player.pressedButton) {
        case 'Start Combat':
          return MML.startCombat(player);
        case 'Back':
          return MML.goToMenu(player, MML.GmMenuMain(player));
      }
    }
  };
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
          character.leftHand = { _id: 'emptyHand', grip: 'unarmed' };
          character.rightHand = { _id: 'emptyHand', grip: 'unarmed' };
          MML.displayMenu(player);
        };
      } else if (character.leftHand._id === itemId) {
        unequipButton.callback = function() {
          character.leftHand = { _id: 'emptyHand', grip: 'unarmed' };
          MML.displayMenu(player);
        };
      } else {
        unequipButton.callback = function() {
          character.rightHand = { _id: 'emptyHand', grip: 'unarmed' };
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
              character.leftHand = { _id: itemId, grip: gripName };
              MML.displayMenu(player);
            }
          });
          buttons.push({
            text: 'Equip Right Hand',
            nextMenu: 'menuIdle',
            callback: function(text) {
              character.rightHand = { _id: itemId, grip: gripName };
              MML.displayMenu(player);
            }
          });
        } else {
          buttons.push({
            text: 'Equip ' + gripName,
            nextMenu: 'menuIdle',
            callback: function(text) {
              character.leftHand = { _id: itemId, grip: gripName };
              character.rightHand = { _id: itemId, grip: gripName };
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
        character.leftHand = { _id: itemId, grip: 'One Hand' };
        MML.displayMenu(player);
      }
    });
    buttons.push({
      text: 'Equip Right Hand',
      nextMenu: 'menuIdle',
      callback: function(text) {
        character.rightHand = { _id: itemId, grip: 'One Hand' };
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

MML.GmMenuStartRound = function GmMenuStartRound(player, who) {
  player.who = who;
  player.message = 'Start round when all characters are ready.';
  player.buttons = [player.menuButtons.startRound,
    player.menuButtons.endCombat
  ];
};

MML.charMenuAttackCalledShot = function charMenuAttackCalledShot(player, who) {
  var character = MML.characters[player.who];
  player.who = who;
  player.message = 'Called Shot Menu';
  var buttons = [{
    text: 'None',
    callback: function() {
      MML.displayMenu(player);
    }
  }, {
    text: 'Body Part',
    callback: function() {
      character.action.modifiers.push('Called Shot');
      MML.displayMenu(player);
    }
  }, {
    text: 'Specific Hit Position',
    callback: function() {
      character.action.modifiers.push('Called Shot Specific');
      MML.displayMenu(player);
    }
  }];

  if (MML.isWieldingRangedWeapon(character)) {
    _.each(buttons, function(button) {
      button.nextMenu = 'charMenuFinalizeAction';
    });
  } else {
    _.each(buttons, function(button) {
      button.nextMenu = 'charMenuAttackStance';
    });
  }
  player.buttons = buttons;
};
MML.charMenuAttackStance = function charMenuAttackStance(player, who) {
  player.who = who;
  player.message = 'Attack Stance Menu';
  var character = MML.characters[who];
  var buttons = [{
    text: 'Neutral',
    callback: function(input) {
      MML.displayMenu(player);
    }
  }, {
    text: 'Defensive',
    callback: function(input) {
      character.action.modifiers.push('Defensive Stance');
      MML.displayMenu(player);
    }
  }, {
    text: 'Aggressive',
    callback: function(input) {
      character.action.modifiers.push('Aggressive Stance');
      MML.displayMenu(player);
    }
  }];

  if (['Punch', 'Kick', 'Head Butt', 'Bite', 'Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(character.action.weaponType) > -1) {
    _.each(buttons, function(button) {
      button.nextMenu = 'charMenuFinalizeAction';
    });
  } else if (!MML.isUnarmed(character) && character.action.weapon.secondaryType !== '') {
    _.each(buttons, function(button) {
      button.nextMenu = 'charMenuSelectDamageType';
    });
  } else {
    character.action.weaponType = 'primary';
    _.each(buttons, function(button) {
      button.nextMenu = 'charMenuFinalizeAction';
    });
  }
  player.buttons = buttons;
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
        _.filter(character.action.items, function(item) { return character.inventory[item.itemId].name === MML.spells[spellName].requiredItem; }, character).length > 0)
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
    nextMenu: 'charMenuFinalizeAction',
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
  state.MML.GM.currentAction.parameters.metaMagic['Increase Targets'] = { epMod: state.MML.GM.currentAction.targetArray.length, castingMod: -10 * state.MML.GM.currentAction.targetArray.length };
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
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
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
  var i = 2;

  while (character.ep > Math.pow(2, i - 1) * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + Math.pow(2, i - 1) * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Potency'] = { epMod: Math.pow(2, i - 1), castingMod: -10, level: i };
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
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
  var i = 2;

  while (character.ep > i * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + i * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Duration'] = { epMod: i, castingMod: 0, level: i };
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
    nextMenu: 'charMenuPrepareAction',
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
            MML.charMenuPrepareAction(player, who);
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
          character.action.items.push({ itemId: _id, grip: hand });
          MML.charMenuPrepareAction(player, who);
          MML.displayMenu(player);
        }
      });
    }
  });

  buttons.push({
    text: 'Next Menu',
    nextMenu: 'charMenuPrepareAction',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons = buttons;
};

MML.charMenuFinalizeAction = function charMenuFinalizeAction(player, who) {
  player.who = who;

  if (state.MML.GM.roundStarted === true) {
    player.message = 'Accept or change action for ' + who;
    player.buttons = [
      player.menuButtons.acceptAction,
      player.menuButtons.editAction
    ];
  } else if (_.has(MML.characters[player.who].statusEffects, 'Stunned')) {
    player.message = who + ' is stunned and can only move. Roll initiative';
    player.buttons = [
      player.menuButtons.initiativeRoll
    ];
  } else {
    player.message = 'Roll initiative or change action for ' + who;
    player.buttons = [
      player.menuButtons.initiativeRoll,
      player.menuButtons.editAction
    ];
  }
};

MML.charMenuStartAction = function charMenuStartAction(player, who, validAction) {
  player.who = who;
  var character = MML.characters[who];

  if (_.has(character.statusEffects, 'Stunned') || _.has(character.statusEffects, 'Dodged player Round')) {
    player.message = 'Start ' + state.MML.GM.actor + '\'s action';
    player.buttons = [player.menuButtons.startAction];
  } else if (validAction) {
    player.message = 'Start or change ' + state.MML.GM.actor + '\'s action';
    player.buttons = [player.menuButtons.startAction, player.menuButtons.changeAction];
  } else {
    sendChat('GM', '/w "' + player.name + '"' + who + '\'s action no longer valid.');
    player.message = 'Change ' + state.MML.GM.actor + '\'s action';
    MML.charMenuPrepareAction(player, who);
  }
};
MML.menuCombatMovement = function menuCombatMovement(player, who) {
  player.who = who;
  player.message = 'Move ' + who + '.';
  player.buttons = [player.menuButtons.setProne,
    player.menuButtons.setStalk,
    player.menuButtons.setCrawl,
    player.menuButtons.setWalk,
    player.menuButtons.setJog,
    player.menuButtons.setRun,
    player.menuButtons.endMovement
  ];
  MML.displayThreatZones(true);
};

MML.charMenuPlaceSpellMarker = function charMenuPlaceSpellMarker(player, who) {
  player.who = who;
  player.message = 'Move and resize spell marker.';
  player.buttons = [{
    text: 'Accept',
    nextMenu: 'menuPause',
    callback: function() {
      var spellMarker = MML.getTokenFromName(state.MML.GM.currentAction.parameters.spellMarker);
      var targets = MML.getAoESpellTargets(spellMarker);
      var character = MML.characters[who];
      _.each(MML.characters, function(character) {
        var token = MML.getTokenFromChar(character.name);
        if (!_.isUndefined(token)) {
          token.set('tint_color', 'transparent');
        }
      });
      spellMarker.remove();
      MML.setCurrentCharacterTargets(player, { targets: targets });
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
MML.charMenuSelectDamageType = function charMenuSelectDamageType(player, who) {
  player.who = who;
  var character = MML.characters[who];
  player.message = 'Choose a Damage Type.';
  player.buttons = [];

  player.buttons.push({
    text: 'Primary',
    nextMenu: 'charMenuFinalizeAction',
    callback: function() {
      character.action.weaponType = 'primary';
      MML.displayMenu(player);
    }
  });

  player.buttons.push({
    text: 'Secondary',
    nextMenu: 'charMenuFinalizeAction',
    callback: function(input) {
      character.action.weaponType = 'secondary';
      MML.displayMenu(player);
    }
  });
};
MML.charMenuAttackRoll = function charMenuAttackRoll(player, who) {
  player.who = who;
  player.message = 'Roll Attack.';
  player.buttons = [player.menuButtons.rollDice];
};
MML.charMenuMeleeDefenseRoll = function charMenuMeleeDefenseRoll(player, who, blockChance, dodgeChance) {
  var character = MML.characters[who];
  player.who = who;
  player.message = 'How will ' + who + ' defend?';
  player.buttons = [];
  if (!MML.isUnarmed(character) || MML.isUnarmed(state.MML.GM.currentAction.character)) {
    player.buttons.push({
      text: 'Block: ' + blockChance + '%',
      nextMenu: 'menuIdle',
      callback: function() {
        character.statusEffects['Melee player Round'] = { id: generateRowID(), name: 'Melee player Round' };
        character.meleeBlockRoll(blockChance);
      }
    });
  }
  player.buttons.push({
    text: 'Dodge: ' + dodgeChance + '%',
    nextMenu: 'menuIdle',
    callback: function() {
      character.statusEffects['Melee player Round'] = { id: generateRowID(), name: 'Melee player Round' };
      character.meleeDodgeRoll(dodgeChance);
    }
  });
  player.buttons.push({
    text: 'Take it',
    nextMenu: 'menuIdle',
    callback: function() {
      character.forgoDefense('defenseRoll');
    }
  });
};
MML.charMenuRangedDefenseRoll = function charMenuRangedDefenseRoll(player, who, defenseChance) {
  var character = MML.characters[who];
  player.who = who;
  player.message = 'How will ' + who + ' defend?';
  player.buttons = [{
    text: 'Defend: ' + defenseChance + '%',
    nextMenu: 'menuIdle',
    callback: function() {
      character.statusEffects['Melee player Round'] = { id: generateRowID(), name: 'Melee player Round' };
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
MML.menuButtons.GmMenuMain = {
  text: 'GmMenuMain',
  nextMenu: 'GmMenuMain',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.combatMenu = {
  text: 'Combat',
  nextMenu: 'GmMenuCombat',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.newCharacterMenu = {
  text: 'New Character',
  nextMenu: 'GmMenuNewCharacter',
  callback: function() {
    MML.displayMenu(player);
  }
};

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

MML.menuButtons.worldMenu = {
  text: 'World',
  nextMenu: 'GmMenuWorld',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.utilitiesMenu = {
  text: 'Utilities',
  nextMenu: 'GmMenuUtilities',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.startCombat = {
  text: 'Start Combat',
  nextMenu: 'GmMenuMain',
  callback: function(text, selectedCharNames) {
    MML.startCombat(selectedCharNames);
  }
};
MML.menuButtons.toMainGmMenu = {
  text: 'Back',
  nextMenu: 'GmMenuMain',
  callback: function() {
    MML.displayMenu(player);
  }
};

MML.menuButtons.startRound = {
  text: 'Start Round',
  nextMenu: 'GmMenuStartRound',
  callback: function() {
    MML.startRound();
  }
};
MML.menuButtons.endCombat = {
  text: 'End Combat',
  nextMenu: 'GmMenuMain',
  callback: function() {
    MML.endCombat();
  }
};
MML.menuButtons.setActionAttack = {
  text: 'Attack',
  nextMenu: 'charMenuAttack',
  callback: function() {
    var character = MML.characters[player.who];
    _.extend(character.action, {
      ts: Date.now(),
      name: 'Attack',
      getTargets: 'getSingleTarget',
      callback: 'startAttackAction'
    });
    MML.displayMenu(player);
  }
};
MML.menuButtons.setActionCast = {
  text: 'Cast',
  nextMenu: 'charMenuCast',
  callback: function(text) {
    _.extend(MML.characters[player.who].action, {
      ts: Date.now(),
      name: 'Cast',
      callback: 'startCastAction'
    });
    MML.displayMenu(player);
  }
};
MML.menuButtons.setActionReadyItem = {
  text: 'Ready Item',
  nextMenu: 'charMenuReadyItem',
  callback: function() {
    MML.characters[player.who].action.modifiers.push('Ready Item');
    MML.displayMenu(player);
  }
};
MML.menuButtons.setActionObserve = {
  text: 'Observe',
  nextMenu: 'charMenuFinalizeAction',
  callback: function(input) {
    _.extend(MML.characters[player.who].action, {
      ts: Date.now(),
      name: 'Observe',
      callback: 'observeAction'
    });
    MML.displayMenu(player);
  }
};
MML.menuButtons.setActionMovement = {
  text: 'Movement Only',
  nextMenu: 'charMenuFinalizeAction',
  callback: function(input) {
    _.extend(MML.characters[player.who].action, {
      ts: Date.now(),
      name: 'Movement Only',
      callback: 'endAction'
    });
    delete MML.characters[player.who].action.getTargets;
    MML.displayMenu(player);
  }
};
MML.menuButtons.changeAction = {
  text: 'Change Action',
  nextMenu: 'charMenuPrepareAction',
  callback: function() {
    MML.characters[player.who].action = { modifiers: [] };
    if (_.has(character.statusEffects, 'Changed Action')) {
      character.statusEffects['Changed Action'].level++;
    } else {
      character.addStatusEffect('Changed Action', {
        id: generateRowID(),
        name: 'Changed Action',
        level: 1
      });
    }
    MML.displayMenu(player);
  }
};
MML.menuButtons.editAction = {
  text: 'Edit Action',
  nextMenu: 'charMenuPrepareAction',
  callback: function() {
    MML.characters[player.who].action = { modifiers: [] };
    MML.displayMenu(player);
  }
};
MML.menuButtons.actionPrepared = {
  text: 'Ready',
  nextMenu: 'charMenuPrepareAction',
  callback: function() {
    var character = MML.characters[player.who];
    character.setReady(true);
    character.setAction();
    player.characterIndex++;
    if (player.characterIndex < player.combatants.length) {
      MML.charMenuPrepareAction(player, player.combatants[player.characterIndex]);
      MML.displayMenu(player);
    } else if (player.name === state.MML.GM.name) {
      MML.GmMenuStartRound(player, 'GM');
      MML.displayMenu(player);
    } else {
      player.menu = 'menuIdle';
      MML.displayMenu(player);
    }
  }
};

MML.menuButtons.chooseTargets = {
  text: 'Choose Targets',
  nextMenu: 'charMenuChooseTargets',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.acceptAction = {
  text: 'Accept',
  nextMenu: 'menuIdle',
  callback: function() {
    var character = MML.characters[player.who];
    character.setReady(true);
    character.setAction();
    MML.nextAction();
  }
};
MML.menuButtons.startAction = {
  text: 'Start Action',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.displayMenu(player);
  }
};
MML.menuButtons.endAction = {
  text: 'End Action',
  nextMenu: 'charMenuPrepareAction',
  callback: function() {
    MML.endAction();
  }
};
MML.menuButtons.initiativeRoll = {
  text: 'Roll',
  nextMenu: 'menuIdle',
  callback: function() {
    MML.characters[player.who].initiativeRoll();
  }
};

MML.menuButtons.setProne = {
  text: 'Prone',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Prone';
    MML.characters[player.who].displayMovement();
  }
};
MML.menuButtons.setCrawl = {
  text: 'Crawl',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Crawl';
    MML.characters[player.who].displayMovement();
  }
};
MML.menuButtons.setStalk = {
  text: 'Stalk',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Stalk';
    MML.characters[player.who].displayMovement();
  }
};
MML.menuButtons.setWalk = {
  text: 'Walk',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Walk';
    MML.characters[player.who].displayMovement();
  }
};
MML.menuButtons.setJog = {
  text: 'Jog',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Jog';
    MML.characters[player.who].displayMovement();
  }
};
MML.menuButtons.setRun = {
  text: 'Run',
  nextMenu: 'menuCombatMovement',
  callback: function() {
    MML.characters[player.who].movementPosition = 'Run';
    MML.characters[player.who].displayMovement();
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
  this.who = name;
  this.buttons = isGM ? [MML.menuButtons.GmMenuMain] : [];
  this.characters = [];
  this.characterIndex = 0;
  this.menu = isGM ? 'GmMenuMain' : 'menuPause';
  MML.initializeMenu(this);
};
