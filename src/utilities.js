// Character Functions
SoS.getCharFromName = function getCharFromName(name) {
  const character = findObjs({
    _type: 'character',
    archived: false,
    name: name
  }, {
    caseInsensitive: false
  });
  return character[0];
};

// Attribute and Ability Functions
SoS.createAttribute = function createAttribute(name, current, max, id) {
  return createObj('attribute', {
    name: name,
    current: current,
    max: max,
    characterid: id
  });
};

SoS.createAbility = function createAbility(id, name, action, istokenaction) {
  return createObj('ability', {
    name: name,
    action: action,
    istokenaction: istokenaction,
    characterid: character.id
  });
};

SoS.getCharAttribute = function getCharAttribute(characterId, attribute) {
  const attributeObject = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (_.isUndefined(attributeObject)) {
    return SoS.createAttribute(attribute, '', '', characterId);
  }
  return attributeObject;
};

SoS.getCurrentAttribute = function getCurrentAttribute(id, attribute) {
  return SoS.getCharAttribute(id, attribute).get('current');
};

SoS.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(id, attribute) {
  const result = parseFloat(SoS.getCurrentAttribute(id, attribute));
  if (isNaN(result)) {
    SoS.setCurrentAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

SoS.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(id, attribute) {
  const result = parseFloat(SoS.getCharAttribute(id, attribute).get('max'));
  if (isNaN(result)) {
    SoS.setMaxAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

SoS.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(id, attribute) {
  const result = SoS.getCurrentAttribute(id, attribute);
  if (result.toString() === 'true') {
    return true;
  } else {
    return false;
  }
};

SoS.getCurrentAttributeAsArray = function getCurrentAttributeAsArray(id, attribute) {
  const result = SoS.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    SoS.setCurrentAttribute(id, attribute, '[]');
    return [];
  }
};

SoS.getCurrentAttributeJSON = function getCurrentAttributeJSON(id, attribute) {
  const result = SoS.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    SoS.setCurrentAttribute(id, attribute, '{}');
    return [];
  }
};

SoS.getSkillAttributes = function getSkillAttributes(id, skillType) {
  const attributes = findObjs({
    _type: 'attribute',
    _characterid: id
  }, {
    caseInsensitive: false
  });
  const skills = {};
  const skill_data = {};

  _.each(attributes, function(attribute) {
    const attributeName = attribute.get('name');

    if (attributeName.indexOf('repeating_' + skillType) !== -1) {
      const attributeString = attributeName.split('_');
      var _id = attributeString[2];
      const property = attributeString[3];
      const value = attribute.get('current');
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

SoS.setCurrentAttribute = function setCurrentAttribute(id, attribute, value) {
  SoS.getCharAttribute(id, attribute).set('current', value);
};

SoS.setMaxAttribute = function setMaxAttribute(id, attribute, value) {
  SoS.getCharAttribute(id, attribute).set('max', value);
};

SoS.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
SoS.getCharacterIdFromToken = function getCharacterIdFromToken(token) {
  const tokenObject = getObj('graphic', token.id);
  const characterObject = getObj('character', tokenObject.get('represents'));

  if (tokenObject.get('name').indexOf('spellMarker') > -1) {
    // Do nothing
  } else if (_.isUndefined(characterObject)) {
    tokenObject.set('tint_color', '#FFFF00');
    sendChat('Error', 'Selected Token(s) not associated to a character.');
  } else {
    return characterObject.get('id');
  }
};

SoS.getCharacterToken = function getCharacterToken(character_id) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    represents: character_id
  });
  return tokens[0];
};

SoS.getSpellMarkerToken = function getSpellMarkerToken(name) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    name: name
  });
  return tokens[0];
};

SoS.getSelectedIds = function getSelectedIds(selected) {
  return selected.map(token => SoS.getCharacterIdFromToken(token));
};

SoS.displayAura = function displayAura(token, radius, auraNumber, color) {
  token.set(auraNumber === 2 ? 'aura2_radius' : 'aura1_radius', radius);
  token.set(auraNumber === 2 ? 'aura1_color' : 'aura1_color', color);
};

SoS.getDistanceBetweenTokens = function getDistanceBetweenTokens(a, b) {
  return SoS.getDistance(a.get('left'), b.get('left'), a.get('top'), b.get('top'));
};

// Geometry Functions
SoS.feetToPixels = function feetToPixels(feet) {
  return feet * 14;
};

SoS.pixelsToFeet = function pixelsToFeet(pixels) {
  return Math.floor((pixels / 14) + 0.5);
};

SoS.getDistance = function getDistance(left1, left2, top1, top2) {
  const leftDistance = Math.abs(left2 - left1);
  const topDistance = Math.abs(top2 - top1);
  return Math.sqrt(Math.pow(leftDistance, 2) + Math.pow(topDistance, 2));
};

SoS.getDistanceFeet = function getDistanceFeet(left1, left2, top1, top2) {
  return SoS.pixelsToFeet(SoS.getDistance(left1, left2, top1, top2));
};

SoS.drawCirclePath = function drawCirclePath(left, top, radiusInFeet) {
  const radius = SoS.feetToPixels(radiusInFeet);
  const pathArray = [
    ['M', left - radius, top],
    ['C', left - radius, top - (radius / 2), left - (radius / 2), top - radius, left, top - radius],
    ['C', left + (radius / 2), top - radius, left + radius, top - (radius / 2), left + radius, top],
    ['C', left + radius, top + (radius / 2), left + (radius / 2), top + radius, left, top + radius],
    ['C', left - (radius / 2), top + radius, left - radius, top + (radius / 2), left - radius, top]
  ];
  const path = createObj('path', {
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

SoS.rotateAxes = function rotateAxes(left, top, angle) {
  const leftNew = left * Math.cos(angle * Math.PI / 180) + top * Math.sin(angle * Math.PI / 180);
  const topNew = -left * Math.sin(angle * Math.PI / 180) + top * Math.cos(angle * Math.PI / 180);
  return [leftNew, topNew];
};

// Player Functions
SoS.getPlayerFromName = function getPlayerFromName(playerName) {
  const player = findObjs({
    _type: 'player',
    online: true,
    _displayname: playerName
  }, {
    caseInsensitive: false
  });
  return player[0];
};

// Code borrowed from The Aaron from roll20.net forums
// This code is disgusting. Who codes like this?
function generateUUID() {
  var a = 0;
  var b = [];
  var c = (new Date()).getTime() + 0;
  var e = new Array(8);
  return function() {
    d = c === a;
    a = c;
    for (e, f = 7; 0 <= f; f--) {
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

SoS.generateRowID = function generateRowID() {
  return generateUUID().replace(/_/g, 'Z');
};

SoS.clone = function clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;
  var target = obj instanceof Array ? [] : {};
  for (var i in obj) {
    target[i] = this.clone(obj[i]);
  }
  return target;
};
