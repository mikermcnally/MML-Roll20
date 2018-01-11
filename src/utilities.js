// Character Functions
MML.getCharFromName = function getCharFromName(name) {
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
  const attributeObject = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (_.isUndefined(attributeObject)) {
    return MML.createAttribute(attribute, '', '', characterId);
  }
  return attributeObject;
};

MML.getCurrentAttribute = function getCurrentAttribute(id, attribute) {
  return MML.getCharAttribute(id, attribute).get('current');
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(id, attribute) {
  const result = parseFloat(MML.getCurrentAttribute(id, attribute));
  if (isNaN(result)) {
    MML.setCurrentAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(id, attribute) {
  const result = parseFloat(MML.getCharAttribute(id, attribute).get('max'));
  if (isNaN(result)) {
    MML.setMaxAttribute(id, attribute, 0);
    return 0;
  }
  return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  if (result.toString() === 'true') {
    return true;
  } else {
    return false;
  }
};

MML.getCurrentAttributeAsArray = function getCurrentAttributeAsArray(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    MML.setCurrentAttribute(id, attribute, '[]');
    return [];
  }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(id, attribute) {
  const result = MML.getCurrentAttribute(id, attribute);
  try {
    return JSON.parse(result);
  } catch (err) {
    log(err);
    MML.setCurrentAttribute(id, attribute, '{}');
    return [];
  }
};

MML.getSkillAttributes = function getSkillAttributes(id, skillType) {
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

MML.setCurrentAttribute = function setCurrentAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('current', value);
};

MML.setMaxAttribute = function setMaxAttribute(id, attribute, value) {
  MML.getCharAttribute(id, attribute).set('max', value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
MML.getCharacterIdFromToken = function getCharacterIdFromToken(token) {
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

MML.getCharacterToken = function getCharacterToken(character_id) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    represents: character_id
  });
  return tokens[0];
};

MML.getSpellMarkerToken = function getSpellMarkerToken(name) {
  const tokens = findObjs({
    _pageid: Campaign().get('playerpageid'),
    _type: 'graphic',
    _subtype: 'token',
    name: name
  });
  return tokens[0];
};

MML.getSelectedIds = function getSelectedIds(selected) {
  return selected.map(token => MML.getCharacterIdFromToken(token));
};

MML.displayAura = function displayAura(token, radius, auraNumber, color) {
  token.set(auraNumber === 2 ? 'aura2_radius' : 'aura1_radius', radius);
  token.set(auraNumber === 2 ? 'aura1_color' : 'aura1_color', color);
};

MML.getDistanceBetweenTokens = function getDistanceBetweenTokens(a, b) {
  return MML.getDistance(a.get('left'), b.get('left'), a.get('top'), b.get('top'));
};

// Geometry Functions
MML.feetToPixels = function feetToPixels(feet) {
  return feet * 14;
};

MML.pixelsToFeet = function pixelsToFeet(pixels) {
  return Math.floor((pixels / 14) + 0.5);
};

MML.getDistance = function getDistance(left1, left2, top1, top2) {
  const leftDistance = Math.abs(left2 - left1);
  const topDistance = Math.abs(top2 - top1);
  return Math.sqrt(Math.pow(leftDistance, 2) + Math.pow(topDistance, 2));
};

MML.getDistanceFeet = function getDistanceFeet(left1, left2, top1, top2) {
  return MML.pixelsToFeet(MML.getDistance(left1, left2, top1, top2));
};

MML.drawCirclePath = function drawCirclePath(left, top, radiusInFeet) {
  const radius = MML.feetToPixels(radiusInFeet);
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

MML.rotateAxes = function rotateAxes(left, top, angle) {
  const leftNew = left * Math.cos(angle * Math.PI / 180) + top * Math.sin(angle * Math.PI / 180);
  const topNew = -left * Math.sin(angle * Math.PI / 180) + top * Math.cos(angle * Math.PI / 180);
  return [leftNew, topNew];
};

// Player Functions
MML.getPlayerFromName = function getPlayerFromName(playerName) {
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
