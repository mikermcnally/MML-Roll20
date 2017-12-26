MML.displayGmRoll = function displayGmRoll(player, roll) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenuGM} {{title=' + roll.message + "}}");
  return player;
};

MML.displayPlayerRoll = function displayPlayerRoll(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:rollMenu} {{title=' + roll.message + "}}");
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
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton) {
      if (pressedButton === 'acceptRoll' || (pressedButton.indexOf('changeRoll') > -1 && player.name === state.MML.GM.name)) {
        resolve(pressedButton);
      }
    };
  });
};

MML.displayTargetSelection = function displayTargetSelection(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:selectTarget}');
};

MML.selectTarget = function selectTarget(player) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton) {
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
  var token = MML.getCharacterToken(this.id);
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
    'Regain Feet'],
    action.attackType)
  ) {
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
  var notSomeKindOfGrappled = _.isEmpty(_.intersection(_.keys(character.statusEffects),
    ['Grappled',
    'Held',
    'Taken Down',
    'Pinned',
    'Overborne']));

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
      if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) {
          return target.bodyPart === 'Head';
        }).length === 0) {
        buttons.push('Head Butt');
      }
      buttons.push('Bite');
    }
  }
  const {pressedButton, selectedIds} = await MML.goToMenu(player, 'Attack Menu', buttons);
  return pressedButton;
};

MML.chooseCalledShot = async function chooseCalledShot(player) {
  const {pressedButton, selectedIds} = await MML.goToMenu(player, 'Choose Called Shot', ['None', 'Body Part', 'Specific Hit Position']);
  return pressedButton;
};

MML.chooseAttackStance = async function chooseAttackStance(player) {
  const {pressedButton, selectedIds} = await MML.goToMenu(player, 'Choose Attack Stance', ['Neutral', 'Defensive', 'Aggressive']);
  return pressedButton;
};

MML.chooseDamageType = async function chooseDamageType(player) {
  const {pressedButton} = await MML.goToMenu(player, 'Choose a Damage Type', ['Primary', 'Secondary']);
  return pressedButton;
};

MML.chooseMeleeDefense = async function chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon) {
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Dodge: ' + MML.sumModifiers(dodgeMods) + '%', 'Take it'];
  if (!MML.isUnarmed(character) || attackerWeapon.family === "Unarmed") {
    buttons.unshift('Block: ' + MML.sumModifiers(blockMods) + '%');
  }
  const {pressedButton} = await MML.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Block: ' + MML.sumModifiers(blockMods) + '%':
      character.statusEffects['Melee This Round'] = {
        id: MML.generateRowID(),
        name: 'Melee This Round'
      };
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return {name: 'Block', modifiers: blockMods};
    case 'Dodge: ' + MML.sumModifiers(dodgeMods) + '%':
      character.statusEffects['Melee This Round'] = {
        id: MML.generateRowID(),
        name: 'Melee This Round'
      };
      character.statusEffects['Dodged This Round'] = {
        id: MML.generateRowID(),
        name: 'Dodged This Round'
      };
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return {name: 'Dodge', modifiers: dodgeMods};
    case 'Take it':
      return 'Failure';
  }
};

