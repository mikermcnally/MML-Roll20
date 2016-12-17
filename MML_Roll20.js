var MML = MML || {};

MML.init = function init() {
  state.MML = state.MML || {};
  state.MML.GM = state.MML.GM || {
    player: "Robot",
    name: "GM",
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };

  state.MML.players = {};
  state.MML.players["Robot"] = {
    name: "Robot",
    who: "GM",
    menu: "GmMenuMain",
    buttons: [MML.menuButtons.GmMenuMain],
    characters: [],
    characterIndex: 0
  };
  state.MML.players["Andrew"] = {
    name: "Andrew",
    who: "",
    menu: "",
    characters: [],
    characterIndex: 0
  };
  _.each(state.MML.players, function(player) {
    //Clear players' list of characters
    player.characters = [];
  });

  var characters = {};
  var characterObjects = findObjs({
    _type: "character",
    archived: false
  }, {
    caseInsensitive: false
  });

  _.each(characterObjects, function(character) {
    var charName = character.get("name");
    characters[charName] = new MML.characterConstructor(charName);
    //Add to player's list of characters
    state.MML.players[characters[charName].player].characters.push(charName);
  });
  state.MML.characters = characters;

  TokenCollisions = {
    "Layer": "gmlayer"
  };
  // var data = [
  // ,,,];


  // state.MML.GM = data[0];
  // state.MML.players = data[1];
  // state.MML.characters =data[2];
  // MML.processCommand(data[3]);
};
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

MML.grappleAttackAction = function grappleAttackAction() {
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
//Combat Functions
MML.displayMovement = function displayMovement() {
  var token = MML.getTokenFromChar(this.name);
  var path = getObj('path', this.pathID);

  if (!_.isUndefined(path)) {
    path.remove();
  }
  var pathID = MML.drawCirclePath(token.get("left"), token.get("top"), MML.movementRates[this.race][this.movementPosition] * this.movementAvailable).id;
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "setApiCharAttribute",
    input: {
      attribute: "pathID",
      value: pathID
    }
  });
};

MML.moveDistance = function moveDistance(input) {
  var distance = input.distance;
  var remainingMovement = this.movementAvailable - (distance) / (MML.movementRates[this.race][this.movementPosition]);
  if (this.movementAvailable > 0) {
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementAvailable",
        value: remainingMovement
      }
    });
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "displayMovement",
      input: {}
    });
  } else {
    var path = getObj('path', this.pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
  }

};

MML.newRoundUpdateCharacter = function newRoundUpdateCharacter(input) {
  if (_.has(this.statusEffects, "Melee This Round")) {
    var fatigueRate = 1;
    if (_.has(this.statusEffects, "Pinned")) {
      fatigueRate = 2;
    }
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "setApiCharAttribute",
      input: {
        attribute: "roundsExertion",
        value: this.roundsExertion + fatigueRate
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
    callback: "updateCharacter",
    input: {
      attribute: "statusEffects"
    }
  });
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

MML.setCombatVision = function setCombatVision(input) {
  var token = MML.getTokenFromChar(this.name);
  var inCombat = input.inCombat;

  if (inCombat || !_.has(this.statusEffects, "Observe")) {
    token.set("light_losangle", this.fov);
    token.set("light_hassight", true);
  } else {
    token.set("light_losangle", 360);
    token.set("light_hassight", true);
  }
};

// Health and Wounds
MML.alterHP = function alterHP(input) {
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
        duration = parseInt(this.statusEffects["Major Wound, " + bodyPart].duration) - hpAmount;
      }
      state.MML.GM.currentAction.woundDuration = duration;
      MML.processCommand({
        type: "player",
        who: this.player,
        callback: "charMenuMajorWoundRoll",
        input: {
          who: this.name
        }
      });
      MML.processCommand({
        type: "player",
        who: this.player,
        callback: "displayMenu",
        input: {}
      });
    } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
      log("Disabling");
      if (!_.has(this.statusEffects, "Disabling Wound, " + bodyPart)) { //Fresh wound
        duration = -currentHP;
      } else { //Add damage to duration of effect
        duration = parseInt(this.statusEffects["Disabling Wound, " + bodyPart].duration) - hpAmount;
      }
      state.MML.GM.currentAction.woundDuration = duration;
      MML.processCommand({
        type: "player",
        who: this.player,
        callback: "charMenuDisablingWoundRoll",
        input: {
          who: this.name
        }
      });
      MML.processCommand({
        type: "player",
        who: this.player,
        callback: "displayMenu",
        input: {}
      });
    } else if (currentHP < -maxHP) { //Mortal wound
      log("Mortal");
      this.statusEffects["Mortal Wound, " + bodyPart] = {
        id: generateRowID(),
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
      type: "player",
      who: this.player,
      callback: "charMenuWoundFatigueRoll",
      input: {
        who: this.name
      }
    });
    MML.processCommand({
      type: "player",
      who: defender.player,
      callback: "displayMenu",
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
    this.statusEffects["Wound Fatiuge"] = {
      id: generateRowID()
    };
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
      id: generateRowID(),
      duration: state.MML.GM.currentAction.woundDuration,
      startingRound: state.MML.GM.currentRound,
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
    id: generateRowID(),
    bodyPart: bodyPart
  };
  if (result === "Failure") {
    this.statusEffects["Stunned"] = {
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound,
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
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound
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
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound
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
  log(position);
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
    character: this
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
  if (_.has(this.statusEffects, "Called Shot") || this.action.weaponType === "Place a Hold") {
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
        id: generateRowID(),
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
  this.statusEffects["Melee This Round"] = {
    id: generateRowID()
  };

  if (["Punch", "Kick", "Head Butt", "Bite"].indexOf(this.action.weaponType) > -1) {
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "unarmedAttack",
      input: {}
    });
  } else if (["Grapple", "Place a Hold", "Break a Hold", "Break Grapple", "Release a Hold", "Takedown", "Regain Feet"].indexOf(this.action.weaponType) > -1) {
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "grappleAttack",
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
  var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);

  var currentAction = {
    character: this,
    callback: "meleeAttackAction",
    parameters: {
      attackerWeapon: characterWeaponInfo.characterWeapon,
      attackerSkill: characterWeaponInfo.skill,
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
    attackerWeapon.task = item.grips[grip].range.extreme.task;
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

MML.missileAttackRoll = function missleAttackRoll(rollName, character, task, skill, target) {
  var mods = [task, skill, character.situationalMod, character.missileAttackMod, character.attributeMissileAttackMod];
  if (_.has((this.statusEffects, "Shoot From Cover"))) {
    mods.push(-20);
  }
  MML.processCommand({
    type: "character",
    who: character.name,
    callback: "universalRoll",
    input: {
      name: rollName,
      callback: "attackRollResult",
      mods: mods
    }
  });
};

MML.unarmedAttack = function unarmedAttack() {
  var attackType;
  switch (this.action.weaponType) {
    case "Punch":
      attackType = MML.unarmedAttacks["Punch"];
      break;
    case "Kick":
      attackType = MML.unarmedAttacks["Kick"];
      break;
    case "Head Butt":
      attackType = MML.unarmedAttacks["Head Butt"];
      break;
    case "Bite":
      attackType = MML.unarmedAttacks["Bite"];
      break;
    default:
  }
  var currentAction = {
    character: this,
    callback: "unarmedAttackAction",
    parameters: {
      attackType: attackType,
      attackerSkill: this.action.skill,
      target: state.MML.characters[state.MML.GM.currentAction.targetArray[0]]
    },
    rolls: {}
  };
  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  MML[currentAction.callback]();
};

MML.grappleAttack = function grappleAttack() {
  var attackType;
  switch (this.action.weaponType) {
    case "Grapple":
      attackType = MML.unarmedAttacks["Grapple"];
      break;
    case "Place a Hold":
      if (["Chest", "Abdomen"].indexOf(state.MML.GM.currentAction.calledShot)) {
        attackType = MML.unarmedAttacks["Place a Hold, Chest, Abdomen"];
      } else {
        attackType = MML.unarmedAttacks["Place a Hold, Head, Arm, Leg"];
      }
      break;
    case "Break a Hold":
      attackType = MML.unarmedAttacks["Break a Hold"];
      break;
    case "Break Grapple":
      attackType = MML.unarmedAttacks["Break Grapple"];
      break;
    case "Takedown":
      attackType = MML.unarmedAttacks["Takedown"];
      break;
    case "Regain Feet":
      attackType = MML.unarmedAttacks["Regain Feet"];
      break;
    default:
      break;
  }
  var currentAction = {
    character: this,
    callback: "grappleAttackAction",
    parameters: {
      attackType: attackType,
      attackerSkill: this.action.skill,
      target: state.MML.characters[state.MML.GM.currentAction.targetArray[0]]
    },
    rolls: {}
  };
  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  MML[currentAction.callback]();
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
    rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === action.calledShot;
    }));
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
    rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === result.name;
    }));
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
      value: {
        id: generateRowID(),
        name: "Melee This Round"
      }
    }
  });

  if (!_.isUndefined(defender.weaponSkills["Dodge"]) && defaultMartialSkill < defender.weaponSkills["Dodge"].level) {
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

  if (attackerWeapon.family === "Flexible") {
    dodgeChance += -10;
    blockChance += -10;
  } else if (attackerWeapon.family === "Unarmed") {
    dodgeChance += attackerWeapon.defenseMod;
    blockChance += attackerWeapon.defenseMod;
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
        id: generateRowID(),
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
        id: generateRowID(),
        number: 1
      };
    }
    if (!_.has(this.statusEffects, "Dodged This Round")) {
      this.statusEffects["Dodged This Round"] = {
        id: generateRowID(),
      };
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
      value: {
        id: generateRowID(),
        name: "Melee This Round"
      }
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
        id: generateRowID(),
        number: 1
      };
    }
    if (!_.has(this.statusEffects, "Dodged This Round")) {
      this.statusEffects["Dodged This Round"] = {
        id: generateRowID()
      };
    }
  }

  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefense = function grappleDefense(defender, attackType) {
  var defenderWeapon;
  var brawlChance;
  var weaponChance;
  var brawlSkill;
  var defaultMartialSkill = defender.weaponSkills["Default Martial"].level;
  var defenseMod = defender.meleeDefenseMod + defender.attributeDefenseMod + attackType.defenseMod;
  var sitMod = defender.situationalMod;

  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Melee This Round",
      value: {
        id: generateRowID(),
        name: "Melee This Round"
      }
    }
  });

  if (_.isUndefined(defender.weaponSkills["Brawling"])) {
    brawlSkill = 0;
  } else {
    brawlSkill = defender.weaponSkills["Brawling"].level;
  }

  if (brawlSkill >= defaultMartialSkill) {
    brawlChance = defender.weaponSkills["Brawling"].level + defenseMod + sitMod;
  } else {
    brawlChance = defaultMartialSkill + defenseMod + sitMod;
  }

  if (
    MML.isUnarmed(defender) ||
    _.has(defender.statusEffects, "Holding") ||
    _.has(defender.statusEffects, "Held") ||
    _.has(defender.statusEffects, "Grappled") ||
    _.has(defender.statusEffects, "Holding") ||
    _.has(defender.statusEffects, "Taken Down") ||
    _.has(defender.statusEffects, "Pinned") ||
    _.has(defender.statusEffects, "Overborne")
  ) {
    MML.processCommand({
      type: "player",
      who: defender.player,
      callback: "charMenuGrappleDefenseRoll",
      input: {
        who: defender.name,
        brawlChance: brawlChance
      }
    });
  } else {
    var characterWeaponInfo = MML.getCharacterWeaponAndSkill(defender);
    state.MML.GM.currentAction.parameters.defenderWeapon = characterWeaponInfo.characterWeapon;
    MML.processCommand({
      type: "player",
      who: defender.player,
      callback: "charMenuGrappleDefenseRoll",
      input: {
        who: defender.name,
        brawlChance: brawlChance,
        attackChance: characterWeaponInfo.characterWeapon.task + characterWeaponInfo.skill + defender.situationalMod + defender.meleeAttackMod + defender.attributeMeleeAttackMod
      }
    });
  }
  MML.processCommand({
    type: "player",
    who: defender.player,
    callback: "displayMenu",
    input: {}
  });
};

MML.grappleDefenseWeaponRoll = function grappleDefenseWeaponRoll(input) {
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "universalRoll",
    input: {
      name: "Weapon Defense Roll",
      callback: "grappleDefenseWeaponRollResult",
      mods: [input.attackChance]
    }
  });
};

MML.grappleDefenseWeaponRollResult = function grappleDefenseWeaponRollResult(input) {
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
        callback: "grappleDefenseWeaponRollApply",
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
      callback: "grappleDefenseWeaponRollApply",
      input: {}
    });
  }
};

MML.grappleDefenseWeaponRollApply = function grappleDefenseWeaponRollApply(input) {
  var result = state.MML.players[this.player].currentRoll.result;

  if (result === "Success") {
    if (_.has(this.statusEffects, "Number of Defenses")) {
      this.statusEffects["Number of Defenses"].number++;
    } else {
      this.statusEffects["Number of Defenses"] = {
        id: generateRowID(),
        number: 1
      };
    }
  }
  state.MML.GM.currentAction.rolls.weaponDefenseRoll = state.MML.players[this.player].currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefenseBrawlRoll = function grappleDefenseBrawlRoll(input) {
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "universalRoll",
    input: {
      name: "Brawl Defense Roll",
      callback: "grappleDefenseBrawlRollResult",
      mods: [input.brawlChance]
    }
  });
};

MML.grappleDefenseBrawlRollResult = function grappleDefenseBrawlRollResult(input) {
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
        callback: "grappleDefenseBrawlRollApply",
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
      callback: "grappleDefenseBrawlRollApply",
      input: {}
    });
  }
};

MML.grappleDefenseBrawlRollApply = function grappleDefenseBrawlRollApply(input) {
  var result = state.MML.players[this.player].currentRoll.result;

  if (result === "Success") {
    if (_.has(this.statusEffects, "Number of Defenses")) {
      this.statusEffects["Number of Defenses"].number++;
    } else {
      this.statusEffects["Number of Defenses"] = {
        id: generateRowID(),
        number: 1
      };
    }
  }
  state.MML.GM.currentAction.rolls.brawlDefenseRoll = state.MML.players[this.player].currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleHandler = function grappleHandler(attacker, defender, attackName) {
  switch (attackName) {
    case "Grapple":
      MML.applyGrapple(attacker, defender);
      break;
    case "Place a Hold, Head, Arm, Leg":
      MML.applyHold(attacker, defender);
      break;
    case "Place a Hold, Chest, Abdomen":
      MML.applyHold(attacker, defender);
      break;
    case "Break a Hold":
      MML.applyHoldBreak(attacker, defender);
      break;
    case "Break Grapple":
      MML.applyGrappleBreak(attacker, defender);
      break;
    case 'Takedown':
      MML.applyTakedown(attacker, defender);
      break;
    case "Regain Feet":
      MML.applyRegainFeet(attacker, defender);
      break;
    default:
      sendChat("Error", "Unhappy grapple :(");
  }
  MML.endAction();
};

MML.applyGrapple = function applyGrapple(attacker, defender) {
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: generateRowID(),
        name: "Grappled",
        targets: [defender.name]
      }
    }
  });

  if (_.has(defender.statusEffects, "Holding")) {
    MML.applyHoldBreak(state.MML.characters[defender.statusEffects["Holding"].targets[0]], defender);
  }
  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: _.has(defender.statusEffects, "Grappled") ? defender.statusEffects["Grappled"].id : generateRowID(),
        name: "Grappled",
        targets: _.has(defender.statusEffects, "Grappled") ? defender.statusEffects["Grappled"].targets.push(attacker.name) : [attacker.name]
      }
    }
  });
};

MML.applyHold = function applyHold(attacker, defender) {
  if (_.has(attacker.statusEffects, "Grappled")) {
    MML.processCommand({
      type: "character",
      who: attacker.name,
      callback: "removeStatusEffect",
      input: {
        index: "Grappled"
      }
    });
  }
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Holding",
      value: {
        id: generateRowID(),
        name: "Holding",
        targets: [defender.name],
        bodyPart: state.MML.GM.currentAction.calledShot
      }
    }
  });
  if (["Chest", "Abdomen"].indexOf(state.MML.GM.currentAction.calledShot) > -1 && defender.movementPosition === "Prone") {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Pinned",
        value: {
          id: _.has(defender.statusEffects, "Pinned") ? defender.statusEffects["Pinned"].id : generateRowID(),
          name: "Pinned",
          targets: _.has(defender.statusEffects, "Pinned") ? defender.statusEffects["Pinned"].targets.push(attacker.name) : [attacker.name]
        }
      }
    });
  } else {
    var holder = { name: attacker.name, bodyPart: state.MML.GM.currentAction.calledShot};
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Held",
        value: {
          id: _.has(defender.statusEffects, "Held") ? defender.statusEffects["Held"].id : generateRowID(),
          name: "Held",
          targets: _.has(defender.statusEffects, "Pinned") ? defender.statusEffects["Pinned"].targets.push(holder) : [holder]
        }
      }
    });
  }
  if (_.has(defender.statusEffects, "Grappled")) {
    if (defender.statusEffects["Grappled"].targets.length === 1) {
      MML.processCommand({
        type: "character",
        who: defender.name,
        callback: "removeStatusEffect",
        input: {
          index: "Grappled"
        }
      });
    } else {
      MML.processCommand({
        type: "character",
        who: defender.name,
        callback: "setApiCharAttributeJSON",
        input: {
          attribute: "statusEffects",
          index: "Grappled",
          value: {
            id: defender.statusEffects["Grappled"].id,
            name: "Grappled",
            targets: _.without(defender.statusEffects["Grappled"].targets, attacker.name)
          }
        }
      });
    }
  }
};

MML.applyHoldBreak = function applyHoldBreak(attacker, defender) {
  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: _.has(defender.statusEffects, "Grappled") ? defender.statusEffects["Grappled"].id : generateRowID(),
        name: "Grappled",
        targets: _.has(defender.statusEffects, "Grappled") ? defender.statusEffects["Grappled"].targets.push(attacker.name) : [attacker.name]
      }
    }
  });
  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "removeStatusEffect",
    input: {
      index: "Holding"
    }
  });
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: _.has(attacker.statusEffects, "Grappled") ? attacker.statusEffects["Grappled"].id : generateRowID(),
        name: "Grappled",
        targets: _.has(attacker.statusEffects, "Grappled") ? attacker.statusEffects["Grappled"].targets.push(defender.name) : [defender.name]
      }
    }
  });

  if (_.has(attacker.statusEffects, "Held")) {
    if (attacker.statusEffects["Held"].targets.length === 1) {
      MML.processCommand({
        type: "character",
        who: attacker.name,
        callback: "removeStatusEffect",
        input: {
          index: "Held"
        }
      });
    } else {
      MML.processCommand({
        type: "character",
        who: attacker.name,
        callback: "setApiCharAttributeJSON",
        input: {
          attribute: "statusEffects",
          index: "Held",
          value: {
            id: attacker.statusEffects["Held"].id,
            name: "Held",
            targets: _.reject(attacker.statusEffects["Held"].targets, function(target) { return target.name === defender.name; })
          }
        }
      });
    }
  } else if (_.has(attacker.statusEffects, "Pinned")) {
    if (attacker.statusEffects["Pinned"].targets.length === 1) {
        MML.processCommand({
        type: "character",
        who: attacker.name,
        callback: "removeStatusEffect",
        input: {
          index: "Pinned"
        }
      });
    }  else {
      MML.processCommand({
        type: "character",
        who: attacker.name,
        callback: "setApiCharAttributeJSON",
        input: {
          attribute: "statusEffects",
          index: "Pinned",
          value: {
            id: attacker.statusEffects["Pinned"].id,
            name: "Pinned",
            targets: _.without(attacker.statusEffects["Pinned"].targets, defender.name)
          }
        }
      });
    }
  }
};

MML.applyGrappleBreak = function applyGrappleBreak(attacker, defender) {
  if (attacker.statusEffects["Grappled"].targets.length === 1) {
      MML.processCommand({
      type: "character",
      who: attacker.name,
      callback: "removeStatusEffect",
      input: {
        index: "Grappled"
      }
    });
  }  else {
    MML.processCommand({
      type: "character",
      who: attacker.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Grappled",
        value: {
          id: attacker.statusEffects["Grappled"].id,
          name: "Grappled",
          targets: _.without(attacker.statusEffects["Grappled"].targets, defender.name)
        }
      }
    });
  }
  log(defender.statusEffects["Grappled"]);
  if (defender.statusEffects["Grappled"].targets.length === 1) {
      MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "removeStatusEffect",
      input: {
        index: "Grappled"
      }
    });
  }  else {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Grappled",
        value: {
          id: defender.statusEffects["Grappled"].id,
          name: "Grappled",
          targets: _.without(defender.statusEffects["Grappled"].targets, attacker.name)
        }
      }
    });
  }
  log(defender.statusEffects["Grappled"]);
};

MML.applyTakedown = function applyTakedown(attacker, defender) {
  var grapplers = _.has(defender.statusEffects, "Grappled") ? defender.statusEffects["Grappled"].targets : [];
  var holders = _.has(defender.statusEffects, "Held") ? defender.statusEffects["Held"].targets : [];
  if (grapplers.length + holders.length > 1) {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Overborne",
        value: {
          id: generateRowID(),
          name: "Overborne"
        }
      }
    });
  } else {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "setApiCharAttributeJSON",
      input: {
        attribute: "statusEffects",
        index: "Taken Down",
        value: {
          id: generateRowID(),
          name: "Taken Down"
        }
      }
    });
  }
  if (holders.length > 0) {
    var targets = [];
    _.each(holders, function(target) {
      if (["Chest", "Abdomen"].indexOf(target.bodyPart)) {
        targets.push(target.name);
        MML.processCommand({
          type: "character",
          who: target.name,
          callback: "setApiCharAttribute",
          input: {
            attribute: "movementPosition",
            value: "Prone"
          }
        });
      }
    });
    if (targets.length > 0) {
      MML.processCommand({
        type: "character",
        who: defender.name,
        callback: "setApiCharAttributeJSON",
        input: {
          attribute: "statusEffects",
          index: "Pinned",
          value: {
            id: generateRowID(),
            name: "Pinned",
            targets: targets
          }
        }
      });
      if (_.reject(attacker.statusEffects["Held"].targets, function(target) { return ["Chest", "Abdomen"].indexOf(target.bodyPart) > -1; }) === 1) {
        MML.processCommand({
          type: "character",
          who: defender.name,
          callback: "removeStatusEffect",
          input: {
            index: "Held"
          }
        });
      } else {
        MML.processCommand({
          type: "character",
          who: defender.name,
          callback: "setApiCharAttributeJSON",
          input: {
            attribute: "statusEffects",
            index: "Held",
            value: {
              id: defender.statusEffects["Held"].id,
              name: "Held",
              targets: _.reject(defender.statusEffects["Held"].targets, function(target) { return ["Chest", "Abdomen"].indexOf(target.bodyPart) > -1; })
            }
          }
        });
      }
    }
  }
  if (grapplers.length > 0) {
    _.each(defender.statusEffects["Grappled"].targets, function(target) {
      MML.processCommand({
        type: "character",
        who: target,
        callback: "setApiCharAttribute",
        input: {
          attribute: "movementPosition",
          value: "Prone"
        }
      });
    });
  }
  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "setApiCharAttribute",
    input: {
      attribute: "movementPosition",
      value: "Prone"
    }
  });
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttribute",
    input: {
      attribute: "movementPosition",
      value: "Prone"
    }
  });
};

MML.applyRegainFeet = function applyRegainFeet(attacker, defender) {
  var grapplers = _.has(attacker.statusEffects, "Grappled") ? attacker.statusEffects["Grappled"].targets : [];
  var holders = _.has(attacker.statusEffects, "Held") ? attacker.statusEffects["Held"].targets : [];

  if (holders.length > 0) {
    var targets = [];
    _.each(holders, function(target) {
      MML.processCommand({
        type: "character",
        who: target.name,
        callback: "setApiCharAttribute",
        input: {
          attribute: "movementPosition",
          value: "Walk"
        }
      });
    });
  }
  if (grapplers.length > 0) {
    _.each(grapplers, function(target) {
      MML.processCommand({
        type: "character",
        who: target,
        callback: "setApiCharAttribute",
        input: {
          attribute: "movementPosition",
          value: "Walk"
        }
      });
    });
  }
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "removeStatusEffect",
    input: {
      index: "Taken Down"
    }
  });
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "removeStatusEffect",
    input: {
      index: "Overborne"
    }
  });
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttribute",
    input: {
      attribute: "movementPosition",
      value: "Walk"
    }
  });
};

MML.releaseHold = function releaseHold(attacker, defender) {
  if (_.has(defender.statusEffects, "Held")) {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "removeStatusEffect",
      input: {
        index: "Held"
      }
    });
  } else if (_.has(defender.statusEffects, "Pinned")) {
    MML.processCommand({
      type: "character",
      who: defender.name,
      callback: "removeStatusEffect",
      input: {
        index: "Pinned"
      }
    });
  }
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "removeStatusEffect",
    input: {
      index: "Holding"
    }
  });
  MML.processCommand({
    type: "character",
    who: attacker.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: generateRowID(),
        name: "Grappled"
      }
    }
  });
  MML.processCommand({
    type: "character",
    who: defender.name,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "statusEffects",
      index: "Grappled",
      value: {
        id: generateRowID(),
        name: "Grappled"
      }
    }
  });
};

MML.criticalDefense = function criticalDefense() {
  MML.endAction();
};

MML.forgoDefense = function forgoDefense(input) {
  state.MML.GM.currentAction.rolls[input.rollName] = "Failure";
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
// Character Creation
MML.characterConstructor = function characterConstructor(charName) {
  // Basic Info
  this.name = charName;
  this.player = MML.getCurrentAttribute(this.name, "player");
  this.race = MML.getCurrentAttribute(this.name, "race");
  this.bodyType = MML.getCurrentAttribute(this.name, "bodyType");
  this.gender = MML.getCurrentAttribute(this.name, "gender");
  this.height = MML.getCurrentAttribute(this.name, "height");
  this.weight = MML.getCurrentAttributeAsFloat(this.name, "weight");
  this.handedness = MML.getCurrentAttribute(this.name, "handedness");
  this.stature = MML.getCurrentAttributeAsFloat(this.name, "stature");
  this.strength = MML.getCurrentAttributeAsFloat(this.name, "strength");
  this.coordination = MML.getCurrentAttributeAsFloat(this.name, "coordination");
  this.health = MML.getCurrentAttributeAsFloat(this.name, "health");
  this.beauty = MML.getCurrentAttributeAsFloat(this.name, "beauty");
  this.intellect = MML.getCurrentAttributeAsFloat(this.name, "intellect");
  this.reason = MML.getCurrentAttributeAsFloat(this.name, "reason");
  this.creativity = MML.getCurrentAttributeAsFloat(this.name, "creativity");
  this.presence = MML.getCurrentAttributeAsFloat(this.name, "presence");
  this.willpower = MML.getCurrentAttributeAsFloat(this.name, "willpower");
  this.evocation = MML.getCurrentAttributeAsFloat(this.name, "evocation");
  this.perception = MML.getCurrentAttributeAsFloat(this.name, "perception");
  this.systemStrength = MML.getCurrentAttributeAsFloat(this.name, "systemStrength");
  this.fitness = MML.getCurrentAttributeAsFloat(this.name, "fitness");
  this.fitnessMod = MML.getCurrentAttributeAsFloat(this.name, "fitnessMod");
  this.load = MML.getCurrentAttributeAsFloat(this.name, "load");
  this.overhead = MML.getCurrentAttributeAsFloat(this.name, "overhead");
  this.deadLift = MML.getCurrentAttributeAsFloat(this.name, "deadLift");
  this.hpMax = MML.getCurrentAttributeJSON(this.name, "hpMax");
  this.hp = MML.getCurrentAttributeJSON(this.name, "hp");
  this.epMax = MML.getCurrentAttributeAsFloat(this.name, "epMax");
  this.ep = MML.getCurrentAttributeAsFloat(this.name, "ep");
  this.fatigueMax = MML.getCurrentAttributeAsFloat(this.name, "fatigueMax");
  this.fatigue = MML.getCurrentAttributeAsFloat(this.name, "fatigue");
  this.hpRecovery = MML.getCurrentAttributeAsFloat(this.name, "hpRecovery");
  this.epRecovery = MML.getCurrentAttributeAsFloat(this.name, "epRecovery");
  this.inventory = MML.getCurrentAttributeJSON(this.name, "inventory");
  this.totalWeightCarried = MML.getCurrentAttributeAsFloat(this.name, "totalWeightCarried");
  this.knockdownMax = MML.getCurrentAttributeAsFloat(this.name, "knockdownMax");
  this.knockdown = MML.getCurrentAttributeAsFloat(this.name, "knockdown");
  this.apv = MML.getCurrentAttributeJSON(this.name, "apv");
  this.leftHand = MML.getCurrentAttributeJSON(this.name, "leftHand");
  this.rightHand = MML.getCurrentAttributeJSON(this.name, "rightHand");
  this.hitTable = MML.getCurrentAttribute(this.name, "hitTable");
  this.movementRatio = MML.getCurrentAttributeAsFloat(this.name, "movementRatio");
  this.movementAvailable = MML.getCurrentAttributeAsFloat(this.name, "movementAvailable");
  this.movementPosition = MML.getCurrentAttribute(this.name, "movementPosition");
  this.pathID = MML.getCurrentAttribute(this.name, "pathID");
  this.situationalMod = MML.getCurrentAttributeAsFloat(this.name, "situationalMod");
  this.attributeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "attributeDefenseMod");
  this.meleeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "meleeDefenseMod");
  this.rangedDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "rangedDefenseMod");
  this.meleeAttackMod = MML.getCurrentAttributeAsFloat(this.name, "meleeAttackMod");
  this.missileAttackMod = MML.getCurrentAttributeAsFloat(this.name, "missileAttackMod");
  this.attributeMeleeAttackMod = MML.getCurrentAttributeAsFloat(this.name, "attributeMeleeAttackMod");
  this.meleeDamageMod = MML.getCurrentAttributeAsFloat(this.name, "meleeDamageMod");
  this.attributeMissileAttackMod = MML.getCurrentAttributeAsFloat(this.name, "attributeMissileAttackMod");
  this.attributeCastingMod = MML.getCurrentAttributeAsFloat(this.name, "attributeCastingMod");
  this.spellLearningMod = MML.getCurrentAttributeAsFloat(this.name, "spellLearningMod");
  this.statureCheckMod = MML.getCurrentAttributeAsFloat(this.name, "statureCheckMod");
  this.strengthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "strengthCheckMod");
  this.coordinationCheckMod = MML.getCurrentAttributeAsFloat(this.name, "coordinationCheckMod");
  this.healthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "healthCheckMod");
  this.beautyCheckMod = MML.getCurrentAttributeAsFloat(this.name, "beautyCheckMod");
  this.intellectCheckMod = MML.getCurrentAttributeAsFloat(this.name, "intellectCheckMod");
  this.reasonCheckMod = MML.getCurrentAttributeAsFloat(this.name, "reasonCheckMod");
  this.creativityCheckMod = MML.getCurrentAttributeAsFloat(this.name, "creativityCheckMod");
  this.presenceCheckMod = MML.getCurrentAttributeAsFloat(this.name, "presenceCheckMod");
  this.willpowerCheckMod = MML.getCurrentAttributeAsFloat(this.name, "willpowerCheckMod");
  this.evocationCheckMod = MML.getCurrentAttributeAsFloat(this.name, "evocationCheckMod");
  this.perceptionCheckMod = MML.getCurrentAttributeAsFloat(this.name, "perceptionCheckMod");
  this.systemStrengthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "systemStrengthCheckMod");
  this.fitnessCheckMod = MML.getCurrentAttributeAsFloat(this.name, "fitnessCheckMod");
  this.statusEffects = MML.getCurrentAttributeJSON(this.name, "statusEffects");
  this.initiative = MML.getCurrentAttributeAsFloat(this.name, "initiative");
  this.initiativeRoll = MML.getCurrentAttributeAsFloat(this.name, "initiativeRoll");
  this.situationalInitBonus = MML.getCurrentAttributeAsFloat(this.name, "situationalInitBonus");
  this.movementRatioInitBonus = MML.getCurrentAttributeAsFloat(this.name, "movementRatioInitBonus");
  this.attributeInitBonus = MML.getCurrentAttributeAsFloat(this.name, "attributeInitBonus");
  this.senseInitBonus = MML.getCurrentAttributeAsFloat(this.name, "senseInitBonus");
  this.fomInitBonus = MML.getCurrentAttributeAsFloat(this.name, "fomInitBonus");
  this.firstActionInitBonus = MML.getCurrentAttributeAsFloat(this.name, "firstActionInitBonus");
  this.spentInitiative = MML.getCurrentAttributeAsFloat(this.name, "spentInitiative");
  this.actionTempo = MML.getCurrentAttributeAsFloat(this.name, "actionTempo");
  this.ready = MML.getCurrentAttribute(this.name, "ready");
  this.action = MML.getCurrentAttributeJSON(this.name, "action");
  this.defensesThisRound = MML.getCurrentAttributeAsFloat(this.name, "defensesThisRound");
  this.dodgedThisRound = MML.getCurrentAttributeAsBool(this.name, "dodgedThisRound");
  this.meleeThisRound = MML.getCurrentAttributeAsBool(this.name, "meleeThisRound");
  this.fatigueLevel = MML.getCurrentAttributeAsFloat(this.name, "fatigueLevel");
  this.roundsRest = MML.getCurrentAttributeAsFloat(this.name, "roundsRest");
  this.roundsExertion = MML.getCurrentAttributeAsFloat(this.name, "roundsExertion");
  this.damagedThisRound = MML.getCurrentAttributeAsBool(this.name, "damagedThisRound");
  this.skills = MML.getSkillAttributes(this.name, "skills");
  this.weaponSkills = MML.getSkillAttributes(this.name, "weaponskills");
  this.fov = MML.getCurrentAttributeAsFloat(this.name, "fov");
};

