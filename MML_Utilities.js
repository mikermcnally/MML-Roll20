// Character Functions
MML.getCharFromName = function getCharFromName(charName){
    var character = findObjs({
        _type: "character",
        archived: false,
        name: charName
    }, {caseInsensitive: false});
    
    return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, character){
    createObj("attribute", {
            name: name,
            current: current,
            max: max,
            characterid: character.id
        });
};

MML.createAttributesFromArray = function createAttributesFromArray(inputArray, character){
    _.each(inputArray, function(attribute){
        MML.createAttribute(attribute.name, attribute.current, attribute.max, character);
    });
};

MML.createAbility = function createAbility(name, action, istokenaction, character){
    createObj("ability", {
            name: name,
            action: action,
            istokenaction: istokenaction,
            characterid: character.id
        });
};

MML.getCharAttribute = function getCharAttribute(charName, attribute){
    var character = MML.getCharFromName(charName);
    
    var charAttribute = findObjs({
        _type: "attribute",
        _characterid: character.get("_id"),
        name: attribute
    }, {caseInsensitive: false})[0];
    
    if(typeof(charAttribute) === "undefined"){
        MML.createAttribute(attribute, "", "", MML.getCharFromName(charName));
        charAttribute = MML.getCharAttribute(charName, attribute);
    }

    return charAttribute;
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute){
    return MML.getCharAttribute(charName, attribute).get("current");
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(charName, attribute){
    var result = parseFloat(MML.getCurrentAttribute(charName, attribute));
    // log(result);
    if(isNaN(result)){
        MML.setCurrentAttribute(charName, attribute, 0);
        result = 0;
    }

    return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(charName, attribute){
    var result =  parseFloat(MML.getCharAttribute(charName, attribute).get("max"));

    if(isNaN(result)){
        MML.setMaxAttribute(charName, attribute, 0);
        result = 0;
    }

    return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(charName, attribute){
    var result = MML.getCurrentAttribute(charName, attribute);
    if(result === "true"){ return true; }
    else{ return false; }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(charName, attribute){
    var result = MML.getCurrentAttribute(charName, attribute);

    if(result === "" || isNaN(result) || _.isUndefined(result)){
        MML.setCurrentAttribute(charName, attribute, "{}");
        result = MML.getCurrentAttribute(charName, attribute);
    }
    return JSON.parse(result);
};

MML.getSkillAttributes = function getSkillAttributes(charName, skillType){
    var character = MML.getCharFromName(charName);
    var attributes = findObjs({
        _type: "attribute",
        _characterid: character.get("_id")
    }, {caseInsensitive: false});
    var skills = {};
    
    _.each(attributes, function(attribute){
        var attributeName = attribute.get("name");

        if(attributeName.indexOf("repeating_" + skillType) !== -1){
            var attributeString = attributeName.split("_");
            var _id = attributeString[2];
            var property = attributeString[3];
            var value = attribute.get("current");
            _.each(skills, function(skill, key){
                if(key.toLowerCase() === _id){
                    _id = key;
                }
            });
            if(_.isUndefined(skills[_id])){
                skills[_id] = {name: "Acrobatics", input: 0, level: 0};
            }
            if(property === "name"){
                skills[_id][property] = value;
            }
            else if(isNaN(parseFloat(value))){
                skills[_id][property] = 0;
            }
            else{
                skills[_id][property] = parseFloat(value);
            }
        }
    });
    return skills;
};

MML.setCurrentAttribute = function setCurrentAttribute(charName, attribute, value){
    MML.getCharAttribute(charName, attribute).set("current", value);
};

MML.setMaxAttribute = function setMaxAttribute(charName, attribute, value){
    MML.getCharAttribute(charName, attribute).set("max", value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table){
    return table[inputValue][attribute];
};

// Token Functions
MML.getCharFromToken = function getCharFromToken(token){
    var tokenObject = getObj("graphic", token.id);
    var charName = getObj("character", tokenObject.get("represents"));
    charName = charName.get("name");
    return charName;
};

MML.getTokenFromChar = function getTokenFromChar(charName){
    var character = MML.getCharFromName(charName);
    
    var tokens = findObjs({                              
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        _subtype: "token",
        represents: character.get("_id")
        });
    
    return tokens[0];
};

MML.getSelectedTokens = function getSelectedTokens(selected){
    tokens = [];
    
    var index;
    for(index in selected){
        tokens.push(getObj("graphic", selected[index]._id));
    }
    return tokens;
};

MML.getSelectedCharNames = function getSelectedCharNames(selected){
    characters = [];
    
    var index;
    for(index in selected){
        characters.push(MML.getCharFromToken(getObj("graphic", selected[index]._id)));
    }
    return characters;
};

MML.getDistance = function getDistance(left1, left2, top1, top2){
    var pixelPerFoot = 14;
    var leftDistance = Math.abs(left2 - left1);
    var topDistance = Math.abs(top2 - top1);
    var distance = Math.sqrt(leftDistance*leftDistance + topDistance*topDistance)/pixelPerFoot;
    distance = Math.floor(distance + 0.5);
    return distance;
};

MML.getDistanceBetweenChars = function getDistanceBetweenChars(charName, targetName){
    var charToken = MML.getTokenFromChar(charName);
    var targetToken = MML.getTokenFromChar(targetName);
    
    return MML.getDistance(charToken.get("left"), targetToken.get("left"), charToken.get("top"), targetToken.get("top")); 
};

MML.createItemId = function createItemId() {
    //Based on this code: http://stackoverflow.com/a/10727155
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (var i = 19; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

// Rolling Functions
MML.rollDice = function rollDice(amount, size) {
    var value = 0;
    
    for (i = 0; i < amount; i++){
        value += randomInteger(size);
    }
    return value;
};

MML.rollDamage = function rollDamage(diceString, mods, crit, type){
    var diceArray = diceString.split("d");
    var amount = diceArray[0]*1;
    var size = diceArray[1]*1;
    var damageMod = 0;
    var roll = {};
    
    var mod;
    for(mod in mods){
        damageMod += mods[mod];
    }
    
    if(crit === "Critical Success"){
        roll = { name: "damage", value: -(MML.rollDice(amount, size) + amount*size + damageMod), type: type, range: "" + ((amount*size) + amount + damageMod) + "-" + (2*amount*size + damageMod) + "", accepted: false };
    }
    else{
        roll = { name: "damage", value: -(MML.rollDice(amount, size) + damageMod), type: type, range: "" + amount + "-" + (amount*size + damageMod) + "", accepted: false };
    }
    return roll;
};

MML.universalRoll = function universalRoll(mods){
    var target = 0;

    var mod;
    for(mod in mods){
        target += mods[mod];
    }
    
    var roll = { name: "universal", player: this.player, value: MML.rollDice(1, 100), range: "1-100", target: target, result: "", accepted: false };
    
    roll = MML.universalRollResult(roll);
    
    return roll;
};

MML.universalRollResult = function universalRollResult(roll){       
    if (roll.value > 94){
        roll.result = "Critical Failure";
    }
    else {
        if (roll.value <= roll.target){
            if (roll.value <= Math.round(roll.target/10)){
                roll.result = "Critical Success";
            }
            else {
                roll.result = "Success";
            }
        }
        else {
            roll.result = "Failure";
        }
    }
    
    return roll;
};

MML.attributeCheckRoll = function attributeCheckRoll(attribute, mods){
    var target = this[attribute];
    
    var mod;
    for(mod in mods){
        target += mods[mod];
    }
    
    var roll = { name: "attribute", player: this.player, value: MML.rollDice(1, 20), range: "1-20", target: target, result: "", accepted: false };
    
    roll = MML.attributeCheckResult(roll);
    log(attribute + ": " +roll.result);
    return roll;
};

MML.attributeCheckResult = function attributeCheckResult(roll){       
    if ((roll.value <= roll.target || roll.value === 1) && (roll.value !== 20)){
        roll.result = "Success";        
    }
    else {
        roll.result = "Failure";
    }
    return roll;
};

MML.displayGmRoll = function displayGmRoll(input){
    sendChat(this.name, '/w "' + this.name + '" &{template:rollMenu} {{title=' + this.currentRoll.message + "}}");
    // if(this.currentRoll.name === "damage"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:damage} {{title=' + this.currentRoll.title + "}} {{value=" + this.currentRoll.value + "}} {{type=" + this.currentRoll.type + "}} {{range=" + this.currentRoll.range + "}} ");
    // }
    // else if(this.currentRoll.name === "universal" || this.currentRoll.name === "attribute"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:universal} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{target=" + this.currentRoll.target + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }
    // else if(this.currentRoll.name === "hitPosition"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:hitPosition} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }
    
};

//Menu Functions
MML.displayMenu = function displayMenu(input){
    var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';

    _.each(this.buttons, function(button){
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
        for (i=0; i<command.length; i++){
            result += ("000"+command.charCodeAt(i).toString(16)).slice(-4);
        }

        
        toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!' + result + ')}} ';
    }, this);
    sendChat(this.name, toChat, null, {noarchive: false}); //Change to true this when they fix the bug
};

// MML.displayMenu = function displayMenu(){
//     var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';
//     _.each(this.buttons, function(button){
//         var noSpace = button.text.replace(/\s+/g, '');
//         toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!menu ' +  button.text + ')}} ';
//     }, this);
//     sendChat(this.name, toChat, null, {noarchive: false}); //Change to true this when they fix the bug
// };

// NEEDS WORK. Attacks from above and below need to be added. Use arrays instead of switches on the hit positions for cleaner code
MML.rollHitPosition = function rollHitPosition(){
    var position;
    var defender = state.MML.GM.characters[this.action.targets[0]];
      
    switch(this.action.calledShot){            
        
        case "head":
            positionArray = [1, 2, 3, 4, 5, 6, 7];
            position = positionArray[MML.rollDice(1, 7) - 1];
            break;
        case "chest":
            positionArray = [9, 10, 11, 12, 15, 16, 17, 18];
            position = positionArray[MML.rollDice(1, 8) - 1];
            break;
        case "abdomen":
            positionArray = [21, 22, 23, 24, 27, 28, 29, 30, 33];
            position = positionArray[MML.rollDice(1, 9) - 1];
            break;
        case "leftArm":
            positionArray = [13, 19, 25, 31, 34];
            position = positionArray[MML.rollDice(1, 5) - 1];
            break;
        case "rightArm":
            positionArray = [8, 14, 20, 26, 32];
            position = positionArray[MML.rollDice(1, 5) - 1];
            break;  
        case "leftLeg":
            positionArray = [36, 38, 40, 42, 44, 46];
            position = positionArray[MML.rollDice(1, 6) - 1];
            break;  
        case "rightLeg":
            positionArray = [35, 37, 39, 41, 43, 45];
            position = positionArray[MML.rollDice(1, 6) - 1];
            break;  
        default: // Use this for targeting specific hit positions
            position = this.action.calledShot;
            break;
    }
    
    // Deal with elevation here
    return { name: "hitPosition", range: "1-46",  result: MML.hitPositions[position].name, value: position };

};