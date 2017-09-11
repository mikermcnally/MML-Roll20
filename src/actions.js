MML.buildAction = function buildAction(player, character) {
  if (_.has(character.statusEffects, 'Stunned')) {
    MML.applyStatusEffects(character);
    return MML.finalizeAction([player, character, {
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: MML.getEquippedWeapon(character),
      name: 'Movement Only'
    }]);
  } else if (character.situationalInitBonus !== 'No Combat') {
    return MML.prepareActionFlow([player, character, {
        ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
        modifiers: [],
        weapon: MML.getEquippedWeapon(character)
      }])
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

MML.prepareActionFlow = function prepareActionFlow([player, character, action]) {
  return MML.prepareAction([player, character, action])
    .then(function([player, character, action]) {
      if (_.contains(action.modifiers, 'Ready Item')) {
        var weapon = _.find(action.items, function(item) {
          return character.inventory[item.itemId].type === 'weapon';
        });
        if (_.isUndefined(weapon)) {
          action.weapon = 'unarmed';
        } else {
          if (weapon.grip === 'Right' || weapon.grip === 'Left') {
            action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], 'One Hand');
          } else {
            action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], weapon.grip);
          }
        }
      } else {
        action.weapon = MML.getEquippedWeapon(character);
      }

      switch (player.pressedButton) {
        case 'Observe':
          _.extend(action, {ts: Date.now(), name: 'Observe'});
          return [player, character, action];
        case 'Movement Only':
          _.extend(action, {ts: Date.now(), name: 'Movement Only'});
          return [player, character, action];
        case 'Attack':
          return MML.prepareAttackAction([player, character, action]);
        case 'Ready Item':
          return MML.readyItem([player, character, action]).then(MML.prepareActionFlow);
        case 'Aim':
          _.extend(action, {ts: Date.now(), name: 'Aim'});
          return [player, character, action];
        case 'Reload':
          _.extend(action, {ts: Date.now(), name: 'Reload'});
          return [player, character, action];
        case 'Release Opponent':
          action.modifiers.push('Release Opponent');
          return MML.prepareActionFlow([player, character, action]);
        case 'Cast':
          return MML.prepareCastAction([player, character, action]);
        case 'Continue Casting':
          action = MML.clone(character.previousAction);
          return [player, character, action];
      }
    })
    .then(MML.finalizeAction)
    .then(function([player, character, action]) {
      switch (player.pressedButton) {
        case 'Roll':
          return MML.rollInitiative([player, character, action]);
        case 'Edit Action':
          return MML.prepareActionFlow([player, character, {
            ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
            modifiers: [],
            weapon: MML.getEquippedWeapon(character)
          }]);
        case 'Accept':
          MML.setAction(character, action);
          return player;
      }
    });
};

MML.isUnarmedAction = function isUnarmedAction(action) {
  return _.contains(['Punch',
    'Kick',
    'Head Butt',
    'Bite',
    'Grapple',
    'Place a Hold',
    'Break a Hold',
    'Break Grapple',
    'Takedown',
    'Regain Feet'], action.weaponType);
};

MML.processAction = function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function(item) {
      MML.equipItem(character, item.itemId, item.grip);
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

  var weaponType = action.weaponType;
  if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(weaponType) > -1) {
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
    .then(function(target) {
      return MML.missileAttackRoll(player, character, target, weapon, action.skill)
        .then(function([player, attackRoll]) {
          switch (attackRoll.result) {
            case 'Critical Failure':
            case 'Failure':
              return MML.endAction(player, character, action);
            case 'Critical Success':
            case 'Success':
              return MML.rangedDefense(target.player, target, weapon)
                .then(function([player, defenseRoll]) {
                  switch (defenseRoll.result) {
                    case 'Critical Success':
                      return MML.criticalDefense(target.player, target)
                        .then(MML.endAction(player, character, action));
                    case 'Success':
                      return MML.endAction(player, character, action);
                    case 'Critical Failure':
                    case 'Failure':
                      return MML.hitPositionRoll(player, target, action)
                        .then(function([player, hitPositionRoll]) {
                          return MML.missileDamageRoll(player, character, target, weapon, attackRoll)
                            .then(function([player, damageRoll]) {
                              return MML.damageCharacter(target.player, target, hitPositionRoll.result, damageRoll.result, damageRoll.damageType)
                                .then(function(player) {
                                  return MML.endAction(player, character, action);
                                });
                            });
                        });
                  }
                });
          }
        });
    });

};

