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
        if (rolls.defenseRoll === "Critical Success" || rolls.defenseRoll === "Success") {
            MML.endAction();
        } else {
            MML.hitPositionRoll();
        }
    } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.attackRoll === "Critical Success") {
            MML.meleeDamageRoll(target, attackerWeapon, true);
        } else {
            MML.meleeDamageRoll(target, attackerWeapon, false);
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

    if (!_.isUndefined(parameters.wound)) {
        state.MML.GM.currentAction.parameters.wound = "complete";
        var damageAfterArmor = armorDamageReduction(rolls.hitPositionRoll.name, rolls.damageRoll.value, parameters.damageType, randomInteger(100));
        MML.alterHP(rolls.hitPositionRoll.bodyPart, damageAfterArmor);
    } else if (!_.isUndefined(parameters.multiWound)) {
        state.MML.GM.currentAction.parameters.multiWound = "complete";
        MML.setMultiWound();
    } else if (!_.isUndefined(parameters.sensitiveArea)) {
        state.MML.GM.currentAction.parameters.sensitiveArea = "complete";
        MML.sensitiveAreaCheck(rolls.hitPositionRoll.name);
    } else if (!_.isUndefined(parameters.knockdown)) {
        state.MML.GM.currentAction.parameters.knockdown = "complete";
        MML.knockdownCheck(rolls.damageRoll.value);
    } else {
        MML[callback]();
    }
};
