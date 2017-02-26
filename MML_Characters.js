//Combat Functions
MML.displayRoll = function (callback) {
  var currentRoll = this.player.currentRoll;
  if (this.player.name === state.MML.GM.player) {
    if (currentRoll.accepted === false) {
      this.player.displayGmRoll(currentRoll);
    } else {
      this[callback](currentRoll);
    }
  } else {
    this.player.displayPlayerRoll(currentRoll);
    this[callback](currentRoll);
  }
};

MML.displayMovement = function() {
  var token = MML.getTokenFromChar(this.name);
  var path = getObj('path', this.pathID);

  if (!_.isUndefined(path)) {
    path.remove();
  }
  var pathID = MML.drawCirclePath(token.get('left'), token.get('top'), MML.movementRates[this.race][this.movementPosition] * this.movementAvailable).id;
  this.pathID = pathID;
};

MML.moveDistance = function(distance) {
  var remainingMovement = this.movementAvailable - (distance) / (MML.movementRates[this.race][this.movementPosition]);
  if (this.movementAvailable > 0) {
    this.movementAvailable = remainingMovement;
    this.displayMovement();
  } else {
    var path = getObj('path', this.pathID);
    if (!_.isUndefined(path)) {
      path.remove();
    }
  }
};

MML.newRoundUpdateCharacter = function() {
  if (_.has(this.statusEffects, 'Melee This Round')) {
    var fatigueRate = 1;
    if (_.has(this.statusEffects, 'Pinned')) {
      fatigueRate = 2;
    }
    this.roundsExertion = this.roundsExertion + fatigueRate;
    this.roundsRest = 0;

    if (!_.has(this.statusEffects, 'Fatigue')) {
      if (this.roundsExertion > this.fitness) {
        this.fatigueCheckRoll(0);
      }
    } else {
      if (this.roundsExertion > Math.round(this.fitness / 2)) {
        this.fatigueCheckRoll(-4);
      }
    }
  } else if (_.has(this.statusEffects, 'Fatigue')) {
    this.roundsRest = this.roundsRest + 1;

    if (this.roundsRest >= 6) {
      this.fatigueRecoveryRoll(0);
    }
  }

  // Reset knockdown number
  this.knockdown = this.knockdownMax;
  this.spentInitiative = 0;

  if (_.isUndefined(this.action.spell) || this.action.spell.actions < 2) {
    this.action = { modifiers: [] };
  }
  this.applyStatusEffects();
  this.setReady(false);
};

MML.setReady = function(ready) {
  if (state.MML.GM.inCombat === true && this.ready === 'false') {
    MML.getTokenFromChar(this.name).set('tint_color', '#FF0000');
  } else {
    MML.getTokenFromChar(this.name).set('tint_color', 'transparent');
  }
  return this.ready;
};

MML.setCombatVision = function() {
  var token = MML.getTokenFromChar(this.name);
  if (state.MML.GM.inCombat || !_.has(this.statusEffects, 'Observe')) {
    token.set('light_losangle', this.fov);
    token.set('light_hassight', true);
  } else {
    token.set('light_losangle', 360);
    token.set('light_hassight', true);
  }
};

MML.getSingleTarget = function() {
  MML.displayTargetSelection({ charName: this.name, callback: 'setCurrentCharacterTargets' });
};

MML.getSpellTargets = function() {
  MML.displayTargetSelection({ charName: this.name, callback: 'getAdditionalTarget' });
};

MML.getAdditionalTarget = function(target) {
  var targetArray;

  if (_.isUndefined(state.MML.GM.currentAction.targetArray)) {
    state.MML.GM.currentAction.targetArray = [target];
    state.MML.GM.currentAction.targetIndex = 0;
  } else {
    state.MML.GM.currentAction.targetArray.push(target);
  }

  this.player.charMenuAddTarget(this.name);
  this.player.displayMenu();
};

MML.setCurrentCharacterTargets = function(targets) {
  var targetArray;

  if (!_.isArray(targets)) {
    targetArray = [target];
  } else {
    targetArray = targets;
  }
  state.MML.GM.currentAction.targetArray = targetArray;
  state.MML.GM.currentAction.targetIndex = 0;
  this.action.callback();
};

