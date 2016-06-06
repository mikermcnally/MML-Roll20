// Character Functions
MML.getCharFromName = function getCharFromName(charName) {
    var character = findObjs({
        _type: "character",
        archived: false,
        name: charName
    }, {
        caseInsensitive: false
    });

    return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, character) {
    return createObj("attribute", {
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
    createObj("ability", {
        name: name,
        action: action,
        istokenaction: istokenaction,
        characterid: character.id
    });
};

MML.getCharAttribute = function getCharAttribute(charName, attribute) {
    var character = MML.getCharFromName(charName);

    var charAttribute = findObjs({
        _type: "attribute",
        _characterid: character.get("_id"),
        name: attribute
    }, {
        caseInsensitive: false
    })[0];
    
    if (typeof(charAttribute) === "undefined") {
        charAttribute = MML.createAttribute(attribute, "", "", MML.getCharFromName(charName));
    }

    return charAttribute;
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute) {
    return MML.getCharAttribute(charName, attribute).get("current");
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
    var result = parseFloat(MML.getCharAttribute(charName, attribute).get("max"));

    if (isNaN(result)) {
        MML.setMaxAttribute(charName, attribute, 0);
        result = 0;
    }

    return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(charName, attribute) {
    var result = MML.getCurrentAttribute(charName, attribute);
    if (result === "true") {
        return true;
    } else {
        return false;
    }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(charName, attribute) {
    var result = MML.getCurrentAttribute(charName, attribute);

    try {
        result = JSON.parse(result);
    }
    catch (e) {
        MML.setCurrentAttribute(charName, attribute, "{}");
        result = {};
    }
    return result;
};

MML.getSkillAttributes = function getSkillAttributes(charName, skillType) {
    var character = MML.getCharFromName(charName);
    var attributes = findObjs({
        _type: "attribute",
        _characterid: character.get("_id")
    }, {
        caseInsensitive: false
    });
    var skills = {};
    var skill_data = {};

    _.each(attributes, function(attribute) {
        var attributeName = attribute.get("name");

        if (attributeName.indexOf("repeating_" + skillType) !== -1) {
            var attributeString = attributeName.split("_");
            var _id = attributeString[2];
            var property = attributeString[3];
            var value = attribute.get("current");
            _.each(skills, function(skill, key) {
                if (key.toLowerCase() === _id) {
                    _id = key;
                }
            });
            if (_.isUndefined(skill_data[_id])) {
                skill_data[_id] = {
                    name: "",
                    input: 0,
                    level: 0
                };
            }
            if (property === "name") {
                skill_data[_id][property] = value;
            } else if (isNaN(parseFloat(value))) {
                skill_data[_id][property] = 0;
            } else {
                skill_data[_id][property] = parseFloat(value);
            }
        }
    });
    _.each(skill_data, function(skill, _id) {
        if (skill.name !== "") {
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
    MML.getCharAttribute(charName, attribute).set("current", value);
};

MML.setMaxAttribute = function setMaxAttribute(charName, attribute, value) {
    MML.getCharAttribute(charName, attribute).set("max", value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
    return table[inputValue][attribute];
};

// Token Functions
MML.getCharFromToken = function getCharFromToken(token) {
    var tokenObject = getObj("graphic", token.id);
    var charName = getObj("character", tokenObject.get("represents"));

    if(_.isUndefined(charName)){
        tokenObject.set("tint_color", "#FFFF00");
        sendChat("Error", "Selected Token(s) not associated to a character.");
    }
    else{
        charName = charName.get("name");
        return charName;
    }
};

MML.getTokenFromChar = function getTokenFromChar(charName) {
    var character = MML.getCharFromName(charName);

    var tokens = findObjs({
        _pageid: Campaign().get("playerpageid"),
        _type: "graphic",
        _subtype: "token",
        represents: character.get("_id")
    });

    return tokens[0];
};

MML.getSelectedTokens = function getSelectedTokens(selected) {
    tokens = [];

    var index;
    for (index in selected) {
        tokens.push(getObj("graphic", selected[index]._id));
    }
    return tokens;
};

MML.getSelectedCharNames = function getSelectedCharNames(selected) {
    characters = [];

    var index;
    _.each(selected, function(object) {
        if (object._type === "graphic") {
            characters.push(MML.getCharFromToken(getObj("graphic", object._id)));
        }
    });
    return characters;
};

MML.getDistance = function getDistance(left1, left2, top1, top2) {
    var pixelPerFoot = 14;
    var leftDistance = Math.abs(left2 - left1);
    var topDistance = Math.abs(top2 - top1);
    var distance = Math.sqrt(leftDistance * leftDistance + topDistance * topDistance) / pixelPerFoot;
    distance = Math.floor(distance + 0.5);
    return distance;
};

MML.getDistanceBetweenChars = function getDistanceBetweenChars(charName, targetName) {
    var charToken = MML.getTokenFromChar(charName);
    var targetToken = MML.getTokenFromChar(targetName);

    return MML.getDistance(charToken.get("left"), targetToken.get("left"), charToken.get("top"), targetToken.get("top"));
};

// Code borrowed from The Aaron from roll20.net forums
var generateUUID = (function() {
    "use strict";

    var a = 0,
        b = [];
    return function() {
        var c = (new Date()).getTime() + 0,
            d = c === a;
        a = c;
        for (var e = new Array(8), f = 7; 0 <= f; f--) {
            e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
            c = Math.floor(c / 64);
        }
        c = e.join("");
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
            c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
        }
        return c;
    };
}()),

generateRowID = function() {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
};

// Rolling Functions
MML.rollDice = function rollDice(amount, size) {
    var value = 0;

    for (i = 0; i < amount; i++) {
        value += randomInteger(size);
    }
    return value;
};

MML.rollDamage = function rollDamage(input) {
    var diceArray = input.weaponDamage.split("d");
    var amount = diceArray[0] * 1;
    var size = diceArray[1] * 1;
    var damageMod = 0;
    var value;

    var mod;
    _.each(input.mods, function(mod) {
        damageMod += mod;
    });

    if (input.attackRollResult === "Critical Success") {
        value = -(MML.rollDice(amount, size) + amount * size + damageMod);
        range = (amount * size + amount + damageMod) + "-" + (2 * amount * size + damageMod);
    } else {
        value = -(MML.rollDice(amount, size) + damageMod);
        range = (amount + damageMod) + "-" + (amount * size + damageMod);
    }

    var roll = {
        type: "damage",
        character: this.name,
        accepted: false,
        value: value,
        range: range,
        message: "Roll: " + value + "\nRange: " + range,
        rollResultFunction: input.rollResultFunction
    };

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: roll
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: input.rollResultFunction,
        input: {}
    });
};

MML.universalRoll = function universalRoll(input) {
    // log("universalRoll");
    // log(input.rollResultFunction);
    // log(input.mods);
    var target = 0;

    var mod;
    _.each(input.mods, function(mod) {
        target += mod;
    });

    var roll = {
        type: "universal",
        character: this.name,
        rollResultFunction: input.rollResultFunction,
        value: MML.rollDice(1, 100),
        range: "1-100",
        target: target,
        accepted: false
    };

    roll = MML.universalRollResult(roll);

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: roll
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: input.rollResultFunction,
        input: {}
    });
};

MML.universalRollResult = function universalRollResult(roll) {
    if (roll.value > 94) {
        roll.result = "Critical Failure";
    } else {
        if (roll.value <= roll.target) {
            if (roll.value <= Math.round(roll.target / 10)) {
                roll.result = "Critical Success";
            } else {
                roll.result = "Success";
            }
        } else {
            roll.result = "Failure";
        }
    }

    roll.message = "Roll: " + roll.value +
        "\nTarget: " + roll.target +
        "\nResult: " + roll.result +
        "\nRange: " + roll.range;

    return roll;
};

MML.attributeCheckRoll = function attributeCheckRoll(attribute, mods) {
    var target = this[attribute];

    var mod;
    for (mod in mods) {
        target += mods[mod];
    }

    var roll = {
        name: "attribute",
        player: this.player,
        value: MML.rollDice(1, 20),
        range: "1-20",
        target: target,
        accepted: false
    };

    roll = MML.attributeCheckResult(roll);

    return roll;
};

MML.attributeCheckResult = function attributeCheckResult(roll) {
    if ((roll.value <= roll.target || roll.value === 1) && (roll.value !== 20)) {
        roll.result = "Success";
    } else {
        roll.result = "Failure";
    }

    roll.message = "Roll: " + roll.value +
        "\nTarget: " + roll.target +
        "\nResult: " + roll.result +
        "\nRange: " + roll.range;

    return roll;
};

MML.displayGmRoll = function displayGmRoll(input) {
    sendChat(this.name, '/w "' + this.name + '" &{template:rollMenu} {{title=' + this.currentRoll.message + "}}");
    // if(this.currentRoll.type === "damage"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:damage} {{title=' + this.currentRoll.title + "}} {{value=" + this.currentRoll.value + "}} {{type=" + this.currentRoll.type + "}} {{range=" + this.currentRoll.range + "}} ");
    // }
    // else if(this.currentRoll.type === "universal" || this.currentRoll.type === "attribute"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:universal} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{target=" + this.currentRoll.target + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }
    // else if(this.currentRoll.type === "hitPosition"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:hitPosition} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }

};

//Menu Functions
MML.displayMenu = function displayMenu(input) {
    var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';

    _.each(this.buttons, function(button) {
        var noSpace = button.text.replace(/\s+/g, '');
        var command = JSON.stringify({
            type: "player",
            who: this.name,
            input: {
                who: this.who,
                buttonText: button.text
            },
            triggeredFunction: "menuCommand"
        });

        // JSON strings screw up Command Buttons, convert to hex
        var hex, i;
        var result = "";
        for (i = 0; i < command.length; i++) {
            result += ("000" + command.charCodeAt(i).toString(16)).slice(-4);
        }


        toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!MML|' + result + ')}} ';
    }, this);
    sendChat(this.name, toChat, null, {
        noarchive: false
    }); //Change to true this when they fix the bug
};

MML.displayTargetSelection = function displayTargetSelection(input) {
    var inputJSON = JSON.stringify(input);

    // JSON strings screw up Command Buttons, convert to hex
    var hex, i;
    var result = "";
    for (i = 0; i < inputJSON.length; i++) {
        result += ("000" + inputJSON.charCodeAt(i).toString(16)).slice(-4);
    }

    sendChat("", "&{template:selectTarget} {{charName=" + input.charName + "}} {{input=" + result + "}}");
};
