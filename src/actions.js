SoS.prepareAction = async function prepareAction(player, character) {
  try {
    var action = {
      ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
      modifiers: [],
      weapon: SoS.getEquippedWeapon(character)
    };

    if (_.has(character.statusEffects, 'Stunned')) {
      SoS.applyStatusEffects(character);
      _.extend(action, { ts: Date.now(), name: 'Movement Only' });
      await SoS.finalizeAction(player, character, action);
    } else if (character.situationalInitBonus !== 'No Combat') {
      action = await SoS.buildAction(player, character, action);
      await SoS.finalizeAction(player, character, action);
    } else {
      _.extend(action, { ts: Date.now(), name: 'No Combat' });
    }
    SoS.setReady(character, true);
    return action;
  } catch (err) {
    log(err.stack);
  }
};

SoS.buildAction = async function buildAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    const weaponWithGrip = _.find(action.items, itemWithGrip => itemWithGrip.item.type === 'weapon');
    if (_.isUndefined(weaponWithGrip)) {
      action.weapon = 'unarmed';
    } else {
      if (weaponWithGrip.grip === 'Right Hand' || weaponWithGrip.grip === 'Left Hand') {
        action.weapon = SoS.buildWeaponObject(weaponWithGrip.item, 'One Hand');
      } else {
        action.weapon = SoS.buildWeaponObject(weaponWithGrip.item, weaponWithGrip.grip);
      }
    }
  } else {
    action.weapon = SoS.getEquippedWeapon(character);
  }

  const action_type = await SoS.chooseActionType(player, character, action);
  switch (action_type) {
    case 'Observe':
      return _.extend(action, { ts: Date.now(), name: 'Observe' });
    case 'Movement Only':
      return _.extend(action, { ts: Date.now(), name: 'Movement Only' });
    case 'Attack':
      return await SoS.prepareAttackAction(player, character, action);
    case 'Ready Item':
      const itemArray = await SoS.readyItem(player, character, action);
      action.items = itemArray;
      action.modifiers.push('Ready Item');
      return SoS.buildAction(player, character, action);
    case 'Aim':
      return _.extend(action, { ts: Date.now(), name: 'Aim' });
    case 'Reload':
      return _.extend(action, { ts: Date.now(), name: 'Reload' });
    case 'Release Opponent':
      action.modifiers.push('Release Opponent');
      return SoS.buildAction(player, character, action);
    case 'Cast':
      return await SoS.prepareCastAction([player, character, action]);
    case 'Continue Casting':
      return SoS.clone(character.previousAction);
  }
};

SoS.chooseActionType = async function chooseActionType(player, character, action) {
  const message = 'Prepare ' + character.name + '\'s action';
  var buttons = ['Movement Only', 'Observe', 'Ready Item', 'Attack'];

  if (!_.isUndefined(action.weapon) && SoS.isRangedWeapon(action.weapon)) {
    if (action.weapon.family !== 'MWM' || action.weapon.loaded === action.weapon.reload) {
      buttons.push('Aim');
    } else {
      buttons.push('Reload');
    }
  }

  if ((_.has(character.statusEffects, 'Holding') ||
    (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1)) &&
    !_.has(character.statusEffects, 'Held') &&
    !_.contains(action.modifiers, 'Release Opponent')
  ) {
    buttons.push('Release Opponent');
  }

  if (character.spells.length > 0) {
    buttons.push('Cast');
  }

  if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
    buttons.push('Continue Casting');
  }

  const {pressedButton, selectedIds} = await SoS.goToMenu(player, message, buttons);
  return pressedButton;
};

SoS.isUnarmedAction = function isUnarmedAction(action) {
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

SoS.processAction = async function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function(itemWithGrip) {
      SoS.equipItem(character, itemWithGrip.item._id, itemWithGrip.grip);
    });
  }
  if (_.contains(action.modifiers, 'Release Opponent')) {
    return SoS.releaseOpponent(player, character, action);
  }
  switch (action.name) {
    case 'Attack':
      return await SoS.processAttack(player, character, action);
    case 'Observe':
      return SoS.observeAction(player, character, action);
    case 'Movement Only':
      return SoS.endAction(player, character, action);
    case 'Release Opponent':
      return SoS.Release(player, character, action);
    case 'Cast':
      return SoS.castAction(player, character, action);
    case 'Aim':
      return SoS.aimAction(player, character, action);
  }
  // } else if (action.name === 'Cast') {
  //   action.spell.actions--;
  //   if (action.spell.actions > 0) {
  //     character.player.charMenuContinueCasting(character.name);
  //     character.player.displayMenu();
  //       parameters: {
  //         spell: action.spell,
  //         casterSkill: action.skill,
  //         epCost: SoS.getEpCost(action.skillName, action.skill, action.spell.ep),
  //         metaMagic: {
  //           base: {
  //             epMod: 1,
  //             castingMod: 0
  //           }
  //         }
  //     character.player.chooseMetaMagic(character.name);
};