// Health and Wounds
MML.alterHP = function(bodyPart, hpAmount) {
  var initialHP = this.hp[bodyPart];
  var currentHP = initialHP + hpAmount;
  var maxHP = this.hpMax[bodyPart];

  if (hpAmount < 0) { //if damage
    var duration;
    this.hp[bodyPart] = currentHP;

    //Wounds
    if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
      log('Major');
      if (initialHP >= Math.round(maxHP / 2) && !_.has(this.statusEffects, 'Major Wound, ' + bodyPart)) { //Fresh wound
        duration = Math.round(maxHP / 2) - currentHP;
      } else { //Add damage to duration of effect
        duration = parseInt(this.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
      }
      state.MML.GM.currentAction.woundDuration = duration;
      this.player.charMenuMajorWoundRoll(this.name);
      this.player.displayMenu();
    } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
      log('Disabling');
      if (!_.has(this.statusEffects, 'Disabling Wound, ' + bodyPart)) { //Fresh wound
        duration = -currentHP;
      } else { //Add damage to duration of effect
        duration = parseInt(this.statusEffects['Disabling Wound, ' + bodyPart].duration) - hpAmount;
      }
      state.MML.GM.currentAction.woundDuration = duration;
      this.player.charMenuDisablingWoundRoll(this.name);
      this.player.displayMenu();
    } else if (currentHP < -maxHP) { //Mortal wound
      log('Mortal');
      this.statusEffects['Mortal Wound, ' + bodyPart] = {
        id: generateRowID(),
        bodyPart: bodyPart
      };
      MML[state.MML.GM.currentAction.callback]();
    } else {
      log('Minor');
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

MML.setMultiWound = function() {
  var currentHP = this.hp;
  currentHP['Multiple Wounds'] = this.hpMax['Multiple Wounds'];

  _.each(MML.getBodyParts(this), function(bodyPart) {
    if (currentHP[bodyPart] >= Math.round(this.hpMax[bodyPart] / 2)) { //Only minor wounds apply
      currentHP['Multiple Wounds'] -= this.hpMax[bodyPart] - currentHP[bodyPart];
    } else {
      currentHP['Multiple Wounds'] -= this.hpMax[bodyPart] - Math.round(this.hpMax[bodyPart] / 2);
    }
  }, this);

  this.hp = currentHP;

  if (currentHP['Multiple Wounds'] < 0 && !_.has(this.statusEffects, 'Wound Fatigue')) {
    this.player.charMenuWoundFatigueRoll(this.name);
    this.player.displayMenu();
  } else {
    MML[state.MML.GM.currentAction.callback]();
  }
};

MML.multiWoundRoll = function() {
  this.attributeCheckRoll('systemStrength', [0], 'multiWoundRollResult');
};

MML.multiWoundRollResult = function() {
  this.displayRoll('multiWoundRollApply');
};

MML.multiWoundRollApply = function() {
  var result = this.player.currentRoll.result;
  state.MML.GM.currentAction.multiWoundRoll = result;
  if (result === 'Failure') {
    this.statusEffects['Wound Fatiuge'] = {
      id: generateRowID()
    };
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.majorWoundRoll = function() {
  this.attributeCheckRoll('Major Wound Willpower Roll', 'willpower', [0], 'majorWoundRollResult');
};

MML.majorWoundRollResult = function() {
  this.displayRoll('majorWoundRollApply');
};

MML.majorWoundRollApply = function() {
  var result = this.player.currentRoll.result;
  state.MML.GM.currentAction.woundRoll = result;
  var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;
  if (result === 'Failure') {
    this.statusEffects['Major Wound, ' + bodyPart] = {
      id: generateRowID(),
      duration: state.MML.GM.currentAction.woundDuration,
      startingRound: state.MML.GM.currentRound,
      bodyPart: bodyPart
    };
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.disablingWoundRoll = function() {
  this.attributeCheckRoll('Disabling Wound System Strength Roll', 'systemStrength', [0], 'disablingWoundRollResult');
};

MML.disablingWoundRollResult = function() {
  this.displayRoll('disablingWoundRollApply');
};

MML.disablingWoundRollApply = function() {
  var result = this.player.currentRoll.result;
  state.MML.GM.currentAction.woundRoll = result;
  var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;

  this.statusEffects['Disabling Wound, ' + bodyPart] = {
    id: generateRowID(),
    bodyPart: bodyPart
  };
  if (result === 'Failure') {
    this.statusEffects['Stunned'] = {
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound,
      duration: state.MML.GM.currentAction.woundDuration
    };
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.knockdownCheck = function(damage) {
  this.knockdown += damage;
  if (this.movementPosition !== 'Prone' && this.knockdown < 1) {
    this.knockdownRoll();
  } else {
    MML[state.MML.GM.currentAction.callback]();
  }
};

MML.knockdownRoll = function() {
  this.attributeCheckRoll('Knockdown System Strength Roll', 'systemStrength', [ _.has(this.statusEffects, 'Stumbling') ? -5 : 0 ], 'getKnockdownRoll');
};

MML.knockdownRollResult = function() {
  this.displayRoll('knockdownRollApply');
};

MML.knockdownRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Critical Failure' || result === 'Failure') {
    this.movementPosition = 'Prone';
  } else {
    this.statusEffects['Stumbling'] = {
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound
    };
  }

  MML[state.MML.GM.currentAction.callback]();
};

MML.sensitiveAreaCheck = function(hitPosition) {
  if (MML.sensitiveAreas[this.bodyType].indexOf(hitPosition) > -1) {
    this.sensitiveAreaRoll();
  } else {
    MML[state.MML.GM.currentAction.callback]();
  }
};

MML.sensitiveAreaRoll = function() {
  this.attributeCheckRoll('Sensitive Area Willpower Roll', 'willpower', [0], 'sensitiveAreaRollResult');
};

MML.sensitiveAreaRollResult = function() {
  this.displayRoll('sensitiveAreaRollApply');
};

MML.sensitiveAreaRollApply = function() {
  var result = this.player.currentRoll.result;
  if (result === 'Critical Failure' || result === 'Failure') {
    this.statusEffects['Sensitive Area'] = {
      id: generateRowID(),
      startingRound: state.MML.GM.currentRound
    };
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.alterEP = function(epAmount) {
  this.ep += epAmount;

  if (this.ep < Math.round(0.75 * this.epMax)) {
    this.fatigueCheckRoll(0);
  } else {
    MML[state.MML.GM.currentAction.callback]();
  }
};

MML.fatigueCheckRoll = function(modifier) {
  this.attributeCheckRoll('Fatigue Check Fitness Roll', 'fitness', [modifier], 'fatigueCheckRollResult');
};

MML.fatigueCheckRollResult = function() {
  this.displayRoll('fatigueCheckRollApply');
};

MML.fatigueCheckRollApply = function() {
  var result = this.player.currentRoll.result;
  if (result === 'Critical Failure' || result === 'Failure') {
    this.statusEffects['Fatigue'] = {
        value: {
          id: _.has(this.statusEffects, 'Fatigue') ? this.statusEffects['Fatigue'].id : generateRowID(),
          name: 'Fatigue',
          level: _.has(this.statusEffects, 'Fatigue') ? this.statusEffects['Fatigue'].level + 1 : 1
        }
      };
    this.roundsExertion = 0;
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.fatigueRecoveryRoll = function(modifier) {
  this.attributeCheckRoll('Fatigue Recovery Check Health Roll', 'health', [modifier], 'fatigueRecoveryRollResult');
};

MML.fatigueRecoveryRollResult = function() {
  this.displayRoll('fatigueRecoveryRollApply');
};

MML.fatigueRecoveryRollApply = function() {
  var result = this.player.currentRoll.result;
  if (result === 'Critical Success' || result === 'Success') {
    this.roundsRest = 0;
    this.roundsExertion = 0;
    this.statusEffects['Fatigue'].level--;
  }
  MML[state.MML.GM.currentAction.callback]();
};

MML.armorDamageReduction = function(position, damage, type, coverageRoll) {
  var damageApplied = false; //Accounts for partial coverage, once true the loop stops
  var damageDeflected = 0;
  log(this.apv);
  log(position);
  // Iterates over apv values at given position (accounting for partial coverage)
  var apv;
  for (apv in this.apv[position][type]) {
    if (damageApplied === false) {
      if (coverageRoll <= this.apv[position][type][apv].coverage) { //if coverage roll is less than apv coverage
        damageDeflected = this.apv[position][type][apv].value;

        //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
        if (damage + damageDeflected >= 0) {
          //If surface, cut, or pierce, cut in half and apply as impact
          if (type === 'Surface' || type === 'Cut' || type === 'Pierce') {
            damage = Math.ceil(damage / 2);
            damageDeflected = this.apv[position].Impact[apv].value;

            if (damage + damageDeflected >= 0) {
              damageDeflected = -damage;
              damage = 0;
            }
          }
          //If chop, or thrust, apply 3/4 as impact
          else if (type === 'Chop' || type === 'Thrust') {
            damage = Math.ceil(damage * 0.75);
            damageDeflected = this.apv[position].Impact[apv].value;

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

MML.initiativeRoll = function() {
  var rollValue = MML.rollDice(1, 10);
  this.setAction();

  this.player.currentRoll = {
    character: this.name,
    name: 'initiative',
    value: rollValue,
    callback: 'initiativeResult',
    range: '1-10',
    accepted: false
  };
  this.name.initiativeResult();
};

MML.initiativeResult = function() {
  this.player.rollResult =
    currentRoll.value +
    this.situationalInitBonus +
    this.movementRatioInitBonus +
    this.attributeInitBonus +
    this.senseInitBonus +
    this.fomInitBonus +
    this.firstActionInitBonus +
    this.spentInitiative;

  this.player.message =
    'Roll: ' + currentRoll.value +
    '\nResult: ' + currentRoll.rollResult +
    '\nRange: ' + currentRoll.range;

  this.displayRoll('initiativeApply');
};

MML.initiativeApply = function() {
  MML.processCommand({
    type: 'character',
    who: this.name,
    callback: 'setApiCharAttribute',
    input: {
      attribute: 'initiativeRoll',
      value: this.player.currentRoll.value
    }
  });
  MML.processCommand({
    type: 'character',
    who: this.name,
    callback: 'setApiCharAttribute',
    input: {
      attribute: 'ready',
      value: true
    }
  });
  MML.processCommand({
    type: 'player',
    who: this.player,
    callback: 'prepareNextCharacter',
    input: {}
  });
};

MML.startAction = function() {
  state.MML.GM.currentAction = {
    character: this
  };

  if (_.contains(this.action.modifiers, 'Release Opponent')) {
    var targetName = _.has(this.statusEffects, 'Holding') ? this.statusEffects['Holding'].targets[0] : this.statusEffects['Grappled'].targets[0];
    state.MML.GM.currentAction.parameters = { target: MML.characters[targetName] };
    this.releaseOpponentAction();
  } else if (this.action.name === 'Cast') {
    if (this.action.spell.actions > 1) {
      this.action.spell.actions += -1;
    } else {
      var currentAction = {
        callback: 'castAction',
        parameters: {
          spell: this.action.spell,
          casterSkill: this.action.skill,
          epCost: MML.getEpCost(this.action.skillName, this.action.skill, this.action.spell.ep),
          metaMagic: {
            base: {
              epMod: 1,
              castingMod: 0
            }
          }
        },
        rolls: {}
      };

      state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
      this.player.charMenuMetaMagic(this.name);
      this.player.displayMenu();
    }
  } else if (!_.isUndefined(this.action.getTargets)) {
    this.action.getTargets();
  } else {
    this.action.callback();
  }
};

MML.chooseSpellTargets = function() {
  if (['Caster', 'Touch', 'Single'].indexOf(this.action.spell.target) > -1) {
    this.getSpellTargets();
  } else if (this.action.spell.target.indexOf('\' Radius') > -1) {
    this.getRadiusSpellTargets(parseInt(this.action.spell.target.replace('\' Radius', '')));
  } else {
    this.action.callback();
  }
};

MML.startCastAction = function() {
  state.MML.GM.currentAction.parameters.target = MML.characters[state.MML.GM.currentAction.targetArray[0]];
  MML[state.MML.GM.currentAction.callback]();
};

MML.startAttackAction = function(target) {
  if (_.has(this.statusEffects, 'Called Shot') || this.action.weaponType === 'Place a Hold' || this.action.weaponType === 'Head Butt') {
    this.player.charMenuSelectBodyPart(this.name);
    this.player.displayMenu();
  } else if (_.has(this.statusEffects, 'Called Shot Specific')) {
    this.player.charMenuSelectHitPosition(this.name);
    this.player.displayMenu();
  } else if (_.contains(this.action.modifiers, ['Aim'])) {
    if (_.has(this.statusEffects, 'Taking Aim')) {
      this.statusEffects['Taking Aim'].level++;
    } else {
      this.statusEffects['Taking Aim'] = {
        id: generateRowID(),
        name: 'Taking Aim',
        level: 1,
        target: target
      };
    }
  } else {
    this.processAttack();
  }
};

MML.processAttack = function() {
  this.statusEffects['Melee This Round']({
    id: generateRowID(),
    name: 'Melee This Round'
  });

  if (['Punch', 'Kick', 'Head Butt', 'Bite'].indexOf(this.action.weaponType) > -1) {
    this.unarmedAttack();
  } else if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(this.action.weaponType) > -1) {
    this.grappleAttack();
  } else if (MML.isDualWielding(this)) {
    this.dualWieldAttack();
  } else if (MML.getWeaponFamily(this, 'leftHand') === 'MWD' || MML.getWeaponFamily(this, 'leftHand') === 'MWM') {
    this.missileAttack();
  } else if (MML.getWeaponFamily(this, 'leftHand') === 'TWH' ||
    MML.getWeaponFamily(this, 'rightHand') === 'TWH' ||
    MML.getWeaponFamily(this, 'leftHand') === 'TWK' ||
    MML.getWeaponFamily(this, 'rightHand') === 'TWK' ||
    MML.getWeaponFamily(this, 'leftHand') === 'TWS' ||
    MML.getWeaponFamily(this, 'rightHand') === 'TWS' ||
    MML.getWeaponFamily(this, 'leftHand') === 'SLI' ||
    MML.getWeaponFamily(this, 'rightHand') === 'SLI') {
    this.throwingAttack();
  } else {
    this.meleeAttack();
  }
};

MML.meleeAttack = function() {
  var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);

  var currentAction = {
    character: this,
    callback: 'meleeAttackAction',
    parameters: {
      attackerWeapon: characterWeaponInfo.characterWeapon,
      attackerSkill: characterWeaponInfo.skill,
      target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
    },
    rolls: {}
  };

  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  MML[currentAction.callback]();
};

MML.meleeAttackRoll = function(rollName, character, task, skill) {
  this.universalRoll(rollName, 'attackRollResult', [task, skill, character.situationalMod, character.meleeAttackMod, character.attributeMeleeAttackMod]);
};

MML.missileAttack = function() {
  var target = MML.characters[state.MML.GM.currentAction.targetArray[0]];
  var range = MML.getDistanceBetweenChars(this.name, target.name);
  var task;
  var itemId;
  var grip;

  if (MML.getWeaponFamily(this, 'rightHand') !== 'unarmed') {
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
    type: 'weapon',
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
    callback: 'missileAttackAction',
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

MML.missileAttackRoll = function(rollName, task, skill, target) {
  var mods = [task, skill, this.situationalMod, this.missileAttackMod, this.attributeMissileAttackMod];
  if (_.has((target.statusEffects, 'Shoot From Cover'))) {
    mods.push(-20);
  }
  this.universalRoll(rollName, 'attackRollResult', mods);
};

MML.unarmedAttack = function() {
  var attackType;
  switch (this.action.weaponType) {
    case 'Punch':
      attackType = MML.unarmedAttacks['Punch'];
      break;
    case 'Kick':
      attackType = MML.unarmedAttacks['Kick'];
      break;
    case 'Head Butt':
      attackType = MML.unarmedAttacks['Head Butt'];
      break;
    case 'Bite':
      attackType = MML.unarmedAttacks['Bite'];
      break;
    default:
  }
  var currentAction = {
    character: this,
    callback: 'unarmedAttackAction',
    parameters: {
      attackType: attackType,
      attackerSkill: this.action.skill,
      target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
    },
    rolls: {}
  };
  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  MML[currentAction.callback]();
};

MML.grappleAttack = function() {
  var attackType;
  switch (this.action.weaponType) {
    case 'Grapple':
      attackType = MML.unarmedAttacks['Grapple'];
      break;
    case 'Place a Hold':
      if (['Chest', 'Abdomen'].indexOf(state.MML.GM.currentAction.calledShot)) {
        attackType = MML.unarmedAttacks['Place a Hold, Chest, Abdomen'];
      } else {
        attackType = MML.unarmedAttacks['Place a Hold, Head, Arm, Leg'];
      }
      break;
    case 'Break a Hold':
      attackType = MML.unarmedAttacks['Break a Hold'];
      break;
    case 'Break Grapple':
      attackType = MML.unarmedAttacks['Break Grapple'];
      break;
    case 'Takedown':
      attackType = MML.unarmedAttacks['Takedown'];
      break;
    case 'Regain Feet':
      attackType = MML.unarmedAttacks['Regain Feet'];
      break;
    default:
      break;
  }
  var currentAction = {
    character: this,
    callback: 'grappleAttackAction',
    parameters: {
      attackType: attackType,
      attackerSkill: this.action.skill,
      target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
    },
    rolls: {}
  };
  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  MML[currentAction.callback]();
};

MML.attackRollResult = function() {
  var currentRoll = this.player.currentRoll;

  if (this.player.name === state.MML.GM.player) {
    if (currentRoll.accepted === false) {
      this.player.displayGmRoll(currentRoll);
    } else {
      if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
        this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
        this.action.modifiers.push('Called Shot');
        currentRoll.result = 'Success';
      }
      this.attackRollApply();
    }
  } else {
    this.player.displayPlayerRoll(currentRoll);
    if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
      this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
      this.action.modifiers.push('Called Shot');
      currentRoll.result = 'Success';
    }
    this.attackRollApply();
  }
};

MML.attackRollApply = function() {
  state.MML.GM.currentAction.rolls.attackRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.hitPositionRoll = function() {
  var rollValue;
  var range;
  var result;
  var action = state.MML.GM.currentAction;
  var target = MML.characters[action.targetArray[action.targetIndex]];

  if (_.contains(this.action.modifiers, ['Called Shot Specific'])) {
    rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === action.calledShot;
    }));
    range = rollValue + '-' + rollValue;
    result = MML.hitPositions[target.bodyType][rollValue];
  } else if (_.contains(this.action.modifiers, 'Called Shot')) {
    var rangeUpper = MML.getAvailableHitPositions(target, action.calledShot).length;
    rollValue = MML.rollDice(1, rangeUpper);
    range = '1-' + rangeUpper;
    result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
  } else {
    range = '1-' + _.keys(MML.hitPositions[target.bodyType]).length;
    result = MML.getHitPosition(target, MML.rollDice(1, 100));
    rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
      return hitPosition.name === result.name;
    }));
  }
  this.player.currentRoll ={
    type: 'hitPosition',
    character: this.name,
    player: this.player,
    callback: 'hitPositionRollResult',
    range: range,
    result: result,
    value: rollValue,
    accepted: false
  };
  this.hitPositionRollResult();
};

MML.hitPositionRollResult = function() {
  var currentRoll = this.player.currentRoll;
  var action = state.MML.GM.currentAction;
  var target = MML.characters[action.targetArray[action.targetIndex]];

  if (_.has(this.statusEffects, 'Called Shot')) {
    currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, action.calledShot);
  } else {
    currentRoll.result = MML.hitPositions[target.bodyType][currentRoll.value];
  }

  currentRoll.message = 'Roll: ' + currentRoll.value +
    '\nResult: ' + currentRoll.result.name +
    '\nRange: ' + currentRoll.range;

    this.player.currentRoll = currentRoll;
    this.displayRoll(hitPositionRollApply);
};

MML.hitPositionRollApply = function(currentRoll) {
  state.MML.GM.currentAction.rolls.hitPositionRoll = currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.meleeDefense = function(defender, attackerWeapon) {
  var itemId;
  var grip;
  var defenderWeapon;
  var dodgeChance;
  var blockChance;
  var dodgeSkill;
  var blockSkill;
  var defaultMartialSkill = defender.weaponSkills['Default Martial'].level;
  var shieldMod = MML.getShieldDefenseBonus(defender);
  var defenseMod = defender.meleeDefenseMod + defender.attributeDefenseMod;
  var sitMod = defender.situationalMod;

  defender.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

  if (!_.isUndefined(defender.weaponSkills['Dodge']) && defaultMartialSkill < defender.weaponSkills['Dodge'].level) {
    dodgeChance = defender.weaponSkills['Dodge'].level + defenseMod + sitMod;
  } else {
    dodgeChance = defaultMartialSkill + defenseMod + sitMod;
  }

  if (attackerWeapon.initiative < 6) {
    dodgeChance += 15;
  }

  if (MML.isDualWielding(defender)) {
    log('Dual Wield defense');
  } else if (MML.isUnarmed(defender) || MML.isWieldingRangedWeapon(defender)) {
    blockChance = 0;
  } else {
    if (MML.getWeaponFamily(defender, 'rightHand') !== 'unarmed') {
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

  if (attackerWeapon.family === 'Flexible') {
    dodgeChance += -10;
    blockChance += -10;
  } else if (attackerWeapon.family === 'Unarmed') {
    dodgeChance += attackerWeapon.defenseMod;
    blockChance += attackerWeapon.defenseMod;
  }

  defender.player.charMenuMeleeDefenseRoll(defender.name, dodgeChance, blockChance);
  defender.player.displayMenu();
};

MML.meleeBlockRoll = function(blockChance) {
  this.universalRoll('meleeBlockRollResult', [blockChance]);
};

MML.meleeBlockRollResult = function() {
  displayRoll('meleeBlockRollApply');
};

MML.meleeBlockRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(this.statusEffects, 'Number of Defenses')) {
      this.statusEffects['Number of Defenses'].number++;
    } else {
      this.statusEffects['Number of Defenses'] = {
        id: generateRowID(),
        number: 1
      };
    }
  }

  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.meleeDodgeRoll = function(dodgeChance) {
  this.universalRoll.meleeDodgeRollResult([dodgeChance]);
};

MML.meleeDodgeRollResult = function() {
  displayRoll('meleeDodgeRollApply');
};

MML.meleeDodgeRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(this.statusEffects, 'Number of Defenses')) {
      this.statusEffects['Number of Defenses'].number++;
    } else {
      this.statusEffects['Number of Defenses'] = {
        id: generateRowID(),
        number: 1
      };
    }
    if (!_.has(this.statusEffects, 'Dodged This Round')) {
      this.statusEffects['Dodged This Round'] = {
        id: generateRowID(),
      };
    }
  }

  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.rangedDefense = function(defender, attackerWeapon, range) {
  var defenseChance;
  var defaultMartialSkill = defender.weaponSkills['Default Martial'].level;
  var shieldMod = MML.getShieldDefenseBonus(defender);
  var defenseMod = defender.rangedDefenseMod + defender.attributeDefenseMod;
  var sitMod = defender.situationalMod;
  var rangeMod;

  defender.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

  if (!_.isUndefined(defender.skills['Dodge']) && defender.skills['Dodge'].level >= defaultMartialSkill) {
    defenseChance = defender.weaponSkills['Dodge'].level + defenseMod + sitMod + shieldMod;
  } else {
    defenseChance = defaultMartialSkill + defenseMod + sitMod + shieldMod;
  }

  if (attackerWeapon.family === 'MWD' || attackerWeapon.family === 'MWM') {
    rangeMod = Math.floor(range / 75);

    if (rangeMod > 3) {
      rangeMod = 3;
    }
    defenseChance += rangeMod;
  } else if (attackerWeapon.family === 'TWH') {
    rangeMod = Math.floor(range / 5);

    if (rangeMod > 5) {
      rangeMod = 5;
    }
    defenseChance += rangeMod + 25;
  } else if (attackerWeapon.family === 'TWK') {
    rangeMod = Math.floor(range / 5);

    if (rangeMod > 3) {
      rangeMod = 3;
    }
    defenseChance += rangeMod + 15;
  } else if (attackerWeapon.family === 'TWS') {
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

  defender.player.charMenuRangedDefenseRoll(defender.name, defenseChance);
  defender.player.displayMenu();
};

MML.rangedDefenseRoll = function(defenseChance) {
  this.universalRoll('rangedDefenseRollResult', [input.defenseChance]);
};

MML.rangedDefenseRollResult = function() {
  this.displayRoll('rangedDefenseRollApply');
};

MML.rangedDefenseRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has('Number of Defenses')) {
      this.statusEffects['Number of Defenses'].number++;
    } else {
      this.statusEffects['Number of Defenses'] = {
        id: generateRowID(),
        number: 1
      };
    }
    if (!_.has(this.statusEffects, 'Dodged This Round')) {
      this.statusEffects['Dodged This Round'] = {
        id: generateRowID()
      };
    }
  }

  state.MML.GM.currentAction.rolls.defenseRoll = result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefense = function(attackType) {
  var defenderWeapon;
  var brawlChance;
  var weaponChance;
  var brawlSkill;
  var defaultMartialSkill = this.weaponSkills['Default Martial'].level;
  var defenseMod = this.meleeDefenseMod + this.attributeDefenseMod + attackType.defenseMod;
  var sitMod = this.situationalMod;

  this.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

  if (_.isUndefined(this.weaponSkills['Brawling'])) {
    brawlSkill = 0;
  } else {
    brawlSkill = this.weaponSkills['Brawling'].level;
  }

  if (brawlSkill >= defaultMartialSkill) {
    brawlChance = this.weaponSkills['Brawling'].level + defenseMod + sitMod;
  } else {
    brawlChance = defaultMartialSkill + defenseMod + sitMod;
  }

  if (
    MML.isUnarmed(this) ||
    _.has(this.statusEffects, 'Stunned') ||
    _.has(this.statusEffects, 'Holding') ||
    _.has(this.statusEffects, 'Held') ||
    _.has(this.statusEffects, 'Grappled') ||
    _.has(this.statusEffects, 'Taken Down') ||
    _.has(this.statusEffects, 'Pinned') ||
    _.has(this.statusEffects, 'Overborne')
  ) {
    this.player.charMenuGrappleDefenseRoll(this.name, brawlChance);
  } else {
    var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);
    state.MML.GM.currentAction.parameters.defenderWeapon = characterWeaponInfo.characterWeapon;
    this.player.charMenuGrappleDefenseRoll(
      this.name,
      brawlChance,
      characterWeaponInfo.characterWeapon.task + characterWeaponInfo.skill + this.situationalMod + this.meleeAttackMod + this.attributeMeleeAttackMod
    );
  }
  this.player.displayMenu();
};

MML.grappleDefenseWeaponRoll = function(attackChance) {
  this.universalRoll('Weapon Defense Roll', 'grappleDefenseWeaponRollResult', [attackChance]);
};

MML.grappleDefenseWeaponRollResult = function() {
  this.displayRoll('grappleDefenseWeaponRollApply');
};

MML.grappleDefenseWeaponRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(this.statusEffects, 'Number of Defenses')) {
      this.statusEffects['Number of Defenses'].number++;
    } else {
      this.statusEffects['Number of Defenses'] = {
        id: generateRowID(),
        number: 1
      };
    }

  }
  state.MML.GM.currentAction.rolls.weaponDefenseRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleDefenseBrawlRoll = function() {
  this.universalRoll('Brawl Defense Roll', 'grappleDefenseBrawlRollResult', [input.brawlChance]);
};

MML.grappleDefenseBrawlRollResult = function() {
  this.displayRoll('grappleDefenseBrawlRollApply');
};

MML.grappleDefenseBrawlRollApply = function() {
  var result = this.player.currentRoll.result;

  if (result === 'Success') {
    if (_.has(this.statusEffects, 'Number of Defenses')) {
      this.statusEffects['Number of Defenses'].number++;
    } else {
      this.statusEffects['Number of Defenses'] = {
        id: generateRowID(),
        number: 1
      };
    }
  }
  state.MML.GM.currentAction.rolls.brawlDefenseRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.grappleHandler = function(defender, attackName) {
  switch (attackName) {
    case 'Grapple':
      this.applyGrapple(defender);
      break;
    case 'Place a Hold, Head, Arm, Leg':
      this.applyHold(defender);
      break;
    case 'Place a Hold, Chest, Abdomen':
      this.applyHold(defender);
      break;
    case 'Break a Hold':
      this.applyHoldBreak(defender);
      break;
    case 'Break Grapple':
      this.applyGrappleBreak(defender);
      break;
    case 'Takedown':
      this.applyTakedown(defender);
      break;
    case 'Regain Feet':
      this.applyRegainFeet(defender);
      break;
    default:
      sendChat('Error', 'Unhappy grapple :(');
  }
  MML.endAction();
};

MML.applyGrapple = function(defender) {
  this.statusEffects['Grappled'] = {
    id: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].id : generateRowID(),
    name: 'Grappled',
    targets: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets.concat([defender.name]) : [defender.name]
  };

  if (_.has(defender.statusEffects, 'Holding')) {
    MML.applyHoldBreak(MML.characters[defender.statusEffects['Holding'].targets[0]], defender);
  }
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([this.name]) : [this.name]
  };
};

MML.applyHold = function(defender) {
  if (_.has(this.statusEffects, 'Grappled')) {
    this.removeStatusEffect('Grappled');
  }
  this.statusEffects['Holding'] = {
    id: generateRowID(),
    name: 'Holding',
    targets: [defender.name],
    bodyPart: state.MML.GM.currentAction.calledShot
  };
  if (['Chest', 'Abdomen'].indexOf(state.MML.GM.currentAction.calledShot) > -1 && defender.movementPosition === 'Prone') {
    defender.statusEffects['Pinned'] = {
      id: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].id : generateRowID(),
      name: 'Pinned',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([this.name]) : [this.name]
    };
  } else {
    var holder = { name: this.name, bodyPart: state.MML.GM.currentAction.calledShot };
    defender.statusEffects['Held'] = {
      id: _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].id : generateRowID(),
      name: 'Held',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([holder]) : [holder]
    };
  }
  if (_.has(defender.statusEffects, 'Grappled')) {
    if (defender.statusEffects['Grappled'].targets.length === 1) {
      defender.removeStatusEffect('Grappled');
    } else {
      defender.statusEffects['Grappled'] = {
        id: defender.statusEffects['Grappled'].id,
        name: 'Grappled',
        targets: _.without(defender.statusEffects['Grappled'].targets, this.name)
      };
    }
  }
};

