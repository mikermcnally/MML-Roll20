/* jshint -W069 */
//Combat Functions
MML.displayMovement = function displayMovement(input) {
    if (input.display) {
        MML.getTokenFromChar(this.name).set("aura1_radius", MML.movementRates[this.race][this.movementPosition] * this.movementAvailable);
        MML.getTokenFromChar(this.name).set("aura1_color", "#00FF00");
    } else {
        MML.getTokenFromChar(this.name).set("aura1_color", "transparent");
    }
};

MML.moveDistance = function moveDistance(distance) {
    this.movementAvailable -= (distance) / (MML.movementRates[this.race][this.movementPosition]);
    MML.displayMovement.apply(this, [true]);
};

MML.newRoundUpdateCharacter = function newRoundUpdateCharacter(input) {
    if (_.has(this.statusEffects, "Melee This Round")) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "setApiCharAttribute",
            input: {
                attribute: "roundsExertion",
                value: this.roundsExertion + 1
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "setApiCharAttribute",
            input: {
                attribute: "roundsRest",
                value: 0
            }
        });

        if (!_.has(this.statusEffects, "Fatigue")) {
            if (this.roundsExertion > this.fitness) {
                MML.processCommand({
                    type: "character",
                    who: this.name,
                    callback: "fatigueCheckRoll",
                    input: {
                        modifier: 0
                    }
                });
            }
        } else {
            if (this.roundsExertion > Math.round(this.fitness / 2)) {
                MML.processCommand({
                    type: "character",
                    who: this.name,
                    callback: "fatigueCheckRoll",
                    input: {
                        modifier: -4
                    }
                });
            }
        }
    } else if (_.has(this.statusEffects, "Fatigue")) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "setApiCharAttribute",
            input: {
                attribute: "roundsRest",
                value: this.roundsRest + 1
            }
        });

        if (this.roundsRest >= 6) {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "fatigueRecoveryRoll",
                input: {
                    modifier: 0
                }
            });
        }
    }

    // Reset knockdown number
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "knockdown",
            value: this.knockdownMax
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "spentInitiative",
            value: 0
        }
    });
    this.action = {};

    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "ready",
            value: false
        }
    });
};

MML.setReady = function setReady(ready) {
    if (state.MML.GM.inCombat === true && this.ready === "false") {
        MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
    } else {
        MML.getTokenFromChar(this.name).set("tint_color", "transparent");
    }
    return this.ready;
};

// Health and Wounds
MML.alterHP = function alterHP(input) {
    log(input.hpAmount);
    var bodyPart = input.bodyPart;
    var hpAmount = parseInt(input.hpAmount);
    var initialHP = this.hp[bodyPart];
    var currentHP = initialHP + hpAmount;
    var maxHP = this.hpMax[bodyPart];

    if (hpAmount < 0) { //if damage
        var duration;
        this.hp[bodyPart] = currentHP;

        //Wounds
        if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
            log("Major");
            if (initialHP >= Math.round(maxHP / 2) && !_.has(this.statusEffects, "Major Wound, " + bodyPart)) { //Fresh wound
                duration = Math.round(maxHP / 2) - currentHP;
            } else { //Add damage to duration of effect
                duration = -hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "majorWoundRoll",
                input: {}
            });
        } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
            log("Disabling");
            if (!_.has(this.statusEffects, "Disabling Wound, " + bodyPart)) { //Fresh wound
                duration = -currentHP;
            } else { //Add damage to duration of effect
                duration = -hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "disablingWoundRoll",
                input: {}
            });
        } else if (currentHP < -maxHP) { //Mortal wound
            log("Mortal");
            this.statusEffects["Mortal Wound, " + bodyPart] = {
                bodyPart: bodyPart
            };
            MML[state.MML.GM.currentAction.callback]();
        } else {
            log("Minor");
            MML[state.MML.GM.currentAction.callback]();
        }
    } else { //if healing
        this.hp[bodyPart] += hpAmount;
        if (this.hp[bodyPart] > maxHP) {
            this.hp[bodyPart] = maxHP;
        }
        MML[state.MML.GM.currentAction.callback]();
    }
};