MML.enterNumberOfDice = function enterNumberOfDice(player) {
  sendChat(player.name, '/w "' + player.name + '" &{template:menuenterNumberOfDice} {{title=Enter Number of Dice}}');
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

MML.assignStatusEffect = function assignStatusEffect(player, character) {
  return MML.goToMenu(player, MML.menuassignStatusEffect(player, character))
    .then(function(player) {
      return player, character;
    });
};

MML.menuselectDieSize = function menuselectDieSize(player, who) {
  player.who = who;
  player.message = 'Choose a Status Effect: ';
  player.buttons = [];

  player.buttons.push({
    text: '2',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      player.dice = '2';
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '3',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '4',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '6',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      player.dice = '6';
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '8',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '10',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '12',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '20',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
  player.buttons.push({
    text: '100',
    nextMenu: 'menuselectDieNumber',
    callback: function() {
      MML.displayMenu(player);
    }
  });
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

  _.each(MML.items, function(item) {
    if (item.type === 'weapon') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmNewShield = function menuGmNewShield(player, who) {
  player.who = who;
  player.message = 'Select shield type:';
  player.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === 'shield') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmItemQuality',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmNewArmor = function menuGmNewArmor(player, who) {
  player.who = who;
  player.message = 'Select armor style:';
  player.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === 'armor') {
      player.buttons.push({
        text: item.name,
        nextMenu: 'menuGmArmorMaterial',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          MML.displayMenu(player);
        }
      });
    }
  }, player);
};

MML.menuGmArmorMaterial = function menuGmArmorMaterial(player, who) {
  player.who = who;
  player.message = 'Select armor material:';
  player.buttons = [];

  _.each(MML.APVList, function(material) {
    player.buttons.push({
      text: material.name,
      nextMenu: 'menuGmItemQuality',
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

MML.menuGmNewItemProperties = function menuGmNewItemProperties(player, who) {
  player.who = who;
  player.message = 'Add new properties:';
  player.buttons = [player.menuButtons.assignNewItem];
};

MML.menuGmassignNewItem = function menuGmassignNewItem(player, who) {
  player.who = who;
  player.message = 'Select character:';
  player.buttons = [];

  _.each(MML.characters, function(character) {
    player.buttons.push({
      text: index,
      nextMenu: 'menuMainGm',
      callback: function() {
        MML.displayMenu(player);
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

MML.chooseSpell = function chooseSpell([player, character, action]) {
  return MML.goToMenu(player, MML.menuchooseSpell(player, character, action))
    .then(function(player) {
      return [player, character, action];
    });
};

MML.chooseMetaMagicInitiative = function chooseMetaMagicInitiative([player, character, action]) {
  return MML.goToMenu(player, MML.menuchooseMetaMagicInitiative(player, character, action))
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
  return MML.goToMenu(player, MML.menuchooseMetaMagic(player, character, action))
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

MML.menucharAddTarget = function menucharAddTarget(player, who) {
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

MML.menucharIncreasePotency = function menucharIncreasePotency(player, who) {
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

MML.menucharIncreaseDuration = function menucharIncreaseDuration(player, who) {
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

  return MML.goToMenu(player, MML.menureadyItem(player, character, itemMap))
    .then(function(player) {
      return MML.chooseGrip(player, character, itemMap, player.pressedButton);
    });
};

MML.menureadyItem = function menureadyItem(player, character, itemMap) {
  var message = 'Choose item or items for ' + character.name;
  var buttons = _.keys(itemMap).concat('Back');
  return {message: message, buttons: buttons};
};

MML.chooseGrip = function chooseGrip(player, character, itemMap, selectedItem) {
  var item = character.inventory[itemMap[selectedItem]];
  return MML.goToMenu(player, MML.menuchooseGrip(player, character, item))
    .then(function(player) {
      var itemWithGrip = { item: item, grip: player.pressedButton };
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
  const {pressedButton} = await MML.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Roll':
      MML.setAction(character, action);
      await MML.initiativeRoll(player, character, action);
      break;
    case 'Edit Action':
      return MML.buildAction(player, character, {
        ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
        modifiers: [],
        weapon: MML.getEquippedWeapon(character)
      });
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

  const {pressedButton} = await MML.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Start Action':
      await MML.combatMovement(player, character);
      return await MML.processAction(player, character, character.action);
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
      return MML.buildAction(player, character);
    case 'Movement Only':
      await MML.combatMovement(player, character);
      return MML.endAction(player, character, character.action);
    }
};

MML.combatMovement = async function combatMovement(player, character) {
  MML.displayThreatZones(true);
  const message = 'Move ' + character.name + '.';
  const buttons = ['Prone', 'Stalk', 'Crawl', 'Walk', 'Jog', 'Run', 'End Movement'];
  const {pressedButton} = await MML.goToMenu(player, message, buttons);

  if (pressedButton !== 'End Movement') {
    character.movementType = pressedButton;
    MML.displayMovement(character);
    await MML.goToMenu(player, 'End ' + character.name + '\'s movement', ['End Movement']);
    MML.displayThreatZones(false);
  } else {
    MML.displayThreatZones(false);
  }
};

MML.displaySpellMarker = function displaySpellMarker(player) {
  return MML.goToMenu(player, { message: 'Move and resize spell marker.', buttons: ['Accept'] })
    .then(function (player) {
      var spellMarker = MML.getSpellMarkerToken(state.MML.GM.currentAction.parameters.spellMarker);
      var targets = MML.getAoESpellTargets(spellMarker);
      var character = MML.characters[who];
      _.each(MML.characters, function(character) {
        var token = MML.getCharacterToken(character.id);
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

MML.menucharSelectBodyPart = function menucharSelectBodyPart(player, who) {
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

MML.menucharSelectHitPosition = function menucharSelectHitPosition(player, who) {
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

MML.menucharRangedDefenseRoll = function menucharRangedDefenseRoll(player, who, defenseChance) {
  var character = MML.characters[who];
  player.who = who;
  player.message = 'How will ' + who + ' defend?';
  player.buttons = [{
    text: 'Defend: ' + defenseChance + '%',
    nextMenu: 'menuIdle',
    callback: function() {
      character.statusEffects['Melee player Round'] = {
        id: MML.generateRowID(),
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

MML.menucharGrappleDefenseRoll = function menucharGrappleDefenseRoll(player, who, brawlChance, attackChance) {
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

MML.resistRelease = function resistRelease(player, who, attacker) {
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

MML.menucharGenericRoll = function menucharGenericRoll(player, who, message, dice, name, callback) {
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

MML.Player = function Player(name, isGM) {
  this.name = name;
  this.characters = [];
};