MML.applyHoldBreak = function(defender) {
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([this.name]) : [this.name]
  };
  defender.removeStatusEffect('Holding');
  this.statusEffects['Grappled'] = {
    id: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].id : generateRowID(),
    name: 'Grappled',
    targets: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets.concat([defender.name]) : [defender.name]
  };

  if (_.has(this.statusEffects, 'Held')) {
    if (this.statusEffects['Held'].targets.length === 1) {
      this.removeStatusEffect('Held');
    } else {
      this.statusEffects['Held'] = {
        id: this.statusEffects['Held'].id,
        name: 'Held',
        targets: _.reject(this.statusEffects['Held'].targets, function(target) { return target.name === defender.name; })
      };
    }
  } else if (_.has(this.statusEffects, 'Pinned')) {
    if (this.statusEffects['Pinned'].targets.length === 1) {
      this.removeStatusEffect('Pinned');
    } else {
      this.statusEffects['Pinned'] = {
        id: this.statusEffects['Pinned'].id,
        name: 'Pinned',
        targets: _.without(this.statusEffects['Pinned'].targets, defender.name)
      };
    }
  }
};

MML.applyGrappleBreak = function(defender) {
  if (this.statusEffects['Grappled'].targets.length === 1) {
    this.removeStatusEffect('Grappled');
  } else {
    this.statusEffects['Grappled'] = {
      id: this.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(this.statusEffects['Grappled'].targets, defender.name)
    };
  }
  if (defender.statusEffects['Grappled'].targets.length === 1) {
    defender.removeStatusEffect('Grappled');
  } else {
    defender.statusEffects['Grappled'] = {
      id: defender.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(defender.statusEffects['Grappled'].targets, this.name)
    };
  }
};

