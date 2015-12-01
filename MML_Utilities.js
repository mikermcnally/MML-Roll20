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
    for (var index in inputArray) {
        MML.createAttribute(inputArray[index].name, inputArray[index].current, inputArray[index].max, character);
    }
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
    }, {caseInsensitive: false});
    
    return charAttribute[0];
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute){
    var result = MML.getCharAttribute(charName, attribute).get("current");
    return result;
};

MML.getCurrentAttributeAsInt = function getCurrentAttributeAsInt(charName, attribute){
    log(MML.getCharAttribute(charName, attribute));
    var result = parseInt(MML.getCharAttribute(charName, attribute).get("current"));
    return result;
};

MML.getMaxAttributeAsInt = function getMaxAttributeAsInt(charName, attribute){
    state.MML.GM.characters[charName][attribute] = MML.getCharAttribute(charName, attribute).get("max")*1;
};

MML.getAttributesFromArray = function getAttributesFromArray(inputArray, charName){
    var outputArray = [];    
    for (var index in inputArray) {
        var attribute =  MML.getCharAttribute(charName, inputArray[index].name);
        outputArray[attribute.get("name")] = attribute;
    }
    return outputArray;
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
    for (index in selected){
        
        tokens.push(getObj("graphic", selected[index]._id));
    }
    return tokens;
};

MML.getDistance = function getDistance(left1, left2, top1, top2){
    var pixelPerFoot = 14;
    var leftDistance = Math.abs(left1 - left2);
    var topDistance = Math.abs(top1 - top2);
    var distance = 0;
    
    distance = Math.sqrt(leftDistance*leftDistance + topDistance*topDistance)/pixelPerFoot;
    distance = Math.floor(distance + 0.5);
    return distance;
};

