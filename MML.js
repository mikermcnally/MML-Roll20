MML.prepareAction = async function prepareAction(player, character) {
  try {
    var action = {
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: MML.getEquippedWeapon(character)
    };

    if (_.has(character.statusEffects, 'Stunned')) {
      MML.applyStatusEffects(character);
      _.extend(action, { ts: Date.now(), name: 'Movement Only' });
      await MML.finalizeAction(player, character, action);
    } else if (character.situationalInitBonus !== 'No Combat') {
      action = await MML.buildAction(player, character, action);
      await MML.finalizeAction(player, character, action);
    } else {
      _.extend(action, { ts: Date.now(), name: 'No Combat' });
    }
    MML.setReady(character, true);
    return action;
  } catch (err) {
    log(err.stack);
  }
};

MML.buildAction = async function buildAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    const weaponWithGrip = _.find(action.items, itemWithGrip => itemWithGrip.item.type === 'weapon');
    if (_.isUndefined(weaponWithGrip)) {
      action.weapon = 'unarmed';
    } else {
      if (weaponWithGrip.grip === 'Right Hand' || weaponWithGrip.grip === 'Left Hand') {
        action.weapon = MML.buildWeaponObject(weaponWithGrip.item, 'One Hand');
      } else {
        action.weapon = MML.buildWeaponObject(weaponWithGrip.item, weaponWithGrip.grip);
      }
    }
  } else {
    action.weapon = MML.getEquippedWeapon(character);
  }

  const action_type = await MML.chooseActionType(player, character, action);
  switch (action_type) {
    case 'Observe':
      return _.extend(action, { ts: Date.now(), name: 'Observe' });
    case 'Movement Only':
      return _.extend(action, { ts: Date.now(), name: 'Movement Only' });
    case 'Attack':
      return await MML.prepareAttackAction(player, character, action);
    case 'Ready Item':
      const itemArray = await MML.readyItem(player, character, action);
      action.items = itemArray;
      action.modifiers.push('Ready Item');
      return MML.buildAction(player, character, action);
    case 'Aim':
      return _.extend(action, { ts: Date.now(), name: 'Aim' });
    case 'Reload':
      return _.extend(action, { ts: Date.now(), name: 'Reload' });
    case 'Release Opponent':
      action.modifiers.push('Release Opponent');
      return MML.buildAction(player, character, action);
    case 'Cast':
      return await MML.prepareCastAction([player, character, action]);
    case 'Continue Casting':
      return MML.clone(character.previousAction);
  }
};

MML.chooseActionType = async function chooseActionType(player, character, action) {
  const message = 'Prepare ' + character.name + '\'s action';
  var buttons = ['Movement Only', 'Observe', 'Ready Item', 'Attack'];

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
    !_.contains(action.modifiers, 'Release Opponent')
  ) {
    buttons.push('Release Opponent');
  }

  if (character.spells.length > 0) {
    buttons.push('Cast');
  }

  if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
    buttons.push('Continue Casting');
  }

  const {pressedButton, selectedIds} = await MML.displayMenu(player, message, buttons);
  return pressedButton;
};

MML.isUnarmedAction = function isUnarmedAction(action) {
  return _.contains([
    'Punch',
    'Kick',
    'Head Butt',
    'Bite',
    'Grapple',
    'Place a Hold',
    'Break a Hold',
    'Break Grapple',
    'Takedown',
    'Regain Feet'],
    action.attackType);
};

MML.processAction = async function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function(itemWithGrip) {
      MML.equipItem(character, itemWithGrip.item._id, itemWithGrip.grip);
    });
  }
  if (_.contains(action.modifiers, 'Release Opponent')) {
    return MML.releaseOpponent(player, character, action);
  }
  switch (action.name) {
    case 'Attack':
      return await MML.processAttack(player, character, action);
    case 'Observe':
      return MML.observeAction(player, character, action);
    case 'Movement Only':
      return MML.endAction(player, character, action);
    case 'Release Opponent':
      return MML.Release(player, character, action);
    case 'Cast':
      return MML.castAction(player, character, action);
    case 'Aim':
      return MML.aimAction(player, character, action);
  }
  // } else if (action.name === 'Cast') {
  //   action.spell.actions--;
  //   if (action.spell.actions > 0) {
  //     character.player.charMenuContinueCasting(character.name);
  //     character.player.sendChatMenu();
  //       parameters: {
  //         spell: action.spell,
  //         casterSkill: action.skill,
  //         epCost: MML.getEpCost(action.skillName, action.skill, action.spell.ep),
  //         metaMagic: {
  //           base: {
  //             epMod: 1,
  //             castingMod: 0
  //           }
  //         }
  //     character.player.chooseMetaMagic(character.name);
};

MML.processAttack = async function processAttack(player, character, action) {
  MML.addStatusEffect(character, 'Melee This Round', {
    name: 'Melee This Round'
  });

  var attackType = action.attackType;
  if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].includes(attackType)) {
    return MML.grappleAttackAction(player, character, action);
  } else if (MML.isDualWielding(character)) {
    return MML.dualWieldAttackAction(player, character, action);
  } else if (MML.isWieldingMissileWeapon(character)) {
    return MML.missileAttackAction(player, character, action);
  } else if (MML.isWieldingThrowingWeapon(character)) {
    return MML.throwingAttackAction(player, character, action);
  } else {
    return await MML.meleeAttackAction(player, character, action);
  }
};

MML.missileAttackAction = async function missileAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await MML.getSingleTarget(player);
  const attack = await MML.missileAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await MML.missileDefense(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await MML.hitPositionRoll(player, character, target, action);
      const damage = await MML.missileDamageRoll(player, character, target, weapon, attack);
      await MML.damageCharacter(target.player, target, weapon.damageType, hitPosition, damage);
    }
  }
  return MML.endAction(player, character, action, target);
};

MML.meleeAttackAction = async function meleeAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await MML.getSingleTarget(player);
  const attack = await MML.meleeAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await MML.meleeDefenseRoll(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await MML.hitPositionRoll(player, character, target, action);
      const damage = await MML.meleeDamageRoll(player, character, weapon, attack);
      await MML.damageCharacter(target.player, target, damage, weapon.damageType, hitPosition);
    }
  }
  return MML.endAction(player, character, action, target);
};

MML.castAction = async function castAction(player, character, action) {
  await MML.spells[action.spell.name](player, character, action);
  return MML.endAction(player, character, action);
};

MML.observeAction = async function observeAction(player, character, action) {
  MML.addStatusEffect(character, 'Observing', {
    id: MML.generateRowID(),
    name: 'Observing',
    startingRound: state.MML.GM.currentRound
  });
  await MML.displayMenu(player, character.name + ' observes the situation.', ['End Action']);
  return MML.endAction(player, character, action);
};

MML.aimAction = async function aimAction(player, character, action) {
  if (!_.has(character.statusEffects, 'Taking Aim')) {
    const target = await MML.getSingleTarget(player);
    MML.addStatusEffect(character, 'Taking Aim', {
      id: MML.generateRowID(),
      name: 'Taking Aim',
      level: 1,
      target: target,
      startingRound: state.MML.GM.currentRound
    });
    await MML.displayMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
    return MML.endAction(player, character, action);
  } else if (character.statusEffects['Taking Aim'].startingRound !== state.MML.GM.currentRound && attackerWeapon.family === 'MWD') {
    const holdAimRoll = await MML.holdAimRoll(player, character, target);
    if (MML.failure(holdAimRoll)) {
      return await MML.missileAttackAction(player, character, action);
    } else {
      if (target.id === character.statusEffects['Taking Aim'].target.id) {
        character.statusEffects['Taking Aim'].level = 2;
      } else {
        character.statusEffects['Taking Aim'].target = target;
        character.statusEffects['Taking Aim'].level = 1;
        character.statusEffects['Taking Aim'].startingRound = state.MML.GM.currentRound;
      }
      await MML.displayMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
      return MML.endAction(player, character, action);
    }
  }
};

MML.reloadAction = async function reloadAction(player, character, action) {
  var weapon = character.inventory[action.weapon._id];
  weapon.loaded++;
  await MML.displayMenu(player, character.name + ' reloads their ' + weapon.name + ' (' + weapon.loaded + '/' + weapon.reload + ')', ['End Action']);
  return MML.endAction(player, character, action);
};

MML.endAction = function endAction(player, character, action, targets) {
  character.spentInitiative = character.spentInitiative +
    character.actionTempo +
    (character.actionInitCostMod > -1 ? -1 : character.actionTempo + character.actionInitCostMod);
  character.previousAction = MML.clone(character.action);
  MML.updateCharacter(character);
  _.each(action.targetArray || [], function(target) {
    MML.updateCharacter(MML.characters[target]);
  });

  if (character.initiative > 0) {
    return MML.prepareAction(player, character);
  } else {
    return player;
  }
};
MML.displayMovement = function displayMovement(character) {
  var token = MML.getCharacterToken(character.id);
  var path = getObj('path', character.pathID);

  if (!_.isUndefined(path)) {
    path.remove();
  }
  var pathID = MML.drawCirclePath(token.get('left'), token.get('top'), MML.movementRates[race][character.movementType] * character.movementAvailable).id;
  character.pathID = pathID;
};

MML.moveDistance = function moveDistance(character, distance) {
  var remainingMovement = character.movementAvailable - (distance) / (MML.movementRates[race][character.movementType]);
  if (character.movementAvailable > 0) {
    character.movementAvailable = remainingMovement;
    MML.displayMovement(character);
  } else {
    var path = getObj('path', character.pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
  }
};

MML.setCombatVision = function setCombatVision(character) {
  var token = MML.getCharacterToken(character.id);
  if (state.MML.GM.inCombat || !_.has(character.statusEffects, 'Observing')) {
    token.set('light_losangle', character.fov);
    token.set('light_hassight', true);
  } else {
    token.set('light_losangle', 360);
    token.set('light_hassight', true);
  }
};

MML.alterHP = async function alterHP(player, character, bodyPart, hpAmount) {
  var initialHP = character.hp[bodyPart];
  var currentHP = initialHP + hpAmount;
  var maxHP = character.hpMax[bodyPart];

  if (hpAmount < 0) { //if damage
    var duration;
    character.hp[bodyPart] = currentHP;

    //Wounds
    if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
      if (initialHP >= Math.round(maxHP / 2)) { //Fresh wound
        duration = Math.round(maxHP / 2) - currentHP;
      } else if (!_.has(character.statusEffects, 'Major Wound, ' + bodyPart)) {
        duration = -hpAmount;
      } else { //Add damage to duration of effect
        duration = parseInt(character.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
      }
      await MML.displayMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
      const result = await MML.attributeCheckRoll(player, character.willpower);
      if (result === 'Failure') {
        MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
          duration: duration,
          startingRound: state.MML.GM.currentRound,
          bodyPart: bodyPart
        });
      }
    } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
      if (!_.has(character.statusEffects, 'Disabling Wound, ' + bodyPart)) { //Fresh wound
        duration = -currentHP;
      } else if (_.has(character.statusEffects, 'Stunned')) { //Add damage to duration of effect
        duration = parseInt(character.statusEffects['Stunned'].duration) - hpAmount;
      } else {
        duration = -hpAmount;
      }
      await MML.displayMenu(player, character.name + '\'s Disabling Wound Roll', ['Roll']);
      const result = await MML.attributeCheckRoll(player, character.systemStrength);
      MML.addStatusEffect(character, 'Disabling Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
      if (result === 'Failure') {
        if (_.has(character.statusEffects, 'Stunned')) {
          character.statusEffects['Stunned'].duration = duration;
        } else {
          MML.addStatusEffect(character, 'Stunned', {
            startingRound: state.MML.GM.currentRound,
            duration: duration
          });
        }
      }
    } else if (currentHP < -maxHP) { //Mortal wound
      MML.addStatusEffect(character, 'Mortal Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
    }
  } else { //if healing
    character.hp[bodyPart] += hpAmount;
    if (character.hp[bodyPart] > maxHP) {
      character.hp[bodyPart] = maxHP;
    }
  }
  await MML.setWoundFatigue(player, character);
};

MML.setWoundFatigue = async function setWoundFatigue(player, character) {
  const currentHP = character.hp;
  currentHP['Wound Fatigue'] = character.hpMax['Wound Fatigue'];

  _.each(MML.getBodyParts(character), function (bodyPart) {
    if (currentHP[bodyPart] >= Math.round(character.hpMax[bodyPart] / 2)) { //Only minor wounds apply
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - currentHP[bodyPart];
    } else {
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - Math.round(character.hpMax[bodyPart] / 2);
    }
  });

  if (currentHP['Wound Fatigue'] < 0 && !_.has(character.statusEffects, 'Wound Fatigue')) {
    await MML.displayMenu(player, character.name + '\'s Wound Fatigue Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.systemStrength);
    if (result === 'Failure') {
      MML.addStatusEffect(character, 'Wound Fatigue', {});
    }
  }
};

MML.knockdownCheck = async function knockdownCheck(player, character, damage) {
  character.knockdown += damage;
  if (character.movementType !== 'Prone' && character.knockdown < 1) {
    await MML.displayMenu(player, character.name + '\'s Knockdown Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0])
    if (result === 'Failure') {
      character.movementType = 'Prone';
    } else {
      MML.addStatusEffect(character, 'Stumbling', {
        startingRound: state.MML.GM.currentRound
      });
    }
  }
};

MML.sensitiveAreaCheck = async function sensitiveAreaCheck(player, character, hitPosition) {
  if (MML.sensitiveAreas[character.bodyType].includes(hitPosition)) {
    await MML.displayMenu(player, character.name + '\'s Sensitive Area Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.willpower);
    if (result === 'Failure') {
      MML.addStatusEffect(character, 'Sensitive Area', {
        startingRound: state.MML.GM.currentRound
      });
    }
  }
};

MML.damageCharacter = async function damageCharacter(player, character, damage, type, hitPosition) {
  const reducedDamage = await MML.armorDamageReduction(player, character, hitPosition.name, damage, type);
  await MML.alterHP(player, character, hitPosition.bodyPart, reducedDamage);
  await MML.sensitiveAreaCheck(player, character, hitPosition.name);
  await MML.knockdownCheck(player, character, damage);
};

MML.alterEP = async function alterEP(player, character, epAmount) {
  character.ep += epAmount;
  if (character.ep < Math.round(0.25 * character.epMax)) {
    await MML.fatigueCheck(player, character);
  }
};

MML.armorDamageReduction = async function armorDamageReduction(player, character, position, damage, type) {
  const positionApvs = character.armorProtectionValues[position];
  const baseApvs = positionApvs[type];
  const impactApvs = positionApvs['Impact'];
  var apvBase;
  var apvImpact;
  if (baseApvs.length > 1) {
    await MML.displayMenu(player, 'Armor Coverage Roll', ['Roll']);
    const coverageRoll = await genericRoll(player, '1d100');
    apvBase = _.find(positionApvs[type], function (apv) {
      return coverageRoll <= apv.coverage;
    }).value;
    apvImpact = _.find(positionApvs.Impact, function (apv) {
      return coverageRoll <= apv.coverage;
    }).value;
  } else {
    apvBase = baseApvs[0];
    apvImpact = impactApvs[0];
  }
  const baseDamage = damage + apvBase;
  if (baseDamage > 0 && !['Impact', 'Flanged'].includes(type)) {
    const impactDamage = ['Surface', 'Cut', 'Pierce'].includes(type) ? Math.ceil(damage / 2) : Math.ceil(damage * 0.75);
    if (impactDamage + apvImpact < 0) {
      return impactDamage + apvImpact;
    }
  }
  return 0;
};

MML.equipmentFailure = function equipmentFailure(character) {
  log('equipmentFailure');
};

MML.applyStatusEffects = function applyStatusEffects(character) {
  const dependents = [
    'situationalInitBonus',
    'situationalMod',
    'missileDefenseMod',
    'meleeDefenseMod',
    'missileAttackMod',
    'meleeAttackMod',
    'castingMod',
    'perceptionCheckMod'
  ];
  _.each(dependents, function (dependent) {
    character[dependent] = 0;
  }, character);
  _.each(character.statusEffects, function (effect, index) {
    if (index.indexOf('Major Wound') !== -1) {
      MML.statusEffects['Major Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Disabling Wound') !== -1) {
      MML.statusEffects['Disabling Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Mortal Wound') !== -1) {
      MML.statusEffects['Mortal Wound'].apply(character, [effect, index]);
    } else {
      MML.statusEffects[index].apply(character, [effect, index]);
    }
    MML.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectName', index);
    MML.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectDescription', (effect.description ? effect.description : ''));
  });

  const regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
  const statusEffectIDs = _.pluck(character.statusEffects, 'id');
  const statusEffects = filterObjs(function (obj) {
    if (obj.get('type') !== 'attribute' || obj.get('characterid') !== character.id) {
      return false;
    } else {
      return regex.test(obj.get('name'));
    }
  });
  _.each(statusEffects, function (attribute) {
    const name = attribute.get('name', 'current');
    if (_.isString(name) && !statusEffectIDs.some(id => name.includes(id))) {
      attribute.remove();
    }
  });
};

MML.addStatusEffect = function addStatusEffect(character, index, effect) {
  effect.id = MML.generateRowID();
  effect.name = index;
  character.statusEffects[index] = effect;
  MML.applyStatusEffects(character);
};

MML.removeStatusEffect = function removeStatusEffect(character, index) {
  if (!_.isUndefined(character.statusEffects[index])) {
    delete character.statusEffects[index];
    MML.applyStatusEffects(character);
  }
};

MML.updateInventory = function updateInventory(character) {
  const items = _.omit(character.inventory, 'emptyHand');
  _.each(items, function (item, _id) {
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemName', item.name);
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemId', _id);
  }, character);
  items.emptyHand = {
    type: 'empty',
    weight: 0
  };
  character.inventory = items;
};

MML.isSensitiveArea = function isSensitiveArea(position) {
  return [2, 6, 33].includes(position);
};

MML.equipItem = function equipItem(character, itemId, grip) {
  if (grip === 'Left Hand') {
    character.leftHand._id = itemId;
    if (character.inventory[itemId].type === 'weapon') {
      character.leftHand.grip = 'One Hand';
    } else {
      character.leftHand.grip = 'unarmed';
    }
  } else if (grip === 'Right Hand') {
    character.rightHand._id = itemId;
    if (character.inventory[itemId].type === 'weapon') {
      character.rightHand.grip = 'One Hand';
    } else {
      character.rightHand.grip = 'unarmed';
    }
  } else {
    character.leftHand._id = itemId;
    character.leftHand.grip = grip;
    character.rightHand._id = itemId;
    character.rightHand.grip = grip;
  }
};

MML.hasStatusEffects = function hasStatusEffects(character, effects) {
  return !_.isEmpty(_.intersection(_.keys(character.statusEffects), effects));
};

MML.getHitPosition = function getHitPosition(character, rollValue) {
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (rollValue < 1 || rollValue > 100) {
    return 'Error: Value out of range';
  } else {
    return MML.hitPositions[character.bodyType][MML.hitTables[character.bodyType][character.hitTable][rollValue - 1]];
  }
};

MML.getHitTable = function getHitTable(bodyType, inventory, leftHand, rightHand) {
  switch (character.bodyType) {
    case 'humanoid':
      if (character.inventory[character.rightHand._id].type === 'shield' || character.inventory[character.leftHand._id].type === 'shield') {
        return 'C';
      } else if (MML.isWieldingRangedWeapon(character) || MML.isUnarmed(character) || !(character.inventory[character.leftHand._id].type === 'weapon' && character.inventory[character.rightHand._id].type === 'weapon')) {
        return 'A';
      } else {
        return 'B';
      }
    default:
      log('Error: Body type not found');
      return 'Error: Body type not found';
  }
};

MML.getHitPositionNames = function getHitPositionNames(character) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.pluck(MML.hitPositions[character.bodyType], 'name');
  }
};

MML.getBodyParts = function getBodyParts(character) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.chain(MML.hitPositions[character.bodyType])
      .pluck('bodyPart')
      .uniq()
      .value();
  }
};

MML.getBodyPart = function getBodyPart(character, hitPosition) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.findWhere(MML.hitPositions[character.bodyType], {
      name: hitPosition
    });
  }
};

MML.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
  const availableHitPositions = _.where(MML.hitPositions[character.bodyType], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return 'Error: No hit positions found';
  } else {
    return availableHitPositions;
  }
};

MML.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
  const availableHitPositions = MML.getAvailableHitPositions(character, bodyPart);
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (availableHitPositions === 'Error: No hit positions found') {
    return availableHitPositions;
  } else if (rollValue < 1 || rollValue > availableHitPositions.length) {
    return 'Error: Value out of range';
  } else {
    return availableHitPositions[rollValue - 1];
  }
};

MML.buildHpAttribute = function buildHpAttribute(race, stature, strength, health, willpower) {
  switch (character.bodyType) {
    case 'humanoid':
      return {
        'Wound Fatigue': Math.round((health + stature + willpower) / 2),
        'Head': MML.HPTables[race][Math.round(health + stature / 3)],
        'Chest': MML.HPTables[race][Math.round(health + stature + strength)],
        'Abdomen': MML.HPTables[race][Math.round(health + stature)],
        'Left Arm': MML.HPTables[race][Math.round(health + stature)],
        'Right Arm': MML.HPTables[race][Math.round(health + stature)],
        'Left Leg': MML.HPTables[race][Math.round(health + stature)],
        'Right Leg': MML.HPTables[race][Math.round(health + stature)],
      };
    default:
      log('Oh No!');
  }
};

MML.getDistanceBetweenCharacters = function getDistanceBetweenCharacters(character, target) {
  return MML.pixelsToFeet(MML.getDistanceBetweenTokens(MML.getCharacterToken(character.id), MML.getCharacterToken(target.id)));
};