MML.applyTakedown = function(defender) {
  var grapplers = _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets : [];
  var holders = _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].targets : [];
  if (grapplers.length + holders.length > 1) {
    defender.statusEffects['Overborne'] = {
      id: generateRowID(),
      name: 'Overborne'
    };
  } else {
    defender.tatusEffects['Taken Down'] = {
      id: generateRowID(),
      name: 'Taken Down'
    };
  }
  if (holders.length > 0) {
    var targets = [];
    _.each(holders, function(holder) {
      if (['Chest', 'Abdomen'].indexOf(holder.bodyPart) > -1) {
        targets.push(holder.name);
        holder.movementPosition('Prone');
      }
    });
    if (targets.length > 0) {
      defender.statusEffects['Pinned'] = {
        id: generateRowID(),
        name: 'Pinned',
        targets: targets
      };
      if (_.reject(defender.statusEffects['Held'].targets, function(target) { return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1; }).length === 0) {
        defender.removeStatusEffect('Held');
      } else {
        defender.statusEffects['Held'] = {
          id: defender.statusEffects['Held'].id,
          name: 'Held',
          targets: _.reject(defender.statusEffects['Held'].targets, function(target) { return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1; })
        };
      }
    }
  }
  if (grapplers.length > 0) {
    _.each(defender.statusEffects['Grappled'].targets, function(target) {
      target.movementPosition = 'Prone';
    });
  }
  defender.movementPosition = 'Prone';
  this.movementPosition = 'Prone';
};

