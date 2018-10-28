export interface IAction {
  
}


MML.buildAction = function buildAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    const weaponWithGrip = _.find(action.items, itemWithGrip => itemWithGrip.item.type === 'weapon');
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
  
  const action_type = MML.chooseActionType(player, character, action);
  const observe = action_type.pipe(
    filter(action_type => action_type === 'Observe'),
    mapTo({ name: 'Observe' })
  );
  const movement_only = action_type.pipe(
    filter(action_type => action_type === 'Movement Only'),
    mapTo({ name: 'Movement Only' })
  );
  const attack = action_type.pipe(
    filter(action_type => action_type === 'Attack'),
    switchMapTo(MML.prepareAttackAction(player, character, action))
  );
  const ready_item = action_type.pipe(
    filter(action_type => action_type === 'Ready Item'),
    switchMapTo(MML.readyItem(player, character, action))
  );
  const aim = action_type.pipe(
    filter(action_type => action_type === 'Aim'), 
    mapTo({ name: 'Aim' })
  );
  const reload = action_type.pipe(
    filter(action_type => action_type === 'Reload'),
    mapTo({ name: 'Reload' })
  );
  const release_opponent = action_type.pipe(
    filter(action_type => action_type === 'Release Opponent'),
    mapTo({ name: 'Release Opponent' })
  );
  const cast = action_type.pipe(
    filter(action_type => action_type === 'Cast'),
    swtichMapTo(MML.prepareCastAction([player, character, action]))
  );

  return Rx.empty().pipe(expand(function () {
    return Rx.race(
      observe,
      movement_only,
      attack,
      ready_item,
      aim,
      reload,
      release_opponent,
      cast
    )
    .pipe(switchMap(MML.finalizeAction(player, character, action)));
  }))
};

MML.changeAction = function changeAction(button_pressed, character) {
  return MML.displayMenu(player.name, 'Continue or Change Action: ', ['Continue', 'Change']).pipe(
    switchMap(function ({ content }) {
      switch (content) {
        case 'Continue':
          return Rx.empty();
        case 'Change':
          return MML.buildAction(button_pressed, character);
        default:
          return Rx.throwError('NANI?!');
      }
    })
  );
};

MML.chooseActionType = function chooseActionType(button_pressed, character) {
  const message = 'Prepare ' + character.name + '\'s action';
  return Rx.combineLatest(character.name, character.available_actions).pipe(switchMap(function () {
    MML.displayMenu(player, message, buttons)
  }));

  // if (!_.isUndefined(action.weapon) && MML.isRangedWeapon(action.weapon)) {
  //   if (action.weapon.family !== 'MWM' || action.weapon.loaded === action.weapon.reload) {
  //     buttons.push('Aim');
  //   } else {
  //     buttons.push('Reload');
  //   }
  // }

  // if ((_.has(character.statusEffects, 'Holding') ||
  //     (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1)) &&
  //   !_.has(character.statusEffects, 'Held') &&
  //   !_.contains(action.modifiers, 'Release Opponent')
  // ) {
  //   buttons.push('Release Opponent');
  // }

  // if (character.spells.length > 0) {
  //   buttons.push('Cast');
  // }

  // if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
  //   buttons.push('Continue Casting');
  // }

  // const { button_pressed } = MML.displayMenu(player, message, buttons);
  // return button_pressed;
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
      'Regain Feet'
    ],
    action.attackType);
};

MML.processAction = async function processAction(player, character, action) {
  if (_.contains(action.modifiers, 'Ready Item')) {
    _.each(action.items, function (itemWithGrip) {
      MML.equipItem(character, itemWithGrip.item._id, itemWithGrip.grip);
    });
  }
  if (_.contains(action.modifiers, 'Release Opponent')) {
    return MML.releaseOpponent(player, character, action);
  }
  switch (action.name) {
    case 'Attack':
      return await MML.processAttack(player, character, action);
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
  //     character.player.sendChatMenu();
  //       parameters: {
  //         spell: action.spell,
  //         casterSkill: action.skill,
  //         epCost: MML.getEpCost(action.skillName, action.skill, action.spell.ep),
  //         metaMagic: {
  //           base: {
  //             epMod: 1,
  //             casting_mod: 0
  //           }
  //         }
  //     character.player.chooseMetaMagic(character.name);
};

MML.processAttack = async function processAttack(player, character, action) {
  MML.addStatusEffect(character, 'Melee This Round', {
    name: 'Melee This Round'
  });

  var attackType = action.attackType;
  if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].includes(attackType)) {
    return MML.grappleAttackAction(player, character, action);
  } else if (MML.is_dual_wielding(character)) {
    return MML.dualWieldAttackAction(player, character, action);
  } else if (MML.isWieldingMissileWeapon(character)) {
    return MML.missileAttackAction(player, character, action);
  } else if (MML.isWieldingThrowingWeapon(character)) {
    return MML.throwingAttackAction(player, character, action);
  } else {
    return await MML.meleeAttackAction(player, character, action);
  }
};

