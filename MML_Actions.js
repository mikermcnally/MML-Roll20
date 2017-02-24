MML.meleeAttackAction = function() {
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

MML.missileAttackAction = function() {
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

MML.unarmedAttackAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var parameters = currentAction.parameters;
  var attackerSkill = parameters.attackerSkill;
  var attackType = parameters.attackType;
  var target = parameters.target;
  var rolls = currentAction.rolls;
  var bonusDamage = parameters.bonusDamage || [];

  if (_.isUndefined(rolls.attackRoll)) {
    MML.meleeAttackRoll("attackRoll", character, attackType.task, attackerSkill);
  } else if (_.isUndefined(rolls.defenseRoll)) {
    if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
      MML.meleeDefense(target, attackType);
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

MML.grappleAttackAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var parameters = currentAction.parameters;
  var attackerSkill = parameters.attackerSkill;
  var attackType = parameters.attackType;
  var target = parameters.target;
  var defender = parameters.defender;
  var defenderWeapon = parameters.defenderWeapon;
  var rolls = currentAction.rolls;

  if (_.isUndefined(rolls.attackRoll)) {
    MML.meleeAttackRoll("attackRoll", character, attackType.task, attackerSkill);
  } else if (_.isUndefined(rolls.brawlDefenseRoll) && _.isUndefined(rolls.weaponDefenseRoll)) {
    if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
      MML.grappleDefense(target, attackType);
    } else if (rolls.attackRoll === "Critical Failure") {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (!_.isUndefined(rolls.brawlDefenseRoll)) {
    if (rolls.brawlDefenseRoll === "Critical Success") {
      MML.processCommand({
        type: "character",
        who: target.name,
        callback: "criticalDefense",
        input: {}
      });
    } else if (rolls.brawlDefenseRoll === "Success") {
      MML.endAction();
    } else {
      MML.grappleHandler(character, target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.weaponDefenseRoll) && _.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.weaponDefenseRoll === "Critical Success" || rolls.weaponDefenseRoll === "Success") {
      state.MML.GM.currentAction.parameters.target = character;
      state.MML.GM.currentAction.parameters.defender = target;
      MML.hitPositionRoll(target);
    } else {
      MML.grappleHandler(character, target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.hitPositionRoll) && _.isUndefined(rolls.damageRoll)) {
    if (rolls.weaponDefenseRoll === "Critical Success") {
      MML.meleeDamageRoll(defender, defenderWeapon, true);
    } else {
      MML.meleeDamageRoll(defender, defenderWeapon, false);
    }
  } else {
    MML.damageTargetAction("endAction");
  }
};

MML.releaseOpponentAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var parameters = currentAction.parameters;
  var target = parameters.target;
  var rolls = currentAction.rolls;

  if (_.isUndefined(parameters.targetAgreed)) {
    if (_.has(character.statusEffects, "Holding")) {
      MML.releaseHold(character, target);
    } else {
      MML.processCommand({
        type: "player",
        who: target.player,
        callback: "charMenuResistRelease",
        input: {
          who: target.name,
          attacker: character,
          defender: target
        }
      });
      MML.processCommand({
        type: "player",
        who: target.player,
        callback: "displayMenu",
        input: {}
      });
    }
  } else if (parameters.targetAgreed) {
    MML.releaseGrapple(character, target);
  } else {
    MML.processCommand({
      type: "character",
      who: character.name,
      callback: "setApiCharAttribute",
      input: {
        attribute: "action",
        value: {
          name: "Attack",
          callback: "startAttackAction",
          weaponType: "Break Grapple",
          modifiers: []
        }
      }
    });
    state.MML.GM.currentAction = {
      character: MML.characters[character.name],
      targetArray: [target.name],
      targetIndex: 0,
      resistRelease: true
    };
    MML.processCommand({
      type: "character",
      who: character.name,
      callback: MML.characters[character.name].action.callback,
      input: {}
    });
  }
};

MML.castAction = function() {
  MML.spells[state.MML.GM.currentAction.parameters.spell.name].process();
};

MML.damageTargetAction = function(callback) {
  var currentAction = state.MML.GM.currentAction;
  var parameters = currentAction.parameters;
  var target = parameters.target;
  var rolls = currentAction.rolls;

  if (_.isUndefined(parameters.damageApplied)) {
    state.MML.GM.currentAction.parameters.damageApplied = "complete";
    var damageAfterArmor = target.armorDamageReduction(rolls.hitPositionRoll.name, rolls.damageRoll, parameters.damageType, randomInteger(100));
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

MML.observeAction = function() {
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

MML.readyItemAction = function() {};

MML.nextTarget = function() {
  state.MML.GM.currentAction.targetIndex += 1;
  state.MML.GM.currentAction.parameters.target = MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]];
  state.MML.GM.currentAction.rolls = _.isUndefined(state.MML.GM.currentAction.rolls.castingRoll) ? {} : { castingRoll: state.MML.GM.currentAction.rolls.castingRoll };
  MML[state.MML.GM.currentAction.callback]();
};

MML.endAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var spentInitiative = character.spentInitiative + character.actionTempo;
  var currentInitiative = character.initiative + spentInitiative;

  // Prevents character from gaining initiative when these status effects are removed
  if (_.has(character.statusEffects, "Called Shot") || _.has(character.statusEffects, "Called Shot Specific")) {
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
