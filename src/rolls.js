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
  var diceArray = dice.split('d').map(num => parseInt(num));
  return {
    amount: diceArray[0],
    size: diceArray[1]
  };
};

MML.sumModifiers = function sumModifiers(modifiers) {
  return modifiers ? modifiers.reduce((sum, value) => sum + value, 0) : 0;
};

MML.processRoll = async function processRoll(player, roll) {
  if (player.name === state.MML.GM.name) {
    MML.displayGmRoll(player, roll);
  } else {
    MML.displayPlayerRoll(player, roll);
  }
  const pressedButton = await MML.setRollButtons(player);
  if (pressedButton === 'acceptRoll') {
    return roll.result;
  } else {
    return MML.processRoll(player, MML.changeRoll(player, roll, pressedButton.replace('changeRoll ', '')));
  }
};

MML.changeRoll = function changeRoll(player, roll, resultString) {
  var result = parseInt(resultString);
  var range = roll.range.split('-');
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);
  var modifier = MML.sumModifiers(roll.modifiers);

  if (isNaN(result)) {
    sendChat('Error', 'Roll value must be numerical.');
    return roll;
  } else {
    if (roll.type === 'universal' || roll.type === 'attribute' || roll.type === 'hitPosition') {
      if (result >= low && result <= high) {
        roll.value = result;
        if (roll.type === 'universal') {
          roll = MML.universalRollResult(roll);
        } else if (roll.type === 'attribute') {
          roll = MML.attributeCheckResult(roll);
        } else {
          roll = MML.hitPositionRollResult(roll);
        }
      } else {
        sendChat('Error', 'New roll value out of range.');
      }
    } else {
      if (result >= low && result <= high) {
        roll.value = result - modifier;
        if (roll.type === 'damage') {
          roll = MML.damageRollResult(roll);
        } else if (roll.type === 'generic') {
          roll = MML.genericRollResult(roll);
        } else {
          roll.result = result;
        }
      } else {
        sendChat('Error', 'New roll value out of range.');
      }
    }
    return roll;
  }
};

MML.universalRoll = async function universalRoll(player, name, modifiers) {
  const value = await MML.rollDice(1, 100);
  const roll = MML.universalRollResult({
    type: 'universal',
    name: name,
    range: '1-100',
    value: value,
    target: MML.sumModifiers(modifiers),
    modifiers: modifiers
  });
  return MML.processRoll(player, roll);
};

MML.universalRollResult = function universalRollResult(roll) {
  if (roll.value > 94) {
    roll.result = 'Critical Failure';
  } else {
    if (roll.value <= roll.target) {
      if (roll.value <= Math.round(roll.target / 10)) {
        roll.result = 'Critical Success';
      } else {
        roll.result = 'Success';
      }
    } else {
      roll.result = 'Failure';
    }
  }

  roll.message = 'Roll: ' + roll.value +
    '\nTarget: ' + roll.target +
    '\nResult: ' + roll.result +
    '\nRange: ' + roll.range;

  return roll;
};

MML.attributeCheckRoll = async function attributeCheckRoll(name, attribute, modifiers) {
  const value = await MML.rollDice(1, 20);
  const roll = MML.attributeCheckResult({
    type: 'attribute',
    name: name,
    range: '1-20',
    value: value,
    target: attribute + MML.sumModifiers(modifiers),
    modifiers: modifiers
  });
  return MML.processRoll(player, roll);
};

MML.attributeCheckResult = function attributeCheckResult(roll) {
  if ((roll.value <= roll.target || roll.value === 1) && (roll.value !== 20)) {
    roll.result = 'Success';
  } else {
    roll.result = 'Failure';
  }

  roll.message = 'Roll: ' + roll.value +
    '\nResult: ' + roll.result +
    '\nTarget: ' + roll.target +
    '\nRange: ' + roll.range;

  return roll;
};

MML.damageRoll = async function damageRoll(name, diceString, damageType, modifiers, crit) {
  const dice = MML.parseDice(diceString);
  const amount = dice.amount;
  const size = dice.size;
  const modifier = MML.sumModifiers(modifiers) + (crit === 'Critical Success' ? amount * size : 0);
  var range;
  if (crit === 'Critical Success') {
    range = (amount * size + amount + modifier) + "-" + (2 * amount * size + modifier);
  } else {
    range = (amount + modifier) + "-" + (amount * size + modifier);
  }
  const value = await MML.rollDice(amount, size);
  const roll = MML.damageRollResult({
    type: "damage",
    name: name,
    range: range,
    value: value + modifier,
    modifier: modifier,
    modifiers: modifiers,
    damageType: damageType
  });
  return processRoll(player, roll);
};

