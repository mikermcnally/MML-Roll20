SoS.newRoundUpdate = async function newRoundUpdate(character) {
  if (_.has(character.statusEffects, 'Melee This Round')) {
    var fatigueRate = 1;
    if (_.has(character.statusEffects, 'Pinned')) {
      fatigueRate = 2;
    }
    character.roundsExertion += fatigueRate;
    character.roundsRest = 0;

    if (!_.has(character.statusEffects, 'Fatigue')) {
      if (character.roundsExertion > character.fitness) {
        await SoS.fatigueCheck(player, character);
      }
    } else {
      if (character.roundsExertion > Math.round(character.fitness / 2)) {
        await SoS.fatigueCheck(player, character);
      }
    }
  } else if (_.has(character.statusEffects, 'Fatigue') || character.roundsExertion > 0) {
    character.roundsRest++;
    if (character.roundsRest > 5) {
      await SoS.fatigueRecovery(player, character);
    }
  }

  // Reset knockdown number
  character.knockdown = character.knockdownMax;
  character.spentInitiative = 0;

  character.action = {
    ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
    modifiers: [],
    weapon: SoS.getEquippedWeapon(character)
  };
  if (_.has(character.statusEffects, 'Observing')) {
    SoS.addStatusEffect(character, 'Observed', {
      startingRound: state.SoS.GM.currentRound
    });
  }
  SoS.updateCharacter(character);
  SoS.setReady(character, false);
  return character;
};

SoS.setAction = function setAction(character, action) {
  var initBonus = 10;
  if (action.name === 'Attack' || action.name === 'Aim') {
    if (SoS.isUnarmedAction(action) || action.weapon === 'unarmed') {
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
      action.skill = SoS.getWeaponSkill(character, action.weapon);
    }
  } else if (action.name === 'Cast') {
    var skillInfo = SoS.getMagicSkill(character, action.spell);
    action.skill = skillInfo.level;
    action.skillName = skillInfo.name;
  }
  if (state.SoS.GM.roundStarted === false) {
    character.firstActionInitBonus = initBonus;
  }

  if (_.isUndefined(character.previousAction) || character.previousAction.ts !== action.ts) {
    _.each(action.modifiers, function(modifier) {
      SoS.addStatusEffect(character, modifier, {
        ts: action.ts,
        startingRound: state.SoS.GM.currentRound
      });
    });
  }
  character.action = action;
};

SoS.displayMovement = function displayMovement(character) {
  var token = SoS.getCharacterToken(character.id);
  var path = getObj('path', character.pathID);

  if (!_.isUndefined(path)) {
    path.remove();
  }
  var pathID = SoS.drawCirclePath(token.get('left'), token.get('top'), SoS.movementRates[character.race][character.movementType] * character.movementAvailable).id;
  character.pathID = pathID;
};