MML.setMultiWound = function setMultiWound(input) {
    var currentHP = this.hp;
    currentHP["Multiple Wounds"] = this.hpMax["Multiple Wounds"];

    _.each(MML.getBodyParts(this), function(bodyPart) {
        if (currentHP[bodyPart] >= Math.round(this.hpMax[bodyPart] / 2)) { //Only minor wounds apply
            currentHP["Multiple Wounds"] -= this.hpMax[bodyPart] - currentHP[bodyPart];
        } else {
            currentHP["Multiple Wounds"] -= this.hpMax[bodyPart] - Math.round(this.hpMax[bodyPart] / 2);
        }
    }, this);

    log(currentHP);
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "hp",
            value: currentHP
        }
    });

    if (currentHP["Multiple Wounds"] < 0 && !_.has(this.statusEffects, "Wound Fatigue")) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "multiWoundRoll",
            input: {}
        });
    } else {
        MML[state.MML.GM.currentAction.callback]();
    }
};

MML.multiWoundRoll = function multiWoundRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "attributeCheckRoll",
        input: {
            attribute: "systemStrength",
            mods: [0],
            callback: "multiWoundRollResult"
        }
    });
};

MML.multiWoundRollResult = function multiWoundRollResult() {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "multiWoundRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "multiWoundRollApply",
            input: currentRoll
        });
    }
};

MML.multiWoundRollApply = function multiWoundRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;
    state.MML.GM.currentAction.multiWoundRoll = result;
    if (result === "Failure") {
        this.statusEffects["Wound Fatiuge"] = {};
    }
    MML[state.MML.GM.currentAction.callback]();
};

MML.majorWoundRoll = function majorWoundRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "attributeCheckRoll",
        input: {
            name: "Major Wound Willpower Roll",
            attribute: "willpower",
            mods: [0],
            callback: "majorWoundRollResult"
        }
    });
};

MML.majorWoundRollResult = function majorWoundRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "majorWoundRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "majorWoundRollApply",
            input: currentRoll
        });
    }
};

MML.majorWoundRollApply = function majorWoundRollApply() {
    var result = state.MML.players[this.player].currentRoll.result;
    state.MML.GM.currentAction.woundRoll = result;
    var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;
    if (result === "Failure") {
        this.statusEffects["Major Wound, " + bodyPart] = {
            duration: state.MML.GM.currentAction.woundDuration,
            bodyPart: bodyPart
        };
    }
    MML[state.MML.GM.currentAction.callback]();
};

MML.disablingWoundRoll = function disablingWoundRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "attributeCheckRoll",
        input: {
            name: "Disabling Wound System Strength Roll",
            attribute: "systemStrength",
            mods: [0],
            callback: "disablingWoundRollResult"
        }
    });
};

MML.disablingWoundRollResult = function disablingWoundRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "disablingWoundRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "disablingWoundRollApply",
            input: currentRoll
        });
    }
};

MML.disablingWoundRollApply = function disablingWoundRollApply() {
    var result = state.MML.players[this.player].currentRoll.result;
    state.MML.GM.currentAction.woundRoll = result;
    var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;

    this.statusEffects["Disabling Wound, " + bodyPart] = {
        bodyPart: bodyPart
    };
    if (result === "Failure") {
        this.statusEffects["Stunned"] = {
            duration: state.MML.GM.currentAction.woundDuration
        };
    }
    MML[state.MML.GM.currentAction.callback]();
};

MML.knockdownCheck = function checkKnockdown(character, damage) {
    character.knockdown += damage;
    if (character.movementPosition !== "Prone" && character.knockdown < 1) {
        MML.processCommand({
            type: "character",
            who: character.name,
            callback: "knockdownRoll",
            input: {}
        });
    } else {
        MML[state.MML.GM.currentAction.callback]();
    }
};

MML.knockdownRoll = function knockdownRoll() {
    if (_.has(this.statusEffects, "Stumbling")) {
        //victim saved first knockdown check, harder to save 2nd time
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "attributeCheckRoll",
            input: {
                name: "Knockdown System Strength Roll",
                attribute: "systemStrength",
                mods: [-5],
                callback: "getKnockdownRoll"
            }
        });
    } else {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "attributeCheckRoll",
            input: {
                name: "Knockdown System Strength Roll",
                attribute: "systemStrength",
                mods: [0],
                callback: "getKnockdownRoll"
            }
        });
    }
};