MML.missileAttackAction = async function missileAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await MML.getSingleTarget(player);
  const attack = await MML.missileAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await MML.missileDefense(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await MML.hitPositionRoll(player, character, target, action);
      const damage = await MML.missileDamageRoll(player, character, target, weapon, attack);
      await MML.damageCharacter(target.player, target, weapon.damageType, hitPosition, damage);
    }
  }
  return MML.endAction(player, character, action, target);
};

MML.meleeAttackAction = async function meleeAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await MML.getSingleTarget(player);
  const attack = await MML.meleeAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await MML.meleeDefenseRoll(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      const hitPosition = await MML.hitPositionRoll(player, character, target, action);
      const damage = await MML.meleeDamageRoll(player, character, weapon, attack);
      await MML.damageCharacter(target.player, target, damage, weapon.damageType, hitPosition);
    }
  }
  return MML.endAction(player, character, action, target);
};

MML.castAction = async function castAction(player, character, action) {
  await MML.spells[action.spell.name](player, character, action);
  return MML.endAction(player, character, action);
};

MML.observeAction = async function observeAction(player, character, action) {
  MML.addStatusEffect(character, 'Observing', {
    id: MML.generateRowID(),
    name: 'Observing',
    startingRound: state.MML.gm.currentRound
  });
  await MML.displayMenu(player, character.name + ' observes the situation.', ['End Action']);
  return MML.endAction(player, character, action);
};

MML.aimAction = async function aimAction(player, character, action) {
  if (!_.has(character.statusEffects, 'Taking Aim')) {
    const target = await MML.getSingleTarget(player);
    MML.addStatusEffect(character, 'Taking Aim', {
      id: MML.generateRowID(),
      name: 'Taking Aim',
      level: 1,
      target: target,
      startingRound: state.MML.gm.currentRound
    });
    await MML.displayMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
    return MML.endAction(player, character, action);
  } else if (character.statusEffects['Taking Aim'].startingRound !== state.MML.gm.currentRound && attackerWeapon.family === 'MWD') {
    const holdAimRoll = await MML.holdAimRoll(player, character, target);
    if (MML.failure(holdAimRoll)) {
      return await MML.missileAttackAction(player, character, action);
    } else {
      if (target.id === character.statusEffects['Taking Aim'].target.id) {
        character.statusEffects['Taking Aim'].level = 2;
      } else {
        character.statusEffects['Taking Aim'].target = target;
        character.statusEffects['Taking Aim'].level = 1;
        character.statusEffects['Taking Aim'].startingRound = state.MML.gm.currentRound;
      }
      await MML.displayMenu(player, character.name + ' aims at ' + target.name, ['End Action']);
      return MML.endAction(player, character, action);
    }
  }
};

MML.reloadAction = async function reloadAction(player, character, action) {
  var weapon = character.inventory[action.weapon._id];
  weapon.loaded++;
  await MML.displayMenu(player, character.name + ' reloads their ' + weapon.name + ' (' + weapon.loaded + '/' + weapon.reload + ')', ['End Action']);
  return MML.endAction(player, character, action);
};

MML.endAction = function endAction(player, character, action, targets) {
  character.spent_initiative = character.spent_initiative +
    character.actionTempo +
    (character.actionInitCostMod > -1 ? -1 : character.actionTempo + character.actionInitCostMod);
  character.previousAction = MML.clone(character.action);
  MML.updateCharacter(character);
  _.each(action.targetArray || [], function (target) {
    MML.updateCharacter(MML.characters[target]);
  });

  if (character.initiative > 0) {
    return MML.prepareAction(player, character);
  } else {
    return player;
  }
};
