SoS.rollDice = async function rollDice(amount, target) {
  switch (state.SoS.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Array.from({length: amount}, () => randomInteger(size)).reduce((sum, value) => sum + value, 0);
  }
};

SoS.parseDice = function parseDice(dice) {
  const diceArray = dice.split('d').map(num => parseInt(num));
  return {
    amount: diceArray[0],
    size: diceArray[1]
  };
};

SoS.sumModifiers = function sumModifiers(modifiers) {
  return modifiers ? modifiers.reduce((sum, value) => sum + value, 0) : 0;
};

SoS.processRoll = async function processRoll(player, value, getResult, getMessage, changeValue) {
  const result = getResult(value);
  const message = getMessage(value, result);
  if (player.name === state.SoS.GM.name) {
    SoS.displayGmRoll(player, message);
    const pressedButton = await SoS.setRollButtons(player);
    if (pressedButton !== 'acceptRoll') {
      const newValue = await changeValue(player, pressedButton);
      return await processRoll(player, newValue, getResult, getMessage, changeValue);
    }
  } else {
    SoS.displayPlayerRoll(player, message);
  }
  return result;
};

SoS.changeRoll = function changeRoll(low, high) {
  return async function getNewValue(player, pressedButton) {
    const newValue = parseInt(pressedButton);
    if (isNaN(newValue)) {
      sendChat('Error', 'Roll value must be numerical.');
      const pressedButton = await SoS.setRollButtons(player);
      return getNewValue(player, pressedButton);
    } else if (newValue < low || newValue > high) {
      sendChat('Error', 'New roll value out of range.');
      const pressedButton = await SoS.setRollButtons(player);
      return getNewValue(player, pressedButton);
    } else {
      return newValue;
    }
  }
};

SoS.universalRoll = async function universalRoll(player, modifiers) {
  const value = await SoS.rollDice(1, 100);
  const target = SoS.sumModifiers(modifiers);
  return SoS.processRoll(player,
    value,
    SoS.universalRollResult(target),
    SoS.rollMessage(target, modifiers, '1-100'),
    SoS.changeRoll(1, 100));
};

