MML.statusEffects = {};

MML.statusEffects["Major Wound"] = function(effect, index) {
  if (!state.MML.GM.inCombat) {
    this.statusEffects[index].duration = 0;
    effect.duration = 0;
  }
  if (this.hp[effect.bodyPart] > Math.round(this.hpMax[effect.bodyPart] / 2)) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    if (state.MML.GM.currentRound - parseInt(effect.startingRound) > effect.duration) {
      this.situationalMod += -10;
    }
    this.statusEffects[index].description = "Situational Modifier: -10%. Initiative: -5";
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
      this.statusEffects[index].description = "Situational Modifier: -25%. Unconscious";
    } else if (effect.bodyPart === "Left Arm") {
      this.statusEffects[index].description = "Situational Modifier: -25%. Initiative: -10. Left Arm Limp";
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
      this.statusEffects[index].description = "Situational Modifier: -25%. Initiative: -10. Right Arm Limp";
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
    this.statusEffects[index].description = "You're dying, broh!";
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
    this.statusEffects[index].description = "Situational Modifier: -10%. Initiative: -5";
  }
};
MML.statusEffects["Number of Defenses"] = function(effect, index) {
  if (state.MML.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -20 * effect.number;
    this.meleeDefenseMod += -20 * effect.number;
    this.statusEffects[index].description = "Defense Modifier: " + -20 * effect.number + "%";
  }
};
MML.statusEffects["Fatigue"] = function(effect, index) {
  if (this.situationalInitBonus !== "No Combat") {
    this.situationalInitBonus += -5 * effect.level;
  }
  this.situationalMod += -10 * effect.level;
  this.statusEffects[index].description = "Situational Modifier: -10" + -10 * effect.level + "%. Initiative: " + -5 * effect.level;
};
MML.statusEffects["Sensitive Area"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > 1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    this.situationalMod += -10;
    this.statusEffects[index].description = "Situational Modifier: -10%. Initiative: -5";
  }
};
MML.statusEffects["Stumbling"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > 1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    this.statusEffects[index].description = "Initiative: -5";
  }
};
MML.statusEffects["Called Shot"] = function(effect, index) {
  if (state.MML.GM.inCombat === false ||
    (!_.contains(this.action.modifiers, "Called Shot") &&
      this.action.weaponType !== "Place a Hold" &&
      _.has(this.statusEffects, "Holding"))
  ) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -10;
    this.meleeDefenseMod += -10;
    this.missileAttackMod += -10;
    this.meleeAttackMod += -10;
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    this.statusEffects[index].description = "Attack Modifier: -10%. Defense Modifier: -10%. Initiative: -5";
  }
};
MML.statusEffects["Called Shot Specific"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, "Called Shot Specific")) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -30;
    this.meleeDefenseMod += -30;
    this.meleeAttackMod += -30;
    this.missileAttackMod += -30;
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    this.statusEffects[index].description = "Attack Modifier: -30%. Defense Modifier: -30%. Initiative: -5";
  }
};
MML.statusEffects["Aggressive Stance"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, "Aggressive Stance")) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -40;
    this.meleeDefenseMod += -40;
    this.meleeAttackMod += 10;
    this.perceptionCheckMod += -4;
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += 5;
    }
    this.statusEffects[index].description = "Attack Modifier: +10%. Defense Modifier: -40%. Initiative: +5. Preception Modifier: -4";
  }
};
MML.statusEffects["Defensive Stance"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, "Defensive Stance")) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += 40;
    this.meleeDefenseMod += 40;
    this.meleeAttackMod += -30;
    this.perceptionCheckMod += -4;
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -5;
    }
    this.statusEffects[index].description = "Attack Modifier: -30%. Defense Modifier: +40%. Initiative: -5. Preception Modifier: -4";
  }
};
MML.statusEffects["Observe"] = function(effect, index) {
  if (state.MML.GM.inCombat === false ||
    state.MML.GM.currentRound - parseInt(effect.startingRound) > 1 ||
    this.situationalInitBonus === "No Combat" ||
    _.has(this.statusEffects, "Number of Defenses") ||
    _.has(this.statusEffects, "Damaged This Round") ||
    _.has(this.statusEffects, "Melee This Round") ||
    _.has(this.statusEffects, "Dodged This Round")
  ) {
    delete this.statusEffects[index];
  } else if (state.MML.GM.currentRound === parseInt(effect.startingRound)) {
    // Observing this round
    this.perceptionCheckMod += 4;
    this.rangedDefenseMod += -10;
    this.meleeDefenseMod += -10;
    this.statusEffects[index].description = "Defense Modifier: -10%. Preception Modifier: +4";
  } else {
    //observed previous round
    log("here");
    this.situationalInitBonus += 5;
    if (MML.isWieldingRangedWeapon(this)) {
      this.missileAttackMod += 15;
      this.statusEffects[index].description = "Missile Attack Modifier: +15%. Initiative: +5";
    } else {
      this.statusEffects[index].description = "Initiative: +5";
    }
  }
};
MML.statusEffects["Taking Aim"] = function(effect, index) {
  if (state.MML.GM.inCombat === false ||
    _.has(this.statusEffects, "Number of Defenses") ||
    _.has(this.statusEffects, "Damaged This Round") ||
    _.has(this.statusEffects, "Dodged This Round") ||
    this.action.targets[0] !== effect.target
  ) {
    delete this.statusEffects[index];
  } else {
    if (effect.level === 1) {
      this.missileAttackMod += 30;
      this.statusEffects[index].description = "Missile Attack Modifier: +30%.";
    } else if (effect.level === 2) {
      this.missileAttackMod += 40;
      this.statusEffects[index].description = "Missile Attack Modifier: +40%.";
    }
  }
};
MML.statusEffects["Shoot From Cover"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || !_.contains(this.action.modifiers, "Shoot From Cover")) {
    delete this.statusEffects[index];
  } else {
    this.missileAttackMod += -10;
    this.statusEffects[index].description = "Missile attacks -10%. Missile attacks against -20%";
  }
};
MML.statusEffects["Damaged This Round"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.statusEffects[index].description = "Took damage this round";
  }
};
MML.statusEffects["Dodged This Round"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || state.MML.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.action.name = "Movement Only";
    this.action.callback = "endAction";
    delete this.action.getTargets;
    this.statusEffects[index].description = "Only movement is allowed the remainder of the round";
  }
};
MML.statusEffects["Melee This Round"] = function(effect, index) {
  if (state.MML.GM.roundStarted === false) {
    this.roundsExertion++;
    delete this.statusEffects[index];
  } else {
    this.statusEffects[index].description = "Adds to rounds of exertion";
  }
};
MML.statusEffects["Stunned"] = function(effect, index) {
  if (state.MML.GM.inCombat === false || state.MML.GM.currentRound - parseInt(effect.startingRound) > effect.duration) {
    delete this.statusEffects[index];
  } else {
    this.action.name = "Movement Only";
    this.action.callback = "endAction";
    delete this.action.getTargets;
    this.statusEffects[index].description = "Only movement is allowed the next " + effect.duration + " rounds";
  }
};
MML.statusEffects["Grappled"] = function(effect, index) {
  if (!state.MML.GM.inCombat) {
    delete this.statusEffects[index];
  } else if (_.has(this.statusEffects, "Overborne") || _.has(this.statusEffects, "Taken Down")) {
    this.statusEffects[index].description = "Effect does not stack with Overborne or Taken Down";
  } else {
    this.situationalMod += -10;
    this.statusEffects[index].description = "Situational Modifier: -10%.";
  }
};
MML.statusEffects["Held"] = function(effect, index) {
  if (!state.MML.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -20;
    this.meleeDefenseMod += -20;
    this.meleeAttackMod += -10;
    this.statusEffects[index].description = "Attack Modifier: -10%. Defense Modifier: -20";
  }
};
MML.statusEffects["Holding"] = function(effect, index) {
  if (!state.MML.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    this.rangedDefenseMod += -20;
    this.meleeDefenseMod += -20;
    this.meleeAttackMod += -15;
    this.statusEffects[index].description = "Attack Modifier: -15%. Defense Modifier: -20%";
  }
};
MML.statusEffects["Pinned"] = function(effect, index) {
  if (!state.MML.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -10;
    }
    this.situationalMod += -20;

    this.statusEffects[index].description = "Situational Modifier: -20%. Initiative: -10";
  }
};
MML.statusEffects["Taken Down"] = function(effect, index) {
  if (!state.MML.GM.inCombat ||
    (!_.has(this.statusEffects, "Grappled") &&
    !_.has(this.statusEffects, "Held") &&
    !_.has(this.statusEffects, "Holding") &&
    !_.has(this.statusEffects, "Pinned"))
  ) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -15;
    }
    this.situationalMod += -10;

    this.statusEffects[index].description = "Situational Modifier: -10%. Initiative: -15";
  }
};
MML.statusEffects["Overborne"] = function(effect, index) {
  if (!state.MML.GM.inCombat ||
    (!_.has(this.statusEffects, "Grappled") &&
    !_.has(this.statusEffects, "Held") &&
    !_.has(this.statusEffects, "Holding") &&
    !_.has(this.statusEffects, "Pinned"))
  ) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== "No Combat") {
      this.situationalInitBonus += -15;
    }
    this.rangedDefenseMod += -40;
    this.meleeDefenseMod += -30;
    this.meleeAttackMod += -20;
    this.statusEffects[index].description = "Attack Modifier: -20%. Defense Modifier: -30%. Dodge Modifier: -40%. Initiative: -15";
  }
};
