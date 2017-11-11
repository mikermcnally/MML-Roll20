MML.buildAction = function buildAction(player, character) {
  if (_.has(character.statusEffects, 'Stunned')) {
    MML.applyStatusEffects(character);
    return MML.finalizeAction(player, character)({
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: MML.getEquippedWeapon(character),
      name: 'Movement Only'
    });
  } else if (character.situationalInitBonus !== 'No Combat') {
    return MML.prepareActionFlow(player, character, {
        ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
        modifiers: [],
        weapon: MML.getEquippedWeapon(character)
      })
      .catch(log);
  } else {
    MML.setReady(character, true);
    return [player, character, {
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: MML.getEquippedWeapon(character),
      name: 'No Combat'
    }];
  }
};

MML.prepareActionFlow = function prepareActionFlow(player, character, action) {
  return MML.prepareAction(player, character, action)
    .then(function([player, character, action]) {
      if (_.contains(action.modifiers, 'Ready Item')) {
        var weaponWithGrip = _.find(action.items, function(itemWithGrip) {
          return itemWithGrip.item.type === 'weapon';
        });
        if (_.isUndefined(weaponWithGrip)) {
          action.weapon = 'unarmed';
        } else {
          if (weaponWithGrip.grip === 'Right Hand' || weaponWithGrip.grip === 'Left Hand') {
            action.weapon = MML.buildWeaponObject(weaponWithGrip.item, 'One Hand');
          } else {
            action.weapon = MML.buildWeaponObject(weaponWithGrip.item, weaponWithGrip.grip);
          }
        }
      } else {
        action.weapon = MML.getEquippedWeapon(character);
      }
      switch (player.pressedButton) {
        case 'Observe':
          _.extend(action, { ts: Date.now(), name: 'Observe' });
          return action;
        case 'Movement Only':
          _.extend(action, { ts: Date.now(), name: 'Movement Only' });
          return action;
        case 'Attack':
          return MML.prepareAttackAction([player, character, action]);
        case 'Ready Item':
          return MML.readyItem(player, character, action)
            .then(function(itemArray) {
              action.items = itemArray;
              action.modifiers.push('Ready Item');
              throw action;
            });
        case 'Aim':
          _.extend(action, { ts: Date.now(), name: 'Aim' });
          return action;
        case 'Reload':
          _.extend(action, { ts: Date.now(), name: 'Reload' });
          return action;
        case 'Release Opponent':
          action.modifiers.push('Release Opponent');
          throw action;
        case 'Cast':
          return MML.prepareCastAction([player, character, action]);
        case 'Continue Casting':
          action = MML.clone(character.previousAction);
          return action;
      }
    })
    .then(MML.finalizeAction(player, character))
    .then(function(action) {
      switch (player.pressedButton) {
        case 'Roll':
          MML.setAction(character, action);
          return MML.initiativeRoll(player, character, action);
        case 'Edit Action':
          return MML.prepareActionFlow(player, character, {
            ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
            modifiers: [],
            weapon: MML.getEquippedWeapon(character)
          });
        case 'Accept':
          MML.setAction(character, action);
          return player;
      }
    })
    .catch(function(input) {
      if (input instanceof Error) {
        throw input;
      } else {
        return MML.prepareActionFlow(player, character, input);
      }
    });
};

MML.isUnarmedAction = function isUnarmedAction(action) {
  return _.contains([
    'Punch',
    'Kick',
    'Head Butt',
    'Bite',
    'Grapple',
    'Place a Hold',
    'Break a Hold',
    'Break Grapple',
    'Takedown',
    'Regain Feet'],
    action.attackType);
};

