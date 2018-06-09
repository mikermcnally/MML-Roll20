SoS.displayGmRoll = function displayGmRoll(player, message) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + message + "}}");
};

SoS.displayPlayerRoll = function displayPlayerRoll(player, message) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + message + "}}");
  return player;
};

SoS.displayRoll = function displayRoll(player, roll) {
  if (player.name === state.SoS.GM.name) {
    return SoS.displayGmRoll(player, roll);
  } else {
    return SoS.displayPlayerRoll(player, roll);
  }
};

SoS.setRollButtons = function setRollButtons(player) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton) {
      if (pressedButton === 'acceptRoll') {
        resolve(pressedButton);
      } else if (pressedButton.includes('changeRoll') && player.name === state.SoS.GM.name) {
        resolve(pressedButton.replace('changeRoll ', ''));
      }
    };
  });
};

SoS.displayTargetSelection = function displayTargetSelection(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:selectTarget}');
};

SoS.selectTarget = function selectTarget(player) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton) {
      if (pressedButton.includes('selectTarget')) {
        resolve(pressedButton.replace('selectTarget ', ''));
      }
    };
  });
};

SoS.getSingleTarget = async function getSingleTarget(player) {
  SoS.displayTargetSelection(player);
  const pressedButton = await SoS.selectTarget(player);
  return _.find(SoS.characters, character => character.name === pressedButton);
};

SoS.getMultipleTargets = async function getMultipleTargets(player, targets) {
  const newTarget = await getSingleTarget(player);
  targets.push(newTarget);
  const {pressedButton} = goToMenu(player, 'Choose additional target?', ['Yes', 'No']);
  if (pressedButton === 'Yes') {
    return SoS.getMultipleTargets(player, targets);
  } else {
    return targets
  }
};

SoS.getRadiusSpellTargets = function getRadiusSpellTargets(player, radius) {
  var token = SoS.getCharacterToken(this.id);
  var spellMarker = createObj('graphic', {
    name: 'spellMarkerCircle',
    _pageid: token.get('_pageid'),
    layer: 'objects',
    left: token.get('left'),
    top: token.get('top'),
    width: SoS.feetToPixels(radius * 2),
    height: SoS.feetToPixels(radius * 2),
    imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/27869253/ixTcySIkxTEEsbospj4PpA/thumb.png?1485314508',
    controlledby: SoS.getPlayerFromName(this.player.name).get('id')
  });
  toBack(spellMarker);

  SoS.displaySpellMarker(player, spellMarker);
};

SoS.chooseSpellTargets = function chooseSpellTargets(player, character, target) {
  if (['Caster', 'Touch', 'Single'].includes(target)) {
    return SoS.getMultipleTargets();
  } else if (target.includes('\' Radius')) {
    return SoS.getRadiusSpellTargets(parseInt(target.replace('\' Radius', '')));
  } else {
    return [];
  }
};