MML.knockdownRollResult = function knockdownRollResult() {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "knockdownRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "knockdownRollApply",
            input: currentRoll
        });
    }
};

MML.knockdownRollApply = function knockdownRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;

    if (result === "Critical Failure" || result === "Failure") {
        this.movementPosition = "Prone";
    } else {
        this.statusEffects["Stumbling"] = {
            duration: 1
        };
    }

    MML[state.MML.GM.currentAction.callback]();
};

MML.sensitiveAreaCheck = function sensitiveAreaCheck(character, hitPosition) {
    if (MML.sensitiveAreas[character.bodyType].indexOf(hitPosition) > -1) {
        MML.processCommand({
            type: "character",
            who: character.name,
            callback: "sensitiveAreaRoll",
            input: {}
        });
    } else {
        MML[state.MML.GM.currentAction.callback]();
    }
};

MML.sensitiveAreaRoll = function sensitiveAreaRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "attributeCheckRoll",
        input: {
            name: "Sensitive Area Willpower Roll",
            attribute: "willpower",
            mods: [0],
            callback: "sensitiveAreaRollResult"
        }
    });
};

MML.sensitiveAreaRollResult = function sensitiveAreaRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "sensitiveAreaRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "sensitiveAreaRollApply",
            input: currentRoll
        });
    }
};

MML.sensitiveAreaRollApply = function sensitiveAreaRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;
    if (result === "Critical Failure" || result === "Failure") {
        this.statusEffects["Sensitive Area"] = {
            duration: 1
        };
    }
    MML[state.MML.GM.currentAction.callback]();
};

MML.fatigueCheckRoll = function fatigueCheckRoll(modifier) {
    if (MML.attributeCheckRoll(charName, "fitness", [modifier])) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "setApiCharAttribute",
            input: {
                attribute: "fatigueLevel",
                value: this.fatigueLevel + 1
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "setApiCharAttribute",
            input: {
                attribute: "roundsExertion",
                value: 0
            }
        });
    }
};

MML.fatigueRecoveryRoll = function fatigueRecoveryRoll(modifier) {
    this.attributeCheckRoll("health", [modifier]);
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "roundsRest",
            value: 0
        }
    });
    this.fatigueLevel--;
    this.updateCharacter("fatigueLevel");
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "fatigueLevel",
            value: this.fatigueLevel - 1
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "roundsExertion",
            value: 0
        }
    });
};

MML.armorDamageReduction = function armorDamageReduction(character, position, damage, type, coverageRoll) {
    var damageApplied = false; //Accounts for partial coverage, once true the loop stops
    var damageDeflected = 0;
    log(character.apv);
    // Iterates over apv values at given position (accounting for partial coverage)
    var apv;
    for (apv in character.apv[position][type]) {
        if (damageApplied === false) {
            if (coverageRoll <= character.apv[position][type][apv].coverage) { //if coverage roll is less than apv coverage
                damageDeflected = character.apv[position][type][apv].value;

                //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
                if (damage + damageDeflected >= 0) {
                    //If surface, cut, or pierce, cut in half and apply as impact
                    if (type === "Surface" || type === "Cut" || type === "Pierce") {
                        damage = Math.ceil(damage / 2);
                        damageDeflected = character.apv[position].Impact[apv].value;

                        if (damage + damageDeflected >= 0) {
                            damageDeflected = -damage;
                            damage = 0;
                        }
                    }
                    //If chop, or thrust, apply 3/4 as impact
                    else if (type === "Chop" || type === "Thrust") {
                        damage = Math.ceil(damage * 0.75);
                        damageDeflected = character.apv[position].Impact[apv].value;

                        if (damage + damageDeflected >= 0) {
                            damageDeflected = -damage;
                            damage = 0;
                        }
                    }
                    //If impact or flanged, no damage
                    else {
                        damageDeflected = -damage;
                        damage = 0;
                    }
                }

                // if damage gets through, subtract amount deflected by armor
                if (damage < 0) {
                    damage += damageDeflected;
                }
                damageApplied = true;
            }
        }
    }
    return damage;
};