SoS.moveDistance = function moveDistance(character, distance) {
  var remainingMovement = character.movementAvailable - (distance) / (SoS.movementRates[character.race][character.movementType]);
  if (character.movementAvailable > 0) {
    character.movementAvailable = remainingMovement;
    SoS.displayMovement(character);
  } else {
    var path = getObj('path', character.pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
  }
};

SoS.setReady = function setReady(character, ready) {
  if (state.SoS.GM.inCombat && !ready) {
    SoS.getCharacterToken(character.id).set('tint_color', '#FF0000');
  } else {
    SoS.getCharacterToken(character.id).set('tint_color', 'transparent');
  }
  character.ready = ready;
};

SoS.setCombatVision = function setCombatVision(character) {
  var token = SoS.getCharacterToken(character.id);
  if (state.SoS.GM.inCombat || !_.has(character.statusEffects, 'Observing')) {
    token.set('light_losangle', character.fov);
    token.set('light_hassight', true);
  } else {
    token.set('light_losangle', 360);
    token.set('light_hassight', true);
  }
};

SoS.alterHP = async function alterHP(player, character, bodyPart, hpAmount) {
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
      await SoS.goToMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
      const result = await SoS.attributeCheckRoll(player, character.willpower);
      if (result === 'Failure') {
        SoS.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
          duration: duration,
          startingRound: state.SoS.GM.currentRound,
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
      await SoS.goToMenu(player, character.name + '\'s Disabling Wound Roll', ['Roll']);
      const result = await SoS.attributeCheckRoll(player, character.systemStrength);
      SoS.addStatusEffect(character, 'Disabling Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
      if (result === 'Failure') {
        if (_.has(character.statusEffects, 'Stunned')) {
          character.statusEffects['Stunned'].duration = duration;
        } else {
          SoS.addStatusEffect(character, 'Stunned', {
            startingRound: state.SoS.GM.currentRound,
            duration: duration
          });
        }
      }
    } else if (currentHP < -maxHP) { //Mortal wound
      SoS.addStatusEffect(character, 'Mortal Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
    }
  } else { //if healing
    character.hp[bodyPart] += hpAmount;
    if (character.hp[bodyPart] > maxHP) {
      character.hp[bodyPart] = maxHP;
    }
  }
  await SoS.setWoundFatigue(player, character);
};

SoS.setWoundFatigue = async function setWoundFatigue(player, character) {
  const currentHP = character.hp;
  currentHP['Wound Fatigue'] = character.hpMax['Wound Fatigue'];

  _.each(SoS.getBodyParts(character), function(bodyPart) {
    if (currentHP[bodyPart] >= Math.round(character.hpMax[bodyPart] / 2)) { //Only minor wounds apply
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - currentHP[bodyPart];
    } else {
      currentHP['Wound Fatigue'] -= character.hpMax[bodyPart] - Math.round(character.hpMax[bodyPart] / 2);
    }
  });

  if (currentHP['Wound Fatigue'] < 0 && !_.has(character.statusEffects, 'Wound Fatigue')) {
    await SoS.goToMenu(player, character.name + '\'s Wound Fatigue Roll', ['Roll']);
    const result = await SoS.attributeCheckRoll(player, character.systemStrength);
    if (result === 'Failure') {
      SoS.addStatusEffect(character, 'Wound Fatigue', {});
    }
  }
};

SoS.knockdownCheck = async function knockdownCheck(player, character, damage) {
  character.knockdown += damage;
  if (character.movementType !== 'Prone' && character.knockdown < 1) {
    await SoS.goToMenu(player, character.name + '\'s Knockdown Roll', ['Roll']);
    const result = await SoS.attributeCheckRoll(player, character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0])
    if (result === 'Failure') {
      character.movementType = 'Prone';
    } else {
      SoS.addStatusEffect(character, 'Stumbling', {
        startingRound: state.SoS.GM.currentRound
      });
    }
  }
};

SoS.sensitiveAreaCheck = async function sensitiveAreaCheck(player, character, hitPosition) {
  if (SoS.sensitiveAreas[character.bodyType].includes(hitPosition)) {
    await SoS.goToMenu(player, character.name + '\'s Sensitive Area Roll', ['Roll']);
    const result = await SoS.attributeCheckRoll(player, character.willpower);
    if (result === 'Failure') {
      SoS.addStatusEffect(character, 'Sensitive Area', {
        startingRound: state.SoS.GM.currentRound
      });
    }
  }
};

SoS.damageCharacter = async function damageCharacter(player, character, damage, type, hitPosition) {
  const reducedDamage = await SoS.armorDamageReduction(player, character, hitPosition.name, damage, type);
  await SoS.alterHP(player, character, hitPosition.bodyPart, reducedDamage);
  await SoS.sensitiveAreaCheck(player, character, hitPosition.name);
  await SoS.knockdownCheck(player, character, damage);
};

SoS.alterEP = async function alterEP(player, character, epAmount) {
  character.ep += epAmount;
  if (character.ep < Math.round(0.25 * character.epMax)) {
    await SoS.fatigueCheck(player, character);
  }
};

SoS.armorDamageReduction = async function armorDamageReduction(player, character, position, damage, type) {
  const positionApvs = character.armorProtectionValues[position];
  const baseApvs = positionApvs[type];
  const impactApvs = positionApvs['Impact'];
  var apvBase;
  var apvImpact;
  if (baseApvs.length > 1) {
    await SoS.goToMenu(player, 'Armor Coverage Roll', ['Roll']);
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

SoS.equipmentFailure = function equipmentFailure(character) {
  log('equipmentFailure');
};

SoS.applyStatusEffects = function applyStatusEffects(character) {
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
  _.each(dependents, function(dependent) {
    character[dependent] = 0;
  }, character);
  _.each(character.statusEffects, function(effect, index) {
    if (index.indexOf('Major Wound') !== -1) {
      SoS.statusEffects['Major Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Disabling Wound') !== -1) {
      SoS.statusEffects['Disabling Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Mortal Wound') !== -1) {
      SoS.statusEffects['Mortal Wound'].apply(character, [effect, index]);
    } else {
      SoS.statusEffects[index].apply(character, [effect, index]);
    }
    SoS.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectName', index);
    SoS.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectDescription', (effect.description ? effect.description : ''));
  });

  const regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
  const statusEffectIDs = _.pluck(character.statusEffects, 'id');
  const statusEffects = filterObjs(function(obj) {
    if (obj.get('type') !== 'attribute' || obj.get('characterid') !== character.id) {
      return false;
    } else {
      return regex.test(obj.get('name'));
    }
  });
  _.each(statusEffects, function(attribute) {
    const name = attribute.get('name', 'current');
    if (_.isString(name) && !statusEffectIDs.some(id => name.includes(id))) {
      attribute.remove();
    }
  });
};

SoS.addStatusEffect = function addStatusEffect(character, index, effect) {
  effect.id = SoS.generateRowID();
  effect.name = index;
  character.statusEffects[index] = effect;
  SoS.applyStatusEffects(character);
};

SoS.removeStatusEffect = function removeStatusEffect(character, index) {
  if (!_.isUndefined(character.statusEffects[index])) {
    delete character.statusEffects[index];
    SoS.applyStatusEffects(character);
  }
};

SoS.updateInventory = function updateInventory(character) {
  const items = _.omit(character.inventory, 'emptyHand');
  _.each(items, function(item, _id) {
    SoS.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemName', item.name);
    SoS.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemId', _id);
  }, character);
  items.emptyHand = {
    type: 'empty',
    weight: 0
  };
  character.inventory = items;
};

SoS.updateCharacterSheet = function updateCharacterSheet(character) {
  // _.each(character, function(value, attribute) {
  //   if (typeof(value) === 'object') {
  //     value = JSON.stringify(value);
  //   }
  //   SoS.setCurrentAttribute(character.id, attribute, value);
  // });
};

SoS.updateCharacter = function updateCharacter(character) {
  SoS.applyStatusEffects(character);
  SoS.updateInventory(character);
  SoS.updateCharacterSheet(character);
};

SoS.setPlayer = function setPlayer(character) {
  const playerName = SoS.getCurrentAttribute(character.id, 'player');
  var newPlayer = SoS.getPlayerFromName(playerName);
  if (_.isUndefined(newPlayer)) {
    sendChat('GM', 'Player ' + playerName + ' not found.');
    newPlayer = SoS.getPlayerFromName(state.SoS.GM.name);
    SoS.setCurrentAttribute(character.id, 'player', state.SoS.GM.name);
  }
  SoS.getCharFromName(character.name).set('controlledby', newPlayer.id);

  _.each(SoS.players, function(player) {
    if (player.name === SoS.getCurrentAttribute(character.id, 'player')) {
      player.characters.push(character);
    } else {
      player.characters = _.reject(player.characters, otherCharacter => otherCharacter.id !== character.id);
    }
  });
};

SoS.isSensitiveArea = function isSensitiveArea(position) {
  return [2, 6, 33].includes(position);
};

SoS.getWeaponFamily = function getWeaponFamily(character, hand) {
  const item = character.inventory[character[hand]._id];
  if (!_.isUndefined(item) && item.type === 'weapon') {
    return item.grips[character[hand].grip].family;
  } else {
    return 'unarmed';
  }
};

SoS.equipItem = function equipItem(character, itemId, grip) {
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

SoS.getShieldDefenseBonus = function getShieldDefenseBonus(character) {
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

SoS.getWeaponGrip = function getWeaponGrip(character) {
  if (character['rightHand'].grip !== 'unarmed') {
    return character['rightHand'].grip;
  } else if (character['leftHand'].grip !== 'unarmed') {
    return character['leftHand'].grip;
  } else {
    return 'unarmed';
  }
};

SoS.getEquippedWeapon = function getEquippedWeapon(character) {
  const grip = SoS.getWeaponGrip(character);
  var weapon;
  var item;
  var itemId;

  if (SoS.isUnarmed(character)) {
    return 'unarmed';
  } else if (character['rightHand'].grip !== 'unarmed') {
    itemId = character.rightHand._id;
    item = character.inventory[itemId];
  } else {
    itemId = character.leftHand._id;
    item = character.inventory[itemId];
  }
  return SoS.buildWeaponObject(item, grip);
};

SoS.buildWeaponObject = function buildWeaponObject(item, grip) {
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

SoS.getWeaponAndSkill = function getWeaponAndSkill(character) {
  var itemId;
  var grip;

  if (SoS.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
    itemId = character.rightHand._id;
    grip = character.rightHand.grip;
  } else {
    itemId = character.leftHand._id;
    grip = character.leftHand.grip;
  }
  var item = character.inventory[itemId];
  var characterWeapon = SoS.buildWeaponObject(item, grip);

  if (!SoS.isRangedWeapon(characterWeapon)) {
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
    skill: SoS.getWeaponSkill(character, item)
  };
};

SoS.getWeaponSkill = function getWeaponSkill(character, weapon) {
  var item = weapon;
  var skill;

  if (item.type !== 'weapon') {
    log('Not a weapon');
    SoS.error();
  }

  const grip = SoS.getWeaponGrip(character);
  const skillName = item.name + ['War Spear', 'Boar Spear', 'Military Fork', 'Bastard Sword'].includes(item.name) ? ', ' + grip : '';

  if (_.has(character.weaponSkills, skillName)) {
    return character.weaponSkills[skillName].level;
  } else {
    var relatedSkills = [];
    _.each(character.weaponSkills, function(relatedSkill, skillName) {
      if (skillName !== 'Default Martial') {
        _.each(SoS.items[skillName.replace(', ' + grip, '')].grips, function(skillFamily) {
          if (skillFamily.family === item.grips[grip].family) {
            relatedSkills.push(relatedSkill);
          }
        });
      }
    }, character);

    if (relatedSkills.length === 0) {
      return character.weaponSkills['Default Martial'].level;
    } else {
      return _.max(relatedSkills, function(skill) {
        return skill.level;
      }).level - 10;
    }
  }
};

SoS.isWieldingRangedWeapon = function isWieldingRangedWeapon(character) {
  return SoS.isWieldingMissileWeapon(character) || SoS.isWieldingThrowingWeapon(character);
};

SoS.isWieldingMissileWeapon = function isWieldingMissileWeapon(character) {
  return SoS.isWieldingWeaponFamily(character, ['MWD', 'MWM']);
};

SoS.isWieldingThrowingWeapon = function isWieldingThrowingWeapon(character) {
  return SoS.isWieldingWeaponFamily(character, ['TWH', 'TWK', 'TWS', 'SLI']);
};

SoS.isWieldingWeaponFamily = function isWieldingWeaponFamily(character, families) {
  return families.includes(SoS.getWeaponFamily(character, 'rightHand')) || rangedFamilies.includes(SoS.getWeaponFamily(character, 'leftHand'));
};

SoS.isRangedWeapon = function isRangedWeapon(weapon) {
  return ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].includes(weapon.family);
};

SoS.isUnarmed = function isUnarmed(character) {
  return SoS.getWeaponFamily(character, 'leftHand') === 'unarmed' && SoS.getWeaponFamily(character, 'rightHand') === 'unarmed';
};

SoS.isDualWielding = function isDualWielding(character) {
  const leftHand = SoS.getWeaponFamily(character, 'leftHand');
  const rightHand = SoS.getWeaponFamily(character, 'rightHand');
  return character.leftHand._id !== character.rightHand._id && leftHand !== 'unarmed' && rightHand !== 'unarmed';
};

SoS.hasStatusEffects = function hasStatusEffects(character, effects) {
  return !_.isEmpty(_.intersection(_.keys(character.statusEffects), effects));
};

SoS.getHitPosition = function getHitPosition(character, rollValue) {
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (rollValue < 1 || rollValue > 100) {
    return 'Error: Value out of range';
  } else {
    return SoS.hitPositions[character.bodyType][SoS.hitTables[character.bodyType][character.hitTable][rollValue]];
  }
};

SoS.getHitTable = function getHitTable(character) {
  var table;
  switch (character.bodyType) {
    case 'humanoid':
      if (character.inventory[character.rightHand._id].type === 'shield' || character.inventory[character.leftHand._id].type === 'shield') {
        return 'C';
      } else if (SoS.isWieldingRangedWeapon(character) || SoS.isUnarmed(character) || !(character.inventory[character.leftHand._id].type === 'weapon' && character.inventory[character.rightHand._id].type === 'weapon')) {
        return 'A';
      } else {
        return 'B';
      }
    default:
      log('Error: Body type not found');
      return 'Error: Body type not found';
  }
};

SoS.getHitPositionNames = function getHitPositionNames(character) {
  if (_.isUndefined(SoS.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.pluck(SoS.hitPositions[character.bodyType], 'name');
  }
};

SoS.getBodyParts = function getBodyParts(character) {
  if (_.isUndefined(SoS.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.chain(SoS.hitPositions[character.bodyType])
      .pluck('bodyPart')
      .uniq()
      .value();
  }
};

SoS.getBodyPart = function getBodyPart(character, hitPosition) {
  if (_.isUndefined(SoS.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.findWhere(SoS.hitPositions[character.bodyType], {name: hitPosition});
  }
};

SoS.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
  const availableHitPositions = _.where(SoS.hitPositions[character.bodyType], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return 'Error: No hit positions found';
  } else {
    return availableHitPositions;
  }
};

SoS.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
  const availableHitPositions = SoS.getAvailableHitPositions(character, bodyPart);
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

SoS.buildHpAttribute = function buildHpAttribute(character) {
  switch (character.bodyType) {
    case 'humanoid':
      return {
        'Wound Fatigue': Math.round((character.health + character.stature + character.willpower) / 2),
        'Head': SoS.HPTables[character.race][Math.round(character.health + character.stature / 3)],
        'Chest': SoS.HPTables[character.race][Math.round(character.health + character.stature + character.strength)],
        'Abdomen': SoS.HPTables[character.race][Math.round(character.health + character.stature)],
        'Left Arm': SoS.HPTables[character.race][Math.round(character.health + character.stature)],
        'Right Arm': SoS.HPTables[character.race][Math.round(character.health + character.stature)],
        'Left Leg': SoS.HPTables[character.race][Math.round(character.health + character.stature)],
        'Right Leg': SoS.HPTables[character.race][Math.round(character.health + character.stature)],
      };
    default:
      log('Oh No!');
  }
};

SoS.getDistanceBetweenCharacters = function getDistanceBetweenCharacters(character, target) {
  return SoS.pixelsToFeet(SoS.getDistanceBetweenTokens(SoS.getCharacterToken(character.id), SoS.getCharacterToken(target.id)));
};

SoS.getAoESpellTargets = function getAoESpellTargets(spellMarker) {
  switch (spellMarker.get('name')) {
    case 'spellMarkerCircle':
      return SoS.getCharactersWithinRadius(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width') / 2);
    case 'spellMarkerRectangle':
      return SoS.getCharactersWithinRectangle(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width'), spellMarker.get('height'), spellMarker.get('rotation'));
    case 'spellMarkerTriangle':
      return SoS.getCharactersWithinTriangle(spellMarker.get('left'), spellMarker.get('top'), spellMarker.get('width'), spellMarker.get('height'), spellMarker.get('rotation'));
    default:
  }
};

SoS.getCharactersWithinRadius = function getCharactersWithinRadius(left, top, radius) {
  return _.filter(SoS.characters, function(character) {
    const charToken = SoS.getCharacterToken(character.id);
    return !_.isUndefined(charToken) && SoS.getDistanceFeet(charToken.get('left'), left, charToken.get('top'), top) < SoS.raceSizes[character.race].radius + SoS.pixelsToFeet(radius);
  });
};

SoS.getCharactersWithinRectangle = function getCharactersWithinRectangle(leftOriginal, topOriginal, width, height, rotation) {
  return _.filter(SoS.characters, function(character) {
    const charToken = SoS.getCharacterToken(character.id);
    const tokenCoordinates = SoS.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    const tokenRadius = SoS.feetToPixels(SoS.raceSizes[character.race].radius);

    return !_.isUndefined(charToken) &&
      tokenCoordinates[0] + tokenRadius > width / -2 &&
      tokenCoordinates[0] - tokenRadius < width / 2 &&
      tokenCoordinates[1] - tokenRadius < height / 2 &&
      tokenCoordinates[1] + tokenRadius > height / -2
  });
};

SoS.getCharactersWithinTriangle = function getCharactersWithinTriangle(leftOriginal, topOriginal, width, height, rotation) {
  return _.filter(SoS.characters, function(character) {
    const charToken = SoS.getCharacterToken(character.id);
    const tokenCoordinates = SoS.rotateAxes(charToken.get('left') - leftOriginal, charToken.get('top') - topOriginal, rotation);
    const tokenRadius = SoS.feetToPixels(SoS.raceSizes[character.race].radius);
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
      ((SoS.getDistance(ax, tokenCoordinates[0], ay, tokenCoordinates[1]) * SoS.getDistance(bx, tokenCoordinates[0], by, tokenCoordinates[1])) / SoS.getDistance(ax, bx, ay, by) < tokenRadius ||
        (SoS.getDistance(cx, tokenCoordinates[0], cy, tokenCoordinates[1]) * SoS.getDistance(dx, tokenCoordinates[0], dy, tokenCoordinates[1])) / SoS.getDistance(cx, dx, cy, dy) < tokenRadius ||
        (tokenCoordinates[0] < ax && tokenCoordinates[0] > cx));
  });
};

SoS.getSkill = function getSkill(character, skill) {
  return _.isUndefined(character.skills[skill]) ? 0 : character.skills[skill].level;
};

SoS.getMagicSkill = function getMagicSkill(character, spell) {
  const family = spell.family;
  if (['Fire', 'Earth', 'Water', 'Air', 'Life'].includes(spell.family)) {
    const wizardry_skill = SoS.getSkill(character, 'Wizardry') - (SoS.getSkill(character, 'Lore: Element of ' + family) > 19 ? 10 : 20);
    const elementalism_skill = SoS.getSkill(character, family + ' Elementalism');
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
      level: SoS.getSkill(character, 'Symbolism')
    };
  } else {
    return {
      name: 'Wizardry',
      level: SoS.getSkill(character, 'Wizardry')
    };
  }
};

SoS.getElementalSkill = function getElementalSkill(character, element) {

};

SoS.getEpCost = function getEpCost(skillName, skillLevel, ep) {
  skillName = skillName.replace(/(Earth|Air|Fire|Water|Life)\s/, '');
  if (skillLevel < 6) {
    return SoS.epModifiers[skillName][ep][0];
  } else if (skillLevel < 11) {
    return SoS.epModifiers[skillName][ep][1];
  } else if (skillLevel < 16) {
    return SoS.epModifiers[skillName][ep][2];
  } else if (skillLevel < 21) {
    return SoS.epModifiers[skillName][ep][3];
  } else if (skillLevel < 26) {
    return SoS.epModifiers[skillName][ep][4];
  } else if (skillLevel < 31) {
    return SoS.epModifiers[skillName][ep][5];
  } else if (skillLevel < 36) {
    return SoS.epModifiers[skillName][ep][6];
  } else if (skillLevel < 41) {
    return SoS.epModifiers[skillName][ep][7];
  } else if (skillLevel < 46) {
    return SoS.epModifiers[skillName][ep][8];
  } else if (skillLevel < 51) {
    return SoS.epModifiers[skillName][ep][9];
  } else if (skillLevel < 60) {
    return SoS.epModifiers[skillName][ep][10];
  } else if (skillLevel < 70) {
    return SoS.epModifiers[skillName][ep][11];
  } else {
    return SoS.epModifiers[skillName][ep][12];
  }
};

SoS.getModifiedCastingChance = function getModifiedCastingChance(character, action) {
  return [
    action.casterSkill,
    action.spell.task,
    character.situationalMod,
    character.castingMod,
    character.attributeCastingMod,
    _.reduce(_.pluck(action.metaMagic, 'castingMod'), (sum, num) => sum + num)
  ];
};

SoS.getModifiedEpCost = function getModifiedEpCost(metaMagic, epCost) {
  return _.reduce(_.pluck(metaMagic, 'epMod'), (sum, num) => sum + num, 1) * epCost;
};

SoS.getAoESpellModifier = function getAoESpellModifier(spellMarker, spell) {
  var area;
  var areaModified;
  var castingMod;

  if (typeof spell.target === 'string' && spell.target.indexOf('\' Radius')) {
    const base_radius = parseInt(spell.target.replace('\' Radius', ''));
    const modified_radius = SoS.pixelsToFeet(spellMarker.get('width') / 2);
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

SoS.getRangeCastingModifier = function getRangeCastingModifier(caster, targets, spell) {
  if (['Caster', 'Touch', 'Single'].includes(spell.target)) {
    return target.reduce(function(mod, target) {
      const distance = SoS.getDistanceBetweenCharacters(caster, target);
      if (spell.range === 'Caster' || spell.range === 'Touch') {
        const self_range_mod = spell.range === 'Caster' && target.id !== caster.id ? -10 : 0;
        if (distance > SoS.weaponRanks[1].high) {
          return mod + SoS.weaponRanks[1].high - distance + self_range_mod;
        }
      } else {
        if (distance > spell.range) {
          return mod + Math.round(((spell.range - distance) / distance) * 10);
        }
      }
    });
  } else {
    const distance = SoS.getDistanceBetweenTokens(SoS.getCharacterToken(caster.id), SoS.getSpellMarkerToken(spell.name));
    return distance > spell.range ? Math.round(((spell.range - distance) / distance) * 10) : 0;
  }
};

SoS.removeAimAndObserving = function removeAimAndObserving(character) {
  if (_.has(character.statusEffects, 'Taking Aim')) {
    SoS.removeStatusEffect(character, 'Taking Aim');
  }
  if (_.has(character.statusEffects, 'Observing')) {
    SoS.removeStatusEffect(character, 'Observing');
  }
};

SoS.validateAction = function validateAction(character) {
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
SoS.createCharacter = function (name, id) {
  var characterProxy = new Proxy(SoS.Character(name, id), {
    set: function(character, prop, value) {
      character[prop] = value;
      if (typeof(value) === 'object') {
        value = JSON.stringify(value);
      }
      SoS.setCurrentAttribute(character.id, prop, value);
      return true;
    },
    get: function (character, prop) {
      return character[prop];
    }
  });
  return characterProxy;
};

SoS.Character = function (name, id) {
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
      return SoS.players[SoS.getCurrentAttribute(character.id, 'player')];
    },
    enumerable: false
  });
  Object.defineProperty(character, 'race', {
    get: function() {
      return SoS.getCurrentAttribute(character.id, 'race');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'bodyType', {
    get: function() {
      var value = SoS.bodyTypes[character.race];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'gender', {
    get: function() {
      return SoS.getCurrentAttribute(character.id, 'gender');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'height', {
    get: function() {
      var value = SoS.statureTables[character.race][character.gender][SoS.getCurrentAttributeAsFloat(character.id, 'statureRoll')].height;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'weight', {
    get: function() {
      var value = SoS.statureTables[character.race][character.gender][SoS.getCurrentAttributeAsFloat(character.id, 'statureRoll')].weight;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'handedness', {
    get: function() {
      return SoS.getCurrentAttribute(character.id, 'handedness');
    },
    enumerable: false
  });
  Object.defineProperty(character, 'stature', {
    get: function() {
      var value = SoS.statureTables[character.race][character.gender][SoS.getCurrentAttributeAsFloat(character.id, 'statureRoll')].stature;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'strength', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].strength + SoS.getCurrentAttributeAsFloat(character.id, 'strengthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'coordination', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].coordination + SoS.getCurrentAttributeAsFloat(character.id, 'coordinationRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'health', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].health + SoS.getCurrentAttributeAsFloat(character.id, 'healthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'beauty', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].beauty + SoS.getCurrentAttributeAsFloat(character.id, 'beautyRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'intellect', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].intellect + SoS.getCurrentAttributeAsFloat(character.id, 'intellectRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'reason', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].reason + SoS.getCurrentAttributeAsFloat(character.id, 'reasonRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'creativity', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].creativity + SoS.getCurrentAttributeAsFloat(character.id, 'creativityRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'presence', {
    get: function() {
      var value = SoS.racialAttributeBonuses[character.race].presence + SoS.getCurrentAttributeAsFloat(character.id, 'presenceRoll');
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
      var value = Math.round((character.intellect + character.reason + character.creativity) / 3) + SoS.racialAttributeBonuses[character.race].perception;
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
      var value = Math.round((character.health + character.strength) / 2) + SoS.racialAttributeBonuses[character.race].fitness;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'fitnessMod', {
    get: function() {
      var value = SoS.fitnessModLookup[character.fitness];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'load', {
    get: function() {
      var value = Math.round(character.stature * character.fitnessMod) + SoS.racialAttributeBonuses[character.race].load;
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
      var value = SoS.buildHpAttribute(character);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'hp', {
    value: _.isUndefined(getAttrByName(character.id, 'hp', 'current')) ? SoS.buildHpAttribute(character) : SoS.getCurrentAttributeJSON(character.id, 'hp'),
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
        SoS.racialAttributeBonuses[character.race].evocation]
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
    value: _.isUndefined(getAttrByName(character.id, 'ep', 'current')) ? character.evocation : SoS.getCurrentAttributeAsFloat(character.id, 'ep'),
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
    value: isNaN(parseFloat(SoS.getCurrentAttribute(character.id, 'fatigue'))) ? character.fitness : SoS.getCurrentAttributeAsFloat(character.id, 'fatigue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'hpRecovery', {
    get: function() {
      var value = SoS.recoveryMods[character.health].hp;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'epRecovery', {
    get: function() {
      var value = SoS.recoveryMods[character.health].ep;
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
    } : SoS.getCurrentAttributeJSON(character.id, 'inventory'),
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
    value: isNaN(parseFloat(SoS.getCurrentAttribute(character.id, 'knockdown'))) ? character.knockdownMax : SoS.getCurrentAttributeAsFloat(character.id, 'knockdown'),
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
      _.each(SoS.hitPositions[bodyType], function(position) {
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
        var material = SoS.APVList[piece.material];

        _.each(piece.protection, function(protection) {
          var position = SoS.hitPositions[bodyType][protection.position].name;
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
    value: _.isEmpty(SoS.getCurrentAttributeJSON(character.id, 'leftHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : SoS.getCurrentAttributeJSON(character.id, 'leftHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'rightHand', {
    value: _.isEmpty(SoS.getCurrentAttributeJSON(character.id, 'rightHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : SoS.getCurrentAttributeJSON(character.id, 'rightHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'hitTable', {
    get: function() {
      var value = SoS.getHitTable(character);
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
    value: SoS.getCurrentAttributeAsFloat(character.id, 'movementAvailable'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'movementType', {
    value: SoS.getCurrentAttribute(character.id, 'movementType'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'pathID', {
    get: function() {
      return SoS.getCurrentAttribute(character.id, 'pathID');
    }
  });
  Object.defineProperty(character, 'situationalMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'situationalMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeDefenseMod', {
    get: function() {
      var value = SoS.attributeMods.strength[character.strength] + SoS.attributeMods.coordination[character.coordination];
      return value;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'meleeDefenseMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'meleeDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'missileDefenseMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'missileDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'meleeAttackMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'meleeAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeMeleeAttackMod', {
    get: function() {
      var value = SoS.attributeMods.strength[character.strength] + SoS.attributeMods.coordination[character.coordination];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'meleeDamageMod', {
    get: function() {
      var value = _.find(SoS.meleeDamageMods, function(mod) {
        return character.load >= mod.low && character.load <= mod.high;
      }, character).value;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'missileAttackMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'missileAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeMissileAttackMod', {
    get: function() {
      var value = SoS.attributeMods.perception[character.perception] + SoS.attributeMods.coordination[character.coordination] + SoS.attributeMods.strength[character.strength];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'castingMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'castingMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'attributeCastingMod', {
    get: function() {
      var attributeCastingMod = SoS.attributeMods.reason[character.reason];

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
      var value = SoS.attributeMods.intellect[character.intellect];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'statureCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'statureCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'strengthCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'strengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'coordinationCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'coordinationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'healthCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'healthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'beautyCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'beautyCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'intellectCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'intellectCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'reasonCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'reasonCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'creativityCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'creativityCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'presenceCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'presenceCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'willpowerCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'willpowerCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'evocationCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'evocationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'perceptionCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'perceptionCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'systemStrengthCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'systemStrengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'fitnessCheckMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'fitnessCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'statusEffects', {
    value: SoS.getCurrentAttributeJSON(character.id, 'statusEffects'),
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
      if (initiative < 0 || state.SoS.GM.roundStarted === false || character.situationalInitBonus === 'No Combat' || character.movementRatioInitBonus === 'No Combat') {
        value = 0;
      } else {
        value = initiative;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'initiativeRollValue', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'initiativeRollValue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'situationalInitBonus', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'situationalInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'actionInitCostMod', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'actionInitCostMod'),
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
      return SoS.getCurrentAttributeAsFloat(character.id, 'fomInitBonus');
    },
    enumerable: true
  });
  Object.defineProperty(character, 'firstActionInitBonus', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'firstActionInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'spentInitiative', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'spentInitiative'),
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
      if (character.action.name === 'Attack' && SoS.isDualWielding(character)) {
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
      var value = SoS.attackTempoTable[tempo];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(character, 'ready', {
    value: SoS.getCurrentAttributeAsBool(character.id, 'ready'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'action', {
    value: SoS.getCurrentAttributeJSON(character.id, 'action'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'previousAction', {
    value: SoS.getCurrentAttributeJSON(character.id, 'previousAction'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'roundsRest', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'roundsRest'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'roundsExertion', {
    value: SoS.getCurrentAttributeAsFloat(character.id, 'roundsExertion'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(character, 'skills', {
    get: function() {
      var characterSkills = SoS.getSkillAttributes(character.id, 'skills');
      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;
          var attribute = SoS.skills[skillName].attribute;

          level += SoS.attributeMods[attribute][character[attribute]];

          if (_.isUndefined(SoS.skillMods[character.race]) === false && _.isUndefined(SoS.skillMods[character.race][skillName]) === false) {
            level += SoS.skillMods[character.race][skillName];
          }
          if (_.isUndefined(SoS.skillMods[character.gender]) === false && _.isUndefined(SoS.skillMods[character.gender][skillName]) === false) {
            level += SoS.skillMods[character.gender][skillName];
          }
          characterSkill.level = level;
          SoS.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_name', skillName);
          SoS.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_input', characterSkill.input);
          SoS.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_level', level);
        },
        character
      );

      return characterSkills;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'weaponSkills', {
    get: function() {
      var characterSkills = SoS.getSkillAttributes(character.id, "weaponskills");
      var highestSkill;

      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;

          // This may need to include other modifiers
          if (_.isUndefined(SoS.weaponSkillMods[character.race]) === false && _.isUndefined(SoS.weaponSkillMods[character.race][skillName]) === false) {
            level += SoS.weaponSkillMods[character.race][skillName];
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
          _id: SoS.generateRowID()
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
          SoS.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
          SoS.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
          SoS.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
        },
        character
      );
      return characterSkills;
    },
    enumerable: false
  });
  Object.defineProperty(character, 'fov', {
    get: function() {
      switch (character.senseInitBonus) {
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
    }
  });
  Object.defineProperty(character, 'spells', {
    get: function() {
      return SoS.getCurrentAttributeAsArray(character.id, 'spells');
    }
  });
  return character;
};