MML.damageRollResult = function damageRollResult(roll) {
  roll.result = -roll.value;
  roll.message = 'Damage Type: ' + roll.damageType + '\nRoll: ' + roll.value + '\nRange: ' + roll.range;
  return roll;
};

MML.genericRoll = async function genericRoll(player, name, diceString, modifiers) {
  const dice = MML.parseDice(diceString);
  const amount = dice.amount;
  const size = dice.size;
  const modifier = MML.sumModifiers(modifiers);
  const range = (amount + modifier).toString() + '-' + ((amount * size) + modifier).toString();
  const value = await MML.rollDice(amount, size);
  const roll = MML.genericRollResult({
    type: 'generic',
    name: name,
    range: range,
    value: value,
    modifier: modifier,
    modifiers: modifiers
  });
  return MML.processRoll(player, roll);
};

MML.genericRollResult = function genericRollResult(roll) {
  roll.result = roll.value + roll.modifier;
  roll.message = 'Roll: ' + roll.value +
    '\nModifier: ' + roll.modifier +
    '\nResult: ' + roll.result +
    '\nRange: ' + roll.range;
  return roll;
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

  const value = await MML.genericRoll(player, 'initiative', '1d10', modifiers);
  character.initiativeRollValue = value;
  MML.setReady(character, true);
  return player;
};

MML.meleeAttackRoll = async function meleeAttackRoll(player, character, task, skill) {
  await MML.goToMenu(player, character.name + '\'s Attack Roll', ['Roll']);
  return MML.universalRoll(player, 'meleeAttack', [
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
  return defense === 'Failure' ? defense : MML.universalRoll(player, defense.name, defense.modifiers);
};

MML.meleeDamageRoll = async function meleeDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  await MML.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  const roll = await MML.damageRoll('Melee Damage Roll', weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attackRoll);
  return MML.processRoll(player);
};

MML.missileAttackRoll = async function missileAttackRoll(player, character, target, weapon, skill) {
  var mods = [skill, character.situationalMod, character.missileAttackMod, character.attributeMissileAttackMod];
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
  return MML.universalRoll(player, 'missileAttack', mods);
};

MML.missileDamageRoll = async function missileDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  await MML.goToMenu(player, character.name + '\'s Damage Roll', ['Roll']);
  return MML.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], rolls.attackRoll);
};

MML.armorCoverageRoll = function armorCoverageRoll() {
  return MML.rollDice(1, 100);
};

MML.rangedDefenseRoll = function rangedDefenseRoll(character, defenseChance) {
  MML.universalRoll(player, character, 'rangedDefenseRoll', [defenseChance], 'rangedDefenseRollResult');
};

MML.rangedDefenseRollApply = function rangedDefenseRollApply(character) {
  var result = character.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has('Number of Defenses')) {
      character.statusEffects['Number of Defenses'].number++;
    } else {
      MML.addStatusEffect(character, 'Number of Defenses', {
        number: 1
      });
    }
    if (!_.has(character.statusEffects, 'Dodged This Round')) {
      MML.addStatusEffect(character, 'Dodged This Round', {});
    }
  }
  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
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

MML.holdAimRoll = function holdAimRoll(character) {
  return MML.goToMenu(player, { message: 'Strength Check Required to Maintain' + character.name + '\'s Aim', buttons: ['Roll'] })
    .then(function(player) {
      return MML.attributeCheckRoll('Hold Aim Strength Roll', character.strength);
    })
    .then(MML.processRoll(player));
  // TODO: finish wrapping these in rolls functions
};

MML.castingRoll = function castingRoll(player, character, rollName, task, skill, metaMagicMod) {
  return MML.goToMenu(player, { message: character.name + '\'s Casting Roll', buttons: ['Roll'] })
    .then(function(player) {
      return MML.universalRoll(player, rollName, [task, skill, character.situationalMod, character.castingMod, character.attributeCastingMod, metaMagicMod]);
    })
    .then(MML.processRoll(player))
    .then(function(roll) {

    });
};

MML.castingRollResult = function castingRollResult(character) {
  var currentRoll = character.player.currentRoll;

  if (character.player.name === state.MML.GM.name) {
    if (currentRoll.accepted === false) {
      character.player.displayGmRoll(currentRoll);
    } else {
      if (_.contains(character.action.modifiers, 'Called Shot Specific') && currentRoll.value - currentRoll.target < 11) {
        character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
        character.action.modifiers.push('Called Shot');
        currentRoll.result = 'Success';
      }
      character.castingRollApply();
    }
  } else {
    character.player.displayPlayerRoll(currentRoll);
    if (_.contains(character.action.modifiers, 'Called Shot Specific') && currentRoll.value - currentRoll.target < 11) {
      character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
      character.action.modifiers.push('Called Shot');
      currentRoll.result = 'Success';
    }
    character.castingRollApply();
  }
};