MML.processAction = function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function(itemWithGrip) {
      MML.equipItem(character, itemWithGrip.item._id, itemWithGrip.grip);
    });
  }
  if (_.contains(action.modifiers, 'Release Opponent')) {
    return MML.releaseOpponent(player, character, action);
  }
  switch (action.name) {
    case 'Attack':
      return MML.processAttack(player, character, action);
    case 'Observe':
      return MML.observeAction(player, character, action);
    case 'Movement Only':
      return MML.endAction(player, character, action);
    case 'Release Opponent':
      return MML.Release(player, character, action);
    case 'Cast':
      return MML.castAction(player, character, action);
    case 'Aim':
      return MML.aimAction(player, character, action);
  }
  // } else if (action.name === 'Cast') {
  //   action.spell.actions--;
  //   if (action.spell.actions > 0) {
  //     character.player.charMenuContinueCasting(character.name);
  //     character.player.displayMenu();
  //       parameters: {
  //         spell: action.spell,
  //         casterSkill: action.skill,
  //         epCost: MML.getEpCost(action.skillName, action.skill, action.spell.ep),
  //         metaMagic: {
  //           base: {
  //             epMod: 1,
  //             castingMod: 0
  //           }
  //         }
  //     character.player.chooseMetaMagic(character.name);
};

MML.processAttack = function processAttack(player, character, action) {
  MML.addStatusEffect(character, 'Melee This Round', {
    name: 'Melee This Round'
  });

  var attackType = action.attackType;
  if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(attackType) > -1) {
    return MML.grappleAttackAction(player, character, action);
  } else if (MML.isDualWielding(character)) {
    return MML.dualWieldAttackAction(player, character, action);
  } else if (MML.isWieldingMissileWeapon(character)) {
    return MML.missileAttackAction(player, character, action);
  } else if (MML.isWieldingThrowingWeapon(character)) {
    return MML.throwingAttackAction(player, character, action);
  } else {
    return MML.meleeAttackAction(player, character, action);
  }
};

MML.missileAttackAction = function missileAttackAction(player, character, action) {
  var weapon = action.weapon;
  return MML.getSingleTarget(player)
    .then(function (target) {
      return MML.missileAttackRoll(player, character, target, weapon, action.skill)
        .then(MML.rangedDefense(target.player, target, weapon))
        .then(MML.hitPositionRoll(player, target, action))
        .then(MML.missileDamageRoll(player, character, target, weapon, attackRoll))
        .then(MML.damageCharacter(target.player, target, weapon.damageType))
        .catch(function (rolls) {
          return rolls;
        })
        .then(MML.endAction(player, character, action, target));
    });
};

MML.meleeAttackAction = function meleeAttackAction(player, character, action) {
  var rolls = {};
  var weapon = action.weapon;
  return MML.getSingleTarget(player)
    .then(function (target) {
      return MML.meleeAttackRoll(player, character, target, weapon, action.skill)(rolls)
        .then(MML.meleeDefense(target.player, target, weapon))
        .then(MML.hitPositionRoll(player, target, action))
        .then(MML.meleeDamageRoll(player, character, target, weapon, attackRoll))
        .then(MML.damageCharacter(target.player, target, weapon.damageType))
        .catch(function (rolls) {
          return rolls;
        })
        .then(MML.endAction(player, character, action, target));
    });
};

MML.grappleAttackAction = function grappleAttackAction(player, character, action) {
  var attackerSkill = parameters.attackerSkill;
  var attackType = parameters.attackType;
  var target = parameters.target;
  var defender = parameters.defender;
  var defenderWeapon = parameters.defenderWeapon;
  var rolls = currentAction.rolls;

  if (_.isUndefined(rolls.attackRoll)) {
    MML.meleeAttackRoll(character, 'attackRoll', attackType.task, attackerSkill);
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
      MML.grappleHandler(character, target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.weaponDefenseRoll) && _.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.weaponDefenseRoll === 'Critical Success' || rolls.weaponDefenseRoll === 'Success') {
      state.MML.GM.currentAction.parameters.target = character;
      state.MML.GM.currentAction.parameters.defender = target;
      target.hitPositionRoll();
    } else {
      MML.grappleHandler(character, target, attackType.name);
    }
  } else if (!_.isUndefined(rolls.hitPositionRoll) && _.isUndefined(rolls.damageRoll)) {
    if (rolls.weaponDefenseRoll === 'Critical Success') {
      defender.meleeDamageRoll(defenderWeapon, true);
    } else {
      defender.meleeDamageRoll(defenderWeapon, false);
    }
  } else {
    MML.damageCharacter(target.player, target, hitPosition.result, damageRoll.result).then(MML.endAction());
  }
};