MML.getAoESpellTargets = function getAoESpellTargets(spellMarker) {
  switch (spellMarker.get('name')) {
    case 'spellMarkerCircle':
      return MML.getCharactersWithinRadius(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width') / 2);
    case 'spellMarkerRectangle':
      return MML.getCharactersWithinRectangle(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width'), spellMarker.get('height'), spellMarker.get('rotation'));
    case 'spellMarkerTriangle':
      return MML.getCharactersWithinTriangle(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width'), spellMarker.get('height'), spellMarker.get('rotation'));
    default:
  }
};

MML.getCharactersWithinRadius = function getCharactersWithinRadius(left, top, radius) {
  return _.filter(MML.characters, function (character) {
    const charToken = MML.getCharacterToken(character.id);
    return !_.isUndefined(charToken) && MML.getDistanceFeet(charToken.get('left'), left, charToken.get('top'), top) < MML.raceSizes[character.race].radius + MML.pixelsToFeet(radius);
  });
};

MML.getCharactersWithinRectangle = function getCharactersWithinRectangle(leftOriginal, topOriginal, width, height, rotation) {
  return _.filter(MML.characters, function (character) {
    const charToken = MML.getCharacterToken(character.id);
    const tokenCoordinates = MML.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    const tokenRadius = MML.feetToPixels(MML.raceSizes[character.race].radius);

    return !_.isUndefined(charToken) &&
      tokenCoordinates[0] + tokenRadius > width / -2 &&
      tokenCoordinates[0] - tokenRadius < width / 2 &&
      tokenCoordinates[1] - tokenRadius < height / 2 &&
      tokenCoordinates[1] + tokenRadius > height / -2
  });
};

MML.getCharactersWithinTriangle = function getCharactersWithinTriangle(leftOriginal, topOriginal, width, height, rotation) {
  return _.filter(MML.characters, function (character) {
    const charToken = MML.getCharacterToken(character.id);
    const tokenCoordinates = MML.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    const tokenRadius = MML.feetToPixels(MML.raceSizes[character.race].radius);
    const ax = (-width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    const ay = tokenCoordinates[1];
    const bx = tokenCoordinates[0];
    const by = ((-2 * height * tokenCoordinates[0]) / width) + (height / 2);
    const cx = (width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    const cy = tokenCoordinates[1];
    const dx = tokenCoordinates[0];
    const dy = ((2 * height * tokenCoordinates[0]) / width) + (height / 2);

    return !_.isUndefined(charToken) &&
      tokenCoordinates[1] - tokenRadius < height / 2 &&
      tokenCoordinates[1] + tokenRadius > height / -2 &&
      ((MML.getDistance(ax, tokenCoordinates[0], ay, tokenCoordinates[1]) * MML.getDistance(bx, tokenCoordinates[0], by, tokenCoordinates[1])) / MML.getDistance(ax, bx, ay, by) < tokenRadius ||
        (MML.getDistance(cx, tokenCoordinates[0], cy, tokenCoordinates[1]) * MML.getDistance(dx, tokenCoordinates[0], dy, tokenCoordinates[1])) / MML.getDistance(cx, dx, cy, dy) < tokenRadius ||
        (tokenCoordinates[0] < ax && tokenCoordinates[0] > cx));
  });
};

MML.getSkill = function getSkill(character, skill) {
  return _.isUndefined(character.skills[skill]) ? 0 : character.skills[skill].level;
};

MML.getMagicSkill = function getMagicSkill(character, spell) {
  const family = spell.family;
  if (['Fire', 'Earth', 'Water', 'Air', 'Life'].includes(spell.family)) {
    const wizardry_skill = MML.getSkill(character, 'Wizardry') - (MML.getSkill(character, 'Lore: Element of ' + family) > 19 ? 10 : 20);
    const elementalism_skill = MML.getSkill(character, family + ' Elementalism');
    if (wizardry_skill > elementalism_skill) {
      return {
        name: 'Wizardry',
        level: wizardry_skill
      };
    } else {
      return {
        name: family + ' Elementalism',
        level: elementalism_skill
      };
    }
  } else if (spell.family === 'Symbolism') {
    return {
      name: 'Symbolism',
      level: MML.getSkill(character, 'Symbolism')
    };
  } else {
    return {
      name: 'Wizardry',
      level: MML.getSkill(character, 'Wizardry')
    };
  }
};

MML.getElementalSkill = function getElementalSkill(character, element) {

};

MML.getEpCost = function getEpCost(skillName, skillLevel, ep) {
  skillName = skillName.replace(/(Earth|Air|Fire|Water|Life)\s/, '');
  if (skillLevel < 6) {
    return MML.epModifiers[skillName][ep][0];
  } else if (skillLevel < 11) {
    return MML.epModifiers[skillName][ep][1];
  } else if (skillLevel < 16) {
    return MML.epModifiers[skillName][ep][2];
  } else if (skillLevel < 21) {
    return MML.epModifiers[skillName][ep][3];
  } else if (skillLevel < 26) {
    return MML.epModifiers[skillName][ep][4];
  } else if (skillLevel < 31) {
    return MML.epModifiers[skillName][ep][5];
  } else if (skillLevel < 36) {
    return MML.epModifiers[skillName][ep][6];
  } else if (skillLevel < 41) {
    return MML.epModifiers[skillName][ep][7];
  } else if (skillLevel < 46) {
    return MML.epModifiers[skillName][ep][8];
  } else if (skillLevel < 51) {
    return MML.epModifiers[skillName][ep][9];
  } else if (skillLevel < 60) {
    return MML.epModifiers[skillName][ep][10];
  } else if (skillLevel < 70) {
    return MML.epModifiers[skillName][ep][11];
  } else {
    return MML.epModifiers[skillName][ep][12];
  }
};

MML.getModifiedCastingChance = function getModifiedCastingChance(character, action) {
  return [
    action.casterSkill,
    action.spell.task,
    character.situationalMod,
    character.castingMod,
    character.attributeCastingMod,
    _.reduce(_.pluck(action.metaMagic, 'castingMod'), (sum, num) => sum + num)
  ];
};

MML.getModifiedEpCost = function getModifiedEpCost(metaMagic, epCost) {
  return _.reduce(_.pluck(metaMagic, 'epMod'), (sum, num) => sum + num, 1) * epCost;
};

MML.getAoESpellModifier = function getAoESpellModifier(spellMarker, spell) {
  var area;
  var areaModified;
  var castingMod;

  if (typeof spell.target === 'string' && spell.target.indexOf('\' Radius')) {
    const base_radius = parseInt(spell.target.replace('\' Radius', ''));
    const modified_radius = MML.pixelsToFeet(spellMarker.get('width') / 2);
    area = Math.pow(base_radius, 2);
    areaModified = Math.pow(modified_radius, 2);
    castingMod = Math.round(Math.log2(modified_radius / base_radius) * 20);
  } else {
    const height = spellMarker.get('height');
    const width = spellMarker.get('width');
    area = spell.target[0] * spell.target[1];
    areaModified = width * height;
    castingMod = Math.round(Math.log2(width / spell.target[0]) * 10 + Math.log2(height / spell.target[1]) * 10);
  }

  return {
    epMod: areaModified > area ? Math.pow(areaModified / area, 2) : 0,
    castingMod: castingMod > 0 ? 0 : castingMod
  };
};

MML.getRangeCastingModifier = function getRangeCastingModifier(caster, targets, spell) {
  if (['Caster', 'Touch', 'Single'].includes(spell.target)) {
    return target.reduce(function (mod, target) {
      const distance = MML.getDistanceBetweenCharacters(caster, target);
      if (spell.range === 'Caster' || spell.range === 'Touch') {
        const self_range_mod = spell.range === 'Caster' && target.id !== caster.id ? -10 : 0;
        if (distance > MML.weaponRanks[1].high) {
          return mod + MML.weaponRanks[1].high - distance + self_range_mod;
        }
      } else {
        if (distance > spell.range) {
          return mod + Math.round(((spell.range - distance) / distance) * 10);
        }
      }
    });
  } else {
    const distance = MML.getDistanceBetweenTokens(MML.getCharacterToken(caster.id), MML.getSpellMarkerToken(spell.name));
    return distance > spell.range ? Math.round(((spell.range - distance) / distance) * 10) : 0;
  }
};

MML.removeAimAndObserving = function removeAimAndObserving(character) {
  if (_.has(character.statusEffects, 'Taking Aim')) {
    MML.removeStatusEffect(character, 'Taking Aim');
  }
  if (_.has(character.statusEffects, 'Observing')) {
    MML.removeStatusEffect(character, 'Observing');
  }
};

MML.validateAction = function validateAction(character) {
  var valid = true;

  switch (character.action.name) {
    case 'Attack':
      switch (character.action.attackType) {
        case 'Grapple':
          if (_.has(character.statusEffects, 'Grappled') &&
            _.has(character.statusEffects, 'Held') &&
            _.has(character.statusEffects, 'Taken Down') &&
            _.has(character.statusEffects, 'Pinned') &&
            _.has(character.statusEffects, 'Overborne')
          ) {
            valid = false;
          }
          break;
        case 'Regain Feet':
          if (!((_.has(character.statusEffects, 'Grappled') || _.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Holding')) &&
              character.movementType === 'Prone') ||
            (!(_.has(character.statusEffects, 'Taken Down') || _.has(character.statusEffects, 'Overborne')) || _.has(character.statusEffects, 'Pinned'))
          ) {
            valid = false;
          }
          break;
        case 'Place a Hold':
          if (_.has(character.statusEffects, 'Holding') &&
            _.has(character.statusEffects, 'Held') &&
            _.has(character.statusEffects, 'Pinned') &&
            (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length > 1)
          ) {
            valid = false;
          }
          break;
        case 'Break a Hold':
          if (!_.has(character.statusEffects, 'Held') && !_.has(character.statusEffects, 'Pinned')) {
            valid = false;
          }
          break;
        case 'Break Grapple':
          if (!_.has(character.statusEffects, 'Grappled')) {
            valid = false;
          }
          break;
        case 'Takedown':
          if (((!_.has(character.statusEffects, 'Holding') &&
              (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length > 1) &&
              (!_.has(character.statusEffects, 'Held') || character.statusEffects['Held'].targets.length > 1))) ||
            (_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) ||
            character.movementType === 'Prone'
          ) {
            valid = false;
          }
          break;
        case 'Head Butt':
        case 'Bite':
          if (!_.has(character.statusEffects, 'Held') &&
            !_.has(character.statusEffects, 'Grappled') &&
            !_.has(character.statusEffects, 'Holding') &&
            !_.has(character.statusEffects, 'Taken Down') &&
            !_.has(character.statusEffects, 'Pinned') &&
            !_.has(character.statusEffects, 'Overborne')
          ) {
            valid = false;
          }
          break;
        default:
      }
      break;
    default:
  }

  return valid;
};

MML.buildApvMatrix = function buildApvMatrix(inventory, bodyType) {
  const armor = inventory.values()
    .filter(item => item.type === 'armor')
    .reduce();

  var apvMatrix = {};
  // Initialize APV Matrix
  _.each(MML.hitPositions[bodyType], function (position) {
    apvMatrix[position.name] = {
      Surface: [{
        value: 0,
        coverage: 100
      }],
      Cut: [{
        value: 0,
        coverage: 100
      }],
      Chop: [{
        value: 0,
        coverage: 100
      }],
      Pierce: [{
        value: 0,
        coverage: 100
      }],
      Thrust: [{
        value: 0,
        coverage: 100
      }],
      Impact: [{
        value: 0,
        coverage: 100
      }],
      Flanged: [{
        value: 0,
        coverage: 100
      }]
    };
  });
  //Creates raw matrix of individual pieces of armor (no layering or partial coverage)

  _.each(armor, function (piece) {
    var material = MML.APVList[piece.material];

    _.each(piece.protection, function (protection) {
      var position = MML.hitPositions[bodyType][protection.position].name;
      var coverage = protection.coverage;
      apvMatrix[position].Surface.push({
        value: material.surface,
        coverage: coverage
      });
      apvMatrix[position].Cut.push({
        value: material.cut,
        coverage: coverage
      });
      apvMatrix[position].Chop.push({
        value: material.chop,
        coverage: coverage
      });
      apvMatrix[position].Pierce.push({
        value: material.pierce,
        coverage: coverage
      });
      apvMatrix[position].Thrust.push({
        value: material.thrust,
        coverage: coverage
      });
      apvMatrix[position].Impact.push({
        value: material.impact,
        coverage: coverage
      });
      apvMatrix[position].Flanged.push({
        value: material.flanged,
        coverage: coverage
      });
    });
  });

  //This loop accounts for layered armor and partial coverage and outputs final APVs
  _.each(apvMatrix, function (position, positionName) {
    _.each(position, function (rawAPVArray, type) {
      var apvFinalArray = [];
      var coverageArray = [];

      //Creates an array of armor coverage in ascending order.
      _.each(rawAPVArray, function (armorProtectionValues) {
        if (coverageArray.indexOf(armorProtectionValues.coverage) === -1) {
          coverageArray.push(armorProtectionValues.coverage);
        }
      });
      coverageArray = coverageArray.sort((a, b) => a - b);

      //Creates APV array per damage type per position
      _.each(coverageArray, function (apvCoverage) {
        var apvToLayerArray = [];
        var apvValue = 0;

        //Builds an array of APVs that meet or exceed the coverage value
        _.each(rawAPVArray, function (armorProtectionValues) {
          if (armorProtectionValues.coverage >= apvCoverage) {
            apvToLayerArray.push(armorProtectionValues.value);
          }
        });
        apvToLayerArray = apvToLayerArray.sort(function (a, b) {
          return b - a;
        });

        //Adds the values at coverage value with diminishing returns on layered armor
        _.each(apvToLayerArray, function (value, index) {
          apvValue += value * Math.pow(2, -index);
          apvValue = Math.round(apvValue);
        });
        //Puts final APV and associated Coverage into final APV array for that damage type.
        apvFinalArray.push({
          value: apvValue,
          coverage: apvCoverage
        });
      });
      apvMatrix[positionName][type] = apvFinalArray;
    });
  });
  return apvMatrix;
};

// Rx operators
MML.rollAttributeChanged = function rollAttributeChanged(name) {
  return function (source) {
    return source.pipe(
      filter(attribute => attribute.get('name') === name),
      map(function (attribute) {
        const roll = parseFloat(attribute.get('current'));
        if (isNaN(roll) || roll < 6) {
          MML.setCurrentAttribute(attribute.get('_characterid'), name, 6);
          return 6;
        } else if (roll > 20) {
          MML.setCurrentAttribute(attribute.get('_characterid'), name, 20);
          return 20;
        } else {
          return roll;
        }
      }),
      share()
    );
  };
};

MML.inputAttributeChanged = function inputAttributeChanged(name) {
  return function (source) {
    return source.pipe(
      filter(attribute => attribute.get('name') === name),
      map(attribute => attribute.get('current')),
      share()
    );
  };
}

MML.derivedAttribute = function derivedAttribute(compute, ...attributes) {
  return Rx.combineLatest(attributes).pipe(map((attributes) => compute(...attributes)), share());
};

// Character Creation
MML.createCharacter = function (id) {
  const character = { id };

  const attribute_changed = Rx.change_attribute_current.pipe(
    filter(attribute => attribute.get('_characterid') === id),
    share()
  );

  const game_state = MML.game_state.pipe(filter(effect => effect.object_id === id));

  // Object.defineProperty(character, 'player', {
  //   get: function () {
  //     return MML.players[MML.getCurrentAttribute(character.id, 'player')];
  //   },

  // const epMax = evocation;

  // const ep = _.isUndefined(getAttrByName(character.id, 'ep', 'current')) ? character.evocation : MML.getCurrentAttributeAsFloat(character.id, 'ep');

  // const fatigueMax = fitness;
  // const fatigue = isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'fatigue'))) ? character.fitness : MML.getCurrentAttributeAsFloat(character.id, 'fatigue');
  // const knockdown = isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'knockdown'))) ? character.knockdownMax : MML.getCurrentAttributeAsFloat(character.id, 'knockdown');

  // #region Input Attributes
  const name = Rx.change_character_name.pipe(
    filter(changed_character => changed_character.get('id') === id),
    map(changed_character => changed_character.get('name'))
  );

  const stature_roll = attribute_changed.pipe(MML.rollAttributeChanged('stature_roll'));
  const strength_roll = attribute_changed.pipe(MML.rollAttributeChanged('strength_roll'));
  const coordination_roll = attribute_changed.pipe(MML.rollAttributeChanged('coordination_roll'));
  const health_roll = attribute_changed.pipe(MML.rollAttributeChanged('health_roll'));
  const beauty_roll = attribute_changed.pipe(MML.rollAttributeChanged('beauty_roll'));
  const intellect_roll = attribute_changed.pipe(MML.rollAttributeChanged('intellect_roll'));
  const reason_roll = attribute_changed.pipe(MML.rollAttributeChanged('reason_roll'));
  const creativity_roll = attribute_changed.pipe(MML.rollAttributeChanged('creativity_roll'));
  const presence_roll = attribute_changed.pipe(MML.rollAttributeChanged('presence_roll'));
  const race = attribute_changed.pipe(MML.inputAttributeChanged('race'));
  const gender = attribute_changed.pipe(MML.inputAttributeChanged('gender'));
  const handedness = attribute_changed.pipe(MML.inputAttributeChanged('handedness'));

  // const inventory = MML.getCurrentAttributeJSON(character.id, 'inventory').pipe(startWith({
  //   emptyHand: {
  //     type: 'empty',
  //     weight: 0
  //   }));
  // const leftHand = _.isEmpty(MML.getCurrentAttributeJSON(character.id, 'leftHand')) ? JSON.stringify({
  //   _id: 'emptyHand',
  //   grip: 'unarmed'
  // }) : MML.getCurrentAttributeJSON(character.id, 'leftHand');

  // const rightHand = _.isEmpty(MML.getCurrentAttributeJSON(character.id, 'rightHand')) ? JSON.stringify({
  //   _id: 'emptyHand',
  //   grip: 'unarmed'
  // }) : MML.getCurrentAttributeJSON(character.id, 'rightHand');
  // const spells = MML.getCurrentAttributeAsArray(character.id, 'spells');
  // #endregion

  // #region Derived Attributes
  const bodyType = MML.derivedAttribute(race => MML.bodyTypes[race], race);
  const height = MML.derivedAttribute((race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].height, race, gender, stature_roll);
  const weight = MML.derivedAttribute((race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].weight, race, gender, stature_roll);
  const stature = MML.derivedAttribute((race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].stature, race, gender, stature_roll);
  const strength = MML.derivedAttribute((race, strength_roll) => MML.racialAttributeBonuses[race].strength + strength_roll, race, strength_roll);
  const coordination = MML.derivedAttribute((race, coordination_roll) => MML.racialAttributeBonuses[race].coordination + coordination_roll, race, coordination_roll);
  const health = MML.derivedAttribute((race, health_roll) => MML.racialAttributeBonuses[race].health + health_roll, race, health_roll);
  const beauty = MML.derivedAttribute((race, beauty_roll) => MML.racialAttributeBonuses[race].beauty + beauty_roll, race, beauty_roll);
  const intellect = MML.derivedAttribute((race, intellect_roll) => MML.racialAttributeBonuses[race].intellect + intellect_roll, race, intellect_roll);
  const reason = MML.derivedAttribute((race, reason_roll) => MML.racialAttributeBonuses[race].reason + reason_roll, race, reason_roll);
  const creativity = MML.derivedAttribute((race, creativity_roll) => MML.racialAttributeBonuses[race].creativity + creativity_roll, race, creativity_roll);
  const presence = MML.derivedAttribute((race, presence_roll) => MML.racialAttributeBonuses[race].presence + presence_roll, race, presence_roll);
  const willpower = MML.derivedAttribute((presence, health) => Math.round((2 * presence + health) / 3), presence, health);
  const perception = MML.derivedAttribute((race, intellect, reason, creativity) => Math.round((intellect + reason + creativity) / 3) + MML.racialAttributeBonuses[race].perception, race, intellect, reason, creativity);
  const systemStrength = MML.derivedAttribute((presence, health) => Math.round((presence + 2 * health) / 3), presence, health);
  const fitness = MML.derivedAttribute((race, health, strength) => Math.round((health + strength) / 2) + MML.racialAttributeBonuses[race].fitness, race, health, strength);
  const fitnessMod = MML.derivedAttribute(fitness => MML.fitnessModLookup[fitness], fitness);
  const load = MML.derivedAttribute((race, stature, fitnessMod) => Math.round(stature * fitnessMod) + MML.racialAttributeBonuses[race].load, race, stature, fitnessMod);
  const overhead = MML.derivedAttribute((load) => load * 2, load);
  const deadLift = MML.derivedAttribute((load) => load * 4, load);
  const hpMax = MML.derivedAttribute(MML.buildHpAttribute, race, stature, strength, health, willpower);
  const hpRecovery = MML.derivedAttribute(health => MML.recoveryMods[health].hp, health);
  const evocation = MML.derivedAttribute((race, intellect, reason, creativity, health, willpower) => intellect + reason + creativity + health + willpower + MML.racialAttributeBonuses[race].evocation,
    race,
    intellect,
    reason,
    creativity,
    health,
    willpower
  );
  const epRecovery = MML.derivedAttribute(health => MML.recoveryMods[health].ep, health);
  const totalWeightCarried = MML.derivedAttribute(inventory => _.reduce(_.pluck(inventory, 'weight'), (sum, num) => sum + num, 0), inventory);
  const knockdownMax = MML.derivedAttribute(Math.round(stature + (totalWeightCarried / 10)), stature, totalWeightCarried);
  const armorProtectionValues = ML.derivedAttribute(MML.buildApvMatrix, bodyType, inventory);
  const movementRatio = MML.derivedAttribute(function (load, totalWeightCarried) {
    const movementRatio = totalWeightCarried === 0 ? Math.round(10 * load) / 10 : Math.round(10 * load / totalWeightCarried) / 10;
    return movementRatio > 4.0 ? 4.0 : movementRatio;
  }, load, totalWeightCarried);

  const attributeDefenseMod = MML.derivedAttribute((strength, coordination) => MML.attributeMods.strength[strength] + MML.attributeMods.coordination[coordination], strength, coordination);
  const attributeMeleeAttackMod = MML.derivedAttribute((strength, coordination) => MML.attributeMods.strength[strength] + MML.attributeMods.coordination[coordination], strength, coordination);
  const attributeMissileAttackMod = MML.derivedAttribute((strength, coordination, perception) => MML.attributeMods.perception[perception] + MML.attributeMods.coordination[coordination] + MML.attributeMods.strength[strength], strength, coordination, perception);
  const meleeDamageMod = MML.derivedAttribute(_.find(MML.meleeDamageMods, ({
    high,
    low
  }) => load >= low && load <= high).value, load);
  const spellLearningMod = MML.derivedAttribute(intellect => MML.attributeMods.intellect[intellect], intellect);

  // const hitTable = MML.getHitTable(character);
  // #endregion

  // #region Variable Attributes
  const movementAvailable = MML.getCurrentAttributeAsFloat(character.id, 'movementAvailable');
  const movementType = MML.getCurrentAttribute(character.id, 'movementType');
  const pathID = MML.getCurrentAttribute(character.id, 'pathID');
  const situationalMod = MML.getCurrentAttributeAsFloat(character.id, 'situationalMod');
  const meleeDefenseMod = MML.getCurrentAttributeAsFloat(character.id, 'meleeDefenseMod');
  const missileDefenseMod = MML.getCurrentAttributeAsFloat(character.id, 'missileDefenseMod');
  const meleeAttackMod = MML.getCurrentAttributeAsFloat(character.id, 'meleeAttackMod');
  const missileAttackMod = MML.getCurrentAttributeAsFloat(character.id, 'missileAttackMod');
  const castingMod = MML.getCurrentAttributeAsFloat(character.id, 'castingMod');
  const statureCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'statureCheckMod');
  const strengthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'strengthCheckMod');
  const coordinationCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'coordinationCheckMod');
  const healthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'healthCheckMod');
  const beautyCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'beautyCheckMod');
  const intellectCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'intellectCheckMod');
  const reasonCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'reasonCheckMod');
  const creativityCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'creativityCheckMod');
  const presenceCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'presenceCheckMod');
  const willpowerCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'willpowerCheckMod');
  const evocationCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'evocationCheckMod');
  const perceptionCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'perceptionCheckMod');
  const systemStrengthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'systemStrengthCheckMod');
  const fitnessCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'fitnessCheckMod');
  const statusEffects = MML.getCurrentAttributeJSON(character.id, 'statusEffects');
  const initiativeRollValue = MML.getCurrentAttributeAsFloat(character.id, 'initiativeRollValue');
  const situationalInitBonus = MML.getCurrentAttributeAsFloat(character.id, 'situationalInitBonus');
  const actionInitCostMod = MML.getCurrentAttributeAsFloat(character.id, 'actionInitCostMod');
  const hp = game_state.pipe(
      filter(effect => effect.attribute === 'hp'), 
      scan(function (current, effect) {
        current[effect.body_part] += effect.change;
        return current;
      }, _.isUndefined(getAttrByName(character.id, 'hp', 'current')) ? MML.buildHpAttribute(character) : MML.getCurrentAttributeJSON(id, 'hp')),
      startWith()
    );
  // #endregion

  // #region Saves
  const major_wound_save = Rx.combineLatest(hpMax, hp.pipe(pairwise())).pipe(
    filter(function ([max, [previous, current]]) {
      return Object.keys(max).reduce(function (save_needed, body_part) {
        const current_hp = current[body_part];
        if (current_hp < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
          if (initialHP >= Math.round(maxHP / 2)) { //Fresh wound
            duration = Math.round(maxHP / 2) - currentHP;
          } else if (!_.has(character.statusEffects, 'Major Wound, ' + bodyPart)) {
            duration = -hpAmount;
          } else { //Add damage to duration of effect
            duration = parseInt(character.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
          }
          await MML.displayMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
          const result = await MML.attributeCheckRoll(player, character.willpower);
          if (result === 'Failure') {
            MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
              duration: duration,
              startingRound: state.MML.GM.currentRound,
              bodyPart: bodyPart
            });
          }
        }
        return save_needed;
      }, false)
    })
  )
  // #endregion

  // #region Initaitive Attributes
  const attributeInitBonus = MML.derivedAttribute(function (strength, coordination, reason, perception) {
    const rankingAttribute = [strength, coordination, reason, perception].sort((a, b) => a - b)[0];

    if (rankingAttribute < 10) {
      return -1;
    } else if (rankingAttribute === 10 || rankingAttribute === 11) {
      return 0;
    } else if (rankingAttribute === 12 || rankingAttribute === 13) {
      return 1;
    } else if (rankingAttribute === 14 || rankingAttribute === 15) {
      return 2;
    } else if (rankingAttribute === 16 || rankingAttribute === 17) {
      return 3;
    } else if (rankingAttribute === 18 || rankingAttribute === 19) {
      return 4;
    } else {
      return 5;
    }
  }, strength, coordination, reason, perception);

  const movementRatioInitBonus = MML.derivedAttribute(function (movementRatio) {
    if (movementRatio < 0.6) {
      return 'No Combat';
    } else if (movementRatio === 0.6) {
      return -4;
    } else if (movementRatio < 0.7 && movementRatio <= 0.8) {
      return -3;
    } else if (movementRatio > 0.8 && movementRatio <= 1.0) {
      return -2;
    } else if (movementRatio > 1.0 && movementRatio <= 1.2) {
      return -1;
    } else if (movementRatio > 1.2 && movementRatio <= 1.4) {
      return 0;
    } else if (movementRatio > 1.4 && movementRatio <= 1.7) {
      return 1;
    } else if (movementRatio > 1.7 && movementRatio <= 2.0) {
      return 2;
    } else if (movementRatio > 2.0 && movementRatio <= 2.5) {
      return 3;
    } else if (movementRatio > 2.5 && movementRatio <= 3.2) {
      return 4;
    } else(movementRatio > 3.2) {
      return 5;
    }
  }, movementRatio);

  const initiative = MML.derivedAttribute(function (initiativeRollValue, situationalInitBonus, movementRatioInitBonus, attributeInitBonus, senseInitBonus, fomInitBonus, firstActionInitBonus, spentInitiative) {
    if ([situationalInitBonus, movementRatioInitBonus].includes('No Combat')) {
      return 0;
    }

    const initiative = initiativeRollValue +
      situationalInitBonus +
      movementRatioInitBonus +
      attributeInitBonus +
      senseInitBonus +
      fomInitBonus +
      firstActionInitBonus +
      spentInitiative;

    return initiative < 0 || state.MML.GM.roundStarted === false ? 0 : initiative;
  }, initiativeRollValue, situationalInitBonus, movementRatioInitBonus, attributeInitBonus, senseInitBonus, fomInitBonus, firstActionInitBonus, spentInitiative);

  const senseInitBonus = MML.derivedAttribute(function (inventory) {
    var bitsOfHelm = [
      'Barbute Helm',
      'Bascinet Helm',
      'Camail',
      'Camail-Conical',
      'Cap',
      'Cheeks',
      'Conical Helm',
      'Duerne Helm',
      'Dwarven War Hood',
      'Face Plate',
      'Great Helm',
      'Half-Face Plate',
      'Hood',
      'Nose Guard',
      'Pot Helm',
      'Sallet Helm',
      'Throat Guard',
      'War Hat'
    ];
    var senseArray = _.filter(inventory, item => item.type === 'armor' && bitsOfHelm.includes(item.name));

    if (senseArray.length === 0) {
      //nothing on head
      return 4;
    } else {
      if (senseArray.includes('Great Helm') || (senseArray.includes('Sallet Helm') && senseArray.includes('Throat Guard'))) {
        //Head fully encased in metal
        return -2;
      } else if (_.intersection(senseArray, ['Barbute Helm',
          'Sallet Helm',
          'Bascinet Helm', 'Duerne Helm', 'Cap', 'Pot Helm', 'Conical Helm', 'War Hat'
        ]).length > 0) {
        //wearing a helm
        if (senseArray.includes('Face Plate')) {
          //Has faceplate
          if (_.intersection(senseArray, ['Barbute Helm', 'Bascinet Helm', 'Duerne Helm']).length > 0) {
            //Enclosed Sides
            return -2;
          } else {
            return -1;
          }
        } else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Half-Face Plate']).length > 0) {
          //These types of helms or half face plate
          return 0;
        } else if (_.intersection(senseArray, ['Camail', 'Camail-Conical', 'Cheeks']).length > 0) {
          //has camail or cheeks
          return 1;
        } else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
          //Wearing a hood
          return senseArray.reduce(function (min, piece) {
            if ((piece.name === 'Dwarven War Hood' || piece.name === 'Hood') && piece.family !== 'Cloth') {
              return 1;
            }
            return min;
          }, 2);
        } else if (senseArray.includes('Nose Guard')) {
          //has nose guard
          return 2;
        } else {
          // just a cap
          return 3;
        }
      } else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
        //Wearing a hood
        return senseArray.reduce(function (min, piece) {
          if ((piece.name === 'Dwarven War Hood' || piece.name === 'Hood') && piece.family !== 'Cloth') {
            return 1;
          }
          return min;
        }, 2);
      }
    }
  });

  const fomInitBonus = MML.getCurrentAttributeAsFloat(character.id, 'fomInitBonus');
  const firstActionInitBonus = MML.getCurrentAttributeAsFloat(character.id, 'firstActionInitBonus');
  const spentInitiative = MML.getCurrentAttributeAsFloat(character.id, 'spentInitiative');

  // #endregion

  const actionTempo = action.pipe(
    withLatestFrom(isDualWielding),
    map(function ([action, isDualWielding]) {
      var tempo;

      if (_.isUndefined(action.skill) || action.skill < 30) {
        tempo = 0;
      } else if (action.skill < 40) {
        tempo = 1;
      } else if (action.skill < 50) {
        tempo = 2;
      } else if (action.skill < 60) {
        tempo = 3;
      } else if (action.skill < 70) {
        tempo = 4;
      } else {
        tempo = 5;
      }

      // If Dual Wielding
      if (action.name === 'Attack' && isDualWielding) {
        var twfSkill = weaponskills['Two Weapon Fighting'].level;
        if (twfSkill > 19 && twfSkill) {
          tempo += 1;
        } else if (twfSkill >= 40 && twfSkill < 60) {
          tempo += 2;
        } else if (twfSkill >= 60) {
          tempo += 3;
        }
        // If Dual Wielding identical weapons
        if (inventory[leftHand._id].name === inventory[rightHand._id].name) {
          tempo += 1;
        }
      }
      return MML.attackTempoTable[tempo];
    }));

  const newRoundUpdate = MML.newRound.pipe(map(function (character) {
    if (_.has(character.statusEffects, 'Melee This Round')) {
      var fatigueRate = 1;
      if (_.has(character.statusEffects, 'Pinned')) {
        fatigueRate = 2;
      }
      character.roundsExertion += fatigueRate;
      character.roundsRest = 0;

      if (!_.has(character.statusEffects, 'Fatigue')) {
        if (character.roundsExertion > character.fitness) {
          await MML.fatigueCheck(player, character);
        }
      } else {
        if (character.roundsExertion > Math.round(character.fitness / 2)) {
          await MML.fatigueCheck(player, character);
        }
      }
    } else if (_.has(character.statusEffects, 'Fatigue') || character.roundsExertion > 0) {
      character.roundsRest++;
      if (character.roundsRest > 5) {
        await MML.fatigueRecovery(player, character);
      }
    }

    // Reset knockdown number
    character.knockdown = character.knockdownMax;
    character.spentInitiative = 0;

    character.action = {
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: MML.getEquippedWeapon(character)
    };
    if (_.has(character.statusEffects, 'Observing')) {
      MML.addStatusEffect(character, 'Observed', {
        startingRound: state.MML.GM.currentRound
      });
    }
    return character;
  }));

  const character_moved = MML.character_moved.pipe(filter(character => character.id === id));

  const character_movement_blocked = character_moved.pipe(
    
  );

  MML.combat_movement = MML.token_moved.pipe(map(function (obj, prev) {
    const character = MML.characters[MML.getCharacterIdFromToken(obj)];
    const left1 = prev['left'];
    const left2 = obj.get('left');
    const top1 = prev['top'];
    const top2 = obj.get('top');
    const distance = MML.getDistanceFeet(left1, left2, top1, top2);
    const distanceAvailable = MML.movementRates[character.race][character.movementType] * character.movementAvailable;

    if (state.MML.GM.actor === charName && distanceAvailable > 0) {
      // If they move too far, move the maxium distance in the same direction
      if (distance > distanceAvailable) {
        const left3 = Math.floor(((left2 - left1) / distance) * distanceAvailable + left1 + 0.5);
        const top3 = Math.floor(((top2 - top1) / distance) * distanceAvailable + top1 + 0.5);
        obj.set('left', left3);
        obj.set('top', top3);
        character.movementAvailable(0);
      }
      character.moveDistance(distance);
    } else {
      obj.set('left', prev['left']);
      obj.set('top', prev['top']);
    }
  }));

  const ready = Rx.merge(
      MML.newRound.pipe(mapTo(false)),
      action.pipe(mapTo(true)),
      MML.endCombat
    )
    .pipe(
      tap(function (is_ready) {
        const token = MML.getCharacterToken(id);
        if (!_.isUndefined(token)) {
          token.set('tint_color', is_ready ? 'transparent' : 'FF0000');
        }
      })
    );

  const action = function setAction(character, action) {
    var initBonus = 10;
    if (action.name === 'Attack' || action.name === 'Aim') {
      if (MML.isUnarmedAction(action) || action.weapon === 'unarmed') {
        if (!_.isUndefined(character.weaponSkills['Brawling']) && character.weaponSkills['Brawling'].level > character.weaponSkills['Default Martial'].level) {
          action.skill = character.weaponSkills['Brawling'].level;
        } else {
          action.skill = character.weaponSkills['Default Martial'].level;
        }
        // } else if (leftHand !== 'unarmed' && rightHand !== 'unarmed') {
        //   var weaponInits = [character.inventory[character.leftHand._id].grips[character.leftHand.grip].initiative,
        //     character.inventory[character.rightHand._id].grips[character.rightHand.grip].initiative
        //   ];
        //   initBonus = _.min(weaponInits);
        // action.skill = character.weaponSkills.[character.inventory[character.leftHand._id].name].level or character.weaponSkills['Default Martial Skill'].level;
        //Dual Wielding
      } else {
        initBonus = action.weapon.initiative;
        action.skill = MML.getWeaponSkill(character, action.weapon);
      }
    } else if (action.name === 'Cast') {
      var skillInfo = MML.getMagicSkill(character, action.spell);
      action.skill = skillInfo.level;
      action.skillName = skillInfo.name;
    }
    if (state.MML.GM.roundStarted === false) {
      character.firstActionInitBonus = initBonus;
    }

    if (_.isUndefined(character.previousAction) || character.previousAction.ts !== action.ts) {
      _.each(action.modifiers, function (modifier) {
        MML.addStatusEffect(character, modifier, {
          ts: action.ts,
          startingRound: state.MML.GM.currentRound
        });
      });
    }
    character.action = action;
  };
  const previousAction = MML.getCurrentAttributeJSON(character.id, 'previousAction');
  const roundsRest = MML.getCurrentAttributeAsFloat(character.id, 'roundsRest');
  const roundsExertion = MML.getCurrentAttributeAsFloat(character.id, 'roundsExertion');

  const attributeCastingMod = MML.derivedAttribute(function (reason, fomInitBonus, senseInitBonus) {
    var attributeCastingMod = MML.attributeMods.reason[reason];

    if (senseInitBonus < 2 && senseInitBonus > 0) {
      attributeCastingMod -= 10;
    } else if (senseInitBonus > -2) {
      attributeCastingMod -= 20;
    } else {
      attributeCastingMod -= 30;
    }

    if (fomInitBonus === 3 || fomInitBonus === 2) {
      attributeCastingMod -= 5;
    } else if (fomInitBonus === 1) {
      attributeCastingMod -= 10;
    } else if (fomInitBonus === 0) {
      attributeCastingMod -= 15;
    } else if (fomInitBonus === -1) {
      attributeCastingMod -= 20;
    } else if (fomInitBonus === -2) {
      attributeCastingMod -= 30;
    }
    return attributeCastingMod;
  }, reason, fomInitBonus, senseInitBonus);

  const skills = 
    function () {
      var characterSkills = MML.getSkillAttributes(character.id, 'skills');
      _.each(
        characterSkills,
        function (characterSkill, skillName) {
          var level = characterSkill.input;
          var attribute = MML.skills[skillName].attribute;

          level += MML.attributeMods[attribute][character[attribute]];

          if (_.isUndefined(MML.skillMods[race]) === false && _.isUndefined(MML.skillMods[race][skillName]) === false) {
            level += MML.skillMods[race][skillName];
          }
          if (_.isUndefined(MML.skillMods[character.gender]) === false && _.isUndefined(MML.skillMods[character.gender][skillName]) === false) {
            level += MML.skillMods[character.gender][skillName];
          }
          characterSkill.level = level;
          MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_name', skillName);
          MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_input', characterSkill.input);
          MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_level', level);
        },
        character
      );

      return characterSkills;
    },

    const weaponSkills =
      function () {
        var characterSkills = MML.getSkillAttributes(character.id, "weaponskills");
        var highestSkill;

        _.each(
          characterSkills,
          function (characterSkill, skillName) {
            var level = characterSkill.input;

            // This may need to include other modifiers
            if (_.isUndefined(MML.weaponSkillMods[race]) === false && _.isUndefined(MML.weaponSkillMods[race][skillName]) === false) {
              level += MML.weaponSkillMods[race][skillName];
            }
            characterSkill.level = level;
          },
          character
        );

        highestSkill = _.max(characterSkills, skill => skill.level).level;
        if (isNaN(highestSkill)) {
          highestSkill = 0;
        }

        if (_.isUndefined(characterSkills["Default Martial"])) {
          characterSkills["Default Martial"] = {
            input: 0,
            level: 0,
            _id: MML.generateRowID()
          };
        }

        if (highestSkill < 20) {
          characterSkills["Default Martial"].level = 1;
        } else {
          characterSkills["Default Martial"].level = Math.round(highestSkill / 2);
        }

        _.each(
          characterSkills,
          function (characterSkill, skillName) {
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
          },
          character
        );
        return characterSkills;
      },

      const fov = MML.derivedAttribute(function (senseInitBonus) {
        switch (senseInitBonus) {
          case 4:
            return 180;
          case 3:
            return 170;
          case 2:
            return 160;
          case 1:
            return 150;
          case 0:
            return 140;
          case -1:
            return 130;
          case -2:
            return 120;
          default:
            return 180;
        }
      }, senseInitBonus);

  const getShieldDefenseBonus(character) {
    const rightHand = character.inventory[character.rightHand._id];
    const leftHand = character.inventory[character.leftHand._id];

    if (!_.isUndefined(rightHand) && rightHand.type === 'shield') {
      return rightHand.defenseMod;
    } else if (!_.isUndefined(leftHand) && leftHand.type === 'shield' && leftHand.defenseMod > rightHand.defenseMod) {
      return leftHand.defenseMod;
    } else {
      return 0;
    }
  };

  const getWeaponGrip(character) {
    if (character['rightHand'].grip !== 'unarmed') {
      return character['rightHand'].grip;
    } else if (character['leftHand'].grip !== 'unarmed') {
      return character['leftHand'].grip;
    } else {
      return 'unarmed';
    }
  };

  const getEquippedWeapon(character) {
    const grip = MML.getWeaponGrip(character);
    var weapon;
    var item;
    var itemId;

    if (MML.isUnarmed(character)) {
      return 'unarmed';
    } else if (character['rightHand'].grip !== 'unarmed') {
      itemId = character.rightHand._id;
      item = character.inventory[itemId];
    } else {
      itemId = character.leftHand._id;
      item = character.inventory[itemId];
    }
    return MML.buildWeaponObject(item, grip);
  };

  const buildWeaponObject(item, grip) {
    var weapon = {
      _id: item._id,
      name: item.name,
      type: 'weapon',
      weight: item.weight,
      family: item.grips[grip].family,
      hands: item.grips[grip].hands
    };

    if (['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].includes(weapon.family)) {
      _.extend(weapon, item.grips[grip]);
      if (weapon.family === 'MWM') {
        weapon.loaded = item.loaded;
      }
    } else {
      _.extend(weapon, {
        defense: item.grips[grip].defense,
        initiative: item.grips[grip].initiative,
        rank: item.grips[grip].rank,
        primaryType: item.grips[grip].primaryType,
        primaryTask: item.grips[grip].primaryTask,
        primaryDamage: item.grips[grip].primaryDamage,
        secondaryType: item.grips[grip].secondaryType,
        secondaryTask: item.grips[grip].secondaryTask,
        secondaryDamage: item.grips[grip].secondaryDamage
      });
    }
    return weapon;
  };

  const getWeaponAndSkill(character) {
    var itemId;
    var grip;

    if (MML.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
      itemId = character.rightHand._id;
      grip = character.rightHand.grip;
    } else {
      itemId = character.leftHand._id;
      grip = character.leftHand.grip;
    }
    var item = character.inventory[itemId];
    var characterWeapon = MML.buildWeaponObject(item, grip);

    if (!MML.isRangedWeapon(characterWeapon)) {
      if (character.action.attackType === 'secondary') {
        characterWeapon.damageType = item.grips[grip].secondaryType;
        characterWeapon.task = item.grips[grip].secondaryTask;
        characterWeapon.damage = item.grips[grip].secondaryDamage;
      } else {
        characterWeapon.damageType = item.grips[grip].primaryType;
        characterWeapon.task = item.grips[grip].primaryTask;
        characterWeapon.damage = item.grips[grip].primaryDamage;
      }
    }

    return {
      characterWeapon: characterWeapon,
      skill: MML.getWeaponSkill(character, item)
    };
  };

  const getWeaponSkill(character, weapon) {
    var item = weapon;
    var skill;

    if (item.type !== 'weapon') {
      log('Not a weapon');
      MML.error();
    }

    const grip = MML.getWeaponGrip(character);
    const skillName = item.name + ['War Spear', 'Boar Spear', 'Military Fork', 'Bastard Sword'].includes(item.name) ? ', ' + grip : '';

    if (_.has(character.weaponSkills, skillName)) {
      return character.weaponSkills[skillName].level;
    } else {
      var relatedSkills = [];
      _.each(character.weaponSkills, function (relatedSkill, skillName) {
        if (skillName !== 'Default Martial') {
          _.each(MML.items[skillName.replace(', ' + grip, '')].grips, function (skillFamily) {
            if (skillFamily.family === item.grips[grip].family) {
              relatedSkills.push(relatedSkill);
            }
          });
        }
      }, character);

      if (relatedSkills.length === 0) {
        return character.weaponSkills['Default Martial'].level;
      } else {
        return _.max(relatedSkills, function (skill) {
          return skill.level;
        }).level - 10;
      }
    }
  };

  const graspers = bodyType.pipe(map(function (type) {
    switch (type) {
      case 'humanoid':
        return ['Left', 'Right'];
      default:
        return [];
    }
  }));

  const wielded_weapon_families = function isWieldingWeaponFamily(character, families) {
    return families.includes(getWeaponFamily(character, 'rightHand')) || rangedFamilies.includes(getWeaponFamily(character, 'leftHand'));
  };

  const getWeaponFamily(character, hand) {
    const item = character.inventory[character[hand]._id];
    if (!_.isUndefined(item) && item.type === 'weapon') {
      return item.grips[character[hand].grip].family;
    } else {
      return 'unarmed';
    }
  };

  const isWieldingRangedWeapon = function isWieldingRangedWeapon(character) {
    return isWieldingMissileWeapon(character) || isWieldingThrowingWeapon(character);
  };

  const isWieldingMissileWeapon = function isWieldingMissileWeapon(character) {
    return isWieldingWeaponFamily(character, ['MWD', 'MWM']);
  };

  const isWieldingThrowingWeapon = function isWieldingThrowingWeapon(character) {
    return isWieldingWeaponFamily(character, ['TWH', 'TWK', 'TWS', 'SLI']);
  };

  const isRangedWeapon = function isRangedWeapon(weapon) {
    return ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].includes(weapon.family);
  };

  const isUnarmed = function isUnarmed(character) {
    return getWeaponFamily(character, 'leftHand') === 'unarmed' && getWeaponFamily(character, 'rightHand') === 'unarmed';
  };

  const isDualWielding = Rx.zip(left_hand, right_hand).pipe(map(function (character) {
    const leftHand = getWeaponFamily(character, 'leftHand');
    const rightHand = getWeaponFamily(character, 'rightHand');
    return character.leftHand._id !== character.rightHand._id && leftHand !== 'unarmed' && rightHand !== 'unarmed';
  }));

  return character;
};
// MML.game_state = MML.players.pipe();

