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
    return MML.actionBuildMenu([player, character, {
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

MML.actionBuildMenu = function actionBuildMenu([player, character, action]) {
  return MML.prepareAction([player, character, action])
    .then(function([player, character, action]) {
      switch (player.pressedButton) {
        case 'Observe':
          _.extend(action, {
            ts: Date.now(),
            name: 'Observe'
          });
          return [player, character, action];
        case 'Movement Only':
          _.extend(action, {
            ts: Date.now(),
            name: 'Movement Only'
          });
          return [player, character, action];
        case 'Attack':
          return MML.prepareAttackAction([player, character, action]);
        case 'Ready Item':
          return MML.readyItemAction([player, character, action])
            .then(function([player, character, action]) {
              if (player.pressedButton === 'Back') {
                return MML.actionBuildMenu([player, character, action]);
              } else {
                // item shit
              }
            })
            // .then(the other ones)
            .then(MML.actionBuildMenu);
        case 'Aim':
          _.extend(action, {
            ts: Date.now(),
            name: 'Aim',
            getTargets: 'getSingleTarget'
          });
          return [player, character, action];
        case 'Reload':
          _.extend(action, {
            ts: Date.now(),
            name: 'Reload'
          });
          return [player, character, action];
        case 'Release Opponent':
          action.modifiers.push('Release Opponent');
          return MML.actionBuildMenu([player, character, action]);
        case 'Cast':
          return MML.prepareCastAction([player, character, action]);
        case 'Continue Casting':
          action = MML.clone(character.previousAction);
          return [player, character, action];
        default:

      }
    })
    .then(MML.finalizeAction)
    .then(function([player, character, action]) {
      switch (player.pressedButton) {
        case 'Roll':
          return MML.rollInitiative([player, character, action]);
        case 'Edit Action':
          return MML.actionBuildMenu([player, character, {
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
  return ['Punch',
    'Kick',
    'Head Butt',
    'Bite',
    'Grapple',
    'Place a Hold',
    'Break a Hold',
    'Break Grapple',
    'Takedown',
    'Regain Feet'].indexOf(action.weaponType) > -1;
};

MML.processAction = function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function(item) {
      MML.equipItem(character, item.itemId, item.grip);
    });
  }
  switch (action.name) {
    case 'Attack':
      return MML.processAttack(player, character, action);
    case 'Observe':
      return MML.observeAction(player, character, action);
    case 'Movement Only':
      return MML.endAction(player, character, action);
    case 'Attack':
      return MML.processAttack(player, character, action);
    case 'Attack':
      return MML.processAttack(player, character, action);
    default:

  }
  // if (_.contains(action.modifiers, 'Release Opponent')) {
  //   var targetName = _.has(character.statusEffects, 'Holding') ? character.statusEffects['Holding'].targets[0] : character.statusEffects['Grappled'].targets[0];
  //   state.MML.GM.currentAction.parameters = {
  //     target: MML.characters[targetName]
  //   };
  //   MML.releaseOpponentAction(player, character, action);
  // } else if (action.name === 'Cast') {
  //   action.spell.actions--;
  //   if (action.spell.actions > 0) {
  //     character.player.charMenuContinueCasting(character.name);
  //     character.player.displayMenu();
  //   } else {
  //     var currentAction = {
  //       callback: 'castAction',
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
  //       },
  //       rolls: {}
  //     };
  //
  //     state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
  //     character.player.chooseMetaMagic(character.name);
  //     character.player.displayMenu();
  //   }
  // } else if (!_.isUndefined(action.getTargets)) {
  //   character[action.getTargets]();
  // } else {
  //   MML[action.callback]();
  // }
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
  var attackerSkill = parameters.attackerSkill;
  var attackerWeapon = parameters.attackerWeapon;
  var target = parameters.target;
  var range = parameters.range;
  var rolls = currentAction.rolls;

  if (_.isUndefined(rolls.attackRoll)) {
    MML.missileAttackRoll(character, 'attackRoll', attackerWeapon.task, attackerSkill, target);
  } else if (_.isUndefined(rolls.defenseRoll)) {
    if (rolls.attackRoll === 'Critical Success' || rolls.attackRoll === 'Success') {
      MML.rangedDefense(target, attackerWeapon, range);
    } else if (rolls.attackRoll === 'Critical Failure') {
      MML.endAction();
    } else {
      MML.endAction();
    }
  } else if (_.isUndefined(rolls.hitPositionRoll)) {
    if (rolls.defenseRoll === 'Critical Success') {
      MML.criticalDefense(target, character);
    } else if (rolls.defenseRoll === 'Success') {
      MML.endAction();
    } else {
      MML.hitPositionRoll(player, target, action);
    }
  } else if (_.isUndefined(rolls.damageRoll)) {
    if (rolls.attackRoll === 'Critical Success') {
      MML.missileDamageRoll(character, attackerWeapon, true);
    } else {
      MML.missileDamageRoll(character, attackerWeapon, false);
    }
  } else {
    MML.damageCharacter(target.player, target, hitPosition.result, damageRoll.result);
  }
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
                                .then(function (player) {
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
    MML.damageCharacter(target.player, target, hitPosition.result, damageRoll.result)
      .then(MML.endAction());
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
  return MML.charMenuObserveAction(player, character)
    .then(function ([player, character, action]) {
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
        return MML.charMenuAimAction(player, character, target);
      });
  } else if (character.statusEffects['Taking Aim'].startingRound !== state.MML.GM.currentRound && attackerWeapon.family === 'MWD') {
    return MML.charMenuholdAimRoll(player, character, target)
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
          return MML.charMenuAimAction(player, character, target);
        }
      });
  }
};

MML.reloadAction = function reloadAction(player, character, action) {
  MML.reloadWeapon(player, character, action);
};

MML.endAction = function endAction(player, character, action) {
  character.spentInitiative = character.spentInitiative + character.actionTempo;
  character.previousAction = MML.clone(character.action);
  MML.updateCharacter(character);
  _.each(action.targetArray || [], function(target) {
    MML.updateCharacter(characters[target]);
  });

  if (character.initiative > 0) {
    return MML.buildAction(player, character)
      .then(function () {
        MML.nextAction();
      });
  } else {
    MML.nextAction();
  }
};
