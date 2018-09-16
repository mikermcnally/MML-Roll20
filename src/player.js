MML.displayGmRoll = function displayGmRoll(player, message) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + message + "}}");
};

MML.displayPlayerRoll = function displayPlayerRoll(player, message) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + message + "}}");
  return player;
};

MML.displayRoll = function displayRoll(player, roll) {
  if (player.name === state.MML.GM.name) {
    return MML.displayGmRoll(player, roll);
  } else {
    return MML.displayPlayerRoll(player, roll);
  }
};

MML.setRollButtons = function setRollButtons(player) {
  return new Promise(function (resolve, reject) {
    player.buttonPressed = function (pressedButton) {
      if (pressedButton === 'acceptRoll') {
        resolve(pressedButton);
      } else if (pressedButton.includes('changeRoll') && player.name === state.MML.GM.name) {
        resolve(pressedButton.replace('changeRoll ', ''));
      }
    };
  });
};

MML.displayTargetSelection = function displayTargetSelection(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:selectTarget}');
};

MML.selectTarget = function selectTarget(player) {
  return new Promise(function (resolve, reject) {
    player.buttonPressed = function (pressedButton) {
      if (pressedButton.includes('selectTarget')) {
        resolve(pressedButton.replace('selectTarget ', ''));
      }
    };
  });
};

MML.getSingleTarget = async function getSingleTarget(player) {
  MML.displayTargetSelection(player);
  const pressedButton = await MML.selectTarget(player);
  return _.find(MML.characters, character => character.name === pressedButton);
};

MML.getMultipleTargets = async function getMultipleTargets(player, targets) {
  const newTarget = await getSingleTarget(player);
  targets.push(newTarget);
  const {
    pressedButton
  } = displayMenu(player, 'Choose additional target?', ['Yes', 'No']);
  if (pressedButton === 'Yes') {
    return MML.getMultipleTargets(player, targets);
  } else {
    return targets
  }
};

