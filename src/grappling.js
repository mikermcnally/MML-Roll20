SoS.grappleAttackAction = async function grappleAttackAction(player, character, action) {
  const weapon = action.weapon;
  const target = await SoS.getSingleTarget(player);
  const attack = await SoS.meleeAttackRoll(player, character, weapon.task, action.skill);
  if (['Success', 'Critical Success'].includes(attack)) {
    const defense = await SoS.grappleDefense(target.player, target, weapon);
    if (!['Success', 'Critical Success'].includes(defense)) {
      await SoS.grappleHandler(player, character, target, action);
    }
  }
  return SoS.endAction(player, character, action, target);
};

SoS.releaseOpponentAction = async function releaseOpponentAction(player, character, action) {
  const target = await SoS.getSingleTarget(player);
  if (_.has(character.statusEffects, 'Holding')) {
    SoS.removeHold(character, target);
  }
  const {pressedButton} = await SoS.goToMenu(target.player, 'Allow ' + character.name + ' to release the grapple?', ['Yes', 'No']);
  if (pressedButton === 'Yes') {
    SoS.removeGrapple(character, target);
    action.modifiers = _.without(action.modifiers, 'Release Opponent');
    return SoS.processAction(player, character, action);
  } else {
    await SoS.breakGrapple(character, target);
  }
};

SoS.chooseGrappleDefense = async function chooseGrappleDefense(player, character, brawlMods, attackMods, attackerWeapon) {
  const brawlChance = SoS.sumModifiers(brawlMods);
  const attackChance = SoS.sumModifiers(attackMods);
  const message = 'How will ' + character.name + ' defend?';
  const buttons = ['Brawl: ' + brawlChance + '%', 'Take it'];
  if (!SoS.isUnarmed(character)) {
    buttons.unshift('With Weapon: ' + attackChance + '%');
  }
  const {pressedButton} = await SoS.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'With Weapon: : ' + attackChance + '%':
      SoS.addStatusEffect(character, 'Melee This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        SoS.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return blockMods;
    case 'Brawl: ' + brawlChance + '%':
      SoS.addStatusEffect(character, 'Melee This Round', {});
      if (_.has(character.statusEffects, 'Number of Defenses')) {
        character.statusEffects['Number of Defenses'].number++;
      } else {
        SoS.addStatusEffect(character, 'Number of Defenses', {
          number: 1
        });
      }
      return dodgeMods;
    case 'Take it':
      return 'Failure';
  }
};

SoS.resistRelease = function resistRelease(player, who, attacker) {
  player.who = who;
  player.message = 'Allow ' + attacker.name + ' to release grapple?';

  var buttons = [{
    text: 'Yes',
    nextMenu: 'menuIdle',
    callback: function() {
      state.SoS.GM.currentAction.parameters.targetAgreed = true;
      SoS.releaseOpponentAction();
    }
  }, {
    text: 'No',
    nextMenu: 'menuIdle',
    callback: function() {
      state.SoS.GM.currentAction.parameters.targetAgreed = false;
      SoS.releaseOpponentAction();
    }
  }];
  player.buttons = buttons;
};

SoS.grappleDefense = function grappleDefense(character, attackType) {
  const brawlSkill = _.isUndefined(character.weaponSkills['Brawling']) ? 0 : character.weaponSkills['Brawling'].level;
  const defaultMartialSkill = character.weaponSkills['Default Martial'].level;
  const brawlMods = [
    character.meleeDefenseMod,
    character.attributeDefenseMod,
    attackType.defenseMod,
    character.situationalMod,
    brawlSkill < defaultMartialSkill ? defaultMartialSkill : brawlSkill
  ];

  const defendWithWeapon = !SoS.isUnarmed(character) && _.isEmpty(_.intersection(_.keys(character.statusEffects), [
    'Stunned',
    'Holding',
    'Grappled',
    'Held',
    'Taken Down',
    'Pinned',
    'Overborne'
  ]));
  const characterWeaponInfo = SoS.getWeaponAndSkill(character);
  const weaponMods = [
    characterWeaponInfo.characterWeapon.task,
    characterWeaponInfo.skill,
    character.situationalMod,
    character.meleeAttackMod,
    character.attributeMeleeAttackMod
  ];

  SoS.addStatusEffect(character, 'Melee This Round', {});

};

SoS.grappleHandler = function grappleHandler(character, defender, attackName) {
  switch (attackName) {
    case 'Grapple':
      SoS.applyGrapple(character, defender);
      break;
    case 'Place a Hold, Head, Arm, Leg':
      SoS.applyHold(character, defender);
      break;
    case 'Place a Hold, Chest, Abdomen':
      SoS.applyHold(character, defender);
      break;
    case 'Break a Hold':
      SoS.removeHold(character, defender);
      break;
    case 'Break Grapple':
      SoS.removeGrapple(character, defender);
      break;
    case 'Takedown':
      SoS.applyTakedown(character, defender);
      break;
    case 'Regain Feet':
      SoS.applyRegainFeet(character, defender);
      break;
    default:
      sendChat('Error', 'Unhappy grapple :(');
  }
  SoS.applyStatusEffects(character);
  SoS.applyStatusEffects(defender);
};

SoS.applyGrapple = function applyGrapple(character, defender) {
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : SoS.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(defender.statusEffects, 'Holding')) {
    SoS.removeHold(SoS.characters[defender.statusEffects['Holding'].targets[0]], defender);
  }
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : SoS.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
};

