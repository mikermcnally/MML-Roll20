var _ = require('underscore');
var MML = MML || {};

MML.rollDice = function rollDice(amount, size) {
  switch (state.MML.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Promise.resolve(
        Array(amount)
        .map(function() {
          return randomInteger(size);
        })
        .reduce(function(sum, value) {
          return sum + value;
        }, 0));
  }
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
  return MML.rollDice(1, 100)
    .then(function (value) {
      return MML.universalRollResult({
        type: 'universal',
        name: name,
        range: '1-100',
        value: value,
        target: MML.sumModifiers(modifiers),
        modifiers: modifiers
      });
    });
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
  return MML.rollDice(1, 20)
    .then(function (value) {
      return MML.attributeCheckResult({
        type: 'attribute',
        name: name,
        range: '1-20',
        value: value,
        target: attribute + MML.sumModifiers(modifiers),
        modifiers: modifiers
      });
    });
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
  var modifier = MML.sumModifiers(modifiers) + (crit === 'Critical Success' ? amount * size : 0);
  var range;
  if (crit === 'Critical Success') {
    range = (amount * size + amount + modifier) + "-" + (2 * amount * size + modifier);
  } else {
    range = (amount + modifier) + "-" + (amount * size + modifier);
  }
  return MML.rollDice(amount, size)
    .then(function (value) {
      return MML.damageRollResult({
        type: "damage",
        name: name,
        range: range,
        value: value + modifier,
        modifier: modifier,
        modifiers: modifiers,
        damageType: damageType
      });
    });
};

MML.damageRollResult = function damageRollResult(roll) {
  roll.result = -roll.value;
  roll.message = 'Damage Type: ' + roll.damageType + '\nRoll: ' + roll.value + '\nRange: ' + roll.range;
  return roll;
};

MML.genericRoll = function genericRoll(name, diceString, modifiers) {
  var dice = MML.parseDice(diceString);
  var amount = dice.amount;
  var size = dice.size;
  var modifier = MML.sumModifiers(modifiers);
  var range = (amount + modifier).toString() + '-' + ((amount * size) + modifier).toString();
  return MML.rollDice(amount, size)
    .then(function (value) {
      return MML.genericRollResult({
        type: 'generic',
        name: name,
        range: range,
        value: value + modifier,
        modifier: modifier,
        modifiers: modifiers
      });
    });
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
  console.log(roll);
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
        } else if (roll.type === 'attribute') {
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

MML.initiativeRoll = function initiativeRoll(player, character, action) {
  var modifiers = [character.situationalInitBonus,
    character.movementRatioInitBonus,
    character.attributeInitBonus,
    character.senseInitBonus,
    character.fomInitBonus,
    character.firstActionInitBonus,
    character.actionInitCostMod,
    character.spentInitiative];

  return MML.processRoll(player, MML.genericRoll('initiative', '1d10', modifiers))
    .then(function(value) {
      character.initiativeRollValue = value;
      MML.setReady(character, true);
      return player;
    });
};

MML.meleeAttackRoll = function meleeAttackRoll(player, character, task, skill) {
  return function (rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Attack Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.processRoll(player, MML.universalRoll('meleeAttack', [character.situationalMod, character.meleeAttackMod, character.attributeMeleeAttackMod, task, skill]));
      })
      .then(function (result) {
        rolls.meleeAttackRoll = result;
        if (result === 'Failure' || 'Critical Failure') {
          throw rolls;
        }
        return rolls;
      });
  };
};

MML.defenseRoll = function defenseRoll(player, name, chance) {
  return function (rolls) {
    return MML.processRoll(player, MML.universalRoll(name, chance))
      .then(function (result) {
        rolls.meleeDefenseRoll = result;
        if (result === 'Success' || 'Critical Success') {
          throw rolls;
        }
        return rolls;
      });
  };
};

MML.meleeDamageRoll = function meleeDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  return function (rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Damage Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.processRoll(player, MML.damageRoll('Melee Damage Roll', weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attackRoll));
      })
      .then(function (result) {
        rolls.meleeDamageRoll = result;
        return rolls;
      });
  };
};