MML.getRadiusSpellTargets = function getRadiusSpellTargets(player, radius) {
  var token = MML.getCharacterToken(this.id);
  var spellMarker = createObj('graphic', {
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
  toBack(spellMarker);

  MML.displaySpellMarker(player, spellMarker);
};

MML.chooseSpellTargets = function chooseSpellTargets(player, character, target) {
  if (['Caster', 'Touch', 'Single'].includes(target)) {
    return MML.getMultipleTargets();
  } else if (target.includes('\' Radius')) {
    return MML.getRadiusSpellTargets(parseInt(target.replace('\' Radius', '')));
  } else {
    return [];
  }
};

MML.prepareAttackAction = async function prepareAttackAction(player, character, action) {
  action.ts = Date.now();
  action.name = 'Attack';
  const attackType = await MML.chooseAttackType(player, character, action);
  action.attackType = attackType;

  if (attackType === 'Shoot From Cover') {
    action.modifiers.push('Shoot From Cover');
  }

  if (!_.contains([
        'Grapple',
        'Break a Hold',
        'Break Grapple',
        'Takedown',
        'Regain Feet'
      ],
      action.attackType)) {
    const calledShot = await MML.chooseCalledShot(player);
    if (calledShot !== 'None') {
      action.modifiers.push(calledShot);
    }
  }
  if (!state.MML.GM.roundStarted) {
    const attackStance = await MML.chooseAttackStance(player);
    switch (attackStance) {
      case 'Defensive':
        action.modifiers.push('Defensive Stance');
        break;
      case 'Neutral':
        break;
      case 'Aggressive':
        action.modifiers.push('Aggressive Stance');
        break;
    }
  }
  if (MML.isUnarmedAction(action)) {
    action.weapon = MML.unarmedAttacks[attackType];
  } else {
    const weapon = action.weapon;
    if (weapon.secondaryType !== '') {
      const damageType = await MML.chooseDamageType(player);
      if (damageType === 'Secondary') {
        _.extend(weapon, {
          damageType: weapon.secondaryType,
          task: weapon.secondaryTask,
          damage: weapon.secondaryDamage
        });
      } else {
        _.extend(weapon, {
          damageType: weapon.primaryType,
          task: weapon.primaryTask,
          damage: weapon.primaryDamage
        });
      }
    } else {
      _.extend(weapon, {
        damageType: weapon.primaryType,
        task: weapon.primaryTask,
        damage: weapon.primaryDamage
      });
    }
  }
  return action;
};

MML.chooseAttackType = async function chooseAttackType(player, character, action) {
  var buttons = [];
  var weapon = action.weapon;
  var notSomeKindOfGrappled = _.isEmpty(_.intersection(_.keys(character.statusEffects), ['Grappled',
    'Held',
    'Taken Down',
    'Pinned',
    'Overborne'
  ]));

  if (weapon !== 'unarmed' &&
    (weapon.family !== 'MWM' || weapon.loaded === weapon.reload) &&
    (notSomeKindOfGrappled || (!MML.isRangedWeapon(weapon) && weapon.rank < 2))
  ) {
    buttons.push('Standard');
    if (MML.isRangedWeapon(weapon)) {
      buttons.push('Shoot From Cover');
      // } else {
      //   buttons.push('Sweep Attack');
    }
  }

  buttons.push('Punch');
  buttons.push('Kick');
  if (!_.contains(action.modifiers, 'Release Opponent')) {
    if (!MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
      buttons.push('Grapple');
    }
    if ((MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held']) && character.movementType === 'Prone') ||
      (MML.hasStatusEffects(character, ['Taken Down', 'Overborne']) && !_.has(character.statusEffects, 'Pinned'))
    ) {
      buttons.push('Regain Feet');
    }
    if (!MML.hasStatusEffects(character, ['Holding', 'Held', 'Pinned']) &&
      (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
    ) {
      buttons.push('Place a Hold');
    }
    if (MML.hasStatusEffects(character, ['Held', 'Pinned'])) {
      buttons.push('Break a Hold');
    }
    if ((_.has(character.statusEffects, 'Grappled')) && !MML.hasStatusEffects(character, ['Held', 'Pinned'])) {
      buttons.push('Break Grapple');
    }
    if ((_.has(character.statusEffects, 'Holding') ||
        (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1) ||
        (_.has(character.statusEffects, 'Held') && character.statusEffects['Held'].targets.length === 1)) &&
      !(_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) &&
      character.movementType !== 'Prone'
    ) {
      buttons.push('Takedown');
    }
    if (MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
      if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function (target) {
          return target.bodyPart === 'Head';
        }).length === 0) {
        buttons.push('Head Butt');
      }
      buttons.push('Bite');
    }
  }
  const {
    pressedButton,
    selectedIds
  } = await MML.displayMenu(player, 'Attack Menu', buttons);
  return pressedButton;
};

MML.chooseCalledShot = async function chooseCalledShot(player) {
  const {
    pressedButton,
    selectedIds
  } = await MML.displayMenu(player, 'Choose Called Shot', ['None', 'Body Part', 'Specific Hit Position']);
  return pressedButton;
};

MML.chooseAttackStance = async function chooseAttackStance(player) {
  const {
    pressedButton,
    selectedIds
  } = await MML.displayMenu(player, 'Choose Attack Stance', ['Neutral', 'Defensive', 'Aggressive']);
  return pressedButton;
};

MML.chooseDamageType = async function chooseDamageType(player) {
  const {
    pressedButton
  } = await MML.displayMenu(player, 'Choose a Damage Type', ['Primary', 'Secondary']);
  return pressedButton;
};

MML.chooseMeleeDefense = async function chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon) {
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Dodge: ' + MML.sumModifiers(dodgeMods) + '%', 'Take it'];
  if (!MML.isUnarmed(character) || attackerWeapon.family === "Unarmed") {
    buttons.unshift('Block: ' + MML.sumModifiers(blockMods) + '%');
  }
  const {
    pressedButton
  } = await MML.displayMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Block: ' + MML.sumModifiers(blockMods) + '%':
      MML.addStatusEffect(character, 'Melee This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return blockMods;
    case 'Dodge: ' + MML.sumModifiers(dodgeMods) + '%':
      MML.addStatusEffect(character, 'Melee This Round', {});
      MML.addStatusEffect(character, 'Dodged This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return dodgeMods;
    case 'Take it':
      return 'Failure';
  }
};

MML.chooseMissileDefense = async function chooseMissileDefense(player, character, dodgeMods) {
  const dodgeChance = MML.sumModifiers(dodgeMods);
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Dodge: ' + dodgeChance + '%', 'Take it'];

  const {
    pressedButton
  } = await MML.displayMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Dodge: ' + dodgeChance + '%':
      MML.addStatusEffect(character, 'Melee This Round', {});
      MML.addStatusEffect(character, 'Dodged This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return dodgeMods;
    case 'Take it':
      return 'Failure';
  }
};

MML.prepareCharacters = function prepareCharacters(player) {
  return MML.prepareNextCharacter(player, 0);
};

MML.prepareNextCharacter = async function prepareNextCharacter(player, index) {
  if (index < player.combatants.length) {
    await MML.prepareAction(player, player.combatants[index]);
    return MML.prepareNextCharacter(player, index + 1);
  } else {
    return player;
  }
};

MML.assignStatusEffect = async function assignStatusEffect(player, character) {
  const effectName = MML.displayMenu(player, 'Choose a Status Effect:', _.keys(MML.statusEffects));

};

MML.menuSelectDieSize = function menuselectDieSize(player) {
  MML.enterNumberOfDice(player);
};

MML.menuGmNewItem = function menuGmNewItem(player, who) {
  player.who = who;
  player.message = 'Select item type:';
  player.buttons = [player.menuButtons.newWeapon,
    player.menuButtons.newShield,
    player.menuButtons.newArmor,
    player.menuButtons.newSpellComponent,
    player.menuButtons.newMiscItem,
    player.menuButtons.menutoMainGm
  ];
};

MML.menuGmNewWeapon = function menuGmNewWeapon(player, who) {
  player.who = who;
  player.message = 'Select weapon type:';
  player.buttons = [];

  _.each(MML.items, function (item) {
    if (item.type === 'weapon') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function (text) {
          state.MML.GM.newItem = MML.items[text];
          MML.sendChatMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmNewShield = function menuGmNewShield(player, who) {
  player.who = who;
  player.message = 'Select shield type:';
  player.buttons = [];

  _.each(MML.items, function (item) {
    if (item.type === 'shield') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function (text) {
          state.MML.GM.newItem = MML.items[text];
          MML.sendChatMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmNewArmor = function menuGmNewArmor(player, who) {
  player.who = who;
  player.message = 'Select armor style:';
  player.buttons = [];

  _.each(MML.items, function (item) {
    if (item.type === 'armor') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmArmorMaterial',
        callback: function (text) {
          state.MML.GM.newItem = MML.items[text];
          MML.sendChatMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmArmorMaterial = function menuGmArmorMaterial(player, who) {
  player.who = who;
  player.message = 'Select armor material:';
  player.buttons = [];

  _.each(MML.APVList, function (material) {
    player.buttons.push({
      text: material.name,
      nextMenu: 'menuGmItemQuality',
      callback: function (text) {
        var material = MML.APVList[text];
        state.MML.GM.newItem.material = material.name;
        state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
        state.MML.GM.newItem.name = material.name + ' ' + state.MML.GM.newItem.name;
        MML.sendChatMenu(player);
      }
    });
  }, player);
};

MML.menuGmNewItemProperties = function menuGmNewItemProperties(player, who) {
  player.who = who;
  player.message = 'Add new properties:';
  player.buttons = [player.menuButtons.assignNewItem];
};

MML.menuGmassignNewItem = function menuGmassignNewItem(player, who) {
  player.who = who;
  player.message = 'Select character:';
  player.buttons = [];

  _.each(MML.characters, function (character) {
    player.buttons.push({
      text: index,
      nextMenu: 'menuMainGm',
      callback: function () {
        MML.sendChatMenu(player);
      }
    });
  }, player);
};

MML.menuGmItemQuality = function menuGmItemQuality(player, who) {
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
        unequipButton.callback = function () {
          character.leftHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          character.rightHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.sendChatMenu(player);
        };
      } else if (character.leftHand._id === itemId) {
        unequipButton.callback = function () {
          character.leftHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.sendChatMenu(player);
        };
      } else {
        unequipButton.callback = function () {
          character.rightHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          MML.sendChatMenu(player);
        };
      }
      buttons.push(unequipButton);
    } else {
      _.each(item.grips, function (grip, gripName) {
        if (gripName === 'One Hand') {
          buttons.push({
            text: 'Equip Left Hand',
            nextMenu: 'menuIdle',
            callback: function (text) {
              character.leftHand = {
                _id: itemId,
                grip: gripName
              };
              MML.sendChatMenu(player);
            }
          });
          buttons.push({
            text: 'Equip Right Hand',
            nextMenu: 'menuIdle',
            callback: function (text) {
              character.rightHand = {
                _id: itemId,
                grip: gripName
              };
              MML.sendChatMenu(player);
            }
          });
        } else {
          buttons.push({
            text: 'Equip ' + gripName,
            nextMenu: 'menuIdle',
            callback: function (text) {
              character.leftHand = {
                _id: itemId,
                grip: gripName
              };
              character.rightHand = {
                _id: itemId,
                grip: gripName
              };
              MML.sendChatMenu(player);
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
      callback: function (text) {
        character.leftHand = {
          _id: itemId,
          grip: 'One Hand'
        };
        MML.sendChatMenu(player);
      }
    });
    buttons.push({
      text: 'Equip Right Hand',
      nextMenu: 'menuIdle',
      callback: function (text) {
        character.rightHand = {
          _id: itemId,
          grip: 'One Hand'
        };
        MML.sendChatMenu(player);
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
    callback: function (text) {
      MML.sendChatMenu(player);
    }
  });

  player.buttons = buttons;
  MML.sendChatMenu(player);
};

MML.prepareCastAction = async function chooseSpell(player, character, action) {
  const message = 'Choose a spell';
  const buttons = character.spells.reduce(function (availableSpells, spellName) {
    if (_.isUndefined(MML.spells[spellName].requiredItem) ||
      (_.isUndefined(action.items) &&
        (character.inventory[character.rightHand._id].name === MML.spells[spellName].requiredItem || character.inventory[character.leftHand._id].name === MML.spells[spellName].requiredItem)) ||
      (!_.isUndefined(action.items) &&
        _.filter(action.items, function (item) {
          return character.inventory[item.itemId].name === MML.spells[spellName].requiredItem;
        }, character).length > 0)
    ) {
      return availableSpells.concat(spellName);
    }
  });
  const spellName = await MML.displayMenu(player, message, buttons);
  const spell = MML.spells[spellName];

};

MML.chooseMetaMagicInitiative = async function chooseMetaMagicInitiative(player, character, action) {
  const buttons = ['Next Menu'];
  if (_.contains(action.spell.metaMagic, 'Called Shot')) {
    if (_.contains(action.modifiers, 'Called Shot')) {
      buttons.push('Remove Called Shot');
    } else if (_.contains(action.modifiers, 'Called Shot Specific')) {
      buttons.push('Remove Called Shot Specific');
    } else {
      buttons.push('Called Shot');
      buttons.push('Called Shot Specific');
    }
  }
  if (_.contains(action.modifiers, 'Ease Spell')) {
    buttons.push('Remove Ease Spell');
  } else if (_.contains(action.modifiers, 'Hasten Spell')) {
    buttons.push('Remove Hasten Spell');
  } else {
    buttons.push('Ease Spell');
    buttons.push('Hasten Spell');
  }

  const {
    pressedButton
  } = await MML.displayMenu(player, 'Choose meta magic', buttons);
  switch (pressedButton) {
    case 'Called Shot':
    case 'Called Shot Specific':
    case 'Ease Spell':
    case 'Hasten Spell':
      action.modifiers.push(player.pressedButton);
      return MML.chooseMetaMagicInitiative(player, character, action);
    case 'Remove Called Shot':
    case 'Remove Called Shot Specific':
    case 'Remove Ease Spell':
    case 'Remove Hasten Spell':
      action.modifiers = _.without(action.modifiers, player.pressedButton.replace('Remove ', ''));
      return MML.chooseMetaMagicInitiative(player, character, action);
    case 'Next Menu':
      return action;
  }
};

MML.chooseMetaMagic = async function chooseMetaMagic(player, character, action) {
  const buttons = _.without(action.spell.metaMagic, 'Called Shot', 'Called Shot Specific')
    .map(metaMagicName => _.contains(action.modifiers, metaMagicName) ? 'Remove ' + metaMagicName : metaMagicName)
    .concat('Cast Spell');
  const {
    pressedButton
  } = await MML.displayMenu(player, 'Choose meta magic', buttons);
  if (pressedButton.indexOf('Remove ') === 0) {
    action.modifiers = _.without(action.modifiers, pressedButton.replace('Remove ', ''));
    return MML.chooseMetaMagic(player, character, action);
  } else if (pressedButton !== 'Cast Spell') {
    action.modifiers.push(pressedButton);
    return MML.chooseMetaMagic(player, character, action);
  } else {
    return action;
  }
};

MML.menucharAddTarget = function menucharAddTarget(player, who) {
  player.who = who;
  player.buttons = [];
  var character = MML.characters[who];
  state.MML.GM.currentAction.parameters.metaMagic['Increase Targets'] = {
    epMod: state.MML.GM.currentAction.targetArray.length,
    castingMod: -10 * state.MML.GM.currentAction.targetArray.length
  };
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function (memo, num) {
    return memo * num;
  }) * parameters.epCost;
  player.message = 'Current EP Cost: ' + epProduct + '\nAdd another target or cast spell:';
};

MML.menucharIncreasePotency = function menucharIncreasePotency(player, who) {
  player.who = who;
  player.message = 'Increase potency by how many times?';
  player.buttons = [];
  var character = MML.characters[who];
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function (memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > Math.pow(2, i - 1) * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + Math.pow(2, i - 1) * epProduct,
      nextMenu: 'menuPause',
      callback: function () {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Potency'] = {
          epMod: Math.pow(2, i - 1),
          castingMod: -10,
          level: i
        };
        MML.chooseMetaMagic(player, who);
        MML.sendChatMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function () {
      MML.chooseMetaMagic(player, who);
      MML.sendChatMenu(player);
    }
  });
};

MML.menucharIncreaseDuration = function menucharIncreaseDuration(player, who) {
  player.who = who;
  player.message = 'Increase duration by how many times?';
  player.buttons = [];
  var character = MML.characters[who];
  var parameters = state.MML.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function (memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > i * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + i * epProduct,
      nextMenu: 'menuPause',
      callback: function () {
        state.MML.GM.currentAction.parameters.metaMagic['Increase Duration'] = {
          epMod: i,
          castingMod: 0,
          level: i
        };
        MML.chooseMetaMagic(player, who);
        MML.sendChatMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function () {
      MML.chooseMetaMagic(player, who);
      MML.sendChatMenu(player);
    }
  });
};

MML.readyItem = async function readyItem(player, character, action) {
  function createUniqueItemName(itemMap, originalName, name, iteration = 2) {
    if (_.isUndefined(itemMap[name])) {
      return name;
    }
    return createUniqueItemName(itemMap, originalName, originalName + '_' + iteration, iteration + 1);
  }

  var itemMap = {};
  _.chain(character.inventory)
    .pick(function (item) {
      return ['weapon', 'spellComponent', 'shield', 'potion', 'misc'].includes(item.type) &&
        character.rightHand._id !== item._id &&
        character.leftHand._id !== item._id;
    })
    .each(function (item) {
      itemMap[createUniqueItemName(itemMap, item.name, item.name)] = item._id;
    });

  const itemName = await MML.displayMenu(player, 'Choose item or items for ' + character.name, _.keys(itemMap).concat('Back'))
    .then(function (player) {
      return MML.chooseGrip(player, character, itemMap, player.pressedButton);
    });
};

MML.chooseGrip = function chooseGrip(player, character, itemMap, selectedItem) {
  var item = character.inventory[itemMap[selectedItem]];
  return MML.displayMenu(player, MML.menuchooseGrip(player, character, item))
    .then(function (player) {
      var itemWithGrip = {
        item: item,
        grip: player.pressedButton
      };
      if (player.pressedButton === 'Left Hand' || player.pressedButton === 'Right Hand') {
        return MML.readyAdditionalItem(player, character, _.omit(itemMap, selectedItem), itemWithGrip);
      }
      return [itemWithGrip];
    });
};

MML.menuchooseGrip = function menuchooseGrip(player, character, item) {
  var message = 'How will ' + character.name + ' hold their ' + item.name + '?';
  var buttons = [];

  if (['spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 ||
    (item.type === 'weapon' && _.has(item.grips, 'One Hand'))
  ) {
    buttons = buttons.concat(['Left Hand', 'Right Hand']);
  }
  if (item.type === 'weapon') {
    buttons = buttons.concat(_.keys(item.grips).filter(function (grip) {
      return grip !== 'One Hand';
    }));
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.readyAdditionalItem = function readyAdditionalItem(player, character, itemMap, previousItem) {
  var message = 'Choose another item or continue';
  var buttons = _.keys(itemMap).concat('Continue');
  return MML.displayMenu(player, {
      message: message,
      buttons: buttons
    })
    .then(function (player) {
      var item = character.inventory[itemMap[player.pressedButton]];
      return [previousItem, {
        item: item,
        grip: previousItem.grip === 'Right Hand' ? 'Left Hand' : 'Right Hand'
      }];
    });
};

MML.finalizeAction = async function finalizeAction(player, character, action) {
  var message;
  var buttons;
  if (state.MML.GM.roundStarted === true) {
    message = 'Accept or edit action for ' + character.name;
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
    message = 'Roll initiative or edit action for ' + character.name;
    buttons = [
      'Roll',
      'Edit Action'
    ];
  }
  const {
    pressedButton
  } = await MML.displayMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Roll':
      MML.setAction(character, action);
      await MML.initiativeRoll(player, character, action);
      break;
    case 'Edit Action':
      return MML.prepareAction(player, character);
    case 'Accept':
      MML.setAction(character, action);
      return player;
  }
};

MML.startAction = async function startAction(player, character, validAction) {
  var message;
  var buttons = ['Movement Only'];
  if (_.has(character.statusEffects, 'Stunned') || _.has(character.statusEffects, 'Dodged This Round')) {
    message = character.name + ' cannot act.';
  } else if (validAction) {
    if (character.initiative - 10 > 0) {
      message = 'Start or change ' + character.name + '\'s action';
      buttons.unshift('Change Action');
      buttons.unshift('Start Action');
    } else {
      message = 'Start ' + character.name + '\'s action';
      buttons.unshift('Start Action');
    }
  } else {
    message = character.name + '\'s action no longer valid.';
    if (character.initiative - 10 > 0) {
      buttons.unshift('Change Action');
    }
  }

  const {
    pressedButton
  } = await MML.displayMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Start Action':
      await MML.combatMovement(player, character);
      return MML.processAction(player, character, character.action);
    case 'Change Action':
      if (_.has(character.statusEffects, 'Changed Action')) {
        character.statusEffects['Changed Action'].level++;
      } else {
        MML.addStatusEffect(character, 'Changed Action', {
          id: MML.generateRowID(),
          name: 'Changed Action',
          level: 1
        });
      }
      return MML.prepareAction(player, character);
    case 'Movement Only':
      await MML.combatMovement(player, character);
      return MML.endAction(player, character, character.action);
  }
};

MML.combatMovement = async function combatMovement(player, character) {
  MML.displayThreatZones(true);
  const message = 'Move ' + character.name + '.';
  const buttons = ['Prone', 'Stalk', 'Crawl', 'Walk', 'Jog', 'Run', 'End Movement'];
  const {
    pressedButton
  } = await MML.displayMenu(player, message, buttons);

  if (pressedButton !== 'End Movement') {
    character.movementType = pressedButton;
    MML.displayMovement(character);
    await MML.displayMenu(player, 'End ' + character.name + '\'s movement', ['End Movement']);
    MML.displayThreatZones(false);
  } else {
    MML.displayThreatZones(false);
  }
};

MML.displaySpellMarker = async function displaySpellMarker(player, spellMarker) {
  await MML.displayMenu(player, 'Move and resize spell marker.', ['Accept']);
  var targets = await MML.getAoESpellTargets(spellMarker);
  var character = MML.characters[who];
  _.each(MML.characters, function (character) {
    var token = MML.getCharacterToken(character.id);
    if (!_.isUndefined(token)) {
      token.set('tint_color', 'transparent');
    }
  });
  spellMarker.remove();
  MML.setCurrentCharacterTargets(player, {
    targets: targets
  });
};

MML.menucharGenericRoll = function menucharGenericRoll(player, who, message, dice, name, callback) {
  player.who = who;
  player.message = message;
  player.buttons = [{
    text: 'Roll ' + dice,
    nextMenu: 'menuIdle',
    callback: function () {
      MML.genericRoll(MML.characters[who], name, dice, callback);
    }
  }];
};

MML.menucharReloadAction = function menucharReloadAction(player, who) {
  player.who = who;
  player.message = player.who + ' reloads. ' + state.MML.GM.currentAction.parameters.attackerWeapon.loaded + '/' + state.MML.GM.currentAction.parameters.attackerWeapon.reload + ' done.';
  player.buttons = [player.menuButtons.endAction];
};

MML.menucharContinueCasting = function menucharContinueCasting(player, who) {
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
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.newWeapon = {
  text: 'Weapon',
  nextMenu: 'GmMenuNewWeapon',
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.newShield = {
  text: 'Shield',
  nextMenu: 'GmMenuNewShield',
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.newArmor = {
  text: 'Armor',
  nextMenu: 'GmMenuNewArmor',
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.newSpellComponent = {
  text: 'Spell Component',
  nextMenu: 'GmMenuNewSpellComponent',
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.newMiscItem = {
  text: 'Misc',
  nextMenu: 'GmMenuNewMiscItem',
  callback: function () {
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.itemQualityPoor = {
  text: 'Poor',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function (text) {
    state.MML.GM.newItem.quality = text;
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.itemQualityStandard = {
  text: 'Standard',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function (text) {
    state.MML.GM.newItem.quality = text;
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.itemQualityExcellent = {
  text: 'Excellent',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function (text) {
    state.MML.GM.newItem.quality = text;
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.itemQualityMasterWork = {
  text: 'Master Work',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function (text) {
    state.MML.GM.newItem.quality = text;
    MML.sendChatMenu(player);
  }
};

MML.menuButtons.assignNewItem = {
  text: 'Assign Item',
  nextMenu: 'GmMenuMain',
  callback: function (input) {
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

MML.Player = function Player(roll20_player_object) {
  const player = this;
  player.id = roll20_player_object.get('id');
  player.name = Rx.change_player_displayname.pipe(
    pluck('_displayname'),
    startWith(roll20_player_object.get('name'))
  );
  // player.characters = MML.characters.pipe(
  //   mergeMap(character => Rx.combineLatest(character.player)),
  //   filter(),
  //   scan(function (list, character) {
  //     list[character.id] = character;
  //     return  character;
  //   })
  // );

  const button_pressed = player.name.pipe(switchMap(function (name) {
    return MML.button_pressed.pipe(filter(message => name === message.who));
  }));

  player.character_menu = button_pressed.pipe(
    filter(({ content }) => content.startsWith('menu|')),
    switchMap(function ({ content }) {
      return MML.characterMenu(content.replace('menu|', '')).pipe()
    })
  );

  player.input = Rx.merge(
    MML.GM.prompt_player.pipe(filter(({player_id}) => player_id === id)),
    player.character_menu
  ).pipe(switchAll());
};