MML.applyRegainFeet = function(defender) {
  var grapplers = _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets : [];
  var holders = _.has(this.statusEffects, 'Held') ? this.statusEffects['Held'].targets : [];

  if (holders.length > 0) {
    var targets = [];
    _.each(holders, function(target) {
      target.movementPosition = 'Walk';
    });
  }
  if (grapplers.length > 0) {
    _.each(grapplers, function(target) {
      target.movementPosition = 'Walk';
    });
  }
  this.removeStatusEffect('Taken Down');
  this.removeStatusEffect('Overborne');
  this.movementPosition = 'Walk';
};

MML.releaseHold = function(defender) {
  defender.applyHoldBreak(this);
  defender.player.charMenuResistRelease(defender.name, this, defender);
  defender.player.displayMenu();
};

MML.releaseGrapple = function(defender) {
  MML.applyGrappleBreak(defender, this);
  MML.characters[this.name].action.modifiers = _.without(MML.characters[this.name].action.modifiers, 'Release Opponent');
  this.startAction();
};

MML.criticalDefense = function() {
  MML.endAction();
};

MML.forgoDefense = function() {
  state.MML.GM.currentAction.rolls[input.rollName] = 'Failure';
  MML[state.MML.GM.currentAction.callback]();
};

MML.equipmentFailure = function() {
  log('equipmentFailure');
};