// MML.gm_created_effects = MML.menuIdle.pipe(
  
// );

// MML.statusEffects = Rx.merge(
//   MML.action_results,
//   MML.gm_created_effects
// );


// MML.startCombat = function startCombat(selectedIds) {
//   var gm = state.MML.GM;
//   gm.inCombat = true;
//   const allCombatants = selectedIds.map(id => MML.characters[id]);
//   _.each(MML.players, function(player) {
//     player.combatants = player.characters.filter(character => selectedIds.includes(character.id));
//   });
//   _.each(allCombatants, function(character) {
//     MML.setReady(character, false);
//     MML.setCombatVision(character);
//   });
//   const sortedCombatants = MML.setTurnOrder(allCombatants);
//   return MML.newRound(gm, 0, sortedCombatants);
// };

// Rx.merge(
//   MML.startCombat.pipe(mapTo('true')),
//   MML.endCombat.pipe(mapTo('false'))
// )
// .subscribe(show => Campaign().set('initiativepage', show));

// MML.newRound = Rx.merge(MML.startCombat).pipe(

// );

async function newRound(gm, currentRound, combatants) {
  try {
    gm.roundStarted = false;
    const updatedCombatants = await Promise.all(combatants.map(character => MML.newRoundUpdate(character)));
    const actions = await Promise.all(_.values(MML.players).map(player => MML.prepareCharacters(player)));
    return await MML.startRound(gm, currentRound, actions);
  } catch (err) {
    log(err.stack)
  }
};

MML.startRound = async function startRound(gm, currentRound, actions) {
  const {pressedButton} = await MML.displayMenu(gm.player, 'Start round when all characters are ready.', ['Start Round', 'End Combat']);
  if (pressedButton === 'Start Round') {
    if (MML.checkReady(gm.allCombatants)) {
      gm.roundStarted = true;
      _.each(gm.allCombatants, function(character) {
        character.movementAvailable = character.movementRatio;
      });
      return await MML.nextAction(gm, currentRound, actions);
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
  }
};

MML.nextAction = async function nextAction(gm, currentRound, combatants) {
  const sortedCombatants = MML.setTurnOrder(combatants);
  if (MML.checkReady(sortedCombatants)) {
    const character = sortedCombatants[0];
    if (character.initiative > 0) {
      gm.actor = character.id;
      await MML.startAction(character.player, character, MML.validateAction(character));
      return await MML.nextAction(gm, currentRound, sortedCombatants);
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
  combatants.sort((character_a, character_b) => character_b.initiative - character_a.initiative);
  const turnorder = combatants.map(function (character) {
    return {
      id: MML.getCharacterToken(character.id).id,
      pr: character.initiative,
      custom: ''
    };
  });
  Campaign().set('turnorder', JSON.stringify(turnorder));
  return combatants;
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
    callback: 'sendChatMenu',
    input: {}
  });
};
MML.grappleAttackAction = async function grappleAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await MML.getSingleTarget(player);
  const attack = await MML.meleeAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await MML.grappleDefense(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      await MML.grappleHandler(player, character, target, action);
    }
  }
  return MML.endAction(player, character, action, target);
};

MML.releaseOpponentAction = async function releaseOpponentAction(player, character, action) {
  const target = await MML.getSingleTarget(player);
  if (_.has(character.statusEffects, 'Holding')) {
    MML.removeHold(character, target);
  }
  const {pressedButton} = await MML.displayMenu(target.player, 'Allow ' + character.name + ' to release the grapple?', ['Yes', 'No']);
  if (pressedButton === 'Yes') {
    MML.removeGrapple(character, target);
    action.modifiers = _.without(action.modifiers, 'Release Opponent');
    return MML.processAction(player, character, action);
  } else {
    await MML.breakGrapple(character, target);
  }
};

MML.chooseGrappleDefense = async function chooseGrappleDefense(player, character, brawlMods, attackMods, attackerWeapon) {
  const brawlChance = MML.sumModifiers(brawlMods);
  const attackChance = MML.sumModifiers(attackMods);
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Brawl: ' + brawlChance + '%', 'Take it'];
  if (!MML.isUnarmed(character)) {
    buttons.unshift('With Weapon: ' + attackChance + '%');
  }
  const {pressedButton} = await MML.displayMenu(player, message, buttons);
  switch (pressedButton) {
    case 'With Weapon: : ' + attackChance + '%':
      MML.addStatusEffect(character, 'Melee This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        MML.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return blockMods;
    case 'Brawl: ' + brawlChance + '%':
      MML.addStatusEffect(character, 'Melee This Round', {});
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

MML.grappleDefense = function grappleDefense(character, attackType) {
  const brawlSkill = _.isUndefined(character.weaponSkills['Brawling']) ? 0 : character.weaponSkills['Brawling'].level;
  const defaultMartialSkill = character.weaponSkills['Default Martial'].level;
  const brawlMods = [
    character.meleeDefenseMod,
    character.attributeDefenseMod,
    attackType.defenseMod,
    character.situationalMod,
    brawlSkill < defaultMartialSkill ? defaultMartialSkill : brawlSkill
  ];

  const defendWithWeapon = !MML.isUnarmed(character) && _.isEmpty(_.intersection(_.keys(character.statusEffects), [
    'Stunned',
    'Holding',
    'Grappled',
    'Held',
    'Taken Down',
    'Pinned',
    'Overborne'
  ]));
  const characterWeaponInfo = MML.getWeaponAndSkill(character);
  const weaponMods = [
    characterWeaponInfo.characterWeapon.task,
    characterWeaponInfo.skill,
    character.situationalMod,
    character.meleeAttackMod,
    character.attributeMeleeAttackMod
  ];

  MML.addStatusEffect(character, 'Melee This Round', {});

};

MML.grappleHandler = function grappleHandler(character, defender, attackName) {
  switch (attackName) {
    case 'Grapple':
      MML.applyGrapple(character, defender);
      break;
    case 'Place a Hold, Head, Arm, Leg':
      MML.applyHold(character, defender);
      break;
    case 'Place a Hold, Chest, Abdomen':
      MML.applyHold(character, defender);
      break;
    case 'Break a Hold':
      MML.removeHold(character, defender);
      break;
    case 'Break Grapple':
      MML.removeGrapple(character, defender);
      break;
    case 'Takedown':
      MML.applyTakedown(character, defender);
      break;
    case 'Regain Feet':
      MML.applyRegainFeet(character, defender);
      break;
    default:
      sendChat('Error', 'Unhappy grapple :(');
  }
  MML.applyStatusEffects(character);
  MML.applyStatusEffects(defender);
};

MML.applyGrapple = function applyGrapple(character, defender) {
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(defender.statusEffects, 'Holding')) {
    MML.removeHold(MML.characters[defender.statusEffects['Holding'].targets[0]], defender);
  }
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
};

MML.applyHold = function applyHold(character, defender) {
  if (_.has(character.statusEffects, 'Grappled')) {
    MML.removeStatusEffect(character, 'Grappled');
  }
  character.statusEffects['Holding'] = {
    id: MML.generateRowID(),
    name: 'Holding',
    targets: [defender.id],
    bodyPart: state.MML.GM.currentAction.calledShot
  };
  if (['Chest', 'Abdomen'].indexOf(state.MML.GM.currentAction.calledShot) > -1 && defender.movementType === 'Prone') {
    defender.statusEffects['Pinned'] = {
      id: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].id : MML.generateRowID(),
      name: 'Pinned',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([character.id]) : [character.id]
    };
  } else {
    const holder = {
      name: character.id,
      bodyPart: state.MML.GM.currentAction.calledShot
    };
    defender.statusEffects['Held'] = {
      id: _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].id : MML.generateRowID(),
      name: 'Held',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([holder]) : [holder]
    };
  }
  if (_.has(defender.statusEffects, 'Grappled')) {
    if (defender.statusEffects['Grappled'].targets.length === 1) {
      MML.removeStatusEffect(defender, 'Grappled');
    } else {
      defender.statusEffects['Grappled'] = {
        id: defender.statusEffects['Grappled'].id,
        name: 'Grappled',
        targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
      };
    }
  }
};

MML.removeHold = function removeHold(character, defender) {
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
  MML.removeStatusEffect(defender, 'Holding');
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(character.statusEffects, 'Held')) {
    if (character.statusEffects['Held'].targets.length === 1) {
      MML.removeStatusEffect(character, 'Held');
    } else {
      character.statusEffects['Held'] = {
        id: character.statusEffects['Held'].id,
        name: 'Held',
        targets: _.reject(character.statusEffects['Held'].targets, function(target) {
          return target.id === defender.id;
        })
      };
    }
  } else if (_.has(character.statusEffects, 'Pinned')) {
    if (character.statusEffects['Pinned'].targets.length === 1) {
      MML.removeStatusEffect(character, 'Pinned');
    } else {
      character.statusEffects['Pinned'] = {
        id: character.statusEffects['Pinned'].id,
        name: 'Pinned',
        targets: _.without(character.statusEffects['Pinned'].targets, defender.id)
      };
    }
  }
};

MML.removeGrapple = function removeGrapple(character, defender) {
  if (character.statusEffects['Grappled'].targets.length === 1) {
    MML.removeStatusEffect(character, 'Grappled');
  } else {
    character.statusEffects['Grappled'] = {
      id: character.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(character.statusEffects['Grappled'].targets, defender.id)
    };
  }
  if (defender.statusEffects['Grappled'].targets.length === 1) {
    MML.removeStatusEffect(defender, 'Grappled');
  } else {
    defender.statusEffects['Grappled'] = {
      id: defender.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
    };
  }
};

MML.applyTakedown = function applyTakedown(character, defender) {
  const grapplers = _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets : [];
  const holders = _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].targets : [];
  if (grapplers.length + holders.length > 1) {
    defender.statusEffects['Overborne'] = {
      id: MML.generateRowID(),
      name: 'Overborne'
    };
  } else {
    defender.tatusEffects['Taken Down'] = {
      id: MML.generateRowID(),
      name: 'Taken Down'
    };
  }
  if (holders.length > 0) {
    const targets = [];
    _.each(holders, function(holder) {
      if (['Chest', 'Abdomen'].indexOf(holder.bodyPart) > -1) {
        targets.push(holder.id);
        holder.movementType('Prone');
      }
    });
    if (targets.length > 0) {
      defender.statusEffects['Pinned'] = {
        id: MML.generateRowID(),
        name: 'Pinned',
        targets: targets
      };
      if (_.reject(defender.statusEffects['Held'].targets, function(target) {
          return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
        }).length === 0) {
        MML.removeStatusEffect(defender, 'Held');
      } else {
        defender.statusEffects['Held'] = {
          id: defender.statusEffects['Held'].id,
          name: 'Held',
          targets: _.reject(defender.statusEffects['Held'].targets, function(target) {
            return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
          })
        };
      }
    }
  }
  if (grapplers.length > 0) {
    _.each(defender.statusEffects['Grappled'].targets, function(target) {
      target.movementType = 'Prone';
    });
  }
  defender.movementType = 'Prone';
  character.movementType = 'Prone';
};

MML.applyRegainFeet = function applyRegainFeet(character, defender) {
  const grapplers = _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets : [];
  const holders = _.has(character.statusEffects, 'Held') ? character.statusEffects['Held'].targets : [];

  if (holders.length > 0) {
    _.each(holders, function(target) {
      target.movementType = 'Walk';
    });
  }
  if (grapplers.length > 0) {
    _.each(grapplers, function(target) {
      target.movementType = 'Walk';
    });
  }
  MML.removeStatusEffect(character, 'Taken Down');
  MML.removeStatusEffect(character, 'Overborne');
  character.movementType = 'Walk';
};
const MML = {};

Rx.r20_ready
Rx.add_attribute
Rx.chat_message
Rx.change_character_name

Rx.change_attribute_current

MML.players = Rx.change_player_online.pipe(
  startWith(findObjs({
    _type: 'player',
    online: true
  }, {
    caseInsensitive: false
  }))
);

MML.player_list = MML.players.pipe(
  scan(function (player_list, player) {
    const id = player.get('id');
    if (player.get('online')) {
      player_list[id] = player;
    } else if (!_.isUndefined(player_list[id])) {
      delete player_list[id];
    }
    return player_list;
  }, {})
);

MML.GM = MML.players.pipe(filter(player => playerIsGM(player.get('id'))));

MML.button_pressed = chat.pipe(
  filter(({ type, content }) => type === 'api' && content.includes('!MML|')),
  map(function (message) {
    message.who = message.who.replace(' (GM)', '');
    message.content = message.content.replace('!MML|', '');
    message.selected = MML.getSelectedIds(message.selected);
    return message;
  }),
  // share(),
  tap(() => log('button'))
);

MML.characters = Rx.add_character.pipe(
  startWith(
    findObjs({
      _type: 'character',
      archived: false
    }, {
      caseInsensitive: false
    })
  ),
  map(character => MML.createCharacter(character.id))
);

MML.character_list = MML.characters.pipe(
  scan(function (character_list, character) {
    character_list[character.id] = character;
    return character_list;
  }, {})
);

MML.character_controlled_by = Rx.change_character_controlledby.pipe(
  map(function (character) {
    return {
      character_id: character.id,
      player_id_list: character.controlledby.split(',')
    };
  })
);

MML.character_controlled_by_error = MML.character_controlled_by.pipe(
  filter(({ player_id_list }) => player_id_list.length === 0 || player_id_list.length > 1),
  withLatestFrom(MML.GM),
  tap(([controlled_by, gm]) => sendChat(gm.name, 'Character needs exactly 1 player'))
)

MML.token_moved = Rx.change_token.pipe(
  filter(([curr, prev]) => curr.get('left') !== prev['left'] && curr.get('top') !== prev['top']),
  map(([token]) => token)
);

MML.character_moved = MML.token_moved.pipe(
  withLatestFrom(MML.character_list),
  filter(([token, character_list]) => Object.keys(character_list).includes(token.get('represents'))),
  map(([token, character_list]) => character_list[token.get('represents')])
);

MML.spell_marker_moved = Rx.change_token.pipe(
  filter(token => token.get('name').includes('spellMarker')),
  map(function (obj, prev) {
    var targets = MML.getAoESpellTargets(obj);
    _.each(MML.characters, function (character) {
      var token = MML.getCharacterToken(character.id);
      if (!_.isUndefined(token)) {
        if (targets.includes(character.id)) {
          token.set('tint_color', '#00FF00');
        } else {
          token.set('tint_color', 'transparent');
        }
      }
    });
    state.MML.GM.currentAction.parameters.metaMagic['Modified AoE'] = MML.getAoESpellModifier(obj, state.MML.GM.currentAction.parameters.spell);
    sendChat('GM',
      'EP Cost: ' + MML.getModifiedEpCost() + '\n' +
      'Chance to Cast: ' + MML.getModifiedCastingChance()
    );
    toBack(obj);
  })
);

MML.init = function () {
  state.MML = {};
  state.MML.GM = {
    player: new MML.Player('Robot', true),
    name: 'Robot',
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };

  _.each(playerObjects, function (player) {
    if (player.get('displayname') !== state.MML.GM.name) {
      MML.players[player.get('displayname')] = new MML.Player(player.get('displayname'), false);
    }
  });

  MML.initializeMenu(state.MML.GM.player);

  on('add:character', function (character) {
    const id = character.get('id');
    const name = character.get('name');

    MML.createAttribute('id', id, '', character);
    MML.createAttribute('player', state.MML.GM.player.name, '', character);
    MML.createAttribute('name', name, '', character);
    MML.createAttribute('race', 'Human', '', character);
    MML.createAttribute('gender', 'Male', '', character);
    MML.createAttribute('statureRoll', 6, '', character);
    MML.createAttribute('strengthRoll', 6, '', character);
    MML.createAttribute('coordinationRoll', 6, '', character);
    MML.createAttribute('healthRoll', 6, '', character);
    MML.createAttribute('beautyRoll', 6, '', character);
    MML.createAttribute('intellectRoll', 6, '', character);
    MML.createAttribute('reasonRoll', 6, '', character);
    MML.createAttribute('creativityRoll', 6, '', character);
    MML.createAttribute('presenceRoll', 6, '', character);
    MML.createAttribute('fomInitBonus', 6, '', character);
    MML.createAttribute('rightHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);
    MML.createAttribute('leftHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);

    setTimeout(function () {
      MML.characters[id] = MML.createCharacter(character.id);
      MML.updateCharacterSheet(characters[id]);
    }, 2000);
  });

  on('add:attribute', function (attribute) {
    var id = attribute.get('_characterid');
    var attrName = attribute.get('name');

    if (attrName.includes('repeating_skills') || attrName.includes('repeating_weaponskills')) {
      MML.updateCharacterSheet(characters[id]);
    }
  });

  on('change:character:name', function (changedCharacter) {
    const character = MML.characters[changedCharacter.get('id')];
    character.name = changedCharacter.get('name');
    MML.updateCharacterSheet(character);
  });

  on('change:attribute:current', function (attribute) {
    var character = MML.characters[attribute.get('_characterid')];
    var attrName = attribute.get('name');
    var roll;
    var rollAttributes = [
      'statureRoll',
      'strengthRoll',
      'coordinationRoll',
      'healthRoll',
      'beautyRoll',
      'intellectRoll',
      'reasonRoll',
      'creativityRoll',
      'presenceRoll'
    ];

    if (rollAttributes.includes(attrName)) {
      roll = parseFloat(attribute.get('current'));
      if (isNaN(roll) || roll < 6) {
        roll = 6;
      } else if (roll > 20) {
        roll = 20;
      }
      MML.setCurrentAttribute(character.id, attrName, roll);
      MML.updateCharacterSheet(character);
    } else if (attrName === 'player') {
      character.setPlayer();
    } else if (attrName != 'tab') {
      MML.updateCharacterSheet(character);
    }
  });
};
MML.sendChatMenu = function sendChatMenu(name, message, buttons) {
  var toChat = '/w "' + name +
    '" &{template:charMenu} {{name=' + message + '}} ' +
    buttons.map(function(button) {
      return '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!MML|' + button + ')}}';
    }).join(' ');

  sendChat(name, toChat, null, {
    noarchive: true
  });
};

MML.setMenuButtons = function setMenuButtons(player, buttons) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton, selectedIds) {
      if (_.contains(buttons, pressedButton)) {
        resolve({pressedButton, selectedIds});
      }
    };
  });
};

// IDEAR: build an array of previous menus as an optional parameter to allow for backtracking
MML.displayMenu = function displayMenu(player, message, buttons) {
  MML.sendChatMenu(player, message, buttons);
  return MML.setMenuButtons(player, buttons);
};

MML.initializeMenu = Rx.merge(
  MML.buttonPressed.pipe(
    filter(message => message.content === 'initializeMenu'),
    take(1)
  )
);

// function initializeMenu(player) {
//   await MML.setMenuButtons(player, ['initializeMenu']);
//   if (player.name === state.MML.GM.name) {
//     return await MML.menuMainGm(player);
//   } else {
//     return await MML.menuMainPlayer(player);
//   }
// };

MML.menuMainGm = MML.initializeMenu.pipe(
  tap(message => MML.displayMenu(message.who, 'Main Menu: ', ['Combat', 'Roll Dice'])),
  switchMapTo(MML.buttonPressed)
);

// function menuMainGm(player) {
//   const {pressedButton} = 
//   switch (pressedButton) {
//     case 'Combat':
//       return MML.menuGmCombat(player);
//     case 'Roll Dice':
//       return MML.menuselectDieSize(player);
//   }
// };

MML.menuGmCombat = MML.menuMainGm.pipe(
  filter(message => message.content === 'Combat'),
  tap(message => MML.displayMenu(message.who, 'Select tokens and begin.', ['Start Combat', 'Back']))
);

MML.startCombat = MML.menuGmCombat.pipe(
  switchMapTo(MML.buttonPressed),
  filter(message => message.content === 'Start Combat' && message.selected.length > 0)
);

MML.startCombat.subscribe(() => log('start'));

// async function menuGmCombat(player) {
//   try {
//     const message = 'Select tokens and begin.';
//     const buttons = ['Start Combat', 'Back'];
//     const {pressedButton, selectedIds} = await MML.displayMenu(player, message, buttons);
//     switch (pressedButton) {
//       case 'Start Combat':
//         if (selectedIds.length > 0) {
//           return MML.startCombat(selectedIds);
//         } else {
//           sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
//           return MML.menuGmCombat(player);
//         }
//       case 'Back':
//         return MML.menuMainGm(player);
//     }
//   } catch (error) {
//     log(error);
//   }
// };
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

MML.Player = function Player(id) {
  const player = this;
  player.name = name;
  player.characters = MML.characters.pipe(
    mergeMap(character => Rx.combineLatest(character.player)),
    filter(),
    scan(function (list, character) {
      list[character.id] = character;
      return  character;
    })
  );

  // player.menu = MML.buttonPressed.pipe(
  //     filter(message => message.who === player.name),
  //     scan()

  //   )
  //   .subscribe(menu => sendChat(player.name, menu, null, {
  //     noarchive: true
  //   }));
};

// MML.sendChatMenu = function sendChatMenu(player, message, buttons) {
//   var toChat = '/w "' + player.name +
//     '" &{template:charMenu} {{name=' + message + '}} ' +
//     buttons.map(function (button) {
//       return '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!MML|' + button + ')}}';
//     })
//     .join(' ');

//   sendChat();
// };

// IDEA-R: build an array of previous menus as an optional parameter to allow for backtracking
MML.displayMenu = function displayMenu(player, message, buttons) {
  MML.sendChatMenu(player, message, buttons);
  return MML.setMenuButtons(player, buttons);
};

MML.initializeMenu = async function initializeMenu(player) {
  await MML.setMenuButtons(player, ['initializeMenu']);
  if (player.name === state.MML.GM.name) {
    return await MML.menuMainGm(player);
  } else {
    return await MML.menuMainPlayer(player);
  }
};MML.rollDice = function rollDice(amount, size) {
  switch (state.MML.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Rx.range(amount).pipe(
        map(() => randomInteger(size)), 
        reduce((sum, value) => sum + value, 0)
      );
  }
};

MML.parseDice = function parseDice(dice) {
  const diceArray = dice.split('d').map(num => parseInt(num));
  return {
    amount: diceArray[0],
    size: diceArray[1]
  };
};

MML.sumModifiers = function sumModifiers(modifiers) {
  return modifiers ? modifiers.reduce((sum, value) => sum + value, 0) : 0;
};

MML.processRoll = async function processRoll(player, value, getResult, getMessage, changeValue) {
  const result = getResult(value);
  const message = getMessage(value, result);
  if (player.name === state.MML.GM.name) {
    MML.displayGmRoll(player, message);
    const pressedButton = await MML.setRollButtons(player);
    if (pressedButton !== 'acceptRoll') {
      const newValue = await changeValue(player, pressedButton);
      return await processRoll(player, newValue, getResult, getMessage, changeValue);
    }
  } else {
    MML.displayPlayerRoll(player, message);
  }
  return result;
};

MML.changeRoll = function changeRoll(low, high) {
  return async function getNewValue(player, pressedButton) {
    const newValue = parseInt(pressedButton);
    if (isNaN(newValue)) {
      sendChat('Error', 'Roll value must be numerical.');
      const pressedButton = await MML.setRollButtons(player);
      return getNewValue(player, pressedButton);
    } else if (newValue < low || newValue > high) {
      sendChat('Error', 'New roll value out of range.');
      const pressedButton = await MML.setRollButtons(player);
      return getNewValue(player, pressedButton);
    } else {
      return newValue;
    }
  }
};

MML.universalRoll = async function universalRoll(player, modifiers) {
  const value = await MML.rollDice(1, 100);
  const target = MML.sumModifiers(modifiers);
  return MML.processRoll(player,
    value,
    MML.universalRollResult(target),
    MML.rollMessage(target, modifiers, '1-100'),
    MML.changeRoll(1, 100));
};

MML.universalRollResult = function universalRollResult(target) {
  return function (value) {
    if (value > 94) {
      return 'Critical Failure';
    } else {
      if (value <= target) {
        if (value <= Math.round(target / 10)) {
          return 'Critical Success';
        } else {
          return 'Success';
        }
      } else {
        return 'Failure';
      }
    }
  }
}

MML.rollMessage = function rollMessage(target, modifiers, range) {
  return function (value, result) {
    return [
      'Roll: ' + value +
      'Target: ' + target +
      'Result: ' + result +
      'Range: ' + range
    ].join(' \n');
  };
};

MML.attributeCheckRoll = async function attributeCheckRoll(player, attribute, modifiers) {
  const value = await MML.rollDice(1, 20);
  const target = attribute + MML.sumModifiers(modifiers);
  return MML.processRoll(player,
    value,
    MML.attributeCheckResult(target),
    MML.rollMessage(target, modifiers, '1-20'),
    MML.changeRoll(1, 20));
};

MML.attributeCheckResult = function attributeCheckResult(target) {
  return function (value) {
    if ((value <= target || value === 1) && value !== 20) {
      return 'Success';
    } else {
      return 'Failure';
    }
  };
};

MML.damageRoll = async function damageRoll(player, diceString, damageType, modifiers, crit) {
  const {amount, size} = MML.parseDice(diceString);
  const modifier = MML.sumModifiers(modifiers) + (crit === 'Critical Success' ? amount * size : 0);
  const low = crit === 'Critical Success' ? amount * size + amount + modifier : amount + modifier;
  const high = crit === 'Critical Success' ? 2 * amount * size + modifier : amount * size + modifier;
  const value = await MML.rollDice(amount, size);
  return MML.processRoll(player,
    value + modifier,
    MML.damageRollResult,
    MML.damageRollMessage(low, high, damageType, modifiers, modifier),
    MML.changeRoll(low, high));
};

MML.damageRollResult = function damageRollResult(value) {
  return -1 * value;
};

MML.damageRollMessage = function damageRollMessage(low, high, damageType, modifiers, modifier) {
  return function (value) {
    return [
      'Damage Type: ' + damageType,
      'Range: ' + low + '-' + high,
      'Roll: ' + (value - modifier),
      'Modifier: ' + modifier,
      'Result:' + value
    ].join(' \n');
  }
};

MML.genericRoll = async function genericRoll(player, diceString, modifiers) {
  const {amount, size} = MML.parseDice(diceString);
  const modifier = MML.sumModifiers(modifiers);
  const low = amount + modifier;
  const high = amount * size + modifier;
  const value = await MML.rollDice(amount, size);
  return MML.processRoll(player,
    value + modifier,
    MML.genericRollResult,
    MML.genericRollMessage(low, high, modifiers, modifier),
    MML.changeRoll(low, high));

};

MML.genericRollResult = function genericRollResult(value) {
  return value;
};

MML.genericRollMessage = function genericRollMessage(low, high, modifiers, modifier) {
  return function getGenericRollMessage(value) {
    return [
      'Range: ' + low + '-' + high,
      'Roll: ' + (value - modifier),
      'Modifier: ' + modifier,
      'Result:' + value
    ].join(' \n');
  }
};

MML.initiativeRoll = async function initiativeRoll(player, character) {
  var modifiers = [character.situationalInitBonus,
    character.movementRatioInitBonus,
    character.attributeInitBonus,
    character.senseInitBonus,
    character.fomInitBonus,
    character.firstActionInitBonus,
    character.actionInitCostMod,
    character.spentInitiative];

  const value = await MML.genericRoll(player, '1d10', modifiers);
  character.initiativeRollValue = value;
  MML.setReady(character, true);
  return player;
};

MML.meleeAttackRoll = async function meleeAttackRoll(player, character, task, skill) {
  await MML.displayMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return MML.universalRoll(player, [
    character.situationalMod,
    character.meleeAttackMod,
    character.attributeMeleeAttackMod,
    task,
    skill
  ]);
};