SoS.applyHold = function applyHold(character, defender) {
  if (_.has(character.statusEffects, 'Grappled')) {
    SoS.removeStatusEffect(character, 'Grappled');
  }
  character.statusEffects['Holding'] = {
    id: SoS.generateRowID(),
    name: 'Holding',
    targets: [defender.id],
    bodyPart: state.SoS.GM.currentAction.calledShot
  };
  if (['Chest', 'Abdomen'].indexOf(state.SoS.GM.currentAction.calledShot) > -1 && defender.movementType === 'Prone') {
    defender.statusEffects['Pinned'] = {
      id: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].id : SoS.generateRowID(),
      name: 'Pinned',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([character.id]) : [character.id]
    };
  } else {
    const holder = {
      name: character.id,
      bodyPart: state.SoS.GM.currentAction.calledShot
    };
    defender.statusEffects['Held'] = {
      id: _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].id : SoS.generateRowID(),
      name: 'Held',
      targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([holder]) : [holder]
    };
  }
  if (_.has(defender.statusEffects, 'Grappled')) {
    if (defender.statusEffects['Grappled'].targets.length === 1) {
      SoS.removeStatusEffect(defender, 'Grappled');
    } else {
      defender.statusEffects['Grappled'] = {
        id: defender.statusEffects['Grappled'].id,
        name: 'Grappled',
        targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
      };
    }
  }
};

SoS.removeHold = function removeHold(character, defender) {
  defender.statusEffects['Grappled'] = {
    id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : SoS.generateRowID(),
    name: 'Grappled',
    targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([character.id]) : [character.id]
  };
  SoS.removeStatusEffect(defender, 'Holding');
  character.statusEffects['Grappled'] = {
    id: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].id : SoS.generateRowID(),
    name: 'Grappled',
    targets: _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets.concat([defender.id]) : [defender.id]
  };

  if (_.has(character.statusEffects, 'Held')) {
    if (character.statusEffects['Held'].targets.length === 1) {
      SoS.removeStatusEffect(character, 'Held');
    } else {
      character.statusEffects['Held'] = {
        id: character.statusEffects['Held'].id,
        name: 'Held',
        targets: _.reject(character.statusEffects['Held'].targets, function(target) {
          return target.id === defender.id;
        })
      };
    }
  } else if (_.has(character.statusEffects, 'Pinned')) {
    if (character.statusEffects['Pinned'].targets.length === 1) {
      SoS.removeStatusEffect(character, 'Pinned');
    } else {
      character.statusEffects['Pinned'] = {
        id: character.statusEffects['Pinned'].id,
        name: 'Pinned',
        targets: _.without(character.statusEffects['Pinned'].targets, defender.id)
      };
    }
  }
};

SoS.removeGrapple = function removeGrapple(character, defender) {
  if (character.statusEffects['Grappled'].targets.length === 1) {
    SoS.removeStatusEffect(character, 'Grappled');
  } else {
    character.statusEffects['Grappled'] = {
      id: character.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(character.statusEffects['Grappled'].targets, defender.id)
    };
  }
  if (defender.statusEffects['Grappled'].targets.length === 1) {
    SoS.removeStatusEffect(defender, 'Grappled');
  } else {
    defender.statusEffects['Grappled'] = {
      id: defender.statusEffects['Grappled'].id,
      name: 'Grappled',
      targets: _.without(defender.statusEffects['Grappled'].targets, character.id)
    };
  }
};

SoS.applyTakedown = function applyTakedown(character, defender) {
  const grapplers = _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets : [];
  const holders = _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].targets : [];
  if (grapplers.length + holders.length > 1) {
    defender.statusEffects['Overborne'] = {
      id: SoS.generateRowID(),
      name: 'Overborne'
    };
  } else {
    defender.tatusEffects['Taken Down'] = {
      id: SoS.generateRowID(),
      name: 'Taken Down'
    };
  }
  if (holders.length > 0) {
    const targets = [];
    _.each(holders, function(holder) {
      if (['Chest', 'Abdomen'].indexOf(holder.bodyPart) > -1) {
        targets.push(holder.id);
        holder.movementType('Prone');
      }
    });
    if (targets.length > 0) {
      defender.statusEffects['Pinned'] = {
        id: SoS.generateRowID(),
        name: 'Pinned',
        targets: targets
      };
      if (_.reject(defender.statusEffects['Held'].targets, function(target) {
          return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
        }).length === 0) {
        SoS.removeStatusEffect(defender, 'Held');
      } else {
        defender.statusEffects['Held'] = {
          id: defender.statusEffects['Held'].id,
          name: 'Held',
          targets: _.reject(defender.statusEffects['Held'].targets, function(target) {
            return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
          })
        };
      }
    }
  }
  if (grapplers.length > 0) {
    _.each(defender.statusEffects['Grappled'].targets, function(target) {
      target.movementType = 'Prone';
    });
  }
  defender.movementType = 'Prone';
  character.movementType = 'Prone';
};

SoS.applyRegainFeet = function applyRegainFeet(character, defender) {
  const grapplers = _.has(character.statusEffects, 'Grappled') ? character.statusEffects['Grappled'].targets : [];
  const holders = _.has(character.statusEffects, 'Held') ? character.statusEffects['Held'].targets : [];

  if (holders.length > 0) {
    _.each(holders, function(target) {
      target.movementType = 'Walk';
    });
  }
  if (grapplers.length > 0) {
    _.each(grapplers, function(target) {
      target.movementType = 'Walk';
    });
  }
  SoS.removeStatusEffect(character, 'Taken Down');
  SoS.removeStatusEffect(character, 'Overborne');
  character.movementType = 'Walk';
};