SoS.prepareAttackAction = async function prepareAttackAction(player, character, action) {
  action.ts = Date.now();
  action.name = 'Attack';
  const attackType = await SoS.chooseAttackType(player, character, action);
  action.attackType = attackType;

  if (attackType === 'Shoot From Cover') {
    action.modifiers.push('Shoot From Cover');
  }

  if (!_.contains([
    'Grapple',
    'Break a Hold',
    'Break Grapple',
    'Takedown',
    'Regain Feet'],
    action.attackType)
  ) {
    const calledShot = await SoS.chooseCalledShot(player);
    if (calledShot !== 'None') {
      action.modifiers.push(calledShot);
    }
  }
  if (!state.SoS.GM.roundStarted) {
    const attackStance = await SoS.chooseAttackStance(player);
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
  if (SoS.isUnarmedAction(action)) {
    action.weapon = SoS.unarmedAttacks[attackType];
  } else {
    const weapon = action.weapon;
    if (weapon.secondaryType !== '') {
      const damageType = await SoS.chooseDamageType(player);
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

SoS.chooseAttackType = async function chooseAttackType(player, character, action) {
  var buttons = [];
  var weapon = action.weapon;
  var notSomeKindOfGrappled = _.isEmpty(_.intersection(_.keys(character.statusEffects),
    ['Grappled',
    'Held',
    'Taken Down',
    'Pinned',
    'Overborne']));

  if (weapon !== 'unarmed' &&
    (weapon.family !== 'MWM' || weapon.loaded === weapon.reload) &&
    (notSomeKindOfGrappled || (!SoS.isRangedWeapon(weapon) && weapon.rank < 2))
  ) {
    buttons.push('Standard');
    if (SoS.isRangedWeapon(weapon)) {
      buttons.push('Shoot From Cover');
    // } else {
    //   buttons.push('Sweep Attack');
    }
  }

  buttons.push('Punch');
  buttons.push('Kick');
  if (!_.contains(action.modifiers, 'Release Opponent')) {
    if (!SoS.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
      buttons.push('Grapple');
    }
    if ((SoS.hasStatusEffects(character, ['Grappled', 'Holding', 'Held']) && character.movementType === 'Prone') ||
      (SoS.hasStatusEffects(character, ['Taken Down', 'Overborne']) && !_.has(character.statusEffects, 'Pinned'))
    ) {
      buttons.push('Regain Feet');
    }
    if (!SoS.hasStatusEffects(character, ['Holding', 'Held', 'Pinned']) &&
      (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
    ) {
      buttons.push('Place a Hold');
    }
    if (SoS.hasStatusEffects(character, ['Held', 'Pinned'])) {
      buttons.push('Break a Hold');
    }
    if ((_.has(character.statusEffects, 'Grappled')) && !SoS.hasStatusEffects(character, ['Held', 'Pinned'])) {
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
    if (SoS.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
      if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) {
          return target.bodyPart === 'Head';
        }).length === 0) {
        buttons.push('Head Butt');
      }
      buttons.push('Bite');
    }
  }
  const {pressedButton, selectedIds} = await SoS.goToMenu(player, 'Attack Menu', buttons);
  return pressedButton;
};

SoS.chooseCalledShot = async function chooseCalledShot(player) {
  const {pressedButton, selectedIds} = await SoS.goToMenu(player, 'Choose Called Shot', ['None', 'Body Part', 'Specific Hit Position']);
  return pressedButton;
};

SoS.chooseAttackStance = async function chooseAttackStance(player) {
  const {pressedButton, selectedIds} = await SoS.goToMenu(player, 'Choose Attack Stance', ['Neutral', 'Defensive', 'Aggressive']);
  return pressedButton;
};

SoS.chooseDamageType = async function chooseDamageType(player) {
  const {pressedButton} = await SoS.goToMenu(player, 'Choose a Damage Type', ['Primary', 'Secondary']);
  return pressedButton;
};

SoS.chooseMeleeDefense = async function chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon) {
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Dodge: ' + SoS.sumModifiers(dodgeMods) + '%', 'Take it'];
  if (!SoS.isUnarmed(character) || attackerWeapon.family === "Unarmed") {
    buttons.unshift('Block: ' + SoS.sumModifiers(blockMods) + '%');
  }
  const {pressedButton} = await SoS.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Block: ' + SoS.sumModifiers(blockMods) + '%':
      SoS.addStatusEffect(character, 'Melee This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        SoS.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return blockMods;
    case 'Dodge: ' + SoS.sumModifiers(dodgeMods) + '%':
    SoS.addStatusEffect(character, 'Melee This Round', {});
    SoS.addStatusEffect(character, 'Dodged This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        SoS.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return dodgeMods;
    case 'Take it':
      return 'Failure';
  }
};

SoS.chooseMissileDefense = async function chooseMissileDefense(player, character, dodgeMods) {
  const dodgeChance = SoS.sumModifiers(dodgeMods);
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Dodge: ' + dodgeChance + '%', 'Take it'];

  const {pressedButton} = await SoS.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Dodge: ' + dodgeChance + '%':
      SoS.addStatusEffect(character, 'Melee This Round', {});
      SoS.addStatusEffect(character, 'Dodged This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        SoS.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return dodgeMods;
    case 'Take it':
      return 'Failure';
  }
};

SoS.prepareCharacters = function prepareCharacters(player) {
  return SoS.prepareNextCharacter(player, 0);
};

SoS.prepareNextCharacter = async function prepareNextCharacter(player, index) {
  if (index < player.combatants.length) {
    await SoS.prepareAction(player, player.combatants[index]);
    return SoS.prepareNextCharacter(player, index + 1);
  } else {
    return player;
  }
};

SoS.assignStatusEffect = async function assignStatusEffect(player, character) {
  const effectName = SoS.goToMenu(player, 'Choose a Status Effect:', _.keys(SoS.statusEffects));

};

SoS.menuSelectDieSize = function menuselectDieSize(player) {
  SoS.enterNumberOfDice(player);
};

SoS.menuGmNewItem = function menuGmNewItem(player, who) {
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

SoS.menuGmNewWeapon = function menuGmNewWeapon(player, who) {
  player.who = who;
  player.message = 'Select weapon type:';
  player.buttons = [];

  _.each(SoS.items, function(item) {
    if (item.type === 'weapon') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function(text) {
          state.SoS.GM.newItem = SoS.items[text];
          SoS.displayMenu(player);
        }
      });
    }
  }, player);
};

SoS.menuGmNewShield = function menuGmNewShield(player, who) {
  player.who = who;
  player.message = 'Select shield type:';
  player.buttons = [];

  _.each(SoS.items, function(item) {
    if (item.type === 'shield') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function(text) {
          state.SoS.GM.newItem = SoS.items[text];
          SoS.displayMenu(player);
        }
      });
    }
  }, player);
};