MML.meleeDefenseRoll = async function meleeDefenseRoll(player, character, attackerWeapon) {
  var itemId;
  var grip;
  var defenderWeapon;
  const blockMods = [];
  const defenseMods = [character.situationalMod, character.meleeDefenseMod, character.attributeDefenseMod];
  const defaultMartialSkill = weaponSkills['Default Martial'].level;
  const dodgeSkill = _.isUndefined(weaponSkills['Dodge']) ? 0 : weaponSkills['Dodge'].level;
  const dodgeMods = defenseMods.concat(dodgeSkill > defaultMartialSkill ? dodgeSkill : defaultMartialSkill);
  const weaponSkills = character.weaponSkills;
  const shieldMod = MML.getShieldDefenseBonus(character);

  if (attackerWeapon.initiative < 6) {
    dodgeMods.push(15);
  }

  if (!MML.isUnarmed(character) && !MML.isWieldingRangedWeapon(character)) {
    if (MML.isDualWielding(character)) {
      log('Dual Wield defense');
    } else if (MML.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
      itemId = character.rightHand._id;
      grip = character.rightHand.grip;
    } else {
      itemId = character.leftHand._id;
      grip = character.leftHand.grip;
    }

    defenderWeapon = character.inventory[itemId];
    blockMods = [defenderWeapon.grips[grip].defense, sitMod, defenseMod, shieldMod];
    blockSkill = Math.round(MML.getWeaponSkill(character, defenderWeapon) / 2);

    if (blockSkill >= defaultMartialSkill) {
      blockMods.push(blockSkill);
    } else {
      blockMods.push(defaultMartialSkill);
    }
  }

  if (attackerWeapon.family === 'Flexible') {
    dodgeMods.push(-10);
    blockMods.push(-10);
  } else if (attackerWeapon.family === 'Unarmed') {
    dodgeMods.push(attackerWeapon.defenseMod);
    blockMods.push(attackerWeapon.defenseMod);
  }

  MML.removeAimAndObserving(character);
  const defense = await MML.chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon);
  return defense === 'Failure' ? defense : MML.universalRoll(player, defense);
};

MML.meleeDamageRoll = async function meleeDamageRoll(player, character, weapon, attack, bonusDamage) {
  await MML.displayMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return MML.damageRoll(player, weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attack);
};

MML.missileAttackRoll = async function missileAttackRoll(player, character, target, weapon, skill) {
  const mods = [
    skill,
    character.situationalMod,
    character.missileAttackMod,
    character.attributeMissileAttackMod
  ];
  if (_.has(target.statusEffects, 'Shoot From Cover')) {
    mods.push(-20);
  }
  if (weapon.family === 'MWM') {
    character.inventory[weapon._id].loaded = 0;
  }
  var range = MML.getDistanceBetweenCharacters(character, target);
  var task;
  var itemId;
  var grip;

  if (MML.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
    itemId = character.rightHand._id;
    grip = character.rightHand.grip;
  } else {
    itemId = character.leftHand._id;
    grip = character.leftHand.grip;
  }

  MML.buildWeaponObject(item, grip);
  var item = character.inventory[itemId];

  var attackerWeapon = {
    _id: itemId,
    name: item.name,
    type: 'weapon',
    weight: item.weight,
    family: item.grips[grip].family,
    hands: item.grips[grip].hands,
    initiative: item.grips[grip].initiative,
    reload: item.grips[grip].reload,
    damageType: item.grips[grip].primaryType
  };

  if (range <= item.grips[grip].range.pointBlank.range) {
    attackerWeapon.task = item.grips[grip].range.pointBlank.task;
    attackerWeapon.damage = item.grips[grip].range.pointBlank.damage;
  } else if (range <= item.grips[grip].range.effective.range) {
    attackerWeapon.task = item.grips[grip].range.effective.task;
    attackerWeapon.damage = item.grips[grip].range.effective.damage;
  } else if (range <= item.grips[grip].range.long.range) {
    attackerWeapon.task = item.grips[grip].range.long.task;
    attackerWeapon.damage = item.grips[grip].range.long.damage;
  } else {
    attackerWeapon.task = item.grips[grip].range.extreme.task;
    attackerWeapon.damage = item.grips[grip].range.extreme.damage;
  }

  state.MML.GM.currentAction.callback = 'missileAttackAction';
  state.MML.GM.currentAction.parameters.range = range;
  state.MML.GM.currentAction.parameters.attackerWeapon = attackerWeapon;
  state.MML.GM.currentAction.parameters.attackerSkill = MML.getWeaponSkill(character, item);

  await MML.displayMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return MML.universalRoll(player, mods);
};

MML.missileDamageRoll = async function missileDamageRoll(player, character, damage, damageType, attackRoll, bonusDamage) {
  await MML.displayMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return MML.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], rolls.attackRoll);
};

MML.missileDefenseRoll = async function missileDefenseRoll(player, character, attackerWeapon, range) {
  const dodgeMods = [
    character.missileDefenseMod,
    character.attributeDefenseMod,
    character.situationalMod,
    MML.getShieldDefenseBonus(character)
  ];
  const defaultMartialSkill = character.weaponSkills['Default Martial'].level;
  const dodgeSkill = _.isUndefined(character.skills['Dodge']) ? 0 : character.skills['Dodge'].level;
  dodgeMods.push(dodgeSkill > defaultMartialSkill ? dodgeSkill : defaultMartialSkill);

  var rangeMod;
  switch (attackerWeapon.family) {
    case 'MWD':
    case 'MWM':
      rangeMod = Math.floor(range / 75);
      dodgeMods.push(rangeMod > 3 ? 3 : rangeMod);
      break;
    case 'TWH':
      rangeMod = Math.floor(range / 5);
      dodgeMods.push(rangeMod > 5 ? 5 : rangeMod);
      dodgeMods.push(25);
      break;
    case 'TWK':
      rangeMod = Math.floor(range / 5);
      dodgeMods.push(rangeMod > 3 ? 3 : rangeMod);
      dodgeMods.push(15);
      break;
    case 'TWS':
      rangeMod = Math.floor(range / 5);
      dodgeMods.push(rangeMod > 5 ? 5 : rangeMod);
      dodgeMods.push(15);
      break;
    default:
      rangeMod = Math.floor(range / 20);
      dodgeMods.push(rangeMod > 5 ? 5 : rangeMod);
  }

  MML.removeAimAndObserving(character);
  MML.chooseMissileDefense(player, character, dodgeMods)
  const defense = await MML.chooseMissileDefense(player, character, defense, attackerWeapon);
  return defense === 'Failure' ? defense : MML.universalRoll(player, defense);
};

MML.grappleDefenseWeaponRoll = function grappleDefenseWeaponRoll(character, attackChance) {
  MML.universalRoll(player, character, 'Weapon Defense Roll', [attackChance], 'grappleDefenseWeaponRollResult');
};

MML.grappleDefenseWeaponRollApply = function grappleDefenseWeaponRollApply(character) {
  var result = character.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(character.statusEffects, 'Number of Defenses')) {
      character.statusEffects['Number of Defenses'].number++;
    } else {
      MML.addStatusEffect(character, 'Number of Defenses', {
        number: 1
      });
    }

  }
  state.MML.GM.currentAction.rolls.weaponDefenseRoll = character.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefenseBrawlRoll = function grappleDefenseBrawlRoll(character, brawlChance) {
  MML.universalRoll(player, character, 'Brawl Defense Roll', [brawlChance], 'grappleDefenseBrawlRollResult');
};

MML.grappleDefenseBrawlRollApply = function grappleDefenseBrawlRollApply(character) {
  var result = character.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(character.statusEffects, 'Number of Defenses')) {
      character.statusEffects['Number of Defenses'].number++;
    } else {
      MML.addStatusEffect(character, 'Number of Defenses', {
        number: 1
      });
    }
  }
  state.MML.GM.currentAction.rolls.brawlDefenseRoll = character.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.holdAimRoll = async function holdAimRoll(player, character) {
  await MML.displayMenu(player, 'Strength Check Required to Maintain' + character.name + '\'s Aim', ['Roll']);
  return MML.attributeCheckRoll(player, character.strength);
};

MML.castingRoll = async function castingRoll(player, character, task, skill, metaMagicMod) {
  await MML.displayMenu(player, character.name + '\'s Casting Roll', ['Roll']);
  return MML.universalRoll(player, [task, skill, character.situationalMod, character.castingMod, character.attributeCastingMod, metaMagicMod]);
};

MML.fatigueCheck= async function fatigueCheck(player, character) {
  const result = await MML.attributeCheckRoll(player, character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0]);
  if (result === 'Critical Success' || result === 'Success') {
    if (_.has(character.statusEffects, 'Fatigue')) {
      character.statusEffects['Fatigue'].level += 1;
      MML.applyStatusEffects(character);
    } else {
      MML.addStatusEffect(character, 'Fatigue', {level: 1});
    }
    character.roundsExertion = 0;
  }
};

MML.fatigueRecovery = async function fatigueRecovery(player, character, modifier) {
  const result = await MML.attributeCheckRoll(player, character.health);
  if (result === 'Critical Success' || result === 'Success') {
    character.roundsRest = 0;
    character.roundsExertion = 0;
    character.statusEffects['Fatigue'].level--;
    MML.applyStatusEffects(character);
  }
};

MML.hitPositionRoll = async function hitPositionRoll(player, character, target, action) {
  await MML.displayMenu(player, character.name + '\'s Hit Position Roll', ['Roll']);
  const hitPositions = MML.hitPositions[target.bodyType];
  if (_.contains(action.modifiers, 'Called Shot Specific')) {
    return _.findWhere(hitPositions, function(hitPosition) {
      return hitPosition.name === action.calledShot;
    });
  } else if (_.contains(action.modifiers, 'Called Shot')) {
    return MML.calledShotHitPositionRoll(player, target, MML.getAvailableHitPositions(target, action.calledShot));
  } else {
    return MML.defaultHitPositionRoll(player, target, hitPositions);
  }
};

MML.defaultHitPositionRoll = async function defaultHitPositionRoll(player, target, hitPositions) {
  const value = await MML.rollDice(1, 100);
  const hitPosition = MML.getHitPosition(target, value);
  return MML.processHitpositionRoll(player,
    hitPosition,
    MML.hitPositionRollMessage(target),
    MML.changeHitPosition(hitPositions));
};

MML.calledShotHitPositionRoll = async function calledShotHitPositionRoll(player, target, hitPositions) {
  const value = await MML.rollDice(1, hitPositions.length);
  const hitPosition = hitPositions[value - 1];
  return MML.processHitpositionRoll(player,
    hitPosition,
    MML.hitPositionRollMessage(target),
    MML.changeHitPosition(hitPositions));
};

MML.hitPositionRollMessage = function hitPositionRollMessage(target) {
  return function (hitPosition) {
    return target.name + ' hit in the ' + hitPosition.name;
  };
};

MML.changeHitPosition = function changeHitPosition(hitPositions) {
  return async function chooseNewHitPosition(player) {
    const {pressedButton} = await MML.displayMenu(player, 'Choose Hit Position', _.pluck(hitPositions, 'name'));
    return _.findWhere(hitPositions, {name: pressedButton});
  };
};

MML.processHitpositionRoll = async function processHitpositionRoll(player, value, getMessage, changeValue) {
  const message = getMessage(value);
  if (player.name === state.MML.GM.name) {
    const {pressedButton} = await MML.displayMenu(player, message, ['Continue', 'Change']);
    if (pressedButton !== 'Continue') {
      const newValue = await changeValue(player, pressedButton);
      return await processHitpositionRoll(player, newValue, getMessage, changeValue);
    }
  } else {
    await MML.displayMenu(player, message, ['Continue']);
  }
  return value;
};
MML.spells = {};
MML.spells['Flame Bolt'] = {
  name: 'Flame Bolt',
  family: 'Fire',
  components: ['Spoken'],
  actions: 1,
  task: 45,
  ep: 20,
  range: 0,
  duration: 0,
  target: [15, 1],
  targetSizeMatters: false,
  metaMagic: ['Increase Potency'],
  cast: function() {

  }
};

MML.spells['Dart'] = {
  name: 'Dart',
  family: 'Air',
  components: ['Spoken', 'Physical', 'Substantive'],
  requiredItem: 'Dart',
  actions: 1,
  task: 55,
  ep: 14,
  range: 100,
  duration: 0,
  target: 'Single',
  targetSizeMatters: false,
  metaMagic: ['Increase Potency', 'Called Shot', 'Called Shot Specific'],
  cast: async function castDart(player, character, action) {
    const targets = await MML.getSpellTargets(player);
    _.findWhere(character.inventory, { name: 'Dart' }).quantity -= targets.length;
    const castingRoll = await MML.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'castingMod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(async function (target) {
        const defenseRoll = MML.missileDefense(target.player, target, { family: 'MWM' }, MML.getDistanceBetweenCharacters(character.id, target.id));
        if (defenseRoll === 'Critical Failure' || defenseRoll === 'Failure') {
          const hitPosition = await MML.hitPositionRoll();
          const weapon = {damageType: 'Pierce', damage: _.has(metaMagic, 'Increase Potency') ? (3 * metaMagic['Increase Potency'].level) + 'd6' : '3d6'};
          const damage = await MML.missileDamageRoll(weapon, castingRoll === 'Critical Success');
          await MML.damageCharacter(target);
        }
      });
    }
    await MML.alterEP(player, character, -1 * epCost * _.pluck(metaMagic, 'epMod').reduce((product, num) => product * num));
    MML.endAction();
  }
};

MML.spells['Hail of Stones'] = {
  name: 'Hail of Stones',
  family: 'Earth',
  components: ['Spoken', 'Physical'],
  actions: 2,
  task: 35,
  ep: 30,
  range: 75,
  duration: 0,
  target: '5\' Radius',
  targetSizeMatters: false,
  metaMagic: ['Increase Potency'],
  cast: async function castHailOfStones(player, character, action) {
    const targets = await MML.getRadiusSpellTargets();
    const castingRoll = await MML.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'castingMod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(function (target) {
        const numberOfStones = MML.genericRoll(character.name, 'numberOfStonesRoll', '1d3', 'Number of stones cast at ' + target.name, 'genericRollResult');

      })

    } else if (rolls.numberOfStonesRoll > 0) {
      if (_.isUndefined(rolls.defenseRoll)) {
        target.rangedDefense({ family: 'SLI' }, MML.getDistanceBetweenCharacters(character.id, target.id));
      } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === 'Critical Success') {
          state.MML.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.GM.currentAction.rolls.defenseRoll;
          // target.criticalDefense();
        } else if (rolls.defenseRoll === 'Success') {
          state.MML.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.GM.currentAction.rolls.defenseRoll;
          MML[state.MML.GM.currentAction.callback]();
        } else {
          character.hitPositionRoll();
        }
      } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.castingRoll === 'Critical Success') {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, true);
        } else {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, false);
        }
      }
    } else if (epModified !== true) {
      state.MML.GM.currentAction.parameters.epModified = true;
    } else {
      if (_.isUndefined(state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex + 1])) {
        MML.damageCharacter('endAction');
      } else {
        MML.damageCharacter('nextTarget');
      }
    }
    await MML.alterEP(player, character, -1 * epCost * _.reduce(_.pluck(metaMagic, 'epMod'), function(memo, num) { return memo * num; }));
    MML.endAction();
  }
};
MML.statusEffects = {
  'Major Wound':  function (effect, index) {
    if (!state.MML.GM.inCombat) {
      this.statusEffects[index].duration = 0;
      effect.duration = 0;
    }
    if (this.hp[effect.bodyPart] > Math.round(this.hpMax[effect.bodyPart] / 2)) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -5;
      }
      if (state.MML.GM.currentRound - parseInt(effect.startingRound) <= effect.duration) {
        this.situationalMod += -10;
      }
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Disabling Wound': function (effect, index) {
    if (this.hp[effect.bodyPart] > 0) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -10;
      }
      this.situationalMod += -25;
      if (effect.bodyPart === 'Head') {
        this.situationalInitBonus = 'No Combat';
        this.statusEffects[index].description = 'Situational Modifier: -25%. Unconscious';
      } else if (effect.bodyPart === 'Left Arm') {
        this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Left Arm Limp';
        this.leftHand = {
          _id: 'emptyHand',
          grip: 'unarmed'
        };
      } else if (effect.bodyPart === 'Right Arm') {
        this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Right Arm Limp';
        this.rightHand = {
          _id: 'emptyHand',
          grip: 'unarmed'
        };
      } // TODO: else if legs limit movement
    }
  },
  'Mortal Wound': function (effect, index) {
    if (this.hp[effect.bodyPart] >= -this.hpMax[effect.bodyPart]) {
      delete this.statusEffects[index];
    } else {
      this.situationalInitBonus = 'No Combat';
      this.statusEffects[index].description = 'You\'re dying, broh!';
    }
  },
  'Wound Fatigue': function (effect, index) {
    if (this.hp['Wound Fatigue'] > -1) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -5;
      }
      this.situationalMod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Number of Defenses': Rx.merge(MML.meleeDefense, MML.missileDefense, MML.grappleDefense)
    .pipe(
      map(function (effect, index) {
        if (state.MML.GM.roundStarted === false) {
          delete this.statusEffects[index];
        } else {
          this.missileDefenseMod += -20 * effect.number;
          this.meleeDefenseMod += -20 * effect.number;
          this.statusEffects[index].description = 'Defense Modifier: ' + (-20 * effect.number) + '%';
        }
      }),
      takeUntil(MML.newRound)
    ),
  'Fatigue': function (effect, index) {
    if (effect.level < 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -5 * effect.level;
      }
      this.situationalMod += -10 * effect.level;
      this.statusEffects[index].description = 'Situational Modifier: ' + -10 * effect.level + '%. Initiative: ' + -5 * effect.level;
    }
  },
  'Sensitive Area': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -5;
      }
      this.situationalMod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Stumbling': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -5;
      }
      this.statusEffects[index].description = 'Initiative: -5';
    }
  },
  'Called Shot': function (effect, index) {
    if (state.MML.GM.inCombat === false ||
      !_.contains(this.action.modifiers, 'Called Shot') ||
      (this.action.attackType !== 'Place a Hold' &&
        _.has(this.statusEffects, 'Holding'))
    ) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += -10;
      this.meleeDefenseMod += -10;
      this.missileAttackMod += -10;
      this.meleeAttackMod += -10;
      this.castingMod += -10;

      if (this.situationalInitBonus !== 'No Combat' && !effect.applied) {
        this.actionInitCostMod += -5;
        effect.applied = true;
      }

      this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -10%. Initiative: -5';
    }
  },
  'Called Shot Specific': function (effect, index) {
    if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, 'Called Shot Specific')) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += -30;
      this.meleeDefenseMod += -30;
      this.meleeAttackMod += -30;
      this.missileAttackMod += -30;
      this.castingMod += -30;

      if (this.situationalInitBonus !== 'No Combat') {
        this.actionInitCostMod += -5;
        effect.applied = true;
      }
      this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: -30%. Initiative: -5';
    }
  },
  'Aggressive Stance': function (effect, index) {
    if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, 'Aggressive Stance')) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += -40;
      this.meleeDefenseMod += -40;
      this.meleeAttackMod += 10;
      this.perceptionCheckMod += -4;
      if (this.situationalInitBonus !== 'No Combat') {
        this.actionInitCostMod += 5;
      }
      this.statusEffects[index].description = 'Attack Modifier: +10%. Defense Modifier: -40%. Initiative: +5. Preception Modifier: -4';
    }
  },
  'Defensive Stance': function (effect, index) {
    if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, 'Defensive Stance')) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += 40;
      this.meleeDefenseMod += 40;
      this.meleeAttackMod += -30;
      this.perceptionCheckMod += -4;
      if (this.situationalInitBonus !== 'No Combat') {
        this.actionInitCostMod += -5;
      }
      this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: +40%. Initiative: -5. Preception Modifier: -4';
    }
  },
  'Observing': function (effect, index) {
    if (state.MML.GM.inCombat === false ||
      state.MML.GM.roundStarted === false ||
      this.situationalInitBonus === 'No Combat'
    ) {
      delete this.statusEffects[index];
    } else {
      // Observing this round
      this.perceptionCheckMod += 4;
      this.missileDefenseMod += -10;
      this.meleeDefenseMod += -10;
      this.statusEffects[index].description = 'Defense Modifier: -10%. Preception Modifier: +4';
    }
  },
  'Observed': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.currentRound !== parseInt(effect.startingRound)) {
      delete this.statusEffects[index];
    } else {
      this.situationalInitBonus += 5;
      if (MML.isWieldingRangedWeapon(this) &&
        (!_.has(this.statusEffects, 'Damaged This Round') ||
          !_.has(this.statusEffects, 'Dodged This Round') ||
          !_.has(this.statusEffects, 'Melee This Round'))
      ) {
        this.missileAttackMod += 15;
        this.statusEffects[index].description = 'Missile Attack Modifier: +15%. Initiative: +5';
      } else {
        this.statusEffects[index].description = 'Initiative: +5';
      }
    }
  },
  'Taking Aim': function (effect, index) {
    if (state.MML.GM.inCombat === false ||
      (state.MML.GM.roundStarted === true &&
        _.isObject(state.MML.GM.currentAction) &&
        _.isObject(state.MML.GM.currentAction.character) &&
        state.MML.GM.currentAction.character.name === this.name &&
        state.MML.GM.currentAction.callback !== 'missileAttackAction' &&
        state.MML.GM.currentAction.callback !== 'aimAction' &&
        _.isObject(state.MML.GM.currentAction.parameters) &&
        _.isObject(state.MML.GM.currentAction.parameters.target) &&
        state.MML.GM.currentAction.parameters.target.name !== effect.target.name) ||
      _.has(this.statusEffects, 'Damaged This Round') ||
      _.has(this.statusEffects, 'Dodged This Round') ||
      _.has(this.statusEffects, 'Melee This Round')
    ) {
      delete this.statusEffects[index];
    } else {
      if (effect.level === 1) {
        this.missileAttackMod += 30;
        this.statusEffects[index].description = 'Missile Attack Modifier: +30%.';
      } else if (effect.level === 2) {
        this.missileAttackMod += 40;
        this.statusEffects[index].description = 'Missile Attack Modifier: +40%.';
      }
    }
  },
  'Shoot From Cover': function (effect, index) {
    if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, 'Shoot From Cover')) {
      delete this.statusEffects[index];
    } else {
      this.missileAttackMod += -10;
      this.statusEffects[index].description = 'Missile attacks -10%. Missile attacks against -20%';
    }
  },
  'Damaged This Round': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.statusEffects[index].description = 'Took damage this round';
    }
  },
  'Dodged This Round': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.action.name = 'Movement Only';
      this.action.callback = 'endAction';
      delete this.action.getTargets;
      this.statusEffects[index].description = 'Only movement is allowed the remainder of the round';
    }
  },
  'Melee This Round': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.statusEffects[index].description = 'Adds to rounds of exertion';
    }
  },
  'Stunned': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > effect.duration) {
      delete this.statusEffects[index];
    } else {
      this.action.name = 'Movement Only';
      this.action.callback = 'endAction';
      delete this.action.getTargets;
      this.statusEffects[index].description = 'Only movement is allowed the next ' + effect.duration + ' rounds';
    }
  },
  'Grappled': function (effect, index) {
    if (!state.MML.GM.inCombat) {
      delete this.statusEffects[index];
    } else if (_.has(this.statusEffects, 'Overborne') || _.has(this.statusEffects, 'Taken Down')) {
      this.statusEffects[index].description = 'Effect does not stack with Overborne or Taken Down';
    } else {
      this.situationalMod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%.';
    }
  },
  'Held': function (effect, index) {
    if (!state.MML.GM.inCombat) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += -20;
      this.meleeDefenseMod += -20;
      this.meleeAttackMod += -10;
      this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -20';
    }
  },
  'Holding': function (effect, index) {
    if (!state.MML.GM.inCombat) {
      delete this.statusEffects[index];
    } else {
      this.missileDefenseMod += -20;
      this.meleeDefenseMod += -20;
      this.meleeAttackMod += -15;
      this.statusEffects[index].description = 'Attack Modifier: -15%. Defense Modifier: -20%';
    }
  },
  'Pinned': function (effect, index) {
    if (!state.MML.GM.inCombat) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -10;
      }
      this.situationalMod += -20;

      this.statusEffects[index].description = 'Situational Modifier: -20%. Initiative: -10';
    }
  },
  'Taken Down': function (effect, index) {
    if (!state.MML.GM.inCombat ||
      (!_.has(this.statusEffects, 'Grappled') &&
        !_.has(this.statusEffects, 'Held') &&
        !_.has(this.statusEffects, 'Holding') &&
        !_.has(this.statusEffects, 'Pinned'))
    ) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -15;
      }
      this.situationalMod += -10;

      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -15';
    }
  },
  'Overborne': function (effect, index) {
    if (!state.MML.GM.inCombat ||
      (!_.has(this.statusEffects, 'Grappled') &&
        !_.has(this.statusEffects, 'Held') &&
        !_.has(this.statusEffects, 'Holding') &&
        !_.has(this.statusEffects, 'Pinned'))
    ) {
      delete this.statusEffects[index];
    } else {
      if (this.situationalInitBonus !== 'No Combat') {
        this.situationalInitBonus += -15;
      }
      this.missileDefenseMod += -40;
      this.meleeDefenseMod += -30;
      this.meleeAttackMod += -20;
      this.statusEffects[index].description = 'Attack Modifier: -20%. Defense Modifier: -30%. Dodge Modifier: -40%. Initiative: -15';
    }
  },
  'Hasten Spell': function (effect, index) {
    if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, 'Hasten Spell')) {
      delete this.statusEffects[index];
    } else {
      this.castingMod += -10;
      this.statusEffects[index].description = 'Casting Modifier: -10%';
      if (this.situationalInitBonus !== 'No Combat' && this.action.spell.actions === 1) {
        this.actionInitCostMod += 5;
        this.statusEffects[index].description += '. Initiative: +5';
      } else {
        if (!effect.applied) {
          this.action.spell.actions -= 1;
          effect.applied = true;
        }
        this.statusEffects[index].description += '. Spell Actions Required: -1';
      }
    }
  },
  'Ease Spell': function (effect, index) {
    if (state.MML.GM.inCombat === false || this.action.ts !== effect.ts) {
      delete this.statusEffects[index];
    } else {
      this.castingMod += 10;
      if (!effect.applied) {
        this.action.spell.actions += 1;
        effect.applied = true;
      }
      this.statusEffects[index].description = 'Casting Modifier: +10%. Spell Actions Required: +1';
    }
  },
  'Release Opponent': function (effect, index) {},
  'Ready Item': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.currentRound !== parseInt(effect.startingRound)) {
      delete this.statusEffects[index];
    } else {
      this.actionInitCostMod += -10;
      this.statusEffects[index].description = 'Initiative: -10';
    }
  },
  'Changed Action': function (effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.situationalInitBonus += -10 * effect.level;
      this.statusEffects[index].description = 'Initiative: ' + (-10 * effect.level);
    }
  }
};// Character Functions
MML.getCharFromName = function getCharFromName(name) {
  const character = findObjs({
    _type: 'character',
    archived: false,
    name: name
  }, {
    caseInsensitive: false
  });
  return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, id) {
  return createObj('attribute', {
    name: name,
    current: current,
    max: max,
    characterid: id
  });
};

MML.createAbility = function createAbility(id, name, action, istokenaction) {
  return createObj('ability', {
    name: name,
    action: action,
    istokenaction: istokenaction,
    characterid: character.id
  });
};

MML.getCharAttribute = function getCharAttribute(characterId, attribute) {
  const attributeObject = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (_.isUndefined(attributeObject)) {
    return MML.createAttribute(attribute, '', '', characterId);
  }
  return attributeObject;
};

MML.getCurrentAttribute = function getCurrentAttribute(id, attribute) {
  return MML.getCharAttribute(id, attribute).get('current');
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(id, attribute) {
  const result = parseFloat(MML.getCurrentAttribute(id, attribute));
  if (isNaN(result)) {
    MML.setCurrentAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(id, attribute) {
  const result = parseFloat(MML.getCharAttribute(id, attribute).get('max'));
  if (isNaN(result)) {
    MML.setMaxAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  if (result.toString() === 'true') {
    return true;
  } else {
    return false;
  }
};

MML.getCurrentAttributeAsArray = function getCurrentAttributeAsArray(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    MML.setCurrentAttribute(id, attribute, '[]');
    return [];
  }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    MML.setCurrentAttribute(id, attribute, '{}');
    return [];
  }
};

MML.getSkillAttributes = function getSkillAttributes(id, skillType) {
  const attributes = findObjs({_type: 'attribute', _characterid: id});
  const skills = {};
  const skill_data = {};

  _.each(attributes, function(attribute) {
    const attributeName = attribute.get('name');

    if (!attributeName.includes('repeating_' + skillType)) {
      const attributeString = attributeName.split('_');
      var _id = attributeString[2];
      const property = attributeString[3];
      const value = attribute.get('current');
      _.each(skills, function(skill, key) {
        if (key.toLowerCase() === _id) {
          _id = key;
        }
      });
      if (_.isUndefined(skill_data[_id])) {
        skill_data[_id] = {
          name: '',
          input: 0,
          level: 0
        };
      }
      if (property === 'name') {
        skill_data[_id][property] = value;
      } else if (isNaN(parseFloat(value))) {
        skill_data[_id][property] = 0;
      } else {
        skill_data[_id][property] = parseFloat(value);
      }
    }
  });
  _.each(skill_data, function(skill, _id) {
    if (skill.name !== '') {
      skills[skill.name] = {
        level: skill.level,
        input: skill.input,
        _id: _id
      };
    }
  });
  return skills;
};

MML.setCurrentAttribute = function setCurrentAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('current', value);
};

MML.setMaxAttribute = function setMaxAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('max', value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
MML.getCharacterIdFromToken = function getCharacterIdFromToken(token) {
  const tokenObject = getObj('graphic', token._id);
  const characterObject = getObj('character', tokenObject.get('represents'));

  if (tokenObject.get('name').includes('spellMarker')) {
    // Do nothing
  } else if (_.isUndefined(characterObject)) {
    tokenObject.set('tint_color', '#FFFF00');
    sendChat('Error', 'Selected Token(s) not associated to a character.');
  } else {
    return characterObject.get('id');
  }
};

MML.getCharacterToken = function getCharacterToken(character_id) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    represents: character_id
  });
  return tokens[0];
};

MML.getSpellMarkerToken = function getSpellMarkerToken(name) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    name: name
  });
  return tokens[0];
};

MML.getSelectedIds = function getSelectedIds(selected = []) {
  return selected.map(token => MML.getCharacterIdFromToken(token));
};

MML.displayAura = function displayAura(token, radius, aura_number, color) {
  token.set(aura_number === 2 ? 'aura2_radius' : 'aura1_radius', radius);
  token.set(aura_number === 2 ? 'aura2_color' : 'aura1_color', color);
};

MML.getDistanceBetweenTokens = function getDistanceBetweenTokens(a, b) {
  return MML.getDistance(a.get('left'), b.get('left'), a.get('top'), b.get('top'));
};

// Geometry Functions
MML.feetToPixels = function feetToPixels(feet) {
  return feet * 14;
};

MML.pixelsToFeet = function pixelsToFeet(pixels) {
  return Math.floor((pixels / 14) + 0.5);
};

MML.getDistance = function getDistance(left1, left2, top1, top2) {
  const leftDistance = Math.abs(left2 - left1);
  const topDistance = Math.abs(top2 - top1);
  return Math.sqrt(Math.pow(leftDistance, 2) + Math.pow(topDistance, 2));
};

MML.getDistanceFeet = function getDistanceFeet(left1, left2, top1, top2) {
  return MML.pixelsToFeet(MML.getDistance(left1, left2, top1, top2));
};

MML.drawCirclePath = function drawCirclePath(left, top, radiusInFeet) {
  const radius = MML.feetToPixels(radiusInFeet);
  const pathArray = [
    ['M', left - radius, top],
    ['C', left - radius, top - (radius / 2), left - (radius / 2), top - radius, left, top - radius],
    ['C', left + (radius / 2), top - radius, left + radius, top - (radius / 2), left + radius, top],
    ['C', left + radius, top + (radius / 2), left + (radius / 2), top + radius, left, top + radius],
    ['C', left - (radius / 2), top + radius, left - radius, top + (radius / 2), left - radius, top]
  ];
  const path = createObj('path', {
    _path: JSON.stringify(pathArray),
    _pageid: Campaign().get('playerpageid'),
    layer: 'map',
    stroke: '#FFFF00',
    width: radius * 2,
    height: radius * 2,
    top: top,
    left: left,
  });
  toFront(path);
  return path;
};