SoS.processAttack = async function processAttack(player, character, action) {
  SoS.addStatusEffect(character, 'Melee This Round', {
    name: 'Melee This Round'
  });

  var attackType = action.attackType;
  if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].includes(attackType)) {
    return SoS.grappleAttackAction(player, character, action);
  } else if (SoS.isDualWielding(character)) {
    return SoS.dualWieldAttackAction(player, character, action);
  } else if (SoS.isWieldingMissileWeapon(character)) {
    return SoS.missileAttackAction(player, character, action);
  } else if (SoS.isWieldingThrowingWeapon(character)) {
    return SoS.throwingAttackAction(player, character, action);
  } else {
    return await SoS.meleeAttackAction(player, character, action);
  }
};

SoS.missileAttackAction = async function missileAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await SoS.getSingleTarget(player);
  const attack = await SoS.missileAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await SoS.missileDefense(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await SoS.hitPositionRoll(player, character, target, action);
      const damage = await SoS.missileDamageRoll(player, character, target, weapon, attack);
      await SoS.damageCharacter(target.player, target, weapon.damageType, hitPosition, damage);
    }
  }
  return SoS.endAction(player, character, action, target);
};

SoS.meleeAttackAction = async function meleeAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await SoS.getSingleTarget(player);
  const attack = await SoS.meleeAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await SoS.meleeDefenseRoll(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await SoS.hitPositionRoll(player, character, target, action);
      const damage = await SoS.meleeDamageRoll(player, character, weapon, attack);
      await SoS.damageCharacter(target.player, target, damage, weapon.damageType, hitPosition);
    }
  }
  return SoS.endAction(player, character, action, target);
};

SoS.castAction = async function castAction(player, character, action) {
  await SoS.spells[action.spell.name](player, character, action);
  return SoS.endAction(player, character, action);
};

SoS.observeAction = async function observeAction(player, character, action) {
  SoS.addStatusEffect(character, 'Observing', {
    id: SoS.generateRowID(),
    name: 'Observing',
    startingRound: state.SoS.GM.currentRound
  });
  await SoS.goToMenu(player, character.name + ' observes the situation.', ['End Action']);
  return SoS.endAction(player, character, action);
};

SoS.aimAction = async function aimAction(player, character, action) {
  if (!_.has(character.statusEffects, 'Taking Aim')) {
    const target = await SoS.getSingleTarget(player);
    SoS.addStatusEffect(character, 'Taking Aim', {
      id: SoS.generateRowID(),
      name: 'Taking Aim',
      level: 1,
      target: target,
      startingRound: state.SoS.GM.currentRound
    });
    await SoS.goToMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
    return SoS.endAction(player, character, action);
  } else if (character.statusEffects['Taking Aim'].startingRound !== state.SoS.GM.currentRound && attackerWeapon.family === 'MWD') {
    const holdAimRoll = await SoS.holdAimRoll(player, character, target);
    if (SoS.failure(holdAimRoll)) {
      return await SoS.missileAttackAction(player, character, action);
    } else {
      if (target.id === character.statusEffects['Taking Aim'].target.id) {
        character.statusEffects['Taking Aim'].level = 2;
      } else {
        character.statusEffects['Taking Aim'].target = target;
        character.statusEffects['Taking Aim'].level = 1;
        character.statusEffects['Taking Aim'].startingRound = state.SoS.GM.currentRound;
      }
      await SoS.goToMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
      return SoS.endAction(player, character, action);
    }
  }
};

SoS.reloadAction = async function reloadAction(player, character, action) {
  var weapon = character.inventory[action.weapon._id];
  weapon.loaded++;
  await SoS.goToMenu(player, character.name + ' reloads their ' + weapon.name + ' (' + weapon.loaded + '/' + weapon.reload + ')', ['End Action']);
  return SoS.endAction(player, character, action);
};

SoS.endAction = function endAction(player, character, action, targets) {
  character.spentInitiative = character.spentInitiative +
    character.actionTempo +
    (character.actionInitCostMod > -1 ? -1 : character.actionTempo + character.actionInitCostMod);
  character.previousAction = SoS.clone(character.action);
  SoS.updateCharacter(character);
  _.each(action.targetArray || [], function(target) {
    SoS.updateCharacter(SoS.characters[target]);
  });

  if (character.initiative > 0) {
    return SoS.prepareAction(player, character);
  } else {
    return player;
  }
};
