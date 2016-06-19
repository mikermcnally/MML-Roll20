/* jshint -W069 */
MML.isSensitiveArea = function isSensitiveArea(position) {
    if (position === 2 || position === 6 || position === 33) {
        return true;
    } else {
        return false;
    }
};

MML.getWeaponFamily = function getWeaponFamily(character, hand) {
    var item = character.inventory[character[hand]._id];

    if (!_.isUndefined(item) && item.type === "weapon") {
        return item.grips[character[hand].grip].family;
    } else {
        return "unarmed";
    }
};

MML.getShieldDefenseBonus = function getShieldBonus(character) {
    var rightHand = character.inventory[character.rightHand._id];
    var leftHand = character.inventory[character.leftHand._id];
    var bonus = 0;

    if (!_.isUndefined(rightHand) && rightHand.type === "shield") {
        bonus = rightHand.defenseMod;
    }
    if (!_.isUndefined(leftHand) && leftHand.type === "shield" && leftHand.defenseMod > rightHand.defenseMod) {
        bonus = leftHand.defenseMod;
    }
    return bonus;
};

MML.getWeaponGrip = function getWeaponGrip(character, weapon) {
    if (character["rightHand"].grip !== "unarmed") {
        grip = character["rightHand"].grip;
    } else {
        grip = character["leftHand"].grip;
    }
};

MML.getWeaponSkill = function getWeaponSkill(character, weapon) {
    var item = weapon;
    var grip;
    var skillName;
    var skill;

    if (item.type !== "weapon") {
        log("Not a weapon");
        MML.error();
    }

    if (character["rightHand"].grip !== "unarmed") {
        grip = character["rightHand"].grip;
    } else {
        grip = character["leftHand"].grip;
    }

    if (item.name === "War Spear" || item.name === "Boar Spear" || item.name === "Military Fork" || item.name === "Bastard Sword") {
        skillName = item.name + ", " + grip;
    } else {
        skillName = item.name;
    }

    if (typeof character.weaponSkills[skillName] !== "undefined") {
        skill = character.weaponSkills[skillName].level;
    } else {
        var relatedSkills = [];
        _.each(character.weaponSkills, function(relatedSkill, skillName) {
            if (skillName !== "Default Martial") {
                _.each(MML.items[skillName.replace(", " + grip, "")].grips, function(skillFamily) {
                    if (skillFamily.family === item.grips[grip].family) {
                        relatedSkills.push(relatedSkill);
                    }
                });
            }
        }, character);

        if (relatedSkills.length === 0) {
            skill = character.weaponSkills["Default Martial"].level;
        } else {
            skill = _.max(relatedSkills, function(skill) {
                return skill.level;
            }).level - 10;
        }
    }
    return skill;
};

MML.isWieldingRangedWeapon = function isWieldingRangedWeapon(character) {
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

MML.isUnarmed = function isUnarmed(character) {
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if (leftHand === "unarmed" && rightHand === "unarmed") {
        return true;
    } else {
        return false;
    }
};

MML.isDualWielding = function isDualWielding(character) {
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if (character.leftHand._id !== character.rightHand._id &&
        leftHand !== "unarmed" &&
        rightHand !== "unarmed") {
        return true;
    } else {
        return false;
    }
};

MML.getHitPosition = function getHitPosition(character, rollValue) {
    if (isNaN(rollValue)) {
        return "Error: Value is not a number";
    } else if (rollValue < 1 || rollValue > 100) {
        return "Error: Value out of range";
    } else {
        return MML.hitPositions[character.bodyType][MML.hitTables[character.bodyType][character.hitTable][rollValue]];
    }
};

MML.getHitTable = function getHitTable(character) {
    var table;
    switch (character.bodyType) {
        case "humanoid":
            if (character.inventory[character.rightHand._id].type === "shield" || character.inventory[character.leftHand._id].type === "shield") {
                table = "C";
            } else if (MML.isWieldingRangedWeapon(character) || MML.isUnarmed(character) || !(character.inventory[character.leftHand._id].type === "weapon" && character.inventory[character.rightHand._id].type === "weapon")) {
                table = "A";
            } else {
                table = "B";
            }
            break;
        default:
            log("Error: Body type not found");
            table = "Error: Body type not found";
            break;
    }
    return table;
};

MML.getHitPositionNames = function getHitPositionNames(character) {
    if(_.isUndefined(MML.hitPositions[character.bodyType])){
        return "Error: Body type not found";
    }
    else {
        return _.pluck(MML.hitPositions[character.bodyType], "name");
    }
}

MML.getBodyParts = function getBodyParts(character) {
    if(_.isUndefined(MML.hitPositions[character.bodyType])){
        return "Error: Body type not found";
    }
    else {
        return _.chain(MML.hitPositions[character.bodyType]).pluck("bodyPart").uniq().value();
    }
};

MML.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
    var availableHitPositions = _.where(MML.hitPositions[character.bodyType], { bodyPart: bodyPart });

    if (availableHitPositions.length < 1) {
        return "Error: No hit positions found";
    }
    else {
        return availableHitPositions;
    }
};

MML.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
    var availableHitPositions = MML.getAvailableHitPositions(character, bodyPart);

    if (isNaN(rollValue)) {
        return "Error: Value is not a number";
    }
    else if (availableHitPositions === "Error: No hit positions found") {
        return availableHitPositions;
    }
    else if (rollValue < 1 || rollValue > availableHitPositions.length) {
        return "Error: Value out of range";
    } else {
        return availableHitPositions[rollValue-1];
    }
};