MML.rotateAxes = function rotateAxes(left, top, angle) {
  const leftNew = left * Math.cos(angle * Math.PI / 180) + top * Math.sin(angle * Math.PI / 180);
  const topNew = -left * Math.sin(angle * Math.PI / 180) + top * Math.cos(angle * Math.PI / 180);
  return [leftNew, topNew];
};

// Player Functions
MML.getPlayerFromName = function getPlayerFromName(playerName) {
  const player = findObjs({
    _type: 'player',
    online: true,
    _displayname: playerName
  }, {
    caseInsensitive: false
  });
  return player[0];
};

// Code borrowed from The Aaron from roll20.net forums
// This code is disgusting. Who codes like this?
function generateUUID() {
  var a = 0;
  var b = [];
  var c = (new Date()).getTime() + 0;
  var e = new Array(8);
  return function() {
    d = c === a;
    a = c;
    for (e, f = 7; 0 <= f; f--) {
      e[f] = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(c % 64);
      c = Math.floor(c / 64);
    }
    c = e.join('');
    if (d) {
      for (f = 11; 0 <= f && 63 === b[f]; f--) {
        b[f] = 0;
      }
      b[f]++;
    } else {
      for (f = 0; 12 > f; f++) {
        b[f] = Math.floor(64 * Math.random());
      }
    }
    for (f = 0; 12 > f; f++) {
      c += '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(b[f]);
    }
    return c;
  }();
}

MML.generateRowID = function generateRowID() {
  return generateUUID().replace(/_/g, 'Z');
};