SoS.menuGmNewArmor = function menuGmNewArmor(player, who) {
  player.who = who;
  player.message = 'Select armor style:';
  player.buttons = [];

  _.each(SoS.items, function(item) {
    if (item.type === 'armor') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmArmorMaterial',
        callback: function(text) {
          state.SoS.GM.newItem = SoS.items[text];
          SoS.displayMenu(player);
        }
      });
    }
  }, player);
};

SoS.menuGmArmorMaterial = function menuGmArmorMaterial(player, who) {
  player.who = who;
  player.message = 'Select armor material:';
  player.buttons = [];

  _.each(SoS.APVList, function(material) {
    player.buttons.push({
      text: material.name,
      nextMenu: 'menuGmItemQuality',
      callback: function(text) {
        var material = SoS.APVList[text];
        state.SoS.GM.newItem.material = material.name;
        state.SoS.GM.newItem.weight = material.weightPerPosition * state.SoS.GM.newItem.totalPostitions;
        state.SoS.GM.newItem.name = material.name + ' ' + state.SoS.GM.newItem.name;
        SoS.displayMenu(player);
      }
    });
  }, player);
};

SoS.menuGmNewItemProperties = function menuGmNewItemProperties(player, who) {
  player.who = who;
  player.message = 'Add new properties:';
  player.buttons = [player.menuButtons.assignNewItem];
};

SoS.menuGmassignNewItem = function menuGmassignNewItem(player, who) {
  player.who = who;
  player.message = 'Select character:';
  player.buttons = [];

  _.each(SoS.characters, function(character) {
    player.buttons.push({
      text: index,
      nextMenu: 'menuMainGm',
      callback: function() {
        SoS.displayMenu(player);
      }
    });
  }, player);
};

SoS.menuGmItemQuality = function menuGmItemQuality(player, who) {
  player.who = who;
  player.message = 'Select a quality level:';
  player.buttons = [player.menuButtons.itemQualityPoor,
    player.menuButtons.itemQualityStandard,
    player.menuButtons.itemQualityExcellent,
    player.menuButtons.itemQualityMasterWork
  ];
};

SoS.displayItemOptions = function displayItemOptions(player, who, itemId) {
  var character = SoS.characters[who];
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
          SoS.displayMenu(player);
        };
      } else if (character.leftHand._id === itemId) {
        unequipButton.callback = function() {
          character.leftHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          SoS.displayMenu(player);
        };
      } else {
        unequipButton.callback = function() {
          character.rightHand = {
            _id: 'emptyHand',
            grip: 'unarmed'
          };
          SoS.displayMenu(player);
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
              SoS.displayMenu(player);
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
              SoS.displayMenu(player);
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
              SoS.displayMenu(player);
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
        SoS.displayMenu(player);
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
        SoS.displayMenu(player);
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
      SoS.displayMenu(player);
    }
  });

  player.buttons = buttons;
  SoS.displayMenu(player);
};