MML.updateCharacter = function(input) {
  var attributeArray = [input.attribute];
  var dependents = MML.computeAttribute[input.attribute].dependents;
  attributeArray.push.apply(attributeArray, dependents);

  // for(var i = 0; i < attributeArray.length; i++){ //length of array is dynamic, for-in doesn't work here
  //     var localAttribute = MML.computeAttribute[attributeArray[i]];

  //     if(_.isUndefined(localAttribute)){
  //         log(attributeArray[i]);
  //     }
  //     else{
  //         attributeArray = _.difference(attributeArray, localAttribute.dependents);
  //         attributeArray.push.apply(attributeArray, localAttribute.dependents);
  //     }
  // }

  _.each(attributeArray, function(attribute) {
    var value = MML.computeAttribute[attribute].compute.apply(this, []); // Run compute function from character scope
    // log(attribute + " " + value);
    this[attribute] = value;
    if (typeof(value) === "object") {
      value = JSON.stringify(value);
    }
    MML.setCurrentAttribute(this.name, attribute, value);
  }, this);

  _.each(dependents, function(attribute) {
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "updateCharacter",
      input: {
        attribute: attribute
      }
    });
  }, this);
};

MML.setApiCharAttribute = function(input) {
  this[input.attribute] = input.value;
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "updateCharacter",
    input: input
  });
};

MML.setApiCharAttributeJSON = function(input) {
  this[input.attribute][input.index] = input.value;
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "updateCharacter",
    input: input
  });
};

MML.removeStatusEffect = function(input) {
  if (!_.isUndefined(this.statusEffects[input.index])) {
    delete this.statusEffects[input.index];
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "updateCharacter",
      input: {
        attribute: "statusEffects"
      }
    });
  }
};

MML.computeAttribute = {};
MML.computeAttribute.name = {
  dependents: [],
  compute: function() {
    return this.name;
  }
};
MML.computeAttribute.player = {
  dependents: [],
  compute: function() {
    return this.player;
  }
};

MML.computeAttribute.race = {
  dependents: [
    "inventory",
    "stature",
    "strength",
    "coordination",
    "health",
    "beauty",
    "intellect",
    "reason",
    "creativity",
    "presence",
    "willpower",
    "evocation",
    "perception",
    "systemStrength",
    "fitness",
    "fitnessMod",
    "load",
    "bodyType",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttribute(this.name, "race");
  }
};
MML.computeAttribute.bodyType = {
  dependents: ["hitTable"],
  compute: function() {
    return MML.bodyTypes[this.race];
  }
};
MML.computeAttribute.gender = {
  dependents: ["stature"], //"magic bonus for females"],
  compute: function() {
    return MML.getCurrentAttribute(this.name, "gender");
  }
};
MML.computeAttribute.height = {
  dependents: [],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].height;
  }
};
MML.computeAttribute.weight = {
  dependents: [],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].weight;
  }
};
MML.computeAttribute.handedness = {
  dependents: [], // "meleeAttackMod"
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "handedness");
  }
};

//Primary Attributes
MML.computeAttribute.stature = {
  dependents: [
    "load",
    "hpMax",
    "knockdownMax",
    "height",
    "weight"
  ],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].stature;
  }
};
MML.computeAttribute.strength = {
  dependents: [
    "fitness",
    "hpMax",
    "attributeDefenseMod",
    "attributeMeleeAttackMod",
    "attributeMissileAttackMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "strengthRoll") + MML.racialAttributeBonuses[this.race].strength;
  }
};
MML.computeAttribute.coordination = {
  dependents: [
    "attributeMeleeAttackMod",
    "attributeMissileAttackMod",
    "attributeDefenseMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "coordinationRoll") + MML.racialAttributeBonuses[this.race].coordination;
  }
};
MML.computeAttribute.health = {
  dependents: [
    "willpower",
    "hpMax",
    "evocation",
    "systemStrength",
    "fitness",
    "hpRecovery",
    "epRecovery",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "healthRoll") + MML.racialAttributeBonuses[this.race].health;
  }
};
MML.computeAttribute.beauty = {
  dependents: [
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "beautyRoll") + MML.racialAttributeBonuses[this.race].beauty;
  }
};
MML.computeAttribute.intellect = {
  dependents: [
    "perception",
    "evocation",
    "spellLearningMod",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "intellectRoll") + MML.racialAttributeBonuses[this.race].intellect;
  }
};
MML.computeAttribute.reason = {
  dependents: [
    "perception",
    "evocation",
    "attributeCastingMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "reasonRoll") + MML.racialAttributeBonuses[this.race].reason;
  }
};
MML.computeAttribute.creativity = {
  dependents: [
    "perception",
    "evocation",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "creativityRoll") + MML.racialAttributeBonuses[this.race].creativity;
  }
};
MML.computeAttribute.presence = {
  dependents: [
    "willpower",
    "systemStrength",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "presenceRoll") + MML.racialAttributeBonuses[this.race].presence;
  }
};

// Secondary Attributes
MML.computeAttribute.willpower = {
  dependents: [
    "evocation",
    "hpMax"
  ],
  compute: function() {
    return Math.round((2 * this.presence + this.health) / 3);
  }
};
MML.computeAttribute.evocation = {
  dependents: [
    "epMax",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return this.intellect +
      this.reason +
      this.creativity +
      this.health +
      this.willpower +
      MML.racialAttributeBonuses[this.race].evocation;
  }
};
MML.computeAttribute.perception = {
  dependents: [
    "missileAttackMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round((this.intellect + this.reason + this.creativity) / 3) + MML.racialAttributeBonuses[this.race].perception;
  }
};
MML.computeAttribute.systemStrength = {
  dependents: [],
  compute: function() {
    return Math.round((this.presence + 2 * this.health) / 3);
  }
};
MML.computeAttribute.fitness = {
  dependents: [
    "fitnessMod",
    "fatigueMax",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round((this.health + this.strength) / 2) + MML.racialAttributeBonuses[this.race].fitness;
  }
};
MML.computeAttribute.fitnessMod = {
  dependents: [
    "load",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return MML.fitnessModLookup[this.fitness];
  }
};
MML.computeAttribute.load = {
  dependents: [
    "overhead",
    "deadLift",
    "meleeDamageMod",
    "movementRatio",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load;
  }
};
MML.computeAttribute.overhead = {
  dependents: [],
  compute: function() {
    return this.load * 2;
  }
};
MML.computeAttribute.deadLift = {
  dependents: [],
  compute: function() {
    return this.load * 4;
  }
};

// HP stuff
MML.computeAttribute.hpMax = {
  dependents: ["hp"],
  compute: function() {
    var hpMax = MML.buildHpAttribute(this);
    this.hp = MML.buildHpAttribute(this);
    return hpMax;
  }
};
MML.computeAttribute.hp = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.hp;
  }
};
MML.computeAttribute.epMax = {
  dependents: ["ep"],
  compute: function() {
    var epMax = this.evocation;
    this.ep = epMax;
    return epMax;
  }
};
MML.computeAttribute.ep = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.ep;
  }
};
MML.computeAttribute.fatigueMax = {
  dependents: ["fatigue"],
  compute: function() {
    var fatigueMax = this.fitness;
    this.fatigue = fatigueMax;
    return fatigueMax;
  }
};
MML.computeAttribute.fatigue = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.fatigue;
  }
};
MML.computeAttribute.hpRecovery = {
  dependents: [],
  compute: function() {
    return MML.recoveryMods[this.health].hp;
  }
};
MML.computeAttribute.epRecovery = {
  dependents: [],
  compute: function() {
    return MML.recoveryMods[this.health].ep;
  }
};

// Inventory stuff
MML.computeAttribute.inventory = {
  dependents: [
    "totalWeightCarried",
    "apv",
    "leftHand",
    "rightHand",
    "senseInitBonus"
  ],
  compute: function() {
    var items = _.omit(this.inventory, "emptyHand");

    _.each(
      items,
      function(item, _id) {
        MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemName", item.name);
        MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemId", _id);
      },
      this
    );
    items.emptyHand = {
      type: "empty",
      weight: 0
    };
    return items;
  }
};
MML.computeAttribute.totalWeightCarried = {
  dependents: [
    "knockdownMax",
    "movementRatio"
  ],
  compute: function() {
    var totalWeightCarried = 0;

    _.each(this.inventory, function(item) {
      totalWeightCarried += item.weight;
    });
    return totalWeightCarried;
  }
};
MML.computeAttribute.knockdownMax = {
  dependents: ["knockdown"],
  compute: function() {
    var knockdownMax = Math.round(this.stature + (this.totalWeightCarried / 10));
    this.knockdown = knockdownMax;
    return knockdownMax;
  }
};
MML.computeAttribute.knockdown = {
  dependents: [],
  compute: function() {
    if (state.MML.GM.roundStarted === false) {
      return this.knockdownMax;
    } else {
      return this.knockdown;
    }
  }
};
MML.computeAttribute.apv = {
  dependents: [],
  compute: function() {
    var bodyType = this.bodyType;
    var armor = [];
    _.each(
      this.inventory,
      function(item) {
        if (item.type === "armor") {
          armor.push(item);
        }
      },
      this);

    var apvMatrix = {};

    // Initialize APV Matrix
    _.each(MML.hitPositions[bodyType], function(position) {
      apvMatrix[position.name] = {
        Surface: [{
          value: 0,
          coverage: 100
        }],
        Cut: [{
          value: 0,
          coverage: 100
        }],
        Chop: [{
          value: 0,
          coverage: 100
        }],
        Pierce: [{
          value: 0,
          coverage: 100
        }],
        Thrust: [{
          value: 0,
          coverage: 100
        }],
        Impact: [{
          value: 0,
          coverage: 100
        }],
        Flanged: [{
          value: 0,
          coverage: 100
        }]
      };
    });
    //Creates raw matrix of individual pieces of armor (no layering or partial coverage)

    _.each(armor, function(piece) {
      var material = MML.APVList[piece.material];

      _.each(piece.protection, function(protection) {
        var position = MML.hitPositions[bodyType][protection.position].name;
        var coverage = protection.coverage;
        apvMatrix[position].Surface.push({
          value: material.surface,
          coverage: coverage
        });
        apvMatrix[position].Cut.push({
          value: material.cut,
          coverage: coverage
        });
        apvMatrix[position].Chop.push({
          value: material.chop,
          coverage: coverage
        });
        apvMatrix[position].Pierce.push({
          value: material.pierce,
          coverage: coverage
        });
        apvMatrix[position].Thrust.push({
          value: material.thrust,
          coverage: coverage
        });
        apvMatrix[position].Impact.push({
          value: material.impact,
          coverage: coverage
        });
        apvMatrix[position].Flanged.push({
          value: material.flanged,
          coverage: coverage
        });
      });
    });

    //This loop accounts for layered armor and partial coverage and outputs final APVs
    _.each(apvMatrix, function(position, positionName) {
      _.each(position, function(rawAPVArray, type) {
        var apvFinalArray = [];
        var coverageArray = [];

        //Creates an array of armor coverage in ascending order.
        _.each(rawAPVArray, function(apv) {
          if (coverageArray.indexOf(apv.coverage) === -1) {
            coverageArray.push(apv.coverage);
          }
        });
        coverageArray = coverageArray.sort(function(a, b) {
          return a - b;
        });

        //Creates APV array per damage type per position
        _.each(coverageArray, function(apvCoverage) {
          var apvToLayerArray = [];
          var apvValue = 0;

          //Builds an array of APVs that meet or exceed the coverage value
          _.each(rawAPVArray, function(apv) {
            if (apv.coverage >= apvCoverage) {
              apvToLayerArray.push(apv.value);
            }
          });
          apvToLayerArray = apvToLayerArray.sort(function(a, b) {
            return b - a;
          });

          //Adds the values at coverage value with diminishing returns on layered armor
          _.each(apvToLayerArray, function(value, index) {
            apvValue += value * Math.pow(2, -index);
            apvValue = Math.round(apvValue);
          });
          //Puts final APV and associated Coverage into final APV array for that damage type.
          apvFinalArray.push({
            value: apvValue,
            coverage: apvCoverage
          });
        });
        apvMatrix[positionName][type] = apvFinalArray;
      });
    });
    return apvMatrix;
  }
};
MML.computeAttribute.leftHand = {
  dependents: ["hitTable"],
  compute: function() {
    return this.leftHand;
  }
};
MML.computeAttribute.rightHand = {
  dependents: ["hitTable"],
  compute: function() {
    return this.rightHand;
  }
};
MML.computeAttribute.hitTable = {
  dependents: [],
  compute: function() {
    return MML.getHitTable(this);
  }
};

// Movement
MML.computeAttribute.movementRatio = {
  dependents: ["movementRatioInitBonus"],
  compute: function() {
    var movementRatio;

    if (this.totalWeightCarried === 0) {
      movementRatio = Math.round(10 * this.load) / 10;
    } else {
      movementRatio = Math.round(10 * this.load / this.totalWeightCarried) / 10;
    }

    if (movementRatio > 4.0) {
      movementRatio = 4.0;
    }
    return movementRatio;
  }
};
MML.computeAttribute.movementAvailable = {
  dependents: [],
  compute: function() {
    return this.movementAvailable;
  }
};
MML.computeAttribute.movementPosition = {
  dependents: [],
  compute: function() {
    return this.movementPosition;
  }
};
MML.computeAttribute.pathID = {
  dependents: [],
  compute: function() {
    return this.pathID;
  }
};

// Roll Modifiers
MML.computeAttribute.situationalMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.attributeDefenseMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
  }
};
MML.computeAttribute.meleeDefenseMod = {
  dependents: [],
  compute: function() {
    return this.meleeDefenseMod;
  }
};
MML.computeAttribute.rangedDefenseMod = {
  dependents: [],
  compute: function() {
    return this.rangedDefenseMod;
  }
};
MML.computeAttribute.meleeAttackMod = {
  dependents: [],
  compute: function() {
    return this.meleeAttackMod;
  }
};
MML.computeAttribute.missileAttackMod = {
  dependents: [],
  compute: function() {
    return this.missileAttackMod;
  }
};
MML.computeAttribute.attributeMeleeAttackMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
  }
};
MML.computeAttribute.meleeDamageMod = {
  dependents: [],
  compute: function() {
    var meleeDamageMod;
    var load = this.load;

    var index;
    for (index in MML.meleeDamageMods) {
      var data = MML.meleeDamageMods[index];

      if (load >= data.low && load <= data.high) {
        meleeDamageMod = data.value;
        break;
      }
    }
    return meleeDamageMod;
  }
};
MML.computeAttribute.attributeMissileAttackMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength];
  }
};
MML.computeAttribute.attributeCastingMod = {
  dependents: [],
  compute: function() {
    var attributeCastingMod = MML.attributeMods.reason[this.reason];

    if (this.senseInitBonus > 2) {
      attributeCastingMod += 0;
    } else if (this.senseInitBonus > 0) {
      attributeCastingMod -= 10;
    } else if (this.senseInitBonus > -2) {
      attributeCastingMod -= 20;
    } else {
      attributeCastingMod -= 30;
    }

    if (this.fomInitBonus === 3 || this.fomInitBonus === 2) {
      attributeCastingMod -= 5;
    } else if (this.fomInitBonus === 1) {
      attributeCastingMod -= 10;
    } else if (this.fomInitBonus === 0) {
      attributeCastingMod -= 15;
    } else if (this.fomInitBonus === -1) {
      attributeCastingMod -= 20;
    } else if (this.fomInitBonus === -2) {
      attributeCastingMod -= 30;
    }

    return attributeCastingMod;
  }
};
MML.computeAttribute.spellLearningMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.intellect[this.intellect];
  }
};
MML.computeAttribute.statureCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.strengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.coordinationCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.healthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.beautyCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.intellectCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.reasonCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.creativityCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.presenceCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.willpowerCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.evocationCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.perceptionCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.systemStrengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.fitnessCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.statusEffects = {
  dependents: [
    "situationalInitBonus",
    "situationalMod",
    "rangedDefenseMod",
    "meleeDefenseMod",
    "missileAttackMod",
    "meleeAttackMod",
    "perceptionCheckMod",
    "roundsExertion"
  ],
  compute: function() {
    _.each(MML.computeAttribute.statusEffects.dependents, function(dependent) {
      this[dependent] = 0;
    }, this);
    _.each(this.statusEffects, function(effect, index) {
      if (index.indexOf("Major Wound") !== -1) {
        MML.statusEffects["Major Wound"].apply(this, [effect, index]);
      } else if (index.indexOf("Disabling Wound") !== -1) {
        MML.statusEffects["Disabling Wound"].apply(this, [effect, index]);
      } else if (index.indexOf("Mortal Wound") !== -1) {
        MML.statusEffects["Mortal Wound"].apply(this, [effect, index]);
      } else {
        MML.statusEffects[index].apply(this, [effect, index]);
      }
      MML.setCurrentAttribute(this.name, "repeating_statuseffects_" + effect.id + "_statusEffectName", index);
      MML.setCurrentAttribute(this.name, "repeating_statuseffects_" + effect.id + "_statusEffectDescription", (effect.description ? effect.description : ""));
    }, this);

    var regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
    var charObj = MML.getCharFromName(this.name);
    var statusEffectIDs = _.pluck(this.statusEffects, "id");
    var statusEffects = filterObjs(function(obj) {
      if (obj.get('type') !== 'attribute' || obj.get('characterid') !== charObj.id) {
        return false;
      } else {
        return regex.test(obj.get('name'));
      }
    });
    var attributestoDelete = _.filter(statusEffects, function(effect) {
      var notFound = true;
      _.each(statusEffectIDs, function(id) {
        if (_.isString(effect.get("name", "current")) && effect.get("name", "current").indexOf(id) > -1) {
          notFound = false;
        }
      });
      return notFound;
    });
    _.each(attributestoDelete, function(attribute) {
      attribute.remove();
    });

    return this.statusEffects;
  }
};

// Initiative
MML.computeAttribute.initiative = {
  dependents: [],
  compute: function() {
    var initiative = this.initiativeRoll +
      this.situationalInitBonus +
      this.movementRatioInitBonus +
      this.attributeInitBonus +
      this.senseInitBonus +
      this.fomInitBonus +
      this.firstActionInitBonus +
      this.spentInitiative;
    if (initiative < 0 ||
      state.MML.GM.roundStarted === false ||
      this.situationalInitBonus === "No Combat" ||
      this.movementRatioInitBonus === "No Combat") {
      return 0;
    } else {
      return initiative;
    }
  }
};
MML.computeAttribute.initiativeRoll = {
  dependents: ["initiative"],
  compute: function() {
    return this.initiativeRoll;
  }
};
MML.computeAttribute.situationalInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    return this.situationalInitBonus;
  }
};
MML.computeAttribute.movementRatioInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    if (this.movementRatio < 0.6) {
      return "No Combat";
    } else if (this.movementRatio === 0.6) {
      return -4;
    } else if (this.movementRatio < 0.7 && this.movementRatio <= 0.8) {
      return -3;
    } else if (this.movementRatio > 0.8 && this.movementRatio <= 1.0) {
      return -2;
    } else if (this.movementRatio > 1.0 && this.movementRatio <= 1.2) {
      return -1;
    } else if (this.movementRatio > 1.2 && this.movementRatio <= 1.4) {
      return 0;
    } else if (this.movementRatio > 1.4 && this.movementRatio <= 1.7) {
      return 1;
    } else if (this.movementRatio > 1.7 && this.movementRatio <= 2.0) {
      return 2;
    } else if (this.movementRatio > 2.0 && this.movementRatio <= 2.5) {
      return 3;
    } else if (this.movementRatio > 2.5 && this.movementRatio <= 3.2) {
      return 4;
    } else if (this.movementRatio > 3.2) {
      return 5;
    }
  }
};
MML.computeAttribute.attributeInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    var attributeArray = [this.strength, this.coordination, this.reason, this.perception];
    var rankingAttribute = attributeArray.sort(function(a, b) {
      return a - b;
    })[0];

    if (rankingAttribute <= 9) {
      return -1;
    } else if (rankingAttribute === 10 || rankingAttribute === 11) {
      return 0;
    } else if (rankingAttribute === 12 || rankingAttribute === 13) {
      return 1;
    } else if (rankingAttribute === 14 || rankingAttribute === 15) {
      return 2;
    } else if (rankingAttribute === 16 || rankingAttribute === 17) {
      return 3;
    } else if (rankingAttribute === 18 || rankingAttribute === 19) {
      return 4;
    } else if (rankingAttribute >= 20) {
      return 5;
    }
  }
};
MML.computeAttribute.senseInitBonus = {
  dependents: [
    "initiative",
    "attributeCastingMod",
    "fov"
  ],
  compute: function() {
    var armorList = _.where(this.inventory, {
      type: "armor"
    });
    var bitsOfHelm = ["Barbute Helm", "Bascinet Helm", "Camail", "Camail-Conical", "Cap", "Cheeks", "Conical Helm", "Duerne Helm", "Dwarven War Hood", "Face Plate", "Great Helm", "Half-Face Plate", "Hood", "Nose Guard", "Pot Helm", "Sallet Helm", "Throat Guard", "War Hat"];
    var senseArray = [];

    _.each(bitsOfHelm, function(bit) {
      _.each(armorList, function(piece) {
        if (piece.name.indexOf(bit) !== -1) {
          senseArray.push(bit);
        }
      });
    });

    //nothing on head
    if (senseArray.length === 0) {
      return 4;
    } else {
      //Head fully encased in metal
      if (senseArray.indexOf("Great Helm") !== -1 || (senseArray.indexOf("Sallet Helm") !== -1 && senseArray.indexOf("Throat Guard") !== -1)) {
        return -2;
      }
      //wearing a helm
      else if (_.intersection(senseArray, ["Barbute Helm", "Sallet Helm", "Bascinet Helm", "Duerne Helm", "Cap", "Pot Helm", "Conical Helm", "War Hat"]).length > 0) {
        //Has faceplate
        if (senseArray.indexOf("Face Plate") !== -1) {
          //Enclosed Sides
          if (_.intersection(senseArray, ["Barbute Helm", "Bascinet Helm", "Duerne Helm"]).length > 0) {
            return -2;
          } else {
            return -1;
          }
        }
        //These types of helms or half face plate
        else if (_.intersection(senseArray, ["Barbute Helm", "Sallet Helm", "Bascinet Helm", "Duerne Helm", "Half-Face Plate"]).length > 0) {
          return 0;
        }
        //has camail or cheeks
        else if (_.intersection(senseArray, ["Camail", "Camail-Conical", "Cheeks"]).length > 0) {
          return 1;
        }
        //Wearing a hood
        else if (_.intersection(senseArray, ["Dwarven War Hood", "Hood"]).length > 0) {
          _.each(armorList, function(piece) {
            if (piece.name === "Dwarven War Hood" || piece.name === "Hood") {
              if (piece.family === "Cloth") {
                return 2;
              } else {
                return 1;
              }
            }
          });
        }
        //has nose guard
        else if (senseArray.indexOf("Nose Guard") !== -1) {
          return 2;
        }
        // just a cap
        else {
          return 3;
        }
      }
      //Wearing a hood
      else if (_.intersection(senseArray, ["Dwarven War Hood", "Hood"]).length > 0) {
        _.each(armorList, function(piece) {
          if (piece.name === "Dwarven War Hood" || piece.name === "Hood") {
            if (piece.family === "Cloth") {
              return 2;
            } else {
              return 1;
            }
          }
        });
      }
    }
  }
};
MML.computeAttribute.fomInitBonus = {
  dependents: [
    "initiative",
    "attributeCastingMod"
  ],
  compute: function() {
    return this.fomInitBonus;
  }
};
MML.computeAttribute.firstActionInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    if (state.MML.GM.roundStarted === false) {
      this.firstActionInitBonus = this.action.initBonus;
    }
    return this.firstActionInitBonus;
  }
};
MML.computeAttribute.spentInitiative = {
  dependents: ["initiative"],
  compute: function() {
    return this.spentInitiative;
  }
};
MML.computeAttribute.actionTempo = {
  dependents: [],
  compute: function() {
    var tempo;

    if (_.isUndefined(this.action.skill) || this.action.skill < 30) {
      tempo = 0;
    } else if (this.action.skill < 40) {
      tempo = 1;
    } else if (this.action.skill < 50) {
      tempo = 2;
    } else if (this.action.skill < 60) {
      tempo = 3;
    } else if (this.action.skill < 70) {
      tempo = 4;
    } else {
      tempo = 5;
    }

    // If Dual Wielding
    if (this.action.name === "Attack" && MML.isDualWielding(this)) {
      var twfSkill = this.weaponskills["Two Weapon Fighting"].level;
      if (twfSkill > 19 && twfSkill) {
        tempo += 1;
      } else if (twfSkill >= 40 && twfSkill < 60) {
        tempo += 2;
      } else if (twfSkill >= 60) {
        tempo += 3;
      }
      // If Dual Wielding identical weapons
      if (this.inventory[this.leftHand._id].name === this.inventory[this.rightHand._id].name) {
        tempo += 1;
      }
    }
    return MML.attackTempoTable[tempo];
  }
};

// Combat
MML.computeAttribute.ready = {
  dependents: [],
  compute: function() {
    if (state.MML.GM.inCombat === true && this.ready === false) {
      MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
    } else {
      MML.getTokenFromChar(this.name).set("tint_color", "transparent");
    }
    return this.ready;
  }
};
MML.computeAttribute.action = {
  dependents: [
    "firstActionInitBonus",
    "actionTempo",
    "statusEffects"
  ],
  compute: function() {
    var initBonus = 10;

    if (this.action.name === "Attack") {
      var leftHand = MML.getWeaponFamily(this, "leftHand");
      var rightHand = MML.getWeaponFamily(this, "rightHand");

      if (["Punch", "Kick", "Head Butt", "Bite", "Grapple", "Place a Hold", "Break a Hold", "Release a Hold"].indexOf(this.action.weaponType) > -1 ||
        (leftHand === "unarmed" && rightHand === "unarmed")
      ) {
        if (!_.isUndefined(this.weaponSkills["Brawling"]) && this.weaponSkills["Brawling"].level > this.weaponSkills["Default Martial"].level) {
          this.action.skill = this.weaponSkills["Brawling"].level;
        } else {
          this.action.skill = this.weaponSkills["Default Martial"].level;
        }
      } else if (leftHand !== "unarmed" && rightHand !== "unarmed") {
        var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
          this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative
        ];
        initBonus = _.min(weaponInits);
        // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills["Default Martial Skill"].level;
        //Dual Wielding
      } else if (rightHand !== "unarmed" && leftHand === "unarmed") {
        initBonus = this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.rightHand._id]);
      } else {
        initBonus = this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.leftHand._id]);
      }
    } else if (this.action.name === "Cast") {
      this.action.skill = MML.getMagicSkill(this, this.action.spell);
    }
    this.action.initBonus = initBonus;

    _.each(this.action.modifiers, function(modifier) {
      this.statusEffects[modifier] = {
        id: generateRowID(),
        name: modifier
      };
    }, this);

    return this.action;
  }
};
MML.computeAttribute.roundsRest = {
  dependents: [],
  compute: function() {
    return this.roundsRest;
  }
};
MML.computeAttribute.roundsExertion = {
  dependents: [],
  compute: function() {
    return this.roundsExertion;
  }
};
MML.computeAttribute.fov = {
  dependents: [],
  compute: function() {
    switch (this.senseInitBonus) {
      case 4:
        return 180;
      case 3:
        return 170;
      case 2:
        return 160;
      case 1:
        return 150;
      case 0:
        return 140;
      case -1:
        return 130;
      case -2:
        return 120;
      default:
        return 180;
    }
  }
};

// Skills
MML.computeAttribute.skills = {
  dependents: ["actionTempo"],
  compute: function() {
    var characterSkills = MML.getSkillAttributes(this.name, "skills");
    _.each(
      characterSkills,
      function(characterSkill, skillName) {
        var level = characterSkill.input;
        var attribute = MML.skills[skillName].attribute;

        level += MML.attributeMods[attribute][this[attribute]];

        if (_.isUndefined(MML.skillMods[this.race]) === false && _.isUndefined(MML.skillMods[this.race][skillName]) === false) {
          level += MML.skillMods[this.race][skillName];
        }
        if (_.isUndefined(MML.skillMods[this.gender]) === false && _.isUndefined(MML.skillMods[this.gender][skillName]) === false) {
          level += MML.skillMods[this.gender][skillName];
        }
        characterSkill.level = level;
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_name", skillName);
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_input", characterSkill.input);
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_level", level);
      },
      this
    );

    this.skills = characterSkills;
    return characterSkills;
  }
};
MML.computeAttribute.weaponSkills = {
  dependents: ["actionTempo"],
  compute: function() {
    var characterSkills = MML.getSkillAttributes(this.name, "weaponskills");
    var highestSkill;

    _.each(
      characterSkills,
      function(characterSkill, skillName) {
        var level = characterSkill.input;

        // This may need to include other modifiers
        if (_.isUndefined(MML.weaponSkillMods[this.race]) === false && _.isUndefined(MML.weaponSkillMods[this.race][skillName]) === false) {
          level += MML.weaponSkillMods[this.race][skillName];
        }
        characterSkill.level = level;
      },
      this
    );

    highestSkill = _.max(characterSkills, function(skill) {
      return skill.level;
    }).level;
    if (isNaN(highestSkill)) {
      highestSkill = 0;
    }

    if (_.isUndefined(characterSkills["Default Martial"])) {
      characterSkills["Default Martial"] = {
        input: 0,
        level: 0,
        _id: generateRowID()
      };
    }

    if (highestSkill < 20) {
      characterSkills["Default Martial"].level = 1;
    } else {
      characterSkills["Default Martial"].level = Math.round(highestSkill / 2);
    }

    _.each(
      characterSkills,
      function(characterSkill, skillName) {
        MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
        MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
        MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
      },
      this
    );

    this.weaponSkills = characterSkills;
    return characterSkills;
  }
};
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

MML.getWeaponGrip = function getWeaponGrip(character) {
  if (character["rightHand"].grip !== "unarmed") {
    grip = character["rightHand"].grip;
  } else {
    grip = character["leftHand"].grip;
  }
  return grip;
};

MML.getMeleeWeapon = function getMeleeWeapon(character) {
  var grip = MML.getWeaponGrip(character);
  var weapon;
  var item;
  var itemId;

  if (character["rightHand"].grip !== "unarmed") {
    itemId = character.rightHand._id;
    item = character.inventory[itemId];
  } else {
    itemId = character.leftHand._id;
    item = character.inventory[itemId];
  }
  weapon = {
    _id: itemId,
    name: item.name,
    type: "weapon",
    weight: item.weight,
    family: item.grips[grip].family,
    hands: item.grips[grip].hands,
    defense: item.grips[grip].defense,
    initiative: item.grips[grip].initiative,
    rank: item.grips[grip].rank,
    primaryType: item.grips[grip].primaryType,
    primaryTask: item.grips[grip].primaryTask,
    primaryDamage: item.grips[grip].primaryDamage,
    secondaryType: item.grips[grip].secondaryType,
    secondaryTask: item.grips[grip].secondaryTask,
    secondaryDamage: item.grips[grip].secondaryDamage
  };
  return weapon;
};

