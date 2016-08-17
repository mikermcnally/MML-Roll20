/* jshint -W069 */
MML.meleeAttackAction = function meleeAttackAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var attackerSkill = parameters.attackerSkill;
    var attackerWeapon = parameters.attackerWeapon;
    var target = parameters.target;
    var targetWeapon = parameters.targetWeapon;
    var defenseSkill = parameters.defenseSkill;
    var dodgeSkill = parameters.dodgeSkill;
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
        if (rolls.defenseRoll === "Critical Success"){
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

MML.endAction = function endAction() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var spentInitiative = character.spentInitiative + character.actionTempo;
    var currentInitiative = character.initiative + spentInitiative;

    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "spentInitiative",
            value: spentInitiative
        }
    });
    if(currentInitiative > 0) {
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