MML.releaseOpponentAction = function releaseOpponentAction(player, character, action) {
  var target = parameters.target;
  var rolls = currentAction.rolls;

  if (_.isUndefined(parameters.targetAgreed)) {
    if (_.has(character.statusEffects, 'Holding')) {
      MML.releaseHold(character, target);
    } else {
      target.player.charMenuResistRelease(target.name, character, target);
      target.player.displayMenu();
    }
  } else if (parameters.targetAgreed) {
    MML.releaseGrapple(character, target);
  } else {
    character.action = {
      ts: Date.now(),
      name: 'Attack',
      attackType: 'Break Grapple',
      modifiers: []
    };
    state.MML.GM.currentAction = {
      character: character,
      targetArray: [target.name],
      targetIndex: 0,
      resistRelease: true
    };
    character[character.action.callback]();
  }
};

MML.castAction = function castAction(player, character, action) {
  MML.spells[action.spell.name].process(player, character, action);
};

MML.observeAction = function observeAction(player, character, action) {
  MML.addStatusEffect(character, 'Observing', {
    id: generateRowID(),
    name: 'Observing',
    startingRound: state.MML.GM.currentRound
  });
  return MML.displayObserveMenu(player, character, action)
    .then(function([player, character, action]) {
      MML.endAction(player, character, action);
    });
};

MML.aimAction = function aimAction(player, character, action) {
  if (!_.has(character.statusEffects, 'Taking Aim')) {
    return MML.getSingleTarget(player)
      .then(function(target) {
        MML.addStatusEffect(character, 'Taking Aim', {
          id: generateRowID(),
          name: 'Taking Aim',
          level: 1,
          target: target,
          startingRound: state.MML.GM.currentRound
        });
        return MML.goToMenu(player, { message: character.name + ' aims at ' + target.name, buttons: ['End Action'] })
          .then(function(player) {
            return MML.endAction(player, character, action);
          });
      });
  } else if (character.statusEffects['Taking Aim'].startingRound !== state.MML.GM.currentRound && attackerWeapon.family === 'MWD') {
    return MML.holdAimRoll(player, character, target)
      .then(function(roll) {
        if (roll.result !== 'Success') {
          return MML.missileAttackAction(player, character, action);
        } else {
          if (target.name === character.statusEffects['Taking Aim'].target.name) {
            character.statusEffects['Taking Aim'].level = 2;
          } else {
            character.statusEffects['Taking Aim'].target = target;
            character.statusEffects['Taking Aim'].level = 1;
            character.statusEffects['Taking Aim'].startingRound = state.MML.GM.currentRound;
          }
          return MML.goToMenu(player, { message: character.name + ' aims at ' + target.name, buttons: ['End Action'] })
            .then(function(player) {
              return MML.endAction(player, character, action);
            });
        }
      });
  }
};

MML.reloadAction = function reloadAction(player, character, action) {
  var weapon = character.inventory[action.weapon._id];
  weapon.loaded++;
  return MML.goToMenu(player, { message: character.name + ' reloads their ' + weapon.name + ' (' + weapon.loaded + '/' + weapon.reload + ')', buttons: ['End Action'] })
    .then(function(player) {
      return MML.endAction(player, character, action);
    });
};

MML.endAction = function endAction(player, character, action, targets) {
  character.spentInitiative = character.spentInitiative +
    character.actionTempo +
    (character.actionInitCostMod > -1 ? -1 : character.actionTempo + character.actionInitCostMod);
  character.previousAction = MML.clone(character.action);
  MML.updateCharacter(character);
  _.each(action.targetArray || [], function(target) {
    MML.updateCharacter(MML.characters[target]);
  });

  if (character.initiative > 0) {
    return MML.buildAction(player, character);
  } else {
    return player;
  }
};
