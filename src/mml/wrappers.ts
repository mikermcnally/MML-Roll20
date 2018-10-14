import {
  AttributeProperties,
  CampaignProperties,
  GraphicTypes,
  Id,
  IR20Ability, 
  IR20Attribute,
  IR20Token,
  ObjectType,
  TokenProperties,
} from "../roll20/roll20";
import * as _ from "underscore";
import { Character, } from "./mml";
import { Integer } from "../utilities/utilities";

// Attribute and Ability Functions
export function createAttribute(name: string, current: string, max: string, characterid: Character['id']): IR20Attribute {
  return createObj(ObjectType.Attribute, { name, current, max, characterid }) as IR20Attribute;
};

export function createAbility(name: string, action: string, characterid: Character['id'], istokenaction: boolean = false): IR20Ability {
  return createObj(ObjectType.Ability, { name, action, istokenaction, characterid }) as IR20Ability;
};

export function getCharAttribute(characterid: Character['id'], name: string): IR20Attribute {
  const attribute_object = findObjs({ type: ObjectType.Attribute, characterid, name })[0];

  if (_.isUndefined(attribute_object)) {
    return createAttribute(name, '', '', characterid);
  }
  return attribute_object as IR20Attribute;
};

export function getCurrentAttribute(characterid: Character['id'], attribute: string): IR20Attribute['current'] {
  return getCharAttribute(characterid, attribute).get(AttributeProperties.Current);
};

// export function getRollAttribute(id, attribute) {
//   const result = parseInt(getCurrentAttribute(id, attribute));
//   return isNaN(result) ? 6 : result;
// }

// export function getCurrentAttributeAsFloat(id: Id, attribute: string): Float.Signed {
//   const result = parseFloat(getCurrentAttribute(id, attribute));
//   if (isNaN(result)) {
//     setCurrentAttribute(id, attribute, 0.0);
//     return 0.0 as Float.Signed;
//   }
//   return result as Float.Signed;
// };

// export function getMaxAttributeAsFloat(id, attribute) {
//   const result = parseFloat(getCharAttribute(id, attribute).get('max'));
//   if (isNaN(result)) {
//     setMaxAttribute(id, attribute, 0.0);
//     return 0.0;
//   }
//   return result;
// };

// export function getCurrentAttributeAsBool(id, attribute) {
//   const result = getCurrentAttribute(id, attribute);
//   if (result.toString() === 'true') {
//     return true;
//   } else {
//     return false;
//   }
// };

// export function getCurrentAttributeAsArray(id, attribute) {
//   const result = getCurrentAttribute(id, attribute);
//   try {
//     return JSON.parse(result);
//   } catch (err) {
//     log(err);
//     setCurrentAttribute(id, attribute, '[]');
//     return [];
//   }
// };

// export function getCurrentAttributeObject(id, attribute) {
//   const result = getCurrentAttribute(id, attribute);
//   try {
//     return JSON.parse(result);
//   } catch (err) {
//     log(err);
//     setCurrentAttribute(id, attribute, '{}');
//     return {};
//   }
// };

// export function getSkillAttributes(id, skillType) {
//   const attributes = findObjs({ _type: 'attribute', _characterid: id });
//   const skills = {};
//   const skill_data = {};

//   _.each(attributes, function (attribute) {
//     const attributeName = attribute.get('name');

//     if (!attributeName.includes('repeating_' + skillType)) {
//       const attributeString = attributeName.split('_');
//       var _id = attributeString[2];
//       const property = attributeString[3];
//       const value = attribute.get('current');
//       _.each(skills, function (skill, key) {
//         if (key.toLowerCase() === _id) {
//           _id = key;
//         }
//       });
//       if (_.isUndefined(skill_data[_id])) {
//         skill_data[_id] = {
//           name: '',
//           input: 0,
//           level: 0
//         };
//       }
//       if (property === 'name') {
//         skill_data[_id][property] = value;
//       } else if (isNaN(parseFloat(value))) {
//         skill_data[_id][property] = 0;
//       } else {
//         skill_data[_id][property] = parseFloat(value);
//       }
//     }
//   });
//   _.each(skill_data, function (skill, _id) {
//     if (skill.name !== '') {
//       skills[skill.name] = {
//         level: skill.level,
//         input: skill.input,
//         _id: _id
//       };
//     }
//   });
//   return skills;
// };

export function setCurrentAttribute(characterid: Character['id'], name: string, value) {
  getCharAttribute(characterid, name).set(AttributeProperties.Current, value);
}

export function setMaxAttribute(characterid: Character['id'], attribute, value) {
  getCharAttribute(characterid, attribute).set(AttributeProperties.Max, value);
}

export function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
}

// Token Functions
export function getCharacterIdFromToken(token: IR20Token) {
  const character_object = getObj(ObjectType.Character, token.get(TokenProperties.Represents) as Id);

  if (token.get(TokenProperties.Name).includes('spellMarker')) {
    // Do nothing
  } else if (_.isUndefined(character_object)) {
    token.set(TokenProperties.TintColor, '#FFFF00');
    sendChat('Error', 'Selected Token(s) not associated to a character.');
  } else {
    return character_object.id;
  }
}

export function getCharacterToken(characterid: Character['id']): IR20Token {
  const tokens = findObjs({
    _pageid: Campaign().get(CampaignProperties.Playerpageid),
    _type: ObjectType.Graphic,
    _subtype: GraphicTypes.Token,
    represents: characterid
  });
  return tokens[0] as IR20Token;
}

export function getSpellMarkerToken(name) {
  const tokens = findObjs({
    _pageid: Campaign().get(CampaignProperties.Playerpageid),
    _type: ObjectType.Graphic,
    _subtype: GraphicTypes.Token,
    name: name
  });
  return tokens[0];
}

export function getSelectedIds(selected = []) {
  return selected.map(token => getCharacterIdFromToken(token));
}

export function displayAura(token: IR20Token, radius: Integer.Unsigned, aura_number: Integer.Unsigned, color: string) {
  token.set(aura_number === 2 ? TokenProperties.Aura2Radius : TokenProperties.Aura1Radius, radius);
  token.set(aura_number === 2 ? TokenProperties.Aura2Color : TokenProperties.Aura1Color, color);
}

// Player Functions
export function getPlayerFromName(playerName) {
  const player = findObjs({
    _type: 'player',
    online: true,
    _displayname: playerName
  }, {
      caseInsensitive: false
    });
  return player[0];
}

export function generateRowID() {
  return new Date().getUTCMilliseconds().toString();
};

export function clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;
  var target = obj instanceof Array ? [] : {};
  for (var i in obj) {
    target[i] = clone(obj[i]);
  }
  return target;
}

export function timeToRounds(round_length: number, time_string: string, months_to_rounds = number => 0) {
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
