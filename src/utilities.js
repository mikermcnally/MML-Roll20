// Character Functions
MML.getCharFromName = function getCharFromName(charName) {
  var character = findObjs({
    _type: 'character',
    archived: false,
    name: charName
  }, {
    caseInsensitive: false
  });

  return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, character) {
  return createObj('attribute', {
    name: name,
    current: current,
    max: max,
    characterid: character.id
  });
};

MML.createAttributesFromArray = function createAttributesFromArray(inputArray, character) {
  _.each(inputArray, function(attribute) {
    MML.createAttribute(attribute.name, attribute.current, attribute.max, character);
  });
};

MML.createAbility = function createAbility(name, action, istokenaction, character) {
  createObj('ability', {
    name: name,
    action: action,
    istokenaction: istokenaction,
    characterid: character.id
  });
};

MML.getCharAttribute = function getCharAttribute(charName, attribute) {
  var character = MML.getCharFromName(charName);
  var charAttribute = findObjs({
    _type: 'attribute',
    _characterid: character.get('_id'),
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (typeof(charAttribute) === 'undefined') {
    charAttribute = MML.createAttribute(attribute, '', '', MML.getCharFromName(charName));
  }

  return charAttribute;
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute) {
  return MML.getCharAttribute(charName, attribute).get('current');
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(charName, attribute) {
  var result = parseFloat(MML.getCurrentAttribute(charName, attribute));

  if (isNaN(result)) {
    MML.setCurrentAttribute(charName, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(charName, attribute) {
  var result = parseFloat(MML.getCharAttribute(charName, attribute).get('max'));

  if (isNaN(result)) {
    MML.setMaxAttribute(charName, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(charName, attribute) {
  var result = MML.getCurrentAttribute(charName, attribute);
  if (result.toString() === 'true') {
    return true;
  } else {
    return false;
  }
};

MML.getCurrentAttributeAsArray = function getCurrentAttributeAsArray(charName, attribute) {
  var result = MML.getCurrentAttribute(charName, attribute);

  try {
    result = JSON.parse(result);
  } catch (e) {
    MML.setCurrentAttribute(charName, attribute, '[]');
    result = [];
  }
  return result;
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(charName, attribute) {
  var result = MML.getCurrentAttribute(charName, attribute);

  try {
    result = JSON.parse(result);
  } catch (e) {
    MML.setCurrentAttribute(charName, attribute, '{}');
    result = {};
  }
  return result;
};

MML.getSkillAttributes = function getSkillAttributes(charName, skillType) {
  var character = MML.getCharFromName(charName);
  var attributes = findObjs({
    _type: 'attribute',
    _characterid: character.get('_id')
  }, {
    caseInsensitive: false
  });
  var skills = {};
  var skill_data = {};

  _.each(attributes, function(attribute) {
    var attributeName = attribute.get('name');

    if (attributeName.indexOf('repeating_' + skillType) !== -1) {
      var attributeString = attributeName.split('_');
      var _id = attributeString[2];
      var property = attributeString[3];
      var value = attribute.get('current');
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

MML.setCurrentAttribute = function setCurrentAttribute(charName, attribute, value) {
  MML.getCharAttribute(charName, attribute).set('current', value);
};

MML.setMaxAttribute = function setMaxAttribute(charName, attribute, value) {
  MML.getCharAttribute(charName, attribute).set('max', value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
MML.getTokenCharacter = function getTokenCharacter(token) {
  var tokenObject = getObj('graphic', token.id);
  var characterObject = getObj('character', tokenObject.get('represents'));

  if (tokenObject.get('name').indexOf('spellMarker') > -1) {
    // Do nothing
  } else if (_.isUndefined(characterObject)) {
    tokenObject.set('tint_color', '#FFFF00');
    sendChat('Error', 'Selected Token(s) not associated to a character.');
  } else {
    return characterObject.get('name');
  }
};

MML.getCharacterToken = function getCharacterToken(character) {
  var tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    represents: character.id
  });
  return tokens[0];
};

MML.getSpellMarkerToken = function getSpellMarkerToken(spell) {
  var tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    name: name
  });

  return tokens[0];
};

MML.getSelectedTokens = function getSelectedTokens(selected) {
  tokens = [];

  var index;
  for (index in selected) {
    tokens.push(getObj('graphic', selected[index]._id));
  }
  return tokens;
};

MML.getSelectedCharNames = function getSelectedCharNames(selected) {
  characters = [];

  var index;
  _.each(selected, function(object) {
    if (object._type === 'graphic') {
      characters.push(MML.getTokenCharacter(getObj('graphic', object._id)));
    }
  });
  return characters;
};

MML.displayAura = function displayAura(token, radius, auraNumber, color) {
  var auraRadius;
  var auraColor;
  if (auraNumber === 2) {
    auraRadius = 'aura2_radius';
    auraColor = 'aura2_color';
  } else {
    auraRadius = 'aura1_radius';
    auraColor = 'aura1_color';
  }
  token.set(auraRadius, radius);
  token.set(auraColor, color);
};

MML.getDistanceBetweenTokens = function getDistanceBetweenTokens(a, b) {
  return MML.getDistance(a.get('left'), b.get('left'), a.get('top'), b.get('top'));
};

// Geometry Functions
MML.feetToPixels = function feetToPixels(pixels) {
  return pixels * 14;
};

MML.pixelsToFeet = function pixelsToFeet(feet) {
  return Math.floor((feet / 14) + 0.5);
};

MML.getDistance = function getDistance(left1, left2, top1, top2) {
  var leftDistance = Math.abs(left2 - left1);
  var topDistance = Math.abs(top2 - top1);
  return Math.sqrt(Math.pow(leftDistance, 2) + Math.pow(topDistance, 2));
};

MML.getDistanceFeet = function getDistanceFeet(left1, left2, top1, top2) {
  return MML.pixelsToFeet(MML.getDistance(left1, left2, top1, top2));
};

MML.drawCirclePath = function drawCirclePath(left, top, radius) {
  var pixelPerFoot = 14;
  radius *= pixelPerFoot;
  var pathArray = [
    ['M', left - radius, top],
    ['C', left - radius, top - (radius / 2), left - (radius / 2), top - radius, left, top - radius],
    ['C', left + (radius / 2), top - radius, left + radius, top - (radius / 2), left + radius, top],
    ['C', left + radius, top + (radius / 2), left + (radius / 2), top + radius, left, top + radius],
    ['C', left - (radius / 2), top + radius, left - radius, top + (radius / 2), left - radius, top]
  ];
  var path = createObj('path', {
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
  var leftNew = left * Math.cos(angle * Math.PI / 180) + top * Math.sin(angle * Math.PI / 180);
  var topNew = -left * Math.sin(angle * Math.PI / 180) + top * Math.cos(angle * Math.PI / 180);

  return [leftNew, topNew];
};

// Player Functions
MML.getPlayerFromName = function getPlayerFromName(playerName) {
  var player = findObjs({
    _type: 'player',
    online: true,
    _displayname: playerName
  }, {
    caseInsensitive: false
  });

  return player[0];
};

// Code borrowed from The Aaron from roll20.net forums
var generateUUID = (function() {
    'use strict';

    var a = 0,
      b = [];
    return function() {
      var c = (new Date()).getTime() + 0,
        d = c === a;
      a = c;
      for (var e = new Array(8), f = 7; 0 <= f; f--) {
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
    };
  }()),

  generateRowID = function() {
    'use strict';
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

MML.hexify = function hexify(stringIn) {
  var stringOut = '';
  var i;
  for (i = 0; i < stringIn.length; i++) {
    stringOut += ('000' + stringIn.charCodeAt(i).toString(16)).slice(-4);
  }
  return stringOut;
};

MML.dehexify = function dehexify(hexIn) {
  var i;
  var hexes = hexIn.match(/.{1,4}/g) || [];
  var dehexed = '';
  for (i = 0; i < hexes.length; i++) {
    dehexed += String.fromCharCode(parseInt(hexes[i], 16));
  }

  return dehexed;
};

// Rolling Functions
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

MML.attributeCheckRoll = function attributeCheckRoll(name, character, attribute, mods) {
  var roll = {
    type: 'attribute',
    name: name,
    range: '1-20',
    value: MML.rollDice(1, 20),
    target: character[attribute] + MML.sumModifiers(modifiers),
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

MML.damageRoll = function damageRoll(name, diceString, modifiers, crit) {
  var dice = MML.parseDice(damageDice);
  var amount = dice.amount;
  var size = dice.size;
  var modifier = MML.sumModifiers(modifiers);
  var value;

  if (crit) {
    value = MML.rollDice(amount, size) + amount * size + modifier;
    range = (amount * size + amount + modifier) + "-" + (2 * amount * size + modifier);
  } else {
    value = MML.rollDice(amount, size) + modifier;
    range = (amount + modifier) + "-" + (amount * size + modifier);
  }

  var roll = {
    type: "damage",
    range: range,
    value: value,
    modifiers: modifiers
  };
  return MML.damageRollResult(roll);
};

MML.damageRollResult = function damageRollResult(roll) {
  roll.result = -roll.value;
  roll.message = 'Roll: ' + roll.value + '\nRange: ' + roll.range;
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