SoS.universalRollResult = function universalRollResult(target) {
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

SoS.rollMessage = function rollMessage(target, modifiers, range) {
  return function (value, result) {
    return [
      'Roll: ' + value +
      'Target: ' + target +
      'Result: ' + result +
      'Range: ' + range
    ].join(' \n');
  };
};

SoS.attributeCheckRoll = async function attributeCheckRoll(player, attribute, modifiers) {
  const value = await SoS.rollDice(1, 20);
  const target = attribute + SoS.sumModifiers(modifiers);
  return SoS.processRoll(player,
    value,
    SoS.attributeCheckResult(target),
    SoS.rollMessage(target, modifiers, '1-20'),
    SoS.changeRoll(1, 20));
};

SoS.attributeCheckResult = function attributeCheckResult(target) {
  return function (value) {
    if ((value <= target || value === 1) && value !== 20) {
      return 'Success';
    } else {
      return 'Failure';
    }
  };
};

SoS.damageRoll = async function damageRoll(player, diceString, damageType, modifiers, crit) {
  const {amount, size} = SoS.parseDice(diceString);
  const modifier = SoS.sumModifiers(modifiers) + (crit === 'Critical Success' ? amount * size : 0);
  const low = crit === 'Critical Success' ? amount * size + amount + modifier : amount + modifier;
  const high = crit === 'Critical Success' ? 2 * amount * size + modifier : amount * size + modifier;
  const value = await SoS.rollDice(amount, size);
  return SoS.processRoll(player,
    value + modifier,
    SoS.damageRollResult,
    SoS.damageRollMessage(low, high, damageType, modifiers, modifier),
    SoS.changeRoll(low, high));
};

SoS.damageRollResult = function damageRollResult(value) {
  return -1 * value;
};

SoS.damageRollMessage = function damageRollMessage(low, high, damageType, modifiers, modifier) {
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

SoS.genericRoll = async function genericRoll(player, diceString, modifiers) {
  const {amount, size} = SoS.parseDice(diceString);
  const modifier = SoS.sumModifiers(modifiers);
  const low = amount + modifier;
  const high = amount * size + modifier;
  const value = await SoS.rollDice(amount, size);
  return SoS.processRoll(player,
    value + modifier,
    SoS.genericRollResult,
    SoS.genericRollMessage(low, high, modifiers, modifier),
    SoS.changeRoll(low, high));

};

SoS.genericRollResult = function genericRollResult(value) {
  return value;
};

SoS.genericRollMessage = function genericRollMessage(low, high, modifiers, modifier) {
  return function getGenericRollMessage(value) {
    return [
      'Range: ' + low + '-' + high,
      'Roll: ' + (value - modifier),
      'Modifier: ' + modifier,
      'Result:' + value
    ].join(' \n');
  }
};

SoS.initiativeRoll = async function initiativeRoll(player, character) {
  var modifiers = [character.situationalInitBonus,
    character.movementRatioInitBonus,
    character.attributeInitBonus,
    character.senseInitBonus,
    character.fomInitBonus,
    character.firstActionInitBonus,
    character.actionInitCostMod,
    character.spentInitiative];

  const value = await SoS.genericRoll(player, '1d10', modifiers);
  character.initiativeRollValue = value;
  SoS.setReady(character, true);
  return player;
};

SoS.meleeAttackRoll = async function meleeAttackRoll(player, character, task, skill) {
  await SoS.goToMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return SoS.universalRoll(player, [
    character.situationalMod,
    character.meleeAttackMod,
    character.attributeMeleeAttackMod,
    task,
    skill
  ]);
};

SoS.meleeDefenseRoll = async function meleeDefenseRoll(player, character, attackerWeapon) {
  var itemId;
  var grip;
  var defenderWeapon;
  const blockMods = [];
  const defenseMods = [character.situationalMod, character.meleeDefenseMod, character.attributeDefenseMod];
  const defaultMartialSkill = weaponSkills['Default Martial'].level;
  const dodgeSkill = _.isUndefined(weaponSkills['Dodge']) ? 0 : weaponSkills['Dodge'].level;
  const dodgeMods = defenseMods.concat(dodgeSkill > defaultMartialSkill ? dodgeSkill : defaultMartialSkill);
  const weaponSkills = character.weaponSkills;
  const shieldMod = SoS.getShieldDefenseBonus(character);

  if (attackerWeapon.initiative < 6) {
    dodgeMods.push(15);
  }

  if (!SoS.isUnarmed(character) && !SoS.isWieldingRangedWeapon(character)) {
    if (SoS.isDualWielding(character)) {
      log('Dual Wield defense');
    } else if (SoS.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
      itemId = character.rightHand._id;
      grip = character.rightHand.grip;
    } else {
      itemId = character.leftHand._id;
      grip = character.leftHand.grip;
    }

    defenderWeapon = character.inventory[itemId];
    blockMods = [defenderWeapon.grips[grip].defense, sitMod, defenseMod, shieldMod];
    blockSkill = Math.round(SoS.getWeaponSkill(character, defenderWeapon) / 2);

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

  SoS.removeAimAndObserving(character);
  const defense = await SoS.chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon);
  return defense === 'Failure' ? defense : SoS.universalRoll(player, defense);
};

SoS.meleeDamageRoll = async function meleeDamageRoll(player, character, weapon, attack, bonusDamage) {
  await SoS.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return SoS.damageRoll(player, weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attack);
};

SoS.missileAttackRoll = async function missileAttackRoll(player, character, target, weapon, skill) {
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
  var range = SoS.getDistanceBetweenCharacters(character, target);
  var task;
  var itemId;
  var grip;

  if (SoS.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
    itemId = character.rightHand._id;
    grip = character.rightHand.grip;
  } else {
    itemId = character.leftHand._id;
    grip = character.leftHand.grip;
  }

  SoS.buildWeaponObject(item, grip);
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

  state.SoS.GM.currentAction.callback = 'missileAttackAction';
  state.SoS.GM.currentAction.parameters.range = range;
  state.SoS.GM.currentAction.parameters.attackerWeapon = attackerWeapon;
  state.SoS.GM.currentAction.parameters.attackerSkill = SoS.getWeaponSkill(character, item);

  await SoS.goToMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return SoS.universalRoll(player, mods);
};

SoS.missileDamageRoll = async function missileDamageRoll(player, character, damage, damageType, attackRoll, bonusDamage) {
  await SoS.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return SoS.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], rolls.attackRoll);
};

SoS.missileDefenseRoll = async function missileDefenseRoll(player, character, attackerWeapon, range) {
  const dodgeMods = [
    character.missileDefenseMod,
    character.attributeDefenseMod,
    character.situationalMod,
    SoS.getShieldDefenseBonus(character)
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

  SoS.removeAimAndObserving(character);
  SoS.chooseMissileDefense(player, character, dodgeMods)
  const defense = await SoS.chooseMissileDefense(player, character, defense, attackerWeapon);
  return defense === 'Failure' ? defense : SoS.universalRoll(player, defense);
};

SoS.grappleDefenseWeaponRoll = function grappleDefenseWeaponRoll(character, attackChance) {
  SoS.universalRoll(player, character, 'Weapon Defense Roll', [attackChance], 'grappleDefenseWeaponRollResult');
};

SoS.grappleDefenseWeaponRollApply = function grappleDefenseWeaponRollApply(character) {
  var result = character.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(character.statusEffects, 'Number of Defenses')) {
      character.statusEffects['Number of Defenses'].number++;
    } else {
      SoS.addStatusEffect(character, 'Number of Defenses', {
        number: 1
      });
    }

  }
  state.SoS.GM.currentAction.rolls.weaponDefenseRoll = character.player.currentRoll.result;
  SoS[state.SoS.GM.currentAction.callback]();
};

