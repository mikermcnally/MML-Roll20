MML.isSensitiveArea = function isSensitiveArea(position){
    if(position === 2 || position === 6 || position === 33){
        return true;
    }
    else{
        return false;
    }
};

MML.getWeaponFamily = function getWeaponFamily(character, hand){
    var item = character.inventory[character[hand]._id];

    if(!_.isUndefined(item) && item.type === "weapon"){
        return item.grips[character[hand].grip].family;
    }
    else{
        return "unarmed";
    }
};

MML.getWeaponSkill = function getWeaponSkill(character, weapon){
    var item = weapon;
    var grip;
    var skillName;
    var skill;
    
    if(item.type !== "weapon"){
        log("Not a weapon");
        MML.error();
    }

    if(character["rightHand"].grip !== "unarmed"){
        grip = character["rightHand"].grip;
    }
    else{
        grip = character["leftHand"].grip;
    }

    if(item.name === "War Spear" || item.name === "Boar Spear" || item.name === "Military Fork" || item.name === "Bastard Sword"){
        skillName = item.name + ", " + grip;
    }
    else{
        skillName = item.name;
    }

    if(typeof character.weaponSkills[skillName] !== "undefined"){
        skill = character.weaponSkills[skillName].level;
    }
    else{
        var relatedSkills = [];
        _.each(character.weaponSkills, function(relatedSkill){
            if(MML.items[relatedSkill.replace(", " + grip, "")].grips[grip].family === item.grips[grip].family){
                relatedSkills.push(character.weaponSkills[relatedSkill].level);
            }
        }, character);

        if(relatedSkills.length === 0){
            skill = character.weaponSkills["Default Martial"].level;
        }
        else{
            skill = _.max(relatedSkills) - 10;
        }
    }

    return skill;
};

MML.isWieldingMissileWeapon = function isWieldingMissileWeapon(character){
    var leftFamily = MML.getWeaponFamily(character, "leftHand");
    var rightFamily = MML.getWeaponFamily(character, "rightHand");

    return (leftFamily === "MWD" || 
            rightFamily === "MWD" ||
            leftFamily === "MWM" ||
            rightFamily === "MWM" ||
            leftFamily === "TWH" ||
            rightFamily === "TWH" || 
            leftFamily === "TWK" ||
            rightFamily === "TWS" ||
            leftFamily === "TWS" ||
            rightFamily === "SLI" ||
            leftFamily === "SLI");
};

MML.isUnarmed = function isUnarmed(character){
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if(leftHand === "unarmed" && rightHand === "unarmed"){
        return true;
    }
    else{
        return false;
    }
};

MML.isDualWielding = function isDualWielding(character){
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if(character.leftHand._id !== character.rightHand._id &&
        leftHand !== "unarmed" &&
        rightHand !== "unarmed"){
        return true;
    }
    else{
        return false;
    }
};
