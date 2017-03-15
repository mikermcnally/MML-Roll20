MML.isSensitiveArea = function(position) {
  if (position === 2 || position === 6 || position === 33) {
    return true;
  } else {
    return false;
  }
};

MML.getWeaponFamily = function(character, hand) {
  var item = character.inventory[character[hand]._id];

  if (!_.isUndefined(item) && item.type === 'weapon') {
    return item.grips[character[hand].grip].family;
  } else {
    return 'unarmed';
  }
};

MML.getShieldDefenseBonus = function(character) {
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

MML.getWeaponGrip = function(character) {
  if (character['rightHand'].grip !== 'unarmed') {
    grip = character['rightHand'].grip;
  } else {
    grip = character['leftHand'].grip;
  }
  return grip;
};

MML.getEquippedWeapon = function(character) {
  var grip = MML.getWeaponGrip(character);
  var weapon;
  var item;
  var itemId;

  if (character['rightHand'].grip !== 'unarmed') {
    itemId = character.rightHand._id;
    item = character.inventory[itemId];
  } else if (character['leftHand'].grip !== 'unarmed') {
    itemId = character.leftHand._id;
    item = character.inventory[itemId];
  } else {
    return 'unarmed';
  }
  return buildWeaponObject(item, grip);
};

MML.buildWeaponObject = function (item, grip) {
  var weapon =  {
    _id: item._id,
    name: item.name,
    type: 'weapon',
    weight: item.weight,
    family: item.grips[grip].family,
    hands: item.grips[grip].hands
  };

  if (['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].indexOf(weapon.family)) {
    _.extend(weapon, item.grips[grip]);
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

MML.getCharacterWeaponAndSkill = function(character) {
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
  var characterWeapon = {
    _id: itemId,
    name: item.name,
    type: 'weapon',
    weight: item.weight,
    family: item.grips[grip].family,
    hands: item.grips[grip].hands,
    defense: item.grips[grip].defense,
    initiative: item.grips[grip].initiative,
    rank: item.grips[grip].rank
  };

  if (character.action.weaponType === 'secondary') {
    characterWeapon.damageType = item.grips[grip].secondaryType;
    characterWeapon.task = item.grips[grip].secondaryTask;
    characterWeapon.damage = item.grips[grip].secondaryDamage;
  } else {
    characterWeapon.damageType = item.grips[grip].primaryType;
    characterWeapon.task = item.grips[grip].primaryTask;
    characterWeapon.damage = item.grips[grip].primaryDamage;
  }

  return {
    characterWeapon: characterWeapon,
    skill: MML.getWeaponSkill(character, item)
  };
};

MML.getWeaponSkill = function(character, weapon) {
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

MML.isWieldingRangedWeapon = function(character) {
  var leftFamily = MML.getWeaponFamily(character, 'leftHand');
  var rightFamily = MML.getWeaponFamily(character, 'rightHand');
  var rangedFamilies = ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'];
  return (rangedFamilies.indexOf(leftFamily) > -1 || rangedFamilies.indexOf(rightFamily) > -1);
};

MML.isRangedWeapon = function (weapon) {
  return ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].indexOf(weapon.family);
};

MML.isUnarmed = function(character) {
  var leftHand = MML.getWeaponFamily(character, 'leftHand');
  var rightHand = MML.getWeaponFamily(character, 'rightHand');

  if (leftHand === 'unarmed' && rightHand === 'unarmed') {
    return true;
  } else {
    return false;
  }
};

MML.isDualWielding = function(character) {
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

MML.getHitPosition = function(character, rollValue) {
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (rollValue < 1 || rollValue > 100) {
    return 'Error: Value out of range';
  } else {
    return MML.hitPositions[character.bodyType][MML.hitTables[character.bodyType][character.hitTable][rollValue]];
  }
};

MML.getHitTable = function(character) {
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

MML.getHitPositionNames = function(character) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.pluck(MML.hitPositions[character.bodyType], 'name');
  }
};

MML.getBodyParts = function(character) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return 'Error: Body type not found';
  } else {
    return _.chain(MML.hitPositions[character.bodyType]).pluck('bodyPart').uniq().value();
  }
};

MML.getAvailableHitPositions = function(character, bodyPart) {
  var availableHitPositions = _.where(MML.hitPositions[character.bodyType], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return 'Error: No hit positions found';
  } else {
    return availableHitPositions;
  }
};

MML.getCalledShotHitPosition = function(character, rollValue, bodyPart) {
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

MML.buildHpAttribute = function(character) {
  var hpAttribute;
  switch (character.bodyType) {
    case 'humanoid':
      hpAttribute = {
        'Multiple Wounds': Math.round((character.health + character.stature + character.willpower) / 2),
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

MML.getDistanceBetweenChars = function(charName, targetName) {
  var charToken = MML.getTokenFromChar(charName);
  var targetToken = MML.getTokenFromChar(targetName);

  return MML.getDistance(charToken.get('left'), targetToken.get('left'), charToken.get('top'), targetToken.get('top'));
};

MML.getCharactersWithinRadius = function(left, top, radius) {
  var targets = [];
  _.each(MML.characters, function(character) {
    var charToken = MML.getTokenFromChar(character.name);

    if (MML.getDistance(charToken.get('left'), left, charToken.get('top'), top) < MML.raceSizes[character.race].radius + MML.pixelsToFeet(radius)) {
      targets.push(character.name);
    }
  });
  return targets;
};

MML.getCharactersWithinRectangle = function(leftOriginal, topOriginal, width, height, rotation) {
  var targets = [];
  var transformedCoordinates = MML.rotateAxes(leftOriginal, topOriginal, rotation);
  var left = transformedCoordinates[0];
  var top = transformedCoordinates[1];
  _.each(MML.characters, function(character) {
    var charToken = MML.getTokenFromChar(character.name);
    var tokenCoordinates = MML.rotateAxes(charToken.get('left'), charToken.get('top'), rotation);
    if (tokenCoordinates[0] + (MML.feetToPixels(MML.raceSizes[character.race].radius)) > left - (width / 2) &&
      tokenCoordinates[0] - (MML.feetToPixels(MML.raceSizes[character.race].radius)) < left + (width / 2) &&
      tokenCoordinates[1] - (MML.feetToPixels(MML.raceSizes[character.race].radius)) > top + (height / 2) &&
      tokenCoordinates[1] + (MML.feetToPixels(MML.raceSizes[character.race].radius)) < top - (height / 2)
    ) {
      targets.push(character.name);
    }
  });
  return targets;
};

MML.getMagicSkill = function(character, spell) {
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
        break;
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
        break;
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
        break;
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
        break;
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
        break;
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

MML.getEpCost = function(skillName, skillLevel, ep) {
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

MML.getModifiedEpCost = function(spellMarker, spell) {
  var area;
  var areaModified;
  var epModifiers = [];

  if (typeof spell.target === 'string' && spell.target.indexOf('\' Radius')) {
    area = Math.pow(parseInt(spell.target.replace('\' Radius', '')), 2);
    areaModified = Math.pow(MML.pixelsToFeet(spellMarker.get('width')/2), 2);
  } else if (_.isArray(spell.target)) {
    area = spell.target[0] * spell.target[1];
    areaModified = spellMarker.get('width') * spellMarker.get('height');
  }

  if (areaModified > area) {
    epModifiers.push(Math.pow(areaModified/area, 2));
  }
};

MML.getModifiedEpCost = function(caster, targets, spell) {
  var area;
  var areaModified;
  var epModifiers = [];

  if (areaModified > area) {
    epModifiers.push(Math.pow(areaModified/area, 2));
  }
};

MML.getRangeCastingModifier = function(caster, targets, spell) {
  var mod = 0;
  if (['Caster', 'Touch', 'Single'].indexOf(spell.target) === -1) {
    var distance = MML.getDistanceBetweenChars(caster.name, spell.name);
    if (distance > spell.range) {
      mod += Math.round(((spell.range - distance) / distance) * 10);
    }
  } else {
    _.each(targets, function(target) {
      var distance = MML.getDistanceBetweenChars(caster.name, target.name);
      if (spell.range === 'Caster' && target.name !== caster.name) {
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

MML.validateAction = function(character) {
  var valid = true;

  switch (character.action.name) {
    case 'Attack':
      switch (character.action.weaponType) {
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
              character.movementPosition === 'Prone') ||
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
            character.movementPosition === 'Prone'
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
