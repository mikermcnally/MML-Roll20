/* jshint -W069 */
MML.meleeAttackAction = function meleeAttackAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var attackerSkill = parameters.attackerSkill;
    var attackerWeapon = parameters.attackerWeapon;
    var target = parameters.target;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.attackRoll)) {
        MML.meleeAttackRoll("attackRoll", character, attackerWeapon.task, attackerSkill);
    } else if (_.isUndefined(rolls.defenseRoll)) {
        if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
            MML.meleeDefense(target, attackerWeapon);
        } else if (rolls.attackRoll === "Critical Failure") {
            MML.endAction();
        } else {
            MML.endAction();
        }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === "Critical Success") {
            MML.processCommand({
                type: "character",
                who: target.name,
                callback: "criticalDefense",
                input: {}
            });
        } else if (rolls.defenseRoll === "Success") {
            MML.endAction();
        } else {
            MML.hitPositionRoll(character);
        }
    } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.attackRoll === "Critical Success") {
            MML.meleeDamageRoll(character, attackerWeapon, true);
        } else {
            MML.meleeDamageRoll(character, attackerWeapon, false);
        }
    } else {
        MML.damageTargetAction("endAction");
    }
};

MML.missileAttackAction = function missileAttackAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var attackerSkill = parameters.attackerSkill;
    var attackerWeapon = parameters.attackerWeapon;
    var target = parameters.target;
    var range = parameters.range;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.attackRoll)) {
        MML.missileAttackRoll("attackRoll", character, attackerWeapon.task, attackerSkill, target);
    } else if (_.isUndefined(rolls.defenseRoll)) {
        if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
            MML.rangedDefense(target, attackerWeapon, range);
        } else if (rolls.attackRoll === "Critical Failure") {
            MML.endAction();
        } else {
            MML.endAction();
        }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === "Critical Success") {
            MML.processCommand({
                type: "character",
                who: target.name,
                callback: "criticalDefense",
                input: {}
            });
        } else if (rolls.defenseRoll === "Success") {
            MML.endAction();
        } else {
            MML.hitPositionRoll(character);
        }
    } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.attackRoll === "Critical Success") {
            MML.missileDamageRoll(character, attackerWeapon, true);
        } else {
            MML.missileDamageRoll(character, attackerWeapon, false);
        }
    } else {
        MML.damageTargetAction("endAction");
    }
};

MML.unarmedAttackAction = function unarmedAttackAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var attackerSkill = parameters.attackerSkill;
    var attackType = parameters.attackType;
    var target = parameters.target;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.attackRoll)) {
        MML.meleeAttackRoll("attackRoll", character, attackType.task, attackerSkill);
    } else if (_.isUndefined(rolls.defenseRoll)) {
        if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
            if (attackType.name === "Grapple" || attackType.name === "Place a Hold") {
                MML.grappleDefense(target);
            } else {
                MML.brawlDefense(target, attackType);
            }
        } else if (rolls.attackRoll === "Critical Failure") {
            MML.endAction();
        } else {
            MML.endAction();
        }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === "Critical Success") {
            MML.processCommand({
                type: "character",
                who: target.name,
                callback: "criticalDefense",
                input: {}
            });
        } else if (rolls.defenseRoll === "Success") {
            MML.endAction();
        } else {
            MML.hitPositionRoll(character);
        }
    } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.attackRoll === "Critical Success") {
            MML.meleeDamageRoll(character, attackType, true, bonusDamage);
        } else {
            MML.meleeDamageRoll(character, attackType, false, bonusDamage);
        }
    } else {
        MML.damageTargetAction("endAction");
    }
};