MML.getDistanceBetweenChars = function getDistanceBetweenChars(charName, targetName){
    var charToken = MML.getTokenFromChar(charName);
    var targetToken = MML.getTokenFromChar(targetName);
    
    return MML.getDistance(charToken.get("left"), targetToken.get("left"), charToken.get("top"), targetToken.get("top")); 
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

MML.displayRoll = function displayRoll(){
    this.currentRoll.accepted = false;

    if(this.currentRoll.name === "damage"){
        sendChat(this.name, '/w "' + this.player + '" &{template:damage} {{title=' + this.currentRoll.title + "}} {{value=" + this.currentRoll.value + "}} {{type=" + this.currentRoll.type + "}} {{range=" + this.currentRoll.range + "}} ");
    }
    else if(this.currentRoll.name === "universal" || this.currentRoll.name === "attribute"){
        sendChat(this.name, '/w "' + this.player + '" &{template:universal} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{target=" + this.currentRoll.target + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    }
    else if(this.currentRoll.name === "hitPosition"){
        sendChat(this.name, '/w "' + this.player + '" &{template:hitPosition} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    }
    
};

//Menu Functions
MML.displayMenu = function displayMenu(){
    this.setMenu();

    var menu = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} '; //"/ &{template:charMenu} {{name=" + message + "}} "
    
    var index;
    for(index in this.buttons){
        var noSpace = this.buttons[index].text.replace(/\s+/g, '');
        menu = menu + '{{' + noSpace + '=[' + this.buttons[index].text + '](!menu|' + this.character + '|' + this.buttons[index].text + ')}} ';
    }

    sendChat(this.name, menu, null, {noarchive: false}); //Change to true this when they fix the bug
};

// NEEDS WORK. Attacks from above and below need to be added. Use arrays instead of switches on the hit positions for cleaner code
MML.rollHitPosition = function rollHitPosition(){
    var position;
    var defender = state.MML.GM.characters[this.action.targets[0]];
      
    switch(this.action.calledShot){            
        case "standard":
            switch (defender.defense.hitTable){
                case "A":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                            position = 8;
                            break;
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                            position = 9;
                            break;
                        case 20:
                        case 21:
                            position = 10;
                            break;
                        case 22:
                        case 23:
                        case 24:
                        case 25:
                            position = 11;
                            break;
                        case 26:
                        case 27:
                            position = 12;
                            break;
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                            position = 13;
                            break;
                        case 32:
                        case 33:
                        case 34:
                            position = 14;
                            break;
                        case 35:
                        case 36:
                            position = 15;
                            break;
                        case 37:
                        case 38:
                            position = 16;
                            break;
                        case 39:
                        case 40:
                        case 41:
                            position = 17;
                            break;
                        case 42:
                        case 43:
                            position = 18;
                            break;
                        case 44:
                        case 45:
                        case 46:
                        case 47:
                            position = 19;
                            break;
                        case 48:
                        case 49:
                            position = 20;
                            break;
                        case 50:
                        case 51:
                        case 52:
                            position = 21;
                            break;
                        case 53:
                        case 54:
                            position = 22;
                            break;
                        case 55:
                        case 56:
                        case 57:
                            position = 23;
                            break;
                        case 58:
                        case 59:
                            position = 24;
                            break;
                        case 60:
                        case 61:
                            position = 25;
                            break;
                        case 62:
                        case 63:
                            position = 26;
                            break;
                        case 64:
                        case 65:
                        case 66:
                            position = 27;
                            break;
                        case 67:
                        case 68:
                            position = 28;
                            break;
                        case 69:
                        case 70:
                        case 71:
                            position = 29;
                            break;
                        case 72:
                        case 73:
                            position = 30;
                            break;
                        case 74:
                        case 75:
                            position = 31;
                            break;
                        case 76:
                        case 77:
                            position = 32;
                            break;
                        case 78:
                            position = 33;
                            break;
                        case 79:
                        case 80:
                            position = 34;
                            break;
                        case 81:
                        case 82:
                        case 83:
                            position = 35;
                            break;
                        case 84:
                        case 85:
                        case 86:
                            position = 36;
                            break;
                        case 87:
                        case 88:
                            position = 37;
                            break;
                        case 89:
                        case 90:
                            position = 38;
                            break;
                        case 91:
                        case 92:
                            position = 39;
                            break;
                        case 93:
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
                case "B":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                            position = 8;
                            break;
                        case 16:
                        case 17:
                            position = 9;
                            break;
                        case 18:
                        case 19:
                            position = 10;
                            break;
                        case 20:
                        case 21:
                            position = 11;
                            break;
                        case 22:
                        case 23:
                            position = 12;
                            break;
                        case 24:
                        case 25:
                        case 26:
                        case 27:
                            position = 13;
                            break;
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                            position = 14;
                            break;
                        case 32:
                        case 33:
                            position = 15;
                            break;
                        case 34:                        
                        case 35:
                            position = 16;
                            break;
                        case 36:
                        case 37:
                            position = 17;
                            break;
                        case 38:                            
                        case 39:
                            position = 18;
                            break;
                        case 40:
                        case 41:                            
                        case 42:
                        case 43:
                            position = 19;
                            break;
                        case 44:
                            position = 20;
                            break;
                        case 45:
                        case 46:
                            position = 21;
                            break;
                        case 47:                            
                        case 48:
                            position = 22;
                            break;
                        case 49:                            
                        case 50:
                            position = 23;
                            break;
                        case 51:
                        case 52:
                            position = 24;
                            break;
                        case 53:
                            position = 25;
                            break;
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                            position = 26;
                            break;
                        case 58:
                        case 59:
                            position = 27;
                            break;
                        case 60:
                        case 61:
                            position = 28;
                            break;
                        case 62:
                        case 63:
                            position = 29;
                            break;
                        case 64:
                        case 65:
                            position = 30;
                            break;
                        case 66:
                        case 67:
                        case 68:
                        case 69:
                            position = 31;
                            break;
                        case 70:
                        case 71:
                        case 72:
                            position = 32;
                            break;
                        case 73:
                            position = 33;
                            break;
                        case 74:
                        case 75:
                        case 76:
                            position = 34;
                            break;
                        case 77:
                        case 78:
                        case 79:
                        case 80:
                            position = 35;
                            break;
                        case 81:
                        case 82:
                        case 83:
                        case 84:
                            position = 36;
                            break;
                        case 85:
                        case 86:
                        case 87:
                            position = 37;
                            break;
                        case 88:
                        case 89:
                        case 90:
                            position = 38;
                            break;
                        case 91:
                        case 92:
                            position = 39;
                            break;
                        case 93:
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
                case "C":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                        case 16:
                            position = 8;
                            break;
                        case 17:
                        case 18:
                        case 19:
                        case 20:
                            position = 9;
                            break;
                        case 21:
                        case 22:
                        case 23:
                            position = 10;
                            break;
                        case 24:
                        case 25:
                            position = 11;
                            break;
                        case 26:
                        case 27:
                        case 28:
                        case 29:
                            position = 12;
                            break;
                        case 30:
                        case 31:
                        case 32:
                            position = 13;
                            break;
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                            position = 14;
                            break;
                        case 38:
                        case 39:
                            position = 15;
                            break;
                        case 40:
                            position = 16;
                            break;
                        case 41:
                            position = 17;
                            break;
                        case 42:
                        case 43:
                            position = 18;
                            break;
                        case 44:
                            position = 19;
                            break;
                        case 45:
                        case 46:
                            position = 20;
                            break;
                        case 47:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                            position = 21;
                            break;
                        case 52:
                            position = 22;
                            break;
                        case 53:
                        case 54:
                            position = 23;
                            break;
                        case 55:
                        case 56:
                        case 57:
                            position = 24;
                            break;
                        case 58:
                            position = 25;
                            break;
                        case 59:
                        case 60:
                        case 61:
                        case 62:
                        case 63:
                            position = 26;
                            break;
                        case 64:
                        case 65:
                        case 66:
                        case 67:
                        case 68:
                            position = 27;
                            break;
                        case 69:
                            position = 28;
                            break;
                        case 70:
                            position = 29;
                            break;
                        case 71:
                        case 72:
                        case 73:
                        case 74:
                            position = 30;
                            break;
                        case 75:
                            position = 31;
                            break;
                        case 76:
                        case 77:
                        case 78:
                        case 79:
                            position = 32;
                            break;
                        case 80:
                            position = 33;
                            break;
                        case 81:
                            position = 34;
                            break;
                        case 82:
                        case 83:
                        case 84:
                        case 85:
                            position = 35;
                            break;
                        case 86:
                            position = 36;
                            break;
                        case 87:
                        case 88:
                        case 89:
                        case 90:                            
                            position = 37;
                            break;
                        case 91:
                            position = 38;
                            break;
                        case 92:
                        case 93:
                            position = 39;
                            break;
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
            }
            break;
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
