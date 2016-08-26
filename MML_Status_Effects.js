/* jshint -W069 */
MML.statusEffects = {};
// MML.statusEffects["Major Wound"] = function(character){
//     this.bodyPart = "";
//     this.duration = 1;
//
//     this.compute = function(effect, index){
//         if(this[effect.bodyPart] > Math.round(this[effect.bodyPart + "Max"]/2)){
//             delete this.statusEffects[index];
//         }
//         else{
//             if(this.situationalInitBonus !== "No Combat"){
//                 this.situationalInitBonus += -5;
//             }
//             if(effect.duration > 0){
//                 this.situationalMod += -10;
//             }
//         }
//     };
// };



MML.statusEffects["Major Wound"] = function(effect, index) {
    if (this.hp[effect.bodyPart] > Math.round(this.hpMax[effect.bodyPart] / 2)) {
        delete this.statusEffects[index];
    } else {
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
        if (effect.duration > 0) {
            this.situationalMod += -10;
        }
    }
};
MML.statusEffects["Disabling Wound"] = function(effect, index) {
    if (this.hp[effect.bodyPart] > 0) {
        delete this.statusEffects[index];
    } else {
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -10;
        }
        this.situationalMod += -25;
        if (effect.bodyPart === "Head") {
            this.situationalInitBonus = "No Combat";
        } else if (effect.bodyPart === "Left Arm") {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "setApiCharAttribute",
                input: {
                    attribute: "leftHand",
                    value: {
                        _id: "emptyHand"
                    }
                }
            });
        } else if (effect.bodyPart === "Right Arm") {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "setApiCharAttribute",
                input: {
                    attribute: "rightHand",
                    value: {
                        _id: "emptyHand"
                    }
                }
            });
        } // TODO: else if legs limit movement
    }
};
MML.statusEffects["Mortal Wound"] = function(effect, index) {
    if (this.hp[effect.bodyPart] >= -this.hpMax[effect.bodyPart]) {
        delete this.statusEffects[index];
    } else {
        this.situationalInitBonus = "No Combat";
    }
};
MML.statusEffects["Wound Fatigue"] = function(effect, index) {
    if (currentHP["Multiple Wounds"] > -1) {
        delete this.statusEffects[index];
    } else {
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
        this.situationalMod += -10;
    }
};
MML.statusEffects["Number of Defenses"] = function(effect, index) {
    if (state.MML.GM.roundStarted === false) {
        delete this.statusEffects[index];
    }

    this.rangedDefenseMod += -20 * effect.number;
    this.meleeDefenseMod += -20 * effect.number;
};
MML.statusEffects["Fatigue"] = function(effect, index) {
    if (this.situationalInitBonus !== "No Combat") {
        this.situationalInitBonus += -5 * effect.level;
    }
    this.situationalMod += -10 * effect.level;
};
MML.statusEffects["Sensitive Area"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (state.MML.GM.roundStarted === false) {
        effect.duration--;
        if (effect.duration < 1) {
            delete this.statusEffects[index];
        }
    } else {
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
    }
    if (effect.duration > 1) {
        this.situationalMod += -10;
    }
};
MML.statusEffects["Stumbling"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (state.MML.GM.roundStarted === false) {
        effect.duration--;
        if (effect.duration < 1) {
            delete this.statusEffects[index];
        }
    } else {
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Called Shot"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (!_.contains(this.action.modifiers, "Called Shot")) {
        delete this.statusEffects[index];
    } else {
        this.rangedDefenseMod += -10;
        this.meleeDefenseMod += -10;
        this.missileAttackMod += -10;
        this.meleeAttackMod += -10;
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Called Shot Specific"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (!_.contains(this.action.modifiers, "Called Shot Specific")) {
        delete this.statusEffects[index];
    } else {
        this.rangedDefenseMod += -30;
        this.meleeDefenseMod += -30;
        this.meleeAttackMod += -30;
        this.missileAttackMod += -30;
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Aggressive Stance"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (!_.contains(this.action.modifiers, "Aggressive Stance")) {
        // log("aggro deleted");
        delete this.statusEffects[index];
        // log(this.statusEffects);
    } else {
        this.rangedDefenseMod += -40;
        this.meleeDefenseMod += -40;
        this.meleeAttackMod += 10;
        this.perceptionCheckMod += -4;
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += 5;
        }
    }
};
MML.statusEffects["Defensive Stance"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (!_.contains(this.action.modifiers, "Defensive Stance")) {
        delete this.statusEffects[index];
    } else {
        this.rangedDefenseMod += 40;
        this.meleeDefenseMod += 40;
        this.meleeAttackMod += -30;
        this.perceptionCheckMod += -4;
        if (this.situationalInitBonus !== "No Combat") {
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Observe"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (state.MML.GM.roundStarted === false) {
        effect.duration--;
    }

    if (effect.duration < 1 || (this.situationalInitBonus !== "No Combat" && !_.has(this.statusEffects, "Number of Defenses"))) {
        delete this.statusEffects[index];
    } else if (effect.duration < 1) {
        // Observing this round
        this.perceptionCheckMod += 4;
        this.rangedDefenseMod += -10;
        this.meleeDefenseMod += -10;
    } else {
        //observed previous round
        this.situationalInitBonus += 5;
        if (MML.isWieldingRangedWeapon(this)) {
            this.missileAttackMod += 15;
        }
    }
};
MML.statusEffects["Taking Aim"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (_.has(this.statusEffects, "Number of Defenses") ||
        _.has(this.statusEffects, "Damaged This Round") ||
        _.has(this.statusEffects, "Dodged This Round") ||
        this.action.targets[0] !== effect.target) {
        delete this.statusEffects[index];
    } else {
        if (effect.level === 1) {
            this.missileAttackMod += 30;
        } else if (effect.level === 2) {
            this.missileAttackMod += 40;
        }
    }
};
MML.statusEffects["Damaged This Round"] = function(effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
        delete this.statusEffects[index];
    }
};
MML.statusEffects["Dodged This Round"] = function(effect, index) {
    if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
        delete this.statusEffects[index];
    } else {
        this.action.name = "Movement Only";
        this.action.callback = "endAction";
        delete this.action.getTargets;
    }
};
MML.statusEffects["Melee This Round"] = function(effect, index) {
    if (state.MML.GM.roundStarted === false) {
        this.roundsExertion++;
        delete this.statusEffects[index];
    }
};
MML.statusEffects["Stunned"] = function(effect, index) {
    if (state.MML.GM.inCombat === false) {
        delete this.statusEffects[index];
    } else if (state.MML.GM.roundStarted === false) {
        effect.duration--;
        if (effect.duration < 1) {
            delete this.statusEffects[index];
        }
    } else {
        this.action.name = "Movement Only";
        this.action.callback = "endAction";
        delete this.action.getTargets;
    }
};
