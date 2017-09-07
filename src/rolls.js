MML.rollDice = function rollDice(amount, size) {
  var value = 0;

  for (i = 0; i < amount; i++) {
    value += randomInteger(size);
  }
  return value;
};

MML.parseDice = function parseDice(dice) {
  var diceArray = dice.split('d');
  var amount = diceArray[0] * 1;
  var size = diceArray[1] * 1;
  return {
    amount: amount,
    size: size
  };
};

MML.sumModifiers = function sumModifiers(modifiers) {
  return _.reduce(modifiers, function(sum, mod) { return sum + mod; }, 0);
};

MML.universalRoll = function universalRoll(name, modifiers) {
  var roll = {
    type: 'universal',
    name: name,
    range: '1-100',
    value: MML.rollDice(1, 100),
    target: MML.sumModifiers(modifiers),
    modifiers: modifiers
  };

  return MML.universalRollResult(roll);
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

MML.attributeCheckRoll = function attributeCheckRoll(name, attribute, modifiers) {
  var roll = {
    type: 'attribute',
    name: name,
    range: '1-20',
    value: MML.rollDice(1, 20),
    target: attribute + MML.sumModifiers(modifiers),
    modifiers: modifiers
  };

  return MML.attributeCheckResult(roll);
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

MML.damageRoll = function damageRoll(name, diceString, damageType, modifiers, crit) {
  var dice = MML.parseDice(diceString);
  var amount = dice.amount;
  var size = dice.size;
  var modifier = MML.sumModifiers(modifiers);
  var value;

  if (crit === 'Critical Success') {
    value = MML.rollDice(amount, size) + amount * size + modifier;
    range = (amount * size + amount + modifier) + "-" + (2 * amount * size + modifier);
  } else {
    value = MML.rollDice(amount, size) + modifier;
    range = (amount + modifier) + "-" + (amount * size + modifier);
  }

  var roll = {
    type: "damage",
    name: name,
    range: range,
    value: value,
    modifier: modifier,
    modifiers: modifiers,
    damageType: damageType
  };
  return MML.damageRollResult(roll);
};

MML.damageRollResult = function damageRollResult(roll) {
  roll.result = -roll.value;
  roll.message = 'Damage Type: ' + roll.damageType + '\nRoll: ' + roll.value + '\nRange: ' + roll.range;
  return roll;
};

MML.genericRoll = function genericRoll(name, diceString, modifiers) {
  var dice = MML.parseDice(diceString);
  var modifier = MML.sumModifiers(modifiers);
  var range = (dice.amount + modifier).toString() + '-' + ((dice.amount * dice.size) + modifier).toString();
  var roll = {
    type: 'generic',
    name: name,
    range: range,
    value: MML.rollDice(dice.amount, dice.size),
    modifier: modifier,
    modifiers: modifiers
  };

  return MML.genericRollResult(roll);
};

MML.genericRollResult = function genericRollResult(roll) {
  roll.result = roll.value + roll.modifier;
  roll.message = 'Roll: ' + roll.value +
    '\nModifier: ' + roll.modifier +
    '\nResult: ' + roll.result +
    '\nRange: ' + roll.range;
  return roll;
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
    if (roll.type === 'universal' || roll.type === 'attribute' || roll.type === 'hitPosition') {
      if (value >= low && value <= high) {
        roll.value = value;
        if (roll.type === 'universal') {
          roll = MML.universalRollResult(roll);
        } else if(roll.type === 'attribute') {
          roll = MML.attributeCheckResult(roll);
        } else {
          roll = MML.hitPositionRollResult(roll);
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

MML.rollInitiative = function rollInitiative([player, character, action]) {
  MML.setAction(character, action);
  var modifiers = [character.situationalInitBonus,
    character.movementRatioInitBonus,
    character.attributeInitBonus,
    character.senseInitBonus,
    character.fomInitBonus,
    character.firstActionInitBonus,
    character.spentInitiative];

  return MML.processRoll(player, MML.genericRoll('initiative', '1d10', modifiers))
  .then(function ([player, roll]) {
    character.initiativeRollValue = roll.value;
    MML.setReady(character, true);
    return player;
  });
};

MML.meleeAttackRoll = function meleeAttackRoll(player, character, task, skill) {
  return MML.goToMenu(player, {message: character.name + '\'s Attack Roll', buttons: ['Roll']})
    .then(function (player) {
      return MML.processRoll(player, MML.universalRoll('meleeAttack', [character.situationalMod, character.meleeAttackMod, character.attributeMeleeAttackMod, task, skill]));
    });
};

MML.attackRollResult = function attackRollResult(character) {
  var currentRoll = character.player.currentRoll;
  if (character.player.name === state.MML.GM.name) {
    if (currentRoll.accepted === false) {
      character.player.displayGmRoll(currentRoll);
    } else {
      if (_.has(character.statusEffects, 'Called Shot Specific') && currentRoll.value > currentRoll.target && currentRoll.value - currentRoll.target < 11) {
        character.statusEffects['Called Shot Specific'].nearMiss = true;
        currentRoll.result = 'Success';
      }
      character.attackRollApply();
    }
  } else {
    character.player.displayPlayerRoll(currentRoll);
    if (_.has(character.statusEffects, 'Called Shot Specific') && currentRoll.value > currentRoll.target && currentRoll.value - currentRoll.target < 11) {
      character.statusEffects['Called Shot Specific'].nearMiss = true;
      currentRoll.result = 'Success';
    }
    character.attackRollApply();
  }
};

MML.meleeDamageRoll = function meleeDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  return MML.goToMenu(player, {message: character.name + '\'s Damage Roll', buttons: ['Roll']})
    .then(function (player) {
      return MML.processRoll(player, MML.damageRoll('Melee Damage Roll', weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attackRoll.result));
    });
};

MML.missileAttackRoll = function missileAttackRoll(character, rollName, task, skill, target) {
  var mods = [task, skill, character.situationalMod, character.missileAttackMod, character.attributeMissileAttackMod];
  if (_.has(target.statusEffects, 'Shoot From Cover')) {
    mods.push(-20);
  }
  if (state.MML.GM.currentAction.parameters.attackerWeapon.family === 'MWM') {
    character.inventory[state.MML.GM.currentAction.parameters.attackerWeapon._id].loaded = 0;
  }
  MML.universalRoll(character, rollName, mods, 'attackRollResult');
};

MML.missileDamageRoll = function missileDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  return MML.goToMenu(player, {message: character.name + '\'s Damage Roll', buttons: ['Roll']})
    .then(function (player) {
      return MML.processRoll(player, MML.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], attackRoll.result));
    });
};

MML.rangedDefenseRoll = function rangedDefenseRoll(character, defenseChance) {
  MML.universalRoll(character, 'rangedDefenseRoll', [defenseChance], 'rangedDefenseRollResult');
};

MML.rangedDefenseRollResult = function rangedDefenseRollResult(character) {
  character.processRoll('rangedDefenseRollApply');
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
    if (!_.has(character.statusEffects, 'Dodged character Round')) {
      MML.addStatusEffect(character, 'Dodged character Round', {});
    }
  }
  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefenseWeaponRoll = function grappleDefenseWeaponRoll(character, attackChance) {
  MML.universalRoll(character, 'Weapon Defense Roll', [attackChance], 'grappleDefenseWeaponRollResult');
};

MML.grappleDefenseWeaponRollResult = function grappleDefenseWeaponRollResult(character) {
  character.processRoll('grappleDefenseWeaponRollApply');
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
  MML.universalRoll(character, 'Brawl Defense Roll', [brawlChance], 'grappleDefenseBrawlRollResult');
};

MML.grappleDefenseBrawlRollResult = function grappleDefenseBrawlRollResult(character) {
  character.processRoll('grappleDefenseBrawlRollApply');
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
  MML.attributeCheckRoll(character, 'Strength Check Required to Maintain Aim', 'strength', [0], 'holdAimRollResult');
};

MML.holdAimRollResult = function holdAimRollResult(character) {
  character.processRoll('holdAimRollApply');
};

MML.holdAimRollApply = function holdAimRollApply(character) {
  var result = character.player.currentRoll.result;
  state.MML.GM.currentAction.rolls.strengthRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.castingRoll = function castingRoll(player, character, rollName, task, skill, metaMagicMod) {
  return MML.goToMenu(player, {message: character.name + '\'s Casting Roll', buttons: ['Roll']})
    .then(function (player) {
      return MML.processRoll(MML.universalRoll(rollName, [task, skill, character.situationalMod, character.castingMod, character.attributeCastingMod, metaMagicMod]));
    })
    .then(function ([player, roll]) {

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

MML.woundFatigueRoll = function woundFatigueRoll(player, character) {
  return MML.processRoll(player, MML.attributeCheckRoll('Wound Fatigue Roll', character.systemStrength))
  .then(function (roll) {
    if (roll.result === 'Failure') {
      MML.addStatusEffect(character, 'Wound Fatigue', {});
    }
    return player;
  });
};

MML.majorWoundRoll = function majorWoundRoll(player, character, bodyPart, duration) {
  return MML.processRoll(player, MML.attributeCheckRoll('Major Wound Willpower Roll', character.willpower))
  .then(function (roll) {
    if (roll.result === 'Failure') {
      MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
        duration: duration,
        startingRound: state.MML.GM.currentRound,
        bodyPart: bodyPart
      });
    }
    return player;
  });
};

MML.disablingWoundRoll = function disablingWoundRoll(player, character, bodyPart, duration) {
  return MML.processRoll(player, MML.attributeCheckRoll('Disabling Wound System Strength Roll', character.systemStrength))
  .then(function (roll) {
    MML.addStatusEffect(character, 'Disabling Wound, ' + bodyPart, {
      bodyPart: bodyPart
    });
    if (roll.result === 'Failure') {
      if (_.has(character.statusEffects, 'Stunned')) {
        character.statusEffects['Stunned'].duration = duration;
      } else {
        MML.addStatusEffect(character, 'Stunned', {
          startingRound: state.MML.GM.currentRound,
          duration: duration
        });
      }
    }
    return player;
  });
};

MML.knockdownRoll = function knockdownRoll(player, character) {
  return MML.processRoll(player, MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0]))
  .then(function (roll) {
    if (roll.result === 'Failure') {
      character.movementPosition = 'Prone';
    } else {
      MML.addStatusEffect(character, 'Stumbling', {
        startingRound: state.MML.GM.currentRound
      });
    }
    return player;
  });
};

MML.sensitiveAreaRoll = function sensitiveAreaRoll(player, character) {
  return MML.processRoll(player, MML.attributeCheckRoll('Sensitive Area Willpower Roll', character.willpower))
  .then(function (roll) {
    if (roll.result === 'Failure') {
      MML.addStatusEffect(character, 'Sensitive Area', {
        startingRound: state.MML.GM.currentRound
      });
    }
    return player;
  });
};

MML.fatigueCheckRoll = function fatigueCheckRoll(player, character) {
  return MML.processRoll(player, MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0]))
  .then(function (roll) {
    if (roll.result === 'Failure') {
      if (_.has(character.statusEffects, 'Fatigue')) {
        character.statusEffects['Fatigue'].level += 1;
        MML.applyStatusEffects(character);
      } else {
        MML.addStatusEffect(character, 'Fatigue', {
          level: 1
        });
      }
      character.roundsExertion = 0;
    }
    return player;
  });
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

MML.hitPositionRoll = function hitPositionRoll(player, target, action) {
  var rollValue;
  var range;
  var rangeUpper;
  var result;
  var accepted;
  var hitPositions;

  if (_.contains(action.modifiers, 'Called Shot Specific')) {
    var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === action.calledShot;
    }));
    if (_.contains(action.modifiers, 'Near Miss')) {
      var bodyPart = MML.hitPositions[target.bodyType][hitPositionIndex].bodyPart;
      hitPositions = MML.getAvailableHitPositions(target, bodyPart);
      rangeUpper = hitPositions.length;
      rollValue = MML.rollDice(1, rangeUpper);
      range = '1-' + rangeUpper;
      result = MML.getCalledShotHitPosition(target, rollValue, bodyPart);
      calledShot = 'Called Shot';
    } else {
      rollValue = hitPositionIndex;
      range = rollValue + '-' + rollValue;
      result = MML.getHitPosition(target, rollValue);
    }
  } else if (_.contains(action.modifiers, 'Called Shot')) {
    hitPositions = MML.getAvailableHitPositions(target, action.calledShot);
    rangeUpper = hitPositions.length;
    rollValue = MML.rollDice(1, rangeUpper);
    range = '1-' + rangeUpper;
    result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
    calledShot = 'Called Shot';
  } else {
    hitPositions = MML.hitPositions[target.bodyType];
    range = '1-' + _.keys(hitPositions).length;
    result = MML.getHitPosition(target, MML.rollDice(1, 100));
    rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === result.name;
    }));
    calledShot = false;
  }
  return MML.processRoll(player, MML.hitPositionRollResult({
    type: 'hitPosition',
    calledShot: calledShot,
    range: range,
    hitPositions: hitPositions,
    result: result,
    value: rollValue
  }));
};

MML.hitPositionRollResult = function hitPositionRollResult(roll) {
  if (_.has(character.statusEffects, 'Called Shot')) {
    roll.result = MML.getCalledShotHitPosition(target, roll.value, action.calledShot);
  } else if (_.has(character.statusEffects, 'Called Shot Specific') && character.statusEffects['Called Shot Specific'].nearMiss) {
    var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === action.calledShot;
    }));
    roll.result = MML.getCalledShotHitPosition(target, roll.value, MML.hitPositions[target.bodyType][hitPositionIndex].bodyPart);
  } else {
    roll.result = roll.hitPositions[roll.value];
  }

  roll.message = 'Roll: ' + roll.value +
    '\nResult: ' + roll.result.name +
    '\nRange: ' + roll.range;

  return roll;
};