MML.meleeDamageRoll = function(attackerWeapon, crit, bonusDamage) {
  bonusDamage = 0;
  state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
  this.rollDamage('meleeDamageResult', crit, attackerWeapon.damage, [character.meleeDamageMod, bonusDamage]);
};

MML.meleeDamageResult = function() {
  this.displayRoll('meleeDamageRollApply');
};

MML.meleeDamageRollApply = function() {
  state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.missileDamageRoll = function(attackerWeapon, crit, bonusDamage) {
  bonusDamage = 0;
  state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
  this.rollDamage('missileDamageResult', crit, attackerWeapon.damage, [bonusDamage]);
};

MML.missileDamageResult = function() {
  this.displayRoll('missileDamageRollApply');
};

MML.missileDamageRollApply = function() {
  state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};

MML.castingRoll = function(rollName, task, skill, metaMagicMod) {
  this.universalRoll(rollName, 'castingRollResult', [task, skill, this.situationalMod, this.castingMod, this.attributeCastingMod, metaMagicMod]);
};

MML.castingRollResult = function() {
  var currentRoll = this.player.currentRoll;

  if (this.player.name === state.MML.GM.player) {
    if (currentRoll.accepted === false) {
      this.player.displayGmRoll(currentRoll);
    } else {
      if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
        this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
        this.action.modifiers.push('Called Shot');
        currentRoll.result = 'Success';
      }
      this.castingRollApply();
    }
  } else {
    this.player.displayPlayerRoll(currentRoll);
    if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
      this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
      this.action.modifiers.push('Called Shot');
      currentRoll.result = 'Success';
    }
    this.castingRollApply();
  }
};

MML.castingRollApply = function() {
  state.MML.GM.currentAction.rolls.castingRoll = this.player.currentRoll.result;
  MML[state.MML.GM.currentAction.callback]();
};