SoS.prepareCastAction = async function chooseSpell(player, character, action) {
  const message = 'Choose a spell';
  const buttons = character.spells.reduce(function(availableSpells, spellName) {
    if (_.isUndefined(SoS.spells[spellName].requiredItem) ||
      (_.isUndefined(action.items) &&
        (character.inventory[character.rightHand._id].name === SoS.spells[spellName].requiredItem || character.inventory[character.leftHand._id].name === SoS.spells[spellName].requiredItem)) ||
      (!_.isUndefined(action.items) &&
        _.filter(action.items, function(item) {
          return character.inventory[item.itemId].name === SoS.spells[spellName].requiredItem;
        }, character).length > 0)
    ) {
      return availableSpells.concat(spellName);
    }
  });
  const spellName = await SoS.goToMenu(player, message, buttons);
  const spell = SoS.spells[spellName];

};

SoS.chooseMetaMagicInitiative = async function chooseMetaMagicInitiative(player, character, action) {
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

  const {pressedButton} = await SoS.goToMenu(player, 'Choose meta magic', buttons);
  switch (pressedButton) {
    case 'Called Shot':
    case 'Called Shot Specific':
    case 'Ease Spell':
    case 'Hasten Spell':
      action.modifiers.push(player.pressedButton);
      return SoS.chooseMetaMagicInitiative(player, character, action);
    case 'Remove Called Shot':
    case 'Remove Called Shot Specific':
    case 'Remove Ease Spell':
    case 'Remove Hasten Spell':
      action.modifiers = _.without(action.modifiers, player.pressedButton.replace('Remove ', ''));
      return SoS.chooseMetaMagicInitiative(player, character, action);
    case 'Next Menu':
      return action;
  }
};

SoS.chooseMetaMagic = async function chooseMetaMagic(player, character, action){
  const buttons = _.without(action.spell.metaMagic, 'Called Shot', 'Called Shot Specific')
    .map(metaMagicName => _.contains(action.modifiers, metaMagicName) ? 'Remove ' + metaMagicName : metaMagicName)
    .concat('Cast Spell');
  const {pressedButton} = await SoS.goToMenu(player, 'Choose meta magic', buttons);
  if (pressedButton.indexOf('Remove ') === 0) {
    action.modifiers = _.without(action.modifiers, pressedButton.replace('Remove ', ''));
    return SoS.chooseMetaMagic(player, character, action);
  } else if (pressedButton !== 'Cast Spell') {
    action.modifiers.push(pressedButton);
    return SoS.chooseMetaMagic(player, character, action);
  } else {
    return action;
  }
};

SoS.menucharAddTarget = function menucharAddTarget(player, who) {
  player.who = who;
  player.buttons = [];
  var character = SoS.characters[who];
  state.SoS.GM.currentAction.parameters.metaMagic['Increase Targets'] = {
    epMod: state.SoS.GM.currentAction.targetArray.length,
    castingMod: -10 * state.SoS.GM.currentAction.targetArray.length
  };
  var parameters = state.SoS.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  player.message = 'Current EP Cost: ' + epProduct + '\nAdd another target or cast spell:';
};

SoS.menucharIncreasePotency = function menucharIncreasePotency(player, who) {
  player.who = who;
  player.message = 'Increase potency by how many times?';
  player.buttons = [];
  var character = SoS.characters[who];
  var parameters = state.SoS.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > Math.pow(2, i - 1) * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + Math.pow(2, i - 1) * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.SoS.GM.currentAction.parameters.metaMagic['Increase Potency'] = {
          epMod: Math.pow(2, i - 1),
          castingMod: -10,
          level: i
        };
        SoS.chooseMetaMagic(player, who);
        SoS.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      SoS.chooseMetaMagic(player, who);
      SoS.displayMenu(player);
    }
  });
};

