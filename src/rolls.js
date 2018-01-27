MML.rollDice = async function rollDice(amount, size) {
  switch (state.MML.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Array.from({length: amount}, () => randomInteger(size)).reduce((sum, value) => sum + value, 0);
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
  await MML.goToMenu(player, character.name + '\'s Attack Roll', ['Roll']);
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
  var dodgeMods;
  var blockMods;
  var dodgeSkill;
  var blockSkill;
  var weaponSkills = character.weaponSkills;
  var defaultMartialSkill = weaponSkills['Default Martial'].level;
  var shieldMod = MML.getShieldDefenseBonus(character);
  var defenseMod = character.meleeDefenseMod + character.attributeDefenseMod;
  var sitMod = character.situationalMod;

  if (!_.isUndefined(weaponSkills['Dodge']) && defaultMartialSkill < weaponSkills['Dodge'].level) {
    dodgeMods = [weaponSkills['Dodge'].level, defenseMod, sitMod];
  } else {
    dodgeMods = [defaultMartialSkill, defenseMod, sitMod];
  }

  if (attackerWeapon.initiative < 6) {
    dodgeMods.push(15);
  }

  if (MML.isDualWielding(character)) {
    log('Dual Wield defense');
  } else if (MML.isUnarmed(character) || MML.isWieldingRangedWeapon(character)) {
    blockMods = [];
  } else {
    if (MML.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
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
  await MML.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return MML.damageRoll(player, weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attack);
};

MML.missileAttackRoll = async function missileAttackRoll(player, character, target, weapon, skill) {
  var mods = [
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

  await MML.goToMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return MML.universalRoll(player, mods);
};

MML.missileDamageRoll = async function missileDamageRoll(player, character, damage, damageType, attackRoll, bonusDamage) {
  await MML.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
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
  await MML.goToMenu(player, 'Strength Check Required to Maintain' + character.name + '\'s Aim', ['Roll']);
  return MML.attributeCheckRoll(player, character.strength);
};

MML.castingRoll = async function castingRoll(player, character, task, skill, metaMagicMod) {
  await MML.goToMenu(player, character.name + '\'s Casting Roll', ['Roll']);
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
  await MML.goToMenu(player, character.name + '\'s Hit Position Roll', ['Roll']);
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
    const {pressedButton} = await MML.goToMenu(player, 'Choose Hit Position', _.pluck(hitPositions, 'name'));
    return _.findWhere(hitPositions, {name: pressedButton});
  };
};

MML.processHitpositionRoll = async function processHitpositionRoll(player, value, getMessage, changeValue) {
  const message = getMessage(value);
  if (player.name === state.MML.GM.name) {
    const {pressedButton} = await MML.goToMenu(player, message, ['Continue', 'Change']);
    if (pressedButton !== 'Continue') {
      const newValue = await changeValue(player, pressedButton);
      return await processHitpositionRoll(player, newValue, getMessage, changeValue);
    }
  } else {
    await MML.goToMenu(player, message, ['Continue']);
  }
  return value;
};
