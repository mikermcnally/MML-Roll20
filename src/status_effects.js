SoS.statusEffects = {};

SoS.statusEffects['Major Wound'] = function(effect, index) {
  if (!state.SoS.GM.inCombat) {
    this.statusEffects[index].duration = 0;
    effect.duration = 0;
  }
  if (this.hp[effect.bodyPart] > Math.round(this.hpMax[effect.bodyPart] / 2)) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -5;
    }
    if (state.SoS.GM.currentRound - parseInt(effect.startingRound) <= effect.duration) {
      this.situationalMod += -10;
    }
    this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
  }
};
SoS.statusEffects['Disabling Wound'] = function(effect, index) {
  if (this.hp[effect.bodyPart] > 0) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -10;
    }
    this.situationalMod += -25;
    if (effect.bodyPart === 'Head') {
      this.situationalInitBonus = 'No Combat';
      this.statusEffects[index].description = 'Situational Modifier: -25%. Unconscious';
    } else if (effect.bodyPart === 'Left Arm') {
      this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Left Arm Limp';
      this.leftHand = { _id: 'emptyHand', grip: 'unarmed' };
    } else if (effect.bodyPart === 'Right Arm') {
      this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Right Arm Limp';
      this.rightHand = { _id: 'emptyHand', grip: 'unarmed' };
    } // TODO: else if legs limit movement
  }
};
SoS.statusEffects['Mortal Wound'] = function(effect, index) {
  if (this.hp[effect.bodyPart] >= -this.hpMax[effect.bodyPart]) {
    delete this.statusEffects[index];
  } else {
    this.situationalInitBonus = 'No Combat';
    this.statusEffects[index].description = 'You\'re dying, broh!';
  }
};
SoS.statusEffects['Wound Fatigue'] = function(effect, index) {
  if (this.hp['Wound Fatigue'] > -1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -5;
    }
    this.situationalMod += -10;
    this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
  }
};
SoS.statusEffects['Number of Defenses'] = function(effect, index) {
  if (state.SoS.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -20 * effect.number;
    this.meleeDefenseMod += -20 * effect.number;
    this.statusEffects[index].description = 'Defense Modifier: ' + (-20 * effect.number) + '%';
  }
};
SoS.statusEffects['Fatigue'] = function(effect, index) {
  if (effect.level < 1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -5 * effect.level;
    }
    this.situationalMod += -10 * effect.level;
    this.statusEffects[index].description = 'Situational Modifier: ' + -10 * effect.level + '%. Initiative: ' + -5 * effect.level;
  }
};
SoS.statusEffects['Sensitive Area'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.currentRound - parseInt(effect.startingRound) > 1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -5;
    }
    this.situationalMod += -10;
    this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
  }
};
SoS.statusEffects['Stumbling'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.currentRound - parseInt(effect.startingRound) > 1) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -5;
    }
    this.statusEffects[index].description = 'Initiative: -5';
  }
};
SoS.statusEffects['Called Shot'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false ||
    !_.contains(this.action.modifiers, 'Called Shot') ||
    (this.action.attackType !== 'Place a Hold' &&
    _.has(this.statusEffects, 'Holding'))
  ) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -10;
    this.meleeDefenseMod += -10;
    this.missileAttackMod += -10;
    this.meleeAttackMod += -10;
    this.castingMod += -10;

    if (this.situationalInitBonus !== 'No Combat' && !effect.applied) {
      this.actionInitCostMod += -5;
      effect.applied = true;
    }

    this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -10%. Initiative: -5';
  }
};
SoS.statusEffects['Called Shot Specific'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || !_.contains(this.action.modifiers, 'Called Shot Specific')) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -30;
    this.meleeDefenseMod += -30;
    this.meleeAttackMod += -30;
    this.missileAttackMod += -30;
    this.castingMod += -30;

    if (this.situationalInitBonus !== 'No Combat') {
      this.actionInitCostMod += -5;
      effect.applied = true;
    }
    this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: -30%. Initiative: -5';
  }
};
SoS.statusEffects['Aggressive Stance'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || !_.contains(this.action.modifiers, 'Aggressive Stance')) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -40;
    this.meleeDefenseMod += -40;
    this.meleeAttackMod += 10;
    this.perceptionCheckMod += -4;
    if (this.situationalInitBonus !== 'No Combat') {
      this.actionInitCostMod += 5;
    }
    this.statusEffects[index].description = 'Attack Modifier: +10%. Defense Modifier: -40%. Initiative: +5. Preception Modifier: -4';
  }
};
SoS.statusEffects['Defensive Stance'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || !_.contains(this.action.modifiers, 'Defensive Stance')) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += 40;
    this.meleeDefenseMod += 40;
    this.meleeAttackMod += -30;
    this.perceptionCheckMod += -4;
    if (this.situationalInitBonus !== 'No Combat') {
      this.actionInitCostMod += -5;
    }
    this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: +40%. Initiative: -5. Preception Modifier: -4';
  }
};
SoS.statusEffects['Observing'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false ||
    state.SoS.GM.roundStarted === false ||
    this.situationalInitBonus === 'No Combat'
  ) {
    delete this.statusEffects[index];
  } else {
    // Observing this round
    this.perceptionCheckMod += 4;
    this.missileDefenseMod += -10;
    this.meleeDefenseMod += -10;
    this.statusEffects[index].description = 'Defense Modifier: -10%. Preception Modifier: +4';
  }
};
SoS.statusEffects['Observed'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.currentRound !== parseInt(effect.startingRound)) {
    delete this.statusEffects[index];
  } else {
    this.situationalInitBonus += 5;
    if (SoS.isWieldingRangedWeapon(this) &&
      (!_.has(this.statusEffects, 'Damaged This Round') ||
      !_.has(this.statusEffects, 'Dodged This Round') ||
      !_.has(this.statusEffects, 'Melee This Round'))
    ) {
      this.missileAttackMod += 15;
      this.statusEffects[index].description = 'Missile Attack Modifier: +15%. Initiative: +5';
    } else {
      this.statusEffects[index].description = 'Initiative: +5';
    }
  }
};
SoS.statusEffects['Taking Aim'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false ||
    (state.SoS.GM.roundStarted === true &&
    _.isObject(state.SoS.GM.currentAction) &&
    _.isObject(state.SoS.GM.currentAction.character) &&
    state.SoS.GM.currentAction.character.name === this.name &&
    state.SoS.GM.currentAction.callback !== 'missileAttackAction' &&
    state.SoS.GM.currentAction.callback !== 'aimAction' &&
    _.isObject(state.SoS.GM.currentAction.parameters) &&
    _.isObject(state.SoS.GM.currentAction.parameters.target) &&
    state.SoS.GM.currentAction.parameters.target.name !== effect.target.name) ||
    _.has(this.statusEffects, 'Damaged This Round') ||
    _.has(this.statusEffects, 'Dodged This Round') ||
    _.has(this.statusEffects, 'Melee This Round')
  ) {
    delete this.statusEffects[index];
  } else {
    if (effect.level === 1) {
      this.missileAttackMod += 30;
      this.statusEffects[index].description = 'Missile Attack Modifier: +30%.';
    } else if (effect.level === 2) {
      this.missileAttackMod += 40;
      this.statusEffects[index].description = 'Missile Attack Modifier: +40%.';
    }
  }
};
SoS.statusEffects['Shoot From Cover'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || !_.contains(this.action.modifiers, 'Shoot From Cover')) {
    delete this.statusEffects[index];
  } else {
    this.missileAttackMod += -10;
    this.statusEffects[index].description = 'Missile attacks -10%. Missile attacks against -20%';
  }
};
SoS.statusEffects['Damaged This Round'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.statusEffects[index].description = 'Took damage this round';
  }
};
SoS.statusEffects['Dodged This Round'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.action.name = 'Movement Only';
    this.action.callback = 'endAction';
    delete this.action.getTargets;
    this.statusEffects[index].description = 'Only movement is allowed the remainder of the round';
  }
};
SoS.statusEffects['Melee This Round'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.statusEffects[index].description = 'Adds to rounds of exertion';
  }
};
SoS.statusEffects['Stunned'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.currentRound - parseInt(effect.startingRound) > effect.duration) {
    delete this.statusEffects[index];
  } else {
    this.action.name = 'Movement Only';
    this.action.callback = 'endAction';
    delete this.action.getTargets;
    this.statusEffects[index].description = 'Only movement is allowed the next ' + effect.duration + ' rounds';
  }
};
SoS.statusEffects['Grappled'] = function(effect, index) {
  if (!state.SoS.GM.inCombat) {
    delete this.statusEffects[index];
  } else if (_.has(this.statusEffects, 'Overborne') || _.has(this.statusEffects, 'Taken Down')) {
    this.statusEffects[index].description = 'Effect does not stack with Overborne or Taken Down';
  } else {
    this.situationalMod += -10;
    this.statusEffects[index].description = 'Situational Modifier: -10%.';
  }
};
SoS.statusEffects['Held'] = function(effect, index) {
  if (!state.SoS.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -20;
    this.meleeDefenseMod += -20;
    this.meleeAttackMod += -10;
    this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -20';
  }
};
SoS.statusEffects['Holding'] = function(effect, index) {
  if (!state.SoS.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    this.missileDefenseMod += -20;
    this.meleeDefenseMod += -20;
    this.meleeAttackMod += -15;
    this.statusEffects[index].description = 'Attack Modifier: -15%. Defense Modifier: -20%';
  }
};
SoS.statusEffects['Pinned'] = function(effect, index) {
  if (!state.SoS.GM.inCombat) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -10;
    }
    this.situationalMod += -20;

    this.statusEffects[index].description = 'Situational Modifier: -20%. Initiative: -10';
  }
};
SoS.statusEffects['Taken Down'] = function(effect, index) {
  if (!state.SoS.GM.inCombat ||
    (!_.has(this.statusEffects, 'Grappled') &&
    !_.has(this.statusEffects, 'Held') &&
    !_.has(this.statusEffects, 'Holding') &&
    !_.has(this.statusEffects, 'Pinned'))
  ) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -15;
    }
    this.situationalMod += -10;

    this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -15';
  }
};
SoS.statusEffects['Overborne'] = function(effect, index) {
  if (!state.SoS.GM.inCombat ||
    (!_.has(this.statusEffects, 'Grappled') &&
    !_.has(this.statusEffects, 'Held') &&
    !_.has(this.statusEffects, 'Holding') &&
    !_.has(this.statusEffects, 'Pinned'))
  ) {
    delete this.statusEffects[index];
  } else {
    if (this.situationalInitBonus !== 'No Combat') {
      this.situationalInitBonus += -15;
    }
    this.missileDefenseMod += -40;
    this.meleeDefenseMod += -30;
    this.meleeAttackMod += -20;
    this.statusEffects[index].description = 'Attack Modifier: -20%. Defense Modifier: -30%. Dodge Modifier: -40%. Initiative: -15';
  }
};
SoS.statusEffects['Hasten Spell'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || !_.contains(this.action.modifiers, 'Hasten Spell')) {
    delete this.statusEffects[index];
  } else {
    this.castingMod += -10;
    this.statusEffects[index].description = 'Casting Modifier: -10%';
    if (this.situationalInitBonus !== 'No Combat' && this.action.spell.actions === 1) {
      this.actionInitCostMod += 5;
      this.statusEffects[index].description += '. Initiative: +5';
    } else {
      if (!effect.applied) {
        this.action.spell.actions -= 1;
        effect.applied = true;
      }
      this.statusEffects[index].description += '. Spell Actions Required: -1';
    }
  }
};
SoS.statusEffects['Ease Spell'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || this.action.ts !== effect.ts) {
    delete this.statusEffects[index];
  } else {
    this.castingMod += 10;
    if (!effect.applied) {
      this.action.spell.actions += 1;
      effect.applied = true;
    }
    this.statusEffects[index].description = 'Casting Modifier: +10%. Spell Actions Required: +1';
  }
};
SoS.statusEffects['Release Opponent'] = function(effect, index) {};
SoS.statusEffects['Ready Item'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.currentRound !== parseInt(effect.startingRound)) {
    delete this.statusEffects[index];
  } else {
    this.actionInitCostMod += -10;
    this.statusEffects[index].description = 'Initiative: -10';
  }
};
SoS.statusEffects['Changed Action'] = function(effect, index) {
  if (state.SoS.GM.inCombat === false || state.SoS.GM.roundStarted === false) {
    delete this.statusEffects[index];
  } else {
    this.situationalInitBonus += -10 * effect.level;
    this.statusEffects[index].description = 'Initiative: ' + (-10 * effect.level);
  }
};