MML.initiativeRoll = function initiativeRoll(input) {
    var rollValue = MML.rollDice(1, 10);

    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "updateCharacter",
        input: {
            attribute: "action"
        }
    });

    MML.processCommand({
        type: "player",
        who: this.player,
        callback: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: {
                character: this.name,
                name: "initiative",
                value: rollValue,
                callback: "initiativeResult",
                range: "1-10",
                accepted: false
            }
        }
    });

    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "initiativeResult",
        input: {}
    });
};

MML.initiativeResult = function initiativeResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    currentRoll.rollResult =
        currentRoll.value +
        this.situationalInitBonus +
        this.movementRatioInitBonus +
        this.attributeInitBonus +
        this.senseInitBonus +
        this.fomInitBonus +
        this.firstActionInitBonus +
        this.spentInitiative;

    currentRoll.message =
        "Roll: " + currentRoll.value +
        "\nResult: " + currentRoll.rollResult +
        "\nRange: " + currentRoll.range;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "initiativeApply",
                input: {}
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "initiativeApply",
            input: {}
        });
    }
};

MML.initiativeApply = function initiativeApply() {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "initiativeRoll",
            value: state.MML.players[this.player].currentRoll.value
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "setApiCharAttribute",
        input: {
            attribute: "ready",
            value: true
        }
    });
    MML.processCommand({
        type: "player",
        who: this.player,
        callback: "prepareNextCharacter",
        input: {}
    });
};

MML.startAction = function startAction(input) {
    state.MML.GM.currentAction = {
        who: this.name
    };

    if (!_.isUndefined(this.action.getTargets)) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: this.action.getTargets,
            input: {}
        });
    } else {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: this.action.callback,
            input: {}
        });
    }
};

MML.startAttackAction = function startAttackAction(input) {
    if (_.has(this.statusEffects, "Called Shot")) {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "charMenuSelectBodyPart",
            input: {
                who: this.name,
            }
        });
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayMenu",
            input: {}
        });
    } else if (_.has(this.statusEffects, "Called Shot Specific")) {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "charMenuSelectHitPosition",
            input: {
                who: this.name,
            }
        });
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayMenu",
            input: {}
        });
    } else if (_.contains(this.action.modifiers, ["Aim"])) {
        if (_.has(this.statusEffects, "Taking Aim")) {
            this.statusEffects["Taking Aim"].level++;
        } else {
            this.statusEffects["Taking Aim"] = {
                name: "Taking Aim",
                level: 1,
                target: input.target
            };
        }
    } else {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "processAttack",
            input: {}
        });
    }
};

MML.processAttack = function processAttack(input) {
    this.statusEffects["Melee This Round"] = {};

    if (MML.isUnarmed(this)) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "unarmedAttack",
            input: {}
        });
    } else if (MML.isDualWielding(this)) {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "dualWieldAttack",
            input: {}
        });
    } else if (MML.getWeaponFamily(this, "leftHand") === "MWD" || MML.getWeaponFamily(this, "leftHand") === "MWM") {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "missileAttack",
            input: {}
        });
    } else if (MML.getWeaponFamily(this, "leftHand") === "TWH" ||
        MML.getWeaponFamily(this, "rightHand") === "TWH" ||
        MML.getWeaponFamily(this, "leftHand") === "TWK" ||
        MML.getWeaponFamily(this, "rightHand") === "TWK" ||
        MML.getWeaponFamily(this, "leftHand") === "TWS" ||
        MML.getWeaponFamily(this, "rightHand") === "TWS" ||
        MML.getWeaponFamily(this, "leftHand") === "SLI" ||
        MML.getWeaponFamily(this, "rightHand") === "SLI") {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "throwingAttack",
            input: {}
        });
    } else {
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "meleeAttack",
            input: {}
        });
    }
};