MML.meleeAttackAction = function meleeAttackAction(player, character, action) {
  var weapon = action.weapon;
  return MML.getSingleTarget(player)
    .then(function(target) {
      return MML.meleeAttackRoll(player, character, weapon.task, action.skill)
        .then(function([player, attackRoll]) {
          switch (attackRoll.result) {
            case 'Critical Failure':
            case 'Failure':
              return MML.endAction(player, character, action);
            case 'Critical Success':
            case 'Success':
              return MML.meleeDefense(target.player, target, weapon)
                .then(function([player, defenseRoll]) {
                  switch (defenseRoll.result) {
                    case 'Critical Success':
                      return MML.criticalDefense(target.player, target)
                        .then(MML.endAction(player, character, action));
                    case 'Success':
                      return MML.endAction(player, character, action);
                    case 'Critical Failure':
                    case 'Failure':
                      return MML.hitPositionRoll(player, target, action)
                        .then(function([player, hitPositionRoll]) {
                          return MML.meleeDamageRoll(player, character, weapon, attackRoll)
                            .then(function([player, damageRoll]) {
                              return MML.damageCharacter(target.player, target, hitPositionRoll.result, damageRoll.result, damageRoll.damageType)
                                .then(function(player) {
                                  return MML.endAction(player, character, action);
                                });
                            });
                        });
                  }
                });
          }
        });
    });
};

MML.grappleAttackAction = function grappleAttackAction(player, character, action) {
  var attackerSkill = parameters.attackerSkill;
  var weaponType = parameters.weaponType;
  var target = parameters.target;
  var defender = parameters.defender;
  var defenderWeapon = parameters.defenderWeapon;
  var rolls = currentAction.rolls;

  if (_.isUndefined(rolls.attackRoll)) {
    MML.meleeAttackRoll(character, 'attackRoll', weaponType.task, attackerSkill);
  } else if (_.isUndefined(rolls.brawlDefenseRoll) && _.isUndefined(rolls.weaponDefenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      target.grappleDefense(weaponType);
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
      MML.grappleHandler(character, target, weaponType.name);
    }
  } else if (!_.isUndefined(rolls.weaponDefenseRoll) && _.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.weaponDefenseRoll === 'Critical Success' || rolls.weaponDefenseRoll === 'Success') {
      state.MML.GM.currentAction.parameters.target = character;
      state.MML.GM.currentAction.parameters.defender = target;
      target.hitPositionRoll();
    } else {
      MML.grappleHandler(character, target, weaponType.name);
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
      weaponType: 'Break Grapple',
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
        return MML.goToMenu(player, {message: character.name + ' aims at ' + target.name, buttons: ['End Action']})
        .then(function (player) {
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
          return MML.goToMenu(player, {message: character.name + ' aims at ' + target.name, buttons: ['End Action']})
          .then(function (player) {
            return MML.endAction(player, character, action);
          });
        }
      });
  }
};

MML.reloadAction = function reloadAction(player, character, action) {
  var characterWeaponInfo = MML.getCharacterWeaponAndSkill(character);
  var attackerWeapon = characterWeaponInfo.characterWeapon;
  attackerWeapon.loaded++;
  character.inventory[attackerWeapon._id].loaded = attackerWeapon.loaded;
  state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, {
    character: character,
    callback: 'reloadAction',
    parameters: {
      attackerWeapon: attackerWeapon,
      attackerSkill: characterWeaponInfo.skill
    },
    rolls: {}
  });
  MML.applyStatusEffects(character);
  character.player.charMenuReloadAction(character.name, '');
  character.player.displayMenu();
};

MML.endAction = function endAction(player, character, action) {
  character.spentInitiative = character.spentInitiative + character.actionTempo;
  character.previousAction = MML.clone(character.action);
  MML.updateCharacter(character);
  _.each(action.targetArray || [], function(target) {
    MML.updateCharacter(MML.characters[target]);
  });

  if (character.initiative > 0) {
    return MML.buildAction(player, character)
      .then(function() {
        MML.nextAction();
      });
  } else {
    MML.nextAction();
  }
};
