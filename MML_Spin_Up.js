on("ready", function() {
  MML.init();

  on("add:character", function(character) {
    var charName = character.get("name");
    MML.createAttribute("player", state.MML.GM.name, "", character);
    MML.createAttribute("name", charName, "", character);
    MML.createAttribute("race", "Human", "", character);
    MML.createAttribute("gender", "Male", "", character);
    MML.createAttribute("statureRoll", 6, "", character);
    MML.createAttribute("strengthRoll", 6, "", character);
    MML.createAttribute("coordinationRoll", 6, "", character);
    MML.createAttribute("healthRoll", 6, "", character);
    MML.createAttribute("beautyRoll", 6, "", character);
    MML.createAttribute("intellectRoll", 6, "", character);
    MML.createAttribute("reasonRoll", 6, "", character);
    MML.createAttribute("creativityRoll", 6, "", character);
    MML.createAttribute("presenceRoll", 6, "", character);
    MML.createAttribute("fomInitBonus", 6, "", character);
    MML.createAttribute("rightHand", JSON.stringify({
      _id: "emptyHand"
    }), "", character);
    MML.createAttribute("leftHand", JSON.stringify({
      _id: "emptyHand"
    }), "", character);

    MML.characters[charName] = new MML.Character(charName);

    MML.processCommand({
      type: "character",
      who: charName,
      callback: "update",
      input: {
        attribute: "race"
      }
    });
  });

  on("add:attribute", function(attribute) {
    var characterObject = getObj("character", attribute.get("_characterid"));
    var charName = characterObject.get("name");
    var attrName = attribute.get("name");

    if (attrName.indexOf("repeating_skills") !== -1) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "update",
        input: {
          attribute: "skills"
        }
      });
    } else if (attrName.indexOf("repeating_weaponskills") !== -1) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "update",
        input: {
          attribute: "weaponSkills"
        }
      });
    }
  });

  on("chat:message", function(msg) {
    MML.parseCommand(msg);
  });

  on("change:token", function(obj, prev) {
    if (obj.get("name").indexOf("spellMarker") === -1 && obj.get("left") !== prev["left"] && obj.get("top") !== prev["top"] && state.MML.GM.inCombat === true) {
      var charName = MML.getCharFromToken(obj);
      var character = MML.characters[charName];
      var left1 = prev["left"];
      var left2 = obj.get("left");
      var top1 = prev["top"];
      var top2 = obj.get("top");
      var distance = MML.getDistance(left1, left2, top1, top2);
      var distanceAvailable = MML.movementRates[character.race][character.movementPosition] * character.movementAvailable;

      if (state.MML.GM.actor === charName && distanceAvailable > 0) {
        // If they move too far, move the maxium distance in the same direction
        if (distance > distanceAvailable) {
          left3 = Math.floor(((left2 - left1) / distance) * distanceAvailable + left1 + 0.5);
          top3 = Math.floor(((top2 - top1) / distance) * distanceAvailable + top1 + 0.5);
          obj.set("left", left3);
          obj.set("top", top3);
          character.movementAvailable(0);
        }
        character.moveDistance(distance);
      } else {
        obj.set("left", prev["left"]);
        obj.set("top", prev["top"]);
      }
    } else if (obj.get("name").indexOf("spellMarker") > -1) {
      sendChat("GM", 'new ep and difficulty');
      toBack(obj);
    }
  });

  on("change:character:name", function(changedCharacter) {
    var newName = changedCharacter.get("name");
    var characters = findObjs({
      _type: "character",
      archived: false,
    }, {
      caseInsensitive: false
    });
    var apiNames = _.keys(MML.characters);
    var characterNames = [];

    _.each(characters, function(character) {
      characterNames.push(character.get("name"));
    });

    var oldName = _.difference(apiNames, characterNames)[0];

    MML.characters[newName] = MML.characters[oldName];
    delete MML.characters[oldName];
    MML.characters[newName].name = newName;
  });

  on("change:attribute:current", function(attribute) {
    var characterObject = getObj("character", attribute.get("_characterid"));
    var charName = characterObject.get("name");
    var attrName = attribute.get("name");
    var roll;

    switch (attrName) {
      case "statureRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "stature"
          }
        });
        break;
      case "strengthRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "strength"
          }
        });
        break;
      case "coordinationRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "coordination"
          }
        });
        break;
      case "healthRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "health"
          }
        });
        break;
      case "beautyRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "beauty"
          }
        });
        break;
      case "intellectRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "intellect"
          }
        });
        break;
      case "reasonRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "reason"
          }
        });
        break;
      case "creativityRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "creativity"
          }
        });
        break;
      case "presenceRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "update",
          input: {
            attribute: "presence"
          }
        });
        break;
        case "player":
          if (_.isUndefined(MML.players[attribute.get("current")])) {
            MML.processCommand({
              type: "character",
              who: charName,
              callback: "setApiCharAttribute",
              input: {
                attribute: "player",
                value: state.MML.GM.name
              }
            });
          } else {
            MML.processCommand({
              type: "character",
              who: charName,
              callback: "setApiCharAttribute",
              input: {
                attribute: "player",
                value: attribute.get("current")
              }
            });
          }
          break;
      default:
        if (attrName.indexOf("repeating_items") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "update",
            input: {
              attribute: "inventory"
            }
          });
        } else if (attrName.indexOf("repeating_skills") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "update",
            input: {
              attribute: "skills"
            }
          });
        } else if (attrName.indexOf("repeating_weaponskills") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "update",
            input: {
              attribute: "weaponSkills"
            }
          });
        } else if (attrName.indexOf("repeating_statuseffects") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "update",
            input: {
              attribute: "statusEffects"
            }
          });
        } else if (attrName != "tab") {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "update",
            input: {
              attribute: attrName
            }
          });
        }
        break;
    }

  });
});
