
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
