MML.rollDice = function rollDice(amount, size) {
  switch (state.MML.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Promise.resolve(Array(amount)
        .fill()
        .map(() => randomInteger(size))
        .reduce((sum, value) => sum + value, 0));
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
  return modifiers.reduce((sum, value) => sum + value, 0);
};

MML.processRoll = function processRoll(player) {
  return function (roll) {
    // console.log("GRASS TASTES BAD");
    // console.log(roll);
    if (player.name === state.MML.GM.name) {
      MML.displayGmRoll(player, roll);
    } else {
      MML.displayPlayerRoll(player, roll);
    }
    return MML.setRollButtons(player)
    .then(function(player) {
      if (player.pressedButton === 'acceptRoll') {
        return roll.result;
      } else {
        return MML.processRoll(player)(MML.changeRoll(player, roll, player.pressedButton.replace('changeRoll ', '')));
      }
    });
  };
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

MML.universalRoll = function universalRoll(player, name, modifiers) {
  return MML.rollDice(1, 100)
    .then(function(value) {
      return MML.universalRollResult({
        type: 'universal',
        name: name,
        range: '1-100',
        value: value,
        target: MML.sumModifiers(modifiers),
        modifiers: modifiers
      });
    })
    .then(MML.processRoll(player));
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
    .then(function(value) {
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
    .then(function(value) {
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

MML.genericRoll = function genericRoll(player, name, diceString, modifiers) {
  var dice = MML.parseDice(diceString);
  var amount = dice.amount;
  var size = dice.size;
  var modifier = MML.sumModifiers(modifiers);
  var range = (amount + modifier).toString() + '-' + ((amount * size) + modifier).toString();
  return MML.rollDice(amount, size)
    .then(function(value) {
      return MML.genericRollResult({
        type: 'generic',
        name: name,
        range: range,
        value: value,
        modifier: modifier,
        modifiers: modifiers
      });
    })
    .then(MML.processRoll(player));
};

MML.genericRollResult = function genericRollResult(roll) {
  roll.result = roll.value + roll.modifier;
  roll.message = 'Roll: ' + roll.value +
    '\nModifier: ' + roll.modifier +
    '\nResult: ' + roll.result +
    '\nRange: ' + roll.range;
  return roll;
};

MML.initiativeRoll = function initiativeRoll(player, character) {
  var modifiers = [character.situationalInitBonus,
    character.movementRatioInitBonus,
    character.attributeInitBonus,
    character.senseInitBonus,
    character.fomInitBonus,
    character.firstActionInitBonus,
    character.actionInitCostMod,
    character.spentInitiative];

  return MML.genericRoll(player, 'initiative', '1d10', modifiers)
    .then(function(value) {
      character.initiativeRollValue = value;
      MML.setReady(character, true);
      return player;
    });
};

MML.meleeAttackRoll = function meleeAttackRoll(player, character, task, skill) {
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Attack Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.universalRoll(player, 'meleeAttack', [
          character.situationalMod,
          character.meleeAttackMod,
          character.attributeMeleeAttackMod,
          task,
          skill
        ]);
      })
      .then(function(result) {
        rolls.meleeAttackRoll = result;
        if (result === 'Failure' || result === 'Critical Failure') {
          throw rolls;
        }
        return rolls;
      });
  };
};

MML.defenseRoll = function defenseRoll(player, name, modifiers, rolls) {
  return MML.universalRoll(player, name, modifiers)
    .then(function(result) {
      rolls.meleeDefenseRoll = result;
      if (result === 'Success' || result === 'Critical Success') {
        throw rolls;
      }
      return rolls;
    });
};

MML.meleeDefenseRoll = function meleeDefenseRoll(player, character, attackerWeapon) {
  return function (rolls) {
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
    return MML.chooseMeleeDefense(player, character, dodgeMods, blockMods, attackerWeapon)
      .then(function (defense) {
        return MML.defenseRoll(player, defense.name, defense.modifiers, rolls);
      });
  };
};

MML.meleeDamageRoll = function meleeDamageRoll(player, character, weapon, attackRoll, bonusDamage) {
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Damage Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.damageRoll('Melee Damage Roll', weapon.damage, weapon.damageType, [character.meleeDamageMod, bonusDamage || 0], attackRoll);
      })
      .then(MML.processRoll(player))
      .then(function(result) {
        rolls.meleeDamageRoll = result;
        return rolls;
      });
  };
};

MML.missileAttackRoll = function missileAttackRoll(player, character, target, weapon, skill) {
  return function(rolls) {
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

    return function(rolls) {
      return MML.goToMenu(player, { message: character.name + '\'s Attack Roll', buttons: ['Roll'] })
        .then(function(player) {
          return MML.missileAttackRoll(player, MML.universalRoll(player, 'missileAttack', mods));
        })
        .then(function(result) {
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
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Damage Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.damageRoll('Missile Damage Roll', weapon.damage, weapon.damageType, [bonusDamage || 0], rolls.attackRoll);
      })
      .then(MML.processRoll(player))
      .then(function(result) {
        rolls.missileDamageRoll = result;
        return rolls;
      });
  };
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

MML.woundFatigueRoll = function woundFatigueRoll(player, character) {
  return function(rolls) {
    return MML.attributeCheckRoll('Wound Fatigue Roll', character.systemStrength)
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.attributeCheckRoll('Major Wound Willpower Roll', character.willpower)
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.attributeCheckRoll('Disabling Wound System Strength Roll', character.systemStrength)
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0])
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Sensitive Area Roll', buttons: ['Roll'] })
      .then(function(player) {
        return MML.attributeCheckRoll('Sensitive Area Willpower Roll', character.willpower);
      })
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.attributeCheckRoll('Knockdown System Strength Roll', character.systemStrength, [_.has(character.statusEffects, 'Fatigue') ? -4 : 0])
      .then(MML.processRoll(player))
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
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Hit Position Roll', buttons: ['Roll'] })
      .then(function(player) {
        var rollValue;
        var range;
        var rangeUpper;
        var result;
        var accepted;
        var hitPositions;
        var hitPositionIndex;

        if (_.contains(action.modifiers, 'Called Shot Specific') && !_.contains(action.modifiers, 'Near Miss')) {
          hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === action.calledShot;
          }));
          return MML.getHitPosition(target, hitPositionIndex);
        } else {
          if (_.contains(action.modifiers, 'Called Shot Specific') || _.contains(action.modifiers, 'Near Miss')) {
            var bodyPart = MML.hitPositions[target.bodyType][hitPositionIndex].bodyPart;
            hitPositions = MML.getAvailableHitPositions(target, bodyPart);
            rangeUpper = hitPositions.length;
            range = '1-' + rangeUpper;
            calledShot = true;
          } else if (_.contains(action.modifiers, 'Called Shot')) {
            hitPositions = MML.getAvailableHitPositions(target, action.calledShot);
            rangeUpper = hitPositions.length;
            range = '1-' + rangeUpper;
            calledShot = true;
          } else {
            hitPositions = MML.hitPositions[target.bodyType];
            rangeUpper = 100;
            range = '1-' + hitPositions.length;
            calledShot = false;
          }
          return MML.rollDice(1, rangeUpper)
            .then(function(value) {
              return MML.hitPositionRollResult({
                type: 'hitPosition',
                calledShot: calledShot,
                range: hitPositions.length,
                hitPositions: hitPositions,
                target: target,
                value: value
              });
            })
            .then(MML.processHitPositionRoll(player))
            .then(function(result) {
              rolls.hitPositionRoll = result;
              return rolls;
            });
        }
      });
  };
};