MML.clone = function clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;
  var target = obj instanceof Array ? [] : {};
  for (var i in obj) {
    target[i] = this.clone(obj[i]);
  }
  return target;
};
MML.APVList = {
  'None': {
    family: 'None',
    name: 'None',
    surface: 0,
    cut: 0,
    chop: 0,
    pierce: 0,
    thrust: 0,
    impact: 0,
    flanged: 0,
    weightPerPosition: 0
  },
  'Greater Steel Coat of Lames, Leather, Medium': {
    family: 'Coat of Lames',
    name: 'Greater Steel Coat of Lames, Leather, Medium',
    surface: 34,
    cut: 29,
    chop: 19,
    pierce: 30,
    thrust: 19,
    impact: 18,
    flanged: 13,
    weightPerPosition: 2.12
  },
  'Greater Steel Coat of Lames, Cloth, Medium': {
    family: 'Coat of Lames',
    name: 'Greater Steel Coat of Lames, Cloth, Medium',
    surface: 33,
    cut: 28,
    chop: 18,
    pierce: 30,
    thrust: 19,
    impact: 16,
    flanged: 12,
    weightPerPosition: 1.87
  },
  'Hardened Leather Coat of Lames, Leather, Medium': {
    family: 'Coat of Lames',
    name: 'Hardened Leather Coat of Lames, Leather, Medium',
    surface: 15,
    cut: 14,
    chop: 10,
    pierce: 15,
    thrust: 10,
    impact: 10,
    flanged: 6,
    weightPerPosition: 1.14
  },
  'Greater Steel Coat of Plates, Leather, Medium': {
    family: 'Coat of Plates',
    name: 'Greater Steel Coat of Plates, Leather, Medium',
    surface: 27,
    cut: 23,
    chop: 15,
    pierce: 23,
    thrust: 16,
    impact: 10,
    flanged: 9,
    weightPerPosition: 1.81
  },
  'Greater Steel Coat of Plates, Cloth, Medium': {
    family: 'Coat of Plates',
    name: 'Greater Steel Coat of Plates, Cloth, Medium',
    surface: 26,
    cut: 25,
    chop: 14,
    pierce: 23,
    thrust: 16,
    impact: 8,
    flanged: 8,
    weightPerPosition: 1.55
  },
  'Mannish High Steel Coat of Plates, Leather, Medium': {
    family: 'Coat of Plates',
    name: 'Mannish High Steel Coat of Plates, Leather, Medium',
    surface: 31,
    cut: 28,
    chop: 17,
    pierce: 26,
    thrust: 19,
    impact: 11,
    flanged: 10,
    weightPerPosition: 1.81
  },
  'Greater Steel Coat of Scales, Leather, Medium': {
    family: 'Coat of Scales',
    name: 'Greater Steel Coat of Scales, Leather, Medium',
    surface: 34,
    cut: 24,
    chop: 17,
    pierce: 22,
    thrust: 15,
    impact: 15,
    flanged: 10,
    weightPerPosition: 1.91
  },
  'Greater Steel Coat of Scales, Cloth, Medium': {
    family: 'Coat of Scales',
    name: 'Greater Steel Coat of Scales, Cloth, Medium',
    surface: 33,
    cut: 23,
    chop: 16,
    pierce: 21,
    thrust: 14,
    impact: 13,
    flanged: 9,
    weightPerPosition: 1.66
  },
  'Hardened Leather Coat of Scales, Leather, Medium': {
    family: 'Coat of Scales',
    name: 'Hardened Leather Coat of Scales, Leather, Medium',
    surface: 14,
    cut: 14,
    chop: 9,
    pierce: 12,
    thrust: 9,
    impact: 7,
    flanged: 5,
    weightPerPosition: 1.05
  },
  'Mannish High Steel Coat of Scales, Leather, Medium': {
    family: 'Coat of Scales',
    name: 'Mannish High Steel Coat of Scales, Leather, Medium',
    surface: 39,
    cut: 27,
    chop: 19,
    pierce: 25,
    thrust: 17,
    impact: 17,
    flanged: 11,
    weightPerPosition: 1.91
  },
  'Mannish Cloth, Light': {
    family: 'Cloth',
    name: 'Mannish Cloth, Light',
    surface: 2,
    cut: 2,
    chop: 2,
    pierce: 2,
    thrust: 2,
    impact: 1,
    flanged: 1,
    weightPerPosition: 0.04
  },
  'Mannish Cloth, Medium': {
    family: 'Cloth',
    name: 'Mannish Cloth, Medium',
    surface: 4,
    cut: 3,
    chop: 3,
    pierce: 3,
    thrust: 3,
    impact: 1,
    flanged: 2,
    weightPerPosition: 0.08
  },
  'Mannish Cloth, Heavy': {
    family: 'Cloth',
    name: 'Mannish Cloth, Heavy',
    surface: 6,
    cut: 5,
    chop: 4,
    pierce: 5,
    thrust: 5,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.24
  },
  'Mannish Quilt': {
    family: 'Cloth',
    name: 'Mannish Quilt',
    surface: 8,
    cut: 6,
    chop: 6,
    pierce: 7,
    thrust: 5,
    impact: 8,
    flanged: 7,
    weightPerPosition: 0.15
  },
  'Mannish Silk': {
    family: 'Cloth',
    name: 'Mannish Silk',
    surface: 5,
    cut: 4,
    chop: 3,
    pierce: 4,
    thrust: 4,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.06
  },
  'Fur, Light': {
    family: 'Light Leather',
    name: 'Fur, Light',
    surface: 10,
    cut: 6,
    chop: 6,
    pierce: 6,
    thrust: 5,
    impact: 6,
    flanged: 6,
    weightPerPosition: 0.2
  },
  'Fur, Medium': {
    family: 'Light Leather',
    name: 'Fur, Medium',
    surface: 10,
    cut: 6,
    chop: 6,
    pierce: 6,
    thrust: 5,
    impact: 6,
    flanged: 7,
    weightPerPosition: 0.4
  },
  'Fur, Heavy': {
    family: 'Heavy Leather',
    name: 'Fur, Heavy',
    surface: 11,
    cut: 8,
    chop: 8,
    pierce: 7,
    thrust: 7,
    impact: 7,
    flanged: 8,
    weightPerPosition: 0.6
  },
  'Hardened Leather, Medium': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Medium',
    surface: 10,
    cut: 9,
    chop: 6,
    pierce: 9,
    thrust: 8,
    impact: 5,
    flanged: 4,
    weightPerPosition: 0.64
  },
  'Hardened Leather, Heavy': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Heavy',
    surface: 14,
    cut: 12,
    chop: 8,
    pierce: 13,
    thrust: 10,
    impact: 7,
    flanged: 6,
    weightPerPosition: 0.96
  },
  'Hardened Leather Lames, Medium': {
    family: 'Heavy Leather',
    name: 'Hardened Leather Lames, Medium',
    surface: 12,
    cut: 9,
    chop: 6,
    pierce: 10,
    thrust: 6,
    impact: 6,
    flanged: 4,
    weightPerPosition: 0.77
  },
  'Hardened Leather Lames, Heavy': {
    family: 'Heavy Leather',
    name: 'Hardened Leather Lames, Heavy',
    surface: 16,
    cut: 13,
    chop: 8,
    pierce: 13,
    thrust: 8,
    impact: 8,
    flanged: 6,
    weightPerPosition: 1.15
  },
  'Hardened Leather Scales, Medium': {
    family: 'Heavy Leather',
    name: 'Hardened Leather Scales, Medium',
    surface: 12,
    cut: 10,
    chop: 6,
    pierce: 8,
    thrust: 6,
    impact: 5,
    flanged: 4,
    weightPerPosition: 0.68
  },
  'Hardened Leather Scales, Heavy': {
    family: 'Heavy Leather',
    name: 'Hardened Leather Scales, Heavy',
    surface: 16,
    cut: 13,
    chop: 8,
    pierce: 11,
    thrust: 8,
    impact: 7,
    flanged: 6,
    weightPerPosition: 1.30
  },
  'Hide, Light': {
    family: 'Light Leather',
    name: 'Hide, Light',
    surface: 5,
    cut: 2,
    chop: 2,
    pierce: 2,
    thrust: 2,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.14
  },
  'Hide, Heavy': {
    family: 'Heavy Leather',
    name: 'Hide, Heavy',
    surface: 6,
    cut: 3,
    chop: 4,
    pierce: 3,
    thrust: 3,
    impact: 4,
    flanged: 3,
    weightPerPosition: 0.42
  },
  'Leather, Light': {
    family: 'Light Leather',
    name: 'Leather, Light',
    surface: 5,
    cut: 3,
    chop: 4,
    pierce: 3,
    thrust: 3,
    impact: 4,
    flanged: 3,
    weightPerPosition: 0.16
  },
  'Leather, Medium': {
    family: 'Light Leather',
    name: 'Leather, Medium',
    surface: 6,
    cut: 5,
    chop: 5,
    pierce: 4,
    thrust: 4,
    impact: 5,
    flanged: 4,
    weightPerPosition: 0.32
  },
  'Leather, Heavy': {
    family: 'Heavy Leather',
    name: 'Leather, Heavy',
    surface: 9,
    cut: 8,
    chop: 8,
    pierce: 7,
    thrust: 7,
    impact: 7,
    flanged: 7,
    weightPerPosition: 0.48
  },
  'Mannish Padded': {
    family: 'Padded',
    name: 'Mannish Padded',
    surface: 11,
    cut: 8,
    chop: 9,
    pierce: 9,
    thrust: 7,
    impact: 10,
    flanged: 9,
    weightPerPosition: 0.40
  },
  'Laced Mail of Common Steel, Medium': {
    family: 'Heavy Mail',
    name: 'Laced Mail of Common Steel, Medium',
    surface: 20,
    cut: 17,
    chop: 9,
    pierce: 15,
    thrust: 10,
    impact: 5,
    flanged: 6,
    weightPerPosition: 1.30
  },
  'Laced Mail of Greater Steel, Medium': {
    family: 'Heavy Mail',
    name: 'Laced Mail of Greater Steel, Medium',
    surface: 24,
    cut: 20,
    chop: 11,
    pierce: 18,
    thrust: 12,
    impact: 6,
    flanged: 7,
    weightPerPosition: 1.30
  },
  'Laced Mail of Mannish High Steel, Medium': {
    family: 'Heavy Mail',
    name: 'Laced Mail of Mannish High Steel, Medium',
    surface: 28,
    cut: 23,
    chop: 13,
    pierce: 21,
    thrust: 15,
    impact: 7,
    flanged: 8,
    weightPerPosition: 1.30
  },
  'Laced Mail of Wrought Iron, Medium': {
    family: 'Heavy Mail',
    name: 'Laced Mail of Wrought Iron, Medium',
    surface: 12,
    cut: 10,
    chop: 5,
    pierce: 9,
    thrust: 6,
    impact: 3,
    flanged: 3,
    weightPerPosition: 1.29
  },
  'Lames of Common Steel, Medium': {
    family: 'Lames',
    name: 'Lames of Common Steel, Medium',
    surface: 26,
    cut: 20,
    chop: 13,
    pierce: 21,
    thrust: 13,
    impact: 11,
    flanged: 9,
    weightPerPosition: 1.70
  },
  'Lames of Greater Steel, Medium': {
    family: 'Lames',
    name: 'Lames of Greater Steel, Medium',
    surface: 31,
    cut: 24,
    chop: 15,
    pierce: 25,
    thrust: 15,
    impact: 14,
    flanged: 11,
    weightPerPosition: 1.70
  },
  'Lames of Mannish High Steel, Light': {
    family: 'Lames',
    name: 'Lames of Mannish High Steel, Light',
    surface: 32,
    cut: 20,
    chop: 13,
    pierce: 20,
    thrust: 13,
    impact: 12,
    flanged: 9,
    weightPerPosition: 1.28
  },
  'Lames of Mannish High Steel, Medium': {
    family: 'Lames',
    name: 'Lames of Mannish High Steel, Medium',
    surface: 36,
    cut: 26,
    chop: 18,
    pierce: 29,
    thrust: 18,
    impact: 16,
    flanged: 13,
    weightPerPosition: 1.70
  },
  'Lames of Wrought Iron, Medium': {
    family: 'Lames',
    name: 'Lames of Wrought Iron, Medium',
    surface: 15,
    cut: 12,
    chop: 8,
    pierce: 13,
    thrust: 8,
    impact: 7,
    flanged: 6,
    weightPerPosition: 1.68
  },
  'Brazed Mail of Greater Steel': {
    family: 'Light Mail',
    name: 'Brazed Mail of Greater Steel',
    surface: 22,
    cut: 19,
    chop: 12,
    pierce: 20,
    thrust: 14,
    impact: 6,
    flanged: 6,
    weightPerPosition: 1.30
  },
  'Brazed Mail of Mannish High Steel': {
    family: 'Light Mail',
    name: 'Brazed Mail of Mannish High Steel',
    surface: 25,
    cut: 22,
    chop: 13,
    pierce: 24,
    thrust: 17,
    impact: 7,
    flanged: 7,
    weightPerPosition: 1.30
  },
  'Butted Mail of Common Steel': {
    family: 'Light Mail',
    name: 'Butted Mail of Common Steel',
    surface: 16,
    cut: 14,
    chop: 8,
    pierce: 14,
    thrust: 8,
    impact: 4,
    flanged: 4,
    weightPerPosition: 0.95
  },
  'Butted Mail of Greater Steel': {
    family: 'Light Mail',
    name: 'Butted Mail of Greater Steel',
    surface: 19,
    cut: 17,
    chop: 9,
    pierce: 16,
    thrust: 9,
    impact: 5,
    flanged: 5,
    weightPerPosition: 0.95
  },
  'Butted Mail of Wrought Iron': {
    family: 'Light Mail',
    name: 'Butted Mail of Wrought Iron',
    surface: 10,
    cut: 8,
    chop: 5,
    pierce: 8,
    thrust: 5,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.94
  },
  'Double Mail of Common Steel': {
    family: 'Light Mail',
    name: 'Double Mail of Common Steel',
    surface: 18,
    cut: 16,
    chop: 9,
    pierce: 16,
    thrust: 10,
    impact: 5,
    flanged: 4,
    weightPerPosition: 1.30
  },
  'Double Mail of Greater Steel': {
    family: 'Light Mail',
    name: 'Double Mail of Greater Steel',
    surface: 22,
    cut: 19,
    chop: 11,
    pierce: 19,
    thrust: 12,
    impact: 6,
    flanged: 5,
    weightPerPosition: 1.30
  },
  'Double Mail of Mannish High Steel': {
    family: 'Light Mail',
    name: 'Double Mail of Mannish High Steel',
    surface: 25,
    cut: 22,
    chop: 13,
    pierce: 22,
    thrust: 15,
    impact: 7,
    flanged: 6,
    weightPerPosition: 1.30
  },
  'Single Mail of Common Steel': {
    family: 'Light Mail',
    name: 'Single Mail of Common Steel',
    surface: 17,
    cut: 15,
    chop: 8,
    pierce: 15,
    thrust: 10,
    impact: 4,
    flanged: 4,
    weightPerPosition: 1
  },
  'Single Mail of Greater Steel': {
    family: 'Light Mail',
    name: 'Single Mail of Greater Steel',
    surface: 20,
    cut: 18,
    chop: 10,
    pierce: 18,
    thrust: 12,
    impact: 5,
    flanged: 5,
    weightPerPosition: 1
  },
  'Single Mail of Mannish High Steel': {
    family: 'Light Mail',
    name: 'Single Mail of Mannish High Steel',
    surface: 24,
    cut: 21,
    chop: 12,
    pierce: 21,
    thrust: 13,
    impact: 6,
    flanged: 6,
    weightPerPosition: 1
  },
  'Single Mail of Wrought Iron': {
    family: 'Light Mail',
    name: 'Single Mail of Wrought Iron',
    surface: 10,
    cut: 9,
    chop: 5,
    pierce: 9,
    thrust: 6,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.99
  },
  'Plates of Common Steel, Medium': {
    family: 'Plates',
    name: 'Plates of Common Steel, Medium',
    surface: 22,
    cut: 18,
    chop: 12,
    pierce: 20,
    thrust: 16,
    impact: 10,
    flanged: 9,
    weightPerPosition: 1.40
  },
  'Plates of Greater Steel, Medium': {
    family: 'Plates',
    name: 'Plates of Greater Steel, Medium',
    surface: 27,
    cut: 22,
    chop: 14,
    pierce: 24,
    thrust: 19,
    impact: 12,
    flanged: 11,
    weightPerPosition: 1.40
  },
  'Plates of Mannish High Steel, Light': {
    family: 'Plates',
    name: 'Plates of Mannish High Steel, Light',
    surface: 30,
    cut: 24,
    chop: 12,
    pierce: 19,
    thrust: 16,
    impact: 11,
    flanged: 9,
    weightPerPosition: 1.05
  },
  'Plates of Mannish High Steel, Medium': {
    family: 'Plates',
    name: 'Plates of Mannish High Steel, Medium',
    surface: 31,
    cut: 26,
    chop: 17,
    pierce: 28,
    thrust: 22,
    impact: 15,
    flanged: 12,
    weightPerPosition: 1.40
  },
  'Plates of Mannish High Steel, Heavy': {
    family: 'Plates',
    name: 'Plates of Mannish High Steel, Heavy',
    surface: 33,
    cut: 27,
    chop: 22,
    pierce: 38,
    thrust: 30,
    impact: 18,
    flanged: 16,
    weightPerPosition: 1.75
  },
  'Plates of Wrought Iron, Medium': {
    family: 'Plates',
    name: 'Plates of Wrought Iron, Medium',
    surface: 13,
    cut: 11,
    chop: 7,
    pierce: 12,
    thrust: 10,
    impact: 6,
    flanged: 5,
    weightPerPosition: 1.39
  },
  'Plates of Wrought Iron, Heavy': {
    family: 'Plates',
    name: 'Plates of Wrought Iron, Heavy',
    surface: 14,
    cut: 15,
    chop: 9,
    pierce: 16,
    thrust: 13,
    impact: 8,
    flanged: 7,
    weightPerPosition: 1.73
  },
  'Hardened Leather, Medium, Studs': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Medium, Studs',
    surface: 10,
    cut: 11,
    chop: 6,
    pierce: 9,
    thrust: 7,
    impact: 4,
    flanged: 4,
    weightPerPosition: 0.69
  },
  'Hardened Leather, Medium, Rings': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Medium, Rings',
    surface: 13,
    cut: 12,
    chop: 8,
    pierce: 11,
    thrust: 9,
    impact: 4,
    flanged: 5,
    weightPerPosition: 0.75
  },
  'Hardened Leather, Medium, Splints': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Medium, Splints',
    surface: 15,
    cut: 13,
    chop: 9,
    pierce: 12,
    thrust: 9,
    impact: 8,
    flanged: 6,
    weightPerPosition: 0.85
  },
  'Hardened Leather, Medium, Bezaints': {
    family: 'Heavy Leather',
    name: 'Hardened Leather, Medium, Bezaints',
    surface: 20,
    cut: 14,
    chop: 10,
    pierce: 13,
    thrust: 10,
    impact: 7,
    flanged: 6,
    weightPerPosition: 0.94
  },
  'Leather, Medium, Rings': {
    family: 'Light Leather',
    name: 'Leather, Medium, Rings',
    surface: 9,
    cut: 8,
    chop: 7,
    pierce: 6,
    thrust: 6,
    impact: 4,
    flanged: 5,
    weightPerPosition: 0.43
  },
  'Leather, Medium, Studs': {
    family: 'Light Leather',
    name: 'Leather, Medium, Studs',
    surface: 6,
    cut: 7,
    chop: 5,
    pierce: 4,
    thrust: 4,
    impact: 4,
    flanged: 4,
    weightPerPosition: 0.37
  },
  'Leather, Heavy, Bezaints': {
    family: 'Heavy Leather',
    name: 'Leather, Heavy, Bezaints',
    surface: 19,
    cut: 13,
    chop: 12,
    pierce: 11,
    thrust: 10,
    impact: 9,
    flanged: 9,
    weightPerPosition: 0.78
  },
  'Leather, Heavy, Rings': {
    family: 'Heavy Leather',
    name: 'Leather, Heavy, Rings',
    surface: 12,
    cut: 11,
    chop: 10,
    pierce: 9,
    thrust: 9,
    impact: 6,
    flanged: 8,
    weightPerPosition: 0.59
  },
  'Leather, Heavy, Splints': {
    family: 'Heavy Leather',
    name: 'Leather, Heavy, Splints',
    surface: 14,
    cut: 12,
    chop: 11,
    pierce: 10,
    thrust: 9,
    impact: 10,
    flanged: 9,
    weightPerPosition: 0.69
  },
  'Leather, Heavy, Studs': {
    family: 'Heavy Leather',
    name: 'Leather, Heavy, Studs',
    surface: 9,
    cut: 10,
    chop: 8,
    pierce: 7,
    thrust: 7,
    impact: 6,
    flanged: 7,
    weightPerPosition: 0.53
  },
  'Padded, Bezaints': {
    family: 'Padded',
    name: 'Padded, Bezaints',
    surface: 21,
    cut: 13,
    chop: 13,
    pierce: 13,
    thrust: 10,
    impact: 12,
    flanged: 11,
    weightPerPosition: 0.70
  },
  'Dwarven Quilt': {
    family: 'Cloth',
    name: 'Dwarven Quilt',
    surface: 10,
    cut: 11,
    chop: 11,
    pierce: 12,
    thrust: 9,
    impact: 13,
    flanged: 11,
    weightPerPosition: 0.35
  },
  'Dwarven Padded': {
    family: 'Padded',
    name: 'Dwarven Padded',
    surface: 14,
    cut: 14,
    chop: 14,
    pierce: 15,
    thrust: 12,
    impact: 16,
    flanged: 14,
    weightPerPosition: 0.52
  },
  'Fine Mail, Dwarven Low Steel': {
    family: 'Light Mail',
    name: 'Fine Mail, Dwarven Low Steel',
    surface: 28,
    cut: 25,
    chop: 15,
    pierce: 27,
    thrust: 19,
    impact: 7,
    flanged: 7,
    weightPerPosition: 0.95
  },
  'Brazed Mail of Gnomish Steel, Medium': {
    family: 'Light Mail',
    name: 'Brazed Mail of Gnomish Steel, Medium',
    surface: 30,
    cut: 27,
    chop: 16,
    pierce: 29,
    thrust: 20,
    impact: 8,
    flanged: 8,
    weightPerPosition: 1.29
  },
  'Double Mail of Gnomish Steel, Medium': {
    family: 'Light Mail',
    name: 'Double Mail of Gnomish Steel, Medium',
    surface: 30,
    cut: 27,
    chop: 15,
    pierce: 26,
    thrust: 28,
    impact: 8,
    flanged: 7,
    weightPerPosition: 1.29
  },
  'Laced Mail of Gnomish Steel, Medium': {
    family: 'Heavy Mail',
    name: 'Laced Mail of Gnomish Steel, Medium',
    surface: 34,
    cut: 28,
    chop: 15,
    pierce: 26,
    thrust: 18,
    impact: 9,
    flanged: 10,
    weightPerPosition: 1.29
  },
  'Lames of Gnomish Steel, Medium': {
    family: 'Lames',
    name: 'Lames of Gnomish Steel, Medium',
    surface: 44,
    cut: 34,
    chop: 21,
    pierce: 36,
    thrust: 22,
    impact: 19,
    flanged: 16,
    weightPerPosition: 1.68
  },
  'Plates of Gnomish Steel, Medium': {
    family: 'Plates',
    name: 'Plates of Gnomish Steel, Medium',
    surface: 38,
    cut: 31,
    chop: 20,
    pierce: 34,
    thrust: 27,
    impact: 18,
    flanged: 15,
    weightPerPosition: 1.39
  },
  'Single Mail of Gnomish Steel, Medium': {
    family: 'Light Mail',
    name: 'Single Mail of Gnomish Steel, Medium',
    surface: 29,
    cut: 25,
    chop: 14,
    pierce: 26,
    thrust: 16,
    impact: 7,
    flanged: 7,
    weightPerPosition: 0.99
  },
  'Elven Cloth, Light': {
    family: 'Cloth',
    name: 'Elven Cloth, Light',
    surface: 4,
    cut: 3,
    chop: 2,
    pierce: 3,
    thrust: 2,
    impact: 1,
    flanged: 1,
    weightPerPosition: 0.03
  },
  'Elven Cloth, Medium': {
    family: 'Cloth',
    name: 'Elven Cloth, Medium',
    surface: 5,
    cut: 4,
    chop: 3,
    pierce: 4,
    thrust: 3,
    impact: 2,
    flanged: 2,
    weightPerPosition: 0.06
  },
  'Elven Cloth, Heavy': {
    family: 'Cloth',
    name: 'Elven Cloth, Heavy',
    surface: 7,
    cut: 6,
    chop: 5,
    pierce: 6,
    thrust: 6,
    impact: 3,
    flanged: 3,
    weightPerPosition: 0.18
  },
  'Elven Greater Steel Fine Coat of Scales': {
    family: 'Lames',
    name: 'Elven Greater Steel Fine Coat of Scales',
    surface: 35,
    cut: 23,
    chop: 16,
    pierce: 23,
    thrust: 16,
    impact: 13,
    flanged: 8,
    weightPerPosition: 1.53
  },
  'Elven Padded': {
    family: 'Padded',
    name: 'Elven Padded',
    surface: 14,
    cut: 15,
    chop: 13,
    pierce: 15,
    thrust: 10,
    impact: 13,
    flanged: 11,
    weightPerPosition: 0.36
  },
  'Elven Quilt': {
    family: 'Cloth',
    name: 'Elven Quilt',
    surface: 10,
    cut: 12,
    chop: 10,
    pierce: 12,
    thrust: 8,
    impact: 10,
    flanged: 9,
    weightPerPosition: 0.12
  },
  'Elven Silk': {
    family: 'Cloth',
    name: 'Elven Silk',
    surface: 5,
    cut: 7,
    chop: 5,
    pierce: 7,
    thrust: 6,
    impact: 3,
    flanged: 4,
    weightPerPosition: 0.12
  },
  'Fine Mail, Elven Travel Steel': {
    family: 'Light Mail',
    name: 'Fine Mail, Elven Travel Steel',
    surface: 28,
    cut: 25,
    chop: 15,
    pierce: 27,
    thrust: 19,
    impact: 7,
    flanged: 7,
    weightPerPosition: 0.95
  },
  'Fine Mail, Mannish Greater Steel': {
    family: 'Light Mail',
    name: 'Fine Mail, Mannish Greater Steel',
    surface: 24,
    cut: 22,
    chop: 13,
    pierce: 23,
    thrust: 17,
    impact: 6,
    flanged: 6,
    weightPerPosition: 0.95
  },
  'Lames of Elven Bronze': {
    family: 'Lames',
    name: 'Lames of Elven Bronze',
    surface: 28,
    cut: 22,
    chop: 14,
    pierce: 23,
    thrust: 14,
    impact: 13,
    flanged: 10,
    weightPerPosition: 0.95
  }
};MML.items = {
  'Barbute Helm': {
    name: 'Barbute Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 2,
      coverage: 85
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }],
    totalPostitions: 4.85
  },
  'Bascinet Helm': {
    name: 'Bascinet Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 4
  },
  'Camail': {
    name: 'Camail',
    type: 'armor',
    protection: [{
      position: 6,
      coverage: 100
    }, {
      position: 7,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Camail-Conical': {
    name: 'Camail-Conical',
    type: 'armor',
    protection: [{
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 3
  },
  'Cap': {
    name: 'Cap',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 4
  },
  'Cheeks': {
    name: 'Cheeks',
    type: 'armor',
    protection: [{
      position: 2,
      coverage: 40
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 2.4
  },
  'Collar': {
    name: 'Collar',
    type: 'armor',
    protection: [{
      position: 6,
      coverage: 100
    }, {
      position: 7,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Conical Helm': {
    name: 'Conical Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }],
    totalPostitions: 1
  },
  'Duerne Helm': {
    name: 'Duerne Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 4
  },
  'Dwarven War Hood': {
    name: 'Dwarven War Hood',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 2,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }, {
      position: 6,
      coverage: 100
    }, {
      position: 7,
      coverage: 100
    }],
    totalPostitions: 7
  },
  'Face Plate': {
    name: 'Face Plate',
    type: 'armor',
    protection: [{
      position: 2,
      coverage: 100
    }],
    totalPostitions: 1
  },
  'Great Helm': {
    name: 'Great Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 2,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }],
    totalPostitions: 5
  },
  'Half-Face Plate': {
    name: 'Half-Face Plate',
    type: 'armor',
    protection: [{
      position: 2,
      coverage: 40
    }],
    totalPostitions: 0.4
  },
  'Hood': {
    name: 'Hood',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }, {
      position: 6,
      coverage: 100
    }, {
      position: 7,
      coverage: 100
    }],
    totalPostitions: 6
  },
  'Nose Guard': {
    name: 'Nose Guard',
    type: 'armor',
    protection: [{
      position: 2,
      coverage: 25
    }],
    totalPostitions: 0.25
  },
  'Pot Helm': {
    name: 'Pot Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }],
    totalPostitions: 1
  },
  'Sallet Helm': {
    name: 'Sallet Helm',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 2,
      coverage: 70
    }, {
      position: 3,
      coverage: 100
    }, {
      position: 4,
      coverage: 100
    }, {
      position: 5,
      coverage: 100
    }, {
      position: 7,
      coverage: 100
    }],
    totalPostitions: 5.7
  },
  'Throat Guard': {
    name: 'Throat Guard',
    type: 'armor',
    protection: [{
      position: 2,
      coverage: 30
    }, {
      position: 6,
      coverage: 100
    }],
    totalPostitions: 1.3
  },
  'War Hat': {
    name: 'War Hat',
    type: 'armor',
    protection: [{
      position: 1,
      coverage: 100
    }, {
      position: 2,
      coverage: 25
    }, {
      position: 3,
      coverage: 25
    }, {
      position: 4,
      coverage: 25
    }, {
      position: 5,
      coverage: 25
    }],
    totalPostitions: 2
  },
  'Breast Plate': {
    name: 'Breast Plate',
    type: 'armor',
    protection: [{
      position: 9,
      coverage: 100
    }, {
      position: 10,
      coverage: 100
    }, {
      position: 11,
      coverage: 100
    }, {
      position: 12,
      coverage: 100
    }, {
      position: 15,
      coverage: 100
    }, {
      position: 16,
      coverage: 100
    }, {
      position: 17,
      coverage: 100
    }, {
      position: 18,
      coverage: 100
    }, {
      position: 21,
      coverage: 100
    }, {
      position: 22,
      coverage: 100
    }, {
      position: 23,
      coverage: 100
    }, {
      position: 24,
      coverage: 100
    }],
    totalPostitions: 12
  },
  'Byrnie': {
    name: 'Byrnie',
    type: 'armor',
    protection: [{
      position: 8,
      coverage: 100
    }, {
      position: 9,
      coverage: 100
    }, {
      position: 10,
      coverage: 100
    }, {
      position: 11,
      coverage: 100
    }, {
      position: 12,
      coverage: 100
    }, {
      position: 13,
      coverage: 100
    }, {
      position: 14,
      coverage: 100
    }, {
      position: 15,
      coverage: 100
    }, {
      position: 16,
      coverage: 100
    }, {
      position: 17,
      coverage: 100
    }, {
      position: 18,
      coverage: 100
    }, {
      position: 19,
      coverage: 100
    }, {
      position: 21,
      coverage: 100
    }, {
      position: 22,
      coverage: 100
    }, {
      position: 23,
      coverage: 100
    }, {
      position: 24,
      coverage: 100
    }, {
      position: 27,
      coverage: 100
    }, {
      position: 28,
      coverage: 100
    }, {
      position: 29,
      coverage: 100
    }, {
      position: 30,
      coverage: 100
    }, {
      position: 33,
      coverage: 50
    }],
    totalPostitions: 20.5
  },
  'Hauberk': {
    name: 'Hauberk',
    type: 'armor',
    protection: [{
      position: 8,
      coverage: 100
    }, {
      position: 9,
      coverage: 100
    }, {
      position: 10,
      coverage: 100
    }, {
      position: 11,
      coverage: 100
    }, {
      position: 12,
      coverage: 100
    }, {
      position: 13,
      coverage: 100
    }, {
      position: 14,
      coverage: 100
    }, {
      position: 15,
      coverage: 100
    }, {
      position: 16,
      coverage: 100
    }, {
      position: 17,
      coverage: 100
    }, {
      position: 18,
      coverage: 100
    }, {
      position: 19,
      coverage: 100
    }, {
      position: 20,
      coverage: 100
    }, {
      position: 21,
      coverage: 100
    }, {
      position: 22,
      coverage: 100
    }, {
      position: 23,
      coverage: 100
    }, {
      position: 24,
      coverage: 100
    }, {
      position: 25,
      coverage: 100
    }, {
      position: 26,
      coverage: 100
    }, {
      position: 27,
      coverage: 100
    }, {
      position: 28,
      coverage: 100
    }, {
      position: 29,
      coverage: 100
    }, {
      position: 30,
      coverage: 100
    }, {
      position: 31,
      coverage: 100
    }, {
      position: 33,
      coverage: 100
    }, {
      position: 35,
      coverage: 100
    }, {
      position: 36,
      coverage: 100
    }, {
      position: 37,
      coverage: 100
    }, {
      position: 38,
      coverage: 100
    }],
    totalPostitions: 29
  },
  'Shirt': {
    name: 'Shirt',
    type: 'armor',
    protection: [{
      position: 8,
      coverage: 100
    }, {
      position: 9,
      coverage: 100
    }, {
      position: 10,
      coverage: 100
    }, {
      position: 11,
      coverage: 100
    }, {
      position: 12,
      coverage: 100
    }, {
      position: 13,
      coverage: 100
    }, {
      position: 15,
      coverage: 100
    }, {
      position: 16,
      coverage: 100
    }, {
      position: 17,
      coverage: 100
    }, {
      position: 18,
      coverage: 100
    }, {
      position: 21,
      coverage: 100
    }, {
      position: 22,
      coverage: 100
    }, {
      position: 23,
      coverage: 100
    }, {
      position: 24,
      coverage: 100
    }],
    totalPostitions: 14
  },
  'Shirt with Arms': {
    name: 'Shirt with Arms',
    type: 'armor',
    protection: [{
      position: 8,
      coverage: 100
    }, {
      position: 9,
      coverage: 100
    }, {
      position: 10,
      coverage: 100
    }, {
      position: 11,
      coverage: 100
    }, {
      position: 12,
      coverage: 100
    }, {
      position: 13,
      coverage: 100
    }, {
      position: 14,
      coverage: 100
    }, {
      position: 15,
      coverage: 100
    }, {
      position: 16,
      coverage: 100
    }, {
      position: 17,
      coverage: 100
    }, {
      position: 18,
      coverage: 100
    }, {
      position: 19,
      coverage: 100
    }, {
      position: 20,
      coverage: 100
    }, {
      position: 21,
      coverage: 100
    }, {
      position: 22,
      coverage: 100
    }, {
      position: 23,
      coverage: 100
    }, {
      position: 24,
      coverage: 100
    }, {
      position: 25,
      coverage: 100
    }, {
      position: 26,
      coverage: 100
    }, {
      position: 31,
      coverage: 100
    }],
    totalPostitions: 20
  },
  'Breech': {
    name: 'Breech',
    type: 'armor',
    protection: [{
      position: 33,
      coverage: 100
    }],
    totalPostitions: 1
  },
  'Pants': {
    name: 'Pants',
    type: 'armor',
    protection: [{
      position: 27,
      coverage: 100
    }, {
      position: 28,
      coverage: 100
    }, {
      position: 29,
      coverage: 100
    }, {
      position: 30,
      coverage: 100
    }, {
      position: 33,
      coverage: 100
    }, {
      position: 35,
      coverage: 100
    }, {
      position: 36,
      coverage: 100
    }, {
      position: 37,
      coverage: 100
    }, {
      position: 38,
      coverage: 100
    }, {
      position: 39,
      coverage: 100
    }, {
      position: 40,
      coverage: 100
    }, {
      position: 41,
      coverage: 100
    }, {
      position: 42,
      coverage: 100
    }, {
      position: 43,
      coverage: 100
    }, {
      position: 43,
      coverage: 100
    }, {
      position: 44,
      coverage: 100
    }],
    totalPostitions: 15
  },
  'Arms': {
    name: 'Arms',
    type: 'armor',
    protection: [{
      position: 14,
      coverage: 100
    }, {
      position: 19,
      coverage: 100
    }, {
      position: 20,
      coverage: 100
    }, {
      position: 25,
      coverage: 100
    }, {
      position: 26,
      coverage: 100
    }, {
      position: 31,
      coverage: 100
    }],
    totalPostitions: 6
  },
  'Forearms': {
    name: 'Forearms',
    type: 'armor',
    protection: [{
      position: 26,
      coverage: 100
    }, {
      position: 31,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Gauntlets, Finger (or Glove)': {
    name: 'Gauntlets, Finger (or Glove)',
    type: 'armor',
    protection: [{
      position: 32,
      coverage: 100
    }, {
      position: 34,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Gauntlets, Mitten': {
    name: 'Gauntlets, Mitten',
    type: 'armor',
    protection: [{
      position: 32,
      coverage: 100
    }, {
      position: 34,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Half-Arms': {
    name: 'Half-Arms',
    type: 'armor',
    protection: [{
      position: 20,
      coverage: 100
    }, {
      position: 25,
      coverage: 100
    }, {
      position: 26,
      coverage: 100
    }, {
      position: 31,
      coverage: 100
    }],
    totalPostitions: 4
  },
  'Half-Legs': {
    name: 'Half-Legs',
    type: 'armor',
    protection: [{
      position: 35,
      coverage: 50
    }, {
      position: 36,
      coverage: 50
    }, {
      position: 37,
      coverage: 50
    }, {
      position: 38,
      coverage: 50
    }, {
      position: 39,
      coverage: 50
    }, {
      position: 40,
      coverage: 50
    }, {
      position: 41,
      coverage: 50
    }, {
      position: 42,
      coverage: 50
    }, {
      position: 43,
      coverage: 50
    }, {
      position: 43,
      coverage: 50
    }, {
      position: 44,
      coverage: 50
    }],
    totalPostitions: 5
  },
  'Legs': {
    name: 'Legs',
    type: 'armor',
    protection: [{
      position: 35,
      coverage: 100
    }, {
      position: 36,
      coverage: 100
    }, {
      position: 37,
      coverage: 100
    }, {
      position: 38,
      coverage: 100
    }, {
      position: 39,
      coverage: 100
    }, {
      position: 40,
      coverage: 100
    }, {
      position: 41,
      coverage: 100
    }, {
      position: 42,
      coverage: 100
    }, {
      position: 43,
      coverage: 100
    }, {
      position: 43,
      coverage: 100
    }, {
      position: 44,
      coverage: 100
    }],
    totalPostitions: 10
  },
  'Shin Guards': {
    name: 'Shin Guards',
    type: 'armor',
    protection: [{
      position: 39,
      coverage: 50
    }, {
      position: 40,
      coverage: 50
    }, {
      position: 41,
      coverage: 50
    }, {
      position: 42,
      coverage: 50
    }, {
      position: 43,
      coverage: 50
    }, {
      position: 43,
      coverage: 50
    }, {
      position: 44,
      coverage: 50
    }],
    totalPostitions: 3
  },
  'Shoe Guards': {
    name: 'Shoe Guards',
    type: 'armor',
    protection: [{
      position: 45,
      coverage: 100
    }, {
      position: 46,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Elbow Guards': {
    name: 'Elbow Guards',
    type: 'armor',
    protection: [{
      position: 20,
      coverage: 100
    }, {
      position: 25,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Hip Guards': {
    name: 'Hip Guards',
    type: 'armor',
    protection: [{
      position: 27,
      coverage: 100
    }, {
      position: 28,
      coverage: 100
    }, {
      position: 29,
      coverage: 100
    }, {
      position: 30,
      coverage: 100
    }],
    totalPostitions: 4
  },
  'Knee Guards': {
    name: 'Knee Guards',
    type: 'armor',
    protection: [{
      position: 39,
      coverage: 100
    }, {
      position: 40,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Shoulder Guards': {
    name: 'Shoulder Guards',
    type: 'armor',
    protection: [{
      position: 8,
      coverage: 100
    }, {
      position: 13,
      coverage: 100
    }],
    totalPostitions: 2
  },
  'Socks': {
    name: 'Socks',
    type: 'armor',
    protection: [{
      position: 45,
      coverage: 100
    }, {
      position: 46,
      coverage: 100
    }],
    totalPostitions: 2
  }
};MML.attributeMods = {
  strength: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  coordination: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  beauty: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  intellect: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  reason: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  creativity: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  presence: [-10, -10, -10, -10, -10, -10, -10, -5, -3, -3, 0, 0, 3, 3, 3, 5, 5, 5, 8, 8, 8, 10, 10, 15],
  perception: [-10, -10, -10, -10, -10, -10, -10, -10, -5, -5, 0, 0, 3, 3, 5, 5, 8, 8, 10, 10, 15, 15, 15, 20],
};MML.bodyTypes = {
  "Dwarf": "humanoid",
  "Gnome": "humanoid",
  "Gray Elf": "humanoid",
  "Human": "humanoid",
  "Hobbit": "humanoid",
  "Wood Elf": "humanoid"
};MML.fitnessModLookup = [
  1.5,
  1.6,
  1.7,
  1.8,
  1.9,
  2.0,
  2.1,
  2.2,
  2.3,
  2.4,
  2.5,
  2.6,
  2.7,
  2.8,
  2.9,
  3.0,
  3.2,
  3.4,
  3.6,
  3.8,
  4.0,
  4.2,
  4.5,
  5.0,
  5.5,
  6.0
];MML.hitPositions = {
  humanoid: {
    1: {name: "Top of Head", bodyPart: "Head", number: 1},
    2: {name: "Face", bodyPart: "Head", number: 2},
    3: {name: "Rear of Head", bodyPart: "Head", number: 3},
    4: {name: "Right Side of Head", bodyPart: "Head", number: 4},
    5: {name: "Left Side of Head", bodyPart: "Head", number: 5},
    6: {name: "Neck, Throat", bodyPart: "Head", number: 6},
    7: {name: "Rear of Neck", bodyPart: "Head", number: 7},
    8: {name: "Right Shoulder", bodyPart: "Right Arm", number: 8},
    9: {name: "Right Upper Chest", bodyPart: "Chest", number: 9},
    10: {name: "Right Upper Back", bodyPart: "Chest", number: 10},
    11: {name: "Left Upper Chest", bodyPart: "Chest", number: 11},
    12: {name: "Left Upper Back", bodyPart: "Chest", number: 12},
    13: {name: "Left Shoulder", bodyPart: "Left Arm", number: 13},
    14: {name: "Right Upper Arm", bodyPart: "Right Arm", number: 14},
    15: {name: "Right Lower Chest", bodyPart: "Chest", number: 15},
    16: {name: "Right Mid Back", bodyPart: "Chest", number: 16},
    17: {name: "Left Lower Chest", bodyPart: "Chest", number: 17},
    18: {name: "Left Mid Back", bodyPart: "Chest", number: 18},
    19: {name: "Left Upper Arm", bodyPart: "Left Arm", number: 19},
    20: {name: "Right Elbow", bodyPart: "Right Arm", number: 20},
    21: {name: "Right Abdomen", bodyPart: "Abdomen", number: 21},
    22: {name: "Right Lower Back", bodyPart: "Abdomen", number: 22},
    23: {name: "Left Abdomen", bodyPart: "Abdomen", number: 23},
    24: {name: "Left Lower Back", bodyPart: "Abdomen", number: 24},
    25: {name: "Left Elbow", bodyPart: "Left Arm", number: 25},
    26: {name: "Right Forearm", bodyPart: "Right Arm", number: 26},
    27: {name: "Right Hip", bodyPart: "Abdomen", number: 27},
    28: {name: "Right Buttock", bodyPart: "Abdomen", number: 28},
    29: {name: "Left Hip", bodyPart: "Abdomen", number: 29},
    30: {name: "Left Buttock", bodyPart: "Abdomen", number: 30},
    31: {name: "Left Forearm", bodyPart: "Left Arm", number: 31},
    32: {name: "Right Hand/Wrist", bodyPart: "Right Arm", number: 32},
    33: {name: "Groin", bodyPart: "Abdomen", number: 33},
    34: {name: "Left Hand/Wrist", bodyPart: "Left Arm", number: 34},
    35: {name: "Right Upper Thigh", bodyPart: "Right Leg", number: 35},
    36: {name: "Left Upper Thigh", bodyPart: "Left Leg", number: 36},
    37: {name: "Right Lower Thigh", bodyPart: "Right Leg", number: 37},
    38: {name: "Left Lower Thigh", bodyPart: "Left Leg", number: 38},
    39: {name: "Right Knee", bodyPart: "Right Leg", number: 39},
    40: {name: "Left Knee", bodyPart: "Left Leg", number: 40},
    41: {name: "Right Upper Shin", bodyPart: "Right Leg", number: 41},
    42: {name: "Left Upper Shin", bodyPart: "Left Leg", number: 42},
    43: {name: "Right Lower Shin", bodyPart: "Right Leg", number: 43},
    44: {name: "Left Lower Shin", bodyPart: "Left Leg", number: 44},
    45: {name: "Right Foot/Ankle", bodyPart: "Right Leg", number: 45},
    46: {name: "Left Foot/Ankle", bodyPart: "Left Leg", number: 46}
  }
};
MML.hitTables = {
  humanoid: {
    A: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 19, 19, 19, 20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 27, 28, 28, 29, 29, 29, 30, 30, 31, 31, 32, 32, 33, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40, 41, 42, 43, 44, 45, 46],
    B: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 26, 26, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 31, 31, 32, 32, 32, 33, 34, 34, 34, 35, 35, 35, 35, 36, 36, 36, 36, 37, 37, 37, 38, 38, 38, 39, 39, 40, 40, 41, 42, 43, 44, 45, 46],
    C: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 16, 17, 18, 18, 19, 20, 20, 21, 21, 21, 21, 21, 22, 23, 23, 24, 24, 24, 25, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 28, 29, 30, 30, 30, 30, 31, 32, 32, 32, 32, 33, 34, 35, 35, 35, 35, 36, 37, 37, 37, 37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46]
  }
};



MML.skillMods = {};
MML.skillMods["Dwarf"] = {};
MML.skillMods["Dwarf"]["Armorer"] = 10;
MML.skillMods["Dwarf"]["Earth Elementalism"] = 3;
MML.skillMods["Dwarf"]["Air Elementalism"] = 3;
MML.skillMods["Dwarf"]["Fire Elementalism"] = 3;
MML.skillMods["Dwarf"]["Water Elementalism"] = 3;
MML.skillMods["Dwarf"]["Life Elementalism"] = 3;
MML.skillMods["Dwarf"]["Engineering"] = 5;
MML.skillMods["Dwarf"]["Forced March"] = 10;
MML.skillMods["Dwarf"]["Gem Cutting"] = 10;
MML.skillMods["Dwarf"]["Geology"] = 5;
MML.skillMods["Dwarf"]["Jeweler"] = 10;
MML.skillMods["Dwarf"]["Mathematics"] = 5;
MML.skillMods["Dwarf"]["Metallurgy"] = 10;
MML.skillMods["Dwarf"]["Musical Instrument"] = 5;
MML.skillMods["Dwarf"]["Symbol Magic"] = 3;
MML.skillMods["Dwarf"]["Weapon Smith"] = 10;
MML.skillMods["Gnome"] = {};
MML.skillMods["Gnome"]["Animal Husbandry"] = 5;
MML.skillMods["Gnome"]["Armorer"] = 5;
MML.skillMods["Gnome"]["Blacksmith"] = 10;
MML.skillMods["Gnome"]["Diplomacy"] = 5;
MML.skillMods["Gnome"]["Engineering"] = 10;
MML.skillMods["Gnome"]["Gem Cutting"] = 5;
MML.skillMods["Gnome"]["Jeweler"] = 10;
MML.skillMods["Gnome"]["Mathematics"] = 3;
MML.skillMods["Gnome"]["Negotiation"] = 10;
MML.skillMods["Gnome"]["Teamster"] = 5;
MML.skillMods["Gray Elf"] = {};
MML.skillMods["Gray Elf"]["Animal Husbandry"] = 5;
MML.skillMods["Gray Elf"]["Bowyer"] = 5;
MML.skillMods["Gray Elf"]["Earth Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Air Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Fire Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Water Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Life Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Etiquette"] = 5;
MML.skillMods["Gray Elf"]["Herbalism"] = 3;
MML.skillMods["Gray Elf"]["History"] = 10;
MML.skillMods["Gray Elf"]["Literacy"] = 10;
MML.skillMods["Gray Elf"]["Lore"] = 10;
MML.skillMods["Gray Elf"]["Musical Instrument"] = 5;
MML.skillMods["Gray Elf"]["Navigation"] = 10;
MML.skillMods["Gray Elf"]["Physician"] = 3;
MML.skillMods["Gray Elf"]["Seamanship"] = 10;
MML.skillMods["Gray Elf"]["Singing"] = 5;
MML.skillMods["Gray Elf"]["Symbol Magic"] = 5;
MML.skillMods["Gray Elf"]["Sword Smith"] = 3;
MML.skillMods["Gray Elf"]["Wizardry"] = 5;
MML.skillMods["Hobbit"] = {};
MML.skillMods["Hobbit"]["Animal Husbandry"] = 3;
MML.skillMods["Hobbit"]["Botany"] = 10;
MML.skillMods["Hobbit"]["Brewing"] = 5;
MML.skillMods["Hobbit"]["Bureaucracy"] = 3;
MML.skillMods["Hobbit"]["Calligraphy"] = 5;
MML.skillMods["Hobbit"]["Cooking"] = 5;
MML.skillMods["Hobbit"]["Dancing"] = 10;
MML.skillMods["Hobbit"]["Gambling"] = 10;
MML.skillMods["Hobbit"]["Leatherworking"] = 3;
MML.skillMods["Hobbit"]["Literacy"] = 10;
MML.skillMods["Hobbit"]["Negotiation"] = 10;
MML.skillMods["Hobbit"]["Oration"] = 3;
MML.skillMods["Hobbit"]["Singing"] = 5;
MML.skillMods["Hobbit"]["Stealth"] = 10;
MML.skillMods["Hobbit"]["Sewing"] = 10;
MML.skillMods["Human"] = {};
MML.skillMods["Human"]["Animal Husbandry"] = 5;
MML.skillMods["Human"]["Bureaucracy"] = 5;
MML.skillMods["Human"]["Falconry"] = 3;
MML.skillMods["Human"]["Foraging"] = 5;
MML.skillMods["Human"]["Heraldry"] = 3;
MML.skillMods["Human"]["Herbalism"] = 3;
MML.skillMods["Human"]["Horsemanship"] = 10;
MML.skillMods["Human"]["Leatherworking"] = 10;
MML.skillMods["Human"]["Oration"] = 5;
MML.skillMods["Human"]["Persuasion"] = 10;
MML.skillMods["Human"]["Scrounging"] = 5;
MML.skillMods["Human"]["Teamster"] = 5;
MML.skillMods["Wood Elf"] = {};
MML.skillMods["Wood Elf"]["Animal Husbandry"] = 10;
MML.skillMods["Wood Elf"]["Bowyer"] = 10;
MML.skillMods["Wood Elf"]["Air Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Life Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Falconry"] = 5;
MML.skillMods["Wood Elf"]["Fletchery"] = 10;
MML.skillMods["Wood Elf"]["Foraging"] = 5;
MML.skillMods["Wood Elf"]["Hand Signalling"] = 5;
MML.skillMods["Wood Elf"]["Herbalism"] = 5;
MML.skillMods["Wood Elf"]["Hunting and Trapping"] = 10;
MML.skillMods["Wood Elf"]["Navigation"] = 10;
MML.skillMods["Wood Elf"]["Stealth"] = 10;
MML.skillMods["Wood Elf"]["Survival"] = 10;
MML.skillMods["Wood Elf"]["Tracking"] = 3;
MML.skillMods["Female"] = {};
MML.skillMods["Female"]["Life Elementalism"] = 5;
MML.skillMods["Female"]["Symbol Magic"] = 5;

MML.weaponSkillMods = {};
MML.weaponSkillMods["Dwarf"] = {};
MML.weaponSkillMods["Dwarf"]["Light Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Medium Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Heavy Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Battle Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Two-Handed Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Bardiche"] = 5;
MML.weaponSkillMods["Dwarf"]["Pole Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Maul"] = 5;
MML.weaponSkillMods["Dwarf"]["War Hammer"] = 5;
MML.weaponSkillMods["Dwarf"]["Glaive"] = 5;
MML.weaponSkillMods["Dwarf"]["Halberd"] = 5;
MML.weaponSkillMods["Dwarf"]["Brawling"] = 10;
MML.weaponSkillMods["Dwarf"]["Round Target Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Heater Shield"] = 10;
MML.weaponSkillMods["Gnome"] = {};
MML.weaponSkillMods["Gnome"]["Fauchard"] = 5;
MML.weaponSkillMods["Gnome"]["Bill"] = 5;
MML.weaponSkillMods["Gnome"]["Glaive"] = 5;
MML.weaponSkillMods["Gnome"]["Halberd"] = 5;
MML.weaponSkillMods["Gnome"]["Pole Hammer"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Spetum"] = 5;
MML.weaponSkillMods["Gnome"]["Pitch Fork"] = 5;
MML.weaponSkillMods["Gray Elf"] = {};
MML.weaponSkillMods["Gray Elf"]["Short Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Long Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Falchion"] = 10;
MML.weaponSkillMods["Gray Elf"]["Broadsword"] = 10;
MML.weaponSkillMods["Hobbit"] = {};
MML.weaponSkillMods["Hobbit"]["Short Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Heavy Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Short Composite Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Composite Bow"] = 3;
// MML.weaponSkillMods["Hobbit"]["MissileWeaponThrown"] = 3;
// MML.weaponSkillMods["Hobbit"]["Sling"] = 10;
MML.weaponSkillMods["Wood Elf"] = {};
MML.weaponSkillMods["Wood Elf"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Short Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Long Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Short Composite Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Composite Bow"] = 10;
//MML.weaponSkillMods["Wood Elf"]["thrownWeaponSpears"] = 3;

MML.movementRates = {};
MML.movementRates["Dwarf"] = {
  Prone: 0,
  Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 34
};
MML.movementRates["Gnome"] = {
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 32
};
MML.movementRates["Gray Elf"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 36
};
MML.movementRates["Hobbit"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 5,
	Jog: 8,
	Run: 18
};
MML.movementRates["Human"] = {
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 16,
	Run: 28
};
MML.movementRates["Wood Elf"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 34
};


MML.recoveryMods = []; //uses health stat
MML.recoveryMods[0] = { hp: 0.33, ep:  1 };
MML.recoveryMods[1] = { hp: 0.33, ep:  1 };
MML.recoveryMods[2] = { hp: 0.33, ep:  1 };
MML.recoveryMods[3] = { hp: 0.33, ep:  1 };
MML.recoveryMods[4] = { hp: 0.33, ep:  1 };
MML.recoveryMods[5] = { hp: 0.33, ep:  1 };
MML.recoveryMods[6] = { hp: 0.33, ep:  1 };
MML.recoveryMods[7] = { hp: 0.33, ep:  1 };
MML.recoveryMods[8] = { hp: 0.5, ep:  2 };
MML.recoveryMods[9] = { hp: 0.5, ep:  2 };
MML.recoveryMods[10] = { hp: 1, ep:  3 };
MML.recoveryMods[11] = { hp: 1, ep:  3 };
MML.recoveryMods[12] = { hp: 1, ep:  3 };
MML.recoveryMods[13] = { hp: 1.5, ep:  4 };
MML.recoveryMods[14] = { hp: 1.5, ep:  4 };
MML.recoveryMods[15] = { hp: 2, ep:  5 };
MML.recoveryMods[16] = { hp: 2, ep:  5 };
MML.recoveryMods[17] = { hp: 3, ep:  6 };
MML.recoveryMods[18] = { hp: 3, ep:  6 };
MML.recoveryMods[19] = { hp: 4, ep:  8 };
MML.recoveryMods[20] = { hp: 4, ep:  8 };
MML.recoveryMods[21] = { hp: 5, ep:  10 };
MML.recoveryMods[22] = { hp: 5, ep:  10 };
MML.recoveryMods[23] = { hp: 5, ep:  10 };
MML.recoveryMods[24] = { hp: 5, ep:  10 };
MML.recoveryMods[25] = { hp: 5, ep:  10 };

MML.attackTempoTable = [-25, -22, -18, -16, -14, -12, -11, -10, -9, -9];

// Weapon Stats
MML.items["Hand Axe"] = {
  name: "Hand Axe",
  type: "weapon",
  weight: 3,
  grips: {
    "One Hand":{
      family: "Axe",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 35,
      primaryDamage: "1d20",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 6,
      rank: 1}
     }
  };
MML.items["Battle Axe"] = {
  name: "Battle Axe",
  type: "weapon",
  weight: 5,
  grips: {
    "One Hand":{
      family: "Axe",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 35,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Pick"] = {
  name: "Pick",
  type: "weapon",
  weight: 6,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Flanged",
      primaryTask: 25,
      primaryDamage: "1d20",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 1}
     }
  };
MML.items["Two-Handed Axe"] = {
  name: "Two-Handed Axe",
  type: "weapon",
  weight: 6.5,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "4d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Bardiche"] = {
  name: "Bardiche",
  type: "weapon",
  weight: 7.5,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "5d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 3,
      rank: 2}
     }
  };
MML.items["Pole Axe"] = {
  name: "Pole Axe",
  type: "weapon",
  weight: 7,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "4d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 3,
      rank: 2}
     }
  };
MML.items["Club"] = {
  name: "Club",
  type: "weapon",
  weight: 2,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 45,
      primaryDamage: "2d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 7,
      rank: 1}
     }
  };
MML.items["Cudgel, Light"] = {
  name: "Cudgel, Light",
  type: "weapon",
  weight: 3,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 45,
      primaryDamage: "2d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 6,
      rank: 1}
     }
  };
MML.items["Cudgel, Heavy"] = {
  name: "Cudgel, Heavy",
  type: "weapon",
  weight: 7,
  grips: {
    "Two Hands":{
      family: "Bludgeoning",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 35,
      primaryDamage: "4d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Mace"] = {
  name: "Mace",
  type: "weapon",
  weight: 5,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Flanged",
      primaryTask: 45,
      primaryDamage: "2d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Maul"] = {
  name: "Maul",
  type: "weapon",
  weight: 9,
  grips: {
    "Two Hands":{
      family: "Bludgeoning",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 25,
      primaryDamage: "4d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Morningstar"] = {
  name: "Morningstar",
  type: "weapon",
  weight: 5,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 45,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["War Hammer"] = {
  name: "War Hammer",
  type: "weapon",
  weight: 5.5,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 35,
      primaryDamage: "3d10",
      secondaryType: "Flanged",
      secondaryTask: 25,
      secondaryDamage: "2d8",
      defense: 15,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Ball & Chain, Footman's"] = {
  name: "Ball & Chain, Footman's",
  type: "weapon",
  weight: 5,
  grips: {
    "Two Hands":{
      family: "Flexible",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 15,
      primaryDamage: "3d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Ball & Chain, Horseman's"] = {
  name: "Ball & Chain, Horseman's",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Flexible",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 25,
      primaryDamage: "2d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Flail, Footman's"] = {
  name: "Flail, Footman's",
  type: "weapon",
  weight: 5,
  grips: {
    "Two Hands":{
      family: "Flexible",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 25,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Flail, Horseman's"] = {
  name: "Flail, Horseman's",
  type: "weapon",
  weight: 2.5,
  grips: {
    "One Hand":{
      family: "Flexible",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 35,
      primaryDamage: "1d20",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Mace & Chain"] = {
  name: "Mace & Chain",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Flexible",
      hands: 1,
      primaryType: "Flanged",
      primaryTask: 25,
      primaryDamage: "2d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Morningstar & Chain"] = {
  name: "Morningstar & Chain",
  type: "weapon",
  weight: 4,
  grips: {
    "One Hand":{
      family: "Flexible",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 25,
      primaryDamage: "3d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Boot Knife"] = {
  name: "Boot Knife",
  type: "weapon",
  weight: 0.5,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 15,
      primaryDamage: "1d8",
      secondaryType: "Cut",
      secondaryTask: 15,
      secondaryDamage: "1d6",
      defense: 0,
      initiative: 10,
      rank: 1}
     }
  };
MML.items["Dagger"] = {
  name: "Dagger",
  type: "weapon",
  weight: 1,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 15,
      primaryDamage: "2d6",
      secondaryType: "Cut",
      secondaryTask: 15,
      secondaryDamage: "1d8",
      defense: 0,
      initiative: 10,
      rank: 1}
     }
  };
MML.items["Knife"] = {
  name: "Knife",
  type: "weapon",
  weight: 1.5,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 25,
      primaryDamage: "2d6",
      secondaryType: "Thrust",
      secondaryTask: 15,
      secondaryDamage: "2d6",
      defense: 0,
      initiative: 10,
      rank: 1}
     }
  };
MML.items["Dirk"] = {
  name: "Dirk",
  type: "weapon",
  weight: 1.5,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 25,
      primaryDamage: "2d8",
      secondaryType: "Thrust",
      secondaryTask: 15,
      secondaryDamage: "2d6",
      defense: 15,
      initiative: 9,
      rank: 1}
     }
  };
MML.items["Fauchard"] = {
  name: "Fauchard",
  type: "weapon",
  weight: 5,
  grips: {
    "Two Hands":{
      family: "Pole Arms",
      hands: 2,
      primaryType: "Cut",
      primaryTask: 15,
      primaryDamage: "2d12",
      secondaryType: "Thrust",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Bill"] = {
  name: "Bill",
  type: "weapon",
  weight: 5,
  grips: {
    "Two Hands":{
      family: "Pole Arms",
      hands: 2,
      primaryType: "Cut",
      primaryTask: 25,
      primaryDamage: "2d12",
      secondaryType: "Thrust",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Glaive"] = {
  name: "Glaive",
  type: "weapon",
  weight: 6,
  grips: {
    "Two Hands":{
      family: "Pole Arms",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "3d20",
      secondaryType: "Thrust",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Halberd"] = {
  name: "Halberd",
  type: "weapon",
  weight: 6,
  grips: {
    "Two Hands":{
      family: "Pole Arms",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "3d20",
      secondaryType: "Thrust",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Pole Hammer"] = {
  name: "Pole Hammer",
  type: "weapon",
  weight: 6,
  grips: {
    "Two Hands":{
      family: "Pole Hammers",
      hands: 2,
      primaryType: "Flanged",
      primaryTask: 25,
      primaryDamage: "3d10",
      secondaryType: "Thrust",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["War Spear"] = {
  name: "War Spear",
  type: "weapon",
  weight: 2,
  grips: {
    "One Hand":{
      family: "Spears",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 35,
      primaryDamage: "2d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 3,
      rank: 1},
    "Two Hands":{
      family: "Spears",
      hands: 2,
      primaryType: "Thrust",
      primaryTask: 45,
      primaryDamage: "3d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 5,
      rank: 2}
     }
  };
MML.items["Boar Spear"] = {
  name: "Boar Spear",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Spears",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 25,
      primaryDamage: "2d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 2,
      rank: 1},
    "Two Hands":{
      family: "Spears",
      hands: 2,
      primaryType: "Thrust",
      primaryTask: 45,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Military Fork"] = {
  name: "Military Fork",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Spears",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 15,
      primaryDamage: "2d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 2,
      rank: 1},
    "Two Hands":{
      family: "Spears",
      hands: 2,
      primaryType: "Thrust",
      primaryTask: 35,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Spetum"] = {
  name: "Spetum",
  type: "weapon",
  weight: 4,
  grips: {
    "Two Hands":{
      family: "Spears",
      hands: 2,
      primaryType: "Thrust",
      primaryTask: 35,
      primaryDamage: "3d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 2}
     }
  };
MML.items["Quarter Staff"] = {
  name: "Quarter Staff",
  type: "weapon",
  weight: 2,
  grips: {
    "Two Hands":{
      family: "Staves",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 45,
      primaryDamage: "3d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 35,
      initiative: 9,
      rank: 2}
     }
  };
MML.items["Scimitar"] = {
  name: "Scimitar",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 35,
      primaryDamage: "2d12",
      secondaryType: "Thrust",
      secondaryTask: 25,
      secondaryDamage: "2d6",
      defense: 35,
      initiative: 7,
      rank: 1}
     }
  };
MML.items["Short Sword"] = {
  name: "Short Sword",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Thrust",
      primaryTask: 35,
      primaryDamage: "3d8",
      secondaryType: "Cut",
      secondaryTask: 35,
      secondaryDamage: "3d6",
      defense: 35,
      initiative: 1,
      rank: 1}
     }
  };
MML.items["Long Sword"] = {
  name: "Long Sword",
  type: "weapon",
  weight: 3,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 45,
      primaryDamage: "3d10",
      secondaryType: "Thrust",
      secondaryTask: 35,
      secondaryDamage: "2d6",
      defense: 25,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Falchion"] = {
  name: "Falchion",
  type: "weapon",
  weight: 3.5,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 35,
      primaryDamage: "4d8",
      secondaryType: "Thrust",
      secondaryTask: 25,
      secondaryDamage: "3d6",
      defense: 25,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Bastard Sword"] = {
  name: "Bastard Sword",
  type: "weapon",
  weight: 6,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 25,
      primaryDamage: "5d6",
      secondaryType: "Thrust",
      secondaryTask: 15,
      secondaryDamage: "3d6",
      defense: 15,
      initiative: 4,
      rank: 1},
    "Two Hands":{
      family: "Swords",
      hands: 2,
      primaryType: "Cut",
      primaryTask: 35,
      primaryDamage: "4d10",
      secondaryType: "Thrust",
      secondaryTask: 25,
      secondaryDamage: "4d6",
      defense: 25,
      initiative: 5,
      rank: 1}
     }
  };
MML.items["Broadsword"] = {
  name: "Broadsword",
  type: "weapon",
  weight: 5,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "3d12",
      secondaryType: "Thrust",
      secondaryTask: 15,
      secondaryDamage: "1d12",
      defense: 15,
      initiative: 4,
      rank: 1}
     }
  };
MML.items["Two-Handed Broadsword"] = {
  name: "Two-Handed Broadsword",
  type: "weapon",
  weight: 7.5,
  grips: {
    "Two Hands":{
      family: "Swords",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 35,
      primaryDamage: "4d12",
      secondaryType: "Thrust",
      secondaryTask: 25,
      secondaryDamage: "1d20",
      defense: 25,
      initiative: 3,
      rank: 1}
     }
  };
MML.items["Great Sword"] = {
  name: "Great Sword",
  type: "weapon",
  weight: 13,
  grips: {
    "Two Hands":{
      family: "Swords",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 15,
      primaryDamage: "6d10",
      secondaryType: "Thrust",
      secondaryTask: 15,
      secondaryDamage: "3d10",
      defense: 35,
      initiative: 2,
      rank: 2}
     }
  };
MML.items["Whip"] = {
  name: "Whip",
  type: "weapon",
  weight: 1,
  grips: {
    "One Hand":{
      family: "Whip",
      hands: 1,
      primaryType: "Surface",
      primaryTask: 35,
      primaryDamage: "2d4",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 8,
      rank: 3}
     }
  };
MML.items["Cleaver"] = {
  name: "Cleaver",
  type: "weapon",
  weight: 2,
  grips: {
    "One Hand":{
      family: "Axe",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "1d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 8,
      rank: 1}
     }
  };
MML.items["Hatchet"] = {
  name: "Hatchet",
  type: "weapon",
  weight: 2.5,
  grips: {
    "One Hand":{
      family: "Axe",
      hands: 1,
      primaryType: "Chop",
      primaryTask: 25,
      primaryDamage: "1d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 7,
      rank: 1}
     }
  };
MML.items["Hoe"] = {
  name: "Hoe",
  type: "weapon",
  weight: 4,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Flanged",
      primaryTask: 35,
      primaryDamage: "1d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 1}
     }
  };
MML.items["Wood Axe"] = {
  name: "Wood Axe",
  type: "weapon",
  weight: 3,
  grips: {
    "Two Hands":{
      family: "Axe",
      hands: 2,
      primaryType: "Chop",
      primaryTask: 35,
      primaryDamage: "2d12",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 1}
     }
  };
MML.items["Hammer, Medium"] = {
  name: "Hammer, Medium",
  type: "weapon",
  weight: 2.5,
  grips: {
    "One Hand":{
      family: "Bludgeoning",
      hands: 1,
      primaryType: "Impact",
      primaryTask: 25,
      primaryDamage: "1d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 7,
      rank: 1}
     }
  };
MML.items["Shovel"] = {
  name: "Shovel",
  type: "weapon",
  weight: 6,
  grips: {
    "Two Hands":{
      family: "Bludgeoning",
      hands: 2,
      primaryType: "Impact",
      primaryTask: 35,
      primaryDamage: "1d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 4,
      rank: 1}
     }
  };
MML.items["Skinning Knife"] = {
  name: "Skinning Knife",
  type: "weapon",
  weight: 0.5,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 15,
      primaryDamage: "1d8",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 9,
      rank: 1}
     }
  };
MML.items["Butcher's Knife"] = {
  name: "Butcher's Knife",
  type: "weapon",
  weight: 1,
  grips: {
    "One Hand":{
      family: "Knives",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 15,
      primaryDamage: "2d6",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 0,
      initiative: 9,
      rank: 1}
     }
  };
MML.items["Pitch Fork"] = {
  name: "Pitch Fork",
  type: "weapon",
  weight: 3,
  grips: {
    "Two Hands":{
      family: "Spears",
      hands: 2,
      primaryType: "Thrust",
      primaryTask: 35,
      primaryDamage: "2d10",
      secondaryType: "",
      secondaryTask: 0,
      secondaryDamage: "",
      defense: 15,
      initiative: 3,
      rank: 1}
     }
  };
MML.items["Wind Sword"] = {
  name: "Wind Sword",
  type: "weapon",
  weight: 3,
  grips: {
    "One Hand":{
      family: "Swords",
      hands: 1,
      primaryType: "Cut",
      primaryTask: 45,
      primaryDamage: "3d10",
      secondaryType: "Thrust",
      secondaryTask: 45,
      secondaryDamage: "2d4",
      defense: 25,
      initiative: 6,
      rank: 1},
    "Two Hands":{
      family: "Swords",
      hands: 2,
      primaryType: "Cut",
      primaryTask: 45,
      primaryDamage: "4d10",
      secondaryType: "Thrust",
      secondaryTask: 45,
      secondaryDamage: "3d8",
      defense: 35,
      initiative: 8,
      rank: 1}
    }
  };
MML.items["Short Bow"] = {
  name: "Short Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 45,
      initiative: 8,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 74, damage: "3d6"},
        effective: { task: 45, range: 149, damage: "2d8"},
        long: { task: 25, range: 299, damage: "2d6"},
        extreme: { task: 0, range: 300, damage: "1d6"}
      }
    }
  }};
MML.items["Medium Bow"] = {
  name: "Medium Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 60,
      initiative: 7,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 89, damage: "3d8"},
        effective: { task: 45, range: 179, damage: "2d10"},
        long: { task: 25, range: 449, damage: "2d8"},
        extreme: { task: 0, range: 450, damage: "1d8"}
      }
    }
  }};
MML.items["Long Bow"] = {
  name: "Long Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 80,
      initiative: 6,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 149, damage: "3d10"},
        effective: { task: 45, range: 269, damage: "3d8"},
        long: { task: 25, range: 599, damage: "3d6"},
        extreme: { task: 0, range: 600, damage: "1d10"}
      }
    }
  }};