MML.meleeAttack = function meleeAttack(input) {
    var itemId;
    var grip;

    if (MML.getWeaponFamily(this, "rightHand") !== "unarmed") {
        itemId = this.rightHand._id;
        grip = this.rightHand.grip;
    } else {
        itemId = this.leftHand._id;
        grip = this.leftHand.grip;
    }
    var item = this.inventory[itemId];
    var attackerWeapon = {
        _id: itemId,
        name: item.name,
        type: "weapon",
        weight: item.weight,
        family: item.grips[grip].family,
        hands: item.grips[grip].hands,
        defense: item.grips[grip].defense,
        initiative: item.grips[grip].initiative,
        rank: item.grips[grip].rank
    };

    if (this.action.weaponType === "primary") {
        attackerWeapon.damageType = item.grips[grip].primaryType;
        attackerWeapon.task = item.grips[grip].primaryTask;
        attackerWeapon.damage = item.grips[grip].primaryDamage;
    } else {
        attackerWeapon.damageType = item.grips[grip].secondaryType;
        attackerWeapon.task = item.grips[grip].secondaryTask;
        attackerWeapon.damage = item.grips[grip].secondaryDamage;
    }

    var currentAction = {
        character: this,
        callback: "meleeAttackAction",
        parameters: {
            attackerWeapon: attackerWeapon,
            attackerSkill: MML.getWeaponSkill(this, item),
            target: state.MML.characters[state.MML.GM.currentAction.targetArray[0]]
        },
        rolls: {}
    };

    state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
    MML[currentAction.callback]();
};

MML.meleeAttackRoll = function meleeAttackRoll(rollName, character, task, skill) {
    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "universalRoll",
        input: {
            name: rollName,
            callback: "attackRollResult",
            mods: [task, skill, character.situationalMod, character.meleeAttackMod, character.attributeMeleeAttackMod]
        }
    });
};

MML.missileAttack = function missileAttack() {
    var target = state.MML.characters[state.MML.GM.currentAction.targetArray[0]];
    var range = MML.getDistanceBetweenChars(this.name, target.name);
    var task;
    var itemId;
    var grip;

    if (MML.getWeaponFamily(this, "rightHand") !== "unarmed") {
        itemId = this.rightHand._id;
        grip = this.rightHand.grip;
    } else {
        itemId = this.leftHand._id;
        grip = this.leftHand.grip;
    }

    var item = this.inventory[itemId];

    var attackerWeapon = {
        _id: itemId,
        name: item.name,
        type: "weapon",
        weight: item.weight,
        family: item.grips[grip].family,
        hands: item.grips[grip].hands,
        initiative: item.grips[grip].initiative,
        reload: item.grips[grip].reload,
        damageType: item.grips[grip].primaryType
    };

    if (range <= item.grips[grip].range.pointBlank.range) {
        attackerWeapon.task = item.grips[grip].range.pointBlank.task;
        attackerWeapon.damage = item.grips[grip].range.pointBlank.damage;
    } else if (range <= item.grips[grip].range.effective.range) {
        attackerWeapon.task = item.grips[grip].range.effective.task;
        attackerWeapon.damage = item.grips[grip].range.effective.damage;
    } else if (range <= item.grips[grip].range.long.range) {
        attackerWeapon.task = item.grips[grip].range.long.task;
        attackerWeapon.damage = item.grips[grip].range.long.damage;
    } else {
        attackerWeapon.task =  item.grips[grip].range.extreme.task;
        attackerWeapon.damage = item.grips[grip].range.extreme.damage;
    }

    var currentAction = {
        character: this,
        callback: "missileAttackAction",
        parameters: {
            attackerWeapon: attackerWeapon,
            attackerSkill: MML.getWeaponSkill(this, item),
            target: target,
            range: range
        },
        rolls: {}
    };

    state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
    MML[currentAction.callback]();
};

MML.missileAttackRoll = function missleAttackRoll(rollName, character, task, skill) {
    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "universalRoll",
        input: {
            name: rollName,
            callback: "attackRollResult",
            mods: [task, skill, character.situationalMod, character.missileAttackMod, character.attributeMissileAttackMod]
        }
    });
};

MML.attackRollResult = function attackRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            if (_.contains(this.action.modifiers, ["Called Shot Specific"]) && currentRoll.value - currentRoll.target < 11) {
                this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
                this.action.modifiers.push("Called Shot");
                currentRoll.result = "Success";
            }
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "attackRollApply",
                input: {}
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        if (_.contains(this.action.modifiers, ["Called Shot Specific"]) && currentRoll.value - currentRoll.target < 11) {
            this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
            this.action.modifiers.push("Called Shot");
            currentRoll.result = "Success";
        }
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "attackRollApply",
            input: {}
        });
    }
};

