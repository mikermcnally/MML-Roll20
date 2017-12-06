// Character Functions
MML.getCharFromName = function getCharFromName(name) {
  var character = findObjs({
    _type: 'character',
    archived: false,
    name: name
  }, {
    caseInsensitive: false
  });

  return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, id) {
  return createObj('attribute', {
    name: name,
    current: current,
    max: max,
    characterid: id
  });
};

MML.createAbility = function createAbility(id, name, action, istokenaction) {
  return createObj('ability', {
    name: name,
    action: action,
    istokenaction: istokenaction,
    characterid: character.id
  });
};

MML.getCharAttribute = function getCharAttribute(characterId, attribute) {
  var attributeObject = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (_.isUndefined(attributeObject)) {
    attributeObject = MML.createAttribute(attribute, '', '', characterId);
  }
  return attributeObject;
};

MML.getCurrentAttribute = function getCurrentAttribute(id, attribute) {
  return MML.getCharAttribute(id, attribute).get('current');
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(id, attribute) {
  var result = parseFloat(MML.getCurrentAttribute(id, attribute));

  if (isNaN(result)) {
    MML.setCurrentAttribute(id, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(id, attribute) {
  var result = parseFloat(MML.getCharAttribute(id, attribute).get('max'));

  if (isNaN(result)) {
    MML.setMaxAttribute(id, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(id, attribute) {
  var result = MML.getCurrentAttribute(id, attribute);
  if (result.toString() === 'true') {
    return true;
  } else {
    return false;
  }
};

MML.getCurrentAttributeAsArray = function getCurrentAttributeAsArray(id, attribute) {
  var result = MML.getCurrentAttribute(id, attribute);

  try {
    result = JSON.parse(result);
  } catch (e) {
    MML.setCurrentAttribute(id, attribute, '[]');
    result = [];
  }
  return result;
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(id, attribute) {
  var result = MML.getCurrentAttribute(id, attribute);

  try {
    result = JSON.parse(result);
  } catch (e) {
    MML.setCurrentAttribute(id, attribute, '{}');
    result = {};
  }
  return result;
};

MML.getSkillAttributes = function getSkillAttributes(id, skillType) {
  var attributes = findObjs({
    _type: 'attribute',
    _characterid: id
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

MML.setCurrentAttribute = function setCurrentAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('current', value);
  console.log(MML.getCharAttribute(id, attribute));
};

MML.setMaxAttribute = function setMaxAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('max', value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
MML.getCharacterIdFromToken = function getCharacterIdFromToken(token) {
  var tokenObject = getObj('graphic', token.id);
  var characterObject = getObj('character', tokenObject.get('represents'));

  if (tokenObject.get('name').indexOf('spellMarker') > -1) {
    // Do nothing
  } else if (_.isUndefined(characterObject)) {
    tokenObject.set('tint_color', '#FFFF00');
    sendChat('Error', 'Selected Token(s) not associated to a character.');
  } else {
    return characterObject.get('id');
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

MML.getSelectedIds = function getSelectedIds(selected) {
  characters = [];

  var index;
  _.each(selected, function(object) {
    if (object._type === 'graphic') {
      characters.push(MML.getCharacterIdFromToken(getObj('graphic', object._id)));
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
function generateUUID() {
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
  }();
}

MML.generateRowID = function generateRowID() {
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

MML.recursivePromises = function recursivePromises(array, index, input) {
  return array[index](input)
    .then(function (input) {
      console.log(input);
      return index + 1 < array.length ? recursivePromises(array, index + 1, input) : input;
    })
    .catch(function (err) {
      console.log('A problem was had!');
      console.log(err);
    });
};
