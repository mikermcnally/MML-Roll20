MML.meleeAttackAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var parameters = currentAction.parameters;
  var attackerSkill = parameters.attackerSkill;
  var attackerWeapon = parameters.attackerWeapon;
  var target = parameters.target;
  var rolls = currentAction.rolls;

  if (_.isUndefined(rolls.attackRoll)) {
    character.meleeAttackRoll('attackRoll', attackerWeapon.task, attackerSkill);
  } else if (_.isUndefined(rolls.defenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      target.meleeDefense(attackerWeapon);
    } else if (rolls.attackRoll === 'Critical Failure') {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (_.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.defenseRoll === 'Critical Success') {
      target.criticalDefense();
    } else if (rolls.defenseRoll === 'Success') {
      MML.endAction();
    } else {
      character.hitPositionRoll();
    }
  } else if (_.isUndefined(rolls.damageRoll)) {
    if (rolls.attackRoll === 'Critical Success') {
      character.meleeDamageRoll(attackerWeapon, true);
    } else {
      character.meleeDamageRoll(attackerWeapon, false);
    }
  } else {
    MML.damageTargetAction('endAction');
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
    character.missileAttackRoll('attackRoll', attackerWeapon.task, attackerSkill, target);
  } else if (_.isUndefined(rolls.defenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      target.rangedDefense(attackerWeapon, range);
    } else if (rolls.attackRoll === 'Critical Failure') {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (_.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.defenseRoll === 'Critical Success') {
      target.criticalDefense();
    } else if (rolls.defenseRoll === 'Success') {
      MML.endAction();
    } else {
      character.hitPositionRoll();
    }
  } else if (_.isUndefined(rolls.damageRoll)) {
    if (rolls.attackRoll === 'Critical Success') {
      character.missileDamageRoll(attackerWeapon, true);
    } else {
      character.missileDamageRoll(attackerWeapon, false);
    }
  } else {
    MML.damageTargetAction('endAction');
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
    character.meleeAttackRoll('attackRoll', attackType.task, attackerSkill);
  } else if (_.isUndefined(rolls.defenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      target.meleeDefense(attackType);
    } else if (rolls.attackRoll === 'Critical Failure') {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (_.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.defenseRoll === 'Critical Success') {
      target.criticalDefense();
    } else if (rolls.defenseRoll === 'Success') {
      MML.endAction();
    } else {
      character.hitPositionRoll();
    }
  } else if (_.isUndefined(rolls.damageRoll)) {
    if (rolls.attackRoll === 'Critical Success') {
      character.meleeDamageRoll(attackType, true, bonusDamage);
    } else {
      character.meleeDamageRoll(attackType, false, bonusDamage);
    }
  } else {
    MML.damageTargetAction('endAction');
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
    character.meleeAttackRoll('attackRoll', attackType.task, attackerSkill);
  } else if (_.isUndefined(rolls.brawlDefenseRoll) && _.isUndefined(rolls.weaponDefenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      target.grappleDefense(attackType);
    } else if (rolls.attackRoll === 'Critical Failure') {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (!_.isUndefined(rolls.brawlDefenseRoll)) {
    if (rolls.brawlDefenseRoll === 'Critical Success') {
      target.criticalDefense();
    } else if (rolls.brawlDefenseRoll === 'Success') {
      MML.endAction();
    } else {
      character.grappleHandler(target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.weaponDefenseRoll) && _.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.weaponDefenseRoll === 'Critical Success' || rolls.weaponDefenseRoll === 'Success') {
      state.MML.GM.currentAction.parameters.target = character;
      state.MML.GM.currentAction.parameters.defender = target;
      target.hitPositionRoll();
    } else {
      character.grappleHandler(target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.hitPositionRoll) && _.isUndefined(rolls.damageRoll)) {
    if (rolls.weaponDefenseRoll === 'Critical Success') {
      defender.meleeDamageRoll(defenderWeapon, true);
    } else {
      defender.meleeDamageRoll(defenderWeapon, false);
    }
  } else {
    MML.damageTargetAction('endAction');
  }
};

MML.releaseOpponentAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;
  var parameters = currentAction.parameters;
  var target = parameters.target;
  var rolls = currentAction.rolls;

  if (_.isUndefined(parameters.targetAgreed)) {
    if (_.has(character.statusEffects, 'Holding')) {
      character.releaseHold(target);
    } else {
      target.player.charMenuResistRelease(target.name, character, target);
      target.player.displayMenu();
    }
  } else if (parameters.targetAgreed) {
    character.releaseGrapple(target);
  } else {
    character.name.action ={
      name: 'Attack',
      callback: 'startAttackAction',
      weaponType: 'Break Grapple',
      modifiers: []
    };
    state.MML.GM.currentAction = {
      character: character,
      targetArray: [target.name],
      targetIndex: 0,
      resistRelease: true
    };
    character[MML.characters[character.name].action.callback]();
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
    state.MML.GM.currentAction.parameters.damageApplied = 'complete';
    var damageAfterArmor = target.armorDamageReduction(rolls.hitPositionRoll.name, rolls.damageRoll, parameters.damageType, randomInteger(100));
    target.alterHP(rolls.hitPositionRoll.bodyPart, damageAfterArmor);
  } else if (_.isUndefined(parameters.multiWound)) {
    state.MML.GM.currentAction.parameters.multiWound = 'complete';
    target.setMultiWound();
  } else if (_.isUndefined(parameters.sensitiveArea)) {
    state.MML.GM.currentAction.parameters.sensitiveArea = 'complete';
    target.sensitiveAreaCheck(rolls.hitPositionRoll.name);
  } else if (_.isUndefined(parameters.knockdown)) {
    state.MML.GM.currentAction.parameters.knockdown = 'complete';
    target.knockdownCheck(rolls.damageRoll);
  } else {
    MML[callback]();
  }
};

MML.observeAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;

  character.addStatusEffect('Observing', {
    id: generateRowID(),
    name: 'Observing',
    startingRound: state.MML.GM.currentRound
  });
  character.player.charMenuObserveAction(character.name);
  character.player.displayMenu();
};

MML.aimAction = function() {
  var currentAction = state.MML.GM.currentAction;
  var character = currentAction.character;

  if (_.has(character.statusEffects, 'Taking Aim')) {
    character.statusEffects['Taking Aim'].level++;
  } else {
    character.addStatusEffect('Taking Aim', {
      id: generateRowID(),
      name: 'Taking Aim',
      level: 1
    });
  }
  character.player.charMenuAimAction(character.name);
  character.player.displayMenu();
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
  if (_.has(character.statusEffects, 'Called Shot') || _.has(character.statusEffects, 'Called Shot Specific')) {
    spentInitiative += -5;
  }
  character.spentInitiative = spentInitiative;
  character.previousAction = MML.clone(character.action);
  character.updateCharacter();
  _.each(currentAction.targetArray, function (target) {
    MML.characters[target].updateCharacter();
  });
  if (currentInitiative > 0) {
    character.player.charMenuPrepareAction(character.name);
    character.player.displayMenu();
  } else {
    MML.nextAction();
  }
};