MML.attackRollApply = function attackRollApply(input) {
    state.MML.GM.currentAction.rolls.attackRoll = state.MML.players[this.player].currentRoll.result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.hitPositionRoll = function hitPositionRoll(character) {
    var rollValue;
    var range;
    var result;
    var action = state.MML.GM.currentAction;
    var target = state.MML.characters[action.targetArray[action.targetIndex]];

    if (_.contains(character.action.modifiers, ["Called Shot Specific"])) {
        rollValue = +_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === action.calledShot;
        });
        range = rollValue + "-" + rollValue;
        result = MML.hitPositions[target.bodyType][rollValue];
    } else if (_.contains(character.action.modifiers, "Called Shot")) {
        var rangeUpper = MML.getAvailableHitPositions(target, action.calledShot).length;
        rollValue = MML.rollDice(1, rangeUpper);
        range = "1-" + rangeUpper;
        result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
    } else {
        range = "1-" + _.keys(MML.hitPositions[target.bodyType]).length;
        result = MML.getHitPosition(target, MML.rollDice(1, 100));
        rollValue = +_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === result.name;
        });
    }

    MML.processCommand({
        type: "player",
        who: character.player,
        callback: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: {
                type: "hitPosition",
                character: character.name,
                player: character.player,
                callback: "hitPositionRollResult",
                range: range,
                result: result,
                value: rollValue,
                accepted: false
            }
        }
    });

    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "hitPositionRollResult",
        input: {}
    });
};

MML.hitPositionRollResult = function hitPositionRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;
    var action = state.MML.GM.currentAction;
    var target = state.MML.characters[action.targetArray[action.targetIndex]];

    if (_.has(this.statusEffects, "Called Shot")) {
        currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, action.calledShot);
    } else {
        currentRoll.result = MML.hitPositions[target.bodyType][currentRoll.value];
    }

    currentRoll.message = "Roll: " + currentRoll.value +
        "\nResult: " + currentRoll.result.name +
        "\nRange: " + currentRoll.range;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "hitPositionRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "hitPositionRollApply",
            input: {
                result: currentRoll.result
            }
        });
    }
};

MML.hitPositionRollApply = function hitPositionRollApply(input) {
    state.MML.GM.currentAction.rolls.hitPositionRoll = input.result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.meleeDefense = function meleeDefense(defender, attackerWeapon) {
    var itemId;
    var grip;
    var defenderWeapon;
    var dodgeChance;
    var blockChance;
    var dodgeSkill;
    var blockSkill;
    var defaultMartialSkill = defender.weaponSkills["Default Martial"].level;
    var shieldMod = MML.getShieldDefenseBonus(defender);
    var defenseMod = defender.meleeDefenseMod + defender.attributeDefenseMod;
    var sitMod = defender.situationalMod;

    MML.processCommand({
        type: "character",
        who: defender.name,
        callback: "setApiCharAttributeJSON",
        input: {
            attribute: "statusEffects",
            index: "Melee This Round",
            value: {}
        }
    });

    if (_.isUndefined(defender.skills["Dodge"])) {
        dodgeSkill = 0;
    } else {
        dodgeSkill = defender.skills["Dodge"].level;
    }

    if (dodgeSkill >= defaultMartialSkill) {
        dodgeChance = defender.weaponSkills["Dodge"].level + defenseMod + sitMod;
    } else {
        dodgeChance = defaultMartialSkill + defenseMod + sitMod;
    }

    if (attackerWeapon.initiative < 6) {
        dodgeChance += 15;
    }

    if (MML.isDualWielding(defender)) {
        log("Dual Wield defense");
    } else if (MML.isUnarmed(defender) || MML.isWieldingRangedWeapon(defender)) {
        blockChance = 0;
    } else {
        if (MML.getWeaponFamily(defender, "rightHand") !== "unarmed") {
            itemId = defender.rightHand._id;
            grip = defender.rightHand.grip;
        } else {
            itemId = defender.leftHand._id;
            grip = defender.leftHand.grip;
        }

        defenderWeapon = defender.inventory[itemId];
        blockChance = defenderWeapon.grips[grip].defense + sitMod + defenseMod + shieldMod;
        blockSkill = Math.round(MML.getWeaponSkill(defender, defenderWeapon) / 2);

        if (blockSkill >= defaultMartialSkill) {
            blockChance += blockSkill;
        } else {
            blockChance += defaultMartialSkill;
        }
    }

    if (attackerWeapon.family === "Flexible"){
        dodgeChance -= 10;
        blockChance -= 10;
    }

    MML.processCommand({
        type: "player",
        who: defender.player,
        callback: "charMenuMeleeDefenseRoll",
        input: {
            who: defender.name,
            dodgeChance: dodgeChance,
            blockChance: blockChance
        }
    });
    MML.processCommand({
        type: "player",
        who: defender.player,
        callback: "displayMenu",
        input: {}
    });
};

MML.meleeBlockRoll = function meleeBlockRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "universalRoll",
        input: {
            callback: "meleeBlockRollResult",
            mods: [input.blockChance]
        }
    });
};

