export class Util {
  // Character Functions
  static getCharFromName(name) {
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
  static createAttribute(name, current, max, id) {
    return createObj('attribute', {
      name: name,
      current: current,
      max: max,
      characterid: id
    });
  };

  static createAbility(id, name, action, istokenaction) {
    return createObj('ability', {
      name: name,
      action: action,
      istokenaction: istokenaction,
      characterid: id
    });
  };

  static getCharAttribute(character_id, attribute) {
    const attributeObject = findObjs({
      _type: 'attribute',
      _characterid: character_id,
      name: attribute
    }, {
        caseInsensitive: false
      })[0];

    if (_.isUndefined(attributeObject)) {
      return this.createAttribute(attribute, '', '', character_id);
    }
    return attributeObject;
  };

  static getCurrentAttribute(id, attribute) {
    return this.getCharAttribute(id, attribute).get('current');
  };

  static getRollAttribute(id, attribute) {
    const result = parseInt(this.getCurrentAttribute(id, attribute));
    return isNaN(result) ? 6 : result;
  }

  static getCurrentAttributeAsFloat(id, attribute) {
    const result = parseFloat(MML.getCurrentAttribute(id, attribute));
    if (isNaN(result)) {
      MML.setCurrentAttribute(id, attribute, 0.0);
      return 0.0;
    }
    return result;
  };

  static getMaxAttributeAsFloat(id, attribute) {
    const result = parseFloat(MML.getCharAttribute(id, attribute).get('max'));
    if (isNaN(result)) {
      MML.setMaxAttribute(id, attribute, 0.0);
      return 0.0;
    }
    return result;
  };

  static getCurrentAttributeAsBool(id, attribute) {
    const result = MML.getCurrentAttribute(id, attribute);
    if (result.toString() === 'true') {
      return true;
    } else {
      return false;
    }
  };

  static getCurrentAttributeAsArray(id, attribute) {
    const result = MML.getCurrentAttribute(id, attribute);
    try {
      return JSON.parse(result);
    } catch (err) {
      log(err);
      MML.setCurrentAttribute(id, attribute, '[]');
      return [];
    }
  };

  static getCurrentAttributeObject(id, attribute) {
    const result = MML.getCurrentAttribute(id, attribute);
    try {
      return JSON.parse(result);
    } catch (err) {
      log(err);
      MML.setCurrentAttribute(id, attribute, '{}');
      return {};
    }
  };

  static getSkillAttributes(id, skillType) {
    const attributes = findObjs({ _type: 'attribute', _characterid: id });
    const skills = {};
    const skill_data = {};

    _.each(attributes, function (attribute) {
      const attributeName = attribute.get('name');

      if (!attributeName.includes('repeating_' + skillType)) {
        const attributeString = attributeName.split('_');
        var _id = attributeString[2];
        const property = attributeString[3];
        const value = attribute.get('current');
        _.each(skills, function (skill, key) {
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
    _.each(skill_data, function (skill, _id) {
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

  static setCurrentAttribute(id, attribute, value) {
    MML.getCharAttribute(id, attribute).set('current', value);
  }

  static setMaxAttribute(id, attribute, value) {
    MML.getCharAttribute(id, attribute).set('max', value);
  }

  static getAttributeTableValue(attribute, inputValue, table) {
    return table[inputValue][attribute];
  }

  // Token Functions
  static getCharacterIdFromToken(token) {
    const tokenObject = getObj('graphic', token._id);
    const characterObject = getObj('character', tokenObject.get('represents'));

    if (tokenObject.get('name').includes('spellMarker')) {
      // Do nothing
    } else if (_.isUndefined(characterObject)) {
      tokenObject.set('tint_color', '#FFFF00');
      sendChat('Error', 'Selected Token(s) not associated to a character.');
    } else {
      return characterObject.get('id');
    }
  }

  static getCharacterToken(character_id) {
    const tokens = findObjs({
      _pageid: Campaign().get('playerpageid'),
      _type: 'graphic',
      _subtype: 'token',
      represents: character_id
    });
    return tokens[0];
  }

  static getSpellMarkerToken(name) {
    const tokens = findObjs({
      _pageid: Campaign().get('playerpageid'),
      _type: 'graphic',
      _subtype: 'token',
      name: name
    });
    return tokens[0];
  }

  static getSelectedIds(selected = []) {
    return selected.map(token => MML.getCharacterIdFromToken(token));
  }

  static displayAura(token, radius, aura_number, color) {
    token.set(aura_number === 2 ? 'aura2_radius' : 'aura1_radius', radius);
    token.set(aura_number === 2 ? 'aura2_color' : 'aura1_color', color);
  }

  static getDistanceBetweenTokens(a, b) {
    return MML.getDistance(a.get('left'), b.get('left'), a.get('top'), b.get('top'));
  }

  // Geometry Functions
  static feetToPixels(feet) {
    return feet * 14;
  }

  static pixelsToFeet(pixels) {
    return Math.floor((pixels / 14) + 0.5);
  }

  static getDistance(left1, left2, top1, top2) {
    const leftDistance = Math.abs(left2 - left1);
    const topDistance = Math.abs(top2 - top1);
    return Math.sqrt(Math.pow(leftDistance, 2) + Math.pow(topDistance, 2));
  }

  static getDistanceFeet(left1, left2, top1, top2) {
    return MML.pixelsToFeet(MML.getDistance(left1, left2, top1, top2));
  }

  static drawCirclePath(left, top, radiusInFeet) {
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
  }

  static rotateAxes(left, top, angle) {
    const leftNew = left * Math.cos(angle * Math.PI / 180) + top * Math.sin(angle * Math.PI / 180);
    const topNew = -left * Math.sin(angle * Math.PI / 180) + top * Math.cos(angle * Math.PI / 180);
    return [leftNew, topNew];
  }

  // Player Functions
  static getPlayerFromName(playerName) {
    const player = findObjs({
      _type: 'player',
      online: true,
      _displayname: playerName
    }, {
        caseInsensitive: false
      });
    return player[0];
  }


static generateRowID() {
  return new Date().getUTCMilliseconds().toString();
};

static clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;
  var target = obj instanceof Array ? [] : {};
  for (var i in obj) {
    target[i] = this.clone(obj[i]);
  }
  return target;
}

static timeToRounds(round_length: number, time_string: string, months_to_rounds = number => 0) {
  let seconds = parseInt(time_string.match(/(\d+)(\s|,|:)*(s|sec|seconds|Seconds|second|Second)(?![A-Za-z])/)[1]);
  let minutes = parseInt(time_string.match(/(\d+)(\s|,|:)*(m|min|minutes|Minutes|minute|Minute)(?![A-Za-z])/)[1]);
  let hours = parseInt(time_string.match(/(\d+)(\s|,|:)*(h|hours|Hours|hour|Hour)(?![A-Za-z])/)[1]);
  let days = parseInt(time_string.match(/(\d+)(\s|,|:)*(d|days|Days|day|Day)(?![A-Za-z])/)[1]);
  // Months aren't a consistent unit of time and will vary within the multiverse
  let months = months_to_rounds((parseInt(time_string.match(/(\d+)(\s|,|:)*(M|mon|Mon|months|Months|month|Months)(?![A-Za-z])/)[1])));
  let years = parseInt(time_string.match(/(\d+)(\s|,|:)*(y|years|Years|year|Year)(?![A-Za-z])/)[1]);
  let rounds = parseInt(time_string.match(/(\d+)(\s|,|:)*(r|rounds|Round|rounds|Rounds)(?![A-Za-z])/)[1]);

  seconds = isNaN(seconds) ? 0 : seconds;
  minutes = isNaN(minutes) ? 0 : minutes * 60;
  hours = isNaN(hours) ? 0 : hours * 60 * 60;
  days = isNaN(days) ? 0 : days * 24 * 60 * 60;
  months = isNaN(months) ? 0 : months;
  years = isNaN(years) ? 0 : years * 365 * 24 * 60 * 60;
  rounds = isNaN(rounds) ? rounds : 0;

  const total_seconds = seconds + minutes + hours + days + months + years; 

  return Math.floor((total_seconds / round_length) + rounds);
}
}