MML.items["Heavy Long Bow"] = {
  name: "Heavy Long Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 100,
      initiative: 4,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 179, damage: "3d12"},
        effective: { task: 45, range: 299, damage: "3d10"},
        long: { task: 25, range: 674, damage: "3d8"},
        extreme: { task: 0, range: 675, damage: "1d10"}
      }
    }
  }};
MML.items["Short Composite Bow"] = {
  name: "Short Composite Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 60,
      initiative: 7,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 89, damage: "3d8"},
        effective: { task: 45, range: 179, damage: "2d10"},
        long: { task: 25, range: 449, damage: "2d8"},
        extreme: { task: 0, range: 450, damage: "1d8"}
      }
    }
  }};
MML.items["Medium Composite Bow"] = {
  name: "Medium Composite Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWD",
      hands: 2,
      pull: 80,
      initiative: 6,
      reload: 1,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 149, damage: "3d10"},
        effective: { task: 45, range: 269, damage: "3d8"},
        long: { task: 25, range: 599, damage: "3d6"},
        extreme: { task: 0, range: 600, damage: "1d10"}
      }
    }
  }};
MML.items["Light Cross Bow"] = {
  name: "Light Cross Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWM",
      hands: 2,
      pull: 80,
      initiative: 10,
      reload: 4,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 179, damage: "3d10"},
        effective: { task: 45, range: 299, damage: "3d8"},
        long: { task: 25, range: 674, damage: "3d6"},
        extreme: { task: 0, range: 675, damage: "1d10"}
      }
    }
  } };
MML.items["Medium Cross Bow"] = {
  name: "Medium Cross Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWM",
      hands: 2,
      pull: 100,
      initiative: 10,
      reload: 6,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 224, damage: "3d12"},
        effective: { task: 45, range: 374, damage: "3d10"},
        long: { task: 25, range: 899, damage: "3d8"},
        extreme: { task: 0, range: 900, damage: "1d10"}
      }
    }
  }};
MML.items["Heavy Cross Bow"] = {
  name: "Heavy Cross Bow",
  type: "weapon",
  weight: 0,
  grips: {
    "Two Hands": {
      family: "MWM",
      hands: 2,
      pull: 120,
      initiative: 8,
      reload: 12,
      primaryType: "Pierce",
      range: {
        pointBlank: { task: 15, range: 269, damage: "4d10"},
        effective: { task: 45, range: 449, damage: "3d12"},
        long: { task: 25, range: 1199, damage: "3d10"},
        extreme: { task: 0, range: 1200, damage: "1d12"}
      }
    }
  }};
MML.items["Battle Axe, Thrown"] = {
  name: "Battle Axe, Thrown",
  type: "weapon",
  weight: 0,
  grips: {
    "One Hand": {
      family: "TWH",
      hands: 1,
      initiative: 3,
      accuracyMod: -8,
      primaryType: "Chop",
      range: {
        pointBlank: { task: 35, loadDivider: 8, damage: "2d12"},
        effective: { task: 45, loadDivider: 4, damage: "2d10"},
        long: { task: 25, loadDivider: 3, damage: "2d6"},
        extreme: { task: 0, loadDivider: 2, damage: "1d6"}
      }
    }
  }};

//Spell Components
MML.items["Dart"] = {name: "Dart", type: "spellComponent", spell: "Dart", weight: 0};
MML.items["Drop of Mercury"] = {name: "Drop of Mercury", type: "spellComponent", spell: "Quick Action", weight: 0};

//Miscellaneous Items

MML.items["No Shield"] = {name: "No Shield", type: "shield", weight: 0, attackMod: 0, defenseMod: 0};
MML.items["Round Target Shield"] = {name: "Round Target Shield", type: "shield", weight: 1.6, attackMod: 0, defenseMod: 10};
MML.items["Small Round Shield"] = {name: "Small Round Shield", type: "shield", weight: 4.3, attackMod: 0, defenseMod: 20};
MML.items["Medium Round Shield"] = {name: "Medium Round Shield", type: "shield", weight: 11.3, attackMod: -10, defenseMod: 35};
MML.items["Large Round Shield"] = {name: "Large Round Shield", type: "shield", weight: 16.4, attackMod: -16, defenseMod: 43};
MML.items["Small Rectangular Shield"] = {name: "Small Rectangular Shield", type: "shield", weight: 4, attackMod: 0, defenseMod: 19};
MML.items["Medium Rectangular Shield"] = {name: "Medium Rectangular Shield", type: "shield", weight: 11.1, attackMod: -10, defenseMod: 35};
MML.items["Large Rectangular Shield"] = {name: "Large Rectangular Shield", type: "shield", weight: 16.6, attackMod: -15, defenseMod: 39};
MML.items["Heater Shield"] = {name: "Heater Shield", type: "shield", weight: 10.6, attackMod: -10, defenseMod: 33};

MML.weaponRanks = [
  {low: 0, high: 2},
  {low: 2, high: 5},
  {low: 5, high: 8},
  {low: 8, high: 12},
  {low: 12, high: 15},
  {low: 15, high: 18},
  {low: 18, high: 21},
  {low: 21, high: 24},
];

MML.HPTables = {};
MML.HPTables["Dwarf"] = [];
MML.HPTables["Dwarf"][9] = "-";
MML.HPTables["Dwarf"][10] = "-";
MML.HPTables["Dwarf"][11] = 7;
MML.HPTables["Dwarf"][12] = 7;
MML.HPTables["Dwarf"][13] = 8;
MML.HPTables["Dwarf"][14] = 8;
MML.HPTables["Dwarf"][15] = 9;
MML.HPTables["Dwarf"][16] = 10;
MML.HPTables["Dwarf"][17] = 10;
MML.HPTables["Dwarf"][18] = 11;
MML.HPTables["Dwarf"][19] = 11;
MML.HPTables["Dwarf"][20] = 12;
MML.HPTables["Dwarf"][21] = 13;
MML.HPTables["Dwarf"][22] = 13;
MML.HPTables["Dwarf"][23] = 14;
MML.HPTables["Dwarf"][24] = 14;
MML.HPTables["Dwarf"][25] = 15;
MML.HPTables["Dwarf"][26] = 15;
MML.HPTables["Dwarf"][27] = 16;
MML.HPTables["Dwarf"][28] = 17;
MML.HPTables["Dwarf"][29] = 17;
MML.HPTables["Dwarf"][30] = 18;
MML.HPTables["Dwarf"][31] = 19;
MML.HPTables["Dwarf"][32] = 19;
MML.HPTables["Dwarf"][33] = 20;
MML.HPTables["Dwarf"][34] = 20;
MML.HPTables["Dwarf"][35] = 21;
MML.HPTables["Dwarf"][36] = 22;
MML.HPTables["Dwarf"][37] = 22;
MML.HPTables["Dwarf"][38] = 23;
MML.HPTables["Dwarf"][39] = 23;
MML.HPTables["Dwarf"][40] = 24;
MML.HPTables["Dwarf"][41] = 25;
MML.HPTables["Dwarf"][42] = 25;
MML.HPTables["Dwarf"][43] = 26;
MML.HPTables["Dwarf"][44] = 26;
MML.HPTables["Dwarf"][45] = 27;
MML.HPTables["Dwarf"][46] = 28;
MML.HPTables["Dwarf"][47] = 28;
MML.HPTables["Dwarf"][48] = 29;
MML.HPTables["Dwarf"][49] = 29;
MML.HPTables["Dwarf"][50] = 30;
MML.HPTables["Dwarf"][51] = 31;
MML.HPTables["Dwarf"][52] = 31;
MML.HPTables["Dwarf"][53] = 32;
MML.HPTables["Dwarf"][54] = 32;
MML.HPTables["Dwarf"][55] = 33;
MML.HPTables["Dwarf"][56] = 34;
MML.HPTables["Dwarf"][57] = 34;
MML.HPTables["Dwarf"][58] = 35;
MML.HPTables["Dwarf"][59] = 35;
MML.HPTables["Dwarf"][60] = 36;
MML.HPTables["Dwarf"][61] = 37;
MML.HPTables["Dwarf"][62] = 37;
MML.HPTables["Dwarf"][63] = 38;
MML.HPTables["Dwarf"][64] = 38;
MML.HPTables["Dwarf"][65] = 39;
MML.HPTables["Dwarf"][66] = 40;
MML.HPTables["Dwarf"][67] = 40;
MML.HPTables["Dwarf"][68] = 41;
MML.HPTables["Dwarf"][69] = 42;
MML.HPTables["Dwarf"][70] = 43;
MML.HPTables["Dwarf"][71] = 43;
MML.HPTables["Dwarf"][72] = 44;
MML.HPTables["Dwarf"][73] = 44;
MML.HPTables["Dwarf"][74] = 45;
MML.HPTables["Dwarf"][75] = 46;
MML.HPTables["Dwarf"][76] = 46;
MML.HPTables["Dwarf"][78] = 47;
MML.HPTables["Dwarf"][79] = 47;
MML.HPTables["Dwarf"][80] = 48;

MML.HPTables["Gnome"] = [];
MML.HPTables["Gnome"][9] = "-";
MML.HPTables["Gnome"][10] = "-";
MML.HPTables["Gnome"][11] = "-";
MML.HPTables["Gnome"][12] = 7;
MML.HPTables["Gnome"][13] = 7;
MML.HPTables["Gnome"][14] = 8;
MML.HPTables["Gnome"][15] = 9;
MML.HPTables["Gnome"][16] = 9;
MML.HPTables["Gnome"][17] = 10;
MML.HPTables["Gnome"][18] = 10;
MML.HPTables["Gnome"][19] = 11;
MML.HPTables["Gnome"][20] = 12;
MML.HPTables["Gnome"][21] = 12;
MML.HPTables["Gnome"][22] = 13;
MML.HPTables["Gnome"][23] = 13;
MML.HPTables["Gnome"][24] = 14;
MML.HPTables["Gnome"][25] = 14;
MML.HPTables["Gnome"][26] = 14;
MML.HPTables["Gnome"][27] = 16;
MML.HPTables["Gnome"][28] = 16;
MML.HPTables["Gnome"][29] = 17;
MML.HPTables["Gnome"][30] = 17;
MML.HPTables["Gnome"][31] = 18;
MML.HPTables["Gnome"][32] = 18;
MML.HPTables["Gnome"][33] = 19;
MML.HPTables["Gnome"][34] = 20;
MML.HPTables["Gnome"][35] = 20;
MML.HPTables["Gnome"][36] = 21;
MML.HPTables["Gnome"][37] = 21;
MML.HPTables["Gnome"][38] = 22;
MML.HPTables["Gnome"][39] = 22;
MML.HPTables["Gnome"][40] = 23;
MML.HPTables["Gnome"][41] = 24;
MML.HPTables["Gnome"][42] = 24;
MML.HPTables["Gnome"][43] = 25;
MML.HPTables["Gnome"][44] = 25;
MML.HPTables["Gnome"][45] = 26;
MML.HPTables["Gnome"][46] = 26;
MML.HPTables["Gnome"][47] = 27;
MML.HPTables["Gnome"][48] = 28;
MML.HPTables["Gnome"][49] = 28;
MML.HPTables["Gnome"][50] = 29;
MML.HPTables["Gnome"][51] = 29;
MML.HPTables["Gnome"][52] = 30;
MML.HPTables["Gnome"][53] = 30;
MML.HPTables["Gnome"][54] = 31;
MML.HPTables["Gnome"][55] = 32;
MML.HPTables["Gnome"][56] = 32;
MML.HPTables["Gnome"][57] = 33;
MML.HPTables["Gnome"][58] = 33;
MML.HPTables["Gnome"][59] = 34;
MML.HPTables["Gnome"][60] = 35;
MML.HPTables["Gnome"][61] = 35;
MML.HPTables["Gnome"][62] = 36;
MML.HPTables["Gnome"][63] = 36;
MML.HPTables["Gnome"][64] = 37;
MML.HPTables["Gnome"][65] = 37;
MML.HPTables["Gnome"][66] = 38;
MML.HPTables["Gnome"][67] = 39;
MML.HPTables["Gnome"][68] = 39;
MML.HPTables["Gnome"][69] = 40;
MML.HPTables["Gnome"][70] = 40;
MML.HPTables["Gnome"][71] = 41;
MML.HPTables["Gnome"][72] = 41;
MML.HPTables["Gnome"][73] = "-";
MML.HPTables["Gnome"][74] = "-";
MML.HPTables["Gnome"][75] = "-";
MML.HPTables["Gnome"][76] = "-";
MML.HPTables["Gnome"][78] = "-";
MML.HPTables["Gnome"][79] = "-";
MML.HPTables["Gnome"][80] = "-";

MML.HPTables["Gray Elf"] = [];
MML.HPTables["Gray Elf"][9] = "-";
MML.HPTables["Gray Elf"][10] = "-";
MML.HPTables["Gray Elf"][11] = "-";
MML.HPTables["Gray Elf"][12] = 7;
MML.HPTables["Gray Elf"][13] = 7;
MML.HPTables["Gray Elf"][14] = 8;
MML.HPTables["Gray Elf"][15] = 8;
MML.HPTables["Gray Elf"][16] = 9;
MML.HPTables["Gray Elf"][17] = 9;
MML.HPTables["Gray Elf"][18] = 10;
MML.HPTables["Gray Elf"][19] = 10;
MML.HPTables["Gray Elf"][20] = 11;
MML.HPTables["Gray Elf"][21] = 12;
MML.HPTables["Gray Elf"][22] = 12;
MML.HPTables["Gray Elf"][23] = 13;
MML.HPTables["Gray Elf"][24] = 13;
MML.HPTables["Gray Elf"][25] = 14;
MML.HPTables["Gray Elf"][26] = 14;
MML.HPTables["Gray Elf"][27] = 15;
MML.HPTables["Gray Elf"][28] = 15;
MML.HPTables["Gray Elf"][29] = 16;
MML.HPTables["Gray Elf"][30] = 17;
MML.HPTables["Gray Elf"][31] = 17;
MML.HPTables["Gray Elf"][32] = 18;
MML.HPTables["Gray Elf"][33] = 18;
MML.HPTables["Gray Elf"][34] = 19;
MML.HPTables["Gray Elf"][35] = 19;
MML.HPTables["Gray Elf"][36] = 20;
MML.HPTables["Gray Elf"][37] = 20;
MML.HPTables["Gray Elf"][38] = 21;
MML.HPTables["Gray Elf"][39] = 21;
MML.HPTables["Gray Elf"][40] = 22;
MML.HPTables["Gray Elf"][41] = 23;
MML.HPTables["Gray Elf"][42] = 23;
MML.HPTables["Gray Elf"][43] = 24;
MML.HPTables["Gray Elf"][44] = 24;
MML.HPTables["Gray Elf"][45] = 25;
MML.HPTables["Gray Elf"][46] = 25;
MML.HPTables["Gray Elf"][47] = 26;
MML.HPTables["Gray Elf"][48] = 26;
MML.HPTables["Gray Elf"][49] = 27;
MML.HPTables["Gray Elf"][50] = 28;
MML.HPTables["Gray Elf"][51] = 28;
MML.HPTables["Gray Elf"][52] = 29;
MML.HPTables["Gray Elf"][53] = 29;
MML.HPTables["Gray Elf"][54] = 30;
MML.HPTables["Gray Elf"][55] = 30;
MML.HPTables["Gray Elf"][56] = 31;
MML.HPTables["Gray Elf"][57] = 31;
MML.HPTables["Gray Elf"][58] = 32;
MML.HPTables["Gray Elf"][59] = 32;
MML.HPTables["Gray Elf"][60] = 33;
MML.HPTables["Gray Elf"][61] = 34;
MML.HPTables["Gray Elf"][62] = 34;
MML.HPTables["Gray Elf"][63] = 35;
MML.HPTables["Gray Elf"][64] = 35;
MML.HPTables["Gray Elf"][65] = 36;
MML.HPTables["Gray Elf"][66] = 36;
MML.HPTables["Gray Elf"][67] = 37;
MML.HPTables["Gray Elf"][68] = 37;
MML.HPTables["Gray Elf"][69] = 38;
MML.HPTables["Gray Elf"][70] = 39;
MML.HPTables["Gray Elf"][71] = 39;
MML.HPTables["Gray Elf"][72] = 40;
MML.HPTables["Gray Elf"][73] = 40;
MML.HPTables["Gray Elf"][74] = "-";
MML.HPTables["Gray Elf"][75] = "-";
MML.HPTables["Gray Elf"][76] = "-";
MML.HPTables["Gray Elf"][78] = "-";
MML.HPTables["Gray Elf"][79] = "-";
MML.HPTables["Gray Elf"][80] = "-";

MML.HPTables["Hobbit"] = [];
MML.HPTables["Hobbit"][9] = 5;
MML.HPTables["Hobbit"][10] = 6;
MML.HPTables["Hobbit"][11] = 6;
MML.HPTables["Hobbit"][12] = 7;
MML.HPTables["Hobbit"][13] = 7;
MML.HPTables["Hobbit"][14] = 8;
MML.HPTables["Hobbit"][15] = 8;
MML.HPTables["Hobbit"][16] = 9;
MML.HPTables["Hobbit"][17] = 9;
MML.HPTables["Hobbit"][18] = 10;
MML.HPTables["Hobbit"][19] = 10;
MML.HPTables["Hobbit"][20] = 11;
MML.HPTables["Hobbit"][21] = 12;
MML.HPTables["Hobbit"][22] = 12;
MML.HPTables["Hobbit"][23] = 13;
MML.HPTables["Hobbit"][24] = 13;
MML.HPTables["Hobbit"][25] = 14;
MML.HPTables["Hobbit"][26] = 14;
MML.HPTables["Hobbit"][27] = 15;
MML.HPTables["Hobbit"][28] = 15;
MML.HPTables["Hobbit"][29] = 16;
MML.HPTables["Hobbit"][30] = 17;
MML.HPTables["Hobbit"][31] = 17;
MML.HPTables["Hobbit"][32] = 18;
MML.HPTables["Hobbit"][33] = 18;
MML.HPTables["Hobbit"][34] = 19;
MML.HPTables["Hobbit"][35] = 19;
MML.HPTables["Hobbit"][36] = 20;
MML.HPTables["Hobbit"][37] = 20;
MML.HPTables["Hobbit"][38] = 21;
MML.HPTables["Hobbit"][39] = 21;
MML.HPTables["Hobbit"][40] = 22;
MML.HPTables["Hobbit"][41] = 23;
MML.HPTables["Hobbit"][42] = 23;
MML.HPTables["Hobbit"][43] = 24;
MML.HPTables["Hobbit"][44] = 24;
MML.HPTables["Hobbit"][45] = 25;
MML.HPTables["Hobbit"][46] = 25;
MML.HPTables["Hobbit"][47] = 26;
MML.HPTables["Hobbit"][48] = 26;
MML.HPTables["Hobbit"][49] = 27;
MML.HPTables["Hobbit"][50] = 28;
MML.HPTables["Hobbit"][51] = 28;
MML.HPTables["Hobbit"][52] = 29;
MML.HPTables["Hobbit"][53] = 29;
MML.HPTables["Hobbit"][54] = 30;
MML.HPTables["Hobbit"][55] = 30;
MML.HPTables["Hobbit"][56] = 31;
MML.HPTables["Hobbit"][57] = 31;
MML.HPTables["Hobbit"][58] = "-";
MML.HPTables["Hobbit"][59] = "-";
MML.HPTables["Hobbit"][60] = "-";
MML.HPTables["Hobbit"][61] = "-";
MML.HPTables["Hobbit"][62] = "-";
MML.HPTables["Hobbit"][63] = "-";
MML.HPTables["Hobbit"][64] = "-";
MML.HPTables["Hobbit"][65] = "-";
MML.HPTables["Hobbit"][66] = "-";
MML.HPTables["Hobbit"][67] = "-";
MML.HPTables["Hobbit"][68] = "-";
MML.HPTables["Hobbit"][69] = "-";
MML.HPTables["Hobbit"][70] = "-";
MML.HPTables["Hobbit"][71] = "-";
MML.HPTables["Hobbit"][72] = "-";
MML.HPTables["Hobbit"][73] = "-";
MML.HPTables["Hobbit"][74] = "-";
MML.HPTables["Hobbit"][75] = "-";
MML.HPTables["Hobbit"][76] = "-";
MML.HPTables["Hobbit"][78] = "-";
MML.HPTables["Hobbit"][79] = "-";
MML.HPTables["Hobbit"][80] = "-";

MML.HPTables["Human"] = [];
MML.HPTables["Human"][9] = "-";
MML.HPTables["Human"][10] = "-";
MML.HPTables["Human"][11] = "-";
MML.HPTables["Human"][12] = 6;
MML.HPTables["Human"][13] = 7;
MML.HPTables["Human"][14] = 7;
MML.HPTables["Human"][15] = 8;
MML.HPTables["Human"][16] = 8;
MML.HPTables["Human"][17] = 9;
MML.HPTables["Human"][18] = 9;
MML.HPTables["Human"][19] = 10;
MML.HPTables["Human"][20] = 10;
MML.HPTables["Human"][21] = 11;
MML.HPTables["Human"][22] = 11;
MML.HPTables["Human"][23] = 12;
MML.HPTables["Human"][24] = 12;
MML.HPTables["Human"][25] = 13;
MML.HPTables["Human"][26] = 13;
MML.HPTables["Human"][27] = 14;
MML.HPTables["Human"][28] = 14;
MML.HPTables["Human"][29] = 15;
MML.HPTables["Human"][30] = 15;
MML.HPTables["Human"][31] = 16;
MML.HPTables["Human"][32] = 16;
MML.HPTables["Human"][33] = 17;
MML.HPTables["Human"][34] = 17;
MML.HPTables["Human"][35] = 18;
MML.HPTables["Human"][36] = 18;
MML.HPTables["Human"][37] = 19;
MML.HPTables["Human"][38] = 19;
MML.HPTables["Human"][39] = 20;
MML.HPTables["Human"][40] = 20;
MML.HPTables["Human"][41] = 21;
MML.HPTables["Human"][42] = 21;
MML.HPTables["Human"][43] = 22;
MML.HPTables["Human"][44] = 22;
MML.HPTables["Human"][45] = 23;
MML.HPTables["Human"][46] = 23;
MML.HPTables["Human"][47] = 24;
MML.HPTables["Human"][48] = 24;
MML.HPTables["Human"][49] = 25;
MML.HPTables["Human"][50] = 25;
MML.HPTables["Human"][51] = 26;
MML.HPTables["Human"][52] = 26;
MML.HPTables["Human"][53] = 27;
MML.HPTables["Human"][54] = 27;
MML.HPTables["Human"][55] = 28;
MML.HPTables["Human"][56] = 28;
MML.HPTables["Human"][57] = 29;
MML.HPTables["Human"][58] = 29;
MML.HPTables["Human"][59] = 30;
MML.HPTables["Human"][60] = 30;
MML.HPTables["Human"][61] = 31;
MML.HPTables["Human"][62] = 31;
MML.HPTables["Human"][63] = 32;
MML.HPTables["Human"][64] = 32;
MML.HPTables["Human"][65] = 33;
MML.HPTables["Human"][66] = 33;
MML.HPTables["Human"][67] = 34;
MML.HPTables["Human"][68] = 34;
MML.HPTables["Human"][69] = 35;
MML.HPTables["Human"][70] = 35;
MML.HPTables["Human"][71] = "-";
MML.HPTables["Human"][72] = "-";
MML.HPTables["Human"][73] = "-";
MML.HPTables["Human"][74] = "-";
MML.HPTables["Human"][75] = "-";
MML.HPTables["Human"][76] = "-";
MML.HPTables["Human"][78] = "-";
MML.HPTables["Human"][79] = "-";
MML.HPTables["Human"][80] = "-";