SoS.grappleDefenseBrawlRoll = function grappleDefenseBrawlRoll(character, brawlChance) {
  SoS.universalRoll(player, character, 'Brawl Defense Roll', [brawlChance], 'grappleDefenseBrawlRollResult');
};

SoS.grappleDefenseBrawlRollApply = function grappleDefenseBrawlRollApply(character) {
  var result = character.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(character.statusEffects, 'Number of Defenses')) {
      character.statusEffects['Number of Defenses'].number++;
    } else {
      SoS.addStatusEffect(character, 'Number of Defenses', {
        number: 1
      });
    }
  }
  state.SoS.GM.currentAction.rolls.brawlDefenseRoll = character.player.currentRoll.result;
  SoS[state.SoS.GM.currentAction.callback]();
};

SoS.holdAimRoll = async function holdAimRoll(player, character) {
  await SoS.goToMenu(player, 'Strength Check Required to Maintain' + character.name + '\'s Aim', ['Roll']);
  return SoS.attributeCheckRoll(player, character.strength);
};

SoS.castingRoll = async function castingRoll(player, character, task, skill, metaMagicMod) {
  await SoS.goToMenu(player, character.name + '\'s Casting Roll', ['Roll']);
  return SoS.universalRoll(player, [task, skill, character.situationalMod, character.castingMod, character.attributeCastingMod, metaMagicMod]);
};

SoS.fatigueCheck= async function fatigueCheck(player, character) {
  const result = await SoS.attributeCheckRoll(player, character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0]);
  if (result === 'Critical Success' || result === 'Success') {
    if (_.has(character.statusEffects, 'Fatigue')) {
      character.statusEffects['Fatigue'].level += 1;
      SoS.applyStatusEffects(character);
    } else {
      SoS.addStatusEffect(character, 'Fatigue', {level: 1});
    }
    character.roundsExertion = 0;
  }
};

SoS.fatigueRecovery = async function fatigueRecovery(player, character, modifier) {
  const result = await SoS.attributeCheckRoll(player, character.health);
  if (result === 'Critical Success' || result === 'Success') {
    character.roundsRest = 0;
    character.roundsExertion = 0;
    character.statusEffects['Fatigue'].level--;
    SoS.applyStatusEffects(character);
  }
};

SoS.hitPositionRoll = async function hitPositionRoll(player, character, target, action) {
  await SoS.goToMenu(player, character.name + '\'s Hit Position Roll', ['Roll']);
  const hitPositions = SoS.hitPositions[target.bodyType];
  if (_.contains(action.modifiers, 'Called Shot Specific')) {
    return _.findWhere(hitPositions, function(hitPosition) {
      return hitPosition.name === action.calledShot;
    });
  } else if (_.contains(action.modifiers, 'Called Shot')) {
    return SoS.calledShotHitPositionRoll(player, target, SoS.getAvailableHitPositions(target, action.calledShot));
  } else {
    return SoS.defaultHitPositionRoll(player, target, hitPositions);
  }
};

SoS.defaultHitPositionRoll = async function defaultHitPositionRoll(player, target, hitPositions) {
  const value = await SoS.rollDice(1, 100);
  const hitPosition = SoS.getHitPosition(target, value);
  return SoS.processHitpositionRoll(player,
    hitPosition,
    SoS.hitPositionRollMessage(target),
    SoS.changeHitPosition(hitPositions));
};

SoS.calledShotHitPositionRoll = async function calledShotHitPositionRoll(player, target, hitPositions) {
  const value = await SoS.rollDice(1, hitPositions.length);
  const hitPosition = hitPositions[value - 1];
  return SoS.processHitpositionRoll(player,
    hitPosition,
    SoS.hitPositionRollMessage(target),
    SoS.changeHitPosition(hitPositions));
};

SoS.hitPositionRollMessage = function hitPositionRollMessage(target) {
  return function (hitPosition) {
    return target.name + ' hit in the ' + hitPosition.name;
  };
};

SoS.changeHitPosition = function changeHitPosition(hitPositions) {
  return async function chooseNewHitPosition(player) {
    const {pressedButton} = await SoS.goToMenu(player, 'Choose Hit Position', _.pluck(hitPositions, 'name'));
    return _.findWhere(hitPositions, {name: pressedButton});
  };
};

SoS.processHitpositionRoll = async function processHitpositionRoll(player, value, getMessage, changeValue) {
  const message = getMessage(value);
  if (player.name === state.SoS.GM.name) {
    const {pressedButton} = await SoS.goToMenu(player, message, ['Continue', 'Change']);
    if (pressedButton !== 'Continue') {
      const newValue = await changeValue(player, pressedButton);
      return await processHitpositionRoll(player, newValue, getMessage, changeValue);
    }
  } else {
    await SoS.goToMenu(player, message, ['Continue']);
  }
  return value;
};