MML.getCharacterWeaponAndSkill = function getCharacterWeaponAndSkill(character) {
  var itemId;
  var grip;

  if (MML.getWeaponFamily(character, "rightHand") !== "unarmed") {
    itemId = character.rightHand._id;
    grip = character.rightHand.grip;
  } else {
    itemId = character.leftHand._id;
    grip = character.leftHand.grip;
  }
  var item = character.inventory[itemId];
  var characterWeapon = {
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

  if (character.action.weaponType === "secondary") {
    characterWeapon.damageType = item.grips[grip].secondaryType;
    characterWeapon.task = item.grips[grip].secondaryTask;
    characterWeapon.damage = item.grips[grip].secondaryDamage;
  } else {
    characterWeapon.damageType = item.grips[grip].primaryType;
    characterWeapon.task = item.grips[grip].primaryTask;
    characterWeapon.damage = item.grips[grip].primaryDamage;
  }

  return {
    characterWeapon: characterWeapon,
    skill: MML.getWeaponSkill(character, item)
  };
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

  grip = MML.getWeaponGrip(character);

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
  var rangedFamilies = ["MWD", "MWM", "TWH", "TWK", "TWS", "SLI"];
  return (rangedFamilies.indexOf(leftFamily) > -1 || rangedFamilies.indexOf(rightFamily) > -1);
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
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return "Error: Body type not found";
  } else {
    return _.pluck(MML.hitPositions[character.bodyType], "name");
  }
};

MML.getBodyParts = function getBodyParts(character) {
  if (_.isUndefined(MML.hitPositions[character.bodyType])) {
    return "Error: Body type not found";
  } else {
    return _.chain(MML.hitPositions[character.bodyType]).pluck("bodyPart").uniq().value();
  }
};

MML.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
  var availableHitPositions = _.where(MML.hitPositions[character.bodyType], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return "Error: No hit positions found";
  } else {
    return availableHitPositions;
  }
};

MML.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
  var availableHitPositions = MML.getAvailableHitPositions(character, bodyPart);

  if (isNaN(rollValue)) {
    return "Error: Value is not a number";
  } else if (availableHitPositions === "Error: No hit positions found") {
    return availableHitPositions;
  } else if (rollValue < 1 || rollValue > availableHitPositions.length) {
    return "Error: Value out of range";
  } else {
    return availableHitPositions[rollValue - 1];
  }
};

MML.buildHpAttribute = function buildHpAttribute(character) {
  var hpAttribute;
  switch (character.bodyType) {
    case "humanoid":
      hpAttribute = {
        "Multiple Wounds": Math.round((character.health + character.stature + character.willpower) / 2),
        "Head": MML.HPTables[character.race][Math.round(character.health + character.stature / 3)],
        "Chest": MML.HPTables[character.race][Math.round(character.health + character.stature + character.strength)],
        "Abdomen": MML.HPTables[character.race][Math.round(character.health + character.stature)],
        "Left Arm": MML.HPTables[character.race][Math.round(character.health + character.stature)],
        "Right Arm": MML.HPTables[character.race][Math.round(character.health + character.stature)],
        "Left Leg": MML.HPTables[character.race][Math.round(character.health + character.stature)],
        "Right Leg": MML.HPTables[character.race][Math.round(character.health + character.stature)],
      };
      break;
    default:
      console.log("Fuck!");
  }
  return hpAttribute;
};

MML.getDistanceBetweenChars = function getDistanceBetweenChars(charName, targetName) {
  var charToken = MML.getTokenFromChar(charName);
  var targetToken = MML.getTokenFromChar(targetName);

  return MML.getDistance(charToken.get("left"), targetToken.get("left"), charToken.get("top"), targetToken.get("top"));
};
MML.skills = {};
MML.skills["Acrobatics"] = {attribute: "coordination"};
MML.skills["Acting"] = {attribute: "presence"};
MML.skills["Alchemy"] = {attribute: "intellect"};
MML.skills["Animal Handling"] = {attribute: "presence"};
MML.skills["Animal Husbandry"] = {attribute: "reason"};
MML.skills["Armorer"] = {attribute: "reason"};
MML.skills["Blacksmith"] = {attribute: "coordination"};
MML.skills["Botany"] = {attribute: "intellect"};
MML.skills["Bowyer"] = {attribute: "coordination"};
MML.skills["Brawling"] = {attribute: "combat"};
MML.skills["Brewing"] = {attribute: "reason"};
MML.skills["Bureaucracy"] = {attribute: "creativity"};
MML.skills["Caligraphy"] = {attribute: "creativity"};
MML.skills["Camouflage"] = {attribute: "reason"};
MML.skills["Carpentry"] = {attribute: "coordination"};
MML.skills["Cartography"] = {attribute: "reason"};
MML.skills["Climbing"] = {attribute: "coordination"};
MML.skills["Cooking"] = {attribute: "reason"};
MML.skills["Dancing"] = {attribute: "creativity"};
MML.skills["Diplomacy"] = {attribute: "presence"};
MML.skills["Disguise"] = {attribute: "creativity"};
MML.skills["Dowsing"] = {attribute: "reason"};
MML.skills["Ecology, Specific"] = {attribute: "intellect"};
MML.skills["Earth Elementalism"] = {attribute: "intellect"};
MML.skills["Air Elementalism"] = {attribute: "intellect"};
MML.skills["Fire Elementalism"] = {attribute: "intellect"};
MML.skills["Water Elementalism"] = {attribute: "intellect"};
MML.skills["Life Elementalism"] = {attribute: "intellect"};
MML.skills["Engineering"] = {attribute: "intellect"};
MML.skills["Etiquette"] = {attribute: "presence"};
MML.skills["Falconry"] = {attribute: "reason"};
MML.skills["First Aid"] = {attribute: "reason"};
MML.skills["Fishing"] = {attribute: "reason"};
MML.skills["Fletchery"] = {attribute: "coordination"};
MML.skills["Foraging"] = {attribute: "reason"};
MML.skills["Forced March"] = {attribute: "Health"};
MML.skills["Forgery"] = {attribute: "creativity"};
MML.skills["Gambling"] = {attribute: "reason"};
MML.skills["Gem Cutting"] = {attribute: "reason"};
MML.skills["Geology"] = {attribute: "intellect"};
MML.skills["Hand Signalling"] = {attribute: "coordination"};
MML.skills["Heraldry"] = {attribute: "reason"};
MML.skills["Herbalism"] = {attribute: "reason"};
MML.skills["History"] = {attribute: "intellect"};
MML.skills["Horsemanship"] = {attribute: "coordination"};
MML.skills["Hunting and Trapping"] = {attribute: "reason"};
MML.skills["Jeweler"] = {attribute: "creativity"};
MML.skills["Knowledge"] = {attribute: "intellect"};
MML.skills["Language"] = {attribute: "creativity"};
MML.skills["Leatherworking"] = {attribute: "coordination"};
MML.skills["Literacy"] = {attribute: "intellect"};
MML.skills["Literature"] = {attribute: "intellect"};
MML.skills["Lock Picking"] = {attribute: "coordination"};
MML.skills["Lore"] = {attribute: "reason"};
MML.skills["Mathematics"] = {attribute: "intellect"};
MML.skills["Metallurgy"] = {attribute: "intellect"};
MML.skills["Mimicry"] = {attribute: "presence"};
MML.skills["Musical Instrument"] = {attribute: "creativity"};
MML.skills["Navigation"] = {attribute: "reason"};
MML.skills["Negotiation"] = {attribute: "presence"};
MML.skills["Oration"] = {attribute: "presence"};
MML.skills["Persuasion"] = {attribute: "presence"};
MML.skills["Physician"] = {attribute: "reason"};
MML.skills["Pick Pocket"] = {attribute: "coordination"};
MML.skills["Running"] = {attribute: "health"};
MML.skills["Scrounging"] = {attribute: "reason"};
MML.skills["Sculpture"] = {attribute: "creativity"};
MML.skills["Seamanship"] = {attribute: "reason"};
MML.skills["Sewing"] = {attribute: "coordination"};
MML.skills["Singing"] = {attribute: "presence"};
MML.skills["Sleight of Hand"] = {attribute: "coordination"};
MML.skills["Stalking"] = {attribute: "coordination"};
MML.skills["Stealth"] = {attribute: "coordination"};
MML.skills["Survival"] = {attribute: "reason"};
MML.skills["Swimming"] = {attribute: "coordination"};
MML.skills["Symbol Magic"] = {attribute: "intellect"};
MML.skills["Tactical"] = {attribute: "reason"};
MML.skills["Teamster"] = {attribute: "reason"};
MML.skills["Tracking"] = {attribute: "reason"};
MML.skills["Veterinary"] = {attribute: "reason"};
MML.skills["Weapon Smith"] = {attribute: "coordination"};
MML.skills["Sword Smith"] = {attribute: "coordination"};
MML.skills["Wizardry"] = {attribute: "intellect"};

MML.attributeMods = {};
MML.attributeMods.strength = [];
MML.attributeMods.strength[0] = -10;
MML.attributeMods.strength[1] = -10;
MML.attributeMods.strength[2] = -10;
MML.attributeMods.strength[3] = -10;
MML.attributeMods.strength[4] = -10;
MML.attributeMods.strength[5] = -10;
MML.attributeMods.strength[6] = -10;
MML.attributeMods.strength[7] = -5;
MML.attributeMods.strength[8] = -3;
MML.attributeMods.strength[9] = -3;
MML.attributeMods.strength[10] = 0;
MML.attributeMods.strength[11] = 0;
MML.attributeMods.strength[12] = 3;
MML.attributeMods.strength[13] = 3;
MML.attributeMods.strength[14] = 3;
MML.attributeMods.strength[15] = 5;
MML.attributeMods.strength[16] = 5;
MML.attributeMods.strength[17] = 5;
MML.attributeMods.strength[18] = 8;
MML.attributeMods.strength[19] = 8;
MML.attributeMods.strength[20] = 8;
MML.attributeMods.strength[21] = 10;
MML.attributeMods.strength[22] = 10;
MML.attributeMods.strength[23] = 15;
MML.attributeMods.coordination = [];
MML.attributeMods.coordination[0] = -10;
MML.attributeMods.coordination[1] = -10;
MML.attributeMods.coordination[2] = -10;
MML.attributeMods.coordination[3] = -10;
MML.attributeMods.coordination[4] = -10;
MML.attributeMods.coordination[5] = -10;
MML.attributeMods.coordination[6] = -10;
MML.attributeMods.coordination[7] = -5;
MML.attributeMods.coordination[8] = -3;
MML.attributeMods.coordination[9] = -3;
MML.attributeMods.coordination[10] = 0;
MML.attributeMods.coordination[11] = 0;
MML.attributeMods.coordination[12] = 3;
MML.attributeMods.coordination[13] = 3;
MML.attributeMods.coordination[14] = 3;
MML.attributeMods.coordination[15] = 5;
MML.attributeMods.coordination[16] = 5;
MML.attributeMods.coordination[17] = 5;
MML.attributeMods.coordination[18] = 8;
MML.attributeMods.coordination[19] = 8;
MML.attributeMods.coordination[20] = 8;
MML.attributeMods.coordination[21] = 10;
MML.attributeMods.coordination[22] = 10;
MML.attributeMods.coordination[23] = 15;
MML.attributeMods.beauty = [];
MML.attributeMods.beauty[0] = -10;
MML.attributeMods.beauty[1] = -10;
MML.attributeMods.beauty[2] = -10;
MML.attributeMods.beauty[3] = -10;
MML.attributeMods.beauty[4] = -10;
MML.attributeMods.beauty[5] = -10;
MML.attributeMods.beauty[6] = -10;
MML.attributeMods.beauty[7] = -5;
MML.attributeMods.beauty[8] = -3;
MML.attributeMods.beauty[9] = -3;
MML.attributeMods.beauty[10] = 0;
MML.attributeMods.beauty[11] = 0;
MML.attributeMods.beauty[12] = 3;
MML.attributeMods.beauty[13] = 3;
MML.attributeMods.beauty[14] = 3;
MML.attributeMods.beauty[15] = 5;
MML.attributeMods.beauty[16] = 5;
MML.attributeMods.beauty[17] = 5;
MML.attributeMods.beauty[18] = 8;
MML.attributeMods.beauty[19] = 8;
MML.attributeMods.beauty[20] = 8;
MML.attributeMods.beauty[21] = 10;
MML.attributeMods.beauty[22] = 10;
MML.attributeMods.beauty[23] = 15;
MML.attributeMods.intellect = [];
MML.attributeMods.intellect[0] = -10;
MML.attributeMods.intellect[1] = -10;
MML.attributeMods.intellect[2] = -10;
MML.attributeMods.intellect[3] = -10;
MML.attributeMods.intellect[4] = -10;
MML.attributeMods.intellect[5] = -10;
MML.attributeMods.intellect[6] = -10;
MML.attributeMods.intellect[7] = -5;
MML.attributeMods.intellect[8] = -3;
MML.attributeMods.intellect[9] = -3;
MML.attributeMods.intellect[10] = 0;
MML.attributeMods.intellect[11] = 0;
MML.attributeMods.intellect[12] = 3;
MML.attributeMods.intellect[13] = 3;
MML.attributeMods.intellect[14] = 3;
MML.attributeMods.intellect[15] = 5;
MML.attributeMods.intellect[16] = 5;
MML.attributeMods.intellect[17] = 5;
MML.attributeMods.intellect[18] = 8;
MML.attributeMods.intellect[19] = 8;
MML.attributeMods.intellect[20] = 8;
MML.attributeMods.intellect[21] = 10;
MML.attributeMods.intellect[22] = 10;
MML.attributeMods.intellect[23] = 15;
MML.attributeMods.reason = [];
MML.attributeMods.reason[0] = -10;
MML.attributeMods.reason[1] = -10;
MML.attributeMods.reason[2] = -10;
MML.attributeMods.reason[3] = -10;
MML.attributeMods.reason[4] = -10;
MML.attributeMods.reason[5] = -10;
MML.attributeMods.reason[6] = -10;
MML.attributeMods.reason[7] = -5;
MML.attributeMods.reason[8] = -3;
MML.attributeMods.reason[9] = -3;
MML.attributeMods.reason[10] = 0;
MML.attributeMods.reason[11] = 0;
MML.attributeMods.reason[12] = 3;
MML.attributeMods.reason[13] = 3;
MML.attributeMods.reason[14] = 3;
MML.attributeMods.reason[15] = 5;
MML.attributeMods.reason[16] = 5;
MML.attributeMods.reason[17] = 5;
MML.attributeMods.reason[18] = 8;
MML.attributeMods.reason[19] = 8;
MML.attributeMods.reason[20] = 8;
MML.attributeMods.reason[21] = 10;
MML.attributeMods.reason[22] = 10;
MML.attributeMods.reason[23] = 15;
MML.attributeMods.creativity = [];
MML.attributeMods.creativity[0] = -10;
MML.attributeMods.creativity[1] = -10;
MML.attributeMods.creativity[2] = -10;
MML.attributeMods.creativity[3] = -10;
MML.attributeMods.creativity[4] = -10;
MML.attributeMods.creativity[5] = -10;
MML.attributeMods.creativity[6] = -10;
MML.attributeMods.creativity[7] = -5;
MML.attributeMods.creativity[8] = -3;
MML.attributeMods.creativity[9] = -3;
MML.attributeMods.creativity[10] = 0;
MML.attributeMods.creativity[11] = 0;
MML.attributeMods.creativity[12] = 3;
MML.attributeMods.creativity[13] = 3;
MML.attributeMods.creativity[14] = 3;
MML.attributeMods.creativity[15] = 5;
MML.attributeMods.creativity[16] = 5;
MML.attributeMods.creativity[17] = 5;
MML.attributeMods.creativity[18] = 8;
MML.attributeMods.creativity[19] = 8;
MML.attributeMods.creativity[20] = 8;
MML.attributeMods.creativity[21] = 10;
MML.attributeMods.creativity[22] = 10;
MML.attributeMods.creativity[23] = 15;
MML.attributeMods.presence = [];
MML.attributeMods.presence[0] = -10;
MML.attributeMods.presence[1] = -10;
MML.attributeMods.presence[2] = -10;
MML.attributeMods.presence[3] = -10;
MML.attributeMods.presence[4] = -10;
MML.attributeMods.presence[5] = -10;
MML.attributeMods.presence[6] = -10;
MML.attributeMods.presence[7] = -5;
MML.attributeMods.presence[8] = -3;
MML.attributeMods.presence[9] = -3;
MML.attributeMods.presence[10] = 0;
MML.attributeMods.presence[11] = 0;
MML.attributeMods.presence[12] = 3;
MML.attributeMods.presence[13] = 3;
MML.attributeMods.presence[14] = 3;
MML.attributeMods.presence[15] = 5;
MML.attributeMods.presence[16] = 5;
MML.attributeMods.presence[17] = 5;
MML.attributeMods.presence[18] = 8;
MML.attributeMods.presence[19] = 8;
MML.attributeMods.presence[20] = 8;
MML.attributeMods.presence[21] = 10;
MML.attributeMods.presence[22] = 10;
MML.attributeMods.presence[23] = 15;
MML.attributeMods.perception = [];
MML.attributeMods.perception[0] = -10;
MML.attributeMods.perception[1] = -10;
MML.attributeMods.perception[2] = -10;
MML.attributeMods.perception[3] = -10;
MML.attributeMods.perception[4] = -10;
MML.attributeMods.perception[5] = -10;
MML.attributeMods.perception[6] = -10;
MML.attributeMods.perception[7] = -10;
MML.attributeMods.perception[8] = -5;
MML.attributeMods.perception[9] = -5;
MML.attributeMods.perception[10] = 0;
MML.attributeMods.perception[11] = 0;
MML.attributeMods.perception[12] = 3;
MML.attributeMods.perception[13] = 3;
MML.attributeMods.perception[14] = 5;
MML.attributeMods.perception[15] = 5;
MML.attributeMods.perception[16] = 8;
MML.attributeMods.perception[17] = 8;
MML.attributeMods.perception[18] = 10;
MML.attributeMods.perception[19] = 10;
MML.attributeMods.perception[20] = 15;
MML.attributeMods.perception[21] = 15;
MML.attributeMods.perception[22] = 15;
MML.attributeMods.perception[23] = 20;

MML.skillMods = {};
MML.skillMods["Dwarf"] = {};
MML.skillMods["Dwarf"]["Armorer"] = 10;
MML.skillMods["Dwarf"]["Earth Elementalism"] = 3;
MML.skillMods["Dwarf"]["Air Elementalism"] = 3;
MML.skillMods["Dwarf"]["Fire Elementalism"] = 3;
MML.skillMods["Dwarf"]["Water Elementalism"] = 3;
MML.skillMods["Dwarf"]["Life Elementalism"] = 3;
MML.skillMods["Dwarf"]["Engineering"] = 5;
MML.skillMods["Dwarf"]["Forced March"] = 10;
MML.skillMods["Dwarf"]["Gem Cutting"] = 10;
MML.skillMods["Dwarf"]["Geology"] = 5;
MML.skillMods["Dwarf"]["Jeweler"] = 10;
MML.skillMods["Dwarf"]["Mathematics"] = 5;
MML.skillMods["Dwarf"]["Metallurgy"] = 10;
MML.skillMods["Dwarf"]["Musical Instrument"] = 5;
MML.skillMods["Dwarf"]["Symbol Magic"] = 3;
MML.skillMods["Dwarf"]["Weapon Smith"] = 10;
MML.skillMods["Gnome"] = {};
MML.skillMods["Gnome"]["Animal Husbandry"] = 5;
MML.skillMods["Gnome"]["Armorer"] = 5;
MML.skillMods["Gnome"]["Blacksmith"] = 10;
MML.skillMods["Gnome"]["Diplomacy"] = 5;
MML.skillMods["Gnome"]["Engineering"] = 10;
MML.skillMods["Gnome"]["Gem Cutting"] = 5;
MML.skillMods["Gnome"]["Jeweler"] = 10;
MML.skillMods["Gnome"]["Mathematics"] = 3;
MML.skillMods["Gnome"]["Negotiation"] = 10;
MML.skillMods["Gnome"]["Teamster"] = 5;
MML.skillMods["Gray Elf"] = {};
MML.skillMods["Gray Elf"]["Animal Husbandry"] = 5;
MML.skillMods["Gray Elf"]["Bowyer"] = 5;
MML.skillMods["Gray Elf"]["Earth Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Air Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Fire Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Water Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Life Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Etiquette"] = 5;
MML.skillMods["Gray Elf"]["Herbalism"] = 3;
MML.skillMods["Gray Elf"]["History"] = 10;
MML.skillMods["Gray Elf"]["Literacy"] = 10;
MML.skillMods["Gray Elf"]["Lore"] = 10;
MML.skillMods["Gray Elf"]["Musical Instrument"] = 5;
MML.skillMods["Gray Elf"]["Navigation"] = 10;
MML.skillMods["Gray Elf"]["Physician"] = 3;
MML.skillMods["Gray Elf"]["Seamanship"] = 10;
MML.skillMods["Gray Elf"]["Singing"] = 5;
MML.skillMods["Gray Elf"]["Symbol Magic"] = 5;
MML.skillMods["Gray Elf"]["Sword Smith"] = 3;
MML.skillMods["Gray Elf"]["Wizardry"] = 5;
MML.skillMods["Hobbit"] = {};
MML.skillMods["Hobbit"]["Animal Husbandry"] = 3;
MML.skillMods["Hobbit"]["Botany"] = 10;
MML.skillMods["Hobbit"]["Brewing"] = 5;
MML.skillMods["Hobbit"]["Bureaucracy"] = 3;
MML.skillMods["Hobbit"]["Calligraphy"] = 5;
MML.skillMods["Hobbit"]["Cooking"] = 5;
MML.skillMods["Hobbit"]["Dancing"] = 10;
MML.skillMods["Hobbit"]["Gambling"] = 10;
MML.skillMods["Hobbit"]["Leatherworking"] = 3;
MML.skillMods["Hobbit"]["Literacy"] = 10;
MML.skillMods["Hobbit"]["Negotiation"] = 10;
MML.skillMods["Hobbit"]["Oration"] = 3;
MML.skillMods["Hobbit"]["Singing"] = 5;
MML.skillMods["Hobbit"]["Stealth"] = 10;
MML.skillMods["Hobbit"]["Sewing"] = 10;
MML.skillMods["Human"] = {};
MML.skillMods["Human"]["Animal Husbandry"] = 5;
MML.skillMods["Human"]["Bureaucracy"] = 5;
MML.skillMods["Human"]["Falconry"] = 3;
MML.skillMods["Human"]["Foraging"] = 5;
MML.skillMods["Human"]["Heraldry"] = 3;
MML.skillMods["Human"]["Herbalism"] = 3;
MML.skillMods["Human"]["Horsemanship"] = 10;
MML.skillMods["Human"]["Leatherworking"] = 10;
MML.skillMods["Human"]["Oration"] = 5;
MML.skillMods["Human"]["Persuasion"] = 10;
MML.skillMods["Human"]["Scrounging"] = 5;
MML.skillMods["Human"]["Teamster"] = 5;
MML.skillMods["Wood Elf"] = {};
MML.skillMods["Wood Elf"]["Animal Husbandry"] = 10;
MML.skillMods["Wood Elf"]["Bowyer"] = 10;
MML.skillMods["Wood Elf"]["Air Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Life Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Falconry"] = 5;
MML.skillMods["Wood Elf"]["Fletchery"] = 10;
MML.skillMods["Wood Elf"]["Foraging"] = 5;
MML.skillMods["Wood Elf"]["Hand Signalling"] = 5;
MML.skillMods["Wood Elf"]["Herbalism"] = 5;
MML.skillMods["Wood Elf"]["Hunting and Trapping"] = 10;
MML.skillMods["Wood Elf"]["Navigation"] = 10;
MML.skillMods["Wood Elf"]["Stealth"] = 10;
MML.skillMods["Wood Elf"]["Survival"] = 10;
MML.skillMods["Wood Elf"]["Tracking"] = 3;
MML.skillMods["Female"] = {};
MML.skillMods["Female"]["Life Elementalism"] = 5;
MML.skillMods["Female"]["Symbol Magic"] = 5;