SoS.menucharIncreaseDuration = function menucharIncreaseDuration(player, who) {
  player.who = who;
  player.message = 'Increase duration by how many times?';
  player.buttons = [];
  var character = SoS.characters[who];
  var parameters = state.SoS.GM.currentAction.parameters;
  var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) {
    return memo * num;
  }) * parameters.epCost;
  var i = 2;

  while (character.ep > i * epProduct) {
    player.buttons.push({
      text: 'Times: ' + i + ' EP Cost: ' + i * epProduct,
      nextMenu: 'menuPause',
      callback: function() {
        state.SoS.GM.currentAction.parameters.metaMagic['Increase Duration'] = {
          epMod: i,
          castingMod: 0,
          level: i
        };
        SoS.chooseMetaMagic(player, who);
        SoS.displayMenu(player);
      }
    });
    i++;
  }
  player.buttons.push({
    text: 'Back',
    nextMenu: 'menuPause',
    callback: function() {
      SoS.chooseMetaMagic(player, who);
      SoS.displayMenu(player);
    }
  });
};

SoS.readyItem = async function readyItem(player, character, action) {
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

  const itemName = await SoS.goToMenu(player, 'Choose item or items for ' + character.name, _.keys(itemMap).concat('Back'))
    .then(function(player) {
      return SoS.chooseGrip(player, character, itemMap, player.pressedButton);
    });
};

SoS.chooseGrip = function chooseGrip(player, character, itemMap, selectedItem) {
  var item = character.inventory[itemMap[selectedItem]];
  return SoS.goToMenu(player, SoS.menuchooseGrip(player, character, item))
    .then(function(player) {
      var itemWithGrip = { item: item, grip: player.pressedButton };
      if (player.pressedButton === 'Left Hand' || player.pressedButton === 'Right Hand') {
        return SoS.readyAdditionalItem(player, character, _.omit(itemMap, selectedItem), itemWithGrip);
      }
      return [itemWithGrip];
    });
};

SoS.menuchooseGrip = function menuchooseGrip(player, character, item) {
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

SoS.readyAdditionalItem = function readyAdditionalItem(player, character, itemMap, previousItem) {
  var message = 'Choose another item or continue';
  var buttons = _.keys(itemMap).concat('Continue');
  return SoS.goToMenu(player, {message: message, buttons: buttons})
    .then(function(player) {
      var item = character.inventory[itemMap[player.pressedButton]];
      return [previousItem, { item: item, grip: previousItem.grip === 'Right Hand' ? 'Left Hand' : 'Right Hand' }];
    });
};

SoS.finalizeAction = async function finalizeAction(player, character, action) {
  var message;
  var buttons;
  if (state.SoS.GM.roundStarted === true) {
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
  const {pressedButton} = await SoS.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Roll':
      SoS.setAction(character, action);
      await SoS.initiativeRoll(player, character, action);
      break;
    case 'Edit Action':
      return SoS.prepareAction(player, character);
    case 'Accept':
      SoS.setAction(character, action);
      return player;
  }
};

SoS.startAction = async function startAction(player, character, validAction) {
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

  const {pressedButton} = await SoS.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Start Action':
      await SoS.combatMovement(player, character);
      return SoS.processAction(player, character, character.action);
    case 'Change Action':
      if (_.has(character.statusEffects, 'Changed Action')) {
        character.statusEffects['Changed Action'].level++;
      } else {
        SoS.addStatusEffect(character, 'Changed Action', {
          id: SoS.generateRowID(),
          name: 'Changed Action',
          level: 1
        });
      }
      return SoS.prepareAction(player, character);
    case 'Movement Only':
      await SoS.combatMovement(player, character);
      return SoS.endAction(player, character, character.action);
    }
};

