
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
{"kc439wkco1c9in3p573":{"name":"Shovel","type":"weapon","weight":6,"grips":{"Two Hands":{"family":"Bludgeoning","hands":2,"primaryType":"Impact","primaryTask":35,"primaryDamage":"","secondaryType":"1d8","secondaryTask":0,"secondaryDamage":"","defense":15,"initiative":4,"rank":1}},"quality":"Standard"}}
MML.getWeaponSkill = function getWeaponSkill(character, hand){
    var item = character.inventory[character[hand]._id];
    var skillName;
    if(item.type !== "weapon"){
        log("Not a weapon");
        MML.error();
    }

    if(item.name === "War Spear" || item.name === "Boar Spear" || item.name === "Military Fork" || item.name === "Bastard Sword"){
        if(character["rightHand"].grip !== "Two Hands"){
            skillName = item.name + ", One Hand";
        }
        else{
            skillName = item.name + ", Two Hands";
        }
    }
    else{
        skillName = item.name;
    }

    if(typeof this.weaponSkills[skillName] !== "undefined"){
        skill = this.weaponSkills[attackerWeapon.name].level;
    }
    else if(){

    }
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