MML.weaponSkillMods = {};
MML.weaponSkillMods["Dwarf"] = {};
MML.weaponSkillMods["Dwarf"]["Light Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Medium Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Heavy Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Battle Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Two-Handed Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Bardiche"] = 5;
MML.weaponSkillMods["Dwarf"]["Pole Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Maul"] = 5;
MML.weaponSkillMods["Dwarf"]["War Hammer"] = 5;
MML.weaponSkillMods["Dwarf"]["Glaive"] = 5;
MML.weaponSkillMods["Dwarf"]["Halberd"] = 5;
MML.weaponSkillMods["Dwarf"]["Brawling"] = 10;
MML.weaponSkillMods["Dwarf"]["Round Target Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Heater Shield"] = 10;
MML.weaponSkillMods["Gnome"] = {};
MML.weaponSkillMods["Gnome"]["Fauchard"] = 5;
MML.weaponSkillMods["Gnome"]["Bill"] = 5;
MML.weaponSkillMods["Gnome"]["Glaive"] = 5;
MML.weaponSkillMods["Gnome"]["Halberd"] = 5;
MML.weaponSkillMods["Gnome"]["Pole Hammer"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Spetum"] = 5;
MML.weaponSkillMods["Gnome"]["Pitch Fork"] = 5;
MML.weaponSkillMods["Gray Elf"] = {};
MML.weaponSkillMods["Gray Elf"]["Short Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Long Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Falchion"] = 10;
MML.weaponSkillMods["Gray Elf"]["Broadsword"] = 10;
MML.weaponSkillMods["Hobbit"] = {};
MML.weaponSkillMods["Hobbit"]["Short Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Heavy Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Short Composite Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Composite Bow"] = 3;
// MML.weaponSkillMods["Hobbit"]["MissileWeaponThrown"] = 3;
// MML.weaponSkillMods["Hobbit"]["Sling"] = 10;
MML.weaponSkillMods["Wood Elf"] = {};
MML.weaponSkillMods["Wood Elf"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Short Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Long Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Short Composite Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Composite Bow"] = 10;
//MML.weaponSkillMods["Wood Elf"]["thrownWeaponSpears"] = 3;

MML.movementRates = {};
MML.movementRates["Dwarf"] = {
    Prone: 0,
    Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 34
};
MML.movementRates["Gnome"] = {
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 32
};
MML.movementRates["Gray Elf"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 36
};
MML.movementRates["Hobbit"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 5,
	Jog: 8,
	Run: 18
};
MML.movementRates["Human"] = {
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 16,
	Run: 28
};
MML.movementRates["Wood Elf"] = {
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 34
};


MML.recoveryMods = []; //uses health stat
MML.recoveryMods[0] = { hp: 0.33, ep:  1 };
MML.recoveryMods[1] = { hp: 0.33, ep:  1 };
MML.recoveryMods[2] = { hp: 0.33, ep:  1 };
MML.recoveryMods[3] = { hp: 0.33, ep:  1 };
MML.recoveryMods[4] = { hp: 0.33, ep:  1 };
MML.recoveryMods[5] = { hp: 0.33, ep:  1 };
MML.recoveryMods[6] = { hp: 0.33, ep:  1 };
MML.recoveryMods[7] = { hp: 0.33, ep:  1 };
MML.recoveryMods[8] = { hp: 0.5, ep:  2 };
MML.recoveryMods[9] = { hp: 0.5, ep:  2 };
MML.recoveryMods[10] = { hp: 1, ep:  3 };
MML.recoveryMods[11] = { hp: 1, ep:  3 };
MML.recoveryMods[12] = { hp: 1, ep:  3 };
MML.recoveryMods[13] = { hp: 1.5, ep:  4 };
MML.recoveryMods[14] = { hp: 1.5, ep:  4 };
MML.recoveryMods[15] = { hp: 2, ep:  5 };
MML.recoveryMods[16] = { hp: 2, ep:  5 };
MML.recoveryMods[17] = { hp: 3, ep:  6 };
MML.recoveryMods[18] = { hp: 3, ep:  6 };
MML.recoveryMods[19] = { hp: 4, ep:  8 };
MML.recoveryMods[20] = { hp: 4, ep:  8 };
MML.recoveryMods[21] = { hp: 5, ep:  10 };
MML.recoveryMods[22] = { hp: 5, ep:  10 };
MML.recoveryMods[23] = { hp: 5, ep:  10 };
MML.recoveryMods[24] = { hp: 5, ep:  10 };
MML.recoveryMods[25] = { hp: 5, ep:  10 };

MML.attackTempoTable = [-25, -22, -18, -16, -14, -12, -11, -10, -9, -9];

MML.bodyTypes = {};
MML.bodyTypes["Dwarf"] = "humanoid";
MML.bodyTypes["Gnome"] = "humanoid";
MML.bodyTypes["Gray Elf"] = "humanoid";
MML.bodyTypes["Human"] = "humanoid";
MML.bodyTypes["Hobbit"] = "humanoid";
MML.bodyTypes["Wood Elf"] = "humanoid";

MML.hitPositions = {};
MML.hitPositions.humanoid = {};
MML.hitPositions.humanoid[1] = { name: "Top of Head", bodyPart: "Head" };
MML.hitPositions.humanoid[2] = { name: "Face", bodyPart: "Head" };
MML.hitPositions.humanoid[3] = { name: "Rear of Head", bodyPart: "Head" };
MML.hitPositions.humanoid[4] = { name: "Right Side of Head", bodyPart: "Head" };
MML.hitPositions.humanoid[5] = { name: "Left Side of Head", bodyPart: "Head" };
MML.hitPositions.humanoid[6] = { name: "Neck, Throat", bodyPart: "Head" };
MML.hitPositions.humanoid[7] = { name: "Rear of Neck", bodyPart: "Head" };
MML.hitPositions.humanoid[8] = { name: "Right Shoulder", bodyPart: "Right Arm" };
MML.hitPositions.humanoid[9] = { name: "Right Upper Chest", bodyPart: "Chest" };
MML.hitPositions.humanoid[10] = { name: "Right Upper Back", bodyPart: "Chest" };
MML.hitPositions.humanoid[11] = { name: "Left Upper Chest", bodyPart: "Chest" };
MML.hitPositions.humanoid[12] = { name: "Left Upper Back", bodyPart: "Chest" };
MML.hitPositions.humanoid[13] = { name: "Left Shoulder", bodyPart: "Left Arm" };
MML.hitPositions.humanoid[14] = { name: "Right Upper Arm", bodyPart: "Right Arm" };
MML.hitPositions.humanoid[15] = { name: "Right Lower Chest", bodyPart: "Chest" };
MML.hitPositions.humanoid[16] = { name: "Right Mid Back", bodyPart: "Chest" };
MML.hitPositions.humanoid[17] = { name: "Left Lower Chest", bodyPart: "Chest" };
MML.hitPositions.humanoid[18] = { name: "Left Mid Back", bodyPart: "Chest" };
MML.hitPositions.humanoid[19] = { name: "Left Upper Arm", bodyPart: "Left Arm" };
MML.hitPositions.humanoid[20] = { name: "Right Elbow", bodyPart: "Right Arm" };
MML.hitPositions.humanoid[21] = { name: "Right Abdomen", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[22] = { name: "Right Lower Back", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[23] = { name: "Left Abdomen", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[24] = { name: "Left Lower Back", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[25] = { name: "Left Elbow", bodyPart: "Left Arm" };
MML.hitPositions.humanoid[26] = { name: "Right Forearm", bodyPart: "Right Arm" };
MML.hitPositions.humanoid[27] = { name: "Right Hip", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[28] = { name: "Right Buttock", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[29] = { name: "Left Hip", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[30] = { name: "Left Buttock", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[31] = { name: "Left Forearm", bodyPart: "Left Arm" };
MML.hitPositions.humanoid[32] = { name: "Right Hand/Wrist", bodyPart: "Right Arm" };
MML.hitPositions.humanoid[33] = { name: "Groin", bodyPart: "Abdomen" };
MML.hitPositions.humanoid[34] = { name: "Left Hand/Wrist", bodyPart: "Left Arm" };
MML.hitPositions.humanoid[35] = { name: "Right Upper Thigh", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[36] = { name: "Left Upper Thigh", bodyPart: "Left Leg" };
MML.hitPositions.humanoid[37] = { name: "Right Lower Thigh", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[38] = { name: "Left Lower Thigh", bodyPart: "Left Leg" };
MML.hitPositions.humanoid[39] = { name: "Right Knee", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[40] = { name: "Left Knee", bodyPart: "Left Leg" };
MML.hitPositions.humanoid[41] = { name: "Right Upper Shin", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[42] = { name: "Left Upper Shin", bodyPart: "Left Leg" };
MML.hitPositions.humanoid[43] = { name: "Right Lower Shin", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[44] = { name: "Left Lower Shin", bodyPart: "Left Leg" };
MML.hitPositions.humanoid[45] = { name: "Right Foot/Ankle", bodyPart: "Right Leg" };
MML.hitPositions.humanoid[46] = { name: "Left Foot/Ankle", bodyPart: "Left Leg" };

MML.sensitiveAreas = {};
MML.sensitiveAreas.humanoid = ["Face", "Neck, Throat", "Groin"];

MML.hitTables = {};
MML.hitTables.humanoid = {};
MML.hitTables.humanoid.A = {};
MML.hitTables.humanoid.A[1] = 1;
MML.hitTables.humanoid.A[2] = 1;
MML.hitTables.humanoid.A[3] = 2;
MML.hitTables.humanoid.A[4] = 3;
MML.hitTables.humanoid.A[5] = 3;
MML.hitTables.humanoid.A[6] = 4;
MML.hitTables.humanoid.A[7] = 4;
MML.hitTables.humanoid.A[8] = 5;
MML.hitTables.humanoid.A[9] = 5;
MML.hitTables.humanoid.A[10] = 6;
MML.hitTables.humanoid.A[11] = 7;
MML.hitTables.humanoid.A[12] = 8;
MML.hitTables.humanoid.A[13] = 8;
MML.hitTables.humanoid.A[14] = 8;
MML.hitTables.humanoid.A[15] = 8;
MML.hitTables.humanoid.A[16] = 9;
MML.hitTables.humanoid.A[17] = 9;
MML.hitTables.humanoid.A[18] = 9;
MML.hitTables.humanoid.A[19] = 9;
MML.hitTables.humanoid.A[20] = 10;
MML.hitTables.humanoid.A[21] = 10;
MML.hitTables.humanoid.A[22] = 11;
MML.hitTables.humanoid.A[23] = 11;
MML.hitTables.humanoid.A[24] = 11;
MML.hitTables.humanoid.A[25] = 11;
MML.hitTables.humanoid.A[26] = 12;
MML.hitTables.humanoid.A[27] = 12;
MML.hitTables.humanoid.A[28] = 13;
MML.hitTables.humanoid.A[29] = 13;
MML.hitTables.humanoid.A[30] = 13;
MML.hitTables.humanoid.A[31] = 13;
MML.hitTables.humanoid.A[32] = 14;
MML.hitTables.humanoid.A[33] = 14;
MML.hitTables.humanoid.A[34] = 14;
MML.hitTables.humanoid.A[35] = 15;
MML.hitTables.humanoid.A[36] = 15;
MML.hitTables.humanoid.A[37] = 16;
MML.hitTables.humanoid.A[38] = 16;
MML.hitTables.humanoid.A[39] = 17;
MML.hitTables.humanoid.A[40] = 17;
MML.hitTables.humanoid.A[41] = 17;
MML.hitTables.humanoid.A[42] = 18;
MML.hitTables.humanoid.A[43] = 18;
MML.hitTables.humanoid.A[44] = 19;
MML.hitTables.humanoid.A[45] = 19;
MML.hitTables.humanoid.A[46] = 19;
MML.hitTables.humanoid.A[47] = 19;
MML.hitTables.humanoid.A[48] = 20;
MML.hitTables.humanoid.A[49] = 20;
MML.hitTables.humanoid.A[50] = 21;
MML.hitTables.humanoid.A[51] = 21;
MML.hitTables.humanoid.A[52] = 21;
MML.hitTables.humanoid.A[53] = 22;
MML.hitTables.humanoid.A[54] = 22;
MML.hitTables.humanoid.A[55] = 23;
MML.hitTables.humanoid.A[56] = 23;
MML.hitTables.humanoid.A[57] = 23;
MML.hitTables.humanoid.A[58] = 24;
MML.hitTables.humanoid.A[59] = 24;
MML.hitTables.humanoid.A[60] = 25;
MML.hitTables.humanoid.A[61] = 25;
MML.hitTables.humanoid.A[62] = 26;
MML.hitTables.humanoid.A[63] = 26;
MML.hitTables.humanoid.A[64] = 27;
MML.hitTables.humanoid.A[65] = 27;
MML.hitTables.humanoid.A[66] = 27;
MML.hitTables.humanoid.A[67] = 28;
MML.hitTables.humanoid.A[68] = 28;
MML.hitTables.humanoid.A[69] = 29;
MML.hitTables.humanoid.A[70] = 29;
MML.hitTables.humanoid.A[71] = 29;
MML.hitTables.humanoid.A[72] = 30;
MML.hitTables.humanoid.A[73] = 30;
MML.hitTables.humanoid.A[74] = 31;
MML.hitTables.humanoid.A[75] = 31;
MML.hitTables.humanoid.A[76] = 32;
MML.hitTables.humanoid.A[77] = 32;
MML.hitTables.humanoid.A[78] = 33;
MML.hitTables.humanoid.A[79] = 34;
MML.hitTables.humanoid.A[80] = 34;
MML.hitTables.humanoid.A[81] = 35;
MML.hitTables.humanoid.A[82] = 35;
MML.hitTables.humanoid.A[83] = 35;
MML.hitTables.humanoid.A[84] = 36;
MML.hitTables.humanoid.A[85] = 36;
MML.hitTables.humanoid.A[86] = 36;
MML.hitTables.humanoid.A[87] = 37;
MML.hitTables.humanoid.A[88] = 37;
MML.hitTables.humanoid.A[89] = 38;
MML.hitTables.humanoid.A[90] = 38;
MML.hitTables.humanoid.A[91] = 39;
MML.hitTables.humanoid.A[92] = 39;
MML.hitTables.humanoid.A[93] = 40;
MML.hitTables.humanoid.A[94] = 40;
MML.hitTables.humanoid.A[95] = 41;
MML.hitTables.humanoid.A[96] = 42;
MML.hitTables.humanoid.A[97] = 43;
MML.hitTables.humanoid.A[98] = 44;
MML.hitTables.humanoid.A[99] = 45;
MML.hitTables.humanoid.A[100] = 46;
MML.hitTables.humanoid.B = {};
MML.hitTables.humanoid.B[1] = 1;
MML.hitTables.humanoid.B[2] = 1;
MML.hitTables.humanoid.B[3] = 2;
MML.hitTables.humanoid.B[4] = 3;
MML.hitTables.humanoid.B[5] = 3;
MML.hitTables.humanoid.B[6] = 4;
MML.hitTables.humanoid.B[7] = 4;
MML.hitTables.humanoid.B[8] = 5;
MML.hitTables.humanoid.B[9] = 5;
MML.hitTables.humanoid.B[10] = 6;
MML.hitTables.humanoid.B[11] = 7;
MML.hitTables.humanoid.B[12] = 8;
MML.hitTables.humanoid.B[13] = 8;
MML.hitTables.humanoid.B[14] = 8;
MML.hitTables.humanoid.B[15] = 8;
MML.hitTables.humanoid.B[16] = 9;
MML.hitTables.humanoid.B[17] = 9;
MML.hitTables.humanoid.B[18] = 10;
MML.hitTables.humanoid.B[19] = 10;
MML.hitTables.humanoid.B[20] = 11;
MML.hitTables.humanoid.B[21] = 11;
MML.hitTables.humanoid.B[22] = 12;
MML.hitTables.humanoid.B[23] = 12;
MML.hitTables.humanoid.B[24] = 13;
MML.hitTables.humanoid.B[25] = 13;
MML.hitTables.humanoid.B[26] = 13;
MML.hitTables.humanoid.B[27] = 13;
MML.hitTables.humanoid.B[28] = 14;
MML.hitTables.humanoid.B[29] = 14;
MML.hitTables.humanoid.B[30] = 14;
MML.hitTables.humanoid.B[31] = 14;
MML.hitTables.humanoid.B[32] = 15;
MML.hitTables.humanoid.B[33] = 15;
MML.hitTables.humanoid.B[34] = 16;
MML.hitTables.humanoid.B[35] = 16;
MML.hitTables.humanoid.B[36] = 17;
MML.hitTables.humanoid.B[37] = 17;
MML.hitTables.humanoid.B[38] = 18;
MML.hitTables.humanoid.B[39] = 18;
MML.hitTables.humanoid.B[40] = 19;
MML.hitTables.humanoid.B[41] = 19;
MML.hitTables.humanoid.B[42] = 19;
MML.hitTables.humanoid.B[43] = 19;
MML.hitTables.humanoid.B[44] = 20;
MML.hitTables.humanoid.B[45] = 21;
MML.hitTables.humanoid.B[46] = 21;
MML.hitTables.humanoid.B[47] = 22;
MML.hitTables.humanoid.B[48] = 22;
MML.hitTables.humanoid.B[49] = 23;
MML.hitTables.humanoid.B[50] = 23;
MML.hitTables.humanoid.B[51] = 24;
MML.hitTables.humanoid.B[52] = 24;
MML.hitTables.humanoid.B[53] = 25;
MML.hitTables.humanoid.B[54] = 26;
MML.hitTables.humanoid.B[55] = 26;
MML.hitTables.humanoid.B[56] = 26;
MML.hitTables.humanoid.B[57] = 26;
MML.hitTables.humanoid.B[58] = 27;
MML.hitTables.humanoid.B[59] = 27;
MML.hitTables.humanoid.B[60] = 28;
MML.hitTables.humanoid.B[61] = 28;
MML.hitTables.humanoid.B[62] = 29;
MML.hitTables.humanoid.B[63] = 29;
MML.hitTables.humanoid.B[64] = 30;
MML.hitTables.humanoid.B[65] = 30;
MML.hitTables.humanoid.B[66] = 31;
MML.hitTables.humanoid.B[67] = 31;
MML.hitTables.humanoid.B[68] = 31;
MML.hitTables.humanoid.B[69] = 31;
MML.hitTables.humanoid.B[70] = 32;
MML.hitTables.humanoid.B[71] = 32;
MML.hitTables.humanoid.B[72] = 32;
MML.hitTables.humanoid.B[73] = 33;
MML.hitTables.humanoid.B[74] = 34;
MML.hitTables.humanoid.B[75] = 34;
MML.hitTables.humanoid.B[76] = 34;
MML.hitTables.humanoid.B[77] = 35;
MML.hitTables.humanoid.B[78] = 35;
MML.hitTables.humanoid.B[79] = 35;
MML.hitTables.humanoid.B[80] = 35;
MML.hitTables.humanoid.B[81] = 36;
MML.hitTables.humanoid.B[82] = 36;
MML.hitTables.humanoid.B[83] = 36;
MML.hitTables.humanoid.B[84] = 36;
MML.hitTables.humanoid.B[85] = 37;
MML.hitTables.humanoid.B[86] = 37;
MML.hitTables.humanoid.B[87] = 37;
MML.hitTables.humanoid.B[88] = 38;
MML.hitTables.humanoid.B[89] = 38;
MML.hitTables.humanoid.B[90] = 38;
MML.hitTables.humanoid.B[91] = 39;
MML.hitTables.humanoid.B[92] = 39;
MML.hitTables.humanoid.B[93] = 40;
MML.hitTables.humanoid.B[94] = 40;
MML.hitTables.humanoid.B[95] = 41;
MML.hitTables.humanoid.B[96] = 42;
MML.hitTables.humanoid.B[97] = 43;
MML.hitTables.humanoid.B[98] = 44;
MML.hitTables.humanoid.B[99] = 45;
MML.hitTables.humanoid.B[100] = 46;
MML.hitTables.humanoid.C = {};
MML.hitTables.humanoid.C[1] = 1;
MML.hitTables.humanoid.C[2] = 1;
MML.hitTables.humanoid.C[3] = 2;
MML.hitTables.humanoid.C[4] = 3;
MML.hitTables.humanoid.C[5] = 3;
MML.hitTables.humanoid.C[6] = 4;
MML.hitTables.humanoid.C[7] = 4;
MML.hitTables.humanoid.C[8] = 5;
MML.hitTables.humanoid.C[9] = 5;
MML.hitTables.humanoid.C[10] = 6;
MML.hitTables.humanoid.C[11] = 7;
MML.hitTables.humanoid.C[12] = 8;
MML.hitTables.humanoid.C[13] = 8;
MML.hitTables.humanoid.C[14] = 8;
MML.hitTables.humanoid.C[15] = 8;
MML.hitTables.humanoid.C[16] = 8;
MML.hitTables.humanoid.C[17] = 9;
MML.hitTables.humanoid.C[18] = 9;
MML.hitTables.humanoid.C[19] = 9;
MML.hitTables.humanoid.C[20] = 9;
MML.hitTables.humanoid.C[21] = 10;
MML.hitTables.humanoid.C[22] = 10;
MML.hitTables.humanoid.C[23] = 10;
MML.hitTables.humanoid.C[24] = 11;
MML.hitTables.humanoid.C[25] = 11;
MML.hitTables.humanoid.C[26] = 12;
MML.hitTables.humanoid.C[27] = 12;
MML.hitTables.humanoid.C[28] = 12;
MML.hitTables.humanoid.C[29] = 12;
MML.hitTables.humanoid.C[30] = 13;
MML.hitTables.humanoid.C[31] = 13;
MML.hitTables.humanoid.C[32] = 13;
MML.hitTables.humanoid.C[33] = 14;
MML.hitTables.humanoid.C[34] = 14;
MML.hitTables.humanoid.C[35] = 14;
MML.hitTables.humanoid.C[36] = 14;
MML.hitTables.humanoid.C[37] = 14;
MML.hitTables.humanoid.C[38] = 15;
MML.hitTables.humanoid.C[39] = 15;
MML.hitTables.humanoid.C[40] = 16;
MML.hitTables.humanoid.C[41] = 17;
MML.hitTables.humanoid.C[42] = 18;
MML.hitTables.humanoid.C[43] = 18;
MML.hitTables.humanoid.C[44] = 19;
MML.hitTables.humanoid.C[45] = 20;
MML.hitTables.humanoid.C[46] = 20;
MML.hitTables.humanoid.C[47] = 21;
MML.hitTables.humanoid.C[48] = 21;
MML.hitTables.humanoid.C[49] = 21;
MML.hitTables.humanoid.C[50] = 21;
MML.hitTables.humanoid.C[51] = 21;
MML.hitTables.humanoid.C[52] = 22;
MML.hitTables.humanoid.C[53] = 23;
MML.hitTables.humanoid.C[54] = 23;
MML.hitTables.humanoid.C[55] = 24;
MML.hitTables.humanoid.C[56] = 24;
MML.hitTables.humanoid.C[57] = 24;
MML.hitTables.humanoid.C[58] = 25;
MML.hitTables.humanoid.C[59] = 26;
MML.hitTables.humanoid.C[60] = 26;
MML.hitTables.humanoid.C[61] = 26;
MML.hitTables.humanoid.C[62] = 26;
MML.hitTables.humanoid.C[63] = 26;
MML.hitTables.humanoid.C[64] = 27;
MML.hitTables.humanoid.C[65] = 27;
MML.hitTables.humanoid.C[66] = 27;
MML.hitTables.humanoid.C[67] = 27;
MML.hitTables.humanoid.C[68] = 27;
MML.hitTables.humanoid.C[69] = 28;
MML.hitTables.humanoid.C[70] = 29;
MML.hitTables.humanoid.C[71] = 30;
MML.hitTables.humanoid.C[72] = 30;
MML.hitTables.humanoid.C[73] = 30;
MML.hitTables.humanoid.C[74] = 30;
MML.hitTables.humanoid.C[75] = 31;
MML.hitTables.humanoid.C[76] = 32;
MML.hitTables.humanoid.C[77] = 32;
MML.hitTables.humanoid.C[78] = 32;
MML.hitTables.humanoid.C[79] = 32;
MML.hitTables.humanoid.C[80] = 33;
MML.hitTables.humanoid.C[81] = 34;
MML.hitTables.humanoid.C[82] = 35;
MML.hitTables.humanoid.C[83] = 35;
MML.hitTables.humanoid.C[84] = 35;
MML.hitTables.humanoid.C[85] = 35;
MML.hitTables.humanoid.C[86] = 36;
MML.hitTables.humanoid.C[87] = 37;
MML.hitTables.humanoid.C[88] = 37;
MML.hitTables.humanoid.C[89] = 37;
MML.hitTables.humanoid.C[90] = 37;
MML.hitTables.humanoid.C[91] = 38;
MML.hitTables.humanoid.C[92] = 39;
MML.hitTables.humanoid.C[93] = 39;
MML.hitTables.humanoid.C[94] = 40;
MML.hitTables.humanoid.C[95] = 41;
MML.hitTables.humanoid.C[96] = 42;
MML.hitTables.humanoid.C[97] = 43;
MML.hitTables.humanoid.C[98] = 44;
MML.hitTables.humanoid.C[99] = 45;
MML.hitTables.humanoid.C[100] = 46;

// Armor Styles
MML.items = {};
MML.items["Barbute Helm"] = { name: "Barbute Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 85}, {position: 3, coverage: 100}, {position: 5, coverage: 100}, {position: 4, coverage: 100}], totalPostitions: 4.85 };
MML.items["Bascinet Helm"] = { name: "Bascinet Helm", type: "armor", protection: [{position: 1, coverage: 100},{position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Camail"] = { name: "Camail", type: "armor", protection: [{position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 2 };
MML.items["Camail-Conical"] = { name: "Camail-Conical", type: "armor", protection: [{position: 3, coverage: 100},{position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 3 };
MML.items["Cap"] = { name: "Cap", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Cheeks"] = { name: "Cheeks", type: "armor", protection: [{position: 2, coverage: 40}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 2.4 };
MML.items["Collar"] = { name: "Collar", type: "armor", protection: [{position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 2 };
MML.items["Conical Helm"] = { name: "Conical Helm", type: "armor", protection: [{position: 1, coverage: 100}], totalPostitions: 1 };
MML.items["Duerne Helm"] = { name: "Duerne Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Dwarven War Hood"] = { name: "Dwarven War Hood", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 7 };
MML.items["Face Plate"] = { name: "Face Plate", type: "armor", protection: [{position: 2, coverage: 100}], totalPostitions: 1 };
MML.items["Great Helm"] = { name: "Great Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 5 };
MML.items["Half-Face Plate"] = { name: "Half-Face Plate", type: "armor", protection: [{position: 2, coverage: 40}], totalPostitions: 0.4 };
MML.items["Hood"] = { name: "Hood", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 6 };
MML.items["Nose Guard"] = { name: "Nose Guard", type: "armor", protection: [{position: 2, coverage: 25}], totalPostitions: 0.25 };
MML.items["Pot Helm"] = { name: "Pot Helm", type: "armor", protection: [{position: 1, coverage: 100}], totalPostitions: 1 };
MML.items["Sallet Helm"] = { name: "Sallet Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 70}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 5.7 };
MML.items["Throat Guard"] = { name: "Throat Guard", type: "armor", protection: [{position: 2, coverage: 30}, {position: 6, coverage: 100}], totalPostitions: 1.3 };
MML.items["War Hat"] = { name: "War Hat", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 25}, {position: 3, coverage: 25}, {position: 4, coverage: 25}, {position: 5, coverage: 25}], totalPostitions: 2 };
MML.items["Breast Plate"] = { name: "Breast Plate", type: "armor", protection: [{position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}], totalPostitions: 12 };
MML.items["Byrnie"] = { name: "Byrnie", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 33, coverage: 50}], totalPostitions: 20.5 };
MML.items["Hauberk"] = { name: "Hauberk", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 31, coverage: 100}, {position: 33, coverage: 100}, {position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}], totalPostitions: 29 };
MML.items["Shirt"] = { name: "Shirt", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}], totalPostitions: 14 };
MML.items["Shirt with Arms"] = { name: "Shirt with Arms", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 20 };
MML.items["Breech"] = { name: "Breech", type: "armor", protection: [{position: 33, coverage: 100}], totalPostitions: 1 };
MML.items["Pants"] = { name: "Pants", type: "armor", protection: [{position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 33, coverage: 100}, {position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}, {position: 39, coverage: 100}, {position: 40, coverage: 100}, {position: 41, coverage: 100}, {position: 42, coverage: 100}, {position: 43, coverage: 100}, {position: 43, coverage: 100}, {position: 44, coverage: 100}], totalPostitions: 15 };
MML.items["Arms"] = { name: "Arms", type: "armor", protection: [{position: 14, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 6 };
MML.items["Forearms"] = { name: "Forearms", type: "armor", protection: [{position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 2 };
MML.items["Gauntlets, Finger (or Glove)"] = { name: "Gauntlets, Finger (or Glove)", type: "armor", protection: [{position: 32, coverage: 100}, {position: 34, coverage: 100}], totalPostitions: 2 };
MML.items["Gauntlets, Mitten"] = { name: "Gauntlets, Mitten", type: "armor", protection: [{position: 32, coverage: 100}, {position: 34, coverage: 100}], totalPostitions: 2 };
MML.items["Half-Arms"] = { name: "Half-Arms", type: "armor", protection: [{position: 20, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 4 };
MML.items["Half-Legs"] = { name: "Half-Legs", type: "armor", protection: [{position: 35, coverage: 50}, {position: 36, coverage: 50}, {position: 37, coverage: 50}, {position: 38, coverage: 50}, {position: 39, coverage: 50}, {position: 40, coverage: 50}, {position: 41, coverage: 50}, {position: 42, coverage: 50}, {position: 43, coverage: 50}, {position: 43, coverage: 50}, {position: 44, coverage: 50}], totalPostitions: 5 };
MML.items["Legs"] = { name: "Legs", type: "armor", protection: [{position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}, {position: 39, coverage: 100}, {position: 40, coverage: 100}, {position: 41, coverage: 100}, {position: 42, coverage: 100}, {position: 43, coverage: 100}, {position: 43, coverage: 100}, {position: 44, coverage: 100}], totalPostitions: 10 };
MML.items["Shin Guards"] = { name: "Shin Guards", type: "armor", protection: [{position: 39, coverage: 50}, {position: 40, coverage: 50}, {position: 41, coverage: 50}, {position: 42, coverage: 50}, {position: 43, coverage: 50}, {position: 43, coverage: 50}, {position: 44, coverage: 50}], totalPostitions: 3 };
MML.items["Shoe Guards"] = { name: "Shoe Guards", type: "armor", protection: [{position: 45, coverage: 100}, {position: 46, coverage: 100}], totalPostitions: 2 };
MML.items["Elbow Guards"] = { name: "Elbow Guards", type: "armor", protection: [{position: 20, coverage: 100}, {position: 25, coverage: 100}], totalPostitions: 2 };
MML.items["Hip Guards"] = { name: "Hip Guards", type: "armor", protection: [{position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}], totalPostitions: 4 };
MML.items["Knee Guards"] = { name: "Knee Guards", type: "armor", protection: [{position: 39, coverage: 100}, {position: 40, coverage: 100}], totalPostitions: 2 };
MML.items["Shoulder Guards"] = { name: "Shoulder Guards", type: "armor", protection: [{position: 8, coverage: 100}, {position: 13, coverage: 100}], totalPostitions: 2 };
MML.items["Socks"] = { name: "Socks", type: "armor", protection: [{position: 45, coverage: 100}, {position: 46, coverage: 100}], totalPostitions: 2 };

MML.APVList = {};
MML.APVList["None"] = { family: "None", name: "None", surface: 0, cut: 0, chop: 0, pierce: 0, thrust: 0, impact: 0, flanged: 0, weightPerPosition: 0};
MML.APVList["Greater Steel Coat of Lames, Leather, Medium"] = { family: "Coat of Lames", name: "Greater Steel Coat of Lames, Leather, Medium", surface: 34, cut: 29, chop: 19, pierce: 30, thrust: 19, impact: 18, flanged: 13, weightPerPosition: 2.12};
MML.APVList["Greater Steel Coat of Lames, Cloth, Medium"] = { family: "Coat of Lames", name: "Greater Steel Coat of Lames, Cloth, Medium", surface: 33, cut: 28, chop: 18, pierce: 30, thrust: 19, impact: 16, flanged: 12, weightPerPosition: 1.87};
MML.APVList["Hardened Leather Coat of Lames, Leather, Medium"] = { family: "Coat of Lames", name: "Hardened Leather Coat of Lames, Leather, Medium", surface: 15, cut: 14, chop: 10, pierce: 15, thrust: 10, impact: 10, flanged: 6, weightPerPosition: 1.14};
MML.APVList["Greater Steel Coat of Plates, Leather, Medium"] = { family: "Coat of Plates", name: "Greater Steel Coat of Plates, Leather, Medium", surface: 27, cut: 23, chop: 15, pierce: 23, thrust: 16, impact: 10, flanged: 9, weightPerPosition: 1.81};
MML.APVList["Greater Steel Coat of Plates, Cloth, Medium"] = { family: "Coat of Plates", name: "Greater Steel Coat of Plates, Cloth, Medium", surface: 26, cut: 25, chop: 14, pierce: 23, thrust: 16, impact: 8, flanged: 8, weightPerPosition: 1.55};
MML.APVList["Mannish High Steel Coat of Plates, Leather, Medium"] = { family: "Coat of Plates", name: "Mannish High Steel Coat of Plates, Leather, Medium", surface: 31, cut: 28, chop: 17, pierce: 26, thrust: 19, impact: 11, flanged: 10, weightPerPosition: 1.81};
MML.APVList["Greater Steel Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Greater Steel Coat of Scales, Leather, Medium", surface: 34, cut: 24, chop: 17, pierce: 22, thrust: 15, impact: 15, flanged: 10, weightPerPosition: 1.91};
MML.APVList["Greater Steel Coat of Scales, Cloth, Medium"] = { family: "Coat of Scales", name: "Greater Steel Coat of Scales, Cloth, Medium", surface: 33, cut: 23, chop: 16, pierce: 21, thrust: 14, impact: 13, flanged: 9, weightPerPosition: 1.66};
MML.APVList["Hardened Leather Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Hardened Leather Coat of Scales, Leather, Medium", surface: 14, cut: 14, chop: 9, pierce: 12, thrust: 9, impact: 7, flanged: 5, weightPerPosition: 1.05};
MML.APVList["Mannish High Steel Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Mannish High Steel Coat of Scales, Leather, Medium", surface: 39, cut: 27, chop: 19, pierce: 25, thrust: 17, impact: 17, flanged: 11, weightPerPosition: 1.91};
MML.APVList["Mannish Cloth, Light"] = { family: "Cloth", name: "Mannish Cloth, Light", surface: 2, cut: 2, chop: 2, pierce: 2, thrust: 2, impact: 1, flanged: 1, weightPerPosition: 0.04};
MML.APVList["Mannish Cloth, Medium"] = { family: "Cloth", name: "Mannish Cloth, Medium", surface: 4, cut: 3, chop: 3, pierce: 3, thrust: 3, impact: 1, flanged: 2, weightPerPosition: 0.08};
MML.APVList["Mannish Cloth, Heavy"] = { family: "Cloth", name: "Mannish Cloth, Heavy", surface: 6, cut: 5, chop: 4, pierce: 5, thrust: 5, impact: 2, flanged: 2, weightPerPosition: 0.24};
MML.APVList["Mannish Quilt"] = { family: "Cloth", name: "Mannish Quilt", surface: 8, cut: 6, chop: 6, pierce: 7, thrust: 5, impact: 8, flanged: 7, weightPerPosition: 0.15};
MML.APVList["Mannish Silk"] = { family: "Cloth", name: "Mannish Silk", surface: 5, cut: 4, chop: 3, pierce: 4, thrust: 4, impact: 2, flanged: 2, weightPerPosition: 0.06};
MML.APVList["Fur, Light"] = { family: "Light Leather", name: "Fur, Light", surface: 10, cut: 6, chop: 6, pierce: 6, thrust: 5, impact: 6, flanged: 6, weightPerPosition: 0.2};
MML.APVList["Fur, Medium"] = { family: "Light Leather", name: "Fur, Medium", surface: 10, cut: 6, chop: 6, pierce: 6, thrust: 5, impact: 6, flanged: 7, weightPerPosition: 0.4};
MML.APVList["Fur, Heavy"] = { family: "Heavy Leather", name: "Fur, Heavy", surface: 11, cut: 8, chop: 8, pierce: 7, thrust: 7, impact: 7, flanged: 8, weightPerPosition: 0.6};
MML.APVList["Hardened Leather, Medium"] = { family: "Heavy Leather", name: "Hardened Leather, Medium", surface: 10, cut: 9, chop: 6, pierce: 9, thrust: 8, impact: 5, flanged: 4, weightPerPosition: 0.64};
MML.APVList["Hardened Leather, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather, Heavy", surface: 14, cut: 12, chop: 8, pierce: 13, thrust: 10, impact: 7, flanged: 6, weightPerPosition: 0.96};
MML.APVList["Hardened Leather Lames, Medium"] = { family: "Heavy Leather", name: "Hardened Leather Lames, Medium", surface: 12, cut: 9, chop: 6, pierce: 10, thrust: 6, impact: 6, flanged: 4, weightPerPosition: 0.77};
MML.APVList["Hardened Leather Lames, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather Lames, Heavy", surface: 16, cut: 13, chop: 8, pierce: 13, thrust: 8, impact: 8, flanged: 6, weightPerPosition: 1.15};
MML.APVList["Hardened Leather Scales, Medium"] = { family: "Heavy Leather", name: "Hardened Leather Scales, Medium", surface: 12, cut: 10, chop: 6, pierce: 8, thrust: 6, impact: 5, flanged: 4, weightPerPosition: 0.68};
MML.APVList["Hardened Leather Scales, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather Scales, Heavy", surface: 16, cut: 13, chop: 8, pierce: 11, thrust: 8, impact: 7, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Hide, Light"] = { family: "Light Leather", name: "Hide, Light", surface: 5, cut: 2, chop: 2, pierce: 2, thrust: 2, impact: 2, flanged: 2, weightPerPosition: 0.14};
MML.APVList["Hide, Heavy"] = { family: "Heavy Leather", name: "Hide, Heavy", surface: 6, cut: 3, chop: 4, pierce: 3, thrust: 3, impact: 4, flanged: 3, weightPerPosition: 0.42};
MML.APVList["Leather, Light"] = { family: "Light Leather", name: "Leather, Light", surface: 5, cut: 3, chop: 4, pierce: 3, thrust: 3, impact: 4, flanged: 3, weightPerPosition: 0.16};
MML.APVList["Leather, Medium"] = { family: "Light Leather", name: "Leather, Medium", surface: 6, cut: 5, chop: 5, pierce: 4, thrust: 4, impact: 5, flanged: 4, weightPerPosition: 0.32};
MML.APVList["Leather, Heavy"] = { family: "Heavy Leather", name: "Leather, Heavy", surface: 9, cut: 8, chop: 8, pierce: 7, thrust: 7, impact: 7, flanged: 7, weightPerPosition: 0.48};
MML.APVList["Mannish Padded"] = { family: "Padded", name: "Mannish Padded", surface: 11, cut: 8, chop: 9, pierce: 9, thrust: 7, impact: 10, flanged: 9, weightPerPosition: 0.40};
MML.APVList["Laced Mail of Common Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Common Steel, Medium", surface: 20, cut: 17, chop: 9, pierce: 15, thrust: 10, impact: 5, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Greater Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Greater Steel, Medium", surface: 24, cut: 20, chop: 11, pierce: 18, thrust: 12, impact: 6, flanged: 7, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Mannish High Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Mannish High Steel, Medium", surface: 28, cut: 23, chop: 13, pierce: 21, thrust: 15, impact: 7, flanged: 8, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Wrought Iron, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Wrought Iron, Medium", surface: 12, cut: 10, chop: 5, pierce: 9, thrust: 6, impact: 3, flanged: 3, weightPerPosition: 1.29};
MML.APVList["Lames of Common Steel, Medium"] = { family: "Lames", name: "Lames of Common Steel, Medium", surface: 26, cut: 20, chop: 13, pierce: 21, thrust: 13, impact: 11, flanged: 9, weightPerPosition: 1.70};
MML.APVList["Lames of Greater Steel, Medium"] = { family: "Lames", name: "Lames of Greater Steel, Medium", surface: 31, cut: 24, chop: 15, pierce: 25, thrust: 15, impact: 14, flanged: 11, weightPerPosition: 1.70};
MML.APVList["Lames of Mannish High Steel, Light"] = { family: "Lames", name: "Lames of Mannish High Steel, Light", surface: 32, cut: 20, chop: 13, pierce: 20, thrust: 13, impact: 12, flanged: 9, weightPerPosition: 1.28};
MML.APVList["Lames of Mannish High Steel, Medium"] = { family: "Lames", name: "Lames of Mannish High Steel, Medium", surface: 36, cut: 26, chop: 18, pierce: 29, thrust: 18, impact: 16, flanged: 13, weightPerPosition: 1.70};
MML.APVList["Lames of Wrought Iron, Medium"] = { family: "Lames", name: "Lames of Wrought Iron, Medium", surface: 15, cut: 12, chop: 8, pierce: 13, thrust: 8, impact: 7, flanged: 6, weightPerPosition: 1.68};
MML.APVList["Brazed Mail of Greater Steel"] = { family: "Light Mail", name: "Brazed Mail of Greater Steel", surface: 22, cut: 19, chop: 12, pierce: 20, thrust: 14, impact: 6, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Brazed Mail of Mannish High Steel"] = { family: "Light Mail", name: "Brazed Mail of Mannish High Steel", surface: 25, cut: 22, chop: 13, pierce: 24, thrust: 17, impact: 7, flanged: 7, weightPerPosition: 1.30};
MML.APVList["Butted Mail of Common Steel"] = { family: "Light Mail", name: "Butted Mail of Common Steel", surface: 16, cut: 14, chop: 8, pierce: 14, thrust: 8, impact: 4, flanged: 4, weightPerPosition: 0.95};
MML.APVList["Butted Mail of Greater Steel"] = { family: "Light Mail", name: "Butted Mail of Greater Steel", surface: 19, cut: 17, chop: 9, pierce: 16, thrust: 9, impact: 5, flanged: 5, weightPerPosition: 0.95};
MML.APVList["Butted Mail of Wrought Iron"] = { family: "Light Mail", name: "Butted Mail of Wrought Iron", surface: 10, cut: 8, chop: 5, pierce: 8, thrust: 5, impact: 2, flanged: 2, weightPerPosition: 0.94};
MML.APVList["Double Mail of Common Steel"] = { family: "Light Mail", name: "Double Mail of Common Steel", surface: 18, cut: 16, chop: 9, pierce: 16, thrust: 10, impact: 5, flanged: 4, weightPerPosition: 1.30};
MML.APVList["Double Mail of Greater Steel"] = { family: "Light Mail", name: "Double Mail of Greater Steel", surface: 22, cut: 19, chop: 11, pierce: 19, thrust: 12, impact: 6, flanged: 5, weightPerPosition: 1.30};
MML.APVList["Double Mail of Mannish High Steel"] = { family: "Light Mail", name: "Double Mail of Mannish High Steel", surface: 25, cut: 22, chop: 13, pierce: 22, thrust: 15, impact: 7, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Single Mail of Common Steel"] = { family: "Light Mail", name: "Single Mail of Common Steel", surface: 17, cut: 15, chop: 8, pierce: 15, thrust: 10, impact: 4, flanged: 4, weightPerPosition: 1};
MML.APVList["Single Mail of Greater Steel"] = { family: "Light Mail", name: "Single Mail of Greater Steel", surface: 20, cut: 18, chop: 10, pierce: 18, thrust: 12, impact: 5, flanged: 5, weightPerPosition: 1};
MML.APVList["Single Mail of Mannish High Steel"] = { family: "Light Mail", name: "Single Mail of Mannish High Steel", surface: 24, cut: 21, chop: 12, pierce: 21, thrust: 13, impact: 6, flanged: 6, weightPerPosition: 1};
MML.APVList["Single Mail of Wrought Iron"] = { family: "Light Mail", name: "Single Mail of Wrought Iron", surface: 10, cut: 9, chop: 5, pierce: 9, thrust: 6, impact: 2, flanged: 2, weightPerPosition: 0.99};
MML.APVList["Plates of Common Steel, Medium"] = { family: "Plates", name: "Plates of Common Steel, Medium", surface: 22, cut: 18, chop: 12, pierce: 20, thrust: 16, impact: 10, flanged: 9, weightPerPosition: 1.40};
MML.APVList["Plates of Greater Steel, Medium"] = { family: "Plates", name: "Plates of Greater Steel, Medium", surface: 27, cut: 22, chop: 14, pierce: 24, thrust: 19, impact: 12, flanged: 11, weightPerPosition: 1.40};
MML.APVList["Plates of Mannish High Steel, Light"] = { family: "Plates", name: "Plates of Mannish High Steel, Light", surface: 30, cut: 24, chop: 12, pierce: 19, thrust: 16, impact: 11, flanged: 9, weightPerPosition: 1.05};
MML.APVList["Plates of Mannish High Steel, Medium"] = { family: "Plates", name: "Plates of Mannish High Steel, Medium", surface: 31, cut: 26, chop: 17, pierce: 28, thrust: 22, impact: 15, flanged: 12, weightPerPosition: 1.40};
MML.APVList["Plates of Mannish High Steel, Heavy"] = { family: "Plates", name: "Plates of Mannish High Steel, Heavy", surface: 33, cut: 27, chop: 22, pierce: 38, thrust: 30, impact: 18, flanged: 16, weightPerPosition: 1.75};
MML.APVList["Plates of Wrought Iron, Medium"] = { family: "Plates", name: "Plates of Wrought Iron, Medium", surface: 13, cut: 11, chop: 7, pierce: 12, thrust: 10, impact: 6, flanged: 5, weightPerPosition: 1.39};
MML.APVList["Plates of Wrought Iron, Heavy"] = { family: "Plates", name: "Plates of Wrought Iron, Heavy", surface: 14, cut: 15, chop: 9, pierce: 16, thrust: 13, impact: 8, flanged: 7, weightPerPosition: 1.73};
MML.APVList["Hardened Leather, Medium, Studs"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Studs", surface: 10, cut: 11, chop: 6, pierce: 9, thrust: 7, impact: 4, flanged: 4, weightPerPosition: 0.69};
MML.APVList["Hardened Leather, Medium, Rings"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Rings", surface: 13, cut: 12, chop: 8, pierce: 11, thrust: 9, impact: 4, flanged: 5, weightPerPosition: 0.75};
MML.APVList["Hardened Leather, Medium, Splints"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Splints", surface: 15, cut: 13, chop: 9, pierce: 12, thrust: 9, impact: 8, flanged: 6, weightPerPosition: 0.85};
MML.APVList["Hardened Leather, Medium, Bezaints"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Bezaints", surface: 20, cut: 14, chop: 10, pierce: 13, thrust: 10, impact: 7, flanged: 6, weightPerPosition: 0.94};
MML.APVList["Leather, Medium, Rings"] = { family: "Light Leather", name: "Leather, Medium, Rings", surface: 9, cut: 8, chop: 7, pierce: 6, thrust: 6, impact: 4, flanged: 5, weightPerPosition: 0.43};
MML.APVList["Leather, Medium, Studs"] = { family: "Light Leather", name: "Leather, Medium, Studs", surface: 6, cut: 7, chop: 5, pierce: 4, thrust: 4, impact: 4, flanged: 4, weightPerPosition: 0.37};
MML.APVList["Leather, Heavy, Bezaints"] = { family: "Heavy Leather", name: "Leather, Heavy, Bezaints", surface: 19, cut: 13, chop: 12, pierce: 11, thrust: 10, impact: 9, flanged: 9, weightPerPosition: 0.78};
MML.APVList["Leather, Heavy, Rings"] = { family: "Heavy Leather", name: "Leather, Heavy, Rings", surface: 12, cut: 11, chop: 10, pierce: 9, thrust: 9, impact: 6, flanged: 8, weightPerPosition: 0.59};
MML.APVList["Leather, Heavy, Splints"] = { family: "Heavy Leather", name: "Leather, Heavy, Splints", surface: 14, cut: 12, chop: 11, pierce: 10, thrust: 9, impact: 10, flanged: 9, weightPerPosition: 0.69};
MML.APVList["Leather, Heavy, Studs"] = { family: "Heavy Leather", name: "Leather, Heavy, Studs", surface: 9, cut: 10, chop: 8, pierce: 7, thrust: 7, impact: 6, flanged: 7, weightPerPosition: 0.53};
MML.APVList["Padded, Bezaints"] = { family: "Padded", name: "Padded, Bezaints", surface: 21, cut: 13, chop: 13, pierce: 13, thrust: 10, impact: 12, flanged: 11, weightPerPosition: 0.70};
MML.APVList["Dwarven Quilt"] = { family: "Cloth", name: "Dwarven Quilt", surface: 10, cut: 11, chop: 11, pierce: 12, thrust: 9, impact: 13, flanged: 11, weightPerPosition: 0.35};
MML.APVList["Dwarven Padded"] = { family: "Padded", name: "Dwarven Padded", surface: 14, cut: 14, chop: 14, pierce: 15, thrust: 12, impact: 16, flanged: 14, weightPerPosition: 0.52};
MML.APVList["Fine Mail, Dwarven Low Steel"] = { family: "Light Mail", name: "Fine Mail, Dwarven Low Steel", surface: 28, cut: 25, chop: 15, pierce: 27, thrust: 19, impact: 7, flanged: 7, weightPerPosition: 0.95};
MML.APVList["Brazed Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Brazed Mail of Gnomish Steel, Medium", surface: 30, cut: 27, chop: 16, pierce: 29, thrust: 20, impact: 8, flanged: 8, weightPerPosition: 1.29};
MML.APVList["Double Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Double Mail of Gnomish Steel, Medium", surface: 30, cut: 27, chop: 15, pierce: 26, thrust: 28, impact: 8, flanged: 7, weightPerPosition: 1.29};
MML.APVList["Laced Mail of Gnomish Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Gnomish Steel, Medium", surface: 34, cut: 28, chop: 15, pierce: 26, thrust: 18, impact: 9, flanged: 10, weightPerPosition: 1.29};
MML.APVList["Lames of Gnomish Steel, Medium"] = { family: "Lames", name: "Lames of Gnomish Steel, Medium", surface: 44, cut: 34, chop: 21, pierce: 36, thrust: 22, impact: 19, flanged: 16, weightPerPosition: 1.68};
MML.APVList["Plates of Gnomish Steel, Medium"] = { family: "Plates", name: "Plates of Gnomish Steel, Medium", surface: 38, cut: 31, chop: 20, pierce: 34, thrust: 27, impact: 18, flanged: 15, weightPerPosition: 1.39};
MML.APVList["Single Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Single Mail of Gnomish Steel, Medium", surface: 29, cut: 25, chop: 14, pierce: 26, thrust: 16, impact: 7, flanged: 7, weightPerPosition: 0.99};
MML.APVList["Elven Cloth, Light"] = { family: "Cloth", name: "Elven Cloth, Light", surface: 4, cut: 3, chop: 2, pierce: 3, thrust: 2, impact: 1, flanged: 1, weightPerPosition: 0.03};
MML.APVList["Elven Cloth, Medium"] = { family: "Cloth", name: "Elven Cloth, Medium", surface: 5, cut: 4, chop: 3, pierce: 4, thrust: 3, impact: 2, flanged: 2, weightPerPosition: 0.06};
MML.APVList["Elven Cloth, Heavy"] = { family: "Cloth", name: "Elven Cloth, Heavy", surface: 7, cut: 6, chop: 5, pierce: 6, thrust: 6, impact: 3, flanged: 3, weightPerPosition: 0.18};
MML.APVList["Elven Greater Steel Fine Coat of Scales"] = { family: "Lames", name: "Elven Greater Steel Fine Coat of Scales", surface: 35, cut: 23, chop: 16, pierce: 23, thrust: 16, impact: 13, flanged: 8, weightPerPosition: 1.53};
MML.APVList["Elven Padded"] = { family: "Padded", name: "Elven Padded", surface: 14, cut: 15, chop: 13, pierce: 15, thrust: 10, impact: 13, flanged: 11, weightPerPosition: 0.36};
MML.APVList["Elven Quilt"] = { family: "Cloth", name: "Elven Quilt", surface: 10, cut: 12, chop: 10, pierce: 12, thrust: 8, impact: 10, flanged: 9, weightPerPosition: 0.12};
MML.APVList["Elven Silk"] = { family: "Cloth", name: "Elven Silk", surface: 5, cut: 7, chop: 5, pierce: 7, thrust: 6, impact: 3, flanged: 4, weightPerPosition: 0.12};
MML.APVList["Fine Mail, Elven Travel Steel"] = { family: "Light Mail", name: "Fine Mail, Elven Travel Steel", surface: 28, cut: 25, chop: 15, pierce: 27, thrust: 19, impact: 7, flanged: 7, weightPerPosition: 0.95};
MML.APVList["Fine Mail, Mannish Greater Steel"] = { family: "Light Mail", name: "Fine Mail, Mannish Greater Steel", surface: 24, cut: 22, chop: 13, pierce: 23, thrust: 17, impact: 6, flanged: 6, weightPerPosition: 0.95};
MML.APVList["Lames of Elven Bronze"] = { family: "Lames", name: "Lames of Elven Bronze", surface: 28, cut: 22, chop: 14, pierce: 23, thrust: 14, impact: 13, flanged: 10, weightPerPosition: 0.95};

// Weapon Stats
MML.items["Hand Axe"] = {
    name: "Hand Axe",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 6,
            rank: 1}
       }
    };
MML.items["Battle Axe"] = {
    name: "Battle Axe",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Pick"] = {
    name: "Pick",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Two-Handed Axe"] = {
    name: "Two-Handed Axe",
    type: "weapon",
    weight: 6.5,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "4d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Bardiche"] = {
    name: "Bardiche",
    type: "weapon",
    weight: 7.5,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "5d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 2}
       }
    };
MML.items["Pole Axe"] = {
    name: "Pole Axe",
    type: "weapon",
    weight: 7,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "4d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 2}
       }
    };
MML.items["Club"] = {
    name: "Club",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "2d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Cudgel, Light"] = {
    name: "Cudgel, Light",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 6,
            rank: 1}
       }
    };
MML.items["Cudgel, Heavy"] = {
    name: "Cudgel, Heavy",
    type: "weapon",
    weight: 7,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "4d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Mace"] = {
    name: "Mace",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Flanged",
            primaryTask: 45,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Maul"] = {
    name: "Maul",
    type: "weapon",
    weight: 9,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "4d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Morningstar"] = {
    name: "Morningstar",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["War Hammer"] = {
    name: "War Hammer",
    type: "weapon",
    weight: 5.5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "Flanged",
            secondaryTask: 25,
            secondaryDamage: "2d8",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Ball & Chain, Footman's"] = {
    name: "Ball & Chain, Footman's",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Flexible",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 15,
            primaryDamage: "3d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Ball & Chain, Horseman's"] = {
    name: "Ball & Chain, Horseman's",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Flail, Footman's"] = {
    name: "Flail, Footman's",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Flexible",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Flail, Horseman's"] = {
    name: "Flail, Horseman's",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Mace & Chain"] = {
    name: "Mace & Chain",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Morningstar & Chain"] = {
    name: "Morningstar & Chain",
    type: "weapon",
    weight: 4,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 25,
            primaryDamage: "3d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Boot Knife"] = {
    name: "Boot Knife",
    type: "weapon",
    weight: 0.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "1d8",
            secondaryType: "Cut",
            secondaryTask: 15,
            secondaryDamage: "1d6",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Dagger"] = {
    name: "Dagger",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "2d6",
            secondaryType: "Cut",
            secondaryTask: 15,
            secondaryDamage: "1d8",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Knife"] = {
    name: "Knife",
    type: "weapon",
    weight: 1.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d6",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "2d6",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Dirk"] = {
    name: "Dirk",
    type: "weapon",
    weight: 1.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d8",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "2d6",
            defense: 15,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Fauchard"] = {
    name: "Fauchard",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Bill"] = {
    name: "Bill",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Glaive"] = {
    name: "Glaive",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d20",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Halberd"] = {
    name: "Halberd",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d20",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Pole Hammer"] = {
    name: "Pole Hammer",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Hammers",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "3d10",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["War Spear"] = {
    name: "War Spear",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "2d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 2}
       }
    };
MML.items["Boar Spear"] = {
    name: "Boar Spear",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 25,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 2,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Military Fork"] = {
    name: "Military Fork",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 2,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Spetum"] = {
    name: "Spetum",
    type: "weapon",
    weight: 4,
    grips: {
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Quarter Staff"] = {
    name: "Quarter Staff",
    type: "weapon",
    weight: 2,
    grips: {
        "Two Hands":{
            family: "Staves",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "3d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 35,
            initiative: 9,
            rank: 2}
       }
    };
MML.items["Scimitar"] = {
    name: "Scimitar",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 35,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "2d6",
            defense: 35,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Short Sword"] = {
    name: "Short Sword",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d8",
            secondaryType: "Cut",
            secondaryTask: 35,
            secondaryDamage: "3d6",
            defense: 35,
            initiative: 1,
            rank: 1}
       }
    };
MML.items["Long Sword"] = {
    name: "Long Sword",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "Thrust",
            secondaryTask: 35,
            secondaryDamage: "2d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Falchion"] = {
    name: "Falchion",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "4d8",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "3d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Bastard Sword"] = {
    name: "Bastard Sword",
    type: "weapon",
    weight: 6,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "5d6",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "3d6",
            defense: 15,
            initiative: 4,
            rank: 1},
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 35,
            primaryDamage: "4d10",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "4d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Broadsword"] = {
    name: "Broadsword",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d12",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "1d12",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Two-Handed Broadsword"] = {
    name: "Two-Handed Broadsword",
    type: "weapon",
    weight: 7.5,
    grips: {
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "4d12",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "1d20",
            defense: 25,
            initiative: 3,
            rank: 1}
       }
    };
MML.items["Great Sword"] = {
    name: "Great Sword",
    type: "weapon",
    weight: 13,
    grips: {
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 15,
            primaryDamage: "6d10",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "3d10",
            defense: 35,
            initiative: 2,
            rank: 2}
       }
    };
MML.items["Whip"] = {
    name: "Whip",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Whip",
            hands: 1,
            primaryType: "Surface",
            primaryTask: 35,
            primaryDamage: "2d4",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 8,
            rank: 3}
       }
    };
MML.items["Cleaver"] = {
    name: "Cleaver",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 8,
            rank: 1}
       }
    };
MML.items["Hatchet"] = {
    name: "Hatchet",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "1d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Hoe"] = {
    name: "Hoe",
    type: "weapon",
    weight: 4,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 35,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Wood Axe"] = {
    name: "Wood Axe",
    type: "weapon",
    weight: 3,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Hammer, Medium"] = {
    name: "Hammer, Medium",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Shovel"] = {
    name: "Shovel",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "1d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Skinning Knife"] = {
    name: "Skinning Knife",
    type: "weapon",
    weight: 0.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "1d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Butcher's Knife"] = {
    name: "Butcher's Knife",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "2d6",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Pitch Fork"] = {
    name: "Pitch Fork",
    type: "weapon",
    weight: 3,
    grips: {
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 1}
       }
    };
MML.items["Short Bow"] = {
    name: "Short Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 45,
            initiative: 8,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 74, damage: "3d6"},
                effective: { task: 45, range: 149, damage: "2d8"},
                long: { task: 25, range: 299, damage: "2d6"},
                extreme: { task: 0, range: 300, damage: "1d6"}
            }
        }
    }};
MML.items["Medium Bow"] = {
    name: "Medium Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 60,
            initiative: 7,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 89, damage: "3d8"},
                effective: { task: 45, range: 179, damage: "2d10"},
                long: { task: 25, range: 449, damage: "2d8"},
                extreme: { task: 0, range: 450, damage: "1d8"}
            }
        }
    }};
MML.items["Long Bow"] = {
    name: "Long Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 80,
            initiative: 6,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 149, damage: "3d10"},
                effective: { task: 45, range: 269, damage: "3d8"},
                long: { task: 25, range: 599, damage: "3d6"},
                extreme: { task: 0, range: 600, damage: "1d10"}
            }
        }
    }};
MML.items["Heavy Long Bow"] = {
    name: "Heavy Long Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 100,
            initiative: 4,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 179, damage: "3d12"},
                effective: { task: 45, range: 299, damage: "3d10"},
                long: { task: 25, range: 674, damage: "3d8"},
                extreme: { task: 0, range: 675, damage: "1d10"}
            }
        }
    }};
MML.items["Short Composite Bow"] = {
    name: "Short Composite Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 60,
            initiative: 7,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 89, damage: "3d8"},
                effective: { task: 45, range: 179, damage: "2d10"},
                long: { task: 25, range: 449, damage: "2d8"},
                extreme: { task: 0, range: 450, damage: "1d8"}
            }
        }
    }};