MML.missileAttackRoll = function missileAttackRoll(player, character, target, weapon, skill) {
  return function (rolls) {
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

    return function (rolls) {
      return MML.goToMenu(player, { message: character.name + '\'s Attack Roll', buttons: ['Roll'] })
        .then(function(player) {
          return MML.missileAttackRoll(player, MML.universalRoll('missileAttack', mods));
        })
        .then(function (result) {
          rolls.missileAttackRoll = result;
          if (result === 'Failure' || 'Critical Failure') {
            throw rolls;
          }
          return rolls;
        });
    };
  };
};

MML.missileDamageRoll = function missileDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  return function (rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Damage Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.processRoll(player, MML.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], rolls.attackRoll));
      })
      .then(function (result) {
        rolls.missileDamageRoll = result;
        return rolls;
      });
  };
};

MML.armorCoverageRoll = function armorCoverageRoll() {
  return MML.rollDice(1, 100);
};

MML.rangedDefenseRoll = function rangedDefenseRoll(character, defenseChance) {
  MML.universalRoll(character, 'rangedDefenseRoll', [defenseChance], 'rangedDefenseRollResult');
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
  MML.universalRoll(character, 'Weapon Defense Roll', [attackChance], 'grappleDefenseWeaponRollResult');
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
      return MML.processRoll(player, MML.attributeCheckRoll('Hold Aim Strength Roll', character.strength));
    })
    // TODO: finish wrapping these in rolls functions
};

MML.castingRoll = function castingRoll(player, character, rollName, task, skill, metaMagicMod) {
  return MML.goToMenu(player, { message: character.name + '\'s Casting Roll', buttons: ['Roll'] })
    .then(function(player) {
      return MML.processRoll(MML.universalRoll(rollName, [task, skill, character.situationalMod, character.castingMod, character.attributeCastingMod, metaMagicMod]));
    })
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

MML.woundFatigueRoll = function woundFatigueRoll(player, character) {
  return function (rolls) {
    return MML.processRoll(player, MML.attributeCheckRoll('Wound Fatigue Roll', character.systemStrength))
      .then(function(result) {
        if (result === 'Failure') {
          MML.addStatusEffect(character, 'Wound Fatigue', {});
        }
        rolls.woundFatigueRoll = result;
        return rolls;
      });
    };
};

MML.majorWoundRoll = function majorWoundRoll(player, character, bodyPart, duration) {
  return function (rolls) {
    return MML.processRoll(player, MML.attributeCheckRoll('Major Wound Willpower Roll', character.willpower))
      .then(function(result) {
        if (result === 'Failure') {
          MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
            duration: duration,
            startingRound: state.MML.GM.currentRound,
            bodyPart: bodyPart
          });
        }
        rolls.majorWoundRoll = result;
        return rolls;
      });
    };
};

MML.disablingWoundRoll = function disablingWoundRoll(player, character, bodyPart, duration) {
  return function (rolls) {
    return MML.processRoll(player, MML.attributeCheckRoll('Disabling Wound System Strength Roll', character.systemStrength))
      .then(function(result) {
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
        rolls.disablingWoundRoll = result;
        return rolls;
      });
  };
};

MML.knockdownRoll = function knockdownRoll(player, character) {
  return function (rolls) {
    return MML.processRoll(player, MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0]))
      .then(function(result) {
        if (result === 'Failure') {
          character.movementType = 'Prone';
        } else {
          MML.addStatusEffect(character, 'Stumbling', {
            startingRound: state.MML.GM.currentRound
          });
        }
        rolls.knockdownRoll = result;
        return rolls;
      });
  };
};

MML.sensitiveAreaRoll = function sensitiveAreaRoll(player, character) {
  return function (rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Sensitive Area Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.processRoll(player, MML.attributeCheckRoll('Sensitive Area Willpower Roll', character.willpower));
      })
      .then(function(result) {
        if (result === 'Failure') {
          MML.addStatusEffect(character, 'Sensitive Area', {
            startingRound: state.MML.GM.currentRound
          });
        }
        rolls.sensitiveAreaRoll = result;
        return rolls;
      });
    };
};

MML.fatigueCheckRoll = function fatigueCheckRoll(player, character) {
  return function (rolls) {
    return MML.processRoll(player, MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0]))
      .then(function(roll) {
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
        rolls.fatigueCheckRoll = result;
        return rolls;
      });
  };
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

module.exports = MML;