SoS.combatMovement = async function combatMovement(player, character) {
  SoS.displayThreatZones(true);
  const message = 'Move ' + character.name + '.';
  const buttons = ['Prone', 'Stalk', 'Crawl', 'Walk', 'Jog', 'Run', 'End Movement'];
  const {pressedButton} = await SoS.goToMenu(player, message, buttons);

  if (pressedButton !== 'End Movement') {
    character.movementType = pressedButton;
    SoS.displayMovement(character);
    await SoS.goToMenu(player, 'End ' + character.name + '\'s movement', ['End Movement']);
    SoS.displayThreatZones(false);
  } else {
    SoS.displayThreatZones(false);
  }
};

SoS.displaySpellMarker = async function displaySpellMarker(player, spellMarker) {
  await SoS.goToMenu(player, 'Move and resize spell marker.', ['Accept']);
  var targets = await SoS.getAoESpellTargets(spellMarker);
  var character = SoS.characters[who];
  _.each(SoS.characters, function(character) {
    var token = SoS.getCharacterToken(character.id);
    if (!_.isUndefined(token)) {
      token.set('tint_color', 'transparent');
    }
  });
  spellMarker.remove();
  SoS.setCurrentCharacterTargets(player, {
    targets: targets
  });
};

SoS.menucharGenericRoll = function menucharGenericRoll(player, who, message, dice, name, callback) {
  player.who = who;
  player.message = message;
  player.buttons = [{
    text: 'Roll ' + dice,
    nextMenu: 'menuIdle',
    callback: function() {
      SoS.genericRoll(SoS.characters[who], name, dice, callback);
    }
  }];
};

SoS.menucharReloadAction = function menucharReloadAction(player, who) {
  player.who = who;
  player.message = player.who + ' reloads. ' + state.SoS.GM.currentAction.parameters.attackerWeapon.loaded + '/' + state.SoS.GM.currentAction.parameters.attackerWeapon.reload + ' done.';
  player.buttons = [player.menuButtons.endAction];
};

SoS.menucharContinueCasting = function menucharContinueCasting(player, who) {
  player.who = who;
  player.message = player.who + '\' starts casting a spell.';
  player.buttons = [player.menuButtons.endAction];
};

SoS.setCurrentCharacterTargets = function setCurrentCharacterTargets(player, input) {
  var targetArray;

  if (!_.isUndefined(input.target)) {
    targetArray = [input.target];
  } else {
    targetArray = input.targets;
  }
  state.SoS.GM.currentAction.targetArray = targetArray;
  state.SoS.GM.currentAction.targetIndex = 0;
};

SoS.menuButtons = {};

SoS.menuButtons.newItemMenu = {
  text: 'New Item',
  nextMenu: 'GmMenuNewItem',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.newWeapon = {
  text: 'Weapon',
  nextMenu: 'GmMenuNewWeapon',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.newShield = {
  text: 'Shield',
  nextMenu: 'GmMenuNewShield',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.newArmor = {
  text: 'Armor',
  nextMenu: 'GmMenuNewArmor',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.newSpellComponent = {
  text: 'Spell Component',
  nextMenu: 'GmMenuNewSpellComponent',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.newMiscItem = {
  text: 'Misc',
  nextMenu: 'GmMenuNewMiscItem',
  callback: function() {
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.itemQualityPoor = {
  text: 'Poor',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.SoS.GM.newItem.quality = text;
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.itemQualityStandard = {
  text: 'Standard',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.SoS.GM.newItem.quality = text;
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.itemQualityExcellent = {
  text: 'Excellent',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.SoS.GM.newItem.quality = text;
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.itemQualityMasterWork = {
  text: 'Master Work',
  nextMenu: 'GmMenuNewItemProperties',
  callback: function(text) {
    state.SoS.GM.newItem.quality = text;
    SoS.displayMenu(player);
  }
};

SoS.menuButtons.assignNewItem = {
  text: 'Assign Item',
  nextMenu: 'GmMenuMain',
  callback: function(input) {
    input.charName = player.name;
    input.callback = 'assignNewItem';
    SoS.displayTargetSelection(input);
  }
};


SoS.GmMenuWorld = function GmMenuWorld(player, input) {
  //pass time, travel, other stuff
};

SoS.GmMenuUtilities = function GmMenuUtilities(player, input) {
  //edit states and other api stuff
};

SoS.Player = function Player(name, isGM) {
  this.name = name;
  this.characters = [];
};