MML.items["Medium Composite Bow"] = {
    name: "Medium Composite Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 80,
            initiative: 6,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 149, damage: "3d10"},
                effective: { task: 45, range: 269, damage: "3d8"},
                long: { task: 25, range: 599, damage: "3d6"},
                extreme: { task: 0, range: 600, damage: "1d10"}
            }
        }
    }};
MML.items["Light Cross Bow"] = {
    name: "Light Cross Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWM",
            hands: 2,
            pull: 80,
            initiative: 10,
            reload: 4,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 179, damage: "3d10"},
                effective: { task: 45, range: 299, damage: "3d8"},
                long: { task: 25, range: 674, damage: "3d6"},
                extreme: { task: 0, range: 675, damage: "1d10"}
            }
        }
    } };
MML.items["Medium Cross Bow"] = {
    name: "Medium Cross Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWM",
            hands: 2,
            pull: 100,
            initiative: 10,
            reload: 6,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 224, damage: "3d12"},
                effective: { task: 45, range: 374, damage: "3d10"},
                long: { task: 25, range: 899, damage: "3d8"},
                extreme: { task: 0, range: 900, damage: "1d10"}
            }
        }
    }};
MML.items["Heavy Cross Bow"] = {
    name: "Heavy Cross Bow",
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWM",
            hands: 2,
            pull: 120,
            initiative: 8,
            reload: 12,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 269, damage: "4d10"},
                effective: { task: 45, range: 449, damage: "3d12"},
                long: { task: 25, range: 1199, damage: "3d10"},
                extreme: { task: 0, range: 1200, damage: "1d12"}
            }
        }
    }};
MML.items["Battle Axe, Thrown"] = {
    name: "Battle Axe, Thrown",
    type: "weapon",
    weight: 0,
    grips: {
        "One Hand": {
            family: "TWH",
            hands: 1,
            initiative: 3,
            accuracyMod: -8,
            primaryType: "Chop",
            range: {
                pointBlank: { task: 35, loadDivider: 8, damage: "2d12"},
                effective: { task: 45, loadDivider: 4, damage: "2d10"},
                long: { task: 25, loadDivider: 3, damage: "2d6"},
                extreme: { task: 0, loadDivider: 2, damage: "1d6"}
            }
        }
    }};

//Spell Components
MML.items["Dart"] = {name: "Dart", type: "spellComponent", spell: "Dart"};
MML.items["Drop of Mercury"] = {name: "Drop of Mercury", type: "spellComponent", spell: "Quick Action"};

//Miscellaneous Items

MML.items["No Shield"] = {name: "No Shield", type: "shield", weight: 0, attackMod: 0, defenseMod: 0};
MML.items["Round Target Shield"] = {name: "Round Target Shield", type: "shield", weight: 1.6, attackMod: 0, defenseMod: 10};
MML.items["Small Round Shield"] = {name: "Small Round Shield", type: "shield", weight: 4.3, attackMod: 0, defenseMod: 20};
MML.items["Medium Round Shield"] = {name: "Medium Round Shield", type: "shield", weight: 11.3, attackMod: -10, defenseMod: 35};
MML.items["Large Round Shield"] = {name: "Large Round Shield", type: "shield", weight: 16.4, attackMod: -16, defenseMod: 43};
MML.items["Small Rectangular Shield"] = {name: "Small Rectangular Shield", type: "shield", weight: 4, attackMod: 0, defenseMod: 19};
MML.items["Medium Rectangular Shield"] = {name: "Medium Rectangular Shield", type: "shield", weight: 11.1, attackMod: -10, defenseMod: 35};
MML.items["Large Rectangular Shield"] = {name: "Large Rectangular Shield", type: "shield", weight: 16.6, attackMod: -15, defenseMod: 39};
MML.items["Heater Shield"] = {name: "Heater Shield", type: "shield", weight: 10.6, attackMod: -10, defenseMod: 33};

MML.weaponRanks = [
    {low: 0, high: 2},
    {low: 2, high: 5},
    {low: 5, high: 8},
    {low: 8, high: 12},
    {low: 12, high: 15},
    {low: 15, high: 18},
    {low: 18, high: 21},
    {low: 21, high: 24},
];

MML.HPTables = {};
MML.HPTables["Dwarf"] = [];
MML.HPTables["Dwarf"][9] = "-";
MML.HPTables["Dwarf"][10] = "-";
MML.HPTables["Dwarf"][11] = 7;
MML.HPTables["Dwarf"][12] = 7;
MML.HPTables["Dwarf"][13] = 8;
MML.HPTables["Dwarf"][14] = 8;
MML.HPTables["Dwarf"][15] = 9;
MML.HPTables["Dwarf"][16] = 10;
MML.HPTables["Dwarf"][17] = 10;
MML.HPTables["Dwarf"][18] = 11;
MML.HPTables["Dwarf"][19] = 11;
MML.HPTables["Dwarf"][20] = 12;
MML.HPTables["Dwarf"][21] = 13;
MML.HPTables["Dwarf"][22] = 13;
MML.HPTables["Dwarf"][23] = 14;
MML.HPTables["Dwarf"][24] = 14;
MML.HPTables["Dwarf"][25] = 15;
MML.HPTables["Dwarf"][26] = 15;
MML.HPTables["Dwarf"][27] = 16;
MML.HPTables["Dwarf"][28] = 17;
MML.HPTables["Dwarf"][29] = 17;
MML.HPTables["Dwarf"][30] = 18;
MML.HPTables["Dwarf"][31] = 19;
MML.HPTables["Dwarf"][32] = 19;
MML.HPTables["Dwarf"][33] = 20;
MML.HPTables["Dwarf"][34] = 20;
MML.HPTables["Dwarf"][35] = 21;
MML.HPTables["Dwarf"][36] = 22;
MML.HPTables["Dwarf"][37] = 22;
MML.HPTables["Dwarf"][38] = 23;
MML.HPTables["Dwarf"][39] = 23;
MML.HPTables["Dwarf"][40] = 24;
MML.HPTables["Dwarf"][41] = 25;
MML.HPTables["Dwarf"][42] = 25;
MML.HPTables["Dwarf"][43] = 26;
MML.HPTables["Dwarf"][44] = 26;
MML.HPTables["Dwarf"][45] = 27;
MML.HPTables["Dwarf"][46] = 28;
MML.HPTables["Dwarf"][47] = 28;
MML.HPTables["Dwarf"][48] = 29;
MML.HPTables["Dwarf"][49] = 29;
MML.HPTables["Dwarf"][50] = 30;
MML.HPTables["Dwarf"][51] = 31;
MML.HPTables["Dwarf"][52] = 31;
MML.HPTables["Dwarf"][53] = 32;
MML.HPTables["Dwarf"][54] = 32;
MML.HPTables["Dwarf"][55] = 33;
MML.HPTables["Dwarf"][56] = 34;
MML.HPTables["Dwarf"][57] = 34;
MML.HPTables["Dwarf"][58] = 35;
MML.HPTables["Dwarf"][59] = 35;
MML.HPTables["Dwarf"][60] = 36;
MML.HPTables["Dwarf"][61] = 37;
MML.HPTables["Dwarf"][62] = 37;
MML.HPTables["Dwarf"][63] = 38;
MML.HPTables["Dwarf"][64] = 38;
MML.HPTables["Dwarf"][65] = 39;
MML.HPTables["Dwarf"][66] = 40;
MML.HPTables["Dwarf"][67] = 40;
MML.HPTables["Dwarf"][68] = 41;
MML.HPTables["Dwarf"][69] = 42;
MML.HPTables["Dwarf"][70] = 43;
MML.HPTables["Dwarf"][71] = 43;
MML.HPTables["Dwarf"][72] = 44;
MML.HPTables["Dwarf"][73] = 44;
MML.HPTables["Dwarf"][74] = 45;
MML.HPTables["Dwarf"][75] = 46;
MML.HPTables["Dwarf"][76] = 46;
MML.HPTables["Dwarf"][78] = 47;
MML.HPTables["Dwarf"][79] = 47;
MML.HPTables["Dwarf"][80] = 48;

MML.HPTables["Gnome"] = [];
MML.HPTables["Gnome"][9] = "-";
MML.HPTables["Gnome"][10] = "-";
MML.HPTables["Gnome"][11] = "-";
MML.HPTables["Gnome"][12] = 7;
MML.HPTables["Gnome"][13] = 7;
MML.HPTables["Gnome"][14] = 8;
MML.HPTables["Gnome"][15] = 9;
MML.HPTables["Gnome"][16] = 9;
MML.HPTables["Gnome"][17] = 10;
MML.HPTables["Gnome"][18] = 10;
MML.HPTables["Gnome"][19] = 11;
MML.HPTables["Gnome"][20] = 12;
MML.HPTables["Gnome"][21] = 12;
MML.HPTables["Gnome"][22] = 13;
MML.HPTables["Gnome"][23] = 13;
MML.HPTables["Gnome"][24] = 14;
MML.HPTables["Gnome"][25] = 14;
MML.HPTables["Gnome"][26] = 14;
MML.HPTables["Gnome"][27] = 16;
MML.HPTables["Gnome"][28] = 16;
MML.HPTables["Gnome"][29] = 17;
MML.HPTables["Gnome"][30] = 17;
MML.HPTables["Gnome"][31] = 18;
MML.HPTables["Gnome"][32] = 18;
MML.HPTables["Gnome"][33] = 19;
MML.HPTables["Gnome"][34] = 20;
MML.HPTables["Gnome"][35] = 20;
MML.HPTables["Gnome"][36] = 21;
MML.HPTables["Gnome"][37] = 21;
MML.HPTables["Gnome"][38] = 22;
MML.HPTables["Gnome"][39] = 22;
MML.HPTables["Gnome"][40] = 23;
MML.HPTables["Gnome"][41] = 24;
MML.HPTables["Gnome"][42] = 24;
MML.HPTables["Gnome"][43] = 25;
MML.HPTables["Gnome"][44] = 25;
MML.HPTables["Gnome"][45] = 26;
MML.HPTables["Gnome"][46] = 26;
MML.HPTables["Gnome"][47] = 27;
MML.HPTables["Gnome"][48] = 28;
MML.HPTables["Gnome"][49] = 28;
MML.HPTables["Gnome"][50] = 29;
MML.HPTables["Gnome"][51] = 29;
MML.HPTables["Gnome"][52] = 30;
MML.HPTables["Gnome"][53] = 30;
MML.HPTables["Gnome"][54] = 31;
MML.HPTables["Gnome"][55] = 32;
MML.HPTables["Gnome"][56] = 32;
MML.HPTables["Gnome"][57] = 33;
MML.HPTables["Gnome"][58] = 33;
MML.HPTables["Gnome"][59] = 34;
MML.HPTables["Gnome"][60] = 35;
MML.HPTables["Gnome"][61] = 35;
MML.HPTables["Gnome"][62] = 36;
MML.HPTables["Gnome"][63] = 36;
MML.HPTables["Gnome"][64] = 37;
MML.HPTables["Gnome"][65] = 37;
MML.HPTables["Gnome"][66] = 38;
MML.HPTables["Gnome"][67] = 39;
MML.HPTables["Gnome"][68] = 39;
MML.HPTables["Gnome"][69] = 40;
MML.HPTables["Gnome"][70] = 40;
MML.HPTables["Gnome"][71] = 41;
MML.HPTables["Gnome"][72] = 41;
MML.HPTables["Gnome"][73] = "-";
MML.HPTables["Gnome"][74] = "-";
MML.HPTables["Gnome"][75] = "-";
MML.HPTables["Gnome"][76] = "-";
MML.HPTables["Gnome"][78] = "-";
MML.HPTables["Gnome"][79] = "-";
MML.HPTables["Gnome"][80] = "-";

