MML.newRoundUpdate = async function newRoundUpdate(character) {
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
  MML.updateCharacter(character);
  MML.setReady(character, false);
  return character;
};

MML.setAction = function setAction(character, action) {
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
    _.each(action.modifiers, function(modifier) {
      MML.addStatusEffect(character, modifier, {
        ts: action.ts,
        startingRound: state.MML.GM.currentRound
      });
    });
  }
  character.action = action;
};

MML.displayMovement = function displayMovement(character) {
  var token = MML.getCharacterToken(character.id);
  var path = getObj('path', character.pathID);

  if (!_.isUndefined(path)) {
    path.remove();
  }
  var pathID = MML.drawCirclePath(token.get('left'), token.get('top'), MML.movementRates[character.race][character.movementType] * character.movementAvailable).id;
  character.pathID = pathID;
};

MML.moveDistance = function moveDistance(character, distance) {
  var remainingMovement = character.movementAvailable - (distance) / (MML.movementRates[character.race][character.movementType]);
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

MML.setReady = function setReady(character, ready) {
  if (state.MML.GM.inCombat && !ready) {
    MML.getCharacterToken(character.id).set('tint_color', '#FF0000');
  } else {
    MML.getCharacterToken(character.id).set('tint_color', 'transparent');
  }
  character.ready = ready;
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
      await MML.goToMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
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
      await MML.goToMenu(player, character.name + '\'s Disabling Wound Roll', ['Roll']);
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

  _.each(MML.getBodyParts(character), function(bodyPart) {
    if (currentHP[bodyPart] >= Math.round(character.hpMax[bodyPart] / 2)) { //Only minor wounds apply
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - currentHP[bodyPart];
    } else {
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - Math.round(character.hpMax[bodyPart] / 2);
    }
  });

  if (currentHP['Wound Fatigue'] < 0 && !_.has(character.statusEffects, 'Wound Fatigue')) {
    await MML.goToMenu(player, character.name + '\'s Wound Fatigue Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.systemStrength);
    if (result === 'Failure') {
      MML.addStatusEffect(character, 'Wound Fatigue', {});
    }
  }
};

MML.knockdownCheck = async function knockdownCheck(player, character, damage) {
  character.knockdown += damage;
  if (character.movementType !== 'Prone' && character.knockdown < 1) {
    await MML.goToMenu(player, character.name + '\'s Knockdown Roll', ['Roll']);
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
    await MML.goToMenu(player, character.name + '\'s Sensitive Area Roll', ['Roll']);
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
    await MML.goToMenu(player, 'Armor Coverage Roll', ['Roll']);
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

  MML.addStatusEffect(character, 'Melee This Round', {});

  if (!MML.isUnarmed(character) &&
    _.isEmpty(_.intersection(_.keys(character.statusEffects), [
      'Stunned',
      'Holding',
      'Grappled',
      'Held',
      'Taken Down',
      'Pinned',
      'Overborne'
    ]))
  ) {
    return MML.grappleDefenseRoll(character.name, brawlMods);
  } else {
    var characterWeaponInfo = MML.getCharacterWeaponAndSkill(character);
    character.player.charMenuGrappleDefenseRoll(
      character.name,
      brawlChance,
      characterWeaponInfo.characterWeapon.task + characterWeaponInfo.skill + character.situationalMod + character.meleeAttackMod + character.attributeMeleeAttackMod
    );
  }
};

MML.grappleHandler = function grappleHandler(character, defender, attackName) {
  switch (attackName) {
    case 'Grapple':
      character.applyGrapple(defender);
      break;
    case 'Place a Hold, Head, Arm, Leg':
      character.applyHold(defender);
      break;
    case 'Place a Hold, Chest, Abdomen':
      character.applyHold(defender);
      break;
    case 'Break a Hold':
      character.applyHoldBreak(defender);
      break;
    case 'Break Grapple':
      character.applyGrappleBreak(defender);
      break;
    case 'Takedown':
      character.applyTakedown(defender);
      break;
    case 'Regain Feet':
      character.applyRegainFeet(defender);
      break;
    default:
      sendChat('Error', 'Unhappy grapple :(');
  }
  MML.applyStatusEffects(character);
  MML.applyStatusEffects(defender);
  MML.endAction();
};

MML.applyGrapple = function applyGrapple(character, defender) {
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(defender.statusEffects, 'Holding')) {
    character.applyHoldBreak(MML.characters[defender.statusEffects['Holding'].targets[0]], defender);
  }
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
};

MML.applyHold = function applyHold(character, defender) {
  if (_.has(character.statusEffects, 'Grappled')) {
    character.removeStatusEffect('Grappled');
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
    var holder = {
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
      defender.removeStatusEffect('Grappled');
    } else {
      defender.statusEffects['Grappled'] = {
        id: defender.statusEffects['Grappled'].id,
        name: 'Grappled',
        targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
      };
    }
  }
};

MML.applyHoldBreak = function applyHoldBreak(character, defender) {
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
  defender.removeStatusEffect('Holding');
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : MML.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(character.statusEffects, 'Held')) {
    if (character.statusEffects['Held'].targets.length === 1) {
      character.removeStatusEffect('Held');
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
      character.removeStatusEffect('Pinned');
    } else {
      character.statusEffects['Pinned'] = {
        id: character.statusEffects['Pinned'].id,
        name: 'Pinned',
        targets: _.without(character.statusEffects['Pinned'].targets, defender.id)
      };
    }
  }
};

MML.applyGrappleBreak = function applyGrappleBreak(character, defender) {
  if (character.statusEffects['Grappled'].targets.length === 1) {
    character.removeStatusEffect('Grappled');
  } else {
    character.statusEffects['Grappled'] = {
      id: character.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(character.statusEffects['Grappled'].targets, defender.id)
    };
  }
  if (defender.statusEffects['Grappled'].targets.length === 1) {
    defender.removeStatusEffect('Grappled');
  } else {
    defender.statusEffects['Grappled'] = {
      id: defender.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
    };
  }
};

MML.applyTakedown = function applyTakedown(character, defender) {
  var grapplers = _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets : [];
  var holders = _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].targets : [];
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
    var targets = [];
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
        defender.removeStatusEffect('Held');
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
  var grapplers = _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets : [];
  var holders = _.has(character.statusEffects, 'Held') ? character.statusEffects['Held'].targets : [];

  if (holders.length > 0) {
    var targets = [];
    _.each(holders, function(target) {
      target.movementType = 'Walk';
    });
  }
  if (grapplers.length > 0) {
    _.each(grapplers, function(target) {
      target.movementType = 'Walk';
    });
  }
  character.removeStatusEffect('Taken Down');
  character.removeStatusEffect('Overborne');
  character.movementType = 'Walk';
};