MML.processHitPositionRoll = function processHitPositionRoll(player) {
  return function (roll) {
    if (player.name === state.MML.GM.name) {
      MML.displayGmRoll(player, roll);
    } else {
      MML.displayPlayerRoll(player, roll);
    }
    return MML.setRollButtons(player)
    .then(function(player) {
      if (player.pressedButton === 'acceptRoll') {
        return roll.result;
      } else {
        return MML.processHitPositionRoll(player)(MML.changeRoll(player, roll, player.pressedButton.replace('changeRoll ', '')));
      }
    });
  };
};

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
  }

  roll.message = 'Roll: ' + roll.value +
    '\nResult: ' + roll.result.name +
    '\nRange: ' + roll.range;
  return roll;
};

MML.hitPositionRoll = function hitPositionRoll(player, target, action) {
  return function(rolls) {
    return MML.goToMenu(player, { message: character.name + '\'s Hit Position Roll', buttons: ['Roll'] })
      .then(function(player) {
        var rollValue;
        var range;
        var rangeUpper;
        var result;
        var accepted;
        var hitPositions;
        var hitPositionIndex;

        if (_.contains(action.modifiers, 'Called Shot Specific')) {
          return MML.calledShotSpecificRoll(target, action.calledShot, rolls);
        } else if (_.contains(action.modifiers, 'Called Shot')) {
          return MML.calledShotRoll(target, action.calledShot, rolls);
        } else {

          hitPositions = MML.hitPositions[target.bodyType];
          rangeUpper = 100;
          range = '1-' + hitPositions.length;
          calledShot = false;
        }
          return MML.rollDice(1, rangeUpper)
            .then(function(value) {
              return MML.hitPositionRollResult({
                type: 'hitPosition',
                calledShot: calledShot,
                range: hitPositions.length,
                hitPositions: hitPositions,
                target: target,
                value: value
              });
            })
            .then(MML.processHitPositionRoll(player))
            .then(function(result) {
              rolls.hitPositionRoll = result;
              return rolls;
            });
      });
  };
};

MML.calledShotSpecificRoll = function calledShotSpecificRoll(target, calledShot, rolls) {
  var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
    return hitPosition.name === calledShot;
  }));
  rolls.hitPositionRoll = MML.getHitPosition(target, hitPositionIndex);
  return rolls;
};

MML.calledShotRoll = function calledShotRoll(target, calledShot, rolls) {
  var hitPositions = MML.getAvailableHitPositions(target, calledShot);
  var rangeUpper = hitPositions.length;
  var range = '1-' + rangeUpper;
  return MML.rollDice(1, rangeUpper)
    .then(function(value) {
      return MML.calledShotRollResult({
        type: 'hitPosition',
        range: range,
        hitPositions: hitPositions,
        target: target,
        value: value
      });
    })
    .then(MML.processCalledShotRoll(player))
    .then(function(result) {
      rolls.hitPositionRoll = result;
      return rolls;
    });
};