MML.HPTables["Gray Elf"] = [];
MML.HPTables["Gray Elf"][9] = "-";
MML.HPTables["Gray Elf"][10] = "-";
MML.HPTables["Gray Elf"][11] = "-";
MML.HPTables["Gray Elf"][12] = 7;
MML.HPTables["Gray Elf"][13] = 7;
MML.HPTables["Gray Elf"][14] = 8;
MML.HPTables["Gray Elf"][15] = 8;
MML.HPTables["Gray Elf"][16] = 9;
MML.HPTables["Gray Elf"][17] = 9;
MML.HPTables["Gray Elf"][18] = 10;
MML.HPTables["Gray Elf"][19] = 10;
MML.HPTables["Gray Elf"][20] = 11;
MML.HPTables["Gray Elf"][21] = 12;
MML.HPTables["Gray Elf"][22] = 12;
MML.HPTables["Gray Elf"][23] = 13;
MML.HPTables["Gray Elf"][24] = 13;
MML.HPTables["Gray Elf"][25] = 14;
MML.HPTables["Gray Elf"][26] = 14;
MML.HPTables["Gray Elf"][27] = 15;
MML.HPTables["Gray Elf"][28] = 15;
MML.HPTables["Gray Elf"][29] = 16;
MML.HPTables["Gray Elf"][30] = 17;
MML.HPTables["Gray Elf"][31] = 17;
MML.HPTables["Gray Elf"][32] = 18;
MML.HPTables["Gray Elf"][33] = 18;
MML.HPTables["Gray Elf"][34] = 19;
MML.HPTables["Gray Elf"][35] = 19;
MML.HPTables["Gray Elf"][36] = 20;
MML.HPTables["Gray Elf"][37] = 20;
MML.HPTables["Gray Elf"][38] = 21;
MML.HPTables["Gray Elf"][39] = 21;
MML.HPTables["Gray Elf"][40] = 22;
MML.HPTables["Gray Elf"][41] = 23;
MML.HPTables["Gray Elf"][42] = 23;
MML.HPTables["Gray Elf"][43] = 24;
MML.HPTables["Gray Elf"][44] = 24;
MML.HPTables["Gray Elf"][45] = 25;
MML.HPTables["Gray Elf"][46] = 25;
MML.HPTables["Gray Elf"][47] = 26;
MML.HPTables["Gray Elf"][48] = 26;
MML.HPTables["Gray Elf"][49] = 27;
MML.HPTables["Gray Elf"][50] = 28;
MML.HPTables["Gray Elf"][51] = 28;
MML.HPTables["Gray Elf"][52] = 29;
MML.HPTables["Gray Elf"][53] = 29;
MML.HPTables["Gray Elf"][54] = 30;
MML.HPTables["Gray Elf"][55] = 30;
MML.HPTables["Gray Elf"][56] = 31;
MML.HPTables["Gray Elf"][57] = 31;
MML.HPTables["Gray Elf"][58] = 32;
MML.HPTables["Gray Elf"][59] = 32;
MML.HPTables["Gray Elf"][60] = 33;
MML.HPTables["Gray Elf"][61] = 34;
MML.HPTables["Gray Elf"][62] = 34;
MML.HPTables["Gray Elf"][63] = 35;
MML.HPTables["Gray Elf"][64] = 35;
MML.HPTables["Gray Elf"][65] = 36;
MML.HPTables["Gray Elf"][66] = 36;
MML.HPTables["Gray Elf"][67] = 37;
MML.HPTables["Gray Elf"][68] = 37;
MML.HPTables["Gray Elf"][69] = 38;
MML.HPTables["Gray Elf"][70] = 39;
MML.HPTables["Gray Elf"][71] = 39;
MML.HPTables["Gray Elf"][72] = 40;
MML.HPTables["Gray Elf"][73] = 40;
MML.HPTables["Gray Elf"][74] = "-";
MML.HPTables["Gray Elf"][75] = "-";
MML.HPTables["Gray Elf"][76] = "-";
MML.HPTables["Gray Elf"][78] = "-";
MML.HPTables["Gray Elf"][79] = "-";
MML.HPTables["Gray Elf"][80] = "-";

MML.HPTables["Hobbit"] = [];
MML.HPTables["Hobbit"][9] = 5;
MML.HPTables["Hobbit"][10] = 6;
MML.HPTables["Hobbit"][11] = 6;
MML.HPTables["Hobbit"][12] = 7;
MML.HPTables["Hobbit"][13] = 7;
MML.HPTables["Hobbit"][14] = 8;
MML.HPTables["Hobbit"][15] = 8;
MML.HPTables["Hobbit"][16] = 9;
MML.HPTables["Hobbit"][17] = 9;
MML.HPTables["Hobbit"][18] = 10;
MML.HPTables["Hobbit"][19] = 10;
MML.HPTables["Hobbit"][20] = 11;
MML.HPTables["Hobbit"][21] = 12;
MML.HPTables["Hobbit"][22] = 12;
MML.HPTables["Hobbit"][23] = 13;
MML.HPTables["Hobbit"][24] = 13;
MML.HPTables["Hobbit"][25] = 14;
MML.HPTables["Hobbit"][26] = 14;
MML.HPTables["Hobbit"][27] = 15;
MML.HPTables["Hobbit"][28] = 15;
MML.HPTables["Hobbit"][29] = 16;
MML.HPTables["Hobbit"][30] = 17;
MML.HPTables["Hobbit"][31] = 17;
MML.HPTables["Hobbit"][32] = 18;
MML.HPTables["Hobbit"][33] = 18;
MML.HPTables["Hobbit"][34] = 19;
MML.HPTables["Hobbit"][35] = 19;
MML.HPTables["Hobbit"][36] = 20;
MML.HPTables["Hobbit"][37] = 20;
MML.HPTables["Hobbit"][38] = 21;
MML.HPTables["Hobbit"][39] = 21;
MML.HPTables["Hobbit"][40] = 22;
MML.HPTables["Hobbit"][41] = 23;
MML.HPTables["Hobbit"][42] = 23;
MML.HPTables["Hobbit"][43] = 24;
MML.HPTables["Hobbit"][44] = 24;
MML.HPTables["Hobbit"][45] = 25;
MML.HPTables["Hobbit"][46] = 25;
MML.HPTables["Hobbit"][47] = 26;
MML.HPTables["Hobbit"][48] = 26;
MML.HPTables["Hobbit"][49] = 27;
MML.HPTables["Hobbit"][50] = 28;
MML.HPTables["Hobbit"][51] = 28;
MML.HPTables["Hobbit"][52] = 29;
MML.HPTables["Hobbit"][53] = 29;
MML.HPTables["Hobbit"][54] = 30;
MML.HPTables["Hobbit"][55] = 30;
MML.HPTables["Hobbit"][56] = 31;
MML.HPTables["Hobbit"][57] = 31;
MML.HPTables["Hobbit"][58] = "-";
MML.HPTables["Hobbit"][59] = "-";
MML.HPTables["Hobbit"][60] = "-";
MML.HPTables["Hobbit"][61] = "-";
MML.HPTables["Hobbit"][62] = "-";
MML.HPTables["Hobbit"][63] = "-";
MML.HPTables["Hobbit"][64] = "-";
MML.HPTables["Hobbit"][65] = "-";
MML.HPTables["Hobbit"][66] = "-";
MML.HPTables["Hobbit"][67] = "-";
MML.HPTables["Hobbit"][68] = "-";
MML.HPTables["Hobbit"][69] = "-";
MML.HPTables["Hobbit"][70] = "-";
MML.HPTables["Hobbit"][71] = "-";
MML.HPTables["Hobbit"][72] = "-";
MML.HPTables["Hobbit"][73] = "-";
MML.HPTables["Hobbit"][74] = "-";
MML.HPTables["Hobbit"][75] = "-";
MML.HPTables["Hobbit"][76] = "-";
MML.HPTables["Hobbit"][78] = "-";
MML.HPTables["Hobbit"][79] = "-";
MML.HPTables["Hobbit"][80] = "-";

MML.HPTables["Human"] = [];
MML.HPTables["Human"][9] = "-";
MML.HPTables["Human"][10] = "-";
MML.HPTables["Human"][11] = "-";
MML.HPTables["Human"][12] = 6;
MML.HPTables["Human"][13] = 7;
MML.HPTables["Human"][14] = 7;
MML.HPTables["Human"][15] = 8;
MML.HPTables["Human"][16] = 8;
MML.HPTables["Human"][17] = 9;
MML.HPTables["Human"][18] = 9;
MML.HPTables["Human"][19] = 10;
MML.HPTables["Human"][20] = 10;
MML.HPTables["Human"][21] = 11;
MML.HPTables["Human"][22] = 11;
MML.HPTables["Human"][23] = 12;
MML.HPTables["Human"][24] = 12;
MML.HPTables["Human"][25] = 13;
MML.HPTables["Human"][26] = 13;
MML.HPTables["Human"][27] = 14;
MML.HPTables["Human"][28] = 14;
MML.HPTables["Human"][29] = 15;
MML.HPTables["Human"][30] = 15;
MML.HPTables["Human"][31] = 16;
MML.HPTables["Human"][32] = 16;
MML.HPTables["Human"][33] = 17;
MML.HPTables["Human"][34] = 17;
MML.HPTables["Human"][35] = 18;
MML.HPTables["Human"][36] = 18;
MML.HPTables["Human"][37] = 19;
MML.HPTables["Human"][38] = 19;
MML.HPTables["Human"][39] = 20;
MML.HPTables["Human"][40] = 20;
MML.HPTables["Human"][41] = 21;
MML.HPTables["Human"][42] = 21;
MML.HPTables["Human"][43] = 22;
MML.HPTables["Human"][44] = 22;
MML.HPTables["Human"][45] = 23;
MML.HPTables["Human"][46] = 23;
MML.HPTables["Human"][47] = 24;
MML.HPTables["Human"][48] = 24;
MML.HPTables["Human"][49] = 25;
MML.HPTables["Human"][50] = 25;
MML.HPTables["Human"][51] = 26;
MML.HPTables["Human"][52] = 26;
MML.HPTables["Human"][53] = 27;
MML.HPTables["Human"][54] = 27;
MML.HPTables["Human"][55] = 28;
MML.HPTables["Human"][56] = 28;
MML.HPTables["Human"][57] = 29;
MML.HPTables["Human"][58] = 29;
MML.HPTables["Human"][59] = 30;
MML.HPTables["Human"][60] = 30;
MML.HPTables["Human"][61] = 31;
MML.HPTables["Human"][62] = 31;
MML.HPTables["Human"][63] = 32;
MML.HPTables["Human"][64] = 32;
MML.HPTables["Human"][65] = 33;
MML.HPTables["Human"][66] = 33;
MML.HPTables["Human"][67] = 34;
MML.HPTables["Human"][68] = 34;
MML.HPTables["Human"][69] = 35;
MML.HPTables["Human"][70] = 35;
MML.HPTables["Human"][71] = "-";
MML.HPTables["Human"][72] = "-";
MML.HPTables["Human"][73] = "-";
MML.HPTables["Human"][74] = "-";
MML.HPTables["Human"][75] = "-";
MML.HPTables["Human"][76] = "-";
MML.HPTables["Human"][78] = "-";
MML.HPTables["Human"][79] = "-";
MML.HPTables["Human"][80] = "-";

MML.HPTables["Wood Elf"] = [];
MML.HPTables["Wood Elf"][9] = "-";
MML.HPTables["Wood Elf"][10] = "-";
MML.HPTables["Wood Elf"][11] = "-";
MML.HPTables["Wood Elf"][12] = "-";
MML.HPTables["Wood Elf"][13] = 7;
MML.HPTables["Wood Elf"][14] = 7;
MML.HPTables["Wood Elf"][15] = 8;
MML.HPTables["Wood Elf"][16] = 8;
MML.HPTables["Wood Elf"][17] = 9;
MML.HPTables["Wood Elf"][18] = 9;
MML.HPTables["Wood Elf"][19] = 10;
MML.HPTables["Wood Elf"][20] = 11;
MML.HPTables["Wood Elf"][21] = 11;
MML.HPTables["Wood Elf"][22] = 12;
MML.HPTables["Wood Elf"][23] = 12;
MML.HPTables["Wood Elf"][24] = 13;
MML.HPTables["Wood Elf"][25] = 13;
MML.HPTables["Wood Elf"][26] = 13;
MML.HPTables["Wood Elf"][27] = 14;
MML.HPTables["Wood Elf"][28] = 15;
MML.HPTables["Wood Elf"][29] = 15;
MML.HPTables["Wood Elf"][30] = 16;
MML.HPTables["Wood Elf"][31] = 16;
MML.HPTables["Wood Elf"][32] = 17;
MML.HPTables["Wood Elf"][33] = 17;
MML.HPTables["Wood Elf"][34] = 18;
MML.HPTables["Wood Elf"][35] = 18;
MML.HPTables["Wood Elf"][36] = 19;
MML.HPTables["Wood Elf"][37] = 19;
MML.HPTables["Wood Elf"][38] = 20;
MML.HPTables["Wood Elf"][39] = 20;
MML.HPTables["Wood Elf"][40] = 21;
MML.HPTables["Wood Elf"][41] = 22;
MML.HPTables["Wood Elf"][42] = 22;
MML.HPTables["Wood Elf"][43] = 23;
MML.HPTables["Wood Elf"][44] = 23;
MML.HPTables["Wood Elf"][45] = 24;
MML.HPTables["Wood Elf"][46] = 24;
MML.HPTables["Wood Elf"][47] = 25;
MML.HPTables["Wood Elf"][48] = 25;
MML.HPTables["Wood Elf"][49] = 26;
MML.HPTables["Wood Elf"][50] = 26;
MML.HPTables["Wood Elf"][51] = 27;
MML.HPTables["Wood Elf"][52] = 27;
MML.HPTables["Wood Elf"][53] = 28;
MML.HPTables["Wood Elf"][54] = 28;
MML.HPTables["Wood Elf"][55] = 29;
MML.HPTables["Wood Elf"][56] = 29;
MML.HPTables["Wood Elf"][57] = 30;
MML.HPTables["Wood Elf"][58] = 30;
MML.HPTables["Wood Elf"][59] = 31;
MML.HPTables["Wood Elf"][60] = 32;
MML.HPTables["Wood Elf"][61] = 32;
MML.HPTables["Wood Elf"][62] = 33;
MML.HPTables["Wood Elf"][63] = 33;
MML.HPTables["Wood Elf"][64] = 34;
MML.HPTables["Wood Elf"][65] = 34;
MML.HPTables["Wood Elf"][66] = 35;
MML.HPTables["Wood Elf"][67] = 35;
MML.HPTables["Wood Elf"][68] = 36;
MML.HPTables["Wood Elf"][69] = 36;
MML.HPTables["Wood Elf"][70] = "-";
MML.HPTables["Wood Elf"][71] = "-";
MML.HPTables["Wood Elf"][72] = "-";
MML.HPTables["Wood Elf"][73] = "-";
MML.HPTables["Wood Elf"][74] = "-";
MML.HPTables["Wood Elf"][75] = "-";
MML.HPTables["Wood Elf"][76] = "-";
MML.HPTables["Wood Elf"][78] = "-";
MML.HPTables["Wood Elf"][79] = "-";
MML.HPTables["Wood Elf"][80] = "-";

MML.statureTables = {};
MML.statureTables["Human"] = {};
MML.statureTables["Human"]["Male"] = [];
MML.statureTables["Human"]["Male"][1] = { height: "4'11", weight: 120, stature: 17};
MML.statureTables["Human"]["Male"][2] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Male"][3] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Human"]["Male"][4] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Male"][5] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Human"]["Male"][6] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Male"][7] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Human"]["Male"][8] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Human"]["Male"][9] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Human"]["Male"][10] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Human"]["Male"][11] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Human"]["Male"][12] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Human"]["Male"][13] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Human"]["Male"][14] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Human"]["Male"][15] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Human"]["Male"][16] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Human"]["Male"][17] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Human"]["Male"][18] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Human"]["Male"][19] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Human"]["Male"][20] = { height: "6'6", weight: 220, stature: 30 };

MML.statureTables["Human"]["Female"] = [];
MML.statureTables["Human"]["Female"][1] = { height: "4'8", weight: 113, stature: 17 };
MML.statureTables["Human"]["Female"][2] = { height: "4'9", weight: 115, stature: 18 };
MML.statureTables["Human"]["Female"][3] = { height: "4'10", weight: 118, stature: 18 };
MML.statureTables["Human"]["Female"][4] = { height: "4'11", weight: 120, stature: 18 };
MML.statureTables["Human"]["Female"][5] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Female"][6] = { height: "5'1", weight: 125, stature: 19 };
MML.statureTables["Human"]["Female"][7] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Female"][8] = { height: "5'3", weight: 133, stature: 19 };
MML.statureTables["Human"]["Female"][9] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Female"][10] = { height: "5'5", weight: 138, stature: 21 };
MML.statureTables["Human"]["Female"][11] = { height: "5'6", weight: 140, stature: 21 };
MML.statureTables["Human"]["Female"][12] = { height: "5'7", weight: 143, stature: 21 };
MML.statureTables["Human"]["Female"][13] = { height: "5'8", weight: 145, stature: 22 };
MML.statureTables["Human"]["Female"][14] = { height: "5'9", weight: 148, stature: 22 };
MML.statureTables["Human"]["Female"][15] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Human"]["Female"][16] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Human"]["Female"][17] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Human"]["Female"][18] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Human"]["Female"][19] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Human"]["Female"][20] = { height: "6'3", weight: 175, stature: 25 };

MML.statureTables["Dwarf"] = {};
MML.statureTables["Dwarf"]["Male"] = [];
MML.statureTables["Dwarf"]["Male"][1] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][2] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][3] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][4] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][5] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][6] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][7] = { height: "4'1", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Male"][8] = { height: "4'2", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Male"][9] = { height: "4'3", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Male"][10] = { height: "4'4", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Male"][11] = { height: "4'5", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Male"][12] = { height: "4'6", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Male"][13] = { height: "4'7", weight: 230, stature: 29 };
MML.statureTables["Dwarf"]["Male"][14] = { height: "4'8", weight: 240, stature: 30 };
MML.statureTables["Dwarf"]["Male"][15] = { height: "4'9", weight: 250, stature: 31 };
MML.statureTables["Dwarf"]["Male"][16] = { height: "4'10", weight: 260, stature: 32 };
MML.statureTables["Dwarf"]["Male"][17] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][18] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][19] = { height: "5'0", weight: 280, stature: 34 };
MML.statureTables["Dwarf"]["Male"][20] = { height: "5'0", weight: 280, stature: 34 };

MML.statureTables["Dwarf"]["Female"] = [];
MML.statureTables["Dwarf"]["Female"][1] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][2] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][3] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][4] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][5] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][6] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][7] = { height: "3'11", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Female"][8] = { height: "4'0", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Female"][9] = { height: "4'1", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Female"][10] = { height: "4'2", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Female"][11] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][12] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][13] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][14] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][15] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][16] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][17] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][18] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][19] = { height: "4'7", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Female"][20] = { height: "4'7", weight: 220, stature: 27 };

MML.statureTables["Gnome"] = {};
MML.statureTables["Gnome"]["Male"] = [];
MML.statureTables["Gnome"]["Male"][1] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][2] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][3] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][4] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][5] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][6] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][7] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][8] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][9] = { height: "4'3", weight: 170, stature: 22 };
MML.statureTables["Gnome"]["Male"][10] = { height: "4'4", weight: 180, stature: 23 };
MML.statureTables["Gnome"]["Male"][11] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][12] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][13] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][14] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][15] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][16] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][17] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][18] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][19] = { height: "4'9", weight: 230, stature: 29 };
MML.statureTables["Gnome"]["Male"][20] = { height: "4'9", weight: 230, stature: 29 };

MML.statureTables["Gnome"]["Female"] = [];
MML.statureTables["Gnome"]["Female"][1] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][2] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][3] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][4] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][5] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][6] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][7] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][8] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][9] = { height: "4'1", weight: 140, stature: 21 };
MML.statureTables["Gnome"]["Female"][10] = { height: "4'2", weight: 150, stature: 22 };
MML.statureTables["Gnome"]["Female"][11] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][12] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][13] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][14] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][15] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][16] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][17] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][18] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][19] = { height: "4'7", weight: 200, stature: 27 };
MML.statureTables["Gnome"]["Female"][20] = { height: "4'7", weight: 200, stature: 27 };

MML.statureTables["Gray Elf"] = {};
MML.statureTables["Gray Elf"]["Male"] = [];
MML.statureTables["Gray Elf"]["Male"][1] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Gray Elf"]["Male"][2] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Male"][3] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][4] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][5] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Male"][6] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][7] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][8] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][9] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][10] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][11] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][12] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][13] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][14] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Gray Elf"]["Male"][15] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Gray Elf"]["Male"][16] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Gray Elf"]["Male"][17] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Gray Elf"]["Male"][18] = { height: "6'6", weight: 220, stature: 30 };
MML.statureTables["Gray Elf"]["Male"][19] = { height: "6'7", weight: 230, stature: 31 };
MML.statureTables["Gray Elf"]["Male"][20] = { height: "6'8", weight: 250, stature: 33 };

MML.statureTables["Gray Elf"]["Female"] = [];
MML.statureTables["Gray Elf"]["Female"][1] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][2] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][3] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][4] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][5] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][6] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][7] = { height: "5'4", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][8] = { height: "5'5", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][9] = { height: "5'6", weight: 133, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][10] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][11] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][12] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][13] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][14] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][15] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][16] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Female"][17] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][18] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][19] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Gray Elf"]["Female"][20] = { height: "6'3", weight: 175, stature: 26 };

MML.statureTables["Hobbit"] = {};
MML.statureTables["Hobbit"]["Male"] = [];
MML.statureTables["Hobbit"]["Male"][1] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][2] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][3] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][4] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][5] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][6] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][7] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][8] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][9] = { height: "3'9", weight: 75, stature: 12 };
MML.statureTables["Hobbit"]["Male"][10] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Male"][11] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][12] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][13] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][14] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][15] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][16] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][17] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][18] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][19] = { height: "4'3", weight: 110, stature: 16 };
MML.statureTables["Hobbit"]["Male"][20] = { height: "4'3", weight: 110, stature: 16 };

MML.statureTables["Hobbit"]["Female"] = [];
MML.statureTables["Hobbit"]["Female"][1] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][2] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][3] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][4] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][5] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][6] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][7] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][8] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][9] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Female"][10] = { height: "3'7", weight: 65, stature: 12 };
MML.statureTables["Hobbit"]["Female"][11] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][12] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][13] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][14] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][15] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][16] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][17] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][18] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][19] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Female"][20] = { height: "4'0", weight: 90, stature: 14 };

MML.statureTables["Wood Elf"] = {};
MML.statureTables["Wood Elf"]["Male"] = [];
MML.statureTables["Wood Elf"]["Male"][1] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][2] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][3] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][4] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][5] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][6] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][7] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][8] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][9] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][10] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][11] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][12] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][13] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][14] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][15] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][16] = { height: "6'4", weight: 180, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][17] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][18] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][19] = { height: "6'6", weight: 200, stature: 28 };
MML.statureTables["Wood Elf"]["Male"][20] = { height: "6'6", weight: 200, stature: 28 };

MML.statureTables["Wood Elf"]["Female"] = [];
MML.statureTables["Wood Elf"]["Female"][1] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][2] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][3] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][4] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][5] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][6] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][7] = { height: "5'4", weight: 118, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][8] = { height: "5'5", weight: 120, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][9] = { height: "5'6", weight: 123, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][10] = { height: "5'7", weight: 125, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][11] = { height: "5'8", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][12] = { height: "5'9", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][13] = { height: "5'10", weight: 133, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][14] = { height: "5'11", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][15] = { height: "6'0", weight: 140, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][16] = { height: "6'1", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][17] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][18] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][19] = { height: "6'3", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][20] = { height: "6'3", weight: 155, stature: 23 };

MML.racialAttributeBonuses = {};
MML.racialAttributeBonuses["Human"] = {};
MML.racialAttributeBonuses["Human"].strength = 0;
MML.racialAttributeBonuses["Human"].coordination = 0;
MML.racialAttributeBonuses["Human"].health = 0;
MML.racialAttributeBonuses["Human"].beauty = 0;
MML.racialAttributeBonuses["Human"].intellect = 0;
MML.racialAttributeBonuses["Human"].reason = 0;
MML.racialAttributeBonuses["Human"].creativity = 0;
MML.racialAttributeBonuses["Human"].presence = 0;
MML.racialAttributeBonuses["Human"].willpower = 0;
MML.racialAttributeBonuses["Human"].evocation = 0;
MML.racialAttributeBonuses["Human"].perception = 0;
MML.racialAttributeBonuses["Human"].systemStrength = 0;
MML.racialAttributeBonuses["Human"].fitness = 0;
MML.racialAttributeBonuses["Human"].load = 0;

MML.racialAttributeBonuses["Dwarf"] = {};
MML.racialAttributeBonuses["Dwarf"].strength = 3;
MML.racialAttributeBonuses["Dwarf"].coordination = 0;
MML.racialAttributeBonuses["Dwarf"].health = 3;
MML.racialAttributeBonuses["Dwarf"].beauty = 0;
MML.racialAttributeBonuses["Dwarf"].intellect = 0;
MML.racialAttributeBonuses["Dwarf"].reason = 0;
MML.racialAttributeBonuses["Dwarf"].creativity = 0;
MML.racialAttributeBonuses["Dwarf"].presence = -2;
MML.racialAttributeBonuses["Dwarf"].willpower = 2;
MML.racialAttributeBonuses["Dwarf"].evocation = 0;
MML.racialAttributeBonuses["Dwarf"].perception = 0;
MML.racialAttributeBonuses["Dwarf"].systemStrength = 3;
MML.racialAttributeBonuses["Dwarf"].fitness = 0;
MML.racialAttributeBonuses["Dwarf"].load = 20;

MML.racialAttributeBonuses["Gnome"] = {};
MML.racialAttributeBonuses["Gnome"].strength = 2;
MML.racialAttributeBonuses["Gnome"].coordination = 0;
MML.racialAttributeBonuses["Gnome"].health = 1;
MML.racialAttributeBonuses["Gnome"].beauty = 0;
MML.racialAttributeBonuses["Gnome"].intellect = 0;
MML.racialAttributeBonuses["Gnome"].reason = 0;
MML.racialAttributeBonuses["Gnome"].creativity = 0;
MML.racialAttributeBonuses["Gnome"].presence = 0;
MML.racialAttributeBonuses["Gnome"].willpower = 1;
MML.racialAttributeBonuses["Gnome"].evocation = 0;
MML.racialAttributeBonuses["Gnome"].perception = 0;
MML.racialAttributeBonuses["Gnome"].systemStrength = 1;
MML.racialAttributeBonuses["Gnome"].fitness = 0;
MML.racialAttributeBonuses["Gnome"].load = 15;

MML.racialAttributeBonuses["Hobbit"] = {};
MML.racialAttributeBonuses["Hobbit"].strength = 0;
MML.racialAttributeBonuses["Hobbit"].coordination = 2;
MML.racialAttributeBonuses["Hobbit"].health = 1;
MML.racialAttributeBonuses["Hobbit"].beauty = 0;
MML.racialAttributeBonuses["Hobbit"].intellect = 0;
MML.racialAttributeBonuses["Hobbit"].reason = 0;
MML.racialAttributeBonuses["Hobbit"].creativity = 2;
MML.racialAttributeBonuses["Hobbit"].presence = 0;
MML.racialAttributeBonuses["Hobbit"].willpower = 2;
MML.racialAttributeBonuses["Hobbit"].evocation = 5;
MML.racialAttributeBonuses["Hobbit"].perception = 1;
MML.racialAttributeBonuses["Hobbit"].systemStrength = 2;
MML.racialAttributeBonuses["Hobbit"].fitness = 0;
MML.racialAttributeBonuses["Hobbit"].load = 5;

MML.racialAttributeBonuses["Gray Elf"] = {};
MML.racialAttributeBonuses["Gray Elf"].strength = 0;
MML.racialAttributeBonuses["Gray Elf"].coordination = 1;
MML.racialAttributeBonuses["Gray Elf"].health = 1;
MML.racialAttributeBonuses["Gray Elf"].beauty = 1;
MML.racialAttributeBonuses["Gray Elf"].intellect = 1;
MML.racialAttributeBonuses["Gray Elf"].reason = 0;
MML.racialAttributeBonuses["Gray Elf"].creativity = 1;
MML.racialAttributeBonuses["Gray Elf"].presence = 1;
MML.racialAttributeBonuses["Gray Elf"].willpower = 0;
MML.racialAttributeBonuses["Gray Elf"].evocation = 10;
MML.racialAttributeBonuses["Gray Elf"].perception = 2;
MML.racialAttributeBonuses["Gray Elf"].systemStrength = 2;
MML.racialAttributeBonuses["Gray Elf"].fitness = 0;
MML.racialAttributeBonuses["Gray Elf"].load = 10;

MML.racialAttributeBonuses["Wood Elf"] = {};
MML.racialAttributeBonuses["Wood Elf"].strength = 0;
MML.racialAttributeBonuses["Wood Elf"].coordination = 3;
MML.racialAttributeBonuses["Wood Elf"].health = 1;
MML.racialAttributeBonuses["Wood Elf"].beauty = 0;
MML.racialAttributeBonuses["Wood Elf"].intellect = 0;
MML.racialAttributeBonuses["Wood Elf"].reason = 0;
MML.racialAttributeBonuses["Wood Elf"].creativity = 2;
MML.racialAttributeBonuses["Wood Elf"].presence = 0;
MML.racialAttributeBonuses["Wood Elf"].willpower = 0;
MML.racialAttributeBonuses["Wood Elf"].evocation = 5;
MML.racialAttributeBonuses["Wood Elf"].perception = 2;
MML.racialAttributeBonuses["Wood Elf"].systemStrength = 0;
MML.racialAttributeBonuses["Wood Elf"].fitness = 0;
MML.racialAttributeBonuses["Wood Elf"].load = 5;

MML.fitnessModLookup = [];
MML.fitnessModLookup[6] = 2.1;
MML.fitnessModLookup[7] = 2.2;
MML.fitnessModLookup[8] = 2.3;
MML.fitnessModLookup[9] = 2.4;
MML.fitnessModLookup[10] = 2.5;
MML.fitnessModLookup[11] = 2.6;
MML.fitnessModLookup[12] = 2.7;
MML.fitnessModLookup[13] = 2.8;
MML.fitnessModLookup[14] = 2.9;
MML.fitnessModLookup[15] = 3.0;
MML.fitnessModLookup[16] = 3.2;
MML.fitnessModLookup[17] = 3.4;
MML.fitnessModLookup[18] = 3.6;
MML.fitnessModLookup[19] = 3.8;
MML.fitnessModLookup[20] = 4.0;
MML.fitnessModLookup[21] = 4.2;
MML.fitnessModLookup[22] = 4.5;
MML.fitnessModLookup[23] = 5.0;
MML.fitnessModLookup[24] = 5.5;
MML.fitnessModLookup[25] = 6.0;

MML.meleeDamageMods = [
	{low: 0, high: 19, value: -7},
	{low: 20, high: 24, value: -6},
	{low: 25, high: 29, value: -5},
	{low: 30, high: 34, value: -4},
	{low: 35, high: 39, value: -3},
	{low: 40, high: 44, value: -2},
	{low: 45, high: 54, value: -1},
	{low: 55, high: 64, value: 0},
	{low: 65, high: 74, value: 1},
	{low: 75, high: 90, value: 2},
	{low: 91, high: 105, value: 3},
	{low: 106, high: 120, value: 4},
	{low: 121, high: 999, value: 5},
];