MML.fatigueCheckRoll = async function fatigueCheckRoll(player, character) {
  const result = await MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0]);
  if (_.has(character.statusEffects, 'Fatigue')) {
    character.statusEffects['Fatigue'].level += 1;
    MML.applyStatusEffects(character);
  } else {
    MML.addStatusEffect(character, 'Fatigue', {
      level: 1
    });
  }
  character.roundsExertion = 0;
};

MML.fatigueRecoveryRoll = function fatigueRecoveryRoll(character, modifier) {
  MML.attributeCheckRoll(character, 'Fatigue Recovery Check Health Roll', 'health', [0], 'fatigueRecoveryRollResult');
};

MML.fatigueRecoveryRollResult = function fatigueRecoveryRollResult(character) {
  character.processRoll('fatigueRecoveryRollApply');
};

MML.fatigueRecoveryRollApply = function fatigueRecoveryRollApply(character) {
  var result = character.player.currentRoll.result;
  if (result === 'Critical Success' || result === 'Success') {
    character.roundsRest = 0;
    character.roundsExertion = 0;
    character.statusEffects['Fatigue'].level--;
    MML.applyStatusEffects(character);
  }
  MML.nextFatigueCheck();
};

MML.hitPositionRoll = async function hitPositionRoll(player, character, target, action) {
  await MML.goToMenu(player, character.name + '\'s Hit Position Roll', ['Roll']);
  var rollValue;
  var range;
  var rangeUpper;
  var result;
  var accepted;
  var hitPositions;
  var hitPositionIndex;

  if (_.contains(action.modifiers, 'Called Shot Specific')) {
    return _.findWhere(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === action.calledShot;
    });
  } else if (_.contains(action.modifiers, 'Called Shot')) {
    hitPositions = MML.getAvailableHitPositions(target, action.calledShot);
    rangeUpper = hitPositions.length;
    range = '1-' + rangeUpper;
    calledShot = true;
  } else {
    hitPositions = MML.hitPositions[target.bodyType];
    rangeUpper = 100;
    range = '1-' + Object.keys(hitPositions).length;
    calledShot = false;
  }
  const value = MML.rollDice(1, rangeUpper);
  const roll = MML.hitPositionRollResult({
    type: 'hitPosition',
    calledShot: calledShot,
    range: range,
    hitPositions: hitPositions,
    target: target,
    value: value
  });
  return MML.processRoll(player, roll);
};

// MML.processHitPositionRoll = function processHitPositionRoll(player, roll) {
//   return function (roll) {
//     if (player.name === state.MML.GM.name) {
//       MML.displayGmRoll(player, roll);
//     } else {
//       MML.displayPlayerRoll(player, roll);
//     }
//     return MML.setRollButtons(player)
//     .then(function(player) {
//       if (player.pressedButton === 'acceptRoll') {
//         return roll.result;
//       } else {
//         return MML.processHitPositionRoll(player)(MML.changeRoll(player, roll, player.pressedButton.replace('changeRoll ', '')));
//       }
//     });
//   };
// };

MML.hitPositionRollResult = function hitPositionRollResult(roll) {
  // result = MML.getCalledShotHitPosition(target, rollValue, bodyPart);
  // result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
  // result = MML.getHitPosition(target, MML.rollDice(1, 100));
  // rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
  //   return hitPosition.name === result.name;
  // }));
  if (roll.calledShot) {
    roll.result = roll.hitPositions[roll.value];
  } else {
    roll.result = MML.getHitPosition(roll.target, roll.value);
    // MML.hitPositions[character.bodyType][MML.hitTables[character.bodyType][character.hitTable][rollValue]]
  }

  roll.message = 'Roll: ' + roll.value +
    '\nResult: ' + roll.result.name +
    '\nRange: ' + roll.range;
  return roll;
};

// MML.calledShotSpecificRoll = function calledShotSpecificRoll(target, calledShot, rolls) {
//   var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
//     return hitPosition.name === calledShot;
//   }));
//   rolls.hitPositionRoll = MML.getHitPosition(target, hitPositionIndex);
//   return rolls;
// };
//
// MML.calledShotRoll = function calledShotRoll(target, calledShot, rolls) {
//   var hitPositions = MML.getAvailableHitPositions(target, calledShot);
//   var rangeUpper = hitPositions.length;
//   var range = '1-' + rangeUpper;
//   return MML.rollDice(1, rangeUpper)
//     .then(function(value) {
//       return MML.calledShotRollResult({
//         type: 'hitPosition',
//         range: range,
//         hitPositions: hitPositions,
//         target: target,
//         value: value
//       });
//     })
//     .then(MML.processCalledShotRoll(player))
//     .then(function(result) {
//       rolls.hitPositionRoll = result;
//       return rolls;
//     });
// };