MML.HPTables["Wood Elf"] = [];
MML.HPTables["Wood Elf"][9] = "-";
MML.HPTables["Wood Elf"][10] = "-";
MML.HPTables["Wood Elf"][11] = "-";
MML.HPTables["Wood Elf"][12] = "-";
MML.HPTables["Wood Elf"][13] = 7;
MML.HPTables["Wood Elf"][14] = 7;
MML.HPTables["Wood Elf"][15] = 8;
MML.HPTables["Wood Elf"][16] = 8;
MML.HPTables["Wood Elf"][17] = 9;
MML.HPTables["Wood Elf"][18] = 9;
MML.HPTables["Wood Elf"][19] = 10;
MML.HPTables["Wood Elf"][20] = 11;
MML.HPTables["Wood Elf"][21] = 11;
MML.HPTables["Wood Elf"][22] = 12;
MML.HPTables["Wood Elf"][23] = 12;
MML.HPTables["Wood Elf"][24] = 13;
MML.HPTables["Wood Elf"][25] = 13;
MML.HPTables["Wood Elf"][26] = 13;
MML.HPTables["Wood Elf"][27] = 14;
MML.HPTables["Wood Elf"][28] = 15;
MML.HPTables["Wood Elf"][29] = 15;
MML.HPTables["Wood Elf"][30] = 16;
MML.HPTables["Wood Elf"][31] = 16;
MML.HPTables["Wood Elf"][32] = 17;
MML.HPTables["Wood Elf"][33] = 17;
MML.HPTables["Wood Elf"][34] = 18;
MML.HPTables["Wood Elf"][35] = 18;
MML.HPTables["Wood Elf"][36] = 19;
MML.HPTables["Wood Elf"][37] = 19;
MML.HPTables["Wood Elf"][38] = 20;
MML.HPTables["Wood Elf"][39] = 20;
MML.HPTables["Wood Elf"][40] = 21;
MML.HPTables["Wood Elf"][41] = 22;
MML.HPTables["Wood Elf"][42] = 22;
MML.HPTables["Wood Elf"][43] = 23;
MML.HPTables["Wood Elf"][44] = 23;
MML.HPTables["Wood Elf"][45] = 24;
MML.HPTables["Wood Elf"][46] = 24;
MML.HPTables["Wood Elf"][47] = 25;
MML.HPTables["Wood Elf"][48] = 25;
MML.HPTables["Wood Elf"][49] = 26;
MML.HPTables["Wood Elf"][50] = 26;
MML.HPTables["Wood Elf"][51] = 27;
MML.HPTables["Wood Elf"][52] = 27;
MML.HPTables["Wood Elf"][53] = 28;
MML.HPTables["Wood Elf"][54] = 28;
MML.HPTables["Wood Elf"][55] = 29;
MML.HPTables["Wood Elf"][56] = 29;
MML.HPTables["Wood Elf"][57] = 30;
MML.HPTables["Wood Elf"][58] = 30;
MML.HPTables["Wood Elf"][59] = 31;
MML.HPTables["Wood Elf"][60] = 32;
MML.HPTables["Wood Elf"][61] = 32;
MML.HPTables["Wood Elf"][62] = 33;
MML.HPTables["Wood Elf"][63] = 33;
MML.HPTables["Wood Elf"][64] = 34;
MML.HPTables["Wood Elf"][65] = 34;
MML.HPTables["Wood Elf"][66] = 35;
MML.HPTables["Wood Elf"][67] = 35;
MML.HPTables["Wood Elf"][68] = 36;
MML.HPTables["Wood Elf"][69] = 36;
MML.HPTables["Wood Elf"][70] = "-";
MML.HPTables["Wood Elf"][71] = "-";
MML.HPTables["Wood Elf"][72] = "-";
MML.HPTables["Wood Elf"][73] = "-";
MML.HPTables["Wood Elf"][74] = "-";
MML.HPTables["Wood Elf"][75] = "-";
MML.HPTables["Wood Elf"][76] = "-";
MML.HPTables["Wood Elf"][78] = "-";
MML.HPTables["Wood Elf"][79] = "-";
MML.HPTables["Wood Elf"][80] = "-";

MML.statureTables = {};
MML.statureTables["Human"] = {};
MML.statureTables["Human"]["Male"] = [];
MML.statureTables["Human"]["Male"][1] = { height: "4'11", weight: 120, stature: 17};
MML.statureTables["Human"]["Male"][2] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Male"][3] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Human"]["Male"][4] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Male"][5] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Human"]["Male"][6] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Male"][7] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Human"]["Male"][8] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Human"]["Male"][9] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Human"]["Male"][10] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Human"]["Male"][11] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Human"]["Male"][12] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Human"]["Male"][13] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Human"]["Male"][14] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Human"]["Male"][15] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Human"]["Male"][16] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Human"]["Male"][17] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Human"]["Male"][18] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Human"]["Male"][19] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Human"]["Male"][20] = { height: "6'6", weight: 220, stature: 30 };

MML.statureTables["Human"]["Female"] = [];
MML.statureTables["Human"]["Female"][1] = { height: "4'8", weight: 113, stature: 17 };
MML.statureTables["Human"]["Female"][2] = { height: "4'9", weight: 115, stature: 18 };
MML.statureTables["Human"]["Female"][3] = { height: "4'10", weight: 118, stature: 18 };
MML.statureTables["Human"]["Female"][4] = { height: "4'11", weight: 120, stature: 18 };
MML.statureTables["Human"]["Female"][5] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Female"][6] = { height: "5'1", weight: 125, stature: 19 };
MML.statureTables["Human"]["Female"][7] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Female"][8] = { height: "5'3", weight: 133, stature: 19 };
MML.statureTables["Human"]["Female"][9] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Female"][10] = { height: "5'5", weight: 138, stature: 21 };
MML.statureTables["Human"]["Female"][11] = { height: "5'6", weight: 140, stature: 21 };
MML.statureTables["Human"]["Female"][12] = { height: "5'7", weight: 143, stature: 21 };
MML.statureTables["Human"]["Female"][13] = { height: "5'8", weight: 145, stature: 22 };
MML.statureTables["Human"]["Female"][14] = { height: "5'9", weight: 148, stature: 22 };
MML.statureTables["Human"]["Female"][15] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Human"]["Female"][16] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Human"]["Female"][17] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Human"]["Female"][18] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Human"]["Female"][19] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Human"]["Female"][20] = { height: "6'3", weight: 175, stature: 25 };

MML.statureTables["Dwarf"] = {};
MML.statureTables["Dwarf"]["Male"] = [];
MML.statureTables["Dwarf"]["Male"][1] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][2] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][3] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][4] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][5] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][6] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][7] = { height: "4'1", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Male"][8] = { height: "4'2", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Male"][9] = { height: "4'3", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Male"][10] = { height: "4'4", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Male"][11] = { height: "4'5", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Male"][12] = { height: "4'6", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Male"][13] = { height: "4'7", weight: 230, stature: 29 };
MML.statureTables["Dwarf"]["Male"][14] = { height: "4'8", weight: 240, stature: 30 };
MML.statureTables["Dwarf"]["Male"][15] = { height: "4'9", weight: 250, stature: 31 };
MML.statureTables["Dwarf"]["Male"][16] = { height: "4'10", weight: 260, stature: 32 };
MML.statureTables["Dwarf"]["Male"][17] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][18] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][19] = { height: "5'0", weight: 280, stature: 34 };
MML.statureTables["Dwarf"]["Male"][20] = { height: "5'0", weight: 280, stature: 34 };

MML.statureTables["Dwarf"]["Female"] = [];
MML.statureTables["Dwarf"]["Female"][1] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][2] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][3] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][4] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][5] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][6] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][7] = { height: "3'11", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Female"][8] = { height: "4'0", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Female"][9] = { height: "4'1", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Female"][10] = { height: "4'2", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Female"][11] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][12] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][13] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][14] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][15] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][16] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][17] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][18] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][19] = { height: "4'7", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Female"][20] = { height: "4'7", weight: 220, stature: 27 };

MML.statureTables["Gnome"] = {};
MML.statureTables["Gnome"]["Male"] = [];
MML.statureTables["Gnome"]["Male"][1] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][2] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][3] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][4] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][5] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][6] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][7] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][8] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][9] = { height: "4'3", weight: 170, stature: 22 };
MML.statureTables["Gnome"]["Male"][10] = { height: "4'4", weight: 180, stature: 23 };
MML.statureTables["Gnome"]["Male"][11] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][12] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][13] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][14] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][15] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][16] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][17] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][18] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][19] = { height: "4'9", weight: 230, stature: 29 };
MML.statureTables["Gnome"]["Male"][20] = { height: "4'9", weight: 230, stature: 29 };

MML.statureTables["Gnome"]["Female"] = [];
MML.statureTables["Gnome"]["Female"][1] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][2] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][3] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][4] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][5] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][6] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][7] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][8] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][9] = { height: "4'1", weight: 140, stature: 21 };
MML.statureTables["Gnome"]["Female"][10] = { height: "4'2", weight: 150, stature: 22 };
MML.statureTables["Gnome"]["Female"][11] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][12] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][13] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][14] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][15] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][16] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][17] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][18] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][19] = { height: "4'7", weight: 200, stature: 27 };
MML.statureTables["Gnome"]["Female"][20] = { height: "4'7", weight: 200, stature: 27 };

MML.statureTables["Gray Elf"] = {};
MML.statureTables["Gray Elf"]["Male"] = [];
MML.statureTables["Gray Elf"]["Male"][1] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Gray Elf"]["Male"][2] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Male"][3] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][4] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][5] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Male"][6] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][7] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][8] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][9] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][10] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][11] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][12] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][13] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][14] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Gray Elf"]["Male"][15] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Gray Elf"]["Male"][16] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Gray Elf"]["Male"][17] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Gray Elf"]["Male"][18] = { height: "6'6", weight: 220, stature: 30 };
MML.statureTables["Gray Elf"]["Male"][19] = { height: "6'7", weight: 230, stature: 31 };
MML.statureTables["Gray Elf"]["Male"][20] = { height: "6'8", weight: 250, stature: 33 };

MML.statureTables["Gray Elf"]["Female"] = [];
MML.statureTables["Gray Elf"]["Female"][1] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][2] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][3] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][4] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][5] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][6] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][7] = { height: "5'4", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][8] = { height: "5'5", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][9] = { height: "5'6", weight: 133, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][10] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][11] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][12] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][13] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][14] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][15] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][16] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Female"][17] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][18] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][19] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Gray Elf"]["Female"][20] = { height: "6'3", weight: 175, stature: 26 };

MML.statureTables["Hobbit"] = {};
MML.statureTables["Hobbit"]["Male"] = [];
MML.statureTables["Hobbit"]["Male"][1] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][2] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][3] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][4] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][5] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][6] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][7] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][8] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][9] = { height: "3'9", weight: 75, stature: 12 };
MML.statureTables["Hobbit"]["Male"][10] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Male"][11] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][12] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][13] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][14] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][15] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][16] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][17] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][18] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][19] = { height: "4'3", weight: 110, stature: 16 };
MML.statureTables["Hobbit"]["Male"][20] = { height: "4'3", weight: 110, stature: 16 };

MML.statureTables["Hobbit"]["Female"] = [];
MML.statureTables["Hobbit"]["Female"][1] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][2] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][3] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][4] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][5] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][6] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][7] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][8] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][9] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Female"][10] = { height: "3'7", weight: 65, stature: 12 };
MML.statureTables["Hobbit"]["Female"][11] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][12] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][13] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][14] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][15] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][16] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][17] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][18] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][19] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Female"][20] = { height: "4'0", weight: 90, stature: 14 };

MML.statureTables["Wood Elf"] = {};
MML.statureTables["Wood Elf"]["Male"] = [];
MML.statureTables["Wood Elf"]["Male"][1] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][2] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][3] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][4] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][5] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][6] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][7] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][8] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][9] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][10] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][11] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][12] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][13] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][14] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][15] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][16] = { height: "6'4", weight: 180, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][17] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][18] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][19] = { height: "6'6", weight: 200, stature: 28 };
MML.statureTables["Wood Elf"]["Male"][20] = { height: "6'6", weight: 200, stature: 28 };

MML.statureTables["Wood Elf"]["Female"] = [];
MML.statureTables["Wood Elf"]["Female"][1] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][2] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][3] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][4] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][5] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][6] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][7] = { height: "5'4", weight: 118, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][8] = { height: "5'5", weight: 120, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][9] = { height: "5'6", weight: 123, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][10] = { height: "5'7", weight: 125, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][11] = { height: "5'8", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][12] = { height: "5'9", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][13] = { height: "5'10", weight: 133, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][14] = { height: "5'11", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][15] = { height: "6'0", weight: 140, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][16] = { height: "6'1", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][17] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][18] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][19] = { height: "6'3", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][20] = { height: "6'3", weight: 155, stature: 23 };

MML.racialAttributeBonuses = {};
MML.racialAttributeBonuses["Human"] = {};
MML.racialAttributeBonuses["Human"].strength = 0;
MML.racialAttributeBonuses["Human"].coordination = 0;
MML.racialAttributeBonuses["Human"].health = 0;
MML.racialAttributeBonuses["Human"].beauty = 0;
MML.racialAttributeBonuses["Human"].intellect = 0;
MML.racialAttributeBonuses["Human"].reason = 0;
MML.racialAttributeBonuses["Human"].creativity = 0;
MML.racialAttributeBonuses["Human"].presence = 0;
MML.racialAttributeBonuses["Human"].willpower = 0;
MML.racialAttributeBonuses["Human"].evocation = 0;
MML.racialAttributeBonuses["Human"].perception = 0;
MML.racialAttributeBonuses["Human"].systemStrength = 0;
MML.racialAttributeBonuses["Human"].fitness = 0;
MML.racialAttributeBonuses["Human"].load = 0;

MML.racialAttributeBonuses["Dwarf"] = {};
MML.racialAttributeBonuses["Dwarf"].strength = 3;
MML.racialAttributeBonuses["Dwarf"].coordination = 0;
MML.racialAttributeBonuses["Dwarf"].health = 3;
MML.racialAttributeBonuses["Dwarf"].beauty = 0;
MML.racialAttributeBonuses["Dwarf"].intellect = 0;
MML.racialAttributeBonuses["Dwarf"].reason = 0;
MML.racialAttributeBonuses["Dwarf"].creativity = 0;
MML.racialAttributeBonuses["Dwarf"].presence = -2;
MML.racialAttributeBonuses["Dwarf"].willpower = 2;
MML.racialAttributeBonuses["Dwarf"].evocation = 0;
MML.racialAttributeBonuses["Dwarf"].perception = 0;
MML.racialAttributeBonuses["Dwarf"].systemStrength = 3;
MML.racialAttributeBonuses["Dwarf"].fitness = 0;
MML.racialAttributeBonuses["Dwarf"].load = 20;

MML.racialAttributeBonuses["Gnome"] = {};
MML.racialAttributeBonuses["Gnome"].strength = 2;
MML.racialAttributeBonuses["Gnome"].coordination = 0;
MML.racialAttributeBonuses["Gnome"].health = 1;
MML.racialAttributeBonuses["Gnome"].beauty = 0;
MML.racialAttributeBonuses["Gnome"].intellect = 0;
MML.racialAttributeBonuses["Gnome"].reason = 0;
MML.racialAttributeBonuses["Gnome"].creativity = 0;
MML.racialAttributeBonuses["Gnome"].presence = 0;
MML.racialAttributeBonuses["Gnome"].willpower = 1;
MML.racialAttributeBonuses["Gnome"].evocation = 0;
MML.racialAttributeBonuses["Gnome"].perception = 0;
MML.racialAttributeBonuses["Gnome"].systemStrength = 1;
MML.racialAttributeBonuses["Gnome"].fitness = 0;
MML.racialAttributeBonuses["Gnome"].load = 15;

MML.racialAttributeBonuses["Hobbit"] = {};
MML.racialAttributeBonuses["Hobbit"].strength = 0;
MML.racialAttributeBonuses["Hobbit"].coordination = 2;
MML.racialAttributeBonuses["Hobbit"].health = 1;
MML.racialAttributeBonuses["Hobbit"].beauty = 0;
MML.racialAttributeBonuses["Hobbit"].intellect = 0;
MML.racialAttributeBonuses["Hobbit"].reason = 0;
MML.racialAttributeBonuses["Hobbit"].creativity = 2;
MML.racialAttributeBonuses["Hobbit"].presence = 0;
MML.racialAttributeBonuses["Hobbit"].willpower = 2;
MML.racialAttributeBonuses["Hobbit"].evocation = 5;
MML.racialAttributeBonuses["Hobbit"].perception = 1;
MML.racialAttributeBonuses["Hobbit"].systemStrength = 2;
MML.racialAttributeBonuses["Hobbit"].fitness = 0;
MML.racialAttributeBonuses["Hobbit"].load = 5;

MML.racialAttributeBonuses["Gray Elf"] = {};
MML.racialAttributeBonuses["Gray Elf"].strength = 0;
MML.racialAttributeBonuses["Gray Elf"].coordination = 1;
MML.racialAttributeBonuses["Gray Elf"].health = 1;
MML.racialAttributeBonuses["Gray Elf"].beauty = 1;
MML.racialAttributeBonuses["Gray Elf"].intellect = 1;
MML.racialAttributeBonuses["Gray Elf"].reason = 0;
MML.racialAttributeBonuses["Gray Elf"].creativity = 1;
MML.racialAttributeBonuses["Gray Elf"].presence = 1;
MML.racialAttributeBonuses["Gray Elf"].willpower = 0;
MML.racialAttributeBonuses["Gray Elf"].evocation = 10;
MML.racialAttributeBonuses["Gray Elf"].perception = 2;
MML.racialAttributeBonuses["Gray Elf"].systemStrength = 2;
MML.racialAttributeBonuses["Gray Elf"].fitness = 0;
MML.racialAttributeBonuses["Gray Elf"].load = 10;

MML.racialAttributeBonuses["Wood Elf"] = {};
MML.racialAttributeBonuses["Wood Elf"].strength = 0;
MML.racialAttributeBonuses["Wood Elf"].coordination = 3;
MML.racialAttributeBonuses["Wood Elf"].health = 1;
MML.racialAttributeBonuses["Wood Elf"].beauty = 0;
MML.racialAttributeBonuses["Wood Elf"].intellect = 0;
MML.racialAttributeBonuses["Wood Elf"].reason = 0;
MML.racialAttributeBonuses["Wood Elf"].creativity = 2;
MML.racialAttributeBonuses["Wood Elf"].presence = 0;
MML.racialAttributeBonuses["Wood Elf"].willpower = 0;
MML.racialAttributeBonuses["Wood Elf"].evocation = 5;
MML.racialAttributeBonuses["Wood Elf"].perception = 2;
MML.racialAttributeBonuses["Wood Elf"].systemStrength = 0;
MML.racialAttributeBonuses["Wood Elf"].fitness = 0;
MML.racialAttributeBonuses["Wood Elf"].load = 5;

MML.raceSizes = {};
MML.raceSizes["Human"] = { size: "Medium", radius: 1 };
MML.raceSizes["Dwarf"] = { size: "Medium", radius: 1 };
MML.raceSizes["Gnome"] = { size: "Medium", radius: 1 };
MML.raceSizes["Hobbit"] = { size: "Medium", radius: 0.75 };
MML.raceSizes["Gray Elf"] = { size: "Medium", radius: 1 };
MML.raceSizes["Wood Elf"] = { size: "Medium", radius: 1 };



MML.meleeDamageMods = [
	{low: 0, high: 19, value: -7},
	{low: 20, high: 24, value: -6},
	{low: 25, high: 29, value: -5},
	{low: 30, high: 34, value: -4},
	{low: 35, high: 39, value: -3},
	{low: 40, high: 44, value: -2},
	{low: 45, high: 54, value: -1},
	{low: 55, high: 64, value: 0},
	{low: 65, high: 74, value: 1},
	{low: 75, high: 90, value: 2},
	{low: 91, high: 105, value: 3},
	{low: 106, high: 120, value: 4},
	{low: 121, high: 999, value: 5},
];

MML.unarmedAttacks = {};
MML.unarmedAttacks["Grapple"] = {name: "Grapple", family: "Unarmed", initiative: 10, task: 35, defenseMod: 35, damage: "None", damageType: "None"};
MML.unarmedAttacks["Takedown"] = {name: "Takedown", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Place a Hold, Head, Arm, Leg"] = {name: "Place a Hold, Head, Arm, Leg", family: "Unarmed", initiative: 10,  task: 0, defenseMod: 15, damage: "None", damageType: "None"};
MML.unarmedAttacks["Place a Hold, Chest, Abdomen"] = {name: "Place a Hold, Chest, Abdomen", family: "Unarmed", initiative: 10,  task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Break a Hold"] = {name: "Break a Hold", family: "Unarmed", initiative: 10, task: 0, defenseMod: 0, damage: "None", damageType: "None"};
MML.unarmedAttacks["Break Grapple"] = {name: "Break Grapple", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Regain Feet"] = {name: "Regain Feet", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Punch"] = {name: "Punch", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d4", damageType: "Impact"};
MML.unarmedAttacks["Punch, Padded"] = {name: "Punch, Padded", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d2", damageType: "Impact"};
MML.unarmedAttacks["Punch, Mail, Studs"] = {name: "Punch, Mail, Studs", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Punch, Plate"] = {name: "Punch, Plate", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Kick"] = {name: "Kick", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d4", damageType: "Impact"};
MML.unarmedAttacks["Kick, Heavy Boots"] = {name: "Kick, Heavy Boots", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Kick, Plate"] = {name: "Kick, Plate", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d8", damageType: "Impact"};
MML.unarmedAttacks["Head Butt"] = {name: "Head Butt", family: "Unarmed", initiative: 10, task: 25, defenseMod: 0, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Bite"] = {name: "Bite", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d3", damageType: "Thrust"};

MML.epModifiers = {};
MML.epModifiers["Wizardry"] = {};
MML.epModifiers["Wizardry"][3] = [3,2,1,1,1,1,1,1,1,1,1,1,1];
MML.epModifiers["Wizardry"][5] = [4,4,3,3,2,2,2,1,1,1,1,1,1];
MML.epModifiers["Wizardry"][10] = [9,7,6,5,5,4,3,3,3,2,2,2,1];
MML.epModifiers["Wizardry"][12] = [11,9,7,6,5,5,4,4,3,3,2,2,2];
MML.epModifiers["Wizardry"][14] = [12,10,9,7,6,5,5,4,4,3,2,2,2];
MML.epModifiers["Wizardry"][15] = [13,11,9,8,7,6,5,4,4,3,3,2,2];
MML.epModifiers["Wizardry"][16] = [14,12,10,8,7,6,5,5,4,3,3,3,2];
MML.epModifiers["Wizardry"][18] = [16,13,11,9,8,7,6,5,5,4,3,3,2];
MML.epModifiers["Wizardry"][20] = [18,14,12,10,9,8,7,6,5,4,4,3,3];
MML.epModifiers["Wizardry"][22] = [19,16,13,11,10,9,7,6,6,5,4,4,3];
MML.epModifiers["Wizardry"][24] = [21,17,15,12,11,9,8,7,6,5,4,4,4];
MML.epModifiers["Wizardry"][25] = [22,18,15,13,11,10,9,7,6,5,4,4,4];
MML.epModifiers["Wizardry"][28] = [25,20,17,15,13,11,10,8,7,6,5,5,4];
MML.epModifiers["Wizardry"][30] = [26,22,18,16,14,12,10,9,8,6,5,5,5];
MML.epModifiers["Wizardry"][33] = [29,24,20,17,15,13,11,10,8,7,6,6,5];
MML.epModifiers["Wizardry"][35] = [31,25,21,18,16,14,12,10,9,7,6,6,5];
MML.epModifiers["Wizardry"][40] = [35,29,24,21,18,16,14,12,10,8,7,6,6];
MML.epModifiers["Elementalism"] = {};
MML.epModifiers["Elementalism"][3] = [3,3,2,2,2,2,2,2,1,1,1,0,0];
MML.epModifiers["Elementalism"][5] = [5,4,4,4,3,3,3,3,2,2,2,1,1];
MML.epModifiers["Elementalism"][10] = [10,9,8,8,7,6,6,5,5,4,4,2,1];
MML.epModifiers["Elementalism"][12] = [11,11,10,9,8,8,7,6,6,5,4,2,1];
MML.epModifiers["Elementalism"][14] = [13,12,11,11,10,9,8,7,7,6,5,3,1];
MML.epModifiers["Elementalism"][15] = [14,13,12,11,10,9,9,8,7,6,6,4,2];
MML.epModifiers["Elementalism"][16] = [15,14,13,12,11,10,9,8,7,7,6,4,3];
MML.epModifiers["Elementalism"][18] = [17,16,15,14,12,11,10,9,8,8,7,5,3];
MML.epModifiers["Elementalism"][20] = [19,18,16,15,14,13,11,10,9,8,7,5,4];
MML.epModifiers["Elementalism"][22] = [21,19,18,17,15,14,13,11,10,9,8,6,4];
MML.epModifiers["Elementalism"][24] = [23,21,20,18,17,15,14,12,11,10,9,7,5];
MML.epModifiers["Elementalism"][25] = [24,23,24,20,18,17,15,14,12,10,9,7,5];
MML.epModifiers["Elementalism"][28] = [27,25,23,21,19,18,16,15,13,12,10,8,6];
MML.epModifiers["Elementalism"][30] = [29,27,24,23,21,19,17,16,14,13,11,9,7];
MML.epModifiers["Elementalism"][33] = [32,29,27,25,23,21,19,17,15,14,12,10,8];
MML.epModifiers["Elementalism"][35] = [33,31,29,26,24,22,20,18,16,15,13,11,9];
MML.epModifiers["Elementalism"][40] = [38,35,33,30,28,25,23,22,19,17,15,12,10];
MML.epModifiers["Symbolism"] = {};
MML.epModifiers["Symbolism"][5] = [5,5,4,4,4,4,3,3,3,3,2,2,2];
MML.epModifiers["Symbolism"][10] = [10,9,9,8,8,7,7,6,6,5,5,4,4];
MML.epModifiers["Symbolism"][12] = [12,11,10,10,9,9,8,7,7,6,5,5,4];
MML.epModifiers["Symbolism"][15] = [15,14,13,12,12,11,10,9,9,8,7,6,5];
MML.epModifiers["Symbolism"][18] = [17,17,16,15,14,13,12,11,10,9,8,7,6];
MML.epModifiers["Symbolism"][20] = [19,18,17,16,15,14,13,12,11,10,9,7,6];
MML.epModifiers["Symbolism"][23] = [22,21,20,19,18,17,15,14,13,12,11,10,8];
MML.epModifiers["Symbolism"][25] = [24,23,22,21,19,18,17,16,14,13,12,11,9];
MML.epModifiers["Symbolism"][28] = [27,26,24,23,22,20,19,17,16,15,13,12,11];
MML.epModifiers["Symbolism"][30] = [29,28,26,25,23,22,20,19,17,16,14,13,11];
MML.epModifiers["Target Size"] = {};
MML.epModifiers["Target Size"]["Very Small"] = 0.25;
MML.epModifiers["Target Size"]["Small"] = 0.5;
MML.epModifiers["Target Size"]["Medium"] = 1;
MML.epModifiers["Target Size"]["Large"] = 2;
MML.epModifiers["Target Size"]["Very Large"] = 3;
MML.epModifiers["Target Size"]["Huge"] = 5;
MML.epModifiers["Target Size"]["Massive"] = 8;

MML.metaMagic = {};
MML.sensitiveAreas = {
  'humanoid': ["Face", "Neck, Throat", "Groin"]
};MML.skills = {
  'Acrobatics': { attribute: 'coordination' },
  'Acting': { attribute: 'presence' },
  'Alchemy': { attribute: 'intellect' },
  'Animal Handling': { attribute: 'presence' },
  'Animal Husbandry': { attribute: 'reason' },
  'Armorer': { attribute: 'reason' },
  'Blacksmith': { attribute: 'coordination' },
  'Botany': { attribute: 'intellect' },
  'Bowyer': { attribute: 'coordination' },
  'Brawling': { attribute: 'combat' },
  'Brewing': { attribute: 'reason' },
  'Bureaucracy': { attribute: 'creativity' },
  'Caligraphy': { attribute: 'creativity' },
  'Camouflage': { attribute: 'reason' },
  'Carpentry': { attribute: 'coordination' },
  'Cartography': { attribute: 'reason' },
  'Climbing': { attribute: 'coordination' },
  'Cooking': { attribute: 'reason' },
  'Dancing': { attribute: 'creativity' },
  'Diplomacy': { attribute: 'presence' },
  'Disguise': { attribute: 'creativity' },
  'Dowsing': { attribute: 'reason' },
  'Ecology, Specific': { attribute: 'intellect' },
  'Earth Elementalism': { attribute: 'intellect' },
  'Air Elementalism': { attribute: 'intellect' },
  'Fire Elementalism': { attribute: 'intellect' },
  'Water Elementalism': { attribute: 'intellect' },
  'Life Elementalism': { attribute: 'intellect' },
  'Engineering': { attribute: 'intellect' },
  'Etiquette': { attribute: 'presence' },
  'Falconry': { attribute: 'reason' },
  'First Aid': { attribute: 'reason' },
  'Fishing': { attribute: 'reason' },
  'Fletchery': { attribute: 'coordination' },
  'Foraging': { attribute: 'reason' },
  'Forced March': { attribute: 'Health' },
  'Forgery': { attribute: 'creativity' },
  'Gambling': { attribute: 'reason' },
  'Gem Cutting': { attribute: 'reason' },
  'Geology': { attribute: 'intellect' },
  'Hand Signalling': { attribute: 'coordination' },
  'Heraldry': { attribute: 'reason' },
  'Herbalism': { attribute: 'reason' },
  'History': { attribute: 'intellect' },
  'Horsemanship': { attribute: 'coordination' },
  'Hunting and Trapping': { attribute: 'reason' },
  'Jeweler': { attribute: 'creativity' },
  'Knowledge': { attribute: 'intellect' },
  'Language': { attribute: 'creativity' },
  'Leatherworking': { attribute: 'coordination' },
  'Literacy': { attribute: 'intellect' },
  'Literature': { attribute: 'intellect' },
  'Lock Picking': { attribute: 'coordination' },
  'Lore': { attribute: 'reason' },
  'Mathematics': { attribute: 'intellect' },
  'Metallurgy': { attribute: 'intellect' },
  'Mimicry': { attribute: 'presence' },
  'Musical Instrument': { attribute: 'creativity' },
  'Navigation': { attribute: 'reason' },
  'Negotiation': { attribute: 'presence' },
  'Oration': { attribute: 'presence' },
  'Persuasion': { attribute: 'presence' },
  'Physician': { attribute: 'reason' },
  'Pick Pocket': { attribute: 'coordination' },
  'Running': { attribute: 'health' },
  'Scrounging': { attribute: 'reason' },
  'Sculpture': { attribute: 'creativity' },
  'Seamanship': { attribute: 'reason' },
  'Sewing': { attribute: 'coordination' },
  'Singing': { attribute: 'presence' },
  'Sleight of Hand': { attribute: 'coordination' },
  'Stalking': { attribute: 'coordination' },
  'Stealth': { attribute: 'coordination' },
  'Survival': { attribute: 'reason' },
  'Swimming': { attribute: 'coordination' },
  'Symbol Magic': { attribute: 'intellect' },
  'Tactical': { attribute: 'reason' },
  'Teamster': { attribute: 'reason' },
  'Tracking': { attribute: 'reason' },
  'Veterinary': { attribute: 'reason' },
  'Weapon Smith': { attribute: 'coordination' },
  'Sword Smith': { attribute: 'coordination' },
  'Wizardry': { attribute: 'intellect' },
};