MML.unarmedAttacks = {};
MML.unarmedAttacks["Grapple"] = {name: "Grapple", family: "Unarmed", initiative: 10, task: 35, defenseMod: 35, damage: "None", damageType: "None"};
MML.unarmedAttacks["Takedown"] = {name: "Takedown", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Place a Hold, Head, Arm, Leg"] = {name: "Place a Hold, Head, Arm, Leg", family: "Unarmed", initiative: 10,  task: 0, defenseMod: 15, damage: "None", damageType: "None"};
MML.unarmedAttacks["Place a Hold, Chest, Abdomen"] = {name: "Place a Hold, Chest, Abdomen", family: "Unarmed", initiative: 10,  task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Break a Hold"] = {name: "Break a Hold", family: "Unarmed", initiative: 10, task: 0, defenseMod: 0, damage: "None", damageType: "None"};
MML.unarmedAttacks["Break Grapple"] = {name: "Break Grapple", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Regain Feet"] = {name: "Regain Feet", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None"};
MML.unarmedAttacks["Punch"] = {name: "Punch", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d4", damageType: "Impact"};
MML.unarmedAttacks["Punch, Padded"] = {name: "Punch, Padded", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d2", damageType: "Impact"};
MML.unarmedAttacks["Punch, Mail, Studs"] = {name: "Punch, Mail, Studs", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Punch, Plate"] = {name: "Punch, Plate", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Kick"] = {name: "Kick", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d4", damageType: "Impact"};
MML.unarmedAttacks["Kick, Heavy Boots"] = {name: "Kick, Heavy Boots", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Kick, Plate"] = {name: "Kick, Plate", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d8", damageType: "Impact"};
MML.unarmedAttacks["Head Butt"] = {name: "Head Butt", family: "Unarmed", initiative: 10, task: 25, defenseMod: 0, damage: "1d6", damageType: "Impact"};
MML.unarmedAttacks["Bite"] = {name: "Bite", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d3", damageType: "Thrust"};
MML.startCombat = function startCombat(input) {
  this.currentRound = 1;
  this.combatants = input.selectedCharNames;

  if (this.combatants.length > 0) {
    this.inCombat = true;

    _.each(this.combatants, function(charName) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setApiCharAttribute",
        input: {
          attribute: "ready",
          value: false
        }
      });
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setCombatVision",
        input: {
          inCombat: true
        }
      });
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "updateCharacter",
        input: {
          attribute: "initiative"
        }
      });
    });

    MML.processCommand({
      type: "GM",
      callback: "setTurnOrder",
      input: {}
    });

    Campaign().set("initiativepage", "true");

    MML.processCommand({
      type: "GM",
      callback: "newRound",
      input: {}
    });
  } else {
    sendChat("", "&{template:charMenu} {{name=Error}} {{message=No tokens selected}}");

    MML.processCommand({
      type: "player",
      who: this.player,
      callback: "setApiPlayerAttribute",
      input: {
        buttons: [MML.menuButtons.combatMenu]
      }
    });
    MML.processCommand({
      type: "player",
      who: this.player,
      callback: "menuCommand",
      input: {
        who: this.player,
        buttonText: "Combat"
      }
    });
  }
};

MML.newRound = function newRound() {
  this.currentRound++;
  this.roundStarted = false;
  _.each(this.combatants, function(charName) {
    MML.processCommand({
      type: "character",
      who: charName,
      callback: "newRoundUpdateCharacter",
      input: {}
    });
  });
  _.each(state.MML.players, function(player) {
    MML.processCommand({
      type: "player",
      who: player.name,
      callback: "newRoundUpdatePlayer",
      input: {
        who: player.who
      }
    });
  });
};

MML.startRound = function startRound() {
  if (MML.checkReady()) {
    this.roundStarted = true;

    _.each(this.combatants, function(charName) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "updateCharacter",
        input: {
          attribute: "initiativeRoll"
        }
      });
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setApiCharAttribute",
        input: {
          attribute: "movementAvailable",
          value: state.MML.characters[charName].movementRatio
        }
      });
    });

    MML.processCommand({
      type: "GM",
      callback: "nextAction",
      input: {}
    });
  }
};

MML.endCombat = function endCombat() {
  if (this.combatants.length > 0) {
    _.each(this.combatants, function(charName) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setApiCharAttribute",
        input: {
          attribute: "ready",
          value: true
        }
      });
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setCombatVision",
        input: {
          inCombat: false
        }
      });
    });
    this.inCombat = false;
    this.combatants = [];
    Campaign().set("initiativepage", "false");
  }
};

MML.nextAction = function nextAction() {
  MML.processCommand({
    type: "GM",
    callback: "setTurnOrder",
    input: {}
  });

  if (MML.checkReady()) {
    if (state.MML.characters[this.combatants[0]].initiative > 0) {
      this.actor = this.combatants[0];
      var playerName = state.MML.characters[this.actor].player;

      MML.processCommand({
        type: "player",
        who: playerName,
        callback: "menuCombatMovement",
        input: {
          who: this.actor
        }
      });
      MML.processCommand({
        type: "player",
        who: playerName,
        callback: "displayMenu",
        input: {}
      });
    } else {
      MML.processCommand({
        type: "GM",
        callback: "newRound",
        input: {}
      });
    }
  }
};

MML.getSingleTarget = function getSingleTarget(input) {
  input.charName = this.name;
  input.callback = "setCurrentCharacterTargets";
  MML.displayTargetSelection(input);
};

MML.setTargets = function setTargets() {
  this.targets = this.characters[this.actor].action.targets;
  this.targetIndex = 0;
  this.currentTarget = this.targets[0];
};

MML.checkReady = function checkReady() {
  var everyoneReady = true;

  _.each(state.MML.GM.combatants, function(charName) {
    if (state.MML.characters[charName].ready === false) {
      everyoneReady = false;
    }
  });

  return everyoneReady;
};

MML.displayThreatZones = function displayThreatZones(input) {
  var toggle = input.toggle;
  _.each(this.combatants, function(combatant) {
    var character = state.MML.characters[combatant];
    var token = MML.getTokenFromChar(combatant);
    var radius1 = "";
    var radius2 = "";
    var color1 = "#FF0000";
    var color2 = "#FFFF00";
    if (toggle && !MML.isWieldingRangedWeapon(character) && !MML.isUnarmed(character)) {
      var weapon = MML.getMeleeWeapon(character);
      radius1 = MML.weaponRanks[weapon.rank].high;
      radius2 = MML.weaponRanks[weapon.rank + 1].high;
    }
    MML.displayAura(token, radius1, 1, color1);
    MML.displayAura(token, radius2, 2, color2);
  });
};

// Turn Order Functions
MML.setTurnOrder = function setTurnOrder() {
  var turnorder = [];

  var index;
  for (index in this.combatants) {
    turnorder.push({
      id: MML.getTokenFromChar(this.combatants[index]).id,
      pr: state.MML.characters[this.combatants[index]].initiative,
      custom: ""
    });
  }

  turnorder.sort(function(a, b) {
    if (parseFloat(b.pr) === parseFloat(a.pr)) {
      if (a.custom !== "" && b.custom !== "") {
        return parseFloat(b.custom) - parseFloat(a.custom);
      } else {
        return 0;
      }
    } else {
      return parseFloat(b.pr) - parseFloat(a.pr);
    }
  });

  index = 0;
  for (index in this.combatants) {
    //Orders the tokens based on initiative
    this.combatants[index] = MML.getCharFromToken(getObj("graphic", turnorder[index].id));
  }

  Campaign().set("turnorder", JSON.stringify(turnorder));
};

MML.changeRoll = function changeRoll(input) {
  var value = input.value;
  var range = this.currentRoll.range.split("-");
  var low = parseInt(range[0]);
  var high = parseInt(range[1]);
  log(this.currentRoll.callback);
  if (value >= low && value <= high) {
    if (this.currentRoll.type === "damage") {
      this.currentRoll.value = -value;
      this.currentRoll.message = "Roll: " + value + "\nRange: " + this.currentRoll.range;
    } else {
      this.currentRoll.value = value;
      if (this.currentRoll.type === "universal") {
        this.currentRoll = MML.universalRollResult(this.currentRoll);
      } else if (this.currentRoll.type === "attribute") {
        this.currentRoll = MML.attributeCheckResult(this.currentRoll);
      }
    }
  } else {
    sendChat("Error", "New roll value out of range.");
  }
  MML.processCommand({
    type: "character",
    who: this.currentRoll.character,
    callback: this.currentRoll.callback,
    input: {}
  });
};

MML.assignNewItem = function assignNewItem(input) {
  MML.processCommand({
    type: "character",
    who: input.target,
    callback: "setApiCharAttributeJSON",
    input: {
      attribute: "inventory",
      index: generateRowID(),
      value: state.MML.GM.newItem
    }
  });
};

// var exampleCommand = {
//   type: "player",
//   who: state.MML.players[playerName],
//   callback:"menuCommand",
//   input: {
//     rollResult: "Success"
//   }
// };

function commandLock() {
  switch (state.MML.GM.gameState) {
    case "non-combat":

      break;
    default:

  }
}

MML.processCommand = function processCommand(command) {
  try {
    switch (command.type) {
      case "character":
        var character = state.MML.characters[command.who];
        MML[command.callback].apply(character, [command.input]);
        state.MML.characters[command.who] = character;
        break;
      case "player":
        var player = state.MML.players[command.who];
        MML[command.callback].apply(player, [command.input]);
        state.MML.players[command.who] = player;
        break;
      case "GM":
        MML[command.callback].apply(state.MML.GM, [command.input]);
        break;
      default:
        break;
    }
  } catch (error) {
    sendChat("", "processCommand failed");
    // log(state.MML.GM);
    // log(state.MML.players);
    // log(state.MML.characters);
    log(MML[command.callback]);
    log(command);
    log(error.message);
    log(error.stack);
  }
};

MML.parseCommand = function parseCommand(msg) {
  if (msg.type === "api" && msg.content.indexOf("!MML|") !== -1) {
    var command = "parse failed";
    var content = msg.content.replace("!MML|", "");
    var input;

    if (content.indexOf("selectTarget") !== -1) {
      var stringIn = content.replace("selectTarget ", "").split("|");
      var character = stringIn[0];
      var target = stringIn[1];
      var hexedInput = stringIn[2];

      input = MML.dehexify(hexedInput);

      try {
        input = JSON.parse(input);
      } catch (e) {
        command = "selectTarget parse failed";
        sendChat("", command);
        log(stringIn);
        log(input);
        MML.error();
      }
      input.target = target;

      command = {
        type: "player",
        who: msg.who.replace(" (GM)", ""),
        callback: input.callback,
        input: input
      };
    } else if (content.indexOf("changeRoll") !== -1) {
      var value = parseInt(content.replace("changeRoll ", ""));

      if (!isNaN(value)) {
        command = {
          type: "player",
          who: state.MML.GM.player,
          callback: "changeRoll",
          input: {
            value: value
          }
        };
      } else {
        sendChat("Error", "Please enter a numerical value.");
      }
    } else if (content.indexOf("acceptRoll") !== -1) {
      if (state.MML.players[state.MML.GM.player].currentRoll.accepted === false) {
        var player = state.MML.players[state.MML.GM.player];
        state.MML.players[player.name].currentRoll.accepted = true;

        command = {
          type: "character",
          who: player.who,
          callback: player.currentRoll.callback,
          input: {}
        };
      }
    } else if (content.indexOf("displayItemOptions") !== -1) {
      input = content.replace("displayItemOptions ", "").split("|");
      var who = input[0];
      var itemId = input[1];

      command = {
        type: "player",
        who: msg.who.replace(" (GM)", ""),
        callback: "displayItemOptions",
        input: {
          who: who,
          itemId: itemId
        }
      };
    } else {
      command = MML.dehexify(content);
      try {
        command = JSON.parse(command);
      } catch (e) {
        log(command);
        log(content);
        sendChat("", "JSON parse failed");
      }

      command.input.selectedCharNames = MML.getSelectedCharNames(msg.selected);
    }

    MML.processCommand(command);
  }
};
// This file contains all menus and defines the player object class

MML.playerClass = {
  message: "", //
  buttons: {}, //{text: "Click Here", nextMenu: "mainMenu", callback: MML.callback}
  name: "",
  characters: [],
  combatants: [],
  characterIndex: 0,
  who: "",
  menu: ""
};

MML.menuCommand = function(input) {
  var who = input.who;
  var buttonText = input.buttonText;
  var buttonInput;

  var button = _.findWhere(this.buttons, {
    text: buttonText
  });
  if (!_.isUndefined(button)) {
    this.menu = button.nextMenu;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: button.nextMenu,
      input: {
        who: who
      }
    });
    buttonInput = {
      text: button.text,
      selectedCharNames: input.selectedCharNames
    };
    button.callback.apply(this, [buttonInput]);
  }
};

MML.setApiPlayerAttribute = function(input) {
  this[input.attribute] = input.value;
};

MML.newRoundUpdatePlayer = function(input) {
  this.characterIndex = 0;
  this.combatants = _.intersection(this.characters, state.MML.GM.combatants);
  this.who = this.combatants[0];
  this.menu = "charMenuPrepareAction";

  if (this.combatants.length > 0) {
    if (state.MML.characters[this.who].situationalInitBonus !== "No Combat") {
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "charMenuPrepareAction",
        input: {
          who: this.who
        }
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    } else {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "setApiCharAttribute",
        input: {
          attribute: "ready",
          value: true
        }
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "prepareNextCharacter",
        input: {}
      });
    }
  }
};

MML.prepareNextCharacter = function(input) {
  this.characterIndex++;
  var charName = this.combatants[this.characterIndex];

  if (this.characterIndex < this.combatants.length) {
    if (state.MML.characters[charName].situationalInitBonus !== "No Combat") {
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "charMenuPrepareAction",
        input: {
          who: charName
        }
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    } else {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "setApiCharAttribute",
        input: {
          attribute: "ready",
          value: true
        }
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "prepareNextCharacter",
        input: {}
      });
    }
  } else if (this.name === state.MML.GM.player) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "GmMenuStartRound",
      input: {
        who: "GM",
      }
    });
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};

MML.menuIdle = function menuIdle(input) {
  this.who = input.who;
  this.message = "Menu Closed";
  this.buttons = [];
};

MML.menuPause = function menuPause(input) {};

MML.GmMenuMain = function GmMenuMain(input) {
  this.who = input.who;
  this.message = "Main Menu: ";
  this.buttons = [MML.menuButtons.combatMenu,
    MML.menuButtons.newItemMenu,
    MML.menuButtons.worldMenu,
    MML.menuButtons.utilitiesMenu
  ];
};

MML.GmMenuAssignStatusEffect = function GmMenuAssignStatusEffect(input) {
  this.who = input.who;
  this.message = "Choose a Status Effect: ";
  this.buttons = [];

  _.each(MML.statusEffects, function(effect, effectName) {
    this.buttons.push({
      text: effectName,
      nextMenu: "GmMenuItemQuality",
      callback: function(input) {
        state.MML.GM.newItem = MML.items[input.text];
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  });
};

MML.displayPlayerRoll = function displayPlayerRoll(input) {
  this.who = input.who;
  this.message = this.currentRoll.message;
  this.buttons = [MML.menuButtons.acceptRoll];
};

MML.GmMenuCombat = function GmMenuCombat(input) {
  this.who = input.who;
  this.message = "Select tokens and begin.";
  this.buttons = [MML.menuButtons.startCombat,
    MML.menuButtons.toMainGmMenu,
  ];
};

MML.GmMenuNewItem = function GmMenuNewItem(input) {
  this.who = input.who;
  this.message = "Select item type:";
  this.buttons = [MML.menuButtons.newWeapon,
    MML.menuButtons.newShield,
    MML.menuButtons.newArmor,
    MML.menuButtons.newSpellComponent,
    MML.menuButtons.newMiscItem
  ];
};

MML.GmMenuNewWeapon = function GmMenuNewWeapon(input) {
  this.who = input.who;
  this.message = "Select weapon type:";
  this.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === "weapon") {
      this.buttons.push({
        text: item.name,
        nextMenu: "GmMenuItemQuality",
        callback: function(input) {
          state.MML.GM.newItem = MML.items[input.text];
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        }
      });
    }
  }, this);
};

MML.GmMenuNewShield = function GmMenuNewShield(input) {
  this.who = input.who;
  this.message = "Select shield type:";
  this.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === "shield") {
      this.buttons.push({
        text: item.name,
        nextMenu: "GmMenuItemQuality",
        callback: function(input) {
          state.MML.GM.newItem = MML.items[input.text];
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        }
      });
    }
  }, this);
};

MML.GmMenuNewArmor = function GmMenuNewArmor(input) {
  this.who = input.who;
  this.message = "Select armor style:";
  this.buttons = [];

  _.each(MML.items, function(item) {
    if (item.type === "armor") {
      this.buttons.push({
        text: item.name,
        nextMenu: "GmMenuArmorMaterial",
        callback: function(input) {
          state.MML.GM.newItem = MML.items[input.text];
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        }
      });
    }
  }, this);
};