MML.grappleAttackAction = function grappleAttackAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var attackerSkill = parameters.attackerSkill;
    var attackType = parameters.attackType;
    var target = parameters.target;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.attackRoll)) {
        MML.meleeAttackRoll("attackRoll", character, attackType.task, attackerSkill);
    } else if (_.isUndefined(rolls.defenseRoll)) {
        if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
            if (attackType.name === "Grapple" || attackType.name === "Place a Hold") {
                MML.grappleDefense(target);
            } else {
                MML.brawlDefense(target, attackType);
            }
        } else if (rolls.attackRoll === "Critical Failure") {
            MML.endAction();
        } else {
            MML.endAction();
        }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === "Critical Success") {
            MML.processCommand({
                type: "character",
                who: target.name,
                callback: "criticalDefense",
                input: {}
            });
        } else if (rolls.defenseRoll === "Success") {
            MML.endAction();
        } else {
            MML.hitPositionRoll(character);
        }
    } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.attackRoll === "Critical Success") {
            MML.meleeDamageRoll(character, attackType, true, bonusDamage);
        } else {
            MML.meleeDamageRoll(character, attackType, false, bonusDamage);
        }
    } else {
        MML.damageTargetAction("endAction");
    }
};

MML.damageTargetAction = function damageTargetAction(callback) {
    var currentAction = state.MML.GM.currentAction;
    var parameters = currentAction.parameters;
    var target = parameters.target;
    var rolls = currentAction.rolls;

    if (_.isUndefined(parameters.damageApplied)) {
        state.MML.GM.currentAction.parameters.damageApplied = "complete";
        var damageAfterArmor = MML.armorDamageReduction(target, rolls.hitPositionRoll.name, rolls.damageRoll, parameters.damageType, randomInteger(100));
        MML.processCommand({
            type: "character",
            who: target.name,
            callback: "alterHP",
            input: {
                bodyPart: rolls.hitPositionRoll.bodyPart,
                hpAmount: damageAfterArmor
            }
        });
    } else if (_.isUndefined(parameters.multiWound)) {
        state.MML.GM.currentAction.parameters.multiWound = "complete";
        MML.processCommand({
            type: "character",
            who: target.name,
            callback: "setMultiWound",
            input: {}
        });
    } else if (_.isUndefined(parameters.sensitiveArea)) {
        state.MML.GM.currentAction.parameters.sensitiveArea = "complete";
        MML.sensitiveAreaCheck(target, rolls.hitPositionRoll.name);
    } else if (_.isUndefined(parameters.knockdown)) {
        state.MML.GM.currentAction.parameters.knockdown = "complete";
        MML.knockdownCheck(target, rolls.damageRoll.value);
    } else {
        MML[callback]();
    }
};

MML.observeAction = function observeAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;

    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "setApiCharAttributeJSON",
        input: {
            attribute: "statusEffects",
            index: "Observe",
            value: {
                id: generateRowID(),
                name: "Observe",
                startingRound: state.MML.GM.currentRound
            }
        }
    });
    MML.processCommand({
        type: "player",
        who: character.player,
        callback: "charMenuObserveAction",
        input: {
            who: character.name
        }
    });
    MML.processCommand({
        type: "player",
        who: character.player,
        callback: "displayMenu",
        input: {}
    });
};

MML.readyItemAction = function readyItemAction() {};

MML.castSpellAction = function castSpellAction() {};

MML.endAction = function endAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var spentInitiative = character.spentInitiative + character.actionTempo;
    var currentInitiative = character.initiative + spentInitiative;

    // Prevents character from gaining initiative when these status effects are removed
    if (_.has(this.statusEffects, "Called Shot") || _.has(this.statusEffects, "Called Shot Specific")) {
        spentInitiative += -5;
    }

    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "spentInitiative",
            value: spentInitiative
        }
    });
    if (currentInitiative > 0) {
        MML.processCommand({
            type: "player",
            who: character.player,
            callback: "charMenuPrepareAction",
            input: {
                who: character.name
            }
        });
        MML.processCommand({
            type: "player",
            who: character.player,
            callback: "displayMenu",
            input: {}
        });
    } else {
        MML.processCommand({
            type: "GM",
            callback: "nextAction",
            input: {}
        });
    }
};