MML.meleeBlockRollResult = function meleeBlockRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "meleeBlockRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "meleeBlockRollApply",
            input: currentRoll
        });
    }
};

MML.meleeBlockRollApply = function meleeBlockRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;

    if (result === "Success") {
        if (_.has(this.statusEffects, "Number of Defenses")) {
            this.statusEffects["Number of Defenses"].number++;
        } else {
            this.statusEffects["Number of Defenses"] = {
                number: 1
            };
        }
    }

    state.MML.GM.currentAction.rolls.defenseRoll = result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.meleeDodgeRoll = function meleeDodgeRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "universalRoll",
        input: {
            callback: "meleeDodgeRollResult",
            mods: [input.dodgeChance]
        }
    });
};

MML.meleeDodgeRollResult = function meleeDodgeRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "meleeDodgeRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "meleeDodgeRollApply",
            input: currentRoll
        });
    }
};

MML.meleeDodgeRollApply = function meleeDodgeRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;

    if (result === "Success") {
        if (_.has(this.statusEffects, "Number of Defenses")) {
            this.statusEffects["Number of Defenses"].number++;
        } else {
            this.statusEffects["Number of Defenses"] = {
                number: 1
            };
        }
        if (!_.has(this.statusEffects, "Dodged This Round")) {
            this.statusEffects["Dodged This Round"] = {};
        }
    }

    state.MML.GM.currentAction.rolls.defenseRoll = result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.rangedDefense = function rangedDefense(defender, attackerWeapon, range) {
    var defenseChance;
    var defaultMartialSkill = defender.weaponSkills["Default Martial"].level;
    var shieldMod = MML.getShieldDefenseBonus(defender);
    var defenseMod = defender.rangedDefenseMod + defender.attributeDefenseMod;
    var sitMod = defender.situationalMod;
    var rangeMod;

    MML.processCommand({
        type: "character",
        who: defender.name,
        callback: "setApiCharAttributeJSON",
        input: {
            attribute: "statusEffects",
            index: "Melee This Round",
            value: {}
        }
    });

    if (!_.isUndefined(defender.skills["Dodge"]) && defender.skills["Dodge"].level >= defaultMartialSkill) {
        defenseChance = defender.weaponSkills["Dodge"].level + defenseMod + sitMod + shieldMod;
    } else {
        defenseChance = defaultMartialSkill + defenseMod + sitMod + shieldMod;
    }

    if (attackerWeapon.family === "MWD" || attackerWeapon.family === "MWM") {
        rangeMod = Math.floor(range / 75);

        if (rangeMod > 3) {
            rangeMod = 3;
        }
        defenseChance += rangeMod;
    } else if (attackerWeapon.family === "TWH") {
        rangeMod = Math.floor(range / 5);

        if (rangeMod > 5) {
            rangeMod = 5;
        }
        defenseChance += rangeMod + 25;
    } else if (attackerWeapon.family === "TWK") {
        rangeMod = Math.floor(range / 5);

        if (rangeMod > 3) {
            rangeMod = 3;
        }
        defenseChance += rangeMod + 15;
    } else if (attackerWeapon.family === "TWS") {
        rangeMod = Math.floor(range / 5);

        if (rangeMod > 5) {
            rangeMod = 5;
        }
        defenseChance += rangeMod + 15;
    } else {
        rangeMod = Math.floor(range / 20);

        if (rangeMod > 5) {
            rangeMod = 5;
        }
        defenseChance += rangeMod;
    }

    MML.processCommand({
        type: "player",
        who: defender.player,
        callback: "charMenuRangedDefenseRoll",
        input: {
            who: defender.name,
            defenseChance: defenseChance
        }
    });
    MML.processCommand({
        type: "player",
        who: defender.player,
        callback: "displayMenu",
        input: {}
    });
};