MML.GmMenuArmorMaterial = function GmMenuArmorMaterial(input) {
  this.who = input.who;
  this.message = "Select armor material:";
  this.buttons = [];

  _.each(MML.APVList, function(material) {
    this.buttons.push({
      text: material.name,
      nextMenu: "GmMenuItemQuality",
      callback: function(input) {
        var material = MML.APVList[input.text];
        state.MML.GM.newItem.material = material.name;
        state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
        state.MML.GM.newItem.name = material.name + " " + state.MML.GM.newItem.name;
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }, this);
};

MML.GmMenuNewItemProperties = function GmMenuNewItemProperties(input) {
  this.who = input.who;
  this.message = "Add new properties:";
  this.buttons = [MML.menuButtons.assignNewItem];
};

MML.GmMenuassignNewItem = function GmMenuassignNewItem(input) {
  this.who = input.who;
  this.message = "Select character:";
  this.buttons = [];

  _.each(state.MML.characters, function(character) {
    this.buttons.push({
      text: index,
      nextMenu: "GmMenuMain",
      callback: function(input) {
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }, this);
};

MML.GmMenuItemQuality = function GmMenuItemQuality(input) {
  this.who = input.who;
  this.message = "Select a quality level:";
  this.buttons = [MML.menuButtons.itemQualityPoor,
    MML.menuButtons.itemQualityStandard,
    MML.menuButtons.itemQualityExcellent,
    MML.menuButtons.itemQualityMasterWork
  ];
};

MML.displayItemOptions = function displayItemOptions(input) {
  var who = input.who;
  var itemId = input.itemId;
  var item = state.MML.characters[who].inventory[itemId];
  var buttons = [];
  var unequipButton;
  var hands;
  this.menu = "menuIdle";
  this.message = "Item Menu";
  this.who = who;

  if (item.type === "weapon") {
    //Weapon already equipped
    if (state.MML.characters[who].leftHand._id === itemId || state.MML.characters[who].rightHand._id === itemId) {
      unequipButton = {
        text: "Unequip",
        nextMenu: "menuIdle"
      };

      if (state.MML.characters[who].leftHand._id === itemId && state.MML.characters[who].leftHand._id === itemId) {
        unequipButton.callback = function(text) {
          MML.processCommand({
            type: "character",
            who: who,
            callback: "setApiCharAttribute",
            input: {
              attribute: "leftHand",
              value: {
                _id: "emptyHand"
              }
            }
          });
          MML.processCommand({
            type: "character",
            who: who,
            callback: "setApiCharAttribute",
            input: {
              attribute: "leftHand",
              value: {
                _id: "emptyHand"
              }
            }
          });
          MML.processCommand({
            type: "character",
            who: who,
            callback: "setApiCharAttribute",
            input: {
              attribute: "rightHand",
              value: {
                _id: "emptyHand"
              }
            }
          });
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        };
      } else if (state.MML.characters[who].leftHand._id === itemId) {
        unequipButton.callback = function(text) {
          MML.processCommand({
            type: "character",
            who: who,
            callback: "setApiCharAttribute",
            input: {
              attribute: "leftHand",
              value: {
                _id: "emptyHand"
              }
            }
          });
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        };
      } else {
        unequipButton.callback = function(text) {
          MML.processCommand({
            type: "character",
            who: who,
            callback: "setApiCharAttribute",
            input: {
              attribute: "rightHand",
              value: {
                _id: "emptyHand"
              }
            }
          });
          MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
          });
        };
      }
      buttons.push(unequipButton);
    } else {
      _.each(item.grips, function(grip, gripName) {
        if (gripName === "One Hand") {
          buttons.push({
            text: "Equip Left Hand",
            nextMenu: "menuIdle",
            callback: function(text) {
              // if(state.MML.characters[who].rightHand.grip !== "One Hand"){
              //     MML.processCommand({
              //     	type: "character",
              // 		who: who,
              // 		callback: "setApiCharAttribute",
              // 		input: {
              // 			attribute: "rightHand",
              // 			value: {
              //                 _id: itemId,
              //                 grip: gripName
              //             }
              // 		}
              // 	});
              // }
              MML.processCommand({
                type: "character",
                who: who,
                callback: "setApiCharAttribute",
                input: {
                  attribute: "leftHand",
                  value: {
                    _id: itemId,
                    grip: gripName
                  }
                }
              });

              MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
              });
            }
          });
          buttons.push({
            text: "Equip Right Hand",
            nextMenu: "menuIdle",
            callback: function(text) {
              // if(state.MML.characters[who].leftHand.grip !== "One Hand"){
              //     MML.processCommand({
              //     	type: "character",
              // 		who: who,
              // 		callback: "setApiCharAttribute",
              // 		input: {
              // 			attribute: "leftHand",
              // 			value: {
              //                 _id: itemId,
              //                 grip: gripName
              //             }
              // 		}
              // 	});
              // }
              MML.processCommand({
                type: "character",
                who: who,
                callback: "setApiCharAttribute",
                input: {
                  attribute: "rightHand",
                  value: {
                    _id: itemId,
                    grip: gripName
                  }
                }
              });
              MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
              });
            }
          });
        } else {
          buttons.push({
            text: "Equip " + gripName,
            nextMenu: "menuIdle",
            callback: function(text) {
              MML.processCommand({
                type: "character",
                who: who,
                callback: "setApiCharAttribute",
                input: {
                  attribute: "rightHand",
                  value: {
                    _id: itemId,
                    grip: gripName
                  }
                }
              });
              MML.processCommand({
                type: "character",
                who: who,
                callback: "setApiCharAttribute",
                input: {
                  attribute: "leftHand",
                  value: {
                    _id: itemId,
                    grip: gripName
                  }
                }
              });
              MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
              });
            }
          });
        }
      });
    }
  } else if (item.type === "armor") {
    log(item.type);
  } else if (item.type === "shield") {
    buttons.push({
      text: "Equip Left Hand",
      nextMenu: "menuIdle",
      callback: function(text) {
        MML.processCommand({
          type: "character",
          who: who,
          callback: "setApiCharAttribute",
          input: {
            attribute: "leftHand",
            value: {
              _id: itemId,
              grip: "One Hand"
            }
          }
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
    buttons.push({
      text: "Equip Right Hand",
      nextMenu: "menuIdle",
      callback: function(text) {
        MML.processCommand({
          type: "character",
          who: who,
          callback: "setApiCharAttribute",
          input: {
            attribute: "rightHand",
            value: {
              _id: itemId,
              grip: "One Hand"
            }
          }
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  } else if (item.type === "spellComponent") {
    log(item.type);
  } else {
    log(item.type);
  }

  buttons.push({
    text: "Exit",
    nextMenu: "menuIdle",
    callback: function(text) {
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  });

  this.buttons = buttons;
  MML.processCommand({
    type: "player",
    who: this.name,
    callback: "displayMenu",
    input: {}
  });
};

MML.GmMenuStartRound = function GmMenuStartRound(input) {
  this.who = input.who;
  this.message = "Start round when all characters are ready.";
  this.buttons = [MML.menuButtons.startRound,
    MML.menuButtons.endCombat
  ];
};

MML.charMenuPrepareAction = function charMenuPrepareAction(input) {
  this.who = input.who;
  this.message = "Prepare " + this.who + "'s action";
  var character = state.MML.characters[this.who];
  var buttons = [MML.menuButtons.setActionAttack,
    MML.menuButtons.setActionCast,
    MML.menuButtons.setActionReadyItem,
    MML.menuButtons.setActionObserve
  ];

  if ((_.has(character.statusEffects, "Holding") || _.has(character.statusEffects, "Grappled")) &&
    !_.contains(character.action.modifiers, "Release Opponent")
  ) {
    buttons.push({
      text: "Release Opponent",
      nextMenu: "charMenuPrepareAction",
      callback: function(input) {
        state.MML.characters[this.who].action.modifiers = "Release Opponent";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  this.buttons = buttons;
};
MML.charMenuAttack = function charMenuAttack(input) {
  this.who = input.who;
  this.message = "Attack Menu";
  var buttons = [];
  var character = state.MML.characters[this.who];

  if (!MML.isUnarmed(character)) {
    buttons.push({
      text: "Standard",
      nextMenu: "charMenuAttackCalledShot",
      callback: function(input) {
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }

  if (MML.isWieldingRangedWeapon(character)) {
    buttons.push({
      text: "Shoot From Cover",
      nextMenu: "charMenuAttackCalledShot",
      callback: function(input) {
        state.MML.characters[this.who].action.modifiers.push("Shoot From Cover");
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
    buttons.push({
      text: "Aim",
      nextMenu: "charMenuPrepareAction",
      callback: function(input) {
        state.MML.characters[this.who].action.modifiers.push("Aim");
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  } else if (!MML.isUnarmed(character)) { //Melee
    buttons.push({
      text: "Sweep Attack",
      nextMenu: "charMenuAttackCalledShot",
      callback: function(input) {
        state.MML.characters[this.who].action.modifiers.push("Sweep Attack");
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  buttons.push({
    text: "Punch",
    nextMenu: "menuPause",
    callback: function(input) {
      state.MML.characters[this.who].action.weaponType = "Punch";
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "charMenuAttackStance",
        input: {who: this.who}
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  });
  buttons.push({
    text: "Kick",
    nextMenu: "menuPause",
    callback: function(input) {
      state.MML.characters[this.who].action.weaponType = "Kick";
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "charMenuAttackStance",
        input: {who: this.who}
      });
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  });
  if (!_.has(character.statusEffects, "Grappled") &&
    !_.has(character.statusEffects, "Holding") &&
    !_.has(character.statusEffects, "Held") &&
    !_.has(character.statusEffects, "Taken Down") &&
    !_.has(character.statusEffects, "Pinned") &&
    !_.has(character.statusEffects, "Overborne")
  ) {
    buttons.push({
      text: "Grapple",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Grapple";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if (((_.has(character.statusEffects, "Grappled") || _.has(character.statusEffects, "Held") || _.has(character.statusEffects, "Holding")) &&
    character.movementPosition === "Prone") ||
    ((_.has(character.statusEffects, "Taken Down") || _.has(character.statusEffects, "Overborne")) && !_.has(character.statusEffects, "Pinned"))
  ) {
    buttons.push({
      text: "Regain Feet",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Regain Feet";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if (!_.has(character.statusEffects, "Holding") &&
    !_.has(character.statusEffects, "Held") &&
    !_.has(character.statusEffects, "Pinned") &&
    (!_.has(character.statusEffects, "Grappled") || character.statusEffects["Grappled"].targets.length === 1)
  ) {
    buttons.push({
      text: "Place a Hold",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Place a Hold";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if (_.has(character.statusEffects, "Held") || _.has(character.statusEffects, "Pinned")) {
    buttons.push({
      text: "Break a Hold",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Break a Hold";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if ((_.has(character.statusEffects, "Grappled")) &&
    !_.has(character.statusEffects, "Pinned") &&
    !_.has(character.statusEffects, "Held")
  ) {
    buttons.push({
      text: "Break Grapple",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Break Grapple";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if ((_.has(character.statusEffects, "Holding") ||
    (_.has(character.statusEffects, "Grappled") && character.statusEffects["Grappled"].targets.length === 1) ||
    (_.has(character.statusEffects, "Held") && character.statusEffects["Held"].targets.length === 1)) &&
    character.movementPosition !== "Prone"
  ) {
    buttons.push({
      text: "Takedown",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Takedown";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  if (_.has(character.statusEffects, "Held") ||
    _.has(character.statusEffects, "Grappled") ||
    _.has(character.statusEffects, "Holding") ||
    _.has(character.statusEffects, "Taken Down") ||
    _.has(character.statusEffects, "Pinned") ||
    _.has(character.statusEffects, "Overborne")
  ) {
    buttons.push({
      text: "Head Butt",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Head Butt";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
    buttons.push({
      text: "Bite",
      nextMenu: "menuPause",
      callback: function(input) {
        state.MML.characters[this.who].action.weaponType = "Bite";
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "charMenuAttackStance",
          input: {who: this.who}
        });
        MML.processCommand({
          type: "player",
          who: this.name,
          callback: "displayMenu",
          input: {}
        });
      }
    });
  }
  this.buttons = buttons;
};
MML.charMenuAttackCalledShot = function charMenuCalledShot(input) {
  this.who = input.who;
  this.message = "Called Shot Menu";
  var buttons = [{
    text: "None",
    callback: function(input) {
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }, {
    text: "Body Part",
    callback: function(input) {
      state.MML.characters[this.who].action.modifiers.push("Called Shot");
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }, {
    text: "Specific Hit Position",
    callback: function(input) {
      state.MML.characters[this.who].action.modifiers.push("Called Shot Specific");
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }];

  if (MML.isWieldingRangedWeapon(state.MML.characters[this.who])) {
    _.each(buttons, function(button) {
      button.nextMenu = "charMenuFinalizeAction";
    });
  } else {
    _.each(buttons, function(button) {
      button.nextMenu = "charMenuAttackStance";
    });
  }
  this.buttons = buttons;
};
MML.charMenuAttackStance = function charMenuAttackStance(input) {
  this.who = input.who;
  this.message = "Attack Stance Menu";
  var character = state.MML.characters[this.who];
  var buttons = [{
    text: "Neutral",
    callback: function(input) {
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }, {
    text: "Defensive",
    callback: function(input) {
      state.MML.characters[this.who].action.modifiers.push("Defensive Stance");
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }, {
    text: "Aggressive",
    callback: function(input) {
      state.MML.characters[this.who].action.modifiers.push("Aggressive Stance");
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }];

  if (["Punch", "Kick", "Head Butt", "Bite", "Grapple", "Place a Hold", "Break a Hold", "Break Grapple", "Takedown", "Regain Feet"].indexOf(character.action.weaponType) > -1) {
    _.each(buttons, function(button) {
      button.nextMenu = "charMenuFinalizeAction";
    });
  } else if (!MML.isUnarmed(character) && MML.getMeleeWeapon(character).secondaryType !== "") {
    _.each(buttons, function(button) {
      button.nextMenu = "charMenuSelectDamageType";
    });
  } else {
    state.MML.characters[this.who].action.weaponType = "primary";
    _.each(buttons, function(button) {
      button.nextMenu = "charMenuFinalizeAction";
    });
  }
  this.buttons = buttons;
};

MML.charMenuFinalizeAction = function charMenuFinalizeAction(input) {
  this.who = input.who;

  if (state.MML.GM.roundStarted === true) {
    this.message = "Accept or change action for " + this.who;
    this.buttons = [
      MML.menuButtons.acceptAction,
      MML.menuButtons.changeAction
    ];
  } else {
    this.message = "Roll initiative or change action for " + this.who;
    this.buttons = [
      MML.menuButtons.initiativeRoll,
      MML.menuButtons.changeAction
    ];
  }
};

MML.GmMenuStartAction = function GmMenuStartAction(input) {
  this.who = input.who;
  this.message = "Start " + state.MML.GM.actor + "'s action";
  this.buttons = [MML.menuButtons.startAction];
};
MML.menuCombatMovement = function menuCombatMovement(input) {
  this.who = input.who;
  this.message = "Move " + this.who + ".";
  this.buttons = [MML.menuButtons.setProne,
    MML.menuButtons.setStalk,
    MML.menuButtons.setCrawl,
    MML.menuButtons.setWalk,
    MML.menuButtons.setJog,
    MML.menuButtons.setRun,
    MML.menuButtons.endMovement
  ];

  MML.processCommand({
    type: "GM",
    callback: "displayThreatZones",
    input: {
      toggle: true
    }
  });
};
MML.setCurrentCharacterTargets = function setCurrentCharacterTargets(input) {
  var targetArray;

  if (typeof input.target !== "undefined") {
    targetArray = [input.target];
  } else {
    targetArray = input.targets;
  }

  state.MML.GM.currentAction.targetArray = targetArray;
  state.MML.GM.currentAction.targetIndex = 0;

  MML.processCommand({
    type: "character",
    who: input.charName,
    callback: state.MML.characters[input.charName].action.callback,
    input: {}
  });
};
MML.charMenuSelectBodyPart = function charMenuSelectBodyPart(input) {
  this.who = input.who;
  this.message = "Choose a Body Part.";
  this.buttons = [];

  var bodyParts = MML.getBodyParts(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

  _.each(bodyParts, function(part) {
    this.buttons.push({
      text: part,
      nextMenu: "menuIdle",
      callback: function(input) {
        state.MML.GM.currentAction.calledShot = input.text;

        MML.processCommand({
          type: "character",
          who: this.who,
          callback: "processAttack",
          input: {}
        });
      }
    });
  }, this);
};
MML.charMenuSelectHitPosition = function charMenuSelectHitPosition(input) {
  this.who = input.who;
  this.message = "Choose a Hit Position.";
  this.buttons = [];

  var hitPositions = MML.getHitPositionNames(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

  _.each(hitPositions, function(position) {
    this.buttons.push({
      text: position,
      nextMenu: "menuIdle",
      callback: function(input) {
        state.MML.GM.currentAction.calledShot = input.text;

        MML.processCommand({
          type: "character",
          who: this.who,
          callback: "processAttack",
          input: {}
        });
      }
    });
  }, this);
};
MML.charMenuSelectDamageType = function charMenuSelectDamageType(input) {
  this.who = input.who;
  this.message = "Choose a Damage Type.";
  this.buttons = [];

  this.buttons.push({
    text: "Primary",
    nextMenu: "charMenuFinalizeAction",
    callback: function(input) {
      state.MML.characters[this.who].action.weaponType = "primary";
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  });

  this.buttons.push({
    text: "Secondary",
    nextMenu: "charMenuFinalizeAction",
    callback: function(input) {
      state.MML.characters[this.who].action.weaponType = "secondary";
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  });
};
MML.charMenuAttackRoll = function charMenuAttackRoll(input) {
  this.who = input.who;
  this.message = "Roll Attack.";
  this.buttons = [MML.menuButtons.rollDice];
};
MML.charMenuMeleeDefenseRoll = function charMenuMeleeDefenseRoll(input) {
  var blockChance = input.blockChance;
  var dodgeChance = input.dodgeChance;

  this.who = input.who;
  this.message = "How will " + this.who + " defend?";
  this.buttons = [{
    text: "Dodge: " + dodgeChance + "%",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "meleeDodgeRoll",
        input: {
          dodgeChance: dodgeChance
        }
      });
    }
  }, {
    text: "Block: " + blockChance + "%",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "meleeBlockRoll",
        input: {
          blockChance: blockChance
        }
      });
    }
  }, {
    text: "Take it",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "forgoDefense",
        input: {
          rollName: "defenseRoll"
        }
      });
    }
  }];
};
MML.charMenuRangedDefenseRoll = function charMenuRangedDefenseRoll(input) {
  var defenseChance = input.defenseChance;

  this.who = input.who;
  this.message = "How will " + this.who + " defend?";
  this.buttons = [{
    text: "Defend: " + defenseChance + "%",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "rangedDefenseRoll",
        input: {
          defenseChance: defenseChance
        }
      });
    }
  }, {
    text: "Take it",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "forgoDefense",
        input: {
          rollName: "defenseRoll"
        }
      });
    }
  }];
};
MML.charMenuGrappleDefenseRoll = function charMenuGrappleDefenseRoll(input) {
  var brawlChance = input.brawlChance;
  var attackChance = input.attackChance;

  this.who = input.who;
  this.message = "How will " + this.who + " defend?";
  var buttons = [];
  log(!MML.isUnarmed(state.MML.characters[this.who]));
  log(_.intersection( _.keys(state.MML.characters[this.who].statusEffects), ["Stunned", "Grappled", "Held", "Holding", "Pinned", "Taken Down", "Overborne"]));
  if (_.intersection( _.keys(state.MML.characters[this.who].statusEffects), ["Stunned", "Grappled", "Held", "Holding", "Pinned", "Taken Down", "Overborne"]).length === 0 ||
    !MML.isUnarmed(state.MML.characters[this.who])
  ) {
    buttons.push({
      text: "With Weapon: " + attackChance + "%",
      nextMenu: "menuIdle",
      callback: function(input) {
        MML.processCommand({
          type: "character",
          who: this.who,
          callback: "grappleDefenseWeaponRoll",
          input: {
            attackChance: attackChance
          }
        });
      }
    });
  }
  buttons.push({
    text: "Brawl: " + brawlChance + "%",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "grappleDefenseBrawlRoll",
        input: {
          brawlChance: brawlChance
        }
      });
    }
  });
  buttons.push({
    text: "Take it",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "forgoDefense",
        input: {
          rollName: "brawlDefenseRoll"
        }
      });
    }
  });
  this.buttons = buttons;
};
MML.charMenuMajorWoundRoll = function charMenuMajorWoundRoll(input) {
  this.who = input.who;
  this.message = "Major Wound Roll.";
  this.buttons = [{
    text: "Roll Willpower",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "majorWoundRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuDisablingWoundRoll = function charMenuDisablingWoundRoll(input) {
  this.who = input.who;
  this.message = "Disabling Wound Roll.";
  this.buttons = [{
    text: "Roll System Strength",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "disablingWoundRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuWoundFatigueRoll = function charMenuWoundFatigueRoll(input) {
  this.who = input.who;
  this.message = "Wound Fatigue Roll.";
  this.buttons = [{
    text: "Roll System Strength",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "multiWoundRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuSensitiveAreaRoll = function charMenuSensitiveAreaRoll(input) {
  this.who = input.who;
  this.message = "Sensitive Area Roll.";
  this.buttons = [{
    text: "Roll Willpower",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "sensitiveAreaRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuKnockdownRoll = function charMenuKnockdownRoll(input) {
  this.who = input.who;
  this.message = "Knockdown Roll.";
  this.buttons = [{
    text: "Roll System Strength",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "knockdownRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuFatigueRoll = function charMenuFatigueRoll(input) {
  this.who = input.who;
  this.message = "Fatigue Roll.";
  this.buttons = [{
    text: "Roll Fitness",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "fatigueCheckRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuFatigueRecoveryRoll = function charMenuFatigueRecoveryRoll(input) {
  this.who = input.who;
  this.message = "Fatigue Recovery Roll.";
  this.buttons = [{
    text: "Roll Health",
    nextMenu: "menuIdle",
    callback: function(input) {
      MML.processCommand({
        type: "character",
        who: this.who,
        callback: "fatigueRecoveryRoll",
        input: {}
      });
    }
  }];
};
MML.charMenuObserveAction = function charMenuObserveAction(input) {
  this.who = input.who;
  this.message = this.who + " observes the situation.";
  this.buttons = [MML.menuButtons.endAction];
};

MML.menuButtons = {};
MML.menuButtons.GmMenuMain = {
  text: "GmMenuMain",
  nextMenu: "GmMenuMain",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.combatMenu = {
  text: "Combat",
  nextMenu: "GmMenuCombat",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.newCharacterMenu = {
  text: "New Character",
  nextMenu: "GmMenuNewCharacter",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};

MML.menuButtons.newItemMenu = {
  text: "New Item",
  nextMenu: "GmMenuNewItem",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.newWeapon = {
  text: "Weapon",
  nextMenu: "GmMenuNewWeapon",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};

MML.menuButtons.newShield = {
  text: "Shield",
  nextMenu: "GmMenuNewShield",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.newArmor = {
  text: "Armor",
  nextMenu: "GmMenuNewArmor",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.newSpellComponent = {
  text: "Spell Component",
  nextMenu: "GmMenuNewSpellComponent",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.newMiscItem = {
  text: "Misc",
  nextMenu: "GmMenuNewMiscItem",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.itemQualityPoor = {
  text: "Poor",
  nextMenu: "GmMenuNewItemProperties",
  callback: function(input) {
    state.MML.GM.newItem.quality = input.text;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.itemQualityStandard = {
  text: "Standard",
  nextMenu: "GmMenuNewItemProperties",
  callback: function(input) {
    state.MML.GM.newItem.quality = input.text;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.itemQualityExcellent = {
  text: "Excellent",
  nextMenu: "GmMenuNewItemProperties",
  callback: function(input) {
    state.MML.GM.newItem.quality = input.text;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.itemQualityMasterWork = {
  text: "Master Work",
  nextMenu: "GmMenuNewItemProperties",
  callback: function(input) {
    state.MML.GM.newItem.quality = input.text;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.assignNewItem = {
  text: "Assign Item",
  nextMenu: "GmMenuMain",
  callback: function(input) {
    input.charName = this.name;
    input.callback = "assignNewItem";
    MML.displayTargetSelection(input);
  }
};

MML.menuButtons.worldMenu = {
  text: "World",
  nextMenu: "GmMenuWorld",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.utilitiesMenu = {
  text: "Utilities",
  nextMenu: "GmMenuUtilities",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.startCombat = {
  text: "Start Combat",
  nextMenu: "GmMenuMain",
  callback: function(input) {
    MML.processCommand({
      type: "GM",
      callback: "startCombat",
      input: input
    });
  }
};
MML.menuButtons.toMainGmMenu = {
  text: "Back",
  nextMenu: "GmMenuMain",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};

MML.menuButtons.startRound = {
  text: "Start Round",
  nextMenu: "GmMenuStartRound",
  callback: function(input) {
    MML.processCommand({
      type: "GM",
      callback: "startRound",
      input: {}
    });
  }
};
MML.menuButtons.endCombat = {
  text: "End Combat",
  nextMenu: "GmMenuMain",
  callback: function(input) {
    MML.processCommand({
      type: "GM",
      callback: "endCombat",
      input: {}
    });
  }
};
MML.menuButtons.setActionAttack = {
  text: "Attack",
  nextMenu: "charMenuAttack",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "action",
        value: {
          name: "Attack",
          getTargets: "getSingleTarget",
          callback: "startAttackAction",
          modifiers: []
        }
      }
    });
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.setActionCast = {
  text: "Cast",
  nextMenu: "charMenuCast",
  callback: function(input) {
    state.MML.characters[this.who].action.name = input.text;
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.setActionReadyItem = {
  text: "Ready Item",
  nextMenu: "charMenuReadyItem",
  callback: function(input) {
    state.MML.characters[this.who].action.name = input.text;
    sendChat("", "Ready Item not ready...lol");
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.setActionObserve = {
  text: "Observe",
  nextMenu: "charMenuFinalizeAction",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "action",
        value: {
          name: "Observe",
          callback: "observeAction",
          modifiers: []
        }
      }
    });
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.changeAction = {
  text: "Change Action",
  nextMenu: "charMenuPrepareAction",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.actionPrepared = {
  text: "Ready",
  nextMenu: "charMenuPrepareAction",
  callback: function(input) {
    state.MML.characters[this.who].ready = true;
    state.MML.characters[this.who].updateCharacter("ready");
    state.MML.characters[this.who].updateCharacter("action");
    this.characterIndex++;
    if (this.characterIndex < this.combatants.length) {
      MML.charMenuPrepareAction.apply(this, [this.combatants[this.characterIndex]]);
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    } else if (this.name === state.MML.GM.player) {
      MML.GmMenuStartRound.apply(this, ["GM"]);
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    } else {
      this.menu = "menuIdle";
      MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
      });
    }
  }
};

MML.menuButtons.chooseTargets = {
  text: "Choose Targets",
  nextMenu: "charMenuChooseTargets",
  callback: function(input) {
    MML.processCommand({
      type: "player",
      who: this.name,
      callback: "displayMenu",
      input: {}
    });
  }
};
MML.menuButtons.acceptAction = {
  text: "Accept",
  nextMenu: "menuIdle",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "ready",
        value: true
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "updateCharacter",
      input: {
        attribute: "action"
      }
    });
    MML.processCommand({
      type: "GM",
      callback: "nextAction",
      input: {}
    });
  }
};
MML.menuButtons.endAction = {
  text: "End Action",
  nextMenu: "charMenuPrepareAction",
  callback: function(input) {
    MML.endAction();
  }
};
MML.menuButtons.initiativeRoll = {
  text: "Roll",
  nextMenu: "menuIdle",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "initiativeRoll",
      input: {}
    });
  }
};

MML.menuButtons.acceptRoll = {
  text: "Accept",
  nextMenu: "menuIdle",
  callback: function(input) {
    MML[this.currentRoll.applyResult].apply(this, []);
  }
};

MML.menuButtons.changeRoll = {
  text: "Change",
  nextMenu: "menuIdle",
  callback: function(input) {
    MML.displayGmRoll.apply(this, []);
  }
};

MML.menuButtons.rollHitPosition = {
  text: "Roll",
  nextMenu: "charMenuRollDamage",
  callback: function(input) {
    MML.getHitPositionRoll.apply(state.MML.GM, []);
  }
};
MML.menuButtons.setProne = {
  text: "Prone",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Prone"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.setCrawl = {
  text: "Crawl",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Crawl"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.setStalk = {
  text: "Stalk",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Stalk"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.setWalk = {
  text: "Walk",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Walk"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.setJog = {
  text: "Jog",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Jog"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.setRun = {
  text: "Run",
  nextMenu: "menuCombatMovement",
  callback: function(input) {
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "setApiCharAttribute",
      input: {
        attribute: "movementPosition",
        value: "Run"
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "displayMovement",
      input: {}
    });
  }
};
MML.menuButtons.endMovement = {
  text: "End Movement",
  nextMenu: "menuIdle",
  callback: function(input) {
    var path = getObj('path', state.MML.characters[this.who].pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
    MML.processCommand({
      type: "GM",
      callback: "displayThreatZones",
      input: {
        toggle: false
      }
    });
    MML.processCommand({
      type: "character",
      who: this.who,
      callback: "startAction",
      input: {}
    });
  }
};
MML.menuButtons.defenseBlock = {
  text: "Block",
  nextMenu: "menuIdle",
  callback: function(input) {
    state.MML.characters[this.who].defense.style = "Block";
    state.MML.characters[this.who].defense.number++;
    MML.getDefenseRoll.apply(state.MML.GM, []);
  }
};
MML.menuButtons.defenseDodge = {
  text: "Dodge",
  nextMenu: "menuIdle",
  callback: function(input) {
    state.MML.characters[this.who].defense.style = "Dodge";
    state.MML.characters[this.who].defense.number++;
    state.MML.characters[this.who].defense.dodge = true;
    MML.getDefenseRoll.apply(state.MML.GM, []);
  }
};
MML.menuButtons.defenseTakeIt = {
  text: "Take It",
  nextMenu: "menuIdle",
  callback: function(input) {
    state.MML.characters[this.who].defense.style = "Take It";
    MML.getDefenseRoll.apply(state.MML.GM, []);
  }
};

MML.GmMenuWorld = function world(input) {
  //pass time, travel, other stuff
};

MML.GmMenuUtilities = function utilities(input) {
  //edit states and other api stuff
};
on("ready", function() {
  MML.init();

  on("add:character", function(character) {
    var charName = character.get("name");
    MML.createAttribute("player", state.MML.GM.player, "", character);
    MML.createAttribute("name", charName, "", character);
    MML.createAttribute("race", "Human", "", character);
    MML.createAttribute("gender", "Male", "", character);
    MML.createAttribute("statureRoll", 6, "", character);
    MML.createAttribute("strengthRoll", 6, "", character);
    MML.createAttribute("coordinationRoll", 6, "", character);
    MML.createAttribute("healthRoll", 6, "", character);
    MML.createAttribute("beautyRoll", 6, "", character);
    MML.createAttribute("intellectRoll", 6, "", character);
    MML.createAttribute("reasonRoll", 6, "", character);
    MML.createAttribute("creativityRoll", 6, "", character);
    MML.createAttribute("presenceRoll", 6, "", character);
    MML.createAttribute("fomInitBonus", 6, "", character);
    MML.createAttribute("rightHand", JSON.stringify({
      _id: "emptyHand"
    }), "", character);
    MML.createAttribute("leftHand", JSON.stringify({
      _id: "emptyHand"
    }), "", character);

    state.MML.characters[charName] = new MML.characterConstructor(charName);

    MML.processCommand({
      type: "character",
      who: charName,
      callback: "updateCharacter",
      input: {
        attribute: "race"
      }
    });
  });

  on("add:attribute", function(attribute) {
    var characterObject = getObj("character", attribute.get("_characterid"));
    var charName = characterObject.get("name");
    var attrName = attribute.get("name");

    if (attrName.indexOf("repeating_skills") !== -1) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "updateCharacter",
        input: {
          attribute: "skills"
        }
      });
    } else if (attrName.indexOf("repeating_weaponskills") !== -1) {
      MML.processCommand({
        type: "character",
        who: charName,
        callback: "updateCharacter",
        input: {
          attribute: "weaponSkills"
        }
      });
    }
  });

  on("chat:message", function(msg) {
    MML.parseCommand(msg);
  });

  on("change:token", function(obj, prev) {
    if (obj.get("left") !== prev["left"] && obj.get("top") !== prev["top"] && state.MML.GM.inCombat === true) {
      var charName = MML.getCharFromToken(obj);
      var character = state.MML.characters[charName];
      var left1 = prev["left"];
      var left2 = obj.get("left");
      var top1 = prev["top"];
      var top2 = obj.get("top");
      var distance = MML.getDistance(left1, left2, top1, top2);
      var distanceAvailable = MML.movementRates[character.race][character.movementPosition] * character.movementAvailable;

      if (state.MML.GM.actor === charName && distanceAvailable > 0) {
        // If they move too far, move the maxium distance in the same direction
        if (distance > distanceAvailable) {
          left3 = Math.floor(((left2 - left1) / distance) * distanceAvailable + left1 + 0.5);
          top3 = Math.floor(((top2 - top1) / distance) * distanceAvailable + top1 + 0.5);
          obj.set("left", left3);
          obj.set("top", top3);

          MML.processCommand({
            type: "character",
            who: charName,
            callback: "setApiCharAttribute",
            input: {
              attribute: "movementAvailable",
              value: 0
            }
          });
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "moveDistance",
          input: {
            distance: distance
          }
        });
      } else {
        obj.set("left", prev["left"]);
        obj.set("top", prev["top"]);
      }
    }
  });

  on("change:character:name", function(changedCharacter) {
    var newName = changedCharacter.get("name");
    var characters = findObjs({
      _type: "character",
      archived: false,
    }, {
      caseInsensitive: false
    });
    var apiNames = _.keys(state.MML.characters);
    var characterNames = [];

    _.each(characters, function(character) {
      characterNames.push(character.get("name"));
    });

    var oldName = _.difference(apiNames, characterNames)[0];

    state.MML.characters[newName] = state.MML.characters[oldName];
    delete state.MML.characters[oldName];
    state.MML.characters[newName].name = newName;
    MML.processCommand({
      type: "character",
      who: newName,
      callback: "updateCharacter",
      input: {
        attribute: "name"
      }
    });
  });

  on("change:attribute:current", function(attribute) {
    var characterObject = getObj("character", attribute.get("_characterid"));
    var charName = characterObject.get("name");
    var attrName = attribute.get("name");
    var roll;

    switch (attrName) {
      case "statureRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "stature"
          }
        });
        break;
      case "strengthRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "strength"
          }
        });
        break;
      case "coordinationRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "coordination"
          }
        });
        break;
      case "healthRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "health"
          }
        });
        break;
      case "beautyRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "beauty"
          }
        });
        break;
      case "intellectRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "intellect"
          }
        });
        break;
      case "reasonRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "reason"
          }
        });
        break;
      case "creativityRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "creativity"
          }
        });
        break;
      case "presenceRoll":
        roll = parseFloat(attribute.get("current"));
        if (isNaN(roll) || roll < 6) {
          roll = 6;
          MML.setCurrentAttribute(charName, attrName, roll);
        }
        MML.processCommand({
          type: "character",
          who: charName,
          callback: "updateCharacter",
          input: {
            attribute: "presence"
          }
        });
        break;
      default:
        if (attrName.indexOf("repeating_items") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "updateCharacter",
            input: {
              attribute: "inventory"
            }
          });
        } else if (attrName.indexOf("repeating_skills") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "updateCharacter",
            input: {
              attribute: "skills"
            }
          });
        } else if (attrName.indexOf("repeating_weaponskills") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "updateCharacter",
            input: {
              attribute: "weaponSkills"
            }
          });
        } else if (attrName.indexOf("repeating_statuseffects") !== -1) {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "updateCharacter",
            input: {
              attribute: "statusEffects"
            }
          });
        } else if (attrName != "tab") {
          MML.processCommand({
            type: "character",
            who: charName,
            callback: "updateCharacter",
            input: {
              attribute: attrName
            }
          });
        }
        break;
    }

  });
});
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
// Character Functions
MML.getCharFromName = function getCharFromName(charName) {
  var character = findObjs({
    _type: "character",
    archived: false,
    name: charName
  }, {
    caseInsensitive: false
  });

  return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, character) {
  return createObj("attribute", {
    name: name,
    current: current,
    max: max,
    characterid: character.id
  });
};

MML.createAttributesFromArray = function createAttributesFromArray(inputArray, character) {
  _.each(inputArray, function(attribute) {
    MML.createAttribute(attribute.name, attribute.current, attribute.max, character);
  });
};

MML.createAbility = function createAbility(name, action, istokenaction, character) {
  createObj("ability", {
    name: name,
    action: action,
    istokenaction: istokenaction,
    characterid: character.id
  });
};

MML.getCharAttribute = function getCharAttribute(charName, attribute) {
  var character = MML.getCharFromName(charName);
  var charAttribute = findObjs({
    _type: "attribute",
    _characterid: character.get("_id"),
    name: attribute
  }, {
    caseInsensitive: false
  })[0];

  if (typeof(charAttribute) === "undefined") {
    charAttribute = MML.createAttribute(attribute, "", "", MML.getCharFromName(charName));
  }

  return charAttribute;
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute) {
  return MML.getCharAttribute(charName, attribute).get("current");
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(charName, attribute) {
  var result = parseFloat(MML.getCurrentAttribute(charName, attribute));

  if (isNaN(result)) {
    MML.setCurrentAttribute(charName, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(charName, attribute) {
  var result = parseFloat(MML.getCharAttribute(charName, attribute).get("max"));

  if (isNaN(result)) {
    MML.setMaxAttribute(charName, attribute, 0);
    result = 0;
  }

  return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(charName, attribute) {
  var result = MML.getCurrentAttribute(charName, attribute);
  if (result === "true") {
    return true;
  } else {
    return false;
  }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(charName, attribute) {
  var result = MML.getCurrentAttribute(charName, attribute);

  try {
    result = JSON.parse(result);
  } catch (e) {
    MML.setCurrentAttribute(charName, attribute, "{}");
    result = {};
  }
  return result;
};

MML.getSkillAttributes = function getSkillAttributes(charName, skillType) {
  var character = MML.getCharFromName(charName);
  var attributes = findObjs({
    _type: "attribute",
    _characterid: character.get("_id")
  }, {
    caseInsensitive: false
  });
  var skills = {};
  var skill_data = {};

  _.each(attributes, function(attribute) {
    var attributeName = attribute.get("name");

    if (attributeName.indexOf("repeating_" + skillType) !== -1) {
      var attributeString = attributeName.split("_");
      var _id = attributeString[2];
      var property = attributeString[3];
      var value = attribute.get("current");
      _.each(skills, function(skill, key) {
        if (key.toLowerCase() === _id) {
          _id = key;
        }
      });
      if (_.isUndefined(skill_data[_id])) {
        skill_data[_id] = {
          name: "",
          input: 0,
          level: 0
        };
      }
      if (property === "name") {
        skill_data[_id][property] = value;
      } else if (isNaN(parseFloat(value))) {
        skill_data[_id][property] = 0;
      } else {
        skill_data[_id][property] = parseFloat(value);
      }
    }
  });
  _.each(skill_data, function(skill, _id) {
    if (skill.name !== "") {
      skills[skill.name] = {
        level: skill.level,
        input: skill.input,
        _id: _id
      };
    }
  });
  return skills;
};

MML.setCurrentAttribute = function setCurrentAttribute(charName, attribute, value) {
  MML.getCharAttribute(charName, attribute).set("current", value);
};

MML.setMaxAttribute = function setMaxAttribute(charName, attribute, value) {
  MML.getCharAttribute(charName, attribute).set("max", value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table) {
  return table[inputValue][attribute];
};

// Token Functions
MML.getCharFromToken = function getCharFromToken(token) {
  var tokenObject = getObj("graphic", token.id);
  var charName = getObj("character", tokenObject.get("represents"));

  if (_.isUndefined(charName)) {
    tokenObject.set("tint_color", "#FFFF00");
    sendChat("Error", "Selected Token(s) not associated to a character.");
  } else {
    charName = charName.get("name");
    return charName;
  }
};

MML.getTokenFromChar = function getTokenFromChar(charName) {
  var character = MML.getCharFromName(charName);

  var tokens = findObjs({
    _pageid: Campaign().get("playerpageid"),
    _type: "graphic",
    _subtype: "token",
    represents: character.get("_id")
  });

  return tokens[0];
};

MML.getSelectedTokens = function getSelectedTokens(selected) {
  tokens = [];

  var index;
  for (index in selected) {
    tokens.push(getObj("graphic", selected[index]._id));
  }
  return tokens;
};

MML.getSelectedCharNames = function getSelectedCharNames(selected) {
  characters = [];

  var index;
  _.each(selected, function(object) {
    if (object._type === "graphic") {
      characters.push(MML.getCharFromToken(getObj("graphic", object._id)));
    }
  });
  return characters;
};

MML.getDistance = function getDistance(left1, left2, top1, top2) {
  var pixelPerFoot = 14;
  var leftDistance = Math.abs(left2 - left1);
  var topDistance = Math.abs(top2 - top1);
  var distance = Math.sqrt(leftDistance * leftDistance + topDistance * topDistance) / pixelPerFoot;
  distance = Math.floor(distance + 0.5);
  return distance;
};

MML.drawCirclePath = function drawCirclePath(left, top, radius) {
  var pixelPerFoot = 14;
  radius *= pixelPerFoot;
  var pathArray = [
    ["M", left - radius, top],
    ["C", left - radius, top - (radius / 2), left - (radius / 2), top - radius, left, top - radius],
    ["C", left + (radius / 2), top - radius, left + radius, top - (radius / 2), left + radius, top],
    ["C", left + radius, top + (radius / 2), left + (radius / 2), top + radius, left, top + radius],
    ["C", left - (radius / 2), top + radius, left - radius, top + (radius / 2), left - radius, top]
  ];
  var path = createObj("path", {
    _path: JSON.stringify(pathArray),
    _pageid: Campaign().get("playerpageid"),
    layer: "map",
    stroke: "#FFFF00",
    width: radius * 2,
    height: radius * 2,
    top: top,
    left: left,
  });
  toFront(path);
  return path;
};

MML.displayAura = function displayAura(token, radius, auraNumber, color) {
  var auraRadius;
  var auraColor;
  if (auraNumber === 2) {
    auraRadius = "aura2_radius";
    auraColor = "aura2_color";
  } else {
    auraRadius = "aura1_radius";
    auraColor = "aura1_color";
  }
  token.set(auraRadius, radius);
  token.set(auraColor, color);
};

// Code borrowed from The Aaron from roll20.net forums
var generateUUID = (function() {
    "use strict";

    var a = 0,
      b = [];
    return function() {
      var c = (new Date()).getTime() + 0,
        d = c === a;
      a = c;
      for (var e = new Array(8), f = 7; 0 <= f; f--) {
        e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
        c = Math.floor(c / 64);
      }
      c = e.join("");
      if (d) {
        for (f = 11; 0 <= f && 63 === b[f]; f--) {
          b[f] = 0;
        }
        b[f]++;
      } else {
        for (f = 0; 12 > f; f++) {
          b[f] = Math.floor(64 * Math.random());
        }
      }
      for (f = 0; 12 > f; f++) {
        c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
      }
      return c;
    };
  }()),

  generateRowID = function() {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
  };

MML.hexify = function hexify(stringIn) {
  var stringOut = "";
  var i;
  for (i = 0; i < stringIn.length; i++) {
    stringOut += ("000" + stringIn.charCodeAt(i).toString(16)).slice(-4);
  }
  return stringOut;
};

MML.dehexify = function dehexify(hexIn) {
  var i;
  var hexes = hexIn.match(/.{1,4}/g) || [];
  var dehexed = "";
  for (i = 0; i < hexes.length; i++) {
    dehexed += String.fromCharCode(parseInt(hexes[i], 16));
  }

  return dehexed;
};

// Rolling Functions
MML.rollDice = function rollDice(amount, size) {
  var value = 0;

  for (i = 0; i < amount; i++) {
    value += randomInteger(size);
  }
  return value;
};

MML.rollDamage = function rollDamage(input) {
  var diceArray = input.damageDice.split("d");
  var amount = diceArray[0] * 1;
  var size = diceArray[1] * 1;
  var damageMod = 0;
  var value;

  var mod;
  _.each(input.mods, function(mod) {
    damageMod += mod;
  });

  if (input.crit) {
    value = MML.rollDice(amount, size) + amount * size + damageMod;
    range = (amount * size + amount + damageMod) + "-" + (2 * amount * size + damageMod);
  } else {
    value = MML.rollDice(amount, size) + damageMod;
    range = (amount + damageMod) + "-" + (amount * size + damageMod);
  }

  var roll = {
    type: "damage",
    character: this.name,
    accepted: false,
    value: value,
    result: -value,
    range: range,
    message: "Roll: " + value + "\nRange: " + range,
    callback: input.callback
  };

  MML.processCommand({
    type: "player",
    who: this.player,
    callback: "setApiPlayerAttribute",
    input: {
      attribute: "currentRoll",
      value: roll
    }
  });
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: input.callback,
    input: {}
  });
};

MML.universalRoll = function universalRoll(input) {
  // log("universalRoll");
  // log(input.callback);
  // log(input.mods);
  var target = 0;

  var mod;
  _.each(input.mods, function(mod) {
    target += mod;
  });

  var roll = {
    type: "universal",
    name: input.name,
    character: this.name,
    callback: input.callback,
    value: MML.rollDice(1, 100),
    range: "1-100",
    target: target,
    accepted: false
  };

  roll = MML.universalRollResult(roll);

  MML.processCommand({
    type: "player",
    who: this.player,
    callback: "setApiPlayerAttribute",
    input: {
      attribute: "currentRoll",
      value: roll
    }
  });
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: input.callback,
    input: {}
  });
};

MML.universalRollResult = function universalRollResult(roll) {
  if (roll.value > 94) {
    roll.result = "Critical Failure";
  } else {
    if (roll.value <= roll.target) {
      if (roll.value <= Math.round(roll.target / 10)) {
        roll.result = "Critical Success";
      } else {
        roll.result = "Success";
      }
    } else {
      roll.result = "Failure";
    }
  }

  roll.message = "Roll: " + roll.value +
    "\nTarget: " + roll.target +
    "\nResult: " + roll.result +
    "\nRange: " + roll.range;

  return roll;
};

MML.attributeCheckRoll = function attributeCheckRoll(input) {
  var attribute = input.attribute;
  var mods = input.mods;
  var callback = input.callback;
  var target = this[attribute];

  var mod;
  for (mod in mods) {
    target += mods[mod];
  }

  var roll = {
    type: "attribute",
    name: input.name,
    character: this.name,
    callback: callback,
    value: MML.rollDice(1, 20),
    range: "1-20",
    target: target,
    accepted: false
  };

  roll = MML.attributeCheckResult(roll);

  MML.processCommand({
    type: "player",
    who: this.player,
    callback: "setApiPlayerAttribute",
    input: {
      attribute: "currentRoll",
      value: roll
    }
  });
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: callback,
    input: {}
  });
};

MML.attributeCheckResult = function attributeCheckResult(roll) {
  if ((roll.value <= roll.target || roll.value === 1) && (roll.value !== 20)) {
    roll.result = "Success";
  } else {
    roll.result = "Failure";
  }

  roll.message = "Roll: " + roll.value +
    "\nTarget: " + roll.target +
    "\nResult: " + roll.result +
    "\nRange: " + roll.range;

  return roll;
};

MML.displayGmRoll = function displayGmRoll(input) {
  sendChat(this.name, '/w "' + this.name + '" &{template:rollMenu} {{title=' + this.currentRoll.message + "}}");
  // if(this.currentRoll.type === "damage"){
  //     sendChat(this.name, '/w "' + this.player + '" &{template:damage} {{title=' + this.currentRoll.title + "}} {{value=" + this.currentRoll.value + "}} {{type=" + this.currentRoll.type + "}} {{range=" + this.currentRoll.range + "}} ");
  // }
  // else if(this.currentRoll.type === "universal" || this.currentRoll.type === "attribute"){
  //     sendChat(this.name, '/w "' + this.player + '" &{template:universal} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{target=" + this.currentRoll.target + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
  // }
  // else if(this.currentRoll.type === "hitPosition"){
  //     sendChat(this.name, '/w "' + this.player + '" &{template:hitPosition} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
  // }

};

//Menu Functions
MML.displayMenu = function displayMenu(input) {
  var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';

  _.each(this.buttons, function(button) {
    var noSpace = button.text.replace(/\s+/g, '');
    var command = JSON.stringify({
      type: "player",
      who: this.name,
      input: {
        who: this.who,
        buttonText: button.text
      },
      callback: "menuCommand"
    });

    toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!MML|' + MML.hexify(command) + ')}} ';
  }, this);
  sendChat(this.name, toChat, null, {
    noarchive: false
  }); //Change to true this when they fix the bug
};

MML.displayTargetSelection = function displayTargetSelection(input) {
  sendChat("", "&{template:selectTarget} {{charName=" + input.charName + "}} {{input=" + MML.hexify(JSON.stringify(input)) + "}}");
};