MML.releaseHold = function releaseHold(character, defender) {
  defender.applyHoldBreak(character);
  defender.player.charMenuResistRelease(defender.name, character, defender);
  defender.player.displayMenu();
};

MML.releaseGrapple = function releaseGrapple(character, defender) {
  character.applyGrappleBreak(defender, character);
  MML.characters[character.id].action.modifiers = _.without(MML.characters[character.id].action.modifiers, 'Release Opponent');
  character.startAction();
};

MML.criticalDefense = function criticalDefense(character) {
  MML.endAction();
};

MML.forgoDefense = function forgoDefense(character, rollName) {
  state.MML.GM.currentAction.rolls[rollName] = 'Failure';
  MML[state.MML.GM.currentAction.callback]();
};

MML.equipmentFailure = function equipmentFailure(character) {
  log('equipmentFailure');
};

MML.applyStatusEffects = function applyStatusEffects(character) {
  var dependents = [
    'situationalInitBonus',
    'situationalMod',
    'missileDefenseMod',
    'meleeDefenseMod',
    'missileAttackMod',
    'meleeAttackMod',
    'castingMod',
    'perceptionCheckMod'
  ];
  _.each(dependents, function(dependent) {
    character[dependent] = 0;
  }, character);
  _.each(character.statusEffects, function(effect, index) {
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

  var regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
  var statusEffectIDs = _.pluck(character.statusEffects, 'id');
  var statusEffects = filterObjs(function(obj) {
    if (obj.get('type') !== 'attribute' || obj.get('characterid') !== character.id) {
      return false;
    } else {
      return regex.test(obj.get('name'));
    }
  });
  var attributestoDelete = _.filter(statusEffects, function(effect) {
    var notFound = true;
    _.each(statusEffectIDs, function(id) {
      if (_.isString(effect.get('name', 'current')) && effect.get('name', 'current').indexOf(id) > -1) {
        notFound = false;
      }
    });
    return notFound;
  });
  _.each(attributestoDelete, function(attribute) {
    attribute.remove();
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
  var items = _.omit(character.inventory, 'emptyHand');
  _.each(items, function(item, _id) {
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemName', item.name);
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemId', _id);
  }, character);
  items.emptyHand = {
    type: 'empty',
    weight: 0
  };
  character.inventory = items;
};

MML.updateCharacterSheet = function updateCharacterSheet(character) {
  // _.each(character, function(value, attribute) {
  //   if (typeof(value) === 'object') {
  //     value = JSON.stringify(value);
  //   }
  //   MML.setCurrentAttribute(character.id, attribute, value);
  // });
};

MML.updateCharacter = function updateCharacter(character) {
  MML.applyStatusEffects(character);
  MML.updateInventory(character);
  MML.updateCharacterSheet(character);
};

MML.setPlayer = function setPlayer(character) {
  var playerName = MML.getCurrentAttribute(character.id, 'player');
  var newPlayer = MML.getPlayerFromName(playerName);
  if (_.isUndefined(newPlayer)) {
    sendChat('GM', 'Player ' + playerName + ' not found.');
    newPlayer = MML.getPlayerFromName(state.MML.GM.name);
    MML.setCurrentAttribute(character.id, 'player', state.MML.GM.name);
  }
  MML.getCharFromName(character.name).set('controlledby', newPlayer.id);

  _.each(MML.players, function(player) {
    if (player.name === MML.getCurrentAttribute(character.id, 'player')) {
      player.characters.push(character);
    } else {
      player.characters = _.reject(player.characters, otherCharacter => otherCharacter.id !== character.id);
    }
  }, character);
};

MML.isSensitiveArea = function isSensitiveArea(position) {
  return [2, 6, 33].includes(position);
};

MML.getWeaponFamily = function getWeaponFamily(character, hand) {
  var item = character.inventory[character[hand]._id];
  if (!_.isUndefined(item) && item.type === 'weapon') {
    return item.grips[character[hand].grip].family;
  } else {
    return 'unarmed';
  }
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

MML.getShieldDefenseBonus = function getShieldDefenseBonus(character) {
  var rightHand = character.inventory[character.rightHand._id];
  var leftHand = character.inventory[character.leftHand._id];
  var bonus = 0;

  if (!_.isUndefined(rightHand) && rightHand.type === 'shield') {
    bonus = rightHand.defenseMod;
  }
  if (!_.isUndefined(leftHand) && leftHand.type === 'shield' && leftHand.defenseMod > rightHand.defenseMod) {
    bonus = leftHand.defenseMod;
  }
  return bonus;
};

MML.getWeaponGrip = function getWeaponGrip(character) {
  if (character['rightHand'].grip !== 'unarmed') {
    return character['rightHand'].grip;
  } else if (character['leftHand'].grip !== 'unarmed') {
    return character['leftHand'].grip;
  } else {
    return 'unarmed';
  }
};

MML.getEquippedWeapon = function getEquippedWeapon(character) {
  var grip = MML.getWeaponGrip(character);
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

MML.buildWeaponObject = function buildWeaponObject(item, grip) {
  var weapon = {
    _id: item._id,
    name: item.name,
    type: 'weapon',
    weight: item.weight,
    family: item.grips[grip].family,
    hands: item.grips[grip].hands
  };

  if (['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].indexOf(weapon.family)) {
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

MML.getCharacterWeaponAndSkill = function getCharacterWeaponAndSkill(character) {
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

MML.getWeaponSkill = function getWeaponSkill(character, weapon) {
  var item = weapon;
  var grip;
  var skillName;
  var skill;

  if (item.type !== 'weapon') {
    log('Not a weapon');
    MML.error();
  }

  grip = MML.getWeaponGrip(character);

  if (item.name === 'War Spear' || item.name === 'Boar Spear' || item.name === 'Military Fork' || item.name === 'Bastard Sword') {
    skillName = item.name + ', ' + grip;
  } else {
    skillName = item.name;
  }

  if (typeof character.weaponSkills[skillName] !== 'undefined') {
    skill = character.weaponSkills[skillName].level;
  } else {
    var relatedSkills = [];
    _.each(character.weaponSkills, function(relatedSkill, skillName) {
      if (skillName !== 'Default Martial') {
        _.each(MML.items[skillName.replace(', ' + grip, '')].grips, function(skillFamily) {
          if (skillFamily.family === item.grips[grip].family) {
            relatedSkills.push(relatedSkill);
          }
        });
      }
    }, character);

    if (relatedSkills.length === 0) {
      skill = character.weaponSkills['Default Martial'].level;
    } else {
      skill = _.max(relatedSkills, function(skill) {
        return skill.level;
      }).level - 10;
    }
  }
  return skill;
};

MML.isWieldingRangedWeapon = function isWieldingRangedWeapon(character) {
  return MML.isWieldingMissileWeapon(character) || MML.isWieldingThrowingWeapon(character);
};

MML.isWieldingMissileWeapon = function isWieldingMissileWeapon(character) {
  var leftFamily = MML.getWeaponFamily(character, 'leftHand');
  var rightFamily = MML.getWeaponFamily(character, 'rightHand');
  var rangedFamilies = ['MWD', 'MWM'];
  return (rangedFamilies.indexOf(leftFamily) > -1 || rangedFamilies.indexOf(rightFamily) > -1);
};

MML.isWieldingThrowingWeapon = function isWieldingThrowingWeapon(character) {
  var leftFamily = MML.getWeaponFamily(character, 'leftHand');
  var rightFamily = MML.getWeaponFamily(character, 'rightHand');
  var rangedFamilies = ['TWH', 'TWK', 'TWS', 'SLI'];
  return (rangedFamilies.indexOf(leftFamily) > -1 || rangedFamilies.indexOf(rightFamily) > -1);
};

MML.isRangedWeapon = function isRangedWeapon(weapon) {
  return ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].indexOf(weapon.family) > -1;
};

MML.isUnarmed = function isUnarmed(character) {
  var leftHand = MML.getWeaponFamily(character, 'leftHand');
  var rightHand = MML.getWeaponFamily(character, 'rightHand');

  if (leftHand === 'unarmed' && rightHand === 'unarmed') {
    return true;
  } else {
    return false;
  }
};

MML.isDualWielding = function isDualWielding(character) {
  var leftHand = MML.getWeaponFamily(character, 'leftHand');
  var rightHand = MML.getWeaponFamily(character, 'rightHand');

  if (character.leftHand._id !== character.rightHand._id &&
    leftHand !== 'unarmed' &&
    rightHand !== 'unarmed') {
    return true;
  } else {
    return false;
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
    return MML.hitPositions[character.bodyType][MML.hitTables[character.bodyType][character.hitTable][rollValue]];
  }
};

MML.getHitTable = function getHitTable(character) {
  var table;
  switch (character.bodyType) {
    case 'humanoid':
      if (character.inventory[character.rightHand._id].type === 'shield' || character.inventory[character.leftHand._id].type === 'shield') {
        table = 'C';
      } else if (MML.isWieldingRangedWeapon(character) || MML.isUnarmed(character) || !(character.inventory[character.leftHand._id].type === 'weapon' && character.inventory[character.rightHand._id].type === 'weapon')) {
        table = 'A';
      } else {
        table = 'B';
      }
      break;
    default:
      log('Error: Body type not found');
      table = 'Error: Body type not found';
      break;
  }
  return table;
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
    return _.chain(MML.hitPositions[character.bodyType]).pluck('bodyPart').uniq().value();
  }
};

MML.getBodyPart = function getBodyPart(character, hitPosition) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.findWhere(MML.hitPositions[character.bodyType], {name: hitPosition});
  }
};

MML.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
  var availableHitPositions = _.where(MML.hitPositions[character.bodyType], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return 'Error: No hit positions found';
  } else {
    return availableHitPositions;
  }
};

MML.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
  var availableHitPositions = MML.getAvailableHitPositions(character, bodyPart);
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

MML.buildHpAttribute = function buildHpAttribute(character) {
  var hpAttribute;
  switch (character.bodyType) {
    case 'humanoid':
      hpAttribute = {
        'Wound Fatigue': Math.round((character.health + character.stature + character.willpower) / 2),
        'Head': MML.HPTables[character.race][Math.round(character.health + character.stature / 3)],
        'Chest': MML.HPTables[character.race][Math.round(character.health + character.stature + character.strength)],
        'Abdomen': MML.HPTables[character.race][Math.round(character.health + character.stature)],
        'Left Arm': MML.HPTables[character.race][Math.round(character.health + character.stature)],
        'Right Arm': MML.HPTables[character.race][Math.round(character.health + character.stature)],
        'Left Leg': MML.HPTables[character.race][Math.round(character.health + character.stature)],
        'Right Leg': MML.HPTables[character.race][Math.round(character.health + character.stature)],
      };
      break;
    default:
      log('Oh No!');
  }
  return hpAttribute;
};

MML.getDistanceBetweenCharacters = function getDistanceBetweenCharacters(character, target) {
  var charToken = MML.getCharacterToken(character.id);
  var targetToken = MML.getCharacterToken(target.id);

  return MML.pixelsToFeet(MML.getDistanceBetweenTokens);
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
  var targets = [];
  _.each(MML.characters, function(character) {
    var charToken = MML.getCharacterToken(character.id);
    if (!_.isUndefined(charToken) && MML.getDistanceFeet(charToken.get('left'), left, charToken.get('top'), top) < MML.raceSizes[character.race].radius + MML.pixelsToFeet(radius)) {
      targets.push(character.id);
    }
  });
  return targets;
};

MML.getCharactersWithinRectangle = function getCharactersWithinRectangle(leftOriginal, topOriginal, width, height, rotation) {
  var targets = [];

  _.each(MML.characters, function(character) {
    var charToken = MML.getCharacterToken(character.id);
    var tokenCoordinates = MML.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    var tokenRadius = MML.feetToPixels(MML.raceSizes[character.race].radius);

    if (!_.isUndefined(charToken) &&
      tokenCoordinates[0] + tokenRadius > width / -2 &&
      tokenCoordinates[0] - tokenRadius < width / 2 &&
      tokenCoordinates[1] - tokenRadius < height / 2 &&
      tokenCoordinates[1] + tokenRadius > height / -2
    ) {
      targets.push(character.id);
    }
  });
  return targets;
};

MML.getCharactersWithinTriangle = function getCharactersWithinTriangle(leftOriginal, topOriginal, width, height, rotation) {
  var targets = [];

  _.each(MML.characters, function(character) {
    var charToken = MML.getCharacterToken(character.id);
    var tokenCoordinates = MML.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    var tokenRadius = MML.feetToPixels(MML.raceSizes[character.race].radius);
    var ax = (-width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    var ay = tokenCoordinates[1];
    var bx = tokenCoordinates[0];
    var by = ((-2 * height * tokenCoordinates[0]) / width) + (height / 2);
    var cx = (width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    var cy = tokenCoordinates[1];
    var dx = tokenCoordinates[0];
    var dy = ((2 * height * tokenCoordinates[0]) / width) + (height / 2);

    if (!_.isUndefined(charToken) &&
      tokenCoordinates[1] - tokenRadius < height / 2 &&
      tokenCoordinates[1] + tokenRadius > height / -2 &&
      ((MML.getDistance(ax, tokenCoordinates[0], ay, tokenCoordinates[1]) * MML.getDistance(bx, tokenCoordinates[0], by, tokenCoordinates[1])) / MML.getDistance(ax, bx, ay, by) < tokenRadius ||
        (MML.getDistance(cx, tokenCoordinates[0], cy, tokenCoordinates[1]) * MML.getDistance(dx, tokenCoordinates[0], dy, tokenCoordinates[1])) / MML.getDistance(cx, dx, cy, dy) < tokenRadius ||
        (tokenCoordinates[0] < ax && tokenCoordinates[0] > cx))
    ) {
      targets.push(character.id);
    }
  });
  return targets;
};

MML.getMagicSkill = function getMagicSkill(character, spell) {
  if (['Fire', 'Earth', 'Water', 'Air', 'Life'].indexOf(spell.family)) {
    var wizardry_skill = 0;
    var elementalism_skill = 0;
    if (!_.isUndefined(character.skills['Wizardry'])) {
      wizardry_skill = character.skills['Wizardry'].level;
    }
    switch (spell.family) {
      case 'Fire':
        if (!_.isUndefined(character.skills['Fire Elementalism'])) {
          elementalism_skill = character.skills['Fire Elementalism'].level;
        }
        if (!_.isUndefined(character.skills['Lore: Element of Fire']) && character.skills['Lore: Element of Fire'].level > 19) {
          wizardry_skill -= 10;
        } else {
          wizardry_skill -= 20;
        }
        if (wizardry_skill > elementalism_skill) {
          return {
            name: 'Wizardry',
            level: wizardry_skill
          };
        } else {
          return {
            name: 'Fire Elementalism',
            level: elementalism_skill
          };
        }
      case 'Earth':
        if (!_.isUndefined(character.skills['Earth Elementalism'])) {
          elementalism_skill = character.skills['Earth Elementalism'].level;
        }
        if (!_.isUndefined(character.skills['Lore: Element of Earth']) && character.skills['Lore: Element of Earth'].level > 19) {
          wizardry_skill -= 10;
        } else {
          wizardry_skill -= 20;
        }
        if (wizardry_skill > elementalism_skill) {
          return {
            name: 'Wizardry',
            level: wizardry_skill
          };
        } else {
          return {
            name: 'Earth Elementalism',
            level: elementalism_skill
          };
        }
      case 'Water':
        if (!_.isUndefined(character.skills['Water Elementalism'])) {
          elementalism_skill = character.skills['Water Elementalism'].level;
        }
        if (!_.isUndefined(character.skills['Lore: Element of Water']) && character.skills['Lore: Element of Water'].level > 19) {
          wizardry_skill -= 10;
        } else {
          wizardry_skill -= 20;
        }
        if (wizardry_skill > elementalism_skill) {
          return {
            name: 'Wizardry',
            level: wizardry_skill
          };
        } else {
          return {
            name: 'Water Elementalism',
            level: elementalism_skill
          };
        }
      case 'Air':
        if (!_.isUndefined(character.skills['Air Elementalism'])) {
          elementalism_skill = character.skills['Air Elementalism'].level;
        }
        if (!_.isUndefined(character.skills['Lore: Element of Air']) && character.skills['Lore: Element of Air'].level > 19) {
          wizardry_skill -= 10;
        } else {
          wizardry_skill -= 20;
        }
        if (wizardry_skill > elementalism_skill) {
          return {
            name: 'Wizardry',
            level: wizardry_skill
          };
        } else {
          return {
            name: 'Air Elementalism',
            level: elementalism_skill
          };
        }
      case 'Life':
        if (!_.isUndefined(character.skills['Life Elementalism'])) {
          elementalism_skill = character.skills['Life Elementalism'].level;
        }
        if (!_.isUndefined(character.skills['Lore: Element of Life']) && character.skills['Lore: Element of Life'].level > 19) {
          wizardry_skill -= 10;
        } else {
          wizardry_skill -= 20;
        }
        if (wizardry_skill > elementalism_skill) {
          return {
            name: 'Wizardry',
            level: wizardry_skill
          };
        } else {
          return {
            name: 'Life Elementalism',
            level: elementalism_skill
          };
        }
      default:
    }
  } else if (spell.family === 'Symbolism') {
    return {
      name: 'Symbolism',
      level: character.skills['Symbolism'].level
    };
  } else {
    return {
      name: 'Wizardry',
      level: character.skills['Wizardry'].level
    };
  }
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

MML.getModifiedCastingChance = function getModifiedCastingChance() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;

  return currentAction.parameters.casterSkill +
    currentAction.parameters.spell.task +
    character.situationalMod +
    character.castingMod +
    character.attributeCastingMod +
    _.reduce(_.pluck(currentAction.parameters.metaMagic, 'castingMod'), function(memo, num) { return memo + num; });
};

MML.getModifiedEpCost = function getModifiedEpCost() {
  log(state.MML.GM.currentAction.parameters.metaMagic);
  log(state.MML.GM.currentAction.parameters);
  return _.reduce(_.pluck(state.MML.GM.currentAction.parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }, 1) * state.MML.GM.currentAction.parameters.epCost;
};

MML.getAoESpellModifier = function getAoESpellModifier(spellMarker, spell) {
  var area;
  var areaModified;
  var epMod = 0;
  var castingMod;

  if (typeof spell.target === 'string' && spell.target.indexOf('\' Radius')) {
    area = Math.pow(parseInt(spell.target.replace('\' Radius', '')), 2);
    areaModified = Math.pow(MML.pixelsToFeet(spellMarker.get('width') / 2), 2);
    castingMod = Math.round(Math.log2(MML.pixelsToFeet(spellMarker.get('width') / 2) / parseInt(spell.target.replace('\' Radius', ''))) * 20);
  } else {
    area = spell.target[0] * spell.target[1];
    areaModified = spellMarker.get('width') * spellMarker.get('height');
    castingMod = Math.round(Math.log2(spellMarker.get('width') / spell.target[0]) * 10 + Math.log2(spellMarker.get('height') / spell.target[1]) * 10);
  }

  if (areaModified > area) {
    epMod = Math.pow(areaModified / area, 2);
  }
  if (castingMod > 0) {
    castingMod = 0;
  }
  return { epMod: epMod, castingMod: castingMod };
};

MML.getRangeCastingModifier = function getRangeCastingModifier(caster, targets, spell) {
  var mod = 0;
  if (['Caster', 'Touch', 'Single'].indexOf(spell.target) === -1) {
    var distance = MML.getDistanceBetweenTokens(MML.getCharacterToken(caster.id), MML.getSpellMarkerToken(spell.name));
    if (distance > spell.range) {
      mod += Math.round(((spell.range - distance) / distance) * 10);
    }
  } else {
    _.each(targets, function(target) {
      var distance = MML.getDistanceBetweenCharacters(caster, target);
      if (spell.range === 'Caster' && target.id !== caster.id) {
        mod += -10;
      }
      if (spell.range === 'Caster' || spell.range === 'Touch') {
        if (distance > MML.weaponRanks[1].high) {
          mod += MML.weaponRanks[1].high - distance;
        }
      } else {
        if (distance > spell.range) {
          mod += Math.round(((spell.range - distance) / distance) * 10);
        }
      }
    });
  }
  return mod;
};

MML.removeAimAndObserving = function removeAimAndObserving(character) {
  if (_.has(character.statusEffects, 'Taking Aim')) {
    character.removeStatusEffect('Taking Aim');
  }
  if (_.has(character.statusEffects, 'Observing')) {
    character.removeStatusEffect('Observing');
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

// Character Creation
MML.createCharacter = function (name, id) {
  var characterProxy = new Proxy(MML.Character(name, id), {
    set: function(character, prop, value) {
      character[prop] = value;
      if (typeof(value) === 'object') {
        value = JSON.stringify(value);
      }
      MML.setCurrentAttribute(character.id, prop, value);
      return true;
    },
    get: function (character, prop) {
      return character[prop];
    }
  });
  return characterProxy;
};

MML.Character = function (name, id) {
  var character = {};
  Object.defineProperty(character, 'name', {
    value: name,
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'id', {
    get: function() {
      return id;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'player', {
    get: function() {
      return MML.players[MML.getCurrentAttribute(character.id, 'player')];
    },
    enumerable: false
  });
  Object.defineProperty(character, 'race', {
    get: function() {
      return MML.getCurrentAttribute(character.id, 'race');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'bodyType', {
    get: function() {
      var value = MML.bodyTypes[character.race];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'gender', {
    get: function() {
      return MML.getCurrentAttribute(character.id, 'gender');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'height', {
    get: function() {
      var value = MML.statureTables[character.race][character.gender][MML.getCurrentAttributeAsFloat(character.id, 'statureRoll')].height;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'weight', {
    get: function() {
      var value = MML.statureTables[character.race][character.gender][MML.getCurrentAttributeAsFloat(character.id, 'statureRoll')].weight;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'handedness', {
    get: function() {
      return MML.getCurrentAttribute(character.id, 'handedness');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'stature', {
    get: function() {
      var value = MML.statureTables[character.race][character.gender][MML.getCurrentAttributeAsFloat(character.id, 'statureRoll')].stature;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'strength', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].strength + MML.getCurrentAttributeAsFloat(character.id, 'strengthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'coordination', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].coordination + MML.getCurrentAttributeAsFloat(character.id, 'coordinationRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'health', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].health + MML.getCurrentAttributeAsFloat(character.id, 'healthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'beauty', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].beauty + MML.getCurrentAttributeAsFloat(character.id, 'beautyRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'intellect', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].intellect + MML.getCurrentAttributeAsFloat(character.id, 'intellectRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'reason', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].reason + MML.getCurrentAttributeAsFloat(character.id, 'reasonRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'creativity', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].creativity + MML.getCurrentAttributeAsFloat(character.id, 'creativityRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'presence', {
    get: function() {
      var value = MML.racialAttributeBonuses[character.race].presence + MML.getCurrentAttributeAsFloat(character.id, 'presenceRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'willpower', {
    get: function() {
      var value = Math.round((2 * character.presence + character.health) / 3);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'perception', {
    get: function() {
      var value = Math.round((character.intellect + character.reason + character.creativity) / 3) + MML.racialAttributeBonuses[character.race].perception;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'systemStrength', {
    get: function() {
      var value = Math.round((character.presence + 2 * character.health) / 3);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'fitness', {
    get: function() {
      var value = Math.round((character.health + character.strength) / 2) + MML.racialAttributeBonuses[character.race].fitness;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'fitnessMod', {
    get: function() {
      var value = MML.fitnessModLookup[character.fitness];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'load', {
    get: function() {
      var value = Math.round(character.stature * character.fitnessMod) + MML.racialAttributeBonuses[character.race].load;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'overhead', {
    get: function() {
      var value = character.load * 2;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'deadLift', {
    get: function() {
      var value = character.load * 4;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'hpMax', {
    get: function() {
      var value = MML.buildHpAttribute(character);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'hp', {
    value: _.isUndefined(getAttrByName(character.id, 'hp', 'current')) ? MML.buildHpAttribute(character) : MML.getCurrentAttributeJSON(character.id, 'hp'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'evocation', {
    get: function() {
      return [character.intellect,
        character.reason,
        character.creativity,
        character.health,
        character.willpower,
        MML.racialAttributeBonuses[character.race].evocation]
        .reduce((sum, value) => sum + value, 0);
    },
    enumerable: true
  });
  Object.defineProperty(character, 'epMax', {
    get: function() {
      var value = character.evocation;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'ep', {
    value: _.isUndefined(getAttrByName(character.id, 'ep', 'current')) ? character.evocation : MML.getCurrentAttributeAsFloat(character.id, 'ep'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'fatigueMax', {
    get: function() {
      var value = character.fitness;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'fatigue', {
    value: isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'fatigue'))) ? character.fitness : MML.getCurrentAttributeAsFloat(character.id, 'fatigue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'hpRecovery', {
    get: function() {
      var value = MML.recoveryMods[character.health].hp;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'epRecovery', {
    get: function() {
      var value = MML.recoveryMods[character.health].ep;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'inventory', {
    value: _.isUndefined(getAttrByName(character.id, 'inventory', 'current')) ? {
      emptyHand: {
        type: 'empty',
        weight: 0
      }
    } : MML.getCurrentAttributeJSON(character.id, 'inventory'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'totalWeightCarried', {
    get: function() {
      var value = _.reduce(_.pluck(character.inventory, 'weight'), function(total, weight) {
        return total + weight;
      }, 0);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'knockdownMax', {
    get: function() {
      var value = Math.round(character.stature + (character.totalWeightCarried / 10));
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'knockdown', {
    value: isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'knockdown'))) ? character.knockdownMax : MML.getCurrentAttributeAsFloat(character.id, 'knockdown'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'armorProtectionValues', {
    get: function() {
      var bodyType = character.bodyType;
      var armor = [];
      _.each(
        character.inventory,
        function(item) {
          if (item.type === 'armor') {
            armor.push(item);
          }
        },
        character);

      var apvMatrix = {};
      // Initialize APV Matrix
      _.each(MML.hitPositions[bodyType], function(position) {
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

      _.each(armor, function(piece) {
        var material = MML.APVList[piece.material];

        _.each(piece.protection, function(protection) {
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
      _.each(apvMatrix, function(position, positionName) {
        _.each(position, function(rawAPVArray, type) {
          var apvFinalArray = [];
          var coverageArray = [];

          //Creates an array of armor coverage in ascending order.
          _.each(rawAPVArray, function(armorProtectionValues) {
            if (coverageArray.indexOf(armorProtectionValues.coverage) === -1) {
              coverageArray.push(armorProtectionValues.coverage);
            }
          });
          coverageArray = coverageArray.sort(function(a, b) {
            return a - b;
          });

          //Creates APV array per damage type per position
          _.each(coverageArray, function(apvCoverage) {
            var apvToLayerArray = [];
            var apvValue = 0;

            //Builds an array of APVs that meet or exceed the coverage value
            _.each(rawAPVArray, function(armorProtectionValues) {
              if (armorProtectionValues.coverage >= apvCoverage) {
                apvToLayerArray.push(armorProtectionValues.value);
              }
            });
            apvToLayerArray = apvToLayerArray.sort(function(a, b) {
              return b - a;
            });

            //Adds the values at coverage value with diminishing returns on layered armor
            _.each(apvToLayerArray, function(value, index) {
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
    },
    enumerable: false
  });
  Object.defineProperty(character, 'leftHand', {
    value: _.isEmpty(MML.getCurrentAttributeJSON(character.id, 'leftHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : MML.getCurrentAttributeJSON(character.id, 'leftHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'rightHand', {
    value: _.isEmpty(MML.getCurrentAttributeJSON(character.id, 'rightHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : MML.getCurrentAttributeJSON(character.id, 'rightHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'hitTable', {
    get: function() {
      var value = MML.getHitTable(character);
      return value;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'movementRatio', {
    get: function() {
      var movementRatio;

      if (character.totalWeightCarried === 0) {
        movementRatio = Math.round(10 * character.load) / 10;
      } else {
        movementRatio = Math.round(10 * character.load / character.totalWeightCarried) / 10;
      }

      if (movementRatio > 4.0) {
        movementRatio = 4.0;
      }
      return movementRatio;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'movementAvailable', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'movementAvailable'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'movementType', {
    value: MML.getCurrentAttribute(character.id, 'movementType'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'pathID', {
    get: function() {
      return MML.getCurrentAttribute(character.id, 'pathID');
    }
  });
  Object.defineProperty(character, 'situationalMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'situationalMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeDefenseMod', {
    get: function() {
      var value = MML.attributeMods.strength[character.strength] + MML.attributeMods.coordination[character.coordination];
      return value;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'meleeDefenseMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'meleeDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'missileDefenseMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'missileDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'meleeAttackMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'meleeAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeMeleeAttackMod', {
    get: function() {
      var value = MML.attributeMods.strength[character.strength] + MML.attributeMods.coordination[character.coordination];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'meleeDamageMod', {
    get: function() {
      var value = _.find(MML.meleeDamageMods, function(mod) {
        return character.load >= mod.low && character.load <= mod.high;
      }, character).value;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'missileAttackMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'missileAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeMissileAttackMod', {
    get: function() {
      var value = MML.attributeMods.perception[character.perception] + MML.attributeMods.coordination[character.coordination] + MML.attributeMods.strength[character.strength];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'castingMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'castingMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeCastingMod', {
    get: function() {
      var attributeCastingMod = MML.attributeMods.reason[character.reason];

      if (character.senseInitBonus > 2) {} else if (character.senseInitBonus > 0) {
        attributeCastingMod -= 10;
      } else if (character.senseInitBonus > -2) {
        attributeCastingMod -= 20;
      } else {
        attributeCastingMod -= 30;
      }

      if (character.fomInitBonus === 3 || character.fomInitBonus === 2) {
        attributeCastingMod -= 5;
      } else if (character.fomInitBonus === 1) {
        attributeCastingMod -= 10;
      } else if (character.fomInitBonus === 0) {
        attributeCastingMod -= 15;
      } else if (character.fomInitBonus === -1) {
        attributeCastingMod -= 20;
      } else if (character.fomInitBonus === -2) {
        attributeCastingMod -= 30;
      }
      return attributeCastingMod;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'spellLearningMod', {
    get: function() {
      var value = MML.attributeMods.intellect[character.intellect];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'statureCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'statureCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'strengthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'strengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'coordinationCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'coordinationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'healthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'healthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'beautyCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'beautyCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'intellectCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'intellectCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'reasonCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'reasonCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'creativityCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'creativityCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'presenceCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'presenceCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'willpowerCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'willpowerCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'evocationCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'evocationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'perceptionCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'perceptionCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'systemStrengthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'systemStrengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'fitnessCheckMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'fitnessCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'statusEffects', {
    value: MML.getCurrentAttributeJSON(character.id, 'statusEffects'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'initiative', {
    get: function() {
      var value;
      var initiative = character.initiativeRollValue +
        character.situationalInitBonus +
        character.movementRatioInitBonus +
        character.attributeInitBonus +
        character.senseInitBonus +
        character.fomInitBonus +
        character.firstActionInitBonus +
        character.spentInitiative;
      if (initiative < 0 || state.MML.GM.roundStarted === false || character.situationalInitBonus === 'No Combat' || character.movementRatioInitBonus === 'No Combat') {
        value = 0;
      } else {
        value = initiative;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'initiativeRollValue', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'initiativeRollValue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'situationalInitBonus', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'situationalInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'actionInitCostMod', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'actionInitCostMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'movementRatioInitBonus', {
    get: function() {
      var value;

      if (character.movementRatio < 0.6) {
        value = 'No Combat';
      } else if (character.movementRatio === 0.6) {
        value = -4;
      } else if (character.movementRatio < 0.7 && character.movementRatio <= 0.8) {
        value = -3;
      } else if (character.movementRatio > 0.8 && character.movementRatio <= 1.0) {
        value = -2;
      } else if (character.movementRatio > 1.0 && character.movementRatio <= 1.2) {
        value = -1;
      } else if (character.movementRatio > 1.2 && character.movementRatio <= 1.4) {
        value = 0;
      } else if (character.movementRatio > 1.4 && character.movementRatio <= 1.7) {
        value = 1;
      } else if (character.movementRatio > 1.7 && character.movementRatio <= 2.0) {
        value = 2;
      } else if (character.movementRatio > 2.0 && character.movementRatio <= 2.5) {
        value = 3;
      } else if (character.movementRatio > 2.5 && character.movementRatio <= 3.2) {
        value = 4;
      } else if (character.movementRatio > 3.2) {
        value = 5;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'attributeInitBonus', {
    get: function() {
      var value;
      var attributeArray = [character.strength, character.coordination, character.reason, character.perception];
      var rankingAttribute = attributeArray.sort(function(a, b) {
        return a - b;
      })[0];

      if (rankingAttribute <= 9) {
        value = -1;
      } else if (rankingAttribute === 10 || rankingAttribute === 11) {
        value = 0;
      } else if (rankingAttribute === 12 || rankingAttribute === 13) {
        value = 1;
      } else if (rankingAttribute === 14 || rankingAttribute === 15) {
        value = 2;
      } else if (rankingAttribute === 16 || rankingAttribute === 17) {
        value = 3;
      } else if (rankingAttribute === 18 || rankingAttribute === 19) {
        value = 4;
      } else if (rankingAttribute >= 20) {
        value = 5;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'senseInitBonus', {
    get: function() {
      var value;
      var armorList = _.where(character.inventory, {
        type: 'armor'
      });
      var bitsOfHelm = ['Barbute Helm', 'Bascinet Helm', 'Camail', 'Camail-Conical', 'Cap', 'Cheeks', 'Conical Helm', 'Duerne Helm', 'Dwarven War Hood', 'Face Plate', 'Great Helm', 'Half-Face Plate', 'Hood', 'Nose Guard', 'Pot Helm', 'Sallet Helm', 'Throat Guard', 'War Hat'];
      var senseArray = [];

      _.each(bitsOfHelm, function(bit) {
        _.each(armorList, function(piece) {
          if (piece.name.indexOf(bit) !== -1) {
            senseArray.push(bit);
          }
        });
      });

      //nothing on head
      if (senseArray.length === 0) {
        value = 4;
      } else {
        //Head fully encased in metal
        if (senseArray.indexOf('Great Helm') !== -1 || (senseArray.indexOf('Sallet Helm') !== -1 && senseArray.indexOf('Throat Guard') !== -1)) {
          value = -2;
        }
        //wearing a helm
        else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Cap', 'Pot Helm', 'Conical Helm', 'War Hat']).length > 0) {
          //Has faceplate
          if (senseArray.indexOf('Face Plate') !== -1) {
            //Enclosed Sides
            if (_.intersection(senseArray, ['Barbute Helm', 'Bascinet Helm', 'Duerne Helm']).length > 0) {
              value = -2;
            } else {
              value = -1;
            }
          }
          //These types of helms or half face plate
          else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Half-Face Plate']).length > 0) {
            value = 0;
          }
          //has camail or cheeks
          else if (_.intersection(senseArray, ['Camail', 'Camail-Conical', 'Cheeks']).length > 0) {
            value = 1;
          }
          //Wearing a hood
          else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
            _.each(armorList, function(piece) {
              if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
                if (piece.family === 'Cloth') {
                  value = 2;
                } else {
                  value = 1;
                }
              }
            });
          }
          //has nose guard
          else if (senseArray.indexOf('Nose Guard') !== -1) {
            value = 2;
          }
          // just a cap
          else {
            value = 3;
          }
        }
        //Wearing a hood
        else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
          _.each(armorList, function(piece) {
            if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
              if (piece.family === 'Cloth') {
                value = 2;
              } else {
                value = 1;
              }
            }
          });
        }
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'fomInitBonus', {
    get: function() {
      return MML.getCurrentAttributeAsFloat(character.id, 'fomInitBonus');
    },
    enumerable: true
  });
  Object.defineProperty(character, 'firstActionInitBonus', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'firstActionInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'spentInitiative', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'spentInitiative'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'actionTempo', {
    get: function() {
      var tempo;

      if (_.isUndefined(character.action.skill) || character.action.skill < 30) {
        tempo = 0;
      } else if (character.action.skill < 40) {
        tempo = 1;
      } else if (character.action.skill < 50) {
        tempo = 2;
      } else if (character.action.skill < 60) {
        tempo = 3;
      } else if (character.action.skill < 70) {
        tempo = 4;
      } else {
        tempo = 5;
      }

      // If Dual Wielding
      if (character.action.name === 'Attack' && MML.isDualWielding(character)) {
        var twfSkill = character.weaponskills['Two Weapon Fighting'].level;
        if (twfSkill > 19 && twfSkill) {
          tempo += 1;
        } else if (twfSkill >= 40 && twfSkill < 60) {
          tempo += 2;
        } else if (twfSkill >= 60) {
          tempo += 3;
        }
        // If Dual Wielding identical weapons
        if (character.inventory[character.leftHand._id].name === character.inventory[character.rightHand._id].name) {
          tempo += 1;
        }
      }
      var value = MML.attackTempoTable[tempo];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'ready', {
    value: MML.getCurrentAttributeAsBool(character.id, 'ready'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'action', {
    value: MML.getCurrentAttributeJSON(character.id, 'action'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'previousAction', {
    value: MML.getCurrentAttributeJSON(character.id, 'previousAction'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'roundsRest', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'roundsRest'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'roundsExertion', {
    value: MML.getCurrentAttributeAsFloat(character.id, 'roundsExertion'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'skills', {
    get: function() {
      var characterSkills = MML.getSkillAttributes(character.id, 'skills');
      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;
          var attribute = MML.skills[skillName].attribute;

          level += MML.attributeMods[attribute][character[attribute]];

          if (_.isUndefined(MML.skillMods[character.race]) === false && _.isUndefined(MML.skillMods[character.race][skillName]) === false) {
            level += MML.skillMods[character.race][skillName];
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
    enumerable: false
  });
  Object.defineProperty(character, 'weaponSkills', {
    get: function() {
      var characterSkills = MML.getSkillAttributes(character.id, "weaponskills");
      var highestSkill;

      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;

          // This may need to include other modifiers
          if (_.isUndefined(MML.weaponSkillMods[character.race]) === false && _.isUndefined(MML.weaponSkillMods[character.race][skillName]) === false) {
            level += MML.weaponSkillMods[character.race][skillName];
          }
          characterSkill.level = level;
        },
        character
      );

      highestSkill = _.max(characterSkills, function(skill) {
        return skill.level;
      }).level;
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
        function(characterSkill, skillName) {
          MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
          MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
          MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
        },
        character
      );
      return characterSkills;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'fov', {
    get: function() {
      var value;
      switch (character.senseInitBonus) {
        case 4:
          value = 180;
          break;
        case 3:
          value = 170;
          break;
        case 2:
          value = 160;
          break;
        case 1:
          value = 150;
          break;
        case 0:
          value = 140;
          break;
        case -1:
          value = 130;
          break;
        case -2:
          value = 120;
          break;
        default:
          value = 180;
          break;
      }
      return value;
    }
  });
  Object.defineProperty(character, 'spells', {
    get: function() {
      return MML.getCurrentAttributeAsArray(character.id, 'spells');
    }
  });
  return character;
};