MML.rangedDefenseRoll = function missileBlockRoll(input) {
    MML.processCommand({
        type: "character",
        who: this.name,
        callback: "universalRoll",
        input: {
            callback: "rangedDefenseRollResult",
            mods: [input.defenseChance]
        }
    });
};

MML.rangedDefenseRollResult = function missileBlockRollResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "rangedDefenseRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "rangedDefenseRollApply",
            input: currentRoll
        });
    }
};

MML.rangedDefenseRollApply = function missileBlockRollApply(input) {
    var result = state.MML.players[this.player].currentRoll.result;

    if (result === "Success") {
        if (_.has("Number of Defenses")) {
            this.statusEffects["Number of Defenses"].number++;
        } else {
            this.statusEffects["Number of Defenses"] = {
                number: 1
            };
        }
        if (!_.has(this.statusEffects, "Dodged This Round")) {
            this.statusEffects["Dodged This Round"] = {};
        }
    }

    state.MML.GM.currentAction.rolls.defenseRoll = result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.criticalDefense = function criticalDefense() {
    MML.endAction();
};

MML.forgoDefense = function forgoDefense() {
    state.MML.GM.currentAction.rolls.defenseRoll = "Failure";
    MML[state.MML.GM.currentAction.callback]();
};

MML.equipmentFailure = function equipmentFailure(input) {
    log("equipmentFailure");
};

MML.meleeDamageRoll = function meleeDamageRoll(character, attackerWeapon, crit, bonusDamage) {
    bonusDamage = 0;
    state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "rollDamage",
        input: {
            callback: "meleeDamageResult",
            crit: crit,
            damageDice: attackerWeapon.damage,
            mods: [character.meleeDamageMod, bonusDamage]
        }
    });
};

MML.meleeDamageResult = function meleeDamageResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "meleeDamageRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "meleeDamageRollApply",
            input: currentRoll
        });
    }
};

MML.meleeDamageRollApply = function meleeDamageRollApply(input) {
    state.MML.GM.currentAction.rolls.damageRoll = state.MML.players[this.player].currentRoll.result;
    MML[state.MML.GM.currentAction.callback]();
};

MML.missileDamageRoll = function missileDamageRoll(character, attackerWeapon, crit, bonusDamage, range) {
    bonusDamage = 0;
    state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
    MML.processCommand({
        type: "character",
        who: character.name,
        callback: "rollDamage",
        input: {
            callback: "missileDamageResult",
            crit: crit,
            damageDice: attackerWeapon.damage,
            mods: [bonusDamage]
        }
    });
};

MML.missileDamageResult = function missileDamageResult(input) {
    var currentRoll = state.MML.players[this.player].currentRoll;

    if (this.player === state.MML.GM.player) {
        if (currentRoll.accepted === false) {
            MML.processCommand({
                type: "player",
                who: this.player,
                callback: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.name,
                callback: "missileDamageRollApply",
                input: currentRoll
            });
        }
    } else {
        MML.processCommand({
            type: "player",
            who: this.player,
            callback: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            callback: "missileDamageRollApply",
            input: currentRoll
        });
    }
};

MML.missileDamageRollApply = function missileDamageRollApply(input) {
    state.MML.GM.currentAction.rolls.damageRoll = state.MML.players[this.player].currentRoll.result;
    MML[state.MML.GM.currentAction.callback]();
};

// Todo: Add sweep attack

MML.unarmedAttack = function unarmedAttack(charName) {};

MML.readyItemAction = function readyItemAction(charName) {};

MML.castSpellAction = function castSpellAction(charName) {};

MML.observeAction = function observeAction(charName) {};
